import 'server-only';
import { query } from '@/lib/db';
import type { HomepageConfig } from '@/types/db';

const COLUMNS = `
  id, featured_event_ids, featured_program_ids, hero_image_url, stat_families_served,
  stat_festivals_hosted, stat_youth_in_programs, stat_seva_hours, updated_at
`;

export async function getHomepageConfig(): Promise<HomepageConfig> {
  const rows = await query<HomepageConfig>(
    `SELECT ${COLUMNS} FROM homepage_config WHERE id = 1 LIMIT 1`,
  );
  if (rows.length === 0) {
    throw new Error('homepage_config row id=1 is missing');
  }
  return rows[0];
}
