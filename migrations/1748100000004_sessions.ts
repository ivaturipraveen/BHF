import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      user_type text NOT NULL CHECK (user_type IN ('member','admin')),
      token_hash text NOT NULL UNIQUE,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      ip text,
      user_agent text
    );
  `);

  pgm.sql(`CREATE INDEX sessions_token_hash_idx ON sessions (token_hash)`);
  pgm.sql(`CREATE INDEX sessions_expires_at_idx ON sessions (expires_at)`);
  pgm.sql(`CREATE INDEX sessions_user_idx ON sessions (user_id, user_type)`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS sessions CASCADE`);
}
