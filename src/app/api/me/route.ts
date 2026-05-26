import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { withTransaction } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import { clearSessionCookie } from '@/lib/cookies';
import { optionalUsPhoneSchema } from '@/lib/validation';
import { getMemberById, updateMember } from '@/lib/queries/members';
import { reportError } from '@/lib/sentry';
import { memberInterestSchema } from '@/types/db';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  phone: optionalUsPhoneSchema,
  city: z.string().trim().max(120).nullish(),
  bio: z.string().trim().max(2000).nullish(),
  photoUrl: z.string().url().max(2048).nullish(),
  interests: z.array(memberInterestSchema).nullish(),
  familySize: z.string().trim().max(40).nullish(),
  directoryOptIn: z.boolean().optional(),
  newsletterOptIn: z.boolean().optional(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-get', 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  try {
    const member = await getMemberById(guard.session.sub);
    if (!member) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }
    return NextResponse.json({ member }, { status: 200 });
  } catch (err) {
    reportError(err, { route: 'me/GET' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-patch', 10, 60_000);
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

  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  try {
    const member = await updateMember(guard.session.sub, {
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone === undefined ? undefined : data.phone,
      city: data.city === undefined ? undefined : data.city,
      bio: data.bio === undefined ? undefined : data.bio,
      photo_url: data.photoUrl === undefined ? undefined : data.photoUrl,
      interests: data.interests === undefined ? undefined : data.interests,
      family_size: data.familySize === undefined ? undefined : data.familySize,
      directory_opt_in: data.directoryOptIn,
      newsletter_opt_in: data.newsletterOptIn,
    });
    if (!member) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }
    return NextResponse.json({ member }, { status: 200 });
  } catch (err) {
    reportError(err, { route: 'me/PATCH' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-delete', 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;
  const memberId = guard.session.sub;

  try {
    await withTransaction(async (client) => {
      const memberRows = await client.query<{ email: string }>(
        `SELECT email FROM members WHERE id = $1 LIMIT 1`,
        [memberId],
      );
      const member = memberRows.rows[0];

      // Preserve donations for 501(c)(3) record-keeping — null out the member link.
      await client.query(
        `UPDATE donations SET member_id = NULL WHERE member_id = $1`,
        [memberId],
      );
      // Preserve event RSVP history with PII detached from the member row.
      await client.query(
        `UPDATE rsvps SET member_id = NULL WHERE member_id = $1`,
        [memberId],
      );
      // Scrub PII from past photo submissions / contact inquiries matched by email.
      if (member) {
        await client.query(
          `UPDATE photo_submissions SET submitter_name = NULL, submitter_email = NULL WHERE submitter_email = $1`,
          [member.email],
        );
        await client.query(
          `UPDATE contact_inquiries SET name = NULL, email = NULL, phone = NULL WHERE email = $1`,
          [member.email],
        );
      }
      // youth_children CASCADE delete (and youth_enrollments CASCADE through that).
      await client.query(`DELETE FROM members WHERE id = $1`, [memberId]);
    });

    await clearSessionCookie();

    return NextResponse.json({ ok: true, deleted: true }, { status: 200 });
  } catch (err) {
    reportError(err, { route: 'me/DELETE' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
