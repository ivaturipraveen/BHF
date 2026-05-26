"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export interface CancelRsvpButtonProps {
  rsvpId: string;
  eventTitle: string;
}

export function CancelRsvpButton({ rsvpId, eventTitle }: CancelRsvpButtonProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onConfirm() {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/me/rsvps/${rsvpId}`, { method: "DELETE" });
      if (res.status === 200) {
        router.refresh();
        setOpen(false);
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 400) {
        setError(
          data.error ?? "This event has already started and can't be canceled.",
        );
        return;
      }
      setError(data.error ?? "Could not cancel RSVP. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-700 min-h-[44px]"
      >
        Cancel RSVP
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Cancel RSVP for ${eventTitle}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-indigo/80 p-4"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl text-indigo">Cancel RSVP?</h3>
            <p className="mt-3 text-sm text-warm-gray">
              Cancel your RSVP for{" "}
              <span className="font-semibold text-indigo">{eventTitle}</span>?
              Your spot will be released for others.
            </p>
            {error ? (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={submitting}
                className="rounded-full px-5 py-2 text-sm font-medium text-warm-gray hover:bg-cream disabled:opacity-60 min-h-[44px]"
              >
                Keep RSVP
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={submitting}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 min-h-[44px]"
              >
                {submitting ? "Canceling…" : "Cancel RSVP"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
