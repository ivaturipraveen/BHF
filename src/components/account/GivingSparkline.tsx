import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export interface GivingSparklineProps {
  /** Donations with amount_cents, status, and created_at (or Date). */
  donations: Array<{
    amount_cents: number;
    status: string;
    created_at: Date | string;
  }>;
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function buildYtdBuckets(
  donations: GivingSparklineProps["donations"],
): { month: string; amount: number }[] {
  const now = new Date();
  const year = now.getUTCFullYear();
  const monthsThroughNow = now.getUTCMonth() + 1;

  const buckets = Array.from({ length: monthsThroughNow }, (_, i) => ({
    month: MONTHS_SHORT[i],
    amount: 0,
  }));

  for (const d of donations) {
    if (d.status !== "succeeded") continue;
    const created = new Date(d.created_at);
    if (created.getUTCFullYear() !== year) continue;
    const idx = created.getUTCMonth();
    if (idx >= monthsThroughNow) continue;
    buckets[idx].amount += d.amount_cents;
  }
  return buckets;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function GivingSparkline({ donations }: GivingSparklineProps) {
  const buckets = buildYtdBuckets(donations);
  const total = buckets.reduce((s, b) => s + b.amount, 0);
  const isEmpty = total === 0;

  if (isEmpty) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-saffron">
          Your giving
        </p>
        <h3 className="mt-2 font-display text-xl text-indigo">
          No contributions yet this year
        </h3>
        <p className="mt-1 text-sm text-warm-gray">
          Your monthly giving will appear here once you make your first
          contribution.
        </p>
        <div className="mt-4">
          <ButtonLink href="/donate" variant="primary" size="sm">
            Make your first contribution →
          </ButtonLink>
        </div>
      </div>
    );
  }

  const max = Math.max(...buckets.map((b) => b.amount), 1);
  const barCount = buckets.length;
  const barGap = 6;
  const barWidth = 100 / barCount - barGap / barCount;
  const usableHeight = 80;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs uppercase tracking-widest text-saffron">
          Your giving
        </p>
        <Link
          href="/account/donations"
          className="text-sm text-saffron hover:text-amber-burnt font-medium"
        >
          View all →
        </Link>
      </div>
      <p className="mt-2 font-display text-3xl text-indigo">
        {formatCurrency(total)}
      </p>
      <p className="text-xs text-warm-gray">YTD across {barCount} months</p>

      <svg
        viewBox={`0 0 100 ${usableHeight + 14}`}
        className="mt-4 w-full"
        role="img"
        aria-label={`Donations by month: ${buckets
          .map((b) => `${b.month} ${formatCurrency(b.amount)}`)
          .join(", ")}`}
        preserveAspectRatio="none"
      >
        {buckets.map((b, i) => {
          const h = (b.amount / max) * usableHeight;
          const x = i * (100 / barCount) + (barGap / barCount) / 2;
          const y = usableHeight - h;
          return (
            <g key={b.month}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h || 1}
                fill="currentColor"
                className="text-saffron"
                rx="0.6"
              />
              <text
                x={x + barWidth / 2}
                y={usableHeight + 10}
                textAnchor="middle"
                fontSize="5"
                fill="currentColor"
                className="text-warm-gray"
              >
                {b.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
