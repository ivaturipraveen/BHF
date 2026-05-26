import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import {
  getMemberPreferences,
  updateMemberPreferences,
} from '@/lib/queries/account';
import { getMemberById } from '@/lib/queries/members';
import {
  MAILCHIMP_ENABLED,
  unsubscribeFromNewsletter,
} from '@/lib/mailchimp';
import { reportError } from '@/lib/sentry';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  newsletterOptIn: z.boolean().optional(),
  directoryOptIn: z.boolean().optional(),
  eventRemindersOptIn: z.boolean().optional(),
  donationReceiptsOptIn: z.boolean().optional(),
  memberMessagesOptIn: z.boolean().optional(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-preferences-get', 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  try {
    const prefs = await getMemberPreferences(guard.session.sub);
    if (!prefs) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }
    return NextResponse.json({ preferences: prefs }, { status: 200 });
  } catch (err) {
    reportError(err, { route: 'me/preferences/GET' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-preferences-patch', 10, 60_000);
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
    const previous = await getMemberPreferences(guard.session.sub);
    if (!previous) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }

    const updated = await updateMemberPreferences(guard.session.sub, {
      newsletter: data.newsletterOptIn,
      directory: data.directoryOptIn,
      eventReminders: data.eventRemindersOptIn,
      donationReceipts: data.donationReceiptsOptIn,
      memberMessages: data.memberMessagesOptIn,
    });

    if (
      MAILCHIMP_ENABLED &&
      data.newsletterOptIn === false &&
      previous.newsletter === true
    ) {
      const member = await getMemberById(guard.session.sub);
      if (member?.email) {
        try {
          await unsubscribeFromNewsletter(member.email);
        } catch (err) {
          reportError(err, {
            route: 'me/preferences/PATCH:mailchimp-unsubscribe',
          });
        }
      }
    }

    return NextResponse.json({ preferences: updated }, { status: 200 });
  } catch (err) {
    reportError(err, { route: 'me/preferences/PATCH' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
