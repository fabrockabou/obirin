export const site = {
  name: "Obirin",
  fullName: "Obirin — Santé, Bien-être & Beauté",
  baseline: "Santé • Bien-être • Beauté",
  motto: "We Care, We Share",
  country: "Côte d'Ivoire",
  edition: "Catalogue produits & services — Édition octobre 2026",
  description:
    "Obirin Côte d'Ivoire : solutions naturelles de santé féminine, minceur, beauté et hygiène, et services bien-être sur rendez-vous.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  locale: "fr_CI",
  currency: "XOF",
};

export type NavItem = { label: string; href: string; children?: NavItem[] };

export const mainNav: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/boutique" },
  { label: "Nos collections", href: "/collections" },
  { label: "Beauté & Éclat", href: "/collections/beaute-eclat" },
  { label: "Santé féminine", href: "/collections/sante-feminine" },
  { label: "Minceur & Nutrition", href: "/collections/minceur-nutrition" },
  { label: "Bien-être", href: "/services" },
  { label: "Notre marque", href: "/notre-marque" },
  { label: "Contact", href: "/contact" },
];
