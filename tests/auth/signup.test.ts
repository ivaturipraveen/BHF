// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { query } from '../../src/lib/db';
import {
  BASE,
  ensureServerReachable,
  qaEmail,
  testHeaders,
  deleteMemberByEmail,
} from './_helpers';

const email = qaEmail('qa-signup');
const validBody = {
  email,
  password: 'TestPass123!',
  firstName: 'QA',
  lastName: 'Signup',
};

beforeAll(async () => {
  await ensureServerReachable();
  // Make sure no leftover row exists from a prior aborted run.
  await deleteMemberByEmail(email);
});

afterAll(async () => {
  await deleteMemberByEmail(email);
});

describe('POST /api/auth/signup → email verify flow', () => {
  let capturedToken: string | null = null;

  it('signup succeeds with a generic 200 + check-your-email message', async () => {
    const res = await fetch(`${BASE}/api/auth/signup`, {
      method: 'POST',
      headers: testHeaders(),
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok?: boolean; message?: string };
    expect(json.ok).toBe(true);
    expect(json.message ?? '').toMatch(/check your email/i);
  });

  it('inserts a members row with email_verified_at NULL and a token set', async () => {
    const rows = await query<{
      id: string;
      email_verified_at: Date | null;
      email_verification_token: string | null;
    }>(
      `SELECT id, email_verified_at, email_verification_token
         FROM members WHERE email = $1`,
      [email],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].email_verified_at).toBeNull();
    expect(rows[0].email_verification_token).toBeTruthy();
    capturedToken = rows[0].email_verification_token;
  });

  it('writes a verify-kind email_log entry to the new address', async () => {
    const rows = await query<{ kind: string; to_email: string }>(
      `SELECT kind, to_email FROM email_log
        WHERE to_email = $1 AND kind = 'verify'
        ORDER BY created_at DESC LIMIT 1`,
      [email],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].to_email).toBe(email);
  });

  it('GET /api/auth/verify?token=...&email=... redirects 302 to /login?verified=1', async () => {
    expect(capturedToken).toBeTruthy();
    const url =
      `${BASE}/api/auth/verify?token=${encodeURIComponent(capturedToken!)}` +
      `&email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { redirect: 'manual', headers: testHeaders() });
    expect(res.status).toBe(302);
    const loc = res.headers.get('location') ?? '';
    expect(loc).toContain('/login?verified=1');
  });

  it('verification flips email_verified_at and clears the token', async () => {
    const rows = await query<{
      email_verified_at: Date | null;
      email_verification_token: string | null;
    }>(
      `SELECT email_verified_at, email_verification_token
         FROM members WHERE email = $1`,
      [email],
    );
    expect(rows[0].email_verified_at).not.toBeNull();
    expect(rows[0].email_verification_token).toBeNull();
  });

  it('verification triggers a welcome email_log entry', async () => {
    const rows = await query<{ kind: string }>(
      `SELECT kind FROM email_log
        WHERE to_email = $1 AND kind = 'welcome'`,
      [email],
    );
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it('duplicate signup with the same email is silently no-op (no enumeration)', async () => {
    const res = await fetch(`${BASE}/api/auth/signup`, {
      method: 'POST',
      headers: testHeaders(),
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok?: boolean; message?: string };
    expect(json.ok).toBe(true);
    expect(json.message ?? '').toMatch(/check your email/i);

    const rows = await query<{ id: string }>(
      `SELECT id FROM members WHERE email = $1`,
      [email],
    );
    expect(rows).toHaveLength(1);
  });
});
