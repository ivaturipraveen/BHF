import 'server-only';
import { query } from '@/lib/db';
import type { Program } from '@/types/db';

const PROGRAM_COLUMNS = `
  id, slug, title, category, frequency, description_md, short_description, who_for,
  schedule_md, cost_md, location, hero_image_url, featured, display_order, status,
  min_age_years, max_age_years, is_youth,
  created_at, updated_at
`;

export async function listPrograms(category?: string): Promise<Program[]> {
  if (category) {
    return query<Program>(
      `SELECT ${PROGRAM_COLUMNS} FROM programs
        WHERE status = 'published' AND category = $1
        ORDER BY display_order ASC, title ASC`,
      [category],
    );
  }
  return query<Program>(
    `SELECT ${PROGRAM_COLUMNS} FROM programs
      WHERE status = 'published'
      ORDER BY display_order ASC, title ASC`,
  );
}

export async function listFeaturedPrograms(limit = 3): Promise<Program[]> {
  return query<Program>(
    `SELECT ${PROGRAM_COLUMNS} FROM programs
      WHERE status = 'published' AND featured = true
      ORDER BY display_order ASC, title ASC
      LIMIT $1`,
    [limit],
  );
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const rows = await query<Program>(
    `SELECT ${PROGRAM_COLUMNS} FROM programs WHERE slug = $1 LIMIT 1`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function listYouthPrograms(): Promise<Program[]> {
  return query<Program>(
    `SELECT ${PROGRAM_COLUMNS} FROM programs
      WHERE status = 'published' AND is_youth = true
      ORDER BY display_order ASC, title ASC`,
  );
}
