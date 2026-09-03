import {
  builderProposalsCutoverMarkerKey,
  builderProposalsStorageKey,
  builderProposalRecordIsCurrent,
  builderProposalRevisionIsCanonical,
  builderProposalRevisionFingerprintMatches,
  readBuilderProposalState,
  type BuilderProposalDependencies,
  type BuilderProposalEnvelope,
  type BuilderRecordedProposalLine,
  type BuilderRecordedProposalRecord,
  type BuilderRecordedProposalRequestSnapshot,
  type BuilderRecordedProposalRevision,
  type BuilderRecordedProposalSupplierSnapshot,
} from "./builderProposals";
import {
  procurementDispatchSha256Text,
  procurementDispatchWriteLockName,
  type ProcurementDispatchAuthority,
} from "./procurementDispatch";

export const legacyBuilderProductComparisonsStorageKey =
  "chida-prototype-builder-proposal-comparisons:v1";
export const builderProductComparisonsStorageKey =
  "chida-prototype-builder-proposal-comparisons:v2";
export const builderProductComparisonsCutoverMarkerKey =
  `${builderProductComparisonsStorageKey}:cutover:v1`;
export const builderProductComparisonsRollbackIncidentKey =
  `${builderProductComparisonsStorageKey}:rollback-incident:v1`;

export const legacyBuilderServiceComparisonsStorageKey =
  "chida-prototype-builder-service-proposal-comparisons:v1";
export const builderServiceComparisonsStorageKey =
  "chida-prototype-builder-service-proposal-comparisons:v2";
export const builderServiceComparisonsCutoverMarkerKey =
  `${builderServiceComparisonsStorageKey}:cutover:v1`;
export const builderServiceComparisonsRollbackIncidentKey =
  `${builderServiceComparisonsStorageKey}:rollback-incident:v1`;

const comparisonWriteLockName = procurementDispatchWriteLockName;

type Sha256Fingerprint = `sha256-${string}`;
type Fnv1aFingerprint = `fnv1a-${string}`;

function compareUnicodeCodePoints(left: string, right: string): number {
  const leftIterator = left[Symbol.iterator]();
  const rightIterator = right[Symbol.iterator]();
  while (true) {
    const leftPoint = leftIterator.next();
    const rightPoint = rightIterator.next();
    if (leftPoint.done || rightPoint.done) {
      if (leftPoint.done && rightPoint.done) return 0;
      return leftPoint.done ? -1 : 1;
    }
    const leftValue = leftPoint.value.codePointAt(0)!;
    const rightValue = rightPoint.value.codePointAt(0)!;
    if (leftValue !== rightValue) return leftValue < rightValue ? -1 : 1;
  }
}

function stableComparisonJson(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    return `[${Array.from({ length: value.length }, (_, index) => stableComparisonJson(value[index])).join(",")}]`;
  }
  if (typeof value === "object") {
    const fields: string[] = [];
    for (const [key, item] of Object.entries(value as Record<string, unknown>).sort(([left], [right]) => compareUnicodeCodePoints(left, right))) {
      fields.push(`${JSON.stringify(key)}:${stableComparisonJson(item)}`);
    }
    return `{${fields.join(",")}}`;
  }
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value) as string;
  if (typeof value === "number" && Number.isFinite(value)) return JSON.stringify(value) as string;
  throw new TypeError("Comparison hash requires a JSON value");
}

export function builderComparisonRawHash(raw: string): Sha256Fingerprint {
  return `sha256-${procurementDispatchSha256Text(raw)}`;
}

export function builderComparisonHash(value: unknown): Sha256Fingerprint {
  return builderComparisonRawHash(stableComparisonJson(value));
}

export type BuilderComparisonTargetPin = {
  requestId: string;
  requestVersion: number;
  reviewRevisionId: string;
  reviewRevisionFingerprint: Fnv1aFingerprint;
  requestKind: "product" | "service";
};

type BuilderComparisonOwnership = {
  ownerPrincipalType: "account";
  ownerPrincipalId: "local-builder-account";
  accountSide: "builder";
  scopeType: "project_private";
  scopeId: string;
  custodianService: "Comparison Domain Service";
  sensitivity: "private";
};

export type BuilderProposalComparisonBasis = "declared-total" | "unit-price-times-adjusted-quantity" | "unknown";
export type BuilderProposalComparisonTaxMode = "included" | "fixed" | "rate" | "unknown";
export type BuilderProposalComparisonTransportMode = "included" | "fixed" | "unknown";
export type BuilderProposalComparisonLineAdjustment = {
  proposalLineId: string;
  requestItemId: string;
  basis: BuilderProposalComparisonBasis;
  adjustedQuantity: string | null;
  adjustedQuantityUnit: string | null;
  assumption: string | null;
  source: "فرض ثبت‌شده توسط سازنده";
};
export type BuilderProposalComparisonMoneyTreatment<Mode extends string> = {
  mode: Mode;
  value: string | null;
  assumption: string | null;
  source: "فرض ثبت‌شده توسط سازنده";
};
export type BuilderProposalComparisonInput = {
  proposalId: string;
  proposalVersion: number;
  proposalRevisionId: string;
  proposalRevisionFingerprint: Sha256Fingerprint;
  proposalRevisionSnapshot: BuilderRecordedProposalRevision;
  supplierSnapshot: BuilderRecordedProposalSupplierSnapshot;
  lineAdjustments: BuilderProposalComparisonLineAdjustment[];
  taxTreatment: BuilderProposalComparisonMoneyTreatment<BuilderProposalComparisonTaxMode>;
  transportTreatment: BuilderProposalComparisonMoneyTreatment<BuilderProposalComparisonTransportMode>;
};
export type BuilderProposalComparisonLineResult = {
  proposalLineId: string;
  requestItemId: string;
  requestLabel: string;
  declaredSnapshot: BuilderRecordedProposalLine;
  calculation: {
    formulaVersion: "normalized-product-line-v1";
    formula: string;
    basisAmount: string | null;
    normalizedLineTotal: string | null;
    status: "complete" | "incomplete";
    missingReasons: string[];
    source: "محاسبهٔ قطعی محلی چیدا";
    rounding: "none";
  };
};
export type BuilderProposalComparisonProposalResult = {
  proposalId: string;
  supplierDisplayName: string;
  lines: BuilderProposalComparisonLineResult[];
  subtotal: string | null;
  taxAmount: string | null;
  transportAmount: string | null;
  normalizedTotal: string | null;
  coverage: "complete" | "incomplete";
  missingReasons: string[];
  source: "محاسبهٔ قطعی محلی چیدا";
};
export type BuilderProposalComparisonRecommendation = {
  criterion: "lowest-complete-normalized-total";
  status: "conditional" | "tie" | "insufficient-data";
  candidateProposalId: string | null;
  tiedProposalIds: string[];
  reason: string;
  source: "جمع‌بندی قاعده‌محور محلی";
};

export type BuilderServiceProposalComparisonCriterionId = "scope" | "location" | "size-or-volume" | "qualification" | "timing" | "method" | "in-scope" | "out-of-scope" | "warranty" | "payment-terms";
export type BuilderServiceProposalComparisonAssessment = "aligned" | "partial" | "different" | "unknown" | "not-applicable";
export type BuilderServiceProposalComparisonRequestSnapshot = {
  id: string;
  scope: string | null;
  location: string | null;
  sizeOrVolume: string | null;
  qualification: string | null;
  timing: string | null;
  method: string | null;
  inScope: string | null;
  outOfScope: string | null;
  warranty: string | null;
  paymentTerms: string | null;
};
export type BuilderServiceProposalComparisonCriterionInput = {
  criterionId: BuilderServiceProposalComparisonCriterionId;
  declaredValue: string | null;
  assessment: BuilderServiceProposalComparisonAssessment;
  rationale: string | null;
  declaredSource: "رونویسی تکمیلی سازنده برای مقایسه";
  assessmentSource: "ارزیابی سازنده";
};
export type BuilderServiceProposalComparisonInput = {
  proposalId: string;
  proposalVersion: number;
  proposalRevisionId: string;
  proposalRevisionFingerprint: Sha256Fingerprint;
  proposalRevisionSnapshot: BuilderRecordedProposalRevision;
  proposalLineId: string;
  serviceSpecId: string;
  supplierSnapshot: BuilderRecordedProposalSupplierSnapshot;
  criteria: BuilderServiceProposalComparisonCriterionInput[];
};
export type BuilderServiceProposalComparisonCriterionResult = BuilderServiceProposalComparisonCriterionInput & {
  requestValue: string | null;
  status: "assessed" | "unknown";
};
export type BuilderServiceProposalComparisonProposalResult = {
  proposalId: string;
  supplierDisplayName: string;
  declaredCommercialSnapshot: BuilderRecordedProposalLine;
  criteria: BuilderServiceProposalComparisonCriterionResult[];
  counts: { aligned: number; partial: number; different: number; unknown: number; notApplicable: number };
  coverage: "complete" | "incomplete";
  source: "ماتریس ساختاریافتهٔ محلی چیدا";
};
export type BuilderServiceProposalComparisonSummary = {
  formulaVersion: "service-coverage-v1";
  criterion: "all-service-criteria-reviewed";
  status: "ready-for-human-decision" | "needs-clarification";
  candidateProposalId: null;
  unknownCount: number;
  reasonCode: "criteria-need-clarification" | "all-criteria-reviewed";
  reason: string;
  source: "جمع‌بندی قاعده‌محور محلی";
};

export type BuilderComparisonEvent = {
  schemaVersion: 1;
  kind: "product" | "service";
  comparisonId: string;
  projectId: string;
  scopeId: string;
  id: string;
  type: "created" | "updated";
  actor: "شما";
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

export type BuilderProductComparisonRevision = {
  schemaVersion: 2;
  kind: "product";
  comparisonId: string;
  projectId: string;
  scopeId: string;
  target: BuilderComparisonTargetPin & { requestKind: "product" };
  id: string;
  version: number;
  createdAt: string;
  inputs: BuilderProposalComparisonInput[];
  results: BuilderProposalComparisonProposalResult[];
  recommendation: BuilderProposalComparisonRecommendation;
  fingerprint: Sha256Fingerprint;
};

export type BuilderServiceComparisonRevision = {
  schemaVersion: 2;
  kind: "service";
  comparisonId: string;
  projectId: string;
  scopeId: string;
  target: BuilderComparisonTargetPin & { requestKind: "service" };
  id: string;
  version: number;
  createdAt: string;
  inputs: BuilderServiceProposalComparisonInput[];
  results: BuilderServiceProposalComparisonProposalResult[];
  summary: BuilderServiceProposalComparisonSummary;
  fingerprint: Sha256Fingerprint;
};

export type BuilderComparisonLegacyEvidence = {
  schemaVersion: 1;
  kind: "product" | "service";
  sourceKey: typeof legacyBuilderProductComparisonsStorageKey | typeof legacyBuilderServiceComparisonsStorageKey;
  comparisonId: string;
  projectId: string;
  sourceGeneration: "v1-array";
  sourceIndex: number;
  sourceRecordHash: Sha256Fingerprint;
  sourceRecordVersion: number;
  sourceCreatedAt: string;
  sourceUpdatedAt: string;
  revisionLinks: Array<{
    revisionId: string;
    revisionVersion: number;
    sourceRevisionValueHash: Sha256Fingerprint;
    proposalFingerprintClaims: Array<{
      proposalId: string;
      proposalRevisionId: string;
      claimedFingerprint: Fnv1aFingerprint | Sha256Fingerprint;
    }>;
    legacyFingerprint: Fnv1aFingerprint;
    canonicalFingerprint: Sha256Fingerprint;
  }>;
  fingerprint: Sha256Fingerprint;
};

export type BuilderProductComparisonRecord = BuilderComparisonOwnership & {
  schemaVersion: 2;
  objectType: "builder-product-proposal-comparison";
  id: string;
  projectId: string;
  purpose: "compare-builder-recorded-product-proposals";
  target: BuilderComparisonTargetPin & { requestKind: "product" };
  requestSnapshot: BuilderRecordedProposalRequestSnapshot;
  currentRevisionId: string;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  externalEffect: "none";
  networkUsed: false;
  aiUsed: false;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: BuilderComparisonEvent[];
  revisions: BuilderProductComparisonRevision[];
  legacyEvidence: BuilderComparisonLegacyEvidence | null;
  fingerprint: Sha256Fingerprint;
};

export type BuilderServiceComparisonRecord = BuilderComparisonOwnership & {
  schemaVersion: 2;
  objectType: "builder-service-proposal-comparison";
  id: string;
  projectId: string;
  purpose: "compare-builder-recorded-service-proposals";
  target: BuilderComparisonTargetPin & { requestKind: "service" };
  requestSnapshot: BuilderServiceProposalComparisonRequestSnapshot;
  currentRevisionId: string;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  externalEffect: "none";
  networkUsed: false;
  aiUsed: false;
  scoringUsed: false;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: BuilderComparisonEvent[];
  revisions: BuilderServiceComparisonRevision[];
  legacyEvidence: BuilderComparisonLegacyEvidence | null;
  fingerprint: Sha256Fingerprint;
};

export type BuilderComparisonProposalCommandPin = {
  proposalId: string;
  proposalVersion: number;
  proposalRevisionId: string;
  proposalRevisionFingerprint: Sha256Fingerprint;
  proposalRevisionSnapshotHash: Sha256Fingerprint;
};

export type BuilderProductComparisonCommandPins = {
  schemaVersion: 1;
  kind: "product";
  authorizationContextHash: Sha256Fingerprint;
  identityBindingHash: Sha256Fingerprint;
  proposalStoreVersion: number;
  proposalEnvelopeFingerprint: Sha256Fingerprint;
  proposalDependencySnapshotHash: Sha256Fingerprint;
  target: BuilderComparisonTargetPin & { requestKind: "product" };
  requestSnapshotHash: Sha256Fingerprint;
  proposalPins: BuilderComparisonProposalCommandPin[];
  expectedDependencySnapshotHash: Sha256Fingerprint;
};

export type BuilderServiceComparisonCommandPins = {
  schemaVersion: 1;
  kind: "service";
  authorizationContextHash: Sha256Fingerprint;
  identityBindingHash: Sha256Fingerprint;
  proposalStoreVersion: number;
  proposalEnvelopeFingerprint: Sha256Fingerprint;
  proposalDependencySnapshotHash: Sha256Fingerprint;
  target: BuilderComparisonTargetPin & { requestKind: "service" };
  requestSnapshotHash: Sha256Fingerprint;
  serviceRequestSnapshotHash: Sha256Fingerprint;
  proposalPins: BuilderComparisonProposalCommandPin[];
  expectedDependencySnapshotHash: Sha256Fingerprint;
};

export type BuilderComparisonCommandReceipt = {
  schemaVersion: 1;
  position: number;
  key: string;
  kind: "product" | "service";
  action: "create-comparison" | "update-comparison";
  payloadHash: Sha256Fingerprint;
  projectId: string;
  recordId: string;
  expectedStoreVersion: number;
  expectedRecordVersion: number | null;
  commandPins: BuilderProductComparisonCommandPins | BuilderServiceComparisonCommandPins;
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

export type BuilderComparisonMigrationReport = {
  schemaVersion: 1;
  id: string;
  store: "builder-product-comparison" | "builder-service-comparison";
  sourceGeneration: "none" | "v1-array";
  sourceKey: typeof legacyBuilderProductComparisonsStorageKey | typeof legacyBuilderServiceComparisonsStorageKey | null;
  sourceRawHash: Sha256Fingerprint | null;
  dependencySnapshotHash: Sha256Fingerprint;
  identityBindingHash: Sha256Fingerprint;
  migratedAt: string;
  recordCount: number;
  migratedRecordFingerprints: Sha256Fingerprint[];
  migratedRevisionCount: number;
  fingerprint: Sha256Fingerprint;
};

export type BuilderProductComparisonEnvelope = {
  schemaVersion: 2;
  fingerprintVersion: "builder-product-comparison-domain-v2";
  storeVersion: number;
  records: BuilderProductComparisonRecord[];
  idempotencyReceipts: BuilderComparisonCommandReceipt[];
  migrationReports: [BuilderComparisonMigrationReport];
  updatedAt: string;
  fingerprint: Sha256Fingerprint;
};

export type BuilderServiceComparisonEnvelope = {
  schemaVersion: 2;
  fingerprintVersion: "builder-service-comparison-domain-v2";
  storeVersion: number;
  records: BuilderServiceComparisonRecord[];
  idempotencyReceipts: BuilderComparisonCommandReceipt[];
  migrationReports: [BuilderComparisonMigrationReport];
  updatedAt: string;
  fingerprint: Sha256Fingerprint;
};

export type BuilderComparisonReadContext = {
  authority: ProcurementDispatchAuthority | null;
  dependencies: BuilderProposalDependencies | null;
};

export type BuilderComparisonContextReader = () => BuilderComparisonReadContext;

export type BuilderComparisonState<TEnvelope> =
  | { status: "loading"; envelope: null; dependencyStatus: "unknown" }
  | { status: "read-error"; envelope: null; dependencyStatus: "read-error"; reason: string }
  | { status: "ready"; envelope: TEnvelope; dependencyStatus: "current" | "read-error" };

export type BuilderProposalComparisonLineAdjustmentDraft = {
  proposalLineId: string;
  requestItemId: string;
  basis: BuilderProposalComparisonBasis;
  adjustedQuantity: string;
  adjustedQuantityUnit: string;
  assumption: string;
};
export type BuilderProposalComparisonProposalDraft = {
  proposalId: string;
  selected: boolean;
  lineAdjustments: BuilderProposalComparisonLineAdjustmentDraft[];
  taxMode: BuilderProposalComparisonTaxMode;
  taxValue: string;
  taxAssumption: string;
  transportMode: BuilderProposalComparisonTransportMode;
  transportValue: string;
  transportAssumption: string;
};
export type BuilderProductComparisonDraft = { requestKey: string; proposals: BuilderProposalComparisonProposalDraft[] };
export type BuilderProposalComparisonDraft = BuilderProductComparisonDraft;

export type BuilderServiceProposalComparisonCriterionDraft = {
  criterionId: BuilderServiceProposalComparisonCriterionId;
  declaredValue: string;
  assessment: BuilderServiceProposalComparisonAssessment;
  rationale: string;
};
export type BuilderServiceProposalComparisonProposalDraft = {
  proposalId: string;
  selected: boolean;
  criteria: BuilderServiceProposalComparisonCriterionDraft[];
};
export type BuilderServiceComparisonDraft = { requestKey: string; proposals: BuilderServiceProposalComparisonProposalDraft[] };
export type BuilderServiceProposalComparisonDraft = BuilderServiceComparisonDraft;

export type BuilderProductComparisonCommand =
  | { inputSchemaVersion: 1; action: "create-comparison"; kind: "product"; projectId: string; comparisonId: string; draft: BuilderProductComparisonDraft; pins: BuilderProductComparisonCommandPins; expectedStoreVersion: number; idempotencyKey: string }
  | { inputSchemaVersion: 1; action: "update-comparison"; kind: "product"; projectId: string; comparisonId: string; draft: BuilderProductComparisonDraft; pins: BuilderProductComparisonCommandPins; expectedStoreVersion: number; expectedComparisonVersion: number; idempotencyKey: string };
export type BuilderServiceComparisonCommand =
  | { inputSchemaVersion: 1; action: "create-comparison"; kind: "service"; projectId: string; comparisonId: string; draft: BuilderServiceComparisonDraft; pins: BuilderServiceComparisonCommandPins; expectedStoreVersion: number; idempotencyKey: string }
  | { inputSchemaVersion: 1; action: "update-comparison"; kind: "service"; projectId: string; comparisonId: string; draft: BuilderServiceComparisonDraft; pins: BuilderServiceComparisonCommandPins; expectedStoreVersion: number; expectedComparisonVersion: number; idempotencyKey: string };
export type BuilderComparisonCommand = BuilderProductComparisonCommand | BuilderServiceComparisonCommand;
export type BuilderComparisonMutationStatus = "created" | "updated" | "unchanged" | "version-conflict" | "dependency-invalid" | "idempotency-payload-mismatch" | "write-failure" | "rollback-failure" | "read-failure" | "lock-unavailable" | "schema-invalid" | "scope-mismatch" | "not-found";
export type BuilderComparisonMutationResult = { status: BuilderComparisonMutationStatus; envelope?: BuilderProductComparisonEnvelope | BuilderServiceComparisonEnvelope; recordId?: string; reason?: string };

export const builderServiceProposalComparisonCriteriaV1: readonly {
  id: BuilderServiceProposalComparisonCriterionId;
  label: string;
  requestField: keyof Omit<BuilderServiceProposalComparisonRequestSnapshot, "id">;
}[] = [
  { id: "scope", label: "دامنهٔ کار", requestField: "scope" },
  { id: "location", label: "موقعیت اجرا", requestField: "location" },
  { id: "size-or-volume", label: "اندازه یا حجم", requestField: "sizeOrVolume" },
  { id: "qualification", label: "صلاحیت", requestField: "qualification" },
  { id: "timing", label: "مدت و زمان اجرا", requestField: "timing" },
  { id: "method", label: "روش اجرا", requestField: "method" },
  { id: "in-scope", label: "موارد داخل کار", requestField: "inScope" },
  { id: "out-of-scope", label: "موارد خارج از کار", requestField: "outOfScope" },
  { id: "warranty", label: "ضمانت اعلامی", requestField: "warranty" },
  { id: "payment-terms", label: "شرایط پرداخت", requestField: "paymentTerms" },
];

function hasExactKeys(value: unknown, keys: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value as Record<string, unknown>).sort(compareUnicodeCodePoints);
  const expected = [...keys].sort(compareUnicodeCodePoints);
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function isExactDenseArray(value: unknown): value is unknown[] {
  if (!Array.isArray(value) || Object.getOwnPropertySymbols(value).length !== 0) return false;
  const names = Object.getOwnPropertyNames(value);
  if (names.length !== value.length + 1 || names.at(-1) !== "length") return false;
  for (let index = 0; index < value.length; index += 1) {
    if (names[index] !== String(index)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !("value" in descriptor) || !descriptor.enumerable || !descriptor.configurable || !descriptor.writable) return false;
  }
  return true;
}

function withoutFingerprint<T extends { fingerprint: string }>(value: T): Omit<T, "fingerprint"> {
  const { fingerprint: _fingerprint, ...payload } = value;
  return payload;
}

function exactString(value: unknown, maximumLength = 300): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maximumLength && value.trim() === value;
}

function visibleString(value: unknown, maximumLength: number): value is string {
  return exactString(value, maximumLength) && /[\p{L}\p{N}\p{P}\p{S}]/u.test(value.normalize("NFKC"));
}

function optionalVisibleString(value: unknown, maximumLength: number): value is string | null {
  return value === null || visibleString(value, maximumLength);
}

function exactInteger(value: unknown, minimum = 1): value is number {
  return Number.isSafeInteger(value) && (value as number) >= minimum;
}

function exactDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value;
}

function exactSha256(value: unknown): value is Sha256Fingerprint {
  return typeof value === "string" && /^sha256-[0-9a-f]{64}$/.test(value);
}

function exactFnv1a(value: unknown): value is Fnv1aFingerprint {
  return typeof value === "string" && /^fnv1a-[0-9a-f]{8}$/.test(value);
}

function stableEqual(first: unknown, second: unknown) {
  return stableComparisonJson(first) === stableComparisonJson(second);
}

function exactDeepEqual(first: unknown, second: unknown): boolean {
  if (Object.is(first, second)) return true;
  if (Array.isArray(first) || Array.isArray(second)) {
    return Array.isArray(first) && Array.isArray(second) && first.length === second.length
      && first.every((item, index) => exactDeepEqual(item, second[index]));
  }
  if (!first || !second || typeof first !== "object" || typeof second !== "object") return false;
  const firstRecord = first as Record<string, unknown>;
  const secondRecord = second as Record<string, unknown>;
  const keys = Object.keys(firstRecord);
  return keys.length === Object.keys(secondRecord).length
    && keys.every((key) => Object.prototype.hasOwnProperty.call(secondRecord, key) && exactDeepEqual(firstRecord[key], secondRecord[key]));
}

function finalWithFingerprint<T extends object>(payload: T): T & { fingerprint: Sha256Fingerprint } {
  return { ...payload, fingerprint: builderComparisonHash(payload) } as T & { fingerprint: Sha256Fingerprint };
}

function normalizeComparisonText(value: string, maximumLength: number) {
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.length <= maximumLength ? normalized : undefined;
}

function normalizeComparisonNumberText(value: string) {
  const normalized = value.trim()
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[٬,\s]/g, "")
    .replace("٫", ".");
  if (!normalized) return null;
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return undefined;
  const [integer, fraction = ""] = normalized.split(".");
  const canonicalInteger = integer.replace(/^0+(?=\d)/, "") || "0";
  const canonicalFraction = fraction.replace(/0+$/, "");
  return canonicalFraction ? `${canonicalInteger}.${canonicalFraction}` : canonicalInteger;
}

function builderProposalComparisonDecimalParts(value: string) {
  if (!/^(?:0|[1-9]\d*)(?:\.\d*[1-9])?$/.test(value)) return null;
  const [integer, fraction = ""] = value.split(".");
  if (integer.length + fraction.length > 200 || fraction.length > 60) return null;
  return { coefficient: BigInt(`${integer}${fraction}`), scale: fraction.length };
}

function builderProposalComparisonDecimalFromParts(coefficient: bigint, scale: number) {
  while (scale > 0 && coefficient % 10n === 0n) {
    coefficient /= 10n;
    scale -= 1;
  }
  let digits = coefficient.toString();
  if (scale > 60 || Math.max(digits.length, scale + 1) > 200) return null;
  if (scale === 0) return digits;
  digits = digits.padStart(scale + 1, "0");
  const integer = digits.slice(0, -scale);
  const fraction = digits.slice(-scale).replace(/0+$/, "");
  return fraction ? `${integer}.${fraction}` : integer;
}

function builderProposalComparisonMultiply(first: string, second: string) {
  const firstParts = builderProposalComparisonDecimalParts(first);
  const secondParts = builderProposalComparisonDecimalParts(second);
  if (!firstParts || !secondParts) return null;
  return builderProposalComparisonDecimalFromParts(firstParts.coefficient * secondParts.coefficient, firstParts.scale + secondParts.scale);
}

function builderProposalComparisonAdd(values: string[]) {
  if (!values.length) return "0";
  const parts = values.map(builderProposalComparisonDecimalParts);
  if (parts.some((item) => !item)) return null;
  const scale = parts.reduce((maximum, item) => Math.max(maximum, item!.scale), 0);
  const coefficient = parts.reduce((total, item) => total + item!.coefficient * 10n ** BigInt(scale - item!.scale), 0n);
  return builderProposalComparisonDecimalFromParts(coefficient, scale);
}

function builderProposalComparisonPercent(amount: string, rate: string) {
  const amountParts = builderProposalComparisonDecimalParts(amount);
  const rateParts = builderProposalComparisonDecimalParts(rate);
  if (!amountParts || !rateParts) return null;
  return builderProposalComparisonDecimalFromParts(
    amountParts.coefficient * rateParts.coefficient,
    amountParts.scale + rateParts.scale + 2,
  );
}

function builderProposalComparisonCompare(first: string, second: string) {
  const firstParts = builderProposalComparisonDecimalParts(first);
  const secondParts = builderProposalComparisonDecimalParts(second);
  if (!firstParts || !secondParts) return null;
  const scale = Math.max(firstParts.scale, secondParts.scale);
  const firstCoefficient = firstParts.coefficient * 10n ** BigInt(scale - firstParts.scale);
  const secondCoefficient = secondParts.coefficient * 10n ** BigInt(scale - secondParts.scale);
  return firstCoefficient < secondCoefficient ? -1 : firstCoefficient > secondCoefficient ? 1 : 0;
}

function normalizeBuilderProposalComparisonNumber(value: string, allowZero: boolean) {
  const normalized = normalizeComparisonNumberText(value);
  if (normalized === null || normalized === undefined || !builderProposalComparisonDecimalParts(normalized)) return undefined;
  if (!allowZero && builderProposalComparisonCompare(normalized, "0") !== 1) return undefined;
  return normalized;
}

function normalizeBuilderProposalComparisonTreatment<Mode extends string>(
  mode: Mode,
  value: string,
  assumption: string,
  modes: { included: Mode; fixed: Mode; unknown: Mode; rate?: Mode },
): BuilderProposalComparisonMoneyTreatment<Mode> | null {
  const normalizedAssumption = normalizeComparisonText(assumption, 500);
  if (normalizedAssumption === undefined) return null;
  if (mode === modes.unknown) {
    if (value.trim() || normalizedAssumption !== null) return null;
    return { mode, value: null, assumption: null, source: "فرض ثبت‌شده توسط سازنده" };
  }
  if (mode === modes.included) {
    if (value.trim() || normalizedAssumption === null) return null;
    return { mode, value: null, assumption: normalizedAssumption, source: "فرض ثبت‌شده توسط سازنده" };
  }
  if (mode === modes.fixed || modes.rate && mode === modes.rate) {
    const normalizedValue = normalizeBuilderProposalComparisonNumber(value, true);
    if (normalizedValue === undefined || normalizedAssumption === null) return null;
    return { mode, value: normalizedValue, assumption: normalizedAssumption, source: "فرض ثبت‌شده توسط سازنده" };
  }
  return null;
}

export function builderProposalComparisonRequestKey(proposal: BuilderRecordedProposalRecord) {
  return [proposal.target.requestId, proposal.target.requestVersion, proposal.target.reviewRevisionId, proposal.target.reviewRevisionFingerprint].join(":");
}

export function builderProposalComparisonDefaultDraft(proposals: BuilderRecordedProposalRecord[], requestKey: string): BuilderProductComparisonDraft {
  return {
    requestKey,
    proposals: proposals.filter((proposal) => builderProposalComparisonRequestKey(proposal) === requestKey).slice(0, 8).map((proposal) => {
      const revision = proposal.revisions.find((item) => item.id === proposal.currentRevisionId)!;
      return {
        proposalId: proposal.id,
        selected: true,
        lineAdjustments: revision.lines.map((line) => {
          const requested = proposal.requestSnapshot.items.find((item) => item.id === line.requestItemId);
          const exactDeclaredTotal = line.status === "quoted" && line.totalPrice !== null && line.quantity !== null && line.unit !== null && line.quantity === requested?.quantity && line.unit === requested?.unit;
          return { proposalLineId: line.id, requestItemId: line.requestItemId!, basis: exactDeclaredTotal ? "declared-total" as const : "unknown" as const, adjustedQuantity: "", adjustedQuantityUnit: "", assumption: "" };
        }),
        taxMode: "unknown" as const,
        taxValue: "",
        taxAssumption: "",
        transportMode: "unknown" as const,
        transportValue: "",
        transportAssumption: "",
      };
    }),
  };
}

export function builderProposalComparisonDraftFromRecord(record: BuilderProductComparisonRecord): BuilderProductComparisonDraft {
  const revision = record.revisions.find((item) => item.id === record.currentRevisionId)!;
  return {
    requestKey: [record.target.requestId, record.target.requestVersion, record.target.reviewRevisionId, record.target.reviewRevisionFingerprint].join(":"),
    proposals: revision.inputs.map((input) => ({
      proposalId: input.proposalId,
      selected: true,
      lineAdjustments: input.lineAdjustments.map((adjustment) => ({ proposalLineId: adjustment.proposalLineId, requestItemId: adjustment.requestItemId, basis: adjustment.basis, adjustedQuantity: adjustment.adjustedQuantity ?? "", adjustedQuantityUnit: adjustment.adjustedQuantityUnit ?? "", assumption: adjustment.assumption ?? "" })),
      taxMode: input.taxTreatment.mode,
      taxValue: input.taxTreatment.value ?? "",
      taxAssumption: input.taxTreatment.assumption ?? "",
      transportMode: input.transportTreatment.mode,
      transportValue: input.transportTreatment.value ?? "",
      transportAssumption: input.transportTreatment.assumption ?? "",
    })),
  };
}

export function normalizeBuilderProposalComparisonInputs(draft: BuilderProductComparisonDraft, proposals: BuilderRecordedProposalRecord[]) {
  const selectedDrafts = draft.proposals.filter((item) => item.selected);
  if (selectedDrafts.length < 2 || selectedDrafts.length > 8 || new Set(selectedDrafts.map((item) => item.proposalId)).size !== selectedDrafts.length) return null;
  const inputs = selectedDrafts.flatMap((proposalDraft): BuilderProposalComparisonInput[] => {
    const proposal = proposals.find((item) => item.id === proposalDraft.proposalId && builderProposalComparisonRequestKey(item) === draft.requestKey);
    const revision = proposal?.revisions.find((item) => item.id === proposal.currentRevisionId);
    if (!proposal || !revision || proposal.target.requestKind !== "product" || proposalDraft.lineAdjustments.length !== revision.lines.length) return [];
    const adjustments = proposalDraft.lineAdjustments.flatMap((adjustmentDraft, index): BuilderProposalComparisonLineAdjustment[] => {
      const sourceLine = revision.lines[index];
      if (!sourceLine || !sourceLine.requestItemId || adjustmentDraft.proposalLineId !== sourceLine.id || adjustmentDraft.requestItemId !== sourceLine.requestItemId) return [];
      if (adjustmentDraft.basis === "declared-total") {
        const requested = proposal.requestSnapshot.items.find((item) => item.id === sourceLine.requestItemId);
        if (sourceLine.status !== "quoted" || sourceLine.totalPrice === null || sourceLine.quantity === null || sourceLine.unit === null || sourceLine.quantity !== requested?.quantity || sourceLine.unit !== requested?.unit || adjustmentDraft.adjustedQuantity.trim() || adjustmentDraft.adjustedQuantityUnit.trim() || adjustmentDraft.assumption.trim()) return [];
        return [{ proposalLineId: sourceLine.id, requestItemId: sourceLine.requestItemId, basis: "declared-total", adjustedQuantity: null, adjustedQuantityUnit: null, assumption: null, source: "فرض ثبت‌شده توسط سازنده" }];
      }
      if (adjustmentDraft.basis === "unit-price-times-adjusted-quantity") {
        const adjustedQuantity = normalizeBuilderProposalComparisonNumber(adjustmentDraft.adjustedQuantity, false);
        const adjustedQuantityUnit = normalizeComparisonText(adjustmentDraft.adjustedQuantityUnit, 80);
        const assumption = normalizeComparisonText(adjustmentDraft.assumption, 500);
        if (sourceLine.status !== "quoted" || sourceLine.unitPrice === null || sourceLine.unit === null || adjustedQuantity === undefined || adjustedQuantityUnit === null || adjustedQuantityUnit === undefined || adjustedQuantityUnit !== sourceLine.unit || assumption === null || assumption === undefined) return [];
        return [{ proposalLineId: sourceLine.id, requestItemId: sourceLine.requestItemId, basis: "unit-price-times-adjusted-quantity", adjustedQuantity, adjustedQuantityUnit, assumption, source: "فرض ثبت‌شده توسط سازنده" }];
      }
      if (adjustmentDraft.basis !== "unknown" || adjustmentDraft.adjustedQuantity.trim() || adjustmentDraft.adjustedQuantityUnit.trim() || adjustmentDraft.assumption.trim()) return [];
      return [{ proposalLineId: sourceLine.id, requestItemId: sourceLine.requestItemId, basis: "unknown", adjustedQuantity: null, adjustedQuantityUnit: null, assumption: null, source: "فرض ثبت‌شده توسط سازنده" }];
    });
    const taxTreatment = normalizeBuilderProposalComparisonTreatment(proposalDraft.taxMode, proposalDraft.taxValue, proposalDraft.taxAssumption, { included: "included", fixed: "fixed", rate: "rate", unknown: "unknown" });
    const transportTreatment = normalizeBuilderProposalComparisonTreatment(proposalDraft.transportMode, proposalDraft.transportValue, proposalDraft.transportAssumption, { included: "included", fixed: "fixed", unknown: "unknown" });
    if (adjustments.length !== revision.lines.length || !taxTreatment || !transportTreatment) return [];
    return [{ proposalId: proposal.id, proposalVersion: revision.version, proposalRevisionId: revision.id, proposalRevisionFingerprint: revision.fingerprint, proposalRevisionSnapshot: structuredClone(revision), supplierSnapshot: structuredClone(proposal.supplierSnapshot), lineAdjustments: adjustments, taxTreatment, transportTreatment }];
  });
  return inputs.length === selectedDrafts.length ? inputs : null;
}

function productProposalRevisionForInput(input: BuilderProposalComparisonInput, proposals?: BuilderRecordedProposalRecord[]) {
  if (input.proposalRevisionSnapshot) return input.proposalRevisionSnapshot;
  const proposal = proposals?.find((item) => item.id === input.proposalId && item.target.requestKind === "product");
  return proposal?.revisions.find((item) => item.id === input.proposalRevisionId
    && item.version === input.proposalVersion
    && builderProposalRevisionFingerprintMatches(proposal, item, input.proposalRevisionFingerprint)) ?? null;
}

export function deriveBuilderProposalComparisonPayload(inputs: BuilderProposalComparisonInput[], proposals?: BuilderRecordedProposalRecord[]) {
  const results = inputs.flatMap((input): BuilderProposalComparisonProposalResult[] => {
    const revision = productProposalRevisionForInput(input, proposals);
    if (!revision || input.lineAdjustments.length !== revision.lines.length || !stableEqual(input.supplierSnapshot, revision.supplierSnapshot)) return [];
    const lines = revision.lines.map((line, index): BuilderProposalComparisonLineResult => {
      const adjustment = input.lineAdjustments[index];
      const missingReasons: string[] = [];
      let basisAmount: string | null = null;
      let formula = "مبنای محاسبه مشخص نشده است.";
      if (!adjustment || adjustment.proposalLineId !== line.id || adjustment.requestItemId !== line.requestItemId) {
        missingReasons.push("پیوند قلم پیشنهاد با درخواست معتبر نیست.");
      } else if (line.status !== "quoted") {
        missingReasons.push(line.status === "alternative" ? "قلم جایگزین است و هم‌ارزی آن تأیید نشده است." : line.status === "unavailable" ? "این قلم ناموجود ثبت شده است." : "برای این قلم دادهٔ اعلامی ثبت نشده است.");
      } else if (adjustment.basis === "declared-total" && line.totalPrice !== null) {
        basisAmount = line.totalPrice;
        formula = `قیمت کل اعلامی ${line.totalPrice} تومان`;
      } else if (adjustment.basis === "unit-price-times-adjusted-quantity" && line.unitPrice !== null && adjustment.adjustedQuantity !== null) {
        basisAmount = builderProposalComparisonMultiply(line.unitPrice, adjustment.adjustedQuantity);
        formula = `${line.unitPrice} × ${adjustment.adjustedQuantity} ${adjustment.adjustedQuantityUnit ?? ""}`.trim();
        if (basisAmount === null) missingReasons.push("محدودهٔ عددی این محاسبه پشتیبانی نمی‌شود.");
      } else {
        missingReasons.push("مبنای مبلغ هم‌سطح مشخص نشده است.");
      }
      if (line.status === "quoted" && basisAmount === null && !missingReasons.length) missingReasons.push("محاسبهٔ مبلغ این قلم کامل نیست.");
      return {
        proposalLineId: line.id,
        requestItemId: line.requestItemId!,
        requestLabel: line.requestLabel,
        declaredSnapshot: structuredClone(line),
        calculation: {
          formulaVersion: "normalized-product-line-v1",
          formula,
          basisAmount,
          normalizedLineTotal: missingReasons.length ? null : basisAmount,
          status: missingReasons.length ? "incomplete" : "complete",
          missingReasons,
          source: "محاسبهٔ قطعی محلی چیدا",
          rounding: "none",
        },
      };
    });
    const lineTotals = lines.map((line) => line.calculation.normalizedLineTotal).filter((value): value is string => value !== null);
    const missingReasons = lines.flatMap((line) => line.calculation.missingReasons.map((reason) => `${line.requestLabel}: ${reason}`));
    const subtotal = lineTotals.length === lines.length ? builderProposalComparisonAdd(lineTotals) : null;
    if (lineTotals.length === lines.length && subtotal === null) missingReasons.push("جمع اقلام از محدودهٔ عددی پشتیبانی‌شده خارج است.");
    let taxAmount: string | null = null;
    if (input.taxTreatment.mode === "included") taxAmount = "0";
    else if (input.taxTreatment.mode === "fixed") taxAmount = input.taxTreatment.value;
    else if (input.taxTreatment.mode === "rate" && subtotal !== null && input.taxTreatment.value !== null) taxAmount = builderProposalComparisonPercent(subtotal, input.taxTreatment.value);
    else missingReasons.push("وضعیت یا مبلغ مالیات برای هم‌سطح‌سازی مشخص نیست.");
    let transportAmount: string | null = null;
    if (input.transportTreatment.mode === "included") transportAmount = "0";
    else if (input.transportTreatment.mode === "fixed") transportAmount = input.transportTreatment.value;
    else missingReasons.push("وضعیت یا مبلغ حمل برای هم‌سطح‌سازی مشخص نیست.");
    if (input.taxTreatment.mode === "rate" && subtotal !== null && taxAmount === null) missingReasons.push("محاسبهٔ نرخ مالیات از محدودهٔ عددی پشتیبانی‌شده خارج است.");
    const normalizedTotal = subtotal !== null && taxAmount !== null && transportAmount !== null && missingReasons.length === 0 ? builderProposalComparisonAdd([subtotal, taxAmount, transportAmount]) : null;
    if (subtotal !== null && taxAmount !== null && transportAmount !== null && missingReasons.length === 0 && normalizedTotal === null) missingReasons.push("مبلغ نهایی از محدودهٔ عددی پشتیبانی‌شده خارج است.");
    return [{
      proposalId: input.proposalId,
      supplierDisplayName: input.supplierSnapshot.displayName,
      lines,
      subtotal,
      taxAmount,
      transportAmount,
      normalizedTotal,
      coverage: normalizedTotal === null ? "incomplete" : "complete",
      missingReasons,
      source: "محاسبهٔ قطعی محلی چیدا",
    }];
  });
  if (results.length !== inputs.length) return null;
  const completeResults = results.filter((result) => result.normalizedTotal !== null);
  let recommendation: BuilderProposalComparisonRecommendation;
  if (completeResults.length !== results.length) {
    recommendation = { criterion: "lowest-complete-normalized-total", status: "insufficient-data", candidateProposalId: null, tiedProposalIds: [], reason: "برای همهٔ پیشنهادهای انتخاب‌شده پوشش و مبلغ هم‌سطح کامل وجود ندارد؛ جمع‌بندی عددی ساخته نشد.", source: "جمع‌بندی قاعده‌محور محلی" };
  } else {
    let minimum = completeResults[0]?.normalizedTotal ?? null;
    let comparisonFailed = minimum === null;
    for (let index = 1; index < completeResults.length && minimum !== null; index += 1) {
      const comparison = builderProposalComparisonCompare(completeResults[index].normalizedTotal!, minimum);
      if (comparison === null) comparisonFailed = true;
      else if (comparison === -1) minimum = completeResults[index].normalizedTotal!;
    }
    const tied = comparisonFailed || minimum === null ? [] : completeResults.filter((result) => builderProposalComparisonCompare(result.normalizedTotal!, minimum!) === 0).map((result) => result.proposalId);
    recommendation = comparisonFailed
      ? { criterion: "lowest-complete-normalized-total", status: "insufficient-data", candidateProposalId: null, tiedProposalIds: [], reason: "مقایسهٔ عددی از محدودهٔ پشتیبانی‌شده خارج است؛ جمع‌بندی ساخته نشد.", source: "جمع‌بندی قاعده‌محور محلی" }
      : tied.length === 1
      ? { criterion: "lowest-complete-normalized-total", status: "conditional", candidateProposalId: tied[0], tiedProposalIds: [], reason: "بر اساس معیار صریح «کمترین مبلغ هم‌سطح» و فقط با فرض‌های ثبت‌شده، این گزینه رقم کمتری دارد؛ این نتیجه بهترین یا انتخاب نهایی نیست.", source: "جمع‌بندی قاعده‌محور محلی" }
      : { criterion: "lowest-complete-normalized-total", status: "tie", candidateProposalId: null, tiedProposalIds: tied, reason: "کمترین مبلغ هم‌سطح بین چند پیشنهاد برابر است؛ نامزد یکتا وجود ندارد.", source: "جمع‌بندی قاعده‌محور محلی" };
  }
  return { results, recommendation };
}

export function builderProposalComparisonSemanticValue(revision: BuilderProductComparisonRevision) {
  return { inputs: revision.inputs, results: revision.results, recommendation: revision.recommendation };
}

type ServiceReviewSnapshot = {
  requestKind: string;
  service: null | {
    id: string;
    scope: string | null;
    location: string | null;
    sizeOrVolume?: string | null;
    qualification?: string | null;
    timing?: string | null;
    method?: string | null;
    inScope?: string | null;
    outOfScope?: string | null;
    warranty?: string | null;
    paymentTerms?: string | null;
  };
};

export function builderServiceProposalComparisonRequestSnapshotFromReview(snapshot: ServiceReviewSnapshot): BuilderServiceProposalComparisonRequestSnapshot | null {
  if (snapshot.requestKind !== "service" || !snapshot.service) return null;
  return {
    id: snapshot.service.id,
    scope: snapshot.service.scope,
    location: snapshot.service.location,
    sizeOrVolume: snapshot.service.sizeOrVolume ?? null,
    qualification: snapshot.service.qualification ?? null,
    timing: snapshot.service.timing ?? null,
    method: snapshot.service.method ?? null,
    inScope: snapshot.service.inScope ?? null,
    outOfScope: snapshot.service.outOfScope ?? null,
    warranty: snapshot.service.warranty ?? null,
    paymentTerms: snapshot.service.paymentTerms ?? null,
  };
}

export function builderServiceProposalComparisonDefaultDraft(proposals: BuilderRecordedProposalRecord[], requestKey: string): BuilderServiceComparisonDraft {
  return {
    requestKey,
    proposals: proposals.filter((proposal) => proposal.target.requestKind === "service" && builderProposalComparisonRequestKey(proposal) === requestKey).slice(0, 8).map((proposal) => ({ proposalId: proposal.id, selected: true, criteria: builderServiceProposalComparisonCriteriaV1.map((criterion) => ({ criterionId: criterion.id, declaredValue: "", assessment: "unknown", rationale: "" })) })),
  };
}

export function builderServiceProposalComparisonDraftFromRecord(record: BuilderServiceComparisonRecord): BuilderServiceComparisonDraft {
  const revision = record.revisions.find((item) => item.id === record.currentRevisionId)!;
  return {
    requestKey: [record.target.requestId, record.target.requestVersion, record.target.reviewRevisionId, record.target.reviewRevisionFingerprint].join(":"),
    proposals: revision.inputs.map((input) => ({ proposalId: input.proposalId, selected: true, criteria: input.criteria.map((criterion) => ({ criterionId: criterion.criterionId, declaredValue: criterion.declaredValue ?? "", assessment: criterion.assessment, rationale: criterion.rationale ?? "" })) })),
  };
}

export function normalizeBuilderServiceProposalComparisonInputs(draft: BuilderServiceComparisonDraft, proposals: BuilderRecordedProposalRecord[], requestSnapshot: BuilderServiceProposalComparisonRequestSnapshot) {
  const selectedDrafts = draft.proposals.filter((item) => item.selected);
  if (selectedDrafts.length < 2 || selectedDrafts.length > 8 || new Set(selectedDrafts.map((item) => item.proposalId)).size !== selectedDrafts.length) return null;
  const inputs = selectedDrafts.flatMap((proposalDraft): BuilderServiceProposalComparisonInput[] => {
    const proposal = proposals.find((item) => item.id === proposalDraft.proposalId && item.target.requestKind === "service" && builderProposalComparisonRequestKey(item) === draft.requestKey);
    const revision = proposal?.revisions.find((item) => item.id === proposal.currentRevisionId);
    if (!proposal || !revision || revision.lines.length !== 1 || revision.lines[0].serviceSpecId !== requestSnapshot.id || proposalDraft.criteria.length !== builderServiceProposalComparisonCriteriaV1.length) return [];
    const seenCriteria = new Set<BuilderServiceProposalComparisonCriterionId>();
    const criteria = proposalDraft.criteria.flatMap((criterionDraft, index): BuilderServiceProposalComparisonCriterionInput[] => {
      const definition = builderServiceProposalComparisonCriteriaV1[index];
      if (!definition || criterionDraft.criterionId !== definition.id || seenCriteria.has(criterionDraft.criterionId)) return [];
      seenCriteria.add(criterionDraft.criterionId);
      const declaredValue = normalizeComparisonText(criterionDraft.declaredValue, 500);
      const rationale = normalizeComparisonText(criterionDraft.rationale, 500);
      const assessment = criterionDraft.assessment;
      const requestValue = requestSnapshot[definition.requestField];
      if (declaredValue === undefined || rationale === undefined || !["aligned", "partial", "different", "unknown", "not-applicable"].includes(assessment)) return [];
      if (assessment === "not-applicable") {
        if (requestValue !== null || declaredValue !== null || rationale === null) return [];
      } else if (assessment !== "unknown" && (declaredValue === null || rationale === null || requestValue === null)) return [];
      return [{ criterionId: definition.id, declaredValue, assessment, rationale, declaredSource: "رونویسی تکمیلی سازنده برای مقایسه", assessmentSource: "ارزیابی سازنده" }];
    });
    if (criteria.length !== builderServiceProposalComparisonCriteriaV1.length) return [];
    return [{ proposalId: proposal.id, proposalVersion: revision.version, proposalRevisionId: revision.id, proposalRevisionFingerprint: revision.fingerprint, proposalRevisionSnapshot: structuredClone(revision), proposalLineId: revision.lines[0].id, serviceSpecId: revision.lines[0].serviceSpecId!, supplierSnapshot: structuredClone(proposal.supplierSnapshot), criteria }];
  });
  return inputs.length === selectedDrafts.length ? inputs : null;
}

function serviceProposalRevisionForInput(input: BuilderServiceProposalComparisonInput, proposals?: BuilderRecordedProposalRecord[]) {
  if (input.proposalRevisionSnapshot) return input.proposalRevisionSnapshot;
  const proposal = proposals?.find((item) => item.id === input.proposalId && item.target.requestKind === "service");
  return proposal?.revisions.find((item) => item.id === input.proposalRevisionId
    && item.version === input.proposalVersion
    && builderProposalRevisionFingerprintMatches(proposal, item, input.proposalRevisionFingerprint)) ?? null;
}

export function deriveBuilderServiceProposalComparisonPayload(inputs: BuilderServiceProposalComparisonInput[], proposals: BuilderRecordedProposalRecord[] | undefined, requestSnapshot: BuilderServiceProposalComparisonRequestSnapshot) {
  const results = inputs.flatMap((input): BuilderServiceProposalComparisonProposalResult[] => {
    const revision = serviceProposalRevisionForInput(input, proposals);
    const declaredLine = revision?.lines[0];
    if (!revision || !declaredLine || input.proposalLineId !== declaredLine.id || input.serviceSpecId !== declaredLine.serviceSpecId || declaredLine.serviceSpecId !== requestSnapshot.id || input.criteria.length !== builderServiceProposalComparisonCriteriaV1.length || !stableEqual(input.supplierSnapshot, revision.supplierSnapshot)) return [];
    const criteria = builderServiceProposalComparisonCriteriaV1.flatMap((definition, index): BuilderServiceProposalComparisonCriterionResult[] => {
      const criterion = input.criteria[index];
      if (!criterion || criterion.criterionId !== definition.id) return [];
      return [{ ...structuredClone(criterion), requestValue: requestSnapshot[definition.requestField], status: criterion.assessment === "unknown" ? "unknown" : "assessed" }];
    });
    if (criteria.length !== builderServiceProposalComparisonCriteriaV1.length) return [];
    const counts = {
      aligned: criteria.filter((criterion) => criterion.assessment === "aligned").length,
      partial: criteria.filter((criterion) => criterion.assessment === "partial").length,
      different: criteria.filter((criterion) => criterion.assessment === "different").length,
      unknown: criteria.filter((criterion) => criterion.assessment === "unknown").length,
      notApplicable: criteria.filter((criterion) => criterion.assessment === "not-applicable").length,
    };
    return [{ proposalId: input.proposalId, supplierDisplayName: input.supplierSnapshot.displayName, declaredCommercialSnapshot: structuredClone(declaredLine), criteria, counts, coverage: counts.unknown === 0 ? "complete" : "incomplete", source: "ماتریس ساختاریافتهٔ محلی چیدا" }];
  });
  if (results.length !== inputs.length) return null;
  const unknownCount = results.reduce((total, result) => total + result.counts.unknown, 0);
  const summary: BuilderServiceProposalComparisonSummary = unknownCount > 0
    ? { formulaVersion: "service-coverage-v1", criterion: "all-service-criteria-reviewed", status: "needs-clarification", candidateProposalId: null, unknownCount, reasonCode: "criteria-need-clarification", reason: "حداقل یک معیار در پیشنهادهای انتخاب‌شده هنوز نامشخص است؛ پیش از تصمیم انسانی روشن‌سازی لازم است.", source: "جمع‌بندی قاعده‌محور محلی" }
    : { formulaVersion: "service-coverage-v1", criterion: "all-service-criteria-reviewed", status: "ready-for-human-decision", candidateProposalId: null, unknownCount: 0, reasonCode: "all-criteria-reviewed", reason: "همهٔ معیارهای خدمت بازبینی شده‌اند؛ تفاوت‌ها برای تصمیم مستقل سازنده نمایش داده می‌شوند و هیچ امتیاز، رتبه یا گزینهٔ برتر ساخته نشده است.", source: "جمع‌بندی قاعده‌محور محلی" };
  return { results, summary };
}

export function builderServiceProposalComparisonSemanticValue(revision: BuilderServiceComparisonRevision) {
  return { inputs: revision.inputs, results: revision.results, summary: revision.summary };
}

const targetKeys = ["requestId", "requestVersion", "reviewRevisionId", "reviewRevisionFingerprint", "requestKind"] as const;
const supplierSnapshotKeys = ["supplierContactId", "supplierContactVersion", "displayName", "category", "tehranCoverage", "responseCapability", "networkStatus"] as const;
const proposalTargetKeys = ["requestId", "requestVersion", "reviewRevisionId", "reviewRevisionFingerprint", "requestDependencyFingerprint", "contentApprovalId", "contentApprovalVersion", "contentApprovalRevisionId", "contentApprovalFingerprint", "requestKind"] as const;
const proposalRevisionKeys = ["id", "version", "createdAt", "target", "requestSnapshot", "supplierSnapshot", "contactPin", "reference", "declaredAt", "transcript", "notes", "lines", "fingerprint"] as const;
const lineKeys = ["id", "requestItemId", "serviceSpecId", "requestLabel", "status", "quantity", "unit", "unitPrice", "totalPrice", "currency", "tax", "transport", "minimumOrder", "leadTime", "validity", "paymentTerms", "notes"] as const;

function authorityIsValid(value: unknown): value is ProcurementDispatchAuthority {
  if (!hasExactKeys(value, ["identityBindingHash", "snapshotHash", "projectIds", "authorizationHashes"])) return false;
  const authority = value as ProcurementDispatchAuthority;
  if (!exactSha256(authority.identityBindingHash) || !exactSha256(authority.snapshotHash) || !Array.isArray(authority.projectIds) || !hasExactKeys(authority.authorizationHashes, authority.projectIds)) return false;
  return authority.projectIds.length > 0 && authority.projectIds.every((id, index) => exactString(id, 200)
    && (index === 0 || authority.projectIds[index - 1] < id)
    && exactSha256(authority.authorizationHashes[id]));
}

function targetIsValid(value: unknown, kind: "product" | "service"): value is BuilderComparisonTargetPin {
  if (!hasExactKeys(value, targetKeys)) return false;
  const target = value as BuilderComparisonTargetPin;
  return exactString(target.requestId, 200)
    && exactInteger(target.requestVersion)
    && exactString(target.reviewRevisionId, 300)
    && exactFnv1a(target.reviewRevisionFingerprint)
    && target.requestKind === kind;
}

function supplierSnapshotIsValid(value: unknown, kind?: "product" | "service") {
  if (!hasExactKeys(value, supplierSnapshotKeys)) return false;
  const supplier = value as BuilderRecordedProposalSupplierSnapshot;
  return exactString(supplier.supplierContactId, 200)
    && exactInteger(supplier.supplierContactVersion)
    && visibleString(supplier.displayName, 120)
    && visibleString(supplier.category, 120)
    && visibleString(supplier.tehranCoverage, 160)
    && ["product", "service", "both"].includes(supplier.responseCapability)
    && (kind === undefined || supplier.responseCapability === kind || supplier.responseCapability === "both")
    && supplier.networkStatus === "خارج از شبکه چیدا";
}

function productRequestSnapshotIsValid(value: unknown): value is BuilderRecordedProposalRequestSnapshot {
  if (!hasExactKeys(value, ["requestKind", "title", "items", "service"])) return false;
  const snapshot = value as BuilderRecordedProposalRequestSnapshot;
  if (snapshot.requestKind !== "product" || !visibleString(snapshot.title, 4000) || snapshot.service !== null || !Array.isArray(snapshot.items) || snapshot.items.length < 1 || snapshot.items.length > 100) return false;
  const ids = new Set<string>();
  return snapshot.items.every((item) => hasExactKeys(item, ["id", "name", "quantity", "unit"])
    && exactString(item.id, 240)
    && !ids.has(item.id)
    && Boolean(ids.add(item.id))
    && optionalVisibleString(item.name, 300)
    && (item.quantity === null || builderProposalComparisonDecimalParts(item.quantity) !== null)
    && (item.unit === null || ["عدد", "کیلوگرم", "تن", "متر", "مترمربع", "مترمکعب", "بسته", "دستگاه"].includes(item.unit)));
}

function proposalRequestSnapshotIsValid(value: unknown, kind: "product" | "service") {
  if (!hasExactKeys(value, ["requestKind", "title", "items", "service"])) return false;
  const snapshot = value as BuilderRecordedProposalRequestSnapshot;
  if (!visibleString(snapshot.title, 4000) || !Array.isArray(snapshot.items) || snapshot.items.length > 100 || snapshot.requestKind !== kind) return false;
  if (kind === "product") return productRequestSnapshotIsValid(snapshot);
  return snapshot.items.length === 0
    && hasExactKeys(snapshot.service, ["id", "scope", "location"])
    && exactString(snapshot.service!.id, 240)
    && optionalVisibleString(snapshot.service!.scope, 1000)
    && optionalVisibleString(snapshot.service!.location, 1000);
}

function serviceRequestSnapshotIsValid(value: unknown): value is BuilderServiceProposalComparisonRequestSnapshot {
  const keys = ["id", "scope", "location", "sizeOrVolume", "qualification", "timing", "method", "inScope", "outOfScope", "warranty", "paymentTerms"] as const;
  if (!hasExactKeys(value, keys)) return false;
  const snapshot = value as BuilderServiceProposalComparisonRequestSnapshot;
  return exactString(snapshot.id, 300) && keys.slice(1).every((key) => optionalVisibleString(snapshot[key], 1000));
}

function lineIsValid(value: unknown, kind: "product" | "service") {
  if (!hasExactKeys(value, lineKeys)) return false;
  const line = value as BuilderRecordedProposalLine;
  return exactString(line.id, 300)
    && (kind === "product" ? exactString(line.requestItemId, 300) && line.serviceSpecId === null : line.requestItemId === null && exactString(line.serviceSpecId, 300))
    && visibleString(line.requestLabel, 500)
    && ["quoted", "unavailable", "alternative", "not-mentioned"].includes(line.status)
    && [line.quantity, line.unitPrice, line.totalPrice, line.tax, line.transport].every((item) => item === null || builderProposalComparisonDecimalParts(item) !== null)
    && optionalVisibleString(line.unit, 80)
    && line.currency === "تومان"
    && [line.minimumOrder, line.leadTime, line.validity, line.paymentTerms, line.notes].every((item) => optionalVisibleString(item, 1000));
}

type ProposalRevisionValidationCache = {
  byFingerprint: Map<string, {
    snapshot: BuilderRecordedProposalRevision;
    valid: boolean;
    pinHashesByIdentity?: Map<string, Sha256Fingerprint>;
  }>;
  pinHashBySnapshot: WeakMap<BuilderRecordedProposalRevision, Sha256Fingerprint>;
  requestHashByRevision: WeakMap<BuilderProductComparisonRevision | BuilderServiceComparisonRevision, Sha256Fingerprint>;
  serviceRequestHashByRevision: WeakMap<BuilderServiceComparisonRevision, Sha256Fingerprint>;
  commandPinsByDependencyHash: Map<string, { pins: BuilderProductComparisonCommandPins | BuilderServiceComparisonCommandPins; kind: "product" | "service"; projectId: string; valid: boolean }>;
};

function cacheProposalPinHash(input: BuilderProposalComparisonInput | BuilderServiceProposalComparisonInput, cache: ProposalRevisionValidationCache) {
  const cached = cache.byFingerprint.get(input.proposalRevisionFingerprint);
  if (!cached?.valid || !exactDeepEqual(cached.snapshot, input.proposalRevisionSnapshot)) return;
  const pinIdentity = JSON.stringify([
    input.proposalId,
    input.proposalVersion,
    input.proposalRevisionId,
    input.proposalRevisionFingerprint,
  ]);
  const pinHashesByIdentity = cached.pinHashesByIdentity ?? new Map<string, Sha256Fingerprint>();
  const pinHash = pinHashesByIdentity.get(pinIdentity) ?? builderComparisonHash({
    schemaVersion: 1,
    proposalId: input.proposalId,
    proposalVersion: input.proposalVersion,
    proposalRevisionId: input.proposalRevisionId,
    proposalRevisionFingerprint: input.proposalRevisionFingerprint,
    proposalRevisionSnapshot: input.proposalRevisionSnapshot,
  });
  pinHashesByIdentity.set(pinIdentity, pinHash);
  cached.pinHashesByIdentity = pinHashesByIdentity;
  cache.pinHashBySnapshot.set(input.proposalRevisionSnapshot, pinHash);
}

function proposalRevisionSnapshotIsValid(value: unknown, kind: "product" | "service", cache?: ProposalRevisionValidationCache) : value is BuilderRecordedProposalRevision {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const fingerprint = (value as { fingerprint?: unknown }).fingerprint;
  const cached = typeof fingerprint === "string" ? cache?.byFingerprint.get(fingerprint) : undefined;
  if (cached && exactDeepEqual(cached.snapshot, value)) return cached.valid && (value as BuilderRecordedProposalRevision).target.requestKind === kind;
  const valid = builderProposalRevisionIsCanonical(value);
  if (cache && typeof fingerprint === "string" && !cached) cache.byFingerprint.set(fingerprint, { snapshot: value as BuilderRecordedProposalRevision, valid });
  return valid && value.target.requestKind === kind;
}

function treatmentIsValid(value: unknown, modes: readonly string[]) {
  if (!hasExactKeys(value, ["mode", "value", "assumption", "source"])) return false;
  const treatment = value as BuilderProposalComparisonMoneyTreatment<string>;
  if (!modes.includes(treatment.mode) || treatment.source !== "فرض ثبت‌شده توسط سازنده" || !optionalVisibleString(treatment.assumption, 500)) return false;
  if (treatment.mode === "unknown") return treatment.value === null && treatment.assumption === null;
  if (treatment.mode === "included") return treatment.value === null && treatment.assumption !== null;
  return typeof treatment.value === "string" && builderProposalComparisonDecimalParts(treatment.value) !== null && treatment.assumption !== null;
}

function productInputIsValid(value: unknown, target: BuilderComparisonTargetPin, proposalCache?: ProposalRevisionValidationCache) : value is BuilderProposalComparisonInput {
  const keys = ["proposalId", "proposalVersion", "proposalRevisionId", "proposalRevisionFingerprint", "proposalRevisionSnapshot", "supplierSnapshot", "lineAdjustments", "taxTreatment", "transportTreatment"] as const;
  if (!hasExactKeys(value, keys)) return false;
  const input = value as BuilderProposalComparisonInput;
  if (!exactString(input.proposalId, 300) || !exactInteger(input.proposalVersion) || !exactString(input.proposalRevisionId, 300) || !exactSha256(input.proposalRevisionFingerprint)
    || !proposalRevisionSnapshotIsValid(input.proposalRevisionSnapshot, "product", proposalCache)
    || input.proposalVersion !== input.proposalRevisionSnapshot.version
    || input.proposalRevisionId !== input.proposalRevisionSnapshot.id
    || input.proposalRevisionFingerprint !== input.proposalRevisionSnapshot.fingerprint
    || !stableEqual(input.supplierSnapshot, input.proposalRevisionSnapshot.supplierSnapshot)
    || !supplierSnapshotIsValid(input.supplierSnapshot, "product")
    || !stableEqual(target, { requestId: input.proposalRevisionSnapshot.target.requestId, requestVersion: input.proposalRevisionSnapshot.target.requestVersion, reviewRevisionId: input.proposalRevisionSnapshot.target.reviewRevisionId, reviewRevisionFingerprint: input.proposalRevisionSnapshot.target.reviewRevisionFingerprint, requestKind: input.proposalRevisionSnapshot.target.requestKind })
    || !Array.isArray(input.lineAdjustments)
    || input.lineAdjustments.length !== input.proposalRevisionSnapshot.lines.length
    || !treatmentIsValid(input.taxTreatment, ["included", "fixed", "rate", "unknown"])
    || !treatmentIsValid(input.transportTreatment, ["included", "fixed", "unknown"])) return false;
  const adjustmentsAreValid = input.lineAdjustments.every((adjustment, index) => {
    const line = input.proposalRevisionSnapshot.lines[index];
    if (!hasExactKeys(adjustment, ["proposalLineId", "requestItemId", "basis", "adjustedQuantity", "adjustedQuantityUnit", "assumption", "source"])
      || adjustment.proposalLineId !== line.id
      || adjustment.requestItemId !== line.requestItemId
      || !["declared-total", "unit-price-times-adjusted-quantity", "unknown"].includes(adjustment.basis)
      || adjustment.source !== "فرض ثبت‌شده توسط سازنده"
      || !optionalVisibleString(adjustment.assumption, 500)) return false;
    if (adjustment.basis === "declared-total") {
      const requested = input.proposalRevisionSnapshot.requestSnapshot.items.find((item) => item.id === line.requestItemId);
      return line.status === "quoted" && line.totalPrice !== null && line.quantity !== null && line.unit !== null
        && line.quantity === requested?.quantity && line.unit === requested?.unit
        && adjustment.adjustedQuantity === null && adjustment.adjustedQuantityUnit === null && adjustment.assumption === null;
    }
    if (adjustment.basis === "unit-price-times-adjusted-quantity") return line.status === "quoted" && line.unitPrice !== null && typeof adjustment.adjustedQuantity === "string" && builderProposalComparisonDecimalParts(adjustment.adjustedQuantity) !== null && builderProposalComparisonCompare(adjustment.adjustedQuantity, "0") === 1 && adjustment.adjustedQuantityUnit === line.unit && adjustment.assumption !== null;
    return adjustment.adjustedQuantity === null && adjustment.adjustedQuantityUnit === null && adjustment.assumption === null;
  });
  if (adjustmentsAreValid && proposalCache) cacheProposalPinHash(input, proposalCache);
  return adjustmentsAreValid;
}

function criterionInputIsValid(value: unknown, definition: typeof builderServiceProposalComparisonCriteriaV1[number], requestSnapshot: BuilderServiceProposalComparisonRequestSnapshot) {
  if (!hasExactKeys(value, ["criterionId", "declaredValue", "assessment", "rationale", "declaredSource", "assessmentSource"])) return false;
  const criterion = value as BuilderServiceProposalComparisonCriterionInput;
  if (criterion.criterionId !== definition.id || !optionalVisibleString(criterion.declaredValue, 500) || !optionalVisibleString(criterion.rationale, 500)
    || !["aligned", "partial", "different", "unknown", "not-applicable"].includes(criterion.assessment)
    || criterion.declaredSource !== "رونویسی تکمیلی سازنده برای مقایسه" || criterion.assessmentSource !== "ارزیابی سازنده") return false;
  const requestValue = requestSnapshot[definition.requestField];
  if (criterion.assessment === "not-applicable") return requestValue === null && criterion.declaredValue === null && criterion.rationale !== null;
  if (criterion.assessment === "unknown") return true;
  return requestValue !== null && criterion.declaredValue !== null && criterion.rationale !== null;
}

function serviceInputIsValid(value: unknown, target: BuilderComparisonTargetPin, requestSnapshot: BuilderServiceProposalComparisonRequestSnapshot, proposalCache?: ProposalRevisionValidationCache): value is BuilderServiceProposalComparisonInput {
  const keys = ["proposalId", "proposalVersion", "proposalRevisionId", "proposalRevisionFingerprint", "proposalRevisionSnapshot", "proposalLineId", "serviceSpecId", "supplierSnapshot", "criteria"] as const;
  if (!hasExactKeys(value, keys)) return false;
  const input = value as BuilderServiceProposalComparisonInput;
  const revision = input.proposalRevisionSnapshot;
  const valid = exactString(input.proposalId, 300)
    && exactInteger(input.proposalVersion)
    && exactString(input.proposalRevisionId, 300)
    && exactSha256(input.proposalRevisionFingerprint)
    && proposalRevisionSnapshotIsValid(revision, "service", proposalCache)
    && input.proposalVersion === revision.version
    && input.proposalRevisionId === revision.id
    && input.proposalRevisionFingerprint === revision.fingerprint
    && stableEqual(input.supplierSnapshot, revision.supplierSnapshot)
    && supplierSnapshotIsValid(input.supplierSnapshot, "service")
    && stableEqual(target, { requestId: revision.target.requestId, requestVersion: revision.target.requestVersion, reviewRevisionId: revision.target.reviewRevisionId, reviewRevisionFingerprint: revision.target.reviewRevisionFingerprint, requestKind: revision.target.requestKind })
    && revision.lines.length === 1
    && input.proposalLineId === revision.lines[0].id
    && input.serviceSpecId === revision.lines[0].serviceSpecId
    && input.serviceSpecId === requestSnapshot.id
    && Array.isArray(input.criteria)
    && input.criteria.length === builderServiceProposalComparisonCriteriaV1.length
    && input.criteria.every((criterion, index) => criterionInputIsValid(criterion, builderServiceProposalComparisonCriteriaV1[index], requestSnapshot));
  if (valid && proposalCache) cacheProposalPinHash(input, proposalCache);
  return valid;
}

const eventKeys = ["schemaVersion", "kind", "comparisonId", "projectId", "scopeId", "id", "type", "actor", "actorPrincipalId", "origin", "at", "version", "revisionId", "authorizationContextHash", "dependencySnapshotHash", "idempotencyKey", "commandPayloadHash", "fingerprint"] as const;
const productRevisionKeys = ["schemaVersion", "kind", "comparisonId", "projectId", "scopeId", "target", "id", "version", "createdAt", "inputs", "results", "recommendation", "fingerprint"] as const;
const serviceRevisionKeys = ["schemaVersion", "kind", "comparisonId", "projectId", "scopeId", "target", "id", "version", "createdAt", "inputs", "results", "summary", "fingerprint"] as const;
const ownershipKeys = ["ownerPrincipalType", "ownerPrincipalId", "accountSide", "scopeType", "scopeId", "custodianService", "sensitivity"] as const;
const productRecordKeys = ["schemaVersion", "objectType", "id", "projectId", ...ownershipKeys, "purpose", "target", "requestSnapshot", "currentRevisionId", "visibility", "localStatus", "externalEffect", "networkUsed", "aiUsed", "version", "createdAt", "updatedAt", "history", "revisions", "legacyEvidence", "fingerprint"] as const;
const serviceRecordKeys = ["schemaVersion", "objectType", "id", "projectId", ...ownershipKeys, "purpose", "target", "requestSnapshot", "currentRevisionId", "visibility", "localStatus", "externalEffect", "networkUsed", "aiUsed", "scoringUsed", "version", "createdAt", "updatedAt", "history", "revisions", "legacyEvidence", "fingerprint"] as const;

function eventIsValid(value: unknown, kind: "product" | "service", recordId: string, projectId: string, version: number, revisionId: string, authority: ProcurementDispatchAuthority) : value is BuilderComparisonEvent {
  if (!hasExactKeys(value, eventKeys)) return false;
  const event = value as BuilderComparisonEvent;
  if (event.schemaVersion !== 1 || event.kind !== kind || event.comparisonId !== recordId || event.projectId !== projectId || event.scopeId !== projectId
    || !exactString(event.id, 300) || event.actor !== "شما" || event.actorPrincipalId !== "local-builder-account"
    || !["live-command", "v1-migration"].includes(event.origin) || !exactDate(event.at) || event.version !== version || event.revisionId !== revisionId
    || !exactSha256(event.authorizationContextHash) || event.authorizationContextHash !== authority.authorizationHashes[projectId]
    || !exactSha256(event.dependencySnapshotHash) || !exactSha256(event.fingerprint) || event.fingerprint !== builderComparisonHash(withoutFingerprint(event))) return false;
  if (version === 1 ? event.type !== "created" : event.type !== "updated") return false;
  return event.origin === "v1-migration"
    ? event.idempotencyKey === null && event.commandPayloadHash === null
    : exactString(event.idempotencyKey, 300) && exactSha256(event.commandPayloadHash);
}

function productRevisionIsValid(value: unknown, record: Pick<BuilderProductComparisonRecord, "id" | "projectId" | "scopeId" | "target" | "requestSnapshot">, expectedVersion: number, proposalCache?: ProposalRevisionValidationCache) : value is BuilderProductComparisonRevision {
  if (!hasExactKeys(value, productRevisionKeys)) return false;
  const revision = value as BuilderProductComparisonRevision;
  if (revision.schemaVersion !== 2 || revision.kind !== "product" || revision.comparisonId !== record.id || revision.projectId !== record.projectId || revision.scopeId !== record.scopeId
    || !stableEqual(revision.target, record.target) || !exactString(revision.id, 300) || revision.version !== expectedVersion || !exactDate(revision.createdAt)
    || !Array.isArray(revision.inputs) || revision.inputs.length < 2 || revision.inputs.length > 8 || new Set(revision.inputs.map((input) => input.proposalId)).size !== revision.inputs.length
    || !revision.inputs.every((input) => productInputIsValid(input, record.target, proposalCache))
    || !revision.inputs.every((input) => stableEqual(input.proposalRevisionSnapshot.requestSnapshot, record.requestSnapshot))
    || !Array.isArray(revision.results) || !exactSha256(revision.fingerprint) || revision.fingerprint !== builderComparisonHash(withoutFingerprint(revision))) return false;
  const derived = deriveBuilderProposalComparisonPayload(revision.inputs);
  const valid = Boolean(derived && stableEqual(derived.results, revision.results) && stableEqual(derived.recommendation, revision.recommendation));
  if (valid && proposalCache) proposalCache.requestHashByRevision.set(revision, builderComparisonHash({ schemaVersion: 1, kind: "product", projectId: revision.projectId, target: revision.target, requestSnapshot: revision.inputs[0].proposalRevisionSnapshot.requestSnapshot }));
  return valid;
}

function serviceRevisionIsValid(value: unknown, record: Pick<BuilderServiceComparisonRecord, "id" | "projectId" | "scopeId" | "target" | "requestSnapshot">, expectedVersion: number, proposalCache?: ProposalRevisionValidationCache) : value is BuilderServiceComparisonRevision {
  if (!hasExactKeys(value, serviceRevisionKeys)) return false;
  const revision = value as BuilderServiceComparisonRevision;
  if (revision.schemaVersion !== 2 || revision.kind !== "service" || revision.comparisonId !== record.id || revision.projectId !== record.projectId || revision.scopeId !== record.scopeId
    || !stableEqual(revision.target, record.target) || !exactString(revision.id, 300) || revision.version !== expectedVersion || !exactDate(revision.createdAt)
    || !Array.isArray(revision.inputs) || revision.inputs.length < 2 || revision.inputs.length > 8 || new Set(revision.inputs.map((input) => input.proposalId)).size !== revision.inputs.length
    || !revision.inputs.every((input) => serviceInputIsValid(input, record.target, record.requestSnapshot, proposalCache))
    || !revision.inputs.every((input) => input.proposalRevisionSnapshot.requestSnapshot.service?.id === record.requestSnapshot.id
      && input.proposalRevisionSnapshot.requestSnapshot.service.scope === record.requestSnapshot.scope
      && input.proposalRevisionSnapshot.requestSnapshot.service.location === record.requestSnapshot.location)
    || !Array.isArray(revision.results) || !exactSha256(revision.fingerprint) || revision.fingerprint !== builderComparisonHash(withoutFingerprint(revision))) return false;
  const derived = deriveBuilderServiceProposalComparisonPayload(revision.inputs, undefined, record.requestSnapshot);
  const valid = Boolean(derived && stableEqual(derived.results, revision.results) && stableEqual(derived.summary, revision.summary));
  if (valid && proposalCache) {
    proposalCache.requestHashByRevision.set(revision, builderComparisonHash({ schemaVersion: 1, kind: "service", projectId: revision.projectId, target: revision.target, requestSnapshot: revision.inputs[0].proposalRevisionSnapshot.requestSnapshot }));
    proposalCache.serviceRequestHashByRevision.set(revision, builderComparisonHash({ schemaVersion: 1, kind: "service", projectId: revision.projectId, target: revision.target, serviceRequestSnapshot: record.requestSnapshot }));
  }
  return valid;
}

function legacyEvidenceIsValid(value: unknown, record: BuilderProductComparisonRecord | BuilderServiceComparisonRecord) : value is BuilderComparisonLegacyEvidence {
  const keys = ["schemaVersion", "kind", "sourceKey", "comparisonId", "projectId", "sourceGeneration", "sourceIndex", "sourceRecordHash", "sourceRecordVersion", "sourceCreatedAt", "sourceUpdatedAt", "revisionLinks", "fingerprint"] as const;
  if (!hasExactKeys(value, keys)) return false;
  const evidence = value as BuilderComparisonLegacyEvidence;
  const kind = record.objectType === "builder-product-proposal-comparison" ? "product" : "service";
  const expectedSourceKey = kind === "product" ? legacyBuilderProductComparisonsStorageKey : legacyBuilderServiceComparisonsStorageKey;
  if (evidence.schemaVersion !== 1 || evidence.kind !== kind || evidence.sourceKey !== expectedSourceKey || evidence.comparisonId !== record.id || evidence.projectId !== record.projectId || evidence.sourceGeneration !== "v1-array"
    || !exactInteger(evidence.sourceIndex, 0) || !exactSha256(evidence.sourceRecordHash) || !exactInteger(evidence.sourceRecordVersion) || evidence.sourceRecordVersion > record.version
    || !exactDate(evidence.sourceCreatedAt) || !exactDate(evidence.sourceUpdatedAt) || Date.parse(evidence.sourceUpdatedAt) < Date.parse(evidence.sourceCreatedAt)
    || !Array.isArray(evidence.revisionLinks) || evidence.revisionLinks.length !== evidence.sourceRecordVersion
    || !exactSha256(evidence.fingerprint) || evidence.fingerprint !== builderComparisonHash(withoutFingerprint(evidence))) return false;
  const linkIds = new Set<string>();
  const legacyRevisions: Record<string, unknown>[] = [];
  for (let index = 0; index < evidence.revisionLinks.length; index += 1) {
    const link = evidence.revisionLinks[index];
    const revision = record.revisions[index];
    if (!hasExactKeys(link, ["revisionId", "revisionVersion", "sourceRevisionValueHash", "proposalFingerprintClaims", "legacyFingerprint", "canonicalFingerprint"])
      || link.revisionId !== revision?.id || link.revisionVersion !== index + 1 || linkIds.has(link.revisionId) || !exactSha256(link.sourceRevisionValueHash)
      || !Array.isArray(link.proposalFingerprintClaims) || link.proposalFingerprintClaims.length !== revision.inputs.length
      || !link.proposalFingerprintClaims.every((claim, claimIndex) => hasExactKeys(claim, ["proposalId", "proposalRevisionId", "claimedFingerprint"])
        && claim.proposalId === revision.inputs[claimIndex].proposalId
        && claim.proposalRevisionId === revision.inputs[claimIndex].proposalRevisionId
        && (exactFnv1a(claim.claimedFingerprint) || exactSha256(claim.claimedFingerprint)))
      || !exactFnv1a(link.legacyFingerprint) || !exactSha256(link.canonicalFingerprint) || link.canonicalFingerprint !== revision.fingerprint) return false;
    const legacyRevision = legacyRevisionValue(record, revision, link.proposalFingerprintClaims);
    if (legacyRevision.fingerprint !== link.legacyFingerprint
      || builderComparisonHash(legacyRevision) !== link.sourceRevisionValueHash) return false;
    legacyRevisions.push(legacyRevision);
    linkIds.add(link.revisionId);
  }
  if (!record.history.slice(0, evidence.sourceRecordVersion).every((event) => event.origin === "v1-migration")
    || record.createdAt !== evidence.sourceCreatedAt
    || record.revisions[evidence.sourceRecordVersion - 1]?.createdAt !== evidence.sourceUpdatedAt) return false;
  const legacyHistory = record.history.slice(0, evidence.sourceRecordVersion).map((event) => ({
    id: event.id,
    type: event.type,
    actor: event.actor,
    at: event.at,
    version: event.version,
  }));
  const common = {
    schemaVersion: 1 as const,
    id: record.id,
    projectId: record.projectId,
    purpose: record.purpose,
    target: record.target,
    requestSnapshot: record.requestSnapshot,
    currentRevisionId: legacyRevisions.at(-1)!.id,
    visibility: record.visibility,
    localStatus: record.localStatus,
    externalEffect: record.externalEffect,
    networkUsed: record.networkUsed,
    aiUsed: record.aiUsed,
    version: evidence.sourceRecordVersion,
    createdAt: evidence.sourceCreatedAt,
    updatedAt: evidence.sourceUpdatedAt,
    history: legacyHistory,
    revisions: legacyRevisions,
  };
  const legacyRecord = record.objectType === "builder-service-proposal-comparison"
    ? { ...common, scoringUsed: record.scoringUsed }
    : common;
  return builderComparisonHash(legacyRecord) === evidence.sourceRecordHash;
}

function ownershipIsValid(record: BuilderProductComparisonRecord | BuilderServiceComparisonRecord, authority: ProcurementDispatchAuthority) {
  return record.ownerPrincipalType === "account" && record.ownerPrincipalId === "local-builder-account" && record.accountSide === "builder"
    && record.scopeType === "project_private" && record.scopeId === record.projectId && record.custodianService === "Comparison Domain Service" && record.sensitivity === "private"
    && authority.projectIds.includes(record.projectId);
}

function recordCommonIsValid(record: BuilderProductComparisonRecord | BuilderServiceComparisonRecord, kind: "product" | "service", authority: ProcurementDispatchAuthority) {
  if (!exactString(record.id, 300) || !exactString(record.projectId, 200) || !ownershipIsValid(record, authority) || !targetIsValid(record.target, kind)
    || !exactString(record.currentRevisionId, 300) || record.visibility !== "خصوصی پروژه" || record.localStatus !== "ثبت محلی" || record.externalEffect !== "none" || record.networkUsed !== false || record.aiUsed !== false
    || !exactInteger(record.version) || record.version > 100 || !exactDate(record.createdAt) || !exactDate(record.updatedAt) || Date.parse(record.updatedAt) < Date.parse(record.createdAt)
    || !Array.isArray(record.history) || !Array.isArray(record.revisions) || record.history.length !== record.version || record.revisions.length !== record.version
    || record.currentRevisionId !== record.revisions.at(-1)?.id || !exactSha256(record.fingerprint) || record.fingerprint !== builderComparisonHash(withoutFingerprint(record))) return false;
  const eventIds = new Set<string>();
  const revisionIds = new Set<string>();
  for (let index = 0; index < record.version; index += 1) {
    const revision = record.revisions[index];
    const event = record.history[index];
    if (!revision || !event || eventIds.has(event.id) || revisionIds.has(revision.id) || revision.createdAt !== event.at
      || index > 0 && Date.parse(revision.createdAt) < Date.parse(record.revisions[index - 1].createdAt)
      || index > 0 && stableEqual(kind === "product" ? builderProposalComparisonSemanticValue(revision as BuilderProductComparisonRevision) : builderServiceProposalComparisonSemanticValue(revision as BuilderServiceComparisonRevision), kind === "product" ? builderProposalComparisonSemanticValue(record.revisions[index - 1] as BuilderProductComparisonRevision) : builderServiceProposalComparisonSemanticValue(record.revisions[index - 1] as BuilderServiceComparisonRevision))
      || !eventIsValid(event, kind, record.id, record.projectId, index + 1, revision.id, authority)) return false;
    eventIds.add(event.id);
    revisionIds.add(revision.id);
  }
  const migrationEventCount = record.history.filter((event) => event.origin === "v1-migration").length;
  if (record.legacyEvidence === null) return migrationEventCount === 0;
  return legacyEvidenceIsValid(record.legacyEvidence, record) && migrationEventCount === record.legacyEvidence.sourceRecordVersion
    && record.history.slice(record.legacyEvidence.sourceRecordVersion).every((event) => event.origin === "live-command");
}

function productRecordIsValid(value: unknown, authority: ProcurementDispatchAuthority, proposalCache?: ProposalRevisionValidationCache) : value is BuilderProductComparisonRecord {
  if (!hasExactKeys(value, productRecordKeys)) return false;
  const record = value as BuilderProductComparisonRecord;
  return record.schemaVersion === 2 && record.objectType === "builder-product-proposal-comparison" && record.purpose === "compare-builder-recorded-product-proposals"
    && productRequestSnapshotIsValid(record.requestSnapshot) && recordCommonIsValid(record, "product", authority)
    && record.revisions.every((revision, index) => productRevisionIsValid(revision, record, index + 1, proposalCache))
    && record.createdAt === record.history[0]?.at && record.updatedAt === record.history.at(-1)?.at;
}

function serviceRecordIsValid(value: unknown, authority: ProcurementDispatchAuthority, proposalCache?: ProposalRevisionValidationCache) : value is BuilderServiceComparisonRecord {
  if (!hasExactKeys(value, serviceRecordKeys)) return false;
  const record = value as BuilderServiceComparisonRecord;
  return record.schemaVersion === 2 && record.objectType === "builder-service-proposal-comparison" && record.purpose === "compare-builder-recorded-service-proposals" && record.scoringUsed === false
    && serviceRequestSnapshotIsValid(record.requestSnapshot) && recordCommonIsValid(record, "service", authority)
    && record.revisions.every((revision, index) => serviceRevisionIsValid(revision, record, index + 1, proposalCache))
    && record.createdAt === record.history[0]?.at && record.updatedAt === record.history.at(-1)?.at;
}

const productPinsKeys = ["schemaVersion", "kind", "authorizationContextHash", "identityBindingHash", "proposalStoreVersion", "proposalEnvelopeFingerprint", "proposalDependencySnapshotHash", "target", "requestSnapshotHash", "proposalPins", "expectedDependencySnapshotHash"] as const;
const servicePinsKeys = [...productPinsKeys.slice(0, -2), "serviceRequestSnapshotHash", "proposalPins", "expectedDependencySnapshotHash"] as const;

function commandPinsAreValid(
  value: unknown,
  kind: "product" | "service",
  projectId: string,
  revision: BuilderProductComparisonRevision | BuilderServiceComparisonRevision,
  authority: ProcurementDispatchAuthority,
  proposalCache: ProposalRevisionValidationCache,
): value is BuilderProductComparisonCommandPins | BuilderServiceComparisonCommandPins {
  if (!hasExactKeys(value, kind === "product" ? productPinsKeys : servicePinsKeys)) return false;
  const pins = value as BuilderProductComparisonCommandPins | BuilderServiceComparisonCommandPins;
  if (pins.schemaVersion !== 1 || pins.kind !== kind || pins.authorizationContextHash !== authority.authorizationHashes[projectId] || pins.identityBindingHash !== authority.identityBindingHash
    || !exactInteger(pins.proposalStoreVersion) || !exactSha256(pins.proposalEnvelopeFingerprint) || !exactSha256(pins.proposalDependencySnapshotHash)
    || !stableEqual(pins.target, revision.target) || !exactSha256(pins.requestSnapshotHash) || !Array.isArray(pins.proposalPins) || pins.proposalPins.length !== revision.inputs.length
    || !exactSha256(pins.expectedDependencySnapshotHash)) return false;
  for (let index = 0; index < pins.proposalPins.length; index += 1) {
    const pin = pins.proposalPins[index];
    const input = revision.inputs[index];
    if (!hasExactKeys(pin, ["proposalId", "proposalVersion", "proposalRevisionId", "proposalRevisionFingerprint", "proposalRevisionSnapshotHash"])
      || pin.proposalId !== input.proposalId || pin.proposalVersion !== input.proposalVersion || pin.proposalRevisionId !== input.proposalRevisionId || pin.proposalRevisionFingerprint !== input.proposalRevisionFingerprint
      || !exactSha256(pin.proposalRevisionSnapshotHash)
      || pin.proposalRevisionSnapshotHash !== proposalCache.pinHashBySnapshot.get(input.proposalRevisionSnapshot)) return false;
  }
  const requestSnapshot = revision.inputs[0]?.proposalRevisionSnapshot.requestSnapshot;
  if (!requestSnapshot || pins.requestSnapshotHash !== proposalCache.requestHashByRevision.get(revision)) return false;
  if (kind === "service") {
    const servicePins = pins as BuilderServiceComparisonCommandPins;
    if (!exactSha256(servicePins.serviceRequestSnapshotHash)
      || servicePins.serviceRequestSnapshotHash !== proposalCache.serviceRequestHashByRevision.get(revision as BuilderServiceComparisonRevision)) return false;
  }
  const cached = proposalCache.commandPinsByDependencyHash.get(pins.expectedDependencySnapshotHash);
  if (cached && cached.kind === kind && cached.projectId === projectId && exactDeepEqual(cached.pins, pins)) return cached.valid;
  const expected = builderComparisonHash({
    schemaVersion: 1,
    kind,
    projectId,
    identityBindingHash: pins.identityBindingHash,
    authorizationContextHash: pins.authorizationContextHash,
    proposalStoreVersion: pins.proposalStoreVersion,
    proposalEnvelopeFingerprint: pins.proposalEnvelopeFingerprint,
    proposalDependencySnapshotHash: pins.proposalDependencySnapshotHash,
    target: pins.target,
    requestSnapshotHash: pins.requestSnapshotHash,
    serviceRequestSnapshotHash: kind === "service" ? (pins as BuilderServiceComparisonCommandPins).serviceRequestSnapshotHash : null,
    proposalPins: pins.proposalPins,
  });
  const valid = pins.expectedDependencySnapshotHash === expected;
  if (!cached) proposalCache.commandPinsByDependencyHash.set(pins.expectedDependencySnapshotHash, { pins, kind, projectId, valid });
  return valid;
}

const receiptKeys = ["schemaVersion", "position", "key", "kind", "action", "payloadHash", "projectId", "recordId", "expectedStoreVersion", "expectedRecordVersion", "commandPins", "expectedDependencySnapshotHash", "result", "resultingStoreVersion", "resultingRecordVersion", "eventId", "revisionId", "authorizationContextHash", "recordedAt", "fingerprint"] as const;

function receiptIsValid(value: unknown, kind: "product" | "service", position: number, authority: ProcurementDispatchAuthority) : value is BuilderComparisonCommandReceipt {
  if (!hasExactKeys(value, receiptKeys)) return false;
  const receipt = value as BuilderComparisonCommandReceipt;
  return receipt.schemaVersion === 1 && receipt.position === position && exactString(receipt.key, 300) && receipt.kind === kind
    && ["create-comparison", "update-comparison"].includes(receipt.action) && exactSha256(receipt.payloadHash) && exactString(receipt.projectId, 200) && authority.projectIds.includes(receipt.projectId)
    && exactString(receipt.recordId, 300) && receipt.expectedStoreVersion === position && (receipt.expectedRecordVersion === null || exactInteger(receipt.expectedRecordVersion))
    && exactSha256(receipt.expectedDependencySnapshotHash) && ["created", "updated"].includes(receipt.result) && receipt.resultingStoreVersion === position + 1
    && exactInteger(receipt.resultingRecordVersion) && exactString(receipt.eventId, 300) && exactString(receipt.revisionId, 300)
    && receipt.authorizationContextHash === authority.authorizationHashes[receipt.projectId] && exactDate(receipt.recordedAt)
    && exactSha256(receipt.fingerprint) && receipt.fingerprint === builderComparisonHash(withoutFingerprint(receipt));
}

const reportKeys = ["schemaVersion", "id", "store", "sourceGeneration", "sourceKey", "sourceRawHash", "dependencySnapshotHash", "identityBindingHash", "migratedAt", "recordCount", "migratedRecordFingerprints", "migratedRevisionCount", "fingerprint"] as const;

function migrationIdFor(report: BuilderComparisonMigrationReport, store: BuilderComparisonMigrationReport["store"]) {
  return `${store}-migration:${builderComparisonHash({
    store,
    sourceGeneration: report.sourceGeneration,
    sourceKey: report.sourceKey,
    sourceRawHash: report.sourceRawHash,
    dependencySnapshotHash: report.dependencySnapshotHash,
    identityBindingHash: report.identityBindingHash,
    migratedAt: report.migratedAt,
  })}`;
}

function reportIsValid(value: unknown, kind: "product" | "service", authority: ProcurementDispatchAuthority): value is BuilderComparisonMigrationReport {
  if (!hasExactKeys(value, reportKeys)) return false;
  const report = value as BuilderComparisonMigrationReport;
  const store = kind === "product" ? "builder-product-comparison" : "builder-service-comparison";
  const sourceKey = kind === "product" ? legacyBuilderProductComparisonsStorageKey : legacyBuilderServiceComparisonsStorageKey;
  return report.schemaVersion === 1 && report.store === store && exactString(report.id, 300)
    && report.id === migrationIdFor(report, store)
    && (report.sourceGeneration === "none" ? report.sourceKey === null && report.sourceRawHash === null : report.sourceGeneration === "v1-array" && report.sourceKey === sourceKey && exactSha256(report.sourceRawHash))
    && exactSha256(report.dependencySnapshotHash) && report.identityBindingHash === authority.identityBindingHash && exactDate(report.migratedAt)
    && exactInteger(report.recordCount, 0) && report.recordCount <= 1000 && Array.isArray(report.migratedRecordFingerprints) && report.migratedRecordFingerprints.length === report.recordCount && report.migratedRecordFingerprints.every(exactSha256)
    && exactInteger(report.migratedRevisionCount, 0)
    && exactSha256(report.fingerprint) && report.fingerprint === builderComparisonHash(withoutFingerprint(report));
}

function recordAtVersion<T extends BuilderProductComparisonRecord | BuilderServiceComparisonRecord>(record: T, version: number): T {
  if (version === record.version) return record;
  const revisions = record.revisions.slice(0, version) as T["revisions"];
  const history = record.history.slice(0, version);
  const last = revisions.at(-1)!;
  return finalWithFingerprint({
    ...withoutFingerprint(record),
    currentRevisionId: last.id,
    version,
    updatedAt: last.createdAt,
    history,
    revisions,
  }) as T;
}

function migratedRecordsForReport<T extends BuilderProductComparisonRecord | BuilderServiceComparisonRecord>(records: T[], report: BuilderComparisonMigrationReport) {
  if (report.sourceGeneration === "none") return report.recordCount === 0 && report.migratedRevisionCount === 0 && report.migratedRecordFingerprints.length === 0 ? [] : null;
  const migrated = records.filter((record) => record.legacyEvidence !== null);
  if (migrated.length !== report.recordCount) return null;
  const byIndex = [...migrated].sort((left, right) => left.legacyEvidence!.sourceIndex - right.legacyEvidence!.sourceIndex);
  if (!byIndex.every((record, index) => record.legacyEvidence!.sourceIndex === index)) return null;
  const prefixes = byIndex.map((record) => recordAtVersion(record, record.legacyEvidence!.sourceRecordVersion));
  if (prefixes.reduce((total, record) => total + record.version, 0) !== report.migratedRevisionCount
    || !prefixes.every((record, index) => record.fingerprint === report.migratedRecordFingerprints[index])
    || prefixes.some((record) => Date.parse(record.createdAt) > Date.parse(report.migratedAt)
      || Date.parse(record.updatedAt) > Date.parse(report.migratedAt)
      || Date.parse(record.legacyEvidence!.sourceCreatedAt) > Date.parse(report.migratedAt)
      || Date.parse(record.legacyEvidence!.sourceUpdatedAt) > Date.parse(report.migratedAt)
      || record.history.some((event) => event.origin !== "v1-migration"
        || event.dependencySnapshotHash !== report.dependencySnapshotHash
        || Date.parse(event.at) > Date.parse(report.migratedAt))
      || record.revisions.some((revision) => Date.parse(revision.createdAt) > Date.parse(report.migratedAt)))) return null;
  return prefixes.sort((left, right) => compareUnicodeCodePoints(left.id, right.id));
}

function replayInitialMigrationCandidate<T extends BuilderProductComparisonRecord | BuilderServiceComparisonRecord>(
  envelope: BuilderProductComparisonEnvelope | BuilderServiceComparisonEnvelope,
  records: T[],
) {
  const report = envelope.migrationReports[0];
  const migrated = migratedRecordsForReport(records, report);
  if (!migrated) return null;
  if (envelope.idempotencyReceipts.length === 0 && envelope.storeVersion === 1 && envelope.updatedAt === report.migratedAt
    && migrated.length === records.length && migrated.every((record, index) => record === records[index])) return envelope;
  return finalWithFingerprint({
    schemaVersion: 2,
    fingerprintVersion: envelope.fingerprintVersion,
    storeVersion: 1,
    records: migrated,
    idempotencyReceipts: [],
    migrationReports: [report],
    updatedAt: report.migratedAt,
  });
}

function replayReceipts<T extends BuilderProductComparisonRecord | BuilderServiceComparisonRecord>(
  envelope: BuilderProductComparisonEnvelope | BuilderServiceComparisonEnvelope,
  records: T[],
  kind: "product" | "service",
  authority: ProcurementDispatchAuthority,
  proposalCache: ProposalRevisionValidationCache,
) {
  const report = envelope.migrationReports[0];
  const migrated = migratedRecordsForReport(records, report);
  if (!migrated) return false;
  const working = new Map<string, { record: T; version: number }>((migrated as T[]).map((record) => [record.id, { record, version: record.version }]));
  const liveEvents = records.flatMap((record) => record.history.map((event, index) => ({ record, event, revision: record.revisions[index] }))).filter(({ event }) => event.origin === "live-command");
  if (liveEvents.length !== envelope.idempotencyReceipts.length) return false;
  const liveEventsById = new Map<string, typeof liveEvents[number]>();
  for (const liveEvent of liveEvents) {
    if (liveEventsById.has(liveEvent.event.id)) return false;
    liveEventsById.set(liveEvent.event.id, liveEvent);
  }
  const receiptKeysSeen = new Set<string>();
  const eventIdsSeen = new Set<string>();
  let previousTime = Date.parse(report.migratedAt);
  for (let index = 0; index < envelope.idempotencyReceipts.length; index += 1) {
    const receipt = envelope.idempotencyReceipts[index];
    if (!receiptIsValid(receipt, kind, index + 1, authority) || receiptKeysSeen.has(receipt.key) || eventIdsSeen.has(receipt.eventId) || Date.parse(receipt.recordedAt) < previousTime) return false;
    previousTime = Date.parse(receipt.recordedAt);
    receiptKeysSeen.add(receipt.key);
    eventIdsSeen.add(receipt.eventId);
    const match = liveEventsById.get(receipt.eventId);
    if (!match || match.record.id !== receipt.recordId || match.revision.id !== receipt.revisionId || match.event.version !== receipt.resultingRecordVersion) return false;
    const { record, event, revision } = match;
    if (revision.id !== deterministicComparisonCommandId(kind, "revision", receipt, receipt.resultingRecordVersion)
      || event.id !== deterministicComparisonCommandId(kind, "event", receipt, receipt.resultingRecordVersion)) return false;
    if (receipt.projectId !== record.projectId || receipt.projectId !== revision.projectId || receipt.projectId !== event.projectId
      || event.idempotencyKey !== receipt.key || event.commandPayloadHash !== receipt.payloadHash || event.dependencySnapshotHash !== receipt.expectedDependencySnapshotHash
      || event.authorizationContextHash !== receipt.authorizationContextHash || event.at !== receipt.recordedAt || receipt.expectedDependencySnapshotHash !== receipt.commandPins.expectedDependencySnapshotHash
      || !commandPinsAreValid(receipt.commandPins, kind, receipt.projectId, revision, authority, proposalCache)) return false;
    const draft = kind === "product"
      ? productDraftForReceipt(record as BuilderProductComparisonRecord, revision as BuilderProductComparisonRevision)
      : serviceDraftForReceipt(record as BuilderServiceComparisonRecord, revision as BuilderServiceComparisonRevision);
    const expectedPayloadHash = builderComparisonHash({
      inputSchemaVersion: 1,
      kind: receipt.kind,
      action: receipt.action,
      projectId: receipt.projectId,
      comparisonId: receipt.recordId,
      draft,
      pins: receipt.commandPins,
      expectedStoreVersion: receipt.expectedStoreVersion,
      ...(receipt.action === "update-comparison" ? { expectedComparisonVersion: receipt.expectedRecordVersion } : {}),
    });
    if (receipt.payloadHash !== expectedPayloadHash || event.commandPayloadHash !== expectedPayloadHash) return false;
    const before = working.get(record.id);
    if (receipt.action === "create-comparison") {
      if (receipt.result !== "created" || receipt.expectedRecordVersion !== null || receipt.resultingRecordVersion !== 1 || before !== undefined) return false;
    } else if (receipt.result !== "updated" || before === undefined || receipt.expectedRecordVersion !== before.version || receipt.resultingRecordVersion !== before.version + 1) return false;
    working.set(record.id, { record, version: receipt.resultingRecordVersion });
  }
  return working.size === records.length && records.every((record) => {
    const replayed = working.get(record.id);
    return replayed?.record === record && replayed.version === record.version;
  });
}

function productDraftForReceipt(record: BuilderProductComparisonRecord, revision: BuilderProductComparisonRevision): BuilderProductComparisonDraft {
  return {
    requestKey: [record.target.requestId, record.target.requestVersion, record.target.reviewRevisionId, record.target.reviewRevisionFingerprint].join(":"),
    proposals: revision.inputs.map((input) => ({
      proposalId: input.proposalId,
      selected: true,
      lineAdjustments: input.lineAdjustments.map((adjustment) => ({
        proposalLineId: adjustment.proposalLineId,
        requestItemId: adjustment.requestItemId,
        basis: adjustment.basis,
        adjustedQuantity: adjustment.adjustedQuantity ?? "",
        adjustedQuantityUnit: adjustment.adjustedQuantityUnit ?? "",
        assumption: adjustment.assumption ?? "",
      })),
      taxMode: input.taxTreatment.mode,
      taxValue: input.taxTreatment.value ?? "",
      taxAssumption: input.taxTreatment.assumption ?? "",
      transportMode: input.transportTreatment.mode,
      transportValue: input.transportTreatment.value ?? "",
      transportAssumption: input.transportTreatment.assumption ?? "",
    })),
  };
}

function serviceDraftForReceipt(record: BuilderServiceComparisonRecord, revision: BuilderServiceComparisonRevision): BuilderServiceComparisonDraft {
  return {
    requestKey: [record.target.requestId, record.target.requestVersion, record.target.reviewRevisionId, record.target.reviewRevisionFingerprint].join(":"),
    proposals: revision.inputs.map((input) => ({
      proposalId: input.proposalId,
      selected: true,
      criteria: input.criteria.map((criterion) => ({
        criterionId: criterion.criterionId,
        declaredValue: criterion.declaredValue ?? "",
        assessment: criterion.assessment,
        rationale: criterion.rationale ?? "",
      })),
    })),
  };
}

const envelopeKeys = ["schemaVersion", "fingerprintVersion", "storeVersion", "records", "idempotencyReceipts", "migrationReports", "updatedAt", "fingerprint"] as const;

function envelopeIsValid(value: unknown, kind: "product" | "service", authority: ProcurementDispatchAuthority): value is BuilderProductComparisonEnvelope | BuilderServiceComparisonEnvelope {
  if (!hasExactKeys(value, envelopeKeys)) return false;
  const envelope = value as BuilderProductComparisonEnvelope | BuilderServiceComparisonEnvelope;
  const expectedFingerprintVersion = kind === "product" ? "builder-product-comparison-domain-v2" : "builder-service-comparison-domain-v2";
  if (envelope.schemaVersion !== 2 || envelope.fingerprintVersion !== expectedFingerprintVersion || !exactInteger(envelope.storeVersion)
    || !Array.isArray(envelope.records) || envelope.records.length > 1000 || !Array.isArray(envelope.idempotencyReceipts) || envelope.idempotencyReceipts.length > 10000
    || !Array.isArray(envelope.migrationReports) || envelope.migrationReports.length !== 1 || !reportIsValid(envelope.migrationReports[0], kind, authority)
    || !exactDate(envelope.updatedAt) || envelope.storeVersion !== envelope.idempotencyReceipts.length + 1
    || !exactSha256(envelope.fingerprint) || envelope.fingerprint !== builderComparisonHash(withoutFingerprint(envelope))) return false;
  const ids = new Set<string>();
  const revisionIds = new Set<string>();
  const eventIds = new Set<string>();
  const projectCounts = new Map<string, number>();
  const proposalCache: ProposalRevisionValidationCache = {
    byFingerprint: new Map(),
    pinHashBySnapshot: new WeakMap(),
    requestHashByRevision: new WeakMap(),
    serviceRequestHashByRevision: new WeakMap(),
    commandPinsByDependencyHash: new Map(),
  };
  for (let index = 0; index < envelope.records.length; index += 1) {
    const record = envelope.records[index];
    if (ids.has(record.id) || index > 0 && compareUnicodeCodePoints(envelope.records[index - 1].id, record.id) >= 0 || !(kind === "product" ? productRecordIsValid(record, authority, proposalCache) : serviceRecordIsValid(record, authority, proposalCache))) return false;
    if (record.revisions.some((revision) => revisionIds.has(revision.id)) || record.history.some((event) => eventIds.has(event.id))) return false;
    ids.add(record.id);
    record.revisions.forEach((revision) => revisionIds.add(revision.id));
    record.history.forEach((event) => eventIds.add(event.id));
    const projectCount = (projectCounts.get(record.projectId) ?? 0) + 1;
    if (projectCount > 100) return false;
    projectCounts.set(record.projectId, projectCount);
  }
  const report = envelope.migrationReports[0];
  const expectedUpdatedAt = envelope.idempotencyReceipts.at(-1)?.recordedAt ?? report.migratedAt;
  if (envelope.updatedAt !== expectedUpdatedAt || Date.parse(envelope.updatedAt) < Date.parse(report.migratedAt)
    || envelope.records.some((record) => Date.parse(record.createdAt) < Date.parse(report.migratedAt) && record.legacyEvidence === null || Date.parse(record.updatedAt) > Date.parse(envelope.updatedAt)
      || record.history.some((event) => Date.parse(event.at) > Date.parse(envelope.updatedAt))
      || record.revisions.some((revision) => Date.parse(revision.createdAt) > Date.parse(envelope.updatedAt)))) return false;
  return replayReceipts(envelope, envelope.records as never, kind, authority, proposalCache);
}

type BuilderComparisonPendingMarker = {
  schemaVersion: 1;
  store: "builder-product-comparison" | "builder-service-comparison";
  state: "pending";
  migrationId: string;
  sourceGeneration: "v1-array" | "none";
  sourceKey: typeof legacyBuilderProductComparisonsStorageKey | typeof legacyBuilderServiceComparisonsStorageKey | null;
  sourceRawHash: Sha256Fingerprint | null;
  dependencySnapshotHash: Sha256Fingerprint;
  identityBindingHash: Sha256Fingerprint;
  migrationAt: string;
  candidateRaw: string;
  candidateRawHash: Sha256Fingerprint;
  fingerprint: Sha256Fingerprint;
};
type BuilderComparisonVerifiedMarker = Omit<BuilderComparisonPendingMarker, "state" | "fingerprint"> & { state: "verified"; verifiedAt: string; fingerprint: Sha256Fingerprint };
type BuilderComparisonCommittedMarker = {
  schemaVersion: 1;
  store: "builder-product-comparison" | "builder-service-comparison";
  state: "committed";
  migrationId: string;
  sourceGeneration: "v1-array" | "none";
  sourceKey: typeof legacyBuilderProductComparisonsStorageKey | typeof legacyBuilderServiceComparisonsStorageKey | null;
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
type BuilderComparisonMarker = BuilderComparisonPendingMarker | BuilderComparisonVerifiedMarker | BuilderComparisonCommittedMarker;

type BuilderComparisonRollbackIncidentBase = {
  schemaVersion: 1;
  store: "builder-product-comparison" | "builder-service-comparison";
  kind: "product" | "service";
  idempotencyKey: string;
  commandPayloadHash: Sha256Fingerprint;
  previousCanonicalRawHash: Sha256Fingerprint;
  candidateCanonicalRawHash: Sha256Fingerprint;
  preparedAt: string;
};
type BuilderComparisonPreparedRollbackIncident = BuilderComparisonRollbackIncidentBase & {
  state: "prepared";
  resolution: null;
  resolvedAt: null;
  resolvedCanonicalRawHash: null;
  fingerprint: Sha256Fingerprint;
};
type BuilderComparisonResolvedRollbackIncident = BuilderComparisonRollbackIncidentBase & {
  state: "resolved";
  resolution: "committed" | "rolled-back";
  resolvedAt: string;
  resolvedCanonicalRawHash: Sha256Fingerprint;
  fingerprint: Sha256Fingerprint;
};
type BuilderComparisonRollbackIncident = BuilderComparisonPreparedRollbackIncident | BuilderComparisonResolvedRollbackIncident;

const rollbackIncidentKeys = [
  "schemaVersion",
  "store",
  "kind",
  "state",
  "idempotencyKey",
  "commandPayloadHash",
  "previousCanonicalRawHash",
  "candidateCanonicalRawHash",
  "preparedAt",
  "resolution",
  "resolvedAt",
  "resolvedCanonicalRawHash",
  "fingerprint",
] as const;

function parseComparisonRollbackIncidentRaw(
  raw: string | null,
  kind: "product" | "service",
): BuilderComparisonRollbackIncident | null | undefined {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!hasExactKeys(value, rollbackIncidentKeys)) return undefined;
    const incident = value as BuilderComparisonRollbackIncident;
    const store = kind === "product" ? "builder-product-comparison" : "builder-service-comparison";
    if (incident.schemaVersion !== 1 || incident.store !== store || incident.kind !== kind
      || !exactString(incident.idempotencyKey, 300) || !exactSha256(incident.commandPayloadHash)
      || !exactSha256(incident.previousCanonicalRawHash) || !exactSha256(incident.candidateCanonicalRawHash)
      || !exactDate(incident.preparedAt) || !exactSha256(incident.fingerprint)
      || incident.fingerprint !== builderComparisonHash(withoutFingerprint(incident))) return undefined;
    if (incident.state === "prepared") {
      return incident.resolution === null && incident.resolvedAt === null && incident.resolvedCanonicalRawHash === null
        ? incident
        : undefined;
    }
    if (incident.state !== "resolved" || !["committed", "rolled-back"].includes(incident.resolution)
      || !exactDate(incident.resolvedAt) || Date.parse(incident.resolvedAt) < Date.parse(incident.preparedAt)
      || !exactSha256(incident.resolvedCanonicalRawHash)) return undefined;
    const expectedResolvedHash = incident.resolution === "committed"
      ? incident.candidateCanonicalRawHash
      : incident.previousCanonicalRawHash;
    return incident.resolvedCanonicalRawHash === expectedResolvedHash ? incident : undefined;
  } catch {
    return undefined;
  }
}

function comparisonRollbackIncidentForCanonical(
  kind: "product" | "service",
  canonicalRaw: string | null,
): { incident: BuilderComparisonRollbackIncident | null; raw: string | null } | null {
  const key = kind === "product" ? builderProductComparisonsRollbackIncidentKey : builderServiceComparisonsRollbackIncidentKey;
  const raw = window.localStorage.getItem(key);
  const incident = parseComparisonRollbackIncidentRaw(raw, kind);
  if (incident === undefined) return null;
  if (incident?.state === "resolved"
    && (canonicalRaw === null || incident.resolvedCanonicalRawHash !== builderComparisonRawHash(canonicalRaw))) return null;
  return { incident, raw };
}

function markerBaseIsValid(marker: BuilderComparisonMarker, kind: "product" | "service", authority: ProcurementDispatchAuthority) {
  const store = kind === "product" ? "builder-product-comparison" : "builder-service-comparison";
  const sourceKey = kind === "product" ? legacyBuilderProductComparisonsStorageKey : legacyBuilderServiceComparisonsStorageKey;
  return marker.schemaVersion === 1 && marker.store === store && exactString(marker.migrationId, 300)
    && (marker.sourceGeneration === "none" ? marker.sourceKey === null && marker.sourceRawHash === null : marker.sourceGeneration === "v1-array" && marker.sourceKey === sourceKey && exactSha256(marker.sourceRawHash))
    && exactSha256(marker.dependencySnapshotHash) && marker.identityBindingHash === authority.identityBindingHash && exactDate(marker.migrationAt)
    && exactSha256(marker.candidateRawHash) && exactSha256(marker.fingerprint) && marker.fingerprint === builderComparisonHash(withoutFingerprint(marker));
}

function markerMatchesReport(marker: BuilderComparisonMarker, report: BuilderComparisonMigrationReport) {
  return marker.migrationId === report.id && marker.store === report.store && marker.sourceGeneration === report.sourceGeneration && marker.sourceKey === report.sourceKey
    && marker.sourceRawHash === report.sourceRawHash && marker.dependencySnapshotHash === report.dependencySnapshotHash && marker.identityBindingHash === report.identityBindingHash && marker.migrationAt === report.migratedAt;
}

function parseMarkerRaw(raw: string | null, kind: "product" | "service", authority: ProcurementDispatchAuthority): BuilderComparisonMarker | null {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const marker = value as BuilderComparisonMarker;
    if (!markerBaseIsValid(marker, kind, authority)) return null;
    if (marker.state === "pending") {
      return hasExactKeys(marker, ["schemaVersion", "store", "state", "migrationId", "sourceGeneration", "sourceKey", "sourceRawHash", "dependencySnapshotHash", "identityBindingHash", "migrationAt", "candidateRaw", "candidateRawHash", "fingerprint"])
        && typeof marker.candidateRaw === "string" && marker.candidateRawHash === builderComparisonRawHash(marker.candidateRaw) ? marker : null;
    }
    if (marker.state === "verified") {
      return hasExactKeys(marker, ["schemaVersion", "store", "state", "migrationId", "sourceGeneration", "sourceKey", "sourceRawHash", "dependencySnapshotHash", "identityBindingHash", "migrationAt", "candidateRaw", "candidateRawHash", "verifiedAt", "fingerprint"])
        && typeof marker.candidateRaw === "string" && marker.candidateRawHash === builderComparisonRawHash(marker.candidateRaw) && exactDate(marker.verifiedAt) && Date.parse(marker.verifiedAt) >= Date.parse(marker.migrationAt) ? marker : null;
    }
    if (marker.state === "committed") {
      return hasExactKeys(marker, ["schemaVersion", "store", "state", "migrationId", "sourceGeneration", "sourceKey", "sourceRawHash", "dependencySnapshotHash", "identityBindingHash", "migrationAt", "verifiedAt", "committedAt", "canonicalRawHash", "candidateRawHash", "fingerprint"])
        && exactDate(marker.verifiedAt) && exactDate(marker.committedAt) && Date.parse(marker.verifiedAt) >= Date.parse(marker.migrationAt) && Date.parse(marker.committedAt) >= Date.parse(marker.verifiedAt)
        && exactSha256(marker.canonicalRawHash) && marker.canonicalRawHash === marker.candidateRawHash ? marker : null;
    }
    return null;
  } catch {
    return null;
  }
}

function readComparisonState<TEnvelope extends BuilderProductComparisonEnvelope | BuilderServiceComparisonEnvelope>(
  context: BuilderComparisonReadContext,
  kind: "product" | "service",
  storageKey: string,
  markerKey: string,
): BuilderComparisonState<TEnvelope> {
  if (!hasExactKeys(context, ["authority", "dependencies"]) || !authorityIsValid(context.authority)) return { status: "read-error", envelope: null, dependencyStatus: "read-error", reason: "comparison-authority-invalid" };
  try {
    const canonicalRaw = window.localStorage.getItem(storageKey);
    const markerRaw = window.localStorage.getItem(markerKey);
    const incidentAuthority = comparisonRollbackIncidentForCanonical(kind, canonicalRaw);
    if (!incidentAuthority || incidentAuthority.incident?.state === "prepared") return { status: "read-error", envelope: null, dependencyStatus: "read-error", reason: "comparison-rollback-incident" };
    if (canonicalRaw === null || markerRaw === null) return { status: "read-error", envelope: null, dependencyStatus: "read-error", reason: "comparison-authority-missing" };
    const marker = parseMarkerRaw(markerRaw, kind, context.authority);
    let parsed: unknown;
    try {
      parsed = JSON.parse(canonicalRaw);
    } catch {
      return { status: "read-error", envelope: null, dependencyStatus: "read-error", reason: "comparison-canonical-invalid" };
    }
    if (!marker || marker.state !== "committed") return { status: "read-error", envelope: null, dependencyStatus: "read-error", reason: "comparison-marker-invalid" };
    if (!envelopeIsValid(parsed, kind, context.authority)) return { status: "read-error", envelope: null, dependencyStatus: "read-error", reason: "comparison-canonical-invalid" };
    const envelope = parsed as TEnvelope;
    const report = envelope.migrationReports[0];
    const initial = replayInitialMigrationCandidate(envelope, envelope.records as never);
    const initialRaw = initial === envelope ? canonicalRaw : initial ? JSON.stringify(initial) : null;
    if (!initial || !initialRaw || !markerMatchesReport(marker, report) || builderComparisonRawHash(initialRaw) !== marker.candidateRawHash
      || (envelope.idempotencyReceipts[0] && Date.parse(envelope.idempotencyReceipts[0].recordedAt) < Date.parse(marker.committedAt))) return { status: "read-error", envelope: null, dependencyStatus: "read-error", reason: "comparison-marker-mismatch" };
    const proposalAuthority = context.dependencies ? readBuilderComparisonProposalAuthority(context) : null;
    const dependencyStatus = proposalAuthority && comparisonHistoryResolvesAgainstProposalAuthority(envelope, proposalAuthority.envelope)
      ? "current"
      : "read-error";
    return { status: "ready", envelope, dependencyStatus };
  } catch {
    return { status: "read-error", envelope: null, dependencyStatus: "read-error", reason: "comparison-read-failure" };
  }
}

export function readBuilderProductComparisonState(context: BuilderComparisonReadContext): BuilderComparisonState<BuilderProductComparisonEnvelope> {
  return readComparisonState(context, "product", builderProductComparisonsStorageKey, builderProductComparisonsCutoverMarkerKey);
}

export function readBuilderServiceComparisonState(context: BuilderComparisonReadContext): BuilderComparisonState<BuilderServiceComparisonEnvelope> {
  return readComparisonState(context, "service", builderServiceComparisonsStorageKey, builderServiceComparisonsCutoverMarkerKey);
}

type ResolvedBuilderComparisonProposalAuthority = {
  envelope: BuilderProposalEnvelope;
  canonicalRaw: string;
  committedMarkerRaw: string;
  canonicalRawHash: Sha256Fingerprint;
  committedMarkerRawHash: Sha256Fingerprint;
};

function readBuilderComparisonProposalAuthority(context: BuilderComparisonReadContext): ResolvedBuilderComparisonProposalAuthority | null {
  if (!context.dependencies || !authorityIsValid(context.authority) || !stableEqual(context.dependencies.authority, context.authority)) return null;
  try {
    const canonicalRawBefore = window.localStorage.getItem(builderProposalsStorageKey);
    const markerRawBefore = window.localStorage.getItem(builderProposalsCutoverMarkerKey);
    if (canonicalRawBefore === null || markerRawBefore === null) return null;
    const state = readBuilderProposalState(context);
    const canonicalRawAfter = window.localStorage.getItem(builderProposalsStorageKey);
    const markerRawAfter = window.localStorage.getItem(builderProposalsCutoverMarkerKey);
    if (state.status !== "ready" || canonicalRawAfter !== canonicalRawBefore || markerRawAfter !== markerRawBefore) return null;
    const rawEnvelope = JSON.parse(canonicalRawBefore) as BuilderProposalEnvelope;
    if (rawEnvelope.storeVersion !== state.envelope.storeVersion || rawEnvelope.fingerprint !== state.envelope.fingerprint) return null;
    return { envelope: state.envelope, canonicalRaw: canonicalRawBefore, committedMarkerRaw: markerRawBefore, canonicalRawHash: builderComparisonRawHash(canonicalRawBefore), committedMarkerRawHash: builderComparisonRawHash(markerRawBefore) };
  } catch {
    return null;
  }
}

type LegacyBuilderComparisonEvent = {
  id: string;
  type: "created" | "updated";
  actor: "شما";
  at: string;
  version: number;
};

type LegacyBuilderProductComparisonInput = Omit<BuilderProposalComparisonInput, "proposalRevisionFingerprint" | "proposalRevisionSnapshot"> & {
  proposalRevisionFingerprint: Fnv1aFingerprint | Sha256Fingerprint;
};

type LegacyBuilderServiceComparisonInput = Omit<BuilderServiceProposalComparisonInput, "proposalRevisionFingerprint" | "proposalRevisionSnapshot"> & {
  proposalRevisionFingerprint: Fnv1aFingerprint | Sha256Fingerprint;
};

type LegacyBuilderProductComparisonRevision = {
  id: string;
  version: number;
  createdAt: string;
  inputs: LegacyBuilderProductComparisonInput[];
  results: BuilderProposalComparisonProposalResult[];
  recommendation: BuilderProposalComparisonRecommendation;
  fingerprint: Fnv1aFingerprint;
};

type LegacyBuilderServiceComparisonRevision = {
  id: string;
  version: number;
  createdAt: string;
  inputs: LegacyBuilderServiceComparisonInput[];
  results: BuilderServiceProposalComparisonProposalResult[];
  summary: BuilderServiceProposalComparisonSummary;
  fingerprint: Fnv1aFingerprint;
};

type LegacyBuilderProductComparisonRecord = {
  schemaVersion: 1;
  id: string;
  projectId: string;
  purpose: "compare-builder-recorded-product-proposals";
  target: BuilderComparisonTargetPin & { requestKind: "product" };
  requestSnapshot: BuilderRecordedProposalRequestSnapshot;
  currentRevisionId: string;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  externalEffect: "none";
  networkUsed: false;
  aiUsed: false;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: LegacyBuilderComparisonEvent[];
  revisions: LegacyBuilderProductComparisonRevision[];
};

type LegacyBuilderServiceComparisonRecord = {
  schemaVersion: 1;
  id: string;
  projectId: string;
  purpose: "compare-builder-recorded-service-proposals";
  target: BuilderComparisonTargetPin & { requestKind: "service" };
  requestSnapshot: BuilderServiceProposalComparisonRequestSnapshot;
  currentRevisionId: string;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  externalEffect: "none";
  networkUsed: false;
  aiUsed: false;
  scoringUsed: false;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: LegacyBuilderComparisonEvent[];
  revisions: LegacyBuilderServiceComparisonRevision[];
};

const legacyProductComparisonRecordKeys = ["schemaVersion", "id", "projectId", "purpose", "target", "requestSnapshot", "currentRevisionId", "visibility", "localStatus", "externalEffect", "networkUsed", "aiUsed", "version", "createdAt", "updatedAt", "history", "revisions"] as const;
const legacyServiceComparisonRecordKeys = ["schemaVersion", "id", "projectId", "purpose", "target", "requestSnapshot", "currentRevisionId", "visibility", "localStatus", "externalEffect", "networkUsed", "aiUsed", "scoringUsed", "version", "createdAt", "updatedAt", "history", "revisions"] as const;
const legacyEventKeys = ["id", "type", "actor", "at", "version"] as const;
const legacyProductRevisionKeys = ["id", "version", "createdAt", "inputs", "results", "recommendation", "fingerprint"] as const;
const legacyServiceRevisionKeys = ["id", "version", "createdAt", "inputs", "results", "summary", "fingerprint"] as const;
const legacyProductInputKeys = ["proposalId", "proposalVersion", "proposalRevisionId", "proposalRevisionFingerprint", "supplierSnapshot", "lineAdjustments", "taxTreatment", "transportTreatment"] as const;
const legacyServiceInputKeys = ["proposalId", "proposalVersion", "proposalRevisionId", "proposalRevisionFingerprint", "proposalLineId", "serviceSpecId", "supplierSnapshot", "criteria"] as const;

function comparisonMigrationDependencyHash(
  kind: "product" | "service",
  context: BuilderComparisonReadContext & { authority: ProcurementDispatchAuthority; dependencies: BuilderProposalDependencies },
  proposalAuthority: ResolvedBuilderComparisonProposalAuthority,
) {
  return builderComparisonHash({
    schemaVersion: 1,
    store: kind === "product" ? "builder-product-comparison" : "builder-service-comparison",
    authoritySnapshotHash: context.authority.snapshotHash,
    identityBindingHash: context.authority.identityBindingHash,
    proposalCanonicalRawHash: proposalAuthority.canonicalRawHash,
    proposalCommittedMarkerRawHash: proposalAuthority.committedMarkerRawHash,
    proposalStoreVersion: proposalAuthority.envelope.storeVersion,
    proposalEnvelopeFingerprint: proposalAuthority.envelope.fingerprint,
    proposalDependencySnapshotHash: context.dependencies.snapshotHash,
  });
}

function resolveLegacyProposalInput(
  value: unknown,
  kind: "product" | "service",
  projectId: string,
  proposals: BuilderProposalEnvelope,
): { source: LegacyBuilderProductComparisonInput | LegacyBuilderServiceComparisonInput; proposal: BuilderRecordedProposalRecord; revision: BuilderRecordedProposalRevision } | null {
  if (!hasExactKeys(value, kind === "product" ? legacyProductInputKeys : legacyServiceInputKeys)) return null;
  const source = value as LegacyBuilderProductComparisonInput | LegacyBuilderServiceComparisonInput;
  if (!exactString(source.proposalId, 300) || !exactInteger(source.proposalVersion) || !exactString(source.proposalRevisionId, 300)
    || !(exactFnv1a(source.proposalRevisionFingerprint) || exactSha256(source.proposalRevisionFingerprint))) return null;
  const proposal = proposals.records.find((record) => record.id === source.proposalId && record.projectId === projectId && record.target.requestKind === kind);
  const revision = proposal?.revisions.find((item) => item.id === source.proposalRevisionId && item.version === source.proposalVersion);
  if (!proposal || !revision || !builderProposalRevisionFingerprintMatches(proposal, revision, source.proposalRevisionFingerprint)
    || !exactDeepEqual(source.supplierSnapshot, revision.supplierSnapshot)) return null;
  return { source, proposal, revision };
}

function canonicalProductInput(
  resolved: ReturnType<typeof resolveLegacyProposalInput>,
  target: BuilderComparisonTargetPin,
) {
  if (!resolved) return null;
  const source = resolved.source as LegacyBuilderProductComparisonInput;
  const input: BuilderProposalComparisonInput = {
    proposalId: source.proposalId,
    proposalVersion: source.proposalVersion,
    proposalRevisionId: source.proposalRevisionId,
    proposalRevisionFingerprint: resolved.revision.fingerprint,
    proposalRevisionSnapshot: structuredClone(resolved.revision),
    supplierSnapshot: structuredClone(source.supplierSnapshot),
    lineAdjustments: structuredClone(source.lineAdjustments),
    taxTreatment: structuredClone(source.taxTreatment),
    transportTreatment: structuredClone(source.transportTreatment),
  };
  return productInputIsValid(input, target) ? input : null;
}

function canonicalServiceInput(
  resolved: ReturnType<typeof resolveLegacyProposalInput>,
  target: BuilderComparisonTargetPin,
  requestSnapshot: BuilderServiceProposalComparisonRequestSnapshot,
) {
  if (!resolved) return null;
  const source = resolved.source as LegacyBuilderServiceComparisonInput;
  const input: BuilderServiceProposalComparisonInput = {
    proposalId: source.proposalId,
    proposalVersion: source.proposalVersion,
    proposalRevisionId: source.proposalRevisionId,
    proposalRevisionFingerprint: resolved.revision.fingerprint,
    proposalRevisionSnapshot: structuredClone(resolved.revision),
    proposalLineId: source.proposalLineId,
    serviceSpecId: source.serviceSpecId,
    supplierSnapshot: structuredClone(source.supplierSnapshot),
    criteria: structuredClone(source.criteria),
  };
  return serviceInputIsValid(input, target, requestSnapshot) ? input : null;
}

function parseLegacyComparisonHistory(value: unknown, version: number) {
  if (!Array.isArray(value) || value.length !== version) return null;
  const ids = new Set<string>();
  const history: LegacyBuilderComparisonEvent[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const event = value[index];
    if (!hasExactKeys(event, legacyEventKeys)) return null;
    const item = event as LegacyBuilderComparisonEvent;
    if (!exactString(item.id, 300) || ids.has(item.id) || item.actor !== "شما" || item.version !== index + 1
      || item.type !== (index === 0 ? "created" : "updated") || !exactDate(item.at)
      || index > 0 && Date.parse(item.at) < Date.parse(history[index - 1].at)) return null;
    ids.add(item.id);
    history.push(item);
  }
  return history;
}

function parseLegacyProductComparison(
  value: unknown,
  sourceIndex: number,
  context: BuilderComparisonReadContext & { authority: ProcurementDispatchAuthority; dependencies: BuilderProposalDependencies },
  proposalAuthority: ResolvedBuilderComparisonProposalAuthority,
  dependencySnapshotHash: Sha256Fingerprint,
) {
  if (!hasExactKeys(value, legacyProductComparisonRecordKeys)) return null;
  const source = value as LegacyBuilderProductComparisonRecord;
  if (source.schemaVersion !== 1 || !exactString(source.id, 300) || !exactString(source.projectId, 200) || !context.authority.projectIds.includes(source.projectId)
    || source.purpose !== "compare-builder-recorded-product-proposals" || !targetIsValid(source.target, "product") || !productRequestSnapshotIsValid(source.requestSnapshot)
    || source.visibility !== "خصوصی پروژه" || source.localStatus !== "ثبت محلی" || source.externalEffect !== "none" || source.networkUsed !== false || source.aiUsed !== false
    || !exactInteger(source.version) || source.version > 100 || !exactDate(source.createdAt) || !exactDate(source.updatedAt) || Date.parse(source.updatedAt) < Date.parse(source.createdAt)
    || !exactString(source.currentRevisionId, 300) || !Array.isArray(source.revisions) || source.revisions.length !== source.version) return null;
  const legacyHistory = parseLegacyComparisonHistory(source.history, source.version);
  if (!legacyHistory || source.createdAt !== legacyHistory[0]?.at || source.updatedAt !== legacyHistory.at(-1)?.at) return null;
  const revisions: BuilderProductComparisonRevision[] = [];
  const links: BuilderComparisonLegacyEvidence["revisionLinks"] = [];
  const revisionIds = new Set<string>();
  for (let index = 0; index < source.revisions.length; index += 1) {
    const legacyRevision = source.revisions[index];
    if (!hasExactKeys(legacyRevision, legacyProductRevisionKeys) || !exactString(legacyRevision.id, 300) || revisionIds.has(legacyRevision.id)
      || legacyRevision.version !== index + 1 || legacyRevision.createdAt !== legacyHistory[index].at || !Array.isArray(legacyRevision.inputs)
      || legacyRevision.inputs.length < 2 || legacyRevision.inputs.length > 8 || !exactFnv1a(legacyRevision.fingerprint)) return null;
    const resolvedInputs = legacyRevision.inputs.map((input) => resolveLegacyProposalInput(input, "product", source.projectId, proposalAuthority.envelope));
    const inputs = resolvedInputs.map((item) => canonicalProductInput(item, source.target));
    if (resolvedInputs.some((item) => item === null) || inputs.some((input) => input === null)
      || new Set(resolvedInputs.map((item) => item!.source.proposalId)).size !== resolvedInputs.length
      || inputs.some((input) => !stableEqual(comparisonCommandTarget(input!), source.target))
      || resolvedInputs.some((item) => !exactDeepEqual(item!.revision.requestSnapshot, source.requestSnapshot)
        || Date.parse(legacyRevision.createdAt) < Date.parse(item!.revision.createdAt))) return null;
    const canonicalInputs = inputs as BuilderProposalComparisonInput[];
    const derived = deriveBuilderProposalComparisonPayload(canonicalInputs);
    if (!derived || !exactDeepEqual(legacyRevision.results, derived.results) || !exactDeepEqual(legacyRevision.recommendation, derived.recommendation)) return null;
    const legacyPayload = { id: legacyRevision.id, version: legacyRevision.version, createdAt: legacyRevision.createdAt, inputs: legacyRevision.inputs, results: legacyRevision.results, recommendation: legacyRevision.recommendation };
    if (legacyRevision.fingerprint !== legacyComparisonFnvHash({ projectId: source.projectId, target: source.target, requestSnapshot: source.requestSnapshot, revision: legacyPayload })) return null;
    const revision = finalWithFingerprint({ schemaVersion: 2 as const, kind: "product" as const, comparisonId: source.id, projectId: source.projectId, scopeId: source.projectId, target: source.target, id: legacyRevision.id, version: legacyRevision.version, createdAt: legacyRevision.createdAt, inputs: canonicalInputs, results: derived.results, recommendation: derived.recommendation });
    revisions.push(revision);
    links.push({
      revisionId: revision.id,
      revisionVersion: revision.version,
      sourceRevisionValueHash: builderComparisonHash(legacyRevision),
      proposalFingerprintClaims: legacyRevision.inputs.map((input) => ({ proposalId: input.proposalId, proposalRevisionId: input.proposalRevisionId, claimedFingerprint: input.proposalRevisionFingerprint })),
      legacyFingerprint: legacyRevision.fingerprint,
      canonicalFingerprint: revision.fingerprint,
    });
    revisionIds.add(revision.id);
  }
  if (source.currentRevisionId !== revisions.at(-1)?.id || revisions[0]?.createdAt !== source.createdAt || revisions.at(-1)?.createdAt !== source.updatedAt
    || revisions.some((revision, index) => index > 0 && stableEqual(builderProposalComparisonSemanticValue(revision), builderProposalComparisonSemanticValue(revisions[index - 1])))) return null;
  const history = legacyHistory.map((event, index) => finalWithFingerprint({
    schemaVersion: 1 as const,
    kind: "product" as const,
    comparisonId: source.id,
    projectId: source.projectId,
    scopeId: source.projectId,
    id: event.id,
    type: event.type,
    actor: event.actor,
    actorPrincipalId: "local-builder-account" as const,
    origin: "v1-migration" as const,
    at: event.at,
    version: event.version,
    revisionId: revisions[index].id,
    authorizationContextHash: context.authority.authorizationHashes[source.projectId] as Sha256Fingerprint,
    dependencySnapshotHash,
    idempotencyKey: null,
    commandPayloadHash: null,
  }));
  const evidence = finalWithFingerprint({
    schemaVersion: 1 as const,
    kind: "product" as const,
    sourceKey: legacyBuilderProductComparisonsStorageKey,
    comparisonId: source.id,
    projectId: source.projectId,
    sourceGeneration: "v1-array" as const,
    sourceIndex,
    sourceRecordHash: builderComparisonHash(source),
    sourceRecordVersion: source.version,
    sourceCreatedAt: source.createdAt,
    sourceUpdatedAt: source.updatedAt,
    revisionLinks: links,
  });
  const record = finalWithFingerprint({
    schemaVersion: 2 as const,
    objectType: "builder-product-proposal-comparison" as const,
    id: source.id,
    projectId: source.projectId,
    ownerPrincipalType: "account" as const,
    ownerPrincipalId: "local-builder-account" as const,
    accountSide: "builder" as const,
    scopeType: "project_private" as const,
    scopeId: source.projectId,
    custodianService: "Comparison Domain Service" as const,
    sensitivity: "private" as const,
    purpose: source.purpose,
    target: source.target,
    requestSnapshot: source.requestSnapshot,
    currentRevisionId: source.currentRevisionId,
    visibility: source.visibility,
    localStatus: source.localStatus,
    externalEffect: source.externalEffect,
    networkUsed: false,
    aiUsed: false,
    version: source.version,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    history,
    revisions,
    legacyEvidence: evidence,
  });
  return productRecordIsValid(record, context.authority) ? record : null;
}

function parseLegacyServiceComparison(
  value: unknown,
  sourceIndex: number,
  context: BuilderComparisonReadContext & { authority: ProcurementDispatchAuthority; dependencies: BuilderProposalDependencies },
  proposalAuthority: ResolvedBuilderComparisonProposalAuthority,
  dependencySnapshotHash: Sha256Fingerprint,
) {
  if (!hasExactKeys(value, legacyServiceComparisonRecordKeys)) return null;
  const source = value as LegacyBuilderServiceComparisonRecord;
  if (source.schemaVersion !== 1 || !exactString(source.id, 300) || !exactString(source.projectId, 200) || !context.authority.projectIds.includes(source.projectId)
    || source.purpose !== "compare-builder-recorded-service-proposals" || !targetIsValid(source.target, "service") || !serviceRequestSnapshotIsValid(source.requestSnapshot)
    || source.visibility !== "خصوصی پروژه" || source.localStatus !== "ثبت محلی" || source.externalEffect !== "none" || source.networkUsed !== false || source.aiUsed !== false || source.scoringUsed !== false
    || !exactInteger(source.version) || source.version > 100 || !exactDate(source.createdAt) || !exactDate(source.updatedAt) || Date.parse(source.updatedAt) < Date.parse(source.createdAt)
    || !exactString(source.currentRevisionId, 300) || !Array.isArray(source.revisions) || source.revisions.length !== source.version) return null;
  const matchingRequests = context.dependencies.requestRevisions.filter((request) => request.projectId === source.projectId && request.requestId === source.target.requestId
    && request.requestVersion === source.target.requestVersion && request.revisionId === source.target.reviewRevisionId && request.revisionFingerprint === source.target.reviewRevisionFingerprint && request.requestKind === "service");
  const expectedRequestSnapshot = matchingRequests.length === 1 ? builderServiceProposalComparisonRequestSnapshotFromReview(matchingRequests[0].snapshot as ServiceReviewSnapshot) : null;
  if (!expectedRequestSnapshot || !exactDeepEqual(expectedRequestSnapshot, source.requestSnapshot)) return null;
  const legacyHistory = parseLegacyComparisonHistory(source.history, source.version);
  if (!legacyHistory || source.createdAt !== legacyHistory[0]?.at || source.updatedAt !== legacyHistory.at(-1)?.at) return null;
  const revisions: BuilderServiceComparisonRevision[] = [];
  const links: BuilderComparisonLegacyEvidence["revisionLinks"] = [];
  const revisionIds = new Set<string>();
  for (let index = 0; index < source.revisions.length; index += 1) {
    const legacyRevision = source.revisions[index];
    if (!hasExactKeys(legacyRevision, legacyServiceRevisionKeys) || !exactString(legacyRevision.id, 300) || revisionIds.has(legacyRevision.id)
      || legacyRevision.version !== index + 1 || legacyRevision.createdAt !== legacyHistory[index].at || !Array.isArray(legacyRevision.inputs)
      || legacyRevision.inputs.length < 2 || legacyRevision.inputs.length > 8 || !exactFnv1a(legacyRevision.fingerprint)) return null;
    const resolvedInputs = legacyRevision.inputs.map((input) => resolveLegacyProposalInput(input, "service", source.projectId, proposalAuthority.envelope));
    const inputs = resolvedInputs.map((item) => canonicalServiceInput(item, source.target, source.requestSnapshot));
    if (resolvedInputs.some((item) => item === null) || inputs.some((input) => input === null)
      || new Set(resolvedInputs.map((item) => item!.source.proposalId)).size !== resolvedInputs.length
      || inputs.some((input) => !stableEqual(comparisonCommandTarget(input!), source.target))
      || resolvedInputs.some((item) => Date.parse(legacyRevision.createdAt) < Date.parse(item!.revision.createdAt))
      || Date.parse(legacyRevision.createdAt) < Date.parse(matchingRequests[0].revisionCreatedAt)) return null;
    const canonicalInputs = inputs as BuilderServiceProposalComparisonInput[];
    const derived = deriveBuilderServiceProposalComparisonPayload(canonicalInputs, undefined, source.requestSnapshot);
    if (!derived || !exactDeepEqual(legacyRevision.results, derived.results) || !exactDeepEqual(legacyRevision.summary, derived.summary)) return null;
    const legacyPayload = { id: legacyRevision.id, version: legacyRevision.version, createdAt: legacyRevision.createdAt, inputs: legacyRevision.inputs, results: legacyRevision.results, summary: legacyRevision.summary };
    if (legacyRevision.fingerprint !== legacyComparisonFnvHash({ projectId: source.projectId, target: source.target, requestSnapshot: source.requestSnapshot, revision: legacyPayload })) return null;
    const revision = finalWithFingerprint({ schemaVersion: 2 as const, kind: "service" as const, comparisonId: source.id, projectId: source.projectId, scopeId: source.projectId, target: source.target, id: legacyRevision.id, version: legacyRevision.version, createdAt: legacyRevision.createdAt, inputs: canonicalInputs, results: derived.results, summary: derived.summary });
    revisions.push(revision);
    links.push({
      revisionId: revision.id,
      revisionVersion: revision.version,
      sourceRevisionValueHash: builderComparisonHash(legacyRevision),
      proposalFingerprintClaims: legacyRevision.inputs.map((input) => ({ proposalId: input.proposalId, proposalRevisionId: input.proposalRevisionId, claimedFingerprint: input.proposalRevisionFingerprint })),
      legacyFingerprint: legacyRevision.fingerprint,
      canonicalFingerprint: revision.fingerprint,
    });
    revisionIds.add(revision.id);
  }
  if (source.currentRevisionId !== revisions.at(-1)?.id || revisions[0]?.createdAt !== source.createdAt || revisions.at(-1)?.createdAt !== source.updatedAt
    || revisions.some((revision, index) => index > 0 && stableEqual(builderServiceProposalComparisonSemanticValue(revision), builderServiceProposalComparisonSemanticValue(revisions[index - 1])))) return null;
  const history = legacyHistory.map((event, index) => finalWithFingerprint({
    schemaVersion: 1 as const,
    kind: "service" as const,
    comparisonId: source.id,
    projectId: source.projectId,
    scopeId: source.projectId,
    id: event.id,
    type: event.type,
    actor: event.actor,
    actorPrincipalId: "local-builder-account" as const,
    origin: "v1-migration" as const,
    at: event.at,
    version: event.version,
    revisionId: revisions[index].id,
    authorizationContextHash: context.authority.authorizationHashes[source.projectId] as Sha256Fingerprint,
    dependencySnapshotHash,
    idempotencyKey: null,
    commandPayloadHash: null,
  }));
  const evidence = finalWithFingerprint({
    schemaVersion: 1 as const,
    kind: "service" as const,
    sourceKey: legacyBuilderServiceComparisonsStorageKey,
    comparisonId: source.id,
    projectId: source.projectId,
    sourceGeneration: "v1-array" as const,
    sourceIndex,
    sourceRecordHash: builderComparisonHash(source),
    sourceRecordVersion: source.version,
    sourceCreatedAt: source.createdAt,
    sourceUpdatedAt: source.updatedAt,
    revisionLinks: links,
  });
  const record = finalWithFingerprint({
    schemaVersion: 2 as const,
    objectType: "builder-service-proposal-comparison" as const,
    id: source.id,
    projectId: source.projectId,
    ownerPrincipalType: "account" as const,
    ownerPrincipalId: "local-builder-account" as const,
    accountSide: "builder" as const,
    scopeType: "project_private" as const,
    scopeId: source.projectId,
    custodianService: "Comparison Domain Service" as const,
    sensitivity: "private" as const,
    purpose: source.purpose,
    target: source.target,
    requestSnapshot: source.requestSnapshot,
    currentRevisionId: source.currentRevisionId,
    visibility: source.visibility,
    localStatus: source.localStatus,
    externalEffect: source.externalEffect,
    networkUsed: false,
    aiUsed: false,
    scoringUsed: false,
    version: source.version,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    history,
    revisions,
    legacyEvidence: evidence,
  });
  return serviceRecordIsValid(record, context.authority) ? record : null;
}

function buildComparisonMigrationCandidate(
  kind: "product" | "service",
  sourceRaw: string | null,
  context: BuilderComparisonReadContext & { authority: ProcurementDispatchAuthority; dependencies: BuilderProposalDependencies },
  proposalAuthority: ResolvedBuilderComparisonProposalAuthority,
  fixedMigrationAt?: string,
) {
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
  const dependencySnapshotHash = comparisonMigrationDependencyHash(kind, context, proposalAuthority);
  const records: Array<BuilderProductComparisonRecord | BuilderServiceComparisonRecord> = [];
  const ids = new Set<string>();
  const eventIds = new Set<string>();
  const revisionIds = new Set<string>();
  const projectCounts = new Map<string, number>();
  for (let index = 0; index < values.length; index += 1) {
    const record = kind === "product"
      ? parseLegacyProductComparison(values[index], index, context, proposalAuthority, dependencySnapshotHash)
      : parseLegacyServiceComparison(values[index], index, context, proposalAuthority, dependencySnapshotHash);
    if (!record || ids.has(record.id) || record.history.some((event) => eventIds.has(event.id)) || record.revisions.some((revision) => revisionIds.has(revision.id))) return null;
    const count = (projectCounts.get(record.projectId) ?? 0) + 1;
    if (count > 100) return null;
    ids.add(record.id);
    record.history.forEach((event) => eventIds.add(event.id));
    record.revisions.forEach((revision) => revisionIds.add(revision.id));
    projectCounts.set(record.projectId, count);
    records.push(record);
  }
  const dependencyTimes = [
    ...context.dependencies.requestRevisions.map((request) => Date.parse(request.revisionCreatedAt)),
    ...context.dependencies.contentApprovals.map((approval) => Date.parse(approval.updatedAt)),
    ...context.dependencies.contacts.flatMap((contact) => [Date.parse(contact.revisionCreatedAt), ...(contact.archivedAt === null ? [] : [Date.parse(contact.archivedAt)])]),
    ...context.dependencies.files.flatMap((file) => [Date.parse(file.createdAt), ...(file.sourceModifiedAt === null ? [] : [Date.parse(file.sourceModifiedAt)])]),
    ...records.flatMap((record) => record.revisions.flatMap((revision) => [Date.parse(revision.createdAt), ...revision.inputs.map((input) => Date.parse(input.proposalRevisionSnapshot.createdAt))])),
    ...records.map((record) => Date.parse(record.updatedAt)),
  ];
  if (dependencyTimes.some((time) => !Number.isFinite(time))) return null;
  const latestPreimageAt = Math.max(0, ...dependencyTimes);
  if (fixedMigrationAt !== undefined && (!exactDate(fixedMigrationAt) || Date.parse(fixedMigrationAt) < latestPreimageAt)) return null;
  const migratedAt = fixedMigrationAt ?? new Date(Math.max(Date.now(), latestPreimageAt)).toISOString();
  const store = kind === "product" ? "builder-product-comparison" as const : "builder-service-comparison" as const;
  const sourceGeneration = sourceRaw === null ? "none" as const : "v1-array" as const;
  const sourceKey: BuilderComparisonMigrationReport["sourceKey"] = sourceRaw === null
    ? null
    : kind === "product"
      ? legacyBuilderProductComparisonsStorageKey
      : legacyBuilderServiceComparisonsStorageKey;
  const sourceRawHash = sourceRaw === null ? null : builderComparisonRawHash(sourceRaw);
  const reportBase = {
    schemaVersion: 1 as const,
    id: "",
    store,
    sourceGeneration,
    sourceKey,
    sourceRawHash,
    dependencySnapshotHash,
    identityBindingHash: context.authority.identityBindingHash as Sha256Fingerprint,
    migratedAt,
    recordCount: records.length,
    migratedRecordFingerprints: records.map((record) => record.fingerprint),
    migratedRevisionCount: records.reduce((count, record) => count + record.version, 0),
  };
  const report = finalWithFingerprint({ ...reportBase, id: migrationIdFor({ ...reportBase, fingerprint: "" as Sha256Fingerprint }, store) });
  const sortedRecords = [...records].sort((left, right) => compareUnicodeCodePoints(left.id, right.id));
  const envelope = finalWithFingerprint({
    schemaVersion: 2 as const,
    fingerprintVersion: kind === "product" ? "builder-product-comparison-domain-v2" as const : "builder-service-comparison-domain-v2" as const,
    storeVersion: 1,
    records: sortedRecords,
    idempotencyReceipts: [] as BuilderComparisonCommandReceipt[],
    migrationReports: [report] as [BuilderComparisonMigrationReport],
    updatedAt: migratedAt,
  });
  const raw = JSON.stringify(envelope);
  return envelopeIsValid(envelope, kind, context.authority) ? { envelope, raw } : null;
}

function comparisonHistoryResolvesAgainstProposalAuthority(
  envelope: BuilderProductComparisonEnvelope | BuilderServiceComparisonEnvelope,
  proposals: BuilderProposalEnvelope,
) {
  return envelope.records.every((record) => record.revisions.every((revision, revisionIndex) => {
    const legacyLink = record.legacyEvidence && revisionIndex < record.legacyEvidence.sourceRecordVersion
      ? record.legacyEvidence.revisionLinks[revisionIndex]
      : null;
    return revision.inputs.every((input, inputIndex) => {
      const proposal = proposals.records.find((item) => item.id === input.proposalId && item.projectId === record.projectId && item.target.requestKind === revision.kind);
      const proposalRevision = proposal?.revisions.find((item) => item.id === input.proposalRevisionId && item.version === input.proposalVersion);
      const legacyClaim = legacyLink?.proposalFingerprintClaims[inputIndex];
      return Boolean(proposal && proposalRevision
        && builderProposalRevisionFingerprintMatches(proposal, proposalRevision, input.proposalRevisionFingerprint)
        && exactDeepEqual(proposalRevision, input.proposalRevisionSnapshot)
        && (!legacyLink || legacyClaim
          && legacyClaim.proposalId === input.proposalId
          && legacyClaim.proposalRevisionId === input.proposalRevisionId
          && builderProposalRevisionFingerprintMatches(proposal, proposalRevision, legacyClaim.claimedFingerprint)));
    });
  }));
}

function exactStorageWrite(key: string, raw: string) {
  window.localStorage.setItem(key, raw);
  return window.localStorage.getItem(key) === raw;
}

function nextComparisonCutoverTimestamp(previous: string) {
  return new Date(Math.max(Date.now(), Date.parse(previous))).toISOString();
}

function readComparisonInitializationContext(reader: BuilderComparisonContextReader) {
  try {
    const context = reader();
    return hasExactKeys(context, ["authority", "dependencies"]) && authorityIsValid(context.authority) ? context : null;
  } catch {
    return null;
  }
}

type BuilderComparisonMigrationContext = {
  context: BuilderComparisonReadContext & { authority: ProcurementDispatchAuthority; dependencies: BuilderProposalDependencies };
  proposalAuthority: ResolvedBuilderComparisonProposalAuthority;
};

function readComparisonMigrationContext(reader: BuilderComparisonContextReader): BuilderComparisonMigrationContext | null {
  const context = readComparisonInitializationContext(reader);
  if (!context?.dependencies || !exactSha256(context.dependencies.snapshotHash) || !exactDeepEqual(context.dependencies.authority, context.authority)) return null;
  const proposalAuthority = readBuilderComparisonProposalAuthority(context);
  if (!proposalAuthority) return null;
  const proposalState = readBuilderProposalState(context);
  if (proposalState.status !== "ready"
    || window.localStorage.getItem(builderProposalsStorageKey) !== proposalAuthority.canonicalRaw
    || window.localStorage.getItem(builderProposalsCutoverMarkerKey) !== proposalAuthority.committedMarkerRaw) return null;
  return { context: context as BuilderComparisonMigrationContext["context"], proposalAuthority };
}

function migrationContextMatches(first: BuilderComparisonMigrationContext, second: BuilderComparisonMigrationContext) {
  return exactDeepEqual(first.context, second.context)
    && first.proposalAuthority.canonicalRaw === second.proposalAuthority.canonicalRaw
    && first.proposalAuthority.committedMarkerRaw === second.proposalAuthority.committedMarkerRaw;
}

function sourceMatchesComparisonMarker(marker: BuilderComparisonPendingMarker | BuilderComparisonVerifiedMarker, sourceRaw: string | null, kind: "product" | "service") {
  const expectedSourceKey = kind === "product" ? legacyBuilderProductComparisonsStorageKey : legacyBuilderServiceComparisonsStorageKey;
  return marker.sourceGeneration === "none"
    ? sourceRaw === null && marker.sourceKey === null && marker.sourceRawHash === null
    : sourceRaw !== null && marker.sourceKey === expectedSourceKey && marker.sourceRawHash === builderComparisonRawHash(sourceRaw);
}

function validateComparisonCutoverPreimage(
  reader: BuilderComparisonContextReader,
  baseline: BuilderComparisonMigrationContext,
  kind: "product" | "service",
  sourceKey: string,
  storageKey: string,
  markerKey: string,
  expectedMarkerRaw: string,
  marker: BuilderComparisonPendingMarker | BuilderComparisonVerifiedMarker,
  canonicalMode: "absent" | "absent-or-candidate" | "candidate",
) {
  const current = readComparisonMigrationContext(reader);
  if (!current || !migrationContextMatches(baseline, current)) return false;
  const sourceRaw = window.localStorage.getItem(sourceKey);
  const canonicalRaw = window.localStorage.getItem(storageKey);
  const markerRaw = window.localStorage.getItem(markerKey);
  if (markerRaw !== expectedMarkerRaw || !sourceMatchesComparisonMarker(marker, sourceRaw, kind)
    || marker.identityBindingHash !== current.context.authority.identityBindingHash
    || marker.dependencySnapshotHash !== comparisonMigrationDependencyHash(kind, current.context, current.proposalAuthority)) return false;
  if (canonicalMode === "absent" && canonicalRaw !== null
    || canonicalMode === "absent-or-candidate" && canonicalRaw !== null && canonicalRaw !== marker.candidateRaw
    || canonicalMode === "candidate" && canonicalRaw !== marker.candidateRaw) return false;
  const rebuilt = buildComparisonMigrationCandidate(kind, sourceRaw, current.context, current.proposalAuthority, marker.migrationAt);
  return rebuilt?.raw === marker.candidateRaw && marker.candidateRawHash === builderComparisonRawHash(marker.candidateRaw);
}

async function initializeComparisonLocked<TEnvelope extends BuilderProductComparisonEnvelope | BuilderServiceComparisonEnvelope>(
  kind: "product" | "service",
  reader: BuilderComparisonContextReader,
  sourceKey: string,
  storageKey: string,
  markerKey: string,
): Promise<BuilderComparisonState<TEnvelope>> {
  const readError = (reason: string): BuilderComparisonState<TEnvelope> => ({ status: "read-error", envelope: null, dependencyStatus: "read-error", reason });
  try {
    const initialContext = readComparisonInitializationContext(reader);
    if (!initialContext) return readError("comparison-authority-invalid");
    let canonicalRaw = window.localStorage.getItem(storageKey);
    let markerRaw = window.localStorage.getItem(markerKey);
    const incidentAuthority = comparisonRollbackIncidentForCanonical(kind, canonicalRaw);
    if (!incidentAuthority || incidentAuthority.incident?.state === "prepared") return readError("comparison-rollback-incident");
    if (markerRaw !== null) {
      const existingMarker = parseMarkerRaw(markerRaw, kind, initialContext.authority!);
      if (!existingMarker) return readError("comparison-marker-invalid");
      if (existingMarker.state === "committed") return readComparisonState(initialContext, kind, storageKey, markerKey) as BuilderComparisonState<TEnvelope>;
      if (existingMarker.state === "pending" && canonicalRaw !== null) return readError("comparison-pending-canonical-present");
      if (existingMarker.state === "verified" && canonicalRaw !== null && canonicalRaw !== existingMarker.candidateRaw) return readError("comparison-verified-canonical-mismatch");
    } else if (canonicalRaw !== null) {
      return readError("comparison-canonical-without-marker");
    }
    const baseline = readComparisonMigrationContext(reader);
    if (!baseline) return readError("comparison-migration-dependency-invalid");

    let marker: BuilderComparisonPendingMarker | BuilderComparisonVerifiedMarker;
    if (markerRaw === null) {
      const sourceRaw = window.localStorage.getItem(sourceKey);
      const candidate = buildComparisonMigrationCandidate(kind, sourceRaw, baseline.context, baseline.proposalAuthority);
      if (!candidate) return readError("comparison-migration-source-invalid");
      const report = candidate.envelope.migrationReports[0];
      marker = finalWithFingerprint({
        schemaVersion: 1 as const,
        store: report.store,
        state: "pending" as const,
        migrationId: report.id,
        sourceGeneration: report.sourceGeneration,
        sourceKey: report.sourceKey,
        sourceRawHash: report.sourceRawHash,
        dependencySnapshotHash: report.dependencySnapshotHash,
        identityBindingHash: report.identityBindingHash,
        migrationAt: report.migratedAt,
        candidateRaw: candidate.raw,
        candidateRawHash: builderComparisonRawHash(candidate.raw),
      });
      markerRaw = JSON.stringify(marker);
      if (!exactStorageWrite(markerKey, markerRaw)) return readError("comparison-pending-write-failure");
    } else {
      const existingMarker = parseMarkerRaw(markerRaw, kind, baseline.context.authority);
      if (!existingMarker || existingMarker.state === "committed") return readError("comparison-resume-marker-invalid");
      marker = existingMarker;
    }

    if (!validateComparisonCutoverPreimage(reader, baseline, kind, sourceKey, storageKey, markerKey, markerRaw, marker, marker.state === "pending" ? "absent" : "absent-or-candidate")) return readError("comparison-precommit-drift");
    if (marker.state === "pending") {
      const verified = finalWithFingerprint({
        ...withoutFingerprint(marker),
        state: "verified" as const,
        verifiedAt: nextComparisonCutoverTimestamp(marker.migrationAt),
      }) as BuilderComparisonVerifiedMarker;
      markerRaw = JSON.stringify(verified);
      if (!exactStorageWrite(markerKey, markerRaw)) return readError("comparison-verified-write-failure");
      marker = verified;
    }

    if (!validateComparisonCutoverPreimage(reader, baseline, kind, sourceKey, storageKey, markerKey, markerRaw, marker, "absent-or-candidate")) return readError("comparison-precanonical-drift");
    canonicalRaw = window.localStorage.getItem(storageKey);
    if (canonicalRaw === null && !exactStorageWrite(storageKey, marker.candidateRaw)) return readError("comparison-canonical-write-failure");
    if (window.localStorage.getItem(storageKey) !== marker.candidateRaw) return readError("comparison-canonical-readback-failure");

    if (!validateComparisonCutoverPreimage(reader, baseline, kind, sourceKey, storageKey, markerKey, markerRaw, marker, "candidate")) return readError("comparison-precommit-drift");
    const committed = finalWithFingerprint({
      schemaVersion: 1 as const,
      store: marker.store,
      state: "committed" as const,
      migrationId: marker.migrationId,
      sourceGeneration: marker.sourceGeneration,
      sourceKey: marker.sourceKey,
      sourceRawHash: marker.sourceRawHash,
      dependencySnapshotHash: marker.dependencySnapshotHash,
      identityBindingHash: marker.identityBindingHash,
      migrationAt: marker.migrationAt,
      verifiedAt: marker.verifiedAt,
      committedAt: nextComparisonCutoverTimestamp(marker.verifiedAt),
      canonicalRawHash: marker.candidateRawHash,
      candidateRawHash: marker.candidateRawHash,
    }) as BuilderComparisonCommittedMarker;
    if (!exactStorageWrite(markerKey, JSON.stringify(committed))) return readError("comparison-committed-write-failure");
    return readComparisonState(baseline.context, kind, storageKey, markerKey) as BuilderComparisonState<TEnvelope>;
  } catch {
    return readError("comparison-initialization-failure");
  }
}

export async function initializeBuilderProductComparisons(reader: BuilderComparisonContextReader): Promise<BuilderComparisonState<BuilderProductComparisonEnvelope>> {
  try {
    const manager = window.navigator.locks;
    if (!manager?.request) return { status: "read-error", envelope: null, dependencyStatus: "read-error", reason: "comparison-lock-unavailable" };
    return await manager.request(comparisonWriteLockName, { mode: "exclusive" }, () => initializeComparisonLocked<BuilderProductComparisonEnvelope>("product", reader, legacyBuilderProductComparisonsStorageKey, builderProductComparisonsStorageKey, builderProductComparisonsCutoverMarkerKey));
  } catch {
    return { status: "read-error", envelope: null, dependencyStatus: "read-error", reason: "comparison-lock-failure" };
  }
}

export async function initializeBuilderServiceComparisons(reader: BuilderComparisonContextReader): Promise<BuilderComparisonState<BuilderServiceComparisonEnvelope>> {
  try {
    const manager = window.navigator.locks;
    if (!manager?.request) return { status: "read-error", envelope: null, dependencyStatus: "read-error", reason: "comparison-lock-unavailable" };
    return await manager.request(comparisonWriteLockName, { mode: "exclusive" }, () => initializeComparisonLocked<BuilderServiceComparisonEnvelope>("service", reader, legacyBuilderServiceComparisonsStorageKey, builderServiceComparisonsStorageKey, builderServiceComparisonsCutoverMarkerKey));
  } catch {
    return { status: "read-error", envelope: null, dependencyStatus: "read-error", reason: "comparison-lock-failure" };
  }
}

function comparisonCommandProposalPins(
  inputs: Array<BuilderProposalComparisonInput | BuilderServiceProposalComparisonInput>,
): BuilderComparisonProposalCommandPin[] {
  return inputs.map((input) => ({
    proposalId: input.proposalId,
    proposalVersion: input.proposalVersion,
    proposalRevisionId: input.proposalRevisionId,
    proposalRevisionFingerprint: input.proposalRevisionFingerprint,
    proposalRevisionSnapshotHash: builderComparisonHash({
      schemaVersion: 1,
      proposalId: input.proposalId,
      proposalVersion: input.proposalVersion,
      proposalRevisionId: input.proposalRevisionId,
      proposalRevisionFingerprint: input.proposalRevisionFingerprint,
      proposalRevisionSnapshot: input.proposalRevisionSnapshot,
    }),
  }));
}

function comparisonCommandTarget(
  input: BuilderProposalComparisonInput | BuilderServiceProposalComparisonInput,
): BuilderComparisonTargetPin {
  const { requestId, requestVersion, reviewRevisionId, reviewRevisionFingerprint, requestKind } = input.proposalRevisionSnapshot.target;
  return { requestId, requestVersion, reviewRevisionId, reviewRevisionFingerprint, requestKind };
}

function comparisonCommandPinsBase(
  kind: "product" | "service",
  projectId: string,
  inputs: Array<BuilderProposalComparisonInput | BuilderServiceProposalComparisonInput>,
  context: BuilderComparisonReadContext,
  resolved: ResolvedBuilderComparisonProposalAuthority,
) {
  if (!context.dependencies || !inputs.length) return null;
  const target = comparisonCommandTarget(inputs[0]);
  const requestSnapshot = inputs[0].proposalRevisionSnapshot.requestSnapshot;
  if (target.requestKind !== kind || !inputs.every((input) => stableEqual(comparisonCommandTarget(input), target)
    && stableEqual(input.proposalRevisionSnapshot.requestSnapshot, requestSnapshot))) return null;
  const proposalPins = comparisonCommandProposalPins(inputs);
  const common = {
    schemaVersion: 1 as const,
    kind,
    authorizationContextHash: context.authority!.authorizationHashes[projectId] as Sha256Fingerprint,
    identityBindingHash: context.authority!.identityBindingHash as Sha256Fingerprint,
    proposalStoreVersion: resolved.envelope.storeVersion,
    proposalEnvelopeFingerprint: resolved.envelope.fingerprint,
    proposalDependencySnapshotHash: context.dependencies.snapshotHash,
    target,
    requestSnapshotHash: builderComparisonHash({ schemaVersion: 1, kind, projectId, target, requestSnapshot }),
    proposalPins,
  };
  return { common, requestSnapshot };
}

export function builderProductComparisonCommandPinsForDraft(
  projectId: string,
  draft: BuilderProductComparisonDraft,
  context: BuilderComparisonReadContext,
): BuilderProductComparisonCommandPins | null {
  if (!exactString(projectId, 200) || !authorityIsValid(context.authority) || !context.dependencies
    || !stableEqual(context.authority, context.dependencies.authority) || !context.authority.projectIds.includes(projectId)) return null;
  const resolved = readBuilderComparisonProposalAuthority(context);
  if (!resolved) return null;
  const projectProposals = resolved.envelope.records.filter((proposal) => proposal.projectId === projectId);
  const inputs = normalizeBuilderProposalComparisonInputs(draft, projectProposals);
  if (!inputs || !inputs.every((input) => {
    const proposal = projectProposals.find((item) => item.id === input.proposalId);
    return Boolean(proposal && builderProposalRecordIsCurrent(proposal, context.dependencies!));
  })) return null;
  const base = comparisonCommandPinsBase("product", projectId, inputs, context, resolved);
  if (!base || !productRequestSnapshotIsValid(base.requestSnapshot)) return null;
  const dependencyPreimage = {
    ...base.common,
    projectId,
    serviceRequestSnapshotHash: null,
  };
  return {
    ...base.common,
    kind: "product",
    target: base.common.target as BuilderProductComparisonCommandPins["target"],
    expectedDependencySnapshotHash: builderComparisonHash(dependencyPreimage),
  };
}

export function builderServiceComparisonCommandPinsForDraft(
  projectId: string,
  draft: BuilderServiceComparisonDraft,
  context: BuilderComparisonReadContext,
): BuilderServiceComparisonCommandPins | null {
  if (!exactString(projectId, 200) || !authorityIsValid(context.authority) || !context.dependencies
    || !stableEqual(context.authority, context.dependencies.authority) || !context.authority.projectIds.includes(projectId)) return null;
  const resolved = readBuilderComparisonProposalAuthority(context);
  if (!resolved) return null;
  const requestDependency = context.dependencies.requestRevisions.find((request) => request.projectId === projectId
    && [request.requestId, request.requestVersion, request.revisionId, request.revisionFingerprint].join(":") === draft.requestKey);
  const serviceRequestSnapshot = requestDependency
    ? builderServiceProposalComparisonRequestSnapshotFromReview(requestDependency.snapshot as ServiceReviewSnapshot)
    : null;
  if (!serviceRequestSnapshot || !serviceRequestSnapshotIsValid(serviceRequestSnapshot)) return null;
  const projectProposals = resolved.envelope.records.filter((proposal) => proposal.projectId === projectId);
  const inputs = normalizeBuilderServiceProposalComparisonInputs(draft, projectProposals, serviceRequestSnapshot);
  if (!inputs || !inputs.every((input) => {
    const proposal = projectProposals.find((item) => item.id === input.proposalId);
    return Boolean(proposal && builderProposalRecordIsCurrent(proposal, context.dependencies!));
  })) return null;
  const base = comparisonCommandPinsBase("service", projectId, inputs, context, resolved);
  if (!base) return null;
  const serviceRequestSnapshotHash = builderComparisonHash({ schemaVersion: 1, kind: "service", projectId, target: base.common.target, serviceRequestSnapshot });
  const dependencyPreimage = {
    ...base.common,
    projectId,
    serviceRequestSnapshotHash,
  };
  return {
    ...base.common,
    kind: "service",
    target: base.common.target as BuilderServiceComparisonCommandPins["target"],
    serviceRequestSnapshotHash,
    expectedDependencySnapshotHash: builderComparisonHash(dependencyPreimage),
  };
}

function comparisonEffectiveStatus(
  comparison: BuilderProductComparisonRecord | BuilderServiceComparisonRecord,
  proposals: BuilderProposalEnvelope,
  dependencies: BuilderProposalDependencies,
  revisionId: string,
) {
  if (revisionId !== comparison.currentRevisionId) return "needs-review" as const;
  const revision = comparison.revisions.find((item) => item.id === revisionId && item.version === comparison.version);
  if (!revision) return "needs-review" as const;
  return revision.inputs.every((input) => {
    const proposal = proposals.records.find((item) => item.id === input.proposalId && item.projectId === comparison.projectId);
    const proposalRevision = proposal?.revisions.find((item) => item.id === input.proposalRevisionId && item.version === input.proposalVersion);
    return Boolean(proposal && proposalRevision
      && proposal.currentRevisionId === input.proposalRevisionId
      && proposal.version === input.proposalVersion
      && builderProposalRecordIsCurrent(proposal, dependencies)
      && builderProposalRevisionFingerprintMatches(proposal, proposalRevision, input.proposalRevisionFingerprint)
      && stableEqual(proposalRevision, input.proposalRevisionSnapshot));
  }) ? "current" as const : "needs-review" as const;
}

export function builderProductComparisonEffectiveStatus(comparison: BuilderProductComparisonRecord, proposals: BuilderProposalEnvelope, dependencies: BuilderProposalDependencies, revisionId = comparison.currentRevisionId) {
  return comparisonEffectiveStatus(comparison, proposals, dependencies, revisionId);
}

export function builderServiceComparisonEffectiveStatus(comparison: BuilderServiceComparisonRecord, proposals: BuilderProposalEnvelope, dependencies: BuilderProposalDependencies, revisionId = comparison.currentRevisionId) {
  return comparisonEffectiveStatus(comparison, proposals, dependencies, revisionId);
}

function stableLegacyValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableLegacyValue);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, stableLegacyValue(item)]));
  return value;
}

function legacyComparisonFnvHash(value: unknown): Fnv1aFingerprint {
  const serialized = JSON.stringify(stableLegacyValue(value));
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function legacyRevisionValue(record: BuilderProductComparisonRecord | BuilderServiceComparisonRecord, revision: BuilderProductComparisonRevision | BuilderServiceComparisonRevision, claims: BuilderComparisonLegacyEvidence["revisionLinks"][number]["proposalFingerprintClaims"]) {
  const legacyInputs = revision.inputs.map((input, index) => {
    const { proposalRevisionSnapshot: _snapshot, ...legacyInput } = input;
    return { ...legacyInput, proposalRevisionFingerprint: claims[index]?.claimedFingerprint };
  });
  const payload = revision.kind === "product"
    ? { id: revision.id, version: revision.version, createdAt: revision.createdAt, inputs: legacyInputs, results: revision.results, recommendation: revision.recommendation }
    : { id: revision.id, version: revision.version, createdAt: revision.createdAt, inputs: legacyInputs, results: revision.results, summary: revision.summary };
  return {
    ...payload,
    fingerprint: legacyComparisonFnvHash({ projectId: record.projectId, target: record.target, requestSnapshot: record.requestSnapshot, revision: payload }),
  };
}

function legacyRevisionFingerprint(record: BuilderProductComparisonRecord | BuilderServiceComparisonRecord, revision: BuilderProductComparisonRevision | BuilderServiceComparisonRevision, claims: BuilderComparisonLegacyEvidence["revisionLinks"][number]["proposalFingerprintClaims"]) {
  return legacyRevisionValue(record, revision, claims).fingerprint;
}

export function builderComparisonRevisionFingerprintMatches(
  comparison: BuilderProductComparisonRecord | BuilderServiceComparisonRecord,
  revision: BuilderProductComparisonRevision | BuilderServiceComparisonRevision,
  claimedFingerprint: string,
) {
  if (!comparison || !revision || revision.kind !== (comparison.objectType === "builder-product-proposal-comparison" ? "product" : "service")
    || revision.comparisonId !== comparison.id || revision.projectId !== comparison.projectId || revision.scopeId !== comparison.scopeId
    || !exactSha256(revision.fingerprint) || revision.fingerprint !== builderComparisonHash(withoutFingerprint(revision))
    || !comparison.revisions.some((item) => item.id === revision.id && item.version === revision.version && item.fingerprint === revision.fingerprint)) return false;
  if (claimedFingerprint === revision.fingerprint) return true;
  const authorizationContextHash = comparison.history[0]?.authorizationContextHash;
  if (!exactSha256(authorizationContextHash)) return false;
  const validationAuthority: ProcurementDispatchAuthority = {
    identityBindingHash: `sha256-${"0".repeat(64)}`,
    snapshotHash: `sha256-${"0".repeat(64)}`,
    projectIds: [comparison.projectId],
    authorizationHashes: { [comparison.projectId]: authorizationContextHash },
  };
  if (!(comparison.objectType === "builder-product-proposal-comparison"
    ? productRecordIsValid(comparison, validationAuthority)
    : serviceRecordIsValid(comparison, validationAuthority))) return false;
  const evidence = comparison.legacyEvidence;
  if (!evidence || !legacyEvidenceIsValid(evidence, comparison)) return false;
  const links = evidence.revisionLinks.filter((item) => item.revisionId === revision.id && item.revisionVersion === revision.version && item.canonicalFingerprint === revision.fingerprint);
  const link = links.length === 1 ? links[0] : null;
  return Boolean(link && link.legacyFingerprint === claimedFingerprint && legacyRevisionFingerprint(comparison, revision, link.proposalFingerprintClaims) === claimedFingerprint);
}

function normalizeProductComparisonDraftForHash(draft: unknown): BuilderProductComparisonDraft | null {
  if (!hasExactKeys(draft, ["requestKey", "proposals"])) return null;
  const value = draft as BuilderProductComparisonDraft;
  if (!exactString(value.requestKey, 1200) || !isExactDenseArray(value.proposals) || value.proposals.length < 2 || value.proposals.length > 8) return null;
  const normalized: BuilderProposalComparisonProposalDraft[] = [];
  const proposalIds = new Set<string>();
  for (let proposalIndex = 0; proposalIndex < value.proposals.length; proposalIndex += 1) {
    const proposal = value.proposals[proposalIndex];
    if (!hasExactKeys(proposal, ["proposalId", "selected", "lineAdjustments", "taxMode", "taxValue", "taxAssumption", "transportMode", "transportValue", "transportAssumption"])
      || !exactString(proposal.proposalId, 300) || typeof proposal.selected !== "boolean" || proposalIds.has(proposal.proposalId)
      || !isExactDenseArray(proposal.lineAdjustments) || proposal.lineAdjustments.length < 1 || proposal.lineAdjustments.length > 100
      || typeof proposal.taxValue !== "string" || typeof proposal.taxAssumption !== "string" || typeof proposal.transportValue !== "string" || typeof proposal.transportAssumption !== "string") return null;
    proposalIds.add(proposal.proposalId);
    const lineAdjustments: BuilderProposalComparisonLineAdjustmentDraft[] = [];
    const lineIds = new Set<string>();
    for (let lineIndex = 0; lineIndex < proposal.lineAdjustments.length; lineIndex += 1) {
      const adjustment = proposal.lineAdjustments[lineIndex];
      if (!hasExactKeys(adjustment, ["proposalLineId", "requestItemId", "basis", "adjustedQuantity", "adjustedQuantityUnit", "assumption"])
        || !exactString(adjustment.proposalLineId, 300) || lineIds.has(adjustment.proposalLineId) || !exactString(adjustment.requestItemId, 240)
        || typeof adjustment.adjustedQuantity !== "string" || typeof adjustment.adjustedQuantityUnit !== "string" || typeof adjustment.assumption !== "string"
        || !["declared-total", "unit-price-times-adjusted-quantity", "unknown"].includes(adjustment.basis)) return null;
      lineIds.add(adjustment.proposalLineId);
      if (adjustment.basis === "unit-price-times-adjusted-quantity") {
        const adjustedQuantity = normalizeBuilderProposalComparisonNumber(adjustment.adjustedQuantity, false);
        const adjustedQuantityUnit = normalizeComparisonText(adjustment.adjustedQuantityUnit, 80);
        const assumption = normalizeComparisonText(adjustment.assumption, 500);
        if (adjustedQuantity === undefined || adjustedQuantityUnit === null || adjustedQuantityUnit === undefined || assumption === null || assumption === undefined) return null;
        lineAdjustments.push({ proposalLineId: adjustment.proposalLineId, requestItemId: adjustment.requestItemId, basis: adjustment.basis, adjustedQuantity, adjustedQuantityUnit, assumption });
      } else {
        if (adjustment.adjustedQuantity.trim() || adjustment.adjustedQuantityUnit.trim() || adjustment.assumption.trim()) return null;
        lineAdjustments.push({ proposalLineId: adjustment.proposalLineId, requestItemId: adjustment.requestItemId, basis: adjustment.basis, adjustedQuantity: "", adjustedQuantityUnit: "", assumption: "" });
      }
    }
    const tax = normalizeBuilderProposalComparisonTreatment(proposal.taxMode, proposal.taxValue, proposal.taxAssumption, { included: "included", fixed: "fixed", rate: "rate", unknown: "unknown" });
    const transport = normalizeBuilderProposalComparisonTreatment(proposal.transportMode, proposal.transportValue, proposal.transportAssumption, { included: "included", fixed: "fixed", unknown: "unknown" });
    if (!tax || !transport) return null;
    normalized.push({
      proposalId: proposal.proposalId,
      selected: proposal.selected,
      lineAdjustments,
      taxMode: tax.mode,
      taxValue: tax.value ?? "",
      taxAssumption: tax.assumption ?? "",
      transportMode: transport.mode,
      transportValue: transport.value ?? "",
      transportAssumption: transport.assumption ?? "",
    });
  }
  const selected = normalized.filter((proposal) => proposal.selected);
  return selected.length >= 2 && selected.length <= 8 ? { requestKey: value.requestKey, proposals: selected } : null;
}

function normalizeServiceComparisonDraftForHash(draft: unknown): BuilderServiceComparisonDraft | null {
  if (!hasExactKeys(draft, ["requestKey", "proposals"])) return null;
  const value = draft as BuilderServiceComparisonDraft;
  if (!exactString(value.requestKey, 1200) || !isExactDenseArray(value.proposals) || value.proposals.length < 2 || value.proposals.length > 8) return null;
  const normalized: BuilderServiceProposalComparisonProposalDraft[] = [];
  const proposalIds = new Set<string>();
  for (let proposalIndex = 0; proposalIndex < value.proposals.length; proposalIndex += 1) {
    const proposal = value.proposals[proposalIndex];
    if (!hasExactKeys(proposal, ["proposalId", "selected", "criteria"]) || !exactString(proposal.proposalId, 300)
      || typeof proposal.selected !== "boolean" || proposalIds.has(proposal.proposalId) || !isExactDenseArray(proposal.criteria)
      || proposal.criteria.length !== builderServiceProposalComparisonCriteriaV1.length) return null;
    proposalIds.add(proposal.proposalId);
    const criteria: BuilderServiceProposalComparisonCriterionDraft[] = [];
    for (let criterionIndex = 0; criterionIndex < builderServiceProposalComparisonCriteriaV1.length; criterionIndex += 1) {
      const criterion = proposal.criteria[criterionIndex];
      const definition = builderServiceProposalComparisonCriteriaV1[criterionIndex];
      if (!hasExactKeys(criterion, ["criterionId", "declaredValue", "assessment", "rationale"])
        || criterion.criterionId !== definition.id || typeof criterion.declaredValue !== "string" || typeof criterion.rationale !== "string"
        || !["aligned", "partial", "different", "unknown", "not-applicable"].includes(criterion.assessment)) return null;
      const declaredValue = normalizeComparisonText(criterion.declaredValue, 500);
      const rationale = normalizeComparisonText(criterion.rationale, 500);
      if (declaredValue === undefined || rationale === undefined) return null;
      if (criterion.assessment === "not-applicable" && (declaredValue !== null || rationale === null)
        || criterion.assessment !== "unknown" && criterion.assessment !== "not-applicable" && (declaredValue === null || rationale === null)) return null;
      criteria.push({ criterionId: definition.id, declaredValue: declaredValue ?? "", assessment: criterion.assessment, rationale: rationale ?? "" });
    }
    normalized.push({ proposalId: proposal.proposalId, selected: proposal.selected, criteria });
  }
  const selected = normalized.filter((proposal) => proposal.selected);
  return selected.length >= 2 && selected.length <= 8 ? { requestKey: value.requestKey, proposals: selected } : null;
}

export function builderProductComparisonNormalizedDraftHash(draft: unknown): Sha256Fingerprint | null {
  const normalized = normalizeProductComparisonDraftForHash(draft);
  return normalized ? builderComparisonHash(normalized) : null;
}

export function builderServiceComparisonNormalizedDraftHash(draft: unknown): Sha256Fingerprint | null {
  const normalized = normalizeServiceComparisonDraftForHash(draft);
  return normalized ? builderComparisonHash(normalized) : null;
}

type NormalizedBuilderComparisonCommandProbe = {
  inputSchemaVersion: number;
  ledgerKind: "product" | "service";
  kind: "product" | "service";
  action: "create-comparison" | "update-comparison";
  projectId: string;
  comparisonId: string;
  draft: BuilderProductComparisonDraft | BuilderServiceComparisonDraft;
  pins: BuilderProductComparisonCommandPins | BuilderServiceComparisonCommandPins;
  expectedStoreVersion: number;
  expectedComparisonVersion?: number;
  idempotencyKey: string;
  executable: boolean;
  payloadHash: Sha256Fingerprint;
};

type CommittedComparisonAuthority = {
  envelope: BuilderProductComparisonEnvelope | BuilderServiceComparisonEnvelope;
  canonicalRaw: string;
  marker: BuilderComparisonCommittedMarker;
  markerRaw: string;
  incident: BuilderComparisonRollbackIncident | null;
  incidentRaw: string | null;
};

function comparisonProposalPinShapeIsValid(value: unknown) {
  if (!hasExactKeys(value, ["proposalId", "proposalVersion", "proposalRevisionId", "proposalRevisionFingerprint", "proposalRevisionSnapshotHash"])) return false;
  const pin = value as BuilderComparisonProposalCommandPin;
  return exactString(pin.proposalId, 300) && exactInteger(pin.proposalVersion) && exactString(pin.proposalRevisionId, 300)
    && exactSha256(pin.proposalRevisionFingerprint) && exactSha256(pin.proposalRevisionSnapshotHash);
}

function comparisonCommandPinShapeIsValid(
  value: unknown,
  kind: "product" | "service",
  projectId: string,
  draft: BuilderProductComparisonDraft | BuilderServiceComparisonDraft,
): value is BuilderProductComparisonCommandPins | BuilderServiceComparisonCommandPins {
  if (!hasExactKeys(value, kind === "product" ? productPinsKeys : servicePinsKeys)) return false;
  const pins = value as BuilderProductComparisonCommandPins | BuilderServiceComparisonCommandPins;
  if (pins.schemaVersion !== 1 || pins.kind !== kind || !exactSha256(pins.authorizationContextHash) || !exactSha256(pins.identityBindingHash)
    || !exactInteger(pins.proposalStoreVersion) || !exactSha256(pins.proposalEnvelopeFingerprint) || !exactSha256(pins.proposalDependencySnapshotHash)
    || !targetIsValid(pins.target, kind) || !exactSha256(pins.requestSnapshotHash) || !exactSha256(pins.expectedDependencySnapshotHash)
    || !isExactDenseArray(pins.proposalPins) || pins.proposalPins.length < 2 || pins.proposalPins.length > 8) return false;
  if (kind === "service" && !exactSha256((pins as BuilderServiceComparisonCommandPins).serviceRequestSnapshotHash)) return false;
  const proposalIds = new Set<string>();
  for (let index = 0; index < pins.proposalPins.length; index += 1) {
    const pin = pins.proposalPins[index];
    if (!comparisonProposalPinShapeIsValid(pin) || proposalIds.has(pin.proposalId) || pin.proposalId !== draft.proposals[index]?.proposalId) return false;
    proposalIds.add(pin.proposalId);
  }
  return draft.requestKey === [pins.target.requestId, pins.target.requestVersion, pins.target.reviewRevisionId, pins.target.reviewRevisionFingerprint].join(":")
    && exactString(projectId, 200);
}

function parseBuilderComparisonCommandProbe(value: unknown): NormalizedBuilderComparisonCommandProbe | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const command = value as Record<string, unknown>;
  if (!Number.isSafeInteger(command.inputSchemaVersion) || (command.inputSchemaVersion as number) < 1
    || !["product", "service"].includes(command.kind as string)
    || !["create-comparison", "update-comparison"].includes(command.action as string)) return null;
  const action = command.action as "create-comparison" | "update-comparison";
  const expectedKeys = action === "create-comparison"
    ? ["inputSchemaVersion", "kind", "action", "projectId", "comparisonId", "draft", "pins", "expectedStoreVersion", "idempotencyKey"]
    : ["inputSchemaVersion", "kind", "action", "projectId", "comparisonId", "draft", "pins", "expectedStoreVersion", "expectedComparisonVersion", "idempotencyKey"];
  if (!hasExactKeys(command, expectedKeys) || !exactString(command.projectId, 200) || !exactString(command.comparisonId, 300)
    || !exactInteger(command.expectedStoreVersion) || !exactString(command.idempotencyKey, 300)
    || action === "update-comparison" && !exactInteger(command.expectedComparisonVersion)) return null;
  if (!command.pins || typeof command.pins !== "object" || Array.isArray(command.pins)) return null;
  const ledgerKind = (command.pins as { kind?: unknown }).kind;
  if (ledgerKind !== "product" && ledgerKind !== "service") return null;
  const normalizedDraft = ledgerKind === "product"
    ? normalizeProductComparisonDraftForHash(command.draft)
    : normalizeServiceComparisonDraftForHash(command.draft);
  if (!normalizedDraft || !comparisonCommandPinShapeIsValid(command.pins, ledgerKind, command.projectId as string, normalizedDraft)) return null;
  const payload = {
    inputSchemaVersion: command.inputSchemaVersion as number,
    kind: command.kind as "product" | "service",
    action,
    projectId: command.projectId as string,
    comparisonId: command.comparisonId as string,
    draft: normalizedDraft,
    pins: structuredClone(command.pins) as BuilderProductComparisonCommandPins | BuilderServiceComparisonCommandPins,
    expectedStoreVersion: command.expectedStoreVersion as number,
    ...(action === "update-comparison" ? { expectedComparisonVersion: command.expectedComparisonVersion as number } : {}),
  };
  return {
    ...payload,
    ledgerKind,
    idempotencyKey: command.idempotencyKey as string,
    executable: command.inputSchemaVersion === 1 && command.kind === ledgerKind,
    payloadHash: builderComparisonHash(payload),
  };
}

function comparisonStorageKeys(kind: "product" | "service") {
  return kind === "product"
    ? { canonical: builderProductComparisonsStorageKey, marker: builderProductComparisonsCutoverMarkerKey, incident: builderProductComparisonsRollbackIncidentKey }
    : { canonical: builderServiceComparisonsStorageKey, marker: builderServiceComparisonsCutoverMarkerKey, incident: builderServiceComparisonsRollbackIncidentKey };
}

function committedComparisonAuthorityMatchesMarker(
  envelope: BuilderProductComparisonEnvelope | BuilderServiceComparisonEnvelope,
  canonicalRaw: string,
  marker: BuilderComparisonCommittedMarker,
) {
  const report = envelope.migrationReports[0];
  const initial = replayInitialMigrationCandidate(envelope, envelope.records as never);
  const initialRaw = initial === envelope ? canonicalRaw : initial ? JSON.stringify(initial) : null;
  return Boolean(initial && initialRaw && markerMatchesReport(marker, report)
    && builderComparisonRawHash(initialRaw) === marker.candidateRawHash
    && (!envelope.idempotencyReceipts[0] || Date.parse(envelope.idempotencyReceipts[0].recordedAt) >= Date.parse(marker.committedAt)));
}

function readCommittedComparisonAuthority(
  kind: "product" | "service",
  authority: ProcurementDispatchAuthority,
  allowPreparedIncident = false,
): CommittedComparisonAuthority | null {
  const keys = comparisonStorageKeys(kind);
  try {
    const canonicalRaw = window.localStorage.getItem(keys.canonical);
    const markerRaw = window.localStorage.getItem(keys.marker);
    if (canonicalRaw === null || markerRaw === null) return null;
    const incidentAuthority = comparisonRollbackIncidentForCanonical(kind, canonicalRaw);
    if (!incidentAuthority || incidentAuthority.incident?.state === "prepared" && !allowPreparedIncident) return null;
    const marker = parseMarkerRaw(markerRaw, kind, authority);
    const parsed: unknown = JSON.parse(canonicalRaw);
    if (!marker || marker.state !== "committed" || !envelopeIsValid(parsed, kind, authority)) return null;
    const envelope = parsed as BuilderProductComparisonEnvelope | BuilderServiceComparisonEnvelope;
    return committedComparisonAuthorityMatchesMarker(envelope, canonicalRaw, marker)
      ? { envelope, canonicalRaw, marker, markerRaw, incident: incidentAuthority.incident, incidentRaw: incidentAuthority.raw }
      : null;
  } catch {
    return null;
  }
}

function inferCommittedComparisonAuthorityForReplay(kind: "product" | "service", allowPreparedIncident = false): CommittedComparisonAuthority | null {
  const keys = comparisonStorageKeys(kind);
  try {
    const canonicalRaw = window.localStorage.getItem(keys.canonical);
    const markerRaw = window.localStorage.getItem(keys.marker);
    if (canonicalRaw === null || markerRaw === null) return null;
    const parsedEnvelope = JSON.parse(canonicalRaw) as Record<string, unknown>;
    const parsedMarker = JSON.parse(markerRaw) as Record<string, unknown>;
    if (!Array.isArray(parsedEnvelope.records) || !Array.isArray(parsedEnvelope.idempotencyReceipts)
      || !exactSha256(parsedMarker.identityBindingHash)) return null;
    const authorizationHashByProject = new Map<string, Sha256Fingerprint>();
    for (const rawRecord of parsedEnvelope.records) {
      const record = rawRecord as { projectId?: unknown; history?: unknown };
      if (!exactString(record.projectId, 200) || !Array.isArray(record.history) || !record.history.length) return null;
      const authorizationContextHash = (record.history[0] as { authorizationContextHash?: unknown }).authorizationContextHash;
      const previousAuthorizationHash = authorizationHashByProject.get(record.projectId);
      if (!exactSha256(authorizationContextHash) || previousAuthorizationHash && previousAuthorizationHash !== authorizationContextHash) return null;
      authorizationHashByProject.set(record.projectId, authorizationContextHash);
    }
    for (const rawReceipt of parsedEnvelope.idempotencyReceipts) {
      const receipt = rawReceipt as { projectId?: unknown; authorizationContextHash?: unknown };
      if (!exactString(receipt.projectId, 200) || !exactSha256(receipt.authorizationContextHash)) return null;
      const previousAuthorizationHash = authorizationHashByProject.get(receipt.projectId);
      if (previousAuthorizationHash && previousAuthorizationHash !== receipt.authorizationContextHash) return null;
      authorizationHashByProject.set(receipt.projectId, receipt.authorizationContextHash);
    }
    const projectIds = [...authorizationHashByProject.keys()].sort();
    if (!projectIds.length) return null;
    const authorizationHashes = Object.fromEntries(projectIds.map((projectId) => [projectId, authorizationHashByProject.get(projectId)!])) as Record<string, Sha256Fingerprint>;
    const authority: ProcurementDispatchAuthority = {
      identityBindingHash: parsedMarker.identityBindingHash,
      snapshotHash: `sha256-${"0".repeat(64)}`,
      projectIds,
      authorizationHashes,
    };
    return readCommittedComparisonAuthority(kind, authority, allowPreparedIncident);
  } catch {
    return null;
  }
}

function readBuilderComparisonMutationContext(reader: BuilderComparisonContextReader) {
  try {
    const context = reader();
    return hasExactKeys(context, ["authority", "dependencies"]) && authorityIsValid(context.authority) && context.dependencies
      && exactDeepEqual(context.authority, context.dependencies.authority)
      ? context as BuilderComparisonReadContext & { authority: ProcurementDispatchAuthority; dependencies: BuilderProposalDependencies }
      : null;
  } catch {
    return null;
  }
}

function comparisonDependencyDates(
  context: BuilderComparisonReadContext & { authority: ProcurementDispatchAuthority; dependencies: BuilderProposalDependencies },
  proposals: ResolvedBuilderComparisonProposalAuthority,
) {
  const proposalMarker = JSON.parse(proposals.committedMarkerRaw) as Record<string, unknown>;
  const dates = [
    ...context.dependencies.requestRevisions.map((item) => item.revisionCreatedAt),
    ...context.dependencies.contentApprovals.map((item) => item.updatedAt),
    ...context.dependencies.contacts.flatMap((item) => [item.revisionCreatedAt, ...(item.archivedAt === null ? [] : [item.archivedAt])]),
    ...context.dependencies.files.flatMap((item) => [item.createdAt, ...(item.sourceModifiedAt === null ? [] : [item.sourceModifiedAt])]),
    proposals.envelope.updatedAt,
    proposals.envelope.migrationReports[0].migratedAt,
    ...proposals.envelope.records.flatMap((record) => [
      record.createdAt,
      record.updatedAt,
      ...record.history.map((event) => event.at),
      ...record.revisions.map((revision) => revision.createdAt),
    ]),
    proposalMarker.migrationAt,
    proposalMarker.verifiedAt,
    proposalMarker.committedAt,
  ];
  return dates.filter(exactDate).map((date) => Date.parse(date));
}

function deterministicComparisonCommandId(
  kind: "product" | "service",
  entity: "revision" | "event",
  command: { action: "create-comparison" | "update-comparison"; comparisonId?: string; recordId?: string; idempotencyKey?: string; key?: string },
  resultingVersion: number,
) {
  const prefix = kind === "product"
    ? entity === "revision" ? "builder-proposal-comparison-revision-" : "builder-proposal-comparison-event-"
    : entity === "revision" ? "builder-service-proposal-comparison-revision-" : "builder-service-proposal-comparison-event-";
  return `${prefix}${builderComparisonHash({
    schemaVersion: 1,
    entity,
    kind,
    action: command.action,
    comparisonId: command.comparisonId ?? command.recordId,
    idempotencyKey: command.idempotencyKey ?? command.key,
    resultingVersion,
  })}`;
}

function buildComparisonCommandCandidate(
  command: NormalizedBuilderComparisonCommandProbe,
  authority: ProcurementDispatchAuthority,
  committed: CommittedComparisonAuthority,
  existing: BuilderProductComparisonRecord | BuilderServiceComparisonRecord | null,
  inputs: BuilderProposalComparisonInput[] | BuilderServiceProposalComparisonInput[],
  requestSnapshot: BuilderRecordedProposalRequestSnapshot | BuilderServiceProposalComparisonRequestSnapshot,
  recordedAt: string,
) {
  const kind = command.ledgerKind;
  const resultingVersion = existing ? existing.version + 1 : 1;
  const revisionId = deterministicComparisonCommandId(kind, "revision", command, resultingVersion);
  const eventId = deterministicComparisonCommandId(kind, "event", command, resultingVersion);
  const target = structuredClone(command.pins.target);
  const revision = kind === "product"
    ? finalWithFingerprint({
      schemaVersion: 2 as const,
      kind: "product" as const,
      comparisonId: command.comparisonId,
      projectId: command.projectId,
      scopeId: command.projectId,
      target: target as BuilderProductComparisonCommandPins["target"],
      id: revisionId,
      version: resultingVersion,
      createdAt: recordedAt,
      inputs: structuredClone(inputs as BuilderProposalComparisonInput[]),
      ...deriveBuilderProposalComparisonPayload(inputs as BuilderProposalComparisonInput[])!,
    })
    : finalWithFingerprint({
      schemaVersion: 2 as const,
      kind: "service" as const,
      comparisonId: command.comparisonId,
      projectId: command.projectId,
      scopeId: command.projectId,
      target: target as BuilderServiceComparisonCommandPins["target"],
      id: revisionId,
      version: resultingVersion,
      createdAt: recordedAt,
      inputs: structuredClone(inputs as BuilderServiceProposalComparisonInput[]),
      ...deriveBuilderServiceProposalComparisonPayload(inputs as BuilderServiceProposalComparisonInput[], undefined, requestSnapshot as BuilderServiceProposalComparisonRequestSnapshot)!,
    });
  const event = finalWithFingerprint({
    schemaVersion: 1 as const,
    kind,
    comparisonId: command.comparisonId,
    projectId: command.projectId,
    scopeId: command.projectId,
    id: eventId,
    type: existing ? "updated" as const : "created" as const,
    actor: "شما" as const,
    actorPrincipalId: "local-builder-account" as const,
    origin: "live-command" as const,
    at: recordedAt,
    version: resultingVersion,
    revisionId,
    authorizationContextHash: authority.authorizationHashes[command.projectId] as Sha256Fingerprint,
    dependencySnapshotHash: command.pins.expectedDependencySnapshotHash,
    idempotencyKey: command.idempotencyKey,
    commandPayloadHash: command.payloadHash,
  });
  const ownership = {
    ownerPrincipalType: "account" as const,
    ownerPrincipalId: "local-builder-account" as const,
    accountSide: "builder" as const,
    scopeType: "project_private" as const,
    scopeId: command.projectId,
    custodianService: "Comparison Domain Service" as const,
    sensitivity: "private" as const,
  };
  let record: BuilderProductComparisonRecord | BuilderServiceComparisonRecord;
  if (existing) {
    record = finalWithFingerprint({
      ...withoutFingerprint(existing),
      currentRevisionId: revisionId,
      version: resultingVersion,
      updatedAt: recordedAt,
      history: [...existing.history, event],
      revisions: [...existing.revisions, revision] as never,
    }) as BuilderProductComparisonRecord | BuilderServiceComparisonRecord;
  } else if (kind === "product") {
    record = finalWithFingerprint({
      schemaVersion: 2 as const,
      objectType: "builder-product-proposal-comparison" as const,
      id: command.comparisonId,
      projectId: command.projectId,
      ...ownership,
      purpose: "compare-builder-recorded-product-proposals" as const,
      target: target as BuilderProductComparisonCommandPins["target"],
      requestSnapshot: structuredClone(requestSnapshot as BuilderRecordedProposalRequestSnapshot),
      currentRevisionId: revisionId,
      visibility: "خصوصی پروژه" as const,
      localStatus: "ثبت محلی" as const,
      externalEffect: "none" as const,
      networkUsed: false as const,
      aiUsed: false as const,
      version: 1,
      createdAt: recordedAt,
      updatedAt: recordedAt,
      history: [event],
      revisions: [revision as BuilderProductComparisonRevision],
      legacyEvidence: null,
    });
  } else {
    record = finalWithFingerprint({
      schemaVersion: 2 as const,
      objectType: "builder-service-proposal-comparison" as const,
      id: command.comparisonId,
      projectId: command.projectId,
      ...ownership,
      purpose: "compare-builder-recorded-service-proposals" as const,
      target: target as BuilderServiceComparisonCommandPins["target"],
      requestSnapshot: structuredClone(requestSnapshot as BuilderServiceProposalComparisonRequestSnapshot),
      currentRevisionId: revisionId,
      visibility: "خصوصی پروژه" as const,
      localStatus: "ثبت محلی" as const,
      externalEffect: "none" as const,
      networkUsed: false as const,
      aiUsed: false as const,
      scoringUsed: false as const,
      version: 1,
      createdAt: recordedAt,
      updatedAt: recordedAt,
      history: [event],
      revisions: [revision as BuilderServiceComparisonRevision],
      legacyEvidence: null,
    });
  }
  const receipt = finalWithFingerprint({
    schemaVersion: 1 as const,
    position: committed.envelope.idempotencyReceipts.length + 1,
    key: command.idempotencyKey,
    kind,
    action: command.action,
    payloadHash: command.payloadHash,
    projectId: command.projectId,
    recordId: command.comparisonId,
    expectedStoreVersion: command.expectedStoreVersion,
    expectedRecordVersion: command.action === "update-comparison" ? command.expectedComparisonVersion! : null,
    commandPins: structuredClone(command.pins),
    expectedDependencySnapshotHash: command.pins.expectedDependencySnapshotHash,
    result: existing ? "updated" as const : "created" as const,
    resultingStoreVersion: committed.envelope.storeVersion + 1,
    resultingRecordVersion: resultingVersion,
    eventId,
    revisionId,
    authorizationContextHash: authority.authorizationHashes[command.projectId] as Sha256Fingerprint,
    recordedAt,
  });
  const records = committed.envelope.records.filter((item) => item.id !== record.id).concat(record as never)
    .sort((left, right) => compareUnicodeCodePoints(left.id, right.id));
  const envelope = finalWithFingerprint({
    schemaVersion: 2 as const,
    fingerprintVersion: kind === "product" ? "builder-product-comparison-domain-v2" as const : "builder-service-comparison-domain-v2" as const,
    storeVersion: committed.envelope.storeVersion + 1,
    records,
    idempotencyReceipts: [...committed.envelope.idempotencyReceipts, receipt],
    migrationReports: structuredClone(committed.envelope.migrationReports),
    updatedAt: recordedAt,
  }) as BuilderProductComparisonEnvelope | BuilderServiceComparisonEnvelope;
  return { envelope, raw: JSON.stringify(envelope), recordId: record.id, result: receipt.result };
}

function buildPreparedComparisonRollbackIncident(
  command: NormalizedBuilderComparisonCommandProbe,
  previousRaw: string,
  candidateRaw: string,
  preparedAt: string,
) {
  const store = command.ledgerKind === "product" ? "builder-product-comparison" as const : "builder-service-comparison" as const;
  return finalWithFingerprint({
    schemaVersion: 1 as const,
    store,
    kind: command.ledgerKind,
    state: "prepared" as const,
    idempotencyKey: command.idempotencyKey,
    commandPayloadHash: command.payloadHash,
    previousCanonicalRawHash: builderComparisonRawHash(previousRaw),
    candidateCanonicalRawHash: builderComparisonRawHash(candidateRaw),
    preparedAt,
    resolution: null,
    resolvedAt: null,
    resolvedCanonicalRawHash: null,
  }) as BuilderComparisonPreparedRollbackIncident;
}

function resolveComparisonRollbackIncident(
  kind: "product" | "service",
  prepared: BuilderComparisonPreparedRollbackIncident,
  resolution: "committed" | "rolled-back",
): "acknowledged" | "unacknowledged" {
  const key = comparisonStorageKeys(kind).incident;
  const resolved = finalWithFingerprint({
    ...withoutFingerprint(prepared),
    state: "resolved" as const,
    resolution,
    resolvedAt: prepared.preparedAt,
    resolvedCanonicalRawHash: resolution === "committed" ? prepared.candidateCanonicalRawHash : prepared.previousCanonicalRawHash,
  }) as BuilderComparisonResolvedRollbackIncident;
  const raw = JSON.stringify(resolved);
  try {
    window.localStorage.setItem(key, raw);
    return window.localStorage.getItem(key) === raw ? "acknowledged" : "unacknowledged";
  } catch {
    return "unacknowledged";
  }
}

function prepareComparisonRollbackIncident(
  kind: "product" | "service",
  prepared: BuilderComparisonPreparedRollbackIncident,
  previousIncidentRaw: string | null,
): { status: "ready"; raw: string } | { status: "write-failure" | "read-failure" } {
  const key = comparisonStorageKeys(kind).incident;
  const raw = JSON.stringify(prepared);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    try {
      const currentRaw = window.localStorage.getItem(key);
      if (currentRaw === previousIncidentRaw) return { status: "write-failure" };
      if (currentRaw === raw) return {
        status: resolveComparisonRollbackIncident(kind, prepared, "rolled-back") === "acknowledged" ? "write-failure" : "read-failure",
      };
      return { status: "read-failure" };
    } catch {
      return { status: "read-failure" };
    }
  }
  try {
    const currentRaw = window.localStorage.getItem(key);
    if (currentRaw === raw) return { status: "ready", raw };
    if (currentRaw === previousIncidentRaw) return { status: "write-failure" };
    return { status: "read-failure" };
  } catch {
    return { status: "read-failure" };
  }
}

function rollbackComparisonCandidate(
  kind: "product" | "service",
  previousRaw: string,
  candidateRaw: string,
  preparedIncident: BuilderComparisonPreparedRollbackIncident,
): "write-failure" | "read-failure" | "rollback-failure" {
  const key = comparisonStorageKeys(kind).canonical;
  let currentRaw: string | null;
  try {
    currentRaw = window.localStorage.getItem(key);
  } catch {
    return "read-failure";
  }
  if (currentRaw !== candidateRaw) return "read-failure";
  try {
    window.localStorage.setItem(key, previousRaw);
  } catch {
    return "rollback-failure";
  }
  try {
    if (window.localStorage.getItem(key) === previousRaw) {
      return resolveComparisonRollbackIncident(kind, preparedIncident, "rolled-back") === "acknowledged" ? "write-failure" : "read-failure";
    }
  } catch {
    return "rollback-failure";
  }
  return "rollback-failure";
}

function mutationPreimageIsCurrent(
  command: NormalizedBuilderComparisonCommandProbe,
  reader: BuilderComparisonContextReader,
  baselineContext: BuilderComparisonReadContext & { authority: ProcurementDispatchAuthority; dependencies: BuilderProposalDependencies },
  baselineLedger: CommittedComparisonAuthority,
  baselineProposals: ResolvedBuilderComparisonProposalAuthority,
) {
  const context = readBuilderComparisonMutationContext(reader);
  if (!context || !exactDeepEqual(context, baselineContext)) return { status: "dependency-invalid" as const };
  const ledger = readCommittedComparisonAuthority(command.ledgerKind, context.authority);
  if (!ledger || ledger.canonicalRaw !== baselineLedger.canonicalRaw || ledger.markerRaw !== baselineLedger.markerRaw
    || ledger.incidentRaw !== baselineLedger.incidentRaw) return { status: "read-failure" as const };
  const proposals = readBuilderComparisonProposalAuthority(context);
  if (!proposals || proposals.canonicalRaw !== baselineProposals.canonicalRaw || proposals.committedMarkerRaw !== baselineProposals.committedMarkerRaw) return { status: "dependency-invalid" as const };
  const pins = command.ledgerKind === "product"
    ? builderProductComparisonCommandPinsForDraft(command.projectId, command.draft as BuilderProductComparisonDraft, context)
    : builderServiceComparisonCommandPinsForDraft(command.projectId, command.draft as BuilderServiceComparisonDraft, context);
  return pins && exactDeepEqual(pins, command.pins)
    ? { status: "ready" as const, context, ledger, proposals }
    : { status: "dependency-invalid" as const };
}

async function executeBuilderComparisonCommandLocked(
  command: NormalizedBuilderComparisonCommandProbe,
  reader: BuilderComparisonContextReader,
  replayOnly = false,
): Promise<BuilderComparisonMutationResult> {
  let rollbackIncidentRaw: string | null;
  let rollbackIncident: BuilderComparisonRollbackIncident | null | undefined;
  try {
    rollbackIncidentRaw = window.localStorage.getItem(comparisonStorageKeys(command.ledgerKind).incident);
    rollbackIncident = parseComparisonRollbackIncidentRaw(rollbackIncidentRaw, command.ledgerKind);
  } catch {
    return { status: "read-failure" };
  }
  if (rollbackIncident === undefined) return { status: "read-failure" };
  if (rollbackIncident?.state === "prepared") {
    if (rollbackIncident.idempotencyKey !== command.idempotencyKey) return { status: "read-failure" };
    if (rollbackIncident.commandPayloadHash !== command.payloadHash) return { status: "idempotency-payload-mismatch" };
    const inferredRecoveryAuthority = inferCommittedComparisonAuthorityForReplay(command.ledgerKind, true);
    const recoveryContext = !inferredRecoveryAuthority && command.executable
      ? readBuilderComparisonMutationContext(reader)
      : null;
    const recoveryAuthority = inferredRecoveryAuthority
      ?? (recoveryContext ? readCommittedComparisonAuthority(command.ledgerKind, recoveryContext.authority, true) : null);
    if (!recoveryAuthority || recoveryAuthority.incidentRaw !== rollbackIncidentRaw) return { status: "read-failure" };
    const canonicalRawHash = builderComparisonRawHash(recoveryAuthority.canonicalRaw);
    const recoveryReceipt = recoveryAuthority.envelope.idempotencyReceipts.find((receipt) => receipt.kind === command.ledgerKind && receipt.key === command.idempotencyKey);
    if (canonicalRawHash === rollbackIncident.candidateCanonicalRawHash) {
      if (!recoveryReceipt || recoveryReceipt.payloadHash !== command.payloadHash) return { status: "read-failure" };
      if (resolveComparisonRollbackIncident(command.ledgerKind, rollbackIncident, "committed") !== "acknowledged") return { status: "read-failure" };
      return { status: recoveryReceipt.result, envelope: recoveryAuthority.envelope, recordId: recoveryReceipt.recordId };
    }
    if (canonicalRawHash !== rollbackIncident.previousCanonicalRawHash || recoveryReceipt) return { status: "read-failure" };
    if (resolveComparisonRollbackIncident(command.ledgerKind, rollbackIncident, "rolled-back") !== "acknowledged") return { status: "read-failure" };
  }
  const replayAuthority = inferCommittedComparisonAuthorityForReplay(command.ledgerKind);
  const replayReceipt = replayAuthority?.envelope.idempotencyReceipts.find((receipt) => receipt.kind === command.ledgerKind && receipt.key === command.idempotencyKey);
  if (replayReceipt) {
    return replayReceipt.payloadHash === command.payloadHash
      ? { status: replayReceipt.result, envelope: replayAuthority!.envelope, recordId: replayReceipt.recordId }
      : { status: "idempotency-payload-mismatch" };
  }
  if (replayOnly) return { status: "version-conflict" };
  if (!command.executable) return { status: "schema-invalid" };

  const context = readBuilderComparisonMutationContext(reader);
  if (!context) return { status: "read-failure" };
  const committed = readCommittedComparisonAuthority(command.ledgerKind, context.authority);
  if (!committed) return { status: "read-failure" };
  const receiptAfterAuthority = committed.envelope.idempotencyReceipts.find((receipt) => receipt.key === command.idempotencyKey);
  if (receiptAfterAuthority) {
    return receiptAfterAuthority.payloadHash === command.payloadHash
      ? { status: receiptAfterAuthority.result, envelope: committed.envelope, recordId: receiptAfterAuthority.recordId }
      : { status: "idempotency-payload-mismatch" };
  }
  if (!context.authority.projectIds.includes(command.projectId)) return { status: "scope-mismatch" };
  if (command.expectedStoreVersion !== committed.envelope.storeVersion) return { status: "version-conflict" };
  const existing = committed.envelope.records.find((record) => record.id === command.comparisonId) ?? null;
  if (existing && existing.projectId !== command.projectId) return { status: "scope-mismatch" };
  if (command.action === "create-comparison" && existing) return { status: "version-conflict" };
  if (command.action === "update-comparison" && !existing) return { status: "not-found" };
  if (command.action === "update-comparison" && command.expectedComparisonVersion !== existing!.version) return { status: "version-conflict" };

  const proposalAuthority = readBuilderComparisonProposalAuthority(context);
  if (!proposalAuthority) return { status: "dependency-invalid" };
  const exactPins = command.ledgerKind === "product"
    ? builderProductComparisonCommandPinsForDraft(command.projectId, command.draft as BuilderProductComparisonDraft, context)
    : builderServiceComparisonCommandPinsForDraft(command.projectId, command.draft as BuilderServiceComparisonDraft, context);
  if (!exactPins || !exactDeepEqual(exactPins, command.pins)) return { status: "dependency-invalid" };
  const projectProposals = proposalAuthority.envelope.records.filter((proposal) => proposal.projectId === command.projectId);
  let inputs: BuilderProposalComparisonInput[] | BuilderServiceProposalComparisonInput[] | null;
  let requestSnapshot: BuilderRecordedProposalRequestSnapshot | BuilderServiceProposalComparisonRequestSnapshot | null;
  if (command.ledgerKind === "product") {
    inputs = normalizeBuilderProposalComparisonInputs(command.draft as BuilderProductComparisonDraft, projectProposals);
    requestSnapshot = inputs?.[0]?.proposalRevisionSnapshot.requestSnapshot ?? null;
  } else {
    const target = command.pins.target;
    const request = context.dependencies.requestRevisions.find((item) => item.projectId === command.projectId && item.requestId === target.requestId
      && item.requestVersion === target.requestVersion && item.revisionId === target.reviewRevisionId && item.revisionFingerprint === target.reviewRevisionFingerprint);
    requestSnapshot = request ? builderServiceProposalComparisonRequestSnapshotFromReview(request.snapshot as ServiceReviewSnapshot) : null;
    inputs = requestSnapshot ? normalizeBuilderServiceProposalComparisonInputs(command.draft as BuilderServiceComparisonDraft, projectProposals, requestSnapshot) : null;
  }
  if (!inputs || !requestSnapshot) return { status: "dependency-invalid" };
  if (existing && (!exactDeepEqual(existing.target, command.pins.target) || !exactDeepEqual(existing.requestSnapshot, requestSnapshot))) return { status: "dependency-invalid" };
  const semantic = command.ledgerKind === "product"
    ? { inputs, ...deriveBuilderProposalComparisonPayload(inputs as BuilderProposalComparisonInput[])! }
    : { inputs, ...deriveBuilderServiceProposalComparisonPayload(inputs as BuilderServiceProposalComparisonInput[], undefined, requestSnapshot as BuilderServiceProposalComparisonRequestSnapshot)! };
  const currentRevision = existing?.revisions.find((revision) => revision.id === existing.currentRevisionId) ?? null;
  if (currentRevision && stableEqual(
    semantic,
    command.ledgerKind === "product"
      ? builderProposalComparisonSemanticValue(currentRevision as BuilderProductComparisonRevision)
      : builderServiceProposalComparisonSemanticValue(currentRevision as BuilderServiceComparisonRevision),
  )) return { status: "unchanged", envelope: committed.envelope, recordId: existing!.id };

  const projectRecordCount = committed.envelope.records.filter((record) => record.projectId === command.projectId).length;
  if (committed.envelope.idempotencyReceipts.length >= 10000 || existing && existing.version >= 100
    || !existing && (committed.envelope.records.length >= 1000 || projectRecordCount >= 100)) return { status: "version-conflict" };
  const baselineContext = structuredClone(context);
  let recordedAt: string;
  try {
    recordedAt = new Date(Math.max(
      Date.now(),
      Date.parse(committed.marker.migrationAt),
      Date.parse(committed.marker.verifiedAt),
      Date.parse(committed.marker.committedAt),
      Date.parse(committed.envelope.migrationReports[0].migratedAt),
      Date.parse(committed.envelope.updatedAt),
      existing ? Date.parse(existing.updatedAt) : 0,
      ...comparisonDependencyDates(context, proposalAuthority),
      ...inputs.map((input) => Date.parse(input.proposalRevisionSnapshot.createdAt)),
    )).toISOString();
  } catch {
    return { status: "dependency-invalid" };
  }
  const built = buildComparisonCommandCandidate(command, context.authority, committed, existing, inputs, requestSnapshot, recordedAt);
  if (!envelopeIsValid(built.envelope, command.ledgerKind, context.authority)) return { status: "schema-invalid" };
  const prewrite = mutationPreimageIsCurrent(command, reader, baselineContext, committed, proposalAuthority);
  if (prewrite.status !== "ready") return { status: prewrite.status };
  const storageKey = comparisonStorageKeys(command.ledgerKind).canonical;
  const preparedIncident = buildPreparedComparisonRollbackIncident(command, committed.canonicalRaw, built.raw, recordedAt);
  const incidentPreparation = prepareComparisonRollbackIncident(command.ledgerKind, preparedIncident, committed.incidentRaw);
  if (incidentPreparation.status !== "ready") return { status: incidentPreparation.status };
  try {
    window.localStorage.setItem(storageKey, built.raw);
  } catch {
    try {
      const currentRaw = window.localStorage.getItem(storageKey);
      if (currentRaw === committed.canonicalRaw) {
        return {
          status: resolveComparisonRollbackIncident(command.ledgerKind, preparedIncident, "rolled-back") === "acknowledged"
            ? "write-failure"
            : "read-failure",
        };
      }
      if (currentRaw !== built.raw) return { status: "read-failure" };
    } catch {
      return { status: "read-failure" };
    }
    return { status: rollbackComparisonCandidate(command.ledgerKind, committed.canonicalRaw, built.raw, preparedIncident) };
  }

  let candidateRaw: string | null;
  try {
    candidateRaw = window.localStorage.getItem(storageKey);
  } catch {
    candidateRaw = null;
  }
  if (candidateRaw !== built.raw) return { status: rollbackComparisonCandidate(command.ledgerKind, committed.canonicalRaw, built.raw, preparedIncident) };
  const postwriteContext = readBuilderComparisonMutationContext(reader);
  const postwriteProposals = postwriteContext ? readBuilderComparisonProposalAuthority(postwriteContext) : null;
  const postwriteMarkerRaw = (() => {
    try { return window.localStorage.getItem(comparisonStorageKeys(command.ledgerKind).marker); } catch { return null; }
  })();
  const postwritePins = postwriteContext && postwriteProposals
    ? command.ledgerKind === "product"
      ? builderProductComparisonCommandPinsForDraft(command.projectId, command.draft as BuilderProductComparisonDraft, postwriteContext)
      : builderServiceComparisonCommandPinsForDraft(command.projectId, command.draft as BuilderServiceComparisonDraft, postwriteContext)
    : null;
  if (!postwriteContext || !exactDeepEqual(postwriteContext, baselineContext) || postwriteMarkerRaw !== committed.markerRaw
    || !postwriteProposals || postwriteProposals.canonicalRaw !== proposalAuthority.canonicalRaw || postwriteProposals.committedMarkerRaw !== proposalAuthority.committedMarkerRaw
    || !postwritePins || !exactDeepEqual(postwritePins, command.pins)) {
    return { status: rollbackComparisonCandidate(command.ledgerKind, committed.canonicalRaw, built.raw, preparedIncident) };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidateRaw);
  } catch {
    return { status: rollbackComparisonCandidate(command.ledgerKind, committed.canonicalRaw, built.raw, preparedIncident) };
  }
  if (!envelopeIsValid(parsed, command.ledgerKind, postwriteContext.authority)) {
    return { status: rollbackComparisonCandidate(command.ledgerKind, committed.canonicalRaw, built.raw, preparedIncident) };
  }
  if (resolveComparisonRollbackIncident(command.ledgerKind, preparedIncident, "committed") !== "acknowledged") return { status: "read-failure" };
  return { status: built.result, envelope: parsed as BuilderProductComparisonEnvelope | BuilderServiceComparisonEnvelope, recordId: built.recordId };
}

async function executeBuilderComparisonCommandWithMode(
  value: unknown,
  reader: BuilderComparisonContextReader,
  replayOnly: boolean,
): Promise<BuilderComparisonMutationResult> {
  let command: NormalizedBuilderComparisonCommandProbe | null;
  try {
    command = parseBuilderComparisonCommandProbe(value);
  } catch {
    return { status: "schema-invalid" };
  }
  if (!command) return { status: "schema-invalid" };
  const manager = window.navigator.locks;
  if (!manager?.request) return { status: "lock-unavailable" };
  try {
    return await manager.request(comparisonWriteLockName, { mode: "exclusive" }, () => executeBuilderComparisonCommandLocked(command, reader, replayOnly));
  } catch {
    return { status: "read-failure" };
  }
}

export function executeBuilderComparisonCommand(
  value: unknown,
  reader: BuilderComparisonContextReader,
): Promise<BuilderComparisonMutationResult> {
  return executeBuilderComparisonCommandWithMode(value, reader, false);
}

export function replayBuilderComparisonCommand(
  value: unknown,
  reader: BuilderComparisonContextReader,
): Promise<BuilderComparisonMutationResult> {
  return executeBuilderComparisonCommandWithMode(value, reader, true);
}
