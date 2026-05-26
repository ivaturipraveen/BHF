// @vitest-environment node
// Phase 7 integration: SentryInit dynamically imports @sentry/nextjs only
// when NEXT_PUBLIC_SENTRY_DSN is set. In stub mode the initial HTML must not
// contain any @sentry/nextjs runtime payload — the dynamic chunk is loaded
// lazily on the client and only when DSN is present.
import { describe, it, expect, beforeAll } from 'vitest';

const BASE = 'http://localhost:3000';

async function getHtml(path: string): Promise<{ status: number; body: string }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-forwarded-for': '10.243.0.1' },
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

describe('SentryInit stub mode (NEXT_PUBLIC_SENTRY_DSN unset)', () => {
  it('GET / → initial HTML does not contain @sentry/nextjs runtime payload', async () => {
    const { status, body } = await getHtml('/');
    expect(status).toBe(200);
    // The SentryInit client component will still be in the bundle graph, but
    // no @sentry runtime should be inlined into the initial HTML.
    expect(body).not.toContain('@sentry/nextjs');
    expect(body).not.toContain('@sentry/browser');
    expect(body.toLowerCase()).not.toContain('sentry-trace');
  });
});
