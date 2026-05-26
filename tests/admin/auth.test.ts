// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import {
  BASE,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  adminLogin,
  ensureServerReachable,
  findSetCookie,
  uniqueTestIp,
} from './_helpers';

beforeAll(async () => {
  await ensureServerReachable();
});

describe('POST /api/admin/auth/login', () => {
  it('rejects a wrong password with a generic 401', async () => {
    const res = await fetch(`${BASE}/api/admin/auth/login`, {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': uniqueTestIp(),
      },
      body: JSON.stringify({
        email: DEFAULT_ADMIN_EMAIL,
        password: 'definitely-the-wrong-password',
      }),
    });
    expect(res.status).toBe(401);
    const json = (await res.json()) as { error?: string };
    expect(json.error ?? '').toMatch(/invalid/i);
  });

  it('accepts the correct credentials and issues bhf_admin + bhf_csrf cookies', async () => {
    const res = await fetch(`${BASE}/api/admin/auth/login`, {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': uniqueTestIp(),
      },
      body: JSON.stringify({
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
      }),
    });
    expect(res.status).toBe(200);

    const adminCookie = findSetCookie(res, 'bhf_admin');
    expect(adminCookie, 'expected Set-Cookie: bhf_admin').toBeTruthy();
    expect(adminCookie!).toMatch(/HttpOnly/i);
    expect(adminCookie!).toMatch(/SameSite=strict/i);
    if (process.env.NODE_ENV === 'production') {
      expect(adminCookie!).toMatch(/Secure/i);
    }

    const csrfCookie = findSetCookie(res, 'bhf_csrf');
    expect(csrfCookie, 'expected Set-Cookie: bhf_csrf').toBeTruthy();
    // bhf_csrf is intentionally NOT HttpOnly (JS reads it for double-submit)
    expect(csrfCookie!).not.toMatch(/HttpOnly/i);
    expect(csrfCookie!).toMatch(/SameSite=strict/i);

    const body = (await res.json()) as {
      ok: boolean;
      csrfToken: string;
      admin: { role: string };
    };
    expect(body.ok).toBe(true);
    expect(body.csrfToken).toBeTruthy();
    expect(body.admin.role).toBe('super_admin');
  });
});

describe('GET /api/admin/auth/me', () => {
  it('returns 401 without an admin cookie', async () => {
    const res = await fetch(`${BASE}/api/admin/auth/me`, {
      headers: { 'x-forwarded-for': uniqueTestIp() },
    });
    expect(res.status).toBe(401);
  });

  it('returns 200 with role=super_admin when authenticated', async () => {
    const ctx = await adminLogin();
    const res = await fetch(`${BASE}/api/admin/auth/me`, {
      headers: {
        cookie: ctx.cookies,
        'x-forwarded-for': ctx.ip,
      },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      admin: { role: string; email: string };
    };
    expect(json.admin.role).toBe('super_admin');
    expect(json.admin.email).toBe(DEFAULT_ADMIN_EMAIL);
  });
});

describe('GET /api/admin/auth/csrf', () => {
  it('returns a csrf token when authenticated', async () => {
    const ctx = await adminLogin();
    const res = await fetch(`${BASE}/api/admin/auth/csrf`, {
      headers: {
        cookie: ctx.cookies,
        'x-forwarded-for': ctx.ip,
      },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { csrfToken?: string };
    expect(typeof json.csrfToken).toBe('string');
    expect(json.csrfToken!.length).toBeGreaterThan(10);
  });

  it('returns 401 without admin cookie', async () => {
    const res = await fetch(`${BASE}/api/admin/auth/csrf`, {
      headers: { 'x-forwarded-for': uniqueTestIp() },
    });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/admin/auth/logout', () => {
  it('clears the admin and csrf cookies', async () => {
    const ctx = await adminLogin();
    const res = await fetch(`${BASE}/api/admin/auth/logout`, {
      method: 'POST',
      headers: {
        cookie: ctx.cookies,
        'x-forwarded-for': ctx.ip,
      },
    });
    expect(res.status).toBe(200);
    const adminCookie = findSetCookie(res, 'bhf_admin');
    const csrfCookie = findSetCookie(res, 'bhf_csrf');
    // logout sets both to an empty value with Max-Age=0 / Expires in the past
    expect(adminCookie).toBeTruthy();
    expect(csrfCookie).toBeTruthy();
    expect(adminCookie!).toMatch(/bhf_admin=;|Max-Age=0|Expires=Thu, 01 Jan 1970/i);
    expect(csrfCookie!).toMatch(/bhf_csrf=;|Max-Age=0|Expires=Thu, 01 Jan 1970/i);
  });
});
