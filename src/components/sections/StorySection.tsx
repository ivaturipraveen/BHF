import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PHOTOS } from "@/lib/photos";

export function StorySection() {
  return (
    <section className="bg-white py-20 md:py-24">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-cream">
            <Image
              src={PHOTOS.COMMUNITY[0]}
              alt="BHF community gathering"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
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
