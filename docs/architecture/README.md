# Architecture Decision Records

Architecture Decision Records (ADRs) capture durable technical choices for CHIDA. Product authority remains in the root product documents and `DECISIONS.md`; an ADR may implement a product decision but may not silently replace one.

Research proposals such as the [Technical Inception proposal](../proposals/2026-08-20-technical-inception.md) and dated work such as the [Iran service landscape](../research/2026-08-20-iran-service-landscape.md) preserve investigated options, but they are not ADRs and grant no implementation authority. Promote only the reviewed and accepted choice into a numbered ADR.

## When an ADR is required

Create an ADR before committing to a choice that is costly to reverse or affects security, privacy, authorization, data ownership, provider dependency, deployment, or multiple modules.

Examples include the application framework, repository layout, identity provider, authorization model, database, file storage, search, AI providers, background jobs, audit model, observability, hosting, billing, and notification delivery.

## Process

1. Copy `0000-template.md` to the next four-digit number and a concise English slug.
2. Link the related product decisions or open items.
3. Compare realistic alternatives and identify constraints.
4. Mark the ADR `Proposed` until reviewed, then `Accepted`, `Rejected`, or `Superseded`.
5. If a later decision replaces it, keep the old ADR and link both records.

Do not use an ADR to hide an unresolved product dependency. Resolve the product decision in `DECISIONS.md` first when the user-facing behavior or commercial rule changes.
