# تحویل عملیاتی دامنه chida.ai

- **Status:** Operational observation and handoff — not an architecture decision
- **Observed:** 2026-08-20
- **Secrets and personal data:** Intentionally excluded
- **Review rule:** وضعیت DNS زمان‌مند است و پیش از هر اقدام باید دوباره بررسی شود.

## هدف

این سند فقط مشاهدهٔ پالایش‌شدهٔ دامنه و runbook بررسی را نگه می‌دارد. هیچ تغییر DNS، registrar، hosting یا identity در جریان پژوهش انجام نشد. raw RDAP، نام، تلفن، ایمیل، نشانی، token و credential عمداً در ریپو ذخیره نشده‌اند.

## وضعیت مشاهده‌شده

در snapshot پژوهشی ۲۰ اوت ۲۰۲۶:

- `chida.ai` ثبت شده بود؛
- nameserverهای delegation برابر `ns1.hostiran.net` و `ns2.hostiran.net` بودند؛
- RDAP مقدار `delegationSigned: false` را نشان می‌داد؛
- هر دو authoritative nameserver برای SOA پاسخ `REFUSED` دادند؛
- resolverهای عمومی Google، Cloudflare و Quad9 در همان بررسی `SERVFAIL` برگرداندند؛
- سایت نباید تا رفع zone/delegation به‌عنوان preview عمومی آماده اعلام شود.

این نتیجه یک snapshot است، نه تضمین وضعیت کنونی یا diagnosis قطعی پنل.

## شواهد read-only پیشنهادی

روی یک سیستم دارای PowerShell و `nslookup`:

```powershell
Resolve-DnsName chida.ai -Type NS
Resolve-DnsName chida.ai -Type SOA -Server 8.8.8.8
nslookup -type=SOA chida.ai ns1.hostiran.net
nslookup -type=SOA chida.ai ns2.hostiran.net
```

برای DoH فقط status و answerهای غیرشخصی بررسی شوند:

```powershell
Invoke-RestMethod 'https://dns.google/resolve?name=chida.ai&type=SOA'
```

raw RDAP را در log، issue، screenshot یا commit قرار ندهید.

## checklist پیش از تغییر

1. ورود امن به registrar و پنل DNS با MFA؛
2. تأیید مالکیت، تاریخ انقضا، auto-renew و registrar lock؛
3. بررسی اینکه zone در HostIran واقعاً ایجاد و فعال است؛
4. تطبیق nameserverهای parent delegation با پنل DNS؛
5. export آفلاین zone موجود پیش از ویرایش؛ فایل رمزگذاری‌شده، خارج از ریپو و با کمترین سطح دسترسی نگه‌داری و پیش از ارسال برای support پالایش شود؛
6. ثبت TTL، رکوردهای فعلی و rollback target؛
7. تعیین دقیق apex، `www` و `app` پس از پذیرش topology؛
8. آماده‌سازی CAA و مسیر certificate issuance؛
9. برنامهٔ DNSSEC فقط با پشتیبانی هماهنگ registrar و DNS provider؛
10. عدم انتشار TXT verification token در سند یا گفتگو.

## ترتیب پیشنهادی remediation

1. علت `REFUSED` در پنل HostIran یا support ticket روشن شود.
2. zone یا delegation اصلاح شود، بدون تغییر هم‌زمان چند provider.
3. SOA و NS authoritative مستقیماً آزمون شوند.
4. resolverهای عمومی پس از propagation آزمون شوند.
5. فقط پس از پاسخ پایدار، رکوردهای preview ایجاد شوند.
6. TLS، redirect، canonical و crawler behavior بررسی شوند.
7. DNSSEC و CAA پس از تثبیت zone با runbook rollback فعال شوند.

## checklist پس از تغییر

- authoritative SOA و NS پاسخ معتبر دارند؛
- Google، Cloudflare و Quad9 پاسخ سازگار دارند؛
- `SERVFAIL`، lame delegation یا loop وجود ندارد؛
- apex و `www` مطابق topology پذیرفته‌شده‌اند؛
- TLS chain و تمدید خودکار سالم است؛
- CAA با CA واقعی سازگار است؛
- DNSSEC در صورت فعال‌سازی با DS معتبر می‌شود؛
- zone export جدید و تاریخ rollback در نسخهٔ رمزگذاری‌شده و خارج از ریپو ثبت شده است؛
- هیچ token یا دادهٔ شخصی در Git، CI log یا screenshot نیست.

## منابع عمومی

- [RDAP برای chida.ai](https://rdap.identitydigital.services/rdap/domain/chida.ai)
- [Google Public DNS SOA lookup](https://dns.google/resolve?name=chida.ai&type=SOA)
- [IANA .ai delegation information](https://www.iana.org/domains/root/db/ai.html)
