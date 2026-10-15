// Services bien-être — catalogue pages 20 à 22. Textes, durées et prix repris tels quels.
import { cataloguePage, img } from "./images";
import type { Service } from "./types";

export const servicesIntro = {
  title: "Nos services bien-être",
  signature: "Prendre soin de soi, c'est aussi s'accorder du temps.",
  kicker: "Santé • Bien-être • Vie équilibrée",
  points: [
    { title: "Mieux se connaître", text: "pour de meilleures habitudes de vie." },
    { title: "Être accompagné", text: "par des conseillers en santé naturelle." },
    { title: "Des solutions adaptées", text: "pour votre bien-être au quotidien." },
  ],
  pillars: [
    { title: "Détente et relaxation", text: "Retrouver un meilleur équilibre au quotidien." },
    { title: "Conseils personnalisés", text: "Des recommandations adaptées à vos besoins." },
    { title: "Prévention naturelle", text: "Adopter de bonnes habitudes pour la santé et la vitalité." },
    { title: "Bien-être pour toute la famille", text: "Des solutions pour les femmes, les hommes et les enfants." },
  ],
  image: img("/images/editorial/services-consultation.webp", "Une cliente échange avec un conseiller devant un ordinateur", { kind: "editorial" }),
  /** visuel de l'univers « Services bien-être » (accueil, index des collections) */
  collectionImage: img("/images/collections/services-bien-etre.webp", "Famille souriante réunie : parents et enfants", { kind: "editorial" }),
  pageImage: cataloguePage(19, "Page « Nos services bien-être » du catalogue", 20),
};

export const services: Service[] = [
  {
    slug: "rendez-vous-bien-etre",
    name: "Rendez-vous de bien-être",
    kicker: "Analyse & conseils",
    tagline: "Mieux se connaître pour prendre soin de soi",
    signature: "Un bilan simple, rapide et utile.",
    intro:
      "Un rendez-vous au siège Obirin pour obtenir une vision globale de votre bien-être, échanger avec un conseiller en santé naturelle et recevoir des recommandations personnalisées.",
    price: 5000,
    duration: "15 à 30 minutes (en moyenne)",
    location: "Sur rendez-vous au siège Obirin",
    points: [
      { title: "Une vision globale de votre bien-être", text: "Un rapport sur une quarantaine de rubriques clés." },
      { title: "Des informations personnalisées", text: "Des résultats clairs pour mieux comprendre votre état de bien-être." },
      { title: "Des conseils adaptés", text: "Recommandations simples et naturelles pour de meilleures habitudes de vie." },
      { title: "Un accompagnement professionnel", text: "Échange avec un conseiller en santé naturelle." },
    ],
    domains: [
      "Cœur et circulation",
      "Foie et détoxification",
      "Digestion et intestins",
      "Immunité et défenses naturelles",
      "Articulations et os",
      "Système nerveux",
      "Respiration",
      "Équilibre hormonal",
      "Peau et cheveux",
      "Métabolisme et énergie",
    ],
    receive: [
      "Un rapport détaillé (≈ 30 à 40 rubriques)",
      "Un échange avec un conseiller en santé naturelle",
      "Des recommandations personnalisées (alimentation, hygiène de vie, solutions naturelles)",
    ],
    image: img("/images/editorial/rendez-vous-analyse.webp", "Un conseiller présente un rapport de bien-être sur un ordinateur", { kind: "editorial" }),
    secondaryImage: img("/images/editorial/services-consultation.webp", "Une cliente souriante pendant son rendez-vous", { kind: "editorial" }),
    pageImage: cataloguePage(20, "Page « Votre rendez-vous de bien-être » du catalogue", 21),
    cataloguePage: 21,
  },
  {
    slug: "bain-ionique-des-pieds",
    name: "Bain ionique des pieds",
    kicker: "Détente • Équilibre • Vitalité",
    tagline: "Une solution naturelle pour votre bien-être global",
    signature: "Un moment de détente pour un corps plus léger.",
    intro:
      "Installée confortablement, les pieds dans un bain d'eau tiède, vous profitez d'environ 30 minutes de détente pendant que l'appareil fonctionne.",
    price: 5000,
    duration: "Environ 30 minutes",
    location: "Sur rendez-vous au siège Obirin",
    points: [
      { title: "Favorise la détente", text: "Aide à réduire la fatigue et le stress." },
      { title: "Soutient la circulation", text: "Contribue à une meilleure circulation sanguine." },
      { title: "Aide à l'élimination des toxines", text: "Soutient les processus naturels d'élimination." },
      { title: "Redonne de l'énergie", text: "Une sensation de légèreté et de bien-être." },
    ],
    steps: [
      { title: "Installation confortable", text: "Vous vous installez confortablement, les pieds dans un bain d'eau tiède." },
      { title: "Séance de bain ionique", text: "L'appareil fonctionne pendant environ 30 minutes." },
      { title: "Moment de détente", text: "Vous profitez d'un moment de relaxation." },
      { title: "Résultats visibles dans l'eau", text: "Début de séance, fin de séance : la couleur de l'eau peut varier d'une personne à l'autre." },
    ],
    reassurance: { title: "Une méthode douce, sûre et confortable", text: "Adaptée à tous, même aux personnes sensibles." },
    image: img("/images/editorial/bain-ionique.webp", "Une cliente détendue, les pieds dans un bain ionique", { kind: "editorial" }),
    secondaryImage: img("/images/editorial/bain-ionique-bassin.webp", "Bassin du bain ionique", { kind: "editorial" }),
    pageImage: cataloguePage(21, "Page « Bain ionique des pieds » du catalogue", 22),
    cataloguePage: 22,
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
