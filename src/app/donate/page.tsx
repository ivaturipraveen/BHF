import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Markdown } from "@/components/ui/Markdown";
import { DonationForm } from "@/components/forms/DonationForm";
import { getPageBySlug } from "@/lib/queries/pages";
import { STRIPE_ENABLED } from "@/lib/stripe";
import {
  DONATION_TIERS,
  LARGE_GIFT_THRESHOLD,
  DONATION_CONTACT_PHONE,
  EIN,
  LEGAL_NAME,
} from "@/lib/config/donations";
import { siteConfig } from "@/data/content";

export const revalidate = 60;

const description =
  "Support BHF — your tax-deductible donation funds festivals, youth programs, and community service in Solano County.";

export const metadata: Metadata = {
  title: "Donate — BHF",
  description,
  openGraph: { title: "Donate — BHF", description, type: "website" },
  twitter: {
    card: "summary_large_image",
    title: "Donate — BHF",
    description,
  },
};

const otherWays = [
  {
    title: "Corporate matching",
    body:
      "Many employers will match your gift to BHF — sometimes 1:1 or more. Let us help you submit your match.",
    href: "/contact?type=sponsor",
    cta: "Talk to us about matching",
  },
  {
    title: "Employer payroll deduction",
    body:
      "Set up automatic giving through your employer's payroll. We'll send you the forms you need.",
    href: "/contact?type=planned_giving",
    cta: "Start payroll giving",
  },
  {
    title: "Stock donations",
    body:
      "Gifting appreciated securities is one of the most tax-efficient ways to give. Contact us for transfer details.",
    href: "/contact?type=planned_giving",
    cta: "Request stock-transfer details",
  },
  {
    title: "Planned giving",
    body:
      "Include BHF in your estate plans, donor-advised fund, or IRA distribution. Your legacy sustains community.",
    href: "/contact?type=planned_giving",
    cta: "Explore planned giving",
  },
];

const faqs = [
  {
    q: "Is my donation tax-deductible?",
    a: `Yes. ${LEGAL_NAME} is a registered 501(c)(3) nonprofit (EIN ${EIN}). Donations are tax-deductible to the extent permitted by U.S. law.`,
  },
  {
    q: "How do I cancel a recurring donation?",
    a: "Log in to your account and visit your donation history. You can also email us and we'll cancel your recurring gift within one business day.",
  },
  {
    q: "Can I donate by check or stock?",
    a: `Absolutely. Please call ${DONATION_CONTACT_PHONE} or email ${siteConfig.email} for check-mailing instructions or stock-transfer details.`,
  },
  {
    q: "Will I receive a receipt?",
    a: "Yes — every successful donation triggers an emailed acknowledgment with our EIN, suitable for tax filing. Please keep it as your official record.",
  },
  {
    q: "How do I update my card details?",
    a: "Log in to your account and visit your donation history. For now, please contact us if you need to update payment details on a recurring gift.",
  },
  {
    q: "Where does my money go?",
    a: "100% of donations go directly to programs and services: festivals, youth programs, charitable drives, and community service. BHF operates without paid program staff.",
  },
];

export default async function DonatePage() {
  const impact = await getPageBySlug("donate-impact");
  const aboutDonate = impact ?? (await getPageBySlug("about-donate"));

  return (
    <main>
      <section className="bg-white py-12 md:py-16">
        <Container>
          <h1 className="font-display text-4xl md:text-5xl text-indigo mb-6">
            Your seva sustains our future
          </h1>
          {aboutDonate?.body_md ? (
            <div className="max-w-3xl text-lg">
              <Markdown content={aboutDonate.body_md} />
            </div>
          ) : (
            <p className="max-w-3xl text-lg text-warm-gray leading-relaxed">
              Every dollar you give to BHF goes directly to community
              programs — festivals, youth empowerment, classes, and seva
              initiatives that strengthen Solano County and the wider Bay
              Area.
            </p>
          )}
        </Container>
      </section>

      {!STRIPE_ENABLED ? (
        <section className="bg-white pb-4">
          <Container>
            <div
              role="status"
              className="bg-amber-burnt/10 border border-amber-burnt rounded-xl p-6 text-amber-burnt max-w-3xl"
            >
              <p className="font-semibold mb-1">Demo mode</p>
              <p className="leading-relaxed text-sm md:text-base">
                Secure payments aren&apos;t live yet. You can still see the
                donation flow; submissions will be recorded for testing only
                and no card will be charged. To complete a real gift today,
                please call{" "}
                <a
                  href={`tel:${DONATION_CONTACT_PHONE.replace(/[^\d+]/g, "")}`}
                  className="underline font-semibold"
                >
                  {DONATION_CONTACT_PHONE}
                </a>{" "}
                or email{" "}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="underline font-semibold"
                >
                  {siteConfig.email}
                </a>
                .
              </p>
            </div>
          </Container>
        </section>
      ) : null}

      <section className="bg-white py-8 md:py-12">
        <Container>
          <div className="max-w-3xl">
            <DonationForm
              tiers={DONATION_TIERS}
              largeGiftThreshold={LARGE_GIFT_THRESHOLD}
              phone={DONATION_CONTACT_PHONE}
              ein={EIN}
              legalName={LEGAL_NAME}
              stubMode={!STRIPE_ENABLED}
            />
          </div>
        </Container>
      </section>

      <section className="bg-cream py-12 md:py-16">
        <Container>
          <Card className="max-w-3xl mx-auto bg-white border-saffron">
            <h2 className="font-display text-2xl text-indigo mb-3">
              Where your gift goes
            </h2>
            <p className="text-warm-gray leading-relaxed">
              Your contribution funds festivals, youth programs, charitable
              drives, and community service. 100% of donations go directly to
              programs and services.
            </p>
          </Card>
        </Container>
      </section>

      <section className="bg-white py-12 md:py-16">
        <Container>
          <h2 className="font-display text-2xl md:text-3xl text-indigo mb-6">
            Other ways to give
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherWays.map((way) => (
              <Card key={way.title} className="flex flex-col gap-3">
                <h3 className="font-display text-xl text-indigo">
                  {way.title}
                </h3>
                <p className="text-warm-gray leading-relaxed text-sm">
                  {way.body}
                </p>
                <Link
                  href={way.href}
                  className="text-saffron font-medium hover:text-amber-burnt mt-auto"
                >
                  {way.cta} →
                </Link>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-cream py-12 md:py-16">
        <Container>
          <h2 className="font-display text-2xl md:text-3xl text-indigo mb-6">
            Donor FAQ
          </h2>
          <div className="max-w-3xl flex flex-col gap-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-gray-200 bg-white p-5 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-display text-lg text-indigo flex items-center justify-between">
                  <span>{f.q}</span>
                  <span className="ml-3 text-saffron transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-warm-gray leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
