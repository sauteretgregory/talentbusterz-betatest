# Privacy preflight

Avant push GitHub, vérifier qu’il n’y a aucune donnée réelle.

Commandes utiles :

```bash
grep -RniE "REAL_CANDIDATE_NAME|REAL_CLIENT_NAME|REAL_PROJECT_NAME|REAL_COMPANY_NAME|@[a-zA-Z0-9.-]+|0[1-9][0-9 .-]{8,}" .
grep -RniE "private profile|confidential|sensitive|real raw|real cv" .
```

Le repo ne doit contenir que des exemples fictifs.
