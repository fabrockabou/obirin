# Obirin — site premium (produits Green World) : rapport de livraison

## Lancer le projet
```
npm install --ignore-scripts && node node_modules/ffmpeg-static/install.js   # ffmpeg sert uniquement à régénérer le film
npm run dev          # http://localhost:3000
npm run build && npm start
npm run assets       # régénère les images depuis /source (catalogue, packshots, photos de collections)
npm run hero-video   # régénère le film provisoire du Hero
```
En production, définir `NEXT_PUBLIC_SITE_URL` (URL canoniques, sitemap, Open Graph) et, si possible, `CONTACT_WEBHOOK_URL` (voir `.env.example`).

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · GSAP 3.13 + ScrollTrigger (aucune autre librairie d'animation) · next/image.
Données centralisées : `data/products.ts`, `data/collections.ts`, `data/services.ts`, `data/site.ts`.

## Analyse du catalogue (22 pages)
Le PDF ne contient aucun texte : chaque page est une image. Toutes les pages ont été lues visuellement et retranscrites.
- Pages 1–3 : couverture, présentation Octobre Rose, chapitre Santé & équilibre féminin (→ pages éditoriales).
- Pages 4–19 (numérotation imprimée) : **13 produits**, chacun avec sa page.
- Page 13 : présentation Beauté & Éclat (→ collection).
- Pages 20–22 : services (présentation, Rendez-vous de bien-être 5 000 FCFA, Bain ionique des pieds 5 000 FCFA) ; dernière page : siège Green World Côte d'Ivoire.
- Remarque : la page imprimée **10 n'existe pas** (le PDF passe de 9 à 11).

| Produit | Prix | Format |
|---|---|---|
| Thé Soin des Seins | 9 900 | 4 g × 16 sachets |
| Soja Puissance | 11 880 | 300 mg × 90 capsules |
| Nutrition Ovarienne | 15 840 | 300 mg × 90 capsules |
| Pilules Nettoyantes pour l'Utérus | 21 120 | 1 g × 6 pills |
| Gelée Royale | 12 210 | 600 mg × 30 gélules |
| Serviettes hygiéniques Jour / Nuit | 2 400 / 2 400 | 245 mm × 10 / 290 mm × 8 |
| Thé d'Amaigrissement Pro-Slim Tea | 7 920 | 4 g × 16 sachets |
| Chitosan Capsule | 15 840 | 400 mg × 60 capsules |
| Peptide de Collagène Blueberry Colafruit | 13 200 | 300 g (25 g × 12) |
| Savon d'Olive | 1 440 | 100 g |
| Lotion Tonique Bleuet | 11 880 | 100 ml |
| Sérum Visage Bleuet | 16 500 | 50 ml |
| Crème Contour des Yeux Bleuet | 12 540 | 30 g |
| Shampooing à la Kératine | 6 600 | 255 ml |

## Fonctionnalités livrées et testées
- **Hero piloté par le scroll** (300 vh, 260 vh mobile) : vidéo téléchargée en blob puis scrubbée par ScrollTrigger dans les deux sens ; textes HTML synchronisés ; indicateur de progression. Vérifié : 15,6 % de scroll → 1,69 s (attendu 1,56 s avec lissage), 38 % → 3,78 s.
  - Film portrait pour les écrans en orientation portrait, version allégée 1,2 Mo pour les connexions 2G/3G, affiches seules si Save-Data, repli sur affiches si la vidéo échoue, version statique (titre + boutons) sans JavaScript ou avec « réduire les animations ».
- **Accueil** : philosophie, 6 univers, sélection éditoriale, rituel bleuet en défilement horizontal épinglé (desktop) / vertical (mobile), services, signature de marque.
- **17 pages produits** (13 du catalogue + 3 références hors catalogue + serviettes avec variantes Jour/Nuit) en **4 mises en page** alternées (éditoriale, immersive, split, portrait), galerie (clavier, vignettes, fiche catalogue d'origine), produits associés, navigation précédent/suivant. Le choix Jour/Nuit met à jour prix, format, image et lien de demande (testé).
- **6 collections**, **2 pages services**, **Notre marque**, **Contact**, 404, sitemap (30 URLs), robots.txt, métadonnées et Open Graph par page, JSON-LD (Organization, Product avec prix en XOF, Service, BreadcrumbList).
- **Navigation** : header transparent → vert profond → ivoire, masqué au scroll descendant ; menu plein écran mobile (focus piégé, Échap, retour du focus) ; recherche produits/services (touche « / », insensible aux accents) — testés.
- **Contact** : formulaire pré-rempli depuis un produit, une variante ou un service ; validation serveur ; anti-spam. Testé de bout en bout : la demande est enregistrée dans `data/.requests/` ou transmise à `CONTACT_WEBHOOK_URL`. Aucun paiement ni panier simulé.
- `npm run build` : OK, 39 routes, pages produits/collections/services pré-générées. 33 routes vérifiées (200 / 307 / 404 attendus).

## Visuels
- Packshots fournis : utilisés pour Nutrition Ovarienne, Soja Puissance, Gelée Royale, Serviettes Jour (avec versions détourées, étiquettes intactes).
- Les autres produits : extraits fidèles de leur page du catalogue (produit complet, jamais recadré).
- Photos de collections : vos 7 portraits (`source/collections`) sont utilisés pour les 6 collections et l'univers Services.

## Points à valider / éléments manquants
1. **Chitosan** : le catalogue indique 400 mg × **60** capsules (flacon blanc) ; votre packshot montre un flacon bleu 400 mg × **100** capsules. Le site suit le catalogue et présente le flacon bleu comme « autre conditionnement, prix non communiqué ».
2. **Savon d'olive** : votre packshot porte les mentions « 245 mm / Anion Enjoyable / 10 pétos » (celles des serviettes). Il n'est pas utilisé ; le visuel du catalogue est affiché.
3. **Slimming Capsule, Multi-Vitamins (enfants), Zinc (enfants)** : absents du catalogue d'octobre → collection « Autres références », informations limitées au texte de l'emballage, « prix sur demande ».
4. **Coordonnées** : aucun téléphone, e-mail, adresse ni horaires dans le catalogue → rien n'a été inventé ; à fournir.
5. **Film du Hero** : provisoire (motion design à partir des packshots). Brief du film définitif : `docs/hero-video-brief.md`.
6. **Résolution** : les extraits du catalogue font ~300–600 px ; des packshots HD détourés des autres produits amélioreraient nettement le rendu.
7. Commerce en ligne : architecture prête (données centralisées, route API), mais panier, paiement, stock et comptes restent à intégrer quand une solution est choisie.

## Identité du site
- Logo : mot-symbole **OBIRIN** (gras, typographique, `components/brand/Logo.tsx`), favicon `app/icon.svg`, ouverture du film du Hero.
- Nom du site, titres de pages, Hero, textes de marque, formulaire, pied de page : **Obirin**.
- « Green World » reste uniquement là où il désigne la marque des produits ou la source : emballages, textes alternatifs des photos produits, mention « catalogue Green World — octobre 2026 », marque produit dans les données structurées.
