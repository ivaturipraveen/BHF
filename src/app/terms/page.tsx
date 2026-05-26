import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/ui/Markdown";
import { getPageBySlug } from "@/lib/queries/pages";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Terms of Service — BHF",
  description:
    "The terms and conditions for using the Bharatiya Heritage Foundation website and services.",
  openGraph: {
    title: "Terms of Service — BHF",
    description:
      "The terms and conditions for using the Bharatiya Heritage Foundation website and services.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service — BHF",
    description:
      "The terms and conditions for using the Bharatiya Heritage Foundation website and services.",
  },
};

export default async function TermsPage() {
  const page = await getPageBySlug("terms-of-service");
  if (!page) notFound();
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-4xl text-indigo mb-8">
        {page.title ?? "Terms of Service"}
      </h1>
      {page.body_md ? <Markdown content={page.body_md} /> : null}
    </main>
  );
}
