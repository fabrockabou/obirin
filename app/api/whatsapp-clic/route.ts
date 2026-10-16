import { NextResponse } from "next/server";
import { getProduct, saveRequest } from "@/lib/store";

export const runtime = "nodejs";

// Limitation simple : 30 clics enregistrés par minute et par adresse IP (évite le remplissage abusif).
const hits = new Map<string, { n: number; until: number }>();

/**
 * Enregistre dans « Demandes reçues » un clic sur un bouton WhatsApp du site (fiche produit ou bouton
 * flottant). Le visiteur écrit ensuite depuis son propre WhatsApp : son nom et son numéro arrivent là-bas.
 */
export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  const now = Date.now();
  const h = hits.get(ip);
  if (h && h.until > now && h.n >= 30) return new NextResponse(null, { status: 204 });
  hits.set(ip, h && h.until > now ? { n: h.n + 1, until: h.until } : { n: 1, until: now + 60_000 });

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const source = body.source === "whatsapp-produit" ? "whatsapp-produit" : "whatsapp-flottant";
  const slug = text(body.produit, 80);
  const product = slug ? getProduct(slug) : undefined;
  const variante = product?.variants?.some((v) => v.id === body.variante) ? text(body.variante, 40) : "";
  const page = text(body.page, 200);

  saveRequest({
    nom: "",
    telephone: "",
    email: "",
    sujet: source === "whatsapp-produit" ? "produit" : "question",
    produit: product?.slug ?? "",
    produitNom: product?.name,
    variante,
    service: "",
    message: "",
    recuLe: new Date().toISOString(),
    source,
    page: page.startsWith("/") ? page : "",
  });
  return new NextResponse(null, { status: 204 });
}
