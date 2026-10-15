"use client";

import Link from "next/link";
import type { Product } from "@/data/types";
import { formatFcfa } from "@/lib/format";
import { useProductState } from "./ProductState";

/**
 * Bloc prix + action. Aucun paiement n'est configuré : l'action ouvre une demande d'information
 * pré-remplie (produit et variante) via le formulaire de contact.
 */
export function ProductOffer({ product, light = false }: { product: Product; light?: boolean }) {
  const { variants, variant, selectVariant } = useProductState();
  const price = variant?.price ?? product.price;
  const query = new URLSearchParams({ produit: product.slug, ...(variant ? { variante: variant.id } : {}) });

  return (
    <div className={light ? "text-ivory" : "text-forest"}>
      {variants && (
        <fieldset className="mb-6">
          <legend className={`kicker mb-3 ${light ? "text-gold-soft" : "text-ink-soft"}`}>Choisir le format</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <label
                key={v.id}
                className={`cursor-pointer rounded-2xl border px-5 py-3 transition-colors has-[:checked]:border-fuchsia has-[:checked]:bg-fuchsia has-[:checked]:text-ivory has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-fuchsia ${
                  light ? "border-ivory/30" : "border-forest/20"
                }`}
              >
                <input type="radio" name="variante" value={v.id} checked={variant?.id === v.id} onChange={() => selectVariant(v.id)} className="sr-only" />
                <span className="block text-sm font-semibold uppercase tracking-[0.14em]">{v.label}</span>
                <span className="block text-sm opacity-80">{v.detail}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <div>
          <p className={`kicker ${light ? "text-gold-soft" : "text-ink-soft"}`}>{price === null ? "Disponibilité" : "Prix client"}</p>
          <p className="mt-1 font-display text-[2.6rem] leading-none tabular-nums" aria-live="polite">
            {formatFcfa(price)}
          </p>
        </div>
        {(variant?.detail || product.format) && (
          <p className={`pb-1 text-sm ${light ? "text-ivory/70" : "text-ink-soft"}`}>{variant?.detail ?? product.format}</p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/contact?${query.toString()}`} className={`btn ${light ? "btn-light" : "btn-primary"}`}>
          {price === null ? "Demander le prix" : "Demander ce produit"} <span className="btn-arrow" aria-hidden="true">→</span>
        </Link>
      </div>
      <p className={`mt-4 max-w-sm text-xs ${light ? "text-ivory/60" : "text-ink-soft"}`}>
        Commande en ligne non disponible pour le moment : votre demande est transmise à l&apos;équipe Obirin, qui vous recontacte.
      </p>
    </div>
  );
}
