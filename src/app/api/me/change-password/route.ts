import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import { passwordSchema } from '@/lib/validation';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { query } from '@/lib/db';
import { changeMemberPassword } from '@/lib/queries/account';
import { reportError } from '@/lib/sentry';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  currentPassword: z.string().min(1).max(256),
  newPassword: passwordSchema,
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-change-password', 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { currentPassword, newPassword } = parsed.data;

  try {
    const rows = await query<{ password_hash: string }>(
      `SELECT password_hash FROM members WHERE id = $1 LIMIT 1`,
      [guard.session.sub],
    );
    const hash = rows[0]?.password_hash;
    if (!hash) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }
    const valid = await verifyPassword(currentPassword, hash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Current password is incorrect.' },
        { status: 401 },
      );
    }
    const newHash = await hashPassword(newPassword);
    await changeMemberPassword(guard.session.sub, newHash);
    return NextResponse.json(
      { ok: true, message: 'Password updated.' },
      { status: 200 },
    );
  } catch (err) {
    reportError(err, { route: 'me/change-password' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
