import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE donations
      ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'live'
        CHECK (mode IN ('live','stub'))
  `);
  pgm.sql(`CREATE INDEX IF NOT EXISTS donations_mode_idx ON donations (mode)`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP INDEX IF EXISTS donations_mode_idx`);
  pgm.sql(`ALTER TABLE donations DROP COLUMN IF EXISTS mode`);
}
