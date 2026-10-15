// Builds public/images from the original sources in /source.
// - source/catalogue/images/pXX_*.png : the 22 catalogue pages (only raster content of the PDF)
// - source/N.webp                      : isolated packshots supplied by Green World
// Nothing is redrawn: we only crop, resize, and (for white-background packshots) make the
// background transparent by flood-filling near-white pixels connected to the image border.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..");
const SRC = path.join(ROOT, "source");
const PAGES = path.join(SRC, "catalogue", "images");
const OUT = path.join(ROOT, "public", "images");
for (const d of ["catalogue", "products", "packshots", "editorial"]) fs.mkdirSync(path.join(OUT, d), { recursive: true });

const page = (n) => {
  const f = fs.readdirSync(PAGES).find((x) => x.startsWith(`p${String(n).padStart(2, "0")}_`));
  return path.join(PAGES, f);
};

// 1. Full catalogue pages (used as "fiche catalogue" in galleries)
for (let p = 1; p <= 22; p++) {
  await sharp(page(p)).resize({ width: 1024 }).webp({ quality: 86 }).toFile(path.join(OUT, "catalogue", `page-${String(p).padStart(2, "0")}.webp`));
}

// 2. Product crops from catalogue pages [pdfPage, left, top, width, height]
const crops = {
  "the-soin-des-seins": [4, 600, 465, 372, 615],
  "pilules-nettoyantes-uterus": [7, 20, 680, 560, 330],
  "serviettes-nuit": [9, 140, 815, 432, 285],
  "pro-slim-tea": [10, 630, 580, 345, 465],
  "chitosan-capsule": [11, 722, 482, 293, 538],
  "collagene-blueberry-colafruit": [13, 480, 860, 425, 262],
  "savon-olive": [14, 355, 740, 660, 368],
  "lotion-tonique-bleuet": [15, 380, 560, 322, 545],
  "serum-visage-bleuet": [16, 335, 580, 337, 520],
  "creme-contour-yeux-bleuet": [17, 170, 680, 548, 392],
  "shampooing-keratine": [18, 360, 500, 215, 600],
  "soja-puissance-catalogue": [5, 625, 490, 335, 625],
  "nutrition-ovarienne-catalogue": [6, 600, 550, 320, 600],
  "gelee-royale-catalogue": [8, 595, 510, 330, 620],
};
for (const [name, [p, left, top, width, height]] of Object.entries(crops)) {
  await sharp(page(p)).extract({ left, top, width, height }).webp({ quality: 92 }).toFile(path.join(OUT, "products", `${name}.webp`));
}

// 3. Editorial crops (lifestyle imagery from the catalogue)
const editorial = {
  "cover-portrait": [1, 0, 40, 520, 940],
  "femmes-portrait": [2, 0, 0, 470, 700],
  "beaute-eclat-portrait": [12, 0, 0, 440, 1080],
  "beaute-eclat-ingredients": [12, 380, 850, 644, 215],
  "services-consultation": [19, 472, 400, 552, 490],
  "services-detente": [19, 20, 930, 984, 230],
  "rendez-vous-analyse": [20, 470, 270, 554, 500],
  "bain-ionique": [21, 420, 160, 340, 780],
  "bain-ionique-bassin": [21, 740, 560, 280, 260],
  "siege-cote-ivoire": [22, 480, 0, 544, 620],
  "soin-visage": [15, 0, 0, 430, 560],
  "soin-cheveux": [18, 0, 0, 470, 820],
  "silhouette": [10, 0, 0, 420, 520],
  "savon-gestuelle": [14, 505, 120, 325, 560],
};
for (const [name, [p, left, top, width, height]] of Object.entries(editorial)) {
  await sharp(page(p)).extract({ left, top, width, height }).webp({ quality: 88 }).toFile(path.join(OUT, "editorial", `${name}.webp`));
}

// 4. Packshots supplied as isolated product photos (white background) -> transparent PNG/WebP
const packshots = {
  1: "nutrition-ovarienne",
  2: "slimming-capsule",
  3: "soja-puissance",
  4: "chitosan-capsule-100",
  5: "gelee-royale",
  6: "multi-vitamines-enfants",
  7: "zinc-enfants",
  8: "serviettes-jour",
  9: "savon-olive-packshot",
};

function removeWhiteBackground(data, w, h, threshold = 244) {
  // Flood fill from borders across near-white pixels; alpha 0 for filled, soft edge ring.
  const visited = new Uint8Array(w * h);
  const stack = [];
  const isBg = (i) => data[i * 4] >= threshold && data[i * 4 + 1] >= threshold && data[i * 4 + 2] >= threshold;
  for (let x = 0; x < w; x++) { stack.push(x, (h - 1) * w + x); }
  for (let y = 0; y < h; y++) { stack.push(y * w, y * w + w - 1); }
  while (stack.length) {
    const i = stack.pop();
    if (visited[i] || !isBg(i)) continue;
    visited[i] = 1;
    const x = i % w, y = (i / w) | 0;
    if (x > 0) stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - w);
    if (y < h - 1) stack.push(i + w);
  }
  for (let i = 0; i < w * h; i++) {
    if (visited[i]) { data[i * 4 + 3] = 0; continue; }
    // feather pixels adjacent to background
    const x = i % w, y = (i / w) | 0;
    const nb = (x > 0 && visited[i - 1]) + (x < w - 1 && visited[i + 1]) + (y > 0 && visited[i - w]) + (y < h - 1 && visited[i + w]);
    if (nb) {
      const lum = (data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 3;
      data[i * 4 + 3] = Math.max(60, Math.min(255, Math.round((255 - lum) * 6)));
    }
  }
}

for (const [n, name] of Object.entries(packshots)) {
  const file = path.join(SRC, `${n}.webp`);
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // keep original (white background) too
  await sharp(file).webp({ quality: 90 }).toFile(path.join(OUT, "packshots", `${name}.webp`));
  removeWhiteBackground(data, info.width, info.height);
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 0 })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(path.join(OUT, "packshots", `${name}-detoure.webp`));
}
// 4b. Packshots v2 (source/packshots-v2), fournis déjà détourés (PNG/WebP transparents) : ils remplacent
// les versions précédentes. Version « détourée » = rognée ; version standard = posée sur fond blanc.
const packshotsV2 = {
  10: "savon-olive-packshot",
  11: "zinc-enfants",
  12: "multi-vitamines-enfants",
  13: "gelee-royale",
  14: "chitosan-capsule-100",
  15: "soja-puissance",
  16: "slimming-capsule",
  17: "nutrition-ovarienne",
  18: "serviettes-jour",
};
for (const [n, name] of Object.entries(packshotsV2)) {
  const file = path.join(SRC, "packshots-v2", `${n}.webp`);
  const cut = await sharp(file).ensureAlpha().trim({ threshold: 0 }).toBuffer();
  await sharp(cut).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(OUT, "packshots", `${name}-detoure.webp`));
  const m = await sharp(cut).metadata();
  const pad = Math.round(Math.max(m.width, m.height) * 0.06);
  await sharp(cut).extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#ffffff" }).flatten({ background: "#ffffff" })
    .webp({ quality: 90 }).toFile(path.join(OUT, "packshots", `${name}.webp`));
}
console.log("assets ok");

// 5. Brand logo, cut from catalogue page 20 (cleanest white background). Colours untouched:
// white is converted to transparency ("colour to alpha"), so letter counters and anti-aliasing stay clean.
{
  fs.mkdirSync(path.join(OUT, "brand"), { recursive: true });
  const { data, info } = await sharp(page(19)).extract({ left: 165, top: 22, width: 215, height: 138 })
    .resize({ width: 860, kernel: "lanczos3" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  for (let i = 0; i < w * h; i++) {
    const x = i % w, y = (i / w) | 0;
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    let a = Math.max(255 - r, 255 - g, 255 - b) / 255;
    a = Math.min(1, Math.max(0, (a - 0.06) / 0.7)); // remove paper tint, firm up solids
    if (x > w * 0.83 && y < h * 0.22) a = 0; // registered mark / page residue in the corner
    if (a <= 0) { data[i * 4 + 3] = 0; continue; }
    for (let c = 0; c < 3; c++) data[i * 4 + c] = Math.max(0, Math.min(255, Math.round((data[i * 4 + c] - 255 * (1 - a)) / a)));
    data[i * 4 + 3] = Math.round(a * 255);
  }
  await sharp(data, { raw: { width: w, height: h, channels: 4 } }).trim({ threshold: 0 })
    .png().toFile(path.join(OUT, "brand", "green-world-logo.png"));
}
console.log("logo ok");

// 5b. Photos des collections fournies par Green World (source/collections) -> WebP optimisé
{
  const map = {
    "Portrait chaleureux d’une femme souriante sur canapé.png": "sante-feminine",
    "Portrait beauté éclatant aux tons chaleureux.png": "minceur-nutrition",
    "Portrait beauté lumineuse au sourire éclatant.png": "beaute-eclat",
    "Portrait beauté glamour sur fond beige.png": "soins-capillaires",
    "Portrait spa éclatant au turban blanc.png": "hygiene-soin-quotidien",
    "Portrait de famille chaleureuse à quatre.png": "services-bien-etre",
    "Portrait beauté radieux aux tons chaleureux.png": "autres-references",
  };
  fs.mkdirSync(path.join(OUT, "collections"), { recursive: true });
  for (const [file, slug] of Object.entries(map)) {
    await sharp(path.join(SRC, "collections", file)).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 84 })
      .toFile(path.join(OUT, "collections", `${slug}.webp`));
  }
}

// 5c. Portrait de la section « Notre philosophie » (fourni par le client)
await sharp(path.join(SRC, "editorial-philosophie.webp")).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 86 })
  .toFile(path.join(OUT, "editorial", "philosophie-portrait.webp"));

// 6. Emblem (leaves + stars, without wordmark) for the header lockup and favicon
{
  const logo = path.join(OUT, "brand", "green-world-logo.png");
  const m = await sharp(logo).metadata();
  // feuilles + étoiles = 80 % supérieurs du logo ; les pixels quasi transparents (résidus) sont mis à zéro avant le rognage
  const { data: ed, info: ei } = await sharp(logo).extract({ left: 0, top: 0, width: m.width, height: Math.round(m.height * 0.8) })
    .raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < ed.length; i += 4) if (ed[i] < 60) ed[i] = 0;
  await sharp(ed, { raw: { width: ei.width, height: ei.height, channels: 4 } }).trim({ threshold: 0 })
    .png().toFile(path.join(OUT, "brand", "green-world-emblem.png"));
  // Le favicon du site est app/icon.svg (logo OBIRIN) : plus de génération d'icône ici.
  console.log("emblem ok");
}

// 7. Manifest of intrinsic sizes (consumed by data/images.ts for next/image, avoids layout shift)
{
  const manifest = {};
  const walk = async (dir) => {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) { await walk(full); continue; }
      if (!/\.(webp|png|jpg)$/.test(f)) continue;
      const m = await sharp(full).metadata();
      manifest["/" + path.relative(path.join(ROOT, "public"), full).split(path.sep).join("/")] = [m.width, m.height];
    }
  };
  await walk(OUT);
  await walk(path.join(ROOT, "public", "videos")).catch(() => {});
  fs.writeFileSync(path.join(ROOT, "data", "image-manifest.json"), JSON.stringify(manifest, null, 1));
  console.log("manifest", Object.keys(manifest).length);
}

