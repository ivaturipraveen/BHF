import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ResendVerificationForm } from "@/components/forms/ResendVerificationForm";
import UrlTokenStrip from "@/components/UrlTokenStrip";

export const dynamic = "force-dynamic";

const description = "Verify your BHF account email address.";

export const metadata: Metadata = {
  title: "Verify your email — BHF",
  description,
  openGraph: { title: "Verify your email — BHF", description, type: "website" },
};

export default function VerifyEmailPage() {
  return (
    <main className="bg-cream min-h-screen py-12 md:py-16">
      <UrlTokenStrip />
      <Container>
        <div className="mx-auto max-w-md">
          <Card variant="elevated">
            <h1 className="font-display text-3xl text-indigo">
              Check your email
            </h1>
            <p className="mt-2 text-warm-gray">
              We sent a verification link to your inbox. Click the link to
              activate your BHF member account.
            </p>
            <p className="mt-3 text-sm text-warm-gray">
              Didn&apos;t receive it? Enter your email below and we&apos;ll send
              a new link.
            </p>
            <div className="mt-6">
              <ResendVerificationForm />
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}
