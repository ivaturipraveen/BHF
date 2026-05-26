import { requireAdminPageSession } from '@/lib/adminSession';
import { query } from '@/lib/db';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { EmailLogTable, type EmailLogEntry } from '@/components/admin/EmailLogModal';

export const dynamic = 'force-dynamic';

export default async function AdminEmailLogPage() {
  await requireAdminPageSession(['super_admin']);
  const emails = await query<EmailLogEntry>(
    `SELECT id, to_email, subject, kind, body_text, sent_at
       FROM email_log
       ORDER BY sent_at DESC
       LIMIT 200`,
  );
  return (
    <div>
      <AdminListHeader title="Email log" description="Recent outgoing emails (dev-only console log)." />
      <EmailLogTable emails={emails} />
    </div>
  );
}
