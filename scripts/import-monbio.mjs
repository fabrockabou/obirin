// Importe les produits Monbio (source : bundle de groupemonbio.com, extrait dans source/monbio/products-source.json).
//   node scripts/import-monbio.mjs            -> régénère data/products-monbio.json (contenu initial)
//   node scripts/import-monbio.mjs --store    -> ajoute aussi au stockage du site les produits absents
//                                              (les produits déjà présents, éventuellement modifiés dans /admin, ne sont pas écrasés)
// Textes repris tels quels ; seul le découpage format / origine est fait automatiquement.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..");
const source = JSON.parse(fs.readFileSync(path.join(ROOT, "source", "monbio", "products-source.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "image-manifest.json"), "utf8"));

// Même règle d'affichage que groupemonbio.com : euros × 655,957, arrondi à la centaine de FCFA.
const toFcfa = (eur) => Math.round((eur * 655.957) / 100) * 100;

const slugify = (t) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// fin de description « 1L — Union Européenne. » -> format + mention d'origine
const TAIL = /\s*((?:1L|\d+g|\d+ pièces|Lot de 3 senteurs)\b.*)$/;
const FORMAT = { "1L": "1 L", "50g": "50 g", "100g": "100 g", "500g": "500 g", "21g": "21 g" };
const TONE = { Savons: "honey", Coton: "ocean", Visage: "ivory", Senteurs: "rose" };

const products = source.map((p) => {
  const m = TAIL.exec(p.description);
  const tail = m ? m[1].trim() : "";
  const intro = m ? p.description.slice(0, m.index).trim() : p.description.trim();
  const rawFormat = tail.split(/\s+—\s+|\.\s*/)[0].trim();
  const origin = tail.includes("—") ? tail.split("—").slice(1).join("—").trim() : "";
  const firstSentence = intro.split(/(?<=\.)\s+/)[0];
  const src = `/images/monbio/${p.id}.webp`;
  const [width, height] = manifest[src];
  const siblings = source.filter((x) => x.category === p.category && x.id !== p.id && x.id !== 10).slice(0, 3);
  return {
    slug: slugify(p.name),
    name: p.name,
    packagingName: "Monbio",
    brand: "Monbio",
    collection: "monbio",
    price: toFcfa(p.price),
    format: FORMAT[rawFormat] ?? rawFormat,
    catalogueCategory: p.category,
    cataloguePage: null,
    tagline: firstSentence,
    intro,
    benefits: [],
    ...(p.isNew ? { highlights: ["Nouveauté"] } : {}),
    ...(origin ? { sourceNote: `Origine : ${origin.replace(/\.$/, "")}.` } : {}),
    source: "Informations et prix : site officiel Monbio (groupemonbio.com). Prix converti en FCFA comme sur le site Monbio.",
    image: { src, alt: `${p.name} — photo Monbio`, width, height, kind: "packshot" },
    gallery: [],
    layout: "split",
    tone: TONE[p.category] ?? "emerald",
    related: siblings.map((x) => slugify(x.name)),
    // la photo publiée par Monbio pour ce produit montre un savon : masqué tant qu'une bonne photo n'est pas ajoutée
    ...(p.id === 10 ? { hidden: true } : {}),
  };
});

const slugs = new Set(products.map((p) => p.slug));
if (slugs.size !== products.length) throw new Error("adresses en double");
fs.writeFileSync(path.join(ROOT, "data", "products-monbio.json"), JSON.stringify(products, null, 2) + "\n");
console.log(`${products.length} produits Monbio écrits dans data/products-monbio.json`);
for (const p of products) console.log(`  ${p.slug} — ${p.price} FCFA — ${p.format}${p.hidden ? " (masqué)" : ""}`);

if (process.argv.includes("--store")) {
  const storeDir = path.resolve(process.env.OBIRIN_STORE_DIR || path.join(ROOT, "data", "store"));
  const file = path.join(storeDir, "products.json");
  if (!fs.existsSync(file)) {
    console.log("Pas de stockage existant : les produits seront créés au premier démarrage du site.");
  } else {
    const current = JSON.parse(fs.readFileSync(file, "utf8"));
    const existing = new Set(current.map((p) => p.slug));
    const added = products.filter((p) => !existing.has(p.slug));
    fs.writeFileSync(file, JSON.stringify([...current, ...added], null, 2));
    console.log(`Stockage : ${added.length} produit(s) ajouté(s), ${products.length - added.length} déjà présent(s).`);
  }
}
