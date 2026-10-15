import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Kicker } from "@/components/ui/primitives";
import { img } from "@/data/images";
import { getProduct, products } from "@/data/products";
import { getService, services } from "@/data/services";
import { formatFcfa } from "@/lib/format";

export const metadata: Metadata = {
  title: "Contact & demandes",
  description: "Demande d'information sur un produit, demande de rendez-vous bien-être ou question : écrivez à l'équipe Obirin Côte d'Ivoire.",
  alternates: { canonical: "/contact" },
};

const visual = img("/images/editorial/siege-cote-ivoire.webp", "Façade illuminée du siège");

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ContactPage({ searchParams }: Props) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const produit = getProduct(one("produit")) ? one("produit") : "";
  const service = getService(one("service")) ? one("service") : "";
  const sujet = produit ? "produit" : service || one("sujet") === "rendez-vous" ? "rendez-vous" : one("sujet") === "question" ? "question" : "produit";
  const variant = produit ? getProduct(produit)?.variants?.find((v) => v.id === one("variante")) : undefined;
  const selected = produit ? getProduct(produit) : undefined;

  return (
    <main data-header="light" className="bg-ivory">
      <section className="container-luxe grid gap-16 pb-28 pt-36 lg:grid-cols-12 lg:pt-44">
        <div className="lg:col-span-5">
          <Breadcrumb items={[{ label: "Contact" }]} />
          <Kicker className="mt-14 text-fuchsia">Nous sommes à votre écoute</Kicker>
          <h1 className="display mt-6 text-[length:var(--text-title)] text-forest">
            Une question, un produit, <em className="text-fuchsia">un rendez-vous ?</em>
          </h1>
          <p className="mt-8 max-w-md text-lg text-ink-soft">
            La commande en ligne n&apos;est pas encore disponible. Envoyez-nous votre demande : l&apos;équipe Obirin vous recontacte pour la
            disponibilité des produits, les modalités et la prise de rendez-vous au siège.
          </p>

          {selected && (
            <div className="mt-10 flex items-center gap-5 rounded-[1.5rem] bg-cream p-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-ivory">
                <Image src={(variant?.image ?? selected.image).src} alt="" fill sizes="80px" className="object-contain p-1" />
              </div>
              <div>
                <p className="kicker text-ink-soft">Votre sélection</p>
                <p className="mt-1 font-display text-2xl leading-tight text-forest">{selected.name}</p>
                <p className="text-sm text-ink-soft">
                  {variant ? `${variant.label} — ${variant.detail}` : selected.format} · {formatFcfa(variant?.price ?? selected.price)}
                </p>
              </div>
            </div>
          )}

          <div className="relative mt-12 hidden aspect-[4/3] overflow-hidden rounded-[2rem] lg:block">
            <Image src={visual.src} alt={visual.alt} fill sizes="40vw" className="object-cover" />
            <p className="absolute bottom-5 left-5 rounded-full bg-ivory/90 px-4 py-2 text-sm text-forest backdrop-blur">Siège Obirin — Côte d&apos;Ivoire</p>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 lg:pt-28">
          <ContactForm
            key={`${sujet}-${produit}-${service}`}
            products={products.map((p) => ({ value: p.slug, label: `${p.name}${p.price !== null ? ` — ${formatFcfa(p.price)}` : ""}` }))}
            services={services.map((s) => ({ value: s.slug, label: `${s.name} — ${formatFcfa(s.price)}` }))}
            defaults={{ sujet, produit, variante: variant?.id ?? "", service }}
          />
        </div>
      </section>
    </main>
  );
}
