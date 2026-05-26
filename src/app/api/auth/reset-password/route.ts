import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { withTransaction } from '@/lib/db';
import { emailSchema, passwordSchema } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const resetBodySchema = z.object({
  email: emailSchema,
  token: z.string().min(8).max(512),
  password: passwordSchema,
});

const INVALID = { error: 'Invalid or expired reset link.' };

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'auth-reset', 5, 60_000);
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

  const parsed = resetBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { email, token, password } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);

    const updated = await withTransaction(async (client) => {
      const found = await client.query<{ id: string }>(
        `SELECT id FROM members
          WHERE email = $1
            AND password_reset_token = $2
            AND password_reset_expires_at IS NOT NULL
            AND password_reset_expires_at > now()
          LIMIT 1`,
        [email, token],
      );
      if (found.rows.length === 0) {
        return false;
      }
      await client.query(
        `UPDATE members
            SET password_hash = $1,
                password_reset_token = NULL,
                password_reset_expires_at = NULL
          WHERE id = $2`,
        [passwordHash, found.rows[0].id],
      );
      return true;
    });

    if (!updated) {
      return NextResponse.json(INVALID, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: 'Password updated. Please sign in.' },
      { status: 200 },
    );
  } catch (err) {
    console.error('[auth/reset-password] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
