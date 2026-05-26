"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type DonationTab = "monthly" | "yearly" | "one_time";

export interface DonationTiers {
  MONTHLY: readonly number[];
  YEARLY: readonly number[];
  ONE_TIME: readonly number[];
}

export interface DonationFormProps {
  tiers: DonationTiers;
  largeGiftThreshold: number;
  phone: string;
  ein: string;
  legalName: string;
  stubMode: boolean;
}

interface CheckoutResponse {
  mode?: "stub" | "live";
  successUrl?: string;
  sessionUrl?: string;
  error?: string;
}

const TAB_LABEL: Record<DonationTab, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  one_time: "One-time",
};

const TAB_ORDER: DonationTab[] = ["monthly", "yearly", "one_time"];

function tierAmounts(tab: DonationTab, tiers: DonationTiers): readonly number[] {
  if (tab === "monthly") return tiers.MONTHLY;
  if (tab === "yearly") return tiers.YEARLY;
  return tiers.ONE_TIME;
}

function formatTierLabel(amount: number, tab: DonationTab): string {
  const formatted = `$${amount.toLocaleString("en-US")}`;
  if (tab === "monthly") return `${formatted}/month`;
  if (tab === "yearly") return `${formatted}/year`;
  return formatted;
}

function formatDollars(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toLocaleString("en-US", {
    minimumFractionDigits: dollars % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function parseCustomAmountCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) return null;
  const dollars = Number.parseFloat(trimmed);
  if (!Number.isFinite(dollars) || dollars <= 0) return null;
  return Math.round(dollars * 100);
}

export function DonationForm({
  tiers,
  largeGiftThreshold,
  phone,
  ein,
  legalName,
  stubMode,
}: DonationFormProps) {
  const [tab, setTab] = React.useState<DonationTab>("monthly");
  const [amountCents, setAmountCents] = React.useState<number | null>(null);
  const [customAmount, setCustomAmount] = React.useState("");
  const [donorName, setDonorName] = React.useState("");
  const [donorEmail, setDonorEmail] = React.useState("");
  const [donorAddress, setDonorAddress] = React.useState("");
  const [inHonorOf, setInHonorOf] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const amounts = tierAmounts(tab, tiers);
  const largeGift =
    amountCents !== null && amountCents > largeGiftThreshold * 100;

  function selectTier(dollars: number): void {
    setAmountCents(dollars * 100);
    setCustomAmount("");
  }

  function onCustomAmountChange(value: string): void {
    setCustomAmount(value);
    const parsed = parseCustomAmountCents(value);
    setAmountCents(parsed);
  }

  function onTabChange(next: DonationTab): void {
    setTab(next);
    setAmountCents(null);
    setCustomAmount("");
  }

  const canSubmit =
    !submitting &&
    amountCents !== null &&
    amountCents >= 100 &&
    donorName.trim().length > 0 &&
    donorEmail.trim().length > 0 &&
    agreed;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!canSubmit || amountCents === null) return;
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        amountCents,
        type: tab,
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
      };
      if (donorAddress.trim()) body.donorAddress = donorAddress.trim();
      if (inHonorOf.trim()) body.inHonorOf = inHonorOf.trim();

      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as CheckoutResponse;
      if (!res.ok) {
        setError(
          data.error ??
            "We couldn't start your donation. Please try again or call us.",
        );
        setSubmitting(false);
        return;
      }
      if (data.mode === "live" && data.sessionUrl) {
        window.location.href = data.sessionUrl;
        return;
      }
      if (data.mode === "stub" && data.successUrl) {
        window.location.href = data.successUrl;
        return;
      }
      setError("Unexpected checkout response. Please try again.");
      setSubmitting(false);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  const submitLabel =
    amountCents !== null && amountCents >= 100
      ? `Donate ${formatDollars(amountCents)} via secure checkout`
      : "Donate via secure checkout";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <div>
        <div
          role="tablist"
          aria-label="Donation frequency"
          className="grid grid-cols-3 gap-2 p-1 rounded-full bg-gray-100"
        >
          {TAB_ORDER.map((t) => {
            const active = t === tab;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`tier-grid-${t}`}
                id={`tab-${t}`}
                onClick={() => onTabChange(t)}
                className={cn(
                  "min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-saffron text-white shadow-sm"
                    : "bg-transparent text-warm-gray hover:text-indigo",
                )}
              >
                {TAB_LABEL[t]}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`tier-grid-${tab}`}
          aria-labelledby={`tab-${tab}`}
          className="mt-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {amounts.map((dollars) => {
              const selected = amountCents === dollars * 100;
              return (
                <button
                  key={dollars}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectTier(dollars)}
                  className={cn(
                    "min-h-[44px] rounded-xl border px-4 py-3 text-base font-semibold transition-colors",
                    selected
                      ? "bg-saffron text-white border-saffron"
                      : "bg-white text-indigo border-gray-300 hover:border-saffron hover:text-saffron",
                  )}
                >
                  {formatTierLabel(dollars, tab)}
                </button>
              );
            })}
          </div>
          <div className="mt-4">
            <Input
              label="Custom amount"
              type="text"
              inputMode="decimal"
              placeholder="$"
              value={customAmount}
              onChange={(e) => onCustomAmountChange(e.target.value)}
              hint="Enter any amount in U.S. dollars."
            />
          </div>
        </div>
      </div>

      {largeGift ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-amber-burnt bg-amber-burnt/10 p-4 text-sm text-amber-burnt"
        >
          Donating {amountCents !== null ? formatDollars(amountCents) : ""}?
          Please call{" "}
          <a
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            className="underline font-medium"
          >
            {phone}
          </a>{" "}
          so we can assist with large gifts.
        </div>
      ) : null}

      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-xl text-indigo">Your information</h2>
        <Input
          label="Full name"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          required
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          value={donorEmail}
          onChange={(e) => setDonorEmail(e.target.value)}
          required
          autoComplete="email"
          hint="We'll email your tax receipt here."
        />
        <Textarea
          label="Mailing address"
          value={donorAddress}
          onChange={(e) => setDonorAddress(e.target.value)}
          hint="Optional — used for mailed acknowledgments."
          rows={3}
        />
        <Input
          label="In honor or memory of"
          value={inHonorOf}
          onChange={(e) => setInHonorOf(e.target.value)}
          hint="Optional."
        />
      </Card>

      <Checkbox
        label={`I acknowledge that ${legalName} is a 501(c)(3) (EIN ${ein}) and that this donation is tax-deductible.`}
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
        required
      />

      <div aria-live="polite" className="min-h-[1.25rem]">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!canSubmit}
          className="w-full md:w-auto md:self-start min-h-[52px]"
        >
          {submitting ? "Starting checkout…" : submitLabel}
        </Button>
        <p className="text-xs text-warm-gray leading-relaxed max-w-3xl">
          For donating amounts greater than $1,000, it is recommended that you
          contact Team BHF at {phone}. BHF is a 501(c)(3) tax-exempt
          organization, and your donation is tax deductible within the
          guidelines of U.S. law. Please keep your receipt as your official
          record. We&apos;ll email it to you upon successful completion of
          your donation.
          {stubMode ? (
            <span className="block mt-2 text-amber-burnt">
              Demo mode: no card will be charged.
            </span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
