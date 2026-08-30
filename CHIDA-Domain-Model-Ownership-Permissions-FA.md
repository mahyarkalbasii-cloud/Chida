---
title: "CHIDA — مدل دامنه، مالکیت و مجوزها"
document_type: "Domain Model, Ownership & Permissions Specification"
version: "1.0"
status: "Proposed — منتظر تأیید صریح ماهیار"
date: "۲۰۲۶-۰۸-۳۰"
baseline_commit: "8b557020768b22b81b8aadbd28c6a078e26c7ee5"
---

# CHIDA — مدل دامنه، مالکیت و مجوزها

## ۱. جایگاه، وابستگی و precedence

این سند specification قابل‌نقد برای مدل دامنه و مالکیت است؛ production schema/code نیست.

precedence:
1. دستور صریح ماهیار؛
2. تصمیم‌های `Approved-by-Mahyar`؛
3. پس از تأیید، `CHIDA-Builder-Architecture-Review-and-Next-Phase-Decisions-FA.md` برای supersessionهای معماری؛
4. `CHIDA-Product-Definition-FA.md` برای هویت و V1؛
5. learnings/handoff/backlog برای evidence و prototype contracts.

وابستگی مستقیم:
- `CHIDA-Memory-Context-Retrieval-FA.md`
- `CHIDA-Harness-Agent-Runtime-FA.md`

مرز ثابت: CHIDA پرداخت، قرارداد، تضمین، حمل، تحویل یا حل اختلاف را اجرا/تضمین نمی‌کند. اقدام تجاری بیرونی نیازمند human approval است.

## ۲. وضعیت تصمیم‌ها

| تصمیم | وضعیت |
|---|---|
| chat منبع حقیقت نیست و اشیای ساختاریافته مرجع‌اند | Approved-by-Mahyar؛ جزئیات schema این سند Proposed |
| مرز معامله پس از تبادل تماس | Approved-by-Mahyar |
| Account تک‌سمتی در learnings | Approved-by-Mahyar؛ supersession سند مادر هنوز نیازمند تأیید بسته |
| نام `AccountSide` و تفکیک `MembershipRole` | Proposed |
| case_shared = projection/share event، نه Memory | Proposed |
| SourceRecord پیش از Builder Gate | Proposed |
| production auth | Deferred |
| team/org permissions کامل | Deferred |
| Identity & Abuse برای multi-account | TODO_DECISION |

## ۳. invariants هویت و scope

`AccountSide = builder | supplier`.

AccountSide:
- از trusted Identity/Policy fixture یا production identity آینده می‌آید؛
- در مسیر عادی immutable است؛
- توسط model/Harness infer یا mutate نمی‌شود.

`MembershipRole` فقط در workspace همان side است. Builder prototype می‌تواند fixture ساده داشته باشد؛ این سند وجود roleهای آینده را به UI V1 تحمیل نمی‌کند.

canonical scope enum:
- `account_private`
- `project_private`
- `case_private`
- `store_private`
- `shared_case_projection`

Alias migration: `personal→account_private` و Memory `project→project_private`. `case_shared` alias Memory نیست. write جدید با alias ممنوع.

هیچ object بدون owner scope معتبر authoritative نیست.

## ۳.۱. Membership / RoleAssignment / AuthorizationContext

برای اینکه MembershipRole/ACL ورودی بی‌منبع نباشد، حتی در Gate fixture این اشیای نسخه‌دار وجود دارند:

- `Membership(id, principalId, scope, status, version)`
- `RoleAssignment(id, membershipId, role, status, version)`
- `AuthorizationContext(actor, AccountSide, membershipVersion, roleAssignmentVersion, ACLSnapshotHash, policyVersion, resolvedScope)`

این fixture قرارداد منطقی است و production auth محسوب نمی‌شود.

## ۴. خانواده‌های شیء و مالک یکتا

| شیء | Custodian / سرویس نگه‌دارندهٔ truth | scope |
|---|---|---|
| AccountIdentity | Identity/Policy | account |
| Project | Domain Service | builder/project |
| ProjectProfile | Domain Service | project |
| Milestone | Domain Service | project |
| Decision | Domain Service | project |
| Task | Domain Service | project |
| Approval | Approval Domain Service | project/case_private |
| Request / RequestItem | Procurement Domain Service | project |
| DispatchDraft | Procurement Domain Service | project |
| Proposal / ProposalRevision | Proposal Domain Service | project/private transcription تا supplier واقعی |
| Comparison | Comparison Domain Service | project |
| ComparisonDecision | Comparison Domain Service | project |
| NegotiationQuestion/Transcript/Judgment/Change | Negotiation Domain Service | case_private/project |
| File / Photo | Source/File Domain Service | project |
| SourceRecord | Source Domain Service | project/account |
| MemoryRecord/Candidate | Memory Service | private scopes |
| Instruction/WorkflowDefinition | Instruction Domain Service | account/project |
| Monitor/Run | Task/Run Domain Service | project |
| BuiltArtifact | Artifact Domain Service | project |
| ShareEvent/SharedCaseProjection | Shared Case Domain Service | shared case |

اصل ضد duplication: اگر واقعیت در Domain Object وجود دارد، Memory نسخهٔ authoritative دیگری از آن نمی‌سازد؛ فقط reference/context می‌دهد.

## ۵. قرارداد مشترک object

هر object مهم در حد نیاز:
- `id`, `type`, `version`, `status`
- `ownerPrincipalType = account | project | organization | store`
- `ownerPrincipalId`
- `accountSide`
- `scopeType/scopeId`
- `custodianService`
- `createdBy/At`, `updatedBy/At`
- `sourceRefs`, `sensitivity`, `lifecycleState`
- tombstone/history refs در صورت نیاز.

`ownerPrincipal*` مالکیت تجاری/فضایی را بیان می‌کند؛ `custodianService` فقط authoritative state را نگه می‌دارد و مالک تجاری داده نیست.

`expectedVersion` persisted object field نیست؛ فقط command precondition است.

## ۶. Project و ProjectProfile

Project unit اصلی builder است.

حداقل lifecycle پیشنهادی:
`active → archived → deleted/tombstoned`.

ProjectProfile از Project جداست تا مشخصات تدریجی نسخه‌دار شوند. فیلدهای snapshot فعلی مانند نام، محدوده، مرحله، نوع کاربری، مساحت، زیربنا، طبقات و واحدها در schema versioned قرار می‌گیرند.

Failure:
- corrupted store = read-error، نه empty؛
- mutation روی unreadable state = fail-close؛
- stale expectedVersion = conflict؛
- migration failure = fail-close + recoverable previous version.

## ۷. Milestone، Decision و Task

Milestone:
- project-scoped؛
- title/status/date optional؛
- version/history.

Decision:
- statement؛
- reason اجباری؛
- actor؛
- sourceRefs اختیاری؛
- linked milestone/task؛
- supersession بدون overwrite تاریخچه.

Task:
- title، nextStep، dueAt؛
- status؛
- linked objects؛
- failure/retry fields در صورت executable/monitoring؛
- version/no-op/history.

## ۸. Request، Approval و DispatchDraft

Request revision immutable و fingerprinted است؛ no-op revision ممنوع و rollback revision تازه می‌سازد.

سه approval مستقل‌اند:

| Type | Purpose | Store/Lifecycle | Authority |
|---|---|---|---|
| `RequestContentApproval` | exact Request revision | مستقل | تأیید محتوا؛ no send |
| `DispatchPlanApproval` | exact recipients + content plan | مستقل | تأیید برنامهٔ محلی؛ no send |
| `ExternalActionAuthorization` | exact external effect | Deferred تا backend | اثر بیرونی پس از reauthorization |

هر approval `purpose/type`, target snapshot/hash/version, actor, project/case, policy/ACL snapshot, `recordStatus`, version و createdAt دارد. `recordStatus` تاریخی است؛ `effectiveValidity` در لحظه از dependency/version/policy/ACL/expiry/revocation مشتق می‌شود. approval محلی هیچ send authority نیست.

DispatchDraft به exact approved request revision + recipient/content snapshot pin می‌شود و در prototype simulation-only است. تغییر dependency آن را invalid می‌کند.

ExternalActionAuthorization آینده idempotent-consumable است.

## ۹. Proposal، Comparison و negotiation-local

Proposal اصل اعلامی را نگه می‌دارد؛ transcription/normalization/evaluation جداست.

Comparison:
- derived object؛
- source proposal revisions pinned؛
- calculation/qualitative method version؛
- fingerprint؛
- no source mutation؛
- ComparisonDecision رکورد مستقل با reason.

Negotiation-local:
- QuestionDraft؛
- ManualResponseTranscript؛
- ResponseJudgment؛
- TermsChangeObservation؛
- ProposalRevisionDiff.
همه private، pinned و historical/no-rebind.

shared amendment/real response/consent تا supplier/backend Deferred است.

## ۱۰. File، Photo و SourceRecord

`File`/`Photo` asset record هستند؛ `SourceRecord` مدرکی است که قابلیت استناد/بازیابی به content یا locator را مدل می‌کند. هر File لزوماً Source قابل‌خواندن برای model نیست تا SourceRecord معتبر ساخته شود.

SourceRecord حداقل:
- source id/type؛
- owner/scope؛
- asset ref؛
- version؛
- provenance؛
- capturedAt/sourceDate؛
- locator/excerpt capability؛
- content hash در صورت وجود؛
- read status؛
- sensitivity؛
- eligibility flags از سند Memory.

Composer local intake باید text/file/photo را به SourceRecord project-scoped وصل کند، بدون ادعای OCR/model.

Snapshot caveat: بعضی file paths فعلی هنوز metadata/Blob semantics متفاوت و تضمین‌های lifecycle نامتوازن دارند؛ Gate باید آن‌ها را inventory و یک‌دست کند.

## ۱۱. Memory، Instruction و shared projection

MemoryRecord private/contextual است؛ schema تفصیلی در سند Memory.

`case_private` scope حافظه برای یادداشت/ترجیحات خصوصی پرونده است.

`Instruction/WorkflowDefinition` executable procedural object است:
- versioned؛
- permissioned؛
- scoped؛
- explicit activate/disable؛
- audit/history.
Memory فقط reference می‌دهد.

`ShareEvent`:
- actor؛
- source object/version؛
- selected fields/snapshot؛
- consent evidence؛
- recipient/ACL؛
- timestamp؛
- purpose؛
- idempotency.
`SharedCaseProjection` فقط از share events معتبر ساخته می‌شود. private Memory مستقیم projection نمی‌شود.

## ۱۲. Monitor و Run

Monitor:
- project scope؛
- reason؛
- trigger/schedule؛
- enabled؛
- lastRun/nextRun؛
- notification condition.

Run:
- origin object/project؛
- state؛
- started/ended؛
- attempt؛
- failure union؛
- result binding؛
- cancellation.
در prototype browser-local بودن باید صریح باشد. late result فقط به origin دقیق attach می‌شود.

## ۱۳. BuiltArtifact

BuiltArtifact با Plugin/Tool/Connector متفاوت است و project-scoped است.

| From | Command | To | Guard | Version effect | Failure |
|---|---|---|---|---|---|
| none | createDraft | draft | create permission/project | v1 | Unauthorized/PersistenceFailure |
| draft | updateDraft | draft | expectedVersion/catalog | +1 | VersionConflict/SchemaInvalid |
| draft | preview | preview_ready | dependencies readable | +1 | DependencyStale |
| preview_ready | activate | active | permission/dependencies | +1 | Unauthorized/DependencyStale |
| active | disable | disabled | permission | +1 | VersionConflict |
| disabled | reactivate | active | full revalidation | +1 | Unauthorized/DependencyStale |
| any non-removed | createRevision | draft | source revision valid | new revision | ReadFailure |
| any non-removed | rollback | draft | historical revision valid | new revision | SchemaInvalid |
| any non-removed | remove | removed(tombstone) | delete+retention | +1 | RetentionBlocked |
| active | permission/dependency invalidation | blocked | derived | +1 | — |
| blocked | reactivate | active | restored + explicit command | +1 | Unauthorized/DependencyStale |

`blocked` داده را حذف نمی‌کند و execution را متوقف می‌کند. remove تابع retention و dependency ownership است.

## ۱۴. permission model

ترتیب:
`trusted identity/scope → resource authorization → action authorization`.

Permission decision ورودی‌های زیر دارد:
- actor/account؛
- AccountSide؛
- MembershipRole/ACL؛
- resource owner/scope؛
- action؛
- sensitivity؛
- current version/status؛
- policy version.

هیچ permission از model output استنتاج نمی‌شود.

## ۱۵. mutation contract

فقط Domain/Application Service مجاز commit است.

هر command:
- actor/action/resource؛
- expectedVersion؛
- idempotencyKey در mutation حساس؛ same key + same canonical payload نتیجهٔ قبلی را برمی‌گرداند؛ same key + different payload fail-close می‌شود؛
- approval snapshot اگر لازم؛
- input schema version.

در commit، service دوباره authorization + approval target + version + idempotency را اتمیک enforce می‌کند. mismatch = fail-close.

## ۱۶. failure modes

حداقل union مفهومی:
- `NotFound`
- `Unauthorized`
- `ScopeMismatch`
- `ReadFailure`
- `SchemaInvalid`
- `VersionConflict`
- `DependencyStale`
- `ApprovalMissingOrStale`
- `IdempotencyPayloadMismatch`
- `QuotaExceeded`
- `PersistenceFailure`
- `UnsupportedTransition`.

UI نباید failure را success/empty نمایش دهد.

## ۱۷. migration، delete و rollback

- schema migration نسخه‌دار و reversible تا حد ممکن؛
- legacy→new فقط با validation؛
- valid empty data نباید legacy را زنده کند؛
- rollback object history را rewrite نمی‌کند؛
- delete سه مفهوم دارد: disable/use-ban، soft delete/tombstone، hard delete؛
- hard-delete production retention `TODO_DECISION`;
- export/delete همه storeهای Gate یا قبل Gate تعریف می‌شوند یا defer صریح ماهیار می‌گیرند.

## ۱۸. evidence مورد انتظار

برای هر Gate object:
- schema parser tests؛
- project isolation tests؛
- read-error vs empty؛
- write-before-state؛
- version/no-op؛
- rollback؛
- stale dependency؛
- migration؛
- failure injection؛
- mobile UX evidence در صورت UI.

## ۱۹. acceptance checklist

- [ ] owner/scope برای همه inventory objects یکتا است.
- [ ] AccountSide و MembershipRole جدا هستند.
- [ ] Project store gaps رفع/ثبت شده‌اند.
- [ ] Approval/Dispatch/Request/Proposal/Comparison/Negotiation contracts پوشش دارند.
- [ ] File/Photo/Source truth تفکیک شده است.
- [ ] Memory/Instruction/shared projection duplication ندارند.
- [ ] mutation فقط Application Service و fail-close است.
- [ ] BuiltArtifact state machine قابل تست است.
- [ ] migration/delete/rollback semantics روشن‌اند.
- [ ] production auth به‌غلط ادعا نشده است.

## ۲۰. unresolved decisions

- `TODO_DECISION`: exceptional AccountSide migration.
- `TODO_DECISION`: production MembershipRole matrix.
- `TODO_DECISION`: hard-delete/audit retention.
- `TODO_DECISION`: Offline draft — منبع T13 — Gate یا defer صریح ماهیار.
- `TODO_DECISION`: Export/Delete — منبع T13 — Gate یا defer صریح ماهیار.
- `TODO_DECISION`: Quota failure — منبع T13 — Gate یا defer صریح ماهیار.
- `TODO_DECISION`: Mock reset — منبع T13 — Gate یا defer صریح ماهیار.
- `TODO_DECISION`: PWA/installability — منبع سند مادر/T13 — Gate یا defer صریح ماهیار.
- `Deferred`: supplier shared-case runtime تا supplier/backend.
