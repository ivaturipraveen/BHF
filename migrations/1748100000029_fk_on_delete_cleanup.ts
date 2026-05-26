import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

// RILEY P2-B4: align FK ON DELETE clauses with the application's actual
// deletion semantics. Each FK below currently has NO ACTION; in practice the
// delete handlers null these columns explicitly before deleting the parent
// row, so the DB-level guard should match (SET NULL).

interface Fk {
  table: string;
  column: string;
  refTable: string;
  refColumn: string;
}

const FKS: Fk[] = [
  // Donations are preserved for IRS records — member_id is already nulled
  // by the delete handler; this just makes the FK enforce that contract.
  { table: 'donations', column: 'member_id', refTable: 'members', refColumn: 'id' },
  // Preserve event history when a member is deleted.
  { table: 'rsvps', column: 'member_id', refTable: 'members', refColumn: 'id' },
  // Preserve published posts when an author admin is removed.
  { table: 'blog_posts', column: 'author_id', refTable: 'admins', refColumn: 'id' },
  { table: 'pages', column: 'updated_by', refTable: 'admins', refColumn: 'id' },
  { table: 'photo_submissions', column: 'reviewed_by', refTable: 'admins', refColumn: 'id' },
  { table: 'contact_inquiries', column: 'handled_by', refTable: 'admins', refColumn: 'id' },
];

export async function up(pgm: MigrationBuilder): Promise<void> {
  for (const fk of FKS) {
    const name = `${fk.table}_${fk.column}_fkey`;
    pgm.sql(`ALTER TABLE ${fk.table} DROP CONSTRAINT IF EXISTS ${name}`);
    pgm.sql(
      `ALTER TABLE ${fk.table}
         ADD CONSTRAINT ${name}
         FOREIGN KEY (${fk.column})
         REFERENCES ${fk.refTable}(${fk.refColumn})
         ON DELETE SET NULL`,
    );
  }
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  for (const fk of FKS) {
    const name = `${fk.table}_${fk.column}_fkey`;
    pgm.sql(`ALTER TABLE ${fk.table} DROP CONSTRAINT IF EXISTS ${name}`);
    pgm.sql(
      `ALTER TABLE ${fk.table}
         ADD CONSTRAINT ${name}
         FOREIGN KEY (${fk.column})
         REFERENCES ${fk.refTable}(${fk.refColumn})`,
    );
  }
}
