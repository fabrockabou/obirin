import type { Metadata } from "next";
import { deleteInscriptionAction } from "@/app/admin/actions";
import { getInscriptions, getSettings } from "@/lib/store";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Adhésions du site" };

export default function AdminInscriptionsPage() {
  const list = getInscriptions();
  const { whatsappGreeting } = getSettings();
  const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });
  const hello = whatsappGreeting.replace(/Obirin,?/, "").trim() || "Bonjour";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-5xl text-forest">Adhésions du site</h1>
          <p className="mt-2 text-ink-soft">
            Demandes envoyées depuis la page publique « Adhérer à Green World », de la plus récente à la plus ancienne ({list.length}).
          </p>
        </div>
        {list.length > 0 && (
          <a href="/admin/inscriptions/export" className="rounded-full border border-forest/20 px-5 py-2.5 text-sm font-semibold text-forest hover:bg-cream">
            Exporter en CSV
          </a>
        )}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-ivory p-8 text-ink-soft">Aucune demande d&apos;adhésion pour le moment.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {list.map((r) => {
            const wa = (r.whatsapp || r.telephone).replace(/\D/g, "");
            return (
              <li key={r.id} className="rounded-2xl border border-forest/10 bg-ivory p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-forest">
                      {r.prenom} {r.nom}
                    </p>
                    <p className="text-sm text-ink-soft">Reçue le {date.format(new Date(r.recuLe))}</p>
                  </div>
                  <form action={deleteInscriptionAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="text-xs text-ink-soft hover:text-fuchsia">
                      Supprimer
                    </button>
                  </form>
                </div>
                {r.notification && (
                  <p className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${r.notification.ok ? "bg-mist text-emerald" : "bg-blush text-fuchsia-600"}`}>
                    {r.notification.ok ? "✓ Envoyée automatiquement sur WhatsApp" : `✗ Non envoyée sur WhatsApp — ${r.notification.error}`}
                  </p>
                )}

                <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-ink-soft">E-mail</dt>
                    <dd className="font-medium text-ink">{r.email}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-soft">Téléphone</dt>
                    <dd className="font-medium text-ink">{r.telephone}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-soft">WhatsApp</dt>
                    <dd className="font-medium text-ink">{r.whatsapp || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-soft">Adresse</dt>
                    <dd className="whitespace-pre-line font-medium text-ink">{r.adresse}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-ink-soft">Produits qui l&apos;intéressent ({r.produits.length})</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {r.produits.map((p) => (
                        <a key={p.slug} href={`/produits/${p.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-cream px-3 py-1 text-forest hover:bg-mist">
                          {p.name}
                        </a>
                      ))}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-2 text-sm">
                  <a href={`tel:${r.telephone.replace(/\s/g, "")}`} className="rounded-full border border-forest/20 px-4 py-2 font-semibold text-forest">
                    Appeler {r.telephone}
                  </a>
                  {wa.length >= 8 && (
                    <a
                      href={whatsappLink(wa, `${hello} ${r.prenom}, nous avons bien reçu votre demande d'adhésion à Green World.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-[#1f7a4c] px-4 py-2 font-semibold text-ivory"
                    >
                      Répondre sur WhatsApp
                    </a>
                  )}
                  <a href={`mailto:${r.email}`} className="rounded-full border border-forest/20 px-4 py-2 font-semibold text-forest">
                    Écrire un e-mail
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
