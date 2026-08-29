import {
  Archive,
  ArrowUp,
  ArrowRight,
  Bell,
  Bot,
  BrainCircuit,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  CircleHelp,
  Clock3,
  FileText,
  Folder,
  Gauge,
  HardHat,
  Hammer,
  Image as ImageIcon,
  KeyRound,
  LayoutGrid,
  MapPin,
  Menu,
  MessageSquare,
  Mic,
  PackageCheck,
  Palette,
  PencilLine,
  Pin,
  Plus,
  Puzzle,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  UserPlus,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BottomSheet,
  Carousel,
  KeyboardInput,
  KeyboardTextarea,
  MobileScroll,
  useKeyboard,
  useKeyboardInsets,
} from "./mobile";

type Screen = "role" | "invite" | "phone" | "otp" | "success" | "home";
type SheetName = "supplier" | "models" | "attach" | "tools" | "build" | "brief" | "projects" | "new-project" | "settings" | null;
type ModelMode = "خودکار" | "سریع" | "عمیق";
type ChatMessage = { id: number; role: "user" | "assistant"; text: string };
type BuildStep = "define" | "preview" | "installed";
type BriefFrequency = "daily" | "weekly";
type BriefSchedule = { frequency: BriefFrequency; weekday: string; time: string };
type BuilderProject = {
  id: string;
  name: string;
  location: string;
  stage: string;
  usage: string;
  landArea: string;
  builtArea: string;
  aboveGroundFloors: string;
  basementFloors: string;
  unitCount: string;
  createdAt: string;
};
type ProjectSetupDraft = Pick<BuilderProject, "name" | "location" | "stage">;
type ProjectProfileDraft = Pick<BuilderProject, "name" | "location" | "stage" | "usage" | "landArea" | "builtArea" | "aboveGroundFloors" | "basementFloors" | "unitCount">;
type ProjectFieldErrors = Record<keyof ProjectSetupDraft, string>;
type ProjectProfileFieldErrors = Record<keyof ProjectProfileDraft, string>;
type ProjectFileCategory = "نقشه" | "پیش‌فاکتور" | "فاکتور" | "قرارداد" | "صورت‌جلسه" | "صفحه‌گسترده" | "عکس" | "سایر";
type ProjectFileRecord = {
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
  storageMode: "metadata-only" | "browser-image";
  sourceModifiedAt: string | null;
  createdAt: string;
};
type PendingProjectFile = Pick<ProjectFileRecord, "displayName" | "originalName" | "mimeType" | "size" | "category" | "source" | "sourceModifiedAt"> & {
  blob: File | null;
  previewUrl: string | null;
};
type ProjectMemoryKind = "یادداشت سازنده" | "واقعیت تأییدشده توسط سازنده";
type ProjectMemoryRecord = {
  id: string;
  projectId: string;
  title: string;
  content: string;
  kind: ProjectMemoryKind;
  source: "ثبت مستقیم شما";
  visibility: "خصوصی پروژه";
  useInContext: boolean;
  status: "ثبت محلی";
  version: 1;
  createdAt: string;
  updatedAt: string;
};
type ProjectMemoryDraft = Pick<ProjectMemoryRecord, "title" | "content" | "kind">;
type ProjectTaskStatus = "in-progress" | "completed";
type ProjectTaskEventType = "created" | "updated" | "completed" | "reopened";
type ProjectTaskEvent = {
  id: string;
  type: ProjectTaskEventType;
  actor: "شما";
  at: string;
  version: number;
};
type ProjectTaskRecord = {
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
  history: ProjectTaskEvent[];
};
type ProjectTaskDraft = Pick<ProjectTaskRecord, "title" | "currentStep"> & { dueDate: string };
type ProjectTaskFilter = "active" | "approval" | "completed" | "failed" | "monitor";
type PurchaseRequestStatus = "draft" | "ready-for-review";
type PurchaseRequestEventType = "created" | "updated" | "marked-ready-for-review" | "returned-to-draft";
type PurchaseRequestUnit = "عدد" | "کیلوگرم" | "تن" | "متر" | "مترمربع" | "مترمکعب" | "بسته" | "دستگاه";
type PurchaseRequestAlternatives = "unknown" | "allowed" | "not-allowed" | "approval-required";
type PurchaseRequestKind = "product" | "service";
type PurchaseRequestDisclosureMode = "simple" | "advanced";
type PurchaseRequestCompletionStatus = "complete" | "incomplete";
type PurchaseRequestAnswerStatus = "answered" | "explicitly-unknown" | "needs-confirmation";
type PurchaseRequestRecordSource = "ثبت مستقیم شما" | "مهاجرت محلی";
type PurchaseRequestEvent = { id: string; type: PurchaseRequestEventType; actor: "شما"; at: string; version: number };
type PurchaseRequestSubrecordEvent = { id: string; type: "created" | "updated"; actor: "شما" | "مهاجرت محلی"; at: string; version: number };
type ProductRequestItem = {
  id: string;
  name: string | null;
  quantity: string | null;
  unit: PurchaseRequestUnit | null;
  brandOrGrade: string | null;
  specification: string | null;
  alternatives: PurchaseRequestAlternatives;
  source: PurchaseRequestRecordSource;
  confidence: null;
  completionStatus: PurchaseRequestCompletionStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: PurchaseRequestSubrecordEvent[];
};
type ServiceRequestSpec = {
  id: string;
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
  source: PurchaseRequestRecordSource;
  confidence: null;
  completionStatus: PurchaseRequestCompletionStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: PurchaseRequestSubrecordEvent[];
};
type PurchaseRequestClarificationAnswer = {
  id: string;
  fieldPath: string;
  question: string;
  answer: string | null;
  status: PurchaseRequestAnswerStatus;
  source: PurchaseRequestRecordSource;
  confidence: null;
  completionStatus: PurchaseRequestCompletionStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: PurchaseRequestSubrecordEvent[];
};
type PurchaseRequestApprovalShareableField = string;
type PurchaseRequestSnapshot = {
  requestKind: PurchaseRequestKind;
  rawNeed: string;
  items: ProductRequestItem[];
  item: ProductRequestItem | null;
  service: ServiceRequestSpec | null;
  delivery: { city: "تهران"; area: string; exactAddressShared: false; neededBy: string | null };
  unresolvedTerms: { transport: string; tax: string; paymentTerms: string };
  clarificationAnswers: PurchaseRequestClarificationAnswer[];
  sharingStatus: "ارسال نشده";
};
type PurchaseRequestReviewRevision = {
  id: string;
  requestVersion: number;
  createdAt: string;
  snapshot: PurchaseRequestSnapshot;
  shareableFields: PurchaseRequestApprovalShareableField[];
  fingerprint: string;
};
type ProjectPurchaseRequestRecord = {
  schemaVersion: 2;
  id: string;
  projectId: string;
  requestKind: PurchaseRequestKind;
  rawNeed: { text: string; source: "ثبت مستقیم شما"; capturedAt: string };
  items: ProductRequestItem[];
  /** Compatibility mirror for valid v1 local records; items[] is authoritative. */
  item: ProductRequestItem | null;
  service: ServiceRequestSpec | null;
  delivery: { city: "تهران"; area: string; exactAddressShared: false; neededBy: string | null };
  unresolvedTerms: { transport: string; tax: string; paymentTerms: string };
  clarificationAnswers: PurchaseRequestClarificationAnswer[];
  reviewRevisions: PurchaseRequestReviewRevision[];
  migration: { sourceSchema: 1; unverifiedReadyVersions: number[] } | null;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  sharingStatus: "ارسال نشده";
  status: PurchaseRequestStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  readyAt: string | null;
  history: PurchaseRequestEvent[];
};
type ProductRequestItemDraft = {
  id: string;
  itemName: string;
  quantity: string;
  unit: string;
  brandOrGrade: string;
  specification: string;
  alternatives: string;
};
type PurchaseRequestDraft = {
  requestKind: PurchaseRequestKind;
  rawNeed: string;
  items: ProductRequestItemDraft[];
  serviceScope: string;
  serviceLocation: string;
  serviceSizeOrVolume: string;
  serviceQualification: string;
  serviceTiming: string;
  serviceMethod: string;
  serviceInScope: string;
  serviceOutOfScope: string;
  serviceWarranty: string;
  servicePaymentTerms: string;
  deliveryArea: string;
  neededBy: string;
  transport: string;
  tax: string;
  paymentTerms: string;
};
type PurchaseRequestFieldErrors = { rawNeed: string; quantity: string; quantityIndex: number | null; serviceScope: string; serviceLocation: string };
type ProjectApprovalStatus = "pending" | "approved" | "changes-requested";
type ProjectApprovalEventType = "created" | "approved" | "changes-requested";
type ProjectApprovalEvent = { id: string; type: ProjectApprovalEventType; actor: "شما"; at: string; version: number };
type ProjectApprovalRecord = {
  schemaVersion: 2;
  id: string;
  projectId: string;
  purpose: "review-purchase-request-version";
  target: { type: "purchase-request"; id: string; version: number; updatedAt: string; revisionId: string };
  dedupeKey: string;
  snapshot: PurchaseRequestSnapshot;
  privacySnapshot: {
    shareableFields: PurchaseRequestApprovalShareableField[];
    projectNameShared: false;
    exactAddressShared: false;
    budgetShared: false;
    filesShared: false;
    memoryShared: false;
  };
  externalEffect: "none";
  destination: null;
  sendAuthorized: false;
  status: ProjectApprovalStatus;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  requestedBy: "شما";
  decidedBy: "شما" | null;
  requestedAt: string;
  updatedAt: string;
  decidedAt: string | null;
  version: number;
  history: ProjectApprovalEvent[];
};
type SupplierContactResponseCapability = "product" | "service" | "both";
type SupplierContactStatus = "active" | "archived";
type SupplierContactEventType = "created" | "archived" | "restored";
type SupplierContactEvent = { id: string; type: SupplierContactEventType; actor: "شما"; at: string; version: number };
type SupplierContactRecord = {
  schemaVersion: 1;
  id: string;
  projectId: string;
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
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  history: SupplierContactEvent[];
};
type SupplierContactDraft = Pick<SupplierContactRecord, "displayName" | "category" | "tehranCoverage" | "responseCapability">;
type DispatchPayloadProductItem = Pick<ProductRequestItem, "name" | "quantity" | "unit" | "brandOrGrade" | "specification" | "alternatives">;
type DispatchPayloadService = Pick<ServiceRequestSpec, "scope" | "location" | "locationPrecision" | "sizeOrVolume" | "qualification" | "timing" | "method" | "inScope" | "outOfScope" | "warranty" | "paymentTerms">;
type DispatchPayload = {
  requestKind: PurchaseRequestKind;
  items: DispatchPayloadProductItem[];
  service: DispatchPayloadService | null;
  delivery: { area: string; neededBy: string | null } | null;
  unresolvedTerms: { transport: string; tax: string; paymentTerms: string } | null;
};
type InviteDraft = {
  schemaVersion: 1;
  id: string;
  projectId: string;
  supplierContactId: string;
  destination: {
    displayName: string;
    category: string;
    tehranCoverage: string;
    responseCapability: SupplierContactResponseCapability;
    networkStatus: "خارج از شبکه چیدا";
  };
  target: { requestId: string; requestVersion: number; revisionId: string; approvalId: string };
  source: "ثبت مستقیم سازنده";
  continuation: "ادامهٔ احتمالی در فاز تأمین‌کننده";
  externalEffect: "none";
  sendAuthorized: false;
  version: number;
  createdAt: string;
  updatedAt: string;
};
type DispatchPrivacySnapshot = {
  shareableFields: PurchaseRequestApprovalShareableField[];
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
type DispatchDraftRevision = {
  id: string;
  version: number;
  createdAt: string;
  recipientIds: string[];
  inviteDrafts: InviteDraft[];
  payload: DispatchPayload;
  privacySnapshot: DispatchPrivacySnapshot;
  fingerprint: string;
};
type DispatchDraftEvent = { id: string; type: "created" | "updated"; actor: "شما"; at: string; version: number };
type DispatchDraftRecord = {
  schemaVersion: 1;
  id: string;
  projectId: string;
  target: { requestId: string; requestVersion: number; revisionId: string; approvalId: string };
  dedupeKey: string;
  status: "draft";
  currentRevisionId: string;
  externalEffect: "none";
  sendAuthorized: false;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  version: number;
  createdAt: string;
  updatedAt: string;
  history: DispatchDraftEvent[];
  revisions: DispatchDraftRevision[];
};
type DispatchPlanApprovalStatus = "pending" | "approved" | "withdrawn";
type DispatchPlanApprovalEffectiveStatus = DispatchPlanApprovalStatus | "invalidated";
type DispatchPlanApprovalEventType = "created" | "approved" | "withdrawn" | "reopened";
type DispatchPlanApprovalEvent = { id: string; type: DispatchPlanApprovalEventType; actor: "شما"; at: string; version: number };
type DispatchPlanApprovalRecord = {
  schemaVersion: 1;
  id: string;
  projectId: string;
  purpose: "approve-local-dispatch-plan-simulation";
  target: {
    type: "dispatch-draft-revision";
    dispatchDraftId: string;
    dispatchDraftVersion: number;
    dispatchRevisionId: string;
    dispatchRevisionFingerprint: string;
    requestId: string;
    requestVersion: number;
    requestRevisionId: string;
    contentApprovalId: string;
  };
  snapshot: {
    recipients: Array<{
      supplierContactId: string;
      supplierContactVersion: number;
      destination: InviteDraft["destination"];
    }>;
    recipientCount: number;
    payload: DispatchPayload;
    privacySnapshot: DispatchPrivacySnapshot;
    reviewAcknowledgement: {
      destinationsReviewed: true;
      payloadReviewed: true;
      privacyAndLocationReviewed: true;
    };
  };
  planFingerprint: string;
  dedupeKey: string;
  idempotencyKey: string;
  status: DispatchPlanApprovalStatus;
  simulationOnly: true;
  externalEffect: "none";
  sendAuthorized: false;
  externalActionAttempted: false;
  actionRecord: null | {
    kind: "record-local-dispatch-plan-approval";
    result: "local-dispatch-plan-approved";
    label: "تأیید محلی برنامهٔ ارسال";
    error: null;
    recordedAt: string;
  };
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  requestedBy: "شما";
  decidedBy: "شما" | null;
  requestedAt: string;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  history: DispatchPlanApprovalEvent[];
};
type BuilderRecordedProposalLineStatus = "quoted" | "unavailable" | "alternative" | "not-mentioned";
type BuilderRecordedProposalEvent = { id: string; type: "created" | "updated"; actor: "شما"; at: string; version: number };
type BuilderRecordedProposalRequestSnapshot = {
  requestKind: PurchaseRequestKind;
  title: string;
  items: Array<{ id: string; name: string | null; quantity: string | null; unit: PurchaseRequestUnit | null }>;
  service: null | { id: string; scope: string | null; location: string | null };
};
type BuilderRecordedProposalSupplierSnapshot = {
  supplierContactId: string;
  supplierContactVersion: number;
  displayName: string;
  category: string;
  tehranCoverage: string;
  responseCapability: SupplierContactResponseCapability;
  networkStatus: "خارج از شبکه چیدا";
};
type BuilderRecordedProposalReference = {
  kind: "unattached" | "project-file-metadata";
  projectFileId: string | null;
  fileSnapshot: null | {
    id: string;
    displayName: string;
    originalName: string;
    mimeType: string;
    size: number;
    category: ProjectFileCategory;
    createdAt: string;
    storageMode: "metadata-only";
  };
  contentPersisted: false;
  extractionPerformed: false;
};
type BuilderRecordedProposalLine = {
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
type BuilderRecordedProposalRevision = {
  id: string;
  version: number;
  createdAt: string;
  declaredAt: string | null;
  transcript: string | null;
  notes: string | null;
  lines: BuilderRecordedProposalLine[];
  fingerprint: string;
};
type BuilderRecordedProposalRecord = {
  schemaVersion: 1;
  id: string;
  projectId: string;
  source: "ثبت دستی سازنده";
  networkStatus: "خارج از شبکه چیدا";
  supplierAuthenticated: false;
  receivedThroughChida: false;
  externalEffect: "none";
  target: {
    requestId: string;
    requestVersion: number;
    reviewRevisionId: string;
    reviewRevisionFingerprint: string;
    contentApprovalId: string;
    requestKind: PurchaseRequestKind;
  };
  requestSnapshot: BuilderRecordedProposalRequestSnapshot;
  supplierSnapshot: BuilderRecordedProposalSupplierSnapshot;
  reference: BuilderRecordedProposalReference;
  currentRevisionId: string;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  version: number;
  createdAt: string;
  updatedAt: string;
  history: BuilderRecordedProposalEvent[];
  revisions: BuilderRecordedProposalRevision[];
};
type BuilderRecordedProposalLineDraft = {
  id: string;
  requestItemId: string | null;
  serviceSpecId: string | null;
  requestLabel: string;
  status: BuilderRecordedProposalLineStatus;
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
type BuilderRecordedProposalDraft = {
  requestId: string;
  supplierContactId: string;
  projectFileId: string;
  declaredAt: string;
  transcript: string;
  notes: string;
  lines: BuilderRecordedProposalLineDraft[];
};
type BuilderProposalComparisonBasis = "declared-total" | "unit-price-times-adjusted-quantity" | "unknown";
type BuilderProposalComparisonTaxMode = "included" | "fixed" | "rate" | "unknown";
type BuilderProposalComparisonTransportMode = "included" | "fixed" | "unknown";
type BuilderProposalComparisonLineAdjustment = {
  proposalLineId: string;
  requestItemId: string;
  basis: BuilderProposalComparisonBasis;
  adjustedQuantity: string | null;
  adjustedQuantityUnit: string | null;
  assumption: string | null;
  source: "فرض ثبت‌شده توسط سازنده";
};
type BuilderProposalComparisonMoneyTreatment<Mode extends string> = {
  mode: Mode;
  value: string | null;
  assumption: string | null;
  source: "فرض ثبت‌شده توسط سازنده";
};
type BuilderProposalComparisonInput = {
  proposalId: string;
  proposalVersion: number;
  proposalRevisionId: string;
  proposalRevisionFingerprint: string;
  supplierSnapshot: BuilderRecordedProposalSupplierSnapshot;
  lineAdjustments: BuilderProposalComparisonLineAdjustment[];
  taxTreatment: BuilderProposalComparisonMoneyTreatment<BuilderProposalComparisonTaxMode>;
  transportTreatment: BuilderProposalComparisonMoneyTreatment<BuilderProposalComparisonTransportMode>;
};
type BuilderProposalComparisonLineResult = {
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
type BuilderProposalComparisonProposalResult = {
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
type BuilderProposalComparisonRecommendation = {
  criterion: "lowest-complete-normalized-total";
  status: "conditional" | "tie" | "insufficient-data";
  candidateProposalId: string | null;
  tiedProposalIds: string[];
  reason: string;
  source: "جمع‌بندی قاعده‌محور محلی";
};
type BuilderProposalComparisonEvent = { id: string; type: "created" | "updated"; actor: "شما"; at: string; version: number };
type BuilderProposalComparisonRevision = {
  id: string;
  version: number;
  createdAt: string;
  inputs: BuilderProposalComparisonInput[];
  results: BuilderProposalComparisonProposalResult[];
  recommendation: BuilderProposalComparisonRecommendation;
  fingerprint: string;
};
type BuilderProposalComparisonRecord = {
  schemaVersion: 1;
  id: string;
  projectId: string;
  purpose: "compare-builder-recorded-product-proposals";
  target: {
    requestId: string;
    requestVersion: number;
    reviewRevisionId: string;
    reviewRevisionFingerprint: string;
    requestKind: "product";
  };
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
  history: BuilderProposalComparisonEvent[];
  revisions: BuilderProposalComparisonRevision[];
};
type BuilderProposalComparisonLineAdjustmentDraft = {
  proposalLineId: string;
  requestItemId: string;
  basis: BuilderProposalComparisonBasis;
  adjustedQuantity: string;
  adjustedQuantityUnit: string;
  assumption: string;
};
type BuilderProposalComparisonProposalDraft = {
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
type BuilderProposalComparisonDraft = {
  requestKey: string;
  proposals: BuilderProposalComparisonProposalDraft[];
};
type BuilderProposalComparisonDecisionOutcome = "preferred-for-follow-up" | "needs-clarification" | "no-selection";
type BuilderProposalComparisonDecisionRevision = {
  id: string;
  version: number;
  createdAt: string;
  outcome: BuilderProposalComparisonDecisionOutcome;
  selectedProposalId: string | null;
  reason: string;
  fingerprint: string;
};
type BuilderProposalComparisonDecisionEvent = { id: string; type: "created" | "updated"; actor: "شما"; at: string; version: number };
type BuilderProposalComparisonDecisionRecord = {
  schemaVersion: 1;
  id: string;
  projectId: string;
  purpose: "record-local-proposal-comparison-decision";
  target: {
    comparisonId: string;
    comparisonVersion: number;
    comparisonRevisionId: string;
    comparisonRevisionFingerprint: string;
  };
  currentRevisionId: string;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  externalEffect: "none";
  sendAuthorized: false;
  purchaseAuthorized: false;
  supplierNotified: false;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: BuilderProposalComparisonDecisionEvent[];
  revisions: BuilderProposalComparisonDecisionRevision[];
};
type BuilderProposalComparisonDecisionDraft = {
  outcome: BuilderProposalComparisonDecisionOutcome;
  selectedProposalId: string;
  reason: string;
};
type BuilderServiceProposalComparisonCriterionId = "scope" | "location" | "size-or-volume" | "qualification" | "timing" | "method" | "in-scope" | "out-of-scope" | "warranty" | "payment-terms";
type BuilderServiceProposalComparisonAssessment = "aligned" | "partial" | "different" | "unknown" | "not-applicable";
type BuilderServiceProposalComparisonRequestSnapshot = {
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
type BuilderServiceProposalComparisonCriterionInput = {
  criterionId: BuilderServiceProposalComparisonCriterionId;
  declaredValue: string | null;
  assessment: BuilderServiceProposalComparisonAssessment;
  rationale: string | null;
  declaredSource: "رونویسی تکمیلی سازنده برای مقایسه";
  assessmentSource: "ارزیابی سازنده";
};
type BuilderServiceProposalComparisonInput = {
  proposalId: string;
  proposalVersion: number;
  proposalRevisionId: string;
  proposalRevisionFingerprint: string;
  proposalLineId: string;
  serviceSpecId: string;
  supplierSnapshot: BuilderRecordedProposalSupplierSnapshot;
  criteria: BuilderServiceProposalComparisonCriterionInput[];
};
type BuilderServiceProposalComparisonCriterionResult = BuilderServiceProposalComparisonCriterionInput & {
  requestValue: string | null;
  status: "assessed" | "unknown";
};
type BuilderServiceProposalComparisonProposalResult = {
  proposalId: string;
  supplierDisplayName: string;
  declaredCommercialSnapshot: BuilderRecordedProposalLine;
  criteria: BuilderServiceProposalComparisonCriterionResult[];
  counts: { aligned: number; partial: number; different: number; unknown: number; notApplicable: number };
  coverage: "complete" | "incomplete";
  source: "ماتریس ساختاریافتهٔ محلی چیدا";
};
type BuilderServiceProposalComparisonSummary = {
  formulaVersion: "service-coverage-v1";
  criterion: "all-service-criteria-reviewed";
  status: "ready-for-human-decision" | "needs-clarification";
  candidateProposalId: null;
  unknownCount: number;
  reasonCode: "criteria-need-clarification" | "all-criteria-reviewed";
  reason: string;
  source: "جمع‌بندی قاعده‌محور محلی";
};
type BuilderServiceProposalComparisonEvent = { id: string; type: "created" | "updated"; actor: "شما"; at: string; version: number };
type BuilderServiceProposalComparisonRevision = {
  id: string;
  version: number;
  createdAt: string;
  inputs: BuilderServiceProposalComparisonInput[];
  results: BuilderServiceProposalComparisonProposalResult[];
  summary: BuilderServiceProposalComparisonSummary;
  fingerprint: string;
};
type BuilderServiceProposalComparisonRecord = {
  schemaVersion: 1;
  id: string;
  projectId: string;
  purpose: "compare-builder-recorded-service-proposals";
  target: {
    requestId: string;
    requestVersion: number;
    reviewRevisionId: string;
    reviewRevisionFingerprint: string;
    requestKind: "service";
  };
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
  history: BuilderServiceProposalComparisonEvent[];
  revisions: BuilderServiceProposalComparisonRevision[];
};
type BuilderServiceProposalComparisonCriterionDraft = {
  criterionId: BuilderServiceProposalComparisonCriterionId;
  declaredValue: string;
  assessment: BuilderServiceProposalComparisonAssessment;
  rationale: string;
};
type BuilderServiceProposalComparisonProposalDraft = {
  proposalId: string;
  selected: boolean;
  criteria: BuilderServiceProposalComparisonCriterionDraft[];
};
type BuilderServiceProposalComparisonDraft = {
  requestKey: string;
  proposals: BuilderServiceProposalComparisonProposalDraft[];
};
type BuilderServiceProposalComparisonDecisionOutcome = "preferred-for-follow-up" | "needs-clarification" | "no-selection";
type BuilderServiceProposalComparisonDecisionRevision = {
  id: string;
  version: number;
  createdAt: string;
  outcome: BuilderServiceProposalComparisonDecisionOutcome;
  selectedProposalId: string | null;
  reason: string;
  fingerprint: string;
};
type BuilderServiceProposalComparisonDecisionEvent = { id: string; type: "created" | "updated"; actor: "شما"; at: string; version: number };
type BuilderServiceProposalComparisonDecisionRecord = {
  schemaVersion: 1;
  id: string;
  projectId: string;
  purpose: "record-local-service-proposal-comparison-decision";
  target: {
    comparisonId: string;
    comparisonVersion: number;
    comparisonRevisionId: string;
    comparisonRevisionFingerprint: string;
  };
  currentRevisionId: string;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  externalEffect: "none";
  sendAuthorized: false;
  purchaseAuthorized: false;
  supplierNotified: false;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: BuilderServiceProposalComparisonDecisionEvent[];
  revisions: BuilderServiceProposalComparisonDecisionRevision[];
};
type BuilderServiceProposalComparisonDecisionDraft = {
  outcome: BuilderServiceProposalComparisonDecisionOutcome;
  selectedProposalId: string;
  reason: string;
};
type BuilderNegotiationDraftComparisonKind = "product" | "service";
type BuilderNegotiationDraftCriterionKind = "product-line" | "service-criterion";
type BuilderNegotiationDraftTarget = {
  comparisonKind: BuilderNegotiationDraftComparisonKind;
  comparisonId: string;
  comparisonVersion: number;
  comparisonRevisionId: string;
  comparisonRevisionFingerprint: string;
  requestId: string;
  requestVersion: number;
  reviewRevisionId: string;
  reviewRevisionFingerprint: string;
  proposalId: string;
  proposalVersion: number;
  proposalRevisionId: string;
  proposalRevisionFingerprint: string;
  proposalLineId: string;
  criterionKind: BuilderNegotiationDraftCriterionKind;
  criterionId: string;
  criterionLabel: string;
  supplierSnapshot: BuilderRecordedProposalSupplierSnapshot;
};
type BuilderNegotiationDraftRevision = {
  id: string;
  version: number;
  createdAt: string;
  purpose: string;
  message: string;
  fingerprint: string;
};
type BuilderNegotiationDraftEvent = { id: string; type: "created" | "updated"; actor: "شما"; at: string; version: number };
type BuilderNegotiationDraftRecord = {
  schemaVersion: 1;
  id: string;
  projectId: string;
  purpose: "record-local-post-proposal-negotiation-question";
  status: "draft";
  target: BuilderNegotiationDraftTarget;
  source: "ثبت مستقیم سازنده";
  visibility: "خصوصی پروژه";
  localStatus: "پیش‌نویس محلی";
  externalEffect: "none";
  networkUsed: false;
  aiUsed: false;
  sendAuthorized: false;
  supplierNotified: false;
  sharedWithSupplier: false;
  externalActionAttempted: false;
  currentRevisionId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: BuilderNegotiationDraftEvent[];
  revisions: BuilderNegotiationDraftRevision[];
};
type BuilderNegotiationDraftForm = { targetKey: string; purpose: string; message: string };
type BuilderNegotiationDraftTargetOption = {
  key: string;
  target: BuilderNegotiationDraftTarget;
  comparisonLabel: string;
  supplierLabel: string;
  criterionState: string;
  sourceCreatedAt: string;
};
type BuilderManualNegotiationResponseTarget = {
  negotiationDraftId: string;
  negotiationDraftRevisionId: string;
  negotiationDraftRevisionVersion: number;
  negotiationDraftRevisionFingerprint: string;
};
type BuilderManualNegotiationResponseQuestionSnapshot = {
  purpose: string;
  message: string;
  createdAt: string;
  negotiationTarget: BuilderNegotiationDraftTarget;
};
type BuilderManualNegotiationResponseRevision = {
  id: string;
  version: number;
  createdAt: string;
  responseText: string;
  fingerprint: string;
};
type BuilderManualNegotiationResponseEvent = { id: string; type: "created" | "updated"; actor: "شما"; at: string; version: number };
type BuilderManualNegotiationResponseRecord = {
  schemaVersion: 1;
  id: string;
  projectId: string;
  purpose: "record-local-builder-transcribed-negotiation-response";
  status: "local-transcription";
  target: BuilderManualNegotiationResponseTarget;
  questionSnapshot: BuilderManualNegotiationResponseQuestionSnapshot;
  source: "ثبت دستی سازنده";
  networkStatus: "خارج از شبکه چیدا";
  supplierAuthenticated: false;
  authenticityVerified: false;
  questionSentThroughChida: false;
  receivedThroughChida: false;
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  externalEffect: "none";
  networkUsed: false;
  aiUsed: false;
  sendAuthorized: false;
  supplierNotified: false;
  sharedWithSupplier: false;
  externalActionAttempted: false;
  currentRevisionId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: BuilderManualNegotiationResponseEvent[];
  revisions: BuilderManualNegotiationResponseRevision[];
};
type BuilderManualNegotiationResponseForm = { responseText: string };
type BuilderManualNegotiationResponseReviewOutcome = "appears-addressed" | "needs-clarification" | "potential-conflict";
type BuilderManualNegotiationResponseReviewTarget = {
  manualNegotiationResponseId: string;
  manualNegotiationResponseRevisionId: string;
  manualNegotiationResponseRevisionVersion: number;
  manualNegotiationResponseRevisionFingerprint: string;
};
type BuilderManualNegotiationResponseReviewRevision = {
  id: string;
  version: number;
  createdAt: string;
  outcome: BuilderManualNegotiationResponseReviewOutcome;
  reason: string;
  fingerprint: string;
};
type BuilderManualNegotiationResponseReviewEvent = { id: string; type: "created" | "updated"; actor: "شما"; at: string; version: number };
type BuilderManualNegotiationResponseReviewRecord = {
  schemaVersion: 1;
  id: string;
  projectId: string;
  purpose: "record-local-builder-manual-response-review";
  status: "manual-review";
  target: BuilderManualNegotiationResponseReviewTarget;
  source: "بازبینی مستقیم سازنده";
  reviewMethod: "manual";
  visibility: "خصوصی پروژه";
  localStatus: "ثبت محلی";
  automatedDetectionUsed: false;
  aiUsed: false;
  networkUsed: false;
  authenticityVerified: false;
  externalEffect: "none";
  sendAuthorized: false;
  supplierNotified: false;
  sharedWithSupplier: false;
  externalActionAttempted: false;
  currentRevisionId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: BuilderManualNegotiationResponseReviewEvent[];
  revisions: BuilderManualNegotiationResponseReviewRevision[];
};
type BuilderManualNegotiationResponseReviewForm = { outcome: BuilderManualNegotiationResponseReviewOutcome | ""; reason: string };
type MockSourceKind = "فایل پروژهٔ ساختگی" | "وب رسمی ساختگی";
type MockSourceRecord = {
  id: string;
  index: string;
  kind: MockSourceKind;
  isMock: true;
  title: string;
  publisher: string;
  documentVersion: string;
  sourceDate: string;
  locator: string;
  geography: string;
  validity: string;
  excerpt: string;
  retrievedAt: null;
  url: null;
};
type MockSourceClaim = { id: string; text: string; sourceIds: readonly string[] };
type MockSourceAnswerDemo = {
  schemaVersion: 1;
  id: string;
  kind: "mock";
  isMock: true;
  readonly: true;
  persisted: false;
  belongsToProject: false;
  preparedAt: string;
  question: string;
  claims: readonly MockSourceClaim[];
  sources: readonly MockSourceRecord[];
};
type HomeView = "chat" | "project" | "files" | "gallery" | "memory" | "search" | "tasks" | "source-demo" | "purchase-requests" | "proposals";
type FilesReturnView = "chat" | "project" | "search";
type MemoryReturnView = "project" | "search";
type PurchaseRequestsReturnView = "chat" | "project";
type ProposalsReturnView = "chat" | "project";
type ProjectTasksLaunch = { filter: ProjectTaskFilter; approvalId: string | null; returnToPurchaseRequestId: string | null };
type StoredProjectImage = { id: string; projectId: string; originalName: string; mimeType: string; blob: Blob };
type LocalRecordsReadResult<RecordType> = { records: RecordType[]; readError: boolean };

const defaultInvite = "CHD-4K9P";
const defaultPhone = "09123456789";
const defaultOtp = "123456";
const installedToolStorageKey = "chida-prototype-installed-tool";
const briefStorageKey = "chida-prototype-brief";
const legacyProjectsStorageKey = "chida-prototype-builder-projects";
const projectsStorageKey = "chida-prototype-builder-projects:v2";
const activeProjectStorageKey = "chida-prototype-active-project";
const projectFilesStorageKey = "chida-prototype-project-files:v1";
const projectMemoriesStorageKey = "chida-prototype-project-memories:v1";
const projectTasksStorageKey = "chida-prototype-project-tasks:v1";
const projectPurchaseRequestsStorageKey = "chida-prototype-project-purchase-requests:v1";
const projectApprovalsStorageKey = "chida-prototype-project-approvals:v1";
const projectSupplierContactsStorageKey = "chida-prototype-project-supplier-contacts:v1";
const projectDispatchDraftsStorageKey = "chida-prototype-project-dispatch-drafts:v1";
const projectDispatchPlanApprovalsStorageKey = "chida-prototype-project-dispatch-plan-approvals:v1";
const projectBuilderRecordedProposalsStorageKey = "chida-prototype-builder-recorded-proposals:v1";
const projectBuilderProposalComparisonsStorageKey = "chida-prototype-builder-proposal-comparisons:v1";
const projectBuilderProposalComparisonDecisionsStorageKey = "chida-prototype-builder-proposal-comparison-decisions:v1";
const projectBuilderServiceProposalComparisonsStorageKey = "chida-prototype-builder-service-proposal-comparisons:v1";
const projectBuilderServiceProposalComparisonDecisionsStorageKey = "chida-prototype-builder-service-proposal-comparison-decisions:v1";
const projectBuilderNegotiationDraftsStorageKey = "chida-prototype-builder-negotiation-drafts:v1";
const projectBuilderManualNegotiationResponsesStorageKey = "chida-prototype-builder-manual-negotiation-responses:v1";
const projectBuilderManualNegotiationResponseReviewsStorageKey = "chida-prototype-builder-manual-negotiation-response-reviews:v1";
const projectImagesDatabaseName = "chida-prototype-project-images:v1";
const projectImagesStoreName = "images";
const projectStages = [
  "طراحی و اخذ مجوز",
  "تخریب و گودبرداری",
  "فونداسیون",
  "اسکلت بندی",
  "دیوارچینی و سفت کاری",
  "گچ و خاک و تاسیسات",
  "نازک کاری و نما",
  "ظریف کاری و نصبیات",
  "پایان کار",
] as const;
type ProjectStage = (typeof projectStages)[number];
const legacyProjectStageAliases: Readonly<Record<string, ProjectStage>> = {
  "طراحی و مجوز": "طراحی و اخذ مجوز",
  "گودبرداری": "تخریب و گودبرداری",
  "اسکلت": "اسکلت بندی",
  "اسکلت‌بندی": "اسکلت بندی",
  "سفت‌کاری": "دیوارچینی و سفت کاری",
  "سفت کاری": "دیوارچینی و سفت کاری",
  "نازک‌کاری": "نازک کاری و نما",
  "نازک کاری": "نازک کاری و نما",
  "تکمیل و تحویل": "پایان کار",
};
const projectUsages = ["مسکونی", "تجاری", "اداری", "مختلط", "سایر"] as const;
const projectFileCategories: readonly ProjectFileCategory[] = ["نقشه", "پیش‌فاکتور", "فاکتور", "قرارداد", "صورت‌جلسه", "صفحه‌گسترده", "عکس", "سایر"];
const projectMemoryKinds: readonly ProjectMemoryKind[] = ["یادداشت سازنده", "واقعیت تأییدشده توسط سازنده"];
const purchaseRequestUnits: readonly PurchaseRequestUnit[] = ["عدد", "کیلوگرم", "تن", "متر", "مترمربع", "مترمکعب", "بسته", "دستگاه"];
const purchaseRequestAlternativeLabels = ["نامشخص", "مجاز", "غیرمجاز", "فقط با تأیید من"] as const;
const supplierContactResponseCapabilities: readonly { id: SupplierContactResponseCapability; label: string }[] = [
  { id: "product", label: "محصول" },
  { id: "service", label: "خدمت" },
  { id: "both", label: "محصول و خدمت" },
];
const builderRecordedProposalLineStatuses: readonly { id: BuilderRecordedProposalLineStatus; label: string }[] = [
  { id: "quoted", label: "قیمت داده شده" },
  { id: "alternative", label: "جایگزین پیشنهاد شده" },
  { id: "unavailable", label: "ناموجود اعلام شده" },
  { id: "not-mentioned", label: "ذکر نشده" },
];
const builderServiceProposalComparisonCriteriaV1: readonly { id: BuilderServiceProposalComparisonCriterionId; label: string; requestField: keyof Omit<BuilderServiceProposalComparisonRequestSnapshot, "id"> }[] = [
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
const projectFileExtensionPattern = /\.(?:pdf|png|jpe?g|webp|heic|heif|xls|xlsx|csv|doc|docx)$/i;
const projectImageExtensionPattern = /\.(?:png|jpe?g|webp|heic|heif)$/i;
const projectFileAccept = ".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif,.xls,.xlsx,.csv,.doc,.docx";
const projectImageAccept = "image/png,image/jpeg,image/webp,.heic,.heif";
const emptyProjectProfile = {
  usage: "",
  landArea: "",
  builtArea: "",
  aboveGroundFloors: "",
  basementFloors: "",
  unitCount: "",
} as const;
const emptyProjectProfileErrors: ProjectProfileFieldErrors = {
  name: "",
  location: "",
  stage: "",
  usage: "",
  landArea: "",
  builtArea: "",
  aboveGroundFloors: "",
  basementFloors: "",
  unitCount: "",
};

const quickActions = [
  { id: "purchase-request", label: "درخواست قیمت", icon: FileText },
  { id: "compare-offers", label: "بررسی پیشنهادها", icon: Search },
  { id: "meeting-notes", label: "صورت‌جلسه", icon: CheckCircle2 },
  { id: "purchase-plan", label: "برنامه خرید", icon: LayoutGrid },
];

const mockSourceAnswerDemo = {
  schemaVersion: 1,
  id: "mock-source-answer-alpha-v1",
  kind: "mock",
  isMock: true,
  readonly: true,
  persisted: false,
  belongsToProject: false,
  preparedAt: "۲۷ مرداد ۱۴۰۵ · تاریخ نمونه",
  question: "برای اجرای عایق نمایشی «آلفا» در هوای سرد چه محدودیتی داریم؟",
  claims: [
    { id: "mock-claim-temperature", text: "هر دو منبع ساختگی برای دمای اجرا محدودیت نشان می‌دهند.", sourceIds: ["mock-file-alpha", "mock-web-cold-weather"] },
    { id: "mock-claim-conflict", text: "اعداد ۸ درجه و بازهٔ ۵ تا ۳۵ درجه فقط برای نمایش ارجاع ساخته شده‌اند؛ ساختگی و برای اجرا نامعتبرند.", sourceIds: ["mock-file-alpha", "mock-web-cold-weather"] },
  ],
  sources: [
    {
      id: "mock-file-alpha",
      index: "۱",
      kind: "فایل پروژهٔ ساختگی",
      isMock: true,
      title: "راهنمای فرضی اجرای عایق آلفا",
      publisher: "تولیدکنندهٔ فرضی آلفا",
      documentVersion: "نسخهٔ سند نمونه ۲.۱",
      sourceDate: "۱۵ مرداد ۱۴۰۵ · تاریخ نمونه",
      locator: "صفحهٔ ساختگی ۱۲ · بند ۳",
      geography: "تهران · محدودهٔ نمونه",
      validity: "فقط نمایش رابط · فاقد اعتبار اجرایی",
      excerpt: "در این منبع ساختگی، دمای سطح کمتر از ۸ درجه مجاز نیست. عدد ۸ درجه ساختگی و برای اجرا نامعتبر است.",
      retrievedAt: null,
      url: null,
    },
    {
      id: "mock-web-cold-weather",
      index: "۲",
      kind: "وب رسمی ساختگی",
      isMock: true,
      title: "راهنمای نمونهٔ کار در هوای سرد",
      publisher: "مرجع رسمی ساختگی چیدا",
      documentVersion: "بازبینی نمونهٔ ۱۴۰۵/۰۵",
      sourceDate: "۲۰ مرداد ۱۴۰۵ · تاریخ نمونه",
      locator: "بخش ساختگی ۴.۲",
      geography: "تهران · محدودهٔ نمونه",
      validity: "فقط نمایش رابط · فاقد اعتبار اجرایی",
      excerpt: "در این منبع ساختگی، اجرای محصول در بازهٔ ۵ تا ۳۵ درجه آمده است. این بازه ساختگی و برای اجرا نامعتبر است.",
      retrievedAt: null,
      url: null,
    },
  ],
} satisfies MockSourceAnswerDemo;

function isValidMockSourceAnswerDemo(answer: MockSourceAnswerDemo) {
  const sourceIds = answer.sources.map((source) => source.id);
  const uniqueSourceIds = new Set(sourceIds);
  return answer.schemaVersion === 1
    && answer.kind === "mock"
    && answer.isMock === true
    && answer.readonly === true
    && answer.persisted === false
    && answer.belongsToProject === false
    && sourceIds.length > 0
    && uniqueSourceIds.size === sourceIds.length
    && answer.sources.every((source) => source.isMock === true && source.url === null && source.retrievedAt === null)
    && answer.claims.every((claim) => claim.sourceIds.length > 0 && claim.sourceIds.every((sourceId) => uniqueSourceIds.has(sourceId)));
}
const projectTaskFilters: readonly { id: ProjectTaskFilter; label: string }[] = [
  { id: "active", label: "در حال انجام" },
  { id: "approval", label: "منتظر تأیید" },
  { id: "completed", label: "تمام‌شده" },
  { id: "failed", label: "ناموفق" },
  { id: "monitor", label: "پایش‌ها" },
];
const projectTaskEmptyCopy: Readonly<Record<ProjectTaskFilter, { title: string; description: string }>> = {
  active: { title: "هنوز کار در حال انجامی ثبت نشده", description: "یک وظیفهٔ داخلی برای همین پروژه ثبت کن تا بیرون از تاریخچهٔ گفتگو قابل پیگیری بماند." },
  approval: { title: "نسخه‌ای منتظر تأیید نیست", description: "وقتی یک درخواست آمادهٔ بازبینی را صریحاً برای تأیید ثبت کنی، همان نسخه اینجا ظاهر می‌شود." },
  completed: { title: "هنوز کار یا تصمیمی تمام نشده", description: "کارهای تکمیل‌شده و تصمیم‌های ثبت‌شده با نسخه و تاریخچهٔ واقعی در این بخش می‌مانند." },
  failed: { title: "کار ناموفقی ثبت نشده", description: "خطا و تلاش دوباره فقط برای اجرای واقعی ثبت می‌شوند؛ شکست مصنوعی نمایش داده نمی‌شود." },
  monitor: { title: "پایش واقعی هنوز به این مرکز وصل نیست", description: "پایش و اعلان زمان‌دار در تسک مستقل و پس از اتصال اجرای واقعی اضافه می‌شوند." },
};
function emptyProductRequestItemDraft(id = ""): ProductRequestItemDraft {
  return { id, itemName: "", quantity: "", unit: "", brandOrGrade: "", specification: "", alternatives: "نامشخص" };
}

const emptyPurchaseRequestDraft: PurchaseRequestDraft = {
  requestKind: "product",
  rawNeed: "",
  items: [emptyProductRequestItemDraft()],
  serviceScope: "",
  serviceLocation: "",
  serviceSizeOrVolume: "",
  serviceQualification: "",
  serviceTiming: "",
  serviceMethod: "",
  serviceInScope: "",
  serviceOutOfScope: "",
  serviceWarranty: "",
  servicePaymentTerms: "",
  deliveryArea: "",
  neededBy: "",
  transport: "",
  tax: "",
  paymentTerms: "",
};
const emptyPurchaseRequestFieldErrors: PurchaseRequestFieldErrors = {
  rawNeed: "",
  quantity: "",
  quantityIndex: null,
  serviceScope: "",
  serviceLocation: "",
};
const emptySupplierContactDraft: SupplierContactDraft = {
  displayName: "",
  category: "",
  tehranCoverage: "",
  responseCapability: "both",
};

function purchaseRequestAlternativesFromLabel(label: string): PurchaseRequestAlternatives {
  if (label === "مجاز") return "allowed";
  if (label === "غیرمجاز") return "not-allowed";
  if (label === "فقط با تأیید من") return "approval-required";
  return "unknown";
}

function purchaseRequestAlternativesLabel(value: PurchaseRequestAlternatives) {
  if (value === "allowed") return "مجاز";
  if (value === "not-allowed") return "غیرمجاز";
  if (value === "approval-required") return "فقط با تأیید من";
  return "نامشخص";
}

function purchaseRequestDraftFromRecord(request: ProjectPurchaseRequestRecord): PurchaseRequestDraft {
  return {
    requestKind: request.requestKind,
    rawNeed: request.rawNeed.text,
    items: request.items.map((item) => ({
      id: item.id,
      itemName: item.name ?? "",
      quantity: item.quantity ?? "",
      unit: item.unit ?? "",
      brandOrGrade: item.brandOrGrade ?? "",
      specification: item.specification ?? "",
      alternatives: purchaseRequestAlternativesLabel(item.alternatives),
    })),
    serviceScope: request.service?.scope ?? "",
    serviceLocation: request.service?.location ?? "",
    serviceSizeOrVolume: request.service?.sizeOrVolume ?? "",
    serviceQualification: request.service?.qualification ?? "",
    serviceTiming: request.service?.timing ?? "",
    serviceMethod: request.service?.method ?? "",
    serviceInScope: request.service?.inScope ?? "",
    serviceOutOfScope: request.service?.outOfScope ?? "",
    serviceWarranty: request.service?.warranty ?? "",
    servicePaymentTerms: request.service?.paymentTerms ?? "",
    deliveryArea: request.delivery.area === "نامشخص" ? "" : request.delivery.area,
    neededBy: request.delivery.neededBy ?? "",
    transport: request.unresolvedTerms.transport === "unknown" ? "" : request.unresolvedTerms.transport,
    tax: request.unresolvedTerms.tax === "unknown" ? "" : request.unresolvedTerms.tax,
    paymentTerms: request.unresolvedTerms.paymentTerms === "unknown" ? "" : request.unresolvedTerms.paymentTerms,
  };
}

function purchaseRequestMissingFields(request: ProjectPurchaseRequestRecord) {
  const missingFields: string[] = [];
  if (request.requestKind === "product") {
    request.items.forEach((item, index) => {
      const prefix = request.items.length > 1 ? `قلم ${index + 1}: ` : "";
      if (!item.name) missingFields.push(`${prefix}نام قلم`);
      if (!item.quantity) missingFields.push(`${prefix}مقدار`);
      if (!item.unit) missingFields.push(`${prefix}واحد`);
    });
    if (request.items.length === 0) missingFields.push("حداقل یک قلم");
    if (!request.delivery.area) missingFields.push("محدودهٔ تحویل");
  } else {
    if (!request.service?.scope) missingFields.push("دامنهٔ خدمت");
    if (!request.service?.location) missingFields.push("موقعیت مجاز خدمت");
  }
  return missingFields;
}

function purchaseRequestStatusLabel(status: PurchaseRequestStatus) {
  return status === "ready-for-review" ? "آمادهٔ بازبینی" : "پیش‌نویس";
}

function purchaseRequestEventLabel(type: PurchaseRequestEventType) {
  if (type === "updated") return "پیش‌نویس ویرایش شد";
  if (type === "marked-ready-for-review") return "برای بازبینی آماده شد";
  if (type === "returned-to-draft") return "به ویرایش برگشت";
  return "پیش‌نویس ساخته شد";
}

function purchaseRequestDisplayTitle(request: ProjectPurchaseRequestRecord) {
  if (request.requestKind === "service") return request.service?.scope ?? request.rawNeed.text;
  const firstItemName = request.items[0]?.name;
  return request.items.length > 1 && firstItemName ? `${firstItemName} + ${request.items.length - 1} قلم` : firstItemName ?? request.rawNeed.text;
}

function purchaseRequestSnapshotTitle(snapshot: PurchaseRequestSnapshot) {
  if (snapshot.requestKind === "service") return snapshot.service?.scope ?? snapshot.rawNeed;
  const firstItemName = snapshot.items[0]?.name;
  return snapshot.items.length > 1 && firstItemName ? `${firstItemName} + ${snapshot.items.length - 1} قلم` : firstItemName ?? snapshot.rawNeed;
}

function normalizeOptionalPurchaseRequestText(value: string) {
  const normalized = value.trim();
  return hasVisibleProjectTaskText(normalized) ? normalized : null;
}

function projectApprovalStatusLabel(status: ProjectApprovalStatus) {
  if (status === "approved") return "نسخهٔ درخواست تأیید شد";
  if (status === "changes-requested") return "نیاز به اصلاح";
  return "منتظر تأیید";
}

function projectApprovalEventLabel(type: ProjectApprovalEventType) {
  if (type === "approved") return "نسخهٔ درخواست تأیید شد";
  if (type === "changes-requested") return "نیاز به اصلاح ثبت شد";
  return "برای تأیید ثبت شد";
}

function purchaseRequestApprovalDedupeKey(projectId: string, requestId: string, requestVersion: number) {
  return `${projectId}:${requestId}:${requestVersion}:review-purchase-request-version`;
}

function purchaseRequestApprovalShareableFields(request: Pick<ProjectPurchaseRequestRecord, "requestKind" | "items" | "service">): PurchaseRequestApprovalShareableField[] {
  if (request.requestKind === "service") {
    return [
      "service.scope",
      "service.location",
      "service.locationPrecision",
      "service.sizeOrVolume",
      "service.qualification",
      "service.timing",
      "service.method",
      "service.inScope",
      "service.outOfScope",
      "service.warranty",
      "service.paymentTerms",
    ];
  }
  return request.items.flatMap((item, index) => [
    `items.${index}.name`,
    `items.${index}.quantity`,
    `items.${index}.unit`,
    `items.${index}.brandOrGrade`,
    `items.${index}.specification`,
    `items.${index}.alternatives`,
  ]).concat([
    "delivery.area",
    "delivery.neededBy",
    "unresolvedTerms.transport",
    "unresolvedTerms.tax",
    "unresolvedTerms.paymentTerms",
  ]);
}

function purchaseRequestApprovalSnapshot(request: ProjectPurchaseRequestRecord): PurchaseRequestSnapshot {
  return {
    requestKind: request.requestKind,
    rawNeed: request.rawNeed.text,
    items: structuredClone(request.items),
    item: request.item ? structuredClone(request.item) : null,
    service: request.service ? structuredClone(request.service) : null,
    delivery: { ...request.delivery },
    unresolvedTerms: { ...request.unresolvedTerms },
    clarificationAnswers: structuredClone(request.clarificationAnswers),
    sharingStatus: "ارسال نشده",
  };
}

function stablePurchaseRequestValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stablePurchaseRequestValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([first], [second]) => first.localeCompare(second)).map(([key, item]) => [key, stablePurchaseRequestValue(item)]));
  }
  return value;
}

function purchaseRequestStableHash(serialized: string) {
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function purchaseRequestRevisionFingerprint(snapshot: PurchaseRequestSnapshot, shareableFields: PurchaseRequestApprovalShareableField[]) {
  const serialized = JSON.stringify(stablePurchaseRequestValue({ snapshot, shareableFields }));
  return `fnv1a-${purchaseRequestStableHash(serialized)}`;
}

function approvalSnapshotMatchesRevision(approval: ProjectApprovalRecord, request: ProjectPurchaseRequestRecord) {
  const revision = request.reviewRevisions.find((item) => item.id === approval.target.revisionId && item.requestVersion === approval.target.version);
  return Boolean(revision)
    && approval.target.updatedAt === revision!.createdAt
    && revision!.fingerprint === purchaseRequestRevisionFingerprint(revision!.snapshot, revision!.shareableFields)
    && JSON.stringify(stablePurchaseRequestValue(approval.snapshot)) === JSON.stringify(stablePurchaseRequestValue(revision!.snapshot))
    && JSON.stringify(approval.privacySnapshot.shareableFields) === JSON.stringify(revision!.shareableFields);
}

function isApprovalEligibleForDispatch(approval: ProjectApprovalRecord | undefined, request: ProjectPurchaseRequestRecord, projectId: string) {
  return Boolean(approval)
    && approval!.status === "approved"
    && approval!.projectId === projectId
    && request.projectId === projectId
    && request.status === "ready-for-review"
    && request.version === approval!.target.version
    && approval!.target.id === request.id
    && approvalSnapshotMatchesRevision(approval!, request);
}

function supplierContactResponseCapabilityLabel(value: SupplierContactResponseCapability) {
  return supplierContactResponseCapabilities.find((item) => item.id === value)?.label ?? "نامشخص";
}

function supplierContactCapabilitySupports(contact: Pick<SupplierContactRecord, "responseCapability">, requestKind: PurchaseRequestKind) {
  return contact.responseCapability === "both" || contact.responseCapability === requestKind;
}

function supplierContactCanRespond(contact: SupplierContactRecord, requestKind: PurchaseRequestKind) {
  return contact.status === "active" && supplierContactCapabilitySupports(contact, requestKind);
}

function supplierContactMatchReason(contact: SupplierContactRecord, requestKind: PurchaseRequestKind) {
  if (!supplierContactCanRespond(contact, requestKind)) return "توان پاسخ ثبت‌شده با نوع این درخواست سازگار نیست؛ این رکورد قابل انتخاب نیست.";
  return `توان پاسخ «${supplierContactResponseCapabilityLabel(contact.responseCapability)}» با نوع درخواست سازگار است؛ دستهٔ «${contact.category}» و پوشش «${contact.tehranCoverage}» را شما ثبت کرده‌اید و باید دستی بررسی شوند.`;
}

function builderRecordedProposalLineStatusLabel(value: BuilderRecordedProposalLineStatus) {
  return builderRecordedProposalLineStatuses.find((item) => item.id === value)?.label ?? "ذکر نشده";
}

function builderRecordedProposalLineHasDeclaredCommercialValues(line: Pick<BuilderRecordedProposalLine, "quantity" | "unit" | "unitPrice" | "totalPrice" | "tax" | "transport" | "minimumOrder" | "leadTime" | "validity" | "paymentTerms">) {
  return [line.quantity, line.unit, line.unitPrice, line.totalPrice, line.tax, line.transport, line.minimumOrder, line.leadTime, line.validity, line.paymentTerms].some((value) => value !== null);
}

function builderRecordedProposalLineDraftHasDeclaredCommercialValues(line: BuilderRecordedProposalLineDraft) {
  return [line.quantity, line.unit, line.unitPrice, line.totalPrice, line.tax, line.transport, line.minimumOrder, line.leadTime, line.validity, line.paymentTerms].some((value) => value.trim() !== "");
}

function builderRecordedProposalRequestSnapshot(snapshot: PurchaseRequestSnapshot): BuilderRecordedProposalRequestSnapshot {
  return {
    requestKind: snapshot.requestKind,
    title: purchaseRequestSnapshotTitle(snapshot),
    items: snapshot.items.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, unit: item.unit })),
    service: snapshot.service ? { id: snapshot.service.id, scope: snapshot.service.scope, location: snapshot.service.location } : null,
  };
}

function blankBuilderRecordedProposalLines(snapshot: BuilderRecordedProposalRequestSnapshot): BuilderRecordedProposalLineDraft[] {
  if (snapshot.requestKind === "product") {
    return snapshot.items.map((item, index) => ({
      id: `proposal-line:${item.id}`,
      requestItemId: item.id,
      serviceSpecId: null,
      requestLabel: item.name ?? `قلم ${index + 1}`,
      status: "not-mentioned",
      quantity: "",
      unit: "",
      unitPrice: "",
      totalPrice: "",
      tax: "",
      transport: "",
      minimumOrder: "",
      leadTime: "",
      validity: "",
      paymentTerms: "",
      notes: "",
    }));
  }
  const service = snapshot.service!;
  return [{
    id: `proposal-line:${service.id}`,
    requestItemId: null,
    serviceSpecId: service.id,
    requestLabel: service.scope ?? "خدمت درخواستی",
    status: "not-mentioned",
    quantity: "",
    unit: "",
    unitPrice: "",
    totalPrice: "",
    tax: "",
    transport: "",
    minimumOrder: "",
    leadTime: "",
    validity: "",
    paymentTerms: "",
    notes: "",
  }];
}

function builderRecordedProposalDraftFromRecord(record: BuilderRecordedProposalRecord): BuilderRecordedProposalDraft {
  const revision = record.revisions.find((item) => item.id === record.currentRevisionId)!;
  return {
    requestId: record.target.requestId,
    supplierContactId: record.supplierSnapshot.supplierContactId,
    projectFileId: record.reference.projectFileId ?? "",
    declaredAt: revision.declaredAt ?? "",
    transcript: revision.transcript ?? "",
    notes: revision.notes ?? "",
    lines: revision.lines.map((line) => ({
      ...line,
      quantity: line.quantity ?? "",
      unit: line.unit ?? "",
      unitPrice: line.unitPrice ?? "",
      totalPrice: line.totalPrice ?? "",
      tax: line.tax ?? "",
      transport: line.transport ?? "",
      minimumOrder: line.minimumOrder ?? "",
      leadTime: line.leadTime ?? "",
      validity: line.validity ?? "",
      paymentTerms: line.paymentTerms ?? "",
      notes: line.notes ?? "",
    })),
  };
}

function normalizeBuilderRecordedProposalNumber(value: string) {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const normalized = value
    .trim()
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[٬,\s]/g, "")
    .replace(/٫/g, ".");
  if (!normalized) return null;
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return undefined;
  const [rawInteger = "", rawFraction = ""] = normalized.split(".");
  const integer = rawInteger.replace(/^0+(?=\d)/, "") || "0";
  const fraction = rawFraction.replace(/0+$/, "");
  return fraction ? `${integer}.${fraction}` : integer;
}

function normalizeBuilderRecordedProposalText(value: string, maxLength: number) {
  const normalized = value.trim();
  if (!normalized) return null;
  if (!hasVisibleProjectTaskText(normalized) || normalized.length > maxLength) return undefined;
  return normalized;
}

function normalizeBuilderRecordedProposalRevisionDraft(
  draft: BuilderRecordedProposalDraft,
  requestSnapshot: BuilderRecordedProposalRequestSnapshot,
  expectedLineIds: string[],
) {
  const expectedLines = requestSnapshot.requestKind === "product"
    ? requestSnapshot.items.map((item, index) => ({ requestItemId: item.id, serviceSpecId: null, requestLabel: item.name ?? `قلم ${index + 1}` }))
    : [{ requestItemId: null, serviceSpecId: requestSnapshot.service!.id, requestLabel: requestSnapshot.service!.scope ?? "خدمت درخواستی" }];
  if (draft.lines.length !== expectedLines.length || expectedLineIds.length !== expectedLines.length) return null;
  const declaredAt = normalizeBuilderRecordedProposalText(draft.declaredAt, 80);
  const transcript = normalizeBuilderRecordedProposalText(draft.transcript, 2000);
  const notes = normalizeBuilderRecordedProposalText(draft.notes, 1000);
  if (declaredAt === undefined || transcript === undefined || notes === undefined) return null;
  const lineIds = new Set<string>();
  const lines = draft.lines.flatMap((line, index): BuilderRecordedProposalLine[] => {
    const expected = expectedLines[index];
    const quantity = normalizeBuilderRecordedProposalNumber(line.quantity);
    const unitPrice = normalizeBuilderRecordedProposalNumber(line.unitPrice);
    const totalPrice = normalizeBuilderRecordedProposalNumber(line.totalPrice);
    const unit = normalizeBuilderRecordedProposalText(line.unit, 80);
    const tax = normalizeBuilderRecordedProposalText(line.tax, 160);
    const transport = normalizeBuilderRecordedProposalText(line.transport, 160);
    const minimumOrder = normalizeBuilderRecordedProposalText(line.minimumOrder, 160);
    const leadTime = normalizeBuilderRecordedProposalText(line.leadTime, 160);
    const validity = normalizeBuilderRecordedProposalText(line.validity, 160);
    const paymentTerms = normalizeBuilderRecordedProposalText(line.paymentTerms, 240);
    const lineNotes = normalizeBuilderRecordedProposalText(line.notes, 500);
    if (
      line.id !== expectedLineIds[index]
      || lineIds.has(line.id)
      || line.requestItemId !== expected.requestItemId
      || line.serviceSpecId !== expected.serviceSpecId
      || line.requestLabel !== expected.requestLabel
      || !builderRecordedProposalLineStatuses.some((status) => status.id === line.status)
      || quantity === undefined
      || unit === undefined
      || unitPrice === undefined
      || totalPrice === undefined
      || tax === undefined
      || transport === undefined
      || minimumOrder === undefined
      || leadTime === undefined
      || validity === undefined
      || paymentTerms === undefined
      || lineNotes === undefined
      || line.status === "not-mentioned" && [quantity, unit, unitPrice, totalPrice, tax, transport, minimumOrder, leadTime, validity, paymentTerms].some((value) => value !== null)
    ) return [];
    lineIds.add(line.id);
    return [{
      id: line.id,
      requestItemId: line.requestItemId,
      serviceSpecId: line.serviceSpecId,
      requestLabel: line.requestLabel,
      status: line.status,
      quantity,
      unit,
      unitPrice,
      totalPrice,
      currency: "تومان",
      tax,
      transport,
      minimumOrder,
      leadTime,
      validity,
      paymentTerms,
      notes: lineNotes,
    }];
  });
  return lines.length === expectedLines.length ? { declaredAt, transcript, notes, lines } : null;
}

function builderRecordedProposalRevisionFingerprint(
  target: BuilderRecordedProposalRecord["target"],
  requestSnapshot: BuilderRecordedProposalRequestSnapshot,
  supplierSnapshot: BuilderRecordedProposalSupplierSnapshot,
  reference: BuilderRecordedProposalReference,
  revision: Omit<BuilderRecordedProposalRevision, "fingerprint">,
) {
  return `fnv1a-${purchaseRequestStableHash(JSON.stringify(stablePurchaseRequestValue({ target, requestSnapshot, supplierSnapshot, reference, revision })))}`;
}

function builderRecordedProposalRevisionSemanticValue(revision: Pick<BuilderRecordedProposalRevision, "declaredAt" | "transcript" | "notes" | "lines">) {
  return { declaredAt: revision.declaredAt, transcript: revision.transcript, notes: revision.notes, lines: revision.lines };
}

function builderRecordedProposalHasMeaningfulInput(reference: BuilderRecordedProposalReference, revision: Pick<BuilderRecordedProposalRevision, "declaredAt" | "transcript" | "notes" | "lines">) {
  return reference.kind === "project-file-metadata"
    || revision.declaredAt !== null
    || revision.transcript !== null
    || revision.notes !== null
    || revision.lines.some((line) => line.status !== "not-mentioned" || [line.quantity, line.unit, line.unitPrice, line.totalPrice, line.tax, line.transport, line.minimumOrder, line.leadTime, line.validity, line.paymentTerms, line.notes].some((value) => value !== null));
}

function builderRecordedProposalEffectiveStatus(
  proposal: BuilderRecordedProposalRecord,
  requests: ProjectPurchaseRequestRecord[],
  approvals: ProjectApprovalRecord[],
  contacts: SupplierContactRecord[],
) {
  const request = requests.find((item) => item.id === proposal.target.requestId && item.projectId === proposal.projectId);
  const approval = approvals.find((item) => item.id === proposal.target.contentApprovalId && item.projectId === proposal.projectId);
  const contact = contacts.find((item) => item.id === proposal.supplierSnapshot.supplierContactId && item.projectId === proposal.projectId);
  return request
    && approval
    && request.version === proposal.target.requestVersion
    && request.status === "ready-for-review"
    && approval.status === "approved"
    && approval.target.version === proposal.target.requestVersion
    && approval.target.revisionId === proposal.target.reviewRevisionId
    && approvalSnapshotMatchesRevision(approval, request)
    && contact?.status === "active"
    && contact.version === proposal.supplierSnapshot.supplierContactVersion
    && supplierContactCapabilitySupports(contact, proposal.target.requestKind)
    ? "current" as const
    : "needs-review" as const;
}

function builderProposalComparisonRequestKey(proposal: BuilderRecordedProposalRecord) {
  return [proposal.target.requestId, proposal.target.requestVersion, proposal.target.reviewRevisionId, proposal.target.reviewRevisionFingerprint].join(":");
}

function builderProposalComparisonDecimalParts(value: string) {
  if (!/^\d+(?:\.\d+)?$/.test(value)) return null;
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
  const multiplied = builderProposalComparisonMultiply(amount, rate);
  const parts = multiplied ? builderProposalComparisonDecimalParts(multiplied) : null;
  return parts ? builderProposalComparisonDecimalFromParts(parts.coefficient, parts.scale + 2) : null;
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
  const normalized = normalizeBuilderRecordedProposalNumber(value);
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
  const normalizedAssumption = normalizeBuilderRecordedProposalText(assumption, 500);
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

function builderProposalComparisonDefaultDraft(proposals: BuilderRecordedProposalRecord[], requestKey: string): BuilderProposalComparisonDraft {
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
          return {
            proposalLineId: line.id,
            requestItemId: line.requestItemId!,
            basis: exactDeclaredTotal ? "declared-total" as const : "unknown" as const,
            adjustedQuantity: "",
            adjustedQuantityUnit: "",
            assumption: "",
          };
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

function builderProposalComparisonDraftFromRecord(record: BuilderProposalComparisonRecord): BuilderProposalComparisonDraft {
  const revision = record.revisions.find((item) => item.id === record.currentRevisionId)!;
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

function normalizeBuilderProposalComparisonInputs(draft: BuilderProposalComparisonDraft, proposals: BuilderRecordedProposalRecord[]) {
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
        const adjustedQuantityUnit = normalizeBuilderRecordedProposalText(adjustmentDraft.adjustedQuantityUnit, 80);
        const assumption = normalizeBuilderRecordedProposalText(adjustmentDraft.assumption, 500);
        if (sourceLine.status !== "quoted" || sourceLine.unitPrice === null || sourceLine.unit === null || adjustedQuantity === undefined || adjustedQuantityUnit === null || adjustedQuantityUnit === undefined || adjustedQuantityUnit !== sourceLine.unit || assumption === null || assumption === undefined) return [];
        return [{ proposalLineId: sourceLine.id, requestItemId: sourceLine.requestItemId, basis: "unit-price-times-adjusted-quantity", adjustedQuantity, adjustedQuantityUnit, assumption, source: "فرض ثبت‌شده توسط سازنده" }];
      }
      if (adjustmentDraft.basis !== "unknown" || adjustmentDraft.adjustedQuantity.trim() || adjustmentDraft.adjustedQuantityUnit.trim() || adjustmentDraft.assumption.trim()) return [];
      return [{ proposalLineId: sourceLine.id, requestItemId: sourceLine.requestItemId, basis: "unknown", adjustedQuantity: null, adjustedQuantityUnit: null, assumption: null, source: "فرض ثبت‌شده توسط سازنده" }];
    });
    const taxTreatment = normalizeBuilderProposalComparisonTreatment(proposalDraft.taxMode, proposalDraft.taxValue, proposalDraft.taxAssumption, { included: "included", fixed: "fixed", rate: "rate", unknown: "unknown" });
    const transportTreatment = normalizeBuilderProposalComparisonTreatment(proposalDraft.transportMode, proposalDraft.transportValue, proposalDraft.transportAssumption, { included: "included", fixed: "fixed", unknown: "unknown" });
    if (adjustments.length !== revision.lines.length || !taxTreatment || !transportTreatment) return [];
    return [{
      proposalId: proposal.id,
      proposalVersion: revision.version,
      proposalRevisionId: revision.id,
      proposalRevisionFingerprint: revision.fingerprint,
      supplierSnapshot: structuredClone(proposal.supplierSnapshot),
      lineAdjustments: adjustments,
      taxTreatment,
      transportTreatment,
    }];
  });
  return inputs.length === selectedDrafts.length ? inputs : null;
}

function deriveBuilderProposalComparisonPayload(inputs: BuilderProposalComparisonInput[], proposals: BuilderRecordedProposalRecord[]) {
  const results = inputs.flatMap((input): BuilderProposalComparisonProposalResult[] => {
    const proposal = proposals.find((item) => item.id === input.proposalId);
    const revision = proposal?.revisions.find((item) => item.id === input.proposalRevisionId && item.version === input.proposalVersion && item.fingerprint === input.proposalRevisionFingerprint);
    if (!proposal || !revision || input.lineAdjustments.length !== revision.lines.length) return [];
    const lines = revision.lines.map((line, index): BuilderProposalComparisonLineResult => {
      const adjustment = input.lineAdjustments[index];
      const missingReasons: string[] = [];
      let basisAmount: string | null = null;
      let formula = "مبنای محاسبه مشخص نشده است.";
      if (line.status !== "quoted") missingReasons.push(line.status === "alternative" ? "قلم جایگزین است و هم‌ارزی آن تأیید نشده است." : line.status === "unavailable" ? "این قلم ناموجود ثبت شده است." : "برای این قلم دادهٔ اعلامی ثبت نشده است.");
      else if (adjustment.basis === "declared-total" && line.totalPrice !== null) {
        basisAmount = line.totalPrice;
        formula = `قیمت کل اعلامی ${line.totalPrice} تومان`;
      } else if (adjustment.basis === "unit-price-times-adjusted-quantity" && line.unitPrice !== null && adjustment.adjustedQuantity !== null) {
        basisAmount = builderProposalComparisonMultiply(line.unitPrice, adjustment.adjustedQuantity);
        formula = `${line.unitPrice} × ${adjustment.adjustedQuantity} ${adjustment.adjustedQuantityUnit ?? ""}`.trim();
        if (basisAmount === null) missingReasons.push("محدودهٔ عددی این محاسبه پشتیبانی نمی‌شود.");
      } else missingReasons.push("مبنای مبلغ هم‌سطح مشخص نشده است.");
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
      proposalId: proposal.id,
      supplierDisplayName: proposal.supplierSnapshot.displayName,
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
    let minimum = completeResults[0].normalizedTotal!;
    let comparisonFailed = false;
    for (let index = 1; index < completeResults.length; index += 1) {
      const comparison = builderProposalComparisonCompare(completeResults[index].normalizedTotal!, minimum);
      if (comparison === null) comparisonFailed = true;
      else if (comparison === -1) minimum = completeResults[index].normalizedTotal!;
    }
    const tied = comparisonFailed ? [] : completeResults.filter((result) => builderProposalComparisonCompare(result.normalizedTotal!, minimum) === 0).map((result) => result.proposalId);
    recommendation = comparisonFailed
      ? { criterion: "lowest-complete-normalized-total", status: "insufficient-data", candidateProposalId: null, tiedProposalIds: [], reason: "مقایسهٔ عددی از محدودهٔ پشتیبانی‌شده خارج است؛ جمع‌بندی ساخته نشد.", source: "جمع‌بندی قاعده‌محور محلی" }
      : tied.length === 1
      ? { criterion: "lowest-complete-normalized-total", status: "conditional", candidateProposalId: tied[0], tiedProposalIds: [], reason: "بر اساس معیار صریح «کمترین مبلغ هم‌سطح» و فقط با فرض‌های ثبت‌شده، این گزینه رقم کمتری دارد؛ این نتیجه بهترین یا انتخاب نهایی نیست.", source: "جمع‌بندی قاعده‌محور محلی" }
      : { criterion: "lowest-complete-normalized-total", status: "tie", candidateProposalId: null, tiedProposalIds: tied, reason: "کمترین مبلغ هم‌سطح بین چند پیشنهاد برابر است؛ نامزد یکتا وجود ندارد.", source: "جمع‌بندی قاعده‌محور محلی" };
  }
  return { results, recommendation };
}

function builderProposalComparisonRevisionFingerprint(
  recordIdentity: Pick<BuilderProposalComparisonRecord, "projectId" | "target" | "requestSnapshot">,
  revision: Omit<BuilderProposalComparisonRevision, "fingerprint">,
) {
  return `fnv1a-${purchaseRequestStableHash(JSON.stringify(stablePurchaseRequestValue({ ...recordIdentity, revision })))}`;
}

function builderProposalComparisonSemanticValue(revision: BuilderProposalComparisonRevision) {
  return { inputs: revision.inputs, results: revision.results, recommendation: revision.recommendation };
}

function builderProposalComparisonEffectiveStatus(
  comparison: BuilderProposalComparisonRecord,
  proposals: BuilderRecordedProposalRecord[],
  requests: ProjectPurchaseRequestRecord[],
  approvals: ProjectApprovalRecord[],
  contacts: SupplierContactRecord[],
  revisionId = comparison.currentRevisionId,
) {
  const revision = comparison.revisions.find((item) => item.id === revisionId);
  if (!revision) return "needs-review" as const;
  return revision.inputs.every((input) => {
    const proposal = proposals.find((item) => item.id === input.proposalId && item.projectId === comparison.projectId);
    return proposal
      && proposal.currentRevisionId === input.proposalRevisionId
      && proposal.version === input.proposalVersion
      && builderRecordedProposalEffectiveStatus(proposal, requests, approvals, contacts) === "current";
  }) ? "current" as const : "needs-review" as const;
}

function builderProposalComparisonDecisionRevisionFingerprint(
  target: BuilderProposalComparisonDecisionRecord["target"],
  revision: Omit<BuilderProposalComparisonDecisionRevision, "fingerprint">,
) {
  return `fnv1a-${purchaseRequestStableHash(JSON.stringify(stablePurchaseRequestValue({ target, revision })))}`;
}

function builderServiceProposalComparisonRequestSnapshotFromReview(snapshot: PurchaseRequestSnapshot): BuilderServiceProposalComparisonRequestSnapshot | null {
  if (snapshot.requestKind !== "service" || !snapshot.service) return null;
  return {
    id: snapshot.service.id,
    scope: snapshot.service.scope,
    location: snapshot.service.location,
    sizeOrVolume: snapshot.service.sizeOrVolume,
    qualification: snapshot.service.qualification,
    timing: snapshot.service.timing,
    method: snapshot.service.method,
    inScope: snapshot.service.inScope,
    outOfScope: snapshot.service.outOfScope,
    warranty: snapshot.service.warranty,
    paymentTerms: snapshot.service.paymentTerms,
  };
}

function builderServiceProposalComparisonDefaultDraft(proposals: BuilderRecordedProposalRecord[], requestKey: string): BuilderServiceProposalComparisonDraft {
  return {
    requestKey,
    proposals: proposals.filter((proposal) => proposal.target.requestKind === "service" && builderProposalComparisonRequestKey(proposal) === requestKey).slice(0, 8).map((proposal) => ({
      proposalId: proposal.id,
      selected: true,
      criteria: builderServiceProposalComparisonCriteriaV1.map((criterion) => ({ criterionId: criterion.id, declaredValue: "", assessment: "unknown", rationale: "" })),
    })),
  };
}

function builderServiceProposalComparisonDraftFromRecord(record: BuilderServiceProposalComparisonRecord): BuilderServiceProposalComparisonDraft {
  const revision = record.revisions.find((item) => item.id === record.currentRevisionId)!;
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

function normalizeBuilderServiceProposalComparisonInputs(
  draft: BuilderServiceProposalComparisonDraft,
  proposals: BuilderRecordedProposalRecord[],
  requestSnapshot: BuilderServiceProposalComparisonRequestSnapshot,
) {
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
      const declaredValue = normalizeBuilderRecordedProposalText(criterionDraft.declaredValue, 500);
      const rationale = normalizeBuilderRecordedProposalText(criterionDraft.rationale, 500);
      const assessment = criterionDraft.assessment;
      const requestValue = requestSnapshot[definition.requestField];
      if (declaredValue === undefined || rationale === undefined || !["aligned", "partial", "different", "unknown", "not-applicable"].includes(assessment)) return [];
      if (assessment === "unknown") {
        // Declared text and a clarification note may exist even when the builder
        // has not yet assessed whether the response aligns with the request.
      } else if (assessment === "not-applicable") {
        if (requestValue !== null || declaredValue !== null || rationale === null) return [];
      } else if (declaredValue === null || rationale === null || requestValue === null) return [];
      return [{
        criterionId: definition.id,
        declaredValue,
        assessment,
        rationale,
        declaredSource: "رونویسی تکمیلی سازنده برای مقایسه",
        assessmentSource: "ارزیابی سازنده",
      }];
    });
    if (criteria.length !== builderServiceProposalComparisonCriteriaV1.length) return [];
    return [{
      proposalId: proposal.id,
      proposalVersion: revision.version,
      proposalRevisionId: revision.id,
      proposalRevisionFingerprint: revision.fingerprint,
      proposalLineId: revision.lines[0].id,
      serviceSpecId: revision.lines[0].serviceSpecId!,
      supplierSnapshot: structuredClone(proposal.supplierSnapshot),
      criteria,
    }];
  });
  return inputs.length === selectedDrafts.length ? inputs : null;
}

function deriveBuilderServiceProposalComparisonPayload(
  inputs: BuilderServiceProposalComparisonInput[],
  proposals: BuilderRecordedProposalRecord[],
  requestSnapshot: BuilderServiceProposalComparisonRequestSnapshot,
) {
  const results = inputs.flatMap((input): BuilderServiceProposalComparisonProposalResult[] => {
    const proposal = proposals.find((item) => item.id === input.proposalId && item.target.requestKind === "service");
    const revision = proposal?.revisions.find((item) => item.id === input.proposalRevisionId && item.version === input.proposalVersion && item.fingerprint === input.proposalRevisionFingerprint);
    const declaredLine = revision?.lines[0];
    if (!proposal || !revision || !declaredLine || input.proposalLineId !== declaredLine.id || input.serviceSpecId !== declaredLine.serviceSpecId || declaredLine.serviceSpecId !== requestSnapshot.id || input.criteria.length !== builderServiceProposalComparisonCriteriaV1.length) return [];
    const criteria = builderServiceProposalComparisonCriteriaV1.flatMap((definition, index): BuilderServiceProposalComparisonCriterionResult[] => {
      const criterion = input.criteria[index];
      if (!criterion || criterion.criterionId !== definition.id) return [];
      return [{
        ...structuredClone(criterion),
        requestValue: requestSnapshot[definition.requestField],
        status: criterion.assessment === "unknown" ? "unknown" : "assessed",
      }];
    });
    if (criteria.length !== builderServiceProposalComparisonCriteriaV1.length) return [];
    const counts = {
      aligned: criteria.filter((criterion) => criterion.assessment === "aligned").length,
      partial: criteria.filter((criterion) => criterion.assessment === "partial").length,
      different: criteria.filter((criterion) => criterion.assessment === "different").length,
      unknown: criteria.filter((criterion) => criterion.assessment === "unknown").length,
      notApplicable: criteria.filter((criterion) => criterion.assessment === "not-applicable").length,
    };
    return [{
      proposalId: proposal.id,
      supplierDisplayName: proposal.supplierSnapshot.displayName,
      declaredCommercialSnapshot: structuredClone(declaredLine),
      criteria,
      counts,
      coverage: counts.unknown === 0 ? "complete" : "incomplete",
      source: "ماتریس ساختاریافتهٔ محلی چیدا",
    }];
  });
  if (results.length !== inputs.length) return null;
  const unknownCount = results.reduce((total, result) => total + result.counts.unknown, 0);
  const summary: BuilderServiceProposalComparisonSummary = unknownCount > 0
    ? {
      formulaVersion: "service-coverage-v1",
      criterion: "all-service-criteria-reviewed",
      status: "needs-clarification",
      candidateProposalId: null,
      unknownCount,
      reasonCode: "criteria-need-clarification",
      reason: "حداقل یک معیار در پیشنهادهای انتخاب‌شده هنوز نامشخص است؛ پیش از تصمیم انسانی روشن‌سازی لازم است.",
      source: "جمع‌بندی قاعده‌محور محلی",
    }
    : {
      formulaVersion: "service-coverage-v1",
      criterion: "all-service-criteria-reviewed",
      status: "ready-for-human-decision",
      candidateProposalId: null,
      unknownCount: 0,
      reasonCode: "all-criteria-reviewed",
      reason: "همهٔ معیارهای خدمت بازبینی شده‌اند؛ تفاوت‌ها برای تصمیم مستقل سازنده نمایش داده می‌شوند و هیچ امتیاز، رتبه یا گزینهٔ برتر ساخته نشده است.",
      source: "جمع‌بندی قاعده‌محور محلی",
    };
  return { results, summary };
}

function builderServiceProposalComparisonRevisionFingerprint(
  recordIdentity: Pick<BuilderServiceProposalComparisonRecord, "projectId" | "target" | "requestSnapshot">,
  revision: Omit<BuilderServiceProposalComparisonRevision, "fingerprint">,
) {
  return `fnv1a-${purchaseRequestStableHash(JSON.stringify(stablePurchaseRequestValue({ ...recordIdentity, revision })))}`;
}

function builderServiceProposalComparisonSemanticValue(revision: BuilderServiceProposalComparisonRevision) {
  return { inputs: revision.inputs, results: revision.results, summary: revision.summary };
}

function builderServiceProposalComparisonEffectiveStatus(
  comparison: BuilderServiceProposalComparisonRecord,
  proposals: BuilderRecordedProposalRecord[],
  requests: ProjectPurchaseRequestRecord[],
  approvals: ProjectApprovalRecord[],
  contacts: SupplierContactRecord[],
  revisionId = comparison.currentRevisionId,
) {
  const revision = comparison.revisions.find((item) => item.id === revisionId);
  if (!revision) return "needs-review" as const;
  return revision.inputs.every((input) => {
    const proposal = proposals.find((item) => item.id === input.proposalId && item.projectId === comparison.projectId);
    return proposal
      && proposal.currentRevisionId === input.proposalRevisionId
      && proposal.version === input.proposalVersion
      && builderRecordedProposalEffectiveStatus(proposal, requests, approvals, contacts) === "current";
  }) ? "current" as const : "needs-review" as const;
}

function builderServiceProposalComparisonDecisionRevisionFingerprint(
  target: BuilderServiceProposalComparisonDecisionRecord["target"],
  revision: Omit<BuilderServiceProposalComparisonDecisionRevision, "fingerprint">,
) {
  return `fnv1a-${purchaseRequestStableHash(JSON.stringify(stablePurchaseRequestValue({ target, revision })))}`;
}

function builderNegotiationDraftTargetKey(target: BuilderNegotiationDraftTarget) {
  return [
    target.comparisonKind,
    target.comparisonId,
    target.comparisonRevisionId,
    target.proposalId,
    target.proposalRevisionId,
    target.proposalLineId,
    target.criterionKind,
    target.criterionId,
  ].join(":");
}

function builderNegotiationDraftRevisionFingerprint(
  target: BuilderNegotiationDraftTarget,
  revision: Omit<BuilderNegotiationDraftRevision, "fingerprint">,
) {
  return `fnv1a-${purchaseRequestStableHash(JSON.stringify(stablePurchaseRequestValue({ target, revision })))}`;
}

function builderNegotiationServiceCriterionIsEligible(assessment: BuilderServiceProposalComparisonAssessment) {
  return assessment === "partial" || assessment === "different" || assessment === "unknown";
}

function builderNegotiationDraftTargetEvidence(
  projectId: string,
  target: BuilderNegotiationDraftTarget,
  productComparisons: BuilderProposalComparisonRecord[],
  serviceComparisons: BuilderServiceProposalComparisonRecord[],
): BuilderNegotiationDraftTargetOption | null {
  if (target.comparisonKind === "product") {
    const comparison = productComparisons.find((item) => item.id === target.comparisonId && item.projectId === projectId);
    const revision = comparison?.revisions.find((item) => item.id === target.comparisonRevisionId && item.version === target.comparisonVersion && item.fingerprint === target.comparisonRevisionFingerprint);
    const input = revision?.inputs.find((item) => item.proposalId === target.proposalId && item.proposalVersion === target.proposalVersion && item.proposalRevisionId === target.proposalRevisionId && item.proposalRevisionFingerprint === target.proposalRevisionFingerprint);
    const result = revision?.results.find((item) => item.proposalId === target.proposalId);
    const line = result?.lines.find((item) => item.proposalLineId === target.proposalLineId && item.requestItemId === target.criterionId);
    if (
      !comparison
      || !revision
      || !input
      || !line
      || target.criterionKind !== "product-line"
      || target.criterionLabel !== line.requestLabel
      || target.requestId !== comparison.target.requestId
      || target.requestVersion !== comparison.target.requestVersion
      || target.reviewRevisionId !== comparison.target.reviewRevisionId
      || target.reviewRevisionFingerprint !== comparison.target.reviewRevisionFingerprint
      || JSON.stringify(stablePurchaseRequestValue(target.supplierSnapshot)) !== JSON.stringify(stablePurchaseRequestValue(input.supplierSnapshot))
    ) return null;
    return {
      key: builderNegotiationDraftTargetKey(target),
      target: structuredClone(target),
      comparisonLabel: comparison.requestSnapshot.title,
      supplierLabel: input.supplierSnapshot.displayName,
      criterionState: line.calculation.status === "complete" ? "فرمول مبلغ کامل · پرسش اختیاری سازنده" : "فرمول مبلغ ناقص · روشن‌سازی ممکن",
      sourceCreatedAt: revision.createdAt,
    };
  }

  const comparison = serviceComparisons.find((item) => item.id === target.comparisonId && item.projectId === projectId);
  const revision = comparison?.revisions.find((item) => item.id === target.comparisonRevisionId && item.version === target.comparisonVersion && item.fingerprint === target.comparisonRevisionFingerprint);
  const input = revision?.inputs.find((item) => item.proposalId === target.proposalId && item.proposalVersion === target.proposalVersion && item.proposalRevisionId === target.proposalRevisionId && item.proposalRevisionFingerprint === target.proposalRevisionFingerprint && item.proposalLineId === target.proposalLineId);
  const criterion = input?.criteria.find((item) => item.criterionId === target.criterionId);
  const definition = builderServiceProposalComparisonCriteriaV1.find((item) => item.id === target.criterionId);
  if (
    !comparison
    || !revision
    || !input
    || !criterion
    || !definition
    || !builderNegotiationServiceCriterionIsEligible(criterion.assessment)
    || target.criterionKind !== "service-criterion"
    || target.criterionLabel !== definition.label
    || target.requestId !== comparison.target.requestId
    || target.requestVersion !== comparison.target.requestVersion
    || target.reviewRevisionId !== comparison.target.reviewRevisionId
    || target.reviewRevisionFingerprint !== comparison.target.reviewRevisionFingerprint
    || JSON.stringify(stablePurchaseRequestValue(target.supplierSnapshot)) !== JSON.stringify(stablePurchaseRequestValue(input.supplierSnapshot))
  ) return null;
  return {
    key: builderNegotiationDraftTargetKey(target),
    target: structuredClone(target),
    comparisonLabel: comparison.requestSnapshot.scope ?? "خدمت درخواستی",
    supplierLabel: input.supplierSnapshot.displayName,
    criterionState: builderServiceProposalComparisonAssessmentLabel(criterion.assessment),
    sourceCreatedAt: revision.createdAt,
  };
}

function builderNegotiationDraftTargetOptions(
  projectId: string,
  productComparisons: BuilderProposalComparisonRecord[],
  serviceComparisons: BuilderServiceProposalComparisonRecord[],
  proposals: BuilderRecordedProposalRecord[],
  requests: ProjectPurchaseRequestRecord[],
  approvals: ProjectApprovalRecord[],
  contacts: SupplierContactRecord[],
) {
  const productOptions = productComparisons.flatMap((comparison): BuilderNegotiationDraftTargetOption[] => {
    const revision = comparison.revisions.find((item) => item.id === comparison.currentRevisionId);
    if (!revision || builderProposalComparisonEffectiveStatus(comparison, proposals, requests, approvals, contacts) !== "current") return [];
    return revision.inputs.flatMap((input) => {
      const result = revision.results.find((item) => item.proposalId === input.proposalId);
      if (!result) return [];
      return result.lines.map((line) => {
        const target = {
          comparisonKind: "product",
          comparisonId: comparison.id,
          comparisonVersion: revision.version,
          comparisonRevisionId: revision.id,
          comparisonRevisionFingerprint: revision.fingerprint,
          requestId: comparison.target.requestId,
          requestVersion: comparison.target.requestVersion,
          reviewRevisionId: comparison.target.reviewRevisionId,
          reviewRevisionFingerprint: comparison.target.reviewRevisionFingerprint,
          proposalId: input.proposalId,
          proposalVersion: input.proposalVersion,
          proposalRevisionId: input.proposalRevisionId,
          proposalRevisionFingerprint: input.proposalRevisionFingerprint,
          proposalLineId: line.proposalLineId,
          criterionKind: "product-line",
          criterionId: line.requestItemId,
          criterionLabel: line.requestLabel,
          supplierSnapshot: structuredClone(input.supplierSnapshot),
        } satisfies BuilderNegotiationDraftTarget;
        return builderNegotiationDraftTargetEvidence(projectId, target, productComparisons, serviceComparisons)!;
      });
    });
  });
  const serviceOptions = serviceComparisons.flatMap((comparison): BuilderNegotiationDraftTargetOption[] => {
    const revision = comparison.revisions.find((item) => item.id === comparison.currentRevisionId);
    if (!revision || builderServiceProposalComparisonEffectiveStatus(comparison, proposals, requests, approvals, contacts) !== "current") return [];
    return revision.inputs.flatMap((input) => input.criteria.filter((criterion) => builderNegotiationServiceCriterionIsEligible(criterion.assessment)).flatMap((criterion): BuilderNegotiationDraftTargetOption[] => {
      const definition = builderServiceProposalComparisonCriteriaV1.find((item) => item.id === criterion.criterionId);
      if (!definition) return [];
      const target = {
        comparisonKind: "service",
        comparisonId: comparison.id,
        comparisonVersion: revision.version,
        comparisonRevisionId: revision.id,
        comparisonRevisionFingerprint: revision.fingerprint,
        requestId: comparison.target.requestId,
        requestVersion: comparison.target.requestVersion,
        reviewRevisionId: comparison.target.reviewRevisionId,
        reviewRevisionFingerprint: comparison.target.reviewRevisionFingerprint,
        proposalId: input.proposalId,
        proposalVersion: input.proposalVersion,
        proposalRevisionId: input.proposalRevisionId,
        proposalRevisionFingerprint: input.proposalRevisionFingerprint,
        proposalLineId: input.proposalLineId,
        criterionKind: "service-criterion",
        criterionId: criterion.criterionId,
        criterionLabel: definition.label,
        supplierSnapshot: structuredClone(input.supplierSnapshot),
      } satisfies BuilderNegotiationDraftTarget;
      const option = builderNegotiationDraftTargetEvidence(projectId, target, productComparisons, serviceComparisons);
      return option ? [option] : [];
    }));
  });
  return [...productOptions, ...serviceOptions];
}

function builderNegotiationDraftEffectiveStatus(
  record: BuilderNegotiationDraftRecord,
  productComparisons: BuilderProposalComparisonRecord[],
  serviceComparisons: BuilderServiceProposalComparisonRecord[],
  proposals: BuilderRecordedProposalRecord[],
  requests: ProjectPurchaseRequestRecord[],
  approvals: ProjectApprovalRecord[],
  contacts: SupplierContactRecord[],
) {
  const evidence = builderNegotiationDraftTargetEvidence(record.projectId, record.target, productComparisons, serviceComparisons);
  if (!evidence) return "needs-review" as const;
  if (record.target.comparisonKind === "product") {
    const comparison = productComparisons.find((item) => item.id === record.target.comparisonId && item.projectId === record.projectId);
    return comparison
      && comparison.currentRevisionId === record.target.comparisonRevisionId
      && builderProposalComparisonEffectiveStatus(comparison, proposals, requests, approvals, contacts, record.target.comparisonRevisionId) === "current"
      ? "current" as const
      : "needs-review" as const;
  }
  const comparison = serviceComparisons.find((item) => item.id === record.target.comparisonId && item.projectId === record.projectId);
  return comparison
    && comparison.currentRevisionId === record.target.comparisonRevisionId
    && builderServiceProposalComparisonEffectiveStatus(comparison, proposals, requests, approvals, contacts, record.target.comparisonRevisionId) === "current"
    ? "current" as const
    : "needs-review" as const;
}

function builderManualNegotiationResponseTargetKey(target: BuilderManualNegotiationResponseTarget) {
  return `${target.negotiationDraftId}:${target.negotiationDraftRevisionId}`;
}

function builderManualNegotiationResponseRevisionFingerprint(
  target: BuilderManualNegotiationResponseTarget,
  questionSnapshot: BuilderManualNegotiationResponseQuestionSnapshot,
  revision: Omit<BuilderManualNegotiationResponseRevision, "fingerprint">,
) {
  return `fnv1a-${purchaseRequestStableHash(JSON.stringify(stablePurchaseRequestValue({ target, questionSnapshot, revision })))}`;
}

function builderManualNegotiationResponseQuestionEvidence(
  projectId: string,
  target: BuilderManualNegotiationResponseTarget,
  questionSnapshot: BuilderManualNegotiationResponseQuestionSnapshot,
  drafts: BuilderNegotiationDraftRecord[],
) {
  const draft = drafts.find((item) => item.id === target.negotiationDraftId && item.projectId === projectId);
  const revision = draft?.revisions.find((item) => (
    item.id === target.negotiationDraftRevisionId
    && item.version === target.negotiationDraftRevisionVersion
    && item.fingerprint === target.negotiationDraftRevisionFingerprint
  ));
  if (
    !draft
    || !revision
    || questionSnapshot.purpose !== revision.purpose
    || questionSnapshot.message !== revision.message
    || questionSnapshot.createdAt !== revision.createdAt
    || JSON.stringify(stablePurchaseRequestValue(questionSnapshot.negotiationTarget)) !== JSON.stringify(stablePurchaseRequestValue(draft.target))
  ) return null;
  return { draft, revision };
}

function builderManualNegotiationResponseEffectiveStatus(
  record: BuilderManualNegotiationResponseRecord,
  drafts: BuilderNegotiationDraftRecord[],
  productComparisons: BuilderProposalComparisonRecord[],
  serviceComparisons: BuilderServiceProposalComparisonRecord[],
  proposals: BuilderRecordedProposalRecord[],
  requests: ProjectPurchaseRequestRecord[],
  approvals: ProjectApprovalRecord[],
  contacts: SupplierContactRecord[],
) {
  const evidence = builderManualNegotiationResponseQuestionEvidence(record.projectId, record.target, record.questionSnapshot, drafts);
  return evidence
    && evidence.draft.currentRevisionId === record.target.negotiationDraftRevisionId
    && builderNegotiationDraftEffectiveStatus(evidence.draft, productComparisons, serviceComparisons, proposals, requests, approvals, contacts) === "current"
    ? "current" as const
    : "needs-review" as const;
}

function builderManualNegotiationResponseReviewTargetKey(target: BuilderManualNegotiationResponseReviewTarget) {
  return `${target.manualNegotiationResponseId}:${target.manualNegotiationResponseRevisionId}`;
}

function builderManualNegotiationResponseReviewRevisionFingerprint(
  projectId: string,
  target: BuilderManualNegotiationResponseReviewTarget,
  revision: Omit<BuilderManualNegotiationResponseReviewRevision, "fingerprint">,
) {
  return `fnv1a-${purchaseRequestStableHash(JSON.stringify(stablePurchaseRequestValue({ projectId, target, revision })))}`;
}

function builderManualNegotiationResponseReviewEvidence(
  projectId: string,
  target: BuilderManualNegotiationResponseReviewTarget,
  responses: BuilderManualNegotiationResponseRecord[],
) {
  const response = responses.find((item) => item.id === target.manualNegotiationResponseId && item.projectId === projectId);
  const revision = response?.revisions.find((item) => (
    item.id === target.manualNegotiationResponseRevisionId
    && item.version === target.manualNegotiationResponseRevisionVersion
    && item.fingerprint === target.manualNegotiationResponseRevisionFingerprint
  ));
  return response && revision ? { response, revision } : null;
}

function builderManualNegotiationResponseReviewEffectiveStatus(
  record: BuilderManualNegotiationResponseReviewRecord,
  responses: BuilderManualNegotiationResponseRecord[],
  drafts: BuilderNegotiationDraftRecord[],
  productComparisons: BuilderProposalComparisonRecord[],
  serviceComparisons: BuilderServiceProposalComparisonRecord[],
  proposals: BuilderRecordedProposalRecord[],
  requests: ProjectPurchaseRequestRecord[],
  approvals: ProjectApprovalRecord[],
  contacts: SupplierContactRecord[],
) {
  const evidence = builderManualNegotiationResponseReviewEvidence(record.projectId, record.target, responses);
  return evidence
    && evidence.response.currentRevisionId === record.target.manualNegotiationResponseRevisionId
    && builderManualNegotiationResponseEffectiveStatus(evidence.response, drafts, productComparisons, serviceComparisons, proposals, requests, approvals, contacts) === "current"
    ? "current" as const
    : "needs-review" as const;
}

function dispatchDraftDedupeKey(projectId: string, requestId: string, requestVersion: number, revisionId: string) {
  return `${projectId}:${requestId}:${requestVersion}:${revisionId}:dispatch-draft`;
}

function dispatchPayloadFromSnapshot(snapshot: PurchaseRequestSnapshot): DispatchPayload {
  if (snapshot.requestKind === "service") {
    return {
      requestKind: "service",
      items: [],
      service: snapshot.service ? {
        scope: snapshot.service.scope,
        location: snapshot.service.location,
        locationPrecision: snapshot.service.locationPrecision,
        sizeOrVolume: snapshot.service.sizeOrVolume,
        qualification: snapshot.service.qualification,
        timing: snapshot.service.timing,
        method: snapshot.service.method,
        inScope: snapshot.service.inScope,
        outOfScope: snapshot.service.outOfScope,
        warranty: snapshot.service.warranty,
        paymentTerms: snapshot.service.paymentTerms,
      } : null,
      delivery: null,
      unresolvedTerms: null,
    };
  }
  return {
    requestKind: "product",
    items: snapshot.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      brandOrGrade: item.brandOrGrade,
      specification: item.specification,
      alternatives: item.alternatives,
    })),
    service: null,
    delivery: { area: snapshot.delivery.area, neededBy: snapshot.delivery.neededBy },
    unresolvedTerms: { ...snapshot.unresolvedTerms },
  };
}

function dispatchPrivacySnapshot(shareableFields: PurchaseRequestApprovalShareableField[]): DispatchPrivacySnapshot {
  return {
    shareableFields: [...shareableFields],
    excludedFields: ["project.name", "project.budget", "project.files", "project.memory", "request.rawNeed", "request.clarificationAnswers", "delivery.exactAddress"],
    projectNameShared: false,
    exactAddressFieldIncluded: false,
    budgetShared: false,
    filesShared: false,
    memoryShared: false,
    rawNeedShared: false,
    clarificationAnswersShared: false,
    locationReviewRequired: true,
  };
}

function dispatchRevisionFingerprint(target: DispatchDraftRecord["target"], recipientIds: string[], inviteDrafts: InviteDraft[], payload: DispatchPayload, privacySnapshot: DispatchPrivacySnapshot) {
  return `fnv1a-${purchaseRequestStableHash(JSON.stringify(stablePurchaseRequestValue({ target, recipientIds, inviteDrafts, payload, privacySnapshot })))}`;
}

function dispatchPlanApprovalTarget(dispatchDraft: DispatchDraftRecord, revision: DispatchDraftRevision): DispatchPlanApprovalRecord["target"] {
  return {
    type: "dispatch-draft-revision",
    dispatchDraftId: dispatchDraft.id,
    dispatchDraftVersion: revision.version,
    dispatchRevisionId: revision.id,
    dispatchRevisionFingerprint: revision.fingerprint,
    requestId: dispatchDraft.target.requestId,
    requestVersion: dispatchDraft.target.requestVersion,
    requestRevisionId: dispatchDraft.target.revisionId,
    contentApprovalId: dispatchDraft.target.approvalId,
  };
}

function dispatchPlanFingerprint(target: DispatchPlanApprovalRecord["target"], snapshot: DispatchPlanApprovalRecord["snapshot"]) {
  return `fnv1a-${purchaseRequestStableHash(JSON.stringify(stablePurchaseRequestValue({ target, snapshot })))}`;
}

function dispatchPlanApprovalDedupeKey(projectId: string, target: DispatchPlanApprovalRecord["target"], planFingerprint: string) {
  return `${projectId}:${target.dispatchDraftId}:${target.dispatchRevisionId}:${planFingerprint}:local-plan-approval`;
}

function dispatchPlanApprovalEffectiveStatus(
  record: DispatchPlanApprovalRecord,
  dispatchDraft: DispatchDraftRecord | null,
  request: ProjectPurchaseRequestRecord,
  contentApproval: ProjectApprovalRecord,
  contacts: SupplierContactRecord[],
): DispatchPlanApprovalEffectiveStatus {
  const revision = dispatchDraft?.revisions.find((item) => item.id === record.target.dispatchRevisionId) ?? null;
  const dependenciesAreExactAndCurrent = Boolean(dispatchDraft)
    && dispatchDraft!.projectId === record.projectId
    && dispatchDraft!.id === record.target.dispatchDraftId
    && dispatchDraft!.currentRevisionId === record.target.dispatchRevisionId
    && dispatchDraft!.version === record.target.dispatchDraftVersion
    && revision?.version === record.target.dispatchDraftVersion
    && revision?.fingerprint === record.target.dispatchRevisionFingerprint
    && request.projectId === record.projectId
    && request.id === record.target.requestId
    && request.version === record.target.requestVersion
    && request.status === "ready-for-review"
    && request.reviewRevisions.some((item) => item.id === record.target.requestRevisionId && item.requestVersion === record.target.requestVersion)
    && contentApproval.projectId === record.projectId
    && contentApproval.id === record.target.contentApprovalId
    && contentApproval.status === "approved"
    && contentApproval.target.id === record.target.requestId
    && contentApproval.target.version === record.target.requestVersion
    && contentApproval.target.revisionId === record.target.requestRevisionId
    && approvalSnapshotMatchesRevision(contentApproval, request)
    && record.snapshot.recipients.every((recipient) => {
      const contact = contacts.find((item) => item.id === recipient.supplierContactId && item.projectId === record.projectId);
      return Boolean(contact)
        && contact!.version === recipient.supplierContactVersion
        && supplierContactCanRespond(contact!, request.requestKind);
    });
  return dependenciesAreExactAndCurrent ? record.status : "invalidated";
}

function dispatchPayloadRows(payload: DispatchPayload) {
  if (payload.requestKind === "service" && payload.service) {
    return [
      ["service.scope", payload.service.scope],
      ["service.location", payload.service.location],
      ["service.locationPrecision", "فقط محدوده یا بخش پروژه"],
      ["service.sizeOrVolume", payload.service.sizeOrVolume],
      ["service.qualification", payload.service.qualification],
      ["service.timing", payload.service.timing],
      ["service.method", payload.service.method],
      ["service.inScope", payload.service.inScope],
      ["service.outOfScope", payload.service.outOfScope],
      ["service.warranty", payload.service.warranty],
      ["service.paymentTerms", payload.service.paymentTerms],
    ] as Array<[string, string | null]>;
  }
  return payload.items.flatMap((item, index) => [
    [`items.${index}.name`, item.name],
    [`items.${index}.quantity`, item.quantity],
    [`items.${index}.unit`, item.unit],
    [`items.${index}.brandOrGrade`, item.brandOrGrade],
    [`items.${index}.specification`, item.specification],
    [`items.${index}.alternatives`, purchaseRequestAlternativesLabel(item.alternatives)],
  ] as Array<[string, string | null]>).concat([
    ["delivery.area", payload.delivery?.area ?? null],
    ["delivery.neededBy", payload.delivery?.neededBy ?? null],
    ["unresolvedTerms.transport", payload.unresolvedTerms?.transport === "unknown" ? "نامشخص" : payload.unresolvedTerms?.transport ?? null],
    ["unresolvedTerms.tax", payload.unresolvedTerms?.tax === "unknown" ? "نامشخص" : payload.unresolvedTerms?.tax ?? null],
    ["unresolvedTerms.paymentTerms", payload.unresolvedTerms?.paymentTerms === "unknown" ? "نامشخص" : payload.unresolvedTerms?.paymentTerms ?? null],
  ]);
}

type PurchaseRequestClarificationSpec = { fieldPath: string; question: string; answer: string | null };

function purchaseRequestClarificationSpecs(request: Pick<ProjectPurchaseRequestRecord, "requestKind" | "items" | "service" | "delivery" | "unresolvedTerms">): PurchaseRequestClarificationSpec[] {
  if (request.requestKind === "service") {
    const service = request.service;
    return [
      { fieldPath: "service.scope", question: "دامنهٔ دقیق خدمت چیست؟", answer: service?.scope ?? null },
      { fieldPath: "service.location", question: "خدمت در کدام محدودهٔ مجاز انجام می‌شود؟", answer: service?.location ?? null },
      { fieldPath: "service.sizeOrVolume", question: "اندازه یا حجم خدمت چقدر است؟", answer: service?.sizeOrVolume ?? null },
      { fieldPath: "service.qualification", question: "چه صلاحیت یا گواهی‌ای لازم است؟", answer: service?.qualification ?? null },
      { fieldPath: "service.timing", question: "زمان شروع یا پایان خدمت چه موقع است؟", answer: service?.timing ?? null },
      { fieldPath: "service.method", question: "روش اجرای مورد انتظار چیست؟", answer: service?.method ?? null },
      { fieldPath: "service.inScope", question: "چه مواردی داخل دامنهٔ خدمت است؟", answer: service?.inScope ?? null },
      { fieldPath: "service.outOfScope", question: "چه مواردی خارج از دامنهٔ خدمت است؟", answer: service?.outOfScope ?? null },
      { fieldPath: "service.warranty", question: "ضمانت اعلامی خدمت چیست؟", answer: service?.warranty ?? null },
      { fieldPath: "service.paymentTerms", question: "شرایط پرداخت خدمت چیست؟", answer: service?.paymentTerms ?? null },
    ];
  }
  const itemSpecs = request.items.flatMap((item, index): PurchaseRequestClarificationSpec[] => {
    const itemLabel = request.items.length > 1 ? `قلم ${index + 1}` : "قلم";
    return [
      { fieldPath: `items.${item.id}.name`, question: `نام ${itemLabel} چیست؟`, answer: item.name },
      { fieldPath: `items.${item.id}.quantity`, question: `مقدار ${itemLabel} چقدر است؟`, answer: item.quantity },
      { fieldPath: `items.${item.id}.unit`, question: `واحد ${itemLabel} چیست؟`, answer: item.unit },
      { fieldPath: `items.${item.id}.brandOrGrade`, question: `برند یا گرید ${itemLabel} چیست؟`, answer: item.brandOrGrade },
      { fieldPath: `items.${item.id}.alternatives`, question: `جایگزین برای ${itemLabel} مجاز است؟`, answer: item.alternatives === "unknown" ? null : purchaseRequestAlternativesLabel(item.alternatives) },
    ];
  });
  return itemSpecs.concat([
    { fieldPath: "delivery.area", question: "محدودهٔ تقریبی تحویل کجاست؟", answer: request.delivery.area === "نامشخص" ? null : request.delivery.area },
    { fieldPath: "delivery.neededBy", question: "موعد موردنیاز چه زمانی است؟", answer: request.delivery.neededBy },
    { fieldPath: "terms.transport", question: "شرایط حمل چیست؟", answer: request.unresolvedTerms.transport === "unknown" ? null : request.unresolvedTerms.transport },
    { fieldPath: "terms.tax", question: "وضعیت مالیات چگونه است؟", answer: request.unresolvedTerms.tax === "unknown" ? null : request.unresolvedTerms.tax },
    { fieldPath: "terms.paymentTerms", question: "شرایط پرداخت چیست؟", answer: request.unresolvedTerms.paymentTerms === "unknown" ? null : request.unresolvedTerms.paymentTerms },
  ]);
}

function reconcilePurchaseRequestClarifications(
  request: Pick<ProjectPurchaseRequestRecord, "requestKind" | "items" | "service" | "delivery" | "unresolvedTerms">,
  existing: PurchaseRequestClarificationAnswer[],
  timestamp: string,
  source: PurchaseRequestRecordSource = "ثبت مستقیم شما",
) {
  const existingByPath = new Map(existing.map((answer) => [answer.fieldPath, answer]));
  return purchaseRequestClarificationSpecs(request).flatMap((spec): PurchaseRequestClarificationAnswer[] => {
    const previous = existingByPath.get(spec.fieldPath);
    if (!previous && spec.answer !== null) return [];
    const status: PurchaseRequestAnswerStatus = spec.answer === null
      ? source === "مهاجرت محلی" ? "needs-confirmation" : "explicitly-unknown"
      : "answered";
    if (previous && previous.answer === spec.answer && previous.status === status && previous.question === spec.question) return [previous];
    const version = previous ? previous.version + 1 : 1;
    const stableMigrationSuffix = purchaseRequestStableHash(`${spec.fieldPath}:${spec.question}:${spec.answer ?? "unknown"}`);
    const event = { id: source === "مهاجرت محلی" && !previous ? `legacy-clarification-event-${stableMigrationSuffix}` : `clarification-event-${window.crypto.randomUUID()}`, type: previous ? "updated" as const : "created" as const, actor: source === "مهاجرت محلی" ? "مهاجرت محلی" as const : "شما" as const, at: timestamp, version };
    return [{
      id: previous?.id ?? (source === "مهاجرت محلی" ? `legacy-clarification-${stableMigrationSuffix}` : `clarification-${window.crypto.randomUUID()}`),
      fieldPath: spec.fieldPath,
      question: spec.question,
      answer: spec.answer,
      status,
      source,
      confidence: null,
      completionStatus: status === "answered" ? "complete" : "incomplete",
      version,
      createdAt: previous?.createdAt ?? timestamp,
      updatedAt: timestamp,
      history: [...(previous?.history ?? []), event],
    }];
  });
}

function purchaseRequestClarificationsMatchSpecs(
  request: Pick<ProjectPurchaseRequestRecord, "requestKind" | "items" | "service" | "delivery" | "unresolvedTerms">,
  clarifications: PurchaseRequestClarificationAnswer[],
) {
  const specs = purchaseRequestClarificationSpecs(request);
  const specsByPath = new Map(specs.map((spec) => [spec.fieldPath, spec]));
  const clarificationsByPath = new Map(clarifications.map((answer) => [answer.fieldPath, answer]));
  return clarifications.every((answer) => {
    const spec = specsByPath.get(answer.fieldPath);
    return Boolean(spec) && answer.question === spec!.question && answer.answer === spec!.answer;
  }) && specs.every((spec) => spec.answer !== null || clarificationsByPath.has(spec.fieldPath));
}

function isValidPurchaseRequestText(value: unknown, maxLength: number, nullable = true): value is string | null {
  if (value === null) return nullable;
  return typeof value === "string" && hasVisibleProjectTaskText(value) && value === value.trim() && value.length <= maxLength;
}

function parsePurchaseRequestSubrecordHistory(value: unknown, createdAt: string, updatedAt: string, version: number) {
  if (!Array.isArray(value) || value.length !== version || version < 1) return null;
  const ids = new Set<string>();
  const history: PurchaseRequestSubrecordEvent[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const event = value[index];
    const id = typeof event?.id === "string" ? event.id.trim() : "";
    const at = typeof event?.at === "string" ? event.at.trim() : "";
    if (!id || ids.has(id) || (event?.type !== "created" && event?.type !== "updated") || (event?.actor !== "شما" && event?.actor !== "مهاجرت محلی") || event?.version !== index + 1 || !isValidProjectFileDate(at) || (index === 0 ? event.type !== "created" : event.type !== "updated") || (index > 0 && new Date(at).getTime() < new Date(history[index - 1].at).getTime())) return null;
    ids.add(id);
    history.push({ id, type: event.type, actor: event.actor, at, version: event.version });
  }
  return history[0]?.at === createdAt && history[history.length - 1]?.at === updatedAt ? history : null;
}

function purchaseRequestSubrecordSourceIsReachable(source: PurchaseRequestRecordSource, history: PurchaseRequestSubrecordEvent[], version: number) {
  if (source === "مهاجرت محلی") return version === 1 && history.length === 1 && history[0]?.actor === "مهاجرت محلی";
  if (history[0]?.actor === "شما") return history.every((event) => event.actor === "شما");
  return version >= 2 && history[0]?.actor === "مهاجرت محلی" && history.slice(1).every((event) => event.actor === "شما");
}

function parseProductRequestItem(value: any): ProductRequestItem | null {
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const name = value?.name === null ? null : typeof value?.name === "string" ? value.name.trim() : "";
  const quantity = value?.quantity === null ? null : typeof value?.quantity === "string" ? value.quantity.trim() : "";
  const unit = value?.unit === null ? null : typeof value?.unit === "string" ? value.unit.trim() : "";
  const brandOrGrade = value?.brandOrGrade === null ? null : typeof value?.brandOrGrade === "string" ? value.brandOrGrade.trim() : "";
  const specification = value?.specification === null ? null : typeof value?.specification === "string" ? value.specification.trim() : "";
  const createdAt = typeof value?.createdAt === "string" ? value.createdAt.trim() : "";
  const updatedAt = typeof value?.updatedAt === "string" ? value.updatedAt.trim() : "";
  const version = value?.version;
  const history = Number.isInteger(version) ? parsePurchaseRequestSubrecordHistory(value?.history, createdAt, updatedAt, version) : null;
  const completionStatus: PurchaseRequestCompletionStatus = name && quantity && unit ? "complete" : "incomplete";
  if (!id || !isValidPurchaseRequestText(name, 100) || quantity !== null && (quantity === "" || normalizeProjectNumber(quantity, false) !== quantity || Number(quantity) <= 0) || unit !== null && !purchaseRequestUnits.includes(unit as PurchaseRequestUnit) || !isValidPurchaseRequestText(brandOrGrade, 100) || !isValidPurchaseRequestText(specification, 500) || !["unknown", "allowed", "not-allowed", "approval-required"].includes(value?.alternatives) || (value?.source !== "ثبت مستقیم شما" && value?.source !== "مهاجرت محلی") || value?.confidence !== null || value?.completionStatus !== completionStatus || !isValidProjectFileDate(createdAt) || !isValidProjectFileDate(updatedAt) || !history || !purchaseRequestSubrecordSourceIsReachable(value.source, history, version)) return null;
  return { id, name, quantity, unit: unit as PurchaseRequestUnit | null, brandOrGrade, specification, alternatives: value.alternatives, source: value.source, confidence: null, completionStatus, version, createdAt, updatedAt, history };
}

function parseServiceRequestSpec(value: any): ServiceRequestSpec | null {
  if (!value) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  const fields = ["scope", "location", "sizeOrVolume", "qualification", "timing", "method", "inScope", "outOfScope", "warranty", "paymentTerms"] as const;
  const normalized = Object.fromEntries(fields.map((field) => [field, value[field] === null ? null : typeof value[field] === "string" ? value[field].trim() : ""]));
  const createdAt = typeof value.createdAt === "string" ? value.createdAt.trim() : "";
  const updatedAt = typeof value.updatedAt === "string" ? value.updatedAt.trim() : "";
  const version = value.version;
  const history = Number.isInteger(version) ? parsePurchaseRequestSubrecordHistory(value.history, createdAt, updatedAt, version) : null;
  const completionStatus: PurchaseRequestCompletionStatus = normalized.scope && normalized.location ? "complete" : "incomplete";
  if (!id || fields.some((field) => !isValidPurchaseRequestText(normalized[field], field === "scope" || field === "inScope" || field === "outOfScope" ? 500 : 160)) || value.locationPrecision !== "area-or-project-section" || (value.source !== "ثبت مستقیم شما" && value.source !== "مهاجرت محلی") || value.confidence !== null || value.completionStatus !== completionStatus || !isValidProjectFileDate(createdAt) || !isValidProjectFileDate(updatedAt) || !history || !purchaseRequestSubrecordSourceIsReachable(value.source, history, version)) return null;
  return { id, ...(normalized as Pick<ServiceRequestSpec, (typeof fields)[number]>), locationPrecision: "area-or-project-section", source: value.source, confidence: null, completionStatus, version, createdAt, updatedAt, history };
}

function parsePurchaseRequestClarificationAnswer(value: any): PurchaseRequestClarificationAnswer | null {
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const fieldPath = typeof value?.fieldPath === "string" ? value.fieldPath.trim() : "";
  const question = typeof value?.question === "string" ? value.question.trim() : "";
  const answer = value?.answer === null ? null : typeof value?.answer === "string" ? value.answer.trim() : "";
  const createdAt = typeof value?.createdAt === "string" ? value.createdAt.trim() : "";
  const updatedAt = typeof value?.updatedAt === "string" ? value.updatedAt.trim() : "";
  const version = value?.version;
  const history = Number.isInteger(version) ? parsePurchaseRequestSubrecordHistory(value?.history, createdAt, updatedAt, version) : null;
  const status = value?.status as PurchaseRequestAnswerStatus;
  const completionStatus: PurchaseRequestCompletionStatus = status === "answered" ? "complete" : "incomplete";
  const sourceIsReachable = history && (value?.source === "ثبت مستقیم شما" || value?.source === "مهاجرت محلی")
    ? purchaseRequestSubrecordSourceIsReachable(value.source, history, version)
    : false;
  const reachableState = status === "answered"
    ? value?.source === "ثبت مستقیم شما" && Number.isInteger(version) && version >= 2 && sourceIsReachable
    : status === "explicitly-unknown"
      ? value?.source === "ثبت مستقیم شما" && sourceIsReachable
      : value?.source === "مهاجرت محلی" && version === 1 && sourceIsReachable;
  if (!id || !fieldPath || !hasVisibleProjectTaskText(question) || question.length > 180 || (answer !== null && (!hasVisibleProjectTaskText(answer) || answer.length > 500)) || !["answered", "explicitly-unknown", "needs-confirmation"].includes(status) || (status === "answered") !== (answer !== null) || !reachableState || value?.confidence !== null || value?.completionStatus !== completionStatus || !isValidProjectFileDate(createdAt) || !isValidProjectFileDate(updatedAt) || !history) return null;
  return { id, fieldPath, question, answer, status, source: value.source, confidence: null, completionStatus, version, createdAt, updatedAt, history };
}

function parsePurchaseRequestSnapshot(value: any): PurchaseRequestSnapshot | null {
  const requestKind = value?.requestKind as PurchaseRequestKind;
  const items: Array<ProductRequestItem | null> = Array.isArray(value?.items) ? value.items.map(parseProductRequestItem) : [];
  const service = value?.service === null ? null : parseServiceRequestSpec(value?.service);
  const clarifications: Array<PurchaseRequestClarificationAnswer | null> = Array.isArray(value?.clarificationAnswers) ? value.clarificationAnswers.map(parsePurchaseRequestClarificationAnswer) : [];
  const rawNeed = typeof value?.rawNeed === "string" ? value.rawNeed.trim() : "";
  const deliveryArea = typeof value?.delivery?.area === "string" ? value.delivery.area.trim() : "";
  const neededBy = value?.delivery?.neededBy === null ? null : typeof value?.delivery?.neededBy === "string" ? value.delivery.neededBy.trim() : "";
  const itemMirror = value?.item === null ? null : parseProductRequestItem(value?.item);
  const terms = [value?.unresolvedTerms?.transport, value?.unresolvedTerms?.tax, value?.unresolvedTerms?.paymentTerms];
  if ((requestKind !== "product" && requestKind !== "service") || !hasVisibleProjectTaskText(rawNeed) || rawNeed.length > 800 || items.some((item) => item === null) || clarifications.some((answer) => answer === null) || new Set((items as ProductRequestItem[]).map((item) => item.id)).size !== items.length || new Set((clarifications as PurchaseRequestClarificationAnswer[]).map((answer) => answer.id)).size !== clarifications.length || new Set((clarifications as PurchaseRequestClarificationAnswer[]).map((answer) => answer.fieldPath)).size !== clarifications.length || value?.delivery?.city !== "تهران" || !isValidPurchaseRequestText(deliveryArea, 120, false) || value?.delivery?.exactAddressShared !== false || !isValidPurchaseRequestText(neededBy, 80) || terms.some((term) => typeof term !== "string" || !hasVisibleProjectTaskText(term) || term.length > 160) || value?.sharingStatus !== "ارسال نشده") return null;
  if (requestKind === "product" && (items.length < 1 || items.length > 8 || service !== null || !itemMirror || JSON.stringify(stablePurchaseRequestValue(itemMirror)) !== JSON.stringify(stablePurchaseRequestValue(items[0])))) return null;
  if (requestKind === "service" && (items.length !== 0 || itemMirror !== null || !service)) return null;
  const snapshot = { requestKind, rawNeed, items: items as ProductRequestItem[], item: itemMirror, service, delivery: { city: "تهران" as const, area: deliveryArea as string, exactAddressShared: false as const, neededBy }, unresolvedTerms: { transport: terms[0] as string, tax: terms[1] as string, paymentTerms: terms[2] as string }, clarificationAnswers: clarifications as PurchaseRequestClarificationAnswer[], sharingStatus: "ارسال نشده" as const };
  return purchaseRequestClarificationsMatchSpecs(snapshot, snapshot.clarificationAnswers) ? snapshot : null;
}

function normalizeProjectNumber(value: string, integerOnly: boolean) {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const normalized = value
    .trim()
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[٬,\s]/g, "")
    .replace(/٫/g, ".");

  if (!normalized) return "";
  const validShape = integerOnly ? /^\d+$/ : /^(?:\d+(?:\.\d*)?|\.\d+)$/;
  if (!validShape.test(normalized)) return null;
  const numericValue = Number(normalized);
  if (!Number.isFinite(numericValue) || numericValue < 0 || (integerOnly && !Number.isInteger(numericValue))) return null;
  return String(numericValue);
}

function normalizeStoredProjectMetric(value: unknown, integerOnly: boolean) {
  const rawValue = typeof value === "string"
    ? value
    : typeof value === "number" && Number.isFinite(value)
      ? String(value)
      : "";
  return normalizeProjectNumber(rawValue, integerOnly) ?? "";
}

function normalizeStoredProjectStage(value: unknown) {
  if (typeof value !== "string") return "";
  const normalizedStage = value.trim();
  if (isKnownProjectStage(normalizedStage)) return normalizedStage;
  return legacyProjectStageAliases[normalizedStage] ?? normalizedStage;
}

function parseStoredProjects(rawProjects: string | null): BuilderProject[] | null {
  if (rawProjects === null) return null;
  try {
    const parsed = JSON.parse(rawProjects);
    if (!Array.isArray(parsed)) return null;
    const normalizedProjects = parsed.flatMap((project): BuilderProject[] => {
      if (
        typeof project?.id !== "string"
        || typeof project?.name !== "string"
        || typeof project?.location !== "string"
        || typeof project?.stage !== "string"
        || typeof project?.createdAt !== "string"
      ) return [];
      return [{
        id: project.id,
        name: project.name,
        location: project.location,
        stage: normalizeStoredProjectStage(project.stage),
        usage: typeof project.usage === "string" && projectUsages.includes(project.usage as (typeof projectUsages)[number]) ? project.usage : "",
        landArea: normalizeStoredProjectMetric(project.landArea, false),
        builtArea: normalizeStoredProjectMetric(project.builtArea, false),
        aboveGroundFloors: normalizeStoredProjectMetric(project.aboveGroundFloors, true),
        basementFloors: normalizeStoredProjectMetric(project.basementFloors, true),
        unitCount: normalizeStoredProjectMetric(project.unitCount, true),
        createdAt: project.createdAt,
      }];
    });
    return parsed.length > 0 && normalizedProjects.length === 0 ? null : normalizedProjects;
  } catch {
    return null;
  }
}

function readStoredProjects(): BuilderProject[] {
  try {
    const currentProjects = parseStoredProjects(window.localStorage.getItem(projectsStorageKey));
    if (currentProjects !== null) return currentProjects;
    return parseStoredProjects(window.localStorage.getItem(legacyProjectsStorageKey)) ?? [];
  } catch {
    return [];
  }
}

function readStoredProjectFiles(): LocalRecordsReadResult<ProjectFileRecord> {
  try {
    const rawFiles = window.localStorage.getItem(projectFilesStorageKey);
    if (!rawFiles) return { records: [], readError: false };
    const parsed = JSON.parse(rawFiles);
    if (!Array.isArray(parsed)) return { records: [], readError: true };
    const seenIds = new Set<string>();
    const records = parsed.flatMap((file): ProjectFileRecord[] => {
      const id = typeof file?.id === "string" ? file.id.trim() : "";
      const projectId = typeof file?.projectId === "string" ? file.projectId.trim() : "";
      const displayName = typeof file?.displayName === "string" ? file.displayName.trim() : "";
      const originalName = typeof file?.originalName === "string" ? file.originalName.trim() : "";
      const mimeType = typeof file?.mimeType === "string" ? file.mimeType.trim() : "";
      const createdAt = typeof file?.createdAt === "string" ? file.createdAt.trim() : "";
      if (
        !id
        || seenIds.has(id)
        || !projectId
        || !displayName
        || !originalName
        || !isSupportedProjectFileName(originalName)
        || !mimeType
        || typeof file?.size !== "number"
        || !Number.isFinite(file.size)
        || file.size < 0
        || !projectFileCategories.includes(file?.category as ProjectFileCategory)
        || (file?.source !== "انتخاب مستقیم از دستگاه" && file?.source !== "دوربین دستگاه")
        || file?.version !== 1
        || !isValidProjectFileDate(createdAt)
      ) return [];
      seenIds.add(id);
      const isImage = isProjectImage({ mimeType, originalName });
      return [{
        id,
        projectId,
        displayName,
        originalName,
        mimeType,
        size: file.size,
        category: file.category as ProjectFileCategory,
        source: file.source,
        status: "ثبت محلی",
        version: 1,
        projectStage: normalizeStoredProjectStage(file.projectStage),
        visibility: "خصوصی پروژه",
        storageMode: isImage && file.storageMode === "browser-image" ? "browser-image" : "metadata-only",
        sourceModifiedAt: typeof file.sourceModifiedAt === "string" && isValidProjectFileDate(file.sourceModifiedAt.trim()) ? file.sourceModifiedAt.trim() : null,
        createdAt,
      }];
    });
    return { records, readError: false };
  } catch {
    return { records: [], readError: true };
  }
}

function readStoredProjectMemories(): LocalRecordsReadResult<ProjectMemoryRecord> {
  try {
    const rawMemories = window.localStorage.getItem(projectMemoriesStorageKey);
    if (!rawMemories) return { records: [], readError: false };
    const parsed = JSON.parse(rawMemories);
    if (!Array.isArray(parsed)) return { records: [], readError: true };
    const seenIds = new Set<string>();
    const records = parsed.flatMap((memory): ProjectMemoryRecord[] => {
      const id = typeof memory?.id === "string" ? memory.id.trim() : "";
      const projectId = typeof memory?.projectId === "string" ? memory.projectId.trim() : "";
      const title = typeof memory?.title === "string" ? memory.title.trim() : "";
      const content = typeof memory?.content === "string" ? memory.content.trim() : "";
      const createdAt = typeof memory?.createdAt === "string" ? memory.createdAt.trim() : "";
      const updatedAt = typeof memory?.updatedAt === "string" ? memory.updatedAt.trim() : "";
      if (
        !id
        || seenIds.has(id)
        || !projectId
        || !title
        || title.length > 80
        || !content
        || content.length > 800
        || !projectMemoryKinds.includes(memory?.kind as ProjectMemoryKind)
        || memory?.source !== "ثبت مستقیم شما"
        || memory?.visibility !== "خصوصی پروژه"
        || typeof memory?.useInContext !== "boolean"
        || memory?.status !== "ثبت محلی"
        || memory?.version !== 1
        || !isValidProjectFileDate(createdAt)
        || !isValidProjectFileDate(updatedAt)
        || new Date(updatedAt).getTime() < new Date(createdAt).getTime()
      ) return [];
      seenIds.add(id);
      return [{
        id,
        projectId,
        title,
        content,
        kind: memory.kind as ProjectMemoryKind,
        source: "ثبت مستقیم شما",
        visibility: "خصوصی پروژه",
        useInContext: memory.useInContext,
        status: "ثبت محلی",
        version: 1,
        createdAt,
        updatedAt,
      }];
    });
    return { records, readError: false };
  } catch {
    return { records: [], readError: true };
  }
}

function hasVisibleProjectTaskText(value: string) {
  return value.replace(/[\s\u200b\u200c\u200d\u2060\ufeff]/gu, "").length > 0;
}

function projectTaskHistoryReachesStatus(history: ProjectTaskEvent[], status: ProjectTaskStatus) {
  let reachableStatus: ProjectTaskStatus = "in-progress";
  for (const [index, event] of history.entries()) {
    if (index === 0) {
      if (event.type !== "created") return false;
      continue;
    }
    if (event.type === "updated") continue;
    if (event.type === "completed" && reachableStatus === "in-progress") {
      reachableStatus = "completed";
      continue;
    }
    if (event.type === "reopened" && reachableStatus === "completed") {
      reachableStatus = "in-progress";
      continue;
    }
    return false;
  }
  return reachableStatus === status;
}

function readStoredProjectTasks(): LocalRecordsReadResult<ProjectTaskRecord> {
  try {
    const rawTasks = window.localStorage.getItem(projectTasksStorageKey);
    if (rawTasks === null) return { records: [], readError: false };
    const parsed = JSON.parse(rawTasks);
    if (!Array.isArray(parsed)) return { records: [], readError: true };

    const seenTaskIds = new Set<string>();
    let readError = false;
    const records = parsed.flatMap((task): ProjectTaskRecord[] => {
      const id = typeof task?.id === "string" ? task.id.trim() : "";
      const projectId = typeof task?.projectId === "string" ? task.projectId.trim() : "";
      const title = typeof task?.title === "string" ? task.title.trim() : "";
      const currentStep = typeof task?.currentStep === "string" ? task.currentStep.trim() : "";
      const dueDate = task?.dueDate === undefined || task?.dueDate === null
        ? null
        : typeof task.dueDate === "string"
          ? task.dueDate.trim()
          : "";
      const createdAt = typeof task?.createdAt === "string" ? task.createdAt.trim() : "";
      const updatedAt = typeof task?.updatedAt === "string" ? task.updatedAt.trim() : "";
      const completedAt = task?.completedAt === null ? null : typeof task?.completedAt === "string" ? task.completedAt.trim() : "";
      const version = task?.version;
      const eventIds = new Set<string>();
      const history: ProjectTaskEvent[] = Array.isArray(task?.history) ? task.history.flatMap((event: any): ProjectTaskEvent[] => {
        const eventId = typeof event?.id === "string" ? event.id.trim() : "";
        const at = typeof event?.at === "string" ? event.at.trim() : "";
        if (
          !eventId
          || eventIds.has(eventId)
          || (event?.type !== "created" && event?.type !== "updated" && event?.type !== "completed" && event?.type !== "reopened")
          || event?.actor !== "شما"
          || !Number.isInteger(event?.version)
          || event.version < 1
          || !isValidProjectFileDate(at)
        ) return [];
        eventIds.add(eventId);
        return [{ id: eventId, type: event.type as ProjectTaskEventType, actor: "شما", at, version: event.version }];
      }) : [];
      const historyIsValid = Array.isArray(task?.history)
        && history.length === task.history.length
        && Number.isInteger(version)
        && version >= 1
        && history.length === version
        && history.every((event, index) => event.version === index + 1)
        && history.every((event, index) => index === 0 || new Date(event.at).getTime() >= new Date(history[index - 1].at).getTime())
        && history[0]?.at === createdAt
        && history[history.length - 1]?.at === updatedAt
        && projectTaskHistoryReachesStatus(history, task?.status);
      const lastCompletedEvent = [...history].reverse().find((event) => event.type === "completed") ?? null;
      const completedStateIsValid = task?.status === "completed"
        ? typeof completedAt === "string" && completedAt === lastCompletedEvent?.at && isValidProjectFileDate(completedAt)
        : task?.status === "in-progress" && completedAt === null;

      if (
        !id
        || seenTaskIds.has(id)
        || !projectId
        || !hasVisibleProjectTaskText(title)
        || title.length > 80
        || !hasVisibleProjectTaskText(currentStep)
        || currentStep.length > 300
        || dueDate !== null && (!hasVisibleProjectTaskText(dueDate) || dueDate.length > 40)
        || task?.source !== "ثبت مستقیم شما"
        || task?.visibility !== "خصوصی پروژه"
        || task?.localStatus !== "ثبت محلی"
        || !isValidProjectFileDate(createdAt)
        || !isValidProjectFileDate(updatedAt)
        || new Date(updatedAt).getTime() < new Date(createdAt).getTime()
        || !historyIsValid
        || !completedStateIsValid
      ) {
        readError = true;
        return [];
      }

      seenTaskIds.add(id);
      return [{
        id,
        projectId,
        title,
        currentStep,
        dueDate,
        status: task.status as ProjectTaskStatus,
        source: "ثبت مستقیم شما",
        visibility: "خصوصی پروژه",
        localStatus: "ثبت محلی",
        version,
        createdAt,
        updatedAt,
        completedAt,
        history,
      }];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
}

function parseV2ProjectPurchaseRequest(request: any): ProjectPurchaseRequestRecord | null {
  const id = typeof request?.id === "string" ? request.id.trim() : "";
  const projectId = typeof request?.projectId === "string" ? request.projectId.trim() : "";
  const rawNeedText = typeof request?.rawNeed?.text === "string" ? request.rawNeed.text.trim() : "";
  const capturedAt = typeof request?.rawNeed?.capturedAt === "string" ? request.rawNeed.capturedAt.trim() : "";
  const createdAt = typeof request?.createdAt === "string" ? request.createdAt.trim() : "";
  const updatedAt = typeof request?.updatedAt === "string" ? request.updatedAt.trim() : "";
  const readyAt = request?.readyAt === null ? null : typeof request?.readyAt === "string" ? request.readyAt.trim() : "";
  const version = request?.version;
  const currentSnapshot = parsePurchaseRequestSnapshot({
    requestKind: request?.requestKind,
    rawNeed: rawNeedText,
    items: request?.items,
    item: request?.item,
    service: request?.service,
    delivery: request?.delivery,
    unresolvedTerms: request?.unresolvedTerms,
    clarificationAnswers: request?.clarificationAnswers,
    sharingStatus: request?.sharingStatus,
  });
  if (!id || !projectId || !currentSnapshot || request?.schemaVersion !== 2 || request?.rawNeed?.source !== "ثبت مستقیم شما" || capturedAt !== createdAt || !isValidProjectFileDate(capturedAt) || !isValidProjectFileDate(updatedAt) || !Number.isInteger(version) || version < 1 || request?.visibility !== "خصوصی پروژه" || request?.localStatus !== "ثبت محلی" || request?.sharingStatus !== "ارسال نشده") return null;

  const eventIds = new Set<string>();
  const history: PurchaseRequestEvent[] = Array.isArray(request?.history) ? request.history.flatMap((event: any): PurchaseRequestEvent[] => {
    const eventId = typeof event?.id === "string" ? event.id.trim() : "";
    const at = typeof event?.at === "string" ? event.at.trim() : "";
    if (!eventId || eventIds.has(eventId) || !["created", "updated", "marked-ready-for-review", "returned-to-draft"].includes(event?.type) || event?.actor !== "شما" || !Number.isInteger(event?.version) || event.version < 1 || !isValidProjectFileDate(at)) return [];
    eventIds.add(eventId);
    return [{ id: eventId, type: event.type, actor: "شما", at, version: event.version }];
  }) : [];
  let derivedStatus: PurchaseRequestStatus = "draft";
  let validTransitions = history[0]?.type === "created";
  for (const event of history.slice(1)) {
    if (event.type === "updated" && derivedStatus === "draft") continue;
    if (event.type === "marked-ready-for-review" && derivedStatus === "draft") { derivedStatus = "ready-for-review"; continue; }
    if (event.type === "returned-to-draft" && derivedStatus === "ready-for-review") { derivedStatus = "draft"; continue; }
    validTransitions = false;
  }
  const historyIsValid = history.length === request.history?.length && history.length === version && history.every((event, index) => event.version === index + 1 && (index === 0 || new Date(event.at).getTime() >= new Date(history[index - 1].at).getTime())) && history[0]?.at === createdAt && history[history.length - 1]?.at === updatedAt && validTransitions;
  const readyStateIsValid = derivedStatus === "ready-for-review"
    ? request?.status === "ready-for-review" && readyAt === updatedAt && history[history.length - 1]?.type === "marked-ready-for-review" && purchaseRequestMissingFields({ ...request, ...currentSnapshot, schemaVersion: 2 } as ProjectPurchaseRequestRecord).length === 0
    : request?.status === "draft" && readyAt === null && ["created", "updated", "returned-to-draft"].includes(history[history.length - 1]?.type ?? "");
  if (!historyIsValid || !readyStateIsValid || new Set(currentSnapshot.items.map((item) => item.id)).size !== currentSnapshot.items.length) return null;

  const revisionIds = new Set<string>();
  const revisionVersions = new Set<number>();
  const reviewRevisions: PurchaseRequestReviewRevision[] = Array.isArray(request?.reviewRevisions) ? request.reviewRevisions.flatMap((revision: any): PurchaseRequestReviewRevision[] => {
    const revisionId = typeof revision?.id === "string" ? revision.id.trim() : "";
    const requestVersion = revision?.requestVersion;
    const revisionCreatedAt = typeof revision?.createdAt === "string" ? revision.createdAt.trim() : "";
    const snapshot = parsePurchaseRequestSnapshot(revision?.snapshot);
    const shareableFields = Array.isArray(revision?.shareableFields) && revision.shareableFields.every((field: unknown) => typeof field === "string" && field.length > 0) ? revision.shareableFields as string[] : [];
    const fingerprint = typeof revision?.fingerprint === "string" ? revision.fingerprint.trim() : "";
    const readyEvent = Number.isInteger(requestVersion) ? history[requestVersion - 1] : undefined;
    if (!revisionId || revisionIds.has(revisionId) || !Number.isInteger(requestVersion) || requestVersion < 1 || requestVersion > version || revisionVersions.has(requestVersion) || !isValidProjectFileDate(revisionCreatedAt) || readyEvent?.type !== "marked-ready-for-review" || readyEvent.at !== revisionCreatedAt || !snapshot || shareableFields.length === 0 || JSON.stringify(shareableFields) !== JSON.stringify(purchaseRequestApprovalShareableFields(snapshot)) || fingerprint !== purchaseRequestRevisionFingerprint(snapshot, shareableFields)) return [];
    revisionIds.add(revisionId);
    revisionVersions.add(requestVersion);
    return [{ id: revisionId, requestVersion, createdAt: revisionCreatedAt, snapshot, shareableFields, fingerprint }];
  }) : [];
  const readyVersions = history.filter((event) => event.type === "marked-ready-for-review").map((event) => event.version);
  const migration = request?.migration === null
    ? null
    : request?.migration?.sourceSchema === 1 && Array.isArray(request.migration.unverifiedReadyVersions) && request.migration.unverifiedReadyVersions.every((item: unknown) => Number.isInteger(item) && readyVersions.includes(item as number)) && new Set(request.migration.unverifiedReadyVersions).size === request.migration.unverifiedReadyVersions.length
      ? { sourceSchema: 1 as const, unverifiedReadyVersions: request.migration.unverifiedReadyVersions as number[] }
      : undefined;
  const readyEventCount = readyVersions.length;
  const currentRevision = reviewRevisions.find((revision) => revision.requestVersion === version);
  const coveredReadyVersions = new Set([...reviewRevisions.map((revision) => revision.requestVersion), ...(migration?.unverifiedReadyVersions ?? [])]);
  if (migration === undefined || reviewRevisions.length !== request.reviewRevisions?.length || coveredReadyVersions.size !== readyEventCount || readyVersions.some((readyVersion) => !coveredReadyVersions.has(readyVersion)) || reviewRevisions.some((revision) => migration?.unverifiedReadyVersions.includes(revision.requestVersion)) || (derivedStatus === "ready-for-review" && (!currentRevision || migration?.unverifiedReadyVersions.includes(version) || JSON.stringify(stablePurchaseRequestValue(currentRevision.snapshot)) !== JSON.stringify(stablePurchaseRequestValue(currentSnapshot)) || JSON.stringify(currentRevision.shareableFields) !== JSON.stringify(purchaseRequestApprovalShareableFields({ ...request, ...currentSnapshot, schemaVersion: 2, reviewRevisions, migration } as ProjectPurchaseRequestRecord))))) return null;

  const record = {
    schemaVersion: 2,
    id,
    projectId,
    requestKind: currentSnapshot.requestKind,
    rawNeed: { text: rawNeedText, source: "ثبت مستقیم شما", capturedAt },
    items: currentSnapshot.items,
    item: currentSnapshot.item,
    service: currentSnapshot.service,
    delivery: currentSnapshot.delivery,
    unresolvedTerms: currentSnapshot.unresolvedTerms,
    clarificationAnswers: currentSnapshot.clarificationAnswers,
    reviewRevisions,
    migration,
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    sharingStatus: "ارسال نشده",
    status: derivedStatus,
    version,
    createdAt,
    updatedAt,
    readyAt,
    history,
  } satisfies ProjectPurchaseRequestRecord;
  if (!purchaseRequestClarificationsMatchSpecs(record, record.clarificationAnswers)) return null;
  return record;
}

function upgradeLegacyProjectPurchaseRequest(legacy: Omit<ProjectPurchaseRequestRecord, "schemaVersion" | "items" | "service" | "clarificationAnswers" | "reviewRevisions" | "migration" | "item"> & { item: Omit<ProductRequestItem, "completionStatus" | "version" | "createdAt" | "updatedAt" | "history"> }): ProjectPurchaseRequestRecord {
  const migrationAt = legacy.updatedAt;
  const item: ProductRequestItem = {
    ...legacy.item,
    source: "مهاجرت محلی",
    completionStatus: legacy.item.name && legacy.item.quantity && legacy.item.unit ? "complete" : "incomplete",
    version: 1,
    createdAt: migrationAt,
    updatedAt: migrationAt,
    history: [{ id: `legacy-item-event-${legacy.item.id}`, type: "created", actor: "مهاجرت محلی", at: migrationAt, version: 1 }],
  };
  const record: ProjectPurchaseRequestRecord = {
    ...legacy,
    schemaVersion: 2,
    items: [item],
    item,
    service: null,
    clarificationAnswers: [],
    reviewRevisions: [],
    migration: { sourceSchema: 1, unverifiedReadyVersions: legacy.history.filter((event) => event.type === "marked-ready-for-review").map((event) => event.version) },
  };
  record.clarificationAnswers = reconcilePurchaseRequestClarifications(record, [], migrationAt, "مهاجرت محلی");
  if (record.status === "ready-for-review") {
    const snapshot = purchaseRequestApprovalSnapshot(record);
    const shareableFields = purchaseRequestApprovalShareableFields(record);
    record.reviewRevisions = [{ id: `legacy-review-${record.id}-${record.version}`, requestVersion: record.version, createdAt: record.updatedAt, snapshot, shareableFields, fingerprint: purchaseRequestRevisionFingerprint(snapshot, shareableFields) }];
    record.migration!.unverifiedReadyVersions = record.migration!.unverifiedReadyVersions.filter((version) => version !== record.version);
  }
  return record;
}

function readStoredProjectPurchaseRequests(): LocalRecordsReadResult<ProjectPurchaseRequestRecord> {
  try {
    const rawRequests = window.localStorage.getItem(projectPurchaseRequestsStorageKey);
    if (rawRequests === null) return { records: [], readError: false };
    const parsed = JSON.parse(rawRequests);
    if (!Array.isArray(parsed)) return { records: [], readError: true };

    const seenRequestIds = new Set<string>();
    let readError = false;
    const records = parsed.flatMap((request): ProjectPurchaseRequestRecord[] => {
      if (request?.schemaVersion === 2) {
        const record = parseV2ProjectPurchaseRequest(request);
        if (!record || seenRequestIds.has(record.id)) {
          readError = true;
          return [];
        }
        seenRequestIds.add(record.id);
        return [record];
      }
      const id = typeof request?.id === "string" ? request.id.trim() : "";
      const projectId = typeof request?.projectId === "string" ? request.projectId.trim() : "";
      const rawNeedText = typeof request?.rawNeed?.text === "string" ? request.rawNeed.text.trim() : "";
      const capturedAt = typeof request?.rawNeed?.capturedAt === "string" ? request.rawNeed.capturedAt.trim() : "";
      const itemId = typeof request?.item?.id === "string" ? request.item.id.trim() : "";
      const itemName = request?.item?.name === null ? null : typeof request?.item?.name === "string" ? request.item.name.trim() : "";
      const quantity = request?.item?.quantity === null ? null : typeof request?.item?.quantity === "string" ? request.item.quantity.trim() : "";
      const unit = request?.item?.unit === null ? null : typeof request?.item?.unit === "string" ? request.item.unit.trim() : "";
      const brandOrGrade = request?.item?.brandOrGrade === null ? null : typeof request?.item?.brandOrGrade === "string" ? request.item.brandOrGrade.trim() : "";
      const specification = request?.item?.specification === null ? null : typeof request?.item?.specification === "string" ? request.item.specification.trim() : "";
      const deliveryArea = typeof request?.delivery?.area === "string" ? request.delivery.area.trim() : "";
      const neededBy = request?.delivery?.neededBy === null ? null : typeof request?.delivery?.neededBy === "string" ? request.delivery.neededBy.trim() : "";
      const createdAt = typeof request?.createdAt === "string" ? request.createdAt.trim() : "";
      const updatedAt = typeof request?.updatedAt === "string" ? request.updatedAt.trim() : "";
      const readyAt = request?.readyAt === null ? null : typeof request?.readyAt === "string" ? request.readyAt.trim() : "";
      const version = request?.version;
      const eventIds = new Set<string>();
      const history: PurchaseRequestEvent[] = Array.isArray(request?.history) ? request.history.flatMap((event: any): PurchaseRequestEvent[] => {
        const eventId = typeof event?.id === "string" ? event.id.trim() : "";
        const at = typeof event?.at === "string" ? event.at.trim() : "";
        if (
          !eventId
          || eventIds.has(eventId)
          || (event?.type !== "created" && event?.type !== "updated" && event?.type !== "marked-ready-for-review" && event?.type !== "returned-to-draft")
          || event?.actor !== "شما"
          || !Number.isInteger(event?.version)
          || event.version < 1
          || !isValidProjectFileDate(at)
        ) return [];
        eventIds.add(eventId);
        return [{ id: eventId, type: event.type as PurchaseRequestEventType, actor: "شما", at, version: event.version }];
      }) : [];

      let derivedStatus: PurchaseRequestStatus = "draft";
      let validTransitions = history[0]?.type === "created";
      for (const event of history.slice(1)) {
        if (event.type === "updated" && derivedStatus === "draft") continue;
        if (event.type === "marked-ready-for-review" && derivedStatus === "draft") {
          derivedStatus = "ready-for-review";
          continue;
        }
        if (event.type === "returned-to-draft" && derivedStatus === "ready-for-review") {
          derivedStatus = "draft";
          continue;
        }
        validTransitions = false;
      }

      const historyIsValid = Array.isArray(request?.history)
        && history.length === request.history.length
        && Number.isInteger(version)
        && version >= 1
        && history.length === version
        && history.every((event, index) => event.version === index + 1)
        && history.every((event, index) => index === 0 || new Date(event.at).getTime() >= new Date(history[index - 1].at).getTime())
        && history[0]?.at === createdAt
        && history[history.length - 1]?.at === updatedAt
        && validTransitions;
      const quantityIsValid = quantity === null || (quantity !== "" && normalizeProjectNumber(quantity, false) === quantity && Number(quantity) > 0);
      const readyStateIsValid = derivedStatus === "ready-for-review"
        ? request?.status === "ready-for-review"
          && typeof readyAt === "string"
          && readyAt === updatedAt
          && history[history.length - 1]?.type === "marked-ready-for-review"
          && itemName !== null
          && quantity !== null
          && unit !== null
          && hasVisibleProjectTaskText(deliveryArea)
        : request?.status === "draft" && readyAt === null && (history[history.length - 1]?.type === "created" || history[history.length - 1]?.type === "updated" || history[history.length - 1]?.type === "returned-to-draft");

      if (
        !id
        || seenRequestIds.has(id)
        || !projectId
        || request?.requestKind !== "product"
        || !hasVisibleProjectTaskText(rawNeedText)
        || rawNeedText.length > 800
        || request?.rawNeed?.source !== "ثبت مستقیم شما"
        || !isValidProjectFileDate(capturedAt)
        || capturedAt !== createdAt
        || !itemId
        || (itemName !== null && (!hasVisibleProjectTaskText(itemName) || itemName.length > 100))
        || !quantityIsValid
        || (unit !== null && !purchaseRequestUnits.includes(unit as PurchaseRequestUnit))
        || (brandOrGrade !== null && (!hasVisibleProjectTaskText(brandOrGrade) || brandOrGrade.length > 100))
        || (specification !== null && (!hasVisibleProjectTaskText(specification) || specification.length > 500))
        || (request?.item?.alternatives !== "unknown" && request?.item?.alternatives !== "allowed" && request?.item?.alternatives !== "not-allowed" && request?.item?.alternatives !== "approval-required")
        || request?.item?.source !== "ثبت مستقیم شما"
        || request?.item?.confidence !== null
        || request?.delivery?.city !== "تهران"
        || !hasVisibleProjectTaskText(deliveryArea)
        || deliveryArea.length > 120
        || request?.delivery?.exactAddressShared !== false
        || (neededBy !== null && (!hasVisibleProjectTaskText(neededBy) || neededBy.length > 80))
        || request?.unresolvedTerms?.transport !== "unknown"
        || request?.unresolvedTerms?.tax !== "unknown"
        || request?.unresolvedTerms?.paymentTerms !== "unknown"
        || request?.visibility !== "خصوصی پروژه"
        || request?.localStatus !== "ثبت محلی"
        || request?.sharingStatus !== "ارسال نشده"
        || !isValidProjectFileDate(createdAt)
        || !isValidProjectFileDate(updatedAt)
        || new Date(updatedAt).getTime() < new Date(createdAt).getTime()
        || !historyIsValid
        || !readyStateIsValid
      ) {
        readError = true;
        return [];
      }

      seenRequestIds.add(id);
      return [upgradeLegacyProjectPurchaseRequest({
        id,
        projectId,
        requestKind: "product",
        rawNeed: { text: rawNeedText, source: "ثبت مستقیم شما", capturedAt },
        item: {
          id: itemId,
          name: itemName,
          quantity,
          unit: unit as PurchaseRequestUnit | null,
          brandOrGrade,
          specification,
          alternatives: request.item.alternatives as PurchaseRequestAlternatives,
          source: "ثبت مستقیم شما",
          confidence: null,
        },
        delivery: { city: "تهران", area: deliveryArea, exactAddressShared: false, neededBy },
        unresolvedTerms: { transport: "unknown", tax: "unknown", paymentTerms: "unknown" },
        visibility: "خصوصی پروژه",
        localStatus: "ثبت محلی",
        sharingStatus: "ارسال نشده",
        status: derivedStatus,
        version,
        createdAt,
        updatedAt,
        readyAt,
        history,
      })];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
}

function parseV2ProjectApproval(approval: any, purchaseRequests: LocalRecordsReadResult<ProjectPurchaseRequestRecord>): ProjectApprovalRecord | null {
  const id = typeof approval?.id === "string" ? approval.id.trim() : "";
  const projectId = typeof approval?.projectId === "string" ? approval.projectId.trim() : "";
  const targetId = typeof approval?.target?.id === "string" ? approval.target.id.trim() : "";
  const targetVersion = approval?.target?.version;
  const targetUpdatedAt = typeof approval?.target?.updatedAt === "string" ? approval.target.updatedAt.trim() : "";
  const revisionId = typeof approval?.target?.revisionId === "string" ? approval.target.revisionId.trim() : "";
  const dedupeKey = typeof approval?.dedupeKey === "string" ? approval.dedupeKey.trim() : "";
  const snapshot = parsePurchaseRequestSnapshot(approval?.snapshot);
  const requestedAt = typeof approval?.requestedAt === "string" ? approval.requestedAt.trim() : "";
  const updatedAt = typeof approval?.updatedAt === "string" ? approval.updatedAt.trim() : "";
  const decidedAt = approval?.decidedAt === null ? null : typeof approval?.decidedAt === "string" ? approval.decidedAt.trim() : "";
  const version = approval?.version;
  const status = approval?.status as ProjectApprovalStatus;
  const eventIds = new Set<string>();
  const history: ProjectApprovalEvent[] = Array.isArray(approval?.history) ? approval.history.flatMap((event: any): ProjectApprovalEvent[] => {
    const eventId = typeof event?.id === "string" ? event.id.trim() : "";
    const at = typeof event?.at === "string" ? event.at.trim() : "";
    if (!eventId || eventIds.has(eventId) || !["created", "approved", "changes-requested"].includes(event?.type) || event?.actor !== "شما" || !Number.isInteger(event?.version) || event.version < 1 || !isValidProjectFileDate(at)) return [];
    eventIds.add(eventId);
    return [{ id: eventId, type: event.type, actor: "شما", at, version: event.version }];
  }) : [];
  const shareableFields = Array.isArray(approval?.privacySnapshot?.shareableFields) && approval.privacySnapshot.shareableFields.every((field: unknown) => typeof field === "string" && field.length > 0) ? approval.privacySnapshot.shareableFields as string[] : [];
  const pendingStateIsValid = status === "pending" && version === 1 && decidedAt === null && approval?.decidedBy === null && history.length === 1 && history[0]?.type === "created";
  const decidedStateIsValid = (status === "approved" || status === "changes-requested") && version === 2 && decidedAt === updatedAt && approval?.decidedBy === "شما" && history.length === 2 && history[1]?.type === status;
  const historyIsValid = history.length === approval?.history?.length && history.length === version && history[0]?.type === "created" && history.every((event, index) => event.version === index + 1 && (index === 0 || new Date(event.at).getTime() >= new Date(history[index - 1].at).getTime())) && history[0]?.at === requestedAt && history[history.length - 1]?.at === updatedAt;
  const targetRequest = purchaseRequests.records.find((request) => request.id === targetId && request.projectId === projectId);
  const targetRevision = targetRequest?.reviewRevisions.find((revision) => revision.id === revisionId && revision.requestVersion === targetVersion);
  if (!id || !projectId || approval?.schemaVersion !== 2 || approval?.purpose !== "review-purchase-request-version" || approval?.target?.type !== "purchase-request" || !targetId || !Number.isInteger(targetVersion) || targetVersion < 1 || !isValidProjectFileDate(targetUpdatedAt) || !revisionId || dedupeKey !== purchaseRequestApprovalDedupeKey(projectId, targetId, targetVersion) || !snapshot || !targetRequest || !targetRevision || targetUpdatedAt !== targetRevision.createdAt || JSON.stringify(stablePurchaseRequestValue(snapshot)) !== JSON.stringify(stablePurchaseRequestValue(targetRevision.snapshot)) || JSON.stringify(shareableFields) !== JSON.stringify(targetRevision.shareableFields) || targetRevision.fingerprint !== purchaseRequestRevisionFingerprint(targetRevision.snapshot, targetRevision.shareableFields) || (status === "pending" && (targetRequest.version !== targetVersion || targetRequest.status !== "ready-for-review")) || approval?.privacySnapshot?.projectNameShared !== false || approval?.privacySnapshot?.exactAddressShared !== false || approval?.privacySnapshot?.budgetShared !== false || approval?.privacySnapshot?.filesShared !== false || approval?.privacySnapshot?.memoryShared !== false || approval?.externalEffect !== "none" || approval?.destination !== null || approval?.sendAuthorized !== false || approval?.visibility !== "خصوصی پروژه" || approval?.localStatus !== "ثبت محلی" || approval?.requestedBy !== "شما" || !isValidProjectFileDate(requestedAt) || !isValidProjectFileDate(updatedAt) || new Date(requestedAt).getTime() < new Date(targetUpdatedAt).getTime() || new Date(updatedAt).getTime() < new Date(requestedAt).getTime() || !historyIsValid || (!pendingStateIsValid && !decidedStateIsValid)) return null;
  return {
    schemaVersion: 2,
    id,
    projectId,
    purpose: "review-purchase-request-version",
    target: { type: "purchase-request", id: targetId, version: targetVersion, updatedAt: targetUpdatedAt, revisionId },
    dedupeKey,
    snapshot,
    privacySnapshot: { shareableFields, projectNameShared: false, exactAddressShared: false, budgetShared: false, filesShared: false, memoryShared: false },
    externalEffect: "none",
    destination: null,
    sendAuthorized: false,
    status,
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    requestedBy: "شما",
    decidedBy: approval.decidedBy,
    requestedAt,
    updatedAt,
    decidedAt,
    version,
    history,
  };
}

function readStoredProjectApprovals(purchaseRequests: LocalRecordsReadResult<ProjectPurchaseRequestRecord>): LocalRecordsReadResult<ProjectApprovalRecord> {
  try {
    const rawApprovals = window.localStorage.getItem(projectApprovalsStorageKey);
    if (rawApprovals === null) return { records: [], readError: false };
    const parsed = JSON.parse(rawApprovals);
    if (!Array.isArray(parsed)) return { records: [], readError: true };

    const seenApprovalIds = new Set<string>();
    const seenDedupeKeys = new Set<string>();
    let readError = purchaseRequests.readError;
    const records = parsed.flatMap((approval): ProjectApprovalRecord[] => {
      if (approval?.schemaVersion === 2) {
        const record = parseV2ProjectApproval(approval, purchaseRequests);
        if (!record || seenApprovalIds.has(record.id) || seenDedupeKeys.has(record.dedupeKey)) {
          readError = true;
          return [];
        }
        seenApprovalIds.add(record.id);
        seenDedupeKeys.add(record.dedupeKey);
        return [record];
      }
      const id = typeof approval?.id === "string" ? approval.id.trim() : "";
      const projectId = typeof approval?.projectId === "string" ? approval.projectId.trim() : "";
      const targetId = typeof approval?.target?.id === "string" ? approval.target.id.trim() : "";
      const targetVersion = approval?.target?.version;
      const targetUpdatedAt = typeof approval?.target?.updatedAt === "string" ? approval.target.updatedAt.trim() : "";
      const dedupeKey = typeof approval?.dedupeKey === "string" ? approval.dedupeKey.trim() : "";
      const rawNeed = typeof approval?.snapshot?.rawNeed === "string" ? approval.snapshot.rawNeed.trim() : "";
      const itemId = typeof approval?.snapshot?.item?.id === "string" ? approval.snapshot.item.id.trim() : "";
      const itemName = typeof approval?.snapshot?.item?.name === "string" ? approval.snapshot.item.name.trim() : "";
      const quantity = typeof approval?.snapshot?.item?.quantity === "string" ? approval.snapshot.item.quantity.trim() : "";
      const unit = typeof approval?.snapshot?.item?.unit === "string" ? approval.snapshot.item.unit.trim() : "";
      const brandOrGrade = approval?.snapshot?.item?.brandOrGrade === null ? null : typeof approval?.snapshot?.item?.brandOrGrade === "string" ? approval.snapshot.item.brandOrGrade.trim() : "";
      const specification = approval?.snapshot?.item?.specification === null ? null : typeof approval?.snapshot?.item?.specification === "string" ? approval.snapshot.item.specification.trim() : "";
      const deliveryArea = typeof approval?.snapshot?.delivery?.area === "string" ? approval.snapshot.delivery.area.trim() : "";
      const neededBy = approval?.snapshot?.delivery?.neededBy === null ? null : typeof approval?.snapshot?.delivery?.neededBy === "string" ? approval.snapshot.delivery.neededBy.trim() : "";
      const requestedAt = typeof approval?.requestedAt === "string" ? approval.requestedAt.trim() : "";
      const updatedAt = typeof approval?.updatedAt === "string" ? approval.updatedAt.trim() : "";
      const decidedAt = approval?.decidedAt === null ? null : typeof approval?.decidedAt === "string" ? approval.decidedAt.trim() : "";
      const version = approval?.version;
      const eventIds = new Set<string>();
      const history: ProjectApprovalEvent[] = Array.isArray(approval?.history) ? approval.history.flatMap((event: any): ProjectApprovalEvent[] => {
        const eventId = typeof event?.id === "string" ? event.id.trim() : "";
        const at = typeof event?.at === "string" ? event.at.trim() : "";
        if (
          !eventId
          || eventIds.has(eventId)
          || (event?.type !== "created" && event?.type !== "approved" && event?.type !== "changes-requested")
          || event?.actor !== "شما"
          || !Number.isInteger(event?.version)
          || event.version < 1
          || !isValidProjectFileDate(at)
        ) return [];
        eventIds.add(eventId);
        return [{ id: eventId, type: event.type as ProjectApprovalEventType, actor: "شما", at, version: event.version }];
      }) : [];

      const status = approval?.status as ProjectApprovalStatus;
      const pendingStateIsValid = status === "pending"
        && version === 1
        && decidedAt === null
        && approval?.decidedBy === null
        && history.length === 1
        && history[0]?.type === "created";
      const decidedStateIsValid = (status === "approved" || status === "changes-requested")
        && version === 2
        && typeof decidedAt === "string"
        && decidedAt === updatedAt
        && approval?.decidedBy === "شما"
        && history.length === 2
        && history[1]?.type === status;
      const historyIsValid = Array.isArray(approval?.history)
        && history.length === approval.history.length
        && Number.isInteger(version)
        && (version === 1 || version === 2)
        && history.length === version
        && history[0]?.type === "created"
        && history.every((event, index) => event.version === index + 1)
        && history.every((event, index) => index === 0 || new Date(event.at).getTime() >= new Date(history[index - 1].at).getTime())
        && history[0]?.at === requestedAt
        && history[history.length - 1]?.at === updatedAt;
      const quantityIsValid = quantity !== "" && normalizeProjectNumber(quantity, false) === quantity && Number(quantity) > 0;
      const shareableFields = Array.isArray(approval?.privacySnapshot?.shareableFields)
        ? approval.privacySnapshot.shareableFields.filter((field: unknown): field is PurchaseRequestApprovalShareableField => typeof field === "string")
        : [];
      const expectedShareableFields: PurchaseRequestApprovalShareableField[] = [
        "item.name",
        "item.quantity",
        "item.unit",
        ...(brandOrGrade ? ["item.brandOrGrade" as const] : []),
        ...(specification ? ["item.specification" as const] : []),
        ...(neededBy ? ["delivery.neededBy" as const] : []),
        "delivery.area",
      ];

      const targetRequest = purchaseRequests.records.find((request) => request.id === targetId && request.projectId === projectId);
      const targetReadyEvent = Number.isInteger(targetVersion) ? targetRequest?.history[targetVersion - 1] : undefined;
      let targetRevision = targetRequest?.reviewRevisions.find((revision) => revision.requestVersion === targetVersion && revision.createdAt === targetUpdatedAt);
      let migratedHistoricalRevision: PurchaseRequestReviewRevision | null = null;
      if (!targetRevision && targetRequest?.migration?.unverifiedReadyVersions.includes(targetVersion) && targetReadyEvent?.type === "marked-ready-for-review" && targetReadyEvent.at === targetUpdatedAt) {
        const migratedItem: ProductRequestItem = {
          id: itemId,
          name: itemName,
          quantity,
          unit: unit as PurchaseRequestUnit,
          brandOrGrade,
          specification,
          alternatives: approval?.snapshot?.item?.alternatives as PurchaseRequestAlternatives,
          source: "مهاجرت محلی",
          confidence: null,
          completionStatus: "complete",
          version: 1,
          createdAt: targetUpdatedAt,
          updatedAt: targetUpdatedAt,
          history: [{ id: `legacy-item-event-${itemId}-${targetVersion}`, type: "created", actor: "مهاجرت محلی", at: targetUpdatedAt, version: 1 }],
        };
        const clarificationSource = {
          requestKind: "product" as const,
          items: [migratedItem],
          service: null,
          delivery: { city: "تهران" as const, area: deliveryArea, exactAddressShared: false as const, neededBy },
          unresolvedTerms: { transport: "unknown", tax: "unknown", paymentTerms: "unknown" },
        };
        const migratedSnapshot: PurchaseRequestSnapshot = {
          ...clarificationSource,
          rawNeed,
          item: migratedItem,
          clarificationAnswers: reconcilePurchaseRequestClarifications(clarificationSource, [], targetUpdatedAt, "مهاجرت محلی"),
          sharingStatus: "ارسال نشده",
        };
        const migratedShareableFields = purchaseRequestApprovalShareableFields(migratedSnapshot);
        migratedHistoricalRevision = {
          id: `legacy-review-${targetId}-${targetVersion}`,
          requestVersion: targetVersion,
          createdAt: targetUpdatedAt,
          snapshot: migratedSnapshot,
          shareableFields: migratedShareableFields,
          fingerprint: purchaseRequestRevisionFingerprint(migratedSnapshot, migratedShareableFields),
        };
        targetRevision = migratedHistoricalRevision;
      }
      const targetRevisionItem = targetRevision?.snapshot.item;
      const legacySnapshotMatchesRevision = targetRevision?.snapshot.requestKind === "product"
        && targetRevision.snapshot.items.length === 1
        && Boolean(targetRevisionItem)
        && targetRevisionItem?.id === itemId
        && targetRevisionItem?.name === itemName
        && targetRevisionItem?.quantity === quantity
        && targetRevisionItem?.unit === unit
        && targetRevisionItem?.brandOrGrade === brandOrGrade
        && targetRevisionItem?.specification === specification
        && targetRevisionItem?.alternatives === approval?.snapshot?.item?.alternatives
        && targetRevision.snapshot.rawNeed === rawNeed
        && JSON.stringify(targetRevision.snapshot.delivery) === JSON.stringify({ city: "تهران", area: deliveryArea, exactAddressShared: false, neededBy });
      const targetRelationIsValid = Boolean(targetRequest)
        && targetReadyEvent?.type === "marked-ready-for-review"
        && targetReadyEvent.at === targetUpdatedAt
        && Boolean(targetRevision)
        && legacySnapshotMatchesRevision
        && (status !== "pending" || targetRequest!.version === targetVersion && targetRequest!.status === "ready-for-review");

      if (
        !id
        || seenApprovalIds.has(id)
        || !projectId
        || approval?.purpose !== "review-purchase-request-version"
        || approval?.target?.type !== "purchase-request"
        || !targetId
        || !Number.isInteger(targetVersion)
        || targetVersion < 1
        || !isValidProjectFileDate(targetUpdatedAt)
        || dedupeKey !== purchaseRequestApprovalDedupeKey(projectId, targetId, targetVersion)
        || seenDedupeKeys.has(dedupeKey)
        || !hasVisibleProjectTaskText(rawNeed)
        || rawNeed.length > 800
        || !itemId
        || !hasVisibleProjectTaskText(itemName)
        || itemName.length > 100
        || !quantityIsValid
        || !purchaseRequestUnits.includes(unit as PurchaseRequestUnit)
        || (brandOrGrade !== null && (!hasVisibleProjectTaskText(brandOrGrade) || brandOrGrade.length > 100))
        || (specification !== null && (!hasVisibleProjectTaskText(specification) || specification.length > 500))
        || (approval?.snapshot?.item?.alternatives !== "unknown" && approval?.snapshot?.item?.alternatives !== "allowed" && approval?.snapshot?.item?.alternatives !== "not-allowed" && approval?.snapshot?.item?.alternatives !== "approval-required")
        || approval?.snapshot?.item?.source !== "ثبت مستقیم شما"
        || approval?.snapshot?.item?.confidence !== null
        || approval?.snapshot?.delivery?.city !== "تهران"
        || !hasVisibleProjectTaskText(deliveryArea)
        || deliveryArea.length > 120
        || approval?.snapshot?.delivery?.exactAddressShared !== false
        || (neededBy !== null && (!hasVisibleProjectTaskText(neededBy) || neededBy.length > 80))
        || approval?.snapshot?.unresolvedTerms?.transport !== "unknown"
        || approval?.snapshot?.unresolvedTerms?.tax !== "unknown"
        || approval?.snapshot?.unresolvedTerms?.paymentTerms !== "unknown"
        || approval?.snapshot?.sharingStatus !== "ارسال نشده"
        || JSON.stringify(shareableFields) !== JSON.stringify(expectedShareableFields)
        || approval?.privacySnapshot?.projectNameShared !== false
        || approval?.privacySnapshot?.exactAddressShared !== false
        || approval?.privacySnapshot?.budgetShared !== false
        || approval?.privacySnapshot?.filesShared !== false
        || approval?.privacySnapshot?.memoryShared !== false
        || approval?.externalEffect !== "none"
        || approval?.destination !== null
        || approval?.sendAuthorized !== false
        || approval?.visibility !== "خصوصی پروژه"
        || approval?.localStatus !== "ثبت محلی"
        || approval?.requestedBy !== "شما"
        || !isValidProjectFileDate(requestedAt)
        || !isValidProjectFileDate(updatedAt)
        || new Date(requestedAt).getTime() < new Date(targetUpdatedAt).getTime()
        || new Date(updatedAt).getTime() < new Date(requestedAt).getTime()
        || !historyIsValid
        || (!pendingStateIsValid && !decidedStateIsValid)
        || !targetRelationIsValid
      ) {
        readError = true;
        return [];
      }

      if (migratedHistoricalRevision && targetRequest?.migration) {
        targetRequest.reviewRevisions = [...targetRequest.reviewRevisions, migratedHistoricalRevision].sort((first, second) => first.requestVersion - second.requestVersion);
        targetRequest.migration.unverifiedReadyVersions = targetRequest.migration.unverifiedReadyVersions.filter((readyVersion) => readyVersion !== targetVersion);
      }

      const record: ProjectApprovalRecord = {
        schemaVersion: 2,
        id,
        projectId,
        purpose: "review-purchase-request-version",
        target: { type: "purchase-request", id: targetId, version: targetVersion, updatedAt: targetUpdatedAt, revisionId: targetRevision!.id },
        dedupeKey,
        snapshot: structuredClone(targetRevision!.snapshot),
        privacySnapshot: { shareableFields: [...targetRevision!.shareableFields], projectNameShared: false, exactAddressShared: false, budgetShared: false, filesShared: false, memoryShared: false },
        externalEffect: "none",
        destination: null,
        sendAuthorized: false,
        status,
        visibility: "خصوصی پروژه",
        localStatus: "ثبت محلی",
        requestedBy: "شما",
        decidedBy: approval?.decidedBy as "شما" | null,
        requestedAt,
        updatedAt,
        decidedAt,
        version,
        history,
      };
      seenApprovalIds.add(id);
      seenDedupeKeys.add(dedupeKey);
      return [record];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
}

function hasExactObjectKeys(value: unknown, expectedKeys: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return JSON.stringify(keys) === JSON.stringify([...expectedKeys].sort());
}

function parseSupplierContact(value: any): SupplierContactRecord | null {
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const projectId = typeof value?.projectId === "string" ? value.projectId.trim() : "";
  const displayName = typeof value?.displayName === "string" ? value.displayName.trim() : "";
  const category = typeof value?.category === "string" ? value.category.trim() : "";
  const tehranCoverage = typeof value?.tehranCoverage === "string" ? value.tehranCoverage.trim() : "";
  const responseCapability = value?.responseCapability as SupplierContactResponseCapability;
  const status = value?.status as SupplierContactStatus;
  const version = value?.version;
  const createdAt = typeof value?.createdAt === "string" ? value.createdAt.trim() : "";
  const updatedAt = typeof value?.updatedAt === "string" ? value.updatedAt.trim() : "";
  const archivedAt = value?.archivedAt === null ? null : typeof value?.archivedAt === "string" ? value.archivedAt.trim() : "";
  const eventIds = new Set<string>();
  let derivedStatus: SupplierContactStatus = "active";
  let transitionIsValid = true;
  const history: SupplierContactEvent[] = Array.isArray(value?.history) ? value.history.flatMap((event: any, index: number): SupplierContactEvent[] => {
    const eventId = typeof event?.id === "string" ? event.id.trim() : "";
    const at = typeof event?.at === "string" ? event.at.trim() : "";
    const type = event?.type as SupplierContactEventType;
    if (!hasExactObjectKeys(event, ["id", "type", "actor", "at", "version"]) || !eventId || eventIds.has(eventId) || !["created", "archived", "restored"].includes(type) || event?.actor !== "شما" || event?.version !== index + 1 || !isValidProjectFileDate(at)) return [];
    if (index === 0) transitionIsValid = type === "created";
    else if (type === "created" || type === "archived" && derivedStatus !== "active" || type === "restored" && derivedStatus !== "archived") transitionIsValid = false;
    if (type === "archived") derivedStatus = "archived";
    if (type === "restored") derivedStatus = "active";
    eventIds.add(eventId);
    return [{ id: eventId, type, actor: "شما", at, version: event.version }];
  }) : [];
  const expectedArchivedAt = status === "archived" ? history[history.length - 1]?.type === "archived" ? history[history.length - 1].at : "" : null;
  if (!hasExactObjectKeys(value, ["schemaVersion", "id", "projectId", "displayName", "category", "tehranCoverage", "responseCapability", "source", "networkStatus", "status", "visibility", "localStatus", "version", "createdAt", "updatedAt", "archivedAt", "history"]) || value?.schemaVersion !== 1 || !id || !projectId || !hasVisibleProjectTaskText(displayName) || displayName.length > 100 || !hasVisibleProjectTaskText(category) || category.length > 100 || !hasVisibleProjectTaskText(tehranCoverage) || tehranCoverage.length > 120 || !["product", "service", "both"].includes(responseCapability) || value?.source !== "ثبت مستقیم سازنده" || value?.networkStatus !== "خارج از شبکه چیدا" || (status !== "active" && status !== "archived") || value?.visibility !== "خصوصی پروژه" || value?.localStatus !== "ثبت محلی" || !Number.isInteger(version) || version < 1 || !Array.isArray(value?.history) || history.length !== value.history.length || history.length !== version || !transitionIsValid || derivedStatus !== status || !isValidProjectFileDate(createdAt) || !isValidProjectFileDate(updatedAt) || archivedAt !== null && !isValidProjectFileDate(archivedAt) || history[0]?.at !== createdAt || history[history.length - 1]?.at !== updatedAt || history.some((event, index) => index > 0 && new Date(event.at).getTime() < new Date(history[index - 1].at).getTime()) || archivedAt !== expectedArchivedAt) return null;
  return { schemaVersion: 1, id, projectId, displayName, category, tehranCoverage, responseCapability, source: "ثبت مستقیم سازنده", networkStatus: "خارج از شبکه چیدا", status, visibility: "خصوصی پروژه", localStatus: "ثبت محلی", version, createdAt, updatedAt, archivedAt, history };
}

function readStoredProjectSupplierContacts(): LocalRecordsReadResult<SupplierContactRecord> {
  try {
    const raw = window.localStorage.getItem(projectSupplierContactsStorageKey);
    if (raw === null) return { records: [], readError: false };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 1000) return { records: [], readError: true };
    const ids = new Set<string>();
    const projectCounts = new Map<string, number>();
    let readError = false;
    const records = parsed.flatMap((value): SupplierContactRecord[] => {
      const record = parseSupplierContact(value);
      const nextProjectCount = record ? (projectCounts.get(record.projectId) ?? 0) + 1 : 0;
      if (!record || ids.has(record.id) || nextProjectCount > 100) {
        readError = true;
        return [];
      }
      ids.add(record.id);
      projectCounts.set(record.projectId, nextProjectCount);
      return [record];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
}

function parseDispatchDraft(value: any, purchaseRequests: LocalRecordsReadResult<ProjectPurchaseRequestRecord>, approvals: LocalRecordsReadResult<ProjectApprovalRecord>, contacts: LocalRecordsReadResult<SupplierContactRecord>): DispatchDraftRecord | null {
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const projectId = typeof value?.projectId === "string" ? value.projectId.trim() : "";
  const requestId = typeof value?.target?.requestId === "string" ? value.target.requestId.trim() : "";
  const requestVersion = value?.target?.requestVersion;
  const revisionId = typeof value?.target?.revisionId === "string" ? value.target.revisionId.trim() : "";
  const approvalId = typeof value?.target?.approvalId === "string" ? value.target.approvalId.trim() : "";
  const dedupeKey = typeof value?.dedupeKey === "string" ? value.dedupeKey.trim() : "";
  const currentRevisionId = typeof value?.currentRevisionId === "string" ? value.currentRevisionId.trim() : "";
  const version = value?.version;
  const createdAt = typeof value?.createdAt === "string" ? value.createdAt.trim() : "";
  const updatedAt = typeof value?.updatedAt === "string" ? value.updatedAt.trim() : "";
  const target = { requestId, requestVersion, revisionId, approvalId };
  const request = purchaseRequests.records.find((item) => item.id === requestId && item.projectId === projectId);
  const approval = approvals.records.find((item) => item.id === approvalId && item.projectId === projectId && item.status === "approved");
  const reviewRevision = request?.reviewRevisions.find((item) => item.id === revisionId && item.requestVersion === requestVersion);
  if (!request || !approval || approval.status !== "approved" || !reviewRevision || approval.target.id !== requestId || approval.target.version !== requestVersion || approval.target.revisionId !== revisionId || !approvalSnapshotMatchesRevision(approval, request)) return null;
  const expectedPayload = dispatchPayloadFromSnapshot(reviewRevision.snapshot);
  const expectedPrivacy = dispatchPrivacySnapshot(reviewRevision.shareableFields);
  const eventIds = new Set<string>();
  const history: DispatchDraftEvent[] = Array.isArray(value?.history) ? value.history.flatMap((event: any, index: number): DispatchDraftEvent[] => {
    const eventId = typeof event?.id === "string" ? event.id.trim() : "";
    const at = typeof event?.at === "string" ? event.at.trim() : "";
    const type = event?.type as DispatchDraftEvent["type"];
    if (!hasExactObjectKeys(event, ["id", "type", "actor", "at", "version"]) || !eventId || eventIds.has(eventId) || (type !== "created" && type !== "updated") || event?.actor !== "شما" || event?.version !== index + 1 || index === 0 && type !== "created" || index > 0 && type !== "updated" || !isValidProjectFileDate(at)) return [];
    eventIds.add(eventId);
    return [{ id: eventId, type, actor: "شما", at, version: event.version }];
  }) : [];
  const revisionIds = new Set<string>();
  const inviteIds = new Set<string>();
  const revisions: DispatchDraftRevision[] = Array.isArray(value?.revisions) ? value.revisions.flatMap((revision: any, index: number): DispatchDraftRevision[] => {
    const revisionRecordId = typeof revision?.id === "string" ? revision.id.trim() : "";
    const revisionVersion = revision?.version;
    const revisionCreatedAt = typeof revision?.createdAt === "string" ? revision.createdAt.trim() : "";
    const recipientIds: string[] = Array.isArray(revision?.recipientIds) ? revision.recipientIds.map((recipientId: unknown) => typeof recipientId === "string" ? recipientId.trim() : "") : [];
    const legacyCityPayload = expectedPayload.requestKind === "product" && expectedPayload.delivery ? { ...expectedPayload, delivery: { city: "تهران", ...expectedPayload.delivery } } : null;
    const payloadIsCanonical = JSON.stringify(stablePurchaseRequestValue(revision?.payload)) === JSON.stringify(stablePurchaseRequestValue(expectedPayload));
    const payloadIsLegacyCityEnvelope = Boolean(legacyCityPayload) && JSON.stringify(stablePurchaseRequestValue(revision?.payload)) === JSON.stringify(stablePurchaseRequestValue(legacyCityPayload));
    if (!hasExactObjectKeys(revision, ["id", "version", "createdAt", "recipientIds", "inviteDrafts", "payload", "privacySnapshot", "fingerprint"]) || !revisionRecordId || revisionIds.has(revisionRecordId) || revisionVersion !== index + 1 || !isValidProjectFileDate(revisionCreatedAt) || history[index]?.at !== revisionCreatedAt || recipientIds.length < 1 || recipientIds.length > 50 || recipientIds.some((recipientId) => !recipientId) || new Set(recipientIds).size !== recipientIds.length || JSON.stringify(recipientIds) !== JSON.stringify([...recipientIds].sort()) || !Array.isArray(revision?.inviteDrafts) || revision.inviteDrafts.length !== recipientIds.length || !payloadIsCanonical && !payloadIsLegacyCityEnvelope || JSON.stringify(stablePurchaseRequestValue(revision?.privacySnapshot)) !== JSON.stringify(stablePurchaseRequestValue(expectedPrivacy))) return [];
    const inviteDrafts: InviteDraft[] = revision.inviteDrafts.flatMap((invite: any, inviteIndex: number): InviteDraft[] => {
      const inviteId = typeof invite?.id === "string" ? invite.id.trim() : "";
      const supplierContactId = typeof invite?.supplierContactId === "string" ? invite.supplierContactId.trim() : "";
      const inviteCreatedAt = typeof invite?.createdAt === "string" ? invite.createdAt.trim() : "";
      const inviteUpdatedAt = typeof invite?.updatedAt === "string" ? invite.updatedAt.trim() : "";
      const contact = contacts.records.find((item) => item.id === supplierContactId && item.projectId === projectId);
      const expectedDestination = contact ? { displayName: contact.displayName, category: contact.category, tehranCoverage: contact.tehranCoverage, responseCapability: contact.responseCapability, networkStatus: "خارج از شبکه چیدا" as const } : null;
      if (!hasExactObjectKeys(invite, ["schemaVersion", "id", "projectId", "supplierContactId", "destination", "target", "source", "continuation", "externalEffect", "sendAuthorized", "version", "createdAt", "updatedAt"]) || invite?.schemaVersion !== 1 || !inviteId || inviteIds.has(inviteId) || supplierContactId !== recipientIds[inviteIndex] || !contact || !supplierContactCapabilitySupports(contact, request.requestKind) || !expectedDestination || JSON.stringify(stablePurchaseRequestValue(invite?.destination)) !== JSON.stringify(stablePurchaseRequestValue(expectedDestination)) || JSON.stringify(stablePurchaseRequestValue(invite?.target)) !== JSON.stringify(stablePurchaseRequestValue(target)) || invite?.projectId !== projectId || invite?.source !== "ثبت مستقیم سازنده" || invite?.continuation !== "ادامهٔ احتمالی در فاز تأمین‌کننده" || invite?.externalEffect !== "none" || invite?.sendAuthorized !== false || invite?.version !== 1 || inviteCreatedAt !== revisionCreatedAt || inviteUpdatedAt !== revisionCreatedAt) return [];
      inviteIds.add(inviteId);
      return [{ schemaVersion: 1, id: inviteId, projectId, supplierContactId, destination: expectedDestination, target, source: "ثبت مستقیم سازنده", continuation: "ادامهٔ احتمالی در فاز تأمین‌کننده", externalEffect: "none", sendAuthorized: false, version: 1, createdAt: inviteCreatedAt, updatedAt: inviteUpdatedAt }];
    });
    const fingerprintPayload = payloadIsLegacyCityEnvelope ? legacyCityPayload! : expectedPayload;
    if (inviteDrafts.length !== recipientIds.length || revision?.fingerprint !== dispatchRevisionFingerprint(target, recipientIds, inviteDrafts, fingerprintPayload as DispatchPayload, expectedPrivacy)) return [];
    revisionIds.add(revisionRecordId);
    return [{ id: revisionRecordId, version: revisionVersion, createdAt: revisionCreatedAt, recipientIds, inviteDrafts, payload: expectedPayload, privacySnapshot: expectedPrivacy, fingerprint: dispatchRevisionFingerprint(target, recipientIds, inviteDrafts, expectedPayload, expectedPrivacy) }];
  }) : [];
  if (!hasExactObjectKeys(value, ["schemaVersion", "id", "projectId", "target", "dedupeKey", "status", "currentRevisionId", "externalEffect", "sendAuthorized", "visibility", "localStatus", "version", "createdAt", "updatedAt", "history", "revisions"]) || !hasExactObjectKeys(value?.target, ["requestId", "requestVersion", "revisionId", "approvalId"]) || value?.schemaVersion !== 1 || !id || !projectId || !requestId || !Number.isInteger(requestVersion) || requestVersion < 1 || !revisionId || !approvalId || dedupeKey !== dispatchDraftDedupeKey(projectId, requestId, requestVersion, revisionId) || value?.status !== "draft" || value?.externalEffect !== "none" || value?.sendAuthorized !== false || value?.visibility !== "خصوصی پروژه" || value?.localStatus !== "ثبت محلی" || !Number.isInteger(version) || version < 1 || !Array.isArray(value?.history) || !Array.isArray(value?.revisions) || history.length !== value.history.length || revisions.length !== value.revisions.length || history.length !== version || revisions.length !== version || currentRevisionId !== revisions[revisions.length - 1]?.id || createdAt !== history[0]?.at || updatedAt !== history[history.length - 1]?.at || revisions[0]?.createdAt !== createdAt || revisions[revisions.length - 1]?.createdAt !== updatedAt || history.some((event, index) => index > 0 && new Date(event.at).getTime() < new Date(history[index - 1].at).getTime())) return null;
  return { schemaVersion: 1, id, projectId, target, dedupeKey, status: "draft", currentRevisionId, externalEffect: "none", sendAuthorized: false, visibility: "خصوصی پروژه", localStatus: "ثبت محلی", version, createdAt, updatedAt, history, revisions };
}

function readStoredProjectDispatchDrafts(purchaseRequests: LocalRecordsReadResult<ProjectPurchaseRequestRecord>, approvals: LocalRecordsReadResult<ProjectApprovalRecord>, contacts: LocalRecordsReadResult<SupplierContactRecord>): LocalRecordsReadResult<DispatchDraftRecord> {
  if (purchaseRequests.readError || approvals.readError || contacts.readError) return { records: [], readError: true };
  try {
    const raw = window.localStorage.getItem(projectDispatchDraftsStorageKey);
    if (raw === null) return { records: [], readError: false };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 1000) return { records: [], readError: true };
    const ids = new Set<string>();
    const dedupeKeys = new Set<string>();
    const globalInviteIds = new Set<string>();
    const projectCounts = new Map<string, number>();
    let readError = false;
    const records = parsed.flatMap((value): DispatchDraftRecord[] => {
      const record = parseDispatchDraft(value, purchaseRequests, approvals, contacts);
      const inviteIds = record?.revisions.flatMap((revision) => revision.inviteDrafts.map((invite) => invite.id)) ?? [];
      const nextProjectCount = record ? (projectCounts.get(record.projectId) ?? 0) + 1 : 0;
      if (!record || ids.has(record.id) || dedupeKeys.has(record.dedupeKey) || nextProjectCount > 100 || inviteIds.some((inviteId) => globalInviteIds.has(inviteId))) {
        readError = true;
        return [];
      }
      ids.add(record.id);
      dedupeKeys.add(record.dedupeKey);
      projectCounts.set(record.projectId, nextProjectCount);
      inviteIds.forEach((inviteId) => globalInviteIds.add(inviteId));
      return [record];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
}

function parseDispatchPlanApproval(
  value: any,
  dispatchDrafts: LocalRecordsReadResult<DispatchDraftRecord>,
  purchaseRequests: LocalRecordsReadResult<ProjectPurchaseRequestRecord>,
  approvals: LocalRecordsReadResult<ProjectApprovalRecord>,
  contacts: LocalRecordsReadResult<SupplierContactRecord>,
): DispatchPlanApprovalRecord | null {
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const projectId = typeof value?.projectId === "string" ? value.projectId.trim() : "";
  const target = {
    type: value?.target?.type,
    dispatchDraftId: typeof value?.target?.dispatchDraftId === "string" ? value.target.dispatchDraftId.trim() : "",
    dispatchDraftVersion: value?.target?.dispatchDraftVersion,
    dispatchRevisionId: typeof value?.target?.dispatchRevisionId === "string" ? value.target.dispatchRevisionId.trim() : "",
    dispatchRevisionFingerprint: typeof value?.target?.dispatchRevisionFingerprint === "string" ? value.target.dispatchRevisionFingerprint.trim() : "",
    requestId: typeof value?.target?.requestId === "string" ? value.target.requestId.trim() : "",
    requestVersion: value?.target?.requestVersion,
    requestRevisionId: typeof value?.target?.requestRevisionId === "string" ? value.target.requestRevisionId.trim() : "",
    contentApprovalId: typeof value?.target?.contentApprovalId === "string" ? value.target.contentApprovalId.trim() : "",
  } as DispatchPlanApprovalRecord["target"];
  const dispatchDraft = dispatchDrafts.records.find((item) => item.id === target.dispatchDraftId && item.projectId === projectId);
  const revision = dispatchDraft?.revisions.find((item) => item.id === target.dispatchRevisionId && item.version === target.dispatchDraftVersion);
  const request = purchaseRequests.records.find((item) => item.id === target.requestId && item.projectId === projectId);
  const contentApproval = approvals.records.find((item) => item.id === target.contentApprovalId && item.projectId === projectId);
  const recipientIds = new Set<string>();
  const recipients: DispatchPlanApprovalRecord["snapshot"]["recipients"] = Array.isArray(value?.snapshot?.recipients) ? value.snapshot.recipients.flatMap((recipient: any, index: number) => {
    const supplierContactId = typeof recipient?.supplierContactId === "string" ? recipient.supplierContactId.trim() : "";
    const supplierContactVersion = recipient?.supplierContactVersion;
    const contact = contacts.records.find((item) => item.id === supplierContactId && item.projectId === projectId);
    const invite = revision?.inviteDrafts[index];
    const destination = invite?.destination;
    if (
      !hasExactObjectKeys(recipient, ["supplierContactId", "supplierContactVersion", "destination"])
      || !hasExactObjectKeys(recipient?.destination, ["displayName", "category", "tehranCoverage", "responseCapability", "networkStatus"])
      || !supplierContactId
      || recipientIds.has(supplierContactId)
      || !Number.isInteger(supplierContactVersion)
      || supplierContactVersion < 1
      || !contact
      || supplierContactVersion > contact.version
      || !contact.history.some((event) => event.version === supplierContactVersion)
      || !request
      || !supplierContactCapabilitySupports(contact, request.requestKind)
      || invite?.supplierContactId !== supplierContactId
      || !destination
      || JSON.stringify(stablePurchaseRequestValue(recipient?.destination)) !== JSON.stringify(stablePurchaseRequestValue(destination))
    ) return [];
    recipientIds.add(supplierContactId);
    return [{ supplierContactId, supplierContactVersion, destination: structuredClone(destination) }];
  }) : [];
  const snapshot = revision ? {
    recipients,
    recipientCount: value?.snapshot?.recipientCount,
    payload: structuredClone(revision.payload),
    privacySnapshot: structuredClone(revision.privacySnapshot),
    reviewAcknowledgement: {
      destinationsReviewed: true as const,
      payloadReviewed: true as const,
      privacyAndLocationReviewed: true as const,
    },
  } : null;
  let derivedStatus: DispatchPlanApprovalStatus = "pending";
  let transitionIsValid = true;
  const eventIds = new Set<string>();
  const history: DispatchPlanApprovalEvent[] = Array.isArray(value?.history) ? value.history.flatMap((event: any, index: number): DispatchPlanApprovalEvent[] => {
    const eventId = typeof event?.id === "string" ? event.id.trim() : "";
    const at = typeof event?.at === "string" ? event.at.trim() : "";
    const type = event?.type as DispatchPlanApprovalEventType;
    if (!hasExactObjectKeys(event, ["id", "type", "actor", "at", "version"]) || !eventId || eventIds.has(eventId) || !["created", "approved", "withdrawn", "reopened"].includes(type) || event?.actor !== "شما" || event?.version !== index + 1 || !isValidProjectFileDate(at)) return [];
    if (index === 0) transitionIsValid = type === "created";
    else if (derivedStatus === "pending" && type === "approved") derivedStatus = "approved";
    else if (derivedStatus === "pending" && type === "withdrawn") derivedStatus = "withdrawn";
    else if (derivedStatus === "withdrawn" && type === "reopened") derivedStatus = "pending";
    else transitionIsValid = false;
    eventIds.add(eventId);
    return [{ id: eventId, type, actor: "شما", at, version: event.version }];
  }) : [];
  const requestedAt = typeof value?.requestedAt === "string" ? value.requestedAt.trim() : "";
  const decidedAt = value?.decidedAt === null ? null : typeof value?.decidedAt === "string" ? value.decidedAt.trim() : "";
  const createdAt = typeof value?.createdAt === "string" ? value.createdAt.trim() : "";
  const updatedAt = typeof value?.updatedAt === "string" ? value.updatedAt.trim() : "";
  const planFingerprint = typeof value?.planFingerprint === "string" ? value.planFingerprint.trim() : "";
  const dedupeKey = typeof value?.dedupeKey === "string" ? value.dedupeKey.trim() : "";
  const idempotencyKey = typeof value?.idempotencyKey === "string" ? value.idempotencyKey.trim() : "";
  const expectedFingerprint = snapshot ? dispatchPlanFingerprint(target, snapshot) : "";
  const expectedDedupeKey = dispatchPlanApprovalDedupeKey(projectId, target, expectedFingerprint);
  const status = value?.status as DispatchPlanApprovalStatus;
  const version = value?.version;
  const approvedEvent = history.find((event) => event.type === "approved") ?? null;
  const actionRecordIsValid = status === "approved"
    ? hasExactObjectKeys(value?.actionRecord, ["kind", "result", "label", "error", "recordedAt"])
      && value.actionRecord.kind === "record-local-dispatch-plan-approval"
      && value.actionRecord.result === "local-dispatch-plan-approved"
      && value.actionRecord.label === "تأیید محلی برنامهٔ ارسال"
      && value.actionRecord.error === null
      && value.actionRecord.recordedAt === decidedAt
      && decidedAt === approvedEvent?.at
      && value?.decidedBy === "شما"
    : value?.actionRecord === null && decidedAt === null && value?.decidedBy === null;
  const targetRelationIsValid = Boolean(dispatchDraft && revision && request && contentApproval)
    && dispatchDraft!.target.requestId === target.requestId
    && dispatchDraft!.target.requestVersion === target.requestVersion
    && dispatchDraft!.target.revisionId === target.requestRevisionId
    && dispatchDraft!.target.approvalId === target.contentApprovalId
    && revision!.fingerprint === target.dispatchRevisionFingerprint
    && contentApproval!.status === "approved"
    && contentApproval!.target.id === target.requestId
    && contentApproval!.target.version === target.requestVersion
    && contentApproval!.target.revisionId === target.requestRevisionId
    && approvalSnapshotMatchesRevision(contentApproval!, request!);
  const requestedAtTime = new Date(requestedAt).getTime();
  const requestRevision = request?.reviewRevisions.find((item) => item.id === target.requestRevisionId && item.requestVersion === target.requestVersion);
  const dependencyChronologyIsValid = Number.isFinite(requestedAtTime)
    && Boolean(revision && requestRevision && contentApproval)
    && new Date(revision!.createdAt).getTime() <= requestedAtTime
    && new Date(requestRevision!.createdAt).getTime() <= requestedAtTime
    && new Date(contentApproval!.updatedAt).getTime() <= requestedAtTime
    && recipients.every((recipient) => {
      const contact = contacts.records.find((item) => item.id === recipient.supplierContactId && item.projectId === projectId);
      const latestEventAtRequest = contact?.history.filter((event) => new Date(event.at).getTime() <= requestedAtTime).at(-1);
      return latestEventAtRequest?.version === recipient.supplierContactVersion;
    });

  if (
    !hasExactObjectKeys(value, ["schemaVersion", "id", "projectId", "purpose", "target", "snapshot", "planFingerprint", "dedupeKey", "idempotencyKey", "status", "simulationOnly", "externalEffect", "sendAuthorized", "externalActionAttempted", "actionRecord", "visibility", "localStatus", "requestedBy", "decidedBy", "requestedAt", "decidedAt", "createdAt", "updatedAt", "version", "history"])
    || !hasExactObjectKeys(value?.target, ["type", "dispatchDraftId", "dispatchDraftVersion", "dispatchRevisionId", "dispatchRevisionFingerprint", "requestId", "requestVersion", "requestRevisionId", "contentApprovalId"])
    || !hasExactObjectKeys(value?.snapshot, ["recipients", "recipientCount", "payload", "privacySnapshot", "reviewAcknowledgement"])
    || !hasExactObjectKeys(value?.snapshot?.reviewAcknowledgement, ["destinationsReviewed", "payloadReviewed", "privacyAndLocationReviewed"])
    || value?.schemaVersion !== 1
    || !id
    || !projectId
    || value?.purpose !== "approve-local-dispatch-plan-simulation"
    || target.type !== "dispatch-draft-revision"
    || !target.dispatchDraftId
    || !Number.isInteger(target.dispatchDraftVersion)
    || target.dispatchDraftVersion < 1
    || !target.dispatchRevisionId
    || !target.dispatchRevisionFingerprint
    || !target.requestId
    || !Number.isInteger(target.requestVersion)
    || target.requestVersion < 1
    || !target.requestRevisionId
    || !target.contentApprovalId
    || !snapshot
    || recipients.length < 1
    || recipients.length !== value?.snapshot?.recipients?.length
    || recipients.length !== revision?.recipientIds.length
    || JSON.stringify(recipients.map((recipient) => recipient.supplierContactId)) !== JSON.stringify(revision?.recipientIds)
    || snapshot.recipientCount !== recipients.length
    || value?.snapshot?.reviewAcknowledgement?.destinationsReviewed !== true
    || value?.snapshot?.reviewAcknowledgement?.payloadReviewed !== true
    || value?.snapshot?.reviewAcknowledgement?.privacyAndLocationReviewed !== true
    || JSON.stringify(stablePurchaseRequestValue(value?.snapshot?.payload)) !== JSON.stringify(stablePurchaseRequestValue(revision?.payload))
    || JSON.stringify(stablePurchaseRequestValue(value?.snapshot?.privacySnapshot)) !== JSON.stringify(stablePurchaseRequestValue(revision?.privacySnapshot))
    || planFingerprint !== expectedFingerprint
    || dedupeKey !== expectedDedupeKey
    || idempotencyKey !== `${expectedDedupeKey}:simulation-v1`
    || (status !== "pending" && status !== "approved" && status !== "withdrawn")
    || derivedStatus !== status
    || value?.simulationOnly !== true
    || value?.externalEffect !== "none"
    || value?.sendAuthorized !== false
    || value?.externalActionAttempted !== false
    || !actionRecordIsValid
    || value?.visibility !== "خصوصی پروژه"
    || value?.localStatus !== "ثبت محلی"
    || value?.requestedBy !== "شما"
    || !isValidProjectFileDate(requestedAt)
    || requestedAt !== createdAt
    || !isValidProjectFileDate(createdAt)
    || !isValidProjectFileDate(updatedAt)
    || !Number.isInteger(version)
    || version < 1
    || !Array.isArray(value?.history)
    || history.length !== value.history.length
    || history.length !== version
    || !transitionIsValid
    || history[0]?.type !== "created"
    || history[0]?.at !== createdAt
    || history[history.length - 1]?.at !== updatedAt
    || history.some((event, index) => index > 0 && new Date(event.at).getTime() < new Date(history[index - 1].at).getTime())
    || !targetRelationIsValid
    || !dependencyChronologyIsValid
  ) return null;

  return {
    schemaVersion: 1,
    id,
    projectId,
    purpose: "approve-local-dispatch-plan-simulation",
    target,
    snapshot,
    planFingerprint,
    dedupeKey,
    idempotencyKey,
    status,
    simulationOnly: true,
    externalEffect: "none",
    sendAuthorized: false,
    externalActionAttempted: false,
    actionRecord: approvedEvent ? { kind: "record-local-dispatch-plan-approval", result: "local-dispatch-plan-approved", label: "تأیید محلی برنامهٔ ارسال", error: null, recordedAt: decidedAt! } : null,
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    requestedBy: "شما",
    decidedBy: approvedEvent ? "شما" : null,
    requestedAt,
    decidedAt,
    createdAt,
    updatedAt,
    version,
    history,
  };
}

function readStoredProjectDispatchPlanApprovals(
  dispatchDrafts: LocalRecordsReadResult<DispatchDraftRecord>,
  purchaseRequests: LocalRecordsReadResult<ProjectPurchaseRequestRecord>,
  approvals: LocalRecordsReadResult<ProjectApprovalRecord>,
  contacts: LocalRecordsReadResult<SupplierContactRecord>,
): LocalRecordsReadResult<DispatchPlanApprovalRecord> {
  if (dispatchDrafts.readError || purchaseRequests.readError || approvals.readError || contacts.readError) return { records: [], readError: true };
  try {
    const raw = window.localStorage.getItem(projectDispatchPlanApprovalsStorageKey);
    if (raw === null) return { records: [], readError: false };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 1000) return { records: [], readError: true };
    const ids = new Set<string>();
    const dedupeKeys = new Set<string>();
    const idempotencyKeys = new Set<string>();
    const projectCounts = new Map<string, number>();
    let readError = false;
    const records = parsed.flatMap((value): DispatchPlanApprovalRecord[] => {
      const record = parseDispatchPlanApproval(value, dispatchDrafts, purchaseRequests, approvals, contacts);
      const nextProjectCount = record ? (projectCounts.get(record.projectId) ?? 0) + 1 : 0;
      if (!record || ids.has(record.id) || dedupeKeys.has(record.dedupeKey) || idempotencyKeys.has(record.idempotencyKey) || nextProjectCount > 100) {
        readError = true;
        return [];
      }
      ids.add(record.id);
      dedupeKeys.add(record.dedupeKey);
      idempotencyKeys.add(record.idempotencyKey);
      projectCounts.set(record.projectId, nextProjectCount);
      return [record];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
}

function parseBuilderRecordedProposalLine(value: any, expected: { requestItemId: string | null; serviceSpecId: string | null; requestLabel: string }): BuilderRecordedProposalLine | null {
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const requestItemId = value?.requestItemId === null ? null : typeof value?.requestItemId === "string" ? value.requestItemId.trim() : "";
  const serviceSpecId = value?.serviceSpecId === null ? null : typeof value?.serviceSpecId === "string" ? value.serviceSpecId.trim() : "";
  const requestLabel = typeof value?.requestLabel === "string" ? value.requestLabel.trim() : "";
  const status = value?.status as BuilderRecordedProposalLineStatus;
  const numericValue = (item: unknown) => {
    if (item === null) return null;
    if (typeof item !== "string" || item === "") return undefined;
    const normalized = normalizeBuilderRecordedProposalNumber(item);
    return normalized !== null && normalized !== undefined && normalized === item ? item : undefined;
  };
  const textValue = (item: unknown, maxLength: number) => item === null ? null : typeof item === "string" && hasVisibleProjectTaskText(item) && item.length <= maxLength && item.trim() === item ? item : undefined;
  const quantity = numericValue(value?.quantity);
  const unitPrice = numericValue(value?.unitPrice);
  const totalPrice = numericValue(value?.totalPrice);
  const unit = textValue(value?.unit, 80);
  const tax = textValue(value?.tax, 160);
  const transport = textValue(value?.transport, 160);
  const minimumOrder = textValue(value?.minimumOrder, 160);
  const leadTime = textValue(value?.leadTime, 160);
  const validity = textValue(value?.validity, 160);
  const paymentTerms = textValue(value?.paymentTerms, 240);
  const notes = textValue(value?.notes, 500);
  if (
    !hasExactObjectKeys(value, ["id", "requestItemId", "serviceSpecId", "requestLabel", "status", "quantity", "unit", "unitPrice", "totalPrice", "currency", "tax", "transport", "minimumOrder", "leadTime", "validity", "paymentTerms", "notes"])
    || !id
    || requestItemId !== expected.requestItemId
    || serviceSpecId !== expected.serviceSpecId
    || requestLabel !== expected.requestLabel
    || !["quoted", "unavailable", "alternative", "not-mentioned"].includes(status)
    || quantity === undefined
    || unit === undefined
    || unitPrice === undefined
    || totalPrice === undefined
    || value?.currency !== "تومان"
    || tax === undefined
    || transport === undefined
    || minimumOrder === undefined
    || leadTime === undefined
    || validity === undefined
    || paymentTerms === undefined
    || notes === undefined
    || status === "not-mentioned" && [quantity, unit, unitPrice, totalPrice, tax, transport, minimumOrder, leadTime, validity, paymentTerms].some((item) => item !== null)
  ) return null;
  return { id, requestItemId, serviceSpecId, requestLabel, status, quantity, unit, unitPrice, totalPrice, currency: "تومان", tax, transport, minimumOrder, leadTime, validity, paymentTerms, notes };
}

function parseBuilderRecordedProposal(
  value: any,
  purchaseRequests: LocalRecordsReadResult<ProjectPurchaseRequestRecord>,
  approvals: LocalRecordsReadResult<ProjectApprovalRecord>,
  contacts: LocalRecordsReadResult<SupplierContactRecord>,
  files: LocalRecordsReadResult<ProjectFileRecord>,
): BuilderRecordedProposalRecord | null {
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const projectId = typeof value?.projectId === "string" ? value.projectId.trim() : "";
  const target = {
    requestId: typeof value?.target?.requestId === "string" ? value.target.requestId.trim() : "",
    requestVersion: value?.target?.requestVersion,
    reviewRevisionId: typeof value?.target?.reviewRevisionId === "string" ? value.target.reviewRevisionId.trim() : "",
    reviewRevisionFingerprint: typeof value?.target?.reviewRevisionFingerprint === "string" ? value.target.reviewRevisionFingerprint.trim() : "",
    contentApprovalId: typeof value?.target?.contentApprovalId === "string" ? value.target.contentApprovalId.trim() : "",
    requestKind: value?.target?.requestKind as PurchaseRequestKind,
  } satisfies BuilderRecordedProposalRecord["target"];
  const request = purchaseRequests.records.find((item) => item.id === target.requestId && item.projectId === projectId);
  const reviewRevision = request?.reviewRevisions.find((item) => item.id === target.reviewRevisionId && item.requestVersion === target.requestVersion);
  const contentApproval = approvals.records.find((item) => item.id === target.contentApprovalId && item.projectId === projectId);
  if (!request || !reviewRevision || !contentApproval || contentApproval.status !== "approved" || contentApproval.target.id !== target.requestId || contentApproval.target.version !== target.requestVersion || contentApproval.target.revisionId !== target.reviewRevisionId || !approvalSnapshotMatchesRevision(contentApproval, request) || target.reviewRevisionFingerprint !== reviewRevision.fingerprint || target.requestKind !== reviewRevision.snapshot.requestKind) return null;
  const requestSnapshot = builderRecordedProposalRequestSnapshot(reviewRevision.snapshot);
  if (JSON.stringify(stablePurchaseRequestValue(value?.requestSnapshot)) !== JSON.stringify(stablePurchaseRequestValue(requestSnapshot))) return null;

  const supplierContactId = typeof value?.supplierSnapshot?.supplierContactId === "string" ? value.supplierSnapshot.supplierContactId.trim() : "";
  const supplierContactVersion = value?.supplierSnapshot?.supplierContactVersion;
  const contact = contacts.records.find((item) => item.id === supplierContactId && item.projectId === projectId);
  if (!contact || !Number.isInteger(supplierContactVersion) || supplierContactVersion < 1 || supplierContactVersion > contact.version || !contact.history.some((event) => event.version === supplierContactVersion) || !supplierContactCapabilitySupports(contact, target.requestKind)) return null;
  const supplierDisplayName = typeof value?.supplierSnapshot?.displayName === "string" ? value.supplierSnapshot.displayName.trim() : "";
  const supplierCategory = typeof value?.supplierSnapshot?.category === "string" ? value.supplierSnapshot.category.trim() : "";
  const supplierTehranCoverage = typeof value?.supplierSnapshot?.tehranCoverage === "string" ? value.supplierSnapshot.tehranCoverage.trim() : "";
  const supplierResponseCapability = value?.supplierSnapshot?.responseCapability as SupplierContactResponseCapability;
  if (
    !hasExactObjectKeys(value?.supplierSnapshot, ["supplierContactId", "supplierContactVersion", "displayName", "category", "tehranCoverage", "responseCapability", "networkStatus"])
    || !hasVisibleProjectTaskText(supplierDisplayName)
    || supplierDisplayName.length > 120
    || !hasVisibleProjectTaskText(supplierCategory)
    || supplierCategory.length > 120
    || !hasVisibleProjectTaskText(supplierTehranCoverage)
    || supplierTehranCoverage.length > 160
    || !["product", "service", "both"].includes(supplierResponseCapability)
    || !supplierContactCapabilitySupports({ responseCapability: supplierResponseCapability }, target.requestKind)
    || value?.supplierSnapshot?.networkStatus !== "خارج از شبکه چیدا"
  ) return null;
  const supplierSnapshot = {
    supplierContactId,
    supplierContactVersion,
    displayName: supplierDisplayName,
    category: supplierCategory,
    tehranCoverage: supplierTehranCoverage,
    responseCapability: supplierResponseCapability,
    networkStatus: "خارج از شبکه چیدا",
  } satisfies BuilderRecordedProposalSupplierSnapshot;
  if (JSON.stringify(stablePurchaseRequestValue(supplierSnapshot)) !== JSON.stringify(stablePurchaseRequestValue({ supplierContactId: contact.id, supplierContactVersion, displayName: contact.displayName, category: contact.category, tehranCoverage: contact.tehranCoverage, responseCapability: contact.responseCapability, networkStatus: "خارج از شبکه چیدا" }))) return null;

  const referenceKind = value?.reference?.kind as BuilderRecordedProposalReference["kind"];
  const projectFileId = value?.reference?.projectFileId === null ? null : typeof value?.reference?.projectFileId === "string" ? value.reference.projectFileId.trim() : "";
  let reference: BuilderRecordedProposalReference | null = null;
  if (referenceKind === "unattached" && projectFileId === null && value?.reference?.fileSnapshot === null) {
    reference = { kind: "unattached", projectFileId: null, fileSnapshot: null, contentPersisted: false, extractionPerformed: false };
  } else if (referenceKind === "project-file-metadata" && projectFileId) {
    const file = files.records.find((item) => item.id === projectFileId && item.projectId === projectId && item.storageMode === "metadata-only");
    const snapshot = value?.reference?.fileSnapshot;
    const displayName = typeof snapshot?.displayName === "string" ? snapshot.displayName.trim() : "";
    if (
      file
      && hasExactObjectKeys(snapshot, ["id", "displayName", "originalName", "mimeType", "size", "category", "createdAt", "storageMode"])
      && snapshot?.id === file.id
      && hasVisibleProjectTaskText(displayName)
      && displayName.length <= 140
      && snapshot?.originalName === file.originalName
      && snapshot?.mimeType === file.mimeType
      && snapshot?.size === file.size
      && snapshot?.category === file.category
      && snapshot?.createdAt === file.createdAt
      && snapshot?.storageMode === "metadata-only"
    ) reference = { kind: "project-file-metadata", projectFileId, fileSnapshot: { id: file.id, displayName, originalName: file.originalName, mimeType: file.mimeType, size: file.size, category: file.category, createdAt: file.createdAt, storageMode: "metadata-only" }, contentPersisted: false, extractionPerformed: false };
  }
  if (!reference || !hasExactObjectKeys(value?.reference, ["kind", "projectFileId", "fileSnapshot", "contentPersisted", "extractionPerformed"]) || value?.reference?.contentPersisted !== false || value?.reference?.extractionPerformed !== false || JSON.stringify(stablePurchaseRequestValue(value.reference)) !== JSON.stringify(stablePurchaseRequestValue(reference))) return null;

  const expectedLines = requestSnapshot.requestKind === "product"
    ? requestSnapshot.items.map((item, index) => ({ requestItemId: item.id, serviceSpecId: null, requestLabel: item.name ?? `قلم ${index + 1}` }))
    : [{ requestItemId: null, serviceSpecId: requestSnapshot.service!.id, requestLabel: requestSnapshot.service!.scope ?? "خدمت درخواستی" }];
  const eventIds = new Set<string>();
  const history: BuilderRecordedProposalEvent[] = Array.isArray(value?.history) ? value.history.flatMap((event: any, index: number): BuilderRecordedProposalEvent[] => {
    const eventId = typeof event?.id === "string" ? event.id.trim() : "";
    const at = typeof event?.at === "string" ? event.at.trim() : "";
    const type = event?.type as BuilderRecordedProposalEvent["type"];
    if (!hasExactObjectKeys(event, ["id", "type", "actor", "at", "version"]) || !eventId || eventIds.has(eventId) || (type !== "created" && type !== "updated") || event?.actor !== "شما" || event?.version !== index + 1 || index === 0 && type !== "created" || index > 0 && type !== "updated" || !isValidProjectFileDate(at)) return [];
    eventIds.add(eventId);
    return [{ id: eventId, type, actor: "شما", at, version: event.version }];
  }) : [];
  const revisionIds = new Set<string>();
  const revisions: BuilderRecordedProposalRevision[] = Array.isArray(value?.revisions) ? value.revisions.flatMap((revisionValue: any, index: number): BuilderRecordedProposalRevision[] => {
    const revisionId = typeof revisionValue?.id === "string" ? revisionValue.id.trim() : "";
    const createdAt = typeof revisionValue?.createdAt === "string" ? revisionValue.createdAt.trim() : "";
    const declaredAt = revisionValue?.declaredAt === null ? null : typeof revisionValue?.declaredAt === "string" && hasVisibleProjectTaskText(revisionValue.declaredAt) && revisionValue.declaredAt.length <= 80 && revisionValue.declaredAt.trim() === revisionValue.declaredAt ? revisionValue.declaredAt : undefined;
    const transcript = revisionValue?.transcript === null ? null : typeof revisionValue?.transcript === "string" && hasVisibleProjectTaskText(revisionValue.transcript) && revisionValue.transcript.length <= 2000 && revisionValue.transcript.trim() === revisionValue.transcript ? revisionValue.transcript : undefined;
    const notes = revisionValue?.notes === null ? null : typeof revisionValue?.notes === "string" && hasVisibleProjectTaskText(revisionValue.notes) && revisionValue.notes.length <= 1000 && revisionValue.notes.trim() === revisionValue.notes ? revisionValue.notes : undefined;
    if (!hasExactObjectKeys(revisionValue, ["id", "version", "createdAt", "declaredAt", "transcript", "notes", "lines", "fingerprint"]) || !revisionId || revisionIds.has(revisionId) || revisionValue?.version !== index + 1 || createdAt !== history[index]?.at || declaredAt === undefined || transcript === undefined || notes === undefined || !Array.isArray(revisionValue?.lines) || revisionValue.lines.length !== expectedLines.length) return [];
    const lineIds = new Set<string>();
    const lines: BuilderRecordedProposalLine[] = revisionValue.lines.flatMap((lineValue: any, lineIndex: number): BuilderRecordedProposalLine[] => {
      const line = parseBuilderRecordedProposalLine(lineValue, expectedLines[lineIndex]);
      if (!line || lineIds.has(line.id)) return [];
      lineIds.add(line.id);
      return [line];
    });
    if (lines.length !== expectedLines.length || index > 0 && JSON.stringify(lines.map((line) => line.id)) !== JSON.stringify((value.revisions[index - 1]?.lines ?? []).map((line: any) => line.id))) return [];
    const revision = { id: revisionId, version: revisionValue.version, createdAt, declaredAt, transcript, notes, lines } satisfies Omit<BuilderRecordedProposalRevision, "fingerprint">;
    const fingerprint = builderRecordedProposalRevisionFingerprint(target, requestSnapshot, supplierSnapshot, reference!, revision);
    if (revisionValue?.fingerprint !== fingerprint || !builderRecordedProposalHasMeaningfulInput(reference!, revision)) return [];
    revisionIds.add(revisionId);
    return [{ ...revision, fingerprint }];
  }) : [];
  const version = value?.version;
  const createdAt = typeof value?.createdAt === "string" ? value.createdAt.trim() : "";
  const updatedAt = typeof value?.updatedAt === "string" ? value.updatedAt.trim() : "";
  const currentRevisionId = typeof value?.currentRevisionId === "string" ? value.currentRevisionId.trim() : "";
  const firstDependencyAt = Math.max(new Date(reviewRevision.createdAt).getTime(), new Date(contentApproval.updatedAt).getTime(), new Date(contact.history[supplierContactVersion - 1].at).getTime(), reference.fileSnapshot ? new Date(reference.fileSnapshot.createdAt).getTime() : 0);
  const createdAtTime = new Date(createdAt).getTime();
  const latestRequestEventAtCreation = request.history.filter((event) => new Date(event.at).getTime() <= createdAtTime).at(-1);
  const latestContactEventAtCreation = contact.history.filter((event) => new Date(event.at).getTime() <= createdAtTime).at(-1);
  const creationDependenciesWereEligible = latestRequestEventAtCreation !== undefined
    && latestContactEventAtCreation !== undefined
    && latestRequestEventAtCreation.version === target.requestVersion
    && latestRequestEventAtCreation.type === "marked-ready-for-review"
    && latestContactEventAtCreation.version === supplierContactVersion
    && latestContactEventAtCreation.type !== "archived";
  const hasRepeatedSemanticRevision = revisions.some((revision, index) => index > 0
    && JSON.stringify(stablePurchaseRequestValue(builderRecordedProposalRevisionSemanticValue(revision)))
      === JSON.stringify(stablePurchaseRequestValue(builderRecordedProposalRevisionSemanticValue(revisions[index - 1]))));
  if (
    !hasExactObjectKeys(value, ["schemaVersion", "id", "projectId", "source", "networkStatus", "supplierAuthenticated", "receivedThroughChida", "externalEffect", "target", "requestSnapshot", "supplierSnapshot", "reference", "currentRevisionId", "visibility", "localStatus", "version", "createdAt", "updatedAt", "history", "revisions"])
    || !hasExactObjectKeys(value?.target, ["requestId", "requestVersion", "reviewRevisionId", "reviewRevisionFingerprint", "contentApprovalId", "requestKind"])
    || value?.schemaVersion !== 1
    || !id
    || !projectId
    || value?.source !== "ثبت دستی سازنده"
    || value?.networkStatus !== "خارج از شبکه چیدا"
    || value?.supplierAuthenticated !== false
    || value?.receivedThroughChida !== false
    || value?.externalEffect !== "none"
    || value?.visibility !== "خصوصی پروژه"
    || value?.localStatus !== "ثبت محلی"
    || !Number.isInteger(version)
    || version < 1
    || !Array.isArray(value?.history)
    || !Array.isArray(value?.revisions)
    || history.length !== value.history.length
    || revisions.length !== value.revisions.length
    || history.length !== version
    || revisions.length !== version
    || currentRevisionId !== revisions[revisions.length - 1]?.id
    || createdAt !== history[0]?.at
    || updatedAt !== history[history.length - 1]?.at
    || revisions[0]?.createdAt !== createdAt
    || revisions[revisions.length - 1]?.createdAt !== updatedAt
    || createdAtTime < firstDependencyAt
    || !creationDependenciesWereEligible
    || hasRepeatedSemanticRevision
    || history.some((event, index) => index > 0 && new Date(event.at).getTime() < new Date(history[index - 1].at).getTime())
  ) return null;
  return { schemaVersion: 1, id, projectId, source: "ثبت دستی سازنده", networkStatus: "خارج از شبکه چیدا", supplierAuthenticated: false, receivedThroughChida: false, externalEffect: "none", target, requestSnapshot, supplierSnapshot, reference, currentRevisionId, visibility: "خصوصی پروژه", localStatus: "ثبت محلی", version, createdAt, updatedAt, history, revisions };
}

function readStoredBuilderRecordedProposals(
  purchaseRequests: LocalRecordsReadResult<ProjectPurchaseRequestRecord>,
  approvals: LocalRecordsReadResult<ProjectApprovalRecord>,
  contacts: LocalRecordsReadResult<SupplierContactRecord>,
  files: LocalRecordsReadResult<ProjectFileRecord>,
): LocalRecordsReadResult<BuilderRecordedProposalRecord> {
  if (purchaseRequests.readError || approvals.readError || contacts.readError || files.readError) return { records: [], readError: true };
  try {
    const raw = window.localStorage.getItem(projectBuilderRecordedProposalsStorageKey);
    if (raw === null) return { records: [], readError: false };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 1000) return { records: [], readError: true };
    const ids = new Set<string>();
    const projectCounts = new Map<string, number>();
    let readError = false;
    const records = parsed.flatMap((value): BuilderRecordedProposalRecord[] => {
      const record = parseBuilderRecordedProposal(value, purchaseRequests, approvals, contacts, files);
      const nextProjectCount = record ? (projectCounts.get(record.projectId) ?? 0) + 1 : 0;
      if (!record || ids.has(record.id) || nextProjectCount > 100) {
        readError = true;
        return [];
      }
      ids.add(record.id);
      projectCounts.set(record.projectId, nextProjectCount);
      return [record];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
}

function parseBuilderProposalComparisonInput(value: any, proposals: BuilderRecordedProposalRecord[]): { proposal: BuilderRecordedProposalRecord; revision: BuilderRecordedProposalRevision; input: BuilderProposalComparisonInput } | null {
  const proposalId = typeof value?.proposalId === "string" ? value.proposalId.trim() : "";
  const proposalVersion = value?.proposalVersion;
  const proposalRevisionId = typeof value?.proposalRevisionId === "string" ? value.proposalRevisionId.trim() : "";
  const proposalRevisionFingerprint = typeof value?.proposalRevisionFingerprint === "string" ? value.proposalRevisionFingerprint.trim() : "";
  const proposal = proposals.find((item) => item.id === proposalId);
  const revision = proposal?.revisions.find((item) => item.id === proposalRevisionId && item.version === proposalVersion && item.fingerprint === proposalRevisionFingerprint);
  if (
    !hasExactObjectKeys(value, ["proposalId", "proposalVersion", "proposalRevisionId", "proposalRevisionFingerprint", "supplierSnapshot", "lineAdjustments", "taxTreatment", "transportTreatment"])
    || !proposal
    || !revision
    || proposal.target.requestKind !== "product"
    || JSON.stringify(stablePurchaseRequestValue(value?.supplierSnapshot)) !== JSON.stringify(stablePurchaseRequestValue(proposal.supplierSnapshot))
    || !Array.isArray(value?.lineAdjustments)
    || value.lineAdjustments.length !== revision.lines.length
  ) return null;
  const lineAdjustments = value.lineAdjustments.flatMap((adjustmentValue: any, index: number): BuilderProposalComparisonLineAdjustment[] => {
    const sourceLine = revision.lines[index];
    const proposalLineId = typeof adjustmentValue?.proposalLineId === "string" ? adjustmentValue.proposalLineId.trim() : "";
    const requestItemId = typeof adjustmentValue?.requestItemId === "string" ? adjustmentValue.requestItemId.trim() : "";
    const basis = adjustmentValue?.basis as BuilderProposalComparisonBasis;
    const adjustedQuantity = adjustmentValue?.adjustedQuantity === null ? null : typeof adjustmentValue?.adjustedQuantity === "string" ? adjustmentValue.adjustedQuantity : undefined;
    const adjustedQuantityUnit = adjustmentValue?.adjustedQuantityUnit === null ? null : typeof adjustmentValue?.adjustedQuantityUnit === "string" ? adjustmentValue.adjustedQuantityUnit : undefined;
    const assumption = adjustmentValue?.assumption === null ? null : typeof adjustmentValue?.assumption === "string" ? adjustmentValue.assumption : undefined;
    if (
      !sourceLine
      || !sourceLine.requestItemId
      || !hasExactObjectKeys(adjustmentValue, ["proposalLineId", "requestItemId", "basis", "adjustedQuantity", "adjustedQuantityUnit", "assumption", "source"])
      || proposalLineId !== sourceLine.id
      || requestItemId !== sourceLine.requestItemId
      || adjustmentValue?.source !== "فرض ثبت‌شده توسط سازنده"
    ) return [];
    if (basis === "declared-total") {
      const requested = proposal.requestSnapshot.items.find((item) => item.id === sourceLine.requestItemId);
      if (sourceLine.status !== "quoted" || sourceLine.totalPrice === null || sourceLine.quantity === null || sourceLine.unit === null || sourceLine.quantity !== requested?.quantity || sourceLine.unit !== requested?.unit || adjustedQuantity !== null || adjustedQuantityUnit !== null || assumption !== null) return [];
    } else if (basis === "unit-price-times-adjusted-quantity") {
      if (sourceLine.status !== "quoted" || sourceLine.unitPrice === null || sourceLine.unit === null || adjustedQuantity === null || adjustedQuantity === undefined || normalizeBuilderProposalComparisonNumber(adjustedQuantity, false) !== adjustedQuantity || adjustedQuantityUnit !== sourceLine.unit || assumption === null || assumption === undefined || normalizeBuilderRecordedProposalText(assumption, 500) !== assumption) return [];
    } else if (basis !== "unknown" || adjustedQuantity !== null || adjustedQuantityUnit !== null || assumption !== null) return [];
    return [{ proposalLineId, requestItemId, basis, adjustedQuantity, adjustedQuantityUnit, assumption, source: "فرض ثبت‌شده توسط سازنده" }];
  });
  const parseTreatment = <Mode extends string>(treatmentValue: any, modes: { included: Mode; fixed: Mode; unknown: Mode; rate?: Mode }) => {
    if (!hasExactObjectKeys(treatmentValue, ["mode", "value", "assumption", "source"]) || treatmentValue?.source !== "فرض ثبت‌شده توسط سازنده" || typeof treatmentValue?.mode !== "string") return null;
    const normalized = normalizeBuilderProposalComparisonTreatment(treatmentValue.mode as Mode, treatmentValue.value ?? "", treatmentValue.assumption ?? "", modes);
    return normalized && JSON.stringify(stablePurchaseRequestValue(normalized)) === JSON.stringify(stablePurchaseRequestValue(treatmentValue)) ? normalized : null;
  };
  const taxTreatment = parseTreatment<BuilderProposalComparisonTaxMode>(value.taxTreatment, { included: "included", fixed: "fixed", rate: "rate", unknown: "unknown" });
  const transportTreatment = parseTreatment<BuilderProposalComparisonTransportMode>(value.transportTreatment, { included: "included", fixed: "fixed", unknown: "unknown" });
  if (lineAdjustments.length !== revision.lines.length || !taxTreatment || !transportTreatment) return null;
  return {
    proposal,
    revision,
    input: { proposalId, proposalVersion, proposalRevisionId, proposalRevisionFingerprint, supplierSnapshot: structuredClone(proposal.supplierSnapshot), lineAdjustments, taxTreatment, transportTreatment } satisfies BuilderProposalComparisonInput,
  };
}

function parseBuilderProposalComparison(value: any, proposals: LocalRecordsReadResult<BuilderRecordedProposalRecord>): BuilderProposalComparisonRecord | null {
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const projectId = typeof value?.projectId === "string" ? value.projectId.trim() : "";
  const target = {
    requestId: typeof value?.target?.requestId === "string" ? value.target.requestId.trim() : "",
    requestVersion: value?.target?.requestVersion,
    reviewRevisionId: typeof value?.target?.reviewRevisionId === "string" ? value.target.reviewRevisionId.trim() : "",
    reviewRevisionFingerprint: typeof value?.target?.reviewRevisionFingerprint === "string" ? value.target.reviewRevisionFingerprint.trim() : "",
    requestKind: value?.target?.requestKind,
  } as BuilderProposalComparisonRecord["target"];
  const eventIds = new Set<string>();
  const history: BuilderProposalComparisonEvent[] = Array.isArray(value?.history) ? value.history.flatMap((event: any, index: number): BuilderProposalComparisonEvent[] => {
    const eventId = typeof event?.id === "string" ? event.id.trim() : "";
    const at = typeof event?.at === "string" ? event.at.trim() : "";
    const type = event?.type as BuilderProposalComparisonEvent["type"];
    if (!hasExactObjectKeys(event, ["id", "type", "actor", "at", "version"]) || !eventId || eventIds.has(eventId) || (type !== "created" && type !== "updated") || event?.actor !== "شما" || event?.version !== index + 1 || (index === 0 ? type !== "created" : type !== "updated") || !isValidProjectFileDate(at)) return [];
    eventIds.add(eventId);
    return [{ id: eventId, type, actor: "شما", at, version: event.version }];
  }) : [];
  const revisionIds = new Set<string>();
  const revisions: BuilderProposalComparisonRevision[] = Array.isArray(value?.revisions) && value.revisions.length <= 100 ? value.revisions.flatMap((revisionValue: any, index: number): BuilderProposalComparisonRevision[] => {
    const revisionId = typeof revisionValue?.id === "string" ? revisionValue.id.trim() : "";
    const createdAt = typeof revisionValue?.createdAt === "string" ? revisionValue.createdAt.trim() : "";
    if (!revisionId || revisionIds.has(revisionId) || revisionValue?.version !== index + 1 || createdAt !== history[index]?.at || !hasExactObjectKeys(revisionValue, ["id", "version", "createdAt", "inputs", "results", "recommendation", "fingerprint"]) || !Array.isArray(revisionValue?.inputs) || revisionValue.inputs.length < 2 || revisionValue.inputs.length > 8) return [];
    const parsedInputs: Array<ReturnType<typeof parseBuilderProposalComparisonInput>> = revisionValue.inputs.map((inputValue: any) => parseBuilderProposalComparisonInput(inputValue, proposals.records));
    if (parsedInputs.some((item) => !item)) return [];
    const proposalIds = new Set(parsedInputs.map((item) => item!.proposal.id));
    const allRelationsMatch = parsedInputs.every((item) => item!.proposal.projectId === projectId
      && item!.proposal.target.requestId === target.requestId
      && item!.proposal.target.requestVersion === target.requestVersion
      && item!.proposal.target.reviewRevisionId === target.reviewRevisionId
      && item!.proposal.target.reviewRevisionFingerprint === target.reviewRevisionFingerprint
      && item!.proposal.target.requestKind === "product");
    if (proposalIds.size !== parsedInputs.length || !allRelationsMatch || parsedInputs.some((item) => new Date(createdAt).getTime() < new Date(item!.revision.createdAt).getTime())) return [];
    const inputs = parsedInputs.map((item) => item!.input);
    const derived = deriveBuilderProposalComparisonPayload(inputs, proposals.records);
    if (!derived) return [];
    const revisionBase = { id: revisionId, version: revisionValue.version, createdAt, inputs, results: derived.results, recommendation: derived.recommendation } satisfies Omit<BuilderProposalComparisonRevision, "fingerprint">;
    const fingerprint = builderProposalComparisonRevisionFingerprint({ projectId, target, requestSnapshot: value?.requestSnapshot }, revisionBase);
    const expected = { ...revisionBase, fingerprint };
    if (JSON.stringify(stablePurchaseRequestValue(expected)) !== JSON.stringify(stablePurchaseRequestValue(revisionValue))) return [];
    revisionIds.add(revisionId);
    return [expected];
  }) : [];
  const version = value?.version;
  const createdAt = typeof value?.createdAt === "string" ? value.createdAt.trim() : "";
  const updatedAt = typeof value?.updatedAt === "string" ? value.updatedAt.trim() : "";
  const currentRevisionId = typeof value?.currentRevisionId === "string" ? value.currentRevisionId.trim() : "";
  const firstProposal = revisions[0] ? proposals.records.find((proposal) => proposal.id === revisions[0].inputs[0].proposalId) : null;
  const requestSnapshot = firstProposal?.requestSnapshot ?? null;
  const hasRepeatedSemanticRevision = revisions.some((revision, index) => index > 0 && JSON.stringify(stablePurchaseRequestValue(builderProposalComparisonSemanticValue(revision))) === JSON.stringify(stablePurchaseRequestValue(builderProposalComparisonSemanticValue(revisions[index - 1]))));
  if (
    !hasExactObjectKeys(value, ["schemaVersion", "id", "projectId", "purpose", "target", "requestSnapshot", "currentRevisionId", "visibility", "localStatus", "externalEffect", "networkUsed", "aiUsed", "version", "createdAt", "updatedAt", "history", "revisions"])
    || !hasExactObjectKeys(value?.target, ["requestId", "requestVersion", "reviewRevisionId", "reviewRevisionFingerprint", "requestKind"])
    || value?.schemaVersion !== 1
    || !id
    || !projectId
    || value?.purpose !== "compare-builder-recorded-product-proposals"
    || target.requestKind !== "product"
    || !target.requestId
    || !Number.isInteger(target.requestVersion)
    || target.requestVersion < 1
    || !target.reviewRevisionId
    || !target.reviewRevisionFingerprint
    || !requestSnapshot
    || requestSnapshot.requestKind !== "product"
    || JSON.stringify(stablePurchaseRequestValue(value?.requestSnapshot)) !== JSON.stringify(stablePurchaseRequestValue(requestSnapshot))
    || value?.visibility !== "خصوصی پروژه"
    || value?.localStatus !== "ثبت محلی"
    || value?.externalEffect !== "none"
    || value?.networkUsed !== false
    || value?.aiUsed !== false
    || !Number.isInteger(version)
    || version < 1
    || !Array.isArray(value?.history)
    || !Array.isArray(value?.revisions)
    || history.length !== value.history.length
    || revisions.length !== value.revisions.length
    || history.length !== version
    || revisions.length !== version
    || currentRevisionId !== revisions[revisions.length - 1]?.id
    || createdAt !== history[0]?.at
    || updatedAt !== history[history.length - 1]?.at
    || revisions[0]?.createdAt !== createdAt
    || revisions[revisions.length - 1]?.createdAt !== updatedAt
    || history.some((event, index) => index > 0 && new Date(event.at).getTime() < new Date(history[index - 1].at).getTime())
    || hasRepeatedSemanticRevision
  ) return null;
  return { schemaVersion: 1, id, projectId, purpose: "compare-builder-recorded-product-proposals", target, requestSnapshot, currentRevisionId, visibility: "خصوصی پروژه", localStatus: "ثبت محلی", externalEffect: "none", networkUsed: false, aiUsed: false, version, createdAt, updatedAt, history, revisions };
}

function readStoredBuilderProposalComparisons(proposals: LocalRecordsReadResult<BuilderRecordedProposalRecord>): LocalRecordsReadResult<BuilderProposalComparisonRecord> {
  if (proposals.readError) return { records: [], readError: true };
  try {
    const raw = window.localStorage.getItem(projectBuilderProposalComparisonsStorageKey);
    if (raw === null) return { records: [], readError: false };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 1000) return { records: [], readError: true };
    const ids = new Set<string>();
    const projectCounts = new Map<string, number>();
    let readError = false;
    const records = parsed.flatMap((value): BuilderProposalComparisonRecord[] => {
      const record = parseBuilderProposalComparison(value, proposals);
      const nextProjectCount = record ? (projectCounts.get(record.projectId) ?? 0) + 1 : 0;
      if (!record || ids.has(record.id) || nextProjectCount > 100) {
        readError = true;
        return [];
      }
      ids.add(record.id);
      projectCounts.set(record.projectId, nextProjectCount);
      return [record];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
}

function parseBuilderProposalComparisonDecision(value: any, comparisons: LocalRecordsReadResult<BuilderProposalComparisonRecord>): BuilderProposalComparisonDecisionRecord | null {
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const projectId = typeof value?.projectId === "string" ? value.projectId.trim() : "";
  const target = {
    comparisonId: typeof value?.target?.comparisonId === "string" ? value.target.comparisonId.trim() : "",
    comparisonVersion: value?.target?.comparisonVersion,
    comparisonRevisionId: typeof value?.target?.comparisonRevisionId === "string" ? value.target.comparisonRevisionId.trim() : "",
    comparisonRevisionFingerprint: typeof value?.target?.comparisonRevisionFingerprint === "string" ? value.target.comparisonRevisionFingerprint.trim() : "",
  } satisfies BuilderProposalComparisonDecisionRecord["target"];
  const comparison = comparisons.records.find((item) => item.id === target.comparisonId && item.projectId === projectId);
  const comparisonRevision = comparison?.revisions.find((item) => item.id === target.comparisonRevisionId && item.version === target.comparisonVersion && item.fingerprint === target.comparisonRevisionFingerprint);
  if (!comparison || !comparisonRevision) return null;
  const eventIds = new Set<string>();
  const history: BuilderProposalComparisonDecisionEvent[] = Array.isArray(value?.history) ? value.history.flatMap((event: any, index: number): BuilderProposalComparisonDecisionEvent[] => {
    const eventId = typeof event?.id === "string" ? event.id.trim() : "";
    const at = typeof event?.at === "string" ? event.at.trim() : "";
    const type = event?.type as BuilderProposalComparisonDecisionEvent["type"];
    if (!hasExactObjectKeys(event, ["id", "type", "actor", "at", "version"]) || !eventId || eventIds.has(eventId) || (type !== "created" && type !== "updated") || event?.actor !== "شما" || event?.version !== index + 1 || (index === 0 ? type !== "created" : type !== "updated") || !isValidProjectFileDate(at)) return [];
    eventIds.add(eventId);
    return [{ id: eventId, type, actor: "شما", at, version: event.version }];
  }) : [];
  const revisionIds = new Set<string>();
  const revisions: BuilderProposalComparisonDecisionRevision[] = Array.isArray(value?.revisions) && value.revisions.length <= 100 ? value.revisions.flatMap((revisionValue: any, index: number): BuilderProposalComparisonDecisionRevision[] => {
    const revisionId = typeof revisionValue?.id === "string" ? revisionValue.id.trim() : "";
    const createdAt = typeof revisionValue?.createdAt === "string" ? revisionValue.createdAt.trim() : "";
    const outcome = revisionValue?.outcome as BuilderProposalComparisonDecisionOutcome;
    const selectedProposalId = revisionValue?.selectedProposalId === null ? null : typeof revisionValue?.selectedProposalId === "string" ? revisionValue.selectedProposalId.trim() : "";
    const reason = typeof revisionValue?.reason === "string" ? revisionValue.reason.trim() : "";
    const selectionIsValid = outcome === "preferred-for-follow-up" ? Boolean(selectedProposalId && comparisonRevision.inputs.some((input) => input.proposalId === selectedProposalId)) : selectedProposalId === null;
    if (!hasExactObjectKeys(revisionValue, ["id", "version", "createdAt", "outcome", "selectedProposalId", "reason", "fingerprint"]) || !revisionId || revisionIds.has(revisionId) || revisionValue?.version !== index + 1 || createdAt !== history[index]?.at || !["preferred-for-follow-up", "needs-clarification", "no-selection"].includes(outcome) || !selectionIsValid || !hasVisibleProjectTaskText(reason) || reason.length > 500 || reason !== revisionValue?.reason || new Date(createdAt).getTime() < new Date(comparisonRevision.createdAt).getTime()) return [];
    const revisionBase = { id: revisionId, version: revisionValue.version, createdAt, outcome, selectedProposalId: selectedProposalId || null, reason } satisfies Omit<BuilderProposalComparisonDecisionRevision, "fingerprint">;
    const fingerprint = builderProposalComparisonDecisionRevisionFingerprint(target, revisionBase);
    if (revisionValue?.fingerprint !== fingerprint) return [];
    revisionIds.add(revisionId);
    return [{ ...revisionBase, fingerprint }];
  }) : [];
  const version = value?.version;
  const createdAt = typeof value?.createdAt === "string" ? value.createdAt.trim() : "";
  const updatedAt = typeof value?.updatedAt === "string" ? value.updatedAt.trim() : "";
  const currentRevisionId = typeof value?.currentRevisionId === "string" ? value.currentRevisionId.trim() : "";
  const hasRepeatedSemanticRevision = revisions.some((revision, index) => index > 0 && revision.outcome === revisions[index - 1].outcome && revision.selectedProposalId === revisions[index - 1].selectedProposalId && revision.reason === revisions[index - 1].reason);
  if (
    !hasExactObjectKeys(value, ["schemaVersion", "id", "projectId", "purpose", "target", "currentRevisionId", "visibility", "localStatus", "externalEffect", "sendAuthorized", "purchaseAuthorized", "supplierNotified", "version", "createdAt", "updatedAt", "history", "revisions"])
    || !hasExactObjectKeys(value?.target, ["comparisonId", "comparisonVersion", "comparisonRevisionId", "comparisonRevisionFingerprint"])
    || value?.schemaVersion !== 1
    || !id
    || !projectId
    || value?.purpose !== "record-local-proposal-comparison-decision"
    || value?.visibility !== "خصوصی پروژه"
    || value?.localStatus !== "ثبت محلی"
    || value?.externalEffect !== "none"
    || value?.sendAuthorized !== false
    || value?.purchaseAuthorized !== false
    || value?.supplierNotified !== false
    || !Number.isInteger(version)
    || version < 1
    || history.length !== value?.history?.length
    || revisions.length !== value?.revisions?.length
    || history.length !== version
    || revisions.length !== version
    || currentRevisionId !== revisions[revisions.length - 1]?.id
    || createdAt !== history[0]?.at
    || updatedAt !== history[history.length - 1]?.at
    || revisions[0]?.createdAt !== createdAt
    || revisions[revisions.length - 1]?.createdAt !== updatedAt
    || history.some((event, index) => index > 0 && new Date(event.at).getTime() < new Date(history[index - 1].at).getTime())
    || hasRepeatedSemanticRevision
  ) return null;
  return { schemaVersion: 1, id, projectId, purpose: "record-local-proposal-comparison-decision", target, currentRevisionId, visibility: "خصوصی پروژه", localStatus: "ثبت محلی", externalEffect: "none", sendAuthorized: false, purchaseAuthorized: false, supplierNotified: false, version, createdAt, updatedAt, history, revisions };
}

function readStoredBuilderProposalComparisonDecisions(comparisons: LocalRecordsReadResult<BuilderProposalComparisonRecord>): LocalRecordsReadResult<BuilderProposalComparisonDecisionRecord> {
  if (comparisons.readError) return { records: [], readError: true };
  try {
    const raw = window.localStorage.getItem(projectBuilderProposalComparisonDecisionsStorageKey);
    if (raw === null) return { records: [], readError: false };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 1000) return { records: [], readError: true };
    const ids = new Set<string>();
    const targets = new Set<string>();
    const projectCounts = new Map<string, number>();
    let readError = false;
    const records = parsed.flatMap((value): BuilderProposalComparisonDecisionRecord[] => {
      const record = parseBuilderProposalComparisonDecision(value, comparisons);
      const targetKey = record ? `${record.target.comparisonId}:${record.target.comparisonRevisionId}` : "";
      const nextProjectCount = record ? (projectCounts.get(record.projectId) ?? 0) + 1 : 0;
      if (!record || ids.has(record.id) || targets.has(targetKey) || nextProjectCount > 100) {
        readError = true;
        return [];
      }
      ids.add(record.id);
      targets.add(targetKey);
      projectCounts.set(record.projectId, nextProjectCount);
      return [record];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
}

function parseBuilderServiceProposalComparisonRequestSnapshot(value: any): BuilderServiceProposalComparisonRequestSnapshot | null {
  if (!hasExactObjectKeys(value, ["id", "scope", "location", "sizeOrVolume", "qualification", "timing", "method", "inScope", "outOfScope", "warranty", "paymentTerms"])) return null;
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const textValue = (item: unknown) => item === null ? null : typeof item === "string" && item.trim() === item && hasVisibleProjectTaskText(item) && item.length <= 500 ? item : undefined;
  const scope = textValue(value?.scope);
  const location = textValue(value?.location);
  const sizeOrVolume = textValue(value?.sizeOrVolume);
  const qualification = textValue(value?.qualification);
  const timing = textValue(value?.timing);
  const method = textValue(value?.method);
  const inScope = textValue(value?.inScope);
  const outOfScope = textValue(value?.outOfScope);
  const warranty = textValue(value?.warranty);
  const paymentTerms = textValue(value?.paymentTerms);
  if (!id || [scope, location, sizeOrVolume, qualification, timing, method, inScope, outOfScope, warranty, paymentTerms].some((item) => item === undefined)) return null;
  return { id, scope: scope!, location: location!, sizeOrVolume: sizeOrVolume!, qualification: qualification!, timing: timing!, method: method!, inScope: inScope!, outOfScope: outOfScope!, warranty: warranty!, paymentTerms: paymentTerms! };
}

function parseBuilderServiceProposalComparisonInput(
  value: any,
  proposals: BuilderRecordedProposalRecord[],
  projectId: string,
  target: BuilderServiceProposalComparisonRecord["target"],
  requestSnapshot: BuilderServiceProposalComparisonRequestSnapshot,
): BuilderServiceProposalComparisonInput | null {
  const proposalId = typeof value?.proposalId === "string" ? value.proposalId.trim() : "";
  const proposalVersion = value?.proposalVersion;
  const proposalRevisionId = typeof value?.proposalRevisionId === "string" ? value.proposalRevisionId.trim() : "";
  const proposalRevisionFingerprint = typeof value?.proposalRevisionFingerprint === "string" ? value.proposalRevisionFingerprint.trim() : "";
  const proposal = proposals.find((item) => item.id === proposalId && item.projectId === projectId && item.target.requestKind === "service");
  const proposalRevision = proposal?.revisions.find((item) => item.id === proposalRevisionId && item.version === proposalVersion && item.fingerprint === proposalRevisionFingerprint);
  const targetKey = [target.requestId, target.requestVersion, target.reviewRevisionId, target.reviewRevisionFingerprint].join(":");
  if (
    !hasExactObjectKeys(value, ["proposalId", "proposalVersion", "proposalRevisionId", "proposalRevisionFingerprint", "proposalLineId", "serviceSpecId", "supplierSnapshot", "criteria"])
    || !proposal
    || builderProposalComparisonRequestKey(proposal) !== targetKey
    || !proposalRevision
    || proposalRevision.lines.length !== 1
    || value?.proposalLineId !== proposalRevision.lines[0].id
    || value?.serviceSpecId !== proposalRevision.lines[0].serviceSpecId
    || proposalRevision.lines[0].serviceSpecId !== requestSnapshot.id
    || JSON.stringify(stablePurchaseRequestValue(value?.supplierSnapshot)) !== JSON.stringify(stablePurchaseRequestValue(proposal.supplierSnapshot))
    || !Array.isArray(value?.criteria)
    || value.criteria.length !== builderServiceProposalComparisonCriteriaV1.length
  ) return null;
  const seenCriteria = new Set<BuilderServiceProposalComparisonCriterionId>();
  const criteria = value.criteria.flatMap((criterionValue: any, index: number): BuilderServiceProposalComparisonCriterionInput[] => {
    const definition = builderServiceProposalComparisonCriteriaV1[index];
    const criterionId = criterionValue?.criterionId as BuilderServiceProposalComparisonCriterionId;
    const assessment = criterionValue?.assessment as BuilderServiceProposalComparisonAssessment;
    const declaredValue = criterionValue?.declaredValue === null ? null : typeof criterionValue?.declaredValue === "string" && criterionValue.declaredValue.trim() === criterionValue.declaredValue && hasVisibleProjectTaskText(criterionValue.declaredValue) && criterionValue.declaredValue.length <= 500 ? criterionValue.declaredValue : undefined;
    const rationale = criterionValue?.rationale === null ? null : typeof criterionValue?.rationale === "string" && criterionValue.rationale.trim() === criterionValue.rationale && hasVisibleProjectTaskText(criterionValue.rationale) && criterionValue.rationale.length <= 500 ? criterionValue.rationale : undefined;
    const requestValue = definition ? requestSnapshot[definition.requestField] : null;
    const stateIsValid = assessment === "unknown"
      ? true
      : assessment === "not-applicable"
        ? requestValue === null && declaredValue === null && typeof rationale === "string"
        : typeof declaredValue === "string" && typeof rationale === "string" && requestValue !== null;
    if (
      !definition
      || !hasExactObjectKeys(criterionValue, ["criterionId", "declaredValue", "assessment", "rationale", "declaredSource", "assessmentSource"])
      || criterionId !== definition.id
      || seenCriteria.has(criterionId)
      || !["aligned", "partial", "different", "unknown", "not-applicable"].includes(assessment)
      || declaredValue === undefined
      || rationale === undefined
      || !stateIsValid
      || criterionValue?.declaredSource !== "رونویسی تکمیلی سازنده برای مقایسه"
      || criterionValue?.assessmentSource !== "ارزیابی سازنده"
    ) return [];
    seenCriteria.add(criterionId);
    return [{ criterionId, declaredValue, assessment, rationale, declaredSource: "رونویسی تکمیلی سازنده برای مقایسه", assessmentSource: "ارزیابی سازنده" }];
  });
  if (criteria.length !== builderServiceProposalComparisonCriteriaV1.length) return null;
  return { proposalId, proposalVersion, proposalRevisionId, proposalRevisionFingerprint, proposalLineId: proposalRevision.lines[0].id, serviceSpecId: proposalRevision.lines[0].serviceSpecId!, supplierSnapshot: structuredClone(proposal.supplierSnapshot), criteria };
}

function parseBuilderServiceProposalComparison(
  value: any,
  proposals: LocalRecordsReadResult<BuilderRecordedProposalRecord>,
  requests: LocalRecordsReadResult<ProjectPurchaseRequestRecord>,
): BuilderServiceProposalComparisonRecord | null {
  if (proposals.readError || requests.readError) return null;
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const projectId = typeof value?.projectId === "string" ? value.projectId.trim() : "";
  const target = {
    requestId: typeof value?.target?.requestId === "string" ? value.target.requestId.trim() : "",
    requestVersion: value?.target?.requestVersion,
    reviewRevisionId: typeof value?.target?.reviewRevisionId === "string" ? value.target.reviewRevisionId.trim() : "",
    reviewRevisionFingerprint: typeof value?.target?.reviewRevisionFingerprint === "string" ? value.target.reviewRevisionFingerprint.trim() : "",
    requestKind: value?.target?.requestKind,
  } satisfies BuilderServiceProposalComparisonRecord["target"];
  const request = requests.records.find((item) => item.id === target.requestId && item.projectId === projectId);
  const reviewRevision = request?.reviewRevisions.find((item) => item.id === target.reviewRevisionId && item.requestVersion === target.requestVersion && item.fingerprint === target.reviewRevisionFingerprint);
  const expectedRequestSnapshot = reviewRevision ? builderServiceProposalComparisonRequestSnapshotFromReview(reviewRevision.snapshot) : null;
  const requestSnapshot = parseBuilderServiceProposalComparisonRequestSnapshot(value?.requestSnapshot);
  if (!request || !reviewRevision || !expectedRequestSnapshot || !requestSnapshot || JSON.stringify(stablePurchaseRequestValue(requestSnapshot)) !== JSON.stringify(stablePurchaseRequestValue(expectedRequestSnapshot))) return null;
  const eventIds = new Set<string>();
  const history: BuilderServiceProposalComparisonEvent[] = Array.isArray(value?.history) && value.history.length <= 100 ? value.history.flatMap((event: any, index: number): BuilderServiceProposalComparisonEvent[] => {
    const eventId = typeof event?.id === "string" ? event.id.trim() : "";
    const at = typeof event?.at === "string" ? event.at.trim() : "";
    const type = event?.type as BuilderServiceProposalComparisonEvent["type"];
    if (!hasExactObjectKeys(event, ["id", "type", "actor", "at", "version"]) || !eventId || eventId !== event?.id || at !== event?.at || eventIds.has(eventId) || (index === 0 ? type !== "created" : type !== "updated") || event?.actor !== "شما" || event?.version !== index + 1 || !isValidProjectFileDate(at)) return [];
    eventIds.add(eventId);
    return [{ id: eventId, type, actor: "شما", at, version: event.version }];
  }) : [];
  const revisionIds = new Set<string>();
  const revisions: BuilderServiceProposalComparisonRevision[] = Array.isArray(value?.revisions) && value.revisions.length <= 100 ? value.revisions.flatMap((revisionValue: any, index: number): BuilderServiceProposalComparisonRevision[] => {
    const revisionId = typeof revisionValue?.id === "string" ? revisionValue.id.trim() : "";
    const createdAt = typeof revisionValue?.createdAt === "string" ? revisionValue.createdAt.trim() : "";
    if (!hasExactObjectKeys(revisionValue, ["id", "version", "createdAt", "inputs", "results", "summary", "fingerprint"]) || !revisionId || revisionIds.has(revisionId) || revisionValue?.version !== index + 1 || createdAt !== history[index]?.at || !Array.isArray(revisionValue?.inputs) || revisionValue.inputs.length < 2 || revisionValue.inputs.length > 8) return [];
    const proposalIds = new Set<string>();
    const inputs: BuilderServiceProposalComparisonInput[] = revisionValue.inputs.flatMap((inputValue: any): BuilderServiceProposalComparisonInput[] => {
      const input = parseBuilderServiceProposalComparisonInput(inputValue, proposals.records, projectId, target, requestSnapshot);
      if (!input || proposalIds.has(input.proposalId)) return [];
      proposalIds.add(input.proposalId);
      return [input];
    });
    const derived = inputs.length === revisionValue.inputs.length ? deriveBuilderServiceProposalComparisonPayload(inputs, proposals.records, requestSnapshot) : null;
    if (!derived || JSON.stringify(stablePurchaseRequestValue(revisionValue?.results)) !== JSON.stringify(stablePurchaseRequestValue(derived.results)) || JSON.stringify(stablePurchaseRequestValue(revisionValue?.summary)) !== JSON.stringify(stablePurchaseRequestValue(derived.summary))) return [];
    const revisionBase = { id: revisionId, version: revisionValue.version, createdAt, inputs, results: derived.results, summary: derived.summary } satisfies Omit<BuilderServiceProposalComparisonRevision, "fingerprint">;
    const fingerprint = builderServiceProposalComparisonRevisionFingerprint({ projectId, target, requestSnapshot }, revisionBase);
    const newestDependencyTime = Math.max(new Date(reviewRevision.createdAt).getTime(), ...inputs.map((input) => new Date(proposals.records.find((proposal) => proposal.id === input.proposalId)!.revisions.find((revision) => revision.id === input.proposalRevisionId)!.createdAt).getTime()));
    if (revisionValue?.fingerprint !== fingerprint || new Date(createdAt).getTime() < newestDependencyTime) return [];
    revisionIds.add(revisionId);
    return [{ ...revisionBase, fingerprint }];
  }) : [];
  const version = value?.version;
  const createdAt = typeof value?.createdAt === "string" ? value.createdAt.trim() : "";
  const updatedAt = typeof value?.updatedAt === "string" ? value.updatedAt.trim() : "";
  const currentRevisionId = typeof value?.currentRevisionId === "string" ? value.currentRevisionId.trim() : "";
  const hasRepeatedSemanticRevision = revisions.some((revision, index) => index > 0 && JSON.stringify(stablePurchaseRequestValue(builderServiceProposalComparisonSemanticValue(revision))) === JSON.stringify(stablePurchaseRequestValue(builderServiceProposalComparisonSemanticValue(revisions[index - 1]))));
  if (
    !hasExactObjectKeys(value, ["schemaVersion", "id", "projectId", "purpose", "target", "requestSnapshot", "currentRevisionId", "visibility", "localStatus", "externalEffect", "networkUsed", "aiUsed", "scoringUsed", "version", "createdAt", "updatedAt", "history", "revisions"])
    || !hasExactObjectKeys(value?.target, ["requestId", "requestVersion", "reviewRevisionId", "reviewRevisionFingerprint", "requestKind"])
    || value?.schemaVersion !== 1
    || !id
    || !projectId
    || value?.purpose !== "compare-builder-recorded-service-proposals"
    || target.requestKind !== "service"
    || !target.requestId
    || !Number.isInteger(target.requestVersion)
    || target.requestVersion < 1
    || !target.reviewRevisionId
    || !target.reviewRevisionFingerprint
    || value?.visibility !== "خصوصی پروژه"
    || value?.localStatus !== "ثبت محلی"
    || value?.externalEffect !== "none"
    || value?.networkUsed !== false
    || value?.aiUsed !== false
    || value?.scoringUsed !== false
    || !Number.isInteger(version)
    || version < 1
    || history.length !== value?.history?.length
    || revisions.length !== value?.revisions?.length
    || history.length !== version
    || revisions.length !== version
    || currentRevisionId !== revisions[revisions.length - 1]?.id
    || createdAt !== history[0]?.at
    || updatedAt !== history[history.length - 1]?.at
    || revisions[0]?.createdAt !== createdAt
    || revisions[revisions.length - 1]?.createdAt !== updatedAt
    || history.some((event, index) => index > 0 && new Date(event.at).getTime() < new Date(history[index - 1].at).getTime())
    || hasRepeatedSemanticRevision
  ) return null;
  return { schemaVersion: 1, id, projectId, purpose: "compare-builder-recorded-service-proposals", target, requestSnapshot, currentRevisionId, visibility: "خصوصی پروژه", localStatus: "ثبت محلی", externalEffect: "none", networkUsed: false, aiUsed: false, scoringUsed: false, version, createdAt, updatedAt, history, revisions };
}

function readStoredBuilderServiceProposalComparisons(
  proposals: LocalRecordsReadResult<BuilderRecordedProposalRecord>,
  requests: LocalRecordsReadResult<ProjectPurchaseRequestRecord>,
): LocalRecordsReadResult<BuilderServiceProposalComparisonRecord> {
  if (proposals.readError || requests.readError) return { records: [], readError: true };
  try {
    const raw = window.localStorage.getItem(projectBuilderServiceProposalComparisonsStorageKey);
    if (raw === null) return { records: [], readError: false };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 1000) return { records: [], readError: true };
    const ids = new Set<string>();
    const projectCounts = new Map<string, number>();
    let readError = false;
    const records = parsed.flatMap((item): BuilderServiceProposalComparisonRecord[] => {
      const record = parseBuilderServiceProposalComparison(item, proposals, requests);
      const nextProjectCount = record ? (projectCounts.get(record.projectId) ?? 0) + 1 : 0;
      if (!record || ids.has(record.id) || nextProjectCount > 100) {
        readError = true;
        return [];
      }
      ids.add(record.id);
      projectCounts.set(record.projectId, nextProjectCount);
      return [record];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
}

function parseBuilderServiceProposalComparisonDecision(
  value: any,
  comparisons: LocalRecordsReadResult<BuilderServiceProposalComparisonRecord>,
): BuilderServiceProposalComparisonDecisionRecord | null {
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const projectId = typeof value?.projectId === "string" ? value.projectId.trim() : "";
  const target = {
    comparisonId: typeof value?.target?.comparisonId === "string" ? value.target.comparisonId.trim() : "",
    comparisonVersion: value?.target?.comparisonVersion,
    comparisonRevisionId: typeof value?.target?.comparisonRevisionId === "string" ? value.target.comparisonRevisionId.trim() : "",
    comparisonRevisionFingerprint: typeof value?.target?.comparisonRevisionFingerprint === "string" ? value.target.comparisonRevisionFingerprint.trim() : "",
  } satisfies BuilderServiceProposalComparisonDecisionRecord["target"];
  const comparison = comparisons.records.find((item) => item.id === target.comparisonId && item.projectId === projectId);
  const comparisonRevision = comparison?.revisions.find((item) => item.id === target.comparisonRevisionId && item.version === target.comparisonVersion && item.fingerprint === target.comparisonRevisionFingerprint);
  if (!comparison || !comparisonRevision) return null;
  const eventIds = new Set<string>();
  const history: BuilderServiceProposalComparisonDecisionEvent[] = Array.isArray(value?.history) && value.history.length <= 100 ? value.history.flatMap((event: any, index: number): BuilderServiceProposalComparisonDecisionEvent[] => {
    const eventId = typeof event?.id === "string" ? event.id.trim() : "";
    const at = typeof event?.at === "string" ? event.at.trim() : "";
    const type = event?.type as BuilderServiceProposalComparisonDecisionEvent["type"];
    if (!hasExactObjectKeys(event, ["id", "type", "actor", "at", "version"]) || !eventId || eventIds.has(eventId) || (index === 0 ? type !== "created" : type !== "updated") || event?.actor !== "شما" || event?.version !== index + 1 || !isValidProjectFileDate(at)) return [];
    eventIds.add(eventId);
    return [{ id: eventId, type, actor: "شما", at, version: event.version }];
  }) : [];
  const revisionIds = new Set<string>();
  const revisions: BuilderServiceProposalComparisonDecisionRevision[] = Array.isArray(value?.revisions) && value.revisions.length <= 100 ? value.revisions.flatMap((revisionValue: any, index: number): BuilderServiceProposalComparisonDecisionRevision[] => {
    const revisionId = typeof revisionValue?.id === "string" ? revisionValue.id.trim() : "";
    const createdAt = typeof revisionValue?.createdAt === "string" ? revisionValue.createdAt.trim() : "";
    const outcome = revisionValue?.outcome as BuilderServiceProposalComparisonDecisionOutcome;
    const selectedProposalId = revisionValue?.selectedProposalId === null ? null : typeof revisionValue?.selectedProposalId === "string" ? revisionValue.selectedProposalId.trim() : "";
    const reason = typeof revisionValue?.reason === "string" ? revisionValue.reason.trim() : "";
    const selectionIsValid = outcome === "preferred-for-follow-up" ? Boolean(selectedProposalId && comparisonRevision.inputs.some((input) => input.proposalId === selectedProposalId)) : selectedProposalId === null;
    if (!hasExactObjectKeys(revisionValue, ["id", "version", "createdAt", "outcome", "selectedProposalId", "reason", "fingerprint"]) || !revisionId || revisionIds.has(revisionId) || revisionValue?.version !== index + 1 || createdAt !== history[index]?.at || !["preferred-for-follow-up", "needs-clarification", "no-selection"].includes(outcome) || !selectionIsValid || !hasVisibleProjectTaskText(reason) || reason.length > 500 || reason !== revisionValue?.reason || new Date(createdAt).getTime() < new Date(comparisonRevision.createdAt).getTime()) return [];
    const revisionBase = { id: revisionId, version: revisionValue.version, createdAt, outcome, selectedProposalId: selectedProposalId || null, reason } satisfies Omit<BuilderServiceProposalComparisonDecisionRevision, "fingerprint">;
    const fingerprint = builderServiceProposalComparisonDecisionRevisionFingerprint(target, revisionBase);
    if (revisionValue?.fingerprint !== fingerprint) return [];
    revisionIds.add(revisionId);
    return [{ ...revisionBase, fingerprint }];
  }) : [];
  const version = value?.version;
  const createdAt = typeof value?.createdAt === "string" ? value.createdAt.trim() : "";
  const updatedAt = typeof value?.updatedAt === "string" ? value.updatedAt.trim() : "";
  const currentRevisionId = typeof value?.currentRevisionId === "string" ? value.currentRevisionId.trim() : "";
  const hasRepeatedSemanticRevision = revisions.some((revision, index) => index > 0 && revision.outcome === revisions[index - 1].outcome && revision.selectedProposalId === revisions[index - 1].selectedProposalId && revision.reason === revisions[index - 1].reason);
  if (
    !hasExactObjectKeys(value, ["schemaVersion", "id", "projectId", "purpose", "target", "currentRevisionId", "visibility", "localStatus", "externalEffect", "sendAuthorized", "purchaseAuthorized", "supplierNotified", "version", "createdAt", "updatedAt", "history", "revisions"])
    || !hasExactObjectKeys(value?.target, ["comparisonId", "comparisonVersion", "comparisonRevisionId", "comparisonRevisionFingerprint"])
    || value?.schemaVersion !== 1
    || !id
    || !projectId
    || value?.purpose !== "record-local-service-proposal-comparison-decision"
    || value?.visibility !== "خصوصی پروژه"
    || value?.localStatus !== "ثبت محلی"
    || value?.externalEffect !== "none"
    || value?.sendAuthorized !== false
    || value?.purchaseAuthorized !== false
    || value?.supplierNotified !== false
    || !Number.isInteger(version)
    || version < 1
    || history.length !== value?.history?.length
    || revisions.length !== value?.revisions?.length
    || history.length !== version
    || revisions.length !== version
    || currentRevisionId !== revisions[revisions.length - 1]?.id
    || createdAt !== history[0]?.at
    || updatedAt !== history[history.length - 1]?.at
    || revisions[0]?.createdAt !== createdAt
    || revisions[revisions.length - 1]?.createdAt !== updatedAt
    || history.some((event, index) => index > 0 && new Date(event.at).getTime() < new Date(history[index - 1].at).getTime())
    || hasRepeatedSemanticRevision
  ) return null;
  return { schemaVersion: 1, id, projectId, purpose: "record-local-service-proposal-comparison-decision", target, currentRevisionId, visibility: "خصوصی پروژه", localStatus: "ثبت محلی", externalEffect: "none", sendAuthorized: false, purchaseAuthorized: false, supplierNotified: false, version, createdAt, updatedAt, history, revisions };
}

function readStoredBuilderServiceProposalComparisonDecisions(
  comparisons: LocalRecordsReadResult<BuilderServiceProposalComparisonRecord>,
): LocalRecordsReadResult<BuilderServiceProposalComparisonDecisionRecord> {
  if (comparisons.readError) return { records: [], readError: true };
  try {
    const raw = window.localStorage.getItem(projectBuilderServiceProposalComparisonDecisionsStorageKey);
    if (raw === null) return { records: [], readError: false };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 1000) return { records: [], readError: true };
    const ids = new Set<string>();
    const targets = new Set<string>();
    const projectCounts = new Map<string, number>();
    let readError = false;
    const records = parsed.flatMap((item): BuilderServiceProposalComparisonDecisionRecord[] => {
      const record = parseBuilderServiceProposalComparisonDecision(item, comparisons);
      const targetKey = record ? `${record.target.comparisonId}:${record.target.comparisonRevisionId}` : "";
      const nextProjectCount = record ? (projectCounts.get(record.projectId) ?? 0) + 1 : 0;
      if (!record || ids.has(record.id) || targets.has(targetKey) || nextProjectCount > 100) {
        readError = true;
        return [];
      }
      ids.add(record.id);
      targets.add(targetKey);
      projectCounts.set(record.projectId, nextProjectCount);
      return [record];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
}

function parseBuilderNegotiationDraft(
  value: any,
  productComparisons: LocalRecordsReadResult<BuilderProposalComparisonRecord>,
  serviceComparisons: LocalRecordsReadResult<BuilderServiceProposalComparisonRecord>,
): BuilderNegotiationDraftRecord | null {
  if (productComparisons.readError || serviceComparisons.readError) return null;
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const projectId = typeof value?.projectId === "string" ? value.projectId.trim() : "";
  const supplierSnapshot = {
    supplierContactId: typeof value?.target?.supplierSnapshot?.supplierContactId === "string" ? value.target.supplierSnapshot.supplierContactId.trim() : "",
    supplierContactVersion: value?.target?.supplierSnapshot?.supplierContactVersion,
    displayName: typeof value?.target?.supplierSnapshot?.displayName === "string" ? value.target.supplierSnapshot.displayName.trim() : "",
    category: typeof value?.target?.supplierSnapshot?.category === "string" ? value.target.supplierSnapshot.category.trim() : "",
    tehranCoverage: typeof value?.target?.supplierSnapshot?.tehranCoverage === "string" ? value.target.supplierSnapshot.tehranCoverage.trim() : "",
    responseCapability: value?.target?.supplierSnapshot?.responseCapability,
    networkStatus: value?.target?.supplierSnapshot?.networkStatus,
  } as BuilderRecordedProposalSupplierSnapshot;
  const target = {
    comparisonKind: value?.target?.comparisonKind,
    comparisonId: typeof value?.target?.comparisonId === "string" ? value.target.comparisonId.trim() : "",
    comparisonVersion: value?.target?.comparisonVersion,
    comparisonRevisionId: typeof value?.target?.comparisonRevisionId === "string" ? value.target.comparisonRevisionId.trim() : "",
    comparisonRevisionFingerprint: typeof value?.target?.comparisonRevisionFingerprint === "string" ? value.target.comparisonRevisionFingerprint.trim() : "",
    requestId: typeof value?.target?.requestId === "string" ? value.target.requestId.trim() : "",
    requestVersion: value?.target?.requestVersion,
    reviewRevisionId: typeof value?.target?.reviewRevisionId === "string" ? value.target.reviewRevisionId.trim() : "",
    reviewRevisionFingerprint: typeof value?.target?.reviewRevisionFingerprint === "string" ? value.target.reviewRevisionFingerprint.trim() : "",
    proposalId: typeof value?.target?.proposalId === "string" ? value.target.proposalId.trim() : "",
    proposalVersion: value?.target?.proposalVersion,
    proposalRevisionId: typeof value?.target?.proposalRevisionId === "string" ? value.target.proposalRevisionId.trim() : "",
    proposalRevisionFingerprint: typeof value?.target?.proposalRevisionFingerprint === "string" ? value.target.proposalRevisionFingerprint.trim() : "",
    proposalLineId: typeof value?.target?.proposalLineId === "string" ? value.target.proposalLineId.trim() : "",
    criterionKind: value?.target?.criterionKind,
    criterionId: typeof value?.target?.criterionId === "string" ? value.target.criterionId.trim() : "",
    criterionLabel: typeof value?.target?.criterionLabel === "string" ? value.target.criterionLabel.trim() : "",
    supplierSnapshot,
  } as BuilderNegotiationDraftTarget;
  const evidence = projectId ? builderNegotiationDraftTargetEvidence(projectId, target, productComparisons.records, serviceComparisons.records) : null;
  if (
    !hasExactObjectKeys(value?.target, ["comparisonKind", "comparisonId", "comparisonVersion", "comparisonRevisionId", "comparisonRevisionFingerprint", "requestId", "requestVersion", "reviewRevisionId", "reviewRevisionFingerprint", "proposalId", "proposalVersion", "proposalRevisionId", "proposalRevisionFingerprint", "proposalLineId", "criterionKind", "criterionId", "criterionLabel", "supplierSnapshot"])
    || !hasExactObjectKeys(value?.target?.supplierSnapshot, ["supplierContactId", "supplierContactVersion", "displayName", "category", "tehranCoverage", "responseCapability", "networkStatus"])
    || !["product", "service"].includes(target.comparisonKind)
    || !["product-line", "service-criterion"].includes(target.criterionKind)
    || !target.comparisonId
    || !Number.isInteger(target.comparisonVersion)
    || target.comparisonVersion < 1
    || !target.comparisonRevisionId
    || !target.comparisonRevisionFingerprint
    || !target.requestId
    || !Number.isInteger(target.requestVersion)
    || target.requestVersion < 1
    || !target.reviewRevisionId
    || !target.reviewRevisionFingerprint
    || !target.proposalId
    || !Number.isInteger(target.proposalVersion)
    || target.proposalVersion < 1
    || !target.proposalRevisionId
    || !target.proposalRevisionFingerprint
    || !target.proposalLineId
    || !target.criterionId
    || !hasVisibleProjectTaskText(target.criterionLabel)
    || target.criterionLabel.length > 160
    || !evidence
    || JSON.stringify(stablePurchaseRequestValue(value.target)) !== JSON.stringify(stablePurchaseRequestValue(evidence.target))
  ) return null;

  const eventIds = new Set<string>();
  const history: BuilderNegotiationDraftEvent[] = Array.isArray(value?.history) && value.history.length <= 100 ? value.history.flatMap((event: any, index: number): BuilderNegotiationDraftEvent[] => {
    const eventId = typeof event?.id === "string" ? event.id.trim() : "";
    const at = typeof event?.at === "string" ? event.at.trim() : "";
    const type = event?.type as BuilderNegotiationDraftEvent["type"];
    if (!hasExactObjectKeys(event, ["id", "type", "actor", "at", "version"]) || !eventId || eventId !== event?.id || at !== event?.at || eventIds.has(eventId) || (index === 0 ? type !== "created" : type !== "updated") || event?.actor !== "شما" || event?.version !== index + 1 || !isValidProjectFileDate(at)) return [];
    eventIds.add(eventId);
    return [{ id: eventId, type, actor: "شما", at, version: event.version }];
  }) : [];
  const revisionIds = new Set<string>();
  const revisions: BuilderNegotiationDraftRevision[] = Array.isArray(value?.revisions) && value.revisions.length <= 100 ? value.revisions.flatMap((revisionValue: any, index: number): BuilderNegotiationDraftRevision[] => {
    const revisionId = typeof revisionValue?.id === "string" ? revisionValue.id.trim() : "";
    const createdAt = typeof revisionValue?.createdAt === "string" ? revisionValue.createdAt.trim() : "";
    const purpose = typeof revisionValue?.purpose === "string" ? revisionValue.purpose.trim() : "";
    const message = typeof revisionValue?.message === "string" ? revisionValue.message.trim() : "";
    if (
      !hasExactObjectKeys(revisionValue, ["id", "version", "createdAt", "purpose", "message", "fingerprint"])
      || !revisionId
      || revisionId !== revisionValue?.id
      || createdAt !== revisionValue?.createdAt
      || revisionIds.has(revisionId)
      || revisionValue?.version !== index + 1
      || createdAt !== history[index]?.at
      || !hasVisibleProjectTaskText(purpose)
      || purpose.length > 300
      || purpose !== revisionValue?.purpose
      || !hasVisibleProjectTaskText(message)
      || message.length > 800
      || message !== revisionValue?.message
      || new Date(createdAt).getTime() < new Date(evidence.sourceCreatedAt).getTime()
    ) return [];
    const revisionBase = { id: revisionId, version: revisionValue.version, createdAt, purpose, message } satisfies Omit<BuilderNegotiationDraftRevision, "fingerprint">;
    const fingerprint = builderNegotiationDraftRevisionFingerprint(target, revisionBase);
    if (revisionValue?.fingerprint !== fingerprint) return [];
    revisionIds.add(revisionId);
    return [{ ...revisionBase, fingerprint }];
  }) : [];
  const version = value?.version;
  const createdAt = typeof value?.createdAt === "string" ? value.createdAt.trim() : "";
  const updatedAt = typeof value?.updatedAt === "string" ? value.updatedAt.trim() : "";
  const currentRevisionId = typeof value?.currentRevisionId === "string" ? value.currentRevisionId.trim() : "";
  const hasRepeatedSemanticRevision = revisions.some((revision, index) => index > 0 && revision.purpose === revisions[index - 1].purpose && revision.message === revisions[index - 1].message);
  if (
    !hasExactObjectKeys(value, ["schemaVersion", "id", "projectId", "purpose", "status", "target", "source", "visibility", "localStatus", "externalEffect", "networkUsed", "aiUsed", "sendAuthorized", "supplierNotified", "sharedWithSupplier", "externalActionAttempted", "currentRevisionId", "version", "createdAt", "updatedAt", "history", "revisions"])
    || value?.schemaVersion !== 1
    || !id
    || id !== value?.id
    || !projectId
    || projectId !== value?.projectId
    || value?.purpose !== "record-local-post-proposal-negotiation-question"
    || value?.status !== "draft"
    || value?.source !== "ثبت مستقیم سازنده"
    || value?.visibility !== "خصوصی پروژه"
    || value?.localStatus !== "پیش‌نویس محلی"
    || value?.externalEffect !== "none"
    || value?.networkUsed !== false
    || value?.aiUsed !== false
    || value?.sendAuthorized !== false
    || value?.supplierNotified !== false
    || value?.sharedWithSupplier !== false
    || value?.externalActionAttempted !== false
    || currentRevisionId !== value?.currentRevisionId
    || createdAt !== value?.createdAt
    || updatedAt !== value?.updatedAt
    || !Number.isInteger(version)
    || version < 1
    || history.length !== value?.history?.length
    || revisions.length !== value?.revisions?.length
    || history.length !== version
    || revisions.length !== version
    || currentRevisionId !== revisions[revisions.length - 1]?.id
    || createdAt !== history[0]?.at
    || updatedAt !== history[history.length - 1]?.at
    || revisions[0]?.createdAt !== createdAt
    || revisions[revisions.length - 1]?.createdAt !== updatedAt
    || history.some((event, index) => index > 0 && new Date(event.at).getTime() < new Date(history[index - 1].at).getTime())
    || hasRepeatedSemanticRevision
  ) return null;
  return {
    schemaVersion: 1,
    id,
    projectId,
    purpose: "record-local-post-proposal-negotiation-question",
    status: "draft",
    target: structuredClone(target),
    source: "ثبت مستقیم سازنده",
    visibility: "خصوصی پروژه",
    localStatus: "پیش‌نویس محلی",
    externalEffect: "none",
    networkUsed: false,
    aiUsed: false,
    sendAuthorized: false,
    supplierNotified: false,
    sharedWithSupplier: false,
    externalActionAttempted: false,
    currentRevisionId,
    version,
    createdAt,
    updatedAt,
    history,
    revisions,
  };
}

function readStoredBuilderNegotiationDrafts(
  productComparisons: LocalRecordsReadResult<BuilderProposalComparisonRecord>,
  serviceComparisons: LocalRecordsReadResult<BuilderServiceProposalComparisonRecord>,
): LocalRecordsReadResult<BuilderNegotiationDraftRecord> {
  if (productComparisons.readError || serviceComparisons.readError) return { records: [], readError: true };
  try {
    const raw = window.localStorage.getItem(projectBuilderNegotiationDraftsStorageKey);
    if (raw === null) return { records: [], readError: false };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 1000) return { records: [], readError: true };
    const ids = new Set<string>();
    const targets = new Set<string>();
    const projectCounts = new Map<string, number>();
    let readError = false;
    const records = parsed.flatMap((item): BuilderNegotiationDraftRecord[] => {
      const record = parseBuilderNegotiationDraft(item, productComparisons, serviceComparisons);
      const targetKey = record ? `${record.projectId}:${builderNegotiationDraftTargetKey(record.target)}` : "";
      const nextProjectCount = record ? (projectCounts.get(record.projectId) ?? 0) + 1 : 0;
      if (!record || ids.has(record.id) || targets.has(targetKey) || nextProjectCount > 100) {
        readError = true;
        return [];
      }
      ids.add(record.id);
      targets.add(targetKey);
      projectCounts.set(record.projectId, nextProjectCount);
      return [record];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
}

function parseBuilderManualNegotiationResponse(
  value: any,
  negotiationDrafts: LocalRecordsReadResult<BuilderNegotiationDraftRecord>,
): BuilderManualNegotiationResponseRecord | null {
  if (negotiationDrafts.readError) return null;
  if (
    !hasExactObjectKeys(value?.target, ["negotiationDraftId", "negotiationDraftRevisionId", "negotiationDraftRevisionVersion", "negotiationDraftRevisionFingerprint"])
    || !hasExactObjectKeys(value?.questionSnapshot, ["purpose", "message", "createdAt", "negotiationTarget"])
    || !hasExactObjectKeys(value?.questionSnapshot?.negotiationTarget, ["comparisonKind", "comparisonId", "comparisonVersion", "comparisonRevisionId", "comparisonRevisionFingerprint", "requestId", "requestVersion", "reviewRevisionId", "reviewRevisionFingerprint", "proposalId", "proposalVersion", "proposalRevisionId", "proposalRevisionFingerprint", "proposalLineId", "criterionKind", "criterionId", "criterionLabel", "supplierSnapshot"])
    || !hasExactObjectKeys(value?.questionSnapshot?.negotiationTarget?.supplierSnapshot, ["supplierContactId", "supplierContactVersion", "displayName", "category", "tehranCoverage", "responseCapability", "networkStatus"])
  ) return null;
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const projectId = typeof value?.projectId === "string" ? value.projectId.trim() : "";
  const target = {
    negotiationDraftId: typeof value?.target?.negotiationDraftId === "string" ? value.target.negotiationDraftId.trim() : "",
    negotiationDraftRevisionId: typeof value?.target?.negotiationDraftRevisionId === "string" ? value.target.negotiationDraftRevisionId.trim() : "",
    negotiationDraftRevisionVersion: value?.target?.negotiationDraftRevisionVersion,
    negotiationDraftRevisionFingerprint: typeof value?.target?.negotiationDraftRevisionFingerprint === "string" ? value.target.negotiationDraftRevisionFingerprint.trim() : "",
  } satisfies BuilderManualNegotiationResponseTarget;
  const questionPurpose = typeof value?.questionSnapshot?.purpose === "string" ? value.questionSnapshot.purpose.trim() : "";
  const questionMessage = typeof value?.questionSnapshot?.message === "string" ? value.questionSnapshot.message.trim() : "";
  const questionCreatedAt = typeof value?.questionSnapshot?.createdAt === "string" ? value.questionSnapshot.createdAt.trim() : "";
  const questionSnapshot = {
    purpose: questionPurpose,
    message: questionMessage,
    createdAt: questionCreatedAt,
    negotiationTarget: structuredClone(value.questionSnapshot.negotiationTarget) as BuilderNegotiationDraftTarget,
  } satisfies BuilderManualNegotiationResponseQuestionSnapshot;
  const evidence = projectId ? builderManualNegotiationResponseQuestionEvidence(projectId, target, questionSnapshot, negotiationDrafts.records) : null;
  if (
    !id
    || id !== value?.id
    || !projectId
    || projectId !== value?.projectId
    || !target.negotiationDraftId
    || target.negotiationDraftId !== value?.target?.negotiationDraftId
    || !target.negotiationDraftRevisionId
    || target.negotiationDraftRevisionId !== value?.target?.negotiationDraftRevisionId
    || !Number.isInteger(target.negotiationDraftRevisionVersion)
    || target.negotiationDraftRevisionVersion < 1
    || !target.negotiationDraftRevisionFingerprint
    || target.negotiationDraftRevisionFingerprint !== value?.target?.negotiationDraftRevisionFingerprint
    || !hasVisibleProjectTaskText(questionPurpose)
    || questionPurpose.length > 300
    || questionPurpose !== value?.questionSnapshot?.purpose
    || !hasVisibleProjectTaskText(questionMessage)
    || questionMessage.length > 800
    || questionMessage !== value?.questionSnapshot?.message
    || !isValidProjectFileDate(questionCreatedAt)
    || questionCreatedAt !== value?.questionSnapshot?.createdAt
    || !evidence
  ) return null;

  const eventIds = new Set<string>();
  const history: BuilderManualNegotiationResponseEvent[] = Array.isArray(value?.history) && value.history.length <= 100 ? value.history.flatMap((event: any, index: number): BuilderManualNegotiationResponseEvent[] => {
    const eventId = typeof event?.id === "string" ? event.id.trim() : "";
    const at = typeof event?.at === "string" ? event.at.trim() : "";
    const type = event?.type as BuilderManualNegotiationResponseEvent["type"];
    if (!hasExactObjectKeys(event, ["id", "type", "actor", "at", "version"]) || !eventId || eventId !== event?.id || at !== event?.at || eventIds.has(eventId) || (index === 0 ? type !== "created" : type !== "updated") || event?.actor !== "شما" || event?.version !== index + 1 || !isValidProjectFileDate(at)) return [];
    eventIds.add(eventId);
    return [{ id: eventId, type, actor: "شما", at, version: event.version }];
  }) : [];
  const revisionIds = new Set<string>();
  const revisions: BuilderManualNegotiationResponseRevision[] = Array.isArray(value?.revisions) && value.revisions.length <= 100 ? value.revisions.flatMap((revisionValue: any, index: number): BuilderManualNegotiationResponseRevision[] => {
    const revisionId = typeof revisionValue?.id === "string" ? revisionValue.id.trim() : "";
    const createdAt = typeof revisionValue?.createdAt === "string" ? revisionValue.createdAt.trim() : "";
    const responseText = typeof revisionValue?.responseText === "string" ? revisionValue.responseText.trim() : "";
    if (
      !hasExactObjectKeys(revisionValue, ["id", "version", "createdAt", "responseText", "fingerprint"])
      || !revisionId
      || revisionId !== revisionValue?.id
      || createdAt !== revisionValue?.createdAt
      || revisionIds.has(revisionId)
      || revisionValue?.version !== index + 1
      || createdAt !== history[index]?.at
      || !hasVisibleProjectTaskText(responseText)
      || responseText.length > 2000
      || responseText !== revisionValue?.responseText
      || new Date(createdAt).getTime() < new Date(questionCreatedAt).getTime()
    ) return [];
    const revisionBase = { id: revisionId, version: revisionValue.version, createdAt, responseText } satisfies Omit<BuilderManualNegotiationResponseRevision, "fingerprint">;
    const fingerprint = builderManualNegotiationResponseRevisionFingerprint(target, questionSnapshot, revisionBase);
    if (revisionValue?.fingerprint !== fingerprint) return [];
    revisionIds.add(revisionId);
    return [{ ...revisionBase, fingerprint }];
  }) : [];
  const version = value?.version;
  const createdAt = typeof value?.createdAt === "string" ? value.createdAt.trim() : "";
  const updatedAt = typeof value?.updatedAt === "string" ? value.updatedAt.trim() : "";
  const currentRevisionId = typeof value?.currentRevisionId === "string" ? value.currentRevisionId.trim() : "";
  const hasRepeatedSemanticRevision = revisions.some((revision, index) => index > 0 && revision.responseText === revisions[index - 1].responseText);
  if (
    !hasExactObjectKeys(value, ["schemaVersion", "id", "projectId", "purpose", "status", "target", "questionSnapshot", "source", "networkStatus", "supplierAuthenticated", "authenticityVerified", "questionSentThroughChida", "receivedThroughChida", "visibility", "localStatus", "externalEffect", "networkUsed", "aiUsed", "sendAuthorized", "supplierNotified", "sharedWithSupplier", "externalActionAttempted", "currentRevisionId", "version", "createdAt", "updatedAt", "history", "revisions"])
    || value?.schemaVersion !== 1
    || value?.purpose !== "record-local-builder-transcribed-negotiation-response"
    || value?.status !== "local-transcription"
    || value?.source !== "ثبت دستی سازنده"
    || value?.networkStatus !== "خارج از شبکه چیدا"
    || value?.supplierAuthenticated !== false
    || value?.authenticityVerified !== false
    || value?.questionSentThroughChida !== false
    || value?.receivedThroughChida !== false
    || value?.visibility !== "خصوصی پروژه"
    || value?.localStatus !== "ثبت محلی"
    || value?.externalEffect !== "none"
    || value?.networkUsed !== false
    || value?.aiUsed !== false
    || value?.sendAuthorized !== false
    || value?.supplierNotified !== false
    || value?.sharedWithSupplier !== false
    || value?.externalActionAttempted !== false
    || currentRevisionId !== value?.currentRevisionId
    || createdAt !== value?.createdAt
    || updatedAt !== value?.updatedAt
    || !Number.isInteger(version)
    || version < 1
    || history.length !== value?.history?.length
    || revisions.length !== value?.revisions?.length
    || history.length !== version
    || revisions.length !== version
    || currentRevisionId !== revisions[revisions.length - 1]?.id
    || createdAt !== history[0]?.at
    || updatedAt !== history[history.length - 1]?.at
    || revisions[0]?.createdAt !== createdAt
    || revisions[revisions.length - 1]?.createdAt !== updatedAt
    || history.some((event, index) => index > 0 && new Date(event.at).getTime() < new Date(history[index - 1].at).getTime())
    || hasRepeatedSemanticRevision
  ) return null;
  return {
    schemaVersion: 1,
    id,
    projectId,
    purpose: "record-local-builder-transcribed-negotiation-response",
    status: "local-transcription",
    target,
    questionSnapshot,
    source: "ثبت دستی سازنده",
    networkStatus: "خارج از شبکه چیدا",
    supplierAuthenticated: false,
    authenticityVerified: false,
    questionSentThroughChida: false,
    receivedThroughChida: false,
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    externalEffect: "none",
    networkUsed: false,
    aiUsed: false,
    sendAuthorized: false,
    supplierNotified: false,
    sharedWithSupplier: false,
    externalActionAttempted: false,
    currentRevisionId,
    version,
    createdAt,
    updatedAt,
    history,
    revisions,
  };
}

function readStoredBuilderManualNegotiationResponses(
  negotiationDrafts: LocalRecordsReadResult<BuilderNegotiationDraftRecord>,
): LocalRecordsReadResult<BuilderManualNegotiationResponseRecord> {
  if (negotiationDrafts.readError) return { records: [], readError: true };
  try {
    const raw = window.localStorage.getItem(projectBuilderManualNegotiationResponsesStorageKey);
    if (raw === null) return { records: [], readError: false };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 1000) return { records: [], readError: true };
    const ids = new Set<string>();
    const targets = new Set<string>();
    const projectCounts = new Map<string, number>();
    let readError = false;
    const records = parsed.flatMap((item): BuilderManualNegotiationResponseRecord[] => {
      const record = parseBuilderManualNegotiationResponse(item, negotiationDrafts);
      const targetKey = record ? `${record.projectId}:${builderManualNegotiationResponseTargetKey(record.target)}` : "";
      const nextProjectCount = record ? (projectCounts.get(record.projectId) ?? 0) + 1 : 0;
      if (!record || ids.has(record.id) || targets.has(targetKey) || nextProjectCount > 100) {
        readError = true;
        return [];
      }
      ids.add(record.id);
      targets.add(targetKey);
      projectCounts.set(record.projectId, nextProjectCount);
      return [record];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
}

function parseBuilderManualNegotiationResponseReview(
  value: any,
  manualResponses: LocalRecordsReadResult<BuilderManualNegotiationResponseRecord>,
): BuilderManualNegotiationResponseReviewRecord | null {
  if (
    manualResponses.readError
    || !hasExactObjectKeys(value?.target, ["manualNegotiationResponseId", "manualNegotiationResponseRevisionId", "manualNegotiationResponseRevisionVersion", "manualNegotiationResponseRevisionFingerprint"])
  ) return null;
  const id = typeof value?.id === "string" ? value.id.trim() : "";
  const projectId = typeof value?.projectId === "string" ? value.projectId.trim() : "";
  const target = {
    manualNegotiationResponseId: typeof value?.target?.manualNegotiationResponseId === "string" ? value.target.manualNegotiationResponseId.trim() : "",
    manualNegotiationResponseRevisionId: typeof value?.target?.manualNegotiationResponseRevisionId === "string" ? value.target.manualNegotiationResponseRevisionId.trim() : "",
    manualNegotiationResponseRevisionVersion: value?.target?.manualNegotiationResponseRevisionVersion,
    manualNegotiationResponseRevisionFingerprint: typeof value?.target?.manualNegotiationResponseRevisionFingerprint === "string" ? value.target.manualNegotiationResponseRevisionFingerprint.trim() : "",
  } satisfies BuilderManualNegotiationResponseReviewTarget;
  const evidence = projectId ? builderManualNegotiationResponseReviewEvidence(projectId, target, manualResponses.records) : null;
  if (
    !id
    || id !== value?.id
    || !projectId
    || projectId !== value?.projectId
    || !target.manualNegotiationResponseId
    || target.manualNegotiationResponseId !== value?.target?.manualNegotiationResponseId
    || !target.manualNegotiationResponseRevisionId
    || target.manualNegotiationResponseRevisionId !== value?.target?.manualNegotiationResponseRevisionId
    || !Number.isInteger(target.manualNegotiationResponseRevisionVersion)
    || target.manualNegotiationResponseRevisionVersion < 1
    || !target.manualNegotiationResponseRevisionFingerprint
    || target.manualNegotiationResponseRevisionFingerprint !== value?.target?.manualNegotiationResponseRevisionFingerprint
    || !evidence
  ) return null;

  const eventIds = new Set<string>();
  const history: BuilderManualNegotiationResponseReviewEvent[] = Array.isArray(value?.history) && value.history.length <= 100 ? value.history.flatMap((event: any, index: number): BuilderManualNegotiationResponseReviewEvent[] => {
    const eventId = typeof event?.id === "string" ? event.id.trim() : "";
    const at = typeof event?.at === "string" ? event.at.trim() : "";
    const type = event?.type as BuilderManualNegotiationResponseReviewEvent["type"];
    if (!hasExactObjectKeys(event, ["id", "type", "actor", "at", "version"]) || !eventId || eventId !== event?.id || !at || at !== event?.at || eventIds.has(eventId) || (index === 0 ? type !== "created" : type !== "updated") || event?.actor !== "شما" || event?.version !== index + 1 || !isValidProjectFileDate(at)) return [];
    eventIds.add(eventId);
    return [{ id: eventId, type, actor: "شما", at, version: event.version }];
  }) : [];
  const revisionIds = new Set<string>();
  const allowedOutcomes: BuilderManualNegotiationResponseReviewOutcome[] = ["appears-addressed", "needs-clarification", "potential-conflict"];
  const revisions: BuilderManualNegotiationResponseReviewRevision[] = Array.isArray(value?.revisions) && value.revisions.length <= 100 ? value.revisions.flatMap((revisionValue: any, index: number): BuilderManualNegotiationResponseReviewRevision[] => {
    const revisionId = typeof revisionValue?.id === "string" ? revisionValue.id.trim() : "";
    const createdAt = typeof revisionValue?.createdAt === "string" ? revisionValue.createdAt.trim() : "";
    const outcome = revisionValue?.outcome as BuilderManualNegotiationResponseReviewOutcome;
    const reason = typeof revisionValue?.reason === "string" ? revisionValue.reason.trim() : "";
    if (
      !hasExactObjectKeys(revisionValue, ["id", "version", "createdAt", "outcome", "reason", "fingerprint"])
      || !revisionId
      || revisionId !== revisionValue?.id
      || !createdAt
      || createdAt !== revisionValue?.createdAt
      || revisionIds.has(revisionId)
      || revisionValue?.version !== index + 1
      || createdAt !== history[index]?.at
      || !allowedOutcomes.includes(outcome)
      || !hasVisibleProjectTaskText(reason)
      || reason.length > 1200
      || reason !== revisionValue?.reason
      || new Date(createdAt).getTime() < new Date(evidence.revision.createdAt).getTime()
    ) return [];
    const revisionBase = { id: revisionId, version: revisionValue.version, createdAt, outcome, reason } satisfies Omit<BuilderManualNegotiationResponseReviewRevision, "fingerprint">;
    const fingerprint = builderManualNegotiationResponseReviewRevisionFingerprint(projectId, target, revisionBase);
    if (revisionValue?.fingerprint !== fingerprint) return [];
    revisionIds.add(revisionId);
    return [{ ...revisionBase, fingerprint }];
  }) : [];
  const version = value?.version;
  const createdAt = typeof value?.createdAt === "string" ? value.createdAt.trim() : "";
  const updatedAt = typeof value?.updatedAt === "string" ? value.updatedAt.trim() : "";
  const currentRevisionId = typeof value?.currentRevisionId === "string" ? value.currentRevisionId.trim() : "";
  const hasRepeatedSemanticRevision = revisions.some((revision, index) => index > 0 && revision.outcome === revisions[index - 1].outcome && revision.reason === revisions[index - 1].reason);
  if (
    !hasExactObjectKeys(value, ["schemaVersion", "id", "projectId", "purpose", "status", "target", "source", "reviewMethod", "visibility", "localStatus", "automatedDetectionUsed", "aiUsed", "networkUsed", "authenticityVerified", "externalEffect", "sendAuthorized", "supplierNotified", "sharedWithSupplier", "externalActionAttempted", "currentRevisionId", "version", "createdAt", "updatedAt", "history", "revisions"])
    || value?.schemaVersion !== 1
    || value?.purpose !== "record-local-builder-manual-response-review"
    || value?.status !== "manual-review"
    || value?.source !== "بازبینی مستقیم سازنده"
    || value?.reviewMethod !== "manual"
    || value?.visibility !== "خصوصی پروژه"
    || value?.localStatus !== "ثبت محلی"
    || value?.automatedDetectionUsed !== false
    || value?.aiUsed !== false
    || value?.networkUsed !== false
    || value?.authenticityVerified !== false
    || value?.externalEffect !== "none"
    || value?.sendAuthorized !== false
    || value?.supplierNotified !== false
    || value?.sharedWithSupplier !== false
    || value?.externalActionAttempted !== false
    || currentRevisionId !== value?.currentRevisionId
    || createdAt !== value?.createdAt
    || updatedAt !== value?.updatedAt
    || !Number.isInteger(version)
    || version < 1
    || history.length !== value?.history?.length
    || revisions.length !== value?.revisions?.length
    || history.length !== version
    || revisions.length !== version
    || currentRevisionId !== revisions[revisions.length - 1]?.id
    || createdAt !== history[0]?.at
    || updatedAt !== history[history.length - 1]?.at
    || revisions[0]?.createdAt !== createdAt
    || revisions[revisions.length - 1]?.createdAt !== updatedAt
    || history.some((event, index) => index > 0 && new Date(event.at).getTime() < new Date(history[index - 1].at).getTime())
    || hasRepeatedSemanticRevision
  ) return null;
  return {
    schemaVersion: 1,
    id,
    projectId,
    purpose: "record-local-builder-manual-response-review",
    status: "manual-review",
    target,
    source: "بازبینی مستقیم سازنده",
    reviewMethod: "manual",
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    automatedDetectionUsed: false,
    aiUsed: false,
    networkUsed: false,
    authenticityVerified: false,
    externalEffect: "none",
    sendAuthorized: false,
    supplierNotified: false,
    sharedWithSupplier: false,
    externalActionAttempted: false,
    currentRevisionId,
    version,
    createdAt,
    updatedAt,
    history,
    revisions,
  };
}

function readStoredBuilderManualNegotiationResponseReviews(
  manualResponses: LocalRecordsReadResult<BuilderManualNegotiationResponseRecord>,
): LocalRecordsReadResult<BuilderManualNegotiationResponseReviewRecord> {
  if (manualResponses.readError) return { records: [], readError: true };
  try {
    const raw = window.localStorage.getItem(projectBuilderManualNegotiationResponseReviewsStorageKey);
    if (raw === null) return { records: [], readError: false };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 1000) return { records: [], readError: true };
    const ids = new Set<string>();
    const targets = new Set<string>();
    const projectCounts = new Map<string, number>();
    let readError = false;
    const records = parsed.flatMap((item): BuilderManualNegotiationResponseReviewRecord[] => {
      const record = parseBuilderManualNegotiationResponseReview(item, manualResponses);
      const targetKey = record ? `${record.projectId}:${builderManualNegotiationResponseReviewTargetKey(record.target)}` : "";
      const nextProjectCount = record ? (projectCounts.get(record.projectId) ?? 0) + 1 : 0;
      if (!record || ids.has(record.id) || targets.has(targetKey) || nextProjectCount > 100) {
        readError = true;
        return [];
      }
      ids.add(record.id);
      targets.add(targetKey);
      projectCounts.set(record.projectId, nextProjectCount);
      return [record];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
}

function inferProjectFileCategory(file: File): ProjectFileCategory {
  const normalizedName = file.name.replace(/[\s‌_-]+/g, " ").toLocaleLowerCase("fa");
  if (normalizedName.includes("پیش فاکتور") || normalizedName.includes("پیش‌فاکتور")) return "پیش‌فاکتور";
  if (normalizedName.includes("فاکتور")) return "فاکتور";
  if (normalizedName.includes("قرارداد")) return "قرارداد";
  if (normalizedName.includes("صورت جلسه") || normalizedName.includes("صورت‌جلسه")) return "صورت‌جلسه";
  if (normalizedName.includes("نقشه")) return "نقشه";
  if (file.type.startsWith("image/") || /\.(?:png|jpe?g|webp|heic|heif)$/i.test(file.name)) return "عکس";
  if (/\.(?:xls|xlsx|csv)$/i.test(file.name)) return "صفحه‌گسترده";
  return "سایر";
}

function isSupportedProjectFileName(fileName: string) {
  return projectFileExtensionPattern.test(fileName);
}

function isSupportedProjectFile(file: File) {
  return isSupportedProjectFileName(file.name);
}

function projectImageExtension(fileName: string) {
  const match = fileName.toLocaleLowerCase("en").match(/\.(png|jpe?g|webp|heic|heif)$/);
  return match?.[1] ?? "";
}

function hasCompatibleProjectImageMime(fileName: string, mimeType: string) {
  const extension = projectImageExtension(fileName);
  const normalizedMime = mimeType.toLocaleLowerCase("en");
  if (!extension) return false;
  if (!normalizedMime || normalizedMime === "application/octet-stream") return true;
  if (extension === "png") return normalizedMime === "image/png";
  if (extension === "jpg" || extension === "jpeg") return normalizedMime === "image/jpeg" || normalizedMime === "image/jpg";
  if (extension === "webp") return normalizedMime === "image/webp";
  return normalizedMime === "image/heic" || normalizedMime === "image/heif" || normalizedMime === "image/jpeg";
}

function isProjectImage(file: Pick<ProjectFileRecord, "mimeType" | "originalName">) {
  return projectImageExtensionPattern.test(file.originalName) && hasCompatibleProjectImageMime(file.originalName, file.mimeType);
}

function isSupportedProjectImage(file: File) {
  return projectImageExtensionPattern.test(file.name) && hasCompatibleProjectImageMime(file.name, file.type);
}

function isBrowserPreviewableProjectImage(file: Pick<ProjectFileRecord, "mimeType" | "originalName">) {
  const extension = projectImageExtension(file.originalName);
  return (extension === "png" || extension === "jpg" || extension === "jpeg" || extension === "webp")
    && hasCompatibleProjectImageMime(file.originalName, file.mimeType);
}

function openProjectImagesDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(projectImagesDatabaseName, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(projectImagesStoreName)) database.createObjectStore(projectImagesStoreName, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Project image database could not be opened"));
    request.onblocked = () => reject(new Error("Project image database is blocked"));
  });
}

async function writeProjectImage(record: ProjectFileRecord, blob: Blob) {
  const database = await openProjectImagesDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(projectImagesStoreName, "readwrite");
      transaction.objectStore(projectImagesStoreName).put({ id: record.id, projectId: record.projectId, originalName: record.originalName, mimeType: record.mimeType, blob } satisfies StoredProjectImage);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Project image could not be stored"));
      transaction.onabort = () => reject(transaction.error ?? new Error("Project image storage was aborted"));
    });
  } finally {
    database.close();
  }
}

async function readProjectImage(file: ProjectFileRecord) {
  if (file.storageMode !== "browser-image") return null;
  const database = await openProjectImagesDatabase();
  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const transaction = database.transaction(projectImagesStoreName, "readonly");
      const request = transaction.objectStore(projectImagesStoreName).get(file.id);
      request.onsuccess = () => {
        const stored = request.result as StoredProjectImage | undefined;
        resolve(stored?.projectId === file.projectId && stored.blob instanceof Blob ? stored.blob : null);
      };
      request.onerror = () => reject(request.error ?? new Error("Project image could not be read"));
    });
  } finally {
    database.close();
  }
}

function isValidProjectFileDate(value: string) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

function formatProjectFileSize(size: number) {
  const formatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 });
  if (size < 1024) return `${formatter.format(size)} بایت`;
  if (size < 1024 * 1024) return `${formatter.format(size / 1024)} کیلوبایت`;
  return `${formatter.format(size / (1024 * 1024))} مگابایت`;
}

function formatProjectFileDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "تاریخ نامشخص";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function projectFileFormat(file: Pick<ProjectFileRecord, "originalName" | "mimeType">) {
  const extension = file.originalName.split(".").pop()?.toLocaleUpperCase("en-US");
  return extension && extension !== file.originalName.toLocaleUpperCase("en-US") ? extension : file.mimeType || "نوع نامشخص";
}

function normalizeProjectSearchText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[يىئ]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[أإٱآ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/[ةۀ]/g, "ه")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u200c\u200d\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fa-IR");
}

function matchesProjectSearch(query: string, fields: string[]) {
  const tokens = normalizeProjectSearchText(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return false;
  const searchableFields = fields.map((field) => {
    const normalized = normalizeProjectSearchText(field);
    return { normalized, compact: normalized.replace(/\s/g, "") };
  });
  return tokens.every((token) => searchableFields.some((field) => field.normalized.includes(token) || field.compact.includes(token)));
}

function readLocalStorageValue(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function normalizeProjectArea(value: string) {
  const trimmed = value.trim();
  if (trimmed === "تهران") return "";
  return trimmed.replace(/^تهران(?:\s*[،,:–—-]\s*|\s+)/, "").trim();
}

function isKnownProjectStage(value: string) {
  return projectStages.includes(value as (typeof projectStages)[number]);
}

function isProjectReady(project: BuilderProject) {
  return Boolean(project.name.trim() && normalizeProjectArea(project.location) && isKnownProjectStage(project.stage));
}

function validateProjectDraft(draft: ProjectSetupDraft): ProjectFieldErrors {
  const normalizedArea = normalizeProjectArea(draft.location);
  return {
    name: draft.name.trim() ? "" : "نام پروژه را وارد کن.",
    location: normalizedArea ? "" : draft.location.trim() === "تهران" ? "یک محله یا منطقهٔ تهران را وارد کن." : "محدودهٔ پروژه در تهران را وارد کن.",
    stage: isKnownProjectStage(draft.stage) ? "" : "مرحلهٔ ساخت را انتخاب کن.",
  };
}

function validateProjectProfileDraft(draft: ProjectProfileDraft): ProjectProfileFieldErrors {
  const baseErrors = validateProjectDraft(draft);
  const landArea = normalizeProjectNumber(draft.landArea, false);
  const builtArea = normalizeProjectNumber(draft.builtArea, false);
  const aboveGroundFloors = normalizeProjectNumber(draft.aboveGroundFloors, true);
  const basementFloors = normalizeProjectNumber(draft.basementFloors, true);
  const unitCount = normalizeProjectNumber(draft.unitCount, true);

  return {
    ...emptyProjectProfileErrors,
    ...baseErrors,
    landArea: landArea === null ? "مساحت زمین باید یک عدد صفر یا بیشتر باشد." : "",
    builtArea: builtArea === null ? "زیربنای کل باید یک عدد صفر یا بیشتر باشد." : "",
    aboveGroundFloors: aboveGroundFloors === null ? "تعداد طبقات روی زمین باید عدد صحیح صفر یا بیشتر باشد." : "",
    basementFloors: basementFloors === null ? "تعداد طبقات منفی باید عدد صحیح صفر یا بیشتر باشد." : "",
    unitCount: unitCount === null ? "تعداد واحدها باید عدد صحیح صفر یا بیشتر باشد." : "",
  };
}

function projectProfileDraft(project: BuilderProject): ProjectProfileDraft {
  return {
    name: project.name,
    location: normalizeProjectArea(project.location),
    stage: project.stage,
    usage: project.usage,
    landArea: project.landArea,
    builtArea: project.builtArea,
    aboveGroundFloors: project.aboveGroundFloors,
    basementFloors: project.basementFloors,
    unitCount: project.unitCount,
  };
}

function normalizeProjectProfile(draft: ProjectProfileDraft): ProjectProfileDraft {
  return {
    name: draft.name.trim(),
    location: normalizeProjectArea(draft.location),
    stage: draft.stage,
    usage: projectUsages.includes(draft.usage as (typeof projectUsages)[number]) ? draft.usage : "",
    landArea: normalizeProjectNumber(draft.landArea, false) ?? "",
    builtArea: normalizeProjectNumber(draft.builtArea, false) ?? "",
    aboveGroundFloors: normalizeProjectNumber(draft.aboveGroundFloors, true) ?? "",
    basementFloors: normalizeProjectNumber(draft.basementFloors, true) ?? "",
    unitCount: normalizeProjectNumber(draft.unitCount, true) ?? "",
  };
}

function formatProjectMetric(value: string, unit: string) {
  const normalized = normalizeProjectNumber(value, false);
  if (normalized === "" || normalized === null) return "ثبت نشده";
  const displayValue = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(Number(normalized));
  return `${displayValue} ${unit}`;
}

function projectMeta(project: BuilderProject) {
  if (!isProjectReady(project)) return "نیازمند تکمیل اطلاعات پروژه";
  return ["تهران", normalizeProjectArea(project.location), project.stage].join(" · ");
}

export default function Prototype() {
  const [screen, setScreen] = useState<Screen>("role");
  const [sheet, setSheet] = useState<SheetName>(null);
  const [invite, setInvite] = useState(defaultInvite);
  const [phone, setPhone] = useState(defaultPhone);
  const [otp, setOtp] = useState(defaultOtp);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<BuilderProject[]>(readStoredProjects);
  const [activeProjectId, setActiveProjectId] = useState(() => readLocalStorageValue(activeProjectStorageKey) ?? "");
  const [modelMode, setModelMode] = useState<ModelMode>("خودکار");
  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projects[0] ?? null,
    [activeProjectId, projects],
  );

  useEffect(() => {
    const html = document.documentElement;
    const previousLang = html.lang;
    const previousTheme = html.dataset.chidaTheme;
    html.lang = "fa";
    html.dataset.chidaTheme = "dark";
    return () => {
      html.lang = previousLang;
      if (previousTheme) html.dataset.chidaTheme = previousTheme;
      else delete html.dataset.chidaTheme;
    };
  }, []);

  useLayoutEffect(() => {
    const phoneScreen = document.querySelector<HTMLElement>("[data-phone-screen]");
    if (!phoneScreen) return;

    phoneScreen.scrollTo({ top: 0, left: 0 });
  }, [screen]);

  useEffect(() => {
    try {
      window.localStorage.setItem(projectsStorageKey, JSON.stringify(projects));
    } catch {
      // The prototype remains usable when browser storage is unavailable.
    }
  }, [projects]);

  useEffect(() => {
    if (!activeProject) return;
    if (activeProject.id !== activeProjectId) setActiveProjectId(activeProject.id);
    try {
      window.localStorage.setItem(activeProjectStorageKey, activeProject.id);
    } catch {
      // Keep the active in-memory project when browser storage is unavailable.
    }
  }, [activeProject, activeProjectId]);

  const goTo = (next: Screen) => {
    setError("");
    setScreen(next);
  };

  const selectProject = (projectId: string) => {
    const nextProject = projects.find((project) => project.id === projectId);
    setActiveProjectId(projectId);
    if (nextProject && !isProjectReady(nextProject)) goTo("success");
  };

  const saveProject = (draft: ProjectSetupDraft, existingProjectId?: string) => {
    const normalizedDraft = {
      name: draft.name.trim(),
      location: normalizeProjectArea(draft.location),
      stage: draft.stage,
    };
    const projectId = existingProjectId ?? `project-${Date.now()}`;
    setProjects((current) => {
      if (existingProjectId) {
        return current.map((project) => project.id === existingProjectId ? { ...project, ...normalizedDraft } : project);
      }
      return [...current, { ...emptyProjectProfile, ...normalizedDraft, id: projectId, createdAt: new Date().toISOString() }];
    });
    setActiveProjectId(projectId);
    try {
      window.localStorage.setItem(activeProjectStorageKey, projectId);
    } catch {
      // The selected project still remains active for the current session.
    }
    goTo("home");
  };

  const createAdditionalProject = (draft: ProjectSetupDraft) => {
    const normalizedDraft = {
      name: draft.name.trim(),
      location: normalizeProjectArea(draft.location),
      stage: draft.stage,
    };
    const projectId = `project-${window.crypto.randomUUID()}`;
    const nextProjects = [...projects, { ...emptyProjectProfile, ...normalizedDraft, id: projectId, createdAt: new Date().toISOString() }];
    let previousProjects: string | null = null;
    let previousActiveProject: string | null = null;

    try {
      previousProjects = window.localStorage.getItem(projectsStorageKey);
      previousActiveProject = window.localStorage.getItem(activeProjectStorageKey);
      // The project list is the source of truth and is committed last. If that
      // write fails, at worst a dangling active pointer remains and self-heals
      // from the unchanged list on the next read; no phantom project is stored.
      window.localStorage.setItem(activeProjectStorageKey, projectId);
      window.localStorage.setItem(projectsStorageKey, JSON.stringify(nextProjects));
    } catch {
      try {
        if (previousProjects === null) window.localStorage.removeItem(projectsStorageKey);
        else window.localStorage.setItem(projectsStorageKey, previousProjects);
      } catch {
        // Continue with the independent active-pointer rollback below.
      }
      try {
        if (previousActiveProject === null) window.localStorage.removeItem(activeProjectStorageKey);
        else window.localStorage.setItem(activeProjectStorageKey, previousActiveProject);
      } catch {
        // The unchanged project list remains authoritative and repairs a
        // dangling pointer on reload; no in-memory project is activated.
      }
      return false;
    }

    setProjects(nextProjects);
    setActiveProjectId(projectId);
    setScreen("home");
    return true;
  };

  const updateProject = (projectId: string, draft: ProjectProfileDraft) => {
    const normalizedDraft = normalizeProjectProfile(draft);
    setProjects((current) => current.map((project) => project.id === projectId ? { ...project, ...normalizedDraft } : project));
  };

  if (screen === "home" && activeProject && isProjectReady(activeProject)) {
    return (
      <BuilderHome
        activeProject={activeProject}
        projects={projects}
        modelMode={modelMode}
        onProjectChange={selectProject}
        onProjectCreate={createAdditionalProject}
        onProjectUpdate={updateProject}
        onModelChange={setModelMode}
        onOpenSheet={setSheet}
        sheet={sheet}
      />
    );
  }

  const steps: Record<Screen, number> = {
    role: 1,
    invite: 2,
    phone: 3,
    otp: 4,
    success: 4,
    home: 4,
  };
  const backMap: Partial<Record<Screen, Screen>> = { invite: "role", phone: "invite", otp: "phone" };

  const validateInvite = () => {
    const normalized = invite.trim().toUpperCase();
    if (normalized.length < 7 || normalized === "CHD-0000") {
      setError("کد دعوت معتبر نیست. کد پیش‌فرض نمونه را امتحان کن.");
      return;
    }
    setInvite(normalized);
    goTo("phone");
  };

  const validatePhone = () => {
    const normalized = phone.replace(/\D/g, "");
    if (!/^09\d{9}$/.test(normalized)) {
      setError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم داشته باشد.");
      return;
    }
    setPhone(normalized);
    goTo("otp");
  };

  const validateOtp = () => {
    const normalized = otp.replace(/\D/g, "");
    if (!/^\d{6}$/.test(normalized) || normalized === "000000") {
      setError("کد واردشده درست نیست. برای نمونه ۱۲۳۴۵۶ را وارد کن.");
      return;
    }
    setOtp(normalized);
    goTo("success");
  };

  return (
    <>
      <MobileScroll className="chida-app auth-page">
        <main className="auth-shell" dir="rtl" data-theme="dark" data-testid="auth-flow">
          <AuthHeader
            canGoBack={Boolean(backMap[screen])}
            onBack={() => backMap[screen] && goTo(backMap[screen]!)}
          />
          <div className="auth-progress" aria-label={`مرحله ${steps[screen]} از ۴`}>
            {[1, 2, 3, 4].map((step) => <span key={step} data-active={step <= steps[screen]} />)}
          </div>

          {screen === "role" ? <RoleScreen onBuilder={() => goTo("invite")} onSupplier={() => setSheet("supplier")} /> : null}

          {screen === "invite" ? (
            <AuthForm
              eyebrow="ویژه سازندگان"
              title="کد دعوتت را وارد کن"
              description="ثبت‌نام سازندگان فعلاً فقط با دعوت چیدا انجام می‌شود."
              icon={<KeyRound size={22} strokeWidth={1.8} />}
              error={error}
              actionLabel="تأیید کد دعوت"
              actionTestId="invite-submit"
              onAction={validateInvite}
            >
              <label className="field-control" htmlFor="invite-code">
                <span>کد دعوت</span>
                <KeyboardInput
                  id="invite-code"
                  data-testid="invite-input"
                  value={invite}
                  onChange={(event) => { setInvite(event.target.value); setError(""); }}
                  dir="ltr"
                  autoCapitalize="characters"
                  maxLength={12}
                />
                <small>نمونه آماده: {defaultInvite}</small>
              </label>
            </AuthForm>
          ) : null}

          {screen === "phone" ? (
            <AuthForm
              eyebrow="تأیید هویت"
              title="شماره موبایلت را تأیید کن"
              description="کد یک‌بارمصرف به همین شماره فرستاده می‌شود."
              icon={<ShieldCheck size={22} strokeWidth={1.8} />}
              error={error}
              actionLabel="دریافت کد یک‌بارمصرف"
              actionTestId="phone-submit"
              onAction={validatePhone}
            >
              <label className="field-control" htmlFor="phone-number">
                <span>شماره موبایل</span>
                <KeyboardInput
                  id="phone-number"
                  data-testid="phone-input"
                  value={phone}
                  onChange={(event) => { setPhone(event.target.value); setError(""); }}
                  dir="ltr"
                  inputMode="numeric"
                  maxLength={11}
                />
                <small>شماره برای تست از قبل وارد شده است.</small>
              </label>
            </AuthForm>
          ) : null}

          {screen === "otp" ? (
            <AuthForm
              eyebrow="آخرین مرحله"
              title="کد تأیید را وارد کن"
              description={`کد شش‌رقمی ارسال‌شده به ${phone}`}
              icon={<ShieldCheck size={22} strokeWidth={1.8} />}
              error={error}
              actionLabel="ورود به چیدا"
              actionTestId="otp-submit"
              onAction={validateOtp}
            >
              <label className="field-control" htmlFor="otp-code">
                <span>کد یک‌بارمصرف</span>
                <KeyboardInput
                  id="otp-code"
                  className="otp-field"
                  data-testid="otp-input"
                  value={otp}
                  onChange={(event) => { setOtp(event.target.value); setError(""); }}
                  dir="ltr"
                  inputMode="numeric"
                  maxLength={6}
                />
                <small>کد نمونه: {defaultOtp}</small>
              </label>
            </AuthForm>
          ) : null}

          {screen === "success" ? (
            <SuccessScreen
              project={activeProject}
              onContinue={() => goTo("home")}
              onSave={saveProject}
            />
          ) : null}
        </main>
      </MobileScroll>

      <BottomSheet
        open={sheet === "supplier"}
        onOpenChange={(open) => setSheet(open ? "supplier" : null)}
        title="مسیر تأمین‌کننده به‌زودی"
        description="این انتخاب ثبت شد، اما در این نسخه فقط مسیر سازنده فعال است."
        snap={0.36}
      >
        <div className="sheet-message" dir="rtl" data-theme="dark" data-testid="supplier-unavailable-sheet">
          <div className="sheet-message-icon"><Store size={24} /></div>
          <p>نسخهٔ تأمین‌کننده در مرحلهٔ بعد با همین زبان طراحی ساخته می‌شود.</p>
          <button className="primary-button" type="button" onClick={() => setSheet(null)}>متوجه شدم</button>
        </div>
      </BottomSheet>
    </>
  );
}

function AuthHeader({ canGoBack, onBack }: { canGoBack: boolean; onBack: () => void }) {
  return (
    <header className="auth-header">
      <div className="brand-lockup" aria-label="چیدا">
        <span className="brand-mark"><HardHat size={20} strokeWidth={1.8} /></span><strong>چیدا</strong>
      </div>
      <div className="auth-header-actions">
        {canGoBack ? <button className="icon-button" type="button" onClick={onBack} aria-label="بازگشت"><ArrowRight size={20} /></button> : null}
      </div>
    </header>
  );
}

function RoleScreen({ onBuilder, onSupplier }: { onBuilder: () => void; onSupplier: () => void }) {
  return (
    <section className="auth-content role-content" data-testid="screen-role">
      <div className="auth-copy">
        <span className="eyebrow">شروع همکاری با چیدا</span>
        <h1>نقشت را انتخاب کن</h1>
        <p>چیدا دستیار هوشمند بازار ساخت‌وساز است؛ از کشف نیاز تا مقایسه و مذاکره، کنار پروژه می‌ماند.</p>
      </div>
      <div className="role-list" aria-label="انتخاب نقش">
        <button className="role-card" type="button" onClick={onBuilder} data-testid="role-builder">
          <span className="role-icon"><Building2 size={26} strokeWidth={1.65} /></span>
          <span className="role-copy"><strong>سازنده‌ام</strong><small>برای پروژه‌ام کالا، خدمات و تصمیم بهتر می‌خواهم.</small></span>
          <span className="role-status active">فعال</span>
        </button>
        <button className="role-card" type="button" onClick={onSupplier} data-testid="role-supplier" aria-label="تأمین‌کننده‌ام — این مسیر به‌زودی فعال می‌شود">
          <span className="role-icon"><Store size={26} strokeWidth={1.65} /></span>
          <span className="role-copy"><strong>تأمین‌کننده‌ام</strong><small>می‌خواهم محصولات و توانمندی کسب‌وکارم دیده شود.</small></span>
          <span className="role-status">به‌زودی</span>
        </button>
      </div>
      <div className="role-rule">
        <ShieldCheck size={18} />
        <span><strong>هر حساب فقط یک نقش دارد.</strong> بعد از ثبت‌نام امکان نقش دوم یا تغییر نقش وجود ندارد.</span>
      </div>
    </section>
  );
}

function AuthForm({ eyebrow, title, description, icon, error, actionLabel, actionTestId, onAction, children }: { eyebrow: string; title: string; description: string; icon: ReactNode; error: string; actionLabel: string; actionTestId: string; onAction: () => void; children: ReactNode }) {
  const keyboard = useKeyboard();
  return (
    <section className="auth-content auth-form-screen" data-testid={`screen-${actionTestId.replace("-submit", "")}`}>
      <div className="auth-copy">
        <span className="eyebrow">{eyebrow}</span>
        <div className="form-title-row"><span className="form-title-icon">{icon}</span><h1>{title}</h1></div>
        <p>{description}</p>
      </div>
      <div className="form-card">
        {children}
        <div className="validation-slot" aria-live="polite">{error ? <p className="error-message">{error}</p> : null}</div>
        <button className="primary-button" type="button" data-testid={actionTestId} onClick={() => { keyboard.hide(); onAction(); }}>{actionLabel}</button>
      </div>
      <p className="privacy-note"><ShieldCheck size={15} /> اطلاعات نمونه فقط در همین پروتوتایپ نگه داشته می‌شود.</p>
    </section>
  );
}

function ProjectChoiceMenu({ id, testId, value, placeholder, options, ariaLabel, invalid, describedBy, onChange }: { id: string; testId: string; value: string; placeholder: string; options: readonly string[]; ariaLabel: string; invalid?: boolean; describedBy?: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu.Root dir="rtl" open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          id={id}
          className="project-choice-trigger"
          type="button"
          data-testid={testId}
          data-placeholder={value ? "false" : "true"}
          aria-label={`${ariaLabel}: ${value || placeholder}`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onPointerDown={(event) => {
            if (event.pointerType !== "mouse" || event.button === 0) event.preventDefault();
          }}
          onPointerUp={(event) => {
            if (event.pointerType !== "mouse" || event.button === 0) setOpen((current) => !current);
          }}
          onClick={(event) => {
            if (event.detail === 0) setOpen((current) => !current);
          }}
        >
          <span>{value || placeholder}</span>
          <ChevronDown size={18} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="project-choice-content" sideOffset={6} align="start" collisionPadding={12} data-testid={`${testId}-menu`} data-scroll-drag="ignore">
          <DropdownMenu.RadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenu.RadioItem className="project-choice-item" value={option} key={option} data-testid={`${testId}-option-${option}`}>
                <span>{option}</span>
                <DropdownMenu.ItemIndicator><Check size={16} aria-hidden="true" /></DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function SuccessScreen({ project, onContinue, onSave }: { project: BuilderProject | null; onContinue: () => void; onSave: (draft: ProjectSetupDraft, existingProjectId?: string) => void }) {
  const keyboard = useKeyboard();
  const [name, setName] = useState(project?.name ?? "");
  const [location, setLocation] = useState(project ? normalizeProjectArea(project.location) : "");
  const [stage, setStage] = useState(project && isKnownProjectStage(project.stage) ? project.stage : "");
  const [fieldErrors, setFieldErrors] = useState<ProjectFieldErrors>({ name: "", location: "", stage: "" });

  const clearFieldError = (field: keyof ProjectSetupDraft) => {
    setFieldErrors((current) => current[field] ? { ...current, [field]: "" } : current);
  };

  const submit = () => {
    const normalizedArea = normalizeProjectArea(location);
    const nextErrors = validateProjectDraft({ name, location, stage });
    setFieldErrors(nextErrors);
    const firstInvalidId = nextErrors.name
      ? "project-name"
      : nextErrors.location
        ? "project-location"
        : nextErrors.stage
          ? "project-stage"
          : "";
    if (firstInvalidId) {
      window.requestAnimationFrame(() => document.getElementById(firstInvalidId)?.focus());
      return;
    }
    keyboard.hide();
    onSave({ name, location: normalizedArea, stage }, project?.id);
  };

  if (project && isProjectReady(project)) {
    return (
      <section className="auth-content success-screen saved-project-screen" data-testid="success-screen">
        <div className="success-icon"><Check size={34} strokeWidth={1.8} /></div>
        <span className="eyebrow">ورود موفق</span>
        <h1>خوش آمدی، سازنده</h1>
        <p>پروژه‌ات در همین مرورگر نگه‌داری شده و زمینهٔ فعال چیداست.</p>
        <div className="saved-project-summary" data-testid="saved-project-summary">
          <span><Building2 size={21} /></span>
          <div><strong>{project.name}</strong><small>{projectMeta(project)}</small></div>
          <CheckCircle2 size={18} />
        </div>
        <button className="primary-button" type="button" onClick={onContinue} data-testid="enter-home">ورود به پروژه</button>
      </section>
    );
  }

  return (
    <section className="auth-content success-screen project-setup-screen" data-testid="success-screen">
      <div className="project-setup-copy">
        <div className="success-icon"><Check size={28} strokeWidth={1.8} /></div>
        <span className="eyebrow">ورود موفق</span>
        <h1>{project ? "اطلاعات پروژه‌ات را کامل کن" : "اولین پروژه‌ات را بساز"}</h1>
        <p>برای ساخت فضای پروژه، نام، محدودهٔ تهران و مرحلهٔ ساخت را وارد کن.</p>
      </div>

      <form className="project-setup-form" data-testid="project-setup-form" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <label className="field-control" htmlFor="project-name">
          <span>نام پروژه</span>
          <KeyboardInput
            id="project-name"
            data-testid="project-name-input"
            value={name}
            onChange={(event) => { setName(event.target.value); clearFieldError("name"); }}
            placeholder="مثلاً برج نیلوفر"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "project-name-error" : undefined}
          />
          {fieldErrors.name ? <small className="field-error" id="project-name-error" data-testid="project-name-error">{fieldErrors.name}</small> : null}
        </label>

        <div className="project-city-lock" aria-label="شهر فعال: تهران">
          <span><small>شهر فعال</small><strong>تهران</strong></span>
          <ShieldCheck size={18} aria-hidden="true" />
        </div>

        <label className="field-control" htmlFor="project-location">
          <span>محدودهٔ پروژه</span>
          <KeyboardInput
            id="project-location"
            data-testid="project-location-input"
            value={location}
            onChange={(event) => { setLocation(event.target.value); clearFieldError("location"); }}
            placeholder="مثلاً سعادت‌آباد یا منطقهٔ ۲"
            aria-invalid={Boolean(fieldErrors.location)}
            aria-describedby={fieldErrors.location ? "project-location-error" : "project-location-note"}
          />
          {fieldErrors.location ? <small className="field-error" id="project-location-error" data-testid="project-location-error">{fieldErrors.location}</small> : null}
          <small id="project-location-note">فعلاً فقط پروژه‌های تهران فعال‌اند؛ آدرس دقیق لازم نیست.</small>
        </label>

        <div className="field-control">
          <span>مرحلهٔ ساخت</span>
          <ProjectChoiceMenu id="project-stage" testId="project-stage-select" value={stage} placeholder="مرحلهٔ ساخت را انتخاب کن" options={projectStages} ariaLabel="مرحلهٔ ساخت" invalid={Boolean(fieldErrors.stage)} describedBy={fieldErrors.stage ? "project-stage-error" : undefined} onChange={(nextStage) => { setStage(nextStage); clearFieldError("stage"); }} />
          {fieldErrors.stage ? <small className="field-error" id="project-stage-error" data-testid="project-stage-error">{fieldErrors.stage}</small> : null}
        </div>

        <button className="primary-button" type="submit" data-testid="project-create-button">ساخت پروژه و ورود</button>
        <p className="project-storage-note"><ShieldCheck size={15} /> این پروژه فعلاً فقط داخل همین مرورگر شبیه‌سازی و نگه‌داری می‌شود.</p>
      </form>
    </section>
  );
}

function BuilderHome({ activeProject, projects, modelMode, onProjectChange, onProjectCreate, onProjectUpdate, onModelChange, onOpenSheet, sheet }: { activeProject: BuilderProject; projects: BuilderProject[]; modelMode: ModelMode; onProjectChange: (projectId: string) => void; onProjectCreate: (draft: ProjectSetupDraft) => boolean; onProjectUpdate: (projectId: string, draft: ProjectProfileDraft) => void; onModelChange: (mode: ModelMode) => void; onOpenSheet: (sheet: SheetName) => void; sheet: SheetName }) {
  const keyboard = useKeyboard();
  const { bottomInset } = useKeyboardInsets();
  const projectWorkspaceScrollPositions = useRef(new Map<string, number>());
  const pendingPurchaseRequestsReturnFocus = useRef<PurchaseRequestsReturnView | null>(null);
  const pendingProposalsReturnFocus = useRef<ProposalsReturnView | null>(null);
  const [view, setView] = useState<HomeView>("chat");
  const [filesReturnView, setFilesReturnView] = useState<FilesReturnView>("project");
  const [memoryReturnView, setMemoryReturnView] = useState<MemoryReturnView>("project");
  const [purchaseRequestsReturnView, setPurchaseRequestsReturnView] = useState<PurchaseRequestsReturnView>("chat");
  const [proposalsReturnView, setProposalsReturnView] = useState<ProposalsReturnView>("chat");
  const [startPurchaseRequestEditor, setStartPurchaseRequestEditor] = useState(false);
  const [initialPurchaseRequestId, setInitialPurchaseRequestId] = useState<string | null>(null);
  const [projectTasksLaunch, setProjectTasksLaunch] = useState<ProjectTasksLaunch>({ filter: "active", approvalId: null, returnToPurchaseRequestId: null });
  const [focusedFileId, setFocusedFileId] = useState<string | null>(null);
  const [focusedMemoryId, setFocusedMemoryId] = useState<string | null>(null);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftsByProject, setDraftsByProject] = useState<Record<string, string>>({});
  const [messagesByProject, setMessagesByProject] = useState<Record<string, ChatMessage[]>>({});
  const [initialProjectFiles] = useState<LocalRecordsReadResult<ProjectFileRecord>>(readStoredProjectFiles);
  const [initialProjectMemories] = useState<LocalRecordsReadResult<ProjectMemoryRecord>>(readStoredProjectMemories);
  const [initialProjectTasks] = useState<LocalRecordsReadResult<ProjectTaskRecord>>(readStoredProjectTasks);
  const [initialProjectPurchaseRequests] = useState<LocalRecordsReadResult<ProjectPurchaseRequestRecord>>(readStoredProjectPurchaseRequests);
  const [initialProjectApprovals] = useState<LocalRecordsReadResult<ProjectApprovalRecord>>(() => readStoredProjectApprovals(initialProjectPurchaseRequests));
  const [initialProjectSupplierContacts] = useState<LocalRecordsReadResult<SupplierContactRecord>>(readStoredProjectSupplierContacts);
  const [initialProjectDispatchDrafts] = useState<LocalRecordsReadResult<DispatchDraftRecord>>(() => readStoredProjectDispatchDrafts(initialProjectPurchaseRequests, initialProjectApprovals, initialProjectSupplierContacts));
  const [initialProjectDispatchPlanApprovals] = useState<LocalRecordsReadResult<DispatchPlanApprovalRecord>>(() => readStoredProjectDispatchPlanApprovals(initialProjectDispatchDrafts, initialProjectPurchaseRequests, initialProjectApprovals, initialProjectSupplierContacts));
  const [initialBuilderRecordedProposals] = useState<LocalRecordsReadResult<BuilderRecordedProposalRecord>>(() => readStoredBuilderRecordedProposals(initialProjectPurchaseRequests, initialProjectApprovals, initialProjectSupplierContacts, initialProjectFiles));
  const [initialBuilderProposalComparisons] = useState<LocalRecordsReadResult<BuilderProposalComparisonRecord>>(() => readStoredBuilderProposalComparisons(initialBuilderRecordedProposals));
  const [initialBuilderProposalComparisonDecisions] = useState<LocalRecordsReadResult<BuilderProposalComparisonDecisionRecord>>(() => readStoredBuilderProposalComparisonDecisions(initialBuilderProposalComparisons));
  const [initialBuilderServiceProposalComparisons] = useState<LocalRecordsReadResult<BuilderServiceProposalComparisonRecord>>(() => readStoredBuilderServiceProposalComparisons(initialBuilderRecordedProposals, initialProjectPurchaseRequests));
  const [initialBuilderServiceProposalComparisonDecisions] = useState<LocalRecordsReadResult<BuilderServiceProposalComparisonDecisionRecord>>(() => readStoredBuilderServiceProposalComparisonDecisions(initialBuilderServiceProposalComparisons));
  const [initialBuilderNegotiationDrafts] = useState<LocalRecordsReadResult<BuilderNegotiationDraftRecord>>(() => readStoredBuilderNegotiationDrafts(initialBuilderProposalComparisons, initialBuilderServiceProposalComparisons));
  const [initialBuilderManualNegotiationResponses] = useState<LocalRecordsReadResult<BuilderManualNegotiationResponseRecord>>(() => readStoredBuilderManualNegotiationResponses(initialBuilderNegotiationDrafts));
  const [initialBuilderManualNegotiationResponseReviews] = useState<LocalRecordsReadResult<BuilderManualNegotiationResponseReviewRecord>>(() => readStoredBuilderManualNegotiationResponseReviews(initialBuilderManualNegotiationResponses));
  const [projectFiles, setProjectFiles] = useState<ProjectFileRecord[]>(initialProjectFiles.records);
  const [projectMemories, setProjectMemories] = useState<ProjectMemoryRecord[]>(initialProjectMemories.records);
  const [projectTasks, setProjectTasks] = useState<ProjectTaskRecord[]>(initialProjectTasks.records);
  const [projectPurchaseRequests, setProjectPurchaseRequests] = useState<ProjectPurchaseRequestRecord[]>(initialProjectPurchaseRequests.records);
  const [projectApprovals, setProjectApprovals] = useState<ProjectApprovalRecord[]>(initialProjectApprovals.records);
  const [projectSupplierContacts, setProjectSupplierContacts] = useState<SupplierContactRecord[]>(initialProjectSupplierContacts.records);
  const [projectDispatchDrafts, setProjectDispatchDrafts] = useState<DispatchDraftRecord[]>(initialProjectDispatchDrafts.records);
  const [projectDispatchPlanApprovals, setProjectDispatchPlanApprovals] = useState<DispatchPlanApprovalRecord[]>(initialProjectDispatchPlanApprovals.records);
  const [builderRecordedProposals, setBuilderRecordedProposals] = useState<BuilderRecordedProposalRecord[]>(initialBuilderRecordedProposals.records);
  const [builderProposalComparisons, setBuilderProposalComparisons] = useState<BuilderProposalComparisonRecord[]>(initialBuilderProposalComparisons.records);
  const [builderProposalComparisonDecisions, setBuilderProposalComparisonDecisions] = useState<BuilderProposalComparisonDecisionRecord[]>(initialBuilderProposalComparisonDecisions.records);
  const [builderServiceProposalComparisons, setBuilderServiceProposalComparisons] = useState<BuilderServiceProposalComparisonRecord[]>(initialBuilderServiceProposalComparisons.records);
  const [builderServiceProposalComparisonDecisions, setBuilderServiceProposalComparisonDecisions] = useState<BuilderServiceProposalComparisonDecisionRecord[]>(initialBuilderServiceProposalComparisonDecisions.records);
  const [builderNegotiationDrafts, setBuilderNegotiationDrafts] = useState<BuilderNegotiationDraftRecord[]>(initialBuilderNegotiationDrafts.records);
  const [builderManualNegotiationResponses, setBuilderManualNegotiationResponses] = useState<BuilderManualNegotiationResponseRecord[]>(initialBuilderManualNegotiationResponses.records);
  const [builderManualNegotiationResponseReviews, setBuilderManualNegotiationResponseReviews] = useState<BuilderManualNegotiationResponseReviewRecord[]>(initialBuilderManualNegotiationResponseReviews.records);
  const [projectFilesReadError] = useState(initialProjectFiles.readError);
  const [projectMemoriesReadError] = useState(initialProjectMemories.readError);
  const [projectTasksReadError] = useState(initialProjectTasks.readError);
  const [projectPurchaseRequestsReadError] = useState(initialProjectPurchaseRequests.readError);
  const [projectApprovalsReadError] = useState(initialProjectApprovals.readError);
  const [projectSupplierContactsReadError] = useState(initialProjectSupplierContacts.readError);
  const [projectDispatchDraftsReadError] = useState(initialProjectDispatchDrafts.readError);
  const [projectDispatchPlanApprovalsReadError] = useState(initialProjectDispatchPlanApprovals.readError);
  const [builderRecordedProposalsReadError] = useState(initialBuilderRecordedProposals.readError);
  const [builderProposalComparisonsReadError] = useState(initialBuilderProposalComparisons.readError);
  const [builderProposalComparisonDecisionsReadError] = useState(initialBuilderProposalComparisonDecisions.readError);
  const [builderServiceProposalComparisonsReadError] = useState(initialBuilderServiceProposalComparisons.readError);
  const [builderServiceProposalComparisonDecisionsReadError] = useState(initialBuilderServiceProposalComparisonDecisions.readError);
  const [builderNegotiationDraftsReadError] = useState(initialBuilderNegotiationDrafts.readError);
  const [builderManualNegotiationResponsesReadError] = useState(initialBuilderManualNegotiationResponses.readError);
  const [builderManualNegotiationResponseReviewsReadError] = useState(initialBuilderManualNegotiationResponseReviews.readError);
  const [installedTool, setInstalledTool] = useState(() => readLocalStorageValue(installedToolStorageKey) ?? "");
  const [briefSchedule, setBriefSchedule] = useState<BriefSchedule | null>(() => {
    try {
      const stored = window.localStorage.getItem(briefStorageKey);
      return stored ? JSON.parse(stored) as BriefSchedule : null;
    } catch {
      return null;
    }
  });
  const draft = draftsByProject[activeProject.id] ?? "";
  const messages = messagesByProject[activeProject.id] ?? [];
  const setDraft = (nextDraft: string) => {
    setDraftsByProject((current) => ({ ...current, [activeProject.id]: nextDraft }));
  };
  const updateMessages = (updater: (current: ChatMessage[]) => ChatMessage[]) => {
    setMessagesByProject((current) => ({ ...current, [activeProject.id]: updater(current[activeProject.id] ?? []) }));
  };

  const openNewProject = () => {
    keyboard.hide();
    setDrawerOpen(false);
    onOpenSheet("new-project");
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    setProjectSearchQuery("");
    setFocusedFileId(null);
    setFocusedMemoryId(null);
  }, [activeProject.id]);

  useEffect(() => {
    let disposed = false;
    const reconcileMissingImages = async () => {
      const candidates = projectFiles.filter((file) => file.storageMode === "browser-image");
      const missingIds = new Set((await Promise.all(candidates.map(async (file) => {
        try {
          return await readProjectImage(file) ? "" : file.id;
        } catch {
          return "";
        }
      }))).filter(Boolean));
      if (disposed || missingIds.size === 0) return;
      setProjectFiles((currentFiles) => {
        const reconciledFiles = currentFiles.filter((file) => !missingIds.has(file.id));
        try {
          if (reconciledFiles.length === 0) window.localStorage.removeItem(projectFilesStorageKey);
          else window.localStorage.setItem(projectFilesStorageKey, JSON.stringify(reconciledFiles));
        } catch {
          // Keep broken records hidden in this session and retry reconciliation on the next load.
        }
        return reconciledFiles;
      });
    };
    void reconcileMissingImages();
    return () => { disposed = true; };
  }, [projectFiles]);

  useLayoutEffect(() => {
    const returnView = pendingProposalsReturnFocus.current;
    if (!returnView || view !== returnView) return;
    pendingProposalsReturnFocus.current = null;
    const targetTestId = returnView === "chat" ? "quick-action-compare-offers" : "project-proposals-entry";
    document.querySelector<HTMLElement>(`[data-testid="${targetTestId}"]`)?.focus();
  }, [view]);

  useLayoutEffect(() => {
    const returnView = pendingPurchaseRequestsReturnFocus.current;
    if (!returnView || view !== returnView) return;
    pendingPurchaseRequestsReturnFocus.current = null;
    const targetTestId = returnView === "chat" ? "quick-action-purchase-request" : "project-purchase-requests-entry";
    document.querySelector<HTMLElement>(`[data-testid="${targetTestId}"]`)?.focus();
  }, [view]);

  const activeProjectMeta = projectMeta(activeProject);
  const activeProjectFiles = useMemo(
    () => projectFiles.filter((file) => file.projectId === activeProject.id),
    [activeProject.id, projectFiles],
  );
  const activeProjectImages = useMemo(
    () => activeProjectFiles.filter(isProjectImage),
    [activeProjectFiles],
  );
  const activeProjectMemories = useMemo(
    () => projectMemories.filter((memory) => memory.projectId === activeProject.id),
    [activeProject.id, projectMemories],
  );
  const activeProjectTasks = useMemo(
    () => projectTasks.filter((task) => task.projectId === activeProject.id),
    [activeProject.id, projectTasks],
  );
  const activeProjectPurchaseRequests = useMemo(
    () => projectPurchaseRequests.filter((request) => request.projectId === activeProject.id),
    [activeProject.id, projectPurchaseRequests],
  );
  const activeProjectApprovals = useMemo(
    () => projectApprovals.filter((approval) => approval.projectId === activeProject.id),
    [activeProject.id, projectApprovals],
  );
  const activeProjectSupplierContacts = useMemo(
    () => projectSupplierContacts.filter((contact) => contact.projectId === activeProject.id),
    [activeProject.id, projectSupplierContacts],
  );
  const activeProjectDispatchDrafts = useMemo(
    () => projectDispatchDrafts.filter((dispatchDraft) => dispatchDraft.projectId === activeProject.id),
    [activeProject.id, projectDispatchDrafts],
  );
  const activeProjectDispatchPlanApprovals = useMemo(
    () => projectDispatchPlanApprovals.filter((approval) => approval.projectId === activeProject.id),
    [activeProject.id, projectDispatchPlanApprovals],
  );
  const activeBuilderRecordedProposals = useMemo(
    () => builderRecordedProposals.filter((proposal) => proposal.projectId === activeProject.id),
    [activeProject.id, builderRecordedProposals],
  );
  const activeBuilderProposalComparisons = useMemo(
    () => builderProposalComparisons.filter((comparison) => comparison.projectId === activeProject.id),
    [activeProject.id, builderProposalComparisons],
  );
  const activeBuilderProposalComparisonDecisions = useMemo(
    () => builderProposalComparisonDecisions.filter((decision) => decision.projectId === activeProject.id),
    [activeProject.id, builderProposalComparisonDecisions],
  );
  const activeBuilderServiceProposalComparisons = useMemo(
    () => builderServiceProposalComparisons.filter((comparison) => comparison.projectId === activeProject.id),
    [activeProject.id, builderServiceProposalComparisons],
  );
  const activeBuilderServiceProposalComparisonDecisions = useMemo(
    () => builderServiceProposalComparisonDecisions.filter((decision) => decision.projectId === activeProject.id),
    [activeProject.id, builderServiceProposalComparisonDecisions],
  );
  const activeBuilderNegotiationDrafts = useMemo(
    () => builderNegotiationDrafts.filter((draft) => draft.projectId === activeProject.id),
    [activeProject.id, builderNegotiationDrafts],
  );
  const activeBuilderManualNegotiationResponses = useMemo(
    () => builderManualNegotiationResponses.filter((response) => response.projectId === activeProject.id),
    [activeProject.id, builderManualNegotiationResponses],
  );
  const activeBuilderManualNegotiationResponseReviews = useMemo(
    () => builderManualNegotiationResponseReviews.filter((review) => review.projectId === activeProject.id),
    [activeProject.id, builderManualNegotiationResponseReviews],
  );
  const activeProjectTaskCount = activeProjectTasks.filter((task) => task.status === "in-progress").length;
  const briefSummary = briefSchedule
    ? briefSchedule.frequency === "daily"
      ? `روزانه · ${briefSchedule.time}`
      : `هفتگی · ${briefSchedule.weekday} · ${briefSchedule.time}`
    : "تنظیم نشده";

  const installTool = (toolName: string) => {
    setInstalledTool(toolName);
    window.localStorage.setItem(installedToolStorageKey, toolName);
  };

  const saveBrief = (schedule: BriefSchedule) => {
    try {
      window.localStorage.setItem(briefStorageKey, JSON.stringify(schedule));
    } catch {
      return false;
    }
    setBriefSchedule(schedule);
    return true;
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    const nextId = Date.now();
    updateMessages((current) => [...current, { id: nextId, role: "user", text }, { id: nextId + 1, role: "assistant", text: `برای «${activeProject.name}» گرفتم. در نسخهٔ بعد این درخواست به منابع پروژه و ابزارهای تخصصی چیدا متصل می‌شود.` }]);
    setDraft("");
    keyboard.hide();
  };

  const openProjectSpace = (projectId: string) => {
    const nextProject = projects.find((project) => project.id === projectId);
    keyboard.hide();
    onOpenSheet(null);
    onProjectChange(projectId);
    if (nextProject && isProjectReady(nextProject)) setView("project");
  };

  const openProjectFiles = (returnView: FilesReturnView, focusedId: string | null = null) => {
    keyboard.hide();
    onOpenSheet(null);
    if (returnView === "project") {
      const projectScroll = document.querySelector<HTMLElement>(".project-workspace-scroll .mobile-scroll");
      if (projectScroll) projectWorkspaceScrollPositions.current.set(activeProject.id, projectScroll.scrollTop);
    }
    setFilesReturnView(returnView);
    setFocusedFileId(focusedId);
    setView("files");
  };

  const openProjectMemory = (returnView: MemoryReturnView, focusedId: string | null = null) => {
    keyboard.hide();
    onOpenSheet(null);
    setMemoryReturnView(returnView);
    setFocusedMemoryId(focusedId);
    setView("memory");
  };

  const openProjectSearch = () => {
    keyboard.hide();
    onOpenSheet(null);
    setView("search");
  };

  const openSourceAnswerDemo = () => {
    keyboard.hide();
    onOpenSheet(null);
    setView("source-demo");
  };

  const openProjectTasks = () => {
    keyboard.hide();
    onOpenSheet(null);
    setDrawerOpen(false);
    setProjectTasksLaunch({ filter: "active", approvalId: null, returnToPurchaseRequestId: null });
    setView("tasks");
  };

  const openProjectApproval = (approvalId: string, returnToPurchaseRequestId: string | null) => {
    keyboard.hide();
    onOpenSheet(null);
    setDrawerOpen(false);
    setProjectTasksLaunch({ filter: "approval", approvalId, returnToPurchaseRequestId });
    setView("tasks");
  };

  const openProjectPurchaseRequests = (returnView: PurchaseRequestsReturnView, startWithEditor = false) => {
    keyboard.hide();
    onOpenSheet(null);
    if (returnView === "project") {
      const projectScroll = document.querySelector<HTMLElement>(".project-workspace-scroll .mobile-scroll");
      if (projectScroll) projectWorkspaceScrollPositions.current.set(activeProject.id, projectScroll.scrollTop);
    }
    setPurchaseRequestsReturnView(returnView);
    setInitialPurchaseRequestId(null);
    setStartPurchaseRequestEditor(startWithEditor && !projectPurchaseRequestsReadError);
    setView("purchase-requests");
  };

  const openProjectProposals = (returnView: ProposalsReturnView) => {
    keyboard.hide();
    onOpenSheet(null);
    if (returnView === "project") {
      const projectScroll = document.querySelector<HTMLElement>(".project-workspace-scroll .mobile-scroll");
      if (projectScroll) projectWorkspaceScrollPositions.current.set(activeProject.id, projectScroll.scrollTop);
    }
    setProposalsReturnView(returnView);
    setView("proposals");
  };

  const returnToProjectPurchaseRequest = (requestId: string) => {
    keyboard.hide();
    setStartPurchaseRequestEditor(false);
    setInitialPurchaseRequestId(requestId);
    setView("purchase-requests");
  };

  const writeProjectFilesMetadata = (nextFiles: ProjectFileRecord[]) => {
    try {
      window.localStorage.setItem(projectFilesStorageKey, JSON.stringify(nextFiles));
      return true;
    } catch {
      return false;
    }
  };

  const persistProjectFiles = (nextFiles: ProjectFileRecord[]) => {
    if (projectFilesReadError) return false;
    if (!writeProjectFilesMetadata(nextFiles)) return false;
    setProjectFiles(nextFiles);
    return true;
  };

  const registerProjectFile = async (pendingFile: PendingProjectFile) => {
    if (projectFilesReadError) return false;
    const createdAt = new Date().toISOString();
    const record = {
      id: `file-${window.crypto.randomUUID()}`,
      projectId: activeProject.id,
      displayName: pendingFile.displayName.trim() || pendingFile.originalName,
      originalName: pendingFile.originalName,
      mimeType: pendingFile.mimeType,
      size: pendingFile.size,
      category: pendingFile.category,
      source: pendingFile.source,
      status: "ثبت محلی",
      version: 1,
      projectStage: activeProject.stage,
      visibility: "خصوصی پروژه",
      storageMode: pendingFile.blob && isProjectImage(pendingFile) ? "browser-image" : "metadata-only",
      sourceModifiedAt: pendingFile.sourceModifiedAt,
      createdAt,
    } satisfies ProjectFileRecord;

    const nextFiles = [...projectFiles, record];
    let previousMetadata: string | null;
    try {
      previousMetadata = window.localStorage.getItem(projectFilesStorageKey);
    } catch {
      return false;
    }
    if (!writeProjectFilesMetadata(nextFiles)) return false;

    if (pendingFile.blob) {
      try {
        await writeProjectImage(record, pendingFile.blob);
      } catch {
        try {
          if (previousMetadata === null) window.localStorage.removeItem(projectFilesStorageKey);
          else window.localStorage.setItem(projectFilesStorageKey, previousMetadata);
        } catch {
          // The in-memory list remains unchanged, so the current session never claims a successful registration.
        }
        return false;
      }
    }

    setProjectFiles(nextFiles);
    return true;
  };

  const renameProjectFile = (fileId: string, displayName: string) => {
    const normalizedName = displayName.trim();
    if (!normalizedName) return false;
    const nextFiles = projectFiles.map((file) => file.id === fileId && file.projectId === activeProject.id ? { ...file, displayName: normalizedName } : file);
    return persistProjectFiles(nextFiles);
  };

  const persistProjectMemories = (nextMemories: ProjectMemoryRecord[]) => {
    if (projectMemoriesReadError) return false;
    try {
      if (nextMemories.length === 0) window.localStorage.removeItem(projectMemoriesStorageKey);
      else window.localStorage.setItem(projectMemoriesStorageKey, JSON.stringify(nextMemories));
    } catch {
      return false;
    }
    setProjectMemories(nextMemories);
    return true;
  };

  const createProjectMemory = (memoryDraft: ProjectMemoryDraft) => {
    const timestamp = new Date().toISOString();
    const record = {
      id: `memory-${window.crypto.randomUUID()}`,
      projectId: activeProject.id,
      title: memoryDraft.title.trim(),
      content: memoryDraft.content.trim(),
      kind: memoryDraft.kind,
      source: "ثبت مستقیم شما",
      visibility: "خصوصی پروژه",
      useInContext: true,
      status: "ثبت محلی",
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    } satisfies ProjectMemoryRecord;
    return persistProjectMemories([...projectMemories, record]);
  };

  const updateProjectMemory = (memoryId: string, memoryDraft: ProjectMemoryDraft) => {
    const nextMemories = projectMemories.map((memory) => memory.id === memoryId && memory.projectId === activeProject.id
      ? { ...memory, title: memoryDraft.title.trim(), content: memoryDraft.content.trim(), kind: memoryDraft.kind, updatedAt: new Date().toISOString() }
      : memory);
    return persistProjectMemories(nextMemories);
  };

  const toggleProjectMemoryUse = (memoryId: string) => {
    const nextMemories = projectMemories.map((memory) => memory.id === memoryId && memory.projectId === activeProject.id
      ? { ...memory, useInContext: !memory.useInContext, updatedAt: new Date().toISOString() }
      : memory);
    return persistProjectMemories(nextMemories);
  };

  const deleteProjectMemory = (memoryId: string) => persistProjectMemories(
    projectMemories.filter((memory) => memory.id !== memoryId || memory.projectId !== activeProject.id),
  );

  const persistProjectTasks = (nextTasks: ProjectTaskRecord[]) => {
    if (projectTasksReadError) return false;
    try {
      window.localStorage.setItem(projectTasksStorageKey, JSON.stringify(nextTasks));
    } catch {
      return false;
    }
    setProjectTasks(nextTasks);
    return true;
  };

  const createProjectTask = (taskDraft: ProjectTaskDraft) => {
    const timestamp = new Date().toISOString();
    const taskId = `task-${window.crypto.randomUUID()}`;
    const record = {
      id: taskId,
      projectId: activeProject.id,
      title: taskDraft.title.trim(),
      currentStep: taskDraft.currentStep.trim(),
      dueDate: taskDraft.dueDate.trim() || null,
      status: "in-progress",
      source: "ثبت مستقیم شما",
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: null,
      history: [{ id: `task-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
    } satisfies ProjectTaskRecord;
    return persistProjectTasks([...projectTasks, record]);
  };

  const updateProjectTask = (taskId: string, taskDraft: ProjectTaskDraft) => {
    const title = taskDraft.title.trim();
    const currentStep = taskDraft.currentStep.trim();
    const dueDate = taskDraft.dueDate.trim() || null;
    const timestamp = new Date().toISOString();
    let changed = false;
    const nextTasks = projectTasks.map((task) => {
      if (task.id !== taskId || task.projectId !== activeProject.id) return task;
      if (task.title === title && task.currentStep === currentStep && task.dueDate === dueDate) return task;
      changed = true;
      const version = task.version + 1;
      return {
        ...task,
        title,
        currentStep,
        dueDate,
        version,
        updatedAt: timestamp,
        history: [...task.history, { id: `task-event-${window.crypto.randomUUID()}`, type: "updated", actor: "شما", at: timestamp, version }],
      } satisfies ProjectTaskRecord;
    });
    return changed ? persistProjectTasks(nextTasks) : true;
  };

  const changeProjectTaskStatus = (taskId: string, nextStatus: ProjectTaskStatus) => {
    const timestamp = new Date().toISOString();
    const nextTasks = projectTasks.map((task) => {
      if (task.id !== taskId || task.projectId !== activeProject.id || task.status === nextStatus) return task;
      const version = task.version + 1;
      const eventType = nextStatus === "completed" ? "completed" : "reopened";
      return {
        ...task,
        status: nextStatus,
        version,
        updatedAt: timestamp,
        completedAt: nextStatus === "completed" ? timestamp : null,
        history: [...task.history, { id: `task-event-${window.crypto.randomUUID()}`, type: eventType, actor: "شما", at: timestamp, version }],
      } satisfies ProjectTaskRecord;
    });
    return persistProjectTasks(nextTasks);
  };

  const persistProjectPurchaseRequests = (nextRequests: ProjectPurchaseRequestRecord[]) => {
    if (projectPurchaseRequestsReadError) return false;
    try {
      if (nextRequests.length === 0) window.localStorage.removeItem(projectPurchaseRequestsStorageKey);
      else window.localStorage.setItem(projectPurchaseRequestsStorageKey, JSON.stringify(nextRequests));
    } catch {
      return false;
    }
    setProjectPurchaseRequests(nextRequests);
    return true;
  };

  const createProjectPurchaseRequest = (requestDraft: PurchaseRequestDraft) => {
    const rawNeed = requestDraft.rawNeed.trim();
    if (!hasVisibleProjectTaskText(rawNeed)) return null;
    if (requestDraft.requestKind === "product" && (requestDraft.items.length < 1 || requestDraft.items.length > 8)) return null;
    const normalizedProductQuantities = requestDraft.requestKind === "product"
      ? requestDraft.items.map((draft) => draft.quantity ? normalizeProjectNumber(draft.quantity, false) : "")
      : [];
    if (normalizedProductQuantities.some((quantity) => quantity === null || Boolean(quantity && Number(quantity) <= 0))) return null;
    const timestamp = new Date().toISOString();
    const requestId = `purchase-request-${window.crypto.randomUUID()}`;
    const items: ProductRequestItem[] = requestDraft.requestKind === "product" ? requestDraft.items.map((draft, index) => {
      const normalizedQuantity = normalizedProductQuantities[index] ?? "";
      const name = normalizeOptionalPurchaseRequestText(draft.itemName);
      const unit = purchaseRequestUnits.includes(draft.unit as PurchaseRequestUnit) ? draft.unit as PurchaseRequestUnit : null;
      return {
        id: draft.id.startsWith("purchase-item-") ? draft.id : `purchase-item-${window.crypto.randomUUID()}`,
        name,
        quantity: normalizedQuantity || null,
        unit,
        brandOrGrade: normalizeOptionalPurchaseRequestText(draft.brandOrGrade),
        specification: normalizeOptionalPurchaseRequestText(draft.specification),
        alternatives: purchaseRequestAlternativesFromLabel(draft.alternatives),
        source: "ثبت مستقیم شما",
        confidence: null,
        completionStatus: name && normalizedQuantity && unit ? "complete" : "incomplete",
        version: 1,
        createdAt: timestamp,
        updatedAt: timestamp,
        history: [{ id: `purchase-item-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
      };
    }) : [];
    const serviceFields = {
      scope: normalizeOptionalPurchaseRequestText(requestDraft.serviceScope),
      location: normalizeOptionalPurchaseRequestText(requestDraft.serviceLocation),
      sizeOrVolume: normalizeOptionalPurchaseRequestText(requestDraft.serviceSizeOrVolume),
      qualification: normalizeOptionalPurchaseRequestText(requestDraft.serviceQualification),
      timing: normalizeOptionalPurchaseRequestText(requestDraft.serviceTiming),
      method: normalizeOptionalPurchaseRequestText(requestDraft.serviceMethod),
      inScope: normalizeOptionalPurchaseRequestText(requestDraft.serviceInScope),
      outOfScope: normalizeOptionalPurchaseRequestText(requestDraft.serviceOutOfScope),
      warranty: normalizeOptionalPurchaseRequestText(requestDraft.serviceWarranty),
      paymentTerms: normalizeOptionalPurchaseRequestText(requestDraft.servicePaymentTerms),
    };
    const service: ServiceRequestSpec | null = requestDraft.requestKind === "service" ? {
      id: `purchase-service-${window.crypto.randomUUID()}`,
      ...serviceFields,
      locationPrecision: "area-or-project-section",
      source: "ثبت مستقیم شما",
      confidence: null,
      completionStatus: serviceFields.scope && serviceFields.location ? "complete" : "incomplete",
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [{ id: `purchase-service-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
    } : null;
    const record: ProjectPurchaseRequestRecord = {
      schemaVersion: 2,
      id: requestId,
      projectId: activeProject.id,
      requestKind: requestDraft.requestKind,
      rawNeed: { text: rawNeed, source: "ثبت مستقیم شما", capturedAt: timestamp },
      items,
      item: items[0] ?? null,
      service,
      delivery: {
        city: "تهران",
        area: normalizeOptionalPurchaseRequestText(requestDraft.deliveryArea) ?? "نامشخص",
        exactAddressShared: false,
        neededBy: normalizeOptionalPurchaseRequestText(requestDraft.neededBy),
      },
      unresolvedTerms: {
        transport: normalizeOptionalPurchaseRequestText(requestDraft.transport) ?? "unknown",
        tax: normalizeOptionalPurchaseRequestText(requestDraft.tax) ?? "unknown",
        paymentTerms: normalizeOptionalPurchaseRequestText(requestDraft.paymentTerms) ?? "unknown",
      },
      clarificationAnswers: [],
      reviewRevisions: [],
      migration: null,
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      sharingStatus: "ارسال نشده",
      status: "draft",
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      readyAt: null,
      history: [{ id: `purchase-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
    };
    record.clarificationAnswers = reconcilePurchaseRequestClarifications(record, [], timestamp);
    return persistProjectPurchaseRequests([...projectPurchaseRequests, record]) ? requestId : null;
  };

  const updateProjectPurchaseRequest = (requestId: string, requestDraft: PurchaseRequestDraft) => {
    const rawNeed = requestDraft.rawNeed.trim();
    if (!hasVisibleProjectTaskText(rawNeed)) return false;
    const timestamp = new Date().toISOString();
    let updated = false;
    const nextRequests = projectPurchaseRequests.map((request) => {
      if (request.id !== requestId || request.projectId !== activeProject.id || request.status !== "draft" || request.requestKind !== requestDraft.requestKind) return request;
      const version = request.version + 1;
      const items: ProductRequestItem[] = request.requestKind === "product" ? requestDraft.items.map((draft) => {
        const normalizedQuantity = draft.quantity ? normalizeProjectNumber(draft.quantity, false) : "";
        if (normalizedQuantity === null || (normalizedQuantity && Number(normalizedQuantity) <= 0)) return null;
        const existing = request.items.find((item) => item.id === draft.id);
        const name = normalizeOptionalPurchaseRequestText(draft.itemName);
        const unit = purchaseRequestUnits.includes(draft.unit as PurchaseRequestUnit) ? draft.unit as PurchaseRequestUnit : null;
        const nextValues = { name, quantity: normalizedQuantity || null, unit, brandOrGrade: normalizeOptionalPurchaseRequestText(draft.brandOrGrade), specification: normalizeOptionalPurchaseRequestText(draft.specification), alternatives: purchaseRequestAlternativesFromLabel(draft.alternatives) };
        if (!existing) return { id: `purchase-item-${window.crypto.randomUUID()}`, ...nextValues, source: "ثبت مستقیم شما", confidence: null, completionStatus: name && normalizedQuantity && unit ? "complete" : "incomplete", version: 1, createdAt: timestamp, updatedAt: timestamp, history: [{ id: `purchase-item-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }] } satisfies ProductRequestItem;
        const changed = JSON.stringify(nextValues) !== JSON.stringify({ name: existing.name, quantity: existing.quantity, unit: existing.unit, brandOrGrade: existing.brandOrGrade, specification: existing.specification, alternatives: existing.alternatives });
        if (!changed) return existing;
        const itemVersion = existing.version + 1;
        return { ...existing, ...nextValues, source: "ثبت مستقیم شما", completionStatus: name && normalizedQuantity && unit ? "complete" : "incomplete", version: itemVersion, updatedAt: timestamp, history: [...existing.history, { id: `purchase-item-event-${window.crypto.randomUUID()}`, type: "updated", actor: "شما", at: timestamp, version: itemVersion }] } satisfies ProductRequestItem;
      }).filter((item): item is ProductRequestItem => item !== null) : [];
      if (request.requestKind === "product" && items.length !== requestDraft.items.length) return request;
      const nextServiceValues = {
        scope: normalizeOptionalPurchaseRequestText(requestDraft.serviceScope),
        location: normalizeOptionalPurchaseRequestText(requestDraft.serviceLocation),
        sizeOrVolume: normalizeOptionalPurchaseRequestText(requestDraft.serviceSizeOrVolume),
        qualification: normalizeOptionalPurchaseRequestText(requestDraft.serviceQualification),
        timing: normalizeOptionalPurchaseRequestText(requestDraft.serviceTiming),
        method: normalizeOptionalPurchaseRequestText(requestDraft.serviceMethod),
        inScope: normalizeOptionalPurchaseRequestText(requestDraft.serviceInScope),
        outOfScope: normalizeOptionalPurchaseRequestText(requestDraft.serviceOutOfScope),
        warranty: normalizeOptionalPurchaseRequestText(requestDraft.serviceWarranty),
        paymentTerms: normalizeOptionalPurchaseRequestText(requestDraft.servicePaymentTerms),
      };
      let service = request.service;
      if (request.requestKind === "service" && service) {
        const changed = JSON.stringify(nextServiceValues) !== JSON.stringify({ scope: service.scope, location: service.location, sizeOrVolume: service.sizeOrVolume, qualification: service.qualification, timing: service.timing, method: service.method, inScope: service.inScope, outOfScope: service.outOfScope, warranty: service.warranty, paymentTerms: service.paymentTerms });
        if (changed) {
          const serviceVersion = service.version + 1;
          service = { ...service, ...nextServiceValues, source: "ثبت مستقیم شما", completionStatus: nextServiceValues.scope && nextServiceValues.location ? "complete" : "incomplete", version: serviceVersion, updatedAt: timestamp, history: [...service.history, { id: `purchase-service-event-${window.crypto.randomUUID()}`, type: "updated", actor: "شما", at: timestamp, version: serviceVersion }] };
        }
      }
      const candidate: ProjectPurchaseRequestRecord = {
        ...request,
        rawNeed: { ...request.rawNeed, text: rawNeed },
        items,
        item: items[0] ?? null,
        service,
        delivery: { ...request.delivery, area: normalizeOptionalPurchaseRequestText(requestDraft.deliveryArea) ?? "نامشخص", neededBy: normalizeOptionalPurchaseRequestText(requestDraft.neededBy) },
        unresolvedTerms: { transport: normalizeOptionalPurchaseRequestText(requestDraft.transport) ?? "unknown", tax: normalizeOptionalPurchaseRequestText(requestDraft.tax) ?? "unknown", paymentTerms: normalizeOptionalPurchaseRequestText(requestDraft.paymentTerms) ?? "unknown" },
        version,
        updatedAt: timestamp,
        history: [...request.history, { id: `purchase-event-${window.crypto.randomUUID()}`, type: "updated", actor: "شما", at: timestamp, version }],
      };
      candidate.clarificationAnswers = reconcilePurchaseRequestClarifications(candidate, request.clarificationAnswers, timestamp);
      const comparableBefore = { rawNeed: request.rawNeed.text, items: request.items, service: request.service, delivery: request.delivery, unresolvedTerms: request.unresolvedTerms };
      const comparableAfter = { rawNeed, items: candidate.items, service: candidate.service, delivery: candidate.delivery, unresolvedTerms: candidate.unresolvedTerms };
      if (JSON.stringify(stablePurchaseRequestValue(comparableBefore)) === JSON.stringify(stablePurchaseRequestValue(comparableAfter))) {
        updated = true;
        return request;
      }
      updated = true;
      return candidate;
    });
    return updated && persistProjectPurchaseRequests(nextRequests);
  };

  const markProjectPurchaseRequestReady = (requestId: string) => {
    const timestamp = new Date().toISOString();
    let updated = false;
    const nextRequests = projectPurchaseRequests.map((request) => {
      if (request.id !== requestId || request.projectId !== activeProject.id || request.status !== "draft" || purchaseRequestMissingFields(request).length > 0) return request;
      updated = true;
      const version = request.version + 1;
      const candidate: ProjectPurchaseRequestRecord = {
        ...request,
        status: "ready-for-review",
        version,
        updatedAt: timestamp,
        readyAt: timestamp,
        history: [...request.history, { id: `purchase-event-${window.crypto.randomUUID()}`, type: "marked-ready-for-review", actor: "شما", at: timestamp, version }],
      };
      const snapshot = purchaseRequestApprovalSnapshot(candidate);
      const shareableFields = purchaseRequestApprovalShareableFields(candidate);
      candidate.reviewRevisions = [...request.reviewRevisions, { id: `purchase-review-${window.crypto.randomUUID()}`, requestVersion: version, createdAt: timestamp, snapshot, shareableFields, fingerprint: purchaseRequestRevisionFingerprint(snapshot, shareableFields) }];
      return candidate;
    });
    return updated && persistProjectPurchaseRequests(nextRequests);
  };

  const persistProjectApprovals = (nextApprovals: ProjectApprovalRecord[]) => {
    if (projectApprovalsReadError || projectPurchaseRequestsReadError) return false;
    try {
      if (nextApprovals.length === 0) window.localStorage.removeItem(projectApprovalsStorageKey);
      else window.localStorage.setItem(projectApprovalsStorageKey, JSON.stringify(nextApprovals));
    } catch {
      return false;
    }
    setProjectApprovals(nextApprovals);
    return true;
  };

  const createProjectApproval = (requestId: string) => {
    if (projectApprovalsReadError || projectPurchaseRequestsReadError) return null;
    const request = projectPurchaseRequests.find((item) => item.id === requestId && item.projectId === activeProject.id);
    if (!request || request.status !== "ready-for-review" || purchaseRequestMissingFields(request).length > 0) return null;
    const dedupeKey = purchaseRequestApprovalDedupeKey(activeProject.id, request.id, request.version);
    const existingApproval = projectApprovals.find((approval) => approval.dedupeKey === dedupeKey);
    if (existingApproval) return existingApproval.id;
    const revision = request.reviewRevisions.find((item) => item.requestVersion === request.version && item.createdAt === request.updatedAt);
    if (!revision) return null;
    const timestamp = new Date().toISOString();
    const approvalId = `approval-${window.crypto.randomUUID()}`;
    const record = {
      schemaVersion: 2,
      id: approvalId,
      projectId: activeProject.id,
      purpose: "review-purchase-request-version",
      target: { type: "purchase-request", id: request.id, version: request.version, updatedAt: request.updatedAt, revisionId: revision.id },
      dedupeKey,
      snapshot: structuredClone(revision.snapshot),
      privacySnapshot: {
        shareableFields: [...revision.shareableFields],
        projectNameShared: false,
        exactAddressShared: false,
        budgetShared: false,
        filesShared: false,
        memoryShared: false,
      },
      externalEffect: "none",
      destination: null,
      sendAuthorized: false,
      status: "pending",
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      requestedBy: "شما",
      decidedBy: null,
      requestedAt: timestamp,
      updatedAt: timestamp,
      decidedAt: null,
      version: 1,
      history: [{ id: `approval-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
    } satisfies ProjectApprovalRecord;
    return persistProjectApprovals([...projectApprovals, record]) ? approvalId : null;
  };

  const decideProjectApproval = (approvalId: string, decision: Exclude<ProjectApprovalStatus, "pending">) => {
    if (projectApprovalsReadError || projectPurchaseRequestsReadError) return false;
    const timestamp = new Date().toISOString();
    let updated = false;
    const nextApprovals = projectApprovals.map((approval) => {
      if (approval.id !== approvalId || approval.projectId !== activeProject.id || approval.status !== "pending") return approval;
      const targetRequest = projectPurchaseRequests.find((request) => request.id === approval.target.id && request.projectId === activeProject.id);
      if (!targetRequest || targetRequest.status !== "ready-for-review" || targetRequest.version !== approval.target.version || !approvalSnapshotMatchesRevision(approval, targetRequest)) return approval;
      updated = true;
      const version = approval.version + 1;
      return {
        ...approval,
        status: decision,
        decidedBy: "شما",
        decidedAt: timestamp,
        updatedAt: timestamp,
        version,
        history: [...approval.history, { id: `approval-event-${window.crypto.randomUUID()}`, type: decision, actor: "شما", at: timestamp, version }],
      } satisfies ProjectApprovalRecord;
    });
    return updated && persistProjectApprovals(nextApprovals);
  };

  const returnProjectPurchaseRequestToDraft = (requestId: string) => {
    const timestamp = new Date().toISOString();
    let updated = false;
    const nextRequests = projectPurchaseRequests.map((request) => {
      if (request.id !== requestId || request.projectId !== activeProject.id || request.status !== "ready-for-review") return request;
      if (projectApprovalsReadError || activeProjectApprovals.some((approval) => approval.target.id === request.id && approval.target.version === request.version && approval.status === "pending")) return request;
      updated = true;
      const version = request.version + 1;
      return {
        ...request,
        status: "draft",
        version,
        updatedAt: timestamp,
        readyAt: null,
        history: [...request.history, { id: `purchase-event-${window.crypto.randomUUID()}`, type: "returned-to-draft", actor: "شما", at: timestamp, version }],
      } satisfies ProjectPurchaseRequestRecord;
    });
    return updated && persistProjectPurchaseRequests(nextRequests);
  };

  const persistProjectSupplierContacts = (nextContacts: SupplierContactRecord[]) => {
    if (projectSupplierContactsReadError) return false;
    try {
      if (nextContacts.length === 0) window.localStorage.removeItem(projectSupplierContactsStorageKey);
      else window.localStorage.setItem(projectSupplierContactsStorageKey, JSON.stringify(nextContacts));
    } catch {
      return false;
    }
    setProjectSupplierContacts(nextContacts);
    return true;
  };

  const createProjectSupplierContact = (draft: SupplierContactDraft) => {
    if (projectSupplierContactsReadError || projectSupplierContacts.filter((contact) => contact.projectId === activeProject.id).length >= 100) return null;
    const displayName = draft.displayName.trim();
    const category = draft.category.trim();
    const tehranCoverage = draft.tehranCoverage.trim();
    if (!hasVisibleProjectTaskText(displayName) || displayName.length > 100 || !hasVisibleProjectTaskText(category) || category.length > 100 || !hasVisibleProjectTaskText(tehranCoverage) || tehranCoverage.length > 120 || !["product", "service", "both"].includes(draft.responseCapability)) return null;
    const timestamp = new Date().toISOString();
    const contactId = `supplier-contact-${window.crypto.randomUUID()}`;
    const record = {
      schemaVersion: 1,
      id: contactId,
      projectId: activeProject.id,
      displayName,
      category,
      tehranCoverage,
      responseCapability: draft.responseCapability,
      source: "ثبت مستقیم سازنده",
      networkStatus: "خارج از شبکه چیدا",
      status: "active",
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      archivedAt: null,
      history: [{ id: `supplier-contact-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
    } satisfies SupplierContactRecord;
    return persistProjectSupplierContacts([...projectSupplierContacts, record]) ? contactId : null;
  };

  const changeProjectSupplierContactStatus = (contactId: string, nextStatus: SupplierContactStatus) => {
    if (projectSupplierContactsReadError) return false;
    const timestamp = new Date().toISOString();
    let updated = false;
    const nextContacts = projectSupplierContacts.map((contact) => {
      if (contact.id !== contactId || contact.projectId !== activeProject.id || contact.status === nextStatus) return contact;
      updated = true;
      const version = contact.version + 1;
      const eventType = nextStatus === "archived" ? "archived" : "restored";
      return { ...contact, status: nextStatus, version, updatedAt: timestamp, archivedAt: nextStatus === "archived" ? timestamp : null, history: [...contact.history, { id: `supplier-contact-event-${window.crypto.randomUUID()}`, type: eventType, actor: "شما", at: timestamp, version }] } satisfies SupplierContactRecord;
    });
    return updated && persistProjectSupplierContacts(nextContacts);
  };

  const persistProjectDispatchDrafts = (nextDrafts: DispatchDraftRecord[]) => {
    if (projectDispatchDraftsReadError || projectSupplierContactsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError) return false;
    try {
      if (nextDrafts.length === 0) window.localStorage.removeItem(projectDispatchDraftsStorageKey);
      else window.localStorage.setItem(projectDispatchDraftsStorageKey, JSON.stringify(nextDrafts));
    } catch {
      return false;
    }
    setProjectDispatchDrafts(nextDrafts);
    return true;
  };

  const upsertProjectDispatchDraft = (requestId: string, approvalId: string, requestedRecipientIds: string[]) => {
    if (projectDispatchDraftsReadError || projectSupplierContactsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError) return null;
    const request = projectPurchaseRequests.find((item) => item.id === requestId && item.projectId === activeProject.id);
    const approval = projectApprovals.find((item) => item.id === approvalId && item.projectId === activeProject.id);
    if (!request || !isApprovalEligibleForDispatch(approval, request, activeProject.id)) return null;
    const reviewRevision = request.reviewRevisions.find((item) => item.id === approval!.target.revisionId && item.requestVersion === approval!.target.version);
    if (!reviewRevision) return null;
    const recipientIds = [...new Set(requestedRecipientIds)].sort();
    if (recipientIds.length < 1 || recipientIds.length > 50) return null;
    const selectedContacts = recipientIds.map((recipientId) => projectSupplierContacts.find((contact) => contact.id === recipientId && contact.projectId === activeProject.id));
    if (selectedContacts.some((contact) => !contact || !supplierContactCanRespond(contact, request.requestKind))) return null;
    const target = { requestId: request.id, requestVersion: request.version, revisionId: reviewRevision.id, approvalId: approval!.id };
    const dedupeKey = dispatchDraftDedupeKey(activeProject.id, request.id, request.version, reviewRevision.id);
    const existing = projectDispatchDrafts.find((item) => item.dedupeKey === dedupeKey);
    if (!existing && projectDispatchDrafts.filter((item) => item.projectId === activeProject.id).length >= 100) return null;
    const currentRevision = existing?.revisions.find((revision) => revision.id === existing.currentRevisionId);
    if (currentRevision && JSON.stringify(currentRevision.recipientIds) === JSON.stringify(recipientIds)) return existing!.id;
    const timestamp = new Date().toISOString();
    const dispatchId = existing?.id ?? `dispatch-draft-${window.crypto.randomUUID()}`;
    const nextVersion = existing ? existing.version + 1 : 1;
    const inviteDrafts: InviteDraft[] = selectedContacts.map((contact) => ({
      schemaVersion: 1,
      id: `invite-draft-${window.crypto.randomUUID()}`,
      projectId: activeProject.id,
      supplierContactId: contact!.id,
      destination: { displayName: contact!.displayName, category: contact!.category, tehranCoverage: contact!.tehranCoverage, responseCapability: contact!.responseCapability, networkStatus: "خارج از شبکه چیدا" },
      target,
      source: "ثبت مستقیم سازنده",
      continuation: "ادامهٔ احتمالی در فاز تأمین‌کننده",
      externalEffect: "none",
      sendAuthorized: false,
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));
    const payload = dispatchPayloadFromSnapshot(reviewRevision.snapshot);
    const privacySnapshot = dispatchPrivacySnapshot(reviewRevision.shareableFields);
    const revisionId = `dispatch-revision-${window.crypto.randomUUID()}`;
    const revision = { id: revisionId, version: nextVersion, createdAt: timestamp, recipientIds, inviteDrafts, payload, privacySnapshot, fingerprint: dispatchRevisionFingerprint(target, recipientIds, inviteDrafts, payload, privacySnapshot) } satisfies DispatchDraftRevision;
    const record = existing ? {
      ...existing,
      currentRevisionId: revisionId,
      version: nextVersion,
      updatedAt: timestamp,
      history: [...existing.history, { id: `dispatch-event-${window.crypto.randomUUID()}`, type: "updated", actor: "شما", at: timestamp, version: nextVersion }],
      revisions: [...existing.revisions, revision],
    } satisfies DispatchDraftRecord : {
      schemaVersion: 1,
      id: dispatchId,
      projectId: activeProject.id,
      target,
      dedupeKey,
      status: "draft",
      currentRevisionId: revisionId,
      externalEffect: "none",
      sendAuthorized: false,
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [{ id: `dispatch-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
      revisions: [revision],
    } satisfies DispatchDraftRecord;
    const nextDrafts = existing ? projectDispatchDrafts.map((item) => item.id === existing.id ? record : item) : [...projectDispatchDrafts, record];
    return persistProjectDispatchDrafts(nextDrafts) ? dispatchId : null;
  };

  const persistProjectDispatchPlanApprovals = (nextApprovals: DispatchPlanApprovalRecord[]) => {
    if (projectDispatchPlanApprovalsReadError || projectDispatchDraftsReadError || projectSupplierContactsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError) return false;
    try {
      if (nextApprovals.length === 0) window.localStorage.removeItem(projectDispatchPlanApprovalsStorageKey);
      else window.localStorage.setItem(projectDispatchPlanApprovalsStorageKey, JSON.stringify(nextApprovals));
    } catch {
      return false;
    }
    setProjectDispatchPlanApprovals(nextApprovals);
    return true;
  };

  const createProjectDispatchPlanApproval = (dispatchDraftId: string) => {
    if (projectDispatchPlanApprovalsReadError || projectDispatchDraftsReadError || projectSupplierContactsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError) return null;
    const dispatchDraft = projectDispatchDrafts.find((item) => item.id === dispatchDraftId && item.projectId === activeProject.id);
    const revision = dispatchDraft?.revisions.find((item) => item.id === dispatchDraft.currentRevisionId);
    const request = dispatchDraft ? projectPurchaseRequests.find((item) => item.id === dispatchDraft.target.requestId && item.projectId === activeProject.id) : null;
    const contentApproval = dispatchDraft ? projectApprovals.find((item) => item.id === dispatchDraft.target.approvalId && item.projectId === activeProject.id) : null;
    if (!dispatchDraft || !revision || !request || !isApprovalEligibleForDispatch(contentApproval ?? undefined, request, activeProject.id) || dispatchDraft.version !== revision.version) return null;
    const recipients = revision.inviteDrafts.map((invite) => {
      const contact = projectSupplierContacts.find((item) => item.id === invite.supplierContactId && item.projectId === activeProject.id);
      return contact && supplierContactCanRespond(contact, request.requestKind)
        ? { supplierContactId: contact.id, supplierContactVersion: contact.version, destination: structuredClone(invite.destination) }
        : null;
    });
    if (recipients.some((recipient) => !recipient)) return null;
    const target = dispatchPlanApprovalTarget(dispatchDraft, revision);
    const snapshot = {
      recipients: recipients as DispatchPlanApprovalRecord["snapshot"]["recipients"],
      recipientCount: recipients.length,
      payload: structuredClone(revision.payload),
      privacySnapshot: structuredClone(revision.privacySnapshot),
      reviewAcknowledgement: { destinationsReviewed: true, payloadReviewed: true, privacyAndLocationReviewed: true },
    } satisfies DispatchPlanApprovalRecord["snapshot"];
    const planFingerprint = dispatchPlanFingerprint(target, snapshot);
    const dedupeKey = dispatchPlanApprovalDedupeKey(activeProject.id, target, planFingerprint);
    const existing = projectDispatchPlanApprovals.find((item) => item.dedupeKey === dedupeKey);
    if (existing) return existing.id;
    if (projectDispatchPlanApprovals.filter((item) => item.projectId === activeProject.id).length >= 100) return null;
    const timestamp = new Date().toISOString();
    const approvalId = `dispatch-plan-approval-${window.crypto.randomUUID()}`;
    const record = {
      schemaVersion: 1,
      id: approvalId,
      projectId: activeProject.id,
      purpose: "approve-local-dispatch-plan-simulation",
      target,
      snapshot,
      planFingerprint,
      dedupeKey,
      idempotencyKey: `${dedupeKey}:simulation-v1`,
      status: "pending",
      simulationOnly: true,
      externalEffect: "none",
      sendAuthorized: false,
      externalActionAttempted: false,
      actionRecord: null,
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      requestedBy: "شما",
      decidedBy: null,
      requestedAt: timestamp,
      decidedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      version: 1,
      history: [{ id: `dispatch-plan-approval-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
    } satisfies DispatchPlanApprovalRecord;
    return persistProjectDispatchPlanApprovals([...projectDispatchPlanApprovals, record]) ? approvalId : null;
  };

  const changeProjectDispatchPlanApproval = (approvalId: string, action: "approve" | "withdraw" | "reopen") => {
    if (projectDispatchPlanApprovalsReadError || projectDispatchDraftsReadError || projectSupplierContactsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError) return false;
    const current = projectDispatchPlanApprovals.find((item) => item.id === approvalId && item.projectId === activeProject.id);
    if (!current) return false;
    const dispatchDraft = projectDispatchDrafts.find((item) => item.id === current.target.dispatchDraftId && item.projectId === activeProject.id) ?? null;
    const request = projectPurchaseRequests.find((item) => item.id === current.target.requestId && item.projectId === activeProject.id);
    const contentApproval = projectApprovals.find((item) => item.id === current.target.contentApprovalId && item.projectId === activeProject.id);
    if (!request || !contentApproval || dispatchPlanApprovalEffectiveStatus(current, dispatchDraft, request, contentApproval, projectSupplierContacts) === "invalidated") return false;
    if (action === "approve" && current.status === "approved") return true;
    const transitionIsValid = action === "approve" && current.status === "pending"
      || action === "withdraw" && current.status === "pending"
      || action === "reopen" && current.status === "withdrawn";
    if (!transitionIsValid) return false;
    const timestamp = new Date().toISOString();
    const version = current.version + 1;
    const status: DispatchPlanApprovalStatus = action === "approve" ? "approved" : action === "withdraw" ? "withdrawn" : "pending";
    const eventType: DispatchPlanApprovalEventType = action === "approve" ? "approved" : action === "withdraw" ? "withdrawn" : "reopened";
    const updated = {
      ...current,
      status,
      actionRecord: action === "approve" ? { kind: "record-local-dispatch-plan-approval", result: "local-dispatch-plan-approved", label: "تأیید محلی برنامهٔ ارسال", error: null, recordedAt: timestamp } : null,
      decidedBy: action === "approve" ? "شما" : null,
      decidedAt: action === "approve" ? timestamp : null,
      updatedAt: timestamp,
      version,
      history: [...current.history, { id: `dispatch-plan-approval-event-${window.crypto.randomUUID()}`, type: eventType, actor: "شما", at: timestamp, version }],
    } satisfies DispatchPlanApprovalRecord;
    const nextApprovals = projectDispatchPlanApprovals.map((item) => item.id === current.id ? updated : item);
    return persistProjectDispatchPlanApprovals(nextApprovals);
  };

  const persistBuilderRecordedProposals = (nextProposals: BuilderRecordedProposalRecord[]) => {
    if (builderRecordedProposalsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError || projectSupplierContactsReadError || projectFilesReadError) return false;
    try {
      if (nextProposals.length === 0) window.localStorage.removeItem(projectBuilderRecordedProposalsStorageKey);
      else window.localStorage.setItem(projectBuilderRecordedProposalsStorageKey, JSON.stringify(nextProposals));
    } catch {
      return false;
    }
    setBuilderRecordedProposals(nextProposals);
    return true;
  };

  const createBuilderRecordedProposal = (draft: BuilderRecordedProposalDraft) => {
    if (builderRecordedProposalsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError || projectSupplierContactsReadError || projectFilesReadError) return null;
    if (builderRecordedProposals.length >= 1000 || builderRecordedProposals.filter((proposal) => proposal.projectId === activeProject.id).length >= 100) return null;
    const request = projectPurchaseRequests.find((item) => item.id === draft.requestId && item.projectId === activeProject.id);
    const approval = request ? projectApprovals.find((item) => item.projectId === activeProject.id && item.target.id === request.id && item.target.version === request.version && item.status === "approved" && isApprovalEligibleForDispatch(item, request, activeProject.id)) : null;
    const reviewRevision = request && approval ? request.reviewRevisions.find((item) => item.id === approval.target.revisionId && item.requestVersion === approval.target.version) : null;
    const contact = request ? projectSupplierContacts.find((item) => item.id === draft.supplierContactId && item.projectId === activeProject.id && supplierContactCanRespond(item, request.requestKind)) : null;
    if (!request || !approval || !reviewRevision || !contact) return null;
    const requestSnapshot = builderRecordedProposalRequestSnapshot(reviewRevision.snapshot);
    const target = {
      requestId: request.id,
      requestVersion: request.version,
      reviewRevisionId: reviewRevision.id,
      reviewRevisionFingerprint: reviewRevision.fingerprint,
      contentApprovalId: approval.id,
      requestKind: request.requestKind,
    } satisfies BuilderRecordedProposalRecord["target"];
    const supplierSnapshot = {
      supplierContactId: contact.id,
      supplierContactVersion: contact.version,
      displayName: contact.displayName,
      category: contact.category,
      tehranCoverage: contact.tehranCoverage,
      responseCapability: contact.responseCapability,
      networkStatus: "خارج از شبکه چیدا",
    } satisfies BuilderRecordedProposalSupplierSnapshot;
    let reference: BuilderRecordedProposalReference = { kind: "unattached", projectFileId: null, fileSnapshot: null, contentPersisted: false, extractionPerformed: false };
    if (draft.projectFileId) {
      const file = projectFiles.find((item) => item.id === draft.projectFileId && item.projectId === activeProject.id && item.storageMode === "metadata-only");
      const displayName = file?.displayName.trim() ?? "";
      if (!file || !hasVisibleProjectTaskText(displayName) || displayName.length > 140) return null;
      reference = {
        kind: "project-file-metadata",
        projectFileId: file.id,
        fileSnapshot: { id: file.id, displayName, originalName: file.originalName, mimeType: file.mimeType, size: file.size, category: file.category, createdAt: file.createdAt, storageMode: "metadata-only" },
        contentPersisted: false,
        extractionPerformed: false,
      };
    }
    const expectedLineIds = blankBuilderRecordedProposalLines(requestSnapshot).map((line) => line.id);
    const normalized = normalizeBuilderRecordedProposalRevisionDraft(draft, requestSnapshot, expectedLineIds);
    if (!normalized) return null;
    const timestamp = new Date(Math.max(
      Date.now(),
      new Date(reviewRevision.createdAt).getTime(),
      new Date(approval.updatedAt).getTime(),
      new Date(contact.history[contact.version - 1].at).getTime(),
      reference.fileSnapshot ? new Date(reference.fileSnapshot.createdAt).getTime() : 0,
    )).toISOString();
    const proposalId = `builder-recorded-proposal-${window.crypto.randomUUID()}`;
    const revisionBase = { id: `builder-recorded-proposal-revision-${window.crypto.randomUUID()}`, version: 1, createdAt: timestamp, ...normalized } satisfies Omit<BuilderRecordedProposalRevision, "fingerprint">;
    if (!builderRecordedProposalHasMeaningfulInput(reference, revisionBase)) return null;
    const revision = { ...revisionBase, fingerprint: builderRecordedProposalRevisionFingerprint(target, requestSnapshot, supplierSnapshot, reference, revisionBase) } satisfies BuilderRecordedProposalRevision;
    const record = {
      schemaVersion: 1,
      id: proposalId,
      projectId: activeProject.id,
      source: "ثبت دستی سازنده",
      networkStatus: "خارج از شبکه چیدا",
      supplierAuthenticated: false,
      receivedThroughChida: false,
      externalEffect: "none",
      target,
      requestSnapshot,
      supplierSnapshot,
      reference,
      currentRevisionId: revision.id,
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [{ id: `builder-recorded-proposal-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
      revisions: [revision],
    } satisfies BuilderRecordedProposalRecord;
    if (!parseBuilderRecordedProposal(
      record,
      { records: projectPurchaseRequests, readError: false },
      { records: projectApprovals, readError: false },
      { records: projectSupplierContacts, readError: false },
      { records: projectFiles, readError: false },
    )) return null;
    return persistBuilderRecordedProposals([...builderRecordedProposals, record]) ? proposalId : null;
  };

  const updateBuilderRecordedProposal = (proposalId: string, draft: BuilderRecordedProposalDraft) => {
    if (builderRecordedProposalsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError || projectSupplierContactsReadError || projectFilesReadError) return false;
    const current = builderRecordedProposals.find((item) => item.id === proposalId && item.projectId === activeProject.id);
    const currentRevision = current?.revisions.find((item) => item.id === current.currentRevisionId);
    if (
      !current
      || !currentRevision
      || draft.requestId !== current.target.requestId
      || draft.supplierContactId !== current.supplierSnapshot.supplierContactId
      || draft.projectFileId !== (current.reference.projectFileId ?? "")
    ) return false;
    const normalized = normalizeBuilderRecordedProposalRevisionDraft(draft, current.requestSnapshot, currentRevision.lines.map((line) => line.id));
    if (!normalized || !builderRecordedProposalHasMeaningfulInput(current.reference, normalized)) return false;
    const currentSemanticRevision = builderRecordedProposalRevisionSemanticValue(currentRevision);
    if (JSON.stringify(stablePurchaseRequestValue(currentSemanticRevision)) === JSON.stringify(stablePurchaseRequestValue(normalized))) return "unchanged" as const;
    const timestamp = new Date(Math.max(Date.now(), new Date(current.updatedAt).getTime())).toISOString();
    const version = current.version + 1;
    const revisionBase = { id: `builder-recorded-proposal-revision-${window.crypto.randomUUID()}`, version, createdAt: timestamp, ...normalized } satisfies Omit<BuilderRecordedProposalRevision, "fingerprint">;
    const revision = { ...revisionBase, fingerprint: builderRecordedProposalRevisionFingerprint(current.target, current.requestSnapshot, current.supplierSnapshot, current.reference, revisionBase) } satisfies BuilderRecordedProposalRevision;
    const updated = {
      ...current,
      currentRevisionId: revision.id,
      version,
      updatedAt: timestamp,
      history: [...current.history, { id: `builder-recorded-proposal-event-${window.crypto.randomUUID()}`, type: "updated", actor: "شما", at: timestamp, version }],
      revisions: [...current.revisions, revision],
    } satisfies BuilderRecordedProposalRecord;
    if (!parseBuilderRecordedProposal(
      updated,
      { records: projectPurchaseRequests, readError: false },
      { records: projectApprovals, readError: false },
      { records: projectSupplierContacts, readError: false },
      { records: projectFiles, readError: false },
    )) return false;
    return persistBuilderRecordedProposals(builderRecordedProposals.map((item) => item.id === current.id ? updated : item)) ? "updated" as const : false;
  };

  const persistBuilderProposalComparisons = (nextComparisons: BuilderProposalComparisonRecord[]) => {
    if (builderProposalComparisonsReadError || builderRecordedProposalsReadError) return false;
    try {
      if (nextComparisons.length === 0) window.localStorage.removeItem(projectBuilderProposalComparisonsStorageKey);
      else window.localStorage.setItem(projectBuilderProposalComparisonsStorageKey, JSON.stringify(nextComparisons));
    } catch {
      return false;
    }
    setBuilderProposalComparisons(nextComparisons);
    return true;
  };

  const createBuilderProposalComparison = (draft: BuilderProposalComparisonDraft) => {
    if (builderProposalComparisonsReadError || builderRecordedProposalsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError || projectSupplierContactsReadError) return null;
    if (builderProposalComparisons.length >= 1000 || activeBuilderProposalComparisons.length >= 100) return null;
    const inputs = normalizeBuilderProposalComparisonInputs(draft, activeBuilderRecordedProposals);
    if (!inputs) return null;
    const selectedProposals = inputs.map((input) => activeBuilderRecordedProposals.find((proposal) => proposal.id === input.proposalId)).filter((proposal): proposal is BuilderRecordedProposalRecord => Boolean(proposal));
    const firstProposal = selectedProposals[0];
    if (!firstProposal || selectedProposals.length !== inputs.length || selectedProposals.some((proposal) => proposal.target.requestKind !== "product" || builderProposalComparisonRequestKey(proposal) !== draft.requestKey || builderRecordedProposalEffectiveStatus(proposal, activeProjectPurchaseRequests, activeProjectApprovals, activeProjectSupplierContacts) !== "current")) return null;
    const derived = deriveBuilderProposalComparisonPayload(inputs, activeBuilderRecordedProposals);
    if (!derived) return null;
    const target = { requestId: firstProposal.target.requestId, requestVersion: firstProposal.target.requestVersion, reviewRevisionId: firstProposal.target.reviewRevisionId, reviewRevisionFingerprint: firstProposal.target.reviewRevisionFingerprint, requestKind: "product" as const };
    const requestSnapshot = structuredClone(firstProposal.requestSnapshot);
    const timestamp = new Date(Math.max(Date.now(), ...inputs.map((input) => new Date(selectedProposals.find((proposal) => proposal.id === input.proposalId)!.revisions.find((revision) => revision.id === input.proposalRevisionId)!.createdAt).getTime()))).toISOString();
    const comparisonId = `builder-proposal-comparison-${window.crypto.randomUUID()}`;
    const revisionBase = { id: `builder-proposal-comparison-revision-${window.crypto.randomUUID()}`, version: 1, createdAt: timestamp, inputs, results: derived.results, recommendation: derived.recommendation } satisfies Omit<BuilderProposalComparisonRevision, "fingerprint">;
    const revision = { ...revisionBase, fingerprint: builderProposalComparisonRevisionFingerprint({ projectId: activeProject.id, target, requestSnapshot }, revisionBase) } satisfies BuilderProposalComparisonRevision;
    const record = {
      schemaVersion: 1,
      id: comparisonId,
      projectId: activeProject.id,
      purpose: "compare-builder-recorded-product-proposals",
      target,
      requestSnapshot,
      currentRevisionId: revision.id,
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      externalEffect: "none",
      networkUsed: false,
      aiUsed: false,
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [{ id: `builder-proposal-comparison-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
      revisions: [revision],
    } satisfies BuilderProposalComparisonRecord;
    if (!parseBuilderProposalComparison(record, { records: builderRecordedProposals, readError: false })) return null;
    return persistBuilderProposalComparisons([...builderProposalComparisons, record]) ? comparisonId : null;
  };

  const updateBuilderProposalComparison = (comparisonId: string, draft: BuilderProposalComparisonDraft) => {
    if (builderProposalComparisonsReadError || builderRecordedProposalsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError || projectSupplierContactsReadError) return false;
    const current = builderProposalComparisons.find((comparison) => comparison.id === comparisonId && comparison.projectId === activeProject.id);
    const currentRevision = current?.revisions.find((revision) => revision.id === current.currentRevisionId);
    const targetKey = current ? [current.target.requestId, current.target.requestVersion, current.target.reviewRevisionId, current.target.reviewRevisionFingerprint].join(":") : "";
    if (!current || !currentRevision || draft.requestKey !== targetKey) return false;
    const inputs = normalizeBuilderProposalComparisonInputs(draft, activeBuilderRecordedProposals);
    if (!inputs) return false;
    const selectedProposals = inputs.map((input) => activeBuilderRecordedProposals.find((proposal) => proposal.id === input.proposalId)).filter((proposal): proposal is BuilderRecordedProposalRecord => Boolean(proposal));
    if (selectedProposals.length !== inputs.length || selectedProposals.some((proposal) => builderProposalComparisonRequestKey(proposal) !== targetKey || builderRecordedProposalEffectiveStatus(proposal, activeProjectPurchaseRequests, activeProjectApprovals, activeProjectSupplierContacts) !== "current")) return false;
    const derived = deriveBuilderProposalComparisonPayload(inputs, activeBuilderRecordedProposals);
    if (!derived) return false;
    const semantic = { inputs, results: derived.results, recommendation: derived.recommendation };
    if (JSON.stringify(stablePurchaseRequestValue(semantic)) === JSON.stringify(stablePurchaseRequestValue(builderProposalComparisonSemanticValue(currentRevision)))) return "unchanged" as const;
    const timestamp = new Date(Math.max(Date.now(), new Date(current.updatedAt).getTime(), ...inputs.map((input) => new Date(selectedProposals.find((proposal) => proposal.id === input.proposalId)!.revisions.find((revision) => revision.id === input.proposalRevisionId)!.createdAt).getTime()))).toISOString();
    const version = current.version + 1;
    const revisionBase = { id: `builder-proposal-comparison-revision-${window.crypto.randomUUID()}`, version, createdAt: timestamp, ...semantic } satisfies Omit<BuilderProposalComparisonRevision, "fingerprint">;
    if (current.version >= 100) return false;
    const revision = { ...revisionBase, fingerprint: builderProposalComparisonRevisionFingerprint({ projectId: current.projectId, target: current.target, requestSnapshot: current.requestSnapshot }, revisionBase) } satisfies BuilderProposalComparisonRevision;
    const updated = { ...current, currentRevisionId: revision.id, version, updatedAt: timestamp, history: [...current.history, { id: `builder-proposal-comparison-event-${window.crypto.randomUUID()}`, type: "updated", actor: "شما", at: timestamp, version }], revisions: [...current.revisions, revision] } satisfies BuilderProposalComparisonRecord;
    if (!parseBuilderProposalComparison(updated, { records: builderRecordedProposals, readError: false })) return false;
    return persistBuilderProposalComparisons(builderProposalComparisons.map((comparison) => comparison.id === current.id ? updated : comparison)) ? "updated" as const : false;
  };

  const persistBuilderProposalComparisonDecisions = (nextDecisions: BuilderProposalComparisonDecisionRecord[]) => {
    if (builderProposalComparisonDecisionsReadError || builderProposalComparisonsReadError) return false;
    try {
      if (nextDecisions.length === 0) window.localStorage.removeItem(projectBuilderProposalComparisonDecisionsStorageKey);
      else window.localStorage.setItem(projectBuilderProposalComparisonDecisionsStorageKey, JSON.stringify(nextDecisions));
    } catch {
      return false;
    }
    setBuilderProposalComparisonDecisions(nextDecisions);
    return true;
  };

  const upsertBuilderProposalComparisonDecision = (comparisonId: string, comparisonRevisionId: string, draft: BuilderProposalComparisonDecisionDraft) => {
    if (builderProposalComparisonDecisionsReadError || builderProposalComparisonsReadError) return false;
    const comparison = builderProposalComparisons.find((item) => item.id === comparisonId && item.projectId === activeProject.id);
    const comparisonRevision = comparison?.revisions.find((item) => item.id === comparisonRevisionId);
    const reason = normalizeBuilderRecordedProposalText(draft.reason, 500);
    const selectedProposalId = draft.outcome === "preferred-for-follow-up" ? draft.selectedProposalId : null;
    if (!comparison || !comparisonRevision || comparison.currentRevisionId !== comparisonRevision.id || reason === null || reason === undefined || !["preferred-for-follow-up", "needs-clarification", "no-selection"].includes(draft.outcome) || draft.outcome === "preferred-for-follow-up" && (!selectedProposalId || !comparisonRevision.inputs.some((input) => input.proposalId === selectedProposalId)) || draft.outcome !== "preferred-for-follow-up" && draft.selectedProposalId) return false;
    const target = { comparisonId: comparison.id, comparisonVersion: comparisonRevision.version, comparisonRevisionId: comparisonRevision.id, comparisonRevisionFingerprint: comparisonRevision.fingerprint };
    const current = builderProposalComparisonDecisions.find((decision) => decision.projectId === activeProject.id && decision.target.comparisonId === comparison.id && decision.target.comparisonRevisionId === comparisonRevision.id);
    const currentRevision = current?.revisions.find((revision) => revision.id === current.currentRevisionId);
    if (current ? current.version >= 100 : builderProposalComparisonDecisions.length >= 1000 || activeBuilderProposalComparisonDecisions.length >= 100) return false;
    if (currentRevision && currentRevision.outcome === draft.outcome && currentRevision.selectedProposalId === selectedProposalId && currentRevision.reason === reason) return "unchanged" as const;
    const timestamp = new Date(Math.max(Date.now(), new Date(comparisonRevision.createdAt).getTime(), current ? new Date(current.updatedAt).getTime() : 0)).toISOString();
    const version = current ? current.version + 1 : 1;
    const revisionBase = { id: `builder-proposal-comparison-decision-revision-${window.crypto.randomUUID()}`, version, createdAt: timestamp, outcome: draft.outcome, selectedProposalId, reason } satisfies Omit<BuilderProposalComparisonDecisionRevision, "fingerprint">;
    const revision = { ...revisionBase, fingerprint: builderProposalComparisonDecisionRevisionFingerprint(target, revisionBase) } satisfies BuilderProposalComparisonDecisionRevision;
    const record = current ? {
      ...current,
      currentRevisionId: revision.id,
      version,
      updatedAt: timestamp,
      history: [...current.history, { id: `builder-proposal-comparison-decision-event-${window.crypto.randomUUID()}`, type: "updated", actor: "شما", at: timestamp, version }],
      revisions: [...current.revisions, revision],
    } satisfies BuilderProposalComparisonDecisionRecord : {
      schemaVersion: 1,
      id: `builder-proposal-comparison-decision-${window.crypto.randomUUID()}`,
      projectId: activeProject.id,
      purpose: "record-local-proposal-comparison-decision",
      target,
      currentRevisionId: revision.id,
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      externalEffect: "none",
      sendAuthorized: false,
      purchaseAuthorized: false,
      supplierNotified: false,
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [{ id: `builder-proposal-comparison-decision-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
      revisions: [revision],
    } satisfies BuilderProposalComparisonDecisionRecord;
    if (!parseBuilderProposalComparisonDecision(record, { records: builderProposalComparisons, readError: false })) return false;
    const next = current ? builderProposalComparisonDecisions.map((decision) => decision.id === current.id ? record : decision) : [...builderProposalComparisonDecisions, record];
    return persistBuilderProposalComparisonDecisions(next) ? current ? "updated" as const : "created" as const : false;
  };

  const persistBuilderServiceProposalComparisons = (nextComparisons: BuilderServiceProposalComparisonRecord[]) => {
    if (builderServiceProposalComparisonsReadError || builderRecordedProposalsReadError || projectPurchaseRequestsReadError) return false;
    try {
      if (nextComparisons.length === 0) window.localStorage.removeItem(projectBuilderServiceProposalComparisonsStorageKey);
      else window.localStorage.setItem(projectBuilderServiceProposalComparisonsStorageKey, JSON.stringify(nextComparisons));
    } catch {
      return false;
    }
    setBuilderServiceProposalComparisons(nextComparisons);
    return true;
  };

  const createBuilderServiceProposalComparison = (draft: BuilderServiceProposalComparisonDraft) => {
    if (builderServiceProposalComparisonsReadError || builderRecordedProposalsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError || projectSupplierContactsReadError) return null;
    if (builderServiceProposalComparisons.length >= 1000 || activeBuilderServiceProposalComparisons.length >= 100) return null;
    const selectedDraft = draft.proposals.find((item) => item.selected);
    const firstProposal = selectedDraft ? activeBuilderRecordedProposals.find((proposal) => proposal.id === selectedDraft.proposalId && proposal.target.requestKind === "service") : null;
    const request = firstProposal ? activeProjectPurchaseRequests.find((item) => item.id === firstProposal.target.requestId) : null;
    const reviewRevision = request?.reviewRevisions.find((item) => item.id === firstProposal?.target.reviewRevisionId && item.requestVersion === firstProposal?.target.requestVersion && item.fingerprint === firstProposal?.target.reviewRevisionFingerprint);
    const requestSnapshot = reviewRevision ? builderServiceProposalComparisonRequestSnapshotFromReview(reviewRevision.snapshot) : null;
    if (!firstProposal || !request || !reviewRevision || !requestSnapshot || builderProposalComparisonRequestKey(firstProposal) !== draft.requestKey) return null;
    const inputs = normalizeBuilderServiceProposalComparisonInputs(draft, activeBuilderRecordedProposals, requestSnapshot);
    if (!inputs) return null;
    const selectedProposals = inputs.map((input) => activeBuilderRecordedProposals.find((proposal) => proposal.id === input.proposalId)).filter((proposal): proposal is BuilderRecordedProposalRecord => Boolean(proposal));
    if (selectedProposals.length !== inputs.length || selectedProposals.some((proposal) => proposal.target.requestKind !== "service" || builderProposalComparisonRequestKey(proposal) !== draft.requestKey || builderRecordedProposalEffectiveStatus(proposal, activeProjectPurchaseRequests, activeProjectApprovals, activeProjectSupplierContacts) !== "current")) return null;
    const derived = deriveBuilderServiceProposalComparisonPayload(inputs, activeBuilderRecordedProposals, requestSnapshot);
    if (!derived) return null;
    const target = { requestId: firstProposal.target.requestId, requestVersion: firstProposal.target.requestVersion, reviewRevisionId: firstProposal.target.reviewRevisionId, reviewRevisionFingerprint: firstProposal.target.reviewRevisionFingerprint, requestKind: "service" as const };
    const timestamp = new Date(Math.max(Date.now(), new Date(reviewRevision.createdAt).getTime(), ...inputs.map((input) => new Date(selectedProposals.find((proposal) => proposal.id === input.proposalId)!.revisions.find((revision) => revision.id === input.proposalRevisionId)!.createdAt).getTime()))).toISOString();
    const comparisonId = `builder-service-proposal-comparison-${window.crypto.randomUUID()}`;
    const revisionBase = { id: `builder-service-proposal-comparison-revision-${window.crypto.randomUUID()}`, version: 1, createdAt: timestamp, inputs, results: derived.results, summary: derived.summary } satisfies Omit<BuilderServiceProposalComparisonRevision, "fingerprint">;
    const revision = { ...revisionBase, fingerprint: builderServiceProposalComparisonRevisionFingerprint({ projectId: activeProject.id, target, requestSnapshot }, revisionBase) } satisfies BuilderServiceProposalComparisonRevision;
    const record = {
      schemaVersion: 1,
      id: comparisonId,
      projectId: activeProject.id,
      purpose: "compare-builder-recorded-service-proposals",
      target,
      requestSnapshot,
      currentRevisionId: revision.id,
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      externalEffect: "none",
      networkUsed: false,
      aiUsed: false,
      scoringUsed: false,
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [{ id: `builder-service-proposal-comparison-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
      revisions: [revision],
    } satisfies BuilderServiceProposalComparisonRecord;
    if (!parseBuilderServiceProposalComparison(record, { records: builderRecordedProposals, readError: false }, { records: projectPurchaseRequests, readError: false })) return null;
    return persistBuilderServiceProposalComparisons([...builderServiceProposalComparisons, record]) ? comparisonId : null;
  };

  const updateBuilderServiceProposalComparison = (comparisonId: string, draft: BuilderServiceProposalComparisonDraft) => {
    if (builderServiceProposalComparisonsReadError || builderRecordedProposalsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError || projectSupplierContactsReadError) return false;
    const current = builderServiceProposalComparisons.find((comparison) => comparison.id === comparisonId && comparison.projectId === activeProject.id);
    const currentRevision = current?.revisions.find((revision) => revision.id === current.currentRevisionId);
    const targetKey = current ? [current.target.requestId, current.target.requestVersion, current.target.reviewRevisionId, current.target.reviewRevisionFingerprint].join(":") : "";
    if (!current || !currentRevision || draft.requestKey !== targetKey) return false;
    const inputs = normalizeBuilderServiceProposalComparisonInputs(draft, activeBuilderRecordedProposals, current.requestSnapshot);
    if (!inputs) return false;
    const selectedProposals = inputs.map((input) => activeBuilderRecordedProposals.find((proposal) => proposal.id === input.proposalId)).filter((proposal): proposal is BuilderRecordedProposalRecord => Boolean(proposal));
    if (selectedProposals.length !== inputs.length || selectedProposals.some((proposal) => proposal.target.requestKind !== "service" || builderProposalComparisonRequestKey(proposal) !== targetKey || builderRecordedProposalEffectiveStatus(proposal, activeProjectPurchaseRequests, activeProjectApprovals, activeProjectSupplierContacts) !== "current")) return false;
    const derived = deriveBuilderServiceProposalComparisonPayload(inputs, activeBuilderRecordedProposals, current.requestSnapshot);
    if (!derived) return false;
    const semantic = { inputs, results: derived.results, summary: derived.summary };
    if (JSON.stringify(stablePurchaseRequestValue(semantic)) === JSON.stringify(stablePurchaseRequestValue(builderServiceProposalComparisonSemanticValue(currentRevision)))) return "unchanged" as const;
    if (current.version >= 100) return false;
    const timestamp = new Date(Math.max(Date.now(), new Date(current.updatedAt).getTime(), ...inputs.map((input) => new Date(selectedProposals.find((proposal) => proposal.id === input.proposalId)!.revisions.find((revision) => revision.id === input.proposalRevisionId)!.createdAt).getTime()))).toISOString();
    const version = current.version + 1;
    const revisionBase = { id: `builder-service-proposal-comparison-revision-${window.crypto.randomUUID()}`, version, createdAt: timestamp, ...semantic } satisfies Omit<BuilderServiceProposalComparisonRevision, "fingerprint">;
    const revision = { ...revisionBase, fingerprint: builderServiceProposalComparisonRevisionFingerprint({ projectId: current.projectId, target: current.target, requestSnapshot: current.requestSnapshot }, revisionBase) } satisfies BuilderServiceProposalComparisonRevision;
    const updated = { ...current, currentRevisionId: revision.id, version, updatedAt: timestamp, history: [...current.history, { id: `builder-service-proposal-comparison-event-${window.crypto.randomUUID()}`, type: "updated", actor: "شما", at: timestamp, version }], revisions: [...current.revisions, revision] } satisfies BuilderServiceProposalComparisonRecord;
    if (!parseBuilderServiceProposalComparison(updated, { records: builderRecordedProposals, readError: false }, { records: projectPurchaseRequests, readError: false })) return false;
    return persistBuilderServiceProposalComparisons(builderServiceProposalComparisons.map((comparison) => comparison.id === current.id ? updated : comparison)) ? "updated" as const : false;
  };

  const persistBuilderServiceProposalComparisonDecisions = (nextDecisions: BuilderServiceProposalComparisonDecisionRecord[]) => {
    if (builderServiceProposalComparisonDecisionsReadError || builderServiceProposalComparisonsReadError) return false;
    try {
      if (nextDecisions.length === 0) window.localStorage.removeItem(projectBuilderServiceProposalComparisonDecisionsStorageKey);
      else window.localStorage.setItem(projectBuilderServiceProposalComparisonDecisionsStorageKey, JSON.stringify(nextDecisions));
    } catch {
      return false;
    }
    setBuilderServiceProposalComparisonDecisions(nextDecisions);
    return true;
  };

  const upsertBuilderServiceProposalComparisonDecision = (comparisonId: string, comparisonRevisionId: string, draft: BuilderServiceProposalComparisonDecisionDraft) => {
    if (builderServiceProposalComparisonDecisionsReadError || builderServiceProposalComparisonsReadError) return false;
    const comparison = builderServiceProposalComparisons.find((item) => item.id === comparisonId && item.projectId === activeProject.id);
    const comparisonRevision = comparison?.revisions.find((item) => item.id === comparisonRevisionId);
    const reason = normalizeBuilderRecordedProposalText(draft.reason, 500);
    const selectedProposalId = draft.outcome === "preferred-for-follow-up" ? draft.selectedProposalId : null;
    if (!comparison || !comparisonRevision || comparison.currentRevisionId !== comparisonRevision.id || builderServiceProposalComparisonEffectiveStatus(comparison, activeBuilderRecordedProposals, activeProjectPurchaseRequests, activeProjectApprovals, activeProjectSupplierContacts, comparisonRevision.id) !== "current" || reason === null || reason === undefined || !["preferred-for-follow-up", "needs-clarification", "no-selection"].includes(draft.outcome) || draft.outcome === "preferred-for-follow-up" && (!selectedProposalId || !comparisonRevision.inputs.some((input) => input.proposalId === selectedProposalId)) || draft.outcome !== "preferred-for-follow-up" && draft.selectedProposalId) return false;
    const target = { comparisonId: comparison.id, comparisonVersion: comparisonRevision.version, comparisonRevisionId: comparisonRevision.id, comparisonRevisionFingerprint: comparisonRevision.fingerprint };
    const current = builderServiceProposalComparisonDecisions.find((decision) => decision.projectId === activeProject.id && decision.target.comparisonId === comparison.id && decision.target.comparisonRevisionId === comparisonRevision.id);
    const currentRevision = current?.revisions.find((revision) => revision.id === current.currentRevisionId);
    if (current ? current.version >= 100 : builderServiceProposalComparisonDecisions.length >= 1000 || activeBuilderServiceProposalComparisonDecisions.length >= 100) return false;
    if (currentRevision && currentRevision.outcome === draft.outcome && currentRevision.selectedProposalId === selectedProposalId && currentRevision.reason === reason) return "unchanged" as const;
    const timestamp = new Date(Math.max(Date.now(), new Date(comparisonRevision.createdAt).getTime(), current ? new Date(current.updatedAt).getTime() : 0)).toISOString();
    const version = current ? current.version + 1 : 1;
    const revisionBase = { id: `builder-service-proposal-comparison-decision-revision-${window.crypto.randomUUID()}`, version, createdAt: timestamp, outcome: draft.outcome, selectedProposalId, reason } satisfies Omit<BuilderServiceProposalComparisonDecisionRevision, "fingerprint">;
    const revision = { ...revisionBase, fingerprint: builderServiceProposalComparisonDecisionRevisionFingerprint(target, revisionBase) } satisfies BuilderServiceProposalComparisonDecisionRevision;
    const record = current ? {
      ...current,
      currentRevisionId: revision.id,
      version,
      updatedAt: timestamp,
      history: [...current.history, { id: `builder-service-proposal-comparison-decision-event-${window.crypto.randomUUID()}`, type: "updated", actor: "شما", at: timestamp, version }],
      revisions: [...current.revisions, revision],
    } satisfies BuilderServiceProposalComparisonDecisionRecord : {
      schemaVersion: 1,
      id: `builder-service-proposal-comparison-decision-${window.crypto.randomUUID()}`,
      projectId: activeProject.id,
      purpose: "record-local-service-proposal-comparison-decision",
      target,
      currentRevisionId: revision.id,
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      externalEffect: "none",
      sendAuthorized: false,
      purchaseAuthorized: false,
      supplierNotified: false,
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [{ id: `builder-service-proposal-comparison-decision-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
      revisions: [revision],
    } satisfies BuilderServiceProposalComparisonDecisionRecord;
    if (!parseBuilderServiceProposalComparisonDecision(record, { records: builderServiceProposalComparisons, readError: false })) return false;
    const next = current ? builderServiceProposalComparisonDecisions.map((decision) => decision.id === current.id ? record : decision) : [...builderServiceProposalComparisonDecisions, record];
    return persistBuilderServiceProposalComparisonDecisions(next) ? current ? "updated" as const : "created" as const : false;
  };

  const negotiationDraftsStorageLocked = builderNegotiationDraftsReadError
    || builderProposalComparisonsReadError
    || builderServiceProposalComparisonsReadError
    || builderRecordedProposalsReadError
    || projectPurchaseRequestsReadError
    || projectApprovalsReadError
    || projectSupplierContactsReadError;

  const persistBuilderNegotiationDrafts = (nextDrafts: BuilderNegotiationDraftRecord[]) => {
    if (negotiationDraftsStorageLocked) return false;
    try {
      if (nextDrafts.length === 0) window.localStorage.removeItem(projectBuilderNegotiationDraftsStorageKey);
      else window.localStorage.setItem(projectBuilderNegotiationDraftsStorageKey, JSON.stringify(nextDrafts));
    } catch {
      return false;
    }
    setBuilderNegotiationDrafts(nextDrafts);
    return true;
  };

  const createBuilderNegotiationDraft = (draft: BuilderNegotiationDraftForm) => {
    if (negotiationDraftsStorageLocked) return null;
    if (builderNegotiationDrafts.length >= 1000 || activeBuilderNegotiationDrafts.length >= 100) return null;
    const purpose = normalizeBuilderRecordedProposalText(draft.purpose, 300);
    const message = normalizeBuilderRecordedProposalText(draft.message, 800);
    if (!purpose || !message) return null;
    const options = builderNegotiationDraftTargetOptions(activeProject.id, activeBuilderProposalComparisons, activeBuilderServiceProposalComparisons, activeBuilderRecordedProposals, activeProjectPurchaseRequests, activeProjectApprovals, activeProjectSupplierContacts);
    const option = options.find((item) => item.key === draft.targetKey);
    if (!option || builderNegotiationDrafts.some((item) => item.projectId === activeProject.id && builderNegotiationDraftTargetKey(item.target) === option.key)) return null;
    const timestamp = new Date(Math.max(Date.now(), new Date(option.sourceCreatedAt).getTime())).toISOString();
    const revisionBase = {
      id: `builder-negotiation-draft-revision-${window.crypto.randomUUID()}`,
      version: 1,
      createdAt: timestamp,
      purpose,
      message,
    } satisfies Omit<BuilderNegotiationDraftRevision, "fingerprint">;
    const revision = { ...revisionBase, fingerprint: builderNegotiationDraftRevisionFingerprint(option.target, revisionBase) } satisfies BuilderNegotiationDraftRevision;
    const record = {
      schemaVersion: 1,
      id: `builder-negotiation-draft-${window.crypto.randomUUID()}`,
      projectId: activeProject.id,
      purpose: "record-local-post-proposal-negotiation-question",
      status: "draft",
      target: structuredClone(option.target),
      source: "ثبت مستقیم سازنده",
      visibility: "خصوصی پروژه",
      localStatus: "پیش‌نویس محلی",
      externalEffect: "none",
      networkUsed: false,
      aiUsed: false,
      sendAuthorized: false,
      supplierNotified: false,
      sharedWithSupplier: false,
      externalActionAttempted: false,
      currentRevisionId: revision.id,
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [{ id: `builder-negotiation-draft-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
      revisions: [revision],
    } satisfies BuilderNegotiationDraftRecord;
    if (!parseBuilderNegotiationDraft(record, { records: builderProposalComparisons, readError: false }, { records: builderServiceProposalComparisons, readError: false })) return null;
    return persistBuilderNegotiationDrafts([...builderNegotiationDrafts, record]) ? record.id : null;
  };

  const updateBuilderNegotiationDraft = (draftId: string, draft: BuilderNegotiationDraftForm) => {
    if (negotiationDraftsStorageLocked) return false;
    const current = builderNegotiationDrafts.find((item) => item.id === draftId && item.projectId === activeProject.id);
    const currentRevision = current?.revisions.find((item) => item.id === current.currentRevisionId);
    const purpose = normalizeBuilderRecordedProposalText(draft.purpose, 300);
    const message = normalizeBuilderRecordedProposalText(draft.message, 800);
    if (
      !current
      || !currentRevision
      || draft.targetKey !== builderNegotiationDraftTargetKey(current.target)
      || !purpose
      || !message
      || current.version >= 100
      || builderNegotiationDraftEffectiveStatus(current, activeBuilderProposalComparisons, activeBuilderServiceProposalComparisons, activeBuilderRecordedProposals, activeProjectPurchaseRequests, activeProjectApprovals, activeProjectSupplierContacts) !== "current"
    ) return false;
    if (currentRevision.purpose === purpose && currentRevision.message === message) return "unchanged" as const;
    const evidence = builderNegotiationDraftTargetEvidence(activeProject.id, current.target, activeBuilderProposalComparisons, activeBuilderServiceProposalComparisons);
    if (!evidence) return false;
    const timestamp = new Date(Math.max(Date.now(), new Date(current.updatedAt).getTime(), new Date(evidence.sourceCreatedAt).getTime())).toISOString();
    const version = current.version + 1;
    const revisionBase = {
      id: `builder-negotiation-draft-revision-${window.crypto.randomUUID()}`,
      version,
      createdAt: timestamp,
      purpose,
      message,
    } satisfies Omit<BuilderNegotiationDraftRevision, "fingerprint">;
    const revision = { ...revisionBase, fingerprint: builderNegotiationDraftRevisionFingerprint(current.target, revisionBase) } satisfies BuilderNegotiationDraftRevision;
    const updated = {
      ...current,
      currentRevisionId: revision.id,
      version,
      updatedAt: timestamp,
      history: [...current.history, { id: `builder-negotiation-draft-event-${window.crypto.randomUUID()}`, type: "updated", actor: "شما", at: timestamp, version }],
      revisions: [...current.revisions, revision],
    } satisfies BuilderNegotiationDraftRecord;
    if (!parseBuilderNegotiationDraft(updated, { records: builderProposalComparisons, readError: false }, { records: builderServiceProposalComparisons, readError: false })) return false;
    return persistBuilderNegotiationDrafts(builderNegotiationDrafts.map((item) => item.id === current.id ? updated : item)) ? "updated" as const : false;
  };

  const manualNegotiationResponsesStorageLocked = builderManualNegotiationResponsesReadError
    || builderNegotiationDraftsReadError
    || builderProposalComparisonsReadError
    || builderServiceProposalComparisonsReadError
    || builderRecordedProposalsReadError
    || projectPurchaseRequestsReadError
    || projectApprovalsReadError
    || projectSupplierContactsReadError;

  const persistBuilderManualNegotiationResponses = (nextResponses: BuilderManualNegotiationResponseRecord[]) => {
    if (manualNegotiationResponsesStorageLocked) return false;
    try {
      if (nextResponses.length === 0) window.localStorage.removeItem(projectBuilderManualNegotiationResponsesStorageKey);
      else window.localStorage.setItem(projectBuilderManualNegotiationResponsesStorageKey, JSON.stringify(nextResponses));
    } catch {
      return false;
    }
    setBuilderManualNegotiationResponses(nextResponses);
    return true;
  };

  const createBuilderManualNegotiationResponse = (draftId: string, draftRevisionId: string, form: BuilderManualNegotiationResponseForm) => {
    if (manualNegotiationResponsesStorageLocked) return null;
    if (builderManualNegotiationResponses.length >= 1000 || activeBuilderManualNegotiationResponses.length >= 100) return null;
    const questionDraft = activeBuilderNegotiationDrafts.find((item) => item.id === draftId);
    const questionRevision = questionDraft?.revisions.find((item) => item.id === draftRevisionId);
    const responseText = normalizeBuilderRecordedProposalText(form.responseText, 2000);
    if (
      !questionDraft
      || !questionRevision
      || !responseText
      || questionDraft.currentRevisionId !== questionRevision.id
      || builderNegotiationDraftEffectiveStatus(questionDraft, activeBuilderProposalComparisons, activeBuilderServiceProposalComparisons, activeBuilderRecordedProposals, activeProjectPurchaseRequests, activeProjectApprovals, activeProjectSupplierContacts) !== "current"
    ) return null;
    const target = {
      negotiationDraftId: questionDraft.id,
      negotiationDraftRevisionId: questionRevision.id,
      negotiationDraftRevisionVersion: questionRevision.version,
      negotiationDraftRevisionFingerprint: questionRevision.fingerprint,
    } satisfies BuilderManualNegotiationResponseTarget;
    if (builderManualNegotiationResponses.some((item) => item.projectId === activeProject.id && builderManualNegotiationResponseTargetKey(item.target) === builderManualNegotiationResponseTargetKey(target))) return null;
    const questionSnapshot = {
      purpose: questionRevision.purpose,
      message: questionRevision.message,
      createdAt: questionRevision.createdAt,
      negotiationTarget: structuredClone(questionDraft.target),
    } satisfies BuilderManualNegotiationResponseQuestionSnapshot;
    const timestamp = new Date(Math.max(Date.now(), new Date(questionRevision.createdAt).getTime())).toISOString();
    const revisionBase = {
      id: `builder-manual-negotiation-response-revision-${window.crypto.randomUUID()}`,
      version: 1,
      createdAt: timestamp,
      responseText,
    } satisfies Omit<BuilderManualNegotiationResponseRevision, "fingerprint">;
    const revision = { ...revisionBase, fingerprint: builderManualNegotiationResponseRevisionFingerprint(target, questionSnapshot, revisionBase) } satisfies BuilderManualNegotiationResponseRevision;
    const record = {
      schemaVersion: 1,
      id: `builder-manual-negotiation-response-${window.crypto.randomUUID()}`,
      projectId: activeProject.id,
      purpose: "record-local-builder-transcribed-negotiation-response",
      status: "local-transcription",
      target,
      questionSnapshot,
      source: "ثبت دستی سازنده",
      networkStatus: "خارج از شبکه چیدا",
      supplierAuthenticated: false,
      authenticityVerified: false,
      questionSentThroughChida: false,
      receivedThroughChida: false,
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      externalEffect: "none",
      networkUsed: false,
      aiUsed: false,
      sendAuthorized: false,
      supplierNotified: false,
      sharedWithSupplier: false,
      externalActionAttempted: false,
      currentRevisionId: revision.id,
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [{ id: `builder-manual-negotiation-response-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
      revisions: [revision],
    } satisfies BuilderManualNegotiationResponseRecord;
    if (!parseBuilderManualNegotiationResponse(record, { records: builderNegotiationDrafts, readError: false })) return null;
    return persistBuilderManualNegotiationResponses([...builderManualNegotiationResponses, record]) ? record.id : null;
  };

  const updateBuilderManualNegotiationResponse = (responseId: string, form: BuilderManualNegotiationResponseForm) => {
    if (manualNegotiationResponsesStorageLocked) return false;
    const current = builderManualNegotiationResponses.find((item) => item.id === responseId && item.projectId === activeProject.id);
    const currentRevision = current?.revisions.find((item) => item.id === current.currentRevisionId);
    const responseText = normalizeBuilderRecordedProposalText(form.responseText, 2000);
    if (
      !current
      || !currentRevision
      || !responseText
      || current.version >= 100
      || builderManualNegotiationResponseEffectiveStatus(current, activeBuilderNegotiationDrafts, activeBuilderProposalComparisons, activeBuilderServiceProposalComparisons, activeBuilderRecordedProposals, activeProjectPurchaseRequests, activeProjectApprovals, activeProjectSupplierContacts) !== "current"
    ) return false;
    if (currentRevision.responseText === responseText) return "unchanged" as const;
    const evidence = builderManualNegotiationResponseQuestionEvidence(activeProject.id, current.target, current.questionSnapshot, activeBuilderNegotiationDrafts);
    if (!evidence) return false;
    const timestamp = new Date(Math.max(Date.now(), new Date(current.updatedAt).getTime(), new Date(evidence.revision.createdAt).getTime())).toISOString();
    const version = current.version + 1;
    const revisionBase = {
      id: `builder-manual-negotiation-response-revision-${window.crypto.randomUUID()}`,
      version,
      createdAt: timestamp,
      responseText,
    } satisfies Omit<BuilderManualNegotiationResponseRevision, "fingerprint">;
    const revision = { ...revisionBase, fingerprint: builderManualNegotiationResponseRevisionFingerprint(current.target, current.questionSnapshot, revisionBase) } satisfies BuilderManualNegotiationResponseRevision;
    const updated = {
      ...current,
      currentRevisionId: revision.id,
      version,
      updatedAt: timestamp,
      history: [...current.history, { id: `builder-manual-negotiation-response-event-${window.crypto.randomUUID()}`, type: "updated", actor: "شما", at: timestamp, version }],
      revisions: [...current.revisions, revision],
    } satisfies BuilderManualNegotiationResponseRecord;
    if (!parseBuilderManualNegotiationResponse(updated, { records: builderNegotiationDrafts, readError: false })) return false;
    return persistBuilderManualNegotiationResponses(builderManualNegotiationResponses.map((item) => item.id === current.id ? updated : item)) ? "updated" as const : false;
  };

  const manualNegotiationResponseReviewsStorageLocked = builderManualNegotiationResponseReviewsReadError
    || builderManualNegotiationResponsesReadError;

  const persistBuilderManualNegotiationResponseReviews = (nextReviews: BuilderManualNegotiationResponseReviewRecord[]) => {
    if (manualNegotiationResponseReviewsStorageLocked) return false;
    try {
      if (nextReviews.length === 0) window.localStorage.removeItem(projectBuilderManualNegotiationResponseReviewsStorageKey);
      else window.localStorage.setItem(projectBuilderManualNegotiationResponseReviewsStorageKey, JSON.stringify(nextReviews));
    } catch {
      return false;
    }
    setBuilderManualNegotiationResponseReviews(nextReviews);
    return true;
  };

  const upsertBuilderManualNegotiationResponseReview = (
    responseId: string,
    responseRevisionId: string,
    form: BuilderManualNegotiationResponseReviewForm,
  ) => {
    if (manualNegotiationResponseReviewsStorageLocked) return false;
    const response = activeBuilderManualNegotiationResponses.find((item) => item.id === responseId);
    const responseRevision = response?.revisions.find((item) => item.id === responseRevisionId);
    const allowedOutcomes: BuilderManualNegotiationResponseReviewOutcome[] = ["appears-addressed", "needs-clarification", "potential-conflict"];
    const outcome = form.outcome as BuilderManualNegotiationResponseReviewOutcome;
    const reason = normalizeBuilderRecordedProposalText(form.reason, 1200);
    if (
      !response
      || !responseRevision
      || response.currentRevisionId !== responseRevision.id
      || !allowedOutcomes.includes(outcome)
      || !reason
      || builderManualNegotiationResponseEffectiveStatus(response, activeBuilderNegotiationDrafts, activeBuilderProposalComparisons, activeBuilderServiceProposalComparisons, activeBuilderRecordedProposals, activeProjectPurchaseRequests, activeProjectApprovals, activeProjectSupplierContacts) !== "current"
    ) return false;
    const target = {
      manualNegotiationResponseId: response.id,
      manualNegotiationResponseRevisionId: responseRevision.id,
      manualNegotiationResponseRevisionVersion: responseRevision.version,
      manualNegotiationResponseRevisionFingerprint: responseRevision.fingerprint,
    } satisfies BuilderManualNegotiationResponseReviewTarget;
    const existing = builderManualNegotiationResponseReviews.find((item) => item.projectId === activeProject.id && builderManualNegotiationResponseReviewTargetKey(item.target) === builderManualNegotiationResponseReviewTargetKey(target)) ?? null;
    if (!existing) {
      if (builderManualNegotiationResponseReviews.length >= 1000 || activeBuilderManualNegotiationResponseReviews.length >= 100) return false;
      const timestamp = new Date(Math.max(Date.now(), new Date(responseRevision.createdAt).getTime())).toISOString();
      const revisionBase = {
        id: `builder-manual-negotiation-response-review-revision-${window.crypto.randomUUID()}`,
        version: 1,
        createdAt: timestamp,
        outcome,
        reason,
      } satisfies Omit<BuilderManualNegotiationResponseReviewRevision, "fingerprint">;
      const revision = { ...revisionBase, fingerprint: builderManualNegotiationResponseReviewRevisionFingerprint(activeProject.id, target, revisionBase) } satisfies BuilderManualNegotiationResponseReviewRevision;
      const record = {
        schemaVersion: 1,
        id: `builder-manual-negotiation-response-review-${window.crypto.randomUUID()}`,
        projectId: activeProject.id,
        purpose: "record-local-builder-manual-response-review",
        status: "manual-review",
        target,
        source: "بازبینی مستقیم سازنده",
        reviewMethod: "manual",
        visibility: "خصوصی پروژه",
        localStatus: "ثبت محلی",
        automatedDetectionUsed: false,
        aiUsed: false,
        networkUsed: false,
        authenticityVerified: false,
        externalEffect: "none",
        sendAuthorized: false,
        supplierNotified: false,
        sharedWithSupplier: false,
        externalActionAttempted: false,
        currentRevisionId: revision.id,
        version: 1,
        createdAt: timestamp,
        updatedAt: timestamp,
        history: [{ id: `builder-manual-negotiation-response-review-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
        revisions: [revision],
      } satisfies BuilderManualNegotiationResponseReviewRecord;
      if (!parseBuilderManualNegotiationResponseReview(record, { records: builderManualNegotiationResponses, readError: false })) return false;
      return persistBuilderManualNegotiationResponseReviews([...builderManualNegotiationResponseReviews, record]) ? "created" as const : false;
    }
    const currentRevision = existing.revisions.find((item) => item.id === existing.currentRevisionId);
    if (
      !currentRevision
      || existing.version >= 100
      || builderManualNegotiationResponseReviewEffectiveStatus(existing, activeBuilderManualNegotiationResponses, activeBuilderNegotiationDrafts, activeBuilderProposalComparisons, activeBuilderServiceProposalComparisons, activeBuilderRecordedProposals, activeProjectPurchaseRequests, activeProjectApprovals, activeProjectSupplierContacts) !== "current"
    ) return false;
    if (currentRevision.outcome === outcome && currentRevision.reason === reason) return "unchanged" as const;
    const timestamp = new Date(Math.max(Date.now(), new Date(existing.updatedAt).getTime(), new Date(responseRevision.createdAt).getTime())).toISOString();
    const version = existing.version + 1;
    const revisionBase = {
      id: `builder-manual-negotiation-response-review-revision-${window.crypto.randomUUID()}`,
      version,
      createdAt: timestamp,
      outcome,
      reason,
    } satisfies Omit<BuilderManualNegotiationResponseReviewRevision, "fingerprint">;
    const revision = { ...revisionBase, fingerprint: builderManualNegotiationResponseReviewRevisionFingerprint(activeProject.id, existing.target, revisionBase) } satisfies BuilderManualNegotiationResponseReviewRevision;
    const updated = {
      ...existing,
      currentRevisionId: revision.id,
      version,
      updatedAt: timestamp,
      history: [...existing.history, { id: `builder-manual-negotiation-response-review-event-${window.crypto.randomUUID()}`, type: "updated", actor: "شما", at: timestamp, version }],
      revisions: [...existing.revisions, revision],
    } satisfies BuilderManualNegotiationResponseReviewRecord;
    if (!parseBuilderManualNegotiationResponseReview(updated, { records: builderManualNegotiationResponses, readError: false })) return false;
    return persistBuilderManualNegotiationResponseReviews(builderManualNegotiationResponseReviews.map((item) => item.id === existing.id ? updated : item)) ? "updated" as const : false;
  };

  const leaveProjectWorkspace = () => {
    projectWorkspaceScrollPositions.current.delete(activeProject.id);
    setView("chat");
  };

  if (view === "project") {
    return (
      <ProjectWorkspace
        project={activeProject}
        fileCount={activeProjectFiles.length}
        imageCount={activeProjectImages.length}
        memoryCount={activeProjectMemories.length}
        purchaseRequestCount={activeProjectPurchaseRequests.length}
        proposalCount={activeBuilderRecordedProposals.length}
        filesReadError={projectFilesReadError}
        memoriesReadError={projectMemoriesReadError}
        purchaseRequestsReadError={projectPurchaseRequestsReadError}
        proposalsReadError={builderRecordedProposalsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError || projectSupplierContactsReadError || projectFilesReadError}
        initialScrollTop={projectWorkspaceScrollPositions.current.get(activeProject.id) ?? 0}
        onBack={leaveProjectWorkspace}
        onContinue={leaveProjectWorkspace}
        onOpenFiles={() => openProjectFiles("project")}
        onOpenGallery={() => {
          const projectScroll = document.querySelector<HTMLElement>(".project-workspace-scroll .mobile-scroll");
          if (projectScroll) projectWorkspaceScrollPositions.current.set(activeProject.id, projectScroll.scrollTop);
          setView("gallery");
        }}
        onOpenMemory={() => {
          const projectScroll = document.querySelector<HTMLElement>(".project-workspace-scroll .mobile-scroll");
          if (projectScroll) projectWorkspaceScrollPositions.current.set(activeProject.id, projectScroll.scrollTop);
          openProjectMemory("project");
        }}
        onOpenPurchaseRequests={() => openProjectPurchaseRequests("project")}
        onOpenProposals={() => openProjectProposals("project")}
        onUpdate={(draft) => onProjectUpdate(activeProject.id, draft)}
      />
    );
  }

  if (view === "files") {
    return (
      <ProjectFilesView
        project={activeProject}
        files={activeProjectFiles}
        storageLocked={projectFilesReadError}
        initialSelectedId={focusedFileId}
        onBack={() => { setFocusedFileId(null); setView(filesReturnView); }}
        onRegister={registerProjectFile}
        onRename={renameProjectFile}
      />
    );
  }

  if (view === "gallery") {
    return (
      <ProjectGalleryView
        project={activeProject}
        files={activeProjectImages}
        storageLocked={projectFilesReadError}
        onBack={() => setView("project")}
        onRegister={registerProjectFile}
      />
    );
  }

  if (view === "memory") {
    return (
      <ProjectMemoryView
        project={activeProject}
        memories={activeProjectMemories}
        storageLocked={projectMemoriesReadError}
        initialSelectedId={focusedMemoryId}
        backLabel={memoryReturnView === "search" ? "بازگشت به جست‌وجو" : "بازگشت به فضای پروژه"}
        onBack={() => { setFocusedMemoryId(null); setView(memoryReturnView); }}
        onCreate={createProjectMemory}
        onUpdate={updateProjectMemory}
        onToggleUse={toggleProjectMemoryUse}
        onDelete={deleteProjectMemory}
      />
    );
  }

  if (view === "search") {
    return (
      <ProjectSourceSearchView
        project={activeProject}
        memories={activeProjectMemories}
        files={activeProjectFiles}
        query={projectSearchQuery}
        readError={projectFilesReadError || projectMemoriesReadError}
        onQueryChange={setProjectSearchQuery}
        onBack={() => { keyboard.hide(); setView("chat"); }}
        onOpenMemory={(memoryId) => openProjectMemory("search", memoryId)}
        onOpenFile={(fileId) => openProjectFiles("search", fileId)}
      />
    );
  }

  if (view === "tasks") {
    return (
      <ProjectTasksView
        project={activeProject}
        tasks={activeProjectTasks}
        approvals={activeProjectApprovals}
        initialFilter={projectTasksLaunch.filter}
        initialApprovalId={projectTasksLaunch.approvalId}
        returnToPurchaseRequestId={projectTasksLaunch.returnToPurchaseRequestId}
        tasksStorageLocked={projectTasksReadError}
        approvalsStorageLocked={projectApprovalsReadError || projectPurchaseRequestsReadError}
        onBack={() => { keyboard.hide(); setView("chat"); }}
        onReturnToPurchaseRequest={returnToProjectPurchaseRequest}
        onCreate={createProjectTask}
        onUpdate={updateProjectTask}
        onStatusChange={changeProjectTaskStatus}
        onApprovalDecision={decideProjectApproval}
      />
    );
  }

  if (view === "purchase-requests") {
    return (
      <ProjectPurchaseRequestsView
        project={activeProject}
        requests={activeProjectPurchaseRequests}
        approvals={activeProjectApprovals}
        contacts={activeProjectSupplierContacts}
        dispatchDrafts={activeProjectDispatchDrafts}
        dispatchPlanApprovals={activeProjectDispatchPlanApprovals}
        storageLocked={projectPurchaseRequestsReadError}
        approvalsStorageLocked={projectApprovalsReadError || projectPurchaseRequestsReadError}
        contactsStorageLocked={projectSupplierContactsReadError}
        dispatchStorageLocked={projectDispatchDraftsReadError || projectSupplierContactsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError}
        dispatchPlanApprovalsStorageLocked={projectDispatchPlanApprovalsReadError || projectDispatchDraftsReadError || projectSupplierContactsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError}
        initialSelectedId={initialPurchaseRequestId}
        startWithEditor={startPurchaseRequestEditor}
        backLabel={purchaseRequestsReturnView === "chat" ? "بازگشت به گفت‌وگو" : "بازگشت به فضای پروژه"}
        onBack={() => { keyboard.hide(); pendingPurchaseRequestsReturnFocus.current = purchaseRequestsReturnView; setView(purchaseRequestsReturnView); }}
        onCreate={createProjectPurchaseRequest}
        onUpdate={updateProjectPurchaseRequest}
        onMarkReady={markProjectPurchaseRequestReady}
        onReturnToDraft={returnProjectPurchaseRequestToDraft}
        onCreateApproval={createProjectApproval}
        onOpenApproval={openProjectApproval}
        onCreateContact={createProjectSupplierContact}
        onContactStatusChange={changeProjectSupplierContactStatus}
        onUpsertDispatchDraft={upsertProjectDispatchDraft}
        onCreateDispatchPlanApproval={createProjectDispatchPlanApproval}
        onChangeDispatchPlanApproval={changeProjectDispatchPlanApproval}
      />
    );
  }

  if (view === "proposals") {
    return (
      <ProjectProposalsView
        project={activeProject}
        proposals={activeBuilderRecordedProposals}
        comparisons={activeBuilderProposalComparisons}
        decisions={activeBuilderProposalComparisonDecisions}
        serviceComparisons={activeBuilderServiceProposalComparisons}
        serviceDecisions={activeBuilderServiceProposalComparisonDecisions}
        negotiationDrafts={activeBuilderNegotiationDrafts}
        manualNegotiationResponses={activeBuilderManualNegotiationResponses}
        manualNegotiationResponseReviews={activeBuilderManualNegotiationResponseReviews}
        requests={activeProjectPurchaseRequests}
        approvals={activeProjectApprovals}
        contacts={activeProjectSupplierContacts}
        files={activeProjectFiles.filter((file) => file.storageMode === "metadata-only" && hasVisibleProjectTaskText(file.displayName.trim()) && file.displayName.trim().length <= 140)}
        storageLocked={builderRecordedProposalsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError || projectSupplierContactsReadError || projectFilesReadError}
        comparisonsStorageLocked={builderProposalComparisonsReadError || builderRecordedProposalsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError || projectSupplierContactsReadError}
        decisionsStorageLocked={builderProposalComparisonDecisionsReadError || builderProposalComparisonsReadError}
        serviceComparisonsStorageLocked={builderServiceProposalComparisonsReadError || builderRecordedProposalsReadError || projectPurchaseRequestsReadError || projectApprovalsReadError || projectSupplierContactsReadError}
        serviceDecisionsStorageLocked={builderServiceProposalComparisonDecisionsReadError || builderServiceProposalComparisonsReadError}
        negotiationDraftsStorageLocked={negotiationDraftsStorageLocked}
        manualNegotiationResponsesStorageLocked={manualNegotiationResponsesStorageLocked}
        manualNegotiationResponseReviewsStorageLocked={manualNegotiationResponseReviewsStorageLocked}
        backLabel={proposalsReturnView === "chat" ? "بازگشت به گفت‌وگو" : "بازگشت به فضای پروژه"}
        onBack={() => { keyboard.hide(); pendingProposalsReturnFocus.current = proposalsReturnView; setView(proposalsReturnView); }}
        onCreate={createBuilderRecordedProposal}
        onUpdate={updateBuilderRecordedProposal}
        onCreateComparison={createBuilderProposalComparison}
        onUpdateComparison={updateBuilderProposalComparison}
        onUpsertDecision={upsertBuilderProposalComparisonDecision}
        onCreateServiceComparison={createBuilderServiceProposalComparison}
        onUpdateServiceComparison={updateBuilderServiceProposalComparison}
        onUpsertServiceDecision={upsertBuilderServiceProposalComparisonDecision}
        onCreateNegotiationDraft={createBuilderNegotiationDraft}
        onUpdateNegotiationDraft={updateBuilderNegotiationDraft}
        onCreateManualNegotiationResponse={createBuilderManualNegotiationResponse}
        onUpdateManualNegotiationResponse={updateBuilderManualNegotiationResponse}
        onUpsertManualNegotiationResponseReview={upsertBuilderManualNegotiationResponseReview}
      />
    );
  }

  if (view === "source-demo") {
    return (
      <ProjectSourceAnswerDemoView
        project={activeProject}
        onBack={() => { keyboard.hide(); setView("chat"); }}
      />
    );
  }

  return (
    <div className="chida-app chida-shell" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="builder-home">
      <MobileScroll className="chat-scroll">
        <main className="chat-canvas">
          {messages.length === 0 ? (
            <div className="empty-chat" data-testid="empty-chat">
              <span className="empty-mark"><Sparkles size={23} strokeWidth={1.65} /></span>
              <h1>برای {activeProject.name} چه کاری را پیش ببریم؟</h1>
              <p>نیازت را بگو؛ چیدا مسیر بررسی، مقایسه و اقدام بعدی را مرتب می‌کند.</p>
            </div>
          ) : (
            <div className="message-list" aria-live="polite">
              {messages.map((message) => <article className={`message ${message.role}`} key={message.id}>{message.role === "assistant" ? <span className="message-label">چیدا</span> : null}<p>{message.text}</p></article>)}
            </div>
          )}
        </main>
      </MobileScroll>

      <header className="app-header">
        <button className="icon-button header-button" type="button" onClick={() => { keyboard.hide(); setDrawerOpen(true); }} aria-label="بازکردن منو" data-testid="menu-button"><Menu size={22} /></button>
        <button className="project-switcher" type="button" onClick={() => onOpenSheet("projects")} data-testid="project-switcher"><span><strong>{activeProject.name}</strong><small>پروژه فعال</small></span><ChevronDown size={16} /></button>
      </header>

      <section className="composer-dock" style={{ bottom: bottomInset + 8 }} data-testid="composer-dock">
        <Carousel ariaLabel="اقدام‌های سریع" className="quick-actions" contentClassName="quick-actions-track">
          {quickActions.map(({ id, label, icon: Icon }) => (
            <button className="quick-chip" type="button" key={id} onClick={() => { if (id === "purchase-request") openProjectPurchaseRequests("chat", true); else if (id === "compare-offers") openProjectProposals("chat"); else setDraft(label); }} data-testid={`quick-action-${id}`}>
              <Icon size={16} strokeWidth={1.7} /><span>{label}</span>
            </button>
          ))}
        </Carousel>
        <div className="composer-stack" data-testid="composer-box">
          <div className="composer-card" data-testid="composer-card">
            <KeyboardTextarea data-testid="composer-input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`پیامت برای ${activeProject.name}...`} rows={2} aria-label="پیام به چیدا" />
            <div className="composer-actions">
              <div className="composer-action-group primary-tools">
                <button className="composer-icon" type="button" onClick={() => onOpenSheet("attach")} aria-label="افزودن فایل یا تصویر" data-testid="attach-button"><Plus size={23} /></button>
                <button className="composer-icon" type="button" onClick={() => onOpenSheet("models")} aria-label={`حالت پاسخ: ${modelMode}`} data-testid="model-button"><Gauge size={21} /></button>
              </div>
              <div className="composer-action-group send-tools">
                <button className="composer-icon" type="button" aria-label="ورودی صوتی" data-testid="voice-button"><Mic size={21} /></button>
                <button className="send-button" type="button" onClick={sendMessage} aria-label="ارسال پیام" data-testid="send-button" data-ready={draft.trim() ? "true" : "false"} disabled={!draft.trim()}><ArrowUp size={20} strokeWidth={2.1} /></button>
              </div>
            </div>
          </div>
          <div className="project-context" data-testid="project-context">
            <button className="active-project" type="button" onClick={() => openProjectSpace(activeProject.id)} data-testid="open-project-space" aria-label={`باز کردن فضای پروژهٔ ${activeProject.name}`}>
              <Folder size={17} /><span><small>فضای پروژه</small><strong>{activeProject.name}</strong></span><ArrowRight size={15} />
            </button>
            <button className="tool-cluster" type="button" onClick={() => onOpenSheet("tools")} aria-label="نمایش ابزارهای فعال" data-testid="capability-cluster">
              <span className="tool-cluster-label">ابزارها</span>
              <span className="tool-icons" aria-hidden="true"><span><Search size={13} /></span><span><FileText size={13} /></span><span><Wrench size={13} /></span>{installedTool ? <span><Hammer size={13} /></span> : null}</span>
              <ChevronDown size={13} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {drawerOpen ? (
          <>
            <motion.button className="drawer-backdrop" type="button" aria-label="بستن منو" onClick={() => setDrawerOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="app-drawer" data-testid="nav-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 420, damping: 42 }}>
              <div className="drawer-top"><div className="brand-lockup"><span className="brand-mark"><HardHat size={19} /></span><strong>چیدا</strong></div><button className="icon-button" type="button" onClick={() => setDrawerOpen(false)} aria-label="بستن منو"><X size={20} /></button></div>
              <nav className="drawer-nav" aria-label="منوی چیدا">
                <button type="button"><MessageSquare size={19} /><span>گفتگوی تازه</span><Plus size={17} /></button>
                <button type="button" onClick={openProjectTasks} data-testid="drawer-tasks-entry"><CheckCircle2 size={19} /><span>کارها</span><span className="nav-count" data-testid="drawer-task-count" aria-label={projectTasksReadError ? "بازیابی کارها کامل نشد" : `${activeProjectTaskCount.toLocaleString("fa-IR")} کار در حال انجام`}>{projectTasksReadError ? "!" : activeProjectTaskCount.toLocaleString("fa-IR")}</span></button>
                <button type="button" onClick={() => { setDrawerOpen(false); onOpenSheet("projects"); }} data-testid="drawer-projects-entry"><Folder size={19} /><span>پروژه‌ها</span><span className="nav-count" data-testid="drawer-project-count">{projects.length.toLocaleString("fa-IR")}</span></button>
                <button type="button"><Pin size={19} /><span>پین‌شده‌ها</span><span className="nav-count">۳</span></button>
                <button type="button" data-testid="drawer-brief-entry" onClick={() => { setDrawerOpen(false); onOpenSheet("brief"); }}>
                  <CalendarDays size={19} />
                  <span className="drawer-nav-copy"><strong>بریف</strong><small data-testid="drawer-brief-summary">{briefSummary}</small></span>
                  <ChevronDown size={17} />
                </button>
                <button type="button"><Wrench size={19} /><span>امکانات چیدا</span><ChevronDown size={17} /></button>
              </nav>
              <div className="drawer-section">
                <div className="drawer-section-title"><span>گفتگوهای اخیر</span><button type="button" aria-label="جستجو"><Search size={17} /></button></div>
                <p className="recent-chat-empty">هنوز گفتگویی برای {activeProject.name} ثبت نشده است.</p>
              </div>
              <button className="drawer-profile" type="button" data-testid="drawer-profile" onClick={() => { setDrawerOpen(false); onOpenSheet("settings"); }}>
                <span className="drawer-avatar" aria-hidden="true"><img src="/chida/profile-builder-fictional.jpg" alt="" /></span><span className="drawer-profile-copy"><strong>مهیار کلباسی</strong><small>حساب سازنده</small></span><Settings size={18} />
              </button>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <ModelsSheet sheet={sheet} mode={modelMode} onClose={() => onOpenSheet(null)} onSelect={onModelChange} />
      <AttachSheet sheet={sheet} onClose={() => onOpenSheet(null)} />
      <ToolsSheet sheet={sheet} installedTool={installedTool} onBuild={() => onOpenSheet("build")} onSearch={openProjectSearch} onSourceDemo={openSourceAnswerDemo} onFiles={() => openProjectFiles("chat")} onClose={() => onOpenSheet(null)} />
      <BuildSheet sheet={sheet} activeProject={activeProject.name} onClose={() => onOpenSheet(null)} onInstalled={installTool} />
      <BriefSheet sheet={sheet} schedule={briefSchedule} onClose={() => onOpenSheet(null)} onSave={saveBrief} />
      <ProjectsSheet sheet={sheet} projects={projects} activeProjectId={activeProject.id} onClose={() => onOpenSheet(null)} onSelect={openProjectSpace} onCreate={openNewProject} />
      <ProjectCreateSheet sheet={sheet} onClose={() => onOpenSheet(null)} onSave={onProjectCreate} />
      <SettingsSheet
        sheet={sheet}
        projectName={activeProject.name}
        projectCount={projects.length}
        localRecordCount={projectFilesReadError || projectMemoriesReadError || projectTasksReadError || projectPurchaseRequestsReadError || projectApprovalsReadError || projectSupplierContactsReadError || projectDispatchDraftsReadError || projectDispatchPlanApprovalsReadError || builderRecordedProposalsReadError || builderProposalComparisonsReadError || builderProposalComparisonDecisionsReadError || builderServiceProposalComparisonsReadError || builderServiceProposalComparisonDecisionsReadError || builderNegotiationDraftsReadError || builderManualNegotiationResponsesReadError || builderManualNegotiationResponseReviewsReadError
          ? null
          : activeProjectFiles.length
            + activeProjectMemories.length
            + activeProjectTasks.length
            + activeProjectPurchaseRequests.length
            + activeProjectApprovals.length
            + activeProjectSupplierContacts.length
            + activeProjectDispatchDrafts.length
            + activeProjectDispatchPlanApprovals.length
            + activeBuilderRecordedProposals.length
            + activeBuilderProposalComparisons.length
            + activeBuilderProposalComparisonDecisions.length
            + activeBuilderServiceProposalComparisons.length
            + activeBuilderServiceProposalComparisonDecisions.length
            + activeBuilderNegotiationDrafts.length
            + activeBuilderManualNegotiationResponses.length
            + activeBuilderManualNegotiationResponseReviews.length}
        briefSummary={briefSummary}
        modelMode={modelMode}
        onClose={() => onOpenSheet(null)}
      />
      <span className="sr-only" aria-live="polite">{activeProjectMeta}</span>
    </div>
  );
}

function ProjectWorkspace({ project, fileCount, imageCount, memoryCount, purchaseRequestCount, proposalCount, filesReadError, memoriesReadError, purchaseRequestsReadError, proposalsReadError, initialScrollTop, onBack, onContinue, onOpenFiles, onOpenGallery, onOpenMemory, onOpenPurchaseRequests, onOpenProposals, onUpdate }: { project: BuilderProject; fileCount: number; imageCount: number; memoryCount: number; purchaseRequestCount: number; proposalCount: number; filesReadError: boolean; memoriesReadError: boolean; purchaseRequestsReadError: boolean; proposalsReadError: boolean; initialScrollTop: number; onBack: () => void; onContinue: () => void; onOpenFiles: () => void; onOpenGallery: () => void; onOpenMemory: () => void; onOpenPurchaseRequests: () => void; onOpenProposals: () => void; onUpdate: (draft: ProjectProfileDraft) => void }) {
  const keyboard = useKeyboard();
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<ProjectProfileDraft>(() => projectProfileDraft(project));
  const [fieldErrors, setFieldErrors] = useState<ProjectProfileFieldErrors>(emptyProjectProfileErrors);

  useLayoutEffect(() => {
    const projectScroll = workspaceRef.current?.querySelector<HTMLElement>(".project-workspace-scroll .mobile-scroll");
    if (projectScroll) projectScroll.scrollTop = initialScrollTop;
  }, [initialScrollTop, project.id]);

  const openEditor = () => {
    setEditDraft(projectProfileDraft(project));
    setFieldErrors(emptyProjectProfileErrors);
    setEditOpen(true);
  };

  const changeField = (field: keyof ProjectProfileDraft, value: string) => {
    setEditDraft((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => current[field] ? { ...current, [field]: "" } : current);
  };

  const saveDetails = () => {
    const nextErrors = validateProjectProfileDraft(editDraft);
    setFieldErrors(nextErrors);
    const orderedFields: (keyof ProjectProfileDraft)[] = ["name", "location", "stage", "landArea", "builtArea", "aboveGroundFloors", "basementFloors", "unitCount"];
    const firstInvalidField = orderedFields.find((field) => nextErrors[field]);
    const firstInvalidId = firstInvalidField ? `project-edit-${firstInvalidField.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}` : "";
    if (firstInvalidId) {
      window.requestAnimationFrame(() => document.getElementById(firstInvalidId)?.focus());
      return;
    }
    keyboard.hide();
    onUpdate(editDraft);
    setEditOpen(false);
  };

  return (
    <div ref={workspaceRef} className="chida-app project-workspace" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-workspace">
      <header className="project-workspace-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="بازگشت به چت" data-testid="project-space-back"><ArrowRight size={21} /></button>
        <span className="project-workspace-title"><small>فضای پروژه</small><strong>{project.name}</strong></span>
        <span className="project-workspace-header-spacer" aria-hidden="true" />
      </header>

      <MobileScroll className="project-workspace-scroll">
        <main className="project-workspace-content">
          <section className="project-workspace-hero">
            <span className="project-workspace-mark"><Building2 size={27} strokeWidth={1.65} /></span>
            <span className="project-active-badge"><CheckCircle2 size={15} /> پروژهٔ فعال</span>
            <h1 data-testid="project-workspace-name">{project.name}</h1>
            <p>زمینهٔ گفتگو و اطلاعات این پروژه در چیدا</p>
          </section>

          <section className="project-details-card" aria-labelledby="project-details-title">
            <div className="project-details-heading">
              <div><span className="eyebrow">شناسنامهٔ پروژه</span><h2 id="project-details-title">اطلاعات پروژه</h2></div>
              <button type="button" onClick={openEditor} data-testid="project-space-edit"><PencilLine size={16} /> ویرایش</button>
            </div>
            <dl className="project-facts">
              <div><dt><MapPin size={18} /><span>شهر و محدوده</span></dt><dd>تهران · {normalizeProjectArea(project.location)}</dd></div>
              <div><dt><Hammer size={18} /><span>مرحلهٔ ساخت</span></dt><dd>{project.stage}</dd></div>
              <div><dt><Building2 size={18} /><span>نوع کاربری</span></dt><dd>{project.usage || "ثبت نشده"}</dd></div>
            </dl>
            <div className="project-profile-section-title"><span>ابعاد و ظرفیت</span><small>قابل تکمیل در طول پروژه</small></div>
            <dl className="project-metrics">
              <div><dt>مساحت زمین</dt><dd>{formatProjectMetric(project.landArea, "مترمربع")}</dd></div>
              <div><dt>زیربنای کل</dt><dd>{formatProjectMetric(project.builtArea, "مترمربع")}</dd></div>
              <div><dt>طبقات روی زمین</dt><dd>{formatProjectMetric(project.aboveGroundFloors, "طبقه")}</dd></div>
              <div><dt>طبقات منفی</dt><dd>{formatProjectMetric(project.basementFloors, "طبقه")}</dd></div>
              <div><dt>تعداد واحدها</dt><dd>{formatProjectMetric(project.unitCount, "واحد")}</dd></div>
            </dl>
          </section>

          <button className="project-files-entry project-gallery-entry" type="button" onClick={onOpenGallery} data-testid="project-gallery-entry" aria-label={`باز کردن گالری تصاویر پروژهٔ ${project.name}`}>
            <span className="project-files-entry-icon"><ImageIcon size={22} strokeWidth={1.65} /></span>
            <span className="project-files-entry-copy">
              <strong>گالری تصاویر</strong>
              <small>{filesReadError ? "بازیابی محلی کامل نشد" : imageCount ? `${imageCount.toLocaleString("fa-IR")} عکس ثبت‌شده` : "هنوز عکسی ثبت نشده"}</small>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <button className="project-files-entry" type="button" onClick={onOpenFiles} data-testid="project-files-entry" aria-label={`باز کردن فایل‌ها و اسناد پروژهٔ ${project.name}`}>
            <span className="project-files-entry-icon"><FileText size={22} strokeWidth={1.65} /></span>
            <span className="project-files-entry-copy">
              <strong>فایل‌ها و اسناد</strong>
              <small>{filesReadError ? "بازیابی محلی کامل نشد" : fileCount ? `${fileCount.toLocaleString("fa-IR")} فایل ثبت‌شده` : "هنوز فایلی ثبت نشده"}</small>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <button className="project-files-entry project-memory-entry" type="button" onClick={onOpenMemory} data-testid="project-memory-entry" aria-label={`باز کردن حافظهٔ پروژهٔ ${project.name}`}>
            <span className="project-files-entry-icon"><BrainCircuit size={22} strokeWidth={1.65} /></span>
            <span className="project-files-entry-copy">
              <strong>حافظهٔ پروژه</strong>
              <small>{memoriesReadError ? "بازیابی محلی کامل نشد" : memoryCount ? `${memoryCount.toLocaleString("fa-IR")} مورد ثبت‌شده` : "هنوز موردی ثبت نشده"}</small>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <button className="project-files-entry project-purchase-requests-entry" type="button" onClick={onOpenPurchaseRequests} data-testid="project-purchase-requests-entry" aria-label={`باز کردن درخواست‌های خرید پروژهٔ ${project.name}`}>
            <span className="project-files-entry-icon"><ShoppingCart size={22} strokeWidth={1.65} /></span>
            <span className="project-files-entry-copy">
              <strong>درخواست‌های خرید</strong>
              <small>{purchaseRequestsReadError ? "بازیابی محلی کامل نشد" : purchaseRequestCount ? `${purchaseRequestCount.toLocaleString("fa-IR")} درخواست ثبت‌شده` : "هنوز درخواستی ثبت نشده"}</small>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <button className="project-files-entry project-proposals-entry" type="button" onClick={onOpenProposals} data-testid="project-proposals-entry" aria-label={`باز کردن صندوق پیشنهادهای پروژهٔ ${project.name}`}>
            <span className="project-files-entry-icon"><PackageCheck size={22} strokeWidth={1.65} /></span>
            <span className="project-files-entry-copy">
              <strong>صندوق پیشنهادها</strong>
              <small>{proposalsReadError ? "بازیابی محلی کامل نشد" : proposalCount ? `${proposalCount.toLocaleString("fa-IR")} پیشنهاد ثبت‌شده` : "هنوز پیشنهادی ثبت نشده"}</small>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <p className="project-workspace-note"><ShieldCheck size={16} /> اطلاعات این فضا فعلاً فقط داخل همین مرورگر نگه‌داری می‌شود.</p>
          <button className="primary-button project-continue-button" type="button" onClick={onContinue} data-testid="project-space-continue"><MessageSquare size={18} /> ادامهٔ گفتگو در این پروژه</button>
        </main>
      </MobileScroll>

      <ProjectDetailsSheet
        open={editOpen}
        draft={editDraft}
        errors={fieldErrors}
        onChange={changeField}
        onClose={() => setEditOpen(false)}
        onSave={saveDetails}
      />
    </div>
  );
}

function formatBuilderProposalComparisonMoney(value: string | null) {
  if (value === null) return "نامشخص";
  const [integer, fraction] = value.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  const localized = `${grouped}${fraction ? `٫${fraction}` : ""}`.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
  return `${localized} تومان`;
}

function builderProposalComparisonTaxFormula(treatment: BuilderProposalComparisonInput["taxTreatment"]) {
  if (treatment.mode === "included") return "مالیات داخل مبلغ است؛ افزوده = ۰";
  if (treatment.mode === "fixed") return `مالیات ثابت افزوده = ${formatBuilderProposalComparisonMoney(treatment.value)}`;
  if (treatment.mode === "rate") return `مالیات = جمع اقلام × ${treatment.value ?? "نامشخص"} ÷ ۱۰۰`;
  return "فرمول مالیات نامشخص است";
}

function builderProposalComparisonTaxModeLabel(mode: BuilderProposalComparisonTaxMode) {
  if (mode === "included") return "داخل مبلغ";
  if (mode === "fixed") return "مبلغ ثابت افزوده";
  if (mode === "rate") return "درصد افزوده";
  return "نامشخص";
}

function builderProposalComparisonTransportFormula(treatment: BuilderProposalComparisonInput["transportTreatment"]) {
  if (treatment.mode === "included") return "حمل داخل مبلغ است؛ افزوده = ۰";
  if (treatment.mode === "fixed") return `حمل ثابت افزوده = ${formatBuilderProposalComparisonMoney(treatment.value)}`;
  return "فرمول حمل نامشخص است";
}

function builderProposalComparisonTransportModeLabel(mode: BuilderProposalComparisonTransportMode) {
  if (mode === "included") return "داخل مبلغ";
  if (mode === "fixed") return "مبلغ ثابت افزوده";
  return "نامشخص";
}

function builderProposalComparisonOutcomeLabel(outcome: BuilderProposalComparisonDecisionOutcome) {
  if (outcome === "preferred-for-follow-up") return "ادامهٔ بررسی با یک پیشنهاد";
  if (outcome === "needs-clarification") return "نیازمند روشن‌سازی";
  return "فعلاً هیچ‌کدام";
}

function ProposalComparisonDecisionPanel({ comparison, revision, decision, disabled, onSave }: { comparison: BuilderProposalComparisonRecord; revision: BuilderProposalComparisonRevision; decision: BuilderProposalComparisonDecisionRecord | null; disabled: boolean; onSave: (draft: BuilderProposalComparisonDecisionDraft) => false | "unchanged" | "created" | "updated" }) {
  const currentDecisionRevision = decision?.revisions.find((item) => item.id === decision.currentRevisionId) ?? null;
  const [draft, setDraft] = useState<BuilderProposalComparisonDecisionDraft>(() => ({ outcome: currentDecisionRevision?.outcome ?? "no-selection", selectedProposalId: currentDecisionRevision?.selectedProposalId ?? "", reason: currentDecisionRevision?.reason ?? "" }));
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (draft.outcome === "preferred-for-follow-up" && !draft.selectedProposalId) {
      setError("پیشنهادی را که می‌خواهی بیشتر بررسی شود انتخاب کن.");
      document.getElementById("comparison-decision-proposal")?.focus();
      return;
    }
    if (!draft.reason.trim()) {
      setError("دلیل تصمیم سازنده را ثبت کن.");
      document.getElementById("comparison-decision-reason")?.focus();
      return;
    }
    const result = onSave(draft);
    if (!result) {
      setError("تصمیم ثبت نشد؛ دادهٔ محلی و نسخهٔ مقایسه را دوباره بررسی کن.");
      return;
    }
    setError("");
    setMessage(result === "unchanged" ? "تغییر تازه‌ای برای ثبت وجود نداشت." : "تصمیم خصوصی شما به‌صورت نسخه‌دار ثبت شد.");
  };
  return (
    <section className="proposal-detail-section comparison-decision-section" aria-labelledby="comparison-decision-title" data-testid="comparison-decision-section">
      <div className="proposal-section-heading"><span><small>تصمیم مستقل سازنده</small><strong id="comparison-decision-title">ثبت تصمیم من</strong></span><em>{decision ? `نسخهٔ ${decision.version.toLocaleString("fa-IR")}` : "ثبت نشده"}</em></div>
      <p className="comparison-boundary-note"><ShieldCheck size={16} /> این تصمیم سفارش، خرید، ارسال یا اطلاع به تأمین‌کننده ایجاد نمی‌کند.</p>
      <form className="comparison-decision-form" onSubmit={submit}>
        <label className="field-control" htmlFor="comparison-decision-outcome"><span>وضعیت تصمیم</span><select id="comparison-decision-outcome" value={draft.outcome} onChange={(event) => { const outcome = event.target.value as BuilderProposalComparisonDecisionOutcome; setDraft((current) => ({ ...current, outcome, selectedProposalId: outcome === "preferred-for-follow-up" ? current.selectedProposalId : "" })); setError(""); }} disabled={disabled} data-testid="comparison-decision-outcome"><option value="no-selection">فعلاً هیچ‌کدام</option><option value="needs-clarification">نیازمند روشن‌سازی</option><option value="preferred-for-follow-up">ادامهٔ بررسی با یک پیشنهاد</option></select></label>
        {draft.outcome === "preferred-for-follow-up" ? <label className="field-control" htmlFor="comparison-decision-proposal"><span>پیشنهاد برای ادامهٔ بررسی</span><select id="comparison-decision-proposal" value={draft.selectedProposalId} onChange={(event) => { setDraft((current) => ({ ...current, selectedProposalId: event.target.value })); setError(""); }} disabled={disabled} data-testid="comparison-decision-proposal"><option value="">انتخاب پیشنهاد</option>{revision.inputs.map((input) => <option key={input.proposalId} value={input.proposalId}>{input.supplierSnapshot.displayName}</option>)}</select></label> : null}
        <label className="field-control" htmlFor="comparison-decision-reason"><span>دلیل شما</span><KeyboardTextarea id="comparison-decision-reason" value={draft.reason} onChange={(event) => { setDraft((current) => ({ ...current, reason: event.target.value })); setError(""); }} rows={3} placeholder="چرا این تصمیم را ثبت می‌کنی؟" disabled={disabled} data-testid="comparison-decision-reason" /></label>
        {error ? <p className="proposal-form-error" role="alert" data-testid="comparison-decision-error">{error}</p> : null}
        {message ? <p className="comparison-save-message" role="status">{message}</p> : null}
        <button className="primary-button" type="submit" disabled={disabled} data-testid="comparison-decision-save">{decision ? "ثبت نسخهٔ تازهٔ تصمیم" : "ثبت تصمیم خصوصی"}</button>
      </form>
      {decision ? <ol className="proposal-history comparison-decision-history" data-testid="comparison-decision-history">{[...decision.revisions].reverse().map((item) => { const selectedSupplier = item.selectedProposalId ? revision.inputs.find((input) => input.proposalId === item.selectedProposalId)?.supplierSnapshot.displayName ?? "پیشنهاد ناشناخته" : null; return <li key={item.id}><span><Check size={13} /></span><div><strong>{builderProposalComparisonOutcomeLabel(item.outcome)}</strong><small>نسخهٔ {item.version.toLocaleString("fa-IR")} · {formatProjectFileDate(item.createdAt)}</small>{item.selectedProposalId ? <small>پیشنهاد: {selectedSupplier} · شناسه: {item.selectedProposalId}</small> : <small>پیشنهاد منتخب ندارد</small>}<small>{item.reason}</small></div></li>; })}</ol> : null}
    </section>
  );
}

function ProjectProposalComparisonsView({ project, proposals, comparisons, decisions, negotiationDrafts, requests, approvals, contacts, storageLocked, decisionsStorageLocked, negotiationDraftsStorageLocked, initialNegotiationTarget, onBack, onCreate, onUpdate, onUpsertDecision, onStartNegotiation }: { project: BuilderProject; proposals: BuilderRecordedProposalRecord[]; comparisons: BuilderProposalComparisonRecord[]; decisions: BuilderProposalComparisonDecisionRecord[]; negotiationDrafts: BuilderNegotiationDraftRecord[]; requests: ProjectPurchaseRequestRecord[]; approvals: ProjectApprovalRecord[]; contacts: SupplierContactRecord[]; storageLocked: boolean; decisionsStorageLocked: boolean; negotiationDraftsStorageLocked: boolean; initialNegotiationTarget: BuilderNegotiationDraftTarget | null; onBack: () => void; onCreate: (draft: BuilderProposalComparisonDraft) => string | null; onUpdate: (comparisonId: string, draft: BuilderProposalComparisonDraft) => false | "unchanged" | "updated"; onUpsertDecision: (comparisonId: string, revisionId: string, draft: BuilderProposalComparisonDecisionDraft) => false | "unchanged" | "created" | "updated"; onStartNegotiation: (target: BuilderNegotiationDraftTarget) => void }) {
  const keyboard = useKeyboard();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const editorHeadingRef = useRef<HTMLSpanElement>(null);
  const detailHeadingRef = useRef<HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialNegotiationTarget?.comparisonKind === "product" ? initialNegotiationTarget.comparisonId : null);
  const [previewRevisionId, setPreviewRevisionId] = useState<string | null>(initialNegotiationTarget?.comparisonKind === "product" ? initialNegotiationTarget.comparisonRevisionId : null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BuilderProposalComparisonDraft>({ requestKey: "", proposals: [] });
  const [formError, setFormError] = useState("");
  const [liveMessage, setLiveMessage] = useState("");
  const currentProductProposals = useMemo(() => proposals.filter((proposal) => proposal.target.requestKind === "product" && builderRecordedProposalEffectiveStatus(proposal, requests, approvals, contacts) === "current"), [approvals, contacts, proposals, requests]);
  const eligibleGroups = useMemo(() => {
    const groups = new Map<string, BuilderRecordedProposalRecord[]>();
    currentProductProposals.forEach((proposal) => {
      const key = builderProposalComparisonRequestKey(proposal);
      groups.set(key, [...(groups.get(key) ?? []), proposal]);
    });
    return Array.from(groups.entries()).filter(([, items]) => items.length >= 2).map(([key, items]) => ({ key, proposals: items, title: items[0].requestSnapshot.title }));
  }, [currentProductProposals]);
  const orderedComparisons = useMemo(() => [...comparisons].sort((first, second) => second.updatedAt.localeCompare(first.updatedAt)), [comparisons]);
  const selectedComparison = comparisons.find((comparison) => comparison.id === selectedId) ?? null;
  const currentRevision = selectedComparison?.revisions.find((revision) => revision.id === selectedComparison.currentRevisionId) ?? null;
  const previewRevision = selectedComparison?.revisions.find((revision) => revision.id === previewRevisionId) ?? currentRevision;
  const liveInputs = normalizeBuilderProposalComparisonInputs(draft, currentProductProposals);
  const livePreview = liveInputs ? deriveBuilderProposalComparisonPayload(liveInputs, currentProductProposals) : null;

  useEffect(() => {
    if (initialNegotiationTarget?.comparisonKind !== "product") return;
    window.requestAnimationFrame(() => Array.from(document.querySelectorAll<HTMLElement>('[data-testid="negotiation-draft-start"]')).find((element) => element.dataset.comparisonKind === "product" && element.dataset.proposalId === initialNegotiationTarget.proposalId && element.dataset.criterionId === initialNegotiationTarget.criterionId)?.focus());
  }, [initialNegotiationTarget]);

  const openCreate = () => {
    if (storageLocked || !eligibleGroups.length) return;
    const key = eligibleGroups.length === 1 ? eligibleGroups[0].key : "";
    setEditingId(null);
    setDraft(key ? builderProposalComparisonDefaultDraft(currentProductProposals, key) : { requestKey: "", proposals: [] });
    setFormError("");
    setEditorOpen(true);
    window.requestAnimationFrame(() => editorHeadingRef.current?.focus());
  };
  const openEdit = () => {
    if (!selectedComparison || !currentRevision || storageLocked) return;
    const key = [selectedComparison.target.requestId, selectedComparison.target.requestVersion, selectedComparison.target.reviewRevisionId, selectedComparison.target.reviewRevisionFingerprint].join(":");
    const status = builderProposalComparisonEffectiveStatus(selectedComparison, proposals, requests, approvals, contacts);
    setEditingId(selectedComparison.id);
    setDraft(status === "current" ? builderProposalComparisonDraftFromRecord(selectedComparison) : builderProposalComparisonDefaultDraft(currentProductProposals, key));
    setFormError("");
    setEditorOpen(true);
    window.requestAnimationFrame(() => editorHeadingRef.current?.focus());
  };
  const closeEditor = () => {
    keyboard.hide();
    setEditorOpen(false);
    setFormError("");
    window.requestAnimationFrame(() => (editingId ? detailHeadingRef.current : addButtonRef.current)?.focus());
  };
  const changeGroup = (requestKey: string) => {
    setDraft(requestKey ? builderProposalComparisonDefaultDraft(currentProductProposals, requestKey) : { requestKey: "", proposals: [] });
    setFormError("");
  };
  const updateProposalDraft = (proposalId: string, updater: (current: BuilderProposalComparisonProposalDraft) => BuilderProposalComparisonProposalDraft) => {
    setDraft((current) => ({ ...current, proposals: current.proposals.map((item) => item.proposalId === proposalId ? updater(item) : item) }));
    setFormError("");
  };
  const updateLineDraft = (proposalId: string, lineId: string, updater: (current: BuilderProposalComparisonLineAdjustmentDraft) => BuilderProposalComparisonLineAdjustmentDraft) => updateProposalDraft(proposalId, (current) => ({ ...current, lineAdjustments: current.lineAdjustments.map((line) => line.proposalLineId === lineId ? updater(line) : line) }));
  const saveComparison = (event: React.FormEvent) => {
    event.preventDefault();
    keyboard.hide();
    if (!draft.requestKey) {
      setFormError("درخواست دارای حداقل دو پیشنهاد جاری را انتخاب کن.");
      document.getElementById("comparison-request-select")?.focus();
      return;
    }
    if (draft.proposals.filter((item) => item.selected).length < 2) {
      setFormError("برای مقایسه دست‌کم دو پیشنهاد را نگه دار.");
      document.querySelector<HTMLElement>("[data-testid='comparison-proposal-toggle']")?.focus();
      return;
    }
    if (!liveInputs || !livePreview) {
      setFormError("یکی از تعدیل‌های انتخاب‌شده ناقص یا ناسازگار است؛ مبلغ و دلیل فرض را بررسی کن.");
      document.querySelector<HTMLElement>("[data-comparison-control='invalid']")?.focus();
      return;
    }
    if (editingId) {
      const result = onUpdate(editingId, draft);
      if (!result) {
        setFormError("نسخهٔ مقایسه ثبت نشد؛ پیشنهادهای جاری و ذخیره‌سازی محلی را دوباره بررسی کن.");
        return;
      }
      setLiveMessage(result === "unchanged" ? "تغییر تازه‌ای برای ثبت وجود نداشت." : "نسخهٔ تازهٔ مقایسه ثبت شد؛ تصمیم نسخهٔ قبل تاریخی باقی ماند.");
      setEditorOpen(false);
      setPreviewRevisionId(null);
      window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
      return;
    }
    const createdId = onCreate(draft);
    if (!createdId) {
      setFormError("مقایسه ثبت نشد؛ پیشنهادهای جاری و ذخیره‌سازی محلی را دوباره بررسی کن.");
      return;
    }
    setSelectedId(createdId);
    setPreviewRevisionId(null);
    setLiveMessage("مقایسهٔ خصوصی و نسخه‌دار پروژه ثبت شد.");
    setEditorOpen(false);
    window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
  };

  if (editorOpen) {
    const selectedCount = draft.proposals.filter((item) => item.selected).length;
    return (
      <div className="chida-app project-proposals-view comparison-editor-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="comparison-editor">
        <header className="project-workspace-header"><button className="icon-button" type="button" onClick={closeEditor} aria-label="بستن فرم مقایسه" data-testid="comparison-editor-back"><ArrowRight size={21} /></button><span ref={editorHeadingRef} className="project-workspace-title" tabIndex={-1} data-testid="comparison-editor-title"><small>T7-B1 · محصول</small><strong>{editingId ? "بازبینی مقایسه" : "ساخت مقایسه"}</strong></span><span className="project-workspace-header-spacer" aria-hidden="true" /></header>
        <MobileScroll className="project-proposals-scroll"><form className="proposal-editor-content comparison-editor-content" onSubmit={saveComparison} noValidate>
          <section className="proposal-honesty-banner"><ShieldCheck size={18} /><span><strong>اصل پیشنهادها دست‌نخورده می‌ماند</strong><small>دادهٔ اعلامیِ رونویسی‌شده توسط شما، فرض شما و محاسبهٔ قطعی محلی سه لایهٔ جدا هستند. این جریان فقط محصول را پوشش می‌دهد و هیچ AI، شبکه یا اثر بیرونی ندارد.</small></span></section>
          <section className="proposal-form-section"><div className="proposal-section-heading"><span><small>دامنهٔ دقیق</small><strong>درخواست و پیشنهادها</strong></span><em>{selectedCount.toLocaleString("fa-IR")} انتخاب</em></div>
            {editingId ? <div className="proposal-locked-grid"><div><small>درخواست ثابت</small><strong>{comparisons.find((item) => item.id === editingId)?.requestSnapshot.title}</strong><span>تغییر request revision مجاز نیست.</span></div></div> : <label className="field-control" htmlFor="comparison-request-select"><span>درخواست محصول</span><select id="comparison-request-select" value={draft.requestKey} onChange={(event) => changeGroup(event.target.value)} data-testid="comparison-request-select"><option value="">انتخاب درخواست</option>{eligibleGroups.map((group) => <option key={group.key} value={group.key}>{group.title} · {group.proposals.length.toLocaleString("fa-IR")} پیشنهاد</option>)}</select><small>فقط پیشنهادهای جاریِ همان revision دقیق قابل انتخاب‌اند.</small></label>}
            <div className="comparison-proposal-toggles">{draft.proposals.map((item) => { const proposal = currentProductProposals.find((candidate) => candidate.id === item.proposalId); return proposal ? <button key={item.proposalId} type="button" aria-pressed={item.selected} onClick={() => updateProposalDraft(item.proposalId, (current) => ({ ...current, selected: !current.selected }))} data-testid="comparison-proposal-toggle"><span>{item.selected ? <Check size={15} /> : null}</span><strong>{proposal.supplierSnapshot.displayName}</strong><small>نسخهٔ {proposal.version.toLocaleString("fa-IR")}</small></button> : null; })}</div>
          </section>
          {draft.proposals.filter((item) => item.selected).map((proposalDraft, proposalIndex) => {
            const proposal = currentProductProposals.find((item) => item.id === proposalDraft.proposalId);
            const revision = proposal?.revisions.find((item) => item.id === proposal.currentRevisionId);
            if (!proposal || !revision) return null;
            const previewResult = livePreview?.results.find((item) => item.proposalId === proposal.id) ?? null;
            return <section className="proposal-form-section comparison-supplier-editor" key={proposal.id} data-testid="comparison-supplier-editor"><div className="proposal-section-heading"><span><small>پیشنهاد {(proposalIndex + 1).toLocaleString("fa-IR")}</small><strong>{proposal.supplierSnapshot.displayName}</strong></span><em>اصل: نسخهٔ {revision.version.toLocaleString("fa-IR")}</em></div>
              {revision.lines.map((line, lineIndex) => { const adjustment = proposalDraft.lineAdjustments.find((item) => item.proposalLineId === line.id)!; const requestItem = proposal.requestSnapshot.items.find((item) => item.id === line.requestItemId); const result = previewResult?.lines.find((item) => item.proposalLineId === line.id); return <article className="comparison-line-editor" key={line.id} data-testid="comparison-line-editor"><div className="comparison-layer declared"><small>۱ · اعلامی، رونویسی‌شده توسط شما</small><strong>{line.requestLabel}</strong><dl><div><dt>درخواست</dt><dd>{requestItem?.quantity ?? "نامشخص"} {requestItem?.unit ?? ""}</dd></div><div><dt>پیشنهاد</dt><dd>{line.quantity ?? "نامشخص"} {line.unit ?? ""}</dd></div><div><dt>قیمت واحد</dt><dd>{formatBuilderProposalComparisonMoney(line.unitPrice)}</dd></div><div><dt>قیمت کل</dt><dd>{formatBuilderProposalComparisonMoney(line.totalPrice)}</dd></div><div><dt>متن مالیات</dt><dd>{line.tax ?? "ذکر نشده"}</dd></div><div><dt>متن حمل</dt><dd>{line.transport ?? "ذکر نشده"}</dd></div></dl></div>
                <div className="comparison-layer assumption"><small>۲ · فرض و تعدیل واردشده توسط شما</small><label className="field-control" htmlFor={`comparison-basis-${proposalIndex}-${lineIndex}`}><span>مبنای مبلغ</span><select id={`comparison-basis-${proposalIndex}-${lineIndex}`} value={adjustment.basis} onChange={(event) => updateLineDraft(proposal.id, line.id, (current) => ({ ...current, basis: event.target.value as BuilderProposalComparisonBasis, adjustedQuantity: "", adjustedQuantityUnit: event.target.value === "unit-price-times-adjusted-quantity" ? line.unit ?? "" : "", assumption: "" }))} data-testid={`comparison-basis-${proposalIndex}-${lineIndex}`}><option value="unknown">نامشخص</option><option value="declared-total" disabled={!(line.status === "quoted" && line.totalPrice && line.quantity === requestItem?.quantity && line.unit === requestItem?.unit)}>قیمت کل اعلامی؛ مقدار و واحد دقیقاً یکسان</option><option value="unit-price-times-adjusted-quantity" disabled={line.status !== "quoted" || !line.unitPrice || !line.unit}>قیمت واحد × مقدار لازم در واحد پیشنهاد</option></select></label>
                  {adjustment.basis === "unit-price-times-adjusted-quantity" ? <><div className="comparison-two-fields"><label className="field-control" htmlFor={`comparison-quantity-${proposalIndex}-${lineIndex}`}><span>مقدار لازم در واحد پیشنهاد</span><KeyboardInput id={`comparison-quantity-${proposalIndex}-${lineIndex}`} inputMode="decimal" value={adjustment.adjustedQuantity} onChange={(event) => updateLineDraft(proposal.id, line.id, (current) => ({ ...current, adjustedQuantity: event.target.value }))} data-comparison-control={!adjustment.adjustedQuantity.trim() ? "invalid" : undefined} data-testid={`comparison-adjusted-quantity-${proposalIndex}-${lineIndex}`} /></label><label className="field-control" htmlFor={`comparison-unit-${proposalIndex}-${lineIndex}`}><span>واحد اعلامی پیشنهاد · ثابت</span><input id={`comparison-unit-${proposalIndex}-${lineIndex}`} value={adjustment.adjustedQuantityUnit} readOnly aria-readonly="true" data-testid={`comparison-adjusted-unit-${proposalIndex}-${lineIndex}`} /></label></div><label className="field-control" htmlFor={`comparison-assumption-${proposalIndex}-${lineIndex}`}><span>دلیل تبدیل یا هم‌سطح‌سازی</span><KeyboardTextarea id={`comparison-assumption-${proposalIndex}-${lineIndex}`} value={adjustment.assumption} onChange={(event) => updateLineDraft(proposal.id, line.id, (current) => ({ ...current, assumption: event.target.value }))} rows={2} placeholder="مثلاً ۵۰۰۰ کیلوگرم = ۵ تن" data-testid={`comparison-assumption-${proposalIndex}-${lineIndex}`} /></label></> : null}</div>
                <div className="comparison-layer calculation"><small>۳ · محاسبهٔ قطعی محلی چیدا</small><strong>{result?.calculation.formula ?? "هنوز قابل محاسبه نیست"}</strong><span>{formatBuilderProposalComparisonMoney(result?.calculation.normalizedLineTotal ?? null)}</span>{result?.calculation.missingReasons.map((reason) => <em key={reason}>{reason}</em>)}</div>
              </article>; })}
              <div className="comparison-money-treatments"><div className="comparison-treatment"><label className="field-control" htmlFor={`comparison-tax-mode-${proposalIndex}`}><span>تعدیل مالیات</span><select id={`comparison-tax-mode-${proposalIndex}`} value={proposalDraft.taxMode} onChange={(event) => updateProposalDraft(proposal.id, (current) => ({ ...current, taxMode: event.target.value as BuilderProposalComparisonTaxMode, taxValue: "", taxAssumption: "" }))} data-testid={`comparison-tax-mode-${proposalIndex}`}><option value="unknown">نامشخص</option><option value="included">داخل مبلغ / بدون افزایش</option><option value="fixed">مبلغ ثابت افزوده</option><option value="rate">درصد افزوده</option></select></label>{proposalDraft.taxMode === "fixed" || proposalDraft.taxMode === "rate" ? <label className="field-control" htmlFor={`comparison-tax-value-${proposalIndex}`}><span>{proposalDraft.taxMode === "rate" ? "درصد" : "مبلغ (تومان)"}</span><KeyboardInput id={`comparison-tax-value-${proposalIndex}`} inputMode="decimal" value={proposalDraft.taxValue} onChange={(event) => updateProposalDraft(proposal.id, (current) => ({ ...current, taxValue: event.target.value }))} data-testid={`comparison-tax-value-${proposalIndex}`} /></label> : null}{proposalDraft.taxMode !== "unknown" ? <label className="field-control" htmlFor={`comparison-tax-assumption-${proposalIndex}`}><span>مبنای فرض مالیات</span><KeyboardInput id={`comparison-tax-assumption-${proposalIndex}`} value={proposalDraft.taxAssumption} onChange={(event) => updateProposalDraft(proposal.id, (current) => ({ ...current, taxAssumption: event.target.value }))} placeholder="توضیح صریح شما" data-testid={`comparison-tax-assumption-${proposalIndex}`} /></label> : null}</div>
                <div className="comparison-treatment"><label className="field-control" htmlFor={`comparison-transport-mode-${proposalIndex}`}><span>تعدیل حمل</span><select id={`comparison-transport-mode-${proposalIndex}`} value={proposalDraft.transportMode} onChange={(event) => updateProposalDraft(proposal.id, (current) => ({ ...current, transportMode: event.target.value as BuilderProposalComparisonTransportMode, transportValue: "", transportAssumption: "" }))} data-testid={`comparison-transport-mode-${proposalIndex}`}><option value="unknown">نامشخص</option><option value="included">داخل مبلغ / بدون افزایش</option><option value="fixed">مبلغ ثابت افزوده</option></select></label>{proposalDraft.transportMode === "fixed" ? <label className="field-control" htmlFor={`comparison-transport-value-${proposalIndex}`}><span>مبلغ حمل (تومان)</span><KeyboardInput id={`comparison-transport-value-${proposalIndex}`} inputMode="decimal" value={proposalDraft.transportValue} onChange={(event) => updateProposalDraft(proposal.id, (current) => ({ ...current, transportValue: event.target.value }))} data-testid={`comparison-transport-value-${proposalIndex}`} /></label> : null}{proposalDraft.transportMode !== "unknown" ? <label className="field-control" htmlFor={`comparison-transport-assumption-${proposalIndex}`}><span>مبنای فرض حمل</span><KeyboardInput id={`comparison-transport-assumption-${proposalIndex}`} value={proposalDraft.transportAssumption} onChange={(event) => updateProposalDraft(proposal.id, (current) => ({ ...current, transportAssumption: event.target.value }))} placeholder="توضیح صریح شما" data-testid={`comparison-transport-assumption-${proposalIndex}`} /></label> : null}</div></div>
              <div className={`comparison-live-total ${previewResult?.coverage ?? "incomplete"}`} data-testid={`comparison-live-total-${proposalIndex}`}><span><small>مبلغ هم‌سطح</small><strong>{formatBuilderProposalComparisonMoney(previewResult?.normalizedTotal ?? null)}</strong></span><em>{previewResult?.coverage === "complete" ? "فرمول مبلغ کامل" : "دادهٔ ناکافی؛ توصیه صادر نمی‌شود"}</em></div>
            </section>;
          })}
          <section className={`comparison-recommendation-preview ${livePreview?.recommendation.status ?? "insufficient-data"}`} data-testid="comparison-recommendation-preview"><LayoutGrid size={20} /><span><small>معیار ثابت و آشکار: کمترین مبلغ هم‌سطح کامل</small><strong>{livePreview?.recommendation.status === "conditional" ? `نامزد بررسی: ${livePreview.results.find((item) => item.proposalId === livePreview.recommendation.candidateProposalId)?.supplierDisplayName}` : livePreview?.recommendation.status === "tie" ? "کمترین مبلغ برابر است" : "داده برای جمع‌بندی کافی نیست"}</strong><p>{livePreview?.recommendation.reason ?? "برای ساخت نتیجه، ورودی‌های انتخاب‌شده باید معتبر باشند."}</p></span></section>
          {formError ? <p className="proposal-form-error" role="alert" data-testid="comparison-form-error">{formError}</p> : null}<div className="proposal-editor-actions"><button className="secondary-button" type="button" onClick={closeEditor}>انصراف</button><button className="primary-button" type="submit" data-testid="comparison-save">{editingId ? "ثبت نسخهٔ تازه" : "ثبت مقایسهٔ خصوصی"}</button></div>
        </form></MobileScroll>
      </div>
    );
  }

  if (selectedComparison && previewRevision) {
    const currentPreview = previewRevision.id === selectedComparison.currentRevisionId;
    const effectiveStatus = currentPreview ? builderProposalComparisonEffectiveStatus(selectedComparison, proposals, requests, approvals, contacts, previewRevision.id) : "needs-review" as const;
    const decision = decisions.find((item) => item.target.comparisonId === selectedComparison.id && item.target.comparisonRevisionId === previewRevision.id) ?? null;
    const recommendationName = previewRevision.recommendation.candidateProposalId ? previewRevision.results.find((item) => item.proposalId === previewRevision.recommendation.candidateProposalId)?.supplierDisplayName : null;
    return <div className="chida-app project-proposals-view comparison-detail-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="comparison-detail"><header className="project-workspace-header"><button className="icon-button" type="button" onClick={() => { setSelectedId(null); setPreviewRevisionId(null); window.requestAnimationFrame(() => Array.from(document.querySelectorAll<HTMLElement>("[data-comparison-id]")).find((element) => element.dataset.comparisonId === selectedComparison.id)?.focus()); }} aria-label="بازگشت به مقایسه‌ها" data-testid="comparison-detail-back"><ArrowRight size={21} /></button><span className="project-workspace-title"><small>مقایسهٔ خصوصی محصول</small><strong>{selectedComparison.requestSnapshot.title}</strong></span><span className="project-workspace-header-spacer" /></header><MobileScroll className="project-proposals-scroll"><main className="proposal-detail-content comparison-detail-content">
      <section className="proposal-detail-hero comparison-detail-hero" tabIndex={-1} ref={detailHeadingRef} data-testid="comparison-detail-hero"><span className="proposal-detail-icon"><LayoutGrid size={24} /></span><span className={`proposal-status-badge ${effectiveStatus}`}>{!currentPreview ? "نسخهٔ تاریخی مقایسه" : effectiveStatus === "current" ? "متصل به نسخه‌های جاری" : "تاریخی · نیازمند بازبینی"}</span><h1>{selectedComparison.requestSnapshot.title}</h1><p>نسخهٔ مقایسه {previewRevision.version.toLocaleString("fa-IR")} · خصوصی پروژه · بدون AI و شبکه</p></section>
      <section className="proposal-detail-section"><div className="proposal-section-heading"><span><small>نسخه و اتصال</small><strong>منبع حقیقت این مقایسه</strong></span><em>request v{selectedComparison.target.requestVersion}</em></div><dl className="proposal-detail-meta"><div><dt>review revision</dt><dd>{selectedComparison.target.reviewRevisionId}</dd></div><div><dt>پیشنهادهای pin‌شده</dt><dd>{previewRevision.inputs.length.toLocaleString("fa-IR")} نسخهٔ دقیق</dd></div><div><dt>محاسبه</dt><dd>قطعی محلی · بدون گردکردن</dd></div><div><dt>اثر بیرونی</dt><dd>هیچ</dd></div></dl>{selectedComparison.revisions.length > 1 ? <label className="proposal-revision-picker" htmlFor="comparison-revision-select"><span>نمایش نسخه</span><select id="comparison-revision-select" value={previewRevision.id} onChange={(event) => setPreviewRevisionId(event.target.value)} data-testid="comparison-revision-select">{[...selectedComparison.revisions].reverse().map((revision) => <option key={revision.id} value={revision.id}>نسخهٔ {revision.version.toLocaleString("fa-IR")} · {revision.id === selectedComparison.currentRevisionId ? "جاری" : "تاریخی"}</option>)}</select></label> : null}</section>
      <section className={`comparison-recommendation-detail ${previewRevision.recommendation.status}`} data-testid="comparison-recommendation"><LayoutGrid size={22} /><span><small>جمع‌بندی قاعده‌محور · نه انتخاب نهایی</small><strong>{previewRevision.recommendation.status === "conditional" ? `${recommendationName} بر پایهٔ کمترین مبلغ هم‌سطح` : previewRevision.recommendation.status === "tie" ? "تساوی در کمترین مبلغ هم‌سطح" : "دادهٔ ناکافی برای جمع‌بندی"}</strong><p>{previewRevision.recommendation.reason}</p></span></section>
      {negotiationDraftsStorageLocked ? <section className="proposal-storage-error" role="alert" data-testid="negotiation-draft-storage-error"><CircleHelp size={19} /><span><strong>وضعیت پیش‌نویس‌های مذاکره قابل تأیید نیست</strong><small>خواندن مخزن کامل نشد؛ شروع پیش‌نویس تازه تا بازیابی موفق قفل می‌ماند.</small></span></section> : null}
      <div className="comparison-results-list">{previewRevision.results.map((result, proposalIndex) => { const input = previewRevision.inputs.find((item) => item.proposalId === result.proposalId)!; return <section className="proposal-detail-section comparison-result-card" key={result.proposalId} data-testid="comparison-result-card"><div className="proposal-section-heading"><span><small>پیشنهاد {(proposalIndex + 1).toLocaleString("fa-IR")} · نسخهٔ {input.proposalVersion.toLocaleString("fa-IR")}</small><strong>{result.supplierDisplayName}</strong></span><em>{result.coverage === "complete" ? "فرمول مبلغ کامل" : "فرمول مبلغ ناقص"}</em></div>{result.lines.map((line) => { const adjustment = input.lineAdjustments.find((item) => item.proposalLineId === line.proposalLineId)!; return <details className="comparison-result-line" key={line.proposalLineId} open><summary><span><small>قلم اعلامی</small><strong>{line.requestLabel}</strong></span><em>{formatBuilderProposalComparisonMoney(line.calculation.normalizedLineTotal)}</em></summary><div className="comparison-result-layers"><div className="comparison-layer declared"><small>اعلامی، رونویسی‌شده توسط شما</small><dl><div><dt>وضعیت</dt><dd>{builderRecordedProposalLineStatusLabel(line.declaredSnapshot.status)}</dd></div><div><dt>مقدار</dt><dd>{line.declaredSnapshot.quantity ?? "نامشخص"} {line.declaredSnapshot.unit ?? ""}</dd></div><div><dt>قیمت واحد</dt><dd>{formatBuilderProposalComparisonMoney(line.declaredSnapshot.unitPrice)}</dd></div><div><dt>قیمت کل</dt><dd>{formatBuilderProposalComparisonMoney(line.declaredSnapshot.totalPrice)}</dd></div><div><dt>متن مالیات</dt><dd>{line.declaredSnapshot.tax ?? "ذکر نشده"}</dd></div><div><dt>متن حمل</dt><dd>{line.declaredSnapshot.transport ?? "ذکر نشده"}</dd></div><div><dt>حداقل سفارش</dt><dd>{line.declaredSnapshot.minimumOrder ?? "ذکر نشده"}</dd></div><div><dt>موعد</dt><dd>{line.declaredSnapshot.leadTime ?? "ذکر نشده"}</dd></div><div><dt>اعتبار</dt><dd>{line.declaredSnapshot.validity ?? "ذکر نشده"}</dd></div><div><dt>پرداخت</dt><dd>{line.declaredSnapshot.paymentTerms ?? "ذکر نشده"}</dd></div></dl></div><div className="comparison-layer assumption"><small>فرض ثبت‌شده توسط شما</small><strong>{adjustment.basis === "declared-total" ? "قیمت کل با مقدار و واحد دقیقاً یکسان" : adjustment.basis === "unit-price-times-adjusted-quantity" ? `${adjustment.adjustedQuantity} ${adjustment.adjustedQuantityUnit}` : "مبنا نامشخص"}</strong><p>{adjustment.assumption ?? "فرض عددی ثبت نشده"}</p></div><div className="comparison-layer calculation"><small>محاسبهٔ قطعی محلی چیدا</small><strong>{line.calculation.formula}</strong><span>{formatBuilderProposalComparisonMoney(line.calculation.normalizedLineTotal)}</span>{line.calculation.missingReasons.map((reason) => <em key={reason}>{reason}</em>)}</div></div><button className="negotiation-draft-start-button" type="button" onClick={() => onStartNegotiation({ comparisonKind: "product", comparisonId: selectedComparison.id, comparisonVersion: previewRevision.version, comparisonRevisionId: previewRevision.id, comparisonRevisionFingerprint: previewRevision.fingerprint, requestId: selectedComparison.target.requestId, requestVersion: selectedComparison.target.requestVersion, reviewRevisionId: selectedComparison.target.reviewRevisionId, reviewRevisionFingerprint: selectedComparison.target.reviewRevisionFingerprint, proposalId: input.proposalId, proposalVersion: input.proposalVersion, proposalRevisionId: input.proposalRevisionId, proposalRevisionFingerprint: input.proposalRevisionFingerprint, proposalLineId: line.proposalLineId, criterionKind: "product-line", criterionId: line.requestItemId, criterionLabel: line.requestLabel, supplierSnapshot: structuredClone(input.supplierSnapshot) })} disabled={negotiationDraftsStorageLocked || effectiveStatus !== "current" || !currentPreview} aria-label={`بازکردن یا ساخت پیش‌نویس سؤال دربارهٔ ${line.requestLabel} برای ${result.supplierDisplayName}`} data-testid="negotiation-draft-start" data-comparison-kind="product" data-proposal-id={result.proposalId} data-criterion-id={line.requestItemId}><MessageSquare size={16} /> بازکردن یا ساخت پیش‌نویس این قلم</button></details>; })}<dl className="proposal-detail-meta comparison-result-totals"><div><dt>جمع اقلام</dt><dd>{formatBuilderProposalComparisonMoney(result.subtotal)}</dd></div><div><dt>مالیات محاسبه‌شده</dt><dd>{formatBuilderProposalComparisonMoney(result.taxAmount)}<small>{input.taxTreatment.assumption ?? "وضعیت نامشخص"}</small></dd></div><div><dt>حمل محاسبه‌شده</dt><dd>{formatBuilderProposalComparisonMoney(result.transportAmount)}<small>{input.transportTreatment.assumption ?? "وضعیت نامشخص"}</small></dd></div><div><dt>مبلغ هم‌سطح</dt><dd><strong>{formatBuilderProposalComparisonMoney(result.normalizedTotal)}</strong></dd></div></dl>{result.missingReasons.length ? <ul className="comparison-missing-list">{result.missingReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul> : null}</section>; })}</div>
      <section className="proposal-detail-section" data-testid="comparison-treatment-audit"><div className="proposal-section-heading"><span><small>فرمول و فرض‌های پولی</small><strong>ممیزی همین نسخه</strong></span></div><div className="comparison-results-list">{previewRevision.inputs.map((input) => <article className="comparison-result-card" key={input.proposalId}><strong>{input.supplierSnapshot.displayName}</strong><dl className="proposal-detail-meta comparison-result-totals"><div><dt>مالیات</dt><dd><small>حالت: {builderProposalComparisonTaxModeLabel(input.taxTreatment.mode)}</small><small>مقدار ورودی: {input.taxTreatment.value ?? "ندارد"}</small><small>فرمول: {builderProposalComparisonTaxFormula(input.taxTreatment)}</small><small>فرض: {input.taxTreatment.assumption ?? "ثبت نشده"}</small></dd></div><div><dt>حمل</dt><dd><small>حالت: {builderProposalComparisonTransportModeLabel(input.transportTreatment.mode)}</small><small>مقدار ورودی: {input.transportTreatment.value ?? "ندارد"}</small><small>فرمول: {builderProposalComparisonTransportFormula(input.transportTreatment)}</small><small>فرض: {input.transportTreatment.assumption ?? "ثبت نشده"}</small></dd></div></dl></article>)}</div></section>
      {decisionsStorageLocked ? <section className="proposal-storage-error" role="alert" data-testid="comparison-decision-storage-error"><CircleHelp size={19} /><span><strong>وضعیت تصمیم‌های محلی قابل تأیید نیست</strong><small>خواندن مخزن تصمیم کامل نشد؛ این وضعیت «تصمیم ثبت نشده» نیست و هر تغییر تا بازیابی موفق قفل می‌ماند.</small></span></section> : <ProposalComparisonDecisionPanel key={`${selectedComparison.id}:${previewRevision.id}:${decision?.currentRevisionId ?? "none"}`} comparison={selectedComparison} revision={previewRevision} decision={decision} disabled={!currentPreview || effectiveStatus !== "current"} onSave={(draft) => onUpsertDecision(selectedComparison.id, previewRevision.id, draft)} />}
      <section className="proposal-detail-section"><div className="proposal-section-heading"><span><small>تاریخچهٔ تغییرناپذیر</small><strong>نسخه‌های مقایسه</strong></span></div><ol className="proposal-history">{[...selectedComparison.history].reverse().map((event) => <li key={event.id}><span><Check size={13} /></span><div><strong>{event.type === "created" ? "مقایسه ساخته شد" : "فرض‌ها و محاسبه بازبینی شد"}</strong><small>نسخهٔ {event.version.toLocaleString("fa-IR")} · {formatProjectFileDate(event.at)}</small></div></li>)}</ol></section>
      <button className="primary-button proposal-edit-button" type="button" onClick={openEdit} disabled={storageLocked || !eligibleGroups.some((group) => group.key === [selectedComparison.target.requestId, selectedComparison.target.requestVersion, selectedComparison.target.reviewRevisionId, selectedComparison.target.reviewRevisionFingerprint].join(":"))} data-testid="comparison-edit">{effectiveStatus === "current" ? "ویرایش فرض‌ها و ثبت نسخهٔ تازه" : "بازبینی با پیشنهادهای جاری"}</button>
    </main></MobileScroll><span className="sr-only" aria-live="polite">{liveMessage}</span></div>;
  }

  if (storageLocked) {
    return <div className="chida-app project-proposals-view comparisons-list-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="proposal-comparisons-view"><header className="project-workspace-header"><button className="icon-button" type="button" onClick={onBack} aria-label="بازگشت به صندوق پیشنهادها" data-testid="comparisons-back"><ArrowRight size={21} /></button><span className="project-workspace-title"><small>صندوق پیشنهادها</small><strong>مقایسه‌های محصول</strong></span><span className="project-workspace-header-spacer" /></header><MobileScroll className="project-proposals-scroll"><main className="project-proposals-content"><section className="project-proposals-heading"><span className="project-proposals-mark"><LayoutGrid size={24} /></span><div><small>T7-B1 · خصوصی · پروژهٔ {project.name}</small><h1>مقایسهٔ هم‌سطح و تصمیم</h1><p>اصل پیشنهادها جدا می‌ماند؛ فقط فرض‌های صریح شما وارد محاسبهٔ قطعی می‌شوند.</p></div></section><section className="proposal-storage-error" role="alert" data-testid="comparison-storage-error"><CircleHelp size={19} /><span><strong>بازیابی مقایسه‌ها کامل نشد</strong><small>برای جلوگیری از بازنویسی دادهٔ ناخوانده، ساخت و ویرایش مقایسه و تصمیم قفل شده است؛ پیشنهادهای اصلی دست‌نخورده‌اند.</small></span></section><div className="project-proposals-toolbar"><span><strong>—</strong><small>وضعیت نامشخص</small></span><button ref={addButtonRef} className="primary-button" type="button" disabled data-testid="comparison-add"><Plus size={17} /> ساخت مقایسه</button></div></main></MobileScroll></div>;
  }

  return <div className="chida-app project-proposals-view comparisons-list-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="proposal-comparisons-view"><header className="project-workspace-header"><button className="icon-button" type="button" onClick={onBack} aria-label="بازگشت به صندوق پیشنهادها" data-testid="comparisons-back"><ArrowRight size={21} /></button><span className="project-workspace-title"><small>صندوق پیشنهادها</small><strong>مقایسه‌های محصول</strong></span><span className="project-workspace-header-spacer" /></header><MobileScroll className="project-proposals-scroll"><main className="project-proposals-content"><section className="project-proposals-heading"><span className="project-proposals-mark"><LayoutGrid size={24} /></span><div><small>T7-B1 · خصوصی · پروژهٔ {project.name}</small><h1>مقایسهٔ هم‌سطح و تصمیم</h1><p>اصل پیشنهادها جدا می‌ماند؛ فقط فرض‌های صریح شما وارد محاسبهٔ قطعی می‌شوند.</p></div></section><section className="proposal-honesty-banner"><ShieldCheck size={18} /><span><strong>دامنهٔ این برش فقط محصول است</strong><small>مقایسهٔ خدمت، AI، استخراج متن، رتبه‌بندی اعتبار و هر اقدام خرید یا ارسال در این مسیر وجود ندارد.</small></span></section><div className="project-proposals-toolbar"><span><strong>{orderedComparisons.length.toLocaleString("fa-IR")}</strong><small>مقایسهٔ نسخه‌دار</small></span><button ref={addButtonRef} className="primary-button" type="button" onClick={openCreate} disabled={eligibleGroups.length === 0} data-testid="comparison-add"><Plus size={17} /> ساخت مقایسه</button></div>{eligibleGroups.length === 0 ? <p className="proposal-prerequisite-note" data-testid="comparison-prerequisite-note">برای ساخت مقایسه، دست‌کم دو پیشنهاد محصولِ جاری باید به همان نسخهٔ دقیق یک درخواست وصل باشند.</p> : null}{orderedComparisons.length ? <div className="project-proposals-list comparison-list">{orderedComparisons.map((comparison) => { const revision = comparison.revisions.find((item) => item.id === comparison.currentRevisionId)!; const status = builderProposalComparisonEffectiveStatus(comparison, proposals, requests, approvals, contacts); return <button className="proposal-card comparison-card" type="button" key={comparison.id} data-comparison-id={comparison.id} onClick={() => { setSelectedId(comparison.id); setPreviewRevisionId(comparison.currentRevisionId); setLiveMessage(""); window.requestAnimationFrame(() => detailHeadingRef.current?.focus()); }} data-testid="comparison-card"><span className="proposal-card-icon"><LayoutGrid size={20} /></span><span className="proposal-card-copy"><span><small>{status === "current" ? "نسخهٔ جاری" : "تاریخی · بازبینی"}</small><small>{formatProjectFileDate(comparison.updatedAt)}</small></span><strong>{comparison.requestSnapshot.title}</strong><em>{revision.inputs.length.toLocaleString("fa-IR")} پیشنهاد · {revision.recommendation.status === "conditional" ? "جمع‌بندی شرطی" : revision.recommendation.status === "tie" ? "تساوی" : "دادهٔ ناکافی"}</em><small>نسخهٔ مقایسه {revision.version.toLocaleString("fa-IR")}</small></span><ArrowRight size={17} /></button>; })}</div> : <section className="proposal-empty-state"><LayoutGrid size={26} /><h2>مقایسه‌ای ثبت نشده</h2><p>پس از ثبت دو پیشنهاد جاری برای یک درخواست محصول، فرض‌ها را شفاف هم‌سطح کن.</p></section>}</main></MobileScroll><span className="sr-only" aria-live="polite">{liveMessage}</span></div>;
}

function builderServiceProposalComparisonAssessmentLabel(value: BuilderServiceProposalComparisonAssessment) {
  if (value === "aligned") return "هم‌راستا با نیاز";
  if (value === "partial") return "پوشش جزئی";
  if (value === "different") return "متفاوت";
  if (value === "not-applicable") return "برای این نیاز نامرتبط";
  return "انطباق نامشخص";
}

function builderServiceProposalComparisonOutcomeLabel(outcome: BuilderServiceProposalComparisonDecisionOutcome) {
  if (outcome === "preferred-for-follow-up") return "ادامهٔ بررسی با یک پیشنهاد";
  if (outcome === "needs-clarification") return "نیازمند روشن‌سازی";
  return "فعلاً هیچ‌کدام";
}

function ServiceProposalComparisonDecisionPanel({ comparison, revision, decision, disabled, onSave }: { comparison: BuilderServiceProposalComparisonRecord; revision: BuilderServiceProposalComparisonRevision; decision: BuilderServiceProposalComparisonDecisionRecord | null; disabled: boolean; onSave: (draft: BuilderServiceProposalComparisonDecisionDraft) => false | "unchanged" | "created" | "updated" }) {
  const currentDecisionRevision = decision?.revisions.find((item) => item.id === decision.currentRevisionId) ?? null;
  const [draft, setDraft] = useState<BuilderServiceProposalComparisonDecisionDraft>(() => ({ outcome: currentDecisionRevision?.outcome ?? "no-selection", selectedProposalId: currentDecisionRevision?.selectedProposalId ?? "", reason: currentDecisionRevision?.reason ?? "" }));
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (draft.outcome === "preferred-for-follow-up" && !draft.selectedProposalId) {
      setError("پیشنهادی را که می‌خواهی بیشتر بررسی شود انتخاب کن.");
      document.getElementById("service-comparison-decision-proposal")?.focus();
      return;
    }
    if (!draft.reason.trim()) {
      setError("دلیل تصمیم سازنده را ثبت کن.");
      document.getElementById("service-comparison-decision-reason")?.focus();
      return;
    }
    const result = onSave(draft);
    if (!result) {
      setError("تصمیم ثبت نشد؛ دادهٔ محلی و نسخهٔ مقایسه را دوباره بررسی کن.");
      return;
    }
    setError("");
    setMessage(result === "unchanged" ? "تغییر تازه‌ای برای ثبت وجود نداشت." : "تصمیم خصوصی شما به‌صورت نسخه‌دار ثبت شد.");
  };
  return (
    <section className="proposal-detail-section comparison-decision-section" aria-labelledby="service-comparison-decision-title" data-testid="service-comparison-decision-section">
      <div className="proposal-section-heading"><span><small>تصمیم مستقل سازنده</small><strong id="service-comparison-decision-title">ثبت تصمیم من</strong></span><em>{decision ? `نسخهٔ ${decision.version.toLocaleString("fa-IR")}` : "ثبت نشده"}</em></div>
      <p className="comparison-boundary-note"><ShieldCheck size={16} /> این تصمیم سفارش، قرارداد، پرداخت، پیام یا اطلاع به مجری ایجاد نمی‌کند.</p>
      <form className="comparison-decision-form" onSubmit={submit}>
        <label className="field-control" htmlFor="service-comparison-decision-outcome"><span>وضعیت تصمیم</span><select id="service-comparison-decision-outcome" value={draft.outcome} onChange={(event) => { const outcome = event.target.value as BuilderServiceProposalComparisonDecisionOutcome; setDraft((current) => ({ ...current, outcome, selectedProposalId: outcome === "preferred-for-follow-up" ? current.selectedProposalId : "" })); setError(""); }} disabled={disabled} data-testid="service-comparison-decision-outcome"><option value="no-selection">فعلاً هیچ‌کدام</option><option value="needs-clarification">نیازمند روشن‌سازی</option><option value="preferred-for-follow-up">ادامهٔ بررسی با یک پیشنهاد</option></select></label>
        {draft.outcome === "preferred-for-follow-up" ? <label className="field-control" htmlFor="service-comparison-decision-proposal"><span>پیشنهاد برای ادامهٔ بررسی</span><select id="service-comparison-decision-proposal" value={draft.selectedProposalId} onChange={(event) => { setDraft((current) => ({ ...current, selectedProposalId: event.target.value })); setError(""); }} disabled={disabled} data-testid="service-comparison-decision-proposal"><option value="">انتخاب پیشنهاد</option>{revision.inputs.map((input) => <option key={input.proposalId} value={input.proposalId}>{input.supplierSnapshot.displayName}</option>)}</select></label> : null}
        <label className="field-control" htmlFor="service-comparison-decision-reason"><span>دلیل شما</span><KeyboardTextarea id="service-comparison-decision-reason" value={draft.reason} onChange={(event) => { setDraft((current) => ({ ...current, reason: event.target.value })); setError(""); }} rows={3} placeholder="چرا این تصمیم را ثبت می‌کنی؟" disabled={disabled} data-testid="service-comparison-decision-reason" /></label>
        {error ? <p className="proposal-form-error" role="alert" data-testid="service-comparison-decision-error">{error}</p> : null}
        {message ? <p className="comparison-save-message" role="status">{message}</p> : null}
        <button className="primary-button" type="submit" disabled={disabled} data-testid="service-comparison-decision-save">{decision ? "ثبت نسخهٔ تازهٔ تصمیم" : "ثبت تصمیم خصوصی"}</button>
      </form>
      {decision ? <ol className="proposal-history comparison-decision-history" data-testid="service-comparison-decision-history">{[...decision.revisions].reverse().map((item) => { const selectedSupplier = item.selectedProposalId ? revision.inputs.find((input) => input.proposalId === item.selectedProposalId)?.supplierSnapshot.displayName ?? "پیشنهاد ناشناخته" : null; return <li key={item.id}><span><Check size={13} /></span><div><strong>{builderServiceProposalComparisonOutcomeLabel(item.outcome)}</strong><small>نسخهٔ {item.version.toLocaleString("fa-IR")} · {formatProjectFileDate(item.createdAt)}</small>{item.selectedProposalId ? <small>پیشنهاد: {selectedSupplier} · شناسه: {item.selectedProposalId}</small> : <small>پیشنهاد منتخب ندارد</small>}<small>{item.reason}</small></div></li>; })}</ol> : null}
    </section>
  );
}

function ProjectServiceProposalComparisonsView({ project, proposals, comparisons, decisions, negotiationDrafts, requests, approvals, contacts, storageLocked, decisionsStorageLocked, negotiationDraftsStorageLocked, initialNegotiationTarget, onBack, onCreate, onUpdate, onUpsertDecision, onStartNegotiation }: { project: BuilderProject; proposals: BuilderRecordedProposalRecord[]; comparisons: BuilderServiceProposalComparisonRecord[]; decisions: BuilderServiceProposalComparisonDecisionRecord[]; negotiationDrafts: BuilderNegotiationDraftRecord[]; requests: ProjectPurchaseRequestRecord[]; approvals: ProjectApprovalRecord[]; contacts: SupplierContactRecord[]; storageLocked: boolean; decisionsStorageLocked: boolean; negotiationDraftsStorageLocked: boolean; initialNegotiationTarget: BuilderNegotiationDraftTarget | null; onBack: () => void; onCreate: (draft: BuilderServiceProposalComparisonDraft) => string | null; onUpdate: (comparisonId: string, draft: BuilderServiceProposalComparisonDraft) => false | "unchanged" | "updated"; onUpsertDecision: (comparisonId: string, revisionId: string, draft: BuilderServiceProposalComparisonDecisionDraft) => false | "unchanged" | "created" | "updated"; onStartNegotiation: (target: BuilderNegotiationDraftTarget) => void }) {
  const keyboard = useKeyboard();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const editorHeadingRef = useRef<HTMLSpanElement>(null);
  const detailHeadingRef = useRef<HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialNegotiationTarget?.comparisonKind === "service" ? initialNegotiationTarget.comparisonId : null);
  const [previewRevisionId, setPreviewRevisionId] = useState<string | null>(initialNegotiationTarget?.comparisonKind === "service" ? initialNegotiationTarget.comparisonRevisionId : null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BuilderServiceProposalComparisonDraft>({ requestKey: "", proposals: [] });
  const [formError, setFormError] = useState("");
  const [liveMessage, setLiveMessage] = useState("");
  const currentServiceProposals = useMemo(() => proposals.filter((proposal) => proposal.target.requestKind === "service" && builderRecordedProposalEffectiveStatus(proposal, requests, approvals, contacts) === "current"), [approvals, contacts, proposals, requests]);
  const eligibleGroups = useMemo(() => {
    const groups = new Map<string, BuilderRecordedProposalRecord[]>();
    currentServiceProposals.forEach((proposal) => {
      const key = builderProposalComparisonRequestKey(proposal);
      groups.set(key, [...(groups.get(key) ?? []), proposal]);
    });
    return Array.from(groups.entries()).flatMap(([key, items]) => {
      if (items.length < 2) return [];
      const first = items[0];
      const request = requests.find((item) => item.id === first.target.requestId && item.projectId === project.id);
      const reviewRevision = request?.reviewRevisions.find((item) => item.id === first.target.reviewRevisionId && item.requestVersion === first.target.requestVersion && item.fingerprint === first.target.reviewRevisionFingerprint);
      const requestSnapshot = reviewRevision ? builderServiceProposalComparisonRequestSnapshotFromReview(reviewRevision.snapshot) : null;
      return requestSnapshot ? [{ key, proposals: items, title: requestSnapshot.scope ?? "خدمت درخواستی", requestSnapshot }] : [];
    });
  }, [currentServiceProposals, project.id, requests]);
  const orderedComparisons = useMemo(() => [...comparisons].sort((first, second) => second.updatedAt.localeCompare(first.updatedAt)), [comparisons]);
  const selectedComparison = comparisons.find((comparison) => comparison.id === selectedId) ?? null;
  const currentRevision = selectedComparison?.revisions.find((revision) => revision.id === selectedComparison.currentRevisionId) ?? null;
  const previewRevision = selectedComparison?.revisions.find((revision) => revision.id === previewRevisionId) ?? currentRevision;
  const draftGroup = eligibleGroups.find((group) => group.key === draft.requestKey) ?? (selectedComparison && draft.requestKey === [selectedComparison.target.requestId, selectedComparison.target.requestVersion, selectedComparison.target.reviewRevisionId, selectedComparison.target.reviewRevisionFingerprint].join(":") ? { key: draft.requestKey, proposals: [], title: selectedComparison.requestSnapshot.scope ?? "خدمت درخواستی", requestSnapshot: selectedComparison.requestSnapshot } : null);
  const liveInputs = draftGroup ? normalizeBuilderServiceProposalComparisonInputs(draft, currentServiceProposals, draftGroup.requestSnapshot) : null;
  const livePreview = liveInputs && draftGroup ? deriveBuilderServiceProposalComparisonPayload(liveInputs, currentServiceProposals, draftGroup.requestSnapshot) : null;

  useEffect(() => {
    if (initialNegotiationTarget?.comparisonKind !== "service") return;
    window.requestAnimationFrame(() => Array.from(document.querySelectorAll<HTMLElement>('[data-testid="negotiation-draft-start"]')).find((element) => element.dataset.comparisonKind === "service" && element.dataset.proposalId === initialNegotiationTarget.proposalId && element.dataset.criterionId === initialNegotiationTarget.criterionId)?.focus());
  }, [initialNegotiationTarget]);

  const openCreate = () => {
    if (storageLocked || !eligibleGroups.length) return;
    const key = eligibleGroups.length === 1 ? eligibleGroups[0].key : "";
    setEditingId(null);
    setDraft(key ? builderServiceProposalComparisonDefaultDraft(currentServiceProposals, key) : { requestKey: "", proposals: [] });
    setFormError("");
    setEditorOpen(true);
    window.requestAnimationFrame(() => editorHeadingRef.current?.focus());
  };
  const openEdit = () => {
    if (!selectedComparison || !currentRevision || storageLocked || builderServiceProposalComparisonEffectiveStatus(selectedComparison, proposals, requests, approvals, contacts) !== "current") return;
    setEditingId(selectedComparison.id);
    setDraft(builderServiceProposalComparisonDraftFromRecord(selectedComparison));
    setFormError("");
    setEditorOpen(true);
    window.requestAnimationFrame(() => editorHeadingRef.current?.focus());
  };
  const closeEditor = () => {
    keyboard.hide();
    setEditorOpen(false);
    setFormError("");
    window.requestAnimationFrame(() => (editingId ? detailHeadingRef.current : addButtonRef.current)?.focus());
  };
  const changeGroup = (requestKey: string) => {
    setDraft(requestKey ? builderServiceProposalComparisonDefaultDraft(currentServiceProposals, requestKey) : { requestKey: "", proposals: [] });
    setFormError("");
  };
  const updateProposalDraft = (proposalId: string, updater: (current: BuilderServiceProposalComparisonProposalDraft) => BuilderServiceProposalComparisonProposalDraft) => {
    setDraft((current) => ({ ...current, proposals: current.proposals.map((item) => item.proposalId === proposalId ? updater(item) : item) }));
    setFormError("");
  };
  const updateCriterionDraft = (proposalId: string, criterionId: BuilderServiceProposalComparisonCriterionId, updater: (current: BuilderServiceProposalComparisonCriterionDraft) => BuilderServiceProposalComparisonCriterionDraft) => updateProposalDraft(proposalId, (current) => ({ ...current, criteria: current.criteria.map((criterion) => criterion.criterionId === criterionId ? updater(criterion) : criterion) }));
  const saveComparison = (event: React.FormEvent) => {
    event.preventDefault();
    keyboard.hide();
    if (!draft.requestKey) {
      setFormError("درخواست خدمت دارای حداقل دو پیشنهاد جاری را انتخاب کن.");
      document.getElementById("service-comparison-request-select")?.focus();
      return;
    }
    if (draft.proposals.filter((item) => item.selected).length < 2) {
      setFormError("برای مقایسه دست‌کم دو پیشنهاد خدمت را نگه دار.");
      document.querySelector<HTMLElement>("[data-testid='service-comparison-proposal-toggle']")?.focus();
      return;
    }
    if (!liveInputs || !livePreview) {
      setFormError("یکی از ارزیابی‌ها ناسازگار است؛ مقدار اعلامی، وضعیت و دلیل را بررسی کن.");
      document.querySelector<HTMLElement>("[data-testid='service-comparison-assessment-status']")?.focus();
      return;
    }
    if (editingId) {
      const result = onUpdate(editingId, draft);
      if (!result) {
        setFormError("نسخهٔ مقایسه ثبت نشد؛ پیشنهادهای جاری و ذخیره‌سازی محلی را دوباره بررسی کن.");
        return;
      }
      setLiveMessage(result === "unchanged" ? "تغییر تازه‌ای برای ثبت وجود نداشت." : "نسخهٔ تازهٔ مقایسهٔ خدمت ثبت شد؛ تصمیم نسخهٔ قبل تاریخی باقی ماند.");
      setEditorOpen(false);
      setPreviewRevisionId(null);
      window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
      return;
    }
    const createdId = onCreate(draft);
    if (!createdId) {
      setFormError("مقایسه ثبت نشد؛ پیشنهادهای جاری و ذخیره‌سازی محلی را دوباره بررسی کن.");
      return;
    }
    setSelectedId(createdId);
    setPreviewRevisionId(null);
    setLiveMessage("ماتریس خصوصی و نسخه‌دار خدمت ثبت شد.");
    setEditorOpen(false);
    window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
  };

  if (editorOpen) {
    const selectedCount = draft.proposals.filter((item) => item.selected).length;
    return (
      <div className="chida-app project-proposals-view comparison-editor-view service-comparison-editor-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="service-comparison-editor">
        <header className="project-workspace-header"><button className="icon-button" type="button" onClick={closeEditor} aria-label="بستن فرم مقایسهٔ خدمت" data-testid="service-comparison-editor-back"><ArrowRight size={21} /></button><span ref={editorHeadingRef} className="project-workspace-title" tabIndex={-1} data-testid="service-comparison-editor-title"><small>T7-B2 · خدمت</small><strong>{editingId ? "بازبینی ماتریس خدمت" : "ساخت ماتریس خدمت"}</strong></span><span className="project-workspace-header-spacer" aria-hidden="true" /></header>
        <MobileScroll className="project-proposals-scroll"><form className="proposal-editor-content comparison-editor-content" onSubmit={saveComparison} noValidate>
          <section className="proposal-honesty-banner"><ShieldCheck size={18} /><span><strong>مقایسهٔ کیفی مستقل خدمت</strong><small>پاسخ هر معیار، رونویسی تکمیلی شماست؛ ارزیابی نیز نظر شماست. مبلغ اعلامی فقط نمایش داده می‌شود و هیچ امتیاز، رتبه، گزینهٔ برتر، AI، شبکه یا اثر بیرونی ساخته نمی‌شود.</small></span></section>
          <section className="proposal-form-section" aria-labelledby="service-comparison-target-title"><div className="proposal-section-heading"><span><small>اتصال دقیق</small><strong id="service-comparison-target-title">درخواست و پیشنهادهای جاری</strong></span></div>{editingId ? <div className="proposal-locked-grid"><div><small>درخواست خدمت</small><strong>{selectedComparison?.requestSnapshot.scope ?? "خدمت درخواستی"}</strong><span>نسخهٔ {selectedComparison?.target.requestVersion.toLocaleString("fa-IR")} · ثابت</span></div></div> : <label className="field-control" htmlFor="service-comparison-request-select"><span>درخواست دارای چند پیشنهاد</span><select id="service-comparison-request-select" value={draft.requestKey} onChange={(event) => changeGroup(event.target.value)} data-testid="service-comparison-request-select"><option value="">انتخاب درخواست خدمت</option>{eligibleGroups.map((group) => <option key={group.key} value={group.key}>{group.title} · {group.proposals.length.toLocaleString("fa-IR")} پیشنهاد</option>)}</select></label>}
            {draft.proposals.length ? <div className="comparison-proposal-toggles">{draft.proposals.map((proposalDraft) => { const proposal = currentServiceProposals.find((item) => item.id === proposalDraft.proposalId); return proposal ? <button type="button" key={proposal.id} aria-pressed={proposalDraft.selected} onClick={() => updateProposalDraft(proposal.id, (current) => ({ ...current, selected: !current.selected }))} data-testid="service-comparison-proposal-toggle" data-proposal-id={proposal.id}><span>{proposalDraft.selected ? <Check size={14} /> : null}</span><strong>{proposal.supplierSnapshot.displayName}</strong><small>نسخهٔ {proposal.version.toLocaleString("fa-IR")}</small></button> : null; })}</div> : null}<p className="comparison-boundary-note">{selectedCount.toLocaleString("fa-IR")} پیشنهاد انتخاب شده؛ اصل پیشنهاد و store محصول دست‌نخورده می‌مانند.</p></section>
          {draftGroup ? <section className="proposal-form-section service-comparison-matrix" aria-labelledby="service-comparison-matrix-title"><div className="proposal-section-heading"><span><small>نیاز ← رونویسی ← ارزیابی</small><strong id="service-comparison-matrix-title">ماتریس معیارهای خدمت</strong></span><em>خالی یا نامشخص = روشن‌سازی</em></div>{builderServiceProposalComparisonCriteriaV1.map((definition, criterionIndex) => { const requestValue = draftGroup.requestSnapshot[definition.requestField]; return <article className="service-comparison-criterion-editor" key={definition.id} data-testid="service-comparison-criterion-editor" data-criterion={definition.id}><div className="service-comparison-criterion-heading"><span><small>معیار {(criterionIndex + 1).toLocaleString("fa-IR")}</small><strong>{definition.label}</strong></span><em>{requestValue ?? "درخواست: نامشخص"}</em></div><div className="service-comparison-assessments">{draft.proposals.filter((item) => item.selected).map((proposalDraft, proposalIndex) => { const proposal = currentServiceProposals.find((item) => item.id === proposalDraft.proposalId); const criterion = proposalDraft.criteria.find((item) => item.criterionId === definition.id)!; if (!proposal) return null; const prefix = `service-comparison-${criterionIndex}-${proposalIndex}`; return <section className="service-comparison-proposal-assessment" key={proposal.id} data-testid="service-comparison-proposal-assessment" data-proposal-id={proposal.id}><strong>{proposal.supplierSnapshot.displayName}</strong><small>رونویسی و ارزیابی دستی شما · نه ادعای احرازشده</small><label className="field-control" htmlFor={`${prefix}-assessment`}><span>وضعیت انطباق</span><select id={`${prefix}-assessment`} aria-label={`وضعیت انطباق ${definition.label} برای ${proposal.supplierSnapshot.displayName}`} value={criterion.assessment} onChange={(event) => { const assessment = event.target.value as BuilderServiceProposalComparisonAssessment; updateCriterionDraft(proposal.id, definition.id, (current) => ({ ...current, assessment, declaredValue: assessment === "not-applicable" ? "" : current.declaredValue, rationale: "" })); }} data-testid="service-comparison-assessment-status"><option value="unknown">انطباق نامشخص</option><option value="aligned" disabled={requestValue === null}>هم‌راستا با نیاز</option><option value="partial" disabled={requestValue === null}>پوشش جزئی</option><option value="different" disabled={requestValue === null}>متفاوت</option><option value="not-applicable" disabled={requestValue !== null}>برای این نیاز نامرتبط</option></select></label>{criterion.assessment !== "not-applicable" ? <label className="field-control" htmlFor={`${prefix}-declared`}><span>مقدار اعلامی رونویسی‌شده <small>(برای نامشخص اختیاری)</small></span><KeyboardTextarea id={`${prefix}-declared`} aria-label={`مقدار اعلامی ${definition.label} برای ${proposal.supplierSnapshot.displayName}`} value={criterion.declaredValue} onChange={(event) => updateCriterionDraft(proposal.id, definition.id, (current) => ({ ...current, declaredValue: event.target.value }))} rows={2} placeholder="آنچه مجری بیرون از چیدا اعلام کرده…" data-testid="service-comparison-declared-value" /></label> : null}<label className="field-control" htmlFor={`${prefix}-rationale`}><span>{criterion.assessment === "unknown" ? "یادداشت یا سؤال روشن‌سازی (اختیاری)" : "دلیل ارزیابی شما"}</span><KeyboardTextarea id={`${prefix}-rationale`} aria-label={`دلیل ارزیابی ${definition.label} برای ${proposal.supplierSnapshot.displayName}`} value={criterion.rationale} onChange={(event) => updateCriterionDraft(proposal.id, definition.id, (current) => ({ ...current, rationale: event.target.value }))} rows={2} placeholder={criterion.assessment === "unknown" ? "چه چیزی هنوز روشن نیست؟" : "چرا این وضعیت را انتخاب کردی؟"} data-testid="service-comparison-assessment-rationale" /></label></section>; })}</div></article>; })}</section> : null}
          {livePreview ? <section className={`comparison-recommendation-preview ${livePreview.summary.status === "needs-clarification" ? "insufficient-data" : ""}`} data-testid="service-comparison-coverage-preview"><CircleHelp size={20} /><span><small>پوشش ماتریس؛ نه امتیاز</small><strong>{livePreview.summary.status === "ready-for-human-decision" ? "آماده برای تصمیم انسانی" : `${livePreview.summary.unknownCount.toLocaleString("fa-IR")} معیار نیازمند روشن‌سازی`}</strong><p>{livePreview.summary.reason}</p></span></section> : null}
          {formError ? <p className="proposal-form-error" role="alert" data-testid="service-comparison-form-error">{formError}</p> : null}<div className="proposal-editor-actions"><button className="secondary-button" type="button" onClick={closeEditor}>انصراف</button><button className="primary-button" type="submit" data-testid="service-comparison-save">{editingId ? "ثبت نسخهٔ تازه" : "ثبت ماتریس خدمت"}</button></div>
        </form></MobileScroll>
      </div>
    );
  }

  if (selectedComparison && previewRevision) {
    const currentPreview = previewRevision.id === selectedComparison.currentRevisionId;
    const effectiveStatus = builderServiceProposalComparisonEffectiveStatus(selectedComparison, proposals, requests, approvals, contacts, previewRevision.id);
    const decision = decisions.find((item) => item.target.comparisonId === selectedComparison.id && item.target.comparisonRevisionId === previewRevision.id) ?? null;
    return (
      <div className="chida-app project-proposals-view comparison-detail-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="service-comparison-detail">
        <header className="project-workspace-header"><button className="icon-button" type="button" onClick={() => { setSelectedId(null); setPreviewRevisionId(null); window.requestAnimationFrame(() => Array.from(document.querySelectorAll<HTMLElement>("[data-service-comparison-id]")).find((element) => element.dataset.serviceComparisonId === selectedComparison.id)?.focus()); }} aria-label="بازگشت به مقایسه‌های خدمت" data-testid="service-comparison-detail-back"><ArrowRight size={21} /></button><span className="project-workspace-title"><small>T7-B2 · خدمت</small><strong>ماتریس و تصمیم</strong></span><span className="project-workspace-header-spacer" /></header>
        <MobileScroll className="project-proposals-scroll"><main className="proposal-detail-content comparison-detail-content">
          <section className="proposal-detail-hero comparison-detail-hero" tabIndex={-1} ref={detailHeadingRef} data-testid="service-comparison-detail-hero"><span className="proposal-detail-icon"><LayoutGrid size={24} /></span><span className={`proposal-status-badge ${effectiveStatus}`}>{effectiveStatus === "current" ? currentPreview ? "نسخهٔ جاری" : "نسخهٔ تاریخی مقایسه" : "تاریخی · نیازمند بازبینی"}</span><h1>{selectedComparison.requestSnapshot.scope ?? "خدمت درخواستی"}</h1><p>{previewRevision.inputs.length.toLocaleString("fa-IR")} پیشنهاد · نسخهٔ مقایسه {previewRevision.version.toLocaleString("fa-IR")}</p></section>
          <section className="proposal-honesty-banner"><ShieldCheck size={18} /><span><strong>این خروجی رتبه‌بندی نیست</strong><small>ماتریس از رونویسی و ارزیابی دستی شما ساخته شده؛ مبلغ، صلاحیت و ضمانت احراز یا نرمال نشده‌اند و هیچ اقدام بیرونی رخ نداده است.</small></span></section>
          {selectedComparison.revisions.length > 1 ? <label className="proposal-revision-picker" htmlFor="service-comparison-revision-select"><span>نمایش نسخه</span><select id="service-comparison-revision-select" value={previewRevision.id} onChange={(event) => setPreviewRevisionId(event.target.value)} data-testid="service-comparison-revision-select">{[...selectedComparison.revisions].reverse().map((revision) => <option key={revision.id} value={revision.id}>نسخهٔ {revision.version.toLocaleString("fa-IR")} · {revision.id === selectedComparison.currentRevisionId ? "جاری" : "تاریخی"}</option>)}</select></label> : null}
          <section className={`comparison-recommendation-detail ${previewRevision.summary.status === "needs-clarification" ? "insufficient-data" : ""}`} data-testid="service-comparison-summary"><CircleHelp size={21} /><span><small>جمع‌بندی پوشش؛ نامزد خودکار ندارد</small><strong>{previewRevision.summary.status === "ready-for-human-decision" ? "آماده برای تصمیم انسانی" : `${previewRevision.summary.unknownCount.toLocaleString("fa-IR")} معیار نیازمند روشن‌سازی`}</strong><p>{previewRevision.summary.reason}</p></span></section>
          <section className="proposal-detail-section"><div className="proposal-section-heading"><span><small>قیمت و شروط خام</small><strong>فقط نمایش اعلامی؛ خارج از نتیجه</strong></span></div><div className="comparison-results-list">{previewRevision.results.map((result) => <article className="comparison-result-card service-commercial-card" key={result.proposalId}><strong>{result.supplierDisplayName}</strong><dl className="proposal-detail-meta"><div><dt>وضعیت</dt><dd>{builderRecordedProposalLineStatusLabel(result.declaredCommercialSnapshot.status)}</dd></div><div><dt>قیمت کل</dt><dd>{formatBuilderProposalComparisonMoney(result.declaredCommercialSnapshot.totalPrice)}</dd></div><div><dt>موعد اعلامی</dt><dd>{result.declaredCommercialSnapshot.leadTime ?? "نامشخص"}</dd></div><div><dt>پرداخت اعلامی</dt><dd>{result.declaredCommercialSnapshot.paymentTerms ?? "نامشخص"}</dd></div><div><dt>اعتبار پیشنهاد</dt><dd>{result.declaredCommercialSnapshot.validity ?? "نامشخص"}</dd></div></dl><small>هیچ فرمول، نرخ، جمع یا رتبه‌ای از این داده ساخته نشده است.</small></article>)}</div></section>
          {negotiationDraftsStorageLocked ? <section className="proposal-storage-error" role="alert" data-testid="negotiation-draft-storage-error"><CircleHelp size={19} /><span><strong>وضعیت پیش‌نویس‌های مذاکره قابل تأیید نیست</strong><small>خواندن مخزن کامل نشد؛ شروع پیش‌نویس تازه تا بازیابی موفق قفل می‌ماند.</small></span></section> : null}
          <section className="proposal-detail-section"><div className="proposal-section-heading"><span><small>نیاز ← پاسخ ← ارزیابی</small><strong>معیارهای خدمت</strong></span></div><div className="service-comparison-criterion-results">{builderServiceProposalComparisonCriteriaV1.map((definition) => <article className="service-comparison-criterion-card" key={definition.id} data-testid="service-comparison-criterion-card" data-criterion={definition.id}><div className="service-comparison-criterion-heading"><span><small>نیاز ثبت‌شده</small><strong>{definition.label}</strong></span><em>{selectedComparison.requestSnapshot[definition.requestField] ?? "نامشخص"}</em></div><div className="service-comparison-assessments">{previewRevision.results.map((result) => {
            const criterion = result.criteria.find((item) => item.criterionId === definition.id)!;
            const input = previewRevision.inputs.find((item) => item.proposalId === result.proposalId)!;
            const target = {
              comparisonKind: "service",
              comparisonId: selectedComparison.id,
              comparisonVersion: previewRevision.version,
              comparisonRevisionId: previewRevision.id,
              comparisonRevisionFingerprint: previewRevision.fingerprint,
              requestId: selectedComparison.target.requestId,
              requestVersion: selectedComparison.target.requestVersion,
              reviewRevisionId: selectedComparison.target.reviewRevisionId,
              reviewRevisionFingerprint: selectedComparison.target.reviewRevisionFingerprint,
              proposalId: input.proposalId,
              proposalVersion: input.proposalVersion,
              proposalRevisionId: input.proposalRevisionId,
              proposalRevisionFingerprint: input.proposalRevisionFingerprint,
              proposalLineId: input.proposalLineId,
              criterionKind: "service-criterion",
              criterionId: definition.id,
              criterionLabel: definition.label,
              supplierSnapshot: structuredClone(input.supplierSnapshot),
            } satisfies BuilderNegotiationDraftTarget;
            return <section className={`service-comparison-result-assessment ${criterion.assessment}`} key={result.proposalId} data-proposal-id={result.proposalId}><strong>{result.supplierDisplayName}</strong><span>{builderServiceProposalComparisonAssessmentLabel(criterion.assessment)}</span><dl><div><dt>رونویسی اعلامی</dt><dd>{criterion.declaredValue ?? "نامشخص"}</dd></div><div><dt>دلیل سازنده</dt><dd>{criterion.rationale ?? "ثبت نشده"}</dd></div></dl><small>{criterion.declaredSource} · {criterion.assessmentSource}</small><button className="negotiation-draft-start-button" type="button" onClick={() => onStartNegotiation(target)} disabled={negotiationDraftsStorageLocked || effectiveStatus !== "current" || !currentPreview || !builderNegotiationServiceCriterionIsEligible(criterion.assessment)} aria-label={`بازکردن یا ساخت پیش‌نویس سؤال دربارهٔ ${definition.label} برای ${result.supplierDisplayName}`} data-testid="negotiation-draft-start" data-comparison-kind="service" data-proposal-id={result.proposalId} data-criterion-id={definition.id}><MessageSquare size={16} /> بازکردن یا ساخت پیش‌نویس این معیار</button></section>;
          })}</div></article>)}</div></section>
          {decisionsStorageLocked ? <section className="proposal-storage-error" role="alert" data-testid="service-comparison-decision-storage-error"><CircleHelp size={19} /><span><strong>وضعیت تصمیم‌های محلی قابل تأیید نیست</strong><small>خواندن مخزن تصمیم کامل نشد؛ این وضعیت «تصمیم ثبت نشده» نیست و هر تغییر تا بازیابی موفق قفل می‌ماند.</small></span></section> : <ServiceProposalComparisonDecisionPanel key={`${selectedComparison.id}:${previewRevision.id}:${decision?.currentRevisionId ?? "none"}`} comparison={selectedComparison} revision={previewRevision} decision={decision} disabled={!currentPreview || effectiveStatus !== "current"} onSave={(nextDraft) => onUpsertDecision(selectedComparison.id, previewRevision.id, nextDraft)} />}
          <section className="proposal-detail-section"><div className="proposal-section-heading"><span><small>تاریخچهٔ تغییرناپذیر</small><strong>نسخه‌های ماتریس</strong></span></div><ol className="proposal-history">{[...selectedComparison.history].reverse().map((event) => <li key={event.id}><span><Check size={13} /></span><div><strong>{event.type === "created" ? "ماتریس خدمت ساخته شد" : "ماتریس خدمت به‌روزرسانی شد"}</strong><small>نسخهٔ {event.version.toLocaleString("fa-IR")} · {formatProjectFileDate(event.at)}</small></div></li>)}</ol></section>
          <button className="primary-button proposal-edit-button" type="button" onClick={openEdit} disabled={storageLocked || effectiveStatus !== "current" || !currentPreview} data-testid="service-comparison-edit">بازبینی و ثبت نسخهٔ تازه</button>
        </main></MobileScroll><span className="sr-only" aria-live="polite">{liveMessage}</span>
      </div>
    );
  }

  return <div className="chida-app project-proposals-view comparisons-list-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="service-proposal-comparisons-view"><header className="project-workspace-header"><button className="icon-button" type="button" onClick={onBack} aria-label="بازگشت به صندوق پیشنهادها" data-testid="service-comparisons-back"><ArrowRight size={21} /></button><span className="project-workspace-title"><small>صندوق پیشنهادها</small><strong>مقایسه‌های خدمت</strong></span><span className="project-workspace-header-spacer" /></header><MobileScroll className="project-proposals-scroll"><main className="project-proposals-content"><section className="project-proposals-heading"><span className="project-proposals-mark"><LayoutGrid size={24} /></span><div><small>T7-B2 · خصوصی · پروژهٔ {project.name}</small><h1>ماتریس خدمت و تصمیم</h1><p>تفاوت‌های دامنه، روش، زمان، صلاحیت، ضمانت و پرداخت را بدون رتبه‌بندی کنار هم ببین.</p></div></section><section className="proposal-honesty-banner"><ShieldCheck size={18} /><span><strong>این مسیر مستقل از فرمول محصول است</strong><small>همهٔ پاسخ‌های معیارها رونویسی دستی شما هستند؛ هیچ استخراج، امتیاز، بهترین، قیمت هم‌سطح، AI، شبکه یا اثر بیرونی وجود ندارد.</small></span></section>{storageLocked ? <section className="proposal-storage-error" role="alert" data-testid="service-comparison-storage-error"><CircleHelp size={19} /><span><strong>وضعیت مقایسه‌های خدمت قابل تأیید نیست</strong><small>خواندن مخزن کامل نشد؛ این وضعیت «مقایسه‌ای ثبت نشده» نیست و ساخت/ویرایش قفل می‌ماند.</small></span></section> : null}<div className="project-proposals-toolbar"><span><strong>{storageLocked ? "—" : orderedComparisons.length.toLocaleString("fa-IR")}</strong><small>ماتریس نسخه‌دار</small></span><button ref={addButtonRef} className="primary-button" type="button" onClick={openCreate} disabled={storageLocked || eligibleGroups.length === 0} data-testid="service-comparison-add"><Plus size={17} /> ساخت ماتریس</button></div>{!storageLocked && eligibleGroups.length === 0 ? <p className="proposal-prerequisite-note" data-testid="service-comparison-prerequisite-note">برای ساخت ماتریس، دست‌کم دو پیشنهاد خدمتِ جاری باید به همان نسخهٔ دقیق یک درخواست وصل باشند.</p> : null}{!storageLocked && orderedComparisons.length ? <div className="project-proposals-list comparison-list">{orderedComparisons.map((comparison) => { const revision = comparison.revisions.find((item) => item.id === comparison.currentRevisionId)!; const status = builderServiceProposalComparisonEffectiveStatus(comparison, proposals, requests, approvals, contacts); return <button className="proposal-card comparison-card" type="button" key={comparison.id} data-service-comparison-id={comparison.id} onClick={() => { setSelectedId(comparison.id); setPreviewRevisionId(comparison.currentRevisionId); setLiveMessage(""); window.requestAnimationFrame(() => detailHeadingRef.current?.focus()); }} data-testid="service-comparison-card"><span className="proposal-card-icon"><LayoutGrid size={20} /></span><span className="proposal-card-copy"><span><small>{status === "current" ? "نسخهٔ جاری" : "تاریخی · بازبینی"}</small><small>{formatProjectFileDate(comparison.updatedAt)}</small></span><strong>{comparison.requestSnapshot.scope ?? "خدمت درخواستی"}</strong><em>{revision.inputs.length.toLocaleString("fa-IR")} پیشنهاد · {revision.summary.status === "ready-for-human-decision" ? "آمادهٔ تصمیم انسانی" : "نیازمند روشن‌سازی"}</em><small>نسخهٔ مقایسه {revision.version.toLocaleString("fa-IR")}</small></span><ArrowRight size={17} /></button>; })}</div> : !storageLocked ? <section className="proposal-empty-state"><LayoutGrid size={26} /><h2>ماتریسی ثبت نشده</h2><p>پس از ثبت دو پیشنهاد جاری برای یک درخواست خدمت، پاسخ‌ها و ارزیابی خودت را معیاربه‌معیار ثبت کن.</p></section> : null}</main></MobileScroll><span className="sr-only" aria-live="polite">{liveMessage}</span></div>;
}

function builderManualNegotiationResponseReviewOutcomeLabel(outcome: BuilderManualNegotiationResponseReviewOutcome) {
  if (outcome === "appears-addressed") return "از نظر شما پاسخ به پرسش می‌پردازد";
  if (outcome === "needs-clarification") return "از نظر شما نیازمند روشن‌سازی است";
  return "از نظر شما تعارض احتمالی دارد";
}

function ProjectManualNegotiationResponseReviewView({ project, questionDraft, response, responseRevision, review, responses, drafts, productComparisons, serviceComparisons, proposals, requests, approvals, contacts, storageLocked, onBack, onUpsert }: { project: BuilderProject; questionDraft: BuilderNegotiationDraftRecord; response: BuilderManualNegotiationResponseRecord; responseRevision: BuilderManualNegotiationResponseRevision; review: BuilderManualNegotiationResponseReviewRecord | null; responses: BuilderManualNegotiationResponseRecord[]; drafts: BuilderNegotiationDraftRecord[]; productComparisons: BuilderProposalComparisonRecord[]; serviceComparisons: BuilderServiceProposalComparisonRecord[]; proposals: BuilderRecordedProposalRecord[]; requests: ProjectPurchaseRequestRecord[]; approvals: ProjectApprovalRecord[]; contacts: SupplierContactRecord[]; storageLocked: boolean; onBack: () => void; onUpsert: (responseId: string, responseRevisionId: string, form: BuilderManualNegotiationResponseReviewForm) => false | "unchanged" | "created" | "updated" }) {
  const keyboard = useKeyboard();
  const editorHeadingRef = useRef<HTMLSpanElement>(null);
  const detailHeadingRef = useRef<HTMLElement>(null);
  const currentReviewRevision = review?.revisions.find((item) => item.id === review.currentRevisionId) ?? null;
  const [editorOpen, setEditorOpen] = useState(!review && !storageLocked);
  const [form, setForm] = useState<BuilderManualNegotiationResponseReviewForm>({ outcome: currentReviewRevision?.outcome ?? "", reason: currentReviewRevision?.reason ?? "" });
  const [formError, setFormError] = useState("");
  const [previewRevisionId, setPreviewRevisionId] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const previewReviewRevision = review?.revisions.find((item) => item.id === previewRevisionId) ?? currentReviewRevision;
  const reviewEffectiveStatus = review
    ? builderManualNegotiationResponseReviewEffectiveStatus(review, responses, drafts, productComparisons, serviceComparisons, proposals, requests, approvals, contacts)
    : "needs-review" as const;
  const responseEffectiveStatus = builderManualNegotiationResponseEffectiveStatus(response, drafts, productComparisons, serviceComparisons, proposals, requests, approvals, contacts);
  const responseIsCurrent = response.currentRevisionId === responseRevision.id && responseEffectiveStatus === "current";

  useEffect(() => {
    if (editorOpen) window.requestAnimationFrame(() => editorHeadingRef.current?.focus());
    else if (review) window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
  }, [editorOpen, review]);

  const closeEditor = () => {
    keyboard.hide();
    setFormError("");
    if (review) {
      setEditorOpen(false);
      window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
      return;
    }
    onBack();
  };

  const openEdit = () => {
    if (!review || !currentReviewRevision || storageLocked || reviewEffectiveStatus !== "current") return;
    setForm({ outcome: currentReviewRevision.outcome, reason: currentReviewRevision.reason });
    setFormError("");
    setEditorOpen(true);
  };

  const saveReview = (event: React.FormEvent) => {
    event.preventDefault();
    keyboard.hide();
    if (!form.outcome) {
      setFormError("ارزیابی خودت را انتخاب کن.");
      window.requestAnimationFrame(() => document.getElementById("manual-response-review-outcome-appears-addressed")?.focus());
      return;
    }
    if (!form.reason.trim()) {
      setFormError("دلیل ارزیابی خودت را بنویس.");
      window.requestAnimationFrame(() => document.getElementById("manual-response-review-reason")?.focus());
      return;
    }
    const result = onUpsert(response.id, responseRevision.id, form);
    if (!result) {
      setFormError("بازبینی دستی ثبت نشد؛ revision پاسخ یا فضای ذخیره‌سازی محلی را دوباره بررسی کن.");
      return;
    }
    setEditorOpen(false);
    setPreviewRevisionId(null);
    setLiveMessage(result === "created" ? "بازبینی دستی پاسخ ثبت شد." : result === "updated" ? "نسخهٔ تازهٔ بازبینی دستی ثبت شد." : "تغییر تازه‌ای برای ثبت وجود نداشت.");
    window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
  };

  if (editorOpen) {
    const outcomeInvalid = formError === "ارزیابی خودت را انتخاب کن.";
    const reasonInvalid = formError === "دلیل ارزیابی خودت را بنویس.";
    return (
      <div className="chida-app project-proposals-view manual-response-review-editor-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="manual-response-review-editor">
        <header className="project-workspace-header"><button className="icon-button" type="button" onClick={closeEditor} aria-label="بستن ویرایشگر بازبینی دستی پاسخ" data-testid="manual-response-review-editor-back"><ArrowRight size={21} /></button><span ref={editorHeadingRef} className="project-workspace-title" tabIndex={-1} data-testid="manual-response-review-editor-title"><small>T8-A3 · خصوصی · دستی</small><strong>{review ? "اصلاح بازبینی پاسخ" : "بازبینی دستی پاسخ"}</strong></span><span className="project-workspace-header-spacer" /></header>
        <MobileScroll className="project-proposals-scroll"><form className="proposal-editor-content negotiation-draft-editor-content manual-response-review-editor-content" onSubmit={saveReview} noValidate>
          <section className="proposal-honesty-banner"><ShieldCheck size={18} /><span><strong>ارزیابی شما؛ نه تشخیص چیدا</strong><small>چیدا متن را تحلیل نکرده، تعارضی تشخیص نداده و اصالت پاسخ را تأیید نکرده است.</small></span></section>
          <section className="proposal-form-section" data-testid="manual-response-review-context"><div className="proposal-section-heading"><span><small>اتصال تغییرناپذیر</small><strong>revision دقیق پاسخ</strong></span></div><div className="proposal-locked-grid"><div><small>پاسخ رونویسی‌شده</small><strong>{questionDraft.target.criterionLabel}</strong><span>نسخهٔ {responseRevision.version.toLocaleString("fa-IR")}</span></div><div><small>تماس ثبت‌شده</small><strong>{questionDraft.target.supplierSnapshot.displayName}</strong><span>اصالت تأیید نشده</span></div><div><small>سؤال مرتبط</small><strong>{response.questionSnapshot.purpose}</strong><span>ارسال‌نشده در چیدا</span></div><div><small>روش ارزیابی</small><strong>ثبت مستقیم سازنده</strong><span>بدون AI و تشخیص خودکار</span></div></div><p className="manual-negotiation-response-message" dir="auto">{responseRevision.responseText}</p></section>
          <fieldset className="manual-response-review-options" data-testid="manual-response-review-outcome-group" aria-invalid={outcomeInvalid} aria-describedby={outcomeInvalid ? "manual-response-review-form-error" : undefined}><legend>از نظر شما این پاسخ چه وضعیتی دارد؟</legend>{(["appears-addressed", "needs-clarification", "potential-conflict"] as BuilderManualNegotiationResponseReviewOutcome[]).map((outcome) => <label key={outcome} htmlFor={`manual-response-review-outcome-${outcome}`}><input id={`manual-response-review-outcome-${outcome}`} type="radio" name="manual-response-review-outcome" value={outcome} checked={form.outcome === outcome} onChange={() => { setForm((current) => ({ ...current, outcome })); setFormError(""); }} data-testid={`manual-response-review-outcome-${outcome}`} /><span><strong>{builderManualNegotiationResponseReviewOutcomeLabel(outcome)}</strong><small>{outcome === "appears-addressed" ? "این فقط برداشت شما از میزان پاسخ‌گویی متن است." : outcome === "needs-clarification" ? "برای رفع ابهام، پیگیری بیرون از چیدا لازم می‌دانید." : "این فقط علامت‌گذاری احتمالی شماست، نه کشف خودکار."}</small></span></label>)}</fieldset>
          <section className="proposal-form-section"><label className="field-control" htmlFor="manual-response-review-reason"><span>دلیل ارزیابی شما</span><KeyboardTextarea id="manual-response-review-reason" data-testid="manual-response-review-reason" value={form.reason} maxLength={1200} rows={6} dir="auto" placeholder="مشخص کن کدام بخش پاسخ ابهام را رفع کرده یا هنوز نیازمند روشن‌سازی است…" onChange={(event) => { setForm((current) => ({ ...current, reason: event.target.value })); setFormError(""); }} aria-invalid={reasonInvalid} aria-describedby={reasonInvalid ? "manual-response-review-form-error" : formError ? undefined : "manual-response-review-boundary-note"} /><small id="manual-response-review-boundary-note">این نتیجه فقط قضاوت ثبت‌شدهٔ شما روی همین revision پاسخ است.</small></label></section>
          <p className="purchase-request-boundary" data-testid="manual-response-review-boundary"><ShieldCheck size={16} /><span>automatedDetectionUsed=false · aiUsed=false · networkUsed=false · externalEffect=none</span></p>
          {formError ? <p id="manual-response-review-form-error" className="proposal-form-error" role="alert" data-testid="manual-response-review-form-error">{formError}</p> : null}
          <div className="proposal-editor-actions negotiation-draft-editor-actions"><button className="secondary-button" type="button" onClick={closeEditor}>انصراف</button><button className="primary-button" type="submit" disabled={storageLocked || !responseIsCurrent} data-testid="manual-response-review-save">{review ? "ذخیرهٔ نسخهٔ جدید" : "ثبت بازبینی دستی"}</button></div>
        </form></MobileScroll><span className="sr-only" aria-live="polite">{liveMessage}</span>
      </div>
    );
  }

  if (review && previewReviewRevision) {
    const currentPreview = previewReviewRevision.id === review.currentRevisionId;
    return (
      <div className="chida-app project-proposals-view manual-response-review-detail-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="manual-response-review-detail">
        <header className="project-workspace-header"><button className="icon-button" type="button" onClick={onBack} aria-label="بازگشت به پاسخ رونویسی‌شده" data-testid="manual-response-review-detail-back"><ArrowRight size={21} /></button><span className="project-workspace-title"><small>T8-A3 · بازبینی دستی</small><strong>ارزیابی پاسخ</strong></span><span className="project-workspace-header-spacer" /></header>
        <MobileScroll className="project-proposals-scroll"><main className="proposal-detail-content negotiation-draft-detail-content manual-response-review-detail-content">
          <section className="proposal-detail-hero negotiation-draft-detail-hero manual-response-review-detail-hero" tabIndex={-1} ref={detailHeadingRef} data-testid="manual-response-review-detail-hero"><span className="proposal-detail-icon"><ClipboardCheck size={24} /></span><span className={`proposal-status-badge ${reviewEffectiveStatus}`}>{reviewEffectiveStatus === "current" ? currentPreview ? "بازبینی دستی جاری" : "نسخهٔ تاریخی ارزیابی" : "تاریخی · نیازمند بازبینی"}</span><h1>{questionDraft.target.criterionLabel}</h1><p>{questionDraft.target.supplierSnapshot.displayName} · ارزیابی شما؛ نه تشخیص چیدا</p></section>
          <section className="proposal-honesty-banner"><ShieldCheck size={18} /><span><strong>ارزیابی شما؛ نه تشخیص چیدا</strong><small>این برچسب و دلیل را شما ثبت کرده‌اید؛ چیدا متن را تحلیل یا اصالت آن را تأیید نکرده است.</small></span></section>
          {review.revisions.length > 1 ? <label className="proposal-revision-picker" htmlFor="manual-response-review-revision-select"><span>نمایش نسخه</span><select id="manual-response-review-revision-select" value={previewReviewRevision.id} onChange={(event) => setPreviewRevisionId(event.target.value)} data-testid="manual-response-review-revision-select">{[...review.revisions].reverse().map((revision) => <option key={revision.id} value={revision.id}>نسخهٔ {revision.version.toLocaleString("fa-IR")} · {revision.id === review.currentRevisionId ? "جاری" : "تاریخی"}</option>)}</select></label> : null}
          <section className="proposal-detail-section"><div className="proposal-section-heading"><span><small>قضاوت ثبت‌شدهٔ سازنده</small><strong data-testid="manual-response-review-outcome">{builderManualNegotiationResponseReviewOutcomeLabel(previewReviewRevision.outcome)}</strong></span></div><p className="negotiation-draft-message" dir="auto" data-testid="manual-response-review-reason-text">{previewReviewRevision.reason}</p></section>
          <section className="proposal-detail-section"><div className="proposal-section-heading"><span><small>revision پاسخ مورد بازبینی</small><strong>اتصال دقیق و بدون بازاتصال</strong></span></div><p className="manual-negotiation-response-message" dir="auto">{responseRevision.responseText}</p><dl className="proposal-detail-meta"><div><dt>نسخهٔ پاسخ</dt><dd>{responseRevision.version.toLocaleString("fa-IR")} · {responseRevision.id}</dd></div><div><dt>سؤال</dt><dd>{response.questionSnapshot.purpose}</dd></div><div><dt>معیار</dt><dd>{questionDraft.target.criterionLabel}</dd></div><div><dt>منشأ</dt><dd>{review.source}</dd></div><div><dt>روش</dt><dd>دستی · بدون تشخیص خودکار</dd></div><div><dt>اصالت</dt><dd>تأیید نشده</dd></div></dl></section>
          <p className="purchase-request-boundary" data-testid="manual-response-review-boundary"><ShieldCheck size={16} /><span>automatedDetectionUsed=false · aiUsed=false · networkUsed=false · externalEffect=none</span></p>
          <section className="proposal-detail-section"><div className="proposal-section-heading"><span><small>تاریخچهٔ تغییرناپذیر</small><strong>نسخه‌های ارزیابی شما</strong></span></div><ol className="proposal-history" data-testid="manual-response-review-history">{[...review.revisions].reverse().map((revision) => <li key={revision.id}><span><Check size={13} /></span><div><strong>{builderManualNegotiationResponseReviewOutcomeLabel(revision.outcome)}</strong><small>نسخهٔ {revision.version.toLocaleString("fa-IR")} · {formatProjectFileDate(revision.createdAt)}</small><small className="negotiation-draft-history-message" dir="auto">{revision.reason}</small></div></li>)}</ol></section>
          <button className="primary-button proposal-edit-button" type="button" onClick={openEdit} disabled={storageLocked || reviewEffectiveStatus !== "current" || !currentPreview} data-testid="manual-response-review-edit">اصلاح ارزیابی و ثبت نسخهٔ جدید</button>
        </main></MobileScroll><span className="sr-only" aria-live="polite">{liveMessage}</span>
      </div>
    );
  }

  return <div className="chida-app project-proposals-view manual-response-review-detail-view" dir="rtl" data-theme="dark" data-mode="fullscreen"><header className="project-workspace-header"><button className="icon-button" type="button" onClick={onBack} aria-label="بازگشت به پاسخ رونویسی‌شده"><ArrowRight size={21} /></button><span className="project-workspace-title"><small>T8-A3 · خصوصی</small><strong>بازبینی دستی پاسخ</strong></span><span className="project-workspace-header-spacer" /></header><MobileScroll className="project-proposals-scroll"><main className="proposal-detail-content"><section className="proposal-empty-state"><CircleHelp size={26} /><h2>بازبینی قابل نمایش نیست</h2><p>revision دقیق پاسخ یا مخزن محلی بازبینی قابل تأیید نیست.</p></section></main></MobileScroll></div>;
}

function ProjectManualNegotiationResponseView({ project, questionDraft, questionRevision, response, reviews, responses, drafts, productComparisons, serviceComparisons, proposals, requests, approvals, contacts, storageLocked, reviewsStorageLocked, onBack, onCreate, onUpdate, onUpsertReview }: { project: BuilderProject; questionDraft: BuilderNegotiationDraftRecord; questionRevision: BuilderNegotiationDraftRevision; response: BuilderManualNegotiationResponseRecord | null; reviews: BuilderManualNegotiationResponseReviewRecord[]; responses: BuilderManualNegotiationResponseRecord[]; drafts: BuilderNegotiationDraftRecord[]; productComparisons: BuilderProposalComparisonRecord[]; serviceComparisons: BuilderServiceProposalComparisonRecord[]; proposals: BuilderRecordedProposalRecord[]; requests: ProjectPurchaseRequestRecord[]; approvals: ProjectApprovalRecord[]; contacts: SupplierContactRecord[]; storageLocked: boolean; reviewsStorageLocked: boolean; onBack: () => void; onCreate: (draftId: string, draftRevisionId: string, form: BuilderManualNegotiationResponseForm) => string | null; onUpdate: (responseId: string, form: BuilderManualNegotiationResponseForm) => false | "unchanged" | "updated"; onUpsertReview: (responseId: string, responseRevisionId: string, form: BuilderManualNegotiationResponseReviewForm) => false | "unchanged" | "created" | "updated" }) {
  const keyboard = useKeyboard();
  const editorHeadingRef = useRef<HTMLSpanElement>(null);
  const detailHeadingRef = useRef<HTMLElement>(null);
  const reviewActionRef = useRef<HTMLButtonElement>(null);
  const [editorOpen, setEditorOpen] = useState(!response && !storageLocked);
  const [form, setForm] = useState<BuilderManualNegotiationResponseForm>({ responseText: response?.revisions.find((item) => item.id === response.currentRevisionId)?.responseText ?? "" });
  const [formError, setFormError] = useState("");
  const [previewRevisionId, setPreviewRevisionId] = useState<string | null>(null);
  const [reviewResponseRevisionId, setReviewResponseRevisionId] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const currentResponseRevision = response?.revisions.find((item) => item.id === response.currentRevisionId) ?? null;
  const previewResponseRevision = response?.revisions.find((item) => item.id === previewRevisionId) ?? currentResponseRevision;
  const questionIsCurrent = questionDraft.currentRevisionId === questionRevision.id
    && builderNegotiationDraftEffectiveStatus(questionDraft, productComparisons, serviceComparisons, proposals, requests, approvals, contacts) === "current";
  const responseEffectiveStatus = response
    ? builderManualNegotiationResponseEffectiveStatus(response, drafts, productComparisons, serviceComparisons, proposals, requests, approvals, contacts)
    : "needs-review" as const;
  const responseTextInvalid = formError === "متن پاسخی را که خودت رونویسی می‌کنی بنویس.";

  useEffect(() => {
    if (editorOpen) window.requestAnimationFrame(() => editorHeadingRef.current?.focus());
    else if (response) window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
  }, [editorOpen, response]);

  const closeEditor = () => {
    keyboard.hide();
    setFormError("");
    if (response) {
      setEditorOpen(false);
      window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
      return;
    }
    onBack();
  };

  const openEdit = () => {
    if (!response || !currentResponseRevision || storageLocked || responseEffectiveStatus !== "current") return;
    setForm({ responseText: currentResponseRevision.responseText });
    setFormError("");
    setEditorOpen(true);
  };

  const saveResponse = (event: React.FormEvent) => {
    event.preventDefault();
    keyboard.hide();
    if (!form.responseText.trim()) {
      setFormError("متن پاسخی را که خودت رونویسی می‌کنی بنویس.");
      window.requestAnimationFrame(() => document.getElementById("manual-negotiation-response-text")?.focus());
      return;
    }
    const result = response
      ? onUpdate(response.id, form)
      : onCreate(questionDraft.id, questionRevision.id, form);
    if (!result) {
      setFormError("رونویسی پاسخ ثبت نشد؛ وابستگی سؤال یا فضای ذخیره‌سازی محلی را دوباره بررسی کن.");
      return;
    }
    setEditorOpen(false);
    setPreviewRevisionId(null);
    setLiveMessage(response ? result === "updated" ? "نسخهٔ تازهٔ رونویسی پاسخ ثبت شد." : "تغییر تازه‌ای برای ثبت وجود نداشت." : "رونویسی خصوصی پاسخ ثبت شد.");
    window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
  };

  if (response && reviewResponseRevisionId) {
    const targetResponseRevision = response.revisions.find((item) => item.id === reviewResponseRevisionId) ?? null;
    const targetReview = reviews.find((item) => item.target.manualNegotiationResponseId === response.id && item.target.manualNegotiationResponseRevisionId === reviewResponseRevisionId) ?? null;
    if (targetResponseRevision) {
      return <ProjectManualNegotiationResponseReviewView project={project} questionDraft={questionDraft} response={response} responseRevision={targetResponseRevision} review={targetReview} responses={responses} drafts={drafts} productComparisons={productComparisons} serviceComparisons={serviceComparisons} proposals={proposals} requests={requests} approvals={approvals} contacts={contacts} storageLocked={reviewsStorageLocked} onBack={() => { setReviewResponseRevisionId(null); window.requestAnimationFrame(() => (reviewActionRef.current ?? detailHeadingRef.current)?.focus()); }} onUpsert={onUpsertReview} />;
    }
  }

  if (editorOpen) {
    return (
      <div className="chida-app project-proposals-view manual-negotiation-response-editor-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="manual-negotiation-response-editor">
        <header className="project-workspace-header"><button className="icon-button" type="button" onClick={closeEditor} aria-label="بستن ویرایشگر رونویسی پاسخ" data-testid="manual-negotiation-response-editor-back"><ArrowRight size={21} /></button><span ref={editorHeadingRef} className="project-workspace-title" tabIndex={-1} data-testid="manual-negotiation-response-editor-title"><small>T8-A2 · خصوصی · دستی</small><strong>{response ? "اصلاح رونویسی پاسخ" : "رونویسی پاسخ مرتبط"}</strong></span><span className="project-workspace-header-spacer" /></header>
        <MobileScroll className="project-proposals-scroll"><form className="proposal-editor-content negotiation-draft-editor-content manual-negotiation-response-editor-content" onSubmit={saveResponse} noValidate>
          <section className="proposal-honesty-banner"><ShieldCheck size={18} /><span><strong>چیدا این پاسخ را دریافت یا تأیید نکرده است</strong><small>سؤال در چیدا ارسال نشده؛ این متن فقط رونویسی خصوصی شما و مرتبط با یک تماس محلیِ احرازنشده است.</small></span></section>
          <section className="proposal-form-section" data-testid="manual-negotiation-response-question-context"><div className="proposal-section-heading"><span><small>اتصال تغییرناپذیر</small><strong>revision دقیق سؤال</strong></span></div><div className="proposal-locked-grid"><div><small>سؤال ارسال‌نشده</small><strong>{questionRevision.purpose}</strong><span>نسخهٔ {questionRevision.version.toLocaleString("fa-IR")}</span></div><div><small>معیار</small><strong>{questionDraft.target.criterionLabel}</strong><span>{questionDraft.target.comparisonKind === "product" ? "محصول" : "خدمت"}</span></div><div><small>تماس ثبت‌شده</small><strong>{questionDraft.target.supplierSnapshot.displayName}</strong><span>هویت و اصالت تأیید نشده</span></div><div><small>وضعیت شبکه</small><strong>خارج از شبکهٔ چیدا</strong><span>بدون ارسال و دریافت</span></div></div><p className="manual-negotiation-question-copy">{questionRevision.message}</p></section>
          <section className="proposal-form-section"><label className="field-control" htmlFor="manual-negotiation-response-text"><span>متن پاسخی که شما رونویسی می‌کنید</span><KeyboardTextarea id="manual-negotiation-response-text" data-testid="manual-negotiation-response-text" value={form.responseText} maxLength={2000} rows={8} dir="auto" placeholder="پاسخ را همان‌طور که بیرون از چیدا دریافت کرده‌اید، بدون افزودن ادعای تأیید بنویسید…" onChange={(event) => { setForm({ responseText: event.target.value }); setFormError(""); }} aria-invalid={responseTextInvalid} aria-describedby={formError ? "manual-negotiation-response-form-error" : "manual-negotiation-response-boundary-note"} /><small id="manual-negotiation-response-boundary-note">زمان نمایش‌داده‌شده فقط زمان ثبت محلی شماست، نه زمان دریافت پاسخ.</small></label></section>
          <p className="purchase-request-boundary" data-testid="manual-negotiation-response-boundary"><ShieldCheck size={16} /><span>supplierAuthenticated=false · authenticityVerified=false · receivedThroughChida=false · externalEffect=none</span></p>
          {formError ? <p id="manual-negotiation-response-form-error" className="proposal-form-error" role="alert" data-testid="manual-negotiation-response-form-error">{formError}</p> : null}
          <div className="proposal-editor-actions negotiation-draft-editor-actions"><button className="secondary-button" type="button" onClick={closeEditor}>انصراف</button><button className="primary-button" type="submit" data-testid="manual-negotiation-response-save">{response ? "ذخیرهٔ نسخهٔ جدید" : "ثبت رونویسی خصوصی"}</button></div>
        </form></MobileScroll><span className="sr-only" aria-live="polite">{liveMessage}</span>
      </div>
    );
  }

  if (response && previewResponseRevision) {
    const currentPreview = previewResponseRevision.id === response.currentRevisionId;
    const responseReview = reviews.find((item) => item.target.manualNegotiationResponseId === response.id && item.target.manualNegotiationResponseRevisionId === previewResponseRevision.id) ?? null;
    return (
      <div className="chida-app project-proposals-view manual-negotiation-response-detail-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="manual-negotiation-response-detail">
        <header className="project-workspace-header"><button className="icon-button" type="button" onClick={onBack} aria-label="بازگشت به سؤال ارسال‌نشده" data-testid="manual-negotiation-response-detail-back"><ArrowRight size={21} /></button><span className="project-workspace-title"><small>T8-A2 · رونویسی دستی</small><strong>پاسخ مرتبط</strong></span><span className="project-workspace-header-spacer" /></header>
        <MobileScroll className="project-proposals-scroll"><main className="proposal-detail-content negotiation-draft-detail-content manual-negotiation-response-detail-content">
          <section className="proposal-detail-hero negotiation-draft-detail-hero manual-negotiation-response-detail-hero" tabIndex={-1} ref={detailHeadingRef} data-testid="manual-negotiation-response-detail-hero"><span className="proposal-detail-icon"><MessageSquare size={24} /></span><span className={`proposal-status-badge ${responseEffectiveStatus}`}>{responseEffectiveStatus === "current" ? currentPreview ? "رونویسی محلی · تأییدنشده" : "نسخهٔ تاریخی رونویسی" : "تاریخی · نیازمند بازبینی"}</span><h1>{questionDraft.target.criterionLabel}</h1><p>{questionDraft.target.supplierSnapshot.displayName} · ثبت دستی سازنده</p></section>
          <section className="proposal-honesty-banner"><ShieldCheck size={18} /><span><strong>پاسخ احرازنشده · خارج از شبکهٔ چیدا</strong><small>چیدا این سؤال را ارسال نکرده و این پاسخ را دریافت، احراز یا تأیید نکرده است.</small></span></section>
          {response.revisions.length > 1 ? <label className="proposal-revision-picker" htmlFor="manual-negotiation-response-revision-select"><span>نمایش نسخه</span><select id="manual-negotiation-response-revision-select" value={previewResponseRevision.id} onChange={(event) => setPreviewRevisionId(event.target.value)} data-testid="manual-negotiation-response-revision-select">{[...response.revisions].reverse().map((revision) => <option key={revision.id} value={revision.id}>نسخهٔ {revision.version.toLocaleString("fa-IR")} · {revision.id === response.currentRevisionId ? "جاری" : "تاریخی"}</option>)}</select></label> : null}
          <section className="proposal-detail-section"><div className="proposal-section-heading"><span><small>رونویسی ثبت‌شده</small><strong>متن پاسخ منتسب</strong></span></div><p className="negotiation-draft-message manual-negotiation-response-message" dir="auto" data-testid="manual-negotiation-response-message">{previewResponseRevision.responseText}</p></section>
          <section className="proposal-detail-section manual-response-review-entry" data-testid="manual-response-review-entry"><div className="proposal-section-heading"><span><small>T8-A3 · ثبت دستی سازنده</small><strong>بازبینی ابهام یا تعارض احتمالی</strong></span></div><p>فقط برداشت خودت از همین revision پاسخ را ثبت کن؛ چیدا متن را تحلیل نمی‌کند و تعارضی تشخیص نمی‌دهد.</p>{reviewsStorageLocked ? <section className="proposal-storage-error" role="alert" data-testid="manual-response-review-storage-error"><CircleHelp size={19} /><span><strong>وضعیت بازبینی‌های دستی قابل تأیید نیست</strong><small>این وضعیت «بازبینی ثبت نشده» نیست؛ پاسخ سالم می‌ماند و فقط تغییر بازبینی قفل است.</small></span></section> : responseReview ? <button ref={reviewActionRef} className="secondary-button manual-negotiation-response-action" type="button" onClick={() => setReviewResponseRevisionId(previewResponseRevision.id)} aria-label={`بازکردن بازبینی دستی پاسخ برای ${questionDraft.target.criterionLabel} و ${questionDraft.target.supplierSnapshot.displayName}`} data-testid="manual-response-review-open"><ClipboardCheck size={16} /> بازکردن بازبینی دستی</button> : responseEffectiveStatus === "current" && currentPreview ? <button ref={reviewActionRef} className="secondary-button manual-negotiation-response-action" type="button" onClick={() => setReviewResponseRevisionId(previewResponseRevision.id)} aria-label={`ثبت بازبینی دستی پاسخ برای ${questionDraft.target.criterionLabel} و ${questionDraft.target.supplierSnapshot.displayName}`} data-testid="manual-response-review-add"><ClipboardCheck size={16} /> ثبت بازبینی دستی پاسخ</button> : <p className="proposal-prerequisite-note" data-testid="manual-response-review-historical-note">برای revision تاریخیِ بدون بازبینی، ارزیابی تازه ساخته نمی‌شود.</p>}</section>
          <section className="proposal-detail-section"><div className="proposal-section-heading"><span><small>سؤال مرتبط</small><strong>{response.questionSnapshot.purpose}</strong></span></div><p className="manual-negotiation-question-copy">{response.questionSnapshot.message}</p><dl className="proposal-detail-meta"><div><dt>revision سؤال</dt><dd>نسخهٔ {response.target.negotiationDraftRevisionVersion.toLocaleString("fa-IR")} · {response.target.negotiationDraftRevisionId}</dd></div><div><dt>معیار</dt><dd>{response.questionSnapshot.negotiationTarget.criterionLabel}</dd></div><div><dt>تماس ثبت‌شده</dt><dd>{response.questionSnapshot.negotiationTarget.supplierSnapshot.displayName}</dd></div><div><dt>منشأ</dt><dd>{response.source}</dd></div><div><dt>زمان</dt><dd>زمان ثبت محلی · {formatProjectFileDate(previewResponseRevision.createdAt)}</dd></div><div><dt>اصالت</dt><dd>تأیید نشده · خارج از شبکهٔ چیدا</dd></div></dl></section>
          {storageLocked ? <section className="proposal-storage-error" role="alert" data-testid="manual-negotiation-response-storage-error"><CircleHelp size={19} /><span><strong>وضعیت کامل رونویسی پاسخ قابل تأیید نیست</strong><small>این وضعیت «پاسخی ثبت نشده» نیست؛ ویرایش تا بازیابی موفق قفل می‌ماند.</small></span></section> : null}
          <p className="purchase-request-boundary" data-testid="manual-negotiation-response-boundary"><ShieldCheck size={16} /><span>questionSentThroughChida=false · receivedThroughChida=false · sendAuthorized=false · externalEffect=none</span></p>
          <section className="proposal-detail-section"><div className="proposal-section-heading"><span><small>تاریخچهٔ تغییرناپذیر</small><strong>نسخه‌های رونویسی</strong></span></div><ol className="proposal-history" data-testid="manual-negotiation-response-history">{[...response.revisions].reverse().map((revision) => <li key={revision.id}><span><Check size={13} /></span><div><strong>نسخهٔ {revision.version.toLocaleString("fa-IR")}</strong><small>{formatProjectFileDate(revision.createdAt)} · زمان ثبت محلی</small><small className="negotiation-draft-history-message" dir="auto">{revision.responseText}</small></div></li>)}</ol></section>
          <button className="primary-button proposal-edit-button" type="button" onClick={openEdit} disabled={storageLocked || responseEffectiveStatus !== "current" || !currentPreview} data-testid="manual-negotiation-response-edit">اصلاح رونویسی و ثبت نسخهٔ جدید</button>
        </main></MobileScroll><span className="sr-only" aria-live="polite">{liveMessage}</span>
      </div>
    );
  }

  return (
    <div className="chida-app project-proposals-view manual-negotiation-response-detail-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="manual-negotiation-response-unavailable">
      <header className="project-workspace-header"><button className="icon-button" type="button" onClick={onBack} aria-label="بازگشت به سؤال ارسال‌نشده"><ArrowRight size={21} /></button><span className="project-workspace-title"><small>T8-A2 · خصوصی</small><strong>رونویسی پاسخ</strong></span><span className="project-workspace-header-spacer" /></header>
      <MobileScroll className="project-proposals-scroll"><main className="proposal-detail-content"><section className="proposal-storage-error" role="alert"><CircleHelp size={19} /><span><strong>ثبت پاسخ اکنون در دسترس نیست</strong><small>{storageLocked ? "خواندن مخزن پاسخ کامل نشد؛ این وضعیت empty نیست." : questionIsCurrent ? "وابستگی سؤال دوباره بررسی شود." : "این revision سؤال تاریخی است و پاسخ تازه به آن متصل نمی‌شود."}</small></span></section></main></MobileScroll>
    </div>
  );
}

function ProjectNegotiationDraftsView({ project, drafts, manualResponses, manualResponseReviews, productComparisons, serviceComparisons, proposals, requests, approvals, contacts, storageLocked, manualResponsesStorageLocked, manualResponseReviewsStorageLocked, initialTargetKey, initialDraftId, returnToOrigin, onBack, onCreate, onUpdate, onCreateManualResponse, onUpdateManualResponse, onUpsertManualResponseReview }: { project: BuilderProject; drafts: BuilderNegotiationDraftRecord[]; manualResponses: BuilderManualNegotiationResponseRecord[]; manualResponseReviews: BuilderManualNegotiationResponseReviewRecord[]; productComparisons: BuilderProposalComparisonRecord[]; serviceComparisons: BuilderServiceProposalComparisonRecord[]; proposals: BuilderRecordedProposalRecord[]; requests: ProjectPurchaseRequestRecord[]; approvals: ProjectApprovalRecord[]; contacts: SupplierContactRecord[]; storageLocked: boolean; manualResponsesStorageLocked: boolean; manualResponseReviewsStorageLocked: boolean; initialTargetKey: string | null; initialDraftId: string | null; returnToOrigin: boolean; onBack: () => void; onCreate: (draft: BuilderNegotiationDraftForm) => string | null; onUpdate: (draftId: string, draft: BuilderNegotiationDraftForm) => false | "unchanged" | "updated"; onCreateManualResponse: (draftId: string, draftRevisionId: string, form: BuilderManualNegotiationResponseForm) => string | null; onUpdateManualResponse: (responseId: string, form: BuilderManualNegotiationResponseForm) => false | "unchanged" | "updated"; onUpsertManualResponseReview: (responseId: string, responseRevisionId: string, form: BuilderManualNegotiationResponseReviewForm) => false | "unchanged" | "created" | "updated" }) {
  const keyboard = useKeyboard();
  const editorHeadingRef = useRef<HTMLSpanElement>(null);
  const detailHeadingRef = useRef<HTMLElement>(null);
  const manualResponseActionRef = useRef<HTMLButtonElement>(null);
  const targetOptions = useMemo(() => builderNegotiationDraftTargetOptions(project.id, productComparisons, serviceComparisons, proposals, requests, approvals, contacts), [approvals, contacts, productComparisons, project.id, proposals, requests, serviceComparisons]);
  const initialOption = initialTargetKey ? targetOptions.find((item) => item.key === initialTargetKey) ?? null : null;
  const [selectedId, setSelectedId] = useState<string | null>(initialDraftId);
  const [previewRevisionId, setPreviewRevisionId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(Boolean(initialOption && !storageLocked));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BuilderNegotiationDraftForm>({ targetKey: initialOption?.key ?? "", purpose: "", message: "" });
  const [formError, setFormError] = useState("");
  const [liveMessage, setLiveMessage] = useState("");
  const [manualResponseFlow, setManualResponseFlow] = useState<{ draftId: string; revisionId: string } | null>(null);
  const orderedDrafts = useMemo(() => [...drafts].sort((first, second) => second.updatedAt.localeCompare(first.updatedAt)), [drafts]);
  const selectedDraft = drafts.find((item) => item.id === selectedId) ?? null;
  const currentRevision = selectedDraft?.revisions.find((item) => item.id === selectedDraft.currentRevisionId) ?? null;
  const previewRevision = selectedDraft?.revisions.find((item) => item.id === previewRevisionId) ?? currentRevision;
  const formTarget = editingId && selectedDraft
    ? builderNegotiationDraftTargetEvidence(project.id, selectedDraft.target, productComparisons, serviceComparisons)
    : targetOptions.find((item) => item.key === form.targetKey) ?? initialOption;
  const manualResponseQuestionDraft = manualResponseFlow ? drafts.find((item) => item.id === manualResponseFlow.draftId) ?? null : null;
  const manualResponseQuestionRevision = manualResponseQuestionDraft?.revisions.find((item) => item.id === manualResponseFlow?.revisionId) ?? null;
  const selectedManualResponse = manualResponseFlow ? manualResponses.find((item) => item.target.negotiationDraftId === manualResponseFlow.draftId && item.target.negotiationDraftRevisionId === manualResponseFlow.revisionId) ?? null : null;

  useEffect(() => {
    if (editorOpen) window.requestAnimationFrame(() => editorHeadingRef.current?.focus());
    else if (initialDraftId && selectedId === initialDraftId) window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
  }, [editorOpen, initialDraftId, selectedId]);

  const closeEditor = () => {
    keyboard.hide();
    setEditorOpen(false);
    setFormError("");
    if (selectedDraft) window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
    else onBack();
  };

  const openEdit = () => {
    if (!selectedDraft || !currentRevision || storageLocked) return;
    setEditingId(selectedDraft.id);
    setForm({ targetKey: builderNegotiationDraftTargetKey(selectedDraft.target), purpose: currentRevision.purpose, message: currentRevision.message });
    setFormError("");
    setEditorOpen(true);
  };

  const saveDraft = (event: React.FormEvent) => {
    event.preventDefault();
    keyboard.hide();
    if (!form.purpose.trim()) {
      setFormError("هدف سؤال را بنویس.");
      window.requestAnimationFrame(() => document.getElementById("negotiation-draft-purpose")?.focus());
      return;
    }
    if (!form.message.trim()) {
      setFormError("متن سؤال را با بیان مستقیم خودت بنویس.");
      window.requestAnimationFrame(() => document.getElementById("negotiation-draft-message")?.focus());
      return;
    }
    if (editingId) {
      const result = onUpdate(editingId, form);
      if (!result) {
        setFormError("ویرایش پیش‌نویس ثبت نشد؛ وابستگی‌ها یا فضای ذخیره‌سازی محلی را دوباره بررسی کن.");
        return;
      }
      setEditorOpen(false);
      setEditingId(null);
      setPreviewRevisionId(null);
      setLiveMessage(result === "updated" ? "نسخهٔ تازهٔ پیش‌نویس ثبت شد." : "تغییر تازه‌ای برای ثبت وجود نداشت.");
      window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
      return;
    }
    const createdId = onCreate(form);
    if (!createdId) {
      setFormError("پیش‌نویس ثبت نشد؛ وابستگی‌ها یا فضای ذخیره‌سازی محلی را دوباره بررسی کن.");
      return;
    }
    setSelectedId(createdId);
    setPreviewRevisionId(null);
    setEditorOpen(false);
    setLiveMessage("پیش‌نویس خصوصی و ارسال‌نشده ثبت شد.");
    window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
  };

  if (manualResponseFlow && manualResponseQuestionDraft && manualResponseQuestionRevision) {
    return <ProjectManualNegotiationResponseView project={project} questionDraft={manualResponseQuestionDraft} questionRevision={manualResponseQuestionRevision} response={selectedManualResponse} reviews={manualResponseReviews} responses={manualResponses} drafts={drafts} productComparisons={productComparisons} serviceComparisons={serviceComparisons} proposals={proposals} requests={requests} approvals={approvals} contacts={contacts} storageLocked={manualResponsesStorageLocked} reviewsStorageLocked={manualResponseReviewsStorageLocked} onBack={() => { setManualResponseFlow(null); window.requestAnimationFrame(() => manualResponseActionRef.current?.focus()); }} onCreate={onCreateManualResponse} onUpdate={onUpdateManualResponse} onUpsertReview={onUpsertManualResponseReview} />;
  }

  if (editorOpen && formTarget) {
    return (
      <div className="chida-app project-proposals-view negotiation-draft-editor-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="negotiation-draft-editor">
        <header className="project-workspace-header"><button className="icon-button" type="button" onClick={closeEditor} aria-label="بستن ویرایشگر پیش‌نویس" data-testid="negotiation-draft-editor-back"><ArrowRight size={21} /></button><span ref={editorHeadingRef} className="project-workspace-title" tabIndex={-1} data-testid="negotiation-draft-editor-title"><small>T8-A1 · خصوصی</small><strong>{editingId ? "ویرایش پیش‌نویس مذاکره" : "پیش‌نویس سؤال مذاکره"}</strong></span><span className="project-workspace-header-spacer" /></header>
        <MobileScroll className="project-proposals-scroll"><form className="proposal-editor-content negotiation-draft-editor-content" onSubmit={saveDraft} noValidate>
          <section className="proposal-honesty-banner"><ShieldCheck size={18} /><span><strong>پیش‌نویس محلی · ارسال نمی‌شود</strong><small>متن را شما می‌نویسید؛ این فرم پاسخ تأمین‌کننده، مجوز ارسال یا پیام واقعی نمی‌سازد.</small></span></section>
          <section className="proposal-form-section" data-testid="negotiation-draft-target"><div className="proposal-section-heading"><span><small>اتصال تغییرناپذیر</small><strong>نسخه و معیار دقیق</strong></span></div><div className="proposal-locked-grid"><div><small>{formTarget.target.comparisonKind === "product" ? "مقایسهٔ محصول" : "ماتریس خدمت"}</small><strong>{formTarget.comparisonLabel}</strong><span>نسخهٔ {formTarget.target.comparisonVersion.toLocaleString("fa-IR")}</span></div><div><small>تأمین‌کنندهٔ ثبت‌شده</small><strong>{formTarget.supplierLabel}</strong><span>snapshot نسخهٔ {formTarget.target.supplierSnapshot.supplierContactVersion.toLocaleString("fa-IR")}</span></div><div><small>معیار</small><strong>{formTarget.target.criterionLabel}</strong><span>{formTarget.criterionState}</span></div><div><small>منشأ</small><strong>مقایسهٔ ثبت‌شدهٔ سازنده</strong><span>revision ثابت · بدون بازاتصال</span></div></div></section>
          <section className="proposal-form-section"><label className="field-control" htmlFor="negotiation-draft-purpose"><span>هدف سؤال</span><KeyboardTextarea id="negotiation-draft-purpose" data-testid="negotiation-draft-purpose" value={form.purpose} maxLength={300} rows={2} placeholder="مثلاً روشن‌شدن زمان قطعی شروع پیش از ادامهٔ بررسی" onChange={(event) => { setForm((current) => ({ ...current, purpose: event.target.value })); setFormError(""); }} aria-invalid={formError === "هدف سؤال را بنویس."} aria-describedby={formError === "هدف سؤال را بنویس." ? "negotiation-draft-form-error" : undefined} /></label><label className="field-control" htmlFor="negotiation-draft-message"><span>متن سؤال شما</span><KeyboardTextarea id="negotiation-draft-message" data-testid="negotiation-draft-message" value={form.message} maxLength={800} rows={6} placeholder="سؤال را دقیق و بدون ادعای ارسال بنویس…" onChange={(event) => { setForm((current) => ({ ...current, message: event.target.value })); setFormError(""); }} aria-invalid={formError === "متن سؤال را با بیان مستقیم خودت بنویس."} aria-describedby={formError === "متن سؤال را با بیان مستقیم خودت بنویس." ? "negotiation-draft-form-error" : "negotiation-draft-boundary-note"} /><small id="negotiation-draft-boundary-note">این متن فقط در مرورگر شما و داخل همین پروژه ثبت می‌شود.</small></label></section>
          <p className="purchase-request-boundary" data-testid="negotiation-draft-boundary"><ShieldCheck size={16} /><span>هیچ ارسال، تحویل، API یا AI انجام نشده؛ چیدا تأمین‌کننده را مطلع نکرده و هیچ اقدام بیرونی مجاز نشده است.</span></p>
          {formError ? <p id="negotiation-draft-form-error" className="proposal-form-error" role="alert" data-testid="negotiation-draft-form-error">{formError}</p> : null}
          <div className="proposal-editor-actions negotiation-draft-editor-actions"><button className="secondary-button" type="button" onClick={closeEditor}>انصراف</button><button className="primary-button" type="submit" data-testid="negotiation-draft-save">{editingId ? "ذخیرهٔ نسخهٔ جدید" : "ذخیرهٔ پیش‌نویس محلی"}</button></div>
        </form></MobileScroll><span className="sr-only" aria-live="polite">{liveMessage}</span>
      </div>
    );
  }

  if (selectedDraft && previewRevision) {
    const effectiveStatus = builderNegotiationDraftEffectiveStatus(selectedDraft, productComparisons, serviceComparisons, proposals, requests, approvals, contacts);
    const currentPreview = previewRevision.id === selectedDraft.currentRevisionId;
    const evidence = builderNegotiationDraftTargetEvidence(project.id, selectedDraft.target, productComparisons, serviceComparisons);
    const manualResponse = manualResponses.find((item) => item.target.negotiationDraftId === selectedDraft.id && item.target.negotiationDraftRevisionId === previewRevision.id) ?? null;
    return (
      <div className="chida-app project-proposals-view negotiation-draft-detail-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="negotiation-draft-detail">
        <header className="project-workspace-header"><button className="icon-button" type="button" onClick={() => { if (returnToOrigin) onBack(); else { setSelectedId(null); setPreviewRevisionId(null); window.requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-negotiation-draft-id="${selectedDraft.id}"]`)?.focus()); } }} aria-label={returnToOrigin ? "بازگشت به معیار مقایسه" : "بازگشت به پیش‌نویس‌های مذاکره"} data-testid="negotiation-draft-detail-back"><ArrowRight size={21} /></button><span className="project-workspace-title"><small>T8-A1 · ارسال نشده</small><strong>پیش‌نویس مذاکره</strong></span><span className="project-workspace-header-spacer" /></header>
        <MobileScroll className="project-proposals-scroll"><main className="proposal-detail-content negotiation-draft-detail-content">
          <section className="proposal-detail-hero negotiation-draft-detail-hero" tabIndex={-1} ref={detailHeadingRef} data-testid="negotiation-draft-detail-hero"><span className="proposal-detail-icon"><MessageSquare size={24} /></span><span className={`proposal-status-badge ${effectiveStatus}`}>{effectiveStatus === "current" ? currentPreview ? "پیش‌نویس محلی · ارسال نشده" : "نسخهٔ تاریخی" : "تاریخی · نیازمند بازبینی"}</span><h1>{selectedDraft.target.criterionLabel}</h1><p>{currentPreview ? `نسخهٔ ${previewRevision.version.toLocaleString("fa-IR")}` : `نسخهٔ تاریخی ${previewRevision.version.toLocaleString("fa-IR")}`} · {selectedDraft.target.supplierSnapshot.displayName}</p></section>
          <section className="proposal-honesty-banner"><ShieldCheck size={18} /><span><strong>ثبت مستقیم سازنده</strong><small>این سؤال خصوصی و ارسال‌نشده است؛ هیچ پاسخ احرازشده یا دریافت‌شده از شبکهٔ چیدا وجود ندارد.</small></span></section>
          {selectedDraft.revisions.length > 1 ? <label className="proposal-revision-picker" htmlFor="negotiation-draft-revision-select"><span>نمایش نسخه</span><select id="negotiation-draft-revision-select" value={previewRevision.id} onChange={(event) => setPreviewRevisionId(event.target.value)} data-testid="negotiation-draft-revision-select">{[...selectedDraft.revisions].reverse().map((revision) => <option key={revision.id} value={revision.id}>نسخهٔ {revision.version.toLocaleString("fa-IR")} · {revision.id === selectedDraft.currentRevisionId ? "جاری" : "تاریخی"}</option>)}</select></label> : null}
          <section className="proposal-detail-section"><div className="proposal-section-heading"><span><small>هدف ثبت‌شده</small><strong>{previewRevision.purpose}</strong></span></div><p className="negotiation-draft-message">{previewRevision.message}</p></section>
          <section className="proposal-detail-section manual-negotiation-response-entry" data-testid="manual-negotiation-response-entry"><div className="proposal-section-heading"><span><small>T8-A2 · ثبت دستی سازنده</small><strong>رونویسی پاسخ مرتبط</strong></span></div><p>اگر پاسخی را بیرون از چیدا دریافت کرده‌ای، فقط برای رجوع خصوصی به همین revision رونویسی کن؛ هویت، کانال و اصالت آن تأیید نمی‌شود.</p>{manualResponsesStorageLocked ? <section className="proposal-storage-error" role="alert" data-testid="manual-negotiation-response-storage-error"><CircleHelp size={19} /><span><strong>وضعیت پاسخ‌های دستی قابل تأیید نیست</strong><small>این وضعیت «پاسخی ثبت نشده» نیست و هر تغییر تا بازیابی موفق قفل می‌ماند.</small></span></section> : manualResponse ? <button ref={manualResponseActionRef} className="secondary-button manual-negotiation-response-action" type="button" onClick={() => setManualResponseFlow({ draftId: selectedDraft.id, revisionId: previewRevision.id })} aria-label={`بازکردن پاسخ دستی ثبت‌شده برای ${selectedDraft.target.criterionLabel} و ${selectedDraft.target.supplierSnapshot.displayName}`} data-testid="manual-negotiation-response-open"><MessageSquare size={16} /> بازکردن پاسخ ثبت‌شده</button> : effectiveStatus === "current" && currentPreview ? <button ref={manualResponseActionRef} className="secondary-button manual-negotiation-response-action" type="button" onClick={() => setManualResponseFlow({ draftId: selectedDraft.id, revisionId: previewRevision.id })} aria-label={`رونویسی پاسخ مرتبط برای ${selectedDraft.target.criterionLabel} و ${selectedDraft.target.supplierSnapshot.displayName}`} data-testid="manual-negotiation-response-add"><MessageSquare size={16} /> رونویسی پاسخ مرتبط</button> : <p className="proposal-prerequisite-note" data-testid="manual-negotiation-response-historical-note">برای revision تاریخیِ بدون پاسخ، رونویسی تازه ساخته نمی‌شود.</p>}</section>
          <section className="proposal-detail-section"><div className="proposal-section-heading"><span><small>اتصال دقیق</small><strong>snapshot منبع</strong></span></div><dl className="proposal-detail-meta"><div><dt>نوع</dt><dd>{selectedDraft.target.comparisonKind === "product" ? "مقایسهٔ محصول" : "ماتریس خدمت"}</dd></div><div><dt>مقایسه</dt><dd>نسخهٔ {selectedDraft.target.comparisonVersion.toLocaleString("fa-IR")} · {selectedDraft.target.comparisonRevisionId}</dd></div><div><dt>پیشنهاد</dt><dd>{selectedDraft.target.supplierSnapshot.displayName} · نسخهٔ {selectedDraft.target.proposalVersion.toLocaleString("fa-IR")}</dd></div><div><dt>معیار</dt><dd>{selectedDraft.target.criterionLabel}</dd></div><div><dt>منشأ</dt><dd>{selectedDraft.source}</dd></div><div><dt>وضعیت</dt><dd>{selectedDraft.localStatus} · ارسال نشده</dd></div></dl>{evidence ? null : <p className="proposal-prerequisite-note">منبع دقیق این نسخه دیگر قابل بازیابی نیست؛ رکورد فقط‌خواندنی باقی مانده است.</p>}</section>
          <p className="purchase-request-boundary" data-testid="negotiation-draft-boundary"><ShieldCheck size={16} /><span>هیچ ارسال، تحویل، API یا AI انجام نشده؛ sendAuthorized=false و externalEffect=none باقی مانده‌اند.</span></p>
          <section className="proposal-detail-section"><div className="proposal-section-heading"><span><small>تاریخچهٔ تغییرناپذیر</small><strong>نسخه‌های متن</strong></span></div><ol className="proposal-history" data-testid="negotiation-draft-history">{[...selectedDraft.revisions].reverse().map((revision) => <li key={revision.id}><span><Check size={13} /></span><div><strong>{revision.purpose}</strong><small>نسخهٔ {revision.version.toLocaleString("fa-IR")} · {formatProjectFileDate(revision.createdAt)}</small><small className="negotiation-draft-history-message">{revision.message}</small></div></li>)}</ol></section>
          <button className="primary-button proposal-edit-button" type="button" onClick={openEdit} disabled={storageLocked || effectiveStatus !== "current" || !currentPreview} data-testid="negotiation-draft-edit">ویرایش پیش‌نویس و ثبت نسخهٔ جدید</button>
        </main></MobileScroll><span className="sr-only" aria-live="polite">{liveMessage}</span>
      </div>
    );
  }

  return (
    <div className="chida-app project-proposals-view negotiation-drafts-list-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="negotiation-drafts-view">
      <header className="project-workspace-header"><button className="icon-button" type="button" onClick={onBack} aria-label="بازگشت به صندوق پیشنهادها" data-testid="negotiation-drafts-back"><ArrowRight size={21} /></button><span className="project-workspace-title"><small>صندوق پیشنهادها</small><strong>پیش‌نویس‌های محلی مذاکره</strong></span><span className="project-workspace-header-spacer" /></header>
      <MobileScroll className="project-proposals-scroll"><main className="project-proposals-content"><section className="project-proposals-heading"><span className="project-proposals-mark"><MessageSquare size={24} /></span><div><small>T8-A1/T8-A2 · خصوصی · پروژهٔ {project.name}</small><h1>سؤال‌های ارسال‌نشده</h1><p>هر سؤال و رونویسی پاسخ به revision دقیق منبع وصل است و فقط با ثبت مستقیم شما ساخته می‌شود.</p></div></section><section className="proposal-honesty-banner"><ShieldCheck size={18} /><span><strong>این فهرست گفتگو نیست</strong><small>هیچ سؤال یا پاسخی در شبکهٔ چیدا ارسال، دریافت یا احراز نشده؛ پاسخ‌های موجود فقط رونویسی خصوصی سازنده‌اند.</small></span></section>{storageLocked ? <section className="proposal-storage-error" role="alert" data-testid="negotiation-draft-storage-error"><CircleHelp size={19} /><span><strong>وضعیت پیش‌نویس‌های محلی قابل تأیید نیست</strong><small>خواندن مخزن کامل نشد؛ این وضعیت «پیش‌نویسی ثبت نشده» نیست و هر تغییر قفل می‌ماند.</small></span></section> : null}{!storageLocked && orderedDrafts.length ? <div className="project-proposals-list">{orderedDrafts.map((draft) => { const revision = draft.revisions.find((item) => item.id === draft.currentRevisionId)!; const status = builderNegotiationDraftEffectiveStatus(draft, productComparisons, serviceComparisons, proposals, requests, approvals, contacts); const response = manualResponses.find((item) => item.target.negotiationDraftId === draft.id && item.target.negotiationDraftRevisionId === revision.id) ?? null; return <button className="proposal-card" type="button" key={draft.id} data-negotiation-draft-id={draft.id} onClick={() => { setSelectedId(draft.id); setPreviewRevisionId(draft.currentRevisionId); window.requestAnimationFrame(() => detailHeadingRef.current?.focus()); }} data-testid="negotiation-draft-card"><span className="proposal-card-icon"><MessageSquare size={20} /></span><span className="proposal-card-copy"><span><small>{status === "current" ? "پیش‌نویس محلی · ارسال نشده" : "تاریخی · نیازمند بازبینی"}</small><small>{formatProjectFileDate(draft.updatedAt)}</small></span><strong>{draft.target.supplierSnapshot.displayName}</strong><em>{draft.target.criterionLabel}</em><small>{draft.target.comparisonKind === "product" ? "محصول" : "خدمت"} · نسخهٔ {revision.version.toLocaleString("fa-IR")} · {manualResponsesStorageLocked ? "وضعیت پاسخ دستی نامشخص" : response ? "پاسخ دستی ثبت شده" : "بدون پاسخ دستی"}</small></span><ArrowRight size={17} /></button>; })}</div> : !storageLocked ? <section className="proposal-empty-state" data-testid="negotiation-draft-empty-state"><MessageSquare size={26} /><h2>پیش‌نویسی ثبت نشده</h2><p>از جزئیات یک معیار در مقایسهٔ محصول یا خدمت، سؤال خصوصی و ارسال‌نشده بساز.</p></section> : null}</main></MobileScroll><span className="sr-only" aria-live="polite">{liveMessage}</span>
    </div>
  );
}

function ProjectProposalsView({ project, proposals, comparisons, decisions, serviceComparisons, serviceDecisions, negotiationDrafts, manualNegotiationResponses, manualNegotiationResponseReviews, requests, approvals, contacts, files, storageLocked, comparisonsStorageLocked, decisionsStorageLocked, serviceComparisonsStorageLocked, serviceDecisionsStorageLocked, negotiationDraftsStorageLocked, manualNegotiationResponsesStorageLocked, manualNegotiationResponseReviewsStorageLocked, backLabel, onBack, onCreate, onUpdate, onCreateComparison, onUpdateComparison, onUpsertDecision, onCreateServiceComparison, onUpdateServiceComparison, onUpsertServiceDecision, onCreateNegotiationDraft, onUpdateNegotiationDraft, onCreateManualNegotiationResponse, onUpdateManualNegotiationResponse, onUpsertManualNegotiationResponseReview }: { project: BuilderProject; proposals: BuilderRecordedProposalRecord[]; comparisons: BuilderProposalComparisonRecord[]; decisions: BuilderProposalComparisonDecisionRecord[]; serviceComparisons: BuilderServiceProposalComparisonRecord[]; serviceDecisions: BuilderServiceProposalComparisonDecisionRecord[]; negotiationDrafts: BuilderNegotiationDraftRecord[]; manualNegotiationResponses: BuilderManualNegotiationResponseRecord[]; manualNegotiationResponseReviews: BuilderManualNegotiationResponseReviewRecord[]; requests: ProjectPurchaseRequestRecord[]; approvals: ProjectApprovalRecord[]; contacts: SupplierContactRecord[]; files: ProjectFileRecord[]; storageLocked: boolean; comparisonsStorageLocked: boolean; decisionsStorageLocked: boolean; serviceComparisonsStorageLocked: boolean; serviceDecisionsStorageLocked: boolean; negotiationDraftsStorageLocked: boolean; manualNegotiationResponsesStorageLocked: boolean; manualNegotiationResponseReviewsStorageLocked: boolean; backLabel: string; onBack: () => void; onCreate: (draft: BuilderRecordedProposalDraft) => string | null; onUpdate: (proposalId: string, draft: BuilderRecordedProposalDraft) => false | "unchanged" | "updated"; onCreateComparison: (draft: BuilderProposalComparisonDraft) => string | null; onUpdateComparison: (comparisonId: string, draft: BuilderProposalComparisonDraft) => false | "unchanged" | "updated"; onUpsertDecision: (comparisonId: string, revisionId: string, draft: BuilderProposalComparisonDecisionDraft) => false | "unchanged" | "created" | "updated"; onCreateServiceComparison: (draft: BuilderServiceProposalComparisonDraft) => string | null; onUpdateServiceComparison: (comparisonId: string, draft: BuilderServiceProposalComparisonDraft) => false | "unchanged" | "updated"; onUpsertServiceDecision: (comparisonId: string, revisionId: string, draft: BuilderServiceProposalComparisonDecisionDraft) => false | "unchanged" | "created" | "updated"; onCreateNegotiationDraft: (draft: BuilderNegotiationDraftForm) => string | null; onUpdateNegotiationDraft: (draftId: string, draft: BuilderNegotiationDraftForm) => false | "unchanged" | "updated"; onCreateManualNegotiationResponse: (draftId: string, draftRevisionId: string, form: BuilderManualNegotiationResponseForm) => string | null; onUpdateManualNegotiationResponse: (responseId: string, form: BuilderManualNegotiationResponseForm) => false | "unchanged" | "updated"; onUpsertManualNegotiationResponseReview: (responseId: string, responseRevisionId: string, form: BuilderManualNegotiationResponseReviewForm) => false | "unchanged" | "created" | "updated" }) {
  const keyboard = useKeyboard();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const productComparisonsButtonRef = useRef<HTMLButtonElement>(null);
  const serviceComparisonsButtonRef = useRef<HTMLButtonElement>(null);
  const negotiationDraftsButtonRef = useRef<HTMLButtonElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const editorHeadingRef = useRef<HTMLSpanElement>(null);
  const detailHeadingRef = useRef<HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewRevisionId, setPreviewRevisionId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BuilderRecordedProposalDraft>({ requestId: "", supplierContactId: "", projectFileId: "", declaredAt: "", transcript: "", notes: "", lines: [] });
  const [formError, setFormError] = useState("");
  const [liveMessage, setLiveMessage] = useState("");
  const [comparisonMode, setComparisonMode] = useState<"product" | "service" | "negotiation" | null>(null);
  const [negotiationInitialTargetKey, setNegotiationInitialTargetKey] = useState<string | null>(null);
  const [negotiationInitialDraftId, setNegotiationInitialDraftId] = useState<string | null>(null);
  const [negotiationOriginTarget, setNegotiationOriginTarget] = useState<BuilderNegotiationDraftTarget | null>(null);

  const orderedProposals = useMemo(() => [...proposals].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [proposals]);
  const selectedProposal = proposals.find((proposal) => proposal.id === selectedId) ?? null;
  const currentRevision = selectedProposal?.revisions.find((revision) => revision.id === selectedProposal.currentRevisionId) ?? null;
  const previewRevision = selectedProposal?.revisions.find((revision) => revision.id === previewRevisionId) ?? currentRevision;
  const eligibleRequests = useMemo(() => requests.flatMap((request) => {
    const approval = approvals.find((item) => item.projectId === project.id && item.target.id === request.id && item.target.version === request.version && item.status === "approved" && isApprovalEligibleForDispatch(item, request, project.id));
    const reviewRevision = approval ? request.reviewRevisions.find((item) => item.id === approval.target.revisionId && item.requestVersion === approval.target.version) : null;
    return approval && reviewRevision ? [{ request, approval, reviewRevision, snapshot: builderRecordedProposalRequestSnapshot(reviewRevision.snapshot) }] : [];
  }), [approvals, project.id, requests]);
  const draftRequestOption = eligibleRequests.find((item) => item.request.id === draft.requestId) ?? null;
  const compatibleContacts = draftRequestOption ? contacts.filter((contact) => supplierContactCanRespond(contact, draftRequestOption.request.requestKind)) : [];

  useEffect(() => {
    if (selectedId && !proposals.some((proposal) => proposal.id === selectedId)) {
      setSelectedId(null);
      setPreviewRevisionId(null);
    }
  }, [proposals, selectedId]);

  const createDraftForRequest = (requestId: string): BuilderRecordedProposalDraft => {
    const option = eligibleRequests.find((item) => item.request.id === requestId);
    return { requestId, supplierContactId: "", projectFileId: "", declaredAt: "", transcript: "", notes: "", lines: option ? blankBuilderRecordedProposalLines(option.snapshot) : [] };
  };

  const openCreate = () => {
    if (storageLocked) return;
    const initialRequestId = eligibleRequests.length === 1 ? eligibleRequests[0].request.id : "";
    setEditingId(null);
    setDraft(createDraftForRequest(initialRequestId));
    setFormError("");
    setEditorOpen(true);
    window.requestAnimationFrame(() => editorHeadingRef.current?.focus());
  };

  const openEdit = () => {
    if (!selectedProposal || storageLocked) return;
    setEditingId(selectedProposal.id);
    setDraft(builderRecordedProposalDraftFromRecord(selectedProposal));
    setFormError("");
    setEditorOpen(true);
    window.requestAnimationFrame(() => editorHeadingRef.current?.focus());
  };

  const closeEditor = () => {
    keyboard.hide();
    setEditorOpen(false);
    setFormError("");
    window.requestAnimationFrame(() => (editingId ? editButtonRef.current : addButtonRef.current)?.focus());
  };

  const changeRequest = (requestId: string) => {
    setDraft(createDraftForRequest(requestId));
    setFormError("");
  };

  const changeLine = (lineId: string, field: keyof BuilderRecordedProposalLineDraft, value: string) => {
    setDraft((current) => ({ ...current, lines: current.lines.map((line) => line.id === lineId ? { ...line, [field]: value } : line) }));
    setFormError("");
  };

  const saveProposal = (event: React.FormEvent) => {
    event.preventDefault();
    keyboard.hide();
    if (!draft.requestId) {
      setFormError("درخواست تأییدشده را انتخاب کن.");
      window.requestAnimationFrame(() => document.getElementById("proposal-request-select")?.focus());
      return;
    }
    if (!draft.supplierContactId) {
      setFormError("تماس سازگار و فعال را انتخاب کن.");
      window.requestAnimationFrame(() => document.getElementById("proposal-supplier-select")?.focus());
      return;
    }
    const inconsistentLineIndex = draft.lines.findIndex((line) => line.status === "not-mentioned" && builderRecordedProposalLineDraftHasDeclaredCommercialValues(line));
    if (inconsistentLineIndex >= 0) {
      setFormError("برای قلمی که دادهٔ تجاری وارد شده، وضعیت اعلامی را از «ذکر نشده» تغییر بده.");
      window.requestAnimationFrame(() => document.getElementById(`proposal-line-status-${inconsistentLineIndex}`)?.focus());
      return;
    }
    if (!draft.projectFileId && !draft.transcript.trim() && !draft.declaredAt.trim() && !draft.notes.trim() && !draft.lines.some((line) => line.status !== "not-mentioned" || [line.quantity, line.unit, line.unitPrice, line.totalPrice, line.tax, line.transport, line.minimumOrder, line.leadTime, line.validity, line.paymentTerms, line.notes].some((value) => value.trim()))) {
      setFormError("برای ثبت، دست‌کم مرجع فایل، رونویسی یا یک دادهٔ اعلامی وارد کن.");
      return;
    }
    if (editingId) {
      const updateResult = onUpdate(editingId, draft);
      if (!updateResult) {
        setFormError("ثبت ویرایش انجام نشد؛ داده‌های محلی یا وابستگی‌های رکورد را دوباره بررسی کن.");
        return;
      }
      setLiveMessage(updateResult === "updated" ? "ویرایش به‌عنوان نسخهٔ محلی تازه ثبت شد." : "تغییر تازه‌ای برای ثبت وجود نداشت.");
      setEditorOpen(false);
      window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
      return;
    }
    const createdId = onCreate(draft);
    if (!createdId) {
      setFormError("ثبت پیشنهاد انجام نشد؛ فیلدها و فضای ذخیره‌سازی محلی را دوباره بررسی کن.");
      return;
    }
    setSelectedId(createdId);
    setPreviewRevisionId(null);
    setLiveMessage("پیشنهاد دستی در صندوق خصوصی پروژه ثبت شد.");
    setEditorOpen(false);
    window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
  };

  const displayValue = (value: string | null, suffix = "") => value ? `${value}${suffix}` : "نامشخص";

  const openNegotiationTarget = (target: BuilderNegotiationDraftTarget) => {
    const targetKey = builderNegotiationDraftTargetKey(target);
    const existing = negotiationDrafts.find((draft) => builderNegotiationDraftTargetKey(draft.target) === targetKey) ?? null;
    setNegotiationOriginTarget(structuredClone(target));
    setNegotiationInitialTargetKey(existing ? null : targetKey);
    setNegotiationInitialDraftId(existing?.id ?? null);
    setComparisonMode("negotiation");
  };

  if (comparisonMode === "product") {
    return <ProjectProposalComparisonsView project={project} proposals={proposals} comparisons={comparisons} decisions={decisions} negotiationDrafts={negotiationDrafts} requests={requests} approvals={approvals} contacts={contacts} storageLocked={comparisonsStorageLocked} decisionsStorageLocked={decisionsStorageLocked} negotiationDraftsStorageLocked={negotiationDraftsStorageLocked} initialNegotiationTarget={negotiationOriginTarget?.comparisonKind === "product" ? negotiationOriginTarget : null} onBack={() => { setNegotiationOriginTarget(null); setComparisonMode(null); window.requestAnimationFrame(() => productComparisonsButtonRef.current?.focus()); }} onCreate={onCreateComparison} onUpdate={onUpdateComparison} onUpsertDecision={onUpsertDecision} onStartNegotiation={openNegotiationTarget} />;
  }

  if (comparisonMode === "service") {
    return <ProjectServiceProposalComparisonsView project={project} proposals={proposals} comparisons={serviceComparisons} decisions={serviceDecisions} negotiationDrafts={negotiationDrafts} requests={requests} approvals={approvals} contacts={contacts} storageLocked={serviceComparisonsStorageLocked} decisionsStorageLocked={serviceDecisionsStorageLocked} negotiationDraftsStorageLocked={negotiationDraftsStorageLocked} initialNegotiationTarget={negotiationOriginTarget?.comparisonKind === "service" ? negotiationOriginTarget : null} onBack={() => { setNegotiationOriginTarget(null); setComparisonMode(null); window.requestAnimationFrame(() => serviceComparisonsButtonRef.current?.focus()); }} onCreate={onCreateServiceComparison} onUpdate={onUpdateServiceComparison} onUpsertDecision={onUpsertServiceDecision} onStartNegotiation={openNegotiationTarget} />;
  }

  if (comparisonMode === "negotiation") {
    return <ProjectNegotiationDraftsView project={project} drafts={negotiationDrafts} manualResponses={manualNegotiationResponses} manualResponseReviews={manualNegotiationResponseReviews} productComparisons={comparisons} serviceComparisons={serviceComparisons} proposals={proposals} requests={requests} approvals={approvals} contacts={contacts} storageLocked={negotiationDraftsStorageLocked} manualResponsesStorageLocked={manualNegotiationResponsesStorageLocked} manualResponseReviewsStorageLocked={manualNegotiationResponseReviewsStorageLocked} initialTargetKey={negotiationInitialTargetKey} initialDraftId={negotiationInitialDraftId} returnToOrigin={Boolean(negotiationOriginTarget)} onBack={() => { const originKind = negotiationOriginTarget?.comparisonKind ?? null; setNegotiationInitialTargetKey(null); setNegotiationInitialDraftId(null); setComparisonMode(originKind); if (!originKind) window.requestAnimationFrame(() => negotiationDraftsButtonRef.current?.focus()); }} onCreate={onCreateNegotiationDraft} onUpdate={onUpdateNegotiationDraft} onCreateManualResponse={onCreateManualNegotiationResponse} onUpdateManualResponse={onUpdateManualNegotiationResponse} onUpsertManualResponseReview={onUpsertManualNegotiationResponseReview} />;
  }

  if (editorOpen) {
    const editingProposal = editingId ? proposals.find((proposal) => proposal.id === editingId) ?? null : null;
    const lockedRequestTitle = editingProposal?.requestSnapshot.title ?? "";
    const lockedSupplierName = editingProposal?.supplierSnapshot.displayName ?? "";
    const lockedReferenceName = editingProposal?.reference.fileSnapshot?.displayName ?? "بدون فایل مرجع";
    return (
      <div className="chida-app project-proposals-view proposal-editor-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="proposal-editor">
        <header className="project-workspace-header">
          <button className="icon-button" type="button" onClick={closeEditor} aria-label="بستن فرم پیشنهاد" data-testid="proposal-editor-back"><ArrowRight size={21} /></button>
          <span ref={editorHeadingRef} className="project-workspace-title" tabIndex={-1} data-testid="proposal-editor-title"><small>صندوق خصوصی</small><strong>{editingId ? "ویرایش رونویسی" : "ثبت دستی پیشنهاد"}</strong></span>
          <span className="project-workspace-header-spacer" aria-hidden="true" />
        </header>
        <MobileScroll className="project-proposals-scroll">
          <form className="proposal-editor-content" onSubmit={saveProposal} noValidate>
            <section className="proposal-honesty-banner" data-testid="proposal-editor-honesty"><ShieldCheck size={18} /><span><strong>ثبت دستی سازنده</strong><small>این رکورد پاسخ احراز‌شدهٔ تأمین‌کننده نیست، از شبکهٔ چیدا دریافت نشده و هیچ اثر بیرونی ندارد.</small></span></section>

            <section className="proposal-form-section" aria-labelledby="proposal-target-title">
              <div className="proposal-section-heading"><span><small>اتصال دقیق</small><strong id="proposal-target-title">درخواست و تماس</strong></span></div>
              {editingProposal ? (
                <div className="proposal-locked-grid" data-testid="proposal-locked-target">
                  <div><small>درخواست</small><strong>{lockedRequestTitle}</strong><span>نسخهٔ {editingProposal.target.requestVersion.toLocaleString("fa-IR")} · ثابت</span></div>
                  <div><small>تماس ثبت‌شده</small><strong>{lockedSupplierName}</strong><span>{editingProposal.supplierSnapshot.networkStatus} · snapshot نسخهٔ {editingProposal.supplierSnapshot.supplierContactVersion.toLocaleString("fa-IR")}</span></div>
                </div>
              ) : (
                <div className="proposal-form-grid">
                  <label className="field-control" htmlFor="proposal-request-select"><span>درخواست تأییدشده</span><select id="proposal-request-select" value={draft.requestId} onChange={(event) => changeRequest(event.target.value)} data-testid="proposal-request-select"><option value="">انتخاب درخواست</option>{eligibleRequests.map(({ request }) => <option key={request.id} value={request.id}>{purchaseRequestDisplayTitle(request)} · نسخه {request.version.toLocaleString("fa-IR")}</option>)}</select><small>فقط revision جاری با تأیید محتوای معتبر نمایش داده می‌شود.</small></label>
                  <label className="field-control" htmlFor="proposal-supplier-select"><span>تماس تأمین‌کننده</span><select id="proposal-supplier-select" value={draft.supplierContactId} onChange={(event) => { setDraft((current) => ({ ...current, supplierContactId: event.target.value })); setFormError(""); }} disabled={!draftRequestOption} data-testid="proposal-supplier-select"><option value="">انتخاب تماس</option>{compatibleContacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.displayName} · {supplierContactResponseCapabilityLabel(contact.responseCapability)}</option>)}</select><small>تماس ثبت‌شده توسط شما و خارج از شبکهٔ چیدا است.</small></label>
                </div>
              )}
            </section>

            <section className="proposal-form-section" aria-labelledby="proposal-reference-title">
              <div className="proposal-section-heading"><span><small>اصل یا مرجع</small><strong id="proposal-reference-title">مرجع و رونویسی خام</strong></span></div>
              {editingProposal ? <div className="proposal-reference-lock" data-testid="proposal-reference-locked"><FileText size={18} /><span><strong>{lockedReferenceName}</strong><small>مرجع نسخهٔ اولیه ثابت می‌ماند.</small></span></div> : <label className="field-control" htmlFor="proposal-file-select"><span>فایل پروژه (اختیاری)</span><select id="proposal-file-select" value={draft.projectFileId} onChange={(event) => { setDraft((current) => ({ ...current, projectFileId: event.target.value })); setFormError(""); }} data-testid="proposal-file-select"><option value="">بدون فایل مرجع</option>{files.map((file) => <option key={file.id} value={file.id}>{file.displayName} · {file.category}</option>)}</select><small>فقط شناسنامهٔ محلی فایل پیوند می‌خورد؛ محتوا ذخیره یا استخراج نمی‌شود.</small></label>}
              <label className="field-control" htmlFor="proposal-declared-at"><span>تاریخ اعلامی پیشنهاد <small>(اختیاری)</small></span><KeyboardInput id="proposal-declared-at" value={draft.declaredAt} onChange={(event) => { setDraft((current) => ({ ...current, declaredAt: event.target.value })); setFormError(""); }} placeholder="مثلاً ۱۴۰۵/۰۶/۰۶ یا نامشخص" data-testid="proposal-declared-at" /></label>
              <label className="field-control" htmlFor="proposal-transcript"><span>رونویسی خام شما <small>(اختیاری)</small></span><KeyboardTextarea id="proposal-transcript" value={draft.transcript} onChange={(event) => { setDraft((current) => ({ ...current, transcript: event.target.value })); setFormError(""); }} rows={4} placeholder="متن پیام، تماس یا پیش‌فاکتور را بدون تفسیر وارد کن…" data-testid="proposal-transcript" /><small>این متن اعلامی از فیلدهای ساختاریافتهٔ پایین جدا می‌ماند.</small></label>
            </section>

            <section className="proposal-form-section" aria-labelledby="proposal-structured-title">
              <div className="proposal-section-heading"><span><small>رونویسی ساختاریافته توسط شما</small><strong id="proposal-structured-title">اقلام و شرایط اعلامی</strong></span><em>خالی = نامشخص</em></div>
              {draft.lines.length ? draft.lines.map((line, index) => {
                const requestItem = draftRequestOption?.snapshot.items.find((item) => item.id === line.requestItemId);
                const editingRequestItem = editingProposal?.requestSnapshot.items.find((item) => item.id === line.requestItemId);
                const requestedContext = requestItem ?? editingRequestItem;
                return (
                  <article className="proposal-line-editor" key={line.id} data-testid="proposal-line-editor">
                    <div className="proposal-line-heading"><span><small>{line.requestItemId ? `قلم ${(index + 1).toLocaleString("fa-IR")}` : "خدمت"}</small><strong>{line.requestLabel}</strong></span><em>{requestedContext ? `درخواست: ${requestedContext.quantity ?? "نامشخص"} ${requestedContext.unit ?? ""}` : "مشخصات خدمت"}</em></div>
                    <label className="field-control" htmlFor={`proposal-line-status-${index}`}><span>وضعیت اعلامی</span><select id={`proposal-line-status-${index}`} value={line.status} onChange={(event) => changeLine(line.id, "status", event.target.value as BuilderRecordedProposalLineStatus)} data-testid={`proposal-line-status-${index}`}>{builderRecordedProposalLineStatuses.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}</select></label>
                    <div className="proposal-line-main-grid">
                      <label className="field-control" htmlFor={`proposal-line-quantity-${index}`}><span>مقدار پیشنهادی</span><KeyboardInput id={`proposal-line-quantity-${index}`} inputMode="decimal" value={line.quantity} onChange={(event) => changeLine(line.id, "quantity", event.target.value)} placeholder="نامشخص" data-testid={`proposal-line-quantity-${index}`} /></label>
                      <label className="field-control" htmlFor={`proposal-line-unit-${index}`}><span>واحد</span><KeyboardInput id={`proposal-line-unit-${index}`} value={line.unit} onChange={(event) => changeLine(line.id, "unit", event.target.value)} placeholder="نامشخص" data-testid={`proposal-line-unit-${index}`} /></label>
                      <label className="field-control" htmlFor={`proposal-line-unit-price-${index}`}><span>قیمت واحد (تومان)</span><KeyboardInput id={`proposal-line-unit-price-${index}`} inputMode="decimal" value={line.unitPrice} onChange={(event) => changeLine(line.id, "unitPrice", event.target.value)} placeholder="نامشخص" data-testid={`proposal-line-unit-price-${index}`} /></label>
                      <label className="field-control" htmlFor={`proposal-line-total-price-${index}`}><span>قیمت کل (تومان)</span><KeyboardInput id={`proposal-line-total-price-${index}`} inputMode="decimal" value={line.totalPrice} onChange={(event) => changeLine(line.id, "totalPrice", event.target.value)} placeholder="نامشخص" data-testid={`proposal-line-total-price-${index}`} /></label>
                    </div>
                    <details className="proposal-conditions">
                      <summary><SlidersHorizontal size={16} /> شرایط تکمیلی اعلامی</summary>
                      <div className="proposal-conditions-grid">
                        {([
                          ["tax", "مالیات", "مثلاً با ارزش افزوده"],
                          ["transport", "حمل", "مثلاً در محل پروژه"],
                          ["minimumOrder", "حداقل سفارش", "نامشخص"],
                          ["leadTime", "موعد آماده‌سازی", "نامشخص"],
                          ["validity", "اعتبار پیشنهاد", "نامشخص"],
                          ["paymentTerms", "شرایط پرداخت", "نامشخص"],
                        ] as const).map(([field, label, placeholder]) => <label className="field-control" key={field} htmlFor={`proposal-line-${field}-${index}`}><span>{label}</span><KeyboardInput id={`proposal-line-${field}-${index}`} value={line[field]} onChange={(event) => changeLine(line.id, field, event.target.value)} placeholder={placeholder} data-testid={`proposal-line-${field}-${index}`} /></label>)}
                        <label className="field-control proposal-line-notes" htmlFor={`proposal-line-notes-${index}`}><span>یادداشت همین مورد</span><KeyboardTextarea id={`proposal-line-notes-${index}`} value={line.notes} onChange={(event) => changeLine(line.id, "notes", event.target.value)} rows={3} placeholder="توضیح بدون تفسیر…" data-testid={`proposal-line-notes-${index}`} /></label>
                      </div>
                    </details>
                  </article>
                );
              }) : <p className="proposal-form-empty">ابتدا درخواست را انتخاب کن تا اقلام دقیق همان revision نمایش داده شوند.</p>}
              <label className="field-control" htmlFor="proposal-notes"><span>یادداشت داخلی شما <small>(اختیاری)</small></span><KeyboardTextarea id="proposal-notes" value={draft.notes} onChange={(event) => { setDraft((current) => ({ ...current, notes: event.target.value })); setFormError(""); }} rows={3} placeholder="نکته‌ای برای بازبینی بعدی…" data-testid="proposal-notes" /></label>
            </section>

            {formError ? <p className="proposal-form-error" role="alert" data-testid="proposal-form-error">{formError}</p> : null}
            <div className="proposal-editor-actions"><button className="secondary-button" type="button" onClick={closeEditor}>انصراف</button><button className="primary-button" type="submit" data-testid="proposal-save">{editingId ? "ثبت نسخهٔ جدید" : "ثبت در صندوق خصوصی"}</button></div>
          </form>
        </MobileScroll>
      </div>
    );
  }

  if (selectedProposal && previewRevision) {
    const status = builderRecordedProposalEffectiveStatus(selectedProposal, requests, approvals, contacts);
    return (
      <div className="chida-app project-proposals-view proposal-detail-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="proposal-detail">
        <header className="project-workspace-header">
          <button className="icon-button" type="button" onClick={() => { setSelectedId(null); setPreviewRevisionId(null); window.requestAnimationFrame(() => Array.from(document.querySelectorAll<HTMLElement>("[data-proposal-id]")).find((element) => element.dataset.proposalId === selectedProposal.id)?.focus()); }} aria-label="بازگشت به صندوق پیشنهادها" data-testid="proposal-detail-back"><ArrowRight size={21} /></button>
          <span className="project-workspace-title"><small>پیشنهاد ثبت‌شده</small><strong>{selectedProposal.supplierSnapshot.displayName}</strong></span>
          <span className="project-workspace-header-spacer" aria-hidden="true" />
        </header>
        <MobileScroll className="project-proposals-scroll">
          <main className="proposal-detail-content">
            <section className="proposal-detail-hero" tabIndex={-1} ref={detailHeadingRef} data-testid="proposal-detail-hero">
              <span className="proposal-detail-icon"><PackageCheck size={24} /></span>
              <span className={`proposal-status-badge ${status}`} data-testid="proposal-effective-status">{status === "current" ? "متصل به نسخهٔ جاری" : "تاریخی · نیازمند بازبینی"}</span>
              <h1>{selectedProposal.requestSnapshot.title}</h1>
              <p>{selectedProposal.source} · {selectedProposal.networkStatus}</p>
            </section>
            <section className="proposal-honesty-banner"><ShieldCheck size={18} /><span><strong>مرز صداقت</strong><small>تأمین‌کننده در چیدا احراز نشده؛ این پیشنهاد را شما ثبت کرده‌اید و هیچ ارسال، سفارش یا اثر بیرونی رخ نداده است.</small></span></section>
            <section className="proposal-detail-section" aria-labelledby="proposal-detail-link-title">
              <div className="proposal-section-heading"><span><small>اتصال و منشأ</small><strong id="proposal-detail-link-title">رکورد دقیق</strong></span></div>
              <dl className="proposal-detail-meta">
                <div><dt>درخواست</dt><dd>نسخهٔ {selectedProposal.target.requestVersion.toLocaleString("fa-IR")} · {selectedProposal.target.requestKind === "product" ? "محصول" : "خدمت"}</dd></div>
                <div><dt>revision</dt><dd>{selectedProposal.target.reviewRevisionId}</dd></div>
                <div><dt>تماس ثبت‌شده</dt><dd>{selectedProposal.supplierSnapshot.displayName} · snapshot نسخهٔ {selectedProposal.supplierSnapshot.supplierContactVersion.toLocaleString("fa-IR")}</dd></div>
                <div><dt>تاریخ اعلامی</dt><dd>{displayValue(previewRevision.declaredAt)}</dd></div>
                <div><dt>نسخهٔ رونویسی</dt><dd>{previewRevision.version.toLocaleString("fa-IR")} از {selectedProposal.version.toLocaleString("fa-IR")}</dd></div>
                <div><dt>ثبت محلی</dt><dd>{selectedProposal.visibility} · {formatProjectFileDate(previewRevision.createdAt)}</dd></div>
              </dl>
              {selectedProposal.revisions.length > 1 ? <label className="proposal-revision-picker" htmlFor="proposal-revision-select"><span>نمایش نسخه</span><select id="proposal-revision-select" value={previewRevision.id} onChange={(event) => setPreviewRevisionId(event.target.value)} data-testid="proposal-revision-select">{[...selectedProposal.revisions].reverse().map((revision) => <option key={revision.id} value={revision.id}>نسخهٔ {revision.version.toLocaleString("fa-IR")} · {revision.id === selectedProposal.currentRevisionId ? "جاری" : "تاریخی"}</option>)}</select></label> : null}
            </section>
            <section className="proposal-detail-section" aria-labelledby="proposal-detail-reference-title">
              <div className="proposal-section-heading"><span><small>اصل یا مرجع</small><strong id="proposal-detail-reference-title">مرجع ثبت‌شده</strong></span></div>
              {selectedProposal.reference.kind === "project-file-metadata" ? <div className="proposal-reference-card" data-testid="proposal-reference"><FileText size={20} /><span><strong>{selectedProposal.reference.fileSnapshot!.displayName}</strong><small>{selectedProposal.reference.fileSnapshot!.category} · {formatProjectFileSize(selectedProposal.reference.fileSnapshot!.size)}</small><em>فقط شناسنامهٔ محلی؛ محتوای فایل نگه‌داری یا استخراج نشده است.</em></span></div> : <div className="proposal-reference-card empty" data-testid="proposal-reference"><FileText size={20} /><span><strong>بدون فایل مرجع</strong><em>رکورد بر پایهٔ ورود دستی شماست.</em></span></div>}
              <div className="proposal-transcript-card"><small>رونویسی خام شما</small><p dir="auto">{previewRevision.transcript ?? "ثبت نشده"}</p></div>
            </section>
            <section className="proposal-detail-section" aria-labelledby="proposal-detail-lines-title">
              <div className="proposal-section-heading"><span><small>دادهٔ ساختاریافتهٔ دستی</small><strong id="proposal-detail-lines-title">اقلام و شرایط</strong></span><em>اصل ثبت‌شده · بدون تعدیل</em></div>
              <div className="proposal-lines-list">{previewRevision.lines.map((line, index) => <article className="proposal-line-card" key={line.id} data-testid="proposal-line-card"><div className="proposal-line-heading"><span><small>{line.requestItemId ? `قلم ${(index + 1).toLocaleString("fa-IR")}` : "خدمت"}</small><strong>{line.requestLabel}</strong></span><em>{builderRecordedProposalLineStatusLabel(line.status)}</em></div><dl><div><dt>مقدار و واحد</dt><dd>{displayValue(line.quantity)} · {displayValue(line.unit)}</dd></div><div><dt>قیمت واحد</dt><dd>{displayValue(line.unitPrice, " تومان")}</dd></div><div><dt>قیمت کل</dt><dd>{displayValue(line.totalPrice, " تومان")}</dd></div><div><dt>مالیات</dt><dd>{displayValue(line.tax)}</dd></div><div><dt>حمل</dt><dd>{displayValue(line.transport)}</dd></div><div><dt>حداقل سفارش</dt><dd>{displayValue(line.minimumOrder)}</dd></div><div><dt>موعد آماده‌سازی</dt><dd>{displayValue(line.leadTime)}</dd></div><div><dt>اعتبار</dt><dd>{displayValue(line.validity)}</dd></div><div><dt>شرایط پرداخت</dt><dd>{displayValue(line.paymentTerms)}</dd></div><div><dt>یادداشت</dt><dd>{displayValue(line.notes)}</dd></div></dl></article>)}</div>
              <div className="proposal-transcript-card internal"><small>یادداشت داخلی شما</small><p dir="auto">{previewRevision.notes ?? "ثبت نشده"}</p></div>
            </section>
            <section className="proposal-detail-section" aria-labelledby="proposal-history-title"><div className="proposal-section-heading"><span><small>تاریخچهٔ تغییرناپذیر</small><strong id="proposal-history-title">نسخه‌ها</strong></span></div><ol className="proposal-history">{[...selectedProposal.history].reverse().map((event) => <li key={event.id}><span><Check size={13} /></span><div><strong>{event.type === "created" ? "ثبت دستی ساخته شد" : "رونویسی ویرایش شد"}</strong><small>نسخهٔ {event.version.toLocaleString("fa-IR")} · {formatProjectFileDate(event.at)}</small></div></li>)}</ol></section>
            <button ref={editButtonRef} className="primary-button proposal-edit-button" type="button" onClick={openEdit} disabled={storageLocked} data-testid="proposal-edit">ویرایش رونویسی و ثبت نسخهٔ جدید</button>
          </main>
        </MobileScroll>
      </div>
    );
  }

  return (
    <div className="chida-app project-proposals-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-proposals-view">
      <header className="project-workspace-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label={backLabel} data-testid="proposals-back"><ArrowRight size={21} /></button>
        <span className="project-workspace-title"><small>فضای پروژه</small><strong>صندوق پیشنهادها</strong></span>
        <span className="project-workspace-header-spacer" aria-hidden="true" />
      </header>
      <MobileScroll className="project-proposals-scroll">
        <main className="project-proposals-content">
          <section className="project-proposals-heading"><span className="project-proposals-mark"><PackageCheck size={24} /></span><div><small>خصوصی · پروژهٔ {project.name}</small><h1>پیشنهادهای ثبت‌شده توسط شما</h1><p>اصل یا مرجع، رونویسی خام و فیلدهای اعلامی را بدون ساختن ادعای پاسخ واقعی نگه‌دار.</p></div></section>
          <section className="proposal-honesty-banner" data-testid="proposal-inbox-honesty"><ShieldCheck size={18} /><span><strong>این صندوق دستی است</strong><small>هیچ پیشنهاد واقعی از شبکهٔ چیدا دریافت نشده؛ مقایسهٔ محصول و ماتریس خدمت دو مسیر مستقل‌اند و هیچ انتخاب برنده، سفارش یا ارسال بیرونی نمی‌سازند.</small></span></section>
          <div className="proposal-comparison-entries">
            <button ref={productComparisonsButtonRef} className="project-files-entry proposal-comparisons-entry" type="button" onClick={() => setComparisonMode("product")} data-testid="proposal-comparisons-entry"><span className="project-files-entry-icon"><LayoutGrid size={22} /></span><span className="project-files-entry-copy"><strong>مقایسه‌های محصول و تصمیم</strong><small>{comparisonsStorageLocked ? "بازیابی محلی کامل نشد" : comparisons.length ? `${comparisons.length.toLocaleString("fa-IR")} مقایسهٔ نسخه‌دار` : "هنوز مقایسه‌ای ثبت نشده"}</small></span><ArrowRight size={18} /></button>
            <button ref={serviceComparisonsButtonRef} className="project-files-entry proposal-comparisons-entry service-proposal-comparisons-entry" type="button" onClick={() => setComparisonMode("service")} data-testid="service-proposal-comparisons-entry"><span className="project-files-entry-icon"><LayoutGrid size={22} /></span><span className="project-files-entry-copy"><strong>مقایسه‌های خدمت و تصمیم</strong><small>{serviceComparisonsStorageLocked ? "بازیابی محلی کامل نشد" : serviceComparisons.length ? `${serviceComparisons.length.toLocaleString("fa-IR")} ماتریس نسخه‌دار` : "هنوز ماتریسی ثبت نشده"}</small></span><ArrowRight size={18} /></button>
            <button ref={negotiationDraftsButtonRef} className="project-files-entry proposal-comparisons-entry negotiation-drafts-entry" type="button" onClick={() => { setNegotiationOriginTarget(null); setNegotiationInitialTargetKey(null); setNegotiationInitialDraftId(null); setComparisonMode("negotiation"); }} data-testid="negotiation-drafts-entry"><span className="project-files-entry-icon"><MessageSquare size={22} /></span><span className="project-files-entry-copy"><strong>پیش‌نویس‌ها و پاسخ‌های دستی</strong><small>{negotiationDraftsStorageLocked ? "بازیابی سؤال‌ها کامل نشد" : negotiationDrafts.length ? `${negotiationDrafts.length.toLocaleString("fa-IR")} سؤال ارسال‌نشده · ${manualNegotiationResponsesStorageLocked ? "وضعیت پاسخ‌ها نامشخص" : `${manualNegotiationResponses.length.toLocaleString("fa-IR")} پاسخ دستی`}` : "هنوز پیش‌نویسی ثبت نشده"}</small></span><ArrowRight size={18} /></button>
          </div>
          {storageLocked ? <section className="proposal-storage-error" role="alert" data-testid="proposal-storage-error"><CircleHelp size={19} /><span><strong>بازیابی دادهٔ محلی کامل نشد</strong><small>برای جلوگیری از بازنویسی دادهٔ ناخوانده، ثبت و ویرایش قفل شده است.</small></span></section> : null}
          <div className="project-proposals-toolbar"><span><strong>{orderedProposals.length.toLocaleString("fa-IR")}</strong><small>رکورد محلی</small></span><button ref={addButtonRef} className="primary-button" type="button" onClick={openCreate} disabled={storageLocked || eligibleRequests.length === 0} data-testid="proposal-add"><Plus size={17} /> ثبت دستی پیشنهاد</button></div>
          {!storageLocked && eligibleRequests.length === 0 ? <p className="proposal-prerequisite-note" data-testid="proposal-prerequisite-note">برای ثبت پیشنهاد تازه، ابتدا یک درخواست را «آمادهٔ بازبینی» کن و تأیید محتوای همان نسخه را ثبت کن. تأیید برنامهٔ ارسال لازم نیست.</p> : null}
          {orderedProposals.length ? <div className="project-proposals-list">{orderedProposals.map((proposal) => {
            const revision = proposal.revisions.find((item) => item.id === proposal.currentRevisionId)!;
            const status = builderRecordedProposalEffectiveStatus(proposal, requests, approvals, contacts);
            return <button className="proposal-card" type="button" key={proposal.id} data-proposal-id={proposal.id} onClick={() => { setSelectedId(proposal.id); setPreviewRevisionId(proposal.currentRevisionId); setLiveMessage(""); window.requestAnimationFrame(() => detailHeadingRef.current?.focus()); }} data-testid="proposal-card"><span className="proposal-card-icon"><PackageCheck size={20} /></span><span className="proposal-card-copy"><span><small>{status === "current" ? "نسخهٔ جاری" : "تاریخی · بازبینی"}</small><small>{formatProjectFileDate(proposal.updatedAt)}</small></span><strong>{proposal.supplierSnapshot.displayName}</strong><em>{proposal.requestSnapshot.title}</em><small>نسخهٔ رونویسی {revision.version.toLocaleString("fa-IR")} · {proposal.source}</small></span><ArrowRight size={17} aria-hidden="true" /></button>;
          })}</div> : <section className="proposal-empty-state" data-testid="proposal-empty-state"><PackageCheck size={26} /><h2>صندوق هنوز خالی است</h2><p>وقتی بیرون از چیدا قیمت یا شرایطی گرفتی، آن را دستی و شفاف به درخواست دقیق وصل کن.</p></section>}
        </main>
      </MobileScroll>
      <span className="sr-only" aria-live="polite">{liveMessage}</span>
    </div>
  );
}

function PurchaseRequestModeSwitch({ mode, onChange, testIdPrefix, label }: { mode: PurchaseRequestDisclosureMode; onChange: (mode: PurchaseRequestDisclosureMode) => void; testIdPrefix: string; label: string }) {
  return (
    <div className="purchase-request-mode-switch" role="group" aria-label={label} data-testid={`${testIdPrefix}-group`}>
      <button type="button" aria-pressed={mode === "simple"} onClick={() => onChange("simple")} data-testid={`${testIdPrefix}-simple`}><span>ساده</span><small>موارد اصلی</small></button>
      <button type="button" aria-pressed={mode === "advanced"} onClick={() => onChange("advanced")} data-testid={`${testIdPrefix}-advanced`}><span>پیشرفته</span><small>جزئیات کامل</small></button>
    </div>
  );
}

function ProjectPurchaseRequestsView({ project, requests, approvals, contacts, dispatchDrafts, dispatchPlanApprovals, storageLocked, approvalsStorageLocked, contactsStorageLocked, dispatchStorageLocked, dispatchPlanApprovalsStorageLocked, initialSelectedId, startWithEditor, backLabel, onBack, onCreate, onUpdate, onMarkReady, onReturnToDraft, onCreateApproval, onOpenApproval, onCreateContact, onContactStatusChange, onUpsertDispatchDraft, onCreateDispatchPlanApproval, onChangeDispatchPlanApproval }: { project: BuilderProject; requests: ProjectPurchaseRequestRecord[]; approvals: ProjectApprovalRecord[]; contacts: SupplierContactRecord[]; dispatchDrafts: DispatchDraftRecord[]; dispatchPlanApprovals: DispatchPlanApprovalRecord[]; storageLocked: boolean; approvalsStorageLocked: boolean; contactsStorageLocked: boolean; dispatchStorageLocked: boolean; dispatchPlanApprovalsStorageLocked: boolean; initialSelectedId: string | null; startWithEditor: boolean; backLabel: string; onBack: () => void; onCreate: (draft: PurchaseRequestDraft) => string | null; onUpdate: (requestId: string, draft: PurchaseRequestDraft) => boolean; onMarkReady: (requestId: string) => boolean; onReturnToDraft: (requestId: string) => boolean; onCreateApproval: (requestId: string) => string | null; onOpenApproval: (approvalId: string, returnToPurchaseRequestId: string | null) => void; onCreateContact: (draft: SupplierContactDraft) => string | null; onContactStatusChange: (contactId: string, nextStatus: SupplierContactStatus) => boolean; onUpsertDispatchDraft: (requestId: string, approvalId: string, recipientIds: string[]) => string | null; onCreateDispatchPlanApproval: (dispatchDraftId: string) => string | null; onChangeDispatchPlanApproval: (approvalId: string, action: "approve" | "withdraw" | "reopen") => boolean }) {
  const keyboard = useKeyboard();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const approvalButtonRef = useRef<HTMLButtonElement>(null);
  const detailHeadingRef = useRef<HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [editorOpen, setEditorOpen] = useState(() => startWithEditor && !storageLocked);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<PurchaseRequestDisclosureMode>("simple");
  const [detailMode, setDetailMode] = useState<PurchaseRequestDisclosureMode>("simple");
  const [requestDraft, setRequestDraft] = useState<PurchaseRequestDraft>(() => ({ ...emptyPurchaseRequestDraft, items: [emptyProductRequestItemDraft()] }));
  const [fieldErrors, setFieldErrors] = useState<PurchaseRequestFieldErrors>(emptyPurchaseRequestFieldErrors);
  const [storageError, setStorageError] = useState("");
  const [dispatchPlannerRequestId, setDispatchPlannerRequestId] = useState<string | null>(null);
  const selectedRequest = selectedId ? requests.find((request) => request.id === selectedId) ?? null : null;
  const selectedRequestApproval = selectedRequest
    ? approvals.find((approval) => approval.target.id === selectedRequest.id && approval.target.version === selectedRequest.version) ?? null
    : null;
  const orderedRequests = useMemo(
    () => [...requests].sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()),
    [requests],
  );
  const missingFields = selectedRequest ? purchaseRequestMissingFields(selectedRequest) : [];

  const dispatchPlannerRequest = dispatchPlannerRequestId ? requests.find((request) => request.id === dispatchPlannerRequestId) ?? null : null;
  const dispatchPlannerApproval = dispatchPlannerRequest
    ? approvals.find((approval) => approval.target.id === dispatchPlannerRequest.id && approval.target.version === dispatchPlannerRequest.version && isApprovalEligibleForDispatch(approval, dispatchPlannerRequest, project.id)) ?? null
    : null;
  const dispatchPlannerDraft = dispatchPlannerApproval
    ? dispatchDrafts.find((item) => item.dedupeKey === dispatchDraftDedupeKey(project.id, dispatchPlannerRequest!.id, dispatchPlannerRequest!.version, dispatchPlannerApproval.target.revisionId)) ?? null
    : null;

  useEffect(() => {
    if (selectedId && !selectedRequest) setSelectedId(null);
  }, [selectedId, selectedRequest]);

  useEffect(() => {
    if (dispatchPlannerRequestId && (!dispatchPlannerRequest || !dispatchPlannerApproval)) setDispatchPlannerRequestId(null);
  }, [dispatchPlannerApproval, dispatchPlannerRequest, dispatchPlannerRequestId]);

  useLayoutEffect(() => {
    if (!initialSelectedId || selectedRequest?.id !== initialSelectedId) return;
    window.requestAnimationFrame(() => approvalButtonRef.current?.focus());
  }, [initialSelectedId, selectedRequest?.id]);

  const openCreateEditor = () => {
    setEditingId(null);
    setRequestDraft({ ...emptyPurchaseRequestDraft, items: [emptyProductRequestItemDraft()] });
    setFieldErrors(emptyPurchaseRequestFieldErrors);
    setStorageError("");
    setEditorMode("simple");
    setEditorOpen(true);
  };

  const openEditEditor = (request: ProjectPurchaseRequestRecord) => {
    if (request.status !== "draft") return;
    setEditingId(request.id);
    setRequestDraft(purchaseRequestDraftFromRecord(request));
    setFieldErrors(emptyPurchaseRequestFieldErrors);
    setStorageError("");
    setEditorMode("simple");
    setEditorOpen(true);
  };

  const closeEditor = () => {
    const focusTarget = editingId ? editButtonRef.current : addButtonRef.current;
    keyboard.hide();
    setEditorOpen(false);
    setEditingId(null);
    setFieldErrors(emptyPurchaseRequestFieldErrors);
    setStorageError("");
    window.requestAnimationFrame(() => focusTarget?.focus());
  };

  const changeDraft = (field: Exclude<keyof PurchaseRequestDraft, "items" | "requestKind">, value: string) => {
    setRequestDraft((current) => ({ ...current, [field]: value }));
    if (field in fieldErrors) {
      const errorField = field as keyof PurchaseRequestFieldErrors;
      setFieldErrors((current) => current[errorField] ? { ...current, [errorField]: "" } : current);
    }
    setStorageError("");
  };

  const changeRequestKind = (requestKind: PurchaseRequestKind) => {
    if (editingId) return;
    setRequestDraft((current) => ({ ...current, requestKind }));
    setStorageError("");
  };

  const changeProductItemDraft = (index: number, field: Exclude<keyof ProductRequestItemDraft, "id">, value: string) => {
    setRequestDraft((current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
    if (field === "quantity") setFieldErrors((current) => current.quantity ? { ...current, quantity: "", quantityIndex: null } : current);
    setStorageError("");
  };

  const addProductItemDraft = () => {
    setRequestDraft((current) => current.items.length >= 8 ? current : { ...current, items: [...current.items, emptyProductRequestItemDraft(`draft-${window.crypto.randomUUID()}`)] });
    setStorageError("");
  };

  const removeProductItemDraft = (index: number) => {
    setRequestDraft((current) => current.items.length <= 1 ? current : { ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) });
    setStorageError("");
  };

  const saveRequest = () => {
    const rawNeed = requestDraft.rawNeed.trim();
    const normalizedQuantities = requestDraft.items.map((item) => item.quantity.trim() ? normalizeProjectNumber(item.quantity, false) : "");
    const invalidQuantityIndex = requestDraft.requestKind === "product" ? normalizedQuantities.findIndex((quantity) => quantity === null || Boolean(quantity && Number(quantity) <= 0)) : -1;
    const nextErrors = {
      ...emptyPurchaseRequestFieldErrors,
      rawNeed: hasVisibleProjectTaskText(rawNeed) ? "" : "نیازت را بنویس تا یک پیش‌نویس محلی ساخته شود.",
      quantity: invalidQuantityIndex >= 0 ? "مقدار باید یک عدد بیشتر از صفر باشد." : "",
      quantityIndex: invalidQuantityIndex >= 0 ? invalidQuantityIndex : null,
    } satisfies PurchaseRequestFieldErrors;
    setFieldErrors(nextErrors);
    if (nextErrors.rawNeed || nextErrors.quantity) {
      const invalidId = nextErrors.rawNeed ? "purchase-request-raw" : invalidQuantityIndex <= 0 ? "purchase-request-quantity" : `purchase-request-quantity-${invalidQuantityIndex}`;
      window.requestAnimationFrame(() => document.getElementById(invalidId)?.focus());
      return;
    }

    const normalizedDraft = { ...requestDraft, rawNeed, items: requestDraft.items.map((item, index) => ({ ...item, quantity: normalizedQuantities[index] ?? "" })) };
    keyboard.hide();
    if (editingId) {
      if (!onUpdate(editingId, normalizedDraft)) {
        setStorageError("ویرایش پیش‌نویس ذخیره نشد. فضای مرورگر را بررسی کن و دوباره تلاش کن.");
        return;
      }
      setEditorOpen(false);
      setEditingId(null);
      setDetailMode("simple");
      window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
      return;
    }

    const requestId = onCreate(normalizedDraft);
    if (!requestId) {
      setStorageError("پیش‌نویس ذخیره نشد. فضای مرورگر را بررسی کن و دوباره تلاش کن.");
      return;
    }
    setSelectedId(requestId);
    setDetailMode("simple");
    setEditorOpen(false);
    window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
  };

  const markReady = () => {
    if (!selectedRequest || missingFields.length > 0) return;
    if (!onMarkReady(selectedRequest.id)) {
      setStorageError("تغییر وضعیت ذخیره نشد. دوباره تلاش کن.");
      return;
    }
    setStorageError("");
    window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
  };

  const returnToDraft = () => {
    if (!selectedRequest || selectedRequest.status !== "ready-for-review") return;
    if (!onReturnToDraft(selectedRequest.id)) {
      setStorageError("بازگشت به ویرایش ذخیره نشد. دوباره تلاش کن.");
      return;
    }
    setStorageError("");
    window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
  };

  const requestApproval = () => {
    if (!selectedRequest || selectedRequest.status !== "ready-for-review") return;
    if (selectedRequestApproval) {
      onOpenApproval(selectedRequestApproval.id, selectedRequest.id);
      return;
    }
    const approvalId = onCreateApproval(selectedRequest.id);
    if (!approvalId) {
      setStorageError("ثبت در صف تأیید انجام نشد. هیچ وضعیت یا مجوزی تغییر نکرد.");
      return;
    }
    setStorageError("");
    onOpenApproval(approvalId, null);
  };

  const returnToList = () => {
    const requestId = selectedRequest?.id;
    keyboard.hide();
    setStorageError("");
    setSelectedId(null);
    setDetailMode("simple");
    window.requestAnimationFrame(() => {
      if (!requestId) return;
      document.querySelector<HTMLElement>(`[data-request-id="${requestId}"]`)?.focus();
    });
  };

  const editorSheet = (
    <BottomSheet key={editingId ? `purchase-editor-${editingId}` : "purchase-editor-create"} open={editorOpen} onOpenChange={(open) => { if (!open) closeEditor(); }} title={editingId ? "ویرایش پیش‌نویس" : "پیش‌نویس درخواست پروژه"} description={`محصول چندقلمی یا خدمت مستقل برای ${project.name}؛ بدون ارسال بیرونی.`} snap={0.94}>
      <form className="purchase-request-editor-sheet" dir="rtl" data-testid="purchase-request-editor-sheet" onSubmit={(event) => { event.preventDefault(); saveRequest(); }}>
        <fieldset className="purchase-request-kind-picker" disabled={Boolean(editingId)}>
          <legend>نوع درخواست</legend>
          <button type="button" aria-pressed={requestDraft.requestKind === "product"} onClick={() => changeRequestKind("product")} data-testid="purchase-request-kind-product">محصول</button>
          <button type="button" aria-pressed={requestDraft.requestKind === "service"} onClick={() => changeRequestKind("service")} data-testid="purchase-request-kind-service">خدمت</button>
          {editingId ? <small>نوع درخواست بعد از ثبت ثابت می‌ماند.</small> : null}
        </fieldset>
        <PurchaseRequestModeSwitch mode={editorMode} onChange={setEditorMode} testIdPrefix="purchase-request-mode" label="سطح جزئیات فرم درخواست" />
        <p className="purchase-request-mode-note">در حالت ساده فقط موارد اصلی را می‌بینی؛ رفت‌وبرگشت بین دو حالت چیزی از پیش‌نویس پاک نمی‌کند.</p>
        <label className="field-control" htmlFor="purchase-request-raw">
          <span>نیاز اولیه</span>
          <KeyboardTextarea id="purchase-request-raw" data-testid="purchase-request-raw-input" value={requestDraft.rawNeed} maxLength={800} rows={4} placeholder="مثلاً ۲۰ تن سیمان تیپ ۲ برای هفتهٔ آینده لازم داریم" onChange={(event) => changeDraft("rawNeed", event.target.value)} aria-invalid={Boolean(fieldErrors.rawNeed)} aria-describedby={fieldErrors.rawNeed ? "purchase-request-raw-error" : "purchase-request-raw-note"} />
          {fieldErrors.rawNeed ? <small className="field-error" id="purchase-request-raw-error" data-testid="purchase-request-raw-error">{fieldErrors.rawNeed}</small> : <small id="purchase-request-raw-note">متن دقیق خودت ثبت می‌شود؛ این نسخه استخراج هوشمند ندارد.</small>}
        </label>

        {requestDraft.requestKind === "product" ? (
          <>
            <div className="purchase-request-form-section"><strong>اقلام محصول</strong><small>{requestDraft.items.length.toLocaleString("fa-IR")} قلم · حداکثر ۸</small></div>
            {requestDraft.items.map((item, index) => {
              const suffix = index === 0 ? "" : `-${index}`;
              return (
                <section className="purchase-request-item-editor" key={item.id || `new-item-${index}`} data-testid="purchase-request-item-editor">
                  <div className="purchase-request-item-editor-title"><strong>قلم {index + 1}</strong>{requestDraft.items.length > 1 ? <button type="button" onClick={() => removeProductItemDraft(index)} aria-label={`حذف قلم ${index + 1}`}>حذف</button> : null}</div>
                  <label className="field-control" htmlFor={`purchase-request-item${suffix}`}><span>نام قلم</span><KeyboardInput id={`purchase-request-item${suffix}`} data-testid={index === 0 ? "purchase-request-item-input" : `purchase-request-item-input-${index}`} value={item.itemName} maxLength={100} placeholder="مثلاً سیمان تیپ ۲" onChange={(event) => changeProductItemDraft(index, "itemName", event.target.value)} /></label>
                  <div className="purchase-request-field-grid">
                    <label className="field-control" htmlFor={`purchase-request-quantity${suffix}`}><span>مقدار</span><KeyboardInput id={`purchase-request-quantity${suffix}`} data-testid={index === 0 ? "purchase-request-quantity-input" : `purchase-request-quantity-input-${index}`} value={item.quantity} inputMode="decimal" dir="ltr" placeholder="مثلاً ۲۰٫۵" onChange={(event) => changeProductItemDraft(index, "quantity", event.target.value)} aria-invalid={Boolean(fieldErrors.quantity) && fieldErrors.quantityIndex === index} aria-describedby={fieldErrors.quantity && fieldErrors.quantityIndex === index ? `purchase-request-quantity-error${suffix}` : undefined} />{fieldErrors.quantity && fieldErrors.quantityIndex === index ? <small className="field-error" id={`purchase-request-quantity-error${suffix}`}>{fieldErrors.quantity}</small> : null}</label>
                    <div className="field-control"><span>واحد</span><ProjectChoiceMenu id={`purchase-request-unit${suffix}`} testId={index === 0 ? "purchase-request-unit-select" : `purchase-request-unit-select-${index}`} value={item.unit} placeholder="انتخاب واحد" options={purchaseRequestUnits} ariaLabel={`واحد قلم ${index + 1}`} onChange={(value) => changeProductItemDraft(index, "unit", value)} /></div>
                  </div>
                  {editorMode === "advanced" ? (
                    <>
                      <label className="field-control" htmlFor={`purchase-request-brand${suffix}`}><span>برند یا گرید</span><KeyboardInput id={`purchase-request-brand${suffix}`} data-testid={index === 0 ? "purchase-request-brand-input" : `purchase-request-brand-input-${index}`} value={item.brandOrGrade} maxLength={100} placeholder="خالی بماند: نامشخص صریح" onChange={(event) => changeProductItemDraft(index, "brandOrGrade", event.target.value)} /></label>
                      <label className="field-control" htmlFor={`purchase-request-specification${suffix}`}><span>مشخصات تکمیلی</span><KeyboardTextarea id={`purchase-request-specification${suffix}`} data-testid={index === 0 ? "purchase-request-specification-input" : `purchase-request-specification-input-${index}`} value={item.specification} maxLength={500} rows={3} placeholder="کیفیت، بسته‌بندی یا الزام فنی موردنظر" onChange={(event) => changeProductItemDraft(index, "specification", event.target.value)} /></label>
                      <div className="field-control"><span>پذیرش جایگزین</span><ProjectChoiceMenu id={`purchase-request-alternatives${suffix}`} testId={index === 0 ? "purchase-request-alternatives-select" : `purchase-request-alternatives-select-${index}`} value={item.alternatives} placeholder="وضعیت جایگزین" options={purchaseRequestAlternativeLabels} ariaLabel={`پذیرش جایگزین قلم ${index + 1}`} onChange={(value) => changeProductItemDraft(index, "alternatives", value)} /></div>
                    </>
                  ) : null}
                </section>
              );
            })}
            <button className="purchase-request-add-item" type="button" onClick={addProductItemDraft} disabled={requestDraft.items.length >= 8} data-testid="purchase-request-add-item"><Plus size={17} /> افزودن قلم</button>
            <div className="purchase-request-form-section"><strong>تحویل</strong><small>{editorMode === "advanced" ? "و شرایط تجاری" : "موارد اصلی"}</small></div>
            <label className="field-control" htmlFor="purchase-request-delivery-area"><span>محدودهٔ تحویل</span><KeyboardInput id="purchase-request-delivery-area" data-testid="purchase-request-delivery-area-input" value={requestDraft.deliveryArea} maxLength={120} placeholder="مثلاً سعادت‌آباد؛ خالی یعنی نامشخص" onChange={(event) => changeDraft("deliveryArea", event.target.value)} /></label>
            <label className="field-control" htmlFor="purchase-request-needed-by"><span>موعد موردنیاز</span><KeyboardInput id="purchase-request-needed-by" data-testid="purchase-request-needed-by-input" value={requestDraft.neededBy} maxLength={80} placeholder="مثلاً تا ۱۰ شهریور" onChange={(event) => changeDraft("neededBy", event.target.value)} /></label>
            {editorMode === "advanced" ? (
              <>
                <div className="purchase-request-form-section"><strong>شرایط تجاری</strong><small>خالی بماند: نامشخص صریح</small></div>
                <label className="field-control" htmlFor="purchase-request-transport"><span>حمل</span><KeyboardInput id="purchase-request-transport" data-testid="purchase-request-transport-input" value={requestDraft.transport} maxLength={160} placeholder="نامشخص" onChange={(event) => changeDraft("transport", event.target.value)} /></label>
                <label className="field-control" htmlFor="purchase-request-tax"><span>مالیات</span><KeyboardInput id="purchase-request-tax" data-testid="purchase-request-tax-input" value={requestDraft.tax} maxLength={160} placeholder="نامشخص" onChange={(event) => changeDraft("tax", event.target.value)} /></label>
                <label className="field-control" htmlFor="purchase-request-payment"><span>شرایط پرداخت</span><KeyboardInput id="purchase-request-payment" data-testid="purchase-request-payment-input" value={requestDraft.paymentTerms} maxLength={160} placeholder="نامشخص" onChange={(event) => changeDraft("paymentTerms", event.target.value)} /></label>
              </>
            ) : null}
          </>
        ) : (
          <>
            <div className="purchase-request-form-section"><strong>شناسنامهٔ خدمت</strong><small>شِمای مستقل از محصول</small></div>
            <label className="field-control" htmlFor="purchase-request-service-scope"><span>دامنهٔ خدمت</span><KeyboardTextarea id="purchase-request-service-scope" data-testid="purchase-request-service-scope-input" value={requestDraft.serviceScope} maxLength={500} rows={3} placeholder="مثلاً اجرای عایق رطوبتی بام" onChange={(event) => changeDraft("serviceScope", event.target.value)} /></label>
            <label className="field-control" htmlFor="purchase-request-service-location"><span>موقعیت مجاز</span><KeyboardInput id="purchase-request-service-location" data-testid="purchase-request-service-location-input" value={requestDraft.serviceLocation} maxLength={160} placeholder="فقط محدوده/بخش پروژه؛ بدون نشانی دقیق" onChange={(event) => changeDraft("serviceLocation", event.target.value)} /><small>فقط محله، محدوده یا بخش پروژه را ثبت کن؛ پلاک و نشانی دقیق در این فیلد مجاز نیست.</small></label>
            <label className="field-control" htmlFor="purchase-request-service-size"><span>اندازه یا حجم</span><KeyboardInput id="purchase-request-service-size" data-testid="purchase-request-service-size-input" value={requestDraft.serviceSizeOrVolume} maxLength={160} placeholder="نامشخص" onChange={(event) => changeDraft("serviceSizeOrVolume", event.target.value)} /></label>
            <label className="field-control" htmlFor="purchase-request-service-timing"><span>زمان</span><KeyboardInput id="purchase-request-service-timing" data-testid="purchase-request-service-timing-input" value={requestDraft.serviceTiming} maxLength={160} placeholder="نامشخص" onChange={(event) => changeDraft("serviceTiming", event.target.value)} /></label>
            {editorMode === "advanced" ? (
              <>
                <div className="purchase-request-form-section"><strong>جزئیات تکمیلی خدمت</strong><small>اختیاری و قابل بازگشت</small></div>
                <label className="field-control" htmlFor="purchase-request-service-qualification"><span>صلاحیت لازم</span><KeyboardInput id="purchase-request-service-qualification" data-testid="purchase-request-service-qualification-input" value={requestDraft.serviceQualification} maxLength={160} placeholder="نامشخص" onChange={(event) => changeDraft("serviceQualification", event.target.value)} /></label>
                <label className="field-control" htmlFor="purchase-request-service-method"><span>روش اجرا</span><KeyboardInput id="purchase-request-service-method" data-testid="purchase-request-service-method-input" value={requestDraft.serviceMethod} maxLength={160} placeholder="نامشخص" onChange={(event) => changeDraft("serviceMethod", event.target.value)} /></label>
                <label className="field-control" htmlFor="purchase-request-service-in-scope"><span>داخل دامنه</span><KeyboardTextarea id="purchase-request-service-in-scope" data-testid="purchase-request-service-in-scope-input" value={requestDraft.serviceInScope} maxLength={500} rows={2} placeholder="موارد داخل دامنه یا نامشخص" onChange={(event) => changeDraft("serviceInScope", event.target.value)} /></label>
                <label className="field-control" htmlFor="purchase-request-service-out-scope"><span>خارج از دامنه</span><KeyboardTextarea id="purchase-request-service-out-scope" data-testid="purchase-request-service-out-scope-input" value={requestDraft.serviceOutOfScope} maxLength={500} rows={2} placeholder="موارد خارج از دامنه یا نامشخص" onChange={(event) => changeDraft("serviceOutOfScope", event.target.value)} /></label>
                <label className="field-control" htmlFor="purchase-request-service-warranty"><span>ضمانت اعلامی</span><KeyboardInput id="purchase-request-service-warranty" data-testid="purchase-request-service-warranty-input" value={requestDraft.serviceWarranty} maxLength={160} placeholder="نامشخص" onChange={(event) => changeDraft("serviceWarranty", event.target.value)} /></label>
                <label className="field-control" htmlFor="purchase-request-service-payment"><span>شرایط پرداخت</span><KeyboardInput id="purchase-request-service-payment" data-testid="purchase-request-service-payment-input" value={requestDraft.servicePaymentTerms} maxLength={160} placeholder="نامشخص" onChange={(event) => changeDraft("servicePaymentTerms", event.target.value)} /></label>
              </>
            ) : null}
          </>
        )}

        <dl className="purchase-request-meta">
          <div><dt>پروژهٔ مالک</dt><dd>{project.name}</dd></div>
          <div><dt>نوع درخواست</dt><dd>{requestDraft.requestKind === "product" ? "محصول" : "خدمت"}</dd></div>
          <div><dt>دسترسی</dt><dd>خصوصی پروژه</dd></div>
          <div><dt>وضعیت نخست</dt><dd>پیش‌نویس · نسخهٔ ۱</dd></div>
        </dl>
        <p className="purchase-request-boundary"><ShieldCheck size={16} /><span>ثبت این فرم فقط یک پیش‌نویس محلی می‌سازد؛ فایل و استخراج خودکار در این مسیر فعال نیست و هیچ تأیید، قیمت یا ارسال بیرونی ایجاد نمی‌شود.</span></p>
        {storageError ? <p className="purchase-request-storage-error" role="alert" data-testid="purchase-request-storage-error">{storageError}</p> : null}
        <button className="primary-button" type="submit" data-testid="purchase-request-save">{editingId ? "ذخیرهٔ نسخهٔ جدید" : "ثبت پیش‌نویس محلی"}</button>
      </form>
    </BottomSheet>
  );

  if (dispatchPlannerRequest && dispatchPlannerApproval) {
    return (
      <ProjectDispatchPlannerView
        project={project}
        request={dispatchPlannerRequest}
        approval={dispatchPlannerApproval}
        contacts={contacts}
        dispatchDraft={dispatchPlannerDraft}
        dispatchPlanApprovals={dispatchPlanApprovals}
        contactsStorageLocked={contactsStorageLocked}
        dispatchStorageLocked={dispatchStorageLocked}
        dispatchPlanApprovalsStorageLocked={dispatchPlanApprovalsStorageLocked}
        onBack={() => setDispatchPlannerRequestId(null)}
        onCreateContact={onCreateContact}
        onContactStatusChange={onContactStatusChange}
        onUpsertDispatchDraft={onUpsertDispatchDraft}
        onCreateDispatchPlanApproval={onCreateDispatchPlanApproval}
        onChangeDispatchPlanApproval={onChangeDispatchPlanApproval}
      />
    );
  }

  if (selectedRequest) {
    return (
      <div className="chida-app project-purchase-request-detail-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-purchase-request-detail-view">
        <header className="project-workspace-header">
          <button className="icon-button" type="button" onClick={returnToList} aria-label="بازگشت به درخواست‌های خرید" data-testid="purchase-request-detail-back"><ArrowRight size={21} /></button>
          <span className="project-workspace-title"><small>جزئیات درخواست پروژه</small><strong>{project.name}</strong></span>
          <span className="project-workspace-header-spacer" aria-hidden="true" />
        </header>

        <MobileScroll className="project-purchase-request-detail-scroll">
          <main className="project-purchase-request-detail-content">
            <section ref={detailHeadingRef} className="purchase-request-detail-heading" tabIndex={-1} aria-live="polite" data-testid="purchase-request-detail-heading">
              <span><ShoppingCart size={24} strokeWidth={1.65} /></span>
              <div><small>{purchaseRequestStatusLabel(selectedRequest.status)} · نسخهٔ {selectedRequest.version.toLocaleString("fa-IR")}</small><h1>{purchaseRequestDisplayTitle(selectedRequest)}</h1><p>{selectedRequest.rawNeed.text}</p></div>
            </section>

            <PurchaseRequestModeSwitch mode={detailMode} onChange={setDetailMode} testIdPrefix="purchase-request-detail-mode" label="سطح جزئیات درخواست" />
            {detailMode === "simple" ? <p className="purchase-request-mode-note">خلاصهٔ تصمیم‌گیری را می‌بینی؛ شناسنامه، شرایط، روشن‌سازی‌ها و تاریخچه در نمای پیشرفته باقی مانده‌اند.</p> : null}
            <p className="purchase-request-share-status"><ShieldCheck size={15} /><span>وضعیت اقدام بیرونی: <strong>{selectedRequest.sharingStatus}</strong></span></p>

            {selectedRequest.requestKind === "product" ? (
              <section className="purchase-request-records" aria-label="اقلام نسخهٔ درخواست" data-testid="purchase-request-product-items">
                <div className="purchase-request-section-title"><strong>اقلام محصول</strong><span>{selectedRequest.items.length.toLocaleString("fa-IR")}</span></div>
                {selectedRequest.items.map((item, index) => (
                  <article className="purchase-request-record-card" key={item.id} data-testid="purchase-request-product-item">
                    <div><strong>{item.name ?? `قلم ${index + 1}`}</strong><span className={item.completionStatus === "complete" ? "is-complete" : "is-incomplete"}>{item.completionStatus === "complete" ? "کامل" : "ناقص"}</span></div>
                    <dl>
                      <div><dt>مقدار و واحد</dt><dd>{item.quantity && item.unit ? `${Number(item.quantity).toLocaleString("fa-IR", { maximumFractionDigits: 6 })} ${item.unit}` : "ثبت نشده"}</dd></div>
                      {detailMode === "advanced" ? <><div><dt>برند یا گرید</dt><dd>{item.brandOrGrade ?? "نامشخص"}</dd></div><div><dt>مشخصات</dt><dd>{item.specification ?? "نامشخص"}</dd></div><div><dt>جایگزین</dt><dd>{purchaseRequestAlternativesLabel(item.alternatives)}</dd></div><div><dt>منشأ</dt><dd>{item.source}</dd></div><div><dt>نسخه و تاریخچه</dt><dd>نسخهٔ {item.version.toLocaleString("fa-IR")} · {item.history.length.toLocaleString("fa-IR")} رویداد</dd></div></> : null}
                    </dl>
                  </article>
                ))}
                <dl className="purchase-request-meta"><div><dt>موعد موردنیاز</dt><dd>{selectedRequest.delivery.neededBy ?? "نامشخص"}</dd></div><div><dt>تحویل</dt><dd>تهران · {selectedRequest.delivery.area}</dd></div>{detailMode === "advanced" ? <div><dt>ثبت و اشتراک</dt><dd>{selectedRequest.localStatus} · {selectedRequest.sharingStatus}</dd></div> : null}</dl>
              </section>
            ) : selectedRequest.service ? (
              <section className="purchase-request-records" aria-label="شناسنامهٔ خدمت" data-testid="purchase-request-service-record">
                <div className="purchase-request-section-title"><strong>خدمت مستقل</strong><span className={selectedRequest.service.completionStatus === "complete" ? "is-complete" : "is-incomplete"}>{selectedRequest.service.completionStatus === "complete" ? "کامل" : "ناقص"}</span></div>
                <dl className="purchase-request-meta">
                  <div><dt>دامنه</dt><dd>{selectedRequest.service.scope ?? "نامشخص"}</dd></div><div><dt>موقعیت مجاز</dt><dd>{selectedRequest.service.location ?? "نامشخص"}</dd></div><div><dt>اندازه یا حجم</dt><dd>{selectedRequest.service.sizeOrVolume ?? "نامشخص"}</dd></div><div><dt>زمان</dt><dd>{selectedRequest.service.timing ?? "نامشخص"}</dd></div>
                  {detailMode === "advanced" ? <><div><dt>سطح مکان</dt><dd>فقط محدوده یا بخش پروژه · بدون آدرس دقیق</dd></div><div><dt>صلاحیت</dt><dd>{selectedRequest.service.qualification ?? "نامشخص"}</dd></div><div><dt>روش</dt><dd>{selectedRequest.service.method ?? "نامشخص"}</dd></div><div><dt>داخل دامنه</dt><dd>{selectedRequest.service.inScope ?? "نامشخص"}</dd></div><div><dt>خارج از دامنه</dt><dd>{selectedRequest.service.outOfScope ?? "نامشخص"}</dd></div><div><dt>ضمانت اعلامی</dt><dd>{selectedRequest.service.warranty ?? "نامشخص"}</dd></div><div><dt>پرداخت</dt><dd>{selectedRequest.service.paymentTerms ?? "نامشخص"}</dd></div><div><dt>منشأ</dt><dd>{selectedRequest.service.source}</dd></div><div><dt>نسخه و تاریخچه</dt><dd>نسخهٔ {selectedRequest.service.version.toLocaleString("fa-IR")} · {selectedRequest.service.history.length.toLocaleString("fa-IR")} رویداد</dd></div></> : null}
                </dl>
              </section>
            ) : null}

            {missingFields.length > 0 ? (
              <section className="purchase-request-missing" id="purchase-request-missing-fields" data-testid="purchase-request-missing-fields">
                <div><CircleHelp size={17} /><strong>برای آماده‌کردن بازبینی تکمیل کن</strong></div>
                <ul>{missingFields.map((field) => <li key={field}>{field}</li>)}</ul>
              </section>
            ) : null}

            {detailMode === "advanced" && selectedRequest.requestKind === "product" ? <section className="purchase-request-terms" aria-labelledby="purchase-request-terms-title" data-testid="purchase-request-terms"><div className="purchase-request-section-title"><strong id="purchase-request-terms-title">شرایط تجاری</strong><span>۳</span></div><dl><div><dt>حمل</dt><dd>{selectedRequest.unresolvedTerms.transport === "unknown" ? "نامشخص" : selectedRequest.unresolvedTerms.transport}</dd></div><div><dt>مالیات</dt><dd>{selectedRequest.unresolvedTerms.tax === "unknown" ? "نامشخص" : selectedRequest.unresolvedTerms.tax}</dd></div><div><dt>شرایط پرداخت</dt><dd>{selectedRequest.unresolvedTerms.paymentTerms === "unknown" ? "نامشخص" : selectedRequest.unresolvedTerms.paymentTerms}</dd></div></dl></section> : null}

            {detailMode === "advanced" ? <section className="purchase-request-clarifications" aria-label="روشن‌سازی‌های قطعی درخواست" data-testid="purchase-request-clarifications">
              <div className="purchase-request-section-title"><strong>روشن‌سازی‌های قطعی</strong><span>{selectedRequest.clarificationAnswers.length.toLocaleString("fa-IR")}</span></div>
              <p>هر سؤال وقتی ساخته شده که فیلد اثرگذار نامشخص بوده؛ پاسخ‌های بعدی برای تاریخچه نگه داشته می‌شوند و confidence برای این قواعد کاربرد ندارد.</p>
              <ol>{selectedRequest.clarificationAnswers.map((answer) => <li key={answer.id} data-testid="purchase-request-clarification"><div><strong>{answer.question}</strong><span className={answer.status === "answered" ? "is-complete" : "is-incomplete"}>{answer.status === "answered" ? "پاسخ ثبت‌شده" : answer.status === "needs-confirmation" ? "نیازمند تأیید پس از مهاجرت" : "نامشخص صریح"}</span></div><p>{answer.answer ?? "نامشخص"}</p><small>منشأ: {answer.source} · confidence: کاربرد ندارد · نسخهٔ {answer.version.toLocaleString("fa-IR")} · {answer.history.length.toLocaleString("fa-IR")} رویداد</small></li>)}</ol>
            </section> : null}

            {detailMode === "advanced" ? <aside className="purchase-request-privacy">
              <div><ShieldCheck size={18} /><span><strong>پیش‌نمایش حریم داده</strong><small>هیچ داده‌ای در این تسک ارسال نمی‌شود.</small></span></div>
              <dl><div><dt>قابل‌اشتراک در آینده</dt><dd>{selectedRequest.requestKind === "product" ? "همهٔ اقلام و شرایط ثبت‌شدهٔ همین نسخه" : "دامنه و شرایط ثبت‌شدهٔ همین خدمت"}</dd></div><div><dt>خصوصی می‌ماند</dt><dd>نام پروژه، حافظه، فایل‌ها، بودجه و آدرس دقیق</dd></div></dl>
            </aside> : null}

            <section className="purchase-request-approval-status" id="purchase-request-approval-status" data-testid="purchase-request-approval-status" aria-live="polite">
              <div className="purchase-request-section-title"><strong>وضعیت بازبینی نسخه</strong><span>{selectedRequest.version.toLocaleString("fa-IR")}</span></div>
              {approvalsStorageLocked ? (
                <p role="alert"><ShieldCheck size={16} /><span><strong>تأییدهای محلی کامل خوانده نشد.</strong> تا بازیابی موفق، ثبت تأیید و بازگشت این نسخه به ویرایش غیرفعال است.</span></p>
              ) : selectedRequestApproval ? (
                <div className={`purchase-request-approval-summary is-${selectedRequestApproval.status}`}>
                  <ClipboardCheck size={18} />
                  <span>
                    <strong>{selectedRequestApproval.status === "approved" ? `نسخهٔ ${selectedRequest.version.toLocaleString("fa-IR")} تأیید شده` : projectApprovalStatusLabel(selectedRequestApproval.status)}</strong>
                    <small>{selectedRequestApproval.status === "pending" ? "منتظر تصمیم صریح شما؛ هنوز ارسال نشده است." : selectedRequestApproval.status === "approved" ? "فقط همین نسخه برای ادامهٔ فرایند پذیرفته شده؛ هنوز ارسال نشده است." : "این نسخه نیاز به اصلاح دارد؛ هیچ ارسالی انجام نشده است."}</small>
                  </span>
                </div>
              ) : (
                <p><CircleHelp size={16} /><span><strong>هنوز در صف تأیید ثبت نشده.</strong> آماده‌شدن درخواست به‌تنهایی تأیید یا مجوز ارسال نمی‌سازد.</span></p>
              )}
            </section>

            {selectedRequestApproval?.status === "approved" && isApprovalEligibleForDispatch(selectedRequestApproval, selectedRequest, project.id) ? (
              <section className="purchase-request-dispatch-entry" data-testid="purchase-request-dispatch-entry">
                <div><Users size={18} /><span><strong>نسخهٔ جاری آمادهٔ انتخاب گیرنده است</strong><small>فقط گیرنده‌های محلی ثبت‌شده توسط شما؛ پیش‌نمایش و Draft بدون ارسال بیرونی.</small></span></div>
                <button className="primary-button" type="button" onClick={() => { setStorageError(""); setDispatchPlannerRequestId(selectedRequest.id); }} data-testid="purchase-request-open-dispatch"><Users size={17} /> انتخاب گیرنده و پیش‌نمایش اشتراک</button>
              </section>
            ) : selectedRequest.status === "ready-for-review" ? (
              <p className="purchase-request-dispatch-locked" data-testid="purchase-request-dispatch-locked"><ShieldCheck size={16} /><span><strong>انتخاب گیرنده هنوز قفل است.</strong> فقط بعد از تأیید صریح همین نسخهٔ جاری فعال می‌شود.</span></p>
            ) : null}

            {detailMode === "advanced" ? <section className="purchase-request-history" aria-label="تاریخچهٔ نسخه‌های درخواست" data-testid="purchase-request-history">
              <div className="purchase-request-section-title"><strong>تاریخچه</strong><span>{selectedRequest.history.length.toLocaleString("fa-IR")}</span></div>
              <ol>{[...selectedRequest.history].reverse().map((event) => <li key={event.id} data-testid="purchase-request-history-event"><span><Check size={14} /></span><div><strong>{purchaseRequestEventLabel(event.type)}</strong><small>توسط {event.actor} · نسخهٔ {event.version.toLocaleString("fa-IR")} · {formatProjectFileDate(event.at)}</small></div></li>)}</ol>
            </section> : null}

            <p className="purchase-request-boundary"><ShieldCheck size={17} /><span><strong>{selectedRequest.status === "ready-for-review" ? "این وضعیت تأیید یا مجوز ارسال نیست." : "فقط پیش‌نویس خصوصی و محلی است."}</strong> درخواست به هیچ تأمین‌کننده‌ای نرفته و قیمت، سفارش یا تعهد خریدی ایجاد نشده است.</span></p>
            {storageError ? <p className="purchase-request-storage-error" role="alert" data-testid="purchase-request-storage-error">{storageError}</p> : null}
            <div className="purchase-request-detail-actions">
              {selectedRequest.status === "draft" ? (
                <button ref={editButtonRef} type="button" onClick={() => openEditEditor(selectedRequest)} disabled={storageLocked} data-testid="purchase-request-edit"><PencilLine size={17} /> ویرایش پیش‌نویس</button>
              ) : (
                <button type="button" onClick={returnToDraft} disabled={storageLocked || approvalsStorageLocked || selectedRequestApproval?.status === "pending"} aria-describedby="purchase-request-approval-status" data-testid="purchase-request-return-draft"><PencilLine size={17} /> بازگشت به ویرایش</button>
              )}
              {selectedRequest.status === "draft" ? (
                <button className="primary-button" type="button" onClick={markReady} disabled={storageLocked || missingFields.length > 0} aria-describedby={missingFields.length > 0 ? "purchase-request-missing-fields" : undefined} data-testid="purchase-request-ready"><ClipboardCheck size={18} /> آماده‌کردن برای بازبینی</button>
              ) : (
                <button ref={approvalButtonRef} className="primary-button" type="button" onClick={requestApproval} disabled={storageLocked || approvalsStorageLocked} data-testid="purchase-request-request-approval"><ClipboardCheck size={18} /> {selectedRequestApproval ? `مشاهدهٔ تأیید نسخهٔ ${selectedRequest.version.toLocaleString("fa-IR")}` : `ثبت نسخهٔ ${selectedRequest.version.toLocaleString("fa-IR")} برای تأیید`}</button>
              )}
            </div>
          </main>
        </MobileScroll>
        {editorSheet}
      </div>
    );
  }

  return (
    <div className="chida-app project-purchase-requests-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-purchase-requests-view">
      <header className="project-workspace-header">
          <button className="icon-button" type="button" onClick={onBack} aria-label={backLabel} data-testid="purchase-requests-back"><ArrowRight size={21} /></button>
        <span className="project-workspace-title"><small>درخواست‌های پروژه</small><strong>{project.name}</strong></span>
        <span className="project-workspace-header-spacer" aria-hidden="true" />
      </header>

      <MobileScroll className="project-purchase-requests-scroll">
        <main className="project-purchase-requests-content">
          <section className="project-purchase-requests-heading">
            <span className="project-purchase-requests-mark"><ShoppingCart size={24} strokeWidth={1.65} /></span>
            <div><span className="eyebrow">محصول چندقلمی یا خدمت مستقل</span><h1>درخواست‌های خرید {project.name}</h1><p>از نیاز خام تا نسخه و بازبینی داخلی؛ پیش از انتخاب مقصد یا هر ارسال</p></div>
          </section>

          <button ref={addButtonRef} className="primary-button purchase-request-add" type="button" onClick={openCreateEditor} disabled={storageLocked} data-testid="purchase-request-add"><Plus size={18} /> پیش‌نویس جدید</button>

          {storageLocked ? <p className="project-storage-recovery-alert" role="alert" data-testid="purchase-request-read-error"><ShieldCheck size={17} /><span><strong>درخواست‌های محلی کامل خوانده نشد.</strong> برای جلوگیری از بازنویسی داده‌های قبلی، ثبت و تغییر وضعیت تا بارگذاری موفق بعدی غیرفعال است.</span></p> : null}

          <aside className="purchase-request-boundary"><ShieldCheck size={17} /><span><strong>رکورد خصوصی و محلی</strong> تأیید داخلی هر نسخه ممکن است، اما AI، تأمین‌کننده، قیمت، مجوز ارسال و ارسال بیرونی هنوز وصل نیست. شرایط حمل، مالیات و پرداخت نیز تا ثبت واقعی نامشخص می‌مانند.</span></aside>

          {storageLocked ? null : orderedRequests.length === 0 ? (
            <section className="purchase-request-empty" data-testid="purchase-request-empty"><span><ShoppingCart size={25} strokeWidth={1.65} /></span><h2>هنوز درخواست خریدی ثبت نشده</h2><p>یک محصول چندقلمی یا خدمت مستقل را دستی و فقط برای همین پروژه ثبت کن.</p></section>
          ) : (
            <section className="purchase-request-list" aria-label="درخواست‌های ثبت‌شدهٔ پروژه">
              <div className="purchase-request-section-title"><strong>درخواست‌های ثبت‌شده</strong><span>{orderedRequests.length.toLocaleString("fa-IR")}</span></div>
              {orderedRequests.map((request) => <button className="purchase-request-card" type="button" key={request.id} data-request-id={request.id} onClick={() => { setStorageError(""); setDetailMode("simple"); setSelectedId(request.id); }} data-testid="purchase-request-card"><span className="purchase-request-card-icon"><ShoppingCart size={20} strokeWidth={1.65} /></span><span className="purchase-request-card-copy"><span><small>{purchaseRequestStatusLabel(request.status)}</small><small>{formatProjectFileDate(request.updatedAt)}</small></span><strong>{purchaseRequestDisplayTitle(request)}</strong><em>{request.requestKind === "service" ? `خدمت · ${request.service?.completionStatus === "complete" ? "شناسنامه کامل" : "نیازمند تکمیل"}` : `${request.items.length.toLocaleString("fa-IR")} قلم · ${request.items.filter((item) => item.completionStatus === "complete").length.toLocaleString("fa-IR")} کامل`}</em><small>نسخهٔ {request.version.toLocaleString("fa-IR")} · {request.sharingStatus}</small></span><ArrowRight size={17} aria-hidden="true" /></button>)}
            </section>
          )}
        </main>
      </MobileScroll>
      {editorSheet}
    </div>
  );
}

function ProjectDispatchPlannerView({ project, request, approval, contacts, dispatchDraft, dispatchPlanApprovals, contactsStorageLocked, dispatchStorageLocked, dispatchPlanApprovalsStorageLocked, onBack, onCreateContact, onContactStatusChange, onUpsertDispatchDraft, onCreateDispatchPlanApproval, onChangeDispatchPlanApproval }: { project: BuilderProject; request: ProjectPurchaseRequestRecord; approval: ProjectApprovalRecord; contacts: SupplierContactRecord[]; dispatchDraft: DispatchDraftRecord | null; dispatchPlanApprovals: DispatchPlanApprovalRecord[]; contactsStorageLocked: boolean; dispatchStorageLocked: boolean; dispatchPlanApprovalsStorageLocked: boolean; onBack: () => void; onCreateContact: (draft: SupplierContactDraft) => string | null; onContactStatusChange: (contactId: string, nextStatus: SupplierContactStatus) => boolean; onUpsertDispatchDraft: (requestId: string, approvalId: string, recipientIds: string[]) => string | null; onCreateDispatchPlanApproval: (dispatchDraftId: string) => string | null; onChangeDispatchPlanApproval: (approvalId: string, action: "approve" | "withdraw" | "reopen") => boolean }) {
  const keyboard = useKeyboard();
  const addContactButtonRef = useRef<HTMLButtonElement>(null);
  const dispatchPlanStatusRef = useRef<HTMLElement>(null);
  const [contactSheetOpen, setContactSheetOpen] = useState(false);
  const [contactDraft, setContactDraft] = useState<SupplierContactDraft>({ ...emptySupplierContactDraft });
  const [contactErrors, setContactErrors] = useState({ displayName: "", category: "", tehranCoverage: "" });
  const [storageError, setStorageError] = useState("");
  const [saveAnnouncement, setSaveAnnouncement] = useState("");
  const [dispatchPlanReviewOpen, setDispatchPlanReviewOpen] = useState(false);
  const [dispatchPlanAcknowledged, setDispatchPlanAcknowledged] = useState(false);
  const [dispatchPlanStorageError, setDispatchPlanStorageError] = useState("");
  const currentRevision = dispatchDraft?.revisions.find((revision) => revision.id === dispatchDraft.currentRevisionId) ?? null;
  const [previewRevisionId, setPreviewRevisionId] = useState<string | null>(currentRevision?.id ?? null);
  const previewRevision = dispatchDraft?.revisions.find((revision) => revision.id === previewRevisionId) ?? currentRevision;
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>(() => currentRevision?.recipientIds.filter((recipientId) => {
    const contact = contacts.find((item) => item.id === recipientId);
    return Boolean(contact && supplierContactCanRespond(contact, request.requestKind));
  }) ?? []);
  const orderedContacts = useMemo(
    () => [...contacts].sort((first, second) => {
      if (first.status !== second.status) return first.status === "active" ? -1 : 1;
      return first.displayName.localeCompare(second.displayName, "fa");
    }),
    [contacts],
  );
  const orderedDispatchPlanApprovals = useMemo(
    () => [...dispatchPlanApprovals].filter((item) => item.target.dispatchDraftId === dispatchDraft?.id).sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()),
    [dispatchDraft?.id, dispatchPlanApprovals],
  );
  const exactDispatchPlanApproval = currentRevision ? orderedDispatchPlanApprovals.find((item) => item.target.dispatchRevisionId === currentRevision.id && item.target.dispatchRevisionFingerprint === currentRevision.fingerprint) ?? null : null;
  const displayedDispatchPlanApproval = exactDispatchPlanApproval ?? orderedDispatchPlanApprovals[0] ?? null;
  const displayedDispatchPlanStatus = displayedDispatchPlanApproval
    ? dispatchPlanApprovalEffectiveStatus(displayedDispatchPlanApproval, dispatchDraft, request, approval, contacts)
    : null;
  const selectionMatchesCurrentRevision = Boolean(currentRevision) && JSON.stringify([...selectedRecipientIds].sort()) === JSON.stringify(currentRevision!.recipientIds);

  useEffect(() => {
    setPreviewRevisionId(currentRevision?.id ?? null);
    setSelectedRecipientIds(currentRevision?.recipientIds.filter((recipientId) => {
      const contact = contacts.find((item) => item.id === recipientId);
      return Boolean(contact && supplierContactCanRespond(contact, request.requestKind));
    }) ?? []);
    setDispatchPlanReviewOpen(false);
    setDispatchPlanAcknowledged(false);
    setDispatchPlanStorageError("");
  }, [currentRevision?.id, request.id]);

  const closeContactSheet = () => {
    keyboard.hide();
    setContactSheetOpen(false);
    setContactDraft({ ...emptySupplierContactDraft });
    setContactErrors({ displayName: "", category: "", tehranCoverage: "" });
    window.requestAnimationFrame(() => addContactButtonRef.current?.focus());
  };

  const changeContactDraft = (field: keyof SupplierContactDraft, value: string) => {
    setContactDraft((current) => ({ ...current, [field]: value }));
    if (field !== "responseCapability") setContactErrors((current) => current[field] ? { ...current, [field]: "" } : current);
    setStorageError("");
  };

  const saveContact = () => {
    const normalizedDraft = {
      ...contactDraft,
      displayName: contactDraft.displayName.trim(),
      category: contactDraft.category.trim(),
      tehranCoverage: contactDraft.tehranCoverage.trim(),
    };
    const nextErrors = {
      displayName: hasVisibleProjectTaskText(normalizedDraft.displayName) ? "" : "نام یا عنوان گیرنده را وارد کن.",
      category: hasVisibleProjectTaskText(normalizedDraft.category) ? "" : "دستهٔ اعلامی را وارد کن.",
      tehranCoverage: hasVisibleProjectTaskText(normalizedDraft.tehranCoverage) ? "" : "محدودهٔ پوشش تهران را وارد کن.",
    };
    setContactErrors(nextErrors);
    const firstInvalidField = (Object.keys(nextErrors) as Array<keyof typeof nextErrors>).find((field) => nextErrors[field]);
    if (firstInvalidField) {
      window.requestAnimationFrame(() => document.getElementById(`supplier-contact-${firstInvalidField}`)?.focus());
      return;
    }
    const contactId = onCreateContact(normalizedDraft);
    if (!contactId) {
      setStorageError("رکورد گیرنده ذخیره نشد. دادهٔ قبلی دست‌نخورده باقی ماند.");
      return;
    }
    if (normalizedDraft.responseCapability === "both" || normalizedDraft.responseCapability === request.requestKind) {
      setSelectedRecipientIds((current) => [...new Set([...current, contactId])].sort());
    }
    setSaveAnnouncement("گیرنده به‌صورت محلی ثبت و برای این پیش‌نویس انتخاب شد.");
    closeContactSheet();
  };

  const toggleRecipient = (contact: SupplierContactRecord) => {
    if (!supplierContactCanRespond(contact, request.requestKind)) return;
    setStorageError("");
    setSaveAnnouncement("");
    setSelectedRecipientIds((current) => current.includes(contact.id) ? current.filter((id) => id !== contact.id) : [...current, contact.id].sort());
  };

  const changeContactStatus = (contact: SupplierContactRecord) => {
    const nextStatus: SupplierContactStatus = contact.status === "active" ? "archived" : "active";
    if (!onContactStatusChange(contact.id, nextStatus)) {
      setStorageError("تغییر وضعیت گیرنده ذخیره نشد. دوباره تلاش کن.");
      return;
    }
    if (nextStatus === "archived") setSelectedRecipientIds((current) => current.filter((id) => id !== contact.id));
    setStorageError("");
    setSaveAnnouncement(nextStatus === "archived" ? "گیرنده آرشیو شد؛ نسخه‌های قبلی Draft برای سابقه باقی ماندند." : "گیرنده به فهرست فعال بازگشت.");
  };

  const saveDispatchDraft = () => {
    if (dispatchStorageLocked || selectedRecipientIds.length === 0) return;
    const selectionMatchesCurrent = Boolean(currentRevision) && JSON.stringify(currentRevision!.recipientIds) === JSON.stringify([...selectedRecipientIds].sort());
    const dispatchId = onUpsertDispatchDraft(request.id, approval.id, selectedRecipientIds);
    if (!dispatchId) {
      setStorageError("Draft اشتراک ذخیره نشد. هیچ مجوز یا اثر بیرونی ایجاد نشد.");
      return;
    }
    setStorageError("");
    setSaveAnnouncement(selectionMatchesCurrent ? "همین انتخاب از قبل در Draft جاری ثبت بود؛ نسخهٔ اضافه‌ای ساخته نشد." : "نسخهٔ جدید Draft محلی ذخیره شد؛ هیچ اثر بیرونی ندارد.");
  };

  const createDispatchPlanApproval = () => {
    if (!dispatchDraft || !currentRevision || !selectionMatchesCurrentRevision || !dispatchPlanAcknowledged || dispatchPlanApprovalsStorageLocked) return;
    const approvalId = onCreateDispatchPlanApproval(dispatchDraft.id);
    if (!approvalId) {
      setDispatchPlanStorageError("درخواست تأیید محلی ذخیره نشد. هیچ وضعیت، مجوز یا اثر بیرونی تغییر نکرد.");
      return;
    }
    setDispatchPlanStorageError("");
    setDispatchPlanAcknowledged(false);
    window.requestAnimationFrame(() => dispatchPlanStatusRef.current?.focus());
  };

  const changeDispatchPlanApproval = (action: "approve" | "withdraw" | "reopen") => {
    if (!displayedDispatchPlanApproval || displayedDispatchPlanStatus === "invalidated") return;
    if (!onChangeDispatchPlanApproval(displayedDispatchPlanApproval.id, action)) {
      setDispatchPlanStorageError("تغییر وضعیت تأیید محلی ذخیره نشد. رکورد قبلی دست‌نخورده باقی ماند.");
      return;
    }
    setDispatchPlanStorageError("");
    window.requestAnimationFrame(() => dispatchPlanStatusRef.current?.focus());
  };

  const contactSheet = (
    <BottomSheet open={contactSheetOpen} onOpenChange={(open) => { if (!open) closeContactSheet(); }} title="ثبت گیرندهٔ محلی" description={`رکورد خصوصی ${project.name}؛ نه حساب شبکه و نه تأمین‌کنندهٔ تأییدشده.`} snap={0.92}>
      <form className="supplier-contact-editor-sheet" dir="rtl" data-testid="supplier-contact-editor-sheet" onSubmit={(event) => { event.preventDefault(); saveContact(); }}>
        <label className="field-control" htmlFor="supplier-contact-displayName"><span>نام یا عنوان گیرنده</span><KeyboardInput id="supplier-contact-displayName" data-testid="supplier-contact-name-input" value={contactDraft.displayName} maxLength={100} placeholder="مثلاً مصالح نمونهٔ تهران" onChange={(event) => changeContactDraft("displayName", event.target.value)} aria-invalid={Boolean(contactErrors.displayName)} aria-describedby={contactErrors.displayName ? "supplier-contact-displayName-error" : undefined} />{contactErrors.displayName ? <small className="field-error" id="supplier-contact-displayName-error">{contactErrors.displayName}</small> : null}</label>
        <label className="field-control" htmlFor="supplier-contact-category"><span>دستهٔ اعلامی</span><KeyboardInput id="supplier-contact-category" data-testid="supplier-contact-category-input" value={contactDraft.category} maxLength={100} placeholder="مثلاً سیمان و مصالح پایه" onChange={(event) => changeContactDraft("category", event.target.value)} aria-invalid={Boolean(contactErrors.category)} aria-describedby={contactErrors.category ? "supplier-contact-category-error" : "supplier-contact-category-note"} />{contactErrors.category ? <small className="field-error" id="supplier-contact-category-error">{contactErrors.category}</small> : <small id="supplier-contact-category-note">این دسته را شما ثبت می‌کنید؛ تطبیق یا رتبه‌بندی هوشمند نیست.</small>}</label>
        <label className="field-control" htmlFor="supplier-contact-tehranCoverage"><span>پوشش تهران</span><KeyboardInput id="supplier-contact-tehranCoverage" data-testid="supplier-contact-coverage-input" value={contactDraft.tehranCoverage} maxLength={120} placeholder="مثلاً مناطق ۱ تا ۵ و شمیرانات" onChange={(event) => changeContactDraft("tehranCoverage", event.target.value)} aria-invalid={Boolean(contactErrors.tehranCoverage)} aria-describedby={contactErrors.tehranCoverage ? "supplier-contact-tehranCoverage-error" : undefined} />{contactErrors.tehranCoverage ? <small className="field-error" id="supplier-contact-tehranCoverage-error">{contactErrors.tehranCoverage}</small> : null}</label>
        <fieldset className="supplier-contact-capability-picker">
          <legend>توان پاسخ اعلامی</legend>
          {supplierContactResponseCapabilities.map((capability) => <button type="button" key={capability.id} aria-pressed={contactDraft.responseCapability === capability.id} onClick={() => changeContactDraft("responseCapability", capability.id)} data-testid={`supplier-contact-capability-${capability.id}`}>{capability.label}</button>)}
        </fieldset>
        <aside className="supplier-contact-boundary"><ShieldCheck size={17} /><span><strong>ثبت مستقیم سازنده</strong><small>این رکورد حساب شبکه، عضویت، احراز هویت، تضمین کیفیت یا پیشنهاد «بهترین» نیست و هیچ پیام یا دعوتی نمی‌فرستد.</small></span></aside>
        {storageError ? <p className="purchase-request-storage-error" role="alert" data-testid="supplier-contact-storage-error">{storageError}</p> : null}
        <button className="primary-button" type="submit" disabled={contactsStorageLocked} data-testid="supplier-contact-save"><UserPlus size={18} /> ثبت رکورد محلی</button>
      </form>
    </BottomSheet>
  );

  return (
    <div className="chida-app project-dispatch-planner-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-dispatch-planner-view">
      <header className="project-workspace-header">
        <button className="icon-button" type="button" onClick={() => { keyboard.hide(); onBack(); }} aria-label="بازگشت به جزئیات درخواست" data-testid="dispatch-planner-back"><ArrowRight size={21} /></button>
        <span className="project-workspace-title"><small>انتخاب گیرنده و پیش‌نمایش</small><strong>{project.name}</strong></span>
        <span className="project-workspace-header-spacer" aria-hidden="true" />
      </header>

      <MobileScroll className="project-dispatch-planner-scroll">
        <main className="project-dispatch-planner-content">
          <aside className="dispatch-preview-banner" data-testid="dispatch-preview-banner"><ShieldCheck size={19} /><span><strong>پیش‌نمایش محلی — هیچ دعوت یا درخواستی ارسال نشده است.</strong><small>نسخهٔ {request.version.toLocaleString("fa-IR")} با تأیید صریح همین revision؛ مجوز ارسال وجود ندارد.</small></span></aside>

          <section className="dispatch-request-summary">
            <span><ClipboardCheck size={22} /></span>
            <div><small>{request.requestKind === "product" ? "درخواست محصول" : "درخواست خدمت"} · تأیید شده</small><h1>{purchaseRequestDisplayTitle(request)}</h1><p>نسخهٔ درخواست {request.version.toLocaleString("fa-IR")} · نسخهٔ تأیید {approval.version.toLocaleString("fa-IR")} · مقصد بیرونی: ندارد</p></div>
          </section>

          {contactsStorageLocked ? <p className="project-storage-recovery-alert" role="alert" data-testid="supplier-contact-read-error"><ShieldCheck size={17} /><span><strong>گیرنده‌های محلی کامل خوانده نشدند.</strong> انتخاب، ثبت و تغییر وضعیت تا بازیابی موفق غیرفعال است.</span></p> : null}
          {dispatchStorageLocked ? <p className="project-storage-recovery-alert" role="alert" data-testid="dispatch-draft-read-error"><ShieldCheck size={17} /><span><strong>وابستگی‌های Draft کامل خوانده نشدند.</strong> برای جلوگیری از بازنویسی ناقص، ذخیرهٔ Draft قفل است.</span></p> : null}

          <section className="supplier-contact-section" aria-labelledby="supplier-contact-title">
            <div className="dispatch-section-heading"><span><strong id="supplier-contact-title">گیرنده‌های ثبت‌شده توسط شما</strong><small>انتخاب دستی؛ بدون شبکه، match یا رتبه‌بندی</small></span><em>{orderedContacts.filter((contact) => contact.status === "active").length.toLocaleString("fa-IR")} فعال</em></div>
            <button ref={addContactButtonRef} className="supplier-contact-add" type="button" onClick={() => { setStorageError(""); setContactSheetOpen(true); }} disabled={contactsStorageLocked} data-testid="supplier-contact-add"><UserPlus size={18} /> ثبت گیرندهٔ محلی</button>
            {!contactsStorageLocked && orderedContacts.length === 0 ? <div className="supplier-contact-empty" data-testid="supplier-contact-empty"><Store size={23} /><strong>هنوز گیرنده‌ای ثبت نشده</strong><p>برای همین پروژه یک رکورد محلی بساز؛ اطلاعات تماس بیرونی در این نسخه نگه‌داری نمی‌شود.</p></div> : null}
            <div className="supplier-contact-list">
              {orderedContacts.map((contact) => {
                const selectable = supplierContactCanRespond(contact, request.requestKind);
                const selected = selectedRecipientIds.includes(contact.id);
                return (
                  <article className={`supplier-contact-card ${contact.status === "archived" ? "is-archived" : ""} ${selected ? "is-selected" : ""}`} key={contact.id} data-testid="supplier-contact-card">
                    <button className="supplier-contact-select" type="button" aria-pressed={selected} aria-label={`${selected ? "حذف" : "انتخاب"} گیرنده ${contact.displayName}`} onClick={() => toggleRecipient(contact)} disabled={!selectable || contactsStorageLocked} data-testid="supplier-contact-select"><span className="supplier-contact-check"><Check size={15} /></span><span><strong>{contact.displayName}</strong><small>{contact.category} · {contact.tehranCoverage}</small></span></button>
                    <dl><div><dt>توان پاسخ</dt><dd>{supplierContactResponseCapabilityLabel(contact.responseCapability)}</dd></div><div><dt>منشأ و وضعیت</dt><dd>{contact.source} · {contact.localStatus}</dd></div><div><dt>شبکه</dt><dd>{contact.networkStatus}</dd></div><div><dt>نسخه</dt><dd>{contact.version.toLocaleString("fa-IR")} · {formatProjectFileDate(contact.updatedAt)}</dd></div></dl>
                    <p className={selectable ? "is-compatible" : "is-incompatible"}>{contact.status === "archived" ? "این رکورد آرشیو است و برای انتخاب جدید فعال نیست؛ سابقهٔ Draftهای قبلی حفظ می‌شود." : supplierContactMatchReason(contact, request.requestKind)}</p>
                    <button className="supplier-contact-status" type="button" onClick={() => changeContactStatus(contact)} disabled={contactsStorageLocked} aria-label={`${contact.status === "active" ? "آرشیو رکورد" : "بازگرداندن به فعال"} ${contact.displayName}`} data-testid="supplier-contact-status">{contact.status === "active" ? <Archive size={16} /> : <RotateCcw size={16} />}{contact.status === "active" ? "آرشیو رکورد" : "بازگرداندن به فعال"}</button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="dispatch-selection-summary" aria-live="polite" data-testid="dispatch-selected-count"><span><Users size={18} /><strong>{selectedRecipientIds.length.toLocaleString("fa-IR")} گیرنده انتخاب شده</strong></span><small>فقط شناسه و snapshot رکوردهای محلیِ انتخاب‌شده وارد Draft می‌شود.</small></section>

          <section className="dispatch-exact-preview" aria-labelledby="dispatch-exact-preview-title">
            <div className="dispatch-section-heading"><span><strong id="dispatch-exact-preview-title">دادهٔ دقیق قابل‌اشتراک</strong><small>مستقل از متن خام و فقط از revision تأییدشده</small></span><em>{dispatchPayloadRows(dispatchPayloadFromSnapshot(approval.snapshot)).length.toLocaleString("fa-IR")} فیلد</em></div>
            <dl className="dispatch-payload-rows" data-testid="dispatch-payload-preview">{dispatchPayloadRows(dispatchPayloadFromSnapshot(approval.snapshot)).map(([field, value]) => <div key={field} data-testid="dispatch-payload-row"><dt dir="ltr">{field}</dt><dd>{value ?? "نامشخص"}</dd></div>)}</dl>
            <aside className="dispatch-privacy-preview" data-testid="dispatch-privacy-preview"><ShieldCheck size={18} /><span><strong>خصوصی و حذف‌شده از این payload</strong><small>نام پروژه، بودجه، فایل‌ها، حافظه، متن خام نیاز، روشن‌سازی‌ها و فیلد ساختاریافتهٔ آدرس دقیق</small>{request.requestKind === "service" ? <em>هشدار: مقدار آزادِ service.location را خودت بازبینی کن؛ ساختار فعلی فیلد جداگانهٔ آدرس دقیق ندارد و پاک‌سازی معنایی ادعا نمی‌شود.</em> : <em>هشدار: مقدار آزادِ delivery.area را خودت بازبینی کن؛ ساختار فعلی فیلد جداگانهٔ آدرس دقیق ندارد و پاک‌سازی معنایی ادعا نمی‌شود.</em>}</span></aside>
          </section>

          {currentRevision && previewRevision ? (
            <section className="dispatch-draft-preview" data-testid="dispatch-draft-preview" aria-labelledby="dispatch-draft-preview-title">
              <div className="dispatch-section-heading"><span><strong id="dispatch-draft-preview-title">Draft اشتراک ثبت‌شده</strong><small>نسخهٔ {previewRevision.version.toLocaleString("fa-IR")} از {dispatchDraft!.version.toLocaleString("fa-IR")} · {formatProjectFileDate(previewRevision.createdAt)}</small></span><em>{previewRevision.id === currentRevision.id ? "نسخهٔ جاری" : "تاریخی · فقط‌خواندنی"}</em></div>
              {dispatchDraft!.revisions.length > 1 ? <nav className="dispatch-revision-picker" aria-label="نسخه‌های Draft اشتراک" data-testid="dispatch-revision-picker">{[...dispatchDraft!.revisions].reverse().map((revision) => <button type="button" key={revision.id} aria-pressed={previewRevision.id === revision.id} onClick={() => setPreviewRevisionId(revision.id)} data-testid="dispatch-revision-option">نسخهٔ {revision.version.toLocaleString("fa-IR")}<small>{revision.recipientIds.length.toLocaleString("fa-IR")} گیرنده</small></button>)}</nav> : null}
              <dl className="dispatch-draft-contract"><div><dt>وضعیت</dt><dd>پیش‌نویس</dd></div><div><dt>اثر بیرونی</dt><dd><code>none</code></dd></div><div><dt>مجوز ارسال</dt><dd><code>false</code></dd></div><div><dt>تعداد مقصد</dt><dd>{previewRevision.inviteDrafts.length.toLocaleString("fa-IR")}</dd></div></dl>
              <div className="invite-draft-list">{previewRevision.inviteDrafts.map((invite) => {
                const currentContact = contacts.find((contact) => contact.id === invite.supplierContactId);
                return <article className="invite-draft-card" key={invite.id} data-testid="invite-draft-card"><div><Store size={17} /><span><strong>{invite.destination.displayName}</strong><small>{invite.destination.category} · {invite.destination.tehranCoverage}</small></span>{currentContact?.status === "archived" ? <em>اکنون آرشیو</em> : null}</div><dl><div><dt>توان پاسخ</dt><dd>{supplierContactResponseCapabilityLabel(invite.destination.responseCapability)}</dd></div><div><dt>مقصد</dt><dd>{invite.destination.networkStatus}</dd></div><div><dt>ادامه</dt><dd>{invite.continuation}</dd></div><div><dt>اثر / مجوز</dt><dd><code>{invite.externalEffect}</code> / <code>{String(invite.sendAuthorized)}</code></dd></div></dl></article>;
              })}</div>
            </section>
          ) : <p className="dispatch-draft-empty" data-testid="dispatch-draft-empty"><FileText size={17} /><span><strong>هنوز Draft اشتراکی ثبت نشده.</strong> انتخاب‌ها را بازبینی و فقط پیش‌نویس محلی را ذخیره کن.</span></p>}

          {storageError ? <p className="purchase-request-storage-error" role="alert" data-testid="dispatch-storage-error">{storageError}</p> : null}
          {saveAnnouncement ? <p className="dispatch-save-announcement" role="status" data-testid="dispatch-save-announcement"><CheckCircle2 size={17} />{saveAnnouncement}</p> : null}
          <button className="primary-button dispatch-draft-save" type="button" onClick={saveDispatchDraft} disabled={dispatchStorageLocked || selectedRecipientIds.length === 0} data-testid="dispatch-draft-save"><FileText size={18} /> ذخیرهٔ Draft اشتراک محلی</button>

          {dispatchPlanApprovalsStorageLocked ? <p className="project-storage-recovery-alert" role="alert" data-testid="dispatch-plan-approval-read-error"><ShieldCheck size={17} /><span><strong>تأییدهای برنامهٔ ارسال کامل خوانده نشدند.</strong> فقط mutation همین تأیید قفل است؛ Draft و پیش‌نمایش سالم همچنان قابل مشاهده‌اند.</span></p> : null}
          {currentRevision ? (
            <section className="dispatch-plan-approval-entry" aria-labelledby="dispatch-plan-approval-entry-title">
              <div className="dispatch-section-heading"><span><strong id="dispatch-plan-approval-entry-title">تأیید مستقل برنامهٔ ارسال</strong><small>جدا از تأیید محتوای درخواست؛ فقط برای revision جاری Draft</small></span><em>{exactDispatchPlanApproval ? "رکورد دارد" : "ثبت نشده"}</em></div>
              {!selectionMatchesCurrentRevision ? <p className="dispatch-plan-save-first"><CircleHelp size={16} /><span>انتخاب‌های روی صفحه با Draft ذخیره‌شده یکی نیست؛ اول نسخهٔ تازهٔ Draft را ذخیره کن.</span></p> : null}
              <button className="dispatch-plan-review-button" type="button" onClick={() => { setDispatchPlanReviewOpen(true); setDispatchPlanStorageError(""); }} disabled={!selectionMatchesCurrentRevision} data-testid="dispatch-plan-review"><ClipboardCheck size={18} /> بررسی نهایی برنامهٔ ارسال</button>
              {displayedDispatchPlanApproval && displayedDispatchPlanStatus === "invalidated" && !dispatchPlanReviewOpen ? <p className="dispatch-plan-invalidated" role="status" data-testid="dispatch-plan-approval-invalidated"><CircleHelp size={17} /><span><strong>تأیید نسخهٔ قبلی دیگر معتبر نیست.</strong><small>رکورد قبلی بدون تغییر و فقط برای تاریخچه باقی مانده است.</small></span></p> : null}

              {dispatchPlanReviewOpen ? (
                <div className="dispatch-plan-approval-detail" data-testid="dispatch-plan-approval-detail">
                  <div className="dispatch-plan-review-heading"><span><small>شبیه‌سازی محلی</small><strong>تأیید محلی برنامهٔ ارسال</strong></span><button type="button" onClick={() => setDispatchPlanReviewOpen(false)} data-testid="dispatch-plan-approval-back">بستن</button></div>
                  <aside className="dispatch-plan-simulation-banner"><ShieldCheck size={18} /><span><strong>هیچ استعلامی ارسال نمی‌شود.</strong><small><code>simulationOnly=true</code> · <code>externalEffect=none</code> · <code>sendAuthorized=false</code></small></span></aside>
                  <dl className="dispatch-plan-summary"><div><dt>نسخهٔ درخواست</dt><dd>{request.version.toLocaleString("fa-IR")}</dd></div><div><dt>نسخهٔ Draft</dt><dd>{currentRevision.version.toLocaleString("fa-IR")}</dd></div><div><dt>گیرندگان</dt><dd>{currentRevision.recipientIds.length.toLocaleString("fa-IR")}</dd></div><div><dt>فیلدهای payload</dt><dd>{dispatchPayloadRows(currentRevision.payload).length.toLocaleString("fa-IR")}</dd></div></dl>
                  <section className="dispatch-plan-target" data-testid="dispatch-plan-approval-target"><strong>هدف دقیق و نسخه‌دار · نسخهٔ {currentRevision.version.toLocaleString("fa-IR")}</strong><p>{currentRevision.inviteDrafts.map((invite) => invite.destination.displayName).join("، ")}</p><dl><div><dt>Dispatch revision</dt><dd dir="ltr">{currentRevision.id}</dd></div><div><dt>Request revision</dt><dd dir="ltr">{dispatchDraft!.target.revisionId}</dd></div><div><dt>Content approval</dt><dd dir="ltr">{dispatchDraft!.target.approvalId}</dd></div></dl></section>
                  <details className="dispatch-plan-exact-details"><summary>نمایش مقصد، payload و حریم دقیق</summary><div className="dispatch-plan-recipient-list">{currentRevision.inviteDrafts.map((invite) => <article key={invite.id}><Store size={16} /><span><strong>{invite.destination.displayName}</strong><small>{invite.destination.category} · {invite.destination.tehranCoverage}</small></span></article>)}</div><dl className="dispatch-payload-rows">{dispatchPayloadRows(currentRevision.payload).map(([field, value]) => <div key={field}><dt dir="ltr">{field}</dt><dd>{value ?? "نامشخص"}</dd></div>)}</dl><p className="dispatch-plan-privacy-note"><ShieldCheck size={16} /> مقدار آزاد مکان بازبینی انسانی می‌خواهد؛ نام پروژه، بودجه، فایل، حافظه، متن خام و روشن‌سازی‌ها در payload نیستند.</p></details>

                  {displayedDispatchPlanApproval && displayedDispatchPlanStatus === "invalidated" ? <p className="dispatch-plan-invalidated" role="status" data-testid="dispatch-plan-approval-invalidated"><CircleHelp size={17} /><span><strong>این تأیید متعلق به نسخهٔ قدیمی است.</strong><small>رکورد تاریخی فقط‌خواندنی می‌ماند؛ برای Draft جاری یک تأیید تازه بساز.</small></span></p> : null}
                  {displayedDispatchPlanApproval ? (
                    <section ref={dispatchPlanStatusRef} className={`dispatch-plan-lifecycle is-${displayedDispatchPlanStatus}`} tabIndex={-1} aria-live="polite" data-testid="dispatch-plan-approval-status">
                      <div><span><small>وضعیت رکورد</small><strong>{displayedDispatchPlanStatus === "pending" ? "در انتظار تأیید" : displayedDispatchPlanStatus === "withdrawn" ? "پس‌گرفته‌شده" : displayedDispatchPlanStatus === "approved" ? "تأییدشدهٔ محلی" : "نسخهٔ قدیمی"}</strong></span><em>نسخهٔ {displayedDispatchPlanApproval.version.toLocaleString("fa-IR")}</em></div>
                      <dl className="dispatch-plan-contract"><div><dt>اثر بیرونی</dt><dd><code>{displayedDispatchPlanApproval.externalEffect}</code></dd></div><div><dt>مجوز ارسال</dt><dd><code>{String(displayedDispatchPlanApproval.sendAuthorized)}</code></dd></div><div><dt>تلاش بیرونی</dt><dd><code>{String(displayedDispatchPlanApproval.externalActionAttempted)}</code></dd></div><div><dt>idempotency</dt><dd dir="ltr">{displayedDispatchPlanApproval.idempotencyKey}</dd></div></dl>
                      {displayedDispatchPlanApproval.actionRecord ? <p className="dispatch-plan-action-record" data-testid="dispatch-plan-approval-action-record"><CheckCircle2 size={18} /><span><strong>{displayedDispatchPlanApproval.actionRecord.label}</strong><small>فقط نتیجهٔ ثبت محلی · بدون ارسال، رسید یا تحویل</small></span></p> : null}
                      <ol className="dispatch-plan-history" data-testid="dispatch-plan-approval-events">{displayedDispatchPlanApproval.history.map((event) => <li key={event.id}><span><Check size={13} /></span><div><strong>{event.type === "created" ? "درخواست تأیید ساخته شد" : event.type === "withdrawn" ? "درخواست پس گرفته شد" : event.type === "reopened" ? "درخواست دوباره باز شد" : "برنامه محلی تأیید شد"}</strong><small>نسخهٔ {event.version.toLocaleString("fa-IR")} · {formatProjectFileDate(event.at)}</small></div></li>)}</ol>
                      {displayedDispatchPlanStatus === "pending" ? <div className="dispatch-plan-actions"><button type="button" onClick={() => changeDispatchPlanApproval("withdraw")} disabled={dispatchPlanApprovalsStorageLocked} data-testid="dispatch-plan-approval-withdraw">پس‌گرفتن درخواست تأیید</button><button className="primary-button" type="button" onClick={() => changeDispatchPlanApproval("approve")} disabled={dispatchPlanApprovalsStorageLocked} data-testid="dispatch-plan-approval-approve">تأیید محلی برنامهٔ ارسال</button></div> : null}
                      {displayedDispatchPlanStatus === "withdrawn" ? <button className="primary-button" type="button" onClick={() => changeDispatchPlanApproval("reopen")} disabled={dispatchPlanApprovalsStorageLocked} data-testid="dispatch-plan-approval-reopen">درخواست دوبارهٔ تأیید</button> : null}
                      {displayedDispatchPlanStatus === "approved" ? <p className="dispatch-plan-read-only" data-testid="dispatch-plan-approval-readonly"><ShieldCheck size={16} /> تصمیم نهایی و فقط‌خواندنی است؛ دکمهٔ ارسال وجود ندارد.</p> : null}
                    </section>
                  ) : null}

                  {orderedDispatchPlanApprovals.length > 0 ? <section className="dispatch-plan-record-history" data-testid="dispatch-plan-approval-history"><strong>سابقهٔ تأییدهای این Draft</strong>{orderedDispatchPlanApprovals.map((record) => {
                    const recordStatus = dispatchPlanApprovalEffectiveStatus(record, dispatchDraft, request, approval, contacts);
                    return <article key={record.id}><div><span><strong>نسخهٔ {record.target.dispatchDraftVersion.toLocaleString("fa-IR")}</strong><small>{recordStatus === "invalidated" ? "نامعتبر · نسخهٔ قدیمی" : recordStatus === "approved" ? "تأییدشده" : recordStatus === "withdrawn" ? "پس‌گرفته‌شده" : "در انتظار تأیید"}</small></span><em>{record.snapshot.recipientCount.toLocaleString("fa-IR")} گیرنده</em></div>{recordStatus === "invalidated" ? <p data-testid="dispatch-plan-approval-readonly"><ShieldCheck size={15} /> فقط‌خواندنی؛ مقصد یا نسخهٔ وابسته تغییر کرده است.</p> : null}</article>;
                  })}</section> : null}

                  {!exactDispatchPlanApproval || displayedDispatchPlanStatus === "invalidated" ? (
                    <div className="dispatch-plan-create-block">
                      <label><input type="checkbox" checked={dispatchPlanAcknowledged} onChange={(event) => setDispatchPlanAcknowledged(event.target.checked)} data-testid="dispatch-plan-acknowledgement" /><span>گیرنده‌ها، محتوای دقیق و مقدار آزاد مکان را بازبینی کردم.</span></label>
                      <button className="primary-button" type="button" onClick={createDispatchPlanApproval} disabled={!dispatchPlanAcknowledged || dispatchPlanApprovalsStorageLocked} data-testid="dispatch-plan-approval-create">ساخت درخواست تأیید محلی</button>
                    </div>
                  ) : null}
                  {dispatchPlanStorageError ? <p className="purchase-request-storage-error" role="alert" data-testid="dispatch-plan-approval-storage-error">{dispatchPlanStorageError}</p> : null}
                </div>
              ) : null}
            </section>
          ) : null}
          <p className="dispatch-final-boundary"><ShieldCheck size={17} /><span><strong>این دکمه ارسال، درخواست قیمت یا مجوز اقدام نیست.</strong> هیچ حساب تأمین‌کننده، مقصد شبکه، پیام، قیمت یا تعهدی ساخته نمی‌شود.</span></p>
        </main>
      </MobileScroll>
      {contactSheet}
    </div>
  );
}

function projectTaskStatusLabel(status: ProjectTaskStatus) {
  return status === "completed" ? "تمام‌شده" : "در حال انجام";
}

function projectTaskEventLabel(type: ProjectTaskEventType) {
  if (type === "updated") return "کار ویرایش شد";
  if (type === "completed") return "کار تمام شد";
  if (type === "reopened") return "کار بازگشایی شد";
  return "کار ثبت شد";
}

function ProjectTasksView({ project, tasks, approvals, initialFilter, initialApprovalId, returnToPurchaseRequestId, tasksStorageLocked, approvalsStorageLocked, onBack, onReturnToPurchaseRequest, onCreate, onUpdate, onStatusChange, onApprovalDecision }: { project: BuilderProject; tasks: ProjectTaskRecord[]; approvals: ProjectApprovalRecord[]; initialFilter: ProjectTaskFilter; initialApprovalId: string | null; returnToPurchaseRequestId: string | null; tasksStorageLocked: boolean; approvalsStorageLocked: boolean; onBack: () => void; onReturnToPurchaseRequest: (requestId: string) => void; onCreate: (draft: ProjectTaskDraft) => boolean; onUpdate: (taskId: string, draft: ProjectTaskDraft) => boolean; onStatusChange: (taskId: string, status: ProjectTaskStatus) => boolean; onApprovalDecision: (approvalId: string, decision: Exclude<ProjectApprovalStatus, "pending">) => boolean }) {
  const keyboard = useKeyboard();
  const taskAddButtonRef = useRef<HTMLButtonElement>(null);
  const taskEditButtonRef = useRef<HTMLButtonElement>(null);
  const approvalHeadingRef = useRef<HTMLElement>(null);
  const pendingApprovalCardFocus = useRef<string | null>(null);
  const [filter, setFilter] = useState<ProjectTaskFilter>(initialFilter);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(initialApprovalId);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskDraft, setTaskDraft] = useState<ProjectTaskDraft>({ title: "", currentStep: "", dueDate: "" });
  const [fieldErrors, setFieldErrors] = useState({ title: "", currentStep: "" });
  const [storageError, setStorageError] = useState("");
  const selectedTask = selectedId ? tasks.find((task) => task.id === selectedId) ?? null : null;
  const selectedApproval = selectedApprovalId ? approvals.find((approval) => approval.id === selectedApprovalId) ?? null : null;
  const orderedTasks = useMemo(
    () => [...tasks].sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()),
    [tasks],
  );
  const orderedApprovals = useMemo(
    () => [...approvals].sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()),
    [approvals],
  );
  const activeCount = tasks.filter((task) => task.status === "in-progress").length;
  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const pendingApprovalCount = approvals.filter((approval) => approval.status === "pending").length;
  const decidedApprovalCount = approvals.filter((approval) => approval.status !== "pending").length;
  const filterCounts: Record<ProjectTaskFilter, number> = { active: activeCount, approval: pendingApprovalCount, completed: completedCount + decidedApprovalCount, failed: 0, monitor: 0 };
  const filteredTasks = tasksStorageLocked
    ? []
    : filter === "active"
      ? orderedTasks.filter((task) => task.status === "in-progress")
      : filter === "completed"
        ? orderedTasks.filter((task) => task.status === "completed")
        : [];
  const filteredApprovals = approvalsStorageLocked
    ? []
    : filter === "approval"
      ? orderedApprovals.filter((approval) => approval.status === "pending")
      : filter === "completed"
        ? orderedApprovals.filter((approval) => approval.status !== "pending")
        : [];
  const filterReadError = filter === "approval"
    ? approvalsStorageLocked
    : filter === "completed"
      ? tasksStorageLocked || approvalsStorageLocked
      : filter === "active"
        ? tasksStorageLocked
        : false;
  const resultCount = filteredTasks.length + filteredApprovals.length;

  useEffect(() => {
    if (selectedId && !selectedTask) setSelectedId(null);
  }, [selectedId, selectedTask]);

  useEffect(() => {
    if (selectedApprovalId && !selectedApproval) setSelectedApprovalId(null);
  }, [selectedApproval, selectedApprovalId]);

  useLayoutEffect(() => {
    if (!selectedApprovalId) return;
    approvalHeadingRef.current?.focus();
  }, [selectedApprovalId]);

  useLayoutEffect(() => {
    const approvalId = pendingApprovalCardFocus.current;
    if (!approvalId || selectedApprovalId) return;
    pendingApprovalCardFocus.current = null;
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-approval-id="${approvalId}"]`)?.focus());
  }, [filter, selectedApprovalId]);

  const openEditor = () => {
    setEditingTaskId(null);
    setTaskDraft({ title: "", currentStep: "", dueDate: "" });
    setFieldErrors({ title: "", currentStep: "" });
    setStorageError("");
    setEditorOpen(true);
  };

  const openTaskEditor = () => {
    if (!selectedTask) return;
    setEditingTaskId(selectedTask.id);
    setTaskDraft({ title: selectedTask.title, currentStep: selectedTask.currentStep, dueDate: selectedTask.dueDate ?? "" });
    setFieldErrors({ title: "", currentStep: "" });
    setStorageError("");
    setEditorOpen(true);
  };

  const closeEditor = () => {
    const shouldReturnToEdit = editingTaskId !== null;
    keyboard.hide();
    setEditorOpen(false);
    setEditingTaskId(null);
    setStorageError("");
    window.requestAnimationFrame(() => (shouldReturnToEdit ? taskEditButtonRef.current : taskAddButtonRef.current)?.focus());
  };

  const changeDraft = (field: keyof ProjectTaskDraft, value: string) => {
    setTaskDraft((current) => ({ ...current, [field]: value }));
    if (field !== "dueDate") setFieldErrors((current) => current[field] ? { ...current, [field]: "" } : current);
    setStorageError("");
  };

  const saveTask = () => {
    const title = taskDraft.title.trim();
    const currentStep = taskDraft.currentStep.trim();
    const nextErrors = {
      title: hasVisibleProjectTaskText(title) ? "" : "عنوان کار را وارد کن.",
      currentStep: hasVisibleProjectTaskText(currentStep) ? "" : "گام بعدی کار را وارد کن.",
    };
    setFieldErrors(nextErrors);
    if (nextErrors.title || nextErrors.currentStep) {
      const invalidId = nextErrors.title ? "project-task-title" : "project-task-step";
      window.requestAnimationFrame(() => document.getElementById(invalidId)?.focus());
      return;
    }
    keyboard.hide();
    const saved = editingTaskId
      ? onUpdate(editingTaskId, { title, currentStep, dueDate: taskDraft.dueDate.trim() })
      : onCreate({ title, currentStep, dueDate: taskDraft.dueDate.trim() });
    if (!saved) {
      setStorageError(editingTaskId ? "ویرایش ذخیره نشد. نسخهٔ قبلی دست‌نخورده ماند؛ دوباره تلاش کن." : "کار ذخیره نشد. فضای مرورگر را بررسی کن و دوباره تلاش کن.");
      return;
    }
    closeEditor();
    if (!editingTaskId) setFilter("active");
  };

  const toggleTaskStatus = () => {
    if (!selectedTask) return;
    const nextStatus = selectedTask.status === "completed" ? "in-progress" : "completed";
    if (!onStatusChange(selectedTask.id, nextStatus)) {
      setStorageError("تغییر وضعیت ذخیره نشد. دوباره تلاش کن.");
      return;
    }
    setStorageError("");
  };

  const decideApproval = (decision: Exclude<ProjectApprovalStatus, "pending">) => {
    if (!selectedApproval) return;
    if (!onApprovalDecision(selectedApproval.id, decision)) {
      setStorageError("تصمیم ذخیره نشد؛ هیچ وضعیتی تغییر نکرد. فضای مرورگر را بررسی کن و دوباره تلاش کن.");
      return;
    }
    setStorageError("");
    window.requestAnimationFrame(() => approvalHeadingRef.current?.focus());
  };

  const returnApprovalToList = () => {
    if (!selectedApproval) return;
    if (returnToPurchaseRequestId) {
      keyboard.hide();
      setStorageError("");
      onReturnToPurchaseRequest(returnToPurchaseRequestId);
      return;
    }
    const nextFilter = selectedApproval.status === "pending" ? "approval" : "completed";
    keyboard.hide();
    setStorageError("");
    pendingApprovalCardFocus.current = selectedApproval.id;
    setFilter(nextFilter);
    setSelectedApprovalId(null);
  };

  const taskEditorSheet = (
    <BottomSheet open={editorOpen} onOpenChange={(open) => { if (!open) closeEditor(); }} title={editingTaskId ? "ویرایش کار" : "کار جدید"} description={editingTaskId ? `عنوان، گام و موعد این کار را برای ${project.name} اصلاح کن.` : `یک وظیفهٔ داخلی برای ${project.name} ثبت کن.`} snap={0.94}>
      <form className="project-task-editor-sheet" dir="rtl" data-testid="project-task-editor-sheet" onSubmit={(event) => { event.preventDefault(); saveTask(); }}>
        <label className="field-control" htmlFor="project-task-title">
          <span>عنوان کار</span>
          <KeyboardInput id="project-task-title" data-testid="project-task-title-input" value={taskDraft.title} maxLength={80} placeholder="مثلاً پیگیری تأیید نقشه سازه" onChange={(event) => changeDraft("title", event.target.value)} aria-invalid={Boolean(fieldErrors.title)} aria-describedby={fieldErrors.title ? "project-task-title-error" : undefined} />
          {fieldErrors.title ? <small className="field-error" id="project-task-title-error" data-testid="project-task-title-error">{fieldErrors.title}</small> : null}
        </label>

        <label className="field-control" htmlFor="project-task-step">
          <span>گام بعدی</span>
          <KeyboardTextarea id="project-task-step" data-testid="project-task-step-input" value={taskDraft.currentStep} maxLength={300} rows={4} placeholder="اقدام مشخص بعدی را بنویس..." onChange={(event) => changeDraft("currentStep", event.target.value)} aria-invalid={Boolean(fieldErrors.currentStep)} aria-describedby={fieldErrors.currentStep ? "project-task-step-error" : undefined} />
          {fieldErrors.currentStep ? <small className="field-error" id="project-task-step-error" data-testid="project-task-step-error">{fieldErrors.currentStep}</small> : null}
        </label>

        <label className="field-control" htmlFor="project-task-due">
          <span>موعد اتمام <small>(اختیاری)</small></span>
          <KeyboardInput id="project-task-due" data-testid="project-task-due-input" value={taskDraft.dueDate} maxLength={40} inputMode="numeric" dir="ltr" placeholder="مثلاً ۱۴۰۵/۰۶/۱۵" onChange={(event) => changeDraft("dueDate", event.target.value)} />
          <small>این موعد فقط ثبت محلی است و هنوز یادآوری یا اعلان ایجاد نمی‌کند.</small>
        </label>

        <dl className="project-task-meta">
          <div><dt>پروژهٔ مالک</dt><dd>{project.name}</dd></div>
          <div><dt>منشأ</dt><dd>ثبت مستقیم شما</dd></div>
          <div><dt>{editingTaskId ? "اثر ویرایش" : "وضعیت نخست"}</dt><dd>{editingTaskId ? `نسخهٔ تازه · وضعیت ${selectedTask ? projectTaskStatusLabel(selectedTask.status) : "فعلی"}` : "در حال انجام · نسخهٔ ۱"}</dd></div>
          <div><dt>دسترسی</dt><dd>خصوصی پروژه</dd></div>
        </dl>
        <p className="project-task-boundary"><CircleHelp size={16} /><span>{editingTaskId ? "ویرایش موفق در تاریخچهٔ نسخه‌دار ثبت می‌شود و وضعیت کار را تغییر نمی‌دهد." : "ثبت این کار هیچ اجرا، اعلان، تأیید یا ارسال بیرونی ایجاد نمی‌کند."}</span></p>
        {storageError ? <p className="project-task-storage-error" role="alert" data-testid="project-task-storage-error">{storageError}</p> : null}
        <button className="primary-button" type="submit" data-testid="project-task-save">{editingTaskId ? "ذخیرهٔ ویرایش" : "ثبت در مرکز کارها"}</button>
      </form>
    </BottomSheet>
  );

  if (selectedApproval) {
    return (
      <div className="chida-app project-approval-detail-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-approval-detail-view">
        <header className="project-workspace-header">
          <button className="icon-button" type="button" onClick={returnApprovalToList} aria-label={returnToPurchaseRequestId ? "بازگشت به جزئیات درخواست خرید" : "بازگشت به مرکز کارها"} data-testid="project-approval-detail-back"><ArrowRight size={21} /></button>
          <span className="project-workspace-title"><small>بازبینی نسخهٔ درخواست</small><strong>{project.name}</strong></span>
          <span className="project-workspace-header-spacer" aria-hidden="true" />
        </header>

        <MobileScroll className="project-approval-detail-scroll">
          <main className="project-approval-detail-content">
            <section ref={approvalHeadingRef} className="project-approval-detail-heading" tabIndex={-1} aria-live="polite" data-testid="project-approval-detail-heading">
              <span><ClipboardCheck size={24} strokeWidth={1.65} /></span>
              <div><small>{projectApprovalStatusLabel(selectedApproval.status)} · نسخهٔ درخواست {selectedApproval.target.version.toLocaleString("fa-IR")}</small><h1>{purchaseRequestSnapshotTitle(selectedApproval.snapshot)}</h1><p>{selectedApproval.snapshot.rawNeed}</p></div>
            </section>

            <aside className="project-approval-boundary" id="project-approval-boundary" data-testid="project-approval-status">
              <ShieldCheck size={18} />
              <span><strong>{selectedApproval.status === "pending" ? "منتظر تصمیم صریح شما" : selectedApproval.status === "approved" ? "نسخهٔ درخواست تأیید شد" : "نیاز به اصلاح ثبت شد"}</strong>{selectedApproval.status === "pending" ? " این تأیید فقط محتوای همین نسخه را برای ادامهٔ مسیر می‌پذیرد؛ هیچ مقصد بیرونی انتخاب نشده و مجوز ارسال نیست." : selectedApproval.status === "approved" ? ` نسخهٔ ${selectedApproval.target.version.toLocaleString("fa-IR")} فقط برای ادامهٔ فرایند پذیرفته شد؛ درخواست هنوز ارسال نشده است.` : ` نسخهٔ ${selectedApproval.target.version.toLocaleString("fa-IR")} برای اصلاح علامت خورد؛ درخواست هنوز ارسال نشده است.`}</span>
            </aside>

            {selectedApproval.snapshot.requestKind === "product" ? (
              <section className="project-approval-records" aria-label="همهٔ اقلام snapshot تأیید" data-testid="project-approval-product-items">
                <div className="project-task-section-title"><strong>اقلام همین revision</strong><span>{selectedApproval.snapshot.items.length.toLocaleString("fa-IR")}</span></div>
                {selectedApproval.snapshot.items.map((item) => <article className="purchase-request-record-card" key={item.id}><div><strong>{item.name}</strong><span>{item.completionStatus === "complete" ? "کامل" : "ناقص"}</span></div><dl><div><dt>مقدار و واحد</dt><dd>{Number(item.quantity).toLocaleString("fa-IR", { maximumFractionDigits: 6 })} {item.unit}</dd></div><div><dt>برند یا گرید</dt><dd>{item.brandOrGrade ?? "نامشخص"}</dd></div><div><dt>مشخصات</dt><dd>{item.specification ?? "نامشخص"}</dd></div><div><dt>جایگزین</dt><dd>{purchaseRequestAlternativesLabel(item.alternatives)}</dd></div><div><dt>نسخهٔ قلم</dt><dd>{item.version.toLocaleString("fa-IR")}</dd></div></dl></article>)}
                <dl className="project-approval-meta"><div><dt>زمان موردنیاز</dt><dd>{selectedApproval.snapshot.delivery.neededBy ?? "نامشخص"}</dd></div><div><dt>تحویل</dt><dd>تهران · {selectedApproval.snapshot.delivery.area}</dd></div><div><dt>نسخهٔ درخواست</dt><dd>{selectedApproval.target.version.toLocaleString("fa-IR")} · {formatProjectFileDate(selectedApproval.target.updatedAt)}</dd></div><div><dt>شناسهٔ revision</dt><dd>{selectedApproval.target.revisionId}</dd></div><div><dt>ثبت و اشتراک</dt><dd>{selectedApproval.localStatus} · {selectedApproval.snapshot.sharingStatus}</dd></div></dl>
              </section>
            ) : selectedApproval.snapshot.service ? (
              <section className="project-approval-records" data-testid="project-approval-service"><div className="project-task-section-title"><strong>خدمت همین revision</strong><span>نسخهٔ {selectedApproval.snapshot.service.version.toLocaleString("fa-IR")}</span></div><dl className="project-approval-meta"><div><dt>دامنه</dt><dd>{selectedApproval.snapshot.service.scope}</dd></div><div><dt>موقعیت مجاز</dt><dd>{selectedApproval.snapshot.service.location}</dd></div><div><dt>سطح مکان</dt><dd>فقط محدوده یا بخش پروژه · بدون آدرس دقیق</dd></div><div><dt>اندازه یا حجم</dt><dd>{selectedApproval.snapshot.service.sizeOrVolume ?? "نامشخص"}</dd></div><div><dt>صلاحیت</dt><dd>{selectedApproval.snapshot.service.qualification ?? "نامشخص"}</dd></div><div><dt>زمان</dt><dd>{selectedApproval.snapshot.service.timing ?? "نامشخص"}</dd></div><div><dt>روش</dt><dd>{selectedApproval.snapshot.service.method ?? "نامشخص"}</dd></div><div><dt>داخل دامنه</dt><dd>{selectedApproval.snapshot.service.inScope ?? "نامشخص"}</dd></div><div><dt>خارج از دامنه</dt><dd>{selectedApproval.snapshot.service.outOfScope ?? "نامشخص"}</dd></div><div><dt>ضمانت اعلامی</dt><dd>{selectedApproval.snapshot.service.warranty ?? "نامشخص"}</dd></div><div><dt>پرداخت</dt><dd>{selectedApproval.snapshot.service.paymentTerms ?? "نامشخص"}</dd></div><div><dt>شناسهٔ revision</dt><dd>{selectedApproval.target.revisionId}</dd></div></dl></section>
            ) : null}

            {selectedApproval.snapshot.requestKind === "product" ? <section className="project-approval-terms" aria-label="شرایط نسخهٔ درخواست"><div className="project-task-section-title"><strong>شرایط تجاری</strong><span>۳</span></div><dl><div><dt>حمل</dt><dd>{selectedApproval.snapshot.unresolvedTerms.transport === "unknown" ? "نامشخص" : selectedApproval.snapshot.unresolvedTerms.transport}</dd></div><div><dt>مالیات</dt><dd>{selectedApproval.snapshot.unresolvedTerms.tax === "unknown" ? "نامشخص" : selectedApproval.snapshot.unresolvedTerms.tax}</dd></div><div><dt>شرایط پرداخت</dt><dd>{selectedApproval.snapshot.unresolvedTerms.paymentTerms === "unknown" ? "نامشخص" : selectedApproval.snapshot.unresolvedTerms.paymentTerms}</dd></div></dl></section> : null}

            <section className="project-approval-clarifications" aria-label="پاسخ‌های روشن‌سازی snapshot"><div className="project-task-section-title"><strong>روشن‌سازی‌های همین revision</strong><span>{selectedApproval.snapshot.clarificationAnswers.length.toLocaleString("fa-IR")}</span></div><ol>{selectedApproval.snapshot.clarificationAnswers.map((answer) => <li key={answer.id}><strong>{answer.question}</strong><span>{answer.answer ?? "نامشخص صریح"}</span><small>{answer.source} · confidence: کاربرد ندارد · نسخهٔ {answer.version.toLocaleString("fa-IR")}</small></li>)}</ol></section>

            <aside className="project-approval-privacy">
              <div><ShieldCheck size={18} /><span><strong>پیش‌نمایش حریم همین نسخه</strong><small>در این مرحله هیچ داده‌ای مشترک یا ارسال نمی‌شود.</small></span></div>
              <dl><div><dt>قابل‌اشتراک در مرحلهٔ آینده</dt><dd>{selectedApproval.privacySnapshot.shareableFields.length.toLocaleString("fa-IR")} فیلد ثبت‌شدهٔ همین snapshot</dd></div><div><dt>خصوصی می‌ماند</dt><dd>نام پروژه، حافظه، فایل‌ها، بودجه و آدرس دقیق</dd></div></dl>
            </aside>

            <section className="project-approval-history" aria-label="تاریخچهٔ تأیید نسخه">
              <div className="project-task-section-title"><strong>تاریخچهٔ تصمیم</strong><span>{selectedApproval.history.length.toLocaleString("fa-IR")}</span></div>
              <ol>{[...selectedApproval.history].reverse().map((event) => <li key={event.id} data-testid="project-approval-history-event"><span><Check size={14} /></span><div><strong>{projectApprovalEventLabel(event.type)}</strong><small>توسط {event.actor} · نسخهٔ رکورد {event.version.toLocaleString("fa-IR")} · {formatProjectFileDate(event.at)}</small></div></li>)}</ol>
            </section>

            {storageError ? <p className="project-task-storage-error" role="alert" tabIndex={-1} data-testid="project-approval-storage-error">{storageError}</p> : null}
            {selectedApproval.status === "pending" ? (
              <div className="project-approval-actions">
                <button type="button" onClick={() => decideApproval("changes-requested")} disabled={approvalsStorageLocked} aria-describedby="project-approval-boundary" data-testid="project-approval-needs-changes"><PencilLine size={17} /> نیاز به اصلاح</button>
                <button className="primary-button" type="button" onClick={() => decideApproval("approved")} disabled={approvalsStorageLocked} aria-describedby="project-approval-boundary" data-testid="project-approval-approve"><ClipboardCheck size={18} /> تأیید نسخهٔ {selectedApproval.target.version.toLocaleString("fa-IR")}</button>
              </div>
            ) : null}
          </main>
        </MobileScroll>
      </div>
    );
  }

  if (selectedTask) {
    return (
      <div className="chida-app project-task-detail-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-task-detail-view">
        <header className="project-workspace-header">
          <button className="icon-button" type="button" onClick={() => { keyboard.hide(); setStorageError(""); setSelectedId(null); }} aria-label="بازگشت به مرکز کارها" data-testid="project-task-detail-back"><ArrowRight size={21} /></button>
          <span className="project-workspace-title"><small>جزئیات کار</small><strong>{project.name}</strong></span>
          <span className="project-workspace-header-spacer" aria-hidden="true" />
        </header>

        <MobileScroll className="project-task-detail-scroll">
          <main className="project-task-detail-content">
            <section className="project-task-detail-heading">
              <span><CheckCircle2 size={24} strokeWidth={1.65} /></span>
              <div><small>{projectTaskStatusLabel(selectedTask.status)}</small><h1>{selectedTask.title}</h1><p>{selectedTask.status === "completed" ? "آخرین گام ثبت‌شده" : "گام جاری"}: {selectedTask.currentStep}</p></div>
            </section>

            <dl className="project-task-meta">
              <div><dt>پروژهٔ مالک</dt><dd>{project.name}</dd></div>
              <div><dt>منشأ</dt><dd>{selectedTask.source}</dd></div>
              <div><dt>دسترسی</dt><dd>{selectedTask.visibility}</dd></div>
              <div><dt>وضعیت محلی</dt><dd>{selectedTask.localStatus}</dd></div>
              <div><dt>وضعیت و نسخه</dt><dd>{projectTaskStatusLabel(selectedTask.status)} · نسخهٔ {selectedTask.version.toLocaleString("fa-IR")}</dd></div>
              <div><dt>موعد اتمام</dt><dd>{selectedTask.dueDate ?? "تعیین نشده"}</dd></div>
              <div><dt>زمان ثبت</dt><dd>{formatProjectFileDate(selectedTask.createdAt)}</dd></div>
              <div><dt>آخرین تغییر</dt><dd>{formatProjectFileDate(selectedTask.updatedAt)}</dd></div>
              {selectedTask.completedAt ? <div><dt>زمان تکمیل</dt><dd>{formatProjectFileDate(selectedTask.completedAt)}</dd></div> : null}
            </dl>

            <section className="project-task-history" aria-label="تاریخچهٔ وضعیت کار">
              <div className="project-task-section-title"><strong>تاریخچه</strong><span>{selectedTask.history.length.toLocaleString("fa-IR")}</span></div>
              <ol>
                {[...selectedTask.history].reverse().map((event) => (
                  <li key={event.id} data-testid="project-task-history-event"><span><Check size={14} /></span><div><strong>{projectTaskEventLabel(event.type)}</strong><small>توسط {event.actor} · نسخهٔ {event.version.toLocaleString("fa-IR")} · {formatProjectFileDate(event.at)}</small></div></li>
                ))}
              </ol>
            </section>

            <aside className="project-task-boundary"><ShieldCheck size={17} /><span>این وظیفه فقط داخل همین مرورگر ثبت شده است؛ چیدا آن را در پس‌زمینه اجرا نمی‌کند و هیچ اعلان یا ارسال بیرونی انجام نشده است.</span></aside>
            {storageError && !editorOpen ? <p className="project-task-storage-error" role="alert" data-testid="project-task-storage-error">{storageError}</p> : null}
            <div className="project-task-actions">
              <button ref={taskEditButtonRef} className="project-task-edit-button" type="button" onClick={openTaskEditor} disabled={tasksStorageLocked} data-testid="project-task-edit"><PencilLine size={17} /> ویرایش کار</button>
              <button className="primary-button project-task-status-button" type="button" onClick={toggleTaskStatus} disabled={tasksStorageLocked} data-testid="project-task-status-toggle">{selectedTask.status === "completed" ? "بازگشایی کار" : "علامت‌گذاری به‌عنوان تمام‌شده"}</button>
            </div>
          </main>
        </MobileScroll>
        {taskEditorSheet}
      </div>
    );
  }

  return (
    <div className="chida-app project-tasks-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-tasks-view">
      <header className="project-workspace-header">
        <button className="icon-button" type="button" onClick={() => { keyboard.hide(); onBack(); }} aria-label="بازگشت به گفت‌وگو" data-testid="project-tasks-back"><ArrowRight size={21} /></button>
        <span className="project-workspace-title"><small>مرکز کارها</small><strong>{project.name}</strong></span>
        <span className="project-workspace-header-spacer" aria-hidden="true" />
      </header>

      <MobileScroll className="project-tasks-scroll">
        <main className="project-tasks-content">
          <section className="project-tasks-heading">
            <span className="project-tasks-mark"><CheckCircle2 size={24} strokeWidth={1.65} /></span>
            <div><span className="eyebrow">بیرون از تاریخچهٔ گفتگو</span><h1>کارهای {project.name}</h1><p>وظیفه‌ها و بازبینی نسخه‌های همین پروژه</p></div>
          </section>

          <button ref={taskAddButtonRef} className="primary-button project-task-add" type="button" onClick={openEditor} disabled={tasksStorageLocked} data-testid="project-task-add"><Plus size={18} /> کار جدید</button>

          {tasksStorageLocked && (filter === "active" || filter === "completed") ? (
            <p className="project-storage-recovery-alert" role="alert" data-testid="project-task-read-error"><ShieldCheck size={17} /><span><strong>کارهای محلی کامل خوانده نشد.</strong> برای جلوگیری از بازنویسی داده‌های قبلی، ثبت و تغییر وضعیت تا بارگذاری موفق بعدی غیرفعال است.</span></p>
          ) : null}
          {approvalsStorageLocked && (filter === "approval" || filter === "completed") ? (
            <p className="project-storage-recovery-alert" role="alert" data-testid="project-approval-read-error"><ShieldCheck size={17} /><span><strong>تأییدهای محلی کامل خوانده نشد.</strong> برای جلوگیری از تصمیم روی نسخهٔ نامطمئن، ایجاد و ثبت تصمیم تا بارگذاری موفق بعدی غیرفعال است.</span></p>
          ) : null}

          <aside className="project-task-boundary"><ShieldCheck size={17} /><span><strong>این مرکز فقط دادهٔ محلی و واقعی همین پروژه را نشان می‌دهد.</strong> تأیید نسخهٔ درخواست، مجوز ارسال بیرونی نیست؛ اجرا، اعلان و انتخاب تأمین‌کننده هنوز وصل نیست.</span></aside>

          <Carousel ariaLabel="فیلتر وضعیت کارها" className="project-task-filters" contentClassName="project-task-filter-track">
            {projectTaskFilters.map((item) => {
              const countUnavailable = item.id === "active"
                ? tasksStorageLocked
                : item.id === "approval"
                  ? approvalsStorageLocked
                  : item.id === "completed"
                    ? tasksStorageLocked || approvalsStorageLocked
                    : false;
              return <button className="project-task-filter" type="button" key={item.id} aria-pressed={filter === item.id} onClick={() => { setStorageError(""); setFilter(item.id); }} data-testid={`project-task-filter-${item.id}`}><span>{item.label}</span><small aria-label={countUnavailable ? `بازیابی ${item.label} کامل نشد` : undefined}>{countUnavailable ? "!" : filterCounts[item.id].toLocaleString("fa-IR")}</small></button>;
            })}
          </Carousel>

          {filterReadError && resultCount === 0 ? null : resultCount === 0 ? (
            <section className="project-task-empty" data-testid="project-task-empty">
              <span><CheckCircle2 size={25} strokeWidth={1.65} /></span>
              <h2>{projectTaskEmptyCopy[filter].title}</h2>
              <p>{projectTaskEmptyCopy[filter].description}</p>
            </section>
          ) : (
            <section className="project-task-list" aria-label={projectTaskFilters.find((item) => item.id === filter)?.label}>
              <div className="project-task-section-title"><strong>{projectTaskFilters.find((item) => item.id === filter)?.label}</strong><span>{resultCount.toLocaleString("fa-IR")}</span></div>
              {filteredApprovals.map((approval) => (
                <button className="project-task-card project-approval-card" type="button" key={approval.id} data-approval-id={approval.id} onClick={() => { setStorageError(""); setSelectedApprovalId(approval.id); }} aria-label={`${purchaseRequestSnapshotTitle(approval.snapshot)}، نسخهٔ درخواست ${approval.target.version.toLocaleString("fa-IR")}، پروژهٔ ${project.name}، ${projectApprovalStatusLabel(approval.status)}، فقط تأیید داخلی و ارسال نشده`} data-testid="project-approval-card">
                  <span className="project-task-card-icon"><ClipboardCheck size={20} strokeWidth={1.65} /></span>
                  <span className="project-task-card-copy"><span><small>{projectApprovalStatusLabel(approval.status)}</small><small>{formatProjectFileDate(approval.updatedAt)}</small></span><strong>{purchaseRequestSnapshotTitle(approval.snapshot)}</strong><em>{approval.status === "pending" ? "منتظر تصمیم شما" : approval.status === "approved" ? "فقط این نسخه پذیرفته شد؛ ارسال نشده" : "برای اصلاح علامت خورد؛ ارسال نشده"}</em><small>نسخهٔ درخواست {approval.target.version.toLocaleString("fa-IR")} · {approval.localStatus}</small></span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              ))}
              {filteredTasks.map((task) => (
                <button className="project-task-card" type="button" key={task.id} onClick={() => { setStorageError(""); setSelectedId(task.id); }} data-testid="project-task-card">
                  <span className="project-task-card-icon"><CheckCircle2 size={20} strokeWidth={1.65} /></span>
                  <span className="project-task-card-copy"><span><small>{projectTaskStatusLabel(task.status)}</small><small>{formatProjectFileDate(task.updatedAt)}</small></span><strong>{task.title}</strong><em>{task.currentStep}</em><small className="project-task-card-date">{task.completedAt ? `تکمیل: ${formatProjectFileDate(task.completedAt)}${task.dueDate ? ` · موعد: ${task.dueDate}` : ""}` : `موعد اتمام: ${task.dueDate ?? "تعیین نشده"}`}</small><small>نسخهٔ {task.version.toLocaleString("fa-IR")} · {task.localStatus}</small></span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              ))}
            </section>
          )}
        </main>
      </MobileScroll>

      {taskEditorSheet}
    </div>
  );
}

function ProjectSourceSearchView({ project, memories, files, query, readError, onQueryChange, onBack, onOpenMemory, onOpenFile }: { project: BuilderProject; memories: ProjectMemoryRecord[]; files: ProjectFileRecord[]; query: string; readError: boolean; onQueryChange: (query: string) => void; onBack: () => void; onOpenMemory: (memoryId: string) => void; onOpenFile: (fileId: string) => void }) {
  const keyboard = useKeyboard();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = normalizeProjectSearchText(query);
  const matchingMemories = useMemo(() => {
    if (!normalizedQuery) return [];
    return memories
      .filter((memory) => memory.projectId === project.id && matchesProjectSearch(query, [memory.title, memory.content, memory.kind, memory.source]))
      .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
  }, [memories, normalizedQuery, project.id, query]);
  const matchingFiles = useMemo(() => {
    if (!normalizedQuery) return [];
    return files
      .filter((file) => file.projectId === project.id && matchesProjectSearch(query, [file.displayName, file.originalName, file.category, file.projectStage, file.source, projectFileFormat(file)]))
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  }, [files, normalizedQuery, project.id, query]);
  const resultCount = matchingMemories.length + matchingFiles.length;
  const corpusCount = memories.filter((memory) => memory.projectId === project.id).length + files.filter((file) => file.projectId === project.id).length;

  return (
    <div className="chida-app project-source-search-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-source-search-view">
      <header className="project-workspace-header">
        <button className="icon-button" type="button" onClick={() => { keyboard.hide(); onBack(); }} aria-label="بازگشت به گفت‌وگو" data-testid="project-source-search-back"><ArrowRight size={21} /></button>
        <span className="project-workspace-title"><small>جست‌وجوی محلی پروژه</small><strong>{project.name}</strong></span>
        <span className="project-workspace-header-spacer" aria-hidden="true" />
      </header>

      <MobileScroll className="project-source-search-scroll">
        <main className="project-source-search-content">
          <section className="project-source-search-heading">
            <span className="project-source-search-mark"><Search size={24} strokeWidth={1.65} /></span>
            <div><span className="eyebrow">فقط داده‌های ثبت‌شده</span><h1>جست‌وجو در پروژه</h1><p>حافظه و شناسنامهٔ فایل‌های {project.name}</p></div>
          </section>

          <div className="project-source-search-field">
            <label htmlFor="project-source-search-input">عبارت جست‌وجو</label>
            <div className="project-source-search-control">
              <Search size={18} aria-hidden="true" />
              <KeyboardInput
                ref={searchInputRef}
                id="project-source-search-input"
                data-testid="project-source-search-input"
                value={query}
                maxLength={120}
                placeholder="عنوان، متن حافظه یا نام فایل..."
                onChange={(event) => onQueryChange(event.target.value)}
                autoComplete="off"
              />
              {query ? <button type="button" onPointerDown={(event) => event.preventDefault()} onClick={() => { onQueryChange(""); searchInputRef.current?.focus(); }} aria-label="پاک‌کردن جست‌وجو" data-testid="project-source-search-clear"><X size={18} /></button> : null}
            </div>
          </div>

          <aside className="project-source-search-scope" aria-label="محدودهٔ جست‌وجوی فعلی">
            <ShieldCheck size={17} />
            <span><strong>فقط حافظه و شناسنامهٔ فایل‌های همین پروژه جست‌وجو می‌شوند.</strong> وب و محتوای فایل‌ها جست‌وجو نمی‌شوند؛ OCR، تحلیل یا پاسخ هوش مصنوعی هم انجام نمی‌شود.</span>
          </aside>

          {readError ? (
            <p className="project-source-search-read-error" role="alert" data-testid="project-source-search-read-error">بازیابی محلی کامل نشد. نتیجه‌ها را کامل فرض نکن؛ دسترسی ذخیره‌سازی مرورگر را بررسی و صفحه را دوباره بارگذاری کن.</p>
          ) : null}

          {!normalizedQuery ? (
            <section className="project-source-search-empty" data-testid="project-source-search-empty">
              <span><Search size={25} strokeWidth={1.65} /></span>
              <h2>{readError && corpusCount === 0 ? "بازیابی محلی کامل نشد" : corpusCount === 0 ? "هنوز منبع محلی ثبت نشده" : "عبارتی برای جست‌وجو بنویس"}</h2>
              <p>{readError && corpusCount === 0 ? "تا بازیابی دوباره، نبودن حافظه یا فایل را قطعی فرض نکن." : corpusCount === 0 ? "ابتدا یک حافظه یا شناسنامهٔ فایل در این پروژه ثبت کن." : "جست‌وجو تطبیق مستقیم و محلی است؛ رتبه‌بندی هوشمند یا جست‌وجوی معنایی انجام نمی‌شود."}</p>
            </section>
          ) : resultCount === 0 ? (
            <section className="project-source-search-empty" data-testid="project-source-search-no-results" role="status" aria-live="polite">
              <span><Search size={25} strokeWidth={1.65} /></span>
              <h2>{readError ? "نتیجهٔ کامل در دسترس نیست" : "نتیجه‌ای پیدا نشد"}</h2>
              <p>{readError ? "بازیابی محلی کامل نشد؛ نبودن این عبارت را قطعی فرض نکن. محتوای فایل‌ها، وب و پروژه‌های دیگر نیز جست‌وجو نشدند." : "در حافظه و شناسنامهٔ فایل‌های همین پروژه نتیجه‌ای پیدا نشد. محتوای فایل‌ها، وب و پروژه‌های دیگر جست‌وجو نشدند."}</p>
            </section>
          ) : (
            <section className="project-source-search-results" aria-label="نتایج جست‌وجوی محلی">
              <div className="project-source-search-summary" role="status" aria-live="polite"><strong>نتایج تطبیق مستقیم</strong><span>{resultCount.toLocaleString("fa-IR")}</span></div>

              {matchingMemories.length > 0 ? (
                <div className="project-source-result-group">
                  <div className="project-source-result-group-title"><BrainCircuit size={17} /><strong>حافظهٔ پروژه</strong><span>{matchingMemories.length.toLocaleString("fa-IR")}</span></div>
                  <ul>
                    {matchingMemories.map((memory) => (
                      <li key={memory.id} data-testid="project-source-result">
                        <button className="project-source-result-card" type="button" onClick={() => onOpenMemory(memory.id)} data-testid="project-source-result-memory">
                          <span className="project-source-result-icon"><BrainCircuit size={20} strokeWidth={1.65} /></span>
                          <span className="project-source-result-copy">
                            <span className="project-source-result-topline"><small>حافظه · {memory.kind}</small><small>{formatProjectFileDate(memory.updatedAt)}</small></span>
                            <strong dir="auto">{memory.title}</strong>
                            <span className="project-source-result-excerpt">{memory.content}</span>
                            <span className="project-source-result-meta">{memory.source} · خصوصی در {project.name}</span>
                            <span className="project-source-result-meta">نسخهٔ {memory.version.toLocaleString("fa-IR")} · {memory.status}</span>
                            <small className={memory.useInContext ? "memory-context-on" : "memory-context-off"}>{memory.useInContext ? "برای زمینه فعال" : "برای زمینه غیرفعال"}</small>
                          </span>
                          <ArrowRight size={17} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {matchingFiles.length > 0 ? (
                <div className="project-source-result-group">
                  <div className="project-source-result-group-title"><FileText size={17} /><strong>شناسنامهٔ فایل‌ها</strong><span>{matchingFiles.length.toLocaleString("fa-IR")}</span></div>
                  <ul>
                    {matchingFiles.map((file) => (
                      <li key={file.id} data-testid="project-source-result">
                        <button className="project-source-result-card" type="button" onClick={() => onOpenFile(file.id)} data-testid="project-source-result-file">
                          <span className="project-source-result-icon">{isProjectImage(file) ? <ImageIcon size={20} /> : <FileText size={20} />}</span>
                          <span className="project-source-result-copy">
                            <span className="project-source-result-topline"><small>شناسنامهٔ فایل · {file.category}</small><small>{formatProjectFileDate(file.createdAt)}</small></span>
                            <strong dir="auto">{file.displayName}</strong>
                            <span className="project-source-result-excerpt" dir="auto">{file.originalName} · {projectFileFormat(file)} · {formatProjectFileSize(file.size)}</span>
                            <span className="project-source-result-meta">{file.source} · خصوصی در {project.name}</span>
                            <span className="project-source-result-meta">نسخهٔ {file.version.toLocaleString("fa-IR")} · {file.status}</span>
                            <small className="project-source-file-boundary">محتوای فایل جست‌وجو نشده</small>
                          </span>
                          <ArrowRight size={17} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          )}
        </main>
      </MobileScroll>
    </div>
  );
}

function ProjectSourceAnswerDemoView({ project, onBack }: { project: BuilderProject; onBack: () => void }) {
  const keyboard = useKeyboard();
  const sourceTriggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const demoIsValid = isValidMockSourceAnswerDemo(mockSourceAnswerDemo);
  const selectedSource = selectedSourceId ? mockSourceAnswerDemo.sources.find((source) => source.id === selectedSourceId) ?? null : null;
  const sourceIndexById = new Map(mockSourceAnswerDemo.sources.map((source) => [source.id, source.index]));

  const closeSourceDetail = () => {
    const closingSourceId = selectedSourceId;
    setSelectedSourceId(null);
    if (closingSourceId) window.requestAnimationFrame(() => sourceTriggerRefs.current.get(closingSourceId)?.focus());
  };

  return (
    <div className="chida-app project-source-answer-demo-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-source-answer-demo-view">
      <header className="project-workspace-header">
        <button className="icon-button" type="button" onClick={() => { keyboard.hide(); onBack(); }} aria-label="بازگشت به گفت‌وگو" data-testid="source-answer-demo-back"><ArrowRight size={21} /></button>
        <span className="project-workspace-title"><small>پاسخ منبع‌دار · نمونه</small><strong>{project.name}</strong></span>
        <span className="project-workspace-header-spacer" aria-hidden="true" />
      </header>

      <MobileScroll className="project-source-answer-demo-scroll">
        <main className="project-source-answer-demo-content">
          <section className="project-source-answer-demo-heading">
            <span className="project-source-answer-demo-mark"><Sparkles size={24} strokeWidth={1.65} /></span>
            <div><span className="eyebrow">Mock Data · فقط نمایش رابط</span><h1>نمونهٔ پاسخ منبع‌دار</h1><p>نمایش فقط‌خواندنی در زمینهٔ {project.name}</p></div>
          </section>

          <aside className="source-answer-demo-banner" role="note" data-testid="source-answer-demo-banner">
            <ShieldCheck size={18} />
            <span><strong>نسخهٔ نمایشی</strong> تمام پاسخ و منابع این صفحه ساختگی‌اند؛ هیچ فایل، وب یا مدل هوش مصنوعی اجرا نشده است.</span>
          </aside>

          {!demoIsValid ? (
            <section className="source-answer-demo-invalid" role="alert">
              <strong>نمونهٔ نمایشی قابل‌نمایش نیست.</strong>
              <p>ارجاع‌ها یا برچسب دادهٔ ساختگی معتبر نیستند؛ برای جلوگیری از نمایش گمراه‌کننده، پاسخ بسته شد.</p>
            </section>
          ) : (
            <>
              <section className="source-answer-demo-question" data-testid="source-answer-demo-question">
                <span>پرسش نمونه</span>
                <h2>{mockSourceAnswerDemo.question}</h2>
                <small>این پرسش ارسال نشده و متعلق به پروژه نیست.</small>
              </section>

              <section className="source-answer-demo-section" aria-labelledby="mock-source-findings-title">
                <div className="source-answer-demo-section-title"><span><FileText size={18} /></span><div><small>تمام موارد زیر ساختگی‌اند</small><h2 id="mock-source-findings-title">آنچه منابع نمونه می‌گویند</h2></div></div>
                <ol className="source-answer-demo-claims">
                  {mockSourceAnswerDemo.claims.map((claim) => (
                    <li key={claim.id}><p>{claim.text}</p><small aria-label={`ارجاع به منابع ساختگی ${claim.sourceIds.map((sourceId) => sourceIndexById.get(sourceId)).join(" و ")}`}>{claim.sourceIds.map((sourceId) => `[${sourceIndexById.get(sourceId)}]`).join(" ")}</small></li>
                  ))}
                </ol>
              </section>

              <section className="source-answer-demo-section source-answer-demo-summary" data-testid="source-answer-demo-answer" aria-labelledby="mock-source-summary-title">
                <div className="source-answer-demo-section-title"><span><Bot size={18} /></span><div><small>پاسخ تولیدشده نیست</small><h2 id="mock-source-summary-title">جمع‌بندی نمایشی چیدا</h2></div></div>
                <p>در این نمونه، دو منبع ساختگی محدودیت دما را نشان می‌دهند [۱] [۲]. عددهای نمایش‌داده‌شده ساختگی و برای اجرا نامعتبر هستند؛ بنابراین از این صفحه نباید تصمیم فنی یا اجرایی گرفت.</p>
              </section>

              <section className="source-answer-demo-section" aria-labelledby="mock-source-needed-title">
                <div className="source-answer-demo-section-title"><span><CircleHelp size={18} /></span><div><small>برای خروج از حالت نمونه</small><h2 id="mock-source-needed-title">اطلاعات لازم برای پاسخ واقعی</h2></div></div>
                <ul className="source-answer-demo-needed"><li>فایل معتبر و قابل‌خواندن دستورالعمل محصول</li><li>منبع وب واقعی، تاریخ‌دار و قابل‌بازکردن</li><li>دمای سطح، رطوبت و شرایط روز اجرای کارگاه</li></ul>
              </section>

              <section className="source-answer-demo-sources" aria-labelledby="mock-sources-title">
                <div className="source-answer-demo-section-title"><span><FileText size={18} /></span><div><small>بدون لینک یا بازیابی واقعی</small><h2 id="mock-sources-title">منابع ساختگی</h2></div></div>
                <div className="source-answer-demo-source-list">
                  {mockSourceAnswerDemo.sources.map((source) => (
                    <button
                      className="source-answer-demo-source"
                      type="button"
                      key={source.id}
                      ref={(element) => { if (element) sourceTriggerRefs.current.set(source.id, element); else sourceTriggerRefs.current.delete(source.id); }}
                      onClick={() => setSelectedSourceId(source.id)}
                      aria-label={`منبع ساختگی [${source.index}]، ${source.title}، ${source.documentVersion}، ${source.sourceDate}، نمایش جزئیات`}
                      data-testid="source-answer-demo-source"
                    >
                      <span className="source-answer-demo-source-index">[{source.index}]</span>
                      <span className="source-answer-demo-source-copy"><small>{source.kind} · منبع ساختگی</small><strong>{source.title}</strong><span>{source.documentVersion} · {source.sourceDate}</span><em>{source.validity}</em></span>
                      <ArrowRight size={17} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </section>

              <aside className="source-answer-demo-fallback" data-testid="source-answer-demo-fallback">
                <CircleHelp size={17} />
                <span><strong>پاسخ واقعی فعلاً در دسترس نیست.</strong> برای آن باید محتوای فایل قابل‌خواندن یا منبع وب واقعی متصل و قابل‌بازکردن باشد.</span>
              </aside>

              <p className="source-answer-demo-context"><ShieldCheck size={16} /> این داده فقط در حافظهٔ ثابت رابط آماده شده، عضو {project.name} نیست و در مرورگر ذخیره نمی‌شود. آماده‌سازی: {mockSourceAnswerDemo.preparedAt}</p>
            </>
          )}
        </main>
      </MobileScroll>

      <BottomSheet open={Boolean(selectedSource)} onOpenChange={(open) => { if (!open) closeSourceDetail(); }} title={selectedSource ? `منبع ساختگی [${selectedSource.index}]` : "منبع ساختگی"} description="جزئیات دادهٔ نمونه؛ بدون پیوند و بازیابی واقعی" snap={0.86}>
        {selectedSource ? (
          <div className="source-answer-demo-detail" dir="rtl" data-testid="source-answer-demo-detail">
            <span className="source-answer-demo-detail-label">منبع ساختگی [{selectedSource.index}]</span>
            <p className="source-answer-demo-detail-warning"><ShieldCheck size={17} /><span><strong>دادهٔ ساختگی</strong> این رکورد منبع واقعی نیست و اعتبار استناد یا اجرا ندارد.</span></p>
            <blockquote>{selectedSource.excerpt}</blockquote>
            <dl>
              <div><dt>نوع منبع نمونه</dt><dd>{selectedSource.kind}</dd></div>
              <div><dt>عنوان نمونه</dt><dd>{selectedSource.title}</dd></div>
              <div><dt>ناشر ساختگی</dt><dd>{selectedSource.publisher}</dd></div>
              <div><dt>نسخهٔ سند نمونه</dt><dd>{selectedSource.documentVersion}</dd></div>
              <div><dt>تاریخ منبع نمونه</dt><dd>{selectedSource.sourceDate}</dd></div>
              <div><dt>محل ارجاع نمونه</dt><dd>{selectedSource.locator}</dd></div>
              <div><dt>محدودهٔ جغرافیایی نمونه</dt><dd>{selectedSource.geography}</dd></div>
              <div><dt>اعتبار</dt><dd>{selectedSource.validity}</dd></div>
              <div><dt>وضعیت بازیابی</dt><dd>بازیابی واقعی انجام نشده</dd></div>
            </dl>
          </div>
        ) : null}
      </BottomSheet>
    </div>
  );
}

function ProjectMemoryView({ project, memories, storageLocked, initialSelectedId = null, backLabel = "بازگشت به فضای پروژه", onBack, onCreate, onUpdate, onToggleUse, onDelete }: { project: BuilderProject; memories: ProjectMemoryRecord[]; storageLocked: boolean; initialSelectedId?: string | null; backLabel?: string; onBack: () => void; onCreate: (draft: ProjectMemoryDraft) => boolean; onUpdate: (memoryId: string, draft: ProjectMemoryDraft) => boolean; onToggleUse: (memoryId: string) => boolean; onDelete: (memoryId: string) => boolean }) {
  const keyboard = useKeyboard();
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [memoryDraft, setMemoryDraft] = useState<ProjectMemoryDraft>({ title: "", content: "", kind: "یادداشت سازنده" });
  const [fieldErrors, setFieldErrors] = useState({ title: "", content: "" });
  const [storageError, setStorageError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const deleteTriggerRef = useRef<HTMLButtonElement>(null);
  const deleteCancelRef = useRef<HTMLButtonElement>(null);
  const selectedMemory = selectedId ? memories.find((memory) => memory.id === selectedId) ?? null : null;
  const orderedMemories = useMemo(
    () => [...memories].sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()),
    [memories],
  );

  useEffect(() => {
    if (selectedId && !selectedMemory) {
      setSelectedId(null);
      setDeleteConfirmation(false);
    }
  }, [selectedId, selectedMemory]);

  useEffect(() => {
    if (!deleteConfirmation) return;
    const focusConfirmation = window.requestAnimationFrame(() => deleteCancelRef.current?.focus());
    return () => window.cancelAnimationFrame(focusConfirmation);
  }, [deleteConfirmation]);

  const openCreateEditor = () => {
    setEditingId(null);
    setMemoryDraft({ title: "", content: "", kind: "یادداشت سازنده" });
    setFieldErrors({ title: "", content: "" });
    setStorageError("");
    setEditorOpen(true);
  };

  const openEditEditor = (memory: ProjectMemoryRecord) => {
    setSelectedId(null);
    setDeleteConfirmation(false);
    setEditingId(memory.id);
    setMemoryDraft({ title: memory.title, content: memory.content, kind: memory.kind });
    setFieldErrors({ title: "", content: "" });
    setStorageError("");
    setEditorOpen(true);
  };

  const changeMemoryDraft = (field: keyof ProjectMemoryDraft, value: string) => {
    setMemoryDraft((current) => ({ ...current, [field]: value }));
    if (field === "title" || field === "content") {
      setFieldErrors((current) => current[field] ? { ...current, [field]: "" } : current);
    }
    setStorageError("");
  };

  const saveMemory = () => {
    const title = memoryDraft.title.trim();
    const content = memoryDraft.content.trim();
    const nextErrors = {
      title: title ? "" : "عنوان حافظه را وارد کن.",
      content: content ? "" : "متن حافظه را وارد کن.",
    };
    setFieldErrors(nextErrors);
    if (nextErrors.title || nextErrors.content) {
      const firstInvalidId = nextErrors.title ? "project-memory-title" : "project-memory-content";
      window.requestAnimationFrame(() => document.getElementById(firstInvalidId)?.focus());
      return;
    }

    keyboard.hide();
    const normalizedDraft = { ...memoryDraft, title, content };
    const saved = editingId ? onUpdate(editingId, normalizedDraft) : onCreate(normalizedDraft);
    if (!saved) {
      setStorageError("حافظه ذخیره نشد. فضای مرورگر را بررسی کن و دوباره تلاش کن.");
      return;
    }
    setEditorOpen(false);
    setEditingId(null);
    setStorageError("");
  };

  const toggleSelectedMemoryUse = () => {
    if (!selectedMemory) return;
    if (!onToggleUse(selectedMemory.id)) {
      setStorageError("تغییر وضعیت ذخیره نشد. دوباره تلاش کن.");
      return;
    }
    setStorageError("");
  };

  const deleteSelectedMemory = () => {
    if (!selectedMemory) return;
    if (!onDelete(selectedMemory.id)) {
      setStorageError("حذف حافظه ذخیره نشد. دوباره تلاش کن.");
      return;
    }
    setSelectedId(null);
    setDeleteConfirmation(false);
    setStorageError("");
  };

  return (
    <div className="chida-app project-memory-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-memory-view">
      <header className="project-workspace-header">
        <button className="icon-button" type="button" onClick={() => { keyboard.hide(); onBack(); }} aria-label={backLabel} data-testid="project-memory-back"><ArrowRight size={21} /></button>
        <span className="project-workspace-title"><small>حافظهٔ پروژه</small><strong>{project.name}</strong></span>
        <span className="project-workspace-header-spacer" aria-hidden="true" />
      </header>

      <MobileScroll className="project-memory-scroll">
        <main className="project-memory-content">
          <section className="project-memory-heading">
            <span className="project-memory-mark"><BrainCircuit size={24} strokeWidth={1.65} /></span>
            <div><span className="eyebrow">حافظهٔ همین پروژه</span><h1>چیدا چه می‌داند</h1><p>فقط مواردی که خودت مستقیم برای {project.name} ثبت کرده‌ای.</p></div>
          </section>

          <button className="primary-button project-memory-add" type="button" onClick={openCreateEditor} disabled={storageLocked} data-testid="project-memory-add"><Plus size={18} /> افزودن به حافظه</button>

          {storageLocked ? (
            <p className="project-storage-recovery-alert" role="alert" data-testid="project-memory-read-error"><ShieldCheck size={17} /><span><strong>حافظهٔ محلی کامل خوانده نشد.</strong> برای جلوگیری از بازنویسی داده‌های قبلی، افزودن و ویرایش تا بارگذاری موفق بعدی غیرفعال است.</span></p>
          ) : null}

          <aside className="project-memory-trust-note" aria-label="مرز حافظهٔ نسخهٔ فعلی">
            <ShieldCheck size={17} />
            <span><strong>تاریخچهٔ گفتگو حافظه نیست.</strong> پیام‌ها و فایل‌ها خودکار به حافظه تبدیل نمی‌شوند و این نسخه هنوز حافظه را واقعاً وارد زمینهٔ مدل نمی‌کند.</span>
          </aside>

          {storageLocked ? null : orderedMemories.length === 0 ? (
            <section className="project-memory-empty" data-testid="project-memory-empty">
              <span><BrainCircuit size={25} strokeWidth={1.65} /></span>
              <h2>هنوز چیزی ثبت نشده</h2>
              <p>یک تصمیم، قاعده یا واقعیت تأییدشده را خودت ثبت کن تا منشأ و تاریخ آن روشن بماند.</p>
            </section>
          ) : (
            <section className="project-memory-list" aria-label="موارد حافظهٔ پروژه">
              <div className="project-memory-list-title"><strong>موارد ثبت‌شده</strong><span>{orderedMemories.length.toLocaleString("fa-IR")}</span></div>
              {orderedMemories.map((memory) => (
                <button className="project-memory-card" type="button" key={memory.id} onClick={() => { setStorageError(""); setDeleteConfirmation(false); setSelectedId(memory.id); }} data-testid="project-memory-card">
                  <span className="project-memory-card-icon"><BrainCircuit size={20} strokeWidth={1.65} /></span>
                  <span className="project-memory-card-copy">
                    <span className="project-memory-card-topline"><small>{memory.kind}</small><small>{formatProjectFileDate(memory.updatedAt)}</small></span>
                    <strong>{memory.title}</strong>
                    <span>{memory.content}</span>
                    <small className={memory.useInContext ? "memory-context-on" : "memory-context-off"}>{memory.useInContext ? "برای استفاده در زمینه علامت‌گذاری شده" : "در زمینه استفاده نمی‌شود"}</small>
                  </span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              ))}
            </section>
          )}
        </main>
      </MobileScroll>

      <BottomSheet open={editorOpen} onOpenChange={(open) => { if (!open) { keyboard.hide(); setEditorOpen(false); setStorageError(""); } }} title={editingId ? "ویرایش حافظه" : "افزودن به حافظه"} description="پیش از ذخیره، نوع و محدودهٔ این مورد را بررسی کن." snap={0.94}>
        <form className="project-memory-editor-sheet" dir="rtl" data-testid="project-memory-editor-sheet" onSubmit={(event) => { event.preventDefault(); saveMemory(); }}>
          <label className="field-control" htmlFor="project-memory-title">
            <span>عنوان کوتاه</span>
            <KeyboardInput id="project-memory-title" data-testid="project-memory-title" value={memoryDraft.title} maxLength={80} placeholder="مثلاً قاعدهٔ خرید بتن" onChange={(event) => changeMemoryDraft("title", event.target.value)} aria-invalid={Boolean(fieldErrors.title)} aria-describedby={fieldErrors.title ? "project-memory-title-error" : undefined} />
            {fieldErrors.title ? <small className="field-error" id="project-memory-title-error" data-testid="project-memory-title-error">{fieldErrors.title}</small> : null}
          </label>

          <label className="field-control" htmlFor="project-memory-content">
            <span>متن حافظه</span>
            <KeyboardTextarea id="project-memory-content" data-testid="project-memory-content" value={memoryDraft.content} maxLength={800} rows={5} placeholder="آنچه باید دقیق و قابل بازبینی بماند..." onChange={(event) => changeMemoryDraft("content", event.target.value)} aria-invalid={Boolean(fieldErrors.content)} aria-describedby={fieldErrors.content ? "project-memory-content-error" : undefined} />
            {fieldErrors.content ? <small className="field-error" id="project-memory-content-error" data-testid="project-memory-content-error">{fieldErrors.content}</small> : null}
          </label>

          <div className="field-control">
            <span>نوع مورد</span>
            <ProjectChoiceMenu id="project-memory-kind" testId="project-memory-kind" value={memoryDraft.kind} placeholder="نوع حافظه را انتخاب کن" options={projectMemoryKinds} ariaLabel="نوع حافظه" onChange={(value) => changeMemoryDraft("kind", value as ProjectMemoryKind)} />
          </div>

          <dl className="project-memory-meta">
            <div><dt>پروژهٔ مالک</dt><dd>{project.name}</dd></div>
            <div><dt>منشأ</dt><dd>ثبت مستقیم شما</dd></div>
            <div><dt>دسترسی</dt><dd>خصوصی پروژه</dd></div>
            <div><dt>نسخه و تاریخ</dt><dd>نسخهٔ ۱ · هنگام ثبت</dd></div>
          </dl>

          <p className="project-memory-context-note"><CircleHelp size={16} /><span>فعال بودن برای زمینه در این پروتوتایپ فقط یک ترجیح محلی است؛ هنوز به مدل متصل نشده است.</span></p>
          {storageError ? <p className="project-memory-storage-error" role="alert" data-testid="project-memory-storage-error">{storageError}</p> : null}
          <button className="primary-button" type="submit" data-testid="project-memory-save">{editingId ? "ذخیرهٔ ویرایش" : "ثبت در حافظهٔ پروژه"}</button>
        </form>
      </BottomSheet>

      <BottomSheet open={Boolean(selectedMemory)} onOpenChange={(open) => { if (!open) { setSelectedId(null); setDeleteConfirmation(false); setStorageError(""); } }} title="جزئیات حافظه" description="منشأ، تاریخ و وضعیت استفادهٔ این مورد" snap={0.9}>
        {selectedMemory ? (
          <section className="project-memory-detail-sheet" dir="rtl" data-testid="project-memory-detail-sheet">
            <div className="project-memory-detail-title"><span><BrainCircuit size={21} /></span><div><small>{selectedMemory.kind}</small><strong>{selectedMemory.title}</strong></div></div>
            <p className="project-memory-detail-content">{selectedMemory.content}</p>
            <dl className="project-memory-meta">
              <div><dt>منشأ</dt><dd>ثبت مستقیم شما</dd></div>
              <div><dt>محدوده</dt><dd>خصوصی در {project.name}</dd></div>
              <div><dt>نسخه و وضعیت</dt><dd>نسخهٔ {selectedMemory.version.toLocaleString("fa-IR")} · {selectedMemory.status}</dd></div>
              <div><dt>زمان ثبت</dt><dd>{formatProjectFileDate(selectedMemory.createdAt)}</dd></div>
              <div><dt>آخرین ویرایش</dt><dd>{formatProjectFileDate(selectedMemory.updatedAt)}</dd></div>
            </dl>

            <div className="project-memory-context-control" data-active={selectedMemory.useInContext ? "true" : "false"}>
              <span><small>ترجیح استفاده در زمینه</small><strong>{selectedMemory.useInContext ? "برای زمینه فعال است" : "برای زمینه غیرفعال است"}</strong></span>
              <button type="button" onClick={toggleSelectedMemoryUse} disabled={storageLocked} data-testid="project-memory-use-toggle">{selectedMemory.useInContext ? "غیرفعال کن" : "فعال کن"}</button>
            </div>
            <p className="project-memory-context-note"><CircleHelp size={16} /><span>این کنترل فعلاً فقط در مرورگر ذخیره می‌شود؛ اتصال واقعی به زمینهٔ مدل در این تسک ساخته نشده است.</span></p>
            {storageError ? <p className="project-memory-storage-error" role="alert" data-testid="project-memory-storage-error">{storageError}</p> : null}

            <div className="project-memory-detail-actions">
              <button type="button" onClick={() => openEditEditor(selectedMemory)} disabled={storageLocked} data-testid="project-memory-edit"><PencilLine size={17} /> ویرایش</button>
              <button ref={deleteTriggerRef} className="project-memory-delete" type="button" onClick={() => setDeleteConfirmation(true)} disabled={storageLocked} data-testid="project-memory-delete">حذف</button>
            </div>

            {deleteConfirmation ? (
              <div className="project-memory-delete-confirmation" role="alertdialog" aria-modal="false" aria-labelledby="project-memory-delete-title" aria-describedby="project-memory-delete-description" data-testid="project-memory-delete-confirmation">
                <div><strong id="project-memory-delete-title">حذف دائمی از این مرورگر</strong><small id="project-memory-delete-description">این مورد از حافظهٔ {project.name} پاک می‌شود و در این نسخه امکان بازگردانی ندارد.</small></div>
                <div><button ref={deleteCancelRef} type="button" onClick={() => { setDeleteConfirmation(false); window.requestAnimationFrame(() => deleteTriggerRef.current?.focus()); }}>انصراف</button><button type="button" onClick={deleteSelectedMemory} data-testid="project-memory-delete-confirm">حذف حافظه</button></div>
              </div>
            ) : null}
          </section>
        ) : null}
      </BottomSheet>
    </div>
  );
}

function ProjectDetailsSheet({ open, draft, errors, onChange, onClose, onSave }: { open: boolean; draft: ProjectProfileDraft; errors: ProjectProfileFieldErrors; onChange: (field: keyof ProjectProfileDraft, value: string) => void; onClose: () => void; onSave: () => void }) {
  return (
    <BottomSheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()} title="ویرایش شناسنامهٔ پروژه" description="اطلاعات پایه و مشخصات فیزیکی پروژه را به‌روز کن." snap={0.94}>
      <form className="project-details-form" dir="rtl" data-testid="project-details-sheet" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
        <div className="project-form-section-title"><strong>اطلاعات پایه</strong><small>نام، زمینه و وضعیت فعلی پروژه</small></div>
        <label className="field-control" htmlFor="project-edit-name">
          <span>نام پروژه</span>
          <KeyboardInput id="project-edit-name" data-testid="project-edit-name" value={draft.name} onChange={(event) => onChange("name", event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "project-edit-name-error" : undefined} />
          {errors.name ? <small className="field-error" id="project-edit-name-error">{errors.name}</small> : null}
        </label>

        <div className="project-city-lock" aria-label="شهر فعال: تهران">
          <span><small>شهر فعال</small><strong>تهران</strong></span><ShieldCheck size={18} aria-hidden="true" />
        </div>

        <label className="field-control" htmlFor="project-edit-location">
          <span>محدودهٔ پروژه</span>
          <KeyboardInput id="project-edit-location" data-testid="project-edit-location" value={draft.location} onChange={(event) => onChange("location", event.target.value)} placeholder="مثلاً سعادت‌آباد یا منطقهٔ ۲" aria-invalid={Boolean(errors.location)} aria-describedby={errors.location ? "project-edit-location-error" : "project-edit-location-note"} />
          {errors.location ? <small className="field-error" id="project-edit-location-error">{errors.location}</small> : null}
          <small id="project-edit-location-note">فعلاً فقط پروژه‌های تهران فعال‌اند؛ آدرس دقیق لازم نیست.</small>
        </label>

        <div className="field-control">
          <span>مرحلهٔ ساخت</span>
          <ProjectChoiceMenu id="project-edit-stage" testId="project-edit-stage" value={draft.stage} placeholder="مرحلهٔ ساخت را انتخاب کن" options={projectStages} ariaLabel="مرحلهٔ ساخت" invalid={Boolean(errors.stage)} describedBy={errors.stage ? "project-edit-stage-error" : undefined} onChange={(value) => onChange("stage", value)} />
          {errors.stage ? <small className="field-error" id="project-edit-stage-error">{errors.stage}</small> : null}
        </div>

        <div className="field-control">
          <span>نوع کاربری</span>
          <ProjectChoiceMenu id="project-edit-usage" testId="project-edit-usage" value={draft.usage} placeholder="نوع کاربری را انتخاب کن" options={projectUsages} ariaLabel="نوع کاربری" onChange={(value) => onChange("usage", value)} />
        </div>

        <div className="project-form-section-title"><strong>ابعاد و ظرفیت</strong><small>اختیاری؛ هر زمان اطلاعات دقیق شد تکمیل کن</small></div>
        <div className="project-profile-input-grid">
          <label className="field-control" htmlFor="project-edit-land-area">
            <span>مساحت زمین <small>مترمربع</small></span>
            <KeyboardInput id="project-edit-land-area" data-testid="project-edit-land-area" value={draft.landArea} onChange={(event) => onChange("landArea", event.target.value)} inputMode="decimal" dir="ltr" placeholder="مثلاً ۶۵۰" aria-invalid={Boolean(errors.landArea)} aria-describedby={errors.landArea ? "project-edit-land-area-error" : undefined} />
            {errors.landArea ? <small className="field-error" id="project-edit-land-area-error" data-testid="project-edit-land-area-error">{errors.landArea}</small> : null}
          </label>
          <label className="field-control" htmlFor="project-edit-built-area">
            <span>زیربنای کل <small>مترمربع</small></span>
            <KeyboardInput id="project-edit-built-area" data-testid="project-edit-built-area" value={draft.builtArea} onChange={(event) => onChange("builtArea", event.target.value)} inputMode="decimal" dir="ltr" placeholder="مثلاً ۴۲۰۰" aria-invalid={Boolean(errors.builtArea)} aria-describedby={errors.builtArea ? "project-edit-built-area-error" : undefined} />
            {errors.builtArea ? <small className="field-error" id="project-edit-built-area-error" data-testid="project-edit-built-area-error">{errors.builtArea}</small> : null}
          </label>
          <label className="field-control" htmlFor="project-edit-above-ground-floors">
            <span>طبقات روی زمین</span>
            <KeyboardInput id="project-edit-above-ground-floors" data-testid="project-edit-above-ground-floors" value={draft.aboveGroundFloors} onChange={(event) => onChange("aboveGroundFloors", event.target.value)} inputMode="numeric" dir="ltr" placeholder="مثلاً ۶" aria-invalid={Boolean(errors.aboveGroundFloors)} aria-describedby={errors.aboveGroundFloors ? "project-edit-above-ground-floors-error" : undefined} />
            {errors.aboveGroundFloors ? <small className="field-error" id="project-edit-above-ground-floors-error" data-testid="project-edit-above-ground-floors-error">{errors.aboveGroundFloors}</small> : null}
          </label>
          <label className="field-control" htmlFor="project-edit-basement-floors">
            <span>طبقات منفی</span>
            <KeyboardInput id="project-edit-basement-floors" data-testid="project-edit-basement-floors" value={draft.basementFloors} onChange={(event) => onChange("basementFloors", event.target.value)} inputMode="numeric" dir="ltr" placeholder="مثلاً ۲" aria-invalid={Boolean(errors.basementFloors)} aria-describedby={errors.basementFloors ? "project-edit-basement-floors-error" : undefined} />
            {errors.basementFloors ? <small className="field-error" id="project-edit-basement-floors-error" data-testid="project-edit-basement-floors-error">{errors.basementFloors}</small> : null}
          </label>
          <label className="field-control" htmlFor="project-edit-unit-count">
            <span>تعداد واحدها</span>
            <KeyboardInput id="project-edit-unit-count" data-testid="project-edit-unit-count" value={draft.unitCount} onChange={(event) => onChange("unitCount", event.target.value)} inputMode="numeric" dir="ltr" placeholder="مثلاً ۲۴" aria-invalid={Boolean(errors.unitCount)} aria-describedby={errors.unitCount ? "project-edit-unit-count-error" : undefined} />
            {errors.unitCount ? <small className="field-error" id="project-edit-unit-count-error" data-testid="project-edit-unit-count-error">{errors.unitCount}</small> : null}
          </label>
        </div>

        <button className="primary-button" type="submit" data-testid="project-edit-save">ذخیرهٔ تغییرات</button>
      </form>
    </BottomSheet>
  );
}

function useProjectImageUrls(files: ProjectFileRecord[]) {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const imageIdentity = files.map((file) => `${file.id}:${file.storageMode}`).join("|");

  useEffect(() => {
    let disposed = false;
    const createdUrls: string[] = [];
    const loadImages = async () => {
      const entries = await Promise.all(files.map(async (file) => {
        if (!isBrowserPreviewableProjectImage(file)) return [file.id, ""] as const;
        try {
          const blob = await readProjectImage(file);
          if (!blob) return [file.id, ""] as const;
          const url = URL.createObjectURL(blob);
          createdUrls.push(url);
          return [file.id, url] as const;
        } catch {
          return [file.id, ""] as const;
        }
      }));
      if (disposed) {
        createdUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }
      setImageUrls(Object.fromEntries(entries.filter(([, url]) => url)));
    };
    void loadImages();
    return () => {
      disposed = true;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageIdentity]);

  return imageUrls;
}

function ProjectGalleryView({ project, files, storageLocked, onBack, onRegister }: { project: BuilderProject; files: ProjectFileRecord[]; storageLocked: boolean; onBack: () => void; onRegister: (file: PendingProjectFile) => Promise<boolean> }) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<PendingProjectFile | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [registrationPending, setRegistrationPending] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(() => new Set());
  const orderedFiles = useMemo(
    () => [...files].sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
    [files],
  );
  const imageUrls = useProjectImageUrls(orderedFiles);
  const selectedFile = files.find((file) => file.id === selectedFileId) ?? null;

  useEffect(() => {
    const previewUrl = pendingFile?.previewUrl;
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [pendingFile?.previewUrl]);

  const chooseImage = (file: File | undefined, source: ProjectFileRecord["source"]) => {
    setFileError("");
    setRegistrationError("");
    if (!file) return;
    if (!isSupportedProjectImage(file)) {
      setPendingFile(null);
      setFileError("این تصویر پشتیبانی نمی‌شود. عکس JPG، PNG، WebP یا HEIC انتخاب کن.");
      return;
    }
    setPendingFile({
      displayName: file.name,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      category: "عکس",
      source,
      sourceModifiedAt: file.lastModified ? new Date(file.lastModified).toISOString() : null,
      blob: file,
      previewUrl: isBrowserPreviewableProjectImage({ mimeType: file.type, originalName: file.name }) ? URL.createObjectURL(file) : null,
    });
  };

  const registerPendingImage = async () => {
    if (!pendingFile || registrationPending) return;
    setRegistrationPending(true);
    if (await onRegister(pendingFile)) {
      setPendingFile(null);
      setRegistrationError("");
      setRegistrationPending(false);
      return;
    }
    setRegistrationError("تصویر داخل مرورگر ذخیره نشد. فضای مرورگر را بررسی کن و دوباره تلاش کن.");
    setRegistrationPending(false);
  };

  return (
    <div className="chida-app project-gallery-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-gallery-view">
      <header className="project-workspace-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="بازگشت" data-testid="project-gallery-back"><ArrowRight size={21} /></button>
        <span className="project-workspace-title"><small>گالری تصاویر</small><strong>{project.name}</strong></span>
        <span className="project-workspace-header-spacer" aria-hidden="true" />
      </header>

      <MobileScroll className="project-gallery-scroll">
        <main className="project-gallery-content">
          <section className="project-gallery-heading">
            <span className="project-gallery-mark"><ImageIcon size={25} strokeWidth={1.65} /></span>
            <div><span className="eyebrow">تصاویر همین پروژه</span><h1>گالری تصاویر</h1><p>عکس‌های ثبت‌شده فقط به {project.name} متصل می‌مانند.</p></div>
          </section>

          <div className="project-gallery-actions">
            <button className="primary-button" type="button" onClick={() => galleryInputRef.current?.click()} disabled={storageLocked} data-testid="project-gallery-add"><ImageIcon size={18} /> انتخاب عکس</button>
            <button className="project-gallery-camera-button" type="button" onClick={() => cameraInputRef.current?.click()} disabled={storageLocked} data-testid="project-camera-add"><Camera size={18} /> دوربین</button>
          </div>
          <input ref={galleryInputRef} className="project-file-native-input" type="file" accept={projectImageAccept} disabled={storageLocked} data-testid="project-gallery-input" onChange={(event) => { chooseImage(event.currentTarget.files?.[0], "انتخاب مستقیم از دستگاه"); event.currentTarget.value = ""; }} />
          <input ref={cameraInputRef} className="project-file-native-input" type="file" accept="image/*" capture="environment" disabled={storageLocked} data-testid="project-camera-input" onChange={(event) => { chooseImage(event.currentTarget.files?.[0], "دوربین دستگاه"); event.currentTarget.value = ""; }} />
          <div className="project-file-error-slot" aria-live="polite">{fileError ? <p className="field-error" data-testid="project-gallery-error">{fileError}</p> : null}</div>

          {storageLocked ? (
            <p className="project-storage-recovery-alert" role="alert" data-testid="project-gallery-read-error"><ShieldCheck size={17} /><span><strong>شناسنامهٔ فایل‌ها کامل خوانده نشد.</strong> برای جلوگیری از بازنویسی داده‌های قبلی، افزودن تصویر تا بارگذاری موفق بعدی غیرفعال است.</span></p>
          ) : null}

          <p className="project-files-storage-note"><ShieldCheck size={16} /><span>تصاویر فقط داخل همین مرورگر نگه‌داری می‌شوند و به سرور ارسال نمی‌شوند؛ تحلیل، جست‌وجو یا اشتراک‌گذاری انجام نمی‌شود.</span></p>

          {storageLocked ? null : orderedFiles.length === 0 ? (
            <section className="project-gallery-empty" data-testid="project-gallery-empty">
              <span><ImageIcon size={26} /></span>
              <h2>هنوز عکسی ثبت نشده</h2>
              <p>اولین عکس کارگاه، مدرک یا پیشرفت پروژه را از دستگاه انتخاب کن.</p>
            </section>
          ) : (
            <section className="project-gallery-grid" aria-label="تصاویر پروژه">
              {orderedFiles.map((file) => {
                const imageUrl = imageUrls[file.id];
                const imageFailed = failedImageIds.has(file.id);
                return (
                  <button className="project-gallery-item" type="button" key={file.id} onClick={() => setSelectedFileId(file.id)} data-testid="project-gallery-item" aria-label={`مشاهدهٔ ${file.displayName}`}>
                    <span className="project-gallery-thumbnail-shell">
                      {imageUrl && !imageFailed ? <img src={imageUrl} alt={file.displayName} draggable={false} data-testid="project-gallery-thumbnail" onError={() => setFailedImageIds((currentIds) => new Set(currentIds).add(file.id))} /> : <span className="project-gallery-thumbnail-empty"><ImageIcon size={24} /><small>{projectFileFormat(file)}</small></span>}
                    </span>
                    <span className="project-gallery-item-copy"><strong dir="auto">{file.displayName}</strong><small>{formatProjectFileDate(file.createdAt)}</small></span>
                  </button>
                );
              })}
            </section>
          )}
        </main>
      </MobileScroll>

      <ProjectFileRegisterSheet
        file={pendingFile}
        project={project}
        error={registrationError}
        busy={registrationPending}
        categoryLocked
        onCategoryChange={() => {}}
        onCancel={() => { if (!registrationPending) { setRegistrationError(""); setPendingFile(null); } }}
        onRegister={registerPendingImage}
      />
      <ProjectGalleryDetailSheet file={selectedFile} imageUrl={selectedFile ? imageUrls[selectedFile.id] : ""} project={project} onClose={() => setSelectedFileId(null)} />
    </div>
  );
}

function ProjectGalleryDetailSheet({ file, imageUrl, project, onClose }: { file: ProjectFileRecord | null; imageUrl: string; project: BuilderProject; onClose: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [file?.id, imageUrl]);

  return (
    <BottomSheet open={Boolean(file)} onOpenChange={(open) => !open && onClose()} title="جزئیات تصویر" description="نسخه و محدودهٔ این عکس" snap={0.94}>
      {file ? (
        <section className="project-gallery-detail-sheet" dir="rtl" data-testid="project-gallery-detail-sheet">
          {imageUrl && !imageFailed ? <img className="project-gallery-detail-image" src={imageUrl} alt={file.displayName} draggable={false} data-testid="project-gallery-detail-image" onError={() => setImageFailed(true)} /> : <div className="project-gallery-detail-missing"><ImageIcon size={28} /><span>پیش‌نمایش این تصویر در مرورگر در دسترس نیست.</span></div>}
          <div className="project-gallery-detail-title"><small>عکس پروژه</small><strong dir="auto">{file.displayName}</strong></div>
          <dl className="project-file-meta">
            <div><dt>نوع و حجم</dt><dd>{projectFileFormat(file)} · {formatProjectFileSize(file.size)}</dd></div>
            <div><dt>پروژه و دسترسی</dt><dd>خصوصی در {project.name}</dd></div>
            <div><dt>مرحله هنگام ثبت</dt><dd>{file.projectStage || "ثبت نشده"}</dd></div>
            <div><dt>منشأ</dt><dd>{file.source}</dd></div>
            <div><dt>نسخه و وضعیت</dt><dd>نسخهٔ {file.version.toLocaleString("fa-IR")} · {file.status}</dd></div>
            <div><dt>زمان ثبت</dt><dd>{formatProjectFileDate(file.createdAt)}</dd></div>
          </dl>
          <p className="project-file-trust-note"><ShieldCheck size={16} /><span>این تصویر فقط مدرک پروژه است؛ هیچ تحلیل، تشخیص نقص یا اقدام بیرونی انجام نشده است.</span></p>
          <button className="primary-button" type="button" onClick={onClose}>بستن</button>
        </section>
      ) : null}
    </BottomSheet>
  );
}

function ProjectFilesView({ project, files, storageLocked, initialSelectedId = null, onBack, onRegister, onRename }: { project: BuilderProject; files: ProjectFileRecord[]; storageLocked: boolean; initialSelectedId?: string | null; onBack: () => void; onRegister: (file: PendingProjectFile) => Promise<boolean>; onRename: (fileId: string, displayName: string) => boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<PendingProjectFile | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(initialSelectedId);
  const [fileError, setFileError] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [registrationPending, setRegistrationPending] = useState(false);
  const orderedFiles = useMemo(
    () => [...files].sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
    [files],
  );
  const selectedFile = files.find((file) => file.id === selectedFileId) ?? null;

  useEffect(() => {
    const previewUrl = pendingFile?.previewUrl;
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [pendingFile?.previewUrl]);

  const chooseFile = (file: File | undefined) => {
    setFileError("");
    setRegistrationError("");
    if (!file) return;
    if (!isSupportedProjectFile(file)) {
      setPendingFile(null);
      setFileError("این نوع فایل پشتیبانی نمی‌شود. PDF، تصویر JPG/PNG/WebP/HEIC، صفحه‌گسترده یا سند متنی انتخاب کن.");
      return;
    }
    setPendingFile({
      displayName: file.name,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      category: inferProjectFileCategory(file),
      source: "انتخاب مستقیم از دستگاه",
      sourceModifiedAt: file.lastModified ? new Date(file.lastModified).toISOString() : null,
      blob: isSupportedProjectImage(file) ? file : null,
      previewUrl: isSupportedProjectImage(file) && isBrowserPreviewableProjectImage({ mimeType: file.type, originalName: file.name }) ? URL.createObjectURL(file) : null,
    });
  };

  const registerPendingFile = async () => {
    if (!pendingFile || registrationPending) return;
    setRegistrationPending(true);
    if (await onRegister(pendingFile)) {
      setRegistrationError("");
      setPendingFile(null);
      setRegistrationPending(false);
      return;
    }
    setRegistrationError("شناسنامهٔ فایل ذخیره نشد. فضای مرورگر را بررسی کن و دوباره تلاش کن.");
    setRegistrationPending(false);
  };

  return (
    <div className="chida-app project-files-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-files-view">
      <header className="project-workspace-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label="بازگشت" data-testid="project-files-back"><ArrowRight size={21} /></button>
        <span className="project-workspace-title"><small>فایل‌ها و اسناد</small><strong>{project.name}</strong></span>
        <span className="project-workspace-header-spacer" aria-hidden="true" />
      </header>

      <MobileScroll className="project-files-scroll">
        <main className="project-files-content">
          <section className="project-files-heading">
            <span className="project-files-mark"><FileText size={25} strokeWidth={1.65} /></span>
            <div><span className="eyebrow">کتابخانهٔ پروژه</span><h1>فایل‌ها و اسناد</h1><p>مدارک ثبت‌شده فقط به همین پروژه متصل می‌مانند.</p></div>
          </section>

          <button className="primary-button project-file-add" type="button" onClick={() => inputRef.current?.click()} disabled={storageLocked} data-testid="project-file-add"><Plus size={18} /> افزودن فایل</button>
          <input
            ref={inputRef}
            className="project-file-native-input"
            type="file"
            accept={projectFileAccept}
            disabled={storageLocked}
            data-testid="project-file-input"
            onChange={(event) => {
              chooseFile(event.currentTarget.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
          <div className="project-file-error-slot" aria-live="polite">
            {fileError ? <p className="field-error" data-testid="project-file-error">{fileError}</p> : null}
          </div>

          {storageLocked ? (
            <p className="project-storage-recovery-alert" role="alert" data-testid="project-files-read-error"><ShieldCheck size={17} /><span><strong>شناسنامهٔ فایل‌ها کامل خوانده نشد.</strong> برای جلوگیری از بازنویسی داده‌های قبلی، افزودن و تغییر نام تا بارگذاری موفق بعدی غیرفعال است.</span></p>
          ) : null}

          <p className="project-files-storage-note"><ShieldCheck size={16} /><span>محتوای واقعی فایل روی سرور ارسال نمی‌شود؛ تصاویر گالری فقط در همین مرورگر و سایر فایل‌ها فقط به‌صورت شناسنامه نگه‌داری می‌شوند.</span></p>

          {storageLocked ? null : orderedFiles.length === 0 ? (
            <section className="project-files-empty" data-testid="project-files-empty">
              <span><FileText size={25} /></span>
              <h2>هنوز فایلی ثبت نشده</h2>
              <p>PDF، تصویر JPG/PNG/WebP/HEIC، صفحه‌گسترده یا سند متنی پروژه را انتخاب کن.</p>
            </section>
          ) : (
            <section className="project-file-list" aria-label="فایل‌های پروژه">
              <div className="project-file-list-title"><strong>فایل‌های ثبت‌شده</strong><span>{orderedFiles.length.toLocaleString("fa-IR")}</span></div>
              {orderedFiles.map((file) => (
                <button className="project-file-row" type="button" key={file.id} onClick={() => setSelectedFileId(file.id)} data-testid="project-file-row" aria-label={`جزئیات ${file.displayName}`}>
                  <span className="project-file-row-icon">{isProjectImage(file) ? <ImageIcon size={20} /> : <FileText size={20} />}</span>
                  <span className="project-file-row-copy"><strong dir="auto">{file.displayName}</strong><small>{file.category} · نسخهٔ {file.version.toLocaleString("fa-IR")} · {formatProjectFileSize(file.size)}</small></span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              ))}
            </section>
          )}
        </main>
      </MobileScroll>

      <ProjectFileRegisterSheet
        file={pendingFile}
        project={project}
        error={registrationError}
        busy={registrationPending}
        onCategoryChange={(category) => setPendingFile((current) => current ? { ...current, category } : current)}
        onCancel={() => { setRegistrationError(""); setPendingFile(null); }}
        onRegister={registerPendingFile}
      />
      <ProjectFileDetailSheet file={selectedFile} project={project} storageLocked={storageLocked} onClose={() => setSelectedFileId(null)} onRename={onRename} />
    </div>
  );
}

function ProjectFileRegisterSheet({ file, project, error, busy, categoryLocked = false, onCategoryChange, onCancel, onRegister }: { file: PendingProjectFile | null; project: BuilderProject; error: string; busy: boolean; categoryLocked?: boolean; onCategoryChange: (category: ProjectFileCategory) => void; onCancel: () => void; onRegister: () => void }) {
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    setPreviewFailed(false);
  }, [file?.previewUrl]);

  return (
    <BottomSheet open={Boolean(file)} onOpenChange={(open) => !open && onCancel()} title="پیش‌نمایش ثبت فایل" description="قبل از ثبت، مقصد و شناسنامهٔ فایل را بررسی کن." snap={0.78}>
      {file ? (
        <section className="project-file-register-sheet" dir="rtl" data-testid="project-file-register-sheet">
          {file.previewUrl && !previewFailed ? <img className="project-file-preview-image" src={file.previewUrl} alt={`پیش‌نمایش ${file.displayName}`} draggable={false} data-testid="project-file-preview-image" onError={() => setPreviewFailed(true)} /> : file.blob ? <div className="project-file-preview-fallback" data-testid="project-file-preview-fallback"><ImageIcon size={25} /><span>پیش‌نمایش {projectFileFormat(file)} در این مرورگر در دسترس نیست.</span></div> : null}
          <div className="project-file-preview-title"><span>{file.blob ? <ImageIcon size={22} /> : <FileText size={22} />}</span><div><small>{file.blob ? "تصویر انتخاب‌شده" : "فایل انتخاب‌شده"}</small><strong dir="auto">{file.originalName}</strong></div></div>
          <dl className="project-file-meta">
            <div><dt>نوع و حجم</dt><dd>{projectFileFormat(file)} · {formatProjectFileSize(file.size)}</dd></div>
            <div><dt>پروژهٔ مقصد</dt><dd>{project.name}</dd></div>
            <div><dt>منشأ</dt><dd>{file.source}</dd></div>
            <div><dt>دسترسی</dt><dd>خصوصی در همین پروژه</dd></div>
            <div><dt>مرحله هنگام ثبت</dt><dd>{project.stage}</dd></div>
            <div><dt>نسخه</dt><dd>نسخهٔ ۱</dd></div>
            <div><dt>وضعیت</dt><dd>ثبت محلی آزمایشی</dd></div>
          </dl>
          <div className="field-control project-file-category-field">
            <span>دستهٔ سند</span>
            {categoryLocked ? <div className="project-file-category-lock" data-testid="project-file-category">{file.category}</div> : <ProjectChoiceMenu id="project-file-category" testId="project-file-category" value={file.category} placeholder="دسته را انتخاب کن" options={projectFileCategories} ariaLabel="دستهٔ سند" onChange={(value) => onCategoryChange(value as ProjectFileCategory)} />}
          </div>
          <p className="project-file-preview-note"><ShieldCheck size={16} /> {file.blob ? "تصویر فقط داخل همین مرورگر برای گالری نگه‌داری می‌شود؛ آپلود، تحلیل یا جست‌وجو نمی‌شود." : "فقط شناسنامه ثبت می‌شود؛ محتوای فایل آپلود، استخراج یا جست‌وجو نمی‌شود."}</p>
          <div className="project-file-register-error-slot" aria-live="assertive">
            {error ? <p className="field-error" data-testid="project-file-register-error">{error}</p> : null}
          </div>
          <div className="project-file-preview-actions">
            <button type="button" onClick={onCancel} data-testid="project-file-cancel" disabled={busy}>لغو</button>
            <button className="primary-button" type="button" onClick={onRegister} data-testid="project-file-register" disabled={busy}>{busy ? "در حال ثبت…" : "ثبت در پروژه"}</button>
          </div>
        </section>
      ) : null}
    </BottomSheet>
  );
}

function ProjectFileDetailSheet({ file, project, storageLocked, onClose, onRename }: { file: ProjectFileRecord | null; project: BuilderProject; storageLocked: boolean; onClose: () => void; onRename: (fileId: string, displayName: string) => boolean }) {
  const keyboard = useKeyboard();
  const [displayName, setDisplayName] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    setDisplayName(file?.displayName ?? "");
    setNameError("");
  }, [file?.displayName, file?.id]);

  const close = () => {
    keyboard.hide();
    onClose();
  };

  const saveName = () => {
    const normalizedName = displayName.trim();
    if (!file || !normalizedName) {
      setNameError("نام نمایشی فایل را وارد کن.");
      return;
    }
    if (onRename(file.id, normalizedName)) {
      close();
      return;
    }
    setNameError("نام نمایشی ذخیره نشد. فضای مرورگر را بررسی کن و دوباره تلاش کن.");
  };

  return (
    <BottomSheet open={Boolean(file)} onOpenChange={(open) => !open && close()} title="جزئیات فایل" description="منشأ، نسخه و محدودهٔ این فایل" snap={0.86}>
      {file ? (
        <section className="project-file-detail-sheet" dir="rtl" data-testid="project-file-detail-sheet">
          <div className="project-file-preview-title"><span><FileText size={22} /></span><div><small>{file.category}</small><strong>{file.displayName}</strong></div></div>
          <label className="field-control" htmlFor="project-file-display-name">
            <span>نام نمایشی</span>
            <KeyboardInput id="project-file-display-name" data-testid="project-file-display-name" value={displayName} disabled={storageLocked} onChange={(event) => { setDisplayName(event.target.value); setNameError(""); }} aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "project-file-display-name-error" : undefined} />
            {nameError ? <small className="field-error" id="project-file-display-name-error">{nameError}</small> : null}
          </label>
          <dl className="project-file-meta">
            <div><dt>نام فایل اصلی</dt><dd>{file.originalName}</dd></div>
            <div><dt>نوع و حجم</dt><dd>{projectFileFormat(file)} · {formatProjectFileSize(file.size)}</dd></div>
            <div><dt>پروژه و دسترسی</dt><dd>خصوصی در {project.name}</dd></div>
            <div><dt>مرحله هنگام ثبت</dt><dd>{file.projectStage || "ثبت نشده"}</dd></div>
            <div><dt>منشأ</dt><dd>{file.source}</dd></div>
            <div><dt>نسخه و وضعیت</dt><dd>نسخهٔ {file.version.toLocaleString("fa-IR")} · {file.status}</dd></div>
            <div><dt>زمان ثبت</dt><dd>{formatProjectFileDate(file.createdAt)}</dd></div>
          </dl>
          <p className="project-file-trust-note"><ShieldCheck size={16} /><span>محتوای بیرونی این فایل داده برای بررسی است، نه دستور برای چیدا؛ هیچ تحلیل یا اقدام بیرونی انجام نشده است.</span></p>
          <button className="primary-button" type="button" onClick={saveName} disabled={storageLocked} data-testid="project-file-rename-save">ذخیرهٔ نام نمایشی</button>
        </section>
      ) : null}
    </BottomSheet>
  );
}

function SheetRow({ icon, title, description, selected, disabled, testId, onClick }: { icon: ReactNode; title: string; description: string; selected?: boolean; disabled?: boolean; testId?: string; onClick: () => void }) {
  return <button className="sheet-row" type="button" onClick={onClick} disabled={disabled} data-testid={testId} data-selected={selected ? "true" : "false"}><span className="sheet-row-icon">{icon}</span><span className="sheet-row-copy"><strong>{title}</strong><small>{description}</small></span>{selected ? <Check size={18} /> : null}</button>;
}

function ModelsSheet({ sheet, mode, onClose, onSelect }: { sheet: SheetName; mode: ModelMode; onClose: () => void; onSelect: (mode: ModelMode) => void }) {
  const options: { name: ModelMode; description: string; icon: ReactNode }[] = [
    { name: "خودکار", description: "بهترین حالت را بر اساس درخواست انتخاب می‌کند", icon: <Sparkles size={20} /> },
    { name: "سریع", description: "پاسخ کوتاه‌تر برای کارهای روزمره", icon: <Zap size={20} /> },
    { name: "عمیق", description: "تحلیل کامل‌تر برای تصمیم‌های مهم", icon: <BrainCircuit size={20} /> },
  ];
  return <BottomSheet open={sheet === "models"} onOpenChange={(open) => !open && onClose()} title="حالت پاسخ" description="چیدا مدل مناسب را پشت صحنه مدیریت می‌کند." snap={0.48}><div className="sheet-list" dir="rtl" data-testid="model-sheet">{options.map((option) => <SheetRow key={option.name} icon={option.icon} title={option.name} description={option.description} selected={mode === option.name} onClick={() => { onSelect(option.name); onClose(); }} />)}</div></BottomSheet>;
}

function AttachSheet({ sheet, onClose }: { sheet: SheetName; onClose: () => void }) {
  return <BottomSheet open={sheet === "attach"} onOpenChange={(open) => !open && onClose()} title="افزودن به گفتگو" snap={0.48}><div className="sheet-list" dir="rtl"><SheetRow icon={<Camera size={20} />} title="دوربین" description="از کارگاه یا مدرک عکس بگیر" onClick={onClose} /><SheetRow icon={<ImageIcon size={20} />} title="عکس و ویدیو" description="از گالری دستگاه انتخاب کن" onClick={onClose} /><SheetRow icon={<FileText size={20} />} title="فایل پیوست · به‌زودی" description="فعلاً برای ثبت فایل از ابزارها وارد اسناد پروژه شو" testId="composer-file-attachment" disabled onClick={() => {}} /></div></BottomSheet>;
}

function ToolsSheet({ sheet, installedTool, onBuild, onSearch, onSourceDemo, onFiles, onClose }: { sheet: SheetName; installedTool: string; onBuild: () => void; onSearch: () => void; onSourceDemo: () => void; onFiles: () => void; onClose: () => void }) {
  return (
    <BottomSheet open={sheet === "tools"} onOpenChange={(open) => !open && onClose()} title="ابزارهای پروژه" description="ابزارهای فعال و عامل Build برای ساخت یک ابزار تازه." snap={0.64}>
      <div className="sheet-list" dir="rtl" data-testid="tools-sheet">
        <SheetRow icon={<Hammer size={20} />} title="Build" description="عامل ساخت ابزار و نصب پلاگین و اسکیل در پروژه" testId="build-tool-entry" onClick={onBuild} />
        {installedTool ? <SheetRow icon={<PackageCheck size={20} />} title={installedTool} description="پلاگین خصوصی نصب‌شده در پروژه" testId="installed-tool-row" onClick={onClose} /> : null}
        <SheetRow icon={<Search size={20} />} title="جست‌وجوی محلی پروژه" description="حافظه و شناسنامهٔ فایل‌های همین پروژه" testId="source-search-tool" onClick={onSearch} />
        <SheetRow icon={<Sparkles size={20} />} title="پاسخ منبع‌دار · نمونه" description="دادهٔ ساختگی؛ بدون وب، فایل یا هوش مصنوعی" testId="source-answer-demo-tool" onClick={onSourceDemo} />
        <SheetRow icon={<FileText size={20} />} title="اسناد پروژه" description="فایل‌های ثبت‌شده در پروژهٔ فعال" testId="project-documents-tool" onClick={onFiles} />
        <SheetRow icon={<Wrench size={20} />} title="دستیار فنی" description="چک‌لیست و تحلیل تخصصی ساخت" onClick={onClose} />
      </div>
    </BottomSheet>
  );
}

function BuildSheet({ sheet, activeProject, onClose, onInstalled }: { sheet: SheetName; activeProject: string; onClose: () => void; onInstalled: (toolName: string) => void }) {
  const keyboard = useKeyboard();
  const [step, setStep] = useState<BuildStep>("define");
  const [name, setName] = useState("رهگیر جریان نقدی");
  const [description, setDescription] = useState("هزینه‌های ۳۰ روز آینده را جمع‌بندی و انحراف بودجه را هشدار بده");

  const startBuild = () => {
    if (!name.trim() || !description.trim()) return;
    keyboard.hide();
    setStep("preview");
  };

  const install = () => {
    const normalizedName = name.trim();
    onInstalled(normalizedName);
    setStep("installed");
  };

  return (
    <BottomSheet open={sheet === "build"} onOpenChange={(open) => !open && onClose()} title="Build · ساخت ابزار" description="چیدا نیازت را به یک پلاگین خصوصی با اسکیل مرتبط تبدیل می‌کند." snap={0.88}>
      <div className="build-flow" dir="rtl" data-testid="build-flow" data-step={step}>
        {step === "define" ? (
          <section className="build-step" data-testid="build-define-step">
            <div className="build-agent-intro"><span><Bot size={21} /></span><div><strong>عامل Build</strong><small>ابزار را از کاتالوگ امن رابط می‌سازد؛ نه با اجرای کد آزاد.</small></div></div>
            <label className="build-field"><span>نام ابزار</span><KeyboardInput value={name} onChange={(event) => setName(event.target.value)} data-testid="build-name-input" /></label>
            <label className="build-field"><span>این ابزار چه کاری انجام دهد؟</span><KeyboardTextarea value={description} onChange={(event) => setDescription(event.target.value)} data-testid="build-description-input" rows={4} /></label>
            <div className="build-scope"><Folder size={17} /><span><small>محل نصب</small><strong>{activeProject}</strong></span></div>
            <button className="primary-button" type="button" data-testid="build-start-button" disabled={!name.trim() || !description.trim()} onClick={startBuild}>ساخت پیش‌نمایش</button>
          </section>
        ) : null}

        {step === "preview" ? (
          <section className="build-step build-preview">
            <div className="build-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100} data-testid="build-progress"><span style={{ width: "100%" }} /></div>
            <div className="build-stages" aria-label="مراحل ساخت">
              <div data-testid="build-stage-spec" data-state="complete"><CheckCircle2 size={17} /><span><strong>تعریف ابزار</strong><small>هدف و داده‌ها مشخص شد</small></span></div>
              <div data-testid="build-stage-plugin" data-state="complete"><Puzzle size={17} /><span><strong>بستهٔ پلاگین</strong><small>نمای رهگیر و هشدار ساخته شد</small></span></div>
              <div data-testid="build-stage-skill" data-state="complete"><BrainCircuit size={17} /><span><strong>اسکیل مرتبط</strong><small>پایش جریان نقدی آماده شد</small></span></div>
            </div>
            <article className="build-preview-card">
              <div className="build-preview-title"><span><Hammer size={20} /></span><div><small>پیش‌نمایش پلاگین خصوصی</small><h3>{name}</h3></div></div>
              <p>{description}</p>
              <div className="build-chips"><span>جدول پروژه</span><span>هشدار انحراف</span><span>خلاصهٔ روزانه</span></div>
              <dl className="build-permissions">
                <div><dt>دادهٔ مجاز</dt><dd>بودجه و هزینه‌های پروژه</dd></div>
                <div><dt>اقدام مجاز</dt><dd>ثبت نمای ساخته‌شده در {activeProject}</dd></div>
                <div><dt>روش ساخت</dt><dd>اجزای تأییدشده؛ بدون اجرای کد آزاد</dd></div>
              </dl>
            </article>
            <button className="primary-button" type="button" data-testid="build-install-button" onClick={install}>نصب پلاگین و اسکیل</button>
            <p className="prototype-disclaimer">در این پروتوتایپ نصب فقط داخل همین مرورگر شبیه‌سازی می‌شود.</p>
          </section>
        ) : null}

        {step === "installed" ? (
          <section className="build-step build-success" data-testid="build-success">
            <span className="build-success-icon"><PackageCheck size={30} /></span>
            <div><span className="eyebrow">نصب آزمایشی کامل شد</span><h3>{name}</h3><p>ابزار به {activeProject} اضافه شد و از بخش ابزارها در دسترس است.</p></div>
            <div className="install-statuses">
              <span data-testid="plugin-install-status" data-state="installed"><Puzzle size={17} /> پلاگین نصب شد <Check size={16} /></span>
              <span data-testid="skill-install-status" data-state="installed"><BrainCircuit size={17} /> اسکیل فعال شد <Check size={16} /></span>
            </div>
            <button className="primary-button" type="button" data-testid="build-done-button" onClick={onClose}>دیدن ابزارهای پروژه</button>
          </section>
        ) : null}
      </div>
    </BottomSheet>
  );
}

function BriefSheet({ sheet, schedule, onClose, onSave }: { sheet: SheetName; schedule: BriefSchedule | null; onClose: () => void; onSave: (schedule: BriefSchedule) => boolean }) {
  const keyboard = useKeyboard();
  const [frequency, setFrequency] = useState<BriefFrequency>(schedule?.frequency ?? "daily");
  const [weekday, setWeekday] = useState(schedule?.weekday ?? "شنبه");
  const [time, setTime] = useState(schedule?.time ?? "09:00");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (sheet !== "brief") return;
    setFrequency(schedule?.frequency ?? "daily");
    setWeekday(schedule?.weekday ?? "شنبه");
    setTime(schedule?.time ?? "09:00");
    setSaveError("");
  }, [schedule, sheet]);

  const save = () => {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/u.test(time)) {
      setSaveError("ساعت را به‌شکل معتبر ۰۰:۰۰ تا ۲۳:۵۹ وارد کن.");
      return;
    }
    if (!onSave({ frequency, weekday, time })) {
      setSaveError("برنامهٔ بریف ذخیره نشد. فضای مرورگر را بررسی کن و دوباره تلاش کن.");
      return;
    }
    keyboard.hide();
    onClose();
  };

  return (
    <BottomSheet open={sheet === "brief"} onOpenChange={(open) => !open && onClose()} title="بریف پروژه" description="در زمان انتخابی، فقط موارد مهم و قابل اقدام پروژه را جمع‌بندی می‌کند." snap={0.84}>
      <div className="brief-panel" dir="rtl" data-testid="brief-panel">
        <div className="brief-preview">
          <div className="brief-preview-head"><span><CalendarDays size={20} /></span><div><small>بریف {activeBriefLabel(frequency)}</small><strong>امروزِ پروژه در یک نگاه</strong></div></div>
          <ul><li>تصمیم‌هایی که امروز لازم‌اند</li><li>کارهای عقب‌افتاده و نزدیک</li><li>خریدها و درخواست‌های باز</li><li>اسناد و ورودی‌های بلاتکلیف</li><li>تغییرات مهم از آخرین بازدید</li></ul>
        </div>

        <div className="brief-frequency" role="radiogroup" aria-label="بازهٔ بریف" data-testid="brief-frequency-group">
          <button type="button" role="radio" aria-checked={frequency === "daily"} data-testid="brief-frequency-daily" onClick={() => { setFrequency("daily"); setSaveError(""); }}>روزانه</button>
          <button type="button" role="radio" aria-checked={frequency === "weekly"} data-testid="brief-frequency-weekly" onClick={() => { setFrequency("weekly"); setSaveError(""); }}>هفتگی</button>
        </div>

        <div className="brief-fields">
          {frequency === "weekly" ? <label><span>روز دریافت</span><select value={weekday} onChange={(event) => { setWeekday(event.target.value); setSaveError(""); }} data-testid="brief-weekday-select"><option>شنبه</option><option>یکشنبه</option><option>دوشنبه</option><option>سه‌شنبه</option><option>چهارشنبه</option><option>پنجشنبه</option></select></label> : null}
          <label><span>ساعت دریافت</span><span className="time-field"><Clock3 size={17} /><KeyboardInput type="text" dir="ltr" inputMode="numeric" maxLength={5} value={time} onChange={(event) => { setTime(event.target.value); setSaveError(""); }} data-testid="brief-time-input" /></span></label>
        </div>

        <button className="primary-button" type="button" data-testid="brief-save-button" onClick={save}>ذخیرهٔ برنامهٔ بریف</button>
        {saveError ? <p className="brief-save-error" role="alert" data-testid="brief-save-error">{saveError}</p> : null}
        <button className="text-button" type="button" data-testid="brief-back-button" onClick={onClose}>بازگشت به چت</button>
      </div>
    </BottomSheet>
  );
}

function activeBriefLabel(frequency: BriefFrequency) {
  return frequency === "daily" ? "روزانه" : "هفتگی";
}

function ProjectsSheet({ sheet, projects, activeProjectId, onClose, onSelect, onCreate }: { sheet: SheetName; projects: BuilderProject[]; activeProjectId: string; onClose: () => void; onSelect: (projectId: string) => void; onCreate: () => void }) {
  return (
    <BottomSheet open={sheet === "projects"} onOpenChange={(open) => !open && onClose()} title="پروژه‌های من" description="زمینهٔ فعال تعیین می‌کند گفتگو و ابزارها به کدام پروژه متصل باشند." snap={0.46}>
      <div className="sheet-list" dir="rtl" data-testid="projects-sheet">
        {projects.map((project) => (
          <SheetRow
            key={project.id}
            icon={<Building2 size={20} />}
            title={project.name}
            description={projectMeta(project)}
            selected={activeProjectId === project.id}
            onClick={() => { onSelect(project.id); onClose(); }}
          />
        ))}
        <button className="projects-sheet-add" type="button" onClick={onCreate} data-testid="projects-sheet-add"><Plus size={19} /><span><strong>افزودن پروژهٔ جدید</strong><small>نام، محدودهٔ تهران و مرحلهٔ ساخت</small></span></button>
        <p className="projects-sheet-note"><ShieldCheck size={15} /> اطلاعات این فهرست فعلاً فقط در همین مرورگر نگه‌داری می‌شود.</p>
      </div>
    </BottomSheet>
  );
}

function ProjectCreateSheet({ sheet, onClose, onSave }: { sheet: SheetName; onClose: () => void; onSave: (draft: ProjectSetupDraft) => boolean }) {
  const keyboard = useKeyboard();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [stage, setStage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ProjectFieldErrors>({ name: "", location: "", stage: "" });
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    if (sheet !== "new-project") return;
    setName("");
    setLocation("");
    setStage("");
    setFieldErrors({ name: "", location: "", stage: "" });
    setStorageError("");
  }, [sheet]);

  const clearFieldError = (field: keyof ProjectSetupDraft) => {
    setFieldErrors((current) => current[field] ? { ...current, [field]: "" } : current);
    setStorageError("");
  };

  const submit = () => {
    const nextErrors = validateProjectDraft({ name, location, stage });
    setFieldErrors(nextErrors);
    const firstInvalidId = nextErrors.name
      ? "new-project-name"
      : nextErrors.location
        ? "new-project-location"
        : nextErrors.stage
          ? "new-project-stage"
          : "";
    if (firstInvalidId) {
      window.requestAnimationFrame(() => document.getElementById(firstInvalidId)?.focus());
      return;
    }

    keyboard.hide();
    if (!onSave({ name: name.trim(), location: normalizeProjectArea(location), stage })) {
      setStorageError("پروژه ذخیره نشد. فضای مرورگر را بررسی کن و دوباره تلاش کن؛ پروژهٔ فعلی تغییر نکرده است.");
      return;
    }
    onClose();
  };

  return (
    <BottomSheet open={sheet === "new-project"} onOpenChange={(open) => !open && onClose()} title="پروژهٔ جدید" description="فقط سه دادهٔ ضروری؛ جزئیات دیگر را بعداً در فضای پروژه کامل می‌کنی." snap={0.82}>
      <form className="new-project-sheet" dir="rtl" data-testid="new-project-sheet" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <label className="field-control" htmlFor="new-project-name">
          <span>نام پروژه</span>
          <KeyboardInput id="new-project-name" data-testid="new-project-name-input" value={name} maxLength={100} placeholder="مثلاً پروژه آفتاب" onChange={(event) => { setName(event.target.value); clearFieldError("name"); }} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "new-project-name-error" : undefined} />
          {fieldErrors.name ? <small className="field-error" id="new-project-name-error" data-testid="new-project-name-error">{fieldErrors.name}</small> : null}
        </label>

        <div className="project-city-lock" aria-label="شهر فعال: تهران"><span><small>شهر فعال</small><strong>تهران</strong></span><ShieldCheck size={18} aria-hidden="true" /></div>

        <label className="field-control" htmlFor="new-project-location">
          <span>محدودهٔ پروژه</span>
          <KeyboardInput id="new-project-location" data-testid="new-project-location-input" value={location} maxLength={120} placeholder="مثلاً منطقهٔ ۵ یا پونک" onChange={(event) => { setLocation(event.target.value); clearFieldError("location"); }} aria-invalid={Boolean(fieldErrors.location)} aria-describedby={fieldErrors.location ? "new-project-location-error" : "new-project-location-note"} />
          {fieldErrors.location ? <small className="field-error" id="new-project-location-error" data-testid="new-project-location-error">{fieldErrors.location}</small> : <small id="new-project-location-note">نشانی دقیق لازم نیست؛ فعلاً فقط تهران فعال است.</small>}
        </label>

        <div className="field-control">
          <span>مرحلهٔ ساخت</span>
          <ProjectChoiceMenu id="new-project-stage" testId="new-project-stage-select" value={stage} placeholder="مرحلهٔ ساخت را انتخاب کن" options={projectStages} ariaLabel="مرحلهٔ ساخت" invalid={Boolean(fieldErrors.stage)} describedBy={fieldErrors.stage ? "new-project-stage-error" : undefined} onChange={(nextStage) => { setStage(nextStage); clearFieldError("stage"); }} />
          {fieldErrors.stage ? <small className="field-error" id="new-project-stage-error" data-testid="new-project-stage-error">{fieldErrors.stage}</small> : null}
        </div>

        <p className="project-storage-note"><ShieldCheck size={15} /> پروژه پس از ذخیره، پروژهٔ فعال همین مرورگر می‌شود.</p>
        {storageError ? <p className="new-project-storage-error" role="alert" data-testid="new-project-storage-error">{storageError}</p> : null}
        <button className="primary-button" type="submit" data-testid="new-project-save">ساخت و ورود به پروژه</button>
      </form>
    </BottomSheet>
  );
}

function SettingsSheet({ sheet, projectName, projectCount, localRecordCount, briefSummary, modelMode, onClose }: { sheet: SheetName; projectName: string; projectCount: number; localRecordCount: number | null; briefSummary: string; modelMode: ModelMode; onClose: () => void }) {
  return (
    <BottomSheet open={sheet === "settings"} onOpenChange={(open) => !open && onClose()} title="پروفایل و تنظیمات" description="حساب، مصرف، حریم و ترجیحات واقعی این نمونه" snap={0.94}>
      <div className="settings-sheet" dir="rtl">
        <section className="settings-profile-card" data-testid="settings-profile-section">
          <img src="/chida/profile-builder-fictional.jpg" alt="تصویر نمایشی پروفایل سازنده" data-testid="settings-profile-image" />
          <span><small>حساب سازنده</small><strong>مهیار کلباسی</strong><em>تصویر نمایشی · پروفایل محلی</em></span>
          <HardHat size={20} aria-hidden="true" />
        </section>

        <section className="settings-section" data-testid="settings-usage-section">
          <div className="settings-section-heading"><Archive size={19} /><span><strong>مصرف و داده‌های محلی</strong><small>شمارش شفاف، بدون ساختن عدد مصرف مدل</small></span></div>
          <div className="settings-metrics"><span><strong>{projectCount.toLocaleString("fa-IR")} پروژه</strong><small>فضای ثبت‌شده</small></span><span data-testid="settings-local-record-count"><strong>{localRecordCount === null ? "—" : `${localRecordCount.toLocaleString("fa-IR")} رکورد`}</strong><small>{localRecordCount === null ? "شمارش کامل نشد" : `در ${projectName}`}</small></span></div>
          <p>توکن، هزینه و سهمیهٔ حساب هنوز به این نمونه متصل نیست؛ بنابراین مصرف واقعی نمایش داده نمی‌شود.</p>
        </section>

        <section className="settings-section" data-testid="settings-privacy-section">
          <div className="settings-section-heading"><ShieldCheck size={19} /><span><strong>حریم و نگه‌داری داده</strong><small>خصوصی و پروژه‌محور</small></span></div>
          <p>پروژه، کارها، حافظه و شناسنامهٔ فایل‌ها فعلاً فقط همین مرورگر را منبع می‌گیرند؛ sync و پشتیبان ابری ادعا نمی‌شود.</p>
        </section>

        <section className="settings-section" data-testid="settings-model-section">
          <div className="settings-section-heading"><Gauge size={19} /><span><strong>حالت پاسخ</strong><small>انتخاب فعلی: {modelMode}</small></span></div>
          <p>تغییر حالت از دکمهٔ Gauge کنار Composer انجام می‌شود؛ مدل پایه همچنان قابل‌تعویض می‌ماند.</p>
        </section>

        <section className="settings-section" data-testid="settings-brief-section">
          <div className="settings-section-heading"><Bell size={19} /><span><strong>اعلان و بریف</strong><small>{briefSummary}</small></span></div>
          <p>زمان‌بندی بریف فعلاً شبیه‌سازی مرورگر است؛ push، ایمیل یا اجرای پس‌زمینه متصل نیست.</p>
        </section>

        <section className="settings-section" data-testid="settings-appearance-section">
          <div className="settings-section-heading"><Palette size={19} /><span><strong>نمایش و دسترس‌پذیری</strong><small>Dark ثابت · فارسی و RTL</small></span></div>
          <p>نسخهٔ فعلی فقط Dark است؛ کلید نمایشیِ بی‌اثر برای تغییر تم ساخته نشده است.</p>
        </section>

        <section className="settings-section" data-testid="settings-version-section">
          <div className="settings-section-heading"><CircleHelp size={19} /><span><strong>راهنما و وضعیت نسخه</strong><small>نمونهٔ سازنده ۰.۱.۰</small></span></div>
          <p>داده‌ها محلی‌اند و قابلیت‌های backend، شبکهٔ واقعی، پرداخت، قرارداد و ارسال بیرونی هنوز جزو این build نیستند.</p>
        </section>
        <div className="role-lock-note"><ShieldCheck size={18} /><span>نقش این حساب «سازنده» است و قابل تغییر نیست.</span></div>
      </div>
    </BottomSheet>
  );
}
