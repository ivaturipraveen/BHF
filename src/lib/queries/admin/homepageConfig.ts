import 'server-only';
import { query } from '@/lib/db';
import type { HomepageConfig } from '@/types/db';

const COLUMNS = `id, featured_event_ids, featured_program_ids, hero_image_url, stat_families_served, stat_festivals_hosted, stat_youth_in_programs, stat_seva_hours, updated_at`;

export interface HomepageConfigUpdateInput {
  featured_event_ids?: string[] | null;
  featured_program_ids?: string[] | null;
  hero_image_url?: string | null;
  stat_families_served?: number;
  stat_festivals_hosted?: number;
  stat_youth_in_programs?: number;
  stat_seva_hours?: number;
}

const UPDATABLE_FIELDS: ReadonlySet<string> = new Set([
  'featured_event_ids',
  'featured_program_ids',
  'hero_image_url',
  'stat_families_served',
  'stat_festivals_hosted',
  'stat_youth_in_programs',
  'stat_seva_hours',
]);

export async function getHomepageConfig(): Promise<HomepageConfig | null> {
  const rows = await query<HomepageConfig>(
    `SELECT ${COLUMNS} FROM homepage_config WHERE id = 1 LIMIT 1`,
  );
  return rows[0] ?? null;
}

export async function updateHomepageConfig(
  input: HomepageConfigUpdateInput,
): Promise<HomepageConfig | null> {
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
  if (fields.length === 0) return getHomepageConfig();
  const rows = await query<HomepageConfig>(
    `UPDATE homepage_config SET ${fields.join(', ')} WHERE id = 1 RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0] ?? null;
}
