import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { ChildForm } from "@/components/account/ChildForm";

export const dynamic = "force-dynamic";

export default async function NewChildPage() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "member") {
    redirect("/login?next=/account/children/new");
  }

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
          Add a child
        </h1>
        <p className="mt-2 text-warm-gray">
          Create a profile so you can enroll your child in BHF youth programs.
        </p>
      </header>

      <ChildForm mode="create" />
    </div>
  );
}
