---
title: "CHIDA — حافظه، زمینه و بازیابی"
document_type: "Memory, Context & Retrieval Specification"
version: "1.0"
status: "Proposed — منتظر تأیید صریح ماهیار"
date: "۲۰۲۶-۰۸-۳۰"
baseline_commit: "8b557020768b22b81b8aadbd28c6a078e26c7ee5"
---

# CHIDA — حافظه، زمینه و بازیابی

## ۱. جایگاه و precedence

این سند مالک قرارداد Memory/Context/Retrieval است و به `CHIDA-Domain-Model-Ownership-Permissions-FA.md` برای identity، scope و Domain truth و به `CHIDA-Harness-Agent-Runtime-FA.md` برای run/model/tool orchestration وابسته است.

قاعده: Domain truth را duplicate نمی‌کند؛ SourceRecord مدرک است؛ Memory زمینهٔ private است؛ Instruction/WorkflowDefinition رویهٔ اجرایی است؛ SharedCaseProjection حافظه نیست.

## ۲. وضعیت تصمیم‌ها

| تصمیم | وضعیت |
|---|---|
| chat منبع حقیقت نیست | Approved-by-Mahyar |
| حافظه شفاف/دامنه‌دار/قابل اصلاح و حذف | Approved-by-Mahyar |
| Model inference مستقیم authoritative نیست | Proposed |
| MemoryCandidate فقط با consent صریح → MemoryRecord | Proposed |
| case_private scope خصوصی Memory | Proposed |
| case_shared از taxonomy Memory حذف شود | Proposed |
| procedural executable از Memory جدا شود | Proposed |
| semantic/vector retrieval | Deferred تا بعد از local deterministic contract |
| production retention | TODO_DECISION |

## ۳. taxonomy

### MemoryRecord
اطلاعات contextual پایدار که:
- Domain Object authoritative جدا ندارد، یا
- preference/constraint/user fact مفیدی است، یا
- reference به Domain/Instruction دارد.

scopeهای builder:
- `account_private`
- `project_private`
- `case_private`

organization/store بعداً مطابق AccountSide و فاز تیمی.

### MemoryCandidate
پیشنهاد غیرauthoritative، معمولاً از model inference. هیچ retrieval به‌عنوان fact و هیچ share تا promotion ندارد.

### Direct Remember
فرمان صریح «به خاطر بسپار» مسیر جداست:
user-authored content → validation/scope confirmation → MemoryRecord.
برای دادهٔ حساس یا scope مبهم ممکن است confirmation لازم باشد، اما این مسیر candidate مدل نیست.

### Instruction/WorkflowDefinition
قاعدهٔ اجرایی نیست Memory. Memory فقط `instructionRef` می‌تواند داشته باشد.

## ۴. schema مفهومی MemoryRecord

- `id`
- `version`
- `ownerPrincipalType`
- `ownerPrincipalId`
- `accountSide`
- `scopeType`
- `scopeId`
- `memoryType` (preference/fact/constraint/note/reference)
- `normalizedContent`
- `sourceRefs`
- `provenanceClass` (direct_user/owner_confirmed/external_source)
- `createdAt/updatedAt`
- `status` (current/superseded/disputed/disabled/deleted)
- `sensitivity`
- `freshness/validFrom/validUntil`
- `visibility`
- `manualSearchability`
- `automaticRetrievalEligibility`
- `modelEligibility`
- `shareability`
- `useInContextPreference`
- `supersedesId`
- `instructionRef/domainRef` اختیاری
- `contentHash`
- `auditRefs`.

هیچ flag واحدی جای پنج کنترل مستقل را نمی‌گیرد.

## ۵. MemoryCandidate schema

- candidate id؛
- run id؛
- actor/project؛
- proposed content/type/scope؛
- evidence refs؛
- model/provider؛
- confidence صرفاً diagnostic؛
- createdAt/expiry؛
- status: pending/accepted/rejected/expired.

Promotion فقط:
`user explicit accept of exact candidate payload/scope → authorized Memory Service → MemoryRecord`. Consent به actor/time، candidate id/version/hash، exact content/scope/evidence، expectedVersion و idempotency bind می‌شود؛ stale/expired/rejected/content-changed candidate fail-close است.

Policy می‌تواند candidate را reject کند، اما **نمی‌تواند به‌تنهایی آن را accept و authoritative کند**.

## ۶. Domain truth در برابر Memory

نمونه:
- Project.stage → Project/Profile، نه Memory.
- Decision.reason → Decision، نه Memory.
- «برای این پروژه فقط برند داخلی پیشنهاد بده» → project Memory constraint یا اگر رفتار اجرایی رسمی شد Instruction.
- «من معمولاً پاسخ کوتاه می‌خواهم» → personal preference.
- «پیشنهاد X در revision 3 این قیمت را داشت» → Proposal truth؛ Memory فقط reference.

در conflict، Domain current version بر Memory reference مقدم است.

## ۷. SourceRecord و provenance

Memory source می‌تواند:
- direct user message؛
- Domain Object/version؛
- SourceRecord/version؛
- approved external extraction آینده.

SourceRecord خود Memory نیست. source باید locator/version/date داشته باشد تا Memory قابل توضیح باشد.

Model inference source نیست؛ evidence آن candidate را پشتیبانی می‌کند.

## ۸. کنترل‌های مستقل

1. `visibility`
2. `manualSearchability`
3. `automaticRetrievalEligibility`
4. `modelEligibility`
5. `shareability`

`useInContextPreference=false` hard negative veto برای automatic retrieval و model inclusion است؛ `true` فقط اجازهٔ بررسی سایر eligibilityها را می‌دهد و grant نیست.

مثال: رکورد ممکن است visible/searchable باشد اما automaticRetrieval=false. یا retrieval=true ولی modelEligibility=false و فقط برای deterministic UI suggestion استفاده شود.

## ۹. pipeline بازیابی

ترتیب canonical:
1. trusted actor/account + AccountSide؛
2. MembershipRole/ACL snapshot + project/case scope؛
3. resource/action authorization؛
4. visibility + lifecycle/current/deleted/superseded؛
5. sensitivity/policy؛
6. `useInContextPreference=false` veto؛
7. **Automatic Retrieval Eligibility**؛
8. Model Eligibility اگر مقصد model است؛
9. Base ExecutionEnvelope/data-egress؛
10. candidate generation، relevance/freshness/authority/conflict ranking و budget selection.

Ranking هرگز hard filter را دور نمی‌زند.

## ۱۰. manual search

مسیر:
`trusted scope/ACL → authorization → visibility → lifecycle/current/deleted/superseded → sensitivity → manualSearchability → matching/ranking`.

manual search هیچ model/share permission ایجاد نمی‌کند.

Negative tests: invisible، deleted، superseded، sensitivity-blocked و out-of-scope حتی با text match نتیجه نمی‌شوند.

## ۱۱. conflict و freshness

Conflict types:
- Memory vs current Domain truth؛
- Memory vs Memory same scope؛
- expired/stale source؛
- superseded reference.

رفتار:
- authoritative Domain conflict → Memory stale/disputed؛
- دو Memory معتبر متعارض → conflict آشکار، هیچ silent winner؛
- expiry → automatic retrieval متوقف مگر policy خاص؛
- supersede → old record historical و default retrieval=false.

## ۱۲. ContextManifest

ContextManifest immutable logical snapshot هر run است.

Header به actor/account، AccountSide، MembershipRole/ACL snapshot، project/case، policyVersion، runId، `BaseExecutionEnvelopeHash`، requested intent، selected/allowed model-provider envelope و token budget bind می‌شود.

هر item: type، object/source id+version، reason، authority، sensitivity، automatic/model eligibility، freshness/conflict، exact normalized payload hash، exact excerpt/locator boundaries و token contribution.

Canonical serialization: UTF-8، Unicode NFC، lexicographic structured key order، semantic array order preserved، ISO-8601 normalized dates، canonical decimal و بدون insignificant whitespace.

`manifestHash = hash(canonical(header + ordered item descriptors + exact normalized payload hashes))`.

پیش از model call:
`FinalExecutionBindingHash = hash(manifestHash + finalEnvelopeHash + exactModelGatewayPayloadHash + runId + policyVersion)`.

Manifest full dump نیست.

## ۱۳. payload normalization

قبل از hash/model:
- Unicode normalization؛
- deterministic field ordering برای structured payload؛
- حذف metadata غیرلازم؛
- explicit unit/date representation؛
- excerpt boundaries ثابت.

`payloadHash` باید payload دقیق مدل را bind کند، نه فقط source id را.

## ۱۴. audit، tombstone و delete

Audit اثبات می‌کند چه actor/run/policy/source/version و چه hash/excerpt انتخاب شده است، اما delete را دور نمی‌زند.

Tombstone: id، owner/scope، lastVersion، deletedAt/by، reasonClass، priorContentHash، retentionClass؛ raw payload ندارد.

| Operation | raw payload | retrieval | manual search | cache/index | manifest raw materialization | audit |
|---|---|---|---|---|---|---|
| disable | retained | off | policy-dependent | invalidate use | no new use | event |
| soft-delete | retention-bound | off | hidden | remove/invalidate | no new materialization | tombstone/event |
| hard-delete | destroyed | off | off | purge | purge raw payload/excerpts | metadata/hash only |

delete propagation failure future retrieval را fail-close می‌کند. retention مدت‌زمانی production `TODO_DECISION` است.

## ۱۵. shareability

Memory private مستقیم share نمی‌شود.

اگر کاربر بخواهد داده‌ای را share کند:
1. source/domain/memory visible به کاربر؛
2. user selects explicit fields/content؛
3. preview؛
4. consent؛
5. ShareEvent با snapshot؛
6. SharedCaseProjection.

`shareability=true` فقط eligibility برای این workflow است، نه permission خودکار.

## ۱۵.۱. case_private

`case_private` در Gate Proposed است. acceptance: same-case ACL، cross-case retrieval صفر، closure automatic retrieval را خاموش می‌کند، direct share ممنوع است و share فقط از ShareEvent snapshot می‌گذرد؛ closed/deleted negative tests لازم‌اند.

## ۱۶. sensitivity

ردهٔ مفهومی:
- normal
- private
- sensitive
- restricted.

Sensitivity روی retrieval، model eligibility، provider/data-egress envelope، cache و retention اثر دارد. طبقه‌بندی production و داده‌های حقوقی `TODO_DECISION`.

## ۱۷. cache

مالک policy: Harness/Policy.

Cache key/partition باید حداقل tenant/account/project/sensitivity/policy/model/provider/payload hash را لحاظ کند؛ retention-aware باشد. cross-project reuse private ممنوع. M1a cache خاموش. M1b نیز تا اثبات invalidation الزاماً cache-off است.

## ۱۸. M1b vertical slice

پیش‌شرط: M1a PASS.

سناریو:
1. Project A direct remember؛
2. MemoryRecord ساخته می‌شود؛
3. درخواست دوم؛
4. hard filters؛
5. ContextManifest item با reason/hash؛
6. model response؛
7. disable → استفادهٔ بعدی صفر؛
8. Project B → retrieval صفر؛
9. conflict → آشکار؛
10. provider/model swap → Memory unchanged.

در M1b هنوز web/file RAG/tool/background action لازم نیست.

## ۱۹. failure modes

- `MemoryStoreReadFailure`
- `ScopeMismatch`
- `Unauthorized`
- `InvalidSource`
- `CandidateConsentMissing`
- `VersionConflict`
- `ConflictUnresolved`
- `Expired`
- `RetrievalIneligible`
- `ModelIneligible`
- `SensitivityBlocked`
- `BudgetExceeded`
- `ManifestBuildFailure`
- `DeleteRetentionConflict`.

fail-close: اگر authorization/store/manifest integrity نامعلوم است، Memory وارد model نمی‌شود.

## ۲۰. migration و rollback

- schema versioned؛
- migration validation؛
- valid empty ≠ corruption؛
- rollback Memory با ساخت revision/supersession جدید، نه rewrite audit؛
- control changes versioned/history؛
- delete propagation به index/cache باید قابل اثبات باشد؛
- vector index آینده derivative است و source of truth نیست.

## ۲۰.۱. migration legacy Memory prototype

- legacy `useInContext=true` هرگز automaticRetrievalEligibility/modelEligibility را true نمی‌کند؛ هر دو default=false تا review.
- legacy false → hard veto.
- `personal→account_private` و `project→project_private` فقط با owner/scope معتبر.
- corrupt record silent-drop نمی‌شود: quarantine + migration report.
- valid-empty معتبر است و legacy را resurrect نمی‌کند.
- rollback migration previous version + report/history را حفظ می‌کند.
- tests: corrupt، valid-empty، true-not-grant، false-veto، alias، rollback، duplicate id، missing scope، no-silent-drop.

## ۲۱. acceptance evidence

- direct remember test؛
- candidate consent test؛
- project isolation؛
- automatic retrieval hard filter؛
- model eligibility مستقل؛
- manual search مستقل + negative tests برای invisible/deleted/superseded/sensitive/out-of-scope؛
- disable/delete propagation؛
- supersede/conflict؛
- stale source؛
- ContextManifest hash/boundary؛
- budget truncation deterministic؛
- unauthorized retrieval zero-result/fail-close؛
- cache off M1a؛
- no cross-project leakage.

## ۲۲. acceptance checklist

- [ ] Domain truth duplicate نشده.
- [ ] Candidate بدون user consent authoritative نمی‌شود.
- [ ] Direct Remember مسیر مستقل دارد.
- [ ] case_private private است و case_shared Memory نیست.
- [ ] procedural executable جداست.
- [ ] پنج کنترل مستقل‌اند.
- [ ] Automatic Retrieval Eligibility hard filter است.
- [ ] ContextManifest binding کامل است.
- [ ] audit/delete رابطه روشن است.
- [ ] M1b محدود و قابل تست است.

## ۲۳. unresolved decisions

- `TODO_DECISION`: retention دقیق audit/hard-delete.
- `TODO_DECISION`: sensitivity taxonomy production.
- `TODO_DECISION`: semantic/vector engine و embedding provider.
- `Deferred`: organization/store memory تا فاز مربوط.
- `Deferred`: shared-case runtime تا supplier/backend.
