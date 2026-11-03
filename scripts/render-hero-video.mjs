// Film du Hero (motion design à partir des vrais packshots), encodé pour le pilotage au scroll :
// GOP court (image clé toutes les 4 images), sans B-frames, faststart.
//   node scripts/render-hero-video.mjs                 -> desktop (1600x900) + mobile (720x1280) + affiches + version légère
//   node scripts/render-hero-video.mjs --preview 0.4,0.6  -> images PNG de contrôle dans .qa/hero/ (rien n'est encodé)
// Remplacer public/videos/hero-*.mp4 par le film définitif (docs/hero-video-brief.md) quand il existe :
// le composant HeroScroll n'a pas besoin de changer tant que les noms de fichiers restent identiques.
//
// Chronologie (fraction du scroll) — synchronisée avec components/hero/hero-config.ts :
//   0.00–0.32  ouverture : faisceaux de lumière, bokeh, logo OBIRIN
//   0.20–0.56  révélation de Nutrition Ovarienne sur un socle de marbre cerclé d'or (texte « manifeste » à gauche)
//   0.44–0.80  carrousel en arc : toute la gamme défile, produit central net et lumineux (texte « univers »)
//   0.72–1.00  composition finale en podium (titre OBIRIN + boutons au-dessus)
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..");
const IMG = path.join(ROOT, "public", "images");
const OUT = path.join(ROOT, "public", "videos");
fs.mkdirSync(OUT, { recursive: true });

const FPS = 30;
const SECONDS = 10;
const FRAMES = FPS * SECONDS;

const cut = (name) => loadImage(path.join(IMG, "packshots", `${name}-detoure.webp`));
const A = {
  ovary: await cut("nutrition-ovarienne"),
  soy: await cut("soja-puissance"),
  royal: await cut("gelee-royale"),
  pads: await cut("serviettes-jour"),
  chitosan: await cut("chitosan-capsule-100"),
  slimming: await cut("slimming-capsule"),
  soap: await cut("savon-olive-packshot"),
  zinc: await cut("zinc-enfants"),
  multi: await cut("multi-vitamines-enfants"),
};

// ───────────────────────── outils ─────────────────────────
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const range = (t, a, b) => clamp((t - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
function rng(seed) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
}
const R = rng(11);
const bokeh = Array.from({ length: 34 }, () => ({ x: R(), y: R(), r: 0.012 + R() * 0.045, z: 0.3 + R() * 0.9, rose: R() > 0.62, a: 0.05 + R() * 0.11, ph: R() * 6.28 }));
const dust = Array.from({ length: 90 }, () => ({ x: R(), y: R(), z: 0.3 + R() * 0.7, s: R() }));
const petals = Array.from({ length: 18 }, () => ({ x: R(), y: R(), z: 0.4 + R() * 0.9, rot: R() * 6.28, spin: (R() - 0.5) * 3, sway: R() * 6.28, hue: R() }));
const sparkles = Array.from({ length: 26 }, () => ({ x: R(), y: R(), ph: R() * 6.28, s: 0.5 + R() }));

const GOLD = (ctx, x1, y1, x2, y2) => {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, "#8f6a2c");
  g.addColorStop(0.35, "#f4dc97");
  g.addColorStop(0.55, "#c99b48");
  g.addColorStop(0.8, "#f8e6ad");
  g.addColorStop(1, "#8f6a2c");
  return g;
};

function glow(ctx, x, y, r, a, color = "255,236,200") {
  if (a <= 0 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${color},${a})`);
  g.addColorStop(0.4, `rgba(${color},${a * 0.35})`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** Faisceaux de lumière tombant du haut, légèrement mouvants. */
function lightBeams(ctx, W, H, t, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const beams = [
    { x: 0.32, w: 0.16, tilt: -0.18, k: 1 },
    { x: 0.55, w: 0.22, tilt: 0.08, k: 0.8 },
    { x: 0.74, w: 0.12, tilt: 0.22, k: 0.65 },
  ];
  for (const [i, b] of beams.entries()) {
    const sway = Math.sin(t * 6 + i * 1.7) * 0.03;
    const x0 = W * (b.x + sway);
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.95);
    g.addColorStop(0, `rgba(255,236,196,${0.13 * a * b.k})`);
    g.addColorStop(0.55, `rgba(255,226,180,${0.05 * a * b.k})`);
    g.addColorStop(1, "rgba(255,226,180,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x0 - W * b.w * 0.18, 0);
    ctx.lineTo(x0 + W * b.w * 0.18, 0);
    ctx.lineTo(x0 + W * (b.w * 0.5 + b.tilt * 0.4), H);
    ctx.lineTo(x0 - W * (b.w * 0.5 - b.tilt * 0.4), H);
    ctx.closePath();
    ctx.filter = `blur(${Math.round(W * 0.012)}px)`;
    ctx.fill();
  }
  ctx.filter = "none";
  ctx.restore();
}

function drawBokeh(ctx, W, H, t, a, shift) {
  if (a <= 0) return;
  const U = Math.min(W, H);
  for (const b of bokeh) {
    const x = ((((b.x - shift * 0.35 * b.z + Math.sin(t * 3 + b.ph) * 0.01) % 1) + 1) % 1) * W;
    const y = ((((b.y - t * 0.05 * b.z) % 1) + 1) % 1) * H;
    const r = b.r * U * 2.2;
    const tw = 0.75 + 0.25 * Math.sin(t * 9 + b.ph);
    glow(ctx, x, y, r, b.a * a * tw, b.rose ? "236,160,190" : "236,200,130");
  }
}

/** Socle cylindrique en marbre ivoire, liseré d'or. (cx, top) = centre de la face supérieure. */
function pedestal(ctx, cx, top, rw, height, a, seed = 1) {
  if (a <= 0) return;
  const rh = rw * 0.2;
  ctx.save();
  ctx.globalAlpha = a;
  // ombre portée au sol
  const sh = ctx.createRadialGradient(cx, top + height + rh * 0.3, 0, cx, top + height + rh * 0.3, rw * 1.6);
  sh.addColorStop(0, "rgba(0,0,0,0.55)");
  sh.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.ellipse(cx, top + height + rh * 0.3, rw * 1.6, rh * 1.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // flanc
  const side = ctx.createLinearGradient(cx - rw, 0, cx + rw, 0);
  side.addColorStop(0, "#8c826f");
  side.addColorStop(0.28, "#e9e0cf");
  side.addColorStop(0.48, "#fbf7ef");
  side.addColorStop(0.75, "#d6ccb8");
  side.addColorStop(1, "#6f6656");
  ctx.fillStyle = side;
  ctx.beginPath();
  ctx.moveTo(cx - rw, top);
  ctx.lineTo(cx - rw, top + height);
  ctx.ellipse(cx, top + height, rw, rh, 0, Math.PI, 0, true);
  ctx.lineTo(cx + rw, top);
  ctx.closePath();
  ctx.fill();
  // bandeau doré en pied
  if (height > rh * 0.8) {
    ctx.strokeStyle = GOLD(ctx, cx - rw, 0, cx + rw, 0);
    ctx.lineWidth = Math.max(1.5, rw * 0.035);
    ctx.beginPath();
    ctx.ellipse(cx, top + height - rh * 0.25, rw * 0.995, rh, 0, 0, Math.PI);
    ctx.stroke();
  }
  // face supérieure en marbre
  const face = ctx.createRadialGradient(cx - rw * 0.25, top - rh * 0.3, 0, cx, top, rw * 1.1);
  face.addColorStop(0, "#ffffff");
  face.addColorStop(0.6, "#f1eadc");
  face.addColorStop(1, "#cfc4ae");
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.ellipse(cx, top, rw, rh, 0, 0, Math.PI * 2);
  ctx.fill();
  // veines du marbre
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = "rgba(150,138,118,0.28)";
  ctx.lineWidth = Math.max(1, rw * 0.008);
  for (let v = 0; v < 3; v++) {
    const o = ((seed * 37 + v * 53) % 100) / 100 - 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - rw, top + rh * o);
    ctx.bezierCurveTo(cx - rw * 0.3, top - rh * (0.6 + o), cx + rw * 0.2, top + rh * (0.7 - o), cx + rw, top + rh * o * 0.5);
    ctx.stroke();
  }
  ctx.restore();
  // liseré d'or
  ctx.strokeStyle = GOLD(ctx, cx - rw, top, cx + rw, top);
  ctx.lineWidth = Math.max(2, rw * 0.045);
  ctx.beginPath();
  ctx.ellipse(cx, top, rw, rh, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Étagère de marbre (pour la rangée arrière de la composition finale). */
function shelf(ctx, x1, x2, top, height, a) {
  if (a <= 0) return;
  const depth = (x2 - x1) * 0.045;
  ctx.save();
  ctx.globalAlpha = a;
  const front = ctx.createLinearGradient(0, top, 0, top + height);
  front.addColorStop(0, "#e9e0cf");
  front.addColorStop(1, "#8a806d");
  ctx.fillStyle = front;
  ctx.fillRect(x1, top, x2 - x1, height);
  const face = ctx.createLinearGradient(x1, 0, x2, 0);
  face.addColorStop(0, "#d9cfbb");
  face.addColorStop(0.5, "#fbf7ef");
  face.addColorStop(1, "#d9cfbb");
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.moveTo(x1 + depth, top - depth);
  ctx.lineTo(x2 - depth, top - depth);
  ctx.lineTo(x2, top);
  ctx.lineTo(x1, top);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = GOLD(ctx, x1, 0, x2, 0);
  ctx.lineWidth = Math.max(2, height * 0.08);
  ctx.beginPath();
  ctx.moveTo(x1, top);
  ctx.lineTo(x2, top);
  ctx.stroke();
  ctx.restore();
}

/**
 * Produit posé en (cx, base) : image nette ou floutée (profondeur de champ), ombre de contact,
 * reflet discret, et éventuellement un reflet lumineux qui balaie l'emballage (shine ∈ [0,1]).
 */
const off = createCanvas(10, 10);
function product(ctx, img, cx, base, h, { a = 1, light = 1, blur = 0, shine = -1, reflect = 0.14 } = {}) {
  if (a <= 0.003 || h <= 2) return;
  const w = (img.width / img.height) * h;
  ctx.save();
  ctx.globalAlpha = a;
  const sh = ctx.createRadialGradient(cx, base, 0, cx, base, w * 0.6);
  sh.addColorStop(0, "rgba(0,0,0,0.5)");
  sh.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.ellipse(cx, base, w * 0.6, h * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = `${blur > 0.3 ? `blur(${blur.toFixed(1)}px) ` : ""}brightness(${(0.5 + 0.5 * light).toFixed(3)})`;
  ctx.drawImage(img, cx - w / 2, base - h, w, h);
  ctx.filter = "none";
  // reflet lumineux : bande claire limitée à la silhouette du produit
  if (shine >= 0 && shine <= 1) {
    const ow = Math.ceil(w), oh = Math.ceil(h);
    off.width = ow;
    off.height = oh;
    const o = off.getContext("2d");
    o.clearRect(0, 0, ow, oh);
    o.drawImage(img, 0, 0, ow, oh);
    o.globalCompositeOperation = "source-in";
    const bx = lerp(-ow * 0.6, ow * 1.6, shine);
    const g = o.createLinearGradient(bx - ow * 0.35, 0, bx + ow * 0.35, oh * 0.4);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.5, "rgba(255,250,235,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    o.fillStyle = g;
    o.fillRect(0, 0, ow, oh);
    o.globalCompositeOperation = "source-over";
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(off, cx - w / 2, base - h, w, h);
    ctx.globalCompositeOperation = "source-over";
  }
  if (reflect > 0) {
    ctx.globalAlpha = a * reflect * light;
    ctx.translate(cx, base);
    ctx.scale(1, -0.32);
    if (blur > 0.3) ctx.filter = `blur(${(blur + 2).toFixed(1)}px)`;
    ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.filter = "none";
  }
  ctx.restore();
}

function sparkle(ctx, x, y, s, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = "#fff4d6";
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x, y, x + s * 0.28, y);
  ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s * 0.28, y);
  ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.7, y);
  ctx.quadraticCurveTo(x, y, x, y - s * 0.2);
  ctx.quadraticCurveTo(x, y, x + s * 0.7, y);
  ctx.quadraticCurveTo(x, y, x, y + s * 0.2);
  ctx.quadraticCurveTo(x, y, x - s * 0.7, y);
  ctx.fill();
  glow(ctx, x, y, s * 1.6, 0.35, "255,230,170");
  ctx.restore();
}

function petal(ctx, x, y, size, rot, hue, a) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(0, -size * 0.2, 0, 0, 0, size);
  g.addColorStop(0, hue > 0.5 ? "#ffd8e6" : "#f7bcd2");
  g.addColorStop(1, hue > 0.5 ? "#d9467e" : "#b8285f");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.55, size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ───────────────────────── scène ─────────────────────────
const CAROUSEL = [A.ovary, A.royal, A.soy, A.chitosan, A.slimming, A.soap, A.pads, A.zinc, A.multi];
const WIDE = new Set([A.soap, A.pads]);

function renderFrame(ctx, W, H, t, portrait) {
  const U = portrait ? W : H;
  const k = U / 900; // échelle des détails

  // fond : émeraude profond, s'ouvre doucement
  const open = ease(range(t, 0, 0.3));
  const bg = ctx.createRadialGradient(W / 2, H * 0.62, 0, W / 2, H * 0.62, Math.max(W, H) * 0.95);
  bg.addColorStop(0, `rgb(${lerp(5, 22, open)},${lerp(22, 66, open)},${lerp(16, 48, open)})`);
  bg.addColorStop(0.55, `rgb(${lerp(3, 9, open)},${lerp(14, 34, open)},${lerp(10, 25, open)})`);
  bg.addColorStop(1, "rgb(1,7,5)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // sol brillant (horizon) une fois la scène ouverte
  const floorA = range(t, 0.18, 0.34);
  if (floorA > 0) {
    const fy = H * (portrait ? 0.79 : 0.74);
    const fl = ctx.createLinearGradient(0, fy, 0, H);
    fl.addColorStop(0, `rgba(10,42,29,${0.0})`);
    fl.addColorStop(0.08, `rgba(18,58,40,${0.55 * floorA})`);
    fl.addColorStop(1, `rgba(2,10,7,${0.9 * floorA})`);
    ctx.fillStyle = fl;
    ctx.fillRect(0, fy, W, H - fy);
    ctx.strokeStyle = `rgba(217,195,154,${0.18 * floorA})`;
    ctx.lineWidth = Math.max(1, k);
    ctx.beginPath();
    ctx.moveTo(W * 0.05, fy + H * 0.012);
    ctx.lineTo(W * 0.95, fy + H * 0.012);
    ctx.stroke();
  }

  const travel = ease(range(t, 0.52, 0.76));
  lightBeams(ctx, W, H, t, range(t, 0.06, 0.26) * (1 - 0.35 * range(t, 0.9, 1)));
  drawBokeh(ctx, W, H, t, range(t, 0.04, 0.22), travel);

  // ── ouverture : logo OBIRIN
  const logoIn = easeOut(range(t, 0.04, 0.16));
  const logoOut = range(t, 0.24, 0.32);
  const logoA = logoIn * (1 - logoOut);
  if (logoA > 0) {
    const size = (portrait ? W * 0.15 : H * 0.15) * (0.94 + 0.06 * logoIn + 0.08 * logoOut);
    const cy = H * 0.46 - logoOut * H * 0.06;
    glow(ctx, W / 2, cy, size * 3.6, 0.2 * logoA, "246,232,200");
    ctx.save();
    ctx.globalAlpha = logoA;
    ctx.font = `900 ${Math.round(size)}px "Arial Black", "Segoe UI Black", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${Math.round(size * 0.12)}px`;
    ctx.fillStyle = "#f8f4ec";
    ctx.fillText("OBIRIN", W / 2, cy);
    // fin filet doré sous le logo
    const lw = size * 2.6 * logoIn;
    ctx.fillStyle = GOLD(ctx, W / 2 - lw, 0, W / 2 + lw, 0);
    ctx.fillRect(W / 2 - lw / 2, cy + size * 0.75, lw, Math.max(1.5, size * 0.025));
    ctx.restore();
  }

  // ── révélation : Nutrition Ovarienne sur son socle (tiers droit en paysage)
  const reveal = ease(range(t, 0.2, 0.34));
  // le produit d'ouverture glisse jusqu'à sa place au centre du carrousel, puis le carrousel prend le relais
  const heroOut = 1 - range(t, 0.5, 0.52);
  if (reveal > 0 && heroOut > 0) {
    const push = ease(range(t, 0.24, 0.48));
    const zoom = 1 + push * 0.3;
    const m = ease(range(t, 0.42, 0.5));
    const cx = lerp(portrait ? W / 2 : W * 0.68, W / 2, m);
    const h = lerp(U * 0.5 * zoom, U * 0.44 * (portrait ? 1.2 : 1), m);
    const top = lerp(H * (portrait ? 0.7 : 0.74) + push * H * 0.04, H * (portrait ? 0.74 : 0.76), m);
    const rw = (A.ovary.width / A.ovary.height) * h * 0.78;
    const a = reveal * heroOut;
    glow(ctx, cx, top - h * 0.55, h * 0.95, 0.5 * a);
    pedestal(ctx, cx, top, rw, h * lerp(0.15, 0.13, m), a, 3);
    product(ctx, A.ovary, cx, top, h, { a, light: reveal, shine: range(t, 0.3, 0.44), reflect: 0 });
  }

  // ── carrousel en arc : toute la gamme
  const carIn = ease(range(t, 0.47, 0.51));
  const carOut = 1 - range(t, 0.75, 0.8);
  if (carIn > 0 && carOut > 0) {
    const n = CAROUSEL.length;
    const step = portrait ? 0.82 : 0.6;
    const phi = travel * (n - 1) * step;
    const cx = W / 2;
    const radius = W * (portrait ? 0.78 : 0.47);
    const items = CAROUSEL.map((img, i) => {
      const th = i * step - phi;
      const z = Math.cos(th);
      return { img, th, z, i };
    })
      .filter((it) => Math.abs(it.th) < 1.75)
      .sort((p, q) => p.z - q.z);
    for (const it of items) {
      const depth = (it.z + 1) / 2; // 0 loin → 1 devant
      const x = cx + Math.sin(it.th) * radius;
      const wide = WIDE.has(it.img);
      const s = lerp(0.36, 1, Math.pow(depth, 1.5));
      const h = U * (wide ? 0.24 : 0.44) * s * (portrait ? 1.2 : 1);
      const top = H * (portrait ? 0.74 : 0.76) - (1 - depth) * H * 0.07;
      const a = carIn * carOut * clamp((1.75 - Math.abs(it.th)) / 0.45);
      const blur = (1 - depth) * 7 * k;
      const rw = (it.img.width / it.img.height) * h * (wide ? 0.62 : 0.78);
      if (depth > 0.92) glow(ctx, x, top - h * 0.5, h * 0.95, 0.42 * a * (depth - 0.92) / 0.08);
      ctx.save();
      if (blur > 0.5) ctx.filter = `blur(${(blur * 0.6).toFixed(1)}px)`;
      pedestal(ctx, x, top, rw, h * 0.13, a * lerp(0.55, 1, depth), it.i + 1);
      ctx.restore();
      const centered = clamp(1 - Math.abs(it.th) / (step * 0.5));
      product(ctx, it.img, x, top, h, {
        a,
        light: lerp(0.35, 1, depth),
        blur,
        reflect: 0,
        shine: centered > 0 ? 1 - centered * 0.5 - 0.25 + Math.sign(it.th) * 0.25 : -1,
      });
    }
  }

  // ── composition finale : rangée arrière sur étagère + trois socles + produits au sol
  const fin = ease(range(t, 0.72, 0.86));
  if (fin > 0) {
    const lift = (1 - fin) * H * 0.05;
    const L = portrait
      ? {
          shelf: [0.08, 0.92, 0.69, 0.018],
          back: [
            [A.chitosan, 0.2],
            [A.slimming, 0.4],
            [A.zinc, 0.6],
            [A.multi, 0.8],
          ],
          backH: 0.25,
          peds: [
            [A.royal, 0.2, 0.86, 0.3, 0.05],
            [A.ovary, 0.5, 0.835, 0.37, 0.09],
            [A.soy, 0.8, 0.86, 0.31, 0.05],
          ],
          floor: [
            [A.soap, 0.3, 0.965, 0.13],
            [A.pads, 0.7, 0.965, 0.13],
          ],
        }
      : {
          shelf: [0.2, 0.8, 0.68, 0.022],
          back: [
            [A.chitosan, 0.27],
            [A.slimming, 0.405],
            [A.zinc, 0.595],
            [A.multi, 0.73],
          ],
          backH: 0.25,
          peds: [
            [A.royal, 0.36, 0.86, 0.33, 0.06],
            [A.ovary, 0.5, 0.83, 0.38, 0.1],
            [A.soy, 0.64, 0.86, 0.34, 0.06],
          ],
          floor: [
            [A.soap, 0.19, 0.95, 0.12],
            [A.pads, 0.81, 0.95, 0.12],
          ],
        };
    glow(ctx, W / 2, H * 0.66, Math.max(W, H) * 0.42, 0.32 * fin);
    const [sx1, sx2, sTop, sH] = L.shelf;
    const shelfA = ease(range(t, 0.72, 0.8));
    shelf(ctx, W * sx1, W * sx2, H * sTop + lift, H * sH, shelfA);
    L.back.forEach(([img, x], i) => {
      const a = ease(range(t, 0.74 + i * 0.012, 0.84 + i * 0.012));
      product(ctx, img, W * x, H * sTop + lift, U * L.backH, { a, light: 0.82, reflect: 0, blur: 0.8 * k });
    });
    L.peds.forEach(([img, x, top, h, ph], i) => {
      const a = ease(range(t, 0.73 + i * 0.015, 0.83 + i * 0.015));
      const hh = U * h;
      const rw = (img.width / img.height) * hh * 0.8;
      pedestal(ctx, W * x, H * top + lift, rw, U * ph, a, 7 + i);
      product(ctx, img, W * x, H * top + lift, hh, { a, light: 1, reflect: 0, shine: range(t, 0.84 + i * 0.03, 0.96 + i * 0.03) });
    });
    L.floor.forEach(([img, x, top, h], i) => {
      const a = ease(range(t, 0.76 + i * 0.015, 0.86 + i * 0.015));
      product(ctx, img, W * x, H * top + lift, U * h, { a, light: 0.9, reflect: 0.16 });
    });
    // paillettes autour de la composition
    for (const s of sparkles) {
      const tw = Math.max(0, Math.sin(t * 40 + s.ph * 3));
      const sx = W * lerp(0.15, 0.85, s.x);
      const sy = H * lerp(0.42, 0.92, s.y);
      sparkle(ctx, sx, sy, 7 * k * s.s, fin * Math.pow(tw, 6) * 0.9);
    }
  }

  // poussière d'or qui monte
  const dustA = range(t, 0.02, 0.2);
  for (const p of dust) {
    const x = ((((p.x + t * 0.03 * p.z - travel * 0.18 * p.z) % 1) + 1) % 1) * W;
    const y = ((((p.y - t * 0.16 * p.z) % 1) + 1) % 1) * H;
    ctx.fillStyle = `rgba(232,200,130,${dustA * (0.18 + 0.5 * p.s)})`;
    ctx.beginPath();
    ctx.arc(x, y, (0.6 + p.s * 1.6) * k * (0.6 + p.z), 0, Math.PI * 2);
    ctx.fill();
  }

  // pétales roses (pendant la révélation et le carrousel)
  for (const p of petals) {
    const a = range(t, 0.26, 0.36) * (1 - range(t, 0.72, 0.8)) * 0.8;
    if (a <= 0) break;
    const y = ((p.y + t * 0.55 * p.z) % 1.1) - 0.05;
    const x = p.x + Math.sin(p.sway + t * 12) * 0.02 - travel * 0.25 * p.z;
    petal(ctx, ((((x % 1) + 1) % 1)) * W, y * H, 9 * k * p.z, p.rot + t * p.spin * 6, p.hue, a * (0.35 + 0.65 * p.z));
  }

  // vignette + assombrissement du haut à la fin (lisibilité du titre)
  const v = ctx.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.32, W / 2, H * 0.55, Math.max(W, H) * 0.78);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(1,7,5,0.8)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  const topDark = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  topDark.addColorStop(0, `rgba(2,12,8,${0.6 * range(t, 0.76, 0.9)})`);
  topDark.addColorStop(1, "rgba(2,12,8,0)");
  ctx.fillStyle = topDark;
  ctx.fillRect(0, 0, W, H * 0.55);
}

// ───────────────────────── rendu ─────────────────────────
const preview = process.argv.indexOf("--preview");
if (preview > 0) {
  const times = (process.argv[preview + 1] || "0.12,0.4,0.6,0.7,0.9").split(",").map(Number);
  const dir = path.join(ROOT, ".qa", "hero");
  fs.mkdirSync(dir, { recursive: true });
  for (const [label, W, H, portrait] of [["d", 1600, 900, false], ["m", 720, 1280, true]]) {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");
    for (const t of times) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      renderFrame(ctx, W, H, t, portrait);
      fs.writeFileSync(path.join(dir, `${label}_${t}.png`), await canvas.encode("png"));
    }
  }
  console.log("aperçus dans .qa/hero");
  process.exit(0);
}

async function render(name, W, H, portrait, crf) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const file = path.join(OUT, `${name}.mp4`);
  const ff = spawn(ffmpegPath, [
    "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-pix_fmt", "yuv420p",
    "-g", "4", "-keyint_min", "4", "-bf", "0", "-movflags", "+faststart", "-an", file,
  ], { stdio: ["pipe", "ignore", "inherit"] });
  const posters = { 0.12: "logo", 0.9: "final" };
  for (let f = 0; f < FRAMES; f++) {
    const t = f / (FRAMES - 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    renderFrame(ctx, W, H, t, portrait);
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    for (const [pt, label] of Object.entries(posters)) {
      if (f === Math.round(Number(pt) * (FRAMES - 1))) {
        await sharp(await canvas.encode("png")).webp({ quality: 82 }).toFile(path.join(OUT, `${name}-poster-${label}.webp`));
      }
    }
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on("close", (c) => (c === 0 ? r() : j(new Error("ffmpeg " + c)))));
  console.log(name, (fs.statSync(file).size / 1e6).toFixed(1) + " MB");
}

await render("hero-desktop", 1600, 900, false, 24);
await render("hero-mobile", 720, 1280, true, 26);

// Version allégée (connexions « 3g ») : même film, 960×540, débit réduit.
await new Promise((resolve, reject) => {
  const ff = spawn(ffmpegPath, ["-y", "-v", "error", "-i", path.join(OUT, "hero-desktop.mp4"), "-vf", "scale=960:-2", "-c:v", "libx264", "-preset", "slow", "-crf", "30",
    "-pix_fmt", "yuv420p", "-g", "4", "-keyint_min", "4", "-bf", "0", "-movflags", "+faststart", "-an", path.join(OUT, "hero-desktop-light.mp4")], { stdio: "inherit" });
  ff.on("close", (c) => (c === 0 ? resolve() : reject(new Error("ffmpeg " + c))));
});
console.log("hero-desktop-light", (fs.statSync(path.join(OUT, "hero-desktop-light.mp4")).size / 1e6).toFixed(1) + " MB");
