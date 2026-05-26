// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { query } from '../../src/lib/db';
import {
  adminFetch,
  adminLogin,
  ensureServerReachable,
  nanoid,
  type AdminCtx,
} from './_helpers';

let ctx: AdminCtx;
const createdEventIds: string[] = [];

function eventBody(suffix: string): Record<string, unknown> {
  return {
    title: `QA CSRF Event ${suffix}`,
    slug: `qa-csrf-event-${suffix}-${nanoid(6)}`,
    description_md: 'CSRF test event — auto-deleted.',
    starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'other',
  };
}

beforeAll(async () => {
  await ensureServerReachable();
  ctx = await adminLogin();
});

afterAll(async () => {
  if (createdEventIds.length > 0) {
    await query(`DELETE FROM events WHERE id = ANY($1::uuid[])`, [createdEventIds]);
  }
});

describe('CSRF enforcement on /api/admin/events', () => {
  it('POST without x-csrf-token header → 403', async () => {
    const res = await adminFetch(
      '/api/admin/events',
      { method: 'POST', body: JSON.stringify(eventBody(`no-csrf-${nanoid(4)}`)), skipCsrf: true },
      ctx,
    );
    expect(res.status).toBe(403);
    const json = (await res.json()) as { error?: string };
    expect(json.error ?? '').toMatch(/csrf/i);
  });

  it('POST with a WRONG csrf token → 403', async () => {
    const res = await adminFetch(
      '/api/admin/events',
      {
        method: 'POST',
        body: JSON.stringify(eventBody(`bad-csrf-${nanoid(4)}`)),
        csrfOverride: 'totally.invalid-token-value',
      },
      ctx,
    );
    expect(res.status).toBe(403);
    const json = (await res.json()) as { error?: string };
    expect(json.error ?? '').toMatch(/csrf/i);
  });

  it('POST with the correct csrf token → 201', async () => {
    const res = await adminFetch(
      '/api/admin/events',
      { method: 'POST', body: JSON.stringify(eventBody(`ok-${nanoid(4)}`)) },
      ctx,
    );
    expect(res.status).toBe(201);
    const json = (await res.json()) as { event: { id: string } };
    expect(json.event.id).toBeTruthy();
    createdEventIds.push(json.event.id);
  });

  it('PATCH without csrf → 403; with csrf → 200', async () => {
    // create a target row so we have something to patch
    const createRes = await adminFetch(
      '/api/admin/events',
      { method: 'POST', body: JSON.stringify(eventBody(`patch-target-${nanoid(4)}`)) },
      ctx,
    );
    expect(createRes.status).toBe(201);
    const { event } = (await createRes.json()) as { event: { id: string } };
    createdEventIds.push(event.id);

    const noCsrf = await adminFetch(
      `/api/admin/events/${event.id}`,
      { method: 'PATCH', body: JSON.stringify({ title: 'patched-no-csrf' }), skipCsrf: true },
      ctx,
    );
    expect(noCsrf.status).toBe(403);

    const withCsrf = await adminFetch(
      `/api/admin/events/${event.id}`,
      { method: 'PATCH', body: JSON.stringify({ title: 'patched-with-csrf' }) },
      ctx,
    );
    expect(withCsrf.status).toBe(200);
    const patched = (await withCsrf.json()) as { event: { title: string } };
    expect(patched.event.title).toBe('patched-with-csrf');
  });

  it('DELETE without csrf → 403; with csrf → 204', async () => {
    const createRes = await adminFetch(
      '/api/admin/events',
      { method: 'POST', body: JSON.stringify(eventBody(`delete-target-${nanoid(4)}`)) },
      ctx,
    );
    expect(createRes.status).toBe(201);
    const { event } = (await createRes.json()) as { event: { id: string } };

    const noCsrf = await adminFetch(
      `/api/admin/events/${event.id}`,
      { method: 'DELETE', skipCsrf: true },
      ctx,
    );
    expect(noCsrf.status).toBe(403);

    const withCsrf = await adminFetch(
      `/api/admin/events/${event.id}`,
      { method: 'DELETE' },
      ctx,
    );
    expect(withCsrf.status).toBe(204);

    // best-effort: confirm gone (otherwise mark for cleanup)
    const probe = await adminFetch(`/api/admin/events/${event.id}`, undefined, ctx);
    if (probe.status !== 404) {
      createdEventIds.push(event.id);
    }
  });
});
