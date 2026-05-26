import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE leadership (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      role text NOT NULL,
      bio text NOT NULL,
      photo_url text,
      linkedin_url text,
      section text NOT NULL CHECK (section IN ('founding','board','working_group')),
      display_order int NOT NULL DEFAULT 0,
      active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`CREATE INDEX leadership_section_idx ON leadership (section)`);
  pgm.sql(`CREATE INDEX leadership_active_idx ON leadership (active)`);

  pgm.sql(`
    CREATE TRIGGER leadership_set_updated_at
    BEFORE UPDATE ON leadership
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS leadership CASCADE`);
}
