import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import {
  closeContactInquiry,
  getContactInquiryById,
  markContactInquiryContacted,
} from '@/lib/queries/admin/contactInquiries';
import { uuidParamSchema } from '@/lib/adminValidation';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  status: z.enum(['contacted', 'closed']),
});

interface Ctx { params: { id: string } }

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const id = uuidParamSchema.safeParse(params.id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  const inquiry = await getContactInquiryById(id.data);
  if (!inquiry) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ inquiry }, { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const { session } = guard;
  if (session.role === 'contributor') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }
  const id = uuidParamSchema.safeParse(params.id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 });
  }
  const inquiry = parsed.data.status === 'contacted'
    ? await markContactInquiryContacted(id.data, session.sub)
    : await closeContactInquiry(id.data, session.sub);
  if (!inquiry) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ inquiry }, { status: 200 });
}
