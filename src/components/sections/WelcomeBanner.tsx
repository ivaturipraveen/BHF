import Link from "next/link";

export function WelcomeBanner() {
  return (
    <div className="welcome-banner bg-indigo text-cream py-3 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
          <span>Welcoming new families</span>
          <span className="text-cream/40">·</span>
          <span>Diwali 2026 RSVPs now open</span>
          <span className="text-cream/40">·</span>
          <Link
            href="/get-involved"
            className="font-semibold text-saffron hover:text-cream transition-colors"
          >
            Become a member today →
          </Link>
        </p>
      </div>
    </div>
  );
}
