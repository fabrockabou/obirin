import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProductAction } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/ProductForm";
import { collections } from "@/data/collections";
import { LAYOUTS, TONES } from "@/lib/product-input";
import { getAllProducts, getProduct } from "@/lib/store";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug === "nouveau" ? "Nouveau produit" : (getProduct(slug, { includeHidden: true })?.name ?? "Produit") };
}

export default async function AdminProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const isNew = slug === "nouveau";
  const product = isNew ? undefined : getProduct(slug, { includeHidden: true });
  if (!isNew && !product) notFound();
  const others = getAllProducts()
    .filter((p) => p.slug !== slug)
    .map((p) => ({ slug: p.slug, name: p.name }));

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/produits" className="text-sm text-ink-soft hover:text-fuchsia">
        ← Tous les produits
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl text-forest">{product ? product.name : "Nouveau produit"}</h1>
        {product && !product.hidden && (
          <Link href={`/produits/${product.slug}`} target="_blank" className="text-sm font-semibold text-emerald underline">
            Voir la fiche sur le site ↗
          </Link>
        )}
      </div>
      {sp.enregistre && (
        <p role="status" className="mt-6 rounded-xl bg-mist px-4 py-3 text-sm font-semibold text-forest">
          ✓ Enregistré. Le site est déjà à jour.
        </p>
      )}

      <ProductForm
        key={product?.updatedAt ?? slug}
        product={product}
        others={others}
        collections={collections.map((c) => ({ slug: c.slug, name: c.name }))}
        layouts={LAYOUTS}
        tones={TONES}
      />

      {product && (
        <form action={deleteProductAction} className="mt-16 rounded-2xl border border-fuchsia/30 p-6">
          <input type="hidden" name="slug" value={product.slug} />
          <h2 className="font-semibold text-fuchsia-600">Supprimer ce produit</h2>
          <p className="mt-1 text-sm text-ink-soft">
            La fiche disparaît définitivement du site. Pour la retirer temporairement, préférez « Masquer du site » en haut du formulaire.
          </p>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input type="checkbox" required className="size-4 accent-fuchsia" /> Je confirme la suppression de « {product.name} »
          </label>
          <button type="submit" className="mt-4 rounded-full bg-fuchsia px-5 py-2.5 text-sm font-semibold text-ivory hover:bg-fuchsia-600">
            Supprimer définitivement
          </button>
        </form>
      )}
    </div>
  );
}
