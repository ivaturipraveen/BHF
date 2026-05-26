import { requireAdminPageSession } from '@/lib/adminSession';
import { getHomepageConfig } from '@/lib/queries/admin/homepageConfig';
import { listAllEvents } from '@/lib/queries/admin/events';
import { listAllPrograms } from '@/lib/queries/admin/programs';
import { HomepageForm } from '@/components/admin/forms/HomepageForm';

export const dynamic = 'force-dynamic';

export default async function AdminHomepagePage() {
  await requireAdminPageSession();
  const [config, events, programs] = await Promise.all([
    getHomepageConfig(),
    listAllEvents(),
    listAllPrograms(),
  ]);
  return <HomepageForm existing={config} events={events} programs={programs} />;
}
