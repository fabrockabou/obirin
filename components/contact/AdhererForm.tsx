"use client";

import { useMemo, useState } from "react";
import { WhatsappIcon } from "@/components/ui/WhatsappIcon";
import { inscriptionMessage } from "@/lib/inscription-message";
import { whatsappLink } from "@/lib/whatsapp";

type ProductGroup = { name: string; products: { slug: string; name: string }[] };
type Status = { state: "idle" } | { state: "sending" } | { state: "success" } | { state: "error"; message: string };

const field =
  "w-full rounded-2xl border border-forest/20 bg-ivory px-5 py-4 text-[1.02rem] text-ink placeholder:text-ink-soft/50 transition-colors focus:border-fuchsia focus:outline-none aria-[invalid=true]:border-fuchsia";

const normalize = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function AdhererForm({ groups, whatsapp }: { groups: ProductGroup[]; whatsapp: { number: string; greeting: string } }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [waLink, setWaLink] = useState("");
  const [waOpened, setWaOpened] = useState(false);

  const names = useMemo(() => new Map(groups.flatMap((g) => g.products.map((p) => [p.slug, p.name] as const))), [groups]);
  const visible = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return groups;
    return groups.map((g) => ({ ...g, products: g.products.filter((p) => normalize(p.name).includes(q)) })).filter((g) => g.products.length);
  }, [groups, query]);

  const toggle = (slug: string) => setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const v = (k: string) => String(form.get(k) ?? "").trim();
    const payload = {
      nom: v("nom"),
      prenom: v("prenom"),
      email: v("email"),
      telephone: v("telephone"),
      whatsapp: v("whatsapp"),
      adresse: v("adresse"),
      produits: selected,
      consentement: form.get("consentement") === "on",
      site: v("site"),
    };
    const link = whatsapp.number
      ? whatsappLink(whatsapp.number, inscriptionMessage({ ...payload, produits: selected.map((s) => ({ name: names.get(s) ?? s })) }, whatsapp.greeting))
      : "";
    // Même fonctionnement que le formulaire de contact : l'onglet WhatsApp est ouvert pendant le clic
    // (sinon bloqué par le navigateur), puis dirigé vers WhatsApp si l'enregistrement réussit.
    const looksComplete =
      payload.nom.length >= 2 && payload.prenom.length >= 2 && payload.email && payload.telephone && payload.adresse && selected.length > 0 && payload.consentement;
    let waWindow: Window | null = null;
    if (link && looksComplete) {
      waWindow = window.open("", "_blank");
      if (waWindow) {
        waWindow.opener = null;
        waWindow.document.title = "Ouverture de WhatsApp…";
        waWindow.document.body.innerHTML = '<p style="font-family:system-ui,sans-serif;padding:2rem;color:#0a2a1d">Ouverture de WhatsApp…</p>';
      }
    }
    setStatus({ state: "sending" });
    setErrors({});
    try {
      const res = await fetch("/api/adherer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: Record<string, string>; error?: string };
      if (res.ok && json.ok) {
        setWaLink(link);
        if (waWindow && !waWindow.closed) {
          waWindow.location.href = link;
          setWaOpened(true);
        } else if (link && window.matchMedia("(pointer: coarse)").matches) {
          setWaOpened(true);
          window.setTimeout(() => window.location.assign(link), 600);
        }
        setStatus({ state: "success" });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      waWindow?.close();
      if (json.errors) {
        setErrors(json.errors);
        setStatus({ state: "error", message: "Merci de vérifier les champs indiqués." });
        return;
      }
      setStatus({ state: "error", message: json.error ?? "Une erreur est survenue. Merci de réessayer." });
    } catch {
      waWindow?.close();
      setStatus({ state: "error", message: "Connexion impossible. Vérifiez votre réseau puis réessayez." });
    }
  }

  if (status.state === "success") {
    return (
      <div role="status" className="rounded-[2rem] bg-forest p-10 text-ivory">
        <p className="kicker text-gold-soft">Demande enregistrée</p>
        <p className="mt-4 font-display text-4xl leading-tight">Merci, votre demande d&apos;adhésion a bien été transmise à l&apos;équipe Obirin.</p>
        <p className="mt-4 text-ivory/75">Nous vous recontactons très vite pour finaliser votre adhésion.</p>
        {waLink && (
          <div className="mt-8 rounded-2xl bg-ivory/10 p-5">
            <p className="text-sm text-ivory/85">
              {waOpened
                ? "WhatsApp s'est ouvert avec votre message prêt : appuyez sur « Envoyer » pour nous l'adresser. Si rien ne s'est ouvert :"
                : "Pour une réponse plus rapide, envoyez aussi votre demande sur WhatsApp :"}
            </p>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn mt-4 bg-[#25d366] text-forest before:bg-[#1ebe5b]">
              <WhatsappIcon /> Envoyer aussi sur WhatsApp
            </a>
          </div>
        )}
      </div>
    );
  }

  const err = (name: string) =>
    errors[name] ? (
      <p id={`${name}-erreur`} className="mt-2 text-sm text-fuchsia">
        {errors[name]}
      </p>
    ) : null;
  const aria = (name: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `${name}-erreur` : undefined });
  const input = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, required = true) => (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-semibold text-forest">
        {label} {required ? <span aria-hidden="true">*</span> : <span className="font-normal text-ink-soft">(optionnel)</span>}
      </label>
      <input id={name} name={name} required={required} className={field} {...aria(name)} {...props} />
      {err(name)}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {input("nom", "Nom", { autoComplete: "family-name" })}
        {input("prenom", "Prénom", { autoComplete: "given-name" })}
      </div>

      <fieldset {...aria("produits")}>
        <legend className="mb-2 block text-sm font-semibold text-forest">
          Produits qui vous intéressent <span aria-hidden="true">*</span>
        </legend>
        <div className="rounded-2xl border border-forest/20 bg-ivory">
          <div className="flex flex-wrap items-center gap-3 border-b border-forest/10 p-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit…"
              aria-label="Rechercher un produit"
              className="min-w-0 flex-1 rounded-xl bg-cream px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia/30"
            />
            <span className="text-sm text-ink-soft" aria-live="polite">
              {selected.length} sélectionné{selected.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto p-3">
            {visible.length === 0 && <p className="p-3 text-sm text-ink-soft">Aucun produit ne correspond à votre recherche.</p>}
            {visible.map((g) => (
              <div key={g.name} className="mb-3 last:mb-0">
                <p className="kicker px-2 pb-1 pt-2 text-ink-soft">{g.name}</p>
                <ul className="grid gap-1 sm:grid-cols-2">
                  {g.products.map((p) => (
                    <li key={p.slug}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 text-sm text-ink hover:bg-cream has-[:checked]:bg-mist has-[:checked]:text-forest">
                        <input type="checkbox" checked={selected.includes(p.slug)} onChange={() => toggle(p.slug)} className="mt-0.5 size-4 shrink-0 accent-fuchsia" />
                        <span>{p.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        {err("produits")}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">{input("email", "E-mail", { type: "email", autoComplete: "email" })}</div>
        {input("telephone", "Numéro de téléphone", { type: "tel", autoComplete: "tel", inputMode: "tel" })}
        {input("whatsapp", "Numéro WhatsApp", { type: "tel", inputMode: "tel" }, false)}
      </div>

      <div>
        <label htmlFor="adresse" className="mb-2 block text-sm font-semibold text-forest">
          Adresse <span aria-hidden="true">*</span>
        </label>
        <textarea id="adresse" name="adresse" rows={3} required autoComplete="street-address" className={field} placeholder="Ville, quartier, pays…" {...aria("adresse")} />
        {err("adresse")}
      </div>

      {/* champ piège anti-robots, invisible pour les humains */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="site">Ne pas remplir</label>
        <input id="site" name="site" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-ink-soft">
          <input type="checkbox" name="consentement" className="mt-1 size-5 accent-fuchsia" {...aria("consentement")} />
          J&apos;accepte qu&apos;Obirin utilise ces informations pour me recontacter au sujet de mon adhésion.
        </label>
        {err("consentement")}
      </div>

      {status.state === "error" && (
        <p role="alert" className="rounded-2xl bg-blush px-5 py-4 text-sm text-fuchsia-600">
          {status.message}
        </p>
      )}

      <button type="submit" disabled={status.state === "sending"} className="btn btn-primary disabled:opacity-60">
        {status.state === "sending" ? "Envoi en cours…" : "Envoyer ma demande d'adhésion"}
        <span className="btn-arrow" aria-hidden="true">
          →
        </span>
      </button>
    </form>
  );
}
