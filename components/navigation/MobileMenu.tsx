"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { LogoLockup } from "@/components/brand/Logo";
import { collections } from "@/data/collections";
import { mainNav, site } from "@/data/site";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { useOverlay } from "./useOverlay";

export function MobileMenu({ open, onClose, onSearch }: { open: boolean; onClose: () => void; onSearch: () => void }) {
  const ref = useOverlay<HTMLDivElement>(open, onClose);
  const list = useRef<HTMLUListElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open || prefersReducedMotion() || !list.current) return;
    const { gsap } = getGsap();
    const tween = gsap.fromTo(
      list.current.children,
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.05, delay: 0.15 },
    );
    return () => {
      tween.kill();
    };
  }, [open]);

  return (
    <div
      ref={ref}
      id="menu-mobile"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      // visibilité immédiate à l'ouverture (focus possible tout de suite), différée à la fermeture
      style={{ transition: open ? "clip-path .7s var(--ease-luxe)" : "clip-path .7s var(--ease-luxe), visibility 0s linear .7s" }}
      className={`fixed inset-0 z-[60] overflow-y-auto bg-abyss text-ivory 2xl:hidden ${
        open ? "visible [clip-path:inset(0_0_0_0)]" : "invisible [clip-path:inset(0_0_100%_0)]"
      }`}
    >
      <div className="grain pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 70% at 80% 0%, rgba(28,107,75,0.45), transparent 60%)" }} />
      <div className="container-luxe relative flex min-h-full flex-col pb-10">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" onClick={onClose} aria-label="Obirin — Accueil">
            <LogoLockup tone="light" />
          </Link>
          <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full border border-ivory/25" aria-label="Fermer le menu">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l14 14M15 1L1 15" />
            </svg>
          </button>
        </div>

        <nav aria-label="Menu mobile" className="mt-6 flex-1">
          <ul ref={list} className="space-y-1 overflow-hidden">
            {mainNav.map((item, i) => (
              <li key={item.href} className="overflow-hidden">
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="group flex items-baseline gap-4 py-2 font-display text-[2.4rem] leading-tight sm:text-5xl"
                >
                  <span className="kicker w-7 text-gold-soft/70">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`transition-colors group-hover:text-rose ${pathname === item.href ? "italic text-rose" : ""}`}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-ivory/15 pt-8">
            <p className="kicker text-gold-soft">Accès rapide aux collections</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {collections.map((c) => (
                <li key={c.slug}>
                  <Link href={`/collections/${c.slug}`} onClick={onClose} className="inline-flex min-h-11 items-center rounded-full border border-ivory/20 px-4 text-sm hover:bg-ivory hover:text-forest">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <button type="button" onClick={onSearch} className="btn btn-ghost-light">
            Rechercher un produit
          </button>
          <p className="font-display text-xl italic text-gold-soft">{site.motto}</p>
        </div>
      </div>
    </div>
  );
}
