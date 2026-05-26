import 'server-only';
import { query } from '@/lib/db';
import type { ContactInquiry } from '@/types/db';

const COLUMNS = `id, type, name, email, phone, company, message, additional_data, status, handled_by, handled_at, created_at`;

export async function listAllContactInquiries(status?: string): Promise<ContactInquiry[]> {
  if (status) {
    return query<ContactInquiry>(
      `SELECT ${COLUMNS} FROM contact_inquiries WHERE status = $1 ORDER BY created_at DESC`,
      [status],
    );
  }
  return query<ContactInquiry>(
    `SELECT ${COLUMNS} FROM contact_inquiries ORDER BY created_at DESC`,
  );
}

export async function getContactInquiryById(id: string): Promise<ContactInquiry | null> {
  const rows = await query<ContactInquiry>(
    `SELECT ${COLUMNS} FROM contact_inquiries WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function markContactInquiryContacted(
  id: string,
  adminId: string,
): Promise<ContactInquiry | null> {
  const rows = await query<ContactInquiry>(
    `UPDATE contact_inquiries
        SET status = 'contacted', handled_by = $2, handled_at = now()
      WHERE id = $1
      RETURNING ${COLUMNS}`,
    [id, adminId],
  );
  return rows[0] ?? null;
}

export async function closeContactInquiry(
  id: string,
  adminId: string,
): Promise<ContactInquiry | null> {
  const rows = await query<ContactInquiry>(
    `UPDATE contact_inquiries
        SET status = 'closed', handled_by = $2, handled_at = now()
      WHERE id = $1
      RETURNING ${COLUMNS}`,
    [id, adminId],
  );
  return rows[0] ?? null;
}
