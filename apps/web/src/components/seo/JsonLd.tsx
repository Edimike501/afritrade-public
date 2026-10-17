import { siteConfig } from "@/config/site";

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.svg`,
    description: siteConfig.description,
    sameAs: [`https://twitter.com/${siteConfig.twitterHandle.replace("@", "")}`],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      areaServed: ["NG", "ZA", "GH"],
      availableLanguage: ["English"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductJsonLd({
  product,
}: {
  product: {
    id: string;
    name: string;
    description: string;
    price: string | number;
    currency: string;
    supplierName: string;
    countryName: string;
    category: string;
  };
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: product.supplierName,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
