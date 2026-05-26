import { notFound } from 'next/navigation';
import { requireAdminPageSession } from '@/lib/adminSession';
import { getLeadershipById } from '@/lib/queries/admin/leadership';
import { LeadershipForm } from '@/components/admin/forms/LeadershipForm';
import { DeleteButton } from '@/components/admin/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function EditLeaderPage({ params }: { params: { id: string } }) {
  await requireAdminPageSession();
  const l = await getLeadershipById(params.id);
  if (!l) notFound();
  return (
    <div>
      <LeadershipForm existing={l} />
      <div className="mt-8 pt-6 border-t border-gray-200 max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-warm-gray mb-2">Danger zone</p>
        <DeleteButton resourcePath={`/api/admin/leadership/${l.id}`} label="Delete this leader" onDeletedHref="/admin/leadership" />
      </div>
    </div>
  );
}
