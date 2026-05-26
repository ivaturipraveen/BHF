import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { listActiveSponsors } from "@/lib/queries/sponsors";

export async function SponsorGrid() {
  const sponsors = await listActiveSponsors();
  if (sponsors.length < 3) return null;
  return (
    <Section className="bg-white py-16 md:py-20">
      <Container>
        <h2 className="font-display text-2xl md:text-3xl text-indigo text-center mb-10">
          With gratitude to our sponsors
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
          {sponsors.map((sponsor) => {
            const inner = (
              <div className="relative h-16 w-full grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                <Image
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  fill
                  sizes="(min-width: 768px) 16vw, 33vw"
                  className="object-contain"
                />
              </div>
            );
            return sponsor.website_url ? (
              <a
                key={sponsor.id}
                href={sponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={sponsor.name}
              >
                {inner}
              </a>
            ) : (
              <div key={sponsor.id}>{inner}</div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
