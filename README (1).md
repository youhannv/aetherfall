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


# V11.1 — Social / Pickpocket / Pathing Fix

- prix survie réduits :
  - eau 3
  - soda 4
  - sandwich 6
  - kit hygiène 8
  - repas 11
  - medkit 28
- ~70 % des passants peuvent transporter au moins un objet, certains 2 ou 3
- si un passant possède un objet, le premier butin du pickpocket le privilégie
- objets toujours finis : une fois volés, ils disparaissent réellement des poches
- déplacement PNJ avec plusieurs directions d’évitement autour des obstacles
- waypoint bloqué ignoré automatiquement après plusieurs tentatives
- trajets de ruelle déplacés vers les corridors réellement ouverts
- un PNJ qui te suit suit maintenant la trace réelle de ton trajet : beaucoup moins de blocage derrière les immeubles
- toucher directement un PNJ ouvre désormais son menu d’actions
- option SUIS-MOI mise en évidence
- marqueur « TE SUIT » au-dessus du PNJ
- nom du suiveur affiché dans le HUD
- dans une ruelle, action BRAQUER disponible quand le suiveur est proche
- braquage peut donner son argent fini et jusqu’à deux objets


# V11.2 — Interior Recovery
- correction du bug écran gris / INTÉRIEUR après recharge Safari
- les sauvegardes V11/V11.1 bloquées en intérieur sont réparées automatiquement
- la position extérieure (`returnPos`) est utilisée pour reprendre la partie
- un intérieur n'est plus jamais persisté comme état de redémarrage
- watchdog de cohérence : si `state.interior` existe sans `interiorGroup`, retour automatique dans la rue
- bouton de secours `SORTIR` visible pendant les intérieurs
- sauvegarde `sq3d-v11` conservée : aucune progression V11/V11.1 perdue


# V11.3 — City Layout / Follower Fix

## Boutiques
- maximum 1 boutique par pâté de maisons
- épicerie : chunk de départ
- agence immobilière : quartier voisin à l’est
- seconde main : quartier voisin à l’ouest
- Maison & Co : quartier au nord
- atelier : quartier au sud
- boutique rare : autre quartier
- autres boutiques réparties procéduralement dans environ 19 % des chunks
- une parcelle boutique remplace un bâtiment : plus de magasin superposé devant l’agence
- anciens marqueurs de boutiques de la V11/V11.2 sont migrés automatiquement

## Ville
- parcelles générées aléatoirement dans quatre zones de bloc
- 1 à 3 bâtiments par sous-zone au lieu d’une grille identique
- tailles, retraits et positions variables
- le terrain personnel réserve son propre quadrant
- ruelles centrales conservées comme corridors libres

## PNJ
- beaucoup plus de points de trajectoire
- déplacement centré sur les couloirs piétons libres
- déblocage automatique si un waypoint est inaccessible
- mémorisation d’une dernière position sûre
- les suiveurs parcourent les traces du joueur dans l’ordre
- récupération anti-blocage si un suiveur reste coincé

## Braquage
- nouveau panneau permanent quand un PNJ te suit
- affiche clairement « TROUVER UNE RUELLE »
- dans une ruelle et lorsque le PNJ est proche : bouton rouge « BRAQUER »
- bouton pour demander au PNJ d’arrêter de suivre
- détection des ruelles basée sur leurs vraies dimensions et branches

## Sauvegarde
La sauvegarde reste `sq3d-v11`.
Seul le plan de boutiques est migré ; argent, logement, inventaire et progression sont conservés.


# V12 — City Life / Immobilier

## Quartiers socio-économiques
- Les Docks : pauvre, très dense, immobilier bon marché, plus de délinquance, peu de police.
- Quartier Populaire : modeste, loyers accessibles, beaucoup de petits immeubles/maisons.
- Centre : prix moyens/élevés, commerces et densité.
- Quartier des Jardins : aisé, plus de maisons, moins de délinquance, davantage de police.
- Les Hauteurs : très riche, villas, habitants avec plus d’argent/objets, forte présence policière.
- Faubourg des Ateliers : modeste/industriel.

Les quartiers sont générés par zones de plusieurs chunks pour éviter l’effet damier.

## Immobilier
Chaque porte immobilière correspond à un vrai bien physique déterministe :
- studio
- T2
- T3
- maison
- villa

Les surfaces, le nombre de pièces, les loyers et prix d’achat varient selon :
- le type de bien
- sa surface
- son quartier
- le niveau de richesse du secteur

## Location
- premier loyer payé à l’entrée
- ensuite loyer prélevé chaque mois
- priorité à l’épargne du logement, puis aux crédits portés
- deux loyers impayés entraînent une expulsion

## Achat
- paiement unique
- le bien reste dans le patrimoine
- possibilité d’y vivre
- possibilité de le mettre en location
- loyer demandé ajustable par pas de 10 crédits
- un prix trop élevé réduit la probabilité de trouver/garder un locataire
- loyers encaissés chaque mois dans l’épargne

## Temps
- calendrier 30 jours par mois
- dormir fait avancer d’un jour
- passage naturel de minuit fait aussi avancer le calendrier
- bilan mensuel affiché dans Base

## Intérieurs physiques
La taille 3D dépend réellement du logement :
- studio petit
- T2 moyen
- T3 plus grand
- maison
- grande villa

## Carte
- boutons + / -
- zoom à la molette sur PC
- pincement sur mobile
- couleurs de quartier
- logements découverts
- loyers visibles sur la grande carte
- résidence actuelle entourée en jaune

## Population / sécurité
Les habitants des quartiers riches ont statistiquement :
- plus d’argent
- davantage d’objets
- plus de police autour d’eux

Les quartiers pauvres ont :
- moins d’argent moyen
- davantage de délinquance
- moins de policiers

## Migration
V12 utilise `sq3d-v12`.
Au premier lancement, une sauvegarde V11 existante est importée.
Les anciens achats logement sont transformés en avoir immobilier afin de ne pas perdre la valeur déjà dépensée.


# V13 — Neo City / Refonte visuelle

## Refonte graphique
- ambiance plus moderne et futuriste
- interface glassmorphism plus sombre et plus lisible
- mini-carte et grande carte retouchées
- bâtiments avec davantage de variété visuelle
- façades plus technologiques (verre, panneaux, accents lumineux)
- commerces retravaillés dans un style néon / urbain moderne

## Correctifs visuels demandés
- feux tricolores replacés pour éviter les chevauchements incohérents
- panneaux immobiliers réduits et mieux positionnés
- suppression de la surcharge de texte sur la grande carte
- carte recentrée sur les informations utiles : quartiers, boutiques, police, biens, résidence

## Carte
- zoom par boutons + / - toujours disponible
- plus de noms de magasins et de biens partout
- lecture plus propre sur mobile


# V14 — Neo City Deluxe

## Nouveautés visuelles
- refonte plus moderne et futuriste de l'ambiance globale
- voitures retravaillées avec éclairages avant / arrière et détails plus premium
- PNJ plus détaillés (visages mieux visibles, bras plus complets, épaules, chaussures, accessoires)
- intérieurs de logements enrichis
- atmosphère améliorée : étoiles, lueurs urbaines, ciel plus vivant

## Monde
- davantage de bâtiments par chunk
- quartiers plus contrastés économiquement et visuellement
- plus de circulation et plus de passants
- davantage de commerces répartis en ville
- grandes cartes plus lisibles et moins chargées


## V14.1 correctif
- correction du bug principal qui empêchait l'affichage du monde à partir des versions 13/14
- restauration des helpers de décor (lampadaires, arbres, buissons, bancs) utilisés pendant la génération des chunks
- ajout d'un garde-fou pour éviter qu'une erreur de génération vide tout le monde


# V15 — Life Online

## Multijoueur Alpha
Le frontend reste compatible GitHub Pages. Le dossier `server/` contient un serveur Node.js + Socket.IO.
Fonctions :
- joueurs visibles en temps réel
- interpolation des déplacements
- pseudo au-dessus du joueur
- compteur de joueurs
- chat de proximité
- émotes
- salles séparées par ville
- mode solo automatique si le serveur est indisponible

## École / emplois / économie
- Campus Municipal physique
- Maison de l’Emploi physique
- Hôpital Horizon physique
- formations payantes avec journées de présence
- métiers privés et fonction publique
- salaire mensuel
- impôt progressif
- trésor public
- trésorerie des entreprises privées
- missions de travail qui rapportent de l’argent à l’employeur
- loyers refusés sans emploi / salaire suffisant
- PNJ avec profession et employeur

## Immobilier V15
- les biens ne sont plus tous affichés sur la carte
- petits écriteaux physiques À LOUER / À VENDRE
- les transactions se font via Agence Habitat
- correction du placement des bâtiments pour éviter les trottoirs et la ruelle centrale

## Intérieurs
- vraie porte de sortie 3D dans magasins, appartements et maisons
- seuil de sortie adapté automatiquement à la taille réelle de l’intérieur

- suppression de l'ancien terrain fixe de l'ancien système immobilier ; le logement passe maintenant par les vrais biens de la ville.
- missions professionnelles prioritaires devant la porte de l'employeur.


# V15.3 — Correctif multijoueur

Cause corrigée :
- V15.2 pouvait encore utiliser `sq-mp-url` enregistré dans Safari.
- Si une ancienne saisie incomplète comme `https://streetquest-...` était restée en mémoire,
  le jeu tentait de se connecter à cette mauvaise adresse au lieu du serveur officiel.

V15.3 :
- ignore complètement l'ancienne URL sauvegardée
- impose `https://streetquest-multiplayer.onrender.com`
- remplace automatiquement `sq-mp-url`
- affiche l'état exact de la connexion
- affiche la salle/ville et le nombre de joueurs de cette salle
- rappelle que Paris et Rome sont des salles distinctes
- reconnexion automatique permanente
- transport polling puis WebSocket
- `/debug` côté serveur permet de voir les sockets et les joueurs réellement inscrits


# V16 — Identity & City Grid

## Personnage multijoueur
- créateur de personnage au premier lancement
- couleur de peau
- coiffure
- couleur des cheveux
- corpulence
- couleur du haut
- pantalon
- chaussures
- accessoire
- l'apparence est envoyée au serveur Socket.IO
- lorsqu'un joueur change son skin, les autres clients reconstruisent immédiatement son avatar 3D

## Boutique NeoStyle
- nouvelle boutique physique
- casquette
- lunettes
- sac à dos
- vestes premium
- sneakers
- les achats cosmétiques débloquent et équipent réellement les styles

## Ville / chevauchements
- les bâtiments utilisent désormais leur vraie largeur/profondeur avant placement
- réservation stricte des trottoirs
- réservation stricte des ruelles
- vérification rectangle contre rectangle avec marge de sécurité
- les commerces sont placés avant les bâtiments ordinaires
- si aucune parcelle correcte n'existe, le bâtiment est ignoré au lieu d'être superposé
- les magasins ne peuvent plus être recouverts par un immeuble généré ensuite

## Coordonnées StreetQuest
Le HUD affiche des coordonnées partagées par tous les joueurs :
`SQ N0042 E0187`
Elles correspondent au monde virtuel, pas au GPS réel du téléphone.
Elles permettent de dire précisément à un autre joueur où se retrouver sans permission de géolocalisation.


# V16.1 — Correctif carte et repérage

- générateur urbain stable de V15.3 restauré
- rendu 3D démarré avant le chargement des quartiers
- une erreur locale de chunk ne peut plus arrêter toute la boucle d'affichage
- anti-chevauchement léger et conservateur ajouté sans remplacer le moteur de ville
- commerces posés en priorité pour que les immeubles respectent leur parcelle
- skins multijoueur V16 conservés
- NeoStyle conservé
- nouveau repérage cartésien :
  - origine O(0,0)
  - X = abscisse
  - Y = ordonnée
  - valeurs positives et négatives
  - Y positif vers le haut de la carte
- exemple : X -27 • Y +68
- les axes X=0 et Y=0 apparaissent sur la carte lorsque l'origine est visible


# V16.2 — Correctif écran noir

Cause réelle identifiée :
Lors de l'ajout du créateur de skins V16, quatre fonctions multijoueur ont été supprimées accidentellement :
- `removeRemoteAvatar`
- `updateRemotePlayers`
- `addChatLine`
- `setMpStatus`

La boucle `animate()` appelait toujours `updateRemotePlayers()` via `multiplayerTick()` AVANT
`renderer.render(scene,camera)`. Cela provoquait une `ReferenceError` à chaque frame et empêchait
Three.js d'afficher la moindre image 3D. Le HUD HTML et la mini-carte continuaient à fonctionner,
d'où l'écran noir observé.

V16.2 :
- restaure les quatre fonctions
- rend maintenant la scène 3D AVANT le traitement réseau
- encapsule la frame multijoueur dans un try/catch
- une panne multijoueur ne peut donc plus produire un écran noir
- ajoute un diagnostic rouge uniquement si WebGL lui-même ne démarre pas
- conserve les coordonnées cartésiennes X/Y autour de O(0,0)
- conserve les skins synchronisés
- conserve NeoStyle
- conserve l'anti-chevauchement V16.1


# V17 — Social Life

Interface entièrement repensée :
- HUD allégé : vie, armure, argent et besoins seulement
- suppression visuelle du niveau, des étoiles, du compteur de recherche, des quêtes, du radar/artefact et de la main
- police affichée uniquement lorsqu’un policier réel est chargé à moins de 55 m ; poursuite signalée uniquement si elle a lieu
- horloge HH:MM + jour/semaine + météo intégrés en haut
- mini-carte déplacée sans chevauchement avec l’horloge ; coordonnées cartésiennes X/Y sous la carte
- barre basse : Carte, Sac, Agenda, Social uniquement
- réglages, personnage, logement, travail, quartier et voyage déplacés dans le menu ☰
- Agenda avec travail, formation, petit boulot, échéance mensuelle et rendez-vous personnalisés
- bouton d’interaction contextuel unique

Personnages :
- chaque attribut du créateur a un effet visuel dans l’aperçu ET sur l’avatar 3D distant
- coiffures réellement différentes (courte, buzz, longue, bouclée)
- corpulence modifie torse, épaules, bras, jambes et accessoires
- vêtements, peau, cheveux, chaussures et accessoires synchronisés
- avatarVersion force la reconstruction distante après chaque modification

PNJ :
- le métier n’est plus affiché avant de l’avoir demandé
- le PNJ s’arrête et se tourne vers le joueur pendant une conversation
- il reprend son chemin à la fermeture ou si le joueur s’éloigne

Multijoueur :
- interaction contextuelle avec les autres joueurs
- saluer, message privé, partager X/Y, inviter au groupe, couper/réactiver leur voix
- chat vocal de proximité WebRTC : plein volume à 5 m, décroissance jusqu’à silence à 25 m
- activation du micro uniquement sur action volontaire ; autorisation iOS/Safari respectée
- signalisation WebRTC transmise par Socket.IO
- STUN intégré ; certains réseaux NAT stricts peuvent nécessiter un TURN ultérieurement

Le serveur V17 doit être redéployé sur Render pour les nouvelles fonctions vocales/sociales.

- Les anciens artefacts/scanner ne sont plus générés ni affichés en V17.
