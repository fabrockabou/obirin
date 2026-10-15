import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/types";
import { formatFcfa } from "@/lib/format";
import { tones } from "@/lib/tones";

export function Kicker({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`kicker flex items-center gap-3 ${className}`}>
      <span className="h-px w-8 bg-current opacity-60" aria-hidden="true" />
      {children}
    </p>
  );
}

export function ArrowLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex min-h-11 items-center gap-3 text-[0.8rem] font-semibold uppercase tracking-[0.18em] ${light ? "text-ivory" : "text-forest"}`}
    >
      <span className="link-underline">{children}</span>
      <span
        aria-hidden="true"
        className={`grid size-9 place-items-center rounded-full border transition-all duration-500 group-hover:translate-x-1 ${
          light ? "border-ivory/40 group-hover:bg-ivory group-hover:text-forest" : "border-forest/25 group-hover:bg-forest group-hover:text-ivory"
        }`}
      >
        →
      </span>
    </Link>
  );
}

export function Price({ value, className = "" }: { value: number | null; className?: string }) {
  return <span className={`font-display tabular-nums ${className}`}>{formatFcfa(value)}</span>;
}

/**
 * Visuel produit : le packshot détouré quand il existe (posé sur un fond d'ambiance), sinon
 * l'extrait fidèle du catalogue, présenté comme une photographie encadrée.
 */
export function ProductVisual({
  product,
  sizes,
  priority = false,
  className = "",
  frame = true,
}: {
  product: Product;
  sizes: string;
  priority?: boolean;
  className?: string;
  frame?: boolean;
}) {
  const tone = tones[product.tone];
  if (product.cutout) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={frame ? { background: `radial-gradient(80% 70% at 50% 40%, #fffaf3, ${tone.soft})` } : undefined}>
        <Image
          src={product.cutout.src}
          alt={product.cutout.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain p-[10%] drop-shadow-[0_30px_30px_rgba(19,32,26,0.22)] transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.04]"
        />
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: tone.soft }}>
      {/* fond : le même visuel, flouté, pour habiller l'espace sans recadrer le produit */}
      <Image src={product.image.src} alt="" aria-hidden="true" fill sizes="200px" className="scale-125 object-cover opacity-70 blur-2xl" />
      <Image
        src={product.image.src}
        alt={product.image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-contain p-[6%] drop-shadow-[0_24px_30px_rgba(19,32,26,0.25)] transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.04]"
      />
    </div>
  );
}
