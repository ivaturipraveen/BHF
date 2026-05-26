// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import * as cheerio from 'cheerio';

const BASE = 'http://localhost:3000';

let ipCounter = 0;
function uniqueIp(): string {
  ipCounter = (ipCounter + 1) % 250;
  return `10.42.${Math.floor(Math.random() * 250)}.${ipCounter + 1}`;
}

async function getDoc(path: string): Promise<{ status: number; $: cheerio.CheerioAPI; body: string }> {
  const res = await fetch(`${BASE}${path}`, {
    redirect: 'manual',
    headers: { 'x-forwarded-for': uniqueIp() },
  });
  const body = await res.text();
  return { status: res.status, $: cheerio.load(body) as unknown as cheerio.CheerioAPI, body };
}

beforeAll(async () => {
  const res = await fetch(BASE, { headers: { 'x-forwarded-for': uniqueIp() } });
  if (!res.ok) {
    throw new Error(`Live Next.js server is not reachable at ${BASE}: ${res.status}`);
  }
});

describe('Phase 8 — accessibility extras', () => {
  it('GET / has a "Skip to main content" link near the top of <body>', async () => {
    const { status, $ } = await getDoc('/');
    expect(status).toBe(200);
    const skip = $('a[href="#main-content"]');
    expect(skip.length).toBeGreaterThanOrEqual(1);
    expect(skip.first().text().trim().toLowerCase()).toContain('skip to main content');
  });

  it('GET / has a #main-content wrapper that the skip link targets', async () => {
    const { $ } = await getDoc('/');
    // Accept either a <main id="main-content"> or any element with that id —
    // the skip-link contract is the id, not the element type.
    const target = $('#main-content');
    expect(target.length).toBeGreaterThanOrEqual(1);
  });

  it('GET / has at least one <nav> with an aria-label', async () => {
    const { $ } = await getDoc('/');
    const labeledNavs = $('nav[aria-label]');
    expect(labeledNavs.length).toBeGreaterThanOrEqual(1);
    const labels = labeledNavs
      .map((_, el) => $(el).attr('aria-label')?.trim() ?? '')
      .get()
      .filter(Boolean);
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /admin/login has a robots noindex meta tag', async () => {
    const { status, $ } = await getDoc('/admin/login');
    expect(status).toBe(200);
    const robots = ($('meta[name="robots"]').attr('content') ?? '').toLowerCase();
    expect(robots).toContain('noindex');
  });

  it('GET /not-a-real-page-xyz returns 404 with brand-friendly text', async () => {
    const { status, body } = await getDoc('/not-a-real-page-xyz-' + Date.now());
    expect(status).toBe(404);
    const lower = body.toLowerCase();
    const friendly =
      lower.includes('page not found') ||
      lower.includes('not found') ||
      lower.includes('couldn’t find') ||
      lower.includes("couldn't find");
    expect(friendly).toBe(true);
  });
});
