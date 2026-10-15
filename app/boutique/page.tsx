import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { collections } from "@/data/collections";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Boutique — tous nos produits",
  description:
    "Tous les produits Obirin : santé féminine, minceur & nutrition, beauté & éclat, soins capillaires, hygiène. Filtrez par univers ou par prix et consultez chaque fiche.",
  alternates: { canonical: "/boutique" },
};

export default function ShopPage() {
  return (
    <main data-header="light" className="bg-ivory">
      <section className="container-luxe pb-12 pt-36 lg:pt-44">
        <Breadcrumb items={[{ label: "Boutique" }]} />
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h1 data-reveal="up" className="display text-[length:var(--text-display)] text-forest lg:col-span-7">
            La <em className="text-fuchsia">boutique</em>
          </h1>
          <p data-reveal="up" className="text-lg text-ink-soft lg:col-span-5">
            Tous nos produits réunis. Filtrez par univers ou par prix, puis ouvrez chaque fiche pour découvrir la composition, les conseils
            d&apos;utilisation et faire votre demande.
          </p>
        </div>
      </section>
      <section className="container-luxe pb-28" aria-label="Produits">
        {/* useSearchParams (filtre dans l'URL) nécessite une frontière Suspense pour la génération statique */}
        <Suspense fallback={<p className="py-20 text-center text-ink-soft">Chargement des produits…</p>}>
          <ShopCatalog products={products} collections={collections} />
        </Suspense>
      </section>
    </main>
  );
}
