---
title: "چیدا — سند اقتصاد، قیمت‌گذاری، مصرف و زیرساخت"
document_type: "Economics, Pricing, Usage & Infrastructure Baseline"
version: "1.0"
status: "مرجع پیشنهادی V1 — نیازمند کالیبراسیون با داده واقعی"
date: "۲۷ اوت ۲۰۲۶"
language: "fa-IR"
---

# چیدا

## سند اقتصاد، قیمت‌گذاری، مصرف و زیرساخت

**نسخه ۱.۰ — ۲۷ اوت ۲۰۲۶**

> این سند، مرجع اقتصادی و عملیاتی پیشنهادی برای قیمت‌گذاری، مصرف، کنترل هزینه و زیرساخت V1 چیداست. اعداد مصرف و COGS در این نسخه «برآورد مهندسی» هستند و باید با داده‌ی واقعی پایلوت کالیبره شوند. قیمت‌ها و محدودیت‌های تجاریِ تأییدشده از برآوردهای هزینه و تصمیم‌های باز جدا نگه داشته شده‌اند.

---

# ۱. جایگاه سند و قاعده تفسیر

این سند مکمل «چیدا — سند مادر تعریف محصول، نسخه ۱.۰» است. سند مادر، چیدا را محصولی با یک هارنس مستقل، مسیریابی خودکار میان مدل‌های `Luna / Terra / Sol`، کارهای پس‌زمینه، فایل، وب، حافظه و زیرساخت ابری تعریف می‌کند و صریحاً قیمت‌گذاری و مدل درآمد را خارج از محدوده‌ی آن سند می‌داند. بنابراین این سند مالک تصمیم‌های اقتصادی و زیرساختی V1 است و نباید دامنه‌ی محصول را توسعه دهد.

در این سند:

- **تصمیم تثبیت‌شده** یعنی مبنایی که در گفت‌وگوی مؤسس تأیید شده و برای V1 روی آن کار می‌کنیم؛
- **Baseline** یعنی عدد یا طراحی مرجع برای برنامه‌ریزی که با داده‌ی واقعی قابل اصلاح است؛
- **برآورد مهندسی** یعنی عددی که هنوز از قبض واقعی Provider یا رفتار کاربران استخراج نشده است؛
- **تصمیم باز** یعنی موردی که پیش از Launch عمومی باید بسته شود.

مهم‌ترین قاعده‌ی مالی:

> **قیمت‌گذاری باید کیفیت State-of-the-Art را ممکن کند، اما هیچ کاربر یا پلنی نباید بتواند به‌صورت ساختاری بیشتر از ارزش اقتصادی خود هزینه ایجاد کند.**

---

# ۲. خلاصه مدیریتی

## تصمیم‌های اصلی

۱. قیمت مرجع چیدا **دلاری** است. تومان فقط معادل پرداخت/نمایش محلی بر اساس سیاست نرخ تبدیل خواهد بود.

۲. پلن‌های V1:

| پلن | ظرفیت اسمی | ماهانه | سالانه | منطق سالانه |
|---|---:|---:|---:|---|
| Base | `1×` | **$30** | **$300** | ۱۲ ماه استفاده، پرداخت ۱۰ ماه |
| Max 5× | `5×` | **$150** | **$1,500** | ۱۲ ماه استفاده، پرداخت ۱۰ ماه |
| Max 10× | `10×` | **$270** | **$2,700** | ۱۲ ماه استفاده، پرداخت ۱۰ ماه |
| Max 20× | `20×` | **$450** | **$4,500** | ۱۲ ماه استفاده، پرداخت ۱۰ ماه |

۳. هدف مالی: **حداقل ۲۰٪ حاشیه سود خالص هدف** پس از پوشش هزینه‌های دیجیتال و هزینه‌های اداری/انسانی تخصیص‌یافته.

۴. محدودیت مصرف:

- Base: **روزانه**؛
- Max 5× / 10× / 20×: **هفتگی**؛
- واحد مصرف، توکن خام یا تعداد پیام نیست؛ **CHIDA Usage Unit (`CU`)** است.

۵. تعریف CU:

> **۱٬۰۰۰ CU = یک دلار هزینه‌ی دیجیتال متغیر مرجع.**

CU برای حق مصرف کاربر است. هم‌زمان یک **Actual Cost Ledger** مستقل، هزینه‌ی واقعی Provider و زیرساخت را ثبت می‌کند.

۶. Limit اولیه V1:

| پلن | Limit مرجع |
|---|---:|
| Base | **400 CU / روز** |
| Max 5× | **14,000 CU / هفته** |
| Max 10× | **28,000 CU / هفته** |
| Max 20× | **56,000 CU / هفته** |

۷. زیرساخت V1: **خرید سرور فیزیکی و GPU توصیه نمی‌شود.** هسته‌ی سرویس روی Managed Cloud داخل ایران، با Provider-independent Model Gateway و حداقل دو مسیر AI Provider طراحی می‌شود. DR باید روی Provider یا دامنه‌ی خرابی مستقل باشد.

۸. COGS فعلی با قیمت مرجع OpenAI محاسبه شده است، نه با قرارداد نهایی Gateway ایرانی. Markup، SLA و سیاست داده‌ی Provider ایرانی باید پیش از Launch وارد مدل شود.

---

# ۳. استراتژی قیمت‌گذاری

## ۳.۱ چرا دلار واحد مرجع است؟

بخش اصلی COGS چیدا به مدل‌های خارجی و سرویس‌های دلاری یا دلار-مبنا وابسته است. قیمت‌گذاری ثابت ریالی در قراردادهای سالانه می‌تواند با تغییر نرخ ارز، Margin را از بین ببرد. بنابراین:

- List Price به دلار تعریف می‌شود؛
- پرداخت داخل ایران می‌تواند ریالی باشد؛
- معادل ریالی بر اساس سیاست نرخ تبدیل در زمان صدور فاکتور محاسبه می‌شود؛
- برای قرارداد سالانه، پس از دریافت وجه باید بودجه‌ی COGS دلاری دوره تا حد معقول Hedge یا Prepay شود؛ صرف نوشتن قیمت به دلار، اگر کل وجه سالانه به ریال نگهداری شود، ریسک ارزی را حذف نمی‌کند.

برای مثال‌های این نسخه، فقط جهت مقایسه از **هر دلار = ۲۰۰ هزار تومان** استفاده شده است. این عدد قیمت رسمی محصول نیست و باید به‌عنوان متغیر مالی نگه داشته شود.

## ۳.۲ منطق نردبان قیمت

| پلن | قیمت ماهانه | قیمت خطی اگر هر `1× = $30` بود | تخفیف حجمی | قیمت هر `1×` |
|---|---:|---:|---:|---:|
| Base 1× | $30 | $30 | ۰٪ | $30.00 |
| Max 5× | $150 | $150 | ۰٪ | $30.00 |
| Max 10× | $270 | $300 | **۱۰٪** | $27.00 |
| Max 20× | $450 | $600 | **۲۵٪** | $22.50 |

این ساختار عمداً باعث می‌شود ارزش هر واحد مصرف در پلن‌های بالاتر بهتر شود. `10×` پل میانی حرفه‌ای است، اما نباید آن‌قدر ارزان شود که نقطه‌ی توقف کاربران حرفه‌ای باشد. `20×` بهترین Value per Capacity را می‌دهد و در عوض باید با Metering و Limit دقیق محافظت شود.

## ۳.۳ قیمت ماهانه و سالانه با فرض نرخ مثال

| پلن | ماهانه دلار | ماهانه با نرخ مثال | سالانه دلار | سالانه با نرخ مثال | درآمد مؤثر ماهانه در سالانه |
|---|---:|---:|---:|---:|---:|
| Base | $30 | ۶M تومان | $300 | ۶۰M تومان | **۵M تومان / $25** |
| Max 5× | $150 | ۳۰M تومان | $1,500 | ۳۰۰M تومان | **۲۵M تومان / $125** |
| Max 10× | $270 | ۵۴M تومان | $2,700 | ۵۴۰M تومان | **۴۵M تومان / $225** |
| Max 20× | $450 | ۹۰M تومان | $4,500 | ۹۰۰M تومان | **۷۵M تومان / $375** |

سناریوی سالانه سخت‌ترین حالت اقتصادی است، چون Revenue مؤثر ماهانه ۱۶.۷٪ کمتر از پرداخت ماهانه است. بنابراین تمام Unit Economics اصلی باید ابتدا روی Annual Plan سالم باشد.

---

# ۴. مبنای هزینه‌ی هوش مصنوعی

## ۴.۱ راهبرد مدل

چیدا کیفیت مدل را برای ارزان‌تر کردن سرویس قربانی نمی‌کند. تصمیم محصول این است که تجربه‌ی کاربر به بهترین مدل‌های در دسترس متکی باشد و هارنس خودش هزینه/کیفیت را مدیریت کند:

- `Luna`: استخراج، دسته‌بندی، تبدیل، کارهای پرتعداد و روشن؛
- `Terra`: مدل اصلی کار روزمره و تحلیل عملیاتی؛
- `Sol`: مسائل پیچیده، پرریسک، مبهم یا با ارزش بالا.

کاربر معمولاً مدل را انتخاب نمی‌کند. هارنس باید ارزان‌ترین مسیر قابل‌اعتماد را انتخاب کند و فقط در صورت نیاز Escalate کند.

## ۴.۲ قیمت مرجع OpenAI — ۲۷ اوت ۲۰۲۶

قیمت‌های استاندارد Short Context فعلی OpenAI برای هر یک میلیون توکن:[^openai-pricing]

| مدل | Input | Cached Input | Cache Write | Output |
|---|---:|---:|---:|---:|
| Luna | $0.20 | $0.02 | $0.25 | $1.20 |
| Terra | $2.00 | $0.20 | $2.50 | $12.00 |
| Sol | $4.00 | $0.40 | $5.00 | $20.00 |

برای درخواست‌های Long Context نرخ‌ها بالاتر می‌روند؛ در GPT-5.6 فعلی، نرخ Input دو برابر و Output حدود ۱.۵ برابر می‌شود. قیمت فعلی Sol نیز از سوی OpenAI تا دست‌کم **۲۱ نوامبر ۲۰۲۶** Promotional اعلام شده است.[^sol]

این دو نکته مستقیماً روی اقتصاد محصول اثر دارند:

1. Retrieval هدفمند، Compaction و Prompt Caching قابلیت فنی فرعی نیستند؛ ابزار Margin هستند.
2. قراردادهای سالانه نباید فقط با فرض قیمت Promotional فعلی Sol سودده باشند.

## ۴.۳ سایر هزینه‌های OpenAI مرجع

طبق Pricing رسمی فعلی:[^openai-pricing]

- Web Search: **$10 / 1,000 calls** به‌علاوه‌ی Search Content Tokens؛
- File Search Tool Call: **$2.50 / 1,000 calls**؛
- File Search Storage: **$0.10 / GB / day** بعد از سهم رایگان؛
- `gpt-transcribe`: حدود **$0.0045 / minute**.

به همین دلیل، نگهداری دائمی فایل کاربران در File Search Storage OpenAI برای چیدا به‌صورت پیش‌فرض توصیه نمی‌شود. فایل باید در Object Storage خود چیدا نگهداری و فقط زمینه‌ی لازم برای مدل بازیابی شود.

## ۴.۴ Provider ایرانی و هزینه واقعی

وجود Gatewayهای ایرانی، دسترسی عملیاتی به API مدل‌های OpenAI را برای محصولات داخل ایران ممکن می‌کند. برای نمونه، مستندات AvalAI یک API سازگار با ساختار OpenAI، شامل `/v1/responses` و امکان استفاده از OpenAI SDK با Base URL خودش را مستند کرده است.[^avalai]

اما برای اقتصاد CHIDA:

> **قیمت OpenAI فقط Reference Rate است؛ هزینه Production برابر Reference Cost + Markup/fees/FX/spread/limits Provider واقعی خواهد بود.**

Provider نهایی هنوز در این سند تثبیت نشده است. AvalAI، GapGPT، Arvan AIaaS و سایر گزینه‌ها باید با Benchmark و قرارداد سازمانی مقایسه شوند. در این تحقیق فقط سازگاری API AvalAI به‌صورت مستقل از مستندات رسمی آن تأیید شده است؛ درباره‌ی Providerهای دیگر نباید بدون بررسی مشابه فرض ایجاد شود.

---

# ۵. پروفایل مصرف مرجع و COGS هر پلن

اعداد این بخش **Forecast حسابداری نیستند**. آن‌ها پروفایل مصرف مرجع برای Pricing V1 هستند و باید پس از ۵۰ تا ۱۰۰ کاربر پایلوت با Usage واقعی جایگزین شوند.

منطق تخمین:

- استفاده از Luna برای حجم بالا؛
- Terra به‌عنوان مدل اصلی؛
- Sol با سهم بیشتر در پلن‌های حرفه‌ای؛
- استفاده جدی از Cached Input؛
- Web Search، Voice، Embedding/File Processing و Background Work در حد رفتار واقعی محصول؛
- حاشیه‌ای برای Retry، Validation و Long Context؛
- Infrastructure تخصیص‌یافته بر مبنای معماری Managed Cloud در حدود ۱۰۰۰ کاربر پولی.

## ۵.۱ جدول اصلی اقتصاد چیدا — سناریوی سالانه

|  | Base `1×` | Max `5×` | Max `10×` | Max `20×` |
|---|---:|---:|---:|---:|
| **درآمد مؤثر ماهانه سالانه** | **۵.۰۰M** | **۲۵.۰۰M** | **۴۵.۰۰M** | **۷۵.۰۰M** |
| **سود خالص هدف ۲۰٪** | **۱.۰۰M** | **۵.۰۰M** | **۹.۰۰M** | **۱۵.۰۰M** |
| AI مدل‌ها | ۱.۵۳M | ۷.۴۲M | ۱۵.۶۲M | ۳۲.۸۸M |
| سایر OpenAI / AI Tools | ۰.۱۵M | ۰.۷۰M | ۱.۲۶M | ۲.۲۶M |
| زیرساخت چیدا | ۰.۳۰M | ۰.۵۰M | ۰.۷۱M | ۱.۰۰M |
| **کل هزینه دیجیتال مستقیم** | **۱.۹۸M** | **۸.۶۲M** | **۱۷.۵۹M** | **۳۶.۱۴M** |
| **مانده برای حقوق، بیمه، دفتر، فروش، پشتیبانی و...** | **۲.۰۲M** | **۱۱.۳۸M** | **۱۸.۴۱M** | **۲۳.۸۶M** |
| **سود ۲۰٪ که دست نزدیم** | **۱.۰۰M** | **۵.۰۰M** | **۹.۰۰M** | **۱۵.۰۰M** |

### تفسیر

- Base حدود **۳۹.۶٪** Revenue مؤثر را به Digital COGS می‌دهد؛
- Max 5× حدود **۳۴.۵٪**؛
- Max 10× حدود **۳۹.۱٪**؛
- Max 20× حدود **۴۸.۲٪**.

Max 5× در این مدل بهترین اقتصاد نسبی را برای شرکت دارد. Max 20× بیشترین Value را به کاربر می‌دهد و باید بیشترین کنترل هزینه را داشته باشد.

## ۵.۲ سناریوی پرداخت ماهانه

چون Limit مصرف برای پلن ماهانه و سالانه یکسان است اما قیمت ماهانه بالاتر است، فضای OPEX در پرداخت ماهانه بیشتر می‌شود:

| پلن | Revenue ماهانه | سود هدف ۲۰٪ | Digital COGS مرجع | فضای باقی‌مانده OPEX |
|---|---:|---:|---:|---:|
| Base | ۶M | ۱.۲M | ۱.۹۸M | **۲.۸۲M** |
| Max 5× | ۳۰M | ۶M | ۸.۶۲M | **۱۵.۳۸M** |
| Max 10× | ۵۴M | ۱۰.۸M | ۱۷.۵۹M | **۲۵.۶۱M** |
| Max 20× | ۹۰M | ۱۸M | ۳۶.۱۴M | **۳۵.۸۶M** |

Annual Plan بنابراین معیار محافظه‌کارانه‌ی طراحی اقتصاد است.

---

# ۶. واحد مصرف CHIDA — `CU`

## ۶.۱ مسئله‌ای که CU حل می‌کند

محدودکردن بر اساس تعداد پیام نادرست است؛ یک پیام Luna می‌تواند هزاران برابر ارزان‌تر از Research چندمرحله‌ای با Sol، Web Search و فایل باشد. محدودکردن بر اساس Raw Token نیز نادرست است چون قیمت هر Token میان مدل‌ها، Cached/Uncached، Output/Reasoning و Tools متفاوت است.

بنابراین:

> **CHIDA Usage Unit (`CU`) نمایش استاندارد «هزینه‌ی متغیر مرجعِ انجام کار» است.**

تعریف V1:

> **۱ CU = $0.001 Reference Variable Digital Cost**  
> **۱٬۰۰۰ CU = $1 Reference Variable Digital Cost**

این رابطه **داخلی** است. کاربر نباید قیمت دلاری هر عملیات یا تعداد Token را در UI ببیند.

## ۶.۲ Reference Rate Card V1

با قیمت استاندارد فعلی OpenAI، CU مرجع برای هر یک میلیون Token:

| مدل | Input CU / 1M | Cached CU / 1M | Cache Write CU / 1M | Output CU / 1M |
|---|---:|---:|---:|---:|
| Luna | 200 | 20 | 250 | 1,200 |
| Terra | 2,000 | 200 | 2,500 | 12,000 |
| Sol | 4,000 | 400 | 5,000 | 20,000 |

سایر نمونه‌ها:

| عملیات | CU مرجع |
|---|---:|
| Web Search call | حدود **10 CU / call** + Tokenهای محتوای Search |
| File Search tool call مرجع OpenAI | حدود **2.5 CU / call** |
| `gpt-transcribe` | حدود **4.5 CU / دقیقه** |
| OpenAI File Search Storage | **100 CU / GB-day**؛ برای Storage دائمی چیدا توصیه نمی‌شود |

Long Context با Rate Card بالاتر محاسبه می‌شود. ابزارهای ثالث آینده نیز با Reference Cost خود به CU تبدیل می‌شوند.

## ۶.۳ دو Ledger مستقل

### Usage Ledger

برای Limit و تجربه کاربر است. بر اساس Reference Rate Card نسخه‌دار محاسبه می‌شود.

### Actual Cost Ledger

برای اقتصاد واقعی شرکت است و باید برای هر Request ثبت کند:

- Provider؛
- Model و Version؛
- Input/Cached/Output/Reasoning؛
- Tool Calls؛
- Provider markup و fixed fee؛
- Retry/Failover؛
- هزینه واقعی دلار/ریال؛
- latency و status؛
- User / Plan / Workspace / Feature.

> **CU و Actual Cost نباید یکی باشند.** اگر Provider قیمت را عوض کرد، حق مصرف کاربر نباید بدون سیاست تجاری مشخص ناگهان تغییر کند؛ اگر هارنس با Cache هزینه را پایین آورد، صرفه‌جویی باید Margin و ظرفیت شرکت را بهتر کند، نه اینکه خودکار تمام آن به مصرف رایگان تبدیل شود.

## ۶.۴ Retry و خطای داخلی

اگر چیدا به‌دلیل timeout، bug، provider failure، validation داخلی یا failover مجبور به تکرار یک عملیات شود:

- Actual Cost Ledger تمام هزینه را ثبت می‌کند؛
- Usage Ledger نباید ناکارآمدی داخلی ما را به‌طور مستقیم از کاربر کم کند؛
- برای پوشش این ریسک، Pricing/Limit باید Safety Margin داشته باشد.

---

# ۷. Limit، Fair Use و کنترل Burst

## ۷.۱ Limit تجاری V1

| پلن | نوع دوره | سقف |
|---|---|---:|
| Base | روزانه | **400 CU** |
| Max 5× | هفتگی | **14,000 CU** |
| Max 10× | هفتگی | **28,000 CU** |
| Max 20× | هفتگی | **56,000 CU** |

Maxها هفتگی‌اند چون کار حرفه‌ای Burst دارد: ممکن است کاربر یک روز تقریباً مصرف نکند و روز دیگر چند Research، فایل و Sol-heavy workflow داشته باشد. Daily Limit در پلن حرفه‌ای ارزش محصول را خراب می‌کند.

## ۷.۲ ظرفیت ماهانه معادل Hard Cap

| پلن | CU معادل ماهانه | Reference Cost معادل | درصد Revenue مؤثر سالانه |
|---|---:|---:|---:|
| Base | حدود **12,167 CU** | **$12.17** | **48.7٪** |
| Max 5× | حدود **60,667 CU** | **$60.67** | **48.5٪** |
| Max 10× | حدود **121,333 CU** | **$121.33** | **53.9٪** |
| Max 20× | حدود **242,667 CU** | **$242.67** | **64.7٪** |

پروفایل مصرف مرجع فعلی تقریباً **۶۷ تا ۷۲٪ Hard Cap** را مصرف می‌کند. این Headroom عمدی است؛ سقف تجاری نباید با مصرف متوسط یکسان باشد.

## ۷.۳ UI مصرف

کاربر بهتر است CU و دلار را نبیند. نمایش پیشنهادی:

- «۷۴٪ از مصرف این هفته باقی مانده»؛
- countdown تا Reset؛
- هشدار ظریف در حدود ۸۵٪ مصرف؛
- هشدار واضح در حدود ۹۵٪؛
- در ۱۰۰٪: Workspace، فایل و نتایج قبلی قابل دسترسی بمانند، اما شروع کارهای پرهزینه‌ی جدید تا Reset یا Upgrade متوقف شود.

برای Jobهایی که به‌تنهایی بخش بزرگی از Limit را مصرف می‌کنند، هارنس باید پیش از اجرا **Estimated Usage** بدهد؛ مثلاً «این تحقیق احتمالاً حدود ۱۲٪ از مصرف هفتگی شما را استفاده می‌کند.»

## ۷.۴ Rate Limit فنی با Usage Limit فرق دارد

حتی Max 20× نباید بتواند کل 56,000 CU هفتگی را در چند دقیقه با صدها Job موازی مصرف کند. بنابراین سه کنترل مستقل لازم است:

1. **Usage Limit** — حق مصرف تجاری؛
2. **Concurrency / Burst Limit** — حفاظت از زیرساخت و Provider؛
3. **Abuse Guard** — جلوگیری از اتوماسیون مخرب، اشتراک حساب یا Denial-of-Wallet.

عدد Concurrency باید با تست Load و Rate Limit Provider نهایی تعیین شود و در این نسخه تثبیت نشده است.

## ۷.۵ Overage

پیشنهاد V1:

- Overage خودکار و بدون سقف **نداشته باشیم**؛
- در پایان Limit، کاربر یا تا Reset صبر کند یا Upgrade کند؛
- Add-on CU Pack فقط بعد از مشاهده COGS واقعی و Elasticity قیمت در پایلوت اضافه شود؛
- هیچ Auto-charge پنهان وجود نداشته باشد.

---

# ۸. Storage Quota و File Economics

Storage با CU یکی نیست:

> **Storage Quota = حق نگهداری داده**  
> **CU = حق پردازش و انجام کار**

فایل کاربر می‌تواند ماه‌ها ذخیره شود بدون اینکه مدل آن را بخواند. برعکس، یک PDF کوچک می‌تواند چند بار با مدل‌های گران پردازش شود. بنابراین:

- Storage quota جداگانه برای هر Plan تعریف شود؛
- Upload/Download عادی CU مصرف نکند؛
- OCR، Embedding، Vision، Extraction و Retrieval پردازشی CU مصرف کنند؛
- Exact GB Quota در این سند هنوز باز است و باید با رفتار واقعی پروژه‌های ساختمانی تعیین شود.

برای نمونه، Object Storage داخلی سازگار با S3 در بازار ایران وجود دارد؛ Liara به‌صورت رسمی Object Storage سازگار با S3 در موقعیت ایران و Managed DBaaS شامل PostgreSQL را مستند کرده است.[^liara-storage][^liara-db]

برای DR خارجی در صورت مجاز بودن سیاست داده، Cloudflare R2 در حال حاضر Standard Storage را با **$0.015 / GB-month** و بدون egress اینترنتی قیمت‌گذاری می‌کند.[^r2]

---

# ۹. معماری زیرساخت V1

## ۹.۱ تصمیم اصلی: سرور فیزیکی نخریم

برای معماری فعلی CHIDA، خرید GPU یا سرور inference منطقی نیست؛ مدل‌های اصلی از API Provider گرفته می‌شوند. خرید سرور فیزیکی در V1 هزینه‌های زیر را بدون مزیت متناسب اضافه می‌کند:

- خرید و استهلاک سخت‌افزار؛
- پاور و UPS دیتاسنتر؛
- دیسک و خرابی سخت‌افزار؛
- Remote Hands؛
- مانیتورینگ و Patch؛
- Failover؛
- نیروی DevOps بیشتر.

بنابراین V1 باید **Managed-first** باشد.

## ۹.۲ Topology پیشنهادی

```text
User / PWA
   │
   ▼
Edge / CDN / WAF / Rate Limiting
   │
   ▼
CHIDA Application API  ─────────────► Object Storage
   │                                      │
   ├────────► PostgreSQL ◄───────────────┤
   │
   ├────────► Cache / Redis
   │
   ├────────► Queue / Background Workers
   │
   ▼
CHIDA Model Gateway
   │
   ├────────► AI Provider A (Primary)
   ├────────► AI Provider B (Failover)
   └────────► Providerهای بعدی / Direct route در صورت امکان
```

## ۹.۳ محل استقرار

Baseline پیشنهادی:

> **Primary داخل ایران، DR روی دامنه‌ی خرابی مستقل.**

دلایل Primary ایران:

- کاربران اصلی در ایران‌اند؛
- Upload عکس، PDF و Voice باید latency و throughput مناسب داخلی داشته باشد؛
- Database و فایل‌های کاری نباید برای هر تعامل ساده به مسیر بین‌المللی وابسته باشند؛
- Gatewayهای ایرانی می‌توانند upstream مدل خارجی را از مسیر خود مدیریت کنند.

اما «داخل ایران» نباید به معنی یک Provider واحد باشد. DR باید حداقل روی Provider یا دیتاسنتر مستقل باشد. نگهداری Backup رمزنگاری‌شده خارج ایران فقط پس از تصمیم حقوقی/حریم خصوصی درباره‌ی محل داده انجام شود.

## ۹.۴ منابع شروع پیشنهادی برای حدود ۱۰۰۰ کاربر پولی

این‌ها **Capacity Baseline** هستند، نه Purchase Order:

| جزء | Baseline شروع |
|---|---|
| App/API | حداقل **۲ instance**، هرکدام حدود `4 vCPU / 8 GB RAM` |
| Background Workers | حداقل **۲ worker**، هرکدام حدود `4 vCPU / 8 GB RAM` با قابلیت scale-out |
| PostgreSQL | Managed، حدود `4 vCPU / 16 GB RAM`، SSD، backup + PITR؛ HA در صورت امکان |
| Redis/Valkey | Managed یا HA، حدود `2 vCPU / 4 GB RAM` |
| Object Storage | S3-compatible؛ شروع چندصد GB تا حدود 1TB، قابل افزایش بدون migration |
| Queue | Managed queue یا durable queue با DLQ و retry policy |
| Search/Vector | ابتدا PostgreSQL/pgvector یا سرویس مدیریت‌شده‌ی محدود؛ جداسازی فقط با نیاز واقعی |
| Edge | CDN/WAF/DDoS/rate limiting |
| Monitoring | Metrics + logs + tracing + error tracking |
| Backup | روزانه + PITR + نسخه‌ی مستقل از Primary Provider |

چون inference روی Provider انجام می‌شود، Compute اپلیکیشن عمدتاً I/O-bound است. Scale باید از Load Test بیاید، نه از خرید زودهنگام سرور بزرگ.

## ۹.۵ Provider داخلی زیرساخت

انتخاب فروشنده هنوز تصمیم باز است. گزینه‌ی مرجع باید این قابلیت‌ها را ارائه دهد:

- API/PaaS یا VM قابل اتکا؛
- Managed PostgreSQL یا امکان HA قابل دفاع؛
- S3-compatible Object Storage؛
- private networking؛
- snapshot و backup؛
- metrics/logs؛
- API/automation؛
- SLA و پشتیبانی B2B؛
- مسیر ارتباطی پایدار با AI Gateways.

Liara در مستندات رسمی فعلی PaaS، DBaaS، Object Storage و IaaS را ارائه می‌کند و برای Object Storage و DB endpointهای ایران دارد.[^liara-api] ArvanCloud نیز به‌عنوان Candidate بازار باید در Benchmark نهایی حضور داشته باشد، اما انتخاب نهایی در این سند تثبیت نشده است.

## ۹.۶ Model Gateway مستقل CHIDA

این یکی از اجزای حیاتی فنی و اقتصادی است. هیچ API Key Provider در Browser قرار نمی‌گیرد. تمام درخواست‌ها از Model Gateway عبور می‌کنند.

مسئولیت‌ها:

- route میان Luna/Terra/Sol؛
- انتخاب Provider؛
- prompt/context assembly؛
- caching؛
- CU estimation و debit؛
- Actual Cost logging؛
- retry/failover؛
- timeout؛
- model/version allowlist؛
- budget guard؛
- observability؛
- redaction/minimization داده در صورت نیاز.

Failover فقط وقتی باید silent باشد که Provider دوم **همان مدل و سطح قابلیت** را ارائه کند. جایگزینی Sol با مدل دیگری بدون سیاست روشن نباید پشت پرده انجام شود.

## ۹.۷ معیار انتخاب AI Provider

| معیار | وزن پیشنهادی |
|---|---:|
| مدل دقیق، تازگی مدل و عدم substitute پنهان | ۲۰٪ |
| قیمت، markup و ثبات تعرفه | ۱۵٪ |
| SLA / Availability / latency | ۱۵٪ |
| Privacy، retention و عدم استفاده آموزشی از داده | ۱۵٪ |
| API parity: Responses, streaming, tools, vision, usage fields | ۱۵٪ |
| Rate limits و امکان افزایش سازمانی | ۱۰٪ |
| Usage reporting / billing transparency | ۵٪ |
| پشتیبانی B2B و escalation | ۵٪ |

قبل از Launch عمومی، حداقل **دو Provider** باید تست شوند و Failover drill واقعی انجام شود.

## ۹.۸ اینترنت دفتر

Production نباید به اینترنت دفتر وابسته باشد. برای تیم داخلی:

- دو ISP ثابت با مسیرهای مستقل؛
- 4G/5G backup؛
- router با automatic failover؛
- UPS برای router/network؛
- VPN/secure access برای عملیات.

قطع برق یا اینترنت دفتر نباید CHIDA را Down کند.

---

# ۱۰. بودجه زیرساخت

برای حدود ۱۰۰۰ کاربر پولی، Baseline فعلی هزینه‌ی مشترک زیرساخت (بدون AI Provider) حدود **$1,000 تا $2,500 در ماه** است. این بازه شامل Compute، DB، cache، queue، storage، CDN/WAF، backup، logs و monitoring است و Vendor Quote نیست.

تخصیص فعلی در Unit Economics:

| پلن | سهم ماهانه زیرساخت مرجع |
|---|---:|
| Base | ۰.۳۰M تومان ≈ $1.5 |
| Max 5× | ۰.۵۰M ≈ $2.5 |
| Max 10× | ۰.۷۱M ≈ $3.55 |
| Max 20× | ۱.۰۰M ≈ $5 |

در Mix مرجع ۱۰۰۰ کاربر، این تخصیص مجموعاً حدود **$2,030/month** می‌شود و داخل بازه‌ی مهندسی بالا قرار می‌گیرد.

Infrastructure Cost per User با Scale خطی نیست: در ۱۰۰ کاربر Fixed Cost بیشتر به هر نفر می‌رسد؛ در ۱۰هزار کاربر احتمالاً هزینه‌ی هر کاربر کاهش می‌یابد، اما DB، logs و workloadهای background می‌توانند پله‌ای رشد کنند. بنابراین بودجه‌ی زیرساخت باید ماهانه از Actual Bill وارد مدل شود.

---

# ۱۱. اقتصاد ۱۰۰۰ مشترک

Mix مرجع فقط برای برنامه‌ریزی:

- ۶۵۰ Base؛
- ۲۲۰ Max 5×؛
- ۱۰۰ Max 10×؛
- ۳۰ Max 20×.

در سناریوی همه‌ی قراردادها سالانه:

| شاخص ماهانه | مقدار |
|---|---:|
| **Revenue مؤثر** | **۱۵.۵ میلیارد تومان** |
| **Digital COGS مستقیم** | **حدود ۶.۰۳ میلیارد** |
| **سود هدف ۲۰٪ کنارگذاشته‌شده** | **۳.۱۰ میلیارد** |
| **حداکثر بودجه باقی‌مانده برای OPEX شرکت** | **حدود ۶.۳۷ میلیارد تومان** |

این ۶.۳۷ میلیارد سقف هزینه برای:

- حقوق و مزایا؛
- بیمه؛
- دفتر و اجاره؛
- پشتیبانی؛
- فروش و مارکتینگ؛
- مالی و حقوقی؛
- مدیریت؛
- تجهیزات و اینترنت اداری؛
- سایر OPEX

است، اگر بخواهیم ۲۰٪ سود هدف حفظ شود.

## ۱۱.۱ خطی‌سازی صرفاً برای دید مقیاس

این جدول Forecast واقعی زیرساخت نیست؛ Mix و Unit COGS نسخه‌ی ۱ را فقط خطی می‌کند تا اندازه‌ی اقتصاد دیده شود:

| Paid Users | Revenue مؤثر ماهانه | Digital COGS مرجع | سود هدف ۲۰٪ | OPEX Budget باقی‌مانده |
|---:|---:|---:|---:|---:|
| 100 | ۱.۵۵B | ۰.۶۰B | ۰.۳۱B | ۰.۶۴B |
| 1,000 | ۱۵.۵۰B | ۶.۰۳B | ۳.۱۰B | ۶.۳۷B |
| 10,000 | ۱۵۵.۰۰B | ۶۰.۲۷B | ۳۱.۰۰B | ۶۳.۷۳B |

در ۱۰۰ و ۱۰هزار کاربر، Infra allocation باید جداگانه Reforecast شود و نباید این خطی‌سازی جای Capacity Plan را بگیرد.

---

# ۱۲. Stress Test

## ۱۲.۱ Markup Gateway ایرانی

جدول اصلی COGS فرض کرده AI cost برابر Reference OpenAI است. اگر Provider ایرانی روی بخش AI + OpenAI Tools markup بگیرد، فضای OPEX کاهش می‌یابد.

**مانده برای OPEX پس از حفظ سود ۲۰٪:**

| پلن | Markup 0٪ | Markup 20٪ | Markup 30٪ |
|---|---:|---:|---:|
| Base | ۲.۰۲M | **۱.۶۸M** | **۱.۵۲M** |
| Max 5× | ۱۱.۳۸M | **۹.۷۶M** | **۸.۹۴M** |
| Max 10× | ۱۸.۴۱M | **۱۵.۰۳M** | **۱۳.۳۵M** |
| Max 20× | ۲۳.۸۶M | **۱۶.۸۳M** | **۱۳.۳۲M** |

نتیجه: ساختار قیمت در مصرف مرجع حتی با Markup قابل‌توجه هنوز contribution مثبت دارد، ولی Max 20× سریع‌تر حساس می‌شود. Provider quote باید پیش از Launch در مدل جایگزین فرض 0٪ شود.

## ۱۲.۲ افزایش قیمت Sol

قیمت فعلی Sol Promotional است.[^sol] چون سهم Sol در پلن‌های بالا بیشتر است:

- هر افزایش قیمت Sol ابتدا Max 20× را تحت فشار می‌گذارد؛
- Model Gateway باید سهم هزینه Sol در COGS هر Plan را روزانه گزارش کند؛
- تغییر Provider/model pricing باید Stress Test قراردادهای سالانه را Trigger کند؛
- Rate Card جدید نباید به‌صورت نامرئی وسط قرارداد، entitlement کاربر را کاهش دهد؛ تغییرات باید نسخه‌دار و طبق Terms اعمال شوند.

## ۱۲.۳ نرخ ارز

USD pricing بخش مهم ریسک را حل می‌کند، اما اگر Annual Plan به ریال دریافت و پول ۱۲ ماه در دارایی ریالی نگهداری شود، COGS دلار-مبنا همچنان ریسک دارد. Treasury policy پیشنهادی:

- بخشی از مبلغ قرارداد سالانه معادل Forecast COGS دوره در credit/provider balance یا دارایی هم‌ارز نگهداری شود؛
- نرخ تبدیل پرداخت ریالی تعریف رسمی و قابل بازبینی داشته باشد؛
- قراردادهای بزرگ Enterprise امکان reprice/true-up مشخص داشته باشند.

## ۱۲.۴ کاربران Max-out

Hard Capها طوری طراحی شده‌اند که اگر کاربر دائماً ۱۰۰٪ سقف را مصرف کند، Reference Variable Cost به‌ویژه در Max 20× می‌تواند بخش بزرگی از Revenue شود. بنابراین KPI مهم، **توزیع CU utilization** است نه فقط میانگین.

---

# ۱۳. داشبورد اقتصاد و Guardrailها

از روز اول باید این متریک‌ها به تفکیک Plan، Provider، Model و Feature قابل مشاهده باشند:

## Revenue و Margin

- Revenue مؤثر هر Plan؛
- Actual Digital COGS / Revenue؛
- Contribution Margin؛
- OPEX Budget باقی‌مانده؛
- Net Margin واقعی.

## Usage

- CU مصرفی P50 / P90 / P95 / P99؛
- درصد کاربرانی که ۸۵٪، ۹۵٪ و ۱۰۰٪ Limit را لمس می‌کنند؛
- تعداد Heavy Jobهای رد یا به تأخیر افتاده؛
- CU per meaningful outcome.

## Model economics

- Luna/Terra/Sol share by requests، tokens و dollars؛
- Cached Input ratio؛
- Long-context rate؛
- Sol escalation rate؛
- cost per response / research / file job؛
- provider markup/spread.

## Infrastructure

- Infra bill / paid active user؛
- DB CPU/RAM/storage؛
- queue depth؛
- worker utilization؛
- object storage per user؛
- backup size؛
- error/latency percentiles.

## Guardrail پیشنهادی

- اگر Average Direct Digital COGS یک Plan برای دو دوره متوالی از Budget طراحی عبور کرد، Pricing/Limit/Route review اجباری شود؛
- اگر بیش از حدود ۱۰–۱۵٪ کاربران یک Plan مرتباً به Hard Cap برسند، باید مشخص شود Limit واقعاً کم است یا کاربران نامناسب در Plan پایین مانده‌اند؛
- اگر Sol share بدون بهبود outcome بالا می‌رود، Routing regression تلقی شود؛
- اگر Provider markup یا failure rate از SLA داخلی عبور کرد، failover/renegotiation فعال شود.

عدد دقیق Alertها باید با داده‌ی پایلوت کالیبره شود.

---

# ۱۴. سیاست تغییر قیمت و Rate Card

برای جلوگیری از بی‌اعتمادی:

1. هر `CHIDA Reference Rate Card` نسخه دارد؛
2. Actual Cost می‌تواند روزانه تغییر کند، اما Usage Entitlement قرارداد باید طبق Terms مشخص تغییر کند؛
3. تغییر قیمت Plan، Limit یا CU policy برای قرارداد جدید/تمدید اعمال شود مگر شرط اضطراری صریح وجود داشته باشد؛
4. قرارداد سالانه نباید با تغییر مخفی Rate Card عملاً کوچک شود؛
5. Pricing Review حداقل فصلی انجام شود؛
6. هر عرضه‌ی مدل جدید، تغییر Provider یا تغییر بزرگ OpenAI Pricing یک Economics Review Trigger است.

---

# ۱۵. چیزهایی که عمداً هنوز نهایی نشده‌اند

این سند برای V1 جهت کافی می‌دهد، اما موارد زیر باید پیش از Launch عمومی بسته شوند:

## Provider و زیرساخت

- انتخاب Primary و Secondary AI Gateway؛
- Markup واقعی، Rate Limit و SLA قراردادی؛
- بررسی Privacy/Retention هر Gateway؛
- انتخاب Cloud Provider اصلی داخل ایران؛
- انتخاب DR Provider مستقل؛
- Load/Latency benchmark؛
- محل دقیق Backup خارج از Primary domain.

## Billing

- منبع رسمی نرخ تبدیل دلار به ریال؛
- مالیات، VAT و هزینه درگاه؛
- Refund/cancellation؛
- Invoice rules؛
- grandfathering؛
- سیاست Enterprise discount.

## Usage

- Exact reset implementation برای Daily/Weekly window؛
- Concurrency cap؛
- Storage quota هر Plan؛
- Add-on CU packs؛
- Account sharing policy؛
- Heavy Job confirmation threshold.

## اقتصاد شرکت

- Staffing plan واقعی؛
- حقوق و بیمه؛
- اجاره و دفتر؛
- Sales/Marketing CAC؛
- Support load؛
- Tax؛
- Bad debt/refund؛
- هدف Cash Reserve.

تا زمانی که این موارد وارد مدل نشوند، «۲۰٪ سود خالص» **هدف طراحی** است، نه Forecast حسابداری تأییدشده.

---

# ۱۶. معیار آمادگی برای Launch پولی

پیشنهاد می‌شود فروش عمومی سالانه فقط وقتی آغاز شود که:

- حداقل دو AI Provider تست و یکی Primary شده باشد؛
- قیمت/Markup واقعی Provider وارد Actual COGS Model شده باشد؛
- Usage Meter و Actual Cost Ledger برای تمام callهای مدل و toolها کار کند؛
- Base Daily و Max Weekly Limit end-to-end تست شده باشد؛
- ۵۰–۱۰۰ کاربر پایلوت حداقل چند هفته داده واقعی تولید کرده باشند؛
- P50/P95 CU، Sol share، cache hit و COGS per plan شناخته شده باشد؛
- Infra bill واقعی جای برآورد مهندسی را گرفته باشد؛
- Payment/tax/refund policy بسته شده باشد؛
- Staffing/OPEX budget حداقل ۱۲ ماه Forecast شده باشد؛
- Stress Test افزایش قیمت Sol، Gateway markup و افزایش نرخ ارز پاس شده باشد.

---

# ۱۷. جمع‌بندی تصمیم

Baseline پیشنهادی V1:

> **Pricing:** `$30 / $150 / $270 / $450`  
> **Annual:** پرداخت ۱۰ ماه، استفاده ۱۲ ماه  
> **Target Net Margin:** `20%`  
> **Usage Unit:** `1,000 CU = $1 reference variable digital cost`  
> **Base Limit:** `400 CU/day`  
> **Max Limits:** `14k / 28k / 56k CU/week`  
> **Metering:** Usage Ledger + Actual Cost Ledger  
> **AI:** State-of-the-art models با routing خودکار `Luna / Terra / Sol`  
> **Provider:** provider-independent gateway با حداقل دو upstream  
> **Infrastructure:** Managed Cloud داخل ایران، بدون GPU و بدون سرور فیزیکی در V1  
> **Storage:** جدا از CU؛ Object Storage خود CHIDA  
> **Hard Rule:** هیچ Plan نباید فقط با مصرف متوسط سودده و در رفتار قابل پیش‌بینی Power User زیان‌ده باشد.

اقتصاد فعلی امیدوارکننده است، اما مزیت واقعی CHIDA زمانی حفظ می‌شود که **Metering و Routing به‌اندازه‌ی خود مدل جدی گرفته شوند**. Pricing بدون Cost Ledger یک حدس است؛ Pricing همراه با Usage Ledger، Actual COGS و Guardrail تبدیل به سیستم قابل‌کنترل می‌شود.

---

# پیوست الف: فرمول‌های مرجع

## Revenue مؤثر Annual

`Effective Monthly Revenue = Annual Price / 12`

## سود هدف

`Target Profit = Effective Revenue × 20%`

## فضای OPEX

`OPEX Budget = Effective Revenue - Target Profit - Direct Digital COGS`

## CU

`CU = Reference Variable Digital Cost in USD × 1000`

## هزینه واقعی AI

`Actual AI COGS = Provider Usage Cost + Markup + Fixed Provider Fees + Non-user-chargeable Retry/Failover Cost`

## Margin

`Actual Net Margin = (Revenue - Digital COGS - OPEX - Tax/Fees/Refunds) / Revenue`

---

# پیوست ب: منابع خارجی و تاریخ اعتبار

تمام قیمت‌ها و قابلیت‌های بیرونی در این سند time-sensitive هستند و در **۲۷ اوت ۲۰۲۶** بررسی شده‌اند.

منابع مرجع:

1. **OpenAI API Pricing** — قیمت GPT-5.6، Web Search، File Search و Transcription: https://developers.openai.com/api/docs/pricing
2. **OpenAI GPT-5.6 Sol** — مشخصات مدل، قیمت و وضعیت Promotional: https://developers.openai.com/api/docs/models/gpt-5.6-sol
3. **AvalAI API Reference** — API سازگار با OpenAI و Responses endpoint: https://docs.avalai.org/en/api-reference/introduction
4. **Liara Object Storage** — S3-compatible storage در موقعیت ایران: https://liara.ir/products/object-storage
5. **Liara Cloud Database** — DBaaS شامل PostgreSQL و backup managed: https://liara.ir/products/cloud-database
6. **Liara OpenAPI** — PaaS/DBaaS/Object Storage/IaaS: https://developers.liara.ir/
7. **Cloudflare R2 Pricing** — قیمت Storage و egress: https://developers.cloudflare.com/r2/pricing/

[^openai-pricing]: OpenAI Developers, **API Pricing**, شامل قیمت GPT-5.6، Web Search، File Search و Transcription: https://developers.openai.com/api/docs/pricing
[^sol]: OpenAI Developers, **GPT-5.6 Sol Model**, شامل قیمت و اعلام Promotional pricing تا حداقل 21 Nov 2026: https://developers.openai.com/api/docs/models/gpt-5.6-sol
[^avalai]: AvalAI Docs, **API Reference / OpenAI-compatible API**, شامل Base URL و Responses API: https://docs.avalai.org/en/api-reference/introduction
[^liara-storage]: Liara, **Object Storage**، S3-compatible در موقعیت ایران: https://liara.ir/products/object-storage
[^liara-db]: Liara, **Cloud Database / DBaaS**، شامل PostgreSQL و backup managed: https://liara.ir/products/cloud-database
[^liara-api]: Liara Developers, **OpenAPI Documentation**، شامل PaaS/DBaaS/Object Storage/IaaS و endpointهای ایران: https://developers.liara.ir/
[^r2]: Cloudflare Developers, **R2 Pricing**, Standard Storage $0.015/GB-month و free egress: https://developers.cloudflare.com/r2/pricing/

---

# پیوست پ: وضعیت تصمیم‌ها

| موضوع | وضعیت |
|---|---|
| قیمت `$30 / $150 / $270 / $450` | **تأییدشده برای Baseline V1** |
| سالانه = پرداخت ۱۰ ماه / استفاده ۱۲ ماه | **تأییدشده** |
| هدف سود ۲۰٪ | **تأییدشده** |
| قیمت مرجع دلاری | **تأییدشده** |
| Base daily / Max weekly | **تأییدشده** |
| تعریف CU و دو Ledger | **تأییدشده** |
| Limit `400 / 14k / 28k / 56k` | **Baseline تأییدشده، نیازمند کالیبراسیون پایلوت** |
| COGS هر Plan | **برآورد مهندسی؛ نیازمند داده واقعی و Provider quote** |
| Managed-first و عدم خرید GPU/Physical Server در V1 | **توصیه مرجع** |
| Primary داخل ایران + DR مستقل | **توصیه مرجع؛ Provider باز** |
| Primary/Secondary AI Gateway | **تصمیم باز** |
| Storage quota | **تصمیم باز** |
| Overage/Add-on | **در V1 بدون overage خودکار؛ Add-on باز** |
| Staffing/OPEX واقعی | **تصمیم/داده باز** |
