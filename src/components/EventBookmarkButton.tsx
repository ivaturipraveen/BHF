"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/cn";

export interface EventBookmarkButtonProps {
  eventSlug: string;
  isMember: boolean;
  initialSavedId?: string | null;
  className?: string;
}

export function EventBookmarkButton({
  eventSlug,
  isMember,
  initialSavedId = null,
  className,
}: EventBookmarkButtonProps) {
  const router = useRouter();
  const [savedId, setSavedId] = React.useState<string | null>(initialSavedId);
  const [busy, setBusy] = React.useState(false);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    if (!isMember) {
      router.push(`/login?next=/events/${encodeURIComponent(eventSlug)}`);
      return;
    }

    const wasSaved = savedId !== null;
    setBusy(true);
    // Optimistic toggle
    const optimisticId = wasSaved ? null : "optimistic";
    setSavedId(optimisticId);

    try {
      if (wasSaved) {
        const res = await fetch(`/api/me/saved-events/${savedId}`, {
          method: "DELETE",
        });
        if (res.status !== 200) {
          setSavedId(savedId);
        }
      } else {
        const res = await fetch("/api/me/saved-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventSlug }),
        });
        if (res.status === 201) {
          const data = (await res.json().catch(() => ({}))) as {
            id?: string;
            saved?: boolean;
          };
          setSavedId(data.id ?? null);
        } else {
          setSavedId(null);
        }
      }
    } catch {
      setSavedId(wasSaved ? savedId : null);
    } finally {
      setBusy(false);
    }
  }

  const isSaved = savedId !== null;
  const Icon = isSaved ? BookmarkCheck : Bookmark;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove bookmark" : "Bookmark this event"}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-white/90 border border-gray-200 h-11 w-11 backdrop-blur shadow-sm hover:bg-cream transition-colors disabled:opacity-60",
        className,
      )}
    >
      <Icon
        size={18}
        className={isSaved ? "text-saffron fill-saffron" : "text-indigo"}
        aria-hidden="true"
      />
    </button>
  );
}
