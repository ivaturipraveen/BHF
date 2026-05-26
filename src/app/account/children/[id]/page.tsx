import Link from "next/link";
import { redirect } from "next/navigation";
import { differenceInYears, format } from "date-fns";
import { z } from "zod";
import { getSessionFromCookies } from "@/lib/auth";
import {
  getChildById,
  listEnrollmentsForChild,
  type EnrollmentForChild,
} from "@/lib/queries/account";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ChildForm } from "@/components/account/ChildForm";
import { DeleteChildButton } from "@/components/account/DeleteChildButton";
import { WithdrawEnrollmentButton } from "@/components/account/WithdrawEnrollmentButton";

export const dynamic = "force-dynamic";

const uuid = z.string().uuid();

function statusBadgeVariant(
  status: string,
): "saffron" | "indigo" | "amber" | "gray" {
  if (status === "enrolled") return "saffron";
  if (status === "completed") return "indigo";
  if (status === "withdrawn") return "gray";
  return "gray";
}

function toDateInput(d: Date | string): string {
  const dt = new Date(d);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function EditChildPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "member") {
    redirect(`/login?next=/account/children/${params.id}`);
  }

  const idParsed = uuid.safeParse(params.id);
  if (!idParsed.success) {
    redirect("/account/children?error=not_found");
  }

  const child = await getChildById(session.sub, idParsed.data);
  if (!child) {
    redirect("/account/children?error=not_found");
  }

  const enrollments: EnrollmentForChild[] = await listEnrollmentsForChild(
    session.sub,
    child.id,
  );

  const age = differenceInYears(new Date(), new Date(child.date_of_birth));

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
          Edit {child.first_name} {child.last_name}
        </h1>
        <p className="mt-2 text-warm-gray">
          {age} {age === 1 ? "year" : "years"} old · Born{" "}
          {format(new Date(child.date_of_birth), "MMMM d, yyyy")}
        </p>
      </header>

      <nav aria-label="Sections" className="flex flex-wrap gap-2 text-sm">
        <a
          href="#profile"
          className="rounded-full border border-saffron/40 bg-saffron/10 px-4 py-2 font-medium text-indigo min-h-[44px] inline-flex items-center"
        >
          Profile
        </a>
        <a
          href="#enrollments"
          className="rounded-full border border-gray-200 bg-white px-4 py-2 font-medium text-warm-gray hover:text-indigo min-h-[44px] inline-flex items-center"
        >
          Enrollments ({enrollments.length})
        </a>
      </nav>

      <section id="profile" aria-labelledby="profile-heading">
        <Card>
          <h2
            id="profile-heading"
            className="font-display text-xl text-indigo mb-4"
          >
            Profile
          </h2>
          <ChildForm
            mode="edit"
            initialChild={{
              id: child.id,
              firstName: child.first_name,
              lastName: child.last_name,
              dateOfBirth: toDateInput(child.date_of_birth),
              allergies: child.allergies,
              emergencyContactName: child.emergency_contact_name,
              emergencyContactPhone: child.emergency_contact_phone,
              photoPermission: child.photo_permission,
            }}
          />
        </Card>
      </section>

      <section id="enrollments" aria-labelledby="enrollments-heading">
        <Card>
          <h2
            id="enrollments-heading"
            className="font-display text-xl text-indigo mb-4"
          >
            Enrollments
          </h2>
          {enrollments.length === 0 ? (
            <p className="text-sm text-warm-gray">
              {child.first_name} isn&apos;t enrolled in any programs yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {enrollments.map((en) => (
                <li
                  key={en.id}
                  className="flex flex-col gap-2 border-b border-gray-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg text-indigo">
                        {en.program_title}
                      </span>
                      <Badge variant={statusBadgeVariant(en.status)}>
                        {en.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-warm-gray">
                      Consent recorded on{" "}
                      {format(
                        new Date(en.parental_consent_at),
                        "MMM d, yyyy 'at' h:mm a",
                      )}
                      .
                    </p>
                  </div>
                  {en.status === "enrolled" ? (
                    <WithdrawEnrollmentButton
                      enrollmentId={en.id}
                      programTitle={en.program_title}
                      childFirstName={child.first_name}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6">
            <Link
              href={`/account/register-youth?childId=${child.id}`}
              className="text-sm text-saffron hover:text-amber-burnt font-medium"
            >
              Enroll {child.first_name} in a new program →
            </Link>
          </div>
        </Card>
      </section>

      <section aria-labelledby="danger-zone-heading">
        <Card className="border-red-300">
          <h2
            id="danger-zone-heading"
            className="font-display text-xl text-red-700"
          >
            Remove this child
          </h2>
          <p className="mt-2 text-sm text-warm-gray">
            Permanently delete this child profile. All enrollments will also be
            removed. This cannot be undone.
          </p>
          <div className="mt-4">
            <DeleteChildButton
              childId={child.id}
              childFirstName={child.first_name}
              variant="danger"
            />
          </div>
        </Card>
      </section>
    </div>
  );
}
