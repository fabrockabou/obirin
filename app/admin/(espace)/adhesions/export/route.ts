import { currentAdmin } from "@/lib/auth";
import { filterAdhesions } from "@/lib/adhesion-filter";
import { adhesionsPdf } from "@/lib/adhesion-pdf";
import { getAdhesions } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Export des adhésions (respecte la recherche et le filtre pays) :
 *  ?format=pdf → PDF A4 paysage ; sinon CSV (séparateur « ; », BOM UTF-8 pour Excel).
 */
export async function GET(request: Request) {
  if (!(await currentAdmin())) return new Response("Non autorisé", { status: 401 });
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").slice(0, 80);
  const pays = (url.searchParams.get("pays") ?? "").slice(0, 60);
  const list = filterAdhesions(getAdhesions(), q, pays);
  const date = new Date().toISOString().slice(0, 10);

  if (url.searchParams.get("format") === "pdf") {
    const pdf = await adhesionsPdf(list, { filtre: [q && `« ${q} »`, pays].filter(Boolean).join(", ") });
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="adhesions-obirin-${date}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // Protection contre l'interprétation comme formule dans Excel (« +225… », « =… ») : les téléphones
  // (chiffres, espaces, +) reçoivent une tabulation invisible en tête, les autres valeurs une apostrophe.
  const cell = (v: string | number, phone = false) => {
    let s = String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = phone && /^[+\d][\d\s.,+-]*$/.test(s) ? `\t${s}` : `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const header = ["Nom", "Prénom", "Date de naissance", "Pays", "E-mails", "Téléphones", "Adresse", "Date d'adhésion", "Adhérents ajoutés", "Produits achetés"];
  const rows = list.map((a) =>
    [a.nom, a.prenom, a.dateNaissance, a.pays, a.emails.join(", "), a.telephones.join(", "), a.adresse, a.dateAdhesion, a.adherentsAjoutes, a.produitsAchetes]
      .map((v, i) => cell(v, i === 5))
      .join(";"),
  );
  const csv = "﻿" + [header.map((h) => cell(h)).join(";"), ...rows].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="adhesions-obirin-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
