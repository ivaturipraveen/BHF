import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE youth_enrollments DROP CONSTRAINT IF EXISTS youth_enrollments_child_id_fkey`,
  );
  pgm.sql(`
    ALTER TABLE youth_enrollments
      ADD CONSTRAINT youth_enrollments_child_id_fkey
      FOREIGN KEY (child_id) REFERENCES youth_children(id) ON DELETE CASCADE
  `);

  pgm.sql(
    `ALTER TABLE youth_enrollments DROP CONSTRAINT IF EXISTS youth_enrollments_program_id_fkey`,
  );
  pgm.sql(`
    ALTER TABLE youth_enrollments
      ADD CONSTRAINT youth_enrollments_program_id_fkey
      FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE RESTRICT
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE youth_enrollments DROP CONSTRAINT IF EXISTS youth_enrollments_child_id_fkey`,
  );
  pgm.sql(`
    ALTER TABLE youth_enrollments
      ADD CONSTRAINT youth_enrollments_child_id_fkey
      FOREIGN KEY (child_id) REFERENCES youth_children(id) ON DELETE CASCADE
  `);

  pgm.sql(
    `ALTER TABLE youth_enrollments DROP CONSTRAINT IF EXISTS youth_enrollments_program_id_fkey`,
  );
  pgm.sql(`
    ALTER TABLE youth_enrollments
      ADD CONSTRAINT youth_enrollments_program_id_fkey
      FOREIGN KEY (program_id) REFERENCES programs(id)
  `);
}
