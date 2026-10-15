import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/products/ProductCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ArrowLink, Kicker, Price, ProductVisual } from "@/components/ui/primitives";
import { collections, getCollection } from "@/data/collections";
import { productsIn } from "@/data/products";
import { tones } from "@/lib/tones";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) return {};
  return {
    title: `${c.name} — Collection`,
    description: `${c.description} ${productsIn(c.slug)
      .map((p) => p.name)
      .join(", ")}.`,
    alternates: { canonical: `/collections/${c.slug}` },
    openGraph: { images: [{ url: c.image.src, width: c.image.width, height: c.image.height, alt: c.image.alt }] },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();
  const list = productsIn(collection.slug);
  const tone = tones[collection.tone];
  const [featured, ...rest] = list;
  const others = collections.filter((c) => c.slug !== collection.slug);

  return (
    <main data-header="dark">
      <section className="relative isolate overflow-hidden text-ivory" style={{ background: tone.deep }}>
        <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[55%]">
          <div data-parallax="0.12" className="absolute -inset-y-[10%] inset-x-0">
            <Image src={collection.image.src} alt={collection.image.alt} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover object-top" />
          </div>
          <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${tone.deep} 0%, ${tone.deep}cc 30%, transparent 75%)` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
        </div>
        <div className="container-luxe flex min-h-[86svh] flex-col justify-end pb-20 pt-36 lg:min-h-[92svh]">
          <Breadcrumb light items={[{ label: "Collections", href: "/collections" }, { label: collection.name }]} />
          <p data-reveal="fade" className="kicker mt-14 text-gold-soft">
            {collection.kicker}
          </p>
          <h1 data-reveal="up" className="display mt-6 max-w-4xl text-[length:var(--text-display)]">
            {collection.name}
          </h1>
          <p data-reveal="up" data-reveal-delay="0.1" className="mt-8 max-w-xl text-lg text-ivory/80">
            {collection.description}
          </p>
          <p className="mt-10 text-sm text-ivory/60">
            {list.length} référence{list.length > 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {collection.pillars && (
        <section className="border-b border-forest/10 bg-ivory">
          <ul data-stagger className="container-luxe grid grid-cols-2 gap-8 py-12 sm:grid-cols-3 lg:grid-cols-5">
            {collection.pillars.map((p) => (
              <li key={p.title}>
                <p className="font-display text-2xl text-forest">{p.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {featured && (
        <section className="bg-ivory py-24 lg:py-32" aria-label={`Produits ${collection.name}`}>
          <div className="container-luxe">
            {/* Produit mis en avant : composition éditoriale */}
            <Link href={`/produits/${featured.slug}`} className="group grid items-center gap-10 lg:grid-cols-12" data-reveal="up">
              <ProductVisual product={featured} priority sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[5/4] rounded-[2rem] lg:col-span-7" />
              <div className="lg:col-span-4 lg:col-start-9">
                <Kicker className="text-fuchsia">À la une</Kicker>
                <h2 className="display mt-6 text-[length:var(--text-subtitle)] text-forest transition-colors group-hover:text-fuchsia">{featured.name}</h2>
                <p className="mt-4 font-display text-xl italic text-emerald">{featured.tagline}</p>
                {featured.intro && <p className="mt-4 line-clamp-4 text-ink-soft">{featured.intro}</p>}
                <div className="mt-8 flex items-center gap-6">
                  <Price value={featured.price} className="text-3xl text-forest" />
                  <span className="text-sm text-ink-soft">{featured.format}</span>
                </div>
                <span className="link-underline mt-8 inline-block text-sm font-semibold uppercase tracking-[0.16em] text-forest">Voir la fiche →</span>
              </div>
            </Link>

            {rest.length > 0 && (
              <div className="mt-24 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <div key={p.slug} data-reveal="up" data-reveal-delay={String((i % 3) * 0.08)} className={i % 3 === 1 ? "lg:mt-20" : ""}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="bg-cream py-24" aria-labelledby="autres-collections">
        <div className="container-luxe">
          <h2 id="autres-collections" className="kicker text-ink-soft">
            Explorer les autres univers
          </h2>
          <ul className="mt-8 divide-y divide-forest/10 border-y border-forest/10">
            {others.map((c) => (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className="group flex items-center justify-between gap-6 py-6">
                  <span className="font-display text-[clamp(1.8rem,3.5vw,3rem)] leading-none text-forest transition-[color,transform] duration-500 group-hover:translate-x-3 group-hover:text-fuchsia">
                    {c.name}
                  </span>
                  <span className="hidden text-sm text-ink-soft sm:block">{c.kicker}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/services" className="group flex items-center justify-between gap-6 py-6">
                <span className="font-display text-[clamp(1.8rem,3.5vw,3rem)] leading-none text-forest transition-[color,transform] duration-500 group-hover:translate-x-3 group-hover:text-fuchsia">
                  Services bien-être
                </span>
                <span className="hidden text-sm text-ink-soft sm:block">Sur rendez-vous</span>
              </Link>
            </li>
          </ul>
          <div className="mt-12">
            <ArrowLink href="/contact">Une question ? Écrivez-nous</ArrowLink>
          </div>
        </div>
      </section>
    </main>
  );
}
