"use client";

import { useActionState, useState } from "react";
import { changePasswordAction, saveSettingsAction, type FormState } from "@/app/admin/actions";
import { whatsappLink } from "@/lib/whatsapp";
import { adminCard, adminHint, adminInput, adminLabel } from "./ui";

function Feedback({ state }: { state: FormState }) {
  if (state.error)
    return (
      <p role="alert" className="rounded-xl bg-blush px-4 py-3 text-sm text-fuchsia-600">
        {state.error}
      </p>
    );
  if (state.message)
    return (
      <p role="status" className="rounded-xl bg-mist px-4 py-3 text-sm font-semibold text-forest">
        ✓ {state.message}
      </p>
    );
  return null;
}

export function SettingsForm({ number, greeting }: { number: string; greeting: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettingsAction, {});
  const [value, setValue] = useState(number ? `+${number}` : "");
  const digits = value.replace(/\D/g, "");
  return (
    <form action={action} className={adminCard}>
      <h2 className="font-display text-2xl text-forest">WhatsApp Business</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Ce numéro reçoit les messages des boutons « Commander sur WhatsApp » des fiches produits et « Envoyer aussi sur WhatsApp » du formulaire de
        contact. Laissez vide pour masquer ces boutons.
      </p>
      <div className="mt-5 space-y-5">
        <div>
          <label htmlFor="whatsappNumber" className={adminLabel}>
            Numéro WhatsApp Business
          </label>
          <input
            id="whatsappNumber"
            name="whatsappNumber"
            type="tel"
            inputMode="tel"
            placeholder="+225 07 00 00 00 00"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={adminInput}
          />
          <p className={adminHint}>Avec l&apos;indicatif du pays (+225 pour la Côte d&apos;Ivoire).</p>
          {digits.length >= 8 && (
            <a href={whatsappLink(digits, "Test du site Obirin")} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-emerald underline">
              Tester ce numéro dans WhatsApp ↗
            </a>
          )}
        </div>
        <div>
          <label htmlFor="whatsappGreeting" className={adminLabel}>
            Début des messages
          </label>
          <input id="whatsappGreeting" name="whatsappGreeting" defaultValue={greeting} className={adminInput} />
          <p className={adminHint}>Placé en tête des messages pré-remplis, ex. « Bonjour Obirin, ».</p>
        </div>
        <Feedback state={state} />
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

export function PasswordForm({ username }: { username: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(changePasswordAction, {});
  return (
    <form action={action} className={adminCard}>
      <h2 className="font-display text-2xl text-forest">Mot de passe</h2>
      <p className="mt-1 text-sm text-ink-soft">Identifiant : {username}</p>
      <input type="text" name="username" autoComplete="username" defaultValue={username} hidden readOnly />
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        {[
          ["current", "Mot de passe actuel", "current-password"],
          ["next", "Nouveau (10 caractères min.)", "new-password"],
          ["confirm", "Confirmation", "new-password"],
        ].map(([name, label, auto]) => (
          <div key={name}>
            <label htmlFor={`pw-${name}`} className={adminLabel}>
              {label}
            </label>
            <input id={`pw-${name}`} name={name} type="password" autoComplete={auto} required className={adminInput} />
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-4">
        <Feedback state={state} />
        <button type="submit" disabled={pending} className="btn btn-ghost-dark disabled:opacity-60">
          {pending ? "Modification…" : "Changer le mot de passe"}
        </button>
      </div>
    </form>
  );
}
