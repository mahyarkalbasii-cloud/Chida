# هنداف ادامهٔ پروژهٔ CHIDA

**تاریخ آخرین به‌روزرسانی:** ۱۴۰۵/۰۶/۱۱ — ۲۰۲۶/۰۹/۰۲
**مسیر پروژه:** `/Users/mahyarkl/Desktop/ChatGPT/CHIDA`
**نقطهٔ ادامه:** baseline یکپارچه تا `BG-F5` با SHA دقیق `93c41a8f728ff973a3ca9db29581b1e4968fe52b` روی local/GitHub `main`، Cloudflare Pages و ChatGPT Sites same-source منتشر و راستی‌آزمایی شد. پس از این رسید، طبق همان مجوز کاربر فقط `BG-F6 — Proposal Authority & Concurrency Foundation` در checkout اصلی به‌صورت محلی و تست‌محور ساخته شد. نخستین گیت انتشار BG-F6 پس از build/integrity/TypeScript با ۶ شکست Playwright از ۴۶۳ متوقف شد و receipt نداشت: یک محدودیت نادرست ۱۶۰رقمی در Proposal v2 و پنج oracle قدیمیِ v1. حد canonical با قرارداد ۲۰۰رقمی T7 هم‌تراز و همهٔ oracleهای غیرمهاجرتی به raw v2 وصل شدند؛ reproduction برابر ۶/۶ و بستهٔ عمیق T7/T8/BG-F6 برابر ۹۱/۹۱ پاس است. ماهیار انتشار exact candidate اصلاح‌شده و سپس ساخت گفت‌وگوی تازه در همان پروژه/checkout با هنداف کامل را صریحاً مجاز کرده است؛ تا گیت تازه و رسید terminal، BG-F6 همچنان uncommitted/unpublished است. Builder Gate تاریخی همچنان `FAIL` و rerun نشده است؛ مدل، backend، شبکه/ارسال، `case_private` و حساب/مسیر تأمین‌کننده مجاز نشده‌اند.

## مأموریت گفت‌وگوی بعدی

**نقطهٔ توقف جاری:** baseline تا BG-F5 بسته و منتشرشده است و candidate اصلاح‌شدهٔ BG-F6 نیز از نظر پیاده‌سازی/اعتبارسنجی بسته است. فایل domain تازهٔ `prototype/src/builderProposals.ts` authority دقیق v2، migration/cutover، dependency binding، command/receipt، concurrency، readback/rollback و compatibility lineage را مالک است؛ `Prototype.tsx` فقط adapter وابستگی، state و editor را نگه می‌دارد. receipt exact `commandPins` تلاش را ماندگار می‌کند تا parser payload را بدون تکیه بر dependency mutable بازپخش کند. editor نیز `proposalId/idempotencyKey/normalizedPayloadHash/pins` را برای یک save attempt نگه می‌دارد؛ reconciliationِ stale فقط retry بدون‌تغییرِ بازیابی receipt را مجاز می‌کند و حق rebind یا mutation تازه ندارد. گیت ناموفق قبلی receipt نیست و bytes پس از آن تغییر کرده‌اند؛ اقدام مجاز جاری فقط freeze تازهٔ اسناد و candidate، اجرای یک `gate:release` تازه، commit/publish guard، انتشار یک SHA در سه مقصد و سپس ساخت گفت‌وگوی تازه در همین پروژه با `environment: local` و هنداف کامل است. کار باز معماری سازنده شامل authority Comparison/Negotiation، File/Photo، `case_private` و پنج تصمیم Gate-or-defer است، اما هیچ برش بعدی انتخاب یا مجاز نشده؛ rerun Builder Gate، مدل، backend، شبکه/ارسال و supplier path نیز مجاز نیستند.

**سابقهٔ blocker انتشار BG-F5؛ بسته‌شده:** نخستین اجرای گیت در مرحلهٔ Playwright با ۴۰۹/۴۱۰ متوقف شد؛ build/TypeScript/runtime integrity پاس بود، اما تست مسیر ساخت درخواست در انتقال focus از BottomSheet به heading جزئیات شکست خورد. بازتولید نشان داد one-shot `requestAnimationFrame` پیش از attach شدن ref مصرف می‌شد. focus ذخیره به intent موقت و passive effect پس از commit/editor-close منتقل شد؛ همان مسیر ۱۰/۱۰ و چهار regression مجاور ۴/۴ پاس شدند. اجرای ۴۰۹/۴۱۰ receipt انتشار نبود؛ گیت کامل تازه روی candidate نهایی ۴۱۰/۴۱۰ و Sites برابر ۴/۴ پاس شد و همان bytes با SHA `93c41a8f728ff973a3ca9db29581b1e4968fe52b` در هر سه مقصد منتشر شدند.

**blocker گیت انتشار BG-F6؛ بستهٔ محلی، در انتظار گیت تازه:** نخستین گیت BG-F6 با ۶ شکست از ۴۶۳ متوقف شد. Proposal v2 یک مقدار مرزی معتبر را به‌علت سقف ۱۶۰نویسه‌ای رد می‌کرد و پنج مسیر قدیمی T7/T8 هنوز v1 را به‌شکل آرایه می‌خواندند؛ چند byte oracle دیگر نیز به‌جای authority واقعی null-to-null بودند. حد مشترک canonical به ۲۰۰ هم‌تراز شد و همهٔ oracleهای غیرمهاجرتی Proposal به v2 منتقل شدند. شش failure برابر ۶/۶ و بستهٔ عمیق برابر ۹۱/۹۱ پاس شد؛ گیت قبلی receipt نیست و انتشار فقط پس از گیت کامل تازه مجاز است.

ترتیب مشترک Sol و Codex پس از تأیید بسته:

1. بستهٔ چهار سند Architecture Review، Domain/Ownership/Permissions، Memory/Context/Retrieval و Harness/Runtime ساخته، نقد و در repo ثبت شده است.
2. ماهیار بسته را صریحاً تأیید کرد؛ رسید تأیید بدون تغییر بایتی چهار Source در دفتر یادگیری و هنداف ثبت شد.
3. تأیید اسناد implementation را خودکار آغاز نمی‌کند.
4. ماهیار با پیام اجرایی جداگانه برش اول Project Backbone را مجاز کرد؛ پس از بازخوردهای خرید و RTL و پاس‌شدن gateها، انتشار همین snapshot را نیز صریحاً مجاز کرد.
5. برش دوم Memory Core و برش‌های SI-1/TM-1 ساخته و منتشر شده‌اند. `REL-1/BL-1` در working tree محلی ساخته، آزموده و QA شدند؛ ماهیار با درخواست شروع تسک بعدی تجربهٔ BL-1 و عبور به Gate را تأیید کرد، نه انتشار را.
6. `BG-GATE-1` inventory و acceptance matrix را بست و نتیجهٔ Builder Prototype Architecture Gate را `FAIL` ثبت کرد. ماهیار سپس BG-F1 را صریحاً مجاز کرد و آن remediation در checkout اصلی ساخته و آزموده شد؛ این به‌تنهایی rerun یا PASS کل Gate نیست.
7. ماهیار با پیام «شروع کن» فقط `BG-F2 — Manual Task Concurrency Foundation` را مجاز کرد؛ candidate محلی ساخته و آزموده شد.
8. ماهیار سپس تکمیل قابل‌دیدن منو، Settings و Build را پیش از ادامهٔ backlog اولویت داد. `BUX-1` با «بزن بریم»، `BUX-2` با «خوبه بریم بعدی» و `BUX-3` با «بریم تسک بعدی» از نقطهٔ مشاهده عبور کردند.
9. همان پیام آخر فقط BG-F3 را مجاز کرد؛ candidate آن با ۱۷/۱۷ regression اختصاصی، ۴۱/۴۱ مسیر Request/Approval، ۱۸/۱۸ سازگاری service/T6-C/T6-D، build/runtime/diff، QA موبایل و بازبینی مستقل بدون finding باز آمادهٔ مشاهده شد.
10. ماهیار سپس با پیام «همه جا منتشر کن» انتشار exact candidate ترکیبی جاری را مجاز کرد. قرارداد اجباری آن یک `gate:release` روی candidate منجمد، commit همان bytes، `gate:publish`، یک push و استفاده از همان SHA برای GitHub، Cloudflare Pages و ChatGPT Sites است؛ شناسه‌های terminal فقط در پیام تحویل ثبت می‌شوند.
11. baseline local/GitHub پس از آن روی `69aaddfb867ec98a5d0ff2f06e367577392c0fc6` هم‌تراز شد. ماهیار در پیام تازه فقط BG-F4 را مجاز کرد؛ candidate محلی آن Approval v2، migration/cutover، compound intent و orphan rollback اثبات‌پذیر را بست و gate کامل فنی آن پاس شد.
12. ماهیار پس از تحویل BG-F4 دوباره با پیام «تسک بعدی رو شروع کن» نقطهٔ مشاهدهٔ آن را عبور داد و فقط BG-F5 را مجاز کرد. سه store v2، checkpoint علّی Request/Approval و intent/receipt دوطرفهٔ Draft+Plan اکنون محلی پیاده‌سازی شده‌اند؛ regressionهای ۳۷/۳۷ و ۳۵/۳۵، build و QA موبایل پاس‌اند، review مستقل P0/P1 باز ندارد و فقط `gate:release` یک‌بارهٔ پس از freeze باقی مانده است.
13. ماهیار با پیام «اره اول همه چیزو تا اینجا منتشر کن بعدش شروع کن» انتشار exact candidate تا BG-F5 و سپس آغاز مشروط BG-F6 را مجاز کرد. هیچ byte مربوط به BG-F6 پیش از رسید terminal سه مقصد وارد این release نمی‌شود.
14. نخستین release-gate این candidate با ۴۰۹/۴۱۰ روی race واقعی focus پس از ذخیرهٔ Request متوقف شد و receipt نداشت. race با focus پس از commit بسته و با ۱۰/۱۰ تکرار همان مسیر و ۴/۴ مجاور پاس شد.
15. گیت کامل تازه روی candidate منجمد با Playwright برابر ۴۱۰/۴۱۰ و Sites برابر ۴/۴ پاس شد؛ همان bytes با SHA `93c41a8f728ff973a3ca9db29581b1e4968fe52b` روی local/GitHub `main`، Cloudflare Pages و ChatGPT Sites same-source منتشر شدند.
16. پس از receipt سه مقصد، فقط BG-F6 در checkout اصلی به‌صورت محلی و تست‌محور آغاز و با suite نهایی ۵۳/۵۳، downstream نماینده ۹/۹، build/runtime، QA موبایل و review مستقل تکمیل شد.
17. نخستین گیت انتشار BG-F6 با ۶ شکست از ۴۶۳ receipt نساخت؛ یک regression عددی production و oracleهای قدیمی v1 اصلاح شدند و reproduction برابر ۶/۶ و بستهٔ عمیق برابر ۹۱/۹۱ پاس شد. candidate اصلاح‌شده هنوز uncommitted/unpublished و نیازمند گیت تازه است.
18. M1a فقط پس از PASS همان gate معماری و با پیام جدا، به‌صورت adapter محلی، opt-in، provider-neutral و text-only آزموده می‌شود؛ M1b برای `ContextManifest`/Memory فقط بعد از پذیرش M1a می‌آید.
19. مسیر تأمین‌کننده، shared case واقعی، backend و شبکهٔ واقعی همچنان به gate و تأییدهای جدا نیاز دارند.

هر بار فقط یک تسک کوچک ساخته می‌شود. baseline تا BG-F5 منتشر و بسته شده و تسک جاری فقط `BG-F6 — Proposal Authority & Concurrency Foundation` است. پایان محلی BG-F6 و blocker نخستین گیت با reproduction ۶/۶ و بستهٔ عمیق ۹۱/۹۱ بسته شده‌اند؛ ماهیار انتشار exact candidate اصلاح‌شده و ساخت continuation پس از آن را صریحاً مجاز کرده است. این مجوز PASS معماری یا عبور به remediation بعدی، مدل/backend/network/send/supplier path نیست.

تعریف کاری پیشنهادی برای «تکمیل سمت سازنده» دیگر completion مبهم کل T13 نیست؛ یک acceptance matrix دودویی برای ownership/scope، isolation، schema/state/version، failure/rollback، memory control، Source/Composer intake محلی، Task/Monitor، lifecycle حداقلی `BuiltArtifact`، پذیرش UI و شواهد آزمون است. backend production، شبکهٔ واقعی، طرف دوم واقعی، marketplace، Connector، اجرای کد آزاد، مالی سبک و desktop نهایی شرط این gate نیستند.

## وضعیت منتشرشدهٔ برش ۱ — Project Backbone

- مسیر کاربر «برنامه پروژه» است: Quick Action واقعی در خانه، ورودی «برنامه و تصمیم‌ها» در فضای پروژه و کارت Task متصل در مرکز کارها.
- store تازه `chida-prototype-project-backbone:v1` یک envelope اتمیک با سه Domain Object مستقل Milestone، Decision و Task است. هر سه project-scoped و دارای owner/scope، version، revision snapshot، fingerprint و history هستند؛ لینک Decision↔Task↔Milestone دقیق و در parser اعتبارسنجی می‌شود.
- Decision بدون reason مرئی ثبت نمی‌شود. absent store با empty فرق دارد؛ malformed/schema-invalid/cross-project/orphan state read-error است و mutation را fail-close قفل می‌کند.
- create/update/rollback زیر Web Lock سراسری همان origin اجرا می‌شوند؛ مسیر کامل read → expectedVersion/graph validation → write سریال است و نبود Web Locks بدون fallback ناامن fail-close می‌شود. stale editor overwrite نمی‌کند، no-op بایت و نسخه را ثابت نگه می‌دارد، timestamp با ساعت عقب‌رفته عقب نمی‌رود و rollback محتوای نسخهٔ قدیمی را به‌عنوان revision تازه ثبت می‌کند.
- فرم اولیهٔ این برش عمداً دادهٔ حداقلی می‌گرفت؛ TM-1 اکنون `dueAt` اختیاری Task را با ورودی زمان تهران و ذخیرهٔ canonical UTC اضافه کرده است. transitionهای کامل status هنوز deferred هستند. بدهی reader/write مخزن قدیمی BuilderProject نیز با این store تازه حل‌شده ادعا نمی‌شود.
- پس از مشاهدهٔ ماهیار، یک نقص presentation در فرم create/edit پیدا شد: BottomSheet به‌علت portal شدن بیرون `.chida-app` مقدار `direction=ltr` می‌گرفت. اصلاح محدود، زمینهٔ RTL مستقل sheet و تراز راست پنج ورودی فارسی را اضافه کرد؛ regression اختصاصی ابتدا شکست را اثبات و سپس در create/edit با ۱/۱ پاس کرد. بازبینی مستقل finding باز P0/P1/P2 نداشت. پس از اعلام پایان و شواهد آزمون، ماهیار انتشار همین snapshot را صریحاً مجاز کرد؛ این مجوز به Memory Core یا برش بعدی گسترش ندارد.
- یازده regression متمرکز Project Backbone برابر ۱۱/۱۱ پاس شده‌اند؛ ساخت/لینک/reload و نبود duplication، RTL واقعی create/edit، reason مرئی و دسترس‌پذیری، جداسازی پروژه، no-op/edit/rollback، ساعت عقب‌رفته، stale conflict، رقابت واقعی دو تب، نبود Web Locks، write failure، JSON خراب و semantic tamper شامل fingerprint، تاریخ ناممکن و cross-project link را پوشش می‌دهند.
- `npm run test:app` برابر ۱۷۸/۱۷۸، `npm run test:runtime` برابر ۱۸۶/۱۸۶، `npm run test:sites` برابر ۴/۴، build/TypeScript و integrity هر ۲۸ فایل پاس شدند. QA دیداری پیشین مرورگر داخلی در `390 × 844` حالت خالی، sheet سه‌بخشی، ثبت، ویرایش، تاریخچه/rollback و کارت Task را تأیید کرد؛ `document/body scrollWidth = 390`، عنصر افقی بیرون‌زده صفر و console error/warning صفر بود. بازخورد RTL فعلی با computed style واقعی در همان viewport برای header، توضیح، section copy، labelها و هر پنج فیلد create/edit آزموده شد.
- بازبینی مستقل نهایی diff پس از اصلاح Web Locks، تاریخ تقویمی exact، نویسه‌های نامرئی و دسترس‌پذیری، finding باز P0/P1/P2 گزارش نکرد.
- این snapshot با commit قابلیت `6d71e42a89441b3499a4fe335e7bc5874feb6e36` و commit منبع/اسناد `bcb22465c0f6e1f04252c40a65f6249a5084ff6b` منتشر شد. GitHub، Cloudflare Pages و ChatGPT Sites نسخهٔ ۲۷ موفق‌اند و جزئیات کامل در رسید انتهای هنداف آمده است؛ این انتشار برش دوم را مجاز نمی‌کند.

## نتیجهٔ مشترک Sol و Codex؛ تأییدشده توسط ماهیار

- invariant معماری نقش به‌صورت `AccountSide = builder | supplier` تعریف می‌شود؛ هر حساب فقط یک سمت تغییرناپذیر دارد و role switch عادی ندارد. `MembershipRole` فقط نقش دسترسی داخل فضای همان سمت است.
- تک‌نقشی‌بودن تعارض منافع و سطح سوءاستفاده را کاهش می‌دهد، اما ضدتقلب کامل نیست؛ multi-account و related identity در سند آیندهٔ Identity & Abuse تصمیم‌گیری می‌شوند.
- `AccountSide` از Identity/Policy معتبر می‌آید و Harness یا مدل حق استنباط یا override آن را ندارند.
- بخش‌های local/manual فعلی T8 حفظ می‌شوند؛ پاسخ واقعی و احرازشدهٔ طرف دوم، رضایت، amendment مشترک، `case_shared` واقعی و بستن دوطرفه تا فاز supplier/shared case defer می‌شوند. موعد/follow-up به Task/Monitor منتقل و محاسبهٔ عددی اثر تا قرارداد دامنه و فرمول معتبر عقب می‌افتد.
- Domain Object منبع حقیقت است. `MemoryCandidate` از `MemoryRecord` جداست، procedural rule اجرایی یک `Instruction/WorkflowDefinition` نسخه‌دار است و `case_shared` حافظه نیست؛ shared domain projection/share event صریح، نسخه‌دار، permissioned و audited است.
- مشاهده، جست‌وجوی دستی، retrieval خودکار، model eligibility و shareability کنترل‌های مستقل‌اند؛ `useInContext` به‌تنهایی مجوز ورود به مدل یا اشتراک نیست.
- Harness انتخاب context/workflow/tool را هماهنگ می‌کند؛ ModelGateway فقط provider call، caching، timeout، usage/cost و normalization را مدیریت می‌کند. مدل و orchestrator خروجی مدل را مستقیم commit نمی‌کنند و فقط Domain/Application Service مجاز با concurrency/idempotency می‌نویسد.
- Build در gate سازنده فقط lifecycle یک `BuiltArtifact` امن، declarative و project-scoped از catalog بسته است؛ `Capability/Plugin`، runtime `Tool` و `Connector` مفاهیم جدا هستند.
- بستهٔ چهار سند در repo و Sources پروژهٔ ChatGPT از نظر محتوایی همسان و اکنون صریحاً مورد تأیید ماهیار است. سند مادر تا بازنگری صریح همچنان تنها مرجع تعریف محصول می‌ماند؛ تعارض `AccountSide` باید شفاف ثبت و بعداً در سند مادر supersede شود.

## شروع اجباری در گفت‌وگوی جدید

پیش از هر تغییر:

1. `AGENTS.md` و `prototype/AGENTS.md` را کامل بخوان.
2. منبع حقیقت را فقط `CHIDA-Product-Definition-FA.md` بدان؛ `BUILDER-FEATURE-BACKLOG-FA.md` فقط ترتیب اجرایی و این فایل فقط هنداف است.
3. `CHIDA-PRODUCT-LEARNINGS-FA.md` را، به‌ویژه C-007 تا C-010، T7/T8، T8-UX1/T8-UX2/T8-UX3، H1، H2، MC-1، SI-1، TM-1، REL-1، BL-1، BG-GATE-1، BG-F1، BG-F2، BUX-1، BUX-2، BUX-3، BG-F3، BG-F4، BG-F5، receipt انتشار baseline و BG-F6 بخوان. سپس `CHIDA-BUILDER-PROTOTYPE-ARCHITECTURE-GATE-FA.md` را کامل بخوان. تصمیم سه‌ورودی C-009 تاریخی و منسوخ است؛ قرارداد جاری افزودن پروژه C-010 است و قاعدهٔ Quick Action grid در C-010 با تصمیم صریح T8-UX3 منسوخ شده است.
4. `CHIDA-SOL-HANDOFF-FA.md`، بخش تاریخی MC-1، بخش‌های جاری SI-1/TM-1 و بخش‌های REL-1/BL-1/BG-GATE-1/BG-F1 تا BG-F6 همین هنداف را کامل بخوان و سپس `git status --short --branch`، `git diff --check`، `git log -1` و هم‌ترازی `origin/main` را فقط read-only تطبیق بده. baseline زندهٔ پیش از انتشار BG-F6 روی local/GitHub `main` برابر `93c41a8f728ff973a3ca9db29581b1e4968fe52b` است؛ terminal handoff گفت‌وگوی تازه SHA و رسید منتشرشدهٔ BG-F6 را supersede می‌کند.
5. Project Backbone منتشرشده را همراه `PB-1`، Memory Core را همراه `MC-1` و snapshot ترکیبی SI-1/TM-1 را همراه بخش‌های همنام دفتر یادگیری بررسی کن. هیچ تغییر محلی را stash، reset، discard یا بدون تعیین منشأ پاک نکن.
6. MC-1، SI-1/TM-1 و baseline یکپارچه تا BG-F5 منتشرند؛ local/GitHub `main` هنگام freeze روی `93c41a8f728ff973a3ca9db29581b1e4968fe52b` هم‌تراز است و receipt terminal همان SHA برای Cloudflare/Sites ثبت شده است. BG-F6 از نظر محلی کامل و انتشار exact آن مجاز است؛ تا receipt terminal آن را منتشرشده ننام و پس از انتشار فقط رسید گفت‌وگوی تازه را مبنای SHA/مقصدها قرار بده.
7. قرارداد Fast Publish را حفظ کن: `gate:release` یک بار روی candidate نهایی، سپس فقط پس از مجوز انتشار commit همان bytes، `gate:publish`، یک push و یک release same-source؛ receipt terminal فقط در پیام تحویل.
8. دسترسی owner-only Sites را حفظ کن. release gate baseline را با rerun ماتریس Builder Gate یکی ندان؛ Gate تاریخی `FAIL` و rerun نشده است. مدل، backend و مسیر تأمین‌کننده را بدون پیام تازه آغاز نکن.
9. تسک جاری `BG-F6 — Proposal Authority & Concurrency Foundation` است؛ دامنه فقط Proposal root و سازگاری lineage پایین‌دستی است. پیاده‌سازی/اعتبارسنجی و مجوز انتشار exact آن کامل‌اند؛ اقدام جاری فقط gate یک‌باره، commit/publish/deploy همان bytes و ساخت continuation است. rerun Builder Gate، remediation بعدی یا هر عبور به مدل/backend/network/send/supplier path نیازمند پیام صریح جداست.

## سلسله‌مراتب تصمیم

- مرجع محصول: `CHIDA-Product-Definition-FA.md`.
- دفتر تجربه و شکاف: `CHIDA-PRODUCT-LEARNINGS-FA.md`؛ مرجع محصول نیست.
- ترتیب اجرایی سازنده: `BUILDER-FEATURE-BACKLOG-FA.md` و این هنداف.
- تصمیم صریح تازهٔ ماهیار بر تصمیم کاری قدیمی مقدم است؛ تعارض با سند مادر باید ثبت شود، نه اینکه سند مادر بی‌صدا تغییر کند.

## وضعیت Git و انتشار در آخرین ممیزی T7-B1/T7-B2/T8-A1/T8-A2/T8-A3/T8-A4/T8-A5a/T8-A5b/T8-UX1/T8-UX2/T8-UX3

وضعیت انتشار T7-B1، T7-B2، T8-A1 و T8-A2 در ۱۴۰۵/۰۶/۰۷ — ۲۰۲۶/۰۸/۲۹:

- پیش از شروع، `HEAD`، `main` و `origin/main` روی `57bbf6560e40a7b2ef9bb0a369af253c1b063d82` و working tree تمیز بودند. snapshot آزمودهٔ T7-B1 با commit کد `59405e2b2ffc501aef8287ae6139972b1a142963` روی `main` و GitHub منتشر شد.
- Cloudflare Pages deployment تولید `23abfa5d-d88c-4405-becc-742509ce1ced` با trigger برابر `github:push`، شاخهٔ `main`، `commit_dirty=false` و source commit همین SHA به وضعیت `success` رسید. canonical `https://chida-prototype.pages.dev` و immutable `https://23abfa5d.chida-prototype.pages.dev` با build محلی hash یکسان داشتند: HTML برابر `f946d6231fde96219277c83888113d8251287dbef03000fa885c7b35ae32c890`، JavaScript برابر `64f52f2032eae8783109cc9fa5c08d3cd500e549e28080f62cddde09064987d8` و CSS برابر `83c9bbc44b7f4e2de6aea67986afb2e955c684c6859e03a170a170f3c14ab2e3`.
- ChatGPT Sites نسخهٔ ۱۰ با ۱۸ فایل، source commit همین SHA و archive hash برابر `sha256:b1d683bb5d8f2d1a84eb43ddd5f4b70471deecc5f5d23cf93ebc792cefe7a327` ذخیره شد؛ version ID برابر `appgprj_6a90313e390c81918572fc1b45269dac~appgver_8cb2973796a88191ad66b7fa6894e975` و deployment خصوصی `appgdep_6a926918d91c81919d2ca7f2b012de8b` با وضعیت `succeeded` روی `https://chida-prototype.mahyarkl.chatgpt.site` قرار گرفت. دسترسی owner-only/custom با یک مالک، بدون گروه و بدون مهمان بیرونی حفظ شد.
- commit مستندی receipt نهایی، SHA `92dcc14b911ff7840c3816ce5345c472604bff98` است و همان source روی GitHub `main`، Cloudflare Pages deployment `c5c067b2-a623-4476-a024-6f6c81be8c4a` با وضعیت `success` و ChatGPT Sites نسخهٔ ۱۱ با version ID برابر `appgprj_6a90313e390c81918572fc1b45269dac~appgver_791562f862008191889941b682ef13b5` منتشر شد. deployment خصوصی Sites برابر `appgdep_6a926a6591608191995a04aaeab7da6` در وضعیت `succeeded` است. receiptهای قبلی برای تاریخچه حفظ شده‌اند.
- این انتشار فقط T7-B1 را می‌بندد. ماهیار بعداً T7-B2 را در پیش‌نمایش محلی مشاهده و تأیید کرد و برای commit، push و deploy همه‌جا مجوز صریح تازه داد.
- commit کد T7-B2 برابر `0d633e0dbf3d9291d6bba963f64855143b5cf1ef` روی local/GitHub `main` هم‌تراز شد. Cloudflare Pages deployment `20cfc7ac-0984-4102-a394-6d2605eb7158` با trigger برابر `github:push`، شاخهٔ `main`، `commit_dirty=false` و همین SHA به وضعیت `success` رسید؛ canonical و immutable با build محلی hash یکسان داشتند: HTML برابر `5fa8b8a4ad0ce83907303ca74c086115117208ee20b62bdcf94991815a23a2cd`، JavaScript برابر `80dc42150e9e44b4d4eb46924f2458c2b959065c414f674ddc71ab81aa768093` و CSS برابر `01be34119cc0b87cb2f85c0af2942f0f0d9a7e87ddae1ca8c64ebaf730badfee`.
- ChatGPT Sites نسخهٔ ۱۲ با ۱۸ فایل، source commit همین SHA و archive hash `sha256:86daac1e62c11b0f26fbfe4ae6020d3cafecf21c3cd45a068fee4453fec17e3d` ذخیره شد؛ version ID برابر `appgprj_6a90313e390c81918572fc1b45269dac~appgver_31ac1fcd9cec8191b00f8f2096f2f7e9` و deployment خصوصی `appgdep_6a927bee77808191812616e41360858c` در وضعیت `succeeded` روی `https://chida-prototype.mahyarkl.chatgpt.site` قرار گرفت. دسترسی owner-only/custom با یک مالک، بدون گروه و بدون مهمان بیرونی حفظ شد.
- commit مستندی نهایی SHA `ef21c022ae28a772bbd710bc09c8f61a18db74ad` است و prototype tree آن با `0d633e0dbf3d9291d6bba963f64855143b5cf1ef` یکسان ماند. local/GitHub `main` هم‌تراز شدند؛ Cloudflare Pages deployment نهایی `4396280e-95e7-4ceb-bdf2-da720de51170` با `github:push`، شاخهٔ `main`، `commit_dirty=false` و همین source در وضعیت `success` قرار گرفت. ChatGPT Sites نسخهٔ ۱۳ با version ID `appgprj_6a90313e390c81918572fc1b45269dac~appgver_5dd91d43d590819199143a7fa48ff09d` و deployment خصوصی `appgdep_6a927e3aaec881918dc255bde7e18ba4` در وضعیت `succeeded` منتشر شد. archive hash و ۱۸ فایل با release کد یکسان ماندند و دسترسی owner-only/custom حفظ شد؛ receiptهای قدیمی‌تر برای تاریخچه باقی‌اند.
- commit کد T8-A1 برابر `1d6721da9bfbadc04f4ecdd4c5bbb94de4c6c8e1` بود و receipt مستندی نهایی SHA `2d72f5bbe86eab6c975a7beb2bd72ffc38c7e9ba` است؛ prototype tree هر دو برابر `b5517034ca599cb9779497974d2d01fba23fdda7` ماند. local/GitHub `main` هم‌تراز شدند و Cloudflare deployment نهایی `806f7378-facb-411a-b9fa-f8febdaac62b` با `github:push`، شاخهٔ `main`، `commit_dirty=false` و status برابر `success` منتشر شد. canonical و immutable با build محلی hash یکسان داشتند.
- ChatGPT Sites نسخهٔ ۱۵ با source commit نهایی، ۱۸ فایل و archive hash `sha256:20e03c011543ef61b61b34ccda06ddb55c9acd091e70e69d61110d2a8b1176c0` ذخیره شد؛ version ID برابر `appgprj_6a90313e390c81918572fc1b45269dac~appgver_0b4f39214db48191a6982355aff562b1` و deployment خصوصی `appgdep_6a9295dd273c819195e5bde8cf2886bc` در وضعیت `succeeded` قرار گرفت. دسترسی owner-only/custom با یک مالک و بدون گروه یا مهمان بیرونی حفظ شد؛ T8-A1 بسته و T8-A2 فقط در لوکال آغاز شد.
- ماهیار پس از مشاهدهٔ T8-A2 گفت «بریم تسک بعدی»؛ مطابق روال پروژه، این بازخورد تأیید T8-A2 و مجوز commit، push و انتشار همه‌جای همان snapshot آزموده و receipt آن است. این بند مجوز انتشار برش بعدی نیست.
- commit کد T8-A2 برابر `f5d68b6e757c0763a6770a46c5c3a211825713d3` روی local/GitHub `main` هم‌تراز شد. Cloudflare Pages deployment `11eb968e-8348-455a-abcf-6187221f897b` با `github:push`، شاخهٔ `main`، `commit_dirty=false` و status برابر `success` منتشر شد؛ canonical و immutable با build محلی hash یکسان داشتند: HTML `e1d80ca062a1736bb6c1c1814b6920160f255c80b4362db4a80736fb4561f616`، JavaScript `d9a5af99b514e38fe7106d9bc13d70a4b786d51e14ffa0f59fa20f8b6470246e` و CSS `a8cc77e688cfdf669d53be72c248434f4f4122b2ddf6ace2f8f56bd141a5d444`.
- ChatGPT Sites نسخهٔ ۱۶ با source commit همین SHA، ۱۸ فایل و archive hash `sha256:9790a1b4054451e1192669dfea8ecb8a2a9f4e2086d54cfa13d8452d4bdce76e` ذخیره شد؛ version ID برابر `appgprj_6a90313e390c81918572fc1b45269dac~appgver_1c2eb22ab4c48191823c95adc6f00677` و deployment خصوصی `appgdep_6a92b4ea95748191be4cd9f8eed39bf8` در وضعیت `succeeded` قرار گرفت. دسترسی owner-only/custom با یک مالک و بدون گروه یا مهمان بیرونی حفظ شد.
- **[وضعیت تاریخی پیش از receipt نهایی]** commit مستندی جاری فقط receipt و وضعیت T8-A2 را ثبت می‌کرد و prototype tree آن با `f5d68b6` یکسان می‌ماند؛ نتیجهٔ نهایی همان SHA `5357fc503df57f51bd4659401399f1b3b76a0caa` و receiptهای زیر شد.
- commit مستندی نهایی `5357fc503df57f51bd4659401399f1b3b76a0caa` روی local/GitHub `main` هم‌تراز شد. prototype tree آن با commit کد `f5d68b6e757c0763a6770a46c5c3a211825713d3` یکسان و برابر `30440070ef4bf6b63633fccd0a9999953a36a16c` ماند؛ اختلاف این دو commit فقط سه سند وضعیت و receipt بود.
- Cloudflare Pages deployment نهایی `4ae8e8ee-bc2d-4b44-b542-7bffe7332181` با `github:push`، شاخهٔ `main`، `commit_dirty=false` و source commit نهایی در وضعیت `success` قرار گرفت. canonical `https://chida-prototype.pages.dev` همان asset hashهای release کد را حفظ کرد: HTML `e1d80ca062a1736bb6c1c1814b6920160f255c80b4362db4a80736fb4561f616`، JavaScript `d9a5af99b514e38fe7106d9bc13d70a4b786d51e14ffa0f59fa20f8b6470246e` و CSS `a8cc77e688cfdf669d53be72c248434f4f4122b2ddf6ace2f8f56bd141a5d444`.
- ChatGPT Sites نسخهٔ ۱۷ با source commit نهایی، ۱۸ فایل و archive hash `sha256:9790a1b4054451e1192669dfea8ecb8a2a9f4e2086d54cfa13d8452d4bdce76e` ذخیره شد؛ version ID برابر `appgprj_6a90313e390c81918572fc1b45269dac~appgver_7be8bd1b07208191a90be04771891562` و deployment خصوصی `appgdep_6a92b60a7f848191bc8de2ac805a2934` در وضعیت `succeeded` روی `https://chida-prototype.mahyarkl.chatgpt.site` قرار گرفت. دسترسی owner-only/custom حفظ شد؛ T8-A2 بسته و T8-A3 فقط به‌صورت local/uncommitted/unpublished آغاز شد.
- ماهیار پس از مشاهدهٔ T8-A3، همین snapshot آزموده و receipt آن را برای commit، push و انتشار همه‌جا صریحاً تأیید کرد؛ این مجوز فقط برای T8-A3 مصرف می‌شود.
- commit کد T8-A3 برابر `8b7b85a2c6aa5a388df0a87d09f18ff0f1776e6d` روی local/GitHub `main` هم‌تراز شد و prototype tree آن `f341b95df9dcaf4b6e8bcdffd3300fbbf18750c8` است. Cloudflare Pages deployment `c26edc36-769d-4a13-9a3d-599401b58223` پس از push `main` منتشر شد؛ canonical و immutable پاسخ ۲۰۰ و hash یکسان با build محلی داشتند: HTML `c3f1bdc00d2c4d3b72955d693a4567538f191833ae149683b91983ac3acc5ea2`، JavaScript `d71326d6ff6640f3af7e4fbd7fb19bbb6c0a311b27809bf357eb959e8afafcd8` و CSS `74d8c2c111a5fff44b77278ea6109d298bc7b7b5ebcdc5e6bd680a20deebaddd`.
- ChatGPT Sites نسخهٔ ۱۸ با source commit همین SHA، ۱۸ فایل و archive hash `sha256:518b2be3a9fa2895965e6ed827a9f6d5f3db2a602d8c5155a888c08616992c42` ذخیره شد؛ version ID برابر `appgprj_6a90313e390c81918572fc1b45269dac~appgver_32761ebf98c08191b06b180887273315` و deployment خصوصی `appgdep_6a92c98b5f6c81919151a8a2a1962975` در وضعیت `succeeded` قرار گرفت. دسترسی owner-only/custom با یک مالک و بدون گروه یا مهمان بیرونی حفظ شد.
- commit مستندی نهایی T8-A3 برابر `0b8810683dd5c35819397cea95c7ff01e3ce9c95` روی local/GitHub `main` هم‌تراز شد؛ prototype tree آن با commit کد `8b7b85a2c6aa5a388df0a87d09f18ff0f1776e6d` یکسان و برابر `f341b95df9dcaf4b6e8bcdffd3300fbbf18750c8` ماند.
- Cloudflare Pages deployment نهایی `e2fb901e-bc10-49b7-b041-5d25606af0ed` از `main`/SHA نهایی منتشر شد؛ canonical و immutable هر دو ۲۰۰ و با build محلی یکسان ماندند: HTML `c3f1bdc00d2c4d3b72955d693a4567538f191833ae149683b91983ac3acc5ea2`، JavaScript `d71326d6ff6640f3af7e4fbd7fb19bbb6c0a311b27809bf357eb959e8afafcd8` و CSS `74d8c2c111a5fff44b77278ea6109d298bc7b7b5ebcdc5e6bd680a20deebaddd`.
- ChatGPT Sites نسخهٔ ۱۹ با version ID `appgprj_6a90313e390c81918572fc1b45269dac~appgver_d1ee6e9c0774819196ded43a64197ff0`، source commit نهایی، ۱۸ فایل و archive hash `sha256:518b2be3a9fa2895965e6ed827a9f6d5f3db2a602d8c5155a888c08616992c42` با deployment `appgdep_6a92cb1191ac8191b655a8b73774b039` در وضعیت `succeeded` منتشر شد؛ دسترسی owner-only/custom حفظ شد.
- پس از این baseline، T8-A4/T8-A5a توسط ماهیار تأیید و T8-A5b/T8-UX1 پیاده‌سازی، آزمون و QA شدند. snapshot یکپارچه با commit کد `00a97a116a0115f6ffdae06579ded8fa64eb8c60` روی local/GitHub `main` هم‌تراز شد و prototype tree آن `b1143dda693d72666ef71f4db5f93b421b8e061f` است.
- Cloudflare Pages deployment تولید `907c1060-7b24-4e0a-b625-b459462be282` از شاخهٔ `main` و source `00a97a1` منتشر شد. canonical `https://chida-prototype.pages.dev` و immutable `https://907c1060.chida-prototype.pages.dev` هر دو ۲۰۰ و با build محلی یکسان بودند: HTML `64fbb6549ce602f8897203b2715d2da29fc00c1e71e1fb0fab4854177fc7d640`، JavaScript `c40ea8cacfac4cbb37f6a62157db45b88b7c604c188746d955567d439b2d05f8` و CSS `0399cb629d6ade85a55c300812929100a0013a5ee5503b28b9dc0d84ae47415a`.
- ChatGPT Sites نسخهٔ ۲۰ با version ID `appgprj_6a90313e390c81918572fc1b45269dac~appgver_8654f68344588191acae2ac8f40b2b2d`، source commit دقیق `00a97a116a0115f6ffdae06579ded8fa64eb8c60`، ۱۸ فایل و archive hash `sha256:dea74132d83b196ea3faabebc4581d25ad443ee9d9fbf5b987fd96627b0c294b` ذخیره شد. deployment خصوصی `appgdep_6a934e8632448191b455031830d69f1e` در وضعیت `succeeded` روی `https://chida-prototype.mahyarkl.chatgpt.site` منتشر و دسترسی `custom`/owner-only با یک مالک، بدون گروه و بدون مهمان بیرونی حفظ شد.
- commit مستندی receipt نهایی `d6224bbc392fda4b07910b49c110ada4859505f0` روی local/GitHub `main` هم‌تراز شد و prototype tree آن با commit کد یکسان و برابر `b1143dda693d72666ef71f4db5f93b421b8e061f` ماند. Cloudflare Pages deployment نهایی `384cfcda-0c93-4902-aab0-0c6b36c69893` با `github:push`، شاخهٔ `main`، `commit_dirty=false` و همین source در وضعیت `success` قرار گرفت.
- ChatGPT Sites نسخهٔ ۲۱ با version ID `appgprj_6a90313e390c81918572fc1b45269dac~appgver_6be5d1e18d308191832f820e195c613e`، source commit نهایی، ۱۸ فایل و archive hash `sha256:dea74132d83b196ea3faabebc4581d25ad443ee9d9fbf5b987fd96627b0c294b` ذخیره شد؛ deployment خصوصی `appgdep_6a9351ec56688191a660aadfc1c05bcc` در وضعیت `succeeded` منتشر و دسترسی `custom`/owner-only با یک مالک، بدون گروه و بدون مهمان بیرونی حفظ شد. تأیید تجربهٔ T8-A5b/T8-UX1 همچنان باز است.
- T8-UX2 پس از درخواست صریح ماهیار برای انتشار همه‌جا با commit کد `a08c93edefad6cc79bc7bb1f83a023730a2ef06f` و receipt نهایی `8c7e5d9a46f2da1acb02456b6b55010e6037db94` روی local/GitHub `main` منتشر شد؛ prototype tree هر دو `0fe7bc7f77640e78091254e76d8d88670f002aa6` است. suite نهایی app برابر ۱۵۸/۱۵۸، runtime برابر ۱۶۶/۱۶۶، Sites برابر ۴/۴، focused امنیت فایل ۲/۲، build/TypeScript و integrity ۲۸ فایل پاس شدند و finding باز P0/P1/P2 باقی نماند.
- Cloudflare Pages deployment تولید `c25eaefe-e43a-466f-9e7b-d268fe63bb7e` با `github:push`، شاخهٔ `main`، `commit_dirty=false` و source commit دقیق T8-UX2 در وضعیت `success` قرار گرفت. canonical `https://chida-prototype.pages.dev` و immutable `https://c25eaefe.chida-prototype.pages.dev` هر دو ۲۰۰ و با build محلی یکسان بودند: HTML `9410a3cd7e2560cb1ad7a9a5ebe46ee8fa60181e9f7440aa17a03ef7cf0a24c8`، JavaScript `2b4fe095c8f83a7b6648360636853eae8c9b0554a23fc6b04527e8a801323416` و CSS `bf5cf9314d94b54ec47684748229175a7c864a59230bfce63830bc95516c2754`.
- ChatGPT Sites نسخهٔ ۲۲ با version ID `appgprj_6a90313e390c81918572fc1b45269dac~appgver_e69bfaa67138819184f741aedce28725`، source commit دقیق T8-UX2، ۱۸ فایل و archive hash `sha256:39511f6d9e5641347e371ee981aef4999be97dce4dd52d2b50564a438162eb9f` ذخیره و با deployment خصوصی `appgdep_6a93f1adf4788191999f921e914d39c7` در وضعیت `succeeded` روی `https://chida-prototype.mahyarkl.chatgpt.site` منتشر شد. دسترسی `custom`/owner-only با یک مالک، صفر گروه و صفر مهمان بیرونی حفظ شد؛ پاسخ ناشناس ۴۰۱ مطابق همین حریم است.
- receipt نهایی T8-UX2 همان prototype tree را حفظ کرد. Cloudflare deployment نهایی `e24010be-d6bd-427d-95f5-77f2c05ec9a5` از source receipt، `github:push`، شاخهٔ `main` و `commit_dirty=false` موفق شد. ChatGPT Sites نسخهٔ ۲۳ با version ID `appgprj_6a90313e390c81918572fc1b45269dac~appgver_2660535ab57c81918d9f301eb74c8116`، source receipt، ۱۸ فایل و archive hash `sha256:39511f6d9e5641347e371ee981aef4999be97dce4dd52d2b50564a438162eb9f` ذخیره و با deployment خصوصی `appgdep_6a93f27f77c48191adc895a833c41695` در وضعیت `succeeded` منتشر شد؛ access `custom`/owner-only با یک مالک، صفر گروه و صفر مهمان بیرونی حفظ شد.
- T8-UX3 با commit کد `3e4b35fe08b02918e4be814d5d796da14bfa54ca` روی local/GitHub `main` منتشر شد و prototype tree آن `4297309252e2e6f9d80c184be7aad1e795c80279` است. focused نهایی ۵/۵، app برابر ۱۵۹/۱۵۹، runtime برابر ۱۶۷/۱۶۷، Sites برابر ۴/۴، build/TypeScript و integrity ۲۸ فایل پاس شدند؛ QA `390 × 844` و بازبینی مستقل finding باز P0/P1/P2 ندارند.
- Cloudflare Pages deployment تولید `9b78e089-e0f5-427b-b788-9221b908ef7d` از `main` و source `3e4b35f` فعال شد. canonical و immutable برای HTML، JavaScript، CSS و نشان ۲۰۰ و با build محلی یکسان بودند: HTML `2872325a9536c3c30933c0bf4e05c921c5c57841b2050565d4b4c0e4456ca2ce`، JavaScript `5b5b5cef51c427d108b02983213d14e6e27e403ec99fd27e7c7a75cd5e15ef1b`، CSS `94283e31ad8830896c0e44498a248d96f392b1de83912d9783a2e02867be81df` و نشان `44cc69c64df0f51d8603ce8157e3f3d7eb753ac4908eddf80b9e773ef1231cad`.
- ChatGPT Sites نسخهٔ ۲۴ با version ID `appgprj_6a90313e390c81918572fc1b45269dac~appgver_86ea0b7d394c8191aef34c83a2ae0e2f`، source commit دقیق کد، ۱۹ فایل و archive hash `sha256:316dbe635d0483a16eb3480c288898d8c14a1af97f2b1882187c6baf05da18f5` ذخیره و با deployment خصوصی `appgdep_6a940cbe06d48191912661b9e4ec4615` در وضعیت `succeeded` منتشر شد؛ access `custom`/owner-only با یک مالک، صفر گروه و صفر مهمان بیرونی حفظ شد.
- commit مستندی receipt نهایی T8-UX3 برابر `3bbd870ca021339d89abc09528f57fc690deec50` روی local/GitHub `main` هم‌تراز شد و prototype tree آن با commit کد یکسان و برابر `4297309252e2e6f9d80c184be7aad1e795c80279` ماند. Cloudflare deployment `f665580f-26c9-4363-9793-d4baaae5e644` از همین source موفق شد و ChatGPT Sites نسخهٔ ۲۵ با version ID `appgprj_6a90313e390c81918572fc1b45269dac~appgver_4fd3dab34a8481918949ad5a947d6942` و deployment `appgdep_6a941bdda88881918951b8508e2c2eec` در وضعیت `succeeded` منتشر شد. شناسه‌های انتشار خود هنداف Sol به‌دلیل حلقهٔ self-reference در پیام تحویل گزارش می‌شوند.

release کد بازخوردی C-010 در ۱۴۰۵/۰۶/۰۷ — ۲۰۲۶/۰۸/۲۹ منتشر و راستی‌آزمایی شد؛ commit مستندی بعدی baseline نهایی را به `57bbf656` رساند:

- commit کد `d750f88fcfbf72f30ff8b58e4331b3d081bf9f4f` شامل قرارداد Projects-only، ویرایش/موعد کار، Brief transactional، Settings صادقانه، تصویر نمایشی پروفایل و gridهای بدون overflow است. `HEAD`/`main`/`origin/main`/`git ls-remote` و مخزن منبع Sites هنگام ذخیرهٔ نسخه همگی همین SHA را گزارش کردند.
- Cloudflare Pages deployment تولید `a09cde6f-628f-4d94-bc56-0fd8c5915133` با trigger برابر `github:push`، شاخهٔ `main`، `commit_dirty=false` و همین SHA با وضعیت `success` منتشر شد. canonical `https://chida-prototype.pages.dev` و immutable `https://a09cde6f.chida-prototype.pages.dev` پاسخ موفق داشتند و hash فایل‌های HTML، JS و CSS هر دو با build محلی دقیقاً یکسان بود.
- ChatGPT Sites نسخهٔ ۸ با source commit همین SHA و ۱۸ فایل ذخیره شد؛ version ID برابر `appgprj_6a90313e390c81918572fc1b45269dac~appgver_a8888bc4c5548191a3ad269ed6b8d6d9` و deployment خصوصی `appgdep_6a91fd0cbe4c8191ae0af74919f4411c` با وضعیت `succeeded` روی `https://chida-prototype.mahyarkl.chatgpt.site` قرار گرفت. access همچنان owner-only/custom با یک مالک و بدون گروه یا مهمان بیرونی است.
- سند مادر تغییر نکرد، runtime محافظت‌شده سالم ماند و credential کوتاه‌عمر Sites فقط با header همان فرمان استفاده شد؛ در remote URL، Git config، فایل یا log پروژه ذخیره نشد. commit مستندی بعدی فقط همین receipt و وضعیت C-010 را به‌روز می‌کند و prototype tree آن با `d750f88` یکسان می‌ماند؛ SHA نهایی جاری را در گفت‌وگوی تازه با `git rev-parse HEAD` تطبیق بده.
- این بند سابقهٔ همان لحظه است: مجوز انتشار C-010 مصرف شده بود و T7-B هنوز مجوز اجرا نداشت. ماهیار بعداً در ۱۴۰۵/۰۶/۰۷ روال ادامهٔ تسک‌های سازنده را صریح کرد و T7-B1 بر همان اساس آغاز شد؛ این مجوز شامل انتشار T7-B1 پیش از مشاهده و تأیید او نیست.

release تاریخی T7-A در ۱۴۰۵/۰۶/۰۶ — ۲۰۲۶/۰۸/۲۸ بسته شد:

- `HEAD`، `main`، `origin/main`، `git ls-remote origin main` و GitHub همگی `bf59df1b82f3886794115647920b834c5e9c74dd` را گزارش کردند؛ ahead/behind صفر/صفر بود.
- Cloudflare Pages deployment تولید `4801dd57-17f3-4b6c-aafc-5b73fe17b375` را با trigger برابر `github:push`، شاخهٔ `main`، `commit_dirty=false` و همین SHA با وضعیت `success` منتشر کرد؛ canonical و URL immutable پاسخ ۲۰۰ داشتند و hash فایل‌های HTML، JS و CSS با build محلی یکسان بود.
- ChatGPT Sites نسخهٔ ۷ با ۱۷ فایل و source commit همین SHA ذخیره شد و deployment خصوصی `appgdep_6a91e6f150f4819185379101b1c951ce` با وضعیت `succeeded` روی `https://chida-prototype.mahyarkl.chatgpt.site` قرار گرفت؛ access همچنان owner-only/custom است.
- artifact موقت انتشار یا credential در مخزن و Git config ذخیره نشد. سند مادر تغییر نکرد؛ لینک بعداً توسط کاربر مشاهده و بازخورد C-010 دریافت شد، اما T7-B همچنان مجوز شروع ندارد.

release تأییدشدهٔ قبلی `bd766bc` نیز در همین تاریخ بسته شده بود:

- `HEAD`، `main`، `origin/main`، `git ls-remote origin main` و GitHub همگی `bd766bc91f25a082cf4fe544613855b1ee22cc5c` را گزارش کردند.
- Cloudflare Pages deployment تولید `c24d07c7-1a5a-4fe1-b1fb-6b7374dc7faf` را با trigger برابر `github:push`، شاخهٔ `main`، `commit_dirty=false` و همین SHA با وضعیت `success` منتشر کرد؛ canonical و URL immutable پاسخ ۲۰۰ داشتند و hash فایل‌های HTML، JS و CSS با build محلی یکسان بود.
- ChatGPT Sites نسخهٔ ۶ با ۱۷ فایل و source commit همین SHA ذخیره شد و deployment خصوصی `appgdep_6a91cf323ea0819195175f7ed1ceb286` با وضعیت `succeeded` روی `https://chida-prototype.mahyarkl.chatgpt.site` قرار گرفت؛ access همچنان owner-only/custom است.
- artifact موقت انتشار یا credential در مخزن و Git config ذخیره نشد. تغییرهای T7-A پس از این نقطه یک working tree محلی تازه‌اند و جزو release `bd766bc` نیستند.

خطوط بعدی، ممیزی تاریخی نسخهٔ پایهٔ پیش از release جاری را برای حسابرسی حفظ می‌کنند.

پیش از پیاده‌سازی محلی T6-B2/T6-C، چهار مقصد منتشرشده دوباره بررسی شدند:

- شاخهٔ محلی: `main`.
- `HEAD` و `origin/main`: `233e2797582895c3ec4901fe3f17900bb5373196`.
- عنوان commit: `Merge pull request #4 from mahyarkalbasii-cloud/codex/t4c-mock-source-answer`.
- remote: `https://github.com/mahyarkalbasii-cloud/Chida.git`.
- `git ls-remote`، `origin/main`، `main` و `HEAD` همین SHA را تأیید کردند؛ ahead/behind برابر صفر/صفر بود.
- پیش‌نمایش Vite از همین منبع پایه روی `http://127.0.0.1:5173/` پاسخ ۲۰۰ داشت.
- Cloudflare Pages پروژهٔ `chida-prototype`، deployment تولید `12bd14eb-8c5a-44a6-9799-a1a980dd12dc` را با commit همین SHA گزارش کرد؛ canonical و URL immutable آن با build بازتولیدشده بایت‌به‌بایت یکسان بودند.
- ChatGPT Sites پروژهٔ `appgprj_6a90313e390c81918572fc1b45269dac` در نسخهٔ زندهٔ ۵، source commit همین SHA و ۱۷ فایل را گزارش کرد؛ دامنهٔ `https://chida-prototype.mahyarkl.chatgpt.site/` owner-only است.
- نتیجهٔ ممیزی پایه: GitHub، local `main`/HEAD، Cloudflare و Sites همگی روی `233e279` بودند. پس از آن T6-B2، T6-C، اصلاحات تازهٔ تجربه و T6-D فقط در working tree محلی ساخته شدند؛ بنابراین مقصدهای منتشرشده همچنان با یکدیگر هم‌نسخه‌اند اما هنوز این تغییرهای محلی را ندارند.

این بند سابقهٔ پیش از release `bd766bc` است: تا پیش از تأیید ماهیار، هیچ commit، push، merge یا deploy برای T6-B2، T6-C، اصلاحات تجربه یا T6-D مجاز یا انجام نشده بود. آن مجوز سپس فقط برای release `bd766bc` مصرف شد و دیگر مجوز جاری نیست؛ انتشار T7-A مجوز جدا می‌خواهد. فایل‌های عمدی آن working tree که در release حفظ شدند:

- `AGENTS.md`؛
- `prototype/AGENTS.md`؛
- `CHIDA-PRODUCT-LEARNINGS-FA.md`؛
- `CHIDA-CONTINUATION-HANDOFF-FA.md`؛
- `prototype/src/Prototype.tsx`؛
- `prototype/src/prototype.css`؛
- `prototype/tests/chida-flow.spec.ts`.

پاک‌سازی محلی فقط روی artifactهای قابل‌بازتولید انجام شد: `.DS_Store`، `prototype/dist` و `prototype/test-results` در دورهای قبلی به Trash منتقل شدند. آخرین build/test نیز `dist` و `test-results` را دوباره ساخت؛ هر دو پیش از تحویل به‌صورت recoverable به `/Users/mahyarkl/.Trash/CHIDA-integrated-cleanup-20260828.sfGZxE` منتقل شدند. فونت مجاز، `node_modules`، artifactهای tracked و فایل‌های مستندی حفظ شدند.

## کنترل کیفیت و انتشار T7-B1

- پنج regression متمرکز T7-B1 محاسبهٔ دقیق، استقلال byte-for-byte storeهای مبدأ، تصمیم مستقل و reload، unknown بدون candidate، rollback نوشتن، no-op/version/history، invalidation، فساد/read-error fail-closed و مرز canonicalization یک coefficient موقت ۲۰۱رقمی به خروجی معتبر ۲۰۰رقمی را پوشش داده و پاس شده‌اند.
- QA مرورگر داخلی در viewport واقعی `390 × 844` مبلغ‌های `۲۴٬۴۳۵٬۰۰۰` و `۲۳٬۰۰۰٬۰۰۰` تومان، نامزد شرطی درست، focus روی hero پس از ذخیره و overflow افقی صفر در editor، detail، کارت‌های نتیجه و تصمیم را نشان داد.
- سه بازبینی مستقل همهٔ findingهای قرارداد/داده/UI را بستند؛ پس از اصلاح نهایی، finding باز P0/P1/P2 باقی نماند.
- اعتبارسنجی نهایی همین snapshot: `npm run check:runtime` برای ۲۸ فایل محافظت‌شده، `npm run build` شامل TypeScript، `npm run test:app` با ۱۰۸/۱۰۸، `npm run test:runtime` با ۱۱۶/۱۱۶، `npm run test:sites` با ۴/۴، `npx tsc --noEmit` و `git diff --check` پاس شدند. تنها هشدار شناخته‌شده، chunk جاوااسکریپت بزرگ‌تر از 500kB است. این‌ها شواهد پیش از انتشار T7-B1 بودند؛ receipt نهایی همان انتشار در بخش Git بالا ثبت شده است.

## خط مبنای کنترل کیفیت release بازخوردی C-010

- روی snapshot نهایی، `npm run check:runtime` برای ۲۸ فایل محافظت‌شده، `npm run build` و TypeScript، `npm run test:app` با ۱۰۳/۱۰۳، `npm run test:runtime` با ۱۱۱/۱۱۱، `npm run test:sites` با ۴/۴ و `git diff --check` پاس شدند. تنها هشدار شناخته‌شده، chunk جاوااسکریپت بزرگ‌تر از 500kB است.
- regressionهای Projects-only، شکست ذخیرهٔ پروژه، Brief موفق/ناموفق، ساخت/ویرایش/no-op/rollback/legacy کار، نمایش موعد و زمان تکمیل، Settings و شمارش کامل/ناممکن رکوردهای محلی، grid اقدام‌های سریع و فیلترهای کار و همهٔ مسیرهای T1 تا T7-A پاس شدند.
- QA مرورگر داخلی در `390 × 844` خانه، منو، Settings، مرکز کار و editor را پوشش داد. overflow افقی ریشه، پنل‌ها، Quick Actionها و فیلترهای کار صفر بود؛ console warning/error تازه نداشت؛ تصویر فرضی `640 × 640` درست بارگذاری شد و آواتار در منو و Settings دیده شد.
- بازبینی مستقل یک P2 دربارهٔ ناقص‌بودن شمارش Settings پیدا کرد؛ تأییدها، گیرنده‌ها، Draftهای ارسال و Approval برنامه به شمارش اضافه شدند و read-error اکنون به‌جای عدد ناقص «شمارش کامل نشد» نشان می‌دهد. پس از اصلاح، suite کامل دوباره پاس شد و finding باز P0 تا P2 باقی نماند.

## خط مبنای تاریخی release `bd766bc`

- سناریوهای regression برای سه مسیر ساخت پروژه، rollback شکست نوشتن دوم و شکست rollback، ترمیم active pointer، جداسازی draft و پیام‌های چت هر پروژه، نام ۱۰۰کاراکتری در dock، حالت ساده/پیشرفتهٔ محصول و خدمت، چرخهٔ T6-D، invalidation تاریخی، ترتیب زمانی dependencyها و خطاهای ذخیره/خواندن پاس شده‌اند. معیار «سه مسیر» فقط تاریخچهٔ آن release است و با C-010 منسوخ شده است.
- `npm run check:runtime` برای ۲۸ فایل محافظت‌شده، `npm run build` شامل TypeScript، تست اپ ۹۳ از ۹۳، runtime کامل ۱۰۱ از ۱۰۱، Sites چهار از چهار و `git diff --check` پاس شدند. تنها هشدار شناخته‌شدهٔ build، chunk بزرگ‌تر از 500kB است.
- QA مرورگر داخلی در viewport واقعی `390 × 844` حالت سادهٔ درخواست، Draft با ۱۷ فیلد، جزئیات T6-D و چرخهٔ `pending → withdrawn → reopened → approved` را نشان داد. پس از هر تصمیم، focus روی status برگشت؛ عرض document برابر ۳۹۰، overflow سند و status صفر و warning/error تازهٔ console صفر بود. reload و ماندگاری رکورد در regression خودکار پوشش داده شد.
- بازبینی مستقل پس از اصلاح جداسازی چت، commit پروژه، chronology، focus و overflow هیچ finding باقی‌ماندهٔ P0 تا P2 گزارش نکرد.

## قابلیت‌های ساخته‌شده و وضعیت تأیید سمت سازنده

- T1: ورود و ساخت/تکمیل پروژه با نام، محدودهٔ تهران و مرحلهٔ ساخت؛ Quick Actionها طبق تصمیم تازهٔ T8-UX3 یک rail افقی dragپذیر با overflow داخلی، محتوای RTL و بدون overflow صفحه‌اند.
- T2: فضای پروژه و شناسنامهٔ تدریجی شامل کاربری، مساحت زمین، زیربنا، طبقات روی زمین، طبقات منفی و تعداد واحدها.
- T3 و T3.1: شناسنامهٔ فایل‌های پروژه و گالری تصاویر مرورگرمحور با IndexedDB.
- T4-A: حافظهٔ دستی، شفاف و پروژه‌محور.
- T4-B: جست‌وجوی قطعی محلی روی حافظه و metadata فایل‌های پروژهٔ فعال.
- T4-C-Demo: نمونهٔ فقط‌خواندنی و صریحاً ساختگی پاسخ منبع‌دار؛ نه retrieval یا citation واقعی.
- T5-A: مرکز کارها با وظیفهٔ داخلی دستی، نسخه و تاریخچه؛ عنوان، گام و موعد قابل‌ویرایش‌اند، ویرایش واقعی رویداد `updated` و `version + 1` می‌سازد، no-op نسخه را جلو نمی‌برد، شکست نوشتن rollback می‌شود و موعد/زمان تکمیل از روی کارت دیده می‌شوند.
- T6-A: درخواست خرید محصول، تک‌قلمی، دستی و محلی.
- T6-B: تأیید داخلی snapshot نسخهٔ مشخص درخواست؛ بدون مقصد یا مجوز ارسال.
- T6-B2: محصول چندقلمی، خدمت مستقل، unknown/clarification نسخه‌دار و revision تاریخی؛ توسط کاربر تأیید و در release `bd766bc` منتشر شد.
- اصلاح تجربهٔ پروژه: ساخت پروژهٔ تازه فقط داخل مجموعهٔ «پروژه‌ها» در دسترس است؛ میان‌بر بالای خانه، دکمهٔ پایین چت و اقدام مستقیم منو حذف شده‌اند و ردیف «پروژه‌ها» در منو خود مجموعه را باز می‌کند. فرم حداقلی و قرارداد write-before-state قبلی حفظ شده‌اند.
- جداسازی چت پروژه: draft Composer و پیام‌های همین نشست بر اساس `projectId` جدا هستند؛ پروژهٔ تازه با چت خالی باز می‌شود و بازگشت به پروژهٔ قبلی draft و پیام‌های همان پروژه را برمی‌گرداند. این برش persistence یا backend چت ادعا نمی‌کند.
- اصلاح تجربهٔ استعلام: فرم و جزئیات درخواست با حالت «ساده» آغاز می‌شوند و حالت «پیشرفته» همان draft/schema را با جزئیات بیشتر نشان می‌دهد؛ جابه‌جایی mode دادهٔ پنهان را حذف نمی‌کند و unknown/clarification همچنان قرارداد اصلی است.
- T6-C: گیرندهٔ خصوصی محلی، انتخاب دستی، پیش‌نمایش allowlist اشتراک و DispatchDraft نسخه‌دار با `externalEffect=none` و `sendAuthorized=false`؛ توسط کاربر تأیید و در release `bd766bc` منتشر شد.
- T6-D: Approval مستقل و خصوصیِ برنامهٔ ارسال با snapshot مقصد/payload/privacy، چرخهٔ pending/withdraw/reopen/approve، اعتبار جاری مشتق‌شده و نمایش تاریخی invalidated؛ فقط شبیه‌سازی محلی با `simulationOnly=true`، `externalEffect=none` و `sendAuthorized=false`؛ توسط کاربر تأیید و در release `bd766bc` منتشر شد.
- T7-A: صندوق خصوصی پیشنهادهای ثبت‌شده توسط سازنده با target دقیق، reference metadata-only، رونویسی و مقادیر ساختاریافتهٔ نسخه‌دار؛ در release `bf59df1` روی هر سه مقصد same-source منتشر و سپس توسط کاربر مشاهده شد.
- T7-B1: مقایسهٔ محصول با پیشنهادهای pin‌شده، سه لایهٔ declared/assumption/calculation، arithmetic اعشاری دقیق، recommendation محدود و تصمیم مستقل نسخه‌دار؛ با receipt نهایی SHA `92dcc14b911ff7840c3816ce5345c472604bff98` در هر سه مقصد منتشر و بسته شده است.
- T7-B2: مقایسهٔ کیفیِ معیارمحورِ حداقل دو پیشنهاد خدمت برای همان target دقیق و تصمیم انسانی جدا؛ با receipt نهایی SHA `ef21c022ae28a772bbd710bc09c8f61a18db74ad` در هر سه مقصد منتشر و بسته شده است. امتیازدهی، رتبه‌بندی، انتخاب «بهترین»، نرمال‌سازی عددی/قیمت، شبکه و اثر بیرونی در این برش وجود ندارند.
- T8-A1: پیش‌نویس خصوصی، دستی، پروژه‌محور و نسخه‌دارِ سؤال پس از پیشنهاد، pin‌شده به یک قلم محصول یا معیار واجدشرایط خدمت؛ ماهیار آن را تأیید کرد و receipt نهایی SHA `2d72f5bbe86eab6c975a7beb2bd72ffc38c7e9ba` در هر سه مقصد same-source منتشر و بسته شد.
- T8-A2: رونویسی خصوصی، دستی و نسخه‌دار پاسخ مرتبط با revision دقیق سؤال T8-A1؛ پیاده‌سازی، آزمون و QA کامل و پس از مشاهده توسط ماهیار تأیید شد. receipt same-source نهایی SHA `5357fc503df57f51bd4659401399f1b3b76a0caa` در GitHub، Cloudflare و ChatGPT Sites نسخهٔ ۱۷ منتشر شد و این برش بسته است.
- T8-A3: بازبینی خصوصی و نسخه‌دار سازنده به revision/fingerprint دقیق پاسخ T8-A2 pin می‌شود و lineage سؤال T8-A1 را از snapshot تغییرناپذیر همان پاسخ به ارث می‌برد. سه outcome دستی با دلیل اجباری، historical/no-rebind، project isolation و خطای storage مستقل پیاده‌سازی و QA و پس از مشاهده توسط ماهیار تأیید شدند؛ receipt نهایی `0b8810683dd5c35819397cea95c7ff01e3ce9c95` در GitHub، Cloudflare و ChatGPT Sites نسخهٔ ۱۹ منتشر و این برش بسته شد.
- T8-A4: ارزیابی کیفی و دستی سازنده دربارهٔ اثر تغییر یا روشن‌شدن شرط، به revision/fingerprint دقیق پاسخ T8-A2 pin می‌شود و lineage بالادستی را از snapshot تغییرناپذیر همان پاسخ به ارث می‌برد. خلاصهٔ تغییر، حوزه، جهت اثر و دلیل اجباری‌اند؛ version/history، no-op، rollback، tamper/read-error fail-close، project isolation، historical/no-rebind و استقلال از review خواهر T8-A3 پوشش داده شده‌اند. ماهیار آن را تأیید کرد و snapshot یکپارچه با commit کد `00a97a116a0115f6ffdae06579ded8fa64eb8c60` در هر سه مقصد منتشر شد.
- T8-A5a: مقایسهٔ مشتق‌شده و فقط‌خواندنی دو revision دقیق از همان پیشنهاد محصول، با نمایش tuple دقیق نسخه‌ها و delta قطعی فیلدهای رونویسی‌شده؛ پیاده‌سازی، آزمون و در `390 × 844` QA شد، ماهیار آن را تأیید کرد و snapshot یکپارچه با commit کد `00a97a116a0115f6ffdae06579ded8fa64eb8c60` منتشر شد. این برش amendment واقعی، محاسبه، recommendation، storage، AI، شبکه، mutation یا اثر بیرونی ادعا نمی‌کند.
- T8-A5b: همان قرارداد برای proposal خدمت با یک line دقیق `serviceSpecId`-محور، سه فیلد revision و سیزده فیلد line پیاده‌سازی شد. focused ۷/۷ و snapshot T8-A5b پیش از T8-UX1 با app ۱۵۳/۱۵۳، runtime ۱۶۱/۱۶۱، Sites ۴/۴، build/TypeScript و integrity ۲۸ فایل پاس بود؛ QA واقعی `390 × 844` و بازبینی مستقل بدون finding باز P0/P1/P2 پاس‌اند. snapshot یکپارچه برای مشاهده از خانه منتشر شده، اما تأیید تجربه هنوز باز است.
- T8-UX1: بازخورد ماهیار دربارهٔ ترسناک و متنی‌شدن جریان پیشنهاد به یک بازآرایی UI-only سراسری تبدیل شد. صندوق فقط یک CTA اصلی دارد؛ فرم با حالت ساده آغاز می‌شود؛ خلاصه و اقدام بعدی پیش از تاریخچه/lineage می‌آیند و diff فقط تغییرها را پیش‌فرض نشان می‌دهد. app ۱۵۵/۱۵۵، runtime ۱۶۳/۱۶۳، Sites ۴/۴، build/TypeScript، integrity ۲۸ فایل و QA واقعی `390 × 844` پاس‌اند؛ تست gesture اصلاح‌شده نیز ۵۰/۵۰ پاس شد و runtime محافظت‌شده تغییر نکرد. snapshot یکپارچه برای مشاهده از خانه منتشر شده، اما تأیید UX هنوز باز است.
- T8-UX2: ماهیار خلوت‌سازی عکس/فایل/حافظه و کوتاه‌شدن خرید به ثبت درخواست، انتخاب تأمین‌کننده‌های ثبت‌شده و تأیید نهایی در «کارها» را خواست. عکس از «فایل‌ها» جدا و سند منتخب در IndexedDB همان مرورگر قابل‌بازشدن می‌شود؛ جزئیات فنی در داده حفظ اما از نمای اصلی پنهان‌اند. focused برابر ۶/۶، رسانه/فایل/حافظه برابر ۲۰/۲۰، app برابر ۱۵۸/۱۵۸، runtime برابر ۱۶۶/۱۶۶ و Sites برابر ۴/۴ پاس‌اند؛ QA واقعی `390 × 844` و بازبینی مستقل finding باز P0/P1/P2 ندارند. این برش ارسال، شبکه، تطبیق تأمین‌کننده یا مجوز اقدام بیرونی نمی‌سازد و فقط لوکال است.
- T8-UX3: ماهیار خانهٔ خواناتر و ساده‌تر خواست: کنترل‌های پروژه فقط نام، بدون فلش؛ Quick Action یک ردیف chip افقی dragپذیر و کامل بر اساس قابلیت‌های ساخته‌شده؛ نشان اختصاصی CHIDA؛ و افزایش scoped اندازهٔ متن. rail ده اقدام دارد که هشت مقصد واقعی و دو شروع‌کنندهٔ صریح Composer هستند. focused نهایی ۵/۵، app برابر ۱۵۹/۱۵۹، runtime برابر ۱۶۷/۱۶۷، Sites برابر ۴/۴، build/TypeScript، integrity ۲۸ فایل و QA واقعی `390 × 844` پاس‌اند؛ بازبینی مستقل finding باز P0/P1/P2 ندارد. commit کد `3e4b35fe08b02918e4be814d5d796da14bfa54ca` در هر سه مقصد same-source منتشر است و تأیید تجربه باز مانده است.
- Build و Brief: شبیه‌سازی محلی مرورگر بدون نصب، زمان‌بندی یا اثر بیرونی واقعی. ذخیرهٔ موفق Brief صفحه را می‌بندد و شکست ذخیره همان صفحه و برنامهٔ قبلی را نگه می‌دارد.
- Settings: تصویر کاملاً فرضی و برچسب‌خوردهٔ سازنده، شمارش project-scoped رکوردهای محلی، نقش ثابت، حریم، حالت مدل، Brief، Dark-only و نسخه را صادقانه نشان می‌دهد؛ token/usage/billing/quota تا اتصال منبع معتبر عمداً unavailable هستند.

شمار snapshot پیش از انتشار T7-B1: اپ ۱۰۸/۱۰۸، runtime ۱۱۶/۱۱۶ و Sites ۴/۴. snapshot نهایی C-010 اپ ۱۰۳/۱۰۳ و runtime ۱۱۱/۱۱۱، خط مبنای منتشرشدهٔ `bd766bc` اپ ۹۳/۹۳ و runtime ۱۰۱/۱۰۱، snapshot T7-A اپ ۱۰۱/۱۰۱ و runtime ۱۰۹/۱۰۹، snapshot T7-B2 اپ ۱۱۲/۱۱۲ و runtime ۱۲۰/۱۲۰ و snapshot منتشرشدهٔ T8-A1 اجرای متمرکز ۶/۶، اپ ۱۱۸/۱۱۸ و runtime ۱۲۶/۱۲۶ داشتند؛ اعداد کوچک‌تر در بخش‌های تاریخی فقط نتیجهٔ همان برش‌ها در زمان تحویل قبلی‌اند. prototype tree نهایی و منتشرشدهٔ T8-A2 اجرای متمرکز T8-A1/T8-A2 برابر ۱۳/۱۳، `test:app` برابر ۱۲۵/۱۲۵، `test:runtime` برابر ۱۳۳/۱۳۳ و Sites برابر ۴/۴ دارد. snapshot منتشرشدهٔ کد T8-A3 اجرای متمرکز ۷/۷، `test:app` برابر ۱۳۲/۱۳۲، `test:runtime` برابر ۱۴۰/۱۴۰ و Sites برابر ۴/۴ دارد. snapshot T8-A4 نیز اجرای متمرکز ۷/۷، `test:app` برابر ۱۳۹/۱۳۹، `test:runtime` برابر ۱۴۷/۱۴۷ و Sites برابر ۴/۴ دارد. snapshot T8-A5a اجرای متمرکز ۷/۷ و `test:app` برابر ۱۴۶/۱۴۶ داشت؛ failure موقت Carousel آن بعداً بدون تغییر runtime با اجرای isolated ۱/۱ بسته شد. snapshot یکپارچهٔ T8-A5b focused ۷/۷، T8-A5a/T8-A5b برابر ۱۴/۱۴، `test:app` برابر ۱۵۳/۱۵۳، `test:runtime` برابر ۱۶۱/۱۶۱ و Sites برابر ۴/۴ داشت. snapshot منتشرشدهٔ T8-UX1 با commit کد `00a97a116a0115f6ffdae06579ded8fa64eb8c60` دو regression متمرکز، `test:app` برابر ۱۵۵/۱۵۵، `test:runtime` برابر ۱۶۳/۱۶۳ و Sites برابر ۴/۴ دارد؛ تست اصلاح‌شدهٔ gesture کیبورد نیز در اجرای پرفشار موازی ۵۰/۵۰ پاس شد. snapshot لوکال T8-UX2 focused برابر ۶/۶، مجموعهٔ رسانه/فایل/حافظه برابر ۲۰/۲۰، `test:app` برابر ۱۵۸/۱۵۸، `test:runtime` برابر ۱۶۶/۱۶۶ و Sites برابر ۴/۴ دارد؛ QA واقعی `390 × 844` overflow افقی و console error نداشت و بازبینی مستقل finding باز P0/P1/P2 ندارد. build/TypeScript، `npx tsc --noEmit`، integrity هر ۲۸ فایل و `git diff --check` پاس شدند.

## فاز ۱ — تاریخچهٔ برش‌های بسته و فهرست اولویت‌دار باقی‌ماندهٔ سازنده

### T6-B2 — تکمیل شِمای درخواست محصول/خدمت و روشن‌سازی قطعی

این تسک به‌صورت محلی کامل و آزموده شد، ماهیار پس از مشاهدهٔ نسخهٔ لوکال در `390 × 844` آن را تأیید کرد و سپس در release `bd766bc` منتشر شد.

- درخواست محصول از تک‌قلمی به چندقلمی نسخه‌دار گسترش یابد و برند/گرید، جایگزین مجاز، محدودهٔ تحویل، موعد، مالیات، حمل و شرایط پرداخت مقدار صریح «نامشخص» داشته باشند.
- درخواست خدمت شِمای مستقل داخل پوستهٔ مشترک داشته باشد: دامنهٔ کار، موقعیت در سطح مجاز، اندازه/حجم، صلاحیت، زمان، روش اجرا، داخل/خارج دامنه، شرایط ضمانت اعلامی و پرداخت.
- پرسش‌های روشن‌سازی فقط به‌صورت قطعی و بر پایهٔ فیلدهای اثرگذارِ ناقص ساخته شوند؛ تا نبود استخراج واقعی، `confidence` باید `null/not-applicable` باشد و مقدار ساختگی تولید نشود.
- هر قلم و پاسخ روشن‌سازی منشأ، وضعیت تکمیل، نسخه و تاریخچه داشته باشد؛ Approval قدیمی پس از تغییر نسخه معتبر نماند.
- attachment و استخراج خودکار در این برش ساخته نشوند و به T11/M6 ارجاع داده شوند.
- وضعیت تحویل: هفت تست اختصاصی، کل اپ ۷۱/۷۱ و runtime ۷۹/۷۹ در زمان تحویل آن پاس شدند؛ تأیید مستقیم ماهیار ثبت و T6-C آغاز شد.

### T6-C — ثبت گیرندهٔ محلی، انتخاب/تطبیق و پیش‌نمایش اشتراک

این تسک پس از تأیید T6-B2 به‌صورت محلی پیاده‌سازی شد، همراه اصلاحات تجربه و T6-D بازآزمایی نهایی را پاس کرد و در ۱۴۰۵/۰۶/۰۶ — ۲۰۲۶/۰۸/۲۸ توسط ماهیار تأیید شد.

- فقط از نسخه‌ای شروع شود که پس از تغییرهای T6-B2 دوباره تأیید داخلی شده است.
- فقط exact revision جاری که Approval آن `approved` و با snapshot بازبینی یکسان است وارد T6-C می‌شود؛ Approval pending یا نسخهٔ قدیمی مسیر را باز نمی‌کند.
- `SupplierContact` حداقلی و خصوصی پروژه با شناسه، نام نمایشی، دسته، پوشش تهران، توان پاسخ، منشأ «ثبت مستقیم سازنده»، وضعیت محلی، نسخه و history ساخته شد. این رکورد حساب تأمین‌کننده، عضویت شبکه، احراز یا تضمین کیفیت نیست.
- حذف سخت در این برش وجود ندارد؛ رکورد فقط آرشیو/بازیابی می‌شود تا snapshotهای تاریخی Draft قابل‌خواندن بمانند. نام، دسته، پوشش و توان پاسخ پس از ساخت در T6-C ویرایش نمی‌شوند.
- انتخاب گیرنده کاملاً دستی است. توان پاسخ یک gate قطعی محصول/خدمت است؛ دسته و پوشش فقط دادهٔ اعلامی کاربر و دلیل شفاف سازگاری‌اند، نه match هوشمند، رتبه‌بندی، «بهترین» یا اولویت پولی.
- `InviteDraft` محلی برای هر گیرندهٔ انتخاب‌شده مقصد snapshot‌شده، ادامهٔ احتمالی در فاز تأمین‌کننده، `externalEffect=none` و `sendAuthorized=false` را نگه می‌دارد؛ هیچ حساب یا پیام بیرونی ساخته نمی‌شود.
- payload از allowlist شِمای exact revision تأییدشده ساخته می‌شود. نام پروژه، بودجه، فایل، حافظه، متن خام نیاز و clarificationها حذف‌اند؛ `delivery.area` و `service.location` متن آزاد و نیازمند بازبینی دستی‌اند و پاک‌سازی معنایی آدرس ادعا نمی‌شود.
- `DispatchDraft` خصوصی و project-scoped است؛ تغییر مجموعهٔ گیرندگان revision تازه می‌سازد، no-op نسخه را جلو نمی‌برد و UI امکان مشاهدهٔ فقط‌خواندنی revisionهای تاریخی را می‌دهد.
- fingerprint مبتنی بر FNV فقط checksum سازگاری محلی در کنار بازسازی canonical payload است؛ امضای امنیتی یا تضمین دست‌کاری‌نشدن نیست.
- parser همهٔ کلیدها، شناسه‌ها، نسخه/زمان/history/revision، dependencyها و fingerprint را fail-closed کنترل می‌کند؛ رکورد history/revision خراب بی‌صدا حذف یا بازنویسی نمی‌شود و read-error mutation وابسته را قفل می‌کند.
- هیچ درخواست شبکه‌ای برای تطبیق یا ارسال، فروشندهٔ واقعی، وضعیت `sent` یا متن «ارسال شد» ساخته نشده است.
- شواهد پیشین T6-C به‌عنوان خط مبنای تاریخی release `bd766bc` حفظ شده‌اند: اپ ۹۳/۹۳، runtime ۱۰۱/۱۰۱، Sites ۴/۴ و QA موبایل بدون overflow یا خطای تازه.

### T6-D — تأیید مستقل آمادگی ارسال استعلام

این تسک به‌صورت محلی پیاده‌سازی شد، بازآزمایی و QA نهایی آن پاس شد، در ۱۴۰۵/۰۶/۰۶ — ۲۰۲۶/۰۸/۲۸ توسط ماهیار تأیید و در release `bd766bc` منتشر شد. T7-A پس از راستی‌آزمایی همان انتشار آغاز شده است.

- Approval محتوای درخواست T6-B از `DispatchPlanApproval` مقصد و payload جدا مانده و store، شناسه، dedupe و idempotency مستقل دارد.
- فقط revision جاری و exact از `DispatchDraft` با درخواست و Content Approval معتبر می‌تواند Approval برنامه بسازد؛ snapshot مقصدها، نسخهٔ گیرنده، payload و privacy از همان revision کپی می‌شود و بازسازی از فرم یا چت انجام نمی‌شود.
- چرخهٔ محلی `pending → withdrawn → reopened → pending → approved` با history و نسخهٔ صریح ساخته شده است. Approval قدیمی پس از تغییر revision یا dependency به‌صورت مشتق‌شده `invalidated` نمایش داده می‌شود، تاریخی و فقط‌خواندنی می‌ماند و مجوز تصمیم تازه نیست.
- parser کلیدها، تاریخچه، target، snapshot، fingerprint، dedupe/idempotency و dependencyهای تاریخی را fail-closed کنترل می‌کند؛ read-error مخزن یا وابستگی‌ها ایجاد و تصمیم‌گیری را قفل می‌کند و شکست نوشتن state موفق کاذب نمی‌سازد.
- نتیجهٔ موفق فقط `actionRecord` با عنوان «تأیید محلی برنامهٔ ارسال» است و همواره `simulationOnly=true`، `externalEffect=none`، `sendAuthorized=false` و `externalActionAttempted=false` می‌ماند.
- هیچ request شبکه، مقصد واقعی، وضعیت `sent`، `sentAt`، رسید تحویل، پیام، قیمت یا اثر بیرونی ساخته نشده است. Approval واقعی ارسال آینده باید شیء و نسخهٔ مستقل تازه‌ای باشد.
- وضعیت تحویل خط مبنای release `bd766bc`: پنج سناریوی اختصاصی T6-D شامل چرخهٔ کامل، invalidation تاریخی، rollback، فساد fail-closed و chronology ناممکن پاس شدند؛ کل اپ ۹۳/۹۳، runtime ۱۰۱/۱۰۱ و Sites ۴/۴ پاس بود و QA موبایل focus/overflow/console را تأیید کرد.

### T7-A — ثبت دستی و صندوق پیشنهادها

این تسک پس از انتشار و راستی‌آزمایی same-source release `bd766bc` طبق دستور صریح ماهیار در لوکال پیاده‌سازی، آزموده و تأیید شد و سپس در release `bf59df1b82f3886794115647920b834c5e9c74dd` روی GitHub، Cloudflare Pages و ChatGPT Sites نسخهٔ ۷ same-source منتشر شد. ماهیار نسخه را مشاهده کرد و اصلاحات C-010 را خواست؛ انجام آن بازخورد مجوز شروع T7-B محسوب نمی‌شود.

- Quick Action «بررسی پیشنهادها» و ردیف صندوق در فضای پروژه یک ورودی مشترک به صندوق خصوصی پروژه دارند؛ فهرست، جزئیات و فرم ثبت/ویرایش همگی در پوستهٔ موبایل ساخته شده‌اند.
- پیشنهاد فقط با ثبت مستقیم سازنده، تماس محلی فعال/سازگار و snapshot دقیق درخواست آماده و Content Approval همان revision ساخته می‌شود؛ T6-D شرط دریافت نیست و هیچ پاسخ واقعی یا شبکه‌ای ادعا نمی‌شود.
- اصل/مرجع metadata-only فایل، رونویسی خام و دادهٔ ساختاریافته سه لایهٔ جدا هستند. قیمت، مقدار، واحد، مالیات، حمل، حداقل سفارش، موعد، اعتبار و پرداخت unknown معتبر دارند و اعداد اعشاری/بزرگ بدون تبدیل شناور نگه‌داری می‌شوند.
- store مستقل، سقف کلی/پروژه، parser سخت‌گیر، round-trip پیش از persist، write-before-state، rollback، fingerprint consistency، chronology dependency، no-op و history/revision تغییرناپذیر ساخته شده‌اند؛ تغییر dependency فقط وضعیت را تاریخی/نیازمند بازبینی می‌کند و target را rebind نمی‌کند.
- read-error ایجاد/ویرایش را قفل می‌کند؛ دست‌کاری هماهنگ fingerprint، lineage قلم/خدمت، snapshot تماس، timestamp و revision تکراری fail-closed است. ویرایش ناشناختهٔ تماس تا زمان داشتن ContactRevision رسمی نیز پذیرفته نمی‌شود.
- fixture چندپیشنهادی، استخراج، مقایسه، نرمال‌سازی، توصیه، برنده، مذاکره، سفارش، پیام، mutation درخواست/dispatch/chat و هر اثر بیرونی در این برش ساخته نشده‌اند.
- شواهد نهایی لوکال: `check:runtime` برای ۲۸ فایل، `build`، اپ ۱۰۱/۱۰۱، runtime ۱۰۹/۱۰۹، Sites ۴/۴، `npx tsc --noEmit` و `git diff --check` پاس شدند. هشدار شناخته‌شدهٔ chunk بزرگ‌تر از 500kB باقی است.
- QA مرورگر داخلی در `390 × 844` صندوق و فرم دو‌قلمی را نشان داد؛ overflow افقی سند/صفحه صفر، focus ورود فرم روی عنوان و بازگشت روی دکمهٔ افزودن، و error overlay صفر بود. سه بازبینی مستقل پس از اصلاحات نهایی blocker مادی گزارش نکردند.

### T7-B1 — نرمال‌سازی و مقایسهٔ پیشنهادهای محصول

این برش در working tree اصلی `main` پیاده‌سازی، آزموده و QA شد و انتشار نهایی آن با SHA `92dcc14b911ff7840c3816ce5345c472604bff98`، Cloudflare deployment `c5c067b2-a623-4476-a024-6f6c81be8c4a` و ChatGPT Sites نسخهٔ ۱۱/deployment `appgdep_6a926a6591608191995a04aaeab7da6` در وضعیت `succeeded` بسته شد.

- نسخهٔ اصلی هر پیشنهاد و storeهای request/approval/dispatch بایت‌به‌بایت مستقل می‌مانند؛ مقایسه و تصمیم دو شیء و دو store جدا و پروژه‌محورند.
- تعدیل مقدار/واحد، مالیات و حمل با input، فرض، mode/value و فرمول آشکار انجام می‌شود. مبلغ با decimal رشته‌ای و `BigInt`، بدون `Number/parseFloat` یا گردکردن پنهان، محاسبه می‌شود.
- دادهٔ اعلامیِ رونویسی‌شده توسط سازنده، فرض سازنده و محاسبهٔ قطعی محلی چیدا در schema و UI جدا هستند؛ متن خام مالیات/حمل و شروط غیرقیمتی کنار نتیجه باقی می‌مانند.
- دادهٔ ناقص توصیه نمی‌سازد. نتیجه فقط بر معیار آشکار `lowest-complete-normalized-total` و با وضعیت `conditional / tie / insufficient-data` است؛ تصمیم انسانی جداست و هیچ «بهترین/برنده»، خرید، ارسال یا اثر بیرونی ادعا نمی‌شود.
- revisionهای proposal/request/contact بعدی، مقایسه را بدون rebinding تاریخی/نیازمند بازبینی می‌کنند. parser ورودی و derived output را fail-closed بازسازی می‌کند؛ read-error از empty جداست و mutation را قفل می‌کند.

### T7-B2 — مقایسهٔ پیشنهادهای خدمت

- پس از بسته‌شدن receipt نهایی T7-B1، این برش در working tree اصلی ساخته، آزموده و توسط ماهیار تأیید شد. commit کد `0d633e0dbf3d9291d6bba963f64855143b5cf1ef` منتشر شد و receipt same-source نهایی با SHA `ef21c022ae28a772bbd710bc09c8f61a18db74ad`، Cloudflare deployment `4396280e-95e7-4ceb-bdf2-da720de51170` و ChatGPT Sites نسخهٔ ۱۳/deployment `appgdep_6a927e3aaec881918dc255bde7e18ba4` بسته شد.
- قرارداد مستقل خدمت، پیشنهادهای جاریِ همان target دقیق و پروژه را بر معیارهای کیفی ثابتِ دامنه، محل، حجم، صلاحیت، زمان‌بندی، روش اجرا، داخل/خارج کار، ضمانت و پرداخت کنار هم می‌گذارد. رونویسی تکمیلی و ارزیابی سازنده از اصل پیشنهاد immutable جدا و شفاف می‌مانند.
- ارزیابی هر معیار فقط وضعیت کیفیِ آشکار مانند هم‌راستا، نسبی، متفاوت، نامشخص یا نامرتبط را ثبت می‌کند و جمع‌بندی فقط آمادگی بازبینی یا نیاز به روشن‌سازی را نشان می‌دهد؛ scoring، ranking، candidate/«بهترین»، فرمول محصول، unit-price و نرمال‌سازی قیمت ممنوع‌اند.
- تصمیم انسانی، شیء پروژه‌محور و نسخه‌دارِ جدا و pin‌شده به revision دقیق مقایسه است. مقایسه و تصمیم خصوصی و محلی‌اند و هیچ شبکه، پیام، ارسال، خرید، مجوز یا اثر بیرونی نمی‌سازند.
- چهار regression متمرکز T7-B2 ماتریس ۱۰×۲ و lineage/countهای مستقل، تصمیم جدا و reload/no-network/source-byte invariants، unknown همراه رونویسی و rollback، no-op/version/invalidation و tamper/read-error fail-closed را پوشش می‌دهند. QA مرورگر داخلی در `390 × 844` نام‌های دسترس‌پذیر «معیار + مجری»، جمع‌بندی بدون نامزد، تصمیم انسانی، console پاک و overflow افقی صفر در editor/detail/document را تأیید کرد.

### T8-A — مذاکرهٔ کنترل‌شده از دید سازنده

- **T8-A1 — تأییدشده و منتشرشده:** ثبت دستی یک پیش‌نویس خصوصی و ارسال‌نشدهٔ سؤال، pin‌شده به revision/fingerprint دقیق مقایسه، درخواست، پیشنهاد، قلم محصول یا معیار واجدشرایط خدمت و snapshot تماس ساخته شده است. هدف و متن اجباری، version/history تغییرناپذیر، no-op، rollback، read-error lock، project isolation و بازگشت/focus به همان منشأ پوشش داده شده‌اند.
- CTA هدف دارای رکورد، همان پیش‌نویس موجود را باز می‌کند. تغییر dependency رکورد را تاریخی/نیازمند بازبینی می‌کند و rebind خاموش ندارد. معیارهای خدمت فقط در وضعیت نسبی، متفاوت یا نامشخص واجد شروع سؤال هستند؛ قلم محصول سؤال اختیاری سازنده دارد.
- این برش همواره private/local و `externalEffect=none` است؛ هیچ پیام، پاسخ، API، AI، شبکه، اعلان، تأیید ارسال، اطلاع‌رسانی توسط چیدا یا اثر بیرونی ندارد. فیلد `supplierNotified=false` فقط همین نبود اطلاع‌رسانی توسط چیدا را بیان می‌کند و دربارهٔ تماس احتمالی بیرون از چیدا ادعا ندارد. ماهیار آن را تأیید کرد و release کد اولیه با commit `1d6721da9bfbadc04f4ecdd4c5bbb94de4c6c8e1` روی GitHub `main`، Cloudflare deployment `fd8a2414-20c4-48d3-8100-fdbabf5db5df` و ChatGPT Sites نسخهٔ ۱۴/deployment `appgdep_6a9294c72bf88191ac00717221609da7` موفق بود؛ receipt مستندی نهایی بعداً با SHA `2d72f5bbe86eab6c975a7beb2bd72ffc38c7e9ba`، Cloudflare deployment `806f7378-facb-411a-b9fa-f8febdaac62b` و Sites نسخهٔ ۱۵/deployment `appgdep_6a9295dd273c819195e5bde8cf2886bc` بسته شد.
- شش regression T8-A1، اپ ۱۱۸/۱۱۸، runtime ۱۲۶/۱۲۶، Sites ۴/۴، build/TypeScript، integrity ۲۸ فایل و `git diff --check` پاس شدند. QA مرورگر داخلی `390 × 844` focus دقیق editor/error/detail/origin، بازکردن رکورد موجود، eligibility CTA، overflow صفر در editor/detail/list/document، console پاک و overlay صفر را تأیید کرد. بازبینی مستقل نهایی P0/P1/P2 نداشت.
- **T8-A2 — تأییدشده، منتشرشده و بسته‌شده:** یک `BuilderManualNegotiationResponseRecord` مستقل برای هر revision دقیق سؤال پیاده‌سازی شده است. متن فقط رونویسی خصوصی سازنده است؛ سؤال در چیدا ارسال نشده، پاسخ در چیدا دریافت نشده و هویت، زمان، کانال و اصالت طرف مقابل تأیید نمی‌شوند. رکورد تاریخی rebind نمی‌شود، ویرایش فقط اصلاح همان رونویسی است و مسیر ارسال/دریافت واقعی وجود ندارد. هفت regression متمرکز، اپ ۱۲۵/۱۲۵، runtime ۱۳۳/۱۳۳، Sites ۴/۴ و QA موبایل پاس شدند؛ receipt نهایی SHA `5357fc503df57f51bd4659401399f1b3b76a0caa`، Cloudflare deployment `4ae8e8ee-bc2d-4b44-b542-7bffe7332181` و ChatGPT Sites نسخهٔ ۱۷/deployment `appgdep_6a92b60a7f848191bc8de2ac805a2934` same-source منتشر شدند.
- **T8-A3 — تأییدشده، منتشرشده و بسته‌شده:** یک `BuilderManualNegotiationResponseReviewRecord` مستقل به revision/fingerprint دقیق پاسخ T8-A2 pin می‌شود؛ سؤال T8-A1 از snapshot تغییرناپذیر همان پاسخ به ارث می‌رسد. outcome و دلیل فقط قضاوت صریح سازنده‌اند؛ نسخه/history، no-op، rollback، tamper/read-error fail-close، project isolation، historical/no-rebind و تفکیک lock بازبینی از پاسخ سالم پوشش داده شده‌اند. هفت regression، اپ ۱۳۲/۱۳۲، runtime ۱۴۰/۱۴۰، Sites ۴/۴، build/TypeScript، QA موبایل و بازبینی مستقل بدون finding باز P0/P1/P2 پاس شدند. receipt نهایی `0b8810683dd5c35819397cea95c7ff01e3ce9c95` در هر سه مقصد same-source منتشر شد؛ AI، تشخیص خودکار، شبکه، پیام مشترک، احراز طرف مقابل، اصلاح خودکار پیشنهاد یا اثر بیرونی در این برش وجود ندارد.
- **T8-A4 — تأییدشده و منتشرشده:** یک `BuilderManualNegotiationConditionImpactRecord` خصوصی و نسخه‌دار به revision/fingerprint دقیق پاسخ T8-A2 pin می‌شود. خلاصهٔ تغییر، حوزه، جهت اثر و دلیل فقط ارزیابی کیفی سازنده‌اند؛ lineage از snapshot پاسخ به ارث می‌رسد و تغییر review خواهر T8-A3 آن را stale نمی‌کند. هفت regression، اپ ۱۳۹/۱۳۹، runtime ۱۴۷/۱۴۷، Sites ۴/۴، build/TypeScript، integrity ۲۸ فایل و QA واقعی `390 × 844` پاس شدند. `automatedCalculationUsed=false`، `automatedDetectionUsed=false`، `aiUsed=false`، `networkUsed=false`، mutation پیشنهاد/مقایسه false و `externalEffect=none` ثابت‌اند. ماهیار نسخه را تأیید کرد و snapshot یکپارچه با commit کد `00a97a116a0115f6ffdae06579ded8fa64eb8c60` منتشر شد.
- **T8-A5a — تأییدشده و منتشرشده:** نمای فقط‌خواندنی مقایسهٔ دو revision دقیق یک پیشنهاد محصول، با baseline قدیمی‌تر و candidate جدیدتر، نمایش id/version/fingerprint و delta قطعی فیلدهای سطح پیشنهاد و اقلام ساخته شده است. همهٔ مقادیر declared دقیق‌اند، `null` از literal کاربر جداست و جفت نامعتبر بدون fallback fail-close می‌شود؛ arithmetic، score، recommendation، storage/history تازه، amendment، AI، شبکه، mutation و اثر بیرونی ساخته نمی‌شوند. هفت regression متمرکز، app ۱۴۶/۱۴۶ و QA واقعی `390 × 844` پاس شده‌اند؛ شکست قبلی Carousel زیر بار CPU بیرونی پس از آزادشدن CPU با اجرای isolated همان تست و نتیجهٔ ۱/۱ بسته شد، بدون تغییر runtime. ماهیار نسخه را تأیید کرد و snapshot یکپارچه با commit کد `00a97a116a0115f6ffdae06579ded8fa64eb8c60` منتشر شد.
- **T8-A5b — منتشرشده برای مشاهده؛ تأیید تجربه باز:** نمای T8-A5a برای proposal خدمت به‌صورت service-aware تعمیم یافته است. هر revision دقیقاً یک line با `requestItemId=null` و `serviceSpecId` منطبق بر snapshot درخواست دارد؛ سه فیلد revision و سیزده فیلد line بدون arithmetic مقایسه می‌شوند و ده معیار T7-B2 به این لایه آمیخته نمی‌شوند. focused ۷/۷، app ۱۵۳/۱۵۳، runtime ۱۶۱/۱۶۱، Sites ۴/۴، build/TypeScript، integrity ۲۸ فایل و QA واقعی `390 × 844` پاس‌اند؛ no-storage/no-network/no-mutation و fail-close پوشش داده شده‌اند. snapshot یکپارچه با commit کد `00a97a116a0115f6ffdae06579ded8fa64eb8c60` برای مشاهده منتشر شد؛ تأیید تجربه باز است.
- **T8-UX1 — منتشرشده برای مشاهده؛ تأیید تجربه باز:** کل journey پیشنهاد سازنده با زبان انسانی و افشای تدریجی ساده شد: یک CTA اصلی در صندوق، فرم ساده/پیشرفته با حفظ داده، خلاصهٔ قیمت/زمان/اعتبار پیش از جزئیات، diff تغییرات‌اول و مقایسه/مذاکرهٔ کم‌متن. قرارداد داده، provenance، history، fail-close، project isolation و بازگشت focus حفظ شدند. دو regression تازه، app ۱۵۵/۱۵۵، runtime ۱۶۳/۱۶۳، Sites ۴/۴، build/TypeScript، integrity ۲۸ فایل و QA واقعی `390 × 844` پاس‌اند. snapshot یکپارچه با commit کد `00a97a116a0115f6ffdae06579ded8fa64eb8c60` برای مشاهده منتشر شد؛ تأیید UX باز است.
- **باقی‌ماندهٔ T8-A:** پاسخ واقعی/مشترک طرف دوم، محاسبهٔ عددی/فرمول‌دار اثر در صورت تعریف قرارداد آن، amendment رسمی/shared یا پیشنهاد تازهٔ احرازشده و پیگیری موعد باقی مانده‌اند. diff محلی revisionهای رونویسی‌شدهٔ محصول و خدمت با T8-A5a/T8-A5b پوشش داده شده است. مسیر مشترک یا ارسال آینده مقصد، محتوای دقیق، نسخه و Approval مستقل می‌خواهد؛ نمونهٔ `Mock` فقط در Demo جدا و بدون mutation مجاز است.

### T8-UX2 — خلوت‌سازی رسانه، حافظه و درخواست خرید

- رابط عکس، فایل و حافظه کم‌متن و خواناتر شد؛ منشأ/نسخه/وضعیت/دسترسی از نمای عادی حذف، اما invariants داده و fail-close حفظ شدند.
- عکس فقط در گالری و سند فقط در «فایل‌ها»ست. سند تازهٔ منتخب پس از تطبیق پسوند/MIME به‌صورت Blob با MIME canonical در IndexedDB همان مرورگر ذخیره و با لمس ردیف باز می‌شود؛ رکورد قدیمی `metadata-only` پس از انتخاب فایل پشتیبانی‌شده‌ای با نام و اندازهٔ ثبت‌شده قابل‌بازشدن است و این تطبیق، اصالت یا برابری محتوا را تأیید نمی‌کند.
- جریان اصلی خرید «ثبت نیاز → انتخاب تأمین‌کننده‌های ثبت‌شده → تأیید نهایی در کارها» است. قراردادهای T6-B/T6-C/T6-D پشت همین مسیر حفظ می‌شوند و payload/شناسه‌های فنی پیش‌فرض دیده نمی‌شوند.
- «مرتبط‌بودن» تأمین‌کننده و ارسال واقعی تا فاز تأمین‌کننده/شبکه ساخته نشده‌اند؛ تأیید کارها همچنان شبیه‌سازی محلی بدون اثر بیرونی است.
- وضعیت تحویل: commit کد `a08c93edefad6cc79bc7bb1f83a023730a2ef06f` در GitHub، Cloudflare deployment `c25eaefe-e43a-466f-9e7b-d268fe63bb7e` و ChatGPT Sites نسخهٔ ۲۲/deployment `appgdep_6a93f1adf4788191999f921e914d39c7` منتشر است. build/TypeScript، integrity هر ۲۸ فایل، focused امنیت فایل ۲/۲، focused T8-UX2 برابر ۶/۶، رسانه/فایل/حافظه برابر ۲۰/۲۰، app برابر ۱۵۸/۱۵۸، runtime برابر ۱۶۶/۱۶۶ و Sites برابر ۴/۴ پاس‌اند. QA واقعی `390 × 844` overflow افقی و console error ندارد و بازبینی مستقل finding باز P0/P1/P2 ندارد.

### T8-UX3 — پولیش خانه و Quick Action

- کنترل بالای پروژه و دکمهٔ پروژه در نوار پایین فقط نام را نشان می‌دهند؛ affordance دیداری و accessible name حفظ شده و متن‌های تکراری/فلش حذف شده‌اند.
- Quick Action خانه یک Carousel موجود و تغییرنیافته با wrapper جهت LTR و track محتوای RTL است. rail ده chip دارد، در ورود و بازگشت به ابتدای RTL هم‌تراز می‌شود و overflow فقط داخل rail است؛ قاعدهٔ تاریخی grid در C-010 برای این خانه منسوخ است.
- در snapshot تاریخی T8-UX3 هشت مقصد واقعی و دو starter وجود داشتند. PB-1 اکنون starter «چیدن برنامه خرید» را با مقصد واقعی «برنامه پروژه» جایگزین کرده است؛ فقط «شروع صورت‌جلسه» draft Composer می‌سازد.
- نشان PNG اختصاصی CHIDA جای آیکون عمومی را گرفته و متن‌های خانه scoped درشت‌تر شده‌اند. مدل، شبکه، ارسال، matching، مسیر تأمین‌کننده، runtime محافظت‌شده و قرارداد دادهٔ مقصدها تغییر نکرده‌اند.
- وضعیت تحویل: focused نهایی ۵/۵، app برابر ۱۵۹/۱۵۹، runtime برابر ۱۶۷/۱۶۷، Sites برابر ۴/۴، build/TypeScript، integrity ۲۸ فایل و QA `390 × 844` پاس‌اند؛ `design-qa.md` نتیجهٔ `passed` دارد و بازبینی مستقل finding باز P0/P1/P2 ندارد. commit کد `3e4b35fe08b02918e4be814d5d796da14bfa54ca` در GitHub، Cloudflare deployment `9b78e089-e0f5-427b-b788-9221b908ef7d` و ChatGPT Sites نسخهٔ ۲۴/deployment `appgdep_6a940cbe06d48191912661b9e4ec4615` منتشر است.

### T8-B — رضایت تبادل تماس و بستن پرونده

- پیش‌نمایش اطلاعات تماس، درخواست رضایت و پایان‌های معتبر پرونده نمایش داده شوند.
- رضایت طرف دوم تا فاز تأمین‌کننده فقط در Demo جدا، فقط‌خواندنی و صریحاً `Mock` نمایش داده می‌شود و در پروندهٔ ماندگار ثبت نمی‌شود.
- پایان مسئولیت چیدا صریح باشد؛ پرداخت، قرارداد، تضمین، حمل، تحویل و اختلاف اجرا نمی‌شوند.

### T9-A — عمق مدیریت و فضای پروژه

- **بخشی تکمیل در C-010:** ویرایش پایهٔ عنوان/گام/موعد کار، تاریخچهٔ `updated`، no-op و rollback ساخته شد؛ موارد زیر هنوز باقی‌اند.
- نقطهٔ عطف و مرحله، تصمیم و دلیل، دستورالعمل نسخه‌دار پروژه و قابلیت‌های فعال.
- وظیفه با اولویت، وابستگی سبک و تاریخچهٔ عمیق‌تر؛ افراد/مسئول فقط در حد ساده.
- ساخت پروژهٔ بعدی، تغییر زمینه، بایگانی امن و سیاست حذف.
- مدیریت کامل منابع، زمان‌بندی حرفه‌ای و تیم سازمانی خارج از این فاز است.

### T9-B — پایش، اعلان و تکمیل مرکز کارها

- موعد پاسخ، انقضای پیشنهاد، درخواست بی‌پاسخ و آستانهٔ زمان. پایش هزینه فقط پس از وجود دادهٔ مالی T12 فعال شود.
- دلیل، آخرین اجرا، اجرای بعدی، خاموش‌کردن، توقف، شکست و retry دیده شوند.
- تا نبود worker/backend فقط «بررسی هنگام بازشدن مرکز کارها یا وقتی همان مرکز در صفحهٔ باز و قابل‌دیدن است» ادعا شود؛ نه اجرای تب بسته/پنهان یا پس‌زمینهٔ دائمی.
- Brief به دادهٔ واقعی محلی متصل شود.

### T9-C — دامنه‌های حافظهٔ سازنده

- حافظهٔ شخصی سازنده از حافظهٔ پروژه جدا شود و منشأ، تاریخ، اصلاح، حذف و منع استفاده داشته باشد.
- حافظهٔ پروندهٔ درخواست/مذاکره فقط به همان `caseId` محدود و بخش خصوصی/مشترک آن تفکیک شود.
- حافظهٔ رویه‌ای فقط به‌صورت instruction یا workflow نسخه‌دار و با مالک روشن ساخته شود؛ system prompt آزاد و سراسری ساخته نشود.
- هیچ موردی خودکار از چت، فایل، پیشنهاد یا خروجی مدل به حافظه تبدیل نشود و تست نشت میان پروژه/پرونده الزامی است.

### T10 — Report ماندگار و «امروز پروژه»

- Report تاریخ‌دار، نسخه‌دار و متصل به پروژه، مرحله، فایل، تصمیم، کار و درخواست باشد.
- «امروز پروژه» فقط موارد واقعی و قابل‌اقدام را خلاصه کند، نه fixture ثابت یا داشبورد تزئینی.
- آمار یا تحلیل ساختگی فقط با برچسب `Mock` مجاز است.

### T11 — ورودی چندرسانه‌ای، چرخهٔ فایل و SourceRecord

- پیوست Composer واقعاً به draft همان پیام متصل بماند؛ کتابخانهٔ پروژه جای پیوست جا زده نشود.
- عکس، چندفایل و صدا پیش‌نمایش، حذف پیش از ارسال، منشأ و رضایت استفاده داشته باشند.
- فایل lifecycle نسخه، rename، حذف/بازیابی و خطای quota داشته باشد.
- T8-UX2 فقط نگه‌داری و بازکردن محلی سند منتخب را مجاز کرده بود. SI-1 اکنون متن دقیق و کل asset منتخب Composer را به‌صورت `SourceRecord` پروژه‌محور و قابل‌بازشدن ثبت می‌کند؛ Blob در IndexedDB و metadata در `localStorage` جدا می‌مانند. سیاست کامل حجم، quota، retention، حذف/بازیابی، migration، چندفایل و ورودی غیرقابل‌اعتماد همچنان بدهی T11 است و هیچ parser یا extraction فعال نیست.
- `SourceRecord` فعلی whole-text/whole-asset است، نه locator صفحه/بخش یا ادعای خواندن محتوا. Source صفحه‌/بخش‌محور فقط پس از extraction معتبر ساخته می‌شود؛ مدل به‌تنهایی منبع نیست.
- یک برش مستقل تحقیق فنی، منابع دستیِ واقعی را با URL/منشأ/تاریخ و بدون خلاصهٔ AI نمایش دهد؛ وب عملیاتی تا وجود ابزار کنترل‌شده و قرارداد حریم صریحاً integration موکول‌شده است و پایان فاز سازنده به معنی آمادگی production این قابلیت نیست.
- هیچ فایل، عکس یا حافظه‌ای خودکار وارد context آیندهٔ مدل نشود.

### T12 — مالی سبک، افق دوم

- بودجه، هزینهٔ ثبت‌شده، تعهد اعلامی، سررسید، بودجه/واقعیت، جریان نقدی ساده و هشدار انحراف/آستانهٔ هزینه.
- فرمول، واحد، منشأ و مقدار نامعلوم روشن باشند.
- حسابداری رسمی، بانک، پرداخت، ERP و صورت‌وضعیت رسمی ساخته نشوند.

### T13 — فهرست تاریخی بدهی‌های سازنده؛ ورودی acceptance matrix

این عنوان دیگر یک gate یک‌تکه و مستقل نیست. موارد زیر باید در سه سند تفصیلی آینده به acceptance matrix دودویی Builder Prototype Architecture Gate نگاشت، به یکی از پنج برش کوچک سازنده تخصیص یا با دلیل و تأیید صریح ماهیار defer شوند.

- پیام‌های چت به `projectId` محدود شوند؛ پاسخ دیررس یا تعویض پروژه هرگز نشت نسازد.
- Draft در قطع کوتاه ارتباط حفظ و وضعیت اتصال روشن شود.
- Build دارای نسخه، ویرایش، غیرفعال‌سازی، حذف و rollback شبیه‌سازی‌شده شود.
- خروجی‌گیری و حذف دادهٔ محلی، پاک‌کردن جداگانهٔ دادهٔ نمونه، migration همهٔ storeها و خطای quota پوشش داده شوند.
- PWA/manifest/installability ابتدا read-only بررسی شود و سپس یا واقعاً پیاده‌سازی و آزمون شود یا defer آن با تأیید صریح ماهیار ثبت شود؛ offline AI ادعا نشود. اگر رفع آن به فایل محافظت‌شده نیاز داشت، فقط پس از مجوز صریح تغییر runtime و به‌روزرسانی lock hash انجام شود.
- ردیف‌ها و کنترل‌های بی‌عمل یا واقعاً ساخته شوند یا صریحاً «به‌زودی»/غیرفعال باشند.
- `README.md` و `prototype/README.md` با T5/T6 و مرزهای نهایی فاز هم‌تراز شوند.
- QA نهایی Mobile/Dark در `390 × 844`، دسترس‌پذیری، فوکوس، کیبورد، متن RTL/LTR، ارقام و overflow انجام شود.
- یک مسیر E2E سازنده با دادهٔ واقعی محلی و یک مسیر مستقل با `Mock` اجرا شود.
- فقط پس از PASS شدن Builder Prototype Architecture Gateِ تفکیک‌شده و تأیید صریح ماهیار، M1a آغاز می‌شود؛ صرف بسته‌شدن عنوان تاریخی T13 یا چند آیتم پراکنده مجوز شروع مدل نیست.

## بدهی‌ها و affordanceهای نیمه‌کارهٔ شناخته‌شده

- عدد پین‌شده‌ها واقعی نیست؛ «گفتگوی تازه»، پین‌ها، جست‌وجوی گفتگو و امکانات چیدا ظاهر فعال دارند اما رفتار کامل ندارند. Settings اکنون فقط وضعیت‌های واقعی را نمایش می‌دهد؛ usage/token/billing/quota تا اتصال منبع معتبر عمداً نامتصل‌اند.
- دوربین، گالری و فایل Composer اکنون یک attachment واقعی همان draft می‌سازند؛ چندفایل و Voice handler هنوز وجود ندارند.
- Quick Action «پیشنهادها» صندوق دستی T7-A و «برنامه پروژه» Project Backbone را باز می‌کنند؛ فقط «شروع صورت‌جلسه» هنوز draft متن می‌سازد. خود Quick Action یک rail افقی dragپذیر با overflow داخلی است؛ فیلترهای کار همچنان grid بدون overflow صفحه‌اند.
- «دستیار فنی» در Tools رفتار واقعی ندارد.
- draftهای Composer در نشست جاری بر اساس پروژه جدا هستند و intakeهای commit‌شده از Source envelope پس از reload بازسازی می‌شوند؛ persistence یک thread کامل، پاسخ مدل و تاریخچهٔ مستقل گفت‌وگو هنوز وجود ندارند و پاسخ فعلی canned و غیرمرجع است.
- لغو/بازگشایی Approval محلی برنامهٔ ارسال در T6-D ساخته شده است؛ این چرخه به Approval محتوای درخواست یا مجوز ارسال واقعی تعمیم داده نمی‌شود.
- خدمت، چندقلمی و سؤال روشن‌سازی در T6-B2، گیرنده/DispatchDraft محلی در T6-C و Approval محلی برنامه در T6-D ساخته شده‌اند؛ ارسال یا شبکهٔ واقعی وجود ندارد. attachment عمومی Composer در SI-1 ساخته شده، اما پیوست دامنه‌ای خود درخواست خرید و confidence واقعی فقط پس از قرارداد و extraction معتبر می‌آیند.
- سند تازهٔ منتخب در همان مرورگر قابل‌بازشدن است؛ رکورد قدیمی `metadata-only` برای دسترسی به محتوا نیاز به انتخاب فایل پشتیبانی‌شده‌ای با نام و اندازهٔ ثبت‌شده دارد و اصالت محتوا تأیید نمی‌شود. SourceRecord محلی متن/asset Composer اکنون فعال است؛ آپلود، sync، backup، استخراج/OCR، جست‌وجوی محتوا، locator صفحه/بخش و پاسخ منبع‌دار واقعی همچنان غیرفعال‌اند.
- Brief موفق اکنون صفحه را می‌بندد و شکست را صریح نگه می‌دارد، اما هنوز Report واقعی نیست؛ Build نیز چرخهٔ کامل نسخه/حذف ندارد.
- READMEهای ریشه و prototype از T5/T6 عقب‌اند و در یک تسک مستندی باید هم‌تراز شوند.

## فاز ۲ — اتصال آزمایشی مدل محلی پس از پایان سازنده

### وضعیت فنی اثبات‌شده

- Ollama نسخهٔ `0.32.15` روی `127.0.0.1:11434` و فقط loopback فعال است.
- مدل محلی: `gemma4:26b-mlx`، 26.2B، `safetensors`، `nvfp4`، حدود 17.55GB.
- metadata مقدار معماری 262,144 token را اعلام می‌کند؛ این مقدار ظرفیت عملی تأییدشده روی مک نیست.
- CORS مبدأ `http://127.0.0.1:5173` پذیرفته شد.
- probe فارسی با `think:false` موفق بود؛ cold load حدود ۷ ثانیه و کل درخواست حدود ۸.۱ ثانیه بود و سپس مدل unload شد.
- هیچ کد یا config پروتوتایپ هنوز به مدل وصل نشده است.

### ترتیب تسک‌های مدل

1. **M1 — PRD و قرارداد ارزیابی:** interface، سیاست context/retention، timeout/fallback، eval و threat model؛ سپس گسترش صریح editing boundary برای ماژول model.
2. **M2 — ModelGateway:** قرارداد provider-neutral و `OllamaLocalAdapter`؛ feature پیش‌فرض خاموش، endpoint ثابت و allowlist سخت literal `127.0.0.1`، رد URL یا LAN قابل‌تنظیم، خاموشی compile/runtime در hosted build، health، cancel، timeout، سقف context/output/concurrency، `keep_alive`، schema و failure union. نسخهٔ Ollama، نام و digest مدل در گزارش eval ثبت شوند و reasoning خام هرگز نمایش داده نشود.
3. **M3 — چت متن ساده:** فقط همان پیام صریح کاربر، بدون history/حافظه/فایل/وب/tool؛ loading/error/retry و برچسب «مدل محلی آزمایشی · بدون منبع».
4. **M4 — context manifest و opt-in:** کاربر دقیقاً ببیند چه حافظه یا منبعی قرار است وارد context شود؛ `useInContext=true` به‌تنهایی مجوز ارسال همهٔ حافظه‌ها نیست.
5. **M5 — پاسخ منبع‌دار واقعی:** فقط با `SourceRecord` بازیابی‌شده و قابل‌بازشدن؛ `sources=[]` برای خروجی بدون منبع.
6. **M6 — استخراج ساختاریافتهٔ نیاز:** خروجی schema-validated، confidence و تأیید انسان؛ هیچ mutation مستقیم توسط مدل.
7. **M7 — ارزیابی و سخت‌سازی:** فارسی ساخت، hallucination، source honesty، prompt injection، نشت پروژه، timeout/cancel، cold/warm latency و مصرف RAM.

مرز مدل: context اولیه 2k–8k، output محدود، concurrency برابر یک، timeout صریح، `think:false` در برش اول، ابزارها خاموش، loopback فقط، بدون bind روی LAN، بدون secret، بدون cloud fallback، بدون ذخیره یا اقدام بیرونی. خروجی مدل دادهٔ غیرقابل‌اعتماد است و فقط escaped/plain text رندر می‌شود. buildهای Cloudflare/Sites قابلیت را خاموش نگه می‌دارند؛ E2E عادی از adapter قطعی استفاده می‌کند و تست واقعی Ollama opt-in و خارج CI است.

## فاز ۳ — مسیر تأمین‌کننده

1. S1: مسیر دقیق `نقش تأمین‌کننده → موبایل → OTP → ساخت فروشگاه`؛ نقش حساب تغییرناپذیر و بدون switch.
2. S2: فضای فروشگاه، هویت، دسته‌ها و محدودهٔ خدمت در تهران.
3. S3: کاتالوگ محصول/خدمت، فایل، تصویر، نسخهٔ قیمت، اعتبار، موجودی یا ظرفیت.
4. S4: صف درخواست‌های ورودی با نمایش فقط دادهٔ صریحاً مشترک‌شده.
5. S5: روشن‌سازی، تطبیق با کاتالوگ و پیش‌نویس پیشنهاد.
6. S6: بازبینی و تأیید نسخهٔ قیمت/شرایط پیش از ارسال؛ حاشیه سود، قیمت خرید، مشتری دیگر و قواعد تخفیف خصوصی می‌مانند.
7. S7: نسخهٔ پیشنهاد، پاسخ، پیگیری، کارها و «امروز فروش».
8. S8: پروندهٔ مشترک، مذاکره و رضایت دوطرفه برای تبادل تماس.
9. S9: آزمون E2E دوطرفه با جداسازی `projectId`/`storeId`، سه قلمرو حریم، نسخه، idempotency و تأیید انسان.
10. S10: خروجی‌گیری/حذف، migration، شکست storage، quota، reset جداگانهٔ Mock، a11y و QA نهایی موبایل تأمین‌کننده.

تا زمانی که backend و پروندهٔ مشترک واقعی ساخته نشده‌اند، جریان‌های میان سازنده و تأمین‌کننده محلی می‌مانند: دادهٔ دستی هر نقش فقط در فضای خودش ذخیره می‌شود و Demoهای `Mock` جدا و بدون mutation هستند. هیچ ارسال، دریافت، رضایت یا همگام‌سازی واقعی ادعا نمی‌شود.

## تصمیم‌های تغییرناپذیر فعلی

- فارسی، RTL، Mobile-first، فقط Dark و هدف `390 × 844`؛ دسکتاپ طراحی مستقل آینده است.
- هر حساب دقیقاً یک نقش تغییرناپذیر دارد؛ تعارض «هر دو نقش» در سند مادر به نفع تصمیم صریح کاربر باز می‌ماند.
- فعلاً فقط تهران؛ در onboarding آدرس دقیق گرفته نمی‌شود.
- ترتیب مرحله‌های ساخت همان نه عنوان ثبت‌شده در `AGENTS.md` است.
- خانه Chat-first؛ Drawer از راست، نام پروژه در کنترل بالایی و پایینی، Quick Action به‌صورت rail افقی dragپذیر با overflow داخلی و محتوای RTL، Composer خلوت و نوار پروژه/ابزار چسبیده زیر آن. صفحهٔ اصلی خودش overflow افقی ندارد.
- ساخت پروژه فقط از داخل مجموعهٔ «پروژه‌ها» انجام می‌شود؛ میان‌بر مستقل در header، پایین چت یا خود Drawer ساخته نمی‌شود.
- نام mode داخل Composer نوشته نمی‌شود؛ `+` و gauge راست، میکروفون و فلش ارسال چپ.
- هر شیء باید owner/scope معتبر و متناسب با قرارداد خودش، نسخه، write-before-state و رفتار fail-close داشته باشد. فایل، جست‌وجوی پروژه، Task، درخواست و Approval پروژه‌محورند؛ Memory Core علاوه بر `project_private` دامنهٔ `account_private` دارد و هیچ‌کدام مستقیماً shared نیستند.
- read-error با empty state یکی نیست و mutation مخزن ناخوانده تا load موفق مسدود می‌شود.
- `Mock` در entry، banner، card، detail و accessible name آشکار است و با دادهٔ واقعی یا چت ادغام نمی‌شود.
- هر اقدام بیرونی preview مقصد/محتوا/نسخه و تأیید انسان می‌خواهد؛ پرداخت، قرارداد، تضمین، حمل، تحویل و حل اختلاف خارج از محصول‌اند.
- مدل provider-neutral، خروجی حساس منبع‌دار/تاریخ‌دار/دارای عدم‌قطعیت و fallback صریح است.

## ریتم ثابت هر تسک

1. وضعیت فعلی را در مرورگر داخلی و `390 × 844` مشاهده کن.
2. بخش مرتبط سند مادر، بک‌لاگ و دفتر یادگیری را بخوان.
3. ابتدا تست مرتبط را اضافه/اصلاح و gap را اثبات کن.
4. تغییر را کوچک و فقط در مرز مجاز انجام بده؛ runtime محافظت‌شده را تغییر نده.
5. رابط را برای drag/tap، keyboard/focus، target لمسی، RTL/LTR، a11y و overflow بررسی کن.
6. دفتر یادگیری را پیش از تحویل و دوباره پس از بازخورد/تأیید به‌روزرسانی کن.
7. هنگام توسعه فقط بررسی‌های متمرکز متناسب با ریسک را اجرا کن؛ پس از نهایی‌شدن همهٔ کد، سند و QA، `npm run gate:release` را دقیقاً یک‌بار روی candidate نهایی اجرا کن. این فرمان build/integrity/TypeScript، کل Playwright، Sites و `git diff --check` را یکجا می‌بندد و نباید با اجرای جداگانهٔ دوبارهٔ همان suiteها تکرار شود.
8. مشاهده، ذخیرهٔ محلی، Git و انتشار را جدا گزارش کن.
9. بدون درخواست صریح commit، push، merge یا deploy نکن.

## متن کوتاه آماده برای آغاز گفت‌وگوی جدید

> این تسک ادامهٔ مستقیم پروژهٔ CHIDA در checkout اصلی `/Users/mahyarkl/Desktop/ChatGPT/CHIDA` و شاخهٔ `main` است؛ worktree جدا نساز. ابتدا `AGENTS.md`، `prototype/AGENTS.md`، `CHIDA-CONTINUATION-HANDOFF-FA.md`، بخش‌های H2/MC-1/SI-1/TM-1/REL-1/BL-1/BG-GATE-1/BG-F1 تا BG-F6 و بازخوردهای انتهایی در `CHIDA-PRODUCT-LEARNINGS-FA.md`، سند مادر، backlog و artifact گیت را بخوان. رسید terminal داخل پیام آغازین همین گفت‌وگو منبع SHA، fingerprint، GitHub/Cloudflare/Sites و owner-only بودن انتشار BG-F6 است و وضعیت freeze داخل repo را supersede می‌کند. وضعیت Git را read-only تطبیق بده و تا پیام بعدی هیچ edit، test، gate، commit، push یا deploy انجام نده. Builder Gate کامل همچنان `FAIL` و rerun نشده است؛ remediation بعدی، مدل، backend، sync، شبکه/ارسال و مسیر تأمین‌کننده نیز مجاز نیستند.

## سابقهٔ اصلاح منتشرشده — بازیابی امن درخواست خرید ناخوانا

این بخش یک سابقهٔ تاریخی است؛ baseline منتشرشدهٔ جدیدتر snapshot ترکیبی SI-1/TM-1 با receipt ثبت‌شده در بالای همین هنداف است.

- **محرک:** ماهیار در preview لوکال گزارش کرد درخواست‌های خرید قابل‌ثبت نیستند و با پیام «درستش کن» اصلاح را مجاز کرد. علت، read-error مخزن `PurchaseRequest` و قفل fail-close درست، اما بدون مسیر recovery بود؛ این رفتار disable عمدی قابلیت نبود.
- **زمینهٔ محفوظ:** بستهٔ اسناد تأییدشده و برش PB-1 دست‌نخورده ادامه دارند. این hotfix همراه PB-1 و اصلاح RTL در source commit `bcb22465c0f6e1f04252c40a65f6249a5084ff6b` منتشر شده است.
- **وضعیت کد:** در `prototype/src/Prototype.tsx` مسیر backup-first و دوگامی اضافه شد؛ در `prototype/src/prototype.css` حالت‌های هشدار/sheet/موفقیت، کنتراست و RTL فرم PB-1 اصلاح شدند؛ در `prototype/tests/chida-flow.spec.ts` نه سناریوی recovery و regression RTL افزوده شد؛ و قرارداد ماندگار آن در `prototype/AGENTS.md` ثبت شد. تغییرها روی `main` در GitHub و هر دو مقصد میزبانی منتشر شده‌اند.
- **قرارداد:** recovery یک snapshot واحد از raw موجود می‌گیرد؛ اگر معتبر شده باشد فقط reload می‌کند. اگر نامعتبر باشد، backup یکتای بایت‌به‌بایت تأییدشده و recovery intent ماندگار را پیش از remove می‌سازد، تغییر نکردن source را دوباره می‌سنجد، فقط primary را خالی می‌کند، empty معتبر را بررسی می‌کند و سپس intent را پاک و UI را باز می‌کند. شکست‌های میانی rollback یا resume پس از reload دارند و mutation در هر وضعیت نامطمئن بسته می‌ماند.
- **حفظ داده‌های دیگر:** Approvalها، گیرنده‌ها، DispatchDraftها، برنامه‌های ارسال، پیشنهادها و سایر storeها هدف recovery نیستند و در تست موفق bytes آن‌ها بدون تغییر ماند.
- **شواهد:** focused recovery برابر ۹/۹، app برابر ۱۷۷/۱۷۷، runtime برابر ۱۸۵/۱۸۵، Sites برابر ۴/۴ و build/TypeScript/integrity هر ۲۸ فایل پاس شدند. بازبینی مستقل نهایی finding باز P0/P1/P2 نداشت. ریسک باقیماندهٔ ثبت‌شده، پنجرهٔ کوچک cross-tab میان آخرین source-check و remove در writerهای قدیمیِ بدون Web Lock مشترک است.
- **بدهی lifecycle:** backup محلی فعلاً UI مشاهده، restore انتخابی، export، حذف یا retention ندارد و نباید با backup کامل محصول یا sync اشتباه شود.
- **وضعیت مرورگر واقعی:** پس از QA اولیه و لغو بدون تغییر، ماهیار صریحاً گفت دادهٔ مهمی در مخزن ندارد و اجرای recovery را تأیید کرد. «پشتیبان‌گیری و خالی‌کردن فهرست» اجرا شد؛ UI ساخت نسخهٔ بازیابی محلی را گزارش کرد، empty state «هنوز درخواستی ثبت نشده» دیده شد و «درخواست جدید» فعال است. هیچ درخواست تازه‌ای ساخته نشد.

### نتیجهٔ اجرای واقعی و نقطهٔ توقف

1. تأیید لحظه‌ای ماهیار دریافت و recovery فقط روی primary درخواست خرید اجرا شد.
2. رسید موفقیت، empty state معتبر و فعال‌شدن «درخواست جدید» در همان مرورگر مشاهده شد؛ جریان ساخت درخواست عمداً آغاز نشد.
3. این باگ در اجرای فعلی بسته است. گام بعدی فقط با درخواست جداگانهٔ ماهیار انتخاب می‌شود؛ دادهٔ backup محلی UI lifecycle مستقل ندارد و ریسک cross-tab ثبت‌شده همچنان بدهی است.
4. ماهیار بعداً commit، push و deploy همین snapshot را صریحاً مجاز کرد و انتشار انجام شد. این مجوز به Memory Core، مدل، backend، شبکه، مسیر تأمین‌کننده یا برش بعدی گسترش ندارد؛ پس از ثبت رسید، تسک متوقف می‌شود.

### رسید انتشار PB-1، UX-R1 و اصلاح RTL

- commit قابلیت‌ها `6d71e42a89441b3499a4fe335e7bc5874feb6e36` و commit منبع/اسناد تأییدشده `bcb22465c0f6e1f04252c40a65f6249a5084ff6b` روی GitHub `main` منتشر شدند؛ prototype tree هر دو مرحلهٔ نهایی برابر `1e1fd3768c0516dc83fe3a7b01844bb35f1837b8` است.
- Cloudflare Pages deployment `5ef162d0-4521-481b-8f2a-31535c7f92e8` با trigger برابر `github:push`، شاخهٔ `main` و source commit `bcb22465c0f6e1f04252c40a65f6249a5084ff6b` به وضعیت `success` رسید. canonical و immutable هر دو HTTP 200 و با build محلی یکسان‌اند: HTML `7f2082299414fa461afbca9a781fc7db75d039ee04b230c36041b90dd32fe889`، JavaScript `2526137571c3bfd51f36f83a5a5832cf30f76901f89fe46403c8b954bd6c5309` و CSS `a19f8e04180930ffbfe2220fcdc3d0c87d3b3c35132ffd703d52d8d4a319e566`.
- ChatGPT Sites نسخهٔ ۲۷ با source commit همان release، ۱۹ فایل و archive hash `sha256:a2d674bf2ca803650dbc2ed7f0aea0e7cb895d59a68dc1030b20601e8797ff93` ذخیره شد؛ version ID برابر `appgprj_6a90313e390c81918572fc1b45269dac~appgver_dd4dabe662448191a1813e97a54ab503` و deployment خصوصی `appgdep_6a9482959f008191802cf8098160378a` در وضعیت `succeeded` روی `https://chida-prototype.mahyarkl.chatgpt.site` قرار گرفت. دسترسی `custom`/owner-only با دقیقاً یک مالک، بدون گروه و بدون مهمان بیرونی حفظ شد.
- commit مستندی حاوی این رسید بدون تغییر prototype tree روی هر سه مقصد منتشر می‌شود. SHA و deployment/version خود آن به‌دلیل حلقهٔ self-reference فقط در پیام تحویل نهایی ثبت می‌شوند؛ receiptهای نسخهٔ ۲۷ برای تاریخچه حفظ می‌شوند.

## MC-1 — Memory Core تأییدشده و منتشرشده

- **تاریخ مجوز و اجرا:** ۱۴۰۵/۰۶/۰۹ — ۲۰۲۶/۰۸/۳۱
- **محرک:** پس از یادآوری ترتیب بستهٔ معماری، ماهیار گفت «خوبه بریم قدم بعد»؛ این پیام فقط اجرای برش دوم یعنی Memory Core را مجاز کرد.
- **وضعیت:** پیاده‌سازی و regressionهای متمرکز در checkout اصلی انجام شدند. ماهیار پس از مشاهده، با پیام «منتشر کن» انتشار همین snapshot را مجاز کرد و GitHub، Cloudflare Pages و ChatGPT Sites نسخهٔ ۲۹ با موفقیت منتشر شدند.
- **مرز تاریخی هنگام بسته‌شدن MC-1:** در آن release هیچ مدل، producer مدل، backend، sync، retrieval خودکار، share، Source/Composer Intake، Task/Monitor Core، Build Lifecycle، تأمین‌کننده یا اثر بیرونی آغاز نشده بود. وضعیت جاری Source/Composer در SI-1 زیر ثبت شده است.

### قرارداد داده و cutover

- منبع حقیقت محلی، envelope دقیق `chida-prototype-memory-core:v2` با fingerprintهای SHA-256 است. دو دامنهٔ خصوصی `account_private` و `project_private`، revision/history immutable، expectedVersion، no-op بایت‌ثابت، rollback-as-new-revision، statusهای current/superseded/disputed/disabled، پیوندهای reciprocal و tombstone حذف در آن نگه‌داری می‌شوند.
- مهاجرت فقط نسل‌های صریح v1 snapshot/lineage/full و legacy array شناخته‌شده را می‌پذیرد. دادهٔ مبهم یا تبدیل‌ناپذیر با report ماندگار fail-close می‌شود؛ v2 خراب هیچ‌گاه با دادهٔ قدیمی جایگزین نمی‌شود و empty معتبر نیز legacy را زنده نمی‌کند.
- cutover یک marker کوچک و بدون متن حافظه دارد. برای پنجرهٔ crash انتقال intent قدیمی، bridge موقت raw فقط تا اعمال و تأیید حذف در همهٔ storeهای هدف باقی می‌ماند و در پایان پیش از بازشدن mutation پاک می‌شود. حذف سخت محتوای رکورد و candidate پذیرفته‌شده را از canonical/prior/legacy می‌زداید؛ tombstone فقط متادیتای حذف و proof رویدادهای lineage بدون title/content/revision snapshot نگه می‌دارد.
- مهاجرت snapshot قدیمی lineage را از graph نهایی حدس نمی‌زند: فقط pivot/peer و resolve یکتای سازگار با scope، snapshot و history پذیرفته می‌شوند؛ ناسازگاری یا ambiguity قفل می‌شود. تعارض تازه و حل تعارض رویدادهای جدا دارند و parser حذف لینک با event دروغین `disputed` را رد می‌کند.
- proof tombstone دقیقاً به history همان رکورد در intent حذف bind است؛ lifecycle، actor و شمار migration، گزارش مهاجرت، SHA-256، تقارن conflict/supersession و chronology تاریخی در کل envelope replay می‌شوند. proof بازهش‌شده، cross-scope، مقصد tombstone نامرتبط، FNV در tombstone v2 دارای proof یا تاریخچهٔ ناممکن fail-close می‌شود.

### تجربهٔ کاربری و کنترل‌ها

- فضای حافظه دو تب «این پروژه» و «شخصی» دارد. Direct Remember فرم کوتاه عنوان، متن، نوع و دامنه است؛ جزئیات منشأ، نسخه، تاریخچه، lineage و کنترل‌ها پشت افشای تدریجی می‌مانند.
- visibility، جست‌وجوی دستی و ترجیح استفاده در زمینه مستقل‌اند. automatic retrieval، model eligibility و shareability همیشه false می‌مانند؛ ترجیح روشن زمینه مجوز مصرف نیست و UI صریحاً می‌گوید مدل متصل نیست.
- `MemoryCandidate` با متن/دامنه/version/hash دقیق از رکورد جدا می‌ماند، expiry دارد و فقط رضایت صریح سازنده می‌تواند آن را اتمیک به رکورد تازه تبدیل کند. این برش هیچ producer برای candidate ندارد؛ fixture آزمون صرفاً قرارداد آینده را می‌سنجد.
- خطای خواندن، نبود Web Locks، conflict نسخه، شکست write و migration مبهم با empty اشتباه نمی‌شوند. storage/focus/visibility میان تب‌ها دوباره reconcile می‌شود و mutation تا load معتبر بسته می‌ماند.

### نقطهٔ توقف

1. gate نهایی MC-1 پاس است: focused Memory/MemoryCandidate برابر ۳۵/۳۵، app برابر ۲۱۰/۲۱۰، runtime برابر ۲۱۸/۲۱۸ و Sites برابر ۴/۴؛ build/TypeScript، `npx tsc --noEmit`، integrity هر ۲۸ فایل و `git diff --check` نیز پاس شدند. هشدار شناخته‌شدهٔ chunk جاوااسکریپت بزرگ‌تر از 500kB باقی است. Builder Architecture Gate کامل فقط پس از برش پنجم و acceptance matrix مستقل سنجیده می‌شود.
2. QA موبایل `390 × 844` روی فهرست، دو scope، فرم/جزئیات، تاریخچه و تأیید حذف انجام شد؛ RTL، focus/keyboard، خطای قابل‌دیدن در modal و نبود overflow افقی تأیید شدند. ممیزی مستقل قرارداد پس از بستن proof/graph finding باز P0/P1/P2 نداشت.
3. ماهیار MC-1 را تأیید کرد و receipt موفق هر سه مقصد ثبت شده است؛ MC-1 بسته و منتشرشده محسوب می‌شود.
4. این بند وضعیت تاریخی پایان MC-1 است: نامزد بعدی آن زمان Source/Composer Intake بود. ماهیار بعداً SI-1 را با پیام جداگانه مجاز کرد؛ وضعیت جاری در بخش زیر است.

### رسید انتشار MC-1

- commit قابلیت `6169035074b4262b7576df638fa4a657f04fdee7` روی GitHub `main` منتشر شد و prototype tree آن `a831c16ffb049bbbacd79aee533935eea33aa078` است. gate تازهٔ release شامل focused برابر ۳۵/۳۵، app برابر ۲۱۰/۲۱۰، runtime برابر ۲۱۸/۲۱۸، Sites برابر ۴/۴، build/TypeScript، `npx tsc --noEmit`، integrity هر ۲۸ فایل، `git diff --check` و ممیزی مستقل بدون finding باز P0/P1/P2 پاس شد.
- Cloudflare Pages deployment `6d59d990-f82b-4f76-b5e8-7ad46c09ecda` با trigger برابر `github:push`، شاخهٔ `main`، `commit_dirty=false` و همین source commit به وضعیت `success` رسید. canonical و immutable هر دو HTTP 200 و با build محلی یکسان‌اند: HTML `ea15863272858e53ad1036f6b3a3be91b90ac57162f86a49346a5726fafa499e`، JavaScript `0f6e02bb244327f2935a38e3ab211d8f3a45ea457c58947753974f5df49fccd6` و CSS `683758425f5aebacaf0be2fd353418bf216e7f221185768cd5bb4c86903767a6`.
- ChatGPT Sites نسخهٔ ۲۹ با source commit همان release، ۱۹ فایل و archive hash `sha256:a540f36f4447d3a200ad04295f967602366e3ea4025c4faf5bace206c8c89e0d` ذخیره شد؛ version ID `appgprj_6a90313e390c81918572fc1b45269dac~appgver_43b1a0eaf8888191af729ef9a417fdb7` و deployment خصوصی `appgdep_6a94f2d1bebc8191a46ffa27d1d1b76c` در وضعیت `succeeded` روی `https://chida-prototype.mahyarkl.chatgpt.site` قرار گرفت. دسترسی `custom`/owner-only با دقیقاً یک مالک، بدون گروه و بدون مهمان بیرونی حفظ شد.
- commit مستندی حاوی این receipt فقط اسناد را تغییر می‌دهد و prototype tree را حفظ می‌کند؛ SHA و deployment/version خود آن به‌دلیل حلقهٔ self-reference در پیام تحویل و payload تسک ادامه ثبت می‌شوند.

## SI-1 — Source/Composer Intake منتشرشده؛ تجربه تأییدشده

- **مجوز و بازخورد:** ماهیار با پیام «شروع کن لطفا» اجرای همین برش را مجاز کرد و پس از مشاهده با پیام «خوبه بریم تسک بعدی» تجربهٔ SI-1 و عبور به TM-1 را تأیید کرد. سپس با پیام «منتشر کن لطفا» انتشار snapshot ترکیبی SI-1/TM-1 را صریحاً مجاز کرد؛ این پیام Build Lifecycle یا دامنهٔ دیگری را مجاز نمی‌کند.
- **وضعیت جاری:** کد، تست و اسناد SI-1 با snapshot ترکیبی SI-1/TM-1 در هر سه مقصد same-source منتشر شده‌اند و receipt terminal در انتهای TM-1 ثبت است.
- **نقطهٔ توقف:** SI-1 و QA `390 × 844` کامل و تجربهٔ آن توسط ماهیار تأیید شده است. این برش همراه TM-1 منتشر شد و نباید خودکار به Build Lifecycle رفت.

### قرارداد ساخته‌شده

1. Composer متن دقیق و حداکثر یک عکس یا سند پشتیبانی‌شده را در یک draft پروژه‌محور می‌پذیرد؛ preview/remove و attachment-only واقعی‌اند.
2. هر commit یک `ComposerIntake` و یک یا دو `SourceRecord` نسخه‌دار می‌سازد. Source متنی متن دقیق و SHA-256 آن را دارد؛ Source دارایی به `FileRecord` مستقل، نسخهٔ آن و hash دقیق Blob bind است.
3. metadata فایل در `localStorage` و bytes فقط در IndexedDB همان مرورگر قرار می‌گیرند. پسوند/MIME allowlist، MIME canonical هنگام بازخوانی و منع Blob/Base64 در `localStorage` اجرا می‌شوند.
4. Source/file writerها یک Web Lock مشترک دارند. commit چندمخزنی Composer با intent ماندگار و snapshot-bound، reread، verification، rollback/resume و cleanup بدون overwrite intent خارجی اجرا می‌شود؛ writer مستقل فایل Blob-first و read-back-before-metadata است.
5. parserها duplicate، unknown key/stage، cross-project binding، stale version/fingerprint، SHA/MIME/bytes tamper، missing Blob و store ناخوانا را fail-close می‌کنند. read-error با empty یکی نیست و mutation وابسته تا خواندن معتبر بسته می‌ماند.
6. ورودی ثبت‌شده بعد از reload به‌صورت رسید محلی از envelope Source بازسازی می‌شود؛ این projection نه پاسخ مدل است و نه thread کامل ماندگار. Drawer نیز فقط شمار intakeهای محلی را گزارش می‌کند.
7. هنگام commit ورودی Composer کوتاه‌مدت غیرفعال است و پاک‌سازی موفق فقط snapshot همان project/draft/attachment را هدف می‌گیرد تا متن تازه یا draft پروژهٔ دیگر حذف نشود.

### مسیرهای تغییرکرده

- `prototype/src/Prototype.tsx`: schema/parser/storage/recovery Source، اتصال inputهای Composer، projection رسید، جزئیات Source و هماهنگی writerهای فایل.
- `prototype/src/prototype.css`: حالت‌های Composer attachment/Source/detail/error و مرز محلیِ بدون OCR/model/send.
- `prototype/tests/chida-flow.spec.ts`: regressionهای Source/Composer، integrity، rollback/recovery، race/cross-tab/project isolation و سازگاری تست‌های فایل.
- `AGENTS.md` و `prototype/AGENTS.md`: invariantهای ماندگار و محدودشده به writer/intakeهایی که واقعاً پیاده شده‌اند.
- `BUILDER-FEATURE-BACKLOG-FA.md`، `CHIDA-PRODUCT-LEARNINGS-FA.md` و همین هنداف: وضعیت، شکاف سند مادر، مرز اختیار و نقطهٔ ادامه.
- `CHIDA-Product-Definition-FA.md` تغییر نکرده است؛ پیشنهادهای اصلاح فقط در Learnings ثبت شده‌اند.

### مرز صادقانه و بدهی

- OCR، vision، extraction، مدل، MemoryCandidate، retrieval، index جست‌وجو، پاسخ منبع‌دار واقعی، backend، sync، cloud upload، share، network و external effect ساخته نشده‌اند.
- `FileRecord` مستقل هنوز content hash ماندگار ندارد؛ hash دقیق فقط Source لینک‌شده را پوشش می‌دهد. چندپیوستی، retention/quota/eviction، export/delete و migration جامع نیز باقی‌اند.
- فایل‌های قدیمی `metadata-only` همان قرارداد پیشین انتخاب دوبارهٔ نام/اندازه را دارند و اصالت bytes قدیمی قابل‌تأیید نیست.
- Builder Architecture Gate کامل همچنان FAIL طراحی‌شده است. SI-1 PASS و تأیید شد؛ Task/Monitor Core نیز با پیام بعدی ماهیار ساخته و همراه همین snapshot منتشر شده است.

### شواهد و رسید محلی

- اجرای اولیهٔ کامل app برابر ۲۲۹/۲۳۳ بود. سه انتظار تست ناسازگار با قرارداد سخت‌گیرانه/محل پیام و یک race واقعی پاک‌شدن draft تازه اصلاح شدند؛ اجرای هدفمند چهار مورد ۴/۴ و اجرای کامل نهایی ۲۳۳/۲۳۳ پاس شد.
- regressionهای متمرکز SI-1 شامل متن+سند، عکس تنها، reload/reopen، MIME mismatch، rollback، recovery، tamper/missing Blob، MIME امن، fail-close، project isolation، نبود Web Locks، رقابت تب‌ها و قفل مشترک نویسنده‌های فایل ۲۳/۲۳ پاس شدند.
- `npm run check:runtime` برای ۲۸ فایل محافظت‌شده، `npm run build`، `npm run test:app` با ۲۳۳/۲۳۳، `npm run test:runtime` با ۲۴۱/۲۴۱، `npm run test:sites` با ۴/۴، `npx tsc --noEmit` و `git diff --check` پاس شدند. build فقط هشدار شناخته‌شدهٔ chunk جاوااسکریپت بزرگ‌تر از 500kB دارد.
- QA مرورگر داخلی در `390 × 844` متن دقیق+PDF، preview/remove، عکس attachment-only، reopen/reload، اصل Blob، project isolation، رسید محلی، focus/Escape، target لمسی و مرز بدون OCR/model/send را پوشش داد. عرض inner/html/body برابر ۳۹۰، overflow خارج از carousel صفر، console warning/error صفر، دکمهٔ بستن `354 × 50`، دکمه‌های Source حداقل ۴۴px و کنترل‌های اصلی Composer حداقل ۴۸px بودند.
- بازبینی‌های مستقل پیاده‌سازی، دامنه و تست finding باز P0/P1 نداشتند. gate محلی SI-1 PASS و تجربهٔ آن توسط ماهیار تأیید شد؛ Builder Architecture Gate کامل همچنان FAIL طراحی‌شده باقی می‌ماند.

### نقطهٔ توقف پس از انتشار

1. وضعیت repo و هم‌ترازی مقصدها را فقط read-only بررسی کن و هیچ تغییر کاربر را discard نکن.
2. gateها، QA و receipt همین snapshot ثبت شده‌اند؛ بدون تغییر تازه تکرارشان نکن.
3. انتشار SI-1/TM-1 بسته شده است. بدون پیام اجرایی تازه Build Lifecycle یا دامنهٔ دیگری را آغاز نکن.

## TM-1 — Task/Monitor Core منتشرشده؛ gate release PASS

- **مجوز و ترتیب واقعی:** ماهیار با پیام «خوبه بریم تسک بعدی» اجرای TM-1 را مجاز کرد و سپس با پیام «منتشر کن لطفا» انتشار دامنهٔ جاری SI-1/TM-1 را خواست. release-verification پس از همین پیام یک رگرسیون presentation در نمایش «کار جدید»، دو P2 قرارداد TM-1 و چند race صرفاً test-only را آشکار کرد؛ همه بدون گسترش دامنه بسته شدند و suiteهای کامل و QA موبایل پاس شدند. درخواست انتشار مجوز انجام workflow انتشار همین دامنه است، نه تأیید UX تفصیلی، تأیید بایت‌به‌بایت post-fix یا مجوز برش بعدی.
- **دامنه:** یک deadline اختیاری برای Task متصل Project Backbone و دقیقاً یک Monitor موعد project-private با Runهای append-only؛ وظیفهٔ دستی قدیمی producer نیست.
- **وضعیت جاری:** پیاده‌سازی، اصلاح رگرسیون، suiteهای کامل و QA موبایل پاس شده‌اند و release هر سه مقصد به وضعیت terminal موفق رسیده است.

### قرارداد ساخته‌شده

1. ورودی `datetime-local` در `Asia/Tehran` تفسیر و در snapshot Task به ISO UTC canonical ذخیره می‌شود؛ پنج ورودی متنی sheet RTL و کنترل موعد LTR باقی می‌مانند.
2. Monitor/Run در envelope مستقل exact و نسخه‌دارند و به id/version/revision/fingerprint دقیق Task bind می‌شوند. history و Runs append-only، attemptها پیوسته، schedule و result قابل replay و cadence پس از deadline دقیقاً ۲۴ ساعت است.
3. همهٔ mutationهای Monitor→Backbone ترتیب قفل ثابت Monitor سپس Backbone، expected preimage، reread پیش/پس از commit و rollback فقط candidate bytes خود را دارند. preimage تازهٔ رقیب، postimage ناسازگار، نبود Web Locks یا read/write failure همگی fail-close هستند.
4. stale Task revision و حذف موعد failure قابل‌retry می‌سازند. Task حذف‌شده یا dependency ناخوانا بدون tombstone معتبر store-level fail-close است و recoverable ادعا نمی‌شود.
5. بررسی خودکار فقط هنگام mounted و visible بودن مرکز «کارها»، در mount/focus/visibility و هر ۶۰ ثانیه انجام می‌شود. اگر درخواست پشت lock منتظر بماند، پس از گرفتن lockهای Monitor و Backbone و پیش از هر read/mutation دوباره mounted/visible بودن را می‌سنجد. Run دستی، disable/re-enable و retry موجودند؛ service worker، تب بسته/پنهان، Notification API، backend، مدل، وب/قیمت/مقررات، شبکه و اثر بیرونی وجود ندارند.
6. فیلترهای «ناموفق» و «پایش‌ها» projection همان storeها هستند. افزودن فیلتر پایش نباید «کار جدید» را در فیلترهای دیگر پنهان یا failure domain Approval را به Task دستی سرایت دهد.

### مسیرهای تغییرکرده

- `prototype/src/Prototype.tsx`: deadline Task، schema/parser/storage Monitor/Run، lock/reread/rollback، scheduler visible-only و UI مرکز کارها/جزئیات پایش.
- `prototype/src/prototype.css`: RTL/LTR موعد، فیلتر و کارت پایش، جزئیات و status/failure موبایل.
- `prototype/tests/chida-flow.spec.ts`: بیست regression TM-1 و انتظارهای دقیق async برای Memory/Run/Backbone؛ اصلاح regression نمایش «کار جدید» نیز در suite پوشش داده شد.
- `AGENTS.md` و `prototype/AGENTS.md`: invariantهای deadline/Monitor و مرز browser-local.
- `BUILDER-FEATURE-BACKLOG-FA.md`، `CHIDA-PRODUCT-LEARNINGS-FA.md` و همین هنداف: وضعیت gate، شواهد، رسید انتشار و نقطهٔ توقف.
- `CHIDA-Product-Definition-FA.md` تغییر نکرده است؛ شکاف‌ها و پیشنهادها فقط در Learnings ثبت شده‌اند.

### شواهد release

- focused TM-1 برابر ۲۰/۲۰ پاس است. `npm run test:app` برابر ۲۵۳/۲۵۳ و `npm run test:runtime` برابر ۲۶۱/۲۶۱ پاس شدند؛ runtime شامل هشت آزمون اختصاصی نیز بود.
- `npm run test:sites` برابر ۴/۴، `npm run check:runtime` برای ۲۸ فایل، `npm run build`، `npx tsc --noEmit` و `git diff --check` پاس شدند. هشدار شناخته‌شدهٔ chunk جاوااسکریپت بزرگ‌تر از 500kB باقی است.
- QA مرورگر داخلی در viewport واقعی `390 × 844` ثبت موعد تهران، ساخت Monitor، Run دستی «موعد نرسیده»، disable/re-enable، حفظ last/next/result و focus restoration به کارت را تأیید کرد. overflow افقی document/body صفر، کنترل کوچک‌تر از ۴۴px صفر و console warning/error صفر بود.
- یک رگرسیون واقعی نمایش «کار جدید» در فیلتر Approval اصلاح شد. بازبینی مستقل سپس دو P2 یافت و بست: درخواست automatic queued دیگر پس از خروج/hidden شدن Tasks commit نمی‌شود و parser دقیق Monitor/Run whitespace non-canonical را normalize نمی‌کند. regressionهای مستقیم این دو مسیر و دو tamper/run مرتبط در ۱۲/۱۲ تکرار پاس شدند.
- raceهای test-only در Memory، Run و Backbone با انتظار روی commit واقعی پایدار شدند؛ رفتار محصول این دامنه‌ها تغییر نکرد. مجموعهٔ Memory اصلاح‌شده ۹/۹ و سناریوی rollback Backbone→Monitor برابر ۳/۳ تکرار پاس شد.
- بازبینی مستقل نهایی finding باز P0/P1/P2 ندارد. Builder Architecture Gate کامل هنوز تا Build Lifecycle و acceptance matrix مستقل بسته نیست.

### مرز و بدهی

- این reminder قابل‌اتکا یا background service نیست؛ بسته یا پنهان‌شدن تب بررسی را متوقف می‌کند.
- full Task status transition، recurrence، چند Monitor، cancellation/rollback، Task tombstone، Run retention و cadenceهای دیگر deferred هستند.
- هیچ مدل، backend، sync، اعلان، شبکه، پایش وب/قیمت/مقررات، ارسال یا اثر بیرونی ساخته نشده است.

### رسید انتشار SI-1/TM-1

- commit قابلیت `525f1bb1577b495416a4e5944341862f0ae5cfbf` با prototype tree `ea1af0b50b2e131ffc139a6f092cf5aa81c82875` روی GitHub `main` منتشر شد. gate release شامل focused TM-1 برابر ۲۰/۲۰، app برابر ۲۵۳/۲۵۳، runtime برابر ۲۶۱/۲۶۱، Sites برابر ۴/۴، `check:runtime` برای ۲۸ فایل، build/TypeScript، `npx tsc --noEmit`، `git diff --check`، QA واقعی `390 × 844` و بازبینی مستقل بدون finding باز P0/P1/P2 پاس شد.
- Cloudflare Pages deployment `d54faf50-c7e7-43d1-974f-2925c9bdfe9a` از source دقیق همین commit روی شاخهٔ `main` به وضعیت `success` رسید. canonical `https://chida-prototype.pages.dev` و immutable `https://d54faf50.chida-prototype.pages.dev` با build محلی یکسان‌اند: HTML `f2b2d951c0f887a39988262e866ba95dab4a3223d84c3e9a148570e70342c748`، JavaScript `49bf9d38241b5988e88378408bb58f3f1bbd8287919c3ba9592f23b75884fca2` و CSS `8817d8eb8799652bd56c0f62935e7ed34e578d9d40ded4c16fbc83ffb2d72f33`.
- ChatGPT Sites نسخهٔ ۳۱ با source commit دقیق قابلیت، ۱۹ فایل و archive hash `sha256:1168adc4638bf0373060eaa2cc6175c4eca5f6dfa1b84f8df97ec5c1b8914b86` ذخیره شد؛ version ID `appgprj_6a90313e390c81918572fc1b45269dac~appgver_82b99fac3d2481919a8c51f8c5898ce1` و deployment خصوصی `appgdep_6a95754e5e3481918c0a6679b0ab6016` در وضعیت `succeeded` روی `https://chida-prototype.mahyarkl.chatgpt.site` قرار گرفت. دسترسی `custom`/owner-only با دقیقاً یک مالک، بدون گروه و بدون مهمان بیرونی حفظ شد.
- commit مستندی حاوی این receipt فقط اسناد را تغییر می‌دهد و prototype tree را ثابت نگه می‌دارد؛ SHA و deployment/version نهایی آن به‌دلیل حلقهٔ self-reference در پیام تحویل ثبت می‌شوند. پس از receipt متوقف شو؛ Build Lifecycle، مدل، backend و مسیر تأمین‌کننده فقط با پیام اجرایی جدا آغاز می‌شوند.

## REL-1 — Fast Publish؛ منتشرشده در baseline `93c41a8`

- **مجوز و مسئله:** ماهیار پس از مشاهدهٔ طولانی‌شدن مکرر انتشار، اصلاح workflow را صریحاً خواست. ممیزی نشان داد `test:runtime` مجموعهٔ app را دوباره اجرا می‌کرد، build/integrity/TypeScript در دستورهای دستی تکرار می‌شد و commit مستندی receipt پس از انتشار یک push و deployment دوم می‌ساخت.
- **قرارداد تازه:** `npm run gate:release` فقط یک بار روی candidate نهایی build/integrity/TypeScript، full Playwright، Sites و `git diff --check` را اجرا می‌کند. fingerprint source و `dist` شامل path، mode/type، bytes و symlink target در `.git/chida-release-gate.json` می‌ماند و ثبات snapshot پیش/پس از گیت بررسی می‌شود.
- **مرحلهٔ publish:** پس از مجوز جدا، همان bytes یک commit می‌شوند؛ `npm run gate:publish` فقط clean بودن، branch، artifact و HEAD همان gate یا دقیقاً یک فرزند مستقیم non-merge را می‌سنجد. suite کامل تکرار نمی‌شود، یک SHA یک بار push و مبنای هر دو deployment است و شناسه‌های terminal فقط در پیام تحویل می‌آیند؛ receipt-only commit حذف است.
- **شواهد:** scriptها برای tracked/untracked-nonignored، حذف فایل، mode/type/symlink، artifact کامل، snapshot پیش/پس و history مستقیم fault-review شدند؛ ممیزی مستقل finding باز P0/P1 نداشت. `test:app` اکنون ۲۷۱ تست، `test:runtime` دقیقاً ۸ تست و `test:all` مجموعاً ۲۷۹ تست را فهرست می‌کنند.
- **وضعیت:** ماهیار در ۲۰۲۶/۰۸/۳۱ انتشار snapshot ترکیبی جاری را صریحاً مجاز کرد؛ همین انتشار نخستین مصرف واقعی این قرارداد است. وضعیت terminal و شناسه‌ها فقط در پیام تحویل ثبت می‌شوند.

## BL-1 — BuiltArtifact Lifecycle Minimum؛ منتشرشده در baseline `93c41a8`

- **مجوز و دامنه:** ماهیار اجرای تسک بعدی را صریحاً خواست. خروجی یک `BuiltArtifact` امن، declarative، private/project-scoped از catalog بستهٔ `project-followup-view` است؛ Plugin، RuntimeTool، Connector، skill/plugin generation، کد آزاد، model، backend، network یا external install/effect ساخته نشده است.
- **preview و lifecycle:** preview دقیق data bindingها، permissionها، safe componentها، action فقط‌خواندنی، محل Tools، metadata رابطه‌ای capability/skill و مرزهای عدم اجرا/شبکه/نصب را نشان می‌دهد. فقط checkbox همان fingerprint می‌تواند `preview_ready` را فعال کند. disable/reactivate، draft revision تازه، rollback به draft تازه، blocked و حذف دوگامی با tombstone در revision/history نسخه‌دار ثبت می‌شوند.
- **storage و failure:** envelope exact با owner/scope، expectedVersion، SHA-256 revision fingerprint و commit-time reread زیر ترتیب قفل ثابت journal سپس main store نگه‌داری می‌شود. read-error empty نیست؛ write پیش از state و rollback byte-preserving است و ghost success ندارد. رکورد legacy سراسری به هیچ پروژه‌ای migrate نمی‌شود.
- **dependency invalidation:** reader واقعی Project Backbone و Tasks در mount/focus/visibility/storage refresh می‌شود. observation خرابی `active@N` پیش از انتظار main-lock در journal hash‌شده و mirrorشدهٔ local/session همان تب ثبت می‌شود؛ `active@N + intent@N` در repair، reload و project switch مؤثرانه blocked می‌ماند. فقط reread و اثبات direct `blocked@N+1` intent را پاک می‌کند؛ cleanup crash نسخهٔ blocked را تکثیر نمی‌کند و retry خودکار loop نمی‌زند.
- **شواهد:** focused BuiltArtifact برابر ۱۹/۱۹ و TypeScript پاس است. بازبینی مستقل شش fault-path journal/mirror/read-failure/crash/bounded-retry/queued-lock را ۶/۶، build و `git diff --check` را پاس و finding باز P0/P1 را صفر گزارش کرد. QA مرورگر داخلی پس از cold reload در `390 × 844` ساختهٔ فعال نسخهٔ ۳ را از Tools باز کرد؛ html/body دقیقاً ۳۹۰، overflow افقی صفر، کنترل قابل‌دیدن کوچک‌تر از ۴۴px صفر و console warning/error تازه صفر بود. receipt terminal گیت واحد candidate عمداً بیرون tree نگه‌داری و در پیام تحویل گزارش می‌شود.
- **مسیرهای تغییرکرده:** `prototype/src/Prototype.tsx`، `prototype/src/prototype.css`، `prototype/tests/chida-flow.spec.ts`، دو script تازهٔ release، `package.json`، READMEها، AGENTSها، backlog، Learnings و همین هنداف. `CHIDA-Product-Definition-FA.md` تغییر نکرده است.
- **مرز باقی‌مانده:** catalog چندقالبی، permission invalidation گسترده، retention/idempotency production، refresh چندتب جامع و دوام در شکست هم‌زمان main store و هر دو journal mirror، runtime واقعی، model/backend/network و مسیر تأمین‌کننده deferred هستند.
- **بازخورد و نقطهٔ توقف:** ماهیار با درخواست «تسک بعدی رو بگو چیه و بعد شروع کن» تجربهٔ BL-1 و عبور به BG-GATE-1 را تأیید کرد؛ آن پیام مجوز انتشار نبود. ماهیار بعداً در ۲۰۲۶/۰۸/۳۱ انتشار snapshot ترکیبی جاری را صریحاً مجاز کرد. M1a همچنان فقط پس از PASS Gate و پیام جدا مجاز می‌شود.

## BG-GATE-1 — Acceptance Matrix هنجاری؛ نتیجهٔ Builder Gate = FAIL

- **مجوز و دامنه:** ماهیار گفت تسک بعدی گفته و سپس شروع شود. این پیام فقط review-only Gate را مجاز کرد. هیچ runtime، سند مادر یا چهار سند منبع معماری تغییر نکرد و remediation، مدل، backend، شبکه، مسیر تأمین‌کننده و انتشار آغاز نشدند.
- **artifact هنجاری:** `CHIDA-BUILDER-PROTOTYPE-ARCHITECTURE-GATE-FA.md` inventory دقیق `Required=Yes`، قاعدهٔ دودویی، ۱۲ ردیف، findingها، شواهد/کمبودهای تست، پنج تصمیم Gate-or-defer و Non-goals را ثبت می‌کند.
- **نتیجه:** Source/Composer Local Intake، Task/Monitor و BuiltArtifact Lifecycle PASS هستند. Ownership/Scope، Project Isolation، Schema/State/Version، Failure/Rollback، Optimistic Concurrency، Idempotency، Memory Control، UI Acceptance و Test Evidence FAIL هستند؛ بنابراین Gate نهایی `FAIL` است و M1a مجاز نیست.
- **سه مانع P1:** Project/Profile canonical خراب را به legacy/empty تبدیل و دوباره می‌نویسد؛ fixture نسخه‌دار Identity/Policy شامل Membership/RoleAssignment/AuthorizationContext وجود ندارد؛ و Task/Request/Approval/Dispatchهای قدیمی mutation seam، Web Lock، commit-time reread و expectedVersion یکنواخت ندارند.
- **بدهی‌های دیگر:** `case_private`، migration همهٔ storeهای Gate، inventory کامل File/Photo/Source و affordanceهای مرده بازند. offline draft، export/delete، quota failure، Mock reset و PWA/installability نیز `PENDING_DECISION` هستند و بدون تصمیم ماهیار Deferred محسوب نمی‌شوند.
- **شواهد:** گیت کامل پیش از artifact مستندی ۲۷۹/۲۷۹ app+runtime، Sites برابر ۴/۴ و build/integrity/TypeScript/diff را پاس کرده بود، اما receipt `.git` فقط fingerprint bytes را نگه می‌دارد و جای acceptance matrix نیست. تغییرهای مستندی BG-GATE-1 همان receipt را برای publish نامعتبر می‌کنند؛ چون انتشار درخواست نشده، full gate دوباره اجرا نشد.
- **نامزد بعد:** فقط `BG-F1 — Project/Identity Foundation`: fixture محلی و نسخه‌دار Identity/Policy و envelope امن Project/Profile با fail-close migration، Web Lock، expectedVersion و regressionهای دو تب. شروع آن پیام اجرایی تازه می‌خواهد.

## BG-F1 — Project/Identity Foundation؛ منتشرشده در baseline `93c41a8`

- **مجوز و دامنه:** ماهیار با «بزن بریم» اجرای همین برش را مجاز کرد. دامنه فقط Identity/Policy fixture و Project/ProjectProfile foundation بود؛ Task/Request/Approval/Dispatch، `case_private`، Gate rerun، مدل، backend، شبکه، مسیر تأمین‌کننده و انتشار وارد نشدند.
- **Identity/Policy:** mirror exact در `chida-prototype-identity-policy-fixture:v1` فقط با fixture کامپایل‌شده معتبر است. AccountIdentity، Membership، RoleAssignment و AuthorizationContext template نسخه‌دارند؛ context دقیق هر projectId با scope واقعی resolve می‌شود و fingerprint آن در history Project/Profile bind است. AccountSide از Identity و MembershipRole از RoleAssignment مستقل می‌آیند.
- **Project domain:** canonical در `chida-prototype-builder-projects:v3` یک envelope اتمیک با storeVersion، activeProjectId، Project/ProjectProfile جدا، revision/history/SHA-256 fingerprint، migration report و idempotency receipt است. parser علاوه بر fingerprint، شناسه و chronology، ترتیب Project/Profile، receipt به event و active-project را از ledger بازپخش می‌کند و فقط state قابل‌تولید writer را می‌پذیرد. projection قدیمی `BuilderProject` فقط برای UI ساخته می‌شود و دیگر persist نمی‌شود.
- **migration/cutover:** precedence برابر v3، سپس v2، سپس legacy و سپس empty است. نسل حاضرِ خراب fail-close می‌شود و به نسل پایین‌تر برنمی‌گردد؛ empty معتبر legacy را زنده نمی‌کند و source غیرقابل‌نمایش پیش از نوشتن marker/candidate رد می‌شود. marker سه‌مرحله‌ای pending/verified/committed source/pointer hash، active hint و generation-selection preimage دقیق، candidate exact و postimage را تا persisted+rechecked شدن verified می‌بندد؛ همان verify نقطهٔ cutover authority است و committed فقط همان candidate را منتشر می‌کند. verified باقی‌مانده پس از شکست rollback روی reload دوباره validate می‌شود و ready نیست. پس از commit، v3 تنها authority است و old source/pointer فقط دادهٔ recovery غیرauthoritative هستند.
- **mutation:** create/select/profile update/rollback زیر Web Lock واحد، authority و canonical reread، expectedVersion، idempotency deterministic، write-before-state، exact marker/identity/canonical readback و candidate-owned rollback اجرا می‌شوند. validator مشترک فرمان پیش از idempotency و parser receipt، پیش‌شرط و snapshot canonical create/update را exact می‌سنجد؛ no-op نسخه یا bytes را تغییر نمی‌دهد، rollback revision تازه و targetVersion صریح می‌سازد و stale tab overwrite نمی‌کند.
- **UI و consumerها:** خطای foundation با empty یکی نیست و تا retry معتبر همهٔ مسیرهای پروژه قفل می‌شوند؛ تغییر canonical/marker/identity و `localStorage.clear()` در تب دیگر فوراً fail-close می‌شود، اما ورودی قدیمی migration پس از committed عمداً نادیده گرفته می‌شود. فرم ساخت/ویرایش روی شکست باز و draft محفوظ می‌ماند؛ rollback یا storage event که پروژهٔ active ناقص بسازد در هر تب فرم تکمیل همان پروژه را نشان می‌دهد. consumerها و regressionهای isolation دیگر پس از cutover v2/pointer را authority فرض نمی‌کنند و پروژه را از UI/envelope v3 عوض می‌کنند.
- **شواهد:** build/TypeScript و regressionهای متمرکز fixture exact/AuthorizationContext، migration malformed/schema-invalid/empty، identity/canonical و coordinated-rehash tamper، command/receipt/ID/order/active replay، verified resume و rollback-marker double fault، cutover race، non-authority ورودی قدیمی پس از commit، create retry، no-op/edit/rollback، rollback ناقص، write failure، stale editor، storage event/clear و رقابت قطعی دو تب و read-error موبایل پاس شده‌اند. گیت نهایی یک‌بارهٔ candidate و receipt بیرون worktree در پیام تحویل ثبت می‌شود.
- **وضعیت و نقطهٔ توقف:** BG-F1 داخل candidate ترکیبی جاری است و ماهیار در پیام ۲۰۲۶/۰۸/۳۱ انتشار همین snapshot را صریحاً مجاز کرد. این مجوز، نتیجهٔ تاریخی Builder Gate را PASS نمی‌کند: BG-F1 فقط دو finding Project/Identity را remediation کرده و ردیف‌های دیگر rerun نشده‌اند. رسید terminal انتشار بیرون worktree و فقط در پیام تحویل/تسک ادامه ثبت می‌شود.
- **نامزد کوچک بعد:** `BG-F2 — Manual Task Concurrency Foundation`: Task دستی قدیمی به envelope/mutation seam exact با Web Lock، commit-time reread، expectedVersion/idempotency، migration و regression دو تب منتقل شود. بدون پیام اجرایی تازه شروع نشود.

## بازخورد چیدمان فرم درخواست خرید — ۲۰۲۶/۰۸/۳۱

- ماهیار خواست «توضیح بیشتر (اختیاری)» از بالای جزئیات فرم به انتهای آن و درست بالای «ادامه» منتقل شود. این بازخورد در working tree محلی برای محصول/خدمت و حالت‌های ساده/پیشرفته پیاده‌سازی شد؛ مقدار فیلد هنگام تغییر حالت حفظ می‌شود و schema یا مسیر ذخیره تغییر نکرده است.
- regression ترتیب DOM، مجاورت با اقدام اصلی و حفظ مقدار ۲/۲ پاس شد. build/TypeScript، integrity runtime و diff-check پاس‌اند؛ QA مرورگر داخلی پس از reload در `390 × 844` مجاورت مستقیم فیلد/اقدام، overflow افقی صفر، نبود overlay و console warning/error صفر را ثبت کرد. این اصلاح داخل snapshot مجازِ انتشار جاری است؛ تأیید UX تفصیلی آن جداگانه ثبت نشده و مجوز شروع `BG-F2`، Gate rerun معماری، مدل، backend یا مسیر تأمین‌کننده نیست.

## بازخورد مرکز واحد «کارها» و سیاست تست سریع — ۲۰۲۶/۰۸/۳۱

- ماهیار جدایی «برنامه»، «تصمیم‌ها» و «کارها» را گیج‌کننده دانست و خواست یک مقصد باشند. Quick Action «برنامه پروژه» حذف شد، «کار جدید» به «کارها» تغییر کرد و خانه، Drawer و فضای پروژه اکنون یک `ProjectTasksView` را باز می‌کنند. ساخت/بازکردن «برنامهٔ فعلی» از داخل همین مرکز انجام می‌شود و Backbone فقط صفحهٔ جزئیات با بازگشت مستقیم به «کارها»ست.
- تغییر فقط IA/navigation/copy است. Milestone، Decision، Task متصل، Task دستی، Approval و Monitor و همهٔ قراردادهای storage/version/lineage/fail-close جدا باقی ماندند؛ Task برنامه در store دستی تکثیر نشد و scheduler همچنان فقط هنگام mounted/visible بودن مرکز کارها اجرا می‌شود.
- پنج regression متمرکز Quick Actions، مسیرهای ساخته‌شده، کارهای دستی، Project Backbone و Task/Monitor برابر ۵/۵ پاس شدند. build/TypeScript و integrity ۲۸ فایل runtime پاس است. QA واقعی `390 × 844` خانه، مرکز کارها، برنامهٔ فعلی و رفت‌وبرگشت فضای پروژه را با overflow افقی صفر، کنترل‌های حداقل `48 × 44` و console warning/error صفر تأیید کرد.
- سیاست کنترل کیفیت در هر دو AGENTS و READMEها سه‌سطحی شد: micro UX فقط focused regression + runtime integrity + mobile QA + diff-check و یک build پس از بستهٔ بازخورد؛ برش عادی focused domain + build + QA؛ `gate:release` فقط candidate منجمد انتشار صریح یا پایان برش واقعاً پرریسک معماری. گیت کامل در این بازخورد عمداً اجرا نشد.
- ماهیار با «خوبه» تجربهٔ مرکز واحد را تأیید و بلافاصله انتشار snapshot ترکیبی جاری را صریحاً مجاز کرد. انتشار باید فقط با یک `gate:release` روی candidate منجمد، یک commit/push و همان SHA برای GitHub، Cloudflare Pages و ChatGPT Sites انجام شود؛ شناسه‌های terminal فقط در پیام تحویل و تسک ادامه می‌آیند. `BG-F2`، Gate rerun، مدل، backend و مسیر تأمین‌کننده همچنان مجوز تازه می‌خواهند.

## هنداف گفت‌وگوی تازه و شفافیت پیشرفت — ۲۰۲۶/۰۸/۳۱

- ماهیار گفت با وجود دو روز کار، چون دکمه‌ها و ظاهر تقریباً ثابت مانده‌اند روشن نبوده روی چه چیزی کار شده است. علت واقعی این بود که بخش عمدهٔ snapshot زیر رابط قرار دارد: REL-1 مسیر انتشار را از اجرای تکراری suite و deployment دوم جدا کرد؛ BL-1 چرخهٔ امن BuiltArtifact را ساخت؛ BG-GATE-1 شکاف‌های معماری را به‌صورت دودویی ثبت کرد؛ BG-F1 foundation پروژه/هویت و migration/concurrency آن را ایمن کرد. دو تغییر قابل‌دیدن این دور، انتقال «توضیح بیشتر» به انتهای فرم و یکی‌کردن «کارها» بود.
- تصمیم فرایندی: هر تحویل بعدی باید سه خط جدا داشته باشد: «چه چیزی کاربر می‌بیند»، «چه زیرساخت/ریسکی بسته شد» و «تسک بعدی چه تغییر قابل‌دیدنی یا فنی می‌دهد». سبزبودن تست‌ها یا حجم diff جای توضیح محصولی را نمی‌گیرد.
- به درخواست صریح ماهیار، یک تسک تازه در همان پروژهٔ ذخیره‌شدهٔ CHIDA، همان checkout و شاخهٔ `main` ساخته شد. آن تسک فقط هنداف را می‌خواند و تا پیام بعدی ماهیار هیچ پیاده‌سازی، گیت، commit، push یا deploy آغاز نمی‌کند. پس از انتشار، SHA و رسیدهای terminal همان نسخه با پیام جدا به آن تسک فرستاده می‌شوند؛ فایل‌های repo برای receipt پویا دوباره تغییر نمی‌کنند.

## BG-F2 — Manual Task Concurrency Foundation؛ منتشرشده در baseline `93c41a8` — ۲۰۲۶/۰۹/۰۱

- **مجوز و دامنه:** ماهیار با پیام «شروع کن» فقط اجرای BG-F2 را مجاز کرد. دامنه Task دستی قدیمی و consumer مستقیم آن در BuiltArtifact بود؛ Request/Approval/Dispatch، `case_private`، Gate rerun، مدل، backend، شبکه، مسیر تأمین‌کننده، commit/push/deploy و سند مادر وارد نشدند.
- **تغییر قابل‌دیدن:** مرکز «کارها» و ظاهر کارت‌ها عوض نشده‌اند. تفاوت رفتاری این است که loading از empty/read-error جداست، editor هنگام ذخیره قفل می‌شود، stale conflict یا شکست نوشتن draft را باز نگه می‌دارد و تعویض active project در تب دیگر دیگر پیش‌نویس «کار جدید» را به پروژهٔ تازه منتقل نمی‌کند.
- **foundation بسته‌شده:** canonical فقط envelope دقیق `chida-prototype-project-tasks:v2` با owner/scope/custodian، revision/history/fingerprint، migration report و command-bound idempotency receipts است. parser projection↔revision، chronology، receipt↔event/revision، payload replay، deterministic create id، scope و authority را exact می‌سنجد. v1 فقط migration input است و canonical/marker خراب fallback ندارد.
- **cutover و failure:** pending همراه candidate exact قابل-resume است. آخرین reread exact authority/source/candidate نقطهٔ انتقال authority است و marker committed فقط همان تصمیم را ماندگار منتشر می‌کند؛ تغییر منبع پیش از validation fail-close و نوشتن v1 پس از آن legacy-only است. create/edit/status زیر Web Lock با commit-time reread، expectedVersion، idempotency، write-before-state/readback و candidate-owned rollback اجرا می‌شوند؛ no-op bytes/version را ثابت نگه می‌دارد.
- **consumer و UI raceها:** BuiltArtifact فقط Task state `ready` را برای preview/activate readable می‌داند، ولی فقط read-error ماندگار incident invalidation می‌سازد؛ loading صرفاً mutation را موقت قفل می‌کند. نتیجهٔ async قدیمی نمی‌تواند read-error/loading یا storeVersion تازه‌تر را در React عقب ببرد. کلید retry وضعیت به task/action scope شده و draft به projectId زمان بازشدن bind است.
- **شواهد پیش از گیت منجمد:** regressionهای اختصاصی BG-F2 برابر ۱۷/۱۷، regressionهای قدیمی Task برابر ۸/۸ و سه regression وابستگی BuiltArtifact برابر ۳/۳ پاس شدند. build شامل TypeScript، Vite، Sites prepare و integrity هر ۲۸ فایل پاس است؛ QA واقعی `390 × 844` مسیر کامل Task، overflow افقی صفر و حداقل اندازهٔ کنترل‌ها را پوشش داد. بازبینی مستقل نهایی finding باز نداشت. `git diff --check` پیش از freeze تمیز است؛ `gate:release` فقط یک بار روی candidate نهایی اجرا و receipt آن بیرون worktree گزارش می‌شود.
- **وضعیت Gate و توقف:** فقط سهم Task دستی از finding تاریخی P1-03 در دامنهٔ BG-F2 remediation شد. Request/Approval/Dispatch و سایر ردیف‌های FAIL بازند؛ Builder Gate کامل rerun نشده و همچنان `FAIL` است. BG-F2 local/uncommitted/unpublished و تجربهٔ آن هنوز تأییدنشده است. remediation یا تسک بعدی انتخاب نشده و شروع هر کار بعدی پیام تازه می‌خواهد.

## BUX-1 — Builder Menu & Settings Completion؛ منتشرشده در baseline `93c41a8` — ۲۰۲۶/۰۹/۰۱

- **اولویت و دامنه:** ماهیار کامل‌شدن قابل‌دیدن Drawer، Settings و Build را پیش از ادامهٔ remediationهای Gate خواست. این نوبت فقط BUX-1 را پوشش داد؛ Build/«برایم بساز» به BUX-2 و sweep ریزه‌کاری‌ها به BUX-3 محدود شد. سند مادر، schema/storage و runtime محافظت‌شده تغییر نکردند.
- **تغییر قابل‌دیدن:** «گفتگوی تازه»، «پین‌شده‌ها» با عدد ساختگی و جست‌وجوی بی‌عمل گفتگوهای اخیر از Drawer حذف شدند. کارها، پروژه‌ها، بریف و پروفایل همان مقصدهای واقعی را حفظ کردند؛ «امکانات چیدا» اکنون Tools را باز می‌کند. ردیف فعال‌نمای «دستیار فنی» دیگر sheet را بی‌صدا نمی‌بندد و تا ساخت مسیر واقعی disabled/«به‌زودی» است.
- **Settings:** بالای Settings دسترسی فعلی «نسخهٔ آزمایشی سازنده» و وضعیت «فعال در همین نمونهٔ محلی» دیده می‌شود. Usage مدل و هزینه/صورتحساب جدا و صریح «متصل نیست» هستند؛ پروژه/رکورد فقط شمارش دادهٔ محلی‌اند و read-error همچنان با صفر یکی نیست. «طرح و ارتقا» نمای داخلیِ قابل‌بازگشت دارد و focus پس از بازگشت به دکمهٔ آغازگر برمی‌گردد؛ پلن پولی، قیمت، سهمیه، entitlement، checkout یا پرداخت ساختگی وجود ندارد.
- **شواهد:** دو regression رفتاری ابتدا شکست را ثبت و پس از اصلاح ۲/۲ پاس کردند. `check:runtime` هر ۲۸ فایل، build/TypeScript/Vite/Sites prepare و `git diff --check` پاس‌اند. QA مرورگر در `390 × 844` عرض Drawer برابر ۳۳۵px، کنترل‌های ۴۸px یا بیشتر، اتصال Drawer→Tools، صفحهٔ Settings و plan، focus بازگشت، overflow افقی صفر و console warning/error صفر را ثبت کرد.
- **وضعیت و توقف:** ماهیار با پیام «بزن بریم» BUX-1 را از نقطهٔ مشاهده عبور داد و شروع BUX-2 را مجاز کرد. BUX-1 همچنان local/uncommitted/unpublished است و candidate گیت پیشین با این تغییر UI برای انتشار معتبر نیست.

## BUX-2 — Build/برایم بساز Completion؛ منتشرشده در baseline `93c41a8` — ۲۰۲۶/۰۹/۰۱

- **مجوز و دامنه:** پیام «بزن بریم» پس از مشاهدهٔ BUX-1 فقط اجرای BUX-2 را مجاز کرد. catalog canonical همان `project-followup-view` نسخهٔ ۱ ماند؛ schema، manifest، parser، writer، fingerprint، lifecycle، journal و lock order تغییر نکردند. catalog چندقالبی، مدل، backend، plugin/skill واقعی، کد آزاد، شبکه، نصب، اقدام بیرونی و BUX-3 وارد این برش نشدند.
- **تغییر قابل‌دیدن:** Build چهار مرحلهٔ روشن «نیاز / قالب امن / پیش‌نمایش / استفاده» دارد. نام و یادداشت فقط ظاهر نمای ثابت را شخصی می‌کنند و پیش از هر write تنها قالب فعال و مرز آن دیده می‌شود. progress و واژه‌های فنیِ گمراه‌کنندهٔ declarative/plugin/skill از سطح روزمره حذف و قرارداد دقیق داده/مجوز/اجزا/محل فعال‌سازی پشت افشای اختیاری نگه داشته شد.
- **پیش‌نمایش و استفاده:** renderer واقعی از `activeProjectBackbone` و `activeProjectTasks` project-filtered، کارت خلاصهٔ برنامه، شمار کارهای جاری، فیلترهای «همه / در حال انجام / انجام‌شده» و فهرست وضعیت را به‌صورت فقط‌خواندنی و زنده نشان می‌دهد. دادهٔ زنده بخشی از fingerprint تأییدشده ادعا نمی‌شود. پس از فعال‌سازی، اقدام مجاز `open-project-tasks` با عنوان «بازکردن مرکز کارها» مقصد واقعی موجود را باز می‌کند.
- **fail-close و lifecycle:** نمای قابل‌استفاده و CTA فقط وقتی `effectiveStatus === active` است نمایش داده می‌شوند؛ disabled، blocked، dependency read-error و invalidation incident حق استفاده ندارند. در read-error، preview دادهٔ ناقص را empty جا نمی‌زند. disable/reactivate، revision تازه، history/rollback و حذف دوگامی موجود بدون تضعیف باقی ماندند.
- **شواهد:** سه regression اصلی ابتدا روی نبود مرحلهٔ قالب، نبود renderer و نبود use action شکست خوردند. suite متمرکز نهایی `BuiltArtifact|BUX-2` برابر ۲۲/۲۲ پاس شد و جریان قالب بدون write، داده و فیلتر زنده بدون mutation bytes، مقصد واقعی Tasks، project isolation، exact approval، failure/recovery، disable/reactivate، revision/rollback و tombstone را پوشش داد. build شامل TypeScript، Vite، Sites prepare و integrity هر ۲۸ فایل و `git diff --check` پاس است. QA مرورگر واقعی `390 × 844` مراحل define/catalog/preview/active، RTL، انتقال focus به مرحله، CTA برابر `309 × 48`، overflow افقی داخلی و html/body صفر، Tasks destination، disable/reactivate و console warning/error صفر را ثبت کرد.
- **وضعیت و توقف:** ماهیار با «خوبه بریم بعدی» BUX-2 را از نقطهٔ مشاهده عبور داد و فقط BUX-3 را مجاز کرد. BUX-2 local/uncommitted/unpublished مانده و این تأیید مجوز rebaseline backlog/Gate، commit/push/deploy یا اقدام بیرونی نبود.

## BUX-3 — Builder UX Detail Sweep؛ منتشرشده در baseline `93c41a8` — ۲۰۲۶/۰۹/۰۱

- **مجوز و دامنه:** پیام «خوبه بریم بعدی» پس از مشاهدهٔ BUX-2 فقط اجرای sweep قابل‌دیدن BUX-3 را مجاز کرد. دامنه به Home، Drawer، Tools، Settings، Build و مسیرهای برگشت موبایل محدود ماند؛ schema/storage/writer، runtime محافظت‌شده، سند مادر، Gate remediation، مدل، backend، شبکه و مسیر تأمین‌کننده وارد نشدند.
- **کنترل و ناوبری:** Voice اکنون disabled/«به‌زودی» است؛ starter صورت‌جلسه draft غیرخالی را حفظ و Composer را focus می‌کند. Drawer یک dialog واقعی با `aria-modal`، focus اولیه، trap، Escape/backdrop و بازگشت focus به منوست. Tools و Build مبدأ خود را نگه می‌دارند و Build، جست‌وجو، نمونهٔ منبع‌دار و اسناد به ردیف یا Quick Action دقیق آغازگر برمی‌گردند.
- **وضعیت و متن:** Build در هر مرحله heading قابل‌focus و scroll صفر دارد؛ هنگام mutation `aria-busy` و status مرئی دارد و back/Escape/کنترل‌های رقیب قفل می‌شوند. حالت healthy-empty ساخته‌ها از read-error جداست و اصطلاحات فنی سطح اصلی به زبان روزمره تبدیل شدند. مدل صریحاً «متصل نیست» و فقط preference محلی را نگه می‌دارد؛ Brief فقط شبیه‌سازی برنامهٔ محلی مرورگر است. Settings انتظار reconciliation واقعی Task و Memory را pending نشان می‌دهد و فقط نتیجهٔ ناخوانا را read-error می‌نامد.
- **شواهد و بازبینی:** چهار regression نخست پیش از پیاده‌سازی روی Voice، semantics Drawer، focus Build و originهای بازگشت شکست خوردند. candidate نهایی ۷/۷ regression اختصاصی BUX-3 و ۱۹/۱۹ regression مرتبط را پاس کرد. build شامل TypeScript/Vite/Sites prepare، integrity هر ۲۸ فایل و `git diff --check` پاس است. QA واقعی `390 × 844` خانه، Drawer، Tools، Build و Settings/Plan را با overflow افقی html/body صفر، outline مرئی ۳px، focus مرحله و بازگشت دقیق و console warning/error تازهٔ صفر پوشش داد. بازبینی مستقل یک P2 برای نمایش Memory loading یافت؛ state و regression قفل واقعی افزوده شد و re-review نهایی finding باز P0/P1/P2 نداشت.
- **وضعیت و توقف:** BUX-3 local/uncommitted/unpublished و آمادهٔ مشاهده است. تسک بعدی، Gate rerun، commit/push/deploy یا هر اقدام بیرونی هنوز انتخاب یا مجاز نشده است.

## BG-F3 — Purchase Request Concurrency & Recovery Foundation؛ منتشرشده در baseline `93c41a8` — ۲۰۲۶/۰۹/۰۱

- **مجوز و دامنه:** ماهیار با پیام «بریم تسک بعدی» BUX-3 را تأیید و فقط BG-F3 را مجاز کرد. دامنهٔ writerهای create/edit/ready/return خود Request، recovery و مرز مستقیم Request↔Approval بود؛ schema/migration کامل Approval، Contact/Dispatch، Gate rerun، مدل، backend، شبکه، مسیر تأمین‌کننده، commit/push/deploy و سند مادر وارد نشدند.
- **foundation Request:** commandهای exact با expectedVersion و idempotency receipt به authority پروژه bind هستند؛ create id و Approval تأیید ترکیبی از idempotency key قطعی می‌آیند. همهٔ mutationها زیر Web Lock مشترک، commit-time reread، preimage، write/readback و candidate-owned rollback اجرا می‌شوند. no-op bytes را ثابت نگه می‌دارد، stale editor overwrite نمی‌کند و draft هنگام conflict/lock/write failure باز می‌ماند. recovery نیز پس از گرفتن همان lock منبع را دوباره می‌خواند و نسخهٔ تعمیرشده یا تازه را حذف نمی‌کند.
- **مرز Request↔Approval:** تأیید ترکیبی Request و Approval را با snapshot/revision دقیق و rollback دو مخزن می‌نویسد. create Approval و تصمیم Approval نیز برای جلوگیری از lost update زیر همان Request lock و reread هستند. confirm receipt و Approval exact باید دوطرفه موجود و سازگار باشند؛ وابستگی حذف‌شده، authority نادرست، ترتیب رسید ناممکن یا rollback اثبات‌نشده fail-close است.
- **تجربهٔ قابل‌دیدن:** هنگام انتظار برای قفل، فرم، تغییر حالت، افزودن قلم و خروج بسته‌اند؛ conflict نسخهٔ تازه را بارگذاری و draft کاربر را حفظ می‌کند. اگر Approval store ناخوانا باشد، ادامهٔ Draft قفل و دلیل آن صریح نمایش داده می‌شود، ولی ویرایش پیش‌نویس سالم باقی می‌ماند.
- **شواهد:** regressionهای اختصاصی BG-F3 برابر ۱۷/۱۷، مجموعهٔ Request/Approval برابر ۴۱/۴۱ و سازگاری service/T6-C/T6-D برابر ۱۸/۱۸ پاس شدند. build نهایی شامل TypeScript، Vite، Sites prepare و runtime integrity هر ۲۸ فایل پاس است؛ `git diff --check` تمیز است. QA مرورگر داخلی `390 × 844` مسیر سالم تا انتخاب تأمین‌کننده و حالت fail-close Draft را با overflow افقی html/body صفر و console warning/error صفر پوشش داد. بازبینی مستقل نهایی finding باز P0/P1/P2 ندارد.
- **ریسک باقیمانده و توقف:** legacy v2 بدون receipt برای سازگاری آگاهانه پذیرفته می‌شود، پس کامل‌بودن receiptهای تاریخی تا migration/cutover صریح قابل‌اثبات نیست. envelope/schema/migration/idempotency کامل Approval و writerهای Contact/Dispatch بازند. Gate تاریخی rerun نشده و `FAIL` است. BG-F3 هنگام تحویل اولیه local/uncommitted/unpublished و آمادهٔ مشاهده بود؛ ماهیار سپس انتشار exact candidate ترکیبی موجود را با پیام «همه جا منتشر کن» مجاز کرد. این مجوز تسک بعدی یا عبور از Gate تاریخی را باز نمی‌کند.

## BG-F4 — Request Content Approval Foundation؛ منتشرشده در baseline `93c41a8` — ۲۰۲۶/۰۹/۰۱

- **مجوز و وضعیت:** ماهیار در پیام پس از انتشار baseline فقط BG-F4 را مجاز کرد. Content Approval canonical v2، migration/cutover سه‌مرحله‌ای، receiptهای command-bound، intent دومخزنی Request+Approval و rollback اثبات‌پذیر orphan تاریخی ساخته شدند. ماهیار سپس با پیام تازهٔ «تسک بعدی رو شروع کن» از نقطهٔ مشاهدهٔ BG-F4 عبور کرد و فقط BG-F5 را آغاز کرد؛ این بازخورد مجوز انتشار BG-F4 نبود.
- **تغییر قابل‌دیدن:** مسیر روزمرهٔ تأیید مستقیم و مسیر pending در «کارها» عمداً همان تجربهٔ قبلی ماندند؛ loading/read-error دقیق‌تر شد و هیچ مقصد، دکمهٔ ارسال یا اثر بیرونی تازه‌ای اضافه نشد.
- **foundation و شواهد:** ۱۸/۱۸ regression BG-F4، بستهٔ سازگاری BG-F3/BG-F4 برابر ۲۰/۲۰، build/runtime/diff و QA واقعی `390 × 844` پاس شدند. `gate:release` کامل همان candidate با ۳۷۳/۳۷۳ سناریوی Playwright و Sites برابر ۴/۴ پاس شد؛ receipt آن فقط شاهد bytes پیش از BG-F5 است و پس از تغییر candidate برای انتشار BG-F5 معتبر نیست.
- **مرز:** BG-F4 همراه BG-F5 در working tree local/uncommitted/unpublished مانده است. Builder Gate تاریخی rerun نشد و مدل، backend، شبکه/ارسال، supplier path، commit/push/deploy و سند مادر تغییر نکردند.

## BG-F5 — Supplier Contact & Dispatch Foundation؛ منتشرشده در baseline `93c41a8` — ۲۰۲۶/۰۹/۰۱

- **مجوز و دامنه:** پیام تازهٔ «تسک بعدی رو شروع کن» فقط canonicalization و mutation/recovery سه شیء محلی موجود `SupplierContact`، `DispatchDraft` و `DispatchPlanApproval` را مجاز کرد. Proposal/Comparison/Negotiation، `case_private`، File/Photo debt، Gate rerun، مدل، backend، شبکه/ارسال، حساب یا مسیر تأمین‌کننده، commit/push/deploy و سند مادر وارد نشدند.
- **تغییر قابل‌دیدن:** قابلیت یا route تازه‌ای ساخته نشده است. همان ثبت تماس خصوصی سازنده، انتخاب دستی گیرنده، preview Draft و تأیید محلی برنامه باقی مانده‌اند؛ عملیات ناهم‌زمان pending را صریح می‌کند و failure/stale conflict باید form/selection/Draft را نگه دارد. Contact حساب یا هویت احرازشدهٔ تأمین‌کننده نیست و هیچ state ارسال وجود ندارد.
- **foundation سه store:** authorityها `chida-prototype-project-supplier-contacts:v2`، `chida-prototype-project-dispatch-drafts:v2` و `chida-prototype-project-dispatch-plan-approvals:v2` هستند. هرکدام envelope exact با owner/scope/authority، revision/history/SHA-256، receiptهای command-bound، migration report و cutover `pending/verified/committed` دارند؛ v1 فقط migration input است و canonical/marker خراب fallback ندارد. Draft reference دقیق Contact را pin و Plan همان lineage را از Draft کپی می‌کند؛ Plan همچنان Domain Object و store مستقل است.
- **checkpoint علّی upstream:** هر mutation Draft/Plan یک checkpoint اتمیک هم‌شکل را با intent crash-safe در ledgerهای canonical Request و Content Approval append می‌کند. شاهد به command/target/authorization، جایگاه exact receipt در Request و expected/resulting storeVersion در Approval bind است و parser آن را از prefix واقعی هر ledger replay می‌کند، نه از timestamp. candidate intent فقط previous bytes دقیق به‌علاوهٔ همان یک receipt append را می‌پذیرد و اجازهٔ بازنویسی تاریخچهٔ upstream نمی‌دهد.
- **atomicity و failure:** همهٔ writerها زیر lock مشترک procurement با commit-time reread، expectedVersion/idempotency، write/readback و candidate-owned rollback اجرا می‌شوند. intent `chida-prototype-project-dispatch-drafts:v2:plan-queue-intent:v1` فقط phaseهای `previous/previous → next/previous → next/next` و current head دقیق را می‌پذیرد؛ receiptهای Draft/Plan به aggregate key/hash و pair دقیق دوطرفه bind هستند. Draft مستقیمِ بدون queue receipt از خرابی Plan مستقل می‌ماند، اما Draft صف‌شده فقط با Plan committed معتبر است؛ Plan گمشده/خراب، orphan یا half-commit بی‌intent fail-close می‌شود. خطای Contact به dependencyها و خطای Draft به Plan سرایت می‌کند.
- **شواهد و مجوز انتشار:** regressionهای اختصاصی BG-F5 برابر ۳۷/۳۷ و بستهٔ مرتبط T6-C/T6-D/T7-A/T7-B/خرید سریع برابر ۳۵/۳۵ پاس‌اند. build/runtime integrity پاس است. QA مرورگر واقعی `390 × 844` مسیر onboarding→ثبت Request→تماس محلی→صف Draft/Plan→تأیید نهایی را با پیام صریح «در این نمونه چیزی ارسال نشد»، overflow افقی صفر، focus معنادار و console warning/error صفر پوشش داد. بازبینی مستقل finding باز P0/P1 ندارد. ماهیار با پیام «اره اول همه چیزو تا اینجا منتشر کن بعدش شروع کن» انتشار exact candidate تا BG-F5 را صریحاً مجاز کرد. `gate:release` فقط یک بار پس از freeze همین اسناد اجرا و receiptهای terminal فقط در پیام تحویل گزارش می‌شوند؛ تا پیش از آن candidate local/uncommitted/unpublished است و آماده/منتشرشده ادعا نمی‌شود.
- **مرز صداقت و گام بعد:** Plan همیشه `simulationOnly=true`، `externalEffect=none`، `sendAuthorized=false` و `externalActionAttempted=false` می‌ماند. شبکه، پیام، `sent`، `sentAt`، delivery receipt، مدل، backend و اثر بیرونی وجود ندارند. Builder Gate تاریخی همچنان `FAIL` است. فقط پس از اثبات موفقیت همان SHA در GitHub، Cloudflare Pages و ChatGPT Sites، آغاز محلی و تست‌محور `BG-F6 — Proposal Authority & Concurrency Foundation` مجاز است؛ هیچ byte مربوط به BG-F6 داخل این candidate انتشار قرار نمی‌گیرد و این مجوز به مدل، backend، شبکه یا مسیر تأمین‌کننده گسترش ندارد.
- **بستن blocker گیت انتشار:** نخستین اجرای کامل candidate در مرحلهٔ Playwright با ۴۰۹/۴۱۰ و فقط روی قرارداد focus heading پس از ذخیرهٔ Request متوقف شد؛ بنابراین نه receipt، نه fingerprint انتشار و نه اجرای مراحل بعدی معتبر نیست. diagnostic نشان داد one-shot rAF پیش از attach ref بی‌اثر می‌شود. انتقال focus به passive effect پس از commit/editor-close بدون تغییر تست یا timeout انجام شد؛ همان مسیر ۱۰/۱۰، چهار مسیر مجاور ۴/۴، build/runtime integrity و review مستقل پاس‌اند. final candidate تازه پس از freeze اسناد فقط یک گیت کامل تازه می‌گیرد.

## رسید baseline تا BG-F5 و وضعیت جاری — ۲۰۲۶/۰۹/۰۲

- **انتشار بسته‌شده:** گیت کامل تازهٔ candidate منجمد پس از اصلاح focus با Playwright برابر ۴۱۰/۴۱۰ و Sites برابر ۴/۴ پاس شد. همان bytes با SHA `93c41a8f728ff973a3ca9db29581b1e4968fe52b` روی local/GitHub `main`، Cloudflare Pages و ChatGPT Sites same-source منتشر شدند؛ دسترسی Sites owner-only باقی ماند. شناسه‌های پویای deployment/version مطابق قرارداد فقط در پیام تحویل terminal ثبت شده‌اند.
- **اثر روی وضعیت‌های قبلی:** وضعیت‌های «candidate محلی»، «مجاز انتشار» یا «unpublished» در بخش‌های REL-1/BL-1/BG-F1 تا BG-F5 و BUX-1 تا BUX-3 سابقهٔ همان لحظه‌اند و با receipt بالا supersede شده‌اند. متن فنی و شواهد هر برش برای حسابرسی حفظ شده است.
- **Gate معماری:** این release فقط Gate انتشار bytes بود. ماتریس `BG-GATE-1` rerun نشده و نتیجهٔ تاریخی آن همچنان `FAIL` است؛ M1a، `case_private`، مدل، backend، شبکه/ارسال و مسیر تأمین‌کننده از این receipt مجوز نمی‌گیرند.

## BG-F6 — Proposal Authority & Concurrency Foundation؛ تکمیل محلی و انتشار exact مجاز — ۲۰۲۶/۰۹/۰۲

- **دامنه و فایل‌ها:** `prototype/src/builderProposals.ts` authority canonical v2، parser exact، migration/cutover سه‌مرحله‌ای، dependency binding، command/receipt، Web Lock مشترک procurement، commit-time reread، expectedVersion، idempotency، readback/rollback و helper سازگاری lineage را مالک است. `prototype/src/Prototype.tsx` فقط adapter وابستگی، React state، storage reconciliation و editor binding را نگه می‌دارد؛ `prototype/tests/chida-flow.spec.ts` oracleهای BG-F6 و regressionهای downstream را پوشش می‌دهد. storeهای Comparison/Decision/Negotiation canonical یا بازنویسی نمی‌شوند.
- **receipt و replay:** هر receipt باید exact `commandPins` همان command را ماندگار کند. parser payload را از revision ثبت‌شده، authority و `receipt.commandPins` بازسازی می‌کند؛ pinهای Request/Approval/Contact با revision bind هستند و pin File commit-time به‌دلیل rename مجاز display name از dependency جاری یا reference تاریخی حدس زده نمی‌شود. same key فقط با همان payload/pins replay می‌شود و payload یا pins متفاوت fail-close است.
- **attempt پایدار UI:** editor برای هر draft نرمال‌شده یک attempt شامل `proposalId`، `idempotencyKey`، `normalizedPayloadHash` و exact `pins` می‌سازد. failure مبهم یا reconciliation این attempt را دور نمی‌ریزد. اگر binding stale شود، mutation تازه بسته است؛ فقط draft دقیقاً بدون تغییر اجازه دارد همان attempt/binding را برای بازیابی receipt دوباره بفرستد. retry حق refresh pins، rebind خاموش یا ساخت Proposal تازه ندارد؛ تغییر draft یا بستن editor attempt را باطل می‌کند.
- **وضعیت شواهد:** اجرای نهایی یک‌جای suite BG-F6 پیش از گیت برابر ۵۳/۵۳ و بستهٔ نمایندهٔ downstream برابر ۹/۹ پاس شد. نخستین گیت سپس build/integrity/TypeScript را پاس کرد اما با ۶ شکست Playwright از ۴۶۳ receipt نساخت. پس از اصلاح حد canonical Proposal و انتقال oracleهای غیرمهاجرتی به raw v2، همان شش مسیر ۶/۶ و بستهٔ عمیق T7-B1/T7-B2/T8-A1 تا T8-A4/T8-UX1/BG-F6 برابر ۹۱/۹۱ پاس شد؛ تست oversized، tamper، rollback، concurrency و lineage داخل آن سبز بود. QA واقعی `390 × 844` و review مستقل پیشین نیز بدون finding باز می‌مانند؛ candidate تازه برای receipt نهایی به گیت کامل جدید نیاز دارد.
- **Git و مجوز:** baseline `HEAD`/`origin/main` همان `93c41a8f728ff973a3ca9db29581b1e4968fe52b` است و BG-F6 تا پیش از receipt فقط در working tree اصلی، uncommitted و unpublished قرار دارد. ماهیار با پیام «بعد از اتمام تسک منتشرش کن» اجرای گیت کامل، commit/push و انتشار exact candidate اصلاح‌شده در GitHub، Cloudflare Pages و ChatGPT Sites را صریحاً مجاز کرد و خواست پس از آن یک گفت‌وگوی تازه در همین پروژه با هنداف ساخته شود. گیت ناموفق قبلی receipt نیست؛ این مجوز Gate معماری، اصلاح بعدی، مدل، backend، شبکه/ارسال یا supplier path را باز نمی‌کند.
- **بدهی باز و برش بعدی:** authority/concurrency خود Comparison/Negotiation، File/Photo، `case_private` و پنج تصمیم Gate-or-defer هنوز بازند. تکمیل BG-F6 هیچ‌کدام را مجاز نمی‌کند؛ کوچک‌ترین برش بعدی پس از مشاهدهٔ این نسخه و با پیام تازه انتخاب می‌شود.
