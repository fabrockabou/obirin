"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { useProductState } from "./ProductState";

/**
 * Galerie produit : transition en fondu + léger zoom entre les vues, vignettes accessibles,
 * navigation clavier (flèches gauche/droite quand la galerie a le focus).
 */
export function ProductGallery({ background, className = "", priority = false }: { background: string; className?: string; priority?: boolean }) {
  const { images, index, setIndex } = useProductState();
  const stage = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const current = images[index];
  const isPage = current.kind === "page";
  const isCutout = current.kind === "detoure";

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (prefersReducedMotion() || !stage.current) return;
    const { gsap } = getGsap();
    const t = gsap.fromTo(stage.current, { opacity: 0, scale: 1.04, filter: "blur(6px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "expo.out" });
    return () => {
      t.kill();
    };
  }, [index]);

  return (
    <div
      className={className}
      role="region"
      aria-roledescription="galerie"
      aria-label="Images du produit"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") setIndex(index + 1);
        if (e.key === "ArrowLeft") setIndex(index - 1);
      }}
    >
      <figure>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]" style={{ background }}>
          {!isCutout && (
            <Image src={current.src} alt="" aria-hidden="true" fill sizes="200px" className="scale-125 object-cover opacity-60 blur-2xl" />
          )}
          <div ref={stage} className="absolute inset-0">
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt}
              fill
              priority={priority && index === 0}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className={`object-contain ${isPage ? "p-3" : isCutout ? "p-[9%] drop-shadow-[0_30px_35px_rgba(19,32,26,0.25)]" : "p-[6%] drop-shadow-[0_24px_30px_rgba(19,32,26,0.25)]"}`}
            />
          </div>
          {images.length > 1 && (
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
              <button type="button" onClick={() => setIndex(index - 1)} className="grid size-11 place-items-center rounded-full bg-ivory/85 text-forest backdrop-blur transition hover:bg-ivory" aria-label="Image précédente">
                ←
              </button>
              <span className="rounded-full bg-ivory/85 px-3 py-1 text-xs font-semibold tabular-nums text-forest backdrop-blur" aria-live="polite">
                {index + 1} / {images.length}
              </span>
              <button type="button" onClick={() => setIndex(index + 1)} className="grid size-11 place-items-center rounded-full bg-ivory/85 text-forest backdrop-blur transition hover:bg-ivory" aria-label="Image suivante">
                →
              </button>
            </div>
          )}
        </div>
        {current.caption && <figcaption className="mt-3 text-sm text-ink-soft">{current.caption}</figcaption>}
      </figure>

      {images.length > 1 && (
        <ul className="mt-4 flex gap-3" aria-label="Choisir une image">
          {images.map((im, i) => (
            <li key={im.src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Afficher : ${im.caption ?? im.alt}`}
                aria-current={i === index}
                className={`relative block size-[4.5rem] overflow-hidden rounded-xl bg-cream transition-all duration-500 ${
                  i === index ? "ring-2 ring-fuchsia ring-offset-2 ring-offset-ivory" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={im.src} alt="" fill sizes="72px" className={im.kind === "page" ? "object-cover object-top" : "object-contain p-1"} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
