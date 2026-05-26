import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { EventCard } from "@/components/cards/EventCard";
import {
  listUpcomingEvents,
  listPastEvents,
  countRsvps,
} from "@/lib/queries/events";
import type { Event } from "@/types/db";
import { cn } from "@/lib/cn";

export const revalidate = 60;

const description =
  "Upcoming festivals, classes, charity drives and youth events from the Bharatiya Heritage Foundation.";

export const metadata: Metadata = {
  title: "Events — BHF",
  description,
  openGraph: { title: "Events — BHF", description, type: "website" },
  twitter: {
    card: "summary_large_image",
    title: "Events — BHF",
    description,
  },
};

const FILTERS = [
  { slug: "upcoming", label: "Upcoming" },
  { slug: "past", label: "Past" },
] as const;

const TYPES = [
  { slug: "festival", label: "Festival" },
  { slug: "class", label: "Class" },
  { slug: "charity", label: "Charity" },
  { slug: "youth", label: "Youth" },
] as const;

const VALID_TYPES = new Set(["festival", "class", "charity", "youth"]);

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: { filter?: string; type?: string };
}) {
  const filter = searchParams?.filter === "past" ? "past" : "upcoming";
  const type =
    searchParams?.type && VALID_TYPES.has(searchParams.type)
      ? searchParams.type
      : undefined;

  let events: Event[] =
    filter === "past" ? await listPastEvents() : await listUpcomingEvents();

  if (type) {
    events = events.filter((e) => e.type === type);
  }

  const rsvpInfos = await Promise.all(events.map((e) => countRsvps(e.id)));

  function hrefFor(nextFilter?: string, nextType?: string) {
    const params = new URLSearchParams();
    if (nextFilter) params.set("filter", nextFilter);
    if (nextType) params.set("type", nextType);
    const qs = params.toString();
    return qs ? `/events?${qs}` : "/events";
  }

  return (
    <main>
      <section className="bg-white py-12 md:py-16">
        <Container>
          <p className="text-xs uppercase tracking-widest text-saffron">
            Events
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-indigo mt-3 mb-4">
            Upcoming events
          </h1>
          <p className="text-warm-gray max-w-2xl text-lg leading-relaxed">
            Festivals, classes, seva, and youth gatherings — find something to
            join.
          </p>
        </Container>
      </section>

      <section className="bg-white pb-16">
        <Container>
          <div className="flex flex-col gap-4 mb-10">
            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => {
                const isActive = filter === f.slug;
                return (
                  <Link
                    key={f.slug}
                    href={hrefFor(f.slug, type)}
                    className={cn(
                      "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-saffron text-white"
                        : "bg-cream text-indigo hover:bg-saffron/15"
                    )}
                  >
                    {f.label}
                  </Link>
                );
              })}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-warm-gray">
                  View
                </span>
                <span className="inline-flex items-center rounded-full bg-saffron px-3 py-1 text-xs font-medium text-white">
                  List
                </span>
                <span
                  title="Calendar view is coming in a future release."
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-warm-gray opacity-60 cursor-not-allowed"
                >
                  Calendar
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={hrefFor(filter)}
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  !type
                    ? "bg-indigo text-white"
                    : "bg-cream text-indigo hover:bg-indigo/10"
                )}
              >
                All types
              </Link>
              {TYPES.map((t) => {
                const isActive = type === t.slug;
                return (
                  <Link
                    key={t.slug}
                    href={hrefFor(filter, t.slug)}
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-indigo text-white"
                        : "bg-cream text-indigo hover:bg-indigo/10"
                    )}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {events.length === 0 ? (
            <p className="text-warm-gray">
              No events match this filter. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((e, i) => (
                <EventCard key={e.id} event={e} rsvpInfo={rsvpInfos[i]} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
