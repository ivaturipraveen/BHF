'use client';

import { useState, useEffect } from 'react';
import slugify from 'slugify';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { FormShell } from '@/components/admin/FormShell';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { MarkdownField } from '@/components/admin/MarkdownField';
import type { Event } from '@/types/db';

function toLocalDateTimeInput(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIso(local: string | null | undefined): string | null {
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

interface FormValues extends Record<string, unknown> {
  title: string;
  slug: string;
  description_md: string;
  starts_at: string;
  ends_at: string;
  location_name: string;
  location_address: string;
  lat: string;
  lng: string;
  type: string;
  status: string;
  rsvp_capacity: string;
  members_only: boolean;
  members_early_access_at: string;
  allows_dietary_restrictions: boolean;
  hero_image_url: string;
}

function buildInitial(existing?: Event): FormValues {
  return {
    title: existing?.title ?? '',
    slug: existing?.slug ?? '',
    description_md: existing?.description_md ?? '',
    starts_at: toLocalDateTimeInput(existing?.starts_at),
    ends_at: toLocalDateTimeInput(existing?.ends_at),
    location_name: existing?.location_name ?? '',
    location_address: existing?.location_address ?? '',
    lat: existing?.location_lat != null ? String(existing.location_lat) : '',
    lng: existing?.location_lng != null ? String(existing.location_lng) : '',
    type: existing?.type ?? '',
    status: existing?.status ?? 'draft',
    rsvp_capacity: existing?.rsvp_capacity != null ? String(existing.rsvp_capacity) : '',
    members_only: existing?.members_only ?? false,
    members_early_access_at: toLocalDateTimeInput(existing?.members_early_access_at),
    allows_dietary_restrictions: existing?.allows_dietary_restrictions ?? false,
    hero_image_url: existing?.hero_image_url ?? '',
  };
}

export function EventForm({ existing }: { existing?: Event }) {
  const initial = buildInitial(existing);
  const endpoint = existing
    ? { method: 'PATCH' as const, path: `/api/admin/events/${existing.id}` }
    : { method: 'POST' as const, path: '/api/admin/events' };

  return (
    <FormShell<FormValues>
      resource="events"
      recordId={existing?.id}
      initialValues={initial}
      endpoint={endpoint}
      redirectTo="/admin/events"
      title={existing ? 'Edit event' : 'New event'}
      description={existing ? existing.title : 'Create a new event.'}
      buildPayload={(v) => {
        const payload: Record<string, unknown> = {
          title: v.title.trim(),
          slug: v.slug.trim() || slugify(v.title, { lower: true, strict: true }),
          description_md: v.description_md,
          starts_at: toIso(v.starts_at),
          ends_at: v.ends_at ? toIso(v.ends_at) : null,
          location_name: v.location_name || null,
          location_address: v.location_address || null,
          location_lat: v.lat ? Number(v.lat) : null,
          location_lng: v.lng ? Number(v.lng) : null,
          hero_image_url: v.hero_image_url || null,
          type: v.type || null,
          status: v.status,
          rsvp_capacity: v.rsvp_capacity ? Number(v.rsvp_capacity) : null,
          members_only: v.members_only,
          members_early_access_at: v.members_early_access_at ? toIso(v.members_early_access_at) : null,
          allows_dietary_restrictions: v.allows_dietary_restrictions,
        };
        if (existing) {
          delete payload.slug;
        }
        return payload;
      }}
    >
      {({ values, setField }) => (
        <SlugAutoTitle values={values} setField={setField} existing={!!existing}>
          <Card className="space-y-4">
            <Input
              label="Title"
              required
              value={values.title}
              onChange={(e) => setField('title', e.target.value)}
            />
            <Input
              label="Slug"
              required={!existing}
              hint="Used in the URL. Lower-case letters, numbers and dashes."
              value={values.slug}
              onChange={(e) => setField('slug', e.target.value)}
              disabled={!!existing}
            />
            <MarkdownField
              label="Description (Markdown)"
              value={values.description_md}
              onChange={(v) => setField('description_md', v)}
              required
            />
          </Card>

          <Card className="space-y-4">
            <h3 className="font-display text-lg text-indigo">Schedule & location</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Starts at"
                type="datetime-local"
                required
                value={values.starts_at}
                onChange={(e) => setField('starts_at', e.target.value)}
              />
              <Input
                label="Ends at"
                type="datetime-local"
                value={values.ends_at}
                onChange={(e) => setField('ends_at', e.target.value)}
              />
              <Input
                label="Location name"
                value={values.location_name}
                onChange={(e) => setField('location_name', e.target.value)}
              />
              <Input
                label="Location address"
                value={values.location_address}
                onChange={(e) => setField('location_address', e.target.value)}
              />
              <Input
                label="Latitude"
                value={values.lat}
                onChange={(e) => setField('lat', e.target.value)}
              />
              <Input
                label="Longitude"
                value={values.lng}
                onChange={(e) => setField('lng', e.target.value)}
              />
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-display text-lg text-indigo">Type, status & RSVPs</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Type"
                value={values.type}
                onChange={(e) => setField('type', e.target.value)}
              >
                <option value="">— Select —</option>
                <option value="festival">Festival</option>
                <option value="class">Class</option>
                <option value="charity">Charity</option>
                <option value="youth">Youth</option>
                <option value="other">Other</option>
              </Select>
              <Select
                label="Status"
                value={values.status}
                onChange={(e) => setField('status', e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
              <Input
                label="RSVP capacity"
                type="number"
                min={0}
                value={values.rsvp_capacity}
                onChange={(e) => setField('rsvp_capacity', e.target.value)}
              />
              <Input
                label="Members early access at"
                type="datetime-local"
                value={values.members_early_access_at}
                onChange={(e) => setField('members_early_access_at', e.target.value)}
                hint="Public RSVP opens at this time. Leave blank for immediate public RSVP."
              />
            </div>
            <Checkbox
              label="Members only"
              checked={values.members_only}
              onChange={(e) => setField('members_only', e.target.checked)}
            />
            <Checkbox
              label="Allow dietary restrictions in RSVP form"
              checked={values.allows_dietary_restrictions}
              onChange={(e) => setField('allows_dietary_restrictions', e.target.checked)}
            />
          </Card>

          <Card>
            <ImageUploadField
              label="Hero image URL"
              value={values.hero_image_url}
              onChange={(v) => setField('hero_image_url', v)}
            />
          </Card>
        </SlugAutoTitle>
      )}
    </FormShell>
  );
}

function SlugAutoTitle({
  values,
  setField,
  existing,
  children,
}: {
  values: FormValues;
  setField: <K extends keyof FormValues>(name: K, value: FormValues[K]) => void;
  existing: boolean;
  children: React.ReactNode;
}) {
  const [touchedSlug, setTouchedSlug] = useState(existing);
  useEffect(() => {
    if (!touchedSlug && !existing && values.title) {
      const auto = slugify(values.title, { lower: true, strict: true });
      if (auto !== values.slug) {
        setField('slug', auto);
      }
    }
  }, [values.title, touchedSlug, existing, values.slug, setField]);
  useEffect(() => {
    if (existing) return;
    if (values.slug && values.title && values.slug !== slugify(values.title, { lower: true, strict: true })) {
      setTouchedSlug(true);
    }
  }, [values.slug, values.title, existing]);
  return <>{children}</>;
}
