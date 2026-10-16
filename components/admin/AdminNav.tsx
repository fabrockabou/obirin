"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items: { href: string; label: string; match: (p: string) => boolean; group?: string }[] = [
  { href: "/admin/produits", label: "Produits", match: (p) => p.startsWith("/admin/produits") },
  { href: "/admin/demandes", label: "Demandes reçues", match: (p) => p.startsWith("/admin/demandes") },
  { href: "/admin/adhesions/ajouter", label: "Ajouter une adhésion", match: (p) => p === "/admin/adhesions/ajouter", group: "Adhésions" },
  {
    href: "/admin/adhesions",
    label: "Liste des adhésions",
    match: (p) => p.startsWith("/admin/adhesions") && p !== "/admin/adhesions/ajouter",
    group: "Adhésions",
  },
  { href: "/admin/reglages", label: "Réglages & WhatsApp", match: (p) => p.startsWith("/admin/reglages") },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="flex gap-1 overflow-x-auto px-4 pb-4 lg:flex-col lg:px-3">
      {items.map((it, i) => {
        const active = it.match(pathname);
        const startsGroup = it.group && items[i - 1]?.group !== it.group;
        return (
          <div key={it.href} className="contents lg:block">
            {startsGroup && <p className="kicker hidden px-4 pb-1 pt-4 text-gold-soft/80 lg:block">{it.group}</p>}
            <Link
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={`block whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-ivory text-forest" : "text-ivory/80 hover:bg-ivory/10 hover:text-ivory"
              }`}
            >
              {it.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
