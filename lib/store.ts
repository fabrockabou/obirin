// Stockage modifiable du site (serveur uniquement).
//
// Les données vivent dans des fichiers JSON sous OBIRIN_STORE_DIR (par défaut data/store/) :
//   products.json  — tous les produits (copie initiale de data/products.ts au premier démarrage)
//   settings.json  — réglages (numéro WhatsApp…)
//   admin.json     — identifiant + empreinte du mot de passe administrateur
//   requests/      — demandes envoyées par le formulaire de contact
//   uploads/       — images envoyées depuis l'administration (servies par /media/…)
// Ce dossier doit être sur un disque persistant et sauvegardé : il n'est pas versionné dans Git.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { defaultProducts } from "@/data/products";
import type { CollectionSlug, ContactRequest, Product, SiteSettings } from "@/data/types";

export const STORE_DIR = path.resolve(process.env.OBIRIN_STORE_DIR || path.join(process.cwd(), "data", "store"));
export const UPLOAD_DIR = path.join(STORE_DIR, "uploads");
const REQUEST_DIR = path.join(STORE_DIR, "requests");
const file = (name: string) => path.join(STORE_DIR, name);

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Écriture atomique : fichier temporaire puis renommage, pour ne jamais laisser un JSON à moitié écrit. */
function writeJSON(name: string, data: unknown) {
  ensureDir(STORE_DIR);
  const target = file(name);
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, target);
  cache.delete(name);
}

const cache = new Map<string, { mtime: number; value: unknown }>();
function readJSON<T>(name: string, fallback: () => T): T {
  const target = file(name);
  let stat: fs.Stats;
  try {
    stat = fs.statSync(target);
  } catch {
    const value = fallback();
    writeJSON(name, value);
    return value;
  }
  const hit = cache.get(name);
  if (hit && hit.mtime === stat.mtimeMs) return hit.value as T;
  const value = JSON.parse(fs.readFileSync(target, "utf8")) as T;
  cache.set(name, { mtime: stat.mtimeMs, value });
  return value;
}

// ─────────────────────────────── Produits ───────────────────────────────

/** Tous les produits, y compris masqués (administration). */
export function getAllProducts(): Product[] {
  return readJSON<Product[]>("products.json", () => structuredClone(defaultProducts));
}

/** Produits visibles sur le site. */
export function getProducts(): Product[] {
  return getAllProducts().filter((p) => !p.hidden);
}

export function getProduct(slug: string, { includeHidden = false } = {}): Product | undefined {
  return (includeHidden ? getAllProducts() : getProducts()).find((p) => p.slug === slug);
}

export function productsIn(collection: CollectionSlug): Product[] {
  return getProducts().filter((p) => p.collection === collection);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Crée ou remplace un produit. `previousSlug` permet de renommer l'adresse d'un produit existant. */
export function saveProduct(product: Product, previousSlug?: string) {
  const all = getAllProducts();
  const from = previousSlug ?? product.slug;
  const clash = all.find((p) => p.slug === product.slug && p.slug !== from);
  if (clash) throw new Error(`L'adresse « ${product.slug} » est déjà utilisée par « ${clash.name} ».`);
  const next = { ...product, updatedAt: new Date().toISOString() };
  const index = all.findIndex((p) => p.slug === from);
  if (index >= 0) all[index] = next;
  else all.push(next);
  // si l'adresse change, on met à jour les liens « produits associés » des autres fiches
  if (previousSlug && previousSlug !== product.slug) {
    for (const p of all) {
      p.related = p.related.map((r) => (r === previousSlug ? product.slug : r));
      p.associations = p.associations?.map((a) => (a.slug === previousSlug ? { ...a, slug: product.slug } : a));
    }
  }
  writeJSON("products.json", all);
}

export function deleteProduct(slug: string) {
  const all = getAllProducts().filter((p) => p.slug !== slug);
  for (const p of all) {
    p.related = p.related.filter((r) => r !== slug);
    p.associations = p.associations?.map((a) => (a.slug === slug ? { text: a.text } : a));
  }
  writeJSON("products.json", all);
}

// ─────────────────────────────── Réglages ───────────────────────────────

const defaultSettings: SiteSettings = {
  whatsappNumber: "",
  whatsappGreeting: "Bonjour Obirin,",
};

export function getSettings(): SiteSettings {
  return { ...defaultSettings, ...readJSON<Partial<SiteSettings>>("settings.json", () => ({ ...defaultSettings })) };
}

export function saveSettings(settings: SiteSettings) {
  writeJSON("settings.json", settings);
}

// ─────────────────────────────── Administrateur ───────────────────────────────

type AdminRecord = { username: string; salt: string; hash: string; updatedAt: string };

function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function adminExists() {
  return fs.existsSync(file("admin.json"));
}

export function setAdmin(username: string, password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  writeJSON("admin.json", { username, salt, hash: hashPassword(password, salt), updatedAt: new Date().toISOString() } satisfies AdminRecord);
}

/** Change à chaque nouveau mot de passe : invalide automatiquement les sessions ouvertes. */
export function getAdminVersion() {
  return adminExists() ? readJSON<AdminRecord>("admin.json", () => ({}) as AdminRecord).updatedAt : null;
}

export function getAdminUsername() {
  return adminExists() ? readJSON<AdminRecord>("admin.json", () => ({}) as AdminRecord).username : null;
}

/** Vérifie les identifiants en temps constant. */
export function verifyAdmin(username: string, password: string) {
  if (!adminExists()) return false;
  const rec = readJSON<AdminRecord>("admin.json", () => ({}) as AdminRecord);
  const expected = Buffer.from(rec.hash, "hex");
  const actual = Buffer.from(hashPassword(password, rec.salt), "hex");
  const userOk = crypto.timingSafeEqual(
    crypto.createHash("sha256").update(username.trim().toLowerCase()).digest(),
    crypto.createHash("sha256").update(rec.username.trim().toLowerCase()).digest(),
  );
  return crypto.timingSafeEqual(expected, actual) && userOk;
}

/** Secret de signature des sessions : SESSION_SECRET, sinon généré une fois et conservé dans le stockage. */
export function getSessionSecret() {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32) return process.env.SESSION_SECRET;
  const target = file("session-secret.key");
  if (!fs.existsSync(target)) {
    ensureDir(STORE_DIR);
    fs.writeFileSync(target, crypto.randomBytes(48).toString("hex"), { encoding: "utf8", mode: 0o600 });
  }
  return fs.readFileSync(target, "utf8").trim();
}

// ─────────────────────────────── Demandes de contact ───────────────────────────────

export function saveRequest(request: Omit<ContactRequest, "id">): ContactRequest {
  ensureDir(REQUEST_DIR);
  const id = `${request.recuLe.replace(/[:.]/g, "-")}-${crypto.randomBytes(3).toString("hex")}`;
  const record = { id, ...request };
  fs.writeFileSync(path.join(REQUEST_DIR, `${id}.json`), JSON.stringify(record, null, 2), "utf8");
  return record;
}

export function listRequests(limit = 200): ContactRequest[] {
  if (!fs.existsSync(REQUEST_DIR)) return [];
  return fs
    .readdirSync(REQUEST_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse()
    .slice(0, limit)
    .map((f) => JSON.parse(fs.readFileSync(path.join(REQUEST_DIR, f), "utf8")) as ContactRequest);
}

export function deleteRequest(id: string) {
  if (!/^[\w-]+$/.test(id)) return;
  fs.rmSync(path.join(REQUEST_DIR, `${id}.json`), { force: true });
}
