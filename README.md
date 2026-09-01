# StreetQuest 3D V4

V4 pensée comme un jeu d'aventure/exploration chill en portrait pour iPhone.

## Principales nouveautés
- routes et trottoirs mieux séparés
- bâtiments cantonnés aux lots constructibles, sans empiéter sur routes/trottoirs
- passages piétons
- circulation automobile
- végétation, arbres, petits parcs
- plusieurs styles de quartiers
- cycle jour/nuit
- météo dynamique simplifiée
- PNJ avec dialogues
- missions données par les PNJ
- adversaires beaucoup plus rares
- IA de poursuite locale
- boutiques physiques avec véritable intérieur 3D
- plusieurs types de boutiques et stocks différents
- appartements visitables
- coffres et poubelles fouillables
- argent caché et caches rares
- arme visible à l'écran
- animation d'attaque
- inventaire, niveaux, armure, soins
- système de recherche après vol à la tire
- conquête douce de quartiers
- série de quêtes et progression globale
- mini-carte
- ville procédurale chargée par quartiers

Aucune mécanique de paiement ou de minuterie punitive : la progression repose sur l'exploration, les quêtes et la découverte.

## Installation
Remplacer les fichiers du dépôt GitHub Pages par :
index.html
game.js
style.css
manifest.json
sw.js
icon-192.png
icon-512.png
README.md

Puis Commit changes et attendre le déploiement GitHub Pages.


## V4.1 — correctif critique
- Correction de l'écran noir : `nearest()` sait maintenant gérer les objets `{x,z}`, notamment les entrées d'appartements.
- Nouvelle sauvegarde `sq3d-v4-1` pour repartir sur un état propre.
- L'argent n'apparaît plus au sol ni dans les poubelles/coffres.
- Certains passants ont de l'argent, d'autres ont les poches vides.
- Nouveau mini-jeu de vol à la tire :
  - maintenir le bouton,
  - attendre la fenêtre verte,
  - relâcher au bon moment,
  - trop tôt = échec sans vol,
  - trop tard = repéré et niveau de recherche augmenté.
- À partir d'un certain niveau de recherche, un agent de sécurité peut arriver.
- Les coffres/poubelles donnent désormais du matériel, des soins ou de l'XP, pas d'argent.
- Les ennemis donnent surtout XP/matériel, pas d'argent.
- Intérieurs de boutique corrigés : arrivée face au magasin, comptoir interactif, sortie distincte.
