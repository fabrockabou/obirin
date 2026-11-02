import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const hidden = getSettings().seoNoIndex;
  return {
    rules: hidden ? { userAgent: "*", disallow: "/" } : { userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] },
    sitemap: hidden ? undefined : `${site.url}/sitemap.xml`,
  };
}
