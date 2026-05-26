import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE stripe_event_log (
      id text PRIMARY KEY,
      processed_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS stripe_event_log CASCADE`);
}
