'use client';

import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { FormShell } from '@/components/admin/FormShell';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import type { Leadership } from '@/types/db';

interface FormValues extends Record<string, unknown> {
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  linkedin_url: string;
  section: string;
  display_order: string;
  active: boolean;
}

function buildInitial(l?: Leadership): FormValues {
  return {
    name: l?.name ?? '',
    role: l?.role ?? '',
    bio: l?.bio ?? '',
    photo_url: l?.photo_url ?? '',
    linkedin_url: l?.linkedin_url ?? '',
    section: l?.section ?? 'board',
    display_order: l?.display_order != null ? String(l.display_order) : '0',
    active: l?.active ?? true,
  };
}

export function LeadershipForm({ existing }: { existing?: Leadership }) {
  const initial = buildInitial(existing);
  const endpoint = existing
    ? { method: 'PATCH' as const, path: `/api/admin/leadership/${existing.id}` }
    : { method: 'POST' as const, path: '/api/admin/leadership' };
  return (
    <FormShell<FormValues>
      resource="leadership"
      recordId={existing?.id}
      initialValues={initial}
      endpoint={endpoint}
      redirectTo="/admin/leadership"
      title={existing ? 'Edit leader' : 'Add leader'}
      buildPayload={(v) => ({
        name: v.name.trim(),
        role: v.role.trim(),
        bio: v.bio,
        photo_url: v.photo_url || null,
        linkedin_url: v.linkedin_url || null,
        section: v.section,
        display_order: Number(v.display_order) || 0,
        active: v.active,
      })}
    >
      {({ values, setField }) => (
        <Card className="space-y-4">
          <Input label="Name" required value={values.name} onChange={(e) => setField('name', e.target.value)} />
          <Input label="Role / title" required value={values.role} onChange={(e) => setField('role', e.target.value)} hint="e.g. President, Treasurer" />
          <Textarea
            label="Bio"
            required
            rows={5}
            value={values.bio}
            onChange={(e) => setField('bio', e.target.value)}
            hint="2-3 sentences. Plain text."
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Section" value={values.section} onChange={(e) => setField('section', e.target.value)}>
              <option value="founding">Founding</option>
              <option value="board">Board</option>
              <option value="working_group">Working group</option>
            </Select>
            <Input label="Display order" type="number" value={values.display_order} onChange={(e) => setField('display_order', e.target.value)} />
          </div>
          <Input label="LinkedIn URL" value={values.linkedin_url} onChange={(e) => setField('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/…" />
          <Checkbox label="Active (show publicly)" checked={values.active} onChange={(e) => setField('active', e.target.checked)} />
          <ImageUploadField label="Photo URL" value={values.photo_url} onChange={(v) => setField('photo_url', v)} />
        </Card>
      )}
    </FormShell>
  );
}
