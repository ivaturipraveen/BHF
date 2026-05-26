"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // anti-enumeration: always show success
    }
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <Card variant="elevated">
        <h2 className="font-display text-2xl text-indigo">Check your email</h2>
        <p className="mt-3 text-warm-gray">
          If an account exists for that email, we sent a reset link. The link
          expires in 1 hour.
        </p>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit" variant="primary" size="lg" disabled={submitting}>
        {submitting ? (
          <>
            <Spinner size={18} />
            Sending…
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
}
