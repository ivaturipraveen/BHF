import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { safeRedirect } from "@/lib/safeRedirect";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/components/forms/LoginForm";

export const dynamic = "force-dynamic";

const description = "Sign in to your Bharatiya Heritage Foundation account.";

export const metadata: Metadata = {
  title: "Sign in — BHF",
  description,
  openGraph: { title: "Sign in — BHF", description, type: "website" },
};

interface LoginPageProps {
  searchParams?: {
    next?: string | string[];
    verified?: string | string[];
    verifyError?: string | string[];
    reset?: string | string[];
  };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSessionFromCookies();
  if (session && session.role === "member") {
    redirect("/account");
  }

  const next = safeRedirect(searchParams?.next, "/account");
  const verified = searchParams?.verified === "1";
  const verifyError = searchParams?.verifyError === "1";
  const resetOk = searchParams?.reset === "ok";

  return (
    <main className="bg-cream min-h-screen py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-md">
          <Card variant="elevated">
            <h1 className="font-display text-3xl text-indigo">Welcome back</h1>
            <p className="mt-2 text-warm-gray">
              Sign in to your BHF member account.
            </p>

            {verified ? (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                Email verified. Please sign in.
              </div>
            ) : null}
            {verifyError ? (
              <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-burnt">
                Verification link is invalid or expired. Please request a new
                link.
              </div>
            ) : null}
            {resetOk ? (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                Password updated. Please sign in.
              </div>
            ) : null}

            <div className="mt-6">
              <LoginForm next={next} />
            </div>

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link
                href="/forgot-password"
                className="text-saffron hover:text-amber-burnt font-medium"
              >
                Forgot password?
              </Link>
              <Link
                href="/join"
                className="text-saffron hover:text-amber-burnt font-medium"
              >
                Need an account?
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}
