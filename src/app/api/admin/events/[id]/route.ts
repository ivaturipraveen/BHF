import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminGuard } from '@/lib/adminGuard';
import { canPublish, canDelete } from '@/lib/adminSession';
import {
  countRsvpsForEvent,
  deleteEvent,
  getEventById,
  updateEvent,
} from '@/lib/queries/admin/events';
import { statusSchema, uuidParamSchema } from '@/lib/adminValidation';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description_md: z.string().min(1).optional(),
  starts_at: z.string().datetime().optional(),
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

interface Ctx {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const id = uuidParamSchema.safeParse(params.id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  const event = await getEventById(id.data);
  if (!event) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ event }, { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const guard = await adminGuard(req);
  if (!guard.ok) return guard.response;
  const { session } = guard;
  const id = uuidParamSchema.safeParse(params.id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  if (session.role === 'contributor') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 });
  }
  const data = parsed.data;

  if (data.status && data.status === 'published' && !canPublish(session.role)) {
    return NextResponse.json({ error: 'Forbidden: cannot publish.' }, { status: 403 });
  }

  const existing = await getEventById(id.data);
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const updates: Record<string, unknown> = { ...data };
  if (
    data.status === 'published' &&
    existing.status !== 'published'
  ) {
    // first publish — set published_at via starts_at? events table has no published_at column.
    // No-op for events.
  }

  const updated = await updateEvent(id.data, updates);
  return NextResponse.json({ event: updated }, { status: 200 });
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
  const existing = await getEventById(id.data);
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const rsvps = await countRsvpsForEvent(id.data);
  if (rsvps > 0) {
    return NextResponse.json(
      {
        error: 'Event has RSVPs; archive it instead.',
        rsvpCount: rsvps,
      },
      { status: 409 },
    );
  }
  await deleteEvent(id.data);
  return new NextResponse(null, { status: 204 });
}
