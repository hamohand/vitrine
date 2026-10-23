# Enclume numérique — site vitrine

Site statique (HTML / CSS / JavaScript, sans dépendance ni étape de build) présentant les activités
d'Enclume numérique et ses réalisations : **dz-eid**, **FRIDA**, **TCI** et **EasyTess**.

## Structure

```
vitrine/
├── public/                 # contenu du site (seul dossier servi par Nginx)
│   ├── index.html          # page unique (hero, activités, réalisations, engagements, méthode, contact)
│   ├── ar/index.html       # version arabe (droite à gauche), même CSS / JS
│   ├── css/style.css       # thème « forge » responsive
│   ├── js/main.js          # menu mobile, animations, étincelles, formulaire
│   └── assets/logo.svg     # logo + favicon
├── docker-compose.yml      # Nginx branché sur le Traefik existant
└── nginx.conf              # compression, cache, en-têtes de sécurité
```

## Aperçu local

```powershell
npx serve public          # ou : python -m http.server 8080 -d public
```

## À personnaliser avant mise en ligne

- **Coordonnées** : renseignées (courriel `CONTACT_EMAIL` dans `public/js/main.js`, téléphone et WhatsApp dans `public/index.html`, section `#contact`).
- **Statuts des produits** (badges) au fil de leur avancement.
- **Mentions légales** (raison sociale, RC/NIF, hébergeur) à ajouter dans le pied de page.

## Déploiement

Adresse cible : **https://accueil.enclume-numerique.com/** (à côté de `hscode.` pour TCI et `frida.` pour la démo FRIDA).

1. DNS : ajouter un enregistrement `A` (ou `CNAME`) `accueil` pointant vers le serveur.
2. Sur le VPS, première installation :
   ```bash
   git clone https://github.com/hamohand/vitrine.git ~/vitrine
   cd ~/vitrine && docker compose up -d
   ```
   Le Traefik existant détecte le site et obtient le certificat HTTPS.
3. Mises à jour : pousser les modifications sur GitHub, puis sur le VPS :
   ```bash
   cd ~/vitrine && git pull
   ```
   Pas de redémarrage nécessaire (fichiers montés en lecture seule dans Nginx).
   Seule une modification de `nginx.conf` ou `docker-compose.yml` demande `docker compose up -d --force-recreate`.
