import type { Metadata } from "next";
import Hero from "@/components/Hero";
import { ImpactStats } from "@/components/sections/ImpactStats";
import { UpcomingEvents } from "@/components/sections/UpcomingEvents";
import { ProgramsPreview } from "@/components/sections/ProgramsPreview";
import { GalleryPreview } from "@/components/sections/GalleryPreview";
import { MissionValues } from "@/components/sections/MissionValues";
import { DonateCTA } from "@/components/sections/DonateCTA";
import { NewsletterSignup } from "@/components/sections/NewsletterSignup";
import { SponsorGrid } from "@/components/sections/SponsorGrid";
import { SectionDivider } from "@/components/sections/SectionDivider";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";

const description =
  "A thriving home for Bharatiya heritage in Solano County — building community, celebrating culture, and empowering the next generation through dharmic values.";

export const metadata: Metadata = {
  title: "BHF — Bharatiya Heritage Foundation",
  description,
  openGraph: {
    title: "BHF — Bharatiya Heritage Foundation",
    description,
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bharatiya Heritage Foundation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BHF — Bharatiya Heritage Foundation",
    description,
  },
};

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <main>
        <Hero />
        <ImpactStats />
        <SectionDivider />
        <UpcomingEvents />
        <ProgramsPreview />
        <SectionDivider />
        <GalleryPreview />
        <MissionValues />
        <DonateCTA />
        <NewsletterSignup />
        <SponsorGrid />
      </main>
    </>
  );
}
