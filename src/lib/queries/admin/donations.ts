import 'server-only';
import { query } from '@/lib/db';
import type { Donation } from '@/types/db';

const COLUMNS = `id, member_id, stripe_session_id, stripe_payment_intent_id, stripe_subscription_id, amount_cents, currency, type, status, donor_name, donor_email, donor_address, in_honor_of, receipt_url, receipt_sent_at, mode, created_at, updated_at`;

export interface ListDonationsOpts {
  limit?: number;
  offset?: number;
  status?: string;
  includeStub?: boolean;
}

export async function listAllDonations(opts: ListDonationsOpts = {}): Promise<Donation[]> {
  const limit = Math.min(opts.limit ?? 50, 200);
  const offset = Math.max(opts.offset ?? 0, 0);
  const includeStub = opts.includeStub ?? false;
  const whereParts: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  if (opts.status) {
    whereParts.push(`status = $${i++}`);
    params.push(opts.status);
  }
  if (!includeStub) {
    whereParts.push(`mode = 'live'`);
  }
  const whereSql = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';
  params.push(limit, offset);
  return query<Donation>(
    `SELECT ${COLUMNS} FROM donations ${whereSql} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i}`,
    params,
  );
}

export async function getDonationById(id: string): Promise<Donation | null> {
  const rows = await query<Donation>(
    `SELECT ${COLUMNS} FROM donations WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function countStubDonations(): Promise<number> {
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM donations WHERE mode = 'stub'`,
  );
  return Number(rows[0]?.count ?? '0');
}

export interface DonationStats {
  totalYtdCents: number;
  totalYtdCount: number;
  totalMonthCents: number;
  totalMonthCount: number;
  monthlyRecurringCount: number;
  topDonors: Array<{ donor_name: string; donor_email: string; total_cents: number }>;
}

export interface DonationStatsOpts {
  includeStub?: boolean;
}

export async function getDonationStats(
  opts: DonationStatsOpts = {},
): Promise<DonationStats> {
  const modeFilter = opts.includeStub ? '' : ` AND mode = 'live'`;
  const ytdRows = await query<{ total: string; count: string }>(
    `SELECT COALESCE(SUM(amount_cents), 0)::text AS total, COUNT(*)::text AS count
       FROM donations
      WHERE status = 'succeeded'
        AND created_at >= date_trunc('year', now())${modeFilter}`,
  );
  const monthRows = await query<{ total: string; count: string }>(
    `SELECT COALESCE(SUM(amount_cents), 0)::text AS total, COUNT(*)::text AS count
       FROM donations
      WHERE status = 'succeeded'
        AND created_at >= date_trunc('month', now())${modeFilter}`,
  );
  const recurringRows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
       FROM donations
      WHERE status = 'succeeded'
        AND type = 'monthly'
        AND stripe_subscription_id IS NOT NULL${modeFilter}`,
  );
  const topDonors = await query<{ donor_name: string; donor_email: string; total_cents: string }>(
    `SELECT donor_name, donor_email, COALESCE(SUM(amount_cents), 0)::text AS total_cents
       FROM donations
      WHERE status = 'succeeded'${modeFilter}
      GROUP BY donor_name, donor_email
      ORDER BY SUM(amount_cents) DESC
      LIMIT 10`,
  );
  return {
    totalYtdCents: Number(ytdRows[0]?.total ?? '0'),
    totalYtdCount: Number(ytdRows[0]?.count ?? '0'),
    totalMonthCents: Number(monthRows[0]?.total ?? '0'),
    totalMonthCount: Number(monthRows[0]?.count ?? '0'),
    monthlyRecurringCount: Number(recurringRows[0]?.count ?? '0'),
    topDonors: topDonors.map((r) => ({
      donor_name: r.donor_name,
      donor_email: r.donor_email,
      total_cents: Number(r.total_cents),
    })),
  };
}
