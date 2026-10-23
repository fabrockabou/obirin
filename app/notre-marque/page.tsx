import type { Metadata } from "next";
import Image from "next/image";
import { LogoFull } from "@/components/brand/Logo";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ArrowLink, Kicker } from "@/components/ui/primitives";
import { img } from "@/data/images";

export const metadata: Metadata = {
  title: "Notre marque",
  description:
    "Obirin Côte d'Ivoire — Beauté, bien-être, spiritualité : une approche naturelle et globale pour la santé et le bien-être des femmes.",
  alternates: { canonical: "/notre-marque" },
};

// Contenus repris des pages 1, 2, 3, 20 et 22 du catalogue.
const engagements = [
  { title: "Hygiène intime", text: "Fraîcheur, confort et protection au quotidien" },
  { title: "Santé utérine", text: "Soutien naturel pour un équilibre féminin optimal" },
  { title: "Santé du sein", text: "Prévention et bien-être au féminin" },
  { title: "Beauté de la peau", text: "Éclat, fermeté et teint lumineux" },
  { title: "Équilibre hormonal", text: "Soutien pendant le cycle, la ménopause et les variations hormonales" },
  { title: "Rajeunissement naturel", text: "Vitalité et éclat au fil du temps" },
  { title: "Défenses naturelles", text: "Un organisme plus résistant" },
  { title: "Énergie et vitalité", text: "Pour rester active et épanouie" },
  { title: "Gestion du stress", text: "Plus de sérénité dans la vie quotidienne" },
  { title: "Bien-être global", text: "Une femme plus saine, plus confiante et plus épanouie" },
];

const portrait = img("/images/editorial/femmes-portrait.webp", "Portrait d'une femme souriante en foulard fuchsia");
const siege = img("/images/editorial/siege-cote-ivoire.webp", "Façade illuminée du siège");
const conseil = img("/images/editorial/services-consultation.webp", "Échange entre une cliente et un conseiller");

export default function BrandPage() {
  return (
    <main data-header="light" className="bg-ivory">
      <section className="container-luxe pb-20 pt-36 lg:pt-44">
        <Breadcrumb items={[{ label: "Notre marque" }]} />
        <div className="mt-14 grid items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Kicker className="text-fuchsia">Obirin Côte d&apos;Ivoire</Kicker>
            <h1 data-reveal="up" className="display mt-8 text-[length:var(--text-display)] text-forest">
              Beauté, Bien-être, <em className="text-fuchsia">Spiritualité</em>
            </h1>
          </div>
          <div className="lg:col-span-4 lg:col-start-9" data-reveal="up">
            <LogoFull className="text-[clamp(3rem,6vw,5rem)]" />
          </div>
        </div>
      </section>

      <section className="container-luxe grid gap-16 pb-28 lg:grid-cols-12" aria-labelledby="aux-cotes">
        <div data-reveal="mask" className="relative aspect-[4/5] overflow-hidden rounded-[2rem] lg:col-span-5">
          <Image src={portrait.src} alt={portrait.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center lg:col-span-6 lg:col-start-7">
          <h2 id="aux-cotes" data-reveal="up" className="display text-[length:var(--text-title)] text-forest">
            Aux côtés des <em className="text-fuchsia">femmes</em>, à chaque étape de la vie.
          </h2>
          <p data-reveal="up" className="mt-8 font-display text-2xl italic text-emerald">
            Prévention • Bien-être • Confiance • Chaque jour
          </p>
          <p data-reveal="up" className="mt-6 max-w-xl text-lg text-ink-soft">
            Une approche naturelle et globale pour la santé et le bien-être des femmes : se connaître, se préserver, s&apos;épanouir. Un engagement
            pour chaque étape de la vie, parce que chaque femme compte.
          </p>
        </div>
      </section>

      <section className="bg-cream py-24 lg:py-32" aria-labelledby="engagements">
        <div className="container-luxe">
          <Kicker className="text-fuchsia">Nos engagements</Kicker>
          <h2 id="engagements" className="display mt-6 max-w-3xl text-[length:var(--text-subtitle)] text-forest">
            Dix attentions pour la santé et le bien-être au féminin
          </h2>
          <ol data-stagger className="mt-14 grid gap-px overflow-hidden rounded-[2rem] bg-forest/10 sm:grid-cols-2 lg:grid-cols-5">
            {engagements.map((e, i) => (
              <li key={e.title} className="bg-cream p-7">
                <span className="font-display text-lg italic text-gold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-2xl leading-tight text-forest">{e.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{e.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative overflow-hidden bg-forest text-ivory" aria-labelledby="valeurs">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[50vh] lg:min-h-[80vh]">
            <Image src={conseil.src} alt={conseil.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center px-[clamp(1.25rem,5vw,5rem)] py-20">
            <Kicker className="text-gold-soft">Santé • Bien-être • Vie équilibrée</Kicker>
            <h2 id="valeurs" data-reveal="up" className="display mt-6 text-[length:var(--text-title)]">
              Bien-être, agriculture durable, entrepreneuriat.
            </h2>
            <p data-reveal="up" className="mt-8 max-w-lg text-ivory/75">
              Nos trois piliers. Nos conseillers en santé naturelle vous accompagnent pour mieux vous connaître et adopter
              de meilleures habitudes de vie, pour les femmes, les hommes et les enfants.
            </p>
            <div className="mt-10">
              <ArrowLink href="/services" light>
                Découvrir nos services bien-être
              </ArrowLink>
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-abyss py-32 text-center text-ivory">
        <Image src={siege.src} alt={siege.alt} fill sizes="100vw" className="-z-10 object-cover opacity-40" />
        <div className="container-luxe">
          <p className="kicker text-gold-soft">Obirin Côte d&apos;Ivoire</p>
          <h2 data-reveal="up" className="display mx-auto mt-6 max-w-4xl text-[length:var(--text-title)]">
            Une communauté pour votre bien-être et votre épanouissement.
          </h2>
          <div className="mt-12 flex justify-center">
            <ArrowLink href="/collections" light>
              Explorer nos collections
            </ArrowLink>
          </div>
        </div>
      </section>
    </main>
  );
}
