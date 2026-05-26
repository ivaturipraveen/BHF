import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE exclusive_content (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      description text,
      category text NOT NULL CHECK (category IN ('yoga','vedic_chanting','bharatiyatha_lecture','festival_recording','magazine','other')),
      content_type text NOT NULL CHECK (content_type IN ('video','pdf','audio')),
      content_url text NOT NULL,
      thumbnail_url text,
      duration_seconds int,
      published_at timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`CREATE INDEX exclusive_content_category_idx ON exclusive_content (category)`);
  pgm.sql(`CREATE INDEX exclusive_content_published_at_idx ON exclusive_content (published_at DESC)`);

  pgm.sql(`
    CREATE TRIGGER exclusive_content_set_updated_at
    BEFORE UPDATE ON exclusive_content
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS exclusive_content CASCADE`);
}
