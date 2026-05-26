import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE TABLE members (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email citext UNIQUE NOT NULL,
      password_hash text NOT NULL,
      first_name text NOT NULL,
      last_name text NOT NULL,
      phone text,
      city text,
      family_size text,
      how_heard text,
      interests text[],
      bio text,
      photo_url text,
      email_verified_at timestamptz,
      email_verification_token text,
      password_reset_token text,
      password_reset_expires_at timestamptz,
      directory_opt_in boolean NOT NULL DEFAULT false,
      newsletter_opt_in boolean NOT NULL DEFAULT false,
      suspended_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`CREATE INDEX members_email_idx ON members (email)`);
  pgm.sql(`CREATE INDEX members_email_lower_idx ON members (lower(email))`);
  pgm.sql(
    `CREATE INDEX members_directory_opt_in_idx ON members (directory_opt_in) WHERE directory_opt_in = true`,
  );

  pgm.sql(`
    CREATE TRIGGER members_set_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS members CASCADE`);
  pgm.sql(`DROP FUNCTION IF EXISTS set_updated_at()`);
}
