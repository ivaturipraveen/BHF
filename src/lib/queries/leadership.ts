import 'server-only';
import { query } from '@/lib/db';
import type { Leadership } from '@/types/db';

const COLUMNS = `
  id, name, role, bio, photo_url, linkedin_url, section, display_order, active,
  created_at, updated_at
`;

export async function listLeadership(
  section?: 'founding' | 'board' | 'working_group',
): Promise<Leadership[]> {
  if (section) {
    return query<Leadership>(
      `SELECT ${COLUMNS} FROM leadership
        WHERE active = true AND section = $1
        ORDER BY display_order ASC, name ASC`,
      [section],
    );
  }
  return query<Leadership>(
    `SELECT ${COLUMNS} FROM leadership
      WHERE active = true
      ORDER BY section ASC, display_order ASC, name ASC`,
  );
}
