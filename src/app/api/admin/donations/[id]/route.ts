import { NextResponse, type NextRequest } from 'next/server';
import { adminGuard } from '@/lib/adminGuard';
import { getDonationById } from '@/lib/queries/admin/donations';
import { uuidParamSchema } from '@/lib/adminValidation';

export const dynamic = 'force-dynamic';

interface Ctx { params: { id: string } }

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const id = uuidParamSchema.safeParse(params.id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  const donation = await getDonationById(id.data);
  if (!donation) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ donation }, { status: 200 });
}
