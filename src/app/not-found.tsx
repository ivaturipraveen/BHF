import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <section className="bg-cream min-h-[70vh] flex items-center py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <div className="text-saffron text-5xl font-display opacity-70 mb-6">
            ॐ
          </div>
          <p className="text-sm font-semibold uppercase tracking-wider text-saffron">
            Error 404
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl text-indigo">
            Page not found
          </h1>
          <p className="mt-4 text-warm-gray leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or may have
            moved. Try one of the links below, or return to our homepage.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-saffron text-white font-semibold px-6 py-3 hover:bg-amber-burnt transition-colors shadow-[0_4px_12px_rgba(217,119,6,0.25)]"
            >
              Return home →
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-full border-2 border-indigo text-indigo font-semibold px-6 py-3 hover:bg-indigo hover:text-white transition-colors"
            >
              Browse events
            </Link>
          </div>
          <div className="mt-8 text-sm text-warm-gray">
            <p>
              Or visit{" "}
              <Link
                href="/programs"
                className="text-saffron hover:text-amber-burnt font-medium"
              >
                Programs
              </Link>
              {", "}
              <Link
                href="/gallery"
                className="text-saffron hover:text-amber-burnt font-medium"
              >
                Gallery
              </Link>
              {", or "}
              <Link
                href="/contact"
                className="text-saffron hover:text-amber-burnt font-medium"
              >
                Contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
