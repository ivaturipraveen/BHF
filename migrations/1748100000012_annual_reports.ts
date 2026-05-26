import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE annual_reports (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      year int UNIQUE NOT NULL,
      title text,
      pdf_url text NOT NULL,
      cover_image_url text,
      display_order int NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS annual_reports CASCADE`);
}
