import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { lstat, readFile, readdir, readlink, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const prototypeRoot = resolve(dirname(scriptPath), "..");
const repositoryRoot = git(["rev-parse", "--show-toplevel"], prototypeRoot);
const markerFromGit = git(["rev-parse", "--git-path", "chida-release-gate.json"], repositoryRoot);
const markerPath = isAbsolute(markerFromGit)
  ? markerFromGit
  : resolve(repositoryRoot, markerFromGit);

function git(args, cwd = repositoryRoot) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function listCandidateFiles() {
  const output = execFileSync("git", [
    "ls-files",
    "--cached",
    "--others",
    "--exclude-standard",
    "-z",
  ], { cwd: repositoryRoot });

  return output
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, "en"));
}

async function listUntrackedFiles() {
  const output = execFileSync("git", ["ls-files", "--others", "--exclude-standard", "-z"], { cwd: repositoryRoot });
  return output.toString("utf8").split("\0").filter(Boolean);
}

export async function validateCandidateWhitespace() {
  for (const args of [["diff", "--check"], ["diff", "--cached", "--check"]]) {
    execFileSync("git", args, { cwd: repositoryRoot, stdio: "inherit" });
  }
  for (const relativePath of await listUntrackedFiles()) {
    const absolutePath = resolve(repositoryRoot, relativePath);
    let metadata;
    try {
      metadata = await lstat(absolutePath);
    } catch (error) {
      if (error && typeof error === "object" && error.code === "ENOENT") continue;
      throw error;
    }
    if (!metadata.isFile() && !metadata.isSymbolicLink()) continue;
    const result = spawnSync("git", ["diff", "--no-index", "--check", "--", "/dev/null", relativePath], {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
    if (result.error) throw result.error;
    const diagnostics = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    if (diagnostics) throw new Error(diagnostics);
    if (result.status !== 0 && result.status !== 1) {
      throw new Error(`Whitespace validation failed for ${relativePath}.`);
    }
  }
}

async function fingerprintPaths(files, { skipMissing }) {
  const hash = createHash("sha256");
  let fileCount = 0;

  for (const relativePath of files) {
    const absolutePath = resolve(repositoryRoot, relativePath);
    if (!absolutePath.startsWith(`${repositoryRoot}${sep}`)) {
      throw new Error(`Release candidate contains an unsafe path: ${relativePath}`);
    }
    let metadata;
    try {
      metadata = await lstat(absolutePath);
    } catch (error) {
      if (skipMissing && error && typeof error === "object" && error.code === "ENOENT") continue;
      throw error;
    }
    const mode = metadata.isSymbolicLink()
      ? "120000"
      : metadata.isFile()
        ? metadata.mode & 0o111 ? "100755" : "100644"
        : null;
    if (!mode) throw new Error(`Unsupported release candidate entry type: ${relativePath}`);

    hash.update(relativePath);
    hash.update("\0");
    hash.update(mode);
    hash.update("\0");
    hash.update(metadata.isSymbolicLink() ? await readlink(absolutePath) : await readFile(absolutePath));
    hash.update("\0");
    fileCount += 1;
  }

  return {
    fingerprint: hash.digest("hex"),
    fileCount,
  };
}

export async function fingerprintReleaseCandidate() {
  return fingerprintPaths(await listCandidateFiles(), { skipMissing: true });
}

async function listReleaseArtifactFiles(absoluteDirectory, relativeDirectory) {
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = `${relativeDirectory}/${entry.name}`;
    if (entry.isDirectory()) files.push(...await listReleaseArtifactFiles(resolve(absoluteDirectory, entry.name), relativePath));
    else files.push(relativePath);
  }
  return files.sort((left, right) => left.localeCompare(right, "en"));
}

export async function fingerprintReleaseArtifact() {
  let files;
  try {
    files = await listReleaseArtifactFiles(resolve(prototypeRoot, "dist"), "prototype/dist");
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      throw new Error("The release artifact is missing. Run `npm run gate:release` to build and validate it.");
    }
    throw error;
  }
  const requiredFiles = [
    "prototype/dist/client/index.html",
    "prototype/dist/server/index.js",
    "prototype/dist/.openai/hosting.json",
  ];
  if (requiredFiles.some((requiredPath) => !files.includes(requiredPath))) {
    throw new Error("The release artifact is incomplete. Run `npm run gate:release` again.");
  }
  return fingerprintPaths(files, { skipMissing: false });
}

export async function recordReleaseGate(snapshot, artifact) {
  const verifiedSnapshot = snapshot ?? await fingerprintReleaseCandidate();
  const verifiedArtifact = artifact ?? await fingerprintReleaseArtifact();
  const receipt = {
    version: 3,
    recordedAt: new Date().toISOString(),
    headAtVerification: git(["rev-parse", "HEAD"]),
    branchAtVerification: git(["branch", "--show-current"]),
    candidateFingerprint: verifiedSnapshot.fingerprint,
    candidateFileCount: verifiedSnapshot.fileCount,
    artifactFingerprint: verifiedArtifact.fingerprint,
    artifactFileCount: verifiedArtifact.fileCount,
    gate: "npm run gate:release",
  };

  await writeFile(markerPath, `${JSON.stringify(receipt, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });

  return receipt;
}

export async function checkPublishCandidate() {
  let receipt;
  try {
    receipt = JSON.parse(await readFile(markerPath, "utf8"));
  } catch {
    throw new Error(
      "No valid release gate receipt exists. Run `npm run gate:release` on the final release candidate first.",
    );
  }

  if (
    receipt?.version !== 3 ||
    !/^[a-f0-9]{64}$/.test(receipt.candidateFingerprint) ||
    !Number.isSafeInteger(receipt.candidateFileCount) ||
    receipt.candidateFileCount < 1 ||
    !/^[a-f0-9]{64}$/.test(receipt.artifactFingerprint) ||
    !Number.isSafeInteger(receipt.artifactFileCount) ||
    receipt.artifactFileCount < 3 ||
    typeof receipt.branchAtVerification !== "string" ||
    !receipt.branchAtVerification ||
    !/^[a-f0-9]{40,64}$/.test(receipt.headAtVerification)
  ) {
    throw new Error(
      "The release gate receipt is invalid. Run `npm run gate:release` again.",
    );
  }

  const statusBefore = git(["status", "--porcelain", "--untracked-files=normal"]);
  const headBefore = git(["rev-parse", "HEAD"]);
  const branchBefore = git(["branch", "--show-current"]);
  if (statusBefore) {
    throw new Error(
      "The repository is not clean. Commit the approved candidate before running `npm run gate:publish`.",
    );
  }

  const current = await fingerprintReleaseCandidate();
  const artifactBefore = await fingerprintReleaseArtifact();
  await validateCandidateWhitespace();
  const artifactAfter = await fingerprintReleaseArtifact();
  const statusAfter = git(["status", "--porcelain", "--untracked-files=normal"]);
  const headAfter = git(["rev-parse", "HEAD"]);
  const branchAfter = git(["branch", "--show-current"]);
  if (statusAfter || headAfter !== headBefore || branchAfter !== branchBefore) {
    throw new Error("The repository changed while the publish candidate was being checked. Run `npm run gate:publish` again.");
  }
  if (branchAfter !== receipt.branchAtVerification) {
    throw new Error("The release candidate is on a different branch from its gate. Run `npm run gate:release` on this branch.");
  }
  if (headAfter !== receipt.headAtVerification) {
    const parents = git(["show", "-s", "--format=%P", headAfter]).split(" ").filter(Boolean);
    if (parents.length !== 1 || parents[0] !== receipt.headAtVerification) {
      throw new Error("The publish commit is not the single direct child of the gated HEAD. Run `npm run gate:release` on the current history.");
    }
  }
  if (
    current.fingerprint !== receipt.candidateFingerprint ||
    current.fileCount !== receipt.candidateFileCount
  ) {
    throw new Error(
      "The release candidate changed after its gate. Run `npm run gate:release` again before publishing.",
    );
  }
  if (
    artifactBefore.fingerprint !== receipt.artifactFingerprint
    || artifactBefore.fileCount !== receipt.artifactFileCount
    || artifactAfter.fingerprint !== artifactBefore.fingerprint
    || artifactAfter.fileCount !== artifactBefore.fileCount
  ) {
    throw new Error(
      "The built release artifact changed after its gate. Run `npm run gate:release` again before publishing.",
    );
  }

  return {
    ...receipt,
    currentHead: headAfter,
    currentBranch: branchAfter,
  };
}

async function main() {
  if (process.argv[2] !== "check") {
    throw new Error("Usage: node scripts/release-gate.mjs check");
  }

  const receipt = await checkPublishCandidate();
  console.log(
    `Publish candidate verified: ${receipt.currentBranch}@${receipt.currentHead.slice(0, 12)} ` +
      `(${receipt.candidateFileCount} repository files and ${receipt.artifactFileCount} artifact files, ` +
      `source ${receipt.candidateFingerprint.slice(0, 12)}, artifact ${receipt.artifactFingerprint.slice(0, 12)}).`,
  );
}

if (resolve(process.argv[1] ?? "") === scriptPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
