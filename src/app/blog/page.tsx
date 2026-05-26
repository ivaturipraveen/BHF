import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { BlogCard } from "@/components/cards/BlogCard";
import { listBlogPosts } from "@/lib/queries/blog";

export const revalidate = 60;

const description =
  "Stories, updates, and reflections from the Bharatiya Heritage Foundation community.";

export const metadata: Metadata = {
  title: "Blog & News — BHF",
  description,
  openGraph: { title: "Blog & News — BHF", description, type: "website" },
  twitter: {
    card: "summary_large_image",
    title: "Blog & News — BHF",
    description,
  },
};

export default async function BlogPage() {
  const posts = await listBlogPosts();

  return (
    <main>
      <section className="bg-white py-12 md:py-16">
        <Container>
          <p className="text-xs uppercase tracking-widest text-saffron">
            Blog
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-indigo mt-3 mb-4">
            Blog &amp; News
          </h1>
          <p className="text-warm-gray max-w-2xl text-lg leading-relaxed">
            Updates from our festivals, programs, and the broader BHF community.
          </p>
        </Container>
      </section>

      <section className="bg-white pb-16">
        <Container>
          {posts.length === 0 ? (
            <p className="text-warm-gray">
              No posts yet — our first stories are on the way.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
