// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { BASE, ensureServerReachable, testHeaders } from './_helpers';

beforeAll(async () => {
  await ensureServerReachable();
});

async function fetchLogin(nextValue: string): Promise<{ status: number; html: string }> {
  const url = `${BASE}/login?next=${encodeURIComponent(nextValue)}`;
  const res = await fetch(url, {
    redirect: 'manual',
    headers: testHeaders(),
  });
  return { status: res.status, html: await res.text() };
}

// Pull the value="..." attribute of the rendered <input ... name="next" ...> tag.
// The form's eventual redirect destination is JS-controlled and reads exactly
// this prop, so the value attribute is what actually drives the redirect.
function extractNextInputValue(html: string): string | null {
  const m = html.match(
    /<input[^>]*name="next"[^>]*value="([^"]*)"[^>]*>/i,
  );
  if (m) return m[1];
  // The attribute order may be reversed.
  const m2 = html.match(
    /<input[^>]*value="([^"]*)"[^>]*name="next"[^>]*>/i,
  );
  return m2 ? m2[1] : null;
}

describe('Open-redirect protection on /login?next=', () => {
  it('strips a protocol-relative URL (//evil.com) from the hidden next field', async () => {
    const { status, html } = await fetchLogin('//evil.com');
    expect(status).toBe(200);
    const nextVal = extractNextInputValue(html);
    expect(nextVal).not.toBeNull();
    expect(nextVal).not.toContain('evil.com');
    // The hidden field must not reflect the unsafe input.
    expect(nextVal).toBe('/account');
  });

  it('strips an absolute URL (https://evil.com) from the hidden next field', async () => {
    const { status, html } = await fetchLogin('https://evil.com');
    expect(status).toBe(200);
    const nextVal = extractNextInputValue(html);
    expect(nextVal).not.toBeNull();
    expect(nextVal).not.toContain('evil.com');
    expect(nextVal).toBe('/account');
  });

  it('allows a same-origin path (/account/profile) through', async () => {
    const { status, html } = await fetchLogin('/account/profile');
    expect(status).toBe(200);
    const nextVal = extractNextInputValue(html);
    expect(nextVal).toBe('/account/profile');
  });
});
