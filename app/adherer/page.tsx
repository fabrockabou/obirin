import type { Metadata } from "next";
import Image from "next/image";
import { AdhererForm } from "@/components/contact/AdhererForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Kicker } from "@/components/ui/primitives";
import { collections } from "@/data/collections";
import { img } from "@/data/images";
import { getProducts, getSettings } from "@/lib/store";

export const metadata: Metadata = {
  title: "Adhérer à Green World",
  description: "Envoyez votre demande d'adhésion à Green World avec Obirin Côte d'Ivoire : vos coordonnées et les produits qui vous intéressent.",
  alternates: { canonical: "/adherer" },
};

// la liste des produits suit les modifications faites dans l'administration
export const dynamic = "force-dynamic";

const visual = img("/images/editorial/siege-cote-ivoire.webp", "Façade illuminée du siège");

export default function AdhererPage() {
  const products = getProducts();
  const groups = collections
    .map((c) => ({ name: c.name, products: products.filter((p) => p.collection === c.slug).map((p) => ({ slug: p.slug, name: p.name })) }))
    .filter((g) => g.products.length);
  const { whatsappNumber, whatsappGreeting } = getSettings();

  return (
    <main data-header="light" className="bg-ivory">
      <section className="container-luxe grid gap-16 pb-28 pt-36 lg:grid-cols-12 lg:pt-44">
        <div className="lg:col-span-5">
          <Breadcrumb items={[{ label: "Adhérer à Green World" }]} />
          <Kicker className="mt-14 text-fuchsia">Rejoignez-nous</Kicker>
          <h1 className="display mt-6 text-[length:var(--text-title)] text-forest">
            Adhérer à <em className="text-fuchsia">Green World</em>
          </h1>
          <p className="mt-8 max-w-md text-lg text-ink-soft">
            Remplissez ce formulaire en indiquant vos coordonnées et les produits qui vous intéressent : l&apos;équipe Obirin vous recontacte pour
            finaliser votre adhésion.
          </p>
          <div className="relative mt-12 hidden aspect-[4/3] overflow-hidden rounded-[2rem] lg:block">
            <Image src={visual.src} alt={visual.alt} fill sizes="40vw" className="object-cover" />
            <p className="absolute bottom-5 left-5 rounded-full bg-ivory/90 px-4 py-2 text-sm text-forest backdrop-blur">Siège Obirin — Côte d&apos;Ivoire</p>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 lg:pt-28">
          <AdhererForm groups={groups} whatsapp={{ number: whatsappNumber, greeting: whatsappGreeting }} />
        </div>
      </section>
    </main>
  );
}
