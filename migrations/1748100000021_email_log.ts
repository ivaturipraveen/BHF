import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE email_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      to_email citext NOT NULL,
      subject text NOT NULL,
      body_text text NOT NULL,
      body_html text,
      kind text NOT NULL CHECK (kind IN (
        'verify','reset','rsvp_confirmation','donation_receipt','welcome','admin_test'
      )),
      sent_at timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`CREATE INDEX email_log_to_email_kind_idx ON email_log (to_email, kind)`);
  pgm.sql(`CREATE INDEX email_log_sent_at_idx ON email_log (sent_at DESC)`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS email_log CASCADE`);
}
