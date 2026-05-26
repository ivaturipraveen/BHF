import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import { listMyRsvps } from '@/lib/queries/account';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-rsvps', 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  try {
    const rsvps = await listMyRsvps(guard.session.sub);
    const camel = rsvps.map((r) => ({
      id: r.id,
      eventId: r.event_id,
      eventTitle: r.event_title,
      eventStartsAt: r.event_starts_at,
      partySize: r.party_size,
      createdAt: r.created_at,
    }));
    return NextResponse.json({ rsvps: camel }, { status: 200 });
  } catch (err) {
    console.error('[me/rsvps] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
