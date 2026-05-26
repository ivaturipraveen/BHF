import Link from "next/link";
import { redirect } from "next/navigation";
import { differenceInYears, format } from "date-fns";
import { getSessionFromCookies } from "@/lib/auth";
import {
  listMyChildren,
  listEnrollmentsForChild,
  type EnrollmentForChild,
} from "@/lib/queries/account";
import type { YouthChild } from "@/types/db";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { FlashBanner } from "@/components/account/FlashBanner";
import { DeleteChildButton } from "@/components/account/DeleteChildButton";

export const dynamic = "force-dynamic";

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function ageOf(dob: Date | string): number {
  return differenceInYears(new Date(), new Date(dob));
}

function statusBadgeVariant(
  status: string,
): "saffron" | "indigo" | "amber" | "gray" {
  if (status === "enrolled") return "saffron";
  if (status === "completed") return "indigo";
  if (status === "withdrawn") return "gray";
  return "gray";
}

export default async function ChildrenPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "member") {
    redirect("/login?next=/account/children");
  }

  const children = await listMyChildren(session.sub);
  const enrollmentsByChild = new Map<string, EnrollmentForChild[]>();
  await Promise.all(
    children.map(async (c) => {
      const list = await listEnrollmentsForChild(session.sub, c.id);
      enrollmentsByChild.set(c.id, list);
    }),
  );

  const showNotFound = searchParams?.error === "not_found";

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl md:text-3xl text-indigo">
          Children &amp; enrollments
        </h1>
        <p className="mt-2 text-warm-gray">
          Manage your children&apos;s profiles and youth program enrollments.
          All data is parent-managed and only visible to you.
        </p>
        <p className="mt-3 text-sm text-warm-gray bg-cream border border-saffron/30 rounded-lg p-3">
          BHF complies with COPPA. We never create accounts for children, and
          you can request export or deletion of your children&apos;s data at
          any time via{" "}
          <Link
            href="/account/profile"
            className="text-saffron hover:text-amber-burnt font-medium"
          >
            /account/profile
          </Link>
          .
        </p>
      </header>

      <FlashBanner storageKey="children-flash" />

      {showNotFound ? (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          We couldn&apos;t find that child profile.
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/account/children/new" variant="primary" size="md">
          Add a child
        </ButtonLink>
        {children.length > 0 ? (
          <ButtonLink
            href="/account/register-youth"
            variant="secondary"
            size="md"
          >
            Register for a program
          </ButtonLink>
        ) : null}
      </div>

      {children.length === 0 ? (
        <Card className="bg-cream border-saffron/30">
          <h2 className="font-display text-xl text-indigo">
            No children added yet
          </h2>
          <p className="mt-2 text-warm-gray">
            You haven&apos;t added any children yet. Add one to enroll them in
            our youth programs.
          </p>
          <div className="mt-4">
            <ButtonLink
              href="/account/children/new"
              variant="primary"
              size="md"
            >
              Add a child
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child: YouthChild) => {
            const enrollments = enrollmentsByChild.get(child.id) ?? [];
            const age = ageOf(child.date_of_birth);
            const visibleEnrollments = enrollments.slice(0, 3);
            const hasMore = enrollments.length > 3;
            return (
              <Card key={child.id} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden
                    className="h-12 w-12 rounded-full bg-saffron text-white font-semibold flex items-center justify-center text-base"
                  >
                    {initials(child.first_name, child.last_name)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-lg text-indigo truncate">
                      {child.first_name} {child.last_name}
                    </h2>
                    <p className="text-sm text-warm-gray">
                      {age} {age === 1 ? "year" : "years"} old
                    </p>
                    <p className="text-xs text-warm-gray/80">
                      Born {format(new Date(child.date_of_birth), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {(child.allergies || child.photo_permission) && (
                  <div className="flex flex-wrap gap-2">
                    {child.allergies ? (
                      <Badge variant="amber">Allergies on file</Badge>
                    ) : null}
                    {child.photo_permission ? (
                      <Badge variant="indigo">Photo permission</Badge>
                    ) : null}
                  </div>
                )}

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-saffron font-medium">
                    Enrollments
                  </h3>
                  {enrollments.length === 0 ? (
                    <p className="mt-2 text-sm text-warm-gray">
                      No enrollments yet.
                    </p>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-2">
                      {visibleEnrollments.map((en) => (
                        <li
                          key={en.id}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="text-indigo truncate">
                            {en.program_title}
                          </span>
                          <Badge variant={statusBadgeVariant(en.status)}>
                            {en.status}
                          </Badge>
                        </li>
                      ))}
                      {hasMore ? (
                        <li>
                          <Link
                            href={`/account/children/${child.id}#enrollments`}
                            className="text-xs text-saffron hover:text-amber-burnt font-medium"
                          >
                            See all →
                          </Link>
                        </li>
                      ) : null}
                    </ul>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/account/children/${child.id}`}
                      className="inline-flex items-center min-h-[44px] text-sm font-medium text-indigo hover:text-saffron"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/account/children/${child.id}#enrollments`}
                      className="inline-flex items-center min-h-[44px] text-sm font-medium text-indigo hover:text-saffron"
                    >
                      View enrollments
                    </Link>
                  </div>
                  <DeleteChildButton
                    childId={child.id}
                    childFirstName={child.first_name}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
