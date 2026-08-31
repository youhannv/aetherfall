# Aetherfall — version iPhone sans Mac

Cette version est une PWA (Progressive Web App) en HTML/CSS/JavaScript pur.
Elle ne dépend d'aucune bibliothèque externe.

## Contenu
- 4 zones explorables
- joystick tactile
- attaque, esquive, interaction, potions
- ennemis et projectiles
- boss final
- quêtes et dialogues
- coffres et butin
- XP, niveaux, PV, attaque
- inventaire et carte
- sauvegarde automatique dans le navigateur
- Service Worker pour fonctionnement hors ligne après installation

## Fichiers
- index.html
- style.css
- game.js
- manifest.json
- sw.js
- icon-192.png / icon-512.png

## Installation sur iPhone seulement
Une PWA doit d'abord être servie par un site HTTPS pour que l'installation et le cache hors ligne fonctionnent correctement.
Le moyen gratuit le plus simple est GitHub Pages.

1. Depuis Safari, créer un compte GitHub si nécessaire.
2. Créer un nouveau dépôt public nommé `aetherfall`.
3. Ajouter à la racine du dépôt tous les fichiers de ce dossier.
4. Dans le dépôt : Settings > Pages.
5. Dans Build and deployment, choisir `Deploy from a branch`.
6. Branch : `main`, dossier : `/ (root)`, puis Save.
7. Ouvrir l'adresse GitHub Pages fournie par GitHub.
8. Dans Safari : Partager > Sur l'écran d'accueil > activer `Ouvrir comme app web` > Ajouter.
9. Lancer Aetherfall depuis son icône. Après le premier chargement complet, les fichiers sont mis en cache pour un usage hors ligne.

## Sauvegarde
La progression est enregistrée dans `localStorage` sur l'iPhone toutes les 8 secondes, ainsi qu'à la fermeture/masquage de l'app.
