"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookmarkX } from "lucide-react";

export function UnsaveEventButton({
  savedId,
  eventTitle,
}: {
  savedId: string;
  eventTitle: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onClick() {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/me/saved-events/${savedId}`, {
        method: "DELETE",
      });
      if (res.status === 200) {
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not unsave. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={submitting}
        aria-label={`Unsave ${eventTitle}`}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-warm-gray hover:border-saffron hover:text-indigo disabled:opacity-60 min-h-[44px]"
      >
        <BookmarkX size={16} />
        {submitting ? "Removing…" : "Unsave"}
      </button>
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
