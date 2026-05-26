import { NextResponse, type NextRequest } from 'next/server';
import { adminGuard } from '@/lib/adminGuard';
import { getMemberById } from '@/lib/queries/admin/members';
import { uuidParamSchema } from '@/lib/adminValidation';

export const dynamic = 'force-dynamic';

interface Ctx { params: { id: string } }

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const id = uuidParamSchema.safeParse(params.id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  const member = await getMemberById(id.data);
  if (!member) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  // strip sensitive
  const { password_hash, email_verification_token, password_reset_token, ...safe } = member as any;
  return NextResponse.json({ member: safe }, { status: 200 });
}
