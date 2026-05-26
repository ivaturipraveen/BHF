import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { emailSchema } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyPassword, signSessionToken } from '@/lib/auth';
import { setSessionCookie } from '@/lib/cookies';
import { reportError } from '@/lib/sentry';
import type { Member } from '@/types/db';

export const dynamic = 'force-dynamic';

const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'auth-login', 5, 60_000);
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

  const parsed = loginBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 },
    );
  }
  const { email, password } = parsed.data;

  try {
    const rows = await query<Member>(
      `SELECT id, email, password_hash, first_name, last_name,
              email_verified_at, suspended_at
         FROM members WHERE email = $1 LIMIT 1`,
      [email],
    );
    const member = rows[0];
    if (!member) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 },
      );
    }

    const ok = await verifyPassword(password, member.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 },
      );
    }

    if (member.suspended_at) {
      return NextResponse.json(
        { error: 'Account suspended.' },
        { status: 403 },
      );
    }

    if (!member.email_verified_at) {
      return NextResponse.json(
        {
          error:
            'Please verify your email first. Check your inbox for the verification link.',
          verifyResendUrl: '/api/auth/resend-verification',
        },
        { status: 403 },
      );
    }

    const token = await signSessionToken(
      { sub: member.id, role: 'member', email: member.email },
      '7d',
    );
    await setSessionCookie(token);

    return NextResponse.json(
      {
        ok: true,
        member: {
          id: member.id,
          email: member.email,
          firstName: member.first_name,
          lastName: member.last_name,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    reportError(err, { route: 'auth/login' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
