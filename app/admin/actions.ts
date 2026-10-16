"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ImageAsset } from "@/data/types";
import { endSession, loginThrottle, requireAdmin, startSession } from "@/lib/auth";
import { parseAdhesion, type AdhesionErrors, type AdhesionFields } from "@/lib/adhesion-input";
import { applyInput, parseProductInput } from "@/lib/product-input";
import {
  deleteAdhesion,
  deleteProduct,
  deleteRequest,
  getAllProducts,
  getProduct,
  getSettings,
  saveAdhesion,
  saveProduct,
  saveSettings,
  setAdmin,
  verifyAdmin,
} from "@/lib/store";
import { saveUpload } from "@/lib/uploads";
import { isValidWhatsapp, normalizeWhatsapp } from "@/lib/whatsapp";

export type FormState = { ok?: boolean; error?: string; message?: string };

/** Régénère toutes les pages publiques (accueil, boutique, collections, fiches…) après une modification. */
function refreshSite() {
  revalidatePath("/", "layout");
}

// ─────────────────────────────── Connexion ───────────────────────────────

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const throttle = await loginThrottle();
  if (throttle.blocked) return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
  const username = String(form.get("username") ?? "").slice(0, 80);
  const password = String(form.get("password") ?? "").slice(0, 200);
  if (!verifyAdmin(username, password)) {
    throttle.fail();
    return { error: "Identifiant ou mot de passe incorrect." };
  }
  throttle.reset();
  await startSession(username.trim());
  redirect("/admin/produits");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/connexion");
}

// ─────────────────────────────── Produits ───────────────────────────────

export async function saveProductAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("product") ?? "{}"));
  } catch {
    return { error: "Données du formulaire illisibles." };
  }
  const parsed = parseProductInput(raw);
  if ("error" in parsed) return { error: parsed.error };
  const { input } = parsed;
  const previousSlug = String(form.get("previousSlug") ?? "") || undefined;
  const existing = previousSlug ? getProduct(previousSlug, { includeHidden: true }) : undefined;
  if (previousSlug && !existing) return { error: "Ce produit n'existe plus." };

  try {
    // Images envoyées : principale, détourée, galerie
    const asFile = (v: FormDataEntryValue | null) => (v instanceof File && v.size > 0 ? v : null);
    const mainFile = asFile(form.get("mainImage"));
    const cutoutFile = asFile(form.get("cutoutImage"));
    let mainImage: ImageAsset | null = input.image;
    if (mainFile) mainImage = await saveUpload(mainFile, { alt: input.name });
    if (cutoutFile) input.cutout = await saveUpload(cutoutFile, { alt: input.name, cutout: true });
    for (const f of form.getAll("galleryImages")) {
      const file = asFile(f);
      if (file && input.gallery.length < 12) input.gallery.push(await saveUpload(file, { alt: input.name }));
    }
    if (!mainImage) return { error: "Ajoutez une image principale." };

    saveProduct(applyInput(existing, input, mainImage), previousSlug);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Enregistrement impossible." };
  }
  refreshSite();
  redirect(`/admin/produits/${input.slug}?enregistre=1`);
}

export async function toggleProductAction(form: FormData) {
  await requireAdmin();
  const slug = String(form.get("slug") ?? "");
  const p = getProduct(slug, { includeHidden: true });
  if (!p) return;
  saveProduct({ ...p, hidden: p.hidden ? undefined : true });
  refreshSite();
  revalidatePath("/admin/produits");
}

export async function deleteProductAction(form: FormData) {
  await requireAdmin();
  const slug = String(form.get("slug") ?? "");
  if (getAllProducts().some((p) => p.slug === slug)) deleteProduct(slug);
  refreshSite();
  redirect("/admin/produits?supprime=1");
}

// ─────────────────────────────── Réglages ───────────────────────────────

export async function saveSettingsAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const rawNumber = String(form.get("whatsappNumber") ?? "").trim();
  const whatsappNumber = normalizeWhatsapp(rawNumber);
  if (rawNumber && !isValidWhatsapp(whatsappNumber)) {
    return { error: "Numéro WhatsApp invalide : indiquez l'indicatif pays, par exemple +225 07 00 00 00 00." };
  }
  const whatsappGreeting = String(form.get("whatsappGreeting") ?? "").trim().slice(0, 120) || getSettings().whatsappGreeting;
  saveSettings({ ...getSettings(), whatsappNumber, whatsappGreeting });
  refreshSite();
  return { ok: true, message: whatsappNumber ? "Réglages enregistrés. Les boutons WhatsApp sont actifs sur le site." : "Réglages enregistrés. Aucun numéro : les boutons WhatsApp sont masqués." };
}

export async function changePasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (!verifyAdmin(user, current)) return { error: "Mot de passe actuel incorrect." };
  if (next.length < 10) return { error: "Le nouveau mot de passe doit contenir au moins 10 caractères." };
  if (next !== confirm) return { error: "La confirmation ne correspond pas." };
  setAdmin(user, next);
  // la signature des sessions dépend du mot de passe : on rouvre une session pour l'appareil actuel
  await startSession(user);
  return { ok: true, message: "Mot de passe modifié. Les autres appareils connectés ont été déconnectés." };
}

// ─────────────────────────────── Demandes ───────────────────────────────

export async function deleteRequestAction(form: FormData) {
  await requireAdmin();
  deleteRequest(String(form.get("id") ?? ""));
  revalidatePath("/admin/demandes");
}

// ─────────────────────────────── Adhésions ───────────────────────────────

export type AdhesionState = { error?: string; errors?: AdhesionErrors; values?: Partial<Record<keyof AdhesionFields, string>> };

export async function saveAdhesionAction(_prev: AdhesionState, form: FormData): Promise<AdhesionState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "") || undefined;
  const parsed = parseAdhesion(form);
  if ("errors" in parsed) {
    // on renvoie la saisie pour ne rien faire retaper
    const values = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")) as AdhesionState["values"];
    return { errors: parsed.errors, values, error: "Merci de corriger les champs indiqués." };
  }
  try {
    saveAdhesion(parsed.data, id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Enregistrement impossible." };
  }
  revalidatePath("/admin/adhesions");
  redirect(`/admin/adhesions?${id ? "modifiee" : "ajoutee"}=1`);
}

export async function deleteAdhesionAction(form: FormData) {
  await requireAdmin();
  deleteAdhesion(String(form.get("id") ?? ""));
  revalidatePath("/admin/adhesions");
  redirect("/admin/adhesions?supprimee=1");
}
