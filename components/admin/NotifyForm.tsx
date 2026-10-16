"use client";

import { useActionState, useState } from "react";
import { saveNotifyAction, testNotifyAction, type FormState } from "@/app/admin/actions";
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

export function NotifyForm({
  mode,
  notifyTo,
  fallbackNumber,
  hasKey,
  metaConfigured,
  status,
}: {
  mode: "off" | "callmebot" | "meta";
  notifyTo: string;
  fallbackNumber: string;
  hasKey: boolean;
  metaConfigured: boolean;
  status: { ready: boolean; reason?: string };
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveNotifyAction, {});
  const [testState, testAction, testing] = useActionState<FormState>(testNotifyAction, {});
  const [current, setCurrent] = useState(mode);
  const destination = notifyTo || fallbackNumber;

  return (
    <section className={adminCard}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-forest">Envoi automatique des demandes sur WhatsApp</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Chaque formulaire envoyé sur le site (demande produit, rendez-vous, question) est envoyé automatiquement sur WhatsApp, avec le nom et le
            numéro du visiteur et un lien pour lui répondre. La demande reste aussi dans « Demandes reçues ».
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.ready ? "bg-mist text-emerald" : "bg-sand text-ink-soft"}`}>
          {status.ready ? "● Actif" : "○ Inactif"}
        </span>
      </div>
      {!status.ready && mode !== "off" && <p className="mt-3 text-sm text-fuchsia">{status.reason}</p>}

      <form action={action} className="mt-6 space-y-5">
        <fieldset>
          <legend className={adminLabel}>Service d&apos;envoi</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {[
              { id: "off", title: "Désactivé", text: "Les demandes restent dans l'administration." },
              { id: "callmebot", title: "CallMeBot", text: "Gratuit, prêt en 2 minutes." },
              { id: "meta", title: "API officielle Meta", text: "Professionnel, compte Meta Business requis." },
            ].map((o) => (
              <label
                key={o.id}
                className="cursor-pointer rounded-xl border border-forest/15 p-4 text-sm has-[:checked]:border-forest has-[:checked]:bg-forest has-[:checked]:text-ivory"
              >
                <input type="radio" name="notifyMode" value={o.id} checked={current === o.id} onChange={() => setCurrent(o.id as typeof current)} className="sr-only" />
                <span className="block font-semibold">{o.title}</span>
                <span className="mt-1 block opacity-75">{o.text}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {current !== "off" && (
          <div>
            <label htmlFor="notifyTo" className={adminLabel}>
              Numéro qui reçoit les demandes
            </label>
            <input
              id="notifyTo"
              name="notifyTo"
              type="tel"
              inputMode="tel"
              defaultValue={notifyTo ? `+${notifyTo}` : ""}
              placeholder={fallbackNumber ? `+${fallbackNumber} (numéro WhatsApp Business)` : "+225 07 00 00 00 00"}
              className={adminInput}
            />
            <p className={adminHint}>Laissez vide pour utiliser le numéro WhatsApp Business indiqué plus haut.</p>
          </div>
        )}

        {current === "callmebot" && (
          <div className="rounded-xl bg-cream p-5 text-sm">
            <p className="font-semibold text-forest">Obtenir la clé CallMeBot (une seule fois) :</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink-soft">
              <li>
                Sur{" "}
                <a href="https://www.callmebot.com/blog/free-api-whatsapp-messages/" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald underline">
                  la page WhatsApp de CallMeBot ↗
                </a>
                , relevez le numéro actuel du robot, puis ajoutez-le aux contacts du téléphone{" "}
                {destination ? <strong>+{destination}</strong> : "qui doit recevoir les demandes"}.
              </li>
              <li>
                Envoyez-lui sur WhatsApp le message : <code className="rounded bg-ivory px-1.5 py-0.5">I allow callmebot to send me messages</code>
              </li>
              <li>Le robot répond avec votre clé (« apikey ») : copiez-la ci-dessous.</li>
            </ol>
            <label htmlFor="callmebotApiKey" className={`${adminLabel} mt-4`}>
              Clé CallMeBot
            </label>
            <input
              id="callmebotApiKey"
              name="callmebotApiKey"
              autoComplete="off"
              placeholder={hasKey ? "•••••••• (clé enregistrée — laissez vide pour la conserver)" : "Ex. 1234567"}
              className={adminInput}
            />
            {hasKey && (
              <label className="mt-2 flex items-center gap-2 text-xs text-ink-soft">
                <input type="checkbox" name="clearKey" className="accent-fuchsia" /> Effacer la clé enregistrée
              </label>
            )}
          </div>
        )}

        {current === "meta" && (
          <div className="rounded-xl bg-cream p-5 text-sm text-ink-soft">
            <p className="font-semibold text-forest">API officielle WhatsApp (Meta)</p>
            <p className="mt-2">
              Identifiants serveur : {metaConfigured ? <strong className="text-emerald">présents ✓</strong> : <strong className="text-fuchsia">absents</strong>}.
              Ils se renseignent dans le fichier <code>.env.local</code> du serveur (jamais ici, pour la sécurité) :
              <code className="mt-2 block whitespace-pre rounded bg-ivory p-3 text-xs">
                {"WHATSAPP_TOKEN=…\nWHATSAPP_PHONE_NUMBER_ID=…\nWHATSAPP_TEMPLATE=nouvelle_demande\nWHATSAPP_TEMPLATE_LANG=fr"}
              </code>
            </p>
            <p className="mt-2">
              Le modèle de message « nouvelle_demande » doit être créé et validé dans Meta Business, avec un seul paramètre, par exemple :
              « Nouvelle demande sur le site : {"{{1}}"} ».
            </p>
          </div>
        )}

        <Feedback state={state} />
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>

      {mode !== "off" && (
        <form action={testAction} className="mt-6 space-y-3 border-t border-forest/10 pt-6">
          <Feedback state={testState} />
          <button type="submit" disabled={testing} className="btn btn-ghost-dark disabled:opacity-60">
            {testing ? "Envoi…" : "Envoyer un message de test"}
          </button>
        </form>
      )}
    </section>
  );
}
