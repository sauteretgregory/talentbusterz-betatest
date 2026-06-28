# Privacy preflight before GitHub push

Before pushing the repo, search for private data.

Recommended checks:

```bash
grep -RniE "REAL_CANDIDATE_NAME|REAL_CLIENT_NAME|REAL_PROJECT_NAME|REAL_COMPANY_NAME|@[a-zA-Z0-9.-]+|0[1-9][0-9 .-]{8,}" .
grep -RniE "real client|real candidate|private profile|confidential|sensitive" .
```

Allowed examples must stay fictional:
- Profil Démo
- Client Luxe Démo
- Projet RCU fictif
- volume fictif
- périmètre fictif

Never commit:
- real CV
- real RAW
- real screenshots from LinkedIn
- candidate identity
- client identity from a private profile
- real project metrics
- real personal contact details
