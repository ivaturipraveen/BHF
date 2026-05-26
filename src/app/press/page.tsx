import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Markdown } from "@/components/ui/Markdown";
import { LeadershipCard } from "@/components/cards/LeadershipCard";
import { getPageBySlug } from "@/lib/queries/pages";
import { listLeadership } from "@/lib/queries/leadership";
import { siteConfig } from "@/data/content";

export const revalidate = 60;

const description =
  "Press kit, brand assets, founder bios, and media contact information for the Bharatiya Heritage Foundation.";

export const metadata: Metadata = {
  title: "Press Kit — BHF",
  description,
  openGraph: { title: "Press Kit — BHF", description, type: "website" },
  twitter: {
    card: "summary_large_image",
    title: "Press Kit — BHF",
    description,
  },
};

const brandColors = [
  { name: "Saffron", hex: "#D97706", bg: "bg-saffron", text: "text-white" },
  { name: "Indigo", hex: "#1E3A5F", bg: "bg-indigo", text: "text-white" },
  {
    name: "Burnt Amber",
    hex: "#92400E",
    bg: "bg-amber-burnt",
    text: "text-white",
  },
  { name: "Warm Cream", hex: "#FEF3E2", bg: "bg-cream", text: "text-indigo" },
];

export default async function PressPage() {
  const page = await getPageBySlug("press-boilerplate");
  const founders = await listLeadership("founding");

  return (
    <main>
      <section className="bg-white py-12 md:py-16">
        <Container>
          <p className="text-xs uppercase tracking-widest text-saffron">
            Press
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-indigo mt-3 mb-6">
            {page?.title ?? "Press Kit"}
          </h1>
          {page?.body_md ? (
            <div className="max-w-3xl">
              <Markdown content={page.body_md} />
            </div>
          ) : null}
        </Container>
      </section>

      <section className="bg-cream py-16">
        <Container>
          <h2 className="font-display text-2xl text-indigo mb-6">
            Logo downloads
          </h2>
          <Card variant="default">
            <p className="text-warm-gray">
              Coming soon: PNG + SVG on light/dark backgrounds. Email{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-saffron underline hover:text-amber-burnt"
              >
                {siteConfig.email}
              </a>{" "}
              for press-ready assets in the meantime.
            </p>
          </Card>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <h2 className="font-display text-2xl text-indigo mb-6">
            Brand colors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {brandColors.map((c) => (
              <Card key={c.name} variant="default" className="p-0 overflow-hidden">
                <div
                  className={`${c.bg} ${c.text} h-24 flex items-end p-3 font-display text-lg`}
                >
                  {c.name}
                </div>
                <div className="p-4 text-sm text-warm-gray">
                  <code className="text-xs font-mono text-indigo">
                    {c.hex}
                  </code>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-cream py-16">
        <Container>
          <h2 className="font-display text-2xl text-indigo mb-6">
            Founder bios
          </h2>
          {founders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {founders.map((m) => (
                <LeadershipCard key={m.id} member={m} />
              ))}
            </div>
          ) : (
            <p className="text-warm-gray">Founder bios coming soon.</p>
          )}
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <h2 className="font-display text-2xl text-indigo mb-4">
            Press contact
          </h2>
          <p className="text-warm-gray">
            For media inquiries, please reach out to{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-saffron underline hover:text-amber-burnt font-medium"
            >
              {siteConfig.email}
            </a>
            .
          </p>
        </Container>
      </section>
    </main>
  );
}
