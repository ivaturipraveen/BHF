import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import { query } from '@/lib/db';
import { generateTotpSecret, generateQrCodeDataUrl, verifyTotpCode } from '@/lib/totp';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({ code: z.string().min(4).max(10).optional() }).optional();

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req, { rateLimitMax: 10 });
  if (!guard.ok) return guard.response;
  const { session } = guard;

  let raw: unknown = undefined;
  try {
    const text = await req.text();
    if (text.length > 0) {
      raw = JSON.parse(text);
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const submittedCode = parsed.data?.code;

  try {
    const rows = await query<{ totp_secret: string | null; totp_enabled: boolean }>(
      `SELECT totp_secret, totp_enabled FROM admins WHERE id = $1 LIMIT 1`,
      [session.sub],
    );
    const admin = rows[0];
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });
    }

    const { secret, otpauthUrl } = generateTotpSecret(session.email);

    if (admin.totp_enabled && admin.totp_secret) {
      if (!submittedCode || !verifyTotpCode(admin.totp_secret, submittedCode)) {
        return NextResponse.json(
          { error: 'A valid current TOTP code is required to re-generate.' },
          { status: 401 },
        );
      }
      await query(
        `UPDATE admins SET totp_pending_secret = $1 WHERE id = $2`,
        [secret, session.sub],
      );
    } else {
      await query(
        `UPDATE admins SET totp_secret = $1, totp_enabled = false, totp_pending_secret = NULL WHERE id = $2`,
        [secret, session.sub],
      );
    }

    const qrCodeDataUrl = await generateQrCodeDataUrl(otpauthUrl);
    return NextResponse.json(
      { otpauthUrl, qrCodeDataUrl },
      { status: 200 },
    );
  } catch (err) {
    console.error('[admin/auth/totp/setup] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
