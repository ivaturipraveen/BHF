// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { query } from '../../src/lib/db';
import {
  BASE,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  ensureServerReachable,
  loginAndGetCookie,
  testHeaders,
  qaEmail,
  deleteMemberByEmail,
} from './_helpers';

const optedOutEmail = qaEmail('qa-dir-out');
let optedOutId: string | null = null;
let demoId: string | null = null;
let cookie = '';

beforeAll(async () => {
  await ensureServerReachable();
  await deleteMemberByEmail(optedOutEmail);
  const hash = await bcrypt.hash('TestPass123!', 12);
  const rows = await query<{ id: string }>(
    `INSERT INTO members (
        email, password_hash, first_name, last_name,
        email_verified_at, directory_opt_in
      ) VALUES ($1, $2, $3, $4, now(), false)
      RETURNING id`,
    [optedOutEmail, hash, 'Hidden', 'Member'],
  );
  optedOutId = rows[0].id;

  const demoRows = await query<{ id: string }>(
    `SELECT id FROM members WHERE email = $1`,
    [DEMO_EMAIL],
  );
  demoId = demoRows[0].id;

  const { pair } = await loginAndGetCookie(DEMO_EMAIL, DEMO_PASSWORD);
  cookie = pair;
});

afterAll(async () => {
  await deleteMemberByEmail(optedOutEmail);
});

describe('Directory privacy projection', () => {
  it('GET /api/members returns the opted-in demo user with only public fields', async () => {
    const res = await fetch(`${BASE}/api/members?pageSize=50`, {
      headers: { ...testHeaders(), cookie },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      members?: Array<Record<string, unknown>>;
    };
    expect(Array.isArray(json.members)).toBe(true);

    const demo = json.members!.find((m) => m.id === demoId);
    expect(demo).toBeTruthy();
    // Allowed projection fields.
    expect(Object.keys(demo!).sort()).toEqual(
      ['bio', 'city', 'first_name', 'id', 'interests', 'last_name', 'photo_url'].sort(),
    );
    // Disallowed fields.
    expect(demo!.email).toBeUndefined();
    expect(demo!.phone).toBeUndefined();
    expect(demo!.password_hash).toBeUndefined();
  });

  it('GET /api/members/<demoId> returns the same projection', async () => {
    const res = await fetch(`${BASE}/api/members/${demoId}`, {
      headers: { ...testHeaders(), cookie },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { member?: Record<string, unknown> };
    expect(json.member).toBeTruthy();
    expect(Object.keys(json.member!).sort()).toEqual(
      ['bio', 'city', 'first_name', 'id', 'interests', 'last_name', 'photo_url'].sort(),
    );
    expect(json.member!.email).toBeUndefined();
  });

  it('GET /api/members/<optedOutId> returns 404', async () => {
    const res = await fetch(`${BASE}/api/members/${optedOutId}`, {
      headers: { ...testHeaders(), cookie },
    });
    expect(res.status).toBe(404);
  });
});
