import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PHOTOS } from "@/lib/photos";
import HeroBackground from "@/components/HeroBackground";

function heroVideoExists(): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", "brand", "hero.mp4"));
  } catch {
    return false;
  }
}

export default function Hero() {
  const hasVideo = heroVideoExists();
  const heroPhoto = PHOTOS.HERO;
  const hasPhoto = !hasVideo && typeof heroPhoto === "string" && heroPhoto.length > 0;
  const darkOverlay = hasVideo || hasPhoto;

  return (
    <section
      id="home"
      className="relative isolate min-h-[80vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-cream"
    >
      {hasVideo ? (
        <div className="absolute inset-0 -z-10">
          <HeroBackground />
          {/* Solid indigo overlay for legibility (no gradient) */}
          <div className="absolute inset-0 bg-indigo/60" aria-hidden="true" />
        </div>
      ) : hasPhoto ? (
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroPhoto}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ filter: "brightness(0.55) saturate(1.1)" }}
          />
          {/* Solid indigo overlay for legibility (no gradient) */}
          <div className="absolute inset-0 bg-indigo/60" aria-hidden="true" />
        </div>
      ) : (
        <>
          {/* Madhubani corner motifs at low opacity — brand fallback */}
          <svg
            viewBox="0 0 120 120"
            aria-hidden="true"
            className="absolute top-6 left-6 w-28 h-28 text-saffron opacity-10 -z-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="60" cy="60" r="44" />
            <circle cx="60" cy="60" r="30" />
            <circle cx="60" cy="60" r="16" />
            <circle cx="60" cy="60" r="4" fill="currentColor" />
            <path d="M60 16 L66 50 L60 60 L54 50 Z" />
            <path d="M60 104 L66 70 L60 60 L54 70 Z" />
            <path d="M16 60 L50 54 L60 60 L50 66 Z" />
            <path d="M104 60 L70 54 L60 60 L70 66 Z" />
          </svg>
          <svg
            viewBox="0 0 120 120"
            aria-hidden="true"
            className="absolute bottom-6 right-6 w-28 h-28 text-indigo opacity-10 -z-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="60" cy="60" r="44" />
            <circle cx="60" cy="60" r="30" />
            <circle cx="60" cy="60" r="16" />
            <circle cx="60" cy="60" r="4" fill="currentColor" />
            <path d="M60 16 L66 50 L60 60 L54 50 Z" />
            <path d="M60 104 L66 70 L60 60 L54 70 Z" />
            <path d="M16 60 L50 54 L60 60 L50 66 Z" />
            <path d="M104 60 L70 54 L60 60 L70 66 Z" />
          </svg>
        </>
      )}

      <Container className="relative z-10 text-center py-20 md:py-28">
        <div className="flex justify-center mb-6">
          <Image
            src="/brand/bhf-logo.jpg"
            alt="Bharatiya Heritage Foundation logo"
            width={96}
            height={96}
            priority
            className="rounded-full"
          />
        </div>

        <p className="text-xs font-semibold tracking-widest uppercase text-saffron">
          Bharatiya Heritage Foundation
        </p>

        <h1
          className={
            darkOverlay
              ? "mt-4 font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-cream leading-[1.05] tracking-tight max-w-4xl mx-auto"
              : "mt-4 font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-indigo leading-[1.05] tracking-tight max-w-4xl mx-auto"
          }
        >
          A thriving home for Bharatiya heritage in Solano County
        </h1>

        <p
          className={
            darkOverlay
              ? "mt-6 text-lg md:text-xl text-cream/85 max-w-2xl mx-auto leading-relaxed"
              : "mt-6 text-lg md:text-xl text-warm-gray max-w-2xl mx-auto leading-relaxed"
          }
        >
          Building community, celebrating culture, and empowering the next
          generation through dharmic values.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <ButtonLink href="/get-involved" variant="primary" size="lg">
            Become a member
          </ButtonLink>
          {darkOverlay ? (
            <ButtonLink
              href="/events"
              size="lg"
              className="border-2 border-cream/30 text-white bg-transparent hover:bg-cream/10 hover:border-cream/60"
            >
              Upcoming events
            </ButtonLink>
          ) : (
            <ButtonLink href="/events" variant="secondary" size="lg">
              Upcoming events
            </ButtonLink>
          )}
        </div>

        <p
          className={
            darkOverlay
              ? "mt-8 text-xs text-cream/70 tracking-wide"
              : "mt-8 text-xs text-warm-gray tracking-wide"
          }
        >
          A 501(c)(3) community in Solano County
        </p>
      </Container>
    </section>
  );
}
