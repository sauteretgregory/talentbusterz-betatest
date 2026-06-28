# Critères d’acceptation — étape 2 RAW Resolver + Trace

## Test avec RAW V0.7

1. Charger un RAW V0.7 contenant `validated_core`, `experiences`, `skills`, `tools`.
2. Coller une vraie offre.
3. L’offre active affichée doit reprendre l’entreprise et le titre extraits du texte collé.
4. La preuve active ne doit plus rester “Preuve principale à clarifier” si le RAW contient des preuves.
5. TBZ doit afficher au moins une preuve candidate issue du RAW.
6. La question 1 doit rappeler :
   - l’offre active ;
   - les signaux détectés dans l’offre ;
   - les preuves candidates issues du RAW.

## Test conservation échanges

1. Répondre à une question.
2. Ajouter un commentaire sur la question.
3. Générer les livrables de travail.
4. Télécharger le RAW actualisé.
5. Vérifier que le RAW contient :
   - question posée ;
   - réponse brute ;
   - commentaire utilisateur ;
   - score avant/après ;
   - preuve active ;
   - preuves candidates ;
   - interprétation assistant ;
   - décision d’usage.

## Test Data Gate conservé

RAW seul + offre analysée doit toujours autoriser :
- CV Word + RAW ;
- note/scoring + RAW ;
- points/axes + RAW ;
- RTOU + RAW.
