// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import {
  BASE,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  ensureServerReachable,
  loginAndGetCookie,
  testHeaders,
} from '../auth/_helpers';

let cookie = '';

beforeAll(async () => {
  await ensureServerReachable();
  const { pair } = await loginAndGetCookie(DEMO_EMAIL, DEMO_PASSWORD);
  cookie = pair;
});

async function getPage(
  path: string,
  withCookie: boolean,
): Promise<{ status: number; location: string | null; body: string }> {
  const res = await fetch(`${BASE}${path}`, {
    redirect: 'manual',
    headers: withCookie
      ? { ...testHeaders(), cookie }
      : testHeaders(),
  });
  return {
    status: res.status,
    location: res.headers.get('location'),
    body: await res.text(),
  };
}

describe('Youth account pages', () => {
  it('GET /account/children without cookie → 307 to /login', async () => {
    const { status, location } = await getPage('/account/children', false);
    expect(status).toBe(307);
    expect(location ?? '').toMatch(/\/login(\?|$)/);
  });

  it('GET /account/children with cookie → 200, mentions "Children & enrollments" and "COPPA"', async () => {
    const { status, body } = await getPage('/account/children', true);
    expect(status).toBe(200);
    // React inserts <!-- --> markers around dynamic children; allow them between words.
    expect(body).toMatch(/Children\s*(?:<!--\s*-->)?\s*(?:&amp;|&)\s*(?:<!--\s*-->)?\s*enrollments/i);
    expect(body).toContain('COPPA');
  });

  it('GET /account/children/new with cookie → 200', async () => {
    const { status, body } = await getPage('/account/children/new', true);
    expect(status).toBe(200);
    expect(body.toLowerCase()).toContain('add a child');
  });

  it('GET /account/register-youth with cookie → 200', async () => {
    const { status, body } = await getPage('/account/register-youth', true);
    expect(status).toBe(200);
    expect(body.toLowerCase()).toMatch(/youth program|register/i);
  });

  it('GET /programs/writing-and-art-contest (logged in) → contains "Register your child"', async () => {
    const { status, body } = await getPage(
      '/programs/writing-and-art-contest',
      true,
    );
    expect(status).toBe(200);
    expect(body).toContain('Register your child');
  });

  it('GET /programs/yoga-meditation (logged in) → does NOT contain "Register your child"', async () => {
    const { status, body } = await getPage('/programs/yoga-meditation', true);
    expect(status).toBe(200);
    expect(body).not.toContain('Register your child');
  });
});
