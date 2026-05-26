// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { query } from '../../src/lib/db';
import {
  BASE,
  computeAccessToken,
  donorEmail,
  ensureServerReachable,
  loginAndGetCookie,
  nanoid,
  testHeaders,
} from './_helpers';

const ownerEmail = `qa-don-owner-${nanoid(8)}@test.local`;
const otherEmail = `qa-don-other-${nanoid(8)}@test.local`;
const ownerPassword = 'OwnerPass123!';
const otherPassword = 'OtherPass123!';

const createdDonationIds: string[] = [];

interface CheckoutResponse {
  mode?: string;
  donationId?: string;
  successUrl?: string;
  error?: string;
}

async function makeStubDonation(opts: {
  cookie?: string;
  amountCents?: number;
  type?: 'one_time' | 'monthly';
}): Promise<string> {
  const headers: Record<string, string> = {};
  if (opts.cookie) headers.Cookie = opts.cookie;
  const res = await fetch(`${BASE}/api/donations/checkout`, {
    method: 'POST',
    headers: testHeaders(headers),
    body: JSON.stringify({
      amountCents: opts.amountCents ?? 2500,
      type: opts.type ?? 'one_time',
      donorName: 'Access Test',
      donorEmail: donorEmail(),
    }),
  });
  const json = (await res.json()) as CheckoutResponse;
  if (!json.donationId) {
    throw new Error(`checkout returned no donationId: ${JSON.stringify(json)}`);
  }
  createdDonationIds.push(json.donationId);
  return json.donationId;
}

beforeAll(async () => {
  await ensureServerReachable();
  const hash = await bcrypt.hash(ownerPassword, 10);
  const otherHash = await bcrypt.hash(otherPassword, 10);
  await query(`DELETE FROM members WHERE email IN ($1, $2)`, [
    ownerEmail,
    otherEmail,
  ]);
  await query(
    `INSERT INTO members (email, password_hash, first_name, last_name, email_verified_at)
       VALUES ($1, $2, $3, $4, now())`,
    [ownerEmail, hash, 'Donation', 'Owner'],
  );
  await query(
    `INSERT INTO members (email, password_hash, first_name, last_name, email_verified_at)
       VALUES ($1, $2, $3, $4, now())`,
    [otherEmail, otherHash, 'Donation', 'Other'],
  );
});

afterAll(async () => {
  if (createdDonationIds.length > 0) {
    await query(`DELETE FROM donations WHERE id = ANY($1::uuid[])`, [
      createdDonationIds,
    ]);
  }
  for (const email of [ownerEmail, otherEmail]) {
    await query(`DELETE FROM email_log WHERE to_email = $1`, [email]);
    await query(`DELETE FROM donations WHERE donor_email = $1`, [email]);
    await query(`DELETE FROM members WHERE email = $1`, [email]);
  }
});

describe('GET /api/donations/[id] (token + member access)', () => {
  it('returns 401 when neither token nor session is provided', async () => {
    const id = await makeStubDonation({});
    const res = await fetch(`${BASE}/api/donations/${id}`, {
      method: 'GET',
      headers: testHeaders(),
    });
    expect(res.status).toBe(401);
    const json = (await res.json()) as { error?: string };
    expect(json.error ?? '').toMatch(/not found|denied/i);
  });

  it('returns 200 with the donation when the correct HMAC token is provided', async () => {
    const id = await makeStubDonation({});
    const token = computeAccessToken(id);
    const res = await fetch(`${BASE}/api/donations/${id}?token=${token}`, {
      method: 'GET',
      headers: testHeaders(),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { id?: string; amountCents?: number };
    expect(json.id).toBe(id);
    expect(json.amountCents).toBe(2500);
  });

  it('returns 401 when an incorrect token is provided', async () => {
    const id = await makeStubDonation({});
    const wrong = 'a'.repeat(64);
    const res = await fetch(`${BASE}/api/donations/${id}?token=${wrong}`, {
      method: 'GET',
      headers: testHeaders(),
    });
    expect(res.status).toBe(401);
  });

  it('token must be HMAC-derived — passing the bare id as the token must fail', async () => {
    const id = await makeStubDonation({});
    const res = await fetch(`${BASE}/api/donations/${id}?token=${id}`, {
      method: 'GET',
      headers: testHeaders(),
    });
    expect(res.status).toBe(401);
    // And the real token must NOT equal the id.
    expect(computeAccessToken(id)).not.toBe(id);
    // It must be 64 hex chars (sha256 hex digest).
    expect(computeAccessToken(id)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns 200 for the owning member without a token', async () => {
    const { pair } = await loginAndGetCookie(ownerEmail, ownerPassword);
    const id = await makeStubDonation({ cookie: pair });

    const res = await fetch(`${BASE}/api/donations/${id}`, {
      method: 'GET',
      headers: testHeaders({ Cookie: pair }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { id?: string };
    expect(json.id).toBe(id);
  });

  it('returns 401 when a different logged-in member tries to access without a token', async () => {
    const { pair: ownerCookie } = await loginAndGetCookie(
      ownerEmail,
      ownerPassword,
    );
    const id = await makeStubDonation({ cookie: ownerCookie });

    const { pair: otherCookie } = await loginAndGetCookie(
      otherEmail,
      otherPassword,
    );
    const res = await fetch(`${BASE}/api/donations/${id}`, {
      method: 'GET',
      headers: testHeaders({ Cookie: otherCookie }),
    });
    expect(res.status).toBe(401);
  });
});
