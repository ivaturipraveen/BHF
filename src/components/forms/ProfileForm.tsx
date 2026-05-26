"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type InterestKey = "festivals" | "youth_programs" | "seva" | "classes";

const INTEREST_OPTIONS: { key: InterestKey; label: string }[] = [
  { key: "festivals", label: "Festivals" },
  { key: "youth_programs", label: "Youth programs" },
  { key: "seva", label: "Seva (volunteering)" },
  { key: "classes", label: "Classes & workshops" },
];

export interface ProfileFormMember {
  first_name: string;
  last_name: string;
  phone: string | null;
  city: string | null;
  bio: string | null;
  photo_url: string | null;
  family_size: string | null;
  interests: string[] | null;
  directory_opt_in: boolean;
  newsletter_opt_in: boolean;
}

export interface ProfileFormProps {
  initialMember: ProfileFormMember;
}

export function ProfileForm({ initialMember }: ProfileFormProps) {
  const [firstName, setFirstName] = React.useState(initialMember.first_name);
  const [lastName, setLastName] = React.useState(initialMember.last_name);
  const [phone, setPhone] = React.useState(initialMember.phone ?? "");
  const [city, setCity] = React.useState(initialMember.city ?? "");
  const [bio, setBio] = React.useState(initialMember.bio ?? "");
  const [photoUrl, setPhotoUrl] = React.useState(
    initialMember.photo_url ?? "",
  );
  const [familySize, setFamilySize] = React.useState(
    initialMember.family_size ?? "",
  );
  const [interests, setInterests] = React.useState<InterestKey[]>(
    ((initialMember.interests ?? []) as InterestKey[]).filter((i) =>
      INTEREST_OPTIONS.some((o) => o.key === i),
    ),
  );
  const [directoryOptIn, setDirectoryOptIn] = React.useState(
    initialMember.directory_opt_in,
  );
  const [newsletterOptIn, setNewsletterOptIn] = React.useState(
    initialMember.newsletter_opt_in,
  );

  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function toggleInterest(key: InterestKey) {
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: phone.trim() === "" ? null : phone.trim(),
          city: city.trim() === "" ? null : city.trim(),
          bio: bio.trim() === "" ? null : bio.trim(),
          photoUrl: photoUrl.trim() === "" ? null : photoUrl.trim(),
          familySize: familySize === "" ? null : familySize,
          interests,
          directoryOptIn,
          newsletterOptIn,
        }),
      });
      if (res.status === 200) {
        setSuccess(true);
      } else {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(data.error ?? "Could not save profile. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          label="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <Input
        label="Phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Input
        label="City"
        autoComplete="address-level2"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <Textarea
        label="Bio"
        rows={4}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        hint="A short introduction — visible in the directory if you opt in."
      />
      <Input
        label="Photo URL"
        type="url"
        value={photoUrl}
        onChange={(e) => setPhotoUrl(e.target.value)}
        hint="Paste a link to a hosted photo (uploads coming soon)."
      />

      <Select
        label="Family size"
        value={familySize}
        onChange={(e) => setFamilySize(e.target.value)}
      >
        <option value="">Select…</option>
        <option value="single">Single</option>
        <option value="couple">Couple</option>
        <option value="small_family">Small family (3-4)</option>
        <option value="large_family">Large family (5+)</option>
      </Select>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-indigo mb-1">
          Interests
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
        label="List me in the member directory"
        hint="You can change this anytime."
        checked={directoryOptIn}
        onChange={(e) => setDirectoryOptIn(e.target.checked)}
      />
      <Checkbox
        label="Subscribe me to the BHF newsletter"
        checked={newsletterOptIn}
        onChange={(e) => setNewsletterOptIn(e.target.checked)}
      />

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-green-700" role="status">
          Profile saved.
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" disabled={submitting}>
        {submitting ? (
          <>
            <Spinner size={18} />
            Saving…
          </>
        ) : (
          "Save changes"
        )}
      </Button>
    </form>
  );
}
