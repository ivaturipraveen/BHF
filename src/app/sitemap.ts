import type { MetadataRoute } from "next";
import {
  listUpcomingEvents,
  listPastEvents,
} from "@/lib/queries/events";
import { listPrograms } from "@/lib/queries/programs";
import { listGalleryCategories } from "@/lib/queries/gallery";
import { listBlogPosts } from "@/lib/queries/blog";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "/",
    "/about",
    "/programs",
    "/events",
    "/gallery",
    "/leadership",
    "/blog",
    "/get-involved",
    "/contact",
    "/donate",
    "/press",
    "/annual-reports",
    "/privacy",
    "/terms",
  ];

  const [upcoming, past, programs, galleries, posts] = await Promise.all([
    listUpcomingEvents().catch(() => []),
    listPastEvents().catch(() => []),
    listPrograms().catch(() => []),
    listGalleryCategories().catch(() => []),
    listBlogPosts().catch(() => []),
  ]);

  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "/" ? 1.0 : 0.7,
  }));

  for (const e of [...upcoming, ...past]) {
    entries.push({
      url: `${SITE_URL}/events/${e.slug}`,
      lastModified: new Date(e.updated_at),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }
  for (const p of programs) {
    entries.push({
      url: `${SITE_URL}/programs/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  for (const g of galleries) {
    entries.push({
      url: `${SITE_URL}/gallery/${g.slug}`,
      lastModified: new Date(g.created_at),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }
  for (const post of posts) {
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
