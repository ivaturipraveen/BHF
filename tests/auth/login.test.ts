// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { query } from '../../src/lib/db';
import {
  BASE,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  ensureServerReachable,
  qaEmail,
  testHeaders,
  getSessionSetCookie,
  deleteMemberByEmail,
} from './_helpers';

const unverifiedEmail = qaEmail('qa-login-unv');
const suspendedEmail = qaEmail('qa-login-susp');

beforeAll(async () => {
  await ensureServerReachable();
  await deleteMemberByEmail(unverifiedEmail);
  await deleteMemberByEmail(suspendedEmail);
});

afterAll(async () => {
  await deleteMemberByEmail(unverifiedEmail);
  await deleteMemberByEmail(suspendedEmail);
});

describe('POST /api/auth/login', () => {
  it('rejects a wrong password with a generic 401', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      redirect: 'manual',
      headers: testHeaders(),
      body: JSON.stringify({
        email: DEMO_EMAIL,
        password: 'definitely-wrong-password',
      }),
    });
    expect(res.status).toBe(401);
    const json = (await res.json()) as { error?: string };
    expect(json.error ?? '').toMatch(/invalid/i);
  });

  it('accepts the demo credentials and issues an HttpOnly SameSite=lax cookie', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      redirect: 'manual',
      headers: testHeaders(),
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    });
    expect(res.status).toBe(200);
    const setCookie = getSessionSetCookie(res);
    expect(setCookie).toBeTruthy();
    expect(setCookie!).toMatch(/^bhf_session=/);
    expect(setCookie!).toMatch(/HttpOnly/i);
    expect(setCookie!).toMatch(/SameSite=lax/i);
  });

  it('refuses to log in an unverified member with a 403', async () => {
    const hash = await bcrypt.hash('TestPass123!', 12);
    await query(
      `INSERT INTO members (email, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4)`,
      [unverifiedEmail, hash, 'QA', 'Unverified'],
    );
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      redirect: 'manual',
      headers: testHeaders(),
      body: JSON.stringify({
        email: unverifiedEmail,
        password: 'TestPass123!',
      }),
    });
    expect(res.status).toBe(403);
    const json = (await res.json()) as { error?: string };
    expect(json.error ?? '').toMatch(/verify/i);
  });

  it('refuses to log in a suspended member with a 403', async () => {
    const hash = await bcrypt.hash('TestPass123!', 12);
    await query(
      `INSERT INTO members (
          email, password_hash, first_name, last_name,
          email_verified_at, suspended_at
        ) VALUES ($1, $2, $3, $4, now(), now())`,
      [suspendedEmail, hash, 'QA', 'Suspended'],
    );
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      redirect: 'manual',
      headers: testHeaders(),
      body: JSON.stringify({
        email: suspendedEmail,
        password: 'TestPass123!',
      }),
    });
    expect(res.status).toBe(403);
    const json = (await res.json()) as { error?: string };
    expect(json.error ?? '').toMatch(/suspend/i);
  });
});
