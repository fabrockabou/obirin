import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductDetails } from "@/components/products/ProductDetails";
import { ProductEntrance } from "@/components/products/ProductEntrance";
import { ProductHero } from "@/components/products/ProductHero";
import { ProductStateProvider } from "@/components/products/ProductState";
import { Kicker } from "@/components/ui/primitives";
import { getCollection } from "@/data/collections";
import { getProduct, products } from "@/data/products";
import { site } from "@/data/site";
import type { ImageAsset, Product } from "@/data/types";
import { formatFcfa } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  const description = `${p.name} (${p.packagingName})${p.format ? `, ${p.format}` : ""} — ${p.tagline}. ${formatFcfa(p.price)}.`;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/produits/${p.slug}` },
    openGraph: { title: `${p.name} — Obirin`, description, images: [{ url: p.image.src, width: p.image.width, height: p.image.height, alt: p.image.alt }] },
  };
}

function galleryOf(p: Product): ImageAsset[] {
  const list: ImageAsset[] = [p.cutout ?? p.image, ...(p.variants?.map((v) => v.image) ?? []), ...p.gallery];
  return list.filter((im, i) => list.findIndex((x) => x.src === im.src) === i);
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const collection = getCollection(product.collection)!;
  const related = product.related.map(getProduct).filter((x): x is Product => Boolean(x));
  const order = products.filter((p) => p.collection !== "autres-references");
  const i = order.findIndex((p) => p.slug === product.slug);
  const prev = i >= 0 ? order[(i - 1 + order.length) % order.length] : undefined;
  const next = i >= 0 ? order[(i + 1) % order.length] : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    alternateName: product.packagingName,
    image: [product.image, ...product.gallery].map((im) => `${site.url}${im.src}`),
    description: product.intro ?? product.tagline,
    brand: { "@type": "Brand", name: "Green World" },
    category: collection.name,
    ...(product.price !== null && {
      offers: (product.variants ?? [{ id: "unique", price: product.price, label: product.format ?? "" }]).map((v) => ({
        "@type": "Offer",
        price: v.price,
        priceCurrency: site.currency,
        url: `${site.url}/produits/${product.slug}`,
        name: v.label,
      })),
    }),
  };

  const darkTop = product.layout === "immersive";

  return (
    <main data-header={darkTop ? "dark" : "light"}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductStateProvider images={galleryOf(product)} variants={product.variants}>
        <ProductEntrance>
          <ProductHero product={product} />
        </ProductEntrance>
      </ProductStateProvider>

      <ProductDetails product={product} />

      {related.length > 0 && (
        <section className="bg-cream py-24 lg:py-32" aria-labelledby="associes">
          <div className="container-luxe">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Kicker className="text-fuchsia">Pour compléter</Kicker>
                <h2 id="associes" className="display mt-6 text-[length:var(--text-subtitle)] text-forest">
                  Produits associés
                </h2>
              </div>
              <Link href={`/collections/${collection.slug}`} className="link-underline text-sm font-semibold uppercase tracking-[0.16em] text-forest">
                Toute la collection {collection.name}
              </Link>
            </div>
            <div data-stagger className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <ProductCard key={r.slug} product={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {prev && next && (
        <nav aria-label="Produits précédent et suivant" className="grid border-t border-forest/10 bg-ivory sm:grid-cols-2">
          {[
            { p: prev, label: "Produit précédent", align: "text-left", arrow: "←" },
            { p: next, label: "Produit suivant", align: "sm:text-right", arrow: "→" },
          ].map(({ p, label, align, arrow }) => (
            <Link key={label} href={`/produits/${p.slug}`} className={`group block px-[clamp(1.25rem,5vw,5rem)] py-12 transition-colors hover:bg-forest hover:text-ivory ${align}`}>
              <span className="kicker text-ink-soft group-hover:text-gold-soft">
                {arrow === "←" ? `${arrow} ${label}` : `${label} ${arrow}`}
              </span>
              <span className="mt-3 block font-display text-3xl">{p.name}</span>
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}
