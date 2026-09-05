# StreetQuest 3D V21.2 — Paris Dense Cinematic

Cette version remplace la direction artistique V20.1 par une génération parisienne beaucoup plus dense et cohérente : fronts de rue haussmanniens, commerces en rez-de-chaussée, façades modulaires, éclairage nocturne réel, skyline, voitures et végétation retravaillées.

## Principales modifications

- FOV caméra 63° pour un cadrage moins déformé sur iPhone.
- ACES + ombres PCF douces + soleil recentré autour du joueur.
- Pool de 8 PointLights pour les lampadaires les plus proches afin de garder de bonnes performances mobiles.
- Nouveaux îlots `haussmann` avec passage de cour étroit au lieu de la grande croix vide de V20.
- Bâtiments de 5 à 7 niveaux, fenêtres instanciées, balcons, corniches, mansardes/dormants et cheminées.
- Commerces intégrés au rez-de-chaussée des immeubles avec vitrines, enseignes et merchandising visible.
- Plus de PNJ en journée dans Centre / quartiers anciens, toujours avec réduction automatique le soir et la nuit.
- Voitures et arbres low-poly retravaillés.
- Skyline lointaine légère pour éviter l’effet de ville qui s’arrête au brouillard.
- Correctifs : validation des quêtes, paiement atomique des loyers, URL multijoueur configurable, bouton de mise à jour, frustum culling des PNJ.

## Déploiement

Décompresse ce dossier à la racine du dépôt GitHub Pages, commit/push, puis recharge la PWA. V21 utilise le cache `streetquest3d-v21.2-dense1` et migre automatiquement la sauvegarde V20.1 vers `sq3d-v21`.

Voir `V21_CHECKLIST.md` avant publication.


## Correctif V21.2
Cette version corrige spécifiquement les quartiers presque vides de V21.1. Les zones urbaines parisiennes utilisent un plan dense avec une garantie de densité et les façades détaillées sont actives aussi dans le Faubourg des Ateliers, les Docks et les quartiers populaires.
