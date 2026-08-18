# CHIDA Implementation Readiness

**Status: repository-ready; product and architecture decisions still remain before production-ready implementation.**

This checklist translates the current product baseline into entry conditions for engineering. It does not change the status of any item in `DECISIONS.md`.

## Safe to begin now

- Repository tooling, automated checks, ADRs, and development conventions.
- Low-fidelity domain modeling that preserves the documented entities and boundaries.
- Synthetic interaction prototypes for the approved builder and supplier journeys.
- Technical spikes that are explicitly disposable and do not claim to settle an open product decision.
- Test strategy for project isolation, approval, audit history, source provenance, and two-sided privacy.

## Decisions required before detailed interaction implementation

- Approval matrix, grouped approval, reversibility, and action history: `ب-۰۱۶`, `ب-۰۲۱`.
- Memory capture, editing, deletion, and cross-context behavior: `ب-۰۱۷`.
- Authentication, builder invitation, supplier verification, and trust marks: `ب-۰۰۹`, `ب-۰۱۰`, `ب-۰۳۷`.
- Data retention, export, deletion, and third-party processing consent: `ب-۰۱۴`, `ب-۰۱۹`.
- Web-search scope, source conflict, rights, and provider availability: `ب-۰۱۵`, `ب-۰۲۰`, `ب-۰۲۳`, `ب-۰۲۴`.
- Persian voice-note accuracy and low-confidence handling: `ب-۰۲۵`.

## Decisions required before completing the RFQ marketplace loop

- Hashtag normalization and base categories: `ب-۰۰۱`.
- RFQ recipient matching, count, visibility, and manual control: `ب-۰۰۲`.
- Builder information and address disclosed to suppliers: `ب-۰۱۱`.
- Post-response conversation and optional contact exchange: `ب-۰۳۱`.
- Supplier verification and first-cohort response expectations: `ب-۰۱۰`, `ب-۰۳۳`.
- Simple pro forma invoice boundary: `ب-۰۰۴`.

## Decisions required before public supplier messages

- Quota, timing, abuse response, and sender controls: `ب-۰۰۳`.
- Whether links or external contact details are allowed: `ب-۰۱۲`.
- Brief and urgent-notification timing, caps, and controls: `ب-۰۱۸`.

## Decisions required before paid launch

- Plan benefits and limits: `ب-۰۰۶`.
- Free tier and trial duration: `ب-۰۰۷`.
- Builder/supplier plan differences: `ب-۰۰۸`.
- Usage visibility and fair-use limits: `ب-۰۱۳`, `ب-۰۳۴`.
- Tax, official invoicing, and subscription collection: `ب-۰۲۷`.
- Annual Max pricing: `ب-۰۳۲`.
- Instrumentable north-star definition and numeric targets: `ب-۰۲۹`, `ب-۰۴۰`.

## Architecture decisions to record as each subsystem enters scope

Before the first vertical slice, accept only the foundational ADRs that slice actually depends on: application/runtime and repository structure, plus identity, data isolation, or AI-provider boundaries when the slice uses them. Do not block a focused prototype on unrelated billing, notification, or analytics decisions.

Create additional ADRs when the related subsystem enters scope:

1. application/runtime and repository structure;
2. deployment regions and access constraints from Iran;
3. identity, session, invitation, role, and authorization model;
4. data tenancy and project/shop isolation;
5. relational data, files, search, backup, retention, export, and deletion;
6. AI orchestration, provider fallback, tool authorization, and prompt/data boundaries;
7. asynchronous file/voice processing and retry/idempotency model;
8. audit trail, observability, analytics, and sensitive-data redaction;
9. notification and public-message abuse controls;
10. subscription billing and usage metering.

## Minimum gate before a limited beta

The ten readiness conditions in `02-phase-one-product.md` remain authoritative. In addition, the beta must have synthetic-to-consented-data migration rules, critical privacy tests, recovery for failed actions, measurable cost/usage, and documented operator procedures. A successful build is not beta evidence by itself.
