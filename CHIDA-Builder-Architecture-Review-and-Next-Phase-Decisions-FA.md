---
title: "CHIDA — بازبینی معماری سازنده و تصمیم‌های فاز بعد"
document_type: "Builder Architecture Review & Next-Phase Decisions"
version: "1.2"
status: "Proposed — بستهٔ چهار سند در دور نقد/اصلاح Codex؛ منتظر تأیید صریح ماهیار"
date: "۲۰۲۶-۰۸-۳۰"
language: "fa-IR"
snapshot_source_commit: "8b557020768b22b81b8aadbd28c6a078e26c7ee5"
prototype_canonical: "https://chida-prototype.pages.dev"
---

# CHIDA — بازبینی معماری سازنده و تصمیم‌های فاز بعد

## وضعیت سند

**پیشنهاد تصمیم مشترک Sol + Codex، منتظر تأیید ماهیار.**

تا زمان تأیید صریح ماهیار:

- هیچ برش اجرایی تازه آغاز نمی‌شود؛
- هیچ مدل محلی یا ابری متصل نمی‌شود؛
- مسیر تأمین‌کننده آغاز نمی‌شود؛
- هیچ تغییر repo، کد، release یا deployment انجام نمی‌شود؛
- سه سند تفصیلی اکنون به‌صورت Proposed ساخته شده‌اند و همراه این سند در دور نقد/اصلاح Codex و منتظر تأیید صریح ماهیارند.

این سند «سند مادر محصول» نیست و جای `CHIDA-Product-Definition-FA.md` را نمی‌گیرد. هدف آن بستن دور بازبینی معماری snapshot فعلی سمت سازنده، تعیین gate پایان این فاز و تثبیت تصمیم‌های لازم برای ادامه است.

---

# ۱. مبنا، snapshot و مرز مشاهده

مبنای این بازبینی:

- سند مادر: `CHIDA-Product-Definition-FA.md`
- هنداف جامع: `CHIDA-SOL-HANDOFF-FA.md`
- بک‌لاگ سازنده: `BUILDER-FEATURE-BACKLOG-FA.md`
- README و مستندات فعلی repo
- source commit نهایی: `8b557020768b22b81b8aadbd28c6a078e26c7ee5`
- Cloudflare canonical: `https://chida-prototype.pages.dev`

## مرز observed / verified

این بازبینی فقط مواردی را «تأییدشده از source/hand-off» می‌نامد که از هنداف، repo، commit و مستندات قابل اثبات بوده‌اند.

موارد تعاملی مانند لمس، تایپ، drag و تست تمام جریان‌های UI در live browser به‌صورت مستقل توسط Sol در این دور اجرا نشده‌اند. برای این بخش‌ها، سند به شواهد QA ثبت‌شده در هنداف و تست‌های همان snapshot تکیه می‌کند.

بنابراین snapshot فعلی چنین توصیف می‌شود:

> **منتشرشده و گسترده در سطح prototype سازنده، اما builder-complete نیست و backend، model runtime، Harness واقعی یا supplier path ندارد. project isolation فقط برای رکوردهای project-scoped محلیِ دارای این قرارداد تأیید شده است؛ version/lineage/write-before-state/fail-close نیز فقط در بخش‌های واقعاً پیاده‌شده معتبرند. Project store و بعضی File/Memory paths این تضمین‌ها را هنوز کامل و یک‌دست ندارند. Build فعلی global/non-project-scoped و فاقد lifecycle واقعی است.**

---

# ۲. نتیجهٔ بازبینی و تصمیم راهبردی

مسیر معماری تا این نقطه سالم است و foundation فعلی ارزش حفظ‌کردن دارد. مهم‌ترین نقاط قوت snapshot عبارت‌اند از:

- جداسازی پروژه‌ها؛
- version و lineage؛
- rollback و no-op semantics؛
- fail-close؛
- write-before-state؛
- تفکیک read-error از empty state؛
- حفظ source و provenance؛
- عدم ادعای شبکه، AI یا اثر بیرونی در جایی که وجود ندارد؛
- ساده‌سازی UI بدون حذف قراردادهای فنی زیرین.

مشکل اصلی، نه foundation فعلی، بلکه تعریف بیش‌ازحد بزرگ «پایان فاز سازنده» بود.

تصمیم این سند:

> **پایان builder نباید مساوی پایان کل T13 یا تکمیل تقریباً تمام V1 پیش از اتصال مدل باشد.**

Builder باید زمانی بسته شود که سیستم عامل سمت سازنده، ownership، source، memory، task، BuiltArtifact و failure semantics به‌اندازه‌ای پایدار شده باشند که مدل روی آن‌ها سوار شود و مجبور نباشد کمبودهای بنیادی محصول را جبران کند.

---

# ۳. مغایرت‌ها و cleanupهای شناخته‌شده

## ۳.۱. AccountSide در برابر نقش داخل فضا

برای جلوگیری از قاطی‌شدن identity با permission role، invariant معماری به‌صورت زیر تثبیت می‌شود:

```text
AccountSide = builder | supplier
```

در متن محصول می‌توان از عبارت «نقش اصلی حساب» استفاده کرد.

اما:

```text
MembershipRole
```

فقط نقش فرد **داخل فضای همان سمت** است؛ برای مثال نقش او در یک پروژه یا سازمان سازنده.

`AccountSide`:

- از Identity/Policy معتبر می‌آید؛
- توسط Harness یا مدل infer نمی‌شود؛
- توسط Harness یا مدل override نمی‌شود؛
- بخشی از authorization boundary است.

## ۳.۲. عدم وجود role switch عادی

هیچ مسیر عادی role switch یا migration در محصول وجود ندارد.

کاربر در تجربهٔ معمول:

- toggle سازنده/تأمین‌کننده ندارد؛
- side خود را در runtime تغییر نمی‌دهد؛
- با mutation ساده یا بی‌اثر بر تاریخچه، builder را supplier یا بالعکس نمی‌کند.

اگر در آینده فرآیند استثنایی حقوقی یا support برای migration لازم شود، آن موضوع:

> `TODO_DECISION — Exceptional AccountSide Migration`

خواهد بود و باید قرارداد هویت، تاریخچه، داده و abuse جداگانه داشته باشد.

## ۳.۳. حدود امنیت تک‌نقشی

تک‌نقشی‌بودن حساب:

- تعارض منافع را کاهش می‌دهد؛
- سطح سوءاستفاده را محدودتر می‌کند؛
- مرز داده و authorization را ساده‌تر می‌کند.

اما:

> **ضدتقلب کامل یا تضمین عدم تعارض منافع نیست.**

مسائل multi-account، related identity، beneficial ownership، duplicate actors و abuse در سند آیندهٔ `Identity & Abuse` بسته می‌شوند.

## ۳.۴. READMEهای عقب‌مانده

`README.md` و `prototype/README.md` در دو مورد از snapshot عقب‌ترند:

- توصیف سند غیرتصویری به‌عنوان metadata-only؛
- توصیف Build به‌عنوان «نصب آزمایشی پلاگین».

این موارد فعلاً فقط **documentation cleanup پس از تصویب** هستند و هیچ فایل در این دور اصلاح نمی‌شود.

---

# ۴. تعریف دقیق Builder Architecture Gate

نام gate:

> **Builder Prototype Architecture Gate**

تعریف:

> سمت سازنده زمانی از این Gate عبور می‌کند که مدل داده، ownership، memory control، source intake، task/monitor، BuiltArtifact lifecycle، failure semantics و UX اصلی آن به‌اندازه‌ای پایدار و آزموده باشند که M1 بدون ساخت foundation موازی یا جبران نقص‌های ساختاری آغاز شود.

این Gate یک acceptance matrix دودویی دارد و به «کل T13» ارجاع مبهم نمی‌دهد.

---

# ۵. Acceptance Matrix دودویی Builder Gate

هر ردیف فقط `PASS` یا `FAIL` می‌گیرد. **تمام ردیف‌های inventory اجباری (`Required=Yes`) هستند، مگر اینکه همان بدهی با دلیل ثبت‌شده و تأیید صریح ماهیار به Deferred تبدیل شود.**

| حوزه | معیار پذیرش دودویی |
|---|---|
| Ownership / Scope | همهٔ objectهای builder owner/scope روشن دارند؛ `AccountSide` از Identity/Policy می‌آید؛ `MembershipRole` با آن قاطی نمی‌شود. |
| Project Isolation | دادهٔ Project A از Project B قابل retrieval/mutation نیست و regression test آن را اثبات می‌کند. |
| Schema / State / Version | Project، Milestone، Decision، Task، Source، Memory، Request، Proposal، Negotiation-local و BuiltArtifact قرارداد state/version روشن دارند. |
| Failure / Rollback | read-error با empty یکی نیست؛ mutation روی state ناخوانده fail-close است؛ rollback و stale-write handling تعریف شده است. |
| Optimistic Concurrency | mutationهای معتبر از Domain/Application Service با version check یا قرارداد معادل انجام می‌شوند؛ overwrite خاموش مجاز نیست. |
| Idempotency | mutation و actionهای حساس محلی قرارداد جلوگیری از تکرار ناخواسته دارند؛ برای action بیرونی آینده این invariant الزامی است. |
| Memory Control | مشاهده، manual search، automatic retrieval eligibility، model eligibility و shareability از هم جدا هستند؛ disable/delete/supersede مؤثر است. |
| Source / Composer Local Intake | Composer می‌تواند text + file/photo محلی را به SourceRecord project-scoped وصل کند؛ منبع اصلی قابل بازیابی است. |
| Task / Monitor | task، deadline/trigger، last/next check، disabled، failure و retry state حداقلی وجود دارد و رفتار browser-local صادقانه برچسب می‌خورد. |
| BuiltArtifact Lifecycle | یک BuiltArtifact امن، declarative، project-scoped و catalog-based می‌تواند preview، activate، disable، version/rollback و remove شود. |
| UI Acceptance | مسیرهای اصلی builder روی viewport هدف فاقد affordance مرده، ادعای capability غیرواقعی و تناقض مهم هستند. |
| Test Evidence | regressionهای ownership، isolation، version، failure، memory control، source intake، task/monitor و BuiltArtifact lifecycle سبز هستند و QA snapshot ثبت شده است. |

## نگاشت بدهی‌های T13

late response→Task/Monitor/Run؛ offline draft→Gate یا defer صریح؛ export/delete→Gate یا defer صریح؛ migration همهٔ storeها→Gate؛ quota→Gate یا defer صریح؛ Mock reset→Gate یا defer صریح؛ PWA/installability→Gate یا defer صریح؛ dead affordance→UI Gate؛ README cleanup→Gate docs و شامل cleanup UI/data contract Build؛ QA/E2E→Gate evidence. تکمیل یک‌تکهٔ T13 شرط نیست، اما هیچ موردی بی‌تصمیم رها نمی‌شود.

## Non-goals این Gate

این موارد شرط عبور نیستند:

- backend production؛
- cloud sync؛
- supplier path؛
- shared case واقعی؛
- send/receive واقعی؛
- OpenAI production integration؛
- web search واقعی؛
- OCR/vision production؛
- worker دائمی؛
- push notification؛
- desktop نهایی؛
- billing؛
- DR؛
- marketplace؛
- connector؛
- plugin generation؛
- مالی سبک؛
- تکمیل یک‌تکهٔ T13؛
- production readiness.

---

# ۶. تعریف سمت حساب و مدل مالکیت

## ۶.۱. AccountSide

```text
AccountSide = builder | supplier
```

این invariant، boundary هویت و policy است.

مدل و Harness فقط آن را **مصرف** می‌کنند، نه اینکه تعیین یا تغییر دهند.

## ۶.۲. MembershipRole

`MembershipRole` فقط داخل فضای همان سمت معنا دارد.

نمونه در سمت builder:

- owner؛
- project_manager؛
- purchaser؛
- member.

این نقش‌ها future-facing هستند و وجود معماری آن‌ها به معنی الزام UI تیمی در Builder Gate نیست.

## ۶.۳. عدم انتقال خودکار side

هیچ داده، memory، instruction یا object صرفاً به دلیل شباهت account identity از builder به supplier یا بالعکس منتقل نمی‌شود.

---

# ۷. تصمیم دربارهٔ T8 و مرز shared negotiation

بخش‌های local/private ساخته‌شدهٔ T8 حفظ می‌شوند:

- draft سؤال مذاکره؛
- رونویسی دستی پاسخ؛
- judgment سازنده؛
- ثبت کیفی تغییر شرایط؛
- diff revisionهای local proposal.

این‌ها به دلیل private/local بودن و عدم ادعای شبکه، برای builder foundation مفیدند.

## بخش‌هایی که defer می‌شوند

تا وجود supplier path، backend و shared-domain contract، موارد زیر ساخته نمی‌شوند:

- پاسخ واقعی یا authenticated طرف دوم؛
- receive/send شبکه‌ای واقعی؛
- verified supplier identity؛
- amendment رسمی/shared؛
- پیشنهاد تازهٔ authenticated طرف مقابل؛
- consent واقعی طرف دوم؛
- بستن shared case با actorهای واقعی؛
- exchange receipt دوطرفه.

## `case_shared` حافظه نیست

`case_shared` نباید به‌عنوان Memory تعریف شود.

تعریف درست:

> **shared domain projection / share event**

هر share event یا shared projection باید حداقل این‌ها را داشته باشد:

- snapshot؛
- consent؛
- actor؛
- timestamp؛
- ACL؛
- audit trail؛
- source version.

حافظهٔ خصوصی هیچ‌گاه مستقیماً به سمت مقابل داده نمی‌شود.

اگر داده‌ای از private space به shared case برود، فقط از مسیر share operation صریح، محدود و نسخه‌دار انجام می‌شود.

## محاسبهٔ اثر تغییر شرایط

اثر عددی یا فرمول‌دار تغییر شرایط تا زمانی defer می‌شود که:

- formula؛
- unit؛
- source؛
- domain validity

تعریف و آزموده شده باشد.

## follow-up

موعد پاسخ و follow-up به T9-B / Task & Monitor منتقل می‌شود، چون capability عمومی پروژه است نه feature اختصاصی shared negotiation.

---

# ۸. تصمیم معماری Memory

اصل:

> **مدل حافظه ندارد؛ CHIDA حافظه دارد.**

Memory متعلق به Data/Application layer است و provider/model قابل‌تعویض است.

## ۸.۱. سلسله‌مراتب منبع حقیقت

ترتیب authority:

1. Domain Objectهای ساختاریافته و نسخه‌دار؛
2. Source/File ثبت‌شده با provenance؛
3. MemoryRecord صریح یا تأییدشدهٔ کاربر؛
4. chat continuity کوتاه‌مدت؛
5. inference مدل فقط به‌صورت candidate.

اگر یک واقعیت در Domain Object وجود دارد، همان truth source است و نباید به‌صورت duplicate authoritative در Memory نوشته شود.

## ۸.۲. MemoryCandidate جدا از MemoryRecord

مدل نمی‌تواند inference خود را مستقیماً MemoryRecord کند.

مسیر:

```text
Model output
  ↓
MemoryCandidate
  ↓
Policy: reject / allow presentation / require review
  ↓
Direct explicit user confirmation of exact payload + exact scope
  ↓
MemoryRecord
```

`MemoryCandidate` authoritative نیست. Policy جای consent را نمی‌گیرد؛ promotion فقط با تأیید مستقیم و صریح کاربر روی payload و scope دقیق مجاز است.

## ۸.۳. دامنه‌های Memory در builder

حداقل:

- `personal`
- `project`

و برای ارجاع به رویه:

- Memory می‌تواند به Instruction/WorkflowDefinition reference بدهد.

اما procedural rule اجرایی، MemoryRecord نیست.

## ۸.۴. رویهٔ اجرایی

قاعده یا رویه‌ای که رفتار سیستم را تغییر می‌دهد باید شیء جداگانه باشد:

```text
Instruction
WorkflowDefinition
```

با ویژگی‌های:

- versioned؛
- permissioned؛
- scoped؛
- auditable؛
- explicit lifecycle.

Memory فقط می‌تواند بگوید «کاربر معمولاً از Instruction X استفاده می‌کند» یا به آن reference بدهد.

---

# ۹. کنترل‌های مستقل Memory و Context

این پنج مفهوم نباید در یک flag ادغام شوند:

1. **Visibility** — آیا کاربر می‌تواند آن را ببیند؟
2. **Manual Searchability** — آیا در جست‌وجوی دستی ظاهر می‌شود؟
3. **Automatic Retrieval Eligibility** — آیا retrieval خودکار اجازهٔ انتخاب آن را دارد؟
4. **Model Eligibility** — آیا اصولاً می‌تواند وارد ContextManifest مدل شود؟
5. **Shareability** — آیا می‌تواند در یک share operation صریح به shared projection تبدیل شود؟

`useInContext=true` به‌تنهایی:

- مجوز model inclusion نیست؛
- مجوز share نیست؛
- ACL را دور نمی‌زند؛
- hard filterهای authorization را دور نمی‌زند.

## retrieval order

پیش از relevance ranking:

1. tenant/account؛
2. `AccountSide`؛
3. MembershipRole/ACL؛
4. project/case scope؛
5. sensitivity/policy؛
6. lifecycle state؛
7. automatic retrieval eligibility؛
8. model eligibility.

`Automatic Retrieval Eligibility` یک hard filter مستقل است و `Model Eligibility` جای آن را نمی‌گیرد.

فقط بعد از این hard filterها relevance، freshness، authority و conflict بررسی می‌شوند.

---

# ۱۰. تصمیم معماری Harness

Harness مرکز هماهنگی است، اما authority بی‌مرز نیست.

## ۱۰.۱. ترتیب الزامی

```text
Trusted identity + scope resolution
    ↓
Resource / action authorization
    ↓
Automatic Retrieval Eligibility
    ↓
Model / Tool Eligibility
    ↓
Retrieval / tool routing
    ↓
Context assembly
```

**Authorization باید پیش از retrieval و tool routing انجام شود.**

مدل نباید حتی candidate tool یا data را ببیند اگر policy اجازهٔ visibility/retrieval آن را نداده است.

## ۱۰.۲. Commit Boundary

مدل و خود orchestrator خروجی مدل را مستقیم commit نمی‌کنند.

مسیر mutation:

```text
Model / Tool Proposal
    ↓
Harness validation
    ↓
Policy / approval check
    ↓
Authorized Domain/Application Service
    ↓
Optimistic concurrency / idempotency
    ↓
Commit
```

تنها Domain/Application Service مجاز mutation را انجام می‌دهد و هنگام commit باید actor/action/resource، current authorization، approval snapshot، target/expected version و idempotency را اتمیک دوباره enforce کند. mismatch یا stale state باید fail-close شود؛ Harness یا خروجی مدل مرجع commit نیست.

## ۱۰.۳. مسئولیت Harness

- intent؛
- scope؛
- output type؛
- ContextManifest؛
- model route؛
- skill/tool route؛
- validation؛
- approval gate؛
- run state؛
- retry/cancel/recovery؛
- budget؛
- audit؛
- eval hooks.

## ۱۰.۴. ModelGateway

Harness/Policy برای هر run ابتدا `BaseExecutionEnvelope` و سپس، پس از ContextManifest، `FinalExecutionEnvelope` را تعیین می‌کند. envelope شامل allowed-provider/model، data-egress، sensitivity، retention، cache permission، tool permission و budget است.

ModelGateway فقط درون همان envelope مسئول provider/model call، request/response normalization، streaming، timeout/cancel، retry/failover مکانیکی و usage/cost telemetry است. حق گسترش envelope را ندارد.

Cache در صورت فعال‌شدن باید tenant/project/actor-access/sensitivity/retention-aware باشد. در M1a و M1b cache خاموش است.

Harness تصمیم می‌گیرد چه context، tool/workflow و provider/policy envelope مجاز است؛ ModelGateway فقط call را اجرا می‌کند.

# ۱۱. ContextManifest

`ContextManifest` snapshot محدود و auditپذیر context انتخاب‌شده برای یک run است و فقط Memory نیست.

می‌تواند شامل authoritative domain facts، Source excerpts، confirmed MemoryRecordها، relevant task/run state، current user input و instruction references مجاز باشد.

هر Manifest حداقل به actor/account، `AccountSide`، MembershipRole/ACL snapshot، project/case، policy version، run id، `BaseExecutionEnvelopeHash`، model/provider، reason، source/version، sensitivity، eligibility، token budget، exact normalized payload hash و excerpt/locator boundaries bind می‌شود.

Canonical serialization باید deterministic باشد؛ `manifestHash` روی header، ordered item descriptors و exact normalized payload hashes محاسبه می‌شود. پیش از model call، Final envelope، Manifest و exact ModelGateway payload در یک binding نهایی به run/policy متصل می‌شوند.

Audit retention نباید delete/supersede را دور بزند. پس از hard-delete، raw payload/excerpt از audit materialization، cache و index حذف می‌شود و فقط metadata/tombstone/hash مجاز طبق retention باقی می‌ماند.

ContextManifest نباید chat dump، full project dump یا memory dump باشد.

# ۱۲. Build: تفکیک چهار مفهوم

چهار مفهوم مستقل‌اند: `BuiltArtifact`، `Capability/Plugin`، `RuntimeTool` و `Connector`.

`BuiltArtifact` شیء declarative و project-scoped از catalog بستهٔ اجزای امن است. Build فعلی snapshot هنوز این قرارداد را کامل ندارد و cleanup آن شامل UI/data contract و مستندات است.

Stateها:
`draft | preview_ready | active | disabled | blocked | removed(tombstone)`.

Commandها:
`createDraft | updateDraft | preview | activate | disable | reactivate | createRevision | rollback | remove`.

هر transition permission، dependency و expectedVersion را enforce می‌کند؛ permission/dependency invalidation artifact فعال را `blocked` می‌کند؛ rollback revision تازه می‌سازد؛ remove تابع retention است و tombstone lineage را حفظ می‌کند.

Builder Gate plugin generation، Connector، code execution، marketplace یا server-side arbitrary logic نمی‌خواهد.

# ۱۳. ترتیب پنج برش کوچک بعدی

تا زمانی که این سند و سپس بستهٔ سه سند تفصیلی توسط ماهیار تأیید نشده و پیام اجرایی جدا صادر نشده، هیچ‌کدام اجرا نمی‌شوند.

## برش ۱ — Project Backbone

حداقل:

- یک Milestone؛
- یک Decision با reason؛
- اتصال یک Task به آن‌ها؛
- project scope؛
- version؛
- history؛
- rollback-safe retrieval.

هدف: پایهٔ واقعی «سیستم عامل پروژه».

## برش ۲ — Memory Core

فقط:

- personal؛
- project؛
- MemoryCandidate جدا؛
- source؛
- status؛
- supersede/conflict؛
- disable/delete؛
- controlهای مستقل eligibility.

هنوز embedding، semantic RAG یا model retrieval وجود ندارد.

## برش ۳ — Source + Composer Local Intake

- text input؛
- file/photo selection؛
- SourceRecord محلی؛
- project linkage؛
- source reopen؛
- version/provenance.

هنوز OCR/vision/extraction هوشمند لازم نیست.

## برش ۴ — Task / Monitor Core

- deadline/trigger؛
- last check؛
- next check؛
- enabled/disabled؛
- failure؛
- retry؛
- browser-local honesty.

## برش ۵ — BuiltArtifact Lifecycle Minimum

- preview؛
- activate؛
- disable؛
- version/rollback؛
- remove؛
- catalog بسته؛
- manifest داده/مجوز.

پس از برش ۵:

> **Builder Architecture Gate Review**

اگر acceptance matrix PASS شد، builder prototype architecture بسته می‌شود.

---

# ۱۴. ورود به فاز مدل: M1a سپس M1b

اولین فاز مدل دو مرحلهٔ مستقل دارد.

## M1a — Provider-neutral Local Adapter

هدف فقط اثبات provider-neutral local text path است و **پیش‌شرط آن PASS کامل Builder Gate و تأیید اجرایی جداگانهٔ ماهیار است**.

مسیر:
`UI → Harness boundary → ModelGateway → LocalAdapter → loopback local model → ModelGateway → origin-bound safe plain-text response`.

معیار PASS دودویی:
- loopback-only و endpoint literal ثابت؛ LAN/configurable URL رد؛
- opt-in؛ فقط همان پیام جاری و بدون chat history؛
- text-only؛
- LocalAdapter در hosted Cloudflare/Sites compile/runtime disabled؛
- hosted-off و cloud fallback صفر؛
- LocalAdapter فقط پشت ModelGateway؛
- timeout/cancel و fail-close؛
- safe plain-text rendering؛
- label: «مدل محلی آزمایشی · بدون منبع»؛
- no cache و no persistent prompt/response log retention؛
- no Memory/File/Source/Web/Tool/mutation/background action/supplier/shared data؛
- پاسخ دیررس به attempt/gatewayRequestId/run/actor/account/AccountSide/ACL/project/policy/envelope/manifest origin bind و stale/foreign/cancelled/policy-changed discard می‌شود؛
- negative tests برای hosted enable، configurable/LAN URL، history، cloud call، timeout/cancel fallback و stale response.

M1a local بودن انتخاب production provider نیست.

## M1b — ContextManifest / Memory Vertical Slice

فقط پس از پذیرش M1a.

سناریوی مرجع:

1. کاربر در Project A صریحاً چیزی را به خاطر می‌سپارد؛
2. MemoryRecord معتبر ساخته می‌شود؛
3. درخواست بعدی همان پروژه باعث retrieval مجاز می‌شود؛
4. ContextManifest نشان می‌دهد چه چیزی و چرا انتخاب شده؛
5. disable/delete استفادهٔ بعدی را متوقف می‌کند؛
6. Project B دسترسی ندارد؛
7. conflict پنهان نمی‌شود؛
8. تغییر provider/model روی Memory اثری ندارد.

M1b هنوز به معنی full RAG، web، tool use یا agent runtime کامل نیست.

---

# ۱۵. Non-goals و موارد deferشده پس از Builder Gate

موارد زیر بعد از Builder Gate و بر اساس فاز مربوط خود انجام می‌شوند:

- supplier experience؛
- shared case واقعی؛
- contact exchange واقعی؛
- network send/receive؛
- external action approval runtime؛
- web search؛
- file AI extraction؛
- background cloud worker؛
- push notification؛
- report کامل؛
- Today Project کامل؛
- مالی سبک؛
- desktop final؛
- production auth؛
- cloud persistence؛
- organization/team complexity؛
- connector ecosystem؛
- plugin marketplace؛
- production billing/infra.

---

# ۱۶. تصمیم‌های معماری قطعی این دور

این موارد **Proposed** هستند؛ تهیهٔ سند به‌معنای Approved-by-Mahyar نیست و فقط با تأیید صریح ماهیار پذیرفته می‌شوند:

1. `AccountSide = builder | supplier`.
2. `MembershipRole` فقط role داخل فضای همان side است.
3. AccountSide از Identity/Policy می‌آید و مدل/Harness حق infer یا override ندارد.
4. هیچ role switch عادی وجود ندارد.
5. تک‌نقشی‌بودن کاهش‌دهندهٔ تعارض و abuse surface است، نه تضمین ضدتقلب.
6. `case_shared` حافظه نیست؛ shared domain projection/share event است.
7. private memory مستقیم share نمی‌شود.
8. procedural rule اجرایی، `Instruction/WorkflowDefinition` است نه MemoryRecord.
9. visibility، manual search، automatic retrieval، model eligibility و shareability مستقل‌اند.
10. authorization پیش از retrieval/tool routing اجرا می‌شود.
11. mutation فقط از Domain/Application Service مجاز با concurrency/idempotency انجام می‌شود.
12. مدل و orchestrator خروجی مدل را مستقیم commit نمی‌کنند.
13. Builder Gate acceptance matrix دودویی دارد.
14. T8 shared بخش عمده‌اش defer می‌شود.
15. Build در Gate فقط BuiltArtifact lifecycle است.
16. M1 ابتدا M1a و سپس M1b است.
17. سه سند تفصیلی اکنون Proposed ساخته شده‌اند و در دور نقد/اصلاح Codex هستند.

---

# ۱۷. وضعیت سه سند تفصیلی بعدی

سه سند تفصیلی زیر اکنون Proposed ساخته شده‌اند و همراه این سند یک بستهٔ واحد برای نقد و تأیید ماهیارند:

1. `CHIDA-Domain-Model-Ownership-Permissions-FA.md`
2. `CHIDA-Memory-Context-Retrieval-FA.md`
3. `CHIDA-Harness-Agent-Runtime-FA.md`

این سند جای هیچ‌کدام را نمی‌گیرد و عمداً وارد schema نهایی، interface کامل runtime، API contract یا implementation detail production نمی‌شود.

---

# ۱۸. اقدام بعد از تأیید

1. هر چهار سند Proposed اکنون آماده‌اند و در دور نقد/اصلاح Codex قرار دارند.
2. بستهٔ clean integrated به ماهیار ارائه می‌شود.
3. فقط تأیید صریح ماهیار این بسته و supersessionهای Proposed آن را به تصمیم پذیرفته‌شده تبدیل می‌کند.
4. تأیید اسناد هیچ implementation را خودکار آغاز نمی‌کند.
5. فقط پس از پیام اجرایی صریح و جداگانهٔ ماهیار، **Project Backbone** به‌عنوان برش اول آغاز می‌شود.
6. M1a، M1b، supplier، backend و برش‌های بعدی تابع Gate و تأییدهای جدا هستند.

---

# جمع‌بندی نهایی

Snapshot فعلی foundation خوبی برای ادامه دارد، اما پایان builder نباید با تکمیل کل محصول اشتباه گرفته شود.

تعریف نهایی مسیر:

> **چهار سند Proposed آماده، نقد و اصلاح می‌شوند → بستهٔ clean integrated فقط با تأیید صریح ماهیار پذیرفته می‌شود → سپس فقط با پیام اجرایی جداگانهٔ ماهیار پنج برش Builder آغاز می‌شوند → acceptance matrix را PASS می‌کنیم → M1a را فقط text-only و provider-neutral آزمایش می‌کنیم → پس از پذیرش، M1b را برای ContextManifest/Memory اجرا می‌کنیم → سپس به سمت Harness کامل‌تر و در زمان مناسب Supplier می‌رویم.**

مرز اصلی معماری:

> **Identity و Policy تعیین می‌کنند چه کسی و در کدام سمت است؛ Domain Objects حقیقت را نگه می‌دارند؛ Memory فقط زمینهٔ صریح و کنترل‌شده است؛ Harness هماهنگ می‌کند؛ Model پیشنهاد می‌دهد؛ فقط Application Service مجاز commit می‌کند.**
