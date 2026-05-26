import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { getMemberById } from "@/lib/queries/members";
import { Container } from "@/components/ui/Container";
import { AccountSidebar } from "@/components/AccountSidebar";
import { clearSessionCookie } from "@/lib/cookies";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My account — BHF",
  robots: { index: false, follow: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "member") {
    redirect("/login?next=/account");
  }

  const member = await getMemberById(session.sub);
  if (!member) {
    await clearSessionCookie();
    redirect("/login?next=/account");
  }

  return (
    <main className="bg-cream min-h-screen py-8 md:py-12">
      <Container>
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          <AccountSidebar
            member={{
              firstName: member.first_name,
              lastName: member.last_name,
            }}
          />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </Container>
    </main>
  );
}
