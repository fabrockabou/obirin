import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { LogoFull } from "@/components/brand/Logo";
import { currentAdmin } from "@/lib/auth";
import { adminExists } from "@/lib/store";

export const metadata: Metadata = { title: "Connexion" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await currentAdmin()) redirect("/admin/produits");
  return (
    <main className="grid min-h-[100svh] place-items-center bg-forest px-5 py-16">
      <div className="w-full max-w-md rounded-[2rem] bg-ivory p-8 shadow-2xl sm:p-10">
        <LogoFull className="text-3xl" />
        <p className="kicker mt-3 text-ink-soft">Espace administration</p>
        {adminExists() ? (
          <LoginForm />
        ) : (
          <div className="mt-8 rounded-2xl bg-blush p-5 text-sm text-fuchsia-600">
            Aucun compte administrateur n&apos;existe encore. Créez-le depuis le dossier du site avec la commande{" "}
            <code className="rounded bg-ivory px-1.5 py-0.5 font-mono text-forest">npm run admin:create</code>, puis rechargez cette page.
          </div>
        )}
      </div>
    </main>
  );
}
