import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Kicker, Price } from "@/components/ui/primitives";
import { services, servicesIntro } from "@/data/services";

export const metadata: Metadata = {
  title: "Services bien-être",
  description:
    "Rendez-vous de bien-être (analyse & conseils) et bain ionique des pieds, sur rendez-vous au siège Obirin : durées, déroulement et tarifs.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <main data-header="dark">
      <section className="relative isolate overflow-hidden bg-forest text-ivory">
        <div className="absolute inset-0 -z-10">
          <Image src={servicesIntro.image.src} alt={servicesIntro.image.alt} fill priority sizes="100vw" className="object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/80 to-forest/20" />
        </div>
        <div className="container-luxe flex min-h-[88svh] flex-col justify-end pb-20 pt-36">
          <Breadcrumb light items={[{ label: "Services bien-être" }]} />
          <p className="kicker mt-14 text-gold-soft">{servicesIntro.kicker}</p>
          <h1 data-reveal="up" className="display mt-6 max-w-4xl text-[length:var(--text-display)]">
            Nos services <em className="text-rose">bien-être</em>
          </h1>
          <p data-reveal="up" className="mt-8 max-w-xl font-display text-3xl italic text-ivory/85">
            {servicesIntro.signature}
          </p>
          <ul data-stagger className="mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
            {servicesIntro.points.map((p) => (
              <li key={p.title} className="border-t border-ivory/20 pt-5 text-ivory/75">
                <strong className="block font-display text-2xl font-medium text-ivory">{p.title}</strong>
                {p.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-32" aria-labelledby="prestations">
        <div className="container-luxe">
          <Kicker className="text-fuchsia">Prestations</Kicker>
          <h2 id="prestations" className="display mt-6 text-[length:var(--text-title)] text-forest">
            Sur rendez-vous au siège Obirin
          </h2>
          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} data-reveal="up" className="group block overflow-hidden rounded-[2rem] bg-cream">
                <div className="relative aspect-[16/11] overflow-hidden">
                  <Image src={s.image.src} alt={s.image.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-luxe)] group-hover:scale-105" />
                </div>
                <div className="p-8 sm:p-10">
                  <p className="kicker text-fuchsia">{s.kicker}</p>
                  <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
                    <h3 className="font-display text-4xl text-forest">{s.name}</h3>
                    <Price value={s.price} className="text-2xl text-emerald" />
                  </div>
                  <p className="mt-4 text-ink-soft">{s.tagline}</p>
                  <p className="mt-6 text-sm text-ink-soft">
                    Durée : <strong className="text-forest">{s.duration}</strong>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-24" aria-labelledby="approche">
        <div className="container-luxe">
          <h2 id="approche" className="kicker text-ink-soft">
            Notre approche
          </h2>
          <ul data-stagger className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {servicesIntro.pillars.map((p, i) => (
              <li key={p.title} className="rounded-[1.5rem] bg-ivory p-8">
                <span className="font-display text-lg italic text-gold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-2xl text-forest">{p.title}</h3>
                <p className="mt-3 text-sm text-ink-soft">{p.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-14 flex flex-wrap gap-3">
            <Link href="/contact?sujet=rendez-vous" className="btn btn-primary">
              Demander un rendez-vous <span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
