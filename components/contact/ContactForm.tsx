"use client";

import { useState } from "react";
import { WhatsappIcon } from "@/components/ui/WhatsappIcon";
import { whatsappLink } from "@/lib/whatsapp";

type Option = { value: string; label: string };
type Status = { state: "idle" } | { state: "sending" } | { state: "success" } | { state: "error"; message: string };

const field =
  "w-full rounded-2xl border border-forest/20 bg-ivory px-5 py-4 text-[1.02rem] text-ink placeholder:text-ink-soft/50 transition-colors focus:border-fuchsia focus:outline-none aria-[invalid=true]:border-fuchsia";

export function ContactForm({
  products,
  services,
  defaults,
  whatsapp,
}: {
  products: Option[];
  services: Option[];
  defaults: { sujet: string; produit: string; variante: string; service: string };
  /** Numéro WhatsApp Business (réglé dans l'administration) ; vide = pas de bouton */
  whatsapp: { number: string; greeting: string };
}) {
  const [sujet, setSujet] = useState(defaults.sujet);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [sent, setSent] = useState<Record<string, string>>({});
  const [waOpened, setWaOpened] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries()) as Record<string, string>;
    // Ouverture automatique de WhatsApp : l'onglet est ouvert tout de suite, pendant le clic (sinon les
    // navigateurs le bloquent), puis dirigé vers WhatsApp si l'envoi réussit, ou refermé en cas d'erreur.
    let waWindow: Window | null = null;
    // pas d'ouverture si un champ obligatoire manque (évite un onglet ouvert puis refermé aussitôt)
    const looksComplete =
      (payload.nom ?? "").trim().length >= 2 && Boolean((payload.telephone ?? "").trim() || (payload.email ?? "").trim()) && form.get("consentement") === "on";
    if (whatsapp.number && looksComplete) {
      waWindow = window.open("", "_blank");
      if (waWindow) {
        waWindow.opener = null;
        waWindow.document.title = "Ouverture de WhatsApp…";
        waWindow.document.body.innerHTML =
          '<p style="font-family:system-ui,sans-serif;padding:2rem;color:#0a2a1d">Ouverture de WhatsApp…</p>';
      }
    }
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
        const link = whatsapp.number ? whatsappLink(whatsapp.number, whatsappMessage(payload, whatsapp.greeting, products, services)) : "";
        if (waWindow && !waWindow.closed) {
          waWindow.location.href = link;
          setWaOpened(true);
        } else if (link && looksComplete && window.matchMedia("(pointer: coarse)").matches) {
          // téléphone dont le navigateur bloque les nouveaux onglets : on bascule vers WhatsApp (l'application s'ouvre)
          setWaOpened(true);
          window.setTimeout(() => window.location.assign(link), 600);
        }
        setSent(payload);
        setStatus({ state: "success" });
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
        <p className="mt-4 font-display text-4xl leading-tight">Merci, votre demande a bien été transmise à l&apos;équipe Obirin.</p>
        <p className="mt-4 text-ivory/75">Vous serez recontacté(e) au numéro ou à l&apos;adresse indiqués.</p>
        {whatsapp.number && (
          <div className="mt-8 rounded-2xl bg-ivory/10 p-5">
            <p className="text-sm text-ivory/85">
              {waOpened
                ? "WhatsApp s'est ouvert avec votre message prêt : appuyez sur « Envoyer » pour nous l'adresser depuis votre numéro. Si rien ne s'est ouvert :"
                : "Pour une réponse plus rapide, envoyez aussi votre demande sur WhatsApp :"}
            </p>
            <a
              href={whatsappLink(whatsapp.number, whatsappMessage(sent, whatsapp.greeting, products, services))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-4 bg-[#25d366] text-forest before:bg-[#1ebe5b]"
            >
              <WhatsappIcon /> Envoyer aussi sur WhatsApp
            </a>
          </div>
        )}
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

/** Message WhatsApp pré-rempli avec ce que le visiteur a saisi (dont son numéro de téléphone). */
function whatsappMessage(d: Record<string, string>, greeting: string, products: Option[], services: Option[]) {
  const label = (list: Option[], v?: string) => list.find((o) => o.value === v)?.label.split(" — ")[0];
  const subject = d.sujet === "rendez-vous" ? "Demande de rendez-vous" : d.sujet === "question" ? "Question" : "Demande produit";
  return [
    greeting,
    `${subject} via le site.`,
    `Nom : ${d.nom ?? ""}`,
    d.telephone && `Téléphone : ${d.telephone}`,
    d.email && `E-mail : ${d.email}`,
    d.produit && `Produit : ${label(products, d.produit) ?? d.produit}${d.variante ? ` (${d.variante})` : ""}`,
    d.service && `Service : ${label(services, d.service) ?? d.service}`,
    d.message && `Message : ${d.message}`,
  ]
    .filter(Boolean)
    .join("\n");
}
