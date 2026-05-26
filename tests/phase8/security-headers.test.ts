// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';

const BASE = 'http://localhost:3000';

// Unique per-test synthetic IP so we don't run into the per-IP rate limiter
// for any incidentally-rate-limited route. TRUST_PROXY=1 is set in .bw_env.
let ipCounter = 0;
function uniqueIp(): string {
  ipCounter = (ipCounter + 1) % 250;
  return `10.41.${Math.floor(Math.random() * 250)}.${ipCounter + 1}`;
}

async function getHeaders(path: string): Promise<Headers> {
  const res = await fetch(`${BASE}${path}`, {
    redirect: 'manual',
    headers: { 'x-forwarded-for': uniqueIp() },
  });
  // Consume body so the connection can be reused / released.
  await res.arrayBuffer().catch(() => undefined);
  return res.headers;
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

const PATHS = ['/', '/about', '/events/diwali-2026', '/admin/login', '/donate'];

describe('Phase 8 — security headers on representative routes', () => {
  for (const path of PATHS) {
    describe(`GET ${path}`, () => {
      it('X-Content-Type-Options: nosniff', async () => {
        const headers = await getHeaders(path);
        expect(headers.get('x-content-type-options')?.toLowerCase()).toBe('nosniff');
      });

      it('X-Frame-Options: DENY', async () => {
        const headers = await getHeaders(path);
        expect(headers.get('x-frame-options')?.toUpperCase()).toBe('DENY');
      });

      it("Referrer-Policy: strict-origin-when-cross-origin", async () => {
        const headers = await getHeaders(path);
        expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
      });

      it('Content-Security-Policy is present and contains default-src', async () => {
        const headers = await getHeaders(path);
        const csp = headers.get('content-security-policy') ?? '';
        expect(csp.length).toBeGreaterThan(0);
        expect(csp).toContain('default-src');
      });

      it("Permissions-Policy contains 'camera=()'", async () => {
        const headers = await getHeaders(path);
        const pp = headers.get('permissions-policy') ?? '';
        expect(pp).toContain('camera=()');
      });

      it('HSTS presence matches NODE_ENV', async () => {
        const headers = await getHeaders(path);
        const hsts = headers.get('strict-transport-security');
        if (process.env.NODE_ENV === 'production') {
          expect(hsts).toBeTruthy();
          expect(hsts!).toMatch(/max-age=\d+/);
        } else {
          // In dev/test, HSTS is intentionally omitted. We tolerate either
          // absence (the documented dev behavior) or presence (e.g., when the
          // suite is run against a `next start` build).
          if (hsts) {
            expect(hsts).toMatch(/max-age=\d+/);
          } else {
            expect(hsts).toBeNull();
          }
        }
      });
    });
  }
});
