# Critères d’acceptation — étape 3 Active Evidence State

## Test Q1 correction de preuve

1. Charger un RAW V0.7.
2. Coller une offre réelle.
3. Analyser l’offre.
4. Q1 propose une preuve active.
5. Dans la réponse Q1, corriger la preuve principale.
6. Après validation :
   - le feedback doit dire que la correction de preuve a été intégrée ;
   - le score ne doit pas donner un maximum automatique si la preuve proposée était corrigée ;
   - Q2 doit afficher la preuve corrigée, pas l’ancienne preuve.

## Test trace RAW

Après génération des livrables, le RAW actualisé doit contenir :

- `active_evidence_before`
- `active_evidence_after`
- `evidence_correction`
- `secondary_evidence`
- `user_answer_raw`
- `user_comment_on_question`
- `score_gain_obtained`
- `score_gain_potential`

## Tests conservés

- RAW seul = livrables de travail autorisés.
- L’offre collée reste l’offre active.
- Le RAW Resolver lit `validated_core`, `experiences`, `skills`, `tools`, `watch_points`.
- Chaque livrable est accompagné d’un RAW actualisé.
