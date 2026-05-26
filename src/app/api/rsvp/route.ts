import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { withTransaction, query } from '@/lib/db';
import { emailSchema } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { getSessionFromCookies } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { rsvpConfirmationEmail } from '@/lib/email-templates';
import type { Event } from '@/types/db';

export const dynamic = 'force-dynamic';

const rsvpBodySchema = z.object({
  eventSlug: z.string().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  email: emailSchema,
  partySize: z.number().int().min(1).max(10),
  dietaryRestrictions: z.string().max(2000).optional(),
});

class RsvpError extends Error {
  constructor(public status: number, public payload: Record<string, unknown>) {
    super(typeof payload.error === 'string' ? payload.error : 'rsvp error');
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'rsvp', 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = rsvpBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { eventSlug, name, email, partySize, dietaryRestrictions } = parsed.data;

  let session: { sub: string } | null = null;
  try {
    session = await getSessionFromCookies();
  } catch {
    session = null;
  }

  let eventRows: Event[];
  try {
    eventRows = await query<Event>(
      `SELECT id, slug, title, starts_at, status, rsvp_capacity, members_only,
              members_early_access_at, location_name, location_address
         FROM events
        WHERE slug = $1
        LIMIT 1`,
      [eventSlug],
    );
  } catch (err) {
    console.error('[rsvp] event lookup failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
  const event = eventRows[0];
  if (!event) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  }
  if (event.status !== 'published') {
    return NextResponse.json({ error: 'Event is not open for RSVPs.' }, { status: 404 });
  }
  if (new Date(event.starts_at).getTime() <= Date.now()) {
    return NextResponse.json(
      { error: 'This event has already started or ended.' },
      { status: 400 },
    );
  }

  if (event.members_only && !session) {
    return NextResponse.json(
      { error: 'This is a members-only event. Please sign in to RSVP.' },
      { status: 401 },
    );
  }

  // members_early_access_at: timestamp when PUBLIC RSVP opens. Until that moment, only
  // logged-in members can RSVP. Set this in the FUTURE to gate public RSVP; leave NULL
  // to allow public RSVP from publication.
  if (
    event.members_early_access_at &&
    new Date(event.members_early_access_at).getTime() > Date.now() &&
    !session
  ) {
    return NextResponse.json(
      { error: 'Members get early access. Sign in to RSVP.' },
      { status: 403 },
    );
  }

  let insertedSpotsLeft: number | null = null;
  try {
    insertedSpotsLeft = await withTransaction(async (client) => {
      const eventLock = await client.query<{ id: string; rsvp_capacity: number | null }>(
        `SELECT id, rsvp_capacity FROM events WHERE id = $1 FOR UPDATE`,
        [event.id],
      );
      const locked = eventLock.rows[0];
      if (!locked) {
        throw new RsvpError(404, { error: 'Event not found.' });
      }

      const capacity = locked.rsvp_capacity;

      if (capacity !== null && capacity !== undefined) {
        const countRes = await client.query<{ total: number }>(
          `SELECT COALESCE(SUM(party_size), 0)::int AS total
             FROM rsvps WHERE event_id = $1`,
          [locked.id],
        );
        const total = Number(countRes.rows[0]?.total ?? 0);
        if (total + partySize > capacity) {
          throw new RsvpError(409, { error: 'Event is full.' });
        }
      }

      await client.query(
        `INSERT INTO rsvps (event_id, member_id, name, email, party_size, dietary_restrictions)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          locked.id,
          session?.sub ?? null,
          name,
          email,
          partySize,
          dietaryRestrictions && dietaryRestrictions.trim() !== '' ? dietaryRestrictions : null,
        ],
      );

      if (capacity !== null && capacity !== undefined) {
        const after = await client.query<{ total: number }>(
          `SELECT COALESCE(SUM(party_size), 0)::int AS total
             FROM rsvps WHERE event_id = $1`,
          [locked.id],
        );
        const total = Number(after.rows[0]?.total ?? 0);
        return Math.max(0, capacity - total);
      }
      return null;
    });
  } catch (err: unknown) {
    if (err instanceof RsvpError) {
      return NextResponse.json(err.payload, { status: err.status });
    }
    const code = (err as { code?: string } | null)?.code;
    if (code === '23505') {
      return NextResponse.json(
        { error: 'You have already RSVPed for this event.' },
        { status: 409 },
      );
    }
    console.error('[rsvp] insert failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }

  try {
    const tpl = rsvpConfirmationEmail(
      name,
      {
        title: event.title,
        startsAt: event.starts_at,
        location: event.location_name || event.location_address || null,
      },
      partySize,
    );
    await sendEmail({
      to: email,
      subject: tpl.subject,
      text: tpl.text,
      html: tpl.html,
      kind: 'rsvp_confirmation',
    });
  } catch (err) {
    // Best-effort — never fail the RSVP if confirmation send hiccups.
    console.error('[rsvp] confirmation send failed', err);
  }

  return NextResponse.json(
    {
      eventTitle: event.title,
      eventDate: event.starts_at,
      partySize,
      total_spots_left: insertedSpotsLeft,
    },
    { status: 201 },
  );
}
