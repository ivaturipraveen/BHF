import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import { canApprove } from '@/lib/adminSession';
import { approvePhotoSubmission } from '@/lib/queries/admin/photoSubmissions';
import { uuidParamSchema } from '@/lib/adminValidation';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({ note: z.string().max(2000).optional() });

interface Ctx { params: { id: string } }

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const { session } = guard;
  if (!canApprove(session.role)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }
  const id = uuidParamSchema.safeParse(params.id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  let raw: unknown = {};
  try { raw = await req.json(); } catch { raw = {}; }
  const parsed = bodySchema.safeParse(raw);
  const note = parsed.success ? parsed.data.note ?? null : null;
  const submission = await approvePhotoSubmission(id.data, session.sub, note);
  if (!submission) {
    return NextResponse.json({ error: 'Not found or already reviewed.' }, { status: 404 });
  }
  return NextResponse.json({ submission }, { status: 200 });
}
