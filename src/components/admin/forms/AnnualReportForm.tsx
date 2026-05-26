'use client';

import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FormShell } from '@/components/admin/FormShell';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import type { AnnualReport } from '@/types/db';

interface FormValues extends Record<string, unknown> {
  year: string;
  title: string;
  pdf_url: string;
  cover_image_url: string;
  display_order: string;
}

function buildInitial(r?: AnnualReport): FormValues {
  return {
    year: r?.year != null ? String(r.year) : String(new Date().getFullYear()),
    title: r?.title ?? '',
    pdf_url: r?.pdf_url ?? '',
    cover_image_url: r?.cover_image_url ?? '',
    display_order: r?.display_order != null ? String(r.display_order) : '0',
  };
}

export function AnnualReportForm({ existing }: { existing?: AnnualReport }) {
  const initial = buildInitial(existing);
  const endpoint = existing
    ? { method: 'PATCH' as const, path: `/api/admin/annual-reports/${existing.id}` }
    : { method: 'POST' as const, path: '/api/admin/annual-reports' };
  return (
    <FormShell<FormValues>
      resource="annual-reports"
      recordId={existing?.id}
      initialValues={initial}
      endpoint={endpoint}
      redirectTo="/admin/annual-reports"
      title={existing ? 'Edit annual report' : 'New annual report'}
      buildPayload={(v) => ({
        year: Number(v.year),
        title: v.title || null,
        pdf_url: v.pdf_url,
        cover_image_url: v.cover_image_url || null,
        display_order: Number(v.display_order) || 0,
      })}
    >
      {({ values, setField }) => (
        <Card className="space-y-4">
          <Input label="Year" type="number" required value={values.year} onChange={(e) => setField('year', e.target.value)} />
          <Input label="Title" value={values.title} onChange={(e) => setField('title', e.target.value)} />
          <Input label="Display order" type="number" value={values.display_order} onChange={(e) => setField('display_order', e.target.value)} />
          <ImageUploadField label="PDF URL" value={values.pdf_url} onChange={(v) => setField('pdf_url', v)} accept="application/pdf" hint="Required. PDF file." />
          <ImageUploadField label="Cover image URL" value={values.cover_image_url} onChange={(v) => setField('cover_image_url', v)} />
        </Card>
      )}
    </FormShell>
  );
}
