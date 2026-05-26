import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import { getGalleryCategoryById } from '@/lib/queries/admin/galleryCategories';
import { listGalleryPhotos } from '@/lib/queries/admin/galleryPhotos';
import { GalleryPhotosManager } from '@/components/admin/GalleryPhotosManager';

export const dynamic = 'force-dynamic';

export default async function ManagePhotosPage({ params }: { params: { id: string } }) {
  await requireAdminPageSession();
  const cat = await getGalleryCategoryById(params.id);
  if (!cat) notFound();
  const photos = await listGalleryPhotos(cat.id);
  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/gallery-categories" className="text-xs text-warm-gray hover:text-indigo">← Back to categories</Link>
        <h1 className="font-display text-3xl text-indigo mt-1">Photos in “{cat.title}”</h1>
        <p className="text-sm text-warm-gray mt-1">Upload, caption, credit, and reorder photos. Changes save when you click out of a field.</p>
      </div>
      <GalleryPhotosManager categoryId={cat.id} initialPhotos={photos} />
    </div>
  );
}
