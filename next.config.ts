import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // envoi d'images depuis l'administration (12 Mo par image, plusieurs images par enregistrement)
  experimental: { serverActions: { bodySizeLimit: "40mb" } },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 640, 828, 1080, 1280, 1600, 1920],
  },
  async headers() {
    return [
      {
        source: "/videos/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
