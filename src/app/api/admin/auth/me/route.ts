import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSessionFromCookies } from '@/lib/adminSession';
import type { Admin } from '@/types/db';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  const rows = await query<Admin>(
    `SELECT id, email, name, role, totp_enabled, last_login_at, created_at, updated_at
       FROM admins WHERE id = $1 LIMIT 1`,
    [session.sub],
  );
  const admin = rows[0];
  if (!admin) {
    return NextResponse.json({ error: 'Admin not found.' }, { status: 401 });
  }
  return NextResponse.json(
    {
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        totpEnabled: admin.totp_enabled,
        lastLoginAt: admin.last_login_at,
        createdAt: admin.created_at,
        updatedAt: admin.updated_at,
      },
    },
    { status: 200 },
  );
}
