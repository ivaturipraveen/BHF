import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { getHomepageConfig } from "@/lib/queries/homepage";

const stats: Array<{
  key:
    | "stat_families_served"
    | "stat_festivals_hosted"
    | "stat_youth_in_programs"
    | "stat_seva_hours";
  label: string;
}> = [
  { key: "stat_families_served", label: "Families served" },
  { key: "stat_festivals_hosted", label: "Festivals hosted" },
  { key: "stat_youth_in_programs", label: "Youth in programs" },
  { key: "stat_seva_hours", label: "Seva hours contributed" },
];

export async function ImpactStats() {
  const cfg = await getHomepageConfig();
  return (
    <section className="w-full bg-cream py-16">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.key} className="text-center">
              <div className="font-display text-4xl md:text-5xl text-saffron">
                <CountUp end={cfg[stat.key]} />
              </div>
              <p className="mt-2 text-sm text-warm-gray">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
