import { requireAdminPageSession } from '@/lib/adminSession';
import { GalleryCategoryForm } from '@/components/admin/forms/GalleryCategoryForm';

export const dynamic = 'force-dynamic';

export default async function NewGalleryCategoryPage() {
  await requireAdminPageSession();
  return <GalleryCategoryForm />;
}
