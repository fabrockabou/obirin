"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/app/admin/actions";
import { adminInput } from "./ui";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="username" className="mb-2 block text-sm font-semibold text-forest">
          Identifiant
        </label>
        <input id="username" name="username" autoComplete="username" required className={adminInput} />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-forest">
          Mot de passe
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={adminInput} />
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl bg-blush px-4 py-3 text-sm text-fuchsia-600">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full justify-center disabled:opacity-60">
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
