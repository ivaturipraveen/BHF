import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export const dynamic = "force-dynamic";

const description = "Request a password reset for your BHF account.";

export const metadata: Metadata = {
  title: "Forgot password — BHF",
  description,
  openGraph: { title: "Forgot password — BHF", description, type: "website" },
};

export default function ForgotPasswordPage() {
  return (
    <main className="bg-cream min-h-screen py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-md">
          <Card variant="elevated">
            <h1 className="font-display text-3xl text-indigo">
              Forgot password
            </h1>
            <p className="mt-2 text-warm-gray">
              Enter your email and we&apos;ll send you a link to set a new
              password.
            </p>

            <div className="mt-6">
              <ForgotPasswordForm />
            </div>

            <p className="mt-6 text-sm text-warm-gray">
              <Link
                href="/login"
                className="text-saffron hover:text-amber-burnt font-medium"
              >
                ← Back to sign in
              </Link>
            </p>
          </Card>
        </div>
      </Container>
    </main>
  );
}
