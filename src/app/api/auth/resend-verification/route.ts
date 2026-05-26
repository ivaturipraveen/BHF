import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { emailSchema } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  email: emailSchema,
});

const GENERIC_OK = { ok: true as const };

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'auth-resend-verify', 3, 60_000);
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
    return NextResponse.json(GENERIC_OK, { status: 200 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(GENERIC_OK, { status: 200 });
  }
  const { email } = parsed.data;

  try {
    const rows = await query<{ token: string | null; verified: Date | null }>(
      `SELECT email_verification_token AS token, email_verified_at AS verified
         FROM members
        WHERE email = $1
        LIMIT 1`,
      [email],
    );
    const m = rows[0];
    if (m && m.verified === null && m.token) {
      const url = `${getSiteUrl()}/verify-email?token=${encodeURIComponent(
        m.token,
      )}&email=${encodeURIComponent(email)}`;
      await sendEmail({
        to: email,
        subject: 'Verify your BHF account',
        text: `Please verify your email by visiting:\n${url}`,
        kind: 'verify',
      });
    }
  } catch (err) {
    console.error('[auth/resend-verification] failed', err);
  }

  return NextResponse.json(GENERIC_OK, { status: 200 });
}
