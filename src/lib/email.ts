import 'server-only';
import { query } from '@/lib/db';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'BHF <no-reply@bhfcommunity.org>';
export const RESEND_ENABLED =
  !!RESEND_API_KEY && RESEND_API_KEY.startsWith('re_');

let resendClient: { emails: { send: (args: unknown) => Promise<unknown> } } | null =
  null;
if (RESEND_ENABLED) {
  try {
    const { Resend } = require('resend');
    resendClient = new Resend(RESEND_API_KEY);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[email] failed to initialise Resend client', err);
    resendClient = null;
  }
}

export type EmailKind =
  | 'verify'
  | 'reset'
  | 'rsvp_confirmation'
  | 'donation_receipt'
  | 'welcome'
  | 'admin_test';

export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
  kind: EmailKind;
}

// RILEY P4-H1: never persist raw reset/verify tokens in email_log. When Resend
// is active, body fields are blanked entirely — the actual email content goes
// to Resend. In dev (stub mode) we keep the URL so smoke tests can still recover
// it from the table.
function sanitizeToken(s: string): string {
  return s.replace(/token=[^&\s"'<>]+/g, 'token=[REDACTED]');
}

export async function sendEmail(
  params: SendEmailParams,
): Promise<{ id: string }> {
  const { to, subject, text, html, kind } = params;

  let storedText: string;
  let storedHtml: string | null;
  if (RESEND_ENABLED) {
    storedText = '';
    storedHtml = null;
  } else {
    storedText = text;
    storedHtml = html ?? null;
  }

  const rows = await query<{ id: string }>(
    `INSERT INTO email_log (to_email, subject, body_text, body_html, kind)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [to, subject, storedText, storedHtml, kind],
  );

  if (RESEND_ENABLED && resendClient) {
    try {
      await resendClient.emails.send({
        from: RESEND_FROM,
        to,
        subject,
        html: html ?? undefined,
        text,
      });
      // eslint-disable-next-line no-console
      console.log(`[email-resend] sent kind=${kind} to=${to}`);
    } catch (err) {
      // Best-effort send — never throw. Audit row is already written.
      // eslint-disable-next-line no-console
      console.error(`[email-resend] send failed kind=${kind} to=${to}`, err);
    }
  } else {
    // Surface a single-line marker in the dev journal so smoke tests and
    // developers can see what would have shipped. The full body (including any
    // verification token URL) is persisted to the dev-only email_log table.
    // eslint-disable-next-line no-console
    console.log(
      `[email-stub] sent kind=${kind} to=${to} (body persisted in email_log)`,
    );

    if (process.env.EMAIL_STUB_LOG_URL === '1') {
      const urlMatch = text.match(/https?:\/\/\S+/);
      // eslint-disable-next-line no-console
      console.log('[email-stub-dev] body url:', sanitizeToken(urlMatch?.[0] ?? ''));
    }
  }

  return { id: rows[0].id };
}
