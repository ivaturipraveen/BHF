// Shared helpers for Phase 3 donation integration tests.
// Tests run in node env against the live Next.js server at http://localhost:3000
// and a real Postgres connection. STRIPE_ENABLED=false (stub mode).

import { createHmac } from 'crypto';
import { query } from '../../src/lib/db';

export const BASE = 'http://localhost:3000';

export const DEMO_EMAIL = 'demo@bhfcommunity.org';
export const DEMO_PASSWORD = 'DemoUser123!';

export function nanoid(len: number = 10): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

// TRUST_PROXY=1 honors x-forwarded-for as the rate-limit subject. Each request
// gets a unique synthetic IP so back-to-back donation requests don't trip the
// 10/min limiter.
let ipCounter = 0;
export function uniqueTestIp(): string {
  ipCounter = (ipCounter + 1) % 250;
  return `10.240.${Math.floor(Math.random() * 250)}.${ipCounter + 1}`;
}

export function testHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-forwarded-for': uniqueTestIp(),
    ...(extra ?? {}),
  };
}

export function donorEmail(): string {
  return `don-${nanoid(10)}@test.local`;
}

export function getSessionSetCookie(res: Response): string | null {
  const anyHeaders = res.headers as unknown as {
    getSetCookie?: () => string[];
  };
  if (typeof anyHeaders.getSetCookie === 'function') {
    const all = anyHeaders.getSetCookie();
    return all.find((h) => h.startsWith('bhf_session=')) ?? null;
  }
  const single = res.headers.get('set-cookie');
  if (!single) return null;
  const parts = single.split(/,\s*(?=[A-Za-z0-9_\-]+=)/);
  return parts.find((p) => p.startsWith('bhf_session=')) ?? null;
}

export async function loginAndGetCookie(
  email: string,
  password: string,
): Promise<{ pair: string; raw: string }> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    redirect: 'manual',
    headers: testHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (res.status !== 200) {
    const body = await res.text();
    throw new Error(`login failed: ${res.status} ${body}`);
  }
  const raw = getSessionSetCookie(res);
  if (!raw) throw new Error('login response missing bhf_session Set-Cookie');
  const pair = raw.split(';')[0];
  return { pair, raw };
}

export async function ensureServerReachable(): Promise<void> {
  const res = await fetch(BASE);
  if (!res.ok) {
    throw new Error(`Next.js server at ${BASE} responded ${res.status}`);
  }
}

// Mirrors src/lib/queries/donations.ts:computeAccessToken so tests can build
// valid tokens (and intentionally invalid ones).
export function computeAccessToken(donationId: string): string {
  const secret = process.env.JWT_SECRET ?? '';
  return createHmac('sha256', secret).update(donationId).digest('hex');
}

export async function deleteDonation(id: string): Promise<void> {
  await query(`DELETE FROM donations WHERE id = $1`, [id]);
}

export async function deleteDonationsByEmail(email: string): Promise<void> {
  await query(`DELETE FROM email_log WHERE to_email = $1`, [email]);
  await query(`DELETE FROM donations WHERE donor_email = $1`, [email]);
}

export async function getDonationRow(id: string): Promise<{
  id: string;
  member_id: string | null;
  amount_cents: number;
  type: string;
  status: string;
  donor_email: string;
  donor_name: string;
} | null> {
  const rows = await query<{
    id: string;
    member_id: string | null;
    amount_cents: number;
    type: string;
    status: string;
    donor_email: string;
    donor_name: string;
  }>(
    `SELECT id, member_id, amount_cents, type, status, donor_email, donor_name
       FROM donations WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function getDemoMemberId(): Promise<string> {
  const rows = await query<{ id: string }>(
    `SELECT id FROM members WHERE email = $1 LIMIT 1`,
    [DEMO_EMAIL],
  );
  if (rows.length === 0) {
    throw new Error(`demo member ${DEMO_EMAIL} not found`);
  }
  return rows[0].id;
}
