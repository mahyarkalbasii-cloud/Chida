# چشم‌انداز سرویس‌های ایران‌محور برای چیدا

- **Status:** Dated research snapshot — not a vendor selection
- **Observed:** 2026-08-20
- **Implementation authority:** None
- **Review rule:** دسترسی، قرارداد، تحریم، قیمت، محل داده، privacy و failure domain هر گزینه پیش از خرید یا پذیرش ADR دوباره بررسی شود.

## هدف و مرز پژوهش

هدف، یافتن مسیر ایران‌محور و درعین‌حال قابل‌انتقال برای CHIDA است. این سند قرارداد، تضمین دسترسی، توصیهٔ حقوقی یا انتخاب ارائه‌دهنده نیست. پیشنهاد معماری در `../proposals/2026-08-20-technical-inception.md` و مسائل محصول در `DECISIONS.md` مرجع جداگانه دارند.

اصل اولیه:

- runtime و دادهٔ اصلی از داخل ایران قابل بهره‌برداری باشند؛
- artifact، schema و adapterها portability را حفظ کنند؛
- از multi-cloud پیچیده در روز اول پرهیز شود؛
- backup باید restore-tested باشد؛
- provider دوم تنها وقتی fallback واقعی است که failure domain و upstream مستقل داشته باشد.

## معیار ارزیابی ارائه‌دهنده

هر گزینه باید با PoC و قرارداد روی این موارد سنجیده شود:

1. دسترسی از چند ISP و اپراتور ایران؛
2. data location، مالکیت، export و deletion؛
3. SLA، support، incident disclosure و termination؛
4. API compatibility و امکان خروج بدون بازنویسی هسته؛
5. backup، restore، RPO و RTO واقعی؛
6. failure domain فنی، قراردادی، مالی و تحریمی؛
7. هزینهٔ بار پایه، جهش بار و egress؛
8. احراز هویت، audit، encryption و secret management؛
9. redaction و ممنوعیت ورود دادهٔ حساس به telemetry؛
10. degraded mode در نبود سرویس.

## ماتریس candidateها

این جدول فقط shortlist پژوهشی همان تاریخ است:

| نیاز | candidate داخلی | نمونهٔ جهانی یا مسیر portable | نکتهٔ ارزیابی |
|---|---|---|---|
| Compute و container | Liara PaaS؛ گزینه‌های IaaS داخلی پس از benchmark | Cloud Run، ECS، Fly.io یا container host سازگار | OCI image یکسان و health/readiness استاندارد حفظ شود. |
| PostgreSQL | Liara DBaaS یا PostgreSQL مدیریت‌شده/خودمیزبان داخلی | RDS، Cloud SQL یا PostgreSQL استاندارد | restore، extensionها، connection limits و خروجی کامل آزمایش شوند. |
| DNS/CDN/WAF | ParsPack یا NSIN پس از PoC | Cloudflare یا Fastly در صورت دسترسی حقوقی/عملی | resolver، crawler، WAF، purge، origin failover و vendor independence آزمون شوند. |
| Object Storage | Liara S3 یا ParsPack S3 | S3، R2 یا Backblaze B2 | حساب و failure domain backup جدا؛ object lock و restore بررسی شود. |
| Queue | ابتدا PostgreSQL outbox و worker | SQS، RabbitMQ یا managed queue در مرحلهٔ بعد | سرویس جدا فقط پس از اثبات throughput یا isolation need. |
| Search | PostgreSQL FTS و `pg_trgm` | Elasticsearch/OpenSearch یا Algolia پس از نیاز واقعی | freshness، typo فارسی، ranking و هزینه با corpus واقعی ارزیابی شود. |
| AI | Liara AI، gateway داخلی یا مدل self-hosted به‌عنوان candidate | OpenAI، Anthropic، Gemini یا xAI فقط با مسیر قراردادی مجاز | gateway با upstream یکسان backup مستقل نیست؛ degraded mode لازم است. |
| SMS و OTP | Kavenegar و IPPanel به‌عنوان دو candidate داخلی | Twilio Verify فقط نمونهٔ الگو | fallback عملی OTP ایران معمولاً ارائه‌دهندهٔ داخلی دوم است. |
| Email | Liara Mail یا سرویس داخلی پس از delivery test | Postmark یا SES | SPF، DKIM، DMARC، bounce و complaint event لازم‌اند. |
| پرداخت اشتراک | Zarinpal و درگاه ایرانی دوم پس از قرارداد | Stripe Billing فقط نمونهٔ محصولی | Stripe backup عملی پرداخت ریالی نیست؛ entitlement از gateway جدا بماند. |
| Map | Neshan | Google Maps یا Mapbox در صورت دسترسی | مختصات استاندارد ذخیره شود، نه فقط provider ID. |
| Observability | OpenTelemetry با Grafana/Loki خودمیزبان یا Watchlog پس از PoC | Sentry، Datadog یا Better Stack | prompt، فایل، شماره، هویت و مالی وارد trace/log نشوند. |
| Analytics | Matomo/Umami خودمیزبان؛ Metrix برای attribution پس از review | GA یا PostHog | analytics مارکتینگ و محصول جدا و کم‌داده باشند. |
| Source و CI | GitHub فعلی و در آینده mirror مستقل در صورت نیاز | GitHub/GitLab Cloud | mirror جای backup آزموده‌شده و account recovery را نمی‌گیرد. |

ردیف «پرداخت اشتراک» فقط برای وصول subscription خود CHIDA است. طبق `د-۰۲۰`، پرداخت معامله، escrow، سفارش، حمل، تحویل و تسویهٔ بازار خارج از دامنه است.

## محدودیت APIهای خارجی

در فهرست‌های رسمی مشاهده‌شده در ۲۰ اوت ۲۰۲۶، ایران در مناطق پشتیبانی‌شدهٔ API مستقیم OpenAI، Anthropic و Gemini دیده نشد. نتیجهٔ عملی این پژوهش:

- این سرویس‌ها از داخل ایران fallback عملیاتی تضمین‌شده محسوب نمی‌شوند؛
- VPN، حساب واسطه یا retry کورکورانه معماری recovery نیست؛
- استفاده فقط با مسیر قراردادی و حقوقی واقعی در منطقهٔ پشتیبانی‌شده، consent و data-transfer policy قابل بررسی است؛
- Product Core باید در نبود AI خارجی degraded mode امن داشته باشد.

این وضعیت زمان‌مند است و قبل از هر ADR باید دوباره از صفحات رسمی بررسی شود.

## ملاحظهٔ تحریم و تدارکات

صفحهٔ رسمی OFAC در ۲ ژوئن ۲۰۲۳، شرکت‌های مرتبط با Arvan Cloud را در به‌روزرسانی SDN نام برده است. بنابراین Arvan Cloud با وجود پوشش فنی، در این پژوهش default shortlist نیست و هر استفادهٔ آینده به بررسی حقوقی، قراردادی و failure-domain مستقل نیاز دارد.

این سند مشاورهٔ حقوقی نیست. وضعیت فهرست‌ها، مجوزها و طرف قرارداد باید در زمان procurement دوباره بررسی شود.

## مرز داده و رضایت

تا بسته‌شدن `ب-۰۱۴` و `ب-۰۱۹`:

- project، identity، financial، prompt و file data به خارج از مسیر داخلی ارسال نشود؛
- fixtureها مصنوعی باشند؛
- log، trace، screenshot و test artifact دادهٔ واقعی نداشته باشند؛
- کپی خارجی دادهٔ حساس صرفاً به‌دلیل «backup» ساخته نشود؛
- هر third-party processing مقصد، داده، retention، deletion و consent روشن داشته باشد.

## مدل backup و degraded mode

- سایت عمومی: artifact static یکسان و امکان mirror مستقل؛
- code و image: OCI artifact با digest یکسان روی registryهای جدا در صورت نیاز؛
- دادهٔ حساس: primary و backup داخلی، رمزنگاری‌شده و restore-tested؛
- پرداخت اشتراک CHIDA و OTP: adapter مستقل برای دو ارائه‌دهندهٔ داخلی در هر حوزه؛
- AI: provider adapter قراردادی یا degraded mode؛
- DNS: zone export آفلاین و runbook تغییر registrar/nameserver؛
- repository: GitHub private با account recovery و در آینده mirror رمزگذاری‌شده در صورت تصویب.

## PoCهای لازم پیش از انتخاب

1. deploy و rollback همان OCI image؛
2. latency و availability از چند شبکهٔ ایران؛
3. PostgreSQL backup و restore کامل؛
4. object upload/download، checksum، quarantine و restore؛
5. failover OTP بدون تکرار ارسال یا دورزدن rate limit؛
6. subscription-payment idempotency و reconciliation بدون انجام تراکنش واقعی در fixture test؛
7. AI timeout، provider failure و redaction؛
8. DNS purge، WAF، crawler و origin failure؛
9. export داده و خروج از vendor؛
10. محاسبهٔ هزینه در بار پایه و جهش.

## منابع رسمی

- [Liara PaaS](https://developers.liara.ir/pages/paas)
- [Liara DBaaS](https://developers.liara.ir/pages/dbaas)
- [Liara Object Storage](https://developers.liara.ir/pages/object-storage)
- [Liara Mail](https://developers.liara.ir/pages/mail)
- [Liara AI](https://liara.ir/products/ai)
- [ParsPack CDN](https://parspack.com/cdn)
- [ParsPack Cloud Storage](https://parspack.com/cloud-storage)
- [NSIN API](https://nsin.ir/docs/api/reference/)
- [Kavenegar REST API](https://kavenegar.com/rest.html)
- [IPPanel API](https://apidoc.ippanel.com/)
- [Zarinpal Payment Gateway](https://www.zarinpal.com/docs/paymentGateway/)
- [Neshan API](https://platform.neshan.org/api/)
- [Watchlog](https://watchlog.ir/)
- [Metrix documentation](https://docs.metrix.ir/)
- [OpenAI supported countries and territories](https://help.openai.com/en/articles/5347006-openai-api-supported-countries-and-territories)
- [Anthropic supported countries and regions](https://www.anthropic.com/supported-countries)
- [Gemini API available regions](https://ai.google.dev/gemini-api/docs/available-regions)
- [OFAC Iran-related designations, 2023-06-02](https://ofac.treasury.gov/recent-actions/20230602)
