import 'server-only';
import { query } from '@/lib/db';
import type { Event } from '@/types/db';

const COLUMNS = `
  id, slug, title, description_md, starts_at, ends_at, location_name, location_address,
  location_lat, location_lng, hero_image_url, type, status, rsvp_capacity, members_only,
  members_early_access_at, allows_dietary_restrictions, created_at, updated_at
`;

export interface EventCreateInput {
  slug: string;
  title: string;
  description_md: string;
  starts_at: string;
  ends_at?: string | null;
  location_name?: string | null;
  location_address?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  hero_image_url?: string | null;
  type?: 'festival' | 'class' | 'charity' | 'youth' | 'other' | null;
  status?: 'draft' | 'published' | 'archived';
  rsvp_capacity?: number | null;
  members_only?: boolean;
  members_early_access_at?: string | null;
  allows_dietary_restrictions?: boolean;
}

export type EventUpdateInput = Partial<EventCreateInput>;

const UPDATABLE_FIELDS: ReadonlySet<string> = new Set([
  'slug',
  'title',
  'description_md',
  'starts_at',
  'ends_at',
  'location_name',
  'location_address',
  'location_lat',
  'location_lng',
  'hero_image_url',
  'type',
  'status',
  'rsvp_capacity',
  'members_only',
  'members_early_access_at',
  'allows_dietary_restrictions',
]);

export async function listAllEvents(): Promise<Event[]> {
  return query<Event>(
    `SELECT ${COLUMNS} FROM events ORDER BY starts_at DESC`,
  );
}

export async function getEventById(id: string): Promise<Event | null> {
  const rows = await query<Event>(
    `SELECT ${COLUMNS} FROM events WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createEvent(input: EventCreateInput): Promise<Event> {
  const rows = await query<Event>(
    `INSERT INTO events (
       slug, title, description_md, starts_at, ends_at, location_name, location_address,
       location_lat, location_lng, hero_image_url, type, status, rsvp_capacity, members_only,
       members_early_access_at, allows_dietary_restrictions
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING ${COLUMNS}`,
    [
      input.slug,
      input.title,
      input.description_md,
      input.starts_at,
      input.ends_at ?? null,
      input.location_name ?? null,
      input.location_address ?? null,
      input.location_lat ?? null,
      input.location_lng ?? null,
      input.hero_image_url ?? null,
      input.type ?? null,
      input.status ?? 'draft',
      input.rsvp_capacity ?? null,
      input.members_only ?? false,
      input.members_early_access_at ?? null,
      input.allows_dietary_restrictions ?? false,
    ],
  );
  return rows[0];
}

export async function updateEvent(
  id: string,
  input: EventUpdateInput,
): Promise<Event | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (!UPDATABLE_FIELDS.has(key)) continue;
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx++;
  }
  if (fields.length === 0) return getEventById(id);
  values.push(id);
  const rows = await query<Event>(
    `UPDATE events SET ${fields.join(', ')} WHERE id = $${idx} RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0] ?? null;
}

export async function publishEvent(id: string): Promise<Event | null> {
  const rows = await query<Event>(
    `UPDATE events
        SET status = 'published'
      WHERE id = $1
      RETURNING ${COLUMNS}`,
    [id],
  );
  return rows[0] ?? null;
}

export async function countRsvpsForEvent(id: string): Promise<number> {
  const rows = await query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM rsvps WHERE event_id = $1`,
    [id],
  );
  return Number(rows[0]?.c ?? '0');
}

export async function deleteEvent(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM events WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}
