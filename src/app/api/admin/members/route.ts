import { NextResponse, type NextRequest } from 'next/server';
import { adminGuard } from '@/lib/adminGuard';
import {
  exportMembersCsv,
  listAllMembers,
} from '@/lib/queries/admin/members';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const wantsCsv = url.searchParams.get('format') === 'csv';
  if (wantsCsv) {
    const csv = await exportMembersCsv();
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="members.csv"',
      },
    });
  }
  const limit = Number(url.searchParams.get('limit') ?? '50');
  const offset = Number(url.searchParams.get('offset') ?? '0');
  const search = url.searchParams.get('search') ?? undefined;
  const members = await listAllMembers({ limit, offset, search });
  return NextResponse.json({ members }, { status: 200 });
}
