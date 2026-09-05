# Déployer StreetQuest V22.1 en multijoueur

## GitHub Pages
Le client reste à la racine du dépôt. Remplace tous les fichiers du jeu par ceux de V22.1.

## Render
Le serveur Socket.IO est dans `server/`.

- Root Directory : `server`
- Build Command : `npm install`
- Start Command : `npm start`
- Health Check Path : `/health`

Les joueurs sont toujours séparés par `cityId` pour limiter le trafic réseau. Lors d’un passage interurbain à pied, le client change automatiquement de salle au moment où il entre sur le territoire de la ville suivante, sans écran de voyage. Le train utilise le même changement de salle à l’arrivée.
