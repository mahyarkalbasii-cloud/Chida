# CHIDA — دیزاین‌سیستم / Design System

چیدا (CHIDA) is a Persian, mobile-first AI product for buying, sourcing and deciding in the Iranian construction market. It has two sides of a marketplace: **سازنده** (builder) and **تأمین‌کننده** (supplier). The experience must feel calm, professional, trustworthy, natural in Persian, and genuinely RTL.

This system starts at the sign-up flow and grows into the product core.

## Product decisions baked into this system
- **One role per account, permanently.** An account is either a builder or a supplier. There is no "both" option, no second-role flow, and no role switcher anywhere in the UI — this keeps the two sides of the marketplace separated and avoids conflicts of interest. The role screen states this in plain Persian; the account screen repeats it.
- **Two entry paths.** Builder: کد دعوت → موبایل → کد تأیید. Supplier: موبایل → کد تأیید. Then hand off to first project (builder) or store profile (supplier).
- **No AI surface in onboarding.** Sign-up is deterministic, direct and confidence-building; nothing in the flow suggests a model is deciding anything.
- **Mobile-first at 390×844**, 16px gutters, 358px content, 48px minimum touch target, primary action reachable above the keyboard.

## Sources given
- `uploads/IRANYekanXVF.ttf` — the single variable font file for the whole system (copied to `assets/fonts/`).
- Written brief (Persian) covering product context, tone, colour constraints, accessibility and the first flow.
- Answers to a clarifying round: accent `#96603D`, Persian-only wordmark, Latin digits in fields / Persian digits in prose, system-following theme, 10px control radius, flat cards + subtle-shadow modals, respectful-but-close tone, 6-digit OTP, invite format `CHD-4K9P`.
- **No codebase, no Figma file, no logo file, no screenshots were provided.** Everything visual here is authored from the brief; nothing is copied from an existing CHIDA product.

---

# CONTENT FUNDAMENTALS

**Language.** Persian only in the product surface. Latin appears only where the data is Latin (phone digits, invite codes, OTP). Never mix an English UI word into a Persian sentence ("سابمیت", "لاگین" — no).

**Person and address.** The product addresses the user as **شما**, and speaks about itself as **چیدا** or **ما**, sparingly: «کد تأیید را به همین شماره پیامک می‌کنیم.» Never «کاربر گرامی».

**Sentence shape.** Short declaratives. One idea per line. Verbs in simple present. Avoid the bureaucratic passive («ثبت گردید») and avoid formal-officialese («لطفاً نسبت به تکمیل اقدام فرمایید»).

| Element | Rule | Example |
|---|---|---|
| Screen title | 2–5 words, no punctuation | «کد تأیید را وارد کنید» |
| Lead line | one sentence, says what happens next | «کد ۶ رقمی به شماره ۰۹۱۲… پیامک شد.» |
| Field label | noun phrase, no colon | «شماره موبایل» |
| Help text | why we ask, or the accepted format | «کد ۸ کاراکتری که برایتان پیامک شده است.» |
| Error | what is wrong + what to do; never blames | «این کد معتبر نیست. دوباره بررسی کنید.» |
| Primary button | verb-first, 1–3 words | «دریافت کد تأیید»، «ثبت پروژه» |
| Secondary/ghost | plain, lowercase in tone | «ویرایش شماره»، «کد دعوت ندارم» |
| Success | states the fact, then the next step | «حساب شما ساخته شد.» |

**Not used:** emoji, exclamation marks, superlatives («بهترین», «سریع‌ترین»), raw error codes, ALL-CAPS Latin, marketing filler, gamification («تبریک!»).

**Numbers.** Persian digits in prose (۱۲ تن، مرحله ۲ از ۳، ۴۲٬۵۰۰٬۰۰۰ ریال). Latin digits inside inputs, OTP boxes and any value the user typed or will copy (`0912 345 6789`, `CHD-4K9P`). Latin/numeric runs inside Persian text are wrapped in `.chida-ltr-field` / `.chida-num` so bidi never breaks the punctuation.

**Consent and trust copy.** Say what we will do with the number before asking for it. Never pre-check a consent box. Errors caused by us («ارسال کد انجام نشد») take responsibility without apologising twice.

---

# VISUAL FOUNDATIONS

**Overall feel.** Warm, human, low-tension. Ink on warm paper with a single copper accent. Inspired by the calm of claude.ai and the clarity of leading assistant products, but CHIDA's own: warmer neutrals, an earthier accent, more air, fewer moving parts.

**Colour.** Warm neutral ramp (`--warm-50…900`) + one copper accent (`--copper-500 #96603D`) + one error (`--rust-500 #B23A2C`). That is the whole palette. Copper is reserved for: the primary button, the selected state, focus rings, progress fill, links, and the success ring. If two things on a screen are copper, one of them is wrong. No gradients, no glassmorphism, no neon, no second accent, no decorative colour.

**Themes.** Light and dark are both first-class and follow the OS (`prefers-color-scheme`), overridable with `data-theme="light" | "dark"`. Dark is a warm near-black (`#121110`) with a lighter copper (`#C08056`) so contrast holds; it is never pure black and never a tinted blue-grey.

**Type.** IRANYekanXVF, three weights only — 400 body, 500 labels/links, 600 titles and primary buttons. Scale: 28/22/18/16/15/14/13/12. Line heights are generous (28px for 16px body) because Persian needs room for diacritics and descenders; nothing is ever clipped. Tracking is normal except a slight −0.01em on display sizes and +0.02em on Latin/numeric runs.

**Layout.** One column, 390 base, 16px gutter, 358 content. Vertical rhythm from the 4px spacing scale; 16px between related blocks, 24–32px between sections. Screens are header (56) → scrollable body → sticky footer holding the single primary action, which stays above the keyboard. Nothing floats over content except sheets and modals.

**Backgrounds.** Flat warm surfaces only. No photography, no illustration, no pattern, no texture, no full-bleed imagery — none was provided, and the product's calm depends on emptiness. If imagery is added later it should be warm, matte and documentary (real sites, real materials), never stock-blue or glossy.

**Cards and surfaces.** Card = `--bg-surface` + 1px `--border-subtle` + 14px radius + **no shadow**. Depth comes from hairlines and background steps, not shadows. Only floating layers get shadow: `--elev-overlay` for modals, `--elev-sheet` for bottom sheets. Sheets: 20px top corners, 36×4 grabber. Controls (buttons, fields, OTP boxes): 10px radius. Pill radius only for progress segments and the sheet grabber.

**Borders.** One hairline width (1px) in three strengths: `--border-subtle` (dividers, cards), `--border-default` (fields), `--border-strong` (hover, filled OTP). Dividers are full-width inside a card's padding, never colour-coded, never doubled.

**States.** Hover: background steps one level (`--bg-hover`) or the accent darkens to `--accent-hover`; never opacity fades. Press: `--accent-pressed` plus a 0.99 scale — a small settle, not a bounce. Focus: 2px `--focus-ring` outline with 2px offset, plus a 3px copper-tint ring inside fields. Disabled: `--bg-inset` fill, `--text-disabled` label, cursor not-allowed, and always an adjacent explanation. Selected: copper border + copper-tint fill + a filled check — never colour alone. Error: rust border, rust caption, an alert icon, and (OTP only) one 280ms shake.

**Motion.** 140ms for colour, 200ms for sheets/modals, 280ms for the success ring; one easing curve `cubic-bezier(.2,.6,.2,1)`. Fades and short translations only — no bounce, no spring, no parallax, no skeleton shimmer (skeletons are a flat `--skeleton` fill). `prefers-reduced-motion` disables all of it globally.

**Transparency and blur.** Used exactly twice: the modal/sheet scrim (`--overlay`) and the copper tint fills (`--accent-subtle`). No backdrop blur anywhere.

**Iconography density.** Icons are functional, never decorative; a screen rarely shows more than five.

---

# ICONOGRAPHY

- **No icon set was provided.** ⚠️ **Substitution flagged:** the system ships [Lucide](https://lucide.dev) (ISC), copied into `assets/icons/` as 47 individual SVGs — the closest match to the brief's "few but precise details": 24×24 grid, 2px round stroke, no fill.
- Icons are rendered through the `Icon` component, which paints the SVG as a CSS **mask** filled with `currentColor` — so a glyph always inherits its text colour and both themes work with one file. Pages set `window.CHIDA_ICON_BASE` to the relative path of `assets/icons`.
- Sizes: 16 inline with text, 20 default (fields, buttons), 22 in headers and the tab bar, 26–30 in empty/success states. Never scale a glyph above 32.
- Directional glyphs follow RTL: back is `chevron-right`, "go deeper" is `chevron-left`. The `flip` prop mirrors a glyph when a mirrored variant is needed.
- Role glyphs are fixed: `building-2` = سازنده, `store` = تأمین‌کننده (and فروشگاه), `clipboard-list` = استعلام, `truck` = سفارش.
- **No emoji, ever** — not in UI, not in copy, not in empty states. No unicode symbols as icons (no ✓, ✗, →). No second icon family, no filled variants, no brand/social glyphs.
- **No logo file was provided**, so no mark was drawn. Everywhere a logo would sit, the wordmark **چیدا** is set in IRANYekanXVF 600 in `--accent` (see `guidelines/brand-wordmark.card.html`). Send a real logo and it drops into `assets/`.

---

# INDEX

**Root**
- `styles.css` — the single entry point consumers link (imports only).
- `readme.md` — this file. `SKILL.md` — Agent-Skills wrapper. `thumbnail.html` — homepage tile.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `radius.css`, `elevation.css`, `motion.css`, `grid.css`, `base.css`.
- `assets/fonts/IRANYekanXVF.ttf`, `assets/icons/*.svg` (47 Lucide glyphs).
- `guidelines/*.card.html` — 21 foundation specimen cards (Colors, Type, Spacing, Brand).

**Components** (`components/<group>/<Name>.jsx` + `.d.ts` + `.prompt.md`, one card per group)
- `core/` — **Icon**, **Button**, **IconButton**
- `forms/` — **TextField**, **PhoneField**, **InviteCodeField**, **OtpInput**, **Checkbox**, **FieldMessage** (+ `digits.js` helpers)
- `content/` — **RoleCard**, **Card**, **ListRow**, **Tag**
- `navigation/` — **AppHeader**, **StepIndicator**, **TabBar**
- `feedback/` — **Spinner**, **SuccessState**, **InlineBanner**
- `overlays/` — **Modal**, **BottomSheet**

**Intentional additions** (asked-for list plus the minimum needed to build the requested screens)
- **Icon** — wrapper for the substituted glyph set; without it every screen would hand-roll SVG.
- **Card**, **ListRow**, **Tag**, **TabBar** — required by the builder/supplier home screens the brief asked for.
- **InlineBanner** — required by the error/offline states the brief asked for.
- `PickerField` lives inside the UI kit (not the component library): a read-only `TextField` that opens a `BottomSheet` of options, used for city/category/stage selection.

**UI kit**
- `ui_kits/chida-app/` — `index.html` (interactive: role → invite → phone → OTP → success → home, both roles), `states.html` (error/offline/empty), `onboarding.jsx`, `builder.jsx`, `supplier.jsx`, `app.jsx`, `README.md`.

**Template**
- `templates/signup-flow/` — a copyable starting point for the sign-up flow.

## Accessibility rules this system enforces
Contrast: `--text-primary` on `--bg-canvas` ≥ 13:1, `--text-secondary` ≥ 5.4:1, copper on white 5.2:1, white on copper 5.1:1 (all AA at body size; large text comfortably AAA). Focus is always visible and never removed. State is never colour-only. Touch targets never below 48px. Text never clipped — Persian line heights leave room for descenders, and no `text-overflow` on anything the user must read. `prefers-reduced-motion` is honoured globally.
