import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE programs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text UNIQUE NOT NULL,
      title text NOT NULL,
      category text NOT NULL CHECK (category IN ('cultural','educational','charitable','wellness','youth')),
      frequency text NOT NULL CHECK (frequency IN ('monthly','annual','rolling')),
      description_md text NOT NULL,
      short_description text NOT NULL,
      who_for text,
      schedule_md text,
      cost_md text,
      location text,
      hero_image_url text,
      featured boolean NOT NULL DEFAULT false,
      display_order int NOT NULL DEFAULT 0,
      status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','archived')),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`CREATE INDEX programs_category_idx ON programs (category)`);
  pgm.sql(`CREATE INDEX programs_featured_idx ON programs (featured)`);
  pgm.sql(`CREATE INDEX programs_slug_idx ON programs (slug)`);

  pgm.sql(`
    CREATE TRIGGER programs_set_updated_at
    BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS programs CASCADE`);
}
