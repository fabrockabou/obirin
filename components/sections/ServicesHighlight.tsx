import Image from "next/image";
import Link from "next/link";
import { Kicker, Price } from "@/components/ui/primitives";
import { services, servicesIntro } from "@/data/services";

export function ServicesHighlight() {
  return (
    <section className="relative overflow-hidden bg-forest text-ivory" aria-labelledby="services-titre">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[60vh] overflow-hidden lg:min-h-[100svh]">
          <div data-parallax="0.15" className="absolute -inset-y-[10%] inset-x-0">
            <Image src={services[0].image.src} alt={services[0].image.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-forest via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-forest/60" />
          <p className="absolute bottom-8 left-8 max-w-xs font-display text-3xl italic leading-tight text-ivory lg:bottom-12 lg:left-12">
            « {servicesIntro.signature} »
          </p>
        </div>

        <div className="flex flex-col justify-center px-[clamp(1.25rem,5vw,5rem)] py-24 lg:py-32">
          <Kicker className="text-gold-soft">{servicesIntro.kicker}</Kicker>
          <h2 id="services-titre" data-reveal="up" className="display mt-8 text-[length:var(--text-title)]">
            Les services <em className="text-rose">Obirin</em>
          </h2>
          <ul data-stagger className="mt-10 grid gap-x-8 gap-y-5 text-ivory/75 sm:grid-cols-3">
            {servicesIntro.points.map((p) => (
              <li key={p.title} className="text-sm">
                <strong className="block font-semibold text-ivory">{p.title}</strong>
                {p.text}
              </li>
            ))}
          </ul>

          <div className="mt-14 space-y-4">
            {services.map((s) => (
              <article key={s.slug} data-reveal="up" className="group relative rounded-[1.5rem] border border-ivory/15 p-6 transition-colors duration-500 hover:border-gold-soft/60 hover:bg-ivory/5 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="kicker text-gold-soft">{s.kicker}</p>
                    <h3 className="mt-2 font-display text-3xl">
                      <Link href={`/services/${s.slug}`} className="after:absolute after:inset-0">
                        {s.name}
                      </Link>
                    </h3>
                  </div>
                  <Price value={s.price} className="text-2xl text-rose" />
                </div>
                <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm text-ivory/70">
                  <div className="flex gap-2">
                    <dt>Durée :</dt>
                    <dd className="text-ivory">{s.duration}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Lieu</dt>
                    <dd>{s.location}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/contact?sujet=rendez-vous" className="btn btn-light">
              Demander un rendez-vous <span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
            <Link href="/services" className="btn btn-ghost-light">
              Tous les services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
