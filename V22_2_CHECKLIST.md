# StreetQuest V22.2 — Bus code de la route & vue passager

## Circulation bus
- Les bus utilisent les mêmes centres de voies directionnelles que les voitures.
- Distance de sécurité renforcée : arrêt complet derrière un véhicule trop proche, ralentissement progressif avant.
- Anticipation du feu portée jusqu'à la distance de freinage selon la vitesse.
- Le mécanisme anti-blocage ne peut plus forcer un bus à franchir un feu rouge ou une intersection occupée.
- Le bus braque avant d'avancer : suppression du déplacement latéral/glissement pendant les virages.
- Vitesse réduite automatiquement dans les angles serrés.
- Alignement initial des bus sur leur voie et leur cap dès le spawn.

## Arrêts
- Le nom complet de l'arrêt est maintenant affiché physiquement sur le panneau.
- Le numéro / nom des lignes reste affiché séparément.
- Les poteaux aller/retour conservent le même nom d'arrêt.

## Vue passager
- Vue par défaut : Fenêtre.
- Vue Pare-brise.
- Vue Extérieure suiveuse.
- Bouton `🎥` disponible pendant le trajet pour changer de vue.
- La caméra suit maintenant le cap réel du bus dans les virages.
- Le joystick de regard devient un regard relatif au véhicule au lieu de rester lié au nord du monde.

## Validation statique
- `node --check game.js`
- `node --check sw.js`
- `node --check server/server.js`
- JSON valides : manifest, version, package serveur.
- Cache PWA : `streetquest3d-v22.2-bus-code1`.
