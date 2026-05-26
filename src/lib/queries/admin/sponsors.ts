import 'server-only';
import { query } from '@/lib/db';
import type { Sponsor } from '@/types/db';

const COLUMNS = `id, name, tier, logo_url, website_url, display_order, active, created_at`;

export interface SponsorCreateInput {
  name: string;
  tier?: string | null;
  logo_url: string;
  website_url?: string | null;
  display_order?: number;
  active?: boolean;
}
export type SponsorUpdateInput = Partial<SponsorCreateInput>;

const UPDATABLE_FIELDS: ReadonlySet<string> = new Set([
  'name',
  'tier',
  'logo_url',
  'website_url',
  'display_order',
  'active',
]);

export async function listAllSponsors(): Promise<Sponsor[]> {
  return query<Sponsor>(
    `SELECT ${COLUMNS} FROM sponsors ORDER BY display_order ASC, name ASC`,
  );
}

export async function getSponsorById(id: string): Promise<Sponsor | null> {
  const rows = await query<Sponsor>(
    `SELECT ${COLUMNS} FROM sponsors WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createSponsor(input: SponsorCreateInput): Promise<Sponsor> {
  const rows = await query<Sponsor>(
    `INSERT INTO sponsors (name, tier, logo_url, website_url, display_order, active)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING ${COLUMNS}`,
    [
      input.name,
      input.tier ?? null,
      input.logo_url,
      input.website_url ?? null,
      input.display_order ?? 0,
      input.active ?? true,
    ],
  );
  return rows[0];
}

export async function updateSponsor(
  id: string,
  input: SponsorUpdateInput,
): Promise<Sponsor | null> {
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
  if (fields.length === 0) return getSponsorById(id);
  values.push(id);
  const rows = await query<Sponsor>(
    `UPDATE sponsors SET ${fields.join(', ')} WHERE id = $${idx} RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0] ?? null;
}

export async function deleteSponsor(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM sponsors WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}
