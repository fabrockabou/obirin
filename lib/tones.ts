import type { ProductTone } from "@/data/types";

/** Palette d'ambiance par fiche, dérivée des couleurs réelles des emballages. */
export const tones: Record<ProductTone, { soft: string; deep: string; accent: string }> = {
  rose: { soft: "#f6e3e8", deep: "#5b1d36", accent: "#c2185b" },
  fuchsia: { soft: "#f3d6e1", deep: "#4f0d29", accent: "#c2185b" },
  emerald: { soft: "#e1eae2", deep: "#0a2a1d", accent: "#1c6b4b" },
  violet: { soft: "#e9e3f1", deep: "#251a3d", accent: "#6d3fa8" },
  honey: { soft: "#f6ead0", deep: "#4a2f0a", accent: "#c27a12" },
  olive: { soft: "#eceedb", deep: "#28331a", accent: "#6b7d2c" },
  ivory: { soft: "#f1e9dc", deep: "#1d231f", accent: "#8a6d3b" },
  ocean: { soft: "#dfe8ef", deep: "#0f2a3d", accent: "#1f5f8b" },
};
