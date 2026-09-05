# Déployer StreetQuest V22 en multijoueur

## GitHub Pages
Le client reste à la racine du dépôt. Remplace tous les fichiers du jeu par ceux de V22.

## Render
Le serveur Socket.IO est dans `server/`.

- Root Directory : `server`
- Build Command : `npm install`
- Start Command : `npm start`
- Health Check Path : `/health`

Le serveur V22 sépare naturellement les joueurs par `cityId` : Paris, Valmont, Montfleur, Saint-Roch et Belle-Rive sont cinq salles distinctes. Le changement de salle se fait quand un joueur arrive dans une nouvelle ville par le train.

La progression économique reste locale au navigateur ; la présence, les positions, le chat, la voix et l'avatar passent par le serveur multijoueur.
