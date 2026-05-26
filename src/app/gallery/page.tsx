import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import {
  listGalleryCategories,
  listPhotosByCategory,
} from "@/lib/queries/gallery";

export const revalidate = 60;

const description =
  "Photos from BHF festivals, classes, charity drives, and community gatherings.";

export const metadata: Metadata = {
  title: "Gallery — BHF",
  description,
  openGraph: { title: "Gallery — BHF", description, type: "website" },
  twitter: {
    card: "summary_large_image",
    title: "Gallery — BHF",
    description,
  },
};

export default async function GalleryPage() {
  const categories = await listGalleryCategories();

  const covers = await Promise.all(
    categories.map(async (c) => {
      if (c.cover_image_url) return c.cover_image_url;
      const photos = await listPhotosByCategory(c.id);
      return photos[0]?.thumb_url ?? photos[0]?.file_url ?? null;
    }),
  );

  return (
    <main>
      <section className="bg-white py-12 md:py-16">
        <Container>
          <p className="text-xs uppercase tracking-widest text-saffron">
            Gallery
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-indigo mt-3 mb-4">
            Moments from our community
          </h1>
          <p className="text-warm-gray max-w-2xl text-lg leading-relaxed">
            Festivals, classes, hikes, and seva — captured by our members and
            volunteers.
          </p>
        </Container>
      </section>

      <section className="bg-white pb-16">
        <Container>
          {categories.length === 0 ? (
            <p className="text-warm-gray">
              Photo categories will appear here soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, i) => {
                const cover = covers[i];
                return (
                  <Link
                    key={cat.id}
                    href={`/gallery/${cat.slug}`}
                    className="group"
                  >
                    <Card variant="default" className="p-0 overflow-hidden">
                      <div className="relative aspect-[4/3] w-full bg-cream">
                        {cover ? (
                          <Image
                            src={cover}
                            alt={cat.title}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-display text-4xl text-saffron/40">
                              ॐ
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-display text-xl text-indigo group-hover:text-saffron">
                          {cat.title}
                        </h3>
                        {cat.description ? (
                          <p className="text-sm text-warm-gray mt-2 line-clamp-2">
                            {cat.description}
                          </p>
                        ) : null}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
