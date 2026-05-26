'use client';

import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { FormShell } from '@/components/admin/FormShell';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import type { ExclusiveContent } from '@/types/db';

interface FormValues extends Record<string, unknown> {
  title: string;
  description: string;
  category: string;
  content_type: string;
  content_url: string;
  thumbnail_url: string;
  duration_seconds: string;
}

function buildInitial(c?: ExclusiveContent): FormValues {
  return {
    title: c?.title ?? '',
    description: c?.description ?? '',
    category: c?.category ?? 'other',
    content_type: c?.content_type ?? 'video',
    content_url: c?.content_url ?? '',
    thumbnail_url: c?.thumbnail_url ?? '',
    duration_seconds: c?.duration_seconds != null ? String(c.duration_seconds) : '',
  };
}

export function ExclusiveContentForm({ existing }: { existing?: ExclusiveContent }) {
  const initial = buildInitial(existing);
  const endpoint = existing
    ? { method: 'PATCH' as const, path: `/api/admin/exclusive-content/${existing.id}` }
    : { method: 'POST' as const, path: '/api/admin/exclusive-content' };
  return (
    <FormShell<FormValues>
      resource="exclusive-content"
      recordId={existing?.id}
      initialValues={initial}
      endpoint={endpoint}
      redirectTo="/admin/exclusive-content"
      title={existing ? 'Edit exclusive content' : 'New exclusive content'}
      buildPayload={(v) => ({
        title: v.title.trim(),
        description: v.description || null,
        category: v.category,
        content_type: v.content_type,
        content_url: v.content_url,
        thumbnail_url: v.thumbnail_url || null,
        duration_seconds: v.duration_seconds ? Number(v.duration_seconds) : null,
      })}
    >
      {({ values, setField }) => (
        <Card className="space-y-4">
          <Input label="Title" required value={values.title} onChange={(e) => setField('title', e.target.value)} />
          <Textarea label="Description" value={values.description} onChange={(e) => setField('description', e.target.value)} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Category" value={values.category} onChange={(e) => setField('category', e.target.value)}>
              <option value="yoga">Yoga</option>
              <option value="vedic_chanting">Vedic chanting</option>
              <option value="bharatiyatha_lecture">Bharatiyatha lecture</option>
              <option value="festival_recording">Festival recording</option>
              <option value="magazine">Magazine</option>
              <option value="other">Other</option>
            </Select>
            <Select label="Content type" value={values.content_type} onChange={(e) => setField('content_type', e.target.value)}>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="audio">Audio</option>
            </Select>
          </div>
          <Input label="Duration (seconds)" type="number" value={values.duration_seconds} onChange={(e) => setField('duration_seconds', e.target.value)} hint="Optional. For audio/video." />
          {values.content_type === 'pdf' ? (
            <ImageUploadField label="Content URL (PDF)" value={values.content_url} onChange={(v) => setField('content_url', v)} accept="application/pdf" hint="Required. Upload a PDF or paste a URL." />
          ) : (
            <Input label="Content URL" required value={values.content_url} onChange={(e) => setField('content_url', e.target.value)} hint="Direct URL or embed link." />
          )}
          <ImageUploadField label="Thumbnail URL" value={values.thumbnail_url} onChange={(v) => setField('thumbnail_url', v)} />
        </Card>
      )}
    </FormShell>
  );
}
