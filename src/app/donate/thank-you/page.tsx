import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { timingSafeEqual } from "crypto";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  donationAccessToken,
  getDonationById,
  getDonationByStripeSession,
} from "@/lib/queries/donations";
import { buildReceiptHtml } from "@/lib/receipts";
import { getSessionFromCookies } from "@/lib/auth";
import { STRIPE_ENABLED } from "@/lib/stripe";
import {
  DONATION_CONTACT_PHONE,
  LEGAL_NAME,
} from "@/lib/config/donations";
import type { Donation } from "@/types/db";

export const dynamic = "force-dynamic";

const description =
  "Thank you for supporting Bharatiya Heritage Foundation. Your contribution sustains our community.";

export const metadata: Metadata = {
  title: "Thank you — BHF",
  description,
  robots: { index: false, follow: false },
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatType(type: Donation["type"]): string {
  if (type === "one_time") return "One-time gift";
  if (type === "monthly") return "Monthly recurring gift";
  return "Yearly recurring gift";
}

function statusVariant(
  status: string,
): "saffron" | "indigo" | "amber" | "gray" {
  switch (status) {
    case "succeeded":
      return "indigo";
    case "pending":
      return "amber";
    default:
      return "gray";
  }
}

function safeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export default async function DonateThankYouPage({
  searchParams,
}: {
  searchParams?: {
    id?: string;
    session_id?: string;
    token?: string;
    demo?: string;
  };
}) {
  const sp = searchParams ?? {};
  const session = await getSessionFromCookies();
  const memberId =
    session && session.role === "member" ? session.sub : null;

  let donation: Donation | null = null;
  let authorizedForPii = false;
  if (sp.session_id) {
    const found = await getDonationByStripeSession(sp.session_id);
    if (found) {
      if (memberId && found.member_id === memberId) {
        donation = found;
        authorizedForPii = true;
      } else if (sp.token) {
        const expected = donationAccessToken(found.id);
        if (safeEqualString(sp.token, expected)) {
          donation = found;
          authorizedForPii = true;
        }
      }
    }
  } else if (sp.id) {
    donation = await getDonationById(sp.id, {
      accessToken: sp.token ?? null,
      memberId,
    });
    authorizedForPii = donation !== null;
  }

  const showMinimal = !authorizedForPii && Boolean(sp.session_id);

  const stubMode = !STRIPE_ENABLED || sp.demo === "1";
  const receiptHtml =
    authorizedForPii && donation && donation.status === "succeeded"
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

  return (
    <main>
      <section className="bg-gradient-to-br from-saffron/15 via-cream to-indigo/10 py-16 md:py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Image
                src="/brand/bhf-logo.jpg"
                alt="Bharatiya Heritage Foundation logo"
                width={80}
                height={80}
                className="rounded-full"
              />
            </div>
            <p className="text-saffron uppercase tracking-widest text-sm font-semibold mb-3">
              Donation received
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-indigo mb-4">
              {authorizedForPii && donation
                ? `Thank you, ${donation.donor_name}!`
                : "Thank you for your support!"}
            </h1>
            <p className="text-lg text-warm-gray leading-relaxed">
              Your seva keeps {LEGAL_NAME}&apos;s festivals, youth programs,
              and community service alive. We&apos;re grateful.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {authorizedForPii && donation ? (
              <Card className="flex flex-col gap-4">
                <h2 className="font-display text-2xl text-indigo">
                  Donation summary
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="text-warm-gray">Amount</dt>
                    <dd className="font-semibold text-indigo text-base">
                      {formatCents(donation.amount_cents)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-warm-gray">Type</dt>
                    <dd className="font-medium text-indigo">
                      {formatType(donation.type)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-warm-gray">Status</dt>
                    <dd>
                      <Badge variant={statusVariant(donation.status)}>
                        {donation.status}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-warm-gray">Donation ID</dt>
                    <dd className="font-mono text-xs text-indigo break-all">
                      {donation.id}
                    </dd>
                  </div>
                  {donation.in_honor_of ? (
                    <div className="sm:col-span-2">
                      <dt className="text-warm-gray">In honor of</dt>
                      <dd className="font-medium text-indigo">
                        {donation.in_honor_of}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                <p className="text-sm text-warm-gray leading-relaxed">
                  A receipt is on its way to{" "}
                  <span className="font-medium text-indigo">
                    {donation.donor_email}
                  </span>
                  .
                  {stubMode ? (
                    <span className="block mt-2 text-amber-burnt">
                      In demo mode, receipts are queued in the email log table
                      for developer review.
                    </span>
                  ) : null}
                </p>
              </Card>
            ) : showMinimal ? (
              <Card>
                <h2 className="font-display text-2xl text-indigo mb-2">
                  Thank you!
                </h2>
                <p className="text-warm-gray leading-relaxed">
                  Your contribution is being processed. A receipt will be
                  emailed to the address you provided. You can also view your
                  donation on file in your account if you signed in.
                </p>
              </Card>
            ) : (
              <Card>
                <h2 className="font-display text-2xl text-indigo mb-2">
                  Thank you for your support!
                </h2>
                <p className="text-warm-gray leading-relaxed">
                  We couldn&apos;t locate the donation record from this link,
                  but your generosity matters. If you need a receipt, please
                  call{" "}
                  <a
                    href={`tel:${DONATION_CONTACT_PHONE.replace(/[^\d+]/g, "")}`}
                    className="text-saffron underline font-medium"
                  >
                    {DONATION_CONTACT_PHONE}
                  </a>{" "}
                  and we&apos;ll resend it right away.
                </p>
              </Card>
            )}

            {receiptHtml ? (
              <Card>
                <h2 className="font-display text-xl text-indigo mb-3">
                  Your receipt
                </h2>
                <div
                  className="rounded-md border border-gray-200 bg-white overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: receiptHtml }}
                />
              </Card>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="text-saffron font-semibold hover:text-amber-burnt"
              >
                Return to BHF home →
              </Link>
              {memberId ? (
                <Link
                  href="/account/donations"
                  className="text-indigo font-semibold hover:text-saffron sm:ml-6"
                >
                  View my donations →
                </Link>
              ) : null}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
