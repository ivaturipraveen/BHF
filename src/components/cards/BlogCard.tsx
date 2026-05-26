import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { BlogPost } from "@/types/db";

export interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

export function BlogCard({ post, className }: BlogCardProps) {
  const published = post.published_at ? new Date(post.published_at) : null;
  return (
    <Card
      variant="default"
      className={cn(
        "flex flex-col p-0 overflow-hidden transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-video w-full bg-cream">
        {post.hero_image_url ? (
          <Image
            src={post.hero_image_url}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-3xl text-saffron/40">ॐ</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        {published ? (
          <p className="text-xs uppercase tracking-wider text-warm-gray">
            {format(published, "MMM d, yyyy")}
          </p>
        ) : null}
        <h3 className="font-display text-lg text-indigo">
          <Link href={`/blog/${post.slug}`} className="hover:text-saffron">
            {post.title}
          </Link>
        </h3>
        <p className="text-sm text-warm-gray leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-auto pt-2">
          <Link
            href={`/blog/${post.slug}`}
            className="text-saffron font-medium hover:text-amber-burnt"
          >
            Read more →
          </Link>
        </div>
      </div>
    </Card>
  );
}
