import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { getSessionFromCookies } from '@/lib/auth';
import { getDonationById } from '@/lib/queries/donations';
import { buildReceiptHtml } from '@/lib/receipts';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(ip, 'donations-get', 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const donationId = params.id;
  const token = req.nextUrl.searchParams.get('token');

  let memberId: string | null = null;
  try {
    const session = await getSessionFromCookies();
    if (session && session.role === 'member') memberId = session.sub;
  } catch {
    memberId = null;
  }

  const donation = await getDonationById(donationId, {
    accessToken: token,
    memberId,
  });

  if (!donation) {
    return NextResponse.json(
      { error: 'Donation not found or access denied.' },
      { status: 401 },
    );
  }

  const receiptHtml =
    donation.status === 'succeeded'
      ? buildReceiptHtml({
          donorName: donation.donor_name,
          amountCents: donation.amount_cents,
          type: donation.type,
          dateIso: new Date(donation.created_at).toISOString(),
          donationId: donation.id,
          address: donation.donor_address,
          inHonorOf: donation.in_honor_of,
        })
      : null;

  return NextResponse.json(
    {
      id: donation.id,
      amountCents: donation.amount_cents,
      type: donation.type,
      status: donation.status,
      donorName: donation.donor_name,
      donorEmail: donation.donor_email,
      createdAt: donation.created_at,
      receiptHtml,
    },
    { status: 200 },
  );
}
