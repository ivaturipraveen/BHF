import { NextResponse, type NextRequest } from 'next/server';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { emailSchema } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { getSessionFromCookies } from '@/lib/auth';
import { STRIPE_ENABLED, requireStripe } from '@/lib/stripe';
import {
  createPendingDonation,
  updateDonationStripeSession,
  markDonationSucceeded,
  donationAccessToken,
} from '@/lib/queries/donations';
import { buildReceiptText, buildReceiptHtml } from '@/lib/receipts';
import { sendEmail } from '@/lib/email';
import { donationReceiptEmail } from '@/lib/email-templates';
import { reportError } from '@/lib/sentry';

export const dynamic = 'force-dynamic';

const MIN_AMOUNT_CENTS = 100;
const MAX_AMOUNT_CENTS = 1_000_000_00;

const metadataSchema = z
  .record(z.string(), z.string().max(500))
  .refine((obj) => Object.keys(obj).every((k) => k.length <= 80), {
    message: 'Metadata keys must be ≤80 chars',
  })
  .refine((obj) => Object.keys(obj).length <= 5, {
    message: 'Metadata limited to 5 keys',
  })
  .optional();

const checkoutBodySchema = z.object({
  amountCents: z
    .number()
    .int()
    .min(MIN_AMOUNT_CENTS)
    .max(MAX_AMOUNT_CENTS),
  type: z.enum(['one_time', 'monthly', 'yearly']),
  donorName: z.string().trim().min(1).max(200),
  donorEmail: emailSchema,
  donorAddress: z.string().trim().max(500).optional(),
  inHonorOf: z.string().trim().max(200).optional(),
  metadata: metadataSchema,
});

function getSiteUrl(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const proto =
    req.headers.get('x-forwarded-proto') ??
    (req.nextUrl.protocol === 'https:' ? 'https' : 'http');
  const host = req.headers.get('host') ?? req.nextUrl.host;
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = checkoutBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const body = parsed.data;

  const rlKey = `donations-checkout:${body.donorEmail}`;
  const limited = rateLimit(ip, rlKey, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  let memberId: string | null = null;
  try {
    const session = await getSessionFromCookies();
    if (session && session.role === 'member') {
      memberId = session.sub;
    }
  } catch {
    memberId = null;
  }

  const idempotencyKey = randomBytes(24).toString('base64url');

  let donationId: string;
  try {
    const donation = await createPendingDonation({
      amountCents: body.amountCents,
      type: body.type,
      donorName: body.donorName,
      donorEmail: body.donorEmail,
      donorAddress: body.donorAddress ?? null,
      inHonorOf: body.inHonorOf ?? null,
      memberId,
      idempotencyKey,
      metadata: body.metadata ?? null,
      mode: STRIPE_ENABLED ? 'live' : 'stub',
    });
    donationId = donation.id;
  } catch (err) {
    reportError(err, { route: 'donations/checkout', step: 'create' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }

  if (!STRIPE_ENABLED) {
    try {
      const succeeded = await markDonationSucceeded(donationId);
      const token = donationAccessToken(donationId);
      const receiptPayload = {
        donorName: succeeded.donor_name,
        amountCents: succeeded.amount_cents,
        type: succeeded.type,
        dateIso: new Date(succeeded.created_at).toISOString(),
        donationId: succeeded.id,
        address: succeeded.donor_address,
        inHonorOf: succeeded.in_honor_of,
      };
      const receiptText = buildReceiptText(receiptPayload);
      const receiptHtml = buildReceiptHtml(receiptPayload);
      const dollars = (succeeded.amount_cents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
      const typeLabel =
        succeeded.type === 'monthly'
          ? 'monthly gift'
          : succeeded.type === 'yearly'
            ? 'yearly gift'
            : 'one-time gift';
      const tpl = donationReceiptEmail(
        succeeded.donor_name,
        dollars,
        typeLabel,
        receiptHtml,
      );
      await sendEmail({
        to: succeeded.donor_email,
        subject: tpl.subject,
        text: `${tpl.text}\n\n----\n${receiptText}`,
        html: tpl.html,
        kind: 'donation_receipt',
      });
      return NextResponse.json(
        {
          mode: 'stub',
          donationId,
          successUrl: `/donate/thank-you?id=${donationId}&token=${token}&demo=1`,
        },
        { status: 200 },
      );
    } catch (err) {
      reportError(err, { route: 'donations/checkout', mode: 'stub' });
      return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
  }

  try {
    const stripe = requireStripe();
    const siteUrl = getSiteUrl(req);
    const successToken = donationAccessToken(donationId);

    const sessionParams = {
      mode: (body.type === 'one_time' ? 'payment' : 'subscription') as
        | 'payment'
        | 'subscription',
      customer_email: body.donorEmail,
      success_url: `${siteUrl}/donate/thank-you?session_id={CHECKOUT_SESSION_ID}&token=${successToken}`,
      cancel_url: `${siteUrl}/donate?canceled=1`,
      client_reference_id: donationId,
      metadata: {
        donation_id: donationId,
        donor_name: body.donorName,
        in_honor_of: body.inHonorOf ?? '',
        member_id: memberId ?? '',
        type: body.type,
      } as Record<string, string>,
      line_items:
        body.type === 'one_time'
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: 'usd',
                  unit_amount: body.amountCents,
                  product_data: { name: 'BHF donation' },
                },
              },
            ]
          : [
              {
                quantity: 1,
                price_data: {
                  currency: 'usd',
                  unit_amount: body.amountCents,
                  product_data: { name: 'BHF donation' },
                  recurring: {
                    interval: (body.type === 'monthly' ? 'month' : 'year') as
                      | 'month'
                      | 'year',
                  },
                },
              },
            ],
    };

    const stripeSession = await stripe.checkout.sessions.create(
      sessionParams as unknown as Parameters<
        typeof stripe.checkout.sessions.create
      >[0],
      { idempotencyKey },
    );

    await updateDonationStripeSession(donationId, stripeSession.id);

    return NextResponse.json(
      {
        mode: 'live',
        donationId,
        sessionId: stripeSession.id,
        sessionUrl: stripeSession.url,
      },
      { status: 200 },
    );
  } catch (err) {
    reportError(err, { route: 'donations/checkout', step: 'stripe' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
