# TalentBusterZ — betatest V0.8.4 hotfix step 2

## Objet de cette version

Cette version conserve la correction Data Gate de l’étape 1 et ajoute deux corrections prioritaires :

1. **RAW Resolver V0.7/V0.8**
   - lire les RAW structurés en `validated_core`, `skills`, `tools`, `experiences`, `watch_points` ;
   - ne plus dépendre uniquement de `evidence_library` ;
   - remonter automatiquement les preuves pertinentes depuis le RAW chargé localement.

2. **Trace IA future**
   - conserver les échanges, questions, réponses, commentaires, scores, preuves utilisées, preuves écartées et réserves ;
   - produire un RAW enrichi exploitable plus tard par une IA connectée au produit final ;
   - ne pas filtrer l’information utilisateur dans le RAW : la sélection se fait au moment de générer le CV, pas par suppression de trace.

## Règle Data Gate conservée

**RAW seul = livrables de travail autorisés.**

Le CV source n’est requis que pour le pack final source-vérifié.

## Livrables en RAW seul

Quand un RAW est chargé et qu’une offre est analysée, le bouton **Générer les livrables de travail** produit :

1. CV Word de travail + RAW actualisé
2. Note/scoring TalentBusterZ + RAW actualisé
3. Points forts / axes d’amélioration + RAW actualisé
4. RTOU + RAW actualisé

## Confidentialité GitHub

Ce repo contient uniquement des données fictives. Les données réelles sont chargées localement par l’utilisateur dans son navigateur et ne sont pas incluses dans GitHub.
