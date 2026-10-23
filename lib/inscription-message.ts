import type { InscriptionAdhesion } from "@/data/types";

type Fields = Pick<InscriptionAdhesion, "nom" | "prenom" | "email" | "telephone" | "whatsapp" | "adresse"> & { produits: { name: string }[] };

/** Texte d'une demande d'adhésion : message WhatsApp (envoi automatique et message pré-rempli du visiteur). */
export function inscriptionMessage(r: Fields, greeting?: string) {
  return [
    greeting,
    "Demande d'adhésion à Green World via le site Obirin.",
    `Nom : ${r.prenom} ${r.nom}`,
    `Téléphone : ${r.telephone}`,
    r.whatsapp && `WhatsApp : ${r.whatsapp}`,
    `E-mail : ${r.email}`,
    `Adresse : ${r.adresse}`,
    r.produits.length ? `Produits qui m'intéressent : ${r.produits.map((p) => p.name).join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
