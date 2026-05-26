import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import { uuidSchema } from '@/lib/validation';
import { cancelRsvp } from '@/lib/queries/account';
import { reportError } from '@/lib/sentry';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  ctx: { params: { id: string } },
): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-rsvps-cancel', 10, 60_000);
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
    const result = await cancelRsvp(guard.session.sub, idParsed.data);
    if (!result.ok) {
      if (result.code === 'past_event') {
        return NextResponse.json(
          { error: 'Cannot cancel a past event RSVP.' },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    reportError(err, { route: 'me/rsvps/[id]/DELETE' });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
