import Link from 'next/link';
import { requireAdminPageSession } from '@/lib/adminSession';
import { listAllBlogPosts } from '@/lib/queries/admin/blogPosts';
import { AdminListHeader } from '@/components/admin/AdminListHeader';
import { AdminSearchForm } from '@/components/admin/AdminSearchForm';
import { AdminTable } from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/Badge';
import { DeleteButton } from '@/components/admin/DeleteButton';
import type { BlogPost } from '@/types/db';

export const dynamic = 'force-dynamic';

function formatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString();
}

export default async function AdminBlogPostsPage({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  await requireAdminPageSession();
  const posts = await listAllBlogPosts();
  const search = (searchParams?.search ?? '').toLowerCase().trim();
  const filtered = search
    ? posts.filter((p) => p.title.toLowerCase().includes(search) || p.slug.toLowerCase().includes(search))
    : posts;

  return (
    <div>
      <AdminListHeader title="Blog posts" description="Stories, announcements, and community updates." newHref="/admin/blog-posts/new" newLabel="New post" />
      <div className="mb-4">
        <AdminSearchForm action="/admin/blog-posts" defaultValue={search} placeholder="Search title or slug…" clearHref="/admin/blog-posts" />
      </div>
      <AdminTable<BlogPost>
        rows={filtered}
        rowKey={(p) => p.id}
        columns={[
          { header: 'Title', cell: (p) => <Link href={`/admin/blog-posts/${p.id}`} className="font-medium text-indigo hover:text-saffron">{p.title}</Link> },
          { header: 'Status', cell: (p) => <Badge variant={p.status === 'published' ? 'indigo' : 'gray'}>{p.status}</Badge> },
          { header: 'Published', cell: (p) => formatDate(p.published_at) },
          { header: 'Featured', cell: (p) => p.featured ? 'Yes' : '—' },
          { header: 'Actions', cell: (p) => (
            <div className="flex items-center gap-2">
              <Link href={`/admin/blog-posts/${p.id}`} className="text-xs text-indigo hover:text-saffron px-2 py-2 min-h-[36px] inline-flex items-center">Edit</Link>
              <DeleteButton resourcePath={`/api/admin/blog-posts/${p.id}`} />
            </div>
          ) },
        ]}
      />
    </div>
  );
}
