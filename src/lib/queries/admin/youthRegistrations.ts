import 'server-only';
import { query } from '@/lib/db';
import { csvCell } from '@/lib/csv';

export interface YouthEnrollmentRow {
  id: string;
  child_id: string | null;
  child_first_name: string | null;
  child_last_name: string | null;
  child_date_of_birth: Date | null;
  child_allergies: string | null;
  child_emergency_contact_name: string | null;
  child_emergency_contact_phone: string | null;
  parent_member_id: string | null;
  parent_email: string | null;
  parent_first_name: string | null;
  parent_last_name: string | null;
  program_id: string | null;
  program_slug: string | null;
  program_title: string | null;
  parental_consent_at: Date | null;
  status: string;
  created_at: Date;
}

const SELECT_JOIN = `
  SELECT
    e.id, e.child_id,
    c.first_name AS child_first_name,
    c.last_name AS child_last_name,
    c.date_of_birth AS child_date_of_birth,
    c.allergies AS child_allergies,
    c.emergency_contact_name AS child_emergency_contact_name,
    c.emergency_contact_phone AS child_emergency_contact_phone,
    c.parent_member_id,
    m.email AS parent_email,
    m.first_name AS parent_first_name,
    m.last_name AS parent_last_name,
    e.program_id,
    p.slug AS program_slug,
    p.title AS program_title,
    e.parental_consent_at,
    e.status,
    e.created_at
  FROM youth_enrollments e
  LEFT JOIN youth_children c ON c.id = e.child_id
  LEFT JOIN members m ON m.id = c.parent_member_id
  LEFT JOIN programs p ON p.id = e.program_id
`;

export async function listEnrollmentsByProgram(programId: string): Promise<YouthEnrollmentRow[]> {
  return query<YouthEnrollmentRow>(
    `${SELECT_JOIN} WHERE e.program_id = $1 ORDER BY e.created_at DESC`,
    [programId],
  );
}

export async function listAllEnrollments(): Promise<YouthEnrollmentRow[]> {
  return query<YouthEnrollmentRow>(
    `${SELECT_JOIN} ORDER BY e.created_at DESC LIMIT 500`,
  );
}

export async function exportEnrollmentsCsv(programId?: string): Promise<string> {
  const rows = programId
    ? await listEnrollmentsByProgram(programId)
    : await listAllEnrollments();
  const headers = [
    'enrollment_id', 'program', 'child_first_name', 'child_last_name', 'child_dob',
    'allergies', 'emergency_contact_name', 'emergency_contact_phone',
    'parent_first_name', 'parent_last_name', 'parent_email',
    'parental_consent_at', 'status', 'created_at',
  ];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      csvCell(r.id),
      csvCell(r.program_title),
      csvCell(r.child_first_name),
      csvCell(r.child_last_name),
      csvCell(r.child_date_of_birth),
      csvCell(r.child_allergies),
      csvCell(r.child_emergency_contact_name),
      csvCell(r.child_emergency_contact_phone),
      csvCell(r.parent_first_name),
      csvCell(r.parent_last_name),
      csvCell(r.parent_email),
      csvCell(r.parental_consent_at),
      csvCell(r.status),
      csvCell(r.created_at),
    ].join(','));
  }
  return lines.join('\n');
}
