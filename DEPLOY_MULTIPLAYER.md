# Déployer StreetQuest V15 en multijoueur

## 1. GitHub
Garde les fichiers du jeu à la racine du dépôt pour GitHub Pages.
Le dossier `server/` peut rester dans le même dépôt : GitHub Pages ne l’exécutera pas.

## 2. Render
1. Crée un compte Render.
2. `New` > `Web Service`.
3. Connecte ton dépôt GitHub StreetQuest.
4. Root Directory : `server`
5. Build Command : `npm install`
6. Start Command : `npm start`
7. Health Check Path : `/health`
8. Déploie.

Render te donnera une adresse du type :
`https://streetquest-server-xxxx.onrender.com`

## 3. Dans le jeu
StreetQuest > Réglages > Multijoueur Alpha :
- choisis ton pseudo
- colle l’URL Render
- appuie sur Connecter

L’URL est mémorisée sur l’appareil.

## Important
Cette V15 synchronise la présence, les positions, le chat et les émotes. La progression économique reste encore enregistrée localement sur chaque appareil. Pour une vraie économie multijoueur inviolable et persistante, la prochaine étape est une base serveur (PostgreSQL/Supabase) avec argent, propriétés, inventaires et PNJ validés côté serveur.
