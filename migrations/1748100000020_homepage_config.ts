import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE homepage_config (
      id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      featured_event_ids uuid[],
      featured_program_ids uuid[],
      hero_image_url text,
      stat_families_served int NOT NULL DEFAULT 0,
      stat_festivals_hosted int NOT NULL DEFAULT 0,
      stat_youth_in_programs int NOT NULL DEFAULT 0,
      stat_seva_hours int NOT NULL DEFAULT 0,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`
    INSERT INTO homepage_config (id) VALUES (1)
    ON CONFLICT (id) DO NOTHING;
  `);

  pgm.sql(`
    CREATE TRIGGER homepage_config_set_updated_at
    BEFORE UPDATE ON homepage_config
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS homepage_config CASCADE`);
}
