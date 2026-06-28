# Critères d'acceptation V0.8.4 hotfix GitHub-safe

## Test RAW-only

1. Charger un RAW local anonymisé ou le RAW démo fictif.
2. Coller une offre.
3. L'analyse doit être autorisée.
4. Le Question Engine doit s'enchaîner Q1 → Q2 → Q3 → Q4.
5. Les changements de score doivent être expliqués.
6. L'utilisateur doit pouvoir contester une question, une lecture ou un score.
7. Cliquer sur **Générer les livrables**.
8. Obtenir :
   - CV Word de travail + RAW actualisé
   - Note / scoring TalentBusterZ + RAW actualisé
   - Points forts / axes d'amélioration + RAW actualisé
   - RTOU + RAW actualisé
9. Le CV de travail doit être généré même sans CV source.
10. Le pack final source-vérifié peut être désactivé sans bloquer les livrables de travail.
11. Aucune modale ne doit dire “CV bloqué” ou “chargez le CV source pour générer”.

## Test confidentialité repo

Le repo ne doit contenir aucune donnée personnelle ou client réelle.

Interdits dans le code, les samples et la documentation :
- noms de candidats réels ;
- noms de clients réels issus de tests privés ;
- métriques réelles ;
- emails ;
- téléphones ;
- adresses ;
- CV sources ;
- captures LinkedIn personnelles ;
- RAW réels.

## Test même RAW

Si le même RAW est rechargé :

- afficher “RAW déjà chargé — aucune nouvelle donnée détectée” ;
- ne pas dupliquer les données ;
- permettre la continuation de session ;
- générer un manifeste RAW inchangé si un livrable est produit sans nouvelle donnée.
