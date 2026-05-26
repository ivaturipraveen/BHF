import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Users, DollarSign, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Markdown } from "@/components/ui/Markdown";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgramCard } from "@/components/cards/ProgramCard";
import {
  getProgramBySlug,
  listPrograms,
} from "@/lib/queries/programs";
import { getSessionFromCookies } from "@/lib/auth";
import { jsonLdString } from "@/lib/jsonLd";

export const dynamic = "force-dynamic";

const frequencyLabels = {
  monthly: "Monthly",
  annual: "Annual",
  rolling: "Rolling",
} as const;

const categoryLabels = {
  cultural: "Cultural",
  educational: "Educational",
  charitable: "Charitable",
  wellness: "Wellness",
  youth: "Youth",
} as const;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const program = await getProgramBySlug(params.slug);
  if (!program) {
    return { title: "Program not found — BHF" };
  }
  const title = `Program · ${program.title} — BHF`;
  const description = program.short_description;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: program.hero_image_url
        ? [{ url: program.hero_image_url, alt: program.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function ageRange(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) return `${min}–${max} yrs`;
  if (min !== null) return `${min}+ yrs`;
  if (max !== null) return `up to ${max} yrs`;
  return null;
}

export default async function ProgramDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [program, session] = await Promise.all([
    getProgramBySlug(params.slug),
    getSessionFromCookies(),
  ]);
  if (!program || program.status !== "published") notFound();

  const isYouth = program.category === "youth";
  const isYouthProgram = program.is_youth === true;
  const isMember = session?.role === "member";
  const ctaHref = isYouth ? "/get-involved" : "/contact?type=general";
  const ctaLabel = isYouth ? "Register interest" : "Get in touch";
  const registerHref = `/account/register-youth?programId=${program.id}`;
  const loginRegisterHref = `/login?next=${encodeURIComponent(registerHref)}`;

  const allPrograms = await listPrograms();
  const otherPrograms = allPrograms
    .filter((p) => p.id !== program.id)
    .slice(0, 3);

  const ages = ageRange(program.min_age_years, program.max_age_years);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.title,
    description: program.short_description,
    provider: {
      "@type": "NGO",
      name: "Bharatiya Heritage Foundation",
      sameAs: "https://bhfcommunity.org",
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      <PageHeader
        eyebrow="Program"
        title={program.title}
        description={program.short_description}
      />

      <section className="bg-white py-12 md:py-16">
        <Container>
          {program.hero_image_url ? (
            <div className="relative aspect-[16/7] w-full mb-10 overflow-hidden rounded-2xl bg-cream">
              <Image
                src={program.hero_image_url}
                alt={program.title}
                fill
                sizes="(min-width: 1280px) 1200px, 100vw"
                priority
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="indigo">{categoryLabels[program.category]}</Badge>
            <Badge variant="saffron">
              {frequencyLabels[program.frequency]}
            </Badge>
          </div>

          {isYouthProgram ? (
            <div className="mb-10 max-w-3xl rounded-xl border border-saffron/40 bg-cream p-5">
              {isMember ? (
                <>
                  <h2 className="font-display text-lg text-indigo">
                    Enroll your child
                  </h2>
                  <p className="mt-1 text-sm text-warm-gray">
                    This is a youth program. Register your child through the
                    parent portal.
                  </p>
                  <div className="mt-4">
                    <ButtonLink
                      href={registerHref}
                      variant="primary"
                      size="md"
                    >
                      Register your child →
                    </ButtonLink>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-display text-lg text-indigo">
                    Enroll your child
                  </h2>
                  <p className="mt-1 text-sm text-warm-gray">
                    Sign in as a member to register your child for this youth
                    program.
                  </p>
                  <div className="mt-4">
                    <Link
                      href={loginRegisterHref}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-white hover:bg-amber-burnt min-h-[44px]"
                    >
                      Sign in to register your child →
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
            <div className="max-w-3xl order-2 lg:order-1">
              {program.description_md ? (
                <Markdown content={program.description_md} />
              ) : null}

              {program.schedule_md ? (
                <div className="mt-8">
                  <h2 className="font-display text-2xl text-indigo mb-3">
                    Schedule
                  </h2>
                  <Markdown content={program.schedule_md} />
                </div>
              ) : null}

              {program.who_for ? (
                <div className="mt-8">
                  <h2 className="font-display text-2xl text-indigo mb-3">
                    Who it&apos;s for
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    {program.who_for}
                  </p>
                </div>
              ) : null}

              {program.cost_md ? (
                <div className="mt-8">
                  <h2 className="font-display text-2xl text-indigo mb-3">
                    Cost
                  </h2>
                  <Markdown content={program.cost_md} />
                </div>
              ) : null}
            </div>

            <aside className="order-1 lg:order-2 lg:sticky lg:top-24 self-start space-y-6">
              {/* Quick facts */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-display text-lg text-indigo mb-4">
                  Quick facts
                </h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-saffron mt-0.5 flex-shrink-0" />
                    <div>
                      <dt className="font-semibold text-indigo">Frequency</dt>
                      <dd className="text-warm-gray">
                        {frequencyLabels[program.frequency]}
                      </dd>
                    </div>
                  </div>
                  {ages ? (
                    <div className="flex items-start gap-3">
                      <Users size={16} className="text-saffron mt-0.5 flex-shrink-0" />
                      <div>
                        <dt className="font-semibold text-indigo">Age range</dt>
                        <dd className="text-warm-gray">{ages}</dd>
                      </div>
                    </div>
                  ) : null}
                  {program.location ? (
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-saffron mt-0.5 flex-shrink-0" />
                      <div>
                        <dt className="font-semibold text-indigo">Location</dt>
                        <dd className="text-warm-gray">{program.location}</dd>
                      </div>
                    </div>
                  ) : null}
                  {program.cost_md ? (
                    <div className="flex items-start gap-3">
                      <DollarSign size={16} className="text-saffron mt-0.5 flex-shrink-0" />
                      <div>
                        <dt className="font-semibold text-indigo">Cost</dt>
                        <dd className="text-warm-gray">See cost details below</dd>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-start gap-3">
                    <Sparkles size={16} className="text-saffron mt-0.5 flex-shrink-0" />
                    <div>
                      <dt className="font-semibold text-indigo">Category</dt>
                      <dd className="text-warm-gray">
                        {categoryLabels[program.category]}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              <div className="bg-cream border border-saffron/30 rounded-xl p-6">
                <h3 className="font-display text-lg text-indigo mb-3">
                  Interested?
                </h3>
                <p className="text-sm text-warm-gray leading-relaxed mb-4">
                  {isYouth
                    ? "Youth program registration runs through our parent member portal — share your interest and we'll follow up with details."
                    : "Reach out and we'll help you find your next step into this program."}
                </p>
                <ButtonLink href={ctaHref} variant="primary" size="md">
                  {ctaLabel}
                </ButtonLink>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {otherPrograms.length > 0 ? (
        <section className="bg-cream py-16">
          <Container>
            <h2 className="font-display text-2xl md:text-3xl text-indigo mb-8">
              Other programs you might like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherPrograms.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </main>
  );
}
