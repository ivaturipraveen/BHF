import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProgramCard } from "@/components/cards/ProgramCard";
import { listFeaturedPrograms } from "@/lib/queries/programs";

export async function ProgramsPreview() {
  const programs = await listFeaturedPrograms(3);
  return (
    <Section className="bg-cream/40">
      <Container>
        <div className="flex items-end justify-between gap-4 mb-10">
          <SectionHeading
            eyebrow="Grow"
            title="Programs that build character and community"
          />
          <Link
            href="/programs"
            className="text-saffron font-medium hover:text-amber-burnt whitespace-nowrap"
          >
            All programs →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
