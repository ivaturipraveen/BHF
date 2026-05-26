"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export interface PhotoSubmissionFormProps {
  eventSlug?: string;
  className?: string;
}

type Status = "idle" | "submitting" | "success" | "error";

export function PhotoSubmissionForm({
  eventSlug,
  className,
}: PhotoSubmissionFormProps) {
  const [submitterName, setSubmitterName] = React.useState("");
  const [submitterEmail, setSubmitterEmail] = React.useState("");
  const [fileUrl, setFileUrl] = React.useState("");
  const [caption, setCaption] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setError(null);
    try {
      const body: Record<string, unknown> = {
        submitterName,
        submitterEmail,
        fileUrl,
      };
      if (caption.trim()) body.caption = caption;
      if (eventSlug) body.eventSlug = eventSlug;
      const res = await fetch("/api/photo-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not submit photo. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-center text-indigo font-medium">
        Thank you — we&apos;ll review your photo and reach out if we use it.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`flex flex-col gap-4 ${className ?? ""}`}>
      <Input
        label="Your name"
        value={submitterName}
        onChange={(e) => setSubmitterName(e.target.value)}
        required
        autoComplete="name"
      />
      <Input
        label="Email"
        type="email"
        inputMode="email"
        value={submitterEmail}
        onChange={(e) => setSubmitterEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        label="Photo URL"
        type="url"
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
        required
        hint="Paste a Google Photos or Dropbox shared URL."
      />
      <Textarea
        label="Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        hint="Optional — a sentence about the moment."
      />
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
          "Submit photo"
        )}
      </Button>
    </form>
  );
}
