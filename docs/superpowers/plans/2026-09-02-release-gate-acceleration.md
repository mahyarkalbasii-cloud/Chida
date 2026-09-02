# Release Gate Acceleration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut the full Playwright release-gate critical path while preserving all 463 tests and every existing release invariant.

**Architecture:** Keep product behavior unchanged. Harden only timing oracles that fail under a reproduced parallel load, prove isolated test-level scheduling with two identical-byte pilots, then run the application suite with two-worker `fullyParallel` scheduling and the eight runtime gesture tests serially while retaining the former scheduler as an explicit compatibility command.

**Tech Stack:** Node.js, npm, Playwright 1.61.1, React/Vite prototype, existing release-gate scripts.

**Spec:** `docs/superpowers/specs/2026-09-02-release-gate-acceleration-design.md`

## Global Constraints

- Work directly on the existing `main` checkout because the user's standing CHIDA instruction forbids a new worktree and the user explicitly authorized this slice.
- Do not change product code, test count, retries, timeouts, assertions, schemas, storage, runtime locks, deployment paths, or release fingerprints. Test-body edits require a red parallel reproduction and may add only a condition wait for an existing terminal state.
- During implementation and pilot measurement, do not commit, push, deploy, publish, or rerun the Builder Architecture Gate. Mahyar separately authorized exact REL-2 commit/push/publication on 2026-09-02 after observing the result; Builder Architecture Gate rerun remains unauthorized.
- Keep the canonical `gate:release` sequence and evidence set unchanged.
- Run the full release gate exactly once, only after candidate documentation and tooling bytes are frozen.

---

### Task 1: Characterize and prove parallel scheduling

**Files:**
- Read: `prototype/tests/chida-flow.spec.ts`
- Read: `prototype/tests/mobile-runtime.spec.ts`
- Read: `prototype/playwright.config.ts`
- Read: `prototype/package.json`

**Interfaces:**
- Consumes: the existing Playwright suite and unchanged Vite web server.
- Produces: repeatable count, pass/fail, and wall-time evidence for the two-worker application scheduler plus serial runtime suite.

- [x] **Step 1: Confirm discovery count without executing tests**

Run:

```bash
cd prototype
./node_modules/.bin/playwright test tests/chida-flow.spec.ts --fully-parallel --workers=2 --list
./node_modules/.bin/playwright test tests/mobile-runtime.spec.ts --workers=1 --list
```

Expected: exactly 455 application tests and 8 runtime tests are listed; their union is 463.

- [x] **Step 2: Reproduce and harden any scheduling-sensitive oracle**

For each observed failure, run its exact title once with `--workers=1`, then under the failing parallel scheduler with `--repeat-each=5`. If and only if the serial run passes and the parallel repetition exposes a read-before-commit oracle, add an existing visible terminal-state expectation before the storage assertion. Rerun the same parallel repetition and require every repetition to pass.

- [x] **Step 3: Run the first full pilot**

Run:

```bash
cd prototype
MOBILE_RUNTIME_TEST_PORT=4280 /usr/bin/time -p ./node_modules/.bin/playwright test tests/chida-flow.spec.ts --fully-parallel --workers=2 --reporter=dot
MOBILE_RUNTIME_TEST_PORT=4281 /usr/bin/time -p ./node_modules/.bin/playwright test tests/mobile-runtime.spec.ts --workers=1 --reporter=dot
```

Expected: 455 application tests and 8 runtime tests pass, zero fail, zero retry, and combined wall time is at most 20 minutes.

- [x] **Step 4: Run the second full pilot without changing bytes**

Run the exact commands from Step 3 again before editing any product, test, configuration, tooling, or documentation file.

Expected: 463 passed again, zero failed, zero retried, wall time at most 18 minutes.

### Task 2: Promote the proven scheduler with a compatibility fallback

**Files:**
- Modify: `prototype/package.json`

**Interfaces:**
- Consumes: Playwright CLI `--fully-parallel` and `--workers=2`.
- Produces: canonical `test:all` parallel scheduling and `test:all:compat` former scheduling.

- [x] **Step 1: Apply the minimal script change**

Set the scripts to these exact values:

```json
"test:all": "playwright test tests/chida-flow.spec.ts --fully-parallel --workers=2 && playwright test tests/mobile-runtime.spec.ts --workers=1",
"test:all:compat": "playwright test",
```

- [x] **Step 2: Verify command discovery after promotion**

Run:

```bash
cd prototype
./node_modules/.bin/playwright test tests/chida-flow.spec.ts --fully-parallel --workers=2 --list
./node_modules/.bin/playwright test tests/mobile-runtime.spec.ts --workers=1 --list
```

Expected: Playwright accepts both promoted invocations and lists exactly 455 application plus 8 runtime tests.

- [x] **Step 3: Inspect scope**

Run:

```bash
git diff -- prototype/package.json prototype/playwright.config.ts prototype/tests
```

Expected: `prototype/package.json` and only condition-wait lines backed by a red reproduction changed; Playwright config and all other test bodies are byte-identical.

### Task 3: Record the measured engineering decision

**Files:**
- Modify: `BUILDER-FEATURE-BACKLOG-FA.md`
- Modify: `CHIDA-PRODUCT-LEARNINGS-FA.md`
- Modify: `CHIDA-CONTINUATION-HANDOFF-FA.md`

**Interfaces:**
- Consumes: the exact count and timing results from Tasks 1 and 2.
- Produces: a non-product `REL-2` record that distinguishes pilot evidence from final gate evidence.

- [x] **Step 1: Add REL-2 status with measured values**

Record both pilot wall times, test counts, worker ceiling, unchanged coverage, fallback command, and local/uncommitted/unpublished status. Do not claim a final gate result yet.

- [x] **Step 2: Record the decision boundary at implementation freeze**

State that no product behavior or master product definition changed, physical spec splitting remains conditional, and commit/push/deploy were not authorized by the implementation slice itself. The later explicit publication approval is recorded separately and requires a fresh final gate after its documentation changes.

- [x] **Step 3: Validate prose and whitespace**

Run:

```bash
git diff --check
```

Expected: exit 0.

### Task 4: Freeze and verify the release candidate once

**Files:**
- Verify: all files changed by this plan.
- Generated receipt outside the tracked tree: `.git/chida-release-gate.json`.

**Interfaces:**
- Consumes: frozen tooling and documentation bytes.
- Produces: the normal release-gate receipt bound to the exact candidate and artifact fingerprints.

- [x] **Step 1: Review the complete diff and freeze bytes**

Run:

```bash
git status --short
git diff --stat
git diff --check
```

Expected: only the scoped tooling/plan/status documents changed and whitespace is valid.

- [ ] **Step 2: Run the canonical release gate exactly once**

Run:

```bash
cd prototype
npm run gate:release
```

Expected: build/runtime checks pass, 455/455 application tests pass under two-worker fully-parallel scheduling, 8/8 runtime tests pass serially, 4/4 Sites tests pass, and the normal receipt is recorded.

- [ ] **Step 3: Append the final evidence without changing candidate bytes**

Do not edit tracked files after the successful gate. Report the final gate timing and fingerprints only in the delivery message so the receipt remains valid for the exact frozen bytes.
