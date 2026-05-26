// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { query } from '../../src/lib/db';
import {
  BASE,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  ensureServerReachable,
  testHeaders,
  loginAndGetCookie,
} from './_helpers';

let capturedResetToken: string | null = null;

beforeAll(async () => {
  await ensureServerReachable();
});

// Restore the demo user's password to its known state if anything went wrong.
afterAll(async () => {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 12);
  await query(
    `UPDATE members
        SET password_hash = $1,
            password_reset_token = NULL,
            password_reset_expires_at = NULL
      WHERE email = $2`,
    [hash, DEMO_EMAIL],
  );
});

describe('Password forgot/reset flow', () => {
  it('POST /api/auth/forgot-password returns a generic 200', async () => {
    const res = await fetch(`${BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: testHeaders(),
      body: JSON.stringify({ email: DEMO_EMAIL }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok?: boolean; message?: string };
    expect(json.ok).toBe(true);
    expect(json.message ?? '').toMatch(/reset link/i);
  });

  it('forgot-password sets a reset token with ~1h expiry', async () => {
    const rows = await query<{
      password_reset_token: string | null;
      password_reset_expires_at: Date | null;
    }>(
      `SELECT password_reset_token, password_reset_expires_at
         FROM members WHERE email = $1`,
      [DEMO_EMAIL],
    );
    expect(rows[0].password_reset_token).toBeTruthy();
    expect(rows[0].password_reset_expires_at).toBeTruthy();
    capturedResetToken = rows[0].password_reset_token;
    const expiresIn =
      (rows[0].password_reset_expires_at as Date).getTime() - Date.now();
    // Allow ample slack — should be roughly an hour out, between 50 and 70 min.
    expect(expiresIn).toBeGreaterThan(50 * 60 * 1000);
    expect(expiresIn).toBeLessThan(70 * 60 * 1000);
  });

  it('reset-password with the captured token succeeds and clears token/expiry', async () => {
    expect(capturedResetToken).toBeTruthy();
    const res = await fetch(`${BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: testHeaders(),
      body: JSON.stringify({
        email: DEMO_EMAIL,
        token: capturedResetToken,
        password: 'NewDemoPass456!',
      }),
    });
    expect(res.status).toBe(200);
    const rows = await query<{
      password_reset_token: string | null;
      password_reset_expires_at: Date | null;
    }>(
      `SELECT password_reset_token, password_reset_expires_at
         FROM members WHERE email = $1`,
      [DEMO_EMAIL],
    );
    expect(rows[0].password_reset_token).toBeNull();
    expect(rows[0].password_reset_expires_at).toBeNull();
  });

  it('login succeeds with the NEW password, then restore demo password', async () => {
    const { pair } = await loginAndGetCookie(DEMO_EMAIL, 'NewDemoPass456!');
    expect(pair).toContain('bhf_session=');
    // Reset back to the canonical demo password so other tests still work.
    const hash = await bcrypt.hash(DEMO_PASSWORD, 12);
    await query(`UPDATE members SET password_hash = $1 WHERE email = $2`, [
      hash,
      DEMO_EMAIL,
    ]);
    // Sanity: login again with the restored password.
    const { pair: pair2 } = await loginAndGetCookie(DEMO_EMAIL, DEMO_PASSWORD);
    expect(pair2).toContain('bhf_session=');
  });

  it('reset-password with an invalid token returns 400', async () => {
    const res = await fetch(`${BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: testHeaders(),
      body: JSON.stringify({
        email: DEMO_EMAIL,
        token: 'invalid-token-that-does-not-exist-1234567890',
        password: 'NewDemoPass789!',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('reset-password with an expired token returns 400', async () => {
    // Trigger a new forgot to get a real token, then backdate its expiry.
    const forgot = await fetch(`${BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: testHeaders(),
      body: JSON.stringify({ email: DEMO_EMAIL }),
    });
    expect(forgot.status).toBe(200);

    const rows = await query<{ password_reset_token: string | null }>(
      `SELECT password_reset_token FROM members WHERE email = $1`,
      [DEMO_EMAIL],
    );
    const tok = rows[0].password_reset_token;
    expect(tok).toBeTruthy();
    await query(
      `UPDATE members
          SET password_reset_expires_at = now() - interval '1 minute'
        WHERE email = $1`,
      [DEMO_EMAIL],
    );

    const res = await fetch(`${BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: testHeaders(),
      body: JSON.stringify({
        email: DEMO_EMAIL,
        token: tok,
        password: 'AnotherTry111!',
      }),
    });
    expect(res.status).toBe(400);

    // Clean up: clear the expired token so subsequent test runs start clean.
    await query(
      `UPDATE members
          SET password_reset_token = NULL,
              password_reset_expires_at = NULL
        WHERE email = $1`,
      [DEMO_EMAIL],
    );
  });
});
