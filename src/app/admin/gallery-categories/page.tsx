import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import {
  listAllGalleryCategories,
  countPhotosInCategory,
} from '@/lib/queries/admin/galleryCategories';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { AdminSearchForm } from '@/components/admin/AdminSearchForm';
import { AdminTable } from '@/components/admin/AdminTable';
import { DeleteButton } from '@/components/admin/DeleteButton';

export const dynamic = 'force-dynamic';

interface Row {
  id: string;
  title: string;
  slug: string;
  display_order: number;
  photo_count: number;
}

export default async function AdminGalleryCategoriesPage({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  await requireAdminPageSession();
  const cats = await listAllGalleryCategories();
  const search = (searchParams?.search ?? '').toLowerCase().trim();
  const filtered = search
    ? cats.filter((c) => c.title.toLowerCase().includes(search) || c.slug.toLowerCase().includes(search))
    : cats;
  const counts = await Promise.all(filtered.map((c) => countPhotosInCategory(c.id)));
  const rows: Row[] = filtered.map((c, i) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    display_order: c.display_order,
    photo_count: counts[i] ?? 0,
  }));

  return (
    <div>
      <AdminListHeader
        title="Gallery categories"
        description="Group photos into themed albums (festivals, classes, charity events…)."
        newHref="/admin/gallery-categories/new"
        newLabel="New category"
      />
      <div className="mb-4">
        <AdminSearchForm action="/admin/gallery-categories" defaultValue={search} placeholder="Search title or slug…" clearHref="/admin/gallery-categories" />
      </div>
      <AdminTable<Row>
        rows={rows}
        rowKey={(r) => r.id}
        columns={[
          { header: 'Title', cell: (r) => <Link href={`/admin/gallery-categories/${r.id}`} className="font-medium text-indigo hover:text-saffron">{r.title}</Link> },
          { header: 'Slug', cell: (r) => <span className="text-xs text-warm-gray">{r.slug}</span> },
          { header: 'Photos', cell: (r) => r.photo_count },
          { header: 'Order', cell: (r) => r.display_order },
          { header: 'Actions', cell: (r) => (
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/admin/gallery-categories/${r.id}/photos`} className="text-xs text-saffron hover:text-amber-burnt px-2 py-2 min-h-[36px] inline-flex items-center">Manage photos →</Link>
              <Link href={`/admin/gallery-categories/${r.id}`} className="text-xs text-indigo hover:text-saffron px-2 py-2 min-h-[36px] inline-flex items-center">Edit</Link>
              <DeleteButton resourcePath={`/api/admin/gallery-categories/${r.id}`} />
            </div>
          ) },
        ]}
      />
    </div>
  );
}
