'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import slugify from 'slugify';
import { FormShell } from '@/components/admin/FormShell';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { MarkdownField } from '@/components/admin/MarkdownField';
import type { Program } from '@/types/db';

interface FormValues extends Record<string, unknown> {
  title: string;
  slug: string;
  category: string;
  frequency: string;
  short_description: string;
  description_md: string;
  who_for: string;
  schedule_md: string;
  cost_md: string;
  location: string;
  is_youth: boolean;
  min_age_years: string;
  max_age_years: string;
  hero_image_url: string;
  status: string;
  featured: boolean;
  display_order: string;
}

function buildInitial(p?: Program): FormValues {
  return {
    title: p?.title ?? '',
    slug: p?.slug ?? '',
    category: p?.category ?? 'cultural',
    frequency: p?.frequency ?? 'rolling',
    short_description: p?.short_description ?? '',
    description_md: p?.description_md ?? '',
    who_for: p?.who_for ?? '',
    schedule_md: p?.schedule_md ?? '',
    cost_md: p?.cost_md ?? '',
    location: p?.location ?? '',
    is_youth: p?.is_youth ?? false,
    min_age_years: p?.min_age_years != null ? String(p.min_age_years) : '',
    max_age_years: p?.max_age_years != null ? String(p.max_age_years) : '',
    hero_image_url: p?.hero_image_url ?? '',
    status: p?.status ?? 'draft',
    featured: p?.featured ?? false,
    display_order: p?.display_order != null ? String(p.display_order) : '0',
  };
}

export function ProgramForm({ existing }: { existing?: Program }) {
  const initial = buildInitial(existing);
  const endpoint = existing
    ? { method: 'PATCH' as const, path: `/api/admin/programs/${existing.id}` }
    : { method: 'POST' as const, path: '/api/admin/programs' };
  return (
    <FormShell<FormValues>
      resource="programs"
      recordId={existing?.id}
      initialValues={initial}
      endpoint={endpoint}
      redirectTo="/admin/programs"
      title={existing ? 'Edit program' : 'New program'}
      buildPayload={(v) => {
        const payload: Record<string, unknown> = {
          title: v.title.trim(),
          slug: v.slug.trim() || slugify(v.title, { lower: true, strict: true }),
          category: v.category,
          frequency: v.frequency,
          short_description: v.short_description,
          description_md: v.description_md,
          who_for: v.who_for || null,
          schedule_md: v.schedule_md || null,
          cost_md: v.cost_md || null,
          location: v.location || null,
          is_youth: v.is_youth,
          min_age_years: v.min_age_years ? Number(v.min_age_years) : null,
          max_age_years: v.max_age_years ? Number(v.max_age_years) : null,
          hero_image_url: v.hero_image_url || null,
          status: v.status,
          featured: v.featured,
          display_order: Number(v.display_order) || 0,
        };
        if (existing) delete payload.slug;
        return payload;
      }}
    >
      {({ values, setField }) => (
        <>
          <Card className="space-y-4">
            <Input label="Title" required value={values.title} onChange={(e) => setField('title', e.target.value)} />
            <Input
              label="Slug"
              hint="URL identifier. Lower-case, dashes only."
              value={values.slug}
              onChange={(e) => setField('slug', e.target.value)}
              disabled={!!existing}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Select label="Category" value={values.category} onChange={(e) => setField('category', e.target.value)}>
                <option value="cultural">Cultural</option>
                <option value="educational">Educational</option>
                <option value="charitable">Charitable</option>
                <option value="wellness">Wellness</option>
                <option value="youth">Youth</option>
              </Select>
              <Select label="Frequency" value={values.frequency} onChange={(e) => setField('frequency', e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
                <option value="rolling">Rolling</option>
              </Select>
            </div>
            <Textarea
              label="Short description"
              rows={2}
              required
              value={values.short_description}
              onChange={(e) => setField('short_description', e.target.value)}
            />
            <MarkdownField
              label="Description (Markdown)"
              value={values.description_md}
              onChange={(v) => setField('description_md', v)}
              required
            />
          </Card>

          <Card className="space-y-4">
            <h3 className="font-display text-lg text-indigo">Details</h3>
            <Textarea label="Who is this for?" rows={2} value={values.who_for} onChange={(e) => setField('who_for', e.target.value)} />
            <MarkdownField label="Schedule (Markdown)" value={values.schedule_md} onChange={(v) => setField('schedule_md', v)} rows={4} />
            <MarkdownField label="Cost (Markdown)" value={values.cost_md} onChange={(v) => setField('cost_md', v)} rows={3} />
            <Input label="Location" value={values.location} onChange={(e) => setField('location', e.target.value)} />
          </Card>

          <Card className="space-y-4">
            <h3 className="font-display text-lg text-indigo">Youth & ages</h3>
            <Checkbox label="This is a youth program" checked={values.is_youth} onChange={(e) => setField('is_youth', e.target.checked)} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Minimum age (years)" type="number" min={0} value={values.min_age_years} onChange={(e) => setField('min_age_years', e.target.value)} />
              <Input label="Maximum age (years)" type="number" min={0} value={values.max_age_years} onChange={(e) => setField('max_age_years', e.target.value)} />
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-display text-lg text-indigo">Display</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Select label="Status" value={values.status} onChange={(e) => setField('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
              <Input label="Display order" type="number" value={values.display_order} onChange={(e) => setField('display_order', e.target.value)} />
            </div>
            <Checkbox label="Featured (highlights on home/programs page)" checked={values.featured} onChange={(e) => setField('featured', e.target.checked)} />
            <ImageUploadField label="Hero image URL" value={values.hero_image_url} onChange={(v) => setField('hero_image_url', v)} />
          </Card>
        </>
      )}
    </FormShell>
  );
}
