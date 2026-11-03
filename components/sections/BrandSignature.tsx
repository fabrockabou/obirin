import Image from "next/image";
import Link from "next/link";
import { img } from "@/data/images";
import { site } from "@/data/site";

const siege = img("/images/editorial/siege-cote-ivoire.webp", "Façade illuminée d'un siège entouré de jardins");

// Textes : catalogue page 22.
export function BrandSignature() {
  return (
    <section className="relative isolate overflow-hidden bg-abyss text-ivory" aria-labelledby="signature-titre">
      <div className="absolute inset-0 -z-10">
        <div data-parallax="0.2" className="absolute -inset-y-[15%] inset-x-0">
          <Image src={siege.src} alt={siege.alt} fill sizes="100vw" className="object-cover object-[50%_40%] opacity-55" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-abyss via-abyss/40 to-abyss" />
      </div>
      <div className="container-luxe flex min-h-[90svh] flex-col items-center justify-center py-32 text-center">
        <p data-reveal="fade" className="kicker text-gold-soft">
          Obirin Côte d&apos;Ivoire — {site.motto}
        </p>
        <h2 id="signature-titre" data-reveal="up" className="display mt-8 max-w-5xl text-[length:var(--text-display)]">
          Prenez soin de vous <em className="text-rose">aujourd&apos;hui.</em>
        </h2>
        <p data-reveal="up" data-reveal-delay="0.1" className="mt-8 max-w-xl text-lg text-ivory/75">
          Nos produits et services sont là pour vous accompagner. Une communauté pour votre bien-être et votre épanouissement.
        </p>
        <div data-reveal="up" data-reveal-delay="0.2" className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/collections" className="btn btn-primary">
            Découvrir toutes les collections <span className="btn-arrow" aria-hidden="true">→</span>
          </Link>
          <Link href="/contact" className="btn btn-ghost-light">
            Nous écrire
          </Link>
        </div>
      </div>
    </section>
  );
}
