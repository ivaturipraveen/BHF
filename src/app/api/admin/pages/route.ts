import { NextResponse, type NextRequest } from 'next/server';
import { adminGuard } from '@/lib/adminGuard';
import { listAllPages } from '@/lib/queries/admin/pages';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const pages = await listAllPages();
  return NextResponse.json({ pages }, { status: 200 });
}
