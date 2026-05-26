"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { differenceInYears, format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/cn";

export interface FlowProgram {
  id: string;
  slug: string;
  title: string;
  frequency: string;
  short_description: string;
  min_age_years: number | null;
  max_age_years: number | null;
}

export interface FlowChild {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO
}

export interface YouthEnrollmentFlowProps {
  programs: FlowProgram[];
  childList: FlowChild[];
  initialProgramId?: string;
  initialChildId?: string;
}

type Step = 1 | 2 | 3 | 4;

interface SuccessState {
  childFirstName: string;
  childLastName: string;
  programTitle: string;
  consentAt: string;
}

const FREQ_LABELS: Record<string, string> = {
  monthly: "Monthly",
  annual: "Annual",
  rolling: "Rolling",
};

function ageOf(dob: string): number {
  return differenceInYears(new Date(), new Date(dob));
}

function ageRangeLabel(
  min: number | null,
  max: number | null,
): string {
  if (min !== null && max !== null) return `Ages ${min}–${max}`;
  if (min !== null) return `Ages ${min}+`;
  if (max !== null) return `Up to age ${max}`;
  return "All ages";
}

function isEligible(
  child: FlowChild,
  program: FlowProgram,
): boolean {
  const age = ageOf(child.dateOfBirth);
  if (program.min_age_years !== null && age < program.min_age_years) return false;
  if (program.max_age_years !== null && age > program.max_age_years) return false;
  return true;
}

export function YouthEnrollmentFlow({
  programs,
  childList,
  initialProgramId,
  initialChildId,
}: YouthEnrollmentFlowProps) {
  const router = useRouter();

  const initialProgram =
    initialProgramId && programs.find((p) => p.id === initialProgramId)
      ? programs.find((p) => p.id === initialProgramId) ?? null
      : null;
  const initialChild =
    initialChildId && childList.find((c) => c.id === initialChildId)
      ? childList.find((c) => c.id === initialChildId) ?? null
      : null;

  const [step, setStep] = React.useState<Step>(() => {
    if (initialProgram && initialChild) return 3;
    if (initialProgram) return 2;
    return 1;
  });
  const [selectedProgram, setSelectedProgram] = React.useState<FlowProgram | null>(
    initialProgram,
  );
  const [selectedChild, setSelectedChild] = React.useState<FlowChild | null>(
    initialChild,
  );
  const [consent, setConsent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitErrorCode, setSubmitErrorCode] = React.useState<string | null>(
    null,
  );
  const [success, setSuccess] = React.useState<SuccessState | null>(null);

  function goToProgram(p: FlowProgram) {
    setSelectedProgram(p);
    setSubmitError(null);
    setSubmitErrorCode(null);
    setStep(2);
  }

  function goToChild(c: FlowChild) {
    if (!selectedProgram) return;
    if (!isEligible(c, selectedProgram)) return;
    setSelectedChild(c);
    setSubmitError(null);
    setSubmitErrorCode(null);
    setStep(3);
  }

  function resetAndRestart() {
    setSelectedProgram(null);
    setSelectedChild(null);
    setConsent(false);
    setSubmitError(null);
    setSubmitErrorCode(null);
    setSuccess(null);
    setStep(1);
  }

  async function onConfirmConsent() {
    if (!selectedProgram || !selectedChild) return;
    if (!consent || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitErrorCode(null);
    try {
      const res = await fetch("/api/me/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: selectedChild.id,
          programId: selectedProgram.id,
          consentAcknowledged: true,
        }),
      });
      if (res.status === 201) {
        const data = (await res.json()) as {
          enrollment: { parentalConsentAt: string };
        };
        setSuccess({
          childFirstName: selectedChild.firstName,
          childLastName: selectedChild.lastName,
          programTitle: selectedProgram.title,
          consentAt: data.enrollment.parentalConsentAt,
        });
        setStep(4);
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      const code = data.error ?? "generic";
      setSubmitErrorCode(code);
      if (code === "age_ineligible") {
        setSubmitError(
          `Sorry, ${selectedChild.firstName} is not eligible for this program right now.`,
        );
      } else if (code === "already_enrolled") {
        setSubmitError("This child is already enrolled in this program.");
      } else if (code === "forbidden") {
        setSubmitError("You can only enroll your own children.");
      } else {
        setSubmitError(
          "Couldn't enroll. Please try again or contact support.",
        );
      }
    } catch {
      setSubmitError(
        "Couldn't enroll. Please try again or contact support.",
      );
      setSubmitErrorCode("generic");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <StepIndicator step={step} />

      {step === 1 ? (
        <StepProgram programs={programs} onSelect={goToProgram} />
      ) : null}
      {step === 2 && selectedProgram ? (
        <StepChild
          program={selectedProgram}
          childList={childList}
          onBack={() => setStep(1)}
          onSelect={goToChild}
        />
      ) : null}
      {step === 3 && selectedProgram && selectedChild ? (
        <StepConsent
          program={selectedProgram}
          child={selectedChild}
          consent={consent}
          setConsent={setConsent}
          submitting={submitting}
          submitError={submitError}
          submitErrorCode={submitErrorCode}
          onBack={() => setStep(2)}
          onConfirm={onConfirmConsent}
        />
      ) : null}
      {step === 4 && success ? (
        <StepSuccess
          success={success}
          childId={selectedChild?.id ?? ""}
          onRestart={resetAndRestart}
        />
      ) : null}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const labels = ["Program", "Child", "Consent", "Done"];
  return (
    <ol className="flex items-center gap-3" aria-label="Progress">
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const active = step === n;
        const done = step > n;
        return (
          <li
            key={label}
            className="flex items-center gap-2"
            aria-current={active ? "step" : undefined}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                active && "bg-saffron text-white",
                done && "bg-indigo text-white",
                !active && !done && "bg-gray-100 text-warm-gray",
              )}
            >
              {n}
            </span>
            <span
              className={cn(
                "hidden sm:inline text-xs uppercase tracking-widest",
                active ? "text-indigo font-medium" : "text-warm-gray",
              )}
            >
              {label}
            </span>
            {i < labels.length - 1 ? (
              <span className="hidden sm:inline h-px w-6 bg-gray-200" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function StepProgram({
  programs,
  onSelect,
}: {
  programs: FlowProgram[];
  onSelect: (p: FlowProgram) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-xl md:text-2xl text-indigo">
        Choose a youth program
      </h2>
      {programs.length === 0 ? (
        <Card>
          <p className="text-sm text-warm-gray">
            No youth programs are open for registration right now. Please check
            back soon.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="saffron">
                  {FREQ_LABELS[p.frequency] ?? p.frequency}
                </Badge>
                <Badge variant="indigo">
                  {ageRangeLabel(p.min_age_years, p.max_age_years)}
                </Badge>
              </div>
              <h3 className="font-display text-lg text-indigo">{p.title}</h3>
              <p className="text-sm text-warm-gray flex-1">
                {p.short_description}
              </p>
              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => onSelect(p)}
                >
                  Select
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StepChild({
  program,
  childList,
  onBack,
  onSelect,
}: {
  program: FlowProgram;
  childList: FlowChild[];
  onBack: () => void;
  onSelect: (c: FlowChild) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl md:text-2xl text-indigo">
          Who are you enrolling?
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-warm-gray hover:text-indigo min-h-[44px]"
        >
          ← Back
        </button>
      </div>
      <p className="text-sm text-warm-gray">
        Selected program:{" "}
        <span className="font-medium text-indigo">{program.title}</span> (
        {ageRangeLabel(program.min_age_years, program.max_age_years)})
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {childList.map((c) => {
          const eligible = isEligible(c, program);
          const age = ageOf(c.dateOfBirth);
          return (
            <Card
              key={c.id}
              className={cn(
                "flex flex-col gap-3",
                !eligible && "opacity-70",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg text-indigo">
                  {c.firstName} {c.lastName}
                </h3>
                {eligible ? (
                  <Badge variant="saffron">Eligible</Badge>
                ) : (
                  <Badge variant="amber">Outside age range</Badge>
                )}
              </div>
              <p className="text-sm text-warm-gray">
                {age} {age === 1 ? "year" : "years"} old
              </p>
              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={!eligible}
                  onClick={() => onSelect(c)}
                >
                  {eligible ? "Select" : "Not eligible"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      <div>
        <Link
          href="/account/children/new"
          className="text-sm text-saffron hover:text-amber-burnt font-medium"
        >
          Add another child →
        </Link>
      </div>
    </div>
  );
}

function StepConsent({
  program,
  child,
  consent,
  setConsent,
  submitting,
  submitError,
  submitErrorCode,
  onBack,
  onConfirm,
}: {
  program: FlowProgram;
  child: FlowChild;
  consent: boolean;
  setConsent: (v: boolean) => void;
  submitting: boolean;
  submitError: string | null;
  submitErrorCode: string | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const age = ageOf(child.dateOfBirth);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl md:text-2xl text-indigo">
          Parental consent
        </h2>
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="text-sm font-medium text-warm-gray hover:text-indigo min-h-[44px] disabled:opacity-60"
        >
          ← Back
        </button>
      </div>

      <Card className="bg-cream border-saffron/40">
        <p className="text-sm text-warm-gray">
          You&apos;re enrolling{" "}
          <span className="font-semibold text-indigo">
            {child.firstName} ({age})
          </span>{" "}
          in{" "}
          <span className="font-semibold text-indigo">{program.title}</span>.
        </p>
      </Card>

      <div className="rounded-xl border border-saffron/40 bg-cream p-5 text-sm text-warm-gray leading-relaxed">
        <p className="font-medium text-indigo mb-2">
          As {child.firstName}&apos;s parent or legal guardian, I confirm:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>I am authorizing BHF to enroll my child in this program.</li>
          <li>
            BHF may collect and maintain my child&apos;s first name, last
            name, date of birth, allergies, and emergency contact information
            as I have provided.
          </li>
          <li>
            BHF will not share my child&apos;s information with third parties
            outside the scope of program operations.
          </li>
          <li>
            I can withdraw consent and request deletion of my child&apos;s
            data at any time via{" "}
            <Link
              href="/account/children"
              className="text-saffron hover:text-amber-burnt font-medium"
            >
              /account/children
            </Link>
            .
          </li>
          <li>
            I have read and agree to BHF&apos;s{" "}
            <Link
              href="/privacy"
              className="text-saffron hover:text-amber-burnt font-medium"
            >
              Privacy Policy
            </Link>
            .
          </li>
        </ul>
      </div>

      <Checkbox
        label="I am the parent or legal guardian and I consent to the above."
        checked={consent}
        onChange={(e) => setConsent(e.target.checked)}
      />

      <p className="text-xs text-warm-gray">
        I understand this consent will be recorded with my IP address, browser
        information, and timestamp for verification.
      </p>

      {submitError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p>{submitError}</p>
          {submitErrorCode === "age_ineligible" ? (
            <button
              type="button"
              onClick={onBack}
              className="mt-2 text-xs font-medium text-red-700 underline"
            >
              ← Choose a different program
            </button>
          ) : null}
          {submitErrorCode === "already_enrolled" ? (
            <Link
              href={`/account/children/${child.id}`}
              className="mt-2 inline-block text-xs font-medium text-red-700 underline"
            >
              View {child.firstName}&apos;s enrollments →
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="lg"
          disabled={!consent || submitting}
          onClick={onConfirm}
        >
          {submitting ? "Confirming…" : "Confirm enrollment"}
        </Button>
      </div>
    </div>
  );
}

function StepSuccess({
  success,
  childId,
  onRestart,
}: {
  success: SuccessState;
  childId: string;
  onRestart: () => void;
}) {
  return (
    <Card className="bg-cream border-saffron/40">
      <h2 className="font-display text-2xl text-indigo">
        You&apos;re all set!
      </h2>
      <p className="mt-2 text-warm-gray">
        <span className="font-semibold text-indigo">
          {success.childFirstName} {success.childLastName}
        </span>{" "}
        is enrolled in{" "}
        <span className="font-semibold text-indigo">
          {success.programTitle}
        </span>
        .
      </p>
      <p className="mt-1 text-xs text-warm-gray">
        Consent recorded on{" "}
        {format(new Date(success.consentAt), "MMM d, yyyy 'at' h:mm a")}.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onRestart}
        >
          Add another enrollment
        </Button>
        {childId ? (
          <Link
            href={`/account/children/${childId}`}
            className="inline-flex items-center justify-center rounded-full border-2 border-indigo px-6 py-3 text-sm font-semibold text-indigo hover:bg-indigo hover:text-white min-h-[44px]"
          >
            View {success.childFirstName}&apos;s enrollments
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
