import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  HeartHandshake,
  Baby,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getActivityFeed, type ActivityItem } from "@/lib/queries/account";

const ICONS: Record<ActivityItem["type"], LucideIcon> = {
  rsvp: Calendar,
  donation: HeartHandshake,
  child_added: Baby,
  enrollment: BookOpen,
};

export async function ActivityTimeline({ memberId }: { memberId: string }) {
  const items = await getActivityFeed(memberId, 10);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        body="Your community activity will appear here as you RSVP, donate, and enroll children in programs."
      />
    );
  }

  return (
    <Card>
      <ol className="flex flex-col gap-4">
        {items.map((item, i) => {
          const Icon = ICONS[item.type];
          return (
            <li key={`${item.type}-${i}`} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-saffron/10 text-saffron"
              >
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                {item.link ? (
                  <Link
                    href={item.link}
                    className="text-sm text-indigo hover:text-saffron font-medium"
                  >
                    {item.text}
                  </Link>
                ) : (
                  <p className="text-sm text-indigo font-medium">{item.text}</p>
                )}
                <p className="text-xs text-warm-gray mt-0.5">
                  {format(new Date(item.date), "MMM d, yyyy")}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
