import type { Adhesion } from "@/data/types";

export type AdhesionFields = Omit<Adhesion, "id" | "creeLe" | "modifieLe">;

/** Pays proposés dans le formulaire (saisie libre possible). */
export const PAYS = [
  "Côte d'Ivoire",
  "Burkina Faso",
  "Mali",
  "Sénégal",
  "Guinée",
  "Ghana",
  "Togo",
  "Bénin",
  "Niger",
  "Nigeria",
  "Libéria",
  "Sierra Leone",
  "Cameroun",
  "Gabon",
  "Congo",
  "RD Congo",
  "France",
];

const text = (v: FormDataEntryValue | null, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime());
/** « a@x.com, b@y.com » ou un par ligne → liste */
const splitList = (s: string) =>
  s
    .split(/[\n,;]+/)
    .map((x) => x.trim())
    .filter(Boolean);

export type AdhesionErrors = Partial<Record<keyof AdhesionFields, string>>;

export function parseAdhesion(form: FormData): { data: AdhesionFields } | { errors: AdhesionErrors } {
  const errors: AdhesionErrors = {};
  const nom = text(form.get("nom"), 80);
  const prenom = text(form.get("prenom"), 80);
  const dateNaissance = text(form.get("dateNaissance"), 10);
  const pays = text(form.get("pays"), 60);
  const emails = splitList(text(form.get("emails"), 400)).slice(0, 5);
  const telephones = splitList(text(form.get("telephones"), 300)).slice(0, 5);
  const adresse = text(form.get("adresse"), 300);
  const dateAdhesion = text(form.get("dateAdhesion"), 10);
  const adherentsRaw = text(form.get("adherentsAjoutes"), 6);
  const produitsRaw = text(form.get("produitsAchetes"), 6);
  const today = new Date().toISOString().slice(0, 10);

  if (nom.length < 2) errors.nom = "Indiquez le nom.";
  if (prenom.length < 2) errors.prenom = "Indiquez le prénom.";
  if (dateNaissance && (!isDate(dateNaissance) || dateNaissance > today || dateNaissance < "1900-01-01"))
    errors.dateNaissance = "Date de naissance invalide.";
  if (!pays) errors.pays = "Indiquez le pays.";
  if (emails.some((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))) errors.emails = "Une adresse e-mail est invalide.";
  if (telephones.some((t) => !/^[+\d][\d\s.-]{6,}$/.test(t))) errors.telephones = "Un numéro de téléphone est invalide.";
  if (!emails.length && !telephones.length) errors.telephones = "Indiquez au moins un téléphone ou un e-mail.";
  if (!isDate(dateAdhesion)) errors.dateAdhesion = "Indiquez la date d'adhésion.";
  const adherentsAjoutes = adherentsRaw === "" ? 0 : Number(adherentsRaw);
  const produitsAchetes = produitsRaw === "" ? 0 : Number(produitsRaw);
  if (!Number.isInteger(adherentsAjoutes) || adherentsAjoutes < 0) errors.adherentsAjoutes = "Nombre entier positif attendu.";
  if (!Number.isInteger(produitsAchetes) || produitsAchetes < 0) errors.produitsAchetes = "Nombre entier positif attendu.";

  if (Object.keys(errors).length) return { errors };
  return {
    data: { nom, prenom, dateNaissance, pays, emails, telephones, adresse, dateAdhesion, adherentsAjoutes, produitsAchetes },
  };
}
