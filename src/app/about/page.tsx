import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  GraduationCap,
  HandHelping,
  HeartHandshake,
} from "lucide-react";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Markdown } from "@/components/ui/Markdown";
import { LeadershipCard } from "@/components/cards/LeadershipCard";
import { getMultiplePages } from "@/lib/queries/pages";
import { listLeadership } from "@/lib/queries/leadership";

export const revalidate = 60;

const PAGE_SLUGS = [
  "about-hero",
  "about-bharatiyatha",
  "about-youth-empowerment",
  "about-vision-mission",
];

const pillars = [
  {
    icon: Sparkles,
    title: "Celebrating Traditions",
    description:
      "Festivals, music, dance, language, and food that keep heritage vibrant for the next generation.",
  },
  {
    icon: GraduationCap,
    title: "Empowering Youth",
    description:
      "Leadership training, heritage learning, and mentorship that build confidence and identity.",
  },
  {
    icon: HandHelping,
    title: "Strengthening Society",
    description:
      "Seva and community service initiatives — food drives, senior assistance, volunteer programs.",
  },
  {
    icon: HeartHandshake,
    title: "Connecting Generations",
    description:
      "Intergenerational gatherings where traditions, wisdom, and stories are shared and preserved.",
  },
];

function excerpt(body: string | null | undefined, max = 160): string {
  if (!body) return "";
  const plain = body
    .replace(/[#*_>`-]+/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  return plain.slice(0, max - 1).trimEnd() + "…";
}

export async function generateMetadata(): Promise<Metadata> {
  const pages = await getMultiplePages(["about-hero"]);
  const hero = pages["about-hero"];
  const description =
    excerpt(hero?.body_md) ||
    "Learn about the Bharatiya Heritage Foundation — our story, our values, and the team building a thriving home for Bharatiya heritage in Solano County.";
  const title = "About BHF — Bharatiya Heritage Foundation";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AboutPage() {
  const pages = await getMultiplePages(PAGE_SLUGS);
  const hero = pages["about-hero"];
  if (!hero) notFound();
  const bharatiyatha = pages["about-bharatiyatha"];
  const youth = pages["about-youth-empowerment"];
  const visionMission = pages["about-vision-mission"];
  const founders = await listLeadership("founding");

  return (
    <main>
      <Section className="bg-white pt-12 pb-8 md:pt-16 md:pb-12">
        <Container>
          <p className="text-xs uppercase tracking-widest text-saffron">About</p>
          <h1 className="font-display text-4xl md:text-5xl text-indigo mt-3 mb-6">
            {hero.title ?? "About BHF"}
          </h1>
          {hero.body_md ? (
            <div className="max-w-3xl">
              <Markdown content={hero.body_md} />
            </div>
          ) : null}
        </Container>
      </Section>

      {bharatiyatha ? (
        <section className="bg-cream py-16">
          <Container>
            <div className="max-w-3xl">
              <h2 className="font-display text-3xl text-indigo mb-4">
                {bharatiyatha.title ?? "Bharatiyatha"}
              </h2>
              {bharatiyatha.body_md ? (
                <Markdown content={bharatiyatha.body_md} />
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      {youth ? (
        <section className="bg-white py-16">
          <Container>
            <div className="max-w-3xl">
              <h2 className="font-display text-3xl text-indigo mb-4">
                {youth.title ?? "Youth Empowerment"}
              </h2>
              {youth.body_md ? <Markdown content={youth.body_md} /> : null}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="bg-cream py-16">
        <Container>
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl text-indigo mb-4">
              {visionMission?.title ?? "Our Vision and Mission"}
            </h2>
            {visionMission?.body_md ? (
              <Markdown content={visionMission.body_md} />
            ) : null}
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-saffron/15 text-saffron mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-display text-lg text-indigo mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-warm-gray leading-relaxed">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="font-display text-3xl text-indigo">
              Our leadership
            </h2>
            <Link
              href="/leadership"
              className="text-saffron font-medium hover:text-amber-burnt whitespace-nowrap"
            >
              Meet the full team →
            </Link>
          </div>
          {founders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {founders.slice(0, 3).map((m) => (
                <LeadershipCard key={m.id} member={m} />
              ))}
            </div>
          ) : (
            <p className="text-warm-gray">Team coming soon.</p>
          )}
        </Container>
      </section>
    </main>
  );
}
