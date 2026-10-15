import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="lg:grid lg:min-h-[100svh] lg:grid-cols-[16rem_1fr]">
      <aside className="bg-forest text-ivory lg:sticky lg:top-0 lg:h-[100svh]">
        <div className="flex items-center justify-between gap-4 px-6 py-5 lg:block lg:py-8">
          <div>
            <p className="font-sans text-2xl font-extrabold uppercase tracking-[0.16em]">Obirin</p>
            <p className="kicker mt-1 text-gold-soft">Administration</p>
          </div>
          <form action={logoutAction} className="lg:hidden">
            <button type="submit" className="text-sm text-ivory/70 underline">
              Déconnexion
            </button>
          </form>
        </div>
        <AdminNav />
        <div className="hidden px-6 pb-8 lg:absolute lg:bottom-0 lg:block">
          <p className="text-xs text-ivory/60">Connecté : {user}</p>
          <Link href="/" target="_blank" className="mt-3 block text-sm text-ivory/80 hover:text-ivory">
            Voir le site ↗
          </Link>
          <form action={logoutAction} className="mt-2">
            <button type="submit" className="text-sm text-ivory/80 hover:text-ivory">
              Déconnexion
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
