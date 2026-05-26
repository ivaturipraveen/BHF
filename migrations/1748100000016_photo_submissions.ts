import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE photo_submissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      submitter_name text,
      submitter_email citext,
      event_id uuid REFERENCES events(id) ON DELETE SET NULL,
      file_url text NOT NULL,
      caption text,
      status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
      reviewed_by uuid REFERENCES admins(id),
      review_note text,
      created_at timestamptz NOT NULL DEFAULT now(),
      reviewed_at timestamptz
    );
  `);

  pgm.sql(`CREATE INDEX photo_submissions_status_idx ON photo_submissions (status)`);
  pgm.sql(`CREATE INDEX photo_submissions_event_idx ON photo_submissions (event_id)`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS photo_submissions CASCADE`);
}
