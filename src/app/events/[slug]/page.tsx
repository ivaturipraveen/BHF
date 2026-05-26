import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Markdown } from "@/components/ui/Markdown";
import { EventCard } from "@/components/cards/EventCard";
import { RsvpForm } from "@/components/forms/RsvpForm";
import { PhotoSubmissionForm } from "@/components/forms/PhotoSubmissionForm";
import {
  getEventBySlug,
  countRsvps,
  listUpcomingEvents,
} from "@/lib/queries/events";
import {
  getGalleryCategoryBySlug,
  listPhotosByCategory,
} from "@/lib/queries/gallery";
import { jsonLdString } from "@/lib/jsonLd";

export const revalidate = 60;

function googleCalendarUrl(opts: {
  title: string;
  startsAt: Date;
  endsAt: Date | null;
  description: string;
  location: string;
}): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = fmt(opts.startsAt);
  const end = fmt(opts.endsAt ?? new Date(opts.startsAt.getTime() + 60 * 60 * 1000));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${start}/${end}`,
    details: opts.description,
    location: opts.location,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) return { title: "Event not found — BHF" };
  const description = event.description_md
    .replace(/[#*_>`-]+/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 160)
    .trim();
  return {
    title: `${event.title} — BHF`,
    description,
    openGraph: {
      title: event.title,
      description,
      type: "article",
      images: event.hero_image_url
        ? [{ url: event.hero_image_url, alt: event.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = await getEventBySlug(params.slug);
  if (!event || event.status !== "published") notFound();

  const rsvpInfo = await countRsvps(event.id);
  const startsAt = new Date(event.starts_at);
  const endsAt = event.ends_at ? new Date(event.ends_at) : null;
  const isPast = startsAt.getTime() < Date.now();

  const locationString = [event.location_name, event.location_address]
    .filter(Boolean)
    .join(", ");
  const mapQuery =
    event.location_lat !== null && event.location_lng !== null
      ? `${event.location_lat},${event.location_lng}`
      : locationString;

  const calendarUrl = googleCalendarUrl({
    title: event.title,
    startsAt,
    endsAt,
    description: event.description_md.slice(0, 500),
    location: locationString,
  });

  const galleryCategory = isPast ? await getGalleryCategoryBySlug(params.slug) : null;
  const galleryPhotos = galleryCategory
    ? await listPhotosByCategory(galleryCategory.id)
    : [];

  const upcoming = await listUpcomingEvents(6);
  const relatedEvents = upcoming.filter((e) => e.id !== event.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: startsAt.toISOString(),
    endDate: (endsAt ?? startsAt).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location_name ?? "BHF event",
      address: event.location_address ?? undefined,
    },
    image: event.hero_image_url ? [event.hero_image_url] : undefined,
    organizer: {
      "@type": "NGO",
      name: "Bharatiya Heritage Foundation",
      url: "https://bhfcommunity.org",
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      {/* Full-bleed cinematic hero */}
      <section className="relative isolate min-h-[55vh] md:min-h-[65vh] flex items-end overflow-hidden bg-cream">
        <div className="absolute inset-0 -z-10">
          {event.hero_image_url ? (
            <Image
              src={event.hero_image_url}
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ filter: "brightness(0.65) saturate(1.05)" }}
            />
          ) : null}
          <div className="absolute inset-0 bg-indigo/60" aria-hidden="true" />
        </div>

        <Container className="relative z-10 py-16 md:py-24">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="amber">Free</Badge>
            {event.members_only ? (
              <Badge variant="indigo">Members only</Badge>
            ) : null}
            {event.rsvp_capacity !== null && rsvpInfo.spotsLeft !== null ? (
              <Badge variant="saffron">
                {rsvpInfo.spotsLeft > 0
                  ? `${rsvpInfo.spotsLeft} spots left`
                  : "Sold out"}
              </Badge>
            ) : null}
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-cream leading-tight max-w-3xl">
            {event.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-cream/15 backdrop-blur px-4 py-2 text-sm text-cream border border-cream/20">
              <Calendar size={16} className="text-saffron" />
              {format(startsAt, "EEE, MMM d, yyyy · h:mm a")}
              {endsAt ? ` – ${format(endsAt, "h:mm a")}` : ""}
            </span>
            {event.location_name ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-cream/15 backdrop-blur px-4 py-2 text-sm text-cream border border-cream/20">
                <MapPin size={16} className="text-saffron" />
                {event.location_name}
              </span>
            ) : null}
          </div>
        </Container>
      </section>

      <section className="bg-white py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
            <div className="max-w-3xl">
              <Markdown content={event.description_md} />

              {locationString ? (
                <div className="mt-10">
                  <h2 className="font-display text-2xl text-indigo mb-4">
                    Location
                  </h2>
                  <div className="aspect-video w-full overflow-hidden rounded-xl border border-gray-200">
                    <iframe
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        mapQuery,
                      )}&output=embed`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                      title={`Map for ${event.title}`}
                      className="h-full w-full border-0"
                    />
                  </div>
                </div>
              ) : null}

              {isPast ? (
                <div className="mt-12">
                  <h2 className="font-display text-2xl text-indigo mb-4">
                    Photos from this event
                  </h2>
                  {galleryPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {galleryPhotos.slice(0, 12).map((p) => (
                        <div
                          key={p.id}
                          className="relative aspect-square overflow-hidden rounded-lg bg-cream"
                        >
                          <Image
                            src={p.thumb_url ?? p.file_url}
                            alt={p.caption ?? "Event photo"}
                            fill
                            sizes="(min-width: 1024px) 25vw, 50vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-warm-gray text-sm">
                      No photos uploaded yet — share yours below.
                    </p>
                  )}

                  <div className="mt-10">
                    <h3 className="font-display text-xl text-indigo mb-3">
                      Submit your photos from this event
                    </h3>
                    <div className="max-w-xl">
                      <PhotoSubmissionForm eventSlug={event.slug} />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="self-start space-y-6">
              {!isPast ? (
                <div className="event-rsvp-sticky lg:sticky lg:top-24 bg-cream border border-saffron/30 rounded-xl p-6">
                  <h3 className="font-display text-lg text-indigo mb-3">
                    RSVP
                  </h3>
                  <RsvpForm
                    eventSlug={event.slug}
                    allowsDietaryRestrictions={event.allows_dietary_restrictions}
                    capacityRemaining={rsvpInfo.spotsLeft}
                  />
                </div>
              ) : null}

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-display text-lg text-indigo mb-3">
                  Add to calendar
                </h3>
                <ButtonLink
                  href={calendarUrl}
                  variant="secondary"
                  size="md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Calendar
                </ButtonLink>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {relatedEvents.length > 0 ? (
        <section className="bg-cream py-16">
          <Container>
            <h2 className="font-display text-2xl md:text-3xl text-indigo mb-8">
              Related events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </main>
  );
}
