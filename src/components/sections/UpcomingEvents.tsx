import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { EventCard } from "@/components/cards/EventCard";
import { ProgramCard } from "@/components/cards/ProgramCard";
import { listUpcomingEvents, countRsvps } from "@/lib/queries/events";
import { listFeaturedPrograms } from "@/lib/queries/programs";

export async function UpcomingEvents() {
  const events = await listUpcomingEvents(3);
  const rsvpInfos = await Promise.all(events.map((e) => countRsvps(e.id)));
  const fillCount = Math.max(0, 3 - events.length);
  const fillPrograms = fillCount > 0 ? await listFeaturedPrograms(fillCount) : [];

  return (
    <Section className="bg-white">
      <Container>
        <div className="flex items-end justify-between gap-4 mb-10">
          <h2 className="font-display text-3xl md:text-4xl text-indigo">
            Upcoming events
          </h2>
          <Link
            href="/events"
            className="text-saffron font-medium hover:text-amber-burnt whitespace-nowrap"
          >
            View full calendar →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} rsvpInfo={rsvpInfos[i]} />
          ))}
          {fillPrograms.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
