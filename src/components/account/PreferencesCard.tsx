"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";

export interface PreferencesCardProps {
  initial: {
    newsletterOptIn: boolean;
    directoryOptIn: boolean;
    eventRemindersOptIn: boolean;
    donationReceiptsOptIn: boolean;
    memberMessagesOptIn: boolean;
  };
}

type Banner =
  | { variant: "success"; message: string }
  | { variant: "error"; message: string }
  | null;

interface Toggle {
  key: keyof PreferencesCardProps["initial"];
  label: string;
}

const TOGGLES: Toggle[] = [
  { key: "newsletterOptIn", label: "Send me the monthly newsletter" },
  { key: "directoryOptIn", label: "List me in the member directory" },
  {
    key: "eventRemindersOptIn",
    label: "Send event reminders before events I have RSVPd to",
  },
  {
    key: "donationReceiptsOptIn",
    label: "Send donation receipts by email",
  },
  {
    key: "memberMessagesOptIn",
    label: "Allow other members to message me through the directory",
  },
];

export function PreferencesCard({ initial }: PreferencesCardProps) {
  const [baseline, setBaseline] = React.useState(initial);
  const [state, setState] = React.useState(initial);
  const [submitting, setSubmitting] = React.useState(false);
  const [banner, setBanner] = React.useState<Banner>(null);

  const dirty = React.useMemo(
    () => TOGGLES.some((t) => state[t.key] !== baseline[t.key]),
    [state, baseline],
  );

  function setKey(key: Toggle["key"], value: boolean) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting || !dirty) return;
    setBanner(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (res.status === 200) {
        setBaseline(state);
        setBanner({ variant: "success", message: "Preferences updated." });
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setBanner({
        variant: "error",
        message:
          data.error ?? "Could not update preferences. Please try again.",
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
      <h2 className="font-display text-xl text-indigo mb-4">
        Email preferences
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {TOGGLES.map((t) => (
          <Checkbox
            key={t.key}
            label={t.label}
            checked={state[t.key]}
            onChange={(e) => setKey(t.key, e.target.checked)}
          />
        ))}

        {banner ? (
          <FeedbackBanner variant={banner.variant}>
            {banner.message}
          </FeedbackBanner>
        ) : null}

        <div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!dirty || submitting}
          >
            {submitting ? (
              <>
                <Spinner size={18} />
                Saving…
              </>
            ) : (
              "Save preferences"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
