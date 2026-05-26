import Link from "next/link";
import Image from "next/image";
import { navLinks, siteConfig } from "@/data/content";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { SessionChip, MobileSessionLinks } from "@/components/SessionChip";
import { NavbarMobileMenu } from "@/components/NavbarMobileMenu";
import { DesktopNavLinks, MobileNavLinks } from "@/components/NavLinks";
import { ProgramsMegaMenu, type ProgramsMegaMenuColumn } from "@/components/ProgramsMegaMenu";
import { SiteSearchButton } from "@/components/SiteSearchButton";
import { listPrograms } from "@/lib/queries/programs";

// Programs link is rendered separately via ProgramsMegaMenu.
const desktopNavLinks = navLinks.filter((l) => l.href !== "/programs");

const CATEGORY_LABELS: Record<
  ProgramsMegaMenuColumn["category"],
  "cultural" | "educational" | "charitable" | "wellness" | "youth"
> = {
  Cultural: "cultural",
  Educational: "educational",
  Charitable: "charitable",
  Wellness: "wellness",
  Youth: "youth",
};

const CATEGORY_ORDER: ProgramsMegaMenuColumn["category"][] = [
  "Cultural",
  "Educational",
  "Charitable",
  "Wellness",
  "Youth",
];

async function buildMegaMenuColumns(): Promise<ProgramsMegaMenuColumn[]> {
  const all = await listPrograms();
  return CATEGORY_ORDER.map((category) => {
    const dbKey = CATEGORY_LABELS[category];
    const programs = all
      .filter((p) => p.category === dbKey)
      .slice(0, 3)
      .map((p) => ({ slug: p.slug, title: p.title }));
    return { category, programs };
  });
}

export default async function Navbar() {
  const megaMenuColumns = await buildMegaMenuColumns();

  // Insert Programs at its original position in the desktop link list
  const programsIndex = navLinks.findIndex((l) => l.href === "/programs");

  return (
    <nav
      role="navigation"
      aria-label="Main"
      className="sticky top-0 z-40 backdrop-blur bg-white/95 border-b border-gray-200"
    >
      <Container>
        <div className="relative flex h-24 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand/bhf-logo.jpg"
              alt="Bharatiya Heritage Foundation logo"
              width={44}
              height={44}
              priority
              className="rounded-full"
            />
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="font-display text-base text-indigo font-semibold">
                Bharatiya Heritage
              </span>
              <span className="text-xs text-warm-gray uppercase tracking-wider">
                Foundation
              </span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <DesktopNavLinks links={desktopNavLinks.slice(0, programsIndex)} />
            <ProgramsMegaMenu columns={megaMenuColumns} />
            <DesktopNavLinks links={desktopNavLinks.slice(programsIndex)} />
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <SiteSearchButton />
            <ButtonLink href={siteConfig.donateHref} variant="primary" size="sm">
              Donate
            </ButtonLink>
            <SessionChip />
          </div>

          <NavbarMobileMenu>
            <div className="py-3 flex flex-col gap-1">
              <MobileNavLinks links={navLinks} />
              <div className="flex flex-col gap-2 mt-2">
                <ButtonLink
                  href={siteConfig.donateHref}
                  variant="primary"
                  size="md"
                >
                  Donate
                </ButtonLink>
                <MobileSessionLinks />
              </div>
            </div>
          </NavbarMobileMenu>
        </div>
      </Container>
    </nav>
  );
}
