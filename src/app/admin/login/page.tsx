import { redirect } from 'next/navigation';
import { getAdminSessionFromCookies } from '@/lib/adminSession';
import { Card } from '@/components/ui/Card';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const session = await getAdminSessionFromCookies();
  if (session) {
    redirect('/admin');
  }
  const next = typeof searchParams?.next === 'string' && searchParams.next.startsWith('/admin')
    ? searchParams.next
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl text-indigo">BHF Admin</h1>
          <p className="text-sm text-warm-gray mt-1">Sign in to manage the site</p>
        </div>
        <Card>
          <AdminLoginForm next={next} />
        </Card>
      </div>
    </div>
  );
}
