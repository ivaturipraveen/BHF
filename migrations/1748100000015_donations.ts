import type { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE donations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id uuid REFERENCES members(id),
      stripe_session_id text,
      stripe_payment_intent_id text,
      stripe_subscription_id text,
      amount_cents int NOT NULL,
      currency text NOT NULL DEFAULT 'usd',
      type text NOT NULL CHECK (type IN ('one_time','monthly','yearly')),
      status text NOT NULL CHECK (status IN ('pending','succeeded','failed','refunded','canceled')),
      donor_name text NOT NULL,
      donor_email citext NOT NULL,
      donor_address text,
      in_honor_of text,
      receipt_url text,
      receipt_sent_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`CREATE INDEX donations_member_idx ON donations (member_id)`);
  pgm.sql(`CREATE INDEX donations_status_idx ON donations (status)`);
  pgm.sql(`CREATE INDEX donations_created_at_idx ON donations (created_at DESC)`);
  pgm.sql(`CREATE INDEX donations_stripe_subscription_idx ON donations (stripe_subscription_id)`);

  pgm.sql(`
    CREATE TRIGGER donations_set_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS donations CASCADE`);
}
