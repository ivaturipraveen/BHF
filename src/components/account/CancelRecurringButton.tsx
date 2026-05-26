"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export interface CancelRecurringButtonProps {
  donationId: string;
  amountCents: number;
  type: "monthly" | "yearly";
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function CancelRecurringButton({
  donationId,
  amountCents,
  type,
}: CancelRecurringButtonProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onConfirm() {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/donations/me/${donationId}/cancel`, {
        method: "POST",
      });
      if (res.status === 200) {
        router.refresh();
        setOpen(false);
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not cancel. Please try again.");
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
        className="text-sm font-medium text-red-600 hover:text-red-700"
      >
        Cancel recurring
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cancel recurring donation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-indigo/80 p-4"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl text-indigo">
              Cancel recurring donation?
            </h3>
            <p className="mt-3 text-sm text-warm-gray">
              Cancel your {type} donation of{" "}
              <span className="font-semibold text-indigo">
                {formatCents(amountCents)}
              </span>
              ? You can restart anytime. Past contributions remain in your
              history.
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
                Keep giving
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={submitting}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 min-h-[44px]"
              >
                {submitting ? "Canceling…" : "Cancel donation"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
