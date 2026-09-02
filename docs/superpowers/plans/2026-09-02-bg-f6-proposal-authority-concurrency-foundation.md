# BG-F6 Proposal Authority and Concurrency Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Replace the builder-recorded Proposal v1 array with a canonical, SHA-256, project-private v2 authority that migrates safely, serializes writes with the procurement lock, preserves downstream historical lineage, and keeps the current no-network builder UX.

**Architecture:** Add a dedicated `builderProposals.ts` domain service that owns exact parsing, migration/cutover, dependency binding, commands, receipts, concurrency, readback, and rollback. Keep `Prototype.tsx` responsible only for constructing current dependency snapshots, holding React state/editor bindings, and presenting results. Existing Comparison/Decision/Negotiation stores remain byte-for-byte v1 and resolve legacy FNV pins through a read-only compatibility helper.

**Tech Stack:** TypeScript 7, React 19, browser `localStorage`, Web Locks API, the existing synchronous stable SHA-256 implementation, Vite 8, Playwright 1.61.

**Spec:** [`docs/superpowers/specs/2026-09-02-bg-f6-proposal-authority-concurrency-foundation-design.md`](../specs/2026-09-02-bg-f6-proposal-authority-concurrency-foundation-design.md)

**Execution status (2026-09-02):** Local implementation and Task 7 verification are complete. Initial evidence was BG-F6 53/53, representative downstream 9/9, runtime/build/TypeScript/diff and real `390×844` QA PASS, with an independent seam review clean. The first authorized release gate then stopped without a receipt on one numeric-bound regression and stale v1 test oracles. The repaired candidate now passes the six exact reproductions 6/6 and the deep T7/T8/BG-F6 set 91/91, plus runtime/build/TypeScript/diff checks. The user has explicitly authorized exact publication and a same-project continuation after terminal receipts; the slice remains uncommitted/unpublished until a fresh frozen gate, commit, push, and deploy all finish.

## Global Constraints

- Work only in `/Users/mahyarkl/Desktop/ChatGPT/CHIDA` on `main`; do not create a worktree.
- Do not commit, push, deploy, or run `npm run gate:release` without a new explicit user authorization.
- Reuse the exported `procurementDispatchWriteLockName`; do not invent a Proposal-only write lock.
- Do not canonicalize or mutate Comparison, Decision, Negotiation, or general File stores.
- Do not add model, backend, sync, network, supplier-path, send, payment, contract, logistics, or external effects.
- Every production change starts from a focused failing test. Observe RED for the intended missing behavior before writing GREEN code.
- A read error is never an empty store. Canonical or marker corruption never falls back to v1.
- Preserve user drafts on every conflict or persistence failure.
- Update `CHIDA-PRODUCT-LEARNINGS-FA.md` before handoff and again after user feedback; keep observation, document gap, decision status, and suggested master-document change separate.
- Use `apply_patch` for file edits. Preserve all unrelated user changes.

---

## Task 1: Add RED tests for the canonical envelope and migration cutover

**Files:**

- Modify: `prototype/tests/chida-flow.spec.ts`
- Reference: `prototype/src/procurementDispatch.ts`
- Reference: `prototype/src/Prototype.tsx`

### Step 1: Add shared BG-F6 test constants and module loader

Near the existing Proposal test helpers, add:

```ts
const legacyBuilderProposalsTestStorageKey = "chida-prototype-builder-recorded-proposals:v1";
const builderProposalsTestStorageKey = "chida-prototype-builder-recorded-proposals:v2";
const builderProposalsMarkerTestStorageKey = `${builderProposalsTestStorageKey}:cutover:v1`;

async function importBuilderProposals(page: Page) {
  return page.evaluate(async () => {
    const module = await import("/src/builderProposals.ts");
    return Object.keys(module);
  });
}
```

Add a helper that creates a valid Proposal dependency snapshot from the already-seeded canonical project, Request/Approval, Contact envelope, and optional File metadata. Do not fabricate a second authority shape: call the service's exported `createBuilderProposalDependencies` from `page.evaluate`.

### Step 2: Add the first migration test

Add a `test.describe("BG-F6 builder proposal authority", ...)` group. Seed one valid product and one valid service v1 Proposal plus existing downstream FNV references. The first test must assert:

```ts
expect(state.status).toBe("ready");
expect(state.envelope.schemaVersion).toBe(2);
expect(state.envelope.fingerprint).toMatch(/^sha256-[0-9a-f]{64}$/);
expect(state.envelope.records).toHaveLength(2);
expect(state.envelope.records[0].revisions[0].fingerprint)
  .toMatch(/^sha256-[0-9a-f]{64}$/);
expect(state.envelope.records[0].legacyEvidence.revisionLinks[0].legacyFingerprint)
  .toMatch(/^fnv1a-[0-9a-f]{8}$/);
expect(marker.state).toBe("committed");
```

Also snapshot the raw downstream storage strings before initialization and assert exact equality afterward.

### Step 3: Add failure and resumption tests

Add focused tests named with the `BG-F6` prefix for:

- empty source commits an empty v2 envelope and ignores a v1 array written later;
- valid pending marker resumes to committed;
- valid verified marker resumes to committed;
- source raw changes after pending and fails closed without canonical overwrite;
- canonical present without marker, committed marker without valid canonical, future schema, owner/scope tamper, duplicate id, mixed valid/invalid v1, and marker fingerprint tamper all return `read-error`;
- canonical corruption never reads v1 fallback;
- migrated target preserves the Request review FNV while adding its SHA-256 dependency-wrapper fingerprint;
- a v1 Proposal whose referenced File was renamed still migrates with the historical display name and current immutable File subset;
- product/service/negotiation target raw bytes remain resolvable after migration.

### Step 4: Run the focused tests and record RED

Run:

```bash
cd prototype
npx playwright test tests/chida-flow.spec.ts --grep "BG-F6.*(migration|canonical|cutover)"
```

Expected: tests fail because `/src/builderProposals.ts` and its exported initialization API do not exist. Confirm failures are missing behavior, not bad fixtures.

### Step 5: Stop before production code if RED is not meaningful

If failures come from invalid upstream seeding, fix the test setup only and rerun until the assertion reaches the missing Proposal service behavior.

---

## Task 2: Implement exact types, SHA-256 parsing, and crash-safe migration

**Files:**

- Create: `prototype/src/builderProposals.ts`
- Modify: `prototype/tests/chida-flow.spec.ts` only if a test helper must consume a public API rather than duplicate production logic

### Step 1: Define public keys and domain types

Start the module with:

```ts
import {
  procurementDispatchWriteLockName,
  type ProcurementDispatchAuthority,
  type SupplierContactEnvelope,
} from "./procurementDispatch";

export const legacyBuilderProposalsStorageKey =
  "chida-prototype-builder-recorded-proposals:v1";
export const builderProposalsStorageKey =
  "chida-prototype-builder-recorded-proposals:v2";
export const builderProposalsCutoverMarkerKey =
  `${builderProposalsStorageKey}:cutover:v1`;
```

Move or recreate the Proposal-only types currently at `Prototype.tsx:1434-1573` here. Add exact v2 record, revision, event, legacy evidence, receipt, migration report, envelope, marker, dependency, command, state, and result types from the design spec.

### Step 2: Add canonical hashing utilities

Reuse the synchronous stable SHA-256 implementation already exported by procurement dispatch:

```ts
export const builderProposalHash = procurementDispatchHash;
```

Keep the old FNV algorithm only in a private migration validator that exactly reproduces the current v1 Proposal-revision fingerprint input. Preserve the authoritative Request-review FNV in `target.reviewRevisionFingerprint`, pair it with a SHA-256 `requestDependencyFingerprint`, and never use FNV for Proposal canonical integrity.

### Step 3: Implement exact finalizers and parsers

Implement `finalizeBuilderProposalRevision`, `finalizeBuilderProposalRecord`, `finalizeBuilderProposalEnvelope`, and exact parsers. Every parser must:

- reject extra/missing keys;
- validate canonical identifiers, ISO timestamps, bounded strings, ordered arrays, unique ids, monotonic versions, and exact current projection;
- validate all nested SHA-256 fingerprints;
- validate owner/scope/custodian constants;
- validate legacy FNV links by recomputing source fingerprints;
- validate exact event→revision and receipt→event replay, deterministic ids, result/store transitions, authorization/dependency hashes, and chronology;
- reject partial records rather than returning a filtered array.

Export:

```ts
export function parseBuilderProposalEnvelopeRaw(
  raw: string | null,
  authority: ProcurementDispatchAuthority,
): BuilderProposalEnvelope | null;
```

Committed canonical parsing is internally complete. Current dependencies are evaluated separately as `current / stale / read-error`; missing current File metadata or Blob must not invalidate a committed Proposal. Migration and mutation still require live exact dependencies.

The committed marker binds the immutable `storeVersion=1` cutover candidate, not every later canonical byte string. For a receipt-bearing `storeVersion>1` envelope, replay that initial candidate deterministically from the migrated record prefix, migration report, zero receipts, original timestamp, and finalized fingerprint; require its raw SHA-256 to match both marker hashes. Keep the marker unchanged on normal mutations. Also validate the deterministic migration-report id in the public envelope parser, enforce complete cross-record chronology, and require migrated `sourceIndex` values to form the exact unique source-order permutation.

Committed-state validation must also require the first live receipt timestamp to be at or after the marker's `committedAt`; nondecreasing receipt order carries the boundary forward. Task 4 command timestamps must use at least the marker cutover time and the last canonical time so wall-clock rollback cannot create a pre-authority event.

Expose a read seam that accepts valid `ProcurementDispatchAuthority` independently of the current dependency snapshot. If dependencies are unavailable but authority and committed bytes validate, return `ready` with `dependencyStatus: "read-error"`; never erase the readable envelope. Mutations and migration remain fail-closed without exact live dependencies.

Allow the dependency reader to return either the legacy full `BuilderProposalDependencies` value or an explicit `{ authority, dependencies }` read context. On an already committed store, valid authority plus unavailable/invalid dependencies returns the readable envelope with dependency read-error. A fresh migration or pending/verified resume still requires a fully valid dependency snapshot.

### Step 4: Implement the dependency constructor

Implement sync `createBuilderProposalDependencies(input)` as an exact validator/finalizer, not a loose cast. It must sort all dependency arrays, reject duplicates/cross-project entries, and hash the final snapshot. Include historical Request/Approval revisions, Contact revisions from the canonical Contact envelope, and File metadata. File migration compares the immutable subset (`id/projectId/originalName/mimeType/size/category/createdAt`) and permits a changed `displayName`; committed parsing trusts the internally hashed historical snapshot and reports current availability separately.

### Step 5: Implement marker parsing and migration states

Implement exact `pending`, `verified`, and `committed` markers. Under `procurementDispatchWriteLockName`, `initializeBuilderProposals(getDependencies)` must:

- reread dependencies inside the lock;
- treat committed v2 as the only authority;
- reject canonical-without-marker and marker-without-valid-canonical;
- build an empty candidate even when v1 is absent;
- validate every v1 record and resolve exact dependency pins;
- write/read back pending, verified, canonical, then committed in order;
- resume only if source, identity, dependencies, and candidate preimages still match;
- never delete or rewrite v1;
- return `{ status: "read-error" }` on any authority ambiguity or persistence failure; only an already committed, internally valid authority may remain `ready` with dependency status `read-error` when its current dependency snapshot is unavailable.

Use the exact event, receipt, migration-report and marker shapes in the design spec. Add/retain tests that reject coherently rehashed but impossible receipt/event chains rather than validating hashes alone.

Public seam:

```ts
export async function initializeBuilderProposals(
  getDependencies: BuilderProposalInitializationReader,
): Promise<BuilderProposalState>;
```

### Step 6: Run migration tests to GREEN

Run:

```bash
cd prototype
npx playwright test tests/chida-flow.spec.ts --grep "BG-F6.*(migration|canonical|cutover)"
```

Expected: all Task 1 tests pass.

### Step 7: Type-check before the next task

Run:

```bash
cd prototype
npx tsc --noEmit
```

Expected: PASS.

---

## Task 3: Add RED tests for commands, idempotency, concurrency, and rollback

**Files:**

- Modify: `prototype/tests/chida-flow.spec.ts`
- Reference: `prototype/src/procurementDispatch.ts`

### Step 1: Add command fixture builders

Build commands from a ready envelope and a fresh dependency snapshot. The create fixture must include exact Request/Approval/Contact/File pins and `expectedStoreVersion`. The update fixture also includes `expectedProposalVersion`.

```ts
const createCommand = {
  inputSchemaVersion: 1,
  action: "create-proposal",
  projectId,
  proposalId: "builder-proposal:bg-f6-create",
  draft,
  pins,
  expectedStoreVersion: state.envelope.storeVersion,
  idempotencyKey: "bg-f6:create:one",
} as const;
```

### Step 2: Add command/receipt/idempotency tests

Assert:

- create produces Proposal v1, revision v1, event, receipt, SHA-256 fingerprints, `storeVersion + 1`, and exact dependency pins including Request source-FNV plus Request dependency-SHA;
- receipt persists the exact `commandPins` used by the command, keeps `commandPins.expectedDependencySnapshotHash` equal to the receipt-level dependency hash, and lets the parser reconstruct the payload hash without consulting mutable current dependencies;
- update produces revision/event v2 and preserves revision v1;
- no-op returns `unchanged` and keeps the full canonical raw string byte-for-byte;
- same key/same payload replays the original result without writing;
- same key/different payload returns `idempotency-payload-mismatch`;
- stale store/proposal/dependency versions return `version-conflict` or `dependency-invalid` without writing;
- cross-project command returns `scope-mismatch`;
- live deterministic revision/event ids, preserved migrated revision/event ids, and receipt positions replay exactly;
- coherently rehashed orphan receipt, impossible store transition, mismatched event/payload, dependency-prefix forgery, or timestamp before a dependency fail closed;
- deleting, retargeting, or coherently rehashing `receipt.commandPins` fails closed; Request/Approval/Contact pins must match the recorded revision, while a File pin remains the exact commit-time command evidence even if a later display-name rename makes it non-derivable from the historical reference;
- ambiguous-success retry with the same idempotency key/payload returns the original record and never duplicates it.

### Step 3: Add deterministic concurrency tests

Use the existing real-browser pattern in `chida-flow.spec.ts` (a real held Web Lock and two real Playwright pages) with the exported shared procurement lock name. Queue two create commands with the same initial store version and distinct ids; after release, exactly one must succeed and the other must conflict. Repeat with two edits of the same Proposal. Assert no lost update and exact one-version increment. Monkey-patch locks only for the explicit lock-unavailable fault case.

Add a test where Request/Approval/Contact/File changes while the command is waiting. The queued command must reread and reject the stale dependency before any Proposal write.

### Step 4: Add persistence and rollback tests

Instrument `localStorage` for:

- Web Locks unavailable: no write;
- `setItem` failure: previous canonical bytes remain;
- candidate readback mismatch: previous bytes restored only if current bytes still equal candidate;
- post-write dependency drift: candidate-owned rollback restores previous bytes;
- concurrent third-party overwrite after candidate: rollback does not overwrite third-party bytes and result is `read-failure`;
- rollback write/readback failure: result is `read-failure`, never optimistic success.

### Step 5: Run and observe RED

Run:

```bash
cd prototype
npx playwright test tests/chida-flow.spec.ts --grep "BG-F6.*(command|idempotency|concurrency|rollback|lock)"
```

Expected: failures at the missing `executeBuilderProposalCommand` behavior.

---

## Task 4: Implement command execution and the single-writer persistence seam

**Files:**

- Modify: `prototype/src/builderProposals.ts`

### Step 1: Implement exact command parsing and payload hashing

Reject extra keys, invalid ids, missing expected versions, unbounded strings, unordered lines, invalid pins, and malformed idempotency keys before reading or writing storage. Define the payload hash over action, target, normalized draft, dependency pins, expected versions, and authority binding.

### Step 2: Reuse the shared procurement lock

Implement a local wrapper that calls:

```ts
window.navigator.locks.request(
  procurementDispatchWriteLockName,
  { mode: "exclusive" },
  operation,
);
```

If Web Locks are unavailable or throw, return `lock-unavailable` and do not touch Proposal storage.

### Step 3: Implement read-at-commit validation

Inside the lock:

1. read dependencies;
2. read exact committed marker/canonical;
3. validate idempotency receipt before expected-version rejection;
4. validate authority/project and expected store/record versions;
5. resolve exact current dependency pins;
6. detect no-op before generating ids or timestamps.

Create may require current approved/active dependencies. Update cannot retarget Request or Contact and must validate the record's historical target plus the command's exact current pins.

### Step 4: Build canonical record, event, receipt, and envelope

Use deterministic ids based on Proposal id and version where possible:

```ts
const revisionId = `builder-proposal-revision:${proposalId}:v${version}`;
const eventId = `builder-proposal-event:${proposalId}:v${version}`;
```

Receipt must use the exact design-spec shape and bind position, action, payload hash, project/record ids, expected/resulting store and record versions, exact `commandPins`, revision/event ids, dependency snapshot hash, authorization context hash, idempotency key, and recorded timestamp. Persist pins because replay cannot safely infer every commit-time value from mutable current dependencies or the historical revision—especially the File metadata pin across an allowed display-name rename. Parser replay reconstructs the normalized command payload from the recorded revision, authority, and `receipt.commandPins`; it must prove the receipt maps to the live event/revision and legal `+1` transitions. A missing/retargeted pin or hash-valid impossible chain is invalid.

### Step 5: Implement exact commit/readback/rollback

Immediately before write, recheck marker raw, canonical raw, authority/dependency snapshot hash, and File metadata pin. After write, reread all of them and parse the candidate through the full parser. On any mismatch:

- restore previous raw only if current raw is exactly this mutation's candidate;
- verify restored readback;
- otherwise return `read-failure` without overwriting unknown bytes.

### Step 6: Run Task 3 tests to GREEN

Run:

```bash
cd prototype
npx playwright test tests/chida-flow.spec.ts --grep "BG-F6.*(command|idempotency|concurrency|rollback|lock)"
```

Expected: all Task 3 tests pass.

---

## Task 5: Preserve downstream read-only lineage without rewriting downstream stores

**Files:**

- Modify: `prototype/src/builderProposals.ts`
- Modify: `prototype/src/Prototype.tsx`
- Modify: `prototype/tests/chida-flow.spec.ts`

### Step 1: Add RED compatibility tests

Seed a v1 Proposal and existing product comparison, service comparison, decision, negotiation draft, manual response/review/impact records that pin its FNV revision. Capture every downstream raw string before initialization. Migrate Proposal and open each detail/revision-diff route.

Assert:

- each route remains readable;
- identity displayed is the historical Proposal revision;
- downstream raw strings are unchanged byte-for-byte;
- migrated Proposal keeps the exact seven-key supplier snapshot consumed by current product/service/negotiation parsers and stores Contact revision SHA only in a separate `contactPin`;
- Proposal canonical raw does not change merely by opening downstream details;
- a tampered FNV link or link to another record is rejected;
- a newly created downstream object pins the SHA-256 canonical Proposal-revision fingerprint, not FNV;
- Proposal target keeps the Request review FNV expected by existing product/service/negotiation target records while its separate Request dependency wrapper is SHA-256;
- changing either the Request FNV or the SHA wrapper without the corresponding exact source is rejected.

Run and observe RED:

```bash
cd prototype
npx playwright test tests/chida-flow.spec.ts --grep "BG-F6.*lineage"
```

### Step 2: Export the compatibility helper

Implement:

```ts
export function builderProposalRevisionFingerprintMatches(
  record: BuilderRecordedProposalRecord,
  revision: BuilderRecordedProposalRevision,
  pinnedFingerprint: string,
): boolean;
```

It accepts only the revision's canonical SHA or a recomputed/hash-bound legacy link for the same record/revision/version.

### Step 3: Replace direct fingerprint comparisons

In `Prototype.tsx`, replace direct Proposal revision fingerprint equality checks used by product comparison, service comparison, decisions, negotiation evidence, and revision-diff lineage with the helper. Do not change downstream types, storage keys, serializers, or writers except that new records naturally read `revision.fingerprint` and therefore pin SHA-256.

### Step 4: Run lineage tests to GREEN

Run the same focused command and confirm downstream raw-byte assertions pass.

---

## Task 6: Integrate the service with React while preserving drafts on conflicts

**Files:**

- Modify: `prototype/src/Prototype.tsx`
- Modify: `prototype/tests/chida-flow.spec.ts`
- Modify only if needed: `prototype/src/prototype.css`

### Step 1: Add RED UI tests

Add focused UI tests for:

- initialization loading vs ready-empty vs read-error;
- create success reads state from the service readback envelope;
- edit binding captures `projectId`, `expectedStoreVersion`, `expectedProposalVersion`, stable `proposalId`, idempotency key, and normalized payload hash for each save attempt;
- writer pending disables submit;
- stale-tab conflict keeps the editor open and preserves every field;
- storage/readback/lock failure keeps the draft and shows an exact local-storage error;
- an ambiguous-success retry with an unchanged draft reuses the same proposal id/key/hash and resolves by receipt replay without a duplicate record;
- no-op closes with the existing unchanged message;
- storage events on Proposal v1/v2/marker, project authority/identity, Request and recovery intent, Approval marker/confirmation/precondition intent, Contact marker/queue intent, and File/source intent trigger reconciliation;
- removal of current File metadata and removal of its Blob after a committed Proposal leave the historical Proposal readable but mark the reference unavailable;
- mobile `390×844`, focus return, zero horizontal overflow, and zero external requests.

Run:

```bash
cd prototype
npx playwright test tests/chida-flow.spec.ts --grep "BG-F6.*UI"
```

Expected: stale/pending/draft-preservation assertions fail against the synchronous v1 writer.

### Step 2: Import service types and APIs

Import the new keys, state, record/draft types, initializer, command executor, dependency constructor, and compatibility helper. Remove Proposal-only parser/writer implementations and the v1 storage constant from `Prototype.tsx`; avoid duplicate authorities.

### Step 3: Build the dependency adapter

At the existing procurement dependency seam near `Prototype.tsx:4598-4610`, build a fresh Proposal dependency snapshot from:

- compiled project authority;
- all historical Request review revisions;
- all historical Approval revisions;
- canonical Contact envelope and revisions;
- current project File metadata.

The adapter is synchronous and returns `null` on any read-error or exact-validation failure. Committed canonical parse does not depend on this adapter; dependency `stale/read-error` only controls effective status and mutation eligibility.

Add a separate async `BuilderProposalReferenceAvailabilityReader` in `Prototype.tsx`. It uses the existing `readProjectFile` IndexedDB path after matching current metadata and derives `not-attached / available / metadata-only / metadata-missing / blob-missing / read-error`. Store this as UI-only derived state; never include Blob availability in canonical parsing, dependency hashing, or Proposal writes. An IndexedDB exception blocks opening/mutating the reference but does not hide the historical Proposal.

### Step 4: Replace Proposal React state and initialization

Use `BuilderProposalState` instead of raw records plus a loose error flag. Initialize only when foundation/procurement/contact dependencies are ready. Derive UI records from `state.envelope?.records ?? []` only when state is `ready`.

### Step 5: Bind and execute editor commands asynchronously

When opening create/edit, capture:

```ts
type BuilderProposalEditorBinding = {
  projectId: string;
  expectedStoreVersion: number;
  expectedProposalVersion: number | null;
  attempt: null | {
    proposalId: string;
    idempotencyKey: string;
    normalizedPayloadHash: `sha256-${string}`;
    pins: BuilderProposalCommandPins;
  };
};
```

Make `onCreate` and `onUpdate` async. Generate the attempt identity and exact command pins once per domain-normalized payload and reuse the whole attempt on an unchanged retry, including after an ambiguous readback failure; never refresh pins or expected versions under the same idempotency key. Reset it only after conclusive success/replay/no-op, editor close, or a draft change. Disable submission while pending. On success or unchanged, close as today. On every conflict/failure, preserve `draft`, `editingId`, disclosure mode, attempt identity, and editor focus context; show a specific Persian message and keep the sheet open.

When reconciliation makes the editor binding stale, distinguish a new mutation from receipt recovery. Block a new mutation and require reopen/fresh binding. If the draft's domain-normalized hash still equals the saved attempt hash, allow exactly one kind of retry: resubmit the captured proposal id/key/pins/expected versions so an already committed ambiguous success can replay its receipt. If no matching receipt exists, the command must conflict/fail without writing and the attempt remains available for diagnosis/retry.

### Step 6: Reconcile storage events

Listen to legacy/canonical/marker keys and all upstream authority, marker and intent keys named in the design spec. On an event, rerun the service initialization/read path; do not parse raw storage directly in React. If authority/identity or the current editor binding becomes stale, keep the draft open. Block fresh mutation until reopen with a fresh binding, while retaining the narrow unchanged-attempt receipt-replay exception above; never turn reconciliation into silent rebinding.

### Step 7: Run UI and existing Proposal regressions

Run:

```bash
cd prototype
npx playwright test tests/chida-flow.spec.ts --grep "BG-F6.*UI|T7-A|T8-A5"
```

Expected: PASS.

---

## Task 7: Validate the whole BG-F6 slice and update live project records

**Files:**

- Modify: `BUILDER-FEATURE-BACKLOG-FA.md`
- Modify: `CHIDA-CONTINUATION-HANDOFF-FA.md`
- Modify: `CHIDA-PRODUCT-LEARNINGS-FA.md`
- Inspect: all changed production/test/spec/plan files

### Step 1: Run focused service suites

Current status: complete on the final local bytes. This is a local verification result only and is not publication authorization or a release receipt.

```bash
cd prototype
npx playwright test tests/chida-flow.spec.ts --grep "BG-F6"
```

Expected: all BG-F6 tests pass once.

### Step 2: Run Proposal/downstream regressions

Use the actual existing T7/T8 test titles found with `rg`; do not invent grep labels. Run one focused Playwright command covering Proposal, product/service comparison, decisions, negotiations, manual negotiation records, and revision diff.

### Step 3: Run build-level checks appropriate to a risky architecture slice

```bash
cd prototype
npm run check:runtime
npm run build
git diff --check
```

Expected: runtime integrity PASS, TypeScript/Vite/Sites package build PASS, diff check PASS.

At local completion this checkout was not yet an authorized release candidate. Publication authorization has now been received. The first authorized gate exposed and stopped on one numeric-bound regression plus stale v1 test oracles; after their focused repair, freeze the new bytes and run one fresh `npm run gate:release`. The failed run is not a receipt.

### Step 4: Perform real mobile QA

At `390×844`, verify:

- Proposal list, create, edit, history, product/service comparison, and negotiation routes;
- loading/read-error/empty states;
- conflict keeps draft;
- no enabled control is inert;
- no horizontal overflow;
- console has no new error;
- no external request is emitted.

### Step 5: Update the three live documents

Record:

- exact files and contracts implemented;
- focused test/build/QA evidence;
- Builder Architecture Gate remains historical FAIL and was not rerun;
- BG-F6 remains local/unreleased until terminal receipts; exact publication has now been separately authorized;
- remaining builder work and the next smallest authorized slice.

In the learning log, use distinct subsections for observed experience, master-document gap, design decision/status, and suggested future master-document amendment.

### Step 6: Final self-review

Run:

```bash
git status --short
git diff --stat
git diff --check
```

Review every changed hunk for accidental downstream schema writes, network calls, supplier-path activation, secrets, or release actions. After the review and final document freeze, execute only the separately authorized exact release workflow; do not expand the slice.

### Final evidence recorded on 2026-09-02

- BG-F6 suite: 53/53 PASS in one final run.
- Representative downstream Proposal/product-service comparison/negotiation set: 9/9 PASS.
- `npm run check:runtime`: 28 protected files PASS; `npm run build`, TypeScript, Vite, Sites prepare, and `git diff --check`: PASS.
- Real mobile QA at `390×844`: Proposal inbox/detail/revision diff, product-comparison empty state, service-comparison detail, negotiation list/detail, and simple/advanced editor routes; horizontal overflow zero and no new console warning/error.
- Independent final seam review: clean. Final self-review found no downstream schema writer, external network/send path, supplier-role activation, secret, or release action in the BG-F6 diff.
- The first authorized `gate:release` passed build/integrity/TypeScript but stopped with 6 Playwright failures out of 463 and produced no receipt. Root causes were a Proposal v2 canonical-number limit of 160 versus the published 200-digit comparison contract, plus stale non-migration v1 Proposal oracles.
- The shared canonical limit is now 200 while the raw 320-character guard remains. Non-migration byte oracles read v2 canonical raw; v1 remains only in explicit migration/cutover/recovery fixtures. The six reproductions pass 6/6 and the deep T7-B1/T7-B2/T8-A1–A4/T8-UX1/BG-F6 set passes 91/91, including oversized-input rejection, tamper, rollback, concurrency, and lineage cases.
- Commit, push, and deploy have not run. The repaired bytes require one fresh frozen release gate; after it passes, the exact publish workflow and read-only continuation in the same saved project/checkout are the only permitted actions.
