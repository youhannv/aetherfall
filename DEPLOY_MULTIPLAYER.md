# Déployer StreetQuest V22.4 en multijoueur

Le client reste à la racine du dépôt GitHub Pages. Remplacer tous les fichiers du jeu par ceux de V22.4.

Le serveur Socket.IO reste dans `server/`. Sa version est maintenant `22.4.0` et l’endpoint `/debug` annonce `22.4`.

Après le déploiement du serveur, conserver l’URL publique dans `multiplayer-config.js` si elle est différente de la valeur actuelle.
