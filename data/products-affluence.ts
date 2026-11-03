// Produits Affluence Global. Textes repris de l'emballage : aucune allégation de santé n'est ajoutée au-delà de la
// mention imprimée (« A natural immune system support »).
import { img } from "./images";
import type { Product } from "./types";

export const affluenceProducts: Product[] = [
  {
    slug: "double-red-rose",
    name: "Double Red Rose",
    packagingName: "CelGen12™ Double Red Rose — Red Superfoods Antioxidant",
    collection: "autres-references",
    price: 87500,
    format: "Lot de 3 boîtes — 10 ml × 15 sachets chacune",
    cataloguePage: null,
    tagline: "Red Superfoods Antioxidant",
    intro:
      "Une boisson antioxydante aux fruits rouges en sachets individuels de 10 ml (boîte de 15), de la gamme CelGen12™ d'Affluence Global. Sur l'emballage : « A natural immune system support » (un soutien naturel du système immunitaire).",
    benefits: [{ title: "Soutien naturel du système immunitaire", text: "Mention figurant sur l'emballage." }],
    highlights: ["Boîte de 15 sachets de 10 ml", "Durée de conservation : 24 mois", "Fabriqué en Chine"],
    image: img("/images/products/double-red-rose.webp", "Boîte et sachet Double Red Rose CelGen12 Affluence Global, 10 ml × 15", { kind: "packshot" }),
    gallery: [img("/images/products/double-red-rose-sachets.webp", "Boîtes et sachets Double Red Rose CelGen12 Affluence Global", { kind: "packshot" })],
    layout: "split",
    tone: "fuchsia",
    related: [],
    precautions: [
      "Complément alimentaire : il ne remplace ni un traitement médical ni une alimentation variée et équilibrée.",
      "Femmes enceintes ou allaitantes, ou personnes sous traitement : demander l'avis d'un professionnel de santé.",
    ],
    brand: "Affluence Global",
    source: "Informations issues de l'emballage fourni (distributeur : Affluence Global Ltd). Prix : 87 500 FCFA le lot de 3 boîtes.",
  },
];
