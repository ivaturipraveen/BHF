"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export interface RsvpFormProps {
  eventSlug: string;
  allowsDietaryRestrictions: boolean;
  capacityRemaining?: number | null;
  className?: string;
}

type Status = "idle" | "submitting" | "success" | "error";

interface RsvpSuccess {
  eventTitle: string;
  eventDate: string;
  partySize: number;
}

export function RsvpForm({
  eventSlug,
  allowsDietaryRestrictions,
  capacityRemaining,
  className,
}: RsvpFormProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [partySize, setPartySize] = React.useState(1);
  const [dietary, setDietary] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = React.useState(false);
  const [success, setSuccess] = React.useState<RsvpSuccess | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setError(null);
    setNeedsSignIn(false);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          name,
          email,
          partySize,
          dietaryRestrictions:
            allowsDietaryRestrictions && dietary.trim() !== ""
              ? dietary
              : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        eventTitle?: string;
        eventDate?: string;
        partySize?: number;
        error?: string;
      };
      if (res.status === 401) {
        setNeedsSignIn(true);
        setStatus("error");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Could not RSVP. Please try again.");
        setStatus("error");
        return;
      }
      setSuccess({
        eventTitle: data.eventTitle ?? "Event",
        eventDate: data.eventDate ?? "",
        partySize: data.partySize ?? partySize,
      });
      setStatus("success");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success" && success) {
    const dateStr = success.eventDate
      ? format(new Date(success.eventDate), "EEE, MMM d, yyyy · h:mm a")
      : "";
    return (
      <Card variant="elevated" className={className}>
        <h3 className="font-display text-2xl text-indigo">
          You&apos;re confirmed!
        </h3>
        <p className="mt-3 text-warm-gray">
          We&apos;ve saved your spot for{" "}
          <span className="font-semibold text-indigo">{success.eventTitle}</span>.
        </p>
        <dl className="mt-4 space-y-1 text-sm text-warm-gray">
          {dateStr ? (
            <div>
              <dt className="inline font-medium text-indigo">When: </dt>
              <dd className="inline">{dateStr}</dd>
            </div>
          ) : null}
          <div>
            <dt className="inline font-medium text-indigo">Party size: </dt>
            <dd className="inline">{success.partySize}</dd>
          </div>
        </dl>
        {/* TODO: enable .ics download once /api/events/[slug]/ics is implemented */}
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`flex flex-col gap-4 ${className ?? ""}`}>
      {capacityRemaining !== undefined && capacityRemaining !== null ? (
        <p className="text-sm text-warm-gray">
          {capacityRemaining > 0
            ? `${capacityRemaining} spots remaining`
            : "Event is full"}
        </p>
      ) : null}
      <Input
        label="Full name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoComplete="name"
      />
      <Input
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        label="Party size"
        type="number"
        name="partySize"
        min={1}
        max={10}
        value={partySize}
        onChange={(e) =>
          setPartySize(Math.max(1, Math.min(10, Number(e.target.value) || 1)))
        }
        required
      />
      {allowsDietaryRestrictions ? (
        <Textarea
          label="Dietary restrictions"
          name="dietaryRestrictions"
          value={dietary}
          onChange={(e) => setDietary(e.target.value)}
          hint="Optional — let us know about any allergies or dietary needs."
        />
      ) : null}
      {needsSignIn ? (
        <p className="text-sm text-red-600">
          Sign in to RSVP for members-only events.{" "}
          <Link href="/login" className="text-saffron underline">
            Sign in
          </Link>
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <>
            <Spinner size={18} />
            Submitting…
          </>
        ) : (
          "RSVP"
        )}
      </Button>
    </form>
  );
}
