# TalentBusterZ — betatest V0.8.4 hotfix step 4

## Objet de cette version

Cette version conserve les corrections step 1, step 2 et step 3, puis corrige le bug observé après Q3 :

**Le score ne doit pas atteindre 100/100 avant l’audit final.**

## Corrections conservées

### Step 1 — Data Gate
RAW seul = livrables de travail autorisés.

### Step 2 — RAW Resolver + Trace IA future
Le moteur lit les RAW V0.7/V0.8 et conserve les échanges dans le RAW enrichi.

### Step 3 — Active Evidence State
Quand l’utilisateur corrige la preuve active, TBZ met à jour l’état interne avant la question suivante.

## Correction step 4 — Score Governance

Avant la dernière question d’audit :

- le score est plafonné à 99 ;
- le score 100 est réservé à l’audit final ;
- si un plafond est appliqué, le feedback explique pourquoi ;
- le RAW conserve le gain proposé, le gain réellement obtenu et le plafond appliqué.

## Règle produit

Un score 100/100 ne peut être attribué que lorsque :

- la preuve active est validée ;
- le rôle personnel est clarifié ;
- les chiffres sont formulés sans sur-vente ;
- les points de prudence sont traités ;
- la formulation finale CV/entretien est validée.

Si des points de vigilance restent listés, le moteur ne doit pas afficher un 100 automatique.

## Confidentialité

Repo GitHub-safe : données fictives uniquement.
Les données réelles ne sont lues qu’au runtime depuis un fichier local chargé par l’utilisateur.
