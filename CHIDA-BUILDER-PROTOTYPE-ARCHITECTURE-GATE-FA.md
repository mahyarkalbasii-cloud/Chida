# ماتریس پذیرش Builder Prototype Architecture Gate

**تاریخ ارزیابی:** ۱۴۰۵/۰۶/۰۹ — ۲۰۲۶/۰۸/۳۱
**وضعیت:** ارزیابی تاریخی `FAIL`؛ remediation محلی BG-F1 انجام شده، rerun کامل Gate انجام نشده است
**دامنه:** پروتوتایپ موبایل سازنده، Dark/RTL، browser-local
**snapshot کدِ ممیزی‌شده:** شاخهٔ `main` روی `29fb52e6bdfb69b6e4773a68b28b5fc891f42f27` همراه تغییرهای محلی `REL-1/BL-1`

این فایل artifact اجراییِ پذیرش است، نه جایگزین `CHIDA-Product-Definition-FA.md` و نه اصلاح خاموش سند مادر. معیارها از بستهٔ چهار سند معماریِ تأییدشده و نگاشت تاریخی T13 گرفته شده‌اند. عبارت `PASS` در این فایل فقط به ردیف یا زیرقرارداد نام‌برده مربوط است و به معنی production-ready بودن محصول نیست.

## نتیجهٔ دودویی

> **Builder Prototype Architecture Gate = FAIL — سه ردیف PASS و نه ردیف FAIL.**

در نتیجه شروع `M1a`، مدل، backend، شبکهٔ واقعی یا مسیر تأمین‌کننده مجاز نیست. PASS بودن Source/Composer، Task/Monitor و BuiltArtifact نشان می‌دهد سه زیرساخت اصلی به قرارداد فعلی رسیده‌اند، اما foundation مشترک هنوز یکنواخت نیست.

## قاعدهٔ امتیازدهی

- نتیجهٔ نهایی Gate فقط `PASS` یا `FAIL` است.
- هر ردیف فقط وقتی PASS می‌شود که قرارداد، مسیر شکست و شاهد آزمون منفیِ همان ردیف حاضر باشند.
- وجود پیاده‌سازی جزئی، تست happy-path یا سبزبودن suite کامل، بدهیِ بدون تصمیم را PASS نمی‌کند.
- همهٔ اقلام `Required=Yes` اجباری‌اند. تبدیل یک بدهی به `Deferred` فقط با دلیل ثبت‌شده و تأیید صریح ماهیار ممکن است.
- پنج مورد Gate-or-defer تا این ارزیابی تصمیم صریح ندارند و `PENDING_DECISION` هستند؛ این برچسب به معنی defer نیست.
- Gate فقط با PASS شدن هر ۱۲ ردیف بسته می‌شود.

## inventory هنجاری Gate

این inventory مرجع دقیق عبارت `Required=Yes` برای ارزیابی جاری است. اقلام production-only در بخش Non-goals آمده‌اند.

| گروه | object/storeهای داخل Gate | Required | وضعیت فعلی | شاهد یا شکاف تعیین‌کننده |
|---|---|---:|---|---|
| Identity و Policy محلی | `Account/Identity` fixture، `Membership`، `RoleAssignment`، `AuthorizationContext` | Yes | FAIL | fixture نسخه‌دار وجود ندارد؛ `AccountSide="builder"` و owner محلی مستقیم hardcode شده‌اند. |
| Project foundation | `Project`، `ProjectProfile`، active-project pointer | Yes | FAIL | `BuilderProject` owner/scope/schema version/status/history ندارد؛ canonical خراب به legacy/empty تبدیل و دوباره نوشته می‌شود. |
| Project Backbone | `Milestone`، `Decision`، Task متصل | Yes | PASS | envelope اتمیک، owner/scope، revision/fingerprint/history، expectedVersion، rollback و تست‌های منفی دارد. |
| Task دستی | Task قدیمیِ قابل‌ویرایش در مرکز کارها | Yes | FAIL | version/history محلی دارد، اما commit-time reread، Web Lock و expectedVersion ندارد و stale tab می‌تواند overwrite کند. |
| Memory | `MemoryCandidate` و `MemoryRecord` در `account_private`، `project_private` و `case_private` | Yes | FAIL | دو دامنهٔ اول قوی و آزموده‌اند؛ `case_private` و ACL/closure/closed-deleted tests آن وجود ندارند و defer نشده‌اند. |
| File و Photo | metadata در `chida-prototype-project-files:v1` و bytes در IndexedDB | Yes | FAIL | تفکیک فایل/عکس موجود است، اما owner/scope مشترک، hash ماندگار فایل مستقل، migration و ماتریس کامل failure برای همهٔ writerها یکدست نیست. |
| Source/Composer | `SourceRecord`، intake، asset binding و intent چندمخزنی | Yes | PASS | text/file/photo، بازیابی اصل، hash، MIME، lock/reread، rollback و isolation آزموده‌اند. |
| Task/Monitor runtime | Task متصل Backbone، `Monitor` و `Run` | Yes | PASS | deadline، trigger، last/next، disable، failure/retry، exact origin binding و مرز visible-browser-local آزموده‌اند. |
| خرید و اقدام محلی | `Request`، content `Approval`، supplier contact، `DispatchDraft`، dispatch-plan approval | Yes | FAIL | schemaهای محلی وجود دارند، اما mutation service/expectedVersion/idempotency/migration برای کل گروه یکنواخت و اثبات‌شده نیست. |
| پیشنهاد و مذاکرهٔ محلی | `Proposal`، comparison/decisionهای محصول و خدمت، negotiation draft/response/review/impact | Yes | FAIL | lineage و stateهای بخشی آزموده‌اند، اما قرارداد مشترک owner/scope، optimistic concurrency و migration کل inventory بسته نشده است. |
| BuiltArtifact | catalog، preview، artifact، invalidation journal و tombstone | Yes | PASS | lifecycle کامل حداقلی، failure، lock order، revision/rollback، project isolation و remove آزموده‌اند. |
| UI و state پشتیبان | Brief پروژه، Mock فقط‌خواندنی، routeها و affordanceهای اصلی | Yes | FAIL | Brief با کلید سراسری نگه‌داری می‌شود؛ چند affordance بدون رفتار واقعی مانده و Mock reset/PWA هنوز تصمیم ندارند. |

## ماتریس ۱۲ ردیفی

| ID | حوزه | نتیجه | دلیل دودویی و شاهد |
|---|---|---|---|
| G1 | Ownership / Scope | **FAIL** | `BuilderProject` در `prototype/src/Prototype.tsx:148-160` فقط فیلدهای نمایشی دارد. fixtureهای نسخه‌دار `Membership/RoleAssignment/AuthorizationContext` که `CHIDA-Domain-Model-Ownership-Permissions-FA.md:43-73` می‌خواهد در source/tests وجود ندارند؛ بنابراین `AccountSide` از authority قابل‌اعتماد مشتق نمی‌شود. |
| G2 | Project Isolation | **FAIL** | storeهای اصلی File/Memory/Source/Request/Dispatch/Proposal/Backbone/Monitor/BuiltArtifact شواهد isolation دارند، اما Brief پروژه با کلید سراسری خوانده/نوشته می‌شود (`Prototype.tsx:11628-11635` و `12411-12419`) و تست منفی project-switch ندارد (`chida-flow.spec.ts:5435+`). اثبات سراسری همهٔ inventory نیز کامل نیست. |
| G3 | Schema / State / Version | **FAIL** | Project و Brief envelope/schema version/state/history ندارند؛ parser پروژه رکورد ناسالم را حذف می‌کند (`Prototype.tsx:4079-4109`). checklist دامنه Project، Approval/Dispatch/Request/Proposal/Comparison/Negotiation و File/Photo/Source را صریحاً جزو پوشش Gate می‌داند. |
| G4 | Failure / Rollback | **FAIL** | `readStoredProjects()` خطا را به legacy یا `[]` تبدیل می‌کند (`Prototype.tsx:4112-4119`) و effect همان state را دوباره در canonical می‌نویسد (`11025-11031`). تست `chida-flow.spec.ts:1031-1080` همین fallback و overwrite canonical خراب را موفق می‌خواهد؛ این خلاف `read-error != empty` و fail-close است. |
| G5 | Optimistic Concurrency | **FAIL** | Source، Memory، Backbone، Monitor و BuiltArtifact مسیرهای قوی دارند، اما Project create/update (`Prototype.tsx:11054-11121`) و Task دستی (`13291-13363`) از snapshot React مستقیم می‌نویسند. Request/Approval/Dispatch نیز مسیرهای مشابه دارند (`13771-14029` و `14209-14388`). stale-tab overwrite هنوز ممکن است. |
| G6 | Idempotency | **FAIL** | dedupe در چند جریان خاص وجود دارد، اما action/mutation inventory یکنواخت نیست. ساخت Project با timestamp/UUID و بدون idempotency key انجام می‌شود (`Prototype.tsx:11054-11083`) و same-key/same-payload در برابر same-key/different-payload برای همهٔ actionهای حساس آزموده نشده است. |
| G7 | Memory Control | **FAIL** | `account_private` و `project_private` کنترل‌های مستقل، lifecycle و failure semantics قوی دارند؛ اما `case_private` طبق `CHIDA-Memory-Context-Retrieval-FA.md:235-249` داخل همین Gate است و در source/tests وجود ندارد. تصمیم defer صریح نیز ثبت نشده است. |
| G8 | Source / Composer Local Intake | **PASS** | text + file/photo به SourceRecord همان پروژه وصل می‌شود؛ اصل و hash/MIME قابل‌بررسی است و rollback، read/write failure، lock/race و isolation در `chida-flow.spec.ts:3926-4783` پوشش مستقیم دارند. ضعف File مستقل در G3/G4 باقی می‌ماند و این PASS آن را خنثی نمی‌کند. |
| G9 | Task / Monitor | **PASS** | Task متصل Backbone، deadline/trigger، last/next، enabled/disabled، failure/retry، Run و exact origin binding با مرز browser-local visible-only در `chida-flow.spec.ts:12784-13490` آزموده شده‌اند. ضعف Task دستی در G5 باقی می‌ماند. |
| G10 | BuiltArtifact Lifecycle | **PASS** | closed catalog، exact preview، activate/disable/reactivate، blocked، revision/rollback، failure/journal/lock و tombstone remove در `chida-flow.spec.ts:4784-5403` پوشش دارند. هیچ Plugin/Tool/Connector، اجرای کد، شبکه یا نصب خارجی ادعا نشده است. |
| G11 | UI Acceptance | **FAIL** | affordanceهای «گفتگوی تازه»، «پین‌شده‌ها» با عدد ثابت ۳، «امکانات چیدا» و جست‌وجوی گفتگو handler ندارند (`Prototype.tsx:15607-15620`). «دستیار فنی» فقط sheet را می‌بندد (`20357`). پس مسیر اصلی هنوز عاری از affordance مرده نیست. |
| G12 | Test Evidence | **FAIL** | suite گسترده است، اما تست fixture هویت/AuthorizationContext، cross-case/closed-case، Project fail-close، stale-tab برای storeهای قدیمی، migration همهٔ Gate storeها و تصمیم‌های پنج‌گانه وجود ندارد. count سبز رفتارهایی را که oracle ندارند اثبات نمی‌کند. |

## findingهای مانع PASS

### P1-01 — Project/Profile destructive fail-open

- malformed یا schema-invalid بودن canonical `v2` به read-error ماندگار تبدیل نمی‌شود؛ legacy یا empty جای آن می‌نشیند.
- mount می‌تواند همان state جایگزین را روی canonical خراب بنویسد؛ در نتیجه خرابی می‌تواند به overwrite سکوت‌آمیز منجر شود.
- نخستین `saveProject` و `updateProject` پیش از اثبات persistence، state/UI را جلو می‌برند و expectedVersion/readback ندارند.
- تست فعلی در `chida-flow.spec.ts:1031-1080` رفتار خلاف قرارداد تازه را canonical کرده است؛ اصلاح فقط یک guard کوچک نیست و قرارداد migration/test باید بازطراحی شود.

### P1-02 — نبود Identity/Policy fixture قابل‌اعتماد

- `AccountSide`، owner و builder identity مستقیم داخل objectها hardcode شده‌اند.
- `Membership`، `RoleAssignment` و `AuthorizationContext` نسخه‌دار برای Gate fixture وجود ندارند.
- جداسازی `AccountSide` از `MembershipRole` در runtime قابل‌آزمون نیست و objectهای قدیمی common owner/scope/custodian ندارند.

### P1-03 — mutation seam و optimistic concurrency ناهماهنگ

- Task، Request، Approval و Dispatchهای قدیمی از snapshot UI به آرایهٔ localStorage می‌نویسند.
- Web Lock، reread هنگام commit و expectedVersion برای تمام آن مسیرها حاضر نیست.
- version داخل record به‌تنهایی از lost update چندتب جلوگیری نمی‌کند؛ تست stale-tab سراسری نیز وجود ندارد.

### مانع‌های قراردادی دیگر

- `case_private` و آزمون‌های same-case، cross-case zero-result، closure و closed/deleted ساخته نشده‌اند.
- migration همهٔ Gate storeها و inventory کامل File/Photo/Source بسته نشده است.
- affordanceهای مردهٔ شناخته‌شده هنوز در UI فعال‌اند.
- frontmatter چهار سند منبع هنوز «Proposed — منتظر تأیید» است، در حالی که رسید تأیید در Learnings/Handoff ثبت شده؛ این ناسازگاری مستندی نتیجهٔ کد را عوض نمی‌کند اما در بازنگری سند مادر باید پاک‌سازی شود.

## بدهی‌های Gate-or-defer

هیچ‌یک از موارد زیر در این ارزیابی به‌جای ماهیار defer نشده‌اند:

| بدهی | وضعیت | شرط بستن |
|---|---|---|
| offline draft | `PENDING_DECISION` | پیاده‌سازی و آزمون، یا defer صریح با دلیل |
| export/delete | `PENDING_DECISION` | قرارداد همهٔ storeهای Gate و آزمون، یا defer صریح با دلیل |
| quota failure | `PENDING_DECISION` | failure injection و UX صریح، یا defer صریح با دلیل |
| Mock reset | `PENDING_DECISION` | reset قطعی و بدون mutation پروژه، یا defer صریح با دلیل |
| PWA/manifest/installability | `PENDING_DECISION` | پیاده‌سازی/verification، یا defer صریح با دلیل |

موارد migration همهٔ Gate storeها، inventory File/Photo/Source، `case_private`، حذف affordance مرده و evidence نهایی در بستهٔ جاری defer اختیاری محسوب نشده‌اند.

## شواهد آزمون و محدودیت آن‌ها

- پیش از ایجاد این artifact مستندی، `npm run gate:release` روی candidate محلی اجرا شده بود: app + runtime برابر ۲۷۹/۲۷۹، Sites برابر ۴/۴، build/integrity/TypeScript و `git diff --check` پاس شدند.
- receipt پیش از ماتریس در `.git/chida-release-gate.json`، HEAD `29fb52e...`، fingerprint منبع `ba6c459f8d09a7caaecda114d9143754554f48b57d817e25c7e28dc2c8a2d815` برای ۲۳۷ فایل و fingerprint artifact `9e32f62947f0d66857b9c83f4ecb6650617ff5f967125b4a5579a028823fff88` برای ۱۹ فایل را ثبت کرده است.
- خود receipt فقط byte identity را ثبت می‌کند؛ exit code، نام/تعداد تست، مرورگر، QA و نتیجهٔ این acceptance matrix داخل JSON نیست. بنابراین receipt به‌تنهایی شاهد PASS Gate نیست.
- viewport پیش‌فرض Playwright در `prototype/playwright.config.ts:9` برابر `1100 × 1100` است. ممیزی ایستا ۱۶۰ تست app با viewport صریح `390 × 844` و ۱۱۱ تست با viewport پیش‌فرض یافت؛ فقط سه تعریف تست assertion صریح RTL دارند.
- از ۱۹ regression BuiltArtifact، دو سناریو با viewport صریح موبایل و ۱۷ مسیر failure/lifecycle با viewport پیش‌فرض اجرا می‌شوند. QA دستی تازهٔ BL-1 روی `390 × 844` ثبت شده، اما این جای negative UI matrix سراسری را نمی‌گیرد.
- تست‌های fingerprint coherent-tamper مفیدند، ولی بعضی helperها canonicalization/hash تولید را تکرار می‌کنند و oracle مستقل serialization نیستند.
- این فایل و به‌روزرسانی status docs candidate را تغییر می‌دهند؛ بنابراین receipt پیش از ماتریس پس از این تغییرها برای publish معتبر نیست. چون انتشار درخواست نشده است، full release gate فقط برای سندهای این ارزیابی دوباره اجرا نمی‌شود.

## Non-goals ثابت این Gate

این موارد شرط PASS نیستند و در این تسک ساخته نشده‌اند:

- backend production، cloud persistence/sync، queue/worker دائمی و push؛
- M1a/M1b، ModelGateway عملیاتی، ContextManifest runtime و retrieval مدل؛
- supplier path، shared-case واقعی، send/receive و authenticated response طرف دوم؛
- ExternalActionAuthorization واقعی و هر اثر بیرونی؛
- semantic/vector retrieval، embedding، web/OCR/file AI؛
- connector، marketplace، plugin/skill generation و اجرای کد آزاد؛
- production auth/team/org، desktop نهایی، billing/DR، مالی سبک و گزارش کامل.

## تسک اصلاحی بعدی پیشنهادی

### `BG-F1 — Project/Identity Foundation`

این برش کوچک بعدی باید فقط foundation مشترک را ببندد:

1. fixture محلی و نسخه‌دار `Account/Identity`، `Membership`، `RoleAssignment` و `AuthorizationContext` بسازد و `AccountSide` را از `MembershipRole` جدا کند؛
2. Project و ProjectProfile را به envelope دقیق با owner/scope/accountSide/custodian، schema version، revision/fingerprint/history و status منتقل کند؛
3. canonical خراب را read-error نگه دارد؛ fallback از canonical خراب به legacy و overwrite آن را حذف کند؛ migration فقط از نسل معتبر و صریح، با cutover crash-safe انجام شود؛
4. mutation Project را زیر Web Lock، commit-time reread، expectedVersion، write-before-state و readback proof ببرد؛
5. parser، migration، read/write failure، no-op/version، rollback و رقابت دو تب را با regressionهای منفی و UX خطای موبایل `390 × 844` پوشش دهد.

Task/Request/Approval/Dispatch mutation service مشترک، `case_private`، UI/debt decisions و Gate rerun برش‌های بعدی‌اند و داخل BG-F1 کشیده نمی‌شوند. شروع BG-F1 به پیام اجرایی تازهٔ ماهیار نیاز دارد.

## افزودهٔ پس از ارزیابی — نتیجهٔ محلی BG-F1

ماهیار پس از این ارزیابی، BG-F1 را با پیام اجرایی تازه مجاز کرد. این افزوده نتیجهٔ همان remediation را ثبت می‌کند و جدول تاریخی بالا را بی‌صدا به rerun تازه تبدیل نمی‌کند:

- P1-01 در دامنهٔ Project/Profile بسته شد: canonical v3 خراب fallback ندارد، v2/legacy فقط migration input هستند، empty معتبر legacy را زنده نمی‌کند و cutover pending/committed با source hash، preimage، readback و rollback ماندگار fail-close است.
- P1-02 در دامنهٔ fixture بسته شد: AccountIdentity، Membership، RoleAssignment و AuthorizationContext template exact و نسخه‌دارند؛ context دقیق پروژه resolve و fingerprint آن در history bind می‌شود. AccountSide و MembershipRole دو invariant مستقل‌اند.
- Project و ProjectProfile اکنون objectهای جدا با owner/scope/accountSide/custodian، lifecycle، revision/history/fingerprint هستند؛ activeProjectId و receiptهای idempotency داخل همان envelope اتمیک‌اند.
- create/select/update/rollback از Web Lock، commit-time authority/canonical reread، expectedVersion، idempotency deterministic، write-before-state، exact postimage و candidate-owned rollback استفاده می‌کنند. regressionهای write failure، no-op/rollback، stale editor، رقابت قطعی دو تب، migration race و UX read-error موبایل اضافه شده‌اند.
- P1-03 برای Task/Request/Approval/Dispatch و سایر ردیف‌های FAIL هنوز باز است. `case_private`، UI debt و تصمیم‌های Gate-or-defer نیز تغییر نکرده‌اند؛ بنابراین Builder Prototype Architecture Gate همچنان `FAIL` است و M1a مجاز نیست.

نامزد کوچک بعد `BG-F2 — Manual Task Concurrency Foundation` است؛ Gate rerun فقط پس از remediationهای بعدی و با پیام جدا انجام می‌شود.

## مرز تاریخی پیام BG-GATE-1 پیش از مجوز BG-F1

- در اجرای این Gate هیچ کد runtime، سند مادر یا چهار سند منبع معماری تغییر نکرد.
- هیچ commit، push، Cloudflare deploy یا ChatGPT Sites deploy انجام نشد.
- تغییرهای محلی قبلی REL-1/BL-1 و dirty worktree حفظ شدند.
- پیام اجرای BG-GATE-1 در آن مقطع فقط مجوز ارزیابی Gate بود، نه مجوز M1a، remediation، انتشار یا اصلاح سند مادر؛ مجوز بعدی BG-F1 و نتیجهٔ آن در افزودهٔ بالا ثبت شده است.
