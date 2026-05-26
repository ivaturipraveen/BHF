import type { Metadata } from "next";
import Link from "next/link";
import { Twitter, Facebook, Mail, Link2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ContactForm } from "@/components/forms/ContactForm";
import {
  twitterShareUrl,
  facebookShareUrl,
  mailtoShareUrl,
} from "@/lib/share";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://bhfcommunity.org";

const description =
  "Become a member, volunteer, sponsor an event, donate, or help spread the word. Five ways to get involved with BHF.";

export const metadata: Metadata = {
  title: "Get Involved — BHF",
  description,
  openGraph: { title: "Get Involved — BHF", description, type: "website" },
  twitter: {
    card: "summary_large_image",
    title: "Get Involved — BHF",
    description,
  },
};

export default function GetInvolvedPage() {
  const target = {
    url: SITE_URL,
    title: "Bharatiya Heritage Foundation",
    text: "Check out the Bharatiya Heritage Foundation — building community and celebrating heritage in Solano County.",
  };

  return (
    <main>
      <section className="bg-white py-12 md:py-16">
        <Container>
          <p className="text-xs uppercase tracking-widest text-saffron">
            Join us
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-indigo mt-3 mb-4">
            Get involved
          </h1>
          <p className="text-warm-gray max-w-2xl text-lg leading-relaxed">
            However you want to show up — membership, time, talent, treasure, or
            voice — there&apos;s a place for you here.
          </p>
        </Container>
      </section>

      <section className="bg-cream py-16">
        <Container>
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl text-indigo mb-3">
              Become a member
            </h2>
            <Card
              variant="default"
              className="border-saffron/30 bg-white"
            >
              <p className="text-warm-gray leading-relaxed mb-4">
                Member sign-up is launching soon — full benefits include
                members-only events, early festival access, and an exclusive
                content library.
              </p>
              <ButtonLink
                href="/contact?type=general"
                variant="secondary"
                size="md"
              >
                Notify me when membership opens
              </ButtonLink>
            </Card>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl text-indigo mb-3">
              Volunteer
            </h2>
            <p className="text-warm-gray leading-relaxed mb-6">
              Help us run festivals, set up classes, lead seva projects, or
              support youth programs. Tell us what excites you.
            </p>
            <ContactForm defaultType="volunteer" />
          </div>
        </Container>
      </section>

      <section className="bg-cream py-16">
        <Container>
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl text-indigo mb-3">
              Sponsor an event
            </h2>
            <p className="text-warm-gray leading-relaxed mb-6">
              Local businesses and family sponsors make our festivals possible.
              Let&apos;s find a tier that fits.
            </p>
            <ContactForm defaultType="sponsor" />
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl text-indigo mb-3">
              Submit youth for a program
            </h2>
            <Card variant="default" className="bg-cream/50">
              <p className="text-warm-gray leading-relaxed mb-4">
                Member account required (launching soon). In the meantime, tell
                us about your interest and we&apos;ll follow up.
              </p>
              <ButtonLink href="/contact?type=general" variant="secondary" size="md">
                Reach out about youth programs
              </ButtonLink>
            </Card>
          </div>
        </Container>
      </section>

      <section className="bg-cream py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-8 items-center">
            <div>
              <h2 className="font-display text-3xl text-indigo mb-3">
                Donate
              </h2>
              <p className="text-warm-gray leading-relaxed mb-6">
                Your support sustains everything we do — from festivals to youth
                mentorship. Every gift is tax-deductible.
              </p>
              <ButtonLink href="/donate" variant="primary" size="lg">
                Make a donation
              </ButtonLink>
            </div>
            <Card variant="elevated" className="bg-white text-center">
              <p className="font-display text-2xl text-indigo">
                Every dollar
              </p>
              <p className="text-warm-gray mt-2 leading-relaxed">
                goes directly to programs, festivals, and seva.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl text-indigo mb-3">
              Spread the word
            </h2>
            <p className="text-warm-gray leading-relaxed mb-6">
              Share BHF with friends and family. Pick a channel:
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={twitterShareUrl(target)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-medium text-indigo hover:bg-saffron hover:text-white transition-colors"
              >
                <Twitter size={16} />
                Share on X
              </a>
              <a
                href={facebookShareUrl(target)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-medium text-indigo hover:bg-saffron hover:text-white transition-colors"
              >
                <Facebook size={16} />
                Share on Facebook
              </a>
              <a
                href={mailtoShareUrl(target)}
                className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-medium text-indigo hover:bg-saffron hover:text-white transition-colors"
              >
                <Mail size={16} />
                Email a friend
              </a>
              <Link
                href={SITE_URL}
                className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-medium text-indigo hover:bg-saffron hover:text-white transition-colors"
              >
                <Link2 size={16} />
                Copy link
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
