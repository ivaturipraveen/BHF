import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { getMemberById } from "@/lib/queries/members";
import type { PublicMember } from "@/lib/queries/members";
import { listMyDonations, listMyRsvps } from "@/lib/queries/account";
import { Container } from "@/components/ui/Container";
import { AccountSidebar } from "@/components/AccountSidebar";
import { clearSessionCookie } from "@/lib/cookies";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My account — BHF",
  robots: { index: false, follow: false },
};

interface CompletenessCheck {
  label: string;
  weight: number;
  done: (m: PublicMember, hasRsvp: boolean, hasDonation: boolean) => boolean;
}

const CHECKS: CompletenessCheck[] = [
  { label: "Add your first name", weight: 10, done: (m) => m.first_name.trim().length > 0 },
  { label: "Add your last name", weight: 10, done: (m) => m.last_name.trim().length > 0 },
  { label: "Verify your email", weight: 15, done: (m) => m.email_verified_at !== null },
  { label: "Add your city", weight: 5, done: (m) => (m.city ?? "").trim().length > 0 },
  { label: "Add your phone", weight: 5, done: (m) => (m.phone ?? "").trim().length > 0 },
  { label: "Write a short bio", weight: 10, done: (m) => (m.bio ?? "").trim().length > 0 },
  { label: "Upload a photo", weight: 10, done: (m) => (m.photo_url ?? "").trim().length > 0 },
  {
    label: "Pick at least one interest",
    weight: 10,
    done: (m) => (m.interests ?? []).length > 0,
  },
  {
    label: "Opt into the directory",
    weight: 5,
    done: (m) => m.directory_opt_in === true,
  },
  {
    label: "RSVP to an event",
    weight: 10,
    done: (_m, hasRsvp) => hasRsvp,
  },
  {
    label: "Make your first donation",
    weight: 10,
    done: (_m, _hasRsvp, hasDonation) => hasDonation,
  },
];

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

  const [rsvps, donations] = await Promise.all([
    listMyRsvps(session.sub),
    listMyDonations(session.sub),
  ]);
  const hasRsvp = rsvps.length > 0;
  const hasDonation = donations.some((d) => d.status === "succeeded");

  let percent = 0;
  const missing: string[] = [];
  for (const c of CHECKS) {
    if (c.done(member, hasRsvp, hasDonation)) {
      percent += c.weight;
    } else {
      missing.push(c.label);
    }
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
            completeness={{ percent, missing }}
          />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </Container>
    </main>
  );
}
