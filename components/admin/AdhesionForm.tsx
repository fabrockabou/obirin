"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveAdhesionAction, type AdhesionState } from "@/app/admin/actions";
import type { Adhesion } from "@/data/types";
import { adminCard, adminHint, adminInput, adminLabel } from "./ui";

type Key = "nom" | "prenom" | "dateNaissance" | "pays" | "emails" | "telephones" | "adresse" | "dateAdhesion" | "adherentsAjoutes" | "produitsAchetes";

export function AdhesionForm({ adhesion, pays }: { adhesion?: Adhesion; pays: string[] }) {
  const [state, action, pending] = useActionState<AdhesionState, FormData>(saveAdhesionAction, {});
  const today = new Date().toISOString().slice(0, 10);

  // valeur affichée : saisie renvoyée après une erreur, sinon adhésion existante, sinon valeur par défaut
  const initial: Record<Key, string> = {
    nom: adhesion?.nom ?? "",
    prenom: adhesion?.prenom ?? "",
    dateNaissance: adhesion?.dateNaissance ?? "",
    pays: adhesion?.pays ?? "Côte d'Ivoire",
    emails: adhesion?.emails.join(", ") ?? "",
    telephones: adhesion?.telephones.join(", ") ?? "",
    adresse: adhesion?.adresse ?? "",
    dateAdhesion: adhesion?.dateAdhesion ?? today,
    adherentsAjoutes: adhesion ? String(adhesion.adherentsAjoutes) : "0",
    produitsAchetes: adhesion ? String(adhesion.produitsAchetes) : "0",
  };
  const v = (k: Key) => state.values?.[k] ?? initial[k];
  const err = (k: Key) =>
    state.errors?.[k] ? (
      <p id={`${k}-erreur`} className="mt-1 text-sm text-fuchsia">
        {state.errors[k]}
      </p>
    ) : null;
  const aria = (k: Key) => ({ "aria-invalid": Boolean(state.errors?.[k]), "aria-describedby": state.errors?.[k] ? `${k}-erreur` : undefined });

  const field = (k: Key, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, hint?: string) => (
    <div>
      <label htmlFor={`a-${k}`} className={adminLabel}>
        {label}
      </label>
      {/* key : réinitialise le champ quand le serveur renvoie la saisie après une erreur */}
      <input key={v(k)} id={`a-${k}`} name={k} defaultValue={v(k)} className={adminInput} {...aria(k)} {...props} />
      {hint && <p className={adminHint}>{hint}</p>}
      {err(k)}
    </div>
  );

  return (
    <form action={action} className="space-y-6" noValidate>
      {adhesion && <input type="hidden" name="id" value={adhesion.id} />}

      <section className={adminCard}>
        <h2 className="font-display text-2xl text-forest">Identité</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {field("nom", "Nom *", { autoComplete: "off", required: true })}
          {field("prenom", "Prénom *", { autoComplete: "off", required: true })}
          {field("dateNaissance", "Date de naissance", { type: "date", max: today, min: "1900-01-01" })}
          <div>
            <label htmlFor="a-pays" className={adminLabel}>
              Pays *
            </label>
            <input key={v("pays")} id="a-pays" name="pays" list="liste-pays" defaultValue={v("pays")} className={adminInput} {...aria("pays")} />
            <datalist id="liste-pays">
              {pays.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
            <p className={adminHint}>Choisissez dans la liste ou tapez un autre pays.</p>
            {err("pays")}
          </div>
        </div>
      </section>

      <section className={adminCard}>
        <h2 className="font-display text-2xl text-forest">Coordonnées</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {field("telephones", "Numéro(s) de téléphone", { type: "tel", inputMode: "tel", placeholder: "+225 07 00 00 00 00" }, "Plusieurs numéros : séparez-les par une virgule.")}
          {field("emails", "E-mail(s)", { type: "text", inputMode: "email", placeholder: "nom@exemple.com" }, "Plusieurs adresses : séparez-les par une virgule.")}
          <div className="sm:col-span-2">
            <label htmlFor="a-adresse" className={adminLabel}>
              Adresse
            </label>
            <textarea key={v("adresse")} id="a-adresse" name="adresse" rows={2} defaultValue={v("adresse")} className={adminInput} />
          </div>
        </div>
      </section>

      <section className={adminCard}>
        <h2 className="font-display text-2xl text-forest">Adhésion</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {field("dateAdhesion", "Date d'adhésion *", { type: "date", required: true })}
          {field("adherentsAjoutes", "Nombre d'adhérents ajoutés", { type: "number", min: 0, step: 1, inputMode: "numeric" })}
          {field("produitsAchetes", "Nombre de produits achetés", { type: "number", min: 0, step: 1, inputMode: "numeric" })}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Enregistrement…" : adhesion ? "Enregistrer les modifications" : "Ajouter l'adhésion"}
        </button>
        <Link href="/admin/adhesions" className="text-sm text-ink-soft hover:text-fuchsia">
          Annuler
        </Link>
        {state.error && (
          <p role="alert" className="text-sm font-semibold text-fuchsia">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
