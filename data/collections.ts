import { img } from "./images";
import type { Collection } from "./types";

// Les intitulés reprennent les rubriques de la couverture du catalogue (Santé féminine, Silhouette &
// minceur, Beauté & éclat, Hygiène au quotidien, Services bien-être). Les textes de description
// sont repris des pages de présentation (pages 2, 3 et 13) quand elles existent.
export const collections: Collection[] = [
  {
    slug: "sante-feminine",
    name: "Santé féminine",
    kicker: "Santé & équilibre féminin",
    description:
      "Un chapitre consacré aux besoins essentiels de la femme, à chaque étape de sa vie. Se connaître, s'écouter, prendre soin de soi.",
    quote: "Une approche naturelle et globale pour la santé et le bien-être des femmes.",
    pillars: [
      { title: "Seins", text: "Confort & attention" },
      { title: "Équilibre féminin", text: "Harmonie au quotidien" },
      { title: "Cycle", text: "Mieux vivre chaque étape" },
      { title: "Intimité", text: "Hygiène & confort" },
      { title: "Vitalité", text: "Énergie & bien-être" },
    ],
    image: img("/images/collections/sante-feminine.webp", "Femme souriante et détendue, installée dans un canapé", { kind: "editorial" }),
    tone: "fuchsia",
  },
  {
    slug: "minceur-nutrition",
    name: "Minceur & Nutrition",
    kicker: "Silhouette & minceur",
    description:
      "Des plantes sélectionnées et une fibre d'origine marine pour accompagner un programme minceur, dans le cadre d'une alimentation équilibrée et d'un mode de vie sain.",
    quote: "Ma silhouette, ma confiance.",
    image: img("/images/collections/minceur-nutrition.webp", "Femme rayonnante aux cheveux bouclés, peau lumineuse", { kind: "editorial" }),
    tone: "rose",
  },
  {
    slug: "beaute-eclat",
    name: "Beauté & Éclat",
    kicker: "Une beauté naturelle qui vient de l'intérieur",
    description:
      "Nos solutions à base d'ingrédients naturels vous accompagnent pour prendre soin de votre peau, de vos cheveux, de vos ongles et de votre bien-être général.",
    pillars: [
      { title: "Peau", text: "plus éclatante" },
      { title: "Cheveux", text: "plus forts" },
      { title: "Ongles", text: "plus solides" },
      { title: "Bien-être", text: "général" },
    ],
    image: img("/images/collections/beaute-eclat.webp", "Portrait beauté d'une femme au teint éclatant, la main sur la joue", { kind: "editorial" }),
    tone: "violet",
  },
  {
    slug: "soins-capillaires",
    name: "Soins capillaires",
    kicker: "Répare • Nourrit • Embellit",
    description: "Des cheveux plus forts, plus sains et plus éclatants, avec la kératine et des extraits naturels de plantes.",
    image: img("/images/collections/soins-capillaires.webp", "Femme aux longs cheveux ondulés et brillants", { kind: "editorial" }),
    tone: "ivory",
  },
  {
    slug: "hygiene-soin-quotidien",
    name: "Hygiène & soin quotidien",
    kicker: "Hygiène au quotidien",
    description: "Fraîcheur, confort et protection au quotidien : serviettes hygiéniques jour et nuit, savon à l'huile d'olive et au miel.",
    image: img("/images/collections/hygiene-soin-quotidien.webp", "Femme souriante, cheveux dans une serviette blanche après le bain", { kind: "editorial" }),
    tone: "olive",
  },
  {
    slug: "monbio",
    name: "Monbio",
    kicker: "Savons de Marseille, coton & senteurs",
    description:
      "Savons liquides de Marseille, coton hydrophile pur et sachets parfumés : la gamme Monbio pour le soin du corps, l'hygiène au quotidien et le parfum de la maison.",
    pillars: [
      { title: "Savons", text: "de Marseille, 1 L" },
      { title: "Coton", text: "100 % pur coton" },
      { title: "Visage", text: "disques démaquillants" },
      { title: "Senteurs", text: "sachets & papiers parfumés" },
    ],
    image: img("/images/collections/monbio.webp", "Gamme de savons liquides de Marseille Monbio", { kind: "editorial" }),
    tone: "honey",
  },
  {
    slug: "spiritual-help",
    name: "Spiritual Help",
    kicker: "Spiritualité & paix intérieure",
    description: "Un espace dédié à l'accompagnement spirituel et au mieux-être intérieur. Les produits de cette collection seront bientôt présentés ici.",
    image: img("/images/collections/spiritual-help.webp", "Halo doré et cercles lumineux sur fond violet nuit", { kind: "editorial" }),
    tone: "violet",
  },
  {
    slug: "autres-references",
    name: "Autres références",
    kicker: "Hors catalogue d'octobre",
    description:
      "Références Green World dont nous disposons du visuel, mais qui ne figurent pas dans le catalogue d'octobre 2026. Prix et disponibilité sur demande.",
    image: img("/images/collections/autres-references.webp", "Femme souriante aux cheveux bouclés relevés, tons chauds", { kind: "editorial" }),
    tone: "emerald",
  },
];

export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);
