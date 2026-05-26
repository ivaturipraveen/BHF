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
import { WelcomeBanner } from "@/components/sections/WelcomeBanner";
import { StorySection } from "@/components/sections/StorySection";
import { TestimonialBand } from "@/components/sections/TestimonialBand";
import { FadeIn } from "@/components/ui/FadeIn";
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
        url: "/brand/bhf-logo.jpg",
        width: 1600,
        height: 1600,
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
        <WelcomeBanner />
        <FadeIn>
          <ImpactStats />
        </FadeIn>
        <FadeIn delayMs={75}>
          <StorySection />
        </FadeIn>
        <SectionDivider />
        <FadeIn delayMs={150}>
          <UpcomingEvents />
        </FadeIn>
        <SectionDivider />
        <FadeIn delayMs={225}>
          <ProgramsPreview />
        </FadeIn>
        <FadeIn>
          <TestimonialBand />
        </FadeIn>
        <SectionDivider />
        <FadeIn delayMs={300}>
          <GalleryPreview />
        </FadeIn>
        <SectionDivider />
        <FadeIn delayMs={375}>
          <MissionValues />
        </FadeIn>
        <SectionDivider />
        <FadeIn delayMs={450}>
          <DonateCTA />
        </FadeIn>
        <SectionDivider />
        <FadeIn delayMs={525}>
          <NewsletterSignup />
        </FadeIn>
        <SponsorGrid />
      </main>
    </>
  );
}
