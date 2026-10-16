import type { Adhesion } from "@/data/types";

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Filtre partagé entre la liste et l'export : recherche libre + pays. */
export function filterAdhesions(list: Adhesion[], q = "", pays = "") {
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  return list.filter((a) => {
    if (pays && a.pays !== pays) return false;
    if (!terms.length) return true;
    const hay = normalize([a.nom, a.prenom, a.pays, a.adresse, ...a.emails, ...a.telephones].join(" "));
    return terms.every((t) => hay.includes(t) || hay.replace(/\s/g, "").includes(t));
  });
}
