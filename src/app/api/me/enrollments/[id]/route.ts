import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import { uuidSchema } from '@/lib/validation';
import { withdrawEnrollment } from '@/lib/queries/account';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  ctx: { params: { id: string } },
): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-enrollments-delete', 30, 60_000);
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
    const ok = await withdrawEnrollment(guard.session.sub, idParsed.data);
    if (!ok) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, status: 'withdrawn' }, { status: 200 });
  } catch (err) {
    console.error('[me/enrollments/[id]/DELETE] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
