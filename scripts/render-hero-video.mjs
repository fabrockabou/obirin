// Renders the provisional hero film (motion design from the real packshots) and encodes it
// for scroll scrubbing: short GOP (keyframe every 4 frames), no B-frames, faststart.
//   node scripts/render-hero-video.mjs            -> desktop (1600x900) + mobile (720x1280) + posters
// Replace public/videos/hero-*.mp4 with the final film shot from docs/hero-video-brief.md when available;
// the HeroScroll component does not need to change as long as the file names stay the same.
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
const assets = {
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

// ---------- helpers ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const range = (t, a, b) => clamp((t - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
function rng(seed) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

const R = rng(7);
const particles = Array.from({ length: 140 }, () => ({ x: R(), y: R(), z: 0.3 + R() * 0.7, s: R(), gold: R() > 0.55 }));
const petals = Array.from({ length: 26 }, () => ({ x: R(), y: R(), z: 0.4 + R() * 0.9, rot: R() * Math.PI * 2, spin: (R() - 0.5) * 3, sway: R() * Math.PI * 2, hue: R() }));
const leaves = Array.from({ length: 14 }, (_, i) => ({ side: i % 2 ? 1 : -1, y: R(), len: 0.25 + R() * 0.35, ang: (R() - 0.5) * 1.2, depth: 0.5 + R() * 0.8, tone: R() }));

function drawLeaf(ctx, x, y, len, ang, tone, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.globalAlpha = alpha;
  const g = ctx.createLinearGradient(0, -len / 2, 0, len / 2);
  g.addColorStop(0, `rgb(${18 + tone * 20},${70 + tone * 40},${48 + tone * 20})`);
  g.addColorStop(1, `rgb(4,${28 + tone * 18},18)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -len / 2);
  ctx.bezierCurveTo(len * 0.32, -len * 0.25, len * 0.3, len * 0.25, 0, len / 2);
  ctx.bezierCurveTo(-len * 0.3, len * 0.25, -len * 0.32, -len * 0.25, 0, -len / 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(160,210,170,${0.18 * alpha})`;
  ctx.lineWidth = Math.max(1, len * 0.006);
  ctx.beginPath();
  ctx.moveTo(0, -len / 2);
  ctx.lineTo(0, len / 2);
  ctx.stroke();
  ctx.restore();
}

function drawPetal(ctx, x, y, size, rot, hue, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(0, -size * 0.2, 0, 0, 0, size);
  g.addColorStop(0, hue > 0.5 ? "#ffd3e2" : "#f7b8cf");
  g.addColorStop(1, hue > 0.5 ? "#d9467e" : "#c02a68");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.55, size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawProduct(ctx, img, cx, baseY, h, alpha, light = 1) {
  if (alpha <= 0) return;
  const w = (img.width / img.height) * h;
  ctx.save();
  ctx.globalAlpha = alpha;
  // contact shadow
  const sh = ctx.createRadialGradient(cx, baseY, 0, cx, baseY, w * 0.65);
  sh.addColorStop(0, "rgba(0,0,0,0.55)");
  sh.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.ellipse(cx, baseY, w * 0.65, h * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = `brightness(${0.55 + 0.45 * light})`;
  ctx.drawImage(img, cx - w / 2, baseY - h, w, h);
  ctx.filter = "none";
  // soft reflection
  ctx.globalAlpha = alpha * 0.12 * light;
  ctx.translate(cx, baseY);
  ctx.scale(1, -0.35);
  ctx.drawImage(img, -w / 2, -h, w, h);
  ctx.restore();
}

function spotlight(ctx, x, y, r, a, color = "255,238,214") {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${color},${a})`);
  g.addColorStop(0.45, `rgba(${color},${a * 0.35})`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// ---------- scene ----------
function renderFrame(ctx, W, H, t, portrait) {
  const U = portrait ? W : H; // unit for sizes
  // background: emerald almost black, slowly opening
  const open = ease(range(t, 0, 0.3));
  const bg = ctx.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, Math.max(W, H) * 0.9);
  bg.addColorStop(0, `rgb(${lerp(6, 18, open)},${lerp(26, 62, open)},${lerp(19, 44, open)})`);
  bg.addColorStop(1, "rgb(2,10,7)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // camera
  const push = ease(range(t, 0.22, 0.48)); // push-in on hero product
  const travel = ease(range(t, 0.46, 0.76)); // lateral travel
  const pull = ease(range(t, 0.66, 0.9)); // pull back to lineup

  // background leaves (parallax)
  for (const l of leaves) {
    const show = range(t, 0.12, 0.3) * (1 - 0.4 * range(t, 0.9, 1));
    const px = l.side < 0 ? W * (0.02 + 0.06 * l.depth) : W * (0.98 - 0.06 * l.depth);
    const shift = (travel - pull * 0.5) * W * 0.25 * l.depth * -1;
    const zoom = 1 + push * 0.35 * l.depth - pull * 0.2;
    drawLeaf(ctx, px + shift + l.side * push * W * 0.08 * l.depth, H * (0.15 + l.y * 0.8), U * l.len * zoom, l.ang + l.side * 0.5, l.tone, 0.85 * show);
  }

  // particles (dust + gold)
  for (const p of particles) {
    const a = range(t, 0.02, 0.2) * (0.25 + 0.6 * p.s);
    const x = ((p.x + t * 0.05 * p.z - travel * 0.25 * p.z) % 1 + 1) % 1;
    const y = ((p.y - t * 0.12 * p.z) % 1 + 1) % 1;
    ctx.fillStyle = p.gold ? `rgba(226,190,120,${a})` : `rgba(220,240,225,${a * 0.6})`;
    ctx.beginPath();
    ctx.arc(x * W, y * H, (0.6 + p.s * 1.8) * (U / 900) * (0.6 + p.z), 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- scene 2: le logo OBIRIN (mot-symbole gras) apparaît dans un halo ivoire (0.04 -> 0.3)
  const logoIn = easeOut(range(t, 0.04, 0.16));
  const logoOut = range(t, 0.24, 0.32);
  const logoA = logoIn * (1 - logoOut);
  if (logoA > 0) {
    const size = (portrait ? W * 0.15 : H * 0.15) * (0.94 + 0.06 * logoIn + 0.08 * logoOut);
    const cy = H * 0.46 - logoOut * H * 0.06;
    spotlight(ctx, W / 2, cy, size * 3.4, 0.18 * logoA, "246,241,231");
    ctx.save();
    ctx.globalAlpha = logoA;
    ctx.font = `900 ${Math.round(size)}px "Arial Black", "Segoe UI Black", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${Math.round(size * 0.12)}px`;
    ctx.fillStyle = "#f8f4ec";
    ctx.fillText("OBIRIN", W / 2, cy);
    ctx.restore();
  }

  // ---- scene 3: light reveals hero product (Ovary Nutrition) and camera pushes in
  const reveal = ease(range(t, 0.2, 0.34));
  const heroFade = 1 - range(t, 0.5, 0.58);
  if (reveal > 0 && heroFade > 0) {
    const h = U * (portrait ? 0.62 : 0.58) * (1 + push * 0.45);
    // en paysage, le produit occupe le tiers droit pour laisser la place au titre à gauche
    const cx = (portrait ? W / 2 : W * 0.66) - travel * W * 0.35;
    const base = H * (portrait ? 0.74 : 0.84) + push * H * 0.12;
    // podium
    ctx.save();
    ctx.globalAlpha = reveal * heroFade;
    const pg = ctx.createLinearGradient(0, base - 10, 0, base + h * 0.12);
    pg.addColorStop(0, "rgba(236,226,206,0.55)");
    pg.addColorStop(1, "rgba(30,50,40,0)");
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.ellipse(cx, base + 4, h * 0.42, h * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    spotlight(ctx, cx, base - h * 0.55, h * 0.75, 0.55 * reveal * heroFade);
    drawProduct(ctx, assets.ovary, cx, base, h, reveal * heroFade, reveal);
  }

  // ---- scene 4: travelling latéral à travers toute la gamme (profondeurs alternées)
  const passA = range(t, 0.44, 0.52);
  const passOut = 1 - range(t, 0.72, 0.8);
  if (passA > 0 && passOut > 0) {
    const items = [
      { img: assets.soy, d: 0.95 },
      { img: assets.royal, d: 1.1 },
      { img: assets.soap, d: 0.8, wide: true },
      { img: assets.chitosan, d: 1.0 },
      { img: assets.slimming, d: 0.9 },
      { img: assets.pads, d: 0.85, wide: true },
      { img: assets.zinc, d: 1.05 },
      { img: assets.multi, d: 0.9 },
    ];
    const gap = portrait ? 0.5 : 0.24;
    const span = (items.length - 1) * gap + 0.1;
    const drawList = items.map((it, i) => ({ ...it, x: W * (i * gap + 0.6 - travel * span) })).sort((p, q) => p.d - q.d);
    for (const it of drawList) {
      if (it.x < -W * 0.3 || it.x > W * 1.3) continue;
      const h = U * (it.wide ? 0.26 : 0.46) * it.d * (portrait ? 1.15 : 1);
      const base = H * (0.8 + (it.d - 1) * 0.12);
      spotlight(ctx, it.x, base - h * 0.5, h * 0.8, 0.3 * passA * passOut);
      drawProduct(ctx, it.img, it.x, base, h, ease(passA) * passOut, 0.9);
    }
  }

  // ---- scene 5: composition finale, deux rangs — recul de caméra, place laissée au titre
  const line = ease(range(t, 0.7, 0.84));
  if (line > 0) {
    const set = portrait
      ? [
          { img: assets.chitosan, x: 0.17, h: 0.3, b: 0.73 },
          { img: assets.slimming, x: 0.39, h: 0.3, b: 0.72 },
          { img: assets.zinc, x: 0.61, h: 0.3, b: 0.72 },
          { img: assets.multi, x: 0.83, h: 0.3, b: 0.73 },
          { img: assets.royal, x: 0.22, h: 0.42, b: 0.86 },
          { img: assets.ovary, x: 0.5, h: 0.5, b: 0.89 },
          { img: assets.soy, x: 0.78, h: 0.43, b: 0.87 },
          { img: assets.soap, x: 0.27, h: 0.15, b: 0.97 },
          { img: assets.pads, x: 0.73, h: 0.15, b: 0.97 },
        ]
      : [
          { img: assets.chitosan, x: 0.3, h: 0.32, b: 0.76 },
          { img: assets.slimming, x: 0.42, h: 0.32, b: 0.75 },
          { img: assets.zinc, x: 0.58, h: 0.32, b: 0.75 },
          { img: assets.multi, x: 0.7, h: 0.32, b: 0.76 },
          { img: assets.soap, x: 0.2, h: 0.17, b: 0.91 },
          { img: assets.pads, x: 0.8, h: 0.17, b: 0.91 },
          { img: assets.royal, x: 0.37, h: 0.43, b: 0.89 },
          { img: assets.soy, x: 0.63, h: 0.44, b: 0.9 },
          { img: assets.ovary, x: 0.5, h: 0.5, b: 0.93 },
        ];
    const lift = (1 - line) * H * 0.06 + range(t, 0.9, 1) * -H * 0.02;
    spotlight(ctx, W / 2, H * 0.72, W * 0.5, 0.35 * line);
    for (const [i, it] of set.entries()) {
      const a = ease(range(t, 0.7 + i * 0.015, 0.82 + i * 0.015));
      drawProduct(ctx, it.img, W * it.x, H * it.b + lift, U * it.h * (1 - 0.06 * pull), a, 0.95);
    }
  }

  // petals
  for (const p of petals) {
    const a = range(t, 0.26, 0.36) * (1 - range(t, 0.95, 1)) * 0.85;
    if (a <= 0) continue;
    const y = ((p.y + t * 0.6 * p.z) % 1.1) - 0.05;
    const x = p.x + Math.sin(p.sway + t * 12) * 0.02 - travel * 0.2 * p.z;
    drawPetal(ctx, (((x % 1) + 1) % 1) * W, y * H, (U / 900) * 9 * p.z, p.rot + t * p.spin * 6, p.hue, a * (0.4 + 0.6 * p.z));
  }

  // vignette + gentle darkening at the very end (title legibility)
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, `rgba(1,8,5,${0.75})`);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  const top = ctx.createLinearGradient(0, 0, 0, H * 0.5);
  top.addColorStop(0, `rgba(2,12,8,${0.55 * range(t, 0.78, 0.92)})`);
  top.addColorStop(1, "rgba(2,12,8,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, H * 0.5);
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
  const posters = { 0.12: "logo", 0.86: "final" };
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
