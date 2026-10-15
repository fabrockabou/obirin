// Dev helper: node scripts/contact-sheet.mjs <dir> <out.png> [bg]
// Lays images out on a grid (checker/colored background reveals transparency) for visual QA.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [, , dir, out, bg = "#2f4f3a"] = process.argv;
const files = fs.readdirSync(dir).filter((f) => /\.(webp|png|jpg)$/.test(f));
const cell = 300, cols = 5, rows = Math.ceil(files.length / cols);
const composites = [];
for (const [i, f] of files.entries()) {
  const buf = await sharp(path.join(dir, f)).resize(cell - 10, cell - 30, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  composites.push({ input: buf, left: (i % cols) * cell + 5, top: Math.floor(i / cols) * cell + 5 });
  const label = Buffer.from(`<svg width="${cell}" height="22"><text x="4" y="16" font-size="13" fill="#fff" font-family="Arial">${f.slice(0, 40)}</text></svg>`);
  composites.push({ input: label, left: (i % cols) * cell, top: Math.floor(i / cols) * cell + cell - 24 });
}
await sharp({ create: { width: cols * cell, height: rows * cell, channels: 4, background: bg } }).composite(composites).png().toFile(out);
console.log(out, files.length);
