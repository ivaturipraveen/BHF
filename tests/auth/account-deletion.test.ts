// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { query } from '../../src/lib/db';
import {
  BASE,
  ensureServerReachable,
  qaEmail,
  testHeaders,
  loginAndGetCookie,
  deleteMemberByEmail,
  getSessionSetCookie,
} from './_helpers';

const email = qaEmail('qa-del');
const password = 'TestPass123!';
let memberId: string | null = null;
let donationId: string | null = null;
let memberCookiePair: string | null = null;

beforeAll(async () => {
  await ensureServerReachable();
  await deleteMemberByEmail(email);

  // Signup via the real endpoint, then mark verified directly so we can log in.
  const signupRes = await fetch(`${BASE}/api/auth/signup`, {
    method: 'POST',
    headers: testHeaders(),
    body: JSON.stringify({
      email,
      password,
      firstName: 'QA',
      lastName: 'Delete',
    }),
  });
  expect(signupRes.status).toBe(200);
  await query(
    `UPDATE members SET email_verified_at = now(),
                        email_verification_token = NULL
      WHERE email = $1`,
    [email],
  );
  const idRow = await query<{ id: string }>(
    `SELECT id FROM members WHERE email = $1`,
    [email],
  );
  memberId = idRow[0].id;
});

afterAll(async () => {
  if (donationId) {
    await query(`DELETE FROM donations WHERE id = $1`, [donationId]);
  }
  await deleteMemberByEmail(email);
});

describe('DELETE /api/me — account deletion preserves donations', () => {
  it('logs in and seeds a $5 succeeded donation tied to the member', async () => {
    const { pair } = await loginAndGetCookie(email, password);
    memberCookiePair = pair;
    expect(memberId).toBeTruthy();
    const rows = await query<{ id: string }>(
      `INSERT INTO donations (
          member_id, amount_cents, currency, type, status,
          donor_name, donor_email
        ) VALUES ($1, $2, 'usd', 'one_time', 'succeeded', $3, $4)
        RETURNING id`,
      [memberId, 500, 'QA Delete', email],
    );
    donationId = rows[0].id;
    expect(donationId).toBeTruthy();
  });

  it('DELETE /api/me removes the member and clears the session cookie', async () => {
    expect(memberCookiePair).toBeTruthy();
    const res = await fetch(`${BASE}/api/me`, {
      method: 'DELETE',
      headers: { ...testHeaders(), cookie: memberCookiePair! },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok?: boolean; deleted?: boolean };
    expect(json.ok).toBe(true);
    expect(json.deleted).toBe(true);

    // The response should also clear the session cookie (Set-Cookie with empty/expiry).
    const cleared = getSessionSetCookie(res);
    expect(cleared).toBeTruthy();

    const rows = await query<{ id: string }>(
      `SELECT id FROM members WHERE id = $1`,
      [memberId],
    );
    expect(rows).toHaveLength(0);
  });

  it('the donation row survives with member_id nulled out', async () => {
    const rows = await query<{
      id: string;
      member_id: string | null;
      amount_cents: number;
    }>(`SELECT id, member_id, amount_cents FROM donations WHERE id = $1`, [
      donationId,
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].member_id).toBeNull();
    expect(rows[0].amount_cents).toBe(500);
  });

  it('GET /api/me without the cleared cookie returns 401', async () => {
    // After DELETE /api/me responds with a Set-Cookie that clears bhf_session,
    // a real browser would not send the cookie on the next request — simulate
    // that by issuing /api/me without the cookie.
    const res = await fetch(`${BASE}/api/me`, { headers: testHeaders() });
    expect(res.status).toBe(401);
  });
});
