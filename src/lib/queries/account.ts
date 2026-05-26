import 'server-only';
import { differenceInYears } from 'date-fns';
import { query, withTransaction } from '@/lib/db';
import type {
  Donation,
  YouthChild,
  YouthEnrollment,
  PhotoSubmission,
} from '@/types/db';
import { getMemberById, type PublicMember } from '@/lib/queries/members';

export async function listMyDonations(memberId: string): Promise<Donation[]> {
  return query<Donation>(
    `SELECT id, member_id, stripe_session_id, stripe_payment_intent_id,
            stripe_subscription_id, amount_cents, currency, type, status,
            donor_name, donor_email, donor_address, in_honor_of, receipt_url,
            receipt_sent_at, created_at, updated_at
       FROM donations
      WHERE member_id = $1
      ORDER BY created_at DESC`,
    [memberId],
  );
}

export interface MyRsvp {
  id: string;
  event_id: string;
  event_title: string;
  event_starts_at: Date;
  party_size: number;
  created_at: Date;
}

export async function listMyRsvps(memberId: string): Promise<MyRsvp[]> {
  return query<MyRsvp>(
    `SELECT r.id, r.event_id, e.title AS event_title, e.starts_at AS event_starts_at,
            r.party_size, r.created_at
       FROM rsvps r
       JOIN events e ON e.id = r.event_id
      WHERE r.member_id = $1
      ORDER BY e.starts_at ASC`,
    [memberId],
  );
}

const CHILD_COLUMNS = `
  id, parent_member_id, first_name, last_name, date_of_birth,
  allergies, emergency_contact_name, emergency_contact_phone,
  photo_permission, created_at, updated_at
`;

export async function listMyChildren(memberId: string): Promise<YouthChild[]> {
  return query<YouthChild>(
    `SELECT ${CHILD_COLUMNS}
       FROM youth_children
      WHERE parent_member_id = $1
      ORDER BY created_at ASC`,
    [memberId],
  );
}

export async function getChildById(
  parentMemberId: string,
  childId: string,
): Promise<YouthChild | null> {
  const rows = await query<YouthChild>(
    `SELECT ${CHILD_COLUMNS}
       FROM youth_children
      WHERE id = $1 AND parent_member_id = $2
      LIMIT 1`,
    [childId, parentMemberId],
  );
  return rows[0] ?? null;
}

export interface CreateChildInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  allergies?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  photoPermission?: boolean;
}

export async function createChild(
  parentMemberId: string,
  data: CreateChildInput,
): Promise<YouthChild> {
  const rows = await query<YouthChild>(
    `INSERT INTO youth_children (
       parent_member_id, first_name, last_name, date_of_birth,
       allergies, emergency_contact_name, emergency_contact_phone, photo_permission
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING ${CHILD_COLUMNS}`,
    [
      parentMemberId,
      data.firstName,
      data.lastName,
      data.dateOfBirth,
      data.allergies ?? null,
      data.emergencyContactName ?? null,
      data.emergencyContactPhone ?? null,
      data.photoPermission ?? false,
    ],
  );
  return rows[0];
}

export interface UpdateChildPatch {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  allergies?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  photoPermission?: boolean;
}

export async function updateChild(
  parentMemberId: string,
  childId: string,
  patch: UpdateChildPatch,
): Promise<YouthChild | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  const pushSet = (col: string, val: unknown): void => {
    sets.push(`${col} = $${i++}`);
    params.push(val);
  };
  if (patch.firstName !== undefined) pushSet('first_name', patch.firstName);
  if (patch.lastName !== undefined) pushSet('last_name', patch.lastName);
  if (patch.dateOfBirth !== undefined) pushSet('date_of_birth', patch.dateOfBirth);
  if (patch.allergies !== undefined) pushSet('allergies', patch.allergies);
  if (patch.emergencyContactName !== undefined)
    pushSet('emergency_contact_name', patch.emergencyContactName);
  if (patch.emergencyContactPhone !== undefined)
    pushSet('emergency_contact_phone', patch.emergencyContactPhone);
  if (patch.photoPermission !== undefined)
    pushSet('photo_permission', patch.photoPermission);

  if (sets.length === 0) {
    return getChildById(parentMemberId, childId);
  }

  params.push(childId);
  params.push(parentMemberId);
  const rows = await query<YouthChild>(
    `UPDATE youth_children
        SET ${sets.join(', ')}
      WHERE id = $${i++} AND parent_member_id = $${i}
      RETURNING ${CHILD_COLUMNS}`,
    params,
  );
  return rows[0] ?? null;
}

export async function deleteChild(
  parentMemberId: string,
  childId: string,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM youth_children
      WHERE id = $1 AND parent_member_id = $2
      RETURNING id`,
    [childId, parentMemberId],
  );
  return rows.length > 0;
}

export async function listMyEnrollments(
  memberId: string,
): Promise<YouthEnrollment[]> {
  return query<YouthEnrollment>(
    `SELECT en.id, en.child_id, en.program_id, en.parental_consent_at,
            en.parental_consent_ip, en.parental_consent_user_agent,
            en.status, en.created_at, en.updated_at
       FROM youth_enrollments en
       JOIN youth_children c ON c.id = en.child_id
      WHERE c.parent_member_id = $1
      ORDER BY en.created_at DESC`,
    [memberId],
  );
}

export interface EnrollmentForChild {
  id: string;
  program_id: string;
  program_title: string;
  status: string;
  parental_consent_at: Date;
}

export async function listEnrollmentsForChild(
  parentMemberId: string,
  childId: string,
): Promise<EnrollmentForChild[]> {
  return query<EnrollmentForChild>(
    `SELECT en.id, en.program_id, p.title AS program_title,
            en.status, en.parental_consent_at
       FROM youth_enrollments en
       JOIN youth_children c ON c.id = en.child_id
       JOIN programs p ON p.id = en.program_id
      WHERE c.parent_member_id = $1 AND en.child_id = $2
      ORDER BY en.created_at DESC`,
    [parentMemberId, childId],
  );
}

export interface EnrollmentWithJoins {
  id: string;
  status: string;
  parental_consent_at: Date;
  child_id: string;
  child_first_name: string;
  child_last_name: string;
  child_date_of_birth: Date;
  program_id: string;
  program_slug: string;
  program_title: string;
  program_frequency: string;
  program_hero_image_url: string | null;
}

// The parental_consent_ip / parental_consent_user_agent columns are
// intentionally excluded from this projection — the public list endpoint must
// not echo them. The audit-trail values live in the DB row and are exposed
// only via the member's data-export.
export async function listMyEnrollmentsDetailed(
  memberId: string,
): Promise<EnrollmentWithJoins[]> {
  return query<EnrollmentWithJoins>(
    `SELECT en.id, en.status, en.parental_consent_at,
            c.id AS child_id, c.first_name AS child_first_name,
            c.last_name AS child_last_name, c.date_of_birth AS child_date_of_birth,
            p.id AS program_id, p.slug AS program_slug, p.title AS program_title,
            p.frequency AS program_frequency, p.hero_image_url AS program_hero_image_url
       FROM youth_enrollments en
       JOIN youth_children c ON c.id = en.child_id
       JOIN programs p ON p.id = en.program_id
      WHERE c.parent_member_id = $1
      ORDER BY en.created_at DESC`,
    [memberId],
  );
}

export interface CreateEnrollmentArgs {
  parentMemberId: string;
  childId: string;
  programId: string;
  parentalConsentIp: string | null;
  parentalConsentUserAgent: string | null;
}

export type CreateEnrollmentResult =
  | {
      ok: true;
      enrollment: YouthEnrollment;
      child: YouthChild;
      program: {
        id: string;
        slug: string;
        title: string;
        frequency: string;
        hero_image_url: string | null;
      };
    }
  | {
      ok: false;
      code:
        | 'forbidden'
        | 'program_invalid'
        | 'age_ineligible'
        | 'already_enrolled';
      message: string;
    };

export async function createEnrollment(
  args: CreateEnrollmentArgs,
): Promise<CreateEnrollmentResult> {
  return withTransaction(async (client) => {
    const childRows = await client.query<YouthChild>(
      `SELECT ${CHILD_COLUMNS}
         FROM youth_children
        WHERE id = $1 AND parent_member_id = $2
        LIMIT 1`,
      [args.childId, args.parentMemberId],
    );
    const child = childRows.rows[0];
    if (!child) {
      return {
        ok: false,
        code: 'forbidden',
        message: 'Child not found or not owned by parent.',
      };
    }

    const programRows = await client.query<{
      id: string;
      slug: string;
      title: string;
      frequency: string;
      hero_image_url: string | null;
      min_age_years: number | null;
      max_age_years: number | null;
      is_youth: boolean;
      status: string;
    }>(
      `SELECT id, slug, title, frequency, hero_image_url,
              min_age_years, max_age_years, is_youth, status
         FROM programs
        WHERE id = $1
        LIMIT 1`,
      [args.programId],
    );
    const program = programRows.rows[0];
    if (!program || !program.is_youth || program.status !== 'published') {
      return {
        ok: false,
        code: 'program_invalid',
        message: 'Program is not available for youth enrollment.',
      };
    }

    const age = differenceInYears(new Date(), new Date(child.date_of_birth));
    if (program.min_age_years !== null && age < program.min_age_years) {
      return {
        ok: false,
        code: 'age_ineligible',
        message: `Child is ${age} but program requires age ${program.min_age_years}–${program.max_age_years ?? '∞'}.`,
      };
    }
    if (program.max_age_years !== null && age > program.max_age_years) {
      return {
        ok: false,
        code: 'age_ineligible',
        message: `Child is ${age} but program requires age ${program.min_age_years ?? 0}–${program.max_age_years}.`,
      };
    }

    try {
      const insertRows = await client.query<YouthEnrollment>(
        `INSERT INTO youth_enrollments (
           child_id, program_id, parental_consent_at,
           parental_consent_ip, parental_consent_user_agent, status
         ) VALUES ($1, $2, now(), $3, $4, 'enrolled')
         RETURNING id, child_id, program_id, parental_consent_at,
                   parental_consent_ip, parental_consent_user_agent,
                   status, created_at, updated_at`,
        [
          args.childId,
          args.programId,
          args.parentalConsentIp,
          args.parentalConsentUserAgent,
        ],
      );
      return {
        ok: true,
        enrollment: insertRows.rows[0],
        child,
        program: {
          id: program.id,
          slug: program.slug,
          title: program.title,
          frequency: program.frequency,
          hero_image_url: program.hero_image_url,
        },
      };
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e && e.code === '23505') {
        return {
          ok: false,
          code: 'already_enrolled',
          message: 'Child is already enrolled in this program.',
        };
      }
      throw err;
    }
  });
}

export async function withdrawEnrollment(
  parentMemberId: string,
  enrollmentId: string,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `UPDATE youth_enrollments en
        SET status = 'withdrawn'
       FROM youth_children c
      WHERE en.child_id = c.id
        AND en.id = $1
        AND c.parent_member_id = $2
      RETURNING en.id`,
    [enrollmentId, parentMemberId],
  );
  return rows.length > 0;
}

export async function listMyPhotoSubmissions(
  memberEmail: string,
): Promise<PhotoSubmission[]> {
  return query<PhotoSubmission>(
    `SELECT id, submitter_name, submitter_email, event_id, file_url, caption,
            status, reviewed_by, review_note, created_at, reviewed_at
       FROM photo_submissions
      WHERE submitter_email = $1
      ORDER BY created_at DESC`,
    [memberEmail],
  );
}

export interface DataExport {
  generatedAt: string;
  member: PublicMember | null;
  donations: Donation[];
  rsvps: MyRsvp[];
  youthChildren: YouthChild[];
  youthEnrollments: YouthEnrollment[];
  photoSubmissions: PhotoSubmission[];
}

export async function exportMyData(memberId: string): Promise<DataExport> {
  const member = await getMemberById(memberId);
  const [donations, rsvps, youthChildren, youthEnrollments, photoSubmissions] =
    await Promise.all([
      listMyDonations(memberId),
      listMyRsvps(memberId),
      listMyChildren(memberId),
      listMyEnrollments(memberId),
      member ? listMyPhotoSubmissions(member.email) : Promise.resolve([]),
    ]);
  return {
    generatedAt: new Date().toISOString(),
    member,
    donations,
    rsvps,
    youthChildren,
    youthEnrollments,
    photoSubmissions,
  };
}
