import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import { optionalUsPhoneSchema, uuidSchema } from '@/lib/validation';
import {
  getChildById,
  updateChild,
  deleteChild,
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

const patchSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  dateOfBirth: isoDate.optional(),
  allergies: z.string().trim().max(1000).optional().nullable(),
  emergencyContactName: z.string().trim().max(120).optional().nullable(),
  emergencyContactPhone: optionalUsPhoneSchema,
  photoPermission: z.boolean().optional(),
});

function serialize(c: {
  id: string;
  parent_member_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  allergies: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  photo_permission: boolean;
  created_at: Date;
  updated_at: Date;
}) {
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
  };
}

export async function GET(
  req: NextRequest,
  ctx: { params: { id: string } },
): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-children-show', 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  const idParsed = uuidSchema.safeParse(ctx.params.id);
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  try {
    const child = await getChildById(guard.session.sub, idParsed.data);
    if (!child) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }
    return NextResponse.json({ child: serialize(child) }, { status: 200 });
  } catch (err) {
    console.error('[me/children/[id]/GET] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: { id: string } },
): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-children-update', 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  const idParsed = uuidSchema.safeParse(ctx.params.id);
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  try {
    const child = await updateChild(guard.session.sub, idParsed.data, {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      allergies: data.allergies === undefined ? undefined : data.allergies,
      emergencyContactName:
        data.emergencyContactName === undefined
          ? undefined
          : data.emergencyContactName,
      emergencyContactPhone:
        data.emergencyContactPhone === undefined
          ? undefined
          : data.emergencyContactPhone,
      photoPermission: data.photoPermission,
    });
    if (!child) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }
    return NextResponse.json({ child: serialize(child) }, { status: 200 });
  } catch (err) {
    console.error('[me/children/[id]/PATCH] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: { id: string } },
): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-children-delete', 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  const idParsed = uuidSchema.safeParse(ctx.params.id);
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  try {
    const ok = await deleteChild(guard.session.sub, idParsed.data);
    if (!ok) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[me/children/[id]/DELETE] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
