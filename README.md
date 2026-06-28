# TalentBusterZ — betatest V0.8.4 hotfix step 3

## Objet de cette version

Cette version conserve les corrections step 1 et step 2, puis corrige le bug bloquant observé après Q1 :

**Quand l’utilisateur corrige la preuve active, TBZ doit mettre à jour l’état interne avant la question suivante.**

## Corrections conservées

### Step 1 — Data Gate
RAW seul = livrables de travail autorisés.

### Step 2 — RAW Resolver + Trace IA future
Le moteur lit les RAW V0.7/V0.8 et conserve les échanges dans le RAW enrichi.

## Correction step 3 — Active Evidence State

Après Q1, si l’utilisateur corrige la preuve principale :

- `state.activeEvidence` est remplacée par la preuve corrigée ;
- l’ancienne preuve devient preuve secondaire ;
- la correction est tracée dans l’interaction ;
- Q2 utilise la nouvelle preuve active ;
- le gain de score est plafonné si la réponse révèle que TBZ avait mal hiérarchisé la preuve ;
- le feedback explique la correction.

## Règle produit

TBZ ne doit jamais continuer une séquence de questions sur une preuve que l’utilisateur vient de corriger.

Si l’utilisateur dit :
- “je corrige la preuve”
- “la preuve principale est plutôt…”
- “la preuve active n’est pas…”
- “à utiliser en secondaire”

alors l’état actif doit changer avant la question suivante.

## Confidentialité

Repo GitHub-safe : données fictives uniquement.
Les données réelles ne sont lues qu’au runtime depuis un fichier local chargé par l’utilisateur.
