// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { BASE, ensureServerReachable, testHeaders } from './_helpers';

beforeAll(async () => {
  await ensureServerReachable();
});

describe('POST /api/donations/webhook (stub mode)', () => {
  it('returns 200 with a stub-mode message and no-op acknowledgment', async () => {
    const res = await fetch(`${BASE}/api/donations/webhook`, {
      method: 'POST',
      headers: testHeaders({ 'stripe-signature': 'irrelevant-in-stub' }),
      body: JSON.stringify({ id: 'evt_test', type: 'checkout.session.completed' }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      received?: boolean;
      mode?: string;
      note?: string;
    };
    expect(json.received).toBe(true);
    expect(json.mode).toBe('stub');
    expect((json.note ?? '').toLowerCase()).toContain('stub');
  });
});
