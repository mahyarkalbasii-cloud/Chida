# طراحی BG-F6: زیربنای authority و هم‌زمانی پیشنهاد سازنده

تاریخ: ۲۰۲۶/۰۹/۰۲
وضعیت: پیاده‌سازی و اعتبارسنجی محلی تکمیل؛ انتشار exact candidate صریحاً مجاز و در انتظار gate terminal
برش: `BG-F6 — BuilderRecordedProposal / ProposalRevision authority + concurrency foundation`

## ۱. هدف و مرز برش

این برش فقط ریشهٔ ماندگار `BuilderRecordedProposal / ProposalRevision` را از آرایهٔ خام v1 به authority دقیق، نسخه‌دار، fail-close و مقاوم در برابر هم‌زمانی ارتقا می‌دهد. تجربهٔ روزمرهٔ «ثبت دستی پیشنهاد» همان تجربهٔ خصوصی، پروژه‌محور و بدون شبکه یا اثر بیرونی باقی می‌ماند.

این برش مجاز است:

- canonical Proposal را در envelope دقیق v2 نگه دارد؛
- Proposal و revisionهای آن را به مالک، پروژه، Request، Approval، Contact و File مرجع bind کند؛
- migration یک‌باره و crash-safe از v1 بسازد؛
- create/update را زیر Web Lock مشترک procurement با commit-time reread، expected version، idempotency، readback و rollback ایمن اجرا کند؛
- lineage قدیمی FNV را فقط برای خواندن Comparison/Decision/Negotiation موجود حفظ کند؛
- UI فعلی را به service تازه وصل کند و draft را روی conflict یا failure نگه دارد؛
- تست‌های متمرکز این قرارداد و regressionهای موجود را اضافه یا اصلاح کند.

این برش مجاز نیست:

- store یا schema مقایسهٔ محصول، مقایسهٔ خدمت، تصمیم مقایسه یا مذاکره را canonical یا migrate کند؛
- مسیر تأمین‌کننده، shared case یا `case_private` بسازد؛
- مدل، backend، sync، شبکه، ارسال/دریافت یا هر اثر بیرونی اضافه کند؛
- foundation عمومی File/Photo را بازطراحی کند؛
- Builder Architecture Gate تاریخی را PASS اعلام یا rerun کامل کند؛
- commit، push یا deploy شود مگر با مجوز صریح تازهٔ کاربر؛
- سند مادر محصول را تغییر دهد.

## ۲. وضعیت موجود و علت تغییر

Proposal فعلی در `prototype/src/Prototype.tsx` به‌صورت آرایهٔ خام در کلید `chida-prototype-builder-recorded-proposals:v1` نگه‌داری می‌شود. revisionها fingerprint نوع FNV دارند و writer مستقیماً `localStorage.setItem` را فراخوانی می‌کند. در نتیجه این قراردادها وجود ندارند:

- envelope و store version؛
- owner/scope/custodian صریح؛
- parser exact و authority واحد؛
- Web Lock مشترک؛
- commit-time reread و optimistic concurrency؛
- receipt و idempotency؛
- readback و rollback محدود به candidate؛
- migration/cutover crash-safe.

هم‌زمان Comparison و Negotiation موجود به چهار مقدار `proposalId / proposalVersion / proposalRevisionId / proposalRevisionFingerprint` پین شده‌اند. بنابراین جایگزینی سادهٔ FNV با SHA-256 lineage تاریخی را می‌شکند. راه‌حل این طراحی حفظ alias میراثی در evidence هش‌شده و جدا از fingerprint canonical است.

## ۳. تصمیم‌های قطعی طراحی

### ۳.۱ File lineage

File فعلی revision/fingerprint ماندگار عمومی ندارد. BG-F6 فقط این pin کمینه را می‌سازد:

```ts
type BuilderProposalFilePin = {
  fileId: string;
  fileVersion: 1;
  metadataSnapshot: ProjectFileMetadataSnapshot;
  metadataFingerprint: `sha256-${string}`;
};
```

در create/update، File باید هنگام commit در همان پروژه موجود باشد و snapshot/hash دقیق آن دوباره سنجیده شود. پس از ثبت، حذف یا unavailable شدن Blob یا رکورد فایل، Proposal تاریخی را خراب نمی‌کند: metadata snapshot ماندگار و خوانا می‌ماند، ولی UI بازکردن فایل را unavailable نشان می‌دهد. بازطراحی authority فایل خارج از BG-F6 است.

### ۳.۲ legacy FNV

FNV هرگز fingerprint canonical v2 نیست. هر revision مهاجرت‌شده SHA-256 تازه می‌گیرد و mapping معتبر FNV→SHA فقط در `legacyEvidence.revisionLinks` نگه‌داری می‌شود. parser باید خود FNV را از snapshot v1 بازسازی و mapping را validate کند؛ دادهٔ ادعایی بدون بازسازی پذیرفته نمی‌شود.

### ۳.۳ owner، scope و custodian

هر record دقیقاً این ownership را دارد:

```ts
ownerPrincipalType: "account";
ownerPrincipalId: "local-builder-account";
accountSide: "builder";
scopeType: "project_private";
scopeId: projectId;
custodianService: "Proposal Domain Service";
sensitivity: "private";
```

هر mismatch، duplicate id یا cross-project record کل canonical authority را read-error می‌کند؛ parser truth جزئی تولید نمی‌کند.

### ۳.۴ فایل تاریخیِ حذف‌شده

Proposal ثبت‌شده اصل تاریخی مستقل است. نبود File جاری فقط availability پیوست را تغییر می‌دهد؛ `reference.filePin` از record حذف یا بازنویسی نمی‌شود و Proposal unreadable نمی‌شود. هر mutation تازه‌ای که File را به‌عنوان مرجع pin می‌کند، نیازمند File جاری و exact match است.

### ۳.۵ downstream تازه و قدیمی

- Comparison/Negotiation تازه fingerprint canonical SHA-256 را پین می‌کند.
- downstream قدیمی با FNV فقط از طریق `legacyEvidence` معتبر resolve می‌شود.
- storeهای downstream در migration Proposal هرگز نوشته نمی‌شوند؛ bytes آن‌ها ثابت می‌ماند.
- دستکاری هماهنگ pin downstream و evidence Proposal با parser SHA-bound رد می‌شود.

## ۴. مدل canonical v2

کلیدها:

```ts
export const legacyBuilderProposalsStorageKey =
  "chida-prototype-builder-recorded-proposals:v1";
export const builderProposalsStorageKey =
  "chida-prototype-builder-recorded-proposals:v2";
export const builderProposalsCutoverMarkerKey =
  `${builderProposalsStorageKey}:cutover:v1`;
```

فایل مالک domain: `prototype/src/builderProposals.ts`.

### ۴.۱ envelope

```ts
type BuilderProposalEnvelope = {
  schemaVersion: 2;
  fingerprintVersion: "builder-proposal-domain-v2";
  storeVersion: number;
  records: BuilderRecordedProposalRecord[];
  idempotencyReceipts: BuilderProposalCommandReceipt[];
  migrationReports: [BuilderProposalMigrationReport];
  updatedAt: string;
  fingerprint: `sha256-${string}`;
};
```

قواعد exact:

- کلید اضافه، کلید کم، type مبهم، تاریخ non-canonical، شناسهٔ تکراری و آرایهٔ نامرتب رد می‌شود؛
- `records` بر اساس id canonical مرتب است؛ `revisions/history` بر اساس version و chronology دقیق‌اند؛
- current projection باید byte-for-byte از snapshot revision جاری قابل‌بازتولید باشد؛
- envelope fingerprint روی stable canonical value بدون خود fingerprint محاسبه می‌شود؛
- canonical حاضر بدون marker معتبر، marker حاضر بدون canonical معتبر و schema آینده همگی read-error هستند؛
- وقتی marker committed است هیچ fallback به v1 وجود ندارد.

### ۴.۲ Proposal record و revision

Request review فعلی هنوز fingerprint نوع FNV دارد و Comparison/Negotiation موجود همان مقدار را در target خود نگه می‌دارند. BG-F6 آن قرارداد upstream را جعل یا بازنویسی نمی‌کند. بنابراین target دو binding مستقل دارد: `reviewRevisionFingerprint` همان FNV معتبر Request برای سازگاری lineage است و `requestDependencyFingerprint` یک SHA-256 روی dependency wrapper دقیق Request است. SHA-256 دوم integrity canonical Proposal را فراهم می‌کند؛ FNV اول فقط هویت source موجود را حفظ می‌کند.

```ts
type BuilderProposalTargetPin = {
  requestId: string;
  requestVersion: number;
  reviewRevisionId: string;
  reviewRevisionFingerprint: `fnv1a-${string}`;
  requestDependencyFingerprint: `sha256-${string}`;
  contentApprovalId: string;
  contentApprovalVersion: number;
  contentApprovalRevisionId: string;
  contentApprovalFingerprint: `sha256-${string}`;
  requestKind: "product" | "service";
};

type BuilderRecordedProposalSupplierSnapshot = {
  supplierContactId: string;
  supplierContactVersion: number;
  displayName: string;
  category: string;
  tehranCoverage: string;
  responseCapability: "product" | "service" | "both";
  networkStatus: "خارج از شبکه چیدا";
};

type BuilderProposalContactPin = {
  supplierContactId: string;
  supplierContactVersion: number;
  supplierContactRevisionId: string;
  supplierContactRevisionFingerprint: `sha256-${string}`;
};

type BuilderRecordedProposalReference =
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
      fileSnapshot: {
        id: string;
        displayName: string;
        originalName: string;
        mimeType: string;
        size: number;
        category: ProjectFileCategory;
        createdAt: string;
        storageMode: "metadata-only";
      };
      metadataFingerprint: `sha256-${string}`;
      contentPersisted: false;
      extractionPerformed: false;
    };
```

رکورد exact v2 این شکل را دارد:

```ts
type BuilderRecordedProposalRecord = {
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
  fingerprint: `sha256-${string}`;
};
```

هر revision شامل این بخش‌هاست:

```ts
type BuilderRecordedProposalRevision = {
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
  fingerprint: `sha256-${string}`;
};
```

current projection شامل `target/requestSnapshot/supplierSnapshot/contactPin/reference/declaredAt/transcript/notes/lines` باید دقیقاً با snapshot revision جاری برابر باشد. `supplierSnapshot` عمداً همان projection هفت‌کلیدی v1 را حفظ می‌کند تا Comparison/Negotiation موجود بدون تغییر bytes قابل‌خواندن بماند؛ Contact revision integrity فقط در `contactPin` جداست. `scopeId === projectId` است. commandهای تازه idهای revision/event را بر اساس record/version قطعی می‌سازند؛ migration idهای v1 را حفظ می‌کند چون downstream موجود به `proposalRevisionId` پین است و evidence آن‌ها را به نسخهٔ canonical bind می‌کند.

### ۴.۳ event، receipt و migration report

```ts
type BuilderRecordedProposalEvent = {
  schemaVersion: 1;
  id: string;
  type: "created" | "updated";
  actor: "شما" | "سامانهٔ مهاجرت";
  actorPrincipalId: "local-builder-account";
  origin: "live-command" | "v1-migration";
  at: string;
  version: number;
  revisionId: string;
  authorizationContextHash: `sha256-${string}`;
  dependencySnapshotHash: `sha256-${string}`;
  idempotencyKey: string | null;
  commandPayloadHash: `sha256-${string}` | null;
  fingerprint: `sha256-${string}`;
};

type BuilderProposalCommandReceipt = {
  schemaVersion: 1;
  position: number;
  key: string;
  action: "create-proposal" | "update-proposal";
  payloadHash: `sha256-${string}`;
  projectId: string;
  recordId: string;
  expectedStoreVersion: number;
  expectedRecordVersion: number | null;
  commandPins: BuilderProposalCommandPins;
  expectedDependencySnapshotHash: `sha256-${string}`;
  result: "created" | "updated";
  resultingStoreVersion: number;
  resultingRecordVersion: number;
  eventId: string;
  revisionId: string;
  authorizationContextHash: `sha256-${string}`;
  recordedAt: string;
  fingerprint: `sha256-${string}`;
};

type BuilderProposalMigrationReport = {
  schemaVersion: 1;
  id: string;
  store: "builder-proposal";
  sourceGeneration: "v1-array" | "none";
  sourceKey: typeof legacyBuilderProposalsStorageKey | null;
  sourceRawHash: `sha256-${string}` | null;
  dependencySnapshotHash: `sha256-${string}`;
  identityBindingHash: `sha256-${string}`;
  migratedAt: string;
  recordCount: number;
  migratedRecordFingerprints: Array<`sha256-${string}`>;
  migratedRevisionCount: number;
  fingerprint: `sha256-${string}`;
};
```

قواعد replay و chronology:

- `history[i].version === revisions[i].version === i + 1` و event همان `revisionId` را پین می‌کند؛
- id live قطعی `builder-proposal-revision:${recordId}:v${version}` و `builder-proposal-event:${recordId}:v${version}` است؛ idهای revision/event مهاجرت‌شده عین source v1 می‌مانند؛
- event مهاجرت‌شده `origin=v1-migration`، کلید/payload null و همان id، زمان و معنای event v1 را حفظ می‌کند؛ event live هر دو مقدار non-null دارد؛
- receiptها با `position === index + 1` مرتب و keyها یکتا هستند؛
- هر receipt دقیقاً `commandPins` همان تلاش را نگه می‌دارد و `commandPins.expectedDependencySnapshotHash === expectedDependencySnapshotHash` است؛ این pins بخشی از payload hash و evidence replay هستند، نه metadata مشتق‌شدهٔ اختیاری؛
- هر receipt دقیقاً به یک event live با همان key، payload، project/record، authorization، dependency hash، version و timestamp وصل است؛ parser باید payload command را از revision ثبت‌شده، authority و `receipt.commandPins` بازسازی و hash آن را دوباره اثبات کند؛
- pinهای Request، Content Approval و Contact داخل receipt باید با target/contact همان revision یکی باشند. pin File همان snapshot جاریِ commit را ثبت می‌کند و به‌علت rename مجاز `displayName` لزوماً از reference تاریخی revision قابل‌استنتاج نیست؛ پس حذف آن از receipt یا بازسازی آن از File جاری ممنوع است؛
- `resultingStoreVersion === expectedStoreVersion + 1` و `resultingRecordVersion === (expectedRecordVersion ?? 0) + 1`؛ create فقط expectedRecordVersion null و resultingRecordVersion 1 دارد؛
- تعداد افزایش‌های store پس از migration دقیقاً با receiptها قابل replay است؛ receipt orphan، duplicate، عقب‌گرد version، زمان پیش از dependency یا hash هماهنگ ولی chain ناممکن رد می‌شود؛
- migration report یگانه به همان migration id، source hash، dependency/identity binding و fingerprintهای recordهای candidate وصل است.

### ۴.۴ dependency pins

- Request: id، version، review revision id، FNV معتبر source و SHA-256 dependency wrapper؛
- Content Approval: id، version، revision id و SHA fingerprint؛
- Contact: snapshot هفت‌کلیدی سازگار با downstream به‌علاوهٔ `contactPin` جدا شامل id، version، revision id و SHA fingerprint؛
- File اختیاری: id، version ثابت 1، metadata snapshot و SHA-256 snapshot.

snapshot روزمره برای حفظ نمایش و سابقه داخل همان revision است؛ target pin authority dependency را مشخص می‌کند.

### ۴.۵ legacy evidence

```ts
type BuilderProposalLegacyEvidence = {
  schemaVersion: 1;
  sourceGeneration: "v1-array";
  sourceIndex: number;
  sourceRecordHash: `sha256-${string}`;
  sourceRecordVersion: number;
  sourceCreatedAt: string;
  sourceUpdatedAt: string;
  revisionLinks: Array<{
    revisionId: string;
    revisionVersion: number;
    legacyFingerprint: `fnv1a-${string}`;
    canonicalFingerprint: `sha256-${string}`;
  }>;
  fingerprint: `sha256-${string}`;
};
```

helper عمومی خواندن lineage:

```ts
export function builderProposalRevisionFingerprintMatches(
  record: BuilderRecordedProposalRecord,
  revision: BuilderRecordedProposalRevision,
  pinnedFingerprint: string,
): boolean;
```

این helper فقط canonical SHA همان revision یا FNV بازسازی‌شده و hash-bound در evidence همان رکورد را می‌پذیرد.

### ۴.۶ الگوریتم hash

تمام hashهای canonical با همان پیاده‌سازی sync و stable SHA-256 موجود در `procurementDispatchHash` ساخته می‌شوند. `builderProposals.ts` آن را import می‌کند؛ Web Crypto async یا دومین پیاده‌سازی SHA اضافه نمی‌شود. بنابراین constructor، parser و dependency reader همگی sync هستند و فقط initialization/command به‌دلیل Web Lock، `Promise` برمی‌گردانند.

## ۵. dependency snapshot

service یک reader تازه در هر critical section می‌گیرد؛ snapshot بیرون lock authority نیست.

```ts
type BuilderProposalDependencies = {
  schemaVersion: 1;
  authority: ProcurementDispatchAuthority;
  requestRevisions: BuilderProposalRequestDependency[];
  contentApprovals: BuilderProposalApprovalDependency[];
  contacts: BuilderProposalContactDependency[];
  files: BuilderProposalFileDependency[];
  snapshotHash: `sha256-${string}`;
};
```

`parseBuilderProposalEnvelopeRaw(raw, authority)` canonical را فقط از روی bytes داخلی و authority identity/project scope validate می‌کند. وجود یا current بودن File/Request/Approval/Contact شرط parse تاریخچهٔ committed نیست. `readBuilderProposalState` علاوه بر envelope معتبر، وضعیت جداگانهٔ dependency را `current / stale / read-error` محاسبه می‌کند. `stale` رکورد را خوانا و فقط‌خواندنی با برچسب «نیازمند بررسی» نگه می‌دارد؛ `read-error` نیز canonical را پاک یا empty نمی‌کند ولی همهٔ mutationها را می‌بندد. migration و هر create/update حتماً dependencies جاری و exact می‌خواهند.

قواعد:

- authority باید با foundation کامپایل‌شده و پروژهٔ command سازگار باشد؛
- Request/Approval از revisionهای تاریخی canonical و Approval معتبر ساخته می‌شوند؛
- create فقط Request ready-for-review و Approval current/approved را می‌پذیرد؛
- Contact باید current، active و از نظر capability با requestKind سازگار باشد؛
- update target Request/Approval/Contact را تغییر نمی‌دهد، اما exact dependency pins record قبلی را دوباره validate می‌کند؛ Contact archived یا head عوض‌شده Proposal را historical/needs-review می‌کند و update خاموش را مجاز نمی‌کند؛
- File pin اختیاری برای draft تازه از File جاری ساخته می‌شود؛ hash داخلی reference برای parse تاریخی کافی است، اما availability جاری جداگانه سنجیده می‌شود؛
- `snapshotHash` همهٔ authority و dependencyها را پوشش می‌دهد؛
- mutation پس از انتظار برای lock، پیش از build، پیش از write و پس از write dependency reader را دوباره می‌خواند؛ هر drift به conflict/failure و rollback candidate منجر می‌شود.

File تحت lock جداست؛ BG-F6 فقط با reread پیش/پس از write exactness را اثبات می‌کند و ادعای serialization با writer فایل ندارد.

برای rename فایل، `displayName` mutable و بدون افزایش version است. migration snapshot تاریخی v1 را همان‌طور که ثبت شده hash می‌کند و File جاری را فقط روی immutable subset می‌سنجد: `id/projectId/originalName/mimeType/size/category/createdAt` و غیرتصویری بودن. اختلاف `displayName` مجاز و availability جاری بر اساس id است. نبود File در لحظهٔ migration به‌دلیل نبود اثبات project scope، fail-close است؛ پس از committed، حذف metadata یا Blob، canonical را invalid نمی‌کند و فقط availability مرجع را `unavailable` می‌کند.

availability Blob بخشی از dependency snapshot یا parser sync نیست. `Prototype.tsx` یک seam جدا و async دارد:

```ts
type BuilderProposalReferenceAvailability =
  | "not-attached"
  | "available"
  | "metadata-only"
  | "metadata-missing"
  | "blob-missing"
  | "read-error";

type BuilderProposalReferenceAvailabilityReader = (
  proposal: BuilderRecordedProposalRecord,
  currentFiles: ProjectFileRecord[],
) => Promise<BuilderProposalReferenceAvailability>;
```

این reader از مسیر موجود IndexedDB (`readProjectFile`) استفاده می‌کند، نتیجه را در state مشتق‌شدهٔ UI نگه می‌دارد و هیچ Proposal byte را تغییر نمی‌دهد. metadata حذف‌شده و Blob حذف‌شده دو حالت مستقل‌اند؛ exception یا IndexedDB read failure حالت `read-error` می‌دهد و open/mutation مرتبط را می‌بندد، ولی canonical Proposal و تاریخچه همچنان خوانا می‌مانند.

## ۶. migration و cutover

marker سه حالت exact دارد:

```ts
type BuilderProposalPendingMarker = {
  schemaVersion: 1;
  store: "builder-proposal";
  state: "pending";
  migrationId: string;
  sourceGeneration: "v1-array" | "none";
  sourceKey: typeof legacyBuilderProposalsStorageKey | null;
  sourceRawHash: `sha256-${string}` | null;
  dependencySnapshotHash: `sha256-${string}`;
  identityBindingHash: `sha256-${string}`;
  migrationAt: string;
  candidateRaw: string;
  candidateRawHash: `sha256-${string}`;
  fingerprint: `sha256-${string}`;
};

type BuilderProposalVerifiedMarker = Omit<
  BuilderProposalPendingMarker,
  "state" | "fingerprint"
> & {
  state: "verified";
  verifiedAt: string;
  fingerprint: `sha256-${string}`;
};

type BuilderProposalCommittedMarker = {
  schemaVersion: 1;
  store: "builder-proposal";
  state: "committed";
  migrationId: string;
  sourceGeneration: "v1-array" | "none";
  sourceKey: typeof legacyBuilderProposalsStorageKey | null;
  sourceRawHash: `sha256-${string}` | null;
  dependencySnapshotHash: `sha256-${string}`;
  identityBindingHash: `sha256-${string}`;
  migrationAt: string;
  verifiedAt: string;
  committedAt: string;
  canonicalRawHash: `sha256-${string}`;
  candidateRawHash: `sha256-${string}`;
  fingerprint: `sha256-${string}`;
};
```

marker نیز exact و SHA-bound است؛ committed candidate bytes را نگه نمی‌دارد و فقط hash کمینه دارد. `migrationAt <= verifiedAt <= committedAt` و report/envelope/marker باید روی migration id و bindingهای یکسان replay شوند.

در marker committed، `candidateRawHash` و `canonicalRawHash` هر دو به **candidate اولیهٔ cutover در `storeVersion=1`** متصل‌اند و بعد از mutation تغییر نمی‌کنند. canonical جاری می‌تواند به `storeVersion>1` برسد؛ parser باید candidate اولیه را به‌صورت قطعی از envelope جاری replay کند: فقط prefix رکوردهای migrated با revisionهای source، بدون receipt، با `storeVersion=1` و زمان/report اولیه، سپس fingerprint نهایی. hash این replay باید با هر دو hash marker برابر باشد. بنابراین marker immutable می‌ماند، mutation فقط envelope جاری را تغییر می‌دهد و اولین create/update authority را ناخوانا نمی‌کند.

هیچ event/receipt زنده‌ای نمی‌تواند پیش از انتقال authority وجود داشته باشد. برای canonical با `storeVersion>1`، زمان اولین receipt باید `>= committedAt` marker باشد؛ غیرکاهشی بودن receiptهای بعدی این مرز را برای کل زنجیره حفظ می‌کند. writer نیز در برابر عقب‌رفتن ساعت، timestamp command را حداقل برابر `committedAt` و آخرین زمان canonical می‌سازد.

1. `pending`: source raw hash، dependency snapshot hash، identity binding، candidate raw و candidate raw hash را نگه می‌دارد؛
2. `verified`: پس از reread دقیق source/authority/dependencies و validate دوبارهٔ candidate؛
3. `committed`: فقط پس از نوشتن canonical و readback exact، authority را به v2 منتقل می‌کند.

قواعد:

- v1 تنها ورودی migration است و پس از committed authority نیست؛
- source خالی نیز candidate envelope خالی و marker committed می‌سازد تا v1 متأخر resurrect نشود؛
- pending/verified معتبر بعد از reload resume می‌شود؛
- تغییر source raw، authority، dependency snapshot یا candidate preimage fail-close است و چیزی overwrite نمی‌شود؛
- canonical یا marker خراب هیچ fallback ندارد؛
- canonical `storeVersion=1` باید byte-for-byte با hash اولیهٔ marker برابر باشد؛ canonical جدیدتر علاوه بر integrity و replay کامل خودش باید candidate اولیهٔ replay‌شده را به همان hash marker برساند؛
- mixed valid/invalid v1، duplicate proposal/revision و cross-project کل migration را رد می‌کند؛
- migration برای هر Proposal، Approval تاریخی exact مربوط به target Request revision، Contact revision exact و File immutable subset را resolve می‌کند؛ rename فایل مجاز است ولی ambiguity، File گمشده در migration یا dependency گمشده fail-close است؛
- candidate v2 قبل از هر write با parser کامل خودش validate می‌شود؛
- migration storeهای Comparison/Decision/Negotiation را نمی‌خواند یا نمی‌نویسد، جز تست compatibility پس از اتمام.

## ۷. command و mutation

```ts
type BuilderProposalCommand =
  | {
      inputSchemaVersion: 1;
      action: "create-proposal";
      projectId: string;
      proposalId: string;
      draft: BuilderRecordedProposalDraft;
      pins: BuilderProposalCommandPins;
      expectedStoreVersion: number;
      idempotencyKey: string;
    }
  | {
      inputSchemaVersion: 1;
      action: "update-proposal";
      projectId: string;
      proposalId: string;
      draft: BuilderRecordedProposalDraft;
      pins: BuilderProposalCommandPins;
      expectedStoreVersion: number;
      expectedProposalVersion: number;
      idempotencyKey: string;
    };
```

هر command:

1. exact parse می‌شود؛
2. زیر `procurementDispatchWriteLockName` اجرا می‌شود؛
3. authority/dependencies و canonical committed را commit-time می‌خواند؛
4. receipt قبلی را پیش از version conflict بررسی می‌کند؛ same key/same payload فقط با همان `commandPins` ماندگار نتیجهٔ قبلی را replay و same key/different payload یا pins متفاوت را رد می‌کند؛
5. expected store/record/dependency versions را exact می‌سنجد؛
6. no-op را قبل از timestamp/UUID تشخیص می‌دهد و هیچ byte/version تازه نمی‌سازد؛
7. revision، event، receipt و envelope SHA-256 تازه می‌سازد؛
8. preimage canonical/marker/dependencies را دوباره می‌سنجد؛
9. candidate را می‌نویسد و exact readback + post-dependency reread انجام می‌دهد؛
10. در شکست، فقط وقتی bytes جاری دقیقاً candidate خودش است، previous raw را restore و readback می‌کند؛ در غیر این صورت overwrite نمی‌کند و read-error می‌دهد.

Web Locks unavailable هیچ write نمی‌کند. همهٔ نتیجه‌ها status ساخت‌یافته دارند: `created`, `updated`, `unchanged`, `version-conflict`, `dependency-invalid`, `idempotency-payload-mismatch`, `write-failure`, `read-failure`, `lock-unavailable`, `schema-invalid`, `scope-mismatch`, `not-found`.

## ۸. اتصال UI

React state باید سه حالت `loading / ready / read-error` داشته باشد. `ready` envelope و records آن را نگه می‌دارد؛ empty فقط envelope معتبر با records خالی است.

خواندن canonical باید authority را مستقل از dependency reader بپذیرد. اگر authority معتبر است ولی snapshot جاری dependencies به‌دلیل read failure در دسترس نیست، نتیجه `ready` با همان envelope committed و `dependencyStatus="read-error"` است؛ فقط mutation بسته می‌شود. نبود authority معتبر همچنان read-error کامل است.

همین جداسازی در initialization نیز لازم است: reader می‌تواند برای store از قبل committed یک context شامل authority معتبر و `dependencies=null` برگرداند. در این حالت initialization فقط canonical/marker committed را می‌خواند و `ready + dependencyStatus="read-error"` می‌دهد. ساخت candidate تازه یا resume حالت pending/verified بدون dependencies کامل و معتبر ممنوع و fail-close است. شکل قدیمی reader که مستقیماً `BuilderProposalDependencies` می‌دهد برای سازگاری حفظ می‌شود.

تغییرهای UI:

- initialization Proposal پس از آماده‌شدن foundation/procurement dependencies و از service انجام می‌شود؛
- create/update `async` می‌شوند و command با expected versions بازشدن editor ساخته می‌شود؛
- editor به `projectId`، `expectedStoreVersion` و در edit به `expectedProposalVersion` زمان بازشدن bind می‌شود؛
- هر save attempt یک `proposalId`، `idempotencyKey`، `normalizedPayloadHash` و exact `pins` پایدار دارد. `normalizedPayloadHash` با normalizer همان domain service ساخته می‌شود؛ در failure مبهم یا retry با draft یکسان همهٔ این مقادیر reuse می‌شوند و pins یا expected versionها از state تازه جایگزین نمی‌شوند. فقط success/replay/no-op قطعی، بستن editor، یا تغییر draft attempt را باطل می‌کند. create هرگز در retry id تازه نمی‌سازد؛
- storage reconciliation ممکن است binding بازشدن editor را stale کند. stale binding برای mutation تازه بسته است؛ تنها استثنا، draft دقیقاً بدون تغییر همراه attempt قبلی است که اجازه دارد همان command ثبت‌شده را برای **بازیابی receipt** دوباره بفرستد. این مسیر حق rebind، refresh pins یا ساخت mutation تازه ندارد؛ اگر receipt متناظر وجود نداشته باشد، conflict/failure پیش‌نویس و attempt را حفظ می‌کند؛
- وقتی writer pending، storage loading یا read-error است فرم قابل‌ارسال نیست؛
- conflict/failure editor و draft را باز نگه می‌دارد و پیام دقیق روزمره نشان می‌دهد؛
- success state را فقط از envelope readback شده می‌گیرد؛
- no-op editor را با پیام موجود می‌بندد؛
- storage event روی v1/v2/marker Proposal، project canonical/marker/identity، Request/recovery-intent، Approval/marker/confirmation/precondition intent، Contact canonical/marker/queue intent و File metadata/source-intent reconciliation تازه اجرا می‌کند؛ تغییر authority یا identity mutation تازه را می‌بندد و draft را دور نمی‌ریزد، اما attempt بدون‌تغییر را فقط برای receipt replay با همان identity/pins قبلی نگه می‌دارد؛
- Comparison/Negotiation parserها فقط helper compatibility را استفاده می‌کنند و writer تازه SHA canonical را پین می‌کند؛
- متن‌های «خصوصی»، «ثبت دستی» و «چیزی ارسال نمی‌شود» تغییر معنایی نمی‌کنند.

## ۹. invariants و معیار پذیرش

BG-F6 فقط وقتی آمادهٔ تحویل محلی است که این موارد شواهد تست داشته باشند:

- valid v1 product/service به v2 exact و marker committed migrate شود؛
- Request target FNV موجود همراه SHA dependency wrapper حفظ شود و bytes targetهای product/service/negotiation موجود همچنان resolve شوند؛
- empty migration v1 متأخر را resurrect نکند؛
- pending/verified resume و source race fail-close باشد؛
- corrupt/future canonical، marker tamper، owner/scope mismatch و mixed array fallback نکنند؛
- revision و envelope فقط SHA-256 canonical داشته باشند؛ FNV Proposal-revision فقط legacy evidence است، در حالی‌که Request review FNV source طبق قرارداد upstream در target باقی می‌ماند؛
- Comparison/Negotiation موجود با FNV بدون تغییر bytes باز شود؛
- create/update receipt، idempotency، expected versions و exact `commandPins` ماندگار داشته باشد و parser payload را فقط با همان pins replay کند؛
- دو mutation هم‌زمان lost update نسازند؛
- lock-unavailable، stale dependency، write/readback failure و rollback failure fail-close باشند؛
- no-op bytes/storeVersion را تغییر ندهد؛
- receipt/event/revision chain، deterministic ids، store/result transitions و authorization/dependency chronology در برابر forgery هماهنگ ولی ناممکن fail-close باشند؛
- retry یک create/update با failure مبهم همان proposalId/idempotencyKey/payload hash/command pins را، حتی پس از reconciliationِ stale، فقط از مسیر receipt replay بازیابی کند و duplicate نسازد؛
- draft بازنده یا شکست‌خورده حفظ شود؛
- حذف metadata فایل یا Blob پس از committed Proposal را unreadable نکند؛ rename پیش از migration نیز snapshot تاریخی را حفظ کند؛
- storage event authority/identity و intentهای upstream stale submit را بدون حذف draft مسدود کند؛
- Proposal تاریخی با head dependency تازه پاک نشود و «نیازمند بررسی» بماند؛
- regressionهای Proposal/Comparison/Negotiation و revision diff پاس شوند؛
- در viewport `390×844` overflow افقی و request بیرونی تازه وجود نداشته باشد؛
- `npm run check:runtime`, `npm run build` و `git diff --check` پاس شوند؛
- `gate:release` فقط پس از مجوز صریح انتشار و freeze نهایی اسناد، دقیقاً یک‌بار روی همان candidate اجرا شود؛ هر تغییر بعدی receipt را باطل می‌کند.

**وضعیت تحقق در ۲۰۲۶/۰۹/۰۲:** همهٔ معیارهای تحویل محلی بالا بسته شدند. suite نهایی `BG-F6` برابر ۵۳/۵۳ و بستهٔ نمایندهٔ downstream برابر ۹/۹ پاس شد؛ `check:runtime` برای ۲۸ فایل محافظت‌شده، build/TypeScript/Vite/Sites prepare، `git diff --check`، QA واقعی `390 × 844` و بازبینی مستقل نیز پاس بودند. نخستین گیت مجاز بعداً با ۶ شکست Playwright از ۴۶۳ receipt نساخت: حد canonical Proposal به‌اشتباه ۱۶۰ بود و چند oracle T7/T8 هنوز v1 را می‌خواندند. حد مشترک با قرارداد ۲۰۰رقمی مقایسه هم‌تراز و oracleهای غیرمهاجرتی به v2 منتقل شدند؛ شش reproduction برابر ۶/۶ و بستهٔ عمیق T7/T8/BG-F6 برابر ۹۱/۹۱ پاس شد. ماهیار انتشار exact candidate اصلاح‌شده و ساخت continuation پس از receipt را صریحاً مجاز کرده است؛ تا گیت کامل تازه و رسید terminal، candidate همچنان uncommitted/unpublished است.

## ۱۰. ترتیب اجرا

1. تست‌های RED service برای parser/migration/cutover؛
2. هستهٔ `builderProposals.ts` و سبزکردن migration؛
3. تست‌های RED mutation/concurrency/idempotency/rollback؛
4. سبزکردن command service؛
5. تست‌های RED lineage compatibility و adapter UI؛
6. اتصال `Prototype.tsx` و سبزکردن regressionهای روزمره؛
7. QA متمرکز موبایل، runtime/build/diff check؛
8. به‌روزرسانی backlog/handoff/learning log با تفکیک تجربه، شکاف، تصمیم و پیشنهاد اصلاح سند مادر و بستن تحویل محلی؛
9. فقط پس از مجوز صریح کاربر و freeze همین bytes، اجرای یک‌بارهٔ gate و انتشار exact candidate طبق workflow release.
