'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { FormShell } from '@/components/admin/FormShell';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import type { Sponsor } from '@/types/db';

interface FormValues extends Record<string, unknown> {
  name: string;
  tier: string;
  logo_url: string;
  website_url: string;
  display_order: string;
  active: boolean;
}

function buildInitial(s?: Sponsor): FormValues {
  return {
    name: s?.name ?? '',
    tier: s?.tier ?? 'bronze',
    logo_url: s?.logo_url ?? '',
    website_url: s?.website_url ?? '',
    display_order: s?.display_order != null ? String(s.display_order) : '0',
    active: s?.active ?? true,
  };
}

export function SponsorForm({ existing }: { existing?: Sponsor }) {
  const initial = buildInitial(existing);
  const endpoint = existing
    ? { method: 'PATCH' as const, path: `/api/admin/sponsors/${existing.id}` }
    : { method: 'POST' as const, path: '/api/admin/sponsors' };
  return (
    <FormShell<FormValues>
      resource="sponsors"
      recordId={existing?.id}
      initialValues={initial}
      endpoint={endpoint}
      redirectTo="/admin/sponsors"
      title={existing ? 'Edit sponsor' : 'New sponsor'}
      buildPayload={(v) => ({
        name: v.name.trim(),
        tier: v.tier || null,
        logo_url: v.logo_url,
        website_url: v.website_url || null,
        display_order: Number(v.display_order) || 0,
        active: v.active,
      })}
    >
      {({ values, setField }) => (
        <Card className="space-y-4">
          <Input label="Name" required value={values.name} onChange={(e) => setField('name', e.target.value)} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Tier" value={values.tier} onChange={(e) => setField('tier', e.target.value)}>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
            </Select>
            <Input label="Display order" type="number" value={values.display_order} onChange={(e) => setField('display_order', e.target.value)} />
          </div>
          <Input label="Website URL" value={values.website_url} onChange={(e) => setField('website_url', e.target.value)} placeholder="https://…" />
          <Checkbox label="Active" checked={values.active} onChange={(e) => setField('active', e.target.checked)} />
          <ImageUploadField label="Logo URL" value={values.logo_url} onChange={(v) => setField('logo_url', v)} hint="Required." />
        </Card>
      )}
    </FormShell>
  );
}
