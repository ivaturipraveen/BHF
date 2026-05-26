"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";

export interface ChildFormInitial {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  allergies: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  photoPermission: boolean;
}

export interface ChildFormProps {
  mode: "create" | "edit";
  initialChild?: ChildFormInitial;
}

const US_PHONE = /^\+?1?[\s\-.]?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}$/;

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

function validate(values: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  allergies: string;
  emergencyContactPhone: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  else if (values.firstName.trim().length > 100)
    errors.firstName = "First name is too long.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  else if (values.lastName.trim().length > 100)
    errors.lastName = "Last name is too long.";
  if (!values.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.dateOfBirth)) {
    errors.dateOfBirth = "Use the date picker.";
  } else {
    const dob = new Date(`${values.dateOfBirth}T00:00:00Z`);
    const now = new Date();
    if (Number.isNaN(dob.getTime())) {
      errors.dateOfBirth = "Invalid date.";
    } else if (dob > now) {
      errors.dateOfBirth = "Date of birth must be in the past.";
    } else {
      const ageYears =
        (now.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (ageYears < 0 || ageYears > 21) {
        errors.dateOfBirth = "Age must be between 0 and 21.";
      }
    }
  }
  if (values.allergies.length > 1000) {
    errors.allergies = "Allergies must be 1000 characters or fewer.";
  }
  if (
    values.emergencyContactPhone.trim() !== "" &&
    !US_PHONE.test(values.emergencyContactPhone.trim())
  ) {
    errors.emergencyContactPhone = "Enter a US phone number (e.g., 555-123-4567).";
  }
  return errors;
}

export function ChildForm({ mode, initialChild }: ChildFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = React.useState(
    initialChild?.firstName ?? "",
  );
  const [lastName, setLastName] = React.useState(initialChild?.lastName ?? "");
  const [dateOfBirth, setDateOfBirth] = React.useState(
    initialChild?.dateOfBirth ?? "",
  );
  const [allergies, setAllergies] = React.useState(
    initialChild?.allergies ?? "",
  );
  const [emergencyContactName, setEmergencyContactName] = React.useState(
    initialChild?.emergencyContactName ?? "",
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = React.useState(
    initialChild?.emergencyContactPhone ?? "",
  );
  const [photoPermission, setPhotoPermission] = React.useState(
    initialChild?.photoPermission ?? false,
  );

  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    const v = validate({
      firstName,
      lastName,
      dateOfBirth,
      allergies,
      emergencyContactPhone,
    });
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    const body = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
      allergies: allergies.trim() === "" ? null : allergies.trim(),
      emergencyContactName:
        emergencyContactName.trim() === ""
          ? null
          : emergencyContactName.trim(),
      emergencyContactPhone:
        emergencyContactPhone.trim() === ""
          ? ""
          : emergencyContactPhone.trim(),
      photoPermission,
    };

    try {
      const url =
        mode === "create"
          ? "/api/me/children"
          : `/api/me/children/${initialChild?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 201 || res.status === 200) {
        const flash =
          mode === "create"
            ? `${body.firstName} was added to your family.`
            : `${body.firstName}'s profile was updated.`;
        try {
          window.sessionStorage.setItem("children-flash", flash);
        } catch {
          // ignore
        }
        router.push("/account/children");
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: {
          fieldErrors?: Record<string, string[]>;
        };
      };
      if (data.details?.fieldErrors) {
        const fe = data.details.fieldErrors;
        const next: FieldErrors = {};
        for (const [k, v] of Object.entries(fe)) {
          if (v && v.length > 0) {
            (next as Record<string, string>)[k] = v[0];
          }
        }
        setErrors(next);
      }
      setFormError(data.error ?? "Could not save. Please try again.");
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="rounded-lg bg-cream border border-saffron/30 px-4 py-3 text-sm text-warm-gray">
        This information is encrypted and never shared. Only BHF staff
        need-to-know for program safety reasons can see it. You may delete this
        profile at any time.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          autoComplete="off"
          error={errors.firstName}
        />
        <Input
          label="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          autoComplete="off"
          error={errors.lastName}
        />
      </div>

      <Input
        label="Date of birth"
        type="date"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
        required
        max={new Date().toISOString().slice(0, 10)}
        error={errors.dateOfBirth}
        hint="Used to verify program age eligibility."
      />

      <Textarea
        label="Allergies (optional)"
        value={allergies}
        onChange={(e) => setAllergies(e.target.value)}
        maxLength={1000}
        rows={3}
        error={errors.allergies}
        hint="List any food, environmental, or medication allergies our staff should know about."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Emergency contact name (optional)"
          value={emergencyContactName}
          onChange={(e) => setEmergencyContactName(e.target.value)}
          autoComplete="off"
          error={errors.emergencyContactName}
        />
        <Input
          label="Emergency contact phone (optional)"
          type="tel"
          value={emergencyContactPhone}
          onChange={(e) => setEmergencyContactPhone(e.target.value)}
          autoComplete="off"
          error={errors.emergencyContactPhone}
          hint="US phone format, e.g., 555-123-4567."
        />
      </div>

      <Checkbox
        label="I give permission for BHF to photograph my child during programs and events."
        checked={photoPermission}
        onChange={(e) => setPhotoPermission(e.target.checked)}
      />

      {formError ? (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" size="lg" disabled={submitting}>
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Add child"
              : "Save changes"}
        </Button>
        <button
          type="button"
          onClick={() => router.push("/account/children")}
          className="text-sm font-medium text-warm-gray hover:text-indigo min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
