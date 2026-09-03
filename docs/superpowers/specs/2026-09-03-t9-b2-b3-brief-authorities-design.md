# طراحی T9-B2 و T9-B3: تعیین‌تکلیف ورودی‌ها و تغییرات از آخرین مراجعه

تاریخ: ۲۰۲۶/۰۹/۰۳
وضعیت: طراحی در گفتگو و نسخهٔ مکتوب در ۲۰۲۶/۰۹/۰۳ توسط ماهیار تأیید شد؛ خودبازبینی و بازبینی مستقل بدون مانع تکمیل شد
برش‌ها: `T9-B2 — Project Input Disposition` و `T9-B3 — Explicit Project Visit Checkpoint`

## ۱. هدف و مرز بسته

این بسته دو دستهٔ باقی‌مانده از «امروز پروژه» را با دادهٔ واقعی و قابل‌اثبات فعال می‌کند:

- اسناد یا ورودی‌های تعیین‌تکلیف‌نشده؛
- تغییرات مهم از آخرین مراجعه.

این دو برش با درخواست صریح ماهیار در یک candidate نهایی جمع و با یک release gate منتشر می‌شوند، اما authority و failure domain آن‌ها مستقل می‌ماند. T9-B2 ابتدا واحد ورودی و وضعیت تعیین‌تکلیف آن را می‌سازد؛ T9-B3 سپس snapshot صریح مشاهده را روی مجموعهٔ بسته و مشخصی از headهای واقعی پروژه ثبت می‌کند.

این بسته مجاز است:

- یک ماژول دامنه‌ای تازه با نام `prototype/src/projectBriefAuthorities.ts` بسازد؛
- دو مخزن canonical، project-scoped و مستقل برای disposition ورودی و checkpoint مراجعه بسازد؛
- فایل، Source intake، Task، Backbone، Approval، Dispatch Plan Approval و Purchase Request موجود را فقط از adapterهای خواندنی مصرف کند؛
- Brief را از سه بخش فعلی به پنج بخش واقعی کامل کند؛
- در جزئیات سند و ورودی، اقدام صریح «تعیین‌تکلیف شد» و «بازکردن دوباره» بسازد؛
- در Brief اقدام صریح «همه را دیدم» بسازد و فقط پس از همان اقدام checkpoint بنویسد؛
- parser، fingerprint، revision/history، receipt، Web Lock، expected version، reread، exact readback، idempotency و rollback لازم را پیاده کند؛
- storage event، focus/reload و تعویض پروژه را reconcile کند؛
- آزمون‌های failure، stale، concurrency، isolation و UI موبایل را اضافه کند.

این بسته مجاز نیست:

- schema یا bytes مخازن File، Source، Task، Backbone، Request، Approval، Dispatch یا Proposal را تغییر دهد؛
- از `createdAt` یا `updatedAt` به‌تنهایی نتیجه بگیرد که چیزی دیده یا تعیین‌تکلیف شده است؛
- صرف بازشدن Brief یا برنامهٔ روزانه/هفتگی را «مراجعه» حساب کند؛
- Report ماندگار T10، اعلان واقعی، Notification API، service worker، worker، backend یا اجرای تب بسته/پنهان بسازد؛
- OCR، extraction، مدل، وب، شبکه، sync، اشتراک، مسیر تأمین‌کننده یا اثر بیرونی بسازد؛
- عکس مستقل گالری را بدون اینکه ورودی Composer باشد «سند یا ورودی تعیین‌تکلیف‌نشده» بنامد؛
- BG-GATE-1، بدهی BG-F7، File/Photo authority یا `case_private` را بسته اعلام کند؛
- سند مادر محصول را تغییر دهد.

## ۲. تصمیم معماری و گزینه‌های ردشده

### ۲.۱ تصمیم منتخب: دو sidecar ledger مستقل

وضعیت تعیین‌تکلیف و checkpoint مراجعه در دو store مستقل نگه‌داری می‌شوند و به رکوردهای موجود فقط با pin دقیق اشاره می‌کنند. این انتخاب اجازه می‌دهد:

- parser سخت‌گیر فایل و Source بدون migration باقی بماند؛
- failure یک store، store دیگر و سه بخش سالم Brief را از کار نیندازد؛
- بازکردن Brief همچنان read-only باشد؛
- تغییر یا staleشدن target بدون بازنویسی تاریخچهٔ فایل/Source دیده شود؛
- T9-B2 و T9-B3 در یک candidate جمع شوند، بدون اینکه یک aggregate مصنوعی و اتمیک میان چند دامنه ساخته شود.

### ۲.۲ گزینهٔ ردشده: افزودن status به File و Source

File فعلی فقط `status="ثبت محلی"` و `version=1` را می‌پذیرد و parser آن کلید اضافه را رد می‌کند. افزودن disposition داخل File/Source نیازمند migration، تغییر همهٔ writerها و atomicity چندمخزنی با IndexedDB است. این مسیر برای دو قابلیت Brief سطح خطر و زمان انتشار را بی‌دلیل بالا می‌برد.

### ۲.۳ گزینهٔ ردشده: استنتاج از زمان و نوشتن خودکار هنگام بازشدن

مقایسهٔ timestamp با زمان بازشدن صفحه ثابت نمی‌کند کاربر چه چیزی را دیده یا تعیین‌تکلیف کرده است. نوشتن خودکار نیز ممکن است با یک بازشدن ناخواسته تغییرات را ناپدید کند و قرارداد read-only T9-B1 را بشکند. این گزینه حتی اگر سریع‌تر باشد، منبع قابل‌اثبات نمی‌سازد.

## ۳. T9-B2 — واحدهای ورودی و semantics تعیین‌تکلیف

### ۳.۱ واحد canonical قابل‌تعیین‌تکلیف

فقط دو نوع واحد وارد projection می‌شوند:

1. `project-document`: هر `ProjectFileRecord` غیرتصویری همان پروژه که توسط هیچ Source معتبر Composer ارجاع نشده است؛
2. `composer-intake`: هر `ProjectSourceIntakeRecord` همان پروژه همراه با همهٔ Sourceهای دقیق خودش و File/Photo ارجاع‌شدهٔ آن.

یک فایل پیوست Composer دوبار نمایش داده نمی‌شود: intake واحد اصلی است و File وابسته فقط داخل fingerprint و مقصد بازشدن آن می‌آید. عکس مستقل گالری خارج است؛ عکس Composer داخل `composer-intake` قرار می‌گیرد. سند `metadata-only` همچنان یک document معتبر برای تعیین‌تکلیف است، ولی UI نباید آماده‌بودن یا اصالت محتوای آن را ادعا کند.

سلامت asset پیش‌شرط مستقلی دارد:

- برای `metadata-only`، target فقط از metadata قطعی ساخته می‌شود و قابل‌تعیین‌تکلیف است؛ resolve هیچ ادعایی دربارهٔ وجود bytes، اصالت محتوا یا بازشدن فایل ایجاد نمی‌کند.
- برای `browser-file`، reconciliation و validation موجود File/Source/IndexedDB باید پیش از خواندن یا mutation تعیین‌تکلیف به پایان سالم رسیده باشد. حالت pending به‌صورت loading و شکست read/blob به‌صورت unavailable دیده می‌شود و اقدام mutation غیرفعال می‌ماند.
- اگر reconciliation سالم، metadata فایلِ بدون Blob را حذف کند، target مفقودشده‌ای که disposition یا checkpoint به آن pin شده است fail-close و unavailable می‌شود؛ حذف، «تعیین‌تکلیف‌شده» تلقی نمی‌شود. resolve صرفاً تصمیم کاربر را ثبت می‌کند و گواهی اصالت Blob نیست.

### ۳.۲ وضعیت مؤثر

- نبود disposition معتبر برای یک target موجود یعنی `pending`؛ این قاعده برای دادهٔ موجود و تازه یکسان است.
- اقدام صریح کاربر «تعیین‌تکلیف شد» یک revision با `status="resolved"` می‌سازد.
- اقدام صریح «بازکردن دوباره» revision بعدی با `status="pending"` می‌سازد.
- اگر target fingerprint پس از resolution تغییر کند، وضعیت مؤثر بدون mutation به `pending-stale` برمی‌گردد و Brief آن را تعیین‌تکلیف‌نشده می‌شمارد. resolution بعدی target تازه را pin می‌کند.
- ناموجودشدن target، project mismatch یا dependency ناخوانا empty نیست؛ aggregate مربوط به disposition `unavailable` می‌شود. حذف target تا وجود tombstone/deletion contract معتبر recoverable فرض نمی‌شود.
- no-op روی همان target/status bytes و نسخه را تغییر نمی‌دهد؛ retry همان idempotency key receipt قبلی را replay می‌کند.

### ۳.۳ تجربهٔ کاربر

- جزئیات سند مستقل و جزئیات Source Composer، وضعیت کوتاه «نیازمند تعیین‌تکلیف»، «تعیین‌تکلیف شده» یا «بعد از بررسی تغییر کرده» را نشان می‌دهند.
- فقط یک اقدام اصلی متناسب با وضعیت دیده می‌شود: «تعیین‌تکلیف شد» یا «بازکردن دوباره».
- در حالت loading، read-error، stale mutation یا write failure، sheet باز می‌ماند، اقدام قفل می‌شود یا خطای صریح نشان داده می‌شود و وضعیت قبلی جعل نمی‌شود.
- بخش تازهٔ Brief با عنوان «اسناد و ورودی‌های تعیین‌تکلیف‌نشده» شمار کل و حداکثر سه مورد را نشان می‌دهد.
- انتخاب آن سه مورد قطعی است: ابتدا `pending-stale`، سپس `pending`؛ داخل هر وضعیت، زمان target به‌صورت نزولی (`createdAt` سند یا `createdAt` intake)؛ و در تساوی، ابتدا `kind` و سپس `id` به‌صورت صعودی. truncate فقط پس از این sort انجام می‌شود.
- هر مورد به مبدأ دقیق خودش بازمی‌گردد: document به File detail و intake به Source detail همان پیام. اگر بازکردن دقیق ممکن نباشد، item اقدام فعال نمی‌سازد.

## ۴. قرارداد ماندگار T9-B2

### ۴.۱ binding مشترک هویت و اختیار

هر دو ledger فقط با authority تازه‌ای کار می‌کنند که از fixture کامپایل‌شده و exact فعلیِ `AccountIdentity`، `Membership`، `RoleAssignment` و templateهای `AuthorizationContext` ساخته می‌شود:

```ts
type ProjectBriefAuthority = {
  identityBindingHash: `sha256-${string}`;
  snapshotHash: `sha256-${string}`;
  projectIds: string[];
  authorizationHashes: Record<string, `sha256-${string}`>;
};
```

- هر read و mutation یک `ProjectBriefAuthority` تازه می‌گیرد؛ authority داخل React state به‌عنوان حقیقت ماندگار cache نمی‌شود.
- هر envelope به `identityBindingHash` exact bind است. هر record و تمام command/event/revision/receiptهای آن به `authorizationContextHash` exact همان پروژه bind هستند.
- parser و replay باید وجود پروژه، project/scope match، identity binding جاری و authorization hash جاری را پیش از پذیرش state یا receipt اثبات کنند.
- identity یا policy drift، authority نامعتبر یا hash نامنطبق read-error است؛ fallback، normalization یا overwrite مجاز نیست و mutation بسته می‌ماند.
- تغییر snapshot foundation که هویت یا اختیار پروژه را عوض نکرده، ledger را بازنویسی نمی‌کند؛ خواندن و mutation بعدی همچنان authority تازه را مصرف می‌کند.

### ۴.۲ envelope تعیین‌تکلیف

```ts
export const projectInputDispositionsStorageKey =
  "chida-prototype-project-input-dispositions:v1";
export const projectInputDispositionsWriteLockName =
  `${projectInputDispositionsStorageKey}:write`;

type ProjectInputTarget =
  | {
      kind: "project-document";
      id: string;
      projectId: string;
      version: 1;
      fingerprint: `sha256-${string}`;
    }
  | {
      kind: "composer-intake";
      id: string;
      projectId: string;
      version: 1;
      fingerprint: `sha256-${string}`;
    };

type ProjectInputDispositionSnapshot = {
  target: ProjectInputTarget;
  status: "pending" | "resolved";
};

type ProjectInputDispositionRecord = {
  schemaVersion: 1;
  objectType: "project-input-disposition";
  id: string; // deterministic from target kind + target id
  projectId: string;
  ownerPrincipalType: "account";
  ownerPrincipalId: "local-builder-account";
  accountSide: "builder";
  scopeType: "project_private";
  scopeId: string; // exact projectId
  custodianService: "Project Brief Domain Service";
  sensitivity: "private";
  authorizationContextHash: `sha256-${string}`;
  version: number;
  currentRevisionId: string;
  createdAt: string;
  updatedAt: string;
  history: ProjectInputDispositionEvent[];
  revisions: ProjectInputDispositionRevision[];
  fingerprint: `sha256-${string}`;
};

type ProjectInputDispositionEnvelope = {
  schemaVersion: 1;
  fingerprintVersion: "project-input-disposition-v1";
  identityBindingHash: `sha256-${string}`;
  storeVersion: number;
  records: ProjectInputDispositionRecord[];
  idempotencyReceipts: ProjectInputDispositionReceipt[];
  updatedAt: string | null;
  fingerprint: `sha256-${string}`;
};
```

null storage یک empty envelope هنجاری و در حافظه است؛ اولین mutation canonical bytes را می‌نویسد. رشتهٔ خالی، JSON خراب، schema آینده، کلید اضافه/کم، hash ضعیف، duplicate id/receipt، chronology ناممکن، history/revision ناپیوسته، scope/owner اشتباه یا fingerprint ناسازگار read-error است و fallback ندارد.

fingerprint `project-document` تمام metadata exact و validated فعلیِ مؤثر بر هویت/خواندن را با stable serialization و SHA-256 canonical می‌کند. fingerprint `composer-intake` هرگز fingerprint قدیمی FNV را wrap یا به‌عنوان ورودی integrity دوباره مصرف نمی‌کند؛ stable serialization آن شامل همهٔ فیلدهای پذیرفته‌شدهٔ intake به‌جز fingerprint قدیمی، همهٔ فیلدهای پذیرفته‌شدهٔ Source به‌جز fingerprint قدیمی، ترتیب قطعی source idها، متن یا asset reference، `contentHash`، flagهای eligibility/privacy و تمام metadata canonical و مرتبط File/Photo است. سپس از bytes همین serialization، SHA-256 ساخته می‌شود. Blob یا متن در disposition کپی نمی‌شود؛ برای Composer فقط content hash معتبر و metadata وابسته pin می‌شوند و validation موجود asset باید سالم باشد.

## ۵. T9-B3 — تعریف آخرین مراجعه و دامنهٔ تغییرات

### ۵.۱ تعریف آخرین مراجعه

«آخرین مراجعه» فقط آخرین checkpoint موفقی است که کاربر با دکمهٔ «همه را دیدم» در Brief ثبت کرده است. بازشدن Brief، بازشدن Drawer، اجرای برنامهٔ محلی و reload هیچ checkpointی نمی‌سازند.

در اولین استفاده که checkpoint وجود ندارد:

- بخش تغییرات می‌گوید «هنوز مبنای قبلی ثبت نشده»؛
- دادهٔ فعلی تغییر تلقی یا با عدد ساختگی نمایش داده نمی‌شود؛
- دکمهٔ «ثبت وضعیت فعلی به‌عنوان مبنا» فقط وقتی همهٔ dependencyهای دامنهٔ checkpoint خوانا و آماده‌اند فعال است.

پس از وجود checkpoint، دکمه «همه را دیدم» snapshot جاری را به‌عنوان revision بعدی ثبت می‌کند. حتی اگر headها تغییر نکرده باشند، این اقدام یک visit واقعی با `observedAt` تازه است؛ retry همان command دوباره revision نمی‌سازد.

### ۵.۲ allowlist تغییرات مهم

checkpoint فقط headهای پروژهٔ فعال را در این شش kind نگه می‌دارد:

- `manual-task`؛
- `backbone-task`؛
- `content-approval`؛
- `dispatch-plan-approval`؛
- `purchase-request`؛
- `project-input` مشتق‌شده از T9-B2.

هر head فقط `kind`، شناسه، نسخهٔ canonical، fingerprint و state روزمرهٔ لازم برای تشخیص گذار را دارد؛ title، متن، Blob، payload کامل یا دادهٔ پروژهٔ دیگر در checkpoint کپی نمی‌شود. ترتیب headها بر پایهٔ `kind + id` قطعی است.

head نوع `project-input` از تمام targetهای سالم و جاری ساخته می‌شود، نه فقط projection سه‌تایی یا موارد pending که در Brief نمایش داده می‌شوند. `id` از `target.kind + target.id`، `version` از نسخهٔ disposition موجود و در نبود آن از نسخهٔ target، و fingerprint از stable serialization دقیقِ target، effective state و head اختیاری disposition ساخته می‌شود. بنابراین resolve/reopen یا تغییر خود target قابل‌مشاهده است و resolved شدن باعث ناپدیدشدن head و خطای حذف کاذب نمی‌شود.

### ۵.۳ digest مستقل هر head

فیلد `fingerprint` در `ProjectBriefObservedHead` همیشه sidecar SHA-256 همین دامنه است، نه کپی، wrap یا hash دوبارهٔ fingerprintهای دامنه‌های قدیمی. هر adapter فقط پس از `ready` شدن reader و اعتبارسنجی کامل parser موجود digest می‌سازد. ورودی digest با stable serialization بازگشتی، sort قطعی کلیدهای object و حفظ ترتیب canonical آرایه‌ها ساخته می‌شود. adapter همهٔ فیلدهای semantic، شناسه، scope، نسخه، زمان‌ها، snapshotها، history و receiptهای پذیرفته‌شده را serialize می‌کند؛ fingerprintهای ذخیره‌شدهٔ قبلی، چه FNV و چه SHA، فقط evidence اعتبارسنجی upstream هستند، از preimage حذف می‌شوند و هرگز جانشین دادهٔ اصلی‌ای که خلاصه کرده‌اند نمی‌شوند. هر reference که پیش‌تر فقط با fingerprint pin شده، باید از dependency معتبر خودش به دادهٔ خام materialize شود و نبود آن کل kind را unavailable می‌کند. فقط SHA-256 محتوایی‌ای که خودش بخشی از قرارداد داده است، مانند `contentHash` معتبر Composer، همراه با metadata و linkage اصلی باقی می‌ماند. serialization کامل فقط در حافظه hash می‌شود و checkpoint از آن فقط kind/id/version/state و SHA-256 نهایی را نگه می‌دارد؛ title، payload یا record کامل در store checkpoint کپی نمی‌شود.

preimage هر kind صریحاً چنین است:

- `manual-task`: تمام `ProjectTaskRecord` معتبر، با snapshot revision جاری و بدون fingerprintهای قدیمی؛
- `backbone-task`: تمام `ProjectBackboneTaskRecord` معتبر، با snapshot revision جاری و بدون fingerprintهای قدیمی؛
- `content-approval`: تمام `ProjectApprovalRecord` معتبر، target/snapshot/privacy و revision جاری، بدون fingerprintهای قدیمی؛
- `dispatch-plan-approval`: تمام `DispatchPlanApprovalRecord` معتبر به‌علاوهٔ effective state و capsule کاملِ dependencyهای معتبر که تابع canonical فعلی برای محاسبهٔ همان state مصرف کرده است، بدون fingerprintهای قدیمی؛
- `purchase-request`: تمام فیلدهای authoritativeِ `ProjectPurchaseRequestRecord` معتبر، از جمله raw need، `items`، service، delivery، unresolved terms، clarifications، review revisions، history، receipts، migration، status/version و زمان‌ها، بدون fingerprintهای قدیمی؛ mirror سازگاری `item` باید upstream exact validate شود ولی منبع مستقل digest نیست؛
- `project-input`: preimage کامل تعریف‌شده در بخش ۴.۲ به‌علاوهٔ effective state و head اختیاری disposition، بدون اتکا به FNVهای Source/File.

اگر adapter نتواند دادهٔ خام و validated لازم برای این preimage را فراهم کند، آن kind unavailable است؛ استفاده از fingerprint قدیمی به‌عنوان shortcut مجاز نیست.

تعریف delta:

- کلید تازه در current: `added`؛
- همان کلید با version/fingerprint/state متفاوت: `updated`؛
- برابری کامل: بدون تغییر.

اگر کلیدی که در baseline وجود دارد در current حاضر نباشد و tombstone معتبر همان authority نتواند حذف را اثبات کند، delta unavailable و ثبت checkpoint تازه مسدود می‌شود. هیچ‌یک از kindهای allowlist این برش deletion/tombstone contract قابل‌مصرف ندارد؛ بنابراین این نسخه هیچ `removed` کاربرنمایی تولید نمی‌کند. افزودن حذف معتبر تا زمانی که یکی از دامنه‌ها tombstone قابل‌اعتبارسنجی عرضه کند خارج از دامنه است.

UI delta را در چهار گروه روزمرهٔ «کارها»، «تصمیم‌ها»، «خریدها» و «اسناد و ورودی‌ها» خلاصه می‌کند. هر گروه تعداد added/updated را با زبان انسانی نشان می‌دهد و به مقصد اصلی همان گروه می‌رود. هیچ ranking، اهمیت‌سنجی AI یا تفسیر محتوا انجام نمی‌شود؛ «مهم» در این برش فقط یعنی تغییر head در allowlist صریح بالا.

### ۵.۴ partial failure

- خطای checkpoint store فقط بخش «تغییرات از آخرین مراجعه» و دکمهٔ ثبت مشاهده را unavailable می‌کند.
- ناخوانابودن هر dependency داخل allowlist، delta کلی را unavailable و ثبت checkpoint تازه را غیرفعال می‌کند؛ baseline قبلی دست‌نخورده می‌ماند.
- خطای disposition می‌تواند بخش ورودی و delta را unavailable کند، اما بخش‌های سالم Task/Decision/Procurement همچنان نمایش داده می‌شوند.
- نبود داده با read-error یکی نیست و هیچ checkpoint ناقص یا partial نوشته نمی‌شود.

## ۶. قرارداد ماندگار T9-B3

```ts
export const projectVisitCheckpointsStorageKey =
  "chida-prototype-project-visit-checkpoints:v1";
export const projectVisitCheckpointsWriteLockName =
  `${projectVisitCheckpointsStorageKey}:write`;

type ProjectBriefObservedHeadBase = {
  id: string;
  version: number;
  fingerprint: `sha256-${string}`;
};

type ProjectBriefObservedHead = ProjectBriefObservedHeadBase & (
  | { kind: "manual-task" | "backbone-task"; state: "in-progress" | "completed" }
  | { kind: "content-approval"; state: "pending" | "approved" | "changes-requested" }
  | { kind: "dispatch-plan-approval"; state: "pending" | "approved" | "withdrawn" | "invalidated" }
  | { kind: "purchase-request"; state: "draft" | "ready-for-review" }
  | { kind: "project-input"; state: "pending" | "pending-stale" | "resolved" }
);

type ProjectVisitCheckpointSnapshot = {
  observedAt: string;
  observationSchemaVersion: 1;
  heads: ProjectBriefObservedHead[];
  observationFingerprint: `sha256-${string}`;
};

type ProjectVisitCheckpointRecord = {
  schemaVersion: 1;
  objectType: "project-visit-checkpoint";
  id: string; // deterministic from projectId
  projectId: string;
  ownerPrincipalType: "account";
  ownerPrincipalId: "local-builder-account";
  accountSide: "builder";
  scopeType: "project_private";
  scopeId: string;
  custodianService: "Project Brief Domain Service";
  sensitivity: "private";
  authorizationContextHash: `sha256-${string}`;
  version: number;
  currentRevisionId: string;
  createdAt: string;
  updatedAt: string;
  history: ProjectVisitCheckpointEvent[];
  revisions: ProjectVisitCheckpointRevision[];
  fingerprint: `sha256-${string}`;
};

type ProjectVisitCheckpointEnvelope = {
  schemaVersion: 1;
  fingerprintVersion: "project-visit-checkpoint-v1";
  identityBindingHash: `sha256-${string}`;
  storeVersion: number;
  records: ProjectVisitCheckpointRecord[]; // at most one per project
  idempotencyReceipts: ProjectVisitCheckpointReceipt[];
  updatedAt: string | null;
  fingerprint: `sha256-${string}`;
};
```

parser همان exactness، scope، chronology، uniqueness، identity/policy binding و SHA-256 قرارداد T9-B2 را اعمال می‌کند. هر project دقیقاً صفر یا یک checkpoint record دارد. همهٔ revisionها append-only هستند و current revision باید آخرین history event باشد.

## ۷. جریان داده و هم‌زمانی

### ۷.۱ خواندن

1. adapterهای موجود فقط stateهای ازپیش‌اعتبارسنجی‌شده و project-filtered را به `projectBriefAuthorities.ts` می‌دهند.
2. ماژول واحدهای input و fingerprint آن‌ها را قطعی می‌سازد.
3. disposition envelope مستقل خوانده و با targetهای جاری aggregate-validate می‌شود.
4. projection نمایشی T9-B2 فقط targetهای effective pending را برمی‌گرداند.
5. observed headهای شش kind از aggregateهای کامل و سالم، مستقل از truncate و فیلتر نمایشی، ساخته می‌شوند.
6. checkpoint envelope مستقل خوانده و current heads با آخرین revision همان پروژه مقایسه می‌شوند.
7. `Prototype.tsx` پنج section را با status مستقل به Brief می‌دهد.

هیچ‌کدام از گام‌های خواندن writer نیستند.

### ۷.۲ mutation disposition

1. UI target، status موردنظر، expected record/store version و idempotency key را ثبت می‌کند.
2. Web Lock disposition گرفته می‌شود.
3. store و dependency target دوباره خوانده می‌شوند.
4. scope/owner، current target fingerprint، expected version و command پیش از idempotency validate می‌شوند.
5. receipt replay یا mutation تازه محاسبه می‌شود.
6. candidate canonical نوشته و exact readback می‌شود.
7. فقط bytes متعلق به همان candidate در شکست قابل rollback هستند؛ state React پس از readback معتبر عوض می‌شود.

### ۷.۳ mutation checkpoint

1. UI فقط وقتی تمام allowlist سالم است command می‌سازد.
2. Web Lock checkpoint گرفته می‌شود.
3. همهٔ dependency adapterها دوباره خوانده و current observation دوباره محاسبه می‌شود.
4. اگر observation با snapshotی که کاربر روی آن کلیک کرده متفاوت باشد، نتیجه `dependency-stale` است و هیچ checkpointی نوشته نمی‌شود.
5. expected checkpoint/store version و idempotency validate می‌شوند.
6. revision/receipt تازه نوشته، exact readback و سپس در state منتشر می‌شود.
7. خطا sheet را باز، baseline را ثابت و دکمه را برای retry امن نگه می‌دارد.

دو store قفل جدا دارند. checkpoint هیچ dispositionی را mutate نمی‌کند؛ dependency آن فقط read-only است. lock جدید به قفل File/Source/Task/Procurement اضافه نمی‌شود و چرخهٔ lock ساخته نمی‌شود.

## ۸. فایل‌ها و مرز مالکیت

- ایجاد `prototype/src/projectBriefAuthorities.ts`: types، hash، canonicalization، parser/read، aggregate validation، projection، delta و mutationهای دو store؛
- تغییر `prototype/src/Prototype.tsx`: adapterهای وابستگی، state/reconciliation، اتصال mutationها، ناوبری دقیق target و دو section تازه؛
- تغییر `prototype/src/prototype.css`: status/actionهای input و layout پنج section در `390 × 844`؛
- تغییر `prototype/tests/chida-flow.spec.ts`: regressionهای end-to-end و fault/concurrency؛
- تغییر `BUILDER-FEATURE-BACKLOG-FA.md`، `CHIDA-CONTINUATION-HANDOFF-FA.md` و `CHIDA-PRODUCT-LEARNINGS-FA.md`: وضعیت، تجربه، شکاف، تصمیم و مرزها؛
- عدم تغییر فایل‌های runtime محافظت‌شده، worker، hosting contract و lockfile.

T9-B2 باید پیش از T9-B3 سبز و review شود، چون head نوع `project-input` از قرارداد نهایی T9-B2 می‌آید. دو implementer هم‌زمان روی `Prototype.tsx` یا تست مشترک کار نمی‌کنند.

## ۹. قرارداد آزمون و پذیرش

### ۹.۱ T9-B2

- سند مستقل و Composer intake موجود بدون disposition، pending دیده شوند و پیوست Composer دوبار شمرده نشود؛
- resolve، reload و project isolation را حفظ کند؛
- reopen revision تازه بسازد؛
- no-op bytes را ثابت و retry همان command را idempotent نگه دارد؛
- تغییر target resolved را effective stale/pending کند؛
- metadata-only document بدون ادعای content/authenticity کار کند؛
- browser-file تا پایان reconciliation سالم loading بماند؛ Blob مفقود/ناخوانا mutation نسازد و target pin‌شدهٔ حذف‌شده aggregate را unavailable کند؛
- تغییر هر فیلد in-scope intake/source/asset serialization fingerprint را تغییر دهد و FNV قدیمی نتواند mutation را پنهان کند؛
- سه item با اولویت stale، زمان و tie-break `kind + id` در زمان‌های برابر ترتیب قطعی داشته باشند؛
- malformed/tampered/cross-project/missing-target store fail-close شود؛
- identity/policy drift و authorization hash نامنطبق read-error شوند و overwrite نکنند؛
- stale expected version و رقابت دو tab overwrite نکنند؛
- write/readback/rollback failure موفقیت کاذب نسازد؛
- item Brief مبدأ File یا Source دقیق را باز کند.

### ۹.۲ T9-B3

- first visit هیچ delta جعلی نداشته باشد و open Brief هیچ storage write نکند؛
- explicit baseline روی project فعال ثبت و پس از reload بازیابی شود؛
- added/updated headها فقط در گروه درست دیده شوند؛
- تغییر هر فیلد in-scope در هر شش kind، حتی وقتی fingerprint قدیمی shortcut مناسبی نیست، SHA-256 observed head را تغییر دهد؛
- ناتوانی adapter در ساخت preimage کامل یک kind، checkpoint را unavailable کند و به FNV fallback نکند؛
- نبود head موجود در baseline بدون tombstone delta را unavailable کند و checkpoint را جلو نبرد؛
- checkpoint پروژهٔ دیگر هرگز مصرف نشود؛
- «همه را دیدم» delta را فقط پس از commit موفق خالی کند؛
- dependency-stale، unreadable dependency و checkpoint read/write failure baseline را جلو نبرند؛
- idempotency و رقابت دو tab revision تکراری یا lost update نسازند؛
- identity/policy drift و authorization hash نامنطبق checkpoint را fail-close کنند؛
- سه section قبلی هنگام خرابی section تازه سالم بمانند.

### ۹.۳ QA و انتشار مشترک

- هر برش با تست قرمز واقعی آغاز و با regression متمرکز سبز می‌شود؛
- پس از ادغام، focused suite مشترک، `npm run build`، `npm run check:runtime`، `git diff --check` و QA واقعی `390 × 844` اجرا می‌شوند؛
- QA مسیر File، Source، resolve/reopen، first baseline، delta، mark-seen، reload، تعویض پروژه، partial failure، focus، console و overflow افقی را می‌پیماید؛
- پس از به‌روزرسانی نهایی سه سند و freeze candidate، `npm run gate:release` دقیقاً یک بار اجرا می‌شود؛
- فقط در صورت PASS، exact candidate commit/push می‌شود، `npm run gate:publish` fingerprint را می‌سنجد و همان SHA در GitHub `main`، Cloudflare Pages و ChatGPT Sites owner-only منتشر می‌شود؛
- هیچ receipt-only commit یا deployment تکراری ساخته نمی‌شود.

## ۱۰. معیار پایان

این بسته فقط وقتی تمام است که:

- Brief هر پنج دستهٔ «امروز پروژه» را از authority واقعی همان پروژه نشان دهد؛
- کاربر بتواند document/intake را resolve و reopen کند و نتیجه پس از reload باقی بماند؛
- کاربر بتواند baseline مشاهده را صریح ثبت کند و delta بعدی را ببیند؛
- بازکردن Brief بدون اقدام صریح byte-for-byte read-only بماند؛
- خطا و دادهٔ خالی در هر section مستقل بمانند؛
- هیچ backend، Report، اعلان یا اثر بیرونی ادعا نشود؛
- آزمون، QA، review و release gate نهایی روی یک candidate منجمد پاس شوند؛
- یک SHA در هر سه مقصد منتشر و رسیدهای پویا فقط در پیام تحویل گزارش شوند.
