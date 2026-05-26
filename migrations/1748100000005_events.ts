import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text UNIQUE NOT NULL,
      title text NOT NULL,
      description_md text NOT NULL,
      starts_at timestamptz NOT NULL,
      ends_at timestamptz,
      location_name text,
      location_address text,
      location_lat numeric,
      location_lng numeric,
      hero_image_url text,
      type text CHECK (type IN ('festival','class','charity','youth','other')),
      status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
      rsvp_capacity int,
      members_only boolean NOT NULL DEFAULT false,
      members_early_access_at timestamptz,
      allows_dietary_restrictions boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`CREATE INDEX events_starts_at_idx ON events (starts_at)`);
  pgm.sql(`CREATE INDEX events_status_idx ON events (status)`);
  pgm.sql(`CREATE INDEX events_slug_idx ON events (slug)`);

  pgm.sql(`
    CREATE TRIGGER events_set_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS events CASCADE`);
}
