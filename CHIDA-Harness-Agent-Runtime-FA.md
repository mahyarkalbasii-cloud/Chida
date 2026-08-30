---
title: "CHIDA — هارنس عامل و محیط اجرای مدل"
document_type: "Harness & Agent Runtime Specification"
version: "1.0"
status: "Proposed — منتظر تأیید صریح ماهیار"
date: "۲۰۲۶-۰۸-۳۰"
baseline_commit: "8b557020768b22b81b8aadbd28c6a078e26c7ee5"
---

# CHIDA — هارنس عامل و محیط اجرای مدل

## ۱. جایگاه و precedence

این سند مالک orchestration، run state، model/tool routing، approval boundary و failure semantics است. Domain truth و mutation contract از سند Domain می‌آید؛ Memory/Retrieval/ContextManifest از سند Memory.

این سند production implementation یا انتخاب vendor نیست. CHIDA provider-neutral می‌ماند و مدل‌های پایه قابل‌تعویض‌اند.

## ۲. وضعیت تصمیم‌ها

| تصمیم | وضعیت |
|---|---|
| Luna/Terra/Sol routing خودکار | Approved-by-Mahyar |
| Provider-independent Model Gateway | Approved-by-Mahyar |
| human approval برای اقدام بیرونی | Approved-by-Mahyar |
| Harness/Policy مالک ExecutionEnvelope | Proposed |
| ModelGateway فقط مکانیک call در envelope | Proposed |
| Model/Orchestrator مستقیم commit نمی‌کنند | Proposed |
| M1a local text-only | Proposed |
| production backend/queue | Deferred |
| provider production | TODO_DECISION |

## ۳. مسئولیت‌های یکتا

### Harness/Orchestrator
- intent/output-type؛
- trusted scope consumption؛
- policy orchestration؛
- ContextManifest request؛
- model route class؛
- tool/workflow route؛
- run state؛
- validation؛
- approval orchestration؛
- budgets؛
- recovery؛
- audit/eval hooks.

### Policy
- authorization decisions؛
- retrieval/tool/model eligibility؛
- allowed provider/model؛
- data-egress/sensitivity/retention/cache envelope؛
- approval requirements.

### ModelGateway
- provider-neutral adapter interface؛
- provider/model call؛
- timeout/cancel؛
- streaming normalization؛
- response normalization؛
- mechanical failover within envelope؛
- usage/cost telemetry.

### Domain/Application Service
- authoritative mutation؛
- atomic re-authorization؛
- concurrency/idempotency؛
- commit/audit event.

### Tool
- limited typed operation؛
- no hidden permission expansion.

## ۴. ترتیب امن run

1. Trigger.
2. trusted identity/scope resolution.
3. resource/action authorization.
4. Policy ساخت `BaseExecutionEnvelope`.
5. retrieval/tool/model eligibility.
6. ContextManifest که به BaseEnvelopeHash bind است.
7. FinalEnvelope که فقط مساوی یا محدودتر از Base است؛ binding نهایی Manifest/Envelope/payload.
8. model یا read-only computation.
9. اگر action اثرگذار است: فقط proposal/preview.
10. validation.
11. exact approval.
12. Application/Action Service reauthorization + version + idempotency.
13. effect.
14. receipt/reconciliation و result binding.

read-only tool می‌تواند در `running` اجرا شود. effectful tool/action پیش از approval اجرا نمی‌شود. Authorization پیش از retrieval/tool routing است.

## ۵. Run schema مفهومی

- runId
- actor/account
- AccountSide
- MembershipRole/ACL snapshot ref
- project/case origin
- trigger type/id
- intent/output type
- policyVersion
- executionEnvelopeId/hash
- contextManifestId/hash optional
- state
- currentStep
- model/provider route
- tool calls refs
- approval refs
- startedAt/endedAt
- deadline/timeout
- cancellation state
- attempt
- failure
- result refs
- origin binding
- usage/cost refs.

## ۶. Run state machine

دو شاخهٔ canonical:

Read-only:
`created → authorized → ready → running → completed`.

Mutation/effect:
`created → authorized → ready → running → proposal_ready → awaiting_approval → committing/effecting → completed`.

Branches:
`blocked | failed | cancelled | stale_result_discarded | effect_unknown`.

state ناشناخته success نیست.

## ۷. failure union

- IdentityUnavailable
- Unauthorized
- ScopeMismatch
- RetrievalBlocked
- ContextBuildFailed
- ModelUnavailable
- ModelTimeout
- ModelCancelled
- InvalidModelOutput
- ToolUnauthorized
- ToolFailed
- ApprovalRequired
- ApprovalStale
- DependencyStale
- VersionConflict
- CommitRejected
- IdempotencyConflict
- BudgetExceeded
- ResultOriginMismatch
- PersistenceFailure.

هر failure باید effect-so-far را روشن کند.

## ۸. ExecutionEnvelope

Policy پیش از retrieval برای هر run `BaseExecutionEnvelope` می‌سازد:
allowed models/providers، data-egress، sensitivity، retention، cache، tools، background، token/tool/retry/time/cost budgets.

ContextManifest به BaseEnvelopeHash bind می‌شود. پس از Manifest، FinalEnvelope فقط می‌تواند مساوی یا محدودتر از Base باشد.

`FinalExecutionBindingHash = hash(run + policy + BaseEnvelopeHash + manifestHash + FinalEnvelopeHash + exactModelPayloadHash)`.

ModelGateway و هر failover باید این binding را enforce کنند و حق گسترش envelope ندارند.

## ۹. Model routing

اصل automatic model routing و وجود مسیرهای `Luna/Terra/Sol` در baseline Approved-by-Mahyar است.

اما mapping زیر فقط **Proposed heuristic** است:
- Luna: extraction/classification/clear bulk؛
- Terra: daily operational reasoning؛
- Sol: complex/high-risk/high-value.

thresholds، escalation rules و risk classes = `TODO_DECISION` پس از eval/cost evidence. Route policy متعلق به Harness/Policy است؛ ModelGateway فقط mapping مجاز به adapter را اجرا می‌کند.

## ۱۰. ModelGateway contract

Input:
- run id؛
- envelope؛
- model route request؛
- normalized messages/context payload؛
- timeout/cancel token؛
- telemetry tags.

Output:
- normalized text/structured result؛
- provider/model exact id؛
- usage؛
- latency؛
- finish/failure reason؛
- cache metadata اگر مجاز.

Failover:
- فقط provider/modelهای مجاز envelope؛
- capability equivalence لازم؛
- هیچ silent downgrade خارج policy؛
- provider failure نباید data-egress ceiling را بشکند.

## ۱۱. cache

Policy permission cache را تعیین می‌کند؛ Gateway فقط mechanism است.

اگر بعداً فعال شود partition شامل actor/access-equivalence، AccountSide، ACL snapshot، project، case، sensitivity، policy، model/provider، manifestHash و payloadHash است. membership revocation، disable، eligibility change، supersession، delete و permission change invalidate می‌کنند.

**M1a و M1b هر دو cache-off هستند.**

## ۱۲. ContextManifest integration

Harness raw DB dump نمی‌گیرد. Memory/Context service یک manifest policy-filtered می‌دهد.

Harness باید:
- manifest actor/project/run binding را verify کند؛
- hash و budget را verify کند؛
- فقط payloadهای manifest را به model بدهد؛
- manifest را پس از routing بی‌اجازه گسترش ندهد.

## ۱۳. Tool registry

هر RuntimeTool:
- tool id/version؛
- input/output schema؛
- allowed AccountSide/scope؛
- required action permissions؛
- sensitivity/egress class؛
- deterministic/non-deterministic؛
- side-effect class؛
- idempotency requirement؛
- approval requirement؛
- timeout/retry policy.

Model فقط tool proposal می‌دهد؛ Harness/Policy authorization می‌کند.

## ۱۴. approval

کلاس‌ها:
- internal read/draft: بدون approval جدا در محدوده مجاز؛
- reversible internal mutation: policy-dependent؛
- important mutation: preview/approval؛
- external effect/share: explicit human approval؛
- خارج محصول: reject.

Effectful action ابتدا proposal/preview می‌سازد؛ قبل از approval اجرا نمی‌شود.

Approval اثرگذار به actor/account، AccountSide، ACL snapshot، project/case، policyVersion، exact action/destination/payloadHash، expiry، revocation و idempotency consumption bind است. Application/Action Service هنگام effect دوباره authorization/approval/version/idempotency را enforce می‌کند.

## ۱۵. commit boundary

مدل یا orchestrator مستقیم store نمی‌نویسد.

`Model/Tool Proposal → schema/domain validation → policy/approval → Application Service command`.

Command شامل actor/action/resource/expectedVersion/idempotency/approvalRef است. service اتمیک re-check می‌کند.

## ۱۶. late response و cancellation

هر response به attemptId، gatewayRequestId، runId، actor/account، AccountSide، ACL snapshot hash، project/case، policyVersion، BaseEnvelopeHash، FinalEnvelopeHash و manifestHash bind است.

cross-run/project، superseded-attempt، cancelled run، policy-changed یا ACL-changed result به current state attach نمی‌شود و mutation ایجاد نمی‌کند؛ `stale_result_discarded` یا historical safe result می‌شود.

## ۱۷. background work

Production durable background runtime Deferred است. Prototype Monitor browser-local است و باید همین را بگوید.

آینده:
- durable queue؛
- retry/DLQ؛
- idempotency؛
- cancel؛
- heartbeat/lease؛
- result binding.

هیچ‌کدام شرط M1a نیست.

## ۱۸. M1a contract

هدف فقط provider-neutral local text path است.

**پیش‌شرط:** Builder Gate PASS + تأیید اجرایی جداگانهٔ ماهیار.

مسیر:
`UI → Harness boundary → ModelGateway → LocalAdapter → loopback local model → ModelGateway → origin-bound plain text`.

PASS:
- LocalAdapter در hosted Cloudflare/Sites compile/runtime disabled؛
- opt-in؛ فقط همان پیام جاری، no chat history؛
- text-only؛
- endpoint literal ثابت loopback؛ LAN IP/hostname بیرونی/configurable URL رد؛
- label «مدل محلی آزمایشی · بدون منبع»؛
- hosted providers off و cloud fallback صفر؛
- LocalAdapter فقط از ModelGateway؛
- timeout/cancel/fail-close؛
- safe plain-text rendering؛
- cache off؛ persistent prompt/response logging off؛
- no Memory/File/Source/Web/Tool/mutation/background/supplier/shared data؛
- late response binding کامل.

Negative tests: hosted enable impossible، configurable URL rejected، LAN rejected، history absent، cloud provider call count zero، timeout/cancel no fallback، cross-run/project، superseded-attempt، cancelled، policy/ACL-changed stale response discarded.

Local بودن M1a انتخاب production provider نیست.

## ۱۹. M1b contract

پس از M1a:
- ContextManifest فقط Memory vertical slice؛
- direct remember Project A؛
- automatic retrieval hard filter؛
- model eligibility؛
- no tools/web/files؛
- disable/delete/conflict؛
- Project B isolation؛
- provider/model swap invariance.

## ۲۰. M1a failure behavior

- local adapter unavailable → visible failure، no cloud fallback؛
- timeout → cancel/failed، no retry to hosted؛
- malformed output → safe text rejection/failure؛
- origin mismatch → discard؛
- accidental tool request → ignored/rejected؛
- policy envelope violation → blocked قبل call.

## ۲۰.۱. effect state و retry safety

`effectState = none | possible | confirmed`.

- `none`: retry طبق policy ممکن.
- `confirmed`: receipt id/time/target/actionHash ثبت؛ replay idempotent همان receipt.
- `possible`: effect نامعلوم؛ auto-retry ممنوع و reconciliation لازم.

unknown effect هرگز به success یا retry خودکار تبدیل نمی‌شود.

## ۲۱. observability و audit

Prototype/M1a:
- persistent prompt/response log retention ممنوع؛
- test telemetry می‌تواند non-content metadata transient داشته باشد.

Production آینده:
- run state؛
- model/provider؛
- usage/CU/actual cost؛
- tool/approval refs؛
- failures؛
- ContextManifest hash.
raw sensitive content retention policy `TODO_DECISION`.

## ۲۲. Usage/CU boundary

Usage Ledger و Actual Cost Ledger از economics baseline می‌آیند. Harness budget را enforce می‌کند؛ ModelGateway usage را گزارش می‌دهد. retry داخلی provider می‌تواند Actual Cost را افزایش دهد، ولی user Usage charging policy جداست.

## ۲۳. prompt injection / untrusted content

File/Web/third-party message آینده data است، نه instruction. Instruction precedence فقط trusted system/product/user-authorized Instructionهاست. Tool authorization هیچ‌گاه از متن retrieved content نمی‌آید.

M1a چون file/web ندارد، این surface عمداً صفر است.

## ۲۴. BuiltArtifact relationship

BuiltArtifact runtime tool نیست. Artifact declarative UI/data view است. اگر command/action داشته باشد فقط actionهای catalog و policy-authorized را reference می‌دهد. plugin generation/connector/code execution خارج Builder Gate است.

## ۲۵. rollback و migration

Harness run history append-only logical events؛ rollback domain از Domain Service. ModelGateway adapter version changes باید backward-compatible contract یا migration plan داشته باشند. provider switch نباید Memory/Domain truth را migrate کند.

## ۲۶. acceptance evidence

- authorization-before-retrieval test؛
- envelope enforcement؛
- forbidden provider no-call؛
- no cloud fallback M1a؛
- timeout/cancel؛
- late response binding؛
- safe rendering؛
- no cache/log retention؛
- no tool/mutation side effect؛
- Application Service re-auth commit tests در فاز mutation؛
- ContextManifest binding M1b؛
- cost/usage telemetry separation.

## ۲۷. acceptance checklist

- [ ] Harness/Policy و ModelGateway ownership overlap ندارند.
- [ ] authorization قبل retrieval/tool routing است.
- [ ] commit boundary روشن است.
- [ ] Model/Orchestrator مستقیم mutate نمی‌کنند.
- [ ] ExecutionEnvelope provider/cache/egress را محدود می‌کند.
- [ ] cache partition/retention rules روشن‌اند.
- [ ] M1a PASS کاملاً دودویی است.
- [ ] late response safety تعریف شده.
- [ ] failure union effect-aware است.
- [ ] product boundary تجاری حفظ شده.

## ۲۸. unresolved decisions

- `TODO_DECISION`: exact Luna/Terra/Sol routing thresholds.
- `TODO_DECISION`: production provider set/failover equivalence.
- `TODO_DECISION`: production audit raw-content retention.
- `TODO_DECISION`: production queue technology.
- `Deferred`: tool/web/file runtime بعد از M1b و gate مربوط.
- `Deferred`: supplier/shared action runtime.
