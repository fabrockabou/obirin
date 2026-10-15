import Image from "next/image";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getCollection } from "@/data/collections";
import type { Product } from "@/data/types";
import { tones } from "@/lib/tones";
import { ProductGallery } from "./ProductGallery";
import { ProductOffer } from "./ProductOffer";

function Crumbs({ product, light }: { product: Product; light?: boolean }) {
  const c = getCollection(product.collection)!;
  return <Breadcrumb light={light} items={[{ label: c.name, href: `/collections/${c.slug}` }, { label: product.name }]} />;
}

function Title({ product, light = false, size = "lg" }: { product: Product; light?: boolean; size?: "lg" | "xl" }) {
  const c = getCollection(product.collection)!;
  return (
    <>
      <p data-hero-item className={`kicker ${light ? "text-gold-soft" : "text-fuchsia"}`}>
        {c.name}
        {product.catalogueCategory ? ` — ${product.catalogueCategory}` : ""}
      </p>
      <h1
        data-hero-item
        className={`display mt-5 ${light ? "text-ivory" : "text-forest"} ${size === "xl" ? "text-[clamp(3rem,7.5vw,7.5rem)]" : "text-[clamp(2.8rem,5.6vw,5.6rem)]"}`}
      >
        {product.name}
      </h1>
      <p data-hero-item className={`mt-4 text-sm font-medium uppercase tracking-[0.16em] ${light ? "text-ivory/60" : "text-ink-soft"}`}>
        {product.packagingName}
      </p>
      <p data-hero-item className={`mt-6 max-w-xl font-display text-[1.65rem] italic leading-snug ${light ? "text-rose" : "text-emerald"}`}>
        {product.tagline}
      </p>
      {product.intro && (
        <p data-hero-item className={`mt-5 max-w-xl text-[1.05rem] ${light ? "text-ivory/75" : "text-ink-soft"}`}>
          {product.intro}
        </p>
      )}
    </>
  );
}

/** Mise en page « éditoriale » : texte large à gauche, visuel encadré et portrait éditorial superposés. */
function Editorial({ product }: { product: Product }) {
  const tone = tones[product.tone];
  return (
    <section className="relative overflow-hidden bg-ivory pb-24 pt-32 lg:pb-32 lg:pt-40">
      <div className="pointer-events-none absolute -right-[20vw] top-0 size-[70vw] rounded-full opacity-60 blur-3xl" style={{ background: tone.soft }} />
      <div className="container-luxe relative">
        <Crumbs product={product} />
        <div className="mt-12 grid items-start gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6 lg:pt-10">
            <Title product={product} />
            <div data-hero-item className="mt-10">
              <ProductOffer product={product} />
            </div>
          </div>
          <div className="relative lg:col-span-5 lg:col-start-8">
            <div data-hero-visual>
              <ProductGallery background={tone.soft} priority />
            </div>
            {product.editorial && (
              <div data-reveal="up" data-reveal-delay="0.4" className="absolute -left-24 top-[55%] hidden aspect-[3/4] w-44 overflow-hidden rounded-[1.25rem] border-[6px] border-ivory shadow-xl xl:block">
                <Image src={product.editorial.src} alt={product.editorial.alt} fill sizes="180px" className="object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Mise en page « immersive » : plein écran sur la couleur profonde de l'emballage, nom monumental. */
function Immersive({ product }: { product: Product }) {
  const tone = tones[product.tone];
  const visual = product.cutout ?? product.image;
  return (
    <>
      <section className="relative isolate overflow-hidden pb-20 pt-28 text-ivory lg:min-h-[100svh] lg:pt-32" style={{ background: tone.deep }}>
        <div className="absolute inset-0 -z-10" style={{ background: `radial-gradient(55% 55% at 50% 45%, ${tone.accent}55, transparent 70%)` }} />
        <div className="grain absolute inset-0 -z-10" />
        <div className="container-luxe">
          <Crumbs product={product} light />
          <div className="relative mt-10 grid items-center gap-12 lg:grid-cols-12">
            <p
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 hidden -translate-y-1/2 select-none text-center font-display text-[17vw] leading-none text-ivory/[0.06] lg:block"
            >
              {product.name.split(" ")[0]}
            </p>
            <div className="lg:col-span-5">
              <Title product={product} light size="xl" />
            </div>
            <div data-hero-visual className="relative mx-auto aspect-[4/5] w-full max-w-md lg:col-span-4">
              {/* halo lumineux au sol : le produit repose dans la lumière */}
              <span
                aria-hidden="true"
                className="absolute inset-x-[2%] bottom-[2%] h-[16%] rounded-[50%] blur-xl"
                style={{ background: "radial-gradient(closest-side, rgba(248,244,236,0.95), rgba(248,244,236,0.35) 60%, transparent)" }}
              />
              <Image
                src={visual.src}
                alt={visual.alt}
                fill
                priority
                sizes="(min-width: 1024px) 30vw, 80vw"
                className={product.cutout ? "object-contain drop-shadow-[0_50px_60px_rgba(0,0,0,0.5)]" : "rounded-[2rem] object-contain"}
              />
            </div>
            <div data-hero-item className="lg:col-span-3">
              <ProductOffer product={product} light />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-ivory py-20">
        <div className="container-luxe grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:col-start-2">
            <ProductGallery background={tone.soft} />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="kicker text-ink-soft">Galerie</p>
            <p className="mt-4 font-display text-3xl leading-snug text-forest">Le produit sous tous ses angles : emballage, format et mise en scène.</p>
          </div>
        </div>
      </section>
    </>
  );
}

/** Mise en page « split » : galerie collante à gauche, informations qui défilent à droite. */
function Split({ product }: { product: Product }) {
  const tone = tones[product.tone];
  return (
    <section className="relative bg-ivory pb-16 pt-28 lg:pt-32">
      <div className="container-luxe">
        <Crumbs product={product} />
        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div data-hero-visual className="lg:sticky lg:top-28 lg:col-span-6 lg:self-start">
            <ProductGallery background={`radial-gradient(80% 70% at 50% 40%, #fffaf3, ${tone.soft})`} priority />
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:py-10">
            <Title product={product} />
            <div data-hero-item className="mt-10 border-t border-forest/15 pt-10">
              <ProductOffer product={product} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Mise en page « portrait » : photographie éditoriale pleine hauteur, produit en médaillon. */
function Portrait({ product }: { product: Product }) {
  const tone = tones[product.tone];
  return (
    <section className="relative bg-ivory">
      <div className="grid lg:min-h-[100svh] lg:grid-cols-2">
        <div className="relative lg:min-h-0">
          <div className="relative h-[58svh] overflow-hidden bg-forest lg:absolute lg:inset-0 lg:h-auto">
            {product.editorial ? (
              <div data-parallax="0.12" className="absolute -inset-y-[8%] inset-x-0">
                <Image src={product.editorial.src} alt={product.editorial.alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              </div>
            ) : (
              <div className="absolute inset-0" style={{ background: tone.deep }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-abyss/70 via-transparent to-abyss/30" />
          </div>
          <div className="relative z-10 mx-5 -mt-40 sm:mx-auto sm:w-[70%] lg:absolute lg:bottom-10 lg:left-10 lg:mx-0 lg:mt-0 lg:w-[46%]">
            <div data-hero-visual className="rounded-[1.75rem] bg-ivory p-2 shadow-2xl">
              <ProductGallery background={tone.soft} priority />
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center px-[clamp(1.25rem,5vw,5rem)] pb-20 pt-14 lg:pt-36">
          <Crumbs product={product} />
          <div className="mt-10">
            <Title product={product} />
          </div>
          <div data-hero-item className="mt-10">
            <ProductOffer product={product} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductHero({ product }: { product: Product }) {
  switch (product.layout) {
    case "immersive":
      return <Immersive product={product} />;
    case "split":
      return <Split product={product} />;
    case "portrait":
      return <Portrait product={product} />;
    default:
      return <Editorial product={product} />;
  }
}
