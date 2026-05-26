// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';

const BASE = 'http://localhost:3000';

async function get(path: string): Promise<{ status: number; ct: string; body: string }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-forwarded-for': '10.200.0.1' },
  });
  const body = await res.text();
  return {
    status: res.status,
    ct: res.headers.get('content-type') ?? '',
    body,
  };
}

beforeAll(async () => {
  try {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
  } catch (err) {
    throw new Error(
      `Live Next.js server is not reachable at ${BASE}. (${(err as Error).message})`,
    );
  }
});

const HTML_ROUTES: Array<{ path: string; expect: string }> = [
  { path: '/', expect: 'Bharatiya' },
  { path: '/about', expect: 'About' },
  { path: '/programs', expect: 'Programs' },
  { path: '/events', expect: 'events' },
  { path: '/gallery', expect: 'Gallery' },
  { path: '/leadership', expect: 'leadership' },
  { path: '/blog', expect: 'Blog' },
  { path: '/contact', expect: 'Contact' },
  { path: '/get-involved', expect: 'involved' },
  { path: '/donate', expect: 'support' },
  { path: '/privacy', expect: 'Privacy' },
  { path: '/terms', expect: 'Terms' },
  { path: '/press', expect: 'Press' },
  { path: '/annual-reports', expect: 'annual' },
  { path: '/events/diwali-2026', expect: 'Diwali' },
  { path: '/gallery/holi-2025', expect: 'Holi' },
];

describe('Public HTML pages', () => {
  for (const r of HTML_ROUTES) {
    it(`GET ${r.path} → 200, text/html, body contains "${r.expect}"`, async () => {
      const { status, ct, body } = await get(r.path);
      expect(status).toBe(200);
      expect(ct.toLowerCase().startsWith('text/html')).toBe(true);
      // Case-insensitive match — the canonical token may be presented in any case.
      expect(body.toLowerCase()).toContain(r.expect.toLowerCase());
    });
  }
});

describe('Sitemap and robots', () => {
  it('GET /sitemap.xml → 200, contains <urlset', async () => {
    const { status, body } = await get('/sitemap.xml');
    expect(status).toBe(200);
    expect(body).toContain('<urlset');
  });

  it('GET /robots.txt → 200, contains Sitemap:', async () => {
    const { status, body } = await get('/robots.txt');
    expect(status).toBe(200);
    expect(body).toContain('Sitemap:');
  });
});

describe('404 handling for missing dynamic slugs', () => {
  for (const path of [
    '/events/this-slug-does-not-exist',
    '/programs/nope',
    '/blog/none',
    '/gallery/none',
  ]) {
    it(`GET ${path} → 404`, async () => {
      const { status } = await get(path);
      expect(status).toBe(404);
    });
  }
});
