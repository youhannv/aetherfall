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


# V5 — Shadow City

## Nouvelle mécanique de vol à la tire
- Touche directement le passant que tu veux choisir.
- La cible reste marquée à l’écran et sur la mini-carte.
- Suis-la dans la rue.
- Place-toi derrière elle, à environ 0,6–1,6 m.
- Lance la fouille avec le bouton d’interaction.
- Tant que tu restes correctement placé, des crédits sont transférés progressivement.
- Certains passants n’ont aucun argent.
- Si tu passes sur le côté / devant, colles trop près ou traînes trop longtemps, la suspicion augmente.
- Si la cible remarque le vol, ton niveau de recherche augmente.
- Des policiers patrouillent réellement.
- Un policier doit avoir une ligne de vue dégagée pour te repérer.
- Les bâtiments bloquent leur vue.
- Les buissons permettent aussi de se cacher.
- Après plusieurs secondes hors de vue, le niveau de recherche baisse.
- Si un policier t’attrape, une partie de tes crédits est confisquée.

## Circulation
- Les voitures infligent désormais des dégâts lorsqu’elles percutent le joueur.
- Une collision retire des PV, une partie pouvant être absorbée par l’armure.
- Le joueur est repoussé dans le sens du choc.
- Un K.O. renvoie au refuge.

## Graphismes
- rendu ACES / espace couleur sRGB
- textures de façades retravaillées
- façades modernes, briques et pierre
- corniches et éléments de toit
- balcons dans certains quartiers
- bordures de trottoir
- passages piétons améliorés
- lampadaires
- bancs
- buissons utilisables comme cachettes
- végétation plus dense
- véhicules plus détaillés avec roues et phares
- voitures stationnées
- nuages
- pluie légère lors de la météo pluvieuse
- magasins orientés correctement vers le trottoir
- portes d’immeubles placées côté rue
- streaming réduit à 3×3 quartiers pour laisser plus de budget graphique sur iPhone


# V5.1 — correctifs mobile
- Correction du faux “zoom” sur iPhone :
  - joystick droit réinitialisé plus agressivement,
  - pitch caméra moins extrême,
  - retour progressif vers l’horizon,
  - meilleure prise en charge de `visualViewport`,
  - blocage renforcé des gestes Safari.
- Vol à la tire simplifié pour téléphone :
  - tu touches un passant,
  - tu le suis,
  - si tu es bien derrière et assez près, la fouille démarre automatiquement,
  - plus besoin de marcher et d’appuyer sur un bouton en même temps.
- Ajout de vrais visages simples :
  - yeux,
  - bouche,
  - meilleure lisibilité des PNJ.
- Nouvelle sauvegarde : `sq3d-v5-1`
- Nouveau cache PWA : `streetquest3d-v5-1`

## Conseil iPhone
Le jeu marche mieux si tu l’ouvres depuis l’écran d’accueil en mode PWA. Dans Safari, la barre d’adresse qui monte/descend peut encore donner une impression visuelle de zoom même si le moteur est stable.


# V6 — Base Builder & pathing fix
- achat d’un terrain personnel
- vraie base accessible depuis la ville
- boutique Maison & Co
- achat de meubles, coffres, cloisons et décoration
- pose des meubles dans la base
- coffre sécurisé pour mettre les crédits à l’abri
- stockage de medkits à la maison
- correction de l’orientation des visages des PNJ
- réduction des immeubles qui mordent sur les trottoirs
- pathing PNJ/policiers amélioré contre les murs
- ennemis encore un peu moins nombreux
- panneau et zone CHEZ TOI visibles dans le chunk de départ


# V7 — Living City
## Correctifs structurants
- verrouillage anti-zoom iPhone renforcé dès le `<head>`
- blocage pinch, double tap, gesture events et zoom clavier
- correction mathématique du sens des visages des PNJ
- correction mathématique du sens des phares/avant des voitures
- trottoirs des deux côtés de chaque axe routier
- bordures de trottoir
- passages piétons zebra très visibles
- lignes STOP
- feux de circulation
- voitures qui s'arrêtent aux feux rouges

## Pathfinding
- les civils reçoivent désormais un axe de trottoir à leur création
- ils ne choisissent plus une direction arbitraire vers les immeubles
- limites de trajet par segment de trottoir
- collisions PNJ/police/ennemis contre bâtiments

## Base
- maison niveau 1, 2 et 3
- 8 / 12 / 16 emplacements
- apparence extérieure qui évolue avec le niveau
- coffre à argent protégé
- stockage de medkits
- repos à domicile : PV restaurés et recherche réduite
- artefacts exposés automatiquement comme trophées
- Maison & Co pour le mobilier

## Gameplay
- réputation gagnée avec les missions PNJ
- réputation = remises en boutique jusqu'à 15 %
- cônes de vision policiers sur la mini-carte quand tu es recherché ou en train de voler


# V8
- feux mieux placés sur les coins de trottoirs
- PNJ avec bras visibles et animation de bras
- PNJ qui peuvent tourner aux coins des trottoirs au lieu de marcher toujours en ligne droite
- voitures sur voies à sens de circulation, arrêts aux feux et virages possibles
- les passants ont une somme limitée ou rien du tout dans les poches
- si une victime remarque le vol, elle crie, peut te frapper et alerte la police proche
- grande mini-carte ouvrable
- support PC : flèches / WASD + souris
- les artefacts ramassés se vendent 500 crédits pièce en boutique


# V9 — Dense City

## Feux
- 4 feux par intersection.
- Un feu sur chaque coin.
- Deux pour l’axe vertical et deux pour l’axe horizontal.
- Positionnement hors du passage piéton.

## PNJ
- bras exposés de la même couleur que la peau du visage
- petites manches assorties au vêtement
- visage rendu sur un seul plan texturé pour supprimer le z-fighting / scintillement
- frustum culling désactivé sur les PNJ pour éviter les disparitions visuelles brutales
- trajets à waypoints : les PNJ tournent réellement aux coins
- certains utilisent aussi les ruelles

## Ville
- beaucoup plus de bâtiments par chunk
- mélange d’immeubles et de maisons
- maisons avec toits
- ruelles en croix au milieu des pâtés de maisons
- petites branches de service
- objets et artefacts peuvent apparaître dans les ruelles

## Voitures
- voies séparées selon le sens de circulation
- virages aux intersections
- respect des feux
- correction du choc voiture après passage au système mode v/h
- les voitures changent de parent de chunk lorsqu’elles traversent la ville

## PC
- flèches directionnelles uniquement pour se déplacer
- aucun pointer-lock
- la vue reste contrôlée par le joystick REGARDER avec la souris
- E interagir, M grande carte, I inventaire

## Cache
streetquest3d-v9

## Sauvegarde
sq3d-v9


# V10 — Urban Life

## Mise à jour
- nouveau bouton ↻ en haut du jeu
- bouton de mise à jour dans Réglages
- Service Worker en stratégie network-first pour HTML/JS/CSS/JSON
- vérification automatique de mise à jour toutes les 60 secondes
- activation immédiate d’un nouveau Service Worker
- anciens caches StreetQuest supprimés automatiquement

## Circulation
- voitures plus nombreuses
- densité différente selon les quartiers
- voitures, compactes, taxis et utilitaires
- vitesses différentes selon les véhicules
- arrêt avant le passage piéton / feu rouge plutôt qu’au milieu de l’intersection
- itinéraires et virages moins uniformes

## PNJ
- collision physique avec le joueur
- argent fini : chaque PNJ a une somme déterminée ou zéro
- certains PNJ transportent 0, 1 ou 2 objets
- téléphones, montres, écouteurs, bagues, appareils photo, lunettes, parfum, portefeuille
- objets volés prennent de la place dans le sac
- revente au Comptoir Seconde Main

## Social
- option « Suis-moi » dans les dialogues
- chaque PNJ possède confiance, doute et courage
- il peut accepter ou refuser de suivre
- un PNJ qui te suit peut être emmené dans une ruelle
- action BRAQUER disponible en zone isolée
- la victime peut coopérer, résister, crier ou appeler une police proche

## Base
- maison et clôtures désormais solides
- véritable ouverture de portail
- meubles et rayonnages avec collisions à l’intérieur
- objets de valeur déposables au coffre
- objets déposés chez soi protégés d’une confiscation policière

## Carte
- mini-carte dézoomée
- grande carte beaucoup plus large
- boutiques découvertes mémorisées
- noms des boutiques affichés sur la grande carte


# V11 — From Nothing

## Corrections visuelles
- enseignes de magasins : vrais panneaux 3D fixés aux façades, plus de sprites qui flottent face à la caméra
- feux : quatre poteaux distincts placés sur les quatre coins d’intersection
- tête de feu simplifiée pour éviter les bras/panneaux mal orientés
- visage PNJ : matériau double face + rotation corrigée + nez 3D de secours

## Survie
- faim
- soif
- propreté
- faim et soif diminuent progressivement
- à zéro, perte progressive de PV
- faim/soif très basses réduisent la vitesse
- propreté influence la confiance des PNJ

## Épicerie
- bouteilles d’eau
- sandwichs
- repas complets
- sodas
- kits d’hygiène
- medkits

## Nouvelle progression
La partie démarre avec 0 crédit et aucun logement.
1. Sans logement
2. Louer un studio — 180 crédits
3. Acheter un appartement — 850 crédits
4. Acheter un terrain — 1800 crédits
5. Construire/améliorer la maison

- dormir dehors reste possible au départ avec des pénalités
- studio/appartement : dormir, se doucher, épargner
- maison : meubles et améliorations en plus

## Agence Habitat
- nouvelle boutique physique garantie dans le quartier de départ
- progression logement accessible dans l’agence et dans l’onglet Base

## PNJ
- l’option « Suis-moi » est maintenant toujours visible dans le menu de dialogue
- les missions sont un choix séparé
