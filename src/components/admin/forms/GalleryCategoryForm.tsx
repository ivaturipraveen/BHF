'use client';

import slugify from 'slugify';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { FormShell } from '@/components/admin/FormShell';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import type { GalleryCategory } from '@/types/db';

interface FormValues extends Record<string, unknown> {
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  display_order: string;
}

function buildInitial(g?: GalleryCategory): FormValues {
  return {
    title: g?.title ?? '',
    slug: g?.slug ?? '',
    description: g?.description ?? '',
    cover_image_url: g?.cover_image_url ?? '',
    display_order: g?.display_order != null ? String(g.display_order) : '0',
  };
}

export function GalleryCategoryForm({ existing }: { existing?: GalleryCategory }) {
  const initial = buildInitial(existing);
  const endpoint = existing
    ? { method: 'PATCH' as const, path: `/api/admin/gallery-categories/${existing.id}` }
    : { method: 'POST' as const, path: '/api/admin/gallery-categories' };
  return (
    <FormShell<FormValues>
      resource="gallery-categories"
      recordId={existing?.id}
      initialValues={initial}
      endpoint={endpoint}
      redirectTo="/admin/gallery-categories"
      title={existing ? 'Edit gallery category' : 'New gallery category'}
      buildPayload={(v) => {
        const payload: Record<string, unknown> = {
          title: v.title.trim(),
          slug: v.slug.trim() || slugify(v.title, { lower: true, strict: true }),
          description: v.description || null,
          cover_image_url: v.cover_image_url || null,
          display_order: Number(v.display_order) || 0,
        };
        if (existing) delete payload.slug;
        return payload;
      }}
    >
      {({ values, setField }) => (
        <Card className="space-y-4">
          <Input label="Title" required value={values.title} onChange={(e) => setField('title', e.target.value)} />
          <Input
            label="Slug"
            value={values.slug}
            onChange={(e) => setField('slug', e.target.value)}
            disabled={!!existing}
          />
          <Textarea label="Description" value={values.description} onChange={(e) => setField('description', e.target.value)} />
          <Input label="Display order" type="number" value={values.display_order} onChange={(e) => setField('display_order', e.target.value)} />
          <ImageUploadField label="Cover image URL" value={values.cover_image_url} onChange={(v) => setField('cover_image_url', v)} />
        </Card>
      )}
    </FormShell>
  );
}
