import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cream py-20 md:py-32"
    >
      {/* Madhubani-inspired corner motifs — subtle, decorative */}
      <svg
        aria-hidden="true"
        role="presentation"
        className="absolute top-8 left-8 w-32 h-32 text-saffron opacity-10"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path d="M50 5 L60 40 L95 50 L60 60 L50 95 L40 60 L5 50 L40 40 Z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="3" fill="currentColor" />
      </svg>
      <svg
        aria-hidden="true"
        role="presentation"
        className="absolute top-8 right-8 w-32 h-32 text-saffron opacity-10"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path d="M50 5 L60 40 L95 50 L60 60 L50 95 L40 60 L5 50 L40 40 Z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="3" fill="currentColor" />
      </svg>
      <svg
        aria-hidden="true"
        role="presentation"
        className="absolute bottom-8 left-8 w-32 h-32 text-indigo opacity-10"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path d="M50 5 L60 40 L95 50 L60 60 L50 95 L40 60 L5 50 L40 40 Z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="3" fill="currentColor" />
      </svg>
      <svg
        aria-hidden="true"
        role="presentation"
        className="absolute bottom-8 right-8 w-32 h-32 text-indigo opacity-10"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path d="M50 5 L60 40 L95 50 L60 60 L50 95 L40 60 L5 50 L40 40 Z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="3" fill="currentColor" />
      </svg>

      <Container className="relative z-10 text-center">
        <div className="flex justify-center mb-8">
          <Image
            src="/brand/bhf-logo.jpg"
            alt="Bharatiya Heritage Foundation logo"
            width={120}
            height={120}
            priority
            className="rounded-full"
          />
        </div>

        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-indigo leading-[1.1] tracking-tight max-w-4xl mx-auto">
          A thriving home for Bharatiya heritage in Solano County
        </h1>

        <p className="mt-8 text-lg sm:text-xl text-warm-gray max-w-2xl mx-auto leading-relaxed">
          Building community, celebrating culture, and empowering the next
          generation through dharmic values.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <ButtonLink href="/get-involved" variant="primary" size="lg">
            Become a member
          </ButtonLink>
          <ButtonLink href="/events" variant="secondary" size="lg">
            Upcoming events
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
