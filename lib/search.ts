import { getCollection } from "@/data/collections";
import { formatFcfa } from "./format";
import { getProducts } from "./store";

export type SearchItem = {
  href: string;
  title: string;
  subtitle: string;
  price: string;
  image: { src: string; width: number; height: number };
  haystack: string;
};

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Index de recherche léger (produits visibles), calculé côté serveur et transmis au header. */
export function buildSearchIndex(): SearchItem[] {
  return [
    ...getProducts().map((p) => ({
      href: `/produits/${p.slug}`,
      title: p.name,
      subtitle: `${getCollection(p.collection)?.name ?? ""} — ${p.packagingName}`,
      price: formatFcfa(p.price),
      image: { src: p.image.src, width: p.image.width, height: p.image.height },
      haystack: normalize([p.name, p.packagingName, p.tagline, p.intro, getCollection(p.collection)?.name, ...(p.composition ?? [])].join(" ")),
    })),
  ];
}
