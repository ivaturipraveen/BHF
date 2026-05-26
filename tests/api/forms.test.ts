// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { query, pool } from '@/lib/db';

const BASE = 'http://localhost:3000';

// Each test gets its own simulated client IP so the in-memory per-IP rate
// limiter does not bleed state between tests. The rate-limit test below uses a
// single shared IP to deliberately exercise the limit.
let ipCounter = 0;
function nextIp(): string {
  ipCounter += 1;
  // 10.99.x.y — private space, unlikely to collide with anything real.
  const a = Math.floor(ipCounter / 256);
  const b = ipCounter % 256;
  return `10.99.${a}.${b}`;
}

async function postJson(
  path: string,
  body: unknown,
  ip: string = nextIp(),
): Promise<{ status: number; json: any }> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

beforeAll(async () => {
  // Sanity-check the live server is reachable. If it isn't, abort with a
  // helpful message rather than letting every test independently fail.
  try {
    const res = await fetch(BASE, { method: 'GET' });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
  } catch (err) {
    throw new Error(
      `Live Next.js server is not reachable at ${BASE}. Start it before running these tests. (${
        (err as Error).message
      })`,
    );
  }
});

afterAll(async () => {
  await pool.end();
});

describe('POST /api/newsletter', () => {
  it('accepts a valid email (200, ok:true)', async () => {
    const email = `nl-ok-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`;
    const { status, json } = await postJson('/api/newsletter', { email });
    expect(status).toBe(200);
    expect(json.ok).toBe(true);
    await query(`DELETE FROM newsletter_subscribers WHERE email = $1`, [email]);
  });

  it('rejects an invalid email (400)', async () => {
    const { status } = await postJson('/api/newsletter', { email: 'not-an-email' });
    expect(status).toBe(400);
  });

  it('on duplicate, returns 200 alreadySubscribed:true', async () => {
    const email = `nl-dup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`;
    const first = await postJson('/api/newsletter', { email });
    expect(first.status).toBe(200);
    const second = await postJson('/api/newsletter', { email });
    expect(second.status).toBe(200);
    expect(second.json.alreadySubscribed).toBe(true);
    await query(`DELETE FROM newsletter_subscribers WHERE email = $1`, [email]);
  });
});

describe('POST /api/contact', () => {
  it('accepts a valid inquiry (201 with id)', async () => {
    const email = `c-ok-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`;
    const { status, json } = await postJson('/api/contact', {
      type: 'general',
      name: 'Test User',
      email,
      message: 'This is a valid message that is longer than ten chars.',
    });
    expect(status).toBe(201);
    expect(typeof json.id).toBe('string');
    await query(`DELETE FROM contact_inquiries WHERE id = $1`, [json.id]);
  });

  it('rejects a too-short message (400)', async () => {
    const { status } = await postJson('/api/contact', {
      type: 'general',
      name: 'Test',
      email: `c-short-${Date.now()}@test.local`,
      message: 'short',
    });
    expect(status).toBe(400);
  });
});

describe('POST /api/rsvp', () => {
  it('returns 404 when the event slug does not exist', async () => {
    const { status } = await postJson('/api/rsvp', {
      eventSlug: 'nonexistent-event-zzz',
      name: 'X',
      email: 'x@y.com',
      partySize: 1,
    });
    expect(status).toBe(404);
  });

  it('successfully RSVPs to diwali-2026 (201)', async () => {
    const email = `rsvp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`;
    const { status, json } = await postJson('/api/rsvp', {
      eventSlug: 'diwali-2026',
      name: 'Test',
      email,
      partySize: 2,
    });
    // Cleanup either way (best effort) so a failure does not leak rows.
    await query(`DELETE FROM rsvps WHERE email = $1`, [email]);
    expect(status).toBe(201);
    if (status === 201) {
      expect(json.partySize).toBe(2);
    }
  });
});

describe('POST /api/photo-submissions', () => {
  it('accepts a valid submission (201)', async () => {
    const email = `ps-ok-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`;
    const { status, json } = await postJson('/api/photo-submissions', {
      submitterName: 'A',
      submitterEmail: email,
      fileUrl: 'https://example.com/p.jpg',
    });
    expect(status).toBe(201);
    expect(typeof json.id).toBe('string');
    await query(`DELETE FROM photo_submissions WHERE id = $1`, [json.id]);
  });

  it('rejects a non-URL fileUrl (400)', async () => {
    const { status } = await postJson('/api/photo-submissions', {
      submitterName: 'A',
      submitterEmail: 'a@b.com',
      fileUrl: 'not-a-url',
    });
    expect(status).toBe(400);
  });
});

describe('Rate limiting', () => {
  it('returns 429 on the 6th newsletter POST from a single IP within the window', async () => {
    const ip = `10.250.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
    const inserted: string[] = [];
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const email = `rl-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}@test.local`;
      const { status } = await postJson('/api/newsletter', { email }, ip);
      statuses.push(status);
      if (status === 200) inserted.push(email);
    }
    // Clean up before assertions so a failure does not leave rows behind.
    if (inserted.length > 0) {
      await query(`DELETE FROM newsletter_subscribers WHERE email = ANY($1::text[])`, [inserted]);
    }
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
  });
});
