import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { SignupForm } from "@/components/forms/SignupForm";

export const dynamic = "force-dynamic";

const description =
  "Create a BHF member account to RSVP for events, access exclusive content, and stay connected.";

export const metadata: Metadata = {
  title: "Become a member — BHF",
  description,
  openGraph: { title: "Become a member — BHF", description, type: "website" },
};

export default async function JoinPage() {
  const session = await getSessionFromCookies();
  if (session && session.role === "member") {
    redirect("/account");
  }

  return (
    <main className="bg-cream min-h-screen py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-lg">
          <Card variant="elevated">
            <h1 className="font-display text-3xl text-indigo">
              Become a BHF member
            </h1>
            <p className="mt-2 text-warm-gray">
              Join the Bharatiya Heritage Foundation community. Membership is
              free — you&apos;ll get early access to events, member-only content,
              and updates from our community.
            </p>

            <div className="mt-6">
              <SignupForm />
            </div>

            <p className="mt-6 text-sm text-warm-gray">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-saffron hover:text-amber-burnt font-medium"
              >
                Sign in →
              </Link>
            </p>
          </Card>
        </div>
      </Container>
    </main>
  );
}
