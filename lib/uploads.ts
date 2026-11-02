import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { ImageAsset } from "@/data/types";
import { UPLOAD_DIR } from "./store";

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Enregistre une image envoyée depuis l'administration : redimensionnée (1600 px max), convertie en
 * WebP, transparence conservée. Pour une image détourée, les bords transparents sont rognés.
 */
export async function saveUpload(file: File, { alt, cutout = false }: { alt: string; cutout?: boolean }): Promise<ImageAsset> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Format d'image non pris en charge (JPEG, PNG, WebP ou AVIF).");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image trop lourde (12 Mo maximum).");
  const input = Buffer.from(await file.arrayBuffer());
  let pipeline = sharp(input, { failOn: "error" }).rotate();
  if (cutout) pipeline = pipeline.trim({ threshold: 0 });
  const output = await pipeline
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 100 })
    .toBuffer({ resolveWithObject: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(5).toString("hex")}.webp`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), output.data);
  return {
    src: `/media/${name}`,
    alt,
    width: output.info.width,
    height: output.info.height,
    kind: cutout ? "detoure" : "packshot",
  };
}

/** Chemin disque d'un fichier /media/<nom>, ou null si le nom n'est pas valide (protège contre ../). */
export function uploadPath(name: string) {
  if (!/^[a-z0-9]+-[a-f0-9]+\.(webp|png)$/.test(name)) return null;
  return path.join(UPLOAD_DIR, name);
}

/** Favicon du site : recadrée en carré et convertie en PNG 256 px (compatible tous navigateurs). */
export async function saveFavicon(file: File): Promise<string> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Format d'image non pris en charge (JPEG, PNG, WebP ou AVIF).");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image trop lourde (12 Mo maximum).");
  const output = await sharp(Buffer.from(await file.arrayBuffer()), { failOn: "error" })
    .rotate()
    .resize({ width: 256, height: 256, fit: "cover" })
    .png()
    .toBuffer();
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = `favicon-${crypto.randomBytes(5).toString("hex")}.png`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), output);
  return `/media/${name}`;
}
