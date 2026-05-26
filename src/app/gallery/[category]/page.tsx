import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { PhotoSubmissionForm } from "@/components/forms/PhotoSubmissionForm";
import {
  getGalleryCategoryBySlug,
  listPhotosByCategory,
} from "@/lib/queries/gallery";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const cat = await getGalleryCategoryBySlug(params.category);
  if (!cat) return { title: "Gallery — BHF" };
  const description =
    cat.description ?? `Photos from ${cat.title} at the Bharatiya Heritage Foundation.`;
  const title = `${cat.title} — Gallery — BHF`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: cat.cover_image_url
        ? [{ url: cat.cover_image_url, alt: cat.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function GalleryCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = await getGalleryCategoryBySlug(params.category);
  if (!category) notFound();
  const photos = await listPhotosByCategory(category.id);

  return (
    <main>
      <section className="bg-white py-12 md:py-16">
        <Container>
          <p className="text-xs uppercase tracking-widest text-saffron">
            Gallery
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-indigo mt-3 mb-4">
            {category.title}
          </h1>
          {category.description ? (
            <p className="text-warm-gray max-w-2xl text-lg leading-relaxed">
              {category.description}
            </p>
          ) : null}
        </Container>
      </section>

      <section className="bg-white pb-16">
        <Container>
          <GalleryGrid photos={photos} />
        </Container>
      </section>

      <section className="bg-cream py-16">
        <Container>
          <div className="max-w-xl mx-auto">
            <h2 className="font-display text-2xl text-indigo mb-3 text-center">
              Submit your photos
            </h2>
            <p className="text-warm-gray text-center mb-6 text-sm">
              Shot something at {category.title}? Share it with the community —
              we&apos;ll review and add it to the gallery.
            </p>
            <PhotoSubmissionForm />
          </div>
        </Container>
      </section>
    </main>
  );
}
