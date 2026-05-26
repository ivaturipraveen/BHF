import { NextResponse, type NextRequest } from 'next/server';
import { adminGuard } from '@/lib/adminGuard';
import { listAllContactInquiries } from '@/lib/queries/admin/contactInquiries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const status = url.searchParams.get('status') ?? undefined;
  const inquiries = await listAllContactInquiries(status);
  return NextResponse.json({ inquiries }, { status: 200 });
}
