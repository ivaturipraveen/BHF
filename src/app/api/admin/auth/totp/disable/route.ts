import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import { query } from '@/lib/db';
import { verifyTotpCode } from '@/lib/totp';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({ code: z.string().min(4).max(10) });

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req, { rateLimitMax: 10 });
  if (!guard.ok) return guard.response;
  const { session } = guard;

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid code.' }, { status: 400 });
  }

  try {
    const rows = await query<{ totp_secret: string | null; totp_enabled: boolean }>(
      `SELECT totp_secret, totp_enabled FROM admins WHERE id = $1 LIMIT 1`,
      [session.sub],
    );
    const admin = rows[0];
    if (!admin || !admin.totp_secret) {
      return NextResponse.json({ error: 'TOTP not enabled.' }, { status: 400 });
    }
    if (!verifyTotpCode(admin.totp_secret, parsed.data.code)) {
      return NextResponse.json({ error: 'Invalid code.' }, { status: 400 });
    }
    await query(
      `UPDATE admins SET totp_secret = NULL, totp_pending_secret = NULL, totp_enabled = false WHERE id = $1`,
      [session.sub],
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('[admin/auth/totp/disable] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
