import 'server-only';
import { query } from '@/lib/db';
import { csvCell } from '@/lib/csv';
import type { Member } from '@/types/db';

const COLUMNS = `id, email, first_name, last_name, phone, city, family_size, how_heard, interests, bio, photo_url, email_verified_at, directory_opt_in, newsletter_opt_in, suspended_at, created_at, updated_at`;

export interface ListMembersOpts {
  limit?: number;
  offset?: number;
  search?: string;
}

export async function listAllMembers(opts: ListMembersOpts = {}): Promise<Member[]> {
  const limit = Math.min(opts.limit ?? 50, 200);
  const offset = Math.max(opts.offset ?? 0, 0);
  if (opts.search) {
    const term = `%${opts.search.toLowerCase()}%`;
    return query<Member>(
      `SELECT ${COLUMNS} FROM members
        WHERE lower(email) LIKE $1
           OR lower(first_name) LIKE $1
           OR lower(last_name) LIKE $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
      [term, limit, offset],
    );
  }
  return query<Member>(
    `SELECT ${COLUMNS} FROM members ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
}

export async function getMemberById(id: string): Promise<Member | null> {
  const rows = await query<Member>(
    `SELECT ${COLUMNS} FROM members WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function suspendMember(adminId: string, memberId: string): Promise<Member | null> {
  const rows = await query<Member>(
    `UPDATE members
        SET suspended_at = now(),
            suspended_by_admin_id = $1,
            suspended_at_recorded_at = now()
      WHERE id = $2
      RETURNING ${COLUMNS}`,
    [adminId, memberId],
  );
  return rows[0] ?? null;
}

export async function unsuspendMember(adminId: string, memberId: string): Promise<Member | null> {
  const rows = await query<Member>(
    `UPDATE members
        SET suspended_at = NULL,
            unsuspended_by_admin_id = $1,
            unsuspended_at_recorded_at = now()
      WHERE id = $2
      RETURNING ${COLUMNS}`,
    [adminId, memberId],
  );
  return rows[0] ?? null;
}

export async function exportMembersCsv(): Promise<string> {
  const rows = await query<Member>(
    `SELECT ${COLUMNS} FROM members ORDER BY created_at DESC`,
  );
  const headers = [
    'id', 'email', 'first_name', 'last_name', 'phone', 'city', 'family_size',
    'how_heard', 'interests', 'directory_opt_in', 'newsletter_opt_in',
    'email_verified_at', 'suspended_at', 'created_at',
  ];
  const lines = [headers.join(',')];
  for (const m of rows) {
    lines.push([
      csvCell(m.id),
      csvCell(m.email),
      csvCell(m.first_name),
      csvCell(m.last_name),
      csvCell(m.phone),
      csvCell(m.city),
      csvCell(m.family_size),
      csvCell(m.how_heard),
      csvCell((m.interests ?? []).join(';')),
      csvCell(m.directory_opt_in),
      csvCell(m.newsletter_opt_in),
      csvCell(m.email_verified_at),
      csvCell(m.suspended_at),
      csvCell(m.created_at),
    ].join(','));
  }
  return lines.join('\n');
}
