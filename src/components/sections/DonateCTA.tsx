import { ShieldCheck, Lock, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

function TempleMotif({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M100 12 L140 60 L160 60 L160 180 L40 180 L40 60 L60 60 Z" />
      <path d="M100 12 L100 60" />
      <path d="M60 60 L140 60" />
      <path d="M70 90 L130 90 M70 110 L130 110 M70 130 L130 130 M70 150 L130 150" />
      <circle cx="100" cy="40" r="6" />
      <path d="M80 180 L80 150 L120 150 L120 180" />
    </svg>
  );
}

export function DonateCTA() {
  return (
    <section className="relative w-full overflow-hidden bg-indigo text-cream py-20 md:py-24">
      {/* Madhubani temple motif — corners, opacity-5 */}
      <TempleMotif
        className="absolute -top-8 -left-8 h-56 w-56 text-cream opacity-5"
      />
      <TempleMotif
        className="absolute -bottom-10 -right-10 h-64 w-64 text-cream opacity-5"
      />

      <Container className="relative z-10 text-center">
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
            className="bg-saffron text-white hover:bg-amber-burnt"
          >
            Donate today
          </ButtonLink>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-cream/70">
          <li className="inline-flex items-center gap-2">
            <ShieldCheck size={16} className="text-saffron" />
            Tax-deductible
          </li>
          <li className="inline-flex items-center gap-2">
            <Lock size={16} className="text-saffron" />
            Secure checkout
          </li>
          <li className="inline-flex items-center gap-2">
            <Mail size={16} className="text-saffron" />
            Receipts in your inbox
          </li>
        </ul>
      </Container>
    </section>
  );
}
