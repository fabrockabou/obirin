"use client";

import { useEffect, useRef } from "react";

/** Comportement commun des panneaux plein écran : Échap, verrouillage du scroll, piège de focus, restauration du focus. */
export function useOverlay<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbar}px`;

    const focusables = () =>
      Array.from(ref.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])') ?? []);
    // Le panneau devient visible via une transition CSS : on retente la mise au point jusqu'à ce
    // qu'elle réussisse (au plus ~1 s), sans dépendre du rythme d'affichage.
    let tries = 0;
    const focusTimer = window.setInterval(() => {
      const target = ref.current?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0];
      target?.focus();
      if (ref.current?.contains(document.activeElement) || ++tries > 20) window.clearInterval(focusTimer);
    }, 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(focusTimer);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      previous?.focus?.();
    };
  }, [open]);

  return ref;
}
