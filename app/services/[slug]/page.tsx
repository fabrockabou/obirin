import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Kicker, Price } from "@/components/ui/primitives";
import { getService, services } from "@/data/services";
import { site } from "@/data/site";
import { formatFcfa } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  const description = `${s.name} — ${s.kicker}. ${s.tagline}. Durée : ${s.duration}. ${formatFcfa(s.price)}, ${s.location.toLowerCase()}.`;
  return {
    title: s.name,
    description,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { images: [{ url: s.image.src, width: s.image.width, height: s.image.height, alt: s.image.alt }] },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();
  const other = services.find((x) => x.slug !== s.slug)!;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.intro,
    provider: { "@type": "Organization", name: "Obirin Côte d'Ivoire" },
    offers: { "@type": "Offer", price: s.price, priceCurrency: site.currency },
  };

  return (
    <main data-header="dark">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative isolate overflow-hidden bg-abyss text-ivory">
        <div className="grid lg:min-h-[100svh] lg:grid-cols-12">
          <div className="flex flex-col justify-end px-[clamp(1.25rem,5vw,5rem)] pb-16 pt-36 lg:col-span-6 lg:pb-24">
            <Breadcrumb light items={[{ label: "Services bien-être", href: "/services" }, { label: s.name }]} />
            <p className="kicker mt-14 text-gold-soft">{s.kicker}</p>
            <h1 data-reveal="up" className="display mt-6 text-[clamp(3rem,7vw,7rem)]">{s.name}</h1>
            <p data-reveal="up" className="mt-6 max-w-lg font-display text-2xl italic text-rose">
              {s.tagline}
            </p>
            <p data-reveal="up" className="mt-6 max-w-lg text-ivory/75">
              {s.intro}
            </p>
            <dl data-stagger className="mt-12 grid max-w-xl grid-cols-2 gap-6 border-t border-ivory/15 pt-8">
              <div>
                <dt className="kicker text-gold-soft">Prix du service</dt>
                <dd className="mt-2">
                  <Price value={s.price} className="text-4xl" />
                </dd>
              </div>
              <div>
                <dt className="kicker text-gold-soft">Durée</dt>
                <dd className="mt-2 font-display text-2xl">{s.duration}</dd>
              </div>
              <div className="col-span-2 text-ivory/75">{s.location}</div>
            </dl>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={`/contact?service=${s.slug}`} className="btn btn-primary">
                Demander un rendez-vous <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="relative min-h-[70svh] overflow-hidden lg:col-span-6 lg:min-h-0">
            <div data-reveal="mask" className="absolute inset-0">
              <Image src={s.image.src} alt={s.image.alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-abyss/60 to-transparent" />
            {s.signature && (
              <p className="absolute bottom-8 left-8 right-8 font-display text-3xl italic leading-tight text-ivory lg:bottom-12 lg:left-12">« {s.signature} »</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-32" aria-labelledby="atouts">
        <div className="container-luxe grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Kicker className="text-fuchsia">Ce que vous apporte la séance</Kicker>
            <h2 id="atouts" className="display mt-6 text-[length:var(--text-subtitle)] text-forest">
              {s.tagline}
            </h2>
            {s.reassurance && (
              <div className="mt-10 rounded-[1.5rem] bg-cream p-6">
                <p className="font-display text-2xl text-forest">{s.reassurance.title}</p>
                <p className="mt-2 text-ink-soft">{s.reassurance.text}</p>
              </div>
            )}
          </div>
          <ol data-stagger className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {s.points.map((p, i) => (
              <li key={p.title} className="border-t border-forest/15 pt-6">
                <span className="font-display text-lg italic text-fuchsia">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-[1.7rem] leading-tight text-forest">{p.title}</h3>
                <p className="mt-3 text-ink-soft">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {s.domains && (
        <section className="bg-forest py-24 text-ivory" aria-labelledby="domaines">
          <div className="container-luxe">
            <Kicker className="text-gold-soft">Les principaux domaines évalués</Kicker>
            <h2 id="domaines" className="sr-only">
              Domaines évalués
            </h2>
            <ul data-stagger className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] bg-ivory/10 sm:grid-cols-3 lg:grid-cols-5">
              {s.domains.map((d) => (
                <li key={d} className="bg-forest p-6 font-display text-xl leading-tight">
                  {d}
                </li>
              ))}
            </ul>
            {s.receive && (
              <div className="mt-16 grid gap-8 lg:grid-cols-12">
                <h3 className="kicker text-gold-soft lg:col-span-3">Vous recevez</h3>
                <ul className="space-y-4 lg:col-span-8">
                  {s.receive.map((r) => (
                    <li key={r} className="flex gap-4 border-b border-ivory/10 pb-4 text-lg">
                      <span className="text-gold-soft" aria-hidden="true">
                        ✓
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {s.steps && (
        <section className="bg-cream py-24 lg:py-32" aria-labelledby="deroulement">
          <div className="container-luxe">
            <Kicker className="text-fuchsia">Comment ça se passe ?</Kicker>
            <h2 id="deroulement" className="display mt-6 text-[length:var(--text-subtitle)] text-forest">
              Le déroulement de la séance
            </h2>
            <ol data-stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {s.steps.map((st, i) => (
                <li key={st.title} className="rounded-[1.5rem] bg-ivory p-8">
                  <span className="grid size-12 place-items-center rounded-full bg-forest font-display text-xl text-ivory">{i + 1}</span>
                  <h3 className="mt-6 font-display text-2xl text-forest">{st.title}</h3>
                  <p className="mt-3 text-ink-soft">{st.text}</p>
                </li>
              ))}
            </ol>
            {s.secondaryImage && (
              <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
                <div data-reveal="mask" className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
                  <Image src={s.secondaryImage.src} alt={s.secondaryImage.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                </div>
                <p className="font-display text-3xl leading-snug text-forest">{s.signature}</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="bg-ivory py-24" aria-labelledby="source">
        <div className="container-luxe grid items-center gap-12 lg:grid-cols-12">
          <figure className="lg:col-span-4">
            <div className="relative aspect-[2/3] overflow-hidden rounded-[1.5rem] shadow-xl">
              <Image src={s.pageImage.src} alt={s.pageImage.alt} fill sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-sm text-ink-soft">{s.pageImage.caption}</figcaption>
          </figure>
          <div className="lg:col-span-6 lg:col-start-6">
            <h2 id="source" className="display text-[length:var(--text-subtitle)] text-forest">
              Prendre rendez-vous
            </h2>
            <p className="mt-6 text-lg text-ink-soft">
              {s.name} : {formatFcfa(s.price)}, {s.duration.toLowerCase()}. {s.location}. Envoyez votre demande : l&apos;équipe Obirin vous recontacte pour
              convenir d&apos;un créneau.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={`/contact?service=${s.slug}`} className="btn btn-primary">
                Demander un rendez-vous <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
              <Link href={`/services/${other.slug}`} className="btn btn-ghost-dark">
                {other.name}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
