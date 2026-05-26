import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import UrlTokenStrip from "@/components/UrlTokenStrip";

export const dynamic = "force-dynamic";

const description = "Choose a new password for your BHF account.";

export const metadata: Metadata = {
  title: "Reset password — BHF",
  description,
  openGraph: { title: "Reset password — BHF", description, type: "website" },
};

interface ResetPasswordPageProps {
  searchParams?: {
    token?: string | string[];
    email?: string | string[];
  };
}

function asString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string" && v.length > 0) return v;
  return undefined;
}

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const token = asString(searchParams?.token);
  const email = asString(searchParams?.email);

  return (
    <main className="bg-cream min-h-screen py-12 md:py-16">
      <UrlTokenStrip />
      <Container>
        <div className="mx-auto max-w-md">
          <Card variant="elevated">
            <h1 className="font-display text-3xl text-indigo">
              Reset password
            </h1>
            {!token || !email ? (
              <>
                <p className="mt-2 text-warm-gray">Invalid reset link.</p>
                <p className="mt-4 text-sm">
                  <Link
                    href="/forgot-password"
                    className="text-saffron hover:text-amber-burnt font-medium"
                  >
                    Request a new one →
                  </Link>
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-warm-gray">
                  Choose a new password for{" "}
                  <span className="font-semibold text-indigo">{email}</span>.
                </p>
                <div className="mt-6">
                  <ResetPasswordForm token={token} email={email} />
                </div>
              </>
            )}
          </Card>
        </div>
      </Container>
    </main>
  );
}
