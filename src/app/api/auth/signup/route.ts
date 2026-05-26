import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { emailSchema, passwordSchema, optionalUsPhoneSchema } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { hashPassword } from '@/lib/auth';
import { generateOpaqueToken } from '@/lib/tokens';
import { sendEmail } from '@/lib/email';
import { verifyEmail as verifyEmailTemplate } from '@/lib/email-templates';
import { syncNewsletterSubscription } from '@/lib/mailchimp';
import { upsertNewsletterSubscriber } from '@/lib/queries/newsletter';
import { reportError } from '@/lib/sentry';
import { memberInterestSchema } from '@/types/db';

export const dynamic = 'force-dynamic';

const signupBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: optionalUsPhoneSchema,
  city: z.string().trim().max(120).optional(),
  familySize: z.string().trim().max(40).optional(),
  howHeard: z.string().trim().max(200).optional(),
  interests: z.array(memberInterestSchema).optional(),
  newsletterOptIn: z.boolean().optional(),
  directoryOptIn: z.boolean().optional(),
});

const GENERIC_OK = {
  ok: true as const,
  message: 'Check your email for a verification link.',
};

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'auth-signup', 5, 60_000);
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

  const parsed = signupBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  try {
    const existing = await query<{ id: string }>(
      `SELECT id FROM members WHERE email = $1 LIMIT 1`,
      [data.email],
    );
    if (existing.length > 0) {
      // Anti-enumeration: respond identically when the email is already taken.
      return NextResponse.json(GENERIC_OK, { status: 200 });
    }

    const passwordHash = await hashPassword(data.password);
    const verificationToken = generateOpaqueToken(32);

    await query(
      `INSERT INTO members (
         email, password_hash, first_name, last_name, phone, city, family_size,
         how_heard, interests, newsletter_opt_in, directory_opt_in,
         email_verification_token
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        data.email,
        passwordHash,
        data.firstName,
        data.lastName,
        data.phone ?? null,
        data.city ?? null,
        data.familySize ?? null,
        data.howHeard ?? null,
        data.interests ?? null,
        data.newsletterOptIn ?? false,
        data.directoryOptIn ?? false,
        verificationToken,
      ],
    );

    const verifyUrl = `${getSiteUrl()}/verify-email?token=${encodeURIComponent(
      verificationToken,
    )}&email=${encodeURIComponent(data.email)}`;

    const tpl = verifyEmailTemplate(data.firstName, verifyUrl);
    await sendEmail({
      to: data.email,
      subject: tpl.subject,
      text: tpl.text,
      html: tpl.html,
      kind: 'verify',
    });

    if (data.newsletterOptIn) {
      // Persist locally first so the opt-in is recorded even in stub mode.
      await upsertNewsletterSubscriber(data.email, 'signup');
      // Best-effort newsletter sync on signup. Failures must not block signup.
      await syncNewsletterSubscription(data.email, 'signup');
    }

    return NextResponse.json(GENERIC_OK, { status: 200 });
  } catch (err) {
    reportError(err, { route: 'auth/signup' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
