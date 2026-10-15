/**
 * Logo du site : le mot-symbole OBIRIN, typographique (gras, net, vectoriel — aucune image).
 * Les logos Green World imprimés sur les emballages des produits ne sont pas concernés.
 */
export function LogoLockup({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span
      className={`font-sans text-[1.55rem] font-extrabold uppercase leading-none tracking-[0.16em] sm:text-[1.75rem] ${
        tone === "light" ? "text-ivory" : "text-forest"
      }`}
    >
      Obirin
    </span>
  );
}

/** Version grand format (pied de page, page « Notre marque »). */
export function LogoFull({ className = "text-4xl", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span className={`block font-sans font-extrabold uppercase leading-none tracking-[0.16em] ${tone === "light" ? "text-ivory" : "text-forest"} ${className}`}>
      Obirin
    </span>
  );
}
