import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import { canDelete } from '@/lib/adminSession';
import {
  countPhotosInCategory,
  deleteGalleryCategory,
  getGalleryCategoryById,
  updateGalleryCategory,
} from '@/lib/queries/admin/galleryCategories';
import { slugSchema, uuidParamSchema } from '@/lib/adminValidation';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  slug: slugSchema.optional(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  cover_image_url: z.string().url().max(2000).nullable().optional(),
  display_order: z.number().int().optional(),
});

interface Ctx { params: { id: string } }

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const id = uuidParamSchema.safeParse(params.id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  const category = await getGalleryCategoryById(id.data);
  if (!category) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ category }, { status: 200 });
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
  const updated = await updateGalleryCategory(id.data, parsed.data);
  if (!updated) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ category: updated }, { status: 200 });
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
  const existing = await getGalleryCategoryById(id.data);
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const photos = await countPhotosInCategory(id.data);
  if (photos > 0) {
    return NextResponse.json(
      { error: 'Category contains photos.', photoCount: photos },
      { status: 409 },
    );
  }
  await deleteGalleryCategory(id.data);
  return new NextResponse(null, { status: 204 });
}
