import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import {
  createGalleryPhoto,
  listGalleryPhotos,
} from '@/lib/queries/admin/galleryPhotos';
import { uuidParamSchema } from '@/lib/adminValidation';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  file_url: z.string().url().max(2000),
  thumb_url: z.string().url().max(2000).nullable().optional(),
  caption: z.string().max(500).nullable().optional(),
  photographer_credit: z.string().max(200).nullable().optional(),
  taken_at: z.string().nullable().optional(),
  display_order: z.number().int().optional(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const categoryId = url.searchParams.get('category_id');
  if (categoryId) {
    const cat = uuidParamSchema.safeParse(categoryId);
    if (!cat.success) return NextResponse.json({ error: 'Invalid category_id.' }, { status: 400 });
    const photos = await listGalleryPhotos(cat.data);
    return NextResponse.json({ photos }, { status: 200 });
  }
  const photos = await listGalleryPhotos();
  return NextResponse.json({ photos }, { status: 200 });
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
  const photo = await createGalleryPhoto({
    category_id: parsed.data.category_id ?? null,
    file_url: parsed.data.file_url,
    thumb_url: parsed.data.thumb_url ?? null,
    caption: parsed.data.caption ?? null,
    photographer_credit: parsed.data.photographer_credit ?? null,
    taken_at: parsed.data.taken_at ?? null,
    display_order: parsed.data.display_order ?? 0,
  });
  return NextResponse.json({ photo }, { status: 201 });
}
