"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getCollection } from "@/data/collections";
import { products } from "@/data/products";
import { services } from "@/data/services";
import { formatFcfa } from "@/lib/format";
import { useOverlay } from "./useOverlay";

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

type Result = { href: string; title: string; subtitle: string; price: string; image: { src: string; width: number; height: number } };

const index: (Result & { haystack: string })[] = [
  ...products.map((p) => ({
    href: `/produits/${p.slug}`,
    title: p.name,
    subtitle: `${getCollection(p.collection)?.name ?? ""} — ${p.packagingName}`,
    price: formatFcfa(p.price),
    image: p.image,
    haystack: normalize([p.name, p.packagingName, p.tagline, p.intro, getCollection(p.collection)?.name, ...(p.composition ?? [])].join(" ")),
  })),
  ...services.map((s) => ({
    href: `/services/${s.slug}`,
    title: s.name,
    subtitle: `Service bien-être — ${s.kicker}`,
    price: formatFcfa(s.price),
    image: s.image,
    haystack: normalize([s.name, s.kicker, s.tagline, s.intro, "service rendez-vous"].join(" ")),
  })),
];

const suggestions = ["Gelée Royale", "Collagène", "Thé", "Bleuet", "Serviettes", "Bain ionique"];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useOverlay<HTMLDivElement>(open, onClose);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return index.filter((r) => terms.every((t) => r.haystack.includes(t))).slice(0, 8);
  }, [query]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Recherche de produits"
      style={{ transition: open ? "opacity .5s" : "opacity .5s, visibility 0s linear .5s" }}
      className={`fixed inset-0 z-[70] ${open ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      <button type="button" tabIndex={-1} aria-hidden="true" className="absolute inset-0 bg-abyss/70 backdrop-blur-md" onClick={onClose} />
      <div
        className={`relative mx-auto mt-0 w-full max-w-3xl bg-ivory px-5 pb-6 pt-5 shadow-2xl transition-transform duration-700 ease-[var(--ease-luxe)] sm:mt-[10vh] sm:rounded-3xl sm:px-8 sm:pt-7 ${
          open ? "translate-y-0" : "-translate-y-8"
        }`}
      >
        <div className="flex items-center gap-4 border-b border-ink/15 pb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-emerald">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <label htmlFor="recherche" className="sr-only">
            Rechercher un produit ou un service
          </label>
          <input
            id="recherche"
            data-autofocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit, un ingrédient, un service…"
            autoComplete="off"
            className="w-full bg-transparent font-display text-2xl text-forest placeholder:text-ink-soft/60 focus:outline-none sm:text-3xl"
          />
          <button type="button" onClick={onClose} className="kicker shrink-0 rounded-full px-3 py-2 text-ink-soft hover:text-fuchsia" aria-label="Fermer la recherche">
            Fermer
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pt-4" aria-live="polite">
          {!query && (
            <div>
              <p className="kicker text-ink-soft">Suggestions</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => setQuery(s)} className="min-h-11 rounded-full border border-ink/15 px-4 text-sm hover:border-fuchsia hover:text-fuchsia">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {query && results.length === 0 && <p className="py-6 text-ink-soft">Aucun résultat pour « {query} ».</p>}
          {results.length > 0 && (
            <ul className="divide-y divide-ink/10">
              {results.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} onClick={onClose} className="group flex items-center gap-4 py-3">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                      <Image src={r.image.src} alt="" fill sizes="64px" className="object-contain p-1 transition-transform duration-700 group-hover:scale-110" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-xl leading-tight text-forest group-hover:text-fuchsia">{r.title}</span>
                      <span className="block truncate text-sm text-ink-soft">{r.subtitle}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-emerald">{r.price}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
