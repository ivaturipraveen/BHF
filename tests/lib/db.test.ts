// @vitest-environment node
import { describe, it, expect, afterAll } from 'vitest';
import { pool, query } from '@/lib/db';

const SCHEMA = 'bw_bhf_38';

afterAll(async () => {
  await pool.end().catch(() => {});
});

describe('db: connectivity', () => {
  it('SELECT 1 returns [{ ok: 1 }]', async () => {
    const rows = await query<{ ok: number }>('SELECT 1 AS ok');
    expect(rows).toEqual([{ ok: 1 }]);
  });
});

describe('db: schema integrity', () => {
  it("'members' table exists in bw_bhf_38", async () => {
    const rows = await query<{ table_name: string }>(
      `SELECT table_name
         FROM information_schema.tables
        WHERE table_schema = $1 AND table_name = $2`,
      [SCHEMA, 'members'],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].table_name).toBe('members');
  });

  it('members has email, password_hash, and directory_opt_in (default false)', async () => {
    const rows = await query<{
      column_name: string;
      column_default: string | null;
      is_nullable: string;
    }>(
      `SELECT column_name, column_default, is_nullable
         FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = 'members'`,
      [SCHEMA],
    );
    const byName = Object.fromEntries(rows.map((r) => [r.column_name, r]));
    expect(byName.email).toBeDefined();
    expect(byName.password_hash).toBeDefined();
    expect(byName.directory_opt_in).toBeDefined();
    expect(byName.directory_opt_in.column_default).toMatch(/false/i);
  });

  it('youth_children has photo_permission column (COPPA-critical)', async () => {
    const rows = await query<{ column_name: string; data_type: string }>(
      `SELECT column_name, data_type
         FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = 'youth_children' AND column_name = 'photo_permission'`,
      [SCHEMA],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].data_type).toBe('boolean');
  });
});
