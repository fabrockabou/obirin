"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
let firstPaintDone = false;

/**
 * Transition entre les pages : un voile émeraude se retire vers le haut pendant que la nouvelle
 * page apparaît. Ignorée au premier chargement (pour ne pas retarder l'affichage) et quand
 * l'utilisateur préfère réduire les animations.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const veil = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const isFirst = !firstPaintDone;
    firstPaintDone = true;
    if (isFirst || prefersReducedMotion() || !veil.current || !page.current) return;
    const { gsap } = getGsap();
    const tl = gsap.timeline();
    tl.set(veil.current, { display: "block", yPercent: 0 })
      .fromTo(page.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, ease: "expo.out", clearProps: "transform,opacity" }, 0.25)
      .to(veil.current, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, 0)
      .set(veil.current, { display: "none" });
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <>
      <div
        ref={veil}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[90] hidden bg-forest"
        style={{ backgroundImage: "radial-gradient(circle at 50% 120%, rgba(184,154,94,0.25), transparent 60%)" }}
      />
      <div ref={page}>{children}</div>
    </>
  );
}
