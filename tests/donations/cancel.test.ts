// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { query } from '../../src/lib/db';
import {
  BASE,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  donorEmail,
  ensureServerReachable,
  getDonationRow,
  loginAndGetCookie,
  nanoid,
  testHeaders,
} from './_helpers';

const otherEmail = `qa-don-cancel-other-${nanoid(8)}@test.local`;
const otherPassword = 'OtherCancel123!';

const createdDonationIds: string[] = [];

interface CheckoutResponse {
  mode?: string;
  donationId?: string;
}

async function makeStubDonation(opts: {
  cookie?: string;
  type?: 'one_time' | 'monthly';
}): Promise<string> {
  const headers: Record<string, string> = {};
  if (opts.cookie) headers.Cookie = opts.cookie;
  const res = await fetch(`${BASE}/api/donations/checkout`, {
    method: 'POST',
    headers: testHeaders(headers),
    body: JSON.stringify({
      amountCents: 5000,
      type: opts.type ?? 'monthly',
      donorName: 'Cancel Test',
      donorEmail: donorEmail(),
    }),
  });
  const json = (await res.json()) as CheckoutResponse;
  if (!json.donationId) {
    throw new Error(`checkout failed: ${JSON.stringify(json)}`);
  }
  createdDonationIds.push(json.donationId);
  return json.donationId;
}

beforeAll(async () => {
  await ensureServerReachable();
  const hash = await bcrypt.hash(otherPassword, 10);
  await query(`DELETE FROM members WHERE email = $1`, [otherEmail]);
  await query(
    `INSERT INTO members (email, password_hash, first_name, last_name, email_verified_at)
       VALUES ($1, $2, $3, $4, now())`,
    [otherEmail, hash, 'Cancel', 'Other'],
  );
});

afterAll(async () => {
  if (createdDonationIds.length > 0) {
    await query(`DELETE FROM donations WHERE id = ANY($1::uuid[])`, [
      createdDonationIds,
    ]);
  }
  await query(`DELETE FROM email_log WHERE to_email = $1`, [otherEmail]);
  await query(`DELETE FROM donations WHERE donor_email = $1`, [otherEmail]);
  await query(`DELETE FROM members WHERE email = $1`, [otherEmail]);
});

describe('POST /api/donations/me/[id]/cancel', () => {
  it('cancels an owned monthly donation and marks status=canceled', async () => {
    const { pair } = await loginAndGetCookie(DEMO_EMAIL, DEMO_PASSWORD);
    const id = await makeStubDonation({ cookie: pair, type: 'monthly' });

    const res = await fetch(`${BASE}/api/donations/me/${id}/cancel`, {
      method: 'POST',
      headers: testHeaders({ Cookie: pair }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok?: boolean };
    expect(json.ok).toBe(true);

    const row = await getDonationRow(id);
    expect(row).toBeTruthy();
    expect(row!.status).toBe('canceled');
  });

  it("refuses to cancel another member's donation with 403 or 404", async () => {
    const { pair: demoCookie } = await loginAndGetCookie(
      DEMO_EMAIL,
      DEMO_PASSWORD,
    );
    const id = await makeStubDonation({ cookie: demoCookie, type: 'monthly' });

    const { pair: otherCookie } = await loginAndGetCookie(
      otherEmail,
      otherPassword,
    );
    const res = await fetch(`${BASE}/api/donations/me/${id}/cancel`, {
      method: 'POST',
      headers: testHeaders({ Cookie: otherCookie }),
    });
    expect([403, 404]).toContain(res.status);

    const row = await getDonationRow(id);
    expect(row!.status).not.toBe('canceled');
  });

  it('refuses to cancel a one_time donation with 400', async () => {
    const { pair } = await loginAndGetCookie(DEMO_EMAIL, DEMO_PASSWORD);
    const id = await makeStubDonation({ cookie: pair, type: 'one_time' });

    const res = await fetch(`${BASE}/api/donations/me/${id}/cancel`, {
      method: 'POST',
      headers: testHeaders({ Cookie: pair }),
    });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(json.error ?? '').toMatch(/recurring|cancel/i);

    const row = await getDonationRow(id);
    expect(row!.status).not.toBe('canceled');
  });
});
