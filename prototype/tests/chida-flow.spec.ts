import { expect, test, type Page, type Request } from "@playwright/test";

const expectedProjectStages = [
  "طراحی و اخذ مجوز",
  "تخریب و گودبرداری",
  "فونداسیون",
  "اسکلت بندی",
  "دیوارچینی و سفت کاری",
  "گچ و خاک و تاسیسات",
  "نازک کاری و نما",
  "ظریف کاری و نصبیات",
  "پایان کار",
];

const sampleProjectImage = {
  name: "نمای جنوبی کارگاه.png",
  mimeType: "image/png",
  buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=", "base64"),
};

function stableTestValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableTestValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([key, item]) => [key, stableTestValue(item)]));
  }
  return value;
}

function stableTestHash(serialized: string) {
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function refreshProposalRevisionFingerprint(proposal: Record<string, any>, revisionIndex = 0) {
  const revision = proposal.revisions[revisionIndex];
  const { fingerprint: _fingerprint, ...revisionWithoutFingerprint } = revision;
  revision.fingerprint = `fnv1a-${stableTestHash(JSON.stringify(stableTestValue({
    target: proposal.target,
    requestSnapshot: proposal.requestSnapshot,
    supplierSnapshot: proposal.supplierSnapshot,
    reference: proposal.reference,
    revision: revisionWithoutFingerprint,
  })))}`;
}

async function installBackwardBrowserClock(page: Page) {
  await page.evaluate(() => {
    const NativeDate = window.Date;
    const fixedTime = NativeDate.parse("2000-01-01T00:00:00.000Z");
    const BackwardDate = new Proxy(NativeDate, {
      construct(target, args) {
        return Reflect.construct(target, args.length ? args : [fixedTime]);
      },
    });
    Object.defineProperty(BackwardDate, "now", { value: () => fixedTime, configurable: true });
    Object.defineProperty(window, "Date", { value: BackwardDate, configurable: true });
  });
}

async function reachBuilderWelcome(page: Page) {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-chida-theme", "dark");
  await page.getByTestId("role-builder").click();
  await expect(page.getByTestId("invite-input")).toHaveValue("CHD-4K9P");
  await page.getByTestId("invite-submit").click();
  await expect(page.getByTestId("phone-input")).toHaveValue("09123456789");
  await page.getByTestId("phone-submit").click();
  await expect(page.getByTestId("otp-input")).toHaveValue("123456");
  await page.getByTestId("otp-submit").click();
  await expect(page.getByTestId("success-screen")).toBeVisible();
}

async function chooseProjectOption(page: Page, triggerTestId: string, option: string) {
  const trigger = page.getByTestId(triggerTestId);
  await trigger.click();
  const menu = page.getByTestId(`${triggerTestId}-menu`);
  await expect(menu).toBeVisible();
  const optionItem = page.getByTestId(`${triggerTestId}-option-${option}`);
  await optionItem.click();
  await expect(trigger).toContainText(option);
  await expect(menu).toBeHidden();
}

async function enterBuilderHome(page: Page) {
  await reachBuilderWelcome(page);
  const projectForm = page.getByTestId("project-setup-form");
  if (await projectForm.isVisible()) {
    await page.getByTestId("project-name-input").fill("برج نیلوفر");
    await page.getByTestId("project-location-input").fill("سعادت‌آباد");
    await chooseProjectOption(page, "project-stage-select", "اسکلت بندی");
    await page.getByTestId("project-create-button").click();
  } else {
    await page.getByTestId("enter-home").click();
  }
  await expect(page.getByTestId("builder-home")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-chida-theme", "dark");
  await expect(page.getByTestId("builder-home")).toHaveAttribute("data-mode", "fullscreen");
}

async function createReadyPurchaseRequestForApproval(page: Page) {
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-purchase-request").click();
  await page.getByTestId("purchase-request-raw-input").fill("پنج تن میلگرد آجدار برای ادامهٔ اسکلت لازم است");
  await page.getByTestId("purchase-request-item-input").fill("میلگرد آجدار");
  await page.getByTestId("purchase-request-quantity-input").fill("۵");
  await chooseProjectOption(page, "purchase-request-unit-select", "تن");
  await page.getByTestId("purchase-request-mode-advanced").click();
  await page.getByTestId("purchase-request-brand-input").fill("A3");
  await page.getByTestId("purchase-request-specification-input").fill("شاخه ۱۲ متری با پلاک تولید");
  await page.getByTestId("purchase-request-delivery-area-input").fill("سعادت‌آباد");
  await page.getByTestId("purchase-request-needed-by-input").fill("تا ۱۲ شهریور");
  await page.getByTestId("purchase-request-save").click();
  await page.getByTestId("purchase-request-ready").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("آمادهٔ بازبینی · نسخهٔ ۲");
}

async function openApprovedPurchaseRequestDispatch(page: Page) {
  await createReadyPurchaseRequestForApproval(page);
  await page.getByTestId("purchase-request-request-approval").click();
  await page.getByTestId("project-approval-approve").click();
  await page.getByTestId("project-approval-detail-back").click();
  await page.getByTestId("project-tasks-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await expect(page.getByTestId("purchase-request-open-dispatch")).toBeVisible();
  await page.getByTestId("purchase-request-open-dispatch").click();
  await expect(page.getByTestId("project-dispatch-planner-view")).toBeVisible();
}

async function addLocalSupplierContact(page: Page, contact: { name: string; category: string; coverage: string; capability?: "product" | "service" | "both" }) {
  await page.getByTestId("supplier-contact-add").click();
  await page.getByTestId("supplier-contact-name-input").fill(contact.name);
  await page.getByTestId("supplier-contact-category-input").fill(contact.category);
  await page.getByTestId("supplier-contact-coverage-input").fill(contact.coverage);
  await page.getByTestId(`supplier-contact-capability-${contact.capability ?? "both"}`).click();
  await page.getByTestId("supplier-contact-save").click();
  await expect(page.getByTestId("supplier-contact-editor-sheet")).toBeHidden();
}

async function reopenFirstPurchaseRequestDispatch(page: Page) {
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await page.getByTestId("purchase-request-open-dispatch").click();
  await expect(page.getByTestId("project-dispatch-planner-view")).toBeVisible();
}

async function createCurrentProductDispatchDraft(page: Page, contactNames: string[] = ["فولاد برنامه ارسال"]) {
  await openApprovedPurchaseRequestDispatch(page);
  for (const [index, contactName] of contactNames.entries()) {
    await addLocalSupplierContact(page, {
      name: contactName,
      category: "میلگرد",
      coverage: `منطقه ${index + 2} تهران`,
      capability: "product",
    });
  }
  await page.getByTestId("dispatch-draft-save").click();
  await expect(page.getByTestId("dispatch-draft-preview")).toBeVisible();
}

async function approveCurrentRequestAndOpenDispatch(page: Page) {
  await page.getByTestId("purchase-request-request-approval").click();
  await page.getByTestId("project-approval-approve").click();
  await page.getByTestId("project-approval-detail-back").click();
  await page.getByTestId("project-tasks-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").first().click();
  await page.getByTestId("purchase-request-open-dispatch").click();
  await expect(page.getByTestId("project-dispatch-planner-view")).toBeVisible();
}

async function returnFromDispatchToHome(page: Page) {
  await page.getByTestId("dispatch-planner-back").click();
  await page.getByTestId("purchase-request-detail-back").click();
  await page.getByTestId("purchase-requests-back").click();
  await expect(page.getByTestId("builder-home")).toBeVisible();
}

async function createTwoItemProductProposalPrerequisites(page: Page, contactName = "فولاد پیشنهاد دستی") {
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-purchase-request").click();
  await page.getByTestId("purchase-request-raw-input").fill("برای ادامهٔ کار، سیمان و بلوک سبک قیمت‌گیری شده است");
  await page.getByTestId("purchase-request-item-input").fill("سیمان تیپ ۲");
  await page.getByTestId("purchase-request-quantity-input").fill("۵");
  await chooseProjectOption(page, "purchase-request-unit-select", "تن");
  await page.getByTestId("purchase-request-add-item").click();
  await page.getByTestId("purchase-request-item-input-1").fill("بلوک سبک");
  await page.getByTestId("purchase-request-quantity-input-1").fill("۱۲۰۰");
  await chooseProjectOption(page, "purchase-request-unit-select-1", "عدد");
  await page.getByTestId("purchase-request-delivery-area-input").fill("سعادت‌آباد");
  await page.getByTestId("purchase-request-save").click();
  await page.getByTestId("purchase-request-ready").click();
  await approveCurrentRequestAndOpenDispatch(page);
  await addLocalSupplierContact(page, { name: contactName, category: "مصالح سفت‌کاری", coverage: "غرب تهران", capability: "product" });
  await returnFromDispatchToHome(page);
}

async function createServiceProposalPrerequisites(page: Page, contactName = "مجری پیشنهاد دستی") {
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-purchase-request").click();
  await page.getByTestId("purchase-request-kind-service").click();
  await page.getByTestId("purchase-request-raw-input").fill("برای اجرای عایق بام شرایط یک مجری ثبت شده است");
  await page.getByTestId("purchase-request-service-scope-input").fill("آماده‌سازی و اجرای عایق دولایهٔ بام");
  await page.getByTestId("purchase-request-service-location-input").fill("بام پروژه");
  await page.getByTestId("purchase-request-service-size-input").fill("۸۵۰ مترمربع");
  await page.getByTestId("purchase-request-save").click();
  await page.getByTestId("purchase-request-ready").click();
  await approveCurrentRequestAndOpenDispatch(page);
  await addLocalSupplierContact(page, { name: contactName, category: "عایق‌کاری", coverage: "تمام تهران", capability: "service" });
  await returnFromDispatchToHome(page);
}

const serviceComparisonCriterionIds = [
  "scope",
  "location",
  "size-or-volume",
  "qualification",
  "timing",
  "method",
  "in-scope",
  "out-of-scope",
  "warranty",
  "payment-terms",
] as const;

type ServiceComparisonCriterionId = typeof serviceComparisonCriterionIds[number];
type ServiceComparisonAssessment = "aligned" | "partial" | "different" | "unknown" | "not-applicable";
type ServiceComparisonAssessmentFixture = { assessment: ServiceComparisonAssessment; declaredValue: string; rationale: string };

const firstServiceComparisonAssessments: Record<ServiceComparisonCriterionId, ServiceComparisonAssessmentFixture> = {
  scope: { assessment: "aligned", declaredValue: "آماده سازی و اجرای کامل عایق دولایه", rationale: "دامنه اعلامی همه اجزای نیاز را پوشش می دهد" },
  location: { assessment: "aligned", declaredValue: "بام پروژه در سعادت آباد", rationale: "موقعیت اعلامی با محدوده درخواست یکسان است" },
  "size-or-volume": { assessment: "partial", declaredValue: "پوشش قطعی ۸۰۰ مترمربع", rationale: "پنجاه مترمربع نیازمند روشن سازی است" },
  qualification: { assessment: "aligned", declaredValue: "گواهی صلاحیت عایق کاری پایه دو", rationale: "صلاحیت اعلامی با نیاز ثبت شده هم راستاست" },
  timing: { assessment: "partial", declaredValue: "شروع تا ده روز آینده و اجرای دوازده روزه", rationale: "شروع دیرتر از بازه درخواستی اعلام شده است" },
  method: { assessment: "different", declaredValue: "اجرای سرد با پرایمر", rationale: "روش اعلامی با روش گرمایی درخواستی متفاوت است" },
  "in-scope": { assessment: "aligned", declaredValue: "زیرسازی اجرا و آزمون آب بندی", rationale: "هر سه جزء داخل دامنه اعلام شده اند" },
  "out-of-scope": { assessment: "different", declaredValue: "جمع آوری نخاله خارج از کار", rationale: "درخواست جمع آوری نخاله را داخل تعهد می خواهد" },
  warranty: { assessment: "aligned", declaredValue: "ضمانت کتبی هجده ماهه", rationale: "مدت ضمانت از حداقل نیاز بیشتر است" },
  "payment-terms": { assessment: "aligned", declaredValue: "سی درصد پیش پرداخت و مانده پس از تحویل", rationale: "شرایط پرداخت با درخواست ثبت شده هم راستاست" },
};

const secondServiceComparisonAssessments: Record<ServiceComparisonCriterionId, ServiceComparisonAssessmentFixture> = {
  scope: { assessment: "partial", declaredValue: "اجرای عایق بدون ترمیم زیرسازی", rationale: "بخش ترمیم زیرسازی پوشش داده نشده است" },
  location: { assessment: "different", declaredValue: "فقط پروژه های شرق تهران", rationale: "محدوده اعلامی با محل پروژه متفاوت است" },
  "size-or-volume": { assessment: "aligned", declaredValue: "پوشش کامل ۸۵۰ مترمربع", rationale: "حجم اعلامی دقیقاً با نیاز برابر است" },
  qualification: { assessment: "partial", declaredValue: "رزومه سه پروژه مشابه بدون گواهی پایه دو", rationale: "سابقه اعلام شده اما گواهی خواسته شده روشن نیست" },
  timing: { assessment: "aligned", declaredValue: "شروع ظرف پنج روز و اجرای هفت روزه", rationale: "بازه اعلامی داخل زمان مورد نیاز است" },
  method: { assessment: "aligned", declaredValue: "اجرای گرمایی طبق دستورالعمل کارخانه", rationale: "روش اعلامی با نیاز ثبت شده یکسان است" },
  "in-scope": { assessment: "different", declaredValue: "فقط اجرا و آزمون آب بندی", rationale: "زیرسازی از دامنه اعلامی حذف شده است" },
  "out-of-scope": { assessment: "partial", declaredValue: "حمل نخاله تا پای کار", rationale: "انتقال نخاله تا بیرون پروژه روشن نشده است" },
  warranty: { assessment: "different", declaredValue: "ضمانت شش ماهه", rationale: "مدت اعلامی از حداقل دوازده ماه کمتر است" },
  "payment-terms": { assessment: "aligned", declaredValue: "بیست درصد پیش پرداخت و مانده مرحله ای", rationale: "پرداخت مرحله ای با نیاز ثبت شده سازگار است" },
};

async function createTwoCurrentServiceProposalsForComparison(page: Page) {
  const firstSupplier = "مجری مقایسه خدمت الف";
  const secondSupplier = "مجری مقایسه خدمت ب";
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-purchase-request").click();
  await page.getByTestId("purchase-request-kind-service").click();
  await page.getByTestId("purchase-request-raw-input").fill("برای عایق کاری بام دو پیشنهاد خدمت بیرون از چیدا دریافت شده است");
  await page.getByTestId("purchase-request-service-scope-input").fill("آماده سازی و اجرای عایق دولایه بام");
  await page.getByTestId("purchase-request-service-location-input").fill("بام پروژه در سعادت آباد");
  await page.getByTestId("purchase-request-service-size-input").fill("۸۵۰ مترمربع");
  await page.getByTestId("purchase-request-service-timing-input").fill("شروع حداکثر تا هفت روز آینده");
  await page.getByTestId("purchase-request-mode-advanced").click();
  await page.getByTestId("purchase-request-service-qualification-input").fill("گواهی صلاحیت عایق کاری پایه دو");
  await page.getByTestId("purchase-request-service-method-input").fill("اجرای گرمایی طبق دستورالعمل کارخانه");
  await page.getByTestId("purchase-request-service-in-scope-input").fill("زیرسازی اجرا و آزمون آب بندی");
  await page.getByTestId("purchase-request-service-out-scope-input").fill("هیچ بخش اجرایی خارج از دامنه نیست");
  await page.getByTestId("purchase-request-service-warranty-input").fill("حداقل ضمانت کتبی دوازده ماهه");
  await page.getByTestId("purchase-request-service-payment-input").fill("حداکثر سی درصد پیش پرداخت و مانده مرحله ای");
  await page.getByTestId("purchase-request-save").click();
  await page.getByTestId("purchase-request-ready").click();
  await approveCurrentRequestAndOpenDispatch(page);
  await addLocalSupplierContact(page, { name: firstSupplier, category: "عایق کاری", coverage: "غرب تهران", capability: "service" });
  await addLocalSupplierContact(page, { name: secondSupplier, category: "عایق کاری", coverage: "تمام تهران", capability: "service" });
  await page.getByTestId("dispatch-draft-save").click();
  await expect(page.getByTestId("dispatch-draft-preview")).toBeVisible();
  await returnFromDispatchToHome(page);
  await page.getByTestId("quick-action-compare-offers").click();

  const recordProposal = async (supplierName: string, values: { totalPrice: string; leadTime: string; paymentTerms: string; validity: string; transcript: string }) => {
    await page.getByTestId("proposal-add").click();
    await page.getByTestId("proposal-supplier-select").selectOption({ label: `${supplierName} · خدمت` });
    await page.getByTestId("proposal-transcript").fill(values.transcript);
    await page.getByTestId("proposal-line-status-0").selectOption("quoted");
    await page.getByTestId("proposal-line-total-price-0").fill(values.totalPrice);
    await page.getByTestId("proposal-line-editor").locator("summary").click();
    await page.getByTestId("proposal-line-leadTime-0").fill(values.leadTime);
    await page.getByTestId("proposal-line-paymentTerms-0").fill(values.paymentTerms);
    await page.getByTestId("proposal-line-validity-0").fill(values.validity);
    await page.getByTestId("proposal-save").click();
    await expect(page.getByTestId("proposal-detail")).toBeVisible();
    await page.getByTestId("proposal-detail-back").click();
  };

  await recordProposal(firstSupplier, {
    totalPrice: "120000000",
    leadTime: "۱۲ روز کاری",
    paymentTerms: "۳۰ درصد پیش پرداخت و مانده پس از تحویل",
    validity: "۷ روز",
    transcript: "مجری الف مبلغ و شرایط خام خدمت را اعلام کرد.",
  });
  await recordProposal(secondSupplier, {
    totalPrice: "108000000",
    leadTime: "۷ روز کاری",
    paymentTerms: "۲۰ درصد پیش پرداخت و مانده مرحله ای",
    validity: "۵ روز",
    transcript: "مجری ب مبلغ و شرایط خام خدمت را اعلام کرد.",
  });
  await expect(page.getByTestId("proposal-card")).toHaveCount(2);
  const proposals = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]"));
  return {
    firstSupplier,
    secondSupplier,
    firstProposal: proposals.find((proposal: { supplierSnapshot: { displayName: string } }) => proposal.supplierSnapshot.displayName === firstSupplier),
    secondProposal: proposals.find((proposal: { supplierSnapshot: { displayName: string } }) => proposal.supplierSnapshot.displayName === secondSupplier),
  };
}

function serviceComparisonAssessmentEditor(page: Page, criterionId: ServiceComparisonCriterionId, supplierName: string) {
  return page.locator(`[data-testid="service-comparison-criterion-editor"][data-criterion="${criterionId}"]`)
    .getByTestId("service-comparison-proposal-assessment")
    .filter({ hasText: supplierName });
}

async function fillServiceComparisonAssessment(page: Page, criterionId: ServiceComparisonCriterionId, supplierName: string, fixture: ServiceComparisonAssessmentFixture) {
  const editor = serviceComparisonAssessmentEditor(page, criterionId, supplierName);
  await editor.getByTestId("service-comparison-assessment-status").selectOption(fixture.assessment);
  if (fixture.assessment !== "not-applicable") await editor.getByTestId("service-comparison-declared-value").fill(fixture.declaredValue);
  await editor.getByTestId("service-comparison-assessment-rationale").fill(fixture.rationale);
}

async function fillCompleteServiceComparisonMatrix(page: Page, firstSupplier: string, secondSupplier: string) {
  for (const criterionId of serviceComparisonCriterionIds) {
    await fillServiceComparisonAssessment(page, criterionId, firstSupplier, firstServiceComparisonAssessments[criterionId]);
    await fillServiceComparisonAssessment(page, criterionId, secondSupplier, secondServiceComparisonAssessments[criterionId]);
  }
}

async function createCompleteServiceComparisonWithDecision(page: Page) {
  const prerequisites = await createTwoCurrentServiceProposalsForComparison(page);
  await page.getByTestId("service-proposal-comparisons-entry").click();
  await page.getByTestId("service-comparison-add").click();
  await fillCompleteServiceComparisonMatrix(page, prerequisites.firstSupplier, prerequisites.secondSupplier);
  await page.getByTestId("service-comparison-save").click();
  await expect(page.getByTestId("service-comparison-detail")).toBeVisible();
  await page.getByTestId("service-comparison-decision-outcome").selectOption("preferred-for-follow-up");
  await page.getByTestId("service-comparison-decision-proposal").selectOption(prerequisites.secondProposal.id);
  await page.getByTestId("service-comparison-decision-reason").fill("نسخه نخست تصمیم برای ادامه بررسی مجری ب");
  await page.getByTestId("service-comparison-decision-save").click();
  await expect(page.getByTestId("service-comparison-decision-history")).toBeVisible();
  return prerequisites;
}

async function createTwoCurrentProductProposalsForComparison(page: Page, overrides: { firstTotalPrice?: string } = {}) {
  const firstSupplier = "فولاد مقایسه الف";
  const secondSupplier = "فولاد مقایسه ب";
  await openApprovedPurchaseRequestDispatch(page);
  await addLocalSupplierContact(page, { name: firstSupplier, category: "میلگرد", coverage: "غرب تهران", capability: "product" });
  await addLocalSupplierContact(page, { name: secondSupplier, category: "میلگرد", coverage: "مرکز تهران", capability: "product" });
  await returnFromDispatchToHome(page);
  await page.getByTestId("quick-action-compare-offers").click();

  const recordProposal = async (supplierName: string, values: { quantity: string; unit: string; unitPrice: string; totalPrice: string; transcript: string }) => {
    await page.getByTestId("proposal-add").click();
    await page.getByTestId("proposal-supplier-select").selectOption({ label: `${supplierName} · محصول` });
    await page.getByTestId("proposal-transcript").fill(values.transcript);
    await page.getByTestId("proposal-line-status-0").selectOption("quoted");
    await page.getByTestId("proposal-line-quantity-0").fill(values.quantity);
    await page.getByTestId("proposal-line-unit-0").fill(values.unit);
    await page.getByTestId("proposal-line-unit-price-0").fill(values.unitPrice);
    await page.getByTestId("proposal-line-total-price-0").fill(values.totalPrice);
    await page.getByTestId("proposal-save").click();
    await expect(page.getByTestId("proposal-detail")).toBeVisible();
    await page.getByTestId("proposal-detail-back").click();
  };

  await recordProposal(firstSupplier, {
    quantity: "۵",
    unit: "تن",
    unitPrice: "4300000",
    totalPrice: overrides.firstTotalPrice ?? "21500000",
    transcript: "پنج تن میلگرد با قیمت کل بیست و یک میلیون و پانصد هزار تومان اعلام شد.",
  });
  await recordProposal(secondSupplier, {
    quantity: "۵۰۰۰",
    unit: "کیلوگرم",
    unitPrice: "4200",
    totalPrice: "21000000",
    transcript: "پنج هزار کیلوگرم میلگرد با قیمت واحد چهار هزار و دویست تومان اعلام شد.",
  });
  await expect(page.getByTestId("proposal-card")).toHaveCount(2);
  return { firstSupplier, secondSupplier };
}

function comparisonSupplierEditor(page: Page, supplierName: string) {
  return page.getByTestId("comparison-supplier-editor").filter({ hasText: supplierName });
}

async function createExactProductComparisonWithDecision(page: Page) {
  const { firstSupplier, secondSupplier } = await createTwoCurrentProductProposalsForComparison(page);
  const proposals = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]"));
  const firstProposal = proposals.find((proposal: { supplierSnapshot: { displayName: string } }) => proposal.supplierSnapshot.displayName === firstSupplier);
  const secondProposal = proposals.find((proposal: { supplierSnapshot: { displayName: string } }) => proposal.supplierSnapshot.displayName === secondSupplier);
  await page.getByTestId("proposal-comparisons-entry").click();
  await page.getByTestId("comparison-add").click();

  const firstEditor = comparisonSupplierEditor(page, firstSupplier);
  await firstEditor.getByTestId(/^comparison-tax-mode-/).selectOption("rate");
  await firstEditor.getByTestId(/^comparison-tax-value-/).fill("۹");
  await firstEditor.getByTestId(/^comparison-tax-assumption-/).fill("مالیات ۹ درصد جدا از مبلغ اعلامی");
  await firstEditor.getByTestId(/^comparison-transport-mode-/).selectOption("fixed");
  await firstEditor.getByTestId(/^comparison-transport-value-/).fill("۱۰۰۰۰۰۰");
  await firstEditor.getByTestId(/^comparison-transport-assumption-/).fill("حمل ثابت تا پروژه");

  const secondEditor = comparisonSupplierEditor(page, secondSupplier);
  await secondEditor.getByTestId(/^comparison-basis-/).selectOption("unit-price-times-adjusted-quantity");
  await secondEditor.getByTestId(/^comparison-adjusted-quantity-/).fill("۵۰۰۰");
  await expect(secondEditor.getByTestId(/^comparison-adjusted-unit-/)).toHaveValue("کیلوگرم");
  await secondEditor.getByTestId(/^comparison-assumption-/).fill("۵۰۰۰ کیلوگرم برابر مقدار پنج تن درخواست است");
  await secondEditor.getByTestId(/^comparison-tax-mode-/).selectOption("included");
  await secondEditor.getByTestId(/^comparison-tax-assumption-/).fill("مالیات داخل مبلغ اعلامی است");
  await secondEditor.getByTestId(/^comparison-transport-mode-/).selectOption("fixed");
  await secondEditor.getByTestId(/^comparison-transport-value-/).fill("۲۰۰۰۰۰۰");
  await secondEditor.getByTestId(/^comparison-transport-assumption-/).fill("حمل ثابت تا پروژه");
  await page.getByTestId("comparison-save").click();
  await expect(page.getByTestId("comparison-detail")).toBeVisible();

  await page.getByTestId("comparison-decision-outcome").selectOption("preferred-for-follow-up");
  await page.getByTestId("comparison-decision-proposal").selectOption(secondProposal.id);
  await page.getByTestId("comparison-decision-reason").fill("نسخهٔ نخست تصمیم برای ادامهٔ بررسی پیشنهاد ب");
  await page.getByTestId("comparison-decision-save").click();
  await expect(page.getByTestId("comparison-decision-history")).toBeVisible();
  return { firstSupplier, secondSupplier, firstProposal, secondProposal };
}

async function openSavedProjectMemory(page: Page) {
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-memory-entry").click();
  await expect(page.getByTestId("project-memory-view")).toBeVisible();
}

test("the prototype renders as a full-screen responsive app without preview chrome", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByTestId("device-picker")).toBeHidden();
  await expect(page.locator(".phone-bezel")).toBeHidden();
  await expect(page.getByTestId("mobile-cursor")).toBeHidden();
  await expect(page.getByTestId("keyboard-dock")).toBeHidden();

  const viewport = await page.getByTestId("mobile-app-viewport").boundingBox();
  const screen = await page.getByTestId("device-screen").boundingBox();
  if (!viewport || !screen) throw new Error("Full-screen app bounds are unavailable");

  expect(screen.x).toBeCloseTo(0, 0);
  expect(screen.y).toBeCloseTo(0, 0);
  expect(screen.width).toBeCloseTo(390, 0);
  expect(screen.height).toBeCloseTo(844, 0);
  expect(viewport.width).toBeCloseTo(390, 0);
  expect(viewport.height).toBeCloseTo(844, 0);
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await page.setViewportSize({ width: 1100, height: 820 });
  await expect(page.locator(".auth-page")).toHaveCSS("background-color", "rgb(18, 17, 16)");
  await expect(page.locator("html")).toHaveCSS("background-color", "rgb(18, 17, 16)");
});

test("supplier stays unavailable while builder flow is prefilled and complete", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.getByTestId("auth-flow")).toHaveAttribute("dir", "rtl");
  await expect(page.getByTestId("theme-toggle")).toHaveCount(0);

  await page.getByTestId("role-supplier").click();
  await expect(page.getByTestId("supplier-unavailable-sheet")).toBeVisible();
  await expect(page.getByTestId("screen-role")).toBeVisible();
  await page.getByRole("button", { name: "متوجه شدم" }).click();

  await enterBuilderHome(page);
  await expect(page.getByTestId("project-switcher")).toContainText("برج نیلوفر");
  await expect(page.getByTestId("project-context")).toContainText("فضای پروژه");
  await expect(page.getByTestId("project-context")).toContainText("برج نیلوفر");
});

test("builder creates the first project and keeps it as the active context", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await reachBuilderWelcome(page);

  await expect(page.getByTestId("project-setup-form")).toBeVisible();
  await expect(page.getByTestId("project-setup-form")).toContainText("فعلاً فقط پروژه‌های تهران فعال‌اند");
  await page.getByTestId("project-create-button").click();
  await expect(page.getByTestId("project-name-error")).toContainText("نام پروژه");
  await expect(page.getByTestId("project-location-error")).toContainText("محدودهٔ پروژه");
  await expect(page.getByTestId("project-stage-error")).toContainText("مرحلهٔ ساخت");
  await expect(page.getByTestId("builder-home")).toHaveCount(0);

  await page.getByTestId("project-name-input").fill("برج نیلوفر");
  await page.getByTestId("project-location-input").fill("تهران");
  await page.getByTestId("project-create-button").click();
  await expect(page.getByTestId("project-name-input")).toHaveValue("برج نیلوفر");
  await expect(page.getByTestId("project-location-error")).toContainText("محله یا منطقه");

  await page.getByTestId("project-location-input").fill("سعادت‌آباد");
  await expect(page.locator('select[data-testid="project-stage-select"]')).toHaveCount(0);

  const authScroller = page.locator(".auth-page .mobile-scroll");
  await authScroller.evaluate((element) => { element.scrollTop = 0; });
  const stageTrigger = page.getByTestId("project-stage-select");
  const stageTriggerBox = await stageTrigger.boundingBox();
  if (!stageTriggerBox) throw new Error("Project stage trigger geometry is unavailable");
  const dragX = stageTriggerBox.x + stageTriggerBox.width / 2;
  const dragY = stageTriggerBox.y + stageTriggerBox.height / 2;
  await page.mouse.move(dragX, dragY);
  await page.mouse.down();
  await page.mouse.move(dragX, dragY - 90, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => authScroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(8);
  await expect(page.getByTestId("project-stage-select-menu")).toHaveCount(0);

  await authScroller.evaluate((element) => { element.scrollTop = 0; });
  await stageTrigger.click();
  const stageOptions = page.locator('[data-testid^="project-stage-select-option-"]');
  await expect(stageOptions).toHaveCount(expectedProjectStages.length);
  expect(await stageOptions.allTextContents()).toEqual(expectedProjectStages);
  expect(await stageOptions.evaluateAll((options) => options.map((option) => {
    const label = option.querySelector("span:first-child");
    return label ? label.scrollWidth > label.clientWidth + 1 : true;
  }))).not.toContain(true);
  await page.getByTestId("project-stage-select-option-پایان کار").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("project-stage-select-option-پایان کار")).toBeVisible();
  await page.getByTestId("project-stage-select-option-اسکلت بندی").click();
  await page.getByTestId("project-create-button").click();

  await expect(page.getByTestId("builder-home")).toBeVisible();
  await expect(page.getByTestId("project-switcher")).toContainText("برج نیلوفر");
  await expect(page.getByTestId("project-context")).toContainText("برج نیلوفر");
  await expect(page.getByTestId("composer-input")).toHaveAttribute("placeholder", "پیامت برای برج نیلوفر...");

  await page.getByTestId("project-switcher").click();
  await expect(page.getByTestId("projects-sheet")).toContainText("برج نیلوفر");
  await expect(page.getByTestId("projects-sheet")).toContainText("تهران · سعادت‌آباد · اسکلت بندی");
  await expect(page.getByTestId("projects-sheet")).not.toContainText("خانه جردن");
  await page.getByRole("button", { name: /برج نیلوفر تهران/ }).click();

  await page.reload();
  await reachBuilderWelcome(page);
  await expect(page.getByTestId("saved-project-summary")).toContainText("برج نیلوفر");
  await expect(page.getByTestId("saved-project-summary")).toContainText("تهران · سعادت‌آباد · اسکلت بندی");
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("project-switcher")).toContainText("برج نیلوفر");
});

test("builder starts one new-project flow only from the Projects collection", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);

  await page.getByTestId("composer-input").fill("پیام پروژهٔ نخست");
  await page.getByTestId("send-button").click();
  await expect(page.getByText("پیام پروژهٔ نخست", { exact: true })).toBeVisible();
  await page.getByTestId("composer-input").fill("پیش‌نویس پروژهٔ نخست");

  await expect(page.getByTestId("header-add-project")).toHaveCount(0);
  await expect(page.getByTestId("bottom-add-project")).toHaveCount(0);
  await page.getByTestId("menu-button").click();
  await expect(page.getByTestId("drawer-add-project")).toHaveCount(0);
  await page.getByTestId("drawer-projects-entry").click();
  await expect(page.getByTestId("projects-sheet")).toBeVisible();
  await page.getByTestId("projects-sheet-add").click();
  await expect(page.getByTestId("new-project-sheet")).toBeVisible();
  await page.getByTestId("new-project-name-input").fill("پروژه آفتاب");
  await page.getByTestId("new-project-location-input").fill("منطقهٔ ۵");
  await chooseProjectOption(page, "new-project-stage-select", "فونداسیون");
  await page.getByTestId("new-project-save").click();

  await expect(page.getByTestId("new-project-sheet")).toBeHidden();
  await expect(page.getByTestId("project-switcher")).toContainText("پروژه آفتاب");
  await expect(page.getByTestId("project-context")).toContainText("پروژه آفتاب");
  await expect(page.getByTestId("composer-input")).toHaveAttribute("placeholder", "پیامت برای پروژه آفتاب...");
  await expect(page.getByTestId("composer-input")).toHaveValue("");
  await expect(page.getByText("پیام پروژهٔ نخست", { exact: true })).toHaveCount(0);
  const projects = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]"));
  expect(projects).toHaveLength(2);
  expect(projects[1]).toMatchObject({ name: "پروژه آفتاب", location: "منطقهٔ ۵", stage: "فونداسیون" });
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"))).toBe(projects[1].id);

  await page.getByTestId("project-switcher").click();
  await page.getByTestId("projects-sheet").getByRole("button", { name: /برج نیلوفر/ }).click();
  await page.getByTestId("project-space-continue").click();
  await expect(page.getByTestId("composer-input")).toHaveValue("پیش‌نویس پروژهٔ نخست");
  await expect(page.getByText("پیام پروژهٔ نخست", { exact: true })).toBeVisible();
});

test("the bottom project dock contains a 100-character unbroken project name at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const longProjectName = "پ".repeat(100);

  await page.getByTestId("project-switcher").click();
  await page.getByTestId("projects-sheet-add").click();
  await page.getByTestId("new-project-name-input").fill(longProjectName);
  await page.getByTestId("new-project-location-input").fill("منطقهٔ ۳");
  await chooseProjectOption(page, "new-project-stage-select", "دیوارچینی و سفت کاری");
  await page.getByTestId("new-project-save").click();

  await expect(page.getByTestId("open-project-space")).toContainText(longProjectName);
  expect(await page.getByTestId("open-project-space").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});

test("new-project creation stays on the current project when local persistence fails", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const originalActiveProject = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    const originalActiveProject = window.localStorage.getItem("chida-prototype-active-project");
    Object.defineProperty(window, "__projectNativeSetItem", { value: nativeSetItem, configurable: true });
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-builder-projects:v2") throw new DOMException("Project write failed", "QuotaExceededError");
      if (this === window.localStorage && key === "chida-prototype-active-project" && value === originalActiveProject && window.localStorage.getItem(key) !== originalActiveProject) throw new DOMException("Project rollback failed", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });

  await page.getByTestId("project-switcher").click();
  await page.getByTestId("projects-sheet-add").click();
  await page.getByTestId("new-project-name-input").fill("پروژه ذخیره‌نشده");
  await page.getByTestId("new-project-location-input").fill("منطقهٔ ۷");
  await chooseProjectOption(page, "new-project-stage-select", "طراحی و اخذ مجوز");
  await page.getByTestId("new-project-save").click();

  await expect(page.getByTestId("new-project-storage-error")).toContainText("ذخیره نشد");
  await expect(page.getByTestId("new-project-sheet")).toBeVisible();
  await expect(page.getByTestId("project-switcher")).toContainText("برج نیلوفر");
  expect(await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]"))).toHaveLength(1);

  await page.evaluate(() => {
    Storage.prototype.setItem = (window as Window & { __projectNativeSetItem: typeof Storage.prototype.setItem }).__projectNativeSetItem;
  });
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("project-switcher")).toContainText("برج نیلوفر");
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"))).toBe(originalActiveProject);
});

test("a saved Tehran-only project is completed in place instead of duplicated", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.removeItem("chida-prototype-builder-projects:v2");
    window.localStorage.setItem("chida-prototype-builder-projects", JSON.stringify([{
      id: "project-legacy",
      name: "برج قدیمی",
      location: "تهران",
      stage: "اسکلت",
      createdAt: "2026-08-27T00:00:00.000Z",
    }]));
    window.localStorage.setItem("chida-prototype-active-project", "project-legacy");
  });

  await reachBuilderWelcome(page);
  await expect(page.getByTestId("project-setup-form")).toBeVisible();
  await expect(page.getByTestId("project-name-input")).toHaveValue("برج قدیمی");
  await expect(page.getByTestId("project-location-input")).toHaveValue("");
  await expect(page.getByTestId("project-stage-select")).toContainText("اسکلت بندی");
  await page.getByTestId("project-location-input").fill("منطقهٔ ۶");
  await page.getByTestId("project-create-button").click();

  const savedProjects = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]"));
  expect(savedProjects).toHaveLength(1);
  expect(savedProjects[0]).toMatchObject({ id: "project-legacy", name: "برج قدیمی", location: "منطقهٔ ۶", stage: "اسکلت بندی" });
  await expect(page.getByTestId("builder-home")).toBeVisible();
});

test("stored legacy construction stages migrate to the approved taxonomy", async ({ page }) => {
  const legacyStages = ["طراحی و مجوز", "گودبرداری", "اسکلت", "سفت‌کاری", "نازک‌کاری", "تکمیل و تحویل"];
  const migratedStages = [
    "طراحی و اخذ مجوز",
    "تخریب و گودبرداری",
    "اسکلت بندی",
    "دیوارچینی و سفت کاری",
    "نازک کاری و نما",
    "پایان کار",
  ];

  await page.goto("/");
  await page.evaluate((stages) => {
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify(stages.map((stage, index) => ({
      id: `legacy-stage-${index}`,
      name: `پروژه ${index + 1}`,
      location: "ونک",
      stage,
      createdAt: "2026-08-27T00:00:00.000Z",
    }))));
    window.localStorage.setItem("chida-prototype-active-project", "legacy-stage-0");
  }, legacyStages);

  await reachBuilderWelcome(page);
  await expect(page.getByTestId("saved-project-summary")).toContainText("طراحی و اخذ مجوز");
  await expect.poll(() => page.evaluate(() => {
    const projects = JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]");
    return projects.map((project: { stage: string }) => project.stage);
  })).toEqual(migratedStages);
});

test("an unreadable v2 project store falls back to the valid legacy projects", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("chida-prototype-builder-projects:v2", "{");
    window.localStorage.setItem("chida-prototype-builder-projects", JSON.stringify([{
      id: "project-legacy-fallback",
      name: "برج بازیابی‌شده",
      location: "یوسف‌آباد",
      stage: "سفت‌کاری",
      createdAt: "2026-08-27T00:00:00.000Z",
    }]));
    window.localStorage.setItem("chida-prototype-active-project", "project-legacy-fallback");
  });

  await reachBuilderWelcome(page);
  await expect(page.getByTestId("saved-project-summary")).toContainText("برج بازیابی‌شده");
  await expect(page.getByTestId("saved-project-summary")).toContainText("تهران · یوسف‌آباد · دیوارچینی و سفت کاری");

  const migratedProjects = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]"));
  expect(migratedProjects).toHaveLength(1);
  expect(migratedProjects[0]).toMatchObject({
    id: "project-legacy-fallback",
    name: "برج بازیابی‌شده",
    stage: "دیوارچینی و سفت کاری",
    usage: "",
    landArea: "",
    unitCount: "",
  });
});

test("a schema-invalid non-empty v2 store also falls back without resurrecting an intentional empty store", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify([{ broken: true }]));
    window.localStorage.setItem("chida-prototype-builder-projects", JSON.stringify([{
      id: "project-schema-fallback",
      name: "برج سالم",
      location: "ونک",
      stage: "نازک‌کاری",
      createdAt: "2026-08-27T00:00:00.000Z",
    }]));
    window.localStorage.setItem("chida-prototype-active-project", "project-schema-fallback");
  });

  await reachBuilderWelcome(page);
  await expect(page.getByTestId("saved-project-summary")).toContainText("برج سالم");

  await page.evaluate(() => {
    window.localStorage.setItem("chida-prototype-builder-projects:v2", "[]");
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await expect(page.getByTestId("project-setup-form")).toBeVisible();
  await expect(page.getByTestId("saved-project-summary")).toHaveCount(0);
});

test("selecting an incomplete saved project opens its completion form", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.removeItem("chida-prototype-builder-projects:v2");
    window.localStorage.setItem("chida-prototype-builder-projects", JSON.stringify([
      { id: "project-ready", name: "برج آماده", location: "سعادت‌آباد", stage: "اسکلت", createdAt: "2026-08-27T00:00:00.000Z" },
      { id: "project-incomplete", name: "برج قدیمی", location: "تهران", stage: "نازک‌کاری", createdAt: "2026-08-26T00:00:00.000Z" },
    ]));
    window.localStorage.setItem("chida-prototype-active-project", "project-ready");
  });

  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /برج قدیمی نیازمند تکمیل/ }).click();

  await expect(page.getByTestId("builder-home")).toHaveCount(0);
  await expect(page.getByTestId("project-setup-form")).toBeVisible();
  await expect(page.getByTestId("project-name-input")).toHaveValue("برج قدیمی");
  await expect(page.getByTestId("project-location-input")).toHaveValue("");
  await expect(page.getByTestId("project-stage-select")).toContainText("نازک کاری و نما");
  await page.getByTestId("project-location-input").fill("تهرانپارس");
  await page.getByTestId("project-create-button").click();

  const savedProjects = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]"));
  expect(savedProjects).toHaveLength(2);
  expect(savedProjects[1]).toMatchObject({ id: "project-incomplete", location: "تهرانپارس" });
  await expect(page.getByTestId("project-switcher")).toContainText("برج قدیمی");
});

test("quick action chips fit without a horizontal drag trap in the RTL mobile home", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);

  const rail = page.getByRole("region", { name: "اقدام‌های سریع" });
  const overflow = await rail.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(rail).toHaveCSS("direction", "rtl");
  await expect(rail.locator(".quick-chip")).toHaveCount(4);
  for (const chip of await rail.locator(".quick-chip").all()) await expect(chip).toBeVisible();
  await expect(page.getByTestId("composer-input")).toHaveValue("");
  await page.getByRole("button", { name: "برنامه خرید" }).click();
  await expect(page.getByTestId("composer-input")).toHaveValue("برنامه خرید");
});

test("builder opens and edits the active project space without losing the chat draft", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("یادداشت برای ادامهٔ گفتگو");

  await page.getByTestId("open-project-space").click();
  const workspace = page.getByTestId("project-workspace");
  await expect(workspace).toBeVisible();
  await expect(workspace).toHaveAttribute("data-mode", "fullscreen");
  await expect(workspace).toContainText("فضای پروژه");
  await expect(workspace).toContainText("برج نیلوفر");
  await expect(workspace).toContainText("پروژهٔ فعال");
  await expect(workspace).toContainText("تهران");
  await expect(workspace).toContainText("سعادت‌آباد");
  await expect(workspace).toContainText("اسکلت بندی");
  await expect(page.locator("html")).toHaveAttribute("data-chida-theme", "dark");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  await expect(page.getByTestId("composer-input")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "اقدام‌های سریع" })).toHaveCount(0);

  await page.getByTestId("project-space-edit").click();
  await expect(page.getByTestId("project-details-sheet")).toBeVisible();
  await expect(page.locator('select[data-testid="project-edit-stage"]')).toHaveCount(0);
  const editStageTrigger = page.getByTestId("project-edit-stage");
  await editStageTrigger.focus();
  await page.keyboard.press("Enter");
  const stageMenu = page.getByTestId("project-edit-stage-menu");
  await expect(stageMenu).toBeVisible();
  await expect(stageMenu).toHaveCSS("background-color", "rgb(26, 24, 22)");
  await page.keyboard.press("Escape");
  await expect(stageMenu).toBeHidden();
  await editStageTrigger.click();
  await expect(stageMenu).toBeVisible();
  await page.getByTestId("project-edit-stage-option-گچ و خاک و تاسیسات").click();
  await expect(stageMenu).toBeHidden();
  await page.getByTestId("project-edit-name").fill("برج نیلوفر دو");
  await page.getByTestId("project-edit-location").fill("منطقهٔ ۲");
  await chooseProjectOption(page, "project-edit-usage", "مسکونی");
  await page.getByTestId("project-edit-land-area").fill("-650");
  await page.getByTestId("project-edit-built-area").fill("4200");
  await page.getByTestId("project-edit-above-ground-floors").fill("6.5");
  await page.getByTestId("project-edit-basement-floors").fill("2");
  await page.getByTestId("project-edit-unit-count").fill("بیست‌وچهار");
  await page.getByTestId("project-edit-save").click();
  await expect(page.getByTestId("project-details-sheet")).toBeVisible();
  await expect(page.getByTestId("project-edit-land-area-error")).toContainText("صفر یا بیشتر");
  await expect(page.getByTestId("project-edit-above-ground-floors-error")).toContainText("عدد صحیح");
  await expect(page.getByTestId("project-edit-unit-count-error")).toContainText("عدد صحیح");
  await expect(page.getByTestId("project-edit-land-area")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("project-edit-land-area")).toBeFocused();

  await page.getByTestId("project-edit-land-area").fill("۶۵۰");
  await page.getByTestId("project-edit-above-ground-floors").fill("۶");
  await page.getByTestId("project-edit-unit-count").fill("۲۴");
  await page.getByTestId("project-edit-save").click();
  await expect(workspace).toContainText("برج نیلوفر دو");
  await expect(workspace).toContainText("منطقهٔ ۲");
  await expect(workspace).toContainText("گچ و خاک و تاسیسات");
  await expect(workspace).toContainText("مسکونی");
  await expect(workspace).toContainText("۶۵۰ مترمربع");
  await expect(workspace).toContainText("۴٬۲۰۰ مترمربع");
  await expect(workspace).toContainText("۶ طبقه");
  await expect(workspace).toContainText("۲ طبقه");
  await expect(workspace).toContainText("۲۴ واحد");

  await page.getByTestId("project-space-continue").click();
  await expect(page.getByTestId("builder-home")).toBeVisible();
  await expect(page.getByTestId("project-switcher")).toContainText("برج نیلوفر دو");
  await expect(page.getByTestId("composer-input")).toHaveValue("یادداشت برای ادامهٔ گفتگو");

  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /برج نیلوفر دو تهران/ }).click();
  await expect(page.getByTestId("project-workspace")).toBeVisible();
  await page.getByTestId("project-space-back").click();
  await expect(page.getByTestId("composer-input")).toHaveValue("یادداشت برای ادامهٔ گفتگو");

  await page.reload();
  await reachBuilderWelcome(page);
  await expect(page.getByTestId("saved-project-summary")).toContainText("برج نیلوفر دو");
  await expect(page.getByTestId("saved-project-summary")).toContainText("تهران · منطقهٔ ۲ · گچ و خاک و تاسیسات");
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await expect(page.getByTestId("project-workspace")).toContainText("۴٬۲۰۰ مترمربع");
  await expect(page.getByTestId("project-workspace")).toContainText("۲۴ واحد");
});

test("builder registers a project document locally, reviews its provenance, and renames it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const activeProjectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  expect(activeProjectId).toBeTruthy();
  await page.getByTestId("open-project-space").click();

  const filesEntry = page.getByTestId("project-files-entry");
  await expect(filesEntry).toContainText("فایل‌ها و اسناد");
  await expect(filesEntry).toContainText("هنوز فایلی ثبت نشده");
  await filesEntry.click();

  const filesView = page.getByTestId("project-files-view");
  await expect(filesView).toBeVisible();
  await expect(filesView).toContainText("برج نیلوفر");
  await expect(filesView).toContainText("محتوای واقعی فایل روی سرور ارسال نمی‌شود");
  await expect(page.getByTestId("project-files-empty")).toBeVisible();

  const fileInput = page.getByTestId("project-file-input");
  await fileInput.setInputFiles({
    name: "installer.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("not-an-accepted-project-file"),
  });
  await expect(page.getByTestId("project-file-error")).toContainText("پشتیبانی نمی‌شود");
  await expect(page.getByTestId("project-file-register-sheet")).toHaveCount(0);

  const registerSheet = page.getByTestId("project-file-register-sheet");
  await fileInput.setInputFiles({
    name: "تصویر کارگاه.heic",
    mimeType: "image/heic",
    buffer: Buffer.from("synthetic-heic-metadata-only"),
  });
  await expect(registerSheet).toBeVisible();
  await expect(page.getByTestId("project-file-category")).toContainText("عکس");
  await page.getByTestId("project-file-cancel").click();
  await expect(registerSheet).toBeHidden();

  const sampleDocument = {
    name: "پیش‌فاکتور بتن.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n% CHIDA synthetic test document"),
  };
  await fileInput.setInputFiles(sampleDocument);
  await expect(registerSheet).toBeVisible();
  await expect(registerSheet).toContainText("پیش‌فاکتور بتن.pdf");
  await expect(registerSheet).toContainText("برج نیلوفر");
  await expect(registerSheet).toContainText("نسخهٔ ۱");
  await expect(page.getByTestId("project-file-category")).toContainText("پیش‌فاکتور");
  await expect(page.locator('select[data-testid="project-file-category"]')).toHaveCount(0);
  await page.getByTestId("project-file-cancel").click();
  await expect(registerSheet).toBeHidden();
  await expect(page.getByTestId("project-file-row")).toHaveCount(0);

  await fileInput.setInputFiles(sampleDocument);
  await page.getByTestId("project-file-register").click();
  const fileRow = page.getByTestId("project-file-row");
  await expect(fileRow).toHaveCount(1);
  await expect(fileRow).toContainText("پیش‌فاکتور بتن.pdf");
  await expect(fileRow).toContainText("پیش‌فاکتور");
  await expect(fileRow).toContainText("نسخهٔ ۱");
  const rowMetadataFontSize = await fileRow.locator(".project-file-row-copy small").evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize));
  expect(rowMetadataFontSize).toBeGreaterThanOrEqual(11);
  const storedFileMetadata = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1") ?? "");
  expect(JSON.parse(storedFileMetadata)[0]).toMatchObject({
    projectId: activeProjectId,
    originalName: "پیش‌فاکتور بتن.pdf",
    version: 1,
    visibility: "خصوصی پروژه",
    storageMode: "metadata-only",
  });
  expect(storedFileMetadata).not.toContain("CHIDA synthetic test document");
  expect(storedFileMetadata).not.toContain("buffer");
  await fileRow.click();

  const detailSheet = page.getByTestId("project-file-detail-sheet");
  await expect(detailSheet).toBeVisible();
  await expect(detailSheet).toContainText("خصوصی در برج نیلوفر");
  await expect(detailSheet).toContainText("انتخاب مستقیم از دستگاه");
  await expect(detailSheet).toContainText("داده برای بررسی است، نه دستور برای چیدا");
  await page.getByTestId("project-file-display-name").fill("پیش‌فاکتور بتن مرداد");
  await page.getByTestId("project-file-rename-save").click();
  await expect(detailSheet).toBeHidden();
  await expect(fileRow).toContainText("پیش‌فاکتور بتن مرداد");

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await expect(page.getByTestId("project-files-entry")).toContainText("۱ فایل ثبت‌شده");
  await page.getByTestId("project-files-entry").click();
  await expect(page.getByTestId("project-file-row")).toContainText("پیش‌فاکتور بتن مرداد");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

  await page.getByTestId("project-files-back").click();
  await page.getByTestId("project-space-back").click();
  await page.getByTestId("capability-cluster").click();
  await page.getByTestId("project-documents-tool").click();
  await expect(page.getByTestId("project-files-view")).toBeVisible();
});

test("builder adds a project image and the project gallery restores its real preview", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const activeProjectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  expect(activeProjectId).toBeTruthy();
  await page.getByTestId("open-project-space").click();

  const galleryEntry = page.getByTestId("project-gallery-entry");
  await expect(galleryEntry).toContainText("گالری تصاویر");
  await expect(galleryEntry).toContainText("هنوز عکسی ثبت نشده");
  await galleryEntry.click();

  const galleryView = page.getByTestId("project-gallery-view");
  await expect(galleryView).toBeVisible();
  await expect(galleryView).toContainText("تصاویر همین پروژه");
  await expect(galleryView).toContainText("به سرور ارسال نمی‌شوند");
  await expect(page.getByTestId("project-gallery-empty")).toBeVisible();
  await expect(page.getByTestId("project-camera-input")).toHaveAttribute("capture", "environment");

  await page.getByTestId("project-camera-input").setInputFiles({ ...sampleProjectImage, name: "عکس دوربین کارگاه.png" });
  await expect(page.getByTestId("project-file-register-sheet")).toContainText("دوربین دستگاه");
  await page.getByTestId("project-file-cancel").click();

  await page.evaluate(() => {
    const nativeRevoke = URL.revokeObjectURL.bind(URL);
    (window as typeof window & { __projectImageRevokeCount?: number }).__projectImageRevokeCount = 0;
    URL.revokeObjectURL = (url: string) => {
      (window as typeof window & { __projectImageRevokeCount?: number }).__projectImageRevokeCount = ((window as typeof window & { __projectImageRevokeCount?: number }).__projectImageRevokeCount ?? 0) + 1;
      nativeRevoke(url);
    };
  });

  await page.getByTestId("project-gallery-input").setInputFiles(sampleProjectImage);
  const registerSheet = page.getByTestId("project-file-register-sheet");
  await expect(registerSheet).toBeVisible();
  await expect(registerSheet).toContainText("نمای جنوبی کارگاه.png");
  await expect(registerSheet).toContainText("برج نیلوفر");
  await expect(registerSheet).toContainText("خصوصی در همین پروژه");
  await expect(registerSheet).toContainText("اسکلت بندی");
  await expect(page.getByTestId("project-file-preview-image")).toBeVisible();
  await page.getByTestId("project-file-register").click();

  const galleryItem = page.getByTestId("project-gallery-item");
  await expect(galleryItem).toHaveCount(1);
  await expect(galleryItem).toContainText("نمای جنوبی کارگاه");
  const thumbnail = page.getByTestId("project-gallery-thumbnail");
  await expect(thumbnail).toBeVisible();
  await expect.poll(() => thumbnail.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

  const storedImageMetadata = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1") ?? "");
  expect(JSON.parse(storedImageMetadata)).toEqual(expect.arrayContaining([
    expect.objectContaining({
      projectId: activeProjectId,
      originalName: "نمای جنوبی کارگاه.png",
      category: "عکس",
      storageMode: "browser-image",
    }),
  ]));
  expect(storedImageMetadata).not.toContain(sampleProjectImage.buffer.toString("base64"));

  await galleryItem.click();
  const detailSheet = page.getByTestId("project-gallery-detail-sheet");
  await expect(detailSheet).toBeVisible();
  await expect(detailSheet).toContainText("خصوصی در برج نیلوفر");
  await expect(detailSheet).toContainText("اسکلت بندی");
  await expect(page.getByTestId("project-gallery-detail-image")).toBeVisible();
  await page.getByRole("button", { name: "بستن" }).click();
  await page.getByTestId("project-gallery-back").click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __projectImageRevokeCount?: number }).__projectImageRevokeCount ?? 0)).toBeGreaterThanOrEqual(2);
  await page.getByTestId("project-gallery-entry").click();

  await page.evaluate(() => {
    const storedProjects = JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]");
    storedProjects.push({ id: "project-gallery-b", name: "پروژه دوم", location: "ونک", stage: "فونداسیون", usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-27T00:00:00.000Z" });
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify(storedProjects));
  });

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await expect(page.getByTestId("project-gallery-entry")).toContainText("۱ عکس ثبت‌شده");
  await page.getByTestId("project-gallery-entry").click();
  await expect(page.getByTestId("project-gallery-item")).toHaveCount(1);
  const restoredThumbnail = page.getByTestId("project-gallery-thumbnail");
  await expect(restoredThumbnail).toBeVisible();
  await expect.poll(() => restoredThumbnail.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

  await page.getByTestId("project-gallery-back").click();
  await page.getByTestId("project-space-back").click();
  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /پروژه دوم تهران/ }).click();
  await expect(page.getByTestId("project-gallery-entry")).toContainText("هنوز عکسی ثبت نشده");
  await page.getByTestId("project-gallery-entry").click();
  await expect(page.getByTestId("project-gallery-empty")).toBeVisible();
  await expect(page.getByTestId("project-gallery-item")).toHaveCount(0);
});

test("project gallery rejects mismatched files and ignores an editable photo category on a PDF", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-gallery-entry").click();

  await page.getByTestId("project-gallery-input").setInputFiles({
    name: "not-an-image.pdf",
    mimeType: "image/png",
    buffer: Buffer.from("%PDF mismatched image type"),
  });
  await expect(page.getByTestId("project-gallery-error")).toContainText("پشتیبانی نمی‌شود");
  await expect(page.getByTestId("project-file-register-sheet")).toHaveCount(0);
  await page.getByTestId("project-gallery-input").setInputFiles({
    name: "vector-disguised-as-raster.png",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>"),
  });
  await expect(page.getByTestId("project-gallery-error")).toContainText("پشتیبانی نمی‌شود");
  await expect(page.getByTestId("project-file-register-sheet")).toHaveCount(0);

  await page.getByTestId("project-gallery-back").click();
  await page.getByTestId("project-files-entry").click();
  await page.getByTestId("project-file-input").setInputFiles({
    name: "قرارداد.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF project contract"),
  });
  await chooseProjectOption(page, "project-file-category", "عکس");
  await page.getByTestId("project-file-register").click();
  await expect(page.getByTestId("project-file-row")).toContainText("قرارداد.pdf");
  await page.getByTestId("project-files-back").click();
  await expect(page.getByTestId("project-gallery-entry")).toContainText("هنوز عکسی ثبت نشده");
  await page.getByTestId("project-gallery-entry").click();
  await expect(page.getByTestId("project-gallery-empty")).toBeVisible();
  await expect(page.getByTestId("project-gallery-item")).toHaveCount(0);
});

test("project gallery keeps HEIC metadata without rendering a broken thumbnail", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-gallery-entry").click();
  await page.getByTestId("project-gallery-input").setInputFiles({
    name: "کارگاه.heic",
    mimeType: "image/jpeg",
    buffer: Buffer.from("synthetic HEIC project image"),
  });
  await expect(page.getByTestId("project-file-preview-image")).toHaveCount(0);
  await page.getByTestId("project-file-register").click();
  await expect(page.getByTestId("project-gallery-item")).toContainText("کارگاه.heic");
  await expect(page.getByTestId("project-gallery-thumbnail")).toHaveCount(0);
  await expect(page.locator(".project-gallery-thumbnail-empty")).toContainText("HEIC");

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-gallery-entry").click();
  await expect(page.getByTestId("project-gallery-item")).toContainText("کارگاه.heic");
  await expect(page.getByTestId("project-gallery-thumbnail")).toHaveCount(0);
  await expect(page.locator(".project-gallery-thumbnail-empty")).toContainText("HEIC");
});

test("project gallery replaces an undecodable raster with an honest fallback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-gallery-entry").click();
  await page.getByTestId("project-gallery-input").setInputFiles({
    name: "تصویر خراب.png",
    mimeType: "image/png",
    buffer: Buffer.from("not a decodable PNG"),
  });
  await expect(page.getByTestId("project-file-preview-image")).toHaveCount(0);
  await page.getByTestId("project-file-register").click();
  await expect(page.getByTestId("project-gallery-thumbnail")).toHaveCount(0);
  await expect(page.locator(".project-gallery-thumbnail-empty")).toContainText("PNG");
});

test("project gallery rolls back the local image when metadata storage fails", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-gallery-entry").click();
  const storageBefore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1"));
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (key === "chida-prototype-project-files:v1") throw new DOMException("Quota exceeded", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });

  await page.getByTestId("project-gallery-input").setInputFiles(sampleProjectImage);
  await page.getByTestId("project-file-register").click();
  await expect(page.getByTestId("project-file-register-sheet")).toBeVisible();
  await expect(page.getByTestId("project-file-register-error")).toContainText("ذخیره نشد");
  await expect(page.getByTestId("project-gallery-item")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1"))).toBe(storageBefore);

  const storedImageCount = await page.evaluate(() => new Promise<number>((resolve, reject) => {
    const openRequest = window.indexedDB.open("chida-prototype-project-images:v1", 1);
    openRequest.onupgradeneeded = () => {
      if (!openRequest.result.objectStoreNames.contains("images")) openRequest.result.createObjectStore("images", { keyPath: "id" });
    };
    openRequest.onerror = () => reject(openRequest.error);
    openRequest.onsuccess = () => {
      const database = openRequest.result;
      const countRequest = database.transaction("images", "readonly").objectStore("images").count();
      countRequest.onerror = () => reject(countRequest.error);
      countRequest.onsuccess = () => { resolve(countRequest.result); database.close(); };
    };
  }));
  expect(storedImageCount).toBe(0);
});

test("project gallery reconciles metadata when image storage and rollback both fail", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-gallery-entry").click();
  const storageBefore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1"));
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = function put() {
      throw new DOMException("IndexedDB write failed", "QuotaExceededError");
    };
    const nativeRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function removeItem(key: string) {
      if (this === window.localStorage && key === "chida-prototype-project-files:v1") throw new DOMException("Rollback failed", "QuotaExceededError");
      return nativeRemoveItem.call(this, key);
    };
  });

  await page.getByTestId("project-gallery-input").setInputFiles(sampleProjectImage);
  await page.getByTestId("project-file-register").click();
  await expect(page.getByTestId("project-file-register-sheet")).toBeVisible();
  await expect(page.getByTestId("project-file-register-error")).toContainText("ذخیره نشد");
  await expect(page.getByTestId("project-gallery-item")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1"))).not.toBe(storageBefore);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await expect(page.getByTestId("project-gallery-entry")).toContainText("هنوز عکسی ثبت نشده");
  await page.getByTestId("project-gallery-entry").click();
  await expect(page.getByTestId("project-gallery-empty")).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1"))).toBe(storageBefore);
});

test("project document registration reports storage failure instead of showing false success", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-files-entry").click();

  const storageBefore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1"));
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (key === "chida-prototype-project-files:v1") throw new DOMException("Quota exceeded", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });

  await page.getByTestId("project-file-input").setInputFiles({
    name: "نقشه معماری.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF synthetic storage failure"),
  });
  await page.getByTestId("project-file-register").click();

  await expect(page.getByTestId("project-file-register-sheet")).toBeVisible();
  await expect(page.getByTestId("project-file-register-error")).toContainText("ذخیره نشد");
  await expect(page.getByTestId("project-file-row")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1"))).toBe(storageBefore);
});

test("project document parser drops semantically invalid and duplicate records", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify([
      { id: "project-a", name: "پروژه الف", location: "ونک", stage: "اسکلت", usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-27T00:00:00.000Z" },
    ]));
    window.localStorage.setItem("chida-prototype-active-project", "project-a");
    const common = {
      projectId: "project-a",
      mimeType: "application/pdf",
      size: 512,
      category: "سایر",
      source: "انتخاب مستقیم از دستگاه",
      status: "ثبت محلی",
      version: 1,
      projectStage: "اسکلت",
      createdAt: "2026-08-27T00:00:00.000Z",
    };
    window.localStorage.setItem("chida-prototype-project-files:v1", JSON.stringify([
      { ...common, id: "", displayName: "", originalName: "blank.pdf" },
      { ...common, id: "invalid-date", displayName: "تاریخ خراب", originalName: "invalid-date.pdf", createdAt: "not-a-date" },
      { ...common, id: "unsupported", displayName: "فایل اجرایی", originalName: "installer.exe" },
      { ...common, id: "invalid-source", displayName: "منشأ جعلی", originalName: "forged-source.pdf", source: "وب" },
      { ...common, id: "valid-file", displayName: " گزارش معتبر ", originalName: "report.pdf" },
      { ...common, id: "valid-file", displayName: "شناسه تکراری", originalName: "duplicate.pdf" },
    ]));
  });

  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-files-entry").click();

  await expect(page.getByTestId("project-file-row")).toHaveCount(1);
  await expect(page.getByTestId("project-file-row")).toContainText("گزارش معتبر");
  await expect(page.getByText("شناسه تکراری")).toHaveCount(0);
  await expect(page.getByText("منشأ جعلی")).toHaveCount(0);
  await page.getByTestId("project-file-row").click();
  await expect(page.getByTestId("project-file-detail-sheet")).toContainText("اسکلت بندی");
});

test("returning from project files restores the workspace scroll position", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();

  const workspaceScroll = page.locator(".project-workspace-scroll .mobile-scroll");
  const savedScrollTop = await workspaceScroll.evaluate((element) => {
    element.scrollTop = Math.min(284, element.scrollHeight - element.clientHeight);
    return element.scrollTop;
  });
  expect(savedScrollTop).toBeGreaterThan(100);
  await page.getByTestId("project-files-entry").click();
  await page.getByTestId("project-files-back").click();

  await expect.poll(() => workspaceScroll.evaluate((element) => element.scrollTop)).toBeCloseTo(savedScrollTop, 0);
});

test("quick actions remain visible without horizontal scrolling after returning to chat", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const quickActions = page.locator(".quick-actions");
  await expect.poll(() => quickActions.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  await expect(page.locator(".quick-chip")).toHaveCount(4);
  for (const chip of await page.locator(".quick-chip").all()) await expect(chip).toBeVisible();

  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-space-back").click();

  await expect.poll(() => quickActions.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});

test("project documents never appear in another project", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify([
      { id: "project-a", name: "پروژه الف", location: "ونک", stage: "اسکلت", usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-27T00:00:00.000Z" },
      { id: "project-b", name: "پروژه ب", location: "جردن", stage: "نازک‌کاری", usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-27T00:00:00.000Z" },
    ]));
    window.localStorage.setItem("chida-prototype-active-project", "project-a");
    window.localStorage.setItem("chida-prototype-project-files:v1", JSON.stringify([{
      id: "file-project-a",
      projectId: "project-a",
      displayName: "قرارداد پروژه الف",
      originalName: "contract-a.pdf",
      mimeType: "application/pdf",
      size: 512,
      category: "قرارداد",
      source: "انتخاب مستقیم از دستگاه",
      status: "ثبت محلی",
      version: 1,
      createdAt: "2026-08-27T00:00:00.000Z",
    }]));
  });

  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await expect(page.getByTestId("project-files-entry")).toContainText("۱ فایل ثبت‌شده");
  await page.getByTestId("project-files-entry").click();
  await expect(page.getByTestId("project-file-row")).toContainText("قرارداد پروژه الف");

  await page.getByTestId("project-files-back").click();
  await page.getByTestId("project-space-back").click();
  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /پروژه ب تهران/ }).click();
  await expect(page.getByTestId("project-workspace")).toContainText("پروژه ب");
  await expect(page.getByTestId("project-files-entry")).toContainText("هنوز فایلی ثبت نشده");
  await page.getByTestId("project-files-entry").click();
  await expect(page.getByTestId("project-files-empty")).toBeVisible();
  await expect(page.getByText("قرارداد پروژه الف")).toHaveCount(0);

  await page.getByTestId("project-file-input").setInputFiles({
    name: "قرارداد پروژه ب.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF synthetic project B"),
  });
  await page.getByTestId("project-file-register").click();
  await expect(page.getByTestId("project-file-row")).toContainText("قرارداد پروژه ب.pdf");
  const storedProjectFiles = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-files:v1") ?? "[]"));
  expect(storedProjectFiles).toEqual(expect.arrayContaining([
    expect.objectContaining({ projectId: "project-a", originalName: "contract-a.pdf" }),
    expect.objectContaining({ projectId: "project-b", originalName: "قرارداد پروژه ب.pdf" }),
  ]));
});

test("builder manages a transparent project memory through its full local lifecycle", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);

  await page.getByTestId("composer-input").fill("این پیام نباید خودکار وارد حافظه شود");
  await page.getByTestId("send-button").click();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).toBeNull();

  await page.getByTestId("open-project-space").click();
  const memoryEntry = page.getByTestId("project-memory-entry");
  await expect(memoryEntry).toContainText("حافظهٔ پروژه");
  await expect(memoryEntry).toContainText("هنوز موردی ثبت نشده");
  await memoryEntry.click();

  const memoryView = page.getByTestId("project-memory-view");
  await expect(memoryView).toBeVisible();
  await expect(memoryView).toContainText("چیدا چه می‌داند");
  await expect(memoryView).toContainText("تاریخچهٔ گفتگو حافظه نیست");
  await expect(page.getByTestId("project-memory-empty")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

  await page.getByTestId("project-memory-add").click();
  const editor = page.getByTestId("project-memory-editor-sheet");
  await expect(editor).toBeVisible();
  await expect(editor).toContainText("برج نیلوفر");
  await expect(editor).toContainText("ثبت مستقیم شما");
  await expect(editor).toContainText("خصوصی پروژه");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-title-error")).toContainText("عنوان");
  await expect(page.getByTestId("project-memory-content-error")).toContainText("متن حافظه");

  await page.getByTestId("project-memory-title").fill("قاعدهٔ خرید بتن");
  await page.getByTestId("project-memory-content").fill("فاکتور رسمی و زمان تحویل پیش از مقایسهٔ قیمت بررسی شود.");
  await chooseProjectOption(page, "project-memory-kind", "واقعیت تأییدشده توسط سازنده");
  await page.getByTestId("project-memory-save").click();

  const memoryCard = page.getByTestId("project-memory-card");
  await expect(memoryCard).toHaveCount(1);
  await expect(memoryCard).toContainText("قاعدهٔ خرید بتن");
  await expect(memoryCard).toContainText("واقعیت تأییدشده توسط سازنده");
  const storedMemory = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-memories:v1") ?? "[]"));
  expect(storedMemory).toEqual([
    expect.objectContaining({
      projectId: expect.any(String),
      title: "قاعدهٔ خرید بتن",
      content: "فاکتور رسمی و زمان تحویل پیش از مقایسهٔ قیمت بررسی شود.",
      kind: "واقعیت تأییدشده توسط سازنده",
      source: "ثبت مستقیم شما",
      visibility: "خصوصی پروژه",
      useInContext: true,
      version: 1,
    }),
  ]);

  await memoryCard.click();
  const detail = page.getByTestId("project-memory-detail-sheet");
  await expect(detail).toBeVisible();
  await expect(detail).toContainText("ثبت مستقیم شما");
  await expect(detail).toContainText("خصوصی در برج نیلوفر");
  await expect(detail).toContainText("نسخهٔ ۱");
  await page.getByTestId("project-memory-use-toggle").click();
  await expect(detail).toContainText("برای زمینه غیرفعال است");

  await page.getByTestId("project-memory-edit").click();
  await page.getByTestId("project-memory-content").fill("فاکتور رسمی، زمان تحویل و ردهٔ بتن پیش از مقایسهٔ قیمت بررسی شود.");
  await page.getByTestId("project-memory-save").click();
  await expect(memoryCard).toContainText("ردهٔ بتن");

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await expect(page.getByTestId("project-memory-entry")).toContainText("۱ مورد ثبت‌شده");
  await page.getByTestId("project-memory-entry").click();
  await expect(page.getByTestId("project-memory-card")).toContainText("در زمینه استفاده نمی‌شود");
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-delete").click();
  await expect(page.getByTestId("project-memory-delete-confirmation")).toContainText("حذف دائمی از این مرورگر");
  await expect(page.getByRole("button", { name: "انصراف" })).toBeFocused();
  await page.getByTestId("project-memory-delete-confirm").click();
  await expect(page.getByTestId("project-memory-empty")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).toBeNull();
});

test("project memory stays inside its owning project", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const firstProjectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-memory-entry").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("تصمیم پروژهٔ اول");
  await page.getByTestId("project-memory-content").fill("این مورد فقط به پروژهٔ اول تعلق دارد.");
  await page.getByTestId("project-memory-save").click();

  await page.evaluate(() => {
    const projects = JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]");
    projects.push({ id: "project-memory-b", name: "پروژه دوم", location: "ونک", stage: "فونداسیون", usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-27T00:00:00.000Z" });
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify(projects));
  });

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /پروژه دوم تهران/ }).click();
  await expect(page.getByTestId("project-memory-entry")).toContainText("هنوز موردی ثبت نشده");
  await page.getByTestId("project-memory-entry").click();
  await expect(page.getByTestId("project-memory-empty")).toBeVisible();
  await expect(page.getByText("تصمیم پروژهٔ اول")).toHaveCount(0);

  const storedMemories = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-memories:v1") ?? "[]"));
  expect(storedMemories).toEqual([expect.objectContaining({ projectId: firstProjectId, title: "تصمیم پروژهٔ اول" })]);
});

test("project memory reports storage failure instead of showing false success", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-memory-entry").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("یادداشت ذخیره‌نشده");
  await page.getByTestId("project-memory-content").fill("این متن نباید فقط در state موفق دیده شود.");
  const storageBefore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"));
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (key === "chida-prototype-project-memories:v1") throw new DOMException("Quota exceeded", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });

  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-editor-sheet")).toBeVisible();
  await expect(page.getByTestId("project-memory-storage-error")).toContainText("ذخیره نشد");
  await expect(page.getByTestId("project-memory-card")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).toBe(storageBefore);
});

test("project memory parser drops malformed and duplicate records", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const projectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  if (!projectId) throw new Error("Active project id is unavailable");
  const timestamp = new Date().toISOString();

  await page.evaluate(({ ownerProjectId, storedAt }) => {
    const validMemory = {
      id: "memory-valid",
      projectId: ownerProjectId,
      title: "رکورد معتبر",
      content: "این تنها رکوردی است که باید نمایش داده شود.",
      kind: "یادداشت سازنده",
      source: "ثبت مستقیم شما",
      visibility: "خصوصی پروژه",
      useInContext: true,
      status: "ثبت محلی",
      version: 1,
      createdAt: storedAt,
      updatedAt: storedAt,
    };
    window.localStorage.setItem("chida-prototype-project-memories:v1", JSON.stringify([
      validMemory,
      { ...validMemory, title: "شناسهٔ تکراری" },
      { ...validMemory, id: "memory-invalid-date", createdAt: "تاریخ نامعتبر" },
      { ...validMemory, id: "memory-invalid-source", source: "برداشت چیدا" },
      { ...validMemory, id: "memory-invalid-title", title: "" },
    ]));
  }, { ownerProjectId: projectId, storedAt: timestamp });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-card")).toHaveCount(1);
  await expect(page.getByTestId("project-memory-card")).toContainText("رکورد معتبر");
  await expect(page.getByText("شناسهٔ تکراری")).toHaveCount(0);
  await expect(page.getByText("برداشت چیدا")).toHaveCount(0);
});

test("project memory closes its keyboard cleanly and contains an eighty-character title", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-memory-entry").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").click();
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "true");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("project-memory-editor-sheet")).toBeHidden();
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");

  const boundaryTitle = "ن".repeat(80);
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill(boundaryTitle);
  await page.getByTestId("project-memory-content").fill("عنوان مرزی نباید اسکرول افقی در کارت حافظه بسازد.");
  await page.getByTestId("project-memory-save").click();
  const memoryCard = page.getByTestId("project-memory-card");
  await expect(memoryCard).toContainText(boundaryTitle);
  expect(await memoryCard.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test("project memory keeps persisted state when edit toggle or delete storage fails", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-memory-entry").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("حافظهٔ پایدار");
  await page.getByTestId("project-memory-content").fill("نسخهٔ ذخیره‌شده نباید با شکست مرورگر تغییر کند.");
  await page.getByTestId("project-memory-save").click();
  const persistedMemory = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"));

  await page.getByTestId("project-memory-card").click();
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (key === "chida-prototype-project-memories:v1") throw new DOMException("Quota exceeded", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("project-memory-use-toggle").click();
  await expect(page.getByTestId("project-memory-storage-error")).toContainText("ذخیره نشد");
  await expect(page.getByTestId("project-memory-detail-sheet")).toContainText("برای زمینه فعال است");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).toBe(persistedMemory);

  await openSavedProjectMemory(page);
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-edit").click();
  await page.getByTestId("project-memory-content").fill("این ویرایش نباید ثبت شود.");
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (key === "chida-prototype-project-memories:v1") throw new DOMException("Quota exceeded", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-editor-sheet")).toBeVisible();
  await expect(page.getByTestId("project-memory-storage-error")).toContainText("ذخیره نشد");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).toBe(persistedMemory);

  await openSavedProjectMemory(page);
  await page.getByTestId("project-memory-card").click();
  await page.evaluate(() => {
    const nativeRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function removeItem(key: string) {
      if (key === "chida-prototype-project-memories:v1") throw new DOMException("Storage unavailable", "InvalidStateError");
      return nativeRemoveItem.call(this, key);
    };
  });
  await page.getByTestId("project-memory-delete").click();
  await page.getByTestId("project-memory-delete-confirm").click();
  await expect(page.getByTestId("project-memory-detail-sheet")).toBeVisible();
  await expect(page.getByTestId("project-memory-storage-error")).toContainText("ذخیره نشد");
  await expect(page.getByTestId("project-memory-delete-confirmation")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).toBe(persistedMemory);
});

test("builder searches only local project memory and file metadata with transparent provenance", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify([{
      id: "project-search-a",
      name: "برج نیلوفر",
      location: "سعادت‌آباد",
      stage: "اسکلت بندی",
      usage: "مسکونی",
      landArea: "650",
      builtArea: "4200",
      aboveGroundFloors: "8",
      basementFloors: "2",
      unitCount: "16",
      createdAt: "2026-08-27T08:00:00.000Z",
    }]));
    window.localStorage.setItem("chida-prototype-active-project", "project-search-a");
    const memoryBase = {
      projectId: "project-search-a",
      kind: "واقعیت تأییدشده توسط سازنده",
      source: "ثبت مستقیم شما",
      visibility: "خصوصی پروژه",
      useInContext: false,
      status: "ثبت محلی",
      version: 1,
      createdAt: "2026-08-27T09:00:00.000Z",
      updatedAt: "2026-08-27T10:00:00.000Z",
    };
    window.localStorage.setItem("chida-prototype-project-memories:v1", JSON.stringify([
      { ...memoryBase, id: "memory-search-a", title: "تصمیم پروژه ۱۲", content: "ردهٔ بتن پیش از سفارش با ناظر هماهنگ شود." },
      { ...memoryBase, id: "memory-search-long", title: `عنوانمرزی${"ا".repeat(69)}`, content: "این عنوان بلند نباید اسکرول افقی بسازد." },
    ]));
    const fileBase = {
      projectId: "project-search-a",
      mimeType: "application/pdf",
      size: 2048,
      source: "انتخاب مستقیم از دستگاه",
      status: "ثبت محلی",
      version: 1,
      projectStage: "اسکلت بندی",
      visibility: "خصوصی پروژه",
      storageMode: "metadata-only",
      sourceModifiedAt: null,
      createdAt: "2026-08-27T11:00:00.000Z",
    };
    window.localStorage.setItem("chida-prototype-project-files:v1", JSON.stringify([
      { ...fileBase, id: "file-search-a", displayName: "نقشه سازه طبقه همکف", originalName: "structure-ground-floor.pdf", category: "نقشه", extractedText: "عبارت فقط داخل بدنه فایل" },
      { ...fileBase, id: "file-search-zwnj", displayName: "پیش‌فاکتور تاسیسات", originalName: "proposal-installations.pdf", category: "پیش‌فاکتور" },
    ]));
  });
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await expect(page.getByTestId("project-memory-entry")).toContainText("۲ مورد ثبت‌شده");
  await page.getByTestId("project-memory-entry").click();
  await expect(page.getByTestId("project-memory-card")).toHaveCount(2);
  await page.getByTestId("project-memory-back").click();
  await page.getByTestId("project-space-back").click();
  await page.getByTestId("capability-cluster").click();
  const searchTool = page.getByTestId("source-search-tool");
  await expect(searchTool).toBeEnabled();
  await expect(searchTool).toContainText("جست‌وجوی محلی پروژه");
  await expect(searchTool).not.toContainText("منبع‌دار");
  await expect(searchTool).not.toContainText("به‌زودی");
  await searchTool.click();

  const searchView = page.getByTestId("project-source-search-view");
  await expect(searchView).toBeVisible();
  await expect(searchView).toContainText("فقط حافظه و شناسنامهٔ فایل‌های همین پروژه");
  await expect(searchView).toContainText("وب و محتوای فایل‌ها جست‌وجو نمی‌شوند");

  const searchInput = page.getByTestId("project-source-search-input");
  await searchInput.fill("تصميم پروژه ١٢");
  const memoryResult = page.getByTestId("project-source-result-memory");
  await expect(memoryResult).toHaveCount(1);
  await expect(memoryResult).toContainText("تصمیم پروژه ۱۲");
  await expect(memoryResult).toContainText("ثبت مستقیم شما");
  await expect(memoryResult).toContainText("خصوصی در برج نیلوفر");
  await expect(memoryResult).toContainText("نسخهٔ ۱");
  await expect(memoryResult).toContainText("برای زمینه غیرفعال");
  await expect(memoryResult).toHaveAccessibleName(/ثبت مستقیم شما.*خصوصی در برج نیلوفر/);
  await memoryResult.click();
  await expect(page.getByTestId("project-memory-view")).toBeVisible();
  await expect(page.getByTestId("project-memory-detail-sheet")).toContainText("تصمیم پروژه ۱۲");
  await expect(page.getByTestId("project-memory-back")).toHaveAttribute("aria-label", "بازگشت به جست‌وجو");
  await page.keyboard.press("Escape");
  await page.getByTestId("project-memory-back").click();
  await expect(searchInput).toHaveValue("تصميم پروژه ١٢");

  await searchInput.click();
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "true");
  await page.getByTestId("project-source-search-clear").click();
  await expect(searchInput).toHaveValue("");
  await expect(searchInput).toBeFocused();
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "true");
  await searchInput.fill("نقشه");
  const fileResult = page.getByTestId("project-source-result-file");
  await expect(fileResult).toHaveCount(1);
  await expect(fileResult).toContainText("نقشه سازه طبقه همکف");
  await expect(fileResult).toContainText("انتخاب مستقیم از دستگاه");
  await expect(fileResult).toContainText("خصوصی در برج نیلوفر");
  await expect(fileResult).toContainText("محتوای فایل جست‌وجو نشده");
  await expect(fileResult).toHaveAccessibleName(/انتخاب مستقیم از دستگاه.*محتوای فایل جست‌وجو نشده/);
  await fileResult.click();
  await expect(page.getByTestId("project-files-view")).toBeVisible();
  await expect(page.getByTestId("project-file-detail-sheet")).toContainText("نقشه سازه طبقه همکف");
  await page.keyboard.press("Escape");
  await page.getByTestId("project-files-back").click();

  await searchInput.fill("پیشفاکتور");
  await expect(page.getByTestId("project-source-result-file")).toHaveCount(1);
  await expect(page.getByTestId("project-source-result-file")).toContainText("پیش‌فاکتور تاسیسات");

  await searchInput.fill("۱۲رده");
  await expect(page.getByTestId("project-source-result")).toHaveCount(0);
  await expect(page.getByTestId("project-source-search-no-results")).toBeVisible();

  await searchInput.fill("عنوانمرزی");
  await expect(page.getByTestId("project-source-result-memory")).toHaveCount(1);
  expect(await searchView.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  const clearBox = await page.getByTestId("project-source-search-clear").boundingBox();
  const backBox = await page.getByTestId("project-source-search-back").boundingBox();
  if (!clearBox || !backBox) throw new Error("Search controls are not rendered");
  expect(clearBox.width).toBeGreaterThanOrEqual(44);
  expect(clearBox.height).toBeGreaterThanOrEqual(44);
  expect(backBox.width).toBeGreaterThanOrEqual(44);
  expect(backBox.height).toBeGreaterThanOrEqual(44);

  await searchInput.fill("عبارت فقط داخل بدنه فایل");
  await expect(page.getByTestId("project-source-result")).toHaveCount(0);
  await expect(page.getByTestId("project-source-search-no-results")).toContainText("در حافظه و شناسنامهٔ فایل‌های همین پروژه نتیجه‌ای پیدا نشد");
  await expect(page.getByTestId("project-source-search-no-results")).toContainText("محتوای فایل‌ها، وب و پروژه‌های دیگر جست‌وجو نشدند");
  await page.getByTestId("project-source-search-back").click();
  await expect(page.getByTestId("builder-home")).toBeVisible();
  await expect(page.getByTestId("keyboard-dock")).toBeHidden();
});

test("local project search never leaks records when the active project changes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    const projectBase = { usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-27T08:00:00.000Z" };
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify([
      { ...projectBase, id: "project-isolation-a", name: "پروژه الف", location: "ونک", stage: "فونداسیون" },
      { ...projectBase, id: "project-isolation-b", name: "پروژه ب", location: "جردن", stage: "نازک کاری و نما" },
    ]));
    window.localStorage.setItem("chida-prototype-active-project", "project-isolation-a");
    const memoryBase = {
      kind: "یادداشت سازنده",
      source: "ثبت مستقیم شما",
      visibility: "خصوصی پروژه",
      useInContext: true,
      status: "ثبت محلی",
      version: 1,
      createdAt: "2026-08-27T09:00:00.000Z",
      updatedAt: "2026-08-27T09:00:00.000Z",
    };
    window.localStorage.setItem("chida-prototype-project-memories:v1", JSON.stringify([
      { ...memoryBase, id: "memory-isolation-a", projectId: "project-isolation-a", title: "نشانه فقط پروژه الف", content: "این حافظه نباید در پروژه ب دیده شود." },
      { ...memoryBase, id: "memory-isolation-b", projectId: "project-isolation-b", title: "نشانه فقط پروژه ب", content: "این حافظه فقط در پروژه ب است." },
    ]));
    const fileBase = { mimeType: "application/pdf", size: 512, category: "سایر", source: "انتخاب مستقیم از دستگاه", status: "ثبت محلی", version: 1, visibility: "خصوصی پروژه", storageMode: "metadata-only", sourceModifiedAt: null, createdAt: "2026-08-27T09:30:00.000Z" };
    window.localStorage.setItem("chida-prototype-project-files:v1", JSON.stringify([
      { ...fileBase, id: "file-isolation-a", projectId: "project-isolation-a", displayName: "سند فقط پروژه الف", originalName: "project-a.pdf", projectStage: "فونداسیون" },
      { ...fileBase, id: "file-isolation-b", projectId: "project-isolation-b", displayName: "سند فقط پروژه ب", originalName: "project-b.pdf", projectStage: "نازک کاری و نما" },
    ]));
  });

  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("capability-cluster").click();
  await page.getByTestId("source-search-tool").click();
  await page.getByTestId("project-source-search-input").fill("نشانه فقط پروژه الف");
  await expect(page.getByTestId("project-source-result-memory")).toContainText("نشانه فقط پروژه الف");
  await expect(page.getByText("نشانه فقط پروژه ب")).toHaveCount(0);
  await page.getByTestId("project-source-search-input").fill("سند فقط پروژه الف");
  await expect(page.getByTestId("project-source-result-file")).toContainText("سند فقط پروژه الف");
  await expect(page.getByText("سند فقط پروژه ب")).toHaveCount(0);

  await page.getByTestId("project-source-search-back").click();
  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /پروژه ب تهران/ }).click();
  await page.getByTestId("project-space-back").click();
  await page.getByTestId("capability-cluster").click();
  await page.getByTestId("source-search-tool").click();
  const searchInput = page.getByTestId("project-source-search-input");
  await expect(searchInput).toHaveValue("");
  await searchInput.fill("سند فقط پروژه الف");
  await expect(page.getByTestId("project-source-result")).toHaveCount(0);
  await expect(page.getByText("سند فقط پروژه الف")).toHaveCount(0);
  await searchInput.fill("سند فقط پروژه ب");
  await expect(page.getByTestId("project-source-result-file")).toContainText("سند فقط پروژه ب");
  await expect(page.getByText("سند فقط پروژه الف")).toHaveCount(0);
  await searchInput.fill("نشانه فقط پروژه ب");
  await expect(page.getByTestId("project-source-result-memory")).toContainText("نشانه فقط پروژه ب");
  await expect(page.getByText("نشانه فقط پروژه الف")).toHaveCount(0);
});

test("local project search reports an incomplete read instead of claiming an empty source set", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const nativeGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function getItem(key: string) {
      if (this === window.localStorage) {
        throw new DOMException("Storage read failed", "SecurityError");
      }
      return nativeGetItem.call(this, key);
    };
  });

  await enterBuilderHome(page);
  await page.getByTestId("capability-cluster").click();
  await page.getByTestId("source-search-tool").click();
  await expect(page.getByTestId("project-source-search-read-error")).toContainText("بازیابی محلی کامل نشد");
  await expect(page.getByTestId("project-source-search-empty")).toContainText("نبودن حافظه یا فایل را قطعی فرض نکن");
  await expect(page.getByText("هنوز منبع محلی ثبت نشده")).toHaveCount(0);
  await page.getByTestId("project-source-search-input").fill("بتن");
  await expect(page.getByTestId("project-source-search-no-results")).toContainText("نبودن این عبارت را قطعی فرض نکن");
});

test("mock source answer is explicit, read-only, traceable, and isolated from project data", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const consoleFailures: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") consoleFailures.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => consoleFailures.push(`pageerror: ${error.message}`));
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("این پیش‌نویس باید باقی بماند");

  const storageBefore = await page.evaluate(() => JSON.stringify(
    Object.keys(window.localStorage)
      .sort()
      .map((key) => [key, window.localStorage.getItem(key)]),
  ));
  const networkRequests: string[] = [];
  page.on("request", (request) => {
    const protocol = new URL(request.url()).protocol;
    if (protocol === "http:" || protocol === "https:") networkRequests.push(request.url());
  });

  await page.getByTestId("capability-cluster").click();
  const demoTool = page.getByTestId("source-answer-demo-tool");
  await expect(demoTool).toBeEnabled();
  await expect(demoTool).toContainText("پاسخ منبع‌دار · نمونه");
  await expect(demoTool).toContainText("بدون وب، فایل یا هوش مصنوعی");
  await demoTool.click();

  const demoView = page.getByTestId("project-source-answer-demo-view");
  await expect(demoView).toBeVisible();
  await expect(demoView).toContainText("نسخهٔ نمایشی");
  await expect(page.getByTestId("source-answer-demo-banner")).toContainText("تمام پاسخ و منابع این صفحه ساختگی‌اند");
  await expect(page.getByTestId("source-answer-demo-banner")).toContainText("هیچ فایل، وب یا مدل هوش مصنوعی اجرا نشده است");
  await expect(page.getByTestId("source-answer-demo-question")).toContainText("عایق نمایشی «آلفا»");
  await expect(page.getByTestId("source-answer-demo-answer")).toContainText("جمع‌بندی نمایشی چیدا");
  await expect(page.getByTestId("source-answer-demo-answer")).toContainText("ساختگی و برای اجرا نامعتبر");
  await expect(page.getByTestId("source-answer-demo-fallback")).toContainText("پاسخ واقعی فعلاً در دسترس نیست");
  await expect(page.getByTestId("source-answer-demo-source")).toHaveCount(2);
  await expect(page.getByTestId("source-answer-demo-source").first()).toHaveAccessibleName(/منبع ساختگی.*نسخه.*تاریخ نمونه/);
  await expect(demoView.locator("a[href]")).toHaveCount(0);

  const bannerBox = await page.getByTestId("source-answer-demo-banner").boundingBox();
  const backBox = await page.getByTestId("source-answer-demo-back").boundingBox();
  if (!bannerBox || !backBox) throw new Error("Mock answer controls are not rendered");
  expect(bannerBox.y + bannerBox.height).toBeLessThanOrEqual(844);
  expect(backBox.width).toBeGreaterThanOrEqual(44);
  expect(backBox.height).toBeGreaterThanOrEqual(44);
  expect(await demoView.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

  const firstSource = page.getByTestId("source-answer-demo-source").first();
  await firstSource.click();
  const sourceSheet = page.getByTestId("source-answer-demo-detail");
  await expect(sourceSheet).toBeVisible();
  await expect(sourceSheet).toContainText("منبع ساختگی [۱]");
  await expect(sourceSheet).toContainText("نوع منبع نمونه");
  await expect(sourceSheet).toContainText("نسخهٔ سند نمونه");
  await expect(sourceSheet).toContainText("تاریخ منبع نمونه");
  await expect(sourceSheet).toContainText("بازیابی واقعی انجام نشده");
  await expect(sourceSheet.locator("a[href]")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(firstSource).toBeFocused();

  const storageAfter = await page.evaluate(() => JSON.stringify(
    Object.keys(window.localStorage)
      .sort()
      .map((key) => [key, window.localStorage.getItem(key)]),
  ));
  expect(storageAfter).toBe(storageBefore);
  expect(networkRequests).toEqual([]);

  await page.getByTestId("source-answer-demo-back").click();
  await expect(page.getByTestId("builder-home")).toBeVisible();
  await expect(page.getByTestId("composer-input")).toHaveValue("این پیش‌نویس باید باقی بماند");
  expect(consoleFailures).toEqual([]);
});

test("project files and memory stay read-only after local records fail to parse", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.evaluate(() => {
    window.localStorage.setItem("chida-prototype-project-files:v1", "{فایل‌های قدیمی ناخوانا");
    window.localStorage.setItem("chida-prototype-project-memories:v1", "{حافظهٔ قدیمی ناخوانا");
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();

  await expect(page.getByTestId("project-files-entry")).toContainText("بازیابی محلی کامل نشد");
  await expect(page.getByTestId("project-memory-entry")).toContainText("بازیابی محلی کامل نشد");

  await page.getByTestId("project-files-entry").click();
  await expect(page.getByTestId("project-files-read-error")).toContainText("جلوگیری از بازنویسی داده‌های قبلی");
  await expect(page.getByTestId("project-file-add")).toBeDisabled();
  await expect(page.getByTestId("project-file-input")).toBeDisabled();
  await expect(page.getByText("هنوز فایلی ثبت نشده")).toHaveCount(0);
  await page.getByTestId("project-files-back").click();

  await page.getByTestId("project-gallery-entry").click();
  await expect(page.getByTestId("project-gallery-read-error")).toContainText("جلوگیری از بازنویسی داده‌های قبلی");
  await expect(page.getByTestId("project-gallery-add")).toBeDisabled();
  await expect(page.getByTestId("project-camera-add")).toBeDisabled();
  await expect(page.getByText("هنوز عکسی ثبت نشده")).toHaveCount(0);
  await page.getByTestId("project-gallery-back").click();

  await page.getByTestId("project-memory-entry").click();
  await expect(page.getByTestId("project-memory-read-error")).toContainText("جلوگیری از بازنویسی داده‌های قبلی");
  await expect(page.getByTestId("project-memory-add")).toBeDisabled();
  await expect(page.getByText("هنوز چیزی ثبت نشده")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1"))).toBe("{فایل‌های قدیمی ناخوانا");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).toBe("{حافظهٔ قدیمی ناخوانا");
});

test("builder home keeps composer controls aligned and exposes the core sheets", async ({ page }) => {
  await enterBuilderHome(page);

  const card = await page.getByTestId("composer-card").boundingBox();
  const context = await page.getByTestId("project-context").boundingBox();
  const plus = await page.getByTestId("attach-button").boundingBox();
  const gauge = await page.getByTestId("model-button").boundingBox();
  const menu = await page.getByTestId("menu-button").boundingBox();
  const project = await page.getByTestId("project-switcher").boundingBox();
  if (!card || !context || !plus || !gauge || !menu || !project) throw new Error("Required home controls are not rendered");

  expect(Math.abs(context.y - (card.y + card.height))).toBeLessThanOrEqual(1.5);
  expect(context.x).toBeGreaterThan(card.x);
  expect(context.width).toBeLessThan(card.width);
  expect(plus.x).toBeGreaterThan(gauge.x);
  expect(Math.abs(plus.x - (gauge.x + gauge.width))).toBeLessThanOrEqual(8);
  expect(plus.width).toBeGreaterThanOrEqual(48);
  expect(gauge.width).toBeGreaterThanOrEqual(48);
  expect(menu.x).toBeGreaterThan(project.x + project.width);
  await expect(page.getByTestId("profile-button")).toHaveCount(0);
  await expect(page.getByTestId("send-button").locator("svg.lucide-arrow-up")).toBeVisible();
  await expect(page.getByTestId("capability-cluster")).toContainText("ابزارها");

  await page.getByTestId("attach-button").click();
  const composerFileAttachment = page.getByTestId("composer-file-attachment");
  await expect(composerFileAttachment).toBeDisabled();
  await expect(composerFileAttachment).toContainText("به‌زودی");
  await expect(composerFileAttachment).toContainText("اسناد پروژه");
  await page.keyboard.press("Escape");

  await page.getByTestId("model-button").click();
  await expect(page.getByTestId("model-sheet")).toBeVisible();
  await expect(page.getByRole("button", { name: /خودکار بهترین حالت/ })).toHaveAttribute("data-selected", "true");
  await page.getByRole("button", { name: /عمیق تحلیل کامل‌تر/ }).click();
  await expect(page.getByTestId("model-button")).toHaveAttribute("aria-label", "حالت پاسخ: عمیق");

  await page.getByTestId("capability-cluster").click();
  await expect(page.getByTestId("tools-sheet")).toBeVisible();
  const sourceSearchTool = page.getByTestId("source-search-tool");
  await expect(sourceSearchTool).toBeEnabled();
  await expect(sourceSearchTool).toContainText("جست‌وجوی محلی پروژه");
  await page.keyboard.press("Escape");

  await page.getByTestId("menu-button").click();
  const drawer = page.getByTestId("nav-drawer");
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText("پروژه‌ها");
  await expect(drawer).toContainText("پین‌شده‌ها");
  await expect(drawer).toContainText("امکانات چیدا");
  const drawerBox = await drawer.boundingBox();
  const appBox = await page.getByTestId("builder-home").boundingBox();
  if (!drawerBox || !appBox) throw new Error("Drawer geometry is unavailable");
  expect(drawerBox.width).toBeGreaterThanOrEqual(320);
  expect(drawerBox.width).toBeLessThanOrEqual(360);
  await expect.poll(async () => {
    const settledDrawer = await drawer.boundingBox();
    const settledApp = await page.getByTestId("builder-home").boundingBox();
    if (!settledDrawer || !settledApp) return Number.POSITIVE_INFINITY;
    return Math.abs(settledDrawer.x + settledDrawer.width - (settledApp.x + settledApp.width));
  }).toBeLessThanOrEqual(1.5);
});

test("project context, dark-only settings, keyboard attachment, and local send all react", async ({ page }) => {
  await enterBuilderHome(page);

  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /برج نیلوفر تهران/ }).click();
  await expect(page.getByTestId("project-workspace")).toBeVisible();
  await page.getByTestId("project-space-continue").click();
  await expect(page.getByTestId("project-switcher")).toContainText("برج نیلوفر");
  await expect(page.getByTestId("project-context")).toContainText("برج نیلوفر");
  await expect(page.getByTestId("composer-input")).toHaveAttribute("placeholder", "پیامت برای برج نیلوفر...");

  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-profile").click();
  await expect(page.getByRole("heading", { name: "پروفایل و تنظیمات" })).toBeVisible();
  await expect(page.getByTestId("settings-profile-image")).toBeVisible();
  await expect(page.getByTestId("settings-profile-image")).toHaveAttribute("src", /profile-builder-fictional\.jpg$/);
  await expect(page.getByTestId("settings-usage-section")).toContainText("مصرف و داده‌های محلی");
  await expect(page.getByTestId("settings-usage-section")).toContainText("۱ پروژه");
  await expect(page.getByTestId("settings-local-record-count")).toContainText("۰ رکورد");
  await expect(page.getByTestId("settings-privacy-section")).toContainText("فقط همین مرورگر");
  await expect(page.getByTestId("settings-brief-section")).toContainText("تنظیم نشده");
  await expect(page.getByTestId("settings-model-section")).toContainText("خودکار");
  await expect(page.getByTestId("settings-version-section")).toContainText("۰.۱.۰");
  await expect(page.getByTestId("settings-theme-toggle")).toHaveCount(0);
  await expect(page.getByTestId("settings-appearance-section")).toContainText("Dark");
  await expect(page.locator("html")).toHaveAttribute("data-chida-theme", "dark");
  await page.keyboard.press("Escape");

  await page.getByTestId("composer-input").click();
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "true");
  await page.getByTestId("composer-input").fill("برنامه خرید فردا را آماده کن");
  await page.getByTestId("send-button").click();
  await expect(page.getByText("برنامه خرید فردا را آماده کن")).toBeVisible();
  await expect(page.getByText(/برای «برج نیلوفر» گرفتم/)).toBeVisible();
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
});

test("Build creates a safe project plugin and installs its skill in the prototype", async ({ page }) => {
  await enterBuilderHome(page);

  await page.getByTestId("capability-cluster").click();
  await page.getByTestId("build-tool-entry").click();
  await expect(page.getByTestId("build-flow")).toHaveAttribute("data-step", "define");

  await page.getByTestId("build-name-input").fill("رهگیر جریان نقدی");
  await page.getByTestId("build-description-input").fill("هزینه‌های ۳۰ روز آینده را جمع‌بندی و انحراف بودجه را هشدار بده");
  await page.getByTestId("build-start-button").click();

  await expect(page.getByTestId("build-flow")).toHaveAttribute("data-step", "preview");
  await expect(page.getByTestId("build-stage-spec")).toHaveAttribute("data-state", "complete");
  await expect(page.getByTestId("build-stage-plugin")).toHaveAttribute("data-state", "complete");
  await expect(page.getByTestId("build-stage-skill")).toHaveAttribute("data-state", "complete");
  await expect(page.getByTestId("build-flow")).toContainText("بدون اجرای کد آزاد");
  await expect(page.getByTestId("build-flow")).toContainText("بودجه و هزینه‌های پروژه");

  await page.getByTestId("build-install-button").click();
  await expect(page.getByTestId("build-flow")).toHaveAttribute("data-step", "installed");
  await expect(page.getByTestId("plugin-install-status")).toHaveAttribute("data-state", "installed");
  await expect(page.getByTestId("skill-install-status")).toHaveAttribute("data-state", "installed");
  await page.getByTestId("build-done-button").click();

  await page.getByTestId("capability-cluster").click();
  await expect(page.getByTestId("installed-tool-row")).toContainText("رهگیر جریان نقدی");
});

test("Brief saves a weekly cadence, closes, and keeps its summary visible in the drawer", async ({ page }) => {
  await enterBuilderHome(page);

  await page.getByTestId("menu-button").click();
  await expect(page.getByTestId("drawer-brief-entry")).toBeVisible();
  await page.getByTestId("drawer-brief-entry").click();
  await expect(page.getByTestId("brief-panel")).toBeVisible();

  await page.getByTestId("brief-frequency-weekly").click();
  await page.getByTestId("brief-weekday-select").selectOption("شنبه");
  await page.getByTestId("brief-time-input").fill("09:00");
  await page.getByTestId("brief-save-button").click();
  await expect(page.getByTestId("brief-panel")).toBeHidden();

  await page.getByTestId("menu-button").click();
  await expect(page.getByTestId("drawer-brief-summary")).toContainText("هفتگی");
  await expect(page.getByTestId("drawer-brief-summary")).toContainText("شنبه");
});

test("Brief stays open and preserves the previous schedule when local persistence fails", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-brief-entry").click();
  await page.getByTestId("brief-frequency-daily").click();
  await page.getByTestId("brief-time-input").fill("08:30");
  await page.getByTestId("brief-save-button").click();
  const savedSchedule = await page.evaluate(() => window.localStorage.getItem("chida-prototype-brief"));

  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-brief-entry").click();
  await page.getByTestId("brief-frequency-weekly").click();
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-brief") throw new DOMException("Brief write failed", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("brief-save-button").click();
  await expect(page.getByTestId("brief-panel")).toBeVisible();
  await expect(page.getByTestId("brief-save-error")).toContainText("ذخیره نشد");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-brief"))).toBe(savedSchedule);
});

test("builder keeps project tasks out of chat with persistent status history", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const activeProjectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  await page.getByTestId("composer-input").fill("این پیش‌نویس باید بعد از رفت‌وبرگشت بماند");

  await page.getByTestId("menu-button").click();
  await expect(page.getByTestId("drawer-task-count")).toHaveText("۰");
  await page.getByTestId("drawer-tasks-entry").click();

  const taskCenter = page.getByTestId("project-tasks-view");
  await expect(taskCenter).toBeVisible();
  await expect(taskCenter).toContainText("کارهای برج نیلوفر");
  await expect(page.getByTestId("project-task-filter-active")).toContainText("در حال انجام");
  await expect(page.getByTestId("project-task-filter-approval")).toContainText("منتظر تأیید");
  await expect(page.getByTestId("project-task-filter-completed")).toContainText("تمام‌شده");
  await expect(page.getByTestId("project-task-filter-failed")).toContainText("ناموفق");
  await expect(page.getByTestId("project-task-filter-monitor")).toContainText("پایش‌ها");
  expect(await page.locator(".project-task-filters").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  await expect(page.getByTestId("project-task-empty")).toContainText("هنوز کار در حال انجامی ثبت نشده");
  await expect(taskCenter).toContainText("اجرا، اعلان و انتخاب تأمین‌کننده هنوز وصل نیست");
  expect(await taskCenter.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

  const backBox = await page.getByTestId("project-tasks-back").boundingBox();
  const addBox = await page.getByTestId("project-task-add").boundingBox();
  if (!backBox || !addBox) throw new Error("Task center controls are not rendered");
  expect(backBox.width).toBeGreaterThanOrEqual(44);
  expect(backBox.height).toBeGreaterThanOrEqual(44);
  expect(addBox.height).toBeGreaterThanOrEqual(44);

  await page.getByTestId("project-task-filter-monitor").click();
  await expect(page.getByTestId("project-task-empty")).toContainText("پایش واقعی هنوز به این مرکز وصل نیست");
  await page.getByTestId("project-task-filter-active").click();

  await page.getByTestId("project-task-add").click();
  await expect(page.getByTestId("project-task-editor-sheet")).toBeVisible();
  await expect(page.getByTestId("project-task-step-input")).toHaveCSS("font-size", "16px");
  await expect(page.getByTestId("project-task-step-input")).toHaveCSS("background-color", "rgb(18, 17, 16)");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("project-task-add")).toBeFocused();
  await page.mouse.click(backBox.x + backBox.width / 2, backBox.y + backBox.height / 2);
  await expect(page.getByTestId("composer-input")).toBeVisible();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-add").click();
  await page.getByTestId("project-task-title-input").fill("\u200c\u200b");
  await page.getByTestId("project-task-step-input").fill("\u200c\u200b");
  await page.getByTestId("project-task-save").click();
  await expect(page.getByTestId("project-task-title-error")).toContainText("عنوان کار");
  await expect(page.getByTestId("project-task-step-error")).toContainText("گام بعدی");
  await page.getByTestId("project-task-title-input").fill("پیگیری تأیید نقشه سازه");
  await page.getByTestId("project-task-step-input").fill("هماهنگی جلسه با مهندس محاسب");
  await page.getByTestId("project-task-due-input").fill("۱۴۰۵/۰۶/۱۵");
  await page.getByTestId("project-task-save").click();

  const taskCard = page.getByTestId("project-task-card");
  await expect(taskCard).toHaveCount(1);
  await expect(taskCard).toContainText("پیگیری تأیید نقشه سازه");
  await expect(taskCard).toContainText("در حال انجام");
  await expect(taskCard).toContainText("موعد اتمام");
  await expect(taskCard).toContainText("۱۴۰۵/۰۶/۱۵");
  await expect(taskCard).toContainText("نسخهٔ ۱");
  const createdTask = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-tasks:v1") ?? "[]")[0]);
  expect(createdTask).toMatchObject({
    projectId: activeProjectId,
    title: "پیگیری تأیید نقشه سازه",
    currentStep: "هماهنگی جلسه با مهندس محاسب",
    dueDate: "۱۴۰۵/۰۶/۱۵",
    status: "in-progress",
    source: "ثبت مستقیم شما",
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    version: 1,
    completedAt: null,
  });
  expect(createdTask.history).toHaveLength(1);

  await taskCard.click();
  const taskDetail = page.getByTestId("project-task-detail-view");
  await expect(taskDetail).toBeVisible();
  await expect(taskDetail).toContainText("ثبت مستقیم شما");
  await expect(taskDetail).toContainText("خصوصی پروژه");
  await expect(taskDetail).toContainText("ثبت محلی");
  await expect(taskDetail).toContainText("۱۴۰۵/۰۶/۱۵");
  await expect(taskDetail).toContainText("نسخهٔ ۱");
  await expect(page.getByTestId("project-task-history-event")).toHaveCount(1);
  await page.getByTestId("project-task-edit").click();
  await expect(page.getByTestId("project-task-editor-sheet")).toBeVisible();
  await expect(page.getByTestId("project-task-title-input")).toHaveValue("پیگیری تأیید نقشه سازه");
  await page.getByTestId("project-task-title-input").fill("پیگیری نقشه سازه و معماری");
  await page.getByTestId("project-task-step-input").fill("دریافت امضای مهندس محاسب");
  await page.getByTestId("project-task-due-input").fill("۱۴۰۵/۰۶/۲۰");
  await page.getByTestId("project-task-save").click();
  await expect(page.getByTestId("project-task-editor-sheet")).toBeHidden();
  await expect(taskDetail).toContainText("پیگیری نقشه سازه و معماری");
  await expect(taskDetail).toContainText("دریافت امضای مهندس محاسب");
  await expect(taskDetail).toContainText("۱۴۰۵/۰۶/۲۰");
  await expect(taskDetail).toContainText("نسخهٔ ۲");
  await expect(page.getByTestId("project-task-history-event")).toHaveCount(2);
  await expect(page.getByTestId("project-task-history-event").first()).toContainText("کار ویرایش شد");
  const editedTaskSnapshot = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"));
  await page.getByTestId("project-task-edit").click();
  await page.getByTestId("project-task-save").click();
  await expect(page.getByTestId("project-task-editor-sheet")).toBeHidden();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"))).toBe(editedTaskSnapshot);
  await expect(taskDetail).toContainText("نسخهٔ ۲");
  await expect(page.getByTestId("project-task-history-event")).toHaveCount(2);
  await page.getByTestId("project-task-status-toggle").click();
  await expect(taskDetail).toContainText("تمام‌شده");
  await expect(taskDetail).toContainText("آخرین گام ثبت‌شده");
  await expect(taskDetail).toContainText("نسخهٔ ۳");
  await expect(page.getByTestId("project-task-history-event")).toHaveCount(3);
  const completedTask = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-tasks:v1") ?? "[]")[0]);
  expect(completedTask.status).toBe("completed");
  expect(completedTask.version).toBe(3);
  expect(completedTask.title).toBe("پیگیری نقشه سازه و معماری");
  expect(completedTask.dueDate).toBe("۱۴۰۵/۰۶/۲۰");
  expect(completedTask.completedAt).toEqual(expect.any(String));
  expect(completedTask.history).toHaveLength(3);

  await page.getByTestId("project-task-detail-back").click();
  await page.getByTestId("project-tasks-back").click();
  await expect(page.getByTestId("builder-home")).toBeVisible();
  await expect(page.getByTestId("composer-input")).toHaveValue("این پیش‌نویس باید بعد از رفت‌وبرگشت بماند");

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("menu-button").click();
  await expect(page.getByTestId("drawer-task-count")).toHaveText("۰");
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-completed").click();
  await expect(page.getByTestId("project-task-card")).toContainText("پیگیری نقشه سازه و معماری");
  await expect(page.getByTestId("project-task-card")).toContainText("تکمیل");
  await page.getByTestId("project-task-card").click();
  await page.getByTestId("project-task-status-toggle").click();
  await expect(page.getByTestId("project-task-detail-view")).toContainText("در حال انجام");
  await expect(page.getByTestId("project-task-detail-view")).toContainText("نسخهٔ ۴");
  await expect(page.getByTestId("project-task-history-event")).toHaveCount(4);
});

test("task center keeps every record inside its active project", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    const projectBase = { usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-27T08:00:00.000Z" };
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify([
      { ...projectBase, id: "project-task-a", name: "پروژه الف", location: "ونک", stage: "فونداسیون" },
      { ...projectBase, id: "project-task-b", name: "پروژه ب", location: "جردن", stage: "نازک کاری و نما" },
    ]));
    window.localStorage.setItem("chida-prototype-active-project", "project-task-a");
    const timestamp = "2026-08-27T09:00:00.000Z";
    const taskBase = {
      status: "in-progress",
      source: "ثبت مستقیم شما",
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: null,
    };
    window.localStorage.setItem("chida-prototype-project-tasks:v1", JSON.stringify([
      { ...taskBase, id: "task-a", projectId: "project-task-a", title: "کار فقط پروژه الف", currentStep: "گام پروژه الف", history: [{ id: "event-a", type: "created", actor: "شما", at: timestamp, version: 1 }] },
      { ...taskBase, id: "task-b", projectId: "project-task-b", title: "کار فقط پروژه ب", currentStep: "گام پروژه ب", history: [{ id: "event-b", type: "created", actor: "شما", at: timestamp, version: 1 }] },
    ]));
  });

  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await expect(page.getByText("کار فقط پروژه الف")).toBeVisible();
  await expect(page.getByTestId("project-task-card")).toContainText("موعد اتمام: تعیین نشده");
  await expect(page.getByText("کار فقط پروژه ب")).toHaveCount(0);

  await page.getByTestId("project-tasks-back").click();
  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /پروژه ب تهران/ }).click();
  await page.getByTestId("project-space-back").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await expect(page.getByText("کار فقط پروژه ب")).toBeVisible();
  await expect(page.getByText("کار فقط پروژه الف")).toHaveCount(0);
});

test("task storage failures stay distinct from an empty task center and block mutations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const nativeGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function getItem(key: string) {
      if (this === window.localStorage && key === "chida-prototype-project-tasks:v1") {
        throw new DOMException("Task storage read failed", "SecurityError");
      }
      return nativeGetItem.call(this, key);
    };
  });

  await enterBuilderHome(page);
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await expect(page.getByTestId("project-task-read-error")).toContainText("کارهای محلی کامل خوانده نشد");
  await expect(page.getByTestId("project-task-add")).toBeDisabled();
  await expect(page.getByTestId("project-task-filter-active")).toContainText("!");
  await expect(page.getByTestId("project-task-filter-approval")).toContainText("۰");
  await expect(page.getByTestId("project-task-empty")).toHaveCount(0);
});

test("task creation never reports success when local persistence fails", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-add").click();
  await page.getByTestId("project-task-title-input").fill("کاری که نباید ثبت‌شده دیده شود");
  await page.getByTestId("project-task-step-input").fill("ذخیرهٔ امن در مرورگر");
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-tasks:v1") {
        throw new DOMException("Task storage write failed", "QuotaExceededError");
      }
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("project-task-save").click();
  await expect(page.getByTestId("project-task-editor-sheet")).toBeVisible();
  await expect(page.getByTestId("project-task-storage-error")).toContainText("ذخیره نشد");
  await expect(page.getByTestId("project-task-card")).toHaveCount(0);
});

test("task editing keeps the previous version when local persistence fails", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-add").click();
  await page.getByTestId("project-task-title-input").fill("نسخهٔ قابل اتکا");
  await page.getByTestId("project-task-step-input").fill("گام قبلی باید حفظ شود");
  await page.getByTestId("project-task-due-input").fill("۱۴۰۵/۰۶/۲۵");
  await page.getByTestId("project-task-save").click();
  await page.getByTestId("project-task-card").click();
  const persistedTask = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"));

  await page.getByTestId("project-task-edit").click();
  await page.getByTestId("project-task-title-input").fill("نسخه‌ای که نباید ثبت شود");
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-tasks:v1") throw new DOMException("Task edit write failed", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("project-task-save").click();

  await expect(page.getByTestId("project-task-editor-sheet")).toBeVisible();
  await expect(page.getByTestId("project-task-storage-error")).toContainText("نسخهٔ قبلی دست‌نخورده ماند");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"))).toBe(persistedTask);
});

test("task parser treats duplicate local records as an incomplete read", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const timestamp = "2026-08-27T09:00:00.000Z";
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify([{
      id: "project-task-corrupt",
      name: "برج نیلوفر",
      location: "سعادت‌آباد",
      stage: "اسکلت بندی",
      usage: "",
      landArea: "",
      builtArea: "",
      aboveGroundFloors: "",
      basementFloors: "",
      unitCount: "",
      createdAt: "2026-08-27T08:00:00.000Z",
    }]));
    window.localStorage.setItem("chida-prototype-active-project", "project-task-corrupt");
    const task = {
      id: "task-duplicate",
      projectId: "project-task-corrupt",
      title: "رکورد معتبر نخست",
      currentStep: "بررسی رکوردهای ذخیره‌شده",
      status: "in-progress",
      source: "ثبت مستقیم شما",
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: null,
      history: [{ id: "task-event-valid", type: "created", actor: "شما", at: timestamp, version: 1 }],
    };
    window.localStorage.setItem("chida-prototype-project-tasks:v1", JSON.stringify([
      task,
      { ...task, title: "شناسهٔ تکراری", history: [{ ...task.history[0], id: "task-event-duplicate" }] },
    ]));
  });

  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("menu-button").click();
  await expect(page.getByTestId("drawer-task-count")).toHaveText("!");
  await expect(page.getByTestId("drawer-task-count")).toHaveAccessibleName("بازیابی کارها کامل نشد");
  await page.getByTestId("drawer-tasks-entry").click();
  await expect(page.getByTestId("project-task-read-error")).toContainText("کارهای محلی کامل خوانده نشد");
  await expect(page.getByTestId("project-task-add")).toBeDisabled();
  await expect(page.getByTestId("project-task-filter-active")).toContainText("!");
  await expect(page.getByTestId("project-task-filter-approval")).toContainText("۰");
  await expect(page.getByTestId("project-task-card")).toHaveCount(0);
});

test("a present but blank task store is a read error instead of an empty center", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.setItem("chida-prototype-project-tasks:v1", ""));
  await enterBuilderHome(page);
  await page.getByTestId("menu-button").click();
  await expect(page.getByTestId("drawer-task-count")).toHaveText("!");
  await page.getByTestId("drawer-tasks-entry").click();
  await expect(page.getByTestId("project-task-read-error")).toContainText("کارهای محلی کامل خوانده نشد");
  await expect(page.getByTestId("project-task-add")).toBeDisabled();
  await expect(page.getByTestId("project-task-filter-active")).toContainText("!");
  await expect(page.getByTestId("project-task-filter-approval")).toContainText("۰");
  await expect(page.getByTestId("project-task-empty")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"))).toBe("");
});

test("task status stays unchanged when its new version cannot persist", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-add").click();
  await page.getByTestId("project-task-title-input").fill("پیگیری نسخهٔ ذخیره‌نشده");
  await page.getByTestId("project-task-step-input").fill("تغییر وضعیت فقط پس از ذخیرهٔ موفق");
  await page.getByTestId("project-task-save").click();
  await page.getByTestId("project-task-card").click();
  const persistedTask = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"));
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-tasks:v1") {
        throw new DOMException("Task status write failed", "QuotaExceededError");
      }
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("project-task-status-toggle").click();
  const detail = page.getByTestId("project-task-detail-view");
  await expect(page.getByTestId("project-task-storage-error")).toContainText("تغییر وضعیت ذخیره نشد");
  await expect(detail).toContainText("در حال انجام · نسخهٔ ۱");
  await expect(detail).not.toContainText("تمام‌شده · نسخهٔ ۲");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"))).toBe(persistedTask);
});

test("purchase request opens simple, preserves advanced values, and keeps detail progressive", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-purchase-request").click();

  await expect(page.getByTestId("purchase-request-mode-simple")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("purchase-request-mode-advanced")).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("purchase-request-item-input")).toBeVisible();
  await expect(page.getByTestId("purchase-request-delivery-area-input")).toBeVisible();
  await expect(page.getByTestId("purchase-request-brand-input")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-transport-input")).toHaveCount(0);

  await page.getByTestId("purchase-request-raw-input").fill("پنج تن میلگرد برای ادامهٔ اسکلت لازم است");
  await page.getByTestId("purchase-request-item-input").fill("میلگرد آجدار");
  await page.getByTestId("purchase-request-quantity-input").fill("۵");
  await chooseProjectOption(page, "purchase-request-unit-select", "تن");
  await page.getByTestId("purchase-request-delivery-area-input").fill("غرب تهران");
  await page.getByTestId("purchase-request-mode-advanced").click();
  await page.getByTestId("purchase-request-brand-input").fill("A3");
  await page.getByTestId("purchase-request-transport-input").fill("تحویل در کارگاه");
  await page.getByTestId("purchase-request-mode-simple").click();
  await expect(page.getByTestId("purchase-request-brand-input")).toHaveCount(0);
  await page.getByTestId("purchase-request-mode-advanced").click();
  await expect(page.getByTestId("purchase-request-brand-input")).toHaveValue("A3");
  await expect(page.getByTestId("purchase-request-transport-input")).toHaveValue("تحویل در کارگاه");
  await page.getByTestId("purchase-request-mode-simple").click();
  await page.getByTestId("purchase-request-save").click();

  await expect(page.getByTestId("purchase-request-detail-mode-simple")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("purchase-request-detail-mode-advanced")).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("purchase-request-product-items")).toContainText("۵ تن");
  await expect(page.getByTestId("purchase-request-product-items")).not.toContainText("A3");
  await expect(page.getByTestId("purchase-request-clarifications")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-history")).toHaveCount(0);
  await page.getByTestId("purchase-request-detail-mode-advanced").click();
  await expect(page.getByTestId("purchase-request-product-items")).toContainText("A3");
  await expect(page.getByTestId("purchase-request-terms")).toContainText("تحویل در کارگاه");
  await expect(page.getByTestId("purchase-request-clarifications")).toBeVisible();
  await expect(page.getByTestId("purchase-request-history")).toBeVisible();
});

test("simple service request shows only essential fields and saves the rest as explicit unknowns", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-purchase-request").click();
  await page.getByTestId("purchase-request-kind-service").click();

  await expect(page.getByTestId("purchase-request-service-scope-input")).toBeVisible();
  await expect(page.getByTestId("purchase-request-service-location-input")).toBeVisible();
  await expect(page.getByTestId("purchase-request-service-size-input")).toBeVisible();
  await expect(page.getByTestId("purchase-request-service-timing-input")).toBeVisible();
  await expect(page.getByTestId("purchase-request-service-method-input")).toHaveCount(0);
  await page.getByTestId("purchase-request-raw-input").fill("اجرای عایق رطوبتی بام لازم است");
  await page.getByTestId("purchase-request-service-scope-input").fill("اجرای عایق دولایهٔ بام");
  await page.getByTestId("purchase-request-service-location-input").fill("بام پروژه");
  await page.getByTestId("purchase-request-service-size-input").fill("۸۵۰ مترمربع");
  await page.getByTestId("purchase-request-service-timing-input").fill("تا پایان شهریور");
  await page.getByTestId("purchase-request-save").click();

  const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]")[0]);
  expect(stored.service).toMatchObject({ scope: "اجرای عایق دولایهٔ بام", location: "بام پروژه", sizeOrVolume: "۸۵۰ مترمربع", qualification: null, timing: "تا پایان شهریور", method: null, inScope: null, outOfScope: null, warranty: null, paymentTerms: null });
  expect(stored.clarificationAnswers.length).toBeGreaterThan(0);
  await expect(page.getByTestId("purchase-request-ready")).toBeEnabled();
});

test("builder creates, completes, and readies a private local purchase request without sending it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const consoleFailures: string[] = [];
  const networkRequests: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") consoleFailures.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => consoleFailures.push(`pageerror: ${error.message}`));
  await enterBuilderHome(page);
  const taskStoreBefore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"));
  await page.getByTestId("composer-input").fill("این پیش‌نویس گفتگو باید باقی بماند");
  page.on("request", (request) => {
    const protocol = new URL(request.url()).protocol;
    if (protocol === "http:" || protocol === "https:") networkRequests.push(request.url());
  });

  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  const requestsView = page.getByTestId("project-purchase-requests-view");
  await expect(requestsView).toBeVisible();
  await expect(requestsView).toContainText("درخواست‌های خرید برج نیلوفر");
  await expect(requestsView).toContainText("تأیید داخلی هر نسخه ممکن است");
  await expect(requestsView).toContainText("مجوز ارسال و ارسال بیرونی هنوز وصل نیست");
  const editor = page.getByTestId("purchase-request-editor-sheet");
  await expect(editor).toBeVisible();
  await expect(page.getByTestId("purchase-request-raw-input")).toHaveCSS("font-size", "16px");
  expect(await editor.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  await page.getByTestId("purchase-request-save").click();
  await expect(page.getByTestId("purchase-request-raw-error")).toContainText("نیازت را بنویس");

  await page.getByTestId("purchase-request-raw-input").fill("۲۰٫۵ تن سیمان تیپ ۲ برای هفتهٔ آینده لازم داریم");
  await page.getByTestId("purchase-request-save").click();

  const detail = page.getByTestId("project-purchase-request-detail-view");
  await expect(detail).toBeVisible();
  await expect(page.getByTestId("purchase-request-detail-heading")).toBeFocused();
  expect(await detail.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  await expect(detail).toContainText("پیش‌نویس · نسخهٔ ۱");
  await expect(detail).toContainText("ارسال نشده");
  await expect(page.getByTestId("purchase-request-missing-fields")).toContainText("نام قلم");
  await expect(page.getByTestId("purchase-request-missing-fields")).toContainText("مقدار");
  await expect(page.getByTestId("purchase-request-missing-fields")).toContainText("واحد");
  await expect(page.getByTestId("purchase-request-ready")).toBeDisabled();

  let storedRequests = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]"));
  expect(storedRequests).toHaveLength(1);
  expect(storedRequests[0]).toMatchObject({
    projectId: expect.any(String),
    requestKind: "product",
    rawNeed: { text: "۲۰٫۵ تن سیمان تیپ ۲ برای هفتهٔ آینده لازم داریم", source: "ثبت مستقیم شما" },
    item: { name: null, quantity: null, unit: null, brandOrGrade: null, specification: null, alternatives: "unknown", source: "ثبت مستقیم شما", confidence: null },
    delivery: { city: "تهران", area: "نامشخص", exactAddressShared: false, neededBy: null },
    unresolvedTerms: { transport: "unknown", tax: "unknown", paymentTerms: "unknown" },
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    sharingStatus: "ارسال نشده",
    status: "draft",
    version: 1,
    readyAt: null,
  });
  expect(storedRequests[0].history).toHaveLength(1);

  await page.getByTestId("purchase-request-edit").click();
  await page.getByTestId("purchase-request-item-input").fill("سیمان تیپ ۲");
  await page.getByTestId("purchase-request-quantity-input").fill("۲۰٫۵");
  await chooseProjectOption(page, "purchase-request-unit-select", "تن");
  await page.getByTestId("purchase-request-mode-advanced").click();
  await page.getByTestId("purchase-request-brand-input").fill("گرید استاندارد ملی");
  await page.getByTestId("purchase-request-needed-by-input").fill("تا ۱۰ شهریور");
  await page.getByTestId("purchase-request-specification-input").fill("کیسه‌های سالم و تولید تازه باشد");
  await chooseProjectOption(page, "purchase-request-alternatives-select", "فقط با تأیید من");
  await page.getByTestId("purchase-request-save").click();

  await expect(detail).toContainText("پیش‌نویس · نسخهٔ ۲");
  await expect(page.getByTestId("purchase-request-detail-heading")).toBeFocused();
  await expect(page.getByTestId("purchase-request-missing-fields")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-ready")).toBeEnabled();
  await page.getByTestId("purchase-request-ready").click();
  await expect(detail).toContainText("آمادهٔ بازبینی · نسخهٔ ۳");
  await expect(page.getByTestId("purchase-request-detail-heading")).toBeFocused();
  await expect(detail).toContainText("این وضعیت تأیید یا مجوز ارسال نیست");
  await expect(page.getByTestId("purchase-request-edit")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-return-draft")).toBeVisible();
  await page.getByTestId("purchase-request-detail-mode-advanced").click();
  await expect(page.getByTestId("purchase-request-history-event")).toHaveCount(3);

  storedRequests = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]"));
  expect(storedRequests[0]).toMatchObject({
    item: { name: "سیمان تیپ ۲", quantity: "20.5", unit: "تن", brandOrGrade: "گرید استاندارد ملی", specification: "کیسه‌های سالم و تولید تازه باشد", alternatives: "approval-required" },
    delivery: { neededBy: "تا ۱۰ شهریور" },
    status: "ready-for-review",
    sharingStatus: "ارسال نشده",
    version: 3,
    readyAt: expect.any(String),
  });
  expect(storedRequests[0].history.map((event: { type: string }) => event.type)).toEqual(["created", "updated", "marked-ready-for-review"]);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"))).toBe(taskStoreBefore);
  expect(networkRequests).toEqual([]);

  await page.getByTestId("purchase-request-detail-back").click();
  await expect(page.getByTestId("purchase-request-card")).toContainText("سیمان تیپ ۲");
  await expect(page.getByTestId("purchase-request-card")).toBeFocused();
  await page.getByTestId("purchase-requests-back").click();
  await expect(page.getByTestId("quick-action-purchase-request")).toBeFocused();
  await expect(page.getByTestId("composer-input")).toHaveValue("این پیش‌نویس گفتگو باید باقی بماند");
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-approval").click();
  await expect(page.getByTestId("project-task-filter-approval")).toContainText("۰");
  await expect(page.getByTestId("project-task-empty")).toContainText("نسخه‌ای منتظر تأیید نیست");

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await expect(page.getByTestId("project-purchase-requests-entry")).toContainText("۱ درخواست ثبت‌شده");
  await page.getByTestId("project-purchase-requests-entry").click();
  await expect(page.getByTestId("purchase-request-card")).toContainText("آمادهٔ بازبینی");
  expect(await requestsView.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  await page.getByTestId("purchase-requests-back").click();
  await expect(page.getByTestId("project-purchase-requests-entry")).toBeFocused();
  expect(consoleFailures).toEqual([]);
});

test("purchase requests never cross the active project boundary", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    const projectBase = { usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-28T08:00:00.000Z" };
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify([
      { ...projectBase, id: "purchase-project-a", name: "پروژه الف", location: "ونک", stage: "فونداسیون" },
      { ...projectBase, id: "purchase-project-b", name: "پروژه ب", location: "جردن", stage: "نازک کاری و نما" },
    ]));
    window.localStorage.setItem("chida-prototype-active-project", "purchase-project-a");
  });
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await page.getByTestId("purchase-request-raw-input").fill("درخواست فقط پروژه الف");
  await page.getByTestId("purchase-request-save").click();
  await page.getByTestId("purchase-request-detail-back").click();
  await page.getByTestId("purchase-requests-back").click();

  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /پروژه ب تهران/ }).click();
  await page.getByTestId("project-space-back").click();
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("purchase-request-empty")).toContainText("هنوز درخواست خریدی ثبت نشده");
  await expect(page.getByText("درخواست فقط پروژه الف")).toHaveCount(0);
});

test("purchase request read failures stay distinct from an empty list and lock changes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const nativeGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function getItem(key: string) {
      if (this === window.localStorage && key === "chida-prototype-project-purchase-requests:v1") {
        throw new DOMException("Purchase request storage read failed", "SecurityError");
      }
      return nativeGetItem.call(this, key);
    };
  });
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await expect(page.getByTestId("purchase-request-read-error")).toContainText("درخواست‌های محلی کامل خوانده نشد");
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
  await expect(page.getByTestId("purchase-request-editor-sheet")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-empty")).toHaveCount(0);
});

test("purchase request write failure never reports a saved draft", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await page.getByTestId("purchase-request-raw-input").fill("پیش‌نویسی که نباید ذخیره شود");
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-purchase-requests:v1") {
        throw new DOMException("Purchase request write failed", "QuotaExceededError");
      }
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("purchase-request-save").click();
  await expect(page.getByTestId("purchase-request-editor-sheet")).toBeVisible();
  await expect(page.getByTestId("purchase-request-storage-error")).toContainText("پیش‌نویس ذخیره نشد");
  await expect(page.getByTestId("project-purchase-request-detail-view")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"))).toBeNull();
});

test("purchase request keeps a non-positive quantity out of local storage", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await page.getByTestId("purchase-request-raw-input").fill("ده کیسه چسب کاشی");
  await page.getByTestId("purchase-request-quantity-input").fill("۰");
  await page.getByTestId("purchase-request-save").click();
  await expect(page.getByTestId("purchase-request-quantity-input")).toBeFocused();
  await expect(page.getByText("مقدار باید یک عدد بیشتر از صفر باشد.")).toBeVisible();
  await expect(page.getByTestId("purchase-request-editor-sheet")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"))).toBeNull();
});

test("purchase request normalizes invisible optional text before reload", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await page.getByTestId("purchase-request-raw-input").fill("نیاز معتبر برای ثبت پیش‌نویس");
  await page.getByTestId("purchase-request-item-input").fill("\u200b\u200c");
  await page.getByTestId("purchase-request-mode-advanced").click();
  await page.getByTestId("purchase-request-brand-input").fill("\u200b");
  await page.getByTestId("purchase-request-specification-input").fill("\u200c\u2060");
  await page.getByTestId("purchase-request-needed-by-input").fill("\ufeff");
  await page.getByTestId("purchase-request-save").click();

  const storedRequest = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]")[0]);
  expect(storedRequest).toMatchObject({
    item: { name: null, brandOrGrade: null, specification: null },
    delivery: { neededBy: null },
  });

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-purchase-requests-entry").click();
  await expect(page.getByTestId("purchase-request-read-error")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-card")).toContainText("نیاز معتبر برای ثبت پیش‌نویس");
});

test("purchase request return-to-draft is versioned and never advances after a failed write", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await page.getByTestId("purchase-request-raw-input").fill("پنج تن میلگرد برای پروژه لازم است");
  await page.getByTestId("purchase-request-item-input").fill("میلگرد آجدار");
  await page.getByTestId("purchase-request-quantity-input").fill("۵");
  await chooseProjectOption(page, "purchase-request-unit-select", "تن");
  await page.getByTestId("purchase-request-save").click();
  await page.getByTestId("purchase-request-ready").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("آمادهٔ بازبینی · نسخهٔ ۲");

  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Object.defineProperty(window, "__purchaseRequestNativeSetItem", { value: nativeSetItem, configurable: true });
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-purchase-requests:v1") {
        throw new DOMException("Purchase request return write failed", "QuotaExceededError");
      }
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("purchase-request-return-draft").click();
  await expect(page.getByTestId("purchase-request-storage-error")).toContainText("بازگشت به ویرایش ذخیره نشد");
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("آمادهٔ بازبینی · نسخهٔ ۲");

  await page.evaluate(() => {
    Storage.prototype.setItem = (window as Window & { __purchaseRequestNativeSetItem: typeof Storage.prototype.setItem }).__purchaseRequestNativeSetItem;
    delete (window as Window & { __purchaseRequestNativeSetItem?: typeof Storage.prototype.setItem }).__purchaseRequestNativeSetItem;
  });
  await page.getByTestId("purchase-request-return-draft").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("پیش‌نویس · نسخهٔ ۳");
  await expect(page.getByTestId("purchase-request-detail-heading")).toBeFocused();
  await page.getByTestId("purchase-request-detail-mode-advanced").click();
  await expect(page.getByTestId("purchase-request-history-event")).toHaveCount(3);
  await expect(page.getByTestId("purchase-request-edit")).toBeVisible();
  const storedRequest = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]")[0]);
  expect(storedRequest.status).toBe("draft");
  expect(storedRequest.version).toBe(3);
  expect(storedRequest.history.map((event: { type: string }) => event.type)).toEqual(["created", "marked-ready-for-review", "returned-to-draft"]);
});

test("purchase request parser rejects duplicate records instead of showing a false list", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const at = "2026-08-28T09:00:00.000Z";
    const request = {
      id: "purchase-request-duplicate",
      projectId: "purchase-request-project",
      requestKind: "product",
      rawNeed: { text: "یک پیش‌نویس معتبر", source: "ثبت مستقیم شما", capturedAt: at },
      item: { id: "purchase-item-duplicate", name: null, quantity: null, unit: null, brandOrGrade: null, specification: null, alternatives: "unknown", source: "ثبت مستقیم شما", confidence: null },
      delivery: { city: "تهران", area: "سعادت‌آباد", exactAddressShared: false, neededBy: null },
      unresolvedTerms: { transport: "unknown", tax: "unknown", paymentTerms: "unknown" },
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      sharingStatus: "ارسال نشده",
      status: "draft",
      version: 1,
      createdAt: at,
      updatedAt: at,
      readyAt: null,
      history: [{ id: "purchase-event-one", type: "created", actor: "شما", at, version: 1 }],
    };
    window.localStorage.setItem("chida-prototype-project-purchase-requests:v1", JSON.stringify([
      request,
      { ...request, rawNeed: { ...request.rawNeed, text: "شناسهٔ تکراری" }, history: [{ ...request.history[0], id: "purchase-event-two" }] },
    ]));
  });
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await expect(page.getByTestId("purchase-request-read-error")).toContainText("درخواست‌های محلی کامل خوانده نشد");
  await expect(page.getByTestId("purchase-request-card")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
});

test("purchase request parser rejects an incomplete ready-for-review record", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const at = "2026-08-28T09:00:00.000Z";
    window.localStorage.setItem("chida-prototype-project-purchase-requests:v1", JSON.stringify([{
      id: "purchase-request-incomplete-ready",
      projectId: "purchase-request-project",
      requestKind: "product",
      rawNeed: { text: "یک درخواست ناقص که نباید آماده پذیرفته شود", source: "ثبت مستقیم شما", capturedAt: at },
      item: { id: "purchase-item-incomplete-ready", name: null, quantity: null, unit: null, brandOrGrade: null, specification: null, alternatives: "unknown", source: "ثبت مستقیم شما", confidence: null },
      delivery: { city: "تهران", area: "سعادت‌آباد", exactAddressShared: false, neededBy: null },
      unresolvedTerms: { transport: "unknown", tax: "unknown", paymentTerms: "unknown" },
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      sharingStatus: "ارسال نشده",
      status: "ready-for-review",
      version: 2,
      createdAt: at,
      updatedAt: at,
      readyAt: at,
      history: [
        { id: "purchase-event-incomplete-created", type: "created", actor: "شما", at, version: 1 },
        { id: "purchase-event-incomplete-ready", type: "marked-ready-for-review", actor: "شما", at, version: 2 },
      ],
    }]));
  });
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await expect(page.getByTestId("purchase-request-read-error")).toContainText("درخواست‌های محلی کامل خوانده نشد");
  await expect(page.getByTestId("purchase-request-card")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
});

test("builder approves an exact purchase request version internally without authorizing a send", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const consoleFailures: string[] = [];
  const networkRequests: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") consoleFailures.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => consoleFailures.push(`pageerror: ${error.message}`));

  await createReadyPurchaseRequestForApproval(page);
  await expect(page.getByTestId("purchase-request-approval-status")).toContainText("هنوز در صف تأیید ثبت نشده");
  const requestStoreBefore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"));
  const taskStoreBefore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"));
  page.on("request", (request) => {
    const protocol = new URL(request.url()).protocol;
    if (protocol === "http:" || protocol === "https:") networkRequests.push(request.url());
  });

  await page.getByTestId("purchase-request-request-approval").click();
  const approvalDetail = page.getByTestId("project-approval-detail-view");
  await expect(approvalDetail).toBeVisible();
  await expect(page.getByTestId("project-approval-detail-heading")).toBeFocused();
  await expect(approvalDetail).toContainText("منتظر تأیید · نسخهٔ درخواست ۲");
  await expect(approvalDetail).toContainText("۵ تن");
  await expect(approvalDetail).toContainText("حمل");
  await expect(approvalDetail).toContainText("نامشخص");
  await expect(approvalDetail).toContainText("هیچ مقصد بیرونی انتخاب نشده");
  await expect(approvalDetail).toContainText("مجوز ارسال نیست");
  await expect(page.getByTestId("project-approval-approve")).toHaveAccessibleDescription(/مجوز ارسال نیست/);
  expect(await approvalDetail.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);

  let storedApprovals = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]"));
  expect(storedApprovals).toHaveLength(1);
  expect(storedApprovals[0]).toMatchObject({
    projectId: expect.any(String),
    purpose: "review-purchase-request-version",
    target: { type: "purchase-request", id: expect.any(String), version: 2, updatedAt: expect.any(String) },
    snapshot: {
      rawNeed: "پنج تن میلگرد آجدار برای ادامهٔ اسکلت لازم است",
      item: { name: "میلگرد آجدار", quantity: "5", unit: "تن", brandOrGrade: "A3", specification: "شاخه ۱۲ متری با پلاک تولید", source: "ثبت مستقیم شما", confidence: null },
      delivery: { city: "تهران", area: "سعادت‌آباد", exactAddressShared: false, neededBy: "تا ۱۲ شهریور" },
      unresolvedTerms: { transport: "unknown", tax: "unknown", paymentTerms: "unknown" },
      sharingStatus: "ارسال نشده",
    },
    privacySnapshot: { projectNameShared: false, exactAddressShared: false, budgetShared: false, filesShared: false, memoryShared: false },
    externalEffect: "none",
    destination: null,
    sendAuthorized: false,
    status: "pending",
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    requestedBy: "شما",
    decidedBy: null,
    decidedAt: null,
    version: 1,
  });
  expect(storedApprovals[0].history).toHaveLength(1);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"))).toBe(requestStoreBefore);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"))).toBe(taskStoreBefore);
  expect(networkRequests).toEqual([]);

  await page.getByTestId("project-approval-detail-back").click();
  const taskCenter = page.getByTestId("project-tasks-view");
  await expect(taskCenter).toBeVisible();
  await expect(page.getByTestId("project-task-filter-approval")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("project-task-filter-approval")).toContainText("۱");
  const approvalCard = page.getByTestId("project-approval-card");
  await expect(approvalCard).toContainText("میلگرد آجدار");
  await expect(approvalCard).toContainText("نسخهٔ درخواست ۲");
  await expect(approvalCard).toHaveAccessibleName(/ارسال نشده/);
  await expect(approvalCard).toBeFocused();
  await approvalCard.click();

  await page.getByTestId("project-approval-approve").click();
  await expect(approvalDetail).toContainText("نسخهٔ درخواست تأیید شد");
  await expect(page.getByTestId("project-approval-detail-heading")).toBeFocused();
  await expect(page.getByTestId("project-approval-approve")).toHaveCount(0);
  storedApprovals = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]"));
  expect(storedApprovals[0]).toMatchObject({ status: "approved", decidedBy: "شما", decidedAt: expect.any(String), version: 2 });
  expect(storedApprovals[0].history.map((event: { type: string }) => event.type)).toEqual(["created", "approved"]);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"))).toBe(requestStoreBefore);
  expect(networkRequests).toEqual([]);

  await page.getByTestId("project-approval-detail-back").click();
  await expect(page.getByTestId("project-task-filter-completed")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("project-task-filter-approval")).toContainText("۰");
  await expect(page.getByTestId("project-approval-card")).toBeFocused();

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-completed").click();
  await expect(page.getByTestId("project-approval-card")).toContainText("نسخهٔ درخواست تأیید شد");
  await expect(page.getByTestId("project-approval-card")).toHaveAccessibleName(/فقط تأیید داخلی و ارسال نشده/);
  await page.getByTestId("project-tasks-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await expect(page.getByTestId("purchase-request-approval-status")).toContainText("نسخهٔ ۲ تأیید شده");
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("ارسال نشده");
  await page.getByTestId("purchase-request-request-approval").click();
  await expect(page.getByTestId("project-approval-detail-view")).toContainText("نسخهٔ درخواست تأیید شد");
  await page.getByTestId("project-approval-detail-back").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toBeVisible();
  await expect(page.getByTestId("purchase-request-request-approval")).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  expect(consoleFailures).toEqual([]);
});

test("a requested change preserves the reviewed snapshot and requires a fresh approval for the next version", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createReadyPurchaseRequestForApproval(page);
  await page.getByTestId("purchase-request-request-approval").click();

  const firstApproval = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]")[0]);
  const firstSnapshot = JSON.stringify(firstApproval.snapshot);
  await page.getByTestId("project-approval-detail-back").click();
  await page.getByTestId("project-tasks-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await expect(page.getByTestId("purchase-request-return-draft")).toBeDisabled();
  await expect(page.getByTestId("purchase-request-request-approval")).toContainText("مشاهدهٔ تأیید نسخهٔ ۲");
  await page.getByTestId("purchase-request-request-approval").click();
  expect(await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]"))).toHaveLength(1);

  await page.getByTestId("project-approval-needs-changes").click();
  await expect(page.getByTestId("project-approval-status")).toContainText("نیاز به اصلاح ثبت شد");
  await expect(page.getByTestId("project-approval-approve")).toHaveCount(0);
  await page.getByTestId("project-approval-detail-back").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toBeVisible();
  await expect(page.getByTestId("purchase-request-request-approval")).toBeFocused();
  await expect(page.getByTestId("purchase-request-approval-status")).toContainText("نیاز به اصلاح");
  await page.getByTestId("purchase-request-detail-back").click();
  await page.getByTestId("purchase-requests-back").click();

  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await expect(page.getByTestId("purchase-request-approval-status")).toContainText("نیاز به اصلاح");
  await expect(page.getByTestId("purchase-request-return-draft")).toBeEnabled();
  await page.getByTestId("purchase-request-return-draft").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("پیش‌نویس · نسخهٔ ۳");

  await page.getByTestId("purchase-request-edit").click();
  await page.getByTestId("purchase-request-item-input").fill("میلگرد آجدار اصلاح‌شده");
  await page.getByTestId("purchase-request-save").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("پیش‌نویس · نسخهٔ ۴");
  await page.getByTestId("purchase-request-ready").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("آمادهٔ بازبینی · نسخهٔ ۵");
  await expect(page.getByTestId("purchase-request-approval-status")).toContainText("هنوز در صف تأیید ثبت نشده");
  await page.getByTestId("purchase-request-request-approval").click();
  await expect(page.getByTestId("project-approval-detail-view")).toContainText("منتظر تأیید · نسخهٔ درخواست ۵");

  const approvals = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]"));
  expect(approvals).toHaveLength(2);
  expect(approvals.map((approval: { target: { version: number } }) => approval.target.version)).toEqual([2, 5]);
  expect(approvals[0].status).toBe("changes-requested");
  expect(JSON.stringify(approvals[0].snapshot)).toBe(firstSnapshot);
  expect(approvals[1]).toMatchObject({ status: "pending", target: { version: 5 }, externalEffect: "none", destination: null, sendAuthorized: false });
});

test("approval creation and decision writes fail closed without advancing local state", async ({ page }) => {
  await createReadyPurchaseRequestForApproval(page);
  const requestStoreBefore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"));
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Object.defineProperty(window, "__approvalNativeSetItem", { value: nativeSetItem, configurable: true });
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-approvals:v1") throw new DOMException("Approval create failed", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("purchase-request-request-approval").click();
  await expect(page.getByTestId("purchase-request-storage-error")).toContainText("ثبت در صف تأیید انجام نشد");
  await expect(page.getByTestId("project-approval-detail-view")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-approvals:v1"))).toBeNull();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"))).toBe(requestStoreBefore);

  await page.evaluate(() => {
    Storage.prototype.setItem = (window as Window & { __approvalNativeSetItem: typeof Storage.prototype.setItem }).__approvalNativeSetItem;
  });
  await page.getByTestId("purchase-request-request-approval").click();
  const pendingStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-approvals:v1"));
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-approvals:v1") throw new DOMException("Approval decision failed", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("project-approval-approve").click();
  await expect(page.getByTestId("project-approval-storage-error")).toContainText("تصمیم ذخیره نشد");
  await expect(page.getByTestId("project-approval-status")).toContainText("منتظر تصمیم صریح شما");
  await expect(page.getByTestId("project-approval-approve")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-approvals:v1"))).toBe(pendingStore);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"))).toBe(requestStoreBefore);
});

test("approval read failure stays separate from healthy tasks and locks only dependent request actions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const nativeGetItem = Storage.prototype.getItem;
    const nativeSetItem = Storage.prototype.setItem;
    Object.defineProperty(window, "__approvalWriteAttempts", { value: 0, writable: true, configurable: true });
    Storage.prototype.getItem = function getItem(key: string) {
      if (this === window.localStorage && key === "chida-prototype-project-approvals:v1") throw new DOMException("Approval storage read failed", "SecurityError");
      return nativeGetItem.call(this, key);
    };
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-approvals:v1") {
        (window as Window & { __approvalWriteAttempts: number }).__approvalWriteAttempts += 1;
      }
      return nativeSetItem.call(this, key, value);
    };
  });
  await enterBuilderHome(page);
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await expect(page.getByTestId("project-task-add")).toBeEnabled();
  await page.getByTestId("project-task-filter-approval").click();
  await expect(page.getByTestId("project-approval-read-error")).toContainText("تأییدهای محلی کامل خوانده نشد");
  await expect(page.getByTestId("project-task-filter-approval")).toContainText("!");
  await expect(page.getByTestId("project-task-empty")).toHaveCount(0);
  await expect(page.getByTestId("project-task-add")).toBeEnabled();
  await page.getByTestId("project-tasks-back").click();

  await page.getByTestId("quick-action-purchase-request").click();
  await page.getByTestId("purchase-request-raw-input").fill("پنج تن میلگرد برای بازبینی داخلی");
  await page.getByTestId("purchase-request-item-input").fill("میلگرد آجدار");
  await page.getByTestId("purchase-request-quantity-input").fill("۵");
  await chooseProjectOption(page, "purchase-request-unit-select", "تن");
  await page.getByTestId("purchase-request-save").click();
  await page.getByTestId("purchase-request-ready").click();
  await expect(page.getByTestId("purchase-request-approval-status")).toContainText("تأییدهای محلی کامل خوانده نشد");
  await expect(page.getByTestId("purchase-request-request-approval")).toBeDisabled();
  await expect(page.getByTestId("purchase-request-return-draft")).toBeDisabled();
  expect(await page.evaluate(() => (window as Window & { __approvalWriteAttempts: number }).__approvalWriteAttempts)).toBe(0);
});

test("a completed task remains visible when only approval history is unreadable", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-add").click();
  await page.getByTestId("project-task-title-input").fill("کار سالم در مخزن وظیفه‌ها");
  await page.getByTestId("project-task-step-input").fill("نمایش در دادهٔ ناقص مرکز کارها");
  await page.getByTestId("project-task-save").click();
  await page.getByTestId("project-task-card").click();
  await page.getByTestId("project-task-status-toggle").click();
  await page.addInitScript(() => {
    const nativeGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function getItem(key: string) {
      if (this === window.localStorage && key === "chida-prototype-project-approvals:v1") throw new DOMException("Approval storage read failed", "SecurityError");
      return nativeGetItem.call(this, key);
    };
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-completed").click();
  await expect(page.getByTestId("project-approval-read-error")).toContainText("تأییدهای محلی کامل خوانده نشد");
  await expect(page.getByTestId("project-task-filter-completed")).toContainText("!");
  await expect(page.getByTestId("project-task-card")).toContainText("کار سالم در مخزن وظیفه‌ها");
});

test("a decided approval remains visible when only completed tasks are unreadable", async ({ page }) => {
  await createReadyPurchaseRequestForApproval(page);
  await page.getByTestId("purchase-request-request-approval").click();
  await page.getByTestId("project-approval-approve").click();
  await page.addInitScript(() => {
    const nativeGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function getItem(key: string) {
      if (this === window.localStorage && key === "chida-prototype-project-tasks:v1") throw new DOMException("Task storage read failed", "SecurityError");
      return nativeGetItem.call(this, key);
    };
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-completed").click();
  await expect(page.getByTestId("project-task-read-error")).toContainText("کارهای محلی کامل خوانده نشد");
  await expect(page.getByTestId("project-task-filter-completed")).toContainText("!");
  await expect(page.getByTestId("project-approval-card")).toContainText("نسخهٔ درخواست تأیید شد");
  await expect(page.getByTestId("project-approval-card")).toHaveAccessibleName(/ارسال نشده/);
});

test("approval parser rejects a snapshot that no longer matches its exact pending target", async ({ page }) => {
  await createReadyPurchaseRequestForApproval(page);
  await page.getByTestId("purchase-request-request-approval").click();
  await page.evaluate(() => {
    const approvals = JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]");
    approvals[0].snapshot.item.quantity = "7";
    window.localStorage.setItem("chida-prototype-project-approvals:v1", JSON.stringify(approvals));
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-approval").click();
  await expect(page.getByTestId("project-approval-read-error")).toContainText("تأییدهای محلی کامل خوانده نشد");
  await expect(page.getByTestId("project-task-filter-approval")).toContainText("!");
  await expect(page.getByTestId("project-approval-card")).toHaveCount(0);
});

test("approval parser rejects a duplicate project request version tuple", async ({ page }) => {
  await createReadyPurchaseRequestForApproval(page);
  await page.getByTestId("purchase-request-request-approval").click();
  await page.evaluate(() => {
    const approvals = JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]");
    const duplicate = structuredClone(approvals[0]);
    duplicate.id = "approval-duplicate-tuple";
    duplicate.history[0].id = "approval-event-duplicate-tuple";
    approvals.push(duplicate);
    window.localStorage.setItem("chida-prototype-project-approvals:v1", JSON.stringify(approvals));
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-approval").click();
  await expect(page.getByTestId("project-approval-read-error")).toContainText("تأییدهای محلی کامل خوانده نشد");
  await expect(page.getByTestId("project-task-filter-approval")).toContainText("!");
  await expect(page.getByTestId("project-approval-card")).toHaveCount(0);
});

test("approval parser requires the exact target version to have reached ready-for-review", async ({ page }) => {
  await createReadyPurchaseRequestForApproval(page);
  await page.getByTestId("purchase-request-request-approval").click();
  await page.getByTestId("project-approval-approve").click();
  await page.evaluate(() => {
    const requests = JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]");
    const approvals = JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]");
    approvals[0].target.version = 1;
    approvals[0].target.updatedAt = requests[0].createdAt;
    approvals[0].dedupeKey = `${approvals[0].projectId}:${approvals[0].target.id}:1:review-purchase-request-version`;
    window.localStorage.setItem("chida-prototype-project-approvals:v1", JSON.stringify(approvals));
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-completed").click();
  await expect(page.getByTestId("project-approval-read-error")).toContainText("تأییدهای محلی کامل خوانده نشد");
  await expect(page.getByTestId("project-approval-card")).toHaveCount(0);
});

test("approval parser requires every audit history to start with a created event", async ({ page }) => {
  await createReadyPurchaseRequestForApproval(page);
  await page.getByTestId("purchase-request-request-approval").click();
  await page.getByTestId("project-approval-approve").click();
  await page.evaluate(() => {
    const approvals = JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]");
    approvals[0].history[0].type = "approved";
    window.localStorage.setItem("chida-prototype-project-approvals:v1", JSON.stringify(approvals));
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-completed").click();
  await expect(page.getByTestId("project-approval-read-error")).toContainText("تأییدهای محلی کامل خوانده نشد");
  await expect(page.getByTestId("project-approval-card")).toHaveCount(0);
});

test("purchase request approvals never cross the active project boundary", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    const projectBase = { usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-28T08:00:00.000Z" };
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify([
      { ...projectBase, id: "approval-project-a", name: "پروژه الف", location: "ونک", stage: "فونداسیون" },
      { ...projectBase, id: "approval-project-b", name: "پروژه ب", location: "جردن", stage: "نازک کاری و نما" },
    ]));
    window.localStorage.setItem("chida-prototype-active-project", "approval-project-a");
  });
  await createReadyPurchaseRequestForApproval(page);
  await page.getByTestId("purchase-request-request-approval").click();
  await page.getByTestId("project-approval-detail-back").click();
  await page.getByTestId("project-tasks-back").click();
  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /پروژه ب تهران/ }).click();
  await page.getByTestId("project-space-back").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-approval").click();
  await expect(page.getByTestId("project-task-filter-approval")).toContainText("۰");
  await expect(page.getByTestId("project-task-empty")).toContainText("نسخه‌ای منتظر تأیید نیست");
  await expect(page.getByText("میلگرد آجدار")).toHaveCount(0);

  await page.getByTestId("project-tasks-back").click();
  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /پروژه الف تهران/ }).click();
  await page.getByTestId("project-space-back").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-approval").click();
  await expect(page.getByTestId("project-task-filter-approval")).toContainText("۱");
  await expect(page.getByTestId("project-approval-card")).toContainText("میلگرد آجدار");
});

test("T6-B2 stores and reloads a two-item product with independent lineage and deterministic clarifications", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const appOrigin = new URL(page.url()).origin;
  const externalNetworkRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== appOrigin) externalNetworkRequests.push(request.url());
  });

  await page.getByTestId("quick-action-purchase-request").click();
  await page.getByTestId("purchase-request-raw-input").fill("دو قلم مصالح برای ادامهٔ سفت‌کاری لازم است");
  await page.getByTestId("purchase-request-item-input").fill("سیمان تیپ ۲");
  await page.getByTestId("purchase-request-quantity-input").fill("۵");
  await chooseProjectOption(page, "purchase-request-unit-select", "تن");
  await page.getByTestId("purchase-request-mode-advanced").click();
  await page.getByTestId("purchase-request-brand-input").fill("استاندارد ملی");
  await page.getByTestId("purchase-request-add-item").click();
  await page.getByTestId("purchase-request-item-input-1").fill("بلوک سبک");
  await page.getByTestId("purchase-request-quantity-input-1").fill("۱۲۰۰");
  await chooseProjectOption(page, "purchase-request-unit-select-1", "عدد");
  await page.getByTestId("purchase-request-specification-input-1").fill("ضخامت ۱۵ سانتی‌متر");
  await page.getByTestId("purchase-request-needed-by-input").fill("تا ۱۵ شهریور");
  await page.getByTestId("purchase-request-save").click();

  const detail = page.getByTestId("project-purchase-request-detail-view");
  await expect(detail).toBeVisible();
  await expect(page.getByTestId("purchase-request-product-item")).toHaveCount(2);
  expect(await detail.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);

  const storedRequest = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]")[0]);
  expect(storedRequest).toMatchObject({
    schemaVersion: 2,
    requestKind: "product",
    item: { id: storedRequest.items[0].id },
    service: null,
    status: "draft",
    version: 1,
  });
  expect(storedRequest.items).toHaveLength(2);
  for (const item of storedRequest.items) {
    expect(item).toMatchObject({
      source: "ثبت مستقیم شما",
      confidence: null,
      completionStatus: "complete",
      version: 1,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(item.history).toEqual([expect.objectContaining({ type: "created", actor: "شما", version: 1 })]);
  }

  const expectedClarificationPaths = [
    `items.${storedRequest.items[0].id}.alternatives`,
    `items.${storedRequest.items[1].id}.brandOrGrade`,
    `items.${storedRequest.items[1].id}.alternatives`,
    "delivery.area",
    "terms.transport",
    "terms.tax",
    "terms.paymentTerms",
  ];
  expect(storedRequest.clarificationAnswers.map((answer: { fieldPath: string }) => answer.fieldPath)).toEqual(expectedClarificationPaths);
  expect(new Set(storedRequest.clarificationAnswers.map((answer: { id: string }) => answer.id)).size).toBe(expectedClarificationPaths.length);
  for (const clarification of storedRequest.clarificationAnswers) {
    expect(clarification).toMatchObject({ source: "ثبت مستقیم شما", confidence: null, version: 1 });
    expect(clarification.history).toEqual([expect.objectContaining({ type: "created", actor: "شما", version: 1 })]);
    expect(clarification.completionStatus).toBe(clarification.answer === null ? "incomplete" : "complete");
  }
  expect(storedRequest.clarificationAnswers.filter((answer: { answer: string | null }) => answer.answer === null).every((answer: { status: string }) => answer.status === "explicitly-unknown")).toBe(true);
  expect(externalNetworkRequests).toEqual([]);

  const clarificationIdsBeforeReload = storedRequest.clarificationAnswers.map((answer: { id: string }) => answer.id);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-purchase-requests-entry").click();
  await page.getByTestId("purchase-request-card").click();
  await expect(page.getByTestId("purchase-request-product-item")).toHaveCount(2);
  expect(await detail.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  const reloadedRequest = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]")[0]);
  expect(reloadedRequest.clarificationAnswers.map((answer: { id: string }) => answer.id)).toEqual(clarificationIdsBeforeReload);
  expect(reloadedRequest.delivery.area).toBe("نامشخص");
  await page.getByTestId("purchase-request-edit").click();
  await expect(page.getByTestId("purchase-request-delivery-area-input")).toHaveValue("");
  await page.getByTestId("purchase-request-delivery-area-input").fill("سعادت‌آباد");
  await page.getByTestId("purchase-request-save").click();
  const answeredDeliveryRequest = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]")[0]);
  const deliveryClarification = answeredDeliveryRequest.clarificationAnswers.find((answer: { fieldPath: string }) => answer.fieldPath === "delivery.area");
  expect(deliveryClarification).toMatchObject({ answer: "سعادت‌آباد", status: "answered", source: "ثبت مستقیم شما", confidence: null, completionStatus: "complete", version: 2 });
  expect(deliveryClarification.history.map((event: { type: string; actor: string }) => ({ type: event.type, actor: event.actor }))).toEqual([
    { type: "created", actor: "شما" },
    { type: "updated", actor: "شما" },
  ]);
  expect(externalNetworkRequests).toEqual([]);
});

test("T6-B2 stores a service in its independent ten-field schema with explicit unknown clarifications", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const appOrigin = new URL(page.url()).origin;
  const externalNetworkRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== appOrigin) externalNetworkRequests.push(request.url());
  });

  await page.getByTestId("quick-action-purchase-request").click();
  await page.getByTestId("purchase-request-kind-service").click();
  await page.getByTestId("purchase-request-raw-input").fill("اجرای عایق رطوبتی بام برای پروژه لازم است");
  await page.getByTestId("purchase-request-service-scope-input").fill("آماده‌سازی و اجرای عایق دولایهٔ بام");
  await page.getByTestId("purchase-request-service-location-input").fill("بام پروژه در سعادت‌آباد، بدون آدرس دقیق");
  await page.getByTestId("purchase-request-service-size-input").fill("۸۵۰ مترمربع");
  await page.getByTestId("purchase-request-mode-advanced").click();
  await page.getByTestId("purchase-request-service-method-input").fill("اجرای گرمایی طبق دستورالعمل اعلامی");
  await page.getByTestId("purchase-request-service-in-scope-input").fill("زیرسازی، اجرا و آزمون آب‌بندی");
  await page.getByTestId("purchase-request-save").click();

  const detail = page.getByTestId("project-purchase-request-detail-view");
  await expect(detail).toBeVisible();
  await expect(page.getByTestId("purchase-request-service-record")).toBeVisible();
  await expect(page.getByTestId("purchase-request-product-item")).toHaveCount(0);
  expect(await detail.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

  const storedRequest = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]")[0]);
  expect(storedRequest).toMatchObject({ schemaVersion: 2, requestKind: "service", items: [], item: null, status: "draft", version: 1 });
  expect(storedRequest.service).toMatchObject({
    scope: "آماده‌سازی و اجرای عایق دولایهٔ بام",
    location: "بام پروژه در سعادت‌آباد، بدون آدرس دقیق",
    locationPrecision: "area-or-project-section",
    sizeOrVolume: "۸۵۰ مترمربع",
    qualification: null,
    timing: null,
    method: "اجرای گرمایی طبق دستورالعمل اعلامی",
    inScope: "زیرسازی، اجرا و آزمون آب‌بندی",
    outOfScope: null,
    warranty: null,
    paymentTerms: null,
    source: "ثبت مستقیم شما",
    confidence: null,
    completionStatus: "complete",
    version: 1,
  });
  expect(storedRequest.service.history).toEqual([expect.objectContaining({ type: "created", actor: "شما", version: 1 })]);
  expect(storedRequest.clarificationAnswers.map((answer: { fieldPath: string }) => answer.fieldPath)).toEqual([
    "service.qualification",
    "service.timing",
    "service.outOfScope",
    "service.warranty",
    "service.paymentTerms",
  ]);
  expect(storedRequest.clarificationAnswers).toHaveLength(5);
  for (const clarification of storedRequest.clarificationAnswers) {
    expect(clarification).toMatchObject({ source: "ثبت مستقیم شما", confidence: null, version: 1 });
  }
  const explicitUnknowns = storedRequest.clarificationAnswers.filter((answer: { answer: string | null }) => answer.answer === null);
  expect(explicitUnknowns).toHaveLength(5);
  expect(explicitUnknowns.every((answer: { status: string; completionStatus: string }) => answer.status === "explicitly-unknown" && answer.completionStatus === "incomplete")).toBe(true);
  expect(externalNetworkRequests).toEqual([]);
});

test("T6-B2 rejects a tampered historical approval revision after a fresh approval exists", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createReadyPurchaseRequestForApproval(page);
  await page.getByTestId("purchase-request-request-approval").click();
  await page.getByTestId("project-approval-needs-changes").click();
  await page.getByTestId("project-approval-detail-back").click();
  await page.getByTestId("project-tasks-back").click();

  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await page.getByTestId("purchase-request-return-draft").click();
  await page.getByTestId("purchase-request-edit").click();
  await page.getByTestId("purchase-request-quantity-input").fill("۶");
  await page.getByTestId("purchase-request-save").click();
  await page.getByTestId("purchase-request-ready").click();
  await page.getByTestId("purchase-request-request-approval").click();

  const approvalsBeforeTamper = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]"));
  expect(approvalsBeforeTamper).toHaveLength(2);
  expect(approvalsBeforeTamper[0]).toMatchObject({ schemaVersion: 2, status: "changes-requested", snapshot: { items: [{ quantity: "5" }] } });
  expect(approvalsBeforeTamper[1]).toMatchObject({ schemaVersion: 2, status: "pending", snapshot: { items: [{ quantity: "6" }] } });
  expect(approvalsBeforeTamper[0].target.revisionId).not.toBe(approvalsBeforeTamper[1].target.revisionId);

  await page.evaluate(() => {
    const approvals = JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]");
    approvals[0].snapshot.items[0].quantity = "999";
    approvals[0].snapshot.item.quantity = "999";
    window.localStorage.setItem("chida-prototype-project-approvals:v1", JSON.stringify(approvals));
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-completed").click();
  await expect(page.getByTestId("project-approval-read-error")).toContainText("تأییدهای محلی کامل خوانده نشد");
  await expect(page.getByTestId("project-approval-card")).toHaveCount(0);
});

test("T6-B2 versions removal of a saved item and rejects coordinated duplicate ids in its historical revision", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-purchase-request").click();
  await page.getByTestId("purchase-request-raw-input").fill("دو قلم برای ادامهٔ کار لازم است");
  await page.getByTestId("purchase-request-item-input").fill("سیمان تیپ ۲");
  await page.getByTestId("purchase-request-quantity-input").fill("۵");
  await chooseProjectOption(page, "purchase-request-unit-select", "تن");
  await page.getByTestId("purchase-request-add-item").click();
  await page.getByTestId("purchase-request-item-input-1").fill("بلوک سبک");
  await page.getByTestId("purchase-request-quantity-input-1").fill("۱۲۰۰");
  await chooseProjectOption(page, "purchase-request-unit-select-1", "عدد");
  await page.getByTestId("purchase-request-save").click();
  await page.getByTestId("purchase-request-ready").click();
  await page.getByTestId("purchase-request-request-approval").click();
  await page.getByTestId("project-approval-needs-changes").click();
  await page.getByTestId("project-approval-detail-back").click();
  await page.getByTestId("project-tasks-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await page.getByTestId("purchase-request-return-draft").click();
  await page.getByTestId("purchase-request-edit").click();
  await page.getByRole("button", { name: "حذف قلم 2" }).click();
  await page.getByTestId("purchase-request-save").click();
  await expect(page.getByTestId("purchase-request-product-item")).toHaveCount(1);
  await page.getByTestId("purchase-request-ready").click();

  const beforeTamper = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]")[0]);
  expect(beforeTamper.items).toHaveLength(1);
  expect(beforeTamper.version).toBe(5);
  expect(beforeTamper.reviewRevisions.map((revision: { requestVersion: number; snapshot: { items: unknown[] } }) => ({ version: revision.requestVersion, itemCount: revision.snapshot.items.length }))).toEqual([
    { version: 2, itemCount: 2 },
    { version: 5, itemCount: 1 },
  ]);

  await page.evaluate(() => {
    const stableValue = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(stableValue);
      if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([first], [second]) => first.localeCompare(second)).map(([key, item]) => [key, stableValue(item)]));
      }
      return value;
    };
    const stableHash = (serialized: string) => {
      let hash = 2166136261;
      for (let index = 0; index < serialized.length; index += 1) {
        hash ^= serialized.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(16).padStart(8, "0");
    };
    const requests = JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]");
    const historicalRevision = requests[0].reviewRevisions.find((revision: { requestVersion: number }) => revision.requestVersion === 2);
    historicalRevision.snapshot.items[1].id = historicalRevision.snapshot.items[0].id;
    historicalRevision.fingerprint = `fnv1a-${stableHash(JSON.stringify(stableValue({ snapshot: historicalRevision.snapshot, shareableFields: historicalRevision.shareableFields })))}`;
    const approvals = JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]");
    approvals[0].snapshot = structuredClone(historicalRevision.snapshot);
    window.localStorage.setItem("chida-prototype-project-purchase-requests:v1", JSON.stringify(requests));
    window.localStorage.setItem("chida-prototype-project-approvals:v1", JSON.stringify(approvals));
  });

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-completed").click();
  await expect(page.getByTestId("project-approval-read-error")).toContainText("تأییدهای محلی کامل خوانده نشد");
  await expect(page.getByTestId("project-approval-card")).toHaveCount(0);
});

test("T6-B2 rejects impossible subrecord event transitions and source actor lineage", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-purchase-request").click();
  await page.getByTestId("purchase-request-raw-input").fill("پنج تن سیمان برای پروژه لازم است");
  await page.getByTestId("purchase-request-save").click();
  await page.getByTestId("purchase-request-edit").click();
  await page.getByTestId("purchase-request-item-input").fill("سیمان تیپ ۲");
  await page.getByTestId("purchase-request-quantity-input").fill("۵");
  await chooseProjectOption(page, "purchase-request-unit-select", "تن");
  await page.getByTestId("purchase-request-save").click();
  const validStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"));
  const validRequest = JSON.parse(validStore ?? "[]")[0];
  expect(validRequest.items[0]).toMatchObject({ source: "ثبت مستقیم شما", version: 2 });
  expect(validRequest.items[0].history.map((event: { type: string }) => event.type)).toEqual(["created", "updated"]);

  const openRequestsAfterReload = async () => {
    await page.reload();
    await reachBuilderWelcome(page);
    await page.getByTestId("enter-home").click();
    await page.getByTestId("quick-action-purchase-request").click();
    await expect(page.getByTestId("purchase-request-read-error")).toContainText("درخواست‌های محلی کامل خوانده نشد");
  };

  await page.evaluate((stored) => {
    const requests = JSON.parse(stored ?? "[]");
    requests[0].items[0].history[1].type = "created";
    requests[0].item.history[1].type = "created";
    window.localStorage.setItem("chida-prototype-project-purchase-requests:v1", JSON.stringify(requests));
  }, validStore);
  await openRequestsAfterReload();

  await page.evaluate((stored) => {
    const requests = JSON.parse(stored ?? "[]");
    requests[0].items[0].source = "مهاجرت محلی";
    requests[0].item.source = "مهاجرت محلی";
    window.localStorage.setItem("chida-prototype-project-purchase-requests:v1", JSON.stringify(requests));
  }, validStore);
  await openRequestsAfterReload();
});

test("T6-B2 keeps request item and clarification versions stable on a no-op save and locks request kind in edit", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-purchase-request").click();
  await page.getByTestId("purchase-request-raw-input").fill("پنج تن میلگرد آجدار برای ادامهٔ اسکلت");
  await page.getByTestId("purchase-request-item-input").fill("میلگرد آجدار");
  await page.getByTestId("purchase-request-quantity-input").fill("۵");
  await chooseProjectOption(page, "purchase-request-unit-select", "تن");
  await page.getByTestId("purchase-request-save").click();

  const before = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]")[0]);
  await page.getByTestId("purchase-request-edit").click();
  await expect(page.getByTestId("purchase-request-kind-product")).toBeDisabled();
  await expect(page.getByTestId("purchase-request-kind-service")).toBeDisabled();
  await expect(page.getByTestId("purchase-request-kind-product")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("purchase-request-save").click();

  const after = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]")[0]);
  expect(after.requestKind).toBe("product");
  expect(after.version).toBe(before.version);
  expect(after.history).toEqual(before.history);
  expect(after.items.map((item: { id: string; version: number; history: unknown[] }) => ({ id: item.id, version: item.version, history: item.history }))).toEqual(
    before.items.map((item: { id: string; version: number; history: unknown[] }) => ({ id: item.id, version: item.version, history: item.history })),
  );
  expect(after.clarificationAnswers.map((answer: { id: string; version: number; history: unknown[] }) => ({ id: answer.id, version: answer.version, history: answer.history }))).toEqual(
    before.clarificationAnswers.map((answer: { id: string; version: number; history: unknown[] }) => ({ id: answer.id, version: answer.version, history: answer.history })),
  );
});

test("T6-B2 keeps exact current and historical v1 approvals readable across deterministic reload migration", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const projectId = "legacy-t6b2-project";
    const requestId = "legacy-t6b2-request";
    const createdAt = "2026-08-28T09:00:00.000Z";
    const readyAt = "2026-08-28T09:01:00.000Z";
    const requestedAt = "2026-08-28T09:02:00.000Z";
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify([{
      id: projectId,
      name: "پروژه مهاجرت",
      location: "سعادت‌آباد",
      stage: "اسکلت بندی",
      usage: "",
      landArea: "",
      builtArea: "",
      aboveGroundFloors: "",
      basementFloors: "",
      unitCount: "",
      createdAt: "2026-08-28T08:00:00.000Z",
    }]));
    window.localStorage.setItem("chida-prototype-active-project", projectId);
    window.localStorage.setItem("chida-prototype-project-purchase-requests:v1", JSON.stringify([{
      id: requestId,
      projectId,
      requestKind: "product",
      rawNeed: { text: "پنج تن میلگرد برای ادامهٔ اسکلت لازم است", source: "ثبت مستقیم شما", capturedAt: createdAt },
      item: { id: "legacy-t6b2-item", name: "میلگرد آجدار", quantity: "5", unit: "تن", brandOrGrade: "A3", specification: "شاخه ۱۲ متری", alternatives: "approval-required", source: "ثبت مستقیم شما", confidence: null },
      delivery: { city: "تهران", area: "سعادت‌آباد", exactAddressShared: false, neededBy: "تا ۱۲ شهریور" },
      unresolvedTerms: { transport: "unknown", tax: "unknown", paymentTerms: "unknown" },
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      sharingStatus: "ارسال نشده",
      status: "ready-for-review",
      version: 2,
      createdAt,
      updatedAt: readyAt,
      readyAt,
      history: [
        { id: "legacy-t6b2-request-created", type: "created", actor: "شما", at: createdAt, version: 1 },
        { id: "legacy-t6b2-request-ready", type: "marked-ready-for-review", actor: "شما", at: readyAt, version: 2 },
      ],
    }]));
    window.localStorage.setItem("chida-prototype-project-approvals:v1", JSON.stringify([{
      id: "legacy-t6b2-approval",
      projectId,
      purpose: "review-purchase-request-version",
      target: { type: "purchase-request", id: requestId, version: 2, updatedAt: readyAt },
      dedupeKey: `${projectId}:${requestId}:2:review-purchase-request-version`,
      snapshot: {
        rawNeed: "پنج تن میلگرد برای ادامهٔ اسکلت لازم است",
        item: { id: "legacy-t6b2-item", name: "میلگرد آجدار", quantity: "5", unit: "تن", brandOrGrade: "A3", specification: "شاخه ۱۲ متری", alternatives: "approval-required", source: "ثبت مستقیم شما", confidence: null },
        delivery: { city: "تهران", area: "سعادت‌آباد", exactAddressShared: false, neededBy: "تا ۱۲ شهریور" },
        unresolvedTerms: { transport: "unknown", tax: "unknown", paymentTerms: "unknown" },
        sharingStatus: "ارسال نشده",
      },
      privacySnapshot: {
        shareableFields: ["item.name", "item.quantity", "item.unit", "item.brandOrGrade", "item.specification", "delivery.neededBy", "delivery.area"],
        projectNameShared: false,
        exactAddressShared: false,
        budgetShared: false,
        filesShared: false,
        memoryShared: false,
      },
      externalEffect: "none",
      destination: null,
      sendAuthorized: false,
      status: "pending",
      visibility: "خصوصی پروژه",
      localStatus: "ثبت محلی",
      requestedBy: "شما",
      decidedBy: null,
      requestedAt,
      updatedAt: requestedAt,
      decidedAt: null,
      version: 1,
      history: [{ id: "legacy-t6b2-approval-created", type: "created", actor: "شما", at: requestedAt, version: 1 }],
    }]));
  });

  const expectLegacyApprovalReadable = async () => {
    await reachBuilderWelcome(page);
    await page.getByTestId("enter-home").click();
    await page.getByTestId("menu-button").click();
    await page.getByTestId("drawer-tasks-entry").click();
    await page.getByTestId("project-task-filter-approval").click();
    await expect(page.getByTestId("project-approval-read-error")).toHaveCount(0);
    await expect(page.getByTestId("project-approval-card")).toHaveCount(1);
    await expect(page.getByTestId("project-approval-card")).toContainText("میلگرد آجدار");
  };

  await expectLegacyApprovalReadable();
  await page.reload();
  await expectLegacyApprovalReadable();

  await page.evaluate(() => {
    const decidedAt = "2026-08-28T09:03:00.000Z";
    const returnedAt = "2026-08-28T09:04:00.000Z";
    const requests = JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]");
    requests[0].status = "draft";
    requests[0].version = 3;
    requests[0].updatedAt = returnedAt;
    requests[0].readyAt = null;
    requests[0].history.push({ id: "legacy-t6b2-request-returned", type: "returned-to-draft", actor: "شما", at: returnedAt, version: 3 });
    const approvals = JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]");
    approvals[0].status = "approved";
    approvals[0].decidedBy = "شما";
    approvals[0].decidedAt = decidedAt;
    approvals[0].updatedAt = decidedAt;
    approvals[0].version = 2;
    approvals[0].history.push({ id: "legacy-t6b2-approval-approved", type: "approved", actor: "شما", at: decidedAt, version: 2 });
    window.localStorage.setItem("chida-prototype-project-purchase-requests:v1", JSON.stringify(requests));
    window.localStorage.setItem("chida-prototype-project-approvals:v1", JSON.stringify(approvals));
  });

  const expectHistoricalLegacyApprovalReadable = async () => {
    await reachBuilderWelcome(page);
    await page.getByTestId("enter-home").click();
    await page.getByTestId("menu-button").click();
    await page.getByTestId("drawer-tasks-entry").click();
    await page.getByTestId("project-task-filter-completed").click();
    await expect(page.getByTestId("project-approval-read-error")).toHaveCount(0);
    await expect(page.getByTestId("project-approval-card")).toHaveCount(1);
    await expect(page.getByTestId("project-approval-card")).toContainText("میلگرد آجدار");
  };

  await page.reload();
  await expectHistoricalLegacyApprovalReadable();
  await page.reload();
  await expectHistoricalLegacyApprovalReadable();
});

test("T6-C builds an exact local product dispatch draft for direct builder contacts without any network effect", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const runtimeFailures: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeFailures.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => runtimeFailures.push(`pageerror: ${error.message}`));
  await openApprovedPurchaseRequestDispatch(page);

  await expect(page.getByTestId("dispatch-preview-banner")).toContainText("پیش‌نمایش محلی");
  await expect(page.getByTestId("dispatch-preview-banner")).toContainText("هیچ دعوت یا درخواستی ارسال نشده");
  await expect(page.getByTestId("dispatch-payload-preview")).toContainText("items.0.name");
  await expect(page.getByTestId("dispatch-payload-preview")).toContainText("میلگرد آجدار");
  await expect(page.getByTestId("dispatch-privacy-preview")).toContainText("نام پروژه، بودجه، فایل‌ها، حافظه");

  const networkRequests: string[] = [];
  const requestListener = (request: Request) => {
    const url = new URL(request.url());
    if (url.protocol === "http:" || url.protocol === "https:") networkRequests.push(request.url());
  };
  page.on("request", requestListener);
  await addLocalSupplierContact(page, { name: "فروشگاه فولاد غرب", category: "میلگرد و فولاد", coverage: "غرب و شمال‌غرب تهران", capability: "product" });
  await addLocalSupplierContact(page, { name: "گروه اجرای عایق", category: "خدمات عایق‌کاری", coverage: "تمام تهران", capability: "service" });
  await expect(page.getByTestId("dispatch-selected-count")).toContainText("۱ گیرنده انتخاب شده");
  const incompatibleContact = page.getByTestId("supplier-contact-card").filter({ hasText: "گروه اجرای عایق" });
  await expect(incompatibleContact.getByTestId("supplier-contact-select")).toBeDisabled();
  await expect(incompatibleContact).toContainText("قابل انتخاب نیست");

  await page.getByTestId("dispatch-draft-save").click();
  await expect(page.getByTestId("dispatch-draft-preview")).toBeVisible();
  await expect(page.getByTestId("dispatch-draft-preview")).toContainText("اثر بیرونی");
  await expect(page.getByTestId("dispatch-draft-preview")).toContainText("false");
  await expect(page.getByTestId("invite-draft-card")).toContainText("فروشگاه فولاد غرب");
  await expect(page.getByTestId("invite-draft-card")).toContainText("ادامهٔ احتمالی در فاز تأمین‌کننده");

  const stored = await page.evaluate(() => ({
    contacts: JSON.parse(window.localStorage.getItem("chida-prototype-project-supplier-contacts:v1") ?? "[]"),
    dispatches: JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1") ?? "[]"),
  }));
  expect(stored.contacts).toHaveLength(2);
  expect(stored.contacts[0]).toMatchObject({ source: "ثبت مستقیم سازنده", networkStatus: "خارج از شبکه چیدا", visibility: "خصوصی پروژه", localStatus: "ثبت محلی", status: "active", version: 1 });
  expect(stored.dispatches).toHaveLength(1);
  const dispatch = stored.dispatches[0];
  expect(dispatch).toMatchObject({ status: "draft", externalEffect: "none", sendAuthorized: false, visibility: "خصوصی پروژه", localStatus: "ثبت محلی", version: 1 });
  expect(dispatch.revisions).toHaveLength(1);
  const revision = dispatch.revisions[0];
  expect(revision.recipientIds).toEqual([stored.contacts[0].id]);
  expect(revision.payload).toMatchObject({
    requestKind: "product",
    items: [{ name: "میلگرد آجدار", quantity: "5", unit: "تن", brandOrGrade: "A3", specification: "شاخه ۱۲ متری با پلاک تولید", alternatives: "unknown" }],
    delivery: { area: "سعادت‌آباد", neededBy: "تا ۱۲ شهریور" },
    unresolvedTerms: { transport: "unknown", tax: "unknown", paymentTerms: "unknown" },
    service: null,
  });
  expect(revision.payload).not.toHaveProperty("rawNeed");
  expect(revision.payload).not.toHaveProperty("clarificationAnswers");
  expect(revision.payload.delivery).not.toHaveProperty("city");
  expect(JSON.stringify(revision.payload)).not.toContain("برج نیلوفر");
  expect(revision.privacySnapshot).toMatchObject({ projectNameShared: false, exactAddressFieldIncluded: false, budgetShared: false, filesShared: false, memoryShared: false, rawNeedShared: false, clarificationAnswersShared: false, locationReviewRequired: true });
  expect(revision.inviteDrafts[0]).toMatchObject({ source: "ثبت مستقیم سازنده", continuation: "ادامهٔ احتمالی در فاز تأمین‌کننده", externalEffect: "none", sendAuthorized: false, version: 1 });
  const renderedPayloadPaths = await page.getByTestId("dispatch-payload-row").locator("dt").allTextContents();
  expect(renderedPayloadPaths).toEqual(revision.privacySnapshot.shareableFields);
  expect(networkRequests).toEqual([]);
  expect(await page.getByTestId("project-dispatch-planner-view").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  page.off("request", requestListener);

  await page.reload();
  await reopenFirstPurchaseRequestDispatch(page);
  await expect(page.getByTestId("dispatch-draft-preview")).toContainText("نسخهٔ ۱");
  await expect(page.getByTestId("invite-draft-card")).toContainText("فروشگاه فولاد غرب");
  await expect(page.getByTestId("supplier-contact-card")).toHaveCount(2);
  expect(runtimeFailures).toEqual([]);
});

test("T6-C stays locked for pending or stale approvals and unlocks only the exact approved current revision", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createReadyPurchaseRequestForApproval(page);
  await expect(page.getByTestId("purchase-request-dispatch-locked")).toContainText("فقط بعد از تأیید صریح همین نسخه");
  await expect(page.getByTestId("purchase-request-open-dispatch")).toHaveCount(0);

  await page.getByTestId("purchase-request-request-approval").click();
  await page.getByTestId("project-approval-detail-back").click();
  await page.getByTestId("project-tasks-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await expect(page.getByTestId("purchase-request-dispatch-locked")).toBeVisible();
  await page.getByTestId("purchase-request-request-approval").click();
  await page.getByTestId("project-approval-approve").click();
  await page.getByTestId("project-approval-detail-back").click();
  await expect(page.getByTestId("purchase-request-open-dispatch")).toBeVisible();

  await page.getByTestId("purchase-request-return-draft").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("پیش‌نویس · نسخهٔ ۳");
  await expect(page.getByTestId("purchase-request-open-dispatch")).toHaveCount(0);
  await expect(page.getByTestId("project-dispatch-planner-view")).toHaveCount(0);
});

test("T6-C versions recipient changes, keeps archived history, and treats an unchanged selection as a no-op", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openApprovedPurchaseRequestDispatch(page);
  await addLocalSupplierContact(page, { name: "فولاد یک", category: "میلگرد", coverage: "منطقه ۲", capability: "product" });
  await addLocalSupplierContact(page, { name: "فولاد دو", category: "میلگرد", coverage: "منطقه ۵", capability: "product" });
  await expect(page.getByTestId("dispatch-selected-count")).toContainText("۲ گیرنده انتخاب شده");
  await page.getByTestId("dispatch-draft-save").click();
  await expect(page.getByTestId("invite-draft-card")).toHaveCount(2);
  const firstStoredDraft = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1") ?? "[]")[0]);
  expect(firstStoredDraft).toMatchObject({ version: 1 });
  expect(firstStoredDraft.revisions).toHaveLength(1);

  await page.getByTestId("dispatch-draft-save").click();
  await expect(page.getByTestId("dispatch-save-announcement")).toContainText("نسخهٔ اضافه‌ای ساخته نشد");
  const noOpStoredDraft = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1") ?? "[]")[0]);
  expect(noOpStoredDraft).toEqual(firstStoredDraft);

  const firstContactCard = page.getByTestId("supplier-contact-card").filter({ hasText: "فولاد یک" });
  await firstContactCard.getByTestId("supplier-contact-status").click();
  await expect(firstContactCard).toContainText("این رکورد آرشیو است");
  await expect(page.getByTestId("dispatch-selected-count")).toContainText("۱ گیرنده انتخاب شده");
  await expect(page.getByTestId("dispatch-draft-preview")).toContainText("اکنون آرشیو");
  await expect(page.getByTestId("invite-draft-card")).toHaveCount(2);
  await page.getByTestId("dispatch-draft-save").click();
  await expect(page.getByTestId("invite-draft-card")).toHaveCount(1);

  const versionedDraft = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1") ?? "[]")[0]);
  expect(versionedDraft.version).toBe(2);
  expect(versionedDraft.history.map((event: { type: string }) => event.type)).toEqual(["created", "updated"]);
  expect(versionedDraft.revisions.map((revision: { recipientIds: string[] }) => revision.recipientIds.length)).toEqual([2, 1]);
  const contacts = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-supplier-contacts:v1") ?? "[]"));
  expect(contacts.find((contact: { displayName: string }) => contact.displayName === "فولاد یک")).toMatchObject({ status: "archived", version: 2, archivedAt: expect.any(String) });

  await page.reload();
  await reopenFirstPurchaseRequestDispatch(page);
  await expect(page.getByTestId("dispatch-draft-preview")).toContainText("نسخهٔ ۲");
  await expect(page.getByTestId("invite-draft-card")).toHaveCount(1);
  await expect(page.getByTestId("invite-draft-card")).toContainText("فولاد دو");
  await expect(page.getByTestId("supplier-contact-card")).toHaveCount(2);
  await expect(page.getByTestId("dispatch-revision-option")).toHaveCount(2);
  await page.getByTestId("dispatch-revision-option").filter({ hasText: "نسخهٔ ۱" }).click();
  await expect(page.getByTestId("dispatch-draft-preview")).toContainText("تاریخی · فقط‌خواندنی");
  await expect(page.getByTestId("invite-draft-card")).toHaveCount(2);
  await expect(page.getByTestId("dispatch-draft-preview")).toContainText("اکنون آرشیو");
});

test("T6-C keeps contacts and dispatch drafts isolated when the builder changes projects", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openApprovedPurchaseRequestDispatch(page);
  await addLocalSupplierContact(page, { name: "گیرنده پروژه الف", category: "میلگرد", coverage: "غرب تهران", capability: "product" });
  await page.getByTestId("dispatch-draft-save").click();
  const firstProjectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));

  await page.evaluate(() => {
    const projects = JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]");
    projects.push({ id: "t6c-isolation-project-b", name: "پروژه ب", location: "جردن", stage: "فونداسیون", usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-28T12:00:00.000Z" });
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify(projects));
    window.localStorage.setItem("chida-prototype-active-project", "t6c-isolation-project-b");
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("project-switcher")).toContainText("پروژه ب");
  await page.getByTestId("quick-action-purchase-request").click();
  await page.getByTestId("purchase-request-raw-input").fill("صد عدد بلوک سبک برای پروژه ب لازم است");
  await page.getByTestId("purchase-request-item-input").fill("بلوک سبک");
  await page.getByTestId("purchase-request-quantity-input").fill("۱۰۰");
  await chooseProjectOption(page, "purchase-request-unit-select", "عدد");
  await page.getByTestId("purchase-request-save").click();
  await page.getByTestId("purchase-request-ready").click();
  await page.getByTestId("purchase-request-request-approval").click();
  await page.getByTestId("project-approval-approve").click();
  await page.getByTestId("project-approval-detail-back").click();
  await page.getByTestId("project-tasks-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await page.getByTestId("purchase-request-open-dispatch").click();

  await expect(page.getByTestId("supplier-contact-empty")).toContainText("هنوز گیرنده‌ای ثبت نشده");
  await expect(page.getByTestId("supplier-contact-card")).toHaveCount(0);
  await expect(page.getByTestId("dispatch-draft-empty")).toBeVisible();
  await expect(page.getByTestId("dispatch-draft-preview")).toHaveCount(0);
  const isolationState = await page.evaluate(() => ({
    activeProjectId: window.localStorage.getItem("chida-prototype-active-project"),
    contacts: JSON.parse(window.localStorage.getItem("chida-prototype-project-supplier-contacts:v1") ?? "[]"),
    dispatches: JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1") ?? "[]"),
  }));
  expect(isolationState.activeProjectId).toBe("t6c-isolation-project-b");
  expect(isolationState.contacts).toHaveLength(1);
  expect(isolationState.dispatches).toHaveLength(1);
  expect(isolationState.contacts[0].projectId).toBe(firstProjectId);
  expect(isolationState.dispatches[0].projectId).toBe(firstProjectId);
  expect(isolationState.contacts[0].projectId).not.toBe(isolationState.activeProjectId);
});

test("T6-C exposes the service location for manual review without claiming semantic exact-address removal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-purchase-request").click();
  await page.getByTestId("purchase-request-kind-service").click();
  await page.getByTestId("purchase-request-raw-input").fill("اجرای عایق رطوبتی بام برای پروژه لازم است");
  await page.getByTestId("purchase-request-service-scope-input").fill("آماده‌سازی و اجرای عایق دولایهٔ بام");
  await page.getByTestId("purchase-request-service-location-input").fill("بام پروژه، ضلع جنوبی، نشانی آزاد نیازمند بازبینی");
  await page.getByTestId("purchase-request-service-size-input").fill("۸۵۰ مترمربع");
  await page.getByTestId("purchase-request-save").click();
  await page.getByTestId("purchase-request-ready").click();
  await page.getByTestId("purchase-request-request-approval").click();
  await page.getByTestId("project-approval-approve").click();
  await page.getByTestId("project-approval-detail-back").click();
  await page.getByTestId("project-tasks-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await page.getByTestId("purchase-request-open-dispatch").click();

  await expect(page.getByTestId("dispatch-payload-preview")).toContainText("service.location");
  await expect(page.getByTestId("dispatch-payload-preview")).toContainText("نشانی آزاد نیازمند بازبینی");
  await expect(page.getByTestId("dispatch-privacy-preview")).toContainText("پاک‌سازی معنایی ادعا نمی‌شود");
  await addLocalSupplierContact(page, { name: "مجری عایق بام", category: "عایق‌کاری", coverage: "تمام تهران", capability: "service" });
  await page.getByTestId("dispatch-draft-save").click();

  const revision = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1") ?? "[]")[0].revisions[0]);
  expect(revision.payload).toMatchObject({ requestKind: "service", items: [], delivery: null, unresolvedTerms: null, service: { scope: "آماده‌سازی و اجرای عایق دولایهٔ بام", location: "بام پروژه، ضلع جنوبی، نشانی آزاد نیازمند بازبینی", locationPrecision: "area-or-project-section", sizeOrVolume: "۸۵۰ مترمربع" } });
  expect(revision.payload.service).not.toHaveProperty("exactAddress");
  expect(revision.privacySnapshot).toMatchObject({ exactAddressFieldIncluded: false, locationReviewRequired: true });
});

test("T6-C rejects coordinated dispatch tampering and locks writes while leaving the approved payload reviewable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openApprovedPurchaseRequestDispatch(page);
  await addLocalSupplierContact(page, { name: "فولاد امن", category: "میلگرد", coverage: "تهران", capability: "product" });
  await page.getByTestId("dispatch-draft-save").click();
  const validDispatchStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"));
  const validContactStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-supplier-contacts:v1"));

  await page.evaluate(() => {
    const stableValue = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(stableValue);
      if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([first], [second]) => first.localeCompare(second)).map(([key, item]) => [key, stableValue(item)]));
      return value;
    };
    const stableHash = (serialized: string) => {
      let hash = 2166136261;
      for (let index = 0; index < serialized.length; index += 1) {
        hash ^= serialized.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(16).padStart(8, "0");
    };
    const dispatches = JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1") ?? "[]");
    const revision = dispatches[0].revisions[0];
    revision.payload.items[0].quantity = "999";
    revision.fingerprint = `fnv1a-${stableHash(JSON.stringify(stableValue({ target: dispatches[0].target, recipientIds: revision.recipientIds, inviteDrafts: revision.inviteDrafts, payload: revision.payload, privacySnapshot: revision.privacySnapshot })))}`;
    window.localStorage.setItem("chida-prototype-project-dispatch-drafts:v1", JSON.stringify(dispatches));
  });
  await page.reload();
  await reopenFirstPurchaseRequestDispatch(page);
  await expect(page.getByTestId("dispatch-draft-read-error")).toContainText("Draft کامل خوانده نشدند");
  await expect(page.getByTestId("dispatch-payload-preview")).toContainText("میلگرد آجدار");
  await expect(page.getByTestId("dispatch-payload-row").filter({ hasText: "items.0.quantity" })).toContainText("5");
  await expect(page.getByTestId("dispatch-draft-preview")).toHaveCount(0);
  await expect(page.getByTestId("dispatch-draft-save")).toBeDisabled();

  await page.evaluate((stored) => {
    const dispatches = JSON.parse(stored ?? "[]");
    dispatches[0].sendAuthorized = true;
    window.localStorage.setItem("chida-prototype-project-dispatch-drafts:v1", JSON.stringify(dispatches));
  }, validDispatchStore);
  await page.reload();
  await reopenFirstPurchaseRequestDispatch(page);
  await expect(page.getByTestId("dispatch-draft-read-error")).toBeVisible();
  await expect(page.getByTestId("dispatch-draft-save")).toBeDisabled();

  await page.evaluate(({ contactsStore, dispatchStore }) => {
    const stableValue = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(stableValue);
      if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([first], [second]) => first.localeCompare(second)).map(([key, item]) => [key, stableValue(item)]));
      return value;
    };
    const stableHash = (serialized: string) => {
      let hash = 2166136261;
      for (let index = 0; index < serialized.length; index += 1) {
        hash ^= serialized.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(16).padStart(8, "0");
    };
    const contacts = JSON.parse(contactsStore ?? "[]");
    const dispatches = JSON.parse(dispatchStore ?? "[]");
    contacts[0].responseCapability = "service";
    const revision = dispatches[0].revisions[0];
    revision.inviteDrafts[0].destination.responseCapability = "service";
    revision.fingerprint = `fnv1a-${stableHash(JSON.stringify(stableValue({ target: dispatches[0].target, recipientIds: revision.recipientIds, inviteDrafts: revision.inviteDrafts, payload: revision.payload, privacySnapshot: revision.privacySnapshot })))}`;
    window.localStorage.setItem("chida-prototype-project-supplier-contacts:v1", JSON.stringify(contacts));
    window.localStorage.setItem("chida-prototype-project-dispatch-drafts:v1", JSON.stringify(dispatches));
  }, { contactsStore: validContactStore, dispatchStore: validDispatchStore });
  await page.reload();
  await reopenFirstPurchaseRequestDispatch(page);
  await expect(page.getByTestId("supplier-contact-read-error")).toHaveCount(0);
  await expect(page.getByTestId("supplier-contact-card")).toContainText("قابل انتخاب نیست");
  await expect(page.getByTestId("dispatch-draft-read-error")).toBeVisible();
  await expect(page.getByTestId("dispatch-draft-preview")).toHaveCount(0);
});

for (const malformedAppend of [
  { label: "contact history", store: "contact-history" },
  { label: "dispatch history", store: "dispatch-history" },
  { label: "dispatch revision", store: "dispatch-revision" },
] as const) {
  test(`T6-C rejects an extra malformed ${malformedAppend.label} entry instead of silently dropping it`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openApprovedPurchaseRequestDispatch(page);
    await addLocalSupplierContact(page, { name: "گیرنده تاریخچه", category: "میلگرد", coverage: "تهران", capability: "product" });
    await page.getByTestId("dispatch-draft-save").click();

    await page.evaluate(({ store }) => {
      if (store === "contact-history") {
        const contacts = JSON.parse(window.localStorage.getItem("chida-prototype-project-supplier-contacts:v1") ?? "[]");
        contacts[0].history.push({ id: "malformed-contact-event", type: "updated", actor: "شما", at: "not-a-date", version: 2 });
        window.localStorage.setItem("chida-prototype-project-supplier-contacts:v1", JSON.stringify(contacts));
        return;
      }
      const dispatches = JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1") ?? "[]");
      if (store === "dispatch-history") dispatches[0].history.push({ id: "malformed-dispatch-event", type: "updated", actor: "شما", at: "not-a-date", version: 2 });
      else dispatches[0].revisions.push({ id: "malformed-dispatch-revision" });
      window.localStorage.setItem("chida-prototype-project-dispatch-drafts:v1", JSON.stringify(dispatches));
    }, { store: malformedAppend.store });

    await page.reload();
    await reopenFirstPurchaseRequestDispatch(page);
    if (malformedAppend.store === "contact-history") await expect(page.getByTestId("supplier-contact-read-error")).toBeVisible();
    else await expect(page.getByTestId("supplier-contact-read-error")).toHaveCount(0);
    await expect(page.getByTestId("dispatch-draft-read-error")).toBeVisible();
    await expect(page.getByTestId("dispatch-draft-preview")).toHaveCount(0);
    await expect(page.getByTestId("dispatch-draft-save")).toBeDisabled();
  });
}

test("T6-C rejects duplicate contact ids and rolls back failed contact or dispatch writes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openApprovedPurchaseRequestDispatch(page);
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Object.defineProperty(window, "__t6cNativeSetItem", { value: nativeSetItem, configurable: true });
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-supplier-contacts:v1") throw new DOMException("Contact write failed", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("supplier-contact-add").click();
  await page.getByTestId("supplier-contact-name-input").fill("گیرنده شکست‌خورده");
  await page.getByTestId("supplier-contact-category-input").fill("میلگرد");
  await page.getByTestId("supplier-contact-coverage-input").fill("تهران");
  await page.getByTestId("supplier-contact-capability-product").click();
  await page.getByTestId("supplier-contact-save").click();
  await expect(page.getByTestId("supplier-contact-storage-error")).toContainText("رکورد گیرنده ذخیره نشد");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("supplier-contact-editor-sheet")).toBeHidden();
  await expect(page.getByTestId("supplier-contact-card")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-supplier-contacts:v1"))).toBeNull();

  await page.evaluate(() => {
    Storage.prototype.setItem = (window as Window & { __t6cNativeSetItem: typeof Storage.prototype.setItem }).__t6cNativeSetItem;
  });
  await addLocalSupplierContact(page, { name: "گیرنده سالم", category: "میلگرد", coverage: "تهران", capability: "product" });
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-dispatch-drafts:v1") throw new DOMException("Dispatch write failed", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("dispatch-draft-save").click();
  await expect(page.getByTestId("dispatch-storage-error")).toContainText("Draft اشتراک ذخیره نشد");
  await expect(page.getByTestId("dispatch-draft-preview")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"))).toBeNull();

  await page.evaluate(() => {
    Storage.prototype.setItem = (window as Window & { __t6cNativeSetItem: typeof Storage.prototype.setItem }).__t6cNativeSetItem;
    const contacts = JSON.parse(window.localStorage.getItem("chida-prototype-project-supplier-contacts:v1") ?? "[]");
    contacts.push(structuredClone(contacts[0]));
    window.localStorage.setItem("chida-prototype-project-supplier-contacts:v1", JSON.stringify(contacts));
  });
  await page.reload();
  await reopenFirstPurchaseRequestDispatch(page);
  await expect(page.getByTestId("supplier-contact-read-error")).toContainText("گیرنده‌های محلی کامل خوانده نشدند");
  await expect(page.getByTestId("dispatch-draft-read-error")).toBeVisible();
  await expect(page.getByTestId("supplier-contact-add")).toBeDisabled();
  await expect(page.getByTestId("dispatch-draft-save")).toBeDisabled();
});

for (const readFailure of [
  { label: "contact", key: "chida-prototype-project-supplier-contacts:v1" },
  { label: "dispatch", key: "chida-prototype-project-dispatch-drafts:v1" },
] as const) {
  test(`T6-C fail-closes ${readFailure.label} getItem exceptions without attempting a dependent write`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(({ failureKey }) => {
      const nativeGetItem = Storage.prototype.getItem;
      const nativeSetItem = Storage.prototype.setItem;
      Object.defineProperty(window, "__t6cReadFailureWriteAttempts", { value: 0, writable: true, configurable: true });
      Storage.prototype.getItem = function getItem(key: string) {
        if (this === window.localStorage && key === failureKey) throw new DOMException("T6-C read failed", "SecurityError");
        return nativeGetItem.call(this, key);
      };
      Storage.prototype.setItem = function setItem(key: string, value: string) {
        if (this === window.localStorage && key === failureKey) (window as Window & { __t6cReadFailureWriteAttempts: number }).__t6cReadFailureWriteAttempts += 1;
        return nativeSetItem.call(this, key, value);
      };
    }, { failureKey: readFailure.key });

    await openApprovedPurchaseRequestDispatch(page);
    await expect(page.getByTestId("dispatch-draft-read-error")).toBeVisible();
    await expect(page.getByTestId("dispatch-draft-save")).toBeDisabled();
    if (readFailure.label === "contact") {
      await expect(page.getByTestId("supplier-contact-read-error")).toBeVisible();
      await expect(page.getByTestId("supplier-contact-add")).toBeDisabled();
    } else {
      await expect(page.getByTestId("supplier-contact-read-error")).toHaveCount(0);
      await expect(page.getByTestId("supplier-contact-add")).toBeEnabled();
      await addLocalSupplierContact(page, { name: "گیرنده مستقل از Draft", category: "میلگرد", coverage: "تهران", capability: "product" });
      await expect(page.getByTestId("dispatch-selected-count")).toContainText("۱ گیرنده انتخاب شده");
      await expect(page.getByTestId("dispatch-draft-save")).toBeDisabled();
    }
    expect(await page.evaluate(() => (window as Window & { __t6cReadFailureWriteAttempts: number }).__t6cReadFailureWriteAttempts)).toBe(0);
  });
}

test("T6-D independently approves the exact current dispatch plan without authorizing or attempting a send", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createCurrentProductDispatchDraft(page);

  const requestApprovalBefore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-approvals:v1"));
  const currentDispatch = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1") ?? "[]")[0]);
  const currentRevision = currentDispatch.revisions.at(-1);
  const currentContacts = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-supplier-contacts:v1") ?? "[]"));
  const expectedRecipients = currentRevision.inviteDrafts.map((invite: { supplierContactId: string; destination: unknown }) => ({
    supplierContactId: invite.supplierContactId,
    supplierContactVersion: currentContacts.find((contact: { id: string }) => contact.id === invite.supplierContactId).version,
    destination: invite.destination,
  }));
  const networkRequests: string[] = [];
  const requestListener = (request: Request) => {
    const url = new URL(request.url());
    if (url.protocol === "http:" || url.protocol === "https:") networkRequests.push(request.url());
  };
  page.on("request", requestListener);

  await page.getByTestId("dispatch-plan-review").click();
  await expect(page.getByTestId("dispatch-plan-approval-detail")).toBeVisible();
  await expect(page.getByTestId("dispatch-plan-approval-target")).toContainText("نسخهٔ ۱");
  await expect(page.getByTestId("dispatch-plan-approval-target")).toContainText("فولاد برنامه ارسال");
  await page.getByTestId("dispatch-plan-acknowledgement").check();
  await page.getByTestId("dispatch-plan-approval-create").click();
  await expect(page.getByTestId("dispatch-plan-approval-status")).toContainText("در انتظار تأیید");
  await expect(page.getByTestId("dispatch-plan-approval-status")).toBeFocused();

  const pendingApproval = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-plan-approvals:v1") ?? "[]")[0]);
  expect(pendingApproval).toMatchObject({
    schemaVersion: 1,
    projectId: currentDispatch.projectId,
    status: "pending",
    target: {
      type: "dispatch-draft-revision",
      dispatchDraftId: currentDispatch.id,
      dispatchRevisionId: currentRevision.id,
      dispatchDraftVersion: currentRevision.version,
      dispatchRevisionFingerprint: currentRevision.fingerprint,
      requestId: currentDispatch.target.requestId,
      requestVersion: currentDispatch.target.requestVersion,
      requestRevisionId: currentDispatch.target.revisionId,
      contentApprovalId: currentDispatch.target.approvalId,
    },
    snapshot: {
      recipients: expectedRecipients,
      recipientCount: expectedRecipients.length,
      payload: currentRevision.payload,
      privacySnapshot: currentRevision.privacySnapshot,
      reviewAcknowledgement: {
        destinationsReviewed: true,
        payloadReviewed: true,
        privacyAndLocationReviewed: true,
      },
    },
  });
  expect(pendingApproval.target.dispatchRevisionId).toBe(currentRevision.id);

  await page.getByTestId("dispatch-plan-approval-withdraw").click();
  await expect(page.getByTestId("dispatch-plan-approval-status")).toContainText("پس‌گرفته‌شده");
  await expect(page.getByTestId("dispatch-plan-approval-status")).toBeFocused();
  expect(await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-plan-approvals:v1") ?? "[]")[0].status)).toBe("withdrawn");

  await page.getByTestId("dispatch-plan-approval-reopen").click();
  await expect(page.getByTestId("dispatch-plan-approval-status")).toContainText("در انتظار تأیید");
  await expect(page.getByTestId("dispatch-plan-approval-status")).toBeFocused();
  expect(await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-plan-approvals:v1") ?? "[]")[0].status)).toBe("pending");

  await page.getByTestId("dispatch-plan-approval-approve").click();
  await expect(page.getByTestId("dispatch-plan-approval-status")).toContainText("تأییدشده");
  await expect(page.getByTestId("dispatch-plan-approval-status")).toBeFocused();
  await expect(page.getByTestId("dispatch-plan-approval-action-record")).toContainText("تأیید محلی برنامهٔ ارسال");
  const approved = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-plan-approvals:v1") ?? "[]")[0]);
  expect(approved).toMatchObject({
    status: "approved",
    simulationOnly: true,
    externalEffect: "none",
    sendAuthorized: false,
    externalActionAttempted: false,
    actionRecord: { label: "تأیید محلی برنامهٔ ارسال" },
  });
  expect(approved.history.map((event: { type: string }) => event.type)).toEqual(["created", "withdrawn", "reopened", "approved"]);
  expect(JSON.stringify(approved)).not.toMatch(/"(?:sent|sentAt|receipt|deliveryReceipt)":/);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-approvals:v1"))).toBe(requestApprovalBefore);
  expect(networkRequests).toEqual([]);
  expect(await page.getByTestId("dispatch-plan-approval-detail").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  page.off("request", requestListener);

  await reopenFirstPurchaseRequestDispatch(page);
  await page.getByTestId("dispatch-plan-review").click();
  await expect(page.getByTestId("dispatch-plan-approval-status")).toContainText("تأییدشده");
  await expect(page.getByTestId("dispatch-plan-approval-action-record")).toContainText("تأیید محلی برنامهٔ ارسال");
});

test("T6-D invalidates and preserves an approved historical plan when recipients create a new dispatch revision", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createCurrentProductDispatchDraft(page, ["فولاد نسخه یک", "فولاد نسخه دو"]);
  await page.getByTestId("dispatch-plan-review").click();
  await page.getByTestId("dispatch-plan-acknowledgement").check();
  await page.getByTestId("dispatch-plan-approval-create").click();
  await page.getByTestId("dispatch-plan-approval-approve").click();
  const historicalApprovalBeforeChange = await page.evaluate(() => structuredClone(JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-plan-approvals:v1") ?? "[]")[0]));
  await page.getByTestId("dispatch-plan-approval-back").click();

  const removedContact = page.getByTestId("supplier-contact-card").filter({ hasText: "فولاد نسخه یک" });
  await removedContact.getByTestId("supplier-contact-status").click();
  await expect(page.getByTestId("dispatch-selected-count")).toContainText("۱ گیرنده انتخاب شده");
  await page.getByTestId("dispatch-draft-save").click();
  await expect(page.getByTestId("dispatch-draft-preview")).toContainText("نسخهٔ ۲");
  await expect(page.getByTestId("dispatch-plan-approval-invalidated")).toBeVisible();

  await page.getByTestId("dispatch-plan-review").click();
  await expect(page.getByTestId("dispatch-plan-approval-target")).toContainText("نسخهٔ ۲");
  await expect(page.getByTestId("dispatch-plan-approval-create")).toBeVisible();
  const historicalCard = page.getByTestId("dispatch-plan-approval-history").filter({ hasText: "نسخهٔ ۱" });
  await expect(historicalCard).toContainText("نامعتبر");
  await expect(historicalCard.getByTestId("dispatch-plan-approval-readonly")).toBeVisible();
  await expect(historicalCard.getByTestId("dispatch-plan-approval-withdraw")).toHaveCount(0);
  await expect(historicalCard.getByTestId("dispatch-plan-approval-reopen")).toHaveCount(0);
  await expect(historicalCard.getByTestId("dispatch-plan-approval-approve")).toHaveCount(0);

  const invalidatedHistoricalRecord = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-plan-approvals:v1") ?? "[]")[0]);
  expect(invalidatedHistoricalRecord).toEqual(historicalApprovalBeforeChange);
  expect(invalidatedHistoricalRecord).toMatchObject({
    status: "approved",
    simulationOnly: true,
    externalEffect: "none",
    sendAuthorized: false,
    externalActionAttempted: false,
  });

  await page.getByTestId("dispatch-plan-acknowledgement").check();
  await page.getByTestId("dispatch-plan-approval-create").click();
  const approvals = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-plan-approvals:v1") ?? "[]"));
  const currentDispatch = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1") ?? "[]")[0]);
  const currentRevision = currentDispatch.revisions.at(-1);
  expect(approvals).toHaveLength(2);
  expect(approvals[0]).toEqual(historicalApprovalBeforeChange);
  expect(approvals[1]).toMatchObject({
    status: "pending",
    target: {
      dispatchDraftId: currentDispatch.id,
      dispatchDraftVersion: 2,
      dispatchRevisionId: currentRevision.id,
      dispatchRevisionFingerprint: currentRevision.fingerprint,
      requestId: currentDispatch.target.requestId,
      requestVersion: currentDispatch.target.requestVersion,
      requestRevisionId: currentDispatch.target.revisionId,
      contentApprovalId: currentDispatch.target.approvalId,
    },
    snapshot: {
      recipientCount: 1,
      payload: currentRevision.payload,
      privacySnapshot: currentRevision.privacySnapshot,
    },
  });
  expect(approvals[1].target.dispatchRevisionId).not.toBe(approvals[0].target.dispatchRevisionId);
  expect(approvals[1].snapshot.recipients).toHaveLength(1);
});

test("T6-D rolls back failed approval writes before changing the visible or persisted lifecycle", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createCurrentProductDispatchDraft(page);
  await page.getByTestId("dispatch-plan-review").click();
  await page.getByTestId("dispatch-plan-acknowledgement").check();

  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Object.defineProperty(window, "__t6dNativeSetItem", { value: nativeSetItem, configurable: true });
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-dispatch-plan-approvals:v1") throw new DOMException("Dispatch plan approval write failed", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("dispatch-plan-approval-create").click();
  await expect(page.getByTestId("dispatch-plan-approval-storage-error")).toBeVisible();
  await expect(page.getByTestId("dispatch-plan-approval-create")).toBeVisible();
  await expect(page.getByTestId("dispatch-plan-approval-status")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-dispatch-plan-approvals:v1"))).toBeNull();

  await page.evaluate(() => {
    Storage.prototype.setItem = (window as Window & { __t6dNativeSetItem: typeof Storage.prototype.setItem }).__t6dNativeSetItem;
  });
  await page.getByTestId("dispatch-plan-approval-create").click();
  await expect(page.getByTestId("dispatch-plan-approval-status")).toContainText("در انتظار تأیید");
  const pendingStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-dispatch-plan-approvals:v1"));

  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-dispatch-plan-approvals:v1") throw new DOMException("Dispatch plan approval decision failed", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("dispatch-plan-approval-approve").click();
  await expect(page.getByTestId("dispatch-plan-approval-storage-error")).toBeVisible();
  await expect(page.getByTestId("dispatch-plan-approval-status")).toContainText("در انتظار تأیید");
  await expect(page.getByTestId("dispatch-plan-approval-approve")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-dispatch-plan-approvals:v1"))).toBe(pendingStore);

  await page.evaluate(() => {
    Storage.prototype.setItem = (window as Window & { __t6dNativeSetItem: typeof Storage.prototype.setItem }).__t6dNativeSetItem;
  });
});

test("T6-D fails closed on a tampered approval without locking the valid dispatch preview", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createCurrentProductDispatchDraft(page);
  await page.getByTestId("dispatch-plan-review").click();
  await page.getByTestId("dispatch-plan-acknowledgement").check();
  await page.getByTestId("dispatch-plan-approval-create").click();
  await page.getByTestId("dispatch-plan-approval-approve").click();
  await page.evaluate(() => {
    const key = "chida-prototype-project-dispatch-plan-approvals:v1";
    const records = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    records[0].sendAuthorized = true;
    window.localStorage.setItem(key, JSON.stringify(records));
  });

  await reopenFirstPurchaseRequestDispatch(page);
  await expect(page.getByTestId("dispatch-draft-preview")).toBeVisible();
  await expect(page.getByTestId("dispatch-plan-approval-read-error")).toBeVisible();
  await expect(page.getByTestId("dispatch-draft-save")).toBeEnabled();
  await page.getByTestId("dispatch-plan-review").click();
  await page.getByTestId("dispatch-plan-acknowledgement").check();
  await expect(page.getByTestId("dispatch-plan-approval-create")).toBeDisabled();
  expect(await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-plan-approvals:v1") ?? "[]")[0].sendAuthorized)).toBe(true);
});

test("T6-D rejects a temporally impossible approval before its exact dependencies existed", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createCurrentProductDispatchDraft(page);
  await page.getByTestId("dispatch-plan-review").click();
  await page.getByTestId("dispatch-plan-acknowledgement").check();
  await page.getByTestId("dispatch-plan-approval-create").click();
  await page.evaluate(() => {
    const approvalsKey = "chida-prototype-project-dispatch-plan-approvals:v1";
    const dispatchKey = "chida-prototype-project-dispatch-drafts:v1";
    const records = JSON.parse(window.localStorage.getItem(approvalsKey) ?? "[]");
    const dispatch = JSON.parse(window.localStorage.getItem(dispatchKey) ?? "[]")[0];
    const revision = dispatch.revisions.at(-1);
    const impossibleTimestamp = new Date(new Date(revision.createdAt).getTime() - 1000).toISOString();
    records[0].requestedAt = impossibleTimestamp;
    records[0].createdAt = impossibleTimestamp;
    records[0].updatedAt = impossibleTimestamp;
    records[0].history[0].at = impossibleTimestamp;
    window.localStorage.setItem(approvalsKey, JSON.stringify(records));
  });

  await reopenFirstPurchaseRequestDispatch(page);
  await expect(page.getByTestId("dispatch-draft-preview")).toBeVisible();
  await expect(page.getByTestId("dispatch-plan-approval-read-error")).toBeVisible();
  await page.getByTestId("dispatch-plan-review").click();
  await page.getByTestId("dispatch-plan-acknowledgement").check();
  await expect(page.getByTestId("dispatch-plan-approval-create")).toBeDisabled();
});

test("T7-A records a two-item product proposal with exact lineage, separated provenance, unknowns, and project isolation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-files-entry").click();
  await page.getByTestId("project-file-input").setInputFiles({
    name: "پیش‌فاکتور دستی.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n% synthetic T7-A reference"),
  });
  await page.getByTestId("project-file-register").click();
  await page.getByTestId("project-files-back").click();
  await page.getByTestId("project-space-back").click();

  await createTwoItemProductProposalPrerequisites(page);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"))).toBeNull();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-dispatch-plan-approvals:v1"))).toBeNull();
  const overlongFileName = `${"ف".repeat(141)}.pdf`;
  await page.evaluate((displayName) => {
    const key = "chida-prototype-project-files:v1";
    const files = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    files.push({ ...files[0], id: `${files[0].id}-overlong`, displayName });
    window.localStorage.setItem(key, JSON.stringify(files));
  }, overlongFileName);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();

  const appOrigin = new URL(page.url()).origin;
  const externalRequests: string[] = [];
  const requestListener = (request: Request) => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== appOrigin) externalRequests.push(request.url());
  };
  page.on("request", requestListener);
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("project-proposals-view")).toBeVisible();
  await expect(page.getByTestId("proposal-inbox-honesty")).toContainText("صندوق دستی");
  await page.getByTestId("proposal-add").click();
  await expect(page.getByTestId("proposal-editor-title")).toBeFocused();
  await expect(page.getByTestId("proposal-request-select")).not.toHaveValue("");
  await page.getByTestId("proposal-supplier-select").selectOption({ label: "فولاد پیشنهاد دستی · محصول" });
  await expect(page.getByTestId("proposal-file-select").locator("option")).toHaveCount(2);
  await expect(page.getByTestId("proposal-file-select")).not.toContainText(overlongFileName);
  await page.getByTestId("proposal-file-select").selectOption({ label: "پیش‌فاکتور دستی.pdf · پیش‌فاکتور" });
  await page.getByTestId("proposal-declared-at").fill("۱۴۰۵/۰۶/۰۶");
  await page.getByTestId("proposal-transcript").fill("قیمت سیمان اعلام شد و بلوک فعلاً موجود نیست.");
  await page.getByTestId("proposal-line-quantity-0").fill("۵");
  await page.getByTestId("proposal-line-unit-0").fill("تن");
  await page.getByTestId("proposal-line-unit-price-0").fill("4300000");
  await page.getByTestId("proposal-line-total-price-0").fill("21500000");
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-form-error")).toContainText("وضعیت اعلامی");
  await expect(page.getByTestId("proposal-line-status-0")).toBeFocused();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBeNull();
  await page.getByTestId("proposal-line-status-0").selectOption("quoted");
  await page.getByTestId("proposal-line-status-1").selectOption("unavailable");
  await page.getByTestId("proposal-save").click();

  await expect(page.getByTestId("proposal-detail")).toBeVisible();
  await expect(page.getByTestId("proposal-detail-hero")).toBeFocused();
  await expect(page.getByTestId("proposal-effective-status")).toContainText("نسخهٔ جاری");
  await expect(page.getByTestId("proposal-reference")).toContainText("فقط شناسنامهٔ محلی");
  await expect(page.getByTestId("proposal-line-card")).toHaveCount(2);
  await expect(page.getByTestId("proposal-line-card").nth(1)).toContainText("نامشخص");
  expect(await page.getByTestId("proposal-detail").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

  const stored = await page.evaluate(() => {
    const proposals = JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]");
    const requests = JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]");
    const approvals = JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]");
    const contacts = JSON.parse(window.localStorage.getItem("chida-prototype-project-supplier-contacts:v1") ?? "[]");
    return { proposal: proposals[0], request: requests[0], approval: approvals[0], contact: contacts[0] };
  });
  const exactReview = stored.request.reviewRevisions.find((revision: { id: string }) => revision.id === stored.approval.target.revisionId);
  expect(stored.proposal).toMatchObject({
    schemaVersion: 1,
    projectId: stored.request.projectId,
    source: "ثبت دستی سازنده",
    networkStatus: "خارج از شبکه چیدا",
    supplierAuthenticated: false,
    receivedThroughChida: false,
    externalEffect: "none",
    target: {
      requestId: stored.request.id,
      requestVersion: stored.request.version,
      reviewRevisionId: exactReview.id,
      reviewRevisionFingerprint: exactReview.fingerprint,
      contentApprovalId: stored.approval.id,
      requestKind: "product",
    },
    supplierSnapshot: { supplierContactId: stored.contact.id, supplierContactVersion: 1, displayName: "فولاد پیشنهاد دستی" },
    reference: { kind: "project-file-metadata", contentPersisted: false, extractionPerformed: false, fileSnapshot: { displayName: "پیش‌فاکتور دستی.pdf", storageMode: "metadata-only" } },
    version: 1,
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
  });
  expect(stored.proposal.revisions).toHaveLength(1);
  expect(stored.proposal.history).toHaveLength(1);
  expect(stored.proposal.revisions[0].lines.map((line: { requestItemId: string }) => line.requestItemId)).toEqual(exactReview.snapshot.items.map((item: { id: string }) => item.id));
  expect(stored.proposal.revisions[0].lines[0]).toMatchObject({ status: "quoted", quantity: "5", unit: "تن", unitPrice: "4300000", totalPrice: "21500000", tax: null, transport: null, minimumOrder: null, leadTime: null, validity: null, paymentTerms: null });
  expect(stored.proposal.revisions[0].lines[1]).toMatchObject({ status: "unavailable", quantity: null, unit: null, unitPrice: null, totalPrice: null });
  expect(stored.proposal).not.toHaveProperty("sendAuthorized");
  expect(stored.proposal).not.toHaveProperty("orderId");
  expect(externalRequests).toEqual([]);
  page.off("request", requestListener);

  await page.getByTestId("proposal-detail-back").click();
  await page.getByTestId("proposals-back").click();
  await page.getByTestId("project-switcher").click();
  await page.getByTestId("projects-sheet-add").click();
  await page.getByTestId("new-project-name-input").fill("پروژه جداگانه");
  await page.getByTestId("new-project-location-input").fill("منطقهٔ ۵");
  await chooseProjectOption(page, "new-project-stage-select", "فونداسیون");
  await page.getByTestId("new-project-save").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-empty-state")).toBeVisible();
  await expect(page.getByTestId("proposal-card")).toHaveCount(0);
  await expect(page.getByTestId("proposal-add")).toBeDisabled();
  const pageErrors: string[] = [];
  const pageErrorListener = (error: Error) => pageErrors.push(error.message);
  page.on("pageerror", pageErrorListener);
  await page.evaluate(() => {
    const key = "chida-prototype-builder-recorded-proposals:v1";
    const proposals = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    proposals[0].id = "proposal:id\"]\\unusual";
    window.localStorage.setItem(key, JSON.stringify(proposals));
  });

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /برج نیلوفر تهران/ }).click();
  await page.getByTestId("project-space-back").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-card")).toHaveCount(1);
  await expect(page.getByTestId("proposal-card")).toContainText("فولاد پیشنهاد دستی");
  await page.getByTestId("proposal-card").click();
  await expect(page.getByTestId("proposal-detail-hero")).toBeFocused();
  await page.getByTestId("proposal-detail-back").click();
  await expect(page.getByTestId("proposal-card")).toBeFocused();
  expect(pageErrors).toEqual([]);
  page.off("pageerror", pageErrorListener);
});

test("T7-A keeps service proposals independent from product items and preserves explicit unknown values", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createServiceProposalPrerequisites(page);
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-add").click();
  await page.getByTestId("proposal-supplier-select").selectOption({ label: "مجری پیشنهاد دستی · خدمت" });
  await page.getByTestId("proposal-transcript").fill("مجری روش جایگزین و موعد ده روزه را اعلام کرد.");
  await page.getByTestId("proposal-line-status-0").selectOption("alternative");
  await page.getByTestId("proposal-line-editor").locator("summary").click();
  await page.getByTestId("proposal-line-leadTime-0").fill("۱۰ روز کاری");
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-detail")).toContainText("خدمت");

  const stored = await page.evaluate(() => {
    const proposal = JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]")[0];
    const request = JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]")[0];
    return { proposal, request };
  });
  const review = stored.request.reviewRevisions.at(-1);
  expect(stored.proposal.target.requestKind).toBe("service");
  expect(stored.proposal.requestSnapshot.items).toEqual([]);
  expect(stored.proposal.requestSnapshot.service.id).toBe(review.snapshot.service.id);
  expect(stored.proposal.revisions[0].lines).toHaveLength(1);
  expect(stored.proposal.revisions[0].lines[0]).toMatchObject({ requestItemId: null, serviceSpecId: review.snapshot.service.id, status: "alternative", quantity: null, unit: null, unitPrice: null, totalPrice: null, leadTime: "۱۰ روز کاری" });
});

test("T7-A treats unchanged edits as a no-op, versions real edits, and keeps an archived-contact proposal historical", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createTwoItemProductProposalPrerequisites(page, "فولاد تاریخچه پیشنهاد");
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-add").click();
  await page.getByTestId("proposal-supplier-select").selectOption({ label: "فولاد تاریخچه پیشنهاد · محصول" });
  await page.getByTestId("proposal-transcript").fill("رونویسی نسخهٔ نخست");
  await page.getByTestId("proposal-line-status-0").selectOption("quoted");
  await page.getByTestId("proposal-line-unit-price-0").fill("4100000");
  await page.getByTestId("proposal-save").click();

  const firstStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));
  await page.getByTestId("proposal-edit").click();
  await expect(page.getByTestId("proposal-editor-title")).toBeFocused();
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-detail-hero")).toBeFocused();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(firstStore);

  await page.getByTestId("proposal-edit").click();
  await expect(page.getByTestId("proposal-editor-title")).toBeFocused();
  await page.getByTestId("proposal-notes").fill("برای بازبینی شرایط پرداخت");
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-detail-hero")).toBeFocused();
  const versioned = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]")[0]);
  expect(versioned.version).toBe(2);
  expect(versioned.revisions).toHaveLength(2);
  expect(versioned.history.map((event: { type: string }) => event.type)).toEqual(["created", "updated"]);
  await expect(page.getByTestId("proposal-revision-select")).toBeVisible();
  await page.getByTestId("proposal-revision-select").selectOption({ index: 1 });
  await expect(page.getByTestId("proposal-detail")).toContainText("نسخهٔ رونویسی");

  await page.getByTestId("proposal-detail-back").click();
  await page.getByTestId("proposals-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await page.getByTestId("purchase-request-open-dispatch").click();
  await page.getByTestId("supplier-contact-card").filter({ hasText: "فولاد تاریخچه پیشنهاد" }).getByTestId("supplier-contact-status").click();
  await returnFromDispatchToHome(page);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-card")).toContainText("تاریخی · بازبینی");
  await page.getByTestId("proposal-card").click();
  await expect(page.getByTestId("proposal-detail-hero")).toBeFocused();
  await expect(page.getByTestId("proposal-effective-status")).toContainText("نیازمند بازبینی");
  expect(await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]")[0])).toEqual(versioned);
});

test("T7-A rejects a coordinated proposal claimed to be created after its supplier contact was archived", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createTwoItemProductProposalPrerequisites(page, "فولاد ترتیب تماس");
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-add").click();
  await page.getByTestId("proposal-supplier-select").selectOption({ label: "فولاد ترتیب تماس · محصول" });
  await page.getByTestId("proposal-transcript").fill("رونویسی معتبر پیش از آرشیو تماس");
  await page.getByTestId("proposal-save").click();
  await page.getByTestId("proposal-detail-back").click();
  await page.getByTestId("proposals-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await page.getByTestId("purchase-request-open-dispatch").click();
  await page.getByTestId("supplier-contact-card").filter({ hasText: "فولاد ترتیب تماس" }).getByTestId("supplier-contact-status").click();

  const records = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]"));
  const contacts = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-supplier-contacts:v1") ?? "[]"));
  const archivedContact = contacts.find((contact: { displayName: string }) => contact.displayName === "فولاد ترتیب تماس");
  const claimedCreatedAt = new Date(new Date(archivedContact.history.at(-1).at).getTime() + 1).toISOString();
  records[0].createdAt = claimedCreatedAt;
  records[0].updatedAt = claimedCreatedAt;
  records[0].history[0].at = claimedCreatedAt;
  records[0].revisions[0].createdAt = claimedCreatedAt;
  refreshProposalRevisionFingerprint(records[0]);
  await page.evaluate((nextRecords) => window.localStorage.setItem("chida-prototype-builder-recorded-proposals:v1", JSON.stringify(nextRecords)), records);
  const tamperedStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-storage-error")).toBeVisible();
  await expect(page.getByTestId("proposal-card")).toHaveCount(0);
  await expect(page.getByTestId("proposal-add")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(tamperedStore);
});

test("T7-A rejects a coordinated proposal claimed to be created after its request returned to draft", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createTwoItemProductProposalPrerequisites(page, "فولاد ترتیب درخواست");
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-add").click();
  await page.getByTestId("proposal-supplier-select").selectOption({ label: "فولاد ترتیب درخواست · محصول" });
  await page.getByTestId("proposal-transcript").fill("رونویسی معتبر پیش از بازگشت درخواست");
  await page.getByTestId("proposal-save").click();
  await page.getByTestId("proposal-detail-back").click();
  await page.getByTestId("proposals-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await page.getByTestId("purchase-request-return-draft").click();

  const records = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]"));
  const requests = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]"));
  const claimedCreatedAt = new Date(new Date(requests[0].history.at(-1).at).getTime() + 1).toISOString();
  records[0].createdAt = claimedCreatedAt;
  records[0].updatedAt = claimedCreatedAt;
  records[0].history[0].at = claimedCreatedAt;
  records[0].revisions[0].createdAt = claimedCreatedAt;
  refreshProposalRevisionFingerprint(records[0]);
  await page.evaluate((nextRecords) => window.localStorage.setItem("chida-prototype-builder-recorded-proposals:v1", JSON.stringify(nextRecords)), records);
  const tamperedStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-storage-error")).toBeVisible();
  await expect(page.getByTestId("proposal-card")).toHaveCount(0);
  await expect(page.getByTestId("proposal-add")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(tamperedStore);
});

test("T7-A preserves exact decimal strings and rejects a coordinated repeated semantic revision", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createTwoItemProductProposalPrerequisites(page, "فولاد اعداد دقیق");
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-add").click();
  await page.getByTestId("proposal-supplier-select").selectOption({ label: "فولاد اعداد دقیق · محصول" });
  await page.getByTestId("proposal-line-status-0").selectOption("quoted");
  await page.getByTestId("proposal-line-unit-price-0").fill("9007199254740993");
  await page.getByTestId("proposal-line-total-price-0").fill(".0000001");
  await installBackwardBrowserClock(page);
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-detail")).toBeVisible();

  let records = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]"));
  expect(records[0].revisions[0].lines[0].unitPrice).toBe("9007199254740993");
  expect(records[0].revisions[0].lines[0].totalPrice).toBe("0.0000001");
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-storage-error")).toHaveCount(0);
  await expect(page.getByTestId("proposal-card")).toHaveCount(1);

  records = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]"));
  const proposal = records[0];
  const repeatedAt = new Date(new Date(proposal.updatedAt).getTime() + 1).toISOString();
  const repeatedRevision = JSON.parse(JSON.stringify(proposal.revisions[0]));
  repeatedRevision.id = "builder-recorded-proposal-revision-coordinated-no-op";
  repeatedRevision.version = 2;
  repeatedRevision.createdAt = repeatedAt;
  proposal.version = 2;
  proposal.updatedAt = repeatedAt;
  proposal.currentRevisionId = repeatedRevision.id;
  proposal.history.push({ id: "builder-recorded-proposal-event-coordinated-no-op", type: "updated", actor: "شما", at: repeatedAt, version: 2 });
  proposal.revisions.push(repeatedRevision);
  refreshProposalRevisionFingerprint(proposal, 1);
  await page.evaluate((nextRecords) => window.localStorage.setItem("chida-prototype-builder-recorded-proposals:v1", JSON.stringify(nextRecords)), records);
  const tamperedStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-storage-error")).toBeVisible();
  await expect(page.getByTestId("proposal-card")).toHaveCount(0);
  await expect(page.getByTestId("proposal-add")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(tamperedStore);
});

test("T7-A fail-closes an otherwise well-formed unsupported supplier-contact update", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createTwoItemProductProposalPrerequisites(page, "فولاد تماس بدون revision");
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-add").click();
  await page.getByTestId("proposal-supplier-select").selectOption({ label: "فولاد تماس بدون revision · محصول" });
  await page.getByTestId("proposal-transcript").fill("رونویسی پیش از تغییر پشتیبانی‌نشدهٔ تماس");
  await page.getByTestId("proposal-save").click();
  const proposalStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));

  await page.evaluate(() => {
    const key = "chida-prototype-project-supplier-contacts:v1";
    const contacts = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    const contact = contacts.find((item: { displayName: string }) => item.displayName === "فولاد تماس بدون revision");
    const updatedAt = new Date(new Date(contact.updatedAt).getTime() + 1).toISOString();
    contact.version = 2;
    contact.updatedAt = updatedAt;
    contact.status = "active";
    contact.archivedAt = null;
    contact.history.push({ id: "supplier-contact-event-unsupported-update", type: "updated", actor: "شما", at: updatedAt, version: 2 });
    window.localStorage.setItem(key, JSON.stringify(contacts));
  });
  const contactStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-supplier-contacts:v1"));

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-storage-error")).toBeVisible();
  await expect(page.getByTestId("proposal-card")).toHaveCount(0);
  await expect(page.getByTestId("proposal-add")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(proposalStore);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-supplier-contacts:v1"))).toBe(contactStore);
});

test("T7-A rolls back failed writes and fails closed on a tampered proposal record", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createTwoItemProductProposalPrerequisites(page, "فولاد خطای ذخیره");
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-add").click();
  await page.getByTestId("proposal-supplier-select").selectOption({ label: "فولاد خطای ذخیره · محصول" });
  await page.getByTestId("proposal-transcript").fill("رونویسی برای آزمون شکست ذخیره");
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Object.defineProperty(window, "__proposalNativeSetItem", { value: nativeSetItem, configurable: true });
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-builder-recorded-proposals:v1") throw new DOMException("Proposal write failed", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-form-error")).toContainText("ثبت پیشنهاد انجام نشد");
  await expect(page.getByTestId("proposal-editor")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBeNull();

  await page.evaluate(() => {
    Storage.prototype.setItem = (window as Window & { __proposalNativeSetItem: typeof Storage.prototype.setItem }).__proposalNativeSetItem;
  });
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-detail")).toBeVisible();
  const versionOneStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));
  await page.getByTestId("proposal-edit").click();
  await page.getByTestId("proposal-notes").fill("ویرایش معنادار با شکست نوشتن");
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-builder-recorded-proposals:v1") throw new DOMException("Proposal update failed", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-form-error")).toContainText("ثبت ویرایش انجام نشد");
  await expect(page.getByTestId("proposal-editor")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(versionOneStore);

  await page.evaluate(() => {
    Storage.prototype.setItem = (window as Window & { __proposalNativeSetItem: typeof Storage.prototype.setItem }).__proposalNativeSetItem;
  });
  await page.getByTestId("proposal-editor-back").click();
  await expect(page.getByTestId("proposal-detail")).toContainText("نسخهٔ رونویسی");
  await expect(page.getByTestId("proposal-detail")).toContainText("۱ از ۱");
  await page.getByTestId("proposal-edit").click();
  await page.getByTestId("proposal-notes").fill("ویرایش معنادار پس از بازیابی");
  await installBackwardBrowserClock(page);
  await page.getByTestId("proposal-save").click();
  const records = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]"));
  expect(records[0].version).toBe(2);
  expect(records[0].revisions).toHaveLength(2);
  expect(records[0].history).toHaveLength(2);
  const validVersionTwoRecords = JSON.parse(JSON.stringify(records));
  records[0].revisions[1].lines[0].requestItemId = "foreign-request-item";
  refreshProposalRevisionFingerprint(records[0], 1);
  await page.evaluate((nextRecords) => {
    window.localStorage.setItem("chida-prototype-builder-recorded-proposals:v1", JSON.stringify(nextRecords));
  }, records);
  const tamperedStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-storage-error")).toBeVisible();
  await expect(page.getByTestId("proposal-card")).toHaveCount(0);
  await expect(page.getByTestId("proposal-add")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(tamperedStore);

  validVersionTwoRecords[0].supplierSnapshot.displayName = "نام دستکاری‌شدهٔ هماهنگ";
  validVersionTwoRecords[0].revisions.forEach((_revision: unknown, index: number) => refreshProposalRevisionFingerprint(validVersionTwoRecords[0], index));
  await page.evaluate((nextRecords) => window.localStorage.setItem("chida-prototype-builder-recorded-proposals:v1", JSON.stringify(nextRecords)), validVersionTwoRecords);
  const supplierTamperedStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-storage-error")).toBeVisible();
  await expect(page.getByTestId("proposal-card")).toHaveCount(0);
  await expect(page.getByTestId("proposal-add")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(supplierTamperedStore);
});

test("T7-B1 builds an exact product comparison without mutating its sources and keeps the decision independent", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { firstSupplier, secondSupplier } = await createTwoCurrentProductProposalsForComparison(page);
  const sourceStoresBeforeComparison = await page.evaluate(() => ({
    proposals: window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"),
    requests: window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"),
    approvals: window.localStorage.getItem("chida-prototype-project-approvals:v1"),
    dispatch: window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"),
  }));
  const sourceProposals = JSON.parse(sourceStoresBeforeComparison.proposals ?? "[]");
  const firstProposal = sourceProposals.find((proposal: { supplierSnapshot: { displayName: string } }) => proposal.supplierSnapshot.displayName === firstSupplier);
  const secondProposal = sourceProposals.find((proposal: { supplierSnapshot: { displayName: string } }) => proposal.supplierSnapshot.displayName === secondSupplier);
  expect(firstProposal).toBeTruthy();
  expect(secondProposal).toBeTruthy();

  const appOrigin = new URL(page.url()).origin;
  const externalRequests: string[] = [];
  const requestListener = (request: Request) => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== appOrigin) externalRequests.push(request.url());
  };
  page.on("request", requestListener);

  await page.getByTestId("proposal-comparisons-entry").click();
  await expect(page.getByTestId("proposal-comparisons-view")).toBeVisible();
  await page.getByTestId("comparison-add").click();
  await expect(page.getByTestId("comparison-editor-title")).toBeFocused();
  await expect(page.getByTestId("comparison-request-select")).not.toHaveValue("");
  await expect(page.getByTestId("comparison-supplier-editor")).toHaveCount(2);

  const firstEditor = comparisonSupplierEditor(page, firstSupplier);
  await firstEditor.getByTestId(/^comparison-tax-mode-/).selectOption("rate");
  await firstEditor.getByTestId(/^comparison-tax-value-/).fill("۹");
  await firstEditor.getByTestId(/^comparison-tax-assumption-/).fill("مالیات ۹ درصد جدا از مبلغ اعلامی");
  await firstEditor.getByTestId(/^comparison-transport-mode-/).selectOption("fixed");
  await firstEditor.getByTestId(/^comparison-transport-value-/).fill("۱۰۰۰۰۰۰");
  await firstEditor.getByTestId(/^comparison-transport-assumption-/).fill("حمل ثابت تا پروژه");

  const secondEditor = comparisonSupplierEditor(page, secondSupplier);
  await secondEditor.getByTestId(/^comparison-basis-/).selectOption("unit-price-times-adjusted-quantity");
  await secondEditor.getByTestId(/^comparison-adjusted-quantity-/).fill("۵۰۰۰");
  await expect(secondEditor.getByTestId(/^comparison-adjusted-unit-/)).toHaveValue("کیلوگرم");
  await secondEditor.getByTestId(/^comparison-assumption-/).fill("۵۰۰۰ کیلوگرم برابر مقدار پنج تن درخواست است");
  await secondEditor.getByTestId(/^comparison-tax-mode-/).selectOption("included");
  await secondEditor.getByTestId(/^comparison-tax-assumption-/).fill("مالیات داخل مبلغ اعلامی است");
  await secondEditor.getByTestId(/^comparison-transport-mode-/).selectOption("fixed");
  await secondEditor.getByTestId(/^comparison-transport-value-/).fill("۲۰۰۰۰۰۰");
  await secondEditor.getByTestId(/^comparison-transport-assumption-/).fill("حمل ثابت تا پروژه");

  await expect(firstEditor.getByTestId(/^comparison-live-total-/)).toContainText("۲۴٬۴۳۵٬۰۰۰ تومان");
  await expect(secondEditor.getByTestId(/^comparison-live-total-/)).toContainText("۲۳٬۰۰۰٬۰۰۰ تومان");
  await expect(page.getByTestId("comparison-recommendation-preview")).toContainText(`نامزد بررسی: ${secondSupplier}`);
  await page.getByTestId("comparison-save").click();

  await expect(page.getByTestId("comparison-detail")).toBeVisible();
  await expect(page.getByTestId("comparison-detail-hero")).toBeFocused();
  await expect(page.getByTestId("comparison-result-card")).toHaveCount(2);
  await expect(page.getByTestId("comparison-recommendation")).toContainText(secondSupplier);
  expect(await page.getByTestId("comparison-detail").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  for (const resultCard of await page.getByTestId("comparison-result-card").all()) {
    expect(await resultCard.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  }

  const comparisonStoreBeforeDecision = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"));
  const comparisons = JSON.parse(comparisonStoreBeforeDecision ?? "[]");
  expect(comparisons).toHaveLength(1);
  const comparison = comparisons[0];
  const comparisonRevision = comparison.revisions[0];
  const firstResult = comparisonRevision.results.find((result: { proposalId: string }) => result.proposalId === firstProposal.id);
  const secondResult = comparisonRevision.results.find((result: { proposalId: string }) => result.proposalId === secondProposal.id);
  expect(comparison).toMatchObject({
    schemaVersion: 1,
    projectId: firstProposal.projectId,
    purpose: "compare-builder-recorded-product-proposals",
    target: {
      requestId: firstProposal.target.requestId,
      requestVersion: firstProposal.target.requestVersion,
      reviewRevisionId: firstProposal.target.reviewRevisionId,
      reviewRevisionFingerprint: firstProposal.target.reviewRevisionFingerprint,
      requestKind: "product",
    },
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    externalEffect: "none",
    networkUsed: false,
    aiUsed: false,
    version: 1,
  });
  expect(comparison.history.map((event: { type: string }) => event.type)).toEqual(["created"]);
  expect(comparisonRevision.inputs).toHaveLength(2);
  expect(comparisonRevision.recommendation).toMatchObject({
    criterion: "lowest-complete-normalized-total",
    status: "conditional",
    candidateProposalId: secondProposal.id,
    tiedProposalIds: [],
  });
  expect(firstResult).toMatchObject({
    proposalId: firstProposal.id,
    subtotal: "21500000",
    taxAmount: "1935000",
    transportAmount: "1000000",
    normalizedTotal: "24435000",
    coverage: "complete",
  });
  expect(firstResult.lines[0].calculation).toMatchObject({
    formula: "قیمت کل اعلامی 21500000 تومان",
    basisAmount: "21500000",
    normalizedLineTotal: "21500000",
    status: "complete",
    rounding: "none",
  });
  expect(secondResult).toMatchObject({
    proposalId: secondProposal.id,
    subtotal: "21000000",
    taxAmount: "0",
    transportAmount: "2000000",
    normalizedTotal: "23000000",
    coverage: "complete",
  });
  expect(secondResult.lines[0].calculation).toMatchObject({
    formula: "4200 × 5000 کیلوگرم",
    basisAmount: "21000000",
    normalizedLineTotal: "21000000",
    status: "complete",
    rounding: "none",
  });
  expect(JSON.stringify(comparison)).not.toMatch(/"(?:orderId|sent|sentAt|purchaseAuthorized|sendAuthorized)":/);
  expect(await page.evaluate(() => ({
    proposals: window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"),
    requests: window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"),
    approvals: window.localStorage.getItem("chida-prototype-project-approvals:v1"),
    dispatch: window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"),
  }))).toEqual(sourceStoresBeforeComparison);

  await page.getByTestId("comparison-decision-outcome").selectOption("preferred-for-follow-up");
  await page.getByTestId("comparison-decision-proposal").selectOption(secondProposal.id);
  await page.getByTestId("comparison-decision-reason").fill("بر پایهٔ مبلغ هم‌سطح کمتر، فقط برای ادامهٔ بررسی انتخاب شد.");
  await page.getByTestId("comparison-decision-save").click();
  await expect(page.getByTestId("comparison-decision-history")).toBeVisible();

  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"))).toBe(comparisonStoreBeforeDecision);
  const decisionStoreBeforeReload = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparison-decisions:v1"));
  const decisions = JSON.parse(decisionStoreBeforeReload ?? "[]");
  expect(decisions).toHaveLength(1);
  const decision = decisions[0];
  const decisionRevision = decision.revisions[0];
  expect(decision).toMatchObject({
    schemaVersion: 1,
    projectId: firstProposal.projectId,
    purpose: "record-local-proposal-comparison-decision",
    target: {
      comparisonId: comparison.id,
      comparisonVersion: 1,
      comparisonRevisionId: comparisonRevision.id,
      comparisonRevisionFingerprint: comparisonRevision.fingerprint,
    },
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    externalEffect: "none",
    sendAuthorized: false,
    purchaseAuthorized: false,
    supplierNotified: false,
    version: 1,
  });
  expect(decisionRevision).toMatchObject({
    version: 1,
    outcome: "preferred-for-follow-up",
    selectedProposalId: secondProposal.id,
    reason: "بر پایهٔ مبلغ هم‌سطح کمتر، فقط برای ادامهٔ بررسی انتخاب شد.",
  });
  expect(decision.history.map((event: { type: string }) => event.type)).toEqual(["created"]);
  expect(await page.evaluate(() => ({
    proposals: window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"),
    requests: window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"),
    approvals: window.localStorage.getItem("chida-prototype-project-approvals:v1"),
    dispatch: window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"),
  }))).toEqual(sourceStoresBeforeComparison);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-comparisons-entry").click();
  await expect(page.getByTestId("comparison-card")).toHaveCount(1);
  await page.getByTestId("comparison-card").click();
  await expect(page.getByTestId("comparison-recommendation")).toContainText(secondSupplier);
  await expect(page.getByTestId("comparison-decision-history")).toContainText("ادامهٔ بررسی با یک پیشنهاد");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"))).toBe(comparisonStoreBeforeDecision);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparison-decisions:v1"))).toBe(decisionStoreBeforeReload);
  expect(externalRequests).toEqual([]);
  page.off("request", requestListener);
});

test("T7-B1 canonicalizes a temporary 201-digit decimal coefficient before enforcing the result limit", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const boundarySubtotal = "9".repeat(199);
  const canonicalBoundaryTotal = `1${"0".repeat(199)}`;
  const { firstSupplier, secondSupplier } = await createTwoCurrentProductProposalsForComparison(page, { firstTotalPrice: boundarySubtotal });
  const proposals = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]"));
  const firstProposal = proposals.find((proposal: { supplierSnapshot: { displayName: string } }) => proposal.supplierSnapshot.displayName === firstSupplier);

  await page.getByTestId("proposal-comparisons-entry").click();
  await page.getByTestId("comparison-add").click();
  const firstEditor = comparisonSupplierEditor(page, firstSupplier);
  await firstEditor.getByTestId(/^comparison-tax-mode-/).selectOption("fixed");
  await firstEditor.getByTestId(/^comparison-tax-value-/).fill("۰٫۵");
  await firstEditor.getByTestId(/^comparison-tax-assumption-/).fill("نیم تومان مبلغ ثابت برای آزمون مرزی");
  await firstEditor.getByTestId(/^comparison-transport-mode-/).selectOption("fixed");
  await firstEditor.getByTestId(/^comparison-transport-value-/).fill("۰٫۵");
  await firstEditor.getByTestId(/^comparison-transport-assumption-/).fill("نیم تومان حمل ثابت برای آزمون مرزی");

  const secondEditor = comparisonSupplierEditor(page, secondSupplier);
  await secondEditor.getByTestId(/^comparison-tax-mode-/).selectOption("included");
  await secondEditor.getByTestId(/^comparison-tax-assumption-/).fill("داخل مبلغ اعلامی");
  await secondEditor.getByTestId(/^comparison-transport-mode-/).selectOption("included");
  await secondEditor.getByTestId(/^comparison-transport-assumption-/).fill("داخل مبلغ اعلامی");
  await page.getByTestId("comparison-save").click();
  await expect(page.getByTestId("comparison-detail")).toBeVisible();

  const comparisons = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1") ?? "[]"));
  const firstResult = comparisons[0].revisions[0].results.find((result: { proposalId: string }) => result.proposalId === firstProposal.id);
  expect(firstResult).toMatchObject({
    subtotal: boundarySubtotal,
    taxAmount: "0.5",
    transportAmount: "0.5",
    normalizedTotal: canonicalBoundaryTotal,
    coverage: "complete",
    missingReasons: [],
  });
  expect(firstResult.normalizedTotal).toHaveLength(200);
  expect(firstResult.normalizedTotal).toMatch(/^10{199}$/);
});

test("T7-B1 keeps unknown comparison data incomplete and rolls back a failed comparison write", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { secondSupplier } = await createTwoCurrentProductProposalsForComparison(page);
  const sourceStoresBeforeComparison = await page.evaluate(() => ({
    proposals: window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"),
    requests: window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"),
    approvals: window.localStorage.getItem("chida-prototype-project-approvals:v1"),
    dispatch: window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"),
  }));

  await page.getByTestId("proposal-comparisons-entry").click();
  await page.getByTestId("comparison-add").click();
  const secondEditor = comparisonSupplierEditor(page, secondSupplier);
  await secondEditor.getByTestId(/^comparison-basis-/).selectOption("unit-price-times-adjusted-quantity");
  await secondEditor.getByTestId(/^comparison-adjusted-quantity-/).fill("۵۰۰۰");
  await expect(secondEditor.getByTestId(/^comparison-adjusted-unit-/)).toHaveValue("کیلوگرم");
  await secondEditor.getByTestId(/^comparison-assumption-/).fill("۵۰۰۰ کیلوگرم برابر مقدار پنج تن درخواست است");
  await expect(page.getByTestId("comparison-recommendation-preview")).toContainText("داده برای جمع‌بندی کافی نیست");

  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Object.defineProperty(window, "__comparisonNativeSetItem", { value: nativeSetItem, configurable: true });
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-builder-proposal-comparisons:v1") throw new DOMException("Comparison write failed", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("comparison-save").click();
  await expect(page.getByTestId("comparison-editor")).toBeVisible();
  await expect(page.getByTestId("comparison-form-error")).toContainText("مقایسه ثبت نشد");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"))).toBeNull();
  expect(await page.evaluate(() => ({
    proposals: window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"),
    requests: window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"),
    approvals: window.localStorage.getItem("chida-prototype-project-approvals:v1"),
    dispatch: window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"),
  }))).toEqual(sourceStoresBeforeComparison);

  await page.evaluate(() => {
    Storage.prototype.setItem = (window as Window & { __comparisonNativeSetItem: typeof Storage.prototype.setItem }).__comparisonNativeSetItem;
  });
  await page.getByTestId("comparison-save").click();
  await expect(page.getByTestId("comparison-detail")).toBeVisible();
  await expect(page.getByTestId("comparison-recommendation")).toContainText("دادهٔ ناکافی برای جمع‌بندی");

  const comparisonStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"));
  const comparison = JSON.parse(comparisonStore ?? "[]")[0];
  const revision = comparison.revisions[0];
  expect(revision.recommendation).toMatchObject({
    criterion: "lowest-complete-normalized-total",
    status: "insufficient-data",
    candidateProposalId: null,
    tiedProposalIds: [],
  });
  expect(revision.results).toHaveLength(2);
  for (const result of revision.results) {
    expect(result).toMatchObject({
      taxAmount: null,
      transportAmount: null,
      normalizedTotal: null,
      coverage: "incomplete",
    });
    expect(result.missingReasons).toEqual(expect.arrayContaining([
      "وضعیت یا مبلغ مالیات برای هم‌سطح‌سازی مشخص نیست.",
      "وضعیت یا مبلغ حمل برای هم‌سطح‌سازی مشخص نیست.",
    ]));
  }
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparison-decisions:v1"))).toBeNull();
  expect(await page.evaluate(() => ({
    proposals: window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"),
    requests: window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"),
    approvals: window.localStorage.getItem("chida-prototype-project-approvals:v1"),
    dispatch: window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"),
  }))).toEqual(sourceStoresBeforeComparison);
});

test("T7-B1 keeps no-op bytes stable, versions real comparison edits, and marks stale proposal lineage for review", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { firstSupplier } = await createExactProductComparisonWithDecision(page);
  const comparisonV1Store = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"));
  const decisionV1Store = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparison-decisions:v1"));
  const comparisonV1 = JSON.parse(comparisonV1Store ?? "[]")[0];
  const decisionV1 = JSON.parse(decisionV1Store ?? "[]")[0];
  expect(comparisonV1.version).toBe(1);
  expect(decisionV1.version).toBe(1);

  await page.getByTestId("comparison-edit").click();
  await expect(page.getByTestId("comparison-editor-title")).toBeFocused();
  await page.getByTestId("comparison-save").click();
  await expect(page.getByTestId("comparison-detail")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"))).toBe(comparisonV1Store);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparison-decisions:v1"))).toBe(decisionV1Store);

  await page.getByTestId("comparison-edit").click();
  const firstEditor = comparisonSupplierEditor(page, firstSupplier);
  await firstEditor.getByTestId(/^comparison-transport-value-/).fill("۱۵۰۰۰۰۰");
  await page.getByTestId("comparison-save").click();
  await expect(page.getByTestId("comparison-detail-hero")).toContainText("نسخهٔ مقایسه ۲");

  const comparisonV2Store = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"));
  const comparisonV2 = JSON.parse(comparisonV2Store ?? "[]")[0];
  expect(comparisonV2Store).not.toBe(comparisonV1Store);
  expect(comparisonV2.version).toBe(2);
  expect(comparisonV2.history.map((event: { type: string }) => event.type)).toEqual(["created", "updated"]);
  expect(comparisonV2.revisions).toHaveLength(2);
  expect(comparisonV2.revisions[0]).toEqual(comparisonV1.revisions[0]);
  expect(comparisonV2.revisions[1].results.find((result: { supplierDisplayName: string }) => result.supplierDisplayName === firstSupplier)).toMatchObject({
    transportAmount: "1500000",
    normalizedTotal: "24935000",
  });
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparison-decisions:v1"))).toBe(decisionV1Store);
  await expect(page.getByTestId("comparison-decision-history")).toHaveCount(0);

  await expect(page.getByTestId("comparison-revision-select")).toBeVisible();
  await page.getByTestId("comparison-revision-select").selectOption(comparisonV1.revisions[0].id);
  await expect(page.getByTestId("comparison-detail-hero")).toContainText("نسخهٔ تاریخی مقایسه");
  await expect(page.getByTestId("comparison-decision-history")).toContainText("نسخهٔ نخست تصمیم برای ادامهٔ بررسی پیشنهاد ب");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"))).toBe(comparisonV2Store);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparison-decisions:v1"))).toBe(decisionV1Store);

  await page.getByTestId("comparison-detail-back").click();
  await page.getByTestId("comparisons-back").click();
  await page.getByTestId("proposal-card").filter({ hasText: firstSupplier }).click();
  await page.getByTestId("proposal-edit").click();
  await page.getByTestId("proposal-notes").fill("نسخهٔ تازهٔ پیشنهاد پس از ثبت مقایسه");
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-detail")).toContainText("نسخهٔ رونویسی");
  await expect(page.getByTestId("proposal-revision-select")).toContainText("نسخهٔ ۲ · جاری");
  await page.getByTestId("proposal-detail-back").click();
  await page.getByTestId("proposal-comparisons-entry").click();
  await expect(page.getByTestId("comparison-card")).toContainText("تاریخی · بازبینی");
  await page.getByTestId("comparison-card").click();
  await expect(page.getByTestId("comparison-detail-hero")).toContainText("تاریخی · نیازمند بازبینی");
  await expect(page.getByTestId("comparison-decision-save")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"))).toBe(comparisonV2Store);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparison-decisions:v1"))).toBe(decisionV1Store);
});

test("T7-B1 fail-closes tampered comparison results and distinguishes an unreadable decision store from empty", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { firstSupplier } = await createExactProductComparisonWithDecision(page);
  const proposalStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));
  const validComparisonStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"));
  const validDecisionStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparison-decisions:v1"));

  const tamperedComparisonStore = await page.evaluate(() => {
    const key = "chida-prototype-builder-proposal-comparisons:v1";
    const records = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    records[0].revisions[0].results[0].lines[0].calculation.formula = "۱ + ۱ = ۳";
    records[0].revisions[0].results[0].normalizedTotal = "1";
    window.localStorage.setItem(key, JSON.stringify(records));
    return window.localStorage.getItem(key);
  });

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-storage-error")).toHaveCount(0);
  await expect(page.getByTestId("proposal-card")).toHaveCount(2);
  await page.getByTestId("proposal-card").filter({ hasText: firstSupplier }).click();
  await expect(page.getByTestId("proposal-detail")).toBeVisible();
  await page.getByTestId("proposal-detail-back").click();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(proposalStore);

  await page.getByTestId("proposal-comparisons-entry").click();
  await expect(page.getByTestId("comparison-storage-error")).toBeVisible();
  await expect(page.getByTestId("comparison-card")).toHaveCount(0);
  await expect(page.getByTestId("comparison-add")).toBeDisabled();
  await expect(page.getByText("مقایسه‌ای ثبت نشده", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"))).toBe(tamperedComparisonStore);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(proposalStore);

  await page.evaluate((validStore) => window.localStorage.setItem("chida-prototype-builder-proposal-comparisons:v1", validStore!), validComparisonStore);
  await page.addInitScript(() => {
    const nativeGetItem = Storage.prototype.getItem;
    Object.defineProperty(window, "__comparisonDecisionNativeGetItem", { value: nativeGetItem, configurable: true });
    Storage.prototype.getItem = function getItem(key: string) {
      if (this === window.localStorage && key === "chida-prototype-builder-proposal-comparison-decisions:v1") throw new DOMException("Comparison decision read failed", "SecurityError");
      return nativeGetItem.call(this, key);
    };
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-card")).toHaveCount(2);
  await page.getByTestId("proposal-comparisons-entry").click();
  await expect(page.getByTestId("comparison-storage-error")).toHaveCount(0);
  await expect(page.getByTestId("comparison-card")).toHaveCount(1);
  await page.getByTestId("comparison-card").click();
  await expect(page.getByTestId("comparison-decision-storage-error")).toBeVisible();
  await expect(page.getByTestId("comparison-decision-section")).toHaveCount(0);
  await expect(page.getByTestId("comparison-decision-save")).toHaveCount(0);
  await expect(page.getByText("ثبت نشده", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(proposalStore);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"))).toBe(validComparisonStore);
  expect(await page.evaluate(() => (window as Window & { __comparisonDecisionNativeGetItem: typeof Storage.prototype.getItem }).__comparisonDecisionNativeGetItem.call(window.localStorage, "chida-prototype-builder-proposal-comparison-decisions:v1"))).toBe(validDecisionStore);
});

test("T7-B2 stores a traceable qualitative service matrix and keeps the human decision independent", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { firstSupplier, secondSupplier, firstProposal, secondProposal } = await createTwoCurrentServiceProposalsForComparison(page);
  const sourceStoresBeforeComparison = await page.evaluate(() => ({
    proposals: window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"),
    requests: window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"),
    approvals: window.localStorage.getItem("chida-prototype-project-approvals:v1"),
    dispatch: window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"),
    productComparisons: window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"),
    productDecisions: window.localStorage.getItem("chida-prototype-builder-proposal-comparison-decisions:v1"),
  }));
  const requestAndApproval = await page.evaluate(() => ({
    request: JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]")[0],
    approval: JSON.parse(window.localStorage.getItem("chida-prototype-project-approvals:v1") ?? "[]")[0],
  }));
  const exactReview = requestAndApproval.request.reviewRevisions.find((revision: { id: string }) => revision.id === requestAndApproval.approval.target.revisionId);
  const appOrigin = new URL(page.url()).origin;
  const externalRequests: string[] = [];
  const requestListener = (request: Request) => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== appOrigin) externalRequests.push(request.url());
  };
  page.on("request", requestListener);

  await page.getByTestId("service-proposal-comparisons-entry").click();
  await expect(page.getByTestId("service-proposal-comparisons-view")).toBeVisible();
  await page.getByTestId("service-comparison-add").click();
  await expect(page.getByTestId("service-comparison-editor-title")).toBeFocused();
  await expect(page.getByTestId("service-comparison-request-select")).not.toHaveValue("");
  await expect(page.getByLabel(`وضعیت انطباق دامنهٔ کار برای ${firstSupplier}`)).toBeVisible();
  await expect(page.getByLabel(`مقدار اعلامی دامنهٔ کار برای ${firstSupplier}`)).toBeVisible();
  await expect(page.getByLabel(`دلیل ارزیابی دامنهٔ کار برای ${firstSupplier}`)).toBeVisible();
  await fillCompleteServiceComparisonMatrix(page, firstSupplier, secondSupplier);
  await expect(page.getByTestId("service-comparison-coverage-preview")).toContainText("آماده برای تصمیم انسانی");
  await page.getByTestId("service-comparison-save").click();
  await expect(page.getByTestId("service-comparison-detail")).toBeVisible();
  await expect(page.getByTestId("service-comparison-detail-hero")).toBeFocused();
  await expect(page.getByTestId("service-comparison-summary")).toContainText("نامزد خودکار ندارد");

  const comparisonStoreBeforeDecision = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1"));
  const comparison = JSON.parse(comparisonStoreBeforeDecision ?? "[]")[0];
  const revision = comparison.revisions[0];
  expect(comparison).toMatchObject({
    schemaVersion: 1,
    projectId: requestAndApproval.request.projectId,
    purpose: "compare-builder-recorded-service-proposals",
    target: {
      requestId: firstProposal.target.requestId,
      requestVersion: firstProposal.target.requestVersion,
      reviewRevisionId: firstProposal.target.reviewRevisionId,
      reviewRevisionFingerprint: firstProposal.target.reviewRevisionFingerprint,
      requestKind: "service",
    },
    requestSnapshot: {
      id: exactReview.snapshot.service.id,
      scope: "آماده سازی و اجرای عایق دولایه بام",
      location: "بام پروژه در سعادت آباد",
      sizeOrVolume: "۸۵۰ مترمربع",
      qualification: "گواهی صلاحیت عایق کاری پایه دو",
      timing: "شروع حداکثر تا هفت روز آینده",
      method: "اجرای گرمایی طبق دستورالعمل کارخانه",
      inScope: "زیرسازی اجرا و آزمون آب بندی",
      outOfScope: "هیچ بخش اجرایی خارج از دامنه نیست",
      warranty: "حداقل ضمانت کتبی دوازده ماهه",
      paymentTerms: "حداکثر سی درصد پیش پرداخت و مانده مرحله ای",
    },
    currentRevisionId: revision.id,
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    externalEffect: "none",
    networkUsed: false,
    aiUsed: false,
    scoringUsed: false,
    version: 1,
  });
  expect(comparison.history.map((event: { type: string; version: number }) => ({ type: event.type, version: event.version }))).toEqual([{ type: "created", version: 1 }]);
  expect(revision.inputs).toHaveLength(2);
  const expectedInputCriteria = (fixtures: Record<ServiceComparisonCriterionId, ServiceComparisonAssessmentFixture>) => serviceComparisonCriterionIds.map((criterionId) => ({
    criterionId,
    ...fixtures[criterionId],
    declaredSource: "رونویسی تکمیلی سازنده برای مقایسه",
    assessmentSource: "ارزیابی سازنده",
  }));
  for (const [proposal, fixtures] of [[firstProposal, firstServiceComparisonAssessments], [secondProposal, secondServiceComparisonAssessments]] as const) {
    const proposalRevision = proposal.revisions.find((item: { id: string }) => item.id === proposal.currentRevisionId);
    const input = revision.inputs.find((item: { proposalId: string }) => item.proposalId === proposal.id);
    expect(input).toMatchObject({
      proposalId: proposal.id,
      proposalVersion: proposal.version,
      proposalRevisionId: proposalRevision.id,
      proposalRevisionFingerprint: proposalRevision.fingerprint,
      proposalLineId: proposalRevision.lines[0].id,
      serviceSpecId: exactReview.snapshot.service.id,
      supplierSnapshot: proposal.supplierSnapshot,
    });
    expect(input.criteria).toEqual(expectedInputCriteria(fixtures));
    const result = revision.results.find((item: { proposalId: string }) => item.proposalId === proposal.id);
    expect(result.declaredCommercialSnapshot).toEqual(proposalRevision.lines[0]);
    expect(result.source).toBe("ماتریس ساختاریافتهٔ محلی چیدا");
    expect(result.coverage).toBe("complete");
    expect(result).not.toHaveProperty("normalizedTotal");
    expect(result).not.toHaveProperty("score");
    expect(result).not.toHaveProperty("rank");
  }
  expect(revision.results.find((item: { proposalId: string }) => item.proposalId === firstProposal.id).counts).toEqual({ aligned: 6, partial: 2, different: 2, unknown: 0, notApplicable: 0 });
  expect(revision.results.find((item: { proposalId: string }) => item.proposalId === secondProposal.id).counts).toEqual({ aligned: 4, partial: 3, different: 3, unknown: 0, notApplicable: 0 });
  expect(revision.summary).toEqual({
    formulaVersion: "service-coverage-v1",
    criterion: "all-service-criteria-reviewed",
    status: "ready-for-human-decision",
    candidateProposalId: null,
    unknownCount: 0,
    reasonCode: "all-criteria-reviewed",
    reason: "همهٔ معیارهای خدمت بازبینی شده‌اند؛ تفاوت‌ها برای تصمیم مستقل سازنده نمایش داده می‌شوند و هیچ امتیاز، رتبه یا گزینهٔ برتر ساخته نشده است.",
    source: "جمع‌بندی قاعده‌محور محلی",
  });
  expect(await page.evaluate(() => ({
    proposals: window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"),
    requests: window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"),
    approvals: window.localStorage.getItem("chida-prototype-project-approvals:v1"),
    dispatch: window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"),
    productComparisons: window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"),
    productDecisions: window.localStorage.getItem("chida-prototype-builder-proposal-comparison-decisions:v1"),
  }))).toEqual(sourceStoresBeforeComparison);

  await page.getByTestId("service-comparison-decision-outcome").selectOption("preferred-for-follow-up");
  await page.getByTestId("service-comparison-decision-proposal").selectOption(secondProposal.id);
  await page.getByTestId("service-comparison-decision-reason").fill("شرایط زمانی مجری ب مناسب تر است اما تصمیم هنوز سفارش نیست");
  await page.getByTestId("service-comparison-decision-save").click();
  await expect(page.getByTestId("service-comparison-decision-history")).toContainText("شرایط زمانی مجری ب مناسب تر است");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1"))).toBe(comparisonStoreBeforeDecision);
  const decisionStoreBeforeReload = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparison-decisions:v1"));
  const decision = JSON.parse(decisionStoreBeforeReload ?? "[]")[0];
  expect(decision).toMatchObject({
    schemaVersion: 1,
    projectId: comparison.projectId,
    purpose: "record-local-service-proposal-comparison-decision",
    target: {
      comparisonId: comparison.id,
      comparisonVersion: revision.version,
      comparisonRevisionId: revision.id,
      comparisonRevisionFingerprint: revision.fingerprint,
    },
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    externalEffect: "none",
    sendAuthorized: false,
    purchaseAuthorized: false,
    supplierNotified: false,
    version: 1,
  });
  expect(decision.revisions[0]).toMatchObject({ outcome: "preferred-for-follow-up", selectedProposalId: secondProposal.id, reason: "شرایط زمانی مجری ب مناسب تر است اما تصمیم هنوز سفارش نیست", version: 1 });
  expect(await page.getByTestId("service-comparison-detail").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("service-proposal-comparisons-entry").click();
  await expect(page.getByTestId("service-comparison-card")).toHaveCount(1);
  await page.getByTestId("service-comparison-card").click();
  await expect(page.getByTestId("service-comparison-detail-hero")).toBeFocused();
  await expect(page.locator('[data-testid="service-comparison-criterion-card"][data-criterion="scope"]')).toContainText(firstServiceComparisonAssessments.scope.declaredValue);
  await expect(page.locator('[data-testid="service-comparison-criterion-card"][data-criterion="scope"]')).toContainText(secondServiceComparisonAssessments.scope.declaredValue);
  await expect(page.getByTestId("service-comparison-decision-history")).toContainText("شرایط زمانی مجری ب مناسب تر است");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1"))).toBe(comparisonStoreBeforeDecision);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparison-decisions:v1"))).toBe(decisionStoreBeforeReload);
  expect(await page.evaluate(() => ({
    proposals: window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"),
    requests: window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"),
    approvals: window.localStorage.getItem("chida-prototype-project-approvals:v1"),
    dispatch: window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"),
    productComparisons: window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"),
    productDecisions: window.localStorage.getItem("chida-prototype-builder-proposal-comparison-decisions:v1"),
  }))).toEqual(sourceStoresBeforeComparison);
  expect(externalRequests).toEqual([]);
  page.off("request", requestListener);
});

test("T7-B2 preserves a declared value with unknown assessment and rolls back a failed service comparison write", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { firstSupplier, firstProposal } = await createTwoCurrentServiceProposalsForComparison(page);
  const sourceStoresBeforeComparison = await page.evaluate(() => ({
    proposals: window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"),
    requests: window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"),
    approvals: window.localStorage.getItem("chida-prototype-project-approvals:v1"),
    dispatch: window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"),
  }));
  const appOrigin = new URL(page.url()).origin;
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== appOrigin) externalRequests.push(request.url());
  });

  await page.getByTestId("service-proposal-comparisons-entry").click();
  await page.getByTestId("service-comparison-add").click();
  const scopeEditor = serviceComparisonAssessmentEditor(page, "scope", firstSupplier);
  await expect(scopeEditor.getByTestId("service-comparison-assessment-status")).toHaveValue("unknown");
  await scopeEditor.getByTestId("service-comparison-declared-value").fill("مجری گفته اجرای کامل را می پذیرد");
  await scopeEditor.getByTestId("service-comparison-assessment-rationale").fill("جزئیات زیرسازی هنوز برای ارزیابی انطباق روشن نیست");
  await expect(page.getByTestId("service-comparison-coverage-preview")).toContainText("۲۰ معیار نیازمند روشن‌سازی");

  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Object.defineProperty(window, "__serviceComparisonNativeSetItem", { value: nativeSetItem, configurable: true });
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-builder-service-proposal-comparisons:v1") throw new DOMException("Service comparison write failed", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("service-comparison-save").click();
  await expect(page.getByTestId("service-comparison-editor")).toBeVisible();
  await expect(page.getByTestId("service-comparison-form-error")).toContainText("مقایسه ثبت نشد");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1"))).toBeNull();
  expect(await page.evaluate(() => ({
    proposals: window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"),
    requests: window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"),
    approvals: window.localStorage.getItem("chida-prototype-project-approvals:v1"),
    dispatch: window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"),
  }))).toEqual(sourceStoresBeforeComparison);

  await page.evaluate(() => {
    Storage.prototype.setItem = (window as Window & { __serviceComparisonNativeSetItem: typeof Storage.prototype.setItem }).__serviceComparisonNativeSetItem;
  });
  await page.getByTestId("service-comparison-save").click();
  await expect(page.getByTestId("service-comparison-detail")).toBeVisible();
  await expect(page.getByTestId("service-comparison-summary")).toContainText("۲۰ معیار نیازمند روشن‌سازی");

  const comparison = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1") ?? "[]")[0]);
  const revision = comparison.revisions[0];
  const firstInput = revision.inputs.find((input: { proposalId: string }) => input.proposalId === firstProposal.id);
  expect(firstInput.criteria.find((criterion: { criterionId: string }) => criterion.criterionId === "scope")).toEqual({
    criterionId: "scope",
    declaredValue: "مجری گفته اجرای کامل را می پذیرد",
    assessment: "unknown",
    rationale: "جزئیات زیرسازی هنوز برای ارزیابی انطباق روشن نیست",
    declaredSource: "رونویسی تکمیلی سازنده برای مقایسه",
    assessmentSource: "ارزیابی سازنده",
  });
  expect(revision.summary).toMatchObject({ status: "needs-clarification", candidateProposalId: null, unknownCount: 20, reasonCode: "criteria-need-clarification" });
  expect(revision.results).toHaveLength(2);
  for (const result of revision.results) {
    expect(result.counts).toEqual({ aligned: 0, partial: 0, different: 0, unknown: 10, notApplicable: 0 });
    expect(result.coverage).toBe("incomplete");
    expect(result).not.toHaveProperty("normalizedTotal");
    expect(result).not.toHaveProperty("score");
    expect(result).not.toHaveProperty("rank");
  }
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparison-decisions:v1"))).toBeNull();
  expect(await page.evaluate(() => ({
    proposals: window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"),
    requests: window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"),
    approvals: window.localStorage.getItem("chida-prototype-project-approvals:v1"),
    dispatch: window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"),
  }))).toEqual(sourceStoresBeforeComparison);
  expect(externalRequests).toEqual([]);
});

test("T7-B2 keeps no-op bytes stable, versions a real matrix edit, and invalidates stale service proposal lineage", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { firstSupplier } = await createCompleteServiceComparisonWithDecision(page);
  const comparisonV1Store = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1"));
  const decisionV1Store = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparison-decisions:v1"));
  const comparisonV1 = JSON.parse(comparisonV1Store ?? "[]")[0];
  const decisionV1 = JSON.parse(decisionV1Store ?? "[]")[0];
  expect(comparisonV1.version).toBe(1);
  expect(decisionV1.version).toBe(1);

  await page.getByTestId("service-comparison-edit").click();
  await expect(page.getByTestId("service-comparison-editor-title")).toBeFocused();
  await page.getByTestId("service-comparison-save").click();
  await expect(page.getByTestId("service-comparison-detail")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1"))).toBe(comparisonV1Store);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparison-decisions:v1"))).toBe(decisionV1Store);

  await page.getByTestId("service-comparison-edit").click();
  await serviceComparisonAssessmentEditor(page, "scope", firstSupplier).getByTestId("service-comparison-declared-value").fill("آماده سازی ترمیم و اجرای کامل عایق دولایه");
  await page.getByTestId("service-comparison-save").click();
  await expect(page.getByTestId("service-comparison-detail-hero")).toContainText("نسخهٔ مقایسه ۲");
  const comparisonV2Store = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1"));
  const comparisonV2 = JSON.parse(comparisonV2Store ?? "[]")[0];
  expect(comparisonV2Store).not.toBe(comparisonV1Store);
  expect(comparisonV2.version).toBe(2);
  expect(comparisonV2.history.map((event: { type: string }) => event.type)).toEqual(["created", "updated"]);
  expect(comparisonV2.revisions).toHaveLength(2);
  expect(comparisonV2.revisions[0]).toEqual(comparisonV1.revisions[0]);
  expect(comparisonV2.revisions[1].inputs.find((input: { supplierSnapshot: { displayName: string } }) => input.supplierSnapshot.displayName === firstSupplier).criteria.find((criterion: { criterionId: string }) => criterion.criterionId === "scope").declaredValue).toBe("آماده سازی ترمیم و اجرای کامل عایق دولایه");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparison-decisions:v1"))).toBe(decisionV1Store);
  await expect(page.getByTestId("service-comparison-decision-history")).toHaveCount(0);

  await page.getByTestId("service-comparison-revision-select").selectOption(comparisonV1.revisions[0].id);
  await expect(page.getByTestId("service-comparison-detail-hero")).toContainText("نسخهٔ تاریخی مقایسه");
  await expect(page.getByTestId("service-comparison-decision-history")).toContainText("نسخه نخست تصمیم برای ادامه بررسی مجری ب");
  await expect(page.getByTestId("service-comparison-decision-save")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1"))).toBe(comparisonV2Store);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparison-decisions:v1"))).toBe(decisionV1Store);

  await page.getByTestId("service-comparison-detail-back").click();
  await page.getByTestId("service-comparisons-back").click();
  await page.getByTestId("proposal-card").filter({ hasText: firstSupplier }).click();
  await page.getByTestId("proposal-edit").click();
  await page.getByTestId("proposal-notes").fill("نسخه تازه پیشنهاد خدمت پس از ثبت ماتریس");
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-revision-select")).toContainText("نسخهٔ ۲ · جاری");
  await page.getByTestId("proposal-detail-back").click();
  await page.getByTestId("service-proposal-comparisons-entry").click();
  await expect(page.getByTestId("service-comparison-card")).toContainText("تاریخی · بازبینی");
  await page.getByTestId("service-comparison-card").click();
  await expect(page.getByTestId("service-comparison-detail-hero")).toContainText("تاریخی · نیازمند بازبینی");
  await expect(page.getByTestId("service-comparison-decision-save")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1"))).toBe(comparisonV2Store);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparison-decisions:v1"))).toBe(decisionV1Store);
});

test("T7-B2 fail-closes a tampered service matrix and distinguishes an unreadable decision store from empty", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { firstSupplier } = await createCompleteServiceComparisonWithDecision(page);
  const proposalStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));
  const validComparisonStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1"));
  const validDecisionStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparison-decisions:v1"));

  const tamperedComparisonStore = await page.evaluate(() => {
    const key = "chida-prototype-builder-service-proposal-comparisons:v1";
    const records = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    records[0].revisions[0].results[0].counts.aligned = 999;
    records[0].revisions[0].summary.candidateProposalId = records[0].revisions[0].inputs[0].proposalId;
    window.localStorage.setItem(key, JSON.stringify(records));
    return window.localStorage.getItem(key);
  });

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-storage-error")).toHaveCount(0);
  await expect(page.getByTestId("proposal-card")).toHaveCount(2);
  await page.getByTestId("proposal-card").filter({ hasText: firstSupplier }).click();
  await expect(page.getByTestId("proposal-detail")).toBeVisible();
  await page.getByTestId("proposal-detail-back").click();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(proposalStore);

  await page.getByTestId("service-proposal-comparisons-entry").click();
  await expect(page.getByTestId("service-comparison-storage-error")).toBeVisible();
  await expect(page.getByTestId("service-comparison-card")).toHaveCount(0);
  await expect(page.getByTestId("service-comparison-add")).toBeDisabled();
  await expect(page.getByText("ماتریسی ثبت نشده", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1"))).toBe(tamperedComparisonStore);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(proposalStore);

  await page.evaluate((validStore) => window.localStorage.setItem("chida-prototype-builder-service-proposal-comparisons:v1", validStore!), validComparisonStore);
  await page.addInitScript(() => {
    const nativeGetItem = Storage.prototype.getItem;
    Object.defineProperty(window, "__serviceComparisonDecisionNativeGetItem", { value: nativeGetItem, configurable: true });
    Storage.prototype.getItem = function getItem(key: string) {
      if (this === window.localStorage && key === "chida-prototype-builder-service-proposal-comparison-decisions:v1") throw new DOMException("Service comparison decision read failed", "SecurityError");
      return nativeGetItem.call(this, key);
    };
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-card")).toHaveCount(2);
  await page.getByTestId("service-proposal-comparisons-entry").click();
  await expect(page.getByTestId("service-comparison-storage-error")).toHaveCount(0);
  await expect(page.getByTestId("service-comparison-card")).toHaveCount(1);
  await page.getByTestId("service-comparison-card").click();
  await expect(page.getByTestId("service-comparison-decision-storage-error")).toBeVisible();
  await expect(page.getByTestId("service-comparison-decision-section")).toHaveCount(0);
  await expect(page.getByTestId("service-comparison-decision-save")).toHaveCount(0);
  await expect(page.getByText("ثبت نشده", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(proposalStore);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1"))).toBe(validComparisonStore);
  expect(await page.evaluate(() => (window as Window & { __serviceComparisonDecisionNativeGetItem: typeof Storage.prototype.getItem }).__serviceComparisonDecisionNativeGetItem.call(window.localStorage, "chida-prototype-builder-service-proposal-comparison-decisions:v1"))).toBe(validDecisionStore);
});
