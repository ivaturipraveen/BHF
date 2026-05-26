import 'server-only';
import { query } from '@/lib/db';
import type { ExclusiveContent } from '@/types/db';

const COLUMNS = `id, title, description, category, content_type, content_url, thumbnail_url, duration_seconds, published_at, created_at, updated_at`;

export interface ExclusiveContentCreateInput {
  title: string;
  description?: string | null;
  category: 'yoga' | 'vedic_chanting' | 'bharatiyatha_lecture' | 'festival_recording' | 'magazine' | 'other';
  content_type: 'video' | 'pdf' | 'audio';
  content_url: string;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  published_at?: string | null;
}
export type ExclusiveContentUpdateInput = Partial<ExclusiveContentCreateInput>;

const UPDATABLE_FIELDS: ReadonlySet<string> = new Set([
  'title',
  'description',
  'category',
  'content_type',
  'content_url',
  'thumbnail_url',
  'duration_seconds',
  'published_at',
]);

export async function listAllExclusiveContent(): Promise<ExclusiveContent[]> {
  return query<ExclusiveContent>(
    `SELECT ${COLUMNS} FROM exclusive_content ORDER BY published_at DESC`,
  );
}

export async function getExclusiveContentById(id: string): Promise<ExclusiveContent | null> {
  const rows = await query<ExclusiveContent>(
    `SELECT ${COLUMNS} FROM exclusive_content WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createExclusiveContent(input: ExclusiveContentCreateInput): Promise<ExclusiveContent> {
  const rows = await query<ExclusiveContent>(
    `INSERT INTO exclusive_content (title, description, category, content_type, content_url, thumbnail_url, duration_seconds, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7, COALESCE($8::timestamptz, now()))
     RETURNING ${COLUMNS}`,
    [
      input.title,
      input.description ?? null,
      input.category,
      input.content_type,
      input.content_url,
      input.thumbnail_url ?? null,
      input.duration_seconds ?? null,
      input.published_at ?? null,
    ],
  );
  return rows[0];
}

export async function updateExclusiveContent(
  id: string,
  input: ExclusiveContentUpdateInput,
): Promise<ExclusiveContent | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    if (!UPDATABLE_FIELDS.has(k)) continue;
    fields.push(`${k} = $${idx}`);
    values.push(v);
    idx++;
  }
  if (fields.length === 0) return getExclusiveContentById(id);
  values.push(id);
  const rows = await query<ExclusiveContent>(
    `UPDATE exclusive_content SET ${fields.join(', ')} WHERE id = $${idx} RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0] ?? null;
}

export async function deleteExclusiveContent(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM exclusive_content WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}
