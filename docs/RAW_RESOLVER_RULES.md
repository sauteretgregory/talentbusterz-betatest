# RAW Resolver — V0.8.4 hotfix step 2

## Objectif

Lire correctement les RAW locaux de test, y compris les RAW V0.7 qui n’utilisent pas forcément `evidence_library`.

## Entrées prises en charge

Le resolver doit lire :

- `evidence_library[]`
- `validated_core.proofs[]`
- `experiences[]`
- `skills.project_management[]`
- `skills.crm_customer_data[]`
- `skills.data_bi[]`
- `tools[]`
- `watch_points[]`

## Sortie attendue

Le resolver produit :

```json
{
  "profile_label": "Profil Démo",
  "positioning": "...",
  "proof_candidates": [],
  "skills_detected": [],
  "tools_detected": [],
  "watch_points": [],
  "resolver_status": "resolved_from_raw"
}
```

## Règle importante

Le repo GitHub ne doit pas contenir de données réelles.
Le resolver peut lire des données réelles seulement au runtime, depuis un fichier chargé localement par l’utilisateur.
