"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/demandes", label: "Demandes reçues" },
  { href: "/admin/reglages", label: "Réglages & WhatsApp" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="flex gap-1 overflow-x-auto px-4 pb-4 lg:flex-col lg:px-3">
      {items.map((it) => {
        const active = pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              active ? "bg-ivory text-forest" : "text-ivory/80 hover:bg-ivory/10 hover:text-ivory"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
