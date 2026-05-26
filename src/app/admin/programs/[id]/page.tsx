import { notFound } from 'next/navigation';
import { requireAdminPageSession } from '@/lib/adminSession';
import { getProgramById } from '@/lib/queries/admin/programs';
import { ProgramForm } from '@/components/admin/forms/ProgramForm';
import { DeleteButton } from '@/components/admin/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function EditProgramPage({ params }: { params: { id: string } }) {
  await requireAdminPageSession();
  const program = await getProgramById(params.id);
  if (!program) notFound();
  return (
    <div>
      <ProgramForm existing={program} />
      <div className="mt-8 pt-6 border-t border-gray-200 max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-warm-gray mb-2">Danger zone</p>
        <DeleteButton
          resourcePath={`/api/admin/programs/${program.id}`}
          label="Delete this program"
          onDeletedHref="/admin/programs"
        />
      </div>
    </div>
  );
}
