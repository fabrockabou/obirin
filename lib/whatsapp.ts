/** Garde uniquement les chiffres d'un numéro (« +225 07 00 00 00 00 » → « 2250700000000 »). */
export function normalizeWhatsapp(input: string) {
  return input.replace(/\D/g, "").replace(/^00/, "");
}

export function isValidWhatsapp(number: string) {
  return /^\d{8,15}$/.test(number);
}

/** Lien « cliquer pour discuter » officiel de WhatsApp, avec message pré-rempli. */
export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${normalizeWhatsapp(number)}?text=${encodeURIComponent(message)}`;
}
