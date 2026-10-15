import Link from "next/link";
import { Kicker } from "@/components/ui/primitives";
import { getProduct } from "@/lib/store";
import type { Product } from "@/data/types";
import { tones } from "@/lib/tones";

function List({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <div data-reveal="up">
      <h3 className="kicker text-ink-soft">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((it) => (
          <li key={it} className="flex gap-3 text-[1.02rem] text-ink">
            <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full" style={{ background: accent }} aria-hidden="true" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Contenu détaillé d'une fiche : chaque bloc n'apparaît que si l'information existe dans la source. */
export function ProductDetails({ product }: { product: Product }) {
  const tone = tones[product.tone];
  const hasBenefits = product.benefits.length > 0;

  return (
    <div className="bg-ivory">
      {hasBenefits && (
        <section className="container-luxe py-24 lg:py-32" aria-labelledby="bienfaits">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Kicker className="text-fuchsia">{product.benefitsTitle ?? "Les bienfaits"}</Kicker>
              <h2 id="bienfaits" data-reveal="up" className="display mt-6 text-[length:var(--text-subtitle)] text-forest">
                {product.tagline}
              </h2>
              {product.signature && (
                <p data-reveal="up" className="mt-8 font-display text-2xl italic leading-snug" style={{ color: tone.accent }}>
                  « {product.signature} »
                </p>
              )}
            </div>
            <ol data-stagger className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
              {product.benefits.map((b, i) => (
                <li key={b.title} className="border-t border-forest/15 pt-6">
                  <span className="font-display text-lg italic" style={{ color: tone.accent }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-[1.7rem] leading-tight text-forest">{b.title}</h3>
                  {b.text && <p className="mt-3 text-ink-soft">{b.text}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {(product.plants || product.ingredientNote || product.highlights) && (
        <section className="py-20" style={{ background: tone.soft }} aria-label="Ingrédients et points clés">
          <div className="container-luxe grid gap-12 lg:grid-cols-12">
            {product.plants && (
              <div className="lg:col-span-8">
                <Kicker className="text-forest">Des plantes sélectionnées</Kicker>
                <ul data-stagger className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {product.plants.map((p) => (
                    <li key={p.name} className="rounded-2xl bg-ivory/80 p-5">
                      <p className="font-display text-xl leading-tight text-forest">{p.name}</p>
                      {p.latin && <p className="mt-1 text-xs italic text-ink-soft">{p.latin}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {product.ingredientNote && (
              <div data-reveal="up" className="lg:col-span-6">
                <Kicker className="text-forest">{product.ingredientNote.title}</Kicker>
                <p className="mt-6 font-display text-[length:var(--text-subtitle)] leading-tight text-forest">{product.ingredientNote.text}</p>
              </div>
            )}
            {product.highlights && (
              <ul data-stagger className={`flex flex-wrap content-start gap-2 ${product.plants ? "lg:col-span-4" : "lg:col-span-6"}`}>
                {product.highlights.map((h) => (
                  <li key={h} className="rounded-full border border-forest/20 bg-ivory/70 px-4 py-2 text-sm font-medium text-forest">
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <section className="container-luxe grid gap-14 py-24 md:grid-cols-2 lg:grid-cols-3 lg:py-28" aria-label="Informations pratiques">
        {product.usage && <List title={product.plus ? "Conseils d'utilisation" : "Mode d'utilisation"} items={product.usage} accent={tone.accent} />}
        {product.forWhom && <List title="Pour qui ?" items={product.forWhom} accent={tone.accent} />}
        {product.composition && <List title="Composition principale" items={product.composition} accent={tone.accent} />}
        {product.routine && <List title="À intégrer dans votre routine" items={product.routine} accent={tone.accent} />}
        {product.plus && <List title="Les plus" items={product.plus} accent={tone.accent} />}
        {product.associations && (
          <div data-reveal="up">
            <h3 className="kicker text-ink-soft">Associations recommandées</h3>
            <ul className="mt-5 space-y-3">
              {product.associations.map((a) => {
                const target = a.slug ? getProduct(a.slug) : undefined;
                return (
                  <li key={a.text} className="flex gap-3">
                    <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full" style={{ background: tone.accent }} aria-hidden="true" />
                    {target ? (
                      <Link href={`/produits/${target.slug}`} className="link-underline text-forest hover:text-fuchsia">
                        {a.text}
                      </Link>
                    ) : (
                      <span>{a.text}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {(product.precautions || product.sourceNote || product.cataloguePage) && (
        <section className="container-luxe pb-24" aria-label="À noter">
          <div className="grid gap-8 rounded-[2rem] border border-forest/12 bg-cream/60 p-8 md:grid-cols-[auto_1fr] md:p-12">
            <span className="grid size-14 place-items-center rounded-full font-display text-2xl italic text-ivory" style={{ background: tone.accent }} aria-hidden="true">
              i
            </span>
            <div>
              {product.precautions && (
                <>
                  <h2 className="kicker text-forest">{product.forWhom ? "Précautions" : "À noter"}</h2>
                  <ul className="mt-4 space-y-2 text-ink">
                    {product.precautions.map((p) => (
                      <li key={p}>• {p}</li>
                    ))}
                  </ul>
                </>
              )}
              {product.sourceNote && <p className="mt-6 text-sm text-ink-soft">{product.sourceNote}</p>}
              <p className="mt-6 text-sm text-ink-soft">
                {product.cataloguePage
                  ? `Informations et prix issus du catalogue Green World — octobre 2026, page ${product.cataloguePage}.`
                  : "Référence hors catalogue d'octobre 2026 : informations limitées au texte de l'emballage."}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
