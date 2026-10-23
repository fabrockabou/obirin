import Link from "next/link";
import { LogoFull } from "@/components/brand/Logo";
import { collections } from "@/data/collections";
import { services } from "@/data/services";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-abyss text-ivory/80">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(80% 60% at 10% 0%, rgba(28,107,75,0.35), transparent 60%)" }} />
      <div className="container-luxe relative grid gap-14 py-20 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:py-28">
        <div>
          <LogoFull tone="light" className="text-[2.6rem]" />
          <p className="mt-8 max-w-sm font-display text-3xl leading-tight text-ivory">
            Des solutions naturelles pour prendre soin de vous au quotidien.
          </p>
          <p className="mt-4 font-display text-xl italic text-gold-soft">{site.motto}</p>
        </div>

        <nav aria-label="Collections">
          <p className="kicker text-gold-soft">Collections</p>
          <ul className="mt-6 space-y-3">
            <li>
              <Link href="/boutique" className="link-underline hover:text-ivory">
                Boutique — tous les produits
              </Link>
            </li>
            {collections.map((c) => (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className="link-underline hover:text-ivory">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Services">
          <p className="kicker text-gold-soft">Bien-être</p>
          <ul className="mt-6 space-y-3">
            <li>
              <Link href="/services" className="link-underline hover:text-ivory">
                Nos services bien-être
              </Link>
            </li>
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="link-underline hover:text-ivory">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Maison">
          <p className="kicker text-gold-soft">Obirin</p>
          <ul className="mt-6 space-y-3">
            <li>
              <Link href="/notre-marque" className="link-underline hover:text-ivory">
                Notre marque
              </Link>
            </li>
            <li>
              <Link href="/contact" className="link-underline hover:text-ivory">
                Contact & demandes
              </Link>
            </li>
            <li className="pt-2 text-sm text-ivory/60">Siège Obirin — {site.country}</li>
          </ul>
        </nav>
      </div>
      <div className="container-luxe relative flex flex-col gap-3 border-t border-ivory/10 py-8 text-xs text-ivory/55 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Obirin {site.country}. Prix client et informations issus du {site.edition.toLowerCase()}.
        </p>
        <p>
          Ce site a été conçu par{" "}
          <a href="https://opulenx.com" target="_blank" rel="noopener noreferrer" className="link-underline font-semibold text-ivory/80 hover:text-ivory">
            Opulenx
          </a>
        </p>
      </div>
    </footer>
  );
}
