import 'server-only';
import { query } from '@/lib/db';
import type { PhotoSubmission } from '@/types/db';

const COLUMNS = `id, submitter_name, submitter_email, event_id, file_url, caption, status, reviewed_by, review_note, created_at, reviewed_at`;

export async function listPendingPhotoSubmissions(): Promise<PhotoSubmission[]> {
  return query<PhotoSubmission>(
    `SELECT ${COLUMNS} FROM photo_submissions WHERE status = 'pending' ORDER BY created_at DESC`,
  );
}

export async function listAllPhotoSubmissions(status?: string): Promise<PhotoSubmission[]> {
  if (status) {
    return query<PhotoSubmission>(
      `SELECT ${COLUMNS} FROM photo_submissions WHERE status = $1 ORDER BY created_at DESC`,
      [status],
    );
  }
  return query<PhotoSubmission>(
    `SELECT ${COLUMNS} FROM photo_submissions ORDER BY created_at DESC`,
  );
}

export async function getPhotoSubmissionById(id: string): Promise<PhotoSubmission | null> {
  const rows = await query<PhotoSubmission>(
    `SELECT ${COLUMNS} FROM photo_submissions WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function approvePhotoSubmission(
  id: string,
  adminId: string,
  note?: string | null,
): Promise<PhotoSubmission | null> {
  const rows = await query<PhotoSubmission>(
    `UPDATE photo_submissions
        SET status = 'approved', reviewed_by = $2, reviewed_at = now(), review_note = $3
      WHERE id = $1 AND status = 'pending'
      RETURNING ${COLUMNS}`,
    [id, adminId, note ?? null],
  );
  return rows[0] ?? null;
}

export async function rejectPhotoSubmission(
  id: string,
  adminId: string,
  note?: string | null,
): Promise<PhotoSubmission | null> {
  const rows = await query<PhotoSubmission>(
    `UPDATE photo_submissions
        SET status = 'rejected', reviewed_by = $2, reviewed_at = now(), review_note = $3
      WHERE id = $1 AND status = 'pending'
      RETURNING ${COLUMNS}`,
    [id, adminId, note ?? null],
  );
  return rows[0] ?? null;
}
