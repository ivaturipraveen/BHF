import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE contact_inquiries (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      type text NOT NULL CHECK (type IN ('volunteer','sponsor','general','press','planned_giving')),
      name text,
      email citext,
      phone text,
      company text,
      message text NOT NULL,
      additional_data jsonb,
      status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
      handled_by uuid REFERENCES admins(id),
      handled_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`CREATE INDEX contact_inquiries_status_idx ON contact_inquiries (status)`);
  pgm.sql(`CREATE INDEX contact_inquiries_type_idx ON contact_inquiries (type)`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS contact_inquiries CASCADE`);
}
