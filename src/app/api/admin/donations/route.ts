import { NextResponse, type NextRequest } from 'next/server';
import { adminGuard } from '@/lib/adminGuard';
import { listAllDonations } from '@/lib/queries/admin/donations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get('limit') ?? '50');
  const offset = Number(url.searchParams.get('offset') ?? '0');
  const status = url.searchParams.get('status') ?? undefined;
  const includeStub = url.searchParams.get('includeStub') === 'true';
  const donations = await listAllDonations({ limit, offset, status, includeStub });
  return NextResponse.json({ donations }, { status: 200 });
}
