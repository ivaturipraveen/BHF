import { jsonLdString } from "@/lib/jsonLd";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.length > 0
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://bhfcommunity.org";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "Bharatiya Heritage Foundation",
    alternateName: "BHF",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/bhf-logo.jpg`,
    description:
      "A thriving home for Bharatiya heritage in Solano County — building community, celebrating culture, and empowering the next generation through dharmic values.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Fairfield",
      addressRegion: "CA",
      addressCountry: "US",
    },
    nonprofitStatus: "Nonprofit501c3",
    email: "support@bhfcommunity.org",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
    />
  );
}
