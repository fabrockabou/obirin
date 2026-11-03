// Limitation de débit en mémoire (serveur Node unique) : N appels par fenêtre et par adresse IP.

/** Adresse IP du visiteur : le dernier maillon de X-Forwarded-For est celui ajouté par notre proxy (les précédents sont falsifiables). */
export function clientIp(headers: Headers) {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const chain = (headers.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return chain[chain.length - 1] || "local";
}

const buckets = new Map<string, { n: number; until: number }>();

/** Renvoie true si l'appel est autorisé, false si la limite est atteinte. */
export function allow(scope: string, ip: string, max: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.until < now) buckets.delete(k);
  const key = `${scope}:${ip}`;
  const b = buckets.get(key);
  if (!b || b.until < now) {
    buckets.set(key, { n: 1, until: now + windowMs });
    return true;
  }
  b.n += 1;
  return b.n <= max;
}
