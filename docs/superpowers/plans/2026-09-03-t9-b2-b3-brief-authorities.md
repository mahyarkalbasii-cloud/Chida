# T9-B2 and T9-B3 Project Brief Authorities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Complete the final two real-data sections of the builder Project Brief by adding explicit project-input disposition and explicit last-visit checkpoints, then publish one verified SHA to GitHub, Cloudflare Pages, and owner-only ChatGPT Sites.

**Architecture:** Add one domain module, prototype/src/projectBriefAuthorities.ts, containing two independent project-scoped sidecar ledgers and their shared SHA-256/authority machinery. Existing File, Source, Task, Backbone, Approval, Dispatch, and Purchase Request stores remain byte-for-byte unchanged and are consumed only through ready, parser-validated adapters assembled by Prototype.tsx. T9-B2 is completed and reviewed first; T9-B3 then consumes the complete T9-B2 observed-head projection, while both ship in one frozen release candidate.

**Tech Stack:** TypeScript 7, React 19, browser localStorage and IndexedDB, Web Locks API, synchronous SHA-256 using the existing project algorithm semantics, Vite 8, Playwright 1.61, GitHub-triggered Cloudflare Pages, ChatGPT Sites.

**Spec:** [Approved design](../specs/2026-09-03-t9-b2-b3-brief-authorities-design.md)

## Global Constraints

- Work only in /Users/mahyarkl/Desktop/ChatGPT/CHIDA on the existing main checkout; do not create a worktree.
- The written design was approved by Mahyar on 2026-09-03. The user requested both tasks and one combined publication.
- Keep CHIDA Persian, true RTL, Dark-only, edge-to-edge, and mobile-first at 390 x 844.
- Create exactly two independent canonical sidecar stores: chida-prototype-project-input-dispositions:v1 and chida-prototype-project-visit-checkpoints:v1.
- Do not change the schema or bytes of File, Source, Task, Backbone, Purchase Request, Content Approval, Supplier Contact, Dispatch Draft, Dispatch Plan Approval, Proposal, Memory, BuiltArtifact, or Monitor stores.
- Do not write either sidecar merely because Brief, Drawer, schedule, focus, visibility, reload, or project switch was opened or observed.
- Every read and mutation receives a fresh ProjectBriefAuthority. Identity/policy mismatch is read-error, never empty state or fallback.
- Every new persisted fingerprint is SHA-256. Existing FNV or stored SHA fingerprints are validation evidence only and are never used as a shortcut for a new observed-head digest.
- A metadata-only document may be resolved from metadata without any content/authenticity claim. A browser-file or Composer asset must finish healthy existing reconciliation and Blob verification before disposition can mutate.
- A baseline head missing from current state without a valid tombstone makes the delta unavailable. This slice exposes added and updated only; it never invents removed.
- Opening Brief remains byte-for-byte read-only. Only the explicit actions “تعیین‌تکلیف شد”، “بازکردن دوباره”، “ثبت وضعیت فعلی به‌عنوان مبنا”، and “همه را دیدم” may write their matching sidecar.
- Do not add Report T10, backend, model, OCR, extraction, web, network, sync, notification, worker, supplier flow, send, purchase, payment, or external effect.
- Do not modify protected runtime files: prototype/src/App.tsx, prototype/src/main.tsx, prototype/src/styles.css, prototype/src/mobile/, prototype/public/assets/iphone/, prototype/public/assets/android/, prototype/public/assets/status/, prototype/vite.config.ts, prototype/worker/index.js, or prototype/scripts/prepare-sites-build.mjs.
- Every production behavior starts with a focused failing Playwright test. Observe RED, add the minimum GREEN, and do not skip, retry, weaken assertions, or increase timeouts.
- Use focused development tests. Run npm run gate:release exactly once after the combined candidate is frozen.
- Preserve all unrelated user changes. Use apply_patch for edits.

## File and Ownership Map

| File | Planned responsibility |
|---|---|
| prototype/src/projectBriefAuthorities.ts | Shared authority validation and SHA-256; exact T9-B2 target derivation, ledger, parser/replay, projection and mutation; exact T9-B3 observed heads, delta, ledger, parser/replay and mutation |
| prototype/src/Prototype.tsx | Ready-only adapters, React state/reconciliation, user actions, exact target navigation, and the fourth/fifth Brief sections |
| prototype/src/prototype.css | App-owned RTL status/action styles and five-section Brief layout at 390 x 844 |
| prototype/tests/chida-flow.spec.ts | Independent fixtures/oracles, direct module tests, UI tests, fault injection, multi-tab concurrency, and combined regressions |
| BUILDER-FEATURE-BACKLOG-FA.md | T9-B2/T9-B3 scope, state, acceptance, and remaining builder work |
| CHIDA-CONTINUATION-HANDOFF-FA.md | Exact local/release evidence, SHA alignment, and next authorized stop |
| CHIDA-PRODUCT-LEARNINGS-FA.md | Separate observed experience, master-document gap, decision/status, and proposed master-document amendment |

## Required Public Module Boundary

The new module must keep the two stores independent while exposing one stable integration boundary:

~~~ts
export const projectInputDispositionsStorageKey =
  "chida-prototype-project-input-dispositions:v1";
export const projectInputDispositionsWriteLockName =
  projectInputDispositionsStorageKey + ":write";
export const projectVisitCheckpointsStorageKey =
  "chida-prototype-project-visit-checkpoints:v1";
export const projectVisitCheckpointsWriteLockName =
  projectVisitCheckpointsStorageKey + ":write";

export type Sha256Fingerprint = `sha256-${string}`;
export type ProjectBriefAuthority = {
  identityBindingHash: Sha256Fingerprint;
  snapshotHash: Sha256Fingerprint;
  projectIds: string[];
  authorizationHashes: Record<string, Sha256Fingerprint>;
};

export type ProjectInputFileSnapshot = {
  id: string;
  projectId: string;
  displayName: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: "نقشه" | "پیش‌فاکتور" | "فاکتور" | "قرارداد" | "صورت‌جلسه" | "صفحه‌گسترده" | "عکس" | "سایر";
  source: "انتخاب مستقیم از دستگاه" | "دوربین دستگاه";
  status: "ثبت محلی";
  version: 1;
  projectStage: string;
  visibility: "خصوصی پروژه";
  storageMode: "metadata-only" | "browser-image" | "browser-file";
  sourceModifiedAt: string | null;
  createdAt: string;
};
export type ProjectInputSourceSnapshot = {
  schemaVersion: 1;
  id: string;
  intakeId: string;
  ownerPrincipalId: "local-builder-account";
  accountSide: "builder";
  scopeType: "project_private";
  scopeId: string;
  projectId: string;
  sourceType: "composer-text" | "composer-file" | "composer-photo";
  assetRef: { kind: "project-file" | "project-photo"; fileId: string; fileVersion: 1 } | null;
  textContent: string | null;
  version: 1;
  provenance: "direct_user_composer";
  capturedAt: string;
  sourceDate: string | null;
  locatorCapability: "record" | "asset";
  excerptCapability: "full-text" | "none";
  contentHash: string;
  readStatus: "available";
  sensitivity: "project-private";
  visibility: "visible";
  manualSearchability: false;
  automaticRetrievalEligibility: false;
  modelEligibility: false;
  shareability: false;
  useInContextPreference: false;
  fingerprint: string;
};
export type ProjectInputIntakeSnapshot = {
  id: string;
  projectId: string;
  sourceIds: string[];
  version: 1;
  createdAt: string;
  fingerprint: string;
};
export type ProjectInputSourceEnvelopeSnapshot = {
  schemaVersion: 1;
  envelopeVersion: number;
  records: ProjectInputSourceSnapshot[];
  intakes: ProjectInputIntakeSnapshot[];
  updatedAt: string | null;
};

export type ProjectInputTarget = {
  kind: "project-document" | "composer-intake";
  id: string;
  projectId: string;
  version: 1;
  fingerprint: Sha256Fingerprint;
};
export type ProjectInputEffectiveStatus =
  | "pending"
  | "resolved"
  | "pending-stale";
export type ProjectInputDestination =
  | { kind: "project-document"; fileId: string }
  | { kind: "composer-source"; sourceId: string };
export type ProjectInputDerivedItem = {
  target: ProjectInputTarget;
  title: string;
  meta: string;
  createdAt: string;
  destination: ProjectInputDestination | null;
};
export type ProjectInputProjectionItem = ProjectInputDerivedItem & {
  effectiveStatus: ProjectInputEffectiveStatus;
  dispositionId: string | null;
  dispositionVersion: number | null;
};
export type ProjectInputObservedHead = {
  kind: "project-input";
  id: string;
  version: number;
  state: ProjectInputEffectiveStatus;
  fingerprint: Sha256Fingerprint;
};

export type ProjectInputDependencies =
  | { status: "loading" | "unavailable"; projectId: string; reason: string }
  | {
      status: "ready";
      projectId: string;
      files: ProjectInputFileSnapshot[];
      sourceEnvelope: ProjectInputSourceEnvelopeSnapshot;
      reason: "";
    };

export type ProjectInputDispositionCommand = {
  inputSchemaVersion: 1;
  action: "resolve-input" | "reopen-input";
  projectId: string;
  target: ProjectInputTarget;
  expectedStoreVersion: number;
  expectedDispositionVersion: number | null;
  idempotencyKey: string;
};
export type ProjectInputDerivationState =
  | { status: "loading" | "unavailable"; targets: null; items: []; reason: string }
  | { status: "ready"; targets: ProjectInputTarget[]; items: ProjectInputDerivedItem[]; reason: "" };
export type ProjectInputDispositionSnapshot = {
  target: ProjectInputTarget;
  status: "pending" | "resolved";
};
export type ProjectInputDispositionRevision = {
  id: string;
  version: number;
  createdAt: string;
  authorizationContextHash: Sha256Fingerprint;
  snapshot: ProjectInputDispositionSnapshot;
  fingerprint: Sha256Fingerprint;
};
export type ProjectInputDispositionEvent = {
  id: string;
  type: "resolved" | "reopened";
  actor: "شما";
  actorPrincipalId: "local-builder-account";
  at: string;
  version: number;
  revisionId: string;
  authorizationContextHash: Sha256Fingerprint;
  idempotencyKey: string;
  commandPayloadHash: Sha256Fingerprint;
  fingerprint: Sha256Fingerprint;
};
export type ProjectInputDispositionRecord = {
  schemaVersion: 1;
  objectType: "project-input-disposition";
  id: string;
  projectId: string;
  ownerPrincipalType: "account";
  ownerPrincipalId: "local-builder-account";
  accountSide: "builder";
  scopeType: "project_private";
  scopeId: string;
  custodianService: "Project Brief Domain Service";
  sensitivity: "private";
  authorizationContextHash: Sha256Fingerprint;
  version: number;
  currentRevisionId: string;
  createdAt: string;
  updatedAt: string;
  history: ProjectInputDispositionEvent[];
  revisions: ProjectInputDispositionRevision[];
  fingerprint: Sha256Fingerprint;
};
export type ProjectInputDispositionReceipt = {
  schemaVersion: 1;
  key: string;
  action: "resolve-input" | "reopen-input";
  payloadHash: Sha256Fingerprint;
  projectId: string;
  dispositionId: string;
  expectedStoreVersion: number;
  expectedDispositionVersion: number | null;
  resultingStoreVersion: number;
  resultingDispositionVersion: number;
  eventId: string;
  revisionId: string;
  authorizationContextHash: Sha256Fingerprint;
  recordedAt: string;
  fingerprint: Sha256Fingerprint;
};
export type ProjectInputDispositionEnvelope = {
  schemaVersion: 1;
  fingerprintVersion: "project-input-disposition-v1";
  identityBindingHash: Sha256Fingerprint;
  storeVersion: number;
  records: ProjectInputDispositionRecord[];
  idempotencyReceipts: ProjectInputDispositionReceipt[];
  updatedAt: string | null;
  fingerprint: Sha256Fingerprint;
};
export type ProjectInputDispositionState =
  | { status: "loading"; envelope: null; items: []; observedHeads: null; reason: "dependencies-loading" }
  | { status: "unavailable"; envelope: null; items: []; observedHeads: null; reason: string }
  | { status: "read-error"; envelope: null; items: []; observedHeads: null; reason: string }
  | {
      status: "ready";
      envelope: ProjectInputDispositionEnvelope;
      items: ProjectInputProjectionItem[];
      observedHeads: ProjectInputObservedHead[];
      reason: "";
    };
export type ProjectInputDispositionMutationResult = {
  status:
    | "resolved"
    | "reopened"
    | "unchanged"
    | "read-failure"
    | "dependency-read-failure"
    | "dependency-stale"
    | "scope-mismatch"
    | "version-conflict"
    | "idempotency-payload-mismatch"
    | "write-failure"
    | "lock-unavailable";
  envelope: ProjectInputDispositionEnvelope | null;
};

export type ProjectBriefObservedKind =
  | "manual-task"
  | "backbone-task"
  | "content-approval"
  | "dispatch-plan-approval"
  | "purchase-request"
  | "project-input";
export type ProjectBriefObservedHeadBase = {
  kind: ProjectBriefObservedKind;
  id: string;
  version: number;
  fingerprint: Sha256Fingerprint;
};
export type ProjectBriefObservedHead = ProjectBriefObservedHeadBase & (
  | { kind: "manual-task" | "backbone-task"; state: "in-progress" | "completed" }
  | { kind: "content-approval"; state: "pending" | "approved" | "changes-requested" }
  | { kind: "dispatch-plan-approval"; state: "pending" | "approved" | "withdrawn" | "invalidated" }
  | { kind: "purchase-request"; state: "draft" | "ready-for-review" }
  | { kind: "project-input"; state: "pending" | "pending-stale" | "resolved" }
);
export type ProjectBriefHeadAdapterState =
  | { status: "loading" | "unavailable"; kind: ProjectBriefObservedKind; reason: string }
  | {
      status: "ready";
      kind: Exclude<ProjectBriefObservedKind, "project-input">;
      id: string;
      projectId: string;
      version: number;
      state: Exclude<ProjectBriefObservedHead, { kind: "project-input" }>["state"];
      semanticPreimage: unknown;
      dependencyCapsule: unknown | null;
      reason: "";
    };
export type ProjectBriefObservationState =
  | { status: "loading" | "unavailable"; observation: null; reason: string }
  | {
      status: "ready";
      reason: "";
      observation: {
        projectId: string;
        observationSchemaVersion: 1;
        heads: ProjectBriefObservedHead[];
        observationFingerprint: Sha256Fingerprint;
      };
    };

export type ProjectVisitCheckpointSnapshot = {
  observedAt: string;
  observationSchemaVersion: 1;
  heads: ProjectBriefObservedHead[];
  observationFingerprint: Sha256Fingerprint;
};
export type ProjectVisitCheckpointRevision = {
  id: string;
  version: number;
  createdAt: string;
  authorizationContextHash: Sha256Fingerprint;
  snapshot: ProjectVisitCheckpointSnapshot;
  fingerprint: Sha256Fingerprint;
};
export type ProjectVisitCheckpointEvent = {
  id: string;
  type: "baseline-recorded" | "all-seen";
  actor: "شما";
  actorPrincipalId: "local-builder-account";
  at: string;
  version: number;
  revisionId: string;
  authorizationContextHash: Sha256Fingerprint;
  idempotencyKey: string;
  commandPayloadHash: Sha256Fingerprint;
  fingerprint: Sha256Fingerprint;
};
export type ProjectVisitCheckpointRecord = {
  schemaVersion: 1;
  objectType: "project-visit-checkpoint";
  id: string;
  projectId: string;
  ownerPrincipalType: "account";
  ownerPrincipalId: "local-builder-account";
  accountSide: "builder";
  scopeType: "project_private";
  scopeId: string;
  custodianService: "Project Brief Domain Service";
  sensitivity: "private";
  authorizationContextHash: Sha256Fingerprint;
  version: number;
  currentRevisionId: string;
  createdAt: string;
  updatedAt: string;
  history: ProjectVisitCheckpointEvent[];
  revisions: ProjectVisitCheckpointRevision[];
  fingerprint: Sha256Fingerprint;
};
export type ProjectVisitCheckpointReceipt = {
  schemaVersion: 1;
  key: string;
  action: "record-baseline" | "mark-all-seen";
  payloadHash: Sha256Fingerprint;
  projectId: string;
  checkpointId: string;
  expectedStoreVersion: number;
  expectedCheckpointVersion: number | null;
  expectedObservationFingerprint: Sha256Fingerprint;
  resultingStoreVersion: number;
  resultingCheckpointVersion: number;
  eventId: string;
  revisionId: string;
  authorizationContextHash: Sha256Fingerprint;
  recordedAt: string;
  fingerprint: Sha256Fingerprint;
};
export type ProjectVisitCheckpointEnvelope = {
  schemaVersion: 1;
  fingerprintVersion: "project-visit-checkpoint-v1";
  identityBindingHash: Sha256Fingerprint;
  storeVersion: number;
  records: ProjectVisitCheckpointRecord[];
  idempotencyReceipts: ProjectVisitCheckpointReceipt[];
  updatedAt: string | null;
  fingerprint: Sha256Fingerprint;
};
export type ProjectVisitCheckpointCommand = {
  inputSchemaVersion: 1;
  action: "record-baseline" | "mark-all-seen";
  projectId: string;
  expectedStoreVersion: number;
  expectedCheckpointVersion: number | null;
  expectedObservationFingerprint: Sha256Fingerprint;
  idempotencyKey: string;
};
export type ProjectVisitCheckpointState =
  | { status: "read-error"; envelope: null; reason: string }
  | { status: "ready"; envelope: ProjectVisitCheckpointEnvelope; reason: "" };
export type ProjectVisitDeltaState =
  | { status: "loading" | "unavailable" | "uninitialized"; groups: []; reason: string }
  | {
      status: "ready";
      groups: Array<{
        kind: "tasks" | "decisions" | "procurement" | "inputs";
        added: number;
        updated: number;
      }>;
      reason: "";
    };
export type ProjectVisitCheckpointMutationResult = {
  status:
    | "recorded"
    | "read-failure"
    | "dependency-read-failure"
    | "dependency-stale"
    | "scope-mismatch"
    | "version-conflict"
    | "idempotency-payload-mismatch"
    | "write-failure"
    | "lock-unavailable";
  envelope: ProjectVisitCheckpointEnvelope | null;
};

export function projectBriefHash(value: unknown): Sha256Fingerprint;
export function deriveProjectInputTargets(
  dependencies: ProjectInputDependencies,
): ProjectInputDerivationState;
export function readProjectInputDispositionState(
  authority: ProjectBriefAuthority | null,
  dependencies: ProjectInputDependencies,
): ProjectInputDispositionState;
export function projectInputObservedHeads(
  state: ProjectInputDispositionState,
): ProjectInputObservedHead[] | null;
export async function executeProjectInputDispositionCommand(
  command: ProjectInputDispositionCommand,
  getAuthority: () => ProjectBriefAuthority | null,
  getDependencies: (projectId: string) => Promise<ProjectInputDependencies>,
): Promise<ProjectInputDispositionMutationResult>;

export function buildProjectBriefObservation(
  projectId: string,
  adapters: readonly ProjectBriefHeadAdapterState[],
  inputHeads: readonly ProjectInputObservedHead[] | null,
): ProjectBriefObservationState;
export function readProjectVisitCheckpointState(
  authority: ProjectBriefAuthority | null,
): ProjectVisitCheckpointState;
export function projectVisitDeltaForObservation(
  state: ProjectVisitCheckpointState,
  observation: ProjectBriefObservationState,
  projectId: string,
): ProjectVisitDeltaState;
export async function executeProjectVisitCheckpointCommand(
  command: ProjectVisitCheckpointCommand,
  getAuthority: () => ProjectBriefAuthority | null,
  getObservation: (projectId: string) =>
    ProjectBriefObservationState | Promise<ProjectBriefObservationState>,
): Promise<ProjectVisitCheckpointMutationResult>;
~~~

The implementation may export exact record/envelope/result types needed by Prototype.tsx and Playwright. Stable-value helpers, SHA internals, strict parsers, finalizers, receipt replay, and storage primitives remain private.

---

### Task 1: T9-B2 Canonical Input Targets and SHA-256

**Files:**
- Create: prototype/src/projectBriefAuthorities.ts
- Modify: prototype/tests/chida-flow.spec.ts:7900+

**Interfaces:**
- Consumes: exact File/Source/Intake snapshots matching Prototype.tsx types at lines 579-645.
- Produces: projectBriefHash, deriveProjectInputTargets, ProjectInputDependencies, ProjectInputTarget, ProjectInputProjectionItem, ProjectInputObservedHead.

- [ ] **Step 1: Add direct-module fixtures and all failing target/hash cases**

Add a browser import helper and a test named exactly:

~~~ts
async function importProjectBriefAuthorities(page: Page) {
  return page.evaluate(async () =>
    Object.keys(await import("/src/projectBriefAuthorities.ts")));
}

test("T9-B2 derives standalone documents and composer intakes once and orders the Brief deterministically", async ({ page }) => {
  await enterBuilderHome(page);
  const exports = await importProjectBriefAuthorities(page);
  expect(exports).toContain("deriveProjectInputTargets");
  const result = await page.evaluate(async () => {
    const domain = await import("/src/projectBriefAuthorities.ts");
    return domain.deriveProjectInputTargets({
      status: "ready",
      projectId: "project-a",
      files: [
        {
          id: "doc-standalone",
          projectId: "project-a",
          displayName: "قرارداد",
          originalName: "contract.pdf",
          mimeType: "application/pdf",
          size: 10,
          category: "قرارداد",
          source: "انتخاب مستقیم از دستگاه",
          status: "ثبت محلی",
          version: 1,
          projectStage: "اسکلت بندی",
          visibility: "خصوصی پروژه",
          storageMode: "metadata-only",
          sourceModifiedAt: null,
          createdAt: "2026-09-03T08:00:00.000Z",
        },
      ],
      sourceEnvelope: {
        schemaVersion: 1,
        envelopeVersion: 0,
        records: [],
        intakes: [],
        updatedAt: null,
      },
      reason: "",
    });
  });
  expect(result.status).toBe("ready");
  expect(result.targets).toHaveLength(1);
  expect(result.targets[0].kind).toBe("project-document");
  expect(result.targets[0].fingerprint).toMatch(/^sha256-[0-9a-f]{64}$/);
});
~~~

Before production code exists, add the second Composer intake and linked-file fixture here too. Assert one intake item, no duplicate standalone file, descending `createdAt`, stable equal-time kind/id order, and changed SHA-256 after changing each of these fields in a table: `intake.sourceIds`, `Source.textContent`, `Source.assetRef`, `Source.contentHash`, `Source.visibility`, `File.displayName`, `File.mimeType`, `File.size`, and `File.storageMode`. Recompute the legacy FNV fixture in every mutated row so upstream data remains parser-valid, and use literal expected ordering rather than the production comparator.

- [ ] **Step 2: Run the test and observe RED**

Run:

~~~bash
cd prototype
npm run test:app -- --grep "T9-B2 derives standalone"
~~~

Expected: the table-driven test FAILS because `/src/projectBriefAuthorities.ts`, `deriveProjectInputTargets`, or the independent SHA behavior does not exist.

- [ ] **Step 3: Implement the exact snapshot types and independent SHA-256 primitive**

Copy the algorithm semantics, not an import dependency, from procurementDispatchSha256Text/procurementDispatchHash. Use UTF-8, recursively sorted object keys, preserved array order, and lowercase 64-hex output:

~~~ts
export function projectBriefHash(value: unknown): Sha256Fingerprint {
  return ("sha256-" + sha256(JSON.stringify(stableValue(value)))) as Sha256Fingerprint;
}
~~~

Define ProjectInputFileSnapshot, ProjectInputSourceSnapshot, ProjectInputIntakeSnapshot, and ProjectInputSourceEnvelopeSnapshot with exact keys matching the current validated runtime records. Do not accept extra keys or normalize values in this module.

- [ ] **Step 4: Implement target derivation**

Implement these exact rules:

~~~ts
function compareDerivedItems(
  first: ProjectInputDerivedItem,
  second: ProjectInputDerivedItem,
) {
  return Date.parse(second.createdAt) - Date.parse(first.createdAt)
    || compareCodePoints(first.target.kind, second.target.kind)
    || compareCodePoints(first.target.id, second.target.id);
}
~~~

The document preimage is the complete exact metadata object. The intake preimage contains the exact intake without its old fingerprint, Source records in intake.sourceIds order without their old fingerprints, text or asset reference, contentHash, eligibility/privacy fields, and linked File/Photo metadata. Exclude an image unless referenced by Composer. Exclude a Composer-linked document as a standalone document. Destination is the asset Source when present, otherwise the first Source id. Fail with unavailable when a Source id, asset record, project/scope, or linkage is missing.

- [ ] **Step 5: Run the focused derivation tests and observe GREEN**

~~~bash
cd prototype
npm run test:app -- --grep "T9-B2 derives standalone"
~~~

Expected: the complete table-driven test PASS.

- [ ] **Step 6: Refactor only while green and rerun the same focused tests**

Remove duplicate fixture builders or private hash plumbing without changing behavior, then rerun the exact Step 5 command and require the complete table-driven test to remain green.

- [ ] **Step 7: Run TypeScript and whitespace checks**

~~~bash
cd prototype
npm exec -- tsc --noEmit
cd ..
git diff --check
~~~

Expected: no TypeScript or whitespace errors.

- [ ] **Step 8: Request a scope/spec review before Task 2**

Reviewer checks only target inclusion, SHA preimages, deterministic order, no upstream store changes, and metadata-only/browser-file boundaries. Resolve every P0/P1/P2 finding before proceeding.

---

### Task 2: T9-B2 Disposition Ledger, Replay, and Concurrency

**Files:**
- Modify: prototype/src/projectBriefAuthorities.ts
- Modify: prototype/tests/chida-flow.spec.ts:after Task 1 tests

**Interfaces:**
- Consumes: ProjectBriefAuthority and ProjectInputDependencies from Task 1.
- Produces: exact envelope/record/revision/event/receipt types, readProjectInputDispositionState, projectInputObservedHeads, executeProjectInputDispositionCommand.

- [ ] **Step 1: Write failing parser/read tests**

Add:

~~~ts
function expectedProjectFoundationIdentityFixtureForBrief() {
  const hash = (value: unknown) => `sha256-${createHash("sha256")
    .update(JSON.stringify(stableTestValue(value))).digest("hex")}`;
  const identity = {
    schemaVersion: 1, objectType: "account-identity", id: "local-builder-account",
    ownerPrincipalType: "account", ownerPrincipalId: "local-builder-account",
    accountSide: "builder", scopeType: "account_private", scopeId: "local-builder-account",
    custodianService: "Identity/Policy", status: "active", version: 1,
  };
  const membership = {
    schemaVersion: 1, objectType: "membership", id: "local-builder-membership",
    principalId: "local-builder-account",
    scope: { type: "account", id: "local-builder-account" }, status: "active", version: 1,
  };
  const roleAssignment = {
    schemaVersion: 1, objectType: "role-assignment", id: "local-builder-owner-role",
    membershipId: "local-builder-membership", role: "owner", status: "active", version: 1,
  };
  const aclSnapshotHash = hash({
    identity, membership, roleAssignment, policyVersion: "builder-prototype-policy:v1",
  });
  const templatePayload = {
    schemaVersion: 1, objectType: "authorization-context-template",
    id: "local-builder-project-private-authorization-template",
    actorPrincipalId: "local-builder-account", identityVersion: 1, accountSide: "builder",
    membershipId: "local-builder-membership", membershipVersion: 1,
    roleAssignmentId: "local-builder-owner-role", roleAssignmentVersion: 1,
    membershipRole: "owner", aclSnapshotHash, policyVersion: "builder-prototype-policy:v1",
    scopeBinding: { scopeType: "project_private", scopeIdSource: "projectId" },
    status: "active", version: 1,
  };
  const authorizationContextTemplate = {
    ...templatePayload, fingerprint: hash(templatePayload),
  };
  const payload = {
    schemaVersion: 1, fixtureVersion: 1, policyVersion: "builder-prototype-policy:v1",
    identity, memberships: [membership], roleAssignments: [roleAssignment],
    authorizationContextTemplate, aclSnapshotHash,
  };
  return { ...payload, fixtureFingerprint: hash(payload) };
}

async function readProjectBriefTestAuthority(page: Page) {
  const raw = await page.evaluate(() => ({
    canonicalRaw: localStorage.getItem("chida-prototype-builder-projects:v3"),
    markerRaw: localStorage.getItem("chida-prototype-builder-projects:v3:cutover:v1"),
    identityRaw: localStorage.getItem("chida-prototype-identity-policy-fixture:v1"),
  }));
  if (!raw.canonicalRaw || !raw.markerRaw || !raw.identityRaw)
    throw new Error("project authority seed is incomplete");
  const expectedFixture = expectedProjectFoundationIdentityFixtureForBrief();
  const expectedIdentityRaw = JSON.stringify(expectedFixture);
  expect(raw.identityRaw).toBe(expectedIdentityRaw);
  expect(JSON.parse(raw.markerRaw)).toMatchObject({ state: "committed" });
  const projectEnvelope = JSON.parse(raw.canonicalRaw);
  const projectIds = projectEnvelope.projects
    .map((project: { id: string }) => project.id).sort();
  expect(projectIds.length).toBeGreaterThan(0);
  const hash = (value: unknown) => `sha256-${createHash("sha256")
    .update(JSON.stringify(stableTestValue(value))).digest("hex")}`;
  const template = expectedFixture.authorizationContextTemplate;
  const authorizationHashes = Object.fromEntries(projectIds.map((projectId: string) => {
    const context = {
      schemaVersion: 1, objectType: "authorization-context",
      id: `authorization-context:${projectId}`,
      templateId: template.id, templateVersion: template.version,
      templateFingerprint: template.fingerprint, actorPrincipalId: template.actorPrincipalId,
      identityVersion: template.identityVersion, accountSide: template.accountSide,
      membershipId: template.membershipId, membershipVersion: template.membershipVersion,
      roleAssignmentId: template.roleAssignmentId,
      roleAssignmentVersion: template.roleAssignmentVersion,
      membershipRole: template.membershipRole, aclSnapshotHash: template.aclSnapshotHash,
      policyVersion: template.policyVersion,
      resolvedScope: { scopeType: "project_private", scopeId: projectId },
      status: "active", version: 1,
    };
    return [projectId, hash(context)];
  }));
  return {
    identityBindingHash: expectedFixture.fixtureFingerprint,
    snapshotHash: hash({
      markerRaw: raw.markerRaw,
      canonicalRaw: raw.canonicalRaw,
      identityRaw: expectedIdentityRaw,
    }),
    projectIds,
    authorizationHashes,
  };
}

test("T9-B2 reads null as byte-stable empty and rejects malformed cross-project policy-drifted ledgers", async ({ page }) => {
  await enterBuilderHome(page);
  const authority = await readProjectBriefTestAuthority(page);
  const before = await page.evaluate(() =>
    window.localStorage.getItem("chida-prototype-project-input-dispositions:v1"));
  expect(before).toBeNull();
  const empty = await page.evaluate(async (currentAuthority) => {
    const domain = await import("/src/projectBriefAuthorities.ts");
    return domain.readProjectInputDispositionState(currentAuthority, {
      status: "ready",
      projectId: currentAuthority.projectIds[0],
      files: [],
      sourceEnvelope: {
        schemaVersion: 1,
        envelopeVersion: 0,
        records: [],
        intakes: [],
        updatedAt: null,
      },
      reason: "",
    });
  }, authority);
  expect(empty.status).toBe("ready");
  expect(empty.envelope?.storeVersion).toBe(0);
  expect(await page.evaluate(() =>
    window.localStorage.getItem("chida-prototype-project-input-dispositions:v1"))).toBeNull();
  await page.evaluate(() =>
    window.localStorage.setItem(
      "chida-prototype-project-input-dispositions:v1",
      "{malformed"));
  const malformed = await page.evaluate(async (currentAuthority) => {
    const domain = await import("/src/projectBriefAuthorities.ts");
    return domain.readProjectInputDispositionState(currentAuthority, {
      status: "ready",
      projectId: currentAuthority.projectIds[0],
      files: [],
      sourceEnvelope: {
        schemaVersion: 1,
        envelopeVersion: 0,
        records: [],
        intakes: [],
        updatedAt: null,
      },
      reason: "",
    });
  }, authority);
  expect(malformed).toMatchObject({ status: "read-error", reason: "malformed-json" });
});
~~~

Call the helper only after `enterBuilderHome`, so the production foundation reader has already accepted the canonical/marker pair. The helper independently reconstructs the immutable compiled identity/policy fixture, requires exact stored bytes, and never accepts a mutable stored `fixtureFingerprint` as its own proof.

Extend the same table-driven test with these exact reason contracts: malformed-json, envelope-shape-invalid, duplicate-record, duplicate-receipt, chronology-invalid, scope-mismatch, identity-mismatch, authorization-mismatch, and target-missing.

- [ ] **Step 2: Run parser tests and observe RED**

~~~bash
cd prototype
npm run test:app -- --grep "T9-B2 reads null"
~~~

Expected: FAIL because the disposition state reader and exact parser are absent.

- [ ] **Step 3: Implement the canonical ledger**

Use these invariants:

~~~ts
type ProjectInputDispositionSnapshot = {
  target: ProjectInputTarget;
  status: "pending" | "resolved";
};

type ProjectInputDispositionCommand = {
  inputSchemaVersion: 1;
  action: "resolve-input" | "reopen-input";
  projectId: string;
  target: ProjectInputTarget;
  expectedStoreVersion: number;
  expectedDispositionVersion: number | null;
  idempotencyKey: string;
};
~~~

Null storage yields an in-memory envelope with storeVersion 0 and no write. First successful mutation writes storeVersion 1. Record id, revision id, event id, and receipt linkage are deterministic and replayable. Record/event/revision/receipt bind the exact authorizationContextHash; envelope binds identityBindingHash. Parser replays every receipt to its exact event/revision and requires the current revision to be last.

The ready projection applies the final presentation order only after effective status is known: pending-stale first, then pending; target createdAt descending; kind and id ascending; truncate only in the Brief renderer after this complete sort.

- [ ] **Step 4: Write all failing resolve/reopen/idempotency/fault/concurrency tests**

Add tests named:

- T9-B2 resolves reloads reopens and isolates dispositions by project
- T9-B2 keeps no-op bytes stable and retries the same command idempotently
- T9-B2 makes a changed resolved target pending-stale with a fresh SHA-256 preimage

The tests must compare raw localStorage bytes, record/store versions, history length, receipt length, active project id, and effective status.

Use this concrete happy-path skeleton in the first test, then mutate one target preimage and repeat the read for the stale assertion:

~~~ts
function makeReadyProjectInputDependencies(projectId: string) {
  return {
    status: "ready" as const,
    projectId,
    files: [{
      id: "doc-a", projectId, displayName: "قرارداد الف", originalName: "a.pdf",
      mimeType: "application/pdf", size: 10, category: "قرارداد",
      source: "انتخاب مستقیم از دستگاه", status: "ثبت محلی", version: 1 as const,
      projectStage: "اسکلت بندی", visibility: "خصوصی پروژه" as const,
      storageMode: "metadata-only" as const, sourceModifiedAt: null,
      createdAt: "2026-09-03T08:00:00.000Z",
    }],
    sourceEnvelope: {
      schemaVersion: 1 as const, envelopeVersion: 0,
      records: [], intakes: [], updatedAt: null,
    },
    reason: "" as const,
  };
}

const authority = await readProjectBriefTestAuthority(page);
const projectId = authority.projectIds[0];
const dependencies = makeReadyProjectInputDependencies(projectId);
const result = await page.evaluate(async ({ currentAuthority, currentDependencies }) => {
  const domain = await import("/src/projectBriefAuthorities.ts");
  const target = domain.deriveProjectInputTargets(currentDependencies).targets?.[0];
  if (!target) throw new Error("target fixture is missing");
  const resolveCommand = {
    inputSchemaVersion: 1 as const,
    action: "resolve-input" as const,
    projectId: currentDependencies.projectId,
    target,
    expectedStoreVersion: 0,
    expectedDispositionVersion: null,
    idempotencyKey: "resolve-a",
  };
  const resolved = await domain.executeProjectInputDispositionCommand(
    resolveCommand,
    () => currentAuthority,
    async () => currentDependencies,
  );
  const resolvedBytes = localStorage.getItem("chida-prototype-project-input-dispositions:v1");
  const replayed = await domain.executeProjectInputDispositionCommand(
    resolveCommand,
    () => currentAuthority,
    async () => currentDependencies,
  );
  const replayedBytes = localStorage.getItem("chida-prototype-project-input-dispositions:v1");
  const reopened = await domain.executeProjectInputDispositionCommand({
    ...resolveCommand,
    action: "reopen-input",
    expectedStoreVersion: 1,
    expectedDispositionVersion: 1,
    idempotencyKey: "reopen-a",
  }, () => currentAuthority, async () => currentDependencies);
  const reread = domain.readProjectInputDispositionState(currentAuthority, currentDependencies);
  return { resolved, resolvedBytes, replayed, replayedBytes, reopened, reread };
}, { currentAuthority: authority, currentDependencies: dependencies });
expect(result.resolved.status).toBe("resolved");
expect(result.resolved.envelope).toMatchObject({ storeVersion: 1 });
expect(result.resolved.envelope?.records[0]).toMatchObject({ version: 1 });
expect(result.resolved.envelope?.records[0].history).toHaveLength(1);
expect(result.resolved.envelope?.idempotencyReceipts).toHaveLength(1);
expect(result.replayed.status).toBe("resolved");
expect(result.replayedBytes).toBe(result.resolvedBytes);
expect(result.reopened.status).toBe("reopened");
expect(result.reopened.envelope).toMatchObject({ storeVersion: 2 });
expect(result.reopened.envelope?.records[0]).toMatchObject({ version: 2 });
expect(result.reread.items[0].effectiveStatus).toBe("pending");
~~~

The helper's project id comes from the live compiled fixture, and each isolation assertion reruns the same sequence against a second real project id rather than inventing an authorization hash.

Add the failure/race cases before implementing the writer:

| Test | Fixture and action | Required assertions |
|---|---|---|
| T9-B2 rejects stale versions and serializes concurrent tabs | In two pages with a shared real project, hold `projectInputDispositionsWriteLockName`, start two distinct resolve commands from store 0/record null, then release | exactly one resolves; the other returns version-conflict or dependency-stale; one record/revision/receipt exists and parses after both pages reload |
| T9-B2 rolls back only owned candidate bytes after write or readback failure | From known-good raw bytes, separately inject setItem failure, getItem mismatch after candidate write, and a competing replacement before rollback | owned candidate restores byte-exact old content; competing bytes are never overwritten; no case returns resolved/reopened |
| T9-B2 fails closed for missing pinned targets and unreadable or tampered dependencies | Resolve a target, then remove it, return unavailable dependencies, and change one target field without recomputing its complete dependency semantics | reader/mutation returns unavailable/dependency-read-failure/dependency-stale as appropriate; no empty fallback, receipt, revision, or byte change occurs |

Run the complete mutation batch now, before Step 5:

~~~bash
cd prototype
npm run test:app -- --grep "T9-B2 resolves|T9-B2 keeps no-op|T9-B2 makes a changed|T9-B2 rejects stale|T9-B2 rolls back|T9-B2 fails closed"
~~~

Expected: every test FAILS at the missing writer/replay/concurrency behavior, not from fixture or environment errors.

- [ ] **Step 5: Implement mutation with one lock and commit-time rereads**

The critical section order is:

~~~ts
validateCommandShape();
await withWebLock(projectInputDispositionsWriteLockName, async () => {
  const authority = getAuthority();
  const dependencies = await getDependencies(command.projectId);
  const current = readProjectInputDispositionState(authority, dependencies);
  validateExpectedVersionsBeforeIdempotency(current, command);
  replayReceiptOrBuildCandidate();
  writeCandidate();
  exactReadback();
  recheckAuthorityDependenciesAndCandidateOwnership();
  publishResultOnlyAfterVerifiedReadback();
});
~~~

Do not take the File/Source lock inside this lock. Dependencies are fresh read-only snapshots. On failed write/readback, restore only the exact previous bytes when current bytes still equal this command’s candidate; otherwise return read-failure without overwriting another writer.

- [ ] **Step 6: Run the already-red fault/concurrency and mutation tests**

Run:

~~~bash
cd prototype
npm run test:app -- --grep "T9-B2 resolves|T9-B2 keeps no-op|T9-B2 makes a changed|T9-B2 rejects stale|T9-B2 rolls back|T9-B2 fails closed"
~~~

Expected: all T9-B2 ledger tests PASS.

- [ ] **Step 7: Run the complete T9-B2 domain group**

~~~bash
cd prototype
npm run test:app -- --grep "T9-B2"
~~~

Expected: every T9-B2 test PASS with zero retries/skips.

- [ ] **Step 8: Request a data-integrity review**

Reviewer checks exact parser keys, SHA-256 at every new persisted layer, receipt replay, authority binding, no-op byte stability, stale-before-idempotency ordering, lock/reread order, and rollback ownership. Resolve every P0/P1/P2 finding before Task 3.

---

### Task 3: T9-B2 File/Source Actions and Fourth Brief Section

**Files:**
- Modify: prototype/src/Prototype.tsx:297-307, 14446-15083, 15154-15172, 15729-15810, 18228-18642, 23723-24098, 24474-24553
- Modify: prototype/src/prototype.css:2955-3218, 3689-3738, 4274-4335, 4852-4907
- Modify: prototype/tests/chida-flow.spec.ts:after Task 2 tests

**Interfaces:**
- Consumes: Task 2 state, projections, destinations, and mutation result.
- Produces: ready-only runtime adapter, disposition React state, File/Source controls, brief.inputs, exact navigation, storage/focus/project reconciliation.

- [ ] **Step 1: Write the failing end-to-end UI test**

Add:

~~~ts
test("T9-B2 Brief items open the exact File or Composer Source detail and isolate partial failure at 390x844", async ({ page }) => {
  const consoleFailures: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning")
      consoleFailures.push(message.text());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-files-entry").click();
  await page.getByTestId("project-file-input").setInputFiles({
    name: "قرارداد بریف.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF T9-B2 standalone"),
  });
  await page.getByTestId("project-file-register").click();
  await page.getByTestId("project-files-back").click();
  await page.getByTestId("project-space-back").click();
  await page.getByTestId("composer-input").fill("ورودی Composer برای بریف");
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({
    name: "صورت وضعیت بریف.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF T9-B2 composer"),
  });
  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("composer-intake-message"))
    .toContainText("ورودی Composer برای بریف");
  await openLiveBriefFromHome(page);
  await expect(page.getByTestId("brief-inputs-section")).toContainText(
    "اسناد و ورودی‌های تعیین‌تکلیف‌نشده");
  await expect(page.getByTestId("brief-input-item")).toHaveCount(2);
  const standaloneItem = page.getByTestId("brief-input-item")
    .filter({ hasText: "قرارداد بریف" });
  await standaloneItem.click();
  await expect(page.getByTestId("project-file-detail-sheet"))
    .toContainText("قرارداد بریف");
  await page.keyboard.press("Escape");
  await page.getByTestId("project-files-back").click();
  await page.getByTestId("project-space-back").click();
  await openLiveBriefFromHome(page);
  const intakeItem = page.getByTestId("brief-input-item")
    .filter({ hasText: "ورودی Composer" });
  await intakeItem.click();
  await expect(page.getByTestId("composer-source-detail"))
    .toContainText("ورودی Composer");
  await page.getByTestId("composer-source-close").click();
  expect(await page.getByTestId("brief-panel").evaluate(
    (element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(consoleFailures).toEqual([]);
});
~~~

Before any Task 3 production wiring, add these cases and observe them fail for the missing UI/adapter behavior:

| Test | Fixture and action | Required assertions |
|---|---|---|
| T9-B2 lets metadata-only documents resolve without claiming content and blocks browser files until assets reconcile | Seed one exact parser-valid `metadata-only` document and one `browser-file` document whose IndexedDB Blob is initially absent; open Brief, resolve the metadata-only item, then complete the existing Blob reconciliation for the browser file and reopen Brief | metadata-only action is enabled and its copy says only metadata is available; it never says content/authenticity was verified; browser-file action is disabled while reconciliation is pending/missing and enabled only after a matching Blob SHA is reread |
| T9-B2 keeps the first three Brief sections healthy when disposition is unreadable | Seed `{malformed` under `projectInputDispositionsStorageKey` and open Brief | `brief-inputs-section` shows only its scoped error while the three T9-B1 sections retain their same items/counts; no mutation rewrites the malformed bytes |
| T9-B2 refreshes disposition on storage focus reload and project switch without automatic writes | Capture all localStorage bytes, open/close Brief, dispatch a storage event, blur/focus and reload, then switch to a second real project and back | every read-only trigger leaves bytes exactly equal; active-project items change correctly; no disposition record appears until an explicit resolve/reopen click |

- [ ] **Step 2: Run the UI test and observe RED**

~~~bash
cd prototype
npm run test:app -- --grep "T9-B2 Brief items|T9-B2 lets metadata-only|T9-B2 keeps the first three|T9-B2 refreshes disposition"
~~~

Expected: all four tests FAIL because the fourth section, runtime adapter, reconciliation gating, or disposition controls are absent.

- [ ] **Step 3: Build the ready-only dependency adapter and reconciliation state**

Use projectTaskAuthoritySnapshot’s structural authority values; do not cache them as ledger truth. Build ProjectInputDependencies only from exact parsed File/Source state and healthy asset checks. Add an explicit direct-file reconciliation pending flag so the action never becomes transiently enabled between source validation and missing-file cleanup.

The unavailable expression includes:

~~~ts
const projectInputsLocked =
  projectFilesReadError
  || projectSourcesReadError
  || sourceRecoveryPending
  || sourceRecoveryBlocked
  || sourceAssetValidationPending
  || projectFileContentReconciliationPending;
~~~

Mount/focus/visibility/storage/project-switch refresh must reread the sidecar and current dependencies. Storage keys include disposition, Files, Sources, intake intent, project foundation canonical/marker, and identity fixture.

- [ ] **Step 4: Wire exact mutation and navigation handlers**

Add one handler that captures the current project, target, expected versions, and a stable attempt id. Keep the File/Source sheet open on stale/write/readback failure.

Navigation rules:

~~~ts
if (destination.kind === "project-document") {
  openProjectFiles("chat", destination.fileId);
} else {
  setSelectedSourceId(destination.sourceId);
  onOpenSheet("source-detail");
}
~~~

Composer-linked files never receive a duplicate File action. A standalone File and its detail receive data-testid values project-file-disposition-status and project-file-disposition-action. Source intake detail receives project-source-disposition-status and project-source-disposition-action.

- [ ] **Step 5: Add the fourth Brief section and Persian copy**

Extend LiveBriefSnapshot with inputs. Render:

- title: اسناد و ورودی‌های تعیین‌تکلیف‌نشده
- statuses: نیازمند تعیین‌تکلیف / تعیین‌تکلیف شده / بعد از بررسی تغییر کرده
- actions: تعیین‌تکلیف شد / بازکردن دوباره
- section error: اطلاعات اسناد و ورودی‌ها در دسترس نیست؛ وضعیت قبلی دست‌نخورده ماند.

Render at most the first three already-sorted projection items. Remove only the input-disposition half of the old deferred note; keep last-visit changes deferred until Task 6.

- [ ] **Step 6: Run the already-red asset/partial-failure tests and observe GREEN**

~~~bash
cd prototype
npm run test:app -- --grep "T9-B2 lets metadata-only|T9-B2 keeps the first three|T9-B2 refreshes disposition"
~~~

Expected: all three tests PASS only after the Task 3 adapter/UI implementation exists.

- [ ] **Step 7: Run T9-B1 plus T9-B2 and build**

~~~bash
cd prototype
npm run test:app -- --grep "T9-B1 live Brief|T9-B2"
npm run build
npm run check:runtime
cd ..
git diff --check
~~~

Expected: focused Brief suite, TypeScript/Vite/Sites preparation, all 28 protected runtime checks, and whitespace PASS.

- [ ] **Step 8: Perform a 390 x 844 T9-B2 review**

Verify real File/Source routes, resolve/reopen/stale copy, exact focus return, vertical scroll, zero document/panel horizontal overflow, zero console warning/error, and no external request. Request code/spec review and resolve all P0/P1/P2 findings before Task 4.

---

### Task 4: T9-B3 Independent Observed Heads and Fail-Closed Delta

**Files:**
- Modify: prototype/src/projectBriefAuthorities.ts
- Modify: prototype/src/Prototype.tsx import/type area around 44-188 and adapter/state sites around 15104-15172
- Read only: prototype/src/Prototype.tsx:8115-11410; consume the existing parser-validated records without editing those upstream parsers or writers
- Modify: prototype/tests/chida-flow.spec.ts:after T9-B2 tests

**Interfaces:**
- Consumes: parser-validated current records assembled by Prototype.tsx and every complete Task 3 project-input observed head.
- Produces: buildProjectBriefObservation and projectVisitDeltaForObservation.

- [ ] **Step 1: Write failing six-kind digest tests**

Add:

~~~ts
test("T9-B3 digest adapters change independent SHA heads for every in-scope field across all six kinds", async ({ page }) => {
  await enterBuilderHome(page);
  const result = await page.evaluate(async () => {
    const domain = await import("/src/projectBriefAuthorities.ts");
    return domain.buildProjectBriefObservation("project-a", [
      {
        status: "ready",
        kind: "purchase-request",
        id: "request-a",
        projectId: "project-a",
        version: 1,
        state: "draft",
        semanticPreimage: { rawNeed: { text: "سیمان" }, items: [] },
        dependencyCapsule: null,
        reason: "",
      },
    ], []);
  });
  expect(result.status).toBe("ready");
  expect(result.observation?.heads[0].fingerprint)
    .toMatch(/^sha256-[0-9a-f]{64}$/);
});
~~~

Inside the same page.evaluate call, use this mutation table and compare one-head observations before/after:

~~~ts
const cases = [
  { kind: "manual-task", state: "in-progress", before: { title: "الف", fingerprint: "fnv1a-deadbeef" }, after: { title: "ب", fingerprint: "fnv1a-deadbeef" } },
  { kind: "backbone-task", state: "in-progress", before: { nextStep: "الف", fingerprint: "fnv1a-deadbeef" }, after: { nextStep: "ب", fingerprint: "fnv1a-deadbeef" } },
  { kind: "content-approval", state: "pending", before: { snapshot: { status: "pending", note: "الف" }, fingerprint: "sha256-" + "1".repeat(64) }, after: { snapshot: { status: "pending", note: "ب" }, fingerprint: "sha256-" + "1".repeat(64) } },
  { kind: "dispatch-plan-approval", state: "pending", before: { payload: { text: "الف" }, planFingerprint: "fnv1a-deadbeef" }, after: { payload: { text: "ب" }, planFingerprint: "fnv1a-deadbeef" } },
  { kind: "purchase-request", state: "draft", before: { rawNeed: { text: "الف" }, items: [] }, after: { rawNeed: { text: "ب" }, items: [] } },
] as const;
for (const item of cases) {
  const first = domain.buildProjectBriefObservation("project-a", [{
    status: "ready", kind: item.kind, id: item.kind + "-a",
    projectId: "project-a", version: 1, state: item.state,
    semanticPreimage: item.before, dependencyCapsule: null, reason: "",
  }], []);
  const second = domain.buildProjectBriefObservation("project-a", [{
    status: "ready", kind: item.kind, id: item.kind + "-a",
    projectId: "project-a", version: 1, state: item.state,
    semanticPreimage: item.after, dependencyCapsule: null, reason: "",
  }], []);
  if (first.status !== "ready" || second.status !== "ready")
    throw new Error("digest fixture must be ready");
  if (first.observation.observationFingerprint === second.observation.observationFingerprint)
    throw new Error(item.kind + " semantic mutation was hidden");
}
const inputBefore = domain.projectBriefHash({ target: { id: "input-a", value: "الف" }, state: "pending" });
const inputAfter = domain.projectBriefHash({ target: { id: "input-a", value: "ب" }, state: "pending" });
if (inputBefore === inputAfter) throw new Error("project-input semantic mutation was hidden");
~~~

- [ ] **Step 2: Run digest tests and observe RED**

~~~bash
cd prototype
npm run test:app -- --grep "T9-B3 digest adapters"
~~~

Expected: FAIL because observation/digest APIs are absent.

- [ ] **Step 3: Implement the semantic preimage contract**

For the five upstream kinds, Prototype.tsx supplies raw validated semantics:

| Kind | Required preimage |
|---|---|
| manual-task | complete ProjectTaskRecord and current revision after parser success |
| backbone-task | complete ProjectBackboneTaskRecord and current revision |
| content-approval | complete ProjectApprovalRecord plus materialized target request/review revision |
| dispatch-plan-approval | complete record, effective state, and the exact valid request/content approval/draft/contact dependency capsule consumed by canonical status |
| purchase-request | authoritative rawNeed/items/service/delivery/unresolved terms/clarifications/review revisions/migration/status/version/timestamps/history/receipts; compatibility item mirror validated upstream but not a second authority |

The module recursively drops stored fingerprint evidence from semanticPreimage and dependencyCapsule while preserving real contentHash. It hashes raw semantics, not old hashes. Any adapter loading/unavailable state or missing raw reference makes the whole observation loading/unavailable. Project-input heads are consumed directly and are never truncated or rebuilt from the visible three-item list.

- [ ] **Step 4: Write failing delta tests**

Add these concrete cases:

| Test | Fixture and action | Required assertions |
|---|---|---|
| T9-B3 delta sorts heads groups only added and updated and fails closed on an absent baseline head | Build a literal baseline with one head in every group; supply the same heads in reverse order, one new head, and one changed full-SHA head; then repeat with one baseline key omitted from current observation and no tombstone | ready result is canonical kind+id order; only the literal new head contributes `added=1`; only the changed head contributes `updated=1`; no `removed` property exists; omitted baseline head returns `{ status: "unavailable", reason: "baseline-head-missing" }` |
| T9-B3 keeps resolved project-input heads outside the visible pending projection | Resolve a literal input target, derive both `state.items` and `projectInputObservedHeads(state)`, then build an observation | the resolved item is absent from the visible pending-only Brief projection but exactly one `project-input` head with `state: "resolved"` remains in the observation |

Run both delta tests now, before Step 5:

~~~bash
cd prototype
npm run test:app -- --grep "T9-B3 delta sorts|T9-B3 keeps resolved"
~~~

Expected: both tests FAIL for the absent delta/observation behavior.

- [ ] **Step 5: Implement observation and delta**

The observation fingerprint is SHA-256 of:

~~~ts
{
  projectId,
  observationSchemaVersion: 1,
  heads: [...heads].sort(compareKindThenId),
}
~~~

Delta behavior:

~~~ts
if (!currentByKey.has(baselineKey)) {
  return { status: "unavailable", reason: "baseline-head-missing" };
}
if (!baselineByKey.has(currentKey)) added.push(currentHead);
else if (!headsEqual(baselineHead, currentHead)) updated.push(currentHead);
~~~

Groups are کارها, تصمیم‌ها, خریدها, and اسناد و ورودی‌ها. Do not rank or infer importance.

- [ ] **Step 6: Run digest/delta tests and combined T9-B2 domain tests**

~~~bash
cd prototype
npm run test:app -- --grep "T9-B2 derives standalone|T9-B3 digest adapters|T9-B3 delta|T9-B3 keeps resolved"
~~~

Expected: all tests PASS.

- [ ] **Step 7: Request digest/delta review**

Reviewer verifies raw preimage completeness, no stored-fingerprint shortcut, dispatch dependency materialization, resolved input head retention, deterministic ordering, project isolation, and missing-head fail-close semantics.

---

### Task 5: T9-B3 Checkpoint Ledger, Explicit Visits, and Concurrency

**Files:**
- Modify: prototype/src/projectBriefAuthorities.ts
- Modify: prototype/tests/chida-flow.spec.ts:after Task 4 tests

**Interfaces:**
- Consumes: ProjectBriefAuthority and ready ProjectBriefObservationState from Task 4.
- Produces: readProjectVisitCheckpointState, projectVisitDeltaForObservation, executeProjectVisitCheckpointCommand, exact checkpoint state/result types.

- [ ] **Step 1: Write failing empty/parser tests**

Add these concrete cases:

| Test | Fixture and action | Required assertions |
|---|---|---|
| T9-B3 authority reads a canonical empty checkpoint state without writing | Use `readProjectBriefTestAuthority(page)`, assert the checkpoint key is null, call `readProjectVisitCheckpointState(authority)`, and reread raw storage | ready envelope has `storeVersion: 0`, empty records/receipts, correct live identity binding, and raw storage remains null |
| T9-B3 authority rejects malformed forged-scope identity-drifted and authorization-drifted envelopes | Starting from one known-good literal envelope, table-mutate malformed JSON, one extra/missing key, duplicate record, duplicate receipt, non-contiguous revision version, reversed chronology, wrong currentRevisionId, invalid SHA, wrong project/scope, wrong identity binding, and wrong live authorization hash | every row returns `status: "read-error"` with the documented reason; original bytes remain byte-identical and no fallback envelope is written |

- [ ] **Step 2: Run parser tests and observe RED**

~~~bash
cd prototype
npm run test:app -- --grep "T9-B3 authority"
~~~

Expected: FAIL because checkpoint parser/read APIs are absent.

- [ ] **Step 3: Implement exact checkpoint envelope and replay**

Persist zero or one record per project. Snapshot is exactly:

~~~ts
type ProjectVisitCheckpointSnapshot = {
  observedAt: string;
  observationSchemaVersion: 1;
  heads: ProjectBriefObservedHead[];
  observationFingerprint: Sha256Fingerprint;
};
~~~

Envelope binds identityBindingHash. Record/event/revision/receipt bind authorizationContextHash. Parser proves deterministic record/revision/event ids, contiguous versions, chronology, command payload, receipt linkage, observed head order, and every SHA-256.

- [ ] **Step 4: Write failing mutation tests**

Add these concrete cases:

| Test | Fixture and action | Required assertions |
|---|---|---|
| T9-B3 checkpoint command records first baseline and an explicit later visit | Execute `record-baseline` at store 0/record null with literal observation A, then `mark-all-seen` at store 1/record 1 with the same heads and a later controlled clock | first result is recorded at version 1; second is recorded at version 2; history/revisions/receipts are 2; `observedAt` increases even though heads are equal |
| T9-B3 checkpoint command replays one idempotency key without duplicate revision | Execute the exact first command twice and compare raw bytes | both results are recorded, raw bytes are equal, and store/record/history/receipt counts stay 1 |
| T9-B3 checkpoint command rejects stale versions observations and changed payloads | Retry with wrong expected store, wrong expected record, changed observation fingerprint, then same idempotency key with a different action | statuses are respectively version-conflict/dependency-stale/idempotency-payload-mismatch as applicable; all raw bytes remain equal to the last committed bytes |
| T9-B3 checkpoint command preserves old bytes on write readback and rollback failure | Inject separate setItem failure, exact-readback mismatch, and candidate-owned rollback failure around a valid second command | none returns recorded; successful owned rollback restores exact old bytes; rollback failure returns write-failure without overwriting bytes that no longer equal this command's candidate |

Before implementing the writer, add two-page tests for both concurrent first baselines and concurrent mark-seen commands. Hold `projectVisitCheckpointsWriteLockName` in page A, start page B with a distinct idempotency key and the same expected versions, then release. Each test must initially fail because serialization is absent and must ultimately assert exactly one `recorded`, exactly one `version-conflict` or `dependency-stale`, one new revision/receipt total, no lost update, and exact parser-valid bytes after reload in both pages.

Run the complete mutation/concurrency batch now, before Step 5:

~~~bash
cd prototype
npm run test:app -- --grep "T9-B3 checkpoint command|T9-B3 serializes"
~~~

Expected: every test FAILS at the missing checkpoint writer/lock behavior, not from fixture or environment errors.

- [ ] **Step 5: Implement checkpoint mutation**

Inside projectVisitCheckpointsWriteLockName:

1. Validate command shape.
2. Reread fresh authority.
3. Rebuild the complete observation from fresh adapters.
4. Require exact expectedObservationFingerprint before idempotency.
5. Require expected store/record versions.
6. Replay exact receipt or construct one new revision.
7. Write candidate, exact readback, authority/observation/candidate ownership recheck.
8. Roll back only candidate-owned bytes on failure.

Never take an upstream domain lock under the checkpoint lock.

- [ ] **Step 6: Run the already-red checkpoint and multi-tab tests**

Run:

~~~bash
cd prototype
npm run test:app -- --grep "T9-B3 authority|T9-B3 checkpoint command|T9-B3 serializes"
~~~

Expected: all checkpoint storage/mutation/concurrency tests PASS.

- [ ] **Step 7: Request authority/concurrency review**

Reviewer verifies strict keys, authority binding, parser replay, observation freshness, expected-version-before-idempotency order, equal-head explicit visit semantics, lock order, exact readback, and candidate-owned rollback.

---

### Task 6: T9-B3 Fifth Brief Section and Explicit Checkpoint UX

**Files:**
- Modify: prototype/src/Prototype.tsx:297-307, 14446-15210, 18634-18642, 24474-24553
- Modify: prototype/src/prototype.css:4274-4335 and 4852-4907
- Modify: prototype/tests/chida-flow.spec.ts:after Task 5 tests

**Interfaces:**
- Consumes: ready observations, checkpoint state/delta, and checkpoint mutation from Task 5.
- Produces: Brief changes section, first-baseline/mark-seen actions, exact group navigation, and refresh behavior.

- [ ] **Step 1: Write the failing read-only/first-visit UI test**

Add:

~~~ts
test("T9-B3 open Brief stays byte-read-only and records the first baseline only on explicit action", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const before = await allLocalStorageBytes(page);
  await openLiveBriefFromHome(page);
  await expect(page.getByTestId("brief-changes-section"))
    .toContainText("هنوز مبنای قبلی ثبت نشده");
  expect(await allLocalStorageBytes(page)).toEqual(before);
  await page.getByTestId("brief-changes-baseline-button").click();
  await expect(page.getByTestId("brief-changes-mark-seen-button")).toBeVisible();
  expect(await page.evaluate(() =>
    window.localStorage.getItem("chida-prototype-project-visit-checkpoints:v1")))
    .not.toBeNull();
});
~~~

Before Task 6 production wiring, add these end-to-end cases and observe each fail for the missing fifth-section behavior:

| Test | Fixture and action | Required assertions |
|---|---|---|
| T9-B3 shows added and updated groups after an explicit baseline and clears them only after mark-seen commit | Record a baseline, then make one literal allowed change in each of tasks/decisions/procurement/inputs and add one second record; open Brief, click mark-seen, and reread | before click, each expected group exposes exact added/updated counts; opening alone preserves baseline bytes; after verified commit, all counts are zero and checkpoint version increments once |
| T9-B3 leaves baseline unchanged on stale dependency unreadable dependency and checkpoint write failure | Independently mutate a dependency after click capture, corrupt one allowlisted upstream store, and inject checkpoint setItem failure | action reports scoped failure, previous checkpoint raw bytes are identical, and `observedAt` does not advance |
| T9-B3 stays isolated across project switch reload storage event and focus | Create a second real project, record distinct baselines, switch/reload/dispatch storage/blur-focus/visibility triggers | each project renders only its own delta and none of the read triggers change either record or `observedAt` |
| T9-B3 keeps healthy T9-B1 and T9-B2 sections visible when checkpoint is unreadable | Corrupt only the checkpoint sidecar and open Brief | `brief-changes-section` shows its unavailable copy; all T9-B1 sections and the T9-B2 section keep their prior items/counts; corrupt bytes remain untouched |
| T9-B3 remains RTL console-clean and overflow-free at 390x844 | Exercise first baseline, one delta group navigation, and mark-seen with console/pageerror/request listeners | document and `brief-panel` horizontal overflow are zero, vertical scroll reaches all controls, no warning/error/pageerror occurs, and no external request is emitted |

Also create a baseline whose one head is later absent without a valid tombstone and assert the section is unavailable with no removed count. Capture `observedAt` before schedule save, Brief open, reload, focus, and visibility triggers and assert literal equality after every trigger.

- [ ] **Step 2: Run the UI test and observe RED**

~~~bash
cd prototype
npm run test:app -- --grep "T9-B3 open Brief|T9-B3 shows added|T9-B3 leaves baseline|T9-B3 stays isolated|T9-B3 keeps healthy|T9-B3 remains RTL"
~~~

Expected: all six tests FAIL because the fifth section, runtime adapters, explicit actions, or scoped failure behavior are absent.

- [ ] **Step 3: Assemble ready-only adapters in Prototype.tsx**

Use fresh current records from existing validated states:

- manual tasks from readProjectTaskState authority-bound records;
- active project Backbone task and current revision;
- content approvals plus exact target request/review revision;
- dispatch-plan approvals only when contacts/drafts/plans and dependency capsule are ready;
- purchase requests from authoritative records;
- every T9-B2 input observed head, including resolved.

If any allowlisted dependency is loading/unavailable, observation and checkpoint action are loading/unavailable. Keep B1 and B2 sections independently visible.

- [ ] **Step 4: Wire checkpoint state and refresh triggers**

Read checkpoint state on mount and whenever checkpoint storage, an allowlisted upstream store, project foundation, identity fixture, focus, visibility, reload, or active project changes. These are reads only. The explicit click captures expectedObservationFingerprint, expected versions, and a stable attempt id; sheet remains open on stale/failure.

- [ ] **Step 5: Render the fifth section**

Use:

- title: تغییرات از آخرین مراجعه
- first state: هنوز مبنای قبلی ثبت نشده
- first action: ثبت وضعیت فعلی به‌عنوان مبنا
- later action: همه را دیدم
- failure: تغییرات فعلاً قابل‌محاسبه نیست؛ مبنای قبلی دست‌نخورده ماند.

Show grouped added/updated counts only. Change the overall preview label from “فقط خواندنی” to “خلاصهٔ زندهٔ محلی”; keep opening the sheet read-only. Remove the remaining deferred note after this section is real.

- [ ] **Step 6: Run the already-red end-to-end delta and failure tests**

~~~bash
cd prototype
npm run test:app -- --grep "T9-B3 shows added|T9-B3 leaves baseline|T9-B3 stays isolated|T9-B3 keeps healthy|T9-B3 remains RTL"
~~~

Expected: all five tests PASS only after the fifth-section implementation exists.

- [ ] **Step 7: Run the complete combined focused suite**

~~~bash
cd prototype
npm run test:app -- --grep "T9-B1 live Brief|T9-B2|T9-B3"
npm run build
npm run check:runtime
cd ..
git diff --check
~~~

Expected: all Brief tests PASS, build/TypeScript/Vite/Sites preparation PASS, 28 protected runtime files PASS, and whitespace clean.

- [ ] **Step 8: Perform real mobile QA and request final code review**

At 390 x 844, verify pending document/intake, metadata-only, browser-file error, resolve/reopen/stale, stable three-item order, first baseline, added/updated delta, mark-seen, reload, project switch, partial failure, focus return, vertical scroll, zero root/panel overflow, zero console warning/error, and zero external request. Review the complete diff for P0/P1/P2 findings and resolve every finding before documentation freeze.

---

### Task 7: Documentation, Candidate Freeze, and Focused Evidence

**Files:**
- Modify: BUILDER-FEATURE-BACKLOG-FA.md:88-91
- Modify: CHIDA-CONTINUATION-HANDOFF-FA.md:3-7 and 795+
- Modify: CHIDA-PRODUCT-LEARNINGS-FA.md:2149+
- Modify only if a reviewed defect requires it: prototype/src/projectBriefAuthorities.ts, prototype/src/Prototype.tsx, prototype/src/prototype.css, prototype/tests/chida-flow.spec.ts

**Interfaces:**
- Consumes: reviewed T9-B2/T9-B3 implementation and focused/mobile evidence.
- Produces: frozen candidate bytes and a truthful pre-release handoff. It does not yet produce a release receipt.

- [ ] **Step 1: Update the learning log before handoff**

Add one dated entry with four visibly separate subsections:

1. تجربهٔ مشاهده‌شده
2. شکاف یا ابهام سند مادر
3. تصمیم و وضعیت
4. پیشنهاد اصلاح سند مادر

State that explicit disposition and explicit checkpoints are local/private sidecar authorities; opening Brief is read-only; no backend/model/network/report/notification exists; and the product-definition amendment remains a proposal because CHIDA-Product-Definition-FA.md is unchanged.

- [ ] **Step 2: Update backlog and continuation handoff**

Record T9-B2 and T9-B3 acceptance, exact store keys, failure boundaries, focused test/QA evidence, and combined publication authorization. Keep Builder Gate historical status unchanged. State that dynamic deployment ids are not written before they exist.

- [ ] **Step 3: Run the final focused development evidence once**

~~~bash
cd prototype
npm run test:app -- --grep "T9-B1 live Brief|T9-B2|T9-B3"
npm run build
npm run check:runtime
cd ..
git diff --check
~~~

Expected: focused Brief tests, build, TypeScript, Sites preparation, runtime integrity, and whitespace PASS on the final bytes.

- [ ] **Step 4: Verify candidate scope**

~~~bash
git status --short
git diff --stat
git diff --check
git diff -- prototype/src/App.tsx prototype/src/main.tsx prototype/src/styles.css prototype/src/mobile prototype/vite.config.ts prototype/worker/index.js prototype/scripts/prepare-sites-build.mjs
~~~

Expected: only the planned module/UI/CSS/test/docs are changed; protected-runtime diff is empty.

- [ ] **Step 5: Freeze**

After the final review and checks, stop editing tracked bytes. Record the focused test count, build/runtime result, QA viewport/result, console/overflow result, and reviewed file list outside tracked files for the release handoff.

---

### Task 8: One Full Gate and Same-SHA Publication

**Precondition:** Tasks 1-7 are complete, candidate bytes are frozen, the user’s approved design and combined-publication request still match the candidate, and no new scope has entered the tree.

**Files:**
- Commit: exact frozen tracked bytes only after gate PASS
- Publish: the already-built prototype/dist artifact
- Do not create a receipt-only tracked file or commit

**Interfaces:**
- Consumes: frozen candidate from Task 7.
- Produces: one gate receipt, one direct-child release commit/SHA, one GitHub push, the GitHub-triggered Cloudflare Pages deployment for that SHA, and one owner-only ChatGPT Sites version/deployment for the same SHA/artifact.

- [ ] **Step 1: Load the required release skills and verify the freeze**

Before claiming completion, use superpowers:verification-before-completion. Before Sites publication, use sites:sites-building followed by sites:sites-hosting. Use Cloudflare guidance only for read-only deployment verification because Pages is triggered by GitHub push.

~~~bash
git status --short --branch
git diff --check
git log -1 --oneline
git rev-parse HEAD
git rev-parse origin/main
~~~

Expected: planned candidate only, no unreviewed bytes.

- [ ] **Step 2: Run the full release gate exactly once**

~~~bash
cd prototype
npm run gate:release
~~~

Expected: build/runtime integrity/TypeScript, the complete Playwright application and runtime suites, Sites 4/4, whitespace, source fingerprint, and dist fingerprint PASS; .git/chida-release-gate.json is written.

If it fails, do not publish. Diagnose the actual failure, fix only within approved scope, refreeze, and treat the changed bytes as a new candidate requiring a fresh full gate.

- [ ] **Step 3: Commit the exact gated bytes and run the publish guard**

~~~bash
git add prototype/src/projectBriefAuthorities.ts prototype/src/Prototype.tsx prototype/src/prototype.css prototype/tests/chida-flow.spec.ts docs/superpowers/specs/2026-09-03-t9-b2-b3-brief-authorities-design.md docs/superpowers/plans/2026-09-03-t9-b2-b3-brief-authorities.md BUILDER-FEATURE-BACKLOG-FA.md CHIDA-CONTINUATION-HANDOFF-FA.md CHIDA-PRODUCT-LEARNINGS-FA.md
git commit -m "feat: complete project Brief input and visit flows"
cd prototype
npm run gate:publish
~~~

Expected: clean worktree; HEAD is the gated HEAD or its one direct non-merge child; source/dist fingerprints are unchanged.

- [ ] **Step 4: Push once**

~~~bash
git push origin main
git rev-parse HEAD
git rev-parse origin/main
~~~

Expected: both SHAs are identical. Do not push a second receipt commit.

- [ ] **Step 5: Verify the GitHub-triggered Cloudflare Pages deployment**

Wait for the existing Pages project deployment triggered by that push. Require status success, branch main, commit_dirty false, and source commit equal to the exact release SHA. Compare canonical and immutable HTML/JavaScript/CSS artifact hashes with local dist. Do not trigger a manual second deployment when the GitHub deployment is already correct.

- [ ] **Step 6: Publish the exact gated artifact to owner-only ChatGPT Sites**

Use the existing CHIDA Sites project and prototype/dist only after gate:publish passes. Save one version bound to the release SHA, deploy it to https://chida-prototype.mahyarkl.chatgpt.site, reopen the exact version/deployment, and verify succeeded status, exact source SHA, archive/file count, and custom owner-only access with no external guests or groups. Anonymous 401 is expected.

- [ ] **Step 7: Verify live behavior and hand off**

On the live owner session at 390 x 844, smoke:

1. Brief opens with five real sections.
2. File/Composer disposition persists.
3. First baseline and mark-seen persist.
4. Reload/project isolation remain correct.
5. Console warning/error and horizontal overflow remain zero.

Report the final SHA, complete gate counts, Cloudflare deployment id/status/source SHA, Sites version/deployment/archive hash/access, and the truthful next stop. Do not edit tracked documentation to add those dynamic receipts.
