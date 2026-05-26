import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { listRecentPhotos } from "@/lib/queries/gallery";

export async function GalleryPreview() {
  const photos = await listRecentPhotos(8);
  return (
    <Section className="bg-white">
      <Container>
        <div className="flex items-end justify-between gap-4 mb-10">
          <h2 className="font-display text-3xl md:text-4xl text-indigo">
            Moments from our community
          </h2>
          <Link
            href="/gallery"
            className="text-saffron font-medium hover:text-amber-burnt whitespace-nowrap"
          >
            View full gallery →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <Link
              key={photo.id}
              href="/gallery"
              className="relative aspect-square overflow-hidden rounded-lg bg-cream group focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-2"
              aria-label={photo.caption ?? "Open gallery"}
            >
              <Image
                src={photo.thumb_url ?? photo.file_url}
                alt={photo.caption ?? "Community photo"}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
