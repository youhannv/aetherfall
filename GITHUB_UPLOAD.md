# StreetQuest V20 — mise en ligne GitHub Pages

Ce ZIP est prêt à être placé **à la racine** du dépôt GitHub Pages.

## Mise à jour la plus simple

1. Décompresser `StreetQuest3D-iPhone-v20.zip`.
2. Dans le dépôt `youhannv.github.io`, remplacer les anciens fichiers du jeu par le contenu de ce dossier.
3. Conserver les fichiers à la racine : `index.html`, `game.js`, `style.css`, `manifest.json`, `sw.js`, etc.
4. Commit puis push sur la branche utilisée par GitHub Pages.
5. Sur iPhone, ouvrir le site puis utiliser le bouton de mise à jour du jeu si l'ancienne version reste en cache. Le cache V20 est distinct du cache V19.

## Multijoueur

Le dossier `server/` est inclus. Si le serveur Render est déjà opérationnel, la logique réseau existante est conservée. Si tu remplaces aussi le serveur, redéploie `server/` sur Render puis vérifie `multiplayer-config.js`.

## Sauvegardes

V20 écrit dans `sq3d-v20` et tente d'importer automatiquement la sauvegarde V19/V18/V17/V16/V15. Les données urbaines procédurales dérivées sont régénérées pour éviter de conserver l'ancien plan de ville.

## Contrôle après déploiement

Utilise `V20_CHECKLIST.md`. Les points prioritaires sont : lampadaires boule uniquement sur trottoirs, feux orientés vers leur flux, circulation à droite, portes accessibles, PNJ non coincés, vendeurs tournés vers le comptoir, ville dense, population réduite automatiquement le soir/la nuit.
