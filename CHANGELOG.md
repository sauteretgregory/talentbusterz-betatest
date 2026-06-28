# Changelog

## talentbusterz_betatest_v0_8_4_hotfix_step4_score_governance

- Patch Score Governance.
- Le score est plafonné à 99 avant la question finale.
- Q3 ne peut plus faire passer automatiquement de 98 à 100.
- Le feedback indique quand un plafond de score est appliqué.
- Le RAW trace :
  - `score_gain_proposed`
  - `score_gain_obtained`
  - `score_ceiling`
  - `score_ceiling_applied`
  - `score_ceiling_reason`
- Le score 100 est réservé à l’audit final, après traitement des derniers points de prudence.
