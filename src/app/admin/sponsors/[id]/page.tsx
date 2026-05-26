import { notFound } from 'next/navigation';
import { requireAdminPageSession } from '@/lib/adminSession';
import { getSponsorById } from '@/lib/queries/admin/sponsors';
import { SponsorForm } from '@/components/admin/forms/SponsorForm';
import { DeleteButton } from '@/components/admin/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function EditSponsorPage({ params }: { params: { id: string } }) {
  await requireAdminPageSession();
  const s = await getSponsorById(params.id);
  if (!s) notFound();
  return (
    <div>
      <SponsorForm existing={s} />
      <div className="mt-8 pt-6 border-t border-gray-200 max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-warm-gray mb-2">Danger zone</p>
        <DeleteButton resourcePath={`/api/admin/sponsors/${s.id}`} label="Delete this sponsor" onDeletedHref="/admin/sponsors" />
      </div>
    </div>
  );
}
