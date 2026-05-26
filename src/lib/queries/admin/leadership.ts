import 'server-only';
import { query, withTransaction } from '@/lib/db';
import type { Leadership } from '@/types/db';

const COLUMNS = `id, name, role, bio, photo_url, linkedin_url, section, display_order, active, created_at, updated_at`;

export interface LeadershipCreateInput {
  name: string;
  role: string;
  bio: string;
  photo_url?: string | null;
  linkedin_url?: string | null;
  section: 'founding' | 'board' | 'working_group';
  display_order?: number;
  active?: boolean;
}
export type LeadershipUpdateInput = Partial<LeadershipCreateInput>;

const UPDATABLE_FIELDS: ReadonlySet<string> = new Set([
  'name',
  'role',
  'bio',
  'photo_url',
  'linkedin_url',
  'section',
  'display_order',
  'active',
]);

export async function listAllLeadership(): Promise<Leadership[]> {
  return query<Leadership>(
    `SELECT ${COLUMNS} FROM leadership ORDER BY section ASC, display_order ASC, name ASC`,
  );
}

export async function getLeadershipById(id: string): Promise<Leadership | null> {
  const rows = await query<Leadership>(
    `SELECT ${COLUMNS} FROM leadership WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createLeadership(input: LeadershipCreateInput): Promise<Leadership> {
  const rows = await query<Leadership>(
    `INSERT INTO leadership (name, role, bio, photo_url, linkedin_url, section, display_order, active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING ${COLUMNS}`,
    [
      input.name,
      input.role,
      input.bio,
      input.photo_url ?? null,
      input.linkedin_url ?? null,
      input.section,
      input.display_order ?? 0,
      input.active ?? true,
    ],
  );
  return rows[0];
}

export async function updateLeadership(
  id: string,
  input: LeadershipUpdateInput,
): Promise<Leadership | null> {
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
  if (fields.length === 0) return getLeadershipById(id);
  values.push(id);
  const rows = await query<Leadership>(
    `UPDATE leadership SET ${fields.join(', ')} WHERE id = $${idx} RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0] ?? null;
}

export async function deleteLeadership(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM leadership WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}

export async function reorderLeadership(
  updates: Array<{ id: string; display_order: number }>,
): Promise<void> {
  await withTransaction(async (client) => {
    for (const u of updates) {
      await client.query(
        `UPDATE leadership SET display_order = $1 WHERE id = $2`,
        [u.display_order, u.id],
      );
    }
  });
}
