import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { HideOnAdmin } from "@/components/navigation/HideOnAdmin";
import { WhatsappFloat } from "@/components/navigation/WhatsappFloat";
import { getSettings } from "@/lib/store";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { site } from "@/data/site";
import { buildSearchIndex } from "@/lib/search";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.fullName}`, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    images: [{ url: "/videos/hero-desktop-poster-final.webp", width: 1600, height: 900, alt: "Produits Obirin" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#03130d",
  width: "device-width",
  initialScale: 1,
};

// Ajouté avant le premier rendu : active les états initiaux des animations uniquement si JS est
// disponible et que l'utilisateur n'a pas demandé à réduire les animations. Filet de sécurité :
// si l'application ne s'hydrate pas, le contenu redevient visible après 4 s.
const motionBootstrap = `(function(){try{var d=document.documentElement;if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('js-motion');setTimeout(function(){if(!window.__gwMotionReady){d.classList.remove('js-motion')}},4000)}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootstrap }} />
      </head>
      <body>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ivory focus:px-5 focus:py-3 focus:text-forest"
        >
          Aller au contenu
        </a>
        <HideOnAdmin>
          <Header searchIndex={buildSearchIndex()} />
        </HideOnAdmin>
        <MotionProvider>{children}</MotionProvider>
        <HideOnAdmin>
          <Footer />
          <WhatsappFloat number={getSettings().whatsappNumber} greeting={getSettings().whatsappGreeting} />
        </HideOnAdmin>
      </body>
    </html>
  );
}
