# Security Policy

CHIDA will handle sensitive project, identity, document, financial, and commercial information. Security and privacy defects are product-blocking defects.

## Reporting

Do not place credentials, personal data, private project records, customer files, or exploit details in an issue or pull request. Authorized repository collaborators should use [a private GitHub security advisory](https://github.com/mahyarkalbasii-cloud/Chida/security/advisories/new) and include only the minimum evidence needed to reproduce the problem safely.

## Current development rules

- Use synthetic fixtures only.
- Keep secrets in ignored local environment files or an approved secret manager.
- Do not commit tokens, keys, production exports, uploaded files, logs containing private data, or screenshots of real accounts.
- Treat cross-project, cross-account, or builder/supplier data exposure as critical.
- Treat an external action without explicit user approval as critical.
- Treat model output as untrusted input and validate it before persistence or execution.
- Document third-party data flows, retention, deletion, and consent before connecting real user data.

The supported production versions and coordinated disclosure process will be added before a public or production release.
