import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { emailSchema } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { syncNewsletterSubscription } from '@/lib/mailchimp';
import { upsertNewsletterSubscriber } from '@/lib/queries/newsletter';

export const dynamic = 'force-dynamic';

const newsletterBodySchema = z.object({
  email: emailSchema,
  source: z.string().trim().max(100).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'newsletter', 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = newsletterBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { email, source } = parsed.data;

  let alreadySubscribed = false;
  try {
    const { inserted } = await upsertNewsletterSubscriber(email, source);
    alreadySubscribed = !inserted;
  } catch (err) {
    console.error('[newsletter] insert failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }

  // Best-effort Mailchimp sync — never fail the request if Mailchimp errors.
  const mailchimp = await syncNewsletterSubscription(email, source);

  return NextResponse.json(
    { ok: true, alreadySubscribed, mailchimp: mailchimp.status },
    { status: 200 },
  );
}
