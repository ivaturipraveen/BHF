import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { Program } from "@/types/db";

const frequencyLabels: Record<Program["frequency"], string> = {
  monthly: "Monthly",
  annual: "Annual",
  rolling: "Rolling",
};

const categoryLabels: Record<Program["category"], string> = {
  cultural: "Cultural",
  educational: "Educational",
  charitable: "Charitable",
  wellness: "Wellness",
  youth: "Youth",
};

export interface ProgramCardProps {
  program: Program;
  className?: string;
}

export function ProgramCard({ program, className }: ProgramCardProps) {
  return (
    <Card
      variant="default"
      className={cn(
        "flex flex-col p-0 overflow-hidden transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-video w-full bg-cream">
        {program.hero_image_url ? (
          <Image
            src={program.hero_image_url}
            alt={program.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-cream">
            <span className="font-display text-3xl text-saffron/60">ॐ</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant="indigo">{categoryLabels[program.category]}</Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="saffron">{frequencyLabels[program.frequency]}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-display text-xl text-indigo">{program.title}</h3>
        <p className="text-sm text-warm-gray leading-relaxed line-clamp-3">
          {program.short_description}
        </p>
        <div className="mt-auto pt-2">
          <Link
            href={`/programs/${program.slug}`}
            className="text-saffron font-medium hover:text-amber-burnt"
          >
            Learn more →
          </Link>
        </div>
      </div>
    </Card>
  );
}
