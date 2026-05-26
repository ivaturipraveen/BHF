import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import { listMyDonations } from '@/lib/queries/account';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'me-donations', 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  try {
    const rows = await listMyDonations(guard.session.sub);
    const donations = rows.map((d) => ({
      id: d.id,
      amountCents: d.amount_cents,
      type: d.type,
      status: d.status,
      donorName: d.donor_name,
      createdAt: d.created_at,
      receiptUrl: `/api/donations/${d.id}`,
    }));
    return NextResponse.json({ donations }, { status: 200 });
  } catch (err) {
    console.error('[me/donations] failed', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
