import Link from "next/link";
import { listExclusiveContent } from "@/lib/queries/exclusiveContent";
import { Card } from "@/components/ui/Card";
import { LibraryGrid, type LibraryItem } from "@/components/LibraryGrid";

export const dynamic = "force-dynamic";

const CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "yoga", label: "Yoga" },
  { key: "vedic_chanting", label: "Vedic chanting" },
  { key: "bharatiyatha_lecture", label: "Bharatiyatha lectures" },
  { key: "festival_recording", label: "Festival recordings" },
  { key: "magazine", label: "Magazines" },
];

interface LibraryPageProps {
  searchParams?: { category?: string | string[] };
}

function asString(v: string | string[] | undefined): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const categoryRaw = asString(searchParams?.category) || "all";
  const validKeys = new Set(CATEGORIES.map((c) => c.key));
  const category = validKeys.has(categoryRaw) ? categoryRaw : "all";
  const filter = category === "all" ? undefined : category;

  const rows = await listExclusiveContent(filter);
  const items: LibraryItem[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    content_type: r.content_type,
    content_url: r.content_url,
    thumbnail_url: r.thumbnail_url,
    duration_seconds: r.duration_seconds,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl text-indigo">Content library</h1>
        <p className="mt-2 text-warm-gray">
          Member-exclusive videos, recordings, and publications from BHF.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = c.key === category;
          const href =
            c.key === "all"
              ? "/account/library"
              : `/account/library?category=${c.key}`;
          return (
            <Link
              key={c.key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-full bg-saffron text-white px-4 py-2 text-sm font-medium"
                  : "rounded-full bg-white border border-gray-200 text-warm-gray hover:text-indigo px-4 py-2 text-sm font-medium"
              }
            >
              {c.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <Card>
          <p className="text-warm-gray">No content yet — check back soon.</p>
        </Card>
      ) : (
        <LibraryGrid items={items} />
      )}
    </div>
  );
}
