"use client";

/** Signale un clic WhatsApp au serveur sans retarder l'ouverture de WhatsApp (sendBeacon survit à la navigation). */
export function trackWhatsappClick(data: { source: "whatsapp-produit" | "whatsapp-flottant"; produit?: string; variante?: string }) {
  const payload = JSON.stringify({ ...data, page: window.location.pathname });
  try {
    if (navigator.sendBeacon?.("/api/whatsapp-clic", new Blob([payload], { type: "application/json" }))) return;
  } catch {
    /* repli ci-dessous */
  }
  fetch("/api/whatsapp-clic", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => undefined);
}
