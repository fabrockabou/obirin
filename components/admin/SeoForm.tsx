"use client";

import { useActionState, useState } from "react";
import { saveSeoAction, type FormState } from "@/app/admin/actions";
import { adminCard, adminHint, adminInput, adminLabel } from "./ui";

type Values = { title: string; siteName: string; description: string; keywords: string; image: string; noIndex: boolean };

export function SeoForm({ initial, defaults }: { initial: Values; defaults: { title: string; siteName: string; description: string } }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSeoAction, {});
  const [v, setV] = useState(initial);
  const set = (k: keyof Values) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));
  const title = v.title || defaults.title;
  const desc = v.description || defaults.description;
  return (
    <form action={action} className={adminCard}>
      <h2 className="font-display text-2xl text-forest">Référencement (SEO) et balises méta</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Ce que Google et les réseaux sociaux affichent pour le site. Laissez un champ vide pour garder la valeur par défaut.
      </p>
      <div className="mt-5 space-y-5">
        <div>
          <label htmlFor="seoTitle" className={adminLabel}>Titre du site (page d&apos;accueil)</label>
          <input id="seoTitle" name="seoTitle" value={v.title} onChange={set("title")} maxLength={120} placeholder={defaults.title} className={adminInput} />
          <p className={adminHint}>{title.length} caractères — idéal : 50 à 60.</p>
        </div>
        <div>
          <label htmlFor="seoSiteName" className={adminLabel}>Nom ajouté aux autres pages</label>
          <input id="seoSiteName" name="seoSiteName" value={v.siteName} onChange={set("siteName")} maxLength={60} placeholder={defaults.siteName} className={adminInput} />
          <p className={adminHint}>Exemple : « Boutique — {v.siteName || defaults.siteName} ».</p>
        </div>
        <div>
          <label htmlFor="seoDescription" className={adminLabel}>Meta description</label>
          <textarea id="seoDescription" name="seoDescription" rows={3} value={v.description} onChange={set("description")} maxLength={320} placeholder={defaults.description} className={adminInput} />
          <p className={adminHint}>{desc.length} caractères — idéal : 120 à 160.</p>
        </div>
        <div>
          <label htmlFor="seoKeywords" className={adminLabel}>Mots-clés</label>
          <input id="seoKeywords" name="seoKeywords" value={v.keywords} onChange={set("keywords")} maxLength={400} placeholder="beauté naturelle, bien-être, Côte d'Ivoire" className={adminInput} />
          <p className={adminHint}>Séparés par des virgules.</p>
        </div>
        <div>
          <label htmlFor="seoImage" className={adminLabel}>Image de partage (réseaux sociaux)</label>
          <input id="seoImage" name="seoImage" value={v.image} onChange={set("image")} maxLength={300} placeholder="/videos/hero-desktop-poster-final.webp" className={adminInput} />
          <p className={adminHint}>Chemin du site (/images/…) ou adresse https://. Format conseillé : 1200 × 630.</p>
        </div>
        <label className="flex items-start gap-3 text-sm text-forest">
          <input type="checkbox" name="seoNoIndex" defaultChecked={v.noIndex} className="mt-1 h-4 w-4" />
          <span>
            <strong>Masquer le site des moteurs de recherche</strong>
            <span className="block text-xs text-ink-soft">À cocher uniquement pendant la préparation du site.</span>
          </span>
        </label>
        <div className="rounded-xl border border-forest/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Aperçu Google</p>
          <p className="mt-2 truncate text-lg text-[#1a0dab]">{title}</p>
          <p className="line-clamp-2 text-sm text-ink-soft">{desc}</p>
        </div>
        {(state.error || state.message) && (
          <p role={state.error ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ${state.error ? "bg-blush text-fuchsia-600" : "bg-mist font-semibold text-forest"}`}>
            {state.error ?? `✓ ${state.message}`}
          </p>
        )}
        <button type="submit" disabled={pending} className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory disabled:opacity-60">
          {pending ? "Enregistrement…" : "Enregistrer le SEO"}
        </button>
      </div>
    </form>
  );
}
