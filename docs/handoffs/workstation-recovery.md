# CHIDA Workstation Recovery

- **Status:** Repository recovery handoff
- **Repository:** `https://github.com/mahyarkalbasii-cloud/Chida`
- **Canonical branch:** `main`
- **Visibility:** Private

## What is recoverable

The current CHIDA product baseline, governance files, integrity checks, research proposals, operational handoffs, and complete reachable Git history are stored in the private GitHub repository. No runtime application or production data exists in this workspace yet.

This handoff covers only the workspace represented by this repository. Historical CHIDA Final, CHIDA-Sol, prototypes, credentials, desktop applications, and files in other workspaces are outside this repository.

## External recovery dependency

Access to the GitHub account `mahyarkalbasii-cloud` is required because the repository is private. Before deleting the old computer:

1. verify the account password and MFA method;
2. store GitHub recovery codes outside this repository;
3. confirm access from the new computer or another trusted device;
4. do not commit tokens, recovery codes, SSH private keys, or credential-manager data.

## Minimum tools on the new computer

- Git;
- PowerShell 7 (`pwsh`);
- access to the private GitHub repository.

GitHub CLI, `actionlint`, and PSScriptAnalyzer are useful but not required to recover the current documentation baseline.

## Clone

Using GitHub CLI:

```powershell
gh auth login
gh repo clone mahyarkalbasii-cloud/Chida
Set-Location Chida
```

Or using Git directly after GitHub HTTPS/SSH authentication is configured:

```powershell
git clone https://github.com/mahyarkalbasii-cloud/Chida.git
Set-Location Chida
```

## Verify recovery

```powershell
git switch main
git pull --ff-only
git status --short --branch
git rev-parse HEAD
git ls-remote origin refs/heads/main
pwsh -NoLogo -NoProfile -NonInteractive -File ./scripts/verify-docs.ps1
```

Expected properties:

- local `HEAD` and `refs/heads/main` from `git ls-remote` are the same SHA;
- status is clean and tracks `origin/main`;
- the verification script exits with code zero and prints `DOCUMENTATION_OK`;
- GitHub Actions shows the latest `Docs Check` run for that SHA as successful.

## Machine-local items intentionally not stored

- GitHub or Git credentials and MFA recovery material;
- local `.git` reflog, credential manager, tool caches and superseded unreachable drafts after any unique product dependency has been reconciled into tracked documents;
- installed copies of Git, PowerShell, `actionlint` and PSScriptAnalyzer;
- editor preferences excluded by `.gitignore`;
- production secrets, user data and uploaded files.

These exclusions are deliberate. None is a final CHIDA project artifact.

## Current engineering boundary

The repository is documentation/governance-ready, not production-ready. Before application code is added:

1. read `README.md`, `DECISIONS.md` and the feature owner document;
2. review `docs/implementation-readiness.md`;
3. treat files under `docs/proposals/` as non-authoritative research;
4. accept only the ADRs needed by the first vertical slice;
5. add documented install, lint, type-check, test, build and local-run commands with the first application code.

## Safe deletion gate

Run a final local-only audit before deleting the old workspace:

```powershell
git status --short --branch --untracked-files=all
git status --short --ignored
git stash list
git branch --verbose --verbose
git rev-list --all --not --remotes=origin
git worktree list
```

Inspect every line. Preserve meaningful untracked or ignored project files without committing credentials, caches, production data, or other prohibited content. Any stash, extra branch, worktree, or local-only commit must be deliberately reconciled before deletion.

The old workspace can be deleted only after all of these are true:

- the intended changes have been committed and pushed to GitHub `main`;
- the final local-only audit above has no unresolved project artifact;
- the local and remote SHAs match;
- the latest GitHub `Docs Check` for that SHA succeeds;
- a fresh clone on the new computer passes `./scripts/verify-docs.ps1`;
- GitHub account recovery access has been confirmed independently.
