import Image from "next/image";
import Link from "next/link";
import { Kicker } from "@/components/ui/primitives";
import { collections } from "@/data/collections";
import { productsIn } from "@/data/products";
import { servicesIntro } from "@/data/services";

type Tile = { href: string; title: string; kicker: string; count: string; image: { src: string; alt: string }; span: string; ratio: string };

const pick = (slug: string) => collections.find((c) => c.slug === slug)!;
const tiles: Tile[] = [
  ...(["sante-feminine", "minceur-nutrition", "beaute-eclat", "soins-capillaires", "hygiene-soin-quotidien"] as const).map((slug, i) => {
    const c = pick(slug);
    const n = productsIn(slug).length;
    const layout = [
      { span: "lg:col-span-7 lg:row-span-2", ratio: "aspect-[4/5] lg:aspect-auto lg:h-full" },
      { span: "lg:col-span-5", ratio: "aspect-[4/3]" },
      { span: "lg:col-span-5", ratio: "aspect-[4/3]" },
      { span: "lg:col-span-4", ratio: "aspect-[3/4]" },
      { span: "lg:col-span-4", ratio: "aspect-[3/4]" },
    ][i];
    return { href: `/collections/${slug}`, title: c.name, kicker: c.kicker, count: `${n} référence${n > 1 ? "s" : ""}`, image: c.image, ...layout };
  }),
  {
    href: "/services",
    title: "Services bien-être",
    kicker: "Sur rendez-vous",
    count: "2 prestations",
    image: servicesIntro.collectionImage,
    span: "lg:col-span-4",
    ratio: "aspect-[3/4]",
  },
];

export function Universes() {
  return (
    <section className="relative bg-cream py-28 lg:py-40" aria-labelledby="univers-titre">
      <div className="container-luxe">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <Kicker className="text-emerald">Explorer les univers</Kicker>
            <h2 id="univers-titre" data-reveal="up" className="display mt-8 text-[length:var(--text-title)] text-forest">
              Prévention, bien-être, <em className="text-fuchsia">confiance.</em> Chaque jour.
            </h2>
          </div>
          <p data-reveal="up" className="max-w-sm text-ink-soft">
            Six univers pour prendre soin de soi à chaque étape de la vie : du soin intime au rituel beauté, jusqu&apos;aux rendez-vous bien-être.
          </p>
        </div>

        <ul className="mt-16 grid gap-5 lg:grid-cols-12 lg:grid-rows-[auto_auto_auto] lg:gap-6">
          {tiles.map((t, i) => (
            <li key={t.href} className={t.span} data-reveal="up" data-reveal-delay={String((i % 3) * 0.08)}>
              <Link href={t.href} className={`group relative block overflow-hidden rounded-[1.75rem] bg-forest ${t.ratio}`}>
                <Image
                  src={t.image.src}
                  alt={t.image.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-[transform,filter] duration-[1.6s] ease-[var(--ease-luxe)] group-hover:scale-[1.07] group-hover:-translate-y-2 group-focus-visible:scale-[1.07]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-abyss/85 via-abyss/20 to-transparent transition-opacity duration-700 group-hover:opacity-90" />
                <span className="absolute left-6 top-6 font-display text-lg italic text-ivory/80">{String(i + 1).padStart(2, "0")}</span>
                <span className="absolute right-6 top-6 rounded-full bg-ivory/15 px-3 py-1 text-xs font-medium text-ivory backdrop-blur">{t.count}</span>
                <span className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 text-ivory">
                  <span>
                    <span className="kicker block text-gold-soft">{t.kicker}</span>
                    <span className="mt-2 block font-display text-[clamp(1.9rem,3vw,3rem)] leading-none">{t.title}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid size-12 shrink-0 translate-y-3 place-items-center rounded-full bg-ivory text-forest opacity-0 transition-all duration-700 ease-[var(--ease-luxe)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
