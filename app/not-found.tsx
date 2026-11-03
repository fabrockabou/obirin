import Link from "next/link";

export default function NotFound() {
  return (
    <main data-header="dark" className="grid min-h-[100svh] place-items-center bg-abyss px-6 text-center text-ivory">
      <div>
        <p className="kicker text-gold-soft">Erreur 404</p>
        <h1 className="display mt-6 text-[length:var(--text-title)]">
          Cette page s&apos;est <em className="text-rose">égarée.</em>
        </h1>
        <p className="mt-6 text-ivory/70">La page demandée n&apos;existe pas ou a été déplacée.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-light">Retour à l&apos;accueil</Link>
          <Link href="/collections" className="btn btn-ghost-light">Nos collections</Link>
        </div>
      </div>
    </main>
  );
}
