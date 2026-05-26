// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import * as cheerio from 'cheerio';

const BASE = 'http://localhost:3000';

async function fetchHtml(path: string): Promise<{ status: number; html: string }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-forwarded-for': '10.202.0.1' },
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

interface UnlabeledInput {
  page: string;
  outer: string;
}

/**
 * Best-effort label/name check for form controls.
 * An input is considered labeled if any of the following hold:
 *   - it has a non-empty aria-label or aria-labelledby
 *   - it has type="hidden" / "submit" / "button" / "image" / "reset"
 *   - its id matches a <label for="..."> on the page
 *   - it is nested inside a <label> element
 *   - it has an associated title attribute
 */
function findUnlabeledInputs(html: string, page: string): UnlabeledInput[] {
  const $ = cheerio.load(html);
  const labelTargets = new Set<string>();
  $('label[for]').each((_, el) => {
    const f = $(el).attr('for');
    if (f) labelTargets.add(f);
  });

  const unlabeled: UnlabeledInput[] = [];
  $('input, textarea, select').each((_, el) => {
    const $el = $(el);
    const tag = ('tagName' in el ? el.tagName : '')?.toLowerCase() ?? '';
    const type = ($el.attr('type') ?? '').toLowerCase();
    if (
      tag === 'input' &&
      ['hidden', 'submit', 'button', 'image', 'reset'].includes(type)
    ) {
      return;
    }
    const id = $el.attr('id');
    const aria = $el.attr('aria-label');
    const ariaBy = $el.attr('aria-labelledby');
    const title = $el.attr('title');
    const wrappedLabel = $el.parents('label').length > 0;
    const hasFor = id ? labelTargets.has(id) : false;
    if (
      (aria && aria.trim() !== '') ||
      (ariaBy && ariaBy.trim() !== '') ||
      (title && title.trim() !== '') ||
      hasFor ||
      wrappedLabel
    ) {
      return;
    }
    unlabeled.push({ page, outer: $.html(el).slice(0, 200) });
  });
  return unlabeled;
}

interface UnlabeledImage {
  page: string;
  outer: string;
}

function findImagesMissingAlt(html: string, page: string): UnlabeledImage[] {
  const $ = cheerio.load(html);
  const out: UnlabeledImage[] = [];
  $('img').each((_, el) => {
    const $el = $(el);
    // alt may be empty string for decorative — the attribute must still exist.
    if (typeof $el.attr('alt') !== 'string') {
      out.push({ page, outer: $.html(el).slice(0, 200) });
    }
  });
  return out;
}

describe('A11y smoke — form controls have an accessible name', () => {
  it.each(['/', '/events', '/contact'])('%s', async (path) => {
    const { status, html } = await fetchHtml(path);
    expect(status).toBe(200);
    const issues = findUnlabeledInputs(html, path);
    if (issues.length > 0) {
      // Surface the first few offenders to make failures actionable.
      const sample = issues.slice(0, 5).map((i) => i.outer).join('\n----\n');
      throw new Error(
        `${issues.length} form control(s) on ${path} lack an accessible name:\n${sample}`,
      );
    }
    expect(issues).toEqual([]);
  });
});

describe('A11y smoke — every <img> has an alt attribute', () => {
  it.each(['/', '/events', '/contact'])('%s', async (path) => {
    const { status, html } = await fetchHtml(path);
    expect(status).toBe(200);
    const issues = findImagesMissingAlt(html, path);
    if (issues.length > 0) {
      const sample = issues.slice(0, 5).map((i) => i.outer).join('\n----\n');
      throw new Error(
        `${issues.length} <img> tag(s) on ${path} are missing an alt attribute:\n${sample}`,
      );
    }
    expect(issues).toEqual([]);
  });
});

describe('A11y smoke — <html lang> declared on homepage', () => {
  it('GET / → <html lang="en">', async () => {
    const { status, html } = await fetchHtml('/');
    expect(status).toBe(200);
    const $ = cheerio.load(html);
    const lang = $('html').attr('lang');
    expect(lang).toBe('en');
  });
});
