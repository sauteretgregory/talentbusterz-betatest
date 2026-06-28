# TalentBusterZ — betatest V0.8.4 hotfix GitHub-safe

Démonstrateur statique local : CV augmenté, matching offre/profil, Question Engine et livrables de travail.

## Correctif V0.8.4 hotfix

Cette version reprend les corrections de la branche hotfix actuelle `talentbusterz_betatest_v0_8_4_hotfix` et retire toute donnée privée du repo.

Le repo GitHub ne doit contenir que :
- des données fictives ;
- des exemples anonymisés ;
- des placeholders ;
- des règles produit ;
- du code applicatif.

## Règle centrale

- **RAW chargé = continuité active**
- Le CV source est **optionnel** en mode local.
- Le CV source ne bloque plus les livrables de travail.
- Il bloque uniquement le **pack final source-vérifié**.
- Chaque livrable généré doit être accompagné d’un RAW actualisé ou d’un manifeste RAW inchangé.

## Livrables projet

Quand l'utilisateur clique sur **Générer les livrables**, le prototype doit produire :

1. CV Word de travail + RAW actualisé
2. Note / scoring TalentBusterZ + RAW actualisé
3. Points forts / axes d'amélioration + RAW actualisé
4. RTOU + RAW actualisé

## Sécurité / confidentialité

Ne jamais pousser dans le repo :
- vrai CV ;
- vrai RAW candidat ;
- nom de candidat test réel ;
- nom de client privé ;
- métriques projet réelles ;
- coordonnées ;
- données sensibles ;
- captures LinkedIn personnelles ;
- exports issus d’un vrai entretien.

Les exemples du repo utilisent uniquement :
- `Profil Démo`
- `Client Luxe Démo`
- `Projet RCU fictif`
- `volume fictif`
- `périmètre fictif`

## Démarrage local

Ouvrir `index.html` dans un navigateur.

Aucun serveur n’est nécessaire.
