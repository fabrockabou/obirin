import type { Metadata } from "next";
import { deleteRequestAction } from "@/app/admin/actions";
import { getSettings, listRequests } from "@/lib/store";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Demandes reçues" };

const sujetLabel: Record<string, string> = { produit: "Produit", "rendez-vous": "Rendez-vous", question: "Question" };

export default function AdminRequestsPage() {
  const requests = listRequests();
  const { whatsappGreeting } = getSettings();
  const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="display text-5xl text-forest">Demandes reçues</h1>
      <p className="mt-2 text-ink-soft">Demandes du formulaire de contact et clics sur les boutons WhatsApp du site, de la plus récente à la plus ancienne.</p>

      {requests.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-ivory p-8 text-ink-soft">Aucune demande pour le moment.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {requests.map((r) => {
            const about = r.produitNom ?? r.serviceNom;
            const phone = r.telephone.replace(/\D/g, "");
            const viaWhatsapp = r.source === "whatsapp-produit" || r.source === "whatsapp-flottant";
            return (
              <li key={r.id} className={`rounded-2xl border p-6 ${viaWhatsapp ? "border-[#25d366]/40 bg-[#25d366]/[0.06]" : "border-forest/10 bg-ivory"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-forest">
                      {viaWhatsapp
                        ? r.source === "whatsapp-produit"
                          ? `Commande via WhatsApp${about ? ` — ${about}` : ""}`
                          : "Contact via le bouton WhatsApp"
                        : r.nom}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {date.format(new Date(r.recuLe))}
                      {viaWhatsapp ? "" : ` · ${sujetLabel[r.sujet] ?? r.sujet}${about ? ` · ${about}` : ""}`}
                      {r.variante ? ` (${r.variante})` : ""}
                      {r.page ? ` · depuis ${r.page}` : ""}
                    </p>
                    {viaWhatsapp && (
                      <p className="mt-2 text-sm text-ink-soft">
                        Le visiteur a ouvert WhatsApp avec le message prêt : son nom et son numéro apparaissent dans votre WhatsApp s&apos;il l&apos;a envoyé.
                      </p>
                    )}
                  </div>
                  <form action={deleteRequestAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="text-xs text-ink-soft hover:text-fuchsia">
                      Supprimer
                    </button>
                  </form>
                </div>
                {r.whatsapp && (
                  <p className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${r.whatsapp.ok ? "bg-mist text-emerald" : "bg-blush text-fuchsia-600"}`}>
                    {r.whatsapp.ok ? "✓ Envoyée automatiquement sur WhatsApp" : `✗ Non envoyée sur WhatsApp — ${r.whatsapp.error}`}
                  </p>
                )}
                {r.message && <p className="mt-4 whitespace-pre-line rounded-xl bg-cream p-4 text-sm">{r.message}</p>}
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  {r.telephone && (
                    <>
                      <a href={`tel:${r.telephone.replace(/\s/g, "")}`} className="rounded-full border border-forest/20 px-4 py-2 font-semibold text-forest">
                        Appeler {r.telephone}
                      </a>
                      {phone.length >= 8 && (
                        <a
                          href={whatsappLink(phone, `${whatsappGreeting.replace(/Obirin,?/, "").trim() || "Bonjour"} ${r.nom}, nous avons bien reçu votre demande${about ? ` concernant « ${about} »` : ""}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-[#1f7a4c] px-4 py-2 font-semibold text-ivory"
                        >
                          Répondre sur WhatsApp
                        </a>
                      )}
                    </>
                  )}
                  {r.email && (
                    <a href={`mailto:${r.email}`} className="rounded-full border border-forest/20 px-4 py-2 font-semibold text-forest">
                      {r.email}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
