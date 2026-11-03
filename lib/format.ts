/** 9900 -> "9 900" (espace fine insécable, comme dans le catalogue) */
export function formatPrice(value: number): string {
  return value.toLocaleString("fr-FR").replace(/\s/g, " ");
}

export function formatFcfa(value: number | null): string {
  return value === null ? "Prix sur demande" : `${formatPrice(value)} FCFA`;
}
