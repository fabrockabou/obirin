# Brief de production — film du Hero Green World

Le site contient un **film provisoire** (`public/videos/hero-*.mp4`) : un motion design généré à partir des vrais packshots (Ovary Nutrition, Soy Power, Gelée Royale, serviettes Enjoyable) et du logo. Il est fonctionnel et synchronisé au scroll, mais ce n'est **pas** un tournage. Ce brief décrit le film définitif.

## Format
- Durée : **10 s** (la séquence est étirée sur 300 vh de scroll ; garder 10 s évite de modifier le code).
- Deux versions : **paysage 1920×1080** (desktop) et **portrait 1080×1920** (mobile), même découpage.
- Aucun texte incrusté : titres et boutons sont en HTML, synchronisés par le site.
- Zones libres : en paysage, garder le **tiers gauche** dégagé entre 3 s et 5 s (titre) ; le **haut du cadre** dégagé entre 5 s et 10 s.

## Découpage (temps = fraction du scroll × 10 s)
| Temps | Scène | Texte HTML affiché |
|---|---|---|
| 0–1,2 s | Fond vert émeraude presque noir, lumière douce qui s'ouvre, particules dorées très discrètes | « Faites défiler » |
| 0,4–3 s | Le logo Green World apparaît dans un halo ivoire | — |
| 2–5 s | Un faisceau révèle un flacon sur un socle en pierre claire, décor botanique ; la caméra se rapproche lentement | « Le bien-être devient un art. » (3,0–4,7 s) |
| 4,6–7,2 s | Travelling latéral entre produits, fleurs, feuilles, textures (miel, coton, myrtilles, olives) ; pétales roses | « Découvrez un univers… » (5,2–6,9 s) |
| 7–10 s | Composition finale des produits, recul de caméra, haut du cadre assombri | GREEN WORLD · We Care, We Share · boutons (8–10 s) |

Les points de synchronisation se règlent dans `components/hero/hero-config.ts` (`heroSequence`).

## Règles produits
Emballages réels uniquement, étiquettes lisibles, aucune retouche des logos ou des textes d'emballage.

## Encodage (indispensable pour un scrub fluide)
```
ffmpeg -i master.mov -vf scale=1600:-2 -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -g 4 -keyint_min 4 -bf 0 -movflags +faststart -an hero-desktop.mp4
ffmpeg -i master.mov -vf scale=960:-2  -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -g 4 -keyint_min 4 -bf 0 -movflags +faststart -an hero-desktop-light.mp4
ffmpeg -i master-portrait.mov -vf scale=720:-2 -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -g 4 -keyint_min 4 -bf 0 -movflags +faststart -an hero-mobile.mp4
```
Remplacer aussi les affiches `hero-*-poster-logo.webp` (image à ~1,2 s) et `hero-*-poster-final.webp` (image à ~8,6 s). Cibles de poids : desktop ≤ 6 Mo, light ≤ 1,5 Mo, mobile ≤ 3,5 Mo.
