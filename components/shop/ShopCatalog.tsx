"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Price, ProductVisual } from "@/components/ui/primitives";
import type { Collection, Product } from "@/data/types";

type Sort = "pertinence" | "prix-asc" | "prix-desc" | "nom";

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const priceRanges = [
  { id: "tous", label: "Tous les prix", test: () => true },
  { id: "moins-10000", label: "Moins de 10 000 FCFA", test: (p: number | null) => p !== null && p < 10000 },
  { id: "10000-15000", label: "10 000 – 15 000 FCFA", test: (p: number | null) => p !== null && p >= 10000 && p <= 15000 },
  { id: "plus-15000", label: "Plus de 15 000 FCFA", test: (p: number | null) => p !== null && p > 15000 },
  { id: "sur-demande", label: "Prix sur demande", test: (p: number | null) => p === null },
];

/**
 * Boutique : tous les produits du site, filtrables par univers, prix et recherche, triables.
 * L'univers choisi est conservé dans l'URL (?univers=…) pour pouvoir partager un lien filtré.
 * Chaque carte mène à la page du produit.
 */
export function ShopCatalog({ products, collections }: { products: Product[]; collections: Collection[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("univers") ?? "tous";
  const [collection, setCollection] = useState(collections.some((c) => c.slug === initial) ? initial : "tous");
  const [range, setRange] = useState("tous");
  const [sort, setSort] = useState<Sort>("pertinence");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const m: Record<string, number> = { tous: products.length };
    for (const p of products) m[p.collection] = (m[p.collection] ?? 0) + 1;
    return m;
  }, [products]);

  const results = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const rangeTest = priceRanges.find((r) => r.id === range)!.test;
    const list = products.filter((p) => {
      if (collection !== "tous" && p.collection !== collection) return false;
      if (!rangeTest(p.price)) return false;
      if (!terms.length) return true;
      const hay = normalize([p.name, p.packagingName, p.tagline, ...(p.composition ?? [])].join(" "));
      return terms.every((t) => hay.includes(t));
    });
    const byPrice = (a: Product, b: Product, dir: number) => {
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return (a.price - b.price) * dir;
    };
    if (sort === "prix-asc") list.sort((a, b) => byPrice(a, b, 1));
    if (sort === "prix-desc") list.sort((a, b) => byPrice(a, b, -1));
    if (sort === "nom") list.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    return list;
  }, [products, collection, range, sort, query]);

  const selectCollection = (slug: string) => {
    setCollection(slug);
    const url = slug === "tous" ? "/boutique" : `/boutique?univers=${slug}`;
    router.replace(url, { scroll: false });
  };

  const reset = () => {
    selectCollection("tous");
    setRange("tous");
    setSort("pertinence");
    setQuery("");
  };

  const collectionName = (slug: string) => collections.find((c) => c.slug === slug)?.name ?? "";
  const filtered = collection !== "tous" || range !== "tous" || query !== "";

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-14">
      {/* Filtres */}
      <aside aria-label="Filtres" className="lg:sticky lg:top-28 lg:self-start">
        <div>
          <label htmlFor="boutique-recherche" className="kicker text-ink-soft">
            Rechercher
          </label>
          <input
            id="boutique-recherche"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, ingrédient…"
            className="mt-3 w-full rounded-full border border-forest/20 bg-ivory px-5 py-3 text-[0.95rem] focus:border-fuchsia focus:outline-none"
          />
        </div>

        <fieldset className="mt-8">
          <legend className="kicker text-ink-soft">Univers</legend>
          <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {[{ slug: "tous", name: "Tous les produits" }, ...collections].map((c) => (
              <label
                key={c.slug}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-full border border-forest/15 px-4 py-2.5 text-sm transition-colors hover:border-forest/40 has-[:checked]:border-forest has-[:checked]:bg-forest has-[:checked]:text-ivory has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-fuchsia lg:rounded-xl lg:border-transparent"
              >
                <input type="radio" name="univers" value={c.slug} checked={collection === c.slug} onChange={() => selectCollection(c.slug)} className="sr-only" />
                <span>{c.name}</span>
                <span className="text-xs tabular-nums opacity-60">{counts[c.slug] ?? 0}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="kicker text-ink-soft">Prix</legend>
          <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {priceRanges.map((r) => (
              <label
                key={r.id}
                className="cursor-pointer rounded-full border border-forest/15 px-4 py-2.5 text-sm transition-colors hover:border-forest/40 has-[:checked]:border-fuchsia has-[:checked]:bg-fuchsia has-[:checked]:text-ivory has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-fuchsia lg:rounded-xl lg:border-transparent"
              >
                <input type="radio" name="prix" value={r.id} checked={range === r.id} onChange={() => setRange(r.id)} className="sr-only" />
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>

        {filtered && (
          <button type="button" onClick={reset} className="link-underline mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-fuchsia">
            Effacer les filtres
          </button>
        )}
      </aside>

      {/* Résultats */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest/10 pb-5">
          <p className="text-sm text-ink-soft" aria-live="polite">
            <strong className="font-display text-2xl font-medium text-forest">{results.length}</strong> produit{results.length > 1 ? "s" : ""}
            {collection !== "tous" ? ` — ${collectionName(collection)}` : ""}
          </p>
          <label className="flex items-center gap-3 text-sm text-ink-soft">
            Trier par
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-forest/20 bg-ivory px-4 py-2 text-forest focus:border-fuchsia focus:outline-none"
            >
              <option value="pertinence">Pertinence</option>
              <option value="prix-asc">Prix croissant</option>
              <option value="prix-desc">Prix décroissant</option>
              <option value="nom">Nom (A → Z)</option>
            </select>
          </label>
        </div>

        {results.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl text-forest">Aucun produit ne correspond à ces critères.</p>
            <button type="button" onClick={reset} className="btn btn-ghost-dark mt-8">
              Voir tous les produits
            </button>
          </div>
        ) : (
          <ul className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((p) => (
              <li key={p.slug}>
                <Link href={`/produits/${p.slug}`} className="group block" aria-label={`${p.name} — voir la fiche produit`}>
                  <div className="relative">
                    <ProductVisual product={p} sizes="(min-width: 1280px) 26vw, (min-width: 640px) 45vw, 90vw" className="aspect-[4/5] rounded-[1.5rem]" />
                    <span className="absolute left-4 top-4 rounded-full bg-ivory/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-forest backdrop-blur">
                      {collectionName(p.collection)}
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute bottom-4 right-4 grid size-11 translate-y-2 place-items-center rounded-full bg-forest text-ivory opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                    >
                      →
                    </span>
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-display text-[1.5rem] leading-tight text-forest transition-colors group-hover:text-fuchsia">{p.name}</h2>
                      <p className="mt-1 text-sm text-ink-soft">{p.variants ? p.variants.map((v) => v.label).join(" / ") + " — " : ""}{p.format}</p>
                    </div>
                    <Price value={p.price} className="shrink-0 pt-1 text-lg text-emerald" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
