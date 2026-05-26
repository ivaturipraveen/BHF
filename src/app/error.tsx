'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.error('Application error:', error);
    }
  }, [error]);

  return (
    <section className="bg-cream min-h-[70vh] flex items-center py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <div className="text-saffron text-5xl font-display opacity-70 mb-6">
            ॐ
          </div>
          <p className="text-sm font-semibold uppercase tracking-wider text-saffron">
            Something went wrong
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl text-indigo">
            We hit a snag
          </h1>
          <p className="mt-4 text-warm-gray leading-relaxed">
            An unexpected error occurred while loading this page. Please try
            again, or return to the homepage.
          </p>
          {error?.digest ? (
            <p className="mt-3 text-xs text-warm-gray/70">
              Reference: <code>{error.digest}</code>
            </p>
          ) : null}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-full bg-saffron text-white font-semibold px-6 py-3 hover:bg-amber-burnt transition-colors shadow-[0_4px_12px_rgba(217,119,6,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-2"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border-2 border-indigo text-indigo font-semibold px-6 py-3 hover:bg-indigo hover:text-white transition-colors"
            >
              Return home
            </Link>
          </div>
          <p className="mt-8 text-sm text-warm-gray">
            If this persists, contact{' '}
            <a
              href="mailto:support@bhfcommunity.org"
              className="text-saffron hover:text-amber-burnt font-medium"
            >
              support@bhfcommunity.org
            </a>
            .
          </p>
        </div>
      </Container>
    </section>
  );
}
