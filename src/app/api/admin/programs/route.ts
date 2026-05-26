import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import { canPublish } from '@/lib/adminSession';
import { createProgram, listAllPrograms } from '@/lib/queries/admin/programs';
import { slugSchema, slugify, statusSchema } from '@/lib/adminValidation';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  slug: slugSchema.optional(),
  title: z.string().trim().min(1).max(200),
  category: z.enum(['cultural', 'educational', 'charitable', 'wellness', 'youth']),
  frequency: z.enum(['monthly', 'annual', 'rolling']),
  description_md: z.string().min(1),
  short_description: z.string().min(1).max(500),
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

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const programs = await listAllPrograms();
  return NextResponse.json({ programs }, { status: 200 });
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
  if (session.role === 'contributor') {
    status = 'draft';
  } else if (status === 'published' && !canPublish(session.role)) {
    status = 'draft';
  }

  try {
    const program = await createProgram({ ...data, slug, status });
    return NextResponse.json({ program }, { status: 201 });
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 });
    }
    console.error('[admin/programs POST] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
