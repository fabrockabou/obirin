import Link from "next/link";
import { ArrowLink, Kicker, Price, ProductVisual } from "@/components/ui/primitives";
import { getProduct } from "@/data/products";
import type { Product } from "@/data/types";

const lead = { slug: "nutrition-ovarienne", ratio: "aspect-[5/4]" };
const aside = { slug: "peptide-collagene-blueberry-colafruit", ratio: "aspect-[4/3]" };
const row: { slug: string; cls: string; ratio: string }[] = [
  { slug: "serum-visage-bleuet", cls: "lg:col-span-4 lg:mt-10", ratio: "aspect-square" },
  { slug: "gelee-royale", cls: "lg:col-span-4 lg:mt-40", ratio: "aspect-[4/5]" },
  { slug: "soja-puissance", cls: "lg:col-span-4", ratio: "aspect-[4/5]" },
];

function Card({ product, ratio, index }: { product: Product; ratio: string; index: number }) {
  return (
    <Link href={`/produits/${product.slug}`} className="group block">
      <ProductVisual product={product} sizes="(min-width: 1024px) 35vw, 90vw" className={`rounded-[1.75rem] ${ratio}`} />
      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <p className="kicker text-ink-soft/70">{String(index + 1).padStart(2, "0")} — {product.format}</p>
          <h3 className="mt-2 font-display text-[1.75rem] leading-tight text-forest transition-colors group-hover:text-fuchsia">{product.name}</h3>
        </div>
        <Price value={product.price} className="shrink-0 pt-6 text-xl text-emerald" />
      </div>
    </Link>
  );
}

export function ProductSelection() {
  return (
    <section className="bg-ivory py-28 lg:py-40" aria-labelledby="selection-titre">
      <div className="container-luxe">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-x-8">
          <div className="flex flex-col justify-between gap-16 lg:col-span-4">
            <div>
              <Kicker className="text-fuchsia">Sélection</Kicker>
              <h2 id="selection-titre" data-reveal="up" className="display mt-8 text-[length:var(--text-title)] text-forest">
                Nos <em className="text-fuchsia">essentiels</em>
              </h2>
              <p data-reveal="up" className="mt-6 max-w-md text-ink-soft">
                Une sélection de nos produits phares — santé féminine, beauté &amp; bien-être. Prix client en FCFA.
              </p>
            </div>
            <div data-reveal="up" className="hidden lg:block">
              <Card product={getProduct(aside.slug)!} ratio={aside.ratio} index={1} />
            </div>
          </div>
          <div data-reveal="up" className="lg:col-span-7 lg:col-start-6">
            <Card product={getProduct(lead.slug)!} ratio={lead.ratio} index={0} />
          </div>
          <div data-reveal="up" className="lg:hidden">
            <Card product={getProduct(aside.slug)!} ratio={aside.ratio} index={1} />
          </div>
        </div>
        <div className="mt-16 grid gap-16 sm:grid-cols-2 lg:mt-28 lg:grid-cols-12 lg:gap-x-8">
          {row.map(({ slug, cls, ratio }, i) => {
            const p = getProduct(slug);
            if (!p) return null;
            return (
              <div key={slug} className={cls} data-reveal="up" data-reveal-delay={String(i * 0.08)}>
                <Card product={p} ratio={ratio} index={i + 2} />
              </div>
            );
          })}
        </div>
        <div className="mt-20 flex justify-center">
          <ArrowLink href="/boutique">Voir tous les produits</ArrowLink>
        </div>
      </div>
    </section>
  );
}
