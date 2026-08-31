import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fingerprintReleaseArtifact, fingerprintReleaseCandidate, recordReleaseGate, validateCandidateWhitespace } from "./release-gate.mjs";

const prototypeRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const steps = [
  { label: "Build, protected-runtime integrity, and TypeScript", command: "npm", args: ["run", "build"], cwd: prototypeRoot },
  { label: "All Playwright application and runtime tests", command: "npm", args: ["run", "test:all"], cwd: prototypeRoot },
  { label: "Sites worker tests", command: "npm", args: ["run", "test:sites"], cwd: prototypeRoot },
];

const candidateBefore = await fingerprintReleaseCandidate();
let artifactAfterBuild;

for (const [index, step] of steps.entries()) {
  console.log(`\n[${index + 1}/${steps.length + 1}] ${step.label}`);
  const result = spawnSync(step.command, step.args, {
    cwd: step.cwd,
    env: process.env,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  if (index === 0) artifactAfterBuild = await fingerprintReleaseArtifact();
}

console.log(`\n[${steps.length + 1}/${steps.length + 1}] Git whitespace validation`);
await validateCandidateWhitespace();

const candidateAfter = await fingerprintReleaseCandidate();
if (
  candidateAfter.fingerprint !== candidateBefore.fingerprint
  || candidateAfter.fileCount !== candidateBefore.fileCount
) {
  throw new Error("The release candidate changed while its gate was running. Review the changes and run `npm run gate:release` again.");
}

const artifactAfterGate = await fingerprintReleaseArtifact();
if (
  !artifactAfterBuild
  || artifactAfterGate.fingerprint !== artifactAfterBuild.fingerprint
  || artifactAfterGate.fileCount !== artifactAfterBuild.fileCount
) {
  throw new Error("The built release artifact changed after the build step. Run `npm run gate:release` again.");
}
const receipt = await recordReleaseGate(candidateAfter, artifactAfterGate);
console.log(
  `\nRelease gate passed and recorded for ${receipt.candidateFileCount} repository files ` +
    `and ${receipt.artifactFileCount} built artifact files ` +
    `(source ${receipt.candidateFingerprint.slice(0, 12)}, artifact ${receipt.artifactFingerprint.slice(0, 12)}).`,
);
