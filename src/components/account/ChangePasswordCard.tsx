"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";

interface Rule {
  label: string;
  test: (value: string) => boolean;
}

const RULES: Rule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "An uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "A digit", test: (v) => /\d/.test(v) },
];

type Banner =
  | { variant: "success"; message: string }
  | { variant: "error"; message: string }
  | null;

export function ChangePasswordCard() {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [banner, setBanner] = React.useState<Banner>(null);
  const [confirmError, setConfirmError] = React.useState<string | null>(null);

  const allRulesPass = RULES.every((r) => r.test(next));
  const passwordsMatch = next.length > 0 && next === confirm;
  const canSubmit =
    current.length > 0 && allRulesPass && passwordsMatch && !submitting;

  React.useEffect(() => {
    if (banner?.variant !== "success") return;
    const t = window.setTimeout(() => setBanner(null), 5000);
    return () => window.clearTimeout(t);
  }, [banner]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    if (!passwordsMatch) {
      setConfirmError("Passwords do not match.");
      return;
    }
    if (!allRulesPass) {
      setBanner({
        variant: "error",
        message: "New password does not meet the requirements.",
      });
      return;
    }
    setConfirmError(null);
    setBanner(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/me/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: next,
        }),
      });
      if (res.status === 200) {
        setBanner({ variant: "success", message: "Password updated." });
        setCurrent("");
        setNext("");
        setConfirm("");
        return;
      }
      if (res.status === 401) {
        setBanner({
          variant: "error",
          message: "Current password is incorrect.",
        });
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setBanner({
        variant: "error",
        message: data.error ?? "Could not update password. Please try again.",
      });
    } catch {
      setBanner({
        variant: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <h2 className="font-display text-xl text-indigo mb-4">Change password</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
        <div className="flex flex-col gap-1">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />
          <ul className="mt-1 flex flex-col gap-0.5 text-xs">
            {RULES.map((r) => {
              const ok = r.test(next);
              return (
                <li
                  key={r.label}
                  className={ok ? "text-saffron" : "text-warm-gray"}
                >
                  {ok ? "✓" : "•"} {r.label}
                </li>
              );
            })}
          </ul>
        </div>
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (confirmError) setConfirmError(null);
          }}
          required
          error={confirmError ?? undefined}
        />

        {banner ? (
          <FeedbackBanner variant={banner.variant}>
            {banner.message}
          </FeedbackBanner>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!canSubmit}
        >
          {submitting ? (
            <>
              <Spinner size={18} />
              Updating…
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </form>
    </Card>
  );
}
