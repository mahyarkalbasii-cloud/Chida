---
title: "چیدا — سند زیرساخت، گزینه‌های ارائه‌دهنده و سناریوهای هزینه"
document_type: "Infrastructure & Provider Selection"
version: "0.9"
status: "Baseline کاری — پیش از انتخاب Provider نهایی"
date: "۲۷ اوت ۲۰۲۶"
language: "fa-IR"
audience:
  - "تیم مؤسس"
  - "محصول و فنی"
  - "مالی و عملیات"
---

# چیدا

## سند زیرساخت، گزینه‌های ارائه‌دهنده و سناریوهای هزینه

**نسخهٔ ۰.۹ — ۲۷ اوت ۲۰۲۶**

> این سند برای حفظ تصمیم‌ها و یافته‌های زیرساختی چیدا پیش از انتقال بحث به چت جدید نوشته شده است. معماری و اصولی که در این سند «تأییدشده» نامیده شده‌اند Baseline فعلی‌اند؛ انتخاب فروشنده، SLA، قیمت قراردادی و ظرفیت نهایی هنوز باید با Benchmark، Quote و پایلوت تثبیت شوند.

# ۱. جایگاه سند

این سند مکمل دو مرجع موجود چیداست:

- «چیدا — سند مادر تعریف محصول»؛ مالک تعریف محصول، مرزها و معماری منطقی هفت‌لایه؛
- «چیدا — سند اقتصاد، قیمت‌گذاری، مصرف و زیرساخت»؛ مالک Pricing، پلن‌ها، CU، Limit، COGS و هدف سود.

این سند به‌طور اختصاصی مالک این سؤال‌هاست:

- سرویس چیدا روی چه نوع زیرساختی اجرا شود؟
- چه اجزایی Managed باشند و چه چیزهایی را خود چیدا مالک شود؟
- Providerها با چه ترتیبی انتخاب شوند؟
- AI Gateway اصلی و Failover چه شرایطی داشته باشند؟
- زیرساخت در مقیاس‌های بدون کاربر، کم، متوسط و زیاد تقریباً چقدر هزینه دارد؟
- چه مقدار سرمایهٔ درگردش برای API و Production لازم است؟
- قبل از Launch عمومی چه تست‌هایی باید پاس شوند؟

# ۲. تصمیم‌های تثبیت‌شده تا این نقطه

۱. **اکوسیستم هوش پایه: OpenAI.** چیدا قرار نیست برای کاهش قیمت، تجربهٔ اصلی را روی مجموعه‌ای از مدل‌های درجه‌دو یا صرفاً مدل‌های متن‌باز ارزان بنا کند. Positioning محصول، دسترسی به مدل‌های State-of-the-Art همراه با هارنس تخصصی چیداست.

۲. **سه مسیر اصلی مدل:** `Luna / Terra / Sol` با مسیریابی خودکار توسط CHIDA Model Gateway. کاربر نباید برای نتیجهٔ صحیح مجبور به شناخت مدل‌ها باشد.

۳. **Provider-independent Model Gateway:** چیدا نباید به یک واسطه یا Base URL خاص قفل شود. تمام درخواست‌های مدل از Gateway خود چیدا عبور می‌کنند و حداقل یک Provider اصلی و یک Provider Failover خواهند داشت.

۴. **Managed-first:** در V1 سرور فیزیکی، رک، GPU یا سخت‌افزار inference خریداری نمی‌شود. مدل‌ها از API اجرا می‌شوند و زمان تیم باید روی محصول، هارنس، داده و تجربه صرف شود.

۵. **Production به دفتر وابسته نیست.** قطع برق یا اینترنت دفتر نباید CHIDA را Down کند.

۶. **Primary داخل ایران، DR مستقل** توصیهٔ فعلی است؛ زیرا کاربران اصلی داخل ایران‌اند و Upload فایل، PDF، عکس و Voice نباید برای هر تعامل ساده وابسته به مسیر بین‌المللی باشد. این توصیه هنوز به معنای انتخاب یک Vendor خاص نیست.

۷. **Object Storage مستقل از AI Provider** نگهداری می‌شود. فایل‌های دائمی کاربران نباید صرفاً برای convenience در File Search Storage یک Provider مدل نگهداری شوند.

۸. **دو Ledger اقتصادی:** Usage Ledger بر پایهٔ CU و Actual Cost Ledger بر پایهٔ قبض واقعی Provider و زیرساخت. Metering باید از روز اول به تفکیک User، Plan، Model، Provider و Feature قابل مشاهده باشد.

# ۳. معماری مرجع V1

```text
User / PWA
    │
    ▼
Edge / CDN / WAF / Rate Limiting
    │
    ▼
CHIDA Application API ───────────────► Object Storage
    │                                      │
    ├────────► PostgreSQL ◄────────────────┤
    │
    ├────────► Cache / Redis
    │
    ├────────► Durable Queue / Workers
    │
    └────────► Observability / Audit
    │
    ▼
CHIDA Model Gateway
    │
    ├────────► AI Gateway A — Primary
    ├────────► AI Gateway B — Failover
    └────────► Additional routes / Direct when available
```

## ۳.۱ چیزی که CHIDA باید خودش مالک باشد

- منطق `Luna / Terra / Sol` routing؛
- Context assembly و memory retrieval؛
- Reference Rate Card و CU metering؛
- Actual Cost Ledger؛
- Provider selection و failover؛
- model/version allowlist؛
- caching policy؛
- retry، timeout و idempotency؛
- budget guard و abuse control؛
- data minimization پیش از ارسال به Provider؛
- audit و observability.

## ۳.۲ چیزی که بهتر است Managed باشد

- Application runtime یا container platform؛
- PostgreSQL؛
- Object Storage؛
- Redis/Valkey در صورت نیاز؛
- Queue یا حداقل زیرساخت durable queue؛
- Backup و snapshot؛
- Edge/CDN/WAF؛
- Metrics، logs و error tracking.

# ۴. ترتیب انتخاب Providerها

انتخاب Provider باید به این ترتیب انجام شود:

۱. **AI Gateway Primary و Secondary**؛ چون مدل، API parity، rate limit و latency آن‌ها روی محل استقرار Core اثر می‌گذارد.

۲. **Infrastructure Provider اصلی**؛ PaaS/IaaS، PostgreSQL، شبکه و Runtime.

۳. **Object Storage / CDN / WAF**؛ لازم نیست از همان فروشندهٔ Core خریداری شود.

۴. **Backup / Disaster Recovery Provider**؛ عمداً Failure Domain جدا از Primary.

۵. **Monitoring، Email، SMS/Notification و سرویس‌های جانبی.**

> هدف انتخاب «یک شرکت برای همه‌چیز» نیست؛ هدف ساخت Provider Stack قابل‌تعویض و قابل‌اعتماد است.

# ۵. گزینه‌های AI Gateway — وضعیت فعلی تحقیق

## ۵.۱ AvalAI

**وضعیت: کاندیدای جدی برای Primary؛ هنوز انتخاب نهایی نیست.**

مواردی که از مستندات رسمی فعلی تأیید شده‌اند:

- مدل‌های `gpt-5.6-luna`، `gpt-5.6-terra` و `gpt-5.6-sol`؛
- `/v1/responses`، `/v1/chat/completions` و `/v1/batch` برای خانوادهٔ 5.6؛
- Streaming، Function Calling، Vision/PDF، Prompt Caching، Structured Output، Reasoning و Web Search؛
- API سازگار با OpenAI SDK و Base URL اختصاصی؛
- Rate Limitهای چندسطحی که در Tierهای بالاتر تا ظرفیت سازمانی بالا می‌روند.

**ریسک/ابهام مهم:** مستندات عمومی AvalAI در صفحات مختلف دربارهٔ قیمت بعضی مدل‌ها، به‌خصوص Sol، کاملاً یکدست نیست و قیمت آن نیز الزاماً با قیمت مرجع رسمی OpenAI یکی نیست. بنابراین برای چیدا، قیمت عمومی سایت نباید Contract Baseline تلقی شود. Billing واقعی با Call آزمایشی و Quote سازمانی باید اندازه‌گیری شود.

## ۵.۲ Liara AI

**وضعیت: کاندیدای Secondary / Benchmark؛ پوشش دقیق خانوادهٔ 5.6 باید مستقیم تأیید شود.**

از صفحات رسمی فعلی این موارد قابل مشاهده است:

- AI API با مدل‌های چند Provider؛
- Streaming و Function Calling برای مدل‌های پشتیبانی‌شده؛
- داشبورد تعداد درخواست، توکن و هزینه؛
- پلن AI با Rate Limit منتشرشده و Token allowance؛
- مزیت بالقوهٔ یکپارچگی با PaaS/DBaaS/Object Storage خود لیارا.

اما قبل از انتخاب برای CHIDA باید دقیقاً تأیید شود:

- `Luna / Terra / Sol` با همان شناسه/نسخهٔ موردنظر؛
- Responses API parity؛
- Prompt Caching و usage fields؛
- Web Search و Hosted Tools؛
- Enterprise rate limit و SLA؛
- privacy/retention.

## ۵.۳ ArvanCloud AIaaS

**وضعیت: کاندیدای مهم بازار؛ نیازمند بررسی مستقیم پنل/مستندات و Quote سازمانی.**

آروان به‌دلیل اکوسیستم ابری داخلی، CDN و احتمال یکپارچگی با زیرساخت CHIDA ارزش حضور در Bake-off را دارد. در این دور تحقیق، اطلاعات رسمی عمومی کافی برای تأیید جزئیات GPT-5.6، API parity و قیمت سازمانی بازیابی نشد؛ بنابراین هیچ قابلیت خاصی در این سند برای آن قطعی فرض نمی‌شود.

## ۵.۴ GapGPT

**وضعیت: کاندیدای Failover/Benchmark؛ نیازمند API Docs و قرارداد مستقیم.**

وجود API و Status Page عمومی قابل مشاهده است، اما برای Production CHIDA باید موارد زیر مستقیماً تأیید شوند:

- مدل دقیق و نسخه؛
- Responses API و Tools؛
- Pricing/markup؛
- usage metadata؛
- rate limits؛
- SLA و escalation؛
- retention و privacy.

## ۵.۵ نتیجهٔ فعلی AI Provider

> **AvalAI فعلاً از نظر مستندات و پوشش GPT-5.6 جلوتر است، اما هنوز برندهٔ نهایی نیست.** Primary و Secondary فقط پس از Benchmark یکسان و بررسی Billing واقعی انتخاب می‌شوند.

# ۶. معیار امتیازدهی AI Gateway

| معیار | وزن پیشنهادی |
|---|---:|
| دسترسی سریع و دقیق به آخرین OpenAI models/features | 25٪ |
| قیمت، Markup و ثبات تعرفه | 20٪ |
| Reliability، SLA و latency | 15٪ |
| Responses API، Tools، Caching، Vision و Usage metadata | 15٪ |
| Rate Limit و امکان افزایش سازمانی | 10٪ |
| Privacy، Retention و Security | 5٪ |
| Latency از زیرساخت ایران | 5٪ |
| B2B support، قرارداد و escalation | 5٪ |

**Failover فقط وقتی Silent است که Provider دوم همان مدل و سطح قابلیت را بدهد.** جایگزینی Sol با مدل دیگری بدون سیاست روشن مجاز نیست.

# ۷. گزینه‌های زیرساخت اصلی

## ۷.۱ گزینه A — Managed Cloud داخل ایران

**توصیهٔ فعلی برای V1، مشروط به Benchmark.**

مزایا:

- latency پایین‌تر کاربران ایرانی برای UI و فایل؛
- Upload عکس، PDF و Voice روی شبکه داخلی؛
- هزینهٔ ریالی و معمولاً پایین‌تر؛
- سادگی عملیات با PaaS/DBaaS؛
- عدم وابستگی Interactionهای عادی به اینترنت بین‌الملل.

ریسک‌ها:

- کیفیت Managed DB و HA باید عملاً تست شود؛
- DR نباید در همان Failure Domain باشد؛
- مسیر AI Gateway باید پایدار باشد؛
- SLA واقعی و زمان پاسخ پشتیبانی اهمیت دارد.

### Liara به‌عنوان Candidate قابل‌محاسبه

لیارا در صفحات رسمی فعلی این اجزا را ارائه می‌کند:

- PaaS؛
- IaaS؛
- DBaaS شامل PostgreSQL و Redis؛
- Object Storage سازگار با S3؛
- موقعیت ایران و پهنای باند داخلی؛
- پرداخت ساعتی/ماهانه.

قیمت عمومی فعلی نمونه:

| پلن منابع | RAM | CPU | قیمت ماهانه عمومی |
|---|---:|---:|---:|
| زحل | 4 GB | 2 Core | حدود **1.069M تومان** |
| اورانوس | 8 GB | 4 Core | حدود **1.979M تومان** |
| نپتون | 16 GB | 8 Core | حدود **3.739M تومان** |
| پلوتون | 32 GB | 16 Core | حدود **7.099M تومان** |

Object Storage پایهٔ منتشرشده: حدود **209 هزار تومان برای 20GB**. هزینه و SLA حجم‌های بزرگ‌تر باید Quote شود.

### نمونهٔ Raw Stack برای حدود ۱۰۰۰ کاربر

این فقط نمونهٔ محاسباتی از قیمت عمومی است، نه Purchase Order:

| جزء | نمونه منابع | هزینه عمومی تقریبی |
|---|---|---:|
| App/API | 2 × `8GB / 4CPU` | **3.96M تومان** |
| Background Workers | 2 × `8GB / 4CPU` | **3.96M** |
| PostgreSQL | `16GB / 8CPU` DBaaS | **3.74M** |
| Redis | `4GB / 2CPU` DBaaS | **1.07M** |
| Object Storage پایه | 20GB | **0.21M** |
| **جمع خام** | بدون HA اضافه، CDN، DR و Monitoring | **≈12.93M تومان/ماه** |

این عدد نشان می‌دهد برآورد قبلی `$1,000–$2,500/month` برای ۱۰۰۰ کاربر، اگر Primary روی Cloud داخلی Managed باشد، احتمالاً **بیش از حد محافظه‌کارانه** بوده است. اما جمع خام بالا هنوز Production Budget نیست؛ باید redundancy، ترافیک، backup، WAF/CDN، observability، DR و headroom به آن اضافه شود.

**Planning Envelope فعلی برای ۵۰۰–۱۰۰۰ کاربر:** حدود **25M تا 70M تومان در ماه** برای زیرساخت غیر-AI، تا زمان دریافت Quote واقعی.

## ۷.۲ گزینه B — ArvanCloud / Stack داخلی دیگر

آروان باید در Benchmark زیرساخت حضور داشته باشد، به‌خصوص به‌خاطر CDN، شبکه و اکوسیستم ابری. تصمیم نهایی باید با مقایسهٔ عملی این موارد گرفته شود:

- PaaS/Container یا VM؛
- Managed PostgreSQL و HA؛
- Object Storage؛
- CDN/WAF/DDoS؛
- private networking؛
- backup و snapshot؛
- API automation؛
- قیمت ترافیک؛
- SLA B2B.

در این نسخه هیچ عددی برای آروان بدون Quote رسمی تثبیت نمی‌شود.

## ۷.۳ گزینه C — Hybrid ایران + DR خارج

**از نظر معماری مورد علاقهٔ فعلی برای Production mature.**

- Primary app/data plane در ایران؛
- Backup یا DR روی Provider و Failure Domain مستقل؛
- امکان نگهداری نسخهٔ رمزنگاری‌شده خارج ایران فقط پس از تصمیم حقوقی/حریم خصوصی؛
- AI Gateway مستقل از هر دو.

این معماری ریسک خرابی یک Provider را کم می‌کند، بدون اینکه latency روزمرهٔ کاربران را به خارج منتقل کند.

## ۷.۴ گزینه D — Core اروپا

AWS/Hetzner/Cloudflare یا Stack مشابه در اروپا باید به‌عنوان **Fallback architecture** باقی بماند، نه انتخاب پیش‌فرض فعلی.

مزایا:

- Managed Services بالغ؛
- HA و DR استاندارد؛
- ecosystem گسترده.

معایب برای CHIDA:

- مسیر کاربر ایرانی به Core خارجی؛
- Upload فایل و Voice وابسته‌تر به اینترنت بین‌الملل؛
- معمولاً هزینهٔ بیشتر نسبت به Cloud داخلی.

اگر Benchmark داخلی از نظر SLA یا Data durability قابل قبول نباشد، این گزینه دوباره Primary candidate می‌شود.

# ۸. منابع ظرفیت مرجع

## ۸.۱ Production بدون یا با کاربر بسیار کم

هدف: سرویس واقعاً Production باشد، نه Demo.

- حداقل دو App instance یا PaaS replica؛
- یک Worker با امکان scale؛
- PostgreSQL managed حدود 4–8GB RAM؛
- Redis کوچک در صورت نیاز؛
- Object Storage؛
- backup و monitoring؛
- AI Gateway primary + credential مسیر دوم.

**بودجهٔ برنامه‌ریزی غیر-AI:** حدود **8M تا 20M تومان در ماه**.

## ۸.۲ مصرف کم — حدود ۵۰ تا ۱۰۰ کاربر پولی

- 2 App instance حدود 4–8GB؛
- 1–2 Worker؛
- PostgreSQL حدود 8GB؛
- Redis 2–4GB؛
- چند ده تا چندصد GB Object Storage؛
- backup/monitoring/WAF.

**بودجهٔ برنامه‌ریزی غیر-AI:** حدود **12M تا 30M تومان/ماه**.

## ۸.۳ مصرف متوسط — حدود ۵۰۰ تا ۱۰۰۰ کاربر پولی

Baseline مرجع:

- App/API: حداقل 2 × `4 vCPU / 8GB`؛
- Worker: حداقل 2 × `4 vCPU / 8GB`؛
- PostgreSQL: حدود `4–8 vCPU / 16GB`، backup + PITR؛
- Redis: حدود `2 vCPU / 4GB`؛
- Object Storage: چندصد GB تا حدود 1TB؛
- durable queue؛
- CDN/WAF/rate limiting؛
- monitoring + tracing؛
- backup مستقل.

**بودجهٔ برنامه‌ریزی غیر-AI:** حدود **25M تا 70M تومان/ماه**.

## ۸.۴ مصرف زیاد — حدود ۵۰۰۰ تا ۱۰٬۰۰۰ کاربر پولی

در این Scale نباید یک «سرور خیلی بزرگ» خرید. معماری باید scale-out شود:

- چند App replica؛
- worker pool با autoscaling؛
- PostgreSQL بزرگ‌تر + read replica/HA بر اساس Load Test؛
- Redis HA؛
- queue partitioning در صورت نیاز؛
- چند TB Object Storage؛
- observability جدی و SLO؛
- DR drill منظم.

**Planning Envelope اولیه:** حدود **100M تا 300M تومان/ماه** برای زیرساخت غیر-AI. این بازه فقط ظرفیت بودجه است و باید با Load Test و Quote واقعی جایگزین شود.

# ۹. هزینهٔ AI/API در چهار سناریو

برای دید مقیاس، Mix اقتصادی مرجع فعلی استفاده می‌شود:

- 65٪ Base؛
- 22٪ Max 5×؛
- 10٪ Max 10×؛
- 3٪ Max 20×.

AI COGS مرجع هر Plan از سند اقتصاد گرفته شده و شامل مدل‌ها + سایر هزینه‌های OpenAI مرجع است، اما **زیرساخت CHIDA را شامل نمی‌شود**.

| Paid Users | AI/API مرجع با Markup 0٪ | با Markup 20٪ | با Markup 30٪ |
|---:|---:|---:|---:|
| 0 | فقط Dev/Test: حدود **$50–$300** | وابسته به Provider | وابسته به Provider |
| 50 | **≈281M تومان / $1.41k** | **≈337M / $1.69k** | **≈365M / $1.83k** |
| 100 | **≈562M / $2.81k** | **≈674M / $3.37k** | **≈731M / $3.65k** |
| 500 | **≈2.81B / $14.05k** | **≈3.37B / $16.86k** | **≈3.65B / $18.27k** |
| 1,000 | **≈5.62B / $28.10k** | **≈6.74B / $33.72k** | **≈7.31B / $36.53k** |
| 5,000 | **≈28.10B / $140.5k** | **≈33.72B / $168.6k** | **≈36.53B / $182.7k** |
| 10,000 | **≈56.21B / $281k** | **≈67.45B / $337k** | **≈73.07B / $365k** |

مبنای تبدیل صرفاً برای این مدل: `$1 = 200,000 تومان`.

> نتیجهٔ کلیدی: در Scale، **AI/API چند مرتبه بزرگ‌تر از Hosting معمولی است.** اقتصاد CHIDA را Model Routing، CU و قرارداد AI Gateway تعیین می‌کند؛ نه خرید چند CPU بیشتر.

# ۱۰. هزینهٔ کل دیجیتال برای برنامه‌ریزی Launch

| سناریو | AI/API تقریبی | زیرساخت غیر-AI | Burn دیجیتال تقریبی |
|---|---:|---:|---:|
| Production بدون کاربر | `$50–$300` Dev/Test | **8–20M تومان** | حدود **18–80M تومان** بسته به تست و Provider |
| 50 کاربر | **281–365M** | **12–25M** | **≈293–390M تومان/ماه** |
| 100 کاربر | **562–731M** | **12–30M** | **≈574–761M** |
| 500 کاربر | **2.81–3.65B** | **20–50M** | **≈2.83–3.70B** |
| 1,000 کاربر | **5.62–7.31B** | **25–70M** | **≈5.65–7.38B** |
| 5,000–10,000 | AI طبق Mix و Usage واقعی | **100–300M** | تقریباً توسط AI/API تعیین می‌شود |

بازهٔ AI در جدول از Markup صفر تا حدود ۳۰٪ را پوشش می‌دهد؛ قیمت و FX spread واقعی Provider می‌تواند متفاوت باشد.

# ۱۱. سرمایهٔ درگردش پیشنهادی برای Launch

اگر اپ امروز آماده بود:

- برای Production خالی یا تست محدود: **حداقل $1k–$2k نقد/اعتبار عملیاتی** کافی است، به شرط اینکه مصرف عمومی شروع نشده باشد؛
- برای Launch کنترل‌شدهٔ ۵۰–۱۰۰ کاربر: **حداقل $5k Working Reserve** برای AI + زیرساخت منطقی است؛
- برای رسیدن سریع به حدود ۵۰۰ کاربر: **$15k–$25k Reserve** محافظه‌کارانه‌تر است؛
- Billing alert و auto-top-up باید قبل از Scale فعال باشند.

Reserve به معنای هزینهٔ حتمی نیست؛ هدف جلوگیری از قطع سرویس به‌علت کمبود اعتبار یا Spike مصرف است.

# ۱۲. حداقل‌های عملیات Production

## ۱۲.۱ دیتابیس

- PostgreSQL managed؛
- backup خودکار؛
- Point-in-Time Recovery؛
- encryption at rest/in transit؛
- migration policy؛
- restore test؛
- HA یا حداقل مسیر ارتقای سریع به HA.

## ۱۲.۲ فایل

- S3-compatible Object Storage؛
- signed URL؛
- versioning برای اشیای حساس در صورت نیاز؛
- lifecycle policy؛
- malware/file safety controls؛
- backup سیاست‌گذاری‌شده.

## ۱۲.۳ Queue و کار پس‌زمینه

- durable queue؛
- retry policy؛
- Dead Letter Queue؛
- idempotency؛
- worker concurrency control؛
- visibility برای Job state.

## ۱۲.۴ Observability

از روز اول:

- uptime؛
- API latency P50/P95/P99؛
- DB load؛
- queue depth؛
- error rate؛
- provider error rate؛
- OpenAI/Gateway cost per request؛
- CU per request/user/plan؛
- failover events؛
- storage growth؛
- backup/restore status.

## ۱۲.۵ امنیت

- API key فقط سمت سرور؛
- secrets manager؛
- least privilege؛
- tenant isolation؛
- audit log؛
- rate limit و abuse guard؛
- data minimization برای Provider؛
- encrypted backups؛
- access review.

# ۱۳. اینترنت دفتر

برای دفتر:

- دو ISP ثابت مستقل؛
- 4G/5G backup؛
- router با automatic failover؛
- UPS برای شبکه؛
- secure administrative access.

اما این‌ها **جزء مسیر Production نیستند**. اگر دفتر کامل قطع شود، کاربران باید همچنان به CHIDA دسترسی داشته باشند.

# ۱۴. Benchmark لازم قبل از انتخاب Provider

## ۱۴.۱ AI Gateway Bake-off

برای هر Candidate دقیقاً یک Test Suite اجرا شود:

1. Luna — پاسخ ساده و پرتعداد؛
2. Terra — workflow عملیاتی متوسط؛
3. Sol — agent/research سنگین؛
4. Streaming؛
5. Vision/PDF؛
6. Function/Tool Calling؛
7. Structured Output؛
8. Prompt Caching؛
9. Web Search؛
10. Usage metadata و billing واقعی؛
11. Retry و timeout؛
12. Concurrency / rate limits؛
13. latency از سرور داخل ایران؛
14. Failover به Provider دوم؛
15. بررسی retention/privacy قراردادی.

خروجی نهایی: Score از 100 + Actual Cost + Failure Notes.

## ۱۴.۲ Infrastructure Bake-off

حداقل Liara و ArvanCloud، و در صورت نیاز یک گزینهٔ سوم، با workload یکسان تست شوند:

- deploy و rollback؛
- latency داخلی؛
- throughput upload؛
- managed PostgreSQL reliability؛
- backup/restore؛
- private networking؛
- object storage؛
- logs/metrics؛
- automation API؛
- support response؛
- هزینه در Load ثابت؛
- رفتار در failure.

# ۱۵. تصمیم‌های باز که باید در چت بعدی بسته شوند

## AI Gateway

- Primary Provider؛
- Secondary/Failover Provider؛
- Enterprise pricing/markup؛
- rate limits؛
- SLA؛
- retention/privacy؛
- API parity و مدل دقیق.

## Infrastructure

- Primary Cloud Provider؛
- PaaS در برابر IaaS برای App/Workers؛
- Managed PostgreSQL Vendor؛
- Object Storage Vendor؛
- CDN/WAF Vendor؛
- DR location/provider؛
- target RPO/RTO.

## Capacity

- Concurrency per Plan؛
- Worker autoscaling؛
- initial storage quota؛
- log retention؛
- HA level قبل و بعد از ۱۰۰۰ کاربر.

# ۱۶. پیشنهاد فعلی برای نقطهٔ شروع

اگر مجبور بودیم امروز بدون Bake-off انتخاب موقت کنیم:

- **Architecture:** Managed-first، Primary ایران، DR مستقل؛
- **AI:** CHIDA Model Gateway با حداقل دو upstream؛
- **AI Primary Candidate:** AvalAI برای تست اول، نه تصمیم نهایی؛
- **Infrastructure Candidate اول برای محاسبه:** Liara، چون PaaS + DBaaS + Object Storage و قیمت عمومی قابل محاسبه دارد؛
- **Infrastructure Candidate الزامی برای مقایسه:** ArvanCloud؛
- **GPU/Physical Server:** هیچ‌کدام؛
- **Scale:** از منابع متوسط شروع و با Load Test scale-out؛
- **اصل مالی:** AI/API را سخت‌گیرانه Meter کنیم؛ Hosting را بیش از نیاز Overbuild نکنیم.

# ۱۷. جمع‌بندی

زیرساخت چیدا نباید تبدیل به پروژهٔ اصلی شرکت شود. مزیت CHIDA در سرور و دیتاسنتر نیست؛ در هارنس، دانش، حافظه، UX و گردش‌کار صنعت ساختمان است.

معماری درست V1 باید سه ویژگی داشته باشد:

> **Managed باشد، Provider-independent باشد و هزینهٔ هر کاربر را قابل‌اندازه‌گیری کند.**

در Scale فعلی، هزینهٔ AI/API بسیار بزرگ‌تر از Hosting است. بنابراین بزرگ‌ترین ریسک اقتصادی، انتخاب نادرست مدل و Provider، نبود Metering و Markup نامعلوم Gateway است؛ نه اینکه App Server چهار هسته داشته باشد یا هشت هسته.

مرحلهٔ بعدی، **انتخاب AI Gateway Primary/Secondary با Benchmark واقعی** و سپس انتخاب Cloud Provider اصلی است. بعد از این دو تصمیم، سناریوهای هزینه از «برآورد مهندسی» به Budget قابل اتکاتر تبدیل می‌شوند.

# پیوست الف: منابع وب و تاریخ بررسی

**تاریخ بررسی: ۲۷ اوت ۲۰۲۶**

- AvalAI — GPT-5.6 Sol: https://docs.avalai.org/fa/models/gpt-5.6-sol
- AvalAI — GPT-5.6 Terra: https://docs.avalai.org/fa/models/gpt-5.6-terra
- AvalAI — GPT-5.6 Luna: https://docs.avalai.org/fa/models/gpt-5.6-luna
- AvalAI — Pricing: https://docs.avalai.org/fa/pricing
- Liara — Pricing / PaaS / DBaaS / IaaS / Object Storage / AI: https://liara.ir/pricing/
- Liara — Main cloud products: https://liara.ir/
- GapGPT Status: https://status.gapgpt.app/

# پیوست ب: وضعیت تصمیم‌ها

| موضوع | وضعیت |
|---|---|
| OpenAI به‌عنوان اکوسیستم هوش پایه | **تأییدشده** |
| Luna / Terra / Sol routing | **تأییدشده** |
| CHIDA Model Gateway مستقل | **تأییدشده** |
| Managed-first و عدم خرید GPU/سرور فیزیکی در V1 | **تأییدشده** |
| Primary داخل ایران + DR مستقل | **توصیهٔ Baseline؛ Vendor باز** |
| AvalAI به‌عنوان Primary | **کاندیدا؛ تصمیم باز** |
| Provider دوم AI | **تصمیم باز** |
| Liara به‌عنوان Cloud اصلی | **کاندیدا؛ تصمیم باز** |
| ArvanCloud به‌عنوان Cloud اصلی | **کاندیدا؛ تصمیم باز** |
| هزینه‌های این سند | **برآورد مهندسی؛ نیازمند Quote و Load Test** |
