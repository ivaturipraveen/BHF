import { notFound } from 'next/navigation';
import { requireAdminPageSession } from '@/lib/adminSession';
import { getPageById } from '@/lib/queries/admin/pages';
import { PageForm } from '@/components/admin/forms/PageForm';

export const dynamic = 'force-dynamic';

export default async function EditPagePage({ params }: { params: { id: string } }) {
  await requireAdminPageSession();
  const page = await getPageById(params.id);
  if (!page) notFound();
  return <PageForm existing={page} />;
}
