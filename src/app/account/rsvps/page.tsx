import Link from "next/link";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { getSessionFromCookies } from "@/lib/auth";
import { listMyRsvps, type MyRsvp } from "@/lib/queries/account";
import { query } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CancelRsvpButton } from "@/components/account/CancelRsvpButton";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

type Tab = "upcoming" | "past";

interface RsvpWithLocation extends MyRsvp {
  event_slug: string;
  event_location_name: string | null;
}

async function listMyRsvpsWithSlug(memberId: string): Promise<RsvpWithLocation[]> {
  return query<RsvpWithLocation>(
    `SELECT r.id, r.event_id, e.title AS event_title, e.slug AS event_slug,
            e.starts_at AS event_starts_at, e.location_name AS event_location_name,
            r.party_size, r.created_at
       FROM rsvps r
       JOIN events e ON e.id = r.event_id
      WHERE r.member_id = $1
      ORDER BY e.starts_at ASC`,
    [memberId],
  );
}

export default async function RsvpsPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login?next=/account/rsvps");

  const tab: Tab = searchParams?.tab === "past" ? "past" : "upcoming";

  const all = await listMyRsvpsWithSlug(session.sub);
  const now = Date.now();
  const upcoming = all.filter(
    (r) => new Date(r.event_starts_at).getTime() >= now,
  );
  const past = all
    .filter((r) => new Date(r.event_starts_at).getTime() < now)
    .reverse();

  const rows = tab === "upcoming" ? upcoming : past;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl text-indigo">Your RSVPs</h1>
        <p className="mt-2 text-warm-gray">
          Events you have RSVPd to, upcoming and past.
        </p>
      </header>

      <nav
        aria-label="RSVP filter"
        className="flex items-center gap-2 border-b border-gray-200"
      >
        <TabLink href="/account/rsvps?tab=upcoming" active={tab === "upcoming"}>
          Upcoming{upcoming.length > 0 ? ` (${upcoming.length})` : ""}
        </TabLink>
        <TabLink href="/account/rsvps?tab=past" active={tab === "past"}>
          Past{past.length > 0 ? ` (${past.length})` : ""}
        </TabLink>
      </nav>

      {rows.length === 0 ? (
        tab === "upcoming" ? (
          <EmptyState
            title="No upcoming RSVPs"
            body="You haven't RSVPd to any upcoming events. Browse what's coming up next."
            cta={{ href: "/events", label: "Browse upcoming events" }}
          />
        ) : (
          <EmptyState
            title="No past attendance yet"
            body="Once you've attended an event, it'll show up here."
          />
        )
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((r) => (
            <RsvpRow key={r.id} rsvp={r} canCancel={tab === "upcoming"} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "px-4 py-2 text-sm font-medium border-b-2 -mb-px min-h-[44px] inline-flex items-center",
        active
          ? "border-saffron text-indigo"
          : "border-transparent text-warm-gray hover:text-indigo",
      )}
    >
      {children}
    </Link>
  );
}

function RsvpRow({
  rsvp,
  canCancel,
}: {
  rsvp: RsvpWithLocation;
  canCancel: boolean;
}) {
  const startsAt = new Date(rsvp.event_starts_at);
  return (
    <Card className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4 min-w-0">
        <div
          aria-hidden="true"
          className="flex flex-col items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 flex-shrink-0"
        >
          <span className="text-[10px] font-semibold tracking-widest text-saffron">
            {format(startsAt, "MMM").toUpperCase()}
          </span>
          <span className="font-display text-xl leading-none text-indigo">
            {format(startsAt, "d")}
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg text-indigo">
            <Link
              href={`/events/${rsvp.event_slug}`}
              className="hover:text-saffron transition-colors"
            >
              {rsvp.event_title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-warm-gray">
            {format(startsAt, "EEE, MMM d, yyyy · h:mm a")} · {rsvp.party_size}{" "}
            {rsvp.party_size === 1 ? "guest" : "guests"}
          </p>
          {rsvp.event_location_name ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-warm-gray">
              <MapPin size={14} className="text-saffron" />
              {rsvp.event_location_name}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-3 md:flex-shrink-0">
        {canCancel ? (
          <CancelRsvpButton rsvpId={rsvp.id} eventTitle={rsvp.event_title} />
        ) : (
          <Link
            href={`/events/${rsvp.event_slug}`}
            className="text-sm text-saffron hover:text-amber-burnt font-medium"
          >
            View event
          </Link>
        )}
      </div>
    </Card>
  );
}
