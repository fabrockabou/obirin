export type ImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** "packshot": photo isolée fournie par Green World ; "catalogue": extrait d'une page du catalogue PDF */
  kind?: "packshot" | "detoure" | "catalogue" | "page" | "editorial";
  caption?: string;
};

export type Benefit = { title: string; text?: string };

export type PriceVariant = { id: string; label: string; detail: string; price: number; image: ImageAsset };

/** Mises en page disponibles pour les fiches produits (alternées pour éviter la monotonie). */
export type ProductLayout = "editorial" | "immersive" | "split" | "portrait";

/** Couleur d'ambiance de la fiche, dérivée de l'emballage réel. */
export type ProductTone = "rose" | "fuchsia" | "emerald" | "violet" | "honey" | "olive" | "ivory" | "ocean";

export type CollectionSlug =
  | "sante-feminine"
  | "minceur-nutrition"
  | "beaute-eclat"
  | "soins-capillaires"
  | "hygiene-soin-quotidien"
  | "autres-references";

export type Product = {
  slug: string;
  /** Nom exact utilisé dans le catalogue */
  name: string;
  /** Nom imprimé sur l'emballage */
  packagingName: string;
  collection: CollectionSlug;
  /** Prix client en FCFA ; null quand le catalogue ne communique pas de prix */
  price: number | null;
  variants?: PriceVariant[];
  format?: string;
  /** Catégorie telle qu'écrite dans le catalogue, si indiquée */
  catalogueCategory?: string;
  /** Numéro de page imprimé dans le catalogue (null = hors catalogue) */
  cataloguePage: number | null;
  /** Fichier de page correspondant dans /images/catalogue */
  pageImage?: ImageAsset;
  tagline: string;
  intro?: string;
  signature?: string;
  benefitsTitle?: string;
  benefits: Benefit[];
  highlights?: string[];
  ingredientNote?: { title: string; text: string };
  plants?: { name: string; latin?: string }[];
  forWhom?: string[];
  composition?: string[];
  usage?: string[];
  routine?: string[];
  plus?: string[];
  precautions?: string[];
  associations?: { text: string; slug?: string }[];
  image: ImageAsset;
  /** Version détourée (fond transparent) quand un packshot isolé existe */
  cutout?: ImageAsset;
  gallery: ImageAsset[];
  editorial?: ImageAsset;
  layout: ProductLayout;
  tone: ProductTone;
  related: string[];
  sourceNote?: string;
  /** Masqué du site (géré depuis l'administration) */
  hidden?: boolean;
  /** Date de dernière modification depuis l'administration (ISO) */
  updatedAt?: string;
};

export type Collection = {
  slug: CollectionSlug;
  name: string;
  kicker: string;
  description: string;
  image: ImageAsset;
  /** Texte source du catalogue repris en exergue, si disponible */
  quote?: string;
  pillars?: { title: string; text: string }[];
  tone: ProductTone;
};

export type Service = {
  slug: string;
  name: string;
  kicker: string;
  tagline: string;
  signature?: string;
  intro: string;
  price: number;
  duration: string;
  location: string;
  points: Benefit[];
  domains?: string[];
  receive?: string[];
  steps?: { title: string; text: string; image?: ImageAsset }[];
  note?: string;
  reassurance?: { title: string; text: string };
  image: ImageAsset;
  secondaryImage?: ImageAsset;
  pageImage: ImageAsset;
  cataloguePage: number;
};

export type SiteSettings = {
  /** Numéro WhatsApp Business au format international, chiffres uniquement (ex. 2250700000000). Vide = boutons masqués. */
  whatsappNumber: string;
  /** Phrase d'accroche ajoutée en tête des messages WhatsApp pré-remplis */
  whatsappGreeting: string;
  /** Envoi automatique des demandes sur WhatsApp : désactivé, CallMeBot (gratuit) ou API officielle Meta */
  notifyMode: "off" | "callmebot" | "meta";
  /** Numéro qui reçoit les demandes automatiques (chiffres, indicatif inclus). Vide = numéro WhatsApp Business ci-dessus. */
  notifyTo: string;
  /** Clé CallMeBot (reçue en écrivant au robot CallMeBot depuis le numéro destinataire) */
  callmebotApiKey: string;
};

export type NotifyResult = { ok: boolean; error?: string; at: string; via?: string };

export type ContactRequest = {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  sujet: string;
  produit: string;
  produitNom?: string;
  variante: string;
  service: string;
  serviceNom?: string;
  message: string;
  recuLe: string;
  /** Résultat de l'envoi automatique sur WhatsApp */
  whatsapp?: NotifyResult;
};

/** Adhésion saisie depuis l'administration (indépendante du site public). */
export type Adhesion = {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string; // AAAA-MM-JJ
  pays: string;
  emails: string[];
  telephones: string[];
  adresse: string;
  dateAdhesion: string; // AAAA-MM-JJ
  adherentsAjoutes: number;
  produitsAchetes: number;
  creeLe: string;
  modifieLe: string;
};
