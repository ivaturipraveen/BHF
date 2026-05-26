import type { Metadata } from "next";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Youtube,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/forms/ContactForm";
import { siteConfig } from "@/data/content";

const description =
  "Get in touch with the Bharatiya Heritage Foundation — questions, partnerships, and community connections welcome.";

export const metadata: Metadata = {
  title: "Contact — BHF",
  description,
  openGraph: { title: "Contact — BHF", description, type: "website" },
  twitter: {
    card: "summary_large_image",
    title: "Contact — BHF",
    description,
  },
};

type ContactType =
  | "volunteer"
  | "sponsor"
  | "general"
  | "press"
  | "planned_giving";

const VALID: ContactType[] = [
  "volunteer",
  "sponsor",
  "general",
  "press",
  "planned_giving",
];

export default function ContactPage({
  searchParams,
}: {
  searchParams?: { type?: string };
}) {
  const requested = searchParams?.type;
  const defaultType: ContactType =
    requested && (VALID as string[]).includes(requested)
      ? (requested as ContactType)
      : "general";

  return (
    <main>
      <section className="bg-white py-12 md:py-16">
        <Container>
          <p className="text-xs uppercase tracking-widest text-saffron">
            Contact
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-indigo mt-3 mb-4">
            Contact us
          </h1>
          <p className="text-warm-gray max-w-2xl text-lg leading-relaxed">
            We&apos;d love to hear from you. Send us a note — we typically reply
            within 2 business days.
          </p>
        </Container>
      </section>

      <section className="bg-white pb-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12">
            <div>
              <ContactForm defaultType={defaultType} />
            </div>

            <aside className="space-y-6">
              <div className="bg-cream rounded-xl p-6">
                <h2 className="font-display text-xl text-indigo mb-4">
                  Reach us
                </h2>
                <ul className="space-y-4 text-sm text-warm-gray">
                  <li className="flex items-start gap-3">
                    <Mail size={18} className="text-saffron flex-shrink-0 mt-0.5" />
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="hover:text-saffron font-medium"
                    >
                      {siteConfig.email}
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone size={18} className="text-saffron flex-shrink-0 mt-0.5" />
                    <span>{siteConfig.phone}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin size={18} className="text-saffron flex-shrink-0 mt-0.5" />
                    <span>{siteConfig.address}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock size={18} className="text-saffron flex-shrink-0 mt-0.5" />
                    <span>Office hours by appointment</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-display text-xl text-indigo mb-4">
                  Follow us
                </h2>
                <div className="flex items-center gap-3">
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream text-indigo hover:bg-saffron hover:text-white transition-colors"
                  >
                    <Instagram size={18} />
                  </a>
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream text-indigo hover:bg-saffron hover:text-white transition-colors"
                  >
                    <Facebook size={18} />
                  </a>
                  <a
                    href="#"
                    aria-label="YouTube"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream text-indigo hover:bg-saffron hover:text-white transition-colors"
                  >
                    <Youtube size={18} />
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
