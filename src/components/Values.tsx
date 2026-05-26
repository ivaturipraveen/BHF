import { Globe, Flame, Heart, BookOpen, Landmark } from "lucide-react";
import { coreValues } from "@/data/content";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

const iconMap = {
  globe: Globe,
  flame: Flame,
  heart: Heart,
  "book-open": BookOpen,
  landmark: Landmark,
} as const;

export default function Values() {
  return (
    <Section id="values" className="bg-cream/60">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 text-sm font-semibold text-saffron bg-white rounded-full mb-4">
            What We Stand For
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-indigo">
            Our Core Values
          </h2>
          <p className="mt-4 text-lg text-warm-gray">
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {coreValues.map((value, idx) => {
            const Icon = iconMap[value.icon];
            return (
              <div
                key={idx}
                className="text-center p-6 bg-white rounded-2xl border border-cream hover:border-saffron/40 transition-colors duration-300"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-cream flex items-center justify-center text-saffron mb-4">
                  <Icon size={28} />
                </div>
                <h4 className="font-display text-lg font-semibold text-indigo mb-2">
                  {value.title}
                </h4>
                <p className="text-sm text-warm-gray leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
