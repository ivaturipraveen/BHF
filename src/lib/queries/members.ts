import 'server-only';
import { query } from '@/lib/db';
import type { Member } from '@/types/db';

const PUBLIC_MEMBER_COLUMNS = `
  id, email, first_name, last_name, phone, city, family_size, how_heard,
  interests, bio, photo_url, email_verified_at, directory_opt_in,
  newsletter_opt_in, event_reminders_opt_in, donation_receipts_opt_in,
  member_messages_opt_in, suspended_at, created_at, updated_at
`;

const FULL_MEMBER_COLUMNS = `
  id, email, password_hash, first_name, last_name, phone, city, family_size,
  how_heard, interests, bio, photo_url, email_verified_at,
  email_verification_token, password_reset_token, password_reset_expires_at,
  directory_opt_in, newsletter_opt_in, event_reminders_opt_in,
  donation_receipts_opt_in, member_messages_opt_in, suspended_at,
  created_at, updated_at
`;

export type PublicMember = Omit<
  Member,
  'password_hash' | 'email_verification_token' | 'password_reset_token' | 'password_reset_expires_at'
>;

export interface DirectoryMember {
  id: string;
  first_name: string;
  last_name: string;
  city: string | null;
  interests: string[] | null;
  bio: string | null;
  photo_url: string | null;
}

export async function getMemberById(id: string): Promise<PublicMember | null> {
  const rows = await query<PublicMember>(
    `SELECT ${PUBLIC_MEMBER_COLUMNS} FROM members WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function getMemberByIdInternal(id: string): Promise<Member | null> {
  const rows = await query<Member>(
    `SELECT ${FULL_MEMBER_COLUMNS} FROM members WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function getMemberByEmail(email: string): Promise<Member | null> {
  const rows = await query<Member>(
    `SELECT ${FULL_MEMBER_COLUMNS} FROM members WHERE email = $1 LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
}

export interface MemberPatch {
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  city?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  interests?: string[] | null;
  family_size?: string | null;
  directory_opt_in?: boolean;
  newsletter_opt_in?: boolean;
}

export async function updateMember(
  id: string,
  patch: MemberPatch,
): Promise<PublicMember | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    sets.push(`${k} = $${i}`);
    params.push(v);
    i++;
  }
  if (sets.length === 0) {
    return getMemberById(id);
  }
  params.push(id);
  const rows = await query<PublicMember>(
    `UPDATE members SET ${sets.join(', ')}
     WHERE id = $${i}
     RETURNING ${PUBLIC_MEMBER_COLUMNS}`,
    params,
  );
  return rows[0] ?? null;
}

export async function deleteMember(id: string): Promise<void> {
  await query(`DELETE FROM members WHERE id = $1`, [id]);
}

export interface ListDirectoryOpts {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListDirectoryResult {
  rows: DirectoryMember[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listDirectoryMembers(
  opts: ListDirectoryOpts,
): Promise<ListDirectoryResult> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, opts.pageSize ?? 20));
  const offset = (page - 1) * pageSize;
  const search = opts.search?.trim();

  const params: unknown[] = [];
  let whereExtra = '';
  if (search && search.length > 0) {
    params.push(`%${search.toLowerCase()}%`);
    whereExtra = `AND (
      lower(first_name) LIKE $1 OR
      lower(last_name) LIKE $1 OR
      lower(coalesce(city, '')) LIKE $1
    )`;
  }

  const totalRows = await query<{ count: string }>(
    `SELECT count(*)::text AS count FROM members
      WHERE directory_opt_in = true AND suspended_at IS NULL ${whereExtra}`,
    params,
  );
  const total = Number(totalRows[0]?.count ?? 0);

  const dataParams = [...params, pageSize, offset];
  const limitIdx = params.length + 1;
  const offsetIdx = params.length + 2;

  const rows = await query<DirectoryMember>(
    `SELECT id, first_name, last_name, city, interests, bio, photo_url
       FROM members
      WHERE directory_opt_in = true AND suspended_at IS NULL ${whereExtra}
      ORDER BY first_name ASC, last_name ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    dataParams,
  );

  return { rows, total, page, pageSize };
}

export async function getDirectoryMemberById(
  id: string,
): Promise<DirectoryMember | null> {
  const rows = await query<DirectoryMember>(
    `SELECT id, first_name, last_name, city, interests, bio, photo_url
       FROM members
      WHERE id = $1 AND directory_opt_in = true AND suspended_at IS NULL
      LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}
