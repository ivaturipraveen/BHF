import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit, getClientIp, getRawClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import { uuidSchema } from '@/lib/validation';
import {
  listMyEnrollmentsDetailed,
  createEnrollment,
} from '@/lib/queries/account';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  childId: uuidSchema,
  programId: uuidSchema,
  consentAcknowledged: z.boolean(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-enrollments-list', 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  try {
    const rows = await listMyEnrollmentsDetailed(guard.session.sub);
    const enrollments = rows.map((r) => ({
      id: r.id,
      status: r.status,
      parentalConsentAt: r.parental_consent_at,
      child: {
        id: r.child_id,
        firstName: r.child_first_name,
        lastName: r.child_last_name,
        dateOfBirth: r.child_date_of_birth,
      },
      program: {
        id: r.program_id,
        slug: r.program_slug,
        title: r.program_title,
        frequency: r.program_frequency,
        hero_image_url: r.program_hero_image_url,
      },
    }));
    return NextResponse.json({ enrollments }, { status: 200 });
  } catch (err) {
    console.error('[me/enrollments/GET] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-enrollments-create', 30, 60_000);
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

  if (data.consentAcknowledged !== true) {
    return NextResponse.json(
      { error: 'parental_consent_required' },
      { status: 400 },
    );
  }

  // COPPA: capture IP + user-agent exactly as received; do not normalize.
  // Use getRawClientIp so the stored value is a clean IP (not a UA-hash composite).
  const parentalConsentIp = getRawClientIp(req.headers);
  const parentalConsentUserAgent = req.headers.get('user-agent');

  try {
    const result = await createEnrollment({
      parentMemberId: guard.session.sub,
      childId: data.childId,
      programId: data.programId,
      parentalConsentIp,
      parentalConsentUserAgent,
    });

    if (!result.ok) {
      const status =
        result.code === 'forbidden'
          ? 403
          : result.code === 'already_enrolled'
            ? 409
            : 400;
      return NextResponse.json(
        { error: result.code, message: result.message },
        { status },
      );
    }

    const { enrollment, child, program } = result;
    // Strip parental_consent_ip and parental_consent_user_agent from the API
    // response. They remain in the DB row for audit/compliance and are
    // surfaced to the member via /api/me/data-export (GDPR Article 20), but
    // there's no reason to echo them back on the public-facing endpoints.
    const safeEnrollment = {
      id: enrollment.id,
      status: enrollment.status,
      parentalConsentAt: enrollment.parental_consent_at,
      child: {
        id: child.id,
        firstName: child.first_name,
        lastName: child.last_name,
        dateOfBirth: child.date_of_birth,
      },
      program: {
        id: program.id,
        slug: program.slug,
        title: program.title,
        frequency: program.frequency,
        hero_image_url: program.hero_image_url,
      },
    };
    return NextResponse.json(
      { enrollment: safeEnrollment },
      { status: 201 },
    );
  } catch (err) {
    console.error('[me/enrollments/POST] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
