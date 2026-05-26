"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

type InterestKey = "festivals" | "youth_programs" | "seva" | "classes";

const INTEREST_OPTIONS: { key: InterestKey; label: string }[] = [
  { key: "festivals", label: "Festivals" },
  { key: "youth_programs", label: "Youth programs" },
  { key: "seva", label: "Seva (volunteering)" },
  { key: "classes", label: "Classes & workshops" },
];

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

export function SignupForm() {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState("");
  const [familySize, setFamilySize] = React.useState("");
  const [howHeard, setHowHeard] = React.useState("");
  const [interests, setInterests] = React.useState<InterestKey[]>([]);
  const [newsletterOptIn, setNewsletterOptIn] = React.useState(false);
  const [directoryOptIn, setDirectoryOptIn] = React.useState(false);
  const [privacyAgreed, setPrivacyAgreed] = React.useState(false);

  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {},
  );
  const [resendStatus, setResendStatus] = React.useState<
    "idle" | "sending" | "sent"
  >("idle");

  const pwChecks = checkPassword(password);
  const pwValid =
    pwChecks.length && pwChecks.upper && pwChecks.lower && pwChecks.digit;
  const confirmError =
    confirmPassword.length > 0 && password !== confirmPassword
      ? "Passwords do not match."
      : undefined;

  function toggleInterest(key: InterestKey) {
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setFieldErrors({});

    if (!privacyAgreed) {
      setError("Please agree to the Privacy Policy and Terms of Service.");
      return;
    }
    if (!pwValid) {
      setFieldErrors({ password: "Password does not meet requirements." });
      return;
    }
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phone: phone.trim() || undefined,
          city: city.trim() || undefined,
          familySize: familySize || undefined,
          howHeard: howHeard || undefined,
          interests: interests.length > 0 ? interests : undefined,
          newsletterOptIn,
          directoryOptIn,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: { fieldErrors?: Record<string, string[]> };
      };
      if (res.status === 200) {
        setSubmitted(true);
      } else if (res.status === 400) {
        const fe: Record<string, string> = {};
        const fieldErr = data.details?.fieldErrors ?? {};
        for (const k of Object.keys(fieldErr)) {
          fe[k] = fieldErr[k]?.[0] ?? "Invalid value";
        }
        setFieldErrors(fe);
        if (Object.keys(fe).length === 0) {
          setError(data.error ?? "Please check your information and try again.");
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
    if (resendStatus === "sending") return;
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

  if (submitted) {
    return (
      <Card variant="elevated">
        <h2 className="font-display text-2xl text-indigo">
          Check your inbox
        </h2>
        <p className="mt-3 text-warm-gray">
          We sent a verification link to{" "}
          <span className="font-semibold text-indigo">{email}</span>. Click the
          link to activate your account.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onResend}
            disabled={resendStatus !== "idle"}
          >
            {resendStatus === "sending"
              ? "Sending…"
              : resendStatus === "sent"
                ? "Resent — check your inbox"
                : "Resend verification email"}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First name"
          name="firstName"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          error={fieldErrors.firstName}
        />
        <Input
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          error={fieldErrors.lastName}
        />
      </div>

      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        error={fieldErrors.email}
      />

      <div>
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          error={fieldErrors.password}
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
        label="Confirm password"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        error={fieldErrors.confirmPassword ?? confirmError}
      />

      <Input
        label="Phone (optional)"
        type="tel"
        name="phone"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={fieldErrors.phone}
      />

      <Input
        label="City (optional)"
        name="city"
        autoComplete="address-level2"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        error={fieldErrors.city}
      />

      <Select
        label="Family size"
        name="familySize"
        value={familySize}
        onChange={(e) => setFamilySize(e.target.value)}
        error={fieldErrors.familySize}
      >
        <option value="">Select…</option>
        <option value="single">Single</option>
        <option value="couple">Couple</option>
        <option value="small_family">Small family (3-4)</option>
        <option value="large_family">Large family (5+)</option>
      </Select>

      <Select
        label="How did you hear about us?"
        name="howHeard"
        value={howHeard}
        onChange={(e) => setHowHeard(e.target.value)}
        error={fieldErrors.howHeard}
      >
        <option value="">Select…</option>
        <option value="friend_or_family">Friend or family</option>
        <option value="event">Event</option>
        <option value="social_media">Social media</option>
        <option value="search">Search</option>
        <option value="other">Other</option>
      </Select>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-indigo mb-1">
          Interests (optional)
        </legend>
        {INTEREST_OPTIONS.map((opt) => (
          <Checkbox
            key={opt.key}
            label={opt.label}
            checked={interests.includes(opt.key)}
            onChange={() => toggleInterest(opt.key)}
          />
        ))}
      </fieldset>

      <Checkbox
        label="Subscribe me to the BHF newsletter"
        checked={newsletterOptIn}
        onChange={(e) => setNewsletterOptIn(e.target.checked)}
      />

      <Checkbox
        label="List me in the member directory"
        hint="You can change this anytime."
        checked={directoryOptIn}
        onChange={(e) => setDirectoryOptIn(e.target.checked)}
      />

      <Checkbox
        label="I agree to the Privacy Policy and Terms of Service."
        checked={privacyAgreed}
        onChange={(e) => setPrivacyAgreed(e.target.checked)}
        required
      />

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
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
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
