import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { PHOTOS } from "@/lib/photos";

export function TestimonialBand() {
  return (
    <section className="bg-cream py-20 md:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="mx-auto h-12 w-12 text-saffron"
            fill="currentColor"
          >
            <path d="M14 12C9 12 5 16 5 21v15h15V21H11c0-3 1.5-5 4-6l-1-3zm21 0c-5 0-9 4-9 9v15h15V21h-9c0-3 1.5-5 4-6l-1-3z" />
          </svg>

          <blockquote className="mt-6 font-display text-2xl md:text-3xl text-indigo leading-snug">
            “Through BHF, our family found a community that celebrates our
            heritage with the same joy we felt back home.”
          </blockquote>

          <div className="mt-8 inline-flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white">
              <Image
                src={PHOTOS.COMMUNITY[1]}
                alt=""
                aria-hidden="true"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <p className="text-sm text-warm-gray">
              <span className="font-semibold text-indigo">A BHF family</span>{" "}
              · Solano County
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
