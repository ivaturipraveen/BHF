import Image from "next/image";
import { Linkedin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { Leadership } from "@/types/db";

export interface LeadershipCardProps {
  member: Leadership;
  className?: string;
}

export function LeadershipCard({ member, className }: LeadershipCardProps) {
  return (
    <Card variant="default" className={cn("flex flex-col p-0 overflow-hidden", className)}>
      <div className="relative aspect-square w-full bg-cream">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={member.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-5xl text-saffron/40">
              {member.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-6">
        <h3 className="font-display text-lg text-indigo">{member.name}</h3>
        <p className="text-sm font-medium text-saffron">{member.role}</p>
        <p className="text-sm text-warm-gray leading-relaxed">{member.bio}</p>
        {member.linkedin_url ? (
          <a
            href={member.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} on LinkedIn`}
            className="inline-flex w-fit items-center gap-1 text-indigo hover:text-saffron mt-1"
          >
            <Linkedin size={18} />
          </a>
        ) : null}
      </div>
    </Card>
  );
}
