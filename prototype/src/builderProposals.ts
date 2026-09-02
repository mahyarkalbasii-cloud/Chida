import {
  procurementDispatchHash,
  procurementDispatchWriteLockName,
  type ProcurementDispatchAuthority,
  type SupplierContactEnvelope,
} from "./procurementDispatch";

export const legacyBuilderProposalsStorageKey =
  "chida-prototype-builder-recorded-proposals:v1";
export const builderProposalsStorageKey =
  "chida-prototype-builder-recorded-proposals:v2";
export const builderProposalsCutoverMarkerKey =
  `${builderProposalsStorageKey}:cutover:v1`;

export const builderProposalHash = procurementDispatchHash;

type Sha256Fingerprint = `sha256-${string}`;
type Fnv1aFingerprint = `fnv1a-${string}`;
type PurchaseRequestKind = "product" | "service";
type PurchaseRequestUnit = "عدد" | "کیلوگرم" | "تن" | "متر" | "مترمربع" | "مترمکعب" | "بسته" | "دستگاه";
type SupplierResponseCapability = "product" | "service" | "both";
export type ProjectFileCategory = "نقشه" | "پیش‌فاکتور" | "فاکتور" | "قرارداد" | "صورت‌جلسه" | "صفحه‌گسترده" | "عکس" | "سایر";
type CanonicalSupplierContactRevision = SupplierContactEnvelope["records"][number]["revisions"][number];

export type BuilderRecordedProposalLineStatus = "quoted" | "unavailable" | "alternative" | "not-mentioned";

export type BuilderRecordedProposalRequestSnapshot = {
  requestKind: PurchaseRequestKind;
  title: string;
  items: Array<{ id: string; name: string | null; quantity: string | null; unit: PurchaseRequestUnit | null }>;
  service: null | { id: string; scope: string | null; location: string | null };
};

export type BuilderRecordedProposalSupplierSnapshot = {
  supplierContactId: string;
  supplierContactVersion: number;
  displayName: string;
  category: string;
  tehranCoverage: string;
  responseCapability: SupplierResponseCapability;
  networkStatus: "خارج از شبکه چیدا";
};

export type BuilderProposalContactPin = {
  supplierContactId: string;
  supplierContactVersion: number;
  supplierContactRevisionId: string;
  supplierContactRevisionFingerprint: Sha256Fingerprint;
};

export type BuilderProposalTargetPin = {
  requestId: string;
  requestVersion: number;
  reviewRevisionId: string;
  reviewRevisionFingerprint: Fnv1aFingerprint;
  requestDependencyFingerprint: Sha256Fingerprint;
  contentApprovalId: string;
  contentApprovalVersion: number;
  contentApprovalRevisionId: string;
  contentApprovalFingerprint: Sha256Fingerprint;
  requestKind: PurchaseRequestKind;
};

export type BuilderProposalFileSnapshot = {
  id: string;
  displayName: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: ProjectFileCategory;
  createdAt: string;
  storageMode: "metadata-only";
};

export type BuilderRecordedProposalReference =
  | {
      kind: "unattached";
      projectFileId: null;
      projectFileVersion: null;
      fileSnapshot: null;
      metadataFingerprint: null;
      contentPersisted: false;
      extractionPerformed: false;
    }
  | {
      kind: "project-file-metadata";
      projectFileId: string;
      projectFileVersion: 1;
      fileSnapshot: BuilderProposalFileSnapshot;
      metadataFingerprint: Sha256Fingerprint;
      contentPersisted: false;
      extractionPerformed: false;
    };

export type BuilderRecordedProposalLine = {
  id: string;
  requestItemId: string | null;
  serviceSpecId: string | null;
  requestLabel: string;
  status: BuilderRecordedProposalLineStatus;
  quantity: string | null;
  unit: string | null;
  unitPrice: string | null;
  totalPrice: string | null;
  currency: "تومان";
  tax: string | null;
  transport: string | null;
  minimumOrder: string | null;
  leadTime: string | null;
  validity: string | null;
  paymentTerms: string | null;
  notes: string | null;
};

export type BuilderRecordedProposalRevision = {
  id: string;
  version: number;
  createdAt: string;
  target: BuilderProposalTargetPin;
  requestSnapshot: BuilderRecordedProposalRequestSnapshot;
  supplierSnapshot: BuilderRecordedProposalSupplierSnapshot;
  contactPin: BuilderProposalContactPin;
  reference: BuilderRecordedProposalReference;
  declaredAt: string | null;
  transcript: string | null;
  notes: string | null;
  lines: BuilderRecordedProposalLine[];
  fingerprint: Sha256Fingerprint;
};

export type BuilderRecordedProposalEvent = {
  schemaVersion: 1;
  id: string;
  type: "created" | "updated";
  actor: "شما" | "سامانهٔ مهاجرت";
  actorPrincipalId: "local-builder-account";
  origin: "live-command" | "v1-migration";
  at: string;
  version: number;
  revisionId: string;
  authorizationContextHash: Sha256Fingerprint;
  dependencySnapshotHash: Sha256Fingerprint;
  idempotencyKey: string | null;
  commandPayloadHash: Sha256Fingerprint | null;
  fingerprint: Sha256Fingerprint;
};

export type BuilderProposalLegacyEvidence = {
  schemaVersion: 1;
  sourceGeneration: "v1-array";
  sourceIndex: number;
  sourceRecordHash: Sha256Fingerprint;
  sourceRecordVersion: number;
  sourceCreatedAt: string;
  sourceUpdatedAt: string;
  revisionLinks: Array<{
    revisionId: string;
    revisionVersion: number;
    legacyFingerprint: Fnv1aFingerprint;
    canonicalFingerprint: Sha256Fingerprint;
  }>;
  fingerprint: Sha256Fingerprint;
};

export type BuilderRecordedProposalRecord = {
  schemaVersion: 2;
  objectType: "builder-recorded-proposal";
  id: string;
  projectId: string;
  ownerPrincipalType: "account";
  ownerPrincipalId: "local-builder-account";
  accountSide: "builder";
  scopeType: "project_private";
  scopeId: string;
  custodianService: "Proposal Domain Service";
  sensitivity: "private";
  source: "ثبت دستی سازنده";
  networkStatus: "خارج از شبکه چیدا";
  supplierAuthenticated: false;
  receivedThroughChida: false;
  externalEffect: "none";
  target: BuilderProposalTargetPin;
  requestSnapshot: BuilderRecordedProposalRequestSnapshot;
  supplierSnapshot: BuilderRecordedProposalSupplierSnapshot;
  contactPin: BuilderProposalContactPin;
  reference: BuilderRecordedProposalReference;
  declaredAt: string | null;
  transcript: string | null;
  notes: string | null;
  lines: BuilderRecordedProposalLine[];
  currentRevisionId: string;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  version: number;
  createdAt: string;
  updatedAt: string;
  history: BuilderRecordedProposalEvent[];
  revisions: BuilderRecordedProposalRevision[];
  legacyEvidence: BuilderProposalLegacyEvidence | null;
  fingerprint: Sha256Fingerprint;
};

export type BuilderProposalCommandReceipt = {
  schemaVersion: 1;
  position: number;
  key: string;
  action: "create-proposal" | "update-proposal";
  payloadHash: Sha256Fingerprint;
  projectId: string;
  recordId: string;
  expectedStoreVersion: number;
  expectedRecordVersion: number | null;
  commandPins: BuilderProposalCommandPins;
  expectedDependencySnapshotHash: Sha256Fingerprint;
  result: "created" | "updated";
  resultingStoreVersion: number;
  resultingRecordVersion: number;
  eventId: string;
  revisionId: string;
  authorizationContextHash: Sha256Fingerprint;
  recordedAt: string;
  fingerprint: Sha256Fingerprint;
};

export type BuilderProposalMigrationReport = {
  schemaVersion: 1;
  id: string;
  store: "builder-proposal";
  sourceGeneration: "v1-array" | "none";
  sourceKey: typeof legacyBuilderProposalsStorageKey | null;
  sourceRawHash: Sha256Fingerprint | null;
  dependencySnapshotHash: Sha256Fingerprint;
  identityBindingHash: Sha256Fingerprint;
  migratedAt: string;
  recordCount: number;
  migratedRecordFingerprints: Sha256Fingerprint[];
  migratedRevisionCount: number;
  fingerprint: Sha256Fingerprint;
};

export type BuilderProposalEnvelope = {
  schemaVersion: 2;
  fingerprintVersion: "builder-proposal-domain-v2";
  storeVersion: number;
  records: BuilderRecordedProposalRecord[];
  idempotencyReceipts: BuilderProposalCommandReceipt[];
  migrationReports: [BuilderProposalMigrationReport];
  updatedAt: string;
  fingerprint: Sha256Fingerprint;
};

export type BuilderProposalPendingMarker = {
  schemaVersion: 1;
  store: "builder-proposal";
  state: "pending";
  migrationId: string;
  sourceGeneration: "v1-array" | "none";
  sourceKey: typeof legacyBuilderProposalsStorageKey | null;
  sourceRawHash: Sha256Fingerprint | null;
  dependencySnapshotHash: Sha256Fingerprint;
  identityBindingHash: Sha256Fingerprint;
  migrationAt: string;
  candidateRaw: string;
  candidateRawHash: Sha256Fingerprint;
  fingerprint: Sha256Fingerprint;
};

export type BuilderProposalVerifiedMarker = Omit<BuilderProposalPendingMarker, "state" | "fingerprint"> & {
  state: "verified";
  verifiedAt: string;
  fingerprint: Sha256Fingerprint;
};

export type BuilderProposalCommittedMarker = {
  schemaVersion: 1;
  store: "builder-proposal";
  state: "committed";
  migrationId: string;
  sourceGeneration: "v1-array" | "none";
  sourceKey: typeof legacyBuilderProposalsStorageKey | null;
  sourceRawHash: Sha256Fingerprint | null;
  dependencySnapshotHash: Sha256Fingerprint;
  identityBindingHash: Sha256Fingerprint;
  migrationAt: string;
  verifiedAt: string;
  committedAt: string;
  canonicalRawHash: Sha256Fingerprint;
  candidateRawHash: Sha256Fingerprint;
  fingerprint: Sha256Fingerprint;
};

export type BuilderProposalCutoverMarker = BuilderProposalPendingMarker | BuilderProposalVerifiedMarker | BuilderProposalCommittedMarker;

type BuilderProposalRequestDependencyInput = {
  projectId: string;
  requestId: string;
  requestVersion: number;
  revisionId: string;
  revisionFingerprint: string;
  revisionCreatedAt: string;
  requestKind: PurchaseRequestKind;
  isCurrentReadyForReview: boolean;
  snapshot: unknown;
  shareableFields: string[];
};

export type BuilderProposalRequestDependency = BuilderProposalRequestDependencyInput & { fingerprint: Sha256Fingerprint };

type BuilderProposalApprovalDependencyInput = {
  projectId: string;
  approvalId: string;
  approvalVersion: number;
  approvalRevisionId: string;
  approvalFingerprint: string;
  requestId: string;
  requestVersion: number;
  requestRevisionId: string;
  requestRevisionFingerprint: string;
  status: "pending" | "approved" | "changes-requested";
  isCurrent: boolean;
  updatedAt: string;
};

export type BuilderProposalApprovalDependency = BuilderProposalApprovalDependencyInput & { fingerprint: Sha256Fingerprint };

type BuilderProposalContactDependencyInput = {
  projectId: string;
  supplierContactId: string;
  supplierContactVersion: number;
  supplierContactRevisionId: string;
  supplierContactRevisionFingerprint: CanonicalSupplierContactRevision["fingerprint"];
  revisionCreatedAt: string;
  displayName: string;
  category: string;
  tehranCoverage: string;
  responseCapability: SupplierResponseCapability;
  status: "active" | "archived";
  archivedAt: string | null;
  isCurrent: boolean;
};

export type BuilderProposalContactDependency = BuilderProposalContactDependencyInput & { fingerprint: Sha256Fingerprint };

type BuilderProposalFileDependencyInput = {
  id: string;
  projectId: string;
  displayName: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: ProjectFileCategory;
  source: "انتخاب مستقیم از دستگاه" | "دوربین دستگاه";
  status: "ثبت محلی";
  version: 1;
  projectStage: string;
  visibility: "خصوصی پروژه";
  storageMode: "metadata-only" | "browser-image" | "browser-file";
  sourceModifiedAt: string | null;
  createdAt: string;
};

export type BuilderProposalFileDependency = BuilderProposalFileDependencyInput & { fingerprint: Sha256Fingerprint };

export type BuilderProposalDependencies = {
  schemaVersion: 1;
  authority: ProcurementDispatchAuthority;
  requestRevisions: BuilderProposalRequestDependency[];
  contentApprovals: BuilderProposalApprovalDependency[];
  contacts: BuilderProposalContactDependency[];
  files: BuilderProposalFileDependency[];
  snapshotHash: Sha256Fingerprint;
};

export type BuilderProposalDependencyInput = {
  authority: ProcurementDispatchAuthority;
  requestRevisions: BuilderProposalRequestDependencyInput[];
  contentApprovals: BuilderProposalApprovalDependencyInput[];
  contacts: BuilderProposalContactDependencyInput[];
  files: BuilderProposalFileDependencyInput[];
};

export type BuilderProposalDependencyReader = () => BuilderProposalDependencies | null;
export type BuilderProposalDependencyStatus = "current" | "stale" | "read-error";
export type BuilderProposalReadContext = {
  authority: ProcurementDispatchAuthority | null;
  dependencies: BuilderProposalDependencies | null;
};
export type BuilderProposalInitializationReader = () => BuilderProposalDependencies | BuilderProposalReadContext | null;
export type BuilderProposalState =
  | { status: "loading"; envelope: null; dependencyStatus: "read-error" }
  | { status: "ready"; envelope: BuilderProposalEnvelope; dependencyStatus: BuilderProposalDependencyStatus }
  | { status: "read-error"; envelope: null; dependencyStatus: "read-error" };

export type BuilderRecordedProposalLineDraft = Omit<BuilderRecordedProposalLine, "quantity" | "unit" | "unitPrice" | "totalPrice" | "tax" | "transport" | "minimumOrder" | "leadTime" | "validity" | "paymentTerms" | "notes" | "currency"> & {
  quantity: string;
  unit: string;
  unitPrice: string;
  totalPrice: string;
  tax: string;
  transport: string;
  minimumOrder: string;
  leadTime: string;
  validity: string;
  paymentTerms: string;
  notes: string;
};

export type BuilderRecordedProposalDraft = {
  requestId: string;
  supplierContactId: string;
  projectFileId: string;
  declaredAt: string;
  transcript: string;
  notes: string;
  lines: BuilderRecordedProposalLineDraft[];
};

export type BuilderProposalCommandPins = {
  requestDependencyFingerprint: Sha256Fingerprint;
  contentApprovalFingerprint: Sha256Fingerprint;
  supplierContactRevisionFingerprint: Sha256Fingerprint;
  fileMetadataFingerprint: Sha256Fingerprint | null;
  expectedDependencySnapshotHash: Sha256Fingerprint;
};

export type BuilderProposalCommand =
  | { inputSchemaVersion: 1; action: "create-proposal"; projectId: string; proposalId: string; draft: BuilderRecordedProposalDraft; pins: BuilderProposalCommandPins; expectedStoreVersion: number; idempotencyKey: string }
  | { inputSchemaVersion: 1; action: "update-proposal"; projectId: string; proposalId: string; draft: BuilderRecordedProposalDraft; pins: BuilderProposalCommandPins; expectedStoreVersion: number; expectedProposalVersion: number; idempotencyKey: string };

export type BuilderProposalMutationStatus = "created" | "updated" | "unchanged" | "version-conflict" | "dependency-invalid" | "idempotency-payload-mismatch" | "write-failure" | "read-failure" | "lock-unavailable" | "schema-invalid" | "scope-mismatch" | "not-found";
export type BuilderProposalMutationResult = { status: BuilderProposalMutationStatus; envelope?: BuilderProposalEnvelope; recordId?: string; reason?: string };

type NormalizedBuilderProposalLineDraft = Omit<BuilderRecordedProposalLine, "currency">;

type NormalizedBuilderProposalDraft = {
  requestId: string;
  supplierContactId: string;
  projectFileId: string;
  declaredAt: string | null;
  transcript: string | null;
  notes: string | null;
  lines: NormalizedBuilderProposalLineDraft[];
};

type NormalizedBuilderProposalCommand =
  | {
      inputSchemaVersion: 1;
      action: "create-proposal";
      projectId: string;
      proposalId: string;
      draft: NormalizedBuilderProposalDraft;
      pins: BuilderProposalCommandPins;
      expectedStoreVersion: number;
      idempotencyKey: string;
    }
  | {
      inputSchemaVersion: 1;
      action: "update-proposal";
      projectId: string;
      proposalId: string;
      draft: NormalizedBuilderProposalDraft;
      pins: BuilderProposalCommandPins;
      expectedStoreVersion: number;
      expectedProposalVersion: number;
      idempotencyKey: string;
    };

type BuilderProposalCommandPayload = {
  inputSchemaVersion: 1;
  action: "create-proposal" | "update-proposal";
  target: {
    projectId: string;
    proposalId: string;
    request: BuilderProposalTargetPin;
    contact: BuilderProposalContactPin;
  };
  draft: NormalizedBuilderProposalDraft;
  pins: BuilderProposalCommandPins;
  expectedStoreVersion: number;
  expectedProposalVersion: number | null;
  identityBindingHash: Sha256Fingerprint;
  authorizationContextHash: Sha256Fingerprint;
};

const sha256Pattern = /^sha256-[0-9a-f]{64}$/;
const fnv1aPattern = /^fnv1a-[0-9a-f]{8}$/;
const proposalLineStatuses = ["quoted", "unavailable", "alternative", "not-mentioned"] as const;
const purchaseRequestUnits = ["عدد", "کیلوگرم", "تن", "متر", "مترمربع", "مترمکعب", "بسته", "دستگاه"] as const;
const fileCategories = ["نقشه", "پیش‌فاکتور", "فاکتور", "قرارداد", "صورت‌جلسه", "صفحه‌گسترده", "عکس", "سایر"] as const;

function hasExactKeys(value: unknown, keys: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value as Record<string, unknown>).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function withoutFingerprint<T extends { fingerprint: string }>(value: T): Omit<T, "fingerprint"> {
  const { fingerprint: _fingerprint, ...payload } = value;
  return payload;
}

function exactString(value: unknown, maximumLength = 300) {
  return typeof value === "string" && value.length > 0 && value.length <= maximumLength && value.trim() === value;
}

function visibleString(value: unknown, maximumLength: number) {
  return exactString(value, maximumLength) && /[\p{L}\p{N}\p{P}\p{S}]/u.test((value as string).normalize("NFKC"));
}

function optionalVisibleString(value: unknown, maximumLength: number): value is string | null {
  return value === null || visibleString(value, maximumLength);
}

function exactInteger(value: unknown, minimum = 1) {
  return Number.isSafeInteger(value) && (value as number) >= minimum;
}

function exactDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function exactSha256(value: unknown): value is Sha256Fingerprint {
  return typeof value === "string" && sha256Pattern.test(value);
}

function exactFnv1a(value: unknown): value is Fnv1aFingerprint {
  return typeof value === "string" && fnv1aPattern.test(value);
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

function stableEqual(first: unknown, second: unknown) {
  return JSON.stringify(stableValue(first)) === JSON.stringify(stableValue(second));
}

const commandPinKeys = ["requestDependencyFingerprint", "contentApprovalFingerprint", "supplierContactRevisionFingerprint", "fileMetadataFingerprint", "expectedDependencySnapshotHash"] as const;
const commandDraftKeys = ["requestId", "supplierContactId", "projectFileId", "declaredAt", "transcript", "notes", "lines"] as const;
const commandLineKeys = ["id", "requestItemId", "serviceSpecId", "requestLabel", "status", "quantity", "unit", "unitPrice", "totalPrice", "tax", "transport", "minimumOrder", "leadTime", "validity", "paymentTerms", "notes"] as const;
const commandContentRawLengthAllowance = 64;
const commandNumericRawLengthLimit = 320;
const canonicalNumericLengthLimit = 200;

function isExactDenseArray(value: unknown[]): boolean {
  const propertyNames = Object.getOwnPropertyNames(value);
  if (Object.getOwnPropertySymbols(value).length !== 0 || propertyNames.length !== value.length + 1) return false;
  return propertyNames.every((name, index) => index === value.length ? name === "length" : name === String(index));
}

function commandPinsAreValid(value: unknown): value is BuilderProposalCommandPins {
  if (!hasExactKeys(value, commandPinKeys)) return false;
  const pins = value as Record<string, unknown>;
  return exactSha256(pins.requestDependencyFingerprint)
    && exactSha256(pins.contentApprovalFingerprint)
    && exactSha256(pins.supplierContactRevisionFingerprint)
    && (pins.fileMetadataFingerprint === null || exactSha256(pins.fileMetadataFingerprint))
    && exactSha256(pins.expectedDependencySnapshotHash);
}

function normalizeContentText(value: unknown, maximumLength: number): string | null | undefined {
  if (typeof value !== "string" || value.length > maximumLength + commandContentRawLengthAllowance) return undefined;
  const normalized = value.trim();
  if (normalized === "") return null;
  return visibleString(normalized, maximumLength) ? normalized : undefined;
}

function normalizeNumericText(value: unknown): string | null | undefined {
  if (typeof value !== "string" || value.length > commandNumericRawLengthLimit) return undefined;
  let normalized = value.trim();
  if (normalized === "") return null;
  normalized = normalized
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[٬,\s]/g, "")
    .replace(/٫/g, ".");
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return undefined;
  const [integerPart = "", fractionPart = ""] = normalized.split(".");
  const integer = integerPart.replace(/^0+(?=\d)/, "") || "0";
  const fraction = fractionPart.replace(/0+$/, "");
  const result = fraction === "" ? integer : `${integer}.${fraction}`;
  return result.length <= canonicalNumericLengthLimit && canonicalNumber(result) ? result : undefined;
}

function normalizeCommandLine(value: unknown): NormalizedBuilderProposalLineDraft | null {
  if (!hasExactKeys(value, commandLineKeys)) return null;
  const line = value as Record<string, unknown>;
  if (!exactString(line.id, 300)
    || line.requestItemId !== null && !exactString(line.requestItemId, 240)
    || line.serviceSpecId !== null && !exactString(line.serviceSpecId, 240)
    || !proposalLineStatuses.includes(line.status as BuilderRecordedProposalLineStatus)) return null;
  const requestLabel = normalizeContentText(line.requestLabel, 4000);
  const quantity = normalizeNumericText(line.quantity);
  const unit = normalizeContentText(line.unit, 80);
  const unitPrice = normalizeNumericText(line.unitPrice);
  const totalPrice = normalizeNumericText(line.totalPrice);
  const tax = normalizeContentText(line.tax, 160);
  const transport = normalizeContentText(line.transport, 160);
  const minimumOrder = normalizeContentText(line.minimumOrder, 160);
  const leadTime = normalizeContentText(line.leadTime, 160);
  const validity = normalizeContentText(line.validity, 160);
  const paymentTerms = normalizeContentText(line.paymentTerms, 240);
  const notes = normalizeContentText(line.notes, 500);
  if (requestLabel === undefined || requestLabel === null
    || quantity === undefined || unit === undefined || unitPrice === undefined || totalPrice === undefined
    || tax === undefined || transport === undefined || minimumOrder === undefined || leadTime === undefined
    || validity === undefined || paymentTerms === undefined || notes === undefined) return null;
  if (line.status === "not-mentioned"
    && [quantity, unit, unitPrice, totalPrice, tax, transport, minimumOrder, leadTime, validity, paymentTerms].some((item) => item !== null)) return null;
  return {
    id: line.id as string,
    requestItemId: line.requestItemId as string | null,
    serviceSpecId: line.serviceSpecId as string | null,
    requestLabel,
    status: line.status as BuilderRecordedProposalLineStatus,
    quantity,
    unit,
    unitPrice,
    totalPrice,
    tax,
    transport,
    minimumOrder,
    leadTime,
    validity,
    paymentTerms,
    notes,
  };
}

function normalizeBuilderProposalCommand(value: unknown): NormalizedBuilderProposalCommand | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  if (source.action !== "create-proposal" && source.action !== "update-proposal") return null;
  const commandKeys = source.action === "create-proposal"
    ? ["inputSchemaVersion", "action", "projectId", "proposalId", "draft", "pins", "expectedStoreVersion", "idempotencyKey"]
    : ["inputSchemaVersion", "action", "projectId", "proposalId", "draft", "pins", "expectedStoreVersion", "expectedProposalVersion", "idempotencyKey"];
  if (!hasExactKeys(source, commandKeys)
    || source.inputSchemaVersion !== 1
    || !exactString(source.projectId, 200)
    || !exactString(source.proposalId, 240)
    || !exactInteger(source.expectedStoreVersion)
    || !exactString(source.idempotencyKey, 300)
    || source.action === "update-proposal" && !exactInteger(source.expectedProposalVersion)) return null;
  if (!commandPinsAreValid(source.pins)) return null;
  const sourcePins = source.pins;
  if (!hasExactKeys(source.draft, commandDraftKeys)) return null;
  const sourceDraft = source.draft as Record<string, unknown>;
  if (!exactString(sourceDraft.requestId, 200)
    || !exactString(sourceDraft.supplierContactId, 200)
    || !(sourceDraft.projectFileId === "" || exactString(sourceDraft.projectFileId, 240))
    || (sourceDraft.projectFileId === "") !== (sourcePins.fileMetadataFingerprint === null)
    || !Array.isArray(sourceDraft.lines)
    || sourceDraft.lines.length < 1
    || sourceDraft.lines.length > 100
    || !isExactDenseArray(sourceDraft.lines)) return null;
  const declaredAt = normalizeContentText(sourceDraft.declaredAt, 80);
  const transcript = normalizeContentText(sourceDraft.transcript, 2000);
  const notes = normalizeContentText(sourceDraft.notes, 1000);
  if (declaredAt === undefined || transcript === undefined || notes === undefined) return null;
  const lines = sourceDraft.lines.map(normalizeCommandLine);
  if (lines.some((line) => line === null)) return null;
  const normalizedLines = lines as NormalizedBuilderProposalLineDraft[];
  if (new Set(normalizedLines.map((line) => line.id)).size !== normalizedLines.length) return null;
  const draft: NormalizedBuilderProposalDraft = {
    requestId: sourceDraft.requestId as string,
    supplierContactId: sourceDraft.supplierContactId as string,
    projectFileId: sourceDraft.projectFileId as string,
    declaredAt,
    transcript,
    notes,
    lines: normalizedLines,
  };
  const pins: BuilderProposalCommandPins = {
    requestDependencyFingerprint: sourcePins.requestDependencyFingerprint as Sha256Fingerprint,
    contentApprovalFingerprint: sourcePins.contentApprovalFingerprint as Sha256Fingerprint,
    supplierContactRevisionFingerprint: sourcePins.supplierContactRevisionFingerprint as Sha256Fingerprint,
    fileMetadataFingerprint: sourcePins.fileMetadataFingerprint as Sha256Fingerprint | null,
    expectedDependencySnapshotHash: sourcePins.expectedDependencySnapshotHash as Sha256Fingerprint,
  };
  const common = {
    inputSchemaVersion: 1 as const,
    projectId: source.projectId as string,
    proposalId: source.proposalId as string,
    draft,
    pins,
    expectedStoreVersion: source.expectedStoreVersion as number,
    idempotencyKey: source.idempotencyKey as string,
  };
  return source.action === "create-proposal"
    ? { ...common, action: "create-proposal" }
    : { ...common, action: "update-proposal", expectedProposalVersion: source.expectedProposalVersion as number };
}

/**
 * Returns the SHA-256 fingerprint of the exact domain-normalized draft used to
 * decide whether an editor retry may reuse its stable attempt identity.
 * `null` means the draft is not command-producible and must fail closed.
 */
export function builderProposalNormalizedDraftHash(value: unknown): Sha256Fingerprint | null {
  const projectFileId = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>).projectFileId
    : null;
  const placeholderHash = `sha256-${"0".repeat(64)}` as Sha256Fingerprint;
  const normalized = normalizeBuilderProposalCommand({
    inputSchemaVersion: 1,
    action: "create-proposal",
    projectId: "builder-proposal-attempt-project",
    proposalId: "builder-proposal-attempt-record",
    draft: value,
    pins: {
      requestDependencyFingerprint: placeholderHash,
      contentApprovalFingerprint: placeholderHash,
      supplierContactRevisionFingerprint: placeholderHash,
      fileMetadataFingerprint: typeof projectFileId === "string" && projectFileId !== "" ? placeholderHash : null,
      expectedDependencySnapshotHash: placeholderHash,
    },
    expectedStoreVersion: 1,
    idempotencyKey: "builder-proposal-attempt",
  });
  return normalized ? builderProposalHash(normalized.draft) as Sha256Fingerprint : null;
}

function commandPayload(
  command: NormalizedBuilderProposalCommand,
  target: BuilderProposalTargetPin,
  contact: BuilderProposalContactPin,
  identityBindingHash: Sha256Fingerprint,
  authorizationContextHash: Sha256Fingerprint,
): BuilderProposalCommandPayload {
  return {
    inputSchemaVersion: 1,
    action: command.action,
    target: {
      projectId: command.projectId,
      proposalId: command.proposalId,
      request: structuredClone(target),
      contact: structuredClone(contact),
    },
    draft: structuredClone(command.draft),
    pins: structuredClone(command.pins),
    expectedStoreVersion: command.expectedStoreVersion,
    expectedProposalVersion: command.action === "update-proposal" ? command.expectedProposalVersion : null,
    identityBindingHash,
    authorizationContextHash,
  };
}

function revisionAsNormalizedDraft(revision: BuilderRecordedProposalRevision): NormalizedBuilderProposalDraft {
  return {
    requestId: revision.target.requestId,
    supplierContactId: revision.contactPin.supplierContactId,
    projectFileId: revision.reference.kind === "unattached" ? "" : revision.reference.projectFileId,
    declaredAt: revision.declaredAt,
    transcript: revision.transcript,
    notes: revision.notes,
    lines: revision.lines.map(({ currency: _currency, ...line }) => structuredClone(line)),
  };
}

function reconstructReceiptPayload(
  receipt: BuilderProposalCommandReceipt,
  revision: BuilderRecordedProposalRevision,
  authority: ProcurementDispatchAuthority,
): BuilderProposalCommandPayload | null {
  const authorizationContextHash = authority.authorizationHashes[receipt.projectId];
  if (!exactSha256(authorizationContextHash)) return null;
  return {
    inputSchemaVersion: 1,
    action: receipt.action,
    target: {
      projectId: receipt.projectId,
      proposalId: receipt.recordId,
      request: structuredClone(revision.target),
      contact: structuredClone(revision.contactPin),
    },
    draft: revisionAsNormalizedDraft(revision),
    pins: structuredClone(receipt.commandPins),
    expectedStoreVersion: receipt.expectedStoreVersion,
    expectedProposalVersion: receipt.expectedRecordVersion,
    identityBindingHash: authority.identityBindingHash as Sha256Fingerprint,
    authorizationContextHash,
  };
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

function compareIds(first: string, second: string) {
  return first < second ? -1 : first > second ? 1 : 0;
}

function finalWithFingerprint<T extends object>(payload: T): T & { fingerprint: Sha256Fingerprint } {
  return { ...payload, fingerprint: builderProposalHash(payload) } as T & { fingerprint: Sha256Fingerprint };
}

export function finalizeBuilderProposalRevision(value: Omit<BuilderRecordedProposalRevision, "fingerprint">): BuilderRecordedProposalRevision {
  return finalWithFingerprint(value);
}

export function finalizeBuilderProposalRecord(value: Omit<BuilderRecordedProposalRecord, "fingerprint">): BuilderRecordedProposalRecord {
  return finalWithFingerprint(value);
}

export function finalizeBuilderProposalEnvelope(value: Omit<BuilderProposalEnvelope, "fingerprint">): BuilderProposalEnvelope {
  return finalWithFingerprint(value);
}

function finalizeEvent(value: Omit<BuilderRecordedProposalEvent, "fingerprint">): BuilderRecordedProposalEvent {
  return finalWithFingerprint(value);
}

function finalizeLegacyEvidence(value: Omit<BuilderProposalLegacyEvidence, "fingerprint">): BuilderProposalLegacyEvidence {
  return finalWithFingerprint(value);
}

function finalizeMigrationReport(value: Omit<BuilderProposalMigrationReport, "fingerprint">): BuilderProposalMigrationReport {
  return finalWithFingerprint(value);
}

function finalizeMarker<T extends Omit<BuilderProposalCutoverMarker, "fingerprint">>(value: T): T & { fingerprint: Sha256Fingerprint } {
  return finalWithFingerprint(value);
}

function authorityIsValid(authority: unknown): authority is ProcurementDispatchAuthority {
  if (!hasExactKeys(authority, ["identityBindingHash", "snapshotHash", "projectIds", "authorizationHashes"])) return false;
  const value = authority as ProcurementDispatchAuthority;
  if (!exactSha256(value.identityBindingHash) || !exactSha256(value.snapshotHash) || !Array.isArray(value.projectIds) || !hasExactKeys(value.authorizationHashes, value.projectIds)) return false;
  const ids = new Set<string>();
  for (let index = 0; index < value.projectIds.length; index += 1) {
    const id = value.projectIds[index];
    if (!exactString(id, 200) || ids.has(id) || index > 0 && compareIds(value.projectIds[index - 1], id) >= 0 || !exactSha256(value.authorizationHashes[id])) return false;
    ids.add(id);
  }
  return true;
}

function sourceHistoryIsValid(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return false;
  return value.every((event, index) => hasExactKeys(event, ["id", "type", "actor", "at", "version"])
    && exactString(event.id, 300)
    && ["created", "updated"].includes(event.type)
    && ["شما", "مهاجرت محلی"].includes(event.actor)
    && exactDate(event.at)
    && event.version === index + 1
    && (index === 0 || Date.parse(event.at) >= Date.parse(value[index - 1].at)));
}

function sourceProductItemIsValid(value: unknown) {
  if (!hasExactKeys(value, ["id", "name", "quantity", "unit", "brandOrGrade", "specification", "alternatives", "source", "confidence", "completionStatus", "version", "createdAt", "updatedAt", "history"])) return false;
  const item = value as Record<string, unknown>;
  return exactString(item.id, 240)
    && optionalVisibleString(item.name, 300)
    && optionalVisibleString(item.quantity, 160)
    && (item.unit === null || purchaseRequestUnits.includes(item.unit as PurchaseRequestUnit))
    && optionalVisibleString(item.brandOrGrade, 300)
    && optionalVisibleString(item.specification, 1000)
    && ["unknown", "allowed", "not-allowed", "approval-required"].includes(item.alternatives as string)
    && ["ثبت مستقیم شما", "مهاجرت محلی"].includes(item.source as string)
    && item.confidence === null
    && ["complete", "incomplete"].includes(item.completionStatus as string)
    && exactInteger(item.version)
    && exactDate(item.createdAt)
    && exactDate(item.updatedAt)
    && Date.parse(item.updatedAt) >= Date.parse(item.createdAt as string)
    && sourceHistoryIsValid(item.history);
}

function sourceServiceIsValid(value: unknown) {
  if (!hasExactKeys(value, ["id", "scope", "location", "locationPrecision", "sizeOrVolume", "qualification", "timing", "method", "inScope", "outOfScope", "warranty", "paymentTerms", "source", "confidence", "completionStatus", "version", "createdAt", "updatedAt", "history"])) return false;
  const service = value as Record<string, unknown>;
  return exactString(service.id, 240)
    && [service.scope, service.location, service.sizeOrVolume, service.qualification, service.timing, service.method, service.inScope, service.outOfScope, service.warranty, service.paymentTerms].every((item) => optionalVisibleString(item, 1000))
    && service.locationPrecision === "area-or-project-section"
    && ["ثبت مستقیم شما", "مهاجرت محلی"].includes(service.source as string)
    && service.confidence === null
    && ["complete", "incomplete"].includes(service.completionStatus as string)
    && exactInteger(service.version)
    && exactDate(service.createdAt)
    && exactDate(service.updatedAt)
    && Date.parse(service.updatedAt) >= Date.parse(service.createdAt as string)
    && sourceHistoryIsValid(service.history);
}

function clarificationAnswerIsValid(value: unknown) {
  if (!hasExactKeys(value, ["id", "fieldPath", "question", "answer", "status", "source", "confidence", "completionStatus", "version", "createdAt", "updatedAt", "history"])) return false;
  const answer = value as Record<string, unknown>;
  return exactString(answer.id, 240)
    && exactString(answer.fieldPath, 400)
    && visibleString(answer.question, 1000)
    && optionalVisibleString(answer.answer, 2000)
    && ["answered", "explicitly-unknown", "needs-confirmation"].includes(answer.status as string)
    && ["ثبت مستقیم شما", "مهاجرت محلی"].includes(answer.source as string)
    && answer.confidence === null
    && ["complete", "incomplete"].includes(answer.completionStatus as string)
    && exactInteger(answer.version)
    && exactDate(answer.createdAt)
    && exactDate(answer.updatedAt)
    && sourceHistoryIsValid(answer.history);
}

function requestSourceSnapshotIsValid(value: unknown) {
  if (!hasExactKeys(value, ["requestKind", "rawNeed", "items", "item", "service", "delivery", "unresolvedTerms", "clarificationAnswers", "sharingStatus"])) return false;
  const snapshot = value as Record<string, unknown>;
  if (!["product", "service"].includes(snapshot.requestKind as string)
    || !visibleString(snapshot.rawNeed, 4000)
    || !Array.isArray(snapshot.items)
    || snapshot.items.length > 100
    || !snapshot.items.every(sourceProductItemIsValid)
    || snapshot.item !== null && !sourceProductItemIsValid(snapshot.item)
    || snapshot.service !== null && !sourceServiceIsValid(snapshot.service)
    || !hasExactKeys(snapshot.delivery, ["city", "area", "exactAddressShared", "neededBy"])
    || (snapshot.delivery as Record<string, unknown>).city !== "تهران"
    || !visibleString((snapshot.delivery as Record<string, unknown>).area, 300)
    || (snapshot.delivery as Record<string, unknown>).exactAddressShared !== false
    || !optionalVisibleString((snapshot.delivery as Record<string, unknown>).neededBy, 160)
    || !hasExactKeys(snapshot.unresolvedTerms, ["transport", "tax", "paymentTerms"])
    || !["transport", "tax", "paymentTerms"].every((key) => typeof (snapshot.unresolvedTerms as Record<string, unknown>)[key] === "string")
    || !Array.isArray(snapshot.clarificationAnswers)
    || !snapshot.clarificationAnswers.every(clarificationAnswerIsValid)
    || snapshot.sharingStatus !== "ارسال نشده") return false;
  const itemIds = new Set((snapshot.items as Array<Record<string, unknown>>).map((item) => item.id as string));
  if (itemIds.size !== snapshot.items.length) return false;
  return snapshot.requestKind === "product"
    ? snapshot.items.length > 0 && snapshot.service === null && (snapshot.item === null || itemIds.has((snapshot.item as Record<string, unknown>).id as string))
    : snapshot.items.length === 0 && snapshot.item === null && snapshot.service !== null;
}

function buildRequestSnapshot(source: unknown): BuilderRecordedProposalRequestSnapshot | null {
  if (!requestSourceSnapshotIsValid(source)) return null;
  const snapshot = source as {
    requestKind: PurchaseRequestKind;
    rawNeed: string;
    items: Array<{ id: string; name: string | null; quantity: string | null; unit: PurchaseRequestUnit | null }>;
    service: null | { id: string; scope: string | null; location: string | null };
  };
  const firstName = snapshot.items[0]?.name;
  const title = snapshot.requestKind === "service"
    ? snapshot.service?.scope ?? snapshot.rawNeed
    : snapshot.items.length > 1 && firstName ? `${firstName} + ${snapshot.items.length - 1} قلم` : firstName ?? snapshot.rawNeed;
  return {
    requestKind: snapshot.requestKind,
    title,
    items: snapshot.items.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, unit: item.unit })),
    service: snapshot.service ? { id: snapshot.service.id, scope: snapshot.service.scope, location: snapshot.service.location } : null,
  };
}

function dependencyFingerprint<T extends object>(value: T) {
  return builderProposalHash(value);
}

function finalizedDependencyIsValid(value: unknown, inputKeys: readonly string[]) {
  return hasExactKeys(value, [...inputKeys, "fingerprint"])
    && exactSha256((value as { fingerprint?: unknown }).fingerprint)
    && (value as { fingerprint: string }).fingerprint === dependencyFingerprint(withoutFingerprint(value as { fingerprint: string }));
}

const requestDependencyKeys = ["projectId", "requestId", "requestVersion", "revisionId", "revisionFingerprint", "revisionCreatedAt", "requestKind", "isCurrentReadyForReview", "snapshot", "shareableFields"] as const;
const approvalDependencyKeys = ["projectId", "approvalId", "approvalVersion", "approvalRevisionId", "approvalFingerprint", "requestId", "requestVersion", "requestRevisionId", "requestRevisionFingerprint", "status", "isCurrent", "updatedAt"] as const;
const contactDependencyKeys = ["projectId", "supplierContactId", "supplierContactVersion", "supplierContactRevisionId", "supplierContactRevisionFingerprint", "revisionCreatedAt", "displayName", "category", "tehranCoverage", "responseCapability", "status", "archivedAt", "isCurrent"] as const;
const fileDependencyKeys = ["id", "projectId", "displayName", "originalName", "mimeType", "size", "category", "source", "status", "version", "projectStage", "visibility", "storageMode", "sourceModifiedAt", "createdAt"] as const;

function requestDependencyIdentity(item: Pick<BuilderProposalRequestDependencyInput, "projectId" | "requestId" | "requestVersion" | "revisionId">) {
  return `${item.projectId}:${item.requestId}:${String(item.requestVersion).padStart(12, "0")}:${item.revisionId}`;
}

function approvalDependencyIdentity(item: Pick<BuilderProposalApprovalDependencyInput, "projectId" | "approvalId" | "approvalVersion" | "approvalRevisionId">) {
  return `${item.projectId}:${item.approvalId}:${String(item.approvalVersion).padStart(12, "0")}:${item.approvalRevisionId}`;
}

function contactDependencyIdentity(item: Pick<BuilderProposalContactDependencyInput, "projectId" | "supplierContactId" | "supplierContactVersion" | "supplierContactRevisionId">) {
  return `${item.projectId}:${item.supplierContactId}:${String(item.supplierContactVersion).padStart(12, "0")}:${item.supplierContactRevisionId}`;
}

function fileDependencyIdentity(item: Pick<BuilderProposalFileDependencyInput, "projectId" | "id">) {
  return `${item.projectId}:${item.id}`;
}

function requestDependencyInputIsValid(value: unknown, authority: ProcurementDispatchAuthority) {
  if (!hasExactKeys(value, requestDependencyKeys)) return false;
  const request = value as BuilderProposalRequestDependencyInput;
  if (!exactString(request.projectId, 200) || !authority.projectIds.includes(request.projectId) || !exactString(request.requestId, 200) || !exactInteger(request.requestVersion) || !exactString(request.revisionId, 300) || !exactFnv1a(request.revisionFingerprint) || !exactDate(request.revisionCreatedAt) || !["product", "service"].includes(request.requestKind) || typeof request.isCurrentReadyForReview !== "boolean" || !requestSourceSnapshotIsValid(request.snapshot) || !Array.isArray(request.shareableFields) || request.shareableFields.length > 200) return false;
  if (request.requestKind !== (request.snapshot as { requestKind: unknown }).requestKind || new Set(request.shareableFields).size !== request.shareableFields.length || request.shareableFields.some((field) => !exactString(field, 300))) return false;
  return request.revisionFingerprint === legacyFnvHash({ snapshot: request.snapshot, shareableFields: request.shareableFields });
}

function approvalDependencyInputIsValid(value: unknown, authority: ProcurementDispatchAuthority) {
  if (!hasExactKeys(value, approvalDependencyKeys)) return false;
  const approval = value as BuilderProposalApprovalDependencyInput;
  return exactString(approval.projectId, 200)
    && authority.projectIds.includes(approval.projectId)
    && exactString(approval.approvalId, 200)
    && exactInteger(approval.approvalVersion)
    && exactString(approval.approvalRevisionId, 300)
    && exactSha256(approval.approvalFingerprint)
    && exactString(approval.requestId, 200)
    && exactInteger(approval.requestVersion)
    && exactString(approval.requestRevisionId, 300)
    && exactFnv1a(approval.requestRevisionFingerprint)
    && ["pending", "approved", "changes-requested"].includes(approval.status)
    && typeof approval.isCurrent === "boolean"
    && exactDate(approval.updatedAt);
}

function contactDependencyInputIsValid(value: unknown, authority: ProcurementDispatchAuthority) {
  if (!hasExactKeys(value, contactDependencyKeys)) return false;
  const contact = value as BuilderProposalContactDependencyInput;
  return exactString(contact.projectId, 200)
    && authority.projectIds.includes(contact.projectId)
    && exactString(contact.supplierContactId, 200)
    && exactInteger(contact.supplierContactVersion)
    && exactString(contact.supplierContactRevisionId, 300)
    && exactSha256(contact.supplierContactRevisionFingerprint)
    && exactDate(contact.revisionCreatedAt)
    && visibleString(contact.displayName, 120)
    && visibleString(contact.category, 120)
    && visibleString(contact.tehranCoverage, 160)
    && ["product", "service", "both"].includes(contact.responseCapability)
    && ["active", "archived"].includes(contact.status)
    && (contact.archivedAt === null || exactDate(contact.archivedAt))
    && (contact.status === "active" ? contact.archivedAt === null : contact.archivedAt !== null)
    && typeof contact.isCurrent === "boolean";
}

function fileDependencyInputIsValid(value: unknown, authority: ProcurementDispatchAuthority) {
  if (!hasExactKeys(value, fileDependencyKeys)) return false;
  const file = value as BuilderProposalFileDependencyInput;
  return exactString(file.id, 240)
    && exactString(file.projectId, 200)
    && authority.projectIds.includes(file.projectId)
    && visibleString(file.displayName, 140)
    && exactString(file.originalName, 300)
    && exactString(file.mimeType, 200)
    && Number.isSafeInteger(file.size) && file.size >= 0
    && fileCategories.includes(file.category)
    && ["انتخاب مستقیم از دستگاه", "دوربین دستگاه"].includes(file.source)
    && file.status === "ثبت محلی"
    && file.version === 1
    && exactString(file.projectStage, 160)
    && file.visibility === "خصوصی پروژه"
    && ["metadata-only", "browser-image", "browser-file"].includes(file.storageMode)
    && (file.sourceModifiedAt === null || exactDate(file.sourceModifiedAt))
    && exactDate(file.createdAt);
}

function dependenciesAreValid(value: unknown): value is BuilderProposalDependencies {
  if (!hasExactKeys(value, ["schemaVersion", "authority", "requestRevisions", "contentApprovals", "contacts", "files", "snapshotHash"])) return false;
  const dependencies = value as BuilderProposalDependencies;
  if (dependencies.schemaVersion !== 1 || !authorityIsValid(dependencies.authority) || !Array.isArray(dependencies.requestRevisions) || !Array.isArray(dependencies.contentApprovals) || !Array.isArray(dependencies.contacts) || !Array.isArray(dependencies.files) || !exactSha256(dependencies.snapshotHash)) return false;
  const collections: Array<[unknown[], readonly string[], (item: unknown, authority: ProcurementDispatchAuthority) => boolean, (item: any) => string]> = [
    [dependencies.requestRevisions, requestDependencyKeys, requestDependencyInputIsValid, requestDependencyIdentity],
    [dependencies.contentApprovals, approvalDependencyKeys, approvalDependencyInputIsValid, approvalDependencyIdentity],
    [dependencies.contacts, contactDependencyKeys, contactDependencyInputIsValid, contactDependencyIdentity],
    [dependencies.files, fileDependencyKeys, fileDependencyInputIsValid, fileDependencyIdentity],
  ];
  for (const [items, keys, validator, keyFor] of collections) {
    const seen = new Set<string>();
    let previous = "";
    for (const item of items) {
      const payload = withoutFingerprint(item as { fingerprint: string });
      const key = keyFor(item);
      if (!finalizedDependencyIsValid(item, keys) || !validator(payload, dependencies.authority) || seen.has(key) || previous && compareIds(previous, key) >= 0) return false;
      seen.add(key);
      previous = key;
    }
  }
  for (const approval of dependencies.contentApprovals) {
    if (!dependencies.requestRevisions.some((request) => request.projectId === approval.projectId && request.requestId === approval.requestId && request.requestVersion === approval.requestVersion && request.revisionId === approval.requestRevisionId && request.revisionFingerprint === approval.requestRevisionFingerprint)) return false;
  }
  const payload = { schemaVersion: dependencies.schemaVersion, authority: dependencies.authority, requestRevisions: dependencies.requestRevisions, contentApprovals: dependencies.contentApprovals, contacts: dependencies.contacts, files: dependencies.files };
  return dependencies.snapshotHash === builderProposalHash(payload);
}

export function createBuilderProposalDependencies(input: BuilderProposalDependencyInput): BuilderProposalDependencies {
  if (!hasExactKeys(input, ["authority", "requestRevisions", "contentApprovals", "contacts", "files"]) || !authorityIsValid(input.authority) || !Array.isArray(input.requestRevisions) || !Array.isArray(input.contentApprovals) || !Array.isArray(input.contacts) || !Array.isArray(input.files)) throw new TypeError("builder-proposal-dependencies-invalid");
  const requestRevisions = input.requestRevisions.map((item) => {
    if (!requestDependencyInputIsValid(item, input.authority)) throw new TypeError("builder-proposal-request-dependency-invalid");
    return finalWithFingerprint(structuredClone(item));
  }).sort((first, second) => compareIds(requestDependencyIdentity(first), requestDependencyIdentity(second)));
  const contentApprovals = input.contentApprovals.map((item) => {
    if (!approvalDependencyInputIsValid(item, input.authority)) throw new TypeError("builder-proposal-approval-dependency-invalid");
    return finalWithFingerprint(structuredClone(item));
  }).sort((first, second) => compareIds(approvalDependencyIdentity(first), approvalDependencyIdentity(second)));
  const contacts = input.contacts.map((item) => {
    if (!contactDependencyInputIsValid(item, input.authority)) throw new TypeError("builder-proposal-contact-dependency-invalid");
    return finalWithFingerprint(structuredClone(item));
  }).sort((first, second) => compareIds(contactDependencyIdentity(first), contactDependencyIdentity(second)));
  const files = input.files.map((item) => {
    if (!fileDependencyInputIsValid(item, input.authority)) throw new TypeError("builder-proposal-file-dependency-invalid");
    return finalWithFingerprint(structuredClone(item));
  }).sort((first, second) => compareIds(fileDependencyIdentity(first), fileDependencyIdentity(second)));
  const unique = <T>(items: T[], keyFor: (item: T) => string) => new Set(items.map(keyFor)).size === items.length;
  if (!unique(requestRevisions, requestDependencyIdentity)
    || !unique(contentApprovals, approvalDependencyIdentity)
    || !unique(contacts, contactDependencyIdentity)
    || !unique(files, fileDependencyIdentity)) throw new TypeError("builder-proposal-dependency-duplicate");
  for (const approval of contentApprovals) {
    if (!requestRevisions.some((request) => request.projectId === approval.projectId && request.requestId === approval.requestId && request.requestVersion === approval.requestVersion && request.revisionId === approval.requestRevisionId && request.revisionFingerprint === approval.requestRevisionFingerprint)) throw new TypeError("builder-proposal-approval-request-mismatch");
  }
  const payload = { schemaVersion: 1 as const, authority: structuredClone(input.authority), requestRevisions, contentApprovals, contacts, files };
  return { ...payload, snapshotHash: builderProposalHash(payload) as Sha256Fingerprint };
}

function canonicalNumber(value: unknown): value is string | null {
  if (value === null) return true;
  if (typeof value !== "string" || !/^(?:0|[1-9]\d*)(?:\.\d*[1-9])?$/.test(value)) return false;
  return value.length <= canonicalNumericLengthLimit;
}

function requestSnapshotIsValid(value: unknown): value is BuilderRecordedProposalRequestSnapshot {
  if (!hasExactKeys(value, ["requestKind", "title", "items", "service"])) return false;
  const snapshot = value as BuilderRecordedProposalRequestSnapshot;
  if (!["product", "service"].includes(snapshot.requestKind) || !visibleString(snapshot.title, 4000) || !Array.isArray(snapshot.items) || snapshot.items.length > 100) return false;
  const ids = new Set<string>();
  for (const item of snapshot.items) {
    if (!hasExactKeys(item, ["id", "name", "quantity", "unit"])
      || !exactString(item.id, 240)
      || ids.has(item.id)
      || !optionalVisibleString(item.name, 300)
      || !optionalVisibleString(item.quantity, 160)
      || item.unit !== null && !purchaseRequestUnits.includes(item.unit)) return false;
    ids.add(item.id);
  }
  if (snapshot.requestKind === "product") return snapshot.items.length > 0 && snapshot.service === null;
  return snapshot.items.length === 0
    && hasExactKeys(snapshot.service, ["id", "scope", "location"])
    && exactString(snapshot.service!.id, 240)
    && optionalVisibleString(snapshot.service!.scope, 1000)
    && optionalVisibleString(snapshot.service!.location, 1000);
}

function supplierSnapshotIsValid(value: unknown): value is BuilderRecordedProposalSupplierSnapshot {
  if (!hasExactKeys(value, ["supplierContactId", "supplierContactVersion", "displayName", "category", "tehranCoverage", "responseCapability", "networkStatus"])) return false;
  const snapshot = value as BuilderRecordedProposalSupplierSnapshot;
  return exactString(snapshot.supplierContactId, 200)
    && exactInteger(snapshot.supplierContactVersion)
    && visibleString(snapshot.displayName, 120)
    && visibleString(snapshot.category, 120)
    && visibleString(snapshot.tehranCoverage, 160)
    && ["product", "service", "both"].includes(snapshot.responseCapability)
    && snapshot.networkStatus === "خارج از شبکه چیدا";
}

function contactPinIsValid(value: unknown): value is BuilderProposalContactPin {
  if (!hasExactKeys(value, ["supplierContactId", "supplierContactVersion", "supplierContactRevisionId", "supplierContactRevisionFingerprint"])) return false;
  const pin = value as BuilderProposalContactPin;
  return exactString(pin.supplierContactId, 200)
    && exactInteger(pin.supplierContactVersion)
    && exactString(pin.supplierContactRevisionId, 300)
    && exactSha256(pin.supplierContactRevisionFingerprint);
}

function targetPinIsValid(value: unknown): value is BuilderProposalTargetPin {
  if (!hasExactKeys(value, ["requestId", "requestVersion", "reviewRevisionId", "reviewRevisionFingerprint", "requestDependencyFingerprint", "contentApprovalId", "contentApprovalVersion", "contentApprovalRevisionId", "contentApprovalFingerprint", "requestKind"])) return false;
  const target = value as BuilderProposalTargetPin;
  return exactString(target.requestId, 200)
    && exactInteger(target.requestVersion)
    && exactString(target.reviewRevisionId, 300)
    && exactFnv1a(target.reviewRevisionFingerprint)
    && exactSha256(target.requestDependencyFingerprint)
    && exactString(target.contentApprovalId, 200)
    && exactInteger(target.contentApprovalVersion)
    && exactString(target.contentApprovalRevisionId, 300)
    && exactSha256(target.contentApprovalFingerprint)
    && ["product", "service"].includes(target.requestKind);
}

function fileSnapshotIsValid(value: unknown): value is BuilderProposalFileSnapshot {
  if (!hasExactKeys(value, ["id", "displayName", "originalName", "mimeType", "size", "category", "createdAt", "storageMode"])) return false;
  const snapshot = value as BuilderProposalFileSnapshot;
  return exactString(snapshot.id, 240)
    && visibleString(snapshot.displayName, 140)
    && exactString(snapshot.originalName, 300)
    && exactString(snapshot.mimeType, 200)
    && Number.isSafeInteger(snapshot.size) && snapshot.size >= 0
    && fileCategories.includes(snapshot.category)
    && exactDate(snapshot.createdAt)
    && snapshot.storageMode === "metadata-only";
}

function referenceIsValid(value: unknown): value is BuilderRecordedProposalReference {
  if (!hasExactKeys(value, ["kind", "projectFileId", "projectFileVersion", "fileSnapshot", "metadataFingerprint", "contentPersisted", "extractionPerformed"])) return false;
  const reference = value as BuilderRecordedProposalReference;
  if (reference.contentPersisted !== false || reference.extractionPerformed !== false) return false;
  if (reference.kind === "unattached") return reference.projectFileId === null && reference.projectFileVersion === null && reference.fileSnapshot === null && reference.metadataFingerprint === null;
  return reference.kind === "project-file-metadata"
    && exactString(reference.projectFileId, 240)
    && reference.projectFileVersion === 1
    && fileSnapshotIsValid(reference.fileSnapshot)
    && !fileLooksLikeImage(reference.fileSnapshot)
    && reference.projectFileId === reference.fileSnapshot.id
    && exactSha256(reference.metadataFingerprint)
    && reference.metadataFingerprint === builderProposalHash(reference.fileSnapshot);
}

function expectedProposalLines(snapshot: BuilderRecordedProposalRequestSnapshot) {
  return snapshot.requestKind === "product"
    ? snapshot.items.map((item, index) => ({ requestItemId: item.id, serviceSpecId: null, requestLabel: item.name ?? `قلم ${index + 1}` }))
    : [{ requestItemId: null, serviceSpecId: snapshot.service!.id, requestLabel: snapshot.service!.scope ?? "خدمت درخواستی" }];
}

function lineIsValid(value: unknown, expected: { requestItemId: string | null; serviceSpecId: string | null; requestLabel: string }): value is BuilderRecordedProposalLine {
  if (!hasExactKeys(value, ["id", "requestItemId", "serviceSpecId", "requestLabel", "status", "quantity", "unit", "unitPrice", "totalPrice", "currency", "tax", "transport", "minimumOrder", "leadTime", "validity", "paymentTerms", "notes"])) return false;
  const line = value as BuilderRecordedProposalLine;
  if (!exactString(line.id, 300)
    || line.requestItemId !== expected.requestItemId
    || line.serviceSpecId !== expected.serviceSpecId
    || line.requestLabel !== expected.requestLabel
    || !proposalLineStatuses.includes(line.status)
    || !canonicalNumber(line.quantity)
    || !optionalVisibleString(line.unit, 80)
    || !canonicalNumber(line.unitPrice)
    || !canonicalNumber(line.totalPrice)
    || line.currency !== "تومان"
    || !optionalVisibleString(line.tax, 160)
    || !optionalVisibleString(line.transport, 160)
    || !optionalVisibleString(line.minimumOrder, 160)
    || !optionalVisibleString(line.leadTime, 160)
    || !optionalVisibleString(line.validity, 160)
    || !optionalVisibleString(line.paymentTerms, 240)
    || !optionalVisibleString(line.notes, 500)) return false;
  return line.status !== "not-mentioned" || [line.quantity, line.unit, line.unitPrice, line.totalPrice, line.tax, line.transport, line.minimumOrder, line.leadTime, line.validity, line.paymentTerms].every((item) => item === null);
}

function meaningfulRevision(reference: BuilderRecordedProposalReference, revision: Pick<BuilderRecordedProposalRevision, "declaredAt" | "transcript" | "notes" | "lines">) {
  return reference.kind === "project-file-metadata"
    || revision.declaredAt !== null
    || revision.transcript !== null
    || revision.notes !== null
    || revision.lines.some((line) => line.status !== "not-mentioned" || [line.quantity, line.unit, line.unitPrice, line.totalPrice, line.tax, line.transport, line.minimumOrder, line.leadTime, line.validity, line.paymentTerms, line.notes].some((item) => item !== null));
}

const revisionKeys = ["id", "version", "createdAt", "target", "requestSnapshot", "supplierSnapshot", "contactPin", "reference", "declaredAt", "transcript", "notes", "lines", "fingerprint"] as const;

function revisionIsValid(value: unknown): value is BuilderRecordedProposalRevision {
  if (!hasExactKeys(value, revisionKeys)) return false;
  const revision = value as BuilderRecordedProposalRevision;
  if (!exactString(revision.id, 300)
    || !exactInteger(revision.version)
    || !exactDate(revision.createdAt)
    || !targetPinIsValid(revision.target)
    || !requestSnapshotIsValid(revision.requestSnapshot)
    || revision.requestSnapshot.requestKind !== revision.target.requestKind
    || !supplierSnapshotIsValid(revision.supplierSnapshot)
    || !contactPinIsValid(revision.contactPin)
    || revision.contactPin.supplierContactId !== revision.supplierSnapshot.supplierContactId
    || revision.contactPin.supplierContactVersion !== revision.supplierSnapshot.supplierContactVersion
    || !referenceIsValid(revision.reference)
    || !optionalVisibleString(revision.declaredAt, 80)
    || !optionalVisibleString(revision.transcript, 2000)
    || !optionalVisibleString(revision.notes, 1000)
    || !Array.isArray(revision.lines)
    || !exactSha256(revision.fingerprint)
    || revision.fingerprint !== builderProposalHash(withoutFingerprint(revision))) return false;
  const expectedLines = expectedProposalLines(revision.requestSnapshot);
  if (revision.lines.length !== expectedLines.length || new Set(revision.lines.map((line) => line.id)).size !== revision.lines.length || revision.lines.some((line, index) => !lineIsValid(line, expectedLines[index]))) return false;
  if (revision.reference.kind === "project-file-metadata" && Date.parse(revision.reference.fileSnapshot.createdAt) > Date.parse(revision.createdAt)) return false;
  return meaningfulRevision(revision.reference, revision);
}

const eventKeys = ["schemaVersion", "id", "type", "actor", "actorPrincipalId", "origin", "at", "version", "revisionId", "authorizationContextHash", "dependencySnapshotHash", "idempotencyKey", "commandPayloadHash", "fingerprint"] as const;

function eventIsValid(value: unknown): value is BuilderRecordedProposalEvent {
  if (!hasExactKeys(value, eventKeys)) return false;
  const event = value as BuilderRecordedProposalEvent;
  if (event.schemaVersion !== 1
    || !exactString(event.id, 300)
    || !["created", "updated"].includes(event.type)
    || !["شما", "سامانهٔ مهاجرت"].includes(event.actor)
    || event.actorPrincipalId !== "local-builder-account"
    || !["live-command", "v1-migration"].includes(event.origin)
    || !exactDate(event.at)
    || !exactInteger(event.version)
    || !exactString(event.revisionId, 300)
    || !exactSha256(event.authorizationContextHash)
    || !exactSha256(event.dependencySnapshotHash)
    || !exactSha256(event.fingerprint)
    || event.fingerprint !== builderProposalHash(withoutFingerprint(event))) return false;
  return event.origin === "v1-migration"
    ? event.actor === "سامانهٔ مهاجرت" && event.idempotencyKey === null && event.commandPayloadHash === null
    : event.actor === "شما" && exactString(event.idempotencyKey, 300) && exactSha256(event.commandPayloadHash);
}

function legacyTarget(record: Pick<BuilderRecordedProposalRecord, "target">) {
  return {
    requestId: record.target.requestId,
    requestVersion: record.target.requestVersion,
    reviewRevisionId: record.target.reviewRevisionId,
    reviewRevisionFingerprint: record.target.reviewRevisionFingerprint,
    contentApprovalId: record.target.contentApprovalId,
    requestKind: record.target.requestKind,
  };
}

function legacyReference(reference: BuilderRecordedProposalReference) {
  return reference.kind === "unattached"
    ? { kind: "unattached" as const, projectFileId: null, fileSnapshot: null, contentPersisted: false as const, extractionPerformed: false as const }
    : { kind: "project-file-metadata" as const, projectFileId: reference.projectFileId, fileSnapshot: reference.fileSnapshot, contentPersisted: false as const, extractionPerformed: false as const };
}

function legacyRevisionPayload(revision: BuilderRecordedProposalRevision) {
  return {
    id: revision.id,
    version: revision.version,
    createdAt: revision.createdAt,
    declaredAt: revision.declaredAt,
    transcript: revision.transcript,
    notes: revision.notes,
    lines: revision.lines,
  };
}

function legacyRevisionFingerprint(sourceProjection: Pick<BuilderRecordedProposalRevision, "target" | "requestSnapshot" | "supplierSnapshot" | "reference">, revision: BuilderRecordedProposalRevision): Fnv1aFingerprint {
  return legacyFnvHash({ target: legacyTarget(sourceProjection), requestSnapshot: sourceProjection.requestSnapshot, supplierSnapshot: sourceProjection.supplierSnapshot, reference: legacyReference(sourceProjection.reference), revision: legacyRevisionPayload(revision) });
}

const legacyEvidenceKeys = ["schemaVersion", "sourceGeneration", "sourceIndex", "sourceRecordHash", "sourceRecordVersion", "sourceCreatedAt", "sourceUpdatedAt", "revisionLinks", "fingerprint"] as const;

function legacyEvidenceIsValid(value: unknown, record: BuilderRecordedProposalRecord): value is BuilderProposalLegacyEvidence {
  if (!hasExactKeys(value, legacyEvidenceKeys)) return false;
  const evidence = value as BuilderProposalLegacyEvidence;
  if (evidence.schemaVersion !== 1
    || evidence.sourceGeneration !== "v1-array"
    || !exactInteger(evidence.sourceIndex, 0)
    || !exactSha256(evidence.sourceRecordHash)
    || !exactInteger(evidence.sourceRecordVersion)
    || evidence.sourceRecordVersion > record.version
    || !exactDate(evidence.sourceCreatedAt)
    || !exactDate(evidence.sourceUpdatedAt)
    || !Array.isArray(evidence.revisionLinks)
    || evidence.revisionLinks.length !== evidence.sourceRecordVersion
    || !exactSha256(evidence.fingerprint)
    || evidence.fingerprint !== builderProposalHash(withoutFingerprint(evidence))) return false;
  const sourceProjection = record.revisions[evidence.sourceRecordVersion - 1];
  if (!sourceProjection) return false;
  const linkIds = new Set<string>();
  for (let index = 0; index < evidence.revisionLinks.length; index += 1) {
    const link = evidence.revisionLinks[index];
    const revision = record.revisions[index];
    if (!hasExactKeys(link, ["revisionId", "revisionVersion", "legacyFingerprint", "canonicalFingerprint"])
      || link.revisionId !== revision?.id
      || link.revisionVersion !== index + 1
      || linkIds.has(link.revisionId)
      || !exactFnv1a(link.legacyFingerprint)
      || !stableEqual(revision.reference, sourceProjection.reference)
      || link.legacyFingerprint !== legacyRevisionFingerprint(sourceProjection, revision)
      || !exactSha256(link.canonicalFingerprint)
      || link.canonicalFingerprint !== revision.fingerprint) return false;
    linkIds.add(link.revisionId);
  }
  const legacyHistory = record.history.slice(0, evidence.sourceRecordVersion).map((event) => ({ id: event.id, type: event.type, actor: "شما" as const, at: event.at, version: event.version }));
  const legacyRevisions = record.revisions.slice(0, evidence.sourceRecordVersion).map((revision, index) => ({ ...legacyRevisionPayload(revision), fingerprint: evidence.revisionLinks[index].legacyFingerprint }));
  const sourceRecord = {
    schemaVersion: 1,
    id: record.id,
    projectId: record.projectId,
    source: record.source,
    networkStatus: record.networkStatus,
    supplierAuthenticated: record.supplierAuthenticated,
    receivedThroughChida: record.receivedThroughChida,
    externalEffect: record.externalEffect,
    target: legacyTarget(sourceProjection),
    requestSnapshot: sourceProjection.requestSnapshot,
    supplierSnapshot: sourceProjection.supplierSnapshot,
    reference: legacyReference(sourceProjection.reference),
    currentRevisionId: legacyRevisions.at(-1)?.id,
    visibility: record.visibility,
    localStatus: record.localStatus,
    version: evidence.sourceRecordVersion,
    createdAt: evidence.sourceCreatedAt,
    updatedAt: evidence.sourceUpdatedAt,
    history: legacyHistory,
    revisions: legacyRevisions,
  };
  return evidence.sourceCreatedAt === legacyHistory[0]?.at
    && evidence.sourceUpdatedAt === legacyHistory.at(-1)?.at
    && evidence.sourceRecordHash === builderProposalHash(sourceRecord);
}

const recordKeys = ["schemaVersion", "objectType", "id", "projectId", "ownerPrincipalType", "ownerPrincipalId", "accountSide", "scopeType", "scopeId", "custodianService", "sensitivity", "source", "networkStatus", "supplierAuthenticated", "receivedThroughChida", "externalEffect", "target", "requestSnapshot", "supplierSnapshot", "contactPin", "reference", "declaredAt", "transcript", "notes", "lines", "currentRevisionId", "visibility", "localStatus", "version", "createdAt", "updatedAt", "history", "revisions", "legacyEvidence", "fingerprint"] as const;

function recordIsValid(value: unknown, authority: ProcurementDispatchAuthority): value is BuilderRecordedProposalRecord {
  if (!hasExactKeys(value, recordKeys)) return false;
  const record = value as BuilderRecordedProposalRecord;
  if (record.schemaVersion !== 2
    || record.objectType !== "builder-recorded-proposal"
    || !exactString(record.id, 240)
    || !exactString(record.projectId, 200)
    || !authority.projectIds.includes(record.projectId)
    || record.ownerPrincipalType !== "account"
    || record.ownerPrincipalId !== "local-builder-account"
    || record.accountSide !== "builder"
    || record.scopeType !== "project_private"
    || record.scopeId !== record.projectId
    || record.custodianService !== "Proposal Domain Service"
    || record.sensitivity !== "private"
    || record.source !== "ثبت دستی سازنده"
    || record.networkStatus !== "خارج از شبکه چیدا"
    || record.supplierAuthenticated !== false
    || record.receivedThroughChida !== false
    || record.externalEffect !== "none"
    || !targetPinIsValid(record.target)
    || !requestSnapshotIsValid(record.requestSnapshot)
    || record.requestSnapshot.requestKind !== record.target.requestKind
    || !supplierSnapshotIsValid(record.supplierSnapshot)
    || !contactPinIsValid(record.contactPin)
    || record.contactPin.supplierContactId !== record.supplierSnapshot.supplierContactId
    || record.contactPin.supplierContactVersion !== record.supplierSnapshot.supplierContactVersion
    || !referenceIsValid(record.reference)
    || !optionalVisibleString(record.declaredAt, 80)
    || !optionalVisibleString(record.transcript, 2000)
    || !optionalVisibleString(record.notes, 1000)
    || !Array.isArray(record.lines)
    || !exactString(record.currentRevisionId, 300)
    || record.visibility !== "خصوصی پروژه"
    || record.localStatus !== "ثبت محلی"
    || !exactInteger(record.version)
    || !exactDate(record.createdAt)
    || !exactDate(record.updatedAt)
    || !Array.isArray(record.history)
    || !Array.isArray(record.revisions)
    || record.history.length !== record.version
    || record.revisions.length !== record.version
    || !exactSha256(record.fingerprint)
    || record.fingerprint !== builderProposalHash(withoutFingerprint(record))) return false;
  const eventIds = new Set<string>();
  const revisionIds = new Set<string>();
  for (let index = 0; index < record.version; index += 1) {
    const event = record.history[index];
    const revision = record.revisions[index];
    if (!eventIsValid(event)
      || !revisionIsValid(revision)
      || event.version !== index + 1
      || revision.version !== index + 1
      || event.revisionId !== revision.id
      || event.at !== revision.createdAt
      || event.authorizationContextHash !== authority.authorizationHashes[record.projectId]
      || eventIds.has(event.id)
      || revisionIds.has(revision.id)
      || index === 0 && event.type !== "created"
      || index > 0 && event.type !== "updated"
      || index > 0 && Date.parse(event.at) < Date.parse(record.history[index - 1].at)
      || !stableEqual(revision.target, record.target)
      || !stableEqual(revision.requestSnapshot, record.requestSnapshot)
      || !stableEqual(revision.supplierSnapshot, record.supplierSnapshot)
      || !stableEqual(revision.contactPin, record.contactPin)
      || index > 0 && !stableEqual(revision.lines.map((line) => line.id), record.revisions[index - 1].lines.map((line) => line.id))
      || index > 0 && stableEqual({ reference: revision.reference, declaredAt: revision.declaredAt, transcript: revision.transcript, notes: revision.notes, lines: revision.lines }, { reference: record.revisions[index - 1].reference, declaredAt: record.revisions[index - 1].declaredAt, transcript: record.revisions[index - 1].transcript, notes: record.revisions[index - 1].notes, lines: record.revisions[index - 1].lines })) return false;
    if (event.origin === "live-command" && (event.id !== `builder-proposal-event:${record.id}:v${event.version}` || revision.id !== `builder-proposal-revision:${record.id}:v${revision.version}`)) return false;
    eventIds.add(event.id);
    revisionIds.add(revision.id);
  }
  const current = record.revisions.at(-1)!;
  if (record.currentRevisionId !== current.id
    || record.createdAt !== record.history[0].at
    || record.updatedAt !== record.history.at(-1)!.at
    || !stableEqual({ target: record.target, requestSnapshot: record.requestSnapshot, supplierSnapshot: record.supplierSnapshot, contactPin: record.contactPin, reference: record.reference, declaredAt: record.declaredAt, transcript: record.transcript, notes: record.notes, lines: record.lines }, { target: current.target, requestSnapshot: current.requestSnapshot, supplierSnapshot: current.supplierSnapshot, contactPin: current.contactPin, reference: current.reference, declaredAt: current.declaredAt, transcript: current.transcript, notes: current.notes, lines: current.lines })) return false;
  if (record.legacyEvidence === null) return record.history.every((event) => event.origin === "live-command");
  return legacyEvidenceIsValid(record.legacyEvidence, record)
    && record.history.every((event, index) => index < record.legacyEvidence!.sourceRecordVersion ? event.origin === "v1-migration" : event.origin === "live-command");
}

function replayMigratedRecord(record: BuilderRecordedProposalRecord) {
  const evidence = record.legacyEvidence;
  if (!evidence) return null;
  const version = evidence.sourceRecordVersion;
  const revision = record.revisions[version - 1];
  return finalizeBuilderProposalRecord({
    ...withoutFingerprint(record),
    target: revision.target,
    requestSnapshot: revision.requestSnapshot,
    supplierSnapshot: revision.supplierSnapshot,
    contactPin: revision.contactPin,
    reference: revision.reference,
    declaredAt: revision.declaredAt,
    transcript: revision.transcript,
    notes: revision.notes,
    lines: revision.lines,
    currentRevisionId: revision.id,
    version,
    createdAt: evidence.sourceCreatedAt,
    updatedAt: evidence.sourceUpdatedAt,
    history: record.history.slice(0, version),
    revisions: record.revisions.slice(0, version),
  });
}

function migratedRecordFingerprint(record: BuilderRecordedProposalRecord) {
  return replayMigratedRecord(record)?.fingerprint ?? null;
}

function replayInitialMigrationCandidate(envelope: BuilderProposalEnvelope) {
  const records = envelope.records.flatMap((record): BuilderRecordedProposalRecord[] => {
    const replayed = replayMigratedRecord(record);
    return replayed ? [replayed] : [];
  });
  return finalizeBuilderProposalEnvelope({
    schemaVersion: 2,
    fingerprintVersion: "builder-proposal-domain-v2",
    storeVersion: 1,
    records,
    idempotencyReceipts: [],
    migrationReports: [envelope.migrationReports[0]],
    updatedAt: envelope.migrationReports[0].migratedAt,
  });
}

function migrationReportIsValid(value: unknown): value is BuilderProposalMigrationReport {
  if (!hasExactKeys(value, ["schemaVersion", "id", "store", "sourceGeneration", "sourceKey", "sourceRawHash", "dependencySnapshotHash", "identityBindingHash", "migratedAt", "recordCount", "migratedRecordFingerprints", "migratedRevisionCount", "fingerprint"])) return false;
  const report = value as BuilderProposalMigrationReport;
  return report.schemaVersion === 1
    && exactString(report.id, 300)
    && report.store === "builder-proposal"
    && ["v1-array", "none"].includes(report.sourceGeneration)
    && (report.sourceGeneration === "none" ? report.sourceKey === null && report.sourceRawHash === null : report.sourceKey === legacyBuilderProposalsStorageKey && exactSha256(report.sourceRawHash))
    && exactSha256(report.dependencySnapshotHash)
    && exactSha256(report.identityBindingHash)
    && exactDate(report.migratedAt)
    && exactInteger(report.recordCount, 0)
    && Array.isArray(report.migratedRecordFingerprints)
    && report.migratedRecordFingerprints.length === report.recordCount
    && report.migratedRecordFingerprints.every(exactSha256)
    && exactInteger(report.migratedRevisionCount, 0)
    && exactSha256(report.fingerprint)
    && report.fingerprint === builderProposalHash(withoutFingerprint(report));
}

function receiptIsValid(value: unknown): value is BuilderProposalCommandReceipt {
  if (!hasExactKeys(value, ["schemaVersion", "position", "key", "action", "payloadHash", "projectId", "recordId", "expectedStoreVersion", "expectedRecordVersion", "commandPins", "expectedDependencySnapshotHash", "result", "resultingStoreVersion", "resultingRecordVersion", "eventId", "revisionId", "authorizationContextHash", "recordedAt", "fingerprint"])) return false;
  const receipt = value as BuilderProposalCommandReceipt;
  return receipt.schemaVersion === 1
    && exactInteger(receipt.position)
    && exactString(receipt.key, 300)
    && ["create-proposal", "update-proposal"].includes(receipt.action)
    && exactSha256(receipt.payloadHash)
    && exactString(receipt.projectId, 200)
    && exactString(receipt.recordId, 240)
    && exactInteger(receipt.expectedStoreVersion)
    && (receipt.expectedRecordVersion === null || exactInteger(receipt.expectedRecordVersion))
    && commandPinsAreValid(receipt.commandPins)
    && exactSha256(receipt.expectedDependencySnapshotHash)
    && receipt.commandPins.expectedDependencySnapshotHash === receipt.expectedDependencySnapshotHash
    && ["created", "updated"].includes(receipt.result)
    && receipt.resultingStoreVersion === receipt.expectedStoreVersion + 1
    && receipt.resultingRecordVersion === (receipt.expectedRecordVersion ?? 0) + 1
    && exactString(receipt.eventId, 300)
    && exactString(receipt.revisionId, 300)
    && exactSha256(receipt.authorizationContextHash)
    && exactDate(receipt.recordedAt)
    && exactSha256(receipt.fingerprint)
    && receipt.fingerprint === builderProposalHash(withoutFingerprint(receipt))
    && (receipt.action === "create-proposal" ? receipt.expectedRecordVersion === null && receipt.result === "created" && receipt.resultingRecordVersion === 1 : receipt.expectedRecordVersion !== null && receipt.result === "updated");
}

function envelopeIsValid(value: unknown, authority: ProcurementDispatchAuthority): value is BuilderProposalEnvelope {
  if (!hasExactKeys(value, ["schemaVersion", "fingerprintVersion", "storeVersion", "records", "idempotencyReceipts", "migrationReports", "updatedAt", "fingerprint"])) return false;
  const envelope = value as BuilderProposalEnvelope;
  if (envelope.schemaVersion !== 2
    || envelope.fingerprintVersion !== "builder-proposal-domain-v2"
    || !exactInteger(envelope.storeVersion)
    || !Array.isArray(envelope.records)
    || envelope.records.length > 1000
    || !Array.isArray(envelope.idempotencyReceipts)
    || envelope.idempotencyReceipts.length > 10000
    || !Array.isArray(envelope.migrationReports)
    || envelope.migrationReports.length !== 1
    || !exactDate(envelope.updatedAt)
    || !exactSha256(envelope.fingerprint)
    || envelope.fingerprint !== builderProposalHash(withoutFingerprint(envelope))
    || !migrationReportIsValid(envelope.migrationReports[0])) return false;
  const report = envelope.migrationReports[0];
  if (report.identityBindingHash !== authority.identityBindingHash || !migrationIdIsValid(report) || envelope.storeVersion !== envelope.idempotencyReceipts.length + 1) return false;
  const recordIds = new Set<string>();
  const revisionIds = new Set<string>();
  const eventIds = new Set<string>();
  const projectCounts = new Map<string, number>();
  for (let index = 0; index < envelope.records.length; index += 1) {
    const record = envelope.records[index];
    const count = (projectCounts.get(record.projectId) ?? 0) + 1;
    if (!recordIsValid(record, authority)
      || recordIds.has(record.id)
      || record.revisions.some((revision) => revisionIds.has(revision.id))
      || record.history.some((event) => eventIds.has(event.id))
      || index > 0 && compareIds(envelope.records[index - 1].id, record.id) >= 0
      || count > 100) return false;
    recordIds.add(record.id);
    record.revisions.forEach((revision) => revisionIds.add(revision.id));
    record.history.forEach((event) => eventIds.add(event.id));
    projectCounts.set(record.projectId, count);
  }
  const migrated = envelope.records.filter((record) => record.legacyEvidence !== null);
  const migratedFingerprints = migrated.map(migratedRecordFingerprint);
  const sourceIndexes = migrated.map((record) => record.legacyEvidence!.sourceIndex).sort((first, second) => first - second);
  if (report.recordCount !== migrated.length
    || report.migratedRevisionCount !== migrated.reduce((count, record) => count + record.legacyEvidence!.sourceRecordVersion, 0)
    || !stableEqual(report.migratedRecordFingerprints, migratedFingerprints)
    || sourceIndexes.some((sourceIndex, index) => sourceIndex !== index)
    || (report.sourceGeneration === "none" ? migrated.length !== 0 : migrated.some((record) => record.legacyEvidence!.sourceGeneration !== "v1-array"))) return false;
  const receiptKeys = new Set<string>();
  const lastReceiptVersionByRecord = new Map<string, number>();
  const liveEvents = envelope.records.flatMap((record) => record.history.map((event) => ({ record, event }))).filter(({ event }) => event.origin === "live-command");
  for (let index = 0; index < envelope.idempotencyReceipts.length; index += 1) {
    const receipt = envelope.idempotencyReceipts[index];
    if (!receiptIsValid(receipt)
      || receipt.position !== index + 1
      || receipt.expectedStoreVersion !== index + 1
      || receipt.resultingStoreVersion !== index + 2
      || receiptKeys.has(receipt.key)
      || receipt.authorizationContextHash !== authority.authorizationHashes[receipt.projectId]
      || (lastReceiptVersionByRecord.get(receipt.recordId) ?? 0) >= receipt.resultingRecordVersion
      || Date.parse(receipt.recordedAt) < Date.parse(report.migratedAt)
      || index > 0 && Date.parse(receipt.recordedAt) < Date.parse(envelope.idempotencyReceipts[index - 1].recordedAt)) return false;
    const matches = liveEvents.filter(({ record, event }) => record.id === receipt.recordId
      && record.projectId === receipt.projectId
      && event.id === receipt.eventId
      && event.revisionId === receipt.revisionId
      && event.version === receipt.resultingRecordVersion
      && event.at === receipt.recordedAt
      && event.idempotencyKey === receipt.key
      && event.commandPayloadHash === receipt.payloadHash
      && event.dependencySnapshotHash === receipt.expectedDependencySnapshotHash
      && event.authorizationContextHash === receipt.authorizationContextHash
      && (receipt.action === "create-proposal" ? event.type === "created" : event.type === "updated"));
    if (matches.length !== 1) return false;
    const matchedRecord = matches[0].record;
    const matchedRevision = matchedRecord.revisions.find((revision) => revision.id === receipt.revisionId && revision.version === receipt.resultingRecordVersion);
    const previousRevision = matchedRecord.revisions.find((revision) => revision.version === receipt.resultingRecordVersion - 1);
    const sameFileIdentity = receipt.action === "update-proposal"
      && previousRevision?.reference.kind === "project-file-metadata"
      && matchedRevision?.reference.kind === "project-file-metadata"
      && previousRevision.reference.projectFileId === matchedRevision.reference.projectFileId
      && previousRevision.reference.projectFileVersion === matchedRevision.reference.projectFileVersion;
    const sameFileRename = sameFileIdentity && stableEqual(previousRevision!.reference, matchedRevision!.reference);
    const reconstructedPayload = matchedRevision ? reconstructReceiptPayload(receipt, matchedRevision, authority) : null;
    if (!matchedRevision
      || (matchedRevision.reference.kind === "unattached") !== (receipt.commandPins.fileMetadataFingerprint === null)
      || sameFileIdentity && !sameFileRename
      || matchedRevision.reference.kind === "project-file-metadata"
        && !sameFileRename
        && receipt.commandPins.fileMetadataFingerprint !== matchedRevision.reference.metadataFingerprint
      || receipt.commandPins.requestDependencyFingerprint !== matchedRevision.target.requestDependencyFingerprint
      || receipt.commandPins.contentApprovalFingerprint !== matchedRevision.target.contentApprovalFingerprint
      || receipt.commandPins.supplierContactRevisionFingerprint !== matchedRevision.contactPin.supplierContactRevisionFingerprint
      || !reconstructedPayload
      || builderProposalHash(reconstructedPayload) !== receipt.payloadHash) return false;
    receiptKeys.add(receipt.key);
    lastReceiptVersionByRecord.set(receipt.recordId, receipt.resultingRecordVersion);
  }
  const reportTime = Date.parse(report.migratedAt);
  const envelopeTime = Date.parse(envelope.updatedAt);
  const expectedUpdatedAt = envelope.idempotencyReceipts.at(-1)?.recordedAt ?? report.migratedAt;
  if (liveEvents.length !== envelope.idempotencyReceipts.length
    || envelope.updatedAt !== expectedUpdatedAt
    || envelopeTime < reportTime
    || envelope.records.some((record) => Date.parse(record.createdAt) > envelopeTime
      || Date.parse(record.updatedAt) > envelopeTime
      || record.revisions.some((revision) => Date.parse(revision.createdAt) > envelopeTime)
      || record.history.some((event) => Date.parse(event.at) > envelopeTime)
      || record.legacyEvidence !== null && record.history.slice(0, record.legacyEvidence.sourceRecordVersion).some((event) => Date.parse(event.at) > reportTime))
    || envelope.idempotencyReceipts.some((receipt) => Date.parse(receipt.recordedAt) > envelopeTime)) return false;
  return envelope.records.every((record) => record.history.every((event) => event.origin !== "v1-migration" || event.dependencySnapshotHash === report.dependencySnapshotHash));
}

export function parseBuilderProposalEnvelopeRaw(raw: string | null, authority: ProcurementDispatchAuthority): BuilderProposalEnvelope | null {
  if (raw === null || !authorityIsValid(authority)) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return envelopeIsValid(value, authority) ? value : null;
  } catch {
    return null;
  }
}

export function builderProposalRevisionFingerprintMatches(record: BuilderRecordedProposalRecord, revision: BuilderRecordedProposalRevision, pinnedFingerprint: string): boolean {
  if (!record || !revision || !exactSha256(record.fingerprint) || record.fingerprint !== builderProposalHash(withoutFingerprint(record)) || !revisionIsValid(revision)) return false;
  const ownedRevision = record.revisions.find((item) => item.id === revision.id && item.version === revision.version && item.fingerprint === revision.fingerprint);
  if (!ownedRevision) return false;
  if (pinnedFingerprint === revision.fingerprint) return true;
  const evidence = record.legacyEvidence;
  if (!evidence || !legacyEvidenceIsValid(evidence, record)) return false;
  const link = evidence.revisionLinks.find((item) => item.revisionId === revision.id && item.revisionVersion === revision.version && item.canonicalFingerprint === revision.fingerprint);
  return Boolean(link && link.legacyFingerprint === pinnedFingerprint);
}

type LegacyBuilderProposalReference =
  | { kind: "unattached"; projectFileId: null; fileSnapshot: null; contentPersisted: false; extractionPerformed: false }
  | { kind: "project-file-metadata"; projectFileId: string; fileSnapshot: BuilderProposalFileSnapshot; contentPersisted: false; extractionPerformed: false };

type LegacyBuilderProposalRevision = {
  id: string;
  version: number;
  createdAt: string;
  declaredAt: string | null;
  transcript: string | null;
  notes: string | null;
  lines: BuilderRecordedProposalLine[];
  fingerprint: Fnv1aFingerprint;
};

type LegacyBuilderProposalEvent = { id: string; type: "created" | "updated"; actor: "شما"; at: string; version: number };

type LegacyBuilderProposalRecord = {
  schemaVersion: 1;
  id: string;
  projectId: string;
  source: "ثبت دستی سازنده";
  networkStatus: "خارج از شبکه چیدا";
  supplierAuthenticated: false;
  receivedThroughChida: false;
  externalEffect: "none";
  target: ReturnType<typeof legacyTarget>;
  requestSnapshot: BuilderRecordedProposalRequestSnapshot;
  supplierSnapshot: BuilderRecordedProposalSupplierSnapshot;
  reference: LegacyBuilderProposalReference;
  currentRevisionId: string;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  version: number;
  createdAt: string;
  updatedAt: string;
  history: LegacyBuilderProposalEvent[];
  revisions: LegacyBuilderProposalRevision[];
};

function contactSupports(contact: Pick<BuilderProposalContactDependency, "responseCapability">, requestKind: PurchaseRequestKind) {
  return contact.responseCapability === "both" || contact.responseCapability === requestKind;
}

function fileLooksLikeImage(file: Pick<BuilderProposalFileDependency, "originalName" | "mimeType">) {
  const extension = file.originalName.split(".").at(-1)?.toLocaleLowerCase("en") ?? "";
  if (!["png", "jpg", "jpeg", "webp", "heic", "heif"].includes(extension)) return false;
  const mime = file.mimeType.toLocaleLowerCase("en");
  if (!mime || mime === "application/octet-stream") return true;
  if (extension === "png") return mime === "image/png";
  if (extension === "jpg" || extension === "jpeg") return mime === "image/jpeg" || mime === "image/jpg";
  if (extension === "webp") return mime === "image/webp";
  return mime === "image/heic" || mime === "image/heif" || mime === "image/jpeg";
}

function legacyReferenceIsValid(value: unknown, projectId: string, dependencies: BuilderProposalDependencies): { legacy: LegacyBuilderProposalReference; canonical: BuilderRecordedProposalReference; dependencyAt: number } | null {
  if (!hasExactKeys(value, ["kind", "projectFileId", "fileSnapshot", "contentPersisted", "extractionPerformed"])) return null;
  const reference = value as LegacyBuilderProposalReference;
  if (reference.contentPersisted !== false || reference.extractionPerformed !== false) return null;
  if (reference.kind === "unattached") {
    return reference.projectFileId === null && reference.fileSnapshot === null
      ? { legacy: reference, canonical: { kind: "unattached", projectFileId: null, projectFileVersion: null, fileSnapshot: null, metadataFingerprint: null, contentPersisted: false, extractionPerformed: false }, dependencyAt: 0 }
      : null;
  }
  if (reference.kind !== "project-file-metadata" || !exactString(reference.projectFileId, 240) || !fileSnapshotIsValid(reference.fileSnapshot) || reference.projectFileId !== reference.fileSnapshot.id) return null;
  const matches = dependencies.files.filter((file) => file.id === reference.projectFileId
    && file.projectId === projectId
    && file.version === 1
    && !fileLooksLikeImage(file)
    && file.originalName === reference.fileSnapshot.originalName
    && file.mimeType === reference.fileSnapshot.mimeType
    && file.size === reference.fileSnapshot.size
    && file.category === reference.fileSnapshot.category
    && file.createdAt === reference.fileSnapshot.createdAt);
  if (matches.length !== 1) return null;
  return {
    legacy: reference,
    canonical: {
      kind: "project-file-metadata",
      projectFileId: reference.projectFileId,
      projectFileVersion: 1,
      fileSnapshot: reference.fileSnapshot,
      metadataFingerprint: builderProposalHash(reference.fileSnapshot) as Sha256Fingerprint,
      contentPersisted: false,
      extractionPerformed: false,
    },
    dependencyAt: Date.parse(matches[0].createdAt),
  };
}

function parseLegacyRecord(value: unknown, sourceIndex: number, dependencies: BuilderProposalDependencies): { source: LegacyBuilderProposalRecord; record: BuilderRecordedProposalRecord } | null {
  const legacyRecordKeys = ["schemaVersion", "id", "projectId", "source", "networkStatus", "supplierAuthenticated", "receivedThroughChida", "externalEffect", "target", "requestSnapshot", "supplierSnapshot", "reference", "currentRevisionId", "visibility", "localStatus", "version", "createdAt", "updatedAt", "history", "revisions"] as const;
  if (!hasExactKeys(value, legacyRecordKeys)) return null;
  const source = value as LegacyBuilderProposalRecord;
  if (source.schemaVersion !== 1
    || !exactString(source.id, 240)
    || !exactString(source.projectId, 200)
    || !dependencies.authority.projectIds.includes(source.projectId)
    || source.source !== "ثبت دستی سازنده"
    || source.networkStatus !== "خارج از شبکه چیدا"
    || source.supplierAuthenticated !== false
    || source.receivedThroughChida !== false
    || source.externalEffect !== "none"
    || !hasExactKeys(source.target, ["requestId", "requestVersion", "reviewRevisionId", "reviewRevisionFingerprint", "contentApprovalId", "requestKind"])
    || !exactString(source.target.requestId, 200)
    || !exactInteger(source.target.requestVersion)
    || !exactString(source.target.reviewRevisionId, 300)
    || !exactFnv1a(source.target.reviewRevisionFingerprint)
    || !exactString(source.target.contentApprovalId, 200)
    || !["product", "service"].includes(source.target.requestKind)
    || !requestSnapshotIsValid(source.requestSnapshot)
    || source.requestSnapshot.requestKind !== source.target.requestKind
    || !supplierSnapshotIsValid(source.supplierSnapshot)
    || source.visibility !== "خصوصی پروژه"
    || source.localStatus !== "ثبت محلی"
    || !exactInteger(source.version)
    || !exactDate(source.createdAt)
    || !exactDate(source.updatedAt)
    || !Array.isArray(source.history)
    || !Array.isArray(source.revisions)
    || source.history.length !== source.version
    || source.revisions.length !== source.version
    || !exactString(source.currentRevisionId, 300)) return null;
  const requests = dependencies.requestRevisions.filter((request) => request.projectId === source.projectId
    && request.requestId === source.target.requestId
    && request.requestVersion === source.target.requestVersion
    && request.revisionId === source.target.reviewRevisionId
    && request.revisionFingerprint === source.target.reviewRevisionFingerprint
    && request.requestKind === source.target.requestKind);
  if (requests.length !== 1) return null;
  const request = requests[0];
  const expectedRequestSnapshot = buildRequestSnapshot(request.snapshot);
  if (!expectedRequestSnapshot || !stableEqual(source.requestSnapshot, expectedRequestSnapshot)) return null;
  const approvals = dependencies.contentApprovals.filter((approval) => approval.projectId === source.projectId
    && approval.approvalId === source.target.contentApprovalId
    && approval.requestId === source.target.requestId
    && approval.requestVersion === source.target.requestVersion
    && approval.requestRevisionId === source.target.reviewRevisionId
    && approval.requestRevisionFingerprint === source.target.reviewRevisionFingerprint
    && approval.status === "approved");
  if (approvals.length !== 1) return null;
  const approval = approvals[0];
  const contacts = dependencies.contacts.filter((contact) => contact.projectId === source.projectId
    && contact.supplierContactId === source.supplierSnapshot.supplierContactId
    && contact.supplierContactVersion === source.supplierSnapshot.supplierContactVersion
    && contact.status === "active"
    && contactSupports(contact, source.target.requestKind)
    && contact.displayName === source.supplierSnapshot.displayName
    && contact.category === source.supplierSnapshot.category
    && contact.tehranCoverage === source.supplierSnapshot.tehranCoverage
    && contact.responseCapability === source.supplierSnapshot.responseCapability);
  if (contacts.length !== 1) return null;
  const contact = contacts[0];
  const reference = legacyReferenceIsValid(source.reference, source.projectId, dependencies);
  if (!reference || !stableEqual(reference.legacy, source.reference)) return null;
  const target: BuilderProposalTargetPin = {
    requestId: source.target.requestId,
    requestVersion: source.target.requestVersion,
    reviewRevisionId: source.target.reviewRevisionId,
    reviewRevisionFingerprint: source.target.reviewRevisionFingerprint,
    requestDependencyFingerprint: request.fingerprint,
    contentApprovalId: approval.approvalId,
    contentApprovalVersion: approval.approvalVersion,
    contentApprovalRevisionId: approval.approvalRevisionId,
    contentApprovalFingerprint: approval.approvalFingerprint as Sha256Fingerprint,
    requestKind: source.target.requestKind,
  };
  const contactPin: BuilderProposalContactPin = {
    supplierContactId: contact.supplierContactId,
    supplierContactVersion: contact.supplierContactVersion,
    supplierContactRevisionId: contact.supplierContactRevisionId,
    supplierContactRevisionFingerprint: contact.supplierContactRevisionFingerprint as Sha256Fingerprint,
  };
  const expectedLines = expectedProposalLines(source.requestSnapshot);
  const eventIds = new Set<string>();
  const revisionIds = new Set<string>();
  const history: BuilderRecordedProposalEvent[] = [];
  const revisions: BuilderRecordedProposalRevision[] = [];
  const links: BuilderProposalLegacyEvidence["revisionLinks"] = [];
  for (let index = 0; index < source.version; index += 1) {
    const event = source.history[index];
    const revision = source.revisions[index];
    if (!hasExactKeys(event, ["id", "type", "actor", "at", "version"])
      || !exactString(event.id, 300)
      || eventIds.has(event.id)
      || !["created", "updated"].includes(event.type)
      || event.actor !== "شما"
      || event.version !== index + 1
      || index === 0 && event.type !== "created"
      || index > 0 && event.type !== "updated"
      || !exactDate(event.at)
      || index > 0 && Date.parse(event.at) < Date.parse(source.history[index - 1].at)
      || !hasExactKeys(revision, ["id", "version", "createdAt", "declaredAt", "transcript", "notes", "lines", "fingerprint"])
      || !exactString(revision.id, 300)
      || revisionIds.has(revision.id)
      || revision.version !== index + 1
      || revision.createdAt !== event.at
      || !optionalVisibleString(revision.declaredAt, 80)
      || !optionalVisibleString(revision.transcript, 2000)
      || !optionalVisibleString(revision.notes, 1000)
      || !Array.isArray(revision.lines)
      || revision.lines.length !== expectedLines.length
      || new Set(revision.lines.map((line) => line.id)).size !== revision.lines.length
      || revision.lines.some((line, lineIndex) => !lineIsValid(line, expectedLines[lineIndex]))
      || index > 0 && !stableEqual(revision.lines.map((line) => line.id), source.revisions[index - 1].lines.map((line) => line.id))) return null;
    const revisionWithoutFingerprint = { id: revision.id, version: revision.version, createdAt: revision.createdAt, declaredAt: revision.declaredAt, transcript: revision.transcript, notes: revision.notes, lines: revision.lines };
    const expectedLegacyFingerprint = legacyFnvHash({ target: source.target, requestSnapshot: source.requestSnapshot, supplierSnapshot: source.supplierSnapshot, reference: source.reference, revision: revisionWithoutFingerprint });
    if (revision.fingerprint !== expectedLegacyFingerprint || !meaningfulRevision(reference.canonical, revision)) return null;
    const canonicalRevision = finalizeBuilderProposalRevision({
      ...revisionWithoutFingerprint,
      target,
      requestSnapshot: source.requestSnapshot,
      supplierSnapshot: source.supplierSnapshot,
      contactPin,
      reference: reference.canonical,
    });
    revisions.push(canonicalRevision);
    history.push(finalizeEvent({
      schemaVersion: 1,
      id: event.id,
      type: event.type,
      actor: "سامانهٔ مهاجرت",
      actorPrincipalId: "local-builder-account",
      origin: "v1-migration",
      at: event.at,
      version: event.version,
      revisionId: revision.id,
      authorizationContextHash: dependencies.authority.authorizationHashes[source.projectId] as Sha256Fingerprint,
      dependencySnapshotHash: dependencies.snapshotHash,
      idempotencyKey: null,
      commandPayloadHash: null,
    }));
    links.push({ revisionId: revision.id, revisionVersion: revision.version, legacyFingerprint: revision.fingerprint, canonicalFingerprint: canonicalRevision.fingerprint });
    eventIds.add(event.id);
    revisionIds.add(revision.id);
  }
  const current = revisions.at(-1);
  const minimumCreationTime = Math.max(Date.parse(request.revisionCreatedAt), Date.parse(approval.updatedAt), Date.parse(contact.revisionCreatedAt), reference.dependencyAt);
  const repeatedRevision = revisions.some((revision, index) => index > 0 && stableEqual({ declaredAt: revision.declaredAt, transcript: revision.transcript, notes: revision.notes, lines: revision.lines }, { declaredAt: revisions[index - 1].declaredAt, transcript: revisions[index - 1].transcript, notes: revisions[index - 1].notes, lines: revisions[index - 1].lines }));
  if (!current
    || source.currentRevisionId !== current.id
    || source.createdAt !== history[0]?.at
    || source.updatedAt !== history.at(-1)?.at
    || Date.parse(source.createdAt) < minimumCreationTime
    || repeatedRevision) return null;
  const legacyEvidence = finalizeLegacyEvidence({
    schemaVersion: 1,
    sourceGeneration: "v1-array",
    sourceIndex,
    sourceRecordHash: builderProposalHash(source) as Sha256Fingerprint,
    sourceRecordVersion: source.version,
    sourceCreatedAt: source.createdAt,
    sourceUpdatedAt: source.updatedAt,
    revisionLinks: links,
  });
  const record = finalizeBuilderProposalRecord({
    schemaVersion: 2,
    objectType: "builder-recorded-proposal",
    id: source.id,
    projectId: source.projectId,
    ownerPrincipalType: "account",
    ownerPrincipalId: "local-builder-account",
    accountSide: "builder",
    scopeType: "project_private",
    scopeId: source.projectId,
    custodianService: "Proposal Domain Service",
    sensitivity: "private",
    source: source.source,
    networkStatus: source.networkStatus,
    supplierAuthenticated: false,
    receivedThroughChida: false,
    externalEffect: "none",
    target,
    requestSnapshot: source.requestSnapshot,
    supplierSnapshot: source.supplierSnapshot,
    contactPin,
    reference: reference.canonical,
    declaredAt: current.declaredAt,
    transcript: current.transcript,
    notes: current.notes,
    lines: current.lines,
    currentRevisionId: current.id,
    visibility: source.visibility,
    localStatus: source.localStatus,
    version: source.version,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    history,
    revisions,
    legacyEvidence,
  });
  return recordIsValid(record, dependencies.authority) ? { source, record } : null;
}

function migrationIdFor(sourceGeneration: "v1-array" | "none", sourceRawHash: Sha256Fingerprint | null, dependencies: BuilderProposalDependencies) {
  return `builder-proposal-migration:${builderProposalHash({ sourceGeneration, sourceRawHash, dependencySnapshotHash: dependencies.snapshotHash, identityBindingHash: dependencies.authority.identityBindingHash })}`;
}

function migrationIdIsValid(report: BuilderProposalMigrationReport) {
  return report.id === `builder-proposal-migration:${builderProposalHash({ sourceGeneration: report.sourceGeneration, sourceRawHash: report.sourceRawHash, dependencySnapshotHash: report.dependencySnapshotHash, identityBindingHash: report.identityBindingHash })}`;
}

function buildMigrationCandidate(sourceRaw: string | null, dependencies: BuilderProposalDependencies, fixedMigrationAt?: string): { envelope: BuilderProposalEnvelope; raw: string } | null {
  let values: unknown[] = [];
  if (sourceRaw !== null) {
    try {
      const parsed: unknown = JSON.parse(sourceRaw);
      if (!Array.isArray(parsed) || parsed.length > 1000) return null;
      values = parsed;
    } catch {
      return null;
    }
  }
  const records: BuilderRecordedProposalRecord[] = [];
  const ids = new Set<string>();
  const projectCounts = new Map<string, number>();
  for (let index = 0; index < values.length; index += 1) {
    const parsed = parseLegacyRecord(values[index], index, dependencies);
    if (!parsed || ids.has(parsed.record.id)) return null;
    const count = (projectCounts.get(parsed.record.projectId) ?? 0) + 1;
    if (count > 100) return null;
    records.push(parsed.record);
    ids.add(parsed.record.id);
    projectCounts.set(parsed.record.projectId, count);
  }
  records.sort((first, second) => compareIds(first.id, second.id));
  const sourceGeneration = sourceRaw === null ? "none" as const : "v1-array" as const;
  const sourceRawHash = sourceRaw === null ? null : builderProposalHash(sourceRaw) as Sha256Fingerprint;
  const latestDependencyAt = Math.max(
    0,
    ...dependencies.requestRevisions.map((request) => Date.parse(request.revisionCreatedAt)),
    ...dependencies.contentApprovals.map((approval) => Date.parse(approval.updatedAt)),
    ...dependencies.contacts.map((contact) => Date.parse(contact.revisionCreatedAt)),
    ...dependencies.files.map((file) => Date.parse(file.createdAt)),
    ...records.map((record) => Date.parse(record.updatedAt)),
  );
  if (fixedMigrationAt !== undefined && (!exactDate(fixedMigrationAt) || Date.parse(fixedMigrationAt) < latestDependencyAt)) return null;
  const migratedAt = fixedMigrationAt ?? new Date(Math.max(Date.now(), latestDependencyAt)).toISOString();
  const report = finalizeMigrationReport({
    schemaVersion: 1,
    id: migrationIdFor(sourceGeneration, sourceRawHash, dependencies),
    store: "builder-proposal",
    sourceGeneration,
    sourceKey: sourceGeneration === "none" ? null : legacyBuilderProposalsStorageKey,
    sourceRawHash,
    dependencySnapshotHash: dependencies.snapshotHash,
    identityBindingHash: dependencies.authority.identityBindingHash as Sha256Fingerprint,
    migratedAt,
    recordCount: records.length,
    migratedRecordFingerprints: records.map((record) => record.fingerprint),
    migratedRevisionCount: records.reduce((count, record) => count + record.revisions.length, 0),
  });
  const envelope = finalizeBuilderProposalEnvelope({
    schemaVersion: 2,
    fingerprintVersion: "builder-proposal-domain-v2",
    storeVersion: 1,
    records,
    idempotencyReceipts: [],
    migrationReports: [report],
    updatedAt: migratedAt,
  });
  const raw = JSON.stringify(envelope);
  return parseBuilderProposalEnvelopeRaw(raw, dependencies.authority) ? { envelope, raw } : null;
}

function markerBaseMatchesReport(marker: BuilderProposalCutoverMarker, report: BuilderProposalMigrationReport) {
  return migrationIdIsValid(report)
    && marker.migrationId === report.id
    && marker.sourceGeneration === report.sourceGeneration
    && marker.sourceKey === report.sourceKey
    && marker.sourceRawHash === report.sourceRawHash
    && marker.dependencySnapshotHash === report.dependencySnapshotHash
    && marker.identityBindingHash === report.identityBindingHash
    && marker.migrationAt === report.migratedAt;
}

function committedMarkerMatchesCanonical(marker: BuilderProposalCommittedMarker, envelope: BuilderProposalEnvelope, canonicalRaw: string) {
  if (!markerBaseMatchesReport(marker, envelope.migrationReports[0])) return false;
  if (envelope.storeVersion === 1) {
    const canonicalHash = builderProposalHash(canonicalRaw);
    return marker.candidateRawHash === canonicalHash && marker.canonicalRawHash === canonicalHash;
  }
  const firstReceiptAt = envelope.idempotencyReceipts[0]?.recordedAt;
  if (!firstReceiptAt || Date.parse(firstReceiptAt) < Date.parse(marker.committedAt)) return false;
  const initialCandidate = replayInitialMigrationCandidate(envelope);
  const initialRaw = JSON.stringify(initialCandidate);
  const initialHash = builderProposalHash(initialRaw);
  return marker.candidateRawHash === initialHash && marker.canonicalRawHash === initialHash;
}

function parseCutoverMarkerRaw(raw: string | null, authority: ProcurementDispatchAuthority): BuilderProposalCutoverMarker | null {
  if (raw === null || !authorityIsValid(authority)) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const marker = value as BuilderProposalCutoverMarker;
    const common = marker.schemaVersion === 1
      && marker.store === "builder-proposal"
      && exactString(marker.migrationId, 300)
      && ["v1-array", "none"].includes(marker.sourceGeneration)
      && (marker.sourceGeneration === "none" ? marker.sourceKey === null && marker.sourceRawHash === null : marker.sourceKey === legacyBuilderProposalsStorageKey && exactSha256(marker.sourceRawHash))
      && exactSha256(marker.dependencySnapshotHash)
      && marker.identityBindingHash === authority.identityBindingHash
      && exactDate(marker.migrationAt)
      && exactSha256(marker.candidateRawHash)
      && exactSha256(marker.fingerprint)
      && marker.fingerprint === builderProposalHash(withoutFingerprint(marker));
    if (!common) return null;
    if (marker.state === "pending") {
      if (!hasExactKeys(marker, ["schemaVersion", "store", "state", "migrationId", "sourceGeneration", "sourceKey", "sourceRawHash", "dependencySnapshotHash", "identityBindingHash", "migrationAt", "candidateRaw", "candidateRawHash", "fingerprint"])
        || typeof marker.candidateRaw !== "string"
        || marker.candidateRawHash !== builderProposalHash(marker.candidateRaw)) return null;
      const envelope = parseBuilderProposalEnvelopeRaw(marker.candidateRaw, authority);
      return envelope && markerBaseMatchesReport(marker, envelope.migrationReports[0]) ? marker : null;
    }
    if (marker.state === "verified") {
      if (!hasExactKeys(marker, ["schemaVersion", "store", "state", "migrationId", "sourceGeneration", "sourceKey", "sourceRawHash", "dependencySnapshotHash", "identityBindingHash", "migrationAt", "candidateRaw", "candidateRawHash", "verifiedAt", "fingerprint"])
        || typeof marker.candidateRaw !== "string"
        || marker.candidateRawHash !== builderProposalHash(marker.candidateRaw)
        || !exactDate(marker.verifiedAt)
        || Date.parse(marker.verifiedAt) < Date.parse(marker.migrationAt)) return null;
      const envelope = parseBuilderProposalEnvelopeRaw(marker.candidateRaw, authority);
      return envelope && markerBaseMatchesReport(marker, envelope.migrationReports[0]) ? marker : null;
    }
    if (marker.state === "committed") {
      return hasExactKeys(marker, ["schemaVersion", "store", "state", "migrationId", "sourceGeneration", "sourceKey", "sourceRawHash", "dependencySnapshotHash", "identityBindingHash", "migrationAt", "verifiedAt", "committedAt", "canonicalRawHash", "candidateRawHash", "fingerprint"])
        && exactDate(marker.verifiedAt)
        && exactDate(marker.committedAt)
        && Date.parse(marker.migrationAt) <= Date.parse(marker.verifiedAt)
        && Date.parse(marker.verifiedAt) <= Date.parse(marker.committedAt)
        && exactSha256(marker.canonicalRawHash)
        && marker.canonicalRawHash === marker.candidateRawHash
        ? marker
        : null;
    }
    return null;
  } catch {
    return null;
  }
}

function currentSourceMatchesMarker(marker: BuilderProposalPendingMarker | BuilderProposalVerifiedMarker, sourceRaw: string | null) {
  return marker.sourceGeneration === "none"
    ? sourceRaw === null && marker.sourceKey === null && marker.sourceRawHash === null
    : sourceRaw !== null && marker.sourceKey === legacyBuilderProposalsStorageKey && marker.sourceRawHash === builderProposalHash(sourceRaw);
}

function currentDependenciesMatchMarker(marker: BuilderProposalPendingMarker | BuilderProposalVerifiedMarker, sourceRaw: string | null, dependencies: BuilderProposalDependencies) {
  const rebuilt = buildMigrationCandidate(sourceRaw, dependencies, marker.migrationAt);
  return marker.identityBindingHash === dependencies.authority.identityBindingHash
    && marker.dependencySnapshotHash === dependencies.snapshotHash
    && rebuilt?.raw === marker.candidateRaw
    && marker.candidateRawHash === builderProposalHash(marker.candidateRaw);
}

function dependencyStatus(envelope: BuilderProposalEnvelope, dependencies: BuilderProposalDependencies): "current" | "stale" {
  for (const record of envelope.records) {
    const request = dependencies.requestRevisions.find((item) => item.projectId === record.projectId
      && item.requestId === record.target.requestId
      && item.requestVersion === record.target.requestVersion
      && item.revisionId === record.target.reviewRevisionId
      && item.revisionFingerprint === record.target.reviewRevisionFingerprint
      && item.fingerprint === record.target.requestDependencyFingerprint);
    const approval = dependencies.contentApprovals.find((item) => item.projectId === record.projectId
      && item.approvalId === record.target.contentApprovalId
      && item.approvalVersion === record.target.contentApprovalVersion
      && item.approvalRevisionId === record.target.contentApprovalRevisionId
      && item.approvalFingerprint === record.target.contentApprovalFingerprint
      && item.requestId === record.target.requestId
      && item.requestVersion === record.target.requestVersion
      && item.requestRevisionId === record.target.reviewRevisionId
      && item.requestRevisionFingerprint === record.target.reviewRevisionFingerprint);
    const contact = dependencies.contacts.find((item) => item.projectId === record.projectId
      && item.supplierContactId === record.contactPin.supplierContactId
      && item.supplierContactVersion === record.contactPin.supplierContactVersion
      && item.supplierContactRevisionId === record.contactPin.supplierContactRevisionId
      && item.supplierContactRevisionFingerprint === record.contactPin.supplierContactRevisionFingerprint);
    const file = record.reference.kind === "unattached" ? true : dependencies.files.some((item) => item.projectId === record.projectId
      && item.id === record.reference.projectFileId
      && item.version === 1
      && !fileLooksLikeImage(item)
      && item.originalName === record.reference.fileSnapshot.originalName
      && item.mimeType === record.reference.fileSnapshot.mimeType
      && item.size === record.reference.fileSnapshot.size
      && item.category === record.reference.fileSnapshot.category
      && item.createdAt === record.reference.fileSnapshot.createdAt);
    if (!request?.isCurrentReadyForReview
      || !approval?.isCurrent
      || approval.status !== "approved"
      || !contact?.isCurrent
      || contact.status !== "active"
      || !contactSupports(contact, record.target.requestKind)
      || !stableEqual(record.supplierSnapshot, { supplierContactId: contact.supplierContactId, supplierContactVersion: contact.supplierContactVersion, displayName: contact.displayName, category: contact.category, tehranCoverage: contact.tehranCoverage, responseCapability: contact.responseCapability, networkStatus: "خارج از شبکه چیدا" })
      || !file) return "stale";
  }
  return "current";
}

type ResolvedBuilderProposalCommandDependencies = {
  request: BuilderProposalRequestDependency;
  approval: BuilderProposalApprovalDependency;
  contact: BuilderProposalContactDependency;
  file: BuilderProposalFileDependency | null;
  target: BuilderProposalTargetPin;
  requestSnapshot: BuilderRecordedProposalRequestSnapshot;
  supplierSnapshot: BuilderRecordedProposalSupplierSnapshot;
  contactPin: BuilderProposalContactPin;
  reference: BuilderRecordedProposalReference;
  lines: BuilderRecordedProposalLine[];
};

function proposalFileSnapshot(file: BuilderProposalFileDependency): BuilderProposalFileSnapshot {
  return {
    id: file.id,
    displayName: file.displayName,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    category: file.category,
    createdAt: file.createdAt,
    storageMode: "metadata-only",
  };
}

function resolveBuilderProposalCommandDependencies(
  command: NormalizedBuilderProposalCommand,
  dependencies: BuilderProposalDependencies,
  existing: BuilderRecordedProposalRecord | null,
): ResolvedBuilderProposalCommandDependencies | { status: "dependency-invalid" | "schema-invalid" | "scope-mismatch" } {
  if (command.pins.expectedDependencySnapshotHash !== dependencies.snapshotHash) return { status: "dependency-invalid" };
  const requests = dependencies.requestRevisions.filter((request) => request.projectId === command.projectId
    && request.requestId === command.draft.requestId
    && request.fingerprint === command.pins.requestDependencyFingerprint);
  if (requests.length !== 1) {
    if (dependencies.requestRevisions.some((request) => request.projectId !== command.projectId
      && request.requestId === command.draft.requestId
      && request.fingerprint === command.pins.requestDependencyFingerprint)) return { status: "scope-mismatch" };
    return { status: "dependency-invalid" };
  }
  const request = requests[0];
  const currentRequests = dependencies.requestRevisions.filter((item) => item.projectId === command.projectId
    && item.requestId === command.draft.requestId
    && item.isCurrentReadyForReview);
  if (!request.isCurrentReadyForReview || currentRequests.length !== 1 || currentRequests[0] !== request) return { status: "dependency-invalid" };
  const requestSnapshot = buildRequestSnapshot(request.snapshot);
  if (!requestSnapshot || requestSnapshot.requestKind !== request.requestKind) return { status: "dependency-invalid" };

  const approvals = dependencies.contentApprovals.filter((approval) => approval.projectId === command.projectId
    && approval.approvalFingerprint === command.pins.contentApprovalFingerprint
    && approval.requestId === request.requestId
    && approval.requestVersion === request.requestVersion
    && approval.requestRevisionId === request.revisionId
    && approval.requestRevisionFingerprint === request.revisionFingerprint);
  if (approvals.length !== 1) {
    if (dependencies.contentApprovals.some((approval) => approval.projectId !== command.projectId
      && approval.approvalFingerprint === command.pins.contentApprovalFingerprint)) return { status: "scope-mismatch" };
    return { status: "dependency-invalid" };
  }
  const approval = approvals[0];
  const currentApprovals = dependencies.contentApprovals.filter((item) => item.projectId === command.projectId
    && item.requestId === request.requestId
    && item.requestVersion === request.requestVersion
    && item.requestRevisionId === request.revisionId
    && item.requestRevisionFingerprint === request.revisionFingerprint
    && item.isCurrent);
  if (!approval.isCurrent || approval.status !== "approved" || currentApprovals.length !== 1 || currentApprovals[0] !== approval) return { status: "dependency-invalid" };

  const contacts = dependencies.contacts.filter((contact) => contact.projectId === command.projectId
    && contact.supplierContactId === command.draft.supplierContactId
    && contact.supplierContactRevisionFingerprint === command.pins.supplierContactRevisionFingerprint);
  if (contacts.length !== 1) {
    if (dependencies.contacts.some((contact) => contact.projectId !== command.projectId
      && contact.supplierContactId === command.draft.supplierContactId
      && contact.supplierContactRevisionFingerprint === command.pins.supplierContactRevisionFingerprint)) return { status: "scope-mismatch" };
    return { status: "dependency-invalid" };
  }
  const contact = contacts[0];
  const currentContacts = dependencies.contacts.filter((item) => item.projectId === command.projectId
    && item.supplierContactId === command.draft.supplierContactId
    && item.isCurrent);
  if (!contact.isCurrent || contact.status !== "active" || currentContacts.length !== 1 || currentContacts[0] !== contact || !contactSupports(contact, request.requestKind)) return { status: "dependency-invalid" };

  let file: BuilderProposalFileDependency | null = null;
  let reference: BuilderRecordedProposalReference;
  if (command.draft.projectFileId === "") {
    if (command.pins.fileMetadataFingerprint !== null) return { status: "dependency-invalid" };
    reference = {
      kind: "unattached",
      projectFileId: null,
      projectFileVersion: null,
      fileSnapshot: null,
      metadataFingerprint: null,
      contentPersisted: false,
      extractionPerformed: false,
    };
  } else {
    const files = dependencies.files.filter((item) => item.projectId === command.projectId && item.id === command.draft.projectFileId);
    if (files.length !== 1) {
      if (dependencies.files.some((item) => item.projectId !== command.projectId && item.id === command.draft.projectFileId)) return { status: "scope-mismatch" };
      return { status: "dependency-invalid" };
    }
    file = files[0];
    if (file.version !== 1 || fileLooksLikeImage(file)) return { status: "dependency-invalid" };
    const fileSnapshot = proposalFileSnapshot(file);
    const metadataFingerprint = builderProposalHash(fileSnapshot) as Sha256Fingerprint;
    if (metadataFingerprint !== command.pins.fileMetadataFingerprint) return { status: "dependency-invalid" };
    reference = {
      kind: "project-file-metadata",
      projectFileId: file.id,
      projectFileVersion: 1,
      fileSnapshot,
      metadataFingerprint,
      contentPersisted: false,
      extractionPerformed: false,
    };
  }
  if (existing?.reference.kind === "project-file-metadata"
    && reference.kind === "project-file-metadata"
    && file !== null
    && existing.reference.projectFileId === reference.projectFileId
    && existing.reference.projectFileVersion === reference.projectFileVersion) {
    const historical = existing.reference.fileSnapshot;
    const current = reference.fileSnapshot;
    if (!stableEqual({ id: historical.id, originalName: historical.originalName, mimeType: historical.mimeType, size: historical.size, category: historical.category, createdAt: historical.createdAt, storageMode: historical.storageMode }, { id: current.id, originalName: current.originalName, mimeType: current.mimeType, size: current.size, category: current.category, createdAt: current.createdAt, storageMode: current.storageMode })) return { status: "dependency-invalid" };
    reference = structuredClone(existing.reference);
  }

  const target: BuilderProposalTargetPin = {
    requestId: request.requestId,
    requestVersion: request.requestVersion,
    reviewRevisionId: request.revisionId,
    reviewRevisionFingerprint: request.revisionFingerprint as Fnv1aFingerprint,
    requestDependencyFingerprint: request.fingerprint,
    contentApprovalId: approval.approvalId,
    contentApprovalVersion: approval.approvalVersion,
    contentApprovalRevisionId: approval.approvalRevisionId,
    contentApprovalFingerprint: approval.approvalFingerprint as Sha256Fingerprint,
    requestKind: request.requestKind,
  };
  const supplierSnapshot: BuilderRecordedProposalSupplierSnapshot = {
    supplierContactId: contact.supplierContactId,
    supplierContactVersion: contact.supplierContactVersion,
    displayName: contact.displayName,
    category: contact.category,
    tehranCoverage: contact.tehranCoverage,
    responseCapability: contact.responseCapability,
    networkStatus: "خارج از شبکه چیدا",
  };
  const contactPin: BuilderProposalContactPin = {
    supplierContactId: contact.supplierContactId,
    supplierContactVersion: contact.supplierContactVersion,
    supplierContactRevisionId: contact.supplierContactRevisionId,
    supplierContactRevisionFingerprint: contact.supplierContactRevisionFingerprint as Sha256Fingerprint,
  };
  if (existing && (!stableEqual(existing.target, target)
    || !stableEqual(existing.requestSnapshot, requestSnapshot)
    || !stableEqual(existing.supplierSnapshot, supplierSnapshot)
    || !stableEqual(existing.contactPin, contactPin))) return { status: "dependency-invalid" };

  const expectedLines = expectedProposalLines(requestSnapshot);
  if (command.draft.lines.length !== expectedLines.length) return { status: "schema-invalid" };
  const lines: BuilderRecordedProposalLine[] = command.draft.lines.map((line) => ({ ...structuredClone(line), currency: "تومان" }));
  if (lines.some((line, index) => !lineIsValid(line, expectedLines[index]))) return { status: "schema-invalid" };
  if (existing && lines.some((line, index) => line.id !== existing.lines[index]?.id)) return { status: "schema-invalid" };
  if (!meaningfulRevision(reference, { declaredAt: command.draft.declaredAt, transcript: command.draft.transcript, notes: command.draft.notes, lines })) return { status: "schema-invalid" };

  return { request, approval, contact, file, target, requestSnapshot, supplierSnapshot, contactPin, reference, lines };
}

function proposalProjectionIsUnchanged(
  record: BuilderRecordedProposalRecord,
  resolved: ResolvedBuilderProposalCommandDependencies,
  draft: NormalizedBuilderProposalDraft,
) {
  return stableEqual({
    reference: record.reference,
    declaredAt: record.declaredAt,
    transcript: record.transcript,
    notes: record.notes,
    lines: record.lines,
  }, {
    reference: resolved.reference,
    declaredAt: draft.declaredAt,
    transcript: draft.transcript,
    notes: draft.notes,
    lines: resolved.lines,
  });
}

function builderProposalCommandTimestamp(
  marker: BuilderProposalCommittedMarker,
  envelope: BuilderProposalEnvelope,
  resolved: ResolvedBuilderProposalCommandDependencies,
  existing: BuilderRecordedProposalRecord | null,
) {
  const bounds = [
    Date.now(),
    Date.parse(marker.committedAt),
    Date.parse(envelope.updatedAt),
    Date.parse(resolved.request.revisionCreatedAt),
    Date.parse(resolved.approval.updatedAt),
    Date.parse(resolved.contact.revisionCreatedAt),
    resolved.file ? Date.parse(resolved.file.createdAt) : 0,
    existing ? Date.parse(existing.updatedAt) : 0,
  ];
  return new Date(Math.max(...bounds)).toISOString();
}

function buildBuilderProposalCommandCandidate(
  command: NormalizedBuilderProposalCommand,
  dependencies: BuilderProposalDependencies,
  envelope: BuilderProposalEnvelope,
  marker: BuilderProposalCommittedMarker,
  existing: BuilderRecordedProposalRecord | null,
  resolved: ResolvedBuilderProposalCommandDependencies,
  payloadHash: Sha256Fingerprint,
) {
  const version = (existing?.version ?? 0) + 1;
  const at = builderProposalCommandTimestamp(marker, envelope, resolved, existing);
  const revisionId = `builder-proposal-revision:${command.proposalId}:v${version}`;
  const eventId = `builder-proposal-event:${command.proposalId}:v${version}`;
  const authorizationContextHash = dependencies.authority.authorizationHashes[command.projectId] as Sha256Fingerprint;
  const revision = finalizeBuilderProposalRevision({
    id: revisionId,
    version,
    createdAt: at,
    target: structuredClone(resolved.target),
    requestSnapshot: structuredClone(resolved.requestSnapshot),
    supplierSnapshot: structuredClone(resolved.supplierSnapshot),
    contactPin: structuredClone(resolved.contactPin),
    reference: structuredClone(resolved.reference),
    declaredAt: command.draft.declaredAt,
    transcript: command.draft.transcript,
    notes: command.draft.notes,
    lines: structuredClone(resolved.lines),
  });
  const event = finalizeEvent({
    schemaVersion: 1,
    id: eventId,
    type: command.action === "create-proposal" ? "created" : "updated",
    actor: "شما",
    actorPrincipalId: "local-builder-account",
    origin: "live-command",
    at,
    version,
    revisionId,
    authorizationContextHash,
    dependencySnapshotHash: dependencies.snapshotHash,
    idempotencyKey: command.idempotencyKey,
    commandPayloadHash: payloadHash,
  });
  const projection = {
    target: structuredClone(resolved.target),
    requestSnapshot: structuredClone(resolved.requestSnapshot),
    supplierSnapshot: structuredClone(resolved.supplierSnapshot),
    contactPin: structuredClone(resolved.contactPin),
    reference: structuredClone(resolved.reference),
    declaredAt: command.draft.declaredAt,
    transcript: command.draft.transcript,
    notes: command.draft.notes,
    lines: structuredClone(resolved.lines),
  };
  const record = existing
    ? finalizeBuilderProposalRecord({
        ...withoutFingerprint(existing),
        ...projection,
        currentRevisionId: revisionId,
        version,
        updatedAt: at,
        history: [...existing.history, event],
        revisions: [...existing.revisions, revision],
      })
    : finalizeBuilderProposalRecord({
        schemaVersion: 2,
        objectType: "builder-recorded-proposal",
        id: command.proposalId,
        projectId: command.projectId,
        ownerPrincipalType: "account",
        ownerPrincipalId: "local-builder-account",
        accountSide: "builder",
        scopeType: "project_private",
        scopeId: command.projectId,
        custodianService: "Proposal Domain Service",
        sensitivity: "private",
        source: "ثبت دستی سازنده",
        networkStatus: "خارج از شبکه چیدا",
        supplierAuthenticated: false,
        receivedThroughChida: false,
        externalEffect: "none",
        ...projection,
        currentRevisionId: revisionId,
        visibility: "خصوصی پروژه",
        localStatus: "ثبت محلی",
        version,
        createdAt: at,
        updatedAt: at,
        history: [event],
        revisions: [revision],
        legacyEvidence: null,
      });
  const receipt = finalWithFingerprint({
    schemaVersion: 1 as const,
    position: envelope.idempotencyReceipts.length + 1,
    key: command.idempotencyKey,
    action: command.action,
    payloadHash,
    projectId: command.projectId,
    recordId: command.proposalId,
    expectedStoreVersion: command.expectedStoreVersion,
    expectedRecordVersion: command.action === "update-proposal" ? command.expectedProposalVersion : null,
    commandPins: structuredClone(command.pins),
    expectedDependencySnapshotHash: command.pins.expectedDependencySnapshotHash,
    result: command.action === "create-proposal" ? "created" as const : "updated" as const,
    resultingStoreVersion: envelope.storeVersion + 1,
    resultingRecordVersion: version,
    eventId,
    revisionId,
    authorizationContextHash,
    recordedAt: at,
  });
  const records = envelope.records.filter((item) => item.id !== record.id).concat(record).sort((first, second) => compareIds(first.id, second.id));
  const candidate = finalizeBuilderProposalEnvelope({
    schemaVersion: 2,
    fingerprintVersion: "builder-proposal-domain-v2",
    storeVersion: envelope.storeVersion + 1,
    records,
    idempotencyReceipts: [...envelope.idempotencyReceipts, receipt],
    migrationReports: structuredClone(envelope.migrationReports),
    updatedAt: at,
  });
  return { candidate, raw: JSON.stringify(candidate), recordId: record.id, result: receipt.result };
}

function readMutationDependencies(reader: BuilderProposalDependencyReader): { status: "ready"; dependencies: BuilderProposalDependencies } | { status: "read-failure" } {
  try {
    const dependencies = reader();
    return dependenciesAreValid(dependencies) ? { status: "ready", dependencies } : { status: "read-failure" };
  } catch {
    return { status: "read-failure" };
  }
}

function rollbackBuilderProposalCandidate(previousRaw: string, candidateRaw: string): "write-failure" | "read-failure" {
  try {
    if (window.localStorage.getItem(builderProposalsStorageKey) !== candidateRaw) return "read-failure";
  } catch {
    return "read-failure";
  }
  try {
    window.localStorage.setItem(builderProposalsStorageKey, previousRaw);
  } catch {
    return "read-failure";
  }
  try {
    return window.localStorage.getItem(builderProposalsStorageKey) === previousRaw ? "write-failure" : "read-failure";
  } catch {
    return "read-failure";
  }
}

async function executeBuilderProposalCommandLocked(
  command: NormalizedBuilderProposalCommand,
  getDependencies: BuilderProposalDependencyReader,
): Promise<BuilderProposalMutationResult> {
  const dependencyRead = readMutationDependencies(getDependencies);
  if (dependencyRead.status !== "ready") return { status: "read-failure" };
  const dependencies = dependencyRead.dependencies;
  let markerRaw: string | null;
  let canonicalRaw: string | null;
  try {
    markerRaw = window.localStorage.getItem(builderProposalsCutoverMarkerKey);
    canonicalRaw = window.localStorage.getItem(builderProposalsStorageKey);
  } catch {
    return { status: "read-failure" };
  }
  const marker = parseCutoverMarkerRaw(markerRaw, dependencies.authority);
  const envelope = parseBuilderProposalEnvelopeRaw(canonicalRaw, dependencies.authority);
  if (!marker || marker.state !== "committed" || !envelope || canonicalRaw === null || !committedMarkerMatchesCanonical(marker, envelope, canonicalRaw)) return { status: "read-failure" };

  const authorizationContextHash = dependencies.authority.authorizationHashes[command.projectId];
  const priorReceipt = envelope.idempotencyReceipts.find((receipt) => receipt.key === command.idempotencyKey);
  if (priorReceipt) {
    if (!exactSha256(authorizationContextHash)) return { status: "idempotency-payload-mismatch" };
    const priorRecord = envelope.records.find((record) => record.id === priorReceipt.recordId && record.projectId === priorReceipt.projectId);
    const priorRevision = priorRecord?.revisions.find((revision) => revision.id === priorReceipt.revisionId && revision.version === priorReceipt.resultingRecordVersion);
    if (!priorRevision) return { status: "read-failure" };
    const payloadHash = builderProposalHash(commandPayload(
      command,
      priorRevision.target,
      priorRevision.contactPin,
      dependencies.authority.identityBindingHash as Sha256Fingerprint,
      authorizationContextHash,
    )) as Sha256Fingerprint;
    if (priorReceipt.action !== command.action
      || priorReceipt.payloadHash !== payloadHash
      || priorReceipt.projectId !== command.projectId
      || priorReceipt.recordId !== command.proposalId) return { status: "idempotency-payload-mismatch" };
    return { status: priorReceipt.result, envelope, recordId: priorReceipt.recordId };
  }

  if (!dependencies.authority.projectIds.includes(command.projectId) || !exactSha256(authorizationContextHash)) return { status: "scope-mismatch" };
  if (command.expectedStoreVersion !== envelope.storeVersion) return { status: "version-conflict" };
  const existing = envelope.records.find((record) => record.id === command.proposalId) ?? null;
  if (existing && existing.projectId !== command.projectId) return { status: "scope-mismatch" };
  if (command.action === "create-proposal" && existing) return { status: "version-conflict" };
  if (command.action === "create-proposal" && envelope.records.filter((record) => record.projectId === command.projectId).length >= 100) return { status: "version-conflict" };
  if (command.action === "update-proposal" && !existing) return { status: "not-found" };
  if (command.action === "update-proposal" && command.expectedProposalVersion !== existing!.version) return { status: "version-conflict" };

  const resolved = resolveBuilderProposalCommandDependencies(command, dependencies, existing);
  if ("status" in resolved) return { status: resolved.status };
  if (command.action === "update-proposal" && proposalProjectionIsUnchanged(existing!, resolved, command.draft)) {
    return { status: "unchanged", envelope, recordId: existing!.id };
  }

  const payloadHash = builderProposalHash(commandPayload(
    command,
    resolved.target,
    resolved.contactPin,
    dependencies.authority.identityBindingHash as Sha256Fingerprint,
    authorizationContextHash,
  )) as Sha256Fingerprint;
  const built = buildBuilderProposalCommandCandidate(command, dependencies, envelope, marker, existing, resolved, payloadHash);
  const parsedCandidate = parseBuilderProposalEnvelopeRaw(built.raw, dependencies.authority);
  if (!parsedCandidate || !committedMarkerMatchesCanonical(marker, parsedCandidate, built.raw)) return { status: "write-failure" };

  let prewriteMarkerRaw: string | null;
  let prewriteCanonicalRaw: string | null;
  try {
    prewriteMarkerRaw = window.localStorage.getItem(builderProposalsCutoverMarkerKey);
    prewriteCanonicalRaw = window.localStorage.getItem(builderProposalsStorageKey);
  } catch {
    return { status: "read-failure" };
  }
  const prewriteDependencyRead = readMutationDependencies(getDependencies);
  if (prewriteDependencyRead.status !== "ready") return { status: "read-failure" };
  if (!stableEqual(prewriteDependencyRead.dependencies, dependencies)) return { status: "dependency-invalid" };
  if (prewriteMarkerRaw !== markerRaw || prewriteCanonicalRaw !== canonicalRaw) return { status: "read-failure" };

  try {
    window.localStorage.setItem(builderProposalsStorageKey, built.raw);
  } catch {
    try {
      const currentRaw = window.localStorage.getItem(builderProposalsStorageKey);
      if (currentRaw === canonicalRaw) return { status: "write-failure" };
      if (currentRaw === built.raw) return { status: rollbackBuilderProposalCandidate(canonicalRaw, built.raw) };
      return { status: "read-failure" };
    } catch {
      return { status: "read-failure" };
    }
  }

  let postwriteCanonicalRaw: string | null;
  let postwriteMarkerRaw: string | null;
  try {
    postwriteCanonicalRaw = window.localStorage.getItem(builderProposalsStorageKey);
    postwriteMarkerRaw = window.localStorage.getItem(builderProposalsCutoverMarkerKey);
  } catch {
    return { status: rollbackBuilderProposalCandidate(canonicalRaw, built.raw) };
  }
  const postwriteDependencyRead = readMutationDependencies(getDependencies);
  const persisted = postwriteCanonicalRaw === built.raw
    ? parseBuilderProposalEnvelopeRaw(postwriteCanonicalRaw, dependencies.authority)
    : null;
  if (postwriteCanonicalRaw !== built.raw
    || postwriteMarkerRaw !== markerRaw
    || postwriteDependencyRead.status !== "ready"
    || postwriteDependencyRead.status === "ready" && !stableEqual(postwriteDependencyRead.dependencies, dependencies)
    || !persisted
    || !committedMarkerMatchesCanonical(marker, persisted, postwriteCanonicalRaw)) {
    return { status: rollbackBuilderProposalCandidate(canonicalRaw, built.raw) };
  }
  return { status: built.result, envelope: persisted, recordId: built.recordId };
}

export async function executeBuilderProposalCommand(
  value: unknown,
  getDependencies: BuilderProposalDependencyReader,
): Promise<BuilderProposalMutationResult> {
  let command: NormalizedBuilderProposalCommand | null;
  try {
    command = normalizeBuilderProposalCommand(value);
  } catch {
    command = null;
  }
  if (!command) return { status: "schema-invalid" };
  let manager: LockManager | undefined;
  try {
    manager = window.navigator.locks;
  } catch {
    return { status: "lock-unavailable" };
  }
  if (!manager?.request) return { status: "lock-unavailable" };
  try {
    return await manager.request(procurementDispatchWriteLockName, { mode: "exclusive" }, async () => {
      try {
        return await executeBuilderProposalCommandLocked(command!, getDependencies);
      } catch {
        return { status: "read-failure" };
      }
    });
  } catch {
    return { status: "lock-unavailable" };
  }
}

function readCommittedState(authority: ProcurementDispatchAuthority, dependencies: BuilderProposalDependencies | null): BuilderProposalState {
  try {
    const canonicalRaw = window.localStorage.getItem(builderProposalsStorageKey);
    const markerRaw = window.localStorage.getItem(builderProposalsCutoverMarkerKey);
    const marker = parseCutoverMarkerRaw(markerRaw, authority);
    const envelope = parseBuilderProposalEnvelopeRaw(canonicalRaw, authority);
    if (!marker || marker.state !== "committed" || !envelope || canonicalRaw === null
      || !committedMarkerMatchesCanonical(marker, envelope, canonicalRaw)) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
    return { status: "ready", envelope, dependencyStatus: dependencies ? dependencyStatus(envelope, dependencies) : "read-error" };
  } catch {
    return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
  }
}

function normalizeReadContext(value: BuilderProposalDependencies | BuilderProposalReadContext | null | unknown): { authority: ProcurementDispatchAuthority | null; dependencies: BuilderProposalDependencies | null } {
  if (dependenciesAreValid(value)) return { authority: value.authority, dependencies: value };
  if (!hasExactKeys(value, ["authority", "dependencies"])) return { authority: null, dependencies: null };
  const context = value as BuilderProposalReadContext;
  if (!authorityIsValid(context.authority)) return { authority: null, dependencies: null };
  const dependencies = dependenciesAreValid(context.dependencies) && stableEqual(context.dependencies.authority, context.authority) ? context.dependencies : null;
  return { authority: context.authority, dependencies };
}

export function readBuilderProposalState(input: BuilderProposalDependencies | BuilderProposalReadContext | null): BuilderProposalState {
  const context = normalizeReadContext(input);
  return context.authority ? readCommittedState(context.authority, context.dependencies) : { status: "read-error", envelope: null, dependencyStatus: "read-error" };
}

function exactStorageWrite(key: string, raw: string) {
  window.localStorage.setItem(key, raw);
  return window.localStorage.getItem(key) === raw;
}

function nextCutoverTimestamp(previous: string) {
  return new Date(Math.max(Date.now(), Date.parse(previous))).toISOString();
}

function readInitializationContext(reader: BuilderProposalInitializationReader) {
  try {
    return normalizeReadContext(reader());
  } catch {
    return { authority: null, dependencies: null };
  }
}

function readRequiredDependencies(reader: BuilderProposalInitializationReader) {
  return readInitializationContext(reader).dependencies;
}

async function initializeBuilderProposalsLocked(getDependencies: BuilderProposalInitializationReader): Promise<BuilderProposalState> {
  try {
    const initialContext = readInitializationContext(getDependencies);
    if (!initialContext.authority) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
    let dependencies = initialContext.dependencies;
    let canonicalRaw = window.localStorage.getItem(builderProposalsStorageKey);
    let markerRaw = window.localStorage.getItem(builderProposalsCutoverMarkerKey);
    if (markerRaw !== null) {
      const existingMarker = parseCutoverMarkerRaw(markerRaw, initialContext.authority);
      if (!existingMarker) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
      if (existingMarker.state === "committed") return readCommittedState(initialContext.authority, dependencies);
      if (existingMarker.state === "pending" && canonicalRaw !== null) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
      if (existingMarker.state === "verified" && canonicalRaw !== null && canonicalRaw !== existingMarker.candidateRaw) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
    } else if (canonicalRaw !== null) {
      return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
    }
    if (!dependencies) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };

    let marker: BuilderProposalPendingMarker | BuilderProposalVerifiedMarker;
    if (markerRaw === null) {
      const sourceRaw = window.localStorage.getItem(legacyBuilderProposalsStorageKey);
      const candidate = buildMigrationCandidate(sourceRaw, dependencies);
      if (!candidate) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
      const report = candidate.envelope.migrationReports[0];
      marker = finalizeMarker({
        schemaVersion: 1,
        store: "builder-proposal",
        state: "pending",
        migrationId: report.id,
        sourceGeneration: report.sourceGeneration,
        sourceKey: report.sourceKey,
        sourceRawHash: report.sourceRawHash,
        dependencySnapshotHash: report.dependencySnapshotHash,
        identityBindingHash: report.identityBindingHash,
        migrationAt: report.migratedAt,
        candidateRaw: candidate.raw,
        candidateRawHash: builderProposalHash(candidate.raw) as Sha256Fingerprint,
      });
      markerRaw = JSON.stringify(marker);
      if (!exactStorageWrite(builderProposalsCutoverMarkerKey, markerRaw)) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
    } else {
      const parsed = parseCutoverMarkerRaw(markerRaw, dependencies.authority);
      if (!parsed || parsed.state === "committed") return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
      marker = parsed;
    }

    let sourceRaw = window.localStorage.getItem(legacyBuilderProposalsStorageKey);
    dependencies = readRequiredDependencies(getDependencies);
    if (!dependencies || !currentSourceMatchesMarker(marker, sourceRaw) || !currentDependenciesMatchMarker(marker, sourceRaw, dependencies) || window.localStorage.getItem(builderProposalsCutoverMarkerKey) !== markerRaw) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
    if (marker.state === "pending") {
      const verified = finalizeMarker({
        ...withoutFingerprint(marker),
        state: "verified",
        verifiedAt: nextCutoverTimestamp(marker.migrationAt),
      }) as BuilderProposalVerifiedMarker;
      markerRaw = JSON.stringify(verified);
      if (!exactStorageWrite(builderProposalsCutoverMarkerKey, markerRaw)) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
      marker = verified;
    }

    sourceRaw = window.localStorage.getItem(legacyBuilderProposalsStorageKey);
    dependencies = readRequiredDependencies(getDependencies);
    canonicalRaw = window.localStorage.getItem(builderProposalsStorageKey);
    if (!dependencies || !currentSourceMatchesMarker(marker, sourceRaw) || !currentDependenciesMatchMarker(marker, sourceRaw, dependencies) || window.localStorage.getItem(builderProposalsCutoverMarkerKey) !== markerRaw || canonicalRaw !== null && canonicalRaw !== marker.candidateRaw) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
    if (canonicalRaw === null && !exactStorageWrite(builderProposalsStorageKey, marker.candidateRaw)) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
    canonicalRaw = window.localStorage.getItem(builderProposalsStorageKey);
    if (canonicalRaw !== marker.candidateRaw || !parseBuilderProposalEnvelopeRaw(canonicalRaw, dependencies.authority)) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };

    sourceRaw = window.localStorage.getItem(legacyBuilderProposalsStorageKey);
    dependencies = readRequiredDependencies(getDependencies);
    if (!dependencies || !currentSourceMatchesMarker(marker, sourceRaw) || !currentDependenciesMatchMarker(marker, sourceRaw, dependencies) || window.localStorage.getItem(builderProposalsCutoverMarkerKey) !== markerRaw || window.localStorage.getItem(builderProposalsStorageKey) !== marker.candidateRaw) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
    const committed = finalizeMarker({
      schemaVersion: 1,
      store: "builder-proposal",
      state: "committed",
      migrationId: marker.migrationId,
      sourceGeneration: marker.sourceGeneration,
      sourceKey: marker.sourceKey,
      sourceRawHash: marker.sourceRawHash,
      dependencySnapshotHash: marker.dependencySnapshotHash,
      identityBindingHash: marker.identityBindingHash,
      migrationAt: marker.migrationAt,
      verifiedAt: marker.verifiedAt,
      committedAt: nextCutoverTimestamp(marker.verifiedAt),
      canonicalRawHash: builderProposalHash(marker.candidateRaw) as Sha256Fingerprint,
      candidateRawHash: marker.candidateRawHash,
    }) as BuilderProposalCommittedMarker;
    if (!exactStorageWrite(builderProposalsCutoverMarkerKey, JSON.stringify(committed))) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
    return readCommittedState(dependencies.authority, dependencies);
  } catch {
    return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
  }
}

export async function initializeBuilderProposals(getDependencies: BuilderProposalInitializationReader): Promise<BuilderProposalState> {
  try {
    const manager = window.navigator.locks;
    if (!manager?.request) return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
    return await manager.request(procurementDispatchWriteLockName, { mode: "exclusive" }, () => initializeBuilderProposalsLocked(getDependencies));
  } catch {
    return { status: "read-error", envelope: null, dependencyStatus: "read-error" };
  }
}
