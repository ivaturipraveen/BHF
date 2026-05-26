import { NextResponse, type NextRequest } from 'next/server';
import { adminGuard } from '@/lib/adminGuard';
import {
  listAllPhotoSubmissions,
  listPendingPhotoSubmissions,
} from '@/lib/queries/admin/photoSubmissions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  if (status === 'pending' || !status) {
    const submissions = status ? await listAllPhotoSubmissions(status) : await listPendingPhotoSubmissions();
    return NextResponse.json({ submissions }, { status: 200 });
  }
  const submissions = await listAllPhotoSubmissions(status);
  return NextResponse.json({ submissions }, { status: 200 });
}
