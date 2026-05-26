import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { listYouthPrograms } from "@/lib/queries/programs";
import { listMyChildren } from "@/lib/queries/account";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import {
  YouthEnrollmentFlow,
  type FlowChild,
  type FlowProgram,
} from "@/components/account/YouthEnrollmentFlow";

export const dynamic = "force-dynamic";

export default async function RegisterYouthPage({
  searchParams,
}: {
  searchParams?: { programId?: string; childId?: string };
}) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "member") {
    redirect("/login?next=/account/register-youth");
  }

  const [programs, kids] = await Promise.all([
    listYouthPrograms(),
    listMyChildren(session.sub),
  ]);

  const flowPrograms: FlowProgram[] = programs.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    frequency: p.frequency,
    short_description: p.short_description,
    min_age_years: p.min_age_years,
    max_age_years: p.max_age_years,
  }));

  const flowChildren: FlowChild[] = kids.map((c) => ({
    id: c.id,
    firstName: c.first_name,
    lastName: c.last_name,
    dateOfBirth:
      c.date_of_birth instanceof Date
        ? c.date_of_birth.toISOString()
        : String(c.date_of_birth),
  }));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/account/children"
          className="text-sm text-saffron hover:text-amber-burnt font-medium"
        >
          ← Back to children
        </Link>
        <h1 className="mt-2 font-display text-2xl md:text-3xl text-indigo">
          Register for a youth program
        </h1>
        <p className="mt-2 text-warm-gray">
          Choose a program, pick the child you&apos;re enrolling, and provide
          parental consent.
        </p>
      </header>

      {flowChildren.length === 0 ? (
        <Card className="bg-cream border-saffron/30">
          <h2 className="font-display text-xl text-indigo">
            Add a child profile first
          </h2>
          <p className="mt-2 text-warm-gray">
            You need at least one child profile before you can enroll in a
            youth program.
          </p>
          <div className="mt-4">
            <ButtonLink
              href="/account/children/new"
              variant="primary"
              size="md"
            >
              Add a child profile first →
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <YouthEnrollmentFlow
          programs={flowPrograms}
          childList={flowChildren}
          initialProgramId={searchParams?.programId}
          initialChildId={searchParams?.childId}
        />
      )}
    </div>
  );
}
