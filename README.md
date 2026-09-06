# StreetQuest3D V22.9.2 — Secours physiques, SAMU, patrouilles & StreetPhone allégé

Cette version poursuit la simulation de société de V22.8 et conserve la sauvegarde `sq3d-v22`.

## Nouveautés V22.9.2

- Les véhicules de police, pompiers et SAMU sont de vrais objets 3D persistants dans la scène, avec trajectoire routière.
- Les véhicules d'urgence partent de leur commissariat/caserne/hôpital local. Les renforts interurbains entrent par la route depuis une ville voisine après leur temps de transit.
- En intervention, ils peuvent franchir un feu rouge uniquement si l'intersection est libre et à vitesse réduite.
- Ils peuvent dépasser un véhicule lent en utilisant temporairement la voie opposée uniquement si celle-ci est libre.
- Les véhicules ordinaires et bus détectent les véhicules de secours pour limiter les collisions.
- Des voitures de police patrouillent réellement sans gyrophares ; la patrouille la plus proche est réaffectée lors d'un appel 17 et active alors ses gyrophares.
- Les policiers sortent du véhicule et font fuir les individus hostiles.
- Les pompiers s'arrêtent sur la chaussée, descendent physiquement et rejoignent le patient à pied.
- Pour un état très grave, les pompiers demandent le SAMU. Le SAMU arrive avec un médecin, un infirmier et un ambulancier.
- Le SAMU stabilise le patient puis décide soit de le confier aux pompiers, soit d'assurer lui-même un transport médicalisé urgent.
- Les équipes disponibles sont limitées par ville. En cas de saturation, l'appel attend ou un renfort vient d'une autre ville.
- Un numéro privé de test est intégré pour déclencher une intervention physique des pompiers même sans maladie ; il n'est affiché ni dans StreetPhone ni dans la documentation du jeu.
- Le bandeau flottant `POLICE` a été retiré du HUD afin de ne plus masquer les coordonnées.
- La barre du bas ne contient plus Carte ni Agenda : ces deux applications restent accessibles dans StreetPhone.

## Capacités opérationnelles simulées

- Paris : 3 équipes pompiers, 2 équipes SAMU, 4 patrouilles de police.
- Belle-Rive : 2 équipes de pompiers, 1 équipe SAMU, 3 patrouilles.
- Saint-Roch : 2 équipes de pompiers, 1 équipe SAMU, 3 patrouilles.
- Valmont : 1 équipe de pompiers, 1 équipe SAMU, 2 patrouilles.
- Montfleur : 2 équipes de pompiers, 2 équipes SAMU, 3 patrouilles.

Une partie des moyens peut déjà être occupée par une intervention simulée. Les ressources se libèrent ensuite.

## Installation

Remplacer tout le contenu du dépôt GitHub par ce dossier. Le cache PWA est `streetquest3d-v22.9.2-rescue-scene1`.
