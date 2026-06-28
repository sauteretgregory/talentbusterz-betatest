# Changelog

## talentbusterz_betatest_v0_8_4_hotfix_step2_rawresolver_trace

- Conservation de la correction Data Gate step 1.
- Ajout RAW Resolver compatible avec les RAW V0.7 :
  - `validated_core.proofs`
  - `experiences[]`
  - `skills.project_management`
  - `skills.crm_customer_data`
  - `skills.data_bi`
  - `tools[]`
  - `watch_points[]`
- L’offre collée localement reste l’offre active : plus de remplacement forcé par Offre Démo.
- Extraction dynamique basique :
  - entreprise ;
  - intitulé ;
  - signaux d’offre ;
  - exigences ;
  - zones de vigilance.
- Question 1 contextualisée par l’offre et les preuves détectées dans le RAW.
- Conservation des échanges dans le RAW enrichi :
  - questions ;
  - réponses brutes ;
  - commentaires utilisateur ;
  - interprétation assistant ;
  - score avant/après ;
  - preuves actives ;
  - preuves alternatives ;
  - flags de prudence ;
  - métadonnées de génération.
- Ajout d’un journal local `_tbz_trace.sessions[].interactions[]`.
