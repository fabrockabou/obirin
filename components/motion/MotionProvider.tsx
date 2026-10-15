"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

declare global {
  interface Window {
    __gwMotionReady?: boolean;
  }
}

/**
 * Système d'animation déclaratif, partagé par toutes les pages :
 *  - data-reveal="up" | "fade" | "mask" | "scale"  → révélation à l'entrée dans le viewport
 *  - data-reveal-delay="0.2"                         → décalage
 *  - data-stagger                                    → enfants directs révélés en cascade
 *  - data-parallax="0.12"                            → déplacement vertical lié au scroll (fraction)
 * Les animations sont recréées à chaque navigation et entièrement désactivées si l'utilisateur
 * préfère réduire les animations (le contenu reste alors visible tel quel).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    window.__gwMotionReady = true;
    if (prefersReducedMotion() || !root.current) return;
    document.documentElement.classList.add("js-motion");
    const { gsap, ScrollTrigger } = getGsap();

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const type = el.dataset.reveal || "up";
        const delay = Number(el.dataset.revealDelay || 0);
        const from: gsap.TweenVars =
          type === "mask"
            ? { clipPath: "inset(100% 0% 0% 0%)" }
            : type === "scale"
              ? { opacity: 0, scale: 1.08 }
              : type === "fade"
                ? { opacity: 0 }
                : { opacity: 0, y: 48 };
        const to: gsap.TweenVars =
          type === "mask"
            ? { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out" }
            : { opacity: 1, y: 0, scale: 1, duration: type === "fade" ? 1.4 : 1.2, ease: "expo.out" };
        gsap.fromTo(el, from, { ...to, delay, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
        const items = Array.from(group.children) as HTMLElement[];
        gsap.fromTo(
          items,
          { opacity: 0, y: 36 },
          { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.09, scrollTrigger: { trigger: group, start: "top 85%", once: true } },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax || 0.1);
        gsap.fromTo(
          el,
          { yPercent: -amount * 50 },
          { yPercent: amount * 50, ease: "none", scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    }, root);

    // Les images chargées tardivement modifient les hauteurs : recalcul des déclencheurs.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = window.setTimeout(refresh, 600);
    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
      ctx.revert();
    };
  }, [pathname]);

  return (
    <div ref={root} id="contenu">
      {children}
    </div>
  );
}
