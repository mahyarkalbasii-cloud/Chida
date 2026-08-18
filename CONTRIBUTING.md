# Contributing to CHIDA

CHIDA is currently at the product-baseline and implementation-readiness stage. The repository intentionally does not select an application framework yet.

## Before starting

1. Read `README.md`, `DECISIONS.md`, and the owner document for the area you will change.
2. Check `docs/implementation-readiness.md` for unresolved dependencies.
3. Record durable technical choices as an ADR under `docs/architecture/`.
4. Create a focused branch with a clear English name.

## Product changes

A change to a final product decision must:

- state the new evidence or reason;
- mark the previous decision as superseded when applicable;
- add the new decision and history entry in `DECISIONS.md`;
- update all affected owner documents in the same pull request.

Do not convert a proposal or open question into implemented behavior without this step.

## Engineering changes

- Keep permissions, state transitions, validation, calculations, and audit behavior deterministic.
- Use synthetic data in development and tests.
- Make every implemented journey complete, interactive, and recoverable.
- Add tests proportionate to the risk of the change.
- Document any new setup, environment variables, commands, or external services.
- Never include secrets or real project/customer data in commits, logs, fixtures, screenshots, or pull requests.

## Local validation

Run:

```powershell
pwsh ./scripts/verify-docs.ps1
```

When a runtime is introduced, its lint, type-check, test, and build commands must be added here and to CI in the same pull request.

## Pull requests

Pull requests should explain what changed, why, the affected product decision or acceptance criterion, verification performed, and any unresolved risk. Keep unrelated changes out of the branch.
