import Link from "next/link";
import {
  Users,
  Sparkles,
  GraduationCap,
  HeartHandshake,
  HandHelping,
  Globe,
  Flame,
  Heart,
  BookOpen,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { missionItems, coreValues } from "@/data/content";

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  sparkles: Sparkles,
  "graduation-cap": GraduationCap,
  "heart-handshake": HeartHandshake,
  "hand-helping": HandHelping,
  globe: Globe,
  flame: Flame,
  heart: Heart,
  "book-open": BookOpen,
  landmark: Landmark,
};

interface Row {
  title: string;
  description: string;
  icon: string;
}

function ItemRow({ item }: { item: Row }) {
  const Icon = iconMap[item.icon] ?? Sparkles;
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-full bg-saffron/10 text-saffron">
        <Icon size={22} />
      </div>
      <div>
        <h3 className="font-display text-lg text-indigo">{item.title}</h3>
        <p className="text-sm text-warm-gray leading-relaxed mt-1">
          {item.description}
        </p>
      </div>
    </div>
  );
}

export function MissionValues() {
  return (
    <Section className="bg-white">
      <Container>
        <div className="mb-12">
          <SectionHeading
            eyebrow="Why we exist"
            title="Our mission and values"
            align="center"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-display text-xl text-saffron mb-6">Mission</h3>
            <div className="flex flex-col gap-6">
              {missionItems.map((item) => (
                <ItemRow key={item.title} item={item} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-display text-xl text-saffron mb-6">
              Core values
            </h3>
            <div className="flex flex-col gap-6">
              {coreValues.map((item) => (
                <ItemRow key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/about"
            className="text-saffron font-medium hover:text-amber-burnt"
          >
            Read our full story →
          </Link>
        </div>
      </Container>
    </Section>
  );
}
