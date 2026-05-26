import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BlogCard } from "@/components/cards/BlogCard";
import { Markdown } from "@/components/ui/Markdown";
import { ShareButtons } from "@/components/blog/ShareButtons";
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

function estimateReadTimeMinutes(markdown: string): number {
  const words = markdown
    .replace(/[#*_>`-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
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
  const readTime = estimateReadTimeMinutes(post.body_md);
  const shareUrl = `https://bhfcommunity.org/blog/${post.slug}`;

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
        <div className="relative aspect-[16/9] w-full bg-cream">
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

      <section className="bg-white py-12 md:py-16">
        <Container>
          <Link
            href="/blog"
            className="text-saffron hover:text-amber-burnt text-sm font-medium"
          >
            ← Back to all posts
          </Link>

          <article className="mt-6 max-w-2xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl text-indigo mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-warm-gray mb-8">
              <span className="font-semibold text-indigo">
                Bharatiya Heritage Foundation
              </span>
              {published ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{format(published, "MMMM d, yyyy")}</span>
                </>
              ) : null}
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={14} className="text-saffron" />
                {readTime} min read
              </span>
            </div>
            <p className="text-lg text-warm-gray leading-relaxed mb-8 italic">
              {post.excerpt}
            </p>
            <div className="drop-cap">
              <Markdown content={post.body_md} />
            </div>

            <div className="mt-12 border-t border-gray-200 pt-8">
              <ShareButtons url={shareUrl} title={post.title} />
            </div>
          </article>
        </Container>
      </section>

      {related.length > 0 ? (
        <section className="bg-cream py-16">
          <Container>
            <h2 className="font-display text-2xl md:text-3xl text-indigo mb-8">
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
