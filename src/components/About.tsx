import {
  Users,
  Sparkles,
  GraduationCap,
  HeartHandshake,
  HandHelping,
} from "lucide-react";
import { vision, missionItems } from "@/data/content";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

const iconMap = {
  users: Users,
  sparkles: Sparkles,
  "graduation-cap": GraduationCap,
  "heart-handshake": HeartHandshake,
  "hand-helping": HandHelping,
} as const;

export default function About() {
  return (
    <Section id="about" className="bg-white">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 text-sm font-semibold text-saffron bg-cream rounded-full mb-4">
            Who We Are
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-indigo">
            {vision.title}
          </h2>
          <p className="mt-6 text-lg text-warm-gray leading-relaxed">
            {vision.description}
          </p>
        </div>

        <div className="text-center mb-12">
          <h3 className="font-display text-2xl sm:text-3xl font-semibold text-indigo">
            Our Mission
          </h3>
          <p className="mt-3 text-warm-gray">
            BHF is committed to building a stronger Bharatiya community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missionItems.map((item, idx) => {
            const Icon = iconMap[item.icon];
            return (
              <div
                key={idx}
                className="group p-8 bg-cream/40 rounded-2xl border border-cream hover:border-saffron/40 transition-colors duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-saffron flex items-center justify-center text-white mb-5">
                  <Icon size={26} />
                </div>
                <h4 className="font-display text-xl font-semibold text-indigo mb-3">
                  {item.title}
                </h4>
                <p className="text-warm-gray leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
