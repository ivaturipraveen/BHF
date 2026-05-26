import { NextResponse, type NextRequest } from 'next/server';
import { adminGuard } from '@/lib/adminGuard';
import { listRecentEmails } from '@/lib/queries/admin/emailLog';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req, { roles: ['super_admin'] });
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get('limit') ?? '100');
  const emails = await listRecentEmails(limit);
  return NextResponse.json({ emails }, { status: 200 });
}
