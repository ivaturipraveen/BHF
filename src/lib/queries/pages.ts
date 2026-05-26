import 'server-only';
import { query } from '@/lib/db';
import type { Page } from '@/types/db';

const COLUMNS = `
  id, slug, title, body_md, meta_title, meta_description, updated_by, updated_at, created_at
`;

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const rows = await query<Page>(
    `SELECT ${COLUMNS} FROM pages WHERE slug = $1 LIMIT 1`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function getMultiplePages(
  slugs: string[],
): Promise<Record<string, Page>> {
  if (slugs.length === 0) return {};
  const rows = await query<Page>(
    `SELECT ${COLUMNS} FROM pages WHERE slug = ANY($1)`,
    [slugs],
  );
  const out: Record<string, Page> = {};
  for (const row of rows) {
    out[row.slug] = row;
  }
  return out;
}
