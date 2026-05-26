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

describe('Account page guards (middleware + page-level)', () => {
  it('GET /account without cookie → 307 to /login?next=%2Faccount', async () => {
    const { status, location } = await getPage('/account', false);
    expect(status).toBe(307);
    expect(location ?? '').toMatch(/\/login\?next=%2Faccount/);
  });

  it('GET /account with cookie → 200, greets the demo user', async () => {
    const { status, body } = await getPage('/account', true);
    expect(status).toBe(200);
    // React inserts an HTML comment between static text and a dynamic expression,
    // so the rendered markup looks like: Namaste, <!-- -->Demo.
    expect(body).toMatch(/Namaste,\s*(?:<!--\s*-->)?\s*Demo/i);
  });

  it('GET /account/directory with cookie → 200, mentions "directory"', async () => {
    const { status, body } = await getPage('/account/directory', true);
    expect(status).toBe(200);
    expect(body.toLowerCase()).toContain('directory');
  });

  it('GET /account/donations with cookie → 200, mentions "donation" or "history"', async () => {
    const { status, body } = await getPage('/account/donations', true);
    expect(status).toBe(200);
    const lower = body.toLowerCase();
    expect(lower.includes('history') || lower.includes('donation')).toBe(true);
  });

  it('GET /account/library with cookie → 200, mentions "library" or "content"', async () => {
    const { status, body } = await getPage('/account/library', true);
    expect(status).toBe(200);
    const lower = body.toLowerCase();
    expect(lower.includes('library') || lower.includes('content')).toBe(true);
  });

  it('GET /account/profile with cookie → 200, mentions "Profile"', async () => {
    const { status, body } = await getPage('/account/profile', true);
    expect(status).toBe(200);
    expect(body).toMatch(/Profile/);
  });

  it('GET /account/children with cookie → 200, renders the children dashboard', async () => {
    const { status, body } = await getPage('/account/children', true);
    expect(status).toBe(200);
    expect(body).toContain('COPPA');
  });

  it('GET /login with an authenticated cookie → 307 to /account', async () => {
    const { status, location } = await getPage('/login', true);
    expect(status).toBe(307);
    expect(location ?? '').toMatch(/\/account(\b|\?)/);
  });

  it('GET /join with an authenticated cookie → 307 to /account', async () => {
    const { status, location } = await getPage('/join', true);
    expect(status).toBe(307);
    expect(location ?? '').toMatch(/\/account(\b|\?)/);
  });
});
