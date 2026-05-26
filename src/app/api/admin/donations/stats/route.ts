import { NextResponse, type NextRequest } from 'next/server';
import { adminGuard } from '@/lib/adminGuard';
import { getDonationStats } from '@/lib/queries/admin/donations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const includeStub = url.searchParams.get('includeStub') === 'true';
  const stats = await getDonationStats({ includeStub });
  return NextResponse.json({ stats }, { status: 200 });
}
