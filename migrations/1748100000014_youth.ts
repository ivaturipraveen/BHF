import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE youth_children (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      parent_member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      first_name text NOT NULL,
      last_name text NOT NULL,
      date_of_birth date NOT NULL,
      allergies text,
      emergency_contact_name text,
      emergency_contact_phone text,
      photo_permission boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`CREATE INDEX youth_children_parent_idx ON youth_children (parent_member_id)`);

  pgm.sql(`
    CREATE TRIGGER youth_children_set_updated_at
    BEFORE UPDATE ON youth_children
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);

  pgm.sql(`
    CREATE TABLE youth_enrollments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      child_id uuid REFERENCES youth_children(id) ON DELETE CASCADE,
      program_id uuid REFERENCES programs(id),
      parental_consent_at timestamptz NOT NULL,
      parental_consent_ip text,
      parental_consent_user_agent text,
      status text NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled','withdrawn','completed')),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (child_id, program_id)
    );
  `);

  pgm.sql(`CREATE INDEX youth_enrollments_program_idx ON youth_enrollments (program_id)`);

  pgm.sql(`
    CREATE TRIGGER youth_enrollments_set_updated_at
    BEFORE UPDATE ON youth_enrollments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS youth_enrollments CASCADE`);
  pgm.sql(`DROP TABLE IF EXISTS youth_children CASCADE`);
}
