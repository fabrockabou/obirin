import Link from "next/link";
import { Price, ProductVisual } from "@/components/ui/primitives";
import type { Product } from "@/data/types";

export function ProductCard({ product, ratio = "aspect-[4/5]", sizes = "(min-width: 1024px) 30vw, 90vw" }: { product: Product; ratio?: string; sizes?: string }) {
  return (
    <Link href={`/produits/${product.slug}`} className="group block">
      <ProductVisual product={product} sizes={sizes} className={`rounded-[1.75rem] ${ratio}`} />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-[1.6rem] leading-tight text-forest transition-colors group-hover:text-fuchsia">{product.name}</h3>
          <p className="mt-1 text-sm text-ink-soft">{product.format}</p>
        </div>
        <Price value={product.price} className="shrink-0 pt-1 text-lg text-emerald" />
      </div>
    </Link>
  );
}
