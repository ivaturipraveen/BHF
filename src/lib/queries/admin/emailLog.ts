import 'server-only';
import { query } from '@/lib/db';

export interface EmailLogRow {
  id: string;
  to_email: string;
  subject: string;
  kind: string;
  sent_at: Date;
  created_at: Date;
}

export async function listRecentEmails(limit = 100): Promise<EmailLogRow[]> {
  const safeLimit = Math.min(limit, 500);
  return query<EmailLogRow>(
    `SELECT id, to_email, subject, kind, sent_at, created_at
       FROM email_log
       ORDER BY sent_at DESC
       LIMIT $1`,
    [safeLimit],
  );
}
