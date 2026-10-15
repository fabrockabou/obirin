import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminUsername, getAdminVersion, getSessionSecret } from "./store";

const COOKIE = "obirin_admin";
const SESSION_DAYS = 7;

function sign(payload: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

/** Jeton : utilisateur.expiration.signature — la signature couvre aussi la version du mot de passe. */
function createToken(username: string) {
  const expires = Date.now() + SESSION_DAYS * 24 * 3600 * 1000;
  const user = Buffer.from(username).toString("base64url");
  const payload = `${user}.${expires}`;
  return `${payload}.${sign(`${payload}.${getAdminVersion()}`)}`;
}

function readToken(token: string | undefined): string | null {
  if (!token) return null;
  const [user, expires, signature] = token.split(".");
  if (!user || !expires || !signature) return null;
  if (!(Number(expires) > Date.now())) return null;
  const expected = Buffer.from(sign(`${user}.${expires}.${getAdminVersion()}`));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
  const username = Buffer.from(user, "base64url").toString();
  return username === getAdminUsername() ? username : null;
}

async function isHttps() {
  const h = await headers();
  return h.get("x-forwarded-proto") === "https" || (h.get("origin") ?? "").startsWith("https://");
}

export async function startSession(username: string) {
  (await cookies()).set(COOKIE, createToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: await isHttps(),
    path: "/",
    maxAge: SESSION_DAYS * 24 * 3600,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function currentAdmin() {
  return readToken((await cookies()).get(COOKIE)?.value);
}

/** À appeler en tête de chaque page et action d'administration. */
export async function requireAdmin() {
  const user = await currentAdmin();
  if (!user) redirect("/admin/connexion");
  return user;
}

// Limitation des tentatives de connexion : 5 essais par 15 minutes et par adresse IP.
const attempts = new Map<string, { count: number; until: number }>();
export async function loginThrottle() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  const now = Date.now();
  const entry = attempts.get(ip);
  const blocked = entry && entry.count >= 5 && entry.until > now;
  return {
    blocked: Boolean(blocked),
    fail() {
      const e = attempts.get(ip);
      if (!e || e.until < now) attempts.set(ip, { count: 1, until: now + 15 * 60 * 1000 });
      else e.count += 1;
    },
    reset() {
      attempts.delete(ip);
    },
  };
}
