'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch, uploadFile } from '@/lib/adminClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { GalleryPhoto } from '@/types/db';

interface Props {
  categoryId: string;
  initialPhotos: GalleryPhoto[];
}

export function GalleryPhotosManager({ categoryId, initialPhotos }: Props) {
  const router = useRouter();
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const { url } = await uploadFile(file);
        const res = await adminFetch('/api/admin/gallery-photos', {
          method: 'POST',
          json: { category_id: categoryId, file_url: url, caption: '' },
        });
        if (!res.ok) {
          setError('Some uploads failed to save.');
        } else {
          const data = await res.json();
          if (data?.photo) setPhotos((p) => [...p, data.photo]);
        }
      }
    } catch (err) {
      setError((err as Error).message || 'Upload failed.');
    }
    setUploading(false);
    router.refresh();
  }

  async function savePhoto(p: GalleryPhoto, partial: Partial<GalleryPhoto>) {
    setError(null);
    const res = await adminFetch(`/api/admin/gallery-photos/${p.id}`, {
      method: 'PATCH',
      json: partial,
    });
    if (!res.ok) {
      setError('Save failed.');
      return;
    }
    setPhotos((arr) => arr.map((x) => (x.id === p.id ? { ...x, ...partial } : x)));
  }

  async function deletePhoto(id: string) {
    if (!confirm('Delete this photo?')) return;
    const res = await adminFetch(`/api/admin/gallery-photos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Delete failed.');
      return;
    }
    setPhotos((arr) => arr.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-lg text-indigo mb-2">Bulk upload</h3>
        <p className="text-sm text-warm-gray mb-3">
          Drop or pick multiple image files. Each upload is added to this category with a blank caption that you can edit below.
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onUploadFiles(e.target.files)}
          disabled={uploading}
          className="text-sm text-warm-gray file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-cream file:text-indigo hover:file:bg-saffron/20"
        />
        {uploading && <p className="mt-2 text-sm text-warm-gray">Uploading…</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </Card>

      {photos.length === 0 ? (
        <Card>
          <p className="text-sm text-warm-gray">No photos in this category yet.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {photos.map((p) => (
            <Card key={p.id} className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.file_url} alt={p.caption ?? ''} className="w-full h-48 object-cover rounded-md border border-gray-200" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <Input
                label="Caption"
                defaultValue={p.caption ?? ''}
                onBlur={(e) => savePhoto(p, { caption: e.target.value })}
              />
              <Input
                label="Photographer credit"
                defaultValue={p.photographer_credit ?? ''}
                onBlur={(e) => savePhoto(p, { photographer_credit: e.target.value })}
              />
              <Input
                label="Display order"
                type="number"
                defaultValue={String(p.display_order)}
                onBlur={(e) => savePhoto(p, { display_order: Number(e.target.value) || 0 })}
              />
              <div className="flex justify-end">
                <Button type="button" variant="ghost" onClick={() => deletePhoto(p.id)} className="text-red-700">
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
