import type { Metadata } from "next";
import { HeroScroll } from "@/components/hero/HeroScroll";
import { BrandSignature } from "@/components/sections/BrandSignature";
import { CareRitual } from "@/components/sections/CareRitual";

const ritualSlugs = ["savon-olive", "lotion-tonique-bleuet", "serum-visage-bleuet", "creme-contour-yeux-bleuet"];
import { getProduct } from "@/lib/store";
import type { Product } from "@/data/types";
import { Philosophy } from "@/components/sections/Philosophy";
import { ProductSelection } from "@/components/sections/ProductSelection";
import { ServicesHighlight } from "@/components/sections/ServicesHighlight";
import { Universes } from "@/components/sections/Universes";
import { site } from "@/data/site";
import { getSettings } from "@/lib/store";

export function generateMetadata(): Metadata {
  const s = getSettings();
  return {
    title: { absolute: s.seoTitle || site.fullName },
    description: s.seoDescription || site.description,
    alternates: { canonical: "/" },
  };
}

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
      <CareRitual products={ritualSlugs.map((s) => getProduct(s)).filter((p): p is Product => Boolean(p))} />
      <ServicesHighlight />
      <BrandSignature />
    </main>
  );
}
