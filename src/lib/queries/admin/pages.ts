import 'server-only';
import { query } from '@/lib/db';
import type { Page } from '@/types/db';

const COLUMNS = `id, slug, title, body_md, meta_title, meta_description, updated_by, updated_at, created_at`;

export interface PageUpdateInput {
  title?: string | null;
  body_md?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  updated_by?: string | null;
}

const UPDATABLE_FIELDS: ReadonlySet<string> = new Set([
  'title',
  'body_md',
  'meta_title',
  'meta_description',
  'updated_by',
]);

export async function listAllPages(): Promise<Page[]> {
  return query<Page>(
    `SELECT ${COLUMNS} FROM pages ORDER BY slug ASC`,
  );
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const rows = await query<Page>(
    `SELECT ${COLUMNS} FROM pages WHERE slug = $1 LIMIT 1`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function getPageById(id: string): Promise<Page | null> {
  const rows = await query<Page>(
    `SELECT ${COLUMNS} FROM pages WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function updatePage(id: string, input: PageUpdateInput): Promise<Page | null> {
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
  if (fields.length === 0) return getPageById(id);
  values.push(id);
  const rows = await query<Page>(
    `UPDATE pages SET ${fields.join(', ')} WHERE id = $${idx} RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0] ?? null;
}
