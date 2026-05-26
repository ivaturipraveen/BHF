import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireMemberSessionOrJson } from '@/lib/session';
import { STRIPE_ENABLED, requireStripe } from '@/lib/stripe';
import {
  getDonationByIdUnchecked,
  markDonationCanceled,
} from '@/lib/queries/donations';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'donations-cancel', 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const guard = await requireMemberSessionOrJson();
  if (!guard.ok) return guard.response;

  const donation = await getDonationByIdUnchecked(params.id);
  if (!donation) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }
  if (donation.member_id !== guard.session.sub) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }
  if (donation.type === 'one_time') {
    return NextResponse.json(
      { error: 'Only recurring donations can be canceled.' },
      { status: 400 },
    );
  }
  if (donation.status === 'canceled') {
    return NextResponse.json({ ok: true, alreadyCanceled: true }, { status: 200 });
  }

  if (STRIPE_ENABLED && donation.stripe_subscription_id) {
    try {
      const stripe = requireStripe();
      await stripe.subscriptions.cancel(donation.stripe_subscription_id);
    } catch (err) {
      console.error('[donations/cancel] stripe cancel failed', err);
      return NextResponse.json(
        { error: 'Could not cancel subscription with payment provider.' },
        { status: 502 },
      );
    }
  }

  await markDonationCanceled(donation.id);
  return NextResponse.json({ ok: true }, { status: 200 });
}
