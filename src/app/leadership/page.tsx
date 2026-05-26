import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LeadershipCard } from "@/components/cards/LeadershipCard";
import { listLeadership } from "@/lib/queries/leadership";
import type { Leadership } from "@/types/db";

export const revalidate = 60;

const description =
  "Meet the founding team, working group, and board of directors of the Bharatiya Heritage Foundation.";

export const metadata: Metadata = {
  title: "Our Leadership — BHF",
  description,
  openGraph: { title: "Our Leadership — BHF", description, type: "website" },
  twitter: {
    card: "summary_large_image",
    title: "Our Leadership — BHF",
    description,
  },
};

const SECTIONS: { key: Leadership["section"]; label: string }[] = [
  { key: "founding", label: "Founding Team" },
  { key: "working_group", label: "Working Group" },
  { key: "board", label: "Board of Directors" },
];

export default async function LeadershipPage() {
  const all = await listLeadership();
  const grouped: Record<Leadership["section"], Leadership[]> = {
    founding: [],
    working_group: [],
    board: [],
  };
  for (const m of all) grouped[m.section].push(m);

  return (
    <main>
      <section className="bg-white py-12 md:py-16">
        <Container>
          <p className="text-xs uppercase tracking-widest text-saffron">
            Leadership
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-indigo mt-3 mb-4">
            Our leadership
          </h1>
          <p className="text-warm-gray max-w-2xl text-lg leading-relaxed">
            The volunteers, organizers, and board members who steward our
            mission day to day.
          </p>
        </Container>
      </section>

      {SECTIONS.map((sec) => {
        const members = grouped[sec.key];
        if (members.length === 0) return null;
        return (
          <section
            key={sec.key}
            className={
              sec.key === "founding"
                ? "bg-white pb-12"
                : sec.key === "working_group"
                  ? "bg-cream py-16"
                  : "bg-white py-16"
            }
          >
            <Container>
              <h2 className="font-display text-3xl text-indigo mb-8">
                {sec.label}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {members.map((m) => (
                  <LeadershipCard key={m.id} member={m} />
                ))}
              </div>
            </Container>
          </section>
        );
      })}
    </main>
  );
}
