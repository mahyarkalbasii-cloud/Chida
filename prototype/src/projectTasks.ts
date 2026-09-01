export const legacyProjectTasksStorageKey = "chida-prototype-project-tasks:v1";
export const projectTasksStorageKey = "chida-prototype-project-tasks:v2";
export const projectTasksCutoverMarkerKey = `${projectTasksStorageKey}:cutover:v1`;
export const projectTasksWriteLockName = "chida-prototype-project-tasks:write";

export type ProjectTaskStatus = "in-progress" | "completed";
export type ProjectTaskEventType = "created" | "migrated" | "updated" | "completed" | "reopened";
export type ProjectTaskSnapshot = {
  title: string;
  currentStep: string;
  dueDate: string | null;
  status: ProjectTaskStatus;
  completedAt: string | null;
};
export type ProjectTaskRevision = {
  id: string;
  version: number;
  createdAt: string;
  snapshot: ProjectTaskSnapshot;
  fingerprint: string;
};
export type ProjectTaskEvent = {
  id: string;
  type: ProjectTaskEventType;
  actor: "شما" | "سامانهٔ مهاجرت";
  actorPrincipalId: "local-builder-account";
  at: string;
  version: number;
  revisionId: string;
  authorizationContextHash: string;
  idempotencyKey: string | null;
  commandPayloadHash: string | null;
  fingerprint: string;
};
export type ProjectTaskLegacyEvent = {
  id: string;
  type: Exclude<ProjectTaskEventType, "migrated">;
  actor: "شما";
  at: string;
  version: number;
};
export type ProjectTaskLegacyEvidence = {
  schemaVersion: 1;
  sourceGeneration: "v1-array";
  sourceIndex: number;
  sourceRecordHash: string;
  sourceVersion: number;
  sourceCreatedAt: string;
  sourceUpdatedAt: string;
  sourceCompletedAt: string | null;
  history: ProjectTaskLegacyEvent[];
  fingerprint: string;
};
export type ProjectTaskRecord = {
  schemaVersion: 2;
  objectType: "manual-task";
  id: string;
  projectId: string;
  ownerPrincipalType: "account";
  ownerPrincipalId: "local-builder-account";
  accountSide: "builder";
  scopeType: "project_private";
  scopeId: string;
  custodianService: "Task Service";
  sensitivity: "private";
  title: string;
  currentStep: string;
  dueDate: string | null;
  status: ProjectTaskStatus;
  source: "ثبت مستقیم شما";
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  version: number;
  currentRevisionId: string;
  createdBy: "local-builder-account";
  updatedBy: "local-builder-account";
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  history: ProjectTaskEvent[];
  revisions: ProjectTaskRevision[];
  legacyEvidence: ProjectTaskLegacyEvidence | null;
  fingerprint: string;
};
export type ProjectTaskDraft = Pick<ProjectTaskSnapshot, "title" | "currentStep"> & { dueDate: string };
export type ProjectTaskAction = "create-task" | "update-task" | "complete-task" | "reopen-task";
export type ProjectTaskReceipt = {
  schemaVersion: 1;
  key: string;
  action: ProjectTaskAction;
  payloadHash: string;
  projectId: string;
  taskId: string;
  expectedVersion: number;
  result: "created" | "updated";
  resultingStoreVersion: number;
  resultingTaskVersion: number;
  eventId: string;
  revisionId: string;
  recordedAt: string;
  fingerprint: string;
};
export type ProjectTaskMigrationReport = {
  schemaVersion: 1;
  id: string;
  sourceGeneration: "v1-array" | "none";
  sourceKey: string | null;
  sourceRawHash: string | null;
  migratedAt: string;
  recordCount: number;
  migratedRecordFingerprints: string[];
  fingerprint: string;
};
export type ProjectTaskEnvelope = {
  schemaVersion: 2;
  fingerprintVersion: "manual-task-domain-v1";
  storeVersion: number;
  records: ProjectTaskRecord[];
  idempotencyReceipts: ProjectTaskReceipt[];
  migrationReports: [ProjectTaskMigrationReport];
  updatedAt: string;
  fingerprint: string;
};
type ProjectTaskCutoverSource = "v1-array" | "none";
type ProjectTaskPendingMarker = {
  schemaVersion: 1;
  state: "pending";
  migrationId: string;
  sourceGeneration: ProjectTaskCutoverSource;
  sourceKey: string | null;
  sourceRawHash: string | null;
  migrationAt: string;
  identityBindingHash: string;
  fingerprint: string;
};
type ProjectTaskVerifiedMarker = Omit<ProjectTaskPendingMarker, "state"> & {
  state: "verified";
  initialStoreVersion: 1;
  initialCanonicalHash: string;
  migrationReportHash: string;
  verifiedAt: string;
};
type ProjectTaskCommittedMarker = Omit<ProjectTaskVerifiedMarker, "state" | "verifiedAt"> & {
  state: "committed";
  committedAt: string;
};
type ProjectTaskMarker = ProjectTaskPendingMarker | ProjectTaskVerifiedMarker | ProjectTaskCommittedMarker;

export type ProjectTaskAuthority = {
  identityBindingHash: string;
  snapshotHash: string;
  projectIds: string[];
  authorizationHashes: Record<string, string>;
};
export type ProjectTaskState = {
  status: "loading" | "ready" | "read-error";
  envelope: ProjectTaskEnvelope | null;
  reason: string;
};
export type ProjectTaskMutationStatus =
  | "created"
  | "updated"
  | "unchanged"
  | "not-found"
  | "scope-mismatch"
  | "read-failure"
  | "schema-invalid"
  | "version-conflict"
  | "idempotency-payload-mismatch"
  | "write-failure"
  | "lock-unavailable"
  | "unsupported-transition";
export type ProjectTaskMutationResult = {
  status: ProjectTaskMutationStatus;
  envelope?: ProjectTaskEnvelope;
  taskId?: string;
  reason?: string;
};
export type ProjectTaskCommand =
  | { inputSchemaVersion: 1; action: "create-task"; projectId: string; taskId: string; draft: ProjectTaskDraft; expectedStoreVersion: number; idempotencyKey: string }
  | { inputSchemaVersion: 1; action: "update-task"; projectId: string; taskId: string; draft: ProjectTaskDraft; expectedTaskVersion: number; idempotencyKey: string }
  | { inputSchemaVersion: 1; action: "complete-task" | "reopen-task"; projectId: string; taskId: string; expectedTaskVersion: number; idempotencyKey: string };

type LegacyProjectTask = {
  id: string;
  projectId: string;
  title: string;
  currentStep: string;
  dueDate: string | null;
  status: ProjectTaskStatus;
  source: "ثبت مستقیم شما";
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  version: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  history: ProjectTaskLegacyEvent[];
  sourceIndex: number;
  sourceRecordHash: string;
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
      h = g;
      g = f;
      f = e;
      e = (d + temporaryOne) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temporaryOne + temporaryTwo) >>> 0;
    }
    hash[0] = (hash[0] + a) >>> 0;
    hash[1] = (hash[1] + b) >>> 0;
    hash[2] = (hash[2] + c) >>> 0;
    hash[3] = (hash[3] + d) >>> 0;
    hash[4] = (hash[4] + e) >>> 0;
    hash[5] = (hash[5] + f) >>> 0;
    hash[6] = (hash[6] + g) >>> 0;
    hash[7] = (hash[7] + h) >>> 0;
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

function hashValue(value: unknown) {
  return `sha256-${sha256(JSON.stringify(stableValue(value)))}`;
}

function rawHash(value: string | null) {
  return value === null ? null : `sha256-${sha256(value)}`;
}

function hasExactKeys(value: unknown, keys: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value as Record<string, unknown>).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function exactString(value: unknown, maximumLength = 300) {
  return typeof value === "string" && value.length > 0 && value.length <= maximumLength && value.trim() === value;
}

function visibleText(value: string) {
  return /[\p{L}\p{N}\p{P}\p{S}]/u.test(value.normalize("NFKC"));
}

function exactDate(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() !== value || !value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

function exactHash(value: unknown): value is string {
  return typeof value === "string" && /^sha256-[0-9a-f]{64}$/.test(value);
}

function validDraftSnapshot(snapshot: ProjectTaskSnapshot) {
  return exactString(snapshot.title, 80)
    && visibleText(snapshot.title)
    && exactString(snapshot.currentStep, 300)
    && visibleText(snapshot.currentStep)
    && (snapshot.dueDate === null || exactString(snapshot.dueDate, 40) && visibleText(snapshot.dueDate))
    && (snapshot.status === "in-progress" && snapshot.completedAt === null
      || snapshot.status === "completed" && exactDate(snapshot.completedAt));
}

function authorityIsValid(authority: ProjectTaskAuthority | null): authority is ProjectTaskAuthority {
  if (!authority || !exactHash(authority.identityBindingHash) || !exactHash(authority.snapshotHash)) return false;
  if (!Array.isArray(authority.projectIds) || authority.projectIds.some((id) => !exactString(id, 200))) return false;
  if (new Set(authority.projectIds).size !== authority.projectIds.length || [...authority.projectIds].sort().some((id, index) => id !== authority.projectIds[index])) return false;
  const keys = Object.keys(authority.authorizationHashes).sort();
  return keys.length === authority.projectIds.length
    && keys.every((key, index) => key === authority.projectIds[index] && exactHash(authority.authorizationHashes[key]));
}

function finalizeRevision(revision: Omit<ProjectTaskRevision, "fingerprint">): ProjectTaskRevision {
  return { ...revision, fingerprint: hashValue(revision) };
}

function finalizeEvent(event: Omit<ProjectTaskEvent, "fingerprint">): ProjectTaskEvent {
  return { ...event, fingerprint: hashValue(event) };
}

function finalizeLegacyEvidence(evidence: Omit<ProjectTaskLegacyEvidence, "fingerprint">): ProjectTaskLegacyEvidence {
  return { ...evidence, fingerprint: hashValue(evidence) };
}

function finalizeRecord(record: Omit<ProjectTaskRecord, "fingerprint"> | ProjectTaskRecord): ProjectTaskRecord {
  const { fingerprint: _fingerprint, ...payload } = record as ProjectTaskRecord;
  return { ...payload, fingerprint: hashValue(payload) } as ProjectTaskRecord;
}

function finalizeReceipt(receipt: Omit<ProjectTaskReceipt, "fingerprint">): ProjectTaskReceipt {
  return { ...receipt, fingerprint: hashValue(receipt) };
}

function finalizeMigrationReport(report: Omit<ProjectTaskMigrationReport, "fingerprint">): ProjectTaskMigrationReport {
  return { ...report, fingerprint: hashValue(report) };
}

function finalizeEnvelope(envelope: Omit<ProjectTaskEnvelope, "fingerprint"> | ProjectTaskEnvelope): ProjectTaskEnvelope {
  const { fingerprint: _fingerprint, ...payload } = envelope as ProjectTaskEnvelope;
  return { ...payload, fingerprint: hashValue(payload) } as ProjectTaskEnvelope;
}

function finalizeMarker<Marker extends Omit<ProjectTaskMarker, "fingerprint">>(marker: Marker): Marker & { fingerprint: string } {
  return { ...marker, fingerprint: hashValue(marker) };
}

function legacyHistoryIsValid(history: ProjectTaskLegacyEvent[], status: ProjectTaskStatus, completedAt: string | null, createdAt: string, updatedAt: string) {
  let reachable: ProjectTaskStatus = "in-progress";
  if (history.length === 0 || history[0].type !== "created") return false;
  for (const [index, event] of history.entries()) {
    if (event.version !== index + 1 || index > 0 && Date.parse(event.at) < Date.parse(history[index - 1].at)) return false;
    if (index === 0) continue;
    if (event.type === "updated") continue;
    if (event.type === "completed" && reachable === "in-progress") reachable = "completed";
    else if (event.type === "reopened" && reachable === "completed") reachable = "in-progress";
    else return false;
  }
  const lastCompleted = [...history].reverse().find((event) => event.type === "completed") ?? null;
  return history[0].at === createdAt
    && history.at(-1)?.at === updatedAt
    && reachable === status
    && (status === "completed" ? completedAt === lastCompleted?.at : completedAt === null);
}

function parseLegacyTasks(raw: string, authority: ProjectTaskAuthority): LegacyProjectTask[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const taskIds = new Set<string>();
    const records: LegacyProjectTask[] = [];
    const required = ["id", "projectId", "title", "currentStep", "status", "source", "visibility", "localStatus", "version", "createdAt", "updatedAt", "completedAt", "history"];
    const allowed = new Set([...required, "dueDate"]);
    for (const [sourceIndex, value] of parsed.entries()) {
      if (!value || typeof value !== "object" || Array.isArray(value)) return null;
      const object = value as Record<string, unknown>;
      if (required.some((key) => !Object.prototype.hasOwnProperty.call(object, key)) || Object.keys(object).some((key) => !allowed.has(key))) return null;
      if (!exactString(object.id, 200) || taskIds.has(object.id as string) || !exactString(object.projectId, 200) || !authority.projectIds.includes(object.projectId as string)) return null;
      if (!exactString(object.title, 80) || !visibleText(object.title as string) || !exactString(object.currentStep, 300) || !visibleText(object.currentStep as string)) return null;
      const dueDate = object.dueDate === undefined || object.dueDate === null ? null : object.dueDate;
      if (dueDate !== null && (!exactString(dueDate, 40) || !visibleText(dueDate as string))) return null;
      if (object.status !== "in-progress" && object.status !== "completed" || object.source !== "ثبت مستقیم شما" || object.visibility !== "خصوصی پروژه" || object.localStatus !== "ثبت محلی") return null;
      if (!Number.isSafeInteger(object.version) || Number(object.version) < 1 || !exactDate(object.createdAt) || !exactDate(object.updatedAt) || Date.parse(object.updatedAt) < Date.parse(object.createdAt)) return null;
      if (object.completedAt !== null && !exactDate(object.completedAt) || !Array.isArray(object.history) || object.history.length !== object.version) return null;
      const history: ProjectTaskLegacyEvent[] = [];
      const eventIds = new Set<string>();
      for (const item of object.history) {
        if (!hasExactKeys(item, ["id", "type", "actor", "at", "version"])) return null;
        if (!exactString(item.id, 200) || eventIds.has(item.id) || !["created", "updated", "completed", "reopened"].includes(item.type) || item.actor !== "شما" || !exactDate(item.at) || !Number.isSafeInteger(item.version) || Number(item.version) < 1) return null;
        eventIds.add(item.id);
        history.push({ id: item.id, type: item.type, actor: "شما", at: item.at, version: item.version } as ProjectTaskLegacyEvent);
      }
      if (!legacyHistoryIsValid(history, object.status as ProjectTaskStatus, object.completedAt as string | null, object.createdAt, object.updatedAt)) return null;
      taskIds.add(object.id as string);
      records.push({
        id: object.id as string,
        projectId: object.projectId as string,
        title: object.title as string,
        currentStep: object.currentStep as string,
        dueDate: dueDate as string | null,
        status: object.status as ProjectTaskStatus,
        source: "ثبت مستقیم شما",
        visibility: "خصوصی پروژه",
        localStatus: "ثبت محلی",
        version: object.version as number,
        createdAt: object.createdAt,
        updatedAt: object.updatedAt,
        completedAt: object.completedAt as string | null,
        history,
        sourceIndex,
        sourceRecordHash: hashValue(object),
      });
    }
    return records;
  } catch {
    return null;
  }
}

function parseSnapshot(value: unknown): ProjectTaskSnapshot | null {
  if (!hasExactKeys(value, ["title", "currentStep", "dueDate", "status", "completedAt"])) return null;
  const snapshot = value as ProjectTaskSnapshot;
  return validDraftSnapshot(snapshot) ? snapshot : null;
}

function parseLegacyEvidence(value: unknown): ProjectTaskLegacyEvidence | null {
  if (!hasExactKeys(value, ["schemaVersion", "sourceGeneration", "sourceIndex", "sourceRecordHash", "sourceVersion", "sourceCreatedAt", "sourceUpdatedAt", "sourceCompletedAt", "history", "fingerprint"])) return null;
  const evidence = value as ProjectTaskLegacyEvidence;
  if (evidence.schemaVersion !== 1 || evidence.sourceGeneration !== "v1-array" || !Number.isSafeInteger(evidence.sourceIndex) || evidence.sourceIndex < 0 || !exactHash(evidence.sourceRecordHash) || !Number.isSafeInteger(evidence.sourceVersion) || evidence.sourceVersion < 1 || !exactDate(evidence.sourceCreatedAt) || !exactDate(evidence.sourceUpdatedAt) || Date.parse(evidence.sourceUpdatedAt) < Date.parse(evidence.sourceCreatedAt) || evidence.sourceCompletedAt !== null && !exactDate(evidence.sourceCompletedAt) || !Array.isArray(evidence.history) || evidence.history.length !== evidence.sourceVersion) return null;
  const eventIds = new Set<string>();
  for (const event of evidence.history) {
    if (!hasExactKeys(event, ["id", "type", "actor", "at", "version"]) || !exactString(event.id, 200) || eventIds.has(event.id) || !["created", "updated", "completed", "reopened"].includes(event.type) || event.actor !== "شما" || !exactDate(event.at) || !Number.isSafeInteger(event.version) || event.version < 1) return null;
    eventIds.add(event.id);
  }
  const inferredStatus: ProjectTaskStatus = evidence.sourceCompletedAt === null ? "in-progress" : "completed";
  if (!legacyHistoryIsValid(evidence.history, inferredStatus, evidence.sourceCompletedAt, evidence.sourceCreatedAt, evidence.sourceUpdatedAt)) return null;
  if (evidence.fingerprint !== hashValue({ ...evidence, fingerprint: undefined })) {
    const { fingerprint: _fingerprint, ...payload } = evidence;
    if (evidence.fingerprint !== hashValue(payload)) return null;
  }
  return evidence;
}

const taskRecordKeys = [
  "schemaVersion", "objectType", "id", "projectId", "ownerPrincipalType", "ownerPrincipalId", "accountSide", "scopeType", "scopeId", "custodianService", "sensitivity", "title", "currentStep", "dueDate", "status", "source", "visibility", "localStatus", "version", "currentRevisionId", "createdBy", "updatedBy", "createdAt", "updatedAt", "completedAt", "history", "revisions", "legacyEvidence", "fingerprint",
] as const;

function parseRecord(value: unknown, authority: ProjectTaskAuthority): ProjectTaskRecord | null {
  if (!hasExactKeys(value, taskRecordKeys)) return null;
  const record = value as ProjectTaskRecord;
  if (record.schemaVersion !== 2 || record.objectType !== "manual-task" || !exactString(record.id, 200) || !exactString(record.projectId, 200) || !authority.projectIds.includes(record.projectId)) return null;
  if (record.ownerPrincipalType !== "account" || record.ownerPrincipalId !== "local-builder-account" || record.accountSide !== "builder" || record.scopeType !== "project_private" || record.scopeId !== record.projectId || record.custodianService !== "Task Service" || record.sensitivity !== "private" || record.source !== "ثبت مستقیم شما" || record.visibility !== "خصوصی پروژه" || record.localStatus !== "ثبت محلی" || record.createdBy !== "local-builder-account" || record.updatedBy !== "local-builder-account") return null;
  if (!Number.isSafeInteger(record.version) || record.version < 1 || !exactDate(record.createdAt) || !exactDate(record.updatedAt) || Date.parse(record.updatedAt) < Date.parse(record.createdAt) || !Array.isArray(record.history) || !Array.isArray(record.revisions) || record.history.length !== record.version || record.revisions.length !== record.version) return null;
  const directSnapshot = parseSnapshot({ title: record.title, currentStep: record.currentStep, dueDate: record.dueDate, status: record.status, completedAt: record.completedAt });
  if (!directSnapshot || !exactString(record.currentRevisionId, 260)) return null;
  const legacyEvidence = record.legacyEvidence === null ? null : parseLegacyEvidence(record.legacyEvidence);
  if (record.legacyEvidence !== null && !legacyEvidence) return null;
  const eventIds = new Set<string>();
  const revisionIds = new Set<string>();
  let previousSnapshot: ProjectTaskSnapshot | null = null;
  let previousAt = "";
  for (let index = 0; index < record.version; index += 1) {
    const event = record.history[index];
    const revision = record.revisions[index];
    if (!hasExactKeys(event, ["id", "type", "actor", "actorPrincipalId", "at", "version", "revisionId", "authorizationContextHash", "idempotencyKey", "commandPayloadHash", "fingerprint"]) || !hasExactKeys(revision, ["id", "version", "createdAt", "snapshot", "fingerprint"])) return null;
    if (!exactString(event.id, 260) || eventIds.has(event.id) || !exactString(revision.id, 260) || revisionIds.has(revision.id) || event.version !== index + 1 || revision.version !== index + 1 || event.revisionId !== revision.id || event.id !== `manual-task-event:${record.id}:v${index + 1}` || revision.id !== `manual-task-revision:${record.id}:v${index + 1}` || !exactDate(event.at) || revision.createdAt !== event.at || previousAt && Date.parse(event.at) <= Date.parse(previousAt) || event.actorPrincipalId !== "local-builder-account" || event.authorizationContextHash !== authority.authorizationHashes[record.projectId]) return null;
    if (event.fingerprint !== hashValue({ ...event, fingerprint: undefined })) {
      const { fingerprint: _fingerprint, ...payload } = event;
      if (event.fingerprint !== hashValue(payload)) return null;
    }
    if (revision.fingerprint !== hashValue({ ...revision, fingerprint: undefined })) {
      const { fingerprint: _fingerprint, ...payload } = revision;
      if (revision.fingerprint !== hashValue(payload)) return null;
    }
    const snapshot = parseSnapshot(revision.snapshot);
    if (!snapshot) return null;
    if (index === 0) {
      if (event.type === "created") {
        if (legacyEvidence !== null || event.actor !== "شما" || event.idempotencyKey === null || event.commandPayloadHash === null || snapshot.status !== "in-progress" || snapshot.completedAt !== null || record.createdAt !== event.at) return null;
      } else if (event.type === "migrated") {
        if (legacyEvidence === null || event.actor !== "سامانهٔ مهاجرت" || event.idempotencyKey !== null || event.commandPayloadHash !== null || record.createdAt !== legacyEvidence.sourceCreatedAt || snapshot.completedAt !== legacyEvidence.sourceCompletedAt || Date.parse(event.at) < Date.parse(record.createdAt)) return null;
      } else return null;
    } else {
      if (!previousSnapshot || event.actor !== "شما" || !exactString(event.idempotencyKey, 200) || !exactHash(event.commandPayloadHash)) return null;
      const sameContent = snapshot.title === previousSnapshot.title && snapshot.currentStep === previousSnapshot.currentStep && snapshot.dueDate === previousSnapshot.dueDate;
      if (event.type === "updated") {
        if (sameContent || snapshot.status !== previousSnapshot.status || snapshot.completedAt !== previousSnapshot.completedAt) return null;
      } else if (event.type === "completed") {
        if (!sameContent || previousSnapshot.status !== "in-progress" || snapshot.status !== "completed" || snapshot.completedAt !== event.at) return null;
      } else if (event.type === "reopened") {
        if (!sameContent || previousSnapshot.status !== "completed" || snapshot.status !== "in-progress" || snapshot.completedAt !== null) return null;
      } else return null;
    }
    eventIds.add(event.id);
    revisionIds.add(revision.id);
    previousSnapshot = snapshot;
    previousAt = event.at;
  }
  const latest = record.revisions.at(-1)!;
  if (record.currentRevisionId !== latest.id || record.updatedAt !== latest.createdAt || JSON.stringify(stableValue(directSnapshot)) !== JSON.stringify(stableValue(latest.snapshot))) return null;
  const { fingerprint: _fingerprint, ...payload } = record;
  return record.fingerprint === hashValue(payload) ? record : null;
}

function parseReceipt(value: unknown): ProjectTaskReceipt | null {
  if (!hasExactKeys(value, ["schemaVersion", "key", "action", "payloadHash", "projectId", "taskId", "expectedVersion", "result", "resultingStoreVersion", "resultingTaskVersion", "eventId", "revisionId", "recordedAt", "fingerprint"])) return null;
  const receipt = value as ProjectTaskReceipt;
  if (receipt.schemaVersion !== 1 || !exactString(receipt.key, 200) || !["create-task", "update-task", "complete-task", "reopen-task"].includes(receipt.action) || !exactHash(receipt.payloadHash) || !exactString(receipt.projectId, 200) || !exactString(receipt.taskId, 200) || !Number.isSafeInteger(receipt.expectedVersion) || receipt.expectedVersion < 1 || !["created", "updated"].includes(receipt.result) || !Number.isSafeInteger(receipt.resultingStoreVersion) || receipt.resultingStoreVersion < 2 || !Number.isSafeInteger(receipt.resultingTaskVersion) || receipt.resultingTaskVersion < 1 || !exactString(receipt.eventId, 260) || !exactString(receipt.revisionId, 260) || !exactDate(receipt.recordedAt)) return null;
  const { fingerprint: _fingerprint, ...payload } = receipt;
  return receipt.fingerprint === hashValue(payload) ? receipt : null;
}

function parseMigrationReport(value: unknown): ProjectTaskMigrationReport | null {
  if (!hasExactKeys(value, ["schemaVersion", "id", "sourceGeneration", "sourceKey", "sourceRawHash", "migratedAt", "recordCount", "migratedRecordFingerprints", "fingerprint"])) return null;
  const report = value as ProjectTaskMigrationReport;
  if (report.schemaVersion !== 1 || !exactString(report.id, 260) || !["v1-array", "none"].includes(report.sourceGeneration) || !exactDate(report.migratedAt) || !Number.isSafeInteger(report.recordCount) || report.recordCount < 0 || !Array.isArray(report.migratedRecordFingerprints) || report.migratedRecordFingerprints.length !== report.recordCount || report.migratedRecordFingerprints.some((item) => !exactHash(item))) return null;
  if (report.sourceGeneration === "v1-array" ? report.sourceKey !== legacyProjectTasksStorageKey || !exactHash(report.sourceRawHash) : report.sourceKey !== null || report.sourceRawHash !== null || report.recordCount !== 0) return null;
  const { fingerprint: _fingerprint, ...payload } = report;
  return report.fingerprint === hashValue(payload) ? report : null;
}

function migratedInitialRecord(record: ProjectTaskRecord) {
  const revision = record.revisions[0];
  const event = record.history[0];
  return finalizeRecord({
    ...record,
    ...revision.snapshot,
    version: 1,
    currentRevisionId: revision.id,
    updatedAt: revision.createdAt,
    history: [event],
    revisions: [revision],
  });
}

function parseEnvelope(value: unknown, authority: ProjectTaskAuthority): ProjectTaskEnvelope | null {
  if (!hasExactKeys(value, ["schemaVersion", "fingerprintVersion", "storeVersion", "records", "idempotencyReceipts", "migrationReports", "updatedAt", "fingerprint"])) return null;
  const envelope = value as ProjectTaskEnvelope;
  if (envelope.schemaVersion !== 2 || envelope.fingerprintVersion !== "manual-task-domain-v1" || !Number.isSafeInteger(envelope.storeVersion) || envelope.storeVersion < 1 || !Array.isArray(envelope.records) || !Array.isArray(envelope.idempotencyReceipts) || !Array.isArray(envelope.migrationReports) || envelope.migrationReports.length !== 1 || !exactDate(envelope.updatedAt)) return null;
  const report = parseMigrationReport(envelope.migrationReports[0]);
  if (!report) return null;
  const records = envelope.records.map((record) => parseRecord(record, authority));
  const receipts = envelope.idempotencyReceipts.map(parseReceipt);
  if (records.some((record) => record === null) || receipts.some((receipt) => receipt === null) || envelope.storeVersion !== receipts.length + 1) return null;
  const exactRecords = records as ProjectTaskRecord[];
  const exactReceipts = receipts as ProjectTaskReceipt[];
  if (new Set(exactRecords.map((record) => record.id)).size !== exactRecords.length || new Set(exactReceipts.map((receipt) => receipt.key)).size !== exactReceipts.length) return null;
  const migratedRecords = exactRecords.filter((record) => record.history[0].type === "migrated");
  if (migratedRecords.length !== report.recordCount || migratedRecords.some((record, index) => record.legacyEvidence?.sourceIndex !== index || migratedInitialRecord(record).fingerprint !== report.migratedRecordFingerprints[index]) || exactRecords.slice(0, migratedRecords.length).some((record) => record.history[0].type !== "migrated") || exactRecords.slice(migratedRecords.length).some((record) => record.history[0].type !== "created")) return null;
  if (migratedRecords.some((record) => record.history[0].at !== report.migratedAt || !record.legacyEvidence || Date.parse(report.migratedAt) <= Date.parse(record.legacyEvidence.sourceUpdatedAt))) return null;
  if (report.sourceGeneration === "none" && migratedRecords.length !== 0 || report.sourceGeneration === "v1-array" && migratedRecords.length !== report.recordCount) return null;
  for (const [index, receipt] of exactReceipts.entries()) {
    if (receipt.resultingStoreVersion !== index + 2 || receipt.result !== (receipt.action === "create-task" ? "created" : "updated") || index > 0 && Date.parse(receipt.recordedAt) <= Date.parse(exactReceipts[index - 1].recordedAt)) return null;
    const record = exactRecords.find((item) => item.id === receipt.taskId && item.projectId === receipt.projectId);
    const event = record?.history.find((item) => item.id === receipt.eventId);
    const revision = record?.revisions.find((item) => item.id === receipt.revisionId);
    if (!record || !event || !revision || revision.version !== receipt.resultingTaskVersion || event.revisionId !== receipt.revisionId || event.version !== receipt.resultingTaskVersion || event.at !== receipt.recordedAt || event.idempotencyKey !== receipt.key || event.commandPayloadHash !== receipt.payloadHash) return null;
    const expectedType: ProjectTaskEventType = receipt.action === "create-task" ? "created" : receipt.action === "update-task" ? "updated" : receipt.action === "complete-task" ? "completed" : "reopened";
    const versionBindingIsValid = receipt.action === "create-task"
      ? receipt.expectedVersion === receipt.resultingStoreVersion - 1 && receipt.resultingTaskVersion === 1
      : receipt.expectedVersion === receipt.resultingTaskVersion - 1;
    const reconstructedPayload = receipt.action === "create-task" || receipt.action === "update-task"
      ? { inputSchemaVersion: 1, action: receipt.action, projectId: receipt.projectId, taskId: receipt.taskId, draft: { title: revision.snapshot.title, currentStep: revision.snapshot.currentStep, dueDate: revision.snapshot.dueDate ?? "" } }
      : { inputSchemaVersion: 1, action: receipt.action, projectId: receipt.projectId, taskId: receipt.taskId };
    if (event.type !== expectedType || !versionBindingIsValid || receipt.payloadHash !== hashValue(reconstructedPayload) || receipt.action === "create-task" && receipt.taskId !== projectTaskIdForIdempotencyKey(receipt.key)) return null;
  }
  const receiptEventIds = new Set(exactReceipts.map((receipt) => receipt.eventId));
  if (exactRecords.some((record) => record.history.some((event) => event.type !== "migrated" && !receiptEventIds.has(event.id)))) return null;
  const createdRecords = exactRecords.slice(migratedRecords.length);
  const createdOrder = exactReceipts.filter((receipt) => receipt.action === "create-task").map((receipt) => receipt.taskId);
  if (createdRecords.length !== createdOrder.length || createdRecords.some((record, index) => record.id !== createdOrder[index])) return null;
  if (exactReceipts.length > 0 && Date.parse(exactReceipts[0].recordedAt) <= Date.parse(report.migratedAt)) return null;
  const expectedUpdatedAt = exactReceipts.at(-1)?.recordedAt ?? report.migratedAt;
  if (envelope.updatedAt !== expectedUpdatedAt) return null;
  const { fingerprint: _fingerprint, ...payload } = envelope;
  return envelope.fingerprint === hashValue(payload) ? envelope : null;
}

function parseEnvelopeRaw(raw: string | null, authority: ProjectTaskAuthority) {
  if (raw === null) return null;
  try {
    return parseEnvelope(JSON.parse(raw), authority);
  } catch {
    return null;
  }
}

function parseMarkerRaw(raw: string | null): ProjectTaskMarker | null {
  if (raw === null) return null;
  try {
    const value = JSON.parse(raw);
    const common = ["schemaVersion", "state", "migrationId", "sourceGeneration", "sourceKey", "sourceRawHash", "migrationAt", "identityBindingHash", "fingerprint"];
    const expected = value?.state === "pending" ? common : value?.state === "verified" ? [...common, "initialStoreVersion", "initialCanonicalHash", "migrationReportHash", "verifiedAt"] : value?.state === "committed" ? [...common, "initialStoreVersion", "initialCanonicalHash", "migrationReportHash", "committedAt"] : [];
    if (!hasExactKeys(value, expected)) return null;
    const marker = value as ProjectTaskMarker;
    if (marker.schemaVersion !== 1 || !["pending", "verified", "committed"].includes(marker.state) || !exactString(marker.migrationId, 260) || !["v1-array", "none"].includes(marker.sourceGeneration) || !exactDate(marker.migrationAt) || !exactHash(marker.identityBindingHash)) return null;
    if (marker.sourceGeneration === "v1-array" ? marker.sourceKey !== legacyProjectTasksStorageKey || !exactHash(marker.sourceRawHash) : marker.sourceKey !== null || marker.sourceRawHash !== null) return null;
    if (marker.state !== "pending" && (marker.initialStoreVersion !== 1 || !exactHash(marker.initialCanonicalHash) || !exactHash(marker.migrationReportHash) || (marker.state === "verified" ? marker.verifiedAt : marker.committedAt) !== marker.migrationAt)) return null;
    const { fingerprint: _fingerprint, ...payload } = marker;
    return marker.fingerprint === hashValue(payload) ? marker : null;
  } catch {
    return null;
  }
}

function initialEnvelopeHash(envelope: ProjectTaskEnvelope) {
  const migratedRecords = envelope.records.filter((record) => record.history[0].type === "migrated").map(migratedInitialRecord);
  const initial = finalizeEnvelope({
    schemaVersion: 2,
    fingerprintVersion: "manual-task-domain-v1",
    storeVersion: 1,
    records: migratedRecords,
    idempotencyReceipts: [],
    migrationReports: envelope.migrationReports,
    updatedAt: envelope.migrationReports[0].migratedAt,
  });
  return rawHash(JSON.stringify(initial))!;
}

function markerBindingIsValid(raw: string, envelope: ProjectTaskEnvelope, marker: ProjectTaskVerifiedMarker | ProjectTaskCommittedMarker, authority: ProjectTaskAuthority) {
  const report = envelope.migrationReports[0];
  return marker.identityBindingHash === authority.identityBindingHash
    && marker.sourceGeneration === report.sourceGeneration
    && marker.sourceKey === report.sourceKey
    && marker.sourceRawHash === report.sourceRawHash
    && marker.migrationAt === report.migratedAt
    && report.id === `manual-task-migration-report:${marker.migrationId}`
    && marker.migrationReportHash === report.fingerprint
    && marker.initialCanonicalHash === initialEnvelopeHash(envelope)
    && (envelope.storeVersion !== 1 || rawHash(raw) === marker.initialCanonicalHash);
}

function buildMigratedRecord(task: LegacyProjectTask, timestamp: string, authority: ProjectTaskAuthority): ProjectTaskRecord {
  const snapshot: ProjectTaskSnapshot = { title: task.title, currentStep: task.currentStep, dueDate: task.dueDate, status: task.status, completedAt: task.completedAt };
  const revision = finalizeRevision({ id: `manual-task-revision:${task.id}:v1`, version: 1, createdAt: timestamp, snapshot });
  const event = finalizeEvent({ id: `manual-task-event:${task.id}:v1`, type: "migrated", actor: "سامانهٔ مهاجرت", actorPrincipalId: "local-builder-account", at: timestamp, version: 1, revisionId: revision.id, authorizationContextHash: authority.authorizationHashes[task.projectId], idempotencyKey: null, commandPayloadHash: null });
  const legacyEvidence = finalizeLegacyEvidence({ schemaVersion: 1, sourceGeneration: "v1-array", sourceIndex: task.sourceIndex, sourceRecordHash: task.sourceRecordHash, sourceVersion: task.version, sourceCreatedAt: task.createdAt, sourceUpdatedAt: task.updatedAt, sourceCompletedAt: task.completedAt, history: task.history });
  return finalizeRecord({
    schemaVersion: 2, objectType: "manual-task", id: task.id, projectId: task.projectId, ownerPrincipalType: "account", ownerPrincipalId: "local-builder-account", accountSide: "builder", scopeType: "project_private", scopeId: task.projectId, custodianService: "Task Service", sensitivity: "private",
    ...snapshot, source: "ثبت مستقیم شما", visibility: "خصوصی پروژه", localStatus: "ثبت محلی", version: 1, currentRevisionId: revision.id, createdBy: "local-builder-account", updatedBy: "local-builder-account", createdAt: task.createdAt, updatedAt: timestamp, history: [event], revisions: [revision], legacyEvidence,
  });
}

function buildMigrationEnvelope(marker: Pick<ProjectTaskPendingMarker, "migrationId" | "sourceGeneration" | "sourceKey" | "sourceRawHash" | "migrationAt">, legacyTasks: LegacyProjectTask[], authority: ProjectTaskAuthority) {
  const records = legacyTasks.map((task) => buildMigratedRecord(task, marker.migrationAt, authority));
  const report = finalizeMigrationReport({ schemaVersion: 1, id: `manual-task-migration-report:${marker.migrationId}`, sourceGeneration: marker.sourceGeneration, sourceKey: marker.sourceKey, sourceRawHash: marker.sourceRawHash, migratedAt: marker.migrationAt, recordCount: records.length, migratedRecordFingerprints: records.map((record) => record.fingerprint) });
  return finalizeEnvelope({ schemaVersion: 2, fingerprintVersion: "manual-task-domain-v1", storeVersion: 1, records, idempotencyReceipts: [], migrationReports: [report], updatedAt: marker.migrationAt });
}

function migrationSourceStillMatches(marker: Pick<ProjectTaskPendingMarker, "sourceGeneration" | "sourceRawHash">) {
  const raw = window.localStorage.getItem(legacyProjectTasksStorageKey);
  return marker.sourceGeneration === "v1-array" ? rawHash(raw) === marker.sourceRawHash : raw === null;
}

function expectedMigrationCandidateRaw(marker: ProjectTaskPendingMarker | ProjectTaskVerifiedMarker, authority: ProjectTaskAuthority) {
  const sourceRaw = marker.sourceGeneration === "v1-array" ? window.localStorage.getItem(legacyProjectTasksStorageKey) : null;
  const legacyTasks = sourceRaw === null ? [] : parseLegacyTasks(sourceRaw, authority);
  return legacyTasks ? JSON.stringify(buildMigrationEnvelope(marker, legacyTasks, authority)) : null;
}

async function withWriteLock<Result>(fallback: Result, operation: () => Result | Promise<Result>): Promise<Result> {
  try {
    const manager = window.navigator.locks;
    if (!manager?.request) return fallback;
    return await manager.request(projectTasksWriteLockName, { mode: "exclusive" }, operation);
  } catch {
    return fallback;
  }
}

function restoreOwnedValue(key: string, previousRaw: string | null, candidateRaw: string) {
  try {
    const current = window.localStorage.getItem(key);
    if (current === previousRaw) return true;
    if (current !== candidateRaw) return false;
    if (previousRaw === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, previousRaw);
    return window.localStorage.getItem(key) === previousRaw;
  } catch {
    return false;
  }
}

function commitVerifiedMarker(marker: ProjectTaskVerifiedMarker, expectedRaw: string, getAuthority: () => ProjectTaskAuthority | null): ProjectTaskState {
  try {
    const authority = getAuthority();
    const canonicalRaw = window.localStorage.getItem(projectTasksStorageKey);
    const envelope = authorityIsValid(authority) ? parseEnvelopeRaw(canonicalRaw, authority) : null;
    if (!authority || marker.identityBindingHash !== authority.identityBindingHash || !canonicalRaw || !envelope || !markerBindingIsValid(canonicalRaw, envelope, marker, authority)) return { status: "read-error", envelope: null, reason: "verified-binding-invalid" };
    const committed = finalizeMarker({ schemaVersion: 1, state: "committed", migrationId: marker.migrationId, sourceGeneration: marker.sourceGeneration, sourceKey: marker.sourceKey, sourceRawHash: marker.sourceRawHash, migrationAt: marker.migrationAt, identityBindingHash: marker.identityBindingHash, initialStoreVersion: 1, initialCanonicalHash: marker.initialCanonicalHash, migrationReportHash: marker.migrationReportHash, committedAt: marker.verifiedAt }) as ProjectTaskCommittedMarker;
    const committedRaw = JSON.stringify(committed);
    const cutoverAuthority = getAuthority();
    const cutoverCanonicalRaw = window.localStorage.getItem(projectTasksStorageKey);
    const cutoverEnvelope = authorityIsValid(cutoverAuthority) ? parseEnvelopeRaw(cutoverCanonicalRaw, cutoverAuthority) : null;
    if (!cutoverAuthority || cutoverAuthority.snapshotHash !== authority.snapshotHash || window.localStorage.getItem(projectTasksCutoverMarkerKey) !== expectedRaw || cutoverCanonicalRaw !== canonicalRaw || cutoverCanonicalRaw !== expectedMigrationCandidateRaw(marker, cutoverAuthority) || !cutoverEnvelope || !markerBindingIsValid(cutoverCanonicalRaw, cutoverEnvelope, marker, cutoverAuthority) || !migrationSourceStillMatches(marker)) return { status: "read-error", envelope: null, reason: "verified-binding-invalid" };
    // This final exact validation is the source-authority cutover. Persisting the
    // committed marker only publishes that decision; later v1 writes are legacy.
    window.localStorage.setItem(projectTasksCutoverMarkerKey, committedRaw);
    const afterAuthority = getAuthority();
    const readbackRaw = window.localStorage.getItem(projectTasksStorageKey);
    const readback = authorityIsValid(afterAuthority) ? parseEnvelopeRaw(readbackRaw, afterAuthority) : null;
    if (window.localStorage.getItem(projectTasksCutoverMarkerKey) === committedRaw && afterAuthority?.snapshotHash === authority.snapshotHash && readbackRaw === canonicalRaw && readback && markerBindingIsValid(readbackRaw!, readback, committed, afterAuthority)) return { status: "ready", envelope: readback, reason: "" };
    return { status: "read-error", envelope: null, reason: "commit-readback-failure" };
  } catch {
    return { status: "read-error", envelope: null, reason: "commit-write-failure" };
  }
}

function writeMigrationCandidate(marker: ProjectTaskPendingMarker, expectedRaw: string, getAuthority: () => ProjectTaskAuthority | null): ProjectTaskState {
  try {
    const authority = getAuthority();
    const existingCanonicalRaw = window.localStorage.getItem(projectTasksStorageKey);
    if (!authorityIsValid(authority) || authority.identityBindingHash !== marker.identityBindingHash || window.localStorage.getItem(projectTasksCutoverMarkerKey) !== expectedRaw || !migrationSourceStillMatches(marker)) return { status: "read-error", envelope: null, reason: "migration-preimage-changed" };
    const sourceRaw = marker.sourceGeneration === "v1-array" ? window.localStorage.getItem(legacyProjectTasksStorageKey) : null;
    const legacyTasks = sourceRaw === null ? [] : parseLegacyTasks(sourceRaw, authority);
    if (!legacyTasks) return { status: "read-error", envelope: null, reason: "legacy-invalid" };
    const candidate = buildMigrationEnvelope(marker, legacyTasks, authority);
    const candidateRaw = JSON.stringify(candidate);
    if (!parseEnvelopeRaw(candidateRaw, authority)) return { status: "read-error", envelope: null, reason: "candidate-invalid" };
    if (existingCanonicalRaw !== null && existingCanonicalRaw !== candidateRaw) return { status: "read-error", envelope: null, reason: "migration-candidate-conflict" };
    if (existingCanonicalRaw === null) window.localStorage.setItem(projectTasksStorageKey, candidateRaw);
    const afterCandidateAuthority = getAuthority();
    const parsedCandidate = authorityIsValid(afterCandidateAuthority) ? parseEnvelopeRaw(window.localStorage.getItem(projectTasksStorageKey), afterCandidateAuthority) : null;
    if (afterCandidateAuthority?.snapshotHash !== authority.snapshotHash || window.localStorage.getItem(projectTasksCutoverMarkerKey) !== expectedRaw || window.localStorage.getItem(projectTasksStorageKey) !== candidateRaw || !migrationSourceStillMatches(marker) || !parsedCandidate) {
      if (existingCanonicalRaw === null) restoreOwnedValue(projectTasksStorageKey, null, candidateRaw);
      return { status: "read-error", envelope: null, reason: "candidate-readback-failure" };
    }
    const verified = finalizeMarker({ schemaVersion: 1, state: "verified", migrationId: marker.migrationId, sourceGeneration: marker.sourceGeneration, sourceKey: marker.sourceKey, sourceRawHash: marker.sourceRawHash, migrationAt: marker.migrationAt, identityBindingHash: marker.identityBindingHash, initialStoreVersion: 1, initialCanonicalHash: rawHash(candidateRaw)!, migrationReportHash: candidate.migrationReports[0].fingerprint, verifiedAt: marker.migrationAt }) as ProjectTaskVerifiedMarker;
    const verifiedRaw = JSON.stringify(verified);
    window.localStorage.setItem(projectTasksCutoverMarkerKey, verifiedRaw);
    if (window.localStorage.getItem(projectTasksCutoverMarkerKey) !== verifiedRaw || window.localStorage.getItem(projectTasksStorageKey) !== candidateRaw || !migrationSourceStillMatches(marker)) {
      if (window.localStorage.getItem(projectTasksCutoverMarkerKey) === verifiedRaw) window.localStorage.setItem(projectTasksCutoverMarkerKey, expectedRaw);
      if (existingCanonicalRaw === null) restoreOwnedValue(projectTasksStorageKey, null, candidateRaw);
      return { status: "read-error", envelope: null, reason: "verified-readback-failure" };
    }
    return commitVerifiedMarker(verified, verifiedRaw, getAuthority);
  } catch {
    return { status: "read-error", envelope: null, reason: "migration-write-failure" };
  }
}

export function readProjectTaskState(authority: ProjectTaskAuthority | null): ProjectTaskState {
  try {
    if (!authorityIsValid(authority)) return { status: "read-error", envelope: null, reason: "foundation-invalid" };
    const markerRaw = window.localStorage.getItem(projectTasksCutoverMarkerKey);
    const canonicalRaw = window.localStorage.getItem(projectTasksStorageKey);
    if (markerRaw === null) return canonicalRaw === null ? { status: "loading", envelope: null, reason: "migration-required" } : { status: "read-error", envelope: null, reason: "marker-missing" };
    const marker = parseMarkerRaw(markerRaw);
    if (!marker || marker.identityBindingHash !== authority.identityBindingHash) return { status: "read-error", envelope: null, reason: "marker-invalid" };
    if (marker.state !== "committed") return { status: "loading", envelope: null, reason: "migration-incomplete" };
    const envelope = parseEnvelopeRaw(canonicalRaw, authority);
    return canonicalRaw !== null && envelope && markerBindingIsValid(canonicalRaw, envelope, marker, authority)
      ? { status: "ready", envelope, reason: "" }
      : { status: "read-error", envelope: null, reason: "canonical-invalid" };
  } catch {
    return { status: "read-error", envelope: null, reason: "read-failure" };
  }
}

export async function initializeProjectTasks(getAuthority: () => ProjectTaskAuthority | null): Promise<ProjectTaskState> {
  return withWriteLock<ProjectTaskState>({ status: "read-error", envelope: null, reason: "lock-unavailable" }, () => {
    try {
      const authority = getAuthority();
      if (!authorityIsValid(authority)) return { status: "read-error", envelope: null, reason: "foundation-invalid" };
      const markerRaw = window.localStorage.getItem(projectTasksCutoverMarkerKey);
      const canonicalRaw = window.localStorage.getItem(projectTasksStorageKey);
      if (markerRaw !== null) {
        const marker = parseMarkerRaw(markerRaw);
        if (!marker || marker.identityBindingHash !== authority.identityBindingHash) return { status: "read-error", envelope: null, reason: "marker-invalid" };
        if (marker.state === "committed") {
          const envelope = parseEnvelopeRaw(canonicalRaw, authority);
          return canonicalRaw && envelope && markerBindingIsValid(canonicalRaw, envelope, marker, authority) ? { status: "ready", envelope, reason: "" } : { status: "read-error", envelope: null, reason: "canonical-invalid" };
        }
        if (marker.state === "verified") return commitVerifiedMarker(marker, markerRaw, getAuthority);
        return writeMigrationCandidate(marker, markerRaw, getAuthority);
      }
      if (canonicalRaw !== null) return { status: "read-error", envelope: null, reason: "marker-missing" };
      const legacyRaw = window.localStorage.getItem(legacyProjectTasksStorageKey);
      const sourceGeneration: ProjectTaskCutoverSource = legacyRaw === null ? "none" : "v1-array";
      const legacyTasks = legacyRaw === null ? [] : parseLegacyTasks(legacyRaw, authority);
      if (!legacyTasks) return { status: "read-error", envelope: null, reason: "legacy-invalid" };
      const latestLegacyTime = legacyTasks.reduce((latest, task) => Math.max(latest, Date.parse(task.updatedAt)), Number.NEGATIVE_INFINITY);
      const migrationAt = new Date(Math.max(Date.now(), Number.isFinite(latestLegacyTime) ? latestLegacyTime + 1 : Date.now())).toISOString();
      const pending = finalizeMarker({ schemaVersion: 1, state: "pending", migrationId: `manual-task-migration:${window.crypto.randomUUID()}`, sourceGeneration, sourceKey: sourceGeneration === "v1-array" ? legacyProjectTasksStorageKey : null, sourceRawHash: rawHash(legacyRaw), migrationAt, identityBindingHash: authority.identityBindingHash }) as ProjectTaskPendingMarker;
      const candidate = buildMigrationEnvelope(pending, legacyTasks, authority);
      if (!parseEnvelopeRaw(JSON.stringify(candidate), authority)) return { status: "read-error", envelope: null, reason: "migration-source-unrepresentable" };
      const pendingRaw = JSON.stringify(pending);
      window.localStorage.setItem(projectTasksCutoverMarkerKey, pendingRaw);
      if (window.localStorage.getItem(projectTasksCutoverMarkerKey) !== pendingRaw) return { status: "read-error", envelope: null, reason: "pending-readback-failure" };
      return writeMigrationCandidate(pending, pendingRaw, getAuthority);
    } catch {
      return { status: "read-error", envelope: null, reason: "initialization-failure" };
    }
  });
}

export function projectTaskIdForIdempotencyKey(idempotencyKey: string) {
  const digest = sha256(`manual-task-create:${idempotencyKey}`);
  return `task-${digest.slice(0, 8)}-${digest.slice(8, 12)}-${digest.slice(12, 16)}-${digest.slice(16, 20)}-${digest.slice(20, 32)}`;
}

function normalizedDraft(draft: ProjectTaskDraft): ProjectTaskDraft {
  return { title: draft.title.trim(), currentStep: draft.currentStep.trim(), dueDate: draft.dueDate.trim() };
}

function commandPayload(command: ProjectTaskCommand) {
  if (command.action === "create-task") return { inputSchemaVersion: command.inputSchemaVersion, action: command.action, projectId: command.projectId, taskId: command.taskId, draft: normalizedDraft(command.draft) };
  if (command.action === "update-task") return { inputSchemaVersion: command.inputSchemaVersion, action: command.action, projectId: command.projectId, taskId: command.taskId, draft: normalizedDraft(command.draft) };
  return { inputSchemaVersion: command.inputSchemaVersion, action: command.action, projectId: command.projectId, taskId: command.taskId };
}

function commandPayloadHash(command: ProjectTaskCommand) {
  return hashValue(commandPayload(command));
}

function commandIsValid(value: unknown): value is ProjectTaskCommand {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const command = value as Record<string, any>;
  if (command.inputSchemaVersion !== 1 || !exactString(command.projectId, 200) || !exactString(command.taskId, 200) || !exactString(command.idempotencyKey, 200)) return false;
  if (command.action === "create-task") {
    if (!hasExactKeys(command, ["inputSchemaVersion", "action", "projectId", "taskId", "draft", "expectedStoreVersion", "idempotencyKey"]) || !Number.isSafeInteger(command.expectedStoreVersion) || command.expectedStoreVersion < 1 || command.taskId !== projectTaskIdForIdempotencyKey(command.idempotencyKey) || !hasExactKeys(command.draft, ["title", "currentStep", "dueDate"])) return false;
  } else if (command.action === "update-task") {
    if (!hasExactKeys(command, ["inputSchemaVersion", "action", "projectId", "taskId", "draft", "expectedTaskVersion", "idempotencyKey"]) || !Number.isSafeInteger(command.expectedTaskVersion) || command.expectedTaskVersion < 1 || !hasExactKeys(command.draft, ["title", "currentStep", "dueDate"])) return false;
  } else if (command.action === "complete-task" || command.action === "reopen-task") {
    return hasExactKeys(command, ["inputSchemaVersion", "action", "projectId", "taskId", "expectedTaskVersion", "idempotencyKey"]) && Number.isSafeInteger(command.expectedTaskVersion) && command.expectedTaskVersion >= 1;
  } else return false;
  if (typeof command.draft.title !== "string" || typeof command.draft.currentStep !== "string" || typeof command.draft.dueDate !== "string") return false;
  const draft = normalizedDraft(command.draft as ProjectTaskDraft);
  return draft.title === command.draft.title && draft.currentStep === command.draft.currentStep && draft.dueDate === command.draft.dueDate && validDraftSnapshot({ ...draft, dueDate: draft.dueDate || null, status: "in-progress", completedAt: null });
}

function readForMutation(authority: ProjectTaskAuthority) {
  try {
    const markerRaw = window.localStorage.getItem(projectTasksCutoverMarkerKey);
    const canonicalRaw = window.localStorage.getItem(projectTasksStorageKey);
    const marker = parseMarkerRaw(markerRaw);
    const envelope = parseEnvelopeRaw(canonicalRaw, authority);
    return markerRaw && canonicalRaw && marker?.state === "committed" && envelope && markerBindingIsValid(canonicalRaw, envelope, marker, authority) ? { markerRaw, canonicalRaw, envelope } : null;
  } catch {
    return null;
  }
}

function appendTaskVersion(record: ProjectTaskRecord, snapshot: ProjectTaskSnapshot, type: Exclude<ProjectTaskEventType, "created" | "migrated">, timestamp: string, idempotencyKey: string, payloadHash: string, authorizationContextHash: string) {
  const version = record.version + 1;
  const revision = finalizeRevision({ id: `manual-task-revision:${record.id}:v${version}`, version, createdAt: timestamp, snapshot });
  const event = finalizeEvent({ id: `manual-task-event:${record.id}:v${version}`, type, actor: "شما", actorPrincipalId: "local-builder-account", at: timestamp, version, revisionId: revision.id, authorizationContextHash, idempotencyKey, commandPayloadHash: payloadHash });
  return finalizeRecord({ ...record, ...snapshot, version, currentRevisionId: revision.id, updatedAt: timestamp, history: [...record.history, event], revisions: [...record.revisions, revision] });
}

function commitEnvelope(previousRaw: string, expectedMarkerRaw: string, expectedAuthority: ProjectTaskAuthority, nextEnvelope: ProjectTaskEnvelope, getAuthority: () => ProjectTaskAuthority | null): ProjectTaskMutationResult {
  const candidateRaw = JSON.stringify(nextEnvelope);
  if (!parseEnvelopeRaw(candidateRaw, expectedAuthority)) return { status: "schema-invalid", reason: "candidate-invalid" };
  try {
    if (window.localStorage.getItem(projectTasksStorageKey) !== previousRaw || window.localStorage.getItem(projectTasksCutoverMarkerKey) !== expectedMarkerRaw || getAuthority()?.snapshotHash !== expectedAuthority.snapshotHash) return { status: "version-conflict", reason: "preimage-changed" };
    window.localStorage.setItem(projectTasksStorageKey, candidateRaw);
    const afterAuthority = getAuthority();
    const readbackRaw = window.localStorage.getItem(projectTasksStorageKey);
    const marker = parseMarkerRaw(window.localStorage.getItem(projectTasksCutoverMarkerKey));
    const readback = authorityIsValid(afterAuthority) ? parseEnvelopeRaw(readbackRaw, afterAuthority) : null;
    if (readbackRaw === candidateRaw && window.localStorage.getItem(projectTasksCutoverMarkerKey) === expectedMarkerRaw && afterAuthority?.snapshotHash === expectedAuthority.snapshotHash && marker?.state === "committed" && readback && markerBindingIsValid(readbackRaw!, readback, marker, afterAuthority)) return { status: "updated", envelope: readback };
    return restoreOwnedValue(projectTasksStorageKey, previousRaw, candidateRaw) ? { status: "write-failure", reason: "readback-failure" } : { status: "read-failure", reason: "rollback-failure" };
  } catch {
    return restoreOwnedValue(projectTasksStorageKey, previousRaw, candidateRaw) ? { status: "write-failure", reason: "persistence-failure" } : { status: "read-failure", reason: "rollback-failure" };
  }
}

export async function executeProjectTaskCommand(command: ProjectTaskCommand, getAuthority: () => ProjectTaskAuthority | null): Promise<ProjectTaskMutationResult> {
  return withWriteLock<ProjectTaskMutationResult>({ status: "lock-unavailable", reason: "lock-unavailable" }, () => {
    if (!commandIsValid(command)) return { status: "schema-invalid", reason: "command-invalid" };
    const authority = getAuthority();
    if (!authorityIsValid(authority)) return { status: "read-failure", reason: "foundation-invalid" };
    const current = readForMutation(authority);
    if (!current) return { status: "read-failure", reason: "task-store-invalid" };
    const payloadHash = commandPayloadHash(command);
    const existingReceipt = current.envelope.idempotencyReceipts.find((receipt) => receipt.key === command.idempotencyKey);
    if (existingReceipt) {
      if (existingReceipt.action !== command.action || existingReceipt.payloadHash !== payloadHash || existingReceipt.taskId !== command.taskId || existingReceipt.projectId !== command.projectId) return { status: "idempotency-payload-mismatch", envelope: current.envelope, reason: "idempotency-key-reused" };
      return { status: existingReceipt.result, envelope: current.envelope, taskId: existingReceipt.taskId };
    }
    if (!authority.projectIds.includes(command.projectId)) return { status: "scope-mismatch", envelope: current.envelope, reason: "project-not-authorized" };
    const timestamp = new Date(Math.max(Date.now(), Date.parse(current.envelope.updatedAt) + 1)).toISOString();
    const resultingStoreVersion = current.envelope.storeVersion + 1;
    let nextRecord: ProjectTaskRecord;
    let expectedVersion: number;
    let result: "created" | "updated";

    if (command.action === "create-task") {
      if (command.expectedStoreVersion !== current.envelope.storeVersion) return { status: "version-conflict", envelope: current.envelope, reason: "store-version-stale" };
      if (current.envelope.records.some((record) => record.id === command.taskId)) return { status: "version-conflict", envelope: current.envelope, reason: "task-id-exists" };
      const draft = normalizedDraft(command.draft);
      const snapshot: ProjectTaskSnapshot = { title: draft.title, currentStep: draft.currentStep, dueDate: draft.dueDate || null, status: "in-progress", completedAt: null };
      const revision = finalizeRevision({ id: `manual-task-revision:${command.taskId}:v1`, version: 1, createdAt: timestamp, snapshot });
      const event = finalizeEvent({ id: `manual-task-event:${command.taskId}:v1`, type: "created", actor: "شما", actorPrincipalId: "local-builder-account", at: timestamp, version: 1, revisionId: revision.id, authorizationContextHash: authority.authorizationHashes[command.projectId], idempotencyKey: command.idempotencyKey, commandPayloadHash: payloadHash });
      nextRecord = finalizeRecord({ schemaVersion: 2, objectType: "manual-task", id: command.taskId, projectId: command.projectId, ownerPrincipalType: "account", ownerPrincipalId: "local-builder-account", accountSide: "builder", scopeType: "project_private", scopeId: command.projectId, custodianService: "Task Service", sensitivity: "private", ...snapshot, source: "ثبت مستقیم شما", visibility: "خصوصی پروژه", localStatus: "ثبت محلی", version: 1, currentRevisionId: revision.id, createdBy: "local-builder-account", updatedBy: "local-builder-account", createdAt: timestamp, updatedAt: timestamp, history: [event], revisions: [revision], legacyEvidence: null });
      expectedVersion = command.expectedStoreVersion;
      result = "created";
    } else {
      const existing = current.envelope.records.find((record) => record.id === command.taskId);
      if (!existing) return { status: "not-found", envelope: current.envelope, reason: "task-not-found" };
      if (existing.projectId !== command.projectId || existing.scopeId !== command.projectId) return { status: "scope-mismatch", envelope: current.envelope, reason: "task-project-mismatch" };
      if (command.expectedTaskVersion !== existing.version) return { status: "version-conflict", envelope: current.envelope, taskId: existing.id, reason: "task-version-stale" };
      expectedVersion = command.expectedTaskVersion;
      const snapshot: ProjectTaskSnapshot = { title: existing.title, currentStep: existing.currentStep, dueDate: existing.dueDate, status: existing.status, completedAt: existing.completedAt };
      if (command.action === "update-task") {
        const draft = normalizedDraft(command.draft);
        const nextSnapshot = { ...snapshot, title: draft.title, currentStep: draft.currentStep, dueDate: draft.dueDate || null };
        if (JSON.stringify(stableValue(nextSnapshot)) === JSON.stringify(stableValue(snapshot))) return { status: "unchanged", envelope: current.envelope, taskId: existing.id };
        nextRecord = appendTaskVersion(existing, nextSnapshot, "updated", timestamp, command.idempotencyKey, payloadHash, authority.authorizationHashes[command.projectId]);
      } else if (command.action === "complete-task") {
        if (existing.status === "completed") return { status: "unchanged", envelope: current.envelope, taskId: existing.id };
        nextRecord = appendTaskVersion(existing, { ...snapshot, status: "completed", completedAt: timestamp }, "completed", timestamp, command.idempotencyKey, payloadHash, authority.authorizationHashes[command.projectId]);
      } else {
        if (existing.status === "in-progress") return { status: "unchanged", envelope: current.envelope, taskId: existing.id };
        nextRecord = appendTaskVersion(existing, { ...snapshot, status: "in-progress", completedAt: null }, "reopened", timestamp, command.idempotencyKey, payloadHash, authority.authorizationHashes[command.projectId]);
      }
      result = "updated";
    }

    const event = nextRecord.history.at(-1)!;
    const receipt = finalizeReceipt({ schemaVersion: 1, key: command.idempotencyKey, action: command.action, payloadHash, projectId: command.projectId, taskId: nextRecord.id, expectedVersion, result, resultingStoreVersion, resultingTaskVersion: nextRecord.version, eventId: event.id, revisionId: event.revisionId, recordedAt: timestamp });
    const nextEnvelope = finalizeEnvelope({ ...current.envelope, storeVersion: resultingStoreVersion, records: command.action === "create-task" ? [...current.envelope.records, nextRecord] : current.envelope.records.map((record) => record.id === nextRecord.id ? nextRecord : record), idempotencyReceipts: [...current.envelope.idempotencyReceipts, receipt], updatedAt: timestamp });
    const committed = commitEnvelope(current.canonicalRaw, current.markerRaw, authority, nextEnvelope, getAuthority);
    return committed.envelope ? { status: result, envelope: committed.envelope, taskId: nextRecord.id } : committed;
  });
}
