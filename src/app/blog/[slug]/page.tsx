import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Container } from "@/components/ui/Container";
import { BlogCard } from "@/components/cards/BlogCard";
import { Markdown } from "@/components/ui/Markdown";
import { getBlogPostBySlug, listBlogPosts } from "@/lib/queries/blog";
import { jsonLdString } from "@/lib/jsonLd";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) return { title: "Post not found — BHF" };
  return {
    title: `${post.title} — BHF`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.published_at?.toString(),
      images: post.hero_image_url
        ? [{ url: post.hero_image_url, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) notFound();
  const all = await listBlogPosts(8);
  const related = all.filter((p) => p.id !== post.id).slice(0, 3);
  const published = post.published_at ? new Date(post.published_at) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: published?.toISOString(),
    description: post.excerpt,
    image: post.hero_image_url ? [post.hero_image_url] : undefined,
    author: {
      "@type": "Organization",
      name: "Bharatiya Heritage Foundation",
    },
    publisher: {
      "@type": "Organization",
      name: "Bharatiya Heritage Foundation",
      url: "https://bhfcommunity.org",
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      {post.hero_image_url ? (
        <div className="relative aspect-[16/7] w-full bg-cream">
          <Image
            src={post.hero_image_url}
            alt={post.title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
      ) : null}

      <section className="bg-white py-12">
        <Container>
          <Link
            href="/blog"
            className="text-saffron hover:text-amber-burnt text-sm font-medium"
          >
            ← Back to all posts
          </Link>

          <article className="mt-6 max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl text-indigo mb-4">
              {post.title}
            </h1>
            {published ? (
              <p className="text-sm uppercase tracking-wider text-warm-gray mb-8">
                {format(published, "MMMM d, yyyy")}
              </p>
            ) : null}
            <p className="text-lg text-warm-gray leading-relaxed mb-8">
              {post.excerpt}
            </p>
            <Markdown content={post.body_md} />
          </article>
        </Container>
      </section>

      {related.length > 0 ? (
        <section className="bg-cream py-16">
          <Container>
            <h2 className="font-display text-2xl text-indigo mb-8">
              More from the blog
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </main>
  );
}
