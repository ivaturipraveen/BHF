'use client';

import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FormShell } from '@/components/admin/FormShell';
import { MarkdownField } from '@/components/admin/MarkdownField';
import type { Page } from '@/types/db';

interface FormValues extends Record<string, unknown> {
  title: string;
  body_md: string;
  meta_title: string;
  meta_description: string;
}

function buildInitial(p: Page): FormValues {
  return {
    title: p.title ?? '',
    body_md: p.body_md ?? '',
    meta_title: p.meta_title ?? '',
    meta_description: p.meta_description ?? '',
  };
}

export function PageForm({ existing }: { existing: Page }) {
  const initial = buildInitial(existing);
  return (
    <FormShell<FormValues>
      resource="pages"
      recordId={existing.id}
      initialValues={initial}
      endpoint={{ method: 'PATCH', path: `/api/admin/pages/${existing.slug}` }}
      redirectTo="/admin/pages"
      title={`Edit page: ${existing.slug}`}
      buildPayload={(v) => ({
        title: v.title || null,
        body_md: v.body_md || null,
        meta_title: v.meta_title || null,
        meta_description: v.meta_description || null,
      })}
    >
      {({ values, setField }) => (
        <Card className="space-y-4">
          <Input label="Title" value={values.title} onChange={(e) => setField('title', e.target.value)} />
          <MarkdownField label="Body (Markdown)" value={values.body_md} onChange={(v) => setField('body_md', v)} rows={20} />
          <Input label="Meta title (SEO)" value={values.meta_title} onChange={(e) => setField('meta_title', e.target.value)} />
          <Input label="Meta description (SEO)" value={values.meta_description} onChange={(e) => setField('meta_description', e.target.value)} />
        </Card>
      )}
    </FormShell>
  );
}
