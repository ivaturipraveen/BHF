"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export interface ResetPasswordFormProps {
  email: string;
  token: string;
}

interface PasswordChecks {
  length: boolean;
  upper: boolean;
  lower: boolean;
  digit: boolean;
}

function checkPassword(p: string): PasswordChecks {
  return {
    length: p.length >= 8,
    upper: /[A-Z]/.test(p),
    lower: /[a-z]/.test(p),
    digit: /[0-9]/.test(p),
  };
}

export function ResetPasswordForm({ email, token }: ResetPasswordFormProps) {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const pwChecks = checkPassword(password);
  const pwValid =
    pwChecks.length && pwChecks.upper && pwChecks.lower && pwChecks.digit;
  const mismatch =
    confirm.length > 0 && password !== confirm
      ? "Passwords do not match."
      : undefined;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!pwValid) {
      setError("Password does not meet the requirements.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      if (res.status === 200) {
        window.location.assign("/login?reset=ok");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 400) {
        setError(data.error ?? "Invalid or expired reset link.");
      } else if (res.status === 429) {
        setError("Too many attempts. Please wait a minute and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div>
        <Input
          label="New password"
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <ul className="mt-2 text-xs space-y-0.5">
          <li className={pwChecks.length ? "text-green-700" : "text-warm-gray"}>
            • At least 8 characters
          </li>
          <li className={pwChecks.upper ? "text-green-700" : "text-warm-gray"}>
            • One uppercase letter
          </li>
          <li className={pwChecks.lower ? "text-green-700" : "text-warm-gray"}>
            • One lowercase letter
          </li>
          <li className={pwChecks.digit ? "text-green-700" : "text-warm-gray"}>
            • One number
          </li>
        </ul>
      </div>
      <Input
        label="Confirm new password"
        type="password"
        name="confirm"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        error={mismatch}
      />
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" size="lg" disabled={submitting}>
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
  );
}
