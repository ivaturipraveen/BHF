import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { listAnnualReports } from "@/lib/queries/annualReports";

export const revalidate = 60;

const description =
  "Annual reports from the Bharatiya Heritage Foundation — programs, impact, and financial summaries.";

export const metadata: Metadata = {
  title: "Annual Reports — BHF",
  description,
  openGraph: {
    title: "Annual Reports — BHF",
    description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annual Reports — BHF",
    description,
  },
};

export default async function AnnualReportsPage() {
  const reports = await listAnnualReports();

  return (
    <main>
      <section className="bg-white py-12 md:py-16">
        <Container>
          <p className="text-xs uppercase tracking-widest text-saffron">
            Transparency
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-indigo mt-3 mb-4">
            Annual reports
          </h1>
          <p className="text-warm-gray max-w-2xl text-lg leading-relaxed">
            A yearly look back at our programs, community impact, and finances.
          </p>
        </Container>
      </section>

      <section className="bg-white pb-16">
        <Container>
          {reports.length === 0 ? (
            <div className="max-w-2xl">
              <EmptyState
                title="Our first annual report is coming Spring 2027"
                body="Until then, learn about our impact across the site — visit our programs, events, and gallery to see what we've been building."
                cta={{ href: "/programs", label: "Explore programs" }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((r) => (
                <Card
                  key={r.id}
                  variant="default"
                  className="p-0 overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-[4/5] w-full bg-cream">
                    {r.cover_image_url ? (
                      <Image
                        src={r.cover_image_url}
                        alt={r.title ?? `${r.year} report`}
                        fill
                        sizes="(min-width: 1024px) 33vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-5xl text-saffron/40">
                          {r.year}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h3 className="font-display text-xl text-indigo">
                      {r.title ?? `${r.year} Annual Report`}
                    </h3>
                    <p className="text-sm text-warm-gray">{r.year}</p>
                    <div className="mt-auto pt-2">
                      <ButtonLink
                        href={r.pdf_url}
                        variant="primary"
                        size="sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download PDF
                      </ButtonLink>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
