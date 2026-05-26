"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
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
      <p className="text-center text-indigo font-medium">
        Thank you — you&apos;re on the list.
      </p>
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
    <form
      onSubmit={onSubmit}
      className={`flex flex-col gap-3 sm:flex-row sm:items-end ${className ?? ""}`}
    >
      <div className="flex-1">
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          error={status === "error" ? error ?? undefined : undefined}
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={status === "submitting"}
        className="sm:mb-0"
      >
        {status === "submitting" ? "Subscribing…" : "Stay connected"}
      </Button>
    </form>
  );
}
