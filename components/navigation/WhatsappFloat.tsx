"use client";

import { usePathname } from "next/navigation";
import { WhatsappIcon } from "@/components/ui/WhatsappIcon";
import { trackWhatsappClick } from "@/lib/track";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Bouton WhatsApp flottant, présent sur toutes les pages du site public.
 * Le visiteur écrit depuis son propre WhatsApp ; le message rappelle la page consultée.
 */
export function WhatsappFloat({ number, greeting }: { number: string; greeting: string }) {
  const pathname = usePathname();
  if (!number) return null;

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // le message est composé au moment du clic, avec le titre de la page affichée
    const title = document.title.replace(/\s+—\s+Obirin.*$/, "").trim();
    const text = [greeting, pathname === "/" ? "Je vous contacte depuis le site Obirin." : `Je vous contacte au sujet de : ${title}.`].filter(Boolean).join("\n");
    e.currentTarget.href = whatsappLink(number, text);
    trackWhatsappClick({ source: "whatsapp-flottant" });
  };

  return (
    <a
      href={whatsappLink(number, greeting)}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous écrire sur WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-[#25d366] p-3.5 text-white shadow-[0_12px_32px_-8px_rgba(3,19,13,0.55)] transition-transform duration-500 ease-[var(--ease-luxe)] hover:scale-105 focus-visible:scale-105 sm:bottom-7 sm:right-7"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25d366] opacity-25 motion-reduce:hidden" aria-hidden="true" />
      <WhatsappIcon className="size-7" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-[max-width] duration-500 group-hover:max-w-40 sm:inline">
        Écrivez-nous
      </span>
    </a>
  );
}
