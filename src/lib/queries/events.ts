import 'server-only';
import { query } from '@/lib/db';
import type { Event } from '@/types/db';

const EVENT_COLUMNS = `
  id, slug, title, description_md, starts_at, ends_at, location_name, location_address,
  location_lat, location_lng, hero_image_url, type, status, rsvp_capacity, members_only,
  members_early_access_at, allows_dietary_restrictions, created_at, updated_at
`;

export async function listUpcomingEvents(limit?: number): Promise<Event[]> {
  if (limit !== undefined) {
    return query<Event>(
      `SELECT ${EVENT_COLUMNS} FROM events
        WHERE status = 'published' AND starts_at >= now()
        ORDER BY starts_at ASC
        LIMIT $1`,
      [limit],
    );
  }
  return query<Event>(
    `SELECT ${EVENT_COLUMNS} FROM events
      WHERE status = 'published' AND starts_at >= now()
      ORDER BY starts_at ASC`,
  );
}

export async function listPastEvents(limit?: number): Promise<Event[]> {
  if (limit !== undefined) {
    return query<Event>(
      `SELECT ${EVENT_COLUMNS} FROM events
        WHERE status = 'published' AND starts_at < now()
        ORDER BY starts_at DESC
        LIMIT $1`,
      [limit],
    );
  }
  return query<Event>(
    `SELECT ${EVENT_COLUMNS} FROM events
      WHERE status = 'published' AND starts_at < now()
      ORDER BY starts_at DESC`,
  );
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const rows = await query<Event>(
    `SELECT ${EVENT_COLUMNS} FROM events WHERE slug = $1 LIMIT 1`,
    [slug],
  );
  return rows[0] ?? null;
}

export interface RsvpCounts {
  total: number;
  capacity: number | null;
  spotsLeft: number | null;
}

export async function countRsvps(eventId: string): Promise<RsvpCounts> {
  const rows = await query<{ total: string; capacity: number | null }>(
    `SELECT
       COALESCE(SUM(r.party_size), 0)::text AS total,
       e.rsvp_capacity AS capacity
     FROM events e
     LEFT JOIN rsvps r ON r.event_id = e.id
     WHERE e.id = $1
     GROUP BY e.rsvp_capacity`,
    [eventId],
  );
  if (rows.length === 0) {
    return { total: 0, capacity: null, spotsLeft: null };
  }
  const total = Number(rows[0].total);
  const capacity = rows[0].capacity;
  const spotsLeft = capacity === null ? null : Math.max(0, capacity - total);
  return { total, capacity, spotsLeft };
}

export async function listFeaturedEvents(limit = 3): Promise<Event[]> {
  return listUpcomingEvents(limit);
}
