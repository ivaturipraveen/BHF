import Link from "next/link";
import { format } from "date-fns";
import { Bookmark } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { listSavedEvents } from "@/lib/queries/account";

export async function SavedEventsCard({ memberId }: { memberId: string }) {
  const rows = await listSavedEvents(memberId, true);

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No saved events"
        body="Bookmark events you're interested in to find them quickly later."
        cta={{ href: "/events", label: "Browse events" }}
      />
    );
  }

  const visible = rows.slice(0, 3);
  const hasMore = rows.length > 3;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((s) => (
          <Card key={s.id} className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-widest text-saffron inline-flex items-center gap-2">
              <Bookmark size={12} />
              {format(new Date(s.event_starts_at), "MMM d, yyyy")}
            </p>
            <h3 className="font-display text-lg text-indigo">
              <Link
                href={`/events/${s.event_slug}`}
                className="hover:text-saffron transition-colors"
              >
                {s.event_title}
              </Link>
            </h3>
            <p className="text-sm text-warm-gray">
              {format(new Date(s.event_starts_at), "h:mm a")}
            </p>
          </Card>
        ))}
      </div>
      {hasMore ? (
        <div>
          <Link
            href="/account/saved"
            className="text-sm text-saffron hover:text-amber-burnt font-medium"
          >
            View all {rows.length} saved →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
