// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { query, pool } from '@/lib/db';

const BASE = 'http://localhost:3000';

// Each request from this file uses a unique synthetic IP so the in-memory
// per-IP rate limiters (newsletter, auth) don't bleed state into other suites
// or between regression assertions.
let ipCounter = 0;
function uniqueIp(): string {
  ipCounter = (ipCounter + 1) % 250;
  return `10.44.${Math.floor(Math.random() * 250)}.${ipCounter + 1}`;
}

function getSessionCookie(res: Response): string | null {
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

beforeAll(async () => {
  try {
    const res = await fetch(BASE, { headers: { 'x-forwarded-for': uniqueIp() } });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
  } catch (err) {
    throw new Error(
      `Live Next.js server is not reachable at ${BASE}. (${(err as Error).message})`,
    );
  }
});

afterAll(async () => {
  // The forms test owns pool.end() too — vitest isolates env per file, so this
  // file's pool is independent and we close it here to avoid open handles.
  await pool.end().catch(() => undefined);
});

describe('Phase 8 — regression: security headers did not break happy paths', () => {
  it('GET / returns 200 with "Bharatiya" in the body', async () => {
    const res = await fetch(`${BASE}/`, {
      headers: { 'x-forwarded-for': uniqueIp() },
    });
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain('Bharatiya');
  });

  it('POST /api/newsletter accepts a valid email', async () => {
    const email = `reg-nl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`;
    const res = await fetch(`${BASE}/api/newsletter`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': uniqueIp(),
      },
      body: JSON.stringify({ email }),
    });
    const json = (await res.json()) as { ok?: boolean };
    // Clean up before assertions so a failure does not leak a row.
    await query(`DELETE FROM newsletter_subscribers WHERE email = $1`, [email]);
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
  });

  it('POST /api/auth/login (demo user) returns 200 and sets bhf_session cookie', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': uniqueIp(),
      },
      body: JSON.stringify({
        email: 'demo@bhfcommunity.org',
        password: 'DemoUser123!',
      }),
    });
    expect(res.status).toBe(200);
    const setCookie = getSessionCookie(res);
    expect(setCookie).toBeTruthy();
    expect(setCookie!).toMatch(/^bhf_session=/);
    expect(setCookie!).toMatch(/HttpOnly/i);
  });

  it('GET /api/me with the demo cookie returns the member profile', async () => {
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': uniqueIp(),
      },
      body: JSON.stringify({
        email: 'demo@bhfcommunity.org',
        password: 'DemoUser123!',
      }),
    });
    expect(loginRes.status).toBe(200);
    const raw = getSessionCookie(loginRes);
    expect(raw).toBeTruthy();
    const cookiePair = raw!.split(';')[0];

    const meRes = await fetch(`${BASE}/api/me`, {
      headers: {
        cookie: cookiePair,
        'x-forwarded-for': uniqueIp(),
      },
    });
    expect(meRes.status).toBe(200);
    const me = (await meRes.json()) as { member?: { email?: string } };
    expect(me.member?.email).toBe('demo@bhfcommunity.org');
  });

  it('GET /admin/login returns 200', async () => {
    const res = await fetch(`${BASE}/admin/login`, {
      headers: { 'x-forwarded-for': uniqueIp() },
    });
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body.toLowerCase()).toContain('sign in');
  });
});
