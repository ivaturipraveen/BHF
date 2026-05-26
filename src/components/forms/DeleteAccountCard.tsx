"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export function DeleteAccountCard({ email }: { email: string }) {
  const [open, setOpen] = React.useState(false);
  const [confirmEmail, setConfirmEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onDelete() {
    if (submitting) return;
    setError(null);
    if (confirmEmail.trim().toLowerCase() !== email.toLowerCase()) {
      setError("Email does not match your account email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/me", { method: "DELETE" });
      if (res.status === 200) {
        window.location.assign("/?deleted=1");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not delete account. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Card className="border-red-300">
        <h2 className="font-display text-xl text-red-700">Delete my account</h2>
        <p className="mt-2 text-sm text-warm-gray">
          Permanently delete your BHF account. Donation history will be
          preserved for our 501(c)(3) records but disconnected from your
          identity.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700"
        >
          Delete my account
        </button>
      </Card>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm account deletion"
          className="fixed inset-0 z-50 flex items-center justify-center bg-indigo/80 p-4"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl text-red-700">
              Are you absolutely sure?
            </h3>
            <p className="mt-3 text-sm text-warm-gray">
              This cannot be undone. Type your email{" "}
              <span className="font-semibold text-indigo">{email}</span> below
              to confirm.
            </p>
            <div className="mt-4">
              <Input
                label="Confirm email"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
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
                className="rounded-full px-5 py-2 text-sm font-medium text-warm-gray hover:bg-cream disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={submitting}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {submitting ? "Deleting…" : "Delete forever"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
