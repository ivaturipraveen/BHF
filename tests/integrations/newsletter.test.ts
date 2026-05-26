// @vitest-environment node
// Phase 7 integration: feature-flag stub behavior for /api/newsletter.
// In this environment Mailchimp keys are empty, so the response includes
// mailchimp:'stub'. The newsletter_subscribers row should be persisted.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { query, pool } from '@/lib/db';

const BASE = 'http://localhost:3000';

function ip(): string {
  return `10.241.${Math.floor(Math.random() * 250)}.${Math.floor(
    Math.random() * 250,
  )}`;
}

async function postNewsletter(email: string): Promise<{
  status: number;
  json: { ok?: boolean; alreadySubscribed?: boolean; mailchimp?: string };
}> {
  const res = await fetch(`${BASE}/api/newsletter`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip() },
    body: JSON.stringify({ email }),
  });
  const json = (await res.json()) as {
    ok?: boolean;
    alreadySubscribed?: boolean;
    mailchimp?: string;
  };
  return { status: res.status, json };
}

const testEmail = `nl-stub-${Date.now()}-${Math.random()
  .toString(36)
  .slice(2, 8)}@test.local`;

beforeAll(async () => {
  const res = await fetch(BASE);
  if (!res.ok) {
    throw new Error(`Next.js server at ${BASE} responded ${res.status}`);
  }
  await query(`DELETE FROM newsletter_subscribers WHERE email = $1`, [
    testEmail,
  ]);
});

afterAll(async () => {
  await query(`DELETE FROM newsletter_subscribers WHERE email = $1`, [
    testEmail,
  ]);
  await pool.end();
});

describe('POST /api/newsletter (stub mode)', () => {
  it('first submission returns ok:true, alreadySubscribed:false, mailchimp:"stub"', async () => {
    const { status, json } = await postNewsletter(testEmail);
    expect(status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.alreadySubscribed).toBe(false);
    expect(json.mailchimp).toBe('stub');
  });

  it('persists a newsletter_subscribers row for the submitted email', async () => {
    const rows = await query<{ id: string; email: string }>(
      `SELECT id, email FROM newsletter_subscribers WHERE email = $1`,
      [testEmail],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe(testEmail);
  });

  it('second submission returns alreadySubscribed:true, mailchimp:"stub"', async () => {
    const { status, json } = await postNewsletter(testEmail);
    expect(status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.alreadySubscribed).toBe(true);
    expect(json.mailchimp).toBe('stub');
  });
});
