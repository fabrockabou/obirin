"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Arrivée sur une fiche : le visuel se dévoile par un masque, puis les informations apparaissent en séquence. */
export function ProductEntrance({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(
        "[data-hero-visual]",
        { clipPath: "inset(18% 12% 18% 12% round 2rem)", scale: 1.06, opacity: 0 },
        { clipPath: "inset(0% 0% 0% 0% round 2rem)", scale: 1, opacity: 1, duration: 1.6, ease: "expo.out", clearProps: "clipPath,transform" },
      ).fromTo("[data-hero-item]", { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "expo.out", clearProps: "transform" }, 0.25);
    }, ref);
    return () => ctx.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
