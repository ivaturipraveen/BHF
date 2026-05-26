// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { BASE, adminLogin, ensureServerReachable, uniqueTestIp, type AdminCtx } from '../admin/_helpers';

let ctx: AdminCtx;

// The 18 admin page routes (matches src/app/admin/* dirs).
const ADMIN_PATHS = [
  '/admin',
  '/admin/annual-reports',
  '/admin/blog-posts',
  '/admin/contact-inquiries',
  '/admin/donations',
  '/admin/email-log',
  '/admin/events',
  '/admin/exclusive-content',
  '/admin/gallery-categories',
  '/admin/homepage',
  '/admin/leadership',
  '/admin/login',
  '/admin/members',
  '/admin/pages',
  '/admin/photo-submissions',
  '/admin/profile',
  '/admin/programs',
  '/admin/sponsors',
  '/admin/youth-registrations',
];

beforeAll(async () => {
  await ensureServerReachable();
  ctx = await adminLogin();
});

describe('Admin pages — without admin cookie', () => {
  it('GET /admin → 307 redirect to /admin/login', async () => {
    const res = await fetch(`${BASE}/admin`, {
      redirect: 'manual',
      headers: { 'x-forwarded-for': uniqueTestIp() },
    });
    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).toMatch(/\/admin\/login/);
  });

  it('GET /admin/login → 200, body contains "Sign in"', async () => {
    const res = await fetch(`${BASE}/admin/login`, {
      headers: { 'x-forwarded-for': uniqueTestIp() },
    });
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body.toLowerCase()).toContain('sign in');
  });
});

describe('Admin pages — with admin cookie', () => {
  it('GET /admin → 200, body contains "Welcome" or the admin email', async () => {
    const res = await fetch(`${BASE}/admin`, {
      headers: { cookie: ctx.cookies, 'x-forwarded-for': ctx.ip },
    });
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body.toLowerCase().includes('welcome') || body.includes(ctx.email)).toBe(true);
  });

  // The 18 admin routes loaded with a logged-in cookie should all be
  // navigable. /admin/login intentionally bounces to /admin (307) when a
  // session already exists — we accept that as the documented behavior.
  for (const p of ADMIN_PATHS) {
    it(`GET ${p} → 200 (or 307 for /admin/login)`, async () => {
      const res = await fetch(`${BASE}${p}`, {
        redirect: 'manual',
        headers: { cookie: ctx.cookies, 'x-forwarded-for': ctx.ip },
      });
      if (p === '/admin/login') {
        expect([200, 307]).toContain(res.status);
      } else {
        expect(res.status).toBe(200);
      }
    });
  }

  it('GET /admin/photo-submissions shows a "pending" badge / count', async () => {
    const res = await fetch(`${BASE}/admin/photo-submissions`, {
      headers: { cookie: ctx.cookies, 'x-forwarded-for': ctx.ip },
    });
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body.toLowerCase()).toContain('pending');
  });
});

describe("Maintainer's Handbook", () => {
  it('exists at docs/MAINTAINERS_HANDBOOK.md and is >1000 words', async () => {
    const abs = path.join(process.cwd(), 'docs', 'MAINTAINERS_HANDBOOK.md');
    const content = await fs.readFile(abs, 'utf8');
    const words = content.trim().split(/\s+/).length;
    expect(words, `expected >1000 words, got ${words}`).toBeGreaterThan(1000);
  });
});
