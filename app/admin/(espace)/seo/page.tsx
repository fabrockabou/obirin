import type { Metadata } from "next";
import { SeoForm } from "@/components/admin/SeoForm";
import { site } from "@/data/site";
import { getSettings } from "@/lib/store";

export const metadata: Metadata = { title: "SEO & méta" };

export default function AdminSeoPage() {
  const s = getSettings();
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="display text-5xl text-forest">SEO &amp; méta</h1>
        <p className="mt-2 text-ink-soft">Titre, description, mots-clés et image de partage du site.</p>
      </div>
      <SeoForm
        favicon={s.seoFavicon}
        initial={{ title: s.seoTitle, siteName: s.seoSiteName, description: s.seoDescription, keywords: s.seoKeywords, image: s.seoImage, noIndex: s.seoNoIndex }}
        defaults={{ title: site.fullName, siteName: site.name, description: site.description }}
      />
    </div>
  );
}
