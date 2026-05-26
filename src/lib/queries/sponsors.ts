import 'server-only';
import { query } from '@/lib/db';
import type { Sponsor } from '@/types/db';

const COLUMNS = `
  id, name, tier, logo_url, website_url, display_order, active, created_at
`;

export async function listActiveSponsors(): Promise<Sponsor[]> {
  return query<Sponsor>(
    `SELECT ${COLUMNS} FROM sponsors
      WHERE active = true
      ORDER BY display_order ASC, name ASC`,
  );
}
