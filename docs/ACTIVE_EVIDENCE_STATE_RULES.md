# Active Evidence State — V0.8.4 hotfix step 3

## Problème

Après Q1, l’utilisateur peut corriger la preuve principale.
Dans ce cas, TBZ ne doit pas continuer Q2 sur l’ancienne preuve.

## Règle

Si Q1 contient une correction de preuve, alors :

```js
state.activeEvidence = correctedEvidence;
```

L’ancienne preuve devient :

```js
secondaryEvidence = previousActiveEvidence;
```

## Détection correction

Détecter une correction si la réponse ou le commentaire contient par exemple :

- je corrige
- preuve principale
- plutôt
- n’est pas
- preuve secondaire
- à prioriser
- compléter par
- IT CRM
- RCU
- luxe-retail
- récent

## Score

Si TBZ avait proposé une preuve imparfaite et que l’utilisateur corrige :

- ne pas donner automatiquement +3/3 ;
- donner plutôt +2/3 si la réponse est utile ;
- expliquer que le maximum n’est pas donné car la preuve a dû être re-hiérarchisée.

## Trace RAW

Tracer :

- `active_evidence_before`
- `active_evidence_after`
- `evidence_correction`
- `secondary_evidence`
- `user_answer_raw`
- `user_comment_on_question`
