import { notFound } from 'next/navigation';
import { requireAdminPageSession } from '@/lib/adminSession';
import { getBlogPostById } from '@/lib/queries/admin/blogPosts';
import { BlogPostForm } from '@/components/admin/forms/BlogPostForm';
import { DeleteButton } from '@/components/admin/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  await requireAdminPageSession();
  const post = await getBlogPostById(params.id);
  if (!post) notFound();
  return (
    <div>
      <BlogPostForm existing={post} />
      <div className="mt-8 pt-6 border-t border-gray-200 max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-warm-gray mb-2">Danger zone</p>
        <DeleteButton resourcePath={`/api/admin/blog-posts/${post.id}`} label="Delete this post" onDeletedHref="/admin/blog-posts" />
      </div>
    </div>
  );
}
