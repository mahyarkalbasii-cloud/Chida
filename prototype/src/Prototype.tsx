import {
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
  MoreHorizontal,
  PackageCheck,
  Palette,
  PencilLine,
  Pin,
  Plus,
  Puzzle,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  Volume2,
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
type SheetName = "supplier" | "models" | "attach" | "tools" | "build" | "brief" | "projects" | "settings" | null;
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
type ProjectTaskEventType = "created" | "completed" | "reopened";
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
type ProjectTaskDraft = Pick<ProjectTaskRecord, "title" | "currentStep">;
type ProjectTaskFilter = "active" | "approval" | "completed" | "failed" | "monitor";
type PurchaseRequestStatus = "draft" | "ready-for-review";
type PurchaseRequestEventType = "created" | "updated" | "marked-ready-for-review" | "returned-to-draft";
type PurchaseRequestUnit = "عدد" | "کیلوگرم" | "تن" | "متر" | "مترمربع" | "مترمکعب" | "بسته" | "دستگاه";
type PurchaseRequestAlternatives = "unknown" | "allowed" | "not-allowed" | "approval-required";
type PurchaseRequestEvent = { id: string; type: PurchaseRequestEventType; actor: "شما"; at: string; version: number };
type ProjectPurchaseRequestRecord = {
  id: string;
  projectId: string;
  requestKind: "product";
  rawNeed: { text: string; source: "ثبت مستقیم شما"; capturedAt: string };
  item: {
    id: string;
    name: string | null;
    quantity: string | null;
    unit: PurchaseRequestUnit | null;
    brandOrGrade: string | null;
    specification: string | null;
    alternatives: PurchaseRequestAlternatives;
    source: "ثبت مستقیم شما";
    confidence: null;
  };
  delivery: { city: "تهران"; area: string; exactAddressShared: false; neededBy: string | null };
  unresolvedTerms: { transport: "unknown"; tax: "unknown"; paymentTerms: "unknown" };
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
type PurchaseRequestDraft = {
  rawNeed: string;
  itemName: string;
  quantity: string;
  unit: string;
  brandOrGrade: string;
  specification: string;
  alternatives: string;
  neededBy: string;
};
type PurchaseRequestFieldErrors = Pick<PurchaseRequestDraft, "rawNeed" | "itemName" | "quantity" | "brandOrGrade" | "specification" | "neededBy">;
type ProjectApprovalStatus = "pending" | "approved" | "changes-requested";
type ProjectApprovalEventType = "created" | "approved" | "changes-requested";
type PurchaseRequestApprovalShareableField = "item.name" | "item.quantity" | "item.unit" | "item.brandOrGrade" | "item.specification" | "delivery.neededBy" | "delivery.area";
type ProjectApprovalEvent = { id: string; type: ProjectApprovalEventType; actor: "شما"; at: string; version: number };
type ProjectApprovalRecord = {
  id: string;
  projectId: string;
  purpose: "review-purchase-request-version";
  target: { type: "purchase-request"; id: string; version: number; updatedAt: string };
  dedupeKey: string;
  snapshot: {
    rawNeed: string;
    item: ProjectPurchaseRequestRecord["item"];
    delivery: ProjectPurchaseRequestRecord["delivery"];
    unresolvedTerms: ProjectPurchaseRequestRecord["unresolvedTerms"];
    sharingStatus: "ارسال نشده";
  };
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
type HomeView = "chat" | "project" | "files" | "gallery" | "memory" | "search" | "tasks" | "source-demo" | "purchase-requests";
type FilesReturnView = "chat" | "project" | "search";
type MemoryReturnView = "project" | "search";
type PurchaseRequestsReturnView = "chat" | "project";
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
const emptyPurchaseRequestDraft: PurchaseRequestDraft = {
  rawNeed: "",
  itemName: "",
  quantity: "",
  unit: "",
  brandOrGrade: "",
  specification: "",
  alternatives: "نامشخص",
  neededBy: "",
};
const emptyPurchaseRequestFieldErrors: PurchaseRequestFieldErrors = {
  rawNeed: "",
  itemName: "",
  quantity: "",
  brandOrGrade: "",
  specification: "",
  neededBy: "",
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
    rawNeed: request.rawNeed.text,
    itemName: request.item.name ?? "",
    quantity: request.item.quantity ?? "",
    unit: request.item.unit ?? "",
    brandOrGrade: request.item.brandOrGrade ?? "",
    specification: request.item.specification ?? "",
    alternatives: purchaseRequestAlternativesLabel(request.item.alternatives),
    neededBy: request.delivery.neededBy ?? "",
  };
}

function purchaseRequestMissingFields(request: ProjectPurchaseRequestRecord) {
  const missingFields: string[] = [];
  if (!request.item.name) missingFields.push("نام قلم");
  if (!request.item.quantity) missingFields.push("مقدار");
  if (!request.item.unit) missingFields.push("واحد");
  if (!request.delivery.area) missingFields.push("محدودهٔ تحویل");
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
  return request.item.name ?? request.rawNeed.text;
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

function purchaseRequestApprovalShareableFields(request: ProjectPurchaseRequestRecord): PurchaseRequestApprovalShareableField[] {
  return [
    "item.name",
    "item.quantity",
    "item.unit",
    ...(request.item.brandOrGrade ? ["item.brandOrGrade" as const] : []),
    ...(request.item.specification ? ["item.specification" as const] : []),
    ...(request.delivery.neededBy ? ["delivery.neededBy" as const] : []),
    "delivery.area",
  ];
}

function purchaseRequestApprovalSnapshot(request: ProjectPurchaseRequestRecord): ProjectApprovalRecord["snapshot"] {
  return {
    rawNeed: request.rawNeed.text,
    item: { ...request.item },
    delivery: { ...request.delivery },
    unresolvedTerms: { ...request.unresolvedTerms },
    sharingStatus: "ارسال نشده",
  };
}

function approvalSnapshotMatchesRequest(approval: ProjectApprovalRecord, request: ProjectPurchaseRequestRecord) {
  return approval.target.updatedAt === request.updatedAt
    && approval.target.version === request.version
    && JSON.stringify(approval.snapshot) === JSON.stringify(purchaseRequestApprovalSnapshot(request))
    && JSON.stringify(approval.privacySnapshot.shareableFields) === JSON.stringify(purchaseRequestApprovalShareableFields(request));
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
          || (event?.type !== "created" && event?.type !== "completed" && event?.type !== "reopened")
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
        && history.every((event, index) => event.version === index + 1 && (index === 0 ? event.type === "created" : event.type === (index % 2 === 1 ? "completed" : "reopened")))
        && history.every((event, index) => index === 0 || new Date(event.at).getTime() >= new Date(history[index - 1].at).getTime())
        && history[0]?.at === createdAt
        && history[history.length - 1]?.at === updatedAt;
      const completedStateIsValid = task?.status === "completed"
        ? typeof completedAt === "string" && completedAt === updatedAt && isValidProjectFileDate(completedAt) && history[history.length - 1]?.type === "completed"
        : task?.status === "in-progress" && completedAt === null && (history[history.length - 1]?.type === "created" || history[history.length - 1]?.type === "reopened");

      if (
        !id
        || seenTaskIds.has(id)
        || !projectId
        || !hasVisibleProjectTaskText(title)
        || title.length > 80
        || !hasVisibleProjectTaskText(currentStep)
        || currentStep.length > 300
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

function readStoredProjectPurchaseRequests(): LocalRecordsReadResult<ProjectPurchaseRequestRecord> {
  try {
    const rawRequests = window.localStorage.getItem(projectPurchaseRequestsStorageKey);
    if (rawRequests === null) return { records: [], readError: false };
    const parsed = JSON.parse(rawRequests);
    if (!Array.isArray(parsed)) return { records: [], readError: true };

    const seenRequestIds = new Set<string>();
    let readError = false;
    const records = parsed.flatMap((request): ProjectPurchaseRequestRecord[] => {
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
      return [{
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
      }];
    });
    return { records, readError };
  } catch {
    return { records: [], readError: true };
  }
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

      const record = {
        id,
        projectId,
        purpose: "review-purchase-request-version",
        target: { type: "purchase-request", id: targetId, version: targetVersion, updatedAt: targetUpdatedAt },
        dedupeKey,
        snapshot: {
          rawNeed,
          item: {
            id: itemId,
            name: itemName,
            quantity,
            unit: unit as PurchaseRequestUnit,
            brandOrGrade,
            specification,
            alternatives: approval?.snapshot?.item?.alternatives as PurchaseRequestAlternatives,
            source: "ثبت مستقیم شما",
            confidence: null,
          },
          delivery: { city: "تهران", area: deliveryArea, exactAddressShared: false, neededBy },
          unresolvedTerms: { transport: "unknown", tax: "unknown", paymentTerms: "unknown" },
          sharingStatus: "ارسال نشده",
        },
        privacySnapshot: {
          shareableFields,
          projectNameShared: false,
          exactAddressShared: false,
          budgetShared: false,
          filesShared: false,
          memoryShared: false,
        },
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
      } satisfies ProjectApprovalRecord;
      const targetRequest = purchaseRequests.records.find((request) => request.id === targetId && request.projectId === projectId);
      const targetReadyEvent = Number.isInteger(targetVersion) ? targetRequest?.history[targetVersion - 1] : undefined;
      const targetRelationIsValid = Boolean(targetRequest)
        && targetRequest!.version >= targetVersion
        && targetReadyEvent?.type === "marked-ready-for-review"
        && targetReadyEvent.at === targetUpdatedAt
        && (targetRequest!.version !== targetVersion || approvalSnapshotMatchesRequest(record, targetRequest!))
        && (status !== "pending" || (targetRequest!.version === targetVersion && targetRequest!.status === "ready-for-review"));

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

      seenApprovalIds.add(id);
      seenDedupeKeys.add(dedupeKey);
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

function BuilderHome({ activeProject, projects, modelMode, onProjectChange, onProjectUpdate, onModelChange, onOpenSheet, sheet }: { activeProject: BuilderProject; projects: BuilderProject[]; modelMode: ModelMode; onProjectChange: (projectId: string) => void; onProjectUpdate: (projectId: string, draft: ProjectProfileDraft) => void; onModelChange: (mode: ModelMode) => void; onOpenSheet: (sheet: SheetName) => void; sheet: SheetName }) {
  const keyboard = useKeyboard();
  const { bottomInset } = useKeyboardInsets();
  const homeRef = useRef<HTMLDivElement>(null);
  const projectWorkspaceScrollPositions = useRef(new Map<string, number>());
  const pendingPurchaseRequestsReturnFocus = useRef<PurchaseRequestsReturnView | null>(null);
  const [view, setView] = useState<HomeView>("chat");
  const [filesReturnView, setFilesReturnView] = useState<FilesReturnView>("project");
  const [memoryReturnView, setMemoryReturnView] = useState<MemoryReturnView>("project");
  const [purchaseRequestsReturnView, setPurchaseRequestsReturnView] = useState<PurchaseRequestsReturnView>("chat");
  const [startPurchaseRequestEditor, setStartPurchaseRequestEditor] = useState(false);
  const [initialPurchaseRequestId, setInitialPurchaseRequestId] = useState<string | null>(null);
  const [projectTasksLaunch, setProjectTasksLaunch] = useState<ProjectTasksLaunch>({ filter: "active", approvalId: null, returnToPurchaseRequestId: null });
  const [focusedFileId, setFocusedFileId] = useState<string | null>(null);
  const [focusedMemoryId, setFocusedMemoryId] = useState<string | null>(null);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [initialProjectFiles] = useState<LocalRecordsReadResult<ProjectFileRecord>>(readStoredProjectFiles);
  const [initialProjectMemories] = useState<LocalRecordsReadResult<ProjectMemoryRecord>>(readStoredProjectMemories);
  const [initialProjectTasks] = useState<LocalRecordsReadResult<ProjectTaskRecord>>(readStoredProjectTasks);
  const [initialProjectPurchaseRequests] = useState<LocalRecordsReadResult<ProjectPurchaseRequestRecord>>(readStoredProjectPurchaseRequests);
  const [initialProjectApprovals] = useState<LocalRecordsReadResult<ProjectApprovalRecord>>(() => readStoredProjectApprovals(initialProjectPurchaseRequests));
  const [projectFiles, setProjectFiles] = useState<ProjectFileRecord[]>(initialProjectFiles.records);
  const [projectMemories, setProjectMemories] = useState<ProjectMemoryRecord[]>(initialProjectMemories.records);
  const [projectTasks, setProjectTasks] = useState<ProjectTaskRecord[]>(initialProjectTasks.records);
  const [projectPurchaseRequests, setProjectPurchaseRequests] = useState<ProjectPurchaseRequestRecord[]>(initialProjectPurchaseRequests.records);
  const [projectApprovals, setProjectApprovals] = useState<ProjectApprovalRecord[]>(initialProjectApprovals.records);
  const [projectFilesReadError] = useState(initialProjectFiles.readError);
  const [projectMemoriesReadError] = useState(initialProjectMemories.readError);
  const [projectTasksReadError] = useState(initialProjectTasks.readError);
  const [projectPurchaseRequestsReadError] = useState(initialProjectPurchaseRequests.readError);
  const [projectApprovalsReadError] = useState(initialProjectApprovals.readError);
  const [installedTool, setInstalledTool] = useState(() => readLocalStorageValue(installedToolStorageKey) ?? "");
  const [briefSchedule, setBriefSchedule] = useState<BriefSchedule | null>(() => {
    try {
      const stored = window.localStorage.getItem(briefStorageKey);
      return stored ? JSON.parse(stored) as BriefSchedule : null;
    } catch {
      return null;
    }
  });

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
    const rail = homeRef.current?.querySelector<HTMLElement>(".quick-actions");
    if (!rail) return;
    const content = rail.firstElementChild;
    const alignToRtlStart = () => {
      rail.scrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
    };
    alignToRtlStart();
    const observer = new ResizeObserver(alignToRtlStart);
    observer.observe(rail);
    if (content) observer.observe(content);
    return () => observer.disconnect();
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
    setBriefSchedule(schedule);
    window.localStorage.setItem(briefStorageKey, JSON.stringify(schedule));
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    const nextId = Date.now();
    setMessages((current) => [...current, { id: nextId, role: "user", text }, { id: nextId + 1, role: "assistant", text: `برای «${activeProject.name}» گرفتم. در نسخهٔ بعد این درخواست به منابع پروژه و ابزارهای تخصصی چیدا متصل می‌شود.` }]);
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
    const normalizedQuantity = requestDraft.quantity ? normalizeProjectNumber(requestDraft.quantity, false) : "";
    if (normalizedQuantity === null || (normalizedQuantity && Number(normalizedQuantity) <= 0)) return null;
    const timestamp = new Date().toISOString();
    const requestId = `purchase-request-${window.crypto.randomUUID()}`;
    const record = {
      id: requestId,
      projectId: activeProject.id,
      requestKind: "product",
      rawNeed: { text: rawNeed, source: "ثبت مستقیم شما", capturedAt: timestamp },
      item: {
        id: `purchase-item-${window.crypto.randomUUID()}`,
        name: normalizeOptionalPurchaseRequestText(requestDraft.itemName),
        quantity: normalizedQuantity || null,
        unit: purchaseRequestUnits.includes(requestDraft.unit as PurchaseRequestUnit) ? requestDraft.unit as PurchaseRequestUnit : null,
        brandOrGrade: normalizeOptionalPurchaseRequestText(requestDraft.brandOrGrade),
        specification: normalizeOptionalPurchaseRequestText(requestDraft.specification),
        alternatives: purchaseRequestAlternativesFromLabel(requestDraft.alternatives),
        source: "ثبت مستقیم شما",
        confidence: null,
      },
      delivery: {
        city: "تهران",
        area: normalizeProjectArea(activeProject.location),
        exactAddressShared: false,
        neededBy: normalizeOptionalPurchaseRequestText(requestDraft.neededBy),
      },
      unresolvedTerms: { transport: "unknown", tax: "unknown", paymentTerms: "unknown" },
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      sharingStatus: "ارسال نشده",
      status: "draft",
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      readyAt: null,
      history: [{ id: `purchase-event-${window.crypto.randomUUID()}`, type: "created", actor: "شما", at: timestamp, version: 1 }],
    } satisfies ProjectPurchaseRequestRecord;
    return persistProjectPurchaseRequests([...projectPurchaseRequests, record]) ? requestId : null;
  };

  const updateProjectPurchaseRequest = (requestId: string, requestDraft: PurchaseRequestDraft) => {
    const rawNeed = requestDraft.rawNeed.trim();
    if (!hasVisibleProjectTaskText(rawNeed)) return false;
    const normalizedQuantity = requestDraft.quantity ? normalizeProjectNumber(requestDraft.quantity, false) : "";
    if (normalizedQuantity === null || (normalizedQuantity && Number(normalizedQuantity) <= 0)) return false;
    const timestamp = new Date().toISOString();
    let updated = false;
    const nextRequests = projectPurchaseRequests.map((request) => {
      if (request.id !== requestId || request.projectId !== activeProject.id || request.status !== "draft") return request;
      updated = true;
      const version = request.version + 1;
      return {
        ...request,
        rawNeed: { ...request.rawNeed, text: rawNeed },
        item: {
          ...request.item,
          name: normalizeOptionalPurchaseRequestText(requestDraft.itemName),
          quantity: normalizedQuantity || null,
          unit: purchaseRequestUnits.includes(requestDraft.unit as PurchaseRequestUnit) ? requestDraft.unit as PurchaseRequestUnit : null,
          brandOrGrade: normalizeOptionalPurchaseRequestText(requestDraft.brandOrGrade),
          specification: normalizeOptionalPurchaseRequestText(requestDraft.specification),
          alternatives: purchaseRequestAlternativesFromLabel(requestDraft.alternatives),
        },
        delivery: { ...request.delivery, area: normalizeProjectArea(activeProject.location), neededBy: normalizeOptionalPurchaseRequestText(requestDraft.neededBy) },
        version,
        updatedAt: timestamp,
        history: [...request.history, { id: `purchase-event-${window.crypto.randomUUID()}`, type: "updated", actor: "شما", at: timestamp, version }],
      } satisfies ProjectPurchaseRequestRecord;
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
      return {
        ...request,
        status: "ready-for-review",
        version,
        updatedAt: timestamp,
        readyAt: timestamp,
        history: [...request.history, { id: `purchase-event-${window.crypto.randomUUID()}`, type: "marked-ready-for-review", actor: "شما", at: timestamp, version }],
      } satisfies ProjectPurchaseRequestRecord;
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
    const timestamp = new Date().toISOString();
    const approvalId = `approval-${window.crypto.randomUUID()}`;
    const record = {
      id: approvalId,
      projectId: activeProject.id,
      purpose: "review-purchase-request-version",
      target: { type: "purchase-request", id: request.id, version: request.version, updatedAt: request.updatedAt },
      dedupeKey,
      snapshot: purchaseRequestApprovalSnapshot(request),
      privacySnapshot: {
        shareableFields: purchaseRequestApprovalShareableFields(request),
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
      if (!targetRequest || targetRequest.status !== "ready-for-review" || !approvalSnapshotMatchesRequest(approval, targetRequest)) return approval;
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
        filesReadError={projectFilesReadError}
        memoriesReadError={projectMemoriesReadError}
        purchaseRequestsReadError={projectPurchaseRequestsReadError}
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
        storageLocked={projectPurchaseRequestsReadError}
        approvalsStorageLocked={projectApprovalsReadError || projectPurchaseRequestsReadError}
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
    <div ref={homeRef} className="chida-app chida-shell" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="builder-home">
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
            <button className="quick-chip" type="button" key={id} onClick={() => { if (id === "purchase-request") openProjectPurchaseRequests("chat", true); else setDraft(label); }} data-testid={`quick-action-${id}`}>
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
                <button type="button" onClick={() => { setDrawerOpen(false); onOpenSheet("projects"); }}><Folder size={19} /><span>پروژه‌ها</span><span className="nav-count" data-testid="drawer-project-count">{projects.length.toLocaleString("fa-IR")}</span></button>
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
                <span className="drawer-avatar" aria-hidden="true">م</span><span className="drawer-profile-copy"><strong>مهیار کلباسی</strong><small>حساب سازنده</small></span><Settings size={18} />
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
      <ProjectsSheet sheet={sheet} projects={projects} activeProjectId={activeProject.id} onClose={() => onOpenSheet(null)} onSelect={openProjectSpace} />
      <SettingsSheet sheet={sheet} onClose={() => onOpenSheet(null)} />
      <span className="sr-only" aria-live="polite">{activeProjectMeta}</span>
    </div>
  );
}

function ProjectWorkspace({ project, fileCount, imageCount, memoryCount, purchaseRequestCount, filesReadError, memoriesReadError, purchaseRequestsReadError, initialScrollTop, onBack, onContinue, onOpenFiles, onOpenGallery, onOpenMemory, onOpenPurchaseRequests, onUpdate }: { project: BuilderProject; fileCount: number; imageCount: number; memoryCount: number; purchaseRequestCount: number; filesReadError: boolean; memoriesReadError: boolean; purchaseRequestsReadError: boolean; initialScrollTop: number; onBack: () => void; onContinue: () => void; onOpenFiles: () => void; onOpenGallery: () => void; onOpenMemory: () => void; onOpenPurchaseRequests: () => void; onUpdate: (draft: ProjectProfileDraft) => void }) {
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

function ProjectPurchaseRequestsView({ project, requests, approvals, storageLocked, approvalsStorageLocked, initialSelectedId, startWithEditor, backLabel, onBack, onCreate, onUpdate, onMarkReady, onReturnToDraft, onCreateApproval, onOpenApproval }: { project: BuilderProject; requests: ProjectPurchaseRequestRecord[]; approvals: ProjectApprovalRecord[]; storageLocked: boolean; approvalsStorageLocked: boolean; initialSelectedId: string | null; startWithEditor: boolean; backLabel: string; onBack: () => void; onCreate: (draft: PurchaseRequestDraft) => string | null; onUpdate: (requestId: string, draft: PurchaseRequestDraft) => boolean; onMarkReady: (requestId: string) => boolean; onReturnToDraft: (requestId: string) => boolean; onCreateApproval: (requestId: string) => string | null; onOpenApproval: (approvalId: string, returnToPurchaseRequestId: string | null) => void }) {
  const keyboard = useKeyboard();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const approvalButtonRef = useRef<HTMLButtonElement>(null);
  const detailHeadingRef = useRef<HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [editorOpen, setEditorOpen] = useState(() => startWithEditor && !storageLocked);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [requestDraft, setRequestDraft] = useState<PurchaseRequestDraft>(emptyPurchaseRequestDraft);
  const [fieldErrors, setFieldErrors] = useState<PurchaseRequestFieldErrors>(emptyPurchaseRequestFieldErrors);
  const [storageError, setStorageError] = useState("");
  const selectedRequest = selectedId ? requests.find((request) => request.id === selectedId) ?? null : null;
  const selectedRequestApproval = selectedRequest
    ? approvals.find((approval) => approval.target.id === selectedRequest.id && approval.target.version === selectedRequest.version) ?? null
    : null;
  const orderedRequests = useMemo(
    () => [...requests].sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()),
    [requests],
  );
  const missingFields = selectedRequest ? purchaseRequestMissingFields(selectedRequest) : [];

  useEffect(() => {
    if (selectedId && !selectedRequest) setSelectedId(null);
  }, [selectedId, selectedRequest]);

  useLayoutEffect(() => {
    if (!initialSelectedId || selectedRequest?.id !== initialSelectedId) return;
    window.requestAnimationFrame(() => approvalButtonRef.current?.focus());
  }, [initialSelectedId, selectedRequest?.id]);

  const openCreateEditor = () => {
    setEditingId(null);
    setRequestDraft(emptyPurchaseRequestDraft);
    setFieldErrors(emptyPurchaseRequestFieldErrors);
    setStorageError("");
    setEditorOpen(true);
  };

  const openEditEditor = (request: ProjectPurchaseRequestRecord) => {
    if (request.status !== "draft") return;
    setEditingId(request.id);
    setRequestDraft(purchaseRequestDraftFromRecord(request));
    setFieldErrors(emptyPurchaseRequestFieldErrors);
    setStorageError("");
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

  const changeDraft = (field: keyof PurchaseRequestDraft, value: string) => {
    setRequestDraft((current) => ({ ...current, [field]: value }));
    if (field in fieldErrors) {
      const errorField = field as keyof PurchaseRequestFieldErrors;
      setFieldErrors((current) => current[errorField] ? { ...current, [errorField]: "" } : current);
    }
    setStorageError("");
  };

  const saveRequest = () => {
    const rawNeed = requestDraft.rawNeed.trim();
    const normalizedQuantity = requestDraft.quantity.trim() ? normalizeProjectNumber(requestDraft.quantity, false) : "";
    const nextErrors = {
      ...emptyPurchaseRequestFieldErrors,
      rawNeed: hasVisibleProjectTaskText(rawNeed) ? "" : "نیازت را بنویس تا یک پیش‌نویس محلی ساخته شود.",
      quantity: normalizedQuantity === null || (normalizedQuantity && Number(normalizedQuantity) <= 0) ? "مقدار باید یک عدد بیشتر از صفر باشد." : "",
    } satisfies PurchaseRequestFieldErrors;
    setFieldErrors(nextErrors);
    if (nextErrors.rawNeed || nextErrors.quantity) {
      const invalidId = nextErrors.rawNeed ? "purchase-request-raw" : "purchase-request-quantity";
      window.requestAnimationFrame(() => document.getElementById(invalidId)?.focus());
      return;
    }

    const normalizedDraft = { ...requestDraft, rawNeed, quantity: normalizedQuantity ?? "" };
    keyboard.hide();
    if (editingId) {
      if (!onUpdate(editingId, normalizedDraft)) {
        setStorageError("ویرایش پیش‌نویس ذخیره نشد. فضای مرورگر را بررسی کن و دوباره تلاش کن.");
        return;
      }
      setEditorOpen(false);
      setEditingId(null);
      window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
      return;
    }

    const requestId = onCreate(normalizedDraft);
    if (!requestId) {
      setStorageError("پیش‌نویس ذخیره نشد. فضای مرورگر را بررسی کن و دوباره تلاش کن.");
      return;
    }
    setSelectedId(requestId);
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
    window.requestAnimationFrame(() => {
      if (!requestId) return;
      document.querySelector<HTMLElement>(`[data-request-id="${requestId}"]`)?.focus();
    });
  };

  const editorSheet = (
    <BottomSheet key={editingId ? `purchase-editor-${editingId}` : "purchase-editor-create"} open={editorOpen} onOpenChange={(open) => { if (!open) closeEditor(); }} title={editingId ? "ویرایش پیش‌نویس" : "پیش‌نویس درخواست خرید"} description={`یک نیاز تک‌قلمی برای ${project.name} ثبت کن؛ هیچ ارسالی انجام نمی‌شود.`} snap={0.94}>
      <form className="purchase-request-editor-sheet" dir="rtl" data-testid="purchase-request-editor-sheet" onSubmit={(event) => { event.preventDefault(); saveRequest(); }}>
        <label className="field-control" htmlFor="purchase-request-raw">
          <span>نیاز اولیه</span>
          <KeyboardTextarea id="purchase-request-raw" data-testid="purchase-request-raw-input" value={requestDraft.rawNeed} maxLength={800} rows={4} placeholder="مثلاً ۲۰ تن سیمان تیپ ۲ برای هفتهٔ آینده لازم داریم" onChange={(event) => changeDraft("rawNeed", event.target.value)} aria-invalid={Boolean(fieldErrors.rawNeed)} aria-describedby={fieldErrors.rawNeed ? "purchase-request-raw-error" : "purchase-request-raw-note"} />
          {fieldErrors.rawNeed ? <small className="field-error" id="purchase-request-raw-error" data-testid="purchase-request-raw-error">{fieldErrors.rawNeed}</small> : <small id="purchase-request-raw-note">متن دقیق خودت ثبت می‌شود؛ این نسخه استخراج هوشمند ندارد.</small>}
        </label>

        <div className="purchase-request-form-section"><strong>شناسنامهٔ قلم</strong><small>اختیاری در پیش‌نویس</small></div>
        <label className="field-control" htmlFor="purchase-request-item">
          <span>نام قلم</span>
          <KeyboardInput id="purchase-request-item" data-testid="purchase-request-item-input" value={requestDraft.itemName} maxLength={100} placeholder="مثلاً سیمان تیپ ۲" onChange={(event) => changeDraft("itemName", event.target.value)} />
        </label>

        <div className="purchase-request-field-grid">
          <label className="field-control" htmlFor="purchase-request-quantity">
            <span>مقدار</span>
            <KeyboardInput id="purchase-request-quantity" data-testid="purchase-request-quantity-input" value={requestDraft.quantity} inputMode="decimal" dir="ltr" placeholder="مثلاً ۲۰٫۵" onChange={(event) => changeDraft("quantity", event.target.value)} aria-invalid={Boolean(fieldErrors.quantity)} aria-describedby={fieldErrors.quantity ? "purchase-request-quantity-error" : undefined} />
            {fieldErrors.quantity ? <small className="field-error" id="purchase-request-quantity-error">{fieldErrors.quantity}</small> : null}
          </label>
          <div className="field-control">
            <span>واحد</span>
            <ProjectChoiceMenu id="purchase-request-unit" testId="purchase-request-unit-select" value={requestDraft.unit} placeholder="انتخاب واحد" options={purchaseRequestUnits} ariaLabel="واحد قلم" onChange={(value) => changeDraft("unit", value)} />
          </div>
        </div>

        <label className="field-control" htmlFor="purchase-request-brand">
          <span>برند یا گرید</span>
          <KeyboardInput id="purchase-request-brand" data-testid="purchase-request-brand-input" value={requestDraft.brandOrGrade} maxLength={100} placeholder="اختیاری" onChange={(event) => changeDraft("brandOrGrade", event.target.value)} />
        </label>

        <label className="field-control" htmlFor="purchase-request-specification">
          <span>مشخصات تکمیلی</span>
          <KeyboardTextarea id="purchase-request-specification" data-testid="purchase-request-specification-input" value={requestDraft.specification} maxLength={500} rows={3} placeholder="کیفیت، بسته‌بندی یا الزام فنی موردنظر" onChange={(event) => changeDraft("specification", event.target.value)} />
        </label>

        <div className="field-control">
          <span>پذیرش جایگزین</span>
          <ProjectChoiceMenu id="purchase-request-alternatives" testId="purchase-request-alternatives-select" value={requestDraft.alternatives} placeholder="وضعیت جایگزین" options={purchaseRequestAlternativeLabels} ariaLabel="پذیرش کالای جایگزین" onChange={(value) => changeDraft("alternatives", value)} />
        </div>

        <label className="field-control" htmlFor="purchase-request-needed-by">
          <span>زمان موردنیاز</span>
          <KeyboardInput id="purchase-request-needed-by" data-testid="purchase-request-needed-by-input" value={requestDraft.neededBy} maxLength={80} placeholder="مثلاً تا ۱۰ شهریور" onChange={(event) => changeDraft("neededBy", event.target.value)} />
        </label>

        <dl className="purchase-request-meta">
          <div><dt>پروژهٔ مالک</dt><dd>{project.name}</dd></div>
          <div><dt>محدودهٔ تحویل</dt><dd>تهران · {normalizeProjectArea(project.location)}</dd></div>
          <div><dt>دسترسی</dt><dd>خصوصی پروژه</dd></div>
          <div><dt>وضعیت نخست</dt><dd>پیش‌نویس · نسخهٔ ۱</dd></div>
        </dl>
        <p className="purchase-request-boundary"><ShieldCheck size={16} /><span>ثبت این فرم فقط یک پیش‌نویس محلی می‌سازد؛ هیچ تأیید، انتخاب تأمین‌کننده، قیمت یا ارسال بیرونی ایجاد نمی‌شود.</span></p>
        {storageError ? <p className="purchase-request-storage-error" role="alert" data-testid="purchase-request-storage-error">{storageError}</p> : null}
        <button className="primary-button" type="submit" data-testid="purchase-request-save">{editingId ? "ذخیرهٔ نسخهٔ جدید" : "ثبت پیش‌نویس محلی"}</button>
      </form>
    </BottomSheet>
  );

  if (selectedRequest) {
    return (
      <div className="chida-app project-purchase-request-detail-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-purchase-request-detail-view">
        <header className="project-workspace-header">
          <button className="icon-button" type="button" onClick={returnToList} aria-label="بازگشت به درخواست‌های خرید" data-testid="purchase-request-detail-back"><ArrowRight size={21} /></button>
          <span className="project-workspace-title"><small>جزئیات درخواست خرید</small><strong>{project.name}</strong></span>
          <span className="project-workspace-header-spacer" aria-hidden="true" />
        </header>

        <MobileScroll className="project-purchase-request-detail-scroll">
          <main className="project-purchase-request-detail-content">
            <section ref={detailHeadingRef} className="purchase-request-detail-heading" tabIndex={-1} aria-live="polite" data-testid="purchase-request-detail-heading">
              <span><ShoppingCart size={24} strokeWidth={1.65} /></span>
              <div><small>{purchaseRequestStatusLabel(selectedRequest.status)} · نسخهٔ {selectedRequest.version.toLocaleString("fa-IR")}</small><h1>{purchaseRequestDisplayTitle(selectedRequest)}</h1><p>{selectedRequest.rawNeed.text}</p></div>
            </section>

            <dl className="purchase-request-meta">
              <div><dt>نام قلم</dt><dd>{selectedRequest.item.name ?? "ثبت نشده"}</dd></div>
              <div><dt>مقدار و واحد</dt><dd>{selectedRequest.item.quantity && selectedRequest.item.unit ? `${Number(selectedRequest.item.quantity).toLocaleString("fa-IR", { maximumFractionDigits: 6 })} ${selectedRequest.item.unit}` : "ثبت نشده"}</dd></div>
              <div><dt>برند یا گرید</dt><dd>{selectedRequest.item.brandOrGrade ?? "نامشخص"}</dd></div>
              <div><dt>مشخصات</dt><dd>{selectedRequest.item.specification ?? "نامشخص"}</dd></div>
              <div><dt>جایگزین</dt><dd>{purchaseRequestAlternativesLabel(selectedRequest.item.alternatives)}</dd></div>
              <div><dt>زمان موردنیاز</dt><dd>{selectedRequest.delivery.neededBy ?? "نامشخص"}</dd></div>
              <div><dt>تحویل</dt><dd>تهران · {selectedRequest.delivery.area}</dd></div>
              <div><dt>ثبت و اشتراک</dt><dd>{selectedRequest.localStatus} · {selectedRequest.sharingStatus}</dd></div>
            </dl>

            {missingFields.length > 0 ? (
              <section className="purchase-request-missing" id="purchase-request-missing-fields" data-testid="purchase-request-missing-fields">
                <div><CircleHelp size={17} /><strong>برای آماده‌کردن بازبینی تکمیل کن</strong></div>
                <ul>{missingFields.map((field) => <li key={field}>{field}</li>)}</ul>
              </section>
            ) : null}

            <section className="purchase-request-terms" aria-labelledby="purchase-request-terms-title">
              <div className="purchase-request-section-title"><strong id="purchase-request-terms-title">شرایط هنوز نامشخص</strong><span>۳</span></div>
              <dl><div><dt>حمل</dt><dd>نامشخص</dd></div><div><dt>مالیات</dt><dd>نامشخص</dd></div><div><dt>شرایط پرداخت</dt><dd>نامشخص</dd></div></dl>
            </section>

            <aside className="purchase-request-privacy">
              <div><ShieldCheck size={18} /><span><strong>پیش‌نمایش حریم داده</strong><small>هیچ داده‌ای در این تسک ارسال نمی‌شود.</small></span></div>
              <dl><div><dt>قابل‌اشتراک در آینده</dt><dd>قلم، مقدار، مشخصات ثبت‌شده و محدودهٔ تقریبی تهران</dd></div><div><dt>خصوصی می‌ماند</dt><dd>نام پروژه، حافظه، فایل‌ها، بودجه و آدرس دقیق</dd></div></dl>
            </aside>

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

            <section className="purchase-request-history" aria-label="تاریخچهٔ نسخه‌های درخواست">
              <div className="purchase-request-section-title"><strong>تاریخچه</strong><span>{selectedRequest.history.length.toLocaleString("fa-IR")}</span></div>
              <ol>{[...selectedRequest.history].reverse().map((event) => <li key={event.id} data-testid="purchase-request-history-event"><span><Check size={14} /></span><div><strong>{purchaseRequestEventLabel(event.type)}</strong><small>توسط {event.actor} · نسخهٔ {event.version.toLocaleString("fa-IR")} · {formatProjectFileDate(event.at)}</small></div></li>)}</ol>
            </section>

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
        <span className="project-workspace-title"><small>خرید پروژه</small><strong>{project.name}</strong></span>
        <span className="project-workspace-header-spacer" aria-hidden="true" />
      </header>

      <MobileScroll className="project-purchase-requests-scroll">
        <main className="project-purchase-requests-content">
          <section className="project-purchase-requests-heading">
            <span className="project-purchase-requests-mark"><ShoppingCart size={24} strokeWidth={1.65} /></span>
            <div><span className="eyebrow">نیاز تک‌قلمی پروژه</span><h1>درخواست‌های خرید {project.name}</h1><p>از نیاز خام تا نسخه و بازبینی داخلی؛ پیش از انتخاب مقصد یا هر ارسال</p></div>
          </section>

          <button ref={addButtonRef} className="primary-button purchase-request-add" type="button" onClick={openCreateEditor} disabled={storageLocked} data-testid="purchase-request-add"><Plus size={18} /> پیش‌نویس جدید</button>

          {storageLocked ? <p className="project-storage-recovery-alert" role="alert" data-testid="purchase-request-read-error"><ShieldCheck size={17} /><span><strong>درخواست‌های محلی کامل خوانده نشد.</strong> برای جلوگیری از بازنویسی داده‌های قبلی، ثبت و تغییر وضعیت تا بارگذاری موفق بعدی غیرفعال است.</span></p> : null}

          <aside className="purchase-request-boundary"><ShieldCheck size={17} /><span><strong>رکورد خصوصی و محلی</strong> تأیید داخلی هر نسخه ممکن است، اما AI، تأمین‌کننده، قیمت، مجوز ارسال و ارسال بیرونی هنوز وصل نیست. شرایط حمل، مالیات و پرداخت نیز تا ثبت واقعی نامشخص می‌مانند.</span></aside>

          {storageLocked ? null : orderedRequests.length === 0 ? (
            <section className="purchase-request-empty" data-testid="purchase-request-empty"><span><ShoppingCart size={25} strokeWidth={1.65} /></span><h2>هنوز درخواست خریدی ثبت نشده</h2><p>نیازت را دستی ثبت کن تا یک پیش‌نویس تک‌قلمی برای همین پروژه بسازی.</p></section>
          ) : (
            <section className="purchase-request-list" aria-label="درخواست‌های ثبت‌شدهٔ پروژه">
              <div className="purchase-request-section-title"><strong>درخواست‌های ثبت‌شده</strong><span>{orderedRequests.length.toLocaleString("fa-IR")}</span></div>
              {orderedRequests.map((request) => <button className="purchase-request-card" type="button" key={request.id} data-request-id={request.id} onClick={() => { setStorageError(""); setSelectedId(request.id); }} data-testid="purchase-request-card"><span className="purchase-request-card-icon"><ShoppingCart size={20} strokeWidth={1.65} /></span><span className="purchase-request-card-copy"><span><small>{purchaseRequestStatusLabel(request.status)}</small><small>{formatProjectFileDate(request.updatedAt)}</small></span><strong>{purchaseRequestDisplayTitle(request)}</strong><em>{request.item.quantity && request.item.unit ? `${Number(request.item.quantity).toLocaleString("fa-IR", { maximumFractionDigits: 6 })} ${request.item.unit}` : "مشخصات قلم هنوز کامل نشده"}</em><small>نسخهٔ {request.version.toLocaleString("fa-IR")} · {request.sharingStatus}</small></span><ArrowRight size={17} aria-hidden="true" /></button>)}
            </section>
          )}
        </main>
      </MobileScroll>
      {editorSheet}
    </div>
  );
}

function projectTaskStatusLabel(status: ProjectTaskStatus) {
  return status === "completed" ? "تمام‌شده" : "در حال انجام";
}

function projectTaskEventLabel(type: ProjectTaskEventType) {
  if (type === "completed") return "کار تمام شد";
  if (type === "reopened") return "کار بازگشایی شد";
  return "کار ثبت شد";
}

function ProjectTasksView({ project, tasks, approvals, initialFilter, initialApprovalId, returnToPurchaseRequestId, tasksStorageLocked, approvalsStorageLocked, onBack, onReturnToPurchaseRequest, onCreate, onStatusChange, onApprovalDecision }: { project: BuilderProject; tasks: ProjectTaskRecord[]; approvals: ProjectApprovalRecord[]; initialFilter: ProjectTaskFilter; initialApprovalId: string | null; returnToPurchaseRequestId: string | null; tasksStorageLocked: boolean; approvalsStorageLocked: boolean; onBack: () => void; onReturnToPurchaseRequest: (requestId: string) => void; onCreate: (draft: ProjectTaskDraft) => boolean; onStatusChange: (taskId: string, status: ProjectTaskStatus) => boolean; onApprovalDecision: (approvalId: string, decision: Exclude<ProjectApprovalStatus, "pending">) => boolean }) {
  const keyboard = useKeyboard();
  const taskViewRef = useRef<HTMLDivElement>(null);
  const taskAddButtonRef = useRef<HTMLButtonElement>(null);
  const approvalHeadingRef = useRef<HTMLElement>(null);
  const pendingApprovalCardFocus = useRef<string | null>(null);
  const [filter, setFilter] = useState<ProjectTaskFilter>(initialFilter);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(initialApprovalId);
  const [editorOpen, setEditorOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState<ProjectTaskDraft>({ title: "", currentStep: "" });
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

  useLayoutEffect(() => {
    if (selectedId || selectedApprovalId) return;
    const rail = taskViewRef.current?.querySelector<HTMLElement>(".project-task-filters");
    const selectedFilter = rail?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!rail || !selectedFilter) return;
    const alignSelectedFilter = () => {
      const maximum = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const centered = selectedFilter.offsetLeft - (rail.clientWidth - selectedFilter.clientWidth) / 2;
      rail.scrollLeft = Math.max(0, Math.min(maximum, centered));
    };
    alignSelectedFilter();
    const observer = new ResizeObserver(alignSelectedFilter);
    observer.observe(rail);
    if (rail.firstElementChild) observer.observe(rail.firstElementChild);
    return () => observer.disconnect();
  }, [filter, selectedApprovalId, selectedId]);

  const openEditor = () => {
    setTaskDraft({ title: "", currentStep: "" });
    setFieldErrors({ title: "", currentStep: "" });
    setStorageError("");
    setEditorOpen(true);
  };

  const closeEditor = () => {
    keyboard.hide();
    setEditorOpen(false);
    setStorageError("");
    window.requestAnimationFrame(() => taskAddButtonRef.current?.focus());
  };

  const changeDraft = (field: keyof ProjectTaskDraft, value: string) => {
    setTaskDraft((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => current[field] ? { ...current, [field]: "" } : current);
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
    if (!onCreate({ title, currentStep })) {
      setStorageError("کار ذخیره نشد. فضای مرورگر را بررسی کن و دوباره تلاش کن.");
      return;
    }
    closeEditor();
    setFilter("active");
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
              <div><small>{projectApprovalStatusLabel(selectedApproval.status)} · نسخهٔ درخواست {selectedApproval.target.version.toLocaleString("fa-IR")}</small><h1>{selectedApproval.snapshot.item.name}</h1><p>{selectedApproval.snapshot.rawNeed}</p></div>
            </section>

            <aside className="project-approval-boundary" id="project-approval-boundary" data-testid="project-approval-status">
              <ShieldCheck size={18} />
              <span><strong>{selectedApproval.status === "pending" ? "منتظر تصمیم صریح شما" : selectedApproval.status === "approved" ? "نسخهٔ درخواست تأیید شد" : "نیاز به اصلاح ثبت شد"}</strong>{selectedApproval.status === "pending" ? " این تأیید فقط محتوای همین نسخه را برای ادامهٔ مسیر می‌پذیرد؛ هیچ مقصد بیرونی انتخاب نشده و مجوز ارسال نیست." : selectedApproval.status === "approved" ? ` نسخهٔ ${selectedApproval.target.version.toLocaleString("fa-IR")} فقط برای ادامهٔ فرایند پذیرفته شد؛ درخواست هنوز ارسال نشده است.` : ` نسخهٔ ${selectedApproval.target.version.toLocaleString("fa-IR")} برای اصلاح علامت خورد؛ درخواست هنوز ارسال نشده است.`}</span>
            </aside>

            <dl className="project-approval-meta">
              <div><dt>قلم</dt><dd>{selectedApproval.snapshot.item.name}</dd></div>
              <div><dt>مقدار و واحد</dt><dd>{Number(selectedApproval.snapshot.item.quantity).toLocaleString("fa-IR", { maximumFractionDigits: 6 })} {selectedApproval.snapshot.item.unit}</dd></div>
              <div><dt>برند یا گرید</dt><dd>{selectedApproval.snapshot.item.brandOrGrade ?? "نامشخص"}</dd></div>
              <div><dt>مشخصات</dt><dd>{selectedApproval.snapshot.item.specification ?? "نامشخص"}</dd></div>
              <div><dt>جایگزین</dt><dd>{purchaseRequestAlternativesLabel(selectedApproval.snapshot.item.alternatives)}</dd></div>
              <div><dt>زمان موردنیاز</dt><dd>{selectedApproval.snapshot.delivery.neededBy ?? "نامشخص"}</dd></div>
              <div><dt>تحویل</dt><dd>تهران · {selectedApproval.snapshot.delivery.area}</dd></div>
              <div><dt>نسخهٔ درخواست</dt><dd>{selectedApproval.target.version.toLocaleString("fa-IR")} · {formatProjectFileDate(selectedApproval.target.updatedAt)}</dd></div>
              <div><dt>ثبت و اشتراک</dt><dd>{selectedApproval.localStatus} · {selectedApproval.snapshot.sharingStatus}</dd></div>
            </dl>

            <section className="project-approval-terms" aria-label="شرایط نامشخص نسخهٔ درخواست">
              <div className="project-task-section-title"><strong>شرایط هنوز نامشخص</strong><span>۳</span></div>
              <dl><div><dt>حمل</dt><dd>نامشخص</dd></div><div><dt>مالیات</dt><dd>نامشخص</dd></div><div><dt>شرایط پرداخت</dt><dd>نامشخص</dd></div></dl>
            </section>

            <aside className="project-approval-privacy">
              <div><ShieldCheck size={18} /><span><strong>پیش‌نمایش حریم همین نسخه</strong><small>در این مرحله هیچ داده‌ای مشترک یا ارسال نمی‌شود.</small></span></div>
              <dl><div><dt>قابل‌اشتراک در مرحلهٔ آینده</dt><dd>قلم، مقدار، مشخصات ثبت‌شده و محدودهٔ تقریبی تهران</dd></div><div><dt>خصوصی می‌ماند</dt><dd>نام پروژه، حافظه، فایل‌ها، بودجه و آدرس دقیق</dd></div></dl>
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
            {storageError ? <p className="project-task-storage-error" role="alert" data-testid="project-task-storage-error">{storageError}</p> : null}
            <button className="primary-button project-task-status-button" type="button" onClick={toggleTaskStatus} disabled={tasksStorageLocked} data-testid="project-task-status-toggle">{selectedTask.status === "completed" ? "بازگشایی کار" : "علامت‌گذاری به‌عنوان تمام‌شده"}</button>
          </main>
        </MobileScroll>
      </div>
    );
  }

  return (
    <div ref={taskViewRef} className="chida-app project-tasks-view" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="project-tasks-view">
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
                <button className="project-task-card project-approval-card" type="button" key={approval.id} data-approval-id={approval.id} onClick={() => { setStorageError(""); setSelectedApprovalId(approval.id); }} aria-label={`${approval.snapshot.item.name}، نسخهٔ درخواست ${approval.target.version.toLocaleString("fa-IR")}، پروژهٔ ${project.name}، ${projectApprovalStatusLabel(approval.status)}، فقط تأیید داخلی و ارسال نشده`} data-testid="project-approval-card">
                  <span className="project-task-card-icon"><ClipboardCheck size={20} strokeWidth={1.65} /></span>
                  <span className="project-task-card-copy"><span><small>{projectApprovalStatusLabel(approval.status)}</small><small>{formatProjectFileDate(approval.updatedAt)}</small></span><strong>{approval.snapshot.item.name}</strong><em>{approval.status === "pending" ? "منتظر تصمیم شما" : approval.status === "approved" ? "فقط این نسخه پذیرفته شد؛ ارسال نشده" : "برای اصلاح علامت خورد؛ ارسال نشده"}</em><small>نسخهٔ درخواست {approval.target.version.toLocaleString("fa-IR")} · {approval.localStatus}</small></span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              ))}
              {filteredTasks.map((task) => (
                <button className="project-task-card" type="button" key={task.id} onClick={() => { setStorageError(""); setSelectedId(task.id); }} data-testid="project-task-card">
                  <span className="project-task-card-icon"><CheckCircle2 size={20} strokeWidth={1.65} /></span>
                  <span className="project-task-card-copy"><span><small>{projectTaskStatusLabel(task.status)}</small><small>{formatProjectFileDate(task.updatedAt)}</small></span><strong>{task.title}</strong><em>{task.currentStep}</em><small>نسخهٔ {task.version.toLocaleString("fa-IR")} · {task.localStatus}</small></span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              ))}
            </section>
          )}
        </main>
      </MobileScroll>

      <BottomSheet open={editorOpen} onOpenChange={(open) => { if (!open) closeEditor(); }} title="کار جدید" description={`یک وظیفهٔ داخلی برای ${project.name} ثبت کن.`} snap={0.94}>
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

          <dl className="project-task-meta">
            <div><dt>پروژهٔ مالک</dt><dd>{project.name}</dd></div>
            <div><dt>منشأ</dt><dd>ثبت مستقیم شما</dd></div>
            <div><dt>وضعیت نخست</dt><dd>در حال انجام · نسخهٔ ۱</dd></div>
            <div><dt>دسترسی</dt><dd>خصوصی پروژه</dd></div>
          </dl>
          <p className="project-task-boundary"><CircleHelp size={16} /><span>ثبت این کار هیچ اجرا، اعلان، تأیید یا ارسال بیرونی ایجاد نمی‌کند.</span></p>
          {storageError ? <p className="project-task-storage-error" role="alert" data-testid="project-task-storage-error">{storageError}</p> : null}
          <button className="primary-button" type="submit" data-testid="project-task-save">ثبت در مرکز کارها</button>
        </form>
      </BottomSheet>
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

function BriefSheet({ sheet, schedule, onClose, onSave }: { sheet: SheetName; schedule: BriefSchedule | null; onClose: () => void; onSave: (schedule: BriefSchedule) => void }) {
  const [frequency, setFrequency] = useState<BriefFrequency>(schedule?.frequency ?? "daily");
  const [weekday, setWeekday] = useState(schedule?.weekday ?? "شنبه");
  const [time, setTime] = useState(schedule?.time ?? "09:00");
  const [saved, setSaved] = useState(false);

  const save = () => {
    onSave({ frequency, weekday, time });
    setSaved(true);
  };

  return (
    <BottomSheet open={sheet === "brief"} onOpenChange={(open) => !open && onClose()} title="بریف پروژه" description="در زمان انتخابی، فقط موارد مهم و قابل اقدام پروژه را جمع‌بندی می‌کند." snap={0.84}>
      <div className="brief-panel" dir="rtl" data-testid="brief-panel">
        <div className="brief-preview">
          <div className="brief-preview-head"><span><CalendarDays size={20} /></span><div><small>بریف {activeBriefLabel(frequency)}</small><strong>امروزِ پروژه در یک نگاه</strong></div></div>
          <ul><li>تصمیم‌هایی که امروز لازم‌اند</li><li>کارهای عقب‌افتاده و نزدیک</li><li>خریدها و درخواست‌های باز</li><li>اسناد و ورودی‌های بلاتکلیف</li><li>تغییرات مهم از آخرین بازدید</li></ul>
        </div>

        <div className="brief-frequency" role="radiogroup" aria-label="بازهٔ بریف" data-testid="brief-frequency-group">
          <button type="button" role="radio" aria-checked={frequency === "daily"} data-testid="brief-frequency-daily" onClick={() => { setFrequency("daily"); setSaved(false); }}>روزانه</button>
          <button type="button" role="radio" aria-checked={frequency === "weekly"} data-testid="brief-frequency-weekly" onClick={() => { setFrequency("weekly"); setSaved(false); }}>هفتگی</button>
        </div>

        <div className="brief-fields">
          {frequency === "weekly" ? <label><span>روز دریافت</span><select value={weekday} onChange={(event) => { setWeekday(event.target.value); setSaved(false); }} data-testid="brief-weekday-select"><option>شنبه</option><option>یکشنبه</option><option>دوشنبه</option><option>سه‌شنبه</option><option>چهارشنبه</option><option>پنجشنبه</option></select></label> : null}
          <label><span>ساعت دریافت</span><span className="time-field"><Clock3 size={17} /><KeyboardInput type="text" dir="ltr" inputMode="numeric" maxLength={5} value={time} onChange={(event) => { setTime(event.target.value); setSaved(false); }} data-testid="brief-time-input" /></span></label>
        </div>

        <button className="primary-button" type="button" data-testid="brief-save-button" onClick={save}>ذخیرهٔ برنامهٔ بریف</button>
        {saved ? <p className="brief-saved" data-testid="brief-save-success"><CheckCircle2 size={17} /> بریف {frequency === "daily" ? `روزانه ساعت ${time}` : `هفتگی، ${weekday} ساعت ${time}`} ذخیره شد.</p> : null}
        <button className="text-button" type="button" data-testid="brief-back-button" onClick={onClose}>بازگشت به چت</button>
      </div>
    </BottomSheet>
  );
}

function activeBriefLabel(frequency: BriefFrequency) {
  return frequency === "daily" ? "روزانه" : "هفتگی";
}

function ProjectsSheet({ sheet, projects, activeProjectId, onClose, onSelect }: { sheet: SheetName; projects: BuilderProject[]; activeProjectId: string; onClose: () => void; onSelect: (projectId: string) => void }) {
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
        <p className="projects-sheet-note"><ShieldCheck size={15} /> اطلاعات این فهرست فعلاً فقط در همین مرورگر نگه‌داری می‌شود.</p>
      </div>
    </BottomSheet>
  );
}

function SettingsSheet({ sheet, onClose }: { sheet: SheetName; onClose: () => void }) {
  return (
    <BottomSheet open={sheet === "settings"} onOpenChange={(open) => !open && onClose()} title="پروفایل و تنظیمات" description="مهیار کلباسی · حساب سازنده" snap={0.68}>
      <div className="settings-sheet" dir="rtl">
        <button className="setting-row" type="button"><SlidersHorizontal size={20} /><span><strong>تنظیمات چیدا</strong><small>ترجیحات پاسخ و اعلان‌ها</small></span><MoreHorizontal size={18} /></button>
        <button className="setting-row" type="button"><Bell size={20} /><span><strong>اعلان‌ها</strong><small>پیگیری پروژه و پیشنهادها</small></span><MoreHorizontal size={18} /></button>
        <button className="setting-row" type="button"><Palette size={20} /><span><strong>دسترسی‌پذیری</strong><small>اندازه متن و کنتراست</small></span><MoreHorizontal size={18} /></button>
        <button className="setting-row" type="button"><Volume2 size={20} /><span><strong>صدا و گفتار</strong><small>ورودی و خواندن پاسخ</small></span><MoreHorizontal size={18} /></button>
        <button className="setting-row" type="button"><CircleHelp size={20} /><span><strong>راهنما</strong><small>آشنایی با امکانات چیدا</small></span><MoreHorizontal size={18} /></button>
        <div className="role-lock-note"><ShieldCheck size={18} /><span>نقش این حساب «سازنده» است و قابل تغییر نیست.</span></div>
      </div>
    </BottomSheet>
  );
}
