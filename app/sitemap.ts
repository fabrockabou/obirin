import type { MetadataRoute } from "next";
import { collections } from "@/data/collections";
import { getProducts } from "@/lib/store";
import { services } from "@/data/services";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number) => ({ url: `${site.url}${path}`, lastModified: now, priority });
  return [
    page("/", 1),
    page("/boutique", 0.9),
    page("/collections", 0.9),
    ...collections.map((c) => page(`/collections/${c.slug}`, 0.8)),
    ...getProducts().map((p) => ({ ...page(`/produits/${p.slug}`, p.cataloguePage ? 0.8 : 0.5), images: [`${site.url}${p.image.src}`] })),
    page("/services", 0.8),
    ...services.map((s) => page(`/services/${s.slug}`, 0.7)),
    page("/notre-marque", 0.6),
    page("/adherer", 0.6),
    page("/contact", 0.5),
  ];
}
