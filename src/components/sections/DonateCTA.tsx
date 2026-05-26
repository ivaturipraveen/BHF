import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export function DonateCTA() {
  return (
    <section className="w-full bg-indigo text-cream py-20 md:py-24">
      <Container className="text-center">
        <h2 className="font-display text-3xl md:text-4xl text-white">
          Your seva sustains our future
        </h2>
        <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-cream/90 leading-relaxed">
          Every contribution funds our festivals, youth programs, and community
          service. BHF is a registered 501(c)(3) — your gift is tax-deductible.
        </p>
        <div className="mt-10">
          <ButtonLink
            href="/donate"
            size="lg"
            className="bg-saffron text-white hover:bg-amber-burnt shadow-lg"
          >
            Donate today
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
