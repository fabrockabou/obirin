// Validation des produits envoyés depuis l'administration (côté serveur).
import { collections } from "@/data/collections";
import type { Benefit, CollectionSlug, ImageAsset, PriceVariant, Product, ProductLayout, ProductTone } from "@/data/types";
import { slugify } from "./store";

export const LAYOUTS: { id: ProductLayout; label: string }[] = [
  { id: "split", label: "Classique — image à gauche, informations à droite" },
  { id: "editorial", label: "Éditoriale — texte large, image encadrée" },
  { id: "immersive", label: "Immersive — plein écran sur fond coloré" },
  { id: "portrait", label: "Portrait — photo d'ambiance pleine hauteur" },
];

export const TONES: { id: ProductTone; label: string }[] = [
  { id: "emerald", label: "Vert émeraude" },
  { id: "rose", label: "Rose poudré" },
  { id: "fuchsia", label: "Fuchsia" },
  { id: "violet", label: "Violet" },
  { id: "honey", label: "Miel" },
  { id: "olive", label: "Olive" },
  { id: "ivory", label: "Ivoire" },
  { id: "ocean", label: "Bleu océan" },
];

/** Champs modifiables depuis le formulaire (le reste du produit est conservé tel quel). */
export type ProductInput = {
  slug: string;
  name: string;
  packagingName: string;
  collection: CollectionSlug;
  hidden: boolean;
  price: number | null;
  format: string;
  catalogueCategory: string;
  tagline: string;
  intro: string;
  signature: string;
  benefitsTitle: string;
  benefits: Benefit[];
  highlights: string[];
  composition: string[];
  usage: string[];
  forWhom: string[];
  plus: string[];
  routine: string[];
  precautions: string[];
  ingredientNote: { title: string; text: string };
  sourceNote: string;
  layout: ProductLayout;
  tone: ProductTone;
  related: string[];
  variants: { id: string; label: string; detail: string; price: number | null }[];
  /** Images conservées (sources existantes) */
  image: ImageAsset | null;
  cutout: ImageAsset | null;
  gallery: ImageAsset[];
};

const text = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, max = 40) =>
  (Array.isArray(v) ? v : [])
    .map((x) => text(x, 600))
    .filter(Boolean)
    .slice(0, max);
const price = (v: unknown): number | null => {
  if (v === null || v === "" || v === undefined) return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 && n <= 100_000_000 ? n : null;
};
const image = (v: unknown): ImageAsset | null => {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const src = text(o.src, 300);
  // seules les images du site (/images/…) ou envoyées depuis l'administration (/media/…) sont acceptées
  if (!/^\/(images|media)\/[\w./-]+$/.test(src) || src.includes("..")) return null;
  const width = Number(o.width);
  const height = Number(o.height);
  if (!(width > 0 && height > 0)) return null;
  return { src, alt: text(o.alt, 200), width, height, ...(o.kind ? { kind: o.kind as ImageAsset["kind"] } : {}), ...(o.caption ? { caption: text(o.caption, 300) } : {}) };
};

export function parseProductInput(raw: unknown): { input: ProductInput } | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "Données invalides." };
  const o = raw as Record<string, unknown>;
  const name = text(o.name, 120);
  if (name.length < 2) return { error: "Le nom du produit est obligatoire." };
  const slug = slugify(text(o.slug, 80) || name);
  if (!slug) return { error: "L'adresse du produit est invalide." };
  if (slug === "nouveau") return { error: "« nouveau » est réservé : choisissez une autre adresse." };
  const collection = text(o.collection) as CollectionSlug;
  if (!collections.some((c) => c.slug === collection)) return { error: "Choisissez un univers." };
  const layout = (LAYOUTS.some((l) => l.id === o.layout) ? o.layout : "split") as ProductLayout;
  const tone = (TONES.some((t) => t.id === o.tone) ? o.tone : "emerald") as ProductTone;
  const benefits = (Array.isArray(o.benefits) ? o.benefits : [])
    .map((b) => ({ title: text((b as Benefit)?.title, 160), text: text((b as Benefit)?.text, 600) }))
    .filter((b) => b.title)
    .slice(0, 12)
    .map((b) => (b.text ? b : { title: b.title }));
  const variants = (Array.isArray(o.variants) ? o.variants : [])
    .map((v, i) => {
      const r = v as Record<string, unknown>;
      return { id: slugify(text(r.id, 40) || text(r.label, 40)) || `v${i + 1}`, label: text(r.label, 60), detail: text(r.detail, 120), price: price(r.price) };
    })
    .filter((v) => v.label)
    .slice(0, 8);
  const ingredient = (o.ingredientNote ?? {}) as Record<string, unknown>;
  return {
    input: {
      slug,
      name,
      packagingName: text(o.packagingName, 200),
      collection,
      hidden: o.hidden === true,
      price: price(o.price),
      format: text(o.format, 120),
      catalogueCategory: text(o.catalogueCategory, 80),
      tagline: text(o.tagline, 200),
      intro: text(o.intro, 1500),
      signature: text(o.signature, 300),
      benefitsTitle: text(o.benefitsTitle, 80),
      benefits,
      highlights: list(o.highlights, 12),
      composition: list(o.composition),
      usage: list(o.usage),
      forWhom: list(o.forWhom),
      plus: list(o.plus),
      routine: list(o.routine),
      precautions: list(o.precautions),
      ingredientNote: { title: text(ingredient.title, 80), text: text(ingredient.text, 400) },
      sourceNote: text(o.sourceNote, 400),
      layout,
      tone,
      related: list(o.related, 6).map((s) => slugify(s)),
      variants,
      image: image(o.image),
      cutout: image(o.cutout),
      gallery: (Array.isArray(o.gallery) ? o.gallery : []).map(image).filter((x): x is ImageAsset => Boolean(x)).slice(0, 12),
    },
  };
}

/** Fusionne les champs du formulaire dans le produit existant (les champs non éditables sont conservés). */
export function applyInput(existing: Product | undefined, input: ProductInput, mainImage: ImageAsset): Product {
  const opt = <T,>(arr: T[]) => (arr.length ? arr : undefined);
  const str = (s: string) => s || undefined;
  const variants: PriceVariant[] | undefined = opt(
    input.variants.map((v) => {
      const before = existing?.variants?.find((x) => x.id === v.id);
      return { id: v.id, label: v.label, detail: v.detail, price: v.price ?? input.price ?? 0, image: before?.image ?? mainImage };
    }),
  );
  return {
    ...(existing ?? { cataloguePage: null, related: [] }),
    slug: input.slug,
    name: input.name,
    packagingName: input.packagingName || input.name,
    collection: input.collection,
    hidden: input.hidden || undefined,
    price: input.price,
    variants,
    format: str(input.format),
    catalogueCategory: str(input.catalogueCategory),
    tagline: input.tagline,
    intro: str(input.intro),
    signature: str(input.signature),
    benefitsTitle: str(input.benefitsTitle),
    benefits: input.benefits,
    highlights: opt(input.highlights),
    composition: opt(input.composition),
    usage: opt(input.usage),
    forWhom: opt(input.forWhom),
    plus: opt(input.plus),
    routine: opt(input.routine),
    precautions: opt(input.precautions),
    ingredientNote: input.ingredientNote.title || input.ingredientNote.text ? input.ingredientNote : undefined,
    sourceNote: str(input.sourceNote),
    layout: input.layout,
    tone: input.tone,
    related: input.related,
    image: { ...mainImage, alt: mainImage.alt || input.name },
    cutout: input.cutout ?? undefined,
    gallery: input.gallery,
  } as Product;
}
