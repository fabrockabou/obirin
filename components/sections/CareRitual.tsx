"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Kicker, Price, ProductVisual } from "@/components/ui/primitives";
import { getProduct } from "@/data/products";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

// Le rituel est construit à partir des conseils d'utilisation du catalogue (pages 15 à 18) :
// savon → lotion « première étape après le nettoyage » → sérum « après la lotion tonique »
// → crème contour « seule ou après l'essence ».
const steps = [
  { slug: "savon-olive", verb: "Nettoyer", line: "Faire mousser sur peau humide, rincer abondamment." },
  { slug: "lotion-tonique-bleuet", verb: "Tonifier", line: "Première étape après le nettoyage. Prépare la peau à recevoir la crème ou l'essence." },
  { slug: "serum-visage-bleuet", verb: "Sublimer", line: "Après le nettoyage et la lotion tonique, masser délicatement jusqu'à absorption complète." },
  { slug: "creme-contour-yeux-bleuet", verb: "Illuminer", line: "Tapoter délicatement sur le contour des yeux, seule ou après l'essence." },
];

export function CareRitual() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !section.current || !track.current) return;
    const { gsap } = getGsap();
    const mm = gsap.matchMedia();
    // Défilement horizontal épinglé sur grand écran ; pile verticale sur mobile.
    mm.add("(min-width: 1024px)", () => {
      const el = track.current!;
      const distance = () => el.scrollWidth - window.innerWidth;
      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: () => `+=${distance()}`, scrub: 0.8, pin: true, invalidateOnRefresh: true },
      });
      gsap.utils.toArray<HTMLElement>("[data-ritual-card]", el).forEach((card) => {
        gsap.fromTo(
          card.querySelector("[data-ritual-visual]"),
          { yPercent: 8, rotate: -2 },
          { yPercent: -8, rotate: 2, ease: "none", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true } },
        );
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={section} className="relative overflow-hidden bg-abyss text-ivory" aria-labelledby="rituel-titre">
      <div className="grain pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 80% at 15% 30%, rgba(109,63,168,0.28), transparent 60%), radial-gradient(50% 60% at 90% 80%, rgba(28,107,75,0.4), transparent 60%)" }} />
      <div ref={track} className="relative flex flex-col gap-20 py-28 lg:h-[100svh] lg:w-max lg:flex-row lg:items-center lg:gap-0 lg:py-0">
        <div className="container-luxe lg:w-[42vw] lg:max-w-none lg:pr-16">
          <Kicker className="text-gold-soft">L&apos;expérience des soins</Kicker>
          <h2 id="rituel-titre" className="display mt-8 text-[length:var(--text-title)]">
            La nature, <em className="text-rose">la beauté</em> et le soin de soi, en quatre gestes.
          </h2>
          <p className="mt-8 max-w-md text-ivory/70">
            Une peau propre, douce et éclatante au quotidien : le rituel au bleuet, composé à partir des conseils d&apos;utilisation de nos soins.
          </p>
          <p className="kicker mt-12 hidden items-center gap-3 text-gold-soft lg:flex" aria-hidden="true">
            Faites défiler <span className="inline-block h-px w-16 bg-gold-soft" />
          </p>
        </div>

        {steps.map((s, i) => {
          const p = getProduct(s.slug)!;
          return (
            <article key={s.slug} data-ritual-card className="container-luxe lg:w-[34vw] lg:min-w-[30rem] lg:max-w-none lg:px-[2.5vw]">
              <Link href={`/produits/${p.slug}`} className="group block">
                <div data-ritual-visual className="relative">
                  <ProductVisual product={p} sizes="(min-width: 1024px) 30vw, 90vw" className="aspect-[4/5] rounded-[2rem] lg:max-h-[56vh]" />
                  <span className="absolute -top-6 left-6 font-display text-[6rem] leading-none text-ivory/90 [text-shadow:0_10px_40px_rgba(0,0,0,0.4)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-8 flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-4xl italic text-rose">{s.verb}</h3>
                  <Price value={p.price} className="text-lg text-gold-soft" />
                </div>
                <p className="mt-2 font-semibold uppercase tracking-[0.14em] text-ivory">{p.name}</p>
                <p className="mt-3 max-w-sm text-sm text-ivory/65">{s.line}</p>
              </Link>
            </article>
          );
        })}
        <div className="hidden w-[8vw] lg:block" aria-hidden="true" />
      </div>
    </section>
  );
}
