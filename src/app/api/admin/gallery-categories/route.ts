import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import {
  createGalleryCategory,
  listAllGalleryCategories,
} from '@/lib/queries/admin/galleryCategories';
import { slugSchema, slugify } from '@/lib/adminValidation';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  slug: slugSchema.optional(),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  cover_image_url: z.string().url().max(2000).nullable().optional(),
  display_order: z.number().int().optional(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const categories = await listAllGalleryCategories();
  return NextResponse.json({ categories }, { status: 200 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 });
  }
  const data = parsed.data;
  const slug = data.slug ?? slugify(data.title);
  try {
    const category = await createGalleryCategory({ ...data, slug });
    return NextResponse.json({ category }, { status: 201 });
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 });
    }
    console.error('[admin/gallery-categories POST] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
