import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteAdhesionAction } from "@/app/admin/actions";
import { AdhesionForm } from "@/components/admin/AdhesionForm";
import { PAYS } from "@/lib/adhesion-input";
import { getAdhesion } from "@/lib/store";

export const metadata: Metadata = { title: "Modifier une adhésion" };

export default async function EditAdhesionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adhesion = getAdhesion(id);
  if (!adhesion) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/adhesions" className="text-sm text-ink-soft hover:text-fuchsia">
        ← Liste des adhésions
      </Link>
      <h1 className="display mt-3 mb-8 text-5xl text-forest">
        {adhesion.prenom} {adhesion.nom}
      </h1>
      <AdhesionForm adhesion={adhesion} pays={PAYS} />

      <form action={deleteAdhesionAction} className="mt-14 rounded-2xl border border-fuchsia/30 p-6">
        <input type="hidden" name="id" value={adhesion.id} />
        <h2 className="font-semibold text-fuchsia-600">Supprimer cette adhésion</h2>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" required className="size-4 accent-fuchsia" /> Je confirme la suppression de l&apos;adhésion de {adhesion.prenom} {adhesion.nom}
        </label>
        <button type="submit" className="mt-4 rounded-full bg-fuchsia px-5 py-2.5 text-sm font-semibold text-ivory hover:bg-fuchsia-600">
          Supprimer définitivement
        </button>
      </form>
    </div>
  );
}
