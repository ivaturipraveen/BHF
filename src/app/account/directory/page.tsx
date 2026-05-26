import Link from "next/link";
import { listDirectoryMembers } from "@/lib/queries/members";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max).trimEnd()}…`;
}

interface DirectoryPageProps {
  searchParams?: {
    search?: string | string[];
    page?: string | string[];
  };
}

function asString(v: string | string[] | undefined): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}

const PAGE_SIZE = 12;

export default async function DirectoryPage({
  searchParams,
}: DirectoryPageProps) {
  const search = asString(searchParams?.search).trim();
  const pageRaw = asString(searchParams?.page);
  const page = Math.max(1, Number(pageRaw) || 1);

  const result = await listDirectoryMembers({
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const buildQuery = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(p));
    return `?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl text-indigo">Member directory</h1>
        <p className="mt-2 text-warm-gray">
          Only members who opt in appear here.
        </p>
        <p className="mt-1 text-sm text-warm-gray">
          Don&apos;t see yourself listed? Enable Directory opt-in under{" "}
          <Link
            href="/account/profile"
            className="text-saffron hover:text-amber-burnt font-medium"
          >
            Profile settings
          </Link>
          .
        </p>
      </header>

      <form
        method="get"
        className="flex flex-col sm:flex-row gap-3 sticky top-20 z-10 bg-cream py-2"
      >
        <label htmlFor="dir-search" className="sr-only">
          Search members
        </label>
        <input
          id="dir-search"
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search by name or city"
          className="h-11 flex-1 rounded-md border border-gray-300 bg-white px-4 text-base text-indigo placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-saffron focus:border-saffron"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-white hover:bg-amber-burnt"
        >
          Search
        </button>
      </form>

      {result.rows.length === 0 ? (
        <Card>
          <p className="text-warm-gray">
            No members found{search ? ` for "${search}"` : ""}. Try a different
            search.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {result.rows.map((m) => (
            <Card key={m.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden
                  className="h-12 w-12 rounded-full bg-saffron text-white font-semibold flex items-center justify-center"
                >
                  {initials(m.first_name, m.last_name)}
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg text-indigo truncate">
                    {m.first_name} {m.last_name}
                  </p>
                  {m.city ? (
                    <p className="text-sm text-warm-gray truncate">{m.city}</p>
                  ) : null}
                </div>
              </div>
              {m.interests && m.interests.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {m.interests.map((i) => (
                    <Badge key={i} variant="indigo">
                      {i.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              ) : null}
              {m.bio ? (
                <p className="text-sm text-warm-gray">
                  {truncate(m.bio, 100)}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      {result.total > result.pageSize ? (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between border-t border-gray-200 pt-4"
        >
          {page > 1 ? (
            <Link
              href={`/account/directory${buildQuery(page - 1)}`}
              className="text-sm font-medium text-indigo hover:text-saffron"
            >
              ← Previous
            </Link>
          ) : (
            <span className="text-sm text-warm-gray/60">← Previous</span>
          )}
          <span className="text-sm text-warm-gray">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/account/directory${buildQuery(page + 1)}`}
              className="text-sm font-medium text-indigo hover:text-saffron"
            >
              Next →
            </Link>
          ) : (
            <span className="text-sm text-warm-gray/60">Next →</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
