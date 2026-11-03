import manifest from "./image-manifest.json";
import type { ImageAsset } from "./types";

const sizes = manifest as unknown as Record<string, [number, number]>;

/** Construit un ImageAsset avec ses dimensions réelles (générées par scripts/build-assets.mjs). */
export function img(src: string, alt: string, extra: Partial<ImageAsset> = {}): ImageAsset {
  const size = sizes[src];
  if (!size) throw new Error(`Image absente du manifeste : ${src} (lancer npm run assets)`);
  return { src, alt, width: size[0], height: size[1], ...extra };
}

/** Page complète du catalogue PDF (numéro de page du fichier PDF). */
export function cataloguePage(pdfPage: number, alt: string, printed?: number): ImageAsset {
  return img(`/images/catalogue/page-${String(pdfPage).padStart(2, "0")}.webp`, alt, {
    kind: "page",
    caption: `Fiche du catalogue Green World — octobre 2026${printed ? `, page ${printed}` : ""}`,
  });
}

