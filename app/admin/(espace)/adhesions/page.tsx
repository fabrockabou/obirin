import type { Metadata } from "next";
import Link from "next/link";
import { adminInput } from "@/components/admin/ui";
import { filterAdhesions } from "@/lib/adhesion-filter";
import { getAdhesions } from "@/lib/store";

export const metadata: Metadata = { title: "Liste des adhésions" };

const fmt = (d: string) => (d ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`)) : "—");

function age(dateNaissance: string) {
  if (!dateNaissance) return null;
  const b = new Date(`${dateNaissance}T00:00:00Z`);
  const n = new Date();
  let a = n.getUTCFullYear() - b.getUTCFullYear();
  if (n.getUTCMonth() < b.getUTCMonth() || (n.getUTCMonth() === b.getUTCMonth() && n.getUTCDate() < b.getUTCDate())) a -= 1;
  return a;
}

export default async function AdhesionsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 80);
  const pays = (sp.pays ?? "").slice(0, 60);
  const all = getAdhesions();
  const list = filterAdhesions(all, q, pays);
  const countries = [...new Set(all.map((a) => a.pays))].sort((a, b) => a.localeCompare(b, "fr"));
  const totalAdherents = list.reduce((n, a) => n + a.adherentsAjoutes, 0);
  const totalProduits = list.reduce((n, a) => n + a.produitsAchetes, 0);
  const exportQuery = new URLSearchParams({ ...(q ? { q } : {}), ...(pays ? { pays } : {}) }).toString();
  const notice = sp.ajoutee ? "Adhésion ajoutée." : sp.modifiee ? "Adhésion modifiée." : sp.supprimee ? "Adhésion supprimée." : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-5xl text-forest">Liste des adhésions</h1>
          <p className="mt-2 text-ink-soft">Adhésions saisies dans l&apos;administration (elles ne proviennent pas du site web).</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {all.length > 0 && (
            <>
              <a href={`/admin/adhesions/export?${exportQuery ? `${exportQuery}&` : ""}format=csv`} className="btn btn-ghost-dark">
                Exporter CSV
              </a>
              <a href={`/admin/adhesions/export?${exportQuery ? `${exportQuery}&` : ""}format=pdf`} className="btn btn-ghost-dark">
                Exporter PDF
              </a>
            </>
          )}
          <Link href="/admin/adhesions/ajouter" className="btn btn-primary">
            + Ajouter une adhésion
          </Link>
        </div>
      </div>

      {notice && (
        <p role="status" className="mt-6 rounded-xl bg-mist px-4 py-3 text-sm font-semibold text-forest">
          ✓ {notice}
        </p>
      )}

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ["Adhésions", list.length],
          ["Adhérents ajoutés", totalAdherents],
          ["Produits achetés", totalProduits],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-forest/10 bg-ivory p-5">
            <dt className="kicker text-ink-soft">{label}</dt>
            <dd className="mt-2 font-display text-4xl text-forest tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {all.length > 0 && (
        <form className="mt-8 flex flex-wrap gap-3" role="search">
          <label htmlFor="q" className="sr-only">
            Rechercher
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Rechercher un nom, un téléphone, un e-mail…" className={`${adminInput.replace("w-full", "")} min-w-[16rem] max-w-md flex-1`} />
          <label htmlFor="pays" className="sr-only">
            Pays
          </label>
          <select id="pays" name="pays" defaultValue={pays} className={`${adminInput.replace("w-full", "")} w-auto`}>
            <option value="">Tous les pays</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-ghost-dark">
            Filtrer
          </button>
          {(q || pays) && (
            <Link href="/admin/adhesions" className="self-center text-sm text-fuchsia hover:underline">
              Effacer
            </Link>
          )}
        </form>
      )}

      {all.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-ivory p-10 text-center">
          <p className="font-display text-3xl text-forest">Aucune adhésion pour le moment.</p>
          <Link href="/admin/adhesions/ajouter" className="btn btn-primary mt-6">
            Ajouter la première adhésion
          </Link>
        </div>
      ) : list.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-ivory p-8 text-ink-soft">Aucune adhésion ne correspond à cette recherche.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-forest/10 bg-ivory">
          <table className="w-full min-w-[60rem] text-left text-sm">
            <thead className="bg-cream text-xs uppercase tracking-[0.1em] text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Nom & prénom</th>
                <th className="px-4 py-3 font-semibold">Naissance</th>
                <th className="px-4 py-3 font-semibold">Pays</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Adresse</th>
                <th className="px-4 py-3 font-semibold">Adhésion</th>
                <th className="px-4 py-3 text-right font-semibold">Adhérents</th>
                <th className="px-4 py-3 text-right font-semibold">Produits</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/10 align-top">
              {list.map((a) => {
                const ans = age(a.dateNaissance);
                return (
                  <tr key={a.id}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/adhesions/${a.id}`} className="font-semibold text-forest hover:text-fuchsia">
                        {a.nom.toUpperCase()} {a.prenom}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {fmt(a.dateNaissance)}
                      {ans !== null && <span className="block text-xs">{ans} ans</span>}
                    </td>
                    <td className="px-4 py-3">{a.pays}</td>
                    <td className="px-4 py-3">
                      {a.telephones.map((t) => (
                        <a key={t} href={`tel:${t.replace(/\s/g, "")}`} className="block whitespace-nowrap hover:text-fuchsia">
                          {t}
                        </a>
                      ))}
                      {a.emails.map((e) => (
                        <a key={e} href={`mailto:${e}`} className="block text-ink-soft hover:text-fuchsia">
                          {e}
                        </a>
                      ))}
                    </td>
                    <td className="max-w-[14rem] px-4 py-3 text-ink-soft">{a.adresse || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3">{fmt(a.dateAdhesion)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{a.adherentsAjoutes}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{a.produitsAchetes}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/adhesions/${a.id}`} className="rounded-full border border-forest/20 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-forest hover:text-ivory">
                        Modifier
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
