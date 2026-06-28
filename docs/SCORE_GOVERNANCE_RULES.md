# Score Governance — V0.8.4 hotfix step 4

## Problème observé

Après Q3, TBZ a affiché :

- score 98 → 100 ;
- gain +2 / +2 ;
- tout en listant encore des manques : KPI officiels, ROI ou gains financiers non documentés.

C’est incohérent.

## Règle

Avant l’audit final :

```js
score_max = 99
```

Le score 100 est uniquement possible après Q4.

## Feedback attendu

Si le score proposé dépasse le plafond :

- afficher le score réellement obtenu ;
- expliquer que le 100 est réservé à l’audit final ;
- conserver le gain proposé dans la trace ;
- conserver le gain obtenu réellement dans la trace.

## RAW attendu

Chaque interaction doit pouvoir contenir :

```json
{
  "score_gain_proposed": 2,
  "score_gain_obtained": 1,
  "score_ceiling": 99,
  "score_ceiling_applied": true,
  "score_ceiling_reason": "Score 100 réservé à l’audit final."
}
```
