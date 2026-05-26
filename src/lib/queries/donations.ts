import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { query } from '@/lib/db';
import { getJwtSecret } from '@/lib/jwtSecret';
import type { Donation } from '@/types/db';

const COLUMNS = `id, member_id, stripe_session_id, stripe_payment_intent_id,
  stripe_subscription_id, amount_cents, currency, type, status, donor_name,
  donor_email, donor_address, in_honor_of, receipt_url, receipt_sent_at,
  idempotency_key, metadata, mode, created_at, updated_at`;

export interface CreatePendingDonationInput {
  amountCents: number;
  type: 'one_time' | 'monthly' | 'yearly';
  donorName: string;
  donorEmail: string;
  donorAddress?: string | null;
  inHonorOf?: string | null;
  memberId?: string | null;
  idempotencyKey?: string | null;
  metadata?: Record<string, unknown> | null;
  mode?: 'live' | 'stub';
}

export async function createPendingDonation(
  input: CreatePendingDonationInput,
): Promise<Donation> {
  const rows = await query<Donation>(
    `INSERT INTO donations (
       member_id, amount_cents, currency, type, status,
       donor_name, donor_email, donor_address, in_honor_of,
       idempotency_key, metadata, mode
     ) VALUES ($1,$2,'usd',$3,'pending',$4,$5,$6,$7,$8,$9,$10)
     RETURNING ${COLUMNS}`,
    [
      input.memberId ?? null,
      input.amountCents,
      input.type,
      input.donorName,
      input.donorEmail,
      input.donorAddress ?? null,
      input.inHonorOf ?? null,
      input.idempotencyKey ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null,
      input.mode ?? 'live',
    ],
  );
  return rows[0];
}

export async function updateDonationStripeSession(
  donationId: string,
  stripeSessionId: string,
): Promise<void> {
  await query(
    `UPDATE donations SET stripe_session_id = $2 WHERE id = $1`,
    [donationId, stripeSessionId],
  );
}

export async function markDonationSucceeded(
  donationId: string,
  stripePaymentIntentId?: string | null,
  stripeSubscriptionId?: string | null,
): Promise<Donation> {
  const rows = await query<Donation>(
    `UPDATE donations
        SET status = 'succeeded',
            stripe_payment_intent_id = COALESCE($2, stripe_payment_intent_id),
            stripe_subscription_id = COALESCE($3, stripe_subscription_id)
      WHERE id = $1
      RETURNING ${COLUMNS}`,
    [donationId, stripePaymentIntentId ?? null, stripeSubscriptionId ?? null],
  );
  return rows[0];
}

export async function markDonationFailed(
  donationId: string,
): Promise<Donation> {
  const rows = await query<Donation>(
    `UPDATE donations SET status = 'failed' WHERE id = $1 RETURNING ${COLUMNS}`,
    [donationId],
  );
  return rows[0];
}

export async function markDonationCanceled(
  donationId: string,
): Promise<Donation> {
  const rows = await query<Donation>(
    `UPDATE donations SET status = 'canceled' WHERE id = $1 RETURNING ${COLUMNS}`,
    [donationId],
  );
  return rows[0];
}

export async function markReceiptSent(
  donationId: string,
  receiptUrl?: string | null,
): Promise<void> {
  await query(
    `UPDATE donations
        SET receipt_sent_at = now(),
            receipt_url = COALESCE($2, receipt_url)
      WHERE id = $1`,
    [donationId, receiptUrl ?? null],
  );
}

function computeAccessToken(donationId: string): string {
  return createHmac('sha256', getJwtSecret()).update(donationId).digest('hex');
}

export function donationAccessToken(donationId: string): string {
  return computeAccessToken(donationId);
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function getDonationById(
  donationId: string,
  options: { accessToken?: string | null; memberId?: string | null } = {},
): Promise<Donation | null> {
  const rows = await query<Donation>(
    `SELECT ${COLUMNS} FROM donations WHERE id = $1 LIMIT 1`,
    [donationId],
  );
  const donation = rows[0] ?? null;
  if (!donation) return null;

  if (options.memberId && donation.member_id === options.memberId) {
    return donation;
  }
  if (options.accessToken) {
    const expected = computeAccessToken(donationId);
    if (safeEqual(options.accessToken, expected)) {
      return donation;
    }
  }
  return null;
}

export async function getDonationByIdUnchecked(
  donationId: string,
): Promise<Donation | null> {
  const rows = await query<Donation>(
    `SELECT ${COLUMNS} FROM donations WHERE id = $1 LIMIT 1`,
    [donationId],
  );
  return rows[0] ?? null;
}

export async function getDonationByStripeSession(
  sessionId: string,
): Promise<Donation | null> {
  const rows = await query<Donation>(
    `SELECT ${COLUMNS} FROM donations WHERE stripe_session_id = $1 LIMIT 1`,
    [sessionId],
  );
  return rows[0] ?? null;
}

export async function getLatestDonationBySubscription(
  subscriptionId: string,
): Promise<Donation | null> {
  const rows = await query<Donation>(
    `SELECT ${COLUMNS}
       FROM donations
      WHERE stripe_subscription_id = $1
      ORDER BY created_at DESC
      LIMIT 1`,
    [subscriptionId],
  );
  return rows[0] ?? null;
}

export async function hasProcessedEvent(eventId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `SELECT id FROM stripe_event_log WHERE id = $1 LIMIT 1`,
    [eventId],
  );
  return rows.length > 0;
}

export async function recordProcessedEvent(eventId: string): Promise<void> {
  await query(
    `INSERT INTO stripe_event_log (id) VALUES ($1) ON CONFLICT (id) DO NOTHING`,
    [eventId],
  );
}

export interface CloneRecurringDonationInput {
  templateDonationId: string;
  amountCents: number;
  stripeSubscriptionId: string;
  stripePaymentIntentId?: string | null;
}

export async function cloneRecurringDonation(
  input: CloneRecurringDonationInput,
): Promise<Donation | null> {
  const template = await getDonationByIdUnchecked(input.templateDonationId);
  if (!template) return null;
  const rows = await query<Donation>(
    `INSERT INTO donations (
       member_id, stripe_subscription_id, stripe_payment_intent_id,
       amount_cents, currency, type, status, donor_name, donor_email,
       donor_address, in_honor_of, metadata, mode
     ) VALUES ($1,$2,$3,$4,'usd',$5,'succeeded',$6,$7,$8,$9,$10,$11)
     RETURNING ${COLUMNS}`,
    [
      template.member_id,
      input.stripeSubscriptionId,
      input.stripePaymentIntentId ?? null,
      input.amountCents,
      template.type,
      template.donor_name,
      template.donor_email,
      template.donor_address,
      template.in_honor_of,
      template.metadata ? JSON.stringify(template.metadata) : null,
      template.mode,
    ],
  );
  return rows[0] ?? null;
}

export async function markSubscriptionCanceled(
  subscriptionId: string,
): Promise<number> {
  const rows = await query<{ id: string }>(
    `UPDATE donations
        SET status = 'canceled'
      WHERE stripe_subscription_id = $1
        AND status IN ('pending','succeeded')
      RETURNING id`,
    [subscriptionId],
  );
  return rows.length;
}
