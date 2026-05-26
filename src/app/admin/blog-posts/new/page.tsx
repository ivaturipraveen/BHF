import { requireAdminPageSession } from '@/lib/adminSession';
import { BlogPostForm } from '@/components/admin/forms/BlogPostForm';

export const dynamic = 'force-dynamic';

export default async function NewBlogPostPage() {
  await requireAdminPageSession();
  return <BlogPostForm />;
}
