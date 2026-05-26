import { notFound } from 'next/navigation';
import { requireAdminPageSession } from '@/lib/adminSession';
import { getExclusiveContentById } from '@/lib/queries/admin/exclusiveContent';
import { ExclusiveContentForm } from '@/components/admin/forms/ExclusiveContentForm';
import { DeleteButton } from '@/components/admin/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function EditExclusiveContentPage({ params }: { params: { id: string } }) {
  await requireAdminPageSession();
  const c = await getExclusiveContentById(params.id);
  if (!c) notFound();
  return (
    <div>
      <ExclusiveContentForm existing={c} />
      <div className="mt-8 pt-6 border-t border-gray-200 max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-warm-gray mb-2">Danger zone</p>
        <DeleteButton resourcePath={`/api/admin/exclusive-content/${c.id}`} label="Delete this content" onDeletedHref="/admin/exclusive-content" />
      </div>
    </div>
  );
}
