"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowLink } from "@/components/ui/primitives";
import { img } from "@/data/images";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

const portrait = img("/images/editorial/philosophie-portrait.webp", "Femme souriante aux longs cheveux ondulés, la main posée sur la joue");

// Textes : catalogue pages 2 et 22.
// Le manifeste est découpé en mots ; les mots marqués d'un * sont mis en valeur (italique rose).
const manifesto = "Une approche *naturelle et globale pour la santé et le *bien-être de tous !";
const words = manifesto.split(" ").map((w) => ({ text: w.replace("*", ""), accent: w.startsWith("*") }));

const pillars = [
  ["Des solutions", "naturelles"],
  ["Pour chaque étape", "de la vie"],
  ["Parce que chaque", "femme compte"],
];

/**
 * Section « Notre philosophie » — fond émeraude dans la continuité du Hero.
 * Les mots du manifeste s'illuminent un à un au fil du scroll (scrub GSAP) ; le portrait est
 * présenté dans un médaillon cerclé d'or. Sans animation, tout le texte est directement lisible.
 */
export function Philosophy() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !section.current) return;
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: { trigger: "[data-manifesto]", start: "top 80%", end: "bottom 45%", scrub: 0.6 },
        },
      );
      gsap.fromTo(
        "[data-medallion]",
        { scale: 0.86, rotate: -6 },
        { scale: 1, rotate: 0, ease: "none", scrollTrigger: { trigger: section.current, start: "top bottom", end: "center center", scrub: 0.8 } },
      );
      gsap.to("[data-ring]", { rotate: 360, duration: 60, ease: "none", repeat: -1 });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className="relative overflow-hidden bg-forest py-28 text-ivory lg:py-40" aria-labelledby="philosophie-titre">
      {/* lumière douce et grain, en continuité du Hero */}
      <div
        className="grain pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 70% at 85% 40%, rgba(28,107,75,0.55), transparent 65%), radial-gradient(50% 60% at 0% 100%, rgba(194,24,91,0.12), transparent 60%)" }}
      />
      <div className="container-luxe relative grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p className="kicker flex items-center gap-3 text-gold-soft">
            <span className="h-px w-8 bg-current opacity-60" aria-hidden="true" />
            Notre philosophie
          </p>
          <h2 id="philosophie-titre" data-manifesto className="display mt-8 text-[clamp(2.5rem,5.2vw,5.4rem)] leading-[1.02]">
            {words.map((w, i) => (
              <span key={i} data-word className={w.accent ? "italic text-rose" : undefined}>
                {w.text}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </h2>
          <div data-reveal="up" className="mt-10 max-w-xl text-lg text-ivory/75">
            <p>
              Santé, bien-être, beauté… Obirin vous propose des solutions naturelles pour prendre soin de vous au quotidien, pour une vie plus saine et
              plus équilibrée.
            </p>
            <p className="mt-4 font-display text-2xl italic text-gold-soft">Nous sommes à votre écoute !</p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[26rem] lg:col-span-4 lg:col-start-9 lg:max-w-none">
          <div data-medallion className="relative aspect-square">
            {/* anneau doré et texte circulaire */}
            <svg data-ring viewBox="0 0 200 200" className="absolute -inset-[7%] h-[114%] w-[114%] text-gold-soft" aria-hidden="true">
              <defs>
                <path id="cercle-philosophie" d="M100,100 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" />
              </defs>
              <text fontSize="6.2" letterSpacing="2.6" fill="currentColor" className="font-sans uppercase" style={{ fontWeight: 600 }}>
                <textPath href="#cercle-philosophie">Se connaître · Se préserver · S&apos;épanouir · Beauté · Bien-être · Spiritualité ·</textPath>
              </text>
            </svg>
            <div className="absolute inset-0 rounded-full border border-gold/70 p-3">
              <div className="relative size-full overflow-hidden rounded-full shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)]">
                <Image src={portrait.src} alt={portrait.alt} fill sizes="(min-width: 1024px) 32vw, 80vw" className="scale-105 object-cover object-[50%_25%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-luxe relative mt-20 flex flex-col gap-10 border-t border-ivory/15 pt-10 lg:flex-row lg:items-end lg:justify-between">
        <ul data-stagger className="grid gap-8 sm:grid-cols-3 lg:gap-16">
          {pillars.map(([a, b], i) => (
            <li key={a} className="flex items-baseline gap-4">
              <span className="font-display text-2xl italic text-gold-soft">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm leading-snug text-ivory/70">
                {a}
                <br />
                <strong className="font-display text-xl font-medium text-ivory">{b}</strong>
              </span>
            </li>
          ))}
        </ul>
        <ArrowLink href="/notre-marque" light>
          Découvrir notre marque
        </ArrowLink>
      </div>
    </section>
  );
}
