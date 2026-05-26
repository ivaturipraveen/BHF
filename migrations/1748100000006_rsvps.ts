import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE rsvps (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      member_id uuid REFERENCES members(id),
      name text NOT NULL,
      email citext NOT NULL,
      party_size int NOT NULL DEFAULT 1,
      dietary_restrictions text,
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (event_id, email)
    );
  `);

  pgm.sql(`CREATE INDEX rsvps_event_id_idx ON rsvps (event_id)`);
  pgm.sql(`CREATE INDEX rsvps_member_id_idx ON rsvps (member_id)`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS rsvps CASCADE`);
}
