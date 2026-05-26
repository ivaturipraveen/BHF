import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS saved_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      note text,
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (member_id, event_id)
    )
  `);
  pgm.sql(`CREATE INDEX IF NOT EXISTS saved_events_member_idx ON saved_events(member_id)`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS saved_events_event_idx ON saved_events(event_id)`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP INDEX IF EXISTS saved_events_event_idx`);
  pgm.sql(`DROP INDEX IF EXISTS saved_events_member_idx`);
  pgm.sql(`DROP TABLE IF EXISTS saved_events`);
}
