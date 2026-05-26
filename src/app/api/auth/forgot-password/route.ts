import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { emailSchema } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { generateOpaqueToken } from '@/lib/tokens';
import { sendEmail } from '@/lib/email';
import { passwordResetEmail } from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

const forgotBodySchema = z.object({
  email: emailSchema,
});

const GENERIC_OK = {
  ok: true as const,
  message: 'If an account exists for that email, we have sent a reset link.',
};

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'auth-forgot', 5, 60_000);
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
    // Anti-enumeration: still return the generic 200 message.
    return NextResponse.json(GENERIC_OK, { status: 200 });
  }

  const parsed = forgotBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(GENERIC_OK, { status: 200 });
  }
  const { email } = parsed.data;

  try {
    const rows = await query<{ id: string; first_name: string | null }>(
      `SELECT id, first_name FROM members
        WHERE email = $1 AND suspended_at IS NULL LIMIT 1`,
      [email],
    );
    const member = rows[0];
    if (member) {
      const token = generateOpaqueToken(32);
      await query(
        `UPDATE members
            SET password_reset_token = $1,
                password_reset_expires_at = now() + interval '1 hour'
          WHERE id = $2`,
        [token, member.id],
      );
      const resetUrl = `${getSiteUrl()}/reset-password?token=${encodeURIComponent(
        token,
      )}&email=${encodeURIComponent(email)}`;
      const tpl = passwordResetEmail(member.first_name ?? '', resetUrl);
      await sendEmail({
        to: email,
        subject: tpl.subject,
        text: tpl.text,
        html: tpl.html,
        kind: 'reset',
      });
    }
  } catch (err) {
    console.error('[auth/forgot-password] failed', err);
    // Still respond with generic OK — never leak success/failure differentiator.
  }

  return NextResponse.json(GENERIC_OK, { status: 200 });
}
