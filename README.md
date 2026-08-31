# Myeloma Lab — Virtual Patient Simulator

PWA de simulation médicale éducative en HTML/CSS/JavaScript, pensée pour iPhone.

## Contenu
- cohorte de jusqu'à 6 patients virtuels avec changement de dossier
- profils aléatoires, risque standard, haut risque, atteinte rénale
- biologie : NFS, créatinine/DFG, calcium, albumine, β2M, LDH, pic monoclonal, FLC, CRP
- myélogramme et plasmocytose
- MRD NGS simulée 10^-5 et 10^-6
- imagerie corps entier schématique avec lésions osseuses
- cytogénétique de risque
- induction Isa-KRd inspirée de MIDAS
- mobilisation / recueil de cellules souches
- branches de consolidation A/B/C/D inspirées de MIDAS
- ASCT et tandem ASCT
- maintenance lénalidomide ou isatuximab + iberdomide
- toxicités et événements indésirables simulés
- soins de support
- progression, rémission profonde durable, complications
- score
- mode recherche / bac à sable pour tester des décisions hors séquence sur le patient virtuel
- historique clinique
- sauvegarde locale automatique
- fonctionnement hors ligne après premier chargement

## Important
Ce projet est un jeu / simulateur pédagogique. Les probabilités et mécanismes sont volontairement simplifiés.
Il ne doit jamais être utilisé comme protocole, dispositif médical ou aide à la décision pour un vrai patient.

## Remplacer le projet GitHub Pages existant
Remplace les anciens fichiers par :
- index.html
- game.js
- style.css
- manifest.json
- sw.js
- icon-192.png
- icon-512.png

`index.html` doit rester à la racine du dépôt.

## Inspiration scientifique publique
- MIDAS / IFM 2020-02 — NCT04934475
- stratégie MRD-adaptée après 6 cycles d'Isa-KRd
- MRD post-induction à 10^-5
- consolidation adaptée avec Isa-KRd / ASCT / tandem ASCT
- MRD pré-maintenance à 10^-6
- maintenance selon la branche

Le moteur du jeu ne reproduit pas les données individuelles de MIDAS et ne cherche pas à prédire le résultat d'un vrai patient.
