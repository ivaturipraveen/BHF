// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import * as cheerio from 'cheerio';

const BASE = 'http://localhost:3000';

let ipCounter = 0;
function uniqueIp(): string {
  ipCounter = (ipCounter + 1) % 250;
  return `10.43.${Math.floor(Math.random() * 250)}.${ipCounter + 1}`;
}

beforeAll(async () => {
  const res = await fetch(BASE, { headers: { 'x-forwarded-for': uniqueIp() } });
  if (!res.ok) {
    throw new Error(`Live Next.js server is not reachable at ${BASE}: ${res.status}`);
  }
});

function robotsValue(html: string): string {
  const $ = cheerio.load(html);
  return ($('meta[name="robots"]').attr('content') ?? '').toLowerCase();
}

describe('Phase 8 — admin pages are not indexable', () => {
  it('GET /admin/login renders meta robots noindex (no auth needed)', async () => {
    const res = await fetch(`${BASE}/admin/login`, {
      headers: { 'x-forwarded-for': uniqueIp() },
    });
    expect(res.status).toBe(200);
    const robots = robotsValue(await res.text());
    expect(robots).toContain('noindex');
    expect(robots).toContain('nofollow');
  });

  it('GET /admin (unauthenticated) — manual redirect goes to /admin/login', async () => {
    const res = await fetch(`${BASE}/admin`, {
      redirect: 'manual',
      headers: { 'x-forwarded-for': uniqueIp() },
    });
    expect(res.status).toBe(307);
    expect(res.headers.get('location') ?? '').toMatch(/\/admin\/login/);
  });

  it('GET /admin (unauthenticated, follow redirect) — landing /admin/login still carries noindex', async () => {
    // Following the redirect lands on /admin/login, which is itself an admin
    // page and must remain noindex.
    const res = await fetch(`${BASE}/admin`, {
      headers: { 'x-forwarded-for': uniqueIp() },
    });
    expect(res.status).toBe(200);
    const robots = robotsValue(await res.text());
    expect(robots).toContain('noindex');
  });
});
