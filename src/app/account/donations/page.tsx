import Link from "next/link";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { listMyDonations } from "@/lib/queries/account";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CancelRecurringButton } from "@/components/account/CancelRecurringButton";
import type { Donation } from "@/types/db";

function canCancelRecurring(d: Donation): boolean {
  return (
    (d.type === "monthly" || d.type === "yearly") &&
    d.status === "succeeded" &&
    d.stripe_subscription_id !== null
  );
}

export const dynamic = "force-dynamic";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusVariant(status: string): "saffron" | "indigo" | "amber" | "gray" {
  switch (status) {
    case "succeeded":
      return "indigo";
    case "pending":
      return "amber";
    case "failed":
    case "refunded":
    case "canceled":
      return "gray";
    default:
      return "gray";
  }
}

function ytdSum(donations: Donation[]): number {
  const year = new Date().getUTCFullYear();
  return donations
    .filter(
      (d) =>
        d.status === "succeeded" &&
        new Date(d.created_at).getUTCFullYear() === year,
    )
    .reduce((sum, d) => sum + d.amount_cents, 0);
}

export default async function DonationsPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login?next=/account/donations");

  const donations = await listMyDonations(session.sub);
  const ytd = ytdSum(donations);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl text-indigo">Donation history</h1>
        <p className="mt-2 text-warm-gray">
          Your contributions to BHF. Tax-deductible to the extent allowed by
          law.
        </p>
      </header>

      {donations.length === 0 ? (
        <EmptyState
          title="No donations yet"
          body="Your donation history will appear here once you give. Every contribution sustains BHF's cultural and educational programs."
          cta={{ href: "/donate", label: "Make your first donation" }}
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-cream text-indigo">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Receipt</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} className="border-t border-gray-200">
                  <td className="px-4 py-3 text-warm-gray whitespace-nowrap">
                    {format(new Date(d.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 font-medium text-indigo whitespace-nowrap">
                    {formatCents(d.amount_cents)}
                  </td>
                  <td className="px-4 py-3 text-warm-gray capitalize whitespace-nowrap">
                    {d.type.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {d.receipt_url ? (
                      <a
                        href={d.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-saffron hover:text-amber-burnt font-medium"
                      >
                        View
                      </a>
                    ) : d.status === "succeeded" ? (
                      <Link
                        href={`/donate/thank-you?id=${d.id}`}
                        className="text-saffron hover:text-amber-burnt font-medium"
                      >
                        View
                      </Link>
                    ) : (
                      <span className="text-warm-gray/60">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {canCancelRecurring(d) ? (
                      <CancelRecurringButton
                        donationId={d.id}
                        amountCents={d.amount_cents}
                        type={d.type as "monthly" | "yearly"}
                      />
                    ) : (
                      <span className="text-warm-gray/60">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Card>
        <h2 className="font-display text-xl text-indigo">Year-end summary</h2>
        <p className="mt-2 text-warm-gray">
          Total donated in {new Date().getUTCFullYear()}:{" "}
          <span className="font-semibold text-indigo">{formatCents(ytd)}</span>
        </p>
        <p className="mt-3 text-sm text-warm-gray">
          <span
            className="text-saffron font-medium"
            title="Coming in Phase 3"
            aria-disabled="true"
          >
            Download annual statement
          </span>{" "}
          (coming soon)
        </p>
      </Card>

    </div>
  );
}
