import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import { canDelete, canPublish } from '@/lib/adminSession';
import {
  deleteBlogPost,
  getBlogPostById,
  updateBlogPost,
  type BlogPostUpdateInput,
} from '@/lib/queries/admin/blogPosts';
import { statusSchema, uuidParamSchema } from '@/lib/adminValidation';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  excerpt: z.string().trim().min(1).max(500).optional(),
  body_md: z.string().min(1).optional(),
  hero_image_url: z.string().url().max(2000).nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).nullable().optional(),
  featured: z.boolean().optional(),
  status: statusSchema.optional(),
  published_at: z.string().datetime().nullable().optional(),
});

interface Ctx { params: { id: string } }

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const id = uuidParamSchema.safeParse(params.id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  const post = await getBlogPostById(id.data);
  if (!post) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ post }, { status: 200 });
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
  const existing = await getBlogPostById(id.data);
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const updates: BlogPostUpdateInput = { ...parsed.data };
  if (
    parsed.data.status === 'published' &&
    existing.status !== 'published' &&
    !existing.published_at &&
    !parsed.data.published_at
  ) {
    updates.published_at = new Date().toISOString();
  }

  const updated = await updateBlogPost(id.data, updates);
  return NextResponse.json({ post: updated }, { status: 200 });
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
  const existed = await deleteBlogPost(id.data);
  if (!existed) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
