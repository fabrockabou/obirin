"use client";

import { useState } from "react";

type Option = { value: string; label: string };
type Status = { state: "idle" } | { state: "sending" } | { state: "success" } | { state: "error"; message: string };

const field =
  "w-full rounded-2xl border border-forest/20 bg-ivory px-5 py-4 text-[1.02rem] text-ink placeholder:text-ink-soft/50 transition-colors focus:border-fuchsia focus:outline-none aria-[invalid=true]:border-fuchsia";

export function ContactForm({
  products,
  services,
  defaults,
}: {
  products: Option[];
  services: Option[];
  defaults: { sujet: string; produit: string; variante: string; service: string };
}) {
  const [sujet, setSujet] = useState(defaults.sujet);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries()) as Record<string, string>;
    setStatus({ state: "sending" });
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, consentement: form.get("consentement") === "on" }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: Record<string, string>; error?: string };
      if (res.ok && json.ok) {
        setStatus({ state: "success" });
        return;
      }
      if (json.errors) {
        setErrors(json.errors);
        setStatus({ state: "error", message: "Merci de vérifier les champs indiqués." });
        return;
      }
      setStatus({ state: "error", message: json.error ?? "Une erreur est survenue. Merci de réessayer." });
    } catch {
      setStatus({ state: "error", message: "Connexion impossible. Vérifiez votre réseau puis réessayez." });
    }
  }

  if (status.state === "success") {
    return (
      <div role="status" className="rounded-[2rem] bg-forest p-10 text-ivory">
        <p className="kicker text-gold-soft">Demande enregistrée</p>
        <p className="mt-4 font-display text-4xl leading-tight">Merci, votre demande a bien été transmise à l&apos;équipe Obirin.</p>
        <p className="mt-4 text-ivory/75">Vous serez recontacté(e) au numéro ou à l&apos;adresse indiqués.</p>
        <button type="button" onClick={() => setStatus({ state: "idle" })} className="btn btn-ghost-light mt-8">
          Envoyer une autre demande
        </button>
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

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <fieldset>
        <legend className="kicker mb-4 text-ink-soft">Objet de votre demande</legend>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "produit", label: "Un produit" },
            { value: "rendez-vous", label: "Un rendez-vous" },
            { value: "question", label: "Une question" },
          ].map((o) => (
            <label
              key={o.value}
              className="cursor-pointer rounded-full border border-forest/20 px-5 py-3 text-sm font-semibold transition-colors has-[:checked]:border-forest has-[:checked]:bg-forest has-[:checked]:text-ivory has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-fuchsia"
            >
              <input type="radio" name="sujet" value={o.value} checked={sujet === o.value} onChange={() => setSujet(o.value)} className="sr-only" />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      {sujet === "produit" && (
        <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="produit" className="mb-2 block text-sm font-semibold text-forest">
              Produit
            </label>
            <select id="produit" name="produit" defaultValue={defaults.produit} className={field} {...aria("produit")}>
              <option value="">— Choisir un produit —</option>
              {products.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {err("produit")}
          </div>
          {defaults.variante && <input type="hidden" name="variante" value={defaults.variante} />}
        </div>
      )}

      {sujet === "rendez-vous" && (
        <div>
          <label htmlFor="service" className="mb-2 block text-sm font-semibold text-forest">
            Service souhaité
          </label>
          <select id="service" name="service" defaultValue={defaults.service} className={field} {...aria("service")}>
            <option value="">— Choisir un service —</option>
            {services.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {err("service")}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="nom" className="mb-2 block text-sm font-semibold text-forest">
            Nom et prénom <span aria-hidden="true">*</span>
          </label>
          <input id="nom" name="nom" autoComplete="name" required className={field} {...aria("nom")} />
          {err("nom")}
        </div>
        <div>
          <label htmlFor="telephone" className="mb-2 block text-sm font-semibold text-forest">
            Téléphone / WhatsApp
          </label>
          <input id="telephone" name="telephone" type="tel" autoComplete="tel" inputMode="tel" className={field} {...aria("telephone")} />
          {err("telephone")}
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-forest">
            E-mail
          </label>
          <input id="email" name="email" type="email" autoComplete="email" className={field} {...aria("email")} />
          {err("email")}
        </div>
      </div>
      <p className="-mt-2 text-sm text-ink-soft">Indiquez au moins un moyen de vous recontacter.</p>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-semibold text-forest">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className={field}
          placeholder={sujet === "rendez-vous" ? "Vos disponibilités, vos questions…" : "Votre question, la quantité souhaitée…"}
        />
      </div>

      {/* champ piège anti-robots, invisible pour les humains */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="site">Ne pas remplir</label>
        <input id="site" name="site" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-ink-soft">
          <input type="checkbox" name="consentement" className="mt-1 size-5 accent-fuchsia" {...aria("consentement")} />
          J&apos;accepte qu&apos;Obirin utilise ces informations pour me recontacter au sujet de ma demande.
        </label>
        {err("consentement")}
      </div>

      {status.state === "error" && (
        <p role="alert" className="rounded-2xl bg-blush px-5 py-4 text-sm text-fuchsia-600">
          {status.message}
        </p>
      )}

      <button type="submit" disabled={status.state === "sending"} className="btn btn-primary disabled:opacity-60">
        {status.state === "sending" ? "Envoi en cours…" : "Envoyer ma demande"}
        <span className="btn-arrow" aria-hidden="true">
          →
        </span>
      </button>
    </form>
  );
}
