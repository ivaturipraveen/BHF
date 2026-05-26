// Shared helpers for Phase 4 auth integration tests.
// All tests in this directory run in node env against the live Next.js server
// at http://localhost:3000 and a real Postgres connection.

import { query } from '../../src/lib/db';

export const BASE = 'http://localhost:3000';

export const DEMO_EMAIL = 'demo@bhfcommunity.org';
export const DEMO_PASSWORD = 'DemoUser123!';

// Generates a short random identifier (alphanumeric) used to namespace
// throwaway accounts so they're easy to grep + purge.
export function nanoid(len: number = 10): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

// TRUST_PROXY=1 is set in the test env, so the API honors x-forwarded-for as
// the rate-limit subject. Tests use a unique synthetic IP per request to avoid
// tripping the 5/min auth limiters when multiple tests run back-to-back.
let ipCounter = 0;
export function uniqueTestIp(): string {
  ipCounter = (ipCounter + 1) % 250;
  return `10.250.${Math.floor(Math.random() * 250)}.${ipCounter + 1}`;
}

export function testHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-forwarded-for': uniqueTestIp(),
    ...(extra ?? {}),
  };
}

export function qaEmail(prefix = 'qa'): string {
  return `${prefix}-${nanoid(10)}@test.local`;
}

// Extract a single Set-Cookie value's `name=value` portion. Returns the entire
// cookie header (with attributes) for assertions, plus the bare `name=value`
// pair suitable for resending on subsequent requests.
export function parseSetCookie(setCookie: string | null): {
  raw: string;
  pair: string;
} | null {
  if (!setCookie) return null;
  const firstAttr = setCookie.split(';')[0];
  return { raw: setCookie, pair: firstAttr };
}

// Pull the first matching Set-Cookie for our session cookie out of a Response.
// fetch's Headers#get coalesces multiple Set-Cookie values, so we work with the
// raw underlying header through getSetCookie() if available, otherwise fall
// back to .get('set-cookie').
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
  // Some environments concatenate cookies with ", " — split conservatively.
  const parts = single.split(/,\s*(?=[A-Za-z0-9_\-]+=)/);
  return parts.find((p) => p.startsWith('bhf_session=')) ?? null;
}

// Log in to /api/auth/login and return the `bhf_session=...` cookie pair plus
// the full Set-Cookie header for attribute checks.
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

// Force an account to a "verified" state for tests that need to bypass the
// email round-trip. Returns the inserted member id.
export async function createVerifiedMember(opts: {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  directoryOptIn?: boolean;
}): Promise<string> {
  const rows = await query<{ id: string }>(
    `INSERT INTO members (
        email, password_hash, first_name, last_name,
        directory_opt_in, email_verified_at
      ) VALUES ($1, $2, $3, $4, $5, now())
      RETURNING id`,
    [
      opts.email,
      opts.passwordHash,
      opts.firstName ?? 'QA',
      opts.lastName ?? 'Tester',
      opts.directoryOptIn ?? false,
    ],
  );
  return rows[0].id;
}

export async function deleteMemberByEmail(email: string): Promise<void> {
  await query(`DELETE FROM email_log WHERE to_email = $1`, [email]);
  await query(`DELETE FROM members WHERE email = $1`, [email]);
}

export async function ensureServerReachable(): Promise<void> {
  const res = await fetch(BASE);
  if (!res.ok) {
    throw new Error(`Next.js server at ${BASE} responded ${res.status}`);
  }
}
