# Changelog

## talentbusterz_betatest_v0_8_4_hotfix_step3_activeevidence_state

- Patch Active Evidence State.
- Q1 peut désormais corriger la preuve active.
- `state.activeEvidence` est mis à jour avant Q2.
- L’ancienne preuve est conservée comme preuve secondaire.
- L’interaction trace :
  - preuve avant correction ;
  - preuve après correction ;
  - correction utilisateur ;
  - score plafonné si la preuve initiale était mal hiérarchisée.
- Feedback Q1 plus cohérent :
  - correction intégrée ;
  - gain partiel si la hiérarchie de preuve devait être corrigée ;
  - raison du non-maximum.
- Q2 affiche la preuve active corrigée.
- RAW enrichi conserve `active_evidence_after`, `evidence_correction`, `secondary_evidence`.
