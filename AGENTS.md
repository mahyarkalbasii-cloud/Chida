# CHIDA Repository Working Agreement

## Purpose

This repository is the canonical product-document workspace and future implementation home for CHIDA. Treat the current product documents as the source of truth for scope and behavior. Do not infer implementation authority from historical CHIDA, CHIDA Final, CHIDA-Sol, PersianSazeh, or other workspaces.

## Source hierarchy

When sources disagree, use this order:

1. Final decisions in `DECISIONS.md`.
2. `02-phase-one-product.md` for version-one scope.
3. The topic owner named in `README.md`.
4. Historical material only as background.

A product decision change must be recorded in `DECISIONS.md`, include its reason, and update every affected document in the same change.

## Required reading

Before implementation, read:

- `README.md` and `DECISIONS.md`;
- `02-phase-one-product.md`;
- the owner document for the feature being changed;
- `docs/implementation-readiness.md`;
- relevant architecture decision records under `docs/architecture/`.

## Version-one invariants

- The product is Persian, RTL, mobile-first, and initially serves projects and needs in Tehran.
- A supplier may be outside Tehran only when it can deliver products or provide services in Tehran.
- Accounts are single-user in version one.
- The user sees one persona, CHIDA. Do not expose selectable agents, specialists, models, or effort levels.
- CHIDA is assistant-first, not chat-only. Important results become structured, persistent, editable records.
- The core loop is intent -> draft -> review/edit -> approval -> permitted execution -> receipt/history.
- Project data, general account context, supplier-private data, and builder-private data must remain isolated.
- Text, voice notes, images, and files are version-one inputs. Live voice is not.
- Version one includes projects, tasks, documents, simple project finance, RFQs, supplier product/service stores, sales opportunities, public supplier messages, inbox, daily brief, memory, search, subscription, usage, and settings within the documented boundaries.
- CHIDA is not a party to a transaction. Payment, contract signature, transport, delivery, warranties, arbitration, and licensed professional responsibility remain outside the product.

## Implementation boundaries

- Do not silently resolve an open product question in code. Surface the dependency and update the decision ledger first.
- Do not choose a durable platform, identity model, data boundary, AI-provider strategy, or hosting architecture without an accepted ADR.
- Deterministic application code must own permissions, state transitions, recipient policy, idempotency, calculations, and audit records. Model output is never the authorization layer.
- External or consequential actions require an exact preview, destination, explicit approval, and a durable result or failure receipt.
- Preserve source, date, assumptions, and uncertainty for legal, technical, regulatory, price, and other changing claims.
- Never fabricate missing prices, inventory, delivery terms, regulations, citations, or project facts.

## Security and privacy

- Never commit credentials, tokens, production data, personal data, financial records, or uploaded customer files.
- Use synthetic fixtures until a documented data-handling and retention policy exists.
- Enforce authorization on the server; hiding a control in the UI is not authorization.
- Treat cross-project or cross-market-side data exposure as a critical defect.
- Keep sensitive values out of logs, analytics, prompts, traces, screenshots, and test artifacts.
- Any third-party processing of project, file, identity, or commercial data requires the documented consent and disclosure path.

## UX and behavior

- Preserve explicit context: the user must always know whether they are in general space, a project, a shop, or a specific record.
- Chat creates reviewable artifacts; approval creates or changes records.
- No visible control may be decorative or lead to a dead end in an implemented journey.
- Support empty, loading, review, success, failure, conflict, and retry states.
- Preserve user input across validation and recoverable errors.
- Validate Persian typography, real RTL layout, native mobile keyboard behavior, touch targets, light/dark themes, and responsive geometry on actual rendered surfaces.
- Keep the interface restrained. Orange is an accent, not a blanket card color, and status must not rely on color alone.

## Repository workflow

- Use clear English names for branches, code, folders, ADRs, tests, workflows, and technical artifacts. Product-facing Persian copy remains Persian.
- Preserve unrelated user changes. Stage only files that belong to the requested change.
- Prefer small, reviewable changes with explicit acceptance criteria.
- Keep generated output, dependencies, credentials, local caches, and test artifacts out of Git.
- Do not deploy, publish a release, migrate real data, or change production services without explicit authorization.

## Verification

Run the current repository check before every commit:

```powershell
pwsh ./scripts/verify-docs.ps1
```

When application code is added, the same change must add documented install, lint, type-check, test, build, and local-run commands. A build alone is not journey verification; test the rendered routes, state changes, responsive behavior, console, and network/storage boundaries.
