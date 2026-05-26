// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { query } from '../../src/lib/db';
import {
  BASE,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  donorEmail,
  ensureServerReachable,
  getDemoMemberId,
  getDonationRow,
  loginAndGetCookie,
  nanoid,
  testHeaders,
} from './_helpers';

// Track every donation id we mint so we can clean up even when assertions fail.
const createdDonationIds: string[] = [];

async function purgeCreated(): Promise<void> {
  if (createdDonationIds.length > 0) {
    await query(`DELETE FROM donations WHERE id = ANY($1::uuid[])`, [
      createdDonationIds,
    ]);
    createdDonationIds.length = 0;
  }
}

beforeAll(async () => {
  await ensureServerReachable();
});

afterAll(async () => {
  await purgeCreated();
});

interface CheckoutResponse {
  mode?: string;
  donationId?: string;
  successUrl?: string;
  error?: string;
  details?: unknown;
}

async function postCheckout(
  body: Record<string, unknown>,
  extraHeaders?: Record<string, string>,
): Promise<{ status: number; json: CheckoutResponse }> {
  const res = await fetch(`${BASE}/api/donations/checkout`, {
    method: 'POST',
    headers: testHeaders(extraHeaders),
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as CheckoutResponse;
  if (json.donationId) createdDonationIds.push(json.donationId);
  return { status: res.status, json };
}

describe('POST /api/donations/checkout (stub mode)', () => {
  it('creates a succeeded one_time donation and returns demo successUrl', async () => {
    const email = donorEmail();
    const { status, json } = await postCheckout({
      amountCents: 5000,
      type: 'one_time',
      donorName: 'Test Donor',
      donorEmail: email,
    });
    expect(status).toBe(200);
    expect(json.mode).toBe('stub');
    expect(json.donationId).toBeTruthy();
    expect(json.successUrl ?? '').toContain('demo=1');
    expect(json.successUrl ?? '').toContain(json.donationId!);

    const row = await getDonationRow(json.donationId!);
    expect(row).toBeTruthy();
    expect(row!.status).toBe('succeeded');
    expect(row!.amount_cents).toBe(5000);
    expect(row!.type).toBe('one_time');
    expect(row!.donor_email).toBe(email);
  });

  it('creates a succeeded monthly donation', async () => {
    const { status, json } = await postCheckout({
      amountCents: 2500,
      type: 'monthly',
      donorName: 'Recurring Donor',
      donorEmail: donorEmail(),
    });
    expect(status).toBe(200);
    expect(json.donationId).toBeTruthy();

    const row = await getDonationRow(json.donationId!);
    expect(row).toBeTruthy();
    expect(row!.type).toBe('monthly');
    expect(row!.status).toBe('succeeded');
  });

  it('rejects amountCents below 100 with 400', async () => {
    const { status, json } = await postCheckout({
      amountCents: 50,
      type: 'one_time',
      donorName: 'Stingy',
      donorEmail: donorEmail(),
    });
    expect(status).toBe(400);
    expect(json.error ?? '').toMatch(/invalid/i);
    expect(json.donationId).toBeUndefined();
  });

  it('rejects missing donorName with 400', async () => {
    const res = await fetch(`${BASE}/api/donations/checkout`, {
      method: 'POST',
      headers: testHeaders(),
      body: JSON.stringify({
        amountCents: 5000,
        type: 'one_time',
        donorEmail: donorEmail(),
      }),
    });
    expect(res.status).toBe(400);
    const json = (await res.json()) as CheckoutResponse;
    expect(json.error ?? '').toMatch(/invalid/i);
  });

  it('rejects invalid email with 400', async () => {
    const { status, json } = await postCheckout({
      amountCents: 5000,
      type: 'one_time',
      donorName: 'Bad Email',
      donorEmail: 'not-an-email',
    });
    expect(status).toBe(400);
    expect(json.error ?? '').toMatch(/invalid/i);
  });

  it('rejects amounts above the $1M USD cap (MAX_AMOUNT_CENTS) with 400', async () => {
    // Code caps at MAX_AMOUNT_CENTS = 1_000_000_00 (100,000,000 cents = $1M).
    // The task spec said "> 100_000_00 (1M dollars)" but 100_000_00 is only
    // $100,000 in cents; the real API limit is 1_000_000_00.
    const { status, json } = await postCheckout({
      amountCents: 1_000_000_00 + 1,
      type: 'one_time',
      donorName: 'Whale',
      donorEmail: donorEmail(),
    });
    expect(status).toBe(400);
    expect(json.error ?? '').toMatch(/invalid/i);
  });

  it('attaches member_id when checkout is made as a logged-in member', async () => {
    const { pair } = await loginAndGetCookie(DEMO_EMAIL, DEMO_PASSWORD);
    const demoMemberId = await getDemoMemberId();

    const res = await fetch(`${BASE}/api/donations/checkout`, {
      method: 'POST',
      headers: testHeaders({ Cookie: pair }),
      body: JSON.stringify({
        amountCents: 7500,
        type: 'one_time',
        donorName: 'Demo Member',
        donorEmail: donorEmail(),
      }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as CheckoutResponse;
    expect(json.donationId).toBeTruthy();
    if (json.donationId) createdDonationIds.push(json.donationId);

    const row = await getDonationRow(json.donationId!);
    expect(row).toBeTruthy();
    expect(row!.member_id).toBe(demoMemberId);
  });

  it('leaves member_id null when checkout is anonymous', async () => {
    const { status, json } = await postCheckout({
      amountCents: 1000,
      type: 'one_time',
      donorName: 'Anon Donor',
      donorEmail: donorEmail(),
    });
    expect(status).toBe(200);
    expect(json.donationId).toBeTruthy();

    const row = await getDonationRow(json.donationId!);
    expect(row).toBeTruthy();
    expect(row!.member_id).toBeNull();
  });

  it('cleanup: row count for created donations resolves to zero after purge', async () => {
    // Sanity-check the cleanup machinery — we don't want to leave test rows.
    // Use a fresh, unique email so no other test's row can satisfy this.
    const email = `don-cleanup-${nanoid(6)}@test.local`;
    const { json } = await postCheckout({
      amountCents: 500,
      type: 'one_time',
      donorName: 'Cleanup Sentinel',
      donorEmail: email,
    });
    expect(json.donationId).toBeTruthy();

    await query(`DELETE FROM donations WHERE id = $1`, [json.donationId]);
    const after = await getDonationRow(json.donationId!);
    expect(after).toBeNull();

    // Remove from tracked list since we already deleted it.
    const idx = createdDonationIds.indexOf(json.donationId!);
    if (idx >= 0) createdDonationIds.splice(idx, 1);
  });
});

