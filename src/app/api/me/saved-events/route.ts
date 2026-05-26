import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import { uuidSchema } from '@/lib/validation';
import {
  getEventIdBySlug,
  listSavedEvents,
  saveEvent,
} from '@/lib/queries/account';
import { reportError } from '@/lib/sentry';

export const dynamic = 'force-dynamic';

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Invalid slug');

const bodySchema = z
  .object({
    eventId: uuidSchema.optional(),
    eventSlug: slugSchema.optional(),
  })
  .refine(
    (v) => Boolean(v.eventId) !== Boolean(v.eventSlug),
    'Provide exactly one of eventId or eventSlug',
  );

function serialize(row: {
  id: string;
  event_id: string;
  event_slug: string;
  event_title: string;
  event_starts_at: Date;
  event_hero_image_url: string | null;
  note: string | null;
  created_at: Date;
}) {
  return {
    id: row.id,
    eventId: row.event_id,
    eventSlug: row.event_slug,
    eventTitle: row.event_title,
    eventStartsAt: row.event_starts_at,
    eventHeroImageUrl: row.event_hero_image_url,
    note: row.note,
    createdAt: row.created_at,
  };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-saved-events-get', 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  const upcoming = req.nextUrl.searchParams.get('upcoming') === 'true';

  try {
    const rows = await listSavedEvents(guard.session.sub, upcoming);
    return NextResponse.json(
      { savedEvents: rows.map(serialize) },
      { status: 200 },
    );
  } catch (err) {
    reportError(err, { route: 'me/saved-events/GET' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-saved-events-create', 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    let eventId = parsed.data.eventId ?? null;
    if (!eventId && parsed.data.eventSlug) {
      eventId = await getEventIdBySlug(parsed.data.eventSlug);
    }
    if (!eventId) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }
    const result = await saveEvent(guard.session.sub, eventId);
    return NextResponse.json(
      { saved: result.saved, id: result.id },
      { status: 201 },
    );
  } catch (err) {
    reportError(err, { route: 'me/saved-events/POST' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
