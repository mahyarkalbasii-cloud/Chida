# پیشنهاد سایت مارکتینگ، Design System و SEO/AEO چیدا

- **Status:** Research proposal — not accepted
- **Implementation authority:** None
- **Captured:** 2026-08-20
- **Review rule:** هیچ copy، palette، framework، domain topology یا crawler policy این سند تا پیش از بازبینی و ثبت تصمیم مرتبط قطعی نیست.

## مرزهای حاکم

- سایت بازاریابی خود چیدا می‌تواند به‌عنوان سطح جذب مستقل بررسی شود، اما ورود آن به دامنهٔ اجرا باید صریح تصویب شود.
- طبق `د-۰۳۳`، فروشگاه تأمین‌کننده در نسخهٔ یک فقط داخل چیدا دیده می‌شود؛ صفحهٔ عمومی محصول/فروشگاه و SEO انبوه marketplace مجاز نیست.
- شعار اصلی برند `ب-۰۳۰` باز است؛ hero copy نهایی نباید از گزینه‌های قبلی به‌عنوان شعار قطعی استفاده کند.
- تعرفه تا بسته‌شدن تفاوت پلن‌ها، trial، نمایش و سقف مصرف، مالیات و فروش سالانه در `ب-۰۰۶`، `ب-۰۰۷`، `ب-۰۰۸`، `ب-۰۱۳`، `ب-۰۲۷`، `ب-۰۳۲` و `ب-۰۳۴` منتشر نمی‌شود.
- این سند صفحه یا وعدهٔ محصولی خارج از `02-phase-one-product.md` ایجاد نمی‌کند.

## توپولوژی دامنهٔ پیشنهادی

- `chida.ai`: سطح عمومی، crawlable و HTML-first؛
- `www.chida.ai`: redirect دائمی به canonical apex؛
- `app.chida.ai`: سطح احراز هویت‌شده و `noindex`؛
- public marketplace: خارج از نسخهٔ یک و بدون route عمومی.

این جدایی پیشنهاد است، نه تصمیم. وضعیت عملیاتی دامنه در `../handoffs/2026-08-20-chida-ai-domain.md` ثبت شده است.

## معماری اطلاعات پیشنهادی

1. خانه؛
2. چیدا چگونه کار می‌کند؛
3. برای سازنده؛
4. برای تأمین‌کننده؛
5. قابلیت‌ها؛
6. امنیت، اعتماد و حریم داده؛
7. دربارهٔ چیدا؛
8. راهنماها؛
9. درخواست دمو یا عضویت آزمایشی؛
10. تعرفه‌ها فقط بعد از بسته‌شدن تصمیم‌های تجاری مربوط.

امضای روایی پیشنهادی سایت، تبدیل یک «یادداشت خام ساختمانی» به «آرتیفکت مرتب، قابل‌ویرایش و قابل‌تأیید» است؛ این نمایش باید چرخهٔ واقعی چیدا را نشان دهد و اجرای بیرونی جعلی نداشته باشد.

## نقش Claude و ابزارهای تولید طرح

Claude Artifacts یا Claude Code می‌توانند برای ideation و prototype استفاده شوند، اما source of truth نیستند:

1. سه جهت مستقل با محتوای یکسان تولید شود؛
2. یک جهت با review انسانی انتخاب شود؛
3. خروجی به token، component spec و state matrix تبدیل شود؛
4. tokenها با فرمت DTCG در Git ثبت شوند؛
5. componentها با حالت‌های empty، loading، review، success، failure، conflict و retry ساخته شوند؛
6. هر تغییر تولیدشده با visual regression، RTL و accessibility بررسی شود.

## لایه‌های پیشنهادی Design System

```text
primitive tokens
  → semantic tokens
      → component tokens
          → light / dark modes
```

- tokenها versioned و vendor-neutral باشند.
- CSS logical properties به‌جای left/right فیزیکی استفاده شود.
- React Aria فقط برای رفتار و accessibility گزینهٔ candidate است، نه برای تحمیل هویت بصری.
- Storybook وقتی وارد شود که component مشترک و interactive به‌اندازهٔ کافی وجود داشته باشد.
- orange accent است، نه رنگ blanket کارت‌ها؛ status نباید فقط با رنگ بیان شود.

## جهت بصری پیشنهادی

- سطح‌های آرام، فضای خالی زیاد و dividerهای ظریف؛
- یک خانوادهٔ خنثی و یک accent نارنجی؛
- بدون gradient، glow، orb، ربات یا کارت‌های رنگی agent؛
- الهام از وضوح محصولات گفت‌وگومحور معاصر، بدون تقلید navigation یا هویت آن‌ها؛
- حرکت کوتاه و هدفمند برای نشان‌دادن تبدیل intent به artifact.

### seed آزمایشی رنگ

این مقادیر هنوز contrast-tested یا پذیرفته‌شده نیستند:

| Mode | Canvas | Surface | Text | Muted | Line | Accent |
|---|---|---|---|---|---|---|
| Light | `#F7F8F5` | `#FFFFFF` | `#171A17` | `#626A62` | `#D8DED7` | `#B84A1B` |
| Dark | `#101210` | `#171A18` | `#F2F4F0` | `#A7AFA6` | `#303630` | `#FF8B5C` |

رنگ‌های success، warning و error semantic هستند و بخشی از palette برند محسوب نمی‌شوند.

## baseline فارسی و RTL

- font candidate: فایل variable و self-hosted از Vazirmatn؛
- ریشهٔ سند: `<html lang="fa" dir="rtl">`؛
- شناسه، URL، code، شمارهٔ فنی و مقدار mixed-direction با `bdi` یا `dir="ltr"`؛
- عدد و تاریخ با locale فارسی در سطح محصول، همراه با مقدار machine-readable در داده؛
- body text حدود ۱۶ تا ۱۸ پیکسل پس از آزمون واقعی؛
- متن بدنهٔ فارسی justify نشود؛
- keyboard موبایل، caret، selection، paste و validation در سطح renderشده آزمون شوند.

## AEO/SEO و provenance محتوا

AEO لایهٔ جادویی جداگانه نیست. پایهٔ پیشنهادی:

- HTML اصلی بدون نیاز به اجرای JavaScript قابل‌خواندن باشد؛
- هر صفحه یک intent روشن و پاسخ مستقیم در ابتدای محتوا داشته باشد؛
- canonical، sitemap، robots، Open Graph و 404 واقعی وجود داشته باشند؛
- نویسنده/بازبین، تاریخ به‌روزرسانی، منبع، فرض و عدم‌قطعیت برای ادعاهای متغیر حفظ شوند؛
- copy visible و structured data با یکدیگر برابر باشند؛
- محتوای تغییرپذیر برنامهٔ بازبینی داشته باشد؛
- `llms.txt`، schema یا JS-only content جای محتوای مفید و crawlable را نگیرد.

## مرز structured data

پس از وجود محتوای واقعی می‌توان این typeها را بررسی کرد:

- `Organization`؛
- `WebSite`؛
- `WebPage`؛
- `BreadcrumbList`؛
- `Article` برای راهنماهای واقعی.

پیش از عرضهٔ واقعی از `Product`، `SoftwareApplication`، review جعلی، قیمت تأییدنشده یا FAQ صرفاً برای rich result استفاده نمی‌شود.

## سیاست crawler پیشنهادی

- `OAI-SearchBot` برای سطح عمومی باز بماند تا محتوا قابلیت حضور در ChatGPT Search داشته باشد.
- تصمیم `GPTBot` جدا از search گرفته شود، چون به استفاده برای آموزش مربوط است.
- سطح `app.chida.ai`، دادهٔ کاربر، فایل و routeهای خصوصی crawl نمی‌شوند.
- crawler policy باید در source، preview و deployment نهایی بررسی شود؛ robots.txt به‌تنهایی authorization نیست.

## budget عملکرد و accessibility

هدف اولیه در صدک ۷۵ موبایل:

- LCP حداکثر ۲٫۵ ثانیه؛
- INP حداکثر ۲۰۰ میلی‌ثانیه؛
- CLS حداکثر ۰٫۱؛
- WCAG 2.2 AA برای مسیرهای اصلی؛
- HTML-first و island فقط برای تعامل لازم؛
- font subset و assetهای self-hosted؛
- هیچ animation ضروری بدون حالت reduced motion.

## دروازهٔ QA

- محتوای واقعی و سازگار با دامنهٔ نسخهٔ یک؛
- RTL واقعی در breakpointهای موبایل و دسکتاپ؛
- light/dark و contrast؛
- keyboard و screen reader؛
- console، network، storage و crawler inspection؛
- structured-data validation در کنار تطابق با copy visible؛
- Lighthouse و Core Web Vitals؛
- نبود route عمومی برای فروشگاه یا دادهٔ خصوصی؛
- فرم lead با disclosure، retention و مقصد روشن.

## مالکیت index و پایش

- پس از رفع DNS و انتشار واقعی، Google Search Console و Bing Webmaster با حساب سازمانی و MFA تنظیم شوند.
- sitemap submission، coverage/indexing، crawl error و تغییر canonical مالک عملیاتی روشن داشته باشند.
- analytics بازاریابی کم‌داده، جدا از analytics محصول و مشروط به disclosure، consent و retention مصوب باشد.
- alert برای افت availability، certificate، robots، sitemap و Core Web Vitals تعریف شود.
- دادهٔ فرم lead تا پیش از تعیین مقصد، دسترسی، retention و deletion جمع‌آوری نشود.

## منابع رسمی

- [Astro islands](https://docs.astro.build/en/concepts/islands/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Anthropic Artifacts](https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)
- [DTCG Design Tokens Format 2025.10](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/)
- [Vazirmatn](https://github.com/rastikerdar/vazirmatn)
- [W3C: Structural markup and right-to-left text](https://www.w3.org/International/questions/qa-html-dir)
- [CSS Logical Properties](https://www.w3.org/TR/css-logical-1/)
- [Google guidance for AI features in Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [OpenAI Publishers and Developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)
- [Core Web Vitals](https://web.dev/articles/vitals)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
