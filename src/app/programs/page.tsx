import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ProgramCard } from "@/components/cards/ProgramCard";
import { listPrograms } from "@/lib/queries/programs";
import { cn } from "@/lib/cn";

export const revalidate = 60;

const description =
  "Cultural, educational, charitable, wellness and youth programs that build character and community at BHF.";

export const metadata: Metadata = {
  title: "Programs — BHF",
  description,
  openGraph: { title: "Programs — BHF", description, type: "website" },
  twitter: {
    card: "summary_large_image",
    title: "Programs — BHF",
    description,
  },
};

const CATEGORIES = [
  { slug: undefined, label: "All" },
  { slug: "cultural", label: "Cultural" },
  { slug: "educational", label: "Educational" },
  { slug: "charitable", label: "Charitable" },
  { slug: "wellness", label: "Wellness" },
  { slug: "youth", label: "Youth" },
] as const;

const VALID = new Set([
  "cultural",
  "educational",
  "charitable",
  "wellness",
  "youth",
]);

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const requested = searchParams?.category;
  const active = requested && VALID.has(requested) ? requested : undefined;
  const programs = await listPrograms(active);

  return (
    <main>
      <section className="bg-white py-12 md:py-16">
        <Container>
          <p className="text-xs uppercase tracking-widest text-saffron">
            Programs
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-indigo mt-3 mb-4">
            Programs that build character and community
          </h1>
          <p className="text-warm-gray max-w-2xl text-lg leading-relaxed">
            From festivals and Vedic chanting to youth leadership and community
            seva — find the corner of BHF that calls to you.
          </p>
        </Container>
      </section>

      <section className="bg-white pb-16">
        <Container>
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => {
              const isActive = active === cat.slug || (!active && !cat.slug);
              const href = cat.slug ? `/programs?category=${cat.slug}` : "/programs";
              return (
                <Link
                  key={cat.label}
                  href={href}
                  className={cn(
                    "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-saffron text-white"
                      : "bg-cream text-indigo hover:bg-saffron/15"
                  )}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>

          {programs.length === 0 ? (
            <p className="text-warm-gray">
              No programs in this category yet. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
