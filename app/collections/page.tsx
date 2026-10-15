import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Kicker } from "@/components/ui/primitives";
import { collections } from "@/data/collections";
import { productsIn } from "@/lib/store";
import { servicesIntro } from "@/data/services";
import { formatFcfa } from "@/lib/format";

export const metadata: Metadata = {
  title: "Nos collections",
  description:
    "Santé féminine, Minceur & Nutrition, Beauté & Éclat, Soins capillaires, Hygiène & soin quotidien : toutes les collections Obirin et leurs prix client.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  return (
    <main data-header="light" className="bg-ivory">
      <section className="container-luxe pb-16 pt-36 lg:pt-44">
        <Breadcrumb items={[{ label: "Collections" }]} />
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <h1 data-reveal="up" className="display text-[length:var(--text-display)] text-forest lg:col-span-8">
            Nos <em className="text-fuchsia">collections</em>
          </h1>
          <p data-reveal="up" className="self-end text-lg text-ink-soft lg:col-span-4">
            Des solutions naturelles pour chaque étape de la vie, de la santé féminine aux soins de beauté. Catalogue produits &amp; services — édition octobre 2026.
          </p>
        </div>
      </section>

      <section className="container-luxe space-y-6 pb-28">
        {collections.map((c, i) => {
          const list = productsIn(c.slug);
          const prices = list.map((p) => p.price).filter((p): p is number => p !== null);
          return (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              data-reveal="up"
              className={`group relative grid overflow-hidden rounded-[2rem] bg-cream lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[28rem]">
                <Image
                  src={c.image.src}
                  alt={c.image.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className={`object-cover object-top transition-transform duration-[1.6s] ease-[var(--ease-luxe)] group-hover:scale-105`}
                />
              </div>
              <div className="flex flex-col justify-between gap-10 p-8 sm:p-12">
                <div>
                  <p className="kicker text-fuchsia">
                    {String(i + 1).padStart(2, "0")} — {c.kicker}
                  </p>
                  <h2 className="display mt-6 text-[length:var(--text-subtitle)] text-forest">{c.name}</h2>
                  <p className="mt-4 max-w-md text-ink-soft">{c.description}</p>
                </div>
                <div>
                  <ul className="flex flex-wrap gap-2">
                    {list.map((p) => (
                      <li key={p.slug} className="rounded-full border border-forest/15 bg-ivory px-3 py-1 text-xs text-forest">
                        {p.name}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 flex items-center justify-between text-sm text-ink-soft">
                    <span>{prices.length ? `À partir de ${formatFcfa(Math.min(...prices))}` : "Prix sur demande"}</span>
                    <span className="grid size-12 place-items-center rounded-full bg-forest text-ivory transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true">
                      →
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          );
        })}

        <Link href="/services" data-reveal="up" className="group relative block overflow-hidden rounded-[2rem] bg-forest text-ivory">
          <Image src={servicesIntro.collectionImage.src} alt={servicesIntro.collectionImage.alt} fill sizes="100vw" className="object-cover opacity-40 transition-transform duration-[1.6s] group-hover:scale-105" />
          <div className="relative p-8 sm:p-12 lg:p-16">
            <Kicker className="text-gold-soft">Services bien-être</Kicker>
            <p className="display mt-6 max-w-2xl text-[length:var(--text-subtitle)]">{servicesIntro.signature}</p>
            <p className="mt-6 text-ivory/75">Rendez-vous de bien-être et bain ionique des pieds — sur rendez-vous au siège Obirin.</p>
          </div>
        </Link>
      </section>
    </main>
  );
}
