"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogoLockup } from "@/components/brand/Logo";
import { collections } from "@/data/collections";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";

type Theme = "transparent" | "forest" | "ivory";

const desktopNav = [
  { label: "Boutique", href: "/boutique" },
  { label: "Santé féminine", href: "/collections/sante-feminine" },
  { label: "Beauté & Éclat", href: "/collections/beaute-eclat" },
  { label: "Minceur & Nutrition", href: "/collections/minceur-nutrition" },
  { label: "Bien-être", href: "/services" },
  { label: "Notre marque", href: "/notre-marque" },
];

export function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("transparent");
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const lastY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);

  // Le thème dépend de la page : les pages qui commencent par une section sombre déclarent
  // data-header="dark" sur leur <main>. Sur l'accueil, le header reste sombre tant que le Hero
  // est visible, puis passe en ivoire.
  const update = useCallback(() => {
    const y = window.scrollY;
    const main = document.querySelector<HTMLElement>("main[data-header]");
    const darkTop = main?.dataset.header === "dark";
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const darkZoneEnd = hero ? hero.getBoundingClientRect().bottom : darkTop ? window.innerHeight * 0.6 - y : -1;
    if (darkZoneEnd > 80) setTheme(y > 40 ? "forest" : "transparent");
    else setTheme(y > 20 ? "ivory" : darkTop ? "transparent" : "ivory");

    const focusInside = headerRef.current?.contains(document.activeElement);
    setHidden(y > 480 && y > lastY.current + 4 && !focusInside);
    if (y < lastY.current - 4 || y < 480) setHidden(false);
    lastY.current = y;
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setCollectionsOpen(false);
    const raf = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname, update]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest("input, textarea, select, [contenteditable]");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const light = theme !== "ivory";
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header
        ref={headerRef}
        onFocusCapture={() => setHidden(false)}
        className={[
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow,color] duration-700 ease-[var(--ease-luxe)]",
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
          theme === "transparent" && "bg-transparent",
          theme === "forest" && "bg-abyss/80 shadow-[0_1px_0_rgba(184,154,94,0.18)] backdrop-blur-xl",
          theme === "ivory" && "bg-ivory/90 shadow-[0_1px_0_rgba(19,32,26,0.08)] backdrop-blur-xl",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="container-luxe flex h-20 items-center justify-between gap-6 lg:h-24">
          <Link href="/" aria-label="Obirin — Accueil" className="shrink-0">
            <LogoLockup tone={light ? "light" : "dark"} />
          </Link>

          <nav aria-label="Navigation principale" className="hidden xl:block">
            <ul className={`flex items-center gap-6 whitespace-nowrap text-[0.74rem] font-semibold uppercase tracking-[0.1em] 2xl:gap-8 2xl:tracking-[0.14em] ${light ? "text-ivory" : "text-forest"}`}>
              <li
                className="relative"
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setCollectionsOpen(false);
                }}
              >
                <button
                  type="button"
                  aria-expanded={collectionsOpen}
                  aria-controls="menu-collections"
                  onClick={() => setCollectionsOpen((v) => !v)}
                  onKeyDown={(e) => e.key === "Escape" && setCollectionsOpen(false)}
                  className={`flex items-center gap-2 py-3 uppercase ${isActive("/collections") ? "text-gold-soft" : ""}`}
                >
                  Nos collections
                  <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" className={`transition-transform duration-500 ${collectionsOpen ? "rotate-180" : ""}`}>
                    <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </button>
                <div
                  id="menu-collections"
                  className={`absolute left-1/2 top-full w-[34rem] -translate-x-1/2 pt-3 transition-all duration-500 ease-[var(--ease-luxe)] ${
                    collectionsOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
                  }`}
                >
                  <div className="grid grid-cols-2 gap-1 rounded-2xl bg-ivory p-3 text-forest shadow-[0_30px_80px_-30px_rgba(3,19,13,0.45)]">
                    <Link href="/collections" className="col-span-2 rounded-xl px-4 py-3 font-display text-xl normal-case tracking-normal hover:bg-cream">
                      Toutes les collections →
                    </Link>
                    {collections.map((c) => (
                      <Link key={c.slug} href={`/collections/${c.slug}`} className="rounded-xl px-4 py-3 hover:bg-cream">
                        <span className="block text-[0.72rem]">{c.name}</span>
                        <span className="mt-1 block text-[0.68rem] font-medium normal-case tracking-normal text-ink-soft">{c.kicker}</span>
                      </Link>
                    ))}
                    <Link href="/services" className="rounded-xl px-4 py-3 hover:bg-cream">
                      <span className="block text-[0.72rem]">Services bien-être</span>
                      <span className="mt-1 block text-[0.68rem] font-medium normal-case tracking-normal text-ink-soft">Sur rendez-vous</span>
                    </Link>
                  </div>
                </div>
              </li>
              {desktopNav.map((item) => (
                <li key={item.href} className={item.href === "/notre-marque" || item.href === "/services" ? "hidden 2xl:block" : undefined}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`link-underline py-3 ${isActive(item.href) ? (light ? "text-gold-soft" : "text-fuchsia") : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={`flex items-center gap-2 ${light ? "text-ivory" : "text-forest"}`}>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-11 place-items-center rounded-full transition-colors hover:bg-white/10"
              aria-label="Rechercher un produit (raccourci : /)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </button>
            <Link href="/contact" className={`btn hidden min-h-11 px-5 py-2.5 md:inline-flex ${light ? "btn-ghost-light" : "btn-ghost-dark"}`}>
              Contact
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid size-11 place-items-center rounded-full 2xl:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
            >
              <svg width="26" height="14" viewBox="0 0 26 14" aria-hidden="true" stroke="currentColor" strokeWidth="1.5">
                <path d="M0 1h26M8 13h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onSearch={() => { setMenuOpen(false); setSearchOpen(true); }} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
