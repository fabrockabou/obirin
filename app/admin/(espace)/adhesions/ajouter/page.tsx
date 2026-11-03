import type { Metadata } from "next";
import { AdhesionForm } from "@/components/admin/AdhesionForm";
import { PAYS } from "@/lib/adhesion-input";

export const metadata: Metadata = { title: "Ajouter une adhésion" };

export default function AddAdhesionPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="display text-5xl text-forest">Ajouter une adhésion</h1>
      <p className="mt-2 mb-8 text-ink-soft">Les champs marqués * sont obligatoires. L&apos;adhésion apparaîtra dans la liste des adhésions.</p>
      <AdhesionForm pays={PAYS} />
    </div>
  );
}
