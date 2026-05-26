import Link from "next/link";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { listSavedEvents } from "@/lib/queries/account";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { UnsaveEventButton } from "@/components/account/UnsaveEventButton";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

type Tab = "upcoming" | "all";

export default async function SavedEventsPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login?next=/account/saved");

  const tab: Tab = searchParams?.tab === "all" ? "all" : "upcoming";
  const rows = await listSavedEvents(session.sub, tab === "upcoming");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl text-indigo">Saved events</h1>
        <p className="mt-2 text-warm-gray">
          Events you have bookmarked for later.
        </p>
      </header>

      <nav
        aria-label="Saved events filter"
        className="flex items-center gap-2 border-b border-gray-200"
      >
        <TabLink href="/account/saved?tab=upcoming" active={tab === "upcoming"}>
          Upcoming
        </TabLink>
        <TabLink href="/account/saved?tab=all" active={tab === "all"}>
          All
        </TabLink>
      </nav>

      {rows.length === 0 ? (
        <EmptyState
          title="No saved events"
          body={
            tab === "upcoming"
              ? "Bookmark upcoming events to find them quickly later."
              : "When you bookmark events from the events page, they'll show up here."
          }
          cta={{ href: "/events", label: "Browse events" }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((s) => (
            <Card
              key={s.id}
              className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div
                  aria-hidden="true"
                  className="flex flex-col items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 flex-shrink-0"
                >
                  <span className="text-[10px] font-semibold tracking-widest text-saffron">
                    {format(new Date(s.event_starts_at), "MMM").toUpperCase()}
                  </span>
                  <span className="font-display text-xl leading-none text-indigo">
                    {format(new Date(s.event_starts_at), "d")}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg text-indigo">
                    <Link
                      href={`/events/${s.event_slug}`}
                      className="hover:text-saffron transition-colors"
                    >
                      {s.event_title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-warm-gray">
                    {format(
                      new Date(s.event_starts_at),
                      "EEE, MMM d, yyyy · h:mm a",
                    )}
                  </p>
                </div>
              </div>
              <UnsaveEventButton savedId={s.id} eventTitle={s.event_title} />
            </Card>
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
