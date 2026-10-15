import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getProduct } from "@/data/products";
import { getService } from "@/data/services";

export const runtime = "nodejs";

type Payload = {
  nom?: string;
  telephone?: string;
  email?: string;
  sujet?: string;
  produit?: string;
  variante?: string;
  service?: string;
  message?: string;
  consentement?: boolean;
  site?: string; // champ piège anti-spam (doit rester vide)
};

const clean = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Réception des demandes (information produit, rendez-vous, question).
 * - Si CONTACT_WEBHOOK_URL est défini, la demande est transmise en JSON à ce webhook (CRM, e-mail, WhatsApp Business…).
 * - Sinon, elle est enregistrée dans data/.requests/ (fonctionne sur un serveur Node ; pas sur un hébergement sans disque).
 * La réponse n'indique un succès que si l'une de ces deux opérations a réellement abouti.
 */
export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }
  if (clean(body.site)) return NextResponse.json({ ok: true }); // robot : ignoré silencieusement

  const data = {
    nom: clean(body.nom, 120),
    telephone: clean(body.telephone, 40),
    email: clean(body.email, 160),
    sujet: clean(body.sujet, 40),
    produit: clean(body.produit, 80),
    variante: clean(body.variante, 40),
    service: clean(body.service, 80),
    message: clean(body.message, 3000),
  };

  const errors: Record<string, string> = {};
  if (data.nom.length < 2) errors.nom = "Indiquez votre nom.";
  if (!data.telephone && !data.email) errors.telephone = "Indiquez un téléphone ou un e-mail pour être recontacté(e).";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Adresse e-mail invalide.";
  if (data.telephone && !/^[+\d][\d\s.-]{6,}$/.test(data.telephone)) errors.telephone = "Numéro de téléphone invalide.";
  if (data.produit && !getProduct(data.produit)) errors.produit = "Produit inconnu.";
  if (data.service && !getService(data.service)) errors.service = "Service inconnu.";
  if (!body.consentement) errors.consentement = "Merci d'accepter d'être recontacté(e).";
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const record = {
    ...data,
    produitNom: data.produit ? getProduct(data.produit)?.name : undefined,
    serviceNom: data.service ? getService(data.service)?.name : undefined,
    recuLe: new Date().toISOString(),
  };

  try {
    const webhook = process.env.CONTACT_WEBHOOK_URL;
    if (webhook) {
      const res = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } else {
      const dir = path.join(process.cwd(), "data", ".requests");
      await fs.mkdir(dir, { recursive: true });
      const file = path.join(dir, `${record.recuLe.replace(/[:.]/g, "-")}-${Math.random().toString(36).slice(2, 8)}.json`);
      await fs.writeFile(file, JSON.stringify(record, null, 2), "utf8");
    }
  } catch (e) {
    console.error("[contact] échec d'enregistrement", e);
    return NextResponse.json({ ok: false, error: "Votre demande n'a pas pu être enregistrée. Merci de réessayer plus tard." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
