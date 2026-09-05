# StreetQuest V22.2 — Bus code de la route & vue passager

Cette version part de V22.1 et corrige spécifiquement la circulation et l'expérience à bord.

## Nouveautés V22.2

- bus calés sur les mêmes voies directionnelles que les voitures ;
- freinage renforcé derrière voitures et bus ;
- respect des feux avec distance de freinage dynamique ;
- virages avec braquage et déplacement dans le cap du véhicule, sans glissement latéral ;
- nom réel de chaque arrêt affiché sur le panneau physique ;
- trois vues à bord : **Fenêtre**, **Pare-brise**, **Extérieure** ;
- bouton `🎥` pendant le trajet pour changer de caméra ;
- caméra passager corrigée pour suivre le cap réel du bus.

## Base V22.1 conservée

Cette version part de V22 et ajoute deux changements structurels.

## Aller d’une ville à l’autre à pied

Les cinq villes restent des mondes urbains distincts pour garder de bonnes performances sur iPhone, mais elles sont désormais reliées par de longues routes départementales continues à travers la campagne. Il n’y a plus de mur invisible sur les axes interurbains.

Routes :

- **D7 Route des Cèdres** : Paris ↔ Valmont
- **D12 Route de Montfleur** : Paris ↔ Montfleur
- **D18 Route des Étangs** : Valmont ↔ Montfleur
- **D4 Route des Forges** : Montfleur ↔ Saint-Roch
- **D21 Route du Littoral** : Saint-Roch ↔ Belle-Rive

Chaque moitié de trajet fait environ 24 chunks ruraux. À pied, un centre-ville à l’autre demande volontairement plusieurs minutes ; le train reste le transport rapide et les futures voitures pourront utiliser ces routes. Les chunks éloignés ne sont pas tous chargés : seuls ceux autour du joueur existent en 3D, ce qui conserve les performances.

## Nouveau système de bus

- Les bus restent **12 secondes aux arrêts** et **15 secondes aux terminus**.
- Il n’est plus nécessaire de préparer le trajet avant l’arrivée du bus.
- Quand le véhicule est à quai, approche-toi et touche **MONTER**.
- Le menu du véhicule affiche directement les arrêts desservis dans le bon sens.
- Le calculateur avec correspondances reste disponible mais devient optionnel.
- Deux poteaux sont générés pour les arrêts bidirectionnels afin de mieux servir l’aller et le retour.
- Les bus utilisent les mêmes voies directionnelles que les voitures.
- Ils freinent progressivement, respectent les feux rouges, attendent si l’intersection est occupée, gardent leurs distances avec voitures/bus et ne franchissent plus la ligne d’arrêt au rouge.
- Une collision avec un bus en mouvement a désormais une conséquence physique sur le joueur.

## Carte régionale

La carte régionale affiche les axes ferroviaires et les routes interurbaines praticables à pied.

## Sauvegarde

La sauvegarde V22 est conservée. Le stockage principal reste `sq3d-v22` afin de ne pas perdre la progression lors de la mise à jour.
