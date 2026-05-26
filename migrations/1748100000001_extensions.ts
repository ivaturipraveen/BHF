import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS citext`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP EXTENSION IF EXISTS citext`);
  pgm.sql(`DROP EXTENSION IF EXISTS pgcrypto`);
}
