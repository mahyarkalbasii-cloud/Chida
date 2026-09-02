# Release Gate Acceleration Design

## Objective

Reduce the Playwright critical path of `gate:release` without removing, skipping, retrying, or weakening any existing test and without changing CHIDA product behavior.

## Current evidence

- The current baseline is `main@7cab540ffad3e501e76a75c08a0e6462e36b7cea` with a clean tree aligned to `origin/main` before this slice.
- The latest successful full run on that exact product baseline executed 463 Playwright tests in 30.3 minutes; the 455-test application file accounted for 30.2 minutes.
- `chida-flow.spec.ts` is 24,485 lines. Most tests are top-level and receive isolated Playwright browser contexts, but helpers for successive domains are interleaved throughout the file.
- The host exposes 14 logical CPUs and 36 GiB memory.
- `test:sites`, build, fingerprints, and `gate:publish` are not material contributors to the measured Playwright critical path.

## Chosen slice

Use Playwright's test-level `fullyParallel` scheduling with a conservative fixed ceiling of two workers for the application portion of `test:all`. Keep the eight gesture/runtime tests in their own one-worker invocation, keep `test:app` and `test:runtime` unchanged for focused diagnosis, and retain an explicit compatibility command with the former scheduler.

The first four-worker diagnostic run exposed two deterministic test-oracle races in Memory scenarios. Subsequent two-worker full-suite diagnostic runs exposed five more instances in Purchase Request, Dispatch Draft, and Proposal scenarios. Each clicked an asynchronous Web-Lock-backed mutation and immediately read storage without waiting for the visible committed state. Every edited path passed serially, failed under repeated parallel scheduling, and passed after adding only an existing visible terminal-state expectation. Assertions, timeouts, and product behavior remain unchanged.

Physical decomposition of `chida-flow.spec.ts` is deferred unless the parallel pilot fails its safety or performance acceptance criteria. This avoids moving thousands of behavior-test lines merely to unlock scheduling that Playwright already provides directly.

## Invariants

- `gate:release` still runs build, all Playwright tests, Sites tests, whitespace validation, and exact source/artifact fingerprints.
- The discovered Playwright count may not drop below 463 on this baseline.
- No `test.skip`, retry, timeout increase, assertion relaxation, product-code edit, schema/storage change, or deployment change is allowed. A test-body edit is permitted only after an old timing oracle fails under the parallel reproduction and the replacement waits for an existing user-visible terminal state.
- The canonical release candidate still receives exactly one full `gate:release` after its documentation and tooling bytes are frozen.
- A failed or flaky parallel pilot does not become canonical; the former scheduler remains available through `test:all:compat`.
- During implementation and pilot measurement, this slice did not itself authorize commit, push, Cloudflare deployment, or ChatGPT Sites publication. Mahyar later granted that exact publication authority on 2026-09-02; because the required approval record changed source bytes, publication requires one fresh gate on the final freeze. Builder Architecture Gate rerun, model/backend/network work, and supplier work remain unauthorized.

## Acceptance evidence

1. Separate `--list` discovery finds exactly 455 application tests and 8 runtime tests, for an unchanged union of 463.
2. Two consecutive full pilot runs over identical product/test/tooling bytes pass 463/463 with retries disabled.
3. Each pilot's combined Playwright wall time is at most 20 minutes, a minimum 34% reduction from the 30.3-minute baseline.
4. The package command makes only the application portion of the full suite parallel, keeps runtime tests serial, and exposes the former scheduling as `test:all:compat`.
5. After documentation is finalized, one fresh `npm run gate:release` passes on the frozen candidate and records the normal exact-byte receipt.

## Measured pilot result

- Environment: macOS 26.6.2 on the same 14-logical-CPU, 36-GiB host; Node.js 26.7.0, npm 11.19.0, Playwright 1.61.1, installed dependencies and normal warm local caches. No cache-clearing step was introduced between pilots.
- Pilot 1: 455/455 application tests in 944.76 seconds plus 8/8 runtime tests in 8.66 seconds; 953.42 seconds (`15:53.42`) combined.
- Pilot 2 on identical bytes: 455/455 application tests in 931.47 seconds plus 8/8 runtime tests in 12.25 seconds; 943.72 seconds (`15:43.72`) combined.
- Both pilots had zero failures and zero retries. Against the 30.3-minute baseline, the measured reductions are approximately 47.6% and 48.1%.

## Fallback

If a pilot fails, first classify the failure against a serial focused reproduction. Do not promote the parallel command until the cause is removed and two identical-byte full pilots pass. If failures demonstrate unavoidable cross-test coupling, keep `test:all` unchanged and create a later, separately reviewed physical test-file decomposition.
