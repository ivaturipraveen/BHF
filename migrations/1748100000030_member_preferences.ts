import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE members
      ADD COLUMN IF NOT EXISTS event_reminders_opt_in boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS donation_receipts_opt_in boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS member_messages_opt_in boolean NOT NULL DEFAULT true
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE members
      DROP COLUMN IF EXISTS member_messages_opt_in,
      DROP COLUMN IF EXISTS donation_receipts_opt_in,
      DROP COLUMN IF EXISTS event_reminders_opt_in
  `);
}
