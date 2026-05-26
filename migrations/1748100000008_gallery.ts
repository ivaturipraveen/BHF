import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE gallery_categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text UNIQUE NOT NULL,
      title text NOT NULL,
      description text,
      cover_image_url text,
      display_order int NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`
    CREATE TABLE gallery_photos (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      category_id uuid REFERENCES gallery_categories(id) ON DELETE CASCADE,
      file_url text NOT NULL,
      thumb_url text,
      caption text,
      photographer_credit text,
      taken_at date,
      display_order int NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`CREATE INDEX gallery_photos_category_idx ON gallery_photos (category_id)`);
  pgm.sql(`CREATE INDEX gallery_photos_display_order_idx ON gallery_photos (display_order)`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS gallery_photos CASCADE`);
  pgm.sql(`DROP TABLE IF EXISTS gallery_categories CASCADE`);
}
