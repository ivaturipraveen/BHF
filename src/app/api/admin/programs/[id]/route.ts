import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import { canDelete, canPublish } from '@/lib/adminSession';
import {
  countActiveEnrollments,
  deleteProgram,
  getProgramById,
  updateProgram,
} from '@/lib/queries/admin/programs';
import { statusSchema, uuidParamSchema } from '@/lib/adminValidation';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  category: z.enum(['cultural', 'educational', 'charitable', 'wellness', 'youth']).optional(),
  frequency: z.enum(['monthly', 'annual', 'rolling']).optional(),
  description_md: z.string().min(1).optional(),
  short_description: z.string().min(1).max(500).optional(),
  who_for: z.string().max(500).nullable().optional(),
  schedule_md: z.string().max(2000).nullable().optional(),
  cost_md: z.string().max(2000).nullable().optional(),
  location: z.string().max(500).nullable().optional(),
  hero_image_url: z.string().url().max(2000).nullable().optional(),
  featured: z.boolean().optional(),
  display_order: z.number().int().optional(),
  status: statusSchema.optional(),
  min_age_years: z.number().int().min(0).max(99).nullable().optional(),
  max_age_years: z.number().int().min(0).max(99).nullable().optional(),
  is_youth: z.boolean().optional(),
});

interface Ctx { params: { id: string } }

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const id = uuidParamSchema.safeParse(params.id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  const program = await getProgramById(id.data);
  if (!program) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ program }, { status: 200 });
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
  if (parsed.data.status === 'published' && !canPublish(session.role)) {
    return NextResponse.json({ error: 'Forbidden: cannot publish.' }, { status: 403 });
  }
  const existing = await getProgramById(id.data);
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const updated = await updateProgram(id.data, parsed.data);
  return NextResponse.json({ program: updated }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const { session } = guard;
  if (!canDelete(session.role)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }
  const id = uuidParamSchema.safeParse(params.id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  const existing = await getProgramById(id.data);
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const activeEnrollments = await countActiveEnrollments(id.data);
  if (activeEnrollments > 0) {
    return NextResponse.json(
      { error: 'Program has active enrollments.', enrollmentCount: activeEnrollments },
      { status: 409 },
    );
  }
  await deleteProgram(id.data);
  return new NextResponse(null, { status: 204 });
}
