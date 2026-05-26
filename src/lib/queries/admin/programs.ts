import 'server-only';
import { query } from '@/lib/db';
import type { Program } from '@/types/db';

const COLUMNS = `
  id, slug, title, category, frequency, description_md, short_description, who_for,
  schedule_md, cost_md, location, hero_image_url, featured, display_order, status,
  min_age_years, max_age_years, is_youth, created_at, updated_at
`;

export interface ProgramCreateInput {
  slug: string;
  title: string;
  category: 'cultural' | 'educational' | 'charitable' | 'wellness' | 'youth';
  frequency: 'monthly' | 'annual' | 'rolling';
  description_md: string;
  short_description: string;
  who_for?: string | null;
  schedule_md?: string | null;
  cost_md?: string | null;
  location?: string | null;
  hero_image_url?: string | null;
  featured?: boolean;
  display_order?: number;
  status?: 'draft' | 'published' | 'archived';
  min_age_years?: number | null;
  max_age_years?: number | null;
  is_youth?: boolean;
}
export type ProgramUpdateInput = Partial<ProgramCreateInput>;

const UPDATABLE_FIELDS: ReadonlySet<string> = new Set([
  'slug',
  'title',
  'category',
  'frequency',
  'description_md',
  'short_description',
  'who_for',
  'schedule_md',
  'cost_md',
  'location',
  'hero_image_url',
  'featured',
  'display_order',
  'status',
  'min_age_years',
  'max_age_years',
  'is_youth',
]);

export async function listAllPrograms(): Promise<Program[]> {
  return query<Program>(
    `SELECT ${COLUMNS} FROM programs ORDER BY display_order ASC, title ASC`,
  );
}

export async function getProgramById(id: string): Promise<Program | null> {
  const rows = await query<Program>(
    `SELECT ${COLUMNS} FROM programs WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createProgram(input: ProgramCreateInput): Promise<Program> {
  const rows = await query<Program>(
    `INSERT INTO programs (
       slug, title, category, frequency, description_md, short_description, who_for,
       schedule_md, cost_md, location, hero_image_url, featured, display_order, status,
       min_age_years, max_age_years, is_youth
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING ${COLUMNS}`,
    [
      input.slug,
      input.title,
      input.category,
      input.frequency,
      input.description_md,
      input.short_description,
      input.who_for ?? null,
      input.schedule_md ?? null,
      input.cost_md ?? null,
      input.location ?? null,
      input.hero_image_url ?? null,
      input.featured ?? false,
      input.display_order ?? 0,
      input.status ?? 'draft',
      input.min_age_years ?? null,
      input.max_age_years ?? null,
      input.is_youth ?? false,
    ],
  );
  return rows[0];
}

export async function updateProgram(
  id: string,
  input: ProgramUpdateInput,
): Promise<Program | null> {
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
  if (fields.length === 0) return getProgramById(id);
  values.push(id);
  const rows = await query<Program>(
    `UPDATE programs SET ${fields.join(', ')} WHERE id = $${idx} RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0] ?? null;
}

export async function countActiveEnrollments(programId: string): Promise<number> {
  const rows = await query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM youth_enrollments
      WHERE program_id = $1 AND status = 'enrolled'`,
    [programId],
  );
  return Number(rows[0]?.c ?? '0');
}

export async function deleteProgram(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM programs WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}
