import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { getMemberById } from "@/lib/queries/members";
import { Card } from "@/components/ui/Card";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { ChangePasswordCard } from "@/components/account/ChangePasswordCard";
import { PreferencesCard } from "@/components/account/PreferencesCard";
import { DeleteAccountCard } from "@/components/forms/DeleteAccountCard";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login?next=/account/profile");
  const member = await getMemberById(session.sub);
  if (!member) redirect("/login?next=/account/profile");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl text-indigo">Profile settings</h1>
        <p className="mt-2 text-warm-gray">
          Manage your personal information, preferences, and account.
        </p>
      </header>

      <Card>
        <h2 className="font-display text-xl text-indigo mb-4">
          Personal information
        </h2>
        <ProfileForm
          initialMember={{
            first_name: member.first_name,
            last_name: member.last_name,
            phone: member.phone,
            city: member.city,
            bio: member.bio,
            photo_url: member.photo_url,
            family_size: member.family_size,
            interests: member.interests,
            directory_opt_in: member.directory_opt_in,
            newsletter_opt_in: member.newsletter_opt_in,
          }}
        />
      </Card>

      <ChangePasswordCard />

      <PreferencesCard
        initial={{
          newsletterOptIn: member.newsletter_opt_in,
          directoryOptIn: member.directory_opt_in,
          eventRemindersOptIn: member.event_reminders_opt_in,
          donationReceiptsOptIn: member.donation_receipts_opt_in,
          memberMessagesOptIn: member.member_messages_opt_in,
        }}
      />

      <Card>
        <h2 className="font-display text-xl text-indigo">Data export</h2>
        <p className="mt-2 text-sm text-warm-gray">
          Download a full copy of your BHF data (profile, donations, RSVPs,
          enrollments, and submissions) in JSON format.
        </p>
        <p className="mt-2 text-xs text-warm-gray">
          Your export includes all your children&apos;s profiles and enrollment
          history.
        </p>
        <a
          href="/api/me/data-export"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border-2 border-indigo px-6 py-3 text-sm font-semibold text-indigo hover:bg-indigo hover:text-white"
        >
          Download my data (JSON)
        </a>
      </Card>

      <DeleteAccountCard email={member.email} />
    </div>
  );
}
