import {
  ArrowUp,
  ArrowRight,
  Bell,
  Bot,
  BrainCircuit,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  Folder,
  Gauge,
  HardHat,
  Hammer,
  Image as ImageIcon,
  KeyRound,
  LayoutGrid,
  Menu,
  MessageSquare,
  Mic,
  MoreHorizontal,
  PackageCheck,
  Palette,
  Pin,
  Plus,
  Puzzle,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  Volume2,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import {
  BottomSheet,
  Carousel,
  KeyboardInput,
  KeyboardTextarea,
  MobileScroll,
  useKeyboard,
  useKeyboardInsets,
} from "./mobile";

type Screen = "role" | "invite" | "phone" | "otp" | "success" | "home";
type SheetName = "supplier" | "models" | "attach" | "tools" | "build" | "brief" | "projects" | "settings" | null;
type ModelMode = "خودکار" | "سریع" | "عمیق";
type ChatMessage = { id: number; role: "user" | "assistant"; text: string };
type BuildStep = "define" | "preview" | "installed";
type BriefFrequency = "daily" | "weekly";
type BriefSchedule = { frequency: BriefFrequency; weekday: string; time: string };

const defaultInvite = "CHD-4K9P";
const defaultPhone = "09123456789";
const defaultOtp = "123456";
const installedToolStorageKey = "chida-prototype-installed-tool";
const briefStorageKey = "chida-prototype-brief";

const projectOptions = [
  { name: "برج نیلوفر", meta: "تهران · مرحله اسکلت" },
  { name: "خانه جردن", meta: "تهران · نازک‌کاری" },
];

const quickActions = [
  { label: "درخواست قیمت", icon: FileText },
  { label: "بررسی پیشنهادها", icon: Search },
  { label: "صورت‌جلسه", icon: CheckCircle2 },
  { label: "برنامه خرید", icon: LayoutGrid },
];

export default function Prototype() {
  const [screen, setScreen] = useState<Screen>("role");
  const [sheet, setSheet] = useState<SheetName>(null);
  const [invite, setInvite] = useState(defaultInvite);
  const [phone, setPhone] = useState(defaultPhone);
  const [otp, setOtp] = useState(defaultOtp);
  const [error, setError] = useState("");
  const [activeProject, setActiveProject] = useState(projectOptions[0].name);
  const [modelMode, setModelMode] = useState<ModelMode>("خودکار");

  useEffect(() => {
    const html = document.documentElement;
    const previousLang = html.lang;
    const previousTheme = html.dataset.chidaTheme;
    html.lang = "fa";
    html.dataset.chidaTheme = "dark";
    return () => {
      html.lang = previousLang;
      if (previousTheme) html.dataset.chidaTheme = previousTheme;
      else delete html.dataset.chidaTheme;
    };
  }, []);

  useLayoutEffect(() => {
    const phoneScreen = document.querySelector<HTMLElement>("[data-phone-screen]");
    if (!phoneScreen) return;

    phoneScreen.scrollTo({ top: 0, left: 0 });
  }, [screen]);

  const goTo = (next: Screen) => {
    setError("");
    setScreen(next);
  };

  if (screen === "home") {
    return (
      <BuilderHome
        activeProject={activeProject}
        modelMode={modelMode}
        onProjectChange={setActiveProject}
        onModelChange={setModelMode}
        onOpenSheet={setSheet}
        sheet={sheet}
      />
    );
  }

  const steps: Record<Exclude<Screen, "home">, number> = {
    role: 1,
    invite: 2,
    phone: 3,
    otp: 4,
    success: 4,
  };
  const backMap: Partial<Record<Screen, Screen>> = { invite: "role", phone: "invite", otp: "phone" };

  const validateInvite = () => {
    const normalized = invite.trim().toUpperCase();
    if (normalized.length < 7 || normalized === "CHD-0000") {
      setError("کد دعوت معتبر نیست. کد پیش‌فرض نمونه را امتحان کن.");
      return;
    }
    setInvite(normalized);
    goTo("phone");
  };

  const validatePhone = () => {
    const normalized = phone.replace(/\D/g, "");
    if (!/^09\d{9}$/.test(normalized)) {
      setError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم داشته باشد.");
      return;
    }
    setPhone(normalized);
    goTo("otp");
  };

  const validateOtp = () => {
    const normalized = otp.replace(/\D/g, "");
    if (!/^\d{6}$/.test(normalized) || normalized === "000000") {
      setError("کد واردشده درست نیست. برای نمونه ۱۲۳۴۵۶ را وارد کن.");
      return;
    }
    setOtp(normalized);
    goTo("success");
  };

  return (
    <>
      <MobileScroll className="chida-app auth-page">
        <main className="auth-shell" dir="rtl" data-theme="dark" data-testid="auth-flow">
          <AuthHeader
            canGoBack={Boolean(backMap[screen])}
            onBack={() => backMap[screen] && goTo(backMap[screen]!)}
          />
          <div className="auth-progress" aria-label={`مرحله ${steps[screen]} از ۴`}>
            {[1, 2, 3, 4].map((step) => <span key={step} data-active={step <= steps[screen]} />)}
          </div>

          {screen === "role" ? <RoleScreen onBuilder={() => goTo("invite")} onSupplier={() => setSheet("supplier")} /> : null}

          {screen === "invite" ? (
            <AuthForm
              eyebrow="ویژه سازندگان"
              title="کد دعوتت را وارد کن"
              description="ثبت‌نام سازندگان فعلاً فقط با دعوت چیدا انجام می‌شود."
              icon={<KeyRound size={22} strokeWidth={1.8} />}
              error={error}
              actionLabel="تأیید کد دعوت"
              actionTestId="invite-submit"
              onAction={validateInvite}
            >
              <label className="field-control" htmlFor="invite-code">
                <span>کد دعوت</span>
                <KeyboardInput
                  id="invite-code"
                  data-testid="invite-input"
                  value={invite}
                  onChange={(event) => { setInvite(event.target.value); setError(""); }}
                  dir="ltr"
                  autoCapitalize="characters"
                  maxLength={12}
                />
                <small>نمونه آماده: {defaultInvite}</small>
              </label>
            </AuthForm>
          ) : null}

          {screen === "phone" ? (
            <AuthForm
              eyebrow="تأیید هویت"
              title="شماره موبایلت را تأیید کن"
              description="کد یک‌بارمصرف به همین شماره فرستاده می‌شود."
              icon={<ShieldCheck size={22} strokeWidth={1.8} />}
              error={error}
              actionLabel="دریافت کد یک‌بارمصرف"
              actionTestId="phone-submit"
              onAction={validatePhone}
            >
              <label className="field-control" htmlFor="phone-number">
                <span>شماره موبایل</span>
                <KeyboardInput
                  id="phone-number"
                  data-testid="phone-input"
                  value={phone}
                  onChange={(event) => { setPhone(event.target.value); setError(""); }}
                  dir="ltr"
                  inputMode="numeric"
                  maxLength={11}
                />
                <small>شماره برای تست از قبل وارد شده است.</small>
              </label>
            </AuthForm>
          ) : null}

          {screen === "otp" ? (
            <AuthForm
              eyebrow="آخرین مرحله"
              title="کد تأیید را وارد کن"
              description={`کد شش‌رقمی ارسال‌شده به ${phone}`}
              icon={<ShieldCheck size={22} strokeWidth={1.8} />}
              error={error}
              actionLabel="ورود به چیدا"
              actionTestId="otp-submit"
              onAction={validateOtp}
            >
              <label className="field-control" htmlFor="otp-code">
                <span>کد یک‌بارمصرف</span>
                <KeyboardInput
                  id="otp-code"
                  className="otp-field"
                  data-testid="otp-input"
                  value={otp}
                  onChange={(event) => { setOtp(event.target.value); setError(""); }}
                  dir="ltr"
                  inputMode="numeric"
                  maxLength={6}
                />
                <small>کد نمونه: {defaultOtp}</small>
              </label>
            </AuthForm>
          ) : null}

          {screen === "success" ? <SuccessScreen onContinue={() => goTo("home")} /> : null}
        </main>
      </MobileScroll>

      <BottomSheet
        open={sheet === "supplier"}
        onOpenChange={(open) => setSheet(open ? "supplier" : null)}
        title="مسیر تأمین‌کننده به‌زودی"
        description="این انتخاب ثبت شد، اما در این نسخه فقط مسیر سازنده فعال است."
        snap={0.36}
      >
        <div className="sheet-message" dir="rtl" data-theme="dark" data-testid="supplier-unavailable-sheet">
          <div className="sheet-message-icon"><Store size={24} /></div>
          <p>نسخهٔ تأمین‌کننده در مرحلهٔ بعد با همین زبان طراحی ساخته می‌شود.</p>
          <button className="primary-button" type="button" onClick={() => setSheet(null)}>متوجه شدم</button>
        </div>
      </BottomSheet>
    </>
  );
}

function AuthHeader({ canGoBack, onBack }: { canGoBack: boolean; onBack: () => void }) {
  return (
    <header className="auth-header">
      <div className="brand-lockup" aria-label="چیدا">
        <span className="brand-mark"><HardHat size={20} strokeWidth={1.8} /></span><strong>چیدا</strong>
      </div>
      <div className="auth-header-actions">
        {canGoBack ? <button className="icon-button" type="button" onClick={onBack} aria-label="بازگشت"><ArrowRight size={20} /></button> : null}
      </div>
    </header>
  );
}

function RoleScreen({ onBuilder, onSupplier }: { onBuilder: () => void; onSupplier: () => void }) {
  return (
    <section className="auth-content role-content" data-testid="screen-role">
      <div className="auth-copy">
        <span className="eyebrow">شروع همکاری با چیدا</span>
        <h1>نقشت را انتخاب کن</h1>
        <p>چیدا دستیار هوشمند بازار ساخت‌وساز است؛ از کشف نیاز تا مقایسه و مذاکره، کنار پروژه می‌ماند.</p>
      </div>
      <div className="role-list" aria-label="انتخاب نقش">
        <button className="role-card" type="button" onClick={onBuilder} data-testid="role-builder">
          <span className="role-icon"><Building2 size={26} strokeWidth={1.65} /></span>
          <span className="role-copy"><strong>سازنده‌ام</strong><small>برای پروژه‌ام کالا، خدمات و تصمیم بهتر می‌خواهم.</small></span>
          <span className="role-status active">فعال</span>
        </button>
        <button className="role-card" type="button" onClick={onSupplier} data-testid="role-supplier" aria-label="تأمین‌کننده‌ام — این مسیر به‌زودی فعال می‌شود">
          <span className="role-icon"><Store size={26} strokeWidth={1.65} /></span>
          <span className="role-copy"><strong>تأمین‌کننده‌ام</strong><small>می‌خواهم محصولات و توانمندی کسب‌وکارم دیده شود.</small></span>
          <span className="role-status">به‌زودی</span>
        </button>
      </div>
      <div className="role-rule">
        <ShieldCheck size={18} />
        <span><strong>هر حساب فقط یک نقش دارد.</strong> بعد از ثبت‌نام امکان نقش دوم یا تغییر نقش وجود ندارد.</span>
      </div>
    </section>
  );
}

function AuthForm({ eyebrow, title, description, icon, error, actionLabel, actionTestId, onAction, children }: { eyebrow: string; title: string; description: string; icon: ReactNode; error: string; actionLabel: string; actionTestId: string; onAction: () => void; children: ReactNode }) {
  const keyboard = useKeyboard();
  return (
    <section className="auth-content auth-form-screen" data-testid={`screen-${actionTestId.replace("-submit", "")}`}>
      <div className="auth-copy">
        <span className="eyebrow">{eyebrow}</span>
        <div className="form-title-row"><span className="form-title-icon">{icon}</span><h1>{title}</h1></div>
        <p>{description}</p>
      </div>
      <div className="form-card">
        {children}
        <div className="validation-slot" aria-live="polite">{error ? <p className="error-message">{error}</p> : null}</div>
        <button className="primary-button" type="button" data-testid={actionTestId} onClick={() => { keyboard.hide(); onAction(); }}>{actionLabel}</button>
      </div>
      <p className="privacy-note"><ShieldCheck size={15} /> اطلاعات نمونه فقط در همین پروتوتایپ نگه داشته می‌شود.</p>
    </section>
  );
}

function SuccessScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="auth-content success-screen" data-testid="success-screen">
      <div className="success-icon"><Check size={34} strokeWidth={1.8} /></div>
      <span className="eyebrow">ورود موفق</span>
      <h1>خوش آمدی، سازنده</h1>
      <p>پروژهٔ نمونه «برج نیلوفر» آماده است تا فضای اصلی چیدا را ببینی.</p>
      <button className="primary-button" type="button" onClick={onContinue} data-testid="enter-home">ورود به پروژه</button>
    </section>
  );
}

function BuilderHome({ activeProject, modelMode, onProjectChange, onModelChange, onOpenSheet, sheet }: { activeProject: string; modelMode: ModelMode; onProjectChange: (project: string) => void; onModelChange: (mode: ModelMode) => void; onOpenSheet: (sheet: SheetName) => void; sheet: SheetName }) {
  const keyboard = useKeyboard();
  const { bottomInset } = useKeyboardInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [installedTool, setInstalledTool] = useState(() => window.localStorage.getItem(installedToolStorageKey) ?? "");
  const [briefSchedule, setBriefSchedule] = useState<BriefSchedule | null>(() => {
    try {
      const stored = window.localStorage.getItem(briefStorageKey);
      return stored ? JSON.parse(stored) as BriefSchedule : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const projectMeta = useMemo(() => projectOptions.find((project) => project.name === activeProject)?.meta ?? "تهران", [activeProject]);
  const briefSummary = briefSchedule
    ? briefSchedule.frequency === "daily"
      ? `روزانه · ${briefSchedule.time}`
      : `هفتگی · ${briefSchedule.weekday} · ${briefSchedule.time}`
    : "تنظیم نشده";

  const installTool = (toolName: string) => {
    setInstalledTool(toolName);
    window.localStorage.setItem(installedToolStorageKey, toolName);
  };

  const saveBrief = (schedule: BriefSchedule) => {
    setBriefSchedule(schedule);
    window.localStorage.setItem(briefStorageKey, JSON.stringify(schedule));
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    const nextId = Date.now();
    setMessages((current) => [...current, { id: nextId, role: "user", text }, { id: nextId + 1, role: "assistant", text: `برای «${activeProject}» گرفتم. در نسخهٔ بعد این درخواست به منابع پروژه و ابزارهای تخصصی چیدا متصل می‌شود.` }]);
    setDraft("");
    keyboard.hide();
  };

  return (
    <div className="chida-app chida-shell" dir="rtl" data-theme="dark" data-mode="fullscreen" data-testid="builder-home">
      <MobileScroll className="chat-scroll">
        <main className="chat-canvas">
          {messages.length === 0 ? (
            <div className="empty-chat" data-testid="empty-chat">
              <span className="empty-mark"><Sparkles size={23} strokeWidth={1.65} /></span>
              <h1>برای {activeProject} چه کاری را پیش ببریم؟</h1>
              <p>نیازت را بگو؛ چیدا مسیر بررسی، مقایسه و اقدام بعدی را مرتب می‌کند.</p>
            </div>
          ) : (
            <div className="message-list" aria-live="polite">
              {messages.map((message) => <article className={`message ${message.role}`} key={message.id}>{message.role === "assistant" ? <span className="message-label">چیدا</span> : null}<p>{message.text}</p></article>)}
            </div>
          )}
        </main>
      </MobileScroll>

      <header className="app-header">
        <button className="icon-button header-button" type="button" onClick={() => { keyboard.hide(); setDrawerOpen(true); }} aria-label="بازکردن منو" data-testid="menu-button"><Menu size={22} /></button>
        <button className="project-switcher" type="button" onClick={() => onOpenSheet("projects")} data-testid="project-switcher"><span><strong>{activeProject}</strong><small>پروژه فعال</small></span><ChevronDown size={16} /></button>
      </header>

      <section className="composer-dock" style={{ bottom: bottomInset + 8 }} data-testid="composer-dock">
        <Carousel ariaLabel="اقدام‌های سریع" className="quick-actions" contentClassName="quick-actions-track">
          {quickActions.map(({ label, icon: Icon }) => <button className="quick-chip" type="button" key={label} onClick={() => setDraft(label)}><Icon size={16} strokeWidth={1.7} /><span>{label}</span></button>)}
        </Carousel>
        <div className="composer-stack" data-testid="composer-box">
          <div className="composer-card" data-testid="composer-card">
            <KeyboardTextarea data-testid="composer-input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`پیامت برای ${activeProject}...`} rows={2} aria-label="پیام به چیدا" />
            <div className="composer-actions">
              <div className="composer-action-group primary-tools">
                <button className="composer-icon" type="button" onClick={() => onOpenSheet("attach")} aria-label="افزودن فایل یا تصویر" data-testid="attach-button"><Plus size={23} /></button>
                <button className="composer-icon" type="button" onClick={() => onOpenSheet("models")} aria-label={`حالت پاسخ: ${modelMode}`} data-testid="model-button"><Gauge size={21} /></button>
              </div>
              <div className="composer-action-group send-tools">
                <button className="composer-icon" type="button" aria-label="ورودی صوتی" data-testid="voice-button"><Mic size={21} /></button>
                <button className="send-button" type="button" onClick={sendMessage} aria-label="ارسال پیام" data-testid="send-button" data-ready={draft.trim() ? "true" : "false"} disabled={!draft.trim()}><ArrowUp size={20} strokeWidth={2.1} /></button>
              </div>
            </div>
          </div>
          <div className="project-context" data-testid="project-context">
            <button className="active-project" type="button" onClick={() => onOpenSheet("projects")}>
              <Folder size={17} /><span><small>پروژه فعال</small><strong>{activeProject}</strong></span><ChevronDown size={15} />
            </button>
            <button className="tool-cluster" type="button" onClick={() => onOpenSheet("tools")} aria-label="نمایش ابزارهای فعال" data-testid="capability-cluster">
              <span className="tool-cluster-label">ابزارها</span>
              <span className="tool-icons" aria-hidden="true"><span><Search size={13} /></span><span><FileText size={13} /></span><span><Wrench size={13} /></span>{installedTool ? <span><Hammer size={13} /></span> : null}</span>
              <ChevronDown size={13} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {drawerOpen ? (
          <>
            <motion.button className="drawer-backdrop" type="button" aria-label="بستن منو" onClick={() => setDrawerOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="app-drawer" data-testid="nav-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 420, damping: 42 }}>
              <div className="drawer-top"><div className="brand-lockup"><span className="brand-mark"><HardHat size={19} /></span><strong>چیدا</strong></div><button className="icon-button" type="button" onClick={() => setDrawerOpen(false)} aria-label="بستن منو"><X size={20} /></button></div>
              <nav className="drawer-nav" aria-label="منوی چیدا">
                <button type="button"><MessageSquare size={19} /><span>گفتگوی تازه</span><Plus size={17} /></button>
                <button type="button"><Folder size={19} /><span>پروژه‌ها</span><span className="nav-count">۲</span></button>
                <button type="button"><Pin size={19} /><span>پین‌شده‌ها</span><span className="nav-count">۳</span></button>
                <button type="button" data-testid="drawer-brief-entry" onClick={() => { setDrawerOpen(false); onOpenSheet("brief"); }}>
                  <CalendarDays size={19} />
                  <span className="drawer-nav-copy"><strong>بریف</strong><small data-testid="drawer-brief-summary">{briefSummary}</small></span>
                  <ChevronDown size={17} />
                </button>
                <button type="button"><Wrench size={19} /><span>امکانات چیدا</span><ChevronDown size={17} /></button>
              </nav>
              <div className="drawer-section">
                <div className="drawer-section-title"><span>گفتگوهای اخیر</span><button type="button" aria-label="جستجو"><Search size={17} /></button></div>
                <button className="recent-chat active" type="button"><span>بررسی قیمت میلگرد پروژه</span><small>برج نیلوفر · امروز</small></button>
                <button className="recent-chat" type="button"><span>مقایسه پیشنهادهای سیمان</span><small>برج نیلوفر · دیروز</small></button>
                <button className="recent-chat" type="button"><span>چک‌لیست خرید تاسیسات</span><small>خانه جردن · ۳ روز پیش</small></button>
              </div>
              <button className="drawer-profile" type="button" data-testid="drawer-profile" onClick={() => { setDrawerOpen(false); onOpenSheet("settings"); }}>
                <span className="drawer-avatar" aria-hidden="true">م</span><span className="drawer-profile-copy"><strong>مهیار کلباسی</strong><small>حساب سازنده</small></span><Settings size={18} />
              </button>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <ModelsSheet sheet={sheet} mode={modelMode} onClose={() => onOpenSheet(null)} onSelect={onModelChange} />
      <AttachSheet sheet={sheet} onClose={() => onOpenSheet(null)} />
      <ToolsSheet sheet={sheet} installedTool={installedTool} onBuild={() => onOpenSheet("build")} onClose={() => onOpenSheet(null)} />
      <BuildSheet sheet={sheet} activeProject={activeProject} onClose={() => onOpenSheet(null)} onInstalled={installTool} />
      <BriefSheet sheet={sheet} schedule={briefSchedule} onClose={() => onOpenSheet(null)} onSave={saveBrief} />
      <ProjectsSheet sheet={sheet} activeProject={activeProject} onClose={() => onOpenSheet(null)} onSelect={onProjectChange} />
      <SettingsSheet sheet={sheet} onClose={() => onOpenSheet(null)} />
      <span className="sr-only" aria-live="polite">{projectMeta}</span>
    </div>
  );
}

function SheetRow({ icon, title, description, selected, testId, onClick }: { icon: ReactNode; title: string; description: string; selected?: boolean; testId?: string; onClick: () => void }) {
  return <button className="sheet-row" type="button" onClick={onClick} data-testid={testId} data-selected={selected ? "true" : "false"}><span className="sheet-row-icon">{icon}</span><span className="sheet-row-copy"><strong>{title}</strong><small>{description}</small></span>{selected ? <Check size={18} /> : null}</button>;
}

function ModelsSheet({ sheet, mode, onClose, onSelect }: { sheet: SheetName; mode: ModelMode; onClose: () => void; onSelect: (mode: ModelMode) => void }) {
  const options: { name: ModelMode; description: string; icon: ReactNode }[] = [
    { name: "خودکار", description: "بهترین حالت را بر اساس درخواست انتخاب می‌کند", icon: <Sparkles size={20} /> },
    { name: "سریع", description: "پاسخ کوتاه‌تر برای کارهای روزمره", icon: <Zap size={20} /> },
    { name: "عمیق", description: "تحلیل کامل‌تر برای تصمیم‌های مهم", icon: <BrainCircuit size={20} /> },
  ];
  return <BottomSheet open={sheet === "models"} onOpenChange={(open) => !open && onClose()} title="حالت پاسخ" description="چیدا مدل مناسب را پشت صحنه مدیریت می‌کند." snap={0.48}><div className="sheet-list" dir="rtl" data-testid="model-sheet">{options.map((option) => <SheetRow key={option.name} icon={option.icon} title={option.name} description={option.description} selected={mode === option.name} onClick={() => { onSelect(option.name); onClose(); }} />)}</div></BottomSheet>;
}

function AttachSheet({ sheet, onClose }: { sheet: SheetName; onClose: () => void }) {
  return <BottomSheet open={sheet === "attach"} onOpenChange={(open) => !open && onClose()} title="افزودن به گفتگو" snap={0.48}><div className="sheet-list" dir="rtl"><SheetRow icon={<Camera size={20} />} title="دوربین" description="از کارگاه یا مدرک عکس بگیر" onClick={onClose} /><SheetRow icon={<ImageIcon size={20} />} title="عکس و ویدیو" description="از گالری دستگاه انتخاب کن" onClick={onClose} /><SheetRow icon={<FileText size={20} />} title="فایل" description="نقشه، پیش‌فاکتور یا سند پروژه" onClick={onClose} /></div></BottomSheet>;
}

function ToolsSheet({ sheet, installedTool, onBuild, onClose }: { sheet: SheetName; installedTool: string; onBuild: () => void; onClose: () => void }) {
  return (
    <BottomSheet open={sheet === "tools"} onOpenChange={(open) => !open && onClose()} title="ابزارهای پروژه" description="ابزارهای فعال و عامل Build برای ساخت یک ابزار تازه." snap={0.64}>
      <div className="sheet-list" dir="rtl" data-testid="tools-sheet">
        <SheetRow icon={<Hammer size={20} />} title="Build" description="عامل ساخت ابزار و نصب پلاگین و اسکیل در پروژه" testId="build-tool-entry" onClick={onBuild} />
        {installedTool ? <SheetRow icon={<PackageCheck size={20} />} title={installedTool} description="پلاگین خصوصی نصب‌شده در پروژه" testId="installed-tool-row" onClick={onClose} /> : null}
        <SheetRow icon={<Search size={20} />} title="جست‌وجوی بازار" description="بررسی منابع و گزینه‌های قابل استناد" onClick={onClose} />
        <SheetRow icon={<FileText size={20} />} title="اسناد پروژه" description="نقشه‌ها، صورت‌جلسه‌ها و درخواست‌ها" onClick={onClose} />
        <SheetRow icon={<Wrench size={20} />} title="دستیار فنی" description="چک‌لیست و تحلیل تخصصی ساخت" onClick={onClose} />
      </div>
    </BottomSheet>
  );
}

function BuildSheet({ sheet, activeProject, onClose, onInstalled }: { sheet: SheetName; activeProject: string; onClose: () => void; onInstalled: (toolName: string) => void }) {
  const keyboard = useKeyboard();
  const [step, setStep] = useState<BuildStep>("define");
  const [name, setName] = useState("رهگیر جریان نقدی");
  const [description, setDescription] = useState("هزینه‌های ۳۰ روز آینده را جمع‌بندی و انحراف بودجه را هشدار بده");

  const startBuild = () => {
    if (!name.trim() || !description.trim()) return;
    keyboard.hide();
    setStep("preview");
  };

  const install = () => {
    const normalizedName = name.trim();
    onInstalled(normalizedName);
    setStep("installed");
  };

  return (
    <BottomSheet open={sheet === "build"} onOpenChange={(open) => !open && onClose()} title="Build · ساخت ابزار" description="چیدا نیازت را به یک پلاگین خصوصی با اسکیل مرتبط تبدیل می‌کند." snap={0.88}>
      <div className="build-flow" dir="rtl" data-testid="build-flow" data-step={step}>
        {step === "define" ? (
          <section className="build-step" data-testid="build-define-step">
            <div className="build-agent-intro"><span><Bot size={21} /></span><div><strong>عامل Build</strong><small>ابزار را از کاتالوگ امن رابط می‌سازد؛ نه با اجرای کد آزاد.</small></div></div>
            <label className="build-field"><span>نام ابزار</span><KeyboardInput value={name} onChange={(event) => setName(event.target.value)} data-testid="build-name-input" /></label>
            <label className="build-field"><span>این ابزار چه کاری انجام دهد؟</span><KeyboardTextarea value={description} onChange={(event) => setDescription(event.target.value)} data-testid="build-description-input" rows={4} /></label>
            <div className="build-scope"><Folder size={17} /><span><small>محل نصب</small><strong>{activeProject}</strong></span></div>
            <button className="primary-button" type="button" data-testid="build-start-button" disabled={!name.trim() || !description.trim()} onClick={startBuild}>ساخت پیش‌نمایش</button>
          </section>
        ) : null}

        {step === "preview" ? (
          <section className="build-step build-preview">
            <div className="build-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100} data-testid="build-progress"><span style={{ width: "100%" }} /></div>
            <div className="build-stages" aria-label="مراحل ساخت">
              <div data-testid="build-stage-spec" data-state="complete"><CheckCircle2 size={17} /><span><strong>تعریف ابزار</strong><small>هدف و داده‌ها مشخص شد</small></span></div>
              <div data-testid="build-stage-plugin" data-state="complete"><Puzzle size={17} /><span><strong>بستهٔ پلاگین</strong><small>نمای رهگیر و هشدار ساخته شد</small></span></div>
              <div data-testid="build-stage-skill" data-state="complete"><BrainCircuit size={17} /><span><strong>اسکیل مرتبط</strong><small>پایش جریان نقدی آماده شد</small></span></div>
            </div>
            <article className="build-preview-card">
              <div className="build-preview-title"><span><Hammer size={20} /></span><div><small>پیش‌نمایش پلاگین خصوصی</small><h3>{name}</h3></div></div>
              <p>{description}</p>
              <div className="build-chips"><span>جدول پروژه</span><span>هشدار انحراف</span><span>خلاصهٔ روزانه</span></div>
              <dl className="build-permissions">
                <div><dt>دادهٔ مجاز</dt><dd>بودجه و هزینه‌های پروژه</dd></div>
                <div><dt>اقدام مجاز</dt><dd>ثبت نمای ساخته‌شده در {activeProject}</dd></div>
                <div><dt>روش ساخت</dt><dd>اجزای تأییدشده؛ بدون اجرای کد آزاد</dd></div>
              </dl>
            </article>
            <button className="primary-button" type="button" data-testid="build-install-button" onClick={install}>نصب پلاگین و اسکیل</button>
            <p className="prototype-disclaimer">در این پروتوتایپ نصب فقط داخل همین مرورگر شبیه‌سازی می‌شود.</p>
          </section>
        ) : null}

        {step === "installed" ? (
          <section className="build-step build-success" data-testid="build-success">
            <span className="build-success-icon"><PackageCheck size={30} /></span>
            <div><span className="eyebrow">نصب آزمایشی کامل شد</span><h3>{name}</h3><p>ابزار به {activeProject} اضافه شد و از بخش ابزارها در دسترس است.</p></div>
            <div className="install-statuses">
              <span data-testid="plugin-install-status" data-state="installed"><Puzzle size={17} /> پلاگین نصب شد <Check size={16} /></span>
              <span data-testid="skill-install-status" data-state="installed"><BrainCircuit size={17} /> اسکیل فعال شد <Check size={16} /></span>
            </div>
            <button className="primary-button" type="button" data-testid="build-done-button" onClick={onClose}>دیدن ابزارهای پروژه</button>
          </section>
        ) : null}
      </div>
    </BottomSheet>
  );
}

function BriefSheet({ sheet, schedule, onClose, onSave }: { sheet: SheetName; schedule: BriefSchedule | null; onClose: () => void; onSave: (schedule: BriefSchedule) => void }) {
  const [frequency, setFrequency] = useState<BriefFrequency>(schedule?.frequency ?? "daily");
  const [weekday, setWeekday] = useState(schedule?.weekday ?? "شنبه");
  const [time, setTime] = useState(schedule?.time ?? "09:00");
  const [saved, setSaved] = useState(false);

  const save = () => {
    onSave({ frequency, weekday, time });
    setSaved(true);
  };

  return (
    <BottomSheet open={sheet === "brief"} onOpenChange={(open) => !open && onClose()} title="بریف پروژه" description="در زمان انتخابی، فقط موارد مهم و قابل اقدام پروژه را جمع‌بندی می‌کند." snap={0.84}>
      <div className="brief-panel" dir="rtl" data-testid="brief-panel">
        <div className="brief-preview">
          <div className="brief-preview-head"><span><CalendarDays size={20} /></span><div><small>بریف {activeBriefLabel(frequency)}</small><strong>امروزِ پروژه در یک نگاه</strong></div></div>
          <ul><li>تصمیم‌هایی که امروز لازم‌اند</li><li>کارهای عقب‌افتاده و نزدیک</li><li>خریدها و درخواست‌های باز</li><li>اسناد و ورودی‌های بلاتکلیف</li><li>تغییرات مهم از آخرین بازدید</li></ul>
        </div>

        <div className="brief-frequency" role="radiogroup" aria-label="بازهٔ بریف" data-testid="brief-frequency-group">
          <button type="button" role="radio" aria-checked={frequency === "daily"} data-testid="brief-frequency-daily" onClick={() => { setFrequency("daily"); setSaved(false); }}>روزانه</button>
          <button type="button" role="radio" aria-checked={frequency === "weekly"} data-testid="brief-frequency-weekly" onClick={() => { setFrequency("weekly"); setSaved(false); }}>هفتگی</button>
        </div>

        <div className="brief-fields">
          {frequency === "weekly" ? <label><span>روز دریافت</span><select value={weekday} onChange={(event) => { setWeekday(event.target.value); setSaved(false); }} data-testid="brief-weekday-select"><option>شنبه</option><option>یکشنبه</option><option>دوشنبه</option><option>سه‌شنبه</option><option>چهارشنبه</option><option>پنجشنبه</option></select></label> : null}
          <label><span>ساعت دریافت</span><span className="time-field"><Clock3 size={17} /><KeyboardInput type="text" dir="ltr" inputMode="numeric" maxLength={5} value={time} onChange={(event) => { setTime(event.target.value); setSaved(false); }} data-testid="brief-time-input" /></span></label>
        </div>

        <button className="primary-button" type="button" data-testid="brief-save-button" onClick={save}>ذخیرهٔ برنامهٔ بریف</button>
        {saved ? <p className="brief-saved" data-testid="brief-save-success"><CheckCircle2 size={17} /> بریف {frequency === "daily" ? `روزانه ساعت ${time}` : `هفتگی، ${weekday} ساعت ${time}`} ذخیره شد.</p> : null}
        <button className="text-button" type="button" data-testid="brief-back-button" onClick={onClose}>بازگشت به چت</button>
      </div>
    </BottomSheet>
  );
}

function activeBriefLabel(frequency: BriefFrequency) {
  return frequency === "daily" ? "روزانه" : "هفتگی";
}

function ProjectsSheet({ sheet, activeProject, onClose, onSelect }: { sheet: SheetName; activeProject: string; onClose: () => void; onSelect: (project: string) => void }) {
  return <BottomSheet open={sheet === "projects"} onOpenChange={(open) => !open && onClose()} title="انتخاب پروژه" description="همهٔ گفتگوها و ابزارها به پروژهٔ فعال متصل‌اند." snap={0.46}><div className="sheet-list" dir="rtl">{projectOptions.map((project) => <SheetRow key={project.name} icon={<Building2 size={20} />} title={project.name} description={project.meta} selected={activeProject === project.name} onClick={() => { onSelect(project.name); onClose(); }} />)}</div></BottomSheet>;
}

function SettingsSheet({ sheet, onClose }: { sheet: SheetName; onClose: () => void }) {
  return (
    <BottomSheet open={sheet === "settings"} onOpenChange={(open) => !open && onClose()} title="پروفایل و تنظیمات" description="مهیار کلباسی · حساب سازنده" snap={0.68}>
      <div className="settings-sheet" dir="rtl">
        <button className="setting-row" type="button"><SlidersHorizontal size={20} /><span><strong>تنظیمات چیدا</strong><small>ترجیحات پاسخ و اعلان‌ها</small></span><MoreHorizontal size={18} /></button>
        <button className="setting-row" type="button"><Bell size={20} /><span><strong>اعلان‌ها</strong><small>پیگیری پروژه و پیشنهادها</small></span><MoreHorizontal size={18} /></button>
        <button className="setting-row" type="button"><Palette size={20} /><span><strong>دسترسی‌پذیری</strong><small>اندازه متن و کنتراست</small></span><MoreHorizontal size={18} /></button>
        <button className="setting-row" type="button"><Volume2 size={20} /><span><strong>صدا و گفتار</strong><small>ورودی و خواندن پاسخ</small></span><MoreHorizontal size={18} /></button>
        <button className="setting-row" type="button"><CircleHelp size={20} /><span><strong>راهنما</strong><small>آشنایی با امکانات چیدا</small></span><MoreHorizontal size={18} /></button>
        <div className="role-lock-note"><ShieldCheck size={18} /><span>نقش این حساب «سازنده» است و قابل تغییر نیست.</span></div>
      </div>
    </BottomSheet>
  );
}
