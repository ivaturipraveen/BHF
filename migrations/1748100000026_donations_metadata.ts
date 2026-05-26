import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE donations
      ADD COLUMN IF NOT EXISTS idempotency_key text,
      ADD COLUMN IF NOT EXISTS metadata jsonb
  `);

  pgm.sql(
    `CREATE INDEX IF NOT EXISTS donations_stripe_session_idx ON donations (stripe_session_id)`,
  );
  pgm.sql(
    `CREATE INDEX IF NOT EXISTS donations_created_at_desc_idx ON donations (created_at DESC)`,
  );
  pgm.sql(
    `CREATE INDEX IF NOT EXISTS donations_idempotency_key_idx ON donations (idempotency_key)`,
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP INDEX IF EXISTS donations_idempotency_key_idx`);
  pgm.sql(`DROP INDEX IF EXISTS donations_created_at_desc_idx`);
  pgm.sql(`DROP INDEX IF EXISTS donations_stripe_session_idx`);
  pgm.sql(`
    ALTER TABLE donations
      DROP COLUMN IF EXISTS metadata,
      DROP COLUMN IF EXISTS idempotency_key
  `);
}
