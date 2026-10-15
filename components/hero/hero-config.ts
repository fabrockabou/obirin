export type HeroMode = "static" | "video" | "lite";

/**
 * Fichiers du Hero. Pour intégrer le film définitif (voir docs/hero-video-brief.md), remplacer ces
 * fichiers en conservant leurs noms, ou modifier les chemins ci-dessous.
 * Encodage recommandé pour un scrub fluide : H.264, GOP court (-g 4), sans B-frames, +faststart.
 */
export const heroSources = {
  desktop: "/videos/hero-desktop.mp4",
  /** connexions lentes (« 3g ») : 960×540, ~1,2 Mo */
  desktopLight: "/videos/hero-desktop-light.mp4",
  mobile: "/videos/hero-mobile.mp4",
  desktopPosters: { logo: "/videos/hero-desktop-poster-logo.webp", final: "/videos/hero-desktop-poster-final.webp" },
  mobilePosters: { logo: "/videos/hero-mobile-poster-logo.webp", final: "/videos/hero-mobile-poster-final.webp" },
};

/**
 * Points de synchronisation texte ↔ vidéo, exprimés en fraction de la progression du scroll
 * (0 = entrée dans le Hero, 1 = fin de la séquence). Ils correspondent aux scènes du film :
 *   0.00–0.30  ouverture + logo dans la lumière
 *   0.20–0.50  révélation du produit, la caméra se rapproche   → « manifeste »
 *   0.46–0.72  travelling latéral entre les produits           → « univers »
 *   0.70–1.00  composition finale, signature et appel à l'action → « signature »
 */
export const heroSequence: { id: string; in: number; inDur: number; out?: number }[] = [
  { id: "manifeste", in: 0.3, inDur: 0.08, out: 0.47 },
  { id: "univers", in: 0.52, inDur: 0.08, out: 0.69 },
  { id: "signature", in: 0.8, inDur: 0.1 },
];
