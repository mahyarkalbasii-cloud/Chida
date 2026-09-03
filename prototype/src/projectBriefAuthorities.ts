type Sha256Fingerprint = `sha256-${string}`;
type Fnv1aFingerprint = `fnv1a-${string}`;

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

export type ProjectInputSourceAssetRef = {
  kind: "project-file" | "project-photo";
  fileId: string;
  fileVersion: 1;
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
  assetRef: ProjectInputSourceAssetRef | null;
  textContent: string | null;
  version: 1;
  provenance: "direct_user_composer";
  capturedAt: string;
  sourceDate: string | null;
  locatorCapability: "record" | "asset";
  excerptCapability: "full-text" | "none";
  contentHash: Sha256Fingerprint;
  readStatus: "available";
  sensitivity: "project-private";
  visibility: "visible" | "hidden";
  manualSearchability: boolean;
  automaticRetrievalEligibility: boolean;
  modelEligibility: boolean;
  shareability: boolean;
  useInContextPreference: boolean;
  fingerprint: Fnv1aFingerprint;
};

export type ProjectInputIntakeSnapshot = {
  id: string;
  projectId: string;
  sourceIds: string[];
  version: 1;
  createdAt: string;
  fingerprint: Fnv1aFingerprint;
};

export type ProjectInputSourceEnvelopeSnapshot = {
  schemaVersion: 1;
  envelopeVersion: number;
  records: ProjectInputSourceSnapshot[];
  intakes: ProjectInputIntakeSnapshot[];
  updatedAt: string | null;
};

export type ProjectInputDependencies = {
  status: "ready" | "unavailable";
  projectId: string;
  files: ProjectInputFileSnapshot[];
  sourceEnvelope: ProjectInputSourceEnvelopeSnapshot;
  reason: string;
};

export type ProjectInputTarget = {
  kind: "project-document" | "composer-intake";
  id: string;
  projectId: string;
  createdAt: string;
  destinationSourceId: string | null;
  fingerprint: Sha256Fingerprint;
};

export type ProjectInputObservedHead = Pick<ProjectInputTarget, "kind" | "id" | "projectId" | "createdAt" | "fingerprint">;

export type ProjectInputProjectionItem = {
  target: ProjectInputTarget;
  observedHead: ProjectInputObservedHead;
};

export type ProjectInputTargetDerivation = {
  status: "ready" | "unavailable";
  targets: ProjectInputTarget[];
  observedHeads: ProjectInputObservedHead[];
  items: ProjectInputProjectionItem[];
  reason: string;
};

const sha256Constants = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
] as const;

function sha256(serialized: string) {
  const bytes = new TextEncoder().encode(serialized);
  const totalLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(totalLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const bitLength = bytes.length * 8;
  const view = new DataView(padded.buffer);
  view.setUint32(totalLength - 8, Math.floor(bitLength / 0x100000000), false);
  view.setUint32(totalLength - 4, bitLength >>> 0, false);
  const hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const words = new Uint32Array(64);
  const rotateRight = (value: number, count: number) => value >>> count | value << 32 - count;
  for (let offset = 0; offset < totalLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4, false);
    for (let index = 16; index < 64; index += 1) {
      const first = rotateRight(words[index - 15], 7) ^ rotateRight(words[index - 15], 18) ^ words[index - 15] >>> 3;
      const second = rotateRight(words[index - 2], 17) ^ rotateRight(words[index - 2], 19) ^ words[index - 2] >>> 10;
      words[index] = (words[index - 16] + first + words[index - 7] + second) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = hash;
    for (let index = 0; index < 64; index += 1) {
      const sigmaOne = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choice = e & f ^ ~e & g;
      const temporaryOne = (h + sigmaOne + choice + sha256Constants[index] + words[index]) >>> 0;
      const sigmaZero = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = a & b ^ a & c ^ b & c;
      const temporaryTwo = (sigmaZero + majority) >>> 0;
      h = g; g = f; f = e; e = (d + temporaryOne) >>> 0; d = c; c = b; b = a; a = (temporaryOne + temporaryTwo) >>> 0;
    }
    hash[0] = (hash[0] + a) >>> 0; hash[1] = (hash[1] + b) >>> 0; hash[2] = (hash[2] + c) >>> 0; hash[3] = (hash[3] + d) >>> 0;
    hash[4] = (hash[4] + e) >>> 0; hash[5] = (hash[5] + f) >>> 0; hash[6] = (hash[6] + g) >>> 0; hash[7] = (hash[7] + h) >>> 0;
  }
  return hash.map((word) => word.toString(16).padStart(8, "0")).join("");
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([key, item]) => [key, stableValue(item)]));
  }
  return value;
}

export function projectBriefHash(value: unknown): Sha256Fingerprint {
  return (`sha256-${sha256(JSON.stringify(stableValue(value)))}`) as Sha256Fingerprint;
}

function legacyFnvHash(value: unknown): Fnv1aFingerprint {
  const serialized = JSON.stringify(stableValue(value));
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function hasExactKeys(value: unknown, keys: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value as Record<string, unknown>).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function isExactString(value: unknown) {
  return typeof value === "string" && value.length > 0 && value.trim() === value;
}

function isExactTimestamp(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}

function isExactSha256(value: unknown): value is Sha256Fingerprint {
  return typeof value === "string" && /^sha256-[0-9a-f]{64}$/.test(value);
}

function isExactFnv1a(value: unknown): value is Fnv1aFingerprint {
  return typeof value === "string" && /^fnv1a-[0-9a-f]{8}$/.test(value);
}

function compareCodePoints(first: string, second: string) {
  const firstIterator = first[Symbol.iterator]();
  const secondIterator = second[Symbol.iterator]();
  while (true) {
    const firstPoint = firstIterator.next();
    const secondPoint = secondIterator.next();
    if (firstPoint.done || secondPoint.done) {
      if (firstPoint.done && secondPoint.done) return 0;
      return firstPoint.done ? -1 : 1;
    }
    const firstValue = firstPoint.value.codePointAt(0)!;
    const secondValue = secondPoint.value.codePointAt(0)!;
    if (firstValue !== secondValue) return firstValue < secondValue ? -1 : 1;
  }
}

function withoutFingerprint<T extends { fingerprint: string }>(value: T) {
  const { fingerprint: _fingerprint, ...preimage } = value;
  return preimage;
}

function isImageFile(file: ProjectInputFileSnapshot) {
  const extension = file.originalName.toLocaleLowerCase("en").match(/\.(png|jpe?g|webp|heic|heif)$/)?.[1];
  if (!extension) return false;
  const mimeType = file.mimeType.toLocaleLowerCase("en");
  if (extension === "png") return mimeType === "image/png";
  if (extension === "jpg" || extension === "jpeg") return mimeType === "image/jpeg" || mimeType === "image/jpg";
  if (extension === "webp") return mimeType === "image/webp";
  return mimeType === "image/heic" || mimeType === "image/heif" || mimeType === "image/jpeg";
}

function validFile(value: unknown, projectId: string): value is ProjectInputFileSnapshot {
  if (!hasExactKeys(value, ["id", "projectId", "displayName", "originalName", "mimeType", "size", "category", "source", "status", "version", "projectStage", "visibility", "storageMode", "sourceModifiedAt", "createdAt"])) return false;
  const file = value as ProjectInputFileSnapshot;
  return isExactString(file.id) && file.projectId === projectId && isExactString(file.displayName)
    && isExactString(file.originalName) && isExactString(file.mimeType) && Number.isSafeInteger(file.size) && file.size >= 0
    && ["نقشه", "پیش‌فاکتور", "فاکتور", "قرارداد", "صورت‌جلسه", "صفحه‌گسترده", "عکس", "سایر"].includes(file.category)
    && ["انتخاب مستقیم از دستگاه", "دوربین دستگاه"].includes(file.source) && file.status === "ثبت محلی" && file.version === 1
    && typeof file.projectStage === "string" && file.visibility === "خصوصی پروژه"
    && ["metadata-only", "browser-image", "browser-file"].includes(file.storageMode)
    && (file.sourceModifiedAt === null || isExactTimestamp(file.sourceModifiedAt)) && isExactTimestamp(file.createdAt);
}

function validSource(value: unknown, projectId: string): value is ProjectInputSourceSnapshot {
  if (!hasExactKeys(value, ["schemaVersion", "id", "intakeId", "ownerPrincipalId", "accountSide", "scopeType", "scopeId", "projectId", "sourceType", "assetRef", "textContent", "version", "provenance", "capturedAt", "sourceDate", "locatorCapability", "excerptCapability", "contentHash", "readStatus", "sensitivity", "visibility", "manualSearchability", "automaticRetrievalEligibility", "modelEligibility", "shareability", "useInContextPreference", "fingerprint"])) return false;
  const source = value as ProjectInputSourceSnapshot;
  const hasAsset = source.assetRef !== null && hasExactKeys(source.assetRef, ["kind", "fileId", "fileVersion"])
    && ["project-file", "project-photo"].includes(source.assetRef.kind) && isExactString(source.assetRef.fileId) && source.assetRef.fileVersion === 1;
  const sourceShape = source.sourceType === "composer-text"
    ? source.assetRef === null && typeof source.textContent === "string" && source.sourceDate === source.capturedAt
      && source.locatorCapability === "record" && source.excerptCapability === "full-text"
    : hasAsset && source.textContent === null && source.sourceDate === null && source.locatorCapability === "asset"
      && source.excerptCapability === "none" && source.assetRef!.kind === (source.sourceType === "composer-file" ? "project-file" : "project-photo");
  return source.schemaVersion === 1 && isExactString(source.id) && isExactString(source.intakeId)
    && source.ownerPrincipalId === "local-builder-account" && source.accountSide === "builder" && source.scopeType === "project_private"
    && source.scopeId === projectId && source.projectId === projectId && ["composer-text", "composer-file", "composer-photo"].includes(source.sourceType)
    && sourceShape && source.version === 1 && source.provenance === "direct_user_composer" && isExactTimestamp(source.capturedAt)
    && (source.sourceDate === null || isExactTimestamp(source.sourceDate)) && ["record", "asset"].includes(source.locatorCapability)
    && ["full-text", "none"].includes(source.excerptCapability) && isExactSha256(source.contentHash) && source.readStatus === "available"
    && source.sensitivity === "project-private" && ["visible", "hidden"].includes(source.visibility)
    && typeof source.manualSearchability === "boolean" && typeof source.automaticRetrievalEligibility === "boolean"
    && typeof source.modelEligibility === "boolean" && typeof source.shareability === "boolean" && typeof source.useInContextPreference === "boolean"
    && isExactFnv1a(source.fingerprint) && source.fingerprint === legacyFnvHash(withoutFingerprint(source));
}

function validIntake(value: unknown, projectId: string): value is ProjectInputIntakeSnapshot {
  if (!hasExactKeys(value, ["id", "projectId", "sourceIds", "version", "createdAt", "fingerprint"])) return false;
  const intake = value as ProjectInputIntakeSnapshot;
  return isExactString(intake.id) && intake.projectId === projectId && Array.isArray(intake.sourceIds)
    && intake.sourceIds.length > 0 && intake.sourceIds.every(isExactString) && new Set(intake.sourceIds).size === intake.sourceIds.length
    && intake.version === 1 && isExactTimestamp(intake.createdAt) && isExactFnv1a(intake.fingerprint)
    && intake.fingerprint === legacyFnvHash(withoutFingerprint(intake));
}

type ProjectInputDerivedItem = { target: ProjectInputTarget };

function compareDerivedItems(first: ProjectInputDerivedItem, second: ProjectInputDerivedItem) {
  return Date.parse(second.target.createdAt) - Date.parse(first.target.createdAt)
    || compareCodePoints(first.target.kind, second.target.kind)
    || compareCodePoints(first.target.id, second.target.id);
}

function unavailable(reason: string): ProjectInputTargetDerivation {
  return { status: "unavailable", targets: [], observedHeads: [], items: [], reason };
}

export function deriveProjectInputTargets(dependencies: ProjectInputDependencies): ProjectInputTargetDerivation {
  if (!hasExactKeys(dependencies, ["status", "projectId", "files", "sourceEnvelope", "reason"]) || !["ready", "unavailable"].includes(dependencies.status) || !isExactString(dependencies.projectId) || typeof dependencies.reason !== "string") return unavailable("dependencies-invalid");
  if (dependencies.status !== "ready") return unavailable(dependencies.reason || "dependencies-unavailable");
  if (!Array.isArray(dependencies.files) || !hasExactKeys(dependencies.sourceEnvelope, ["schemaVersion", "envelopeVersion", "records", "intakes", "updatedAt"])) return unavailable("dependencies-invalid");
  const envelope = dependencies.sourceEnvelope;
  if (envelope.schemaVersion !== 1 || !Number.isSafeInteger(envelope.envelopeVersion) || envelope.envelopeVersion < 0
    || !Array.isArray(envelope.records) || !Array.isArray(envelope.intakes)
    || (envelope.updatedAt !== null && !isExactTimestamp(envelope.updatedAt))) return unavailable("dependencies-invalid");
  if (!dependencies.files.every((file) => validFile(file, dependencies.projectId)) || !envelope.records.every((source) => validSource(source, dependencies.projectId)) || !envelope.intakes.every((intake) => validIntake(intake, dependencies.projectId))) return unavailable("snapshot-invalid");
  if (new Set(dependencies.files.map((file) => file.id)).size !== dependencies.files.length || new Set(envelope.records.map((source) => source.id)).size !== envelope.records.length || new Set(envelope.intakes.map((intake) => intake.id)).size !== envelope.intakes.length) return unavailable("duplicate-id");
  const filesById = new Map(dependencies.files.map((file) => [file.id, file]));
  const sourcesById = new Map(envelope.records.map((source) => [source.id, source]));
  const referencedSourceIds = envelope.intakes.flatMap((intake) => intake.sourceIds);
  if (envelope.envelopeVersion !== envelope.intakes.length || new Set(referencedSourceIds).size !== referencedSourceIds.length
    || referencedSourceIds.length !== envelope.records.length || referencedSourceIds.some((sourceId) => !sourcesById.has(sourceId))
    || (envelope.intakes.length === 0
      ? envelope.records.length !== 0 || envelope.updatedAt !== null
      : envelope.updatedAt !== envelope.intakes[envelope.intakes.length - 1].createdAt)) return unavailable("linkage-missing");
  const linkedFileIds = new Set<string>();
  const derived: ProjectInputDerivedItem[] = [];
  for (const intake of envelope.intakes) {
    const sources = intake.sourceIds.map((sourceId) => sourcesById.get(sourceId));
    if (sources.some((source) => !source) || sources.some((source) => source!.intakeId !== intake.id || source!.projectId !== intake.projectId || source!.scopeId !== intake.projectId)) return unavailable("source-missing");
    const linkedAssets = sources.flatMap((source) => {
      if (!source!.assetRef) return [];
      const file = filesById.get(source!.assetRef.fileId);
      if (!file || file.projectId !== intake.projectId || file.version !== source!.assetRef.fileVersion) return [null];
      linkedFileIds.add(file.id);
      return [{ sourceId: source!.id, file }];
    });
    if (linkedAssets.some((asset) => asset === null)) return unavailable("asset-missing");
    const exactSources = sources as ProjectInputSourceSnapshot[];
    const exactAssets = linkedAssets as { sourceId: string; file: ProjectInputFileSnapshot }[];
    const destination = exactSources.find((source) => source.assetRef !== null)?.id ?? exactSources[0]?.id;
    if (!destination) return unavailable("source-missing");
    const fingerprint = projectBriefHash({
      intake: withoutFingerprint(intake),
      sources: exactSources.map(withoutFingerprint),
      linkedAssets: exactAssets,
    });
    derived.push({ target: { kind: "composer-intake", id: intake.id, projectId: intake.projectId, createdAt: intake.createdAt, destinationSourceId: destination, fingerprint } });
  }
  for (const file of dependencies.files) {
    if (linkedFileIds.has(file.id) || isImageFile(file)) continue;
    derived.push({ target: { kind: "project-document", id: file.id, projectId: file.projectId, createdAt: file.createdAt, destinationSourceId: null, fingerprint: projectBriefHash(file) } });
  }
  derived.sort(compareDerivedItems);
  const targets = derived.map((item) => item.target);
  const observedHeads = targets.map(({ kind, id, projectId, createdAt, fingerprint }) => ({ kind, id, projectId, createdAt, fingerprint }));
  return { status: "ready", targets, observedHeads, items: targets.map((target, index) => ({ target, observedHead: observedHeads[index] })), reason: "" };
}

export function projectInputObservedHeads(dependencies: ProjectInputDependencies): ProjectInputObservedHead[] {
  return deriveProjectInputTargets(dependencies).observedHeads;
}
