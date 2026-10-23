"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { heroSources, heroSequence, type HeroMode } from "./hero-config";
import { site } from "@/data/site";

/**
 * Hero cinématique piloté par le scroll.
 *
 * Fonctionnement :
 *  1. Le rendu serveur affiche la version statique (affiche + titre final + boutons) : c'est ce que
 *     voient les visiteurs sans JavaScript ou qui préfèrent réduire les animations.
 *  2. Côté client, on choisit la vidéo adaptée (mobile portrait / desktop), on la télécharge
 *     entièrement (blob) pour garantir des seeks instantanés, puis on active le scrub.
 *  3. ScrollTrigger convertit la progression du scroll dans la section (300vh) en temps vidéo ;
 *     une boucle rAF lisse la cible et ne demande un nouveau seek que lorsque le précédent est terminé.
 *  4. Les textes sont des éléments HTML (accessibles, traduisibles) synchronisés sur la même timeline.
 *  5. Connexion lente / Save-Data / échec vidéo → mode « lite » : les deux affiches se fondent au scroll.
 */
export function HeroScroll() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<HeroMode>("static");
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const target = useRef(0);

  // 1) Choix du mode et chargement de la vidéo
  useEffect(() => {
    if (prefersReducedMotion()) return;
    // le film portrait sert les écrans en orientation portrait (smartphones, tablettes tenues verticalement)
    const mobile = window.matchMedia("(orientation: portrait)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    // Save-Data : pas de vidéo (affiches). Connexion estimée lente (2G/3G) : version allégée (~1,2 Mo).
    // L'estimation effectiveType de Chrome fluctue beaucoup ; elle ne sert donc qu'à choisir la qualité.
    const slow = ["slow-2g", "2g", "3g"].includes(conn?.effectiveType ?? "");
    if (conn?.saveData) {
      setMode("lite");
      return;
    }
    setMode("video");
    const el = video.current;
    if (!el) return;

    let objectUrl: string | null = null;
    let cancelled = false;
    const controller = new AbortController();
    const fail = () => !cancelled && setMode("lite");
    const timeout = window.setTimeout(fail, 15000);

    const onReady = () => {
      window.clearTimeout(timeout);
      // iOS : un play/pause muet « déverrouille » le décodage pour que les seeks s'affichent.
      el.play()
        .then(() => el.pause())
        .catch(() => undefined)
        .finally(() => !cancelled && setReady(true));
    };
    el.addEventListener("loadeddata", onReady, { once: true });
    el.addEventListener("error", fail, { once: true });

    const src = mobile ? heroSources.mobile : slow ? heroSources.desktopLight : heroSources.desktop;
    fetch(src, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        el.src = objectUrl;
        el.load();
      })
      .catch((e: Error) => {
        if (e.name === "AbortError") return;
        // Repli : laisser le navigateur streamer le fichier directement.
        el.src = src;
        el.load();
      });

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
      el.removeEventListener("loadeddata", onReady);
      el.removeEventListener("error", fail);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  // 2) Timeline pilotée par le scroll (textes, profondeur) — active dès le premier rendu client,
  //    sans attendre la vidéo : le récit fonctionne aussi pendant le chargement.
  useEffect(() => {
    if (mode === "static" || !section.current) return;
    const { gsap, ScrollTrigger } = getGsap();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => {
            target.current = self.progress;
            setProgress(self.progress);
          },
        },
      });
      // la durée totale de la timeline vaut 1 : les positions ci-dessous sont des fractions du scroll
      tl.set({}, {}, 1);
      for (const step of heroSequence) {
        const node = section.current!.querySelector<HTMLElement>(`[data-seq="${step.id}"]`);
        if (!node) continue;
        tl.fromTo(node, { autoAlpha: 0, y: 40, scale: 0.98, filter: "blur(8px)" }, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: step.inDur, ease: "power2.out" }, step.in);
        if (step.out !== undefined) tl.to(node, { autoAlpha: 0, y: -40, filter: "blur(6px)", duration: 0.06, ease: "power2.in" }, step.out);
      }
      const hint = section.current!.querySelector("[data-seq-hint]");
      if (hint) tl.to(hint, { autoAlpha: 0, duration: 0.04 }, 0.02);
      if (mode === "lite") {
        const finals = section.current!.querySelectorAll("[data-poster-final]");
        tl.fromTo(finals, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.35 }, 0.45);
      }
      // léger zoom de la scène pour la profondeur
      const stage = section.current!.querySelector("[data-stage]");
      if (stage) tl.fromTo(stage, { scale: 1 }, { scale: 1.06, duration: 1 }, 0);
    }, section);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [mode]);

  // 3) Scrub vidéo : une fois la vidéo prête, son temps suit la progression du scroll.
  useEffect(() => {
    const el = video.current;
    if (mode !== "video" || !ready || !el || !Number.isFinite(el.duration)) return;
    const duration = el.duration;
    let current = target.current;
    let raf = 0;
    {
      let last = performance.now();
      const loop = (now: number) => {
        // lissage indépendant du nombre d'images par seconde (constante de temps ≈ 90 ms)
        const dt = Math.min(0.25, (now - last) / 1000);
        last = now;
        current += (target.current - current) * (1 - Math.exp(-dt / 0.09));
        const time = Math.min(duration - 0.04, Math.max(0, current * duration));
        if (!el.seeking && Math.abs(el.currentTime - time) > 1 / 60) el.currentTime = time;
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(raf);
  }, [mode, ready]);

  const chapter = Math.min(heroSequence.length - 1, Math.max(0, heroSequence.filter((st) => progress >= st.in).length - 1));
  const { desktopPosters: dp, mobilePosters: mp } = heroSources;

  return (
    <section ref={section} data-hero aria-label="Obirin — Le bien-être devient un art" className="hero-track relative bg-abyss text-ivory">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div data-stage className="absolute inset-0 will-change-transform">
          {/* Affiche d'ouverture (logo) : fond de la version animée, visible pendant le chargement */}
          <picture className="hidden js-motion:block">
            <source media="(orientation: portrait)" srcSet={mp.logo} />
            <img src={dp.logo} alt="" className="absolute inset-0 size-full object-cover" />
          </picture>
          {/* Affiche finale : version statique (sans JS / animations réduites) et fondu du mode lite */}
          <picture>
            <source media="(orientation: portrait)" srcSet={mp.final} />
            <img src={dp.final} alt="" fetchPriority="high" data-poster-final className="absolute inset-0 size-full object-cover js-motion:opacity-0" />
          </picture>
          <video
            ref={video}
            muted
            playsInline
            preload="none"
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${mode === "video" && ready ? "opacity-100" : "opacity-0"}`}
          />
        </div>

        {mode === "video" && !ready && (
          <div className="absolute inset-x-0 bottom-28 flex justify-center" role="status" aria-live="polite">
            <span className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-ivory/70">
              <span className="size-1.5 animate-pulse rounded-full bg-gold-soft" />
              Chargement de l&apos;expérience
            </span>
          </div>
        )}

        {/* voile de lisibilité */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,transparent,rgba(3,19,13,0.45))]" />

        {/* Séquence éditoriale (texte HTML synchronisé avec la vidéo) */}
        <div className="container-luxe relative flex h-full flex-col justify-center pt-20">
          <div data-seq="manifeste" className="hidden max-w-xl js-motion:invisible js-motion:absolute js-motion:block js-motion:left-[clamp(1.25rem,4vw,3.5rem)] js-motion:top-[17%] md:js-motion:top-[30%]">
            <p className="kicker text-gold-soft">Obirin — Côte d&apos;Ivoire</p>
            <h2 className="display mt-5 text-[clamp(2.6rem,6vw,5.6rem)] text-ivory">
              Le bien-être <em className="text-rose">devient un art.</em>
            </h2>
          </div>

          <div data-seq="univers" className="hidden max-w-md text-right js-motion:invisible js-motion:absolute js-motion:block js-motion:right-[clamp(1.25rem,4vw,3.5rem)] js-motion:top-[15%] md:js-motion:top-[17%]">
            <span className="hairline mb-6 ml-auto block w-24" />
            <p className="font-display text-[clamp(1.6rem,3vw,2.5rem)] leading-tight text-ivory">
              Découvrez un univers où la nature, la beauté et le soin de soi se rencontrent.
            </p>
          </div>

          <div data-seq="signature" className="mx-auto max-w-4xl pb-[16vh] text-center js-motion:invisible js-motion:absolute js-motion:inset-x-0 js-motion:top-[13%] js-motion:pb-0">
            <h1 className="display mt-4 text-[clamp(3.2rem,10vw,9rem)] tracking-[0.12em] text-ivory font-sans font-extrabold">OBIRIN</h1>
            <p className="mt-3 font-display text-[clamp(1.4rem,2.6vw,2.2rem)] italic text-rose">{site.motto}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/collections" className="btn btn-primary">
                Explorer nos collections <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
              <Link href="/notre-marque" className="btn btn-ghost-light">
                Découvrir notre univers
              </Link>
            </div>
            <p className="mx-auto mt-6 inline-flex max-w-[90vw] items-center gap-3 rounded-full border border-gold-soft/30 bg-abyss/70 px-5 py-2.5 text-sm text-ivory/90 backdrop-blur-md">
              <span className="size-1.5 shrink-0 rounded-full bg-gold-soft" aria-hidden="true" />
              Procurez-vous nos produits en Côte d&apos;Ivoire et partout dans la sous-région.
            </p>
          </div>
        </div>

        <div data-seq-hint className="absolute inset-x-0 bottom-10 hidden flex-col items-center gap-3 text-ivory/70 js-motion:flex" aria-hidden="true">
          <span className="kicker">Faites défiler</span>
          <span className="relative h-12 w-px overflow-hidden bg-ivory/20">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollhint_2s_ease-in-out_infinite] bg-gold-soft" />
          </span>
        </div>
        {/* indicateur de progression discret */}
        <div className="absolute bottom-8 left-[clamp(1.25rem,4vw,3.5rem)] hidden items-center gap-4 text-ivory/60 md:js-motion:flex" aria-hidden="true">
          <span className="kicker tabular-nums">{String(chapter + 1).padStart(2, "0")}</span>
          <span className="relative h-px w-28 bg-ivory/20">
            <span className="absolute inset-y-0 left-0 bg-gold-soft" style={{ width: `${progress * 100}%` }} />
          </span>
          <span className="kicker tabular-nums">{String(heroSequence.length).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
  );
}
