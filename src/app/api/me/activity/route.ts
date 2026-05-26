import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import { getActivityFeed } from '@/lib/queries/account';
import { reportError } from '@/lib/sentry';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-activity', 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  try {
    const activity = await getActivityFeed(guard.session.sub, 20);
    return NextResponse.json({ activity }, { status: 200 });
  } catch (err) {
    reportError(err, { route: 'me/activity' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
