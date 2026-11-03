import { NextResponse } from "next/server";
import { sendWhatsapp } from "@/lib/notify";
import { getProduct, getSettings, markInscriptionNotified, saveInscription } from "@/lib/store";
import { inscriptionMessage } from "@/lib/inscription-message";
import { allow, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const clean = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const PHONE = /^[+\d][\d\s.-]{6,}$/;

/**
 * Réception du formulaire « Adhérer à Green World » : la demande est toujours enregistrée
 * (visible dans /admin/inscriptions), puis envoyée sur WhatsApp si l'envoi automatique est activé.
 */
export async function POST(request: Request) {
  if (!allow("adherer", clientIp(request.headers), 5, 10 * 60_000))
    return NextResponse.json({ ok: false, error: "Trop de demandes. Merci de réessayer dans quelques minutes." }, { status: 429 });
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }
  if (clean(body.site)) return NextResponse.json({ ok: true }); // robot : ignoré silencieusement

  const slugs = Array.isArray(body.produits) ? [...new Set(body.produits.filter((s): s is string => typeof s === "string"))].slice(0, 100) : [];
  const data = {
    nom: clean(body.nom, 80),
    prenom: clean(body.prenom, 80),
    email: clean(body.email, 160),
    telephone: clean(body.telephone, 40),
    whatsapp: clean(body.whatsapp, 40),
    adresse: clean(body.adresse, 400),
    produits: slugs.map((slug) => getProduct(slug)).filter((p) => p !== undefined).map((p) => ({ slug: p.slug, name: p.name })),
  };

  const errors: Record<string, string> = {};
  if (data.nom.length < 2) errors.nom = "Indiquez votre nom.";
  if (data.prenom.length < 2) errors.prenom = "Indiquez votre prénom.";
  if (!data.produits.length) errors.produits = "Choisissez au moins un produit qui vous intéresse.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Indiquez une adresse e-mail valide.";
  if (!PHONE.test(data.telephone)) errors.telephone = "Indiquez un numéro de téléphone valide.";
  if (data.whatsapp && !PHONE.test(data.whatsapp)) errors.whatsapp = "Numéro WhatsApp invalide.";
  if (data.adresse.length < 3) errors.adresse = "Indiquez votre adresse.";
  if (body.consentement !== true) errors.consentement = "Merci d'accepter d'être recontacté(e).";
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const record = { ...data, whatsapp: data.whatsapp || undefined, recuLe: new Date().toISOString() };
  let saved;
  try {
    saved = saveInscription(record);
  } catch (e) {
    console.error("[adherer] échec d'enregistrement", e);
    return NextResponse.json({ ok: false, error: "Votre demande n'a pas pu être enregistrée. Merci de réessayer plus tard." }, { status: 500 });
  }

  const settings = getSettings();
  if (settings.notifyMode && settings.notifyMode !== "off") {
    const result = await sendWhatsapp(inscriptionMessage(record), settings);
    markInscriptionNotified(saved.id, result);
    if (!result.ok) console.error("[adherer] envoi WhatsApp en échec :", result.error);
  }
  return NextResponse.json({ ok: true });
}
