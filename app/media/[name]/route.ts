import fs from "node:fs";
import { uploadPath } from "@/lib/uploads";

export const runtime = "nodejs";

// Sert les images envoyées depuis l'administration (stockées hors de /public, sur le disque persistant).
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const target = uploadPath(name);
  if (!target || !fs.existsSync(target)) return new Response("Introuvable", { status: 404 });
  return new Response(fs.readFileSync(target), {
    headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
