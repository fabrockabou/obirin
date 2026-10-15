import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { toggleProductAction } from "@/app/admin/actions";
import { collections } from "@/data/collections";
import { formatFcfa } from "@/lib/format";
import { getAllProducts } from "@/lib/store";

export const metadata: Metadata = { title: "Produits" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const products = getAllProducts();
  const collectionName = (slug: string) => collections.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-5xl text-forest">Produits</h1>
          <p className="mt-2 text-ink-soft">
            {products.length} produits — {products.filter((p) => p.hidden).length} masqué(s). Chaque modification est visible immédiatement sur le site.
          </p>
        </div>
        <Link href="/admin/produits/nouveau" className="btn btn-primary">
          + Nouveau produit
        </Link>
      </div>

      {sp.supprime && <p className="mt-6 rounded-xl bg-mist px-4 py-3 text-sm text-forest">Produit supprimé.</p>}

      <div className="mt-8 overflow-hidden rounded-2xl border border-forest/10 bg-ivory">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-xs uppercase tracking-[0.12em] text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-semibold">Produit</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">Univers</th>
              <th className="px-4 py-3 font-semibold">Prix</th>
              <th className="hidden px-4 py-3 font-semibold sm:table-cell">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {products.map((p) => (
              <tr key={p.slug} className={p.hidden ? "opacity-60" : undefined}>
                <td className="px-4 py-3">
                  <Link href={`/admin/produits/${p.slug}`} className="flex items-center gap-3 font-semibold text-forest hover:text-fuchsia">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-cream">
                      <Image src={(p.cutout ?? p.image).src} alt="" fill sizes="48px" className="object-contain p-0.5" />
                    </span>
                    <span>
                      {p.name}
                      <span className="block text-xs font-normal text-ink-soft">{p.format}</span>
                    </span>
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-ink-soft md:table-cell">{collectionName(p.collection)}</td>
                <td className="px-4 py-3 tabular-nums">{formatFcfa(p.price)}</td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <form action={toggleProductAction}>
                    <input type="hidden" name="slug" value={p.slug} />
                    <button
                      type="submit"
                      title={p.hidden ? "Afficher sur le site" : "Masquer du site"}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${p.hidden ? "bg-sand text-ink-soft" : "bg-mist text-emerald"}`}
                    >
                      {p.hidden ? "Masqué" : "En ligne"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/produits/${p.slug}`} className="rounded-full border border-forest/20 px-4 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-ivory">
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
