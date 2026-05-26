import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import { canPublish } from '@/lib/adminSession';
import { listAllEvents, createEvent } from '@/lib/queries/admin/events';
import { slugify, slugSchema, statusSchema } from '@/lib/adminValidation';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  slug: slugSchema.optional(),
  title: z.string().trim().min(1).max(200),
  description_md: z.string().min(1),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime().nullable().optional(),
  location_name: z.string().max(200).nullable().optional(),
  location_address: z.string().max(500).nullable().optional(),
  location_lat: z.number().nullable().optional(),
  location_lng: z.number().nullable().optional(),
  hero_image_url: z.string().url().max(2000).nullable().optional(),
  type: z.enum(['festival', 'class', 'charity', 'youth', 'other']).nullable().optional(),
  status: statusSchema.optional(),
  rsvp_capacity: z.number().int().min(0).nullable().optional(),
  members_only: z.boolean().optional(),
  members_early_access_at: z.string().datetime().nullable().optional(),
  allows_dietary_restrictions: z.boolean().optional(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const events = await listAllEvents();
  return NextResponse.json({ events }, { status: 200 });
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
    const created = await createEvent({ ...data, slug, status });
    return NextResponse.json({ event: created }, { status: 201 });
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 });
    }
    console.error('[admin/events POST] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
