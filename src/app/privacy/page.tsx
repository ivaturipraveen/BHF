import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/ui/Markdown";
import { getPageBySlug } from "@/lib/queries/pages";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Privacy Policy — BHF",
  description:
    "How the Bharatiya Heritage Foundation collects, uses, and protects your information.",
  openGraph: {
    title: "Privacy Policy — BHF",
    description:
      "How the Bharatiya Heritage Foundation collects, uses, and protects your information.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy — BHF",
    description:
      "How the Bharatiya Heritage Foundation collects, uses, and protects your information.",
  },
};

export default async function PrivacyPage() {
  const page = await getPageBySlug("privacy-policy");
  if (!page) notFound();
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-4xl text-indigo mb-8">
        {page.title ?? "Privacy Policy"}
      </h1>
      {page.body_md ? <Markdown content={page.body_md} /> : null}
    </main>
  );
}
