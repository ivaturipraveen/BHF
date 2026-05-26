import Link from "next/link";
import { navLinks, siteConfig } from "@/data/content";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { SessionChip, MobileSessionLinks } from "@/components/SessionChip";
import { NavbarMobileMenu } from "@/components/NavbarMobileMenu";
import { DesktopNavLinks, MobileNavLinks } from "@/components/NavLinks";

export default function Navbar() {
  return (
    <nav
      role="navigation"
      aria-label="Main"
      className="sticky top-0 z-40 backdrop-blur bg-white/95 border-b border-gray-200"
    >
      <Container>
        <div className="relative flex h-20 items-center justify-between">
          <Link
            href="/"
            className="font-display text-xl text-indigo hover:text-saffron transition-colors"
          >
            BHF • Bharatiya Heritage Foundation
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <DesktopNavLinks links={navLinks} />
          </div>

          <div className="hidden lg:flex items-center gap-3">
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
