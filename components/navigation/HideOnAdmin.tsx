"use client";

import { usePathname } from "next/navigation";

/** Masque l'en-tête et le pied de page du site public dans l'espace d'administration. */
export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
}
