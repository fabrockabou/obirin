# Déploiement sur Hostinger

Le site est une application Next.js qui **enregistre ses données dans des fichiers** (produits, réglages,
compte admin, demandes, images envoyées). Il lui faut donc un serveur Node avec un **disque persistant** :

- **VPS Hostinger (recommandé)** : Ubuntu, contrôle total, les données restent sur le disque.
- Hébergement « Node.js » mutualisé de Hostinger : possible, mais mettre impérativement le dossier de
  données **hors du dossier de l'application** (voir `OBIRIN_STORE_DIR`), sinon un redéploiement peut l'effacer.

> `data/store` n'est pas dans Git (comptes et données privés). Un déploiement par Git ne transporte pas
> vos produits, vos réglages ni votre compte admin : voir l'étape « Données ».

## Votre cas : hébergement Node.js Hostinger (hPanel)

1. **hPanel → Sites web → Ajouter un site → Applications Node.js.** Importez le dépôt GitHub (ou envoyez
   le projet en `.zip` sans `node_modules`, `.next` ni `data/store`).
2. Réglages de l'application :
   - Framework : **Next.js**, version de Node : **22** (ou 20).
   - Commande d'installation : `npm ci`
   - Commande de build : `npm run build`
   - Commande de démarrage : `npm start` (le port est lu automatiquement dans la variable `PORT` fournie
     par Hostinger ; 3000 sinon). Le projet est prêt : `sharp`, Tailwind et TypeScript sont dans les
     dépendances normales, donc l’installation « production » de Hostinger suffit au build.
3. **Variables d'environnement** (onglet de l'application) :
   - `NEXT_PUBLIC_SITE_URL` = `https://votre-domaine.com` (à définir **avant** le build)
   - `SESSION_SECRET` = 32 caractères aléatoires minimum
   - `OBIRIN_STORE_DIR` = un dossier **en dehors du dossier de l'application**, par exemple
     `/home/<votre-utilisateur>/obirin-data` (chemin visible dans le gestionnaire de fichiers).
     Sans cela, un redéploiement peut effacer produits, images envoyées et compte admin.
4. **Données** : avec le gestionnaire de fichiers (ou FTP), copiez le contenu de `data/store/` de votre PC
   dans le dossier `OBIRIN_STORE_DIR`. Sinon, créez le compte admin avec le terminal SSH s'il est
   disponible sur votre offre : `OBIRIN_STORE_DIR=<dossier> npm run admin:create`.
5. Rattachez le **domaine** à l'application ; le HTTPS (SSL) est géré par Hostinger.
6. Mises à jour : poussez sur GitHub puis « Redéployer » dans hPanel. Le dossier de données n'est pas touché.

Limites à vérifier sur votre offre : mémoire pendant le build (si le build échoue faute de mémoire,
construisez en local avec `npm run build` et envoyez aussi `.next`), taille maximale des envois
(images de l'admin jusqu'à 40 Mo), et sauvegarde du dossier de données.

La suite de ce document décrit l'installation sur un **VPS** (alternative, plus de contrôle).

## 1. Préparer le VPS (Ubuntu)

```bash
apt update && apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs
npm install -g pm2
```

## 2. Installer le site

```bash
cd /var/www
git clone <URL-DU-DEPOT> obirin && cd obirin
npm ci
```

Créer `/var/www/obirin/.env.production` (jamais commité) :

```
NEXT_PUBLIC_SITE_URL=https://www.votre-domaine.com
OBIRIN_STORE_DIR=/var/www/obirin-data
SESSION_SECRET=<32 caractères aléatoires minimum>
```

(`WHATSAPP_*` et `CONTACT_WEBHOOK_URL` seulement si utilisés, voir `.env.example`.)

```bash
mkdir -p /var/www/obirin-data
npm run build
pm2 start "npm start" --name obirin && pm2 save && pm2 startup
```

## 3. Données

- **Reprendre les données actuelles** : copier le contenu de `data/store/` (sur votre PC) vers
  `/var/www/obirin-data/` (WinSCP, FileZilla ou `scp -r`).
- **Ou repartir de zéro** : créer le compte admin sur le serveur :
  `OBIRIN_STORE_DIR=/var/www/obirin-data npm run admin:create`

## 4. Domaine et HTTPS

Dans hPanel, pointer l'enregistrement DNS **A** du domaine vers l'IP du VPS. Puis :

```bash
cat > /etc/nginx/sites-available/obirin <<'EOF'
server {
  server_name votre-domaine.com www.votre-domaine.com;
  client_max_body_size 45m;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
EOF
ln -s /etc/nginx/sites-available/obirin /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx
apt install -y certbot python3-certbot-nginx && certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

`client_max_body_size 45m` est nécessaire pour l'envoi d'images depuis l'admin.

## 5. Mises à jour

```bash
cd /var/www/obirin && git pull && npm ci && npm run build && pm2 restart obirin
```

## 6. Sauvegarde

Sauvegarder régulièrement `/var/www/obirin-data` (activer les sauvegardes du VPS dans hPanel, ou un `cron`
qui copie le dossier). C'est là que vivent toutes les données modifiables du site.

## 7. Vérifications après mise en ligne

- `https://votre-domaine/robots.txt` et `/sitemap.xml` utilisent bien le vrai domaine.
- `/admin/connexion` fonctionne, puis `/admin/seo` : vérifier le titre, la description et la favicon.
- La case « masquer le site des moteurs de recherche » est décochée.
