"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type ContactType =
  | "volunteer"
  | "sponsor"
  | "general"
  | "press"
  | "planned_giving";

const typeOptions: { value: ContactType; label: string }[] = [
  { value: "volunteer", label: "Volunteer" },
  { value: "sponsor", label: "Sponsor" },
  { value: "general", label: "General" },
  { value: "press", label: "Press" },
  { value: "planned_giving", label: "Planned giving" },
];

export interface ContactFormProps {
  defaultType?: ContactType;
  className?: string;
}

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({
  defaultType = "general",
  className,
}: ContactFormProps) {
  const [type, setType] = React.useState<ContactType>(defaultType);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setError(null);
    try {
      const body: Record<string, unknown> = {
        type,
        name,
        email,
        message,
      };
      if (phone.trim()) body.phone = phone;
      if (type === "sponsor" && company.trim()) body.company = company;

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send your message. Please try again.");
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
        Thank you. We&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`flex flex-col gap-4 ${className ?? ""}`}>
      <Select
        label="How can we help?"
        value={type}
        onChange={(e) => setType(e.target.value as ContactType)}
        required
      >
        {typeOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      <Input
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoComplete="name"
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        label="Phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        autoComplete="tel"
        hint="Optional"
      />
      {type === "sponsor" ? (
        <Input
          label="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          autoComplete="organization"
        />
      ) : null}
      <Textarea
        label="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        required
        hint="Tell us a bit about how you'd like to get involved."
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
            Sending…
          </>
        ) : (
          "Send message"
        )}
      </Button>
    </form>
  );
}
