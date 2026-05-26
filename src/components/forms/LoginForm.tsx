"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export interface LoginFormProps {
  next: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [needsVerify, setNeedsVerify] = React.useState(false);
  const [resendStatus, setResendStatus] = React.useState<
    "idle" | "sending" | "sent"
  >("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setNeedsVerify(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 200) {
        window.location.assign(next || "/account");
        return;
      }
      if (res.status === 401) {
        setError("Invalid email or password.");
      } else if (res.status === 403) {
        const msg = data.error ?? "";
        if (/suspended/i.test(msg)) {
          setError("Account suspended. Contact support.");
        } else {
          setNeedsVerify(true);
          setError("Please verify your email first.");
        }
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

  async function onResend() {
    if (!email || resendStatus === "sending") return;
    setResendStatus("sending");
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // intentionally swallow — generic OK pattern on server
    }
    setResendStatus("sent");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next} readOnly />
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
          {needsVerify ? (
            <>
              {" "}
              <button
                type="button"
                onClick={onResend}
                disabled={resendStatus === "sending" || !email}
                className="underline text-saffron hover:text-amber-burnt disabled:opacity-60"
              >
                {resendStatus === "sending"
                  ? "Sending…"
                  : resendStatus === "sent"
                    ? "Verification email sent"
                    : "Resend verification"}
              </button>
            </>
          ) : null}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Spinner size={18} />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
