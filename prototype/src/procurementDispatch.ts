export const legacyProjectSupplierContactsStorageKey = "chida-prototype-project-supplier-contacts:v1";
export const projectSupplierContactsStorageKey = "chida-prototype-project-supplier-contacts:v2";
export const projectSupplierContactsCutoverMarkerKey = `${projectSupplierContactsStorageKey}:cutover:v1`;

export const legacyProjectDispatchDraftsStorageKey = "chida-prototype-project-dispatch-drafts:v1";
export const projectDispatchDraftsStorageKey = "chida-prototype-project-dispatch-drafts:v2";
export const projectDispatchDraftsCutoverMarkerKey = `${projectDispatchDraftsStorageKey}:cutover:v1`;

export const legacyProjectDispatchPlanApprovalsStorageKey = "chida-prototype-project-dispatch-plan-approvals:v1";
export const projectDispatchPlanApprovalsStorageKey = "chida-prototype-project-dispatch-plan-approvals:v2";
export const projectDispatchPlanApprovalsCutoverMarkerKey = `${projectDispatchPlanApprovalsStorageKey}:cutover:v1`;

export const projectPurchaseRequestsStorageKey = "chida-prototype-project-purchase-requests:v1";
export const procurementDispatchWriteLockName = `${projectPurchaseRequestsStorageKey}:write`;
export const procurementDispatchQueueIntentKey = `${projectDispatchDraftsStorageKey}:plan-queue-intent:v1`;
export const projectDispatchPlanQueueIntentKey = procurementDispatchQueueIntentKey;
const maximumPlanRecordIdempotencyKeyLength = 200 + 1 + 200 + 1 + 300 + 1 + "sha256-".length + 64 + ":local-plan-approval".length + ":simulation-v2".length;

export type SupplierContactResponseCapability = "product" | "service" | "both";
export type SupplierContactStatus = "active" | "archived";
export type ProcurementPurchaseRequestKind = "product" | "service";
export type ProcurementProductUnit = "عدد" | "کیلوگرم" | "تن" | "متر" | "مترمربع" | "مترمکعب" | "بسته" | "دستگاه";
export type ProcurementAlternatives = "unknown" | "allowed" | "not-allowed" | "approval-required";

export type DispatchPayloadProductItem = {
  name: string | null;
  quantity: string | null;
  unit: ProcurementProductUnit | null;
  brandOrGrade: string | null;
  specification: string | null;
  alternatives: ProcurementAlternatives;
};

export type DispatchPayloadService = {
  scope: string | null;
  location: string | null;
  locationPrecision: "area-or-project-section";
  sizeOrVolume: string | null;
  qualification: string | null;
  timing: string | null;
  method: string | null;
  inScope: string | null;
  outOfScope: string | null;
  warranty: string | null;
  paymentTerms: string | null;
};

export type DispatchPayload = {
  requestKind: ProcurementPurchaseRequestKind;
  items: DispatchPayloadProductItem[];
  service: DispatchPayloadService | null;
  delivery: { area: string; neededBy: string | null } | null;
  unresolvedTerms: { transport: string; tax: string; paymentTerms: string } | null;
};

export type DispatchPrivacySnapshot = {
  shareableFields: string[];
  excludedFields: string[];
  projectNameShared: false;
  exactAddressFieldIncluded: false;
  budgetShared: false;
  filesShared: false;
  memoryShared: false;
  rawNeedShared: false;
  clarificationAnswersShared: false;
  locationReviewRequired: true;
};

export type ProcurementDispatchAuthority = {
  identityBindingHash: string;
  snapshotHash: string;
  projectIds: string[];
  authorizationHashes: Record<string, string>;
};

export type ProcurementRequestRevisionDependency = {
  projectId: string;
  requestId: string;
  requestVersion: number;
  revisionId: string;
  revisionFingerprint: string;
  revisionCreatedAt: string;
  requestKind: ProcurementPurchaseRequestKind;
  isCurrentReadyForReview: boolean;
  payload: DispatchPayload;
  privacySnapshot: DispatchPrivacySnapshot;
  fingerprint: string;
};

export type ProcurementContentApprovalDependency = {
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
  fingerprint: string;
};

export type ProcurementDispatchDependencies = {
  schemaVersion: 1;
  authority: ProcurementDispatchAuthority;
  requestRevisions: ProcurementRequestRevisionDependency[];
  contentApprovals: ProcurementContentApprovalDependency[];
  preconditionCheckpoints: ProcurementDispatchPreconditionCheckpoint[];
  snapshotHash: string;
};

export type ProcurementDispatchDependencyReader = () => ProcurementDispatchDependencies | null;
export type ProcurementDispatchAuthorityReader = () => ProcurementDispatchAuthority | null;

export type SupplierContactSnapshot = {
  displayName: string;
  category: string;
  tehranCoverage: string;
  responseCapability: SupplierContactResponseCapability;
  status: SupplierContactStatus;
  archivedAt: string | null;
};

export type SupplierContactRevision = {
  id: string;
  version: number;
  createdAt: string;
  snapshot: SupplierContactSnapshot;
  fingerprint: string;
};

export type SupplierContactEventType = "created" | "archived" | "restored";
export type SupplierContactEvent = {
  id: string;
  type: SupplierContactEventType;
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

export type SupplierContactLegacyEvent = {
  id: string;
  type: SupplierContactEventType;
  actor: "شما";
  at: string;
  version: number;
};

export type SupplierContactLegacyEvidence = {
  schemaVersion: 1;
  sourceGeneration: "v1-array";
  sourceIndex: number;
  sourceRecordHash: string;
  sourceVersion: number;
  sourceCreatedAt: string;
  sourceUpdatedAt: string;
  history: SupplierContactLegacyEvent[];
  fingerprint: string;
};

export type SupplierContactRecord = {
  schemaVersion: 2;
  objectType: "supplier-contact";
  id: string;
  projectId: string;
  ownerPrincipalType: "account";
  ownerPrincipalId: "local-builder-account";
  accountSide: "builder";
  scopeType: "project_private";
  scopeId: string;
  custodianService: "Supplier Contact Service";
  sensitivity: "private";
  displayName: string;
  category: string;
  tehranCoverage: string;
  responseCapability: SupplierContactResponseCapability;
  source: "ثبت مستقیم سازنده";
  networkStatus: "خارج از شبکه چیدا";
  status: SupplierContactStatus;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  version: number;
  currentRevisionId: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  history: SupplierContactEvent[];
  revisions: SupplierContactRevision[];
  legacyEvidence: SupplierContactLegacyEvidence | null;
  fingerprint: string;
};

export type SupplierContactDraft = Pick<SupplierContactSnapshot, "displayName" | "category" | "tehranCoverage" | "responseCapability">;

export type DispatchDependencyTarget = {
  requestId: string;
  requestVersion: number;
  revisionId: string;
  revisionFingerprint: string;
  approvalId: string;
  approvalVersion: number;
  approvalRevisionId: string;
  approvalFingerprint: string;
};

export type ProcurementDispatchPreconditionCheckpoint = {
  schemaVersion: 1;
  checkpointKey: string;
  operation: "dispatch-draft" | "dispatch-plan" | "dispatch-queue";
  commandPayloadHash: string;
  projectId: string;
  target: DispatchDependencyTarget;
  requestHead: {
    receiptPosition: number;
    requestVersion: number;
    revisionId: string;
    revisionFingerprint: string;
  };
  approvalHead: {
    expectedStoreVersion: number;
    resultingStoreVersion: number;
    approvalVersion: number;
    revisionId: string;
    revisionFingerprint: string;
  };
  authorizationContextHash: string;
  recordedAt: string;
  fingerprint: string;
};

export type ProcurementDispatchPreconditionReference = {
  checkpointKey: string;
  checkpointFingerprint: string;
  requestReceiptPosition: number;
  approvalStoreVersion: number;
};

export type InviteDraftDestination = {
  displayName: string;
  category: string;
  tehranCoverage: string;
  responseCapability: SupplierContactResponseCapability;
  networkStatus: "خارج از شبکه چیدا";
};

export type InviteDraft = {
  schemaVersion: 2;
  id: string;
  projectId: string;
  supplierContactId: string;
  supplierContactVersion: number;
  supplierContactRevisionId: string;
  supplierContactRevisionFingerprint: string;
  destination: InviteDraftDestination;
  target: DispatchDependencyTarget;
  source: "ثبت مستقیم سازنده";
  continuation: "ادامهٔ احتمالی در فاز تأمین‌کننده";
  simulationOnly: true;
  externalEffect: "none";
  sendAuthorized: false;
  externalActionAttempted: false;
  version: 1;
  createdAt: string;
  updatedAt: string;
  fingerprint: string;
};

export type DispatchDraftRevision = {
  id: string;
  version: number;
  createdAt: string;
  recipientIds: string[];
  inviteDrafts: InviteDraft[];
  payload: DispatchPayload;
  privacySnapshot: DispatchPrivacySnapshot;
  fingerprint: string;
};

export type DispatchDraftEventType = "created" | "updated";
export type DispatchDraftEvent = {
  id: string;
  type: DispatchDraftEventType;
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

export type DispatchDraftLegacyRevisionLink = {
  sourceRevisionId: string;
  sourceRevisionFingerprint: string;
  sourceVersion: number;
  canonicalRevisionId: string;
  canonicalRevisionFingerprint: string;
  contactVersionPins: Array<{
    supplierContactId: string;
    supplierContactVersion: number;
    supplierContactRevisionId: string;
    supplierContactRevisionFingerprint: string;
  }>;
};

export type DispatchDraftLegacyEvidence = {
  schemaVersion: 1;
  sourceGeneration: "v1-array";
  sourceIndex: number;
  sourceRecordHash: string;
  sourceVersion: number;
  sourceCreatedAt: string;
  sourceUpdatedAt: string;
  revisionLinks: DispatchDraftLegacyRevisionLink[];
  fingerprint: string;
};

export type DispatchDraftRecord = {
  schemaVersion: 2;
  objectType: "dispatch-draft";
  id: string;
  projectId: string;
  ownerPrincipalType: "account";
  ownerPrincipalId: "local-builder-account";
  accountSide: "builder";
  scopeType: "project_private";
  scopeId: string;
  custodianService: "Dispatch Draft Service";
  sensitivity: "private";
  target: DispatchDependencyTarget;
  dedupeKey: string;
  status: "draft";
  currentRevisionId: string;
  simulationOnly: true;
  externalEffect: "none";
  sendAuthorized: false;
  externalActionAttempted: false;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  version: number;
  createdAt: string;
  updatedAt: string;
  history: DispatchDraftEvent[];
  revisions: DispatchDraftRevision[];
  legacyEvidence: DispatchDraftLegacyEvidence | null;
  fingerprint: string;
};

export type DispatchPlanApprovalStatus = "pending" | "approved" | "withdrawn";
export type DispatchPlanApprovalEffectiveStatus = DispatchPlanApprovalStatus | "invalidated";
export type DispatchPlanApprovalEventType = "created" | "approved" | "withdrawn" | "reopened";

export type DispatchPlanApprovalTarget = {
  type: "dispatch-draft-revision";
  dispatchDraftId: string;
  dispatchDraftVersion: number;
  dispatchRevisionId: string;
  dispatchRevisionFingerprint: string;
  requestId: string;
  requestVersion: number;
  requestRevisionId: string;
  requestRevisionFingerprint: string;
  contentApprovalId: string;
  contentApprovalVersion: number;
  contentApprovalRevisionId: string;
  contentApprovalFingerprint: string;
};

export type DispatchPlanApprovalRecipientSnapshot = {
  supplierContactId: string;
  supplierContactVersion: number;
  supplierContactRevisionId: string;
  supplierContactRevisionFingerprint: string;
  destination: InviteDraftDestination;
};

export type DispatchPlanApprovalReviewSnapshot = {
  recipients: DispatchPlanApprovalRecipientSnapshot[];
  recipientCount: number;
  payload: DispatchPayload;
  privacySnapshot: DispatchPrivacySnapshot;
  reviewAcknowledgement: {
    destinationsReviewed: true;
    payloadReviewed: true;
    privacyAndLocationReviewed: true;
  };
};

export type DispatchPlanApprovalActionRecord = {
  kind: "record-local-dispatch-plan-approval";
  result: "local-dispatch-plan-approved";
  label: "تأیید محلی برنامهٔ ارسال";
  error: null;
  recordedAt: string;
};

export type DispatchPlanApprovalRevisionSnapshot = {
  status: DispatchPlanApprovalStatus;
  actionRecord: DispatchPlanApprovalActionRecord | null;
  decidedBy: "شما" | null;
  decidedAt: string | null;
};

export type DispatchPlanApprovalRevision = {
  id: string;
  version: number;
  createdAt: string;
  snapshot: DispatchPlanApprovalRevisionSnapshot;
  fingerprint: string;
};

export type DispatchPlanApprovalEvent = {
  id: string;
  type: DispatchPlanApprovalEventType;
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

export type DispatchPlanApprovalLegacyEvidence = {
  schemaVersion: 1;
  sourceGeneration: "v1-array";
  sourceIndex: number;
  sourceRecordHash: string;
  sourceVersion: number;
  sourceCreatedAt: string;
  sourceUpdatedAt: string;
  sourceDispatchRevisionId: string;
  sourceDispatchRevisionFingerprint: string;
  fingerprint: string;
};

export type DispatchPlanApprovalRecord = {
  schemaVersion: 2;
  objectType: "dispatch-plan-approval";
  id: string;
  projectId: string;
  ownerPrincipalType: "account";
  ownerPrincipalId: "local-builder-account";
  accountSide: "builder";
  scopeType: "project_private";
  scopeId: string;
  custodianService: "Dispatch Plan Approval Service";
  sensitivity: "private";
  purpose: "approve-local-dispatch-plan-simulation";
  target: DispatchPlanApprovalTarget;
  snapshot: DispatchPlanApprovalReviewSnapshot;
  planFingerprint: string;
  dedupeKey: string;
  idempotencyKey: string;
  status: DispatchPlanApprovalStatus;
  simulationOnly: true;
  externalEffect: "none";
  sendAuthorized: false;
  externalActionAttempted: false;
  actionRecord: DispatchPlanApprovalActionRecord | null;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  requestedBy: "شما";
  decidedBy: "شما" | null;
  requestedAt: string;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  currentRevisionId: string;
  history: DispatchPlanApprovalEvent[];
  revisions: DispatchPlanApprovalRevision[];
  legacyEvidence: DispatchPlanApprovalLegacyEvidence | null;
  fingerprint: string;
};

export type ProcurementStoreName = "supplier-contact" | "dispatch-draft" | "dispatch-plan-approval";
export type ProcurementCommandAction =
  | "create-contact" | "archive-contact" | "restore-contact"
  | "upsert-dispatch-draft"
  | "create-dispatch-plan" | "withdraw-dispatch-plan" | "reopen-dispatch-plan" | "approve-dispatch-plan";

export type ProcurementCommandReceipt = {
  schemaVersion: 1;
  key: string;
  action: ProcurementCommandAction;
  payloadHash: string;
  projectId: string;
  recordId: string;
  expectedStoreVersion: number;
  expectedRecordVersion: number | null;
  expectedContactStoreVersion: number | null;
  expectedDraftStoreVersion: number | null;
  preconditionCheckpointKey: string | null;
  preconditionCheckpointFingerprint: string | null;
  requestPreconditionReceiptPosition: number | null;
  approvalPreconditionStoreVersion: number | null;
  aggregateQueueIdempotencyKey: string | null;
  aggregateCommandPayloadHash: string | null;
  result: "created" | "updated";
  resultingStoreVersion: number;
  resultingRecordVersion: number;
  eventId: string;
  revisionId: string;
  authorizationContextHash: string;
  recordedAt: string;
  fingerprint: string;
};

export type ProcurementMigrationReport = {
  schemaVersion: 1;
  id: string;
  store: ProcurementStoreName;
  sourceGeneration: "v1-array" | "none";
  sourceKey: string | null;
  sourceRawHash: string | null;
  dependencySnapshotHash: string;
  upstreamCanonicalHashes: { contacts: string | null; drafts: string | null };
  migratedAt: string;
  recordCount: number;
  migratedRecordFingerprints: string[];
  fingerprint: string;
};

export type SupplierContactEnvelope = {
  schemaVersion: 2;
  fingerprintVersion: "supplier-contact-domain-v2";
  storeVersion: number;
  records: SupplierContactRecord[];
  idempotencyReceipts: ProcurementCommandReceipt[];
  migrationReports: [ProcurementMigrationReport];
  updatedAt: string;
  fingerprint: string;
};

export type DispatchDraftEnvelope = {
  schemaVersion: 2;
  fingerprintVersion: "dispatch-draft-domain-v2";
  storeVersion: number;
  records: DispatchDraftRecord[];
  idempotencyReceipts: ProcurementCommandReceipt[];
  migrationReports: [ProcurementMigrationReport];
  updatedAt: string;
  fingerprint: string;
};

export type DispatchPlanApprovalEnvelope = {
  schemaVersion: 2;
  fingerprintVersion: "dispatch-plan-approval-domain-v2";
  storeVersion: number;
  records: DispatchPlanApprovalRecord[];
  idempotencyReceipts: ProcurementCommandReceipt[];
  migrationReports: [ProcurementMigrationReport];
  updatedAt: string;
  fingerprint: string;
};

export type ProcurementStoreState<Envelope> = {
  status: "loading" | "ready" | "read-error";
  envelope: Envelope | null;
  reason: string;
};

export type SupplierContactState = ProcurementStoreState<SupplierContactEnvelope>;
export type DispatchDraftState = ProcurementStoreState<DispatchDraftEnvelope>;
export type DispatchPlanApprovalState = ProcurementStoreState<DispatchPlanApprovalEnvelope>;
export type ProcurementDispatchState = {
  contacts: SupplierContactState;
  drafts: DispatchDraftState;
  plans: DispatchPlanApprovalState;
};

export type ProcurementMutationStatus =
  | "created" | "updated" | "unchanged" | "not-found" | "scope-mismatch"
  | "read-failure" | "schema-invalid" | "version-conflict"
  | "idempotency-payload-mismatch" | "write-failure" | "lock-unavailable"
  | "unsupported-transition" | "dependency-invalid" | "queue-blocked";

export type ProcurementMutationResult<Envelope> = {
  status: ProcurementMutationStatus;
  envelope?: Envelope;
  recordId?: string;
  reason?: string;
};

export type SupplierContactCommand =
  | { inputSchemaVersion: 1; action: "create-contact"; projectId: string; contactId: string; draft: SupplierContactDraft; expectedStoreVersion: number; idempotencyKey: string }
  | { inputSchemaVersion: 1; action: "archive-contact" | "restore-contact"; projectId: string; contactId: string; expectedStoreVersion: number; expectedContactVersion: number; idempotencyKey: string };

export type DispatchRecipientPin = {
  supplierContactId: string;
  expectedContactVersion: number;
  expectedContactRevisionId: string;
  expectedContactRevisionFingerprint: string;
};

export type DispatchDraftUpsertCommand = {
  inputSchemaVersion: 1;
  action: "upsert-dispatch-draft";
  projectId: string;
  dispatchDraftId: string;
  requestId: string;
  expectedRequestVersion: number;
  expectedRequestRevisionId: string;
  expectedRequestRevisionFingerprint: string;
  approvalId: string;
  expectedApprovalVersion: number;
  expectedApprovalRevisionId: string;
  expectedApprovalFingerprint: string;
  recipients: DispatchRecipientPin[];
  expectedContactStoreVersion: number;
  expectedDraftStoreVersion: number;
  expectedDraftVersion: number | null;
  precondition: ProcurementDispatchPreconditionReference;
  idempotencyKey: string;
};

export type DispatchPlanApprovalCommand =
  | {
    inputSchemaVersion: 1;
    action: "create-dispatch-plan";
    projectId: string;
    planApprovalId: string;
    dispatchDraftId: string;
    expectedContactStoreVersion: number;
    expectedDraftStoreVersion: number;
    expectedDraftVersion: number;
    expectedDispatchRevisionId: string;
    expectedDispatchRevisionFingerprint: string;
    expectedPlanStoreVersion: number;
    precondition: ProcurementDispatchPreconditionReference;
    acknowledgement: { destinationsReviewed: true; payloadReviewed: true; privacyAndLocationReviewed: true };
    idempotencyKey: string;
  }
  | {
    inputSchemaVersion: 1;
    action: "withdraw-dispatch-plan" | "reopen-dispatch-plan" | "approve-dispatch-plan";
    projectId: string;
    planApprovalId: string;
    expectedContactStoreVersion: number;
    expectedDraftStoreVersion: number;
    expectedPlanStoreVersion: number;
    expectedPlanVersion: number;
    precondition: ProcurementDispatchPreconditionReference;
    idempotencyKey: string;
  };

export type ProcurementDispatchQueueCommand = {
  inputSchemaVersion: 1;
  action: "queue-dispatch-plan";
  draft: DispatchDraftUpsertCommand;
  plan: Omit<Extract<DispatchPlanApprovalCommand, { action: "create-dispatch-plan" }>, "dispatchDraftId" | "expectedDraftStoreVersion" | "expectedDraftVersion" | "expectedDispatchRevisionId" | "expectedDispatchRevisionFingerprint">;
  queueIdempotencyKey: string;
};

export type ProcurementDispatchQueueIntent = {
  schemaVersion: 1;
  operation: "commit-dispatch-draft-and-plan";
  id: string;
  commandPayloadHash: string;
  queueIdempotencyKey: string;
  projectId: string;
  requestId: string;
  approvalId: string;
  identityBindingHash: string;
  authorizationContextHash: string;
  targetDependencyHash: string;
  contactRawHash: string;
  contactMarkerRaw: string;
  draftMarkerRaw: string;
  planMarkerRaw: string;
  previousDraftRaw: string;
  nextDraftRaw: string;
  previousPlanRaw: string;
  nextPlanRaw: string;
  createdAt: string;
  fingerprint: string;
};

export type ProcurementDispatchQueueResult = {
  status: ProcurementMutationStatus;
  drafts?: DispatchDraftEnvelope;
  plans?: DispatchPlanApprovalEnvelope;
  dispatchDraftId?: string;
  planApprovalId?: string;
  reason?: string;
};

type ProcurementCutoverSource = "v1-array" | "none";
type ProcurementPendingMarker = {
  schemaVersion: 1;
  store: ProcurementStoreName;
  state: "pending";
  migrationId: string;
  sourceGeneration: ProcurementCutoverSource;
  sourceKey: string | null;
  sourceRawHash: string | null;
  dependencySnapshotHash: string;
  upstreamCanonicalHashes: { contacts: string | null; drafts: string | null };
  migrationAt: string;
  identityBindingHash: string;
  candidateRaw: string;
  candidateRawHash: string;
  fingerprint: string;
};
type ProcurementVerifiedMarker = Omit<ProcurementPendingMarker, "state"> & {
  state: "verified";
  initialStoreVersion: 1;
  initialCanonicalHash: string;
  migrationReportHash: string;
  verifiedAt: string;
};
type ProcurementCommittedMarker = Omit<ProcurementVerifiedMarker, "state" | "verifiedAt"> & {
  state: "committed";
  committedAt: string;
};
type ProcurementMarker = ProcurementPendingMarker | ProcurementVerifiedMarker | ProcurementCommittedMarker;

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

function compareCanonicalIds(first: string, second: string) {
  return first < second ? -1 : first > second ? 1 : 0;
}

export function procurementDispatchHash(value: unknown) {
  return `sha256-${sha256(JSON.stringify(stableValue(value)))}`;
}

function rawHash(value: string | null) {
  return value === null ? null : `sha256-${sha256(value)}`;
}

function legacyHash(value: unknown) {
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

function exactLegacyHash(value: unknown): value is string {
  return typeof value === "string" && /^fnv1a-[0-9a-f]{8}$/.test(value);
}

function exactRequestRevisionFingerprint(value: unknown): value is string {
  return exactHash(value) || exactLegacyHash(value);
}

function withoutFingerprint<Value extends { fingerprint: string }>(value: Value) {
  const { fingerprint: _fingerprint, ...payload } = value;
  return payload;
}

function fingerprintMatches<Value extends { fingerprint: string }>(value: Value) {
  return value.fingerprint === procurementDispatchHash(withoutFingerprint(value));
}

function valuesEqual(first: unknown, second: unknown) {
  return JSON.stringify(stableValue(first)) === JSON.stringify(stableValue(second));
}

function nextTimestamp(...values: string[]) {
  const floor = values.reduce((latest, value) => exactDate(value) ? Math.max(latest, Date.parse(value)) : latest, Number.NEGATIVE_INFINITY);
  return new Date(Math.max(Date.now(), Number.isFinite(floor) ? floor + 1 : Date.now())).toISOString();
}

function canonicalDatesInRaw(raw: string | null) {
  if (raw === null) return [] as string[];
  try {
    const dates: string[] = [];
    const visit = (value: unknown) => {
      if (exactDate(value)) dates.push(value);
      else if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") Object.values(value as Record<string, unknown>).forEach(visit);
    };
    visit(JSON.parse(raw));
    return dates;
  } catch { return [] as string[]; }
}

function authorizationHash(authority: ProcurementDispatchAuthority, projectId: string) {
  return authority.authorizationHashes[projectId] ?? "";
}

function destinationFromSnapshot(snapshot: SupplierContactSnapshot): InviteDraftDestination {
  return {
    displayName: snapshot.displayName,
    category: snapshot.category,
    tehranCoverage: snapshot.tehranCoverage,
    responseCapability: snapshot.responseCapability,
    networkStatus: "خارج از شبکه چیدا",
  };
}

function capabilitySupports(capability: SupplierContactResponseCapability, kind: ProcurementPurchaseRequestKind) {
  return capability === "both" || capability === kind;
}

export function supplierContactCanRespond(contact: SupplierContactRecord, kind: ProcurementPurchaseRequestKind) {
  return contact.status === "active" && capabilitySupports(contact.responseCapability, kind);
}

function deterministicId(namespace: string, value: string) {
  const digest = sha256(`${namespace}:${value}`);
  return `${namespace}-${digest.slice(0, 8)}-${digest.slice(8, 12)}-${digest.slice(12, 16)}-${digest.slice(16, 20)}-${digest.slice(20, 32)}`;
}

const maximumProcurementRecordsPerProject = 100;

function recordsFitPerProjectLimit(records: Array<{ projectId: string }>) {
  const counts = new Map<string, number>();
  for (const record of records) {
    const count = (counts.get(record.projectId) ?? 0) + 1;
    if (count > maximumProcurementRecordsPerProject) return false;
    counts.set(record.projectId, count);
  }
  return true;
}

function inviteDraftIdForRevision(dispatchDraftId: string, dispatchDraftVersion: number, supplierContactId: string) {
  return deterministicId("invite-draft", `${dispatchDraftId}:v${dispatchDraftVersion}:${supplierContactId}`);
}

export function supplierContactIdForIdempotencyKey(idempotencyKey: string) {
  return deterministicId("supplier-contact", idempotencyKey);
}

export function dispatchDraftIdForTarget(projectId: string, requestId: string, requestVersion: number, revisionId: string) {
  return deterministicId("dispatch-draft", `${projectId}:${requestId}:${requestVersion}:${revisionId}`);
}

export function dispatchDraftIdForIdempotencyKey(idempotencyKey: string) {
  return deterministicId("dispatch-draft", idempotencyKey);
}

export function dispatchPlanApprovalIdForIdempotencyKey(idempotencyKey: string) {
  return deterministicId("dispatch-plan-approval", idempotencyKey);
}

export function procurementDispatchPreconditionCheckpointKey(operation: ProcurementDispatchPreconditionCheckpoint["operation"], commandKey: string) {
  return deterministicId("dispatch-precondition", `${operation}:${commandKey}`);
}

export function finalizeProcurementDispatchPreconditionCheckpoint(
  checkpoint: Omit<ProcurementDispatchPreconditionCheckpoint, "fingerprint">,
): ProcurementDispatchPreconditionCheckpoint {
  return { ...checkpoint, fingerprint: procurementDispatchHash(checkpoint) };
}

export function createProcurementDispatchDependencies(
  authority: ProcurementDispatchAuthority,
  requestRevisions: Omit<ProcurementRequestRevisionDependency, "fingerprint">[],
  contentApprovals: Omit<ProcurementContentApprovalDependency, "fingerprint">[],
  preconditionCheckpoints: ProcurementDispatchPreconditionCheckpoint[],
): ProcurementDispatchDependencies {
  const requests = [...requestRevisions]
    .sort((first, second) => `${first.projectId}:${first.requestId}:${first.requestVersion}:${first.revisionId}`.localeCompare(`${second.projectId}:${second.requestId}:${second.requestVersion}:${second.revisionId}`))
    .map((value) => ({ ...value, fingerprint: procurementDispatchHash(value) }));
  const approvals = [...contentApprovals]
    .sort((first, second) => `${first.projectId}:${first.approvalId}:${first.approvalVersion}:${first.approvalRevisionId}`.localeCompare(`${second.projectId}:${second.approvalId}:${second.approvalVersion}:${second.approvalRevisionId}`))
    .map((value) => ({ ...value, fingerprint: procurementDispatchHash(value) }));
  const checkpoints = [...preconditionCheckpoints]
    .sort((first, second) => compareCanonicalIds(first.checkpointKey, second.checkpointKey));
  const payload = { schemaVersion: 1 as const, authority, requestRevisions: requests, contentApprovals: approvals, preconditionCheckpoints: checkpoints };
  return { ...payload, snapshotHash: procurementDispatchHash(payload) };
}

function authorityIsValid(authority: ProcurementDispatchAuthority | null): authority is ProcurementDispatchAuthority {
  if (!authority || !hasExactKeys(authority, ["identityBindingHash", "snapshotHash", "projectIds", "authorizationHashes"]) || !exactHash(authority.identityBindingHash) || !exactHash(authority.snapshotHash)) return false;
  if (!Array.isArray(authority.projectIds) || authority.projectIds.some((id) => !exactString(id, 200))) return false;
  if (new Set(authority.projectIds).size !== authority.projectIds.length || [...authority.projectIds].sort().some((id, index) => id !== authority.projectIds[index])) return false;
  if (!authority.authorizationHashes || typeof authority.authorizationHashes !== "object" || Array.isArray(authority.authorizationHashes)) return false;
  const keys = Object.keys(authority.authorizationHashes).sort();
  return keys.length === authority.projectIds.length
    && keys.every((key, index) => key === authority.projectIds[index] && exactHash(authority.authorizationHashes[key]));
}

function nullableText(value: unknown, maximumLength = 1000) {
  return value === null || exactString(value, maximumLength) && visibleText(value as string);
}

function parseDispatchPayloadProductItem(value: unknown): DispatchPayloadProductItem | null {
  if (!hasExactKeys(value, ["name", "quantity", "unit", "brandOrGrade", "specification", "alternatives"])) return null;
  const item = value as DispatchPayloadProductItem;
  if (!nullableText(item.name, 300) || !nullableText(item.quantity, 120) || item.unit !== null && !["عدد", "کیلوگرم", "تن", "متر", "مترمربع", "مترمکعب", "بسته", "دستگاه"].includes(item.unit) || !nullableText(item.brandOrGrade, 300) || !nullableText(item.specification, 1000) || !["unknown", "allowed", "not-allowed", "approval-required"].includes(item.alternatives)) return null;
  return item;
}

function parseDispatchPayloadService(value: unknown): DispatchPayloadService | null {
  if (!hasExactKeys(value, ["scope", "location", "locationPrecision", "sizeOrVolume", "qualification", "timing", "method", "inScope", "outOfScope", "warranty", "paymentTerms"])) return null;
  const service = value as DispatchPayloadService;
  if (service.locationPrecision !== "area-or-project-section") return null;
  const fields = [service.scope, service.location, service.sizeOrVolume, service.qualification, service.timing, service.method, service.inScope, service.outOfScope, service.warranty, service.paymentTerms];
  return fields.every((field) => nullableText(field, 1500)) ? service : null;
}

function parseDispatchPayload(value: unknown): DispatchPayload | null {
  if (!hasExactKeys(value, ["requestKind", "items", "service", "delivery", "unresolvedTerms"])) return null;
  const payload = value as DispatchPayload;
  if (payload.requestKind !== "product" && payload.requestKind !== "service" || !Array.isArray(payload.items) || payload.items.length > 100) return null;
  const items = payload.items.map(parseDispatchPayloadProductItem);
  if (items.some((item) => item === null)) return null;
  if (payload.requestKind === "service") {
    const service = payload.service === null ? null : parseDispatchPayloadService(payload.service);
    if (!service || payload.items.length !== 0 || payload.delivery !== null || payload.unresolvedTerms !== null) return null;
  } else {
    if (payload.service !== null || !hasExactKeys(payload.delivery, ["area", "neededBy"]) || !exactString(payload.delivery!.area, 300) || !visibleText(payload.delivery!.area) || !nullableText(payload.delivery!.neededBy, 100) || !hasExactKeys(payload.unresolvedTerms, ["transport", "tax", "paymentTerms"])) return null;
    const terms = payload.unresolvedTerms!;
    if (![terms.transport, terms.tax, terms.paymentTerms].every((field) => exactString(field, 500) && visibleText(field))) return null;
  }
  return payload;
}

function parseDispatchPrivacySnapshot(value: unknown): DispatchPrivacySnapshot | null {
  if (!hasExactKeys(value, ["shareableFields", "excludedFields", "projectNameShared", "exactAddressFieldIncluded", "budgetShared", "filesShared", "memoryShared", "rawNeedShared", "clarificationAnswersShared", "locationReviewRequired"])) return null;
  const snapshot = value as DispatchPrivacySnapshot;
  if (!Array.isArray(snapshot.shareableFields) || !Array.isArray(snapshot.excludedFields) || snapshot.shareableFields.some((field) => !exactString(field, 300)) || snapshot.excludedFields.some((field) => !exactString(field, 300))) return null;
  if (new Set(snapshot.shareableFields).size !== snapshot.shareableFields.length || new Set(snapshot.excludedFields).size !== snapshot.excludedFields.length) return null;
  return snapshot.projectNameShared === false && snapshot.exactAddressFieldIncluded === false && snapshot.budgetShared === false && snapshot.filesShared === false && snapshot.memoryShared === false && snapshot.rawNeedShared === false && snapshot.clarificationAnswersShared === false && snapshot.locationReviewRequired === true ? snapshot : null;
}

function dependenciesAreValid(dependencies: ProcurementDispatchDependencies | null): dependencies is ProcurementDispatchDependencies {
  if (!dependencies || !hasExactKeys(dependencies, ["schemaVersion", "authority", "requestRevisions", "contentApprovals", "preconditionCheckpoints", "snapshotHash"]) || dependencies.schemaVersion !== 1 || !authorityIsValid(dependencies.authority) || !Array.isArray(dependencies.requestRevisions) || !Array.isArray(dependencies.contentApprovals) || !Array.isArray(dependencies.preconditionCheckpoints) || !exactHash(dependencies.snapshotHash)) return false;
  const requestKeys = new Set<string>();
  for (const request of dependencies.requestRevisions) {
    if (!hasExactKeys(request, ["projectId", "requestId", "requestVersion", "revisionId", "revisionFingerprint", "revisionCreatedAt", "requestKind", "isCurrentReadyForReview", "payload", "privacySnapshot", "fingerprint"])) return false;
    if (!exactString(request.projectId, 200) || !dependencies.authority.projectIds.includes(request.projectId) || !exactString(request.requestId, 200) || !Number.isSafeInteger(request.requestVersion) || request.requestVersion < 1 || !exactString(request.revisionId, 260) || !exactRequestRevisionFingerprint(request.revisionFingerprint) || !exactDate(request.revisionCreatedAt) || !["product", "service"].includes(request.requestKind) || typeof request.isCurrentReadyForReview !== "boolean" || !parseDispatchPayload(request.payload) || request.payload.requestKind !== request.requestKind || !parseDispatchPrivacySnapshot(request.privacySnapshot) || !fingerprintMatches(request)) return false;
    const key = `${request.projectId}:${request.requestId}:${request.requestVersion}:${request.revisionId}`;
    if (requestKeys.has(key)) return false;
    requestKeys.add(key);
  }
  const sortedRequests = [...dependencies.requestRevisions].sort((first, second) => `${first.projectId}:${first.requestId}:${first.requestVersion}:${first.revisionId}`.localeCompare(`${second.projectId}:${second.requestId}:${second.requestVersion}:${second.revisionId}`));
  if (sortedRequests.some((request, index) => request !== dependencies.requestRevisions[index])) return false;
  const approvalKeys = new Set<string>();
  for (const approval of dependencies.contentApprovals) {
    if (!hasExactKeys(approval, ["projectId", "approvalId", "approvalVersion", "approvalRevisionId", "approvalFingerprint", "requestId", "requestVersion", "requestRevisionId", "requestRevisionFingerprint", "status", "isCurrent", "updatedAt", "fingerprint"])) return false;
    if (!exactString(approval.projectId, 200) || !dependencies.authority.projectIds.includes(approval.projectId) || !exactString(approval.approvalId, 200) || !Number.isSafeInteger(approval.approvalVersion) || approval.approvalVersion < 1 || !exactString(approval.approvalRevisionId, 260) || !exactHash(approval.approvalFingerprint) || !exactString(approval.requestId, 200) || !Number.isSafeInteger(approval.requestVersion) || approval.requestVersion < 1 || !exactString(approval.requestRevisionId, 260) || !exactRequestRevisionFingerprint(approval.requestRevisionFingerprint) || !["pending", "approved", "changes-requested"].includes(approval.status) || typeof approval.isCurrent !== "boolean" || !exactDate(approval.updatedAt) || !fingerprintMatches(approval)) return false;
    const request = dependencies.requestRevisions.find((item) => item.projectId === approval.projectId && item.requestId === approval.requestId && item.requestVersion === approval.requestVersion && item.revisionId === approval.requestRevisionId && item.revisionFingerprint === approval.requestRevisionFingerprint);
    if (!request) return false;
    const key = `${approval.projectId}:${approval.approvalId}:${approval.approvalVersion}:${approval.approvalRevisionId}`;
    if (approvalKeys.has(key)) return false;
    approvalKeys.add(key);
  }
  const sortedApprovals = [...dependencies.contentApprovals].sort((first, second) => `${first.projectId}:${first.approvalId}:${first.approvalVersion}:${first.approvalRevisionId}`.localeCompare(`${second.projectId}:${second.approvalId}:${second.approvalVersion}:${second.approvalRevisionId}`));
  if (sortedApprovals.some((approval, index) => approval !== dependencies.contentApprovals[index])) return false;
  const checkpointKeys = new Set<string>();
  const checkpointFingerprints = new Set<string>();
  for (const checkpoint of dependencies.preconditionCheckpoints) {
    if (!hasExactKeys(checkpoint, ["schemaVersion", "checkpointKey", "operation", "commandPayloadHash", "projectId", "target", "requestHead", "approvalHead", "authorizationContextHash", "recordedAt", "fingerprint"])
      || !hasExactKeys(checkpoint.requestHead, ["receiptPosition", "requestVersion", "revisionId", "revisionFingerprint"])
      || !hasExactKeys(checkpoint.approvalHead, ["expectedStoreVersion", "resultingStoreVersion", "approvalVersion", "revisionId", "revisionFingerprint"])) return false;
    if (checkpoint.schemaVersion !== 1
      || !exactString(checkpoint.checkpointKey, 200)
      || !["dispatch-draft", "dispatch-plan", "dispatch-queue"].includes(checkpoint.operation)
      || !exactHash(checkpoint.commandPayloadHash)
      || !exactString(checkpoint.projectId, 200)
      || !dependencies.authority.projectIds.includes(checkpoint.projectId)
      || !targetIsValid(checkpoint.target)
      || !Number.isSafeInteger(checkpoint.requestHead.receiptPosition)
      || checkpoint.requestHead.receiptPosition < 1
      || !Number.isSafeInteger(checkpoint.requestHead.requestVersion)
      || checkpoint.requestHead.requestVersion < 1
      || !exactString(checkpoint.requestHead.revisionId, 300)
      || !exactRequestRevisionFingerprint(checkpoint.requestHead.revisionFingerprint)
      || !Number.isSafeInteger(checkpoint.approvalHead.expectedStoreVersion)
      || checkpoint.approvalHead.expectedStoreVersion < 1
      || checkpoint.approvalHead.resultingStoreVersion !== checkpoint.approvalHead.expectedStoreVersion + 1
      || !Number.isSafeInteger(checkpoint.approvalHead.approvalVersion)
      || checkpoint.approvalHead.approvalVersion < 1
      || !exactString(checkpoint.approvalHead.revisionId, 300)
      || !exactHash(checkpoint.approvalHead.revisionFingerprint)
      || checkpoint.authorizationContextHash !== dependencies.authority.authorizationHashes[checkpoint.projectId]
      || !exactDate(checkpoint.recordedAt)
      || !fingerprintMatches(checkpoint)
      || checkpointKeys.has(checkpoint.checkpointKey)
      || checkpointFingerprints.has(checkpoint.fingerprint)) return false;
    const request = requestDependencyForTarget(dependencies, checkpoint.projectId, checkpoint.target);
    const approval = approvalDependencyForTarget(dependencies, checkpoint.projectId, checkpoint.target);
    if (!request || !approval
      || checkpoint.requestHead.requestVersion !== checkpoint.target.requestVersion
      || checkpoint.requestHead.revisionId !== checkpoint.target.revisionId
      || checkpoint.requestHead.revisionFingerprint !== checkpoint.target.revisionFingerprint
      || checkpoint.approvalHead.approvalVersion !== checkpoint.target.approvalVersion
      || checkpoint.approvalHead.revisionId !== checkpoint.target.approvalRevisionId
      || checkpoint.approvalHead.revisionFingerprint !== checkpoint.target.approvalFingerprint) return false;
    checkpointKeys.add(checkpoint.checkpointKey);
    checkpointFingerprints.add(checkpoint.fingerprint);
  }
  const sortedCheckpoints = [...dependencies.preconditionCheckpoints].sort((first, second) => compareCanonicalIds(first.checkpointKey, second.checkpointKey));
  if (sortedCheckpoints.some((checkpoint, index) => checkpoint !== dependencies.preconditionCheckpoints[index])) return false;
  const payload = { schemaVersion: dependencies.schemaVersion, authority: dependencies.authority, requestRevisions: dependencies.requestRevisions, contentApprovals: dependencies.contentApprovals, preconditionCheckpoints: dependencies.preconditionCheckpoints };
  return dependencies.snapshotHash === procurementDispatchHash(payload);
}

function requestDependencyForTarget(dependencies: ProcurementDispatchDependencies, projectId: string, target: DispatchDependencyTarget) {
  return dependencies.requestRevisions.find((request) => request.projectId === projectId && request.requestId === target.requestId && request.requestVersion === target.requestVersion && request.revisionId === target.revisionId && request.revisionFingerprint === target.revisionFingerprint) ?? null;
}

function approvalDependencyForTarget(dependencies: ProcurementDispatchDependencies, projectId: string, target: DispatchDependencyTarget) {
  return dependencies.contentApprovals.find((approval) => approval.projectId === projectId && approval.approvalId === target.approvalId && approval.approvalVersion === target.approvalVersion && approval.approvalRevisionId === target.approvalRevisionId && approval.approvalFingerprint === target.approvalFingerprint && approval.requestId === target.requestId && approval.requestVersion === target.requestVersion && approval.requestRevisionId === target.revisionId && approval.requestRevisionFingerprint === target.revisionFingerprint) ?? null;
}

function queueTargetDependencyHash(
  dependencies: ProcurementDispatchDependencies,
  projectId: string,
  target: DispatchDependencyTarget,
  reference: ProcurementDispatchPreconditionReference,
) {
  const request = requestDependencyForTarget(dependencies, projectId, target);
  const approval = approvalDependencyForTarget(dependencies, projectId, target);
  const checkpoint = checkpointForReference(dependencies, reference);
  const authorizationContextHash = dependencies.authority.authorizationHashes[projectId];
  return request && approval && checkpoint && checkpointMatchesTarget(checkpoint, projectId, target) && authorizationContextHash
    ? procurementDispatchHash({ schemaVersion: 1, projectId, authorizationContextHash, request, approval, checkpoint })
    : null;
}

function preconditionReferenceIsValid(value: unknown): value is ProcurementDispatchPreconditionReference {
  if (!hasExactKeys(value, ["checkpointKey", "checkpointFingerprint", "requestReceiptPosition", "approvalStoreVersion"])) return false;
  const reference = value as ProcurementDispatchPreconditionReference;
  return exactString(reference.checkpointKey, 200)
    && exactHash(reference.checkpointFingerprint)
    && Number.isSafeInteger(reference.requestReceiptPosition)
    && reference.requestReceiptPosition >= 1
    && Number.isSafeInteger(reference.approvalStoreVersion)
    && reference.approvalStoreVersion >= 2;
}

function checkpointForReference(dependencies: ProcurementDispatchDependencies, reference: ProcurementDispatchPreconditionReference) {
  return dependencies.preconditionCheckpoints.find((checkpoint) => checkpoint.checkpointKey === reference.checkpointKey
    && checkpoint.fingerprint === reference.checkpointFingerprint
    && checkpoint.requestHead.receiptPosition === reference.requestReceiptPosition
    && checkpoint.approvalHead.resultingStoreVersion === reference.approvalStoreVersion) ?? null;
}

function receiptPreconditionReference(receipt: ProcurementCommandReceipt): ProcurementDispatchPreconditionReference | null {
  if (receipt.preconditionCheckpointKey === null
    || receipt.preconditionCheckpointFingerprint === null
    || receipt.requestPreconditionReceiptPosition === null
    || receipt.approvalPreconditionStoreVersion === null) return null;
  const reference: ProcurementDispatchPreconditionReference = {
    checkpointKey: receipt.preconditionCheckpointKey,
    checkpointFingerprint: receipt.preconditionCheckpointFingerprint,
    requestReceiptPosition: receipt.requestPreconditionReceiptPosition,
    approvalStoreVersion: receipt.approvalPreconditionStoreVersion,
  };
  return preconditionReferenceIsValid(reference) ? reference : null;
}

function checkpointMatchesTarget(
  checkpoint: ProcurementDispatchPreconditionCheckpoint,
  projectId: string,
  target: DispatchDependencyTarget,
) {
  return checkpoint.projectId === projectId
    && valuesEqual(checkpoint.target, target)
    && checkpoint.requestHead.requestVersion === target.requestVersion
    && checkpoint.requestHead.revisionId === target.revisionId
    && checkpoint.requestHead.revisionFingerprint === target.revisionFingerprint
    && checkpoint.approvalHead.approvalVersion === target.approvalVersion
    && checkpoint.approvalHead.revisionId === target.approvalRevisionId
    && checkpoint.approvalHead.revisionFingerprint === target.approvalFingerprint;
}

function targetIsValid(value: unknown): value is DispatchDependencyTarget {
  if (!hasExactKeys(value, ["requestId", "requestVersion", "revisionId", "revisionFingerprint", "approvalId", "approvalVersion", "approvalRevisionId", "approvalFingerprint"])) return false;
  const target = value as DispatchDependencyTarget;
  return exactString(target.requestId, 200) && Number.isSafeInteger(target.requestVersion) && target.requestVersion >= 1 && exactString(target.revisionId, 260) && exactRequestRevisionFingerprint(target.revisionFingerprint) && exactString(target.approvalId, 200) && Number.isSafeInteger(target.approvalVersion) && target.approvalVersion >= 1 && exactString(target.approvalRevisionId, 260) && exactHash(target.approvalFingerprint);
}

function destinationIsValid(value: unknown): value is InviteDraftDestination {
  if (!hasExactKeys(value, ["displayName", "category", "tehranCoverage", "responseCapability", "networkStatus"])) return false;
  const destination = value as InviteDraftDestination;
  return exactString(destination.displayName, 100) && visibleText(destination.displayName) && exactString(destination.category, 100) && visibleText(destination.category) && exactString(destination.tehranCoverage, 120) && visibleText(destination.tehranCoverage) && ["product", "service", "both"].includes(destination.responseCapability) && destination.networkStatus === "خارج از شبکه چیدا";
}

function finalizeContactRevision(value: Omit<SupplierContactRevision, "fingerprint">): SupplierContactRevision {
  return { ...value, fingerprint: procurementDispatchHash(value) };
}

function finalizeContactEvent(value: Omit<SupplierContactEvent, "fingerprint">): SupplierContactEvent {
  return { ...value, fingerprint: procurementDispatchHash(value) };
}

function finalizeContactLegacyEvidence(value: Omit<SupplierContactLegacyEvidence, "fingerprint">): SupplierContactLegacyEvidence {
  return { ...value, fingerprint: procurementDispatchHash(value) };
}

function finalizeContactRecord(value: Omit<SupplierContactRecord, "fingerprint"> | SupplierContactRecord): SupplierContactRecord {
  const payload = "fingerprint" in value ? withoutFingerprint(value as SupplierContactRecord) : value;
  return { ...payload, fingerprint: procurementDispatchHash(payload) } as SupplierContactRecord;
}

function finalizeInvite(value: Omit<InviteDraft, "fingerprint">): InviteDraft {
  return { ...value, fingerprint: procurementDispatchHash(value) };
}

function finalizeDraftRevision(value: Omit<DispatchDraftRevision, "fingerprint">): DispatchDraftRevision {
  return { ...value, fingerprint: procurementDispatchHash(value) };
}

function finalizeDraftEvent(value: Omit<DispatchDraftEvent, "fingerprint">): DispatchDraftEvent {
  return { ...value, fingerprint: procurementDispatchHash(value) };
}

function finalizeDraftLegacyEvidence(value: Omit<DispatchDraftLegacyEvidence, "fingerprint">): DispatchDraftLegacyEvidence {
  return { ...value, fingerprint: procurementDispatchHash(value) };
}

function finalizeDraftRecord(value: Omit<DispatchDraftRecord, "fingerprint"> | DispatchDraftRecord): DispatchDraftRecord {
  const payload = "fingerprint" in value ? withoutFingerprint(value as DispatchDraftRecord) : value;
  return { ...payload, fingerprint: procurementDispatchHash(payload) } as DispatchDraftRecord;
}

function finalizePlanRevision(value: Omit<DispatchPlanApprovalRevision, "fingerprint">): DispatchPlanApprovalRevision {
  return { ...value, fingerprint: procurementDispatchHash(value) };
}

function finalizePlanEvent(value: Omit<DispatchPlanApprovalEvent, "fingerprint">): DispatchPlanApprovalEvent {
  return { ...value, fingerprint: procurementDispatchHash(value) };
}

function finalizePlanLegacyEvidence(value: Omit<DispatchPlanApprovalLegacyEvidence, "fingerprint">): DispatchPlanApprovalLegacyEvidence {
  return { ...value, fingerprint: procurementDispatchHash(value) };
}

function finalizePlanRecord(value: Omit<DispatchPlanApprovalRecord, "fingerprint"> | DispatchPlanApprovalRecord): DispatchPlanApprovalRecord {
  const payload = "fingerprint" in value ? withoutFingerprint(value as DispatchPlanApprovalRecord) : value;
  return { ...payload, fingerprint: procurementDispatchHash(payload) } as DispatchPlanApprovalRecord;
}

function finalizeReceipt(value: Omit<ProcurementCommandReceipt, "fingerprint">): ProcurementCommandReceipt {
  return { ...value, fingerprint: procurementDispatchHash(value) };
}

function finalizeMigrationReport(value: Omit<ProcurementMigrationReport, "fingerprint">): ProcurementMigrationReport {
  return { ...value, fingerprint: procurementDispatchHash(value) };
}

function finalizeContactEnvelope(value: Omit<SupplierContactEnvelope, "fingerprint"> | SupplierContactEnvelope): SupplierContactEnvelope {
  const payload = "fingerprint" in value ? withoutFingerprint(value as SupplierContactEnvelope) : value;
  return { ...payload, fingerprint: procurementDispatchHash(payload) } as SupplierContactEnvelope;
}

function finalizeDraftEnvelope(value: Omit<DispatchDraftEnvelope, "fingerprint"> | DispatchDraftEnvelope): DispatchDraftEnvelope {
  const payload = "fingerprint" in value ? withoutFingerprint(value as DispatchDraftEnvelope) : value;
  return { ...payload, fingerprint: procurementDispatchHash(payload) } as DispatchDraftEnvelope;
}

function finalizePlanEnvelope(value: Omit<DispatchPlanApprovalEnvelope, "fingerprint"> | DispatchPlanApprovalEnvelope): DispatchPlanApprovalEnvelope {
  const payload = "fingerprint" in value ? withoutFingerprint(value as DispatchPlanApprovalEnvelope) : value;
  return { ...payload, fingerprint: procurementDispatchHash(payload) } as DispatchPlanApprovalEnvelope;
}

function finalizeMarker<Marker extends Omit<ProcurementMarker, "fingerprint">>(value: Marker): Marker & { fingerprint: string } {
  return { ...value, fingerprint: procurementDispatchHash(value) };
}

function contactSnapshotIsValid(value: unknown): value is SupplierContactSnapshot {
  if (!hasExactKeys(value, ["displayName", "category", "tehranCoverage", "responseCapability", "status", "archivedAt"])) return false;
  const snapshot = value as SupplierContactSnapshot;
  return exactString(snapshot.displayName, 100) && visibleText(snapshot.displayName)
    && exactString(snapshot.category, 100) && visibleText(snapshot.category)
    && exactString(snapshot.tehranCoverage, 120) && visibleText(snapshot.tehranCoverage)
    && ["product", "service", "both"].includes(snapshot.responseCapability)
    && ["active", "archived"].includes(snapshot.status)
    && (snapshot.status === "active" ? snapshot.archivedAt === null : exactDate(snapshot.archivedAt));
}

function parseContactLegacyEvidence(value: unknown): SupplierContactLegacyEvidence | null {
  if (!hasExactKeys(value, ["schemaVersion", "sourceGeneration", "sourceIndex", "sourceRecordHash", "sourceVersion", "sourceCreatedAt", "sourceUpdatedAt", "history", "fingerprint"])) return null;
  const evidence = value as SupplierContactLegacyEvidence;
  if (evidence.schemaVersion !== 1 || evidence.sourceGeneration !== "v1-array" || !Number.isSafeInteger(evidence.sourceIndex) || evidence.sourceIndex < 0 || !exactHash(evidence.sourceRecordHash) || !Number.isSafeInteger(evidence.sourceVersion) || evidence.sourceVersion < 1 || !exactDate(evidence.sourceCreatedAt) || !exactDate(evidence.sourceUpdatedAt) || Date.parse(evidence.sourceUpdatedAt) < Date.parse(evidence.sourceCreatedAt) || !Array.isArray(evidence.history) || evidence.history.length !== evidence.sourceVersion || !fingerprintMatches(evidence)) return null;
  let status: SupplierContactStatus = "active";
  const ids = new Set<string>();
  for (const [index, event] of evidence.history.entries()) {
    if (!hasExactKeys(event, ["id", "type", "actor", "at", "version"]) || !exactString(event.id, 200) || ids.has(event.id) || !["created", "archived", "restored"].includes(event.type) || event.actor !== "شما" || !exactDate(event.at) || event.version !== index + 1 || index > 0 && Date.parse(event.at) < Date.parse(evidence.history[index - 1].at)) return null;
    if (index === 0 ? event.type !== "created" : event.type === "created" || event.type === "archived" && status !== "active" || event.type === "restored" && status !== "archived") return null;
    if (event.type === "archived") status = "archived";
    if (event.type === "restored") status = "active";
    ids.add(event.id);
  }
  return evidence.history[0]?.at === evidence.sourceCreatedAt && evidence.history.at(-1)?.at === evidence.sourceUpdatedAt ? evidence : null;
}

function parseContactRecord(value: unknown, authority: ProcurementDispatchAuthority): SupplierContactRecord | null {
  const keys = ["schemaVersion", "objectType", "id", "projectId", "ownerPrincipalType", "ownerPrincipalId", "accountSide", "scopeType", "scopeId", "custodianService", "sensitivity", "displayName", "category", "tehranCoverage", "responseCapability", "source", "networkStatus", "status", "visibility", "localStatus", "version", "currentRevisionId", "createdAt", "updatedAt", "archivedAt", "history", "revisions", "legacyEvidence", "fingerprint"];
  if (!hasExactKeys(value, keys)) return null;
  const record = value as SupplierContactRecord;
  if (record.schemaVersion !== 2 || record.objectType !== "supplier-contact" || !exactString(record.id, 200) || !exactString(record.projectId, 200) || !authority.projectIds.includes(record.projectId) || record.ownerPrincipalType !== "account" || record.ownerPrincipalId !== "local-builder-account" || record.accountSide !== "builder" || record.scopeType !== "project_private" || record.scopeId !== record.projectId || record.custodianService !== "Supplier Contact Service" || record.sensitivity !== "private" || record.source !== "ثبت مستقیم سازنده" || record.networkStatus !== "خارج از شبکه چیدا" || record.visibility !== "خصوصی پروژه" || record.localStatus !== "ثبت محلی" || !Number.isSafeInteger(record.version) || record.version < 1 || !exactString(record.currentRevisionId, 300) || !exactDate(record.createdAt) || !exactDate(record.updatedAt) || !Array.isArray(record.history) || !Array.isArray(record.revisions) || record.history.length !== record.version || record.revisions.length !== record.version || !fingerprintMatches(record)) return null;
  const evidence = record.legacyEvidence === null ? null : parseContactLegacyEvidence(record.legacyEvidence);
  if (record.legacyEvidence !== null && !evidence) return null;
  const eventIds = new Set<string>();
  const revisionIds = new Set<string>();
  let prior: SupplierContactSnapshot | null = null;
  for (let index = 0; index < record.version; index += 1) {
    const event = record.history[index];
    const revision = record.revisions[index];
    const migrated = evidence !== null && index < evidence.sourceVersion;
    if (!hasExactKeys(event, ["id", "type", "actor", "actorPrincipalId", "at", "version", "revisionId", "authorizationContextHash", "idempotencyKey", "commandPayloadHash", "fingerprint"]) || !hasExactKeys(revision, ["id", "version", "createdAt", "snapshot", "fingerprint"])) return null;
    if (event.id !== `supplier-contact-event:${record.id}:v${index + 1}` || revision.id !== `supplier-contact-revision:${record.id}:v${index + 1}` || eventIds.has(event.id) || revisionIds.has(revision.id) || event.version !== index + 1 || revision.version !== index + 1 || event.revisionId !== revision.id || !exactDate(event.at) || revision.createdAt !== event.at || index > 0 && (Date.parse(event.at) < Date.parse(record.history[index - 1].at) || !migrated && Date.parse(event.at) === Date.parse(record.history[index - 1].at)) || event.actorPrincipalId !== "local-builder-account" || event.authorizationContextHash !== authority.authorizationHashes[record.projectId] || !fingerprintMatches(event) || !fingerprintMatches(revision) || !contactSnapshotIsValid(revision.snapshot)) return null;
    if (migrated ? event.actor !== "سامانهٔ مهاجرت" || event.idempotencyKey !== null || event.commandPayloadHash !== null : event.actor !== "شما" || !exactString(event.idempotencyKey, 200) || !exactHash(event.commandPayloadHash)) return null;
    if (index === 0) {
      if (event.type !== "created" || revision.snapshot.status !== "active" || revision.snapshot.archivedAt !== null || record.createdAt !== event.at) return null;
    } else if (!prior || event.type === "archived" && (prior.status !== "active" || revision.snapshot.status !== "archived" || revision.snapshot.archivedAt !== event.at) || event.type === "restored" && (prior.status !== "archived" || revision.snapshot.status !== "active" || revision.snapshot.archivedAt !== null) || event.type === "created") return null;
    if (prior && (prior.displayName !== revision.snapshot.displayName || prior.category !== revision.snapshot.category || prior.tehranCoverage !== revision.snapshot.tehranCoverage || prior.responseCapability !== revision.snapshot.responseCapability)) return null;
    eventIds.add(event.id); revisionIds.add(revision.id); prior = revision.snapshot;
  }
  const latest = record.revisions.at(-1)!;
  const projection = { displayName: record.displayName, category: record.category, tehranCoverage: record.tehranCoverage, responseCapability: record.responseCapability, status: record.status, archivedAt: record.archivedAt };
  if (record.currentRevisionId !== latest.id || record.updatedAt !== latest.createdAt || !valuesEqual(projection, latest.snapshot)) return null;
  if (evidence && (record.createdAt !== evidence.sourceCreatedAt || evidence.sourceVersion > record.version)) return null;
  return record;
}

function parseReceipt(value: unknown): ProcurementCommandReceipt | null {
  if (!hasExactKeys(value, ["schemaVersion", "key", "action", "payloadHash", "projectId", "recordId", "expectedStoreVersion", "expectedRecordVersion", "expectedContactStoreVersion", "expectedDraftStoreVersion", "preconditionCheckpointKey", "preconditionCheckpointFingerprint", "requestPreconditionReceiptPosition", "approvalPreconditionStoreVersion", "aggregateQueueIdempotencyKey", "aggregateCommandPayloadHash", "result", "resultingStoreVersion", "resultingRecordVersion", "eventId", "revisionId", "authorizationContextHash", "recordedAt", "fingerprint"])) return null;
  const receipt = value as ProcurementCommandReceipt;
  const optionalVersion = (version: unknown) => version === null || Number.isSafeInteger(version) && Number(version) >= 1;
  const aggregateBindingIsValid = receipt.aggregateQueueIdempotencyKey === null && receipt.aggregateCommandPayloadHash === null
    || exactString(receipt.aggregateQueueIdempotencyKey, 200) && exactHash(receipt.aggregateCommandPayloadHash);
  const preconditionBindingIsValid = receipt.preconditionCheckpointKey === null
    && receipt.preconditionCheckpointFingerprint === null
    && receipt.requestPreconditionReceiptPosition === null
    && receipt.approvalPreconditionStoreVersion === null
    || exactString(receipt.preconditionCheckpointKey, 200)
      && exactHash(receipt.preconditionCheckpointFingerprint)
      && Number.isSafeInteger(receipt.requestPreconditionReceiptPosition)
      && Number(receipt.requestPreconditionReceiptPosition) >= 1
      && Number.isSafeInteger(receipt.approvalPreconditionStoreVersion)
      && Number(receipt.approvalPreconditionStoreVersion) >= 2;
  const actionNeedsPrecondition = !["create-contact", "archive-contact", "restore-contact"].includes(receipt.action);
  if (receipt.schemaVersion !== 1 || !exactString(receipt.key, 200) || !["create-contact", "archive-contact", "restore-contact", "upsert-dispatch-draft", "create-dispatch-plan", "withdraw-dispatch-plan", "reopen-dispatch-plan", "approve-dispatch-plan"].includes(receipt.action) || !exactHash(receipt.payloadHash) || !exactString(receipt.projectId, 200) || !exactString(receipt.recordId, 200) || !Number.isSafeInteger(receipt.expectedStoreVersion) || receipt.expectedStoreVersion < 1 || !optionalVersion(receipt.expectedRecordVersion) || !optionalVersion(receipt.expectedContactStoreVersion) || !optionalVersion(receipt.expectedDraftStoreVersion) || !preconditionBindingIsValid || actionNeedsPrecondition !== (receipt.preconditionCheckpointKey !== null) || !aggregateBindingIsValid || !["created", "updated"].includes(receipt.result) || !Number.isSafeInteger(receipt.resultingStoreVersion) || receipt.resultingStoreVersion < 2 || !Number.isSafeInteger(receipt.resultingRecordVersion) || receipt.resultingRecordVersion < 1 || !exactString(receipt.eventId, 300) || !exactString(receipt.revisionId, 300) || !exactHash(receipt.authorizationContextHash) || !exactDate(receipt.recordedAt) || !fingerprintMatches(receipt)) return null;
  return receipt;
}

function parseMigrationReport(value: unknown, store: ProcurementStoreName, legacyKey: string): ProcurementMigrationReport | null {
  if (!hasExactKeys(value, ["schemaVersion", "id", "store", "sourceGeneration", "sourceKey", "sourceRawHash", "dependencySnapshotHash", "upstreamCanonicalHashes", "migratedAt", "recordCount", "migratedRecordFingerprints", "fingerprint"]) || !hasExactKeys((value as any)?.upstreamCanonicalHashes, ["contacts", "drafts"])) return null;
  const report = value as ProcurementMigrationReport;
  if (report.schemaVersion !== 1 || report.store !== store || !exactString(report.id, 300) || !["v1-array", "none"].includes(report.sourceGeneration) || !exactHash(report.dependencySnapshotHash) || !exactDate(report.migratedAt) || !Number.isSafeInteger(report.recordCount) || report.recordCount < 0 || !Array.isArray(report.migratedRecordFingerprints) || report.migratedRecordFingerprints.length !== report.recordCount || report.migratedRecordFingerprints.some((fingerprint) => !exactHash(fingerprint)) || !fingerprintMatches(report)) return null;
  if (report.sourceGeneration === "v1-array" ? report.sourceKey !== legacyKey || !exactHash(report.sourceRawHash) : report.sourceKey !== null || report.sourceRawHash !== null || report.recordCount !== 0) return null;
  const expectedUpstream = store === "supplier-contact"
    ? report.upstreamCanonicalHashes.contacts === null && report.upstreamCanonicalHashes.drafts === null
    : store === "dispatch-draft"
      ? exactHash(report.upstreamCanonicalHashes.contacts) && report.upstreamCanonicalHashes.drafts === null
      : exactHash(report.upstreamCanonicalHashes.contacts) && exactHash(report.upstreamCanonicalHashes.drafts);
  return expectedUpstream ? report : null;
}

function validateReceiptTimeline(receipts: ProcurementCommandReceipt[], migrationAt: string) {
  const keys = new Set<string>();
  return receipts.every((receipt, index) => {
    if (keys.has(receipt.key) || receipt.resultingStoreVersion !== index + 2 || receipt.expectedStoreVersion !== index + 1 || (index === 0 ? Date.parse(receipt.recordedAt) <= Date.parse(migrationAt) : Date.parse(receipt.recordedAt) <= Date.parse(receipts[index - 1].recordedAt))) return false;
    keys.add(receipt.key);
    return true;
  });
}

type PrefixRecord = Pick<SupplierContactRecord | DispatchDraftRecord | DispatchPlanApprovalRecord, "id" | "projectId" | "history" | "revisions" | "legacyEvidence">;

function recordRevisionAtStoreVersion<Revision extends { id: string; version: number; fingerprint: string }>(
  envelope: Pick<SupplierContactEnvelope | DispatchDraftEnvelope | DispatchPlanApprovalEnvelope, "storeVersion" | "idempotencyReceipts">,
  record: PrefixRecord,
  storeVersion: number,
): Revision | null {
  if (!Number.isSafeInteger(storeVersion) || storeVersion < 1 || storeVersion > envelope.storeVersion) return null;
  let recordVersion = record.legacyEvidence?.sourceVersion ?? 0;
  for (const receipt of envelope.idempotencyReceipts) {
    if (receipt.resultingStoreVersion > storeVersion || receipt.projectId !== record.projectId || receipt.recordId !== record.id) continue;
    const nextVersion = recordVersion + 1;
    const event = record.history[nextVersion - 1];
    const revision = record.revisions[nextVersion - 1];
    if (receipt.resultingRecordVersion !== nextVersion || !event || !revision || receipt.eventId !== event.id || receipt.revisionId !== revision.id || event.version !== nextVersion || event.revisionId !== revision.id || revision.version !== nextVersion) return null;
    recordVersion = nextVersion;
  }
  return recordVersion > 0 ? record.revisions[recordVersion - 1] as unknown as Revision : null;
}

type ContactVersionPin = Pick<InviteDraft, "supplierContactId" | "supplierContactVersion" | "supplierContactRevisionId" | "supplierContactRevisionFingerprint">;

function contactPinIsCurrentAtStoreVersion(contacts: SupplierContactEnvelope, storeVersion: number, projectId: string, pin: ContactVersionPin, requestKind: ProcurementPurchaseRequestKind) {
  const contact = contacts.records.find((candidate) => candidate.id === pin.supplierContactId && candidate.projectId === projectId);
  const revision = contact ? recordRevisionAtStoreVersion<SupplierContactRevision>(contacts, contact, storeVersion) : null;
  return !!revision
    && revision.version === pin.supplierContactVersion
    && revision.id === pin.supplierContactRevisionId
    && revision.fingerprint === pin.supplierContactRevisionFingerprint
    && revision.snapshot.status === "active"
    && capabilitySupports(revision.snapshot.responseCapability, requestKind);
}

function draftRevisionIsCurrentAtStoreVersion(drafts: DispatchDraftEnvelope, storeVersion: number, projectId: string, target: Pick<DispatchPlanApprovalTarget, "dispatchDraftId" | "dispatchDraftVersion" | "dispatchRevisionId" | "dispatchRevisionFingerprint">) {
  const draft = drafts.records.find((candidate) => candidate.id === target.dispatchDraftId && candidate.projectId === projectId);
  const revision = draft ? recordRevisionAtStoreVersion<DispatchDraftRevision>(drafts, draft, storeVersion) : null;
  return !!revision
    && revision.version === target.dispatchDraftVersion
    && revision.id === target.dispatchRevisionId
    && revision.fingerprint === target.dispatchRevisionFingerprint;
}

export function parseSupplierContactEnvelope(value: unknown, authority: ProcurementDispatchAuthority): SupplierContactEnvelope | null {
  if (!authorityIsValid(authority) || !hasExactKeys(value, ["schemaVersion", "fingerprintVersion", "storeVersion", "records", "idempotencyReceipts", "migrationReports", "updatedAt", "fingerprint"])) return null;
  const envelope = value as SupplierContactEnvelope;
  if (envelope.schemaVersion !== 2 || envelope.fingerprintVersion !== "supplier-contact-domain-v2" || !Number.isSafeInteger(envelope.storeVersion) || envelope.storeVersion < 1 || !Array.isArray(envelope.records) || !Array.isArray(envelope.idempotencyReceipts) || !Array.isArray(envelope.migrationReports) || envelope.migrationReports.length !== 1 || !exactDate(envelope.updatedAt) || !fingerprintMatches(envelope)) return null;
  const report = parseMigrationReport(envelope.migrationReports[0], "supplier-contact", legacyProjectSupplierContactsStorageKey);
  const records = envelope.records.map((record) => parseContactRecord(record, authority));
  const receipts = envelope.idempotencyReceipts.map(parseReceipt);
  if (!report || records.some((record) => record === null) || receipts.some((receipt) => receipt === null) || envelope.storeVersion !== receipts.length + 1 || !validateReceiptTimeline(receipts as ProcurementCommandReceipt[], report.migratedAt)) return null;
  const exactRecords = records as SupplierContactRecord[];
  const exactReceipts = receipts as ProcurementCommandReceipt[];
  if (!recordsFitPerProjectLimit(exactRecords) || new Set(exactRecords.map((record) => record.id)).size !== exactRecords.length || exactRecords.filter((record) => record.legacyEvidence).length !== report.recordCount) return null;
  const migrated = exactRecords.slice(0, report.recordCount);
  if (migrated.some((record, index) => !record.legacyEvidence || record.legacyEvidence.sourceIndex !== index || initialContactRecord(record).fingerprint !== report.migratedRecordFingerprints[index]) || exactRecords.slice(report.recordCount).some((record) => record.legacyEvidence !== null)) return null;
  const receiptEventIds = new Set(exactReceipts.map((receipt) => receipt.eventId));
  for (const receipt of exactReceipts) {
    if (!["create-contact", "archive-contact", "restore-contact"].includes(receipt.action)) return null;
    const record = exactRecords.find((item) => item.id === receipt.recordId && item.projectId === receipt.projectId);
    const event = record?.history.find((item) => item.id === receipt.eventId);
    const revision = record?.revisions.find((item) => item.id === receipt.revisionId);
    const expectedType = receipt.action === "create-contact" ? "created" : receipt.action === "archive-contact" ? "archived" : "restored";
    if (!record || !event || !revision || event.type !== expectedType || event.revisionId !== revision.id || event.idempotencyKey !== receipt.key || event.commandPayloadHash !== receipt.payloadHash || event.authorizationContextHash !== receipt.authorizationContextHash || receipt.authorizationContextHash !== authority.authorizationHashes[receipt.projectId] || event.at !== receipt.recordedAt || revision.version !== receipt.resultingRecordVersion || receipt.result !== (receipt.action === "create-contact" ? "created" : "updated") || receipt.expectedRecordVersion !== (receipt.action === "create-contact" ? null : receipt.resultingRecordVersion - 1)) return null;
    const reconstructed = receipt.action === "create-contact"
      ? { inputSchemaVersion: 1, action: receipt.action, projectId: receipt.projectId, contactId: receipt.recordId, draft: { displayName: revision.snapshot.displayName, category: revision.snapshot.category, tehranCoverage: revision.snapshot.tehranCoverage, responseCapability: revision.snapshot.responseCapability }, expectedStoreVersion: receipt.expectedStoreVersion }
      : { inputSchemaVersion: 1, action: receipt.action, projectId: receipt.projectId, contactId: receipt.recordId, expectedStoreVersion: receipt.expectedStoreVersion, expectedContactVersion: receipt.expectedRecordVersion };
    if (receipt.expectedContactStoreVersion !== null || receipt.expectedDraftStoreVersion !== null || receipt.aggregateQueueIdempotencyKey !== null || receipt.aggregateCommandPayloadHash !== null || receipt.payloadHash !== procurementDispatchHash(reconstructed) || receipt.action === "create-contact" && receipt.recordId !== supplierContactIdForIdempotencyKey(receipt.key)) return null;
  }
  if (exactRecords.some((record) => record.history.some((event, index) => index >= (record.legacyEvidence?.sourceVersion ?? 0) && !receiptEventIds.has(event.id)))) return null;
  const createdOrder = exactReceipts.filter((receipt) => receipt.action === "create-contact").map((receipt) => receipt.recordId);
  if (exactRecords.slice(report.recordCount).some((record, index) => record.id !== createdOrder[index]) || exactRecords.length - report.recordCount !== createdOrder.length) return null;
  if (envelope.updatedAt !== (exactReceipts.at(-1)?.recordedAt ?? report.migratedAt)) return null;
  return envelope;
}

export function parseSupplierContactEnvelopeRaw(raw: string | null, authority: ProcurementDispatchAuthority): SupplierContactEnvelope | null {
  if (raw === null) return null;
  try { return parseSupplierContactEnvelope(JSON.parse(raw), authority); } catch { return null; }
}

function parseInvite(value: unknown, projectId: string, target: DispatchDependencyTarget, contacts: SupplierContactEnvelope): InviteDraft | null {
  const keys = ["schemaVersion", "id", "projectId", "supplierContactId", "supplierContactVersion", "supplierContactRevisionId", "supplierContactRevisionFingerprint", "destination", "target", "source", "continuation", "simulationOnly", "externalEffect", "sendAuthorized", "externalActionAttempted", "version", "createdAt", "updatedAt", "fingerprint"];
  if (!hasExactKeys(value, keys)) return null;
  const invite = value as InviteDraft;
  if (invite.schemaVersion !== 2 || !exactString(invite.id, 300) || invite.projectId !== projectId || !exactString(invite.supplierContactId, 200) || !Number.isSafeInteger(invite.supplierContactVersion) || invite.supplierContactVersion < 1 || !exactString(invite.supplierContactRevisionId, 300) || !exactHash(invite.supplierContactRevisionFingerprint) || !destinationIsValid(invite.destination) || !targetIsValid(invite.target) || !valuesEqual(invite.target, target) || invite.source !== "ثبت مستقیم سازنده" || invite.continuation !== "ادامهٔ احتمالی در فاز تأمین‌کننده" || invite.simulationOnly !== true || invite.externalEffect !== "none" || invite.sendAuthorized !== false || invite.externalActionAttempted !== false || invite.version !== 1 || !exactDate(invite.createdAt) || invite.updatedAt !== invite.createdAt || !fingerprintMatches(invite)) return null;
  const contact = contacts.records.find((record) => record.id === invite.supplierContactId && record.projectId === projectId);
  const revision = contact?.revisions.find((item) => item.version === invite.supplierContactVersion && item.id === invite.supplierContactRevisionId && item.fingerprint === invite.supplierContactRevisionFingerprint);
  return contact && revision && revision.snapshot.status === "active" && valuesEqual(destinationFromSnapshot(revision.snapshot), invite.destination) ? invite : null;
}

function parseDraftLegacyEvidence(value: unknown): DispatchDraftLegacyEvidence | null {
  if (!hasExactKeys(value, ["schemaVersion", "sourceGeneration", "sourceIndex", "sourceRecordHash", "sourceVersion", "sourceCreatedAt", "sourceUpdatedAt", "revisionLinks", "fingerprint"])) return null;
  const evidence = value as DispatchDraftLegacyEvidence;
  if (evidence.schemaVersion !== 1 || evidence.sourceGeneration !== "v1-array" || !Number.isSafeInteger(evidence.sourceIndex) || evidence.sourceIndex < 0 || !exactHash(evidence.sourceRecordHash) || !Number.isSafeInteger(evidence.sourceVersion) || evidence.sourceVersion < 1 || !exactDate(evidence.sourceCreatedAt) || !exactDate(evidence.sourceUpdatedAt) || Date.parse(evidence.sourceUpdatedAt) < Date.parse(evidence.sourceCreatedAt) || !Array.isArray(evidence.revisionLinks) || evidence.revisionLinks.length !== evidence.sourceVersion || !fingerprintMatches(evidence)) return null;
  const sourceIds = new Set<string>();
  for (const [index, link] of evidence.revisionLinks.entries()) {
    if (!hasExactKeys(link, ["sourceRevisionId", "sourceRevisionFingerprint", "sourceVersion", "canonicalRevisionId", "canonicalRevisionFingerprint", "contactVersionPins"]) || !exactString(link.sourceRevisionId, 300) || sourceIds.has(link.sourceRevisionId) || !exactLegacyHash(link.sourceRevisionFingerprint) || link.sourceVersion !== index + 1 || !exactString(link.canonicalRevisionId, 300) || !exactHash(link.canonicalRevisionFingerprint) || !Array.isArray(link.contactVersionPins)) return null;
    const contactIds = new Set<string>();
    for (const pin of link.contactVersionPins) {
      if (!hasExactKeys(pin, ["supplierContactId", "supplierContactVersion", "supplierContactRevisionId", "supplierContactRevisionFingerprint"]) || !exactString(pin.supplierContactId, 200) || contactIds.has(pin.supplierContactId) || !Number.isSafeInteger(pin.supplierContactVersion) || pin.supplierContactVersion < 1 || !exactString(pin.supplierContactRevisionId, 300) || !exactHash(pin.supplierContactRevisionFingerprint)) return null;
      contactIds.add(pin.supplierContactId);
    }
    sourceIds.add(link.sourceRevisionId);
  }
  return evidence;
}

function invitePinValue(invite: InviteDraft) {
  return { supplierContactId: invite.supplierContactId, supplierContactVersion: invite.supplierContactVersion, supplierContactRevisionId: invite.supplierContactRevisionId, supplierContactRevisionFingerprint: invite.supplierContactRevisionFingerprint, destination: invite.destination };
}

function draftRevisionSemanticValue(revision: DispatchDraftRevision) {
  return { recipientIds: revision.recipientIds, inviteDrafts: revision.inviteDrafts.map(invitePinValue), payload: revision.payload, privacySnapshot: revision.privacySnapshot };
}

function parseDraftRecord(value: unknown, dependencies: ProcurementDispatchDependencies, contacts: SupplierContactEnvelope): DispatchDraftRecord | null {
  const keys = ["schemaVersion", "objectType", "id", "projectId", "ownerPrincipalType", "ownerPrincipalId", "accountSide", "scopeType", "scopeId", "custodianService", "sensitivity", "target", "dedupeKey", "status", "currentRevisionId", "simulationOnly", "externalEffect", "sendAuthorized", "externalActionAttempted", "visibility", "localStatus", "version", "createdAt", "updatedAt", "history", "revisions", "legacyEvidence", "fingerprint"];
  if (!hasExactKeys(value, keys)) return null;
  const record = value as DispatchDraftRecord;
  if (record.schemaVersion !== 2 || record.objectType !== "dispatch-draft" || !exactString(record.id, 200) || !exactString(record.projectId, 200) || !dependencies.authority.projectIds.includes(record.projectId) || record.ownerPrincipalType !== "account" || record.ownerPrincipalId !== "local-builder-account" || record.accountSide !== "builder" || record.scopeType !== "project_private" || record.scopeId !== record.projectId || record.custodianService !== "Dispatch Draft Service" || record.sensitivity !== "private" || !targetIsValid(record.target) || !requestDependencyForTarget(dependencies, record.projectId, record.target) || !approvalDependencyForTarget(dependencies, record.projectId, record.target) || record.dedupeKey !== dispatchDraftDedupeKey(record.projectId, record.target) || record.status !== "draft" || !exactString(record.currentRevisionId, 300) || record.simulationOnly !== true || record.externalEffect !== "none" || record.sendAuthorized !== false || record.externalActionAttempted !== false || record.visibility !== "خصوصی پروژه" || record.localStatus !== "ثبت محلی" || !Number.isSafeInteger(record.version) || record.version < 1 || !exactDate(record.createdAt) || !exactDate(record.updatedAt) || !Array.isArray(record.history) || !Array.isArray(record.revisions) || record.history.length !== record.version || record.revisions.length !== record.version || !fingerprintMatches(record)) return null;
  const request = requestDependencyForTarget(dependencies, record.projectId, record.target)!;
  const approval = approvalDependencyForTarget(dependencies, record.projectId, record.target)!;
  const evidence = record.legacyEvidence === null ? null : parseDraftLegacyEvidence(record.legacyEvidence);
  if (record.legacyEvidence !== null && !evidence) return null;
  const eventIds = new Set<string>();
  const revisionIds = new Set<string>();
  const inviteIds = new Set<string>();
  for (let index = 0; index < record.version; index += 1) {
    const event = record.history[index];
    const revision = record.revisions[index];
    if (!hasExactKeys(event, ["id", "type", "actor", "actorPrincipalId", "at", "version", "revisionId", "authorizationContextHash", "idempotencyKey", "commandPayloadHash", "fingerprint"]) || !hasExactKeys(revision, ["id", "version", "createdAt", "recipientIds", "inviteDrafts", "payload", "privacySnapshot", "fingerprint"])) return null;
    const migrated = evidence !== null && index < evidence.sourceVersion;
    if (event.id !== `dispatch-draft-event:${record.id}:v${index + 1}` || revision.id !== `dispatch-draft-revision:${record.id}:v${index + 1}` || eventIds.has(event.id) || revisionIds.has(revision.id) || event.version !== index + 1 || revision.version !== index + 1 || event.revisionId !== revision.id || !exactDate(event.at) || revision.createdAt !== event.at || index > 0 && (Date.parse(event.at) < Date.parse(record.history[index - 1].at) || !migrated && Date.parse(event.at) === Date.parse(record.history[index - 1].at)) || event.actorPrincipalId !== "local-builder-account" || event.authorizationContextHash !== dependencies.authority.authorizationHashes[record.projectId] || !fingerprintMatches(event) || !fingerprintMatches(revision) || !Array.isArray(revision.recipientIds) || revision.recipientIds.length < 1 || revision.recipientIds.length > 50 || revision.recipientIds.some((id) => !exactString(id, 200)) || new Set(revision.recipientIds).size !== revision.recipientIds.length || [...revision.recipientIds].sort(compareCanonicalIds).some((id, recipientIndex) => id !== revision.recipientIds[recipientIndex]) || !Array.isArray(revision.inviteDrafts) || revision.inviteDrafts.length !== revision.recipientIds.length || !parseDispatchPayload(revision.payload) || !parseDispatchPrivacySnapshot(revision.privacySnapshot) || !valuesEqual(revision.payload, request.payload) || !valuesEqual(revision.privacySnapshot, request.privacySnapshot)) return null;
    if (migrated ? event.actor !== "سامانهٔ مهاجرت" || event.idempotencyKey !== null || event.commandPayloadHash !== null : event.actor !== "شما" || !exactString(event.idempotencyKey, 200) || !exactHash(event.commandPayloadHash)) return null;
    if (event.type !== (index === 0 ? "created" : "updated")) return null;
    for (const [inviteIndex, inviteValue] of revision.inviteDrafts.entries()) {
      const invite = parseInvite(inviteValue, record.projectId, record.target, contacts);
      const contactRevision = invite ? contacts.records.find((contact) => contact.id === invite.supplierContactId && contact.projectId === record.projectId)?.revisions.find((candidate) => candidate.id === invite.supplierContactRevisionId && candidate.version === invite.supplierContactVersion && candidate.fingerprint === invite.supplierContactRevisionFingerprint) : null;
      if (!invite || !contactRevision || inviteIds.has(invite.id) || invite.supplierContactId !== revision.recipientIds[inviteIndex] || invite.createdAt !== revision.createdAt || Date.parse(revision.createdAt) < Date.parse(contactRevision.createdAt) || !capabilitySupports(invite.destination.responseCapability, request.requestKind)) return null;
      inviteIds.add(invite.id);
    }
    if (Date.parse(revision.createdAt) < Math.max(Date.parse(request.revisionCreatedAt), Date.parse(approval.updatedAt))) return null;
    if (index > 0 && valuesEqual(draftRevisionSemanticValue(revision), draftRevisionSemanticValue(record.revisions[index - 1]))) return null;
    if (migrated) {
      const link = evidence!.revisionLinks[index];
      if (link.canonicalRevisionId !== revision.id || link.canonicalRevisionFingerprint !== revision.fingerprint || !valuesEqual(link.contactVersionPins, revision.inviteDrafts.map((invite) => ({ supplierContactId: invite.supplierContactId, supplierContactVersion: invite.supplierContactVersion, supplierContactRevisionId: invite.supplierContactRevisionId, supplierContactRevisionFingerprint: invite.supplierContactRevisionFingerprint })))) return null;
    }
    eventIds.add(event.id); revisionIds.add(revision.id);
  }
  const latest = record.revisions.at(-1)!;
  if (record.currentRevisionId !== latest.id || record.createdAt !== record.revisions[0].createdAt || record.updatedAt !== latest.createdAt || evidence && (record.createdAt !== evidence.sourceCreatedAt || evidence.sourceVersion > record.version)) return null;
  return record;
}

function parsePlanTarget(value: unknown): value is DispatchPlanApprovalTarget {
  if (!hasExactKeys(value, ["type", "dispatchDraftId", "dispatchDraftVersion", "dispatchRevisionId", "dispatchRevisionFingerprint", "requestId", "requestVersion", "requestRevisionId", "requestRevisionFingerprint", "contentApprovalId", "contentApprovalVersion", "contentApprovalRevisionId", "contentApprovalFingerprint"])) return false;
  const target = value as DispatchPlanApprovalTarget;
  return target.type === "dispatch-draft-revision" && exactString(target.dispatchDraftId, 200) && Number.isSafeInteger(target.dispatchDraftVersion) && target.dispatchDraftVersion >= 1 && exactString(target.dispatchRevisionId, 300) && exactHash(target.dispatchRevisionFingerprint) && exactString(target.requestId, 200) && Number.isSafeInteger(target.requestVersion) && target.requestVersion >= 1 && exactString(target.requestRevisionId, 300) && exactRequestRevisionFingerprint(target.requestRevisionFingerprint) && exactString(target.contentApprovalId, 200) && Number.isSafeInteger(target.contentApprovalVersion) && target.contentApprovalVersion >= 1 && exactString(target.contentApprovalRevisionId, 300) && exactHash(target.contentApprovalFingerprint);
}

function parsePlanReviewSnapshot(value: unknown, target: DispatchPlanApprovalTarget, draft: DispatchDraftRecord, contacts: SupplierContactEnvelope): DispatchPlanApprovalReviewSnapshot | null {
  if (!hasExactKeys(value, ["recipients", "recipientCount", "payload", "privacySnapshot", "reviewAcknowledgement"]) || !hasExactKeys((value as any)?.reviewAcknowledgement, ["destinationsReviewed", "payloadReviewed", "privacyAndLocationReviewed"])) return null;
  const snapshot = value as DispatchPlanApprovalReviewSnapshot;
  const revision = draft.revisions.find((item) => item.version === target.dispatchDraftVersion && item.id === target.dispatchRevisionId && item.fingerprint === target.dispatchRevisionFingerprint);
  if (!revision || !Array.isArray(snapshot.recipients) || snapshot.recipients.length !== revision.inviteDrafts.length || snapshot.recipientCount !== snapshot.recipients.length || snapshot.reviewAcknowledgement.destinationsReviewed !== true || snapshot.reviewAcknowledgement.payloadReviewed !== true || snapshot.reviewAcknowledgement.privacyAndLocationReviewed !== true || !parseDispatchPayload(snapshot.payload) || !parseDispatchPrivacySnapshot(snapshot.privacySnapshot) || !valuesEqual(snapshot.payload, revision.payload) || !valuesEqual(snapshot.privacySnapshot, revision.privacySnapshot)) return null;
  const ids = new Set<string>();
  for (const [index, recipient] of snapshot.recipients.entries()) {
    if (!hasExactKeys(recipient, ["supplierContactId", "supplierContactVersion", "supplierContactRevisionId", "supplierContactRevisionFingerprint", "destination"]) || !exactString(recipient.supplierContactId, 200) || ids.has(recipient.supplierContactId) || !Number.isSafeInteger(recipient.supplierContactVersion) || recipient.supplierContactVersion < 1 || !exactString(recipient.supplierContactRevisionId, 300) || !exactHash(recipient.supplierContactRevisionFingerprint) || !destinationIsValid(recipient.destination)) return null;
    const invite = revision.inviteDrafts[index];
    const contact = contacts.records.find((item) => item.id === recipient.supplierContactId && item.projectId === draft.projectId);
    const contactRevision = contact?.revisions.find((item) => item.version === recipient.supplierContactVersion && item.id === recipient.supplierContactRevisionId && item.fingerprint === recipient.supplierContactRevisionFingerprint);
    if (!invite || invite.supplierContactId !== recipient.supplierContactId || invite.supplierContactVersion !== recipient.supplierContactVersion || invite.supplierContactRevisionId !== recipient.supplierContactRevisionId || invite.supplierContactRevisionFingerprint !== recipient.supplierContactRevisionFingerprint || !valuesEqual(invite.destination, recipient.destination) || !contactRevision || !valuesEqual(destinationFromSnapshot(contactRevision.snapshot), recipient.destination)) return null;
    ids.add(recipient.supplierContactId);
  }
  return snapshot;
}

function actionRecordIsValid(value: unknown): value is DispatchPlanApprovalActionRecord {
  if (!hasExactKeys(value, ["kind", "result", "label", "error", "recordedAt"])) return false;
  const action = value as DispatchPlanApprovalActionRecord;
  return action.kind === "record-local-dispatch-plan-approval" && action.result === "local-dispatch-plan-approved" && action.label === "تأیید محلی برنامهٔ ارسال" && action.error === null && exactDate(action.recordedAt);
}

function planRevisionSnapshotIsValid(value: unknown, at: string): value is DispatchPlanApprovalRevisionSnapshot {
  if (!hasExactKeys(value, ["status", "actionRecord", "decidedBy", "decidedAt"])) return false;
  const snapshot = value as DispatchPlanApprovalRevisionSnapshot;
  if (!["pending", "approved", "withdrawn"].includes(snapshot.status)) return false;
  return snapshot.status === "approved"
    ? actionRecordIsValid(snapshot.actionRecord) && snapshot.actionRecord.recordedAt === at && snapshot.decidedBy === "شما" && snapshot.decidedAt === at
    : snapshot.actionRecord === null && snapshot.decidedBy === null && snapshot.decidedAt === null;
}

function parsePlanLegacyEvidence(value: unknown): DispatchPlanApprovalLegacyEvidence | null {
  if (!hasExactKeys(value, ["schemaVersion", "sourceGeneration", "sourceIndex", "sourceRecordHash", "sourceVersion", "sourceCreatedAt", "sourceUpdatedAt", "sourceDispatchRevisionId", "sourceDispatchRevisionFingerprint", "fingerprint"])) return null;
  const evidence = value as DispatchPlanApprovalLegacyEvidence;
  return evidence.schemaVersion === 1 && evidence.sourceGeneration === "v1-array" && Number.isSafeInteger(evidence.sourceIndex) && evidence.sourceIndex >= 0 && exactHash(evidence.sourceRecordHash) && Number.isSafeInteger(evidence.sourceVersion) && evidence.sourceVersion >= 1 && exactDate(evidence.sourceCreatedAt) && exactDate(evidence.sourceUpdatedAt) && Date.parse(evidence.sourceUpdatedAt) >= Date.parse(evidence.sourceCreatedAt) && exactString(evidence.sourceDispatchRevisionId, 300) && exactLegacyHash(evidence.sourceDispatchRevisionFingerprint) && fingerprintMatches(evidence) ? evidence : null;
}

function parsePlanRecord(value: unknown, dependencies: ProcurementDispatchDependencies, contacts: SupplierContactEnvelope, drafts: DispatchDraftEnvelope): DispatchPlanApprovalRecord | null {
  const keys = ["schemaVersion", "objectType", "id", "projectId", "ownerPrincipalType", "ownerPrincipalId", "accountSide", "scopeType", "scopeId", "custodianService", "sensitivity", "purpose", "target", "snapshot", "planFingerprint", "dedupeKey", "idempotencyKey", "status", "simulationOnly", "externalEffect", "sendAuthorized", "externalActionAttempted", "actionRecord", "visibility", "localStatus", "requestedBy", "decidedBy", "requestedAt", "decidedAt", "createdAt", "updatedAt", "version", "currentRevisionId", "history", "revisions", "legacyEvidence", "fingerprint"];
  if (!hasExactKeys(value, keys)) return null;
  const record = value as DispatchPlanApprovalRecord;
  const draft = drafts.records.find((item) => item.id === record.target?.dispatchDraftId && item.projectId === record.projectId);
  if (record.schemaVersion !== 2 || record.objectType !== "dispatch-plan-approval" || !exactString(record.id, 200) || !exactString(record.projectId, 200) || !dependencies.authority.projectIds.includes(record.projectId) || record.ownerPrincipalType !== "account" || record.ownerPrincipalId !== "local-builder-account" || record.accountSide !== "builder" || record.scopeType !== "project_private" || record.scopeId !== record.projectId || record.custodianService !== "Dispatch Plan Approval Service" || record.sensitivity !== "private" || record.purpose !== "approve-local-dispatch-plan-simulation" || !parsePlanTarget(record.target) || !draft || draft.target.requestId !== record.target.requestId || draft.target.requestVersion !== record.target.requestVersion || draft.target.revisionId !== record.target.requestRevisionId || draft.target.revisionFingerprint !== record.target.requestRevisionFingerprint || draft.target.approvalId !== record.target.contentApprovalId || draft.target.approvalVersion !== record.target.contentApprovalVersion || draft.target.approvalRevisionId !== record.target.contentApprovalRevisionId || draft.target.approvalFingerprint !== record.target.contentApprovalFingerprint || !parsePlanReviewSnapshot(record.snapshot, record.target, draft, contacts) || record.planFingerprint !== dispatchPlanFingerprint(record.target, record.snapshot) || record.dedupeKey !== dispatchPlanDedupeKey(record.projectId, record.target, record.planFingerprint) || !exactString(record.idempotencyKey, maximumPlanRecordIdempotencyKeyLength) || !["pending", "approved", "withdrawn"].includes(record.status) || record.simulationOnly !== true || record.externalEffect !== "none" || record.sendAuthorized !== false || record.externalActionAttempted !== false || record.visibility !== "خصوصی پروژه" || record.localStatus !== "ثبت محلی" || record.requestedBy !== "شما" || !exactDate(record.requestedAt) || record.requestedAt !== record.createdAt || !exactDate(record.createdAt) || !exactDate(record.updatedAt) || !Number.isSafeInteger(record.version) || record.version < 1 || !exactString(record.currentRevisionId, 300) || !Array.isArray(record.history) || !Array.isArray(record.revisions) || record.history.length !== record.version || record.revisions.length !== record.version || !fingerprintMatches(record)) return null;
  const dependencyTarget: DispatchDependencyTarget = { requestId: record.target.requestId, requestVersion: record.target.requestVersion, revisionId: record.target.requestRevisionId, revisionFingerprint: record.target.requestRevisionFingerprint, approvalId: record.target.contentApprovalId, approvalVersion: record.target.contentApprovalVersion, approvalRevisionId: record.target.contentApprovalRevisionId, approvalFingerprint: record.target.contentApprovalFingerprint };
  if (!requestDependencyForTarget(dependencies, record.projectId, dependencyTarget) || !approvalDependencyForTarget(dependencies, record.projectId, dependencyTarget)) return null;
  const request = requestDependencyForTarget(dependencies, record.projectId, dependencyTarget);
  const approval = approvalDependencyForTarget(dependencies, record.projectId, dependencyTarget);
  const draftRevision = draft.revisions.find((revision) => revision.id === record.target.dispatchRevisionId && revision.version === record.target.dispatchDraftVersion && revision.fingerprint === record.target.dispatchRevisionFingerprint);
  const evidence = record.legacyEvidence === null ? null : parsePlanLegacyEvidence(record.legacyEvidence);
  if (record.legacyEvidence !== null && !evidence) return null;
  if (!request || !approval || !draftRevision || !evidence && record.idempotencyKey !== `${record.dedupeKey}:simulation-v2`) return null;
  const recipientRevisionDates = record.snapshot.recipients.map((recipient) => contacts.records.find((contact) => contact.id === recipient.supplierContactId && contact.projectId === record.projectId)?.revisions.find((revision) => revision.id === recipient.supplierContactRevisionId && revision.version === recipient.supplierContactVersion && revision.fingerprint === recipient.supplierContactRevisionFingerprint)?.createdAt ?? "");
  if (recipientRevisionDates.some((createdAt) => !exactDate(createdAt)) || Date.parse(record.createdAt) < Math.max(Date.parse(draftRevision.createdAt), Date.parse(request.revisionCreatedAt), Date.parse(approval.updatedAt), ...recipientRevisionDates.map(Date.parse))) return null;
  let state: DispatchPlanApprovalStatus = "pending";
  for (let index = 0; index < record.version; index += 1) {
    const event = record.history[index];
    const revision = record.revisions[index];
    const migrated = evidence !== null && index < evidence.sourceVersion;
    if (!hasExactKeys(event, ["id", "type", "actor", "actorPrincipalId", "at", "version", "revisionId", "authorizationContextHash", "idempotencyKey", "commandPayloadHash", "fingerprint"]) || !hasExactKeys(revision, ["id", "version", "createdAt", "snapshot", "fingerprint"]) || event.id !== `dispatch-plan-approval-event:${record.id}:v${index + 1}` || revision.id !== `dispatch-plan-approval-revision:${record.id}:v${index + 1}` || event.version !== index + 1 || revision.version !== index + 1 || event.revisionId !== revision.id || !exactDate(event.at) || revision.createdAt !== event.at || index > 0 && (Date.parse(event.at) < Date.parse(record.history[index - 1].at) || !migrated && Date.parse(event.at) === Date.parse(record.history[index - 1].at)) || event.actorPrincipalId !== "local-builder-account" || event.authorizationContextHash !== dependencies.authority.authorizationHashes[record.projectId] || !fingerprintMatches(event) || !fingerprintMatches(revision) || !planRevisionSnapshotIsValid(revision.snapshot, revision.createdAt)) return null;
    if (migrated ? event.actor !== "سامانهٔ مهاجرت" || event.idempotencyKey !== null || event.commandPayloadHash !== null : event.actor !== "شما" || !exactString(event.idempotencyKey, 200) || !exactHash(event.commandPayloadHash)) return null;
    if (index === 0) {
      if (event.type !== "created" || revision.snapshot.status !== "pending") return null;
    } else if (state === "pending" && event.type === "approved" && revision.snapshot.status === "approved") state = "approved";
    else if (state === "pending" && event.type === "withdrawn" && revision.snapshot.status === "withdrawn") state = "withdrawn";
    else if (state === "withdrawn" && event.type === "reopened" && revision.snapshot.status === "pending") state = "pending";
    else return null;
    if (index === 0) state = "pending";
  }
  const latest = record.revisions.at(-1)!;
  if (record.currentRevisionId !== latest.id || record.createdAt !== record.history[0].at || record.updatedAt !== latest.createdAt || record.status !== latest.snapshot.status || !valuesEqual({ actionRecord: record.actionRecord, decidedBy: record.decidedBy, decidedAt: record.decidedAt }, { actionRecord: latest.snapshot.actionRecord, decidedBy: latest.snapshot.decidedBy, decidedAt: latest.snapshot.decidedAt }) || evidence && (record.createdAt !== evidence.sourceCreatedAt || evidence.sourceVersion > record.version)) return null;
  return record;
}

export function dispatchDraftDedupeKey(projectId: string, target: DispatchDependencyTarget) {
  return `${projectId}:${target.requestId}:${target.requestVersion}:${target.revisionId}:dispatch-draft`;
}

export function dispatchPlanFingerprint(target: DispatchPlanApprovalTarget, snapshot: DispatchPlanApprovalReviewSnapshot) {
  return procurementDispatchHash({ target, snapshot });
}

export function dispatchPlanDedupeKey(projectId: string, target: DispatchPlanApprovalTarget, planFingerprint: string) {
  return `${projectId}:${target.dispatchDraftId}:${target.dispatchRevisionId}:${planFingerprint}:local-plan-approval`;
}

export function parseDispatchDraftEnvelope(value: unknown, dependencies: ProcurementDispatchDependencies, contacts: SupplierContactEnvelope): DispatchDraftEnvelope | null {
  if (!dependenciesAreValid(dependencies) || !parseSupplierContactEnvelope(contacts, dependencies.authority) || !hasExactKeys(value, ["schemaVersion", "fingerprintVersion", "storeVersion", "records", "idempotencyReceipts", "migrationReports", "updatedAt", "fingerprint"])) return null;
  const envelope = value as DispatchDraftEnvelope;
  if (envelope.schemaVersion !== 2 || envelope.fingerprintVersion !== "dispatch-draft-domain-v2" || !Number.isSafeInteger(envelope.storeVersion) || envelope.storeVersion < 1 || !Array.isArray(envelope.records) || !Array.isArray(envelope.idempotencyReceipts) || !Array.isArray(envelope.migrationReports) || envelope.migrationReports.length !== 1 || !exactDate(envelope.updatedAt) || !fingerprintMatches(envelope)) return null;
  const report = parseMigrationReport(envelope.migrationReports[0], "dispatch-draft", legacyProjectDispatchDraftsStorageKey);
  const records = envelope.records.map((record) => parseDraftRecord(record, dependencies, contacts));
  const receipts = envelope.idempotencyReceipts.map(parseReceipt);
  if (!report || records.some((record) => record === null) || receipts.some((receipt) => receipt === null) || envelope.storeVersion !== receipts.length + 1 || !validateReceiptTimeline(receipts as ProcurementCommandReceipt[], report.migratedAt)) return null;
  const exactRecords = records as DispatchDraftRecord[];
  const exactReceipts = receipts as ProcurementCommandReceipt[];
  if (!recordsFitPerProjectLimit(exactRecords) || new Set(exactRecords.map((record) => record.id)).size !== exactRecords.length || new Set(exactRecords.map((record) => record.dedupeKey)).size !== exactRecords.length || exactRecords.filter((record) => record.legacyEvidence).length !== report.recordCount) return null;
  const migrated = exactRecords.slice(0, report.recordCount);
  if (migrated.some((record, index) => !record.legacyEvidence || record.legacyEvidence.sourceIndex !== index || initialDraftRecord(record).fingerprint !== report.migratedRecordFingerprints[index]) || exactRecords.slice(report.recordCount).some((record) => record.legacyEvidence !== null)) return null;
  const receiptEventIds = new Set(exactReceipts.map((receipt) => receipt.eventId));
  if (receiptEventIds.size !== exactReceipts.length) return null;
  const receiptRevisionIds = new Set<string>();
  const aggregateQueueKeys = new Set<string>();
  for (const receipt of exactReceipts) {
    if (receipt.action !== "upsert-dispatch-draft" || receipt.authorizationContextHash !== dependencies.authority.authorizationHashes[receipt.projectId]) return null;
    const record = exactRecords.find((item) => item.id === receipt.recordId && item.projectId === receipt.projectId);
    const event = record?.history.find((item) => item.id === receipt.eventId);
    const revision = record?.revisions.find((item) => item.id === receipt.revisionId);
    if (!record || !event || !revision || receiptRevisionIds.has(receipt.revisionId) || event.type !== (receipt.result === "created" ? "created" : "updated") || event.revisionId !== revision.id || event.version !== receipt.resultingRecordVersion || revision.version !== receipt.resultingRecordVersion || event.idempotencyKey !== receipt.key || event.commandPayloadHash !== receipt.payloadHash || event.authorizationContextHash !== receipt.authorizationContextHash || event.at !== receipt.recordedAt || receipt.expectedRecordVersion !== (receipt.result === "created" ? null : receipt.resultingRecordVersion - 1)) return null;
    receiptRevisionIds.add(receipt.revisionId);
    const precondition = receiptPreconditionReference(receipt);
    if (!precondition) return null;
    const reconstructed: Omit<DispatchDraftUpsertCommand, "idempotencyKey"> = { inputSchemaVersion: 1, action: "upsert-dispatch-draft", projectId: receipt.projectId, dispatchDraftId: receipt.recordId, requestId: record.target.requestId, expectedRequestVersion: record.target.requestVersion, expectedRequestRevisionId: record.target.revisionId, expectedRequestRevisionFingerprint: record.target.revisionFingerprint, approvalId: record.target.approvalId, expectedApprovalVersion: record.target.approvalVersion, expectedApprovalRevisionId: record.target.approvalRevisionId, expectedApprovalFingerprint: record.target.approvalFingerprint, recipients: revision.inviteDrafts.map((invite) => ({ supplierContactId: invite.supplierContactId, expectedContactVersion: invite.supplierContactVersion, expectedContactRevisionId: invite.supplierContactRevisionId, expectedContactRevisionFingerprint: invite.supplierContactRevisionFingerprint })), expectedContactStoreVersion: receipt.expectedContactStoreVersion!, expectedDraftStoreVersion: receipt.expectedDraftStoreVersion!, expectedDraftVersion: receipt.expectedRecordVersion, precondition };
    const deterministicRecordId = dispatchDraftIdForTarget(receipt.projectId, record.target.requestId, record.target.requestVersion, record.target.revisionId);
    const recordIdIsWriterProducible = record.legacyEvidence !== null ? receipt.result === "updated" : receipt.recordId === deterministicRecordId;
    const request = requestDependencyForTarget(dependencies, record.projectId, record.target);
    const checkpoint = checkpointForReference(dependencies, precondition);
    const { precondition: _precondition, ...checkpointPayload } = reconstructed;
    const directCheckpointIsValid = !!checkpoint
      && checkpoint.operation === "dispatch-draft"
      && checkpointMatchesTarget(checkpoint, record.projectId, record.target)
      && checkpoint.checkpointKey === procurementDispatchPreconditionCheckpointKey("dispatch-draft", receipt.key)
      && checkpoint.commandPayloadHash === procurementDispatchHash(checkpointPayload);
    const queueCheckpointIsValid = !!checkpoint
      && receipt.aggregateQueueIdempotencyKey !== null
      && checkpoint.operation === "dispatch-queue"
      && checkpointMatchesTarget(checkpoint, record.projectId, record.target)
      && checkpoint.checkpointKey === procurementDispatchPreconditionCheckpointKey("dispatch-queue", receipt.aggregateQueueIdempotencyKey);
    const priorRevision = recordRevisionAtStoreVersion<DispatchDraftRevision>(envelope, record, receipt.expectedStoreVersion);
    const ownPreimageIsValid = receipt.result === "created" ? priorRevision === null : priorRevision?.version === receipt.expectedRecordVersion;
    const contactPreimageIsValid = receipt.expectedContactStoreVersion !== null && !!request && revision.inviteDrafts.every((invite) => contactPinIsCurrentAtStoreVersion(contacts, receipt.expectedContactStoreVersion!, record.projectId, invite, request.requestKind));
    if (receipt.expectedContactStoreVersion === null
      || !contactPreimageIsValid
      || receipt.expectedDraftStoreVersion !== receipt.expectedStoreVersion
      || !ownPreimageIsValid
      || !(receipt.aggregateQueueIdempotencyKey === null ? directCheckpointIsValid : queueCheckpointIsValid)
      || receipt.payloadHash !== procurementDispatchHash(reconstructed)
      || !recordIdIsWriterProducible) return null;
    if (receipt.aggregateQueueIdempotencyKey !== null) {
      if (aggregateQueueKeys.has(receipt.aggregateQueueIdempotencyKey) || receipt.aggregateCommandPayloadHash === null) return null;
      aggregateQueueKeys.add(receipt.aggregateQueueIdempotencyKey);
    } else if (receipt.aggregateCommandPayloadHash !== null) return null;
  }
  if (exactRecords.some((record) => record.history.some((event, index) => index >= (record.legacyEvidence?.sourceVersion ?? 0) && !receiptEventIds.has(event.id)))) return null;
  const createdOrder = exactReceipts.filter((receipt) => receipt.result === "created").map((receipt) => receipt.recordId);
  if (exactRecords.slice(report.recordCount).some((record, index) => record.id !== createdOrder[index]) || exactRecords.length - report.recordCount !== createdOrder.length || envelope.updatedAt !== (exactReceipts.at(-1)?.recordedAt ?? report.migratedAt)) return null;
  return envelope;
}

export function parseDispatchDraftEnvelopeRaw(raw: string | null, dependencies: ProcurementDispatchDependencies, contacts: SupplierContactEnvelope): DispatchDraftEnvelope | null {
  if (raw === null) return null;
  try { return parseDispatchDraftEnvelope(JSON.parse(raw), dependencies, contacts); } catch { return null; }
}

function reconstructQueuedDraftCommand(receipt: ProcurementCommandReceipt, record: DispatchDraftRecord, revision: DispatchDraftRevision): DispatchDraftUpsertCommand | null {
  if (receipt.action !== "upsert-dispatch-draft" || receipt.expectedContactStoreVersion === null || receipt.expectedDraftStoreVersion === null || receipt.aggregateQueueIdempotencyKey === null || receipt.aggregateCommandPayloadHash === null) return null;
  const precondition = receiptPreconditionReference(receipt);
  if (!precondition) return null;
  const command: DispatchDraftUpsertCommand = {
    inputSchemaVersion: 1,
    action: "upsert-dispatch-draft",
    projectId: receipt.projectId,
    dispatchDraftId: receipt.recordId,
    requestId: record.target.requestId,
    expectedRequestVersion: record.target.requestVersion,
    expectedRequestRevisionId: record.target.revisionId,
    expectedRequestRevisionFingerprint: record.target.revisionFingerprint,
    approvalId: record.target.approvalId,
    expectedApprovalVersion: record.target.approvalVersion,
    expectedApprovalRevisionId: record.target.approvalRevisionId,
    expectedApprovalFingerprint: record.target.approvalFingerprint,
    recipients: revision.inviteDrafts.map((invite) => ({ supplierContactId: invite.supplierContactId, expectedContactVersion: invite.supplierContactVersion, expectedContactRevisionId: invite.supplierContactRevisionId, expectedContactRevisionFingerprint: invite.supplierContactRevisionFingerprint })),
    expectedContactStoreVersion: receipt.expectedContactStoreVersion,
    expectedDraftStoreVersion: receipt.expectedDraftStoreVersion,
    expectedDraftVersion: receipt.expectedRecordVersion,
    precondition,
    idempotencyKey: receipt.key,
  };
  return draftCommandIsValid(command) && receipt.payloadHash === procurementDispatchHash(draftCommandPayload(command)) ? command : null;
}

function reconstructAggregateQueueCommand(receipt: ProcurementCommandReceipt, record: DispatchPlanApprovalRecord, drafts: DispatchDraftEnvelope, dependencies: ProcurementDispatchDependencies): ProcurementDispatchQueueCommand | null {
  if (receipt.action !== "create-dispatch-plan" || receipt.aggregateQueueIdempotencyKey === null || receipt.aggregateCommandPayloadHash === null || receipt.expectedContactStoreVersion === null || receipt.expectedDraftStoreVersion === null) return null;
  const matchingDraftReceipts = drafts.idempotencyReceipts.filter((candidate) => candidate.action === "upsert-dispatch-draft"
    && candidate.projectId === receipt.projectId
    && candidate.recordId === record.target.dispatchDraftId
    && candidate.resultingRecordVersion === record.target.dispatchDraftVersion
    && candidate.revisionId === record.target.dispatchRevisionId
    && candidate.aggregateQueueIdempotencyKey === receipt.aggregateQueueIdempotencyKey
    && candidate.aggregateCommandPayloadHash === receipt.aggregateCommandPayloadHash);
  if (matchingDraftReceipts.length !== 1) return null;
  const draftReceipt = matchingDraftReceipts[0];
  const draftRecord = drafts.records.find((candidate) => candidate.id === draftReceipt.recordId && candidate.projectId === draftReceipt.projectId);
  const draftRevision = draftRecord?.revisions.find((candidate) => candidate.id === draftReceipt.revisionId && candidate.version === draftReceipt.resultingRecordVersion);
  if (!draftRecord || !draftRevision || record.target.dispatchRevisionFingerprint !== draftRevision.fingerprint || receipt.expectedDraftStoreVersion !== draftReceipt.resultingStoreVersion || receipt.expectedContactStoreVersion !== draftReceipt.expectedContactStoreVersion) return null;
  const draft = reconstructQueuedDraftCommand(draftReceipt, draftRecord, draftRevision);
  const planPrecondition = receiptPreconditionReference(receipt);
  if (!draft || !planPrecondition || !valuesEqual(draft.precondition, planPrecondition)) return null;
  const command: ProcurementDispatchQueueCommand = {
    inputSchemaVersion: 1,
    action: "queue-dispatch-plan",
    draft,
    plan: {
      inputSchemaVersion: 1,
      action: "create-dispatch-plan",
      projectId: receipt.projectId,
      planApprovalId: receipt.recordId,
      expectedContactStoreVersion: receipt.expectedContactStoreVersion,
      expectedPlanStoreVersion: receipt.expectedStoreVersion,
      precondition: planPrecondition,
      acknowledgement: record.snapshot.reviewAcknowledgement,
      idempotencyKey: receipt.key,
    },
    queueIdempotencyKey: receipt.aggregateQueueIdempotencyKey,
  };
  const checkpoint = checkpointForReference(dependencies, planPrecondition);
  return queueCommandIsValid(command)
    && checkpoint?.operation === "dispatch-queue"
    && checkpoint.checkpointKey === procurementDispatchPreconditionCheckpointKey("dispatch-queue", command.queueIdempotencyKey)
    && checkpoint.commandPayloadHash === procurementDispatchHash(queuePreconditionCommandPayload(command))
    && checkpointMatchesTarget(checkpoint, record.projectId, draftRecord.target)
    && receipt.aggregateCommandPayloadHash === procurementDispatchHash(queueCommandPayload(command)) ? command : null;
}

export function parseDispatchPlanApprovalEnvelope(value: unknown, dependencies: ProcurementDispatchDependencies, contacts: SupplierContactEnvelope, drafts: DispatchDraftEnvelope): DispatchPlanApprovalEnvelope | null {
  if (!dependenciesAreValid(dependencies) || !parseSupplierContactEnvelope(contacts, dependencies.authority) || !parseDispatchDraftEnvelope(drafts, dependencies, contacts) || !hasExactKeys(value, ["schemaVersion", "fingerprintVersion", "storeVersion", "records", "idempotencyReceipts", "migrationReports", "updatedAt", "fingerprint"])) return null;
  const envelope = value as DispatchPlanApprovalEnvelope;
  if (envelope.schemaVersion !== 2 || envelope.fingerprintVersion !== "dispatch-plan-approval-domain-v2" || !Number.isSafeInteger(envelope.storeVersion) || envelope.storeVersion < 1 || !Array.isArray(envelope.records) || !Array.isArray(envelope.idempotencyReceipts) || !Array.isArray(envelope.migrationReports) || envelope.migrationReports.length !== 1 || !exactDate(envelope.updatedAt) || !fingerprintMatches(envelope)) return null;
  const report = parseMigrationReport(envelope.migrationReports[0], "dispatch-plan-approval", legacyProjectDispatchPlanApprovalsStorageKey);
  const records = envelope.records.map((record) => parsePlanRecord(record, dependencies, contacts, drafts));
  const receipts = envelope.idempotencyReceipts.map(parseReceipt);
  if (!report || records.some((record) => record === null) || receipts.some((receipt) => receipt === null) || envelope.storeVersion !== receipts.length + 1 || !validateReceiptTimeline(receipts as ProcurementCommandReceipt[], report.migratedAt)) return null;
  const exactRecords = records as DispatchPlanApprovalRecord[];
  const exactReceipts = receipts as ProcurementCommandReceipt[];
  if (!recordsFitPerProjectLimit(exactRecords) || new Set(exactRecords.map((record) => record.id)).size !== exactRecords.length || new Set(exactRecords.map((record) => record.dedupeKey)).size !== exactRecords.length || exactRecords.filter((record) => record.legacyEvidence).length !== report.recordCount) return null;
  const migrated = exactRecords.slice(0, report.recordCount);
  if (migrated.some((record, index) => !record.legacyEvidence || record.legacyEvidence.sourceIndex !== index || initialPlanRecord(record).fingerprint !== report.migratedRecordFingerprints[index]) || exactRecords.slice(report.recordCount).some((record) => record.legacyEvidence !== null)) return null;
  const receiptEventIds = new Set(exactReceipts.map((receipt) => receipt.eventId));
  if (receiptEventIds.size !== exactReceipts.length) return null;
  const receiptRevisionIds = new Set<string>();
  const aggregateQueueKeys = new Set<string>();
  for (const receipt of exactReceipts) {
    if (!["create-dispatch-plan", "withdraw-dispatch-plan", "reopen-dispatch-plan", "approve-dispatch-plan"].includes(receipt.action) || receipt.authorizationContextHash !== dependencies.authority.authorizationHashes[receipt.projectId]) return null;
    const record = exactRecords.find((item) => item.id === receipt.recordId && item.projectId === receipt.projectId);
    const event = record?.history.find((item) => item.id === receipt.eventId);
    const revision = record?.revisions.find((item) => item.id === receipt.revisionId);
    const expectedType = receipt.action === "create-dispatch-plan" ? "created" : receipt.action === "withdraw-dispatch-plan" ? "withdrawn" : receipt.action === "reopen-dispatch-plan" ? "reopened" : "approved";
    if (!record || !event || !revision || receiptRevisionIds.has(receipt.revisionId) || event.type !== expectedType || event.revisionId !== revision.id || event.version !== receipt.resultingRecordVersion || revision.version !== receipt.resultingRecordVersion || event.idempotencyKey !== receipt.key || event.commandPayloadHash !== receipt.payloadHash || event.authorizationContextHash !== receipt.authorizationContextHash || event.at !== receipt.recordedAt || receipt.result !== (receipt.action === "create-dispatch-plan" ? "created" : "updated") || receipt.expectedRecordVersion !== (receipt.action === "create-dispatch-plan" ? null : receipt.resultingRecordVersion - 1)) return null;
    receiptRevisionIds.add(receipt.revisionId);
    const precondition = receiptPreconditionReference(receipt);
    if (!precondition || receipt.expectedContactStoreVersion === null || receipt.expectedDraftStoreVersion === null) return null;
    const reconstructed = receipt.action === "create-dispatch-plan"
      ? { inputSchemaVersion: 1, action: receipt.action, projectId: receipt.projectId, planApprovalId: receipt.recordId, dispatchDraftId: record.target.dispatchDraftId, expectedContactStoreVersion: receipt.expectedContactStoreVersion, expectedDraftStoreVersion: receipt.expectedDraftStoreVersion, expectedDraftVersion: record.target.dispatchDraftVersion, expectedDispatchRevisionId: record.target.dispatchRevisionId, expectedDispatchRevisionFingerprint: record.target.dispatchRevisionFingerprint, expectedPlanStoreVersion: receipt.expectedStoreVersion, precondition, acknowledgement: record.snapshot.reviewAcknowledgement }
      : { inputSchemaVersion: 1, action: receipt.action, projectId: receipt.projectId, planApprovalId: receipt.recordId, expectedContactStoreVersion: receipt.expectedContactStoreVersion, expectedDraftStoreVersion: receipt.expectedDraftStoreVersion, expectedPlanStoreVersion: receipt.expectedStoreVersion, expectedPlanVersion: receipt.expectedRecordVersion!, precondition };
    const dependencyTarget: DispatchDependencyTarget = { requestId: record.target.requestId, requestVersion: record.target.requestVersion, revisionId: record.target.requestRevisionId, revisionFingerprint: record.target.requestRevisionFingerprint, approvalId: record.target.contentApprovalId, approvalVersion: record.target.contentApprovalVersion, approvalRevisionId: record.target.contentApprovalRevisionId, approvalFingerprint: record.target.contentApprovalFingerprint };
    const checkpoint = checkpointForReference(dependencies, precondition);
    const { precondition: _precondition, ...checkpointPayload } = reconstructed;
    const directCheckpointIsValid = !!checkpoint
      && checkpoint.operation === "dispatch-plan"
      && checkpoint.checkpointKey === procurementDispatchPreconditionCheckpointKey("dispatch-plan", receipt.key)
      && checkpoint.commandPayloadHash === procurementDispatchHash(checkpointPayload)
      && checkpointMatchesTarget(checkpoint, receipt.projectId, dependencyTarget);
    const queueCheckpointIsValid = !!checkpoint
      && checkpoint.operation === "dispatch-queue"
      && checkpointMatchesTarget(checkpoint, receipt.projectId, dependencyTarget);
    const request = requestDependencyForTarget(dependencies, record.projectId, { requestId: record.target.requestId, requestVersion: record.target.requestVersion, revisionId: record.target.requestRevisionId, revisionFingerprint: record.target.requestRevisionFingerprint, approvalId: record.target.contentApprovalId, approvalVersion: record.target.contentApprovalVersion, approvalRevisionId: record.target.contentApprovalRevisionId, approvalFingerprint: record.target.contentApprovalFingerprint });
    const priorRevision = recordRevisionAtStoreVersion<DispatchPlanApprovalRevision>(envelope, record, receipt.expectedStoreVersion);
    const ownPreimageIsValid = receipt.action === "create-dispatch-plan" ? priorRevision === null : priorRevision?.version === receipt.expectedRecordVersion;
    const contactPreimageIsValid = receipt.expectedContactStoreVersion !== null && !!request && record.snapshot.recipients.every((recipient) => contactPinIsCurrentAtStoreVersion(contacts, receipt.expectedContactStoreVersion!, record.projectId, recipient, request.requestKind));
    const draftPreimageIsValid = receipt.expectedDraftStoreVersion !== null && draftRevisionIsCurrentAtStoreVersion(drafts, receipt.expectedDraftStoreVersion, record.projectId, record.target);
    if (receipt.expectedContactStoreVersion === null
      || !contactPreimageIsValid
      || receipt.expectedDraftStoreVersion === null
      || !draftPreimageIsValid
      || !ownPreimageIsValid
      || !(receipt.aggregateQueueIdempotencyKey === null ? directCheckpointIsValid : queueCheckpointIsValid)
      || receipt.payloadHash !== procurementDispatchHash(reconstructed)
      || receipt.action === "create-dispatch-plan" && receipt.recordId !== dispatchPlanApprovalIdForIdempotencyKey(receipt.key)) return null;
    if (receipt.aggregateQueueIdempotencyKey !== null) {
      if (receipt.action !== "create-dispatch-plan" || aggregateQueueKeys.has(receipt.aggregateQueueIdempotencyKey) || !reconstructAggregateQueueCommand(receipt, record, drafts, dependencies)) return null;
      aggregateQueueKeys.add(receipt.aggregateQueueIdempotencyKey);
    } else if (receipt.aggregateCommandPayloadHash !== null) return null;
  }
  const draftQueueReceipts = drafts.idempotencyReceipts.filter((receipt) => receipt.aggregateQueueIdempotencyKey !== null);
  if (draftQueueReceipts.length !== aggregateQueueKeys.size) return null;
  for (const draftReceipt of draftQueueReceipts) {
    const matchingPlanReceipts = exactReceipts.filter((receipt) => receipt.aggregateQueueIdempotencyKey === draftReceipt.aggregateQueueIdempotencyKey
      && receipt.aggregateCommandPayloadHash === draftReceipt.aggregateCommandPayloadHash);
    if (matchingPlanReceipts.length !== 1) return null;
    const planReceipt = matchingPlanReceipts[0];
    const planRecord = exactRecords.find((record) => record.id === planReceipt.recordId && record.projectId === planReceipt.projectId);
    const aggregateCommand = planRecord ? reconstructAggregateQueueCommand(planReceipt, planRecord, drafts, dependencies) : null;
    if (!aggregateCommand
      || aggregateCommand.draft.idempotencyKey !== draftReceipt.key
      || aggregateCommand.queueIdempotencyKey !== draftReceipt.aggregateQueueIdempotencyKey
      || receiptPreconditionReference(draftReceipt) === null
      || !valuesEqual(aggregateCommand.draft.precondition, receiptPreconditionReference(draftReceipt))) return null;
  }
  if (exactRecords.some((record) => record.history.some((event, index) => index >= (record.legacyEvidence?.sourceVersion ?? 0) && !receiptEventIds.has(event.id)))) return null;
  const createdOrder = exactReceipts.filter((receipt) => receipt.action === "create-dispatch-plan").map((receipt) => receipt.recordId);
  if (exactRecords.slice(report.recordCount).some((record, index) => record.id !== createdOrder[index]) || exactRecords.length - report.recordCount !== createdOrder.length || envelope.updatedAt !== (exactReceipts.at(-1)?.recordedAt ?? report.migratedAt)) return null;
  return envelope;
}

export function parseDispatchPlanApprovalEnvelopeRaw(raw: string | null, dependencies: ProcurementDispatchDependencies, contacts: SupplierContactEnvelope, drafts: DispatchDraftEnvelope): DispatchPlanApprovalEnvelope | null {
  if (raw === null) return null;
  try { return parseDispatchPlanApprovalEnvelope(JSON.parse(raw), dependencies, contacts, drafts); } catch { return null; }
}

function initialContactRecord(record: SupplierContactRecord) {
  const version = record.legacyEvidence?.sourceVersion ?? 1;
  const revision = record.revisions[version - 1];
  return finalizeContactRecord({
    ...record,
    ...revision.snapshot,
    version,
    currentRevisionId: revision.id,
    updatedAt: revision.createdAt,
    history: record.history.slice(0, version),
    revisions: record.revisions.slice(0, version),
  });
}

function initialDraftRecord(record: DispatchDraftRecord) {
  const version = record.legacyEvidence?.sourceVersion ?? 1;
  const revision = record.revisions[version - 1];
  return finalizeDraftRecord({
    ...record,
    version,
    currentRevisionId: revision.id,
    updatedAt: revision.createdAt,
    history: record.history.slice(0, version),
    revisions: record.revisions.slice(0, version),
  });
}

function initialPlanRecord(record: DispatchPlanApprovalRecord) {
  const version = record.legacyEvidence?.sourceVersion ?? 1;
  const revision = record.revisions[version - 1];
  return finalizePlanRecord({
    ...record,
    ...revision.snapshot,
    version,
    currentRevisionId: revision.id,
    updatedAt: revision.createdAt,
    history: record.history.slice(0, version),
    revisions: record.revisions.slice(0, version),
  });
}

function initialContactEnvelope(envelope: SupplierContactEnvelope) {
  return finalizeContactEnvelope({
    schemaVersion: 2,
    fingerprintVersion: "supplier-contact-domain-v2",
    storeVersion: 1,
    records: envelope.records.filter((record) => record.legacyEvidence !== null).map(initialContactRecord),
    idempotencyReceipts: [],
    migrationReports: envelope.migrationReports,
    updatedAt: envelope.migrationReports[0].migratedAt,
  });
}

function initialDraftEnvelope(envelope: DispatchDraftEnvelope) {
  return finalizeDraftEnvelope({
    schemaVersion: 2,
    fingerprintVersion: "dispatch-draft-domain-v2",
    storeVersion: 1,
    records: envelope.records.filter((record) => record.legacyEvidence !== null).map(initialDraftRecord),
    idempotencyReceipts: [],
    migrationReports: envelope.migrationReports,
    updatedAt: envelope.migrationReports[0].migratedAt,
  });
}

function initialPlanEnvelope(envelope: DispatchPlanApprovalEnvelope) {
  return finalizePlanEnvelope({
    schemaVersion: 2,
    fingerprintVersion: "dispatch-plan-approval-domain-v2",
    storeVersion: 1,
    records: envelope.records.filter((record) => record.legacyEvidence !== null).map(initialPlanRecord),
    idempotencyReceipts: [],
    migrationReports: envelope.migrationReports,
    updatedAt: envelope.migrationReports[0].migratedAt,
  });
}

type LegacySupplierContact = {
  id: string;
  projectId: string;
  displayName: string;
  category: string;
  tehranCoverage: string;
  responseCapability: SupplierContactResponseCapability;
  status: SupplierContactStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  history: SupplierContactLegacyEvent[];
  sourceIndex: number;
  sourceRecordHash: string;
};

type LegacyInviteDraft = {
  id: string;
  supplierContactId: string;
  destination: InviteDraftDestination;
  createdAt: string;
  sourceValue: Record<string, unknown>;
};

type LegacyDispatchRevision = {
  id: string;
  version: number;
  createdAt: string;
  recipientIds: string[];
  invites: LegacyInviteDraft[];
  payload: DispatchPayload;
  privacySnapshot: DispatchPrivacySnapshot;
  sourceFingerprint: string;
};

type LegacyDispatchDraft = {
  id: string;
  projectId: string;
  target: { requestId: string; requestVersion: number; revisionId: string; approvalId: string };
  canonicalTarget: DispatchDependencyTarget;
  dedupeKey: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: Array<{ id: string; type: DispatchDraftEventType; actor: "شما"; at: string; version: number }>;
  revisions: LegacyDispatchRevision[];
  sourceIndex: number;
  sourceRecordHash: string;
};

type LegacyDispatchPlan = {
  id: string;
  projectId: string;
  sourceTarget: {
    dispatchDraftId: string;
    dispatchDraftVersion: number;
    dispatchRevisionId: string;
    dispatchRevisionFingerprint: string;
  };
  draft: DispatchDraftRecord;
  draftRevision: DispatchDraftRevision;
  sourceSnapshot: Record<string, unknown>;
  sourcePlanFingerprint: string;
  sourceDedupeKey: string;
  sourceIdempotencyKey: string;
  status: DispatchPlanApprovalStatus;
  actionRecord: DispatchPlanApprovalActionRecord | null;
  requestedAt: string;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  history: Array<{ id: string; type: DispatchPlanApprovalEventType; actor: "شما"; at: string; version: number }>;
  sourceIndex: number;
  sourceRecordHash: string;
};

function parseLegacyContacts(raw: string, authority: ProcurementDispatchAuthority): LegacySupplierContact[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 1000) return null;
    const ids = new Set<string>();
    const projectCounts = new Map<string, number>();
    const result: LegacySupplierContact[] = [];
    for (const [sourceIndex, value] of parsed.entries()) {
      const keys = ["schemaVersion", "id", "projectId", "displayName", "category", "tehranCoverage", "responseCapability", "source", "networkStatus", "status", "visibility", "localStatus", "version", "createdAt", "updatedAt", "archivedAt", "history"];
      if (!hasExactKeys(value, keys)) return null;
      const item = value as any;
      if (item.schemaVersion !== 1 || !exactString(item.id, 200) || ids.has(item.id) || !exactString(item.projectId, 200) || !authority.projectIds.includes(item.projectId) || !exactString(item.displayName, 100) || !visibleText(item.displayName) || !exactString(item.category, 100) || !visibleText(item.category) || !exactString(item.tehranCoverage, 120) || !visibleText(item.tehranCoverage) || !["product", "service", "both"].includes(item.responseCapability) || item.source !== "ثبت مستقیم سازنده" || item.networkStatus !== "خارج از شبکه چیدا" || !["active", "archived"].includes(item.status) || item.visibility !== "خصوصی پروژه" || item.localStatus !== "ثبت محلی" || !Number.isSafeInteger(item.version) || item.version < 1 || !exactDate(item.createdAt) || !exactDate(item.updatedAt) || item.archivedAt !== null && !exactDate(item.archivedAt) || !Array.isArray(item.history) || item.history.length !== item.version) return null;
      let status: SupplierContactStatus = "active";
      const eventIds = new Set<string>();
      const history: SupplierContactLegacyEvent[] = [];
      for (const [index, event] of item.history.entries()) {
        if (!hasExactKeys(event, ["id", "type", "actor", "at", "version"]) || !exactString(event.id, 200) || eventIds.has(event.id) || !["created", "archived", "restored"].includes(event.type) || event.actor !== "شما" || !exactDate(event.at) || event.version !== index + 1 || index > 0 && Date.parse(event.at) < Date.parse(item.history[index - 1].at)) return null;
        if (index === 0 ? event.type !== "created" : event.type === "created" || event.type === "archived" && status !== "active" || event.type === "restored" && status !== "archived") return null;
        if (event.type === "archived") status = "archived";
        if (event.type === "restored") status = "active";
        history.push({ id: event.id, type: event.type, actor: "شما", at: event.at, version: event.version });
        eventIds.add(event.id);
      }
      const archivedAt = status === "archived" ? history.at(-1)?.type === "archived" ? history.at(-1)!.at : "" : null;
      const count = (projectCounts.get(item.projectId) ?? 0) + 1;
      if (status !== item.status || item.archivedAt !== archivedAt || history[0]?.at !== item.createdAt || history.at(-1)?.at !== item.updatedAt || count > 100) return null;
      ids.add(item.id); projectCounts.set(item.projectId, count);
      result.push({ id: item.id, projectId: item.projectId, displayName: item.displayName, category: item.category, tehranCoverage: item.tehranCoverage, responseCapability: item.responseCapability, status, version: item.version, createdAt: item.createdAt, updatedAt: item.updatedAt, archivedAt: item.archivedAt, history, sourceIndex, sourceRecordHash: procurementDispatchHash(value) });
    }
    return recordsFitPerProjectLimit(result) ? result : null;
  } catch { return null; }
}

function buildMigratedContact(contact: LegacySupplierContact, authority: ProcurementDispatchAuthority): SupplierContactRecord {
  let status: SupplierContactStatus = "active";
  const revisions: SupplierContactRevision[] = [];
  const events: SupplierContactEvent[] = [];
  for (const legacyEvent of contact.history) {
    if (legacyEvent.type === "archived") status = "archived";
    if (legacyEvent.type === "restored") status = "active";
    const snapshot: SupplierContactSnapshot = { displayName: contact.displayName, category: contact.category, tehranCoverage: contact.tehranCoverage, responseCapability: contact.responseCapability, status, archivedAt: status === "archived" ? legacyEvent.at : null };
    const revision = finalizeContactRevision({ id: `supplier-contact-revision:${contact.id}:v${legacyEvent.version}`, version: legacyEvent.version, createdAt: legacyEvent.at, snapshot });
    revisions.push(revision);
    events.push(finalizeContactEvent({ id: `supplier-contact-event:${contact.id}:v${legacyEvent.version}`, type: legacyEvent.type, actor: "سامانهٔ مهاجرت", actorPrincipalId: "local-builder-account", at: legacyEvent.at, version: legacyEvent.version, revisionId: revision.id, authorizationContextHash: authorizationHash(authority, contact.projectId), idempotencyKey: null, commandPayloadHash: null }));
  }
  const latest = revisions.at(-1)!;
  const legacyEvidence = finalizeContactLegacyEvidence({ schemaVersion: 1, sourceGeneration: "v1-array", sourceIndex: contact.sourceIndex, sourceRecordHash: contact.sourceRecordHash, sourceVersion: contact.version, sourceCreatedAt: contact.createdAt, sourceUpdatedAt: contact.updatedAt, history: contact.history });
  return finalizeContactRecord({ schemaVersion: 2, objectType: "supplier-contact", id: contact.id, projectId: contact.projectId, ownerPrincipalType: "account", ownerPrincipalId: "local-builder-account", accountSide: "builder", scopeType: "project_private", scopeId: contact.projectId, custodianService: "Supplier Contact Service", sensitivity: "private", ...latest.snapshot, source: "ثبت مستقیم سازنده", networkStatus: "خارج از شبکه چیدا", visibility: "خصوصی پروژه", localStatus: "ثبت محلی", version: contact.version, currentRevisionId: latest.id, createdAt: contact.createdAt, updatedAt: contact.updatedAt, history: events, revisions, legacyEvidence });
}

function legacyTargetDependencies(value: any, projectId: string, dependencies: ProcurementDispatchDependencies): { source: LegacyDispatchDraft["target"]; canonical: DispatchDependencyTarget; request: ProcurementRequestRevisionDependency } | null {
  if (!hasExactKeys(value, ["requestId", "requestVersion", "revisionId", "approvalId"]) || !exactString(value.requestId, 200) || !Number.isSafeInteger(value.requestVersion) || value.requestVersion < 1 || !exactString(value.revisionId, 300) || !exactString(value.approvalId, 200)) return null;
  const requestMatches = dependencies.requestRevisions.filter((request) => request.projectId === projectId && request.requestId === value.requestId && request.requestVersion === value.requestVersion && request.revisionId === value.revisionId);
  const approvalMatches = dependencies.contentApprovals.filter((approval) => approval.projectId === projectId && approval.approvalId === value.approvalId && approval.requestId === value.requestId && approval.requestVersion === value.requestVersion && approval.requestRevisionId === value.revisionId && approval.status === "approved");
  if (requestMatches.length !== 1 || approvalMatches.length !== 1) return null;
  const request = requestMatches[0];
  const approval = approvalMatches[0];
  return {
    source: { requestId: value.requestId, requestVersion: value.requestVersion, revisionId: value.revisionId, approvalId: value.approvalId },
    canonical: { requestId: request.requestId, requestVersion: request.requestVersion, revisionId: request.revisionId, revisionFingerprint: request.revisionFingerprint, approvalId: approval.approvalId, approvalVersion: approval.approvalVersion, approvalRevisionId: approval.approvalRevisionId, approvalFingerprint: approval.approvalFingerprint },
    request,
  };
}

function legacyPayloadMatches(value: unknown, expected: DispatchPayload) {
  if (valuesEqual(value, expected)) return true;
  if (expected.requestKind !== "product" || expected.delivery === null) return false;
  return valuesEqual(value, { ...expected, delivery: { city: "تهران", ...expected.delivery } });
}

function inferContactRevision(contact: SupplierContactRecord, at: string, destination: InviteDraftDestination, kind: ProcurementPurchaseRequestKind) {
  const candidates = contact.revisions.filter((revision) => Date.parse(revision.createdAt) <= Date.parse(at));
  if (candidates.length === 0) return null;
  const latestInstant = Math.max(...candidates.map((revision) => Date.parse(revision.createdAt)));
  const latest = candidates.filter((revision) => Date.parse(revision.createdAt) === latestInstant);
  if (latest.length !== 1) return null;
  const revision = latest[0];
  return revision.snapshot.status === "active"
    && capabilitySupports(revision.snapshot.responseCapability, kind)
    && valuesEqual(destinationFromSnapshot(revision.snapshot), destination)
    ? revision
    : null;
}

function parseLegacyDrafts(raw: string, dependencies: ProcurementDispatchDependencies, contacts: SupplierContactEnvelope): LegacyDispatchDraft[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 1000) return null;
    const ids = new Set<string>();
    const dedupe = new Set<string>();
    const result: LegacyDispatchDraft[] = [];
    for (const [sourceIndex, value] of parsed.entries()) {
      const keys = ["schemaVersion", "id", "projectId", "target", "dedupeKey", "status", "currentRevisionId", "externalEffect", "sendAuthorized", "visibility", "localStatus", "version", "createdAt", "updatedAt", "history", "revisions"];
      if (!hasExactKeys(value, keys)) return null;
      const item = value as any;
      const target = legacyTargetDependencies(item.target, item.projectId, dependencies);
      if (item.schemaVersion !== 1 || !exactString(item.id, 200) || ids.has(item.id) || !exactString(item.projectId, 200) || !dependencies.authority.projectIds.includes(item.projectId) || !target || item.dedupeKey !== `${item.projectId}:${target.source.requestId}:${target.source.requestVersion}:${target.source.revisionId}:dispatch-draft` || dedupe.has(item.dedupeKey) || item.status !== "draft" || !exactString(item.currentRevisionId, 300) || item.externalEffect !== "none" || item.sendAuthorized !== false || item.visibility !== "خصوصی پروژه" || item.localStatus !== "ثبت محلی" || !Number.isSafeInteger(item.version) || item.version < 1 || !exactDate(item.createdAt) || !exactDate(item.updatedAt) || !Array.isArray(item.history) || !Array.isArray(item.revisions) || item.history.length !== item.version || item.revisions.length !== item.version) return null;
      const history: LegacyDispatchDraft["history"] = [];
      const eventIds = new Set<string>();
      for (const [index, event] of item.history.entries()) {
        if (!hasExactKeys(event, ["id", "type", "actor", "at", "version"]) || !exactString(event.id, 300) || eventIds.has(event.id) || event.type !== (index === 0 ? "created" : "updated") || event.actor !== "شما" || !exactDate(event.at) || event.version !== index + 1 || index > 0 && Date.parse(event.at) < Date.parse(item.history[index - 1].at)) return null;
        history.push({ id: event.id, type: event.type, actor: "شما", at: event.at, version: event.version }); eventIds.add(event.id);
      }
      const revisions: LegacyDispatchRevision[] = [];
      const revisionIds = new Set<string>();
      const inviteIds = new Set<string>();
      for (const [index, revision] of item.revisions.entries()) {
        if (!hasExactKeys(revision, ["id", "version", "createdAt", "recipientIds", "inviteDrafts", "payload", "privacySnapshot", "fingerprint"]) || !exactString(revision.id, 300) || revisionIds.has(revision.id) || revision.version !== index + 1 || !exactDate(revision.createdAt) || revision.createdAt !== history[index]?.at || !Array.isArray(revision.recipientIds) || revision.recipientIds.length < 1 || revision.recipientIds.length > 50 || revision.recipientIds.some((id: unknown) => !exactString(id, 200)) || new Set(revision.recipientIds).size !== revision.recipientIds.length || [...revision.recipientIds].sort((first, second) => compareCanonicalIds(String(first), String(second))).some((id: unknown, recipientIndex: number) => id !== revision.recipientIds[recipientIndex]) || !Array.isArray(revision.inviteDrafts) || revision.inviteDrafts.length !== revision.recipientIds.length || !legacyPayloadMatches(revision.payload, target.request.payload) || !valuesEqual(revision.privacySnapshot, target.request.privacySnapshot) || !exactLegacyHash(revision.fingerprint)) return null;
        const invites: LegacyInviteDraft[] = [];
        for (const [inviteIndex, invite] of revision.inviteDrafts.entries()) {
          const inviteKeys = ["schemaVersion", "id", "projectId", "supplierContactId", "destination", "target", "source", "continuation", "externalEffect", "sendAuthorized", "version", "createdAt", "updatedAt"];
          if (!hasExactKeys(invite, inviteKeys) || invite.schemaVersion !== 1 || !exactString(invite.id, 300) || inviteIds.has(invite.id) || invite.projectId !== item.projectId || invite.supplierContactId !== revision.recipientIds[inviteIndex] || !destinationIsValid(invite.destination) || !valuesEqual(invite.target, target.source) || invite.source !== "ثبت مستقیم سازنده" || invite.continuation !== "ادامهٔ احتمالی در فاز تأمین‌کننده" || invite.externalEffect !== "none" || invite.sendAuthorized !== false || invite.version !== 1 || invite.createdAt !== revision.createdAt || invite.updatedAt !== revision.createdAt) return null;
          const contact = contacts.records.find((record) => record.id === invite.supplierContactId && record.projectId === item.projectId);
          if (!contact || !inferContactRevision(contact, revision.createdAt, invite.destination, target.request.requestKind)) return null;
          inviteIds.add(invite.id);
          invites.push({ id: invite.id, supplierContactId: invite.supplierContactId, destination: invite.destination, createdAt: invite.createdAt, sourceValue: invite });
        }
        if (revision.fingerprint !== legacyHash({ target: target.source, recipientIds: revision.recipientIds, inviteDrafts: revision.inviteDrafts, payload: revision.payload, privacySnapshot: revision.privacySnapshot })) return null;
        if (index > 0 && valuesEqual(revision.recipientIds, item.revisions[index - 1].recipientIds)) return null;
        revisions.push({ id: revision.id, version: revision.version, createdAt: revision.createdAt, recipientIds: revision.recipientIds, invites, payload: target.request.payload, privacySnapshot: target.request.privacySnapshot, sourceFingerprint: revision.fingerprint });
        revisionIds.add(revision.id);
      }
      if (item.currentRevisionId !== revisions.at(-1)?.id || item.createdAt !== history[0]?.at || item.updatedAt !== history.at(-1)?.at || revisions[0]?.createdAt !== item.createdAt || revisions.at(-1)?.createdAt !== item.updatedAt) return null;
      ids.add(item.id); dedupe.add(item.dedupeKey);
      result.push({ id: item.id, projectId: item.projectId, target: target.source, canonicalTarget: target.canonical, dedupeKey: item.dedupeKey, version: item.version, createdAt: item.createdAt, updatedAt: item.updatedAt, history, revisions, sourceIndex, sourceRecordHash: procurementDispatchHash(value) });
    }
    return recordsFitPerProjectLimit(result) ? result : null;
  } catch { return null; }
}

function buildMigratedDraft(legacy: LegacyDispatchDraft, authority: ProcurementDispatchAuthority, contacts: SupplierContactEnvelope): DispatchDraftRecord | null {
  const revisions: DispatchDraftRevision[] = [];
  const history: DispatchDraftEvent[] = [];
  const links: DispatchDraftLegacyRevisionLink[] = [];
  for (const source of legacy.revisions) {
    const invites: InviteDraft[] = [];
    for (const legacyInvite of source.invites) {
      const contact = contacts.records.find((record) => record.id === legacyInvite.supplierContactId && record.projectId === legacy.projectId);
      const contactRevision = contact ? inferContactRevision(contact, source.createdAt, legacyInvite.destination, source.payload.requestKind) : null;
      if (!contact || !contactRevision) return null;
      invites.push(finalizeInvite({ schemaVersion: 2, id: inviteDraftIdForRevision(legacy.id, source.version, contact.id), projectId: legacy.projectId, supplierContactId: contact.id, supplierContactVersion: contactRevision.version, supplierContactRevisionId: contactRevision.id, supplierContactRevisionFingerprint: contactRevision.fingerprint, destination: destinationFromSnapshot(contactRevision.snapshot), target: legacy.canonicalTarget, source: "ثبت مستقیم سازنده", continuation: "ادامهٔ احتمالی در فاز تأمین‌کننده", simulationOnly: true, externalEffect: "none", sendAuthorized: false, externalActionAttempted: false, version: 1, createdAt: source.createdAt, updatedAt: source.createdAt }));
    }
    const revision = finalizeDraftRevision({ id: `dispatch-draft-revision:${legacy.id}:v${source.version}`, version: source.version, createdAt: source.createdAt, recipientIds: source.recipientIds, inviteDrafts: invites, payload: source.payload, privacySnapshot: source.privacySnapshot });
    revisions.push(revision);
    history.push(finalizeDraftEvent({ id: `dispatch-draft-event:${legacy.id}:v${source.version}`, type: source.version === 1 ? "created" : "updated", actor: "سامانهٔ مهاجرت", actorPrincipalId: "local-builder-account", at: source.createdAt, version: source.version, revisionId: revision.id, authorizationContextHash: authorizationHash(authority, legacy.projectId), idempotencyKey: null, commandPayloadHash: null }));
    links.push({ sourceRevisionId: source.id, sourceRevisionFingerprint: source.sourceFingerprint, sourceVersion: source.version, canonicalRevisionId: revision.id, canonicalRevisionFingerprint: revision.fingerprint, contactVersionPins: invites.map((invite) => ({ supplierContactId: invite.supplierContactId, supplierContactVersion: invite.supplierContactVersion, supplierContactRevisionId: invite.supplierContactRevisionId, supplierContactRevisionFingerprint: invite.supplierContactRevisionFingerprint })) });
  }
  const latest = revisions.at(-1)!;
  const legacyEvidence = finalizeDraftLegacyEvidence({ schemaVersion: 1, sourceGeneration: "v1-array", sourceIndex: legacy.sourceIndex, sourceRecordHash: legacy.sourceRecordHash, sourceVersion: legacy.version, sourceCreatedAt: legacy.createdAt, sourceUpdatedAt: legacy.updatedAt, revisionLinks: links });
  return finalizeDraftRecord({ schemaVersion: 2, objectType: "dispatch-draft", id: legacy.id, projectId: legacy.projectId, ownerPrincipalType: "account", ownerPrincipalId: "local-builder-account", accountSide: "builder", scopeType: "project_private", scopeId: legacy.projectId, custodianService: "Dispatch Draft Service", sensitivity: "private", target: legacy.canonicalTarget, dedupeKey: dispatchDraftDedupeKey(legacy.projectId, legacy.canonicalTarget), status: "draft", currentRevisionId: latest.id, simulationOnly: true, externalEffect: "none", sendAuthorized: false, externalActionAttempted: false, visibility: "خصوصی پروژه", localStatus: "ثبت محلی", version: legacy.version, createdAt: legacy.createdAt, updatedAt: legacy.updatedAt, history, revisions, legacyEvidence });
}

function parseLegacyPlans(raw: string, drafts: DispatchDraftEnvelope, contacts: SupplierContactEnvelope): LegacyDispatchPlan[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 1000) return null;
    const ids = new Set<string>();
    const dedupeKeys = new Set<string>();
    const idempotencyKeys = new Set<string>();
    const result: LegacyDispatchPlan[] = [];
    for (const [sourceIndex, value] of parsed.entries()) {
      const item = value as any;
      const keys = ["schemaVersion", "id", "projectId", "purpose", "target", "snapshot", "planFingerprint", "dedupeKey", "idempotencyKey", "status", "simulationOnly", "externalEffect", "sendAuthorized", "externalActionAttempted", "actionRecord", "visibility", "localStatus", "requestedBy", "decidedBy", "requestedAt", "decidedAt", "createdAt", "updatedAt", "version", "history"];
      const targetKeys = ["type", "dispatchDraftId", "dispatchDraftVersion", "dispatchRevisionId", "dispatchRevisionFingerprint", "requestId", "requestVersion", "requestRevisionId", "contentApprovalId"];
      const snapshotKeys = ["recipients", "recipientCount", "payload", "privacySnapshot", "reviewAcknowledgement"];
      if (!hasExactKeys(value, keys) || !hasExactKeys(item.target, targetKeys) || !hasExactKeys(item.snapshot, snapshotKeys) || !hasExactKeys(item.snapshot?.reviewAcknowledgement, ["destinationsReviewed", "payloadReviewed", "privacyAndLocationReviewed"])) return null;
      const draft = drafts.records.find((record) => record.id === item.target.dispatchDraftId && record.projectId === item.projectId);
      const link = draft?.legacyEvidence?.revisionLinks.find((entry) => entry.sourceVersion === item.target.dispatchDraftVersion && entry.sourceRevisionId === item.target.dispatchRevisionId && entry.sourceRevisionFingerprint === item.target.dispatchRevisionFingerprint);
      const draftRevision = link ? draft?.revisions.find((revision) => revision.id === link.canonicalRevisionId && revision.fingerprint === link.canonicalRevisionFingerprint) : null;
      if (item.schemaVersion !== 1 || !exactString(item.id, 200) || ids.has(item.id) || !exactString(item.projectId, 200) || !draft || !link || !draftRevision || item.purpose !== "approve-local-dispatch-plan-simulation" || item.target.type !== "dispatch-draft-revision" || item.target.requestId !== draft.target.requestId || item.target.requestVersion !== draft.target.requestVersion || item.target.requestRevisionId !== draft.target.revisionId || item.target.contentApprovalId !== draft.target.approvalId || !Number.isSafeInteger(item.target.dispatchDraftVersion) || item.target.dispatchDraftVersion < 1 || item.snapshot.recipientCount !== draftRevision.inviteDrafts.length || !Array.isArray(item.snapshot.recipients) || item.snapshot.recipients.length !== draftRevision.inviteDrafts.length || !valuesEqual(item.snapshot.payload, draftRevision.payload) || !valuesEqual(item.snapshot.privacySnapshot, draftRevision.privacySnapshot) || item.snapshot.reviewAcknowledgement.destinationsReviewed !== true || item.snapshot.reviewAcknowledgement.payloadReviewed !== true || item.snapshot.reviewAcknowledgement.privacyAndLocationReviewed !== true || !exactLegacyHash(item.planFingerprint) || !exactString(item.dedupeKey, 1000) || dedupeKeys.has(item.dedupeKey) || item.dedupeKey !== `${item.projectId}:${item.target.dispatchDraftId}:${item.target.dispatchRevisionId}:${item.planFingerprint}:local-plan-approval` || item.idempotencyKey !== `${item.dedupeKey}:simulation-v1` || idempotencyKeys.has(item.idempotencyKey) || !["pending", "approved", "withdrawn"].includes(item.status) || item.simulationOnly !== true || item.externalEffect !== "none" || item.sendAuthorized !== false || item.externalActionAttempted !== false || item.visibility !== "خصوصی پروژه" || item.localStatus !== "ثبت محلی" || item.requestedBy !== "شما" || !exactDate(item.requestedAt) || item.createdAt !== item.requestedAt || !exactDate(item.createdAt) || !exactDate(item.updatedAt) || !Number.isSafeInteger(item.version) || item.version < 1 || !Array.isArray(item.history) || item.history.length !== item.version) return null;
      const recipients: DispatchPlanApprovalRecipientSnapshot[] = [];
      for (const [index, recipient] of item.snapshot.recipients.entries()) {
        if (!hasExactKeys(recipient, ["supplierContactId", "supplierContactVersion", "destination"]) || !exactString(recipient.supplierContactId, 200) || !Number.isSafeInteger(recipient.supplierContactVersion) || recipient.supplierContactVersion < 1 || !destinationIsValid(recipient.destination)) return null;
        const invite = draftRevision.inviteDrafts[index];
        const contact = contacts.records.find((record) => record.id === recipient.supplierContactId && record.projectId === item.projectId);
        const revision = contact?.revisions.find((candidate) => candidate.version === recipient.supplierContactVersion);
        if (!invite || invite.supplierContactId !== recipient.supplierContactId || invite.supplierContactVersion !== recipient.supplierContactVersion || !revision || invite.supplierContactRevisionId !== revision.id || invite.supplierContactRevisionFingerprint !== revision.fingerprint || !valuesEqual(invite.destination, recipient.destination) || !valuesEqual(destinationFromSnapshot(revision.snapshot), recipient.destination)) return null;
        recipients.push({ supplierContactId: recipient.supplierContactId, supplierContactVersion: recipient.supplierContactVersion, supplierContactRevisionId: revision.id, supplierContactRevisionFingerprint: revision.fingerprint, destination: recipient.destination });
      }
      if (item.planFingerprint !== legacyHash({ target: item.target, snapshot: item.snapshot })) return null;
      const history: LegacyDispatchPlan["history"] = [];
      const eventIds = new Set<string>();
      let status: DispatchPlanApprovalStatus = "pending";
      for (const [index, event] of item.history.entries()) {
        if (!hasExactKeys(event, ["id", "type", "actor", "at", "version"]) || !exactString(event.id, 300) || eventIds.has(event.id) || !["created", "approved", "withdrawn", "reopened"].includes(event.type) || event.actor !== "شما" || !exactDate(event.at) || event.version !== index + 1 || index > 0 && Date.parse(event.at) < Date.parse(item.history[index - 1].at)) return null;
        eventIds.add(event.id);
        if (index === 0) {
          if (event.type !== "created") return null;
        } else if (status === "pending" && event.type === "approved") status = "approved";
        else if (status === "pending" && event.type === "withdrawn") status = "withdrawn";
        else if (status === "withdrawn" && event.type === "reopened") status = "pending";
        else return null;
        history.push({ id: event.id, type: event.type, actor: "شما", at: event.at, version: event.version });
      }
      const approved = history.find((event) => event.type === "approved") ?? null;
      const action = approved && actionRecordIsValid(item.actionRecord) && item.actionRecord.recordedAt === approved.at && item.decidedAt === approved.at && item.decidedBy === "شما" ? item.actionRecord as DispatchPlanApprovalActionRecord : null;
      if (status !== item.status || item.createdAt !== history[0]?.at || item.updatedAt !== history.at(-1)?.at || (status === "approved" ? !action : item.actionRecord !== null || item.decidedAt !== null || item.decidedBy !== null)) return null;
      ids.add(item.id); dedupeKeys.add(item.dedupeKey); idempotencyKeys.add(item.idempotencyKey);
      result.push({ id: item.id, projectId: item.projectId, sourceTarget: { dispatchDraftId: item.target.dispatchDraftId, dispatchDraftVersion: item.target.dispatchDraftVersion, dispatchRevisionId: item.target.dispatchRevisionId, dispatchRevisionFingerprint: item.target.dispatchRevisionFingerprint }, draft, draftRevision, sourceSnapshot: item.snapshot, sourcePlanFingerprint: item.planFingerprint, sourceDedupeKey: item.dedupeKey, sourceIdempotencyKey: item.idempotencyKey, status, actionRecord: action, requestedAt: item.requestedAt, decidedAt: item.decidedAt, createdAt: item.createdAt, updatedAt: item.updatedAt, version: item.version, history, sourceIndex, sourceRecordHash: procurementDispatchHash(value) });
    }
    return recordsFitPerProjectLimit(result) ? result : null;
  } catch { return null; }
}

function planTargetFromDraft(draft: DispatchDraftRecord, revision: DispatchDraftRevision): DispatchPlanApprovalTarget {
  return { type: "dispatch-draft-revision", dispatchDraftId: draft.id, dispatchDraftVersion: revision.version, dispatchRevisionId: revision.id, dispatchRevisionFingerprint: revision.fingerprint, requestId: draft.target.requestId, requestVersion: draft.target.requestVersion, requestRevisionId: draft.target.revisionId, requestRevisionFingerprint: draft.target.revisionFingerprint, contentApprovalId: draft.target.approvalId, contentApprovalVersion: draft.target.approvalVersion, contentApprovalRevisionId: draft.target.approvalRevisionId, contentApprovalFingerprint: draft.target.approvalFingerprint };
}

function planSnapshotFromDraft(revision: DispatchDraftRevision): DispatchPlanApprovalReviewSnapshot {
  return { recipients: revision.inviteDrafts.map((invite) => ({ supplierContactId: invite.supplierContactId, supplierContactVersion: invite.supplierContactVersion, supplierContactRevisionId: invite.supplierContactRevisionId, supplierContactRevisionFingerprint: invite.supplierContactRevisionFingerprint, destination: invite.destination })), recipientCount: revision.inviteDrafts.length, payload: revision.payload, privacySnapshot: revision.privacySnapshot, reviewAcknowledgement: { destinationsReviewed: true, payloadReviewed: true, privacyAndLocationReviewed: true } };
}

function buildMigratedPlan(legacy: LegacyDispatchPlan, authority: ProcurementDispatchAuthority): DispatchPlanApprovalRecord {
  const target = planTargetFromDraft(legacy.draft, legacy.draftRevision);
  const snapshot = planSnapshotFromDraft(legacy.draftRevision);
  const planFingerprint = dispatchPlanFingerprint(target, snapshot);
  const revisions: DispatchPlanApprovalRevision[] = [];
  const history: DispatchPlanApprovalEvent[] = [];
  let status: DispatchPlanApprovalStatus = "pending";
  for (const source of legacy.history) {
    if (source.type === "approved") status = "approved";
    if (source.type === "withdrawn") status = "withdrawn";
    if (source.type === "reopened") status = "pending";
    const actionRecord = status === "approved" ? { kind: "record-local-dispatch-plan-approval", result: "local-dispatch-plan-approved", label: "تأیید محلی برنامهٔ ارسال", error: null, recordedAt: source.at } as const : null;
    const revisionSnapshot: DispatchPlanApprovalRevisionSnapshot = { status, actionRecord, decidedBy: status === "approved" ? "شما" : null, decidedAt: status === "approved" ? source.at : null };
    const revision = finalizePlanRevision({ id: `dispatch-plan-approval-revision:${legacy.id}:v${source.version}`, version: source.version, createdAt: source.at, snapshot: revisionSnapshot });
    revisions.push(revision);
    history.push(finalizePlanEvent({ id: `dispatch-plan-approval-event:${legacy.id}:v${source.version}`, type: source.type, actor: "سامانهٔ مهاجرت", actorPrincipalId: "local-builder-account", at: source.at, version: source.version, revisionId: revision.id, authorizationContextHash: authorizationHash(authority, legacy.projectId), idempotencyKey: null, commandPayloadHash: null }));
  }
  const latest = revisions.at(-1)!;
  const legacyEvidence = finalizePlanLegacyEvidence({ schemaVersion: 1, sourceGeneration: "v1-array", sourceIndex: legacy.sourceIndex, sourceRecordHash: legacy.sourceRecordHash, sourceVersion: legacy.version, sourceCreatedAt: legacy.createdAt, sourceUpdatedAt: legacy.updatedAt, sourceDispatchRevisionId: legacy.sourceTarget.dispatchRevisionId, sourceDispatchRevisionFingerprint: legacy.sourceTarget.dispatchRevisionFingerprint });
  return finalizePlanRecord({ schemaVersion: 2, objectType: "dispatch-plan-approval", id: legacy.id, projectId: legacy.projectId, ownerPrincipalType: "account", ownerPrincipalId: "local-builder-account", accountSide: "builder", scopeType: "project_private", scopeId: legacy.projectId, custodianService: "Dispatch Plan Approval Service", sensitivity: "private", purpose: "approve-local-dispatch-plan-simulation", target, snapshot, planFingerprint, dedupeKey: dispatchPlanDedupeKey(legacy.projectId, target, planFingerprint), idempotencyKey: legacy.sourceIdempotencyKey, ...latest.snapshot, simulationOnly: true, externalEffect: "none", sendAuthorized: false, externalActionAttempted: false, visibility: "خصوصی پروژه", localStatus: "ثبت محلی", requestedBy: "شما", requestedAt: legacy.requestedAt, createdAt: legacy.createdAt, updatedAt: legacy.updatedAt, version: legacy.version, currentRevisionId: latest.id, history, revisions, legacyEvidence });
}

function sourceKeyForStore(store: ProcurementStoreName) {
  return store === "supplier-contact" ? legacyProjectSupplierContactsStorageKey : store === "dispatch-draft" ? legacyProjectDispatchDraftsStorageKey : legacyProjectDispatchPlanApprovalsStorageKey;
}

function storageKeyForStore(store: ProcurementStoreName) {
  return store === "supplier-contact" ? projectSupplierContactsStorageKey : store === "dispatch-draft" ? projectDispatchDraftsStorageKey : projectDispatchPlanApprovalsStorageKey;
}

function markerKeyForStore(store: ProcurementStoreName) {
  return store === "supplier-contact" ? projectSupplierContactsCutoverMarkerKey : store === "dispatch-draft" ? projectDispatchDraftsCutoverMarkerKey : projectDispatchPlanApprovalsCutoverMarkerKey;
}

function parseMarkerRaw(raw: string | null, store: ProcurementStoreName): ProcurementMarker | null {
  if (raw === null) return null;
  try {
    const value = JSON.parse(raw);
    const common = ["schemaVersion", "store", "state", "migrationId", "sourceGeneration", "sourceKey", "sourceRawHash", "dependencySnapshotHash", "upstreamCanonicalHashes", "migrationAt", "identityBindingHash", "candidateRaw", "candidateRawHash", "fingerprint"];
    const keys = value?.state === "pending" ? common : value?.state === "verified" ? [...common, "initialStoreVersion", "initialCanonicalHash", "migrationReportHash", "verifiedAt"] : value?.state === "committed" ? [...common, "initialStoreVersion", "initialCanonicalHash", "migrationReportHash", "committedAt"] : [];
    if (!hasExactKeys(value, keys) || !hasExactKeys(value?.upstreamCanonicalHashes, ["contacts", "drafts"])) return null;
    const marker = value as ProcurementMarker;
    if (marker.schemaVersion !== 1 || marker.store !== store || !["pending", "verified", "committed"].includes(marker.state) || !exactString(marker.migrationId, 300) || !["v1-array", "none"].includes(marker.sourceGeneration) || !exactHash(marker.dependencySnapshotHash) || !exactDate(marker.migrationAt) || !exactHash(marker.identityBindingHash) || typeof marker.candidateRaw !== "string" || marker.candidateRaw.length === 0 || rawHash(marker.candidateRaw) !== marker.candidateRawHash || !fingerprintMatches(marker)) return null;
    if (marker.sourceGeneration === "v1-array" ? marker.sourceKey !== sourceKeyForStore(store) || !exactHash(marker.sourceRawHash) : marker.sourceKey !== null || marker.sourceRawHash !== null) return null;
    const upstreamValid = store === "supplier-contact"
      ? marker.upstreamCanonicalHashes.contacts === null && marker.upstreamCanonicalHashes.drafts === null
      : store === "dispatch-draft"
        ? exactHash(marker.upstreamCanonicalHashes.contacts) && marker.upstreamCanonicalHashes.drafts === null
        : exactHash(marker.upstreamCanonicalHashes.contacts) && exactHash(marker.upstreamCanonicalHashes.drafts);
    if (!upstreamValid) return null;
    if (marker.state !== "pending" && (marker.initialStoreVersion !== 1 || marker.initialCanonicalHash !== marker.candidateRawHash || !exactHash(marker.migrationReportHash) || (marker.state === "verified" ? marker.verifiedAt : marker.committedAt) !== marker.migrationAt)) return null;
    return marker;
  } catch { return null; }
}

type AnyProcurementEnvelope = SupplierContactEnvelope | DispatchDraftEnvelope | DispatchPlanApprovalEnvelope;

function reportForEnvelope(envelope: AnyProcurementEnvelope) {
  return envelope.migrationReports[0];
}

function initialEnvelopeHash(store: ProcurementStoreName, envelope: AnyProcurementEnvelope) {
  const initial = store === "supplier-contact" ? initialContactEnvelope(envelope as SupplierContactEnvelope) : store === "dispatch-draft" ? initialDraftEnvelope(envelope as DispatchDraftEnvelope) : initialPlanEnvelope(envelope as DispatchPlanApprovalEnvelope);
  return rawHash(JSON.stringify(initial))!;
}

function markerBindingIsValid(store: ProcurementStoreName, raw: string, envelope: AnyProcurementEnvelope, marker: ProcurementVerifiedMarker | ProcurementCommittedMarker, authority: ProcurementDispatchAuthority) {
  const report = reportForEnvelope(envelope);
  return marker.identityBindingHash === authority.identityBindingHash
    && report.store === store
    && marker.sourceGeneration === report.sourceGeneration
    && marker.sourceKey === report.sourceKey
    && marker.sourceRawHash === report.sourceRawHash
    && marker.dependencySnapshotHash === report.dependencySnapshotHash
    && valuesEqual(marker.upstreamCanonicalHashes, report.upstreamCanonicalHashes)
    && marker.migrationAt === report.migratedAt
    && report.id === `${store}-migration-report:${marker.migrationId}`
    && marker.migrationReportHash === report.fingerprint
    && marker.initialCanonicalHash === initialEnvelopeHash(store, envelope)
    && (envelope.storeVersion !== 1 || rawHash(raw) === marker.initialCanonicalHash);
}

function parseEnvelopeForStore(
  store: ProcurementStoreName,
  raw: string | null,
  authority: ProcurementDispatchAuthority,
  dependencies: ProcurementDispatchDependencies | null,
  contacts: SupplierContactEnvelope | null,
  drafts: DispatchDraftEnvelope | null,
): AnyProcurementEnvelope | null {
  if (store === "supplier-contact") return parseSupplierContactEnvelopeRaw(raw, authority);
  if (!dependencies || !contacts) return null;
  if (store === "dispatch-draft") return parseDispatchDraftEnvelopeRaw(raw, dependencies, contacts);
  return drafts ? parseDispatchPlanApprovalEnvelopeRaw(raw, dependencies, contacts, drafts) : null;
}

function stateForStore<Envelope extends AnyProcurementEnvelope>(
  store: ProcurementStoreName,
  authority: ProcurementDispatchAuthority | null,
  dependencies: ProcurementDispatchDependencies | null,
  contacts: SupplierContactEnvelope | null,
  drafts: DispatchDraftEnvelope | null,
): ProcurementStoreState<Envelope> {
  try {
    if (!authorityIsValid(authority)) return { status: "read-error", envelope: null, reason: "foundation-invalid" };
    if (store !== "supplier-contact" && !dependenciesAreValid(dependencies)) return { status: "read-error", envelope: null, reason: "dependency-invalid" };
    const markerRaw = window.localStorage.getItem(markerKeyForStore(store));
    const canonicalRaw = window.localStorage.getItem(storageKeyForStore(store));
    if (markerRaw === null) return canonicalRaw === null ? { status: "loading", envelope: null, reason: "migration-required" } : { status: "read-error", envelope: null, reason: "marker-missing" };
    const marker = parseMarkerRaw(markerRaw, store);
    if (!marker || marker.identityBindingHash !== authority.identityBindingHash) return { status: "read-error", envelope: null, reason: "marker-invalid" };
    if (marker.state !== "committed") return { status: "loading", envelope: null, reason: "migration-incomplete" };
    const envelope = parseEnvelopeForStore(store, canonicalRaw, authority, dependencies, contacts, drafts) as Envelope | null;
    return canonicalRaw && envelope && markerBindingIsValid(store, canonicalRaw, envelope, marker, authority) ? { status: "ready", envelope, reason: "" } : { status: "read-error", envelope: null, reason: "canonical-invalid" };
  } catch { return { status: "read-error", envelope: null, reason: "read-failure" }; }
}

function requireQueueReceiptPairsForDraftState(
  state: DispatchDraftState,
  dependencies: ProcurementDispatchDependencies,
  contacts: SupplierContactEnvelope,
): DispatchDraftState {
  if (state.status !== "ready" || !state.envelope) return state;
  try {
    const hasDraftQueueReceipt = state.envelope.idempotencyReceipts.some((receipt) => receipt.aggregateQueueIdempotencyKey !== null);
    if (!hasDraftQueueReceipt) return state;
    const planMarkerRaw = window.localStorage.getItem(projectDispatchPlanApprovalsCutoverMarkerKey);
    const planMarker = parseMarkerRaw(planMarkerRaw, "dispatch-plan-approval");
    if (planMarker?.state !== "committed") return { status: "read-error", envelope: null, reason: "queue-pair-plan-not-committed" };
    const plans = stateForStore<DispatchPlanApprovalEnvelope>("dispatch-plan-approval", dependencies.authority, dependencies, contacts, state.envelope);
    return plans.status === "ready" && plans.envelope
      ? state
      : { status: "read-error", envelope: null, reason: `queue-pair-${plans.reason}` };
  } catch {
    return { status: "read-error", envelope: null, reason: "queue-pair-read-failure" };
  }
}

function queueBlockState<Envelope extends AnyProcurementEnvelope>(): ProcurementStoreState<Envelope> | null {
  try {
    return window.localStorage.getItem(procurementDispatchQueueIntentKey) === null
      ? null
      : { status: "read-error", envelope: null, reason: "queue-blocked" };
  } catch {
    return { status: "read-error", envelope: null, reason: "queue-read-failure" };
  }
}

export function readSupplierContactState(authority: ProcurementDispatchAuthority | null): SupplierContactState {
  return stateForStore<SupplierContactEnvelope>("supplier-contact", authority, null, null, null);
}

export function readDispatchDraftState(dependencies: ProcurementDispatchDependencies | null, contactsState?: SupplierContactState): DispatchDraftState {
  const queueBlock = queueBlockState<DispatchDraftEnvelope>();
  if (queueBlock) return queueBlock;
  const contacts = contactsState ?? readSupplierContactState(dependencies?.authority ?? null);
  if (contacts.status !== "ready" || !contacts.envelope) return { status: contacts.status === "loading" ? "loading" : "read-error", envelope: null, reason: `contact-${contacts.reason}` };
  if (!dependenciesAreValid(dependencies)) return { status: "read-error", envelope: null, reason: "dependency-invalid" };
  const drafts = stateForStore<DispatchDraftEnvelope>("dispatch-draft", dependencies.authority, dependencies, contacts.envelope, null);
  return requireQueueReceiptPairsForDraftState(drafts, dependencies, contacts.envelope);
}

export function readDispatchPlanApprovalState(dependencies: ProcurementDispatchDependencies | null, contactsState?: SupplierContactState, draftsState?: DispatchDraftState): DispatchPlanApprovalState {
  const queueBlock = queueBlockState<DispatchPlanApprovalEnvelope>();
  if (queueBlock) return queueBlock;
  const contacts = contactsState ?? readSupplierContactState(dependencies?.authority ?? null);
  if (contacts.status !== "ready" || !contacts.envelope) return { status: contacts.status === "loading" ? "loading" : "read-error", envelope: null, reason: `contact-${contacts.reason}` };
  const drafts = draftsState ?? readDispatchDraftState(dependencies, contacts);
  if (drafts.status !== "ready" || !drafts.envelope) return { status: drafts.status === "loading" ? "loading" : "read-error", envelope: null, reason: `draft-${drafts.reason}` };
  return stateForStore<DispatchPlanApprovalEnvelope>("dispatch-plan-approval", dependencies?.authority ?? null, dependencies, contacts.envelope, drafts.envelope);
}

export function readProcurementDispatchState(dependencies: ProcurementDispatchDependencies | null, authority: ProcurementDispatchAuthority | null = dependencies?.authority ?? null): ProcurementDispatchState {
  const contacts = readSupplierContactState(authority);
  try {
    if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null) {
      return {
        contacts,
        drafts: { status: "read-error", envelope: null, reason: "queue-blocked" },
        plans: { status: "read-error", envelope: null, reason: "queue-blocked" },
      };
    }
  } catch {
    return {
      contacts,
      drafts: { status: "read-error", envelope: null, reason: "queue-read-failure" },
      plans: { status: "read-error", envelope: null, reason: "queue-read-failure" },
    };
  }
  const drafts = contacts.status === "ready" && dependencies ? readDispatchDraftState(dependencies, contacts) : { status: contacts.status === "loading" ? "loading" : "read-error", envelope: null, reason: contacts.status === "ready" ? "dependency-invalid" : `contact-${contacts.reason}` } as DispatchDraftState;
  const plans = drafts.status === "ready" && dependencies ? readDispatchPlanApprovalState(dependencies, contacts, drafts) : { status: drafts.status === "loading" ? "loading" : "read-error", envelope: null, reason: `draft-${drafts.reason}` } as DispatchPlanApprovalState;
  return { contacts, drafts, plans };
}

function buildContactMigrationEnvelope(sourceRaw: string | null, migrationId: string, migrationAt: string, authority: ProcurementDispatchAuthority): SupplierContactEnvelope | null {
  const legacy = sourceRaw === null ? [] : parseLegacyContacts(sourceRaw, authority);
  if (!legacy) return null;
  const records = legacy.map((contact) => buildMigratedContact(contact, authority));
  const report = finalizeMigrationReport({ schemaVersion: 1, id: `supplier-contact-migration-report:${migrationId}`, store: "supplier-contact", sourceGeneration: sourceRaw === null ? "none" : "v1-array", sourceKey: sourceRaw === null ? null : legacyProjectSupplierContactsStorageKey, sourceRawHash: rawHash(sourceRaw), dependencySnapshotHash: authority.snapshotHash, upstreamCanonicalHashes: { contacts: null, drafts: null }, migratedAt: migrationAt, recordCount: records.length, migratedRecordFingerprints: records.map((record) => record.fingerprint) });
  return finalizeContactEnvelope({ schemaVersion: 2, fingerprintVersion: "supplier-contact-domain-v2", storeVersion: 1, records, idempotencyReceipts: [], migrationReports: [report], updatedAt: migrationAt });
}

function buildDraftMigrationEnvelope(sourceRaw: string | null, migrationId: string, migrationAt: string, dependencies: ProcurementDispatchDependencies, contactsRaw: string, contacts: SupplierContactEnvelope): DispatchDraftEnvelope | null {
  const legacy = sourceRaw === null ? [] : parseLegacyDrafts(sourceRaw, dependencies, contacts);
  if (!legacy) return null;
  const records = legacy.map((draft) => buildMigratedDraft(draft, dependencies.authority, contacts));
  if (records.some((record) => record === null)) return null;
  const exactRecords = records as DispatchDraftRecord[];
  const report = finalizeMigrationReport({ schemaVersion: 1, id: `dispatch-draft-migration-report:${migrationId}`, store: "dispatch-draft", sourceGeneration: sourceRaw === null ? "none" : "v1-array", sourceKey: sourceRaw === null ? null : legacyProjectDispatchDraftsStorageKey, sourceRawHash: rawHash(sourceRaw), dependencySnapshotHash: dependencies.snapshotHash, upstreamCanonicalHashes: { contacts: rawHash(contactsRaw), drafts: null }, migratedAt: migrationAt, recordCount: exactRecords.length, migratedRecordFingerprints: exactRecords.map((record) => record.fingerprint) });
  return finalizeDraftEnvelope({ schemaVersion: 2, fingerprintVersion: "dispatch-draft-domain-v2", storeVersion: 1, records: exactRecords, idempotencyReceipts: [], migrationReports: [report], updatedAt: migrationAt });
}

function buildPlanMigrationEnvelope(sourceRaw: string | null, migrationId: string, migrationAt: string, dependencies: ProcurementDispatchDependencies, contactsRaw: string, contacts: SupplierContactEnvelope, draftsRaw: string, drafts: DispatchDraftEnvelope): DispatchPlanApprovalEnvelope | null {
  const legacy = sourceRaw === null ? [] : parseLegacyPlans(sourceRaw, drafts, contacts);
  if (!legacy) return null;
  const records = legacy.map((plan) => buildMigratedPlan(plan, dependencies.authority));
  const report = finalizeMigrationReport({ schemaVersion: 1, id: `dispatch-plan-approval-migration-report:${migrationId}`, store: "dispatch-plan-approval", sourceGeneration: sourceRaw === null ? "none" : "v1-array", sourceKey: sourceRaw === null ? null : legacyProjectDispatchPlanApprovalsStorageKey, sourceRawHash: rawHash(sourceRaw), dependencySnapshotHash: dependencies.snapshotHash, upstreamCanonicalHashes: { contacts: rawHash(contactsRaw), drafts: rawHash(draftsRaw) }, migratedAt: migrationAt, recordCount: records.length, migratedRecordFingerprints: records.map((record) => record.fingerprint) });
  return finalizePlanEnvelope({ schemaVersion: 2, fingerprintVersion: "dispatch-plan-approval-domain-v2", storeVersion: 1, records, idempotencyReceipts: [], migrationReports: [report], updatedAt: migrationAt });
}

type InitializeStoreConfig = {
  store: ProcurementStoreName;
  authority: ProcurementDispatchAuthority;
  dependencies: ProcurementDispatchDependencies | null;
  contactsRaw: string | null;
  contacts: SupplierContactEnvelope | null;
  draftsRaw: string | null;
  drafts: DispatchDraftEnvelope | null;
};

function dependencyBindingHash(config: InitializeStoreConfig) {
  return config.store === "supplier-contact" ? config.authority.snapshotHash : config.dependencies?.snapshotHash ?? "";
}

function upstreamHashes(config: InitializeStoreConfig) {
  return config.store === "supplier-contact" ? { contacts: null, drafts: null } : config.store === "dispatch-draft" ? { contacts: rawHash(config.contactsRaw), drafts: null } : { contacts: rawHash(config.contactsRaw), drafts: rawHash(config.draftsRaw) };
}

function environmentStillMatches(marker: ProcurementPendingMarker | ProcurementVerifiedMarker, config: InitializeStoreConfig) {
  const sourceRaw = window.localStorage.getItem(sourceKeyForStore(config.store));
  const sourceMatches = marker.sourceGeneration === "v1-array" ? rawHash(sourceRaw) === marker.sourceRawHash : sourceRaw === null;
  return sourceMatches && marker.dependencySnapshotHash === dependencyBindingHash(config) && valuesEqual(marker.upstreamCanonicalHashes, upstreamHashes(config));
}

function restoreOwnedValue(key: string, previousRaw: string | null, candidateRaw: string) {
  try {
    const current = window.localStorage.getItem(key);
    if (current === previousRaw) return true;
    if (current !== candidateRaw) return false;
    if (previousRaw === null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, previousRaw);
    return window.localStorage.getItem(key) === previousRaw;
  } catch { return false; }
}

function buildMigrationCandidate(config: InitializeStoreConfig, sourceRaw: string | null, migrationId: string, migrationAt: string) {
  if (config.store === "supplier-contact") return buildContactMigrationEnvelope(sourceRaw, migrationId, migrationAt, config.authority);
  if (!config.dependencies || !config.contactsRaw || !config.contacts) return null;
  if (config.store === "dispatch-draft") return buildDraftMigrationEnvelope(sourceRaw, migrationId, migrationAt, config.dependencies, config.contactsRaw, config.contacts);
  return config.draftsRaw && config.drafts ? buildPlanMigrationEnvelope(sourceRaw, migrationId, migrationAt, config.dependencies, config.contactsRaw, config.contacts, config.draftsRaw, config.drafts) : null;
}

function advanceMigration(marker: ProcurementPendingMarker | ProcurementVerifiedMarker, expectedMarkerRaw: string, config: InitializeStoreConfig): ProcurementStoreState<AnyProcurementEnvelope> {
  const storageKey = storageKeyForStore(config.store);
  const markerKey = markerKeyForStore(config.store);
  try {
    if (!environmentStillMatches(marker, config) || window.localStorage.getItem(markerKey) !== expectedMarkerRaw) return { status: "read-error", envelope: null, reason: "migration-binding-changed" };
    const existingRaw = window.localStorage.getItem(storageKey);
    if (existingRaw !== null && existingRaw !== marker.candidateRaw) return { status: "read-error", envelope: null, reason: "canonical-preexists" };
    const candidate = parseEnvelopeForStore(config.store, marker.candidateRaw, config.authority, config.dependencies, config.contacts, config.drafts);
    if (!candidate || rawHash(marker.candidateRaw) !== marker.candidateRawHash) return { status: "read-error", envelope: null, reason: "candidate-invalid" };
    if (marker.state === "pending") {
      window.localStorage.setItem(storageKey, marker.candidateRaw);
      if (window.localStorage.getItem(storageKey) !== marker.candidateRaw || window.localStorage.getItem(markerKey) !== expectedMarkerRaw || !environmentStillMatches(marker, config)) {
        if (existingRaw === null) restoreOwnedValue(storageKey, null, marker.candidateRaw);
        return { status: "read-error", envelope: null, reason: "candidate-readback-failure" };
      }
      const verified = finalizeMarker({ ...withoutFingerprint(marker), state: "verified", initialStoreVersion: 1 as const, initialCanonicalHash: marker.candidateRawHash, migrationReportHash: reportForEnvelope(candidate).fingerprint, verifiedAt: marker.migrationAt }) as ProcurementVerifiedMarker;
      const verifiedRaw = JSON.stringify(verified);
      window.localStorage.setItem(markerKey, verifiedRaw);
      if (window.localStorage.getItem(markerKey) !== verifiedRaw || window.localStorage.getItem(storageKey) !== marker.candidateRaw || !environmentStillMatches(verified, config)) return { status: "read-error", envelope: null, reason: "verified-readback-failure" };
      return advanceMigration(verified, verifiedRaw, config);
    }
    if (!markerBindingIsValid(config.store, marker.candidateRaw, candidate, marker, config.authority) || window.localStorage.getItem(storageKey) !== marker.candidateRaw || !environmentStillMatches(marker, config)) return { status: "read-error", envelope: null, reason: "verified-binding-invalid" };
    const { fingerprint: _verifiedFingerprint, verifiedAt, ...verifiedPayload } = marker;
    const committed = finalizeMarker({ ...verifiedPayload, state: "committed", committedAt: verifiedAt } as Omit<ProcurementCommittedMarker, "fingerprint">) as ProcurementCommittedMarker;
    const committedRaw = JSON.stringify(committed);
    window.localStorage.setItem(markerKey, committedRaw);
    const readbackRaw = window.localStorage.getItem(storageKey);
    const readback = parseEnvelopeForStore(config.store, readbackRaw, config.authority, config.dependencies, config.contacts, config.drafts);
    return window.localStorage.getItem(markerKey) === committedRaw && readbackRaw === marker.candidateRaw && readback && markerBindingIsValid(config.store, readbackRaw, readback, committed, config.authority) ? { status: "ready", envelope: readback, reason: "" } : { status: "read-error", envelope: null, reason: "commit-readback-failure" };
  } catch { return { status: "read-error", envelope: null, reason: "migration-write-failure" }; }
}

function initializeStoreUnlocked(config: InitializeStoreConfig): ProcurementStoreState<AnyProcurementEnvelope> {
  try {
    const markerKey = markerKeyForStore(config.store);
    const storageKey = storageKeyForStore(config.store);
    const markerRaw = window.localStorage.getItem(markerKey);
    const canonicalRaw = window.localStorage.getItem(storageKey);
    if (markerRaw !== null) {
      const marker = parseMarkerRaw(markerRaw, config.store);
      if (!marker || marker.identityBindingHash !== config.authority.identityBindingHash) return { status: "read-error", envelope: null, reason: "marker-invalid" };
      if (marker.state === "committed") {
        const envelope = parseEnvelopeForStore(config.store, canonicalRaw, config.authority, config.dependencies, config.contacts, config.drafts);
        return canonicalRaw && envelope && markerBindingIsValid(config.store, canonicalRaw, envelope, marker, config.authority) ? { status: "ready", envelope, reason: "" } : { status: "read-error", envelope: null, reason: "canonical-invalid" };
      }
      if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null) return { status: "read-error", envelope: null, reason: "queue-blocked" };
      return advanceMigration(marker, markerRaw, config);
    }
    if (canonicalRaw !== null) return { status: "read-error", envelope: null, reason: "marker-missing" };
    if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null) return { status: "read-error", envelope: null, reason: "queue-blocked" };
    const sourceRaw = window.localStorage.getItem(sourceKeyForStore(config.store));
    const dependencyDates = config.dependencies ? [...config.dependencies.requestRevisions.map((item) => item.revisionCreatedAt), ...config.dependencies.contentApprovals.map((item) => item.updatedAt)] : [];
    const upstreamDates = [config.contacts?.updatedAt, config.drafts?.updatedAt].filter((value): value is string => Boolean(value));
    const migrationAt = nextTimestamp(...canonicalDatesInRaw(sourceRaw), ...dependencyDates, ...upstreamDates);
    const migrationId = `${config.store}-migration:${window.crypto.randomUUID()}`;
    const candidate = buildMigrationCandidate(config, sourceRaw, migrationId, migrationAt);
    if (!candidate) return { status: "read-error", envelope: null, reason: "migration-source-unrepresentable" };
    const candidateRaw = JSON.stringify(candidate);
    if (!parseEnvelopeForStore(config.store, candidateRaw, config.authority, config.dependencies, config.contacts, config.drafts)) return { status: "read-error", envelope: null, reason: "migration-candidate-invalid" };
    const pending = finalizeMarker({ schemaVersion: 1, store: config.store, state: "pending", migrationId, sourceGeneration: sourceRaw === null ? "none" : "v1-array", sourceKey: sourceRaw === null ? null : sourceKeyForStore(config.store), sourceRawHash: rawHash(sourceRaw), dependencySnapshotHash: dependencyBindingHash(config), upstreamCanonicalHashes: upstreamHashes(config), migrationAt, identityBindingHash: config.authority.identityBindingHash, candidateRaw, candidateRawHash: rawHash(candidateRaw)! }) as ProcurementPendingMarker;
    const pendingRaw = JSON.stringify(pending);
    window.localStorage.setItem(markerKey, pendingRaw);
    if (window.localStorage.getItem(markerKey) !== pendingRaw) return { status: "read-error", envelope: null, reason: "pending-readback-failure" };
    return advanceMigration(pending, pendingRaw, config);
  } catch { return { status: "read-error", envelope: null, reason: "initialization-failure" }; }
}

async function withProcurementWriteLock<Result>(fallback: Result, operation: () => Result | Promise<Result>): Promise<Result> {
  try {
    const manager = window.navigator.locks;
    if (!manager?.request) return fallback;
    return await manager.request(procurementDispatchWriteLockName, { mode: "exclusive" }, operation);
  } catch { return fallback; }
}

export async function initializeSupplierContacts(getAuthority: ProcurementDispatchAuthorityReader): Promise<SupplierContactState> {
  return withProcurementWriteLock<SupplierContactState>({ status: "read-error", envelope: null, reason: "lock-unavailable" }, () => {
    const authority = getAuthority();
    if (!authorityIsValid(authority)) return { status: "read-error", envelope: null, reason: "foundation-invalid" };
    return initializeStoreUnlocked({ store: "supplier-contact", authority, dependencies: null, contactsRaw: null, contacts: null, draftsRaw: null, drafts: null }) as SupplierContactState;
  });
}

export async function initializeDispatchDrafts(getDependencies: ProcurementDispatchDependencyReader): Promise<DispatchDraftState> {
  return withProcurementWriteLock<DispatchDraftState>({ status: "read-error", envelope: null, reason: "lock-unavailable" }, () => {
    const dependencies = getDependencies();
    if (!dependenciesAreValid(dependencies)) return { status: "read-error", envelope: null, reason: "dependency-invalid" };
    const queueBlock = queueBlockState<DispatchDraftEnvelope>();
    if (queueBlock) return queueBlock;
    const contacts = readContactMutation(dependencies.authority);
    if (!contacts) return { status: "read-error", envelope: null, reason: "contact-store-invalid" };
    const drafts = initializeStoreUnlocked({ store: "dispatch-draft", authority: dependencies.authority, dependencies, contactsRaw: contacts.raw, contacts: contacts.envelope, draftsRaw: null, drafts: null }) as DispatchDraftState;
    return requireQueueReceiptPairsForDraftState(drafts, dependencies, contacts.envelope);
  });
}

export async function initializeDispatchPlanApprovals(getDependencies: ProcurementDispatchDependencyReader): Promise<DispatchPlanApprovalState> {
  return withProcurementWriteLock<DispatchPlanApprovalState>({ status: "read-error", envelope: null, reason: "lock-unavailable" }, () => {
    const dependencies = getDependencies();
    if (!dependenciesAreValid(dependencies)) return { status: "read-error", envelope: null, reason: "dependency-invalid" };
    const queueBlock = queueBlockState<DispatchPlanApprovalEnvelope>();
    if (queueBlock) return queueBlock;
    const contacts = readContactMutation(dependencies.authority);
    const drafts = contacts ? readDraftMutation(dependencies, contacts.envelope) : null;
    if (!contacts || !drafts) return { status: "read-error", envelope: null, reason: !contacts ? "contact-store-invalid" : "draft-store-invalid" };
    return initializeStoreUnlocked({ store: "dispatch-plan-approval", authority: dependencies.authority, dependencies, contactsRaw: contacts.raw, contacts: contacts.envelope, draftsRaw: drafts.raw, drafts: drafts.envelope }) as DispatchPlanApprovalState;
  });
}

export async function initializeProcurementDispatch(getDependencies: ProcurementDispatchDependencyReader, getAuthority: ProcurementDispatchAuthorityReader = () => getDependencies()?.authority ?? null): Promise<ProcurementDispatchState> {
  return withProcurementWriteLock<ProcurementDispatchState>({ contacts: { status: "read-error", envelope: null, reason: "lock-unavailable" }, drafts: { status: "read-error", envelope: null, reason: "lock-unavailable" }, plans: { status: "read-error", envelope: null, reason: "lock-unavailable" } }, () => {
    const authority = getAuthority();
    if (!authorityIsValid(authority)) {
      const contacts: SupplierContactState = { status: "read-error", envelope: null, reason: "foundation-invalid" };
      return { contacts, drafts: { status: "read-error", envelope: null, reason: "contact-foundation-invalid" }, plans: { status: "read-error", envelope: null, reason: "draft-contact-foundation-invalid" } };
    }
    if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null) {
      const resumed = resumeQueueUnlocked(getDependencies);
      if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null) {
        const current = readProcurementDispatchState(getDependencies(), authority);
        const reason = resumed.reason ? `queue-blocked:${resumed.reason}` : "queue-blocked";
        return {
          contacts: current.contacts,
          drafts: { status: "read-error", envelope: null, reason },
          plans: { status: "read-error", envelope: null, reason },
        };
      }
    }
    const contactResult = initializeStoreUnlocked({ store: "supplier-contact", authority, dependencies: null, contactsRaw: null, contacts: null, draftsRaw: null, drafts: null }) as SupplierContactState;
    if (contactResult.status !== "ready" || !contactResult.envelope) return { contacts: contactResult, drafts: { status: contactResult.status === "loading" ? "loading" : "read-error", envelope: null, reason: `contact-${contactResult.reason}` }, plans: { status: contactResult.status === "loading" ? "loading" : "read-error", envelope: null, reason: `contact-${contactResult.reason}` } };
    const dependencies = getDependencies();
    if (!dependenciesAreValid(dependencies) || dependencies.authority.identityBindingHash !== authority.identityBindingHash) return { contacts: contactResult, drafts: { status: "read-error", envelope: null, reason: "dependency-invalid" }, plans: { status: "read-error", envelope: null, reason: "draft-dependency-invalid" } };
    const contactsRaw = window.localStorage.getItem(projectSupplierContactsStorageKey)!;
    const draftResult = initializeStoreUnlocked({ store: "dispatch-draft", authority, dependencies, contactsRaw, contacts: contactResult.envelope, draftsRaw: null, drafts: null }) as DispatchDraftState;
    if (draftResult.status !== "ready" || !draftResult.envelope) return { contacts: contactResult, drafts: draftResult, plans: { status: draftResult.status === "loading" ? "loading" : "read-error", envelope: null, reason: `draft-${draftResult.reason}` } };
    const draftsRaw = window.localStorage.getItem(projectDispatchDraftsStorageKey)!;
    const planResult = initializeStoreUnlocked({ store: "dispatch-plan-approval", authority, dependencies, contactsRaw, contacts: contactResult.envelope, draftsRaw, drafts: draftResult.envelope }) as DispatchPlanApprovalState;
    const pairedDraftResult = requireQueueReceiptPairsForDraftState(draftResult, dependencies, contactResult.envelope);
    return { contacts: contactResult, drafts: pairedDraftResult, plans: pairedDraftResult.status === "ready" ? planResult : { status: "read-error", envelope: null, reason: `draft-${pairedDraftResult.reason}` } };
  });
}

function commandWithoutIdempotency<Command extends { idempotencyKey: string }>(command: Command): Omit<Command, "idempotencyKey"> {
  const { idempotencyKey: _idempotencyKey, ...payload } = command;
  return payload;
}

function contactCommandPayload(command: SupplierContactCommand) {
  return commandWithoutIdempotency(command);
}

function draftCommandPayload(command: DispatchDraftUpsertCommand) {
  return commandWithoutIdempotency(command);
}

function draftPreconditionCommandPayload(command: DispatchDraftUpsertCommand) {
  const { idempotencyKey: _idempotencyKey, precondition: _precondition, ...payload } = command;
  return payload;
}

function planCommandPayload(command: DispatchPlanApprovalCommand) {
  return commandWithoutIdempotency(command);
}

function planPreconditionCommandPayload(command: DispatchPlanApprovalCommand) {
  const { idempotencyKey: _idempotencyKey, precondition: _precondition, ...payload } = command;
  return payload;
}

function queueCommandPayload(command: ProcurementDispatchQueueCommand) {
  const { queueIdempotencyKey: _queueIdempotencyKey, ...payload } = command;
  return payload;
}

function queuePreconditionCommandPayload(command: ProcurementDispatchQueueCommand) {
  const { precondition: _draftPrecondition, idempotencyKey: _draftIdempotencyKey, ...draft } = command.draft;
  const { precondition: _planPrecondition, idempotencyKey: _planIdempotencyKey, ...plan } = command.plan;
  return { inputSchemaVersion: command.inputSchemaVersion, action: command.action, draft, plan };
}

function contactCommandIsValid(value: unknown): value is SupplierContactCommand {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const command = value as any;
  if (command.inputSchemaVersion !== 1 || !exactString(command.projectId, 200) || !exactString(command.contactId, 200) || !exactString(command.idempotencyKey, 200) || !Number.isSafeInteger(command.expectedStoreVersion) || command.expectedStoreVersion < 1) return false;
  if (command.action === "create-contact") {
    if (!hasExactKeys(command, ["inputSchemaVersion", "action", "projectId", "contactId", "draft", "expectedStoreVersion", "idempotencyKey"]) || command.contactId !== supplierContactIdForIdempotencyKey(command.idempotencyKey) || !hasExactKeys(command.draft, ["displayName", "category", "tehranCoverage", "responseCapability"])) return false;
    const draft = command.draft as SupplierContactDraft;
    return exactString(draft.displayName, 100) && visibleText(draft.displayName) && exactString(draft.category, 100) && visibleText(draft.category) && exactString(draft.tehranCoverage, 120) && visibleText(draft.tehranCoverage) && ["product", "service", "both"].includes(draft.responseCapability);
  }
  return (command.action === "archive-contact" || command.action === "restore-contact") && hasExactKeys(command, ["inputSchemaVersion", "action", "projectId", "contactId", "expectedStoreVersion", "expectedContactVersion", "idempotencyKey"]) && Number.isSafeInteger(command.expectedContactVersion) && command.expectedContactVersion >= 1;
}

function draftCommandIsValid(value: unknown): value is DispatchDraftUpsertCommand {
  const keys = ["inputSchemaVersion", "action", "projectId", "dispatchDraftId", "requestId", "expectedRequestVersion", "expectedRequestRevisionId", "expectedRequestRevisionFingerprint", "approvalId", "expectedApprovalVersion", "expectedApprovalRevisionId", "expectedApprovalFingerprint", "recipients", "expectedContactStoreVersion", "expectedDraftStoreVersion", "expectedDraftVersion", "precondition", "idempotencyKey"];
  if (!hasExactKeys(value, keys)) return false;
  const command = value as DispatchDraftUpsertCommand;
  if (command.inputSchemaVersion !== 1 || command.action !== "upsert-dispatch-draft" || !exactString(command.projectId, 200) || !exactString(command.dispatchDraftId, 200) || !exactString(command.requestId, 200) || !Number.isSafeInteger(command.expectedRequestVersion) || command.expectedRequestVersion < 1 || !exactString(command.expectedRequestRevisionId, 300) || !exactRequestRevisionFingerprint(command.expectedRequestRevisionFingerprint) || !exactString(command.approvalId, 200) || !Number.isSafeInteger(command.expectedApprovalVersion) || command.expectedApprovalVersion < 1 || !exactString(command.expectedApprovalRevisionId, 300) || !exactHash(command.expectedApprovalFingerprint) || !Array.isArray(command.recipients) || command.recipients.length < 1 || command.recipients.length > 50 || !Number.isSafeInteger(command.expectedContactStoreVersion) || command.expectedContactStoreVersion < 1 || !Number.isSafeInteger(command.expectedDraftStoreVersion) || command.expectedDraftStoreVersion < 1 || command.expectedDraftVersion !== null && (!Number.isSafeInteger(command.expectedDraftVersion) || command.expectedDraftVersion < 1) || !preconditionReferenceIsValid(command.precondition) || !exactString(command.idempotencyKey, 200)) return false;
  const ids = new Set<string>();
  for (const pin of command.recipients) {
    if (!hasExactKeys(pin, ["supplierContactId", "expectedContactVersion", "expectedContactRevisionId", "expectedContactRevisionFingerprint"]) || !exactString(pin.supplierContactId, 200) || ids.has(pin.supplierContactId) || !Number.isSafeInteger(pin.expectedContactVersion) || pin.expectedContactVersion < 1 || !exactString(pin.expectedContactRevisionId, 300) || !exactHash(pin.expectedContactRevisionFingerprint)) return false;
    ids.add(pin.supplierContactId);
  }
  return [...command.recipients].sort((first, second) => compareCanonicalIds(first.supplierContactId, second.supplierContactId)).every((pin, index) => pin === command.recipients[index]);
}

function planCommandIsValid(value: unknown): value is DispatchPlanApprovalCommand {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const command = value as any;
  if (command.inputSchemaVersion !== 1 || !exactString(command.projectId, 200) || !exactString(command.planApprovalId, 200) || !Number.isSafeInteger(command.expectedContactStoreVersion) || command.expectedContactStoreVersion < 1 || !Number.isSafeInteger(command.expectedDraftStoreVersion) || command.expectedDraftStoreVersion < 1 || !Number.isSafeInteger(command.expectedPlanStoreVersion) || command.expectedPlanStoreVersion < 1 || !preconditionReferenceIsValid(command.precondition) || !exactString(command.idempotencyKey, 200)) return false;
  if (command.action === "create-dispatch-plan") {
    return hasExactKeys(command, ["inputSchemaVersion", "action", "projectId", "planApprovalId", "dispatchDraftId", "expectedContactStoreVersion", "expectedDraftStoreVersion", "expectedDraftVersion", "expectedDispatchRevisionId", "expectedDispatchRevisionFingerprint", "expectedPlanStoreVersion", "precondition", "acknowledgement", "idempotencyKey"])
      && command.planApprovalId === dispatchPlanApprovalIdForIdempotencyKey(command.idempotencyKey)
      && exactString(command.dispatchDraftId, 200) && Number.isSafeInteger(command.expectedDraftVersion) && command.expectedDraftVersion >= 1 && exactString(command.expectedDispatchRevisionId, 300) && exactHash(command.expectedDispatchRevisionFingerprint)
      && hasExactKeys(command.acknowledgement, ["destinationsReviewed", "payloadReviewed", "privacyAndLocationReviewed"]) && command.acknowledgement.destinationsReviewed === true && command.acknowledgement.payloadReviewed === true && command.acknowledgement.privacyAndLocationReviewed === true;
  }
  return ["withdraw-dispatch-plan", "reopen-dispatch-plan", "approve-dispatch-plan"].includes(command.action) && hasExactKeys(command, ["inputSchemaVersion", "action", "projectId", "planApprovalId", "expectedContactStoreVersion", "expectedDraftStoreVersion", "expectedPlanStoreVersion", "expectedPlanVersion", "precondition", "idempotencyKey"]) && Number.isSafeInteger(command.expectedPlanVersion) && command.expectedPlanVersion >= 1;
}

function committedMarkerRaw(store: ProcurementStoreName, authority: ProcurementDispatchAuthority) {
  const raw = window.localStorage.getItem(markerKeyForStore(store));
  const marker = parseMarkerRaw(raw, store);
  return raw && marker?.state === "committed" && marker.identityBindingHash === authority.identityBindingHash ? { raw, marker } : null;
}

function readContactMutation(authority: ProcurementDispatchAuthority) {
  const marker = committedMarkerRaw("supplier-contact", authority);
  const raw = window.localStorage.getItem(projectSupplierContactsStorageKey);
  const envelope = parseSupplierContactEnvelopeRaw(raw, authority);
  return marker && raw && envelope && markerBindingIsValid("supplier-contact", raw, envelope, marker.marker, authority) ? { markerRaw: marker.raw, raw, envelope } : null;
}

function readDraftMutation(dependencies: ProcurementDispatchDependencies, contacts: SupplierContactEnvelope) {
  const marker = committedMarkerRaw("dispatch-draft", dependencies.authority);
  const raw = window.localStorage.getItem(projectDispatchDraftsStorageKey);
  const envelope = parseDispatchDraftEnvelopeRaw(raw, dependencies, contacts);
  if (!marker || !raw || !envelope || !markerBindingIsValid("dispatch-draft", raw, envelope, marker.marker, dependencies.authority)) return null;
  const paired = requireQueueReceiptPairsForDraftState({ status: "ready", envelope, reason: "" }, dependencies, contacts);
  return paired.status === "ready" && paired.envelope ? { markerRaw: marker.raw, raw, envelope: paired.envelope } : null;
}

function readPlanMutation(dependencies: ProcurementDispatchDependencies, contacts: SupplierContactEnvelope, drafts: DispatchDraftEnvelope) {
  const marker = committedMarkerRaw("dispatch-plan-approval", dependencies.authority);
  const raw = window.localStorage.getItem(projectDispatchPlanApprovalsStorageKey);
  const envelope = parseDispatchPlanApprovalEnvelopeRaw(raw, dependencies, contacts, drafts);
  return marker && raw && envelope && markerBindingIsValid("dispatch-plan-approval", raw, envelope, marker.marker, dependencies.authority) ? { markerRaw: marker.raw, raw, envelope } : null;
}

function commitContactEnvelope(previousRaw: string, markerRaw: string, authority: ProcurementDispatchAuthority, candidate: SupplierContactEnvelope, getAuthority: ProcurementDispatchAuthorityReader): ProcurementMutationResult<SupplierContactEnvelope> {
  const candidateRaw = JSON.stringify(candidate);
  if (!parseSupplierContactEnvelopeRaw(candidateRaw, authority)) return { status: "schema-invalid", reason: "candidate-invalid" };
  try {
    if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null || window.localStorage.getItem(projectSupplierContactsStorageKey) !== previousRaw || window.localStorage.getItem(projectSupplierContactsCutoverMarkerKey) !== markerRaw || getAuthority()?.snapshotHash !== authority.snapshotHash) return { status: "version-conflict", reason: "preimage-changed" };
    window.localStorage.setItem(projectSupplierContactsStorageKey, candidateRaw);
    const afterAuthority = getAuthority();
    const readbackRaw = window.localStorage.getItem(projectSupplierContactsStorageKey);
    const marker = authorityIsValid(afterAuthority) ? committedMarkerRaw("supplier-contact", afterAuthority) : null;
    const readback = authorityIsValid(afterAuthority) ? parseSupplierContactEnvelopeRaw(readbackRaw, afterAuthority) : null;
    if (readbackRaw === candidateRaw && marker?.raw === markerRaw && afterAuthority?.snapshotHash === authority.snapshotHash && readback && markerBindingIsValid("supplier-contact", candidateRaw, readback, marker.marker, afterAuthority)) return { status: "updated", envelope: readback };
    return restoreOwnedValue(projectSupplierContactsStorageKey, previousRaw, candidateRaw) ? { status: "write-failure", reason: "readback-failure" } : { status: "read-failure", reason: "rollback-failure" };
  } catch { return restoreOwnedValue(projectSupplierContactsStorageKey, previousRaw, candidateRaw) ? { status: "write-failure", reason: "persistence-failure" } : { status: "read-failure", reason: "rollback-failure" }; }
}

export async function executeSupplierContactCommand(command: SupplierContactCommand, getAuthority: ProcurementDispatchAuthorityReader): Promise<ProcurementMutationResult<SupplierContactEnvelope>> {
  return withProcurementWriteLock<ProcurementMutationResult<SupplierContactEnvelope>>({ status: "lock-unavailable", reason: "lock-unavailable" }, () => {
    if (!contactCommandIsValid(command)) return { status: "schema-invalid", reason: "command-invalid" };
    if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null) return { status: "queue-blocked", reason: "queue-intent-present" };
    const authority = getAuthority();
    if (!authorityIsValid(authority)) return { status: "read-failure", reason: "foundation-invalid" };
    const current = readContactMutation(authority);
    if (!current) return { status: "read-failure", reason: "contact-store-invalid" };
    const payloadHash = procurementDispatchHash(contactCommandPayload(command));
    const priorReceipt = current.envelope.idempotencyReceipts.find((receipt) => receipt.key === command.idempotencyKey);
    if (priorReceipt) return priorReceipt.action === command.action && priorReceipt.payloadHash === payloadHash && priorReceipt.recordId === command.contactId && priorReceipt.projectId === command.projectId ? { status: priorReceipt.result, envelope: current.envelope, recordId: priorReceipt.recordId } : { status: "idempotency-payload-mismatch", envelope: current.envelope, reason: "idempotency-key-reused" };
    if (!authority.projectIds.includes(command.projectId)) return { status: "scope-mismatch", envelope: current.envelope, reason: "project-not-authorized" };
    if (command.expectedStoreVersion !== current.envelope.storeVersion) return { status: "version-conflict", envelope: current.envelope, reason: "store-version-stale" };
    const timestamp = nextTimestamp(current.envelope.updatedAt);
    let record: SupplierContactRecord;
    let result: "created" | "updated";
    let expectedRecordVersion: number | null;
    if (command.action === "create-contact") {
      if (current.envelope.records.some((item) => item.id === command.contactId) || current.envelope.records.filter((item) => item.projectId === command.projectId).length >= maximumProcurementRecordsPerProject) return { status: "version-conflict", envelope: current.envelope, reason: "contact-id-or-limit" };
      const snapshot: SupplierContactSnapshot = { ...command.draft, status: "active", archivedAt: null };
      const revision = finalizeContactRevision({ id: `supplier-contact-revision:${command.contactId}:v1`, version: 1, createdAt: timestamp, snapshot });
      const event = finalizeContactEvent({ id: `supplier-contact-event:${command.contactId}:v1`, type: "created", actor: "شما", actorPrincipalId: "local-builder-account", at: timestamp, version: 1, revisionId: revision.id, authorizationContextHash: authorizationHash(authority, command.projectId), idempotencyKey: command.idempotencyKey, commandPayloadHash: payloadHash });
      record = finalizeContactRecord({ schemaVersion: 2, objectType: "supplier-contact", id: command.contactId, projectId: command.projectId, ownerPrincipalType: "account", ownerPrincipalId: "local-builder-account", accountSide: "builder", scopeType: "project_private", scopeId: command.projectId, custodianService: "Supplier Contact Service", sensitivity: "private", ...snapshot, source: "ثبت مستقیم سازنده", networkStatus: "خارج از شبکه چیدا", visibility: "خصوصی پروژه", localStatus: "ثبت محلی", version: 1, currentRevisionId: revision.id, createdAt: timestamp, updatedAt: timestamp, history: [event], revisions: [revision], legacyEvidence: null });
      result = "created"; expectedRecordVersion = null;
    } else {
      const existing = current.envelope.records.find((item) => item.id === command.contactId);
      if (!existing) return { status: "not-found", envelope: current.envelope, reason: "contact-not-found" };
      if (existing.projectId !== command.projectId) return { status: "scope-mismatch", envelope: current.envelope, reason: "contact-project-mismatch" };
      if (existing.version !== command.expectedContactVersion) return { status: "version-conflict", envelope: current.envelope, recordId: existing.id, reason: "contact-version-stale" };
      const targetStatus: SupplierContactStatus = command.action === "archive-contact" ? "archived" : "active";
      if (existing.status === targetStatus) return { status: "unchanged", envelope: current.envelope, recordId: existing.id };
      const version = existing.version + 1;
      const snapshot: SupplierContactSnapshot = { displayName: existing.displayName, category: existing.category, tehranCoverage: existing.tehranCoverage, responseCapability: existing.responseCapability, status: targetStatus, archivedAt: targetStatus === "archived" ? timestamp : null };
      const revision = finalizeContactRevision({ id: `supplier-contact-revision:${existing.id}:v${version}`, version, createdAt: timestamp, snapshot });
      const event = finalizeContactEvent({ id: `supplier-contact-event:${existing.id}:v${version}`, type: command.action === "archive-contact" ? "archived" : "restored", actor: "شما", actorPrincipalId: "local-builder-account", at: timestamp, version, revisionId: revision.id, authorizationContextHash: authorizationHash(authority, command.projectId), idempotencyKey: command.idempotencyKey, commandPayloadHash: payloadHash });
      record = finalizeContactRecord({ ...existing, ...snapshot, version, currentRevisionId: revision.id, updatedAt: timestamp, history: [...existing.history, event], revisions: [...existing.revisions, revision] });
      result = "updated"; expectedRecordVersion = existing.version;
    }
    const event = record.history.at(-1)!;
    const receipt = finalizeReceipt({ schemaVersion: 1, key: command.idempotencyKey, action: command.action, payloadHash, projectId: command.projectId, recordId: record.id, expectedStoreVersion: current.envelope.storeVersion, expectedRecordVersion, expectedContactStoreVersion: null, expectedDraftStoreVersion: null, preconditionCheckpointKey: null, preconditionCheckpointFingerprint: null, requestPreconditionReceiptPosition: null, approvalPreconditionStoreVersion: null, aggregateQueueIdempotencyKey: null, aggregateCommandPayloadHash: null, result, resultingStoreVersion: current.envelope.storeVersion + 1, resultingRecordVersion: record.version, eventId: event.id, revisionId: event.revisionId, authorizationContextHash: authorizationHash(authority, command.projectId), recordedAt: timestamp });
    const envelope = finalizeContactEnvelope({ ...current.envelope, storeVersion: current.envelope.storeVersion + 1, records: result === "created" ? [...current.envelope.records, record] : current.envelope.records.map((item) => item.id === record.id ? record : item), idempotencyReceipts: [...current.envelope.idempotencyReceipts, receipt], updatedAt: timestamp });
    const committed = commitContactEnvelope(current.raw, current.markerRaw, authority, envelope, getAuthority);
    return committed.envelope ? { status: result, envelope: committed.envelope, recordId: record.id } : committed;
  });
}

function currentDraftDependencies(
  command: DispatchDraftUpsertCommand,
  dependencies: ProcurementDispatchDependencies,
  contacts: SupplierContactEnvelope,
  aggregateQueueBinding: { idempotencyKey: string; commandPayloadHash: string; preconditionHash: string } | null = null,
) {
  const request = dependencies.requestRevisions.find((item) => item.projectId === command.projectId && item.requestId === command.requestId && item.requestVersion === command.expectedRequestVersion && item.revisionId === command.expectedRequestRevisionId && item.revisionFingerprint === command.expectedRequestRevisionFingerprint && item.isCurrentReadyForReview);
  const approval = dependencies.contentApprovals.find((item) => item.projectId === command.projectId && item.approvalId === command.approvalId && item.approvalVersion === command.expectedApprovalVersion && item.approvalRevisionId === command.expectedApprovalRevisionId && item.approvalFingerprint === command.expectedApprovalFingerprint && item.requestId === command.requestId && item.requestVersion === command.expectedRequestVersion && item.requestRevisionId === command.expectedRequestRevisionId && item.requestRevisionFingerprint === command.expectedRequestRevisionFingerprint && item.status === "approved" && item.isCurrent);
  if (!request || !approval) return null;
  const target: DispatchDependencyTarget = { requestId: request.requestId, requestVersion: request.requestVersion, revisionId: request.revisionId, revisionFingerprint: request.revisionFingerprint, approvalId: approval.approvalId, approvalVersion: approval.approvalVersion, approvalRevisionId: approval.approvalRevisionId, approvalFingerprint: approval.approvalFingerprint };
  const checkpoint = checkpointForReference(dependencies, command.precondition);
  const expectedCheckpointHash = aggregateQueueBinding?.preconditionHash ?? procurementDispatchHash(draftPreconditionCommandPayload(command));
  const expectedOperation = aggregateQueueBinding === null ? "dispatch-draft" : "dispatch-queue";
  const expectedCheckpointKey = procurementDispatchPreconditionCheckpointKey(expectedOperation, aggregateQueueBinding?.idempotencyKey ?? command.idempotencyKey);
  if (!checkpoint || checkpoint.operation !== expectedOperation || checkpoint.checkpointKey !== expectedCheckpointKey || checkpoint.commandPayloadHash !== expectedCheckpointHash || !checkpointMatchesTarget(checkpoint, command.projectId, target)) return null;
  const pins = command.recipients.map((pin) => {
    const contact = contacts.records.find((item) => item.id === pin.supplierContactId && item.projectId === command.projectId && item.version === pin.expectedContactVersion && item.currentRevisionId === pin.expectedContactRevisionId);
    const revision = contact?.revisions.find((item) => item.id === pin.expectedContactRevisionId && item.version === pin.expectedContactVersion && item.fingerprint === pin.expectedContactRevisionFingerprint);
    return contact && revision && revision.snapshot.status === "active" && capabilitySupports(revision.snapshot.responseCapability, request.requestKind) ? { contact, revision } : null;
  });
  return pins.some((pin) => pin === null) ? null : { request, approval, checkpoint, target, pins: pins as Array<{ contact: SupplierContactRecord; revision: SupplierContactRevision }> };
}

function buildDraftMutation(command: DispatchDraftUpsertCommand, dependencies: ProcurementDispatchDependencies, contacts: SupplierContactEnvelope, current: DispatchDraftEnvelope, aggregateQueueBinding: { idempotencyKey: string; commandPayloadHash: string; preconditionHash: string } | null = null) {
  const exact = currentDraftDependencies(command, dependencies, contacts, aggregateQueueBinding);
  if (!exact || contacts.storeVersion !== command.expectedContactStoreVersion || current.storeVersion !== command.expectedDraftStoreVersion) return { status: "version-conflict" as const, reason: "dependency-or-store-version-stale" };
  const target = exact.target;
  const dedupeKey = dispatchDraftDedupeKey(command.projectId, target);
  const existing = current.records.find((item) => item.dedupeKey === dedupeKey) ?? null;
  const deterministicDraftId = dispatchDraftIdForTarget(command.projectId, command.requestId, command.expectedRequestVersion, command.expectedRequestRevisionId);
  if ((existing && existing.id !== command.dispatchDraftId) || (!existing && command.dispatchDraftId !== deterministicDraftId) || (!existing && command.expectedDraftVersion !== null) || (existing && existing.version !== command.expectedDraftVersion)) return { status: "version-conflict" as const, reason: "draft-version-stale" };
  if (!existing && current.records.some((item) => item.id === command.dispatchDraftId) || !existing && current.records.filter((item) => item.projectId === command.projectId).length >= maximumProcurementRecordsPerProject) return { status: "version-conflict" as const, reason: "draft-id-or-limit" };
  const recipientIds = command.recipients.map((pin) => pin.supplierContactId);
  const prior = existing?.revisions.at(-1);
  const expectedInvitePins = exact.pins.map(({ contact, revision }) => ({ supplierContactId: contact.id, supplierContactVersion: revision.version, supplierContactRevisionId: revision.id, supplierContactRevisionFingerprint: revision.fingerprint, destination: destinationFromSnapshot(revision.snapshot) }));
  if (prior && valuesEqual(prior.inviteDrafts.map(invitePinValue), expectedInvitePins) && valuesEqual(existing!.target, target)) return { status: "unchanged" as const, record: existing! };
  const timestamp = nextTimestamp(current.updatedAt, contacts.updatedAt, exact.request.revisionCreatedAt, exact.approval.updatedAt, ...exact.pins.map((pin) => pin.revision.createdAt));
  const version = existing ? existing.version + 1 : 1;
  const invites = exact.pins.map(({ contact, revision }) => finalizeInvite({ schemaVersion: 2, id: inviteDraftIdForRevision(command.dispatchDraftId, version, contact.id), projectId: command.projectId, supplierContactId: contact.id, supplierContactVersion: revision.version, supplierContactRevisionId: revision.id, supplierContactRevisionFingerprint: revision.fingerprint, destination: destinationFromSnapshot(revision.snapshot), target, source: "ثبت مستقیم سازنده", continuation: "ادامهٔ احتمالی در فاز تأمین‌کننده", simulationOnly: true, externalEffect: "none", sendAuthorized: false, externalActionAttempted: false, version: 1, createdAt: timestamp, updatedAt: timestamp }));
  const revision = finalizeDraftRevision({ id: `dispatch-draft-revision:${command.dispatchDraftId}:v${version}`, version, createdAt: timestamp, recipientIds, inviteDrafts: invites, payload: exact.request.payload, privacySnapshot: exact.request.privacySnapshot });
  const payloadHash = procurementDispatchHash(draftCommandPayload(command));
  const event = finalizeDraftEvent({ id: `dispatch-draft-event:${command.dispatchDraftId}:v${version}`, type: existing ? "updated" : "created", actor: "شما", actorPrincipalId: "local-builder-account", at: timestamp, version, revisionId: revision.id, authorizationContextHash: authorizationHash(dependencies.authority, command.projectId), idempotencyKey: command.idempotencyKey, commandPayloadHash: payloadHash });
  const record = existing ? finalizeDraftRecord({ ...existing, currentRevisionId: revision.id, version, updatedAt: timestamp, history: [...existing.history, event], revisions: [...existing.revisions, revision] }) : finalizeDraftRecord({ schemaVersion: 2, objectType: "dispatch-draft", id: command.dispatchDraftId, projectId: command.projectId, ownerPrincipalType: "account", ownerPrincipalId: "local-builder-account", accountSide: "builder", scopeType: "project_private", scopeId: command.projectId, custodianService: "Dispatch Draft Service", sensitivity: "private", target, dedupeKey, status: "draft", currentRevisionId: revision.id, simulationOnly: true, externalEffect: "none", sendAuthorized: false, externalActionAttempted: false, visibility: "خصوصی پروژه", localStatus: "ثبت محلی", version: 1, createdAt: timestamp, updatedAt: timestamp, history: [event], revisions: [revision], legacyEvidence: null });
  const result = existing ? "updated" as const : "created" as const;
  const receipt = finalizeReceipt({ schemaVersion: 1, key: command.idempotencyKey, action: "upsert-dispatch-draft", payloadHash, projectId: command.projectId, recordId: record.id, expectedStoreVersion: current.storeVersion, expectedRecordVersion: existing?.version ?? null, expectedContactStoreVersion: command.expectedContactStoreVersion, expectedDraftStoreVersion: command.expectedDraftStoreVersion, preconditionCheckpointKey: exact.checkpoint.checkpointKey, preconditionCheckpointFingerprint: exact.checkpoint.fingerprint, requestPreconditionReceiptPosition: exact.checkpoint.requestHead.receiptPosition, approvalPreconditionStoreVersion: exact.checkpoint.approvalHead.resultingStoreVersion, aggregateQueueIdempotencyKey: aggregateQueueBinding?.idempotencyKey ?? null, aggregateCommandPayloadHash: aggregateQueueBinding?.commandPayloadHash ?? null, result, resultingStoreVersion: current.storeVersion + 1, resultingRecordVersion: record.version, eventId: event.id, revisionId: revision.id, authorizationContextHash: authorizationHash(dependencies.authority, command.projectId), recordedAt: timestamp });
  const envelope = finalizeDraftEnvelope({ ...current, storeVersion: current.storeVersion + 1, records: existing ? current.records.map((item) => item.id === record.id ? record : item) : [...current.records, record], idempotencyReceipts: [...current.idempotencyReceipts, receipt], updatedAt: timestamp });
  return { status: result, record, envelope };
}

function commitDraftEnvelope(previousRaw: string, markerRaw: string, contactsRaw: string, contactsMarkerRaw: string, dependencies: ProcurementDispatchDependencies, candidate: DispatchDraftEnvelope, getDependencies: ProcurementDispatchDependencyReader): ProcurementMutationResult<DispatchDraftEnvelope> {
  const candidateRaw = JSON.stringify(candidate);
  const contacts = parseSupplierContactEnvelopeRaw(contactsRaw, dependencies.authority);
  if (!contacts || !parseDispatchDraftEnvelopeRaw(candidateRaw, dependencies, contacts)) return { status: "schema-invalid", reason: "candidate-invalid" };
  try {
    if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null || window.localStorage.getItem(projectDispatchDraftsStorageKey) !== previousRaw || window.localStorage.getItem(projectDispatchDraftsCutoverMarkerKey) !== markerRaw || window.localStorage.getItem(projectSupplierContactsStorageKey) !== contactsRaw || window.localStorage.getItem(projectSupplierContactsCutoverMarkerKey) !== contactsMarkerRaw || getDependencies()?.snapshotHash !== dependencies.snapshotHash) return { status: "version-conflict", reason: "preimage-changed" };
    window.localStorage.setItem(projectDispatchDraftsStorageKey, candidateRaw);
    const after = getDependencies();
    const readbackRaw = window.localStorage.getItem(projectDispatchDraftsStorageKey);
    const afterContactsRaw = window.localStorage.getItem(projectSupplierContactsStorageKey);
    const afterContacts = dependenciesAreValid(after) && afterContactsRaw ? parseSupplierContactEnvelopeRaw(afterContactsRaw, after.authority) : null;
    const marker = dependenciesAreValid(after) ? committedMarkerRaw("dispatch-draft", after.authority) : null;
    const readback = after && afterContacts ? parseDispatchDraftEnvelopeRaw(readbackRaw, after, afterContacts) : null;
    if (readbackRaw === candidateRaw && after?.snapshotHash === dependencies.snapshotHash && afterContactsRaw === contactsRaw && window.localStorage.getItem(projectSupplierContactsCutoverMarkerKey) === contactsMarkerRaw && marker?.raw === markerRaw && readback && markerBindingIsValid("dispatch-draft", candidateRaw, readback, marker.marker, after.authority)) return { status: "updated", envelope: readback };
    return restoreOwnedValue(projectDispatchDraftsStorageKey, previousRaw, candidateRaw) ? { status: "write-failure", reason: "readback-failure" } : { status: "read-failure", reason: "rollback-failure" };
  } catch { return restoreOwnedValue(projectDispatchDraftsStorageKey, previousRaw, candidateRaw) ? { status: "write-failure", reason: "persistence-failure" } : { status: "read-failure", reason: "rollback-failure" }; }
}

export async function executeDispatchDraftCommand(command: DispatchDraftUpsertCommand, getDependencies: ProcurementDispatchDependencyReader): Promise<ProcurementMutationResult<DispatchDraftEnvelope>> {
  return withProcurementWriteLock<ProcurementMutationResult<DispatchDraftEnvelope>>({ status: "lock-unavailable", reason: "lock-unavailable" }, () => {
    if (!draftCommandIsValid(command)) return { status: "schema-invalid", reason: "command-invalid" };
    if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null) return { status: "queue-blocked", reason: "queue-intent-present" };
    const dependencies = getDependencies();
    if (!dependenciesAreValid(dependencies)) return { status: "read-failure", reason: "dependency-invalid" };
    const contactsMarker = committedMarkerRaw("supplier-contact", dependencies.authority);
    const contactsRaw = window.localStorage.getItem(projectSupplierContactsStorageKey);
    const contacts = parseSupplierContactEnvelopeRaw(contactsRaw, dependencies.authority);
    if (!contactsMarker || !contactsRaw || !contacts || !markerBindingIsValid("supplier-contact", contactsRaw, contacts, contactsMarker.marker, dependencies.authority)) return { status: "read-failure", reason: "contact-store-invalid" };
    const current = readDraftMutation(dependencies, contacts);
    if (!current) return { status: "read-failure", reason: "draft-store-invalid" };
    const payloadHash = procurementDispatchHash(draftCommandPayload(command));
    const priorReceipt = current.envelope.idempotencyReceipts.find((receipt) => receipt.key === command.idempotencyKey);
    if (priorReceipt) return priorReceipt.action === command.action && priorReceipt.payloadHash === payloadHash && priorReceipt.recordId === command.dispatchDraftId && priorReceipt.projectId === command.projectId ? { status: priorReceipt.result, envelope: current.envelope, recordId: priorReceipt.recordId } : { status: "idempotency-payload-mismatch", envelope: current.envelope, reason: "idempotency-key-reused" };
    if (!dependencies.authority.projectIds.includes(command.projectId)) return { status: "scope-mismatch", envelope: current.envelope, reason: "project-not-authorized" };
    const built = buildDraftMutation(command, dependencies, contacts, current.envelope);
    if (built.status === "unchanged") return { status: "unchanged", envelope: current.envelope, recordId: built.record.id };
    if (!built.envelope || !built.record) return { status: built.status, envelope: current.envelope, reason: built.reason };
    const committed = commitDraftEnvelope(current.raw, current.markerRaw, contactsRaw, contactsMarker.raw, dependencies, built.envelope, getDependencies);
    return committed.envelope ? { status: built.status, envelope: committed.envelope, recordId: built.record.id } : committed;
  });
}

export function dispatchPlanApprovalEffectiveStatus(record: DispatchPlanApprovalRecord, draft: DispatchDraftRecord | null, dependencies: ProcurementDispatchDependencies, contacts: SupplierContactEnvelope): DispatchPlanApprovalEffectiveStatus {
  if (!dependenciesAreValid(dependencies) || !draft || draft.projectId !== record.projectId || draft.id !== record.target.dispatchDraftId || draft.currentRevisionId !== record.target.dispatchRevisionId || draft.version !== record.target.dispatchDraftVersion) return "invalidated";
  const revision = draft.revisions.find((item) => item.id === record.target.dispatchRevisionId && item.version === record.target.dispatchDraftVersion && item.fingerprint === record.target.dispatchRevisionFingerprint);
  const target: DispatchDependencyTarget = { requestId: record.target.requestId, requestVersion: record.target.requestVersion, revisionId: record.target.requestRevisionId, revisionFingerprint: record.target.requestRevisionFingerprint, approvalId: record.target.contentApprovalId, approvalVersion: record.target.contentApprovalVersion, approvalRevisionId: record.target.contentApprovalRevisionId, approvalFingerprint: record.target.contentApprovalFingerprint };
  const request = requestDependencyForTarget(dependencies, record.projectId, target);
  const approval = approvalDependencyForTarget(dependencies, record.projectId, target);
  if (!revision || !request?.isCurrentReadyForReview || !approval?.isCurrent || approval.status !== "approved" || !valuesEqual(record.snapshot, planSnapshotFromDraft(revision))) return "invalidated";
  for (const recipient of record.snapshot.recipients) {
    const contact = contacts.records.find((item) => item.id === recipient.supplierContactId && item.projectId === record.projectId);
    if (!contact || contact.version !== recipient.supplierContactVersion || contact.currentRevisionId !== recipient.supplierContactRevisionId || contact.status !== "active" || contact.revisions.at(-1)?.fingerprint !== recipient.supplierContactRevisionFingerprint || !capabilitySupports(contact.responseCapability, request.requestKind)) return "invalidated";
  }
  return record.status;
}

function buildPlanMutation(command: DispatchPlanApprovalCommand, dependencies: ProcurementDispatchDependencies, contacts: SupplierContactEnvelope, drafts: DispatchDraftEnvelope, current: DispatchPlanApprovalEnvelope, aggregateQueueBinding: { idempotencyKey: string; commandPayloadHash: string; preconditionHash: string } | null = null) {
  if (contacts.storeVersion !== command.expectedContactStoreVersion || drafts.storeVersion !== command.expectedDraftStoreVersion || current.storeVersion !== command.expectedPlanStoreVersion) return { status: "version-conflict" as const, reason: "store-version-stale" };
  const payloadHash = procurementDispatchHash(planCommandPayload(command));
  const timestamp = nextTimestamp(current.updatedAt, drafts.updatedAt, contacts.updatedAt);
  if (command.action === "create-dispatch-plan") {
    const draft = drafts.records.find((item) => item.id === command.dispatchDraftId && item.projectId === command.projectId);
    const revision = draft?.revisions.find((item) => item.id === command.expectedDispatchRevisionId && item.version === command.expectedDraftVersion && item.fingerprint === command.expectedDispatchRevisionFingerprint);
    if (!draft || !revision || draft.version !== command.expectedDraftVersion || draft.currentRevisionId !== revision.id) return { status: "version-conflict" as const, reason: "draft-version-stale" };
    const synthetic: DispatchPlanApprovalRecord = { schemaVersion: 2, objectType: "dispatch-plan-approval", id: command.planApprovalId, projectId: command.projectId, ownerPrincipalType: "account", ownerPrincipalId: "local-builder-account", accountSide: "builder", scopeType: "project_private", scopeId: command.projectId, custodianService: "Dispatch Plan Approval Service", sensitivity: "private", purpose: "approve-local-dispatch-plan-simulation", target: planTargetFromDraft(draft, revision), snapshot: planSnapshotFromDraft(revision), planFingerprint: "", dedupeKey: "", idempotencyKey: "", status: "pending", simulationOnly: true, externalEffect: "none", sendAuthorized: false, externalActionAttempted: false, actionRecord: null, visibility: "خصوصی پروژه", localStatus: "ثبت محلی", requestedBy: "شما", decidedBy: null, requestedAt: timestamp, decidedAt: null, createdAt: timestamp, updatedAt: timestamp, version: 1, currentRevisionId: "", history: [], revisions: [], legacyEvidence: null, fingerprint: "" };
    const checkpoint = checkpointForReference(dependencies, command.precondition);
    const checkpointHash = aggregateQueueBinding?.preconditionHash ?? procurementDispatchHash(planPreconditionCommandPayload(command));
    const checkpointOperation = aggregateQueueBinding ? "dispatch-queue" : "dispatch-plan";
    const dependencyTarget: DispatchDependencyTarget = { requestId: synthetic.target.requestId, requestVersion: synthetic.target.requestVersion, revisionId: synthetic.target.requestRevisionId, revisionFingerprint: synthetic.target.requestRevisionFingerprint, approvalId: synthetic.target.contentApprovalId, approvalVersion: synthetic.target.contentApprovalVersion, approvalRevisionId: synthetic.target.contentApprovalRevisionId, approvalFingerprint: synthetic.target.contentApprovalFingerprint };
    const checkpointKey = procurementDispatchPreconditionCheckpointKey(checkpointOperation, aggregateQueueBinding?.idempotencyKey ?? command.idempotencyKey);
    if (!checkpoint || checkpoint.operation !== checkpointOperation || checkpoint.checkpointKey !== checkpointKey || checkpoint.commandPayloadHash !== checkpointHash || !checkpointMatchesTarget(checkpoint, command.projectId, dependencyTarget)) return { status: "dependency-invalid" as const, reason: "dispatch-precondition-checkpoint-invalid" };
    if (dispatchPlanApprovalEffectiveStatus({ ...synthetic, status: "pending" }, draft, dependencies, contacts) === "invalidated") return { status: "dependency-invalid" as const, reason: "dispatch-dependencies-not-current" };
    const target = synthetic.target;
    const snapshot = synthetic.snapshot;
    const planFingerprint = dispatchPlanFingerprint(target, snapshot);
    const dedupeKey = dispatchPlanDedupeKey(command.projectId, target, planFingerprint);
    const existing = current.records.find((item) => item.dedupeKey === dedupeKey);
    if (existing) return existing.id === command.planApprovalId ? { status: "unchanged" as const, record: existing } : { status: "version-conflict" as const, reason: "plan-dedupe-exists" };
    if (current.records.some((item) => item.id === command.planApprovalId) || current.records.filter((item) => item.projectId === command.projectId).length >= maximumProcurementRecordsPerProject) return { status: "version-conflict" as const, reason: "plan-id-or-limit" };
    const revisionRecord = finalizePlanRevision({ id: `dispatch-plan-approval-revision:${command.planApprovalId}:v1`, version: 1, createdAt: timestamp, snapshot: { status: "pending", actionRecord: null, decidedBy: null, decidedAt: null } });
    const event = finalizePlanEvent({ id: `dispatch-plan-approval-event:${command.planApprovalId}:v1`, type: "created", actor: "شما", actorPrincipalId: "local-builder-account", at: timestamp, version: 1, revisionId: revisionRecord.id, authorizationContextHash: authorizationHash(dependencies.authority, command.projectId), idempotencyKey: command.idempotencyKey, commandPayloadHash: payloadHash });
    const record = finalizePlanRecord({ ...synthetic, planFingerprint, dedupeKey, idempotencyKey: `${dedupeKey}:simulation-v2`, currentRevisionId: revisionRecord.id, history: [event], revisions: [revisionRecord] });
    const receipt = finalizeReceipt({ schemaVersion: 1, key: command.idempotencyKey, action: command.action, payloadHash, projectId: command.projectId, recordId: record.id, expectedStoreVersion: current.storeVersion, expectedRecordVersion: null, expectedContactStoreVersion: command.expectedContactStoreVersion, expectedDraftStoreVersion: command.expectedDraftStoreVersion, preconditionCheckpointKey: checkpoint.checkpointKey, preconditionCheckpointFingerprint: checkpoint.fingerprint, requestPreconditionReceiptPosition: checkpoint.requestHead.receiptPosition, approvalPreconditionStoreVersion: checkpoint.approvalHead.resultingStoreVersion, aggregateQueueIdempotencyKey: aggregateQueueBinding?.idempotencyKey ?? null, aggregateCommandPayloadHash: aggregateQueueBinding?.commandPayloadHash ?? null, result: "created", resultingStoreVersion: current.storeVersion + 1, resultingRecordVersion: 1, eventId: event.id, revisionId: revisionRecord.id, authorizationContextHash: authorizationHash(dependencies.authority, command.projectId), recordedAt: timestamp });
    const envelope = finalizePlanEnvelope({ ...current, storeVersion: current.storeVersion + 1, records: [...current.records, record], idempotencyReceipts: [...current.idempotencyReceipts, receipt], updatedAt: timestamp });
    return { status: "created" as const, record, envelope };
  }
  const record = current.records.find((item) => item.id === command.planApprovalId);
  if (!record) return { status: "not-found" as const, reason: "plan-not-found" };
  if (record.projectId !== command.projectId) return { status: "scope-mismatch" as const, reason: "plan-project-mismatch" };
  if (record.version !== command.expectedPlanVersion) return { status: "version-conflict" as const, reason: "plan-version-stale" };
  const draft = drafts.records.find((item) => item.id === record.target.dispatchDraftId && item.projectId === record.projectId) ?? null;
  const checkpoint = checkpointForReference(dependencies, command.precondition);
  const dependencyTarget: DispatchDependencyTarget = { requestId: record.target.requestId, requestVersion: record.target.requestVersion, revisionId: record.target.requestRevisionId, revisionFingerprint: record.target.requestRevisionFingerprint, approvalId: record.target.contentApprovalId, approvalVersion: record.target.contentApprovalVersion, approvalRevisionId: record.target.contentApprovalRevisionId, approvalFingerprint: record.target.contentApprovalFingerprint };
  if (!checkpoint || checkpoint.operation !== "dispatch-plan" || checkpoint.checkpointKey !== procurementDispatchPreconditionCheckpointKey("dispatch-plan", command.idempotencyKey) || checkpoint.commandPayloadHash !== procurementDispatchHash(planPreconditionCommandPayload(command)) || !checkpointMatchesTarget(checkpoint, command.projectId, dependencyTarget)) return { status: "dependency-invalid" as const, reason: "dispatch-precondition-checkpoint-invalid" };
  if (dispatchPlanApprovalEffectiveStatus(record, draft, dependencies, contacts) === "invalidated") return { status: "dependency-invalid" as const, reason: "plan-invalidated" };
  const targetStatus: DispatchPlanApprovalStatus = command.action === "withdraw-dispatch-plan" ? "withdrawn" : command.action === "reopen-dispatch-plan" ? "pending" : "approved";
  if (record.status === targetStatus) return { status: "unchanged" as const, record };
  const allowed = command.action === "withdraw-dispatch-plan" && record.status === "pending" || command.action === "reopen-dispatch-plan" && record.status === "withdrawn" || command.action === "approve-dispatch-plan" && record.status === "pending";
  if (!allowed) return { status: "unsupported-transition" as const, reason: "plan-transition-invalid" };
  const version = record.version + 1;
  const actionRecord = targetStatus === "approved" ? { kind: "record-local-dispatch-plan-approval", result: "local-dispatch-plan-approved", label: "تأیید محلی برنامهٔ ارسال", error: null, recordedAt: timestamp } as const : null;
  const revisionSnapshot: DispatchPlanApprovalRevisionSnapshot = { status: targetStatus, actionRecord, decidedBy: targetStatus === "approved" ? "شما" : null, decidedAt: targetStatus === "approved" ? timestamp : null };
  const revision = finalizePlanRevision({ id: `dispatch-plan-approval-revision:${record.id}:v${version}`, version, createdAt: timestamp, snapshot: revisionSnapshot });
  const eventType: DispatchPlanApprovalEventType = command.action === "withdraw-dispatch-plan" ? "withdrawn" : command.action === "reopen-dispatch-plan" ? "reopened" : "approved";
  const event = finalizePlanEvent({ id: `dispatch-plan-approval-event:${record.id}:v${version}`, type: eventType, actor: "شما", actorPrincipalId: "local-builder-account", at: timestamp, version, revisionId: revision.id, authorizationContextHash: authorizationHash(dependencies.authority, command.projectId), idempotencyKey: command.idempotencyKey, commandPayloadHash: payloadHash });
  const updated = finalizePlanRecord({ ...record, ...revisionSnapshot, version, currentRevisionId: revision.id, updatedAt: timestamp, history: [...record.history, event], revisions: [...record.revisions, revision] });
  const receipt = finalizeReceipt({ schemaVersion: 1, key: command.idempotencyKey, action: command.action, payloadHash, projectId: command.projectId, recordId: record.id, expectedStoreVersion: current.storeVersion, expectedRecordVersion: record.version, expectedContactStoreVersion: command.expectedContactStoreVersion, expectedDraftStoreVersion: command.expectedDraftStoreVersion, preconditionCheckpointKey: checkpoint.checkpointKey, preconditionCheckpointFingerprint: checkpoint.fingerprint, requestPreconditionReceiptPosition: checkpoint.requestHead.receiptPosition, approvalPreconditionStoreVersion: checkpoint.approvalHead.resultingStoreVersion, aggregateQueueIdempotencyKey: null, aggregateCommandPayloadHash: null, result: "updated", resultingStoreVersion: current.storeVersion + 1, resultingRecordVersion: version, eventId: event.id, revisionId: revision.id, authorizationContextHash: authorizationHash(dependencies.authority, command.projectId), recordedAt: timestamp });
  const envelope = finalizePlanEnvelope({ ...current, storeVersion: current.storeVersion + 1, records: current.records.map((item) => item.id === updated.id ? updated : item), idempotencyReceipts: [...current.idempotencyReceipts, receipt], updatedAt: timestamp });
  return { status: "updated" as const, record: updated, envelope };
}

function commitPlanEnvelope(previousRaw: string, markerRaw: string, contactsRaw: string, contactsMarkerRaw: string, draftsRaw: string, draftsMarkerRaw: string, dependencies: ProcurementDispatchDependencies, candidate: DispatchPlanApprovalEnvelope, getDependencies: ProcurementDispatchDependencyReader): ProcurementMutationResult<DispatchPlanApprovalEnvelope> {
  const candidateRaw = JSON.stringify(candidate);
  const contacts = parseSupplierContactEnvelopeRaw(contactsRaw, dependencies.authority);
  const drafts = contacts ? parseDispatchDraftEnvelopeRaw(draftsRaw, dependencies, contacts) : null;
  if (!contacts || !drafts || !parseDispatchPlanApprovalEnvelopeRaw(candidateRaw, dependencies, contacts, drafts)) return { status: "schema-invalid", reason: "candidate-invalid" };
  try {
    if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null || window.localStorage.getItem(projectDispatchPlanApprovalsStorageKey) !== previousRaw || window.localStorage.getItem(projectDispatchPlanApprovalsCutoverMarkerKey) !== markerRaw || window.localStorage.getItem(projectSupplierContactsStorageKey) !== contactsRaw || window.localStorage.getItem(projectSupplierContactsCutoverMarkerKey) !== contactsMarkerRaw || window.localStorage.getItem(projectDispatchDraftsStorageKey) !== draftsRaw || window.localStorage.getItem(projectDispatchDraftsCutoverMarkerKey) !== draftsMarkerRaw || getDependencies()?.snapshotHash !== dependencies.snapshotHash) return { status: "version-conflict", reason: "preimage-changed" };
    window.localStorage.setItem(projectDispatchPlanApprovalsStorageKey, candidateRaw);
    const after = getDependencies();
    const afterContactsRaw = window.localStorage.getItem(projectSupplierContactsStorageKey);
    const afterDraftsRaw = window.localStorage.getItem(projectDispatchDraftsStorageKey);
    const afterContacts = dependenciesAreValid(after) && afterContactsRaw ? parseSupplierContactEnvelopeRaw(afterContactsRaw, after.authority) : null;
    const afterDrafts = after && afterContacts && afterDraftsRaw ? parseDispatchDraftEnvelopeRaw(afterDraftsRaw, after, afterContacts) : null;
    const readbackRaw = window.localStorage.getItem(projectDispatchPlanApprovalsStorageKey);
    const readback = after && afterContacts && afterDrafts ? parseDispatchPlanApprovalEnvelopeRaw(readbackRaw, after, afterContacts, afterDrafts) : null;
    const marker = dependenciesAreValid(after) ? committedMarkerRaw("dispatch-plan-approval", after.authority) : null;
    if (readbackRaw === candidateRaw && after?.snapshotHash === dependencies.snapshotHash && afterContactsRaw === contactsRaw && afterDraftsRaw === draftsRaw && window.localStorage.getItem(projectSupplierContactsCutoverMarkerKey) === contactsMarkerRaw && window.localStorage.getItem(projectDispatchDraftsCutoverMarkerKey) === draftsMarkerRaw && marker?.raw === markerRaw && readback && markerBindingIsValid("dispatch-plan-approval", candidateRaw, readback, marker.marker, after.authority)) return { status: "updated", envelope: readback };
    return restoreOwnedValue(projectDispatchPlanApprovalsStorageKey, previousRaw, candidateRaw) ? { status: "write-failure", reason: "readback-failure" } : { status: "read-failure", reason: "rollback-failure" };
  } catch { return restoreOwnedValue(projectDispatchPlanApprovalsStorageKey, previousRaw, candidateRaw) ? { status: "write-failure", reason: "persistence-failure" } : { status: "read-failure", reason: "rollback-failure" }; }
}

export async function executeDispatchPlanApprovalCommand(command: DispatchPlanApprovalCommand, getDependencies: ProcurementDispatchDependencyReader): Promise<ProcurementMutationResult<DispatchPlanApprovalEnvelope>> {
  return withProcurementWriteLock<ProcurementMutationResult<DispatchPlanApprovalEnvelope>>({ status: "lock-unavailable", reason: "lock-unavailable" }, () => {
    if (!planCommandIsValid(command)) return { status: "schema-invalid", reason: "command-invalid" };
    if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null) return { status: "queue-blocked", reason: "queue-intent-present" };
    const dependencies = getDependencies();
    if (!dependenciesAreValid(dependencies)) return { status: "read-failure", reason: "dependency-invalid" };
    const contactsMarker = committedMarkerRaw("supplier-contact", dependencies.authority);
    const contactsRaw = window.localStorage.getItem(projectSupplierContactsStorageKey);
    const contacts = parseSupplierContactEnvelopeRaw(contactsRaw, dependencies.authority);
    const draftsMarker = committedMarkerRaw("dispatch-draft", dependencies.authority);
    const draftsRaw = window.localStorage.getItem(projectDispatchDraftsStorageKey);
    const drafts = contacts ? parseDispatchDraftEnvelopeRaw(draftsRaw, dependencies, contacts) : null;
    const current = contacts && drafts ? readPlanMutation(dependencies, contacts, drafts) : null;
    if (!contactsMarker || !contactsRaw || !contacts || !draftsMarker || !draftsRaw || !drafts || !current) return { status: "read-failure", reason: !contacts ? "contact-store-invalid" : !drafts ? "draft-store-invalid" : "plan-store-invalid" };
    const payloadHash = procurementDispatchHash(planCommandPayload(command));
    const priorReceipt = current.envelope.idempotencyReceipts.find((receipt) => receipt.key === command.idempotencyKey);
    if (priorReceipt) return priorReceipt.action === command.action && priorReceipt.payloadHash === payloadHash && priorReceipt.recordId === command.planApprovalId && priorReceipt.projectId === command.projectId ? { status: priorReceipt.result, envelope: current.envelope, recordId: priorReceipt.recordId } : { status: "idempotency-payload-mismatch", envelope: current.envelope, reason: "idempotency-key-reused" };
    if (!dependencies.authority.projectIds.includes(command.projectId)) return { status: "scope-mismatch", envelope: current.envelope, reason: "project-not-authorized" };
    const built = buildPlanMutation(command, dependencies, contacts, drafts, current.envelope);
    if (built.status === "unchanged") return { status: "unchanged", envelope: current.envelope, recordId: built.record.id };
    if (!built.envelope || !built.record) return { status: built.status, envelope: current.envelope, reason: built.reason };
    const committed = commitPlanEnvelope(current.raw, current.markerRaw, contactsRaw, contactsMarker.raw, draftsRaw, draftsMarker.raw, dependencies, built.envelope, getDependencies);
    return committed.envelope ? { status: built.status, envelope: committed.envelope, recordId: built.record.id } : committed;
  });
}

function queueCommandIsValid(value: unknown): value is ProcurementDispatchQueueCommand {
  if (!hasExactKeys(value, ["inputSchemaVersion", "action", "draft", "plan", "queueIdempotencyKey"])) return false;
  const command = value as ProcurementDispatchQueueCommand;
  if (command.inputSchemaVersion !== 1 || command.action !== "queue-dispatch-plan" || !draftCommandIsValid(command.draft) || !exactString(command.queueIdempotencyKey, 200)) return false;
  const plan = command.plan as any;
  return hasExactKeys(plan, ["inputSchemaVersion", "action", "projectId", "planApprovalId", "expectedContactStoreVersion", "expectedPlanStoreVersion", "precondition", "acknowledgement", "idempotencyKey"])
    && plan.inputSchemaVersion === 1 && plan.action === "create-dispatch-plan" && plan.projectId === command.draft.projectId && plan.expectedContactStoreVersion === command.draft.expectedContactStoreVersion
    && plan.planApprovalId === dispatchPlanApprovalIdForIdempotencyKey(plan.idempotencyKey) && Number.isSafeInteger(plan.expectedPlanStoreVersion) && plan.expectedPlanStoreVersion >= 1 && exactString(plan.idempotencyKey, 200)
    && preconditionReferenceIsValid(plan.precondition) && valuesEqual(plan.precondition, command.draft.precondition)
    && hasExactKeys(plan.acknowledgement, ["destinationsReviewed", "payloadReviewed", "privacyAndLocationReviewed"]) && plan.acknowledgement.destinationsReviewed === true && plan.acknowledgement.payloadReviewed === true && plan.acknowledgement.privacyAndLocationReviewed === true;
}

function finalizeQueueIntent(value: Omit<ProcurementDispatchQueueIntent, "fingerprint">): ProcurementDispatchQueueIntent {
  return { ...value, fingerprint: procurementDispatchHash(value) };
}

function parseQueueIntentRaw(raw: string | null): ProcurementDispatchQueueIntent | null {
  if (raw === null) return null;
  try {
    const value = JSON.parse(raw);
    const keys = ["schemaVersion", "operation", "id", "commandPayloadHash", "queueIdempotencyKey", "projectId", "requestId", "approvalId", "identityBindingHash", "authorizationContextHash", "targetDependencyHash", "contactRawHash", "contactMarkerRaw", "draftMarkerRaw", "planMarkerRaw", "previousDraftRaw", "nextDraftRaw", "previousPlanRaw", "nextPlanRaw", "createdAt", "fingerprint"];
    if (!hasExactKeys(value, keys)) return null;
    const intent = value as ProcurementDispatchQueueIntent;
    if (intent.schemaVersion !== 1 || intent.operation !== "commit-dispatch-draft-and-plan" || !exactString(intent.id, 300) || intent.id !== deterministicId("dispatch-plan-queue", intent.queueIdempotencyKey) || !exactHash(intent.commandPayloadHash) || !exactString(intent.queueIdempotencyKey, 200) || !exactString(intent.projectId, 200) || !exactString(intent.requestId, 200) || !exactString(intent.approvalId, 200) || !exactHash(intent.identityBindingHash) || !exactHash(intent.authorizationContextHash) || !exactHash(intent.targetDependencyHash) || !exactHash(intent.contactRawHash) || !exactString(intent.contactMarkerRaw, 10_000_000) || !exactString(intent.draftMarkerRaw, 10_000_000) || !exactString(intent.planMarkerRaw, 10_000_000) || typeof intent.previousDraftRaw !== "string" || typeof intent.nextDraftRaw !== "string" || typeof intent.previousPlanRaw !== "string" || typeof intent.nextPlanRaw !== "string" || intent.previousDraftRaw === intent.nextDraftRaw || intent.previousPlanRaw === intent.nextPlanRaw || !exactDate(intent.createdAt) || !fingerprintMatches(intent)) return null;
    return intent;
  } catch { return null; }
}

function queueCandidatesAreValid(intent: ProcurementDispatchQueueIntent, dependencies: ProcurementDispatchDependencies, contacts: SupplierContactEnvelope) {
  const previousDrafts = parseDispatchDraftEnvelopeRaw(intent.previousDraftRaw, dependencies, contacts);
  const nextDrafts = parseDispatchDraftEnvelopeRaw(intent.nextDraftRaw, dependencies, contacts);
  const previousPlans = previousDrafts ? parseDispatchPlanApprovalEnvelopeRaw(intent.previousPlanRaw, dependencies, contacts, previousDrafts) : null;
  const nextPlans = nextDrafts ? parseDispatchPlanApprovalEnvelopeRaw(intent.nextPlanRaw, dependencies, contacts, nextDrafts) : null;
  if (!previousDrafts || !nextDrafts || !previousPlans || !nextPlans || nextDrafts.storeVersion !== previousDrafts.storeVersion + 1 || nextPlans.storeVersion !== previousPlans.storeVersion + 1 || nextDrafts.idempotencyReceipts.length !== previousDrafts.idempotencyReceipts.length + 1 || nextPlans.idempotencyReceipts.length !== previousPlans.idempotencyReceipts.length + 1) return null;
  const draftReceipt = nextDrafts.idempotencyReceipts.at(-1)!;
  const planReceipt = nextPlans.idempotencyReceipts.at(-1)!;
  if (draftReceipt.action !== "upsert-dispatch-draft" || planReceipt.action !== "create-dispatch-plan" || draftReceipt.projectId !== intent.projectId || planReceipt.projectId !== intent.projectId || draftReceipt.authorizationContextHash !== intent.authorizationContextHash || planReceipt.authorizationContextHash !== intent.authorizationContextHash || draftReceipt.aggregateQueueIdempotencyKey !== intent.queueIdempotencyKey || planReceipt.aggregateQueueIdempotencyKey !== intent.queueIdempotencyKey || draftReceipt.aggregateCommandPayloadHash !== intent.commandPayloadHash || planReceipt.aggregateCommandPayloadHash !== intent.commandPayloadHash || !valuesEqual(receiptPreconditionReference(draftReceipt), receiptPreconditionReference(planReceipt)) || !valuesEqual(previousDrafts.idempotencyReceipts, nextDrafts.idempotencyReceipts.slice(0, -1)) || !valuesEqual(previousPlans.idempotencyReceipts, nextPlans.idempotencyReceipts.slice(0, -1))) return null;
  const plan = nextPlans.records.find((record) => record.id === planReceipt.recordId);
  const draftRecord = nextDrafts.records.find((record) => record.id === draftReceipt.recordId);
  const draftRevision = draftRecord?.revisions.find((revision) => revision.id === draftReceipt.revisionId && revision.version === draftReceipt.resultingRecordVersion);
  if (!plan || !draftRecord || !draftRevision || plan.target.dispatchDraftId !== draftReceipt.recordId || plan.target.dispatchDraftVersion !== draftReceipt.resultingRecordVersion || plan.target.dispatchRevisionId !== draftReceipt.revisionId || plan.target.dispatchRevisionFingerprint !== draftRevision.fingerprint || planReceipt.expectedDraftStoreVersion !== draftReceipt.resultingStoreVersion || planReceipt.expectedContactStoreVersion !== draftReceipt.expectedContactStoreVersion || plan.target.requestId !== intent.requestId || plan.target.contentApprovalId !== intent.approvalId) return null;
  const aggregateCommand = reconstructAggregateQueueCommand(planReceipt, plan, nextDrafts, dependencies);
  if (!aggregateCommand || aggregateCommand.queueIdempotencyKey !== intent.queueIdempotencyKey || procurementDispatchHash(queueCommandPayload(aggregateCommand)) !== intent.commandPayloadHash || Date.parse(intent.createdAt) <= Math.max(Date.parse(nextDrafts.updatedAt), Date.parse(nextPlans.updatedAt))) return null;
  return { previousDrafts, nextDrafts, previousPlans, nextPlans, draftReceipt, planReceipt, plan, draftRecord };
}

function resumeQueueUnlocked(getDependencies: ProcurementDispatchDependencyReader): ProcurementDispatchQueueResult {
  try {
    const intentRaw = window.localStorage.getItem(procurementDispatchQueueIntentKey);
    if (intentRaw === null) return { status: "unchanged", reason: "queue-empty" };
    const intent = parseQueueIntentRaw(intentRaw);
    const dependencies = getDependencies();
    if (!intent || !dependenciesAreValid(dependencies) || dependencies.authority.identityBindingHash !== intent.identityBindingHash || dependencies.authority.authorizationHashes[intent.projectId] !== intent.authorizationContextHash) return { status: "read-failure", reason: "queue-intent-invalid" };
    const contactRaw = window.localStorage.getItem(projectSupplierContactsStorageKey);
    if (!contactRaw || rawHash(contactRaw) !== intent.contactRawHash || window.localStorage.getItem(projectSupplierContactsCutoverMarkerKey) !== intent.contactMarkerRaw || window.localStorage.getItem(projectDispatchDraftsCutoverMarkerKey) !== intent.draftMarkerRaw || window.localStorage.getItem(projectDispatchPlanApprovalsCutoverMarkerKey) !== intent.planMarkerRaw) return { status: "read-failure", reason: "queue-dependency-changed" };
    const contacts = parseSupplierContactEnvelopeRaw(contactRaw, dependencies.authority);
    const candidates = contacts ? queueCandidatesAreValid(intent, dependencies, contacts) : null;
    if (!contacts || !candidates) return { status: "read-failure", reason: "queue-candidate-invalid" };
    const contactMarker = parseMarkerRaw(intent.contactMarkerRaw, "supplier-contact");
    const draftMarker = parseMarkerRaw(intent.draftMarkerRaw, "dispatch-draft");
    const planMarker = parseMarkerRaw(intent.planMarkerRaw, "dispatch-plan-approval");
    if (contactMarker?.state !== "committed" || draftMarker?.state !== "committed" || planMarker?.state !== "committed" || !markerBindingIsValid("supplier-contact", contactRaw, contacts, contactMarker, dependencies.authority) || !markerBindingIsValid("dispatch-draft", intent.previousDraftRaw, candidates.previousDrafts, draftMarker, dependencies.authority) || !markerBindingIsValid("dispatch-draft", intent.nextDraftRaw, candidates.nextDrafts, draftMarker, dependencies.authority) || !markerBindingIsValid("dispatch-plan-approval", intent.previousPlanRaw, candidates.previousPlans, planMarker, dependencies.authority) || !markerBindingIsValid("dispatch-plan-approval", intent.nextPlanRaw, candidates.nextPlans, planMarker, dependencies.authority)) return { status: "read-failure", reason: "queue-marker-binding-invalid" };
    const currentDraftRaw = window.localStorage.getItem(projectDispatchDraftsStorageKey);
    const currentPlanRaw = window.localStorage.getItem(projectDispatchPlanApprovalsStorageKey);
    const phasePreviousPrevious = currentDraftRaw === intent.previousDraftRaw && currentPlanRaw === intent.previousPlanRaw;
    const phaseNextPrevious = currentDraftRaw === intent.nextDraftRaw && currentPlanRaw === intent.previousPlanRaw;
    const phaseNextNext = currentDraftRaw === intent.nextDraftRaw && currentPlanRaw === intent.nextPlanRaw;
    if (!phasePreviousPrevious && !phaseNextPrevious && !phaseNextNext) return { status: "read-failure", reason: "queue-phase-invalid" };
    const queuePrecondition = receiptPreconditionReference(candidates.draftReceipt);
    if (!queuePrecondition || queueTargetDependencyHash(dependencies, intent.projectId, candidates.draftRecord.target, queuePrecondition) !== intent.targetDependencyHash) {
      if (phaseNextNext) {
        try { window.localStorage.setItem(projectDispatchPlanApprovalsStorageKey, intent.previousPlanRaw); } catch { return { status: "write-failure", drafts: candidates.nextDrafts, plans: candidates.nextPlans, reason: "queue-target-plan-rollback-failure" }; }
        if (window.localStorage.getItem(projectDispatchDraftsStorageKey) !== intent.nextDraftRaw || window.localStorage.getItem(projectDispatchPlanApprovalsStorageKey) !== intent.previousPlanRaw || window.localStorage.getItem(procurementDispatchQueueIntentKey) !== intentRaw) return { status: "read-failure", drafts: candidates.nextDrafts, plans: candidates.previousPlans, reason: "queue-target-plan-rollback-readback-failure" };
      }
      if (phaseNextPrevious || phaseNextNext) {
        try { window.localStorage.setItem(projectDispatchDraftsStorageKey, intent.previousDraftRaw); } catch { return { status: "write-failure", drafts: candidates.nextDrafts, plans: candidates.previousPlans, reason: "queue-target-draft-rollback-failure" }; }
        if (window.localStorage.getItem(projectDispatchDraftsStorageKey) !== intent.previousDraftRaw || window.localStorage.getItem(projectDispatchPlanApprovalsStorageKey) !== intent.previousPlanRaw || window.localStorage.getItem(procurementDispatchQueueIntentKey) !== intentRaw) return { status: "read-failure", drafts: candidates.previousDrafts, plans: candidates.previousPlans, reason: "queue-target-draft-rollback-readback-failure" };
      }
      window.localStorage.removeItem(procurementDispatchQueueIntentKey);
      if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null || window.localStorage.getItem(projectDispatchDraftsStorageKey) !== intent.previousDraftRaw || window.localStorage.getItem(projectDispatchPlanApprovalsStorageKey) !== intent.previousPlanRaw) return { status: "queue-blocked", drafts: candidates.previousDrafts, plans: candidates.previousPlans, reason: "queue-target-rollback-cleanup-failure" };
      return { status: "version-conflict", drafts: candidates.previousDrafts, plans: candidates.previousPlans, reason: "queue-target-dependency-changed-rolled-back" };
    }
    if (phasePreviousPrevious) {
      window.localStorage.setItem(projectDispatchDraftsStorageKey, intent.nextDraftRaw);
      if (window.localStorage.getItem(projectDispatchDraftsStorageKey) !== intent.nextDraftRaw || window.localStorage.getItem(projectDispatchPlanApprovalsStorageKey) !== intent.previousPlanRaw || window.localStorage.getItem(procurementDispatchQueueIntentKey) !== intentRaw) return { status: "write-failure", drafts: candidates.nextDrafts, plans: candidates.previousPlans, reason: "queue-draft-readback-failure" };
      return resumeQueueUnlocked(getDependencies);
    }
    if (phaseNextPrevious) {
      try { window.localStorage.setItem(projectDispatchPlanApprovalsStorageKey, intent.nextPlanRaw); } catch { return { status: "write-failure", drafts: candidates.nextDrafts, plans: candidates.previousPlans, dispatchDraftId: candidates.draftReceipt.recordId, planApprovalId: candidates.planReceipt.recordId, reason: "queue-plan-write-failure" }; }
      if (window.localStorage.getItem(projectDispatchDraftsStorageKey) !== intent.nextDraftRaw || window.localStorage.getItem(projectDispatchPlanApprovalsStorageKey) !== intent.nextPlanRaw || window.localStorage.getItem(procurementDispatchQueueIntentKey) !== intentRaw) return { status: "write-failure", drafts: candidates.nextDrafts, plans: candidates.nextPlans, reason: "queue-plan-readback-failure" };
      return resumeQueueUnlocked(getDependencies);
    }
    window.localStorage.removeItem(procurementDispatchQueueIntentKey);
    if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null || window.localStorage.getItem(projectDispatchDraftsStorageKey) !== intent.nextDraftRaw || window.localStorage.getItem(projectDispatchPlanApprovalsStorageKey) !== intent.nextPlanRaw) return { status: "queue-blocked", drafts: candidates.nextDrafts, plans: candidates.nextPlans, dispatchDraftId: candidates.draftReceipt.recordId, planApprovalId: candidates.planReceipt.recordId, reason: "queue-cleanup-failure" };
    return { status: "updated", drafts: candidates.nextDrafts, plans: candidates.nextPlans, dispatchDraftId: candidates.draftReceipt.recordId, planApprovalId: candidates.planReceipt.recordId };
  } catch { return { status: "write-failure", reason: "queue-resume-failure" }; }
}

export async function resumeProcurementDispatchQueueIntent(getDependencies: ProcurementDispatchDependencyReader): Promise<ProcurementDispatchQueueResult> {
  return withProcurementWriteLock<ProcurementDispatchQueueResult>({ status: "lock-unavailable", reason: "lock-unavailable" }, () => resumeQueueUnlocked(getDependencies));
}

export async function executeProcurementDispatchQueue(command: ProcurementDispatchQueueCommand, getDependencies: ProcurementDispatchDependencyReader): Promise<ProcurementDispatchQueueResult> {
  return withProcurementWriteLock<ProcurementDispatchQueueResult>({ status: "lock-unavailable", reason: "lock-unavailable" }, () => {
    if (!queueCommandIsValid(command)) return { status: "schema-invalid", reason: "command-invalid" };
    if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null) {
      const resumed = resumeQueueUnlocked(getDependencies);
      if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== null) return resumed;
    }
    const dependencies = getDependencies();
    if (!dependenciesAreValid(dependencies)) return { status: "read-failure", reason: "dependency-invalid" };
    const contactsMarker = committedMarkerRaw("supplier-contact", dependencies.authority);
    const contactsRaw = window.localStorage.getItem(projectSupplierContactsStorageKey);
    const contacts = parseSupplierContactEnvelopeRaw(contactsRaw, dependencies.authority);
    const draftsMarker = committedMarkerRaw("dispatch-draft", dependencies.authority);
    const draftsRaw = window.localStorage.getItem(projectDispatchDraftsStorageKey);
    const drafts = contacts ? parseDispatchDraftEnvelopeRaw(draftsRaw, dependencies, contacts) : null;
    const plansMarker = committedMarkerRaw("dispatch-plan-approval", dependencies.authority);
    const plansRaw = contacts && drafts ? window.localStorage.getItem(projectDispatchPlanApprovalsStorageKey) : null;
    const plans = contacts && drafts ? parseDispatchPlanApprovalEnvelopeRaw(plansRaw, dependencies, contacts, drafts) : null;
    if (!contactsMarker || !contactsRaw || !contacts || !draftsMarker || !draftsRaw || !drafts || !plansMarker || !plansRaw || !plans) return { status: "read-failure", reason: !contacts ? "contact-store-invalid" : !drafts ? "draft-store-invalid" : "plan-store-invalid" };
    const commandPayloadHash = procurementDispatchHash(queueCommandPayload(command));
    const aggregateReceipt = plans.idempotencyReceipts.find((receipt) => receipt.aggregateQueueIdempotencyKey === command.queueIdempotencyKey);
    if (aggregateReceipt) {
      const aggregateDraftReceipt = drafts.idempotencyReceipts.find((receipt) => receipt.aggregateQueueIdempotencyKey === command.queueIdempotencyKey);
      const aggregatePlan = plans.records.find((record) => record.id === aggregateReceipt.recordId && record.projectId === command.plan.projectId);
      const aggregateDraft = aggregatePlan ? drafts.records.find((record) => record.id === aggregatePlan.target.dispatchDraftId && record.projectId === command.draft.projectId) : null;
      const aggregateMatches = aggregateReceipt.action === "create-dispatch-plan" && aggregateReceipt.aggregateCommandPayloadHash === commandPayloadHash && aggregateReceipt.recordId === command.plan.planApprovalId
        && aggregateDraftReceipt?.action === "upsert-dispatch-draft" && aggregateDraftReceipt.aggregateCommandPayloadHash === commandPayloadHash && aggregateDraftReceipt.key === command.draft.idempotencyKey
        && aggregateDraftReceipt.recordId === command.draft.dispatchDraftId && aggregateDraft?.id === command.draft.dispatchDraftId;
      return aggregateMatches ? { status: "unchanged", drafts, plans, dispatchDraftId: aggregateDraft!.id, planApprovalId: aggregateReceipt.recordId } : { status: "idempotency-payload-mismatch", drafts, plans, reason: "aggregate-queue-idempotency-key-reused" };
    }
    const draftPayloadHash = procurementDispatchHash(draftCommandPayload(command.draft));
    const draftReceipt = drafts.idempotencyReceipts.find((receipt) => receipt.key === command.draft.idempotencyKey);
    const planReceipt = plans.idempotencyReceipts.find((receipt) => receipt.key === command.plan.idempotencyKey);
    if (draftReceipt || planReceipt) {
      const replayDraft = draftReceipt ? drafts.records.find((record) => record.id === draftReceipt.recordId && record.projectId === command.draft.projectId) : null;
      const replayRevision = replayDraft && draftReceipt ? replayDraft.revisions.find((revision) => revision.version === draftReceipt.resultingRecordVersion && revision.id === draftReceipt.revisionId) : null;
      const replayPlanCommand: DispatchPlanApprovalCommand | null = replayDraft && replayRevision && draftReceipt ? { ...command.plan, dispatchDraftId: replayDraft.id, expectedDraftStoreVersion: draftReceipt.resultingStoreVersion, expectedDraftVersion: replayRevision.version, expectedDispatchRevisionId: replayRevision.id, expectedDispatchRevisionFingerprint: replayRevision.fingerprint } : null;
      const exactPlanPayloadHash = replayPlanCommand && planCommandIsValid(replayPlanCommand) ? procurementDispatchHash(planCommandPayload(replayPlanCommand)) : null;
      const bothMatch = draftReceipt?.action === "upsert-dispatch-draft" && draftReceipt.payloadHash === draftPayloadHash && draftReceipt.recordId === command.draft.dispatchDraftId && draftReceipt.projectId === command.draft.projectId && draftReceipt.aggregateQueueIdempotencyKey === command.queueIdempotencyKey && draftReceipt.aggregateCommandPayloadHash === commandPayloadHash
        && planReceipt?.action === "create-dispatch-plan" && planReceipt.payloadHash === exactPlanPayloadHash && planReceipt.recordId === command.plan.planApprovalId && planReceipt.projectId === command.plan.projectId && planReceipt.aggregateQueueIdempotencyKey === command.queueIdempotencyKey && planReceipt.aggregateCommandPayloadHash === commandPayloadHash;
      return bothMatch ? { status: "unchanged", drafts, plans, dispatchDraftId: draftReceipt!.recordId, planApprovalId: planReceipt!.recordId } : { status: "idempotency-payload-mismatch", drafts, plans, reason: "partial-or-mismatched-queue-replay" };
    }
    const preconditionHash = procurementDispatchHash(queuePreconditionCommandPayload(command));
    const draftBuilt = buildDraftMutation(command.draft, dependencies, contacts, drafts, { idempotencyKey: command.queueIdempotencyKey, commandPayloadHash, preconditionHash });
    if (draftBuilt.status === "unchanged") return { status: "unchanged", drafts, plans, dispatchDraftId: draftBuilt.record.id, reason: "draft-already-current" };
    if (!draftBuilt.envelope || !draftBuilt.record) return { status: draftBuilt.status, drafts, plans, reason: draftBuilt.reason };
    const dispatchRevision = draftBuilt.record.revisions.at(-1)!;
    const planCommand: DispatchPlanApprovalCommand = { ...command.plan, dispatchDraftId: draftBuilt.record.id, expectedDraftStoreVersion: draftBuilt.envelope.storeVersion, expectedDraftVersion: draftBuilt.record.version, expectedDispatchRevisionId: dispatchRevision.id, expectedDispatchRevisionFingerprint: dispatchRevision.fingerprint };
    if (!planCommandIsValid(planCommand)) return { status: "schema-invalid", drafts, plans, reason: "derived-plan-command-invalid" };
    const planBuilt = buildPlanMutation(planCommand, dependencies, contacts, draftBuilt.envelope, plans, { idempotencyKey: command.queueIdempotencyKey, commandPayloadHash, preconditionHash });
    if (planBuilt.status === "unchanged") return { status: "unchanged", drafts, plans, dispatchDraftId: draftBuilt.record.id, planApprovalId: planBuilt.record.id };
    if (!planBuilt.envelope || !planBuilt.record) return { status: planBuilt.status, drafts, plans, reason: planBuilt.reason };
    const targetDependencyHash = queueTargetDependencyHash(dependencies, command.draft.projectId, draftBuilt.record.target, command.draft.precondition);
    if (!targetDependencyHash) return { status: "dependency-invalid", drafts, plans, reason: "queue-target-dependency-invalid" };
    const intent = finalizeQueueIntent({ schemaVersion: 1, operation: "commit-dispatch-draft-and-plan", id: deterministicId("dispatch-plan-queue", command.queueIdempotencyKey), commandPayloadHash, queueIdempotencyKey: command.queueIdempotencyKey, projectId: command.draft.projectId, requestId: command.draft.requestId, approvalId: command.draft.approvalId, identityBindingHash: dependencies.authority.identityBindingHash, authorizationContextHash: authorizationHash(dependencies.authority, command.draft.projectId), targetDependencyHash, contactRawHash: rawHash(contactsRaw)!, contactMarkerRaw: contactsMarker.raw, draftMarkerRaw: draftsMarker.raw, planMarkerRaw: plansMarker.raw, previousDraftRaw: draftsRaw, nextDraftRaw: JSON.stringify(draftBuilt.envelope), previousPlanRaw: plansRaw, nextPlanRaw: JSON.stringify(planBuilt.envelope), createdAt: nextTimestamp(draftBuilt.envelope.updatedAt, planBuilt.envelope.updatedAt) });
    const intentRaw = JSON.stringify(intent);
    const currentDependencies = getDependencies();
    if (!parseQueueIntentRaw(intentRaw) || window.localStorage.getItem(projectDispatchDraftsStorageKey) !== draftsRaw || window.localStorage.getItem(projectDispatchPlanApprovalsStorageKey) !== plansRaw || !dependenciesAreValid(currentDependencies) || queueTargetDependencyHash(currentDependencies, command.draft.projectId, draftBuilt.record.target, command.draft.precondition) !== targetDependencyHash) return { status: "version-conflict", drafts, plans, reason: "queue-preimage-changed" };
    try { window.localStorage.setItem(procurementDispatchQueueIntentKey, intentRaw); } catch { return { status: "write-failure", drafts, plans, reason: "queue-intent-write-failure" }; }
    if (window.localStorage.getItem(procurementDispatchQueueIntentKey) !== intentRaw) return { status: "write-failure", drafts, plans, reason: "queue-intent-readback-failure" };
    return resumeQueueUnlocked(getDependencies);
  });
}

export type ProcurementDispatchCommand = SupplierContactCommand | DispatchDraftUpsertCommand | DispatchPlanApprovalCommand;

export async function executeProcurementDispatchCommand(command: ProcurementDispatchCommand, getDependencies: ProcurementDispatchDependencyReader, getAuthority: ProcurementDispatchAuthorityReader = () => getDependencies()?.authority ?? null) {
  if ((command as SupplierContactCommand).action === "create-contact" || (command as SupplierContactCommand).action === "archive-contact" || (command as SupplierContactCommand).action === "restore-contact") return executeSupplierContactCommand(command as SupplierContactCommand, getAuthority);
  if ((command as DispatchDraftUpsertCommand).action === "upsert-dispatch-draft") return executeDispatchDraftCommand(command as DispatchDraftUpsertCommand, getDependencies);
  return executeDispatchPlanApprovalCommand(command as DispatchPlanApprovalCommand, getDependencies);
}
