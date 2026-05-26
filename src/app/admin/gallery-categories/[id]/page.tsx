import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import { getGalleryCategoryById } from '@/lib/queries/admin/galleryCategories';
import { GalleryCategoryForm } from '@/components/admin/forms/GalleryCategoryForm';
import { DeleteButton } from '@/components/admin/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function EditGalleryCategoryPage({ params }: { params: { id: string } }) {
  await requireAdminPageSession();
  const cat = await getGalleryCategoryById(params.id);
  if (!cat) notFound();
  return (
    <div>
      <GalleryCategoryForm existing={cat} />
      <div className="mt-6 max-w-3xl">
        <Link href={`/admin/gallery-categories/${cat.id}/photos`} className="text-sm text-saffron hover:text-amber-burnt underline">
          Manage photos in this category →
        </Link>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-200 max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-warm-gray mb-2">Danger zone</p>
        <DeleteButton
          resourcePath={`/api/admin/gallery-categories/${cat.id}`}
          label="Delete this category"
          onDeletedHref="/admin/gallery-categories"
        />
      </div>
    </div>
  );
}
