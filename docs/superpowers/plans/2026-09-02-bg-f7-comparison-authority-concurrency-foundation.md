# BG-F7 Comparison Authority and Concurrency Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two builder Product/Service Comparison v1 arrays with two independent canonical SHA-256 v2 authorities that migrate and mutate safely under the shared procurement lock, preserve every historical downstream FNV pin without rewriting descendant bytes, and keep the current private/local/no-external-effect mobile experience.

**Architecture:** Add one domain service, `builderProposalComparisons.ts`, with shared infrastructure and two strictly discriminated ledgers. The service owns exact parsing, product/service derivation, canonical serialization, SHA-256 fingerprints, migration/cutover, dependency pins, commands, receipts, concurrency, readback, and candidate-owned rollback. `Prototype.tsx` owns only current dependency assembly, independent React states, editor bindings, storage reconciliation, descendant adapters, and UI. Decision and Negotiation remain v1 stores and accept historical FNV pins only through an evidence-backed compatibility resolver.

**Tech Stack:** TypeScript 7, React 19, browser `localStorage`, Web Locks API, the existing synchronous SHA-256 implementation, Vite 8, Playwright 1.61.

**Spec:** [`docs/superpowers/specs/2026-09-02-bg-f7-comparison-authority-concurrency-foundation-design.md`](../specs/2026-09-02-bg-f7-comparison-authority-concurrency-foundation-design.md)

## Global Constraints

- Work only in `/Users/mahyarkl/Desktop/ChatGPT/CHIDA` on the existing `main` checkout. Do not create a worktree.
- The approved design authorizes planning and, after the user chooses an execution mode, local test-driven implementation of BG-F7 only. It does not authorize `gate:release`, commit, push, Cloudflare deployment, Sites publication, Builder Gate rerun, or the next remediation.
- Do not commit production candidate bytes between tasks. The first candidate commit is Task 8, only after local completion, a frozen candidate review, and explicit authorization for that exact candidate.
- Do not change `CHIDA-Product-Definition-FA.md` unless implementation exposes a genuine contradiction and the user separately approves a product-definition change.
- Do not migrate, rewrite, normalize, delete, or re-key Product Decision, Service Decision, NegotiationDraft, ManualNegotiationResponse, ResponseReview, or ConditionImpact records.
- Do not add model, AI, backend, sync, network, supplier path, send, purchase, payment, contract, logistics, notification, worker, or external effect.
- Reuse `procurementDispatchWriteLockName`. Product and Service use independent keys/envelopes/markers but one shared lock; do not add per-kind locks.
- Reuse the tested procurement SHA-256 byte primitive, but do not reuse its `localeCompare` object canonicalizer. Comparison object hashes use explicit code-point ordering and Comparison raw hashes digest the exact stored string. Do not change any existing Proposal or procurement hash output.
- FNV is accepted only as verified legacy evidence. Every new Comparison revision, event, record, receipt, report, marker, and envelope fingerprint is SHA-256.
- A read error is never an empty ledger. Product failure must not corrupt or block a healthy Service writer, and Service failure must not corrupt or block a healthy Product writer.
- Every production behavior starts with a focused failing test. Observe the intended RED before writing GREEN code; do not weaken assertions, add retries, raise timeouts, skip tests, or replace exact-byte checks with truthiness.
- Keep the current Product decimal/BigInt semantics and the current Service ten-criterion semantics. No rank, score, hidden normalization, or shared ambiguous Product/Service validator is introduced.
- Preserve create/edit drafts, bindings, and stable attempt identity on conflicts and ambiguous failures. Only confirmed success, receipt replay, or no-op may close the editor.
- Use `apply_patch` for edits. Preserve unrelated user changes.
- `npm run gate:release` is not a development command. Task 7 uses focused evidence; Task 8 runs the full gate once only after exact-candidate authorization.

## File and Ownership Map

| File | Planned change | Must remain outside it |
|---|---|---|
| `prototype/src/builderProposalComparisons.ts` | New Comparison domain service, public types/API, exact parsers, both v2 ledgers, migration, commands, receipts, rollback, compatibility helper | React state, UI text, descendant storage writers |
| `prototype/src/builderProposals.ts` | Export one pure per-record Proposal currentness helper and reuse it internally | Proposal schema, keys, command format, migration, persisted bytes |
| `prototype/src/procurementDispatch.ts` | Export the existing raw UTF-8 SHA-256 primitive without changing any current caller/output | Procurement canonicalization, schema, storage, commands |
| `prototype/src/Prototype.tsx` | Import domain types/helpers, build read context, hold two states, async editor adapters, reconciliation, descendant compatibility calls | Canonical Comparison validation and mutation internals |
| `prototype/tests/chida-flow.spec.ts` | Independent SHA oracles, v1/v2 fixtures, all BG-F7 tests, adapted T7/BG-F6 downstream readers | Production hash as the golden oracle |
| `BUILDER-FEATURE-BACKLOG-FA.md` | BG-F7 local/release state and the deferred Product Decision currentness debt | A false Builder Gate PASS |
| `CHIDA-CONTINUATION-HANDOFF-FA.md` | Exact scope, evidence, stop point, and authorized next action | Dynamic deployment receipts before they exist |
| `CHIDA-PRODUCT-LEARNINGS-FA.md` | Observation, document gap, decision/status, suggested master-document change as separate entries | Treating the learning log as product source of truth |

## Required Public Module Boundary

The new module must expose this boundary; v1 source types and all legacy FNV producers remain private:

```ts
export const legacyBuilderProductComparisonsStorageKey: string;
export const builderProductComparisonsStorageKey: string;
export const builderProductComparisonsCutoverMarkerKey: string;
export const builderProductComparisonsRollbackIncidentKey: string;
export const legacyBuilderServiceComparisonsStorageKey: string;
export const builderServiceComparisonsStorageKey: string;
export const builderServiceComparisonsCutoverMarkerKey: string;
export const builderServiceComparisonsRollbackIncidentKey: string;

export function builderComparisonHash(
  value: unknown,
): `sha256-${string}`;

export function builderComparisonRawHash(
  raw: string,
): `sha256-${string}`;

export type BuilderComparisonReadContext = {
  authority: ProcurementDispatchAuthority | null;
  dependencies: BuilderProposalDependencies | null;
};

export type BuilderComparisonContextReader =
  () => BuilderComparisonReadContext;

export type BuilderComparisonState<TEnvelope> =
  | {
      status: "loading";
      envelope: null;
      dependencyStatus: "unknown";
    }
  | {
      status: "read-error";
      envelope: null;
      dependencyStatus: "read-error";
      reason: string;
    }
  | {
      status: "ready";
      envelope: TEnvelope;
      dependencyStatus: "current" | "read-error";
    };

export function readBuilderProductComparisonState(
  context: BuilderComparisonReadContext,
): BuilderComparisonState<BuilderProductComparisonEnvelope>;

export function readBuilderServiceComparisonState(
  context: BuilderComparisonReadContext,
): BuilderComparisonState<BuilderServiceComparisonEnvelope>;

export async function initializeBuilderProductComparisons(
  getContext: BuilderComparisonContextReader,
): Promise<BuilderComparisonState<BuilderProductComparisonEnvelope>>;

export async function initializeBuilderServiceComparisons(
  getContext: BuilderComparisonContextReader,
): Promise<BuilderComparisonState<BuilderServiceComparisonEnvelope>>;

export async function executeBuilderComparisonCommand(
  command: unknown,
  getContext: BuilderComparisonContextReader,
): Promise<BuilderComparisonMutationResult>;

export function builderProductComparisonNormalizedDraftHash(
  draft: unknown,
): `sha256-${string}` | null;

export function builderServiceComparisonNormalizedDraftHash(
  draft: unknown,
): `sha256-${string}` | null;

export function builderProductComparisonCommandPinsForDraft(
  projectId: string,
  draft: BuilderProductComparisonDraft,
  context: BuilderComparisonReadContext,
): BuilderProductComparisonCommandPins | null;

export function builderServiceComparisonCommandPinsForDraft(
  projectId: string,
  draft: BuilderServiceComparisonDraft,
  context: BuilderComparisonReadContext,
): BuilderServiceComparisonCommandPins | null;

export function builderComparisonRevisionFingerprintMatches(
  comparison: BuilderProductComparisonRecord | BuilderServiceComparisonRecord,
  revision: BuilderProductComparisonRevision | BuilderServiceComparisonRevision,
  claimedFingerprint: string,
): boolean;

export function builderProductComparisonEffectiveStatus(
  comparison: BuilderProductComparisonRecord,
  proposals: BuilderProposalEnvelope,
  dependencies: BuilderProposalDependencies,
  revisionId?: string,
): "current" | "needs-review";

export function builderServiceComparisonEffectiveStatus(
  comparison: BuilderServiceComparisonRecord,
  proposals: BuilderProposalEnvelope,
  dependencies: BuilderProposalDependencies,
  revisionId?: string,
): "current" | "needs-review";
```

Also export the Product/Service draft, input, result, revision, record, envelope, pins, command, state, mutation-result types; the fixed Service criteria catalog; the existing draft builders; the Product/Service preview/derive helpers; and the per-kind effective-status helpers. Keep legacy v1 parsers, legacy fingerprint functions, marker transition helpers, canonical finalizers, and storage primitives private unless a test requires a deliberate public seam described by the spec.

The only new Proposal APIs are two pure validation seams; neither writes storage or changes persisted Proposal bytes:

```ts
export function builderProposalRevisionIsCanonical(
  value: unknown,
): value is BuilderRecordedProposalRevision;

export function builderProposalRecordIsCurrent(
  record: BuilderRecordedProposalRecord,
  dependencies: BuilderProposalDependencies,
): boolean;
```

`BuilderComparisonReadContext` intentionally carries current Project/Identity authority and Proposal dependencies, not a cached Proposal envelope. Every Comparison read, initialization, and command must read `builderProposalsStorageKey` and `builderProposalsCutoverMarkerKey` itself, validate them through `readBuilderProposalState`, reread both raw strings, and require byte equality around that validation. Initialization and commands do this inside `procurementDispatchWriteLockName`. This produces the exact Proposal envelope, store version/fingerprint, canonical raw hash, and committed-marker raw hash required by Comparison dependency preimages without trusting React state.

Use one private resolved tuple:

```ts
type ResolvedBuilderComparisonProposalAuthority = {
  envelope: BuilderProposalEnvelope;
  canonicalRaw: string;
  committedMarkerRaw: string;
  canonicalRawHash: `sha256-${string}`;
  committedMarkerRawHash: `sha256-${string}`;
};

function readBuilderComparisonProposalAuthority(
  context: BuilderComparisonReadContext,
): ResolvedBuilderComparisonProposalAuthority | null;
```

The function returns non-null only when the Proposal state is ready, both raw strings are present and unchanged across validation, the envelope fingerprint/storeVersion equal the validated state, and the raw hashes come from `builderComparisonRawHash`.

## Test Discipline and Fixture Rules

- Add one describe block titled `BG-F7 builder comparison authority` after the existing BG-F6 authority block. Use nested groups for Proposal seam, parser/hash, migration/cutover, command/recovery, and UI/downstream.
- Declare `bgF7FrozenBaseTitles` as one literal 40-entry `as const` array containing exactly the titles enumerated across Tasks 2–6. Every frozen test takes its base title from that array, including parameterized suffixes; assert the array length and unique-set size are both 40 at module load. The Task 1 Proposal-helper title is one explicit auxiliary title outside this manifest.

```ts
if (
  bgF7FrozenBaseTitles.length !== 40
  || new Set(bgF7FrozenBaseTitles).size !== 40
) {
  throw new Error("BG-F7 frozen title manifest must contain 40 unique entries");
}
```
- Preserve every frozen base title from spec lines 971–1010. Parameterized Product/Service cases may append ` [product]` or ` [service]`; they must not replace or paraphrase the base title.
- Normal application tests read Comparison records through a canonical helper returning `envelope.records`. Direct `JSON.parse(v1Raw)[0]` is permitted only in explicit v1 migration/cutover fixtures.
- The independent test serializer sorts object keys lexicographically by Unicode scalar/code point using its own iterator-based comparator. It must not use JavaScript string `<`, `localeCompare`, or the production stable serializer. A frozen `"\uE000"` versus `"\u{10000}"` vector distinguishes scalar order from UTF-16 code-unit order.
- Golden SHA values are generated once from frozen literal vectors using Web Crypto, copied as literal 64-hex digests into the fixture, and then asserted against the synchronous production hash. No golden expected value may call the production hash.
- “Rollback” in a test title means a candidate was written, post-write verification failed, exact previous bytes were restored only while current bytes still equaled that candidate, and restoration was read back. A pre-write throw is only a write-failure test.
- Snapshot these downstream raw keys before and after each cutover: Product Decision, Service Decision, NegotiationDraft, ManualNegotiationResponse, ResponseReview, and ConditionImpact. Missing/null compared with missing/null is not preservation evidence; seed representative non-null bytes first.
- Use unanchored Playwright grep fragments. Full Playwright titles include file/describe prefixes, so do not prefix grep expressions with `^`.

---

## Task 1: Expose and prove the Proposal per-record currentness seam

**Files:**

- Modify: `prototype/tests/chida-flow.spec.ts`
- Modify: `prototype/src/builderProposals.ts`

**Interfaces:**

- Consumes: `BuilderRecordedProposalRecord` and exact `BuilderProposalDependencies`.
- Produces: pure boolean `builderProposalRecordIsCurrent`.
- Preserves: Proposal canonical bytes, public command format, aggregate dependency status, and all BG-F6 behavior.

- [ ] **Step 1: Add a focused RED test for the missing export**

Add:

```ts
test("BG-F7 Proposal currentness helper exposes one exact record result without changing Proposal bytes", async ({ page }) => {
  await seedBgF6LegacyProductAndServiceProposals(page);
  const dependencies = await createBuilderProposalTestDependencies(page);
  const state = await initializeBuilderProposalState(page, dependencies);
  expect(state.status).toBe("ready");
  if (state.status !== "ready") throw new Error("BG-F7 Proposal seed did not initialize");
  const record = state.envelope.records[0];
  expect(record).toBeDefined();
  if (!record) throw new Error("BG-F7 Proposal seed has no canonical record");
  const before = await page.evaluate((key) => localStorage.getItem(key), builderProposalsTestStorageKey);

  const result = await page.evaluate(async ({ record, dependencies }) => {
    const module = await import("/src/builderProposals.ts");
    const stripFingerprint = <T extends { fingerprint: string }>(
      { fingerprint: _fingerprint, ...value }: T,
    ) => value;
    const staleDependencies = module.createBuilderProposalDependencies({
      authority: dependencies.authority,
      requestRevisions: dependencies.requestRevisions.map(stripFingerprint),
      contentApprovals: dependencies.contentApprovals.map((approval) => ({
        ...stripFingerprint(approval),
        isCurrent: false,
      })),
      contacts: dependencies.contacts.map(stripFingerprint),
      files: dependencies.files.map(stripFingerprint),
    });
    return {
      current: module.builderProposalRecordIsCurrent(record, dependencies),
      stale: module.builderProposalRecordIsCurrent(record, staleDependencies),
      hasExport: typeof module.builderProposalRecordIsCurrent === "function",
    };
  }, { record, dependencies });

  expect(result).toEqual({ current: true, stale: false, hasExport: true });
  expect(await page.evaluate((key) => localStorage.getItem(key), builderProposalsTestStorageKey))
    .toBe(before);
});
```

- [ ] **Step 2: Run the test and observe the intended RED**

Run from repository root:

```bash
npm --prefix prototype run test:app -- --grep "BG-F7 Proposal currentness helper"
```

Expected: failure because `builderProposalRecordIsCurrent` is not exported. If the fixture fails before that assertion, repair only the fixture and repeat RED.

- [ ] **Step 3: Factor the existing per-record logic into the export**

At the current `dependencyStatus` implementation in `builderProposals.ts`, move the existing single-record predicate byte-for-byte into the exported signature already specified in “Required Public Module Boundary.” Then reduce the aggregate to:

```ts
function dependencyStatus(
  envelope: BuilderProposalEnvelope,
  dependencies: BuilderProposalDependencies,
): "current" | "stale" {
  return envelope.records.every((record) =>
    builderProposalRecordIsCurrent(record, dependencies)
  ) ? "current" : "stale";
}
```

Move the existing checks without changing predicates, order, normalization, hashes, types, or return meaning.

- [ ] **Step 4: Run GREEN and a Proposal regression**

```bash
npm --prefix prototype run test:app -- --grep "BG-F7 Proposal currentness helper|BG-F6 new downstream lineage pins canonical Proposal SHA"
```

Expected: both tests pass and the Proposal storage bytes in the new test remain identical.

- [ ] **Step 5: Type-check the seam**

```bash
(cd prototype && npm exec -- tsc --noEmit)
```

Expected: exit 0.

---

## Task 2: Build exact Product/Service types, derivation, SHA, and parsers

**Files:**

- Create: `prototype/src/builderProposalComparisons.ts`
- Modify: `prototype/src/procurementDispatch.ts`
- Modify: `prototype/src/Prototype.tsx`
- Modify: `prototype/tests/chida-flow.spec.ts`
- Reference: `prototype/src/builderProposals.ts`
- Reference: `prototype/src/procurementDispatch.ts`

**Interfaces:**

- Imports: Proposal keys/state/types/currentness/fingerprint compatibility, `procurementDispatchSha256Text`, `ProcurementDispatchAuthority`, and `procurementDispatchWriteLockName`.
- Produces: exact Product/Service domain types, draft normalization, derive helpers, v2 finalizers/parsers, and Comparison compatibility resolver.
- Preserves: the T7-B1 decimal contract, T7-B2 criteria contract, current visible labels, and Product/Service semantic projections.

- [ ] **Step 1: Add the seven parser/hash RED tests with exact titles**

Add these base titles:

1. `BG-F7 parser accepts every exact capacity boundary and rejects one-over values extra keys and noncanonical identities or timestamps`
2. `BG-F7 parser rejects duplicate identities cross-project records and impossible chronology`
3. `BG-F7 golden vectors bind every revision event record receipt report envelope and marker`
4. `BG-F7 migration report replays every source index and every live receipt folds to the exact final envelope`
5. `BG-F7 rejects an out-of-order receipt chain even when timestamps tie`
6. `BG-F7 writer replay rejects structurally impossible coherent rehash and derived-result mismatch`
7. `BG-F7 parser preserves the 200-digit decimal boundary and rejects oversized canonical values`

The boundary table exercised by the parameterized tests is exact:

| Boundary | Accept | Reject |
|---|---:|---:|
| records per ledger | 1000 | 1001 |
| records per project | 100 | 101 |
| revisions/history events per record | 100 | 101 |
| receipts per ledger | 10000 | 10001 |
| Proposal inputs per revision | 2 and 8 | 1 and 9 |
| internal id/idempotency key | 300 characters | 301 |
| assumption/declared value/rationale | 500 characters | 501 |
| canonical decimal | 200 total digits, 60 fractional | 201 total or 61 fractional |

Also vary: missing key, extra key, duplicate record/revision/event/receipt id, duplicate idempotency key, noncanonical trimmed id, invalid ISO timestamp, decreasing time, cross-project/scope transplant, wrong kind/requestKind, reordered Service criteria, Product result mismatch, Service summary mismatch, and repeated semantic revision.

- [ ] **Step 2: Add an independent code-point serializer and SHA oracle**

Use this test-only comparison function:

```ts
function compareCodePoints(left: string, right: string): number {
  const leftIterator = left[Symbol.iterator]();
  const rightIterator = right[Symbol.iterator]();
  while (true) {
    const leftPoint = leftIterator.next();
    const rightPoint = rightIterator.next();
    if (leftPoint.done || rightPoint.done) {
      if (leftPoint.done && rightPoint.done) return 0;
      return leftPoint.done ? -1 : 1;
    }
    const leftValue = leftPoint.value.codePointAt(0)!;
    const rightValue = rightPoint.value.codePointAt(0)!;
    if (leftValue !== rightValue) return leftValue < rightValue ? -1 : 1;
  }
}

function stableBgF7OracleValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableBgF7OracleValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => compareCodePoints(left, right))
        .map(([key, item]) => [key, stableBgF7OracleValue(item)]),
    );
  }
  return value;
}

async function bgF7OracleSha256(value: unknown): Promise<`sha256-${string}`> {
  const bytes = new TextEncoder().encode(
    JSON.stringify(stableBgF7OracleValue(value)),
  );
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `sha256-${[...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}
```

Add a second oracle that hashes an input string directly without JSON stringification:

```ts
async function bgF7OracleRawSha256(
  raw: string,
): Promise<`sha256-${string}`> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );
  return `sha256-${[...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}
```

Freeze literal Product and Service vectors for revision, event, record, receipt, migration report, envelope, plus Product pending/verified/committed markers and Service pending/verified/committed markers. Compute each expected digest once with the independent oracles, paste all concrete digests into a `bgF7GoldenDigests` literal, remove any diagnostic print, then compare production output to the literals. Include an object whose key order differs between locale collation and code-point comparison, and include raw strings where object hashing and exact-string hashing deliberately yield different digests.

- [ ] **Step 3: Run parser/hash tests and observe RED**

```bash
npm --prefix prototype run test:app -- --grep "BG-F7 (parser|golden|migration report|rejects an out-of-order|writer replay)"
```

Expected: failures reach the absent Comparison module/API, not existing prerequisite setup.

- [ ] **Step 4: Create the module and storage constants**

Start with:

```ts
import {
  builderProposalsCutoverMarkerKey,
  builderProposalsStorageKey,
  builderProposalRecordIsCurrent,
  builderProposalRevisionFingerprintMatches,
  readBuilderProposalState,
  type BuilderProposalDependencies,
  type BuilderProposalEnvelope,
  type BuilderRecordedProposalRecord,
  type BuilderRecordedProposalRevision,
} from "./builderProposals";
import {
  procurementDispatchSha256Text,
  procurementDispatchWriteLockName,
  type ProcurementDispatchAuthority,
} from "./procurementDispatch";

export const legacyBuilderProductComparisonsStorageKey =
  "chida-prototype-builder-proposal-comparisons:v1";
export const builderProductComparisonsStorageKey =
  "chida-prototype-builder-proposal-comparisons:v2";
export const builderProductComparisonsCutoverMarkerKey =
  `${builderProductComparisonsStorageKey}:cutover:v1`;

export const legacyBuilderServiceComparisonsStorageKey =
  "chida-prototype-builder-service-proposal-comparisons:v1";
export const builderServiceComparisonsStorageKey =
  "chida-prototype-builder-service-proposal-comparisons:v2";
export const builderServiceComparisonsCutoverMarkerKey =
  `${builderServiceComparisonsStorageKey}:cutover:v1`;

function compareUnicodeCodePoints(left: string, right: string): number {
  const leftIterator = left[Symbol.iterator]();
  const rightIterator = right[Symbol.iterator]();
  while (true) {
    const leftPoint = leftIterator.next();
    const rightPoint = rightIterator.next();
    if (leftPoint.done || rightPoint.done) {
      if (leftPoint.done && rightPoint.done) return 0;
      return leftPoint.done ? -1 : 1;
    }
    const leftValue = leftPoint.value.codePointAt(0)!;
    const rightValue = rightPoint.value.codePointAt(0)!;
    if (leftValue !== rightValue) return leftValue < rightValue ? -1 : 1;
  }
}

function stableComparisonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableComparisonValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => compareUnicodeCodePoints(left, right))
        .map(([key, item]) => [key, stableComparisonValue(item)]),
    );
  }
  return value;
}

export function builderComparisonRawHash(
  raw: string,
): `sha256-${string}` {
  return `sha256-${procurementDispatchSha256Text(raw)}`;
}

export function builderComparisonHash(
  value: unknown,
): `sha256-${string}` {
  return builderComparisonRawHash(
    JSON.stringify(stableComparisonValue(value)),
  );
}
```

In `procurementDispatch.ts`, expose only the already-tested raw primitive:

```ts
export function procurementDispatchSha256Text(value: string): string {
  return sha256(value);
}
```

Do not change `stableValue`, `procurementDispatchHash`, Proposal's alias, or the private procurement raw-hash behavior.

- [ ] **Step 5: Move pure Product/Service semantics and replace obsolete currentness**

Move from `Prototype.tsx`:

- Product types/drafts currently around lines 1496–1617.
- Service types/drafts currently around lines 1658–1764.
- Product request key, decimal normalization, draft construction, input normalization, derive, semantic projection, and effective status currently around lines 3264–3570.
- Service request projection, draft construction, input normalization, derive, semantic projection, criteria catalog, and effective status currently around lines 3578–3768.

Replace the removed types/normalizers/derive helpers with imports. Reimplement each effective-status helper against `BuilderProposalEnvelope` plus exact `BuilderProposalDependencies`: every pinned Proposal revision must resolve through canonical Proposal evidence, its record must satisfy `builderProposalRecordIsCurrent`, its head and pinned snapshot must still match, and the requested Comparison revision must be the intended current head. Return `needs-review` on any stale dependency; do not call the older Prototype-only currentness predicate. Product Decision, Service Decision, Negotiation, and their types remain in `Prototype.tsx`. Keep the current Product/Service v1 parser/read and direct persistence paths in place temporarily so every Task 2 checkpoint compiles; Task 3 ports exact v1 parsing into the new module for migration, and Task 6 removes the obsolete Prototype copies when the async adapters take authority.

- [ ] **Step 6: Implement exact v2 finalization and parsing**

Implement distinct Product and Service validators with shared low-level helpers only. Enforce:

- exact ownership and constants from spec sections 5–7;
- stable code-point key ordering and SHA preimages from section 8.6;
- complete `1..version` history/revision chains;
- event↔revision and live event↔receipt bijection;
- exact current projection and current revision id;
- exact report/sourceIndex replay and initial candidate replay from migrated prefixes;
- nondecreasing chronology across report, marker, receipts, events, revisions, record, and envelope;
- Proposal snapshot equality and Proposal legacy/SHA fingerprint evidence;
- Product deterministic BigInt derive and Service fixed-order ten-criterion derive;
- no silent sort/trim/coercion of stored canonical values.

Implement the two public read-only functions in this task. Each reads only its own canonical/marker pair, validates the exact committed anchor and deterministic initial-candidate replay, and returns either a complete envelope or a ledger-level read error. The parser/hash tests inject frozen canonical and marker bytes and reach private validators only through these public readers; no parser-only test export is added.

Export `builderComparisonRevisionFingerprintMatches` so it accepts:

- exact canonical SHA equality; or
- an exact legacy FNV link in `comparison.legacyEvidence` for the same kind, comparison id, revision id, and version, after recomputing that v1 fingerprint.

Reject cross-kind, cross-project, wrong id/version, unverified FNV, or a SHA that is merely structurally well formed.

- [ ] **Step 7: Run GREEN and semantic regressions**

```bash
npm --prefix prototype run test:app -- --grep "BG-F7 (parser|golden|migration report|rejects an out-of-order|writer replay)"
npm --prefix prototype run test:app -- --grep "T7-B1|T7-B2"
(cd prototype && npm exec -- tsc --noEmit)
```

Expected: the seven base contracts pass in all parameterized variants; the existing T7-B1/T7-B2 list remains nine selected tests and all nine pass.

---

## Task 3: Implement independent crash-safe Product and Service cutovers

**Files:**

- Modify: `prototype/src/builderProposalComparisons.ts`
- Modify: `prototype/tests/chida-flow.spec.ts`
- Reference: `prototype/src/builderProposals.ts`
- Reference: `prototype/src/procurementDispatch.ts`

**Interfaces:**

- Consumes: one exact legacy v1 array or its absence, valid Project/Identity authority, readable Proposal envelope, and exact Proposal dependencies.
- Produces: one committed Product v2 envelope/marker or one committed Service v2 envelope/marker.
- Preserves: all v1 source bytes and all six seeded descendant store byte strings.

- [ ] **Step 1: Add canonical test readers and v1 seed helpers**

Add a centralized key map with the following exact shape:

```ts
type BgF7ComparisonKind = "product" | "service";

type BgF7ComparisonKeys = {
  legacy: string;
  canonical: string;
  marker: string;
  decision: string;
};
```

Implement `readBgF7ComparisonAuthority(page, kind)` to return `legacyRaw`, `canonicalRaw`, `markerRaw`, parsed `envelope` or null, and `records`. It selects only the centralized key map; normal reads obtain `records` from a valid canonical v2 envelope, and return an empty array only when that valid envelope is actually empty. Add explicit helpers to seed Product or Service v1 records, read both Comparison authority byte triplets, and snapshot non-null descendant bytes. Keep `bgF6RewriteHistoricalDownstream` an explicit v1-only transformer that rejects envelopes.

- [ ] **Step 2: Add the eleven migration/cutover/isolation RED tests with exact titles**

1. `BG-F7 migration canonicalizes product and service Comparisons while preserving descendant FNV bytes`
2. `BG-F7 migration preserves user actor provenance and marks transfer only through v1 origin`
3. `BG-F7 migration accepts mixed FNV and SHA Proposal pins across one Comparison history`
4. `BG-F7 migration preserves a valid historical Comparison after Proposal head advancement`
5. `BG-F7 migration preserves independent same-target Comparisons and non-head descendant pins`
6. `BG-F7 cutover resumes a valid pending Comparison marker to committed`
7. `BG-F7 cutover resumes a valid verified Comparison marker to committed`
8. `BG-F7 cutover rejects source identity dependency and candidate drift before commit with zero authority`
9. `BG-F7 empty cutover never resurrects a later v1 Comparison array`
10. `BG-F7 canonical marker and future-schema corruption never fall back to v1`
11. `BG-F7 one-ledger cutover failure leaves the other ledger ready`

Parameterize kind-specific cases where applicable. Include separate source, identity, Proposal historical dependency, and candidate-preimage drift cases. Prove a one-ledger failure leaves the other ledger bytes and ready state unchanged.

- [ ] **Step 3: Run migration tests and observe RED**

```bash
npm --prefix prototype run test:app -- --grep "BG-F7 (migration canonicalizes|migration preserves|migration accepts|cutover resumes|cutover rejects|empty cutover|canonical marker|one-ledger)"
```

Expected: the tests fail at absent initialization/cutover behavior.

- [ ] **Step 4: Implement exact source bindings, report, evidence, and markers**

Use the discriminated source unions from spec sections 8.4 and 8.5. Product source can only carry the Product v1 key; Service source can only carry the Service v1 key; `sourceGeneration="none"` requires null key/hash and zero counts.

Port the existing Product/Service v1 parsers from the current `Prototype.tsx` ranges around 12090–12565 into private, kind-specific migration parsers in the new module. Do not export them. For migrated events preserve `actor="شما"` and set only `origin="v1-migration"`. Preserve source ids, versions, revision ids, timestamps, semantic payloads, and ordering. Resolve every legacy Proposal input fingerprint through exact Proposal v2 evidence, store canonical Proposal SHA in the v2 input, and retain the original Comparison FNV link in hashed legacy evidence.

- [ ] **Step 5: Implement each initializer under the shared lock**

Both initializers follow this exact order independently:

1. Enter `procurementDispatchWriteLockName`.
2. Reread authority, dependencies, canonical raw, marker raw, and that kind's v1 raw.
3. If marker is committed, validate canonical plus deterministic initial-candidate replay; never consult v1 as fallback.
4. If source is absent, construct an empty `storeVersion=1` candidate and report.
5. If source exists, exact-parse every record; one invalid item rejects the whole candidate.
6. Write and exact-readback `pending` marker.
7. Reread source, authority, dependencies, and candidate preimage.
8. Write and exact-readback `verified` marker.
9. Write and exact-readback canonical candidate.
10. Write and exact-readback `committed` marker.
11. Return ready only from the validated readback.

Use `builderComparisonRawHash`, not object hash, for exact v1 source raw, pending candidate raw, and canonical raw anchors. Before building or resuming a candidate, obtain the Proposal authority tuple by reading Proposal canonical/marker raw, calling `readBuilderProposalState` with the current context, rereading both raw strings, and requiring byte equality plus a ready committed Proposal envelope.

Valid pending/verified markers resume only when every bound preimage still matches. Canonical before committed is not authority. Never delete v1.

- [ ] **Step 6: Implement readable-history versus mutation-readiness state**

For a committed internally valid ledger:

- valid authority plus dependencies available → `ready/current`;
- valid authority plus dependencies unreadable → `ready/read-error`, preserving readable history;
- authority invalid, canonical invalid, marker invalid, or initial-candidate replay invalid → ledger `read-error`.

Fresh migration and pending/verified resume require both exact authority and exact dependencies; they do not produce partial authority.

- [ ] **Step 7: Run migration GREEN and isolation checks**

```bash
npm --prefix prototype run test:app -- --grep "BG-F7 (migration canonicalizes|migration preserves|migration accepts|cutover resumes|cutover rejects|empty cutover|canonical marker|one-ledger)"
(cd prototype && npm exec -- tsc --noEmit)
```

Expected: all cutovers pass; v1 and descendant bytes are exact; one kind's failure never changes the other.

---

## Task 4: Add exact commands, receipts, idempotency, concurrency, and rollback

**Files:**

- Modify: `prototype/src/builderProposalComparisons.ts`
- Modify: `prototype/tests/chida-flow.spec.ts`
- Reference: `prototype/src/procurementDispatch.ts`

**Interfaces:**

- Consumes: an unknown command plus a commit-time `BuilderComparisonContextReader`.
- Produces: a structured `BuilderComparisonMutationResult` and an exact-readback envelope.
- Serializes: both ledger kinds through `procurementDispatchWriteLockName`.

- [ ] **Step 1: Add named command builders and write/fault probes**

Add these exact test-only seams:

```ts
type BgF7ComparisonCommandOptions = {
  action?: "create-comparison" | "update-comparison";
  comparisonId?: string;
  idempotencyKey?: string;
  expectedStoreVersion?: number;
  expectedComparisonVersion?: number;
  draftOverrides?: Record<string, unknown>;
};

type BgF7ComparisonStorageFault =
  | "pre-write"
  | "readback-mismatch"
  | "rollback-collision"
  | "rollback-write-failure"
  | "rollback-readback-failure";

async function createBgF7ComparisonContext(
  page: Page,
  kind: BgF7ComparisonKind,
): Promise<unknown>;

async function initializeBgF7ComparisonState(
  page: Page,
  kind: BgF7ComparisonKind,
  context: unknown,
): Promise<unknown>;

async function buildBgF7ComparisonCommand(
  page: Page,
  kind: BgF7ComparisonKind,
  context: unknown,
  options?: BgF7ComparisonCommandOptions,
): Promise<{ command: unknown; resolved: unknown }>;

async function executeBgF7ComparisonCommandWithWriteProbe(
  page: Page,
  command: unknown,
  context: unknown,
  keys: BgF7ComparisonKeys,
): Promise<{ result: unknown; writes: Record<string, number> }>;

async function executeBgF7ComparisonCommandWithStorageFault(
  page: Page,
  command: unknown,
  context: unknown,
  keys: BgF7ComparisonKeys,
  fault: BgF7ComparisonStorageFault,
): Promise<{
  result: unknown;
  before: string | null;
  after: string | null;
  writes: Record<string, number>;
}>;
```

Rename/generalize `dispatchBgF6StorageEvent` to `dispatchBuilderStorageEvent` and `holdBgF6WriteLock` to `holdProcurementWriteLock`, updating all BG-F6 callers without changing behavior. Retain `installBackwardBrowserClock`. Use the named seams for a real held lock, two independent pages, exact committed preimages, and every storage fault.

- [ ] **Step 2: Add the twelve command/recovery RED tests with exact titles**

1. `BG-F7 no-op keeps exact bytes while a semantic update appends one revision`
2. `BG-F7 idempotency replays an exact committed attempt after version and dependency drift and rejects every changed command field`
3. `BG-F7 concurrent creates from one store version produce one winner and preserve both records after explicit retry`
4. `BG-F7 concurrent updates to one Comparison produce one winner and one explicit conflict`
5. `BG-F7 product and service commands both succeed under the shared procurement lock`
6. `BG-F7 queued Comparison rereads every Proposal dependency and writes nothing after lineage changes`
7. `BG-F7 migration and live writers clamp timestamps against backward clocks and newer dependency dates`
8. `BG-F7 pre-write storage failure leaves the exact preimage untouched`
9. `BG-F7 readback mismatch restores exact prior bytes`
10. `BG-F7 rollback collision never overwrites a competing writer`
11. `BG-F7 rollback failure returns rollback-failure and locks the ledger as read-error`
12. `BG-F7 missing Web Locks writes nothing`

For idempotency, mutate each payload-bound command field independently: input schema, kind, action, project id, comparison id, normalized draft, pins, expected store version, expected record version. Same key and same payload replays before current version/dependency checks; any changed payload-bound field returns `idempotency-payload-mismatch`. The idempotency key itself selects the namespace and is excluded from `payloadHash`; using the same key in the other kind is valid and must be covered by the shared-lock cross-ledger test.

Within the idempotency test, execute and internally verify a successful command but deliberately discard its returned result before the simulated UI receives it; then retry the unchanged command. Assert receipt replay resolves the same deterministic revision id, event id, receipt position, and record version without a duplicate.

- [ ] **Step 3: Run command tests and observe RED**

```bash
npm --prefix prototype run test:app -- --grep "BG-F7 (no-op|idempotency|concurrent|product and service commands|queued Comparison|migration and live writers|pre-write|readback|rollback|missing Web Locks)"
```

Expected: failures reach the absent command service behavior.

- [ ] **Step 4: Implement exact command parsing and pin construction**

Implement the four-command discriminated union from spec section 11. Before any storage or dependency probe:

- exact-parse the unknown value;
- require kind/draft/target/requestKind agreement;
- normalize the draft without mutating the caller;
- reconstruct the payload hash from every command field except `idempotencyKey`;
- validate 300-character id/key limits and exact expected-version shapes.

The Product and Service pins helpers bind authorization/identity hashes, Proposal store version/fingerprint/dependency hash, target, request snapshot hash, ordered Proposal revision pins, and Service request snapshot hash where applicable.

- [ ] **Step 5: Implement the mutation transaction in exact order**

For both kinds:

1. Parse command.
2. Acquire the shared lock or return `lock-unavailable` with zero writes.
3. Reread and exact-parse committed canonical authority.
4. Look up `(kind, idempotencyKey)` and replay an exact receipt before live drift checks.
5. Reread authority and every Proposal/Request/Approval/Contact/File/source/recovery dependency.
6. Validate expected store/record versions, project/scope, current Proposal records, and exact pins.
7. Re-normalize and re-derive from pinned Proposal revision snapshots.
8. Detect semantic no-op before allocating time, ids, receipt, or bytes.
9. Clamp timestamp against wall clock, migration/marker time, prior canonical time, and every dependency time.
10. Derive live revision and event ids deterministically from `{ schemaVersion: 1, entity: "revision" | "event", kind, action, comparisonId, idempotencyKey, resultingVersion }` with `builderComparisonHash` and the existing kind-specific id prefix. The same attempt therefore regenerates the same ids before a receipt can be confirmed; migrated ids remain untouched.
11. Append revision, event, receipt, record, and envelope with fresh SHA fingerprints.
12. Immediately reread canonical/marker/dependency preimages; abort if any changed.
13. Write candidate, exact-readback candidate and dependencies, and return success only from that readback.

Before allocation, enforce the 1000-ledger, 100-per-project, 100-revision/history, 10000-receipt, 2–8-input, id, text, and decimal capacities. The commit-time dependency reread includes the exact Proposal canonical and committed-marker raw tuple, not only `BuilderProposalDependencies`.

Use result statuses exactly: `created`, `updated`, `unchanged`, `version-conflict`, `dependency-invalid`, `idempotency-payload-mismatch`, `write-failure`, `read-failure`, `rollback-failure`, `lock-unavailable`, `schema-invalid`, `scope-mismatch`, and `not-found`.

- [ ] **Step 6: Implement candidate-owned rollback**

On post-write mismatch:

- reread canonical raw;
- restore previous raw only if current raw is byte-equal to this command's candidate;
- if a competing writer replaced it, return read failure without overwriting;
- exact-readback the restored previous raw;
- if restore write or restore readback fails, return `rollback-failure` and make that ledger read-error;
- never touch the other ledger, legacy source, marker, or descendant stores.

- [ ] **Step 7: Run GREEN, repeat races, and type-check**

```bash
npm --prefix prototype run test:app -- --grep "BG-F7 (no-op|idempotency|concurrent|product and service commands|queued Comparison|migration and live writers|pre-write|readback|rollback|missing Web Locks)"
npm --prefix prototype run test:app -- --grep "BG-F7 concurrent" --list
npm --prefix prototype run test:app -- --grep "BG-F7 concurrent" --repeat-each=5
(cd prototype && npm exec -- tsc --noEmit)
```

If npm argument forwarding rejects `--repeat-each`, run the repeat directly:

```bash
cd prototype
./node_modules/.bin/playwright test tests/chida-flow.spec.ts --grep "BG-F7 concurrent" --repeat-each=5
```

Expected: all focused cases pass. Record the actual concurrency selection count from `--list`; the repeated run must pass exactly five times that selected count, with one deterministic winner per same-ledger race and no lost update.

---

## Task 5: Specify downstream FNV preservation and fresh SHA behavior with RED tests

**Files:**

- Modify: `prototype/src/Prototype.tsx`
- Modify: `prototype/tests/chida-flow.spec.ts`
- Read: `prototype/src/builderProposalComparisons.ts`

**Interfaces:**

- Consumes: seeded legacy FNV descendants and canonical Comparison expectations.
- Produces: four focused failing tests before React is switched from v1 to v2 authority.
- Preserves: production code in this task; GREEN implementation waits until Task 6 has connected canonical React state/writers.

- [ ] **Step 1: Add the four fresh-versus-historical downstream RED tests**

1. `BG-F7 new Product Decision pins canonical Comparison SHA while an existing FNV target stays byte-stable on update`
2. `BG-F7 new Service Decision pins canonical Comparison SHA while an existing FNV target stays byte-stable on update`
3. `BG-F7 new Product Negotiation pins canonical Comparison SHA while an existing FNV target stays byte-stable on update`
4. `BG-F7 new Service Negotiation pins canonical Comparison SHA while an existing FNV target stays byte-stable on update`

Each test must seed a real FNV descendant before cutover, migrate the appropriate Comparison ledger, prove the old descendant reads without byte changes, update that descendant and prove its raw target remains the original FNV, then create a fresh descendant and require canonical SHA.

- [ ] **Step 2: Run the downstream tests and observe RED**

```bash
npm --prefix prototype run test:app -- --grep "BG-F7 new (Product|Service) (Decision|Negotiation)"
```

Expected: historical reads or target-preserving updates fail until the compatibility seams are connected.

---

## Task 6: Connect canonical React state, then make downstream compatibility GREEN

**Files:**

- Modify: `prototype/src/Prototype.tsx`
- Modify: `prototype/tests/chida-flow.spec.ts`
- Read: `prototype/src/builderProposalComparisons.ts`

**Interfaces:**

- Consumes: two independent `BuilderComparisonState` values and one shared current context reader.
- Produces: async Product/Service create/edit adapters with stable attempt replay, exact post-command reread, and evidence-backed Decision/Negotiation lineage.
- Preserves: visible T7 Product/Service flows, descendant storage schemas/bytes, labels, progressive disclosure, focus behavior, project isolation, and no network.

- [ ] **Step 1: Add the six UI/reconciliation RED tests with exact titles**

1. `BG-F7 UI distinguishes loading read-error and empty while preserving a stale draft`
2. `BG-F7 reconciliation invalidates bindings for every watched key and ignores unrelated storage events`
3. `BG-F7 UI replays one ambiguous receipt without duplication`
4. `BG-F7 UI isolates product and service Comparisons to the active project`
5. `BG-F7 product corruption leaves service ready and writable while service corruption leaves product ready and writable`
6. `BG-F7 UI keeps technical authority details collapsed and makes no external request`

The reconciliation test is a parameterized matrix over every watched key from spec section 12, with a separate unrelated-key negative case. For every positive case, assert the editor binding becomes stale while visible draft fields remain unchanged.

- [ ] **Step 2: Run UI tests and observe RED**

```bash
npm --prefix prototype run test:app -- --grep "BG-F7 (UI|reconciliation|product corruption)"
```

Expected: failures reach missing state separation, async attempt replay, or watched Comparison keys.

- [ ] **Step 3: Replace legacy initial reads with two independent states**

Remove direct initial v1-array reads around the current state initialization. Add:

```ts
const [productComparisonState, setProductComparisonState] =
  useState<BuilderComparisonState<BuilderProductComparisonEnvelope>>({
    status: "loading",
    envelope: null,
    dependencyStatus: "unknown",
  });

const [serviceComparisonState, setServiceComparisonState] =
  useState<BuilderComparisonState<BuilderServiceComparisonEnvelope>>({
    status: "loading",
    envelope: null,
    dependencyStatus: "unknown",
  });
```

Build `BuilderComparisonReadContext` from the same exact Project/Identity authority and Proposal dependency snapshot used by BG-F6. The Comparison service itself reads, validates, and exact-rereads Proposal canonical/committed-marker raw bytes as required by the public-boundary rule above. Refresh Proposal first, then initialize/read Product and Service independently, then feed valid records to descendant readers. Retain the existing `disposed` and monotonically increasing `reconcileVersion` guard so an older async refresh cannot overwrite a newer storage event.

- [ ] **Step 4: Add explicit editor binding and stable attempt state**

Use:

```ts
type BuilderComparisonEditorAttempt<Pins> = {
  comparisonId: string;
  idempotencyKey: string;
  normalizedPayloadHash: `sha256-${string}`;
  pins: Pins;
};

type BuilderComparisonEditorBinding<K, Pins> = {
  projectId: string;
  kind: K;
  expectedStoreVersion: number;
  expectedComparisonVersion: number | null;
  attempt: BuilderComparisonEditorAttempt<Pins> | null;
};
```

Create and edit bind at editor open. First save captures a stable comparison id, idempotency key, normalized payload hash, and pins. Unchanged retry reuses the attempt; any draft edit invalidates it. Reconciliation marks binding stale without rebinding or clearing draft.

- [ ] **Step 5: Replace direct writers with async command adapters**

Replace current Product create/update writers around lines 17620–17704 and Service writers around 17765–17852. Each adapter:

- checks independent ledger state, dependency status, binding freshness, and pending flag;
- creates or reuses the stable attempt;
- awaits `executeBuilderComparisonCommand`;
- rereads only the affected ledger from exact storage/context;
- closes editor only on confirmed created/updated/unchanged or exact receipt replay;
- preserves editor/draft/attempt on conflict, dependency drift, lock/write/read/rollback error;
- maps conflict, changed source, read error, and persistence error to distinct Persian messages;
- sends success focus to the existing detail target only after committed reread.

No write call, toast, or optimistic state update is success evidence.

After both adapters are connected and their tests are GREEN, delete the obsolete Product/Service v1 parser/read/persist copies from `Prototype.tsx`. The only remaining v1 Comparison parser is the private migration parser in `builderProposalComparisons.ts`.

- [ ] **Step 6: Add all six Comparison authority keys to reconciliation**

Add exactly:

- Product v1, Product v2, Product marker;
- Service v1, Service v2, Service marker.

Retain every existing upstream Project/Identity, Proposal, Request/recovery, Approval/intent, Contact/intent, File metadata, and Source/recovery key consumed by Proposal currentness. Do not add a hidden redesign of Decision/Negotiation concurrency.

- [ ] **Step 7: Render loading, read-error, empty, ready, and stale states honestly**

- Loading has a loading presentation and disabled submit.
- Read-error has an explicit error and no zero count/empty message.
- Empty appears only for a valid ready envelope with zero project records.
- A stale record remains readable and is labeled for review; it does not make the full ledger unreadable.
- Product and Service error/pending controls remain independent.
- Product/Service UI eligibility and the Decision/Negotiation currentness gates call the exported kind-specific effective-status helpers with the validated Proposal envelope and exact dependencies; they do not retain the older Prototype predicate.
- Technical hashes, receipts, migration reports, and markers stay collapsed.
- “خصوصی”، “ثبت دستی”، and “بدون اثر بیرونی” remain visible.

- [ ] **Step 8: Adapt normal T7 readers and correct misleading rollback titles**

Centralize the Product/Service v1/v2/marker/Decision key maps and make normal reads use `readBgF7ComparisonAuthority(page, kind).envelope.records`. At minimum replace the current non-migration direct-v1 reads around test lines 1405, 16367, 16814, 16968, 17382, 17880, 18004, and 20960. Audit the other direct accesses around 16212, 16427, 16462, 16481, 16530, 16623, 16849, 16866, 16911, 19144, and 20798–20799; retain one only when that exact test is explicitly seeding or mutating a v1 migration/cutover source.

The existing T7 tests around current lines 16381 and 16764 inject a pre-write `setItem` failure, so rename them without changing their assertions:

- `T7-B1 keeps unknown comparison data incomplete and preserves its draft after a failed comparison write`
- `T7-B2 preserves a declared value with unknown assessment and preserves its draft after a failed service comparison write`

Dedicated BG-F7 tests own the true post-write rollback claims.

- [ ] **Step 9: Run UI GREEN and existing T7 regressions**

Verify T7 selection:

```bash
npm --prefix prototype run test:app -- --grep "T7-B1|T7-B2" --list
```

Expected: 9 tests selected.

Run:

```bash
npm --prefix prototype run test:app -- --grep "BG-F7 (UI|reconciliation|product corruption)"
npm --prefix prototype run test:app -- --grep "T7-B1|T7-B2"
(cd prototype && npm exec -- tsc --noEmit)
```

Expected: all focused UI cases and 9/9 T7 tests pass.

- [ ] **Step 10: Replace only literal downstream Comparison fingerprint equality**

Patch these current seams:

- Product Decision parser near current lines 12265–12334.
- Service Decision parser near current lines 12566–12638.
- Product Negotiation evidence resolver near current lines 3815–3830.
- Service Negotiation evidence resolver near current lines 3850–3865.

Replace direct `revision.fingerprint === claimedFingerprint` checks with:

```ts
builderComparisonRevisionFingerprintMatches(
  comparison,
  comparisonRevision,
  target.comparisonRevisionFingerprint,
)
```

Keep every id, version, project, kind, and target check around it.

- [ ] **Step 11: Preserve old Decision targets when adding a new Decision revision**

The Product and Service Decision update paths currently calculate a fresh canonical target before detecting an existing record. In each path set:

```ts
const recordTarget = current?.target ?? target;
```

Use `recordTarget` both in that kind's decision-revision fingerprint function and in a newly created record. An update retains the current record's raw FNV target. Negotiation update already fingerprints with `current.target`; preserve it.

- [ ] **Step 12: Finish canonical-v2 fixture and byte-snapshot adaptation**

- Extend `createExactProductComparisonWithDecision` and `createCompleteServiceComparisonWithDecision` to return canonical `comparison` and `comparisonRevision`.
- Make `createExactServiceNegotiationDraft` consume that returned revision instead of parsing v1.
- Split Comparison authority bytes—legacy/canonical/marker per kind—from descendant bytes in the BG-F6 lineage snapshot helper.
- Update exact object-shape assertions around current test lines 18235–18245 and 18289–18299 to include the new canonical/marker authority fields without weakening equality.
- Keep `bgF6RewriteHistoricalDownstream` v1-only and make it reject an envelope.
- Re-run the repository search for both v1 Comparison key literals; after classification, no normal-flow parse may remain.

- [ ] **Step 13: Run the four Task 5 tests to GREEN and the exact 11-test downstream pack**

```bash
npm --prefix prototype run test:app -- --grep "BG-F7 new (Product|Service) (Decision|Negotiation)"
npm --prefix prototype run test:app -- --grep "T8-A1 also pins a product-line question|T8-A1 pins a private local question draft|T8-A2 makes a response historical after an upstream comparison revision|T8-A3 makes the review historical after an upstream comparison revision|T8-A4 makes the impact historical after an upstream comparison revision|T8-A5a defaults to the exact previous and current product proposal revisions|T8-A5b defaults to the exact previous and current service proposal revisions|BG-F6 migration leaves persisted product, service, and negotiation FNV targets|BG-F6 historical lineage routes survive committed migration|BG-F6 lineage helper and parser reject a coherently rehashed foreign legacy revision link|BG-F6 new downstream lineage pins canonical Proposal SHA" --list
npm --prefix prototype run test:app -- --grep "T8-A1 also pins a product-line question|T8-A1 pins a private local question draft|T8-A2 makes a response historical after an upstream comparison revision|T8-A3 makes the review historical after an upstream comparison revision|T8-A4 makes the impact historical after an upstream comparison revision|T8-A5a defaults to the exact previous and current product proposal revisions|T8-A5b defaults to the exact previous and current service proposal revisions|BG-F6 migration leaves persisted product, service, and negotiation FNV targets|BG-F6 historical lineage routes survive committed migration|BG-F6 lineage helper and parser reject a coherently rehashed foreign legacy revision link|BG-F6 new downstream lineage pins canonical Proposal SHA"
```

Expected: all four new downstream tests pass, `--list` selects exactly 11 legacy regressions, and the run passes 11/11.

- [ ] **Step 14: Prove descendant bytes stay exact and type-check**

Seed non-null raw values and require strict string equality before/after Product cutover, Service cutover, and a normal read for:

- `projectBuilderProposalComparisonDecisionsStorageKey`
- `projectBuilderServiceProposalComparisonDecisionsStorageKey`
- `projectBuilderNegotiationDraftsStorageKey`
- `projectBuilderManualNegotiationResponsesStorageKey`
- `projectBuilderManualNegotiationResponseReviewsStorageKey`
- `projectBuilderManualNegotiationConditionImpactsStorageKey`

Then run:

```bash
(cd prototype && npm exec -- tsc --noEmit)
```

Expected: descendant byte strings remain exact and TypeScript exits 0.

---

## Task 7: Verify the local candidate, perform real mobile QA, document it, and stop for exact-candidate authorization

**Files:**

- Verify: `prototype/src/builderProposalComparisons.ts`
- Verify: `prototype/src/builderProposals.ts`
- Verify: `prototype/src/procurementDispatch.ts`
- Verify: `prototype/src/Prototype.tsx`
- Verify: `prototype/tests/chida-flow.spec.ts`
- Modify: `BUILDER-FEATURE-BACKLOG-FA.md`
- Modify: `CHIDA-CONTINUATION-HANDOFF-FA.md`
- Modify: `CHIDA-PRODUCT-LEARNINGS-FA.md`
- Modify: this implementation plan
- Modify: the approved design spec only by an explicit appended review amendment; preserve its prior text

**Interfaces:**

- Consumes: the complete local BG-F7 candidate.
- Produces: focused test receipts, a final post-review build, runtime integrity, real `390 × 844` QA evidence, documentation, independent review, and a frozen file list.
- Does not produce: release-gate receipt, commit, push, or deployment.

- [x] **Step 1: Prove the frozen title manifest is registered**

Run:

```bash
npm --prefix prototype run test:app -- --grep "BG-F7 " --list
```

Expected: module-load assertions prove `bgF7FrozenBaseTitles` contains exactly 40 unique frozen entries; every one appears in Playwright discovery, with parameterized Product/Service suffixes where applicable. Report the actual expanded discovery count separately. The Proposal-helper test from Task 1 is one additional auxiliary BG-F7 base title and is not counted among the frozen 40.

- [x] **Step 2: Run the full focused BG-F7 suite**

```bash
npm --prefix prototype run test:app -- --grep "BG-F7 "
```

Expected: every selected BG-F7 case passes with zero retry/skip. Record the discovered and passed count from actual output; do not predict it because parameterized variants expand the 40 base titles.

- [x] **Step 3: Run semantic and lineage regressions**

```bash
npm --prefix prototype run test:app -- --grep "T7-B1|T7-B2"
npm --prefix prototype run test:app -- --grep "T8-A1 also pins a product-line question|T8-A1 pins a private local question draft|T8-A2 makes a response historical after an upstream comparison revision|T8-A3 makes the review historical after an upstream comparison revision|T8-A4 makes the impact historical after an upstream comparison revision|T8-A5a defaults to the exact previous and current product proposal revisions|T8-A5b defaults to the exact previous and current service proposal revisions|BG-F6 migration leaves persisted product, service, and negotiation FNV targets|BG-F6 historical lineage routes survive committed migration|BG-F6 lineage helper and parser reject a coherently rehashed foreign legacy revision link|BG-F6 new downstream lineage pins canonical Proposal SHA"
```

Expected: 9/9 T7 and 11/11 selected downstream tests pass.

- [x] **Step 4: Run static/runtime/build checks on the final runtime bytes**

```bash
(cd prototype && npm exec -- tsc --noEmit)
npm --prefix prototype run check:runtime
npm --prefix prototype run build
git diff --check
```

Expected: TypeScript, protected-runtime integrity, Vite/Sites preparation, and whitespace all pass. Run `npm --prefix prototype run test:sites` locally only if the worker, hosting contract, prepare script, or required dist structure changed; otherwise the full gate in Task 8 owns the unchanged Sites suite.

- [x] **Step 5: Perform real `390 × 844` mobile QA**

Start the normal Vite app and inspect a real 390-by-844 viewport. Use visible user flows and verify:

1. Product Comparison create commits once, closes, and focuses the created detail.
2. Product edit preserves decimal/assumption values and appends one revision.
3. Service create/edit preserves all ten criteria in their fixed order and never shows score/rank.
4. A stale conflict keeps the editor and exact draft open with a conflict-specific message.
5. A simulated unreadable Product ledger shows read-error, not empty, while Service remains readable and writable; then reverse the fault.
6. Reload and project switch preserve isolation and do not rebind a stale draft.
7. Technical authority details are collapsed by default.
8. There is no horizontal overflow: `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
9. Console has zero new warning/error.
10. Network log has zero external request caused by Comparison create/edit/read.
11. The visible boundaries still say private/local/manual/no external effect.

Reopen the exact saved Comparison after each successful save; a toast or click alone is not completion proof.

- [x] **Step 6: Update the three living documents before handoff**

In `BUILDER-FEATURE-BACKLOG-FA.md`:

- replace the stale “after BG-F6 unselected” line with BG-F7's actual local status;
- record actual focused/regression/build/QA evidence;
- keep Builder Gate historically FAIL;
- add the existing Product Decision currentness recheck as a separate deferred debt, not hidden BG-F7 scope.

In `CHIDA-CONTINUATION-HANDOFF-FA.md`:

- update the continuation/stop point;
- append BG-F7 scope, module ownership, key topology, compatibility boundary, actual evidence, local/uncommitted/unpublished status, and the only authorized next action;
- do not write dynamic release ids or claim remote state.

In `CHIDA-PRODUCT-LEARNINGS-FA.md`, append four separate subsections:

- observed experience;
- master-document gap/ambiguity;
- decision and current status;
- suggested master-document change.

- [x] **Step 7: Run independent review on the final local diff**

Ask one independent reviewer to check:

- scope leakage;
- parser/hash replay completeness;
- migration/cutover crash states;
- shared-lock and two-ledger isolation;
- idempotency order;
- candidate-owned rollback;
- descendant raw-byte preservation;
- UI draft/attempt behavior;
- test-oracle independence.

Resolve every P0/P1/P2 finding with a new focused RED/GREEN cycle, rerun affected checks, update documents, and repeat review until no actionable finding remains. Any byte change after review invalidates the prior local evidence for that path and must be rechecked proportionally.

- [x] **Step 8: Audit the plan and candidate for incomplete instructions and whitespace**

```bash
rg -n 'T[B]D|T[O]DO|implement[ ]later|similar[ ]to|appropriate[ ]error handling|write[ ]tests for' docs/superpowers/plans/2026-09-02-bg-f7-comparison-authority-concurrency-foundation.md
git diff --check
git status --short
git diff --stat
```

Expected: the first command has no output; whitespace passes; status/stat include exactly the scoped ten-file BG-F7 surface: four code files, one test file, design, plan, and the three living documents.

- [x] **Step 9: Freeze and stop**

After the final local evidence and documentation are complete:

- stop all edits;
- report the exact changed-file list, actual test counts, build/runtime/QA results, and independent-review result;
- state explicitly that `gate:release`, commit, push, Cloudflare, and Sites have not run;
- ask the user for explicit authorization to release that exact frozen candidate.

Do not proceed to Task 8 based on design approval, execution-mode selection, or a generic “continue.” The authorization must unambiguously cover the exact completed candidate and publication destinations.

---

## Task 8: Conditional one-gate, one-commit, one-push, same-source release

**Precondition:** The user has explicitly authorized the exact frozen Task 7 candidate for GitHub, Cloudflare Pages, and owner-only ChatGPT Sites.

**Files:**

- Verify/freeze: every candidate file from Task 7
- Receipt outside tracked tree: `.git/chida-release-gate.json`
- Built artifacts: `prototype/dist`

**Interfaces:**

- Consumes: unchanged authorized bytes.
- Produces: one release-gate receipt, one direct-child commit, one push, one GitHub-triggered Cloudflare deployment, and one owner-only Sites version/deployment from the same SHA/artifact.

- [ ] **Step 1: Reconfirm frozen scope before the gate**

```bash
git status --short
git diff --check
git diff --stat
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Expected: branch `main`; exact Task 7 file list only; no byte changed since authorization.

- [ ] **Step 2: Run the canonical release gate exactly once**

```bash
npm --prefix prototype run gate:release
```

Expected: build/integrity/TypeScript, the entire Playwright app/runtime suite, Sites tests, whitespace, candidate fingerprint, and artifact fingerprint pass; `.git/chida-release-gate.json` is written.

If any step fails, stop. A failed run is not a release receipt. Do not commit, push, deploy, weaken a test, or rerun blindly. Diagnose and repair in a fresh local cycle; any tracked-byte repair creates a new candidate that requires fresh exact-candidate authorization and a fresh one-time gate.

- [ ] **Step 3: Commit exactly the gated bytes**

Stage only:

```bash
git add prototype/src/builderProposalComparisons.ts prototype/src/builderProposals.ts prototype/src/procurementDispatch.ts prototype/src/Prototype.tsx prototype/tests/chida-flow.spec.ts docs/superpowers/specs/2026-09-02-bg-f7-comparison-authority-concurrency-foundation-design.md docs/superpowers/plans/2026-09-02-bg-f7-comparison-authority-concurrency-foundation.md BUILDER-FEATURE-BACKLOG-FA.md CHIDA-CONTINUATION-HANDOFF-FA.md CHIDA-PRODUCT-LEARNINGS-FA.md
git diff --cached --check
git diff --cached --stat
git commit -m "feat: add BG-F7 comparison authority foundation"
```

Expected: one direct-child commit; working tree clean; tracked candidate bytes still match the gate fingerprint.

- [ ] **Step 4: Verify publish eligibility, then push once**

```bash
npm --prefix prototype run gate:publish
git status --short
git push origin main
```

Expected: `gate:publish` confirms clean source/artifact fingerprints and direct-child history; status is empty; one push advances `origin/main` to the local SHA.

- [ ] **Step 5: Verify the GitHub-triggered Cloudflare Pages deployment**

Wait for the Cloudflare Pages deployment triggered by that single GitHub push. Require:

- branch `main`;
- source commit equal to local/origin SHA;
- `commit_dirty=false`;
- terminal status `success`;
- canonical and immutable deployment assets matching the gated local artifact hashes.

Do not trigger a second Cloudflare deployment if the bound GitHub deployment is already the exact successful SHA.

- [ ] **Step 6: Publish the exact gated artifact to owner-only Sites**

Use the Sites building/hosting workflow on `prototype/dist` only after `gate:publish` passes. Save one version bound to the same source SHA and deploy it to the existing CHIDA owner-only/custom site. Reopen the exact version/deployment and verify:

- terminal status `succeeded`;
- source SHA equals GitHub/Cloudflare/local;
- archive/artifact hash matches the gated artifact;
- access remains one owner, no public guest/group expansion.

- [ ] **Step 7: Deliver terminal receipts without changing tracked bytes**

Report:

- final commit SHA and `origin/main` equality;
- gate source/artifact fingerprints and file counts;
- full Playwright and Sites counts;
- Cloudflare deployment id/status/source SHA;
- Sites version id, deployment id, archive hash, status, and owner-only access;
- explicit statement that all three destinations use one source SHA;
- explicit statement that Builder Gate is still historically FAIL and BG-F7 added no model/backend/network/send/supplier behavior.

Do not append these dynamic receipts to tracked documents after the gate. Start a later read-only continuation or next remediation only after this release is terminal and the user gives a fresh task.

---

## Spec-to-Task Traceability

| Approved design section | Implementation task(s) | Evidence |
|---|---|---|
| 1. Goal/scope | Global constraints, 7, 8 | scoped diff, living docs, terminal report |
| 2. One service/two ledgers | 2, 3, 4 | module boundary, isolation and shared-lock tests |
| 3. Current-state problem | 1–6 | RED reproductions against v1/direct writers |
| 4. Keys/topology + Amendment A-001 | 2, 3, 4, 6 | eight exact keys, durable incident state machine, and storage-event matrix |
| 5. Shared authority | 2, 3, 4 | ownership/target/snapshot/envelope parser tests |
| 6. Product model | 2, 4, 6 | T7-B1, decimal boundaries, Product UI QA |
| 7. Service model | 2, 4, 6 | T7-B2, criteria ordering, Service UI QA |
| 8. Event/receipt/evidence/hash | 2–6 | golden vectors, replay, idempotency, FNV compatibility |
| 9. Dependency/effective status | 1, 3, 4, 6 | Proposal helper, queued drift, stale/read-error UI |
| 10. Migration/cutover | 3 | pending/verified/committed, drift, empty cutover |
| 11. Commands/mutation | 4 | no-op, race, readback, rollback fault matrix |
| 12. UI/reconciliation | 6 | binding/attempt and watched-key tests, mobile QA |
| 13. Decision/Negotiation compatibility | 5–6 | four new descendant tests plus 11 regressions |
| 14. TDD/evidence | 1–7 | all 40 frozen titles and focused RED/GREEN logs |
| 15. QA/release | 7, 8 | build/runtime/mobile review, then conditional full gate |
| 16. Local delivery | 7 | frozen local evidence and explicit stop |
| 17. Execution order | 1–8 | task sequence in this plan |

---

## Amendment A-001 — review-driven recovery/parser closure — ۲۰۲۶/۰۹/۰۳

این amendment تاریخچهٔ plan را حفظ و موارد زیر را برای candidate نهایی supersede می‌کند:

1. **Topology:** مرز شش‌کلیدی اولیه به هشت کلید تغییر می‌کند: legacy/canonical/marker/rollback-incident برای هرکدام از Product و Service. incident با schema دقیق `prepared → resolved(committed|rolled-back)` پیش از canonical write ماندگار و readback می‌شود؛ همان idempotency/payload، hash دقیق preimage/candidate، زمان‌ها و fingerprint را bind می‌کند. invalid/unresolved/ambiguous state fail-close است و فقط retry همان command زیر lock مشترک می‌تواند recovery را اثبات کند. reconciliation هر دو incident key را نیز دنبال می‌کند.
2. **Proposal validation seam:** `builderProposalRevisionIsCanonical(value)` در کنار `builderProposalRecordIsCurrent` یک export خالص و فقط‌خواندنی است تا snapshot تعبیه‌شدهٔ ProposalRevision بدون تکرار validator Proposal exact سنجیده شود. schema، writer و persisted bytes Proposal تغییر نمی‌کنند.
3. **Canonical order:** serialization، hash و ترتیب record/revision/event که مالک آن Comparison است، در production و oracle مستقل با emitter رشته‌ای recursive و comparator واقعی Unicode scalar/code-point سنجیده می‌شود؛ بنابراین `Object.fromEntries` نمی‌تواند کلیدهای integer-index را دوباره مرتب کند. goldenهای ثابت BMP/astral و `"10"/"2"` این دو مرز را متمایز می‌کنند و هر مقدار `undefined/function/symbol/bigint/non-finite` در هر عمق به‌عنوان non-JSON رد می‌شود. `ProjectTaskAuthority.projectIds` یک dependency بیرونی با قرارداد تاریخی UTF-16 lexicographic است؛ Comparison نه آن را بازتعریف می‌کند و نه normalize، و inference مخصوص replay باید همان ترتیب upstream را عیناً بازتولید کند.
4. **Parser closure:** uniqueness record/revision/event در سطح کل ledger است و تست‌های coherent-rehash برخورد migrated↔migrated و migrated↔live را برای دو خانواده می‌پوشانند.
5. **Decimal boundary:** درصد مستقیماً coefficient/scale نهایی را محاسبه می‌کند تا intermediate پیش از `/100` سقف ۲۰۰ رقم را زودهنگام اعمال نکند؛ vector ۱۹۹رقمی × ۱۰۰٪ frozen می‌شود.
6. **UI race:** Product و Service، project id ثبت‌شده را پس از await دوباره می‌سنجند؛ drift پروژه draft/binding/stable attempt را نگه می‌دارد، submit را در پروژهٔ دیگر می‌بندد و پس از بازگشت فقط exact receipt replay را مجاز می‌کند. تست دومرحله‌ای lock-held/result-barrier این مسیر را برای هر دو kind اثبات می‌کند.
7. **Verification command:** همهٔ checkpointهای TypeScript با `(cd prototype && npm exec -- tsc --noEmit)` اجرا می‌شوند؛ فرم root-prefixed در npm 11.19.0 receipt معتبر نیست.
8. **UI receipt replay:** اعتبار `liveInputs/livePreview` فقط برای attempt تازه لازم است؛ stable attempt با hash و project binding دقیق، اگر binding تازه دیگر exact نباشد، فقط از مسیر اتمیک `replay-only` زیر همان Web Lock مشترک به command layer می‌رسد. این مسیر فقط exact receipt replay یا recovery دقیق incident آمادهٔ همان command را می‌پذیرد و پیش از هر mutation تازه، نبود receipt/incident متناظر یا payload متفاوت را با conflict fail-close می‌کند. regression واقعی UI برای Product و Service هم committed receipt پس از readback fault و historical شدن Contact، و هم stale attempt بدون receipt پس از rollback را می‌پوشاند؛ اولی بدون تغییر bytes replay و دومی بدون ساخت mutation تازه رد می‌شود.
9. **Final local evidence after all review fixes:** discovery متمرکز ۴۲ case را ثبت کرد؛ روی آخرین runtime/test bytes، BG-F7 برابر ۴۲/۴۲ در ۷٫۳ دقیقه، T7 برابر ۹/۹ در ۱٫۲ دقیقه و downstream منتخب برابر ۱۱/۱۱ در ۱٫۸ دقیقه، همگی سریال و بدون retry/skip پاس شدند. REDهای واقعی ابتدا preview مرزی ۱۹۹رقمی × ۱۰۰٪، committed receipt replay پس از dependency drift، stale attempt بدون receipt، ترتیب scalar کلیدهای integer-index، replay پروژهٔ معتبر `__proto__` و nested non-JSON را شکست‌خورده نشان دادند؛ همه پس از fix سبز شدند. replayهای Contact/project-switch هر سه bytes canonical/marker/incident را ثابت و preview مقدار live را مستقیم می‌سنجد. TypeScript پشتیبانی‌شده، integrity هر ۲۸ فایل، build نهایی همراه Sites preparation و diff-check tracked/untracked پاس شدند؛ تنها warning build همان chunk-size شناخته‌شده بود. اجرای موازیِ نامعتبر downstream که با teardown پورت مشترک `ERR_CONNECTION_REFUSED` داد receipt محسوب نشد و اجرای سریال نهایی ۱۱/۱۱ جای آن را گرفت.
10. **Review closure and freeze:** بازبینی مستقل نهایی پس از آخرین serializer/replay fix هیچ finding باز Critical/Important/Minor گزارش نکرد. exact surface همان ده فایل plan است؛ candidate local/uncommitted/unpublished منجمد می‌شود و تنها اقدام بعدی درخواست مجوز صریح full gate و انتشار same-SHA در مقصدهای تعیین‌شده است.
11. **Release-gate oracle closure:** نخستین گیت تازه build را پاس کرد اما case قدیمی Mock در ۱۰۳/۴۹۷ شکست خورد و ادامهٔ suite عمداً متوقف شد؛ attempt receipt نیست. اجرای سریال ۱/۱ همان failure را بازتولید و نشان داد snapshot تست پیش از پایان cutoverهای پس‌زمینهٔ Comparison ثبت می‌شود. انتظار شرطی committed markerهای Product/Service پیش از snapshot، بدون تغییر رفتار محصول، ۱/۱ و تکرار موازی ۱۰/۱۰ پاس شد. تغییر test/doc bytes یک freeze و full gate تازه لازم دارد.

این amendment دامنهٔ Task 7 را فقط به بستن findingهای بازبینی و هم‌ترازکردن قرارداد با recovery موجود محدود می‌کند. full gate، commit، push و deployment همچنان فقط Task 8 و مشروط به مجوز تازهٔ exact candidate هستند.
