# پیشنهاد Technical Inception چیدا

- **Status:** Research proposal — not accepted
- **Implementation authority:** None
- **Captured:** 2026-08-20
- **Review rule:** هیچ انتخاب ماندگار این سند تا پیش از پذیرش ADR مرتبط، مجوز پیاده‌سازی ندارد.

## جایگاه و دامنه

این سند خروجی پژوهش معماری ۲۰ اوت ۲۰۲۶ را به‌شکل ماندگار ثبت می‌کند تا با حذف محیط محلی از بین نرود. این سند تصمیم قطعی، ADR یا جایگزین اسناد محصول نیست. ترتیب اعتبار همچنان `DECISIONS.md`، سند `02-phase-one-product.md` و سند مالک موضوع است.

پیشنهادها باید این ثابت‌ها را حفظ کنند:

- تجربه فارسی، RTL، mobile-first و متمرکز بر تهران است.
- حساب‌ها در نسخهٔ یک تک‌کاربره‌اند.
- کاربر فقط یک شخصیت، چیدا، را می‌بیند.
- ورودی‌های نسخهٔ یک متن، ویس‌نوت، تصویر و فایل‌اند؛ live voice در دامنه نیست.
- چرخهٔ اقدام `نیت → پیش‌نویس → بازبینی/ویرایش → تأیید → اجرای مجاز → رسید` است.
- مجوز، گیرنده، مبلغ، تغییر حالت، idempotency و audit باید در کد deterministic باشند؛ خروجی مدل لایهٔ اختیار نیست.
- دادهٔ پروژه‌ها، فضای عمومی حساب، دادهٔ خصوصی سازنده و دادهٔ خصوصی تأمین‌کننده از یکدیگر جدا می‌مانند.
- دادهٔ واقعی تا بسته‌شدن سیاست‌های نگهداری، حذف، رضایت و پردازش بیرونی وارد نمی‌شود؛ موارد `ب-۰۱۴`، `ب-۰۱۹` و `ب-۰۲۴` همچنان بازند.

## محرک‌های تصمیم

1. سرویس باید از ایران قابل توسعه، استقرار و بهره‌برداری باشد.
2. یک اختلال ارائه‌دهنده نباید تمام محصول را متوقف کند.
3. معماری باید از یک vertical slice مصنوعی شروع شود و بدون Kubernetes، صف مستقل یا جست‌وجوی مدیریت‌شدهٔ زودهنگام رشد کند.
4. میزان استقلال سایت عمومی از محصول احراز هویت‌شده، داده و چرخهٔ انتشار باید در ADR با هزینهٔ نگهداری یک یا دو framework مقایسه شود.
5. انتخاب فناوری باید قابل‌انتقال باشد و قراردادهای دامنه به framework یا vendor گره نخورد.
6. امنیت و حریم داده باید در مرزهای ماژول، ذخیره‌سازی، telemetry و provider adapter قابل آزمون باشند.

## توپولوژی پیشنهادی

این ساختار یک گزینه برای بررسی است:

```text
chida.ai
  └─ Astro static artifact
      ├─ domestic edge
      └─ optional independent public mirror

app.chida.ai
  └─ WAF / reverse proxy
      └─ Next.js container
          └─ CHIDA Product Core
              ├─ PostgreSQL
              ├─ private S3-compatible storage
              ├─ outbox + worker
              └─ provider adapters
                  ├─ AI
                  ├─ SMS / email
                  ├─ CHIDA subscription billing/payment
                  ├─ map
                  └─ web search
```

خروجی‌های قابل‌استقرار پیشنهادی:

- `chida.ai`: سایت بازاریابی static و مستقل؛
- `app.chida.ai`: محصول احراز هویت‌شده در container؛
- worker مستقل: پردازش فایل و ویس‌نوت، اعلان و کارهای پس‌زمینه؛
- Product Core: قواعد دامنه و permission بدون وابستگی مستقیم به Next.js یا providerها.

## ماتریس استک پیشنهادی

| لایه | گزینهٔ پیشنهادی برای بررسی | دلیل و مرز |
|---|---|---|
| Workspace | `pnpm workspaces` و TypeScript strict | یک repo و قراردادهای type-safe؛ هنوز انتخاب قطعی نیست. |
| مارکتینگ | Astro، static output، Markdown/MDX Content Collections | HTML-first و JavaScript حداقلی برای سطح محتوایی. |
| محصول | Next.js App Router روی Node/Docker | self-hosting و جدایی deployment از Vercel. |
| Design System | DTCG tokens، CSS Custom Properties، CSS Modules، React Aria | token قابل‌انتقال و رفتار دسترس‌پذیر بدون ظاهر آماده. |
| Backend | Product Core مستقل با delivery adapter | Next.js فقط مرز HTTP/UI باشد، نه مالک قواعد دامنه. |
| داده | PostgreSQL و migrationهای SQL بازبینی‌شده؛ Drizzle به‌عنوان candidate | PostgreSQL منبع حقیقت؛ RLS فقط دفاع دوم، نه جایگزین authorization. |
| فایل | private S3-compatible storage و metadata در PostgreSQL | signed upload، quarantine، antivirus و عدم public-by-default. |
| کار پس‌زمینه | PostgreSQL outbox، worker، retry و DLQ | شروع ساده و transactional؛ صف مستقل فقط پس از اثبات نیاز. |
| جست‌وجو | PostgreSQL FTS و `pg_trgm` | managed search یا vector search فقط پس از داده و ارزیابی واقعی. |
| AI | `ModelGateway` با adapterهای قابل‌تعویض | مدل و effort در UI دیده نمی‌شود؛ authorization بیرون مدل است. |
| مشاهده‌پذیری | OpenTelemetry و لاگ ساختاریافته با redaction | prompt، فایل، شماره، اطلاعات پروژه و مالی وارد telemetry نشوند. |
| آزمون | Vitest، PostgreSQL واقعی در CI، Playwright، axe و Lighthouse CI | build به‌تنهایی شاهد سفر و مرز داده نیست. |

## مرزهای عمیق ماژول‌ها

- Product Core مالک entityها، invariantها، permissionها، state transitionها، محاسبات و receiptهاست.
- delivery adapter ورودی HTTP، session، validation اولیه و تبدیل پاسخ را انجام می‌دهد.
- provider adapter قرارداد داخلی پایدار دارد و خطا، timeout، retry، idempotency و قابلیت degraded mode را آشکار می‌کند.
- database schema یا ORM نباید مستقیماً در UI یا providerها نشت کند.
- هر action خارجی باید request پایدار، preview دقیق، مقصد، تأیید صریح و result/failure receipt داشته باشد.
- ادعای failover تنها وقتی مجاز است که حداقل دو مسیر عملی با failure domain جدا و آزمون دوره‌ای وجود داشته باشد.

چرخهٔ اختیار پیشنهادی:

```text
ورودی کاربر
  → پیش‌نویس مدل
  → آرتیفکت قابل‌ویرایش
  → پیش‌نمایش مقصد و اثر
  → تأیید صریح
  → اجرای deterministic
  → رسید موفقیت یا شکست
```

## گزینه‌های جایگزین

### Astro برای مارکتینگ و Next.js برای محصول

مزیت اصلی، جدایی خرابی، احراز هویت، داده و release cadence محصول از سطح عمومی است. هزینهٔ آن نگهداری دو framework است.

### Next.js برای هر دو سطح

اگر ظرفیت تیم نگهداری دو framework را نداشته باشد، یک Next.js deployment یا دو deployment از یک framework گزینهٔ ساده‌تری است. این گزینه باید با performance budget، استقلال مارکتینگ و هزینهٔ عملیاتی مقایسه شود.

### چرا هنوز microservice یا Kubernetes نه؟

مرزهای دامنه را می‌توان در modular monolith عمیق و آزمون‌پذیر نگه داشت. سرویس‌های مستقل زودهنگام هزینهٔ deployment، tracing، consistency و incident response را بالا می‌برند، بدون اینکه حجم یا ساختار تیم آن را توجیه کرده باشد.

## ترتیب ADRهای لازم

فقط ADRهای لازم برای vertical slice جاری پذیرفته شوند:

1. ساختار repository، runtime و deployableها؛
2. hosting، region، دسترسی از ایران، portability و fallback؛
3. identity، session، role و authorization در زمان ورود احراز هویت؛
4. data tenancy و جداسازی پروژه/دو سمت بازار؛
5. relational data، فایل، backup، retention، export و deletion؛
6. AI orchestration، provider fallback و مرز prompt/data؛
7. outbox، retry، idempotency و پردازش فایل/ویس؛
8. audit، observability، analytics و redaction؛
9. notification، abuse control، subscription billing و usage هنگام ورود هر subsystem.

این سند نباید برای دورزدن سؤال‌های باز `ب-۰۱۶`، `ب-۰۲۱` یا هر رفتار محصولی دیگر استفاده شود.

## مسیر پیشنهادی صفر تا صد

### ۰ تا ۱۰ — مرز محصول و دامنه

- تصویب یا رد جدایی سایت مارکتینگ از محصول؛
- تعیین پیام اصلی، CTA و دادهٔ مجاز فرم lead؛
- رفع وضعیت DNS و تعریف topology دامنه.

### ۱۰ تا ۲۰ — Technical Inception

- domain model و threat model؛
- ADR runtime/repository و hosting/fallback؛
- ADR identity، data isolation و audit؛
- data classification و هدف‌های RTO/RPO.

### ۲۰ تا ۳۰ — Design Foundation

- exploration چندجهته با محتوای ثابت؛
- انتخاب انسانی جهت؛
- tokenهای روشن/تیره، typography، spacing و motion؛
- primitives، state matrix، RTL، keyboard، mobile و contrast.

### ۳۰ تا ۴۰ — مارکتینگ

- سایت HTML-first با محتوای واقعی؛
- deployment و مشاهده‌پذیری مستقل؛
- performance، accessibility، schema و crawler QA.

### ۴۰ تا ۵۵ — اولین vertical slice مصنوعی

- ورود نمایشی، onboarding سازنده و ساخت پروژه؛
- تبدیل خواسته به آرتیفکت؛
- ویرایش، تأیید، ثبت و receipt؛
- فقط fixture مصنوعی و بدون side effect بیرونی.

### ۵۵ تا ۷۰ — هستهٔ قابل‌تولید

- OTP و session امن؛
- project isolation و authorization server-side؛
- audit، outbox و idempotency؛
- private file pipeline، backup/restore و observability؛
- AI gateway و eval فارسی.

### ۷۰ تا ۸۵ — قابلیت‌های دو نقش

- کار، سند و مالی ساده؛
- فروشگاه محصول و خدمت و جست‌وجوی داخلی؛
- ویس‌نوت و فایل با low-confidence review؛
- RFQ فقط پس از بسته‌شدن قواعد گیرنده و افشای داده.

### ۸۵ تا ۹۵ — بازار و درآمد

- پاسخ تأمین‌کننده و مقایسه؛
- اینباکس و پیام عمومی با quota و abuse control؛
- subscription، entitlement، usage ledger و پرداخت اشتراک.

این پرداخت فقط وصول اشتراک CHIDA است. طبق `د-۰۲۰`، پرداخت معامله، escrow، سفارش، حمل و تسویهٔ بازار خارج از محصول می‌ماند.

### ۹۵ تا ۱۰۰ — بتای محدود

- privacy isolation و penetration test؛
- restore و failover واقعی؛
- کنترل هزینهٔ AI؛
- آزمون گوشی واقعی، تم‌ها و مرز network/storage؛
- runbookهای incident، backup و support؛
- دعوت گروه محدود تهران.

دروازهٔ عرضه همچنان همان شرایط سند محصول نسخهٔ یک و `docs/implementation-readiness.md` است.

## شواهد لازم پیش از پذیرش

- spike قابل‌تکرار از build و self-hosting؛
- PoC دسترسی و latency از شبکه‌های واقعی ایران؛
- threat model و آزمون جداسازی داده؛
- restore از backup، نه صرفاً ایجاد backup؛
- failover واقعی و degraded mode برای providerهای حیاتی؛
- هزینهٔ تخمینی و سقف مصرف در بار هدف؛
- journey test روی سطح renderشده، موبایل واقعی و هر دو theme؛
- ADRهای کوچک با گزینه‌ها، پیامدها و rollback.

## منابع رسمی

- [Astro: Why Astro?](https://docs.astro.build/en/concepts/why-astro/)
- [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting)
- [PostgreSQL documentation](https://www.postgresql.org/docs/current/)
- [OpenTelemetry documentation](https://opentelemetry.io/docs/)
- [React Aria](https://react-spectrum.adobe.com/react-aria/)
- [DTCG Design Tokens Format 2025.10](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/)
- [Playwright test projects](https://playwright.dev/docs/test-projects)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [Lighthouse overview](https://developer.chrome.com/docs/lighthouse/overview)
