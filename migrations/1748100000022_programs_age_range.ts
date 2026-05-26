import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE programs
      ADD COLUMN min_age_years int,
      ADD COLUMN max_age_years int,
      ADD COLUMN is_youth boolean NOT NULL DEFAULT false
  `);

  pgm.sql(`CREATE INDEX programs_is_youth_idx ON programs (is_youth)`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP INDEX IF EXISTS programs_is_youth_idx`);
  pgm.sql(`
    ALTER TABLE programs
      DROP COLUMN IF EXISTS is_youth,
      DROP COLUMN IF EXISTS max_age_years,
      DROP COLUMN IF EXISTS min_age_years
  `);
}
