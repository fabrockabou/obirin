"use client";

import Image from "next/image";
import { useActionState, useMemo, useRef, useState } from "react";
import { saveProductAction, type FormState } from "@/app/admin/actions";
import type { ImageAsset, Product } from "@/data/types";
import { adminCard, adminHint, adminInput, adminLabel } from "./ui";

type Option = { id: string; label: string };

const slugify = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

const lines = (v?: string[]) => (v ?? []).join("\n");
const toList = (s: string) =>
  s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

type State = {
  slug: string;
  name: string;
  packagingName: string;
  collection: string;
  hidden: boolean;
  onRequest: boolean;
  price: string;
  format: string;
  catalogueCategory: string;
  tagline: string;
  intro: string;
  signature: string;
  benefitsTitle: string;
  benefits: { title: string; text: string }[];
  highlights: string;
  composition: string;
  usage: string;
  forWhom: string;
  plus: string;
  routine: string;
  precautions: string;
  ingredientTitle: string;
  ingredientText: string;
  sourceNote: string;
  layout: string;
  tone: string;
  related: string[];
  variants: { id: string; label: string; detail: string; price: string }[];
  image: ImageAsset | null;
  cutout: ImageAsset | null;
  gallery: ImageAsset[];
};

function initialState(p?: Product): State {
  return {
    slug: p?.slug ?? "",
    name: p?.name ?? "",
    packagingName: p?.packagingName ?? "",
    collection: p?.collection ?? "",
    hidden: p?.hidden ?? false,
    onRequest: p ? p.price === null : false,
    price: p?.price != null ? String(p.price) : "",
    format: p?.format ?? "",
    catalogueCategory: p?.catalogueCategory ?? "",
    tagline: p?.tagline ?? "",
    intro: p?.intro ?? "",
    signature: p?.signature ?? "",
    benefitsTitle: p?.benefitsTitle ?? "",
    benefits: (p?.benefits ?? []).map((b) => ({ title: b.title, text: b.text ?? "" })),
    highlights: lines(p?.highlights),
    composition: lines(p?.composition),
    usage: lines(p?.usage),
    forWhom: lines(p?.forWhom),
    plus: lines(p?.plus),
    routine: lines(p?.routine),
    precautions: lines(p?.precautions),
    ingredientTitle: p?.ingredientNote?.title ?? "",
    ingredientText: p?.ingredientNote?.text ?? "",
    sourceNote: p?.sourceNote ?? "",
    layout: p?.layout ?? "split",
    tone: p?.tone ?? "emerald",
    related: p?.related ?? [],
    variants: (p?.variants ?? []).map((v) => ({ id: v.id, label: v.label, detail: v.detail, price: String(v.price) })),
    image: p?.image ?? null,
    cutout: p?.cutout ?? null,
    gallery: p?.gallery ?? [],
  };
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className={adminCard}>
      <h2 className="font-display text-2xl text-forest">{title}</h2>
      {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, hint, children, id }: { label: string; hint?: string; children: React.ReactNode; id: string }) {
  return (
    <div>
      <label htmlFor={id} className={adminLabel}>
        {label}
      </label>
      {children}
      {hint && <p className={adminHint}>{hint}</p>}
    </div>
  );
}

/** Aperçu d'une image + choix d'un nouveau fichier (l'aperçu se met à jour avant l'envoi). */
function ImagePicker({
  label,
  hint,
  name,
  current,
  onRemove,
  transparent = false,
}: {
  label: string;
  hint: string;
  name: string;
  current: ImageAsset | null;
  onRemove?: () => void;
  transparent?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const src = preview ?? current?.src;
  return (
    <div className="grid gap-4 sm:grid-cols-[9rem_1fr] sm:items-center">
      <div
        className="relative aspect-square overflow-hidden rounded-xl border border-forest/10"
        style={{ background: transparent ? "repeating-conic-gradient(#e9e4da 0% 25%, #fff 0% 50%) 50% / 16px 16px" : "#f1e9dc" }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="absolute inset-0 size-full object-contain p-2" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-xs text-ink-soft">Aucune image</span>
        )}
      </div>
      <div>
        <p className={adminLabel}>{label}</p>
        <p className="text-xs text-ink-soft">{hint}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-full border border-forest/25 px-4 py-2 text-sm font-semibold text-forest hover:bg-forest hover:text-ivory">
            {src ? "Remplacer…" : "Choisir une image…"}
            <input
              ref={input}
              type="file"
              name={name}
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
          </label>
          {(preview || (current && onRemove)) && (
            <button
              type="button"
              className="rounded-full px-4 py-2 text-sm text-fuchsia hover:underline"
              onClick={() => {
                if (preview) {
                  setPreview(null);
                  if (input.current) input.current.value = "";
                } else onRemove?.();
              }}
            >
              {preview ? "Annuler" : "Retirer"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductForm({
  product,
  others,
  collections,
  layouts,
  tones,
}: {
  product?: Product;
  others: { slug: string; name: string }[];
  collections: { slug: string; name: string }[];
  layouts: Option[];
  tones: Option[];
}) {
  const [s, setS] = useState<State>(() => initialState(product));
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [state, action, pending] = useActionState<FormState, FormData>(saveProductAction, {});
  const set = <K extends keyof State>(key: K, value: State[K]) => setS((prev) => ({ ...prev, [key]: value }));
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const payload = useMemo(
    () =>
      JSON.stringify({
        slug: s.slug,
        name: s.name,
        packagingName: s.packagingName,
        collection: s.collection,
        hidden: s.hidden,
        price: s.onRequest ? null : s.price,
        format: s.format,
        catalogueCategory: s.catalogueCategory,
        tagline: s.tagline,
        intro: s.intro,
        signature: s.signature,
        benefitsTitle: s.benefitsTitle,
        benefits: s.benefits,
        highlights: toList(s.highlights),
        composition: toList(s.composition),
        usage: toList(s.usage),
        forWhom: toList(s.forWhom),
        plus: toList(s.plus),
        routine: toList(s.routine),
        precautions: toList(s.precautions),
        ingredientNote: { title: s.ingredientTitle, text: s.ingredientText },
        sourceNote: s.sourceNote,
        layout: s.layout,
        tone: s.tone,
        related: s.related,
        variants: s.variants,
        image: s.image,
        cutout: s.cutout,
        gallery: s.gallery,
      }),
    [s],
  );

  const textarea = (key: keyof State, label: string, hint = "Un élément par ligne.", rows = 4) => (
    <Field id={`f-${key}`} label={label} hint={hint}>
      <textarea id={`f-${key}`} rows={rows} value={s[key] as string} onChange={(e) => set(key, e.target.value as never)} className={adminInput} />
    </Field>
  );

  return (
    <form action={action} className="mt-8 space-y-6">
      <input type="hidden" name="product" value={payload} />
      {product && <input type="hidden" name="previousSlug" value={product.slug} />}

      <Section title="Essentiel">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="f-name" label="Nom du produit *">
            <input
              id="f-name"
              required
              value={s.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              className={adminInput}
            />
          </Field>
          <Field id="f-packaging" label="Nom imprimé sur l'emballage">
            <input id="f-packaging" value={s.packagingName} onChange={(e) => set("packagingName", e.target.value)} className={adminInput} />
          </Field>
          <Field id="f-collection" label="Univers *">
            <select id="f-collection" required value={s.collection} onChange={(e) => set("collection", e.target.value)} className={adminInput}>
              <option value="">— Choisir —</option>
              {collections.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="f-slug" label="Adresse de la page" hint={`obirin…/produits/${s.slug || "…"}`}>
            <input
              id="f-slug"
              value={s.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              className={adminInput}
            />
          </Field>
        </div>
        <label className="flex items-center gap-3 rounded-xl bg-cream px-4 py-3 text-sm font-semibold text-forest">
          <input type="checkbox" checked={s.hidden} onChange={(e) => set("hidden", e.target.checked)} className="size-4 accent-fuchsia" />
          Masquer ce produit du site (il reste enregistré ici)
        </label>
      </Section>

      <Section title="Prix et format">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="f-price" label="Prix client (FCFA)">
            <input
              id="f-price"
              type="number"
              min={0}
              step={10}
              inputMode="numeric"
              disabled={s.onRequest}
              value={s.price}
              onChange={(e) => set("price", e.target.value)}
              className={`${adminInput} disabled:opacity-40`}
            />
            <label className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
              <input type="checkbox" checked={s.onRequest} onChange={(e) => set("onRequest", e.target.checked)} className="accent-fuchsia" />
              Prix sur demande
            </label>
          </Field>
          <Field id="f-format" label="Format / contenance" hint="Ex. 300 mg × 90 capsules, 50 ml…">
            <input id="f-format" value={s.format} onChange={(e) => set("format", e.target.value)} className={adminInput} />
          </Field>
        </div>

        <div>
          <p className={adminLabel}>Variantes (facultatif)</p>
          <p className={adminHint}>Pour un produit proposé en plusieurs formats (ex. serviettes Jour / Nuit). Le client choisit la variante sur la fiche.</p>
          <div className="mt-3 space-y-2">
            {s.variants.map((v, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_8rem_auto]">
                {(["label", "detail", "price"] as const).map((k) => (
                  <input
                    key={k}
                    aria-label={k === "label" ? "Nom de la variante" : k === "detail" ? "Détail" : "Prix"}
                    placeholder={k === "label" ? "Nom (ex. Nuit)" : k === "detail" ? "Détail (ex. 290 mm — 8 pièces)" : "Prix"}
                    type={k === "price" ? "number" : "text"}
                    value={v[k]}
                    onChange={(e) => set("variants", s.variants.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)))}
                    className={adminInput}
                  />
                ))}
                <button type="button" onClick={() => set("variants", s.variants.filter((_, j) => j !== i))} className="px-3 text-sm text-fuchsia">
                  Retirer
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => set("variants", [...s.variants, { id: "", label: "", detail: "", price: s.price }])}
              className="text-sm font-semibold text-emerald hover:underline"
            >
              + Ajouter une variante
            </button>
          </div>
        </div>
      </Section>

      <Section title="Images" hint="JPEG, PNG ou WebP, 12 Mo maximum. Les images sont optimisées automatiquement.">
        <ImagePicker
          label="Image principale *"
          hint="Photo du produit utilisée sur la fiche, dans la boutique et la recherche."
          name="mainImage"
          current={s.image}
        />
        <ImagePicker
          label="Image détourée (fond transparent)"
          hint="Facultatif. Un PNG sans fond donne le plus beau rendu : le produit est posé sur le fond coloré du site."
          name="cutoutImage"
          current={s.cutout}
          onRemove={() => set("cutout", null)}
          transparent
        />
        <div>
          <p className={adminLabel}>Galerie</p>
          <p className={adminHint}>Images supplémentaires affichées dans la galerie de la fiche.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {s.gallery.map((g, i) => (
              <div key={g.src} className="relative size-24 overflow-hidden rounded-xl border border-forest/10 bg-cream">
                <Image src={g.src} alt="" fill sizes="96px" className="object-contain p-1" />
                <button
                  type="button"
                  aria-label="Retirer cette image"
                  onClick={() => set("gallery", s.gallery.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ivory text-xs text-fuchsia shadow"
                >
                  ✕
                </button>
              </div>
            ))}
            {galleryPreviews.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" className="size-24 rounded-xl border-2 border-dashed border-emerald/50 object-contain p-1" />
            ))}
            <label className="grid size-24 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-forest/25 text-center text-xs font-semibold text-forest hover:border-forest">
              + Ajouter
              <input
                type="file"
                name="galleryImages"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                onChange={(e) => setGalleryPreviews(Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f)))}
              />
            </label>
          </div>
        </div>
      </Section>

      <Section title="Textes de présentation">
        <Field id="f-tagline" label="Accroche" hint="Une phrase courte sous le nom (ex. « Vitalité et bien-être au naturel »).">
          <input id="f-tagline" value={s.tagline} onChange={(e) => set("tagline", e.target.value)} className={adminInput} />
        </Field>
        {textarea("intro", "Description", "Paragraphe de présentation affiché en haut de la fiche.", 5)}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="f-signature" label="Citation / signature (facultatif)">
            <input id="f-signature" value={s.signature} onChange={(e) => set("signature", e.target.value)} className={adminInput} />
          </Field>
          <Field id="f-category" label="Catégorie (facultatif)" hint="Ex. Soin du visage">
            <input id="f-category" value={s.catalogueCategory} onChange={(e) => set("catalogueCategory", e.target.value)} className={adminInput} />
          </Field>
        </div>
      </Section>

      <Section title="Bienfaits">
        <Field id="f-benefitsTitle" label="Titre de la rubrique" hint="Par défaut : « Les bienfaits ».">
          <input id="f-benefitsTitle" value={s.benefitsTitle} onChange={(e) => set("benefitsTitle", e.target.value)} className={adminInput} />
        </Field>
        <div className="space-y-3">
          {s.benefits.map((b, i) => (
            <div key={i} className="grid gap-2 rounded-xl bg-cream p-3 sm:grid-cols-[1fr_2fr_auto]">
              <input
                aria-label="Titre du bienfait"
                placeholder="Titre"
                value={b.title}
                onChange={(e) => set("benefits", s.benefits.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                className={adminInput}
              />
              <textarea
                aria-label="Texte du bienfait"
                placeholder="Texte (facultatif)"
                rows={2}
                value={b.text}
                onChange={(e) => set("benefits", s.benefits.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                className={adminInput}
              />
              <div className="flex gap-1 sm:flex-col">
                <button type="button" disabled={i === 0} aria-label="Monter" onClick={() => { const n = [...s.benefits]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; set("benefits", n); }} className="px-2 text-sm disabled:opacity-30">↑</button>
                <button type="button" aria-label="Retirer" onClick={() => set("benefits", s.benefits.filter((_, j) => j !== i))} className="px-2 text-sm text-fuchsia">✕</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => set("benefits", [...s.benefits, { title: "", text: "" }])} className="text-sm font-semibold text-emerald hover:underline">
            + Ajouter un bienfait
          </button>
        </div>
      </Section>

      <Section title="Informations détaillées" hint="Chaque rubrique n'apparaît sur la fiche que si elle est remplie.">
        <div className="grid gap-5 lg:grid-cols-2">
          {textarea("composition", "Composition / ingrédients")}
          {textarea("usage", "Mode d'utilisation")}
          {textarea("forWhom", "Pour qui ?")}
          {textarea("plus", "Les plus")}
          {textarea("routine", "Dans votre routine")}
          {textarea("precautions", "Précautions")}
          {textarea("highlights", "Points clés (pastilles)", "Un point par ligne, ex. « Sans colorant ».")}
          <div className="space-y-3">
            <Field id="f-ingTitle" label="Encadré ingrédient — titre" hint="Ex. Extrait de bleuet">
              <input id="f-ingTitle" value={s.ingredientTitle} onChange={(e) => set("ingredientTitle", e.target.value)} className={adminInput} />
            </Field>
            <Field id="f-ingText" label="Encadré ingrédient — texte">
              <input id="f-ingText" value={s.ingredientText} onChange={(e) => set("ingredientText", e.target.value)} className={adminInput} />
            </Field>
          </div>
        </div>
        {textarea("sourceNote", "Note complémentaire (facultatif)", "Affichée en bas de la fiche, ex. mentions de l'emballage.", 2)}
      </Section>

      <Section title="Présentation de la fiche">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="f-layout" label="Mise en page">
            <select id="f-layout" value={s.layout} onChange={(e) => set("layout", e.target.value)} className={adminInput}>
              {layouts.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="f-tone" label="Couleur d'ambiance">
            <select id="f-tone" value={s.tone} onChange={(e) => set("tone", e.target.value)} className={adminInput}>
              {tones.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div>
          <p className={adminLabel}>Produits associés</p>
          <p className={adminHint}>Affichés en bas de la fiche (3 conseillés).</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <label key={o.slug} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-fuchsia"
                  checked={s.related.includes(o.slug)}
                  onChange={(e) => set("related", e.target.checked ? [...s.related, o.slug] : s.related.filter((r) => r !== o.slug))}
                />
                {o.name}
              </label>
            ))}
          </div>
        </div>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 rounded-2xl bg-forest px-5 py-4 text-ivory shadow-2xl">
        <button type="submit" disabled={pending} className="btn btn-light disabled:opacity-60">
          {pending ? "Enregistrement…" : product ? "Enregistrer les modifications" : "Créer le produit"}
        </button>
        {state.error ? (
          <p role="alert" className="text-sm font-semibold text-rose">
            {state.error}
          </p>
        ) : (
          <p className="text-sm text-ivory/70">Le site est mis à jour dès l&apos;enregistrement.</p>
        )}
      </div>
    </form>
  );
}
