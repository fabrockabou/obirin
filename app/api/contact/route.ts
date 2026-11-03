import { NextResponse } from "next/server";
import { requestMessage, sendWhatsapp } from "@/lib/notify";
import { getProduct, getSettings, markRequestNotified, saveRequest } from "@/lib/store";
import { getService } from "@/data/services";
import { allow, clientIp } from "@/lib/rate-limit";

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
 * - Elle est toujours enregistrée dans le stockage du site (consultable dans /admin/demandes).
 * La réponse n'indique un succès que si l'une de ces deux opérations a réellement abouti.
 */
export async function POST(request: Request) {
  if (!allow("contact", clientIp(request.headers), 5, 10 * 60_000))
    return NextResponse.json({ ok: false, error: "Trop de demandes. Merci de réessayer dans quelques minutes." }, { status: 429 });
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

  // 1) la demande est toujours enregistrée (visible dans /admin/demandes)
  let saved;
  try {
    saved = saveRequest(record);
  } catch (e) {
    console.error("[contact] échec d'enregistrement", e);
    return NextResponse.json({ ok: false, error: "Votre demande n'a pas pu être enregistrée. Merci de réessayer plus tard." }, { status: 500 });
  }
  // 2) envoi automatique sur WhatsApp (si configuré dans /admin/reglages) — un échec ne perd pas la demande
  const whatsapp = await sendWhatsapp(requestMessage(record), getSettings());
  if (getSettings().notifyMode !== "off") {
    markRequestNotified(saved.id, whatsapp);
    if (!whatsapp.ok) console.error("[contact] envoi WhatsApp en échec :", whatsapp.error);
  }

  // 3) transmission facultative à un webhook (e-mail, CRM…) — un échec ici ne perd pas la demande
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } catch (e) {
      console.error("[contact] webhook en échec (demande conservée dans l'administration)", e);
    }
  }

  return NextResponse.json({ ok: true });
}
