import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Event } from "@/types/db";

export interface EventCardRsvpInfo {
  total: number;
  capacity: number | null;
  spotsLeft: number | null;
}

export interface EventCardProps {
  event: Event;
  rsvpInfo?: EventCardRsvpInfo;
  className?: string;
}

function formatTimeRange(starts: Date, ends: Date | null): string {
  const startStr = format(starts, "h:mm a");
  if (!ends) return startStr;
  return `${startStr} – ${format(ends, "h:mm a")}`;
}

export function EventCard({ event, rsvpInfo, className }: EventCardProps) {
  const startsAt = new Date(event.starts_at);
  const endsAt = event.ends_at ? new Date(event.ends_at) : null;
  const monthAbbrev = format(startsAt, "MMM").toUpperCase();
  const day = format(startsAt, "d");
  const isPast = startsAt.getTime() < Date.now();

  const isLimitedCapacity =
    event.rsvp_capacity !== null &&
    rsvpInfo?.spotsLeft !== null &&
    rsvpInfo?.spotsLeft !== undefined &&
    event.rsvp_capacity > 0 &&
    rsvpInfo.spotsLeft < event.rsvp_capacity * 0.2;

  return (
    <Card
      variant="default"
      className={cn(
        "flex flex-col p-0 overflow-hidden transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-video w-full bg-cream">
        {event.hero_image_url ? (
          <Image
            src={event.hero_image_url}
            alt={event.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-cream">
            <span className="font-display text-3xl text-saffron/60">ॐ</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col items-center rounded-lg bg-white px-3 py-1.5 shadow-sm">
          <span className="text-[10px] font-semibold tracking-widest text-saffron">
            {monthAbbrev}
          </span>
          <span className="font-display text-xl leading-none text-indigo">
            {day}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-display text-xl text-indigo">{event.title}</h3>

        <div className="flex flex-col gap-1 text-sm text-warm-gray">
          <span className="inline-flex items-center gap-2">
            <Calendar size={16} className="text-saffron" />
            {format(startsAt, "EEE, MMM d, yyyy")} · {formatTimeRange(startsAt, endsAt)}
          </span>
          {event.location_name ? (
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} className="text-saffron" />
              {event.location_name}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="amber">Free</Badge>
          {event.members_only ? (
            <Badge variant="indigo">Members only</Badge>
          ) : null}
          {isLimitedCapacity ? (
            <Badge variant="saffron">Limited capacity</Badge>
          ) : null}
        </div>

        <div className="mt-auto pt-2">
          {isPast ? (
            <ButtonLink
              href={`/events/${event.slug}`}
              variant="secondary"
              size="sm"
            >
              Learn more
            </ButtonLink>
          ) : (
            <ButtonLink
              href={`/events/${event.slug}`}
              variant="primary"
              size="sm"
            >
              RSVP
            </ButtonLink>
          )}
        </div>
      </div>
    </Card>
  );
}
