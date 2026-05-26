// @vitest-environment node
// Phase 7 integration: PlausibleScript renders null when
// NEXT_PUBLIC_PLAUSIBLE_DOMAIN is empty. The compiled HTML for public and
// admin pages must NOT reference plausible.io/js/script.js.
import { describe, it, expect, beforeAll } from 'vitest';

const BASE = 'http://localhost:3000';

async function getHtml(path: string): Promise<{ status: number; body: string }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-forwarded-for': '10.242.0.1' },
  });
  const body = await res.text();
  return { status: res.status, body };
}

beforeAll(async () => {
  const res = await fetch(BASE);
  if (!res.ok) {
    throw new Error(`Next.js server at ${BASE} responded ${res.status}`);
  }
});

const PATHS = ['/', '/events', '/admin/login'];

describe('PlausibleScript stub mode (NEXT_PUBLIC_PLAUSIBLE_DOMAIN unset)', () => {
  for (const path of PATHS) {
    it(`GET ${path} → HTML does not reference plausible.io/js/script.js`, async () => {
      const { status, body } = await getHtml(path);
      // Pages should render (status 200 for / and /events; /admin/login is also
      // public). If a redirect occurs, follow once and inspect the final body.
      expect([200, 302, 307]).toContain(status);
      expect(body).not.toContain('plausible.io/js/script.js');
      expect(body.toLowerCase()).not.toContain('plausible.io');
    });
  }
});
