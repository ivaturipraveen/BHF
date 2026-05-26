'use client';

import slugify from 'slugify';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { FormShell } from '@/components/admin/FormShell';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { MarkdownField } from '@/components/admin/MarkdownField';
import type { BlogPost } from '@/types/db';

interface FormValues extends Record<string, unknown> {
  title: string;
  slug: string;
  excerpt: string;
  body_md: string;
  hero_image_url: string;
  tags: string;
  featured: boolean;
  status: string;
}

function buildInitial(p?: BlogPost): FormValues {
  return {
    title: p?.title ?? '',
    slug: p?.slug ?? '',
    excerpt: p?.excerpt ?? '',
    body_md: p?.body_md ?? '',
    hero_image_url: p?.hero_image_url ?? '',
    tags: (p?.tags ?? []).join(', '),
    featured: p?.featured ?? false,
    status: p?.status ?? 'draft',
  };
}

export function BlogPostForm({ existing }: { existing?: BlogPost }) {
  const initial = buildInitial(existing);
  const endpoint = existing
    ? { method: 'PATCH' as const, path: `/api/admin/blog-posts/${existing.id}` }
    : { method: 'POST' as const, path: '/api/admin/blog-posts' };
  return (
    <FormShell<FormValues>
      resource="blog-posts"
      recordId={existing?.id}
      initialValues={initial}
      endpoint={endpoint}
      redirectTo="/admin/blog-posts"
      title={existing ? 'Edit blog post' : 'New blog post'}
      buildPayload={(v) => {
        const payload: Record<string, unknown> = {
          title: v.title.trim(),
          slug: v.slug.trim() || slugify(v.title, { lower: true, strict: true }),
          excerpt: v.excerpt,
          body_md: v.body_md,
          hero_image_url: v.hero_image_url || null,
          tags: v.tags ? v.tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
          featured: v.featured,
          status: v.status,
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
              value={values.slug}
              onChange={(e) => setField('slug', e.target.value)}
              disabled={!!existing}
              hint="URL identifier."
            />
            <Textarea label="Excerpt" rows={3} required value={values.excerpt} onChange={(e) => setField('excerpt', e.target.value)} hint="Short summary shown on listings (1-2 sentences)." />
            <MarkdownField label="Body (Markdown)" value={values.body_md} onChange={(v) => setField('body_md', v)} required rows={14} />
          </Card>
          <Card className="space-y-4">
            <h3 className="font-display text-lg text-indigo">Publishing</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Select label="Status" value={values.status} onChange={(e) => setField('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
              <Input label="Tags (comma-separated)" value={values.tags} onChange={(e) => setField('tags', e.target.value)} hint="e.g. festivals, youth, seva" />
            </div>
            <Checkbox label="Featured (pinned at the top of the blog list)" checked={values.featured} onChange={(e) => setField('featured', e.target.checked)} />
            {values.status === 'published' && (
              <p className="text-xs text-warm-gray bg-cream rounded p-3">
                Note: publishing will set the public published_at to now.
              </p>
            )}
            <ImageUploadField label="Hero image URL" value={values.hero_image_url} onChange={(v) => setField('hero_image_url', v)} />
          </Card>
        </>
      )}
    </FormShell>
  );
}
