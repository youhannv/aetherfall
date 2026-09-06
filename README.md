# StreetQuest3D V22.8 — StreetPhone, annuaire, transports & secours physiques

Cette version conserve la base V22.6 : 5 villes reliées par une région continue, trains, bus/trams, immobilier, emplois, économie locale, services publics, lieux vivants, uniformes, logements, cuisine, DLU et conservation des aliments.

## Santé et maladie
- Un aliment avarié peut provoquer une intoxication alimentaire, mais pas systématiquement.
- La maladie démarre à une intensité variable : elle n'est jamais automatiquement à 100 %.
- Son évolution naturelle fluctue lentement : elle peut empirer ou s'améliorer spontanément.
- Une maladie modérée/grave peut faire baisser progressivement les PV ; la zone de santé change de couleur pendant la maladie.
- Les kits de soin peuvent restaurer des PV mais ne guérissent pas la maladie elle-même.

## Médecin, ordonnance, pharmacie et hôpital
- Les cabinets médicaux examinent le joueur et remettent une ordonnance, sans donner directement les médicaments.
- L'ordonnance indique le médicament, la fréquence des prises, la durée et le nombre de doses restantes.
- Elle reste dans le sac ou peut être rangée au domicile puis reprise plus tard.
- La pharmacie délivre uniquement le traitement prescrit ; les prises trop rapprochées sont refusées.
- Les traitements peuvent durer plusieurs jours de jeu.
- L'hôpital est payant : examen médical, ordonnance, première dose administrée par une infirmière, réévaluation puis sortie.
- En urgence, les soins hospitaliers ne sont pas refusés si le joueur manque de crédits : le solde devient une dette médicale.
- Chaque ville dispose désormais d'un hôpital et d'une offre de médecine de ville/cabinet.

## Pompiers et transport sanitaire
- Pour une maladie grave, le joueur peut appeler gratuitement les pompiers.
- Le véhicule de secours part réellement de la caserne, suit un trajet routier jusqu'au joueur, effectue une prise en charge sur brancard, puis roule jusqu'à l'hôpital le plus proche.
- L'ETA théorique est plafonnée sous 10 minutes de jeu.
- Pendant la prise en charge et l'hospitalisation, la progression de la maladie est fortement ralentie.
- Une urgence médicale peut interrompre une activité intérieure pour permettre l'évacuation.

## PNJ
- Les gros libellés de métier au-dessus des PNJ intérieurs ont été retirés.
- Le personnel hospitalier, les patients et les usagers restent visibles selon les lieux et les horaires.
- Les uniformes professionnels de V22.6 restent actifs uniquement pendant les heures de travail.

## Boulangerie et boucherie
- Ces commerces ne fonctionnent plus en libre-service.
- Les produits sont commandés au comptoir auprès du vendeur/boucher/boulanger.
- L'épicerie/supérette conserve le système rayons → caddie → caisse.

## Restaurant
- Le joueur s'assoit à une table.
- Le serveur vient à la table et présente la carte.
- La commande est envoyée en cuisine.
- Le cuisinier prépare le plat puis le serveur revient le déposer.
- Le joueur mange, demande/règle l'addition, puis peut quitter le restaurant.
- Il n'est pas possible de quitter normalement au milieu du service sans régler ; une urgence médicale reste prioritaire.

## Logements et alimentation hérités de V22.6
- Achat immobilier toujours non meublé ; location pouvant être meublée ou non.
- Salle de bain avec douche, lavabo/brossage des dents et WC.
- Cuisine avec four, plaques, évier et rangements.
- Lit pour dormir/récupérer des PV.
- Aliments avec DLU sauf eau ; stockage ambiant, réfrigéré ou congelé.
- Un aliment avarié peut être jeté ou volontairement consommé à risque.

## Déploiement
Remplacer tout le contenu du dépôt GitHub par ce dossier. Le cache PWA est `streetquest3d-v22.8-phone1`. La sauvegarde V22 est migrée sans être effacée.


## V22.8
Le StreetPhone regroupe carte, agenda, guide, annuaire local, contacts, appels 17/18 et transports. Les secours 17 et 18 partent physiquement du service le plus proche et suivent la route jusqu’au joueur ; les véhicules d’urgence ne téléportent pas sur place.
