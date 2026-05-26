"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";

export interface DeleteChildButtonProps {
  childId: string;
  childFirstName: string;
  variant?: "link" | "danger";
}

export function DeleteChildButton({
  childId,
  childFirstName,
  variant = "link",
}: DeleteChildButtonProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [typed, setTyped] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onConfirm() {
    if (submitting) return;
    setError(null);
    if (typed.trim().toLowerCase() !== childFirstName.toLowerCase()) {
      setError(`Please type "${childFirstName}" exactly to confirm.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/me/children/${childId}`, {
        method: "DELETE",
      });
      if (res.status === 204) {
        try {
          window.sessionStorage.setItem(
            "children-flash",
            `${childFirstName}'s profile was removed.`,
          );
        } catch {
          // ignore
        }
        router.push("/account/children");
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not remove. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const triggerClass =
    variant === "danger"
      ? "inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 min-h-[44px]"
      : "text-sm font-medium text-red-600 hover:text-red-700 min-h-[44px] inline-flex items-center";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClass}
      >
        Remove
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Remove ${childFirstName}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-indigo/80 p-4"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl text-red-700">
              Remove {childFirstName}?
            </h3>
            <p className="mt-3 text-sm text-warm-gray">
              This permanently deletes {childFirstName}&apos;s profile and all
              of their enrollments. This cannot be undone. Type{" "}
              <span className="font-semibold text-indigo">{childFirstName}</span>{" "}
              below to confirm.
            </p>
            <div className="mt-4">
              <Input
                label={`Type "${childFirstName}" to confirm`}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                disabled={submitting}
              />
            </div>
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
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={submitting}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 min-h-[44px]"
              >
                {submitting ? "Removing…" : "Remove forever"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
