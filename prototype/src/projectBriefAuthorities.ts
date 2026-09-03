export type Sha256Fingerprint = `sha256-${string}`;
type Fnv1aFingerprint = `fnv1a-${string}`;

export const projectInputDispositionsStorageKey = "chida-prototype-project-input-dispositions:v1";
export const projectInputDispositionsWriteLockName = `${projectInputDispositionsStorageKey}:write`;

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
  visibility: "visible";
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

export type ProjectInputTargetObservedHead = Pick<ProjectInputTarget, "kind" | "id" | "projectId" | "createdAt" | "fingerprint">;

export type ProjectInputProjectionItem = {
  target: ProjectInputTarget;
  observedHead: ProjectInputTargetObservedHead;
};

export type ProjectInputTargetDerivation = {
  status: "ready" | "unavailable";
  targets: ProjectInputTarget[];
  observedHeads: ProjectInputTargetObservedHead[];
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
  if (!mimeType || mimeType === "application/octet-stream") return true;
  if (extension === "png") return mimeType === "image/png";
  if (extension === "jpg" || extension === "jpeg") return mimeType === "image/jpeg" || mimeType === "image/jpg";
  if (extension === "webp") return mimeType === "image/webp";
  return mimeType === "image/heic" || mimeType === "image/heif" || mimeType === "image/jpeg";
}

function isCompatibleDocumentFile(file: ProjectInputFileSnapshot) {
  const acceptedMimeTypes = {
    pdf: ["application/pdf"],
    xls: ["application/vnd.ms-excel"],
    xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    csv: ["text/csv", "application/csv", "application/vnd.ms-excel"],
    doc: ["application/msword"],
    docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  } as const;
  const extension = file.originalName.toLocaleLowerCase("en").match(/\.(pdf|xls|xlsx|csv|doc|docx)$/)?.[1] as keyof typeof acceptedMimeTypes | undefined;
  if (!extension) return false;
  const mimeType = file.mimeType.split(";", 1)[0]?.trim().toLocaleLowerCase("en") ?? "";
  return !mimeType || mimeType === "application/octet-stream" || acceptedMimeTypes[extension].includes(mimeType as never);
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
    && (file.sourceModifiedAt === null || isExactTimestamp(file.sourceModifiedAt)) && isExactTimestamp(file.createdAt)
    && (isImageFile(file) || isCompatibleDocumentFile(file))
    && (file.storageMode === "metadata-only" || file.storageMode === "browser-image" && isImageFile(file)
      || file.storageMode === "browser-file" && !isImageFile(file) && isCompatibleDocumentFile(file));
}

function validSource(value: unknown, projectId: string): value is ProjectInputSourceSnapshot {
  if (!hasExactKeys(value, ["schemaVersion", "id", "intakeId", "ownerPrincipalId", "accountSide", "scopeType", "scopeId", "projectId", "sourceType", "assetRef", "textContent", "version", "provenance", "capturedAt", "sourceDate", "locatorCapability", "excerptCapability", "contentHash", "readStatus", "sensitivity", "visibility", "manualSearchability", "automaticRetrievalEligibility", "modelEligibility", "shareability", "useInContextPreference", "fingerprint"])) return false;
  const source = value as ProjectInputSourceSnapshot;
  const hasAsset = source.assetRef !== null && hasExactKeys(source.assetRef, ["kind", "fileId", "fileVersion"])
    && ["project-file", "project-photo"].includes(source.assetRef.kind) && isExactString(source.assetRef.fileId) && source.assetRef.fileVersion === 1;
  const sourceShape = source.sourceType === "composer-text"
    ? source.assetRef === null && typeof source.textContent === "string" && source.textContent.length <= 4000
      && source.textContent.replace(/[\s\u200b\u200c\u200d\u2060\ufeff]/gu, "").length > 0
      && source.contentHash === `sha256-${sha256(source.textContent)}` && source.sourceDate === source.capturedAt
      && source.locatorCapability === "record" && source.excerptCapability === "full-text"
    : hasAsset && source.textContent === null && source.sourceDate === null && source.locatorCapability === "asset"
      && source.excerptCapability === "none" && source.assetRef!.kind === (source.sourceType === "composer-file" ? "project-file" : "project-photo");
  return source.schemaVersion === 1 && isExactString(source.id) && isExactString(source.intakeId)
    && source.ownerPrincipalId === "local-builder-account" && source.accountSide === "builder" && source.scopeType === "project_private"
    && source.scopeId === projectId && source.projectId === projectId && ["composer-text", "composer-file", "composer-photo"].includes(source.sourceType)
    && sourceShape && source.version === 1 && source.provenance === "direct_user_composer" && isExactTimestamp(source.capturedAt)
    && (source.sourceDate === null || isExactTimestamp(source.sourceDate)) && ["record", "asset"].includes(source.locatorCapability)
    && ["full-text", "none"].includes(source.excerptCapability) && isExactSha256(source.contentHash) && source.readStatus === "available"
    && source.sensitivity === "project-private" && source.visibility === "visible"
    && source.manualSearchability === false && source.automaticRetrievalEligibility === false
    && source.modelEligibility === false && source.shareability === false && source.useInContextPreference === false
    && isExactFnv1a(source.fingerprint) && source.fingerprint === legacyFnvHash(withoutFingerprint(source));
}

function validIntake(value: unknown, projectId: string): value is ProjectInputIntakeSnapshot {
  if (!hasExactKeys(value, ["id", "projectId", "sourceIds", "version", "createdAt", "fingerprint"])) return false;
  const intake = value as ProjectInputIntakeSnapshot;
  return isExactString(intake.id) && intake.projectId === projectId && Array.isArray(intake.sourceIds)
    && intake.sourceIds.length > 0 && intake.sourceIds.length <= 2 && intake.sourceIds.every(isExactString) && new Set(intake.sourceIds).size === intake.sourceIds.length
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
  for (let intakeIndex = 0; intakeIndex < envelope.intakes.length; intakeIndex += 1) {
    const intake = envelope.intakes[intakeIndex];
    if (intakeIndex > 0 && Date.parse(intake.createdAt) < Date.parse(envelope.intakes[intakeIndex - 1].createdAt)) return unavailable("chronology-invalid");
    const sources = intake.sourceIds.map((sourceId) => sourcesById.get(sourceId));
    if (sources.some((source) => !source) || sources.some((source) => source!.intakeId !== intake.id || source!.projectId !== intake.projectId || source!.scopeId !== intake.projectId)) return unavailable("source-missing");
    const exactSources = sources as ProjectInputSourceSnapshot[];
    const textSources = exactSources.filter((source) => source.sourceType === "composer-text");
    const assetSources = exactSources.filter((source) => source.sourceType !== "composer-text");
    if (exactSources.some((source) => source.capturedAt !== intake.createdAt) || textSources.length > 1 || assetSources.length > 1
      || textSources.length + assetSources.length !== exactSources.length || textSources.length === 1 && exactSources[0]?.sourceType !== "composer-text") return unavailable("linkage-missing");
    const linkedAssets = sources.flatMap((source) => {
      if (!source!.assetRef) return [];
      const file = filesById.get(source!.assetRef.fileId);
      const isPhoto = source!.sourceType === "composer-photo";
      const assetMatchesFile = isPhoto
        ? source!.assetRef.kind === "project-photo" && file?.storageMode === "browser-image" && file !== undefined && isImageFile(file)
        : source!.sourceType === "composer-file" && source!.assetRef.kind === "project-file" && file?.storageMode === "browser-file" && file !== undefined && !isImageFile(file) && isCompatibleDocumentFile(file);
      if (!file || file.projectId !== intake.projectId || file.version !== source!.assetRef.fileVersion || !assetMatchesFile) return [null];
      linkedFileIds.add(file.id);
      return [{ sourceId: source!.id, file }];
    });
    if (linkedAssets.some((asset) => asset === null)) return unavailable("asset-missing");
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

export type ProjectInputEffectiveStatus = "pending" | "resolved" | "pending-stale";

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

export type ProjectInputDispositionProjectionItem = ProjectInputProjectionItem & {
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

export type ProjectBriefObservedKind =
  | "manual-task"
  | "backbone-task"
  | "content-approval"
  | "dispatch-plan-approval"
  | "purchase-request"
  | "project-input";

export type ProjectBriefObservedHead =
  | { kind: "manual-task" | "backbone-task"; id: string; version: number; state: "in-progress" | "completed"; fingerprint: Sha256Fingerprint }
  | { kind: "content-approval"; id: string; version: number; state: "pending" | "approved" | "changes-requested"; fingerprint: Sha256Fingerprint }
  | { kind: "dispatch-plan-approval"; id: string; version: number; state: "pending" | "approved" | "withdrawn" | "invalidated"; fingerprint: Sha256Fingerprint }
  | { kind: "purchase-request"; id: string; version: number; state: "draft" | "ready-for-review"; fingerprint: Sha256Fingerprint }
  | ProjectInputObservedHead;

type ProjectBriefUpstreamObservedKind = Exclude<ProjectBriefObservedKind, "project-input">;

export type ProjectBriefObservationAdapter =
  | {
      status: "ready";
      kind: ProjectBriefUpstreamObservedKind;
      id: string;
      projectId: string;
      version: number;
      state: ProjectBriefObservedHead["state"];
      semanticPreimage: unknown;
      dependencyCapsule: unknown | null;
      reason: "";
    }
  | {
      status: "loading" | "unavailable";
      kind: ProjectBriefUpstreamObservedKind;
      projectId: string;
      reason: string;
    };

export type ProjectBriefObservation = {
  observationSchemaVersion: 1;
  heads: ProjectBriefObservedHead[];
  observationFingerprint: Sha256Fingerprint;
};

export type ProjectBriefObservationResult =
  | { status: "ready"; observation: ProjectBriefObservation; reason: "" }
  | { status: "loading" | "unavailable"; observation: null; reason: string };

export type ProjectBriefProjectInputHeads = {
  projectId: string;
  heads: ProjectInputObservedHead[];
};

export type ProjectVisitCheckpointSnapshot = ProjectBriefObservation & {
  observedAt: string;
};

export type ProjectVisitDeltaGroup = {
  id: "tasks" | "decisions" | "purchases" | "inputs";
  label: "کارها" | "تصمیم‌ها" | "خریدها" | "اسناد و ورودی‌ها";
  added: number;
  updated: number;
};

export type ProjectVisitDeltaChange = ProjectBriefObservedHead & {
  change: "added" | "updated";
};

export type ProjectVisitDeltaResult =
  | {
      status: "ready";
      added: ProjectBriefObservedHead[];
      updated: ProjectBriefObservedHead[];
      changes: ProjectVisitDeltaChange[];
      groups: ProjectVisitDeltaGroup[];
      reason: "";
    }
  | {
      status: "no-baseline";
      added: [];
      updated: [];
      changes: [];
      groups: ProjectVisitDeltaGroup[];
      reason: "baseline-not-recorded";
    }
  | { status: "unavailable"; reason: string };

export type ProjectInputDispositionState =
  | { status: "unavailable" | "read-error"; envelope: null; items: []; observedHeads: null; reason: string }
  | {
      status: "ready";
      envelope: ProjectInputDispositionEnvelope;
      items: ProjectInputDispositionProjectionItem[];
      observedHeads: ProjectInputObservedHead[];
      reason: "";
    };

const targetKeys = ["kind", "id", "projectId", "createdAt", "destinationSourceId", "fingerprint"] as const;
const dispositionRevisionKeys = ["id", "version", "createdAt", "authorizationContextHash", "snapshot", "fingerprint"] as const;
const dispositionEventKeys = ["id", "type", "actor", "actorPrincipalId", "at", "version", "revisionId", "authorizationContextHash", "idempotencyKey", "commandPayloadHash", "fingerprint"] as const;
const dispositionRecordKeys = ["schemaVersion", "objectType", "id", "projectId", "ownerPrincipalType", "ownerPrincipalId", "accountSide", "scopeType", "scopeId", "custodianService", "sensitivity", "authorizationContextHash", "version", "currentRevisionId", "createdAt", "updatedAt", "history", "revisions", "fingerprint"] as const;
const dispositionReceiptKeys = ["schemaVersion", "key", "action", "payloadHash", "projectId", "dispositionId", "expectedStoreVersion", "expectedDispositionVersion", "resultingStoreVersion", "resultingDispositionVersion", "eventId", "revisionId", "authorizationContextHash", "recordedAt", "fingerprint"] as const;
const dispositionEnvelopeKeys = ["schemaVersion", "fingerprintVersion", "identityBindingHash", "storeVersion", "records", "idempotencyReceipts", "updatedAt", "fingerprint"] as const;

function authorityIsValid(authority: ProjectBriefAuthority | null): authority is ProjectBriefAuthority {
  if (!authority || !hasExactKeys(authority, ["identityBindingHash", "snapshotHash", "projectIds", "authorizationHashes"])
    || !isExactSha256(authority.identityBindingHash) || !isExactSha256(authority.snapshotHash)
    || !Array.isArray(authority.projectIds) || authority.projectIds.length === 0
    || authority.projectIds.some((projectId) => !isExactString(projectId))
    || new Set(authority.projectIds).size !== authority.projectIds.length
    || authority.projectIds.some((projectId, index) => index > 0 && compareCodePoints(authority.projectIds[index - 1], projectId) >= 0)
    || !hasExactKeys(authority.authorizationHashes, authority.projectIds)) return false;
  return authority.projectIds.every((projectId) => isExactSha256(authority.authorizationHashes[projectId]));
}

function exactTarget(value: unknown): value is ProjectInputTarget {
  if (!hasExactKeys(value, targetKeys)) return false;
  const target = value as ProjectInputTarget;
  return ["project-document", "composer-intake"].includes(target.kind)
    && isExactString(target.id) && isExactString(target.projectId) && isExactTimestamp(target.createdAt)
    && (target.kind === "project-document" ? target.destinationSourceId === null : isExactString(target.destinationSourceId))
    && isExactSha256(target.fingerprint);
}

function dispositionIdFor(target: Pick<ProjectInputTarget, "kind" | "id" | "projectId">) {
  return `project-input-disposition:${projectBriefHash({ kind: target.kind, id: target.id, projectId: target.projectId }).slice(7)}`;
}

function dispositionRevisionId(dispositionId: string, version: number) {
  return `project-input-disposition-revision:${projectBriefHash({ dispositionId, version }).slice(7)}`;
}

function dispositionEventId(dispositionId: string, version: number) {
  return `project-input-disposition-event:${projectBriefHash({ dispositionId, version }).slice(7)}`;
}

function fingerprintMatches(value: { fingerprint: Sha256Fingerprint }) {
  return value.fingerprint === projectBriefHash(withoutFingerprint(value));
}

function emptyDispositionEnvelope(identityBindingHash: Sha256Fingerprint): ProjectInputDispositionEnvelope {
  const payload = {
    schemaVersion: 1 as const,
    fingerprintVersion: "project-input-disposition-v1" as const,
    identityBindingHash,
    storeVersion: 0,
    records: [] as ProjectInputDispositionRecord[],
    idempotencyReceipts: [] as ProjectInputDispositionReceipt[],
    updatedAt: null,
  };
  return { ...payload, fingerprint: projectBriefHash(payload) };
}

type DispositionParseResult =
  | { envelope: ProjectInputDispositionEnvelope; reason: "" }
  | { envelope: null; reason: string };

function parseDispositionEnvelope(value: unknown, authority: ProjectBriefAuthority): DispositionParseResult {
  if (!hasExactKeys(value, dispositionEnvelopeKeys)) return { envelope: null, reason: "envelope-shape-invalid" };
  const envelope = value as ProjectInputDispositionEnvelope;
  if (envelope.schemaVersion !== 1 || envelope.fingerprintVersion !== "project-input-disposition-v1"
    || !Number.isSafeInteger(envelope.storeVersion) || envelope.storeVersion < 1
    || !Array.isArray(envelope.records) || !Array.isArray(envelope.idempotencyReceipts)
    || !isExactTimestamp(envelope.updatedAt) || !isExactSha256(envelope.fingerprint)) return { envelope: null, reason: "envelope-shape-invalid" };
  if (envelope.identityBindingHash !== authority.identityBindingHash) return { envelope: null, reason: "identity-mismatch" };
  if (envelope.records.some((record) => !record || typeof record !== "object" || Array.isArray(record) || !("id" in record))) return { envelope: null, reason: "envelope-shape-invalid" };
  if (new Set(envelope.records.map((record) => record.id)).size !== envelope.records.length) return { envelope: null, reason: "duplicate-record" };
  if (envelope.idempotencyReceipts.some((receipt) => !receipt || typeof receipt !== "object" || Array.isArray(receipt) || !("key" in receipt))) return { envelope: null, reason: "envelope-shape-invalid" };
  if (new Set(envelope.idempotencyReceipts.map((receipt) => receipt.key)).size !== envelope.idempotencyReceipts.length) return { envelope: null, reason: "duplicate-receipt" };
  for (const rawRecord of envelope.records) {
    if (typeof rawRecord.projectId === "string" && (!authority.projectIds.includes(rawRecord.projectId) || rawRecord.scopeId !== rawRecord.projectId)) return { envelope: null, reason: "scope-mismatch" };
    if (typeof rawRecord.projectId === "string" && typeof rawRecord.authorizationContextHash === "string"
      && rawRecord.authorizationContextHash !== authority.authorizationHashes[rawRecord.projectId]) return { envelope: null, reason: "authorization-mismatch" };
  }
  for (const rawReceipt of envelope.idempotencyReceipts) {
    if (typeof rawReceipt.projectId === "string" && !authority.projectIds.includes(rawReceipt.projectId)) return { envelope: null, reason: "scope-mismatch" };
    if (typeof rawReceipt.projectId === "string" && typeof rawReceipt.authorizationContextHash === "string"
      && rawReceipt.authorizationContextHash !== authority.authorizationHashes[rawReceipt.projectId]) return { envelope: null, reason: "authorization-mismatch" };
  }
  const envelopeTime = Date.parse(envelope.updatedAt!);
  const chronologyInvalid = envelope.records.some((record) => isExactTimestamp(record.createdAt) && isExactTimestamp(record.updatedAt)
    && (Date.parse(record.createdAt) > Date.parse(record.updatedAt) || Date.parse(record.updatedAt) > envelopeTime))
    || envelope.idempotencyReceipts.some((receipt) => isExactTimestamp(receipt.recordedAt) && Date.parse(receipt.recordedAt) > envelopeTime);
  if (chronologyInvalid) return { envelope: null, reason: "chronology-invalid" };
  if (envelope.storeVersion !== envelope.idempotencyReceipts.length || !fingerprintMatches(envelope)) return { envelope: null, reason: "envelope-shape-invalid" };

  const receiptsByRevision = new Map<string, ProjectInputDispositionReceipt>();
  for (let receiptIndex = 0; receiptIndex < envelope.idempotencyReceipts.length; receiptIndex += 1) {
    const receipt = envelope.idempotencyReceipts[receiptIndex];
    if (!hasExactKeys(receipt, dispositionReceiptKeys) || receipt.schemaVersion !== 1
      || !isExactString(receipt.key) || !["resolve-input", "reopen-input"].includes(receipt.action)
      || !isExactSha256(receipt.payloadHash) || !isExactString(receipt.projectId) || !isExactString(receipt.dispositionId)
      || !Number.isSafeInteger(receipt.expectedStoreVersion) || receipt.expectedStoreVersion < 0
      || receipt.expectedDispositionVersion !== null && (!Number.isSafeInteger(receipt.expectedDispositionVersion) || receipt.expectedDispositionVersion < 1)
      || receipt.expectedStoreVersion !== receiptIndex || receipt.resultingStoreVersion !== receiptIndex + 1
      || !Number.isSafeInteger(receipt.resultingDispositionVersion) || receipt.resultingDispositionVersion < 1
      || !isExactString(receipt.eventId) || !isExactString(receipt.revisionId)
      || receipt.authorizationContextHash !== authority.authorizationHashes[receipt.projectId]
      || !isExactTimestamp(receipt.recordedAt) || !isExactSha256(receipt.fingerprint) || !fingerprintMatches(receipt)) return { envelope: null, reason: "envelope-shape-invalid" };
    if (receiptIndex > 0 && Date.parse(receipt.recordedAt) < Date.parse(envelope.idempotencyReceipts[receiptIndex - 1].recordedAt)) return { envelope: null, reason: "chronology-invalid" };
    if (receiptsByRevision.has(receipt.revisionId)) return { envelope: null, reason: "duplicate-receipt" };
    receiptsByRevision.set(receipt.revisionId, receipt);
  }
  if (envelope.idempotencyReceipts.at(-1)?.recordedAt !== envelope.updatedAt) return { envelope: null, reason: "chronology-invalid" };

  let totalVersions = 0;
  for (const record of envelope.records) {
    if (!hasExactKeys(record, dispositionRecordKeys) || record.schemaVersion !== 1 || record.objectType !== "project-input-disposition"
      || !isExactString(record.id) || !isExactString(record.projectId) || record.ownerPrincipalType !== "account"
      || record.ownerPrincipalId !== "local-builder-account" || record.accountSide !== "builder" || record.scopeType !== "project_private"
      || record.scopeId !== record.projectId || record.custodianService !== "Project Brief Domain Service" || record.sensitivity !== "private"
      || record.authorizationContextHash !== authority.authorizationHashes[record.projectId]
      || !Number.isSafeInteger(record.version) || record.version < 1 || !isExactString(record.currentRevisionId)
      || !isExactTimestamp(record.createdAt) || !isExactTimestamp(record.updatedAt)
      || !Array.isArray(record.history) || !Array.isArray(record.revisions)
      || record.history.length !== record.version || record.revisions.length !== record.version
      || !isExactSha256(record.fingerprint) || !fingerprintMatches(record)) return { envelope: null, reason: "envelope-shape-invalid" };
    if (record.id !== dispositionIdFor(record.revisions[0]?.snapshot?.target ?? { kind: "project-document", id: "invalid", projectId: "invalid" })) return { envelope: null, reason: "envelope-shape-invalid" };
    totalVersions += record.version;
    let priorSnapshot: ProjectInputDispositionSnapshot | null = null;
    let priorReceiptIndex = -1;
    for (let index = 0; index < record.version; index += 1) {
      const version = index + 1;
      const revision = record.revisions[index];
      const event = record.history[index];
      if (!hasExactKeys(revision, dispositionRevisionKeys) || revision.version !== version
        || revision.id !== dispositionRevisionId(record.id, version) || !isExactTimestamp(revision.createdAt)
        || revision.authorizationContextHash !== record.authorizationContextHash
        || !hasExactKeys(revision.snapshot, ["target", "status"]) || !exactTarget(revision.snapshot.target)
        || revision.snapshot.target.projectId !== record.projectId || !["pending", "resolved"].includes(revision.snapshot.status)
        || !isExactSha256(revision.fingerprint) || !fingerprintMatches(revision)
        || !hasExactKeys(event, dispositionEventKeys) || event.version !== version || event.id !== dispositionEventId(record.id, version)
        || !["resolved", "reopened"].includes(event.type) || event.actor !== "شما" || event.actorPrincipalId !== "local-builder-account"
        || !isExactTimestamp(event.at) || event.at !== revision.createdAt || event.revisionId !== revision.id
        || event.authorizationContextHash !== record.authorizationContextHash || !isExactString(event.idempotencyKey)
        || !isExactSha256(event.commandPayloadHash) || !isExactSha256(event.fingerprint) || !fingerprintMatches(event)) return { envelope: null, reason: "envelope-shape-invalid" };
      if (index > 0 && Date.parse(revision.createdAt) < Date.parse(record.revisions[index - 1].createdAt)) return { envelope: null, reason: "chronology-invalid" };
      const receipt = receiptsByRevision.get(revision.id);
      const expectedAction = event.type === "resolved" ? "resolve-input" : "reopen-input";
      if (!receipt || receipt.action !== expectedAction || receipt.key !== event.idempotencyKey
        || receipt.projectId !== record.projectId || receipt.dispositionId !== record.id
        || receipt.resultingDispositionVersion !== version || receipt.eventId !== event.id || receipt.recordedAt !== event.at
        || receipt.authorizationContextHash !== record.authorizationContextHash
        || receipt.expectedDispositionVersion !== (version === 1 ? null : version - 1)
        || revision.snapshot.status !== (event.type === "resolved" ? "resolved" : "pending")) return { envelope: null, reason: "envelope-shape-invalid" };
      const receiptIndex = envelope.idempotencyReceipts.indexOf(receipt);
      const firstTarget = record.revisions[0].snapshot.target;
      const stableLogicalTarget = revision.snapshot.target.projectId === firstTarget.projectId
        && revision.snapshot.target.kind === firstTarget.kind && revision.snapshot.target.id === firstTarget.id;
      const repeatsNoOp = priorSnapshot !== null && priorSnapshot.status === revision.snapshot.status
        && targetsAreEqual(priorSnapshot.target, revision.snapshot.target);
      if (!stableLogicalTarget || receiptIndex <= priorReceiptIndex
        || priorSnapshot === null && receipt.action !== "resolve-input" || repeatsNoOp) return { envelope: null, reason: "semantic-replay-invalid" };
      priorReceiptIndex = receiptIndex;
      priorSnapshot = revision.snapshot;
      const command = {
        inputSchemaVersion: 1,
        action: receipt.action,
        projectId: receipt.projectId,
        target: revision.snapshot.target,
        expectedStoreVersion: receipt.expectedStoreVersion,
        expectedDispositionVersion: receipt.expectedDispositionVersion,
        idempotencyKey: receipt.key,
      };
      if (receipt.payloadHash !== projectBriefHash(command) || event.commandPayloadHash !== receipt.payloadHash) return { envelope: null, reason: "envelope-shape-invalid" };
    }
    if (record.currentRevisionId !== record.revisions.at(-1)?.id || record.createdAt !== record.revisions[0].createdAt
      || record.updatedAt !== record.revisions.at(-1)?.createdAt) return { envelope: null, reason: "chronology-invalid" };
  }
  if (totalVersions !== envelope.idempotencyReceipts.length) return { envelope: null, reason: "envelope-shape-invalid" };
  return { envelope, reason: "" };
}

function dispositionProjection(envelope: ProjectInputDispositionEnvelope, derivation: ProjectInputTargetDerivation) {
  const recordByLogicalTarget = new Map(envelope.records.map((record) => {
    const current = record.revisions.at(-1)!.snapshot.target;
    return [`${current.kind}\u0000${current.id}\u0000${current.projectId}`, record] as const;
  }));
  const projected = derivation.items.map((item) => {
    const target = item.target;
    const record = recordByLogicalTarget.get(`${target.kind}\u0000${target.id}\u0000${target.projectId}`) ?? null;
    const snapshot = record?.revisions.at(-1)?.snapshot ?? null;
    const effectiveStatus: ProjectInputEffectiveStatus = !snapshot
      ? "pending"
      : snapshot.target.fingerprint !== target.fingerprint || snapshot.target.createdAt !== target.createdAt
        || snapshot.target.destinationSourceId !== target.destinationSourceId
        ? "pending-stale"
        : snapshot.status;
    return {
      ...item,
      effectiveStatus,
      dispositionId: record?.id ?? null,
      dispositionVersion: record?.version ?? null,
    };
  });
  const statusOrder: Record<ProjectInputEffectiveStatus, number> = { "pending-stale": 0, pending: 1, resolved: 2 };
  projected.sort((first, second) => statusOrder[first.effectiveStatus] - statusOrder[second.effectiveStatus]
    || compareDerivedItems(first, second));
  return projected;
}

export function readProjectInputDispositionState(
  authority: ProjectBriefAuthority | null,
  dependencies: ProjectInputDependencies,
): ProjectInputDispositionState {
  if (!authorityIsValid(authority)) return { status: "read-error", envelope: null, items: [], observedHeads: null, reason: "identity-mismatch" };
  if (!authority.projectIds.includes(dependencies.projectId)) return { status: "read-error", envelope: null, items: [], observedHeads: null, reason: "scope-mismatch" };
  const derivation = deriveProjectInputTargets(dependencies);
  if (derivation.status !== "ready") return { status: "unavailable", envelope: null, items: [], observedHeads: null, reason: derivation.reason };
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(projectInputDispositionsStorageKey);
  } catch {
    return { status: "read-error", envelope: null, items: [], observedHeads: null, reason: "storage-read-failure" };
  }
  let envelope: ProjectInputDispositionEnvelope;
  if (raw === null) envelope = emptyDispositionEnvelope(authority.identityBindingHash);
  else {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { status: "read-error", envelope: null, items: [], observedHeads: null, reason: "malformed-json" };
    }
    const result = parseDispositionEnvelope(parsed, authority);
    if (!result.envelope) return { status: "read-error", envelope: null, items: [], observedHeads: null, reason: result.reason };
    envelope = result.envelope;
  }
  const availableTargets = new Set(derivation.targets.map((target) => `${target.kind}\u0000${target.id}\u0000${target.projectId}`));
  for (const record of envelope.records) {
    if (record.projectId !== dependencies.projectId) continue;
    const target = record.revisions.at(-1)!.snapshot.target;
    if (!availableTargets.has(`${target.kind}\u0000${target.id}\u0000${target.projectId}`)) return { status: "read-error", envelope: null, items: [], observedHeads: null, reason: "target-missing" };
  }
  const allItems = dispositionProjection(envelope, derivation);
  const observedHeads: ProjectInputObservedHead[] = allItems.map((item) => ({
    kind: "project-input" as const,
    id: `${item.target.kind}:${item.target.id}`,
    version: item.dispositionVersion ?? 1,
    state: item.effectiveStatus,
    fingerprint: projectBriefHash({
      target: item.target,
      effectiveStatus: item.effectiveStatus,
      disposition: item.dispositionId === null ? null : { id: item.dispositionId, version: item.dispositionVersion },
    }),
  })).sort((first, second) => compareCodePoints(first.id, second.id));
  return { status: "ready", envelope, items: allItems.filter((item) => item.effectiveStatus !== "resolved"), observedHeads, reason: "" };
}

export function projectInputObservedHeads(state: ProjectInputDispositionState): ProjectInputObservedHead[] | null {
  return state.observedHeads;
}

const projectBriefStatesByKind = {
  "manual-task": ["in-progress", "completed"],
  "backbone-task": ["in-progress", "completed"],
  "content-approval": ["pending", "approved", "changes-requested"],
  "dispatch-plan-approval": ["pending", "approved", "withdrawn", "invalidated"],
  "purchase-request": ["draft", "ready-for-review"],
  "project-input": ["pending", "pending-stale", "resolved"],
} as const satisfies Record<ProjectBriefObservedKind, readonly ProjectBriefObservedHead["state"][]>;

function compareObservedHeads(first: Pick<ProjectBriefObservedHead, "kind" | "id">, second: Pick<ProjectBriefObservedHead, "kind" | "id">) {
  return compareCodePoints(first.kind, second.kind) || compareCodePoints(first.id, second.id);
}

function isStoredFingerprintEvidenceKey(key: string) {
  const lower = key.toLocaleLowerCase("en");
  return lower !== "contenthash" && (lower === "fingerprint" || lower.endsWith("fingerprint")
    || lower.endsWith("fingerprints") || lower.endsWith("hash") || lower.endsWith("hashes"));
}

const invalidSemanticValue = Symbol("invalid-project-brief-semantic-value");

type SanitizedSemanticValue = {
  value: unknown;
  hasSemanticContent: boolean;
};

function semanticValueWithoutStoredFingerprints(value: unknown, ancestors = new Set<object>()): SanitizedSemanticValue | typeof invalidSemanticValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return { value, hasSemanticContent: true };
  if (typeof value === "number") return Number.isFinite(value) ? { value, hasSemanticContent: true } : invalidSemanticValue;
  if (typeof value !== "object") return invalidSemanticValue;
  if (ancestors.has(value)) return invalidSemanticValue;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== Array.prototype && prototype !== null) return invalidSemanticValue;
  const nextAncestors = new Set(ancestors).add(value);
  if (Array.isArray(value)) {
    const items: unknown[] = [];
    let hasSemanticContent = value.length === 0;
    for (const item of value) {
      const semanticItem = semanticValueWithoutStoredFingerprints(item, nextAncestors);
      if (semanticItem === invalidSemanticValue) return invalidSemanticValue;
      if (semanticItem.hasSemanticContent) {
        items.push(semanticItem.value);
        hasSemanticContent = true;
      }
    }
    return { value: items, hasSemanticContent };
  }
  const result: Record<string, unknown> = {};
  const entries = Object.entries(value as Record<string, unknown>);
  let hasSemanticContent = entries.length === 0;
  for (const [key, item] of entries) {
    if (isStoredFingerprintEvidenceKey(key)) continue;
    const semanticItem = semanticValueWithoutStoredFingerprints(item, nextAncestors);
    if (semanticItem === invalidSemanticValue) return invalidSemanticValue;
    if (semanticItem.hasSemanticContent) {
      result[key] = semanticItem.value;
      hasSemanticContent = true;
    }
  }
  return { value: result, hasSemanticContent };
}

function semanticPreimageHasRawAuthority(original: unknown, sanitized: SanitizedSemanticValue) {
  return original !== null && typeof original === "object" && !Array.isArray(original)
    && Object.keys(original).length > 0 && sanitized.hasSemanticContent;
}

function observedAdapterStateIsValid(kind: ProjectBriefUpstreamObservedKind, state: ProjectBriefObservedHead["state"]) {
  return (projectBriefStatesByKind[kind] as readonly string[]).includes(state);
}

function projectInputObservedHeadIsValid(head: unknown): head is ProjectInputObservedHead {
  if (!hasExactKeys(head, ["kind", "id", "version", "state", "fingerprint"])) return false;
  const candidate = head as ProjectInputObservedHead;
  return candidate.kind === "project-input" && isExactString(candidate.id)
    && Number.isSafeInteger(candidate.version) && candidate.version >= 1
    && projectBriefStatesByKind["project-input"].includes(candidate.state)
    && isExactSha256(candidate.fingerprint);
}

function projectBriefObservedHeadIsValid(head: unknown): head is ProjectBriefObservedHead {
  if (!hasExactKeys(head, ["kind", "id", "version", "state", "fingerprint"])) return false;
  const candidate = head as ProjectBriefObservedHead;
  return Object.hasOwn(projectBriefStatesByKind, candidate.kind) && isExactString(candidate.id)
    && Number.isSafeInteger(candidate.version) && candidate.version >= 1
    && (projectBriefStatesByKind[candidate.kind] as readonly string[]).includes(candidate.state)
    && isExactSha256(candidate.fingerprint);
}

function observedHeadsAreValid(heads: unknown): heads is ProjectBriefObservedHead[] {
  if (!Array.isArray(heads) || heads.some((head) => !projectBriefObservedHeadIsValid(head))) return false;
  const keys = heads.map((head) => `${head.kind}\u0000${head.id}`);
  return new Set(keys).size === keys.length;
}

export function buildProjectBriefObservation(
  projectId: string,
  adapters: ProjectBriefObservationAdapter[],
  projectInput: ProjectBriefProjectInputHeads | null,
): ProjectBriefObservationResult {
  if (!isExactString(projectId) || !Array.isArray(adapters)) return { status: "unavailable", observation: null, reason: "observation-input-invalid" };
  const heads: ProjectBriefObservedHead[] = [];
  for (const adapter of adapters) {
    if (!adapter || typeof adapter !== "object" || Array.isArray(adapter)
      || !["loading", "ready", "unavailable"].includes(adapter.status)
      || !Object.hasOwn(projectBriefStatesByKind, adapter.kind) || (adapter as { kind: string }).kind === "project-input"
      || !isExactString(adapter.projectId) || typeof adapter.reason !== "string") return { status: "unavailable", observation: null, reason: "adapter-invalid" };
    if (adapter.projectId !== projectId) return { status: "unavailable", observation: null, reason: "scope-mismatch" };
    if (adapter.status !== "ready") {
      if (!hasExactKeys(adapter, ["status", "kind", "projectId", "reason"])) return { status: "unavailable", observation: null, reason: "adapter-invalid" };
      return adapter.status === "loading"
        ? { status: "loading", observation: null, reason: adapter.reason || "dependency-loading" }
        : { status: "unavailable", observation: null, reason: adapter.reason || "dependency-unavailable" };
    }
    if (!hasExactKeys(adapter, ["status", "kind", "id", "projectId", "version", "state", "semanticPreimage", "dependencyCapsule", "reason"])
      || !isExactString(adapter.id) || !Number.isSafeInteger(adapter.version) || adapter.version < 1 || adapter.reason !== "") return { status: "unavailable", observation: null, reason: "adapter-invalid" };
    if (!observedAdapterStateIsValid(adapter.kind, adapter.state)) return { status: "unavailable", observation: null, reason: "adapter-state-invalid" };
    if (adapter.semanticPreimage === null || adapter.semanticPreimage === undefined) return { status: "unavailable", observation: null, reason: "semantic-preimage-missing" };
    const semanticPreimage = semanticValueWithoutStoredFingerprints(adapter.semanticPreimage);
    const dependencyCapsule = semanticValueWithoutStoredFingerprints(adapter.dependencyCapsule);
    if (semanticPreimage === invalidSemanticValue || dependencyCapsule === invalidSemanticValue) return { status: "unavailable", observation: null, reason: "semantic-preimage-invalid" };
    if (!semanticPreimageHasRawAuthority(adapter.semanticPreimage, semanticPreimage)) return { status: "unavailable", observation: null, reason: "semantic-preimage-missing" };
    if (adapter.dependencyCapsule !== null && !dependencyCapsule.hasSemanticContent) return { status: "unavailable", observation: null, reason: "dependency-capsule-missing" };
    const head = {
      kind: adapter.kind,
      id: adapter.id,
      version: adapter.version,
      state: adapter.state,
      fingerprint: projectBriefHash({
        kind: adapter.kind,
        id: adapter.id,
        projectId,
        version: adapter.version,
        state: adapter.state,
        semanticPreimage: semanticPreimage.value,
        dependencyCapsule: dependencyCapsule.value,
      }),
    } as ProjectBriefObservedHead;
    heads.push(head);
  }
  if (projectInput === null) return { status: "unavailable", observation: null, reason: "project-input-unavailable" };
  if (!hasExactKeys(projectInput, ["projectId", "heads"]) || !isExactString(projectInput.projectId)) return { status: "unavailable", observation: null, reason: "project-input-head-invalid" };
  if (projectInput.projectId !== projectId) return { status: "unavailable", observation: null, reason: "scope-mismatch" };
  if (!Array.isArray(projectInput.heads) || projectInput.heads.some((head) => !projectInputObservedHeadIsValid(head))) return { status: "unavailable", observation: null, reason: "project-input-head-invalid" };
  heads.push(...projectInput.heads);
  heads.sort(compareObservedHeads);
  const keys = heads.map((head) => `${head.kind}\u0000${head.id}`);
  if (new Set(keys).size !== keys.length) return { status: "unavailable", observation: null, reason: "duplicate-head" };
  const observationPayload = { projectId, observationSchemaVersion: 1 as const, heads };
  return {
    status: "ready",
    observation: {
      observationSchemaVersion: 1,
      heads,
      observationFingerprint: projectBriefHash(observationPayload),
    },
    reason: "",
  };
}

const projectVisitDeltaGroups = [
  { id: "tasks", label: "کارها", kinds: ["manual-task", "backbone-task"] },
  { id: "decisions", label: "تصمیم‌ها", kinds: ["content-approval", "dispatch-plan-approval"] },
  { id: "purchases", label: "خریدها", kinds: ["purchase-request"] },
  { id: "inputs", label: "اسناد و ورودی‌ها", kinds: ["project-input"] },
] as const;

function emptyProjectVisitDeltaGroups(): ProjectVisitDeltaGroup[] {
  return projectVisitDeltaGroups.map(({ id, label }) => ({ id, label, added: 0, updated: 0 }));
}

function observedHeadsAreEqual(first: ProjectBriefObservedHead, second: ProjectBriefObservedHead) {
  return first.kind === second.kind && first.id === second.id && first.version === second.version
    && first.state === second.state && first.fingerprint === second.fingerprint;
}

export function projectVisitDeltaForObservation(
  baseline: ProjectVisitCheckpointSnapshot | null,
  current: ProjectBriefObservation,
): ProjectVisitDeltaResult {
  if (baseline === null) return {
    status: "no-baseline",
    added: [],
    updated: [],
    changes: [],
    groups: emptyProjectVisitDeltaGroups(),
    reason: "baseline-not-recorded",
  };
  if (!hasExactKeys(baseline, ["observedAt", "observationSchemaVersion", "heads", "observationFingerprint"])
    || baseline.observationSchemaVersion !== 1 || !isExactTimestamp(baseline.observedAt)
    || !isExactSha256(baseline.observationFingerprint) || !observedHeadsAreValid(baseline.heads)
    || !hasExactKeys(current, ["observationSchemaVersion", "heads", "observationFingerprint"])
    || current.observationSchemaVersion !== 1 || !isExactSha256(current.observationFingerprint)
    || !observedHeadsAreValid(current.heads)) return { status: "unavailable", reason: "observation-invalid" };

  const baselineByKey = new Map(baseline.heads.map((head) => [`${head.kind}\u0000${head.id}`, head]));
  const currentHeads = [...current.heads].sort(compareObservedHeads);
  const currentByKey = new Map(currentHeads.map((head) => [`${head.kind}\u0000${head.id}`, head]));
  for (const baselineKey of baselineByKey.keys()) {
    if (!currentByKey.has(baselineKey)) return { status: "unavailable", reason: "baseline-head-missing" };
  }

  const added: ProjectBriefObservedHead[] = [];
  const updated: ProjectBriefObservedHead[] = [];
  for (const currentHead of currentHeads) {
    const baselineHead = baselineByKey.get(`${currentHead.kind}\u0000${currentHead.id}`);
    if (!baselineHead) added.push(currentHead);
    else if (!observedHeadsAreEqual(baselineHead, currentHead)) updated.push(currentHead);
  }
  const changes: ProjectVisitDeltaChange[] = [
    ...added.map((head) => ({ ...head, change: "added" as const })),
    ...updated.map((head) => ({ ...head, change: "updated" as const })),
  ].sort(compareObservedHeads);
  const groups = emptyProjectVisitDeltaGroups();
  for (const change of changes) {
    const groupIndex = projectVisitDeltaGroups.findIndex((group) => (group.kinds as readonly string[]).includes(change.kind));
    if (groupIndex < 0) return { status: "unavailable", reason: "observation-invalid" };
    groups[groupIndex][change.change] += 1;
  }
  return { status: "ready", added, updated, changes, groups, reason: "" };
}

export type ProjectInputDispositionCommand = {
  inputSchemaVersion: 1;
  action: "resolve-input" | "reopen-input";
  projectId: string;
  target: ProjectInputTarget;
  expectedStoreVersion: number;
  expectedDispositionVersion: number | null;
  idempotencyKey: string;
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

function commandIsValid(command: ProjectInputDispositionCommand) {
  return hasExactKeys(command, ["inputSchemaVersion", "action", "projectId", "target", "expectedStoreVersion", "expectedDispositionVersion", "idempotencyKey"])
    && command.inputSchemaVersion === 1 && ["resolve-input", "reopen-input"].includes(command.action)
    && isExactString(command.projectId) && exactTarget(command.target) && command.target.projectId === command.projectId
    && Number.isSafeInteger(command.expectedStoreVersion) && command.expectedStoreVersion >= 0
    && (command.expectedDispositionVersion === null
      || Number.isSafeInteger(command.expectedDispositionVersion) && command.expectedDispositionVersion >= 1)
    && isExactString(command.idempotencyKey);
}

function targetsAreEqual(first: ProjectInputTarget, second: ProjectInputTarget) {
  return JSON.stringify(stableValue(first)) === JSON.stringify(stableValue(second));
}

function finalizeDispositionRevision(value: Omit<ProjectInputDispositionRevision, "fingerprint">): ProjectInputDispositionRevision {
  return { ...value, fingerprint: projectBriefHash(value) };
}

function finalizeDispositionEvent(value: Omit<ProjectInputDispositionEvent, "fingerprint">): ProjectInputDispositionEvent {
  return { ...value, fingerprint: projectBriefHash(value) };
}

function finalizeDispositionRecord(value: Omit<ProjectInputDispositionRecord, "fingerprint">): ProjectInputDispositionRecord {
  return { ...value, fingerprint: projectBriefHash(value) };
}

function finalizeDispositionReceipt(value: Omit<ProjectInputDispositionReceipt, "fingerprint">): ProjectInputDispositionReceipt {
  return { ...value, fingerprint: projectBriefHash(value) };
}

function finalizeDispositionEnvelope(value: Omit<ProjectInputDispositionEnvelope, "fingerprint">): ProjectInputDispositionEnvelope {
  return { ...value, fingerprint: projectBriefHash(value) };
}

function nextDispositionTimestamp(envelope: ProjectInputDispositionEnvelope) {
  const now = new Date().toISOString();
  if (envelope.updatedAt === null || Date.parse(now) >= Date.parse(envelope.updatedAt)) return now;
  return envelope.updatedAt;
}

async function rollbackOwnedDispositionCandidate(previousRaw: string | null, candidateRaw: string) {
  let currentRaw: string | null;
  try {
    currentRaw = window.localStorage.getItem(projectInputDispositionsStorageKey);
  } catch {
    return false;
  }
  if (currentRaw !== candidateRaw) return false;
  try {
    if (previousRaw === null) window.localStorage.removeItem(projectInputDispositionsStorageKey);
    else window.localStorage.setItem(projectInputDispositionsStorageKey, previousRaw);
    return window.localStorage.getItem(projectInputDispositionsStorageKey) === previousRaw;
  } catch {
    return false;
  }
}

function recordForTarget(envelope: ProjectInputDispositionEnvelope, target: ProjectInputTarget) {
  return envelope.records.find((record) => {
    const recordedTarget = record.revisions.at(-1)!.snapshot.target;
    return recordedTarget.kind === target.kind && recordedTarget.id === target.id && recordedTarget.projectId === target.projectId;
  }) ?? null;
}

function buildDispositionCandidate(
  current: ProjectInputDispositionEnvelope,
  command: ProjectInputDispositionCommand,
  authorizationContextHash: Sha256Fingerprint,
) {
  const priorRecord = recordForTarget(current, command.target);
  const nextVersion = (priorRecord?.version ?? 0) + 1;
  const nextStoreVersion = current.storeVersion + 1;
  const timestamp = nextDispositionTimestamp(current);
  const dispositionId = priorRecord?.id ?? dispositionIdFor(command.target);
  const revisionId = dispositionRevisionId(dispositionId, nextVersion);
  const eventId = dispositionEventId(dispositionId, nextVersion);
  const payloadHash = projectBriefHash(command);
  const revision = finalizeDispositionRevision({
    id: revisionId,
    version: nextVersion,
    createdAt: timestamp,
    authorizationContextHash,
    snapshot: {
      target: command.target,
      status: command.action === "resolve-input" ? "resolved" : "pending",
    },
  });
  const event = finalizeDispositionEvent({
    id: eventId,
    type: command.action === "resolve-input" ? "resolved" : "reopened",
    actor: "شما",
    actorPrincipalId: "local-builder-account",
    at: timestamp,
    version: nextVersion,
    revisionId,
    authorizationContextHash,
    idempotencyKey: command.idempotencyKey,
    commandPayloadHash: payloadHash,
  });
  const record = finalizeDispositionRecord({
    schemaVersion: 1,
    objectType: "project-input-disposition",
    id: dispositionId,
    projectId: command.projectId,
    ownerPrincipalType: "account",
    ownerPrincipalId: "local-builder-account",
    accountSide: "builder",
    scopeType: "project_private",
    scopeId: command.projectId,
    custodianService: "Project Brief Domain Service",
    sensitivity: "private",
    authorizationContextHash,
    version: nextVersion,
    currentRevisionId: revisionId,
    createdAt: priorRecord?.createdAt ?? timestamp,
    updatedAt: timestamp,
    history: [...(priorRecord?.history ?? []), event],
    revisions: [...(priorRecord?.revisions ?? []), revision],
  });
  const receipt = finalizeDispositionReceipt({
    schemaVersion: 1,
    key: command.idempotencyKey,
    action: command.action,
    payloadHash,
    projectId: command.projectId,
    dispositionId,
    expectedStoreVersion: command.expectedStoreVersion,
    expectedDispositionVersion: command.expectedDispositionVersion,
    resultingStoreVersion: nextStoreVersion,
    resultingDispositionVersion: nextVersion,
    eventId,
    revisionId,
    authorizationContextHash,
    recordedAt: timestamp,
  });
  return finalizeDispositionEnvelope({
    schemaVersion: 1,
    fingerprintVersion: "project-input-disposition-v1",
    identityBindingHash: current.identityBindingHash,
    storeVersion: nextStoreVersion,
    records: priorRecord
      ? current.records.map((candidate) => candidate.id === priorRecord.id ? record : candidate)
      : [...current.records, record],
    idempotencyReceipts: [...current.idempotencyReceipts, receipt],
    updatedAt: timestamp,
  });
}

export async function executeProjectInputDispositionCommand(
  command: ProjectInputDispositionCommand,
  getAuthority: () => ProjectBriefAuthority | null,
  getDependencies: (projectId: string) => Promise<ProjectInputDependencies>,
): Promise<ProjectInputDispositionMutationResult> {
  if (!commandIsValid(command)) return { status: command?.target?.projectId !== command?.projectId ? "scope-mismatch" : "dependency-stale", envelope: null };
  if (!navigator.locks?.request) return { status: "lock-unavailable", envelope: null };
  try {
    return await navigator.locks.request(projectInputDispositionsWriteLockName, async () => {
      let authority: ProjectBriefAuthority | null;
      try {
        authority = getAuthority();
      } catch {
        return { status: "read-failure", envelope: null } as ProjectInputDispositionMutationResult;
      }
      if (!authorityIsValid(authority)) return { status: "read-failure", envelope: null };
      if (!authority.projectIds.includes(command.projectId) || command.target.projectId !== command.projectId) return { status: "scope-mismatch", envelope: null };
      let dependencies: ProjectInputDependencies;
      try {
        dependencies = await getDependencies(command.projectId);
      } catch {
        return { status: "dependency-read-failure", envelope: null };
      }
      const derived = deriveProjectInputTargets(dependencies);
      if (derived.status !== "ready") return { status: "dependency-read-failure", envelope: null };
      if (dependencies.projectId !== command.projectId) return { status: "scope-mismatch", envelope: null };
      const currentTarget = derived.targets.find((target) => target.kind === command.target.kind && target.id === command.target.id && target.projectId === command.projectId);
      if (!currentTarget || !targetsAreEqual(currentTarget, command.target)) return { status: "dependency-stale", envelope: null };
      const currentState = readProjectInputDispositionState(authority, dependencies);
      if (currentState.status === "unavailable") return { status: "dependency-read-failure", envelope: null };
      if (currentState.status !== "ready") return { status: "read-failure", envelope: null };
      const current = currentState.envelope;
      const existingReceipt = current.idempotencyReceipts.find((receipt) => receipt.key === command.idempotencyKey);
      const payloadHash = projectBriefHash(command);
      if (existingReceipt) {
        if (existingReceipt.payloadHash !== payloadHash
          || existingReceipt.expectedStoreVersion !== command.expectedStoreVersion
          || existingReceipt.expectedDispositionVersion !== command.expectedDispositionVersion) return { status: "idempotency-payload-mismatch", envelope: current };
        return { status: existingReceipt.action === "resolve-input" ? "resolved" : "reopened", envelope: current };
      }
      const existingRecord = recordForTarget(current, command.target);
      if (current.storeVersion !== command.expectedStoreVersion
        || (existingRecord?.version ?? null) !== command.expectedDispositionVersion) return { status: "version-conflict", envelope: current };
      const desiredStatus = command.action === "resolve-input" ? "resolved" : "pending";
      const currentSnapshot = existingRecord?.revisions.at(-1)?.snapshot ?? null;
      if ((!currentSnapshot && desiredStatus === "pending")
        || currentSnapshot && currentSnapshot.status === desiredStatus && targetsAreEqual(currentSnapshot.target, command.target)) return { status: "unchanged", envelope: current };

      let previousRaw: string | null;
      try {
        previousRaw = window.localStorage.getItem(projectInputDispositionsStorageKey);
      } catch {
        return { status: "read-failure", envelope: null };
      }
      const authorizationContextHash = authority.authorizationHashes[command.projectId];
      const candidate = buildDispositionCandidate(current, command, authorizationContextHash);
      const candidateRaw = JSON.stringify(candidate);
      try {
        window.localStorage.setItem(projectInputDispositionsStorageKey, candidateRaw);
      } catch {
        await rollbackOwnedDispositionCandidate(previousRaw, candidateRaw);
        return { status: "write-failure", envelope: current };
      }
      let readbackRaw: string | null;
      try {
        readbackRaw = window.localStorage.getItem(projectInputDispositionsStorageKey);
      } catch {
        await rollbackOwnedDispositionCandidate(previousRaw, candidateRaw);
        return { status: "read-failure", envelope: null };
      }
      if (readbackRaw !== candidateRaw) {
        await rollbackOwnedDispositionCandidate(previousRaw, candidateRaw);
        return { status: "read-failure", envelope: null };
      }

      let finalAuthority: ProjectBriefAuthority | null;
      try {
        finalAuthority = getAuthority();
      } catch {
        await rollbackOwnedDispositionCandidate(previousRaw, candidateRaw);
        return { status: "read-failure", envelope: null };
      }
      if (!authorityIsValid(finalAuthority)
        || finalAuthority.identityBindingHash !== authority.identityBindingHash
        || finalAuthority.authorizationHashes[command.projectId] !== authorizationContextHash) {
        await rollbackOwnedDispositionCandidate(previousRaw, candidateRaw);
        return { status: "read-failure", envelope: null };
      }
      let finalDependencies: ProjectInputDependencies;
      try {
        finalDependencies = await getDependencies(command.projectId);
      } catch {
        await rollbackOwnedDispositionCandidate(previousRaw, candidateRaw);
        return { status: "dependency-read-failure", envelope: null };
      }
      const finalDerivation = deriveProjectInputTargets(finalDependencies);
      const finalTarget = finalDerivation.status === "ready"
        ? finalDerivation.targets.find((target) => target.kind === command.target.kind && target.id === command.target.id && target.projectId === command.projectId)
        : null;
      if (!finalTarget || !targetsAreEqual(finalTarget, command.target)) {
        await rollbackOwnedDispositionCandidate(previousRaw, candidateRaw);
        return { status: finalDerivation.status === "ready" ? "dependency-stale" : "dependency-read-failure", envelope: null };
      }
      let ownedRaw: string | null;
      try {
        ownedRaw = window.localStorage.getItem(projectInputDispositionsStorageKey);
      } catch {
        await rollbackOwnedDispositionCandidate(previousRaw, candidateRaw);
        return { status: "read-failure", envelope: null };
      }
      if (ownedRaw !== candidateRaw) return { status: "read-failure", envelope: null };
      const committed = readProjectInputDispositionState(finalAuthority, finalDependencies);
      if (committed.status !== "ready" || committed.envelope.storeVersion !== candidate.storeVersion
        || committed.envelope.fingerprint !== candidate.fingerprint) {
        await rollbackOwnedDispositionCandidate(previousRaw, candidateRaw);
        return { status: "read-failure", envelope: null };
      }
      return { status: command.action === "resolve-input" ? "resolved" : "reopened", envelope: committed.envelope };
    });
  } catch {
    return { status: "lock-unavailable", envelope: null };
  }
}
