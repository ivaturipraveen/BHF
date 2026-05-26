import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cream pt-24 pb-16"
    >
      <Container className="relative z-10 text-center">
        <div className="mb-6 text-saffron text-5xl font-display select-none opacity-70">
          ॐ
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-indigo leading-tight tracking-tight max-w-4xl mx-auto">
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
