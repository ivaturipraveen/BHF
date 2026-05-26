import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS totp_pending_secret text`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE admins DROP COLUMN IF EXISTS totp_pending_secret`);
}
