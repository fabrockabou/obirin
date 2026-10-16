// Envoi automatique des demandes du site sur WhatsApp (serveur uniquement).
//
// Deux services possibles, choisis dans /admin/reglages :
//  • CallMeBot (gratuit) — le message arrive sur votre WhatsApp, envoyé par le robot CallMeBot.
//    Il suffit de la clé reçue en écrivant au robot depuis le numéro destinataire.
//  • API officielle Meta (WhatsApp Cloud API) — envoi depuis votre numéro professionnel enregistré
//    chez Meta, via un modèle de message validé. Identifiants dans les variables d'environnement :
//      WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TEMPLATE (défaut « nouvelle_demande »),
//      WHATSAPP_TEMPLATE_LANG (défaut « fr »).
import type { ContactRequest, NotifyResult, SiteSettings } from "@/data/types";
import { normalizeWhatsapp } from "./whatsapp";

const TIMEOUT_MS = 8000;
// adresses surchargeables (tests, proxy)
const CALLMEBOT_URL = process.env.WHATSAPP_CALLMEBOT_URL || "https://api.callmebot.com/whatsapp.php";
const GRAPH_URL = process.env.WHATSAPP_GRAPH_URL || "https://graph.facebook.com/v21.0";

const sujets: Record<string, string> = { produit: "Demande produit", "rendez-vous": "Demande de rendez-vous", question: "Question" };

/** Texte envoyé pour une demande : tout ce qu'a saisi le visiteur, dont son numéro, + lien pour lui répondre. */
export function requestMessage(r: Omit<ContactRequest, "id">) {
  const phone = normalizeWhatsapp(r.telephone);
  return [
    `Nouvelle demande — site Obirin`,
    `${sujets[r.sujet] ?? "Demande"}`,
    `Nom : ${r.nom}`,
    r.telephone && `Téléphone : ${r.telephone}`,
    r.email && `E-mail : ${r.email}`,
    r.produitNom && `Produit : ${r.produitNom}${r.variante ? ` (${r.variante})` : ""}`,
    r.serviceNom && `Service : ${r.serviceNom}`,
    r.message && `Message : ${r.message}`,
    phone.length >= 8 && `Répondre : https://wa.me/${phone}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function notifyStatus(settings: SiteSettings) {
  const to = normalizeWhatsapp(settings.notifyTo || settings.whatsappNumber);
  if (settings.notifyMode === "off") return { ready: false, reason: "Envoi automatique désactivé." };
  if (to.length < 8) return { ready: false, reason: "Aucun numéro destinataire." };
  if (settings.notifyMode === "callmebot" && !settings.callmebotApiKey) return { ready: false, reason: "Clé CallMeBot manquante." };
  if (settings.notifyMode === "meta" && !(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID))
    return { ready: false, reason: "Identifiants Meta absents du serveur (WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID)." };
  return { ready: true, to };
}

async function withTimeout(url: string, init: RequestInit) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
  } finally {
    clearTimeout(t);
  }
}

/** Envoie un texte sur WhatsApp selon les réglages. Ne lève jamais d'exception : renvoie le résultat. */
export async function sendWhatsapp(text: string, settings: SiteSettings): Promise<NotifyResult> {
  const at = new Date().toISOString();
  const status = notifyStatus(settings);
  if (!status.ready) return { ok: false, error: status.reason, at };
  const to = status.to!;
  try {
    if (settings.notifyMode === "callmebot") {
      const url = `${CALLMEBOT_URL}?phone=${encodeURIComponent(`+${to}`)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(settings.callmebotApiKey)}`;
      const res = await withTimeout(url, { method: "GET" });
      const body = (await res.text()).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      // CallMeBot répond 200 même en cas de refus : on vérifie le texte de la réponse
      if (!res.ok || !/queued|sent|currently in the queue/i.test(body) || /error|invalid|not allowed/i.test(body))
        return { ok: false, error: `CallMeBot : ${body.slice(0, 160) || res.status}`, at, via: "callmebot" };
      return { ok: true, at, via: "callmebot" };
    }

    // API officielle Meta : modèle avec un paramètre texte (les retours à la ligne y sont interdits)
    const param = text.replace(/\n+/g, " | ").replace(/\s{4,}/g, "   ").slice(0, 1000);
    const res = await withTimeout(`${GRAPH_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: process.env.WHATSAPP_TEMPLATE || "nouvelle_demande",
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "fr" },
          components: [{ type: "body", parameters: [{ type: "text", text: param }] }],
        },
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { messages?: unknown[]; error?: { message?: string } };
    if (!res.ok || !json.messages?.length) return { ok: false, error: `Meta : ${json.error?.message ?? res.status}`, at, via: "meta" };
    return { ok: true, at, via: "meta" };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return { ok: false, error: aborted ? "Délai dépassé (service WhatsApp injoignable)." : `Envoi impossible : ${e instanceof Error ? e.message : e}`, at };
  }
}
