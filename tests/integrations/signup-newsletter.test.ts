// @vitest-environment node
// Phase 7 integration: signup with newsletterOptIn:true should both create
// the member and sync the email into newsletter_subscribers (the local audit
// table that mirrors what would go to Mailchimp). In stub mode Mailchimp is
// disabled, so the local row is the only persisted record of the opt-in.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { query, pool } from '@/lib/db';

const BASE = 'http://localhost:3000';

function ip(): string {
  return `10.244.${Math.floor(Math.random() * 250)}.${Math.floor(
    Math.random() * 250,
  )}`;
}

const testEmail = `signup-nl-${Date.now()}-${Math.random()
  .toString(36)
  .slice(2, 8)}@test.local`;

beforeAll(async () => {
  const res = await fetch(BASE);
  if (!res.ok) {
    throw new Error(`Next.js server at ${BASE} responded ${res.status}`);
  }
  await query(`DELETE FROM email_log WHERE to_email = $1`, [testEmail]);
  await query(`DELETE FROM members WHERE email = $1`, [testEmail]);
  await query(`DELETE FROM newsletter_subscribers WHERE email = $1`, [
    testEmail,
  ]);
});

afterAll(async () => {
  await query(`DELETE FROM email_log WHERE to_email = $1`, [testEmail]);
  await query(`DELETE FROM members WHERE email = $1`, [testEmail]);
  await query(`DELETE FROM newsletter_subscribers WHERE email = $1`, [
    testEmail,
  ]);
  await pool.end();
});

describe('POST /api/auth/signup with newsletterOptIn:true', () => {
  it('returns generic 200 ok response', async () => {
    const res = await fetch(`${BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip() },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPass123!',
        firstName: 'QA',
        lastName: 'NewsletterOptIn',
        newsletterOptIn: true,
      }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok?: boolean; message?: string };
    expect(json.ok).toBe(true);
    expect(json.message ?? '').toMatch(/check your email/i);
  });

  it('creates a members row with newsletter_opt_in:true', async () => {
    const rows = await query<{ id: string; newsletter_opt_in: boolean }>(
      `SELECT id, newsletter_opt_in FROM members WHERE email = $1`,
      [testEmail],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].newsletter_opt_in).toBe(true);
  });

  it('syncs the email into newsletter_subscribers', async () => {
    const rows = await query<{ email: string }>(
      `SELECT email FROM newsletter_subscribers WHERE email = $1`,
      [testEmail],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe(testEmail);
  });
});
