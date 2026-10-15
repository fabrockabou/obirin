import Link from "next/link";
import { site } from "@/data/site";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items, light = false }: { items: Crumb[]; light?: boolean }) {
  const all: Crumb[] = [{ label: "Accueil", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.href ? { item: `${site.url}${c.href}` } : {}) })),
  };
  return (
    <nav aria-label="Fil d'Ariane" className={`text-xs font-medium uppercase tracking-[0.18em] ${light ? "text-ivory/70" : "text-ink-soft"}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {all.map((c, i) => (
          <li key={c.label} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden="true" className="opacity-50">/</span>}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className="link-underline hover:text-fuchsia">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className={light ? "text-ivory" : "text-forest"}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
