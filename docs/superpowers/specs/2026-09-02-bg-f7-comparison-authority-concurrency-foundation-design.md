# طراحی BG-F7: زیربنای authority و هم‌زمانی Comparison

تاریخ: ۲۰۲۶/۰۹/۰۲  
وضعیت: طراحی تأییدشده توسط ماهیار؛ بازبینی داخلی بدون مانع تکمیل شد؛ در انتظار تأیید سند مکتوب پیش از برنامهٔ اجرا  
برش: `BG-F7 — Product/Service Comparison Authority & Concurrency Foundation`

## ۱. هدف و مرز برش

این برش فقط authority ماندگار Comparison محصول و Comparison خدمت را از دو آرایهٔ خام v1 به دو ledger دقیق، نسخه‌دار، fail-close و مقاوم در برابر هم‌زمانی ارتقا می‌دهد. هر دو ledger زیر یک `Comparison Domain Service` قرار می‌گیرند، اما schema، محاسبه و failure domain مستقل دارند.

تجربهٔ روزمره تغییر قابلیت نمی‌کند: سازنده همچنان پیشنهادهای دستی و خصوصی همان پروژه را مقایسه می‌کند؛ مقایسهٔ محصول محاسبهٔ قطعی و آشکار دارد و مقایسهٔ خدمت کیفی و بدون امتیاز یا رتبه‌بندی است.

این برش مجاز است:

- یک ماژول دامنهٔ مستقل با نام `prototype/src/builderProposalComparisons.ts` بسازد؛
- Comparison محصول و خدمت را در دو envelope canonical v2 جدا نگه دارد؛
- migration یک‌باره و crash-safe از دو آرایهٔ v1 بسازد؛
- revision، record، event، receipt، migration report و envelope را با SHA-256 bind کند؛
- owner، scope، AccountSide و custodian را صریح کند؛
- create/update را زیر Web Lock مشترک procurement با commit-time reread، expected version، idempotency، exact readback و candidate-owned rollback اجرا کند؛
- parser و writerهای UI را به service تازه وصل کند و draft را روی conflict یا failure حفظ کند؛
- Decision و Negotiation موجود را بدون تغییر bytes از طریق legacy comparison evidence قابل‌خواندن نگه دارد؛
- writerهای downstream تازه را وادار کند fingerprint canonical SHA همان ComparisonRevision را pin کنند؛
- تست‌های متمرکز migration، concurrency، rollback، lineage و UI را اضافه یا اصلاح کند.

این برش مجاز نیست:

- ComparisonDecision محصول یا خدمت را migrate یا canonical کند؛
- schema، authority، history یا bytes مذاکره را بازنویسی کند؛
- مشکل هم‌زمانی Decision یا Negotiation را بسته اعلام کند؛
- مقایسهٔ محصول و خدمت را در یک schema، فرم یا الگوریتم ادغام کند؛
- معیار، وزن، فرمول، امتیاز، رتبه‌بندی یا «بهترین» تازه بسازد؛
- Proposal، Request، Approval، Contact یا File/Photo را بازطراحی کند؛
- مسیر تأمین‌کننده، shared case، `case_private`، مدل، backend، sync، شبکه یا اثر بیرونی بسازد؛
- Builder Architecture Gate تاریخی را PASS اعلام یا rerun کند؛
- candidate اجرایی را پیش از تکمیل محلی و مجوز صریح exact candidate commit، push یا deploy کند؛ commit مستقل همین سند طراحی طبق فرایند طراحی، artifact برنامه‌ریزی است و مجوز انتشار محصول محسوب نمی‌شود؛
- سند مادر محصول را تغییر دهد.

## ۲. تصمیم معماری و گزینه‌های ردشده

### ۲.۱ تصمیم منتخب: یک service، دو ledger

`Comparison Domain Service` مالک منطق مشترک authority، hash، migration و command است، اما دو مخزن canonical جدا دارد:

- Product Comparison ledger؛
- Service Comparison ledger.

این تصمیم با قرارداد محصول هم‌راستاست: مسیر تجربه پوستهٔ مشترک دارد، ولی schema و منطق مقایسهٔ محصول و خدمت متفاوت است و نباید با یک فرم یا الگوریتم واحد اجرا شود.

مزیت‌های این انتخاب:

- خرابی یا migration یک خانواده، خانوادهٔ دیگر را از authority ساقط نمی‌کند؛
- منطق عددی محصول وارد مقایسهٔ کیفی خدمت نمی‌شود؛
- cutover دو کلید قدیمی به یک transaction مصنوعی و پرریسک تبدیل نمی‌شود؛
- دامنهٔ BG-F7 روی Comparison می‌ماند و Decision/Negotiation را جذب نمی‌کند.

هر دو ledger از Web Lock مشترک procurement استفاده می‌کنند تا Proposal و Comparison هنگام commit روی dependencyهای متفاوت رقابت نکنند. مستقل‌بودن ledger به معنی lock جدا یا اجازهٔ write هم‌زمان روی dependency مشترک نیست.

### ۲.۲ گزینهٔ ردشده: یک envelope discriminated-union

قرار دادن product و service در یک envelope، یک storeVersion و یک cutover می‌سازد؛ اما خرابی یک رکورد خدمت کل مقایسه‌های محصول را نیز unreadable می‌کند و migration دو source key را به یک نقطهٔ شکست اتمیک تبدیل می‌کند. این coupling برای برش فعلی ارزش کافی ندارد.

### ۲.۳ گزینهٔ ردشده: مهاجرت هم‌زمان ComparisonDecision

مهاجرت چهار store در یک برش بخشی از بدهی Gate را سریع‌تر می‌بندد، اما surface مهاجرت، receipt، concurrency و regression را تقریباً دو برابر می‌کند. Decision در این برش downstream مستقل می‌ماند و authority آن فقط در برش جدا اصلاح می‌شود.

## ۳. وضعیت موجود و علت تغییر

پیاده‌سازی فعلی در `Prototype.tsx` چهار آرایهٔ raw v1 دارد: Product Comparison، Product ComparisonDecision، Service Comparison و Service ComparisonDecision. Negotiation نیز store جدا دارد.

Comparisonهای فعلی این نقاط قوت را دارند:

- proposal/request lineage دقیق و project scoping؛
- history و revisionهای نسخه‌دار؛
- recompute خروجی مشتق و رد tamper ساده؛
- no-op معنایی؛
- نمایش read-error جدا از empty؛
- حفظ Proposal و Decision به‌عنوان storeهای جدا.

اما authority فعلی این شکاف‌ها را دارد:

- envelope، storeVersion، owner/scope/custodian و aggregate fingerprint ندارد؛
- revision fingerprint از FNV 32-bit استفاده می‌کند و record id را bind نمی‌کند؛
- writer کل آرایهٔ React را مستقیم می‌نویسد؛
- Web Lock، commit-time reread و optimistic concurrency ندارد؛
- idempotency key و receipt ندارد؛
- readback proof و rollback واقعی ندارد؛
- migration/cutover ندارد؛
- storage-event reconciliation کلیدهای Comparison را دنبال نمی‌کند؛
- parser می‌تواند هم‌زمان partial records و `readError=true` بسازد؛ authority نباید truth جزئی بدهد؛
- retry مبهم create می‌تواند Comparison تکراری بسازد؛
- Decision و Negotiation موجود fingerprint FNV Comparison را literal pin کرده‌اند و تغییر مستقیم آن‌ها را unreadable می‌کند.

## ۴. کلیدها و topology ماندگار

```ts
export const legacyBuilderProductComparisonsStorageKey =
  "chida-prototype-builder-proposal-comparisons:v1";
export const builderProductComparisonsStorageKey =
  "chida-prototype-builder-proposal-comparisons:v2";
export const builderProductComparisonsCutoverMarkerKey =
  `${builderProductComparisonsStorageKey}:cutover:v1`;

export const legacyBuilderServiceComparisonsStorageKey =
  "chida-prototype-builder-service-proposal-comparisons:v1";
export const builderServiceComparisonsStorageKey =
  "chida-prototype-builder-service-proposal-comparisons:v2";
export const builderServiceComparisonsCutoverMarkerKey =
  `${builderServiceComparisonsStorageKey}:cutover:v1`;
```

کلیدهای Decision و Negotiation تغییر نمی‌کنند. v1 Comparison پس از committed فقط source تاریخی migration است و هرگز authority یا fallback نیست. حذف فیزیکی v1 شرط BG-F7 نیست.

## ۵. قرارداد مشترک authority

### ۵.۱ ownership

هر Comparison record دقیقاً این binding را دارد:

```ts
type ComparisonOwnership = {
  ownerPrincipalType: "account";
  ownerPrincipalId: "local-builder-account";
  accountSide: "builder";
  scopeType: "project_private";
  scopeId: string; // exact projectId
  custodianService: "Comparison Domain Service";
  sensitivity: "private";
};
```

authority context از fixture نسخه‌دار Project/Identity می‌آید. mismatch مالک، scope، side، custodian یا project کل ledger همان kind را read-error می‌کند؛ رکوردهای سالم به‌صورت partial منتشر نمی‌شوند.

### ۵.۲ target مشترک

Comparison فقط وقتی معتبر است که همهٔ Proposal inputها دقیقاً به یک target وصل باشند:

```ts
type ComparisonTargetPin = {
  requestId: string;
  requestVersion: number;
  reviewRevisionId: string;
  reviewRevisionFingerprint: `fnv1a-${string}`;
  requestKind: "product" | "service";
};
```

`reviewRevisionFingerprint` تا وقتی Request authority مهاجرت نکرده همان fingerprint معتبر upstream می‌ماند و داخل SHA کل record/revision bind می‌شود؛ هیچ FNV تازه‌ای به‌عنوان integrity canonical Comparison تولید نمی‌شود.

چهار فیلد Request قدیمی مرز اشتراک همهٔ Proposalهای یک Comparison هستند. `requestDependencyFingerprint`، Approval، Contact و File binding در snapshot هر Proposal input نگه‌داری می‌شوند، نه به‌عنوان target مشترک Comparison. این جداسازی مهم است، چون v1 فقط همان چهار فیلد را برای grouping الزام کرده و ممکن است دو Proposal تاریخی با Request یکسان ولی dependency proofهای متفاوت داشته باشد.

### ۵.۳ snapshot مبدأ داخل revision

هر ComparisonRevision باید دادهٔ لازم برای بازتولید نتیجهٔ خودش را به‌صورت snapshot تغییرناپذیر نگه دارد؛ صرف id و fingerprint وابستگی برای خواندن تاریخچه کافی نیست.

هر input محصول یا خدمت حداقل این evidence را دارد:

- `proposalId / proposalVersion / proposalRevisionId / proposalRevisionFingerprint` با SHA canonical؛
- snapshot کامل همان `BuilderRecordedProposalRevision` شامل target، Request snapshot، Supplier snapshot، Contact pin، File reference، تاریخ، متن‌ها و lineها؛
- برابری دقیق id/version/fingerprintهای تکرارشدهٔ input با snapshot کامل؛
- برای خدمت، `proposalLineId / serviceSpecId` و شروط تجاری اعلامی که باید از همان snapshot قابل‌بازتولید باشند؛
- adjustment یا assessment ثبت‌شدهٔ سازنده با provenance موجود.

derive و validation داخلی فقط از snapshot ماندگار همان ComparisonRevision استفاده می‌کنند. dependency validation جداگانه، هنگام دسترس‌بودن Proposal authority، ثابت می‌کند snapshot با ProposalRevision pinned برابر است. در نتیجه history معتبر هنگام خطای موقت upstream قابل‌خواندن می‌ماند، ولی currentness و mutation تا بازیابی dependency قابل‌تأیید نیست.

### ۵.۴ envelopeهای مستقل

```ts
type BuilderProductComparisonEnvelope = {
  schemaVersion: 2;
  fingerprintVersion: "builder-product-comparison-domain-v2";
  storeVersion: number;
  records: BuilderProductComparisonRecord[];
  idempotencyReceipts: BuilderComparisonCommandReceipt[];
  migrationReports: [BuilderComparisonMigrationReport];
  updatedAt: string;
  fingerprint: `sha256-${string}`;
};

type BuilderServiceComparisonEnvelope = {
  schemaVersion: 2;
  fingerprintVersion: "builder-service-comparison-domain-v2";
  storeVersion: number;
  records: BuilderServiceComparisonRecord[];
  idempotencyReceipts: BuilderComparisonCommandReceipt[];
  migrationReports: [BuilderComparisonMigrationReport];
  updatedAt: string;
  fingerprint: `sha256-${string}`;
};
```

قواعد exact:

- کلید کم/اضافه، type مبهم، شناسه یا timestamp non-canonical و schema آینده رد می‌شود؛
- `records` و `receipts` ترتیب canonical قطعی دارند؛
- duplicate record/revision/event/receipt id، duplicate idempotency key، chronology ناممکن و سقف شکسته کل ledger را رد می‌کند؛
- چند Comparison مستقل با target Request یکسان مجازند، مشروط به id/history مستقل؛ migration هیچ‌کدام را merge یا drop نمی‌کند؛
- history و revisions باید زنجیرهٔ کامل `1..version` باشند؛
- `currentRevisionId` باید دقیقاً آخرین revision باشد و target/request snapshot ثابت record با همهٔ revisionها سازگار بماند؛
- derived product result یا service result باید از snapshotهای همان revision دقیقاً قابل‌بازتولید باشد؛
- record، revision، event، receipt، report و envelope fingerprint مستقل SHA دارند؛
- canonical حاضر با marker غایب/نامعتبر و marker حاضر با canonical نامعتبر read-error است؛
- reader هرگز partial records برنمی‌گرداند.

حدهای canonical همان ظرفیت قابل‌تولید فعلی را حفظ می‌کنند:

- حداکثر ۱۰۰۰ record در هر ledger و ۱۰۰ record برای هر project؛
- حداکثر ۱۰۰ revision/history event برای هر record؛
- حداکثر ۱۰٬۰۰۰ receipt در هر ledger؛
- ۲ تا ۸ Proposal input در هر revision؛
- حداکثر ۳۰۰ نویسه برای id و idempotency keyهای داخلی؛
- حداکثر ۵۰۰ نویسه برای assumption، declared value و rationale سازنده؛
- عدد canonical محصول حداکثر ۲۰۰ رقم کل و ۶۰ رقم اعشار دارد؛ نتیجهٔ موقت بزرگ‌تر فقط وقتی پذیرفته می‌شود که پس از canonicalization داخل همین حد قرار گیرد.

هر حد موجود upstream در snapshot Proposal/Request همچنان از parser همان authority می‌آید و در Comparison بزرگ‌تر نمی‌شود.

## ۶. مدل Product Comparison v2

محاسبهٔ محصول همان قرارداد T7-B1 را حفظ می‌کند:

- ۲ تا ۸ Proposal محصول؛
- یک project و یک target دقیق؛
- سه لایهٔ جدا: مقدار اعلامی، فرض/تعدیل سازنده، محاسبهٔ قطعی محلی؛
- decimal canonical و BigInt بدون Number پنهان یا rounding؛
- tax/transport با حالت‌های موجود؛
- نتیجه فقط `conditional | tie | insufficient-data`؛
- criterion ثابت `lowest-complete-normalized-total`؛
- نامزد فقط برای بررسی و نه «برنده»، سفارش یا تأیید خرید.

```ts
type BuilderProductComparisonRecord = ComparisonOwnership & {
  schemaVersion: 2;
  objectType: "builder-product-proposal-comparison";
  id: string;
  projectId: string;
  purpose: "compare-builder-recorded-product-proposals";
  target: ComparisonTargetPin & { requestKind: "product" };
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
  fingerprint: `sha256-${string}`;
};

type BuilderProductComparisonRevision = {
  schemaVersion: 2;
  kind: "product";
  comparisonId: string;
  projectId: string;
  scopeId: string;
  target: ComparisonTargetPin & { requestKind: "product" };
  id: string;
  version: number;
  createdAt: string;
  inputs: BuilderProductComparisonInput[];
  results: BuilderProposalComparisonProposalResult[];
  recommendation: BuilderProposalComparisonRecommendation;
  fingerprint: `sha256-${string}`;
};

type BuilderProductComparisonInput = BuilderProposalComparisonInput & {
  proposalRevisionFingerprint: `sha256-${string}`;
  proposalRevisionSnapshot: BuilderRecordedProposalRevision;
};
```

هر input، id/version/revision id و SHA fingerprint دقیق ProposalRevision را همراه snapshot مبدأ تعریف‌شده در بخش ۵.۳ نگه می‌دارد. migration مقدار FNV قدیمی Proposal input را فقط از طریق evidence معتبر Proposal v2 resolve و در canonical به SHA تبدیل می‌کند.

`inputs`، `results` و `recommendation` نام و projection روزمرهٔ فعلی را حفظ می‌کنند تا Decision، Negotiation و UI به adapter مبهم نیاز نداشته باشند. فیلدهای binding بالای revision مانع transplant همان body به Comparison یا پروژهٔ دیگر می‌شوند.

## ۷. مدل Service Comparison v2

مقایسهٔ خدمت همان قرارداد T7-B2 را حفظ می‌کند:

- ۲ تا ۸ Proposal خدمت برای یک target دقیق؛
- ده معیار مستقل موجود؛
- assessment فقط `aligned | partial | different | unknown | not-applicable`؛
- declared value و rationale سازنده جدا؛
- summary فقط `ready-for-human-decision | needs-clarification`؛
- `candidateProposalId` همیشه null؛
- `scoringUsed=false`، بدون score/rank/normalization یا arithmetic محصول؛
- شروط تجاری فقط snapshot اعلامی‌اند.

```ts
type BuilderServiceComparisonRecord = ComparisonOwnership & {
  schemaVersion: 2;
  objectType: "builder-service-proposal-comparison";
  id: string;
  projectId: string;
  purpose: "compare-builder-recorded-service-proposals";
  target: ComparisonTargetPin & { requestKind: "service" };
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
  fingerprint: `sha256-${string}`;
};

type BuilderServiceComparisonRevision = {
  schemaVersion: 2;
  kind: "service";
  comparisonId: string;
  projectId: string;
  scopeId: string;
  target: ComparisonTargetPin & { requestKind: "service" };
  id: string;
  version: number;
  createdAt: string;
  inputs: BuilderServiceComparisonInput[];
  results: BuilderServiceProposalComparisonProposalResult[];
  summary: BuilderServiceProposalComparisonSummary;
  fingerprint: `sha256-${string}`;
};

type BuilderServiceComparisonInput = BuilderServiceProposalComparisonInput & {
  proposalRevisionFingerprint: `sha256-${string}`;
  proposalRevisionSnapshot: BuilderRecordedProposalRevision;
};
```

Product و Service type مشترکِ ساختاریِ مبهم ندارند. helperهای generic فقط infrastructure را به اشتراک می‌گذارند؛ validator و derive هر kind مستقل است.

در هر دو kind، `results` دقیقاً هم‌ترتیب `inputs` است. line adjustmentهای محصول هم‌ترتیب lineهای Proposal snapshot و criteria خدمت دقیقاً در ترتیب ثابت ده‌معیاره‌اند. parser اجازهٔ sort یا normalize خاموش projection downstream را ندارد.

## ۸. event، receipt و legacy evidence

### ۸.۱ event

```ts
type BuilderComparisonEvent = {
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
  authorizationContextHash: `sha256-${string}`;
  dependencySnapshotHash: `sha256-${string}`;
  idempotencyKey: string | null;
  commandPayloadHash: `sha256-${string}` | null;
  fingerprint: `sha256-${string}`;
};
```

event id و revision id برای command زنده از attempt پایدار و نسخهٔ نتیجه به‌صورت قطعی ساخته یا یک‌بار capture می‌شوند؛ retry مبهم id تازه تولید نمی‌کند.

discriminantهای event exact هستند:

- `origin="v1-migration"` actor تاریخی v1 یعنی `actor="شما"` را بدون بازنویسی provenance حفظ می‌کند، فقط با `idempotencyKey=null` و `commandPayloadHash=null` معتبر است؛ dependency hash آن باید migration report را برابر کند و receipt ندارد؛
- `origin="live-command"` با `actor="شما"`، idempotency key و command payload hash غیر-null معتبر است و باید دقیقاً یک receipt متناظر داشته باشد؛
- `actorPrincipalId`، kind، comparison/project/scope id، revision id/version و timestamp باید با record/revision متناظر برابر باشند؛
- create فقط version 1 و update فقط version بزرگ‌تر از 1 است؛ migration history typeهای v1 را حفظ می‌کند ولی origin آن migration است.

### ۸.۲ receipt

هر ledger receiptهای خودش را نگه می‌دارد:

```ts
type BuilderComparisonCommandReceipt = {
  schemaVersion: 1;
  position: number;
  key: string;
  kind: "product" | "service";
  action: "create-comparison" | "update-comparison";
  payloadHash: `sha256-${string}`;
  projectId: string;
  recordId: string;
  expectedStoreVersion: number;
  expectedRecordVersion: number | null;
  commandPins: BuilderProductComparisonCommandPins | BuilderServiceComparisonCommandPins;
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
```

namespace idempotency برابر `(kind, key)` است. تکرار همان متن key در ledger دیگر تعارض نیست، ولی `kind` داخل receipt و hash bind می‌شود. در همان ledger، same key فقط وقتی replay می‌شود که تمام command fields، normalized draft، expected versionها و exact pins یکسان باشند؛ تغییر هر field با `idempotency-payload-mismatch` fail-close می‌شود. no-op هیچ receipt، timestamp، UUID، storeVersion یا byte تازه نمی‌سازد.

replay یک success ثبت‌شده پس از exact parse command و validation خود canonical/receipt، اما پیش از سنجش version و dependency جاری انجام می‌شود. بنابراین drift بعدی store یا dependency، نتیجهٔ attempt قبلاً committed را پنهان نمی‌کند؛ replay فقط read-only است و mutation یا rebind تازه نمی‌سازد.

### ۸.۳ command pins

```ts
type BuilderComparisonProposalCommandPin = {
  proposalId: string;
  proposalVersion: number;
  proposalRevisionId: string;
  proposalRevisionFingerprint: `sha256-${string}`;
  proposalRevisionSnapshotHash: `sha256-${string}`;
};

type BuilderProductComparisonCommandPins = {
  schemaVersion: 1;
  kind: "product";
  authorizationContextHash: `sha256-${string}`;
  identityBindingHash: `sha256-${string}`;
  proposalStoreVersion: number;
  proposalEnvelopeFingerprint: `sha256-${string}`;
  proposalDependencySnapshotHash: `sha256-${string}`;
  target: ComparisonTargetPin & { requestKind: "product" };
  requestSnapshotHash: `sha256-${string}`;
  proposalPins: BuilderComparisonProposalCommandPin[];
  expectedDependencySnapshotHash: `sha256-${string}`;
};

type BuilderServiceComparisonCommandPins = {
  schemaVersion: 1;
  kind: "service";
  authorizationContextHash: `sha256-${string}`;
  identityBindingHash: `sha256-${string}`;
  proposalStoreVersion: number;
  proposalEnvelopeFingerprint: `sha256-${string}`;
  proposalDependencySnapshotHash: `sha256-${string}`;
  target: ComparisonTargetPin & { requestKind: "service" };
  requestSnapshotHash: `sha256-${string}`;
  serviceRequestSnapshotHash: `sha256-${string}`;
  proposalPins: BuilderComparisonProposalCommandPin[];
  expectedDependencySnapshotHash: `sha256-${string}`;
};
```

`proposalPins` هم‌ترتیب normalized inputs است. هر pin به full ProposalRevision snapshot داخل input وصل است. `proposalDependencySnapshotHash` دقیقاً `BuilderProposalDependencies.snapshotHash` موجود است و Request، Approval، Contact و File metadata را پوشش می‌دهد؛ `proposalEnvelopeFingerprint/storeVersion` نیز headهای Proposal را bind می‌کند. بنابراین BG-F7 منطق hash یا currentness Proposal را کپی نمی‌کند.

برای mutation تازه، Comparison module یک helper pure و read-only از `builderProposals.ts` می‌خواند که currentness همان Proposal record را روی `BuilderProposalDependencies` معتبر می‌سنجد. این export schema یا writer Proposal را تغییر نمی‌دهد. migration فقط historical resolvability revisionهای pinned را می‌خواهد، نه current بودن head.

### ۸.۴ migration report

```ts
type BuilderComparisonSourceBinding =
  | {
      store: "builder-product-comparison";
      sourceGeneration: "none";
      sourceKey: null;
      sourceRawHash: null;
    }
  | {
      store: "builder-product-comparison";
      sourceGeneration: "v1-array";
      sourceKey: typeof legacyBuilderProductComparisonsStorageKey;
      sourceRawHash: `sha256-${string}`;
    }
  | {
      store: "builder-service-comparison";
      sourceGeneration: "none";
      sourceKey: null;
      sourceRawHash: null;
    }
  | {
      store: "builder-service-comparison";
      sourceGeneration: "v1-array";
      sourceKey: typeof legacyBuilderServiceComparisonsStorageKey;
      sourceRawHash: `sha256-${string}`;
    };

type BuilderComparisonMigrationReport = BuilderComparisonSourceBinding & {
  schemaVersion: 1;
  id: string;
  dependencySnapshotHash: `sha256-${string}`;
  identityBindingHash: `sha256-${string}`;
  migratedAt: string;
  recordCount: number;
  migratedRecordFingerprints: `sha256-${string}`[];
  migratedRevisionCount: number;
  fingerprint: `sha256-${string}`;
};
```

برای source v1، `sourceIndex`های evidence باید دقیقاً permutation کامل `0..recordCount-1` باشند و `migratedRecordFingerprints` در ترتیب sourceIndex ثبت شود. برای source `none` هر سه count/list صفر یا خالی‌اند. report id از store/source/dependency/identity/migrationAt به‌صورت قطعی ساخته می‌شود.

هر `migratedRecordFingerprint` hash projection همان record در لحظهٔ migration است: فقط prefix revision/history منبع، بدون live event بعدی. این projection باید از record جاری حتی پس از updateهای زنده replay شود تا report و committed marker immutable بمانند.

### ۸.۵ legacy evidence

```ts
type BuilderComparisonLegacyEvidenceSource =
  | {
      kind: "product";
      sourceKey: typeof legacyBuilderProductComparisonsStorageKey;
    }
  | {
      kind: "service";
      sourceKey: typeof legacyBuilderServiceComparisonsStorageKey;
    };

type BuilderComparisonLegacyEvidence = BuilderComparisonLegacyEvidenceSource & {
  schemaVersion: 1;
  comparisonId: string;
  projectId: string;
  sourceGeneration: "v1-array";
  sourceIndex: number;
  sourceRecordHash: `sha256-${string}`;
  sourceRecordVersion: number;
  sourceCreatedAt: string;
  sourceUpdatedAt: string;
  revisionLinks: Array<{
    revisionId: string;
    revisionVersion: number;
    sourceRevisionValueHash: `sha256-${string}`;
    proposalFingerprintClaims: Array<{
      proposalId: string;
      proposalRevisionId: string;
      claimedFingerprint: `fnv1a-${string}` | `sha256-${string}`;
    }>;
    legacyFingerprint: `fnv1a-${string}`;
    canonicalFingerprint: `sha256-${string}`;
  }>;
  fingerprint: `sha256-${string}`;
};
```

FNV فقط compatibility evidence است. parser migration باید source v1 را با قواعد و derive قدیمی بازسازی، FNV را مستقل محاسبه و سپس mapping را SHA-bind کند. `proposalFingerprintClaims` رشتهٔ دقیق هر input در source revision را، به همان ترتیب، حفظ می‌کند؛ این مقدار می‌تواند FNV قدیمی یا SHA پس از BG-F6 باشد. از canonical revision و این claims باید exact legacy revision projection و `sourceRecordHash` مستقل replay شود. دادهٔ ادعایی، ترتیب عوض‌شده یا mapping قابل‌ویرایش پذیرفته نمی‌شود.

`kind/sourceKey` در legacy evidence discriminated و exact است. همچنین `kind`، `comparisonId` و `projectId` باید با record enclosing برابر باشند و source key/generation/hash و sourceIndex آن باید دقیقاً با migration report و projection همان source record resolve شود؛ مقدار آزاد، کلید خانوادهٔ دیگر یا evidence قابل‌جابه‌جایی invalid است.

helper واحد زیر برای downstream export می‌شود:

```ts
builderComparisonRevisionFingerprintMatches(
  comparison,
  revision,
  claimedFingerprint,
): boolean
```

این helper فقط canonical SHA خود revision یا FNV موجود در `legacyEvidence` همان revision را می‌پذیرد. ComparisonDecision و Negotiation reader به‌جای literal equality از آن استفاده می‌کنند. bytes آن storeها تغییر نمی‌کند.

### ۸.۶ canonical serialization، hash و replay

`builderComparisonHash` همان SHA-256 آزمودهٔ procurement را استفاده می‌کند:

1. object keyها در همهٔ عمق‌ها به ترتیب lexicographic مرتب می‌شوند؛
2. ترتیب array حفظ می‌شود مگر schema صریحاً ترتیب دیگری تعیین کند؛
3. خروجی بدون whitespace با `JSON.stringify` سریال می‌شود؛
4. fingerprint هر object برابر hash همان object پس از حذف فقط field `fingerprint` خودش است؛
5. raw source/candidate hash روی string دقیق ذخیره‌شده، بدون parse/reserialize، محاسبه می‌شود.

preimage همهٔ hashهای نام‌دار exact است:

```ts
type ComparisonRequestSnapshotPreimage = {
  schemaVersion: 1;
  kind: "product" | "service";
  projectId: string;
  target: ComparisonTargetPin;
  requestSnapshot: BuilderRecordedProposalRequestSnapshot;
};

type ComparisonServiceRequestSnapshotPreimage = {
  schemaVersion: 1;
  kind: "service";
  projectId: string;
  target: ComparisonTargetPin & { requestKind: "service" };
  serviceRequestSnapshot: BuilderServiceProposalComparisonRequestSnapshot;
};

type ComparisonProposalSnapshotPreimage = {
  schemaVersion: 1;
  proposalId: string;
  proposalVersion: number;
  proposalRevisionId: string;
  proposalRevisionFingerprint: `sha256-${string}`;
  proposalRevisionSnapshot: BuilderRecordedProposalRevision;
};

type ComparisonDependencyPreimage = {
  schemaVersion: 1;
  kind: "product" | "service";
  projectId: string;
  identityBindingHash: `sha256-${string}`;
  authorizationContextHash: `sha256-${string}`;
  proposalStoreVersion: number;
  proposalEnvelopeFingerprint: `sha256-${string}`;
  proposalDependencySnapshotHash: `sha256-${string}`;
  target: ComparisonTargetPin;
  requestSnapshotHash: `sha256-${string}`;
  serviceRequestSnapshotHash: `sha256-${string}` | null;
  proposalPins: BuilderComparisonProposalCommandPin[];
};

type ComparisonMigrationDependencyPreimage = {
  schemaVersion: 1;
  store: "builder-product-comparison" | "builder-service-comparison";
  authoritySnapshotHash: `sha256-${string}`;
  identityBindingHash: `sha256-${string}`;
  proposalCanonicalRawHash: `sha256-${string}`;
  proposalCommittedMarkerRawHash: `sha256-${string}`;
  proposalStoreVersion: number;
  proposalEnvelopeFingerprint: `sha256-${string}`;
  proposalDependencySnapshotHash: `sha256-${string}`;
};
```

- `requestSnapshotHash = hash(ComparisonRequestSnapshotPreimage)` روی snapshot کامل Request داخل ProposalRevision؛
- `serviceRequestSnapshotHash = hash(ComparisonServiceRequestSnapshotPreimage)` روی projection ده‌معیارهٔ service؛ برای product این field در command pins وجود ندارد و در dependency preimage مقدار null دارد؛
- `proposalRevisionSnapshotHash = hash(ComparisonProposalSnapshotPreimage)`؛
- `expectedDependencySnapshotHash = hash(ComparisonDependencyPreimage)`؛
- `dependencySnapshotHash` در migration report/marker برابر `hash(ComparisonMigrationDependencyPreimage)` است؛ Proposal raw/marker باید authority committed معتبر باشند؛
- `authoritySnapshotHash` داخل migration preimage عیناً `ProcurementDispatchAuthority.snapshotHash` پس از exact validation همان authority است؛
- `sourceRevisionValueHash = hash(exact parsed v1 revision value including its legacy fingerprint)`؛
- `sourceRecordHash = hash(exact parsed v1 record value including all legacy revisions/fingerprints)`؛
- `sourceRawHash/candidateRawHash/canonicalRawHash = hash(exact raw string)`؛
- `identityBindingHash` و `authorizationContextHash` hash تازهٔ BG-F7 نیستند: پس از exact validation `ProcurementDispatchAuthority` عیناً از `authority.identityBindingHash` و `authority.authorizationHashes[projectId]` کپی می‌شوند؛
- fingerprintهای object طبق قانون حذف fingerprint خود object محاسبه می‌شوند و هیچ field دیگری حذف نمی‌شود.

عبارت «حداقل» در تعریف command pins به معنی extensible بودن preimage نیست؛ typeهای بخش ۸.۳ exact هستند و field اضافه رد می‌شود.

ترتیب‌های هنجاری:

- records بر اساس id با مقایسهٔ code-point صعودی؛
- revisions و history بر اساس version پیوسته؛
- receipts بر اساس position پیوسته؛
- migration fingerprints بر اساس sourceIndex؛
- inputs/results در ترتیب normalized انتخاب؛
- lineها در ترتیب Proposal snapshot و criteria خدمت در ترتیب ثابت catalog.

revision fingerprint حداقل `schemaVersion/kind/comparisonId/projectId/scopeId/target/body` را bind می‌کند. event fingerprint علاوه بر هویت record/revision، actor/authority/dependency/idempotency/payload را bind می‌کند. record fingerprint تمام ownership، target، history، revisions و legacy evidence را bind می‌کند. receipt، report، envelope و marker نیز تمام fieldهای خود جز fingerprint خودشان را bind می‌کنند.

رابطهٔ writer-producible دقیق:

- `storeVersion === idempotencyReceipts.length + 1`؛
- receipt position برابر `1..N`، `expectedStoreVersion === position` و `resultingStoreVersion === position + 1`؛
- برای create، expected record version null و resulting record version 1 است؛ برای update، resulting برابر expected + 1 است؛
- هر live event دقیقاً یک receipt و هر receipt دقیقاً یک live event/revision دارد؛
- event و receipt روی key، payload hash، dependency hash، authority hash، record/revision id، version و timestamp برابرند؛ `receipt.expectedDependencySnapshotHash` نیز باید دقیقاً با `receipt.commandPins.expectedDependencySnapshotHash` و `event.dependencySnapshotHash` برابر باشد؛
- هر migrated revision/event دقیقاً یک entry در legacy evidence دارد و receipt ندارد؛
- envelope اولیه فقط migrated records دارد؛ live revisions فقط پس از committedAt ممکن‌اند؛
- parser باید receiptها را از candidate اولیه به ترتیب position fold کند، هر action را روی state قبلی replay کند و در پایان دقیقاً records، history/revisions، receipts، storeVersion، updatedAt و envelope fingerprint جاری را بازتولید کند؛ update پیش از create یا predecessor ناموجود رد می‌شود؛
- `updatedAt` envelope برابر migrationAt در نبود receipt و در غیر این صورت برابر timestamp آخرین receipt است؛
- timestampهای live با `max(Date.now(), committedAt, envelope.updatedAt, dependency dates)` clamp و غیرکاهشی می‌شوند.

golden vectorهای مستقل برای revision، event، record، receipt، report، envelope و هر سه marker باید hash ثابت موردانتظار داشته باشند. عبارت «coherent rehash» در این برش فقط بازنویسیِ structurally non-writer-producible است که با authority/dependency/receipt/replay موجود سازگار نیست؛ SHA بدون secret ادعای مقاومت در برابر مهاجمی که تمام anchorهای local را هم‌زمان بازنویسی می‌کند ندارد.

## ۹. dependency snapshot و وضعیت مؤثر

command فقط snapshot بازشدن editor را اعتماد نمی‌کند. دو type دقیق `BuilderProductComparisonCommandPins` و `BuilderServiceComparisonCommandPins` حداقل این موارد را نگه می‌دارند:

- authorization context و project identity؛
- kind و target Request؛
- تمام Proposal id/version/revision id/SHA fingerprintهای انتخاب‌شده؛
- full ProposalRevision snapshot و Proposal currentness در لحظهٔ attempt، شامل Approval/Contact/File proof هر input؛
- برای خدمت، Request service snapshot دقیق؛
- dependency snapshot hash قطعی.

در commit، زیر همان lock مشترک:

- Project/Identity authority؛
- ledger Comparison همان kind؛
- Proposal v2 authority؛
- Request، Approval، Contact، File metadata و intentهای storage لازم برای currentness

دوباره خوانده می‌شوند. تغییر dependency، project، scope، Proposal head، Request review، Approval، Contact، File metadata یا intent مرتبط باعث `dependency-invalid` می‌شود و هیچ Comparison byte نوشته نمی‌شود.

currentness از یک helper read-only صادرشده توسط `builderProposals.ts` به‌دست می‌آید تا BG-F7 منطق Proposal را کپی نکند. تغییر File metadata یا source/recovery intent مرتبط نیز مانند Proposal writer همان attempt تازه را می‌بندد. نبود Blob پس از ثبت، طبق قرارداد Proposal، availability را تغییر می‌دهد و به‌تنهایی تاریخچهٔ Comparison را ناخوانا نمی‌کند.

canonical Comparison تاریخچهٔ خودش را حتی پس از تغییر upstream نگه می‌دارد. تغییر dependency آن را حذف یا rebind نمی‌کند؛ وضعیت مؤثر آن `needs-review` می‌شود. read failure dependency با empty فرق دارد: history معتبر Comparison می‌تواند از authority خودش دیده شود، اما currentness تأیید نمی‌شود و mutation بسته می‌ماند.

برای این جداسازی، parser دو مرحله دارد:

1. validation داخلی و SHA-bound خود envelope/record/revision بدون نیاز به state جاری upstream؛
2. dependency validation روی Proposal/Request/Approval/Contact/File و intentهای لازم در صورت دسترس‌بودن.

migration و resume pending/verified بدون dependency کامل و معتبر ممنوع است.

در این جمله «معتبر» دو سطح جدا دارد:

- **historically resolvable:** authorityهای لازم خوانا هستند و هر ProposalRevision pinned، evidence قدیمی، Request snapshot و dependency snapshot تاریخی دقیقاً resolve می‌شود؛ این شرط migration است؛
- **currently effective:** Proposal هنوز head جاری است و Request/Approval/Contact/File proof فعلی اجازهٔ mutation تازه می‌دهد؛ این شرط migration نیست و فقط وضعیت `current` یا `needs-review` را پس از cutover تعیین می‌کند.

بنابراین Comparison تاریخیِ معتبر حتی پس از جلو رفتن Proposal head یا تغییر currentness مهاجرت می‌کند و `needs-review` می‌ماند. migration هیچ history معتبری را به‌دلیل stale بودن حذف نمی‌کند.

## ۱۰. migration و cutover مستقل

هر ledger marker سه‌حالتهٔ exact خودش را دارد:

```ts
type BuilderComparisonPendingMarker = BuilderComparisonSourceBinding & {
  schemaVersion: 1;
  state: "pending";
  migrationId: string;
  dependencySnapshotHash: `sha256-${string}`;
  identityBindingHash: `sha256-${string}`;
  migrationAt: string;
  candidateRaw: string;
  candidateRawHash: `sha256-${string}`;
  fingerprint: `sha256-${string}`;
};

type BuilderComparisonVerifiedMarker = BuilderComparisonSourceBinding & {
  schemaVersion: 1;
  state: "verified";
  migrationId: string;
  dependencySnapshotHash: `sha256-${string}`;
  identityBindingHash: `sha256-${string}`;
  migrationAt: string;
  candidateRaw: string;
  candidateRawHash: `sha256-${string}`;
  verifiedAt: string;
  fingerprint: `sha256-${string}`;
};

type BuilderComparisonCommittedMarker = BuilderComparisonSourceBinding & {
  schemaVersion: 1;
  state: "committed";
  migrationId: string;
  dependencySnapshotHash: `sha256-${string}`;
  identityBindingHash: `sha256-${string}`;
  migrationAt: string;
  verifiedAt: string;
  committedAt: string;
  candidateRawHash: `sha256-${string}`;
  canonicalRawHash: `sha256-${string}`;
  fingerprint: `sha256-${string}`;
};
```

`migrationAt <= verifiedAt <= committedAt` الزامی است. `migrationAt = max(Date.now(), latest source record/history/revision timestamp, latest exact historical dependency timestamp)` است؛ parser نیز عقب‌تر بودن آن از هر preimage مهاجرتی را رد می‌کند. `report.migratedAt === marker.migrationAt`، `marker.migrationId === report.id` و `candidate.migrationReports[0]` دقیقاً همان report هستند. marker/report/envelope باید روی store، migration id، source hash، dependency hash، identity binding و candidate اولیه یکسان باشند. در marker committed، `candidateRawHash === canonicalRawHash` و هر دو hash همان candidate اولیهٔ نوشته‌شده در canonical key هستند؛ تغییرات زندهٔ بعدی این anchor را عوض نمی‌کنند.

ترتیب:

1. v1 raw یا absence آن، authority و dependencies خوانده و hash می‌شوند؛
2. تمام v1 records همان kind exact parse و به v2 تبدیل می‌شوند؛ یک رکورد نامعتبر کل migration را رد می‌کند؛
3. candidate envelope با `storeVersion=1` و یک migration report ساخته و با parser v2 validate می‌شود؛
4. marker `pending` نوشته و exact readback می‌شود؛
5. source/authority/dependencies/candidate preimage دوباره خوانده می‌شوند؛
6. marker `verified` نوشته و exact readback می‌شود؛
7. canonical candidate نوشته و exact readback می‌شود؛
8. marker `committed` نوشته و exact readback می‌شود؛ فقط از این نقطه v2 authority است.

قواعد:

- migration محصول و خدمت مستقل ولی هر دو زیر lock مشترک‌اند؛
- empty source نیز envelope خالی و marker committed می‌سازد تا v1 متأخر resurrect نشود؛
- pending و verified معتبر پس از reload resume می‌شوند؛
- تغییر source raw، identity، dependency یا candidate preimage پیش از commit fail-close است؛
- canonical یا marker خراب fallback ندارد؛
- canonical حاضر پیش از committed authority محسوب نمی‌شود؛ resume فقط با marker معتبر و exact candidate ممکن است؛
- committed marker به candidate اولیهٔ `storeVersion=1` bind می‌ماند؛ envelope جدیدتر باید prefix اولیه را deterministic replay کند؛
- candidate اولیه باید دقیقاً از migrated prefix، بدون receipt/live event، بازتولید شود و hash آن با `candidateRawHash` و `canonicalRawHash` marker برابر باشد؛
- v1 bytes، Decision bytes و Negotiation bytes در migration نوشته، normalize یا حذف نمی‌شوند؛
- migration شناسه‌ها، revision idها، نسخه‌ها، ترتیب history، timestampها و semantic payloadهای v1 را حفظ می‌کند؛ schema با ownership، source snapshot، SHA و evidence گسترش می‌یابد؛
- migration inputهای Proposal با legacy FNV را فقط از evidence معتبر Proposal v2 به SHA canonical تبدیل می‌کند؛
- یک history می‌تواند Proposal fingerprintهای FNV و SHA را در revisionهای مختلف یا حتی inputهای مختلف داشته باشد؛ هر claim دقیق حفظ و مستقل resolve می‌شود؛
- جلو رفتن Proposal head مانع migration revision تاریخیِ resolveشدنی نیست و فقط effective status را `needs-review` می‌کند؛
- source v1 هماهنگ ولی writer-impossible، cross-project، duplicate id یا دارای chronology/derived result ناممکن رد می‌شود؛ target Request یکسان میان recordهای مستقل مجاز است؛
- تغییر source، identity، historical dependency یا candidate در هر نقطه پیش از committed باید بدون authority جزئی و بدون write ناخواسته به ledger دیگر fail-close شود؛
- نخستین live receipt باید timestamp برابر یا بعد از committedAt داشته باشد و تمام receiptهای بعدی غیرکاهشی باشند.

## ۱۱. command و mutation

```ts
type BuilderComparisonCommand =
  | {
      inputSchemaVersion: 1;
      kind: "product";
      action: "create-comparison";
      projectId: string;
      comparisonId: string;
      draft: BuilderProductComparisonDraft;
      pins: BuilderProductComparisonCommandPins;
      expectedStoreVersion: number;
      idempotencyKey: string;
    }
  | {
      inputSchemaVersion: 1;
      kind: "product";
      action: "update-comparison";
      projectId: string;
      comparisonId: string;
      draft: BuilderProductComparisonDraft;
      pins: BuilderProductComparisonCommandPins;
      expectedStoreVersion: number;
      expectedComparisonVersion: number;
      idempotencyKey: string;
    }
  | {
      inputSchemaVersion: 1;
      kind: "service";
      action: "create-comparison";
      projectId: string;
      comparisonId: string;
      draft: BuilderServiceComparisonDraft;
      pins: BuilderServiceComparisonCommandPins;
      expectedStoreVersion: number;
      idempotencyKey: string;
    }
  | {
      inputSchemaVersion: 1;
      kind: "service";
      action: "update-comparison";
      projectId: string;
      comparisonId: string;
      draft: BuilderServiceComparisonDraft;
      pins: BuilderServiceComparisonCommandPins;
      expectedStoreVersion: number;
      expectedComparisonVersion: number;
      idempotencyKey: string;
    };
```

discriminant `kind` باید با draft، target، ledger و requestKind دقیقاً هم‌خوان باشد؛ cast یا union مبهم پذیرفته نمی‌شود.

هر command:

1. پیش از هر storage/dependency probe exact parse می‌شود؛
2. زیر `procurementDispatchWriteLockName` اجرا می‌شود؛ Web Locks unavailable هیچ write نمی‌کند؛
3. authority و canonical committed همان ledger را می‌خواند و chain داخلی را validate می‌کند؛
4. receipt قبلی را پیش از live dependency read و version conflict می‌سنجد؛ same exact attempt فقط نتیجهٔ قبلی را read-only replay می‌کند؛
5. اگر receipt نبود، Proposal/Request/Approval/Contact/File dependencies را commit-time می‌خواند؛
6. expected store/record versions، project/scope و exact pins را می‌سنجد؛
7. normalization و derive kind-specific را از source revisionهای pinned دوباره اجرا می‌کند؛
8. no-op را پیش از timestamp/id تشخیص می‌دهد و bytes را ثابت نگه می‌دارد؛
9. revision، event، receipt، record و envelope SHA تازه می‌سازد؛
10. preimage canonical/marker/dependencies را بلافاصله پیش از write دوباره می‌سنجد؛
11. candidate را می‌نویسد و canonical و dependencies را exact reread می‌کند؛
12. در شکست، فقط وقتی bytes جاری دقیقاً candidate خودش است previous raw را restore و exact readback می‌کند؛ در صورت writer مداخله‌گر overwrite نمی‌کند.

statusهای ساخت‌یافته حداقل این‌ها هستند:

`created`, `updated`, `unchanged`, `version-conflict`, `dependency-invalid`, `idempotency-payload-mismatch`, `write-failure`, `read-failure`, `rollback-failure`, `lock-unavailable`, `schema-invalid`, `scope-mismatch`, `not-found`.

success فقط از envelope readback‌شده به React state می‌رسد؛ write call یا toast به‌تنهایی success نیست.

`payloadHash` receipt روی تمام command به‌جز خود `idempotencyKey` محاسبه می‌شود: input schema، kind، action، project/comparison id، normalized draft، pins و expected versionها. receipt parser باید command payload متناظر را از revision و receipt بازسازی و همان hash را دوباره به‌دست آورد.

## ۱۲. اتصال UI و reconciliation

برای هر kind state مستقل وجود دارد:

```ts
type BuilderComparisonState<TEnvelope> =
  | { status: "loading"; envelope: null; dependencyStatus: "unknown" }
  | { status: "read-error"; envelope: null; dependencyStatus: "read-error"; reason: string }
  | { status: "ready"; envelope: TEnvelope; dependencyStatus: "current" | "read-error" };
```

`dependencyStatus="current"` فقط یعنی authorityهای upstream قابل‌خواندن و قابل‌اعتبارسنجی‌اند؛ به معنی current بودن همهٔ Comparison recordها نیست. `current | needs-review` برای هر record/revision جداگانه مشتق می‌شود، تا کهنه‌شدن یک رکورد کل ledger سالم را قفل نکند.

قواعد editor:

- create/edit به `projectId`، kind، `expectedStoreVersion` و برای edit به `expectedComparisonVersion` زمان بازشدن bind می‌شود؛
- هر save attempt یک `comparisonId`، `idempotencyKey`، normalized payload hash و exact pins پایدار دارد؛
- retry draft بدون تغییر همان attempt را فقط برای replay receipt استفاده می‌کند؛
- تغییر draft attempt قبلی را باطل و attempt تازه می‌سازد؛
- storage reconciliation می‌تواند binding را stale کند، اما draft را پاک یا به project/revision تازه rebind نمی‌کند؛
- هنگام writer pending، loading، read-error، dependency unreadable یا stale بودن binding همان editor submit تازه disabled است؛
- conflict، lock/write/readback/rollback failure و نتیجهٔ مبهم editor و draft را باز نگه می‌دارند؛
- پیام خطا بین conflict، تغییر source، خطای خواندن و خطای ذخیره فرق می‌گذارد؛
- create retry id تازه نمی‌سازد؛
- success/replay/no-op قطعی editor را با رفتار focus فعلی می‌بندد؛
- storage read-error empty state یا count صفر نشان نمی‌دهد.

نگاشت نتیجهٔ command به state/UI:

- `created | updated | unchanged` یا receipt replay موفق: envelope فقط از reread exact گرفته می‌شود؛ editor بسته و attempt پاک می‌شود؛
- `version-conflict | dependency-invalid | idempotency-payload-mismatch | lock-unavailable | schema-invalid | scope-mismatch | not-found`: ledger سالم reread می‌شود، editor/draft باز و attempt لازم برای توضیح یا replay حفظ می‌شود؛
- `write-failure` با rollback موفق: state به preimage خوانده‌شده برمی‌گردد و draft باز می‌ماند؛
- `read-failure` یا موفقیت مبهمی که post-command state را نتوان تأیید کرد: ledger به `read-error` می‌رود، editor/draft و همان attempt برای receipt replay حفظ می‌شوند؛
- `rollback-failure`: نتیجهٔ command همان نام را نگه می‌دارد و ledger/UI به `read-error` fail-close می‌روند؛ این دو عبارت متناقض نیستند، اولی result و دومی state حاصل است؛
- هیچ failure count صفر، success toast یا focus روی detail تولید نمی‌کند.

reconciliation کلیدهای زیر را می‌شنود:

- v1/v2/marker هر دو Comparison ledger؛
- Proposal v1/v2/marker؛
- Project/Identity authority؛
- Request و recovery intent؛
- Approval/marker/confirmation intent؛
- Contact/marker/queue intent.
- File metadata، Source intake/recovery intent و هر کلیدی که Proposal currentness helper مصرف می‌کند.

Product read-error، Service authority سالم را خراب نمی‌کند و بالعکس. بااین‌حال reader فعلی Negotiation که هر دو Comparison family را dependency می‌داند می‌تواند در خرابی یکی کل Negotiation را موقتاً unavailable کند؛ جداسازی آن بدهی خارج از BG-F7 است و نباید در این برش پنهانی بازطراحی شود.

## ۱۳. سازگاری Decision و Negotiation

زنجیرهٔ lineage ثابت است:

`ProposalRevision → ComparisonRevision → ComparisonDecision / NegotiationDraft`

قواعد:

- هیچ Decision یا Negotiation record در migration نوشته نمی‌شود؛
- readerهای آن‌ها Comparison را از v2 می‌گیرند؛
- target قدیمی FNV فقط با legacy evidence همان id/revision/version resolve می‌شود؛
- target تازه SHA canonical همان ComparisonRevision را ثبت می‌کند؛
- فقط ساخت یک Decision یا Negotiation record تازه SHA را pin می‌کند؛ update رکورد قدیمی target FNV خام خودش را برای تمام revisionهای بعدی حفظ می‌کند؛
- compatibility resolver target descendant را در حافظه normalize یا بازنویسی نمی‌کند؛ fingerprint revision تازهٔ descendant با همان target ماندگار record محاسبه می‌شود؛
- تغییر head Comparison descendant قدیمی را historical می‌کند و bytes آن را بازنویسی نمی‌کند؛
- cross-kind، cross-project، wrong version/id یا fingerprint نامعتبر fail-close است؛
- Decision همچنان شیء مستقل با reason است و Comparison source را mutate نمی‌کند؛
- concurrency و migration خود Decision/Negotiation باز می‌ماند؛
- ضعف موجود product Decision که currentness را در writer به‌اندازهٔ service دوباره نمی‌سنجد در backlog بعدی ثبت می‌شود و BG-F7 را بزرگ نمی‌کند.

## ۱۴. TDD و شواهد پذیرش

پیاده‌سازی فقط پس از تست RED آغاز می‌شود. بستهٔ BG-F7 باید حداقل این قراردادها را به‌صورت parameterized برای product/service پوشش دهد:

1. migration v1 معتبر به دو v2 canonical با SHA و owner/scope؛
2. حفظ actor تاریخی `شما` و تفکیک فرایند انتقال فقط با `origin="v1-migration"`؛
3. migration history دارای claims ترکیبی Proposal FNV/SHA؛
4. migration Comparison تاریخی پس از جلو رفتن Proposal head؛
5. مهاجرت چند Comparison مستقل با target Request یکسان بدون merge/drop؛
6. حفظ Decision و Negotiation FNV target، شامل revision غیر-head، بدون تغییر bytes؛
7. pin شدن downstream تازه به Comparison SHA و حفظ target قدیمی هنگام update descendant؛
8. resume marker معتبر در حالت pending؛
9. resume marker معتبر در حالت verified؛
10. source/identity/historical-dependency/candidate drift پیش از commit با zero authority؛
11. empty cutover و عدم resurrection v1 متأخر؛
12. canonical/marker/future-schema corruption بدون fallback؛
13. exact-key parsing، identifier/timestamp canonical و boundary/one-over تمام سقف‌های record/project/revision/receipt/input/id/text؛
14. mixed invalid v1، duplicate id، cross-project و impossible chronology؛
15. golden hash vectors مستقل و writer-impossible rehash/derived mismatch؛
16. exact report/evidence/sourceIndex replay و receipt/event/revision bijection؛
17. boundary عدد ۲۰۰رقمی/۶۰ اعشار و رد oversize غیرcanonical؛
18. no-op با bytes و version ثابت؛
19. update واقعی با history/revision append-only؛
20. exact idempotency replay پس از store/dependency drift و رد تغییر هر command field؛
21. same-ledger create/create از یک expectedStoreVersion با یک success و یک conflict؛ retry صریحِ بازنده روی binding تازه هر دو record را حفظ می‌کند؛
22. same-record update/update با یک winner و conflict صریح؛
23. product/service cross-ledger success زیر lock مشترک؛
24. failure یک ledger هنگام cutover بدون خرابی ledger دیگر؛
25. queued writer با Proposal/Request/Approval/Contact/File یا intent تغییرکرده و zero write؛
26. clamp قطعی migration/live timestamp زیر clock عقب‌رفته و dependency جدیدتر؛
27. write failure پیش از commit؛
28. readback mismatch با candidate-owned rollback؛
29. rollback collision بدون overwrite writer دیگر؛
30. rollback failure با command result و ledger read-error صریح؛
31. lock unavailable با zero write؛
32. storage event، stale editor binding و تفکیک loading/read-error؛
33. ماتریس parameterized برای تک‌تک کلیدهای watched بخش ۱۲ و negative case برای کلید نامرتبط؛
34. حفظ draft و attempt روی conflict/ambiguous failure و receipt replay بدون duplicate؛
35. project isolation مستقیم برای product/service؛
36. read-error یک ledger بدون empty state و بدون mutation family سالم؛
37. progressive disclosure پیش‌فرض و باقی‌ماندن جزئیات hash/receipt/migration پشت افشای فنی؛
38. حفظ برچسب‌های «خصوصی»، «ثبت دستی» و «بدون اثر بیرونی»؛
39. نبود network request، AI، send، purchase یا external effect.

نام‌های پایهٔ تست RED:

- `BG-F7 migration canonicalizes product and service Comparisons while preserving descendant FNV bytes`
- `BG-F7 migration preserves user actor provenance and marks transfer only through v1 origin`
- `BG-F7 migration accepts mixed FNV and SHA Proposal pins across one Comparison history`
- `BG-F7 migration preserves a valid historical Comparison after Proposal head advancement`
- `BG-F7 migration preserves independent same-target Comparisons and non-head descendant pins`
- `BG-F7 cutover resumes a valid pending Comparison marker to committed`
- `BG-F7 cutover resumes a valid verified Comparison marker to committed`
- `BG-F7 cutover rejects source identity dependency and candidate drift before commit with zero authority`
- `BG-F7 empty cutover never resurrects a later v1 Comparison array`
- `BG-F7 canonical marker and future-schema corruption never fall back to v1`
- `BG-F7 parser accepts every exact capacity boundary and rejects one-over values extra keys and noncanonical identities or timestamps`
- `BG-F7 parser rejects duplicate identities cross-project records and impossible chronology`
- `BG-F7 golden vectors bind every revision event record receipt report envelope and marker`
- `BG-F7 migration report replays every source index and every live receipt folds to the exact final envelope`
- `BG-F7 rejects an out-of-order receipt chain even when timestamps tie`
- `BG-F7 writer replay rejects structurally impossible coherent rehash and derived-result mismatch`
- `BG-F7 parser preserves the 200-digit decimal boundary and rejects oversized canonical values`
- `BG-F7 no-op keeps exact bytes while a semantic update appends one revision`
- `BG-F7 idempotency replays an exact committed attempt after version and dependency drift and rejects every changed command field`
- `BG-F7 concurrent creates from one store version produce one winner and preserve both records after explicit retry`
- `BG-F7 concurrent updates to one Comparison produce one winner and one explicit conflict`
- `BG-F7 product and service commands both succeed under the shared procurement lock`
- `BG-F7 one-ledger cutover failure leaves the other ledger ready`
- `BG-F7 queued Comparison rereads every Proposal dependency and writes nothing after lineage changes`
- `BG-F7 migration and live writers clamp timestamps against backward clocks and newer dependency dates`
- `BG-F7 pre-write storage failure leaves the exact preimage untouched`
- `BG-F7 readback mismatch restores exact prior bytes`
- `BG-F7 rollback collision never overwrites a competing writer`
- `BG-F7 rollback failure returns rollback-failure and locks the ledger as read-error`
- `BG-F7 missing Web Locks writes nothing`
- `BG-F7 UI distinguishes loading read-error and empty while preserving a stale draft`
- `BG-F7 reconciliation invalidates bindings for every watched key and ignores unrelated storage events`
- `BG-F7 UI replays one ambiguous receipt without duplication`
- `BG-F7 UI isolates product and service Comparisons to the active project`
- `BG-F7 product corruption leaves service ready and writable while service corruption leaves product ready and writable`
- `BG-F7 new Product Decision pins canonical Comparison SHA while an existing FNV target stays byte-stable on update`
- `BG-F7 new Service Decision pins canonical Comparison SHA while an existing FNV target stays byte-stable on update`
- `BG-F7 new Product Negotiation pins canonical Comparison SHA while an existing FNV target stays byte-stable on update`
- `BG-F7 new Service Negotiation pins canonical Comparison SHA while an existing FNV target stays byte-stable on update`
- `BG-F7 UI keeps technical authority details collapsed and makes no external request`

تست‌های T7-B1/T7-B2 از raw-array oracle به helper canonical منتقل می‌شوند. direct `JSON.parse(...)[0]` فقط در fixtureهای صریح migration v1 مجاز است. عبارت «rollback» فقط وقتی استفاده می‌شود که post-write mismatch و restore/readback واقعی آزموده شده باشد.

## ۱۵. QA، کنترل کیفیت و انتشار

در طول توسعه:

- تست‌های RED/GREEN فقط با grep `BG-F7 `؛
- regressionهای معنایی با grep `T7-B1|T7-B2`؛
- بستهٔ محدود downstream با grep دقیق این عنوان‌ها:
  - `T8-A1 also pins a product-line question`
  - `T8-A1 pins a private local question draft`
  - `T8-A2 makes a response historical after an upstream comparison revision`
  - `T8-A3 makes the review historical after an upstream comparison revision`
  - `T8-A4 makes the impact historical after an upstream comparison revision`
  - `T8-A5a defaults to the exact previous and current product proposal revisions`
  - `T8-A5b defaults to the exact previous and current service proposal revisions`
  - `BG-F6 migration leaves persisted product, service, and negotiation FNV targets`
  - `BG-F6 historical lineage routes survive committed migration`
  - `BG-F6 lineage helper and parser reject a coherently rehashed foreign legacy revision link`
  - `BG-F6 new downstream lineage pins canonical Proposal SHA`
- `npm run check:runtime` پس از اتصال runtime؛
- `npm run build` یک بار پس از جمع‌شدن برش؛
- QA واقعی `390 × 844` برای create، edit، conflict، read-error و بازگشت focus؛
- console warning/error، overflow افقی و external request صفر؛
- `git diff --check` و بازبینی مستقل.

`npm run gate:release` ابزار توسعهٔ روزمره نیست. فقط پس از:

1. سبزشدن شواهد متمرکز؛
2. QA موبایل؛
3. به‌روزرسانی backlog، handoff و learning log؛
4. freeze تمام bytes candidate؛
5. مجوز صریح انتشار همان exact candidate

یک‌بار اجرا می‌شود. تغییر هر byte پس از gate receipt، candidate تازه و gate تازه می‌خواهد.

پس از gate موفق و بدون تغییر هیچ byte، همان bytes یک‌بار commit می‌شوند؛ سپس `npm run gate:publish` cleanliness و fingerprint را تأیید می‌کند. فقط همان SHA یک‌بار push و مبنای هر دو deployment کلادفلر و Sites قرار می‌گیرد؛ receipt بیرونی فقط در پیام تحویل می‌آید و commit یا deployment دوم نمی‌سازد.

## ۱۶. معیار تحویل محلی

BG-F7 فقط وقتی آمادهٔ مشاهدهٔ کاربر است که:

- هر دو Comparison ledger از v1 معتبر به v2 committed migrate شوند؛
- یک ledger خراب دیگری را به read-error نبرد؛
- canonical/marker خراب هیچ fallback یا overwrite نسازد؛
- owner/scope/authority و SHA chain exact باشند؛
- FNV فقط evidence سازگاری باشد؛
- Decision/Negotiation تاریخی، هرگاه authorityهای لازم خوانا باشند، بدون تغییر bytes باز شوند؛ خرابی family دیگر می‌تواند طبق بدهی اعلام‌شده reader فعلی Negotiation را موقتاً قفل کند؛
- downstream تازه SHA canonical pin کند؛
- create/update زیر lock و commit-time reread بدون lost update باشند؛
- idempotency replay duplicate نسازد؛
- no-op bytes را تغییر ندهد؛
- readback/rollback واقعی و competing-writer safety شاهد داشته باشند؛
- draft روی تمام failure/conflictهای قابل‌بازیابی حفظ شود؛
- UI روزمرهٔ product/service همان قرارداد معنایی قبلی را نگه دارد؛
- تست‌های متمرکز، regression منتخب، runtime check، build، QA موبایل و diff check پاس شوند؛
- هیچ ادعای Gate PASS، production readiness، AI، network یا اثر بیرونی ساخته نشود.

## ۱۷. ترتیب اجرای پیشنهادی

1. نوشتن تست‌های RED parser/envelope/migration/cutover؛
2. استخراج type، derive و parserهای product/service به `builderProposalComparisons.ts`؛
3. سبزکردن دو reader و migration مستقل؛
4. نوشتن تست‌های RED command/idempotency/concurrency/readback/rollback؛
5. سبزکردن service mutation مشترک با دو ledger؛
6. نوشتن تست‌های RED legacy lineage و downstream SHA؛
7. اتصال Decision/Negotiation readerها بدون تغییر bytes؛
8. نوشتن تست‌های RED UI binding/draft/reconciliation؛
9. اتصال async adapterهای `Prototype.tsx`؛
10. اجرای regression محدود، build، runtime check و QA موبایل؛
11. به‌روزرسانی Learnings/Backlog/Handoff با تفکیک تجربه، شکاف، تصمیم و پیشنهاد اصلاح سند مادر؛
12. بازبینی مستقل candidate؛
13. freeze exact candidate، دریافت مجوز صریح همان candidate، اجرای یک‌بارهٔ `gate:release`، commit همان bytes، اجرای `gate:publish` و فقط سپس یک push و deploymentهای same-source.
