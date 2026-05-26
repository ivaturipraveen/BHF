// @vitest-environment node
// Phase 7 integration: feature-flag stub behavior for src/lib/email.ts.
// With RESEND_API_KEY empty, RESEND_ENABLED is false and sendEmail() writes
// to email_log without making an external API call. The body_text branch
// depends on whether Resend is active — we adapt to either branch.
import { describe, it, expect, vi, afterAll } from 'vitest';

// `server-only` throws when imported by a client module. Vitest's React
// plugin makes the import look client-side, so we stub it to a no-op for
// this node-env integration test.
vi.mock('server-only', () => ({}));

const { query, pool } = await import('@/lib/db');
const { sendEmail, RESEND_ENABLED } = await import('@/lib/email');

const testEmail = `email-stub-${Date.now()}-${Math.random()
  .toString(36)
  .slice(2, 8)}@test.local`;

afterAll(async () => {
  await query(`DELETE FROM email_log WHERE to_email = $1`, [testEmail]);
  await pool.end();
});

describe('src/lib/email.ts (stub mode)', () => {
  it('RESEND_ENABLED is false when RESEND_API_KEY is unset', () => {
    expect(RESEND_ENABLED).toBe(false);
  });

  it('sendEmail writes an email_log row with kind, to_email, subject', async () => {
    const subject = 'QA admin_test subject';
    const text = 'QA admin_test body — no real send happens in stub mode.';
    const { id } = await sendEmail({
      to: testEmail,
      subject,
      text,
      kind: 'admin_test',
    });
    expect(typeof id).toBe('string');

    const rows = await query<{
      id: string;
      to_email: string;
      subject: string;
      body_text: string;
      body_html: string | null;
      kind: string;
    }>(
      `SELECT id, to_email, subject, body_text, body_html, kind
         FROM email_log WHERE to_email = $1 ORDER BY created_at DESC LIMIT 1`,
      [testEmail],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(id);
    expect(rows[0].to_email).toBe(testEmail);
    expect(rows[0].subject).toBe(subject);
    expect(rows[0].kind).toBe('admin_test');

    // Either branch is acceptable depending on whether Resend is wired up:
    //   - Resend active → body blanked (body_text='', body_html=null).
    //   - Stub mode    → body persisted as-sent.
    if (RESEND_ENABLED) {
      expect(rows[0].body_text).toBe('');
      expect(rows[0].body_html).toBeNull();
    } else {
      expect(rows[0].body_text).toBe(text);
    }
  });
});
