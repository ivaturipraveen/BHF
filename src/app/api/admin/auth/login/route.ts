import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { emailSchema } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyPassword, signSessionToken } from '@/lib/auth';
import { setAdminCookie, setCsrfCookie } from '@/lib/cookies';
import { verifyTotpCode } from '@/lib/totp';
import { generateCsrfToken } from '@/lib/csrf';
import type { Admin } from '@/types/db';

export const dynamic = 'force-dynamic';

const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  totpCode: z.string().min(4).max(10).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'admin-login', 5, 60_000);
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
  const { email, password, totpCode } = parsed.data;

  try {
    const rows = await query<Admin>(
      `SELECT id, email, password_hash, name, role, totp_secret, totp_enabled,
              last_login_at, created_at, updated_at
         FROM admins WHERE email = $1 LIMIT 1`,
      [email],
    );
    const admin = rows[0];
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 },
      );
    }

    const ok = await verifyPassword(password, admin.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 },
      );
    }

    if (admin.totp_enabled) {
      if (!totpCode) {
        return NextResponse.json({ needsTotp: true }, { status: 200 });
      }
      if (!admin.totp_secret || !verifyTotpCode(admin.totp_secret, totpCode)) {
        return NextResponse.json(
          { error: 'Invalid email or password.' },
          { status: 401 },
        );
      }
    }

    const token = await signSessionToken(
      { sub: admin.id, role: admin.role, email: admin.email },
      '8h',
    );
    await setAdminCookie(token);
    const csrf = generateCsrfToken(admin.id);
    await setCsrfCookie(csrf);

    await query(
      `UPDATE admins SET last_login_at = now() WHERE id = $1`,
      [admin.id],
    );

    return NextResponse.json(
      {
        ok: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
        csrfToken: csrf,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[admin/auth/login] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
