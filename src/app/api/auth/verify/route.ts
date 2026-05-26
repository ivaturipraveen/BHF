import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { emailSchema } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { welcomeEmail } from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

const tokenSchema = z.string().min(8).max(512);

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'auth-verify', 30, 60_000);
  if (!limited.ok) {
    return NextResponse.redirect(
      new URL('/login?verifyError=ratelimit', getSiteUrl()),
      302,
    );
  }

  const url = new URL(req.url);
  const token = url.searchParams.get('token') ?? '';
  const emailRaw = url.searchParams.get('email') ?? '';

  const tokenParsed = tokenSchema.safeParse(token);
  const emailParsed = emailSchema.safeParse(emailRaw);

  const failureUrl = new URL('/login?verifyError=1', getSiteUrl());
  if (!tokenParsed.success || !emailParsed.success) {
    return NextResponse.redirect(failureUrl, 302);
  }
  const email = emailParsed.data;
  const verifiedToken = tokenParsed.data;

  try {
    const rows = await query<{
      id: string;
      first_name: string | null;
      email_verified_at: Date | null;
    }>(
      `SELECT id, first_name, email_verified_at FROM members
        WHERE email = $1 AND email_verification_token = $2
        LIMIT 1`,
      [email, verifiedToken],
    );
    const member = rows[0];
    if (!member || member.email_verified_at !== null) {
      return NextResponse.redirect(failureUrl, 302);
    }

    await query(
      `UPDATE members
          SET email_verified_at = now(), email_verification_token = NULL
        WHERE id = $1`,
      [member.id],
    );

    const tpl = welcomeEmail(member.first_name ?? '');
    await sendEmail({
      to: email,
      subject: tpl.subject,
      text: tpl.text,
      html: tpl.html,
      kind: 'welcome',
    });

    return NextResponse.redirect(new URL('/login?verified=1', getSiteUrl()), 302);
  } catch (err) {
    console.error('[auth/verify] failed', err);
    return NextResponse.redirect(failureUrl, 302);
  }
}
