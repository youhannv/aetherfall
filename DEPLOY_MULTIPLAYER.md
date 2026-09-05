# Déploiement du multijoueur V21

Le serveur est dans `server/` et `render.yaml` est prêt pour Render.

- Runtime : Node.js 20+
- Commande : `npm start`
- Health check : `/health`
- Debug : `/debug` doit afficher `21.1.0`

Le client lit l’URL par défaut depuis `multiplayer-config.js`. Tu peux donc modifier `window.STREETQUEST_DEFAULT_SERVER` sans toucher à `game.js`.
