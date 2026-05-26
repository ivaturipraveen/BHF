import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import { optionalUsPhoneSchema } from '@/lib/validation';
import {
  listMyChildren,
  createChild,
  listEnrollmentsForChild,
} from '@/lib/queries/account';

export const dynamic = 'force-dynamic';

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date_of_birth must be YYYY-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), 'Invalid date')
  .refine((s) => {
    const dob = new Date(`${s}T00:00:00Z`);
    const now = new Date();
    if (dob > now) return false;
    const ageMs = now.getTime() - dob.getTime();
    const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
    return ageYears >= 0 && ageYears <= 21;
  }, 'date_of_birth must yield an age between 0 and 21');

const createSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  dateOfBirth: isoDate,
  allergies: z.string().trim().max(1000).optional().nullable(),
  emergencyContactName: z.string().trim().max(120).optional().nullable(),
  emergencyContactPhone: optionalUsPhoneSchema,
  photoPermission: z.boolean().optional(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-children-list', 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  try {
    const children = await listMyChildren(guard.session.sub);
    const withEnrollments = await Promise.all(
      children.map(async (c) => {
        const enrollments = await listEnrollmentsForChild(
          guard.session.sub,
          c.id,
        );
        return {
          id: c.id,
          parentMemberId: c.parent_member_id,
          firstName: c.first_name,
          lastName: c.last_name,
          dateOfBirth: c.date_of_birth,
          allergies: c.allergies,
          emergencyContactName: c.emergency_contact_name,
          emergencyContactPhone: c.emergency_contact_phone,
          photoPermission: c.photo_permission,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          enrollments: enrollments.map((e) => ({
            id: e.id,
            programId: e.program_id,
            programTitle: e.program_title,
            status: e.status,
            parentalConsentAt: e.parental_consent_at,
          })),
        };
      }),
    );
    return NextResponse.json({ children: withEnrollments }, { status: 200 });
  } catch (err) {
    console.error('[me/children/GET] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-children-create', 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  try {
    const child = await createChild(guard.session.sub, {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      allergies: data.allergies ?? null,
      emergencyContactName: data.emergencyContactName ?? null,
      emergencyContactPhone: data.emergencyContactPhone ?? null,
      photoPermission: data.photoPermission ?? false,
    });
    return NextResponse.json(
      {
        child: {
          id: child.id,
          parentMemberId: child.parent_member_id,
          firstName: child.first_name,
          lastName: child.last_name,
          dateOfBirth: child.date_of_birth,
          allergies: child.allergies,
          emergencyContactName: child.emergency_contact_name,
          emergencyContactPhone: child.emergency_contact_phone,
          photoPermission: child.photo_permission,
          createdAt: child.created_at,
          updatedAt: child.updated_at,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[me/children/POST] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
