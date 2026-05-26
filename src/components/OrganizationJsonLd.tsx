import { jsonLdString } from "@/lib/jsonLd";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "Bharatiya Heritage Foundation",
    alternateName: "BHF",
    url: "https://bhfcommunity.org",
    logo: "https://bhfcommunity.org/logo.png",
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
