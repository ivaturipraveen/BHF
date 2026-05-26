import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import { canPublish } from '@/lib/adminSession';
import {
  createBlogPost,
  listAllBlogPosts,
} from '@/lib/queries/admin/blogPosts';
import { slugSchema, slugify, statusSchema } from '@/lib/adminValidation';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  slug: slugSchema.optional(),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().min(1).max(500),
  body_md: z.string().min(1),
  hero_image_url: z.string().url().max(2000).nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).nullable().optional(),
  featured: z.boolean().optional(),
  status: statusSchema.optional(),
  published_at: z.string().datetime().nullable().optional(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const posts = await listAllBlogPosts();
  return NextResponse.json({ posts }, { status: 200 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const { session } = guard;

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
  let status = data.status ?? 'draft';
  let publishedAt = data.published_at ?? null;
  if (session.role === 'contributor') {
    status = 'draft';
    publishedAt = null;
  } else if (status === 'published') {
    if (!canPublish(session.role)) {
      status = 'draft';
      publishedAt = null;
    } else if (!publishedAt) {
      publishedAt = new Date().toISOString();
    }
  }
  try {
    const post = await createBlogPost({
      ...data,
      slug,
      status,
      published_at: publishedAt,
      author_id: session.sub,
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 });
    }
    console.error('[admin/blog-posts POST] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
