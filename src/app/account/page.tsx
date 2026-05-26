import Link from "next/link";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import {
  Users,
  HeartHandshake,
  BookOpen,
  Settings,
} from "lucide-react";
import { getSessionFromCookies } from "@/lib/auth";
import { getMemberById } from "@/lib/queries/members";
import {
  listMyDonations,
  listMyRsvps,
  type MyRsvp,
} from "@/lib/queries/account";
import { listExclusiveContent } from "@/lib/queries/exclusiveContent";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function ytdSum(
  donations: { amount_cents: number; status: string; created_at: Date }[],
): number {
  const now = new Date();
  const year = now.getUTCFullYear();
  return donations
    .filter(
      (d) =>
        d.status === "succeeded" &&
        new Date(d.created_at).getUTCFullYear() === year,
    )
    .reduce((sum, d) => sum + d.amount_cents, 0);
}

function upcomingRsvps(rsvps: MyRsvp[]): MyRsvp[] {
  const now = new Date();
  return rsvps
    .filter((r) => new Date(r.event_starts_at) >= now)
    .slice(0, 3);
}

export default async function AccountDashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login?next=/account");

  const member = await getMemberById(session.sub);
  if (!member) redirect("/login?next=/account");

  const [donations, rsvps, exclusive] = await Promise.all([
    listMyDonations(session.sub),
    listMyRsvps(session.sub),
    listExclusiveContent(undefined, 3),
  ]);

  const ytd = ytdSum(donations);
  const upcoming = upcomingRsvps(rsvps);
  const eventsAttended = rsvps.length;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl md:text-4xl text-indigo">
          Namaste, {member.first_name}
        </h1>
        <p className="mt-2 text-warm-gray">
          Welcome to your member dashboard. Here&apos;s your community at a
          glance.
        </p>
      </header>

      <section
        aria-labelledby="quick-stats"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <h2 id="quick-stats" className="sr-only">
          Quick stats
        </h2>
        <Card>
          <p className="text-xs uppercase tracking-widest text-saffron">
            Events
          </p>
          <p className="mt-2 font-display text-3xl text-indigo">
            {eventsAttended}
          </p>
          <p className="text-sm text-warm-gray">RSVPs to date</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-saffron">
            Donations YTD
          </p>
          <p className="mt-2 font-display text-3xl text-indigo">
            {formatCents(ytd)}
          </p>
          <p className="text-sm text-warm-gray">{new Date().getUTCFullYear()}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-saffron">
            Youth programs
          </p>
          <p className="mt-2 font-display text-3xl text-indigo">0</p>
          <p className="text-sm text-warm-gray">Enrollments (v1.1)</p>
        </Card>
      </section>

      <section aria-labelledby="upcoming-rsvps">
        <div className="flex items-baseline justify-between mb-4">
          <h2
            id="upcoming-rsvps"
            className="font-display text-2xl text-indigo"
          >
            Upcoming events you have RSVP&apos;d to
          </h2>
          <Link
            href="/events"
            className="text-sm text-saffron hover:text-amber-burnt font-medium"
          >
            Browse events →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <Card>
            <p className="text-warm-gray">
              No upcoming RSVPs yet —{" "}
              <Link
                href="/events"
                className="text-saffron hover:text-amber-burnt font-medium"
              >
                browse events →
              </Link>
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcoming.map((r) => (
              <Card key={r.id}>
                <p className="text-xs uppercase tracking-widest text-saffron">
                  {format(new Date(r.event_starts_at), "MMM d, yyyy")}
                </p>
                <h3 className="mt-2 font-display text-lg text-indigo">
                  {r.event_title}
                </h3>
                <p className="mt-1 text-sm text-warm-gray">
                  {format(new Date(r.event_starts_at), "h:mm a")} ·{" "}
                  {r.party_size} {r.party_size === 1 ? "guest" : "guests"}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="recent-exclusive">
        <div className="flex items-baseline justify-between mb-4">
          <h2
            id="recent-exclusive"
            className="font-display text-2xl text-indigo"
          >
            Recently published exclusive content
          </h2>
          <Link
            href="/account/library"
            className="text-sm text-saffron hover:text-amber-burnt font-medium"
          >
            View library →
          </Link>
        </div>
        {exclusive.length === 0 ? (
          <Card>
            <p className="text-warm-gray">
              No content published yet. Check back soon.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exclusive.map((c) => (
              <Link
                key={c.id}
                href="/account/library"
                className="block group"
              >
                <Card>
                  <Badge variant="saffron">{c.content_type}</Badge>
                  <h3 className="mt-3 font-display text-lg text-indigo group-hover:text-saffron transition-colors">
                    {c.title}
                  </h3>
                  {c.description ? (
                    <p className="mt-1 text-sm text-warm-gray line-clamp-2">
                      {c.description}
                    </p>
                  ) : null}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="quick-links">
        <h2 id="quick-links" className="font-display text-2xl text-indigo mb-4">
          Quick links
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLink
            href="/account/directory"
            icon={<Users size={20} />}
            label="Directory"
          />
          <QuickLink
            href="/account/donations"
            icon={<HeartHandshake size={20} />}
            label="Donations"
          />
          <QuickLink
            href="/account/library"
            icon={<BookOpen size={20} />}
            label="Library"
          />
          <QuickLink
            href="/account/profile"
            icon={<Settings size={20} />}
            label="Profile"
          />
        </div>
      </section>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link href={href} className="block group">
      <Card className="flex items-center gap-3">
        <span className="text-saffron">{icon}</span>
        <span className="font-medium text-indigo group-hover:text-saffron transition-colors">
          {label}
        </span>
      </Card>
    </Link>
  );
}
