import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function StorySection() {
  return (
    <section className="bg-white py-20 md:py-24">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-cream flex items-center justify-center">
            {/* Madhubani-style corner motifs */}
            <svg
              aria-hidden="true"
              role="presentation"
              className="absolute top-4 left-4 w-20 h-20 text-saffron opacity-15"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="50" cy="50" r="40" />
              <circle cx="50" cy="50" r="28" />
              <path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M78 22 L22 78" />
            </svg>
            <svg
              aria-hidden="true"
              role="presentation"
              className="absolute bottom-4 right-4 w-20 h-20 text-indigo opacity-15"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M20 20 L50 50 L80 20 M20 80 L50 50 L80 80" />
              <circle cx="50" cy="50" r="6" fill="currentColor" />
            </svg>
            <Image
              src="/brand/bhf-logo.jpg"
              alt="Bharatiya Heritage Foundation logo"
              width={280}
              height={280}
              className="rounded-full relative z-10"
            />
          </div>

          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-saffron">
              Our Story
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl text-indigo leading-tight">
              Rooted in tradition, growing with community
            </h2>
            <p className="mt-6 text-warm-gray leading-relaxed">
              The Bharatiya Heritage Foundation began with a simple question
              asked around a kitchen table: how do we keep the rhythms of our
              traditions alive for our children, here in Solano County? From
              that quiet beginning, families across the region have come
              together to celebrate festivals, share meals, learn the wisdom
              of our heritage, and serve our broader community.
            </p>
            <p className="mt-4 text-warm-gray leading-relaxed">
              Today BHF is a 501(c)(3) home for Bharatiya culture in
              Solano County — a place where dharmic values are lived, not
              recited, and where every family is welcomed by name.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1 mt-6 text-saffron font-medium hover:text-amber-burnt"
            >
              Read more <span className="read-more-arrow">→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
