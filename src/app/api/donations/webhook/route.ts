import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { STRIPE_ENABLED, requireStripe } from '@/lib/stripe';
import {
  getDonationByStripeSession,
  getLatestDonationBySubscription,
  markDonationSucceeded,
  markDonationFailed,
  cloneRecurringDonation,
  markSubscriptionCanceled,
  hasProcessedEvent,
  recordProcessedEvent,
  markReceiptSent,
} from '@/lib/queries/donations';
import { buildReceiptText, buildReceiptHtml } from '@/lib/receipts';
import { sendEmail } from '@/lib/email';
import { donationReceiptEmail } from '@/lib/email-templates';
import { reportError } from '@/lib/sentry';
import type { Donation } from '@/types/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function formatDollars(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

function donationTypeLabel(type: Donation['type']): string {
  if (type === 'monthly') return 'monthly gift';
  if (type === 'yearly') return 'yearly gift';
  return 'one-time gift';
}

async function sendReceipt(donation: Donation): Promise<void> {
  const payload = {
    donorName: donation.donor_name,
    amountCents: donation.amount_cents,
    type: donation.type,
    dateIso: new Date(donation.created_at).toISOString(),
    donationId: donation.id,
    address: donation.donor_address,
    inHonorOf: donation.in_honor_of,
  };
  const receiptText = buildReceiptText(payload);
  const receiptHtml = buildReceiptHtml(payload);
  const tpl = donationReceiptEmail(
    donation.donor_name,
    formatDollars(donation.amount_cents),
    donationTypeLabel(donation.type),
    receiptHtml,
  );
  const text = `${tpl.text}\n\n----\n${receiptText}`;
  await sendEmail({
    to: donation.donor_email,
    subject: tpl.subject,
    text,
    html: tpl.html,
    kind: 'donation_receipt',
  });
  await markReceiptSent(donation.id, null);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!STRIPE_ENABLED) {
    return NextResponse.json(
      { received: true, mode: 'stub', note: 'stub mode — webhook ignored' },
      { status: 200 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook secret not configured.' },
      { status: 401 },
    );
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json(
      { error: 'Missing signature.' },
      { status: 401 },
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = requireStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    reportError(err, { route: 'donations/webhook', step: 'signature' });
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  if (await hasProcessedEvent(event.id)) {
    return NextResponse.json({ received: true, deduped: true }, { status: 200 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const donation = await getDonationByStripeSession(session.id);
        if (donation) {
          const paymentIntentId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id ?? null;
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription?.id ?? null;
          const updated = await markDonationSucceeded(
            donation.id,
            paymentIntentId,
            subscriptionId,
          );
          await sendReceipt(updated);
        }
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | { id: string } | null;
          payment_intent?: string | { id: string } | null;
          billing_reason?: string;
        };
        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id ?? null;
        if (subscriptionId) {
          const template = await getLatestDonationBySubscription(subscriptionId);
          if (template) {
            const billingReason = invoice.billing_reason ?? '';
            if (
              billingReason === 'subscription_create' ||
              billingReason === 'subscription_update'
            ) {
              // Initial invoice — covered by checkout.session.completed; skip.
              break;
            }
            const paymentIntentId =
              typeof invoice.payment_intent === 'string'
                ? invoice.payment_intent
                : invoice.payment_intent?.id ?? null;
            const clone = await cloneRecurringDonation({
              templateDonationId: template.id,
              amountCents: invoice.amount_paid ?? template.amount_cents,
              stripeSubscriptionId: subscriptionId,
              stripePaymentIntentId: paymentIntentId,
            });
            if (clone) {
              await sendReceipt(clone);
            }
          }
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | { id: string } | null;
        };
        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id ?? null;
        if (subscriptionId) {
          const template = await getLatestDonationBySubscription(subscriptionId);
          if (template) {
            await markDonationFailed(template.id);
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await markSubscriptionCanceled(sub.id);
        break;
      }
      default:
        break;
    }

    await recordProcessedEvent(event.id);
  } catch (err) {
    reportError(err, { route: 'donations/webhook', eventId: event.id });
    return NextResponse.json({ error: 'Handler failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
