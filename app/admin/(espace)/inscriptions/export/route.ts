import { currentAdmin } from "@/lib/auth";
import { getInscriptions } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Export CSV des demandes d'adhésion du site (séparateur « ; », BOM UTF-8 pour Excel). */
export async function GET() {
  if (!(await currentAdmin())) return new Response("Non autorisé", { status: 401 });
  // même protection que l'export des adhésions : pas d'interprétation comme formule dans Excel
  const cell = (v: string, phone = false) => {
    let s = v;
    if (/^[=+\-@\t\r]/.test(s)) s = phone && /^[+\d][\d\s.,+-]*$/.test(s) ? `\t${s}` : `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const header = ["Reçue le", "Nom", "Prénom", "E-mail", "Téléphone", "WhatsApp", "Adresse", "Produits qui l'intéressent"];
  const rows = getInscriptions().map((r) =>
    [r.recuLe.slice(0, 16).replace("T", " "), r.nom, r.prenom, r.email, r.telephone, r.whatsapp ?? "", r.adresse, r.produits.map((p) => p.name).join(", ")]
      .map((v, i) => cell(v, i === 4 || i === 5))
      .join(";"),
  );
  const csv = "﻿" + [header.map((h) => cell(h)).join(";"), ...rows].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="adhesions-du-site-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
