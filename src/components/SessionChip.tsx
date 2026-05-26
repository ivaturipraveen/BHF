import Link from "next/link";
import { LogIn } from "lucide-react";
import { getSessionFromCookies } from "@/lib/auth";
import { getMemberById } from "@/lib/queries/members";
import { SessionMenu } from "@/components/SessionMenu";

export async function SessionChip() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "member") {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-indigo hover:text-saffron hover:bg-cream transition-colors"
      >
        <LogIn size={20} />
      </Link>
    );
  }

  const member = await getMemberById(session.sub);
  if (!member) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-indigo hover:text-saffron hover:bg-cream transition-colors"
      >
        <LogIn size={20} />
      </Link>
    );
  }

  return (
    <SessionMenu firstName={member.first_name} lastName={member.last_name} />
  );
}

export async function MobileSessionLinks() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "member") {
    return (
      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-indigo px-6 py-3 text-sm font-semibold text-indigo hover:bg-indigo hover:text-white"
      >
        <LogIn size={16} />
        Sign in
      </Link>
    );
  }
  return (
    <Link
      href="/account"
      className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-indigo px-6 py-3 text-sm font-semibold text-indigo hover:bg-indigo hover:text-white"
    >
      Dashboard
    </Link>
  );
}
