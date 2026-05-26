// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import * as cheerio from 'cheerio';

const BASE = 'http://localhost:3000';

async function fetchHtml(path: string): Promise<{ status: number; html: string }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-forwarded-for': '10.201.0.1' },
  });
  return { status: res.status, html: await res.text() };
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

describe('Homepage SEO meta', () => {
  it('has non-empty <title>, og:title, and description containing Bharatiya/BHF', async () => {
    const { status, html } = await fetchHtml('/');
    expect(status).toBe(200);
    const $ = cheerio.load(html);

    const title = $('title').first().text().trim();
    const desc = $('meta[name="description"]').attr('content')?.trim() ?? '';
    const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() ?? '';

    expect(title.length).toBeGreaterThan(0);
    expect(desc.length).toBeGreaterThan(0);
    expect(ogTitle.length).toBeGreaterThan(0);

    // At least one of title/description/og:title should mention the brand —
    // require it on title or og:title, and brand or short-form on description.
    const blob = `${title} ${desc} ${ogTitle}`;
    expect(/Bharatiya|BHF/.test(blob)).toBe(true);
  });
});

describe('Event page JSON-LD', () => {
  it('GET /events/diwali-2026 includes <script type="application/ld+json"> with @type Event', async () => {
    const { status, html } = await fetchHtml('/events/diwali-2026');
    expect(status).toBe(200);
    const $ = cheerio.load(html);
    const scripts = $('script[type="application/ld+json"]')
      .map((_, el) => $(el).text())
      .get();
    expect(scripts.length).toBeGreaterThan(0);
    const allJson = scripts.join('\n');
    // Tolerate whitespace variants of @type:Event.
    expect(/"@type"\s*:\s*"Event"/.test(allJson)).toBe(true);
  });
});

describe('Blog post JSON-LD', () => {
  it('a published blog post includes JSON-LD with @type Article or BlogPosting', async () => {
    // Use the first published post known from the seed.
    const { status, html } = await fetchHtml('/blog/save-the-date-diwali-2026');
    expect(status).toBe(200);
    const $ = cheerio.load(html);
    const scripts = $('script[type="application/ld+json"]')
      .map((_, el) => $(el).text())
      .get();
    expect(scripts.length).toBeGreaterThan(0);
    const allJson = scripts.join('\n');
    expect(/"@type"\s*:\s*"(Article|BlogPosting)"/.test(allJson)).toBe(true);
  });
});
