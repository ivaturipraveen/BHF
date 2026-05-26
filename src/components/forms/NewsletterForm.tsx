"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";

export interface NewsletterFormProps {
  source?: string;
  className?: string;
}

type Status = "idle" | "submitting" | "success" | "already" | "error";

export function NewsletterForm({
  source = "homepage_footer",
  className,
}: NewsletterFormProps) {
  const [email, setEmail] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);

  function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  const emailError =
    touched && email.length > 0 && !isValidEmail(email)
      ? "Please enter a valid email address."
      : touched && email.length === 0
        ? "Email is required."
        : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setTouched(true);
    if (!isValidEmail(email)) return;
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      if (data.alreadySubscribed) {
        setStatus("already");
      } else {
        setStatus("success");
      }
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-saffron/15 mb-3">
          <CheckCircle2 size={28} className="text-saffron" aria-hidden="true" />
        </div>
        <p className="font-display text-lg text-indigo">
          Thank you — you&apos;re part of our community.
        </p>
        <p className="mt-1 text-sm text-warm-gray">
          Check your inbox for the first update.
        </p>
      </div>
    );
  }

  if (status === "already") {
    return (
      <p className="text-center text-indigo font-medium">
        You&apos;re already subscribed.
      </p>
    );
  }

  return (
    <div className={className}>
      {status === "error" && error ? (
        <FeedbackBanner variant="error" className="mb-3">
          {error}
        </FeedbackBanner>
      ) : null}
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched && !isValidEmail(e.target.value)) {
                // live-correct: re-validate as user types after first blur
              }
            }}
            onBlur={() => setTouched(true)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            error={emailError ?? undefined}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={status === "submitting"}
          className="sm:mb-0"
        >
          {status === "submitting" ? (
            <>
              <Spinner size={16} />
              Subscribing…
            </>
          ) : (
            "Stay connected"
          )}
        </Button>
      </form>
    </div>
  );
}
