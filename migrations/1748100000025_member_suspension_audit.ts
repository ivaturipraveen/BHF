import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE members
      ADD COLUMN IF NOT EXISTS suspended_by_admin_id uuid REFERENCES admins(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS suspended_at_recorded_at timestamptz,
      ADD COLUMN IF NOT EXISTS unsuspended_by_admin_id uuid REFERENCES admins(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS unsuspended_at_recorded_at timestamptz
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE members
      DROP COLUMN IF EXISTS suspended_by_admin_id,
      DROP COLUMN IF EXISTS suspended_at_recorded_at,
      DROP COLUMN IF EXISTS unsuspended_by_admin_id,
      DROP COLUMN IF EXISTS unsuspended_at_recorded_at
  `);
}
