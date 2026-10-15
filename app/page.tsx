import type { Metadata } from "next";
import { HeroScroll } from "@/components/hero/HeroScroll";
import { BrandSignature } from "@/components/sections/BrandSignature";
import { CareRitual } from "@/components/sections/CareRitual";
import { Philosophy } from "@/components/sections/Philosophy";
import { ProductSelection } from "@/components/sections/ProductSelection";
import { ServicesHighlight } from "@/components/sections/ServicesHighlight";
import { Universes } from "@/components/sections/Universes";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: site.fullName },
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Obirin Côte d'Ivoire",
    slogan: site.motto,
    url: site.url,
    logo: `${site.url}/icon.svg`,
  };
  return (
    <main data-header="dark">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeroScroll />
      <Philosophy />
      <Universes />
      <ProductSelection />
      <CareRitual />
      <ServicesHighlight />
      <BrandSignature />
    </main>
  );
}
