import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { siteConfig, navLinks } from "@/data/content";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { SectionDivider } from "@/components/sections/SectionDivider";
import { listPrograms } from "@/lib/queries/programs";

const quickLinks = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Leadership", href: "/leadership" },
  { label: "Blog", href: "/blog" },
  { label: "Get Involved", href: "/get-involved" },
  { label: "Donate", href: "/donate" },
  { label: "Press", href: "/press" },
  { label: "Annual Reports", href: "/annual-reports" },
  { label: "Contact", href: "/contact" },
];

export default async function Footer() {
  const programs = (await listPrograms()).slice(0, 5);

  return (
    <footer className="bg-indigo text-cream py-16">
      <div className="bg-indigo">
        <SectionDivider variant="footer" />
      </div>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="inline-flex flex-col items-start gap-3">
              <Image
                src="/brand/bhf-logo.jpg"
                alt="Bharatiya Heritage Foundation logo"
                width={72}
                height={72}
                className="rounded-full"
              />
              <span className="font-display text-xl text-white">
                {siteConfig.shortName}
              </span>
            </Link>
            <p className="mt-4 text-sm text-cream/80 leading-relaxed">
              A thriving home for Bharatiya heritage in Solano County.
            </p>
            {/* TODO: real socials */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-saffron transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-saffron transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-saffron transition-colors"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/80 hover:text-saffron transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Programs
            </h4>
            <ul className="space-y-2">
              {programs.map((program) => (
                <li key={program.id}>
                  <Link
                    href={`/programs/${program.slug}`}
                    className="text-sm text-cream/80 hover:text-saffron transition-colors"
                  >
                    {program.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-cream/80">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-saffron" />
                <span>{siteConfig.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-0.5 flex-shrink-0 text-saffron" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-saffron transition-colors"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={16} className="mt-0.5 flex-shrink-0 text-saffron" />
                <span>{siteConfig.phone}</span>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-saffron hover:text-cream transition-colors"
                >
                  Contact form →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-cream/20 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-cream/10 rounded-xl p-6">
            <div>
              <h4 className="font-display text-lg text-white">
                Get our newsletter
              </h4>
              <p className="text-sm text-cream/80 mt-1">
                Monthly updates — festivals, programs, community news.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <NewsletterForm source="footer" />
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cream/20 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-xs text-cream/70">
          <p>{siteConfig.copyright}</p>
          <p>501(c)(3) nonprofit · EIN TBD</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-saffron transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-saffron transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
