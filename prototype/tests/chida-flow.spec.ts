import { expect, test, type Locator, type Page, type Request } from "@playwright/test";
import { createHash } from "node:crypto";

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
  await page.getByTestId("purchase-request-more-actions").locator("summary").click();
  await page.getByTestId("purchase-request-mark-ready-legacy").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("آمادهٔ ادامه");
}

async function openApprovedPurchaseRequestDispatch(page: Page) {
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
  await expect(page.getByTestId("project-dispatch-planner-view")).toBeVisible();
  await page.getByTestId("dispatch-technical-details").locator("summary").click();
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
  await page.getByTestId("dispatch-technical-details").locator("summary").click();
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
  await page.getByTestId("dispatch-technical-details").locator("summary").click();
}

async function returnFromDispatchToHome(page: Page) {
  await page.getByTestId("dispatch-planner-back").click();
  await page.getByTestId("purchase-request-detail-back").click();
  await page.getByTestId("purchase-requests-back").click();
  await expect(page.getByTestId("builder-home")).toBeVisible();
}

async function openProposalAdvancedMode(page: Page) {
  const advancedMode = page.getByTestId("proposal-editor-mode-advanced");
  if (await advancedMode.getAttribute("aria-pressed") !== "true") await advancedMode.click();
  await expect(advancedMode).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("proposal-editor-advanced")).toBeVisible();
}

async function openProposalSecondaryActions(page: Page) {
  const secondaryActions = page.getByTestId("proposal-secondary-actions");
  if (await secondaryActions.getAttribute("open") === null) await secondaryActions.locator("summary").click();
  await expect(secondaryActions).toHaveAttribute("open", "");
}

async function openProposalSecondaryView(page: Page, testId: "proposal-comparisons-entry" | "service-proposal-comparisons-entry" | "negotiation-drafts-entry") {
  await openProposalSecondaryActions(page);
  await page.getByTestId(testId).click();
}

async function openProposalDetailConditions(page: Page) {
  const details = page.getByTestId("proposal-detail-conditions");
  if (await details.getAttribute("open") === null) await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
}

async function openProposalDetailReference(page: Page) {
  const details = page.getByTestId("proposal-detail-reference-details");
  if (await details.getAttribute("open") === null) await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
}

async function openProposalDetailTechnical(page: Page) {
  const details = page.getByTestId("proposal-detail-technical");
  if (await details.getAttribute("open") === null) await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
}

async function openProposalRevisionDiffTechnical(page: Page) {
  const details = page.getByTestId("proposal-revision-diff-technical");
  if (await details.getAttribute("open") === null) await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
}

async function openAllProposalRevisionDiffUnchanged(page: Page) {
  const disclosures = page.getByTestId("proposal-revision-diff-unchanged");
  for (let index = 0; index < await disclosures.count(); index += 1) {
    const disclosure = disclosures.nth(index);
    if (await disclosure.getAttribute("open") === null) await disclosure.locator("summary").click();
    await expect(disclosure).toHaveAttribute("open", "");
  }
}

async function openDisclosure(details: Locator) {
  if (await details.getAttribute("open") === null) await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
}

async function openContainingDisclosure(content: Locator) {
  await openDisclosure(content.locator("xpath=ancestor::details[1]"));
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
  await expect(page.getByTestId("project-dispatch-planner-view")).toBeVisible();
  await page.getByTestId("dispatch-technical-details").locator("summary").click();
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
  await expect(page.getByTestId("project-dispatch-planner-view")).toBeVisible();
  await page.getByTestId("dispatch-technical-details").locator("summary").click();
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
  await expect(page.getByTestId("project-dispatch-planner-view")).toBeVisible();
  await page.getByTestId("dispatch-technical-details").locator("summary").click();
  await addLocalSupplierContact(page, { name: firstSupplier, category: "عایق کاری", coverage: "غرب تهران", capability: "service" });
  await addLocalSupplierContact(page, { name: secondSupplier, category: "عایق کاری", coverage: "تمام تهران", capability: "service" });
  await page.getByTestId("dispatch-draft-save").click();
  await expect(page.getByTestId("dispatch-draft-preview")).toBeVisible();
  await returnFromDispatchToHome(page);
  await page.getByTestId("quick-action-compare-offers").click();

  const recordProposal = async (supplierName: string, values: { totalPrice: string; leadTime: string; paymentTerms: string; validity: string; transcript: string }) => {
    await page.getByTestId("proposal-add").click();
    await page.getByTestId("proposal-supplier-select").selectOption({ label: `${supplierName} · خدمت` });
    await openProposalAdvancedMode(page);
    await page.getByTestId("proposal-transcript").fill(values.transcript);
    await page.getByTestId("proposal-line-status-0").selectOption("quoted");
    await page.getByTestId("proposal-line-total-price-0").fill(values.totalPrice);
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
  await openProposalSecondaryView(page, "service-proposal-comparisons-entry");
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

const negotiationDraftStorageKey = "chida-prototype-builder-negotiation-drafts:v1";
const manualNegotiationResponseStorageKey = "chida-prototype-builder-manual-negotiation-responses:v1";
const manualNegotiationResponseReviewStorageKey = "chida-prototype-builder-manual-negotiation-response-reviews:v1";
const manualNegotiationConditionImpactStorageKey = "chida-prototype-builder-manual-negotiation-condition-impacts:v1";

async function commercialSourceStoreBytes(page: Page) {
  return page.evaluate(() => ({
    requests: window.localStorage.getItem("chida-prototype-project-purchase-requests:v1"),
    approvals: window.localStorage.getItem("chida-prototype-project-approvals:v1"),
    dispatch: window.localStorage.getItem("chida-prototype-project-dispatch-drafts:v1"),
    contacts: window.localStorage.getItem("chida-prototype-project-supplier-contacts:v1"),
    proposals: window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"),
    productComparisons: window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"),
    productDecisions: window.localStorage.getItem("chida-prototype-builder-proposal-comparison-decisions:v1"),
    serviceComparisons: window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1"),
    serviceDecisions: window.localStorage.getItem("chida-prototype-builder-service-proposal-comparison-decisions:v1"),
  }));
}

function serviceNegotiationDraftStart(page: Page, criterionId: ServiceComparisonCriterionId, proposalId: string) {
  return page.locator(`[data-testid="service-comparison-criterion-card"][data-criterion="${criterionId}"]`)
    .locator(`[data-proposal-id="${proposalId}"]`)
    .getByTestId("negotiation-draft-start");
}

async function openServiceComparisonCriterion(page: Page, criterionId: ServiceComparisonCriterionId) {
  const details = page.locator(`[data-testid="service-comparison-criterion-card"][data-criterion="${criterionId}"]`);
  if (await details.getAttribute("open") === null) await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
}

function productNegotiationDraftStart(page: Page, proposalId: string, criterionId: string) {
  return page.locator(`[data-testid="negotiation-draft-start"][data-comparison-kind="product"][data-proposal-id="${proposalId}"][data-criterion-id="${criterionId}"]`);
}

async function openProductComparisonLineForNegotiation(page: Page, proposalId: string, criterionId: string) {
  const start = productNegotiationDraftStart(page, proposalId, criterionId);
  const details = start.locator("xpath=ancestor::details[1]");
  if (await details.getAttribute("open") === null) await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
  return start;
}

async function createExactServiceNegotiationDraft(page: Page, values: { purpose: string; message: string } = {
  purpose: "روشن شدن زمان قطعی شروع پیش از ادامه بررسی",
  message: "لطفاً تاریخ دقیق تجهیز کارگاه و شروع اجرای عایق را اعلام کنید.",
}) {
  const prerequisites = await createCompleteServiceComparisonWithDecision(page);
  const sourceStoresBeforeDraft = await commercialSourceStoreBytes(page);
  const comparison = JSON.parse(sourceStoresBeforeDraft.serviceComparisons ?? "[]")[0];
  const comparisonRevision = comparison.revisions.find((revision: { id: string }) => revision.id === comparison.currentRevisionId);
  const proposal = JSON.parse(sourceStoresBeforeDraft.proposals ?? "[]")
    .find((item: { id: string }) => item.id === prerequisites.firstProposal.id);
  const proposalRevision = proposal.revisions.find((revision: { id: string }) => revision.id === proposal.currentRevisionId);
  const projectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  const appOrigin = new URL(page.url()).origin;
  const externalRequests: string[] = [];
  const requestListener = (request: Request) => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== appOrigin) externalRequests.push(request.url());
  };
  page.on("request", requestListener);

  await openServiceComparisonCriterion(page, "timing");
  const start = serviceNegotiationDraftStart(page, "timing", proposal.id);
  await expect(start).toHaveAttribute("data-comparison-kind", "service");
  await expect(start).toHaveAttribute("data-proposal-id", proposal.id);
  await expect(start).toHaveAttribute("data-criterion-id", "timing");
  await expect(start).toHaveAccessibleName(`بازکردن یا ساخت پیش‌نویس سؤال دربارهٔ مدت و زمان اجرا برای ${prerequisites.firstSupplier}`);
  await start.click();
  await expect(page.getByTestId("negotiation-draft-editor")).toBeVisible();
  await expect(page.getByTestId("negotiation-draft-editor-title")).toBeFocused();
  expect(await page.getByTestId("negotiation-draft-editor").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  await expect(page.getByTestId("negotiation-draft-target")).toContainText(prerequisites.firstSupplier);
  await expect(page.getByTestId("negotiation-draft-target")).toContainText("مدت و زمان اجرا");
  await page.getByTestId("negotiation-draft-purpose").fill(values.purpose);
  await page.getByTestId("negotiation-draft-message").fill(values.message);
  await page.getByTestId("negotiation-draft-save").click();
  await expect(page.getByTestId("negotiation-draft-detail")).toBeVisible();
  await expect(page.getByTestId("negotiation-draft-detail-hero")).toBeFocused();

  const draftStore = await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey);
  const record = JSON.parse(draftStore ?? "[]")[0];
  return {
    ...prerequisites,
    comparison,
    comparisonRevision,
    proposal,
    proposalRevision,
    projectId,
    sourceStoresBeforeDraft,
    draftStore,
    record,
    externalRequests,
    requestListener,
    values,
  };
}

async function createExactManualNegotiationResponse(page: Page, responseText = "مجری در تماس بیرون از چیدا گفت تجهیز کارگاه سه روز پس از توافق انجام می‌شود.") {
  const question = await createExactServiceNegotiationDraft(page);
  await page.getByTestId("manual-negotiation-response-add").click();
  await expect(page.getByTestId("manual-negotiation-response-editor")).toBeVisible();
  await expect(page.getByTestId("manual-negotiation-response-editor-title")).toBeFocused();
  await page.getByTestId("manual-negotiation-response-text").fill(responseText);
  await page.getByTestId("manual-negotiation-response-save").click();
  await expect(page.getByTestId("manual-negotiation-response-detail")).toBeVisible();
  await expect(page.getByTestId("manual-negotiation-response-detail-hero")).toBeFocused();
  const responseStore = await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey);
  const responseRecord = JSON.parse(responseStore ?? "[]")[0];
  return { ...question, responseText, responseStore, responseRecord };
}

async function createExactManualNegotiationResponseReview(page: Page, values: { outcome: "appears-addressed" | "needs-clarification" | "potential-conflict"; reason: string } = {
  outcome: "needs-clarification",
  reason: "از نظر من پاسخ زمان شروع را گفته، اما معلوم نکرده منظور روز کاری است یا تقویمی.",
}) {
  const response = await createExactManualNegotiationResponse(page);
  await expect(page.getByTestId("manual-response-review-add")).toHaveAccessibleName(`ثبت نتیجهٔ پاسخ برای مدت و زمان اجرا و ${response.firstSupplier}`);
  await page.getByTestId("manual-response-review-add").click();
  await expect(page.getByTestId("manual-response-review-editor")).toBeVisible();
  await expect(page.getByTestId("manual-response-review-editor-title")).toBeFocused();
  await page.getByTestId(`manual-response-review-outcome-${values.outcome}`).check();
  await page.getByTestId("manual-response-review-reason").fill(values.reason);
  await page.getByTestId("manual-response-review-save").click();
  await expect(page.getByTestId("manual-response-review-detail")).toBeVisible();
  await expect(page.getByTestId("manual-response-review-detail-hero")).toBeFocused();
  const reviewStore = await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey);
  const reviewRecord = JSON.parse(reviewStore ?? "[]")[0];
  return { ...response, reviewValues: values, reviewStore, reviewRecord };
}

async function createExactManualNegotiationConditionImpact(page: Page, values: {
  changeSummary: string;
  impactDomain: "cost" | "schedule" | "scope-or-specification" | "commercial-terms" | "multiple" | "unclear";
  impactDirection: "favorable-to-builder" | "adverse-to-builder" | "mixed" | "no-material-impact" | "unclear";
  reason: string;
} = {
  changeSummary: "شروع اجرای عایق از ده روز آینده به سه روز کاری پس از توافق تغییر کرده است.",
  impactDomain: "schedule",
  impactDirection: "favorable-to-builder",
  reason: "از نظر من زمان شروع کوتاه‌تر می‌شود، اما هنوز این برداشت باید بیرون از چیدا تأیید شود.",
}) {
  const response = await createExactManualNegotiationResponse(page);
  const responseRevision = response.responseRecord.revisions.find((item: { id: string }) => item.id === response.responseRecord.currentRevisionId);
  const sourceStoresBeforeImpact = {
    ...await commercialSourceStoreBytes(page),
    negotiationDrafts: await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey),
    manualResponses: await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey),
    manualResponseReviews: await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey),
  };

  await expect(page.getByTestId("manual-condition-impact-add")).toHaveAccessibleName(`ثبت اثر پاسخ برای مدت و زمان اجرا و ${response.firstSupplier}`);
  await page.getByTestId("manual-condition-impact-add").click();
  await expect(page.getByTestId("manual-condition-impact-editor")).toBeVisible();
  await expect(page.getByTestId("manual-condition-impact-editor-title")).toBeFocused();
  expect(await page.getByTestId("manual-condition-impact-editor").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  await page.getByTestId("manual-condition-impact-change-summary").fill(values.changeSummary);
  await page.getByTestId("manual-condition-impact-domain").selectOption(values.impactDomain);
  await page.getByTestId("manual-condition-impact-direction").selectOption(values.impactDirection);
  await page.getByTestId("manual-condition-impact-reason").fill(values.reason);
  await page.getByTestId("manual-condition-impact-save").click();
  await expect(page.getByTestId("manual-condition-impact-detail")).toBeVisible();
  await expect(page.getByTestId("manual-condition-impact-detail-hero")).toBeFocused();
  const impactStore = await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationConditionImpactStorageKey);
  const impactRecord = JSON.parse(impactStore ?? "[]")[0];
  return { ...response, responseRevision, impactValues: values, sourceStoresBeforeImpact, impactStore, impactRecord };
}

async function createTwoCurrentProductProposalsForComparison(page: Page, overrides: { firstTotalPrice?: string; firstSimpleDeclaredTotal?: boolean } = {}) {
  const firstSupplier = "فولاد مقایسه الف";
  const secondSupplier = "فولاد مقایسه ب";
  await openApprovedPurchaseRequestDispatch(page);
  await addLocalSupplierContact(page, { name: firstSupplier, category: "میلگرد", coverage: "غرب تهران", capability: "product" });
  await addLocalSupplierContact(page, { name: secondSupplier, category: "میلگرد", coverage: "مرکز تهران", capability: "product" });
  await returnFromDispatchToHome(page);
  await page.getByTestId("quick-action-compare-offers").click();

  const recordProposal = async (supplierName: string, values: { quantity: string; unit: string; unitPrice: string; totalPrice: string; transcript: string; simpleDeclaredTotal?: boolean }) => {
    await page.getByTestId("proposal-add").click();
    await page.getByTestId("proposal-supplier-select").selectOption({ label: `${supplierName} · محصول` });
    await page.getByTestId("proposal-line-status-0").selectOption("quoted");
    if (values.simpleDeclaredTotal) {
      await expect(page.getByTestId("proposal-editor-mode-simple")).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByTestId("proposal-editor-advanced")).toBeHidden();
      await page.getByTestId("proposal-line-use-request-quantity-0").check();
      await expect(page.getByTestId("proposal-line-quantity-0")).toHaveValue(/^[۵5]$/);
      await expect(page.getByTestId("proposal-line-unit-0")).toHaveValue(values.unit);
    } else {
      await openProposalAdvancedMode(page);
      await page.getByTestId("proposal-transcript").fill(values.transcript);
      await page.getByTestId("proposal-line-quantity-0").fill(values.quantity);
      await page.getByTestId("proposal-line-unit-0").fill(values.unit);
      await page.getByTestId("proposal-line-unit-price-0").fill(values.unitPrice);
    }
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
    simpleDeclaredTotal: overrides.firstSimpleDeclaredTotal,
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
  await openProposalSecondaryView(page, "proposal-comparisons-entry");
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
  await expect(page.getByTestId("project-context")).toContainText("برج نیلوفر");
  await expect(page.getByTestId("project-context")).not.toContainText("فضای پروژه");
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

  const projectNameInput = page.getByTestId("project-name-input");
  const projectLocationInput = page.getByTestId("project-location-input");
  await projectNameInput.fill("برج نیلوفر");
  await expect(projectNameInput).toHaveValue("برج نیلوفر");
  await projectLocationInput.fill("تهران");
  await expect(projectLocationInput).toHaveValue("تهران");
  await page.getByTestId("project-create-button").click();
  await expect(projectNameInput).toHaveValue("برج نیلوفر");
  await expect(page.getByTestId("project-location-error")).toContainText("محله یا منطقه");

  await projectLocationInput.fill("سعادت‌آباد");
  await expect(projectLocationInput).toHaveValue("سعادت‌آباد");
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
  const authScrollRange = await authScroller.evaluate((element) => element.scrollHeight - element.clientHeight);
  if (authScrollRange > 8) {
    await expect.poll(() => authScroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(8);
  } else {
    await expect(authScroller).toHaveJSProperty("scrollTop", 0);
  }
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

test("quick action chips form one readable draggable row at the RTL start", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);

  const rail = page.getByRole("region", { name: "اقدام‌های سریع" });
  const overflow = await rail.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(overflow).toBeGreaterThan(20);
  await expect(rail).toHaveCSS("direction", "ltr");
  await expect(rail.locator(".quick-chip")).toHaveCount(10);
  await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeCloseTo(overflow, 0);
  await expect(page.getByTestId("quick-action-purchase-request")).toContainText("درخواست قیمت");
  await expect(page.getByTestId("quick-action-compare-offers")).toContainText("پیشنهادها");
  await expect(page.getByTestId("quick-action-tasks")).toContainText("کار جدید");
  await expect(page.getByTestId("quick-action-files")).toContainText("افزودن فایل");
  await expect(page.getByTestId("quick-action-gallery")).toContainText("افزودن عکس");
  await expect(page.getByTestId("quick-action-memory")).toContainText("ثبت حافظه");
  await expect(page.getByTestId("quick-action-search")).toContainText("جست‌وجوی پروژه");
  await expect(page.getByTestId("quick-action-build")).toContainText("برایم بساز");
  await expect(page.getByTestId("quick-action-meeting-notes")).toContainText("شروع صورت‌جلسه");
  await expect(page.getByTestId("quick-action-project-plan")).toContainText("برنامه پروژه");

  const railBox = await rail.boundingBox();
  if (!railBox) throw new Error("Quick-action rail is not rendered");
  await page.mouse.move(railBox.x + railBox.width * 0.45, railBox.y + railBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(railBox.x + railBox.width * 0.82, railBox.y + railBox.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeLessThan(overflow - 10);
  await expect(page.getByTestId("composer-input")).toHaveValue("");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});

test("quick actions open every built project destination and label prompt starters honestly", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);

  await page.getByTestId("quick-action-tasks").click();
  await expect(page.getByTestId("project-tasks-view")).toBeVisible();
  await page.getByTestId("project-tasks-back").click();

  await page.getByTestId("quick-action-files").click();
  await expect(page.getByTestId("project-files-view")).toBeVisible();
  await page.getByTestId("project-files-back").click();

  await page.getByTestId("quick-action-gallery").click();
  await expect(page.getByTestId("project-gallery-view")).toBeVisible();
  await page.getByTestId("project-gallery-back").click();

  await page.getByTestId("quick-action-memory").click();
  await expect(page.getByTestId("project-memory-view")).toBeVisible();
  await page.getByTestId("project-memory-back").click();

  await page.getByTestId("quick-action-search").click();
  await expect(page.getByTestId("project-source-search-view")).toBeVisible();
  await page.getByTestId("project-source-search-back").click();

  await page.getByTestId("quick-action-project-plan").click();
  await expect(page.getByTestId("project-backbone-view")).toBeVisible();
  await page.getByTestId("project-backbone-back").click();

  await page.getByTestId("quick-action-build").click();
  await expect(page.getByTestId("build-flow")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByTestId("quick-action-meeting-notes").click();
  await expect(page.getByTestId("composer-input")).toHaveValue("شروع صورت‌جلسه");
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

test("builder stores a project document locally, opens the real file, and keeps photos out of Files", async ({ page }) => {
  test.slow();
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
  await expect(filesView).not.toContainText("محتوای واقعی فایل روی سرور ارسال نمی‌شود");
  await expect(page.getByTestId("project-files-empty")).toBeVisible();
  await expect(page.getByTestId("project-file-input")).not.toHaveAttribute("accept", /png|jpe?g|webp|heic/i);

  const fileInput = page.getByTestId("project-file-input");
  await fileInput.setInputFiles({
    name: "installer.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("not-an-accepted-project-file"),
  });
  await expect(page.getByTestId("project-file-error")).toContainText("پشتیبانی نمی‌شود");
  await expect(page.getByTestId("project-file-register-sheet")).toHaveCount(0);

  await fileInput.setInputFiles({
    name: "گزارش جعلی.pdf",
    mimeType: "text/html",
    buffer: Buffer.from("<script>localStorage.setItem('__chida_active_content_probe','executed')</script>"),
  });
  await expect(page.getByTestId("project-file-error")).toContainText("پسوند و نوع واقعی فایل");
  await expect(page.getByTestId("project-file-register-sheet")).toHaveCount(0);
  await expect(page.getByTestId("project-file-row")).toHaveCount(0);

  const registerSheet = page.getByTestId("project-file-register-sheet");
  await fileInput.setInputFiles({ name: "تصویر کارگاه.jpg", mimeType: "image/jpeg", buffer: sampleProjectImage.buffer });
  await expect(page.getByTestId("project-file-error")).toContainText("گالری تصاویر");
  await expect(registerSheet).toHaveCount(0);

  const sampleDocument = {
    name: "پیش‌فاکتور بتن.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n% CHIDA synthetic test document"),
  };
  await fileInput.setInputFiles(sampleDocument);
  await expect(registerSheet).toBeVisible();
  await expect(registerSheet).toContainText("پیش‌فاکتور بتن.pdf");
  await expect(registerSheet).toContainText("برج نیلوفر");
  await expect(registerSheet).not.toContainText("نسخهٔ ۱");
  await expect(registerSheet).not.toContainText("منشأ");
  await expect(registerSheet).not.toContainText("دسترسی");
  await expect(registerSheet).not.toContainText("وضعیت");
  expect(await registerSheet.locator(".project-file-preview-title small").evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(14);
  expect(await registerSheet.locator(".project-file-preview-title strong").evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
  expect(await registerSheet.locator(".project-file-meta dt").first().evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(14);
  expect(await registerSheet.locator(".project-file-meta dd").first().evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(15);
  expect(await registerSheet.locator(".project-file-category-field > span").evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(14);
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
  await expect(fileRow).not.toContainText("نسخهٔ ۱");
  const rowMetadataFontSize = await fileRow.locator(".project-file-row-copy small").evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize));
  expect(rowMetadataFontSize).toBeGreaterThanOrEqual(11);
  const storedFileMetadata = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1") ?? "");
  expect(JSON.parse(storedFileMetadata)[0]).toMatchObject({
    projectId: activeProjectId,
    originalName: "پیش‌فاکتور بتن.pdf",
    version: 1,
    visibility: "خصوصی پروژه",
    storageMode: "browser-file",
  });
  expect(storedFileMetadata).not.toContain("CHIDA synthetic test document");
  expect(storedFileMetadata).not.toContain("buffer");
  const fileOpen = page.getByTestId("project-file-open");
  await expect(fileOpen).toHaveAttribute("href", /^blob:/);
  await expect(fileOpen).toHaveAttribute("target", "_blank");
  const popupPromise = page.waitForEvent("popup");
  await fileOpen.click();
  const openedFile = await popupPromise;
  expect(openedFile).toBeTruthy();
  await openedFile.close();

  await page.getByTestId("project-file-edit").click();

  const detailSheet = page.getByTestId("project-file-detail-sheet");
  await expect(detailSheet).toBeVisible();
  await expect(detailSheet).not.toContainText("خصوصی در برج نیلوفر");
  await expect(detailSheet).not.toContainText("انتخاب مستقیم از دستگاه");
  await expect(detailSheet).not.toContainText("داده برای بررسی است، نه دستور برای چیدا");
  expect(await detailSheet.locator(".project-file-meta dt").first().evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(14);
  expect(await page.getByTestId("project-file-display-name").evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
  await page.getByTestId("project-file-display-name").fill("پیش‌فاکتور بتن مرداد");
  await page.getByTestId("project-file-rename-save").click();
  await expect(detailSheet).toBeHidden();
  await expect(fileRow).toContainText("پیش‌فاکتور بتن مرداد");

  await page.evaluate(async ({ projectId }) => {
    const records = JSON.parse(window.localStorage.getItem("chida-prototype-project-files:v1") ?? "[]") as Array<{ id: string; originalName: string }>;
    const record = records[0];
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open("chida-prototype-project-file-content:v1", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("files", "readwrite");
      transaction.objectStore("files").put({
        id: record.id,
        projectId,
        originalName: record.originalName,
        mimeType: "text/html",
        blob: new Blob(["<script>localStorage.setItem('__chida_active_content_probe','executed')</script>"], { type: "text/html" }),
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    database.close();
  }, { projectId: activeProjectId });

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await expect(page.getByTestId("project-files-entry")).toContainText("۱ فایل ثبت‌شده");
  await page.getByTestId("project-files-entry").click();
  await expect(page.getByTestId("project-file-row")).toContainText("پیش‌فاکتور بتن مرداد");
  const restoredFileOpen = page.getByTestId("project-file-open");
  await expect(restoredFileOpen).toHaveAttribute("href", /^blob:/);
  const safeContentType = await restoredFileOpen.evaluate(async (element) => {
    const response = await fetch((element as HTMLAnchorElement).href);
    return response.headers.get("content-type");
  });
  expect(safeContentType).toBe("application/pdf");
  const unsafePopupPromise = page.waitForEvent("popup");
  await restoredFileOpen.click();
  const unsafePopup = await unsafePopupPromise;
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.localStorage.getItem("__chida_active_content_probe"))).toBeNull();
  await unsafePopup.close();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

  await page.getByTestId("project-files-back").click();
  await page.getByTestId("project-space-back").click();
  await page.getByTestId("capability-cluster").click();
  await page.getByTestId("project-documents-tool").click();
  await expect(page.getByTestId("project-files-view")).toBeVisible();
});

test("an older metadata-only document can be reselected by recorded name and size without claiming content identity", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const activeProjectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  if (!activeProjectId) throw new Error("Active project was not created");
  const legacyDocument = {
    name: "صورت وضعیت قدیمی.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n% CHIDA legacy document"),
  };
  await page.evaluate(({ projectId, size }) => {
    window.localStorage.setItem("chida-prototype-project-files:v1", JSON.stringify([{
      id: "legacy-metadata-document",
      projectId,
      displayName: "صورت وضعیت قدیمی",
      originalName: "صورت وضعیت قدیمی.pdf",
      mimeType: "application/pdf",
      size,
      category: "صورت‌جلسه",
      source: "انتخاب مستقیم از دستگاه",
      status: "ثبت محلی",
      version: 1,
      projectStage: "اسکلت بندی",
      visibility: "خصوصی پروژه",
      storageMode: "metadata-only",
      sourceModifiedAt: null,
      createdAt: "2026-08-27T11:00:00.000Z",
    }]));
  }, { projectId: activeProjectId, size: legacyDocument.buffer.length });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-files-entry").click();

  const wrongNameChooserPromise = page.waitForEvent("filechooser");
  await page.getByTestId("project-file-open").click();
  const wrongNameChooser = await wrongNameChooserPromise;
  await wrongNameChooser.setFiles({ ...legacyDocument, name: "صورت وضعیت دیگر.pdf" });
  await expect(page.getByTestId("project-file-open-error")).toContainText("هم‌خوان نیست");
  expect(JSON.parse(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1") ?? "[]"))[0]).toMatchObject({
    id: "legacy-metadata-document",
    storageMode: "metadata-only",
  });

  const wrongSizeChooserPromise = page.waitForEvent("filechooser");
  await page.getByTestId("project-file-open").click();
  const wrongSizeChooser = await wrongSizeChooserPromise;
  await wrongSizeChooser.setFiles({ ...legacyDocument, buffer: Buffer.concat([legacyDocument.buffer, Buffer.from("x")]) });
  await expect(page.getByTestId("project-file-open-error")).toContainText("هم‌خوان نیست");
  expect(JSON.parse(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1") ?? "[]"))[0]).toMatchObject({
    id: "legacy-metadata-document",
    storageMode: "metadata-only",
  });

  const wrongMimeChooserPromise = page.waitForEvent("filechooser");
  await page.getByTestId("project-file-open").click();
  const wrongMimeChooser = await wrongMimeChooserPromise;
  await wrongMimeChooser.setFiles({ ...legacyDocument, mimeType: "text/html" });
  await expect(page.getByTestId("project-file-open-error")).toContainText("هم‌خوان نیست");
  expect(JSON.parse(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1") ?? "[]"))[0]).toMatchObject({
    id: "legacy-metadata-document",
    storageMode: "metadata-only",
  });

  const chooserPromise = page.waitForEvent("filechooser");
  await page.getByTestId("project-file-open").click();
  const chooser = await chooserPromise;
  await chooser.setFiles(legacyDocument);
  await expect(page.getByTestId("project-file-open-error")).toContainText("اصالت یا برابری محتوای آن با فایل قدیمی تأیید نمی‌شود");
  await expect(page.getByTestId("project-file-open-error")).not.toContainText("همان فایل اصلی");
  const restoredOpen = page.getByTestId("project-file-open");
  await expect(restoredOpen).toHaveAttribute("href", /^blob:/);
  expect(JSON.parse(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1") ?? "[]"))[0]).toMatchObject({
    id: "legacy-metadata-document",
    storageMode: "browser-file",
  });
  const restoredMime = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open("chida-prototype-project-file-content:v1", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const stored = await new Promise<{ mimeType?: string; blob?: Blob } | undefined>((resolve, reject) => {
      const transaction = database.transaction("files", "readonly");
      const request = transaction.objectStore("files").get("legacy-metadata-document");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return { metadata: stored?.mimeType ?? "", blob: stored?.blob?.type ?? "" };
  });
  expect(restoredMime).toEqual({ metadata: "application/pdf", blob: "application/pdf" });

  const popupPromise = page.waitForEvent("popup");
  await restoredOpen.click();
  const openedFile = await popupPromise;
  expect(openedFile).toBeTruthy();
  await openedFile.close();
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
  await expect(galleryView).not.toContainText("به سرور ارسال نمی‌شوند");
  await expect(page.getByTestId("project-gallery-empty")).toBeVisible();
  await expect(page.getByTestId("project-camera-input")).toHaveAttribute("capture", "environment");

  await page.getByTestId("project-camera-input").setInputFiles({ ...sampleProjectImage, name: "عکس دوربین کارگاه.png" });
  await expect(page.getByTestId("project-file-register-sheet")).not.toContainText("دوربین دستگاه");
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
  await expect(registerSheet).not.toContainText("خصوصی در همین پروژه");
  await expect(registerSheet).not.toContainText("منشأ");
  await expect(registerSheet).not.toContainText("نسخه");
  await expect(registerSheet).not.toContainText("وضعیت");
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
  await expect(detailSheet).not.toContainText("خصوصی در برج نیلوفر");
  await expect(detailSheet).not.toContainText("این تصویر فقط مدرک پروژه است");
  await expect(detailSheet).not.toContainText("نسخه و وضعیت");
  await expect(detailSheet).toContainText("اسکلت بندی");
  const photoDetailFont = await detailSheet.locator(".project-file-meta dd").first().evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize));
  expect(photoDetailFont).toBeGreaterThanOrEqual(14);
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
  await expect(page.getByTestId("project-files-entry")).toContainText("هنوز فایلی ثبت نشده");
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

test("project gallery rejects mismatched files and keeps the photo category out of document registration", async ({ page }) => {
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
  await page.getByTestId("project-file-category").click();
  await expect(page.getByTestId("project-file-category-option-عکس")).toHaveCount(0);
  await page.keyboard.press("Escape");
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

test("project gallery never creates metadata when image storage fails before commit", async ({ page }) => {
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
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1"))).toBe(storageBefore);

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

test("project document content failure rolls back its metadata", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-files-entry").click();

  await page.evaluate(() => {
    const nativeTransaction = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function transaction(storeNames: string | Iterable<string>, mode?: IDBTransactionMode, options?: IDBTransactionOptions) {
      if (this.name === "chida-prototype-project-file-content:v1" && mode === "readwrite") throw new DOMException("IndexedDB write failed", "InvalidStateError");
      return nativeTransaction.call(this, storeNames, mode, options);
    };
  });

  await page.getByTestId("project-file-input").setInputFiles({
    name: "صورت وضعیت.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF local IndexedDB rollback"),
  });
  await page.getByTestId("project-file-register").click();

  await expect(page.getByTestId("project-file-register-sheet")).toBeVisible();
  await expect(page.getByTestId("project-file-register-error")).toContainText("ذخیره نشد");
  await expect(page.getByTestId("project-file-row")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1"))).toBeNull();
});

test("project document parser fail-closes mixed invalid records without rewriting their bytes", async ({ page }) => {
  await page.goto("/");
  const seededRaw = await page.evaluate(() => {
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
    const raw = JSON.stringify([
      { ...common, id: "", displayName: "", originalName: "blank.pdf" },
      { ...common, id: "invalid-date", displayName: "تاریخ خراب", originalName: "invalid-date.pdf", createdAt: "not-a-date" },
      { ...common, id: "unsupported", displayName: "فایل اجرایی", originalName: "installer.exe" },
      { ...common, id: "invalid-source", displayName: "منشأ جعلی", originalName: "forged-source.pdf", source: "وب" },
      { ...common, id: "valid-file", displayName: " گزارش معتبر ", originalName: "report.pdf" },
      { ...common, id: "valid-file", displayName: "شناسه تکراری", originalName: "duplicate.pdf" },
    ]);
    window.localStorage.setItem("chida-prototype-project-files:v1", raw);
    return raw;
  });

  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-files-entry").click();

  await expect(page.getByTestId("project-files-read-error")).toContainText("کامل خوانده نشد");
  await expect(page.getByTestId("project-file-row")).toHaveCount(0);
  await expect(page.getByTestId("project-file-add")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1"))).toBe(seededRaw);
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

test("quick actions realign to the RTL start after returning to chat", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const quickActions = page.locator(".quick-actions");
  const overflow = await quickActions.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(overflow).toBeGreaterThan(20);
  await expect.poll(() => quickActions.evaluate((element) => element.scrollLeft)).toBeCloseTo(overflow, 0);
  await quickActions.evaluate((element) => { element.scrollLeft = 0; });

  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-space-back").click();

  await expect.poll(() => quickActions.evaluate((element) => element.scrollLeft)).toBeCloseTo(overflow, 0);
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
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"))).toBeNull();

  await page.getByTestId("open-project-space").click();
  const memoryEntry = page.getByTestId("project-memory-entry");
  await expect(memoryEntry).toContainText("حافظهٔ پروژه");
  await expect(memoryEntry).toContainText("هنوز موردی ثبت نشده");
  await memoryEntry.click();

  const memoryView = page.getByTestId("project-memory-view");
  await expect(memoryView).toBeVisible();
  await expect(memoryView).toContainText("چیدا چه می‌داند");
  await expect(memoryView).not.toContainText("تاریخچهٔ گفتگو حافظه نیست");
  await expect(page.getByTestId("project-memory-empty")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

  await page.getByTestId("project-memory-add").click();
  const editor = page.getByTestId("project-memory-editor-sheet");
  await expect(editor).toBeVisible();
  await expect(editor).not.toContainText("ثبت مستقیم شما");
  await expect(editor).not.toContainText("خصوصی پروژه");
  await expect(editor).not.toContainText("فقط یک ترجیح محلی");
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
  const storedMemory = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(storedMemory.records).toEqual([
    expect.objectContaining({
      projectId: expect.any(String),
      title: "قاعدهٔ خرید بتن",
      content: "فاکتور رسمی و زمان تحویل پیش از مقایسهٔ قیمت بررسی شود.",
      kind: "واقعیت تأییدشده توسط سازنده",
      sourceLabel: "ثبت مستقیم شما",
      visibility: "visible",
      useInContextPreference: true,
      version: 1,
    }),
  ]);

  await memoryCard.click();
  const detail = page.getByTestId("project-memory-detail-sheet");
  await expect(detail).toBeVisible();
  await expect(detail).toContainText("ثبت مستقیم شما");
  await expect(detail).not.toContainText("خصوصی در برج نیلوفر");
  await expect(detail).toContainText("نسخه");
  await expect(detail).not.toContainText("این کنترل فعلاً فقط در مرورگر");
  const memoryBodyFont = await detail.locator(".project-memory-detail-content").evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize));
  expect(memoryBodyFont).toBeGreaterThanOrEqual(16);
  await page.getByTestId("project-memory-use-toggle").click();
  await expect(page.getByTestId("project-memory-use-toggle")).toContainText("خاموش");

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
  await expect(page.getByTestId("project-memory-card")).not.toContainText("در زمینه استفاده نمی‌شود");
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-delete").click();
  await expect(page.getByTestId("project-memory-delete-confirmation")).toContainText("حذف دائمی از این مرورگر");
  await expect(page.getByRole("button", { name: "انصراف" })).toBeFocused();
  await page.getByTestId("project-memory-delete-confirm").click();
  await expect(page.getByTestId("project-memory-empty")).toBeVisible();
  const afterDelete = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(afterDelete.records).toEqual([]);
  expect(afterDelete.tombstones).toEqual([expect.objectContaining({ id: expect.any(String), priorContentHash: expect.stringMatching(/^sha256-[0-9a-f]{64}$/) })]);
});

test("memory core keeps personal and project records versioned with independent eligibility controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();

  await expect(page.getByTestId("project-memory-view")).toContainText("حافظهٔ شخصی و پروژه");
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-scope-account").click();
  await page.getByTestId("project-memory-title").fill("شیوهٔ پاسخ دلخواه من");
  await page.getByTestId("project-memory-content").fill("پاسخ‌ها کوتاه، شفاف و اقدام‌محور باشند.");
  await chooseProjectOption(page, "project-memory-kind", "ترجیح");
  await page.getByTestId("project-memory-save").click();

  await page.getByTestId("memory-scope-account").click();
  const personalCard = page.getByTestId("project-memory-card");
  await expect(personalCard).toHaveCount(1);
  await expect(personalCard).toContainText("شیوهٔ پاسخ دلخواه من");
  await personalCard.click();

  await expect(page.getByTestId("memory-control-visibility")).toContainText("قابل مشاهده");
  await expect(page.getByTestId("memory-control-manual-searchability")).toContainText("روشن");
  await expect(page.getByTestId("memory-control-automatic-retrieval")).toContainText("خاموش");
  await expect(page.getByTestId("memory-control-model-eligibility")).toContainText("خاموش");
  await expect(page.getByTestId("memory-control-shareability")).toContainText("خاموش");
  await expect(page.getByTestId("memory-control-context-preference")).toContainText("روشن");

  const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(stored).toMatchObject({ schemaVersion: 2, fingerprintVersion: "memory-v2", envelopeVersion: 1 });
  expect(stored.records).toHaveLength(1);
  expect(stored.records[0]).toMatchObject({
    scopeType: "account_private",
    scopeId: "local-builder-account",
    memoryType: "preference",
    provenanceClass: "direct_user",
    status: "current",
    visibility: "visible",
    manualSearchability: true,
    automaticRetrievalEligibility: false,
    modelEligibility: false,
    shareability: false,
    useInContextPreference: true,
    version: 1,
  });
  expect(stored.records[0].sourceRefs).toEqual([`direct-remember:${stored.records[0].id}:v1`]);
  expect(stored.records[0].history).toHaveLength(1);
  expect(stored.records[0].revisions).toHaveLength(1);
  expect(stored.candidates).toEqual([]);
  expect(stored.tombstones).toEqual([]);

  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).toBeNull();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test("memory scope tabs and destructive confirmation are keyboard-accessible RTL controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("memory-scope-project").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByTestId("memory-scope-account")).toBeFocused();
  await expect(page.getByTestId("memory-scope-account")).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "memory-scope-account-tab");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("memory-scope-project")).toBeFocused();

  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("حافظهٔ پنهان آزمون");
  await page.getByTestId("project-memory-content").fill("نمای مدیریتی باید پنهان‌بودن را آشکار نشان دهد.");
  await page.getByTestId("project-memory-save").click();
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("memory-control-visibility").getByRole("button").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("project-memory-managed-toggle").click();
  await expect(page.getByTestId("project-memory-card")).toContainText("پنهان");
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-delete").click();
  await expect(page.getByTestId("project-memory-delete-confirmation").getByRole("button", { name: "انصراف" })).toBeFocused();
  const deleteSheet = page.locator(".bottom-sheet").filter({ has: page.getByTestId("project-memory-delete-confirmation") });
  await expect(deleteSheet).toHaveCSS("direction", "rtl");
  await page.getByTestId("project-memory-delete-confirmation").getByRole("button", { name: "انصراف" }).click();
  await expect(page.getByTestId("project-memory-delete")).toBeFocused();
});

test("memory core upgrades an early direct record to an exact versioned source reference under lock", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("حافظهٔ نیازمند ارتقای منشأ");
  await page.getByTestId("project-memory-content").fill("نسخهٔ اولیهٔ محلی، locator مستقیم نداشت.");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-editor-sheet")).toBeHidden();
  await page.evaluate(() => {
    const stable = (value: any): any => Array.isArray(value)
      ? value.map(stable)
      : value && typeof value === "object"
        ? Object.fromEntries(Object.entries(value).sort(([first], [second]) => first.localeCompare(second)).map(([key, item]) => [key, stable(item)]))
        : value;
    const hash = (serialized: string) => {
      let result = 2166136261;
      for (let index = 0; index < serialized.length; index += 1) {
        result ^= serialized.charCodeAt(index);
        result = Math.imul(result, 16777619);
      }
      return (result >>> 0).toString(16).padStart(8, "0");
    };
    const currentKey = "chida-prototype-memory-core:v2";
    const priorKey = "chida-prototype-memory-core:v1";
    const envelope = JSON.parse(window.localStorage.getItem(currentKey) ?? "null");
    envelope.schemaVersion = 1;
    delete envelope.fingerprintVersion;
    envelope.records[0].sourceRefs = [];
    envelope.records[0].revisions.forEach((revision: any, index: number) => {
      const event = envelope.records[0].history[index];
      revision.fingerprint = `fnv1a-${hash(JSON.stringify(stable({ scopeType: envelope.records[0].scopeType, scopeId: envelope.records[0].scopeId, snapshot: revision.snapshot, event: { type: event.type, lineage: event.lineage } })))}`;
    });
    window.localStorage.setItem(priorKey, JSON.stringify(envelope));
    window.localStorage.removeItem(currentKey);
    window.localStorage.removeItem("chida-prototype-memory-core:v1:hard-delete-intent:v1");
  });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toHaveCount(0);
  await expect(page.getByTestId("project-memory-card")).toContainText("حافظهٔ نیازمند ارتقای منشأ");
  const upgraded = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(upgraded.records[0].sourceRefs).toEqual([`direct-remember:${upgraded.records[0].id}:v1`]);
  expect(upgraded.records[0]).toMatchObject({ version: 2 });
  expect(upgraded.records[0].history.at(-1)).toMatchObject({ type: "source-migrated", version: 2 });
  expect(upgraded.envelopeVersion).toBe(2);
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-delete").click();
  await page.getByTestId("project-memory-delete-confirm").click();
  await expect(page.getByTestId("project-memory-empty")).toBeVisible();
  const priorAfterDelete = await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v1"));
  expect(priorAfterDelete).not.toContain("حافظهٔ نیازمند ارتقای منشأ");
  expect(priorAfterDelete).not.toContain("نسخهٔ اولیهٔ محلی، locator مستقیم نداشت.");
});

test("memory metadata migration recovers a pre-lineage supersession chain without reopening terminal state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("حافظهٔ قدیمی زنجیره");
  await page.getByTestId("project-memory-content").fill("نسخهٔ قدیمی پیش از lineage دقیق");
  await page.getByTestId("project-memory-save").click();
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-supersede").click();
  await page.getByTestId("project-memory-title").fill("حافظهٔ تازه زنجیره");
  await page.getByTestId("project-memory-content").fill("نسخهٔ جایگزین باید پس از مهاجرت جاری بماند.");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-card")).toContainText("حافظهٔ تازه زنجیره");

  await page.evaluate(() => {
    const stable = (value: any): any => Array.isArray(value)
      ? value.map(stable)
      : value && typeof value === "object"
        ? Object.fromEntries(Object.entries(value).sort(([first], [second]) => first.localeCompare(second)).map(([key, item]) => [key, stable(item)]))
        : value;
    const hash = (serialized: string) => {
      let result = 2166136261;
      for (let index = 0; index < serialized.length; index += 1) {
        result ^= serialized.charCodeAt(index);
        result = Math.imul(result, 16777619);
      }
      return (result >>> 0).toString(16).padStart(8, "0");
    };
    const currentKey = "chida-prototype-memory-core:v2";
    const priorKey = "chida-prototype-memory-core:v1";
    const envelope = JSON.parse(window.localStorage.getItem(currentKey) ?? "null");
    envelope.schemaVersion = 1;
    delete envelope.fingerprintVersion;
    envelope.records.forEach((record: any) => {
      record.sourceRefs = [];
      record.history.forEach((event: any) => { delete event.lineage; });
      record.revisions.forEach((revision: any) => {
        revision.fingerprint = `fnv1a-${hash(JSON.stringify(stable({ scopeType: record.scopeType, scopeId: record.scopeId, snapshot: revision.snapshot })))}`;
      });
    });
    window.localStorage.setItem(priorKey, JSON.stringify(envelope));
    window.localStorage.removeItem(currentKey);
    window.localStorage.removeItem("chida-prototype-memory-core:v1:hard-delete-intent:v1");
  });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toHaveCount(0);
  await expect(page.getByTestId("project-memory-card")).toContainText("حافظهٔ تازه زنجیره");
  const upgraded = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  const predecessor = upgraded.records.find((record: any) => record.status === "superseded");
  const replacement = upgraded.records.find((record: any) => record.supersedesId === predecessor.id);
  expect(predecessor).toMatchObject({ supersededById: replacement.id, status: "superseded" });
  expect(replacement).toMatchObject({ status: "current", supersedesId: predecessor.id });
  for (const record of upgraded.records) {
    expect(record.sourceRefs).toEqual([`direct-remember:${record.id}:v1`]);
    expect(record.history.every((event: any) => event.lineage && Array.isArray(event.lineage.conflictIds))).toBe(true);
    expect(record.history.at(-1).type).toBe("source-migrated");
  }
});

test("snapshot migration replays a resolved conflict instead of deriving history from the final graph", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  for (const content of ["نسخهٔ تعارض الف", "نسخهٔ تعارض ب"]) {
    await page.getByTestId("project-memory-add").click();
    await page.getByTestId("project-memory-title").fill("قاعدهٔ مهاجرت تعارض");
    await page.getByTestId("project-memory-content").fill(content);
    await page.getByTestId("project-memory-save").click();
  }
  await page.getByTestId("project-memory-card").filter({ hasText: "نسخهٔ تعارض الف" }).click();
  await page.getByTestId("project-memory-edit").click();
  await page.getByTestId("project-memory-title").fill("قاعدهٔ حل‌شدهٔ مهاجرت");
  await page.getByTestId("project-memory-save").click();
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null").records.every((record: any) => record.conflictIds.length === 0))).toBe(true);

  await page.evaluate(() => {
    const stable = (value: any): any => Array.isArray(value)
      ? value.map(stable)
      : value && typeof value === "object"
        ? Object.fromEntries(Object.entries(value).sort(([first], [second]) => first.localeCompare(second)).map(([key, item]) => [key, stable(item)]))
        : value;
    const hash = (serialized: string) => {
      let result = 2166136261;
      for (let index = 0; index < serialized.length; index += 1) {
        result ^= serialized.charCodeAt(index);
        result = Math.imul(result, 16777619);
      }
      return (result >>> 0).toString(16).padStart(8, "0");
    };
    const currentKey = "chida-prototype-memory-core:v2";
    const priorKey = "chida-prototype-memory-core:v1";
    const envelope = JSON.parse(window.localStorage.getItem(currentKey) ?? "null");
    envelope.schemaVersion = 1;
    delete envelope.fingerprintVersion;
    envelope.records.forEach((record: any) => {
      record.history.forEach((event: any) => { delete event.lineage; });
      record.revisions.forEach((revision: any) => {
        revision.fingerprint = `fnv1a-${hash(JSON.stringify(stable({ scopeType: record.scopeType, scopeId: record.scopeId, snapshot: revision.snapshot })))}`;
      });
    });
    window.localStorage.setItem(priorKey, JSON.stringify(envelope));
    window.localStorage.removeItem(currentKey);
    window.localStorage.removeItem("chida-prototype-memory-core:v1:hard-delete-intent:v1");
  });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toHaveCount(0);
  const migrated = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(migrated.records).toHaveLength(2);
  for (const record of migrated.records) {
    const disputed = record.history.find((event: any) => event.type === "disputed" && event.lineage.conflictIds.length === 1);
    const resolved = record.history.find((event: any) => event.type === "conflicts-resolved" && event.lineage.conflictIds.length === 0);
    expect(disputed).toBeTruthy();
    expect(resolved).toBeTruthy();
    expect(record.conflictIds).toEqual([]);
    expect(record.history.at(-1).type).toBe("schema-migrated");
  }
});

test("memory core migrates legacy aliases conservatively and never turns context preference into permission", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const projectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  if (!projectId) throw new Error("Active project id is unavailable");
  const timestamp = "2026-08-30T12:00:00.000Z";
  await page.evaluate(({ ownerProjectId, storedAt }) => {
    const common = { source: "ثبت مستقیم شما", status: "ثبت محلی", version: 1, createdAt: storedAt, updatedAt: storedAt };
    window.localStorage.setItem("chida-prototype-project-memories:v1", JSON.stringify([
      { ...common, id: "legacy-project", scope: "project", projectId: ownerProjectId, title: "حافظهٔ پروژه‌ای قدیمی", content: "ترجیح زمینه روشن بود اما مجوز مدل نیست.", kind: "یادداشت سازنده", visibility: "خصوصی پروژه", useInContext: true },
      { ...common, id: "legacy-personal", scope: "personal", title: "حافظهٔ شخصی قدیمی", content: "این مورد یک veto صریح برای زمینه دارد.", kind: "ترجیح", visibility: "خصوصی شخصی", useInContext: false },
    ]));
  }, { ownerProjectId: projectId, storedAt: timestamp });

  await openSavedProjectMemory(page);
  const canonical = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(canonical.records).toHaveLength(2);
  expect(canonical.records).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: "legacy-project", scopeType: "project_private", scopeId: projectId, useInContextPreference: true, automaticRetrievalEligibility: false, modelEligibility: false, shareability: false }),
    expect.objectContaining({ id: "legacy-personal", scopeType: "account_private", scopeId: "local-builder-account", useInContextPreference: false, automaticRetrievalEligibility: false, modelEligibility: false, shareability: false }),
  ]));
  expect(canonical.migrationReports).toEqual([expect.objectContaining({ status: "migrated", migratedCount: 2, quarantined: [] })]);
  await expect(page.getByTestId("project-memory-card")).toContainText("حافظهٔ پروژه‌ای قدیمی");
  await page.getByTestId("memory-scope-account").click();
  await expect(page.getByTestId("project-memory-card")).toContainText("حافظهٔ شخصی قدیمی");
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-delete").click();
  await page.getByTestId("project-memory-delete-confirm").click();
  await expect(page.getByTestId("project-memory-empty")).toBeVisible();
  const legacyAfterDelete = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"));
  expect(legacyAfterDelete).not.toContain("حافظهٔ شخصی قدیمی");
  expect(legacyAfterDelete).not.toContain("این مورد یک veto صریح برای زمینه دارد.");
  expect(legacyAfterDelete).toContain("حافظهٔ پروژه‌ای قدیمی");
  const cutoverMarker = await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v1:hard-delete-intent:v1"));
  expect(JSON.parse(cutoverMarker ?? "null")).toMatchObject({ operation: "memory-core-v2-cutover", state: "cutover-committed" });
  expect(cutoverMarker).not.toContain("حافظهٔ شخصی قدیمی");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2:hard-delete-intent:v2"))).toBeNull();
});

test("a valid empty memory envelope never resurrects legacy bytes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const projectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  if (!projectId) throw new Error("Active project id is unavailable");
  const emptyEnvelope = { schemaVersion: 2, fingerprintVersion: "memory-v2", envelopeVersion: 1, records: [], candidates: [], tombstones: [], migrationReports: [], updatedAt: "2026-08-30T12:00:00.000Z" };
  await page.evaluate(({ canonical, ownerProjectId }) => {
    window.localStorage.setItem("chida-prototype-memory-core:v2", JSON.stringify(canonical));
    window.localStorage.setItem("chida-prototype-project-memories:v1", JSON.stringify([{ id: "legacy-must-stay-ignored", projectId: ownerProjectId, title: "نباید زنده شود", content: "وجود marker خالی canonical مقدم است.", kind: "یادداشت سازنده", source: "ثبت مستقیم شما", visibility: "خصوصی پروژه", useInContext: true, status: "ثبت محلی", version: 1, createdAt: "2026-08-30T11:00:00.000Z", updatedAt: "2026-08-30T11:00:00.000Z" }]));
  }, { canonical: emptyEnvelope, ownerProjectId: projectId });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-empty")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"))).toBe(JSON.stringify(emptyEnvelope));
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).toContain("legacy-must-stay-ignored");
});

test("memory edit no-op is byte-stable while edit control and rollback append revisions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("قاعدهٔ نسخه‌دار");
  await page.getByTestId("project-memory-content").fill("نسخهٔ نخست حافظه");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-editor-sheet")).toHaveCount(0);
  await expect(page.getByTestId("project-memory-card")).toHaveCount(1);
  const bytesV1 = await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"));

  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-edit").click();
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-editor-sheet")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"))).toBe(bytesV1);

  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-edit").click();
  await page.getByTestId("project-memory-content").fill("نسخهٔ دوم حافظه");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-card")).toContainText("نسخهٔ دوم حافظه");
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-use-toggle").click();
  await expect(page.getByTestId("project-memory-use-toggle")).toHaveAttribute("aria-pressed", "false");
  let canonical = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(canonical.records[0]).toMatchObject({ version: 3, content: "نسخهٔ دوم حافظه", useInContextPreference: false });
  expect(canonical.records[0].history).toHaveLength(3);
  expect(canonical.records[0].revisions).toHaveLength(3);

  await page.getByTestId("project-memory-history").locator("summary").click();
  await page.getByTestId("project-memory-history").locator("li").filter({ hasText: "نسخهٔ ۱" }).getByRole("button", { name: "بازگردانی به‌عنوان نسخهٔ تازه" }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null").records[0].version)).toBe(4);
  canonical = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(canonical.records[0]).toMatchObject({ version: 4, content: "نسخهٔ نخست حافظه", useInContextPreference: true });
  expect(canonical.records[0].history.at(-1)).toMatchObject({ type: "rolled-back", rollbackFromVersion: 1, version: 4 });
});

test("memory conflict is explicit and supersede keeps reciprocal lineage", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  for (const content of ["فقط برند الف مجاز است.", "برند ب نیز مجاز است."]) {
    await page.getByTestId("project-memory-add").click();
    await page.getByTestId("project-memory-title").fill("قاعدهٔ برند");
    await page.getByTestId("project-memory-content").fill(content);
    await chooseProjectOption(page, "project-memory-kind", "محدودیت");
    await page.getByTestId("project-memory-save").click();
  }
  await expect(page.getByTestId("project-memory-card")).toHaveCount(2);
  await expect(page.getByTestId("project-memory-card").nth(0)).toContainText("نیازمند بازبینی");
  await expect(page.getByTestId("project-memory-card").nth(1)).toContainText("نیازمند بازبینی");

  await page.getByTestId("project-memory-card").nth(0).click();
  await expect(page.getByTestId("project-memory-status-alert")).toContainText("برندهٔ پنهان");
  await page.getByTestId("project-memory-supersede").click();
  await page.getByTestId("project-memory-title").fill("قاعدهٔ برند بازبینی‌شده");
  await page.getByTestId("project-memory-content").fill("فقط برندهای دارای تأیید ناظر بررسی شوند.");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByText("قاعدهٔ برند بازبینی‌شده")).toBeVisible();

  const canonical = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  const superseded = canonical.records.find((record: any) => record.status === "superseded");
  const replacement = canonical.records.find((record: any) => record.supersedesId === superseded?.id);
  expect(superseded).toMatchObject({ supersededById: replacement?.id, conflictIds: [] });
  expect(replacement).toMatchObject({ status: "current", title: "قاعدهٔ برند بازبینی‌شده", supersedesId: superseded.id });
  await expect(page.getByText("قاعدهٔ برند بازبینی‌شده")).toBeVisible();
  await expect(page.getByTestId("project-memory-card")).toHaveCount(2);
  await page.getByTestId("project-memory-managed-toggle").click();
  await expect(page.getByTestId("project-memory-card")).toHaveCount(3);
  await page.getByTestId("project-memory-card").filter({ hasText: "قاعدهٔ برند بازبینی‌شده" }).click();
  await page.getByTestId("project-memory-delete").click();
  await page.getByTestId("project-memory-delete-confirm").click();
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null").tombstones.length)).toBe(1);
  const afterReplacementDelete = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(afterReplacementDelete.records.find((record: any) => record.id === superseded.id)).toMatchObject({ status: "superseded", supersededById: replacement.id });
  expect(afterReplacementDelete.tombstones).toEqual(expect.arrayContaining([expect.objectContaining({ id: replacement.id })]));
});

test("memory conflict replacement records resolution before addition and rejects a rehashed disputed lie", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  for (const draft of [
    { title: "گروه تعارض اول", content: "مقدار الف" },
    { title: "گروه تعارض اول", content: "مقدار ب" },
    { title: "گروه تعارض دوم", content: "مقدار ج" },
  ]) {
    await page.getByTestId("project-memory-add").click();
    await page.getByTestId("project-memory-title").fill(draft.title);
    await page.getByTestId("project-memory-content").fill(draft.content);
    await page.getByTestId("project-memory-save").click();
    await expect(page.getByTestId("project-memory-editor-sheet")).toBeHidden();
  }
  await page.getByTestId("project-memory-card").filter({ hasText: "مقدار الف" }).click();
  await page.getByTestId("project-memory-edit").click();
  await page.getByTestId("project-memory-title").fill("گروه تعارض دوم");
  await page.getByTestId("project-memory-content").fill("مقدار الفِ جابه‌جا‌شده");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-editor-sheet")).toBeHidden();
  await expect(page.getByTestId("project-memory-card").filter({ hasText: "مقدار الفِ جابه‌جا‌شده" })).toBeVisible();

  let canonical = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  const moved = canonical.records.find((record: any) => record.content === "مقدار الفِ جابه‌جا‌شده");
  const oldPeer = canonical.records.find((record: any) => record.content === "مقدار ب");
  const newPeer = canonical.records.find((record: any) => record.content === "مقدار ج");
  expect(moved.history.slice(-3).map((event: any) => event.type)).toEqual(["updated", "conflicts-resolved", "disputed"]);
  expect(moved).toMatchObject({ conflictIds: [newPeer.id], status: "disputed" });
  expect(oldPeer.conflictIds).toEqual([]);
  expect(newPeer.conflictIds).toEqual([moved.id]);
  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toHaveCount(0);

  await page.evaluate(async () => {
    const stable = (value: any): any => Array.isArray(value)
      ? value.map(stable)
      : value && typeof value === "object"
        ? Object.fromEntries(Object.entries(value).sort(([first], [second]) => first.localeCompare(second)).map(([key, item]) => [key, stable(item)]))
        : value;
    const key = "chida-prototype-memory-core:v2";
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    const record = envelope.records.find((item: any) => item.content === "مقدار الفِ جابه‌جا‌شده");
    const eventIndex = record.history.findLastIndex((event: any) => event.type === "conflicts-resolved");
    const event = record.history[eventIndex];
    const revision = record.revisions[eventIndex];
    event.type = "disputed";
    const recordIdentity = { id: record.id, ownerPrincipalId: record.ownerPrincipalId, accountSide: record.accountSide, scopeType: record.scopeType, scopeId: record.scopeId, projectId: record.projectId, provenanceClass: record.provenanceClass, sourceLabel: record.sourceLabel, sourceRefs: record.sourceRefs, createdAt: record.createdAt };
    const eventIntegrity = { id: event.id, type: event.type, actor: event.actor, at: event.at, version: event.version, rollbackFromVersion: event.rollbackFromVersion, lineage: event.lineage };
    const revisionIntegrity = { id: revision.id, version: revision.version, createdAt: revision.createdAt };
    const bytes = new TextEncoder().encode(JSON.stringify(stable({ recordIdentity, snapshot: revision.snapshot, event: eventIntegrity, revision: revisionIntegrity })));
    const digest = new Uint8Array(await window.crypto.subtle.digest("SHA-256", bytes));
    revision.fingerprint = `sha256-${Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
    window.localStorage.setItem(key, JSON.stringify(envelope));
  });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toBeVisible();
  await expect(page.getByTestId("project-memory-add")).toBeDisabled();
  canonical = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(canonical.records.find((record: any) => record.content === "مقدار الفِ جابه‌جا‌شده").history.some((event: any) => event.type === "conflicts-resolved")).toBe(false);
});

test("memory refuses writes when an exclusive browser lock is unavailable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => Object.defineProperty(window.navigator, "locks", { configurable: true, value: undefined }));
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await expect(page.getByTestId("project-memory-read-error")).toContainText("خوانده نشد");
  await expect(page.getByTestId("project-memory-add")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"))).toBeNull();
});

test("legacy memory migration also fails closed when Web Locks are unavailable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, "locks", { configurable: true, value: undefined });
    window.localStorage.setItem("chida-prototype-project-memories:v1", JSON.stringify([{ id: "legacy-no-lock", projectId: "legacy-project", title: "مهاجرت بدون قفل", content: "این بایت‌ها نباید بیرون قفل به canonical تبدیل شوند.", kind: "یادداشت سازنده", source: "ثبت مستقیم شما", visibility: "خصوصی پروژه", useInContext: true, status: "ثبت محلی", version: 1, createdAt: "2026-08-30T11:00:00.000Z", updatedAt: "2026-08-30T11:00:00.000Z" }]));
  });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await expect(page.getByTestId("project-memory-entry")).toContainText("بازیابی محلی کامل نشد");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"))).toBeNull();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).toContain("legacy-no-lock");
});

test("a stale memory editor cannot overwrite a newer browser-tab revision", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("حافظهٔ همزمان");
  await page.getByTestId("project-memory-content").fill("نسخهٔ پایه");
  await page.getByTestId("project-memory-save").click();
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-edit").click();

  const otherPage = await context.newPage();
  await otherPage.setViewportSize({ width: 390, height: 844 });
  await openSavedProjectMemory(otherPage);
  await otherPage.getByTestId("project-memory-card").click();
  await otherPage.getByTestId("project-memory-use-toggle").click();
  await expect.poll(() => otherPage.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null").records[0].version)).toBe(2);

  await page.getByTestId("project-memory-content").fill("ویرایش stale نباید ثبت شود");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-storage-error")).toContainText("نسخهٔ حافظه");
  const canonical = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(canonical.records[0]).toMatchObject({ version: 2, content: "نسخهٔ پایه", useInContextPreference: false });
  await otherPage.close();
});

test("memory storage events remove stale disabled superseded and hard-deleted data across tabs", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("حافظهٔ همگام دو تب");
  await page.getByTestId("project-memory-content").fill("این متن نباید پس از تغییر در تب دیگر قابل بازیابی بماند.");
  await page.getByTestId("project-memory-save").click();

  const otherPage = await context.newPage();
  try {
    await otherPage.setViewportSize({ width: 390, height: 844 });
    await openSavedProjectMemory(otherPage);
    await expect(otherPage.getByTestId("project-memory-card")).toContainText("حافظهٔ همگام دو تب");

    await page.getByTestId("project-memory-card").click();
    await page.getByTestId("project-memory-disable").click();
    await expect(otherPage.getByTestId("project-memory-card")).toContainText("غیرفعال");

    await page.getByTestId("project-memory-disable").click();
    await expect(otherPage.getByTestId("project-memory-card")).not.toContainText("غیرفعال");
    await page.getByTestId("project-memory-supersede").click();
    await page.getByTestId("project-memory-title").fill("حافظهٔ جایگزین دو تب");
    await page.getByTestId("project-memory-content").fill("نسخهٔ جایگزین باید تنها رکورد روزمرهٔ تب دوم باشد.");
    await page.getByTestId("project-memory-save").click();
    await expect(otherPage.getByTestId("project-memory-card")).toHaveCount(1);
    await expect(otherPage.getByTestId("project-memory-card")).toContainText("حافظهٔ جایگزین دو تب");
    await expect(otherPage.getByText("حافظهٔ همگام دو تب", { exact: true })).toHaveCount(0);

    await page.getByTestId("project-memory-card").filter({ hasText: "حافظهٔ جایگزین دو تب" }).click();
    await page.getByTestId("project-memory-delete").click();
    await page.getByTestId("project-memory-delete-confirm").click();
    await expect(otherPage.getByTestId("project-memory-empty")).toBeVisible();
    await expect(otherPage.getByTestId("project-memory-card")).toHaveCount(0);

    await otherPage.getByTestId("project-memory-back").click();
    await otherPage.getByTestId("project-space-back").click();
    await otherPage.getByTestId("capability-cluster").click();
    await otherPage.getByTestId("source-search-tool").click();
    await otherPage.getByTestId("project-source-search-input").fill("حافظهٔ جایگزین دو تب");
    await expect(otherPage.getByTestId("project-source-result-memory")).toHaveCount(0);
  } finally {
    await otherPage.close();
  }
});

test("memory core rejects cross-scope lineage and lifecycle tampering", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("رکورد آزمون گراف");
  await page.getByTestId("project-memory-content").fill("پیوند دامنهٔ دیگر باید fail-close شود.");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-card")).toContainText("رکورد آزمون گراف");

  await page.evaluate(() => {
    const key = "chida-prototype-memory-core:v2";
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    envelope.records[0].supersedesId = "foreign-account-tombstone";
    envelope.tombstones.push({ id: "foreign-account-tombstone", ownerPrincipalId: "local-builder-account", scopeType: "account_private", scopeId: "local-builder-account", lastVersion: 1, deletedAt: envelope.updatedAt, deletedBy: "شما", reasonClass: "user_requested", priorContentHash: "fnv1a-00000000", retentionClass: "local-metadata-only" });
    window.localStorage.setItem(key, JSON.stringify(envelope));
  });
  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toBeVisible();

  await page.evaluate(() => {
    const key = "chida-prototype-memory-core:v2";
    window.localStorage.removeItem(key);
    window.localStorage.removeItem("chida-prototype-project-memories:v1");
    window.localStorage.removeItem("chida-prototype-memory-core:v1:hard-delete-intent:v1");
    window.localStorage.removeItem("chida-prototype-memory-core:v2:hard-delete-intent:v2");
  });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("رکورد آزمون وضعیت");
  await page.getByTestId("project-memory-content").fill("تغییر وضعیت بدون رویداد باید رد شود.");
  await page.getByTestId("project-memory-save").click();
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-disable").click();
  await expect(page.getByTestId("project-memory-status-alert")).toContainText("غیرفعال");
  await page.evaluate(() => {
    const key = "chida-prototype-memory-core:v2";
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    envelope.records[0].status = "current";
    window.localStorage.setItem(key, JSON.stringify(envelope));
  });
  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toBeVisible();
});

test("memory audit rejects a rehashed revision whose event type lies about its snapshot delta", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("ممیزی تغییر حافظه");
  await page.getByTestId("project-memory-content").fill("نسخهٔ اول");
  await page.getByTestId("project-memory-save").click();
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-edit").click();
  await page.getByTestId("project-memory-content").fill("نسخهٔ دوم");
  await page.getByTestId("project-memory-save").click();

  await page.evaluate(async () => {
    const stable = (value: any): any => Array.isArray(value)
      ? value.map(stable)
      : value && typeof value === "object"
        ? Object.fromEntries(Object.entries(value).sort(([first], [second]) => first.localeCompare(second)).map(([key, item]) => [key, stable(item)]))
        : value;
    const key = "chida-prototype-memory-core:v2";
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    const record = envelope.records[0];
    const event = record.history.at(-1);
    const revision = record.revisions.at(-1);
    event.type = "disabled";
    record.status = "disabled";
    const recordIdentity = { id: record.id, ownerPrincipalId: record.ownerPrincipalId, accountSide: record.accountSide, scopeType: record.scopeType, scopeId: record.scopeId, projectId: record.projectId, provenanceClass: record.provenanceClass, sourceLabel: record.sourceLabel, sourceRefs: record.sourceRefs, createdAt: record.createdAt };
    const eventIntegrity = { id: event.id, type: event.type, actor: event.actor, at: event.at, version: event.version, rollbackFromVersion: event.rollbackFromVersion, lineage: event.lineage };
    const revisionIntegrity = { id: revision.id, version: revision.version, createdAt: revision.createdAt };
    const bytes = new TextEncoder().encode(JSON.stringify(stable({ recordIdentity, snapshot: revision.snapshot, event: eventIntegrity, revision: revisionIntegrity })));
    const digest = new Uint8Array(await window.crypto.subtle.digest("SHA-256", bytes));
    revision.fingerprint = `sha256-${Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
    window.localStorage.setItem(key, JSON.stringify(envelope));
  });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toBeVisible();
  await expect(page.getByTestId("project-memory-add")).toBeDisabled();
});

test("memory audit rejects rehashed non-canonical whitespace in immutable lineage ids", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  for (const [index, content] of ["مقدار lineage اول", "مقدار lineage دوم"].entries()) {
    await page.getByTestId("project-memory-add").click();
    await page.getByTestId("project-memory-title").fill("ممیزی شناسهٔ lineage");
    await page.getByTestId("project-memory-content").fill(content);
    await page.getByTestId("project-memory-save").click();
    await expect(page.getByTestId("project-memory-card")).toHaveCount(index + 1);
  }

  await page.evaluate(async () => {
    const stable = (value: any): any => Array.isArray(value)
      ? value.map(stable)
      : value && typeof value === "object"
        ? Object.fromEntries(Object.entries(value).sort(([first], [second]) => first.localeCompare(second)).map(([key, item]) => [key, stable(item)]))
        : value;
    const key = "chida-prototype-memory-core:v2";
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    const record = envelope.records[0];
    const eventIndex = record.history.findLastIndex((event: any) => event.type === "disputed");
    const event = record.history[eventIndex];
    const revision = record.revisions[eventIndex];
    event.lineage.conflictIds[0] = ` ${event.lineage.conflictIds[0]} `;
    const canonicalEvent = { ...event, lineage: { ...event.lineage, conflictIds: event.lineage.conflictIds.map((id: string) => id.trim()) } };
    const recordIdentity = { id: record.id, ownerPrincipalId: record.ownerPrincipalId, accountSide: record.accountSide, scopeType: record.scopeType, scopeId: record.scopeId, projectId: record.projectId, provenanceClass: record.provenanceClass, sourceLabel: record.sourceLabel, sourceRefs: record.sourceRefs, createdAt: record.createdAt };
    const eventIntegrity = { id: canonicalEvent.id, type: canonicalEvent.type, actor: canonicalEvent.actor, at: canonicalEvent.at, version: canonicalEvent.version, rollbackFromVersion: canonicalEvent.rollbackFromVersion, lineage: canonicalEvent.lineage };
    const revisionIntegrity = { id: revision.id, version: revision.version, createdAt: revision.createdAt };
    const bytes = new TextEncoder().encode(JSON.stringify(stable({ recordIdentity, snapshot: revision.snapshot, event: eventIntegrity, revision: revisionIntegrity })));
    const digest = new Uint8Array(await window.crypto.subtle.digest("SHA-256", bytes));
    revision.fingerprint = `sha256-${Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
    window.localStorage.setItem(key, JSON.stringify(envelope));
  });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toBeVisible();
  await expect(page.getByTestId("project-memory-add")).toBeDisabled();
});

test("memory audit rejects a resolved historical conflict that crossed private scopes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("رکورد پروژه برای ممیزی تاریخچه");
  await page.getByTestId("project-memory-content").fill("این رکورد در دامنهٔ پروژه است.");
  await page.getByTestId("project-memory-save").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-scope-account").click();
  await page.getByTestId("project-memory-title").fill("رکورد شخصی برای ممیزی تاریخچه");
  await page.getByTestId("project-memory-content").fill("این رکورد در دامنهٔ شخصی است.");
  await page.getByTestId("project-memory-save").click();
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null")?.records?.length)).toBe(2);

  await page.evaluate(async () => {
    const stable = (value: any): any => Array.isArray(value)
      ? value.map(stable)
      : value && typeof value === "object"
        ? Object.fromEntries(Object.entries(value).sort(([first], [second]) => first.localeCompare(second)).map(([key, item]) => [key, stable(item)]))
        : value;
    const key = "chida-prototype-memory-core:v2";
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    const timestamp = envelope.updatedAt;
    const snapshotOf = (record: any) => ({ title: record.title, content: record.content, kind: record.kind, memoryType: record.memoryType, visibility: record.visibility, manualSearchability: record.manualSearchability, automaticRetrievalEligibility: record.automaticRetrievalEligibility, modelEligibility: record.modelEligibility, shareability: record.shareability, useInContextPreference: record.useInContextPreference });
    const append = async (record: any, type: "disputed" | "conflicts-resolved", conflictIds: string[]) => {
      const version = record.version + 1;
      const event = { id: `historical-scope-event-${record.id}-${version}`, type, actor: "شما", at: timestamp, version, rollbackFromVersion: null, lineage: { supersedesId: record.supersedesId, supersededById: record.supersededById, conflictIds } };
      const revision = { id: `historical-scope-revision-${record.id}-${version}`, version, createdAt: timestamp, snapshot: snapshotOf(record), fingerprint: "" };
      const recordIdentity = { id: record.id, ownerPrincipalId: record.ownerPrincipalId, accountSide: record.accountSide, scopeType: record.scopeType, scopeId: record.scopeId, projectId: record.projectId, provenanceClass: record.provenanceClass, sourceLabel: record.sourceLabel, sourceRefs: record.sourceRefs, createdAt: record.createdAt };
      const eventIntegrity = { id: event.id, type: event.type, actor: event.actor, at: event.at, version: event.version, rollbackFromVersion: event.rollbackFromVersion, lineage: event.lineage };
      const revisionIntegrity = { id: revision.id, version: revision.version, createdAt: revision.createdAt };
      const bytes = new TextEncoder().encode(JSON.stringify(stable({ recordIdentity, snapshot: revision.snapshot, event: eventIntegrity, revision: revisionIntegrity })));
      const digest = new Uint8Array(await window.crypto.subtle.digest("SHA-256", bytes));
      revision.fingerprint = `sha256-${Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
      record.history.push(event);
      record.revisions.push(revision);
      record.version = version;
      record.currentRevisionId = revision.id;
      record.updatedAt = timestamp;
      record.status = "disputed";
      record.conflictIds = conflictIds;
    };
    const projectRecord = envelope.records.find((record: any) => record.scopeType === "project_private");
    const accountRecord = envelope.records.find((record: any) => record.scopeType === "account_private");
    await append(projectRecord, "disputed", [accountRecord.id]);
    await append(accountRecord, "disputed", [projectRecord.id]);
    await append(projectRecord, "conflicts-resolved", []);
    await append(accountRecord, "conflicts-resolved", []);
    envelope.envelopeVersion += 1;
    window.localStorage.setItem(key, JSON.stringify(envelope));
  });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toBeVisible();
  await expect(page.getByTestId("project-memory-add")).toBeDisabled();
});

test("memory audit rejects retargeting a superseded record to an unrelated tombstone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("نسخهٔ قدیمی پیوند tombstone");
  await page.getByTestId("project-memory-content").fill("این رکورد predecessor واقعی است.");
  await page.getByTestId("project-memory-save").click();
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-supersede").click();
  await page.getByTestId("project-memory-title").fill("نسخهٔ جایگزین واقعی");
  await page.getByTestId("project-memory-content").fill("این رکورد replacement واقعی است.");
  await page.getByTestId("project-memory-save").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("رکورد مستقل برای tombstone");
  await page.getByTestId("project-memory-content").fill("این حذف نباید مقصد lineage رکورد دیگری شود.");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-card").filter({ hasText: "رکورد مستقل برای tombstone" })).toBeVisible();
  const unrelatedId = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null").records.find((record: any) => record.title === "رکورد مستقل برای tombstone").id);
  await page.getByTestId("project-memory-card").filter({ hasText: "رکورد مستقل برای tombstone" }).click();
  await page.getByTestId("project-memory-delete").click();
  await page.getByTestId("project-memory-delete-confirm").click();
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null")?.tombstones?.length)).toBe(1);

  await page.evaluate(async (retargetId) => {
    const stable = (value: any): any => Array.isArray(value)
      ? value.map(stable)
      : value && typeof value === "object"
        ? Object.fromEntries(Object.entries(value).sort(([first], [second]) => first.localeCompare(second)).map(([key, item]) => [key, stable(item)]))
        : value;
    const key = "chida-prototype-memory-core:v2";
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    const record = envelope.records.find((item: any) => item.status === "superseded");
    const eventIndex = record.history.findLastIndex((event: any) => event.type === "superseded");
    const event = record.history[eventIndex];
    const revision = record.revisions[eventIndex];
    event.lineage.supersededById = retargetId;
    record.supersededById = retargetId;
    const recordIdentity = { id: record.id, ownerPrincipalId: record.ownerPrincipalId, accountSide: record.accountSide, scopeType: record.scopeType, scopeId: record.scopeId, projectId: record.projectId, provenanceClass: record.provenanceClass, sourceLabel: record.sourceLabel, sourceRefs: record.sourceRefs, createdAt: record.createdAt };
    const eventIntegrity = { id: event.id, type: event.type, actor: event.actor, at: event.at, version: event.version, rollbackFromVersion: event.rollbackFromVersion, lineage: event.lineage };
    const revisionIntegrity = { id: revision.id, version: revision.version, createdAt: revision.createdAt };
    const bytes = new TextEncoder().encode(JSON.stringify(stable({ recordIdentity, snapshot: revision.snapshot, event: eventIntegrity, revision: revisionIntegrity })));
    const digest = new Uint8Array(await window.crypto.subtle.digest("SHA-256", bytes));
    revision.fingerprint = `sha256-${Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
    window.localStorage.setItem(key, JSON.stringify(envelope));
  }, unrelatedId);

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toBeVisible();
  await expect(page.getByTestId("project-memory-add")).toBeDisabled();
});

test("memory audit rejects an impossible lifecycle inside a rehashed tombstone proof", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  for (const [index, content] of ["مقدار نخست برای تعارض واقعی.", "مقدار دوم برای تعارض واقعی."].entries()) {
    await page.getByTestId("project-memory-add").click();
    await page.getByTestId("project-memory-title").fill("اثبات چرخهٔ حذف");
    await page.getByTestId("project-memory-content").fill(content);
    await page.getByTestId("project-memory-save").click();
    await expect(page.getByTestId("project-memory-card")).toHaveCount(index + 1);
  }
  await page.getByTestId("project-memory-card").filter({ hasText: "مقدار نخست برای تعارض واقعی." }).click();
  await page.getByTestId("project-memory-use-toggle").click();
  await expect(page.getByTestId("project-memory-use-toggle")).toHaveAttribute("aria-pressed", "false");
  await page.getByTestId("project-memory-delete").click();
  await page.getByTestId("project-memory-delete-confirm").click();
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null")?.tombstones?.length)).toBe(1);

  await page.evaluate(async () => {
    const stable = (value: any): any => Array.isArray(value)
      ? value.map(stable)
      : value && typeof value === "object"
        ? Object.fromEntries(Object.entries(value).sort(([first], [second]) => first.localeCompare(second)).map(([key, item]) => [key, stable(item)]))
        : value;
    const key = "chida-prototype-memory-core:v2";
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    const tombstone = envelope.tombstones[0];
    tombstone.lineageHistory[2].type = "enabled";
    const bytes = new TextEncoder().encode(JSON.stringify(stable(tombstone.lineageHistory)));
    const digest = new Uint8Array(await window.crypto.subtle.digest("SHA-256", bytes));
    tombstone.lineageHistoryHash = `sha256-${Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
    window.localStorage.setItem(key, JSON.stringify(envelope));
  });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toBeVisible();
  await expect(page.getByTestId("project-memory-add")).toBeDisabled();
});

test("memory audit rejects a weak legacy content hash on a proof-bearing v2 tombstone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("هش حذف نسخهٔ دوم");
  await page.getByTestId("project-memory-content").fill("اثبات نسخهٔ دوم باید SHA-256 داشته باشد.");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-card")).toHaveCount(1);
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-delete").click();
  await page.getByTestId("project-memory-delete-confirm").click();
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null")?.tombstones?.length)).toBe(1);

  await page.evaluate(() => {
    const key = "chida-prototype-memory-core:v2";
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    envelope.tombstones[0].priorContentHash = "fnv1a-00000000";
    window.localStorage.setItem(key, JSON.stringify(envelope));
  });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toBeVisible();
  await expect(page.getByTestId("project-memory-add")).toBeDisabled();
});

test("memory envelope rejects nonempty v0 data and component timestamps newer than its update", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("رکورد آزمون chronology");
  await page.getByTestId("project-memory-content").fill("پاکت پایه نباید دادهٔ زنده داشته باشد.");
  await page.getByTestId("project-memory-save").click();
  const validRaw = await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"));
  if (!validRaw) throw new Error("Valid memory fixture was not stored");

  await page.evaluate(() => {
    const key = "chida-prototype-memory-core:v2";
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    envelope.envelopeVersion = 0;
    envelope.updatedAt = null;
    window.localStorage.setItem(key, JSON.stringify(envelope));
  });
  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toBeVisible();

  await page.evaluate((raw) => {
    const key = "chida-prototype-memory-core:v2";
    const envelope = JSON.parse(raw);
    envelope.updatedAt = "1970-01-01T00:00:00.000Z";
    window.localStorage.setItem(key, JSON.stringify(envelope));
  }, validRaw);
  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toBeVisible();
});

test("editing a disabled memory stays disabled and explicit enable recomputes conflicts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("قاعدهٔ ایمنی مشترک");
  await page.getByTestId("project-memory-content").fill("نسخهٔ غیرفعال الف");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-card")).toHaveCount(1);
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-disable").click();
  await expect(page.getByTestId("project-memory-disable")).toContainText("فعال‌کردن");
  await page.keyboard.press("Escape");

  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("قاعدهٔ ایمنی مشترک");
  await page.getByTestId("project-memory-content").fill("نسخهٔ فعال ب");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-card")).toHaveCount(2);
  await page.getByTestId("project-memory-card").filter({ hasText: "نسخهٔ غیرفعال الف" }).click();
  await page.getByTestId("project-memory-edit").click();
  await page.getByTestId("project-memory-content").fill("نسخهٔ غیرفعال ویرایش‌شده");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-card").filter({ hasText: "نسخهٔ غیرفعال ویرایش‌شده" })).toHaveCount(1);
  let canonical = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  const disabled = canonical.records.find((record: any) => record.content === "نسخهٔ غیرفعال ویرایش‌شده");
  expect(disabled).toMatchObject({ status: "disabled", conflictIds: [] });

  await page.getByTestId("project-memory-back").click();
  await page.getByTestId("capability-cluster").click();
  await page.getByTestId("source-search-tool").click();
  await page.getByTestId("project-source-search-input").fill("نسخهٔ غیرفعال ویرایش‌شده");
  await expect(page.getByTestId("project-source-result-memory")).toHaveCount(0);
  await page.getByTestId("project-source-search-back").click();
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-card").filter({ hasText: "نسخهٔ غیرفعال ویرایش‌شده" }).click();
  await page.getByTestId("project-memory-disable").click();
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null").records.find((record: any) => record.content === "نسخهٔ غیرفعال ویرایش‌شده")?.status)).toBe("disputed");
  canonical = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  const first = canonical.records.find((record: any) => record.content === "نسخهٔ غیرفعال ویرایش‌شده");
  const second = canonical.records.find((record: any) => record.content === "نسخهٔ فعال ب");
  expect(first).toMatchObject({ status: "disputed", conflictIds: [second.id] });
  expect(second).toMatchObject({ status: "disputed", conflictIds: [first.id] });
});

test("rolling back memory content recomputes conflicts instead of creating silent winners", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("عنوان قدیمی مشترک");
  await page.getByTestId("project-memory-content").fill("متن قدیمی الف");
  await page.getByTestId("project-memory-save").click();
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-edit").click();
  await page.getByTestId("project-memory-title").fill("عنوان موقت متفاوت");
  await page.getByTestId("project-memory-save").click();

  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("عنوان قدیمی مشترک");
  await page.getByTestId("project-memory-content").fill("متن فعال ب");
  await page.getByTestId("project-memory-save").click();
  await page.getByTestId("project-memory-card").filter({ hasText: "عنوان موقت متفاوت" }).click();
  await page.getByTestId("project-memory-history").locator("summary").click();
  await page.getByTestId("project-memory-history").locator("li").filter({ hasText: "نسخهٔ ۱" }).getByRole("button", { name: "بازگردانی به‌عنوان نسخهٔ تازه" }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null").records.find((record: any) => record.content === "متن قدیمی الف")?.status)).toBe("disputed");
  const canonical = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  const rolledBack = canonical.records.find((record: any) => record.content === "متن قدیمی الف");
  const conflicting = canonical.records.find((record: any) => record.content === "متن فعال ب");
  expect(rolledBack).toMatchObject({ status: "disputed", conflictIds: [conflicting.id] });
  expect(conflicting).toMatchObject({ status: "disputed", conflictIds: [rolledBack.id] });
  expect(rolledBack.history.slice(-2).map((event: any) => event.type)).toEqual(["rolled-back", "disputed"]);
});

test("manual project search respects scope lifecycle visibility and its own eligibility", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("quick-action-memory").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("نشانهٔ جست‌وجوی مجاز");
  await page.getByTestId("project-memory-content").fill("این متن ابتدا قابل جست‌وجوی دستی است.");
  await page.getByTestId("project-memory-save").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-scope-account").click();
  await page.getByTestId("project-memory-title").fill("نشانهٔ شخصی محرمانه");
  await page.getByTestId("project-memory-content").fill("این حافظهٔ شخصی نباید وارد جست‌وجوی پروژه شود.");
  await page.getByTestId("project-memory-save").click();
  await page.getByTestId("memory-scope-project").click();
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("memory-control-manual-searchability").getByRole("button").click();
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null").records.find((record: any) => record.title === "نشانهٔ جست‌وجوی مجاز").manualSearchability)).toBe(false);
  await page.keyboard.press("Escape");
  await page.getByTestId("project-memory-back").click();
  await page.getByTestId("capability-cluster").click();
  await page.getByTestId("source-search-tool").click();
  const searchInput = page.getByTestId("project-source-search-input");
  await searchInput.fill("نشانهٔ جست‌وجوی مجاز");
  await expect(page.getByTestId("project-source-result-memory")).toHaveCount(0);
  await searchInput.fill("نشانهٔ شخصی محرمانه");
  await expect(page.getByTestId("project-source-result-memory")).toHaveCount(0);
});

test("failed legacy migration preserves source bytes and does not create a canonical marker", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const legacy = JSON.stringify([{ id: "legacy-write-failure", projectId: "project-preserved", title: "بایت حفظ‌شده", content: "مهاجرت ناموفق نباید منبع را پاک کند.", kind: "یادداشت سازنده", source: "ثبت مستقیم شما", visibility: "خصوصی پروژه", useInContext: true, status: "ثبت محلی", version: 1, createdAt: "2026-08-30T11:00:00.000Z", updatedAt: "2026-08-30T11:00:00.000Z" }]);
    window.localStorage.setItem("chida-prototype-project-memories:v1", legacy);
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (key === "chida-prototype-memory-core:v2") throw new DOMException("Quota exceeded", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await expect(page.getByTestId("project-memory-entry")).toContainText("بازیابی محلی کامل نشد");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).toContain("legacy-write-failure");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"))).toBeNull();
});

test("an interrupted multi-store memory hard-delete resumes from its durable intent", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const projectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  if (!projectId) throw new Error("Active project id is unavailable");
  await page.evaluate((ownerProjectId) => {
    window.localStorage.setItem("chida-prototype-project-memories:v1", JSON.stringify([{ id: "legacy-delete-resume", projectId: ownerProjectId, title: "حذف نیمه‌تمام", content: "این متن باید پس از reload نیز از legacy پاک شود.", kind: "یادداشت سازنده", source: "ثبت مستقیم شما", visibility: "خصوصی پروژه", useInContext: true, status: "ثبت محلی", version: 1, createdAt: "2026-08-30T11:00:00.000Z", updatedAt: "2026-08-30T11:00:00.000Z" }]));
  }, projectId);
  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-card")).toContainText("حذف نیمه‌تمام");
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    let failLegacyPurgeOnce = true;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (key === "chida-prototype-project-memories:v1" && failLegacyPurgeOnce && !value.includes("legacy-delete-resume")) {
        failLegacyPurgeOnce = false;
        throw new DOMException("Interrupted legacy purge", "InvalidStateError");
      }
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-delete").click();
  await page.getByTestId("project-memory-delete-confirm").click();
  await expect(page.getByTestId("project-memory-storage-error")).toContainText("ذخیره نشد");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2:hard-delete-intent:v2"))).not.toBeNull();
  expect(JSON.parse(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v1:hard-delete-intent:v1")) ?? "null")).toMatchObject({ operation: "memory-core-v2-cutover", state: "cutover-committed" });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-empty")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2:hard-delete-intent:v2"))).toBeNull();
  const cutoverMarkerAfterResume = await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v1:hard-delete-intent:v1"));
  expect(JSON.parse(cutoverMarkerAfterResume ?? "null")).toMatchObject({ operation: "memory-core-v2-cutover", state: "cutover-committed" });
  expect(cutoverMarkerAfterResume).not.toContain("این متن باید پس از reload نیز از legacy پاک شود.");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).not.toContain("legacy-delete-resume");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).not.toContain("این متن باید پس از reload نیز از legacy پاک شود.");
});

test("a pre-cutover v2 delete intent crosses the old control key without losing the deletion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const projectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  if (!projectId) throw new Error("Active project id is unavailable");
  await page.evaluate((ownerProjectId) => {
    window.localStorage.setItem("chida-prototype-project-memories:v1", JSON.stringify([{ id: "legacy-bridge-delete", projectId: ownerProjectId, title: "حذف پل نسل", content: "این متن نباید با جابه‌جایی کلید intent زنده شود.", kind: "یادداشت سازنده", source: "ثبت مستقیم شما", visibility: "خصوصی پروژه", useInContext: true, status: "ثبت محلی", version: 1, createdAt: "2026-08-30T11:00:00.000Z", updatedAt: "2026-08-30T11:00:00.000Z" }]));
  }, projectId);
  await openSavedProjectMemory(page);
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    let failLegacyPurgeOnce = true;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (key === "chida-prototype-project-memories:v1" && failLegacyPurgeOnce && !value.includes("legacy-bridge-delete")) {
        failLegacyPurgeOnce = false;
        throw new DOMException("Bridge interruption", "InvalidStateError");
      }
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-delete").click();
  await page.getByTestId("project-memory-delete-confirm").click();
  await expect(page.getByTestId("project-memory-storage-error")).toBeVisible();

  await page.evaluate(() => {
    const currentIntentKey = "chida-prototype-memory-core:v2:hard-delete-intent:v2";
    const priorControlKey = "chida-prototype-memory-core:v1:hard-delete-intent:v1";
    const rawIntent = window.localStorage.getItem(currentIntentKey);
    if (!rawIntent) throw new Error("Current delete intent is unavailable");
    const intent = JSON.parse(rawIntent);
    window.localStorage.setItem("chida-prototype-memory-core:v2", intent.previousCanonicalRaw);
    if (intent.previousPriorCanonicalRaw === null) window.localStorage.removeItem("chida-prototype-memory-core:v1");
    else window.localStorage.setItem("chida-prototype-memory-core:v1", intent.previousPriorCanonicalRaw);
    if (intent.previousLegacyRaw === null) window.localStorage.removeItem("chida-prototype-project-memories:v1");
    else window.localStorage.setItem("chida-prototype-project-memories:v1", intent.previousLegacyRaw);
    window.localStorage.removeItem(currentIntentKey);
    window.localStorage.setItem(priorControlKey, rawIntent);
  });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-empty")).toBeVisible();
  const canonical = await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"));
  expect(JSON.parse(canonical ?? "null")).toMatchObject({ records: [], tombstones: [expect.objectContaining({ id: "legacy-bridge-delete" })] });
  expect(canonical).not.toContain("حذف پل نسل");
  expect(canonical).not.toContain("این متن نباید با جابه‌جایی کلید intent زنده شود.");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2:hard-delete-intent:v2"))).toBeNull();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2:prior-intent-bridge:v1"))).toBeNull();
  const committedMarker = await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v1:hard-delete-intent:v1"));
  expect(JSON.parse(committedMarker ?? "null")).toMatchObject({ operation: "memory-core-v2-cutover", state: "cutover-committed" });
  expect(committedMarker).not.toContain("حذف پل نسل");
});

test("a pending MemoryCandidate stays separate until exact user consent promotes it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const projectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  if (!projectId) throw new Error("Active project id is unavailable");
  const proposedSnapshot = { title: "پیشنهاد ثبت‌نشده", content: "این متن هنوز حافظه نیست.", kind: "یادداشت سازنده", memoryType: "note" };
  const evidenceRefs: string[] = [];
  const exactPayload = JSON.stringify(stableTestValue({ scopeType: "project_private", scopeId: projectId, proposedSnapshot, evidenceRefs }));
  const payloadHash = `sha256-${createHash("sha256").update(exactPayload).digest("hex")}`;
  await page.evaluate(({ ownerProjectId, snapshot, refs, hash }) => {
    const timestamp = "2026-08-30T12:00:00.000Z";
    window.localStorage.setItem("chida-prototype-memory-core:v2", JSON.stringify({
      schemaVersion: 2,
      fingerprintVersion: "memory-v2",
      envelopeVersion: 1,
      records: [],
      candidates: [{ schemaVersion: 1, id: "candidate-pending", version: 1, ownerPrincipalId: "local-builder-account", accountSide: "builder", scopeType: "project_private", scopeId: ownerProjectId, proposedSnapshot: snapshot, evidenceRefs: refs, producerRunId: "future-run-fixture", provider: "future-provider-fixture", model: "future-model-fixture", confidence: null, payloadHash: hash, status: "pending", createdAt: timestamp, expiresAt: null, updatedAt: timestamp, acceptedMemoryId: null, decision: null, history: [{ id: "candidate-event-created", type: "created", actor: "system", at: timestamp, version: 1 }] }],
      tombstones: [],
      migrationReports: [],
      updatedAt: timestamp,
    }));
  }, { ownerProjectId: projectId, snapshot: proposedSnapshot, refs: evidenceRefs, hash: payloadHash });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-candidate-notice")).toContainText("حافظه نیستند");
  await expect(page.getByTestId("project-memory-card")).toHaveCount(0);
  await expect(page.getByTestId("project-memory-candidate-card")).toContainText("پیشنهاد ثبت‌نشده");
  let canonical = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(canonical.records).toEqual([]);
  expect(canonical.candidates).toEqual([expect.objectContaining({ id: "candidate-pending", status: "pending", payloadHash })]);

  await page.getByTestId("project-memory-candidate-accept").click();
  await expect(page.getByTestId("project-memory-candidate-notice")).toHaveCount(0);
  await expect(page.getByTestId("project-memory-card")).toContainText("پیشنهاد ثبت‌نشده");
  canonical = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(canonical.records).toEqual([expect.objectContaining({ scopeType: "project_private", scopeId: projectId, title: "پیشنهاد ثبت‌نشده", provenanceClass: "owner_confirmed", sourceLabel: "تأیید پیشنهاد توسط شما", sourceRefs: [expect.stringContaining(`memory-candidate:candidate-pending:v1:${payloadHash}`)] })]);
  expect(canonical.candidates).toEqual([expect.objectContaining({ id: "candidate-pending", version: 2, status: "accepted", acceptedMemoryId: canonical.records[0].id, decision: expect.objectContaining({ action: "accepted", actor: "شما", candidateVersion: 1, payloadHash, exactPayload, scopeType: "project_private", scopeId: projectId }), history: [expect.objectContaining({ type: "created", version: 1 }), expect.objectContaining({ type: "accepted", version: 2 })] })]);

  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-edit").click();
  await page.getByTestId("project-memory-content").fill("این متن پس از تأیید، ویرایش نسخه‌دار شده است.");
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-card")).toContainText("ویرایش نسخه‌دار");
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-delete").click();
  await page.getByTestId("project-memory-delete-confirm").click();
  canonical = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(canonical.records).toEqual([]);
  expect(canonical.candidates).toEqual([]);
  expect(canonical.tombstones).toEqual([expect.objectContaining({ id: expect.any(String), priorContentHash: expect.stringMatching(/^sha256-[0-9a-f]{64}$/) })]);
  const canonicalBytes = await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"));
  expect(canonicalBytes).not.toContain("پیشنهاد ثبت‌نشده");
  expect(canonicalBytes).not.toContain("این متن هنوز حافظه نیست.");
  expect(canonicalBytes).not.toContain("ویرایش نسخه‌دار شده است");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2:hard-delete-intent:v2"))).toBeNull();
  const candidateCutoverMarker = await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v1:hard-delete-intent:v1"));
  expect(JSON.parse(candidateCutoverMarker ?? "null")).toMatchObject({ operation: "memory-core-v2-cutover", state: "cutover-committed" });
  expect(candidateCutoverMarker).not.toContain("پیشنهاد ثبت‌نشده");
});

test("an expired MemoryCandidate transitions once under lock without becoming memory", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const projectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  if (!projectId) throw new Error("Active project id is unavailable");
  const proposedSnapshot = { title: "پیشنهاد منقضی", content: "این متن نباید پس از انقضا حافظه شود.", kind: "یادداشت سازنده", memoryType: "note" };
  const evidenceRefs: string[] = [];
  const exactPayload = JSON.stringify(stableTestValue({ scopeType: "project_private", scopeId: projectId, proposedSnapshot, evidenceRefs }));
  const payloadHash = `sha256-${createHash("sha256").update(exactPayload).digest("hex")}`;
  await page.evaluate(({ ownerProjectId, snapshot, refs, hash }) => {
    const createdAt = "2026-08-30T10:00:00.000Z";
    window.localStorage.setItem("chida-prototype-memory-core:v2", JSON.stringify({
      schemaVersion: 2,
      fingerprintVersion: "memory-v2",
      envelopeVersion: 1,
      records: [],
      candidates: [{ schemaVersion: 1, id: "candidate-expiring", version: 1, ownerPrincipalId: "local-builder-account", accountSide: "builder", scopeType: "project_private", scopeId: ownerProjectId, proposedSnapshot: snapshot, evidenceRefs: refs, producerRunId: "expiry-run-fixture", provider: "future-provider-fixture", model: "future-model-fixture", confidence: null, payloadHash: hash, status: "pending", createdAt, expiresAt: "2026-08-30T11:00:00.000Z", updatedAt: createdAt, acceptedMemoryId: null, decision: null, history: [{ id: "candidate-expiry-created", type: "created", actor: "system", at: createdAt, version: 1 }] }],
      tombstones: [],
      migrationReports: [],
      updatedAt: createdAt,
    }));
  }, { ownerProjectId: projectId, snapshot: proposedSnapshot, refs: evidenceRefs, hash: payloadHash });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toHaveCount(0);
  await expect(page.getByTestId("project-memory-candidate-card")).toHaveCount(0);
  await expect(page.getByTestId("project-memory-card")).toHaveCount(0);
  const expired = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(expired.envelopeVersion).toBe(2);
  expect(expired.records).toEqual([]);
  expect(expired.candidates).toEqual([expect.objectContaining({ id: "candidate-expiring", version: 2, status: "expired", decision: null, acceptedMemoryId: null, history: [expect.objectContaining({ type: "created", version: 1 }), expect.objectContaining({ type: "expired", actor: "system", version: 2 })] })]);

  await openSavedProjectMemory(page);
  const afterReload = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(afterReload.envelopeVersion).toBe(2);
  expect(afterReload.candidates[0].history).toHaveLength(2);
});

test("a pending MemoryCandidate whose history crossed its expiry fails closed", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const projectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  if (!projectId) throw new Error("Active project id is unavailable");
  const proposedSnapshot = { title: "پیشنهاد زمانی ناسازگار", content: "این پیشنهاد نباید در حالت در انتظار قابل‌استفاده بماند.", kind: "یادداشت سازنده", memoryType: "note" };
  const evidenceRefs: string[] = [];
  const exactPayload = JSON.stringify(stableTestValue({ scopeType: "project_private", scopeId: projectId, proposedSnapshot, evidenceRefs }));
  const payloadHash = `sha256-${createHash("sha256").update(exactPayload).digest("hex")}`;
  const canonical = await page.evaluate(({ ownerProjectId, snapshot, refs, hash }) => {
    const createdAt = "2099-01-01T00:00:00.000Z";
    const expiresAt = "2099-02-01T00:00:00.000Z";
    const updatedAt = "2099-02-02T00:00:00.000Z";
    const raw = JSON.stringify({
      schemaVersion: 2,
      fingerprintVersion: "memory-v2",
      envelopeVersion: 2,
      records: [],
      candidates: [{ schemaVersion: 1, id: "candidate-pending-past-expiry", version: 2, ownerPrincipalId: "local-builder-account", accountSide: "builder", scopeType: "project_private", scopeId: ownerProjectId, proposedSnapshot: snapshot, evidenceRefs: refs, producerRunId: "expiry-chronology-run", provider: "future-provider-fixture", model: "future-model-fixture", confidence: null, payloadHash: hash, status: "pending", createdAt, expiresAt, updatedAt, acceptedMemoryId: null, decision: null, history: [{ id: "candidate-pending-past-expiry-created", type: "created", actor: "system", at: createdAt, version: 1 }, { id: "candidate-pending-past-expiry-updated", type: "updated", actor: "system", at: updatedAt, version: 2 }] }],
      tombstones: [],
      migrationReports: [],
      updatedAt,
    });
    window.localStorage.setItem("chida-prototype-memory-core:v2", raw);
    return raw;
  }, { ownerProjectId: projectId, snapshot: proposedSnapshot, refs: evidenceRefs, hash: payloadHash });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toBeVisible();
  await expect(page.getByTestId("project-memory-add")).toBeDisabled();
  await expect(page.getByTestId("project-memory-candidate-card")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"))).toBe(canonical);
});

test("a malformed v2 Candidate decision fails closed without falling back to valid legacy bytes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const projectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  if (!projectId) throw new Error("Active project id is unavailable");
  const proposedSnapshot = { title: "تصمیم خراب", content: "این payload نباید canonical شود.", kind: "یادداشت سازنده", memoryType: "note" };
  const exactPayload = JSON.stringify(stableTestValue({ scopeType: "project_private", scopeId: projectId, proposedSnapshot, evidenceRefs: [] }));
  const payloadHash = `sha256-${createHash("sha256").update(exactPayload).digest("hex")}`;
  const seeded = await page.evaluate(({ ownerProjectId, snapshot, hash }) => {
    const timestamp = "2026-08-30T12:00:00.000Z";
    const canonical = JSON.stringify({ schemaVersion: 2, fingerprintVersion: "memory-v2", envelopeVersion: 1, records: [], candidates: [{ schemaVersion: 1, id: "candidate-malformed", version: 1, ownerPrincipalId: "local-builder-account", accountSide: "builder", scopeType: "project_private", scopeId: ownerProjectId, proposedSnapshot: snapshot, evidenceRefs: [], producerRunId: "malformed-run", provider: "future-provider", model: "future-model", confidence: null, payloadHash: hash, status: "pending", createdAt: timestamp, expiresAt: null, updatedAt: timestamp, acceptedMemoryId: null, decision: { action: "accepted" }, history: [{ id: "candidate-malformed-created", type: "created", actor: "system", at: timestamp, version: 1 }] }], tombstones: [], migrationReports: [], updatedAt: timestamp });
    const legacy = JSON.stringify([{ id: "legacy-must-not-fallback", projectId: ownerProjectId, title: "legacy معتبر اما پایین‌دست", content: "وجود v2 خراب نباید این رکورد را زنده کند.", kind: "یادداشت سازنده", source: "ثبت مستقیم شما", visibility: "خصوصی پروژه", useInContext: true, status: "ثبت محلی", version: 1, createdAt: timestamp, updatedAt: timestamp }]);
    window.localStorage.setItem("chida-prototype-memory-core:v2", canonical);
    window.localStorage.setItem("chida-prototype-project-memories:v1", legacy);
    return { canonical, legacy };
  }, { ownerProjectId: projectId, snapshot: proposedSnapshot, hash: payloadHash });

  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toBeVisible();
  await expect(page.getByTestId("project-memory-add")).toBeDisabled();
  await expect(page.getByTestId("project-memory-card")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"))).toBe(seeded.canonical);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).toBe(seeded.legacy);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v1:hard-delete-intent:v1"))).toBeNull();
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
  await expect(page.getByTestId("project-memory-card")).toContainText("تصمیم پروژهٔ اول");
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"))).not.toBeNull();

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

  const storedMemories = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(storedMemories.records).toEqual([expect.objectContaining({ projectId: firstProjectId, title: "تصمیم پروژهٔ اول" })]);
});

test("project memory reports storage failure instead of showing false success", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-memory-entry").click();
  await page.getByTestId("project-memory-add").click();
  await page.getByTestId("project-memory-title").fill("یادداشت ذخیره‌نشده");
  await page.getByTestId("project-memory-content").fill("این متن نباید فقط در state موفق دیده شود.");
  const storageBefore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"));
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (key === "chida-prototype-memory-core:v2") throw new DOMException("Quota exceeded", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });

  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-editor-sheet")).toBeVisible();
  await expect(page.getByTestId("project-memory-storage-error")).toContainText("ذخیره نشد");
  await expect(page.getByTestId("project-memory-card")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"))).toBe(storageBefore);
});

test("memory migration quarantines malformed and duplicate records without silent drop", async ({ page }) => {
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

  const legacyBytes = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"));
  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toContainText("حذف نشده");
  await expect(page.getByTestId("project-memory-card")).toHaveCount(0);
  await expect(page.getByTestId("project-memory-add")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-memories:v1"))).toBe(legacyBytes);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"))).toBeNull();
  expect(JSON.parse(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2:migration-journal:v1")) ?? "null")).toMatchObject({ schemaVersion: 1, reports: [expect.objectContaining({ status: "blocked" })] });

  await page.evaluate(() => {
    const legacy = JSON.parse(window.localStorage.getItem("chida-prototype-project-memories:v1") ?? "[]");
    window.localStorage.setItem("chida-prototype-project-memories:v1", JSON.stringify([legacy[0]]));
  });
  await openSavedProjectMemory(page);
  await expect(page.getByTestId("project-memory-read-error")).toHaveCount(0);
  await expect(page.getByTestId("project-memory-card")).toContainText("رکورد معتبر");
  const recoveredMigration = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-memory-core:v2") ?? "null"));
  expect(recoveredMigration.records).toEqual([expect.objectContaining({ id: "memory-valid" })]);
  expect(recoveredMigration.migrationReports).toEqual([
    expect.objectContaining({ status: "blocked", migratedCount: 0 }),
    expect.objectContaining({ status: "migrated", migratedCount: 1, quarantined: [] }),
  ]);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2:migration-journal:v1"))).toBeNull();
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
  await expect(page.getByTestId("project-memory-editor-sheet")).toBeHidden();
  await expect(page.getByTestId("project-memory-card")).toContainText("حافظهٔ پایدار");
  const persistedMemory = await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"));

  await page.getByTestId("project-memory-card").click();
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (key === "chida-prototype-memory-core:v2") throw new DOMException("Quota exceeded", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("project-memory-use-toggle").click();
  await expect(page.getByTestId("project-memory-storage-error")).toContainText("ذخیره نشد");
  await expect(page.getByTestId("project-memory-use-toggle")).toContainText("روشن");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"))).toBe(persistedMemory);

  await openSavedProjectMemory(page);
  await page.getByTestId("project-memory-card").click();
  await page.getByTestId("project-memory-edit").click();
  await page.getByTestId("project-memory-content").fill("این ویرایش نباید ثبت شود.");
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (key === "chida-prototype-memory-core:v2") throw new DOMException("Quota exceeded", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("project-memory-save").click();
  await expect(page.getByTestId("project-memory-editor-sheet")).toBeVisible();
  await expect(page.getByTestId("project-memory-storage-error")).toContainText("ذخیره نشد");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"))).toBe(persistedMemory);

  await openSavedProjectMemory(page);
  await page.getByTestId("project-memory-card").click();
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (key === "chida-prototype-memory-core:v2") throw new DOMException("Storage unavailable", "InvalidStateError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByTestId("project-memory-delete").click();
  await page.getByTestId("project-memory-delete-confirm").click();
  await expect(page.getByTestId("project-memory-detail-sheet")).toBeVisible();
  await expect(page.getByTestId("project-memory-storage-error")).toContainText("ذخیره نشد");
  await expect(page.getByTestId("project-memory-delete-confirmation")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-memory-core:v2"))).toBe(persistedMemory);
});

test("builder searches only local project memory and file metadata without technical card clutter", async ({ page }) => {
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
      { ...fileBase, id: "file-search-a", displayName: "نقشه سازه طبقه همکف", originalName: "structure-ground-floor.pdf", category: "نقشه" },
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
  await expect(memoryResult).not.toContainText("ثبت مستقیم شما");
  await expect(memoryResult).not.toContainText("خصوصی در برج نیلوفر");
  await expect(memoryResult).not.toContainText("نسخهٔ ۱");
  await expect(memoryResult).not.toContainText("برای زمینه غیرفعال");
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
  await expect(fileResult).not.toContainText("انتخاب مستقیم از دستگاه");
  await expect(fileResult).not.toContainText("خصوصی در برج نیلوفر");
  await expect(fileResult).not.toContainText("محتوای فایل جست‌وجو نشده");
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

  await searchInput.fill("ثبت مستقیم شما");
  await expect(page.getByTestId("project-source-result")).toHaveCount(0);

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
  await expect(page.getByTestId("project-switcher")).toHaveText("برج نیلوفر");
  await expect(page.getByTestId("project-switcher").locator("svg")).toHaveCount(0);
  await expect(page.getByTestId("open-project-space")).toHaveText("برج نیلوفر");
  await expect(page.getByTestId("open-project-space").locator("svg")).toHaveCount(0);
  await expect(page.getByTestId("open-project-space")).toHaveCSS("border-top-style", "solid");
  const assistantMark = page.getByTestId("chida-assistant-mark");
  await expect(assistantMark).toBeVisible();
  await expect.poll(() => assistantMark.evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true);
  expect(Number.parseFloat(await page.getByTestId("project-switcher").locator("strong").evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(14);
  expect(Number.parseFloat(await page.locator(".quick-chip").first().evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(12);
  expect(Number.parseFloat(await page.locator(".empty-chat p").evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(14);

  await page.getByTestId("attach-button").click();
  const composerFileAttachment = page.getByTestId("composer-file-attachment");
  await expect(composerFileAttachment).toBeEnabled();
  await expect(composerFileAttachment).toContainText("فایل پیوست");
  await expect(composerFileAttachment).toContainText("PDF، صفحه‌گسترده یا سند متنی");
  await expect(page.getByTestId("composer-attach-sheet")).toContainText("OCR، مدل یا ارسال بیرونی فعال نیست");
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

test("Source/Composer enables real document intake on the current project draft", async ({ page }) => {
  await enterBuilderHome(page);

  await page.getByTestId("composer-input").fill("این فایل را کنار پیام همان پروژه نگه دار");
  await page.getByTestId("attach-button").click();
  await expect(page.getByTestId("composer-file-attachment")).toBeEnabled();
});

test("Source/Composer commits exact text and document sources and reopens them after reload", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const text = "  این متن دقیق همراه فایل ثبت شود.  ";
  const documentBytes = Buffer.from("%PDF exact composer source bytes");
  const documentHash = createHash("sha256").update(documentBytes).digest("hex");
  const textHash = createHash("sha256").update(text, "utf8").digest("hex");
  await enterBuilderHome(page);

  await page.getByTestId("composer-input").fill(text);
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({
    name: " صورت وضعیت Composer.pdf",
    mimeType: "application/pdf",
    buffer: documentBytes,
  });
  await expect(page.getByTestId("composer-attach-sheet")).toBeHidden();
  await expect(page.getByTestId("composer-input")).toHaveValue(text);
  await expect(page.getByTestId("composer-attachment")).toContainText("صورت وضعیت Composer.pdf");
  await expect(page.getByTestId("send-button")).toBeEnabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-sources:v1"))).toBeNull();

  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("composer-intake-message")).toContainText("این متن دقیق همراه فایل ثبت شود.");
  await expect(page.getByTestId("composer-source-open")).toHaveCount(2);
  await expect(page.getByTestId("composer-attachment")).toHaveCount(0);
  await expect(page.getByTestId("composer-input")).toHaveValue("");

  const stored = await page.evaluate(() => ({
    sourcesRaw: window.localStorage.getItem("chida-prototype-project-sources:v1"),
    filesRaw: window.localStorage.getItem("chida-prototype-project-files:v1"),
    intentRaw: window.localStorage.getItem("chida-prototype-project-sources:v1:intake-intent:v1"),
  }));
  expect(stored.intentRaw).toBeNull();
  expect(stored.sourcesRaw).not.toContain("%PDF exact composer source bytes");
  expect(stored.filesRaw).not.toContain("%PDF exact composer source bytes");
  const sourceEnvelope = JSON.parse(stored.sourcesRaw ?? "null");
  expect(sourceEnvelope).toMatchObject({ schemaVersion: 1, envelopeVersion: 1 });
  expect(sourceEnvelope.intakes).toHaveLength(1);
  expect(sourceEnvelope.records).toHaveLength(2);
  expect(sourceEnvelope.records[0]).toMatchObject({
    sourceType: "composer-text",
    projectId: expect.any(String),
    scopeType: "project_private",
    scopeId: expect.any(String),
    ownerPrincipalId: "local-builder-account",
    accountSide: "builder",
    textContent: text,
    contentHash: `sha256-${textHash}`,
    version: 1,
    provenance: "direct_user_composer",
    readStatus: "available",
    manualSearchability: false,
    automaticRetrievalEligibility: false,
    modelEligibility: false,
    shareability: false,
    useInContextPreference: false,
  });
  expect(sourceEnvelope.records[1]).toMatchObject({
    sourceType: "composer-file",
    projectId: sourceEnvelope.records[0].projectId,
    scopeId: sourceEnvelope.records[0].projectId,
    contentHash: `sha256-${documentHash}`,
    assetRef: { kind: "project-file", fileVersion: 1 },
    modelEligibility: false,
  });
  const fileId = sourceEnvelope.records[1].assetRef.fileId;
  const storedFile = JSON.parse(stored.filesRaw ?? "[]")[0];
  expect(storedFile).toMatchObject({ id: fileId, projectId: sourceEnvelope.records[0].projectId, originalName: " صورت وضعیت Composer.pdf", mimeType: "application/pdf", storageMode: "browser-file", version: 1 });

  const indexedDocument = await page.evaluate(async ({ fileId }) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open("chida-prototype-project-file-content:v1", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const storedAsset = await new Promise<any>((resolve, reject) => {
      const request = database.transaction("files", "readonly").objectStore("files").get(fileId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const digest = await crypto.subtle.digest("SHA-256", await storedAsset.blob.arrayBuffer());
    database.close();
    return { mimeType: storedAsset.blob.type, hash: Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("") };
  }, { fileId });
  expect(indexedDocument).toEqual({ mimeType: "application/pdf", hash: documentHash });

  const fileSourceTrigger = page.getByTestId("composer-source-open").nth(1);
  await fileSourceTrigger.click();
  await expect(page.getByTestId("composer-source-detail")).toContainText("نسخهٔ ۱ · ثبت مستقیم شما");
  await expect(page.getByTestId("composer-source-detail")).toContainText("مدل، بازیابی و اشتراک خاموش");
  await expect(page.getByTestId("composer-source-open-asset")).toHaveAttribute("href", /^blob:/);
  expect(await page.getByTestId("composer-source-close").evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  await page.keyboard.press("Escape");
  await expect(fileSourceTrigger).toBeFocused();
  await page.getByTestId("menu-button").click();
  await expect(page.getByTestId("recent-chat-boundary")).toContainText("۱ ورودی محلی");
  await expect(page.getByTestId("recent-chat-boundary")).toContainText("فهرست گفت‌وگوهای جدا هنوز ساخته نشده");
  await page.keyboard.press("Escape");

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("composer-intake-message")).toContainText("این متن دقیق همراه فایل ثبت شود.");
  await expect(page.getByTestId("composer-source-open")).toHaveCount(2);
  await page.getByTestId("composer-source-open").nth(1).click();
  await expect(page.getByTestId("composer-source-open-asset")).toHaveAttribute("href", /^blob:/);
});

test("Source/Composer sends an attachment-only photo with preview and a reopenable original", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);

  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-image-input").setInputFiles(sampleProjectImage);
  await expect(page.getByTestId("composer-attachment")).toHaveAttribute("data-kind", "photo");
  await expect(page.getByTestId("composer-attachment").locator("img")).toBeVisible();
  await expect(page.getByTestId("send-button")).toBeEnabled();
  await page.getByTestId("send-button").click();

  await expect(page.getByTestId("composer-intake-message")).toContainText("نمای جنوبی کارگاه.png");
  const envelope = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-sources:v1") ?? "null"));
  expect(envelope.records).toHaveLength(1);
  expect(envelope.records[0]).toMatchObject({ sourceType: "composer-photo", assetRef: { kind: "project-photo", fileVersion: 1 }, textContent: null, readStatus: "available" });
  await page.getByTestId("composer-source-open").click();
  await expect(page.getByTestId("composer-source-image")).toBeVisible();
  await expect(page.getByTestId("composer-source-open-asset")).toHaveAttribute("href", /^blob:/);
});

test("Source/Composer never creates a late object URL after source detail closes", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({ name: "delayed-detail.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF delayed detail") });
  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("composer-source-open")).toHaveCount(1);
  await page.evaluate(() => {
    const nativeDigest = window.crypto.subtle.digest.bind(window.crypto.subtle);
    let releaseDigest!: () => void;
    const digestGate = new Promise<void>((resolve) => { releaseDigest = resolve; });
    (window as any).__sourceUrlEvents = { created: [] as string[], revoked: [] as string[], digestFinished: false };
    (window as any).__releaseSourceDigest = releaseDigest;
    Object.defineProperty(window.crypto.subtle, "digest", {
      configurable: true,
      value: async (...args: Parameters<SubtleCrypto["digest"]>) => {
        await digestGate;
        const result = await (nativeDigest as any)(...args);
        (window as any).__sourceUrlEvents.digestFinished = true;
        return result;
      },
    });
    URL.createObjectURL = (blob: Blob) => {
      const url = `blob:late-source-${blob.size}`;
      (window as any).__sourceUrlEvents.created.push(url);
      return url;
    };
    URL.revokeObjectURL = (url: string) => { (window as any).__sourceUrlEvents.revoked.push(url); };
  });

  await page.getByTestId("composer-source-open").click();
  await expect(page.getByTestId("composer-source-detail")).toBeVisible();
  await page.getByTestId("composer-source-close").click();
  await expect(page.getByTestId("composer-source-detail")).toHaveCount(0);
  await page.evaluate(() => (window as any).__releaseSourceDigest());
  await expect.poll(() => page.evaluate(() => (window as any).__sourceUrlEvents.digestFinished)).toBe(true);
  expect(await page.evaluate(() => (window as any).__sourceUrlEvents)).toEqual({ created: [], revoked: [], digestFinished: true });
});

test("Source/Composer rejects mismatched MIME without mutating the draft or stores", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("پیش‌نویس باید باقی بماند");
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({ name: "فایل جعلی.pdf", mimeType: "text/html", buffer: Buffer.from("<script>bad</script>") });

  await expect(page.getByTestId("composer-source-error")).toContainText("هم‌خوان نیستند");
  await expect(page.getByTestId("composer-input")).toHaveValue("پیش‌نویس باید باقی بماند");
  await expect(page.getByTestId("composer-attachment")).toHaveCount(0);
  expect(await page.evaluate(() => ({ files: window.localStorage.getItem("chida-prototype-project-files:v1"), sources: window.localStorage.getItem("chida-prototype-project-sources:v1") }))).toEqual({ files: null, sources: null });
});

test("Source/Composer rolls back Blob metadata source and message when IndexedDB persistence fails", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("این تلاش باید قابل تکرار بماند");
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({ name: "rollback.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF rollback") });
  await page.evaluate(() => {
    const nativePut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function put(value: unknown, key?: IDBValidKey) {
      if (this.transaction.db.name === "chida-prototype-project-file-content:v1") throw new DOMException("Synthetic write failure", "QuotaExceededError");
      return nativePut.call(this, value, key);
    };
  });

  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("composer-source-error")).toContainText("ذخیره نشدند");
  await expect(page.getByTestId("composer-input")).toHaveValue("این تلاش باید قابل تکرار بماند");
  await expect(page.getByTestId("composer-attachment")).toContainText("rollback.pdf");
  await expect(page.getByTestId("composer-intake-message")).toHaveCount(0);
  expect(await page.evaluate(() => ({
    files: window.localStorage.getItem("chida-prototype-project-files:v1"),
    sources: window.localStorage.getItem("chida-prototype-project-sources:v1"),
    intent: window.localStorage.getItem("chida-prototype-project-sources:v1:intake-intent:v1"),
  }))).toEqual({ files: null, sources: null, intent: null });
});

test("Source/Composer compensates the stored asset when SourceRecord persistence fails", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("شکست Source نباید asset یتیم بسازد");
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({ name: "compensate.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF compensate") });
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-sources:v1") throw new DOMException("Synthetic source failure", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
  });

  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("composer-source-error")).toContainText("ذخیره نشدند");
  await expect(page.getByTestId("composer-intake-message")).toHaveCount(0);
  expect(await page.evaluate(() => ({
    files: window.localStorage.getItem("chida-prototype-project-files:v1"),
    sources: window.localStorage.getItem("chida-prototype-project-sources:v1"),
    intent: window.localStorage.getItem("chida-prototype-project-sources:v1:intake-intent:v1"),
  }))).toEqual({ files: null, sources: null, intent: null });
  const storedCount = await page.evaluate(() => new Promise<number>((resolve, reject) => {
    const request = window.indexedDB.open("chida-prototype-project-file-content:v1", 1);
    request.onsuccess = () => {
      const database = request.result;
      const count = database.transaction("files", "readonly").objectStore("files").count();
      count.onsuccess = () => { resolve(count.result); database.close(); };
      count.onerror = () => reject(count.error);
    };
    request.onerror = () => reject(request.error);
  }));
  expect(storedCount).toBe(0);
});

test("Source/Composer fail-closes an unreadable source store without overwriting its bytes", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.setItem("chida-prototype-project-sources:v1", "{منبع ناخوانا"));
  await enterBuilderHome(page);

  await expect(page.getByTestId("composer-source-read-error")).toContainText("ارسال");
  await expect(page.getByTestId("attach-button")).toBeDisabled();
  await page.getByTestId("composer-input").fill("این متن نباید دادهٔ قبلی را بازنویسی کند");
  await expect(page.getByTestId("send-button")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-sources:v1"))).toBe("{منبع ناخوانا");
});

test("Source/Composer blocks text-only intake when the file metadata store is unreadable", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.setItem("chida-prototype-project-files:v1", "{فایل ناخوانا"));
  await enterBuilderHome(page);

  await expect(page.getByTestId("composer-source-read-error")).toContainText("شناسنامهٔ فایل‌ها");
  await page.getByTestId("composer-input").fill("متن تنها هم نباید store دیگر را دور بزند");
  await expect(page.getByTestId("send-button")).toBeDisabled();
  expect(await page.evaluate(() => ({
    files: window.localStorage.getItem("chida-prototype-project-files:v1"),
    sources: window.localStorage.getItem("chida-prototype-project-sources:v1"),
  }))).toEqual({ files: "{فایل ناخوانا", sources: null });
});

test("Source/Composer rejects a re-fingerprinted text source whose SHA-256 no longer matches", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("متن اصلی با hash دقیق");
  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("composer-source-open")).toHaveCount(1);
  const tamperedRaw = await page.evaluate(() => {
    const key = "chida-prototype-project-sources:v1";
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    const source = envelope.records[0];
    source.textContent = "متن دست‌کاری‌شده با hash قدیمی";
    const stable = (value: any): any => Array.isArray(value)
      ? value.map(stable)
      : value && typeof value === "object"
        ? Object.fromEntries(Object.entries(value).sort(([first], [second]) => first.localeCompare(second)).map(([entryKey, item]) => [entryKey, stable(item)]))
        : value;
    const payload = { ...source };
    delete payload.fingerprint;
    const serialized = JSON.stringify(stable(payload));
    let hash = 2166136261;
    for (let index = 0; index < serialized.length; index += 1) {
      hash ^= serialized.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    source.fingerprint = `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
    const raw = JSON.stringify(envelope);
    window.localStorage.setItem(key, raw);
    return raw;
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("composer-source-read-error")).toBeVisible();
  await expect(page.getByTestId("send-button")).toBeDisabled();
  await expect(page.getByTestId("composer-intake-message")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-sources:v1"))).toBe(tamperedRaw);
});

test("Source/Composer keeps draft attachments and committed sources inside their project", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("پیش‌نویس و پیوست پروژهٔ اول");
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({ name: "فایل پروژه اول.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF project A") });

  await page.getByTestId("project-switcher").click();
  await page.getByTestId("projects-sheet-add").click();
  await page.getByTestId("new-project-name-input").fill("پروژه دوم");
  await page.getByTestId("new-project-location-input").fill("منطقهٔ ۲");
  await chooseProjectOption(page, "new-project-stage-select", "فونداسیون");
  await page.getByTestId("new-project-save").click();
  await expect(page.getByTestId("composer-input")).toHaveValue("");
  await expect(page.getByTestId("composer-attachment")).toHaveCount(0);
  await page.getByTestId("composer-input").fill("پیام فقط برای پروژه دوم");
  await page.getByTestId("send-button").click();

  await page.getByTestId("project-switcher").click();
  await page.getByTestId("projects-sheet").getByRole("button", { name: /برج نیلوفر/ }).click();
  await page.getByTestId("project-space-continue").click();
  await expect(page.getByTestId("composer-input")).toHaveValue("پیش‌نویس و پیوست پروژهٔ اول");
  await expect(page.getByTestId("composer-attachment")).toContainText("فایل پروژه اول.pdf");
  await expect(page.getByText("پیام فقط برای پروژه دوم", { exact: true })).toHaveCount(0);
  await page.getByTestId("send-button").click();
  await expect(page.getByText("پیش‌نویس و پیوست پروژهٔ اول", { exact: true })).toBeVisible();
  await expect(page.getByTestId("composer-attachment")).toHaveCount(0);

  const scoped = await page.evaluate(() => ({
    projects: JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]"),
    envelope: JSON.parse(window.localStorage.getItem("chida-prototype-project-sources:v1") ?? "null"),
    files: JSON.parse(window.localStorage.getItem("chida-prototype-project-files:v1") ?? "[]"),
  }));
  expect(scoped.envelope.intakes).toHaveLength(2);
  expect(scoped.envelope.intakes[0].projectId).toBe(scoped.projects[1].id);
  expect(scoped.envelope.intakes[1].projectId).toBe(scoped.projects[0].id);
  expect(scoped.envelope.records.filter((source: any) => source.projectId === scoped.projects[0].id)).toHaveLength(2);
  expect(scoped.files).toEqual([expect.objectContaining({ projectId: scoped.projects[0].id, originalName: "فایل پروژه اول.pdf" })]);

  await page.getByTestId("project-switcher").click();
  await page.getByTestId("projects-sheet").getByRole("button", { name: /پروژه دوم/ }).click();
  await page.getByTestId("project-space-continue").click();
  await expect(page.getByText("پیام فقط برای پروژه دوم", { exact: true })).toBeVisible();
  await expect(page.getByText("پیش‌نویس و پیوست پروژهٔ اول", { exact: true })).toHaveCount(0);
  await expect(page.getByText("فایل پروژه اول.pdf", { exact: true })).toHaveCount(0);
});

test("Source/Composer fails closed without Web Locks and keeps the draft retryable", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window.navigator, "locks", { configurable: true, value: undefined }));
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("بدون قفل امن ثبت نکن");
  await page.getByTestId("send-button").click();

  await expect(page.getByTestId("composer-source-error")).toContainText("قفل امن مرورگر در دسترس نیست");
  await expect(page.getByTestId("composer-input")).toHaveValue("بدون قفل امن ثبت نکن");
  await expect(page.getByTestId("composer-intake-message")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-sources:v1"))).toBeNull();
});

test("Source/Composer finalizes a committed intake from its durable intent after reload", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("پس از reload از intent بازیابی شو");
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({ name: "intent.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF intent recovery") });
  await page.evaluate(() => {
    const nativeRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function removeItem(key: string) {
      if (this === window.localStorage && key === "chida-prototype-project-sources:v1:intake-intent:v1") throw new DOMException("Synthetic crash before intent cleanup", "QuotaExceededError");
      return nativeRemoveItem.call(this, key);
    };
  });

  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("composer-source-error")).toContainText("بازیابی امن لازم است");
  await expect(page.getByTestId("composer-input")).toHaveValue("پس از reload از intent بازیابی شو");
  await expect(page.getByTestId("composer-intake-message")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-sources:v1:intake-intent:v1"))).not.toBeNull();

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("composer-intake-message")).toContainText("پس از reload از intent بازیابی شو");
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("chida-prototype-project-sources:v1:intake-intent:v1"))).toBeNull();
  await expect(page.getByTestId("composer-source-open")).toHaveCount(2);
});

test("Source/Composer restores its intent when committed stores change during intent cleanup", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("پاک‌کردن marker نباید ثبت گم‌شده را موفق نشان دهد");
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({ name: "cleanup-race.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF cleanup race") });
  await page.evaluate(() => {
    const nativeRemoveItem = Storage.prototype.removeItem;
    let raced = false;
    Storage.prototype.removeItem = function removeItem(key: string) {
      if (this === window.localStorage && key === "chida-prototype-project-sources:v1:intake-intent:v1" && !raced) {
        raced = true;
        nativeRemoveItem.call(this, "chida-prototype-project-files:v1");
        nativeRemoveItem.call(this, "chida-prototype-project-sources:v1");
      }
      return nativeRemoveItem.call(this, key);
    };
  });

  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("composer-source-error")).toContainText("بازیابی امن لازم است");
  await expect(page.getByTestId("composer-input")).toHaveValue("پاک‌کردن marker نباید ثبت گم‌شده را موفق نشان دهد");
  await expect(page.getByTestId("composer-attachment")).toContainText("cleanup-race.pdf");
  await expect(page.getByTestId("composer-intake-message")).toHaveCount(0);
  expect(await page.evaluate(() => ({
    files: window.localStorage.getItem("chida-prototype-project-files:v1"),
    sources: window.localStorage.getItem("chida-prototype-project-sources:v1"),
    intent: window.localStorage.getItem("chida-prototype-project-sources:v1:intake-intent:v1"),
  }))).toEqual({ files: null, sources: null, intent: expect.any(String) });

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("chida-prototype-project-sources:v1:intake-intent:v1"))).toBeNull();
  expect(await page.evaluate(() => ({
    files: window.localStorage.getItem("chida-prototype-project-files:v1"),
    sources: window.localStorage.getItem("chida-prototype-project-sources:v1"),
  }))).toEqual({ files: null, sources: null });
  expect(await page.evaluate(() => new Promise<number>((resolve, reject) => {
    const request = window.indexedDB.open("chida-prototype-project-file-content:v1", 1);
    request.onsuccess = () => {
      const database = request.result;
      const count = database.transaction("files", "readonly").objectStore("files").count();
      count.onsuccess = () => { resolve(count.result); database.close(); };
      count.onerror = () => reject(count.error);
    };
    request.onerror = () => reject(request.error);
  }))).toBe(0);
});

test("Source/Composer rolls an incomplete cross-store intent back after reload", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("این ثبت نیمه‌کاره باید کامل برگردد");
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({ name: "incomplete.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF incomplete recovery") });
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    const nativeRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-sources:v1") throw new DOMException("Synthetic crash before Source metadata", "QuotaExceededError");
      return nativeSetItem.call(this, key, value);
    };
    Storage.prototype.removeItem = function removeItem(key: string) {
      if (this === window.localStorage && key === "chida-prototype-project-files:v1") throw new DOMException("Synthetic crash during rollback", "QuotaExceededError");
      return nativeRemoveItem.call(this, key);
    };
  });

  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("composer-source-error")).toContainText("بازیابی امن لازم است");
  const incomplete = await page.evaluate(() => ({
    files: window.localStorage.getItem("chida-prototype-project-files:v1"),
    sources: window.localStorage.getItem("chida-prototype-project-sources:v1"),
    intent: window.localStorage.getItem("chida-prototype-project-sources:v1:intake-intent:v1"),
  }));
  expect(incomplete.files).not.toBeNull();
  expect(incomplete.sources).toBeNull();
  expect(incomplete.intent).not.toBeNull();

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("chida-prototype-project-sources:v1:intake-intent:v1"))).toBeNull();
  expect(await page.evaluate(() => ({ files: window.localStorage.getItem("chida-prototype-project-files:v1"), sources: window.localStorage.getItem("chida-prototype-project-sources:v1") }))).toEqual({ files: null, sources: null });
  expect(await page.evaluate(() => new Promise<number>((resolve, reject) => {
    const request = window.indexedDB.open("chida-prototype-project-file-content:v1", 1);
    request.onsuccess = () => {
      const database = request.result;
      const count = database.transaction("files", "readonly").objectStore("files").count();
      count.onsuccess = () => { resolve(count.result); database.close(); };
      count.onerror = () => reject(count.error);
    };
    request.onerror = () => reject(request.error);
  }))).toBe(0);
  await expect(page.getByTestId("composer-intake-message")).toHaveCount(0);
  await expect(page.getByTestId("send-button")).toBeDisabled();
});

test("Source/Composer rejects a rehashed forged recovery intent without deleting an existing asset", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("منبع موجود باید از intent جعلی محفوظ بماند");
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({ name: "existing.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF existing protected asset") });
  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("composer-source-open")).toHaveCount(2);

  const before = await page.evaluate(() => {
    const filesRaw = window.localStorage.getItem("chida-prototype-project-files:v1")!;
    const sourcesRaw = window.localStorage.getItem("chida-prototype-project-sources:v1")!;
    const files = JSON.parse(filesRaw);
    const sources = JSON.parse(sourcesRaw);
    const assetSource = sources.records.find((source: any) => source.assetRef);
    const stable = (value: any): any => Array.isArray(value)
      ? value.map(stable)
      : value && typeof value === "object"
        ? Object.fromEntries(Object.entries(value).sort(([first], [second]) => first.localeCompare(second)).map(([key, item]) => [key, stable(item)]))
        : value;
    const base = {
      schemaVersion: 1,
      id: "forged-existing-intake",
      previousFilesRaw: null,
      nextFilesRaw: filesRaw,
      previousSourcesRaw: sourcesRaw,
      nextSourcesRaw: JSON.stringify({ schemaVersion: 1, envelopeVersion: 0, records: [], intakes: [], updatedAt: null }),
      fileId: files[0].id,
      storageMode: files[0].storageMode,
      contentHash: assetSource.contentHash,
      createdAt: "2026-08-31T12:00:00.000Z",
    };
    const serialized = JSON.stringify(stable(base));
    let hash = 2166136261;
    for (let index = 0; index < serialized.length; index += 1) {
      hash ^= serialized.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    const intentRaw = JSON.stringify({ ...base, intentHash: `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}` });
    window.localStorage.setItem("chida-prototype-project-sources:v1:intake-intent:v1", intentRaw);
    return { filesRaw, sourcesRaw, intentRaw, fileId: files[0].id };
  });

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("composer-source-read-error")).toBeVisible();
  expect(await page.evaluate(() => ({
    filesRaw: window.localStorage.getItem("chida-prototype-project-files:v1"),
    sourcesRaw: window.localStorage.getItem("chida-prototype-project-sources:v1"),
    intentRaw: window.localStorage.getItem("chida-prototype-project-sources:v1:intake-intent:v1"),
  }))).toEqual({ filesRaw: before.filesRaw, sourcesRaw: before.sourcesRaw, intentRaw: before.intentRaw });
  expect(await page.evaluate((fileId) => new Promise<boolean>((resolve, reject) => {
    const request = window.indexedDB.open("chida-prototype-project-file-content:v1", 1);
    request.onsuccess = () => {
      const database = request.result;
      const get = database.transaction("files", "readonly").objectStore("files").get(fileId);
      get.onsuccess = () => { resolve(Boolean(get.result?.blob)); database.close(); };
      get.onerror = () => reject(get.error);
    };
    request.onerror = () => reject(request.error);
  }), before.fileId)).toBe(true);
});

test("Source/Composer fail-closes a dangling asset reference and never rewrites file metadata", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("منبع فایل باید پیوند سالم داشته باشد");
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({ name: "dangling.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF dangling source") });
  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("composer-source-open")).toHaveCount(2);
  await page.evaluate(() => window.localStorage.removeItem("chida-prototype-project-files:v1"));

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("composer-source-read-error")).toContainText("قفل است");
  await expect(page.getByTestId("send-button")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1"))).toBeNull();
  await page.getByTestId("composer-source-open").nth(1).click();
  await expect(page.getByTestId("composer-source-unavailable")).toContainText("پیدا نشد");
});

test("Source/Composer treats a missing stored Blob as unavailable and blocks further mutation", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("اصل فایل نباید ساختگی باز شود");
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({ name: "missing.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF missing stored blob") });
  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("composer-source-open")).toHaveCount(2);
  const fileId = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-files:v1") ?? "[]")[0].id as string);
  await page.evaluate(async (id) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open("chida-prototype-project-file-content:v1", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("files", "readwrite");
      transaction.objectStore("files").delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  }, fileId);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("composer-source-read-error")).toContainText("قفل است");
  await expect(page.getByTestId("send-button")).toBeDisabled();
  await page.getByTestId("composer-source-open").nth(1).click();
  await expect(page.getByTestId("composer-source-unavailable")).toContainText("خواندن اصل منبع");
});

test("Source/Composer detects changed asset bytes even when file metadata is untouched", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("composer-input").fill("بایت اصل فایل باید با hash منبع برابر بماند");
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({ name: "hash-bound.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF original hash-bound bytes") });
  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("composer-source-open")).toHaveCount(2);
  const before = await page.evaluate(() => ({
    filesRaw: window.localStorage.getItem("chida-prototype-project-files:v1")!,
    sourcesRaw: window.localStorage.getItem("chida-prototype-project-sources:v1")!,
    fileId: JSON.parse(window.localStorage.getItem("chida-prototype-project-files:v1") ?? "[]")[0].id as string,
  }));
  await page.evaluate(async (fileId) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open("chida-prototype-project-file-content:v1", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("files", "readwrite");
      const store = transaction.objectStore("files");
      const get = store.get(fileId);
      get.onsuccess = () => store.put({ ...get.result, blob: new Blob(["%PDF changed bytes"], { type: "application/pdf" }) });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  }, before.fileId);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("composer-source-read-error")).toContainText("قفل است");
  await expect(page.getByTestId("send-button")).toBeDisabled();
  expect(await page.evaluate(() => ({
    filesRaw: window.localStorage.getItem("chida-prototype-project-files:v1"),
    sourcesRaw: window.localStorage.getItem("chida-prototype-project-sources:v1"),
  }))).toEqual({ filesRaw: before.filesRaw, sourcesRaw: before.sourcesRaw });
});

test("Source/Composer reconstructs an image Blob with the safe MIME bound to its extension", async ({ page }) => {
  await enterBuilderHome(page);
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-image-input").setInputFiles(sampleProjectImage);
  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("composer-source-open")).toHaveCount(1);
  const fileId = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-files:v1") ?? "[]")[0].id as string);
  const tamperedStoredType = await page.evaluate(async (id) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open("chida-prototype-project-images:v1", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("images", "readwrite");
      const store = transaction.objectStore("images");
      const get = store.get(id);
      get.onsuccess = () => store.put({ ...get.result, blob: new Blob([get.result.blob], { type: "text/html" }) });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    const storedType = await new Promise<string>((resolve, reject) => {
      const get = database.transaction("images", "readonly").objectStore("images").get(id);
      get.onsuccess = () => resolve(get.result.blob.type);
      get.onerror = () => reject(get.error);
    });
    database.close();
    return storedType;
  }, fileId);
  expect(tamperedStoredType).toBe("text/html");

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("composer-source-open").click();
  const safeType = await page.getByTestId("composer-source-open-asset").evaluate(async (link: HTMLAnchorElement) => (await fetch(link.href)).headers.get("content-type"));
  expect(safeType).toBe("image/png");
  await expect(page.getByTestId("composer-source-read-error")).toHaveCount(0);

  const beforeMetadataTamper = await page.evaluate(() => ({
    filesRaw: window.localStorage.getItem("chida-prototype-project-files:v1")!,
    sourcesRaw: window.localStorage.getItem("chida-prototype-project-sources:v1")!,
  }));
  await page.evaluate(async (id) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open("chida-prototype-project-images:v1", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("images", "readwrite");
      const store = transaction.objectStore("images");
      const get = store.get(id);
      get.onsuccess = () => store.put({ ...get.result, mimeType: "text/html" });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  }, fileId);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("composer-source-read-error")).toContainText("قفل است");
  await expect(page.getByTestId("send-button")).toBeDisabled();
  expect(await page.evaluate(() => ({
    filesRaw: window.localStorage.getItem("chida-prototype-project-files:v1"),
    sourcesRaw: window.localStorage.getItem("chida-prototype-project-sources:v1"),
  }))).toEqual(beforeMetadataTamper);
});

test("Source/Composer never reconciles file metadata while the Source store is unreadable", async ({ page }) => {
  await enterBuilderHome(page);
  const seededRaw = await page.evaluate(() => {
    const projectId = window.localStorage.getItem("chida-prototype-active-project")!;
    const records = [{
      id: "file-unreadable-source-guard",
      projectId,
      displayName: "فایل حفاظت‌شده",
      originalName: "guard.pdf",
      mimeType: "application/pdf",
      size: 19,
      category: "سایر",
      source: "انتخاب مستقیم از دستگاه",
      status: "ثبت محلی",
      version: 1,
      projectStage: "اسکلت بندی",
      visibility: "خصوصی پروژه",
      storageMode: "browser-file",
      sourceModifiedAt: null,
      createdAt: "2026-08-31T08:00:00.000Z",
    }];
    const raw = JSON.stringify(records);
    window.localStorage.setItem("chida-prototype-project-files:v1", raw);
    window.localStorage.setItem("chida-prototype-project-sources:v1", "{unreadable-source");
    return raw;
  });
  await page.addInitScript(() => {
    const nativeSetItem = Storage.prototype.setItem;
    const nativeRemoveItem = Storage.prototype.removeItem;
    (window as any).__guardedFileMetadataWrites = [] as string[];
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === "chida-prototype-project-files:v1") (window as any).__guardedFileMetadataWrites.push("set");
      return nativeSetItem.call(this, key, value);
    };
    Storage.prototype.removeItem = function removeItem(key: string) {
      if (this === window.localStorage && key === "chida-prototype-project-files:v1") (window as any).__guardedFileMetadataWrites.push("remove");
      return nativeRemoveItem.call(this, key);
    };
  });

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("composer-source-read-error")).toBeVisible();
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-files:v1"))).toBe(seededRaw);
  expect(await page.evaluate(() => (window as any).__guardedFileMetadataWrites)).toEqual([]);
});

test("Source/Composer and the file library share one lock without losing either file", async ({ page }) => {
  await enterBuilderHome(page);
  const secondPage = await page.context().newPage();
  await reachBuilderWelcome(secondPage);
  await secondPage.getByTestId("enter-home").click();

  await page.getByTestId("composer-input").fill("پیوست Composer در رقابت با کتابخانه");
  await page.getByTestId("attach-button").click();
  await page.getByTestId("composer-file-input").setInputFiles({ name: "composer-race.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF composer race") });
  await secondPage.getByTestId("open-project-space").click();
  await secondPage.getByTestId("project-files-entry").click();
  await secondPage.getByTestId("project-file-input").setInputFiles({ name: "library-race.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF library race") });

  await Promise.all([
    page.getByTestId("send-button").click(),
    secondPage.getByTestId("project-file-register").click(),
  ]);
  await expect(page.getByTestId("composer-input")).toHaveValue("");
  await expect(secondPage.getByTestId("project-file-register-sheet")).toBeHidden();
  const finalStores = await page.evaluate(() => ({
    files: JSON.parse(window.localStorage.getItem("chida-prototype-project-files:v1") ?? "[]"),
    sources: JSON.parse(window.localStorage.getItem("chida-prototype-project-sources:v1") ?? "null"),
  }));
  expect(finalStores.files.map((file: any) => file.originalName).sort()).toEqual(["composer-race.pdf", "library-race.pdf"].sort());
  expect(finalStores.sources.records).toHaveLength(2);
  expect(finalStores.sources.records.find((source: any) => source.sourceType === "composer-file").assetRef.fileId).toBe(finalStores.files.find((file: any) => file.originalName === "composer-race.pdf").id);
  await secondPage.close();
});

test("Source/Composer serializes concurrent tabs and never silently overwrites a stale intake", async ({ page }) => {
  await enterBuilderHome(page);
  const secondPage = await page.context().newPage();
  await reachBuilderWelcome(secondPage);
  await secondPage.getByTestId("enter-home").click();
  await expect(secondPage.getByTestId("builder-home")).toBeVisible();

  await page.getByTestId("composer-input").fill("پیام هم‌زمان تب اول");
  await secondPage.getByTestId("composer-input").fill("پیام هم‌زمان تب دوم");
  await Promise.all([
    page.getByTestId("send-button").click(),
    secondPage.getByTestId("send-button").click(),
  ]);
  await expect.poll(async () => Number(await page.getByTestId("composer-source-error").count() > 0) + Number(await secondPage.getByTestId("composer-source-error").count() > 0)).toBe(1);
  const firstDraft = await page.getByTestId("composer-input").inputValue();
  const secondDraft = await secondPage.getByTestId("composer-input").inputValue();
  expect([firstDraft, secondDraft].filter(Boolean)).toHaveLength(1);
  const retryPage = firstDraft ? page : secondPage;
  await expect(retryPage.getByTestId("composer-source-error")).toContainText("نسخهٔ تازه بارگذاری شد");
  await retryPage.getByTestId("send-button").click();
  await expect(retryPage.getByTestId("composer-input")).toHaveValue("");
  await expect.poll(() => retryPage.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-sources:v1") ?? "null")?.envelopeVersion)).toBe(2);
  const finalEnvelope = await retryPage.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-sources:v1") ?? "null"));
  expect(finalEnvelope.intakes).toHaveLength(2);
  expect(finalEnvelope.records.map((source: any) => source.textContent).sort()).toEqual(["پیام هم‌زمان تب اول", "پیام هم‌زمان تب دوم"].sort());
  await secondPage.close();
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
  await expect(page.getByTestId("settings-privacy-section")).toContainText("خصوصی و پروژه‌محور");
  await expect(page.getByTestId("settings-privacy-section")).not.toContainText("مرورگر");
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
  await expect(page.getByText(/برای «برج نیلوفر» ثبت شد/)).toBeVisible();
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
  await expect(taskCenter).toContainText("کارهای جاری و تصمیم‌های منتظر شما");
  expect(await taskCenter.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

  const backBox = await page.getByTestId("project-tasks-back").boundingBox();
  const addBox = await page.getByTestId("project-task-add").boundingBox();
  if (!backBox || !addBox) throw new Error("Task center controls are not rendered");
  expect(backBox.width).toBeGreaterThanOrEqual(44);
  expect(backBox.height).toBeGreaterThanOrEqual(44);
  expect(addBox.height).toBeGreaterThanOrEqual(44);

  await page.getByTestId("project-task-filter-monitor").click();
  await expect(page.getByTestId("project-task-empty")).toContainText("هنوز پایش موعدی ثبت نشده");
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
  await expect(taskCard).not.toContainText("نسخهٔ ۱");
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
  await expect(taskDetail).not.toContainText("خصوصی پروژه");
  await expect(taskDetail).not.toContainText("ثبت محلی");
  await expect(taskDetail).toContainText("۱۴۰۵/۰۶/۱۵");
  await expect(taskDetail).not.toContainText("نسخهٔ ۱");
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
  await expect(taskDetail).not.toContainText("نسخهٔ ۲");
  await expect(page.getByTestId("project-task-history-event")).toHaveCount(2);
  await expect(page.getByTestId("project-task-history-event").first()).toContainText("کار ویرایش شد");
  const editedTaskSnapshot = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"));
  await page.getByTestId("project-task-edit").click();
  await page.getByTestId("project-task-save").click();
  await expect(page.getByTestId("project-task-editor-sheet")).toBeHidden();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"))).toBe(editedTaskSnapshot);
  await expect(taskDetail).not.toContainText("نسخهٔ ۲");
  await expect(page.getByTestId("project-task-history-event")).toHaveCount(2);
  await page.getByTestId("project-task-status-toggle").click();
  await expect(taskDetail).toContainText("تمام‌شده");
  await expect(taskDetail).toContainText("آخرین گام ثبت‌شده");
  await expect(taskDetail).not.toContainText("نسخهٔ ۳");
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
  await expect(page.getByTestId("project-task-detail-view")).not.toContainText("نسخهٔ ۴");
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
  await expect(detail.locator(".project-task-detail-heading small")).toHaveText("در حال انجام");
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
  await expect(page.getByTestId("purchase-request-clarifications")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-history")).toHaveCount(0);
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
  await expect(requestsView).toContainText("درخواست‌های خرید");
  await expect(requestsView).toContainText("نیازت را سریع ثبت و برای تأمین‌کننده‌ها آماده کن");
  await expect(requestsView).not.toContainText("تأیید داخلی هر نسخه ممکن است");
  const editor = page.getByTestId("purchase-request-editor-sheet");
  await expect(editor).toBeVisible();
  await expect(page.getByTestId("purchase-request-raw-input")).toHaveCSS("font-size", "16px");
  expect(await editor.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  await page.getByTestId("purchase-request-save").click();
  await expect(page.getByTestId("purchase-request-raw-error")).toContainText("نام قلم را وارد کن");
  await expect(page.getByTestId("purchase-request-item-input")).toBeFocused();

  await page.getByTestId("purchase-request-raw-input").fill("۲۰٫۵ تن سیمان تیپ ۲ برای هفتهٔ آینده لازم داریم");
  await page.getByTestId("purchase-request-save").click();

  const detail = page.getByTestId("project-purchase-request-detail-view");
  await expect(detail).toBeVisible();
  await expect(page.getByTestId("purchase-request-detail-heading")).toBeFocused();
  expect(await detail.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  await expect(detail).toContainText("در حال تکمیل");
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

  await expect(detail).toContainText("در حال تکمیل");
  await expect(page.getByTestId("purchase-request-detail-heading")).toBeFocused();
  await expect(page.getByTestId("purchase-request-missing-fields")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-ready")).toBeEnabled();
  await page.getByTestId("purchase-request-more-actions").locator("summary").click();
  await page.getByTestId("purchase-request-mark-ready-legacy").click();
  await expect(detail).toContainText("آمادهٔ ادامه");
  await expect(page.getByTestId("purchase-request-detail-heading")).toBeFocused();
  await expect(page.getByTestId("purchase-request-edit")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-return-draft")).toBeVisible();

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
  await expect(page.getByTestId("purchase-request-card")).toContainText("آمادهٔ ادامه");
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
  await expect(page.getByTestId("purchase-request-empty")).toContainText("هنوز درخواستی ثبت نشده");
  await expect(page.getByText("درخواست فقط پروژه الف")).toHaveCount(0);
});

const purchaseRequestRecoverySourceKey = "chida-prototype-project-purchase-requests:v1";
const purchaseRequestRecoveryBackupPrefix = `${purchaseRequestRecoverySourceKey}:recovery-backup:`;
const purchaseRequestRecoveryIntentKey = `${purchaseRequestRecoverySourceKey}:recovery-intent:v1`;
const purchaseRequestRecoveryDependentKeys = [
  "chida-prototype-project-approvals:v1",
  "chida-prototype-project-supplier-contacts:v1",
  "chida-prototype-project-dispatch-drafts:v1",
  "chida-prototype-project-dispatch-plan-approvals:v1",
  "chida-prototype-builder-recorded-proposals:v1",
] as const;

async function readPurchaseRequestRecoveryBackups(page: Page) {
  return page.evaluate((prefix) => {
    const backups: Array<{ key: string; value: string | null }> = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(prefix)) backups.push({ key, value: window.localStorage.getItem(key) });
    }
    return backups.sort((first, second) => first.key.localeCompare(second.key));
  }, purchaseRequestRecoveryBackupPrefix);
}

async function readExactLocalStorageSnapshot(page: Page, keys: readonly string[]) {
  return page.evaluate(
    (storageKeys) => Object.fromEntries(storageKeys.map((key) => [key, window.localStorage.getItem(key)])),
    [...keys],
  );
}

test("purchase request read failures stay distinct from an empty list and recovery cannot mutate bytes it cannot read", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(({ sourceKey, backupPrefix }) => {
    const nativeGetItem = Storage.prototype.getItem;
    const nativeSetItem = Storage.prototype.setItem;
    const nativeRemoveItem = Storage.prototype.removeItem;
    const probeWindow = window as Window & {
      __purchaseRequestRecoveryNativeGetItem?: typeof Storage.prototype.getItem;
      __purchaseRequestRecoveryNativeSetItem?: typeof Storage.prototype.setItem;
      __purchaseRequestRecoveryNativeRemoveItem?: typeof Storage.prototype.removeItem;
      __purchaseRequestRecoveryMutations?: Array<{ operation: "set" | "remove"; key: string; value?: string }>;
    };
    Object.defineProperty(probeWindow, "__purchaseRequestRecoveryNativeGetItem", { value: nativeGetItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestRecoveryNativeSetItem", { value: nativeSetItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestRecoveryNativeRemoveItem", { value: nativeRemoveItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestRecoveryMutations", { value: [], configurable: true });
    Storage.prototype.getItem = function getItem(key: string) {
      if (this === window.localStorage && key === sourceKey) {
        throw new DOMException("Purchase request storage read failed", "SecurityError");
      }
      return nativeGetItem.call(this, key);
    };
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && (key === sourceKey || key.startsWith(backupPrefix))) {
        probeWindow.__purchaseRequestRecoveryMutations?.push({ operation: "set", key, value });
      }
      return nativeSetItem.call(this, key, value);
    };
    Storage.prototype.removeItem = function removeItem(key: string) {
      if (this === window.localStorage && (key === sourceKey || key.startsWith(backupPrefix))) {
        probeWindow.__purchaseRequestRecoveryMutations?.push({ operation: "remove", key });
      }
      return nativeRemoveItem.call(this, key);
    };
  }, { sourceKey: purchaseRequestRecoverySourceKey, backupPrefix: purchaseRequestRecoveryBackupPrefix });
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await expect(page.getByTestId("purchase-request-read-error")).toContainText("درخواست‌های محلی کامل خوانده نشد");
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
  await expect(page.getByTestId("purchase-request-editor-sheet")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-empty")).toHaveCount(0);
  await page.getByTestId("purchase-request-recovery-start").click();
  await expect(page.getByTestId("purchase-request-recovery-sheet")).toBeVisible();
  await page.getByTestId("purchase-request-recovery-confirm").click();
  const mutationAttempts = await page.evaluate(() => {
    const probeWindow = window as Window & {
      __purchaseRequestRecoveryNativeGetItem: typeof Storage.prototype.getItem;
      __purchaseRequestRecoveryNativeSetItem: typeof Storage.prototype.setItem;
      __purchaseRequestRecoveryNativeRemoveItem: typeof Storage.prototype.removeItem;
      __purchaseRequestRecoveryMutations?: Array<{ operation: "set" | "remove"; key: string; value?: string }>;
    };
    const attempts = [...(probeWindow.__purchaseRequestRecoveryMutations ?? [])];
    Storage.prototype.getItem = probeWindow.__purchaseRequestRecoveryNativeGetItem;
    Storage.prototype.setItem = probeWindow.__purchaseRequestRecoveryNativeSetItem;
    Storage.prototype.removeItem = probeWindow.__purchaseRequestRecoveryNativeRemoveItem;
    delete probeWindow.__purchaseRequestRecoveryNativeGetItem;
    delete probeWindow.__purchaseRequestRecoveryNativeSetItem;
    delete probeWindow.__purchaseRequestRecoveryNativeRemoveItem;
    delete probeWindow.__purchaseRequestRecoveryMutations;
    return attempts;
  });
  await expect(page.getByTestId("purchase-request-recovery-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-recovery-success")).not.toBeVisible();
  await expect(page.getByTestId("purchase-request-read-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
  expect(mutationAttempts).toEqual([]);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoverySourceKey)).toBeNull();
  expect(await readPurchaseRequestRecoveryBackups(page)).toEqual([]);
});

test("purchase request recovery reloads a newly valid source without backup or removal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await page.getByTestId("purchase-request-raw-input").fill("درخواست معتبری که باید دوباره بارگذاری شود");
  await page.getByTestId("purchase-request-item-input").fill("سیمان تیپ ۲ معتبر");
  await page.getByTestId("purchase-request-save").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toBeVisible();
  const validRaw = await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoverySourceKey);
  if (validRaw === null) throw new Error("The UI-generated valid purchase-request snapshot is missing");

  const unreadableRaw = "\n{\"legacy\":\"نسخهٔ خراب اولیه برای قفل UI\"}\n";
  await page.evaluate(
    ({ sourceKey, raw }) => window.localStorage.setItem(sourceKey, raw),
    { sourceKey: purchaseRequestRecoverySourceKey, raw: unreadableRaw },
  );
  await reenterBuilderHomeAfterReload(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await expect(page.getByTestId("purchase-request-read-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
  await page.getByTestId("purchase-request-recovery-start").click();
  await expect(page.getByTestId("purchase-request-recovery-sheet")).toBeVisible();

  await page.evaluate(({ sourceKey, raw, backupPrefix }) => {
    window.localStorage.setItem(sourceKey, raw);
    const nativeSetItem = Storage.prototype.setItem;
    const nativeRemoveItem = Storage.prototype.removeItem;
    const probeWindow = window as Window & {
      __purchaseRequestReloadNativeSetItem?: typeof Storage.prototype.setItem;
      __purchaseRequestReloadNativeRemoveItem?: typeof Storage.prototype.removeItem;
      __purchaseRequestReloadMutations?: Array<{ operation: "set" | "remove"; key: string }>;
    };
    Object.defineProperty(probeWindow, "__purchaseRequestReloadNativeSetItem", { value: nativeSetItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestReloadNativeRemoveItem", { value: nativeRemoveItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestReloadMutations", { value: [], configurable: true });
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && (key === sourceKey || key.startsWith(backupPrefix))) {
        probeWindow.__purchaseRequestReloadMutations?.push({ operation: "set", key });
      }
      return nativeSetItem.call(this, key, value);
    };
    Storage.prototype.removeItem = function removeItem(key: string) {
      if (this === window.localStorage && (key === sourceKey || key.startsWith(backupPrefix))) {
        probeWindow.__purchaseRequestReloadMutations?.push({ operation: "remove", key });
      }
      return nativeRemoveItem.call(this, key);
    };
  }, { sourceKey: purchaseRequestRecoverySourceKey, raw: validRaw, backupPrefix: purchaseRequestRecoveryBackupPrefix });

  await page.getByTestId("purchase-request-recovery-confirm").click();
  const mutationAttempts = await page.evaluate(() => {
    const probeWindow = window as Window & {
      __purchaseRequestReloadNativeSetItem: typeof Storage.prototype.setItem;
      __purchaseRequestReloadNativeRemoveItem: typeof Storage.prototype.removeItem;
      __purchaseRequestReloadMutations?: Array<{ operation: "set" | "remove"; key: string }>;
    };
    const attempts = [...(probeWindow.__purchaseRequestReloadMutations ?? [])];
    Storage.prototype.setItem = probeWindow.__purchaseRequestReloadNativeSetItem;
    Storage.prototype.removeItem = probeWindow.__purchaseRequestReloadNativeRemoveItem;
    delete probeWindow.__purchaseRequestReloadNativeSetItem;
    delete probeWindow.__purchaseRequestReloadNativeRemoveItem;
    delete probeWindow.__purchaseRequestReloadMutations;
    return attempts;
  });

  expect(mutationAttempts).toEqual([]);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoverySourceKey)).toBe(validRaw);
  expect(await readPurchaseRequestRecoveryBackups(page)).toEqual([]);
  await expect(page.getByTestId("purchase-request-recovery-sheet")).toBeHidden();
  await expect(page.getByTestId("purchase-request-recovery-error")).not.toBeVisible();
  await expect(page.getByTestId("purchase-request-recovery-success")).toBeVisible();
  await expect(page.getByTestId("purchase-request-read-error")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-add")).toBeEnabled();
  await expect(page.getByTestId("purchase-request-card")).toContainText("سیمان تیپ ۲ معتبر");
});

test("purchase request recovery preserves the source and lock when writing the exact backup fails", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const unreadableRaw = "\n {\"legacy\":\"درخواست قبلیِ بدون مهاجرت\",\"opaque\":[1,2]} \n";
  await page.goto("/");
  await page.evaluate(
    ({ sourceKey, raw }) => window.localStorage.setItem(sourceKey, raw),
    { sourceKey: purchaseRequestRecoverySourceKey, raw: unreadableRaw },
  );
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
  await page.getByTestId("purchase-request-recovery-start").click();
  await expect(page.getByTestId("purchase-request-recovery-sheet")).toBeVisible();

  await page.evaluate((backupPrefix) => {
    const nativeSetItem = Storage.prototype.setItem;
    const probeWindow = window as Window & {
      __purchaseRequestRecoveryNativeSetItem?: typeof Storage.prototype.setItem;
      __purchaseRequestRecoveryBackupAttempts?: Array<{ key: string; value: string }>;
    };
    Object.defineProperty(probeWindow, "__purchaseRequestRecoveryNativeSetItem", { value: nativeSetItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestRecoveryBackupAttempts", { value: [], configurable: true });
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key.startsWith(backupPrefix)) {
        probeWindow.__purchaseRequestRecoveryBackupAttempts?.push({ key, value });
        throw new DOMException("Purchase request recovery backup failed", "QuotaExceededError");
      }
      return nativeSetItem.call(this, key, value);
    };
  }, purchaseRequestRecoveryBackupPrefix);

  await page.getByTestId("purchase-request-recovery-confirm").click();
  const backupAttempts = await page.evaluate(() => {
    const probeWindow = window as Window & {
      __purchaseRequestRecoveryNativeSetItem: typeof Storage.prototype.setItem;
      __purchaseRequestRecoveryBackupAttempts?: Array<{ key: string; value: string }>;
    };
    const attempts = [...(probeWindow.__purchaseRequestRecoveryBackupAttempts ?? [])];
    Storage.prototype.setItem = probeWindow.__purchaseRequestRecoveryNativeSetItem;
    delete probeWindow.__purchaseRequestRecoveryNativeSetItem;
    delete probeWindow.__purchaseRequestRecoveryBackupAttempts;
    return attempts;
  });
  await expect(page.getByTestId("purchase-request-recovery-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-recovery-success")).not.toBeVisible();
  await expect(page.getByTestId("purchase-request-read-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
  expect(backupAttempts).toHaveLength(1);
  expect(backupAttempts[0].key.startsWith(purchaseRequestRecoveryBackupPrefix)).toBe(true);
  expect(backupAttempts[0].value).toBe(unreadableRaw);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoverySourceKey)).toBe(unreadableRaw);
  expect(await readPurchaseRequestRecoveryBackups(page)).toEqual([]);
});

test("purchase request recovery keeps the exact source locked when reset removal fails after backup", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const unreadableRaw = "\t{\"schema\":\"ناسازگار\",\"raw\":\"باید دست‌نخورده بماند\"}\r\n";
  await page.goto("/");
  await page.evaluate(
    ({ sourceKey, raw }) => window.localStorage.setItem(sourceKey, raw),
    { sourceKey: purchaseRequestRecoverySourceKey, raw: unreadableRaw },
  );
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await page.getByTestId("purchase-request-recovery-start").click();
  await expect(page.getByTestId("purchase-request-recovery-sheet")).toBeVisible();

  await page.evaluate((sourceKey) => {
    const nativeRemoveItem = Storage.prototype.removeItem;
    const probeWindow = window as Window & {
      __purchaseRequestRecoveryNativeRemoveItem?: typeof Storage.prototype.removeItem;
      __purchaseRequestRecoveryRemoveAttempts?: string[];
    };
    Object.defineProperty(probeWindow, "__purchaseRequestRecoveryNativeRemoveItem", { value: nativeRemoveItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestRecoveryRemoveAttempts", { value: [], configurable: true });
    Storage.prototype.removeItem = function removeItem(key: string) {
      if (this === window.localStorage && key === sourceKey) {
        probeWindow.__purchaseRequestRecoveryRemoveAttempts?.push(key);
        throw new DOMException("Purchase request recovery reset failed", "SecurityError");
      }
      return nativeRemoveItem.call(this, key);
    };
  }, purchaseRequestRecoverySourceKey);

  await page.getByTestId("purchase-request-recovery-confirm").click();
  const removeAttempts = await page.evaluate(() => {
    const probeWindow = window as Window & {
      __purchaseRequestRecoveryNativeRemoveItem: typeof Storage.prototype.removeItem;
      __purchaseRequestRecoveryRemoveAttempts?: string[];
    };
    const attempts = [...(probeWindow.__purchaseRequestRecoveryRemoveAttempts ?? [])];
    Storage.prototype.removeItem = probeWindow.__purchaseRequestRecoveryNativeRemoveItem;
    delete probeWindow.__purchaseRequestRecoveryNativeRemoveItem;
    delete probeWindow.__purchaseRequestRecoveryRemoveAttempts;
    return attempts;
  });
  await expect(page.getByTestId("purchase-request-recovery-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-recovery-success")).not.toBeVisible();
  await expect(page.getByTestId("purchase-request-read-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
  expect(removeAttempts).toEqual([purchaseRequestRecoverySourceKey]);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoverySourceKey)).toBe(unreadableRaw);
  const backups = await readPurchaseRequestRecoveryBackups(page);
  expect(backups).toHaveLength(1);
  expect(backups[0].value).toBe(unreadableRaw);
});

test("purchase request recovery keeps a newer source locked when it changes after the exact backup is verified", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const unreadableRaw = "\n{\"legacy\":\"نسخهٔ اولیهٔ ناخوانا\",\"items\":null}\n";
  const newerRaw = "\n{\"legacy\":\"نسخهٔ تازه‌تر هم‌زمان\",\"items\":[\"جدید\"]}\n";
  await page.goto("/");
  await page.evaluate(
    ({ sourceKey, raw }) => window.localStorage.setItem(sourceKey, raw),
    { sourceKey: purchaseRequestRecoverySourceKey, raw: unreadableRaw },
  );
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await page.getByTestId("purchase-request-recovery-start").click();
  await expect(page.getByTestId("purchase-request-recovery-sheet")).toBeVisible();

  await page.evaluate(({ sourceKey, backupPrefix, replacementRaw }) => {
    const nativeGetItem = Storage.prototype.getItem;
    const nativeSetItem = Storage.prototype.setItem;
    const nativeRemoveItem = Storage.prototype.removeItem;
    const probeWindow = window as Window & {
      __purchaseRequestRecoveryNativeGetItem?: typeof Storage.prototype.getItem;
      __purchaseRequestRecoveryNativeRemoveItem?: typeof Storage.prototype.removeItem;
      __purchaseRequestRecoverySourceWasChanged?: boolean;
      __purchaseRequestRecoveryRemoveAttempts?: string[];
    };
    Object.defineProperty(probeWindow, "__purchaseRequestRecoveryNativeGetItem", { value: nativeGetItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestRecoveryNativeRemoveItem", { value: nativeRemoveItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestRecoverySourceWasChanged", { value: false, writable: true, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestRecoveryRemoveAttempts", { value: [], configurable: true });
    Storage.prototype.getItem = function getItem(key: string) {
      const value = nativeGetItem.call(this, key);
      if (this === window.localStorage && key.startsWith(backupPrefix) && !probeWindow.__purchaseRequestRecoverySourceWasChanged) {
        nativeSetItem.call(window.localStorage, sourceKey, replacementRaw);
        probeWindow.__purchaseRequestRecoverySourceWasChanged = true;
      }
      return value;
    };
    Storage.prototype.removeItem = function removeItem(key: string) {
      if (this === window.localStorage && key === sourceKey) probeWindow.__purchaseRequestRecoveryRemoveAttempts?.push(key);
      return nativeRemoveItem.call(this, key);
    };
  }, {
    sourceKey: purchaseRequestRecoverySourceKey,
    backupPrefix: purchaseRequestRecoveryBackupPrefix,
    replacementRaw: newerRaw,
  });

  await page.getByTestId("purchase-request-recovery-confirm").click();
  const probe = await page.evaluate(() => {
    const probeWindow = window as Window & {
      __purchaseRequestRecoveryNativeGetItem: typeof Storage.prototype.getItem;
      __purchaseRequestRecoveryNativeRemoveItem: typeof Storage.prototype.removeItem;
      __purchaseRequestRecoverySourceWasChanged?: boolean;
      __purchaseRequestRecoveryRemoveAttempts?: string[];
    };
    const result = {
      sourceWasChanged: Boolean(probeWindow.__purchaseRequestRecoverySourceWasChanged),
      removeAttempts: [...(probeWindow.__purchaseRequestRecoveryRemoveAttempts ?? [])],
    };
    Storage.prototype.getItem = probeWindow.__purchaseRequestRecoveryNativeGetItem;
    Storage.prototype.removeItem = probeWindow.__purchaseRequestRecoveryNativeRemoveItem;
    delete probeWindow.__purchaseRequestRecoveryNativeGetItem;
    delete probeWindow.__purchaseRequestRecoveryNativeRemoveItem;
    delete probeWindow.__purchaseRequestRecoverySourceWasChanged;
    delete probeWindow.__purchaseRequestRecoveryRemoveAttempts;
    return result;
  });

  expect(probe.sourceWasChanged).toBe(true);
  expect(probe.removeAttempts).toEqual([]);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoverySourceKey)).toBe(newerRaw);
  const backups = await readPurchaseRequestRecoveryBackups(page);
  expect(backups).toHaveLength(1);
  expect(backups[0].value).toBe(unreadableRaw);
  await expect(page.getByTestId("purchase-request-recovery-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-recovery-success")).not.toBeVisible();
  await expect(page.getByTestId("purchase-request-read-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
});

test("purchase request recovery restores the exact primary bytes when direct reset verification throws after removal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const unreadableRaw = "\n{\"legacy\":\"بازگردانی پس از خطای بررسی مستقیم\"}\n";
  await page.goto("/");
  await page.evaluate(
    ({ sourceKey, raw }) => window.localStorage.setItem(sourceKey, raw),
    { sourceKey: purchaseRequestRecoverySourceKey, raw: unreadableRaw },
  );
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await page.getByTestId("purchase-request-recovery-start").click();
  await expect(page.getByTestId("purchase-request-recovery-sheet")).toBeVisible();

  await page.evaluate((sourceKey) => {
    const nativeGetItem = Storage.prototype.getItem;
    const nativeRemoveItem = Storage.prototype.removeItem;
    const probeWindow = window as Window & {
      __purchaseRequestVerifyNativeGetItem?: typeof Storage.prototype.getItem;
      __purchaseRequestVerifyNativeRemoveItem?: typeof Storage.prototype.removeItem;
      __purchaseRequestVerifySourceRemoved?: boolean;
      __purchaseRequestVerifyReadThrown?: boolean;
      __purchaseRequestVerifyRemoveAttempts?: string[];
    };
    Object.defineProperty(probeWindow, "__purchaseRequestVerifyNativeGetItem", { value: nativeGetItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestVerifyNativeRemoveItem", { value: nativeRemoveItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestVerifySourceRemoved", { value: false, writable: true, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestVerifyReadThrown", { value: false, writable: true, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestVerifyRemoveAttempts", { value: [], configurable: true });
    Storage.prototype.removeItem = function removeItem(key: string) {
      const result = nativeRemoveItem.call(this, key);
      if (this === window.localStorage && key === sourceKey) {
        probeWindow.__purchaseRequestVerifyRemoveAttempts?.push(key);
        probeWindow.__purchaseRequestVerifySourceRemoved = true;
      }
      return result;
    };
    Storage.prototype.getItem = function getItem(key: string) {
      if (this === window.localStorage && key === sourceKey && probeWindow.__purchaseRequestVerifySourceRemoved && !probeWindow.__purchaseRequestVerifyReadThrown) {
        probeWindow.__purchaseRequestVerifyReadThrown = true;
        throw new DOMException("Purchase request direct reset verification failed", "SecurityError");
      }
      return nativeGetItem.call(this, key);
    };
  }, purchaseRequestRecoverySourceKey);

  await page.getByTestId("purchase-request-recovery-confirm").click();
  const probe = await page.evaluate(() => {
    const probeWindow = window as Window & {
      __purchaseRequestVerifyNativeGetItem: typeof Storage.prototype.getItem;
      __purchaseRequestVerifyNativeRemoveItem: typeof Storage.prototype.removeItem;
      __purchaseRequestVerifySourceRemoved?: boolean;
      __purchaseRequestVerifyReadThrown?: boolean;
      __purchaseRequestVerifyRemoveAttempts?: string[];
    };
    const result = {
      readThrown: Boolean(probeWindow.__purchaseRequestVerifyReadThrown),
      removeAttempts: [...(probeWindow.__purchaseRequestVerifyRemoveAttempts ?? [])],
    };
    Storage.prototype.getItem = probeWindow.__purchaseRequestVerifyNativeGetItem;
    Storage.prototype.removeItem = probeWindow.__purchaseRequestVerifyNativeRemoveItem;
    delete probeWindow.__purchaseRequestVerifyNativeGetItem;
    delete probeWindow.__purchaseRequestVerifyNativeRemoveItem;
    delete probeWindow.__purchaseRequestVerifySourceRemoved;
    delete probeWindow.__purchaseRequestVerifyReadThrown;
    delete probeWindow.__purchaseRequestVerifyRemoveAttempts;
    return result;
  });

  expect(probe.readThrown).toBe(true);
  expect(probe.removeAttempts).toEqual([purchaseRequestRecoverySourceKey]);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoverySourceKey)).toBe(unreadableRaw);
  const backups = await readPurchaseRequestRecoveryBackups(page);
  expect(backups).toHaveLength(1);
  expect(backups[0].value).toBe(unreadableRaw);
  await expect(page.getByTestId("purchase-request-recovery-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-recovery-success")).not.toBeVisible();
  await expect(page.getByTestId("purchase-request-read-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
});

test("purchase request recovery restores exact primary bytes when the final empty-store read throws once", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const unreadableRaw = "\r\n{\"legacy\":\"بازگردانی پس از خطای خواندن نهایی\"}\r\n";
  await page.goto("/");
  await page.evaluate(
    ({ sourceKey, raw }) => window.localStorage.setItem(sourceKey, raw),
    { sourceKey: purchaseRequestRecoverySourceKey, raw: unreadableRaw },
  );
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await page.getByTestId("purchase-request-recovery-start").click();
  await expect(page.getByTestId("purchase-request-recovery-sheet")).toBeVisible();

  await page.evaluate((sourceKey) => {
    const nativeGetItem = Storage.prototype.getItem;
    const nativeRemoveItem = Storage.prototype.removeItem;
    const probeWindow = window as Window & {
      __purchaseRequestFinalReadNativeGetItem?: typeof Storage.prototype.getItem;
      __purchaseRequestFinalReadNativeRemoveItem?: typeof Storage.prototype.removeItem;
      __purchaseRequestFinalReadSourceRemoved?: boolean;
      __purchaseRequestFinalReadCount?: number;
      __purchaseRequestFinalReadThrown?: boolean;
      __purchaseRequestFinalReadRemoveAttempts?: string[];
    };
    Object.defineProperty(probeWindow, "__purchaseRequestFinalReadNativeGetItem", { value: nativeGetItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestFinalReadNativeRemoveItem", { value: nativeRemoveItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestFinalReadSourceRemoved", { value: false, writable: true, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestFinalReadCount", { value: 0, writable: true, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestFinalReadThrown", { value: false, writable: true, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestFinalReadRemoveAttempts", { value: [], configurable: true });
    Storage.prototype.removeItem = function removeItem(key: string) {
      const result = nativeRemoveItem.call(this, key);
      if (this === window.localStorage && key === sourceKey) {
        probeWindow.__purchaseRequestFinalReadRemoveAttempts?.push(key);
        probeWindow.__purchaseRequestFinalReadSourceRemoved = true;
      }
      return result;
    };
    Storage.prototype.getItem = function getItem(key: string) {
      if (this === window.localStorage && key === sourceKey && probeWindow.__purchaseRequestFinalReadSourceRemoved) {
        probeWindow.__purchaseRequestFinalReadCount = (probeWindow.__purchaseRequestFinalReadCount ?? 0) + 1;
        if (probeWindow.__purchaseRequestFinalReadCount === 2 && !probeWindow.__purchaseRequestFinalReadThrown) {
          probeWindow.__purchaseRequestFinalReadThrown = true;
          throw new DOMException("Purchase request final empty-store read failed", "SecurityError");
        }
      }
      return nativeGetItem.call(this, key);
    };
  }, purchaseRequestRecoverySourceKey);

  await page.getByTestId("purchase-request-recovery-confirm").click();
  const probe = await page.evaluate(() => {
    const probeWindow = window as Window & {
      __purchaseRequestFinalReadNativeGetItem: typeof Storage.prototype.getItem;
      __purchaseRequestFinalReadNativeRemoveItem: typeof Storage.prototype.removeItem;
      __purchaseRequestFinalReadSourceRemoved?: boolean;
      __purchaseRequestFinalReadCount?: number;
      __purchaseRequestFinalReadThrown?: boolean;
      __purchaseRequestFinalReadRemoveAttempts?: string[];
    };
    const result = {
      readCount: probeWindow.__purchaseRequestFinalReadCount ?? 0,
      readThrown: Boolean(probeWindow.__purchaseRequestFinalReadThrown),
      removeAttempts: [...(probeWindow.__purchaseRequestFinalReadRemoveAttempts ?? [])],
    };
    Storage.prototype.getItem = probeWindow.__purchaseRequestFinalReadNativeGetItem;
    Storage.prototype.removeItem = probeWindow.__purchaseRequestFinalReadNativeRemoveItem;
    delete probeWindow.__purchaseRequestFinalReadNativeGetItem;
    delete probeWindow.__purchaseRequestFinalReadNativeRemoveItem;
    delete probeWindow.__purchaseRequestFinalReadSourceRemoved;
    delete probeWindow.__purchaseRequestFinalReadCount;
    delete probeWindow.__purchaseRequestFinalReadThrown;
    delete probeWindow.__purchaseRequestFinalReadRemoveAttempts;
    return result;
  });

  expect(probe.readThrown).toBe(true);
  expect(probe.readCount).toBeGreaterThanOrEqual(3);
  expect(probe.removeAttempts).toEqual([purchaseRequestRecoverySourceKey]);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoverySourceKey)).toBe(unreadableRaw);
  const backups = await readPurchaseRequestRecoveryBackups(page);
  expect(backups).toHaveLength(1);
  expect(backups[0].value).toBe(unreadableRaw);
  await expect(page.getByTestId("purchase-request-recovery-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-recovery-success")).not.toBeVisible();
  await expect(page.getByTestId("purchase-request-read-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
});

test("purchase request recovery intent keeps an unrestored reset locked across reload and resumes from its exact backup", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const unreadableRaw = "\n{\"legacy\":\"تنها نسخهٔ امن برای ادامهٔ بازیابی\",\"items\":null}\n";
  await page.goto("/");
  await page.evaluate(
    ({ sourceKey, raw }) => window.localStorage.setItem(sourceKey, raw),
    { sourceKey: purchaseRequestRecoverySourceKey, raw: unreadableRaw },
  );
  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await page.getByTestId("purchase-request-recovery-start").click();
  await expect(page.getByTestId("purchase-request-recovery-sheet")).toBeVisible();

  await page.evaluate((sourceKey) => {
    const nativeGetItem = Storage.prototype.getItem;
    const nativeSetItem = Storage.prototype.setItem;
    const nativeRemoveItem = Storage.prototype.removeItem;
    const probeWindow = window as Window & {
      __purchaseRequestIntentNativeGetItem?: typeof Storage.prototype.getItem;
      __purchaseRequestIntentNativeSetItem?: typeof Storage.prototype.setItem;
      __purchaseRequestIntentNativeRemoveItem?: typeof Storage.prototype.removeItem;
      __purchaseRequestIntentSourceRemoved?: boolean;
      __purchaseRequestIntentVerifyThrown?: boolean;
      __purchaseRequestIntentRollbackAttempts?: string[];
      __purchaseRequestIntentRemoveAttempts?: string[];
    };
    Object.defineProperty(probeWindow, "__purchaseRequestIntentNativeGetItem", { value: nativeGetItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestIntentNativeSetItem", { value: nativeSetItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestIntentNativeRemoveItem", { value: nativeRemoveItem, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestIntentSourceRemoved", { value: false, writable: true, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestIntentVerifyThrown", { value: false, writable: true, configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestIntentRollbackAttempts", { value: [], configurable: true });
    Object.defineProperty(probeWindow, "__purchaseRequestIntentRemoveAttempts", { value: [], configurable: true });
    Storage.prototype.removeItem = function removeItem(key: string) {
      const result = nativeRemoveItem.call(this, key);
      if (this === window.localStorage && key === sourceKey) {
        probeWindow.__purchaseRequestIntentRemoveAttempts?.push(key);
        probeWindow.__purchaseRequestIntentSourceRemoved = true;
      }
      return result;
    };
    Storage.prototype.getItem = function getItem(key: string) {
      if (this === window.localStorage && key === sourceKey && probeWindow.__purchaseRequestIntentSourceRemoved && !probeWindow.__purchaseRequestIntentVerifyThrown) {
        probeWindow.__purchaseRequestIntentVerifyThrown = true;
        throw new DOMException("Purchase request intent verification failed", "SecurityError");
      }
      return nativeGetItem.call(this, key);
    };
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (this === window.localStorage && key === sourceKey && probeWindow.__purchaseRequestIntentSourceRemoved) {
        probeWindow.__purchaseRequestIntentRollbackAttempts?.push(value);
        throw new DOMException("Purchase request primary rollback failed", "QuotaExceededError");
      }
      return nativeSetItem.call(this, key, value);
    };
  }, purchaseRequestRecoverySourceKey);

  await page.getByTestId("purchase-request-recovery-confirm").click();
  const probe = await page.evaluate(() => {
    const probeWindow = window as Window & {
      __purchaseRequestIntentNativeGetItem: typeof Storage.prototype.getItem;
      __purchaseRequestIntentNativeSetItem: typeof Storage.prototype.setItem;
      __purchaseRequestIntentNativeRemoveItem: typeof Storage.prototype.removeItem;
      __purchaseRequestIntentSourceRemoved?: boolean;
      __purchaseRequestIntentVerifyThrown?: boolean;
      __purchaseRequestIntentRollbackAttempts?: string[];
      __purchaseRequestIntentRemoveAttempts?: string[];
    };
    const result = {
      verifyThrown: Boolean(probeWindow.__purchaseRequestIntentVerifyThrown),
      rollbackAttempts: [...(probeWindow.__purchaseRequestIntentRollbackAttempts ?? [])],
      removeAttempts: [...(probeWindow.__purchaseRequestIntentRemoveAttempts ?? [])],
    };
    Storage.prototype.getItem = probeWindow.__purchaseRequestIntentNativeGetItem;
    Storage.prototype.setItem = probeWindow.__purchaseRequestIntentNativeSetItem;
    Storage.prototype.removeItem = probeWindow.__purchaseRequestIntentNativeRemoveItem;
    delete probeWindow.__purchaseRequestIntentNativeGetItem;
    delete probeWindow.__purchaseRequestIntentNativeSetItem;
    delete probeWindow.__purchaseRequestIntentNativeRemoveItem;
    delete probeWindow.__purchaseRequestIntentSourceRemoved;
    delete probeWindow.__purchaseRequestIntentVerifyThrown;
    delete probeWindow.__purchaseRequestIntentRollbackAttempts;
    delete probeWindow.__purchaseRequestIntentRemoveAttempts;
    return result;
  });

  expect(probe.verifyThrown).toBe(true);
  expect(probe.removeAttempts).toEqual([purchaseRequestRecoverySourceKey]);
  expect(probe.rollbackAttempts).toEqual([unreadableRaw, unreadableRaw]);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoverySourceKey)).toBeNull();
  const backupsBeforeReload = await readPurchaseRequestRecoveryBackups(page);
  expect(backupsBeforeReload).toHaveLength(1);
  expect(backupsBeforeReload[0].value).toBe(unreadableRaw);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoveryIntentKey)).toBe(backupsBeforeReload[0].key);
  await expect(page.getByTestId("purchase-request-recovery-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-recovery-success")).not.toBeVisible();
  await expect(page.getByTestId("purchase-request-read-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();

  await reenterBuilderHomeAfterReload(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await expect(page.getByTestId("purchase-request-read-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
  await expect(page.getByTestId("purchase-request-empty")).toHaveCount(0);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoverySourceKey)).toBeNull();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoveryIntentKey)).toBe(backupsBeforeReload[0].key);

  await page.getByTestId("purchase-request-recovery-start").click();
  await page.getByTestId("purchase-request-recovery-confirm").click();
  await expect(page.getByTestId("purchase-request-recovery-sheet")).toBeHidden();
  await expect(page.getByTestId("purchase-request-recovery-error")).not.toBeVisible();
  await expect(page.getByTestId("purchase-request-recovery-success")).toBeVisible();
  await expect(page.getByTestId("purchase-request-read-error")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-add")).toBeEnabled();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoverySourceKey)).toBeNull();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoveryIntentKey)).toBeNull();
  expect(await readPurchaseRequestRecoveryBackups(page)).toContainEqual(backupsBeforeReload[0]);
});

test("purchase request recovery confirms, backs up exact bytes uniquely, preserves dependencies, and unlocks creation after reload", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const unreadableRaw = "\n { \"legacy\": \"نیاز خرید قدیمی\", \"unknown\": [\"الف\", ۲] } \n";
  const oldBackupKey = `${purchaseRequestRecoveryBackupPrefix}existing-backup`;
  const oldBackupValue = "نسخهٔ پشتیبان قدیمی — دست‌نخورده";
  const dependentSeed: Record<(typeof purchaseRequestRecoveryDependentKeys)[number], string> = {
    "chida-prototype-project-approvals:v1": "\n[]\n",
    "chida-prototype-project-supplier-contacts:v1": " [] ",
    "chida-prototype-project-dispatch-drafts:v1": "\t[]",
    "chida-prototype-project-dispatch-plan-approvals:v1": "\r\n[]\n",
    "chida-prototype-builder-recorded-proposals:v1": "\n []",
  };
  await page.goto("/");
  await page.evaluate(({ sourceKey, raw, existingBackupKey, existingBackupValue, dependencies }) => {
    window.localStorage.setItem(sourceKey, raw);
    window.localStorage.setItem(existingBackupKey, existingBackupValue);
    for (const [key, value] of Object.entries(dependencies)) window.localStorage.setItem(key, value);
  }, {
    sourceKey: purchaseRequestRecoverySourceKey,
    raw: unreadableRaw,
    existingBackupKey: oldBackupKey,
    existingBackupValue: oldBackupValue,
    dependencies: dependentSeed,
  });
  const dependentBytesBefore = await readExactLocalStorageSnapshot(page, purchaseRequestRecoveryDependentKeys);

  await enterBuilderHome(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await expect(page.getByTestId("purchase-request-read-error")).toBeVisible();
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
  await expect(page.getByTestId("purchase-request-editor-sheet")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-empty")).toHaveCount(0);

  await page.getByTestId("purchase-request-recovery-start").click();
  await expect(page.getByTestId("purchase-request-recovery-sheet")).toBeVisible();
  await expect(page.getByTestId("purchase-request-recovery-confirm")).toBeVisible();
  await expect(page.getByTestId("purchase-request-recovery-cancel")).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoverySourceKey)).toBe(unreadableRaw);
  expect(await readPurchaseRequestRecoveryBackups(page)).toEqual([{ key: oldBackupKey, value: oldBackupValue }]);
  await page.getByTestId("purchase-request-recovery-cancel").click();
  await expect(page.getByTestId("purchase-request-recovery-sheet")).toBeHidden();
  await expect(page.getByTestId("purchase-request-add")).toBeDisabled();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoverySourceKey)).toBe(unreadableRaw);

  await page.getByTestId("purchase-request-recovery-start").click();
  await page.getByTestId("purchase-request-recovery-confirm").click();
  await expect(page.getByTestId("purchase-request-recovery-success")).toBeVisible();
  await expect(page.getByTestId("purchase-request-recovery-error")).not.toBeVisible();
  await expect(page.getByTestId("purchase-request-read-error")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-add")).toBeEnabled();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), purchaseRequestRecoverySourceKey)).toBeNull();
  expect(await readExactLocalStorageSnapshot(page, purchaseRequestRecoveryDependentKeys)).toEqual(dependentBytesBefore);

  const backupsAfterRecovery = await readPurchaseRequestRecoveryBackups(page);
  expect(backupsAfterRecovery).toHaveLength(2);
  expect(backupsAfterRecovery).toContainEqual({ key: oldBackupKey, value: oldBackupValue });
  const newBackup = backupsAfterRecovery.find((backup) => backup.key !== oldBackupKey);
  expect(newBackup).toBeDefined();
  expect(newBackup?.key.startsWith(purchaseRequestRecoveryBackupPrefix)).toBe(true);
  expect(newBackup?.value).toBe(unreadableRaw);

  await expect(page.getByTestId("purchase-request-recovery-sheet")).toBeHidden();
  await page.getByTestId("purchase-request-add").click();
  await expect(page.getByTestId("purchase-request-editor-sheet")).toBeVisible();
  await page.getByTestId("purchase-request-raw-input").fill("درخواست تازه پس از بازیابی امن");
  await page.getByTestId("purchase-request-save").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("درخواست تازه پس از بازیابی امن");
  const savedRequests = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "[]"), purchaseRequestRecoverySourceKey);
  expect(savedRequests).toHaveLength(1);
  expect(await readExactLocalStorageSnapshot(page, purchaseRequestRecoveryDependentKeys)).toEqual(dependentBytesBefore);

  await reenterBuilderHomeAfterReload(page);
  await page.getByRole("button", { name: "درخواست قیمت" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("purchase-request-read-error")).toHaveCount(0);
  await expect(page.getByTestId("purchase-request-card")).toContainText("درخواست تازه پس از بازیابی امن");
  expect(await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "[]"), purchaseRequestRecoverySourceKey)).toHaveLength(1);
  expect(await readExactLocalStorageSnapshot(page, purchaseRequestRecoveryDependentKeys)).toEqual(dependentBytesBefore);
  expect(await readPurchaseRequestRecoveryBackups(page)).toEqual(backupsAfterRecovery);
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
  await page.getByTestId("purchase-request-more-actions").locator("summary").click();
  await page.getByTestId("purchase-request-mark-ready-legacy").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("آمادهٔ ادامه");

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
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("آمادهٔ ادامه");

  await page.evaluate(() => {
    Storage.prototype.setItem = (window as Window & { __purchaseRequestNativeSetItem: typeof Storage.prototype.setItem }).__purchaseRequestNativeSetItem;
    delete (window as Window & { __purchaseRequestNativeSetItem?: typeof Storage.prototype.setItem }).__purchaseRequestNativeSetItem;
  });
  await page.getByTestId("purchase-request-return-draft").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("در حال تکمیل");
  await expect(page.getByTestId("purchase-request-detail-heading")).toBeFocused();
  await expect(page.getByTestId("purchase-request-history-event")).toHaveCount(0);
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
  await expect(page.getByTestId("purchase-request-approval-status")).toContainText("منتظر تأیید");
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
  await expect(approvalDetail).toContainText("منتظر تصمیم شما");
  await expect(approvalDetail).toContainText("۵ تن");
  await expect(approvalDetail).toContainText("حمل");
  await expect(approvalDetail).toContainText("نامشخص");
  await expect(approvalDetail).not.toContainText("هیچ مقصد بیرونی انتخاب نشده");
  await expect(page.getByTestId("project-approval-approve")).toHaveAccessibleDescription(/اطلاعات را بررسی کن/);
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
  await expect(approvalCard).not.toContainText("نسخهٔ درخواست ۲");
  await expect(approvalCard).toHaveAccessibleName(/منتظر تأیید/);
  await expect(approvalCard).toBeFocused();
  await approvalCard.click();

  await page.getByTestId("project-approval-approve").click();
  await expect(approvalDetail).toContainText("درخواست تأیید شد");
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
  await expect(page.getByTestId("project-approval-card")).toContainText("درخواست تأیید شد");
  await expect(page.getByTestId("project-approval-card")).toHaveAccessibleName(/تأیید/);
  await page.getByTestId("project-tasks-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await expect(page.getByTestId("purchase-request-approval-status")).toContainText("اطلاعات درخواست تأیید شده");
  await expect(page.getByTestId("purchase-request-open-dispatch")).toBeVisible();
  await expect(page.getByTestId("purchase-request-request-approval")).toHaveCount(0);
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
  await expect(page.getByTestId("purchase-request-request-approval")).toContainText("مشاهده در کارها");
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
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("در حال تکمیل");

  await page.getByTestId("purchase-request-edit").click();
  await page.getByTestId("purchase-request-item-input").fill("میلگرد آجدار اصلاح‌شده");
  await page.getByTestId("purchase-request-save").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("در حال تکمیل");
  await page.getByTestId("purchase-request-more-actions").locator("summary").click();
  await page.getByTestId("purchase-request-mark-ready-legacy").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("آمادهٔ ادامه");
  await expect(page.getByTestId("purchase-request-approval-status")).toContainText("منتظر تأیید");
  await page.getByTestId("purchase-request-request-approval").click();
  await expect(page.getByTestId("project-approval-detail-view")).toContainText("منتظر تصمیم شما");

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
  await expect(page.getByTestId("project-approval-status")).toContainText("منتظر تصمیم شما");
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
  await page.getByTestId("purchase-request-more-actions").locator("summary").click();
  await page.getByTestId("purchase-request-mark-ready-legacy").click();
  await expect(page.getByTestId("purchase-request-approval-status")).toContainText("وضعیت تأیید کامل خوانده نشد");
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
  await expect(page.getByTestId("project-approval-card")).toContainText("اطلاعات درخواست تأیید شد");
  await expect(page.getByTestId("project-approval-card")).toHaveAccessibleName(/تأیید/);
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
  await page.getByTestId("purchase-request-more-actions").locator("summary").click();
  await page.getByTestId("purchase-request-mark-ready-legacy").click();
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
  await page.getByTestId("purchase-request-more-actions").locator("summary").click();
  await page.getByTestId("purchase-request-mark-ready-legacy").click();
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
  await page.getByTestId("purchase-request-more-actions").locator("summary").click();
  await page.getByTestId("purchase-request-mark-ready-legacy").click();

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

  await expect(page.getByTestId("dispatch-preview-banner")).toContainText("تا تأیید نهایی در «کارها» چیزی ارسال نمی‌شود");
  await expect(page.getByTestId("dispatch-human-share-summary")).toContainText("میلگرد آجدار");
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
  await expect(page.getByTestId("dispatch-selected-count")).toContainText("۱ تأمین‌کننده انتخاب شده");
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
  await expect(page.getByTestId("purchase-request-open-dispatch")).toHaveCount(0);

  await page.getByTestId("purchase-request-request-approval").click();
  await page.getByTestId("project-approval-detail-back").click();
  await page.getByTestId("project-tasks-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await expect(page.getByTestId("purchase-request-open-dispatch")).toHaveCount(0);
  await page.getByTestId("purchase-request-request-approval").click();
  await page.getByTestId("project-approval-approve").click();
  await page.getByTestId("project-approval-detail-back").click();
  await expect(page.getByTestId("purchase-request-open-dispatch")).toBeVisible();

  await page.getByTestId("purchase-request-return-draft").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("در حال تکمیل");
  await expect(page.getByTestId("purchase-request-open-dispatch")).toHaveCount(0);
  await expect(page.getByTestId("project-dispatch-planner-view")).toHaveCount(0);
});

test("T6-C versions recipient changes, keeps archived history, and treats an unchanged selection as a no-op", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openApprovedPurchaseRequestDispatch(page);
  await addLocalSupplierContact(page, { name: "فولاد یک", category: "میلگرد", coverage: "منطقه ۲", capability: "product" });
  await addLocalSupplierContact(page, { name: "فولاد دو", category: "میلگرد", coverage: "منطقه ۵", capability: "product" });
  await expect(page.getByTestId("dispatch-selected-count")).toContainText("۲ تأمین‌کننده انتخاب شده");
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
  await firstContactCard.locator("summary").click();
  await firstContactCard.getByTestId("supplier-contact-status").click();
  await expect(firstContactCard).toContainText("قابل انتخاب نیست");
  await expect(page.getByTestId("dispatch-selected-count")).toContainText("۱ تأمین‌کننده انتخاب شده");
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
  await expect(page.getByTestId("project-dispatch-planner-view")).toBeVisible();
  await page.getByTestId("dispatch-technical-details").locator("summary").click();

  await expect(page.getByTestId("supplier-contact-empty")).toContainText("هنوز تأمین‌کننده‌ای ثبت نشده");
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
  await expect(page.getByTestId("project-dispatch-planner-view")).toBeVisible();
  await page.getByTestId("dispatch-technical-details").locator("summary").click();

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
      await expect(page.getByTestId("dispatch-selected-count")).toContainText("۱ تأمین‌کننده انتخاب شده");
      await expect(page.getByTestId("dispatch-draft-save")).toBeDisabled();
    }
    expect(await page.evaluate(() => (window as Window & { __t6cReadFailureWriteAttempts: number }).__t6cReadFailureWriteAttempts)).toBe(0);
  });
}

test("fast purchase flow sends the final decision to Tasks without attempting a network send", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const networkRequests: string[] = [];
  await openApprovedPurchaseRequestDispatch(page);
  page.on("request", (request) => {
    const protocol = new URL(request.url()).protocol;
    if (protocol === "http:" || protocol === "https:") networkRequests.push(request.url());
  });
  await addLocalSupplierContact(page, { name: "فولاد سریع", category: "میلگرد", coverage: "غرب تهران", capability: "product" });
  await expect(page.getByTestId("dispatch-human-share-summary")).toContainText("فولاد سریع");
  await page.getByTestId("dispatch-submit-to-tasks").click();

  await expect(page.getByTestId("project-dispatch-plan-approval-detail-view")).toBeVisible();
  await expect(page.getByTestId("project-dispatch-plan-approval-heading")).toContainText("میلگرد آجدار");
  await expect(page.getByTestId("dispatch-plan-approval-status")).toContainText("منتظر تأیید نهایی");
  await expect(page.getByTestId("project-dispatch-plan-approval-technical")).not.toHaveAttribute("open", "");

  const pending = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-plan-approvals:v1") ?? "[]")[0]);
  expect(pending).toMatchObject({ status: "pending", simulationOnly: true, externalEffect: "none", sendAuthorized: false, externalActionAttempted: false });
  await page.getByTestId("dispatch-plan-approval-approve").click();
  await expect(page.getByTestId("dispatch-plan-approval-status")).toContainText("تأیید نهایی ثبت شد");
  await expect(page.getByTestId("dispatch-plan-approval-status")).toContainText("در این نمونه چیزی ارسال نشد");
  const approved = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-dispatch-plan-approvals:v1") ?? "[]")[0]);
  expect(approved).toMatchObject({ status: "approved", simulationOnly: true, externalEffect: "none", sendAuthorized: false, externalActionAttempted: false });
  expect(networkRequests).toEqual([]);
  expect(await page.getByTestId("project-dispatch-plan-approval-detail-view").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
});

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
  await removedContact.locator("summary").click();
  await removedContact.getByTestId("supplier-contact-status").click();
  await expect(page.getByTestId("dispatch-selected-count")).toContainText("۱ تأمین‌کننده انتخاب شده");
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
  await expect(page.getByTestId("proposal-inbox-honesty")).toContainText("خصوصی و دستی");
  await page.getByTestId("proposal-add").click();
  await expect(page.getByTestId("proposal-editor-title")).toBeFocused();
  await expect(page.getByTestId("proposal-request-select")).not.toHaveValue("");
  await page.getByTestId("proposal-supplier-select").selectOption({ label: "فولاد پیشنهاد دستی · محصول" });
  await openProposalAdvancedMode(page);
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
  await expect(page.getByTestId("proposal-effective-status")).toHaveText("جاری");
  await openProposalDetailReference(page);
  await expect(page.getByTestId("proposal-reference")).toContainText("نام و مشخصات این فایل");
  await openProposalDetailConditions(page);
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
  await openProposalAdvancedMode(page);
  await page.getByTestId("proposal-transcript").fill("مجری روش جایگزین و موعد ده روزه را اعلام کرد.");
  await page.getByTestId("proposal-line-status-0").selectOption("alternative");
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
  await openProposalAdvancedMode(page);
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
  await openProposalAdvancedMode(page);
  await page.getByTestId("proposal-notes").fill("برای بازبینی شرایط پرداخت");
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-detail-hero")).toBeFocused();
  const versioned = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]")[0]);
  expect(versioned.version).toBe(2);
  expect(versioned.revisions).toHaveLength(2);
  expect(versioned.history.map((event: { type: string }) => event.type)).toEqual(["created", "updated"]);
  await openProposalDetailTechnical(page);
  await expect(page.getByTestId("proposal-revision-select")).toBeVisible();
  await page.getByTestId("proposal-revision-select").selectOption({ index: 1 });
  await expect(page.getByTestId("proposal-revision-select")).toContainText("نسخهٔ ۱ · تاریخی");

  await page.getByTestId("proposal-detail-back").click();
  await page.getByTestId("proposals-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await page.getByTestId("purchase-request-open-dispatch").click();
  const historicalProposalContact = page.getByTestId("supplier-contact-card").filter({ hasText: "فولاد تاریخچه پیشنهاد" });
  await historicalProposalContact.locator("summary").click();
  await historicalProposalContact.getByTestId("supplier-contact-status").click();
  await returnFromDispatchToHome(page);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-card")).toContainText("نیازمند بررسی");
  await page.getByTestId("proposal-card").click();
  await expect(page.getByTestId("proposal-detail-hero")).toBeFocused();
  await expect(page.getByTestId("proposal-effective-status")).toHaveText("نیازمند بررسی");
  expect(await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]")[0])).toEqual(versioned);
});

test("T7-A rejects a coordinated proposal claimed to be created after its supplier contact was archived", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createTwoItemProductProposalPrerequisites(page, "فولاد ترتیب تماس");
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-add").click();
  await page.getByTestId("proposal-supplier-select").selectOption({ label: "فولاد ترتیب تماس · محصول" });
  await openProposalAdvancedMode(page);
  await page.getByTestId("proposal-transcript").fill("رونویسی معتبر پیش از آرشیو تماس");
  await page.getByTestId("proposal-save").click();
  await page.getByTestId("proposal-detail-back").click();
  await page.getByTestId("proposals-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await page.getByTestId("purchase-request-open-dispatch").click();
  const orderedProposalContact = page.getByTestId("supplier-contact-card").filter({ hasText: "فولاد ترتیب تماس" });
  await orderedProposalContact.locator("summary").click();
  await orderedProposalContact.getByTestId("supplier-contact-status").click();

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
  await expect(page.getByTestId("proposal-add")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(tamperedStore);
});

test("T7-A rejects a coordinated proposal claimed to be created after its request returned to draft", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createTwoItemProductProposalPrerequisites(page, "فولاد ترتیب درخواست");
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-add").click();
  await page.getByTestId("proposal-supplier-select").selectOption({ label: "فولاد ترتیب درخواست · محصول" });
  await openProposalAdvancedMode(page);
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
  await expect(page.getByTestId("proposal-add")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(tamperedStore);
});

test("T7-A preserves exact decimal strings and rejects a coordinated repeated semantic revision", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createTwoItemProductProposalPrerequisites(page, "فولاد اعداد دقیق");
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-add").click();
  await page.getByTestId("proposal-supplier-select").selectOption({ label: "فولاد اعداد دقیق · محصول" });
  await openProposalAdvancedMode(page);
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
  await expect(page.getByTestId("proposal-add")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(tamperedStore);
});

test("T7-A fail-closes an otherwise well-formed unsupported supplier-contact update", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createTwoItemProductProposalPrerequisites(page, "فولاد تماس بدون revision");
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-add").click();
  await page.getByTestId("proposal-supplier-select").selectOption({ label: "فولاد تماس بدون revision · محصول" });
  await openProposalAdvancedMode(page);
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
  await expect(page.getByTestId("proposal-add")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(proposalStore);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-supplier-contacts:v1"))).toBe(contactStore);
});

test("T7-A rolls back failed writes and fails closed on a tampered proposal record", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createTwoItemProductProposalPrerequisites(page, "فولاد خطای ذخیره");
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-add").click();
  await page.getByTestId("proposal-supplier-select").selectOption({ label: "فولاد خطای ذخیره · محصول" });
  await openProposalAdvancedMode(page);
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
  await openProposalAdvancedMode(page);
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
  await expect(page.getByTestId("proposal-effective-status")).toHaveText("جاری");
  await openProposalDetailTechnical(page);
  await expect(page.getByTestId("proposal-history")).toContainText("نسخهٔ ۱");
  await page.getByTestId("proposal-edit").click();
  await openProposalAdvancedMode(page);
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
  await expect(page.getByTestId("proposal-add")).toHaveCount(0);
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
  await expect(page.getByTestId("proposal-add")).toHaveCount(0);
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

  await openProposalSecondaryView(page, "proposal-comparisons-entry");
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
  await openProposalSecondaryView(page, "proposal-comparisons-entry");
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

  await openProposalSecondaryView(page, "proposal-comparisons-entry");
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

  await openProposalSecondaryView(page, "proposal-comparisons-entry");
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
  await expect(page.getByTestId("comparison-detail-hero")).toContainText("جاری");

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

  await openDisclosure(page.getByTestId("comparison-technical-details"));
  await expect(page.getByTestId("comparison-revision-select")).toBeVisible();
  await page.getByTestId("comparison-revision-select").selectOption(comparisonV1.revisions[0].id);
  await expect(page.getByTestId("comparison-detail-hero")).toContainText("نسخه قدیمی · فقط مشاهده");
  await expect(page.getByTestId("comparison-decision-history")).toContainText("نسخهٔ نخست تصمیم برای ادامهٔ بررسی پیشنهاد ب");
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1"))).toBe(comparisonV2Store);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-proposal-comparison-decisions:v1"))).toBe(decisionV1Store);

  await page.getByTestId("comparison-detail-back").click();
  await page.getByTestId("comparisons-back").click();
  await page.getByTestId("proposal-card").filter({ hasText: firstSupplier }).click();
  await page.getByTestId("proposal-edit").click();
  await openProposalAdvancedMode(page);
  await page.getByTestId("proposal-notes").fill("نسخهٔ تازهٔ پیشنهاد پس از ثبت مقایسه");
  await page.getByTestId("proposal-save").click();
  await openProposalDetailTechnical(page);
  await expect(page.getByTestId("proposal-revision-select")).toContainText("نسخهٔ ۲ · جاری");
  await page.getByTestId("proposal-detail-back").click();
  await openProposalSecondaryView(page, "proposal-comparisons-entry");
  await expect(page.getByTestId("comparison-card")).toContainText("نیازمند بازبینی");
  await page.getByTestId("comparison-card").click();
  await expect(page.getByTestId("comparison-detail-hero")).toContainText("نیازمند بررسی");
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

  await openProposalSecondaryView(page, "proposal-comparisons-entry");
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
  await openProposalSecondaryView(page, "proposal-comparisons-entry");
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

  await openProposalSecondaryView(page, "service-proposal-comparisons-entry");
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
  await openProposalSecondaryView(page, "service-proposal-comparisons-entry");
  await expect(page.getByTestId("service-comparison-card")).toHaveCount(1);
  await page.getByTestId("service-comparison-card").click();
  await expect(page.getByTestId("service-comparison-detail-hero")).toBeFocused();
  await openServiceComparisonCriterion(page, "scope");
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

  await openProposalSecondaryView(page, "service-proposal-comparisons-entry");
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
  await expect(page.getByTestId("service-comparison-detail-hero")).toContainText("جاری");
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
  await expect(page.getByTestId("service-comparison-detail-hero")).toContainText("نسخه قدیمی · فقط مشاهده");
  await expect(page.getByTestId("service-comparison-decision-history")).toContainText("نسخه نخست تصمیم برای ادامه بررسی مجری ب");
  await expect(page.getByTestId("service-comparison-decision-save")).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparisons:v1"))).toBe(comparisonV2Store);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-service-proposal-comparison-decisions:v1"))).toBe(decisionV1Store);

  await page.getByTestId("service-comparison-detail-back").click();
  await page.getByTestId("service-comparisons-back").click();
  await page.getByTestId("proposal-card").filter({ hasText: firstSupplier }).click();
  await page.getByTestId("proposal-edit").click();
  await openProposalAdvancedMode(page);
  await page.getByTestId("proposal-notes").fill("نسخه تازه پیشنهاد خدمت پس از ثبت ماتریس");
  await page.getByTestId("proposal-save").click();
  await openProposalDetailTechnical(page);
  await expect(page.getByTestId("proposal-revision-select")).toContainText("نسخهٔ ۲ · جاری");
  await page.getByTestId("proposal-detail-back").click();
  await openProposalSecondaryView(page, "service-proposal-comparisons-entry");
  await expect(page.getByTestId("service-comparison-card")).toContainText("نیازمند بازبینی");
  await page.getByTestId("service-comparison-card").click();
  await expect(page.getByTestId("service-comparison-detail-hero")).toContainText("نیازمند بررسی");
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

  await openProposalSecondaryView(page, "service-proposal-comparisons-entry");
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
  await openProposalSecondaryView(page, "service-proposal-comparisons-entry");
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

test("T8-A1 also pins a product-line question to the exact compared proposal revision", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const prerequisites = await createExactProductComparisonWithDecision(page);
  const sourceStoresBeforeDraft = await commercialSourceStoreBytes(page);
  const comparison = JSON.parse(sourceStoresBeforeDraft.productComparisons ?? "[]")[0];
  const comparisonRevision = comparison.revisions.find((revision: { id: string }) => revision.id === comparison.currentRevisionId);
  const proposal = JSON.parse(sourceStoresBeforeDraft.proposals ?? "[]").find((item: { id: string }) => item.id === prerequisites.firstProposal.id);
  const proposalRevision = proposal.revisions.find((revision: { id: string }) => revision.id === proposal.currentRevisionId);
  const line = comparisonRevision.results.find((result: { proposalId: string }) => result.proposalId === proposal.id).lines[0];
  const start = await openProductComparisonLineForNegotiation(page, proposal.id, line.requestItemId);
  await expect(start).toHaveCount(1);
  await start.click();
  await expect(page.getByTestId("negotiation-draft-target")).toContainText(prerequisites.firstSupplier);
  await expect(page.getByTestId("negotiation-draft-target")).toContainText(line.requestLabel);
  await openDisclosure(page.getByTestId("negotiation-draft-boundary"));
  await expect(page.getByTestId("negotiation-draft-boundary")).toContainText("sendAuthorized=false");
  await page.getByTestId("negotiation-draft-purpose").fill("روشن شدن شرایط قلم محصول پیش از ادامه بررسی");
  await page.getByTestId("negotiation-draft-message").fill("لطفاً اعتبار قیمت و زمان آماده‌سازی همین قلم را دقیق اعلام کنید.");
  await page.getByTestId("negotiation-draft-save").click();
  await expect(page.getByTestId("negotiation-draft-detail-hero")).toBeFocused();

  const stored = JSON.parse(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey) ?? "[]")[0];
  expect(stored.target).toMatchObject({
    comparisonKind: "product",
    comparisonId: comparison.id,
    comparisonVersion: comparisonRevision.version,
    comparisonRevisionId: comparisonRevision.id,
    comparisonRevisionFingerprint: comparisonRevision.fingerprint,
    proposalId: proposal.id,
    proposalVersion: proposalRevision.version,
    proposalRevisionId: proposalRevision.id,
    proposalRevisionFingerprint: proposalRevision.fingerprint,
    proposalLineId: line.proposalLineId,
    criterionKind: "product-line",
    criterionId: line.requestItemId,
    criterionLabel: line.requestLabel,
  });
  expect(await commercialSourceStoreBytes(page)).toEqual(sourceStoresBeforeDraft);
});

test("T8-A1 pins a private local question draft to one exact service comparison, proposal, and criterion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactServiceNegotiationDraft(page);
  if (!created.projectId) throw new Error("Active project is unavailable for the T8-A1 isolation oracle");

  await openDisclosure(page.getByTestId("negotiation-draft-boundary"));
  await expect(page.getByTestId("negotiation-draft-detail")).toContainText("پیش‌نویس محلی · ارسال نشده");
  await expect(page.getByTestId("negotiation-draft-detail")).toContainText("ثبت مستقیم سازنده");
  await expect(page.getByTestId("negotiation-draft-detail")).toContainText(created.values.purpose);
  await expect(page.getByTestId("negotiation-draft-detail")).toContainText(created.values.message);
  await expect(page.getByTestId("negotiation-draft-boundary")).toContainText("externalEffect=none");
  expect(await page.getByTestId("negotiation-draft-detail").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

  expect(created.record).toMatchObject({
    schemaVersion: 1,
    projectId: created.projectId,
    purpose: "record-local-post-proposal-negotiation-question",
    status: "draft",
    target: {
      comparisonKind: "service",
      comparisonId: created.comparison.id,
      comparisonVersion: created.comparisonRevision.version,
      comparisonRevisionId: created.comparisonRevision.id,
      comparisonRevisionFingerprint: created.comparisonRevision.fingerprint,
      requestId: created.comparison.target.requestId,
      requestVersion: created.comparison.target.requestVersion,
      reviewRevisionId: created.comparison.target.reviewRevisionId,
      reviewRevisionFingerprint: created.comparison.target.reviewRevisionFingerprint,
      proposalId: created.proposal.id,
      proposalVersion: created.proposalRevision.version,
      proposalRevisionId: created.proposalRevision.id,
      proposalRevisionFingerprint: created.proposalRevision.fingerprint,
      proposalLineId: created.comparisonRevision.inputs.find((input: { proposalId: string }) => input.proposalId === created.proposal.id).proposalLineId,
      criterionKind: "service-criterion",
      criterionId: "timing",
      criterionLabel: "مدت و زمان اجرا",
      supplierSnapshot: created.comparisonRevision.inputs.find((input: { proposalId: string }) => input.proposalId === created.proposal.id).supplierSnapshot,
    },
    source: "ثبت مستقیم سازنده",
    visibility: "خصوصی پروژه",
    localStatus: "پیش‌نویس محلی",
    externalEffect: "none",
    networkUsed: false,
    aiUsed: false,
    sendAuthorized: false,
    supplierNotified: false,
    sharedWithSupplier: false,
    externalActionAttempted: false,
    version: 1,
  });
  const revision = created.record.revisions.find((item: { id: string }) => item.id === created.record.currentRevisionId);
  expect(revision).toMatchObject({ version: 1, purpose: created.values.purpose, message: created.values.message });
  expect(created.record.revisions).toHaveLength(1);
  expect(created.record.history.map((event: { type: string }) => event.type)).toEqual(["created"]);
  expect(created.record).not.toHaveProperty("sentAt");
  expect(created.record).not.toHaveProperty("deliveredAt");
  expect(created.record).not.toHaveProperty("apiRequestId");
  expect(await commercialSourceStoreBytes(page)).toEqual(created.sourceStoresBeforeDraft);

  await page.getByTestId("negotiation-draft-detail-back").click();
  const existingTargetAction = serviceNegotiationDraftStart(page, "timing", created.proposal.id);
  await expect(existingTargetAction).toBeFocused();
  await expect(existingTargetAction).toContainText("بازکردن یا ساخت");
  await existingTargetAction.click();
  await expect(page.getByTestId("negotiation-draft-editor")).toHaveCount(0);
  await expect(page.getByTestId("negotiation-draft-detail-hero")).toBeFocused();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(created.draftStore);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  expect(await page.getByTestId("negotiation-drafts-view").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  await expect(page.getByTestId("negotiation-draft-card")).toHaveCount(1);
  await page.getByTestId("negotiation-draft-card").click();
  await expect(page.getByTestId("negotiation-draft-detail-hero")).toBeFocused();
  await expect(page.getByTestId("negotiation-draft-detail")).toContainText(created.values.message);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(created.draftStore);

  await page.evaluate(() => {
    const projects = JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]");
    projects.push({ id: "t8a1-isolation-project-b", name: "پروژه مستقل مذاکره", location: "منطقهٔ ۲", stage: "فونداسیون", usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-29T00:00:00.000Z" });
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify(projects));
    window.localStorage.setItem("chida-prototype-active-project", "t8a1-isolation-project-b");
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-card")).toHaveCount(0);
  await expect(page.getByTestId("negotiation-draft-empty-state")).toBeVisible();
  expect(JSON.parse(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey) ?? "[]")).toHaveLength(1);

  await page.evaluate((firstProjectId) => window.localStorage.setItem("chida-prototype-active-project", firstProjectId), created.projectId);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-card")).toHaveCount(1);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(created.draftStore);
  expect(await commercialSourceStoreBytes(page)).toEqual(created.sourceStoresBeforeDraft);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A1 keeps no-op bytes stable and versions only a semantic question edit with immutable history", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactServiceNegotiationDraft(page);
  const v1 = created.record;

  await page.getByTestId("negotiation-draft-edit").click();
  await expect(page.getByTestId("negotiation-draft-editor-title")).toBeFocused();
  await page.getByTestId("negotiation-draft-save").click();
  await expect(page.getByTestId("negotiation-draft-detail")).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(created.draftStore);

  const editedMessage = "لطفاً تاریخ دقیق تجهیز کارگاه، شروع و مدت اجرای عایق را جداگانه اعلام کنید.";
  await page.getByTestId("negotiation-draft-edit").click();
  await page.getByTestId("negotiation-draft-message").fill(editedMessage);
  await page.getByTestId("negotiation-draft-save").click();
  await expect(page.getByTestId("negotiation-draft-detail-hero")).toContainText("آمادهٔ پیگیری");
  await openContainingDisclosure(page.getByTestId("negotiation-draft-history"));
  await expect(page.getByTestId("negotiation-draft-history")).toContainText(created.values.message);
  await expect(page.getByTestId("negotiation-draft-history")).toContainText(editedMessage);

  const v2Store = await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey);
  const v2 = JSON.parse(v2Store ?? "[]")[0];
  expect(v2Store).not.toBe(created.draftStore);
  expect(v2.version).toBe(2);
  expect(v2.history.map((event: { type: string }) => event.type)).toEqual(["created", "updated"]);
  expect(v2.revisions).toHaveLength(2);
  expect(v2.revisions[0]).toEqual(v1.revisions[0]);
  expect(v2.revisions[1]).toMatchObject({ version: 2, purpose: created.values.purpose, message: editedMessage });
  expect(v2.currentRevisionId).toBe(v2.revisions[1].id);

  await page.getByTestId("negotiation-draft-revision-select").selectOption(v1.revisions[0].id);
  await expect(page.getByTestId("negotiation-draft-detail-hero")).toContainText("نسخهٔ قدیمی");
  await expect(page.getByTestId("negotiation-draft-detail")).toContainText(created.values.message);
  await expect(page.getByTestId("negotiation-draft-edit")).toBeDisabled();
  await page.getByTestId("negotiation-draft-revision-select").selectOption(v2.currentRevisionId);
  await expect(page.getByTestId("negotiation-draft-detail")).toContainText(editedMessage);
  expect(await commercialSourceStoreBytes(page)).toEqual(created.sourceStoresBeforeDraft);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await page.getByTestId("negotiation-draft-card").click();
  await expect(page.getByTestId("negotiation-draft-detail")).toContainText(editedMessage);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(v2Store);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A1 rolls back a failed question write and treats an unreadable draft store as locked, not empty", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const prerequisites = await createCompleteServiceComparisonWithDecision(page);
  const sourceStoresBeforeDraft = await commercialSourceStoreBytes(page);
  const appOrigin = new URL(page.url()).origin;
  const externalRequests: string[] = [];
  const requestListener = (request: Request) => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== appOrigin) externalRequests.push(request.url());
  };
  page.on("request", requestListener);

  await openServiceComparisonCriterion(page, "timing");
  const originAction = serviceNegotiationDraftStart(page, "timing", prerequisites.firstProposal.id);
  await originAction.click();
  await page.getByTestId("negotiation-draft-editor-back").click();
  await openServiceComparisonCriterion(page, "timing");
  await expect(originAction).toBeVisible();
  await originAction.click();
  await page.getByTestId("negotiation-draft-save").click();
  await expect(page.getByTestId("negotiation-draft-purpose")).toBeFocused();
  await expect(page.getByTestId("negotiation-draft-purpose")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("negotiation-draft-purpose")).toHaveAttribute("aria-describedby", "negotiation-draft-form-error");
  await page.getByTestId("negotiation-draft-purpose").fill("دریافت موعد قطعی برای بررسی ریسک برنامه");
  await page.getByTestId("negotiation-draft-message").fill("تاریخ قطعی شروع و مدت اجرا را اعلام کنید.");
  await page.evaluate((key) => {
    const nativeSetItem = Storage.prototype.setItem;
    Object.defineProperty(window, "__negotiationDraftNativeSetItem", { value: nativeSetItem, configurable: true });
    Storage.prototype.setItem = function setItem(storageKey: string, value: string) {
      if (this === window.localStorage && storageKey === key) throw new DOMException("Negotiation draft write failed", "QuotaExceededError");
      return nativeSetItem.call(this, storageKey, value);
    };
  }, negotiationDraftStorageKey);
  await page.getByTestId("negotiation-draft-save").click();
  await expect(page.getByTestId("negotiation-draft-editor")).toBeVisible();
  await expect(page.getByTestId("negotiation-draft-form-error")).toContainText("سؤال ثبت نشد");
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBeNull();
  expect(await commercialSourceStoreBytes(page)).toEqual(sourceStoresBeforeDraft);

  await page.evaluate(() => {
    Storage.prototype.setItem = (window as Window & { __negotiationDraftNativeSetItem: typeof Storage.prototype.setItem }).__negotiationDraftNativeSetItem;
  });
  await page.getByTestId("negotiation-draft-save").click();
  await expect(page.getByTestId("negotiation-draft-detail")).toBeVisible();
  const validDraftStore = await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey);
  expect(JSON.parse(validDraftStore ?? "[]")).toHaveLength(1);

  await page.addInitScript((key) => {
    const nativeGetItem = Storage.prototype.getItem;
    Object.defineProperty(window, "__negotiationDraftNativeGetItem", { value: nativeGetItem, configurable: true });
    Storage.prototype.getItem = function getItem(storageKey: string) {
      if (this === window.localStorage && storageKey === key) throw new DOMException("Negotiation draft read failed", "SecurityError");
      return nativeGetItem.call(this, storageKey);
    };
  }, negotiationDraftStorageKey);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-card")).toHaveCount(2);
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-storage-error")).toBeVisible();
  await expect(page.getByTestId("negotiation-draft-card")).toHaveCount(0);
  await expect(page.getByTestId("negotiation-draft-empty-state")).toHaveCount(0);
  await page.getByTestId("negotiation-drafts-back").click();
  await openProposalSecondaryView(page, "service-proposal-comparisons-entry");
  await expect(page.getByTestId("service-comparison-card")).toHaveCount(1);
  await page.getByTestId("service-comparison-card").click();
  await expect(page.getByTestId("negotiation-draft-storage-error")).toBeVisible();
  await expect(page.getByTestId("negotiation-draft-start").first()).toBeDisabled();
  expect(await commercialSourceStoreBytes(page)).toEqual(sourceStoresBeforeDraft);
  expect(await page.evaluate((key) => (window as Window & { __negotiationDraftNativeGetItem: typeof Storage.prototype.getItem }).__negotiationDraftNativeGetItem.call(window.localStorage, key), negotiationDraftStorageKey)).toBe(validDraftStore);
  expect(externalRequests).toEqual([]);
  page.off("request", requestListener);
});

test("T8-A1 fail-closes non-canonical draft history without silently rewriting its bytes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactServiceNegotiationDraft(page);
  const tamperedDraftStore = await page.evaluate((key) => {
    const records = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    records[0].history[0].id = `${records[0].history[0].id} `;
    window.localStorage.setItem(key, JSON.stringify(records));
    return window.localStorage.getItem(key);
  }, negotiationDraftStorageKey);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-storage-error")).toBeVisible();
  await expect(page.getByTestId("negotiation-draft-card")).toHaveCount(0);
  await expect(page.getByTestId("negotiation-draft-empty-state")).toHaveCount(0);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(tamperedDraftStore);
  expect(await commercialSourceStoreBytes(page)).toEqual(created.sourceStoresBeforeDraft);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A1 invalidates stale dependencies and fail-closes a tampered target fingerprint without rewriting sources", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactServiceNegotiationDraft(page);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "service-proposal-comparisons-entry");
  await page.getByTestId("service-comparison-card").click();
  await page.getByTestId("service-comparison-edit").click();
  await serviceComparisonAssessmentEditor(page, "timing", created.firstSupplier).getByTestId("service-comparison-declared-value").fill("شروع قطعی ظرف سه روز و اجرای شش روزه");
  await page.getByTestId("service-comparison-save").click();
  await expect(page.getByTestId("service-comparison-detail-hero")).toContainText("جاری");
  const sourceStoresAfterInvalidation = await commercialSourceStoreBytes(page);
  expect(sourceStoresAfterInvalidation.proposals).toBe(created.sourceStoresBeforeDraft.proposals);
  expect(sourceStoresAfterInvalidation.requests).toBe(created.sourceStoresBeforeDraft.requests);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(created.draftStore);

  await page.getByTestId("service-comparison-detail-back").click();
  await page.getByTestId("service-comparisons-back").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-card")).toContainText("نیازمند بررسی دوباره");
  await page.getByTestId("negotiation-draft-card").click();
  await expect(page.getByTestId("negotiation-draft-detail-hero")).toContainText("نیازمند بررسی دوباره");
  await expect(page.getByTestId("negotiation-draft-detail")).toContainText(created.values.message);
  await expect(page.getByTestId("negotiation-draft-edit")).toBeDisabled();

  const tamperedDraftStore = await page.evaluate((key) => {
    const records = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    records[0].target.comparisonRevisionFingerprint = "fnv1a-deadbeef";
    window.localStorage.setItem(key, JSON.stringify(records));
    return window.localStorage.getItem(key);
  }, negotiationDraftStorageKey);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-storage-error")).toBeVisible();
  await expect(page.getByTestId("negotiation-draft-card")).toHaveCount(0);
  await expect(page.getByTestId("negotiation-draft-empty-state")).toHaveCount(0);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(tamperedDraftStore);
  expect(await commercialSourceStoreBytes(page)).toEqual(sourceStoresAfterInvalidation);

  await page.getByTestId("negotiation-drafts-back").click();
  await expect(page.getByTestId("proposal-card")).toHaveCount(2);
  await openProposalSecondaryView(page, "service-proposal-comparisons-entry");
  await expect(page.getByTestId("service-comparison-card")).toHaveCount(1);
  expect(await commercialSourceStoreBytes(page)).toEqual(sourceStoresAfterInvalidation);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A2 pins one private builder transcription to the exact service question revision without external effect", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationResponse(page);
  const questionRevision = created.record.revisions.find((item: { id: string }) => item.id === created.record.currentRevisionId);

  await expect(page.getByTestId("manual-negotiation-response-detail")).toContainText(created.responseText);
  await expect(page.getByTestId("manual-negotiation-response-message")).toHaveAttribute("dir", "auto");
  await openContainingDisclosure(page.getByTestId("manual-negotiation-response-history"));
  await expect(page.getByTestId("manual-negotiation-response-history").locator(".negotiation-draft-history-message")).toHaveAttribute("dir", "auto");
  await openDisclosure(page.getByTestId("manual-negotiation-response-boundary"));
  await expect(page.getByTestId("manual-negotiation-response-boundary")).toContainText("تأیید نشده · خارج از شبکهٔ چیدا");
  await expect(page.getByTestId("manual-negotiation-response-boundary")).toContainText("questionSentThroughChida=false");
  await expect(page.getByTestId("manual-negotiation-response-boundary")).toContainText("receivedThroughChida=false");
  expect(await page.getByTestId("manual-negotiation-response-detail").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

  expect(created.responseRecord).toMatchObject({
    schemaVersion: 1,
    projectId: created.projectId,
    purpose: "record-local-builder-transcribed-negotiation-response",
    status: "local-transcription",
    target: {
      negotiationDraftId: created.record.id,
      negotiationDraftRevisionId: questionRevision.id,
      negotiationDraftRevisionVersion: questionRevision.version,
      negotiationDraftRevisionFingerprint: questionRevision.fingerprint,
    },
    questionSnapshot: {
      purpose: questionRevision.purpose,
      message: questionRevision.message,
      createdAt: questionRevision.createdAt,
      negotiationTarget: created.record.target,
    },
    source: "ثبت دستی سازنده",
    networkStatus: "خارج از شبکه چیدا",
    supplierAuthenticated: false,
    authenticityVerified: false,
    questionSentThroughChida: false,
    receivedThroughChida: false,
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    externalEffect: "none",
    networkUsed: false,
    aiUsed: false,
    sendAuthorized: false,
    supplierNotified: false,
    sharedWithSupplier: false,
    externalActionAttempted: false,
    version: 1,
  });
  expect(created.responseRecord.revisions).toHaveLength(1);
  expect(created.responseRecord.revisions[0]).toMatchObject({ version: 1, responseText: created.responseText });
  expect(created.responseRecord.history.map((event: { type: string }) => event.type)).toEqual(["created"]);
  expect(created.responseRecord).not.toHaveProperty("receivedAt");
  expect(created.responseRecord).not.toHaveProperty("senderId");
  expect(created.responseRecord).not.toHaveProperty("messageId");
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(created.draftStore);
  expect(await commercialSourceStoreBytes(page)).toEqual(created.sourceStoresBeforeDraft);

  await page.getByTestId("manual-negotiation-response-detail-back").click();
  await expect(page.getByTestId("manual-negotiation-response-open")).toBeFocused();
  await expect(page.getByTestId("manual-negotiation-response-open")).toHaveAccessibleName(`بازکردن پاسخ ثبت‌شده برای مدت و زمان اجرا و ${created.firstSupplier}`);
  await page.getByTestId("manual-negotiation-response-open").click();
  await expect(page.getByTestId("manual-negotiation-response-detail-hero")).toBeFocused();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(created.responseStore);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A2 supports the same exact-response contract for a product-line question and keeps project isolation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const prerequisites = await createExactProductComparisonWithDecision(page);
  const sourceStoresBeforeResponse = await commercialSourceStoreBytes(page);
  const comparison = JSON.parse(sourceStoresBeforeResponse.productComparisons ?? "[]")[0];
  const comparisonRevision = comparison.revisions.find((revision: { id: string }) => revision.id === comparison.currentRevisionId);
  const proposal = JSON.parse(sourceStoresBeforeResponse.proposals ?? "[]").find((item: { id: string }) => item.id === prerequisites.firstProposal.id);
  const line = comparisonRevision.results.find((result: { proposalId: string }) => result.proposalId === proposal.id).lines[0];
  const start = await openProductComparisonLineForNegotiation(page, proposal.id, line.requestItemId);
  await start.click();
  await page.getByTestId("negotiation-draft-purpose").fill("ثبت پاسخ مرتبط با اعتبار قلم محصول");
  await page.getByTestId("negotiation-draft-message").fill("اعتبار قیمت این قلم تا چه تاریخی است؟");
  await page.getByTestId("negotiation-draft-save").click();
  await page.getByTestId("manual-negotiation-response-add").click();
  await page.getByTestId("manual-negotiation-response-text").fill("در تماس بیرونی گفته شد قیمت تا پایان هفته معتبر است.");
  await page.getByTestId("manual-negotiation-response-save").click();
  const responseStore = await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey);
  const response = JSON.parse(responseStore ?? "[]")[0];
  expect(response.questionSnapshot.negotiationTarget).toMatchObject({ comparisonKind: "product", proposalId: proposal.id, proposalLineId: line.proposalLineId, criterionKind: "product-line", criterionId: line.requestItemId, criterionLabel: line.requestLabel });
  expect(await commercialSourceStoreBytes(page)).toEqual(sourceStoresBeforeResponse);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-card")).toContainText("پاسخ ثبت شده");
  await page.getByTestId("negotiation-draft-card").click();
  await page.getByTestId("manual-negotiation-response-open").click();
  await expect(page.getByTestId("manual-negotiation-response-detail")).toContainText("پایان هفته معتبر است");

  const firstProjectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  await page.evaluate(() => {
    const projects = JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]");
    projects.push({ id: "t8a2-isolation-project-b", name: "پروژه مستقل پاسخ", location: "منطقهٔ ۴", stage: "فونداسیون", usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-29T00:00:00.000Z" });
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify(projects));
    window.localStorage.setItem("chida-prototype-active-project", "t8a2-isolation-project-b");
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-card")).toHaveCount(0);
  expect(JSON.parse(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey) ?? "[]")).toHaveLength(1);

  await page.evaluate((projectId) => window.localStorage.setItem("chida-prototype-active-project", projectId!), firstProjectId);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-card")).toHaveCount(1);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(responseStore);
});

test("T8-A2 keeps no-op bytes stable and versions only a semantic transcription correction", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationResponse(page);
  const v1 = created.responseRecord;

  await page.getByTestId("manual-negotiation-response-edit").click();
  await expect(page.getByTestId("manual-negotiation-response-editor-title")).toBeFocused();
  await page.getByTestId("manual-negotiation-response-save").click();
  await expect(page.getByTestId("manual-negotiation-response-detail")).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(created.responseStore);

  const corrected = "اصلاح رونویسی: مجری گفت تجهیز کارگاه سه روز کاری پس از توافق انجام می‌شود.";
  await page.getByTestId("manual-negotiation-response-edit").click();
  await page.getByTestId("manual-negotiation-response-text").fill(corrected);
  await page.getByTestId("manual-negotiation-response-save").click();
  await expect(page.getByTestId("manual-negotiation-response-message")).toHaveText(corrected);
  await openContainingDisclosure(page.getByTestId("manual-negotiation-response-history"));
  await expect(page.getByTestId("manual-negotiation-response-history")).toContainText(created.responseText);
  const v2Store = await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey);
  const v2 = JSON.parse(v2Store ?? "[]")[0];
  expect(v2Store).not.toBe(created.responseStore);
  expect(v2.version).toBe(2);
  expect(v2.history.map((event: { type: string }) => event.type)).toEqual(["created", "updated"]);
  expect(v2.revisions).toHaveLength(2);
  expect(v2.revisions[0]).toEqual(v1.revisions[0]);
  expect(v2.revisions[1]).toMatchObject({ version: 2, responseText: corrected });

  await page.getByTestId("manual-negotiation-response-revision-select").selectOption(v1.revisions[0].id);
  await expect(page.getByTestId("manual-negotiation-response-detail-hero")).toContainText("نسخهٔ قدیمی");
  await expect(page.getByTestId("manual-negotiation-response-edit")).toBeDisabled();
  await expect(page.getByTestId("manual-negotiation-response-message")).toHaveText(created.responseText);
  await page.getByTestId("manual-negotiation-response-revision-select").selectOption(v2.currentRevisionId);
  await expect(page.getByTestId("manual-negotiation-response-message")).toHaveText(corrected);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(created.draftStore);
  expect(await commercialSourceStoreBytes(page)).toEqual(created.sourceStoresBeforeDraft);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A2 rolls back failed writes and locks an unreadable response store without locking a healthy question", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const question = await createExactServiceNegotiationDraft(page);
  await page.getByTestId("manual-negotiation-response-add").click();
  await page.getByTestId("manual-negotiation-response-save").click();
  await expect(page.getByTestId("manual-negotiation-response-text")).toBeFocused();
  await expect(page.getByTestId("manual-negotiation-response-text")).toHaveAttribute("aria-invalid", "true");
  await page.getByTestId("manual-negotiation-response-text").fill("پاسخ رونویسی‌شده برای آزمون شکست ذخیره");
  await page.evaluate((key) => {
    const nativeSetItem = Storage.prototype.setItem;
    Object.defineProperty(window, "__manualResponseNativeSetItem", { value: nativeSetItem, configurable: true });
    Storage.prototype.setItem = function setItem(storageKey: string, value: string) {
      if (this === window.localStorage && storageKey === key) throw new DOMException("Manual response write failed", "QuotaExceededError");
      return nativeSetItem.call(this, storageKey, value);
    };
  }, manualNegotiationResponseStorageKey);
  await page.getByTestId("manual-negotiation-response-save").click();
  await expect(page.getByTestId("manual-negotiation-response-editor")).toBeVisible();
  await expect(page.getByTestId("manual-negotiation-response-form-error")).toContainText("پاسخ ثبت نشد");
  await expect(page.getByTestId("manual-negotiation-response-text")).toHaveAttribute("aria-invalid", "false");
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBeNull();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(question.draftStore);

  await page.evaluate(() => { Storage.prototype.setItem = (window as Window & { __manualResponseNativeSetItem: typeof Storage.prototype.setItem }).__manualResponseNativeSetItem; });
  await page.getByTestId("manual-negotiation-response-save").click();
  await expect(page.getByTestId("manual-negotiation-response-detail")).toBeVisible();
  const validResponseStore = await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey);
  await page.addInitScript((key) => {
    const nativeGetItem = Storage.prototype.getItem;
    Object.defineProperty(window, "__manualResponseNativeGetItem", { value: nativeGetItem, configurable: true });
    Storage.prototype.getItem = function getItem(storageKey: string) {
      if (this === window.localStorage && storageKey === key) throw new DOMException("Manual response read failed", "SecurityError");
      return nativeGetItem.call(this, storageKey);
    };
  }, manualNegotiationResponseStorageKey);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-card")).toHaveCount(1);
  await expect(page.getByTestId("negotiation-draft-card")).toContainText("وضعیت پاسخ نامشخص");
  await expect(page.getByTestId("negotiation-draft-card")).not.toContainText("منتظر ثبت پاسخ");
  await page.getByTestId("negotiation-draft-card").click();
  await expect(page.getByTestId("manual-negotiation-response-storage-error")).toBeVisible();
  await expect(page.getByTestId("manual-negotiation-response-add")).toHaveCount(0);
  await expect(page.getByTestId("manual-negotiation-response-open")).toHaveCount(0);
  await expect(page.getByTestId("negotiation-draft-edit")).toBeEnabled();
  expect(await page.evaluate((key) => (window as Window & { __manualResponseNativeGetItem: typeof Storage.prototype.getItem }).__manualResponseNativeGetItem.call(window.localStorage, key), manualNegotiationResponseStorageKey)).toBe(validResponseStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(question.draftStore);
  expect(await commercialSourceStoreBytes(page)).toEqual(question.sourceStoresBeforeDraft);
  expect(question.externalRequests).toEqual([]);
  page.off("request", question.requestListener);
});

test("T8-A2 fail-closes tampered response lineage without hiding or rewriting the healthy question", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationResponse(page);
  const tamperedResponseStore = await page.evaluate((key) => {
    const records = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    records[0].questionSnapshot.message = `${records[0].questionSnapshot.message} دست‌کاری`;
    window.localStorage.setItem(key, JSON.stringify(records));
    return window.localStorage.getItem(key);
  }, manualNegotiationResponseStorageKey);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-card")).toHaveCount(1);
  await page.getByTestId("negotiation-draft-card").click();
  await expect(page.getByTestId("negotiation-draft-detail")).toContainText(created.values.message);
  await expect(page.getByTestId("manual-negotiation-response-storage-error")).toBeVisible();
  await expect(page.getByTestId("negotiation-draft-edit")).toBeEnabled();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(tamperedResponseStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(created.draftStore);
  expect(await commercialSourceStoreBytes(page)).toEqual(created.sourceStoresBeforeDraft);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A2 keeps an old response historical after a question edit and creates a separate response for the new revision", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationResponse(page);
  const oldResponse = structuredClone(created.responseRecord);
  const oldQuestionRevisionId = created.record.currentRevisionId;
  await page.getByTestId("manual-negotiation-response-detail-back").click();
  await page.getByTestId("negotiation-draft-edit").click();
  const newQuestion = "لطفاً علاوه بر تاریخ شروع، مدت تجهیز کارگاه را هم جداگانه اعلام کنید.";
  await page.getByTestId("negotiation-draft-message").fill(newQuestion);
  await page.getByTestId("negotiation-draft-save").click();
  const questionV2 = JSON.parse(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey) ?? "[]")[0];
  expect(questionV2.version).toBe(2);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(created.responseStore);

  await openContainingDisclosure(page.getByTestId("negotiation-draft-revision-select"));
  await page.getByTestId("negotiation-draft-revision-select").selectOption(oldQuestionRevisionId);
  await expect(page.getByTestId("manual-negotiation-response-open")).toBeVisible();
  await page.getByTestId("manual-negotiation-response-open").click();
  await expect(page.getByTestId("manual-negotiation-response-detail-hero")).toContainText("نیازمند بررسی دوباره");
  await expect(page.getByTestId("manual-negotiation-response-edit")).toBeDisabled();
  await page.getByTestId("manual-negotiation-response-detail-back").click();
  await expect(page.getByTestId("manual-negotiation-response-open")).toBeFocused();

  await openContainingDisclosure(page.getByTestId("negotiation-draft-revision-select"));
  await page.getByTestId("negotiation-draft-revision-select").selectOption(questionV2.currentRevisionId);
  await expect(page.getByTestId("manual-negotiation-response-add")).toBeVisible();
  await page.getByTestId("manual-negotiation-response-add").click();
  await page.getByTestId("manual-negotiation-response-text").fill("برای سؤال جدید، بیرون از چیدا مدت تجهیز دو روز کاری اعلام شد.");
  await page.getByTestId("manual-negotiation-response-save").click();
  const responses = JSON.parse(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey) ?? "[]");
  expect(responses).toHaveLength(2);
  expect(responses[0]).toEqual(oldResponse);
  expect(responses[0].target.negotiationDraftRevisionId).toBe(oldQuestionRevisionId);
  expect(responses[1].target.negotiationDraftRevisionId).toBe(questionV2.currentRevisionId);
  expect(new Set(responses.map((record: { target: { negotiationDraftRevisionId: string } }) => record.target.negotiationDraftRevisionId)).size).toBe(2);
  expect(await commercialSourceStoreBytes(page)).toEqual(created.sourceStoresBeforeDraft);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A2 makes a response historical after an upstream comparison revision without rewriting its bytes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationResponse(page, "Builder ETA = 3 working days; ثبت دستی و تأییدنشده.");
  await expect(page.getByTestId("manual-negotiation-response-message")).toHaveAttribute("dir", "auto");

  await page.getByTestId("manual-negotiation-response-detail-back").click();
  await page.getByTestId("negotiation-draft-detail-back").click();
  await expect(page.getByTestId("service-comparison-detail")).toBeVisible();
  await page.getByTestId("service-comparison-edit").click();
  await serviceComparisonAssessmentEditor(page, "timing", created.firstSupplier).getByTestId("service-comparison-declared-value").fill("شروع قطعی ظرف چهار روز و اجرای شش روزه");
  await page.getByTestId("service-comparison-save").click();
  await expect(page.getByTestId("service-comparison-detail-hero")).toContainText("جاری");
  const sourceStoresAfterInvalidation = await commercialSourceStoreBytes(page);
  expect(sourceStoresAfterInvalidation.serviceComparisons).not.toBe(created.sourceStoresBeforeDraft.serviceComparisons);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(created.responseStore);

  await page.getByTestId("service-comparison-detail-back").click();
  await page.getByTestId("service-comparisons-back").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-card")).toContainText("نیازمند بررسی دوباره");
  await page.getByTestId("negotiation-draft-card").click();
  await expect(page.getByTestId("manual-negotiation-response-open")).toBeVisible();
  await page.getByTestId("manual-negotiation-response-open").click();
  await expect(page.getByTestId("manual-negotiation-response-detail-hero")).toContainText("نیازمند بررسی دوباره");
  await expect(page.getByTestId("manual-negotiation-response-edit")).toBeDisabled();
  await expect(page.getByTestId("manual-negotiation-response-message")).toHaveText(created.responseText);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(created.responseStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(created.draftStore);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A3 pins one explicit builder review to the exact service response revision without automated detection or external effect", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationResponseReview(page);
  const responseRevision = created.responseRecord.revisions.find((item: { id: string }) => item.id === created.responseRecord.currentRevisionId);

  await expect(page.getByTestId("manual-response-review-detail")).toContainText("این نتیجه را شما ثبت کرده‌اید");
  await expect(page.getByTestId("manual-response-review-detail")).toContainText("از نظر شما نیازمند روشن‌سازی است");
  await expect(page.getByTestId("manual-response-review-reason-text")).toHaveText(created.reviewValues.reason);
  await expect(page.getByTestId("manual-response-review-reason-text")).toHaveAttribute("dir", "auto");
  await openDisclosure(page.getByTestId("manual-response-review-boundary"));
  await expect(page.getByTestId("manual-response-review-boundary")).toContainText("automatedDetectionUsed=false");
  await expect(page.getByTestId("manual-response-review-boundary")).toContainText("aiUsed=false");
  await expect(page.getByTestId("manual-response-review-boundary")).toContainText("externalEffect=none");
  expect(await page.getByTestId("manual-response-review-detail").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

  expect(created.reviewRecord).toMatchObject({
    schemaVersion: 1,
    projectId: created.projectId,
    purpose: "record-local-builder-manual-response-review",
    status: "manual-review",
    target: {
      manualNegotiationResponseId: created.responseRecord.id,
      manualNegotiationResponseRevisionId: responseRevision.id,
      manualNegotiationResponseRevisionVersion: responseRevision.version,
      manualNegotiationResponseRevisionFingerprint: responseRevision.fingerprint,
    },
    source: "بازبینی مستقیم سازنده",
    reviewMethod: "manual",
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    automatedDetectionUsed: false,
    aiUsed: false,
    networkUsed: false,
    authenticityVerified: false,
    externalEffect: "none",
    sendAuthorized: false,
    supplierNotified: false,
    sharedWithSupplier: false,
    externalActionAttempted: false,
    version: 1,
  });
  expect(created.reviewRecord.revisions).toHaveLength(1);
  expect(created.reviewRecord.revisions[0]).toMatchObject({ version: 1, ...created.reviewValues });
  expect(created.reviewRecord.history.map((event: { type: string }) => event.type)).toEqual(["created"]);
  expect(created.reviewRecord).not.toHaveProperty("detectedConflict");
  expect(created.reviewRecord).not.toHaveProperty("modelOutput");
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(created.responseStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(created.draftStore);
  expect(await commercialSourceStoreBytes(page)).toEqual(created.sourceStoresBeforeDraft);

  await page.getByTestId("manual-response-review-edit").click();
  await expect(page.getByTestId("manual-response-review-editor-title")).toBeFocused();
  expect(await page.getByTestId("manual-response-review-editor").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  await page.getByTestId("manual-response-review-editor-back").click();
  await expect(page.getByTestId("manual-response-review-detail-hero")).toBeFocused();

  await page.getByTestId("manual-response-review-detail-back").click();
  await expect(page.getByTestId("manual-response-review-open")).toBeFocused();
  await expect(page.getByTestId("manual-response-review-open")).toHaveAccessibleName(`بازکردن نتیجهٔ پاسخ برای مدت و زمان اجرا و ${created.firstSupplier}`);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A3 keeps no-op bytes stable, versions semantic edits, and exposes historical review revisions read-only", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationResponseReview(page);

  await page.getByTestId("manual-response-review-edit").click();
  await expect(page.getByTestId("manual-response-review-editor-title")).toBeFocused();
  await page.getByTestId("manual-response-review-save").click();
  await expect(page.getByTestId("manual-response-review-detail")).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey)).toBe(created.reviewStore);

  const reasonV2 = "از نظر من پاسخ تازه با زمان اعلام‌شده در متن پیشنهاد تعارض احتمالی دارد و باید بیرون از چیدا روشن شود.";
  await page.getByTestId("manual-response-review-edit").click();
  await page.getByTestId("manual-response-review-outcome-potential-conflict").check();
  await page.getByTestId("manual-response-review-reason").fill(reasonV2);
  await page.getByTestId("manual-response-review-save").click();
  await expect(page.getByTestId("manual-response-review-detail")).toContainText("از نظر شما تعارض احتمالی دارد");
  await expect(page.getByTestId("manual-response-review-reason-text")).toHaveText(reasonV2);
  await openContainingDisclosure(page.getByTestId("manual-response-review-history"));
  const v2Store = await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey);
  const v2 = JSON.parse(v2Store ?? "[]")[0];
  expect(v2.version).toBe(2);
  expect(v2.revisions).toHaveLength(2);
  expect(v2.history.map((event: { type: string }) => event.type)).toEqual(["created", "updated"]);
  expect(v2.revisions[0]).toEqual(created.reviewRecord.revisions[0]);

  await page.getByTestId("manual-response-review-revision-select").selectOption(created.reviewRecord.currentRevisionId);
  await expect(page.getByTestId("manual-response-review-detail-hero")).toContainText("نسخهٔ قدیمی");
  await expect(page.getByTestId("manual-response-review-edit")).toBeDisabled();
  await expect(page.getByTestId("manual-response-review-reason-text")).toHaveText(created.reviewValues.reason);
  await page.getByTestId("manual-response-review-revision-select").selectOption(v2.currentRevisionId);
  await expect(page.getByTestId("manual-response-review-edit")).toBeEnabled();
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A3 validates explicit judgment, rolls back failed writes, and isolates an unreadable review store from the healthy response", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await createExactManualNegotiationResponse(page);
  await page.getByTestId("manual-response-review-add").click();
  await page.getByTestId("manual-response-review-save").click();
  await expect(page.getByTestId("manual-response-review-outcome-appears-addressed")).toBeFocused();
  await expect(page.getByTestId("manual-response-review-outcome-group")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("manual-response-review-outcome-group")).toHaveAttribute("aria-describedby", "manual-response-review-form-error");
  await expect(page.getByTestId("manual-response-review-reason")).toHaveAttribute("aria-invalid", "false");
  await expect(page.getByTestId("manual-response-review-reason")).not.toHaveAttribute("aria-describedby", "manual-response-review-form-error");
  await expect(page.getByTestId("manual-response-review-form-error")).toContainText("ارزیابی خودت را انتخاب کن");
  await page.getByTestId("manual-response-review-outcome-needs-clarification").check();
  await page.getByTestId("manual-response-review-save").click();
  await expect(page.getByTestId("manual-response-review-reason")).toBeFocused();
  await expect(page.getByTestId("manual-response-review-outcome-group")).toHaveAttribute("aria-invalid", "false");
  await expect(page.getByTestId("manual-response-review-reason")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("manual-response-review-reason")).toHaveAttribute("aria-describedby", "manual-response-review-form-error");
  await expect(page.getByTestId("manual-response-review-form-error")).toContainText("دلیل ارزیابی خودت را بنویس");
  await page.getByTestId("manual-response-review-reason").fill("پاسخ هنوز واحد زمان را روشن نکرده است.");
  await page.evaluate((key) => {
    const nativeSetItem = Storage.prototype.setItem;
    Object.defineProperty(window, "__manualReviewNativeSetItem", { value: nativeSetItem, configurable: true });
    Storage.prototype.setItem = function setItem(storageKey: string, value: string) {
      if (this === window.localStorage && storageKey === key) throw new DOMException("Manual review write failed", "QuotaExceededError");
      return nativeSetItem.call(this, storageKey, value);
    };
  }, manualNegotiationResponseReviewStorageKey);
  await page.getByTestId("manual-response-review-save").click();
  await expect(page.getByTestId("manual-response-review-editor")).toBeVisible();
  await expect(page.getByTestId("manual-response-review-form-error")).toContainText("ارزیابی پاسخ ثبت نشد");
  await expect(page.getByTestId("manual-response-review-reason")).toHaveAttribute("aria-invalid", "false");
  await expect(page.getByTestId("manual-response-review-reason")).not.toHaveAttribute("aria-describedby", "manual-response-review-form-error");
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey)).toBeNull();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(response.responseStore);

  await page.evaluate(() => { Storage.prototype.setItem = (window as Window & { __manualReviewNativeSetItem: typeof Storage.prototype.setItem }).__manualReviewNativeSetItem; });
  await page.getByTestId("manual-response-review-save").click();
  await expect(page.getByTestId("manual-response-review-detail")).toBeVisible();
  const validReviewStore = await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey);
  await page.addInitScript((key) => {
    const nativeGetItem = Storage.prototype.getItem;
    Object.defineProperty(window, "__manualReviewNativeGetItem", { value: nativeGetItem, configurable: true });
    Storage.prototype.getItem = function getItem(storageKey: string) {
      if (this === window.localStorage && storageKey === key) throw new DOMException("Manual review read failed", "SecurityError");
      return nativeGetItem.call(this, storageKey);
    };
  }, manualNegotiationResponseReviewStorageKey);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await page.getByTestId("negotiation-draft-card").click();
  await page.getByTestId("manual-negotiation-response-open").click();
  await expect(page.getByTestId("manual-response-review-storage-error")).toBeVisible();
  await expect(page.getByTestId("manual-response-review-add")).toHaveCount(0);
  await expect(page.getByTestId("manual-response-review-open")).toHaveCount(0);
  await expect(page.getByTestId("manual-negotiation-response-edit")).toBeEnabled();
  await expect(page.getByTestId("manual-negotiation-response-message")).toHaveText(response.responseText);
  expect(await page.evaluate((key) => (window as Window & { __manualReviewNativeGetItem: typeof Storage.prototype.getItem }).__manualReviewNativeGetItem.call(window.localStorage, key), manualNegotiationResponseReviewStorageKey)).toBe(validReviewStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(response.responseStore);
  expect(response.externalRequests).toEqual([]);
  page.off("request", response.requestListener);
});

test("T8-A3 fail-closes tampered review lineage without hiding or rewriting the healthy response", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationResponseReview(page);
  const tamperedReviewStore = await page.evaluate((key) => {
    const records = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    records[0].target.manualNegotiationResponseRevisionFingerprint = "fnv1a-deadbeef";
    window.localStorage.setItem(key, JSON.stringify(records));
    return window.localStorage.getItem(key);
  }, manualNegotiationResponseReviewStorageKey);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await page.getByTestId("negotiation-draft-card").click();
  await page.getByTestId("manual-negotiation-response-open").click();
  await expect(page.getByTestId("manual-response-review-storage-error")).toBeVisible();
  await expect(page.getByTestId("manual-negotiation-response-message")).toHaveText(created.responseText);
  await expect(page.getByTestId("manual-negotiation-response-edit")).toBeEnabled();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey)).toBe(tamperedReviewStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(created.responseStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(created.draftStore);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A3 keeps a review historical after a response correction and creates a separate review for the new exact revision", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationResponseReview(page);
  const oldResponseRevisionId = created.responseRecord.currentRevisionId;
  await page.getByTestId("manual-response-review-detail-back").click();
  await page.getByTestId("manual-negotiation-response-edit").click();
  const correctedResponse = "اصلاح رونویسی: شروع سه روز کاری پس از تأیید کتبی اعلام شد.";
  await page.getByTestId("manual-negotiation-response-text").fill(correctedResponse);
  await page.getByTestId("manual-negotiation-response-save").click();
  const responseV2 = JSON.parse(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey) ?? "[]")[0];
  expect(responseV2.version).toBe(2);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey)).toBe(created.reviewStore);

  await openContainingDisclosure(page.getByTestId("manual-negotiation-response-revision-select"));
  await page.getByTestId("manual-negotiation-response-revision-select").selectOption(oldResponseRevisionId);
  await expect(page.getByTestId("manual-response-review-open")).toBeVisible();
  await page.getByTestId("manual-response-review-open").click();
  await expect(page.getByTestId("manual-response-review-detail-hero")).toContainText("نیازمند بررسی دوباره");
  await expect(page.getByTestId("manual-response-review-edit")).toBeDisabled();
  await page.getByTestId("manual-response-review-detail-back").click();

  await openContainingDisclosure(page.getByTestId("manual-negotiation-response-revision-select"));
  await page.getByTestId("manual-negotiation-response-revision-select").selectOption(responseV2.currentRevisionId);
  await expect(page.getByTestId("manual-response-review-add")).toBeVisible();
  await page.getByTestId("manual-response-review-add").click();
  await page.getByTestId("manual-response-review-outcome-appears-addressed").check();
  await page.getByTestId("manual-response-review-reason").fill("از نظر من اصلاح رونویسی، واحد زمان و شرط شروع را روشن کرده است.");
  await page.getByTestId("manual-response-review-save").click();
  const reviews = JSON.parse(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey) ?? "[]");
  expect(reviews).toHaveLength(2);
  expect(reviews[0]).toEqual(created.reviewRecord);
  expect(reviews[0].target.manualNegotiationResponseRevisionId).toBe(oldResponseRevisionId);
  expect(reviews[1].target.manualNegotiationResponseRevisionId).toBe(responseV2.currentRevisionId);
  expect(new Set(reviews.map((record: { target: { manualNegotiationResponseRevisionId: string } }) => record.target.manualNegotiationResponseRevisionId)).size).toBe(2);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A3 makes the review historical after an upstream comparison revision without rewriting review or response bytes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationResponseReview(page);
  await page.getByTestId("manual-response-review-detail-back").click();
  await page.getByTestId("manual-negotiation-response-detail-back").click();
  await page.getByTestId("negotiation-draft-detail-back").click();
  await page.getByTestId("service-comparison-edit").click();
  await serviceComparisonAssessmentEditor(page, "timing", created.firstSupplier).getByTestId("service-comparison-declared-value").fill("شروع قطعی ظرف پنج روز و اجرای هفت روزه");
  await page.getByTestId("service-comparison-save").click();
  await expect(page.getByTestId("service-comparison-detail-hero")).toContainText("جاری");
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey)).toBe(created.reviewStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(created.responseStore);

  await page.getByTestId("service-comparison-detail-back").click();
  await page.getByTestId("service-comparisons-back").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await page.getByTestId("negotiation-draft-card").click();
  await page.getByTestId("manual-negotiation-response-open").click();
  await page.getByTestId("manual-response-review-open").click();
  await expect(page.getByTestId("manual-response-review-detail-hero")).toContainText("نیازمند بررسی دوباره");
  await expect(page.getByTestId("manual-response-review-edit")).toBeDisabled();
  await expect(page.getByTestId("manual-response-review-reason-text")).toHaveText(created.reviewValues.reason);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey)).toBe(created.reviewStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(created.responseStore);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A3 applies the same exact-review contract to a product response and keeps project isolation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const prerequisites = await createExactProductComparisonWithDecision(page);
  const sourceStoresBeforeReview = await commercialSourceStoreBytes(page);
  const comparison = JSON.parse(sourceStoresBeforeReview.productComparisons ?? "[]")[0];
  const comparisonRevision = comparison.revisions.find((revision: { id: string }) => revision.id === comparison.currentRevisionId);
  const proposal = JSON.parse(sourceStoresBeforeReview.proposals ?? "[]").find((item: { id: string }) => item.id === prerequisites.firstProposal.id);
  const line = comparisonRevision.results.find((result: { proposalId: string }) => result.proposalId === proposal.id).lines[0];
  await (await openProductComparisonLineForNegotiation(page, proposal.id, line.requestItemId)).click();
  await page.getByTestId("negotiation-draft-purpose").fill("روشن‌سازی اعتبار قیمت قلم محصول");
  await page.getByTestId("negotiation-draft-message").fill("اعتبار این قیمت دقیقاً تا چه تاریخی است؟");
  await page.getByTestId("negotiation-draft-save").click();
  await page.getByTestId("manual-negotiation-response-add").click();
  await page.getByTestId("manual-negotiation-response-text").fill("در تماس بیرونی گفته شد قیمت تا پایان هفته معتبر است.");
  await page.getByTestId("manual-negotiation-response-save").click();
  await page.getByTestId("manual-response-review-add").click();
  await page.getByTestId("manual-response-review-outcome-appears-addressed").check();
  await page.getByTestId("manual-response-review-reason").fill("از نظر من پاسخ مستقیماً بازهٔ اعتبار قیمت را بیان می‌کند.");
  await page.getByTestId("manual-response-review-save").click();

  const response = JSON.parse(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey) ?? "[]")[0];
  const responseRevision = response.revisions.find((revision: { id: string }) => revision.id === response.currentRevisionId);
  const reviewStore = await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey);
  const review = JSON.parse(reviewStore ?? "[]")[0];
  expect(response.questionSnapshot.negotiationTarget).toMatchObject({ comparisonKind: "product", proposalId: proposal.id, proposalLineId: line.proposalLineId, criterionKind: "product-line", criterionId: line.requestItemId });
  expect(review.target).toEqual({
    manualNegotiationResponseId: response.id,
    manualNegotiationResponseRevisionId: responseRevision.id,
    manualNegotiationResponseRevisionVersion: responseRevision.version,
    manualNegotiationResponseRevisionFingerprint: responseRevision.fingerprint,
  });
  expect(await commercialSourceStoreBytes(page)).toEqual(sourceStoresBeforeReview);

  const firstProjectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  await page.evaluate(() => {
    const projects = JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]");
    projects.push({ id: "t8a3-isolation-project-b", name: "پروژه مستقل بازبینی", location: "منطقهٔ ۵", stage: "فونداسیون", usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-29T00:00:00.000Z" });
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify(projects));
    window.localStorage.setItem("chida-prototype-active-project", "t8a3-isolation-project-b");
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-card")).toHaveCount(0);
  expect(JSON.parse(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey) ?? "[]")).toHaveLength(1);

  await page.evaluate((projectId) => window.localStorage.setItem("chida-prototype-active-project", projectId!), firstProjectId);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-card")).toHaveCount(1);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey)).toBe(reviewStore);
});

test("T8-A4 records one manual qualitative service impact on the exact response revision without calculation or external effect", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationConditionImpact(page);

  await expect(page.getByTestId("manual-condition-impact-detail")).toContainText("این نتیجه را شما ثبت کرده‌اید");
  await expect(page.getByTestId("manual-condition-impact-summary-text")).toHaveText(created.impactValues.changeSummary);
  await expect(page.getByTestId("manual-condition-impact-summary-text")).toHaveAttribute("dir", "auto");
  await expect(page.getByTestId("manual-condition-impact-domain-text")).toContainText("زمان‌بندی");
  await expect(page.getByTestId("manual-condition-impact-direction-text")).toContainText("به نفع سازنده");
  await expect(page.getByTestId("manual-condition-impact-reason-text")).toHaveText(created.impactValues.reason);
  await expect(page.getByTestId("manual-condition-impact-reason-text")).toHaveAttribute("dir", "auto");
  await openDisclosure(page.getByTestId("manual-condition-impact-boundary"));
  await expect(page.getByTestId("manual-condition-impact-boundary")).toContainText("automatedCalculationUsed=false");
  await expect(page.getByTestId("manual-condition-impact-boundary")).toContainText("aiUsed=false");
  await expect(page.getByTestId("manual-condition-impact-boundary")).toContainText("networkUsed=false");
  await expect(page.getByTestId("manual-condition-impact-boundary")).toContainText("externalEffect=none");
  expect(await page.getByTestId("manual-condition-impact-detail").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

  expect(created.impactRecord).toMatchObject({
    schemaVersion: 1,
    projectId: created.projectId,
    purpose: "record-local-builder-manual-negotiation-condition-impact",
    status: "manual-impact-assessment",
    target: {
      manualNegotiationResponseId: created.responseRecord.id,
      manualNegotiationResponseRevisionId: created.responseRevision.id,
      manualNegotiationResponseRevisionVersion: created.responseRevision.version,
      manualNegotiationResponseRevisionFingerprint: created.responseRevision.fingerprint,
    },
    source: "ارزیابی مستقیم سازنده",
    assessmentMethod: "manual-qualitative",
    visibility: "خصوصی پروژه",
    localStatus: "ثبت محلی",
    automatedCalculationUsed: false,
    automatedDetectionUsed: false,
    aiUsed: false,
    networkUsed: false,
    authenticityVerified: false,
    proposalMutated: false,
    comparisonMutated: false,
    externalEffect: "none",
    sendAuthorized: false,
    supplierNotified: false,
    sharedWithSupplier: false,
    externalActionAttempted: false,
    version: 1,
  });
  expect(created.impactRecord.target).toEqual({
    manualNegotiationResponseId: created.responseRecord.id,
    manualNegotiationResponseRevisionId: created.responseRevision.id,
    manualNegotiationResponseRevisionVersion: created.responseRevision.version,
    manualNegotiationResponseRevisionFingerprint: created.responseRevision.fingerprint,
  });
  expect(created.impactRecord).not.toHaveProperty("responseSnapshot");
  expect(created.impactRecord.revisions).toHaveLength(1);
  expect(created.impactRecord.revisions[0]).toMatchObject({ version: 1, ...created.impactValues });
  expect(created.impactRecord.revisions[0]).not.toHaveProperty("formula");
  expect(created.impactRecord.revisions[0]).not.toHaveProperty("numericDelta");
  expect(created.impactRecord.history.map((event: { type: string }) => event.type)).toEqual(["created"]);

  expect({
    ...await commercialSourceStoreBytes(page),
    negotiationDrafts: await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey),
    manualResponses: await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey),
    manualResponseReviews: await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey),
  }).toEqual(created.sourceStoresBeforeImpact);
  await page.getByTestId("manual-condition-impact-detail-back").click();
  await expect(page.getByTestId("manual-condition-impact-open")).toBeFocused();
  await expect(page.getByTestId("manual-condition-impact-open")).toHaveAccessibleName(`بازکردن اثر پاسخ برای مدت و زمان اجرا و ${created.firstSupplier}`);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A4 applies the same exact-response contract to a product impact and keeps project isolation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const prerequisites = await createExactProductComparisonWithDecision(page);
  const commercialStoresBeforeImpact = await commercialSourceStoreBytes(page);
  const comparison = JSON.parse(commercialStoresBeforeImpact.productComparisons ?? "[]")[0];
  const comparisonRevision = comparison.revisions.find((revision: { id: string }) => revision.id === comparison.currentRevisionId);
  const proposal = JSON.parse(commercialStoresBeforeImpact.proposals ?? "[]").find((item: { id: string }) => item.id === prerequisites.firstProposal.id);
  const line = comparisonRevision.results.find((result: { proposalId: string }) => result.proposalId === proposal.id).lines[0];
  await (await openProductComparisonLineForNegotiation(page, proposal.id, line.requestItemId)).click();
  await page.getByTestId("negotiation-draft-purpose").fill("روشن‌سازی اثر تغییر اعتبار قیمت قلم محصول");
  await page.getByTestId("negotiation-draft-message").fill("اگر اعتبار قیمت کوتاه‌تر شود چه اثری بر تصمیم فعلی من دارد؟");
  await page.getByTestId("negotiation-draft-save").click();
  await page.getByTestId("manual-negotiation-response-add").click();
  await page.getByTestId("manual-negotiation-response-text").fill("در تماس بیرونی گفته شد قیمت فقط تا فردا معتبر است.");
  await page.getByTestId("manual-negotiation-response-save").click();
  const responseStore = await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey);
  const response = JSON.parse(responseStore ?? "[]")[0];
  const responseRevision = response.revisions.find((revision: { id: string }) => revision.id === response.currentRevisionId);
  const sourceStoresBeforeImpact = {
    ...await commercialSourceStoreBytes(page),
    negotiationDrafts: await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey),
    manualResponses: responseStore,
    manualResponseReviews: await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey),
  };
  const appOrigin = new URL(page.url()).origin;
  const externalRequests: string[] = [];
  const requestListener = (request: Request) => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== appOrigin) externalRequests.push(request.url());
  };
  page.on("request", requestListener);

  await expect(page.getByTestId("manual-condition-impact-add")).toHaveAccessibleName(`ثبت اثر پاسخ برای ${line.requestLabel} و ${prerequisites.firstSupplier}`);
  await page.getByTestId("manual-condition-impact-add").click();
  await page.getByTestId("manual-condition-impact-change-summary").fill("اعتبار اعلامی قیمت از بازهٔ هفتگی به پایان فردا محدود شده است.");
  await page.getByTestId("manual-condition-impact-domain").selectOption("commercial-terms");
  await page.getByTestId("manual-condition-impact-direction").selectOption("adverse-to-builder");
  await page.getByTestId("manual-condition-impact-reason").fill("از نظر من فرصت بررسی و تأیید داخلی کمتر شده است؛ هیچ سفارش یا ارسال خودکاری انجام نمی‌شود.");
  await page.getByTestId("manual-condition-impact-save").click();
  await expect(page.getByTestId("manual-condition-impact-detail-hero")).toBeFocused();
  expect(await page.getByTestId("manual-condition-impact-detail").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  const impactStore = await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationConditionImpactStorageKey);
  const impact = JSON.parse(impactStore ?? "[]")[0];
  expect(impact.target).toEqual({
    manualNegotiationResponseId: response.id,
    manualNegotiationResponseRevisionId: responseRevision.id,
    manualNegotiationResponseRevisionVersion: responseRevision.version,
    manualNegotiationResponseRevisionFingerprint: responseRevision.fingerprint,
  });
  expect(response.questionSnapshot.negotiationTarget).toMatchObject({ comparisonKind: "product", proposalId: proposal.id, proposalLineId: line.proposalLineId, criterionKind: "product-line", criterionId: line.requestItemId });
  expect(impact.revisions[0]).toMatchObject({ impactDomain: "commercial-terms", impactDirection: "adverse-to-builder" });
  expect({
    ...await commercialSourceStoreBytes(page),
    negotiationDrafts: await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey),
    manualResponses: await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey),
    manualResponseReviews: await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseReviewStorageKey),
  }).toEqual(sourceStoresBeforeImpact);

  const firstProjectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  if (!firstProjectId) throw new Error("Active project is unavailable for the T8-A4 isolation oracle");
  await page.evaluate(() => {
    const projects = JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]");
    projects.push({ id: "t8a4-isolation-project-b", name: "پروژه مستقل اثر شرایط", location: "منطقهٔ ۶", stage: "فونداسیون", usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-29T00:00:00.000Z" });
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify(projects));
    window.localStorage.setItem("chida-prototype-active-project", "t8a4-isolation-project-b");
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-card")).toHaveCount(0);
  expect(JSON.parse(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationConditionImpactStorageKey) ?? "[]")).toHaveLength(1);

  await page.evaluate((projectId) => window.localStorage.setItem("chida-prototype-active-project", projectId), firstProjectId);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await page.getByTestId("negotiation-draft-card").click();
  await page.getByTestId("manual-negotiation-response-open").click();
  await expect(page.getByTestId("manual-condition-impact-open")).toBeVisible();
  await page.getByTestId("manual-condition-impact-open").click();
  await expect(page.getByTestId("manual-condition-impact-detail")).toContainText("اعتبار اعلامی قیمت");
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationConditionImpactStorageKey)).toBe(impactStore);
  expect(externalRequests).toEqual([]);
  page.off("request", requestListener);
});

test("T8-A4 keeps no-op bytes stable, versions semantic edits, and stays current when the sibling T8-A3 review changes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationConditionImpact(page);

  await page.getByTestId("manual-condition-impact-edit").click();
  await expect(page.getByTestId("manual-condition-impact-editor-title")).toBeFocused();
  await page.getByTestId("manual-condition-impact-save").click();
  await expect(page.getByTestId("manual-condition-impact-detail")).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationConditionImpactStorageKey)).toBe(created.impactStore);

  const summaryV2 = "زمان شروع نسبت به پیشنهاد ثبت‌شده کوتاه‌تر اعلام شده، اما شرط توافق کتبی به آن افزوده شده است.";
  const reasonV2 = "از نظر من اثر زمان‌بندی مثبت و اثر شرط تجاری نامشخص است؛ نتیجه ترکیبی است.";
  await page.getByTestId("manual-condition-impact-edit").click();
  await page.getByTestId("manual-condition-impact-change-summary").fill(summaryV2);
  await page.getByTestId("manual-condition-impact-domain").selectOption("multiple");
  await page.getByTestId("manual-condition-impact-direction").selectOption("mixed");
  await page.getByTestId("manual-condition-impact-reason").fill(reasonV2);
  await page.getByTestId("manual-condition-impact-save").click();
  await expect(page.getByTestId("manual-condition-impact-summary-text")).toHaveText(summaryV2);
  await expect(page.getByTestId("manual-condition-impact-reason-text")).toHaveText(reasonV2);
  await openContainingDisclosure(page.getByTestId("manual-condition-impact-history"));
  const v2Store = await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationConditionImpactStorageKey);
  const v2 = JSON.parse(v2Store ?? "[]")[0];
  expect(v2.version).toBe(2);
  expect(v2.revisions).toHaveLength(2);
  expect(v2.history.map((event: { type: string }) => event.type)).toEqual(["created", "updated"]);
  expect(v2.revisions[0]).toEqual(created.impactRecord.revisions[0]);
  expect(v2.revisions[1]).toMatchObject({ version: 2, changeSummary: summaryV2, impactDomain: "multiple", impactDirection: "mixed", reason: reasonV2 });

  await page.getByTestId("manual-condition-impact-revision-select").selectOption(created.impactRecord.currentRevisionId);
  await expect(page.getByTestId("manual-condition-impact-detail-hero")).toContainText("نسخهٔ قدیمی");
  await expect(page.getByTestId("manual-condition-impact-edit")).toBeDisabled();
  await expect(page.getByTestId("manual-condition-impact-summary-text")).toHaveText(created.impactValues.changeSummary);
  await page.getByTestId("manual-condition-impact-revision-select").selectOption(v2.currentRevisionId);
  await expect(page.getByTestId("manual-condition-impact-edit")).toBeEnabled();

  await page.getByTestId("manual-condition-impact-detail-back").click();
  await page.getByTestId("manual-response-review-add").click();
  await page.getByTestId("manual-response-review-outcome-needs-clarification").check();
  await page.getByTestId("manual-response-review-reason").fill("این sibling review نباید وضعیت اثر ثبت‌شده روی همان پاسخ را تغییر دهد.");
  await page.getByTestId("manual-response-review-save").click();
  await page.getByTestId("manual-response-review-edit").click();
  await page.getByTestId("manual-response-review-outcome-potential-conflict").check();
  await page.getByTestId("manual-response-review-reason").fill("ویرایش ارزیابی T8-A3 همچنان dependency رکورد اثر نیست.");
  await page.getByTestId("manual-response-review-save").click();
  await page.getByTestId("manual-response-review-detail-back").click();
  await expect(page.getByTestId("manual-condition-impact-open")).toBeVisible();
  await page.getByTestId("manual-condition-impact-open").click();
  await expect(page.getByTestId("manual-condition-impact-detail-hero")).toContainText("ارزیابی فعلی");
  await expect(page.getByTestId("manual-condition-impact-edit")).toBeEnabled();
  await expect(page.getByTestId("manual-condition-impact-summary-text")).toHaveText(summaryV2);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationConditionImpactStorageKey)).toBe(v2Store);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A4 validates manual inputs, rolls back failed writes, and isolates an unreadable impact store from the healthy response", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await createExactManualNegotiationResponse(page);
  await page.getByTestId("manual-condition-impact-add").click();
  await page.getByTestId("manual-condition-impact-save").click();
  await expect(page.getByTestId("manual-condition-impact-change-summary")).toBeFocused();
  await expect(page.getByTestId("manual-condition-impact-change-summary")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("manual-condition-impact-change-summary")).toHaveAttribute("aria-describedby", "manual-condition-impact-form-error");
  await expect(page.getByTestId("manual-condition-impact-form-error")).toContainText("خلاصهٔ تغییر شرایط را بنویس");
  await page.getByTestId("manual-condition-impact-change-summary").fill("زمان شروع به سه روز کاری پس از توافق تغییر کرده است.");
  await page.getByTestId("manual-condition-impact-save").click();
  await expect(page.getByTestId("manual-condition-impact-domain")).toBeFocused();
  await expect(page.getByTestId("manual-condition-impact-domain")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("manual-condition-impact-form-error")).toContainText("حوزهٔ اثر را انتخاب کن");
  await page.getByTestId("manual-condition-impact-domain").selectOption("schedule");
  await page.getByTestId("manual-condition-impact-save").click();
  await expect(page.getByTestId("manual-condition-impact-direction")).toBeFocused();
  await expect(page.getByTestId("manual-condition-impact-direction")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("manual-condition-impact-form-error")).toContainText("جهت اثر را انتخاب کن");
  await page.getByTestId("manual-condition-impact-direction").selectOption("favorable-to-builder");
  await page.getByTestId("manual-condition-impact-save").click();
  await expect(page.getByTestId("manual-condition-impact-reason")).toBeFocused();
  await expect(page.getByTestId("manual-condition-impact-reason")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("manual-condition-impact-reason")).toHaveAttribute("aria-describedby", "manual-condition-impact-form-error");
  await expect(page.getByTestId("manual-condition-impact-form-error")).toContainText("دلیل ارزیابی خودت را بنویس");
  await page.getByTestId("manual-condition-impact-reason").fill("اثر فقط برداشت دستی من از همین پاسخ است.");
  await page.evaluate((key) => {
    const nativeSetItem = Storage.prototype.setItem;
    Object.defineProperty(window, "__manualConditionImpactNativeSetItem", { value: nativeSetItem, configurable: true });
    Storage.prototype.setItem = function setItem(storageKey: string, value: string) {
      if (this === window.localStorage && storageKey === key) throw new DOMException("Manual condition impact write failed", "QuotaExceededError");
      return nativeSetItem.call(this, storageKey, value);
    };
  }, manualNegotiationConditionImpactStorageKey);
  await page.getByTestId("manual-condition-impact-save").click();
  await expect(page.getByTestId("manual-condition-impact-editor")).toBeVisible();
  await expect(page.getByTestId("manual-condition-impact-form-error")).toContainText("اثر تغییر شرایط ثبت نشد");
  await expect(page.getByTestId("manual-condition-impact-reason")).toHaveAttribute("aria-invalid", "false");
  await expect(page.getByTestId("manual-condition-impact-reason")).not.toHaveAttribute("aria-describedby", "manual-condition-impact-form-error");
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationConditionImpactStorageKey)).toBeNull();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(response.responseStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(response.draftStore);

  await page.evaluate(() => { Storage.prototype.setItem = (window as Window & { __manualConditionImpactNativeSetItem: typeof Storage.prototype.setItem }).__manualConditionImpactNativeSetItem; });
  await page.getByTestId("manual-condition-impact-save").click();
  await expect(page.getByTestId("manual-condition-impact-detail")).toBeVisible();
  const validImpactStore = await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationConditionImpactStorageKey);
  await page.addInitScript((key) => {
    const nativeGetItem = Storage.prototype.getItem;
    Object.defineProperty(window, "__manualConditionImpactNativeGetItem", { value: nativeGetItem, configurable: true });
    Storage.prototype.getItem = function getItem(storageKey: string) {
      if (this === window.localStorage && storageKey === key) throw new DOMException("Manual condition impact read failed", "SecurityError");
      return nativeGetItem.call(this, storageKey);
    };
  }, manualNegotiationConditionImpactStorageKey);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await page.getByTestId("negotiation-draft-card").click();
  await page.getByTestId("manual-negotiation-response-open").click();
  await expect(page.getByTestId("manual-condition-impact-storage-error")).toBeVisible();
  await expect(page.getByTestId("manual-condition-impact-add")).toHaveCount(0);
  await expect(page.getByTestId("manual-condition-impact-open")).toHaveCount(0);
  await expect(page.getByTestId("manual-negotiation-response-edit")).toBeEnabled();
  await expect(page.getByTestId("manual-negotiation-response-message")).toHaveText(response.responseText);
  expect(await page.evaluate((key) => (window as Window & { __manualConditionImpactNativeGetItem: typeof Storage.prototype.getItem }).__manualConditionImpactNativeGetItem.call(window.localStorage, key), manualNegotiationConditionImpactStorageKey)).toBe(validImpactStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(response.responseStore);
  expect(response.externalRequests).toEqual([]);
  page.off("request", response.requestListener);
});

test("T8-A4 fail-closes a tampered impact fingerprint without hiding or rewriting the healthy response", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationConditionImpact(page);
  const tamperedImpactStore = await page.evaluate((key) => {
    const records = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    records[0].revisions[0].fingerprint = "fnv1a-deadbeef";
    window.localStorage.setItem(key, JSON.stringify(records));
    return window.localStorage.getItem(key);
  }, manualNegotiationConditionImpactStorageKey);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await page.getByTestId("negotiation-draft-card").click();
  await page.getByTestId("manual-negotiation-response-open").click();
  await expect(page.getByTestId("manual-condition-impact-storage-error")).toBeVisible();
  await expect(page.getByTestId("manual-condition-impact-add")).toHaveCount(0);
  await expect(page.getByTestId("manual-condition-impact-open")).toHaveCount(0);
  await expect(page.getByTestId("manual-negotiation-response-message")).toHaveText(created.responseText);
  await expect(page.getByTestId("manual-negotiation-response-edit")).toBeEnabled();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationConditionImpactStorageKey)).toBe(tamperedImpactStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(created.responseStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(created.draftStore);
  expect(await commercialSourceStoreBytes(page)).toEqual({
    requests: created.sourceStoresBeforeImpact.requests,
    approvals: created.sourceStoresBeforeImpact.approvals,
    dispatch: created.sourceStoresBeforeImpact.dispatch,
    contacts: created.sourceStoresBeforeImpact.contacts,
    proposals: created.sourceStoresBeforeImpact.proposals,
    productComparisons: created.sourceStoresBeforeImpact.productComparisons,
    productDecisions: created.sourceStoresBeforeImpact.productDecisions,
    serviceComparisons: created.sourceStoresBeforeImpact.serviceComparisons,
    serviceDecisions: created.sourceStoresBeforeImpact.serviceDecisions,
  });
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A4 keeps an old impact historical after a response correction and creates a separate impact for the new exact revision", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationConditionImpact(page);
  const oldImpact = structuredClone(created.impactRecord);
  const oldResponseRevisionId = created.responseRecord.currentRevisionId;
  await page.getByTestId("manual-condition-impact-detail-back").click();
  await page.getByTestId("manual-negotiation-response-edit").click();
  const correctedResponse = "اصلاح رونویسی: شروع سه روز کاری پس از تأیید کتبی و تجهیز دو روزه اعلام شد.";
  await page.getByTestId("manual-negotiation-response-text").fill(correctedResponse);
  await page.getByTestId("manual-negotiation-response-save").click();
  const responseV2 = JSON.parse(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey) ?? "[]")[0];
  expect(responseV2.version).toBe(2);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationConditionImpactStorageKey)).toBe(created.impactStore);

  await openContainingDisclosure(page.getByTestId("manual-negotiation-response-revision-select"));
  await page.getByTestId("manual-negotiation-response-revision-select").selectOption(oldResponseRevisionId);
  await expect(page.getByTestId("manual-condition-impact-open")).toBeVisible();
  await page.getByTestId("manual-condition-impact-open").click();
  await expect(page.getByTestId("manual-condition-impact-detail-hero")).toContainText("نیازمند بررسی دوباره");
  await expect(page.getByTestId("manual-condition-impact-edit")).toBeDisabled();
  await page.getByTestId("manual-condition-impact-detail-back").click();
  await expect(page.getByTestId("manual-condition-impact-open")).toBeFocused();

  await openContainingDisclosure(page.getByTestId("manual-negotiation-response-revision-select"));
  await page.getByTestId("manual-negotiation-response-revision-select").selectOption(responseV2.currentRevisionId);
  await expect(page.getByTestId("manual-condition-impact-add")).toBeVisible();
  await page.getByTestId("manual-condition-impact-add").click();
  await page.getByTestId("manual-condition-impact-change-summary").fill("پاسخ اصلاح‌شده علاوه بر شروع، مدت تجهیز را نیز روشن کرده است.");
  await page.getByTestId("manual-condition-impact-domain").selectOption("multiple");
  await page.getByTestId("manual-condition-impact-direction").selectOption("mixed");
  await page.getByTestId("manual-condition-impact-reason").fill("از نظر من بخشی از ابهام زمان کم شده ولی شرط تأیید کتبی هنوز اثر تجاری دارد.");
  await page.getByTestId("manual-condition-impact-save").click();
  const impacts = JSON.parse(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationConditionImpactStorageKey) ?? "[]");
  expect(impacts).toHaveLength(2);
  expect(impacts[0]).toEqual(oldImpact);
  expect(impacts[0].target.manualNegotiationResponseRevisionId).toBe(oldResponseRevisionId);
  expect(impacts[1].target.manualNegotiationResponseRevisionId).toBe(responseV2.currentRevisionId);
  expect(new Set(impacts.map((record: { target: { manualNegotiationResponseRevisionId: string } }) => record.target.manualNegotiationResponseRevisionId)).size).toBe(2);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), negotiationDraftStorageKey)).toBe(created.draftStore);
  expect(await commercialSourceStoreBytes(page)).toEqual({
    requests: created.sourceStoresBeforeImpact.requests,
    approvals: created.sourceStoresBeforeImpact.approvals,
    dispatch: created.sourceStoresBeforeImpact.dispatch,
    contacts: created.sourceStoresBeforeImpact.contacts,
    proposals: created.sourceStoresBeforeImpact.proposals,
    productComparisons: created.sourceStoresBeforeImpact.productComparisons,
    productDecisions: created.sourceStoresBeforeImpact.productDecisions,
    serviceComparisons: created.sourceStoresBeforeImpact.serviceComparisons,
    serviceDecisions: created.sourceStoresBeforeImpact.serviceDecisions,
  });
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

test("T8-A4 makes the impact historical after an upstream comparison revision without rewriting impact or response bytes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const created = await createExactManualNegotiationConditionImpact(page);
  await page.getByTestId("manual-condition-impact-detail-back").click();
  await page.getByTestId("manual-negotiation-response-detail-back").click();
  await page.getByTestId("negotiation-draft-detail-back").click();
  await page.getByTestId("service-comparison-edit").click();
  await serviceComparisonAssessmentEditor(page, "timing", created.firstSupplier).getByTestId("service-comparison-declared-value").fill("شروع قطعی ظرف پنج روز و اجرای هفت روزه");
  await page.getByTestId("service-comparison-save").click();
  await expect(page.getByTestId("service-comparison-detail-hero")).toContainText("جاری");
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationConditionImpactStorageKey)).toBe(created.impactStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(created.responseStore);

  await page.getByTestId("service-comparison-detail-back").click();
  await page.getByTestId("service-comparisons-back").click();
  await openProposalSecondaryView(page, "negotiation-drafts-entry");
  await expect(page.getByTestId("negotiation-draft-card")).toContainText("نیازمند بررسی دوباره");
  await page.getByTestId("negotiation-draft-card").click();
  await page.getByTestId("manual-negotiation-response-open").click();
  await page.getByTestId("manual-condition-impact-open").click();
  await expect(page.getByTestId("manual-condition-impact-detail-hero")).toContainText("نیازمند بررسی دوباره");
  await expect(page.getByTestId("manual-condition-impact-edit")).toBeDisabled();
  await expect(page.getByTestId("manual-condition-impact-summary-text")).toHaveText(created.impactValues.changeSummary);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationConditionImpactStorageKey)).toBe(created.impactStore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), manualNegotiationResponseStorageKey)).toBe(created.responseStore);
  expect(created.externalRequests).toEqual([]);
  page.off("request", created.requestListener);
});

async function allLocalStorageBytes(page: Page) {
  return page.evaluate(() => Object.fromEntries(
    Array.from({ length: window.localStorage.length }, (_item, index) => window.localStorage.key(index))
      .filter((key): key is string => key !== null)
      .sort()
      .map((key) => [key, window.localStorage.getItem(key)]),
  ));
}

async function createExactProductProposalRevisionPair(page: Page, supplierName = "فولاد نسخه‌های پیشنهاد") {
  await page.setViewportSize({ width: 390, height: 844 });
  await createTwoItemProductProposalPrerequisites(page, supplierName);
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-add").click();
  await page.getByTestId("proposal-supplier-select").selectOption({ label: `${supplierName} · محصول` });
  await openProposalAdvancedMode(page);
  await page.getByTestId("proposal-declared-at").fill("۱۴۰۵/۰۶/۰۶");
  await page.getByTestId("proposal-transcript").fill("نسخهٔ نخست رونویسی: قیمت سیمان اعلام شد و بلوک فعلاً ناموجود است.");
  await page.getByTestId("proposal-line-status-0").selectOption("quoted");
  await page.getByTestId("proposal-line-quantity-0").fill("۵");
  await page.getByTestId("proposal-line-unit-0").fill("تن");
  await page.getByTestId("proposal-line-unit-price-0").fill("9007199254740993");
  await page.getByTestId("proposal-line-total-price-0").fill(".0000001");
  await page.getByTestId("proposal-line-status-1").selectOption("unavailable");
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-detail")).toBeVisible();

  const versionOneStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));
  const versionOneRecord = JSON.parse(versionOneStore ?? "[]").find((proposal: { supplierSnapshot: { displayName: string } }) => proposal.supplierSnapshot.displayName === supplierName);
  if (!versionOneRecord) throw new Error("T8-A5a version-one proposal fixture was not stored");

  await page.getByTestId("proposal-edit").click();
  await openProposalAdvancedMode(page);
  await page.getByTestId("proposal-declared-at").fill("۱۴۰۵/۰۶/۰۷");
  await page.getByTestId("proposal-transcript").fill("نسخهٔ دوم رونویسی: قیمت سیمان اصلاح شد و بلوک جایگزین پیشنهاد شد.");
  await page.getByTestId("proposal-notes").fill("این فقط اصلاح رونویسی محلی سازنده است.");
  await page.getByTestId("proposal-line-unit-price-0").fill("9007199254740994");
  await page.getByTestId("proposal-line-total-price-0").fill("");
  await page.getByTestId("proposal-line-tax-0").fill("نامشخص");
  await page.getByTestId("proposal-line-validity-0").fill("تا پایان فردا");
  await page.getByTestId("proposal-line-status-1").selectOption("alternative");
  await page.getByTestId("proposal-line-leadTime-1").fill("سه روز کاری");
  await page.getByTestId("proposal-line-notes-1").fill("گزینهٔ جایگزین سبک‌تر");
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-detail-hero")).toBeFocused();

  const proposalStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));
  const proposal = JSON.parse(proposalStore ?? "[]").find((item: { supplierSnapshot: { displayName: string } }) => item.supplierSnapshot.displayName === supplierName);
  if (!proposal || proposal.revisions.length !== 2) throw new Error("T8-A5a exact two-revision proposal fixture is unavailable");
  const projectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  if (!projectId) throw new Error("T8-A5a active project fixture is unavailable");
  return {
    supplierName,
    projectId,
    versionOneStore,
    versionOneRecord,
    proposalStore,
    proposal,
    baseline: proposal.revisions[0],
    candidate: proposal.revisions[1],
    sourceBytes: await allLocalStorageBytes(page),
  };
}

async function addThirdProductProposalRevision(page: Page, supplierName: string) {
  await page.getByTestId("proposal-edit").click();
  await openProposalAdvancedMode(page);
  await page.getByTestId("proposal-transcript").fill("نسخهٔ سوم رونویسی برای بررسی pair تاریخی.");
  await page.getByTestId("proposal-line-validity-0").fill("تا پایان هفته");
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-detail-hero")).toBeFocused();
  const proposalStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));
  const proposal = JSON.parse(proposalStore ?? "[]").find((item: { supplierSnapshot: { displayName: string } }) => item.supplierSnapshot.displayName === supplierName);
  if (!proposal || proposal.revisions.length !== 3) throw new Error("T8-A5a exact three-revision proposal fixture is unavailable");
  return { proposalStore, proposal, sourceBytes: await allLocalStorageBytes(page) };
}

function proposalRevisionDiffLine(page: Page, lineId: string) {
  return page.locator(`[data-testid="proposal-revision-diff-line"][data-line-id="${lineId}"]`);
}

function proposalRevisionDiffField(container: Locator, field: string) {
  return container.locator(`[data-testid="proposal-revision-diff-field"][data-field="${field}"]`);
}

test("T8-A5a defaults to the exact previous and current product proposal revisions with traceable source identity", async ({ page }) => {
  const created = await createExactProductProposalRevisionPair(page);
  const open = page.getByTestId("proposal-revision-diff-open");
  await expect(open).toBeVisible();
  await expect(open).toHaveAccessibleName(new RegExp(created.supplierName));
  await expect(open).toHaveAccessibleName(/نسخهٔ ۱ و ۲/);
  await open.click();

  await expect(page.getByTestId("proposal-revision-diff-view")).toBeVisible();
  await expect(page.getByTestId("proposal-revision-diff-title")).toBeFocused();
  await expect(page.getByTestId("proposal-revision-diff-baseline-select")).toHaveAccessibleName("نسخه قبلی");
  await expect(page.getByTestId("proposal-revision-diff-candidate-select")).toHaveAccessibleName("نسخه جدیدتر");
  await expect(page.getByTestId("proposal-revision-diff-baseline-select")).toHaveValue(created.baseline.id);
  await expect(page.getByTestId("proposal-revision-diff-candidate-select")).toHaveValue(created.candidate.id);
  await openProposalRevisionDiffTechnical(page);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.supplierName);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.baseline.id);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.baseline.fingerprint);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.candidate.id);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.candidate.fingerprint);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText("ثبت دستی سازنده");
});

test("T8-A5a shows exact product field and line differences with explicit unknowns and no arithmetic", async ({ page }) => {
  const created = await createExactProductProposalRevisionPair(page, "فولاد تفاوت دقیق");
  await page.getByTestId("proposal-revision-diff-open").click();
  const view = page.getByTestId("proposal-revision-diff-view");
  await expect(page.getByTestId("proposal-revision-diff-line")).toHaveCount(2);
  await expect(page.getByTestId("proposal-revision-diff-field")).toHaveCount(29);
  await expect(page.getByTestId("proposal-revision-diff-summary")).toContainText("۱۰ مورد عوض شده");
  await expect(page.getByTestId("proposal-revision-diff-summary")).toContainText("۱۹ مورد ثابت");
  await openAllProposalRevisionDiffUnchanged(page);

  const rootNotes = proposalRevisionDiffField(view, "notes");
  await expect(rootNotes).toHaveAttribute("data-changed", "true");
  await expect(rootNotes.getByTestId("proposal-revision-diff-before")).toHaveText("نامشخص · ثبت نشده");
  await expect(rootNotes.getByTestId("proposal-revision-diff-before")).toHaveAttribute("data-value-kind", "null");
  await expect(rootNotes.getByTestId("proposal-revision-diff-after")).toHaveText("این فقط اصلاح رونویسی محلی سازنده است.");

  const firstLine = proposalRevisionDiffLine(page, created.baseline.lines[0].id);
  await expect(firstLine).toContainText(created.baseline.lines[0].requestLabel);
  const unitPrice = proposalRevisionDiffField(firstLine, "unitPrice");
  await expect(unitPrice).toHaveAttribute("data-changed", "true");
  await expect(unitPrice.getByTestId("proposal-revision-diff-before")).toHaveText("9007199254740993");
  await expect(unitPrice.getByTestId("proposal-revision-diff-after")).toHaveText("9007199254740994");
  const totalPrice = proposalRevisionDiffField(firstLine, "totalPrice");
  await expect(totalPrice.getByTestId("proposal-revision-diff-before")).toHaveText("0.0000001");
  await expect(totalPrice.getByTestId("proposal-revision-diff-after")).toHaveText("نامشخص · ثبت نشده");
  const tax = proposalRevisionDiffField(firstLine, "tax");
  await expect(tax).toHaveAttribute("data-changed", "true");
  await expect(tax.getByTestId("proposal-revision-diff-before")).toHaveText("نامشخص · ثبت نشده");
  await expect(tax.getByTestId("proposal-revision-diff-before")).toHaveAttribute("data-value-kind", "null");
  await expect(tax.getByTestId("proposal-revision-diff-after")).toHaveText("نامشخص");
  await expect(tax.getByTestId("proposal-revision-diff-after")).toHaveAttribute("data-value-kind", "literal");
  const validity = proposalRevisionDiffField(firstLine, "validity");
  await expect(validity.getByTestId("proposal-revision-diff-before")).toHaveText("نامشخص · ثبت نشده");
  await expect(validity.getByTestId("proposal-revision-diff-after")).toHaveText("تا پایان فردا");
  const firstCurrency = proposalRevisionDiffField(firstLine, "currency");
  await expect(firstCurrency).toHaveAttribute("data-changed", "false");
  await expect(firstCurrency.getByTestId("proposal-revision-diff-before")).toHaveText("تومان");
  await expect(firstCurrency.getByTestId("proposal-revision-diff-after")).toHaveText("تومان");

  const secondLine = proposalRevisionDiffLine(page, created.baseline.lines[1].id);
  const status = proposalRevisionDiffField(secondLine, "status");
  await expect(status.getByTestId("proposal-revision-diff-before")).toHaveText("ناموجود اعلام شده");
  await expect(status.getByTestId("proposal-revision-diff-after")).toHaveText("جایگزین پیشنهاد شده");
  const unchangedQuantity = proposalRevisionDiffField(secondLine, "quantity");
  await expect(unchangedQuantity).toHaveAttribute("data-changed", "false");
  await expect(unchangedQuantity.getByTestId("proposal-revision-diff-before")).toHaveText("نامشخص · ثبت نشده");
  await expect(unchangedQuantity.getByTestId("proposal-revision-diff-after")).toHaveText("نامشخص · ثبت نشده");
  const secondCurrency = proposalRevisionDiffField(secondLine, "currency");
  await expect(secondCurrency).toHaveAttribute("data-changed", "false");
  await expect(secondCurrency.getByTestId("proposal-revision-diff-before")).toHaveText("تومان");
  await expect(secondCurrency.getByTestId("proposal-revision-diff-after")).toHaveText("تومان");

  await expect(page.getByTestId("proposal-revision-diff-boundary")).toContainText("ذخیره، ارسال یا تغییر نمی‌دهد");
  await openProposalRevisionDiffTechnical(page);
  const technical = page.getByTestId("proposal-revision-diff-technical");
  await expect(technical).toContainText("derivedReadOnly=true");
  await expect(technical).toContainText("persisted=false");
  await expect(technical).toContainText("arithmeticUsed=false");
  await expect(technical).toContainText("aiUsed=false");
  await expect(technical).toContainText("networkUsed=false");
  await expect(technical).toContainText("proposalMutated=false");
  await expect(technical).toContainText("externalEffect=none");
  await expect(view).toContainText("رونویسی");
  await expect(view).not.toContainText("تفاوت عددی");
  await expect(view).not.toContainText("درصد تغییر");
});

test("T8-A5a constrains revision pairs to baseline before candidate and fails closed without selector fallback", async ({ page }) => {
  const created = await createExactProductProposalRevisionPair(page, "فولاد انتخاب نسخه");
  const versionThree = await addThirdProductProposalRevision(page, created.supplierName);
  const [revisionOne, revisionTwo, revisionThree] = versionThree.proposal.revisions;
  const sourceBytes = versionThree.sourceBytes;
  await page.getByTestId("proposal-revision-diff-open").click();
  const baselineSelect = page.getByTestId("proposal-revision-diff-baseline-select");
  const candidateSelect = page.getByTestId("proposal-revision-diff-candidate-select");
  await expect(baselineSelect).toHaveValue(revisionTwo.id);
  await expect(candidateSelect).toHaveValue(revisionThree.id);
  await expect(page.getByTestId("proposal-revision-diff-pair-status")).toHaveText("نسخهٔ جاری");
  await expect(page.getByTestId("proposal-revision-diff-historical-note")).toHaveCount(0);

  await baselineSelect.selectOption(revisionOne.id);
  await candidateSelect.selectOption(revisionTwo.id);
  await expect(baselineSelect).toHaveValue(revisionOne.id);
  await expect(candidateSelect).toHaveValue(revisionTwo.id);
  await openProposalRevisionDiffTechnical(page);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(revisionOne.fingerprint);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(revisionTwo.fingerprint);
  await expect(page.getByTestId("proposal-revision-diff-pair-status")).toHaveText("نسخهٔ قدیمی");
  await expect(page.getByTestId("proposal-revision-diff-historical-note")).toContainText("نسخه قدیمی و فقط برای مشاهده");
  const enabledInvalidBaseline = await baselineSelect.locator(`option[value="${revisionTwo.id}"]:not(:disabled)`).count();
  const enabledInvalidCandidate = await candidateSelect.locator(`option[value="${revisionOne.id}"]:not(:disabled)`).count();
  expect(enabledInvalidBaseline).toBe(0);
  expect(enabledInvalidCandidate).toBe(0);

  await candidateSelect.evaluate((element) => {
    const select = element as HTMLSelectElement;
    const invalidOption = document.createElement("option");
    invalidOption.value = "foreign-revision-without-source";
    invalidOption.textContent = "revision نامعتبر";
    select.appendChild(invalidOption);
    select.value = invalidOption.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(page.getByTestId("proposal-revision-diff-unavailable")).toBeVisible();
  await expect(page.getByTestId("proposal-revision-diff-unavailable")).toContainText("قابل مقایسه نیستند");
  await expect(page.getByTestId("proposal-revision-diff-pair-status")).toHaveText("انتخاب نامعتبر");
  await expect(page.getByTestId("proposal-revision-diff-historical-note")).toHaveCount(0);
  expect(await allLocalStorageBytes(page)).toEqual(sourceBytes);
});

test("T8-A5a remains storage-free, preserves proposal version and history bytes, and makes zero external requests", async ({ page }) => {
  const created = await createExactProductProposalRevisionPair(page, "فولاد بدون اثر");
  const storageBefore = created.sourceBytes;
  const proposalBefore = structuredClone(created.proposal);
  const appOrigin = new URL(page.url()).origin;
  const externalRequests: string[] = [];
  const requestListener = (request: Request) => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== appOrigin) externalRequests.push(request.url());
  };
  page.on("request", requestListener);

  await page.getByTestId("proposal-revision-diff-open").click();
  await expect(page.getByTestId("proposal-revision-diff-view")).toBeVisible();
  await page.getByTestId("proposal-revision-diff-back").click();
  await expect(page.getByTestId("proposal-revision-diff-open")).toBeFocused();

  expect(await allLocalStorageBytes(page)).toEqual(storageBefore);
  const proposalAfter = JSON.parse(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1")) ?? "[]")
    .find((proposal: { id: string }) => proposal.id === proposalBefore.id);
  expect(proposalAfter).toEqual(proposalBefore);
  expect(proposalAfter.version).toBe(2);
  expect(proposalAfter.history).toHaveLength(2);
  expect(proposalAfter.revisions).toHaveLength(2);
  expect(externalRequests).toEqual([]);
  page.off("request", requestListener);
});

test("T8-A5a keeps a product revision comparison inside its active project", async ({ page }) => {
  const created = await createExactProductProposalRevisionPair(page, "فولاد جداسازی پروژه");
  await expect(page.getByTestId("proposal-revision-diff-open")).toBeVisible();
  await page.evaluate(() => {
    const projects = JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]");
    projects.push({ id: "t8a5a-isolation-project-b", name: "پروژه مستقل مقایسه نسخه", location: "منطقهٔ ۶", stage: "فونداسیون", usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-29T00:00:00.000Z" });
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify(projects));
    window.localStorage.setItem("chida-prototype-active-project", "t8a5a-isolation-project-b");
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-card")).toHaveCount(0);
  await expect(page.getByTestId("proposal-revision-diff-open")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(created.proposalStore);

  await page.evaluate((projectId) => window.localStorage.setItem("chida-prototype-active-project", projectId), created.projectId);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-card").filter({ hasText: created.supplierName }).click();
  await expect(page.getByTestId("proposal-revision-diff-open")).toBeVisible();
  await page.getByTestId("proposal-revision-diff-open").click();
  await openProposalRevisionDiffTechnical(page);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.proposal.id);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(created.proposalStore);
});

test("T8-A5a fails closed on tampered or unreadable proposal revisions without rewriting source bytes", async ({ page }) => {
  const created = await createExactProductProposalRevisionPair(page, "فولاد اثر انگشت مخدوش");
  const tamperedStore = await page.evaluate((proposalId) => {
    const key = "chida-prototype-builder-recorded-proposals:v1";
    const proposals = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    const proposal = proposals.find((item: { id: string }) => item.id === proposalId);
    proposal.revisions[1].fingerprint = "fnv1a-deadbeef";
    window.localStorage.setItem(key, JSON.stringify(proposals));
    return window.localStorage.getItem(key);
  }, created.proposal.id);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-storage-error")).toBeVisible();
  await expect(page.getByTestId("proposal-card")).toHaveCount(0);
  await expect(page.getByTestId("proposal-revision-diff-open")).toHaveCount(0);
  await expect(page.getByTestId("proposal-revision-diff-view")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(tamperedStore);

  await page.evaluate((validStore) => window.localStorage.setItem("chida-prototype-builder-recorded-proposals:v1", validStore!), created.proposalStore);
  await page.addInitScript(() => {
    const nativeGetItem = Storage.prototype.getItem;
    Object.defineProperty(window, "__t8a5aProposalNativeGetItem", { value: nativeGetItem, configurable: true });
    Storage.prototype.getItem = function getItem(key: string) {
      if (this === window.localStorage && key === "chida-prototype-builder-recorded-proposals:v1") throw new DOMException("Proposal revision diff read failed", "SecurityError");
      return nativeGetItem.call(this, key);
    };
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-storage-error")).toBeVisible();
  await expect(page.getByTestId("proposal-card")).toHaveCount(0);
  await expect(page.getByTestId("proposal-revision-diff-open")).toHaveCount(0);
  await expect(page.getByTestId("proposal-revision-diff-unavailable")).toHaveCount(0);
  expect(await page.evaluate(() => (window as Window & { __t8a5aProposalNativeGetItem: typeof Storage.prototype.getItem }).__t8a5aProposalNativeGetItem.call(window.localStorage, "chida-prototype-builder-recorded-proposals:v1"))).toBe(created.proposalStore);
});

test("T8-A5a keeps a historical product diff read-only with focus, accessible labels, and zero mobile overflow", async ({ page }) => {
  const created = await createExactProductProposalRevisionPair(page, "فولاد مقایسه تاریخی");
  await page.getByTestId("proposal-detail-back").click();
  await page.getByTestId("proposals-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await page.getByTestId("purchase-request-open-dispatch").click();
  const historicalProductContact = page.getByTestId("supplier-contact-card").filter({ hasText: created.supplierName });
  await historicalProductContact.locator("summary").click();
  await historicalProductContact.getByTestId("supplier-contact-status").click();
  await returnFromDispatchToHome(page);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-card").filter({ hasText: created.supplierName })).toContainText("نیازمند بررسی");
  await page.getByTestId("proposal-card").filter({ hasText: created.supplierName }).click();
  await expect(page.getByTestId("proposal-effective-status")).toHaveText("نیازمند بررسی");
  const storageBeforeDiff = await allLocalStorageBytes(page);
  const appOrigin = new URL(page.url()).origin;
  const externalRequests: string[] = [];
  const requestListener = (request: Request) => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== appOrigin) externalRequests.push(request.url());
  };
  page.on("request", requestListener);

  const open = page.getByTestId("proposal-revision-diff-open");
  await expect(open).toHaveAccessibleName(new RegExp(created.supplierName));
  await expect(open).toHaveAccessibleName(/نسخهٔ ۱ و ۲/);
  await open.click();
  const view = page.getByTestId("proposal-revision-diff-view");
  await expect(page.getByTestId("proposal-revision-diff-title")).toBeFocused();
  await expect(page.getByTestId("proposal-revision-diff-historical-note")).toBeVisible();
  await expect(page.getByTestId("proposal-revision-diff-historical-note")).toContainText("نسخه قدیمی و فقط برای مشاهده");
  await expect(page.getByTestId("proposal-revision-diff-baseline-select")).toHaveAccessibleName("نسخه قبلی");
  await expect(page.getByTestId("proposal-revision-diff-candidate-select")).toHaveAccessibleName("نسخه جدیدتر");
  expect(await view.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  const directionalValues = page.getByTestId("proposal-revision-diff-before").or(page.getByTestId("proposal-revision-diff-after"));
  const directionalValueCount = await directionalValues.count();
  expect(directionalValueCount).toBeGreaterThan(0);
  for (let index = 0; index < directionalValueCount; index += 1) await expect(directionalValues.nth(index)).toHaveAttribute("dir", "auto");
  await page.getByTestId("proposal-revision-diff-back").click();
  await expect(open).toBeFocused();
  expect(await allLocalStorageBytes(page)).toEqual(storageBeforeDiff);
  expect(externalRequests).toEqual([]);
  page.off("request", requestListener);
});

async function createExactServiceProposalRevisionPair(page: Page, supplierName = "مجری نسخه‌های پیشنهاد خدمت") {
  await page.setViewportSize({ width: 390, height: 844 });
  await createServiceProposalPrerequisites(page, supplierName);
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-add").click();
  await page.getByTestId("proposal-supplier-select").selectOption({ label: `${supplierName} · خدمت` });
  await openProposalAdvancedMode(page);
  await page.getByTestId("proposal-declared-at").fill("۱۴۰۵/۰۶/۰۶");
  await page.getByTestId("proposal-transcript").fill("نسخهٔ نخست رونویسی خدمت: مبلغ و زمان اولیه ثبت شد.");
  await page.getByTestId("proposal-line-status-0").selectOption("quoted");
  await page.getByTestId("proposal-line-quantity-0").fill("۸۵۰");
  await page.getByTestId("proposal-line-unit-0").fill("مترمربع");
  await page.getByTestId("proposal-line-unit-price-0").fill("9007199254740993");
  await page.getByTestId("proposal-line-total-price-0").fill(".0000001");
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-detail")).toBeVisible();

  const versionOneStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));
  const versionOneRecord = JSON.parse(versionOneStore ?? "[]").find((proposal: { supplierSnapshot: { displayName: string } }) => proposal.supplierSnapshot.displayName === supplierName);
  if (!versionOneRecord) throw new Error("T8-A5b version-one service proposal fixture was not stored");

  await page.getByTestId("proposal-edit").click();
  await openProposalAdvancedMode(page);
  await page.getByTestId("proposal-declared-at").fill("۱۴۰۵/۰۶/۰۷");
  await page.getByTestId("proposal-transcript").fill("نسخهٔ دوم رونویسی خدمت: مبلغ، زمان و پرداخت اصلاح شد.");
  await page.getByTestId("proposal-notes").fill("این فقط اصلاح رونویسی محلی خدمت توسط سازنده است.");
  await page.getByTestId("proposal-line-unit-price-0").fill("9007199254740994");
  await page.getByTestId("proposal-line-total-price-0").fill("");
  await page.getByTestId("proposal-line-tax-0").fill("نامشخص · ثبت نشده");
  await page.getByTestId("proposal-line-leadTime-0").fill("سه روز کاری");
  await page.getByTestId("proposal-line-validity-0").fill("تا پایان فردا");
  await page.getByTestId("proposal-line-paymentTerms-0").fill("بیست درصد پیش‌پرداخت و مانده مرحله‌ای");
  await page.getByTestId("proposal-line-notes-0").fill("زمان تجهیز کارگاه جداگانه اعلام شده است");
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-detail-hero")).toBeFocused();

  const proposalStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));
  const proposal = JSON.parse(proposalStore ?? "[]").find((item: { supplierSnapshot: { displayName: string } }) => item.supplierSnapshot.displayName === supplierName);
  if (!proposal || proposal.revisions.length !== 2 || proposal.target.requestKind !== "service") throw new Error("T8-A5b exact two-revision service proposal fixture is unavailable");
  const projectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  if (!projectId) throw new Error("T8-A5b active project fixture is unavailable");
  return {
    supplierName,
    projectId,
    versionOneStore,
    versionOneRecord,
    proposalStore,
    proposal,
    baseline: proposal.revisions[0],
    candidate: proposal.revisions[1],
    sourceBytes: await allLocalStorageBytes(page),
  };
}

async function addThirdServiceProposalRevision(page: Page, supplierName: string) {
  await page.getByTestId("proposal-edit").click();
  await openProposalAdvancedMode(page);
  await page.getByTestId("proposal-transcript").fill("نسخهٔ سوم رونویسی خدمت برای بررسی جفت تاریخی.");
  await page.getByTestId("proposal-line-validity-0").fill("تا پایان هفته");
  await page.getByTestId("proposal-save").click();
  await expect(page.getByTestId("proposal-detail-hero")).toBeFocused();
  const proposalStore = await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"));
  const proposal = JSON.parse(proposalStore ?? "[]").find((item: { supplierSnapshot: { displayName: string } }) => item.supplierSnapshot.displayName === supplierName);
  if (!proposal || proposal.revisions.length !== 3) throw new Error("T8-A5b exact three-revision service proposal fixture is unavailable");
  return { proposalStore, proposal, sourceBytes: await allLocalStorageBytes(page) };
}

test("T8-A5b defaults to the exact previous and current service proposal revisions with service lineage", async ({ page }) => {
  const created = await createExactServiceProposalRevisionPair(page);
  const open = page.getByTestId("proposal-revision-diff-open");
  await expect(open).toBeVisible();
  await expect(open).toHaveAccessibleName(new RegExp(created.supplierName));
  await expect(open).toHaveAccessibleName(/نسخهٔ ۱ و ۲/);
  await open.click();

  await expect(page.getByTestId("proposal-revision-diff-view")).toBeVisible();
  await expect(page.getByTestId("proposal-revision-diff-title")).toBeFocused();
  await expect(page.getByTestId("proposal-revision-diff-title")).toContainText("چه چیزی عوض شده؟");
  await expect(page.getByTestId("proposal-revision-diff-title")).not.toContainText("T8-");
  await expect(page.getByTestId("proposal-revision-diff-baseline-select")).toHaveAccessibleName("نسخه قبلی");
  await expect(page.getByTestId("proposal-revision-diff-candidate-select")).toHaveAccessibleName("نسخه جدیدتر");
  await expect(page.getByTestId("proposal-revision-diff-baseline-select")).toHaveValue(created.baseline.id);
  await expect(page.getByTestId("proposal-revision-diff-candidate-select")).toHaveValue(created.candidate.id);
  await openProposalRevisionDiffTechnical(page);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.proposal.id);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.proposal.target.requestId);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.supplierName);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.baseline.id);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.baseline.fingerprint);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.candidate.id);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.candidate.fingerprint);
  const serviceLine = proposalRevisionDiffLine(page, created.baseline.lines[0].id);
  await expect(serviceLine).toHaveAttribute("data-request-item-id", "null");
  await expect(serviceLine).toHaveAttribute("data-service-spec-id", created.baseline.lines[0].serviceSpecId);
});

test("T8-A5b shows all exact service proposal fields with explicit unknowns and no product comparison arithmetic", async ({ page }) => {
  const created = await createExactServiceProposalRevisionPair(page, "مجری تفاوت دقیق خدمت");
  await page.getByTestId("proposal-revision-diff-open").click();
  const view = page.getByTestId("proposal-revision-diff-view");
  await expect(page.getByTestId("proposal-revision-diff-line")).toHaveCount(1);
  await expect(page.getByTestId("proposal-revision-diff-field")).toHaveCount(16);
  await expect(page.getByTestId("proposal-revision-diff-summary")).toContainText("۱۰ مورد عوض شده");
  await expect(page.getByTestId("proposal-revision-diff-summary")).toContainText("۶ مورد ثابت");
  await openAllProposalRevisionDiffUnchanged(page);
  const keys = await page.getByTestId("proposal-revision-diff-field").evaluateAll((fields) => fields.map((field) => field.getAttribute("data-field")));
  expect(keys).toEqual(expect.arrayContaining(["declaredAt", "transcript", "notes", "status", "quantity", "unit", "unitPrice", "totalPrice", "currency", "tax", "transport", "minimumOrder", "leadTime", "validity", "paymentTerms", "lineNotes"]));

  const serviceLine = proposalRevisionDiffLine(page, created.baseline.lines[0].id);
  const unitPrice = proposalRevisionDiffField(serviceLine, "unitPrice");
  await expect(unitPrice.getByTestId("proposal-revision-diff-before")).toHaveText("9007199254740993");
  await expect(unitPrice.getByTestId("proposal-revision-diff-after")).toHaveText("9007199254740994");
  const totalPrice = proposalRevisionDiffField(serviceLine, "totalPrice");
  await expect(totalPrice.getByTestId("proposal-revision-diff-before")).toHaveText("0.0000001");
  await expect(totalPrice.getByTestId("proposal-revision-diff-after")).toHaveText("نامشخص · ثبت نشده");
  await expect(totalPrice.getByTestId("proposal-revision-diff-after")).toHaveAttribute("data-value-kind", "null");
  const tax = proposalRevisionDiffField(serviceLine, "tax");
  await expect(tax.getByTestId("proposal-revision-diff-before")).toHaveText("نامشخص · ثبت نشده");
  await expect(tax.getByTestId("proposal-revision-diff-before")).toHaveAttribute("data-value-kind", "null");
  await expect(tax.getByTestId("proposal-revision-diff-after")).toHaveText("نامشخص · ثبت نشده");
  await expect(tax.getByTestId("proposal-revision-diff-after")).toHaveAttribute("data-value-kind", "literal");
  await expect(tax.getByTestId("proposal-revision-diff-before-origin")).toHaveText("ثبت‌نشده در این نسخه");
  await expect(tax.getByTestId("proposal-revision-diff-after-origin")).toHaveText("متن ثبت‌شدهٔ سازنده");
  await expect(tax.getByTestId("proposal-revision-diff-before-origin")).toBeVisible();
  await expect(tax.getByTestId("proposal-revision-diff-after-origin")).toBeVisible();
  await expect(proposalRevisionDiffField(serviceLine, "currency")).toHaveAttribute("data-changed", "false");
  await expect(page.getByTestId("proposal-revision-diff-boundary")).toContainText("ذخیره، ارسال یا تغییر نمی‌دهد");
  await openProposalRevisionDiffTechnical(page);
  const technical = page.getByTestId("proposal-revision-diff-technical");
  await expect(technical).toContainText("derivedReadOnly=true");
  await expect(technical).toContainText("persisted=false");
  await expect(technical).toContainText("arithmeticUsed=false");
  await expect(technical).toContainText("aiUsed=false");
  await expect(technical).toContainText("networkUsed=false");
  await expect(technical).toContainText("proposalMutated=false");
  await expect(technical).toContainText("comparisonMutated=false");
  await expect(technical).toContainText("externalEffect=none");
  await expect(view).toContainText("شرایطی که عوض شده");
  await expect(view).not.toContainText("ماتریس معیارهای خدمت");
  await expect(view).not.toContainText("تفاوت عددی");
  await expect(view).not.toContainText("درصد تغییر");
  await expect(view).not.toContainText("بهترین");
});

test("T8-A5b constrains service revision pairs and fails closed without selector fallback", async ({ page }) => {
  const created = await createExactServiceProposalRevisionPair(page, "مجری انتخاب نسخه خدمت");
  const versionThree = await addThirdServiceProposalRevision(page, created.supplierName);
  const [revisionOne, revisionTwo, revisionThree] = versionThree.proposal.revisions;
  const sourceBytes = versionThree.sourceBytes;
  await page.getByTestId("proposal-revision-diff-open").click();
  const baselineSelect = page.getByTestId("proposal-revision-diff-baseline-select");
  const candidateSelect = page.getByTestId("proposal-revision-diff-candidate-select");
  await expect(baselineSelect).toHaveValue(revisionTwo.id);
  await expect(candidateSelect).toHaveValue(revisionThree.id);
  await expect(page.getByTestId("proposal-revision-diff-pair-status")).toHaveText("نسخهٔ جاری");

  await baselineSelect.selectOption(revisionOne.id);
  await candidateSelect.selectOption(revisionTwo.id);
  await expect(page.getByTestId("proposal-revision-diff-pair-status")).toHaveText("نسخهٔ قدیمی");
  await openProposalRevisionDiffTechnical(page);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(revisionOne.fingerprint);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(revisionTwo.fingerprint);
  expect(await baselineSelect.locator(`option[value="${revisionTwo.id}"]:not(:disabled)`).count()).toBe(0);
  expect(await candidateSelect.locator(`option[value="${revisionOne.id}"]:not(:disabled)`).count()).toBe(0);

  await candidateSelect.evaluate((element) => {
    const select = element as HTMLSelectElement;
    const invalidOption = document.createElement("option");
    invalidOption.value = "foreign-service-revision-without-source";
    invalidOption.textContent = "revision خدمت نامعتبر";
    select.appendChild(invalidOption);
    select.value = invalidOption.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(page.getByTestId("proposal-revision-diff-unavailable")).toBeVisible();
  await expect(page.getByTestId("proposal-revision-diff-pair-status")).toHaveText("انتخاب نامعتبر");
  await expect(page.getByTestId("proposal-revision-diff-historical-note")).toHaveCount(0);
  expect(await allLocalStorageBytes(page)).toEqual(sourceBytes);
});

test("T8-A5b remains storage-free, mutation-free, and makes zero external requests", async ({ page }) => {
  const created = await createExactServiceProposalRevisionPair(page, "مجری خدمت بدون اثر");
  const storageBefore = created.sourceBytes;
  const proposalBefore = structuredClone(created.proposal);
  const appOrigin = new URL(page.url()).origin;
  const externalRequests: string[] = [];
  const requestListener = (request: Request) => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== appOrigin) externalRequests.push(request.url());
  };
  page.on("request", requestListener);

  await page.getByTestId("proposal-revision-diff-open").click();
  await expect(page.getByTestId("proposal-revision-diff-view")).toBeVisible();
  await page.getByTestId("proposal-revision-diff-back").click();
  await expect(page.getByTestId("proposal-revision-diff-open")).toBeFocused();
  expect(await allLocalStorageBytes(page)).toEqual(storageBefore);
  const proposalAfter = JSON.parse(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1")) ?? "[]")
    .find((proposal: { id: string }) => proposal.id === proposalBefore.id);
  expect(proposalAfter).toEqual(proposalBefore);
  expect(proposalAfter.version).toBe(2);
  expect(proposalAfter.history).toHaveLength(2);
  expect(proposalAfter.revisions).toHaveLength(2);
  expect(externalRequests).toEqual([]);
  page.off("request", requestListener);
});

test("T8-A5b keeps a service revision comparison inside its active project", async ({ page }) => {
  const created = await createExactServiceProposalRevisionPair(page, "مجری جداسازی پروژه خدمت");
  await expect(page.getByTestId("proposal-revision-diff-open")).toBeVisible();
  await page.evaluate(() => {
    const projects = JSON.parse(window.localStorage.getItem("chida-prototype-builder-projects:v2") ?? "[]");
    projects.push({ id: "t8a5b-isolation-project-b", name: "پروژه مستقل مقایسه نسخه خدمت", location: "منطقهٔ ۶", stage: "فونداسیون", usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-29T00:00:00.000Z" });
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify(projects));
    window.localStorage.setItem("chida-prototype-active-project", "t8a5b-isolation-project-b");
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-card")).toHaveCount(0);
  await expect(page.getByTestId("proposal-revision-diff-open")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(created.proposalStore);

  await page.evaluate((projectId) => window.localStorage.setItem("chida-prototype-active-project", projectId), created.projectId);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await page.getByTestId("proposal-card").filter({ hasText: created.supplierName }).click();
  await expect(page.getByTestId("proposal-revision-diff-open")).toBeVisible();
  await page.getByTestId("proposal-revision-diff-open").click();
  await openProposalRevisionDiffTechnical(page);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.proposal.id);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(created.proposalStore);
});

test("T8-A5b fails closed on tampered or unreadable service proposal revisions without rewriting source bytes", async ({ page }) => {
  const created = await createExactServiceProposalRevisionPair(page, "مجری اثر انگشت مخدوش خدمت");
  const tamperedStore = await page.evaluate((proposalId) => {
    const key = "chida-prototype-builder-recorded-proposals:v1";
    const proposals = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    const validProposal = proposals.find((item: { id: string }) => item.id === proposalId);
    const tamperedProposal = structuredClone(validProposal);
    tamperedProposal.id = `${validProposal.id}-tampered-sibling`;
    tamperedProposal.revisions[1].fingerprint = "fnv1a-deadbeef";
    window.localStorage.setItem(key, JSON.stringify([validProposal, tamperedProposal]));
    return window.localStorage.getItem(key);
  }, created.proposal.id);

  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-storage-error")).toBeVisible();
  await expect(page.getByTestId("proposal-card")).toHaveCount(0);
  await expect(page.getByTestId("proposal-revision-diff-open")).toHaveCount(0);
  await expect(page.getByTestId("proposal-empty-state")).toHaveCount(0);
  await expect(page.getByTestId("project-proposals-toolbar")).toHaveCount(0);
  await expect(page.getByTestId("proposal-comparisons-entry")).toHaveCount(0);
  await expect(page.getByTestId("service-proposal-comparisons-entry")).toHaveCount(0);
  await expect(page.getByTestId("negotiation-drafts-entry")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1"))).toBe(tamperedStore);

  await page.evaluate((validStore) => window.localStorage.setItem("chida-prototype-builder-recorded-proposals:v1", validStore!), created.proposalStore);
  await page.addInitScript(() => {
    const nativeGetItem = Storage.prototype.getItem;
    Object.defineProperty(window, "__t8a5bProposalNativeGetItem", { value: nativeGetItem, configurable: true });
    Storage.prototype.getItem = function getItem(key: string) {
      if (this === window.localStorage && key === "chida-prototype-builder-recorded-proposals:v1") throw new DOMException("Service proposal revision diff read failed", "SecurityError");
      return nativeGetItem.call(this, key);
    };
  });
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-storage-error")).toBeVisible();
  await expect(page.getByTestId("proposal-card")).toHaveCount(0);
  await expect(page.getByTestId("proposal-revision-diff-open")).toHaveCount(0);
  await expect(page.getByTestId("proposal-empty-state")).toHaveCount(0);
  expect(await page.evaluate(() => (window as Window & { __t8a5bProposalNativeGetItem: typeof Storage.prototype.getItem }).__t8a5bProposalNativeGetItem.call(window.localStorage, "chida-prototype-builder-recorded-proposals:v1"))).toBe(created.proposalStore);
});

test("T8-A5b keeps a historical service diff read-only with focus, exact lineage, and zero mobile overflow", async ({ page }) => {
  const created = await createExactServiceProposalRevisionPair(page, "مجری مقایسه تاریخی خدمت");
  await page.getByTestId("proposal-detail-back").click();
  await page.getByTestId("proposals-back").click();
  await page.getByTestId("quick-action-purchase-request").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("purchase-request-card").click();
  await page.getByTestId("purchase-request-open-dispatch").click();
  const historicalServiceContact = page.getByTestId("supplier-contact-card").filter({ hasText: created.supplierName });
  await historicalServiceContact.locator("summary").click();
  await historicalServiceContact.getByTestId("supplier-contact-status").click();
  await returnFromDispatchToHome(page);
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await page.getByTestId("quick-action-compare-offers").click();
  await expect(page.getByTestId("proposal-card").filter({ hasText: created.supplierName })).toContainText("نیازمند بررسی");
  await page.getByTestId("proposal-card").filter({ hasText: created.supplierName }).click();
  await expect(page.getByTestId("proposal-effective-status")).toHaveText("نیازمند بررسی");
  const storageBeforeDiff = await allLocalStorageBytes(page);
  const appOrigin = new URL(page.url()).origin;
  const externalRequests: string[] = [];
  const requestListener = (request: Request) => {
    const url = new URL(request.url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== appOrigin) externalRequests.push(request.url());
  };
  page.on("request", requestListener);

  const open = page.getByTestId("proposal-revision-diff-open");
  await expect(open).toHaveAccessibleName(new RegExp(created.supplierName));
  await open.click();
  const view = page.getByTestId("proposal-revision-diff-view");
  await expect(page.getByTestId("proposal-revision-diff-title")).toBeFocused();
  await expect(page.getByTestId("proposal-revision-diff-historical-note")).toContainText("نسخه قدیمی و فقط برای مشاهده");
  await openProposalRevisionDiffTechnical(page);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.baseline.id);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.baseline.fingerprint);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.candidate.id);
  await expect(page.getByTestId("proposal-revision-diff-source")).toContainText(created.candidate.fingerprint);
  await expect(proposalRevisionDiffLine(page, created.baseline.lines[0].id)).toHaveAttribute("data-service-spec-id", created.baseline.lines[0].serviceSpecId);
  await expect(page.getByTestId("proposal-revision-diff-baseline-select")).toHaveAccessibleName("نسخه قبلی");
  await expect(page.getByTestId("proposal-revision-diff-candidate-select")).toHaveAccessibleName("نسخه جدیدتر");
  expect(await view.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  const directionalValues = page.getByTestId("proposal-revision-diff-before").or(page.getByTestId("proposal-revision-diff-after"));
  const directionalValueCount = await directionalValues.count();
  expect(directionalValueCount).toBeGreaterThan(0);
  for (let index = 0; index < directionalValueCount; index += 1) await expect(directionalValues.nth(index)).toHaveAttribute("dir", "auto");
  await page.getByTestId("proposal-revision-diff-back").click();
  await expect(open).toBeFocused();
  expect(await allLocalStorageBytes(page)).toEqual(storageBeforeDiff);
  expect(externalRequests).toEqual([]);
  page.off("request", requestListener);
});

test("T8-UX1 keeps exact request quantity and declared-total comparison available in simple proposal mode", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { firstSupplier } = await createTwoCurrentProductProposalsForComparison(page, { firstSimpleDeclaredTotal: true });
  const source = await page.evaluate((supplierName) => {
    const proposals = JSON.parse(window.localStorage.getItem("chida-prototype-builder-recorded-proposals:v1") ?? "[]");
    const requests = JSON.parse(window.localStorage.getItem("chida-prototype-project-purchase-requests:v1") ?? "[]");
    const proposal = proposals.find((item: { supplierSnapshot: { displayName: string } }) => item.supplierSnapshot.displayName === supplierName);
    const request = requests.find((item: { id: string }) => item.id === proposal.target.requestId);
    const revision = proposal.revisions.find((item: { id: string }) => item.id === proposal.currentRevisionId);
    return { proposal, request, revision };
  }, firstSupplier);

  expect(source.revision.lines[0]).toMatchObject({
    status: "quoted",
    quantity: source.request.items[0].quantity,
    unit: source.request.items[0].unit,
    totalPrice: "21500000",
    unitPrice: null,
  });

  await openProposalSecondaryView(page, "proposal-comparisons-entry");
  await page.getByTestId("comparison-add").click();
  const firstEditor = comparisonSupplierEditor(page, firstSupplier);
  await expect(firstEditor.getByTestId(/^comparison-basis-/)).toHaveValue("declared-total");
  await page.getByTestId("comparison-save").click();
  await expect(page.getByTestId("comparison-detail")).toBeVisible();

  const comparison = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-builder-proposal-comparisons:v1") ?? "[]")[0]);
  const comparisonRevision = comparison.revisions.find((item: { id: string }) => item.id === comparison.currentRevisionId);
  const input = comparisonRevision.inputs.find((item: { proposalId: string }) => item.proposalId === source.proposal.id);
  const result = comparisonRevision.results.find((item: { proposalId: string }) => item.proposalId === source.proposal.id);
  expect(input.lineAdjustments[0]).toMatchObject({
    basis: "declared-total",
    adjustedQuantity: null,
    adjustedQuantityUnit: null,
    assumption: null,
  });
  expect(result.lines[0].calculation).toMatchObject({
    formula: "قیمت کل اعلامی 21500000 تومان",
    basisAmount: "21500000",
    normalizedLineTotal: "21500000",
    status: "complete",
  });
});

test("T8-UX1 keeps the proposal journey calm by default and preserves every advanced value", async ({ page }) => {
  const created = await createExactServiceProposalRevisionPair(page, "مجری تجربه ساده پیشنهاد");
  const sourceBytes = await allLocalStorageBytes(page);

  await expect(page.getByTestId("proposal-summary")).toBeVisible();
  await expect(page.getByTestId("proposal-detail-technical")).not.toHaveAttribute("open", "");
  await expect(page.getByText(created.proposal.target.reviewRevisionId, { exact: true })).toBeHidden();

  await page.getByTestId("proposal-edit").click();
  await expect(page.getByTestId("proposal-editor-mode-simple")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("proposal-editor-advanced")).toBeHidden();
  await page.getByTestId("proposal-line-total-price-0").fill("۱۲۳۴۵۶");
  await page.getByTestId("proposal-editor-mode-advanced").click();
  await expect(page.getByTestId("proposal-editor-advanced")).toBeVisible();
  await expect(page.getByTestId("proposal-line-total-price-0")).toHaveValue("۱۲۳۴۵۶");
  await page.getByTestId("proposal-editor-mode-simple").click();
  await expect(page.getByTestId("proposal-editor-advanced")).toBeHidden();
  await expect(page.getByTestId("proposal-line-total-price-0")).toHaveValue("۱۲۳۴۵۶");
  await page.getByTestId("proposal-editor-back").click();

  await page.getByTestId("proposal-revision-diff-open").click();
  await expect(page.getByTestId("proposal-revision-diff-title")).toContainText("چه چیزی عوض شده؟");
  await expect(page.getByTestId("proposal-revision-diff-title")).not.toContainText("T8-");
  await expect(page.locator('[data-testid="proposal-revision-diff-field"]:visible')).toHaveCount(10);
  await expect(page.getByTestId("proposal-revision-diff-technical")).not.toHaveAttribute("open", "");
  await expect(page.getByText(created.proposal.id, { exact: true })).toBeHidden();
  await page.getByTestId("proposal-revision-diff-technical").locator("summary").click();
  await expect(page.getByText(created.proposal.id, { exact: true })).toBeVisible();
  const unchangedDisclosures = page.getByTestId("proposal-revision-diff-unchanged");
  for (let index = 0; index < await unchangedDisclosures.count(); index += 1) {
    await unchangedDisclosures.nth(index).locator("summary").click();
  }
  await expect(page.locator('[data-testid="proposal-revision-diff-field"]:visible')).toHaveCount(16);
  await page.getByTestId("proposal-revision-diff-back").click();
  await page.getByTestId("proposal-detail-back").click();

  await expect(page.getByRole("heading", { name: "پیشنهادها" })).toBeVisible();
  await expect(page.getByTestId("proposal-main-action")).toBeVisible();
  await expect(page.locator('.project-proposals-content .primary-button:visible')).toHaveCount(1);
  await expect(page.getByTestId("proposal-secondary-actions")).not.toHaveAttribute("open", "");
  await expect(page.getByTestId("proposal-comparisons-entry")).toBeHidden();
  await expect(page.getByTestId("service-proposal-comparisons-entry")).toBeHidden();
  await expect(page.getByTestId("negotiation-drafts-entry")).toBeHidden();

  expect(await allLocalStorageBytes(page)).toEqual(sourceBytes);
});

const projectBackboneStorageKey = "chida-prototype-project-backbone:v1";

type ProjectBackboneRevisionFixture = {
  id: string;
  version: number;
  createdAt: string;
  snapshot: Record<string, unknown>;
  fingerprint: string;
  [key: string]: unknown;
};

type ProjectBackboneRecordFixture = {
  id: string;
  objectType: "milestone" | "decision" | "task";
  projectId: string;
  version: number;
  currentRevisionId: string;
  createdAt: string;
  updatedAt: string;
  history: Array<{ type: string; version: number; at: string }>;
  revisions: ProjectBackboneRevisionFixture[];
};

type ProjectBackboneEnvelopeFixture = {
  schemaVersion: number;
  milestones: ProjectBackboneRecordFixture[];
  decisions: ProjectBackboneRecordFixture[];
  tasks: ProjectBackboneRecordFixture[];
};

const initialProjectBackboneDraft = {
  milestoneTitle: "پ".repeat(80),
  decisionStatement: "بتن‌ریزی فونداسیون در یک مرحله انجام شود",
  decisionReason: "برای کاهش درز سرد و هماهنگ‌ماندن برنامهٔ اجرا با آزمایشگاه بتن",
  taskTitle: "هماهنگی بتن‌ریزی فونداسیون",
  taskNextStep: "تأیید برنامهٔ پمپ و حضور آزمایشگاه را بگیر",
};

const updatedProjectBackboneDraft = {
  milestoneTitle: "آماده‌سازی فونداسیون برای اجرای ستون‌ها",
  decisionStatement: "بتن‌ریزی فونداسیون در دو جبههٔ هماهنگ انجام شود",
  decisionReason: "برای حفظ دسترسی کارگاه و کنترل زمان ورود تراک‌میکسرها",
  taskTitle: "هماهنگی نهایی اجرای فونداسیون",
  taskNextStep: "برنامهٔ دو جبهه را با ناظر و آزمایشگاه نهایی کن",
};

async function openProjectBackbone(page: Page) {
  await page.getByTestId("quick-action-project-plan").click();
  await expect(page.getByTestId("project-backbone-view")).toBeVisible();
}

async function openProjectBackboneCreate(page: Page) {
  await openProjectBackbone(page);
  await page.getByTestId("project-backbone-start").click();
}

async function fillProjectBackboneForm(page: Page, draft: typeof initialProjectBackboneDraft & { taskDueAt?: string }) {
  await page.getByTestId("backbone-milestone-title").fill(draft.milestoneTitle);
  await page.getByTestId("backbone-decision-statement").fill(draft.decisionStatement);
  await page.getByTestId("backbone-decision-reason").fill(draft.decisionReason);
  await page.getByTestId("backbone-task-title").fill(draft.taskTitle);
  await page.getByTestId("backbone-task-next-step").fill(draft.taskNextStep);
  if (draft.taskDueAt !== undefined) await page.getByTestId("backbone-task-due-at").fill(draft.taskDueAt);
}

async function expectProjectBackboneEditorRtl(page: Page) {
  const sheet = page.getByTestId("bottom-sheet");
  const editor = page.getByTestId("project-backbone-editor");
  await expect(sheet).toHaveCSS("direction", "rtl");
  await expect(sheet).toHaveCSS("text-align", "right");
  await expect(editor).toHaveAttribute("dir", "rtl");
  for (const selector of [
    ".sheet-title",
    ".sheet-description",
    ".project-backbone-editor-section > strong",
    ".project-backbone-editor-section > small",
    ".field-control > span",
  ]) {
    const copies = sheet.locator(selector);
    const count = await copies.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) await expect(copies.nth(index)).toHaveCSS("text-align", "right");
  }
  for (const testId of [
    "backbone-milestone-title",
    "backbone-decision-statement",
    "backbone-decision-reason",
    "backbone-task-title",
    "backbone-task-next-step",
  ]) {
    const field = page.getByTestId(testId);
    await expect(field).toHaveCSS("direction", "rtl");
    await expect(field).toHaveCSS("text-align", "right");
  }
  const dueField = page.getByTestId("backbone-task-due-at");
  await expect(dueField).toHaveAttribute("dir", "ltr");
  await expect(dueField).toHaveCSS("direction", "ltr");
  await expect(dueField).toHaveCSS("text-align", "left");
}

async function createProjectBackbone(page: Page, draft = initialProjectBackboneDraft) {
  await openProjectBackboneCreate(page);
  await fillProjectBackboneForm(page, draft);
  await page.getByTestId("project-backbone-save").click();
  await expect(page.getByTestId("project-backbone-milestone")).toContainText(draft.milestoneTitle);
  await expect(page.getByTestId("project-backbone-decision")).toContainText(draft.decisionStatement);
  await expect(page.getByTestId("project-backbone-reason")).toContainText(draft.decisionReason);
  await expect(page.getByTestId("project-backbone-task")).toContainText(draft.taskTitle);
  await expect(page.getByTestId("project-backbone-task")).toContainText(draft.taskNextStep);
}

const projectTaskMonitorsStorageKey = "chida-prototype-project-task-monitors:v1";

async function openProjectTaskMonitorsFromHome(page: Page) {
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-monitor").click();
}

async function createProjectTaskDeadlineMonitor(page: Page) {
  await openProjectTaskMonitorsFromHome(page);
  await page.getByTestId("project-task-monitor-create").click();
  await expect(page.getByTestId("project-task-monitor-detail")).toBeVisible();
}

async function readProjectBackboneEnvelope(page: Page) {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (raw === null) throw new Error("Project Backbone store is missing");
    return JSON.parse(raw) as ProjectBackboneEnvelopeFixture;
  }, projectBackboneStorageKey);
}

function currentProjectBackboneSnapshot(record: ProjectBackboneRecordFixture) {
  const revision = record.revisions.find((item) => item.id === record.currentRevisionId);
  if (!revision) throw new Error(`Current revision is missing for ${record.id}`);
  return revision.snapshot;
}

function expectProjectBackboneVersion(record: ProjectBackboneRecordFixture, version: number) {
  expect(record.version).toBe(version);
  expect(record.history.map((event) => event.version)).toEqual(Array.from({ length: version }, (_, index) => index + 1));
  expect(record.revisions.map((revision) => revision.version)).toEqual(Array.from({ length: version }, (_, index) => index + 1));
  expect(record.currentRevisionId).toBe(record.revisions.at(-1)?.id);
}

function expectExactProjectBackboneLinks(
  milestone: ProjectBackboneRecordFixture,
  decision: ProjectBackboneRecordFixture,
  task: ProjectBackboneRecordFixture,
) {
  const decisionBytes = JSON.stringify(decision);
  const taskBytes = JSON.stringify(task);
  expect(decisionBytes).toContain(milestone.id);
  expect(decisionBytes).toContain(task.id);
  expect(taskBytes).toContain(milestone.id);
  expect(taskBytes).toContain(decision.id);
}

async function reenterBuilderHomeAfterReload(page: Page) {
  await page.reload();
  await reachBuilderWelcome(page);
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("builder-home")).toBeVisible();
}

test("Project Backbone creates one exactly linked project plan, reloads it, and stays inside 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const activeProjectId = await page.evaluate(() => window.localStorage.getItem("chida-prototype-active-project"));
  const legacyTaskBytes = await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"));
  expect(legacyTaskBytes).toBeNull();

  await createProjectBackbone(page);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"))).toBe(legacyTaskBytes);

  const envelope = await readProjectBackboneEnvelope(page);
  expect(envelope.schemaVersion).toBe(1);
  expect(envelope.milestones).toHaveLength(1);
  expect(envelope.decisions).toHaveLength(1);
  expect(envelope.tasks).toHaveLength(1);
  const [milestone] = envelope.milestones;
  const [decision] = envelope.decisions;
  const [task] = envelope.tasks;
  expect(milestone.projectId).toBe(activeProjectId);
  expect(decision.projectId).toBe(activeProjectId);
  expect(task.projectId).toBe(activeProjectId);
  expectProjectBackboneVersion(milestone, 1);
  expectProjectBackboneVersion(decision, 1);
  expectProjectBackboneVersion(task, 1);
  expect(currentProjectBackboneSnapshot(milestone)).toMatchObject({ title: initialProjectBackboneDraft.milestoneTitle });
  expect(currentProjectBackboneSnapshot(decision)).toMatchObject({
    statement: initialProjectBackboneDraft.decisionStatement,
    reason: initialProjectBackboneDraft.decisionReason,
  });
  expect(currentProjectBackboneSnapshot(task)).toMatchObject({
    title: initialProjectBackboneDraft.taskTitle,
    nextStep: initialProjectBackboneDraft.taskNextStep,
  });
  expectExactProjectBackboneLinks(milestone, decision, task);

  const view = page.getByTestId("project-backbone-view");
  expect(await view.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  for (const testId of ["project-backbone-milestone", "project-backbone-decision", "project-backbone-reason", "project-backbone-task"]) {
    expect(await page.getByTestId(testId).evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  }

  await page.getByTestId("project-backbone-back").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await expect(page.getByTestId("project-backbone-task-card")).toContainText(initialProjectBackboneDraft.taskTitle);
  await expect(page.getByTestId("project-backbone-task-card")).toContainText("متصل به برنامهٔ پروژه");
  await page.getByTestId("project-backbone-task-card").click();
  await expect(page.getByTestId("project-backbone-view")).toBeVisible();

  const persistedBytes = await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey);
  await reenterBuilderHomeAfterReload(page);
  await openProjectBackbone(page);
  await expect(page.getByTestId("project-backbone-reason")).toContainText(initialProjectBackboneDraft.decisionReason);
  await expect(page.getByTestId("project-backbone-task")).toContainText(initialProjectBackboneDraft.taskNextStep);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey)).toBe(persistedBytes);
  expect(await page.evaluate(() => window.localStorage.getItem("chida-prototype-project-tasks:v1"))).toBe(legacyTaskBytes);
});

test("Project Backbone create and edit sheets keep Persian fields true RTL and right-aligned", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await openProjectBackboneCreate(page);
  await fillProjectBackboneForm(page, initialProjectBackboneDraft);
  await expectProjectBackboneEditorRtl(page);

  await page.getByTestId("project-backbone-save").click();
  await page.getByTestId("project-backbone-edit").click();
  await expectProjectBackboneEditorRtl(page);
});

test("Project Backbone requires a visible decision reason before writing anything", async ({ page }) => {
  await enterBuilderHome(page);
  await openProjectBackboneCreate(page);
  await fillProjectBackboneForm(page, { ...initialProjectBackboneDraft, decisionReason: "\u200c\u200b" });
  await page.getByTestId("project-backbone-save").click();

  await expect(page.getByTestId("project-backbone-error")).toContainText("دلیل");
  await expect(page.getByTestId("project-backbone-view")).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey)).toBeNull();
});

test("Project Backbone rejects a reason made only of bidi controls with an accessible field error", async ({ page }) => {
  await enterBuilderHome(page);
  await openProjectBackboneCreate(page);
  const bidiControlsOnly = "\u200e\u200f\u061c\u2066\u2067\u2068\u2069";
  await fillProjectBackboneForm(page, { ...initialProjectBackboneDraft, decisionReason: bidiControlsOnly });
  const reasonField = page.getByTestId("backbone-decision-reason");
  await page.getByTestId("project-backbone-save").click();

  await expect(reasonField).toHaveAttribute("aria-invalid", "true");
  const describedBy = await reasonField.getAttribute("aria-describedby");
  expect(describedBy?.trim()).toBeTruthy();
  const describedElements = describedBy!.trim().split(/\s+/).map((id) => page.locator(`#${id}`));
  expect(describedElements.length).toBeGreaterThan(0);
  const describedText = (await Promise.all(describedElements.map((element) => element.textContent()))).join(" ");
  expect(describedText).toContain("دلیل");
  await expect(page.getByTestId("project-backbone-error")).toContainText("دلیل");
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey)).toBeNull();
});

test("Project Backbone keeps plans and links inside their owning project", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    const projectBase = { usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-30T08:00:00.000Z" };
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify([
      { ...projectBase, id: "project-backbone-a", name: "پروژه الف", location: "ونک", stage: "فونداسیون" },
      { ...projectBase, id: "project-backbone-b", name: "پروژه ب", location: "جردن", stage: "نازک کاری و نما" },
    ]));
    window.localStorage.setItem("chida-prototype-active-project", "project-backbone-a");
  });
  await enterBuilderHome(page);
  const projectADraft = { ...initialProjectBackboneDraft, milestoneTitle: "نقطه عطف فقط پروژه الف" };
  await createProjectBackbone(page, projectADraft);

  await reenterBuilderHomeAfterReload(page);
  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /پروژه ب تهران/ }).click();
  await page.getByTestId("project-space-back").click();
  await openProjectBackbone(page);
  await expect(page.getByTestId("project-backbone-start")).toBeVisible();
  await expect(page.getByText(projectADraft.milestoneTitle, { exact: true })).toHaveCount(0);

  await page.getByTestId("project-backbone-start").click();
  const projectBDraft = { ...updatedProjectBackboneDraft, milestoneTitle: "نقطه عطف فقط پروژه ب" };
  await fillProjectBackboneForm(page, projectBDraft);
  await page.getByTestId("project-backbone-save").click();
  await expect(page.getByTestId("project-backbone-milestone")).toContainText(projectBDraft.milestoneTitle);

  const envelope = await readProjectBackboneEnvelope(page);
  expect(envelope.milestones).toHaveLength(2);
  expect(envelope.decisions).toHaveLength(2);
  expect(envelope.tasks).toHaveLength(2);
  for (const projectId of ["project-backbone-a", "project-backbone-b"]) {
    const milestone = envelope.milestones.find((record) => record.projectId === projectId);
    const decision = envelope.decisions.find((record) => record.projectId === projectId);
    const task = envelope.tasks.find((record) => record.projectId === projectId);
    if (!milestone || !decision || !task) throw new Error(`Backbone records are missing for ${projectId}`);
    expectExactProjectBackboneLinks(milestone, decision, task);
    const foreignRecords = [...envelope.milestones, ...envelope.decisions, ...envelope.tasks].filter((record) => record.projectId !== projectId);
    for (const foreignRecord of foreignRecords) {
      expect(JSON.stringify(milestone)).not.toContain(foreignRecord.id);
      expect(JSON.stringify(decision)).not.toContain(foreignRecord.id);
      expect(JSON.stringify(task)).not.toContain(foreignRecord.id);
    }
  }

  await reenterBuilderHomeAfterReload(page);
  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /پروژه الف تهران/ }).click();
  await page.getByTestId("project-space-back").click();
  await openProjectBackbone(page);
  await expect(page.getByTestId("project-backbone-milestone")).toContainText(projectADraft.milestoneTitle);
  await expect(page.getByText(projectBDraft.milestoneTitle, { exact: true })).toHaveCount(0);
});

test("Project Backbone keeps no-op bytes stable and rolls every edited object back as a new version", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await createProjectBackbone(page);
  const versionOneBytes = await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey);
  const versionOneEnvelope = await readProjectBackboneEnvelope(page);

  await page.getByTestId("project-backbone-edit").click();
  await page.getByTestId("project-backbone-save").click();
  await expect(page.getByTestId("project-backbone-status")).toContainText("بایت‌ها ثابت ماندند");
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey)).toBe(versionOneBytes);

  await reenterBuilderHomeAfterReload(page);
  await openProjectBackbone(page);
  await page.getByTestId("project-backbone-edit").click();
  await fillProjectBackboneForm(page, updatedProjectBackboneDraft);
  await installBackwardBrowserClock(page);
  expect(await page.evaluate(() => Date.now())).toBeLessThan(Math.min(
    ...[versionOneEnvelope.milestones[0], versionOneEnvelope.decisions[0], versionOneEnvelope.tasks[0]].map((record) => Date.parse(record.updatedAt)),
  ));
  await page.getByTestId("project-backbone-save").click();
  await expect(page.getByTestId("project-backbone-status")).toContainText("نسخهٔ تازه");

  const versionTwoEnvelope = await readProjectBackboneEnvelope(page);
  for (const [versionOneRecord, versionTwoRecord] of [
    [versionOneEnvelope.milestones[0], versionTwoEnvelope.milestones[0]],
    [versionOneEnvelope.decisions[0], versionTwoEnvelope.decisions[0]],
    [versionOneEnvelope.tasks[0], versionTwoEnvelope.tasks[0]],
  ] satisfies Array<[ProjectBackboneRecordFixture, ProjectBackboneRecordFixture]>) {
    expectProjectBackboneVersion(versionTwoRecord, 2);
    expect(versionTwoRecord.revisions[0]).toEqual(versionOneRecord.revisions[0]);
    const previousEvent = versionOneRecord.history.at(-1);
    const nextEvent = versionTwoRecord.history.at(-1);
    const previousRevision = versionOneRecord.revisions.at(-1);
    const nextRevision = versionTwoRecord.revisions.at(-1);
    if (!previousEvent || !nextEvent || !previousRevision || !nextRevision) throw new Error(`Backbone timestamps are missing for ${versionTwoRecord.id}`);
    expect(Date.parse(versionTwoRecord.updatedAt)).toBeGreaterThanOrEqual(Date.parse(versionOneRecord.updatedAt));
    expect(Date.parse(nextEvent.at)).toBeGreaterThanOrEqual(Date.parse(previousEvent.at));
    expect(Date.parse(nextRevision.createdAt)).toBeGreaterThanOrEqual(Date.parse(previousRevision.createdAt));
    expect(versionTwoRecord.updatedAt).toBe(nextEvent.at);
    expect(nextRevision.createdAt).toBe(nextEvent.at);
  }
  expect(currentProjectBackboneSnapshot(versionTwoEnvelope.milestones[0])).toMatchObject({ title: updatedProjectBackboneDraft.milestoneTitle });
  expect(currentProjectBackboneSnapshot(versionTwoEnvelope.decisions[0])).toMatchObject({
    statement: updatedProjectBackboneDraft.decisionStatement,
    reason: updatedProjectBackboneDraft.decisionReason,
  });
  expect(currentProjectBackboneSnapshot(versionTwoEnvelope.tasks[0])).toMatchObject({
    title: updatedProjectBackboneDraft.taskTitle,
    nextStep: updatedProjectBackboneDraft.taskNextStep,
  });
  const versionTwoBytes = await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey);
  await reenterBuilderHomeAfterReload(page);
  await openProjectBackbone(page);
  await expect(page.getByTestId("project-backbone-read-error")).toHaveCount(0);
  await expect(page.getByTestId("project-backbone-milestone")).toContainText(updatedProjectBackboneDraft.milestoneTitle);
  await expect(page.getByTestId("project-backbone-decision")).toContainText(updatedProjectBackboneDraft.decisionStatement);
  await expect(page.getByTestId("project-backbone-task")).toContainText(updatedProjectBackboneDraft.taskTitle);
  expect(await readProjectBackboneEnvelope(page)).toEqual(versionTwoEnvelope);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey)).toBe(versionTwoBytes);
  await expect(page.getByTestId("project-backbone-history")).toContainText("نسخهٔ ۲");
  await page.getByTestId("project-backbone-history").locator("summary").click();

  await installBackwardBrowserClock(page);
  expect(await page.evaluate(() => Date.now())).toBeLessThan(Math.min(
    ...[versionTwoEnvelope.milestones[0], versionTwoEnvelope.decisions[0], versionTwoEnvelope.tasks[0]].map((record) => Date.parse(record.updatedAt)),
  ));
  await page.getByTestId("backbone-milestone-rollback-1").click();
  await expect.poll(async () => (await readProjectBackboneEnvelope(page)).milestones[0].version).toBe(3);
  await page.getByTestId("backbone-decision-rollback-1").click();
  await expect.poll(async () => (await readProjectBackboneEnvelope(page)).decisions[0].version).toBe(3);
  await page.getByTestId("backbone-task-rollback-1").click();
  await expect.poll(async () => (await readProjectBackboneEnvelope(page)).tasks[0].version).toBe(3);

  const rolledBackEnvelope = await readProjectBackboneEnvelope(page);
  expectProjectBackboneVersion(rolledBackEnvelope.milestones[0], 3);
  expectProjectBackboneVersion(rolledBackEnvelope.decisions[0], 3);
  expectProjectBackboneVersion(rolledBackEnvelope.tasks[0], 3);
  for (const [versionTwoRecord, rolledBackRecord] of [
    [versionTwoEnvelope.milestones[0], rolledBackEnvelope.milestones[0]],
    [versionTwoEnvelope.decisions[0], rolledBackEnvelope.decisions[0]],
    [versionTwoEnvelope.tasks[0], rolledBackEnvelope.tasks[0]],
  ] satisfies Array<[ProjectBackboneRecordFixture, ProjectBackboneRecordFixture]>) {
    const previousEvent = versionTwoRecord.history.at(-1);
    const nextEvent = rolledBackRecord.history.at(-1);
    const previousRevision = versionTwoRecord.revisions.at(-1);
    const nextRevision = rolledBackRecord.revisions.at(-1);
    if (!previousEvent || !nextEvent || !previousRevision || !nextRevision) throw new Error(`Rollback timestamps are missing for ${rolledBackRecord.id}`);
    expect(Date.parse(rolledBackRecord.updatedAt)).toBeGreaterThanOrEqual(Date.parse(versionTwoRecord.updatedAt));
    expect(Date.parse(nextEvent.at)).toBeGreaterThanOrEqual(Date.parse(previousEvent.at));
    expect(Date.parse(nextRevision.createdAt)).toBeGreaterThanOrEqual(Date.parse(previousRevision.createdAt));
    expect(rolledBackRecord.updatedAt).toBe(nextEvent.at);
    expect(nextRevision.createdAt).toBe(nextEvent.at);
  }
  expect(rolledBackEnvelope.milestones[0].revisions[1]).toEqual(versionTwoEnvelope.milestones[0].revisions[1]);
  expect(rolledBackEnvelope.decisions[0].revisions[1]).toEqual(versionTwoEnvelope.decisions[0].revisions[1]);
  expect(rolledBackEnvelope.tasks[0].revisions[1]).toEqual(versionTwoEnvelope.tasks[0].revisions[1]);
  expect(currentProjectBackboneSnapshot(rolledBackEnvelope.milestones[0])).toMatchObject({ title: initialProjectBackboneDraft.milestoneTitle });
  expect(currentProjectBackboneSnapshot(rolledBackEnvelope.decisions[0])).toMatchObject({
    statement: initialProjectBackboneDraft.decisionStatement,
    reason: initialProjectBackboneDraft.decisionReason,
  });
  expect(currentProjectBackboneSnapshot(rolledBackEnvelope.tasks[0])).toMatchObject({
    title: initialProjectBackboneDraft.taskTitle,
    nextStep: initialProjectBackboneDraft.taskNextStep,
  });
  expectExactProjectBackboneLinks(rolledBackEnvelope.milestones[0], rolledBackEnvelope.decisions[0], rolledBackEnvelope.tasks[0]);
  const rolledBackBytes = await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey);
  await reenterBuilderHomeAfterReload(page);
  await openProjectBackbone(page);
  await expect(page.getByTestId("project-backbone-read-error")).toHaveCount(0);
  await expect(page.getByTestId("project-backbone-milestone")).toContainText(initialProjectBackboneDraft.milestoneTitle);
  await expect(page.getByTestId("project-backbone-decision")).toContainText(initialProjectBackboneDraft.decisionStatement);
  await expect(page.getByTestId("project-backbone-task")).toContainText(initialProjectBackboneDraft.taskTitle);
  expect(await readProjectBackboneEnvelope(page)).toEqual(rolledBackEnvelope);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey)).toBe(rolledBackBytes);
});

test("Project Backbone rejects a stale editor without overwriting the newer version", async ({ page }) => {
  await enterBuilderHome(page);
  await createProjectBackbone(page);
  await page.getByTestId("project-backbone-edit").click();
  await fillProjectBackboneForm(page, { ...initialProjectBackboneDraft, decisionReason: "دلیل مانده در ویرایشگر قدیمی" });

  const secondPage = await page.context().newPage();
  await enterBuilderHome(secondPage);
  await openProjectBackbone(secondPage);
  await secondPage.getByTestId("project-backbone-edit").click();
  await fillProjectBackboneForm(secondPage, updatedProjectBackboneDraft);
  await secondPage.getByTestId("project-backbone-save").click();
  await expect(secondPage.getByTestId("project-backbone-status")).toContainText("نسخهٔ تازه");
  const newerBytes = await secondPage.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey);

  await page.getByTestId("project-backbone-save").click();
  await expect(page.getByTestId("project-backbone-page-error")).toContainText("جای دیگری تغییر کرده");
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey)).toBe(newerBytes);
  const envelope = await readProjectBackboneEnvelope(page);
  expectProjectBackboneVersion(envelope.milestones[0], 2);
  expectProjectBackboneVersion(envelope.decisions[0], 2);
  expectProjectBackboneVersion(envelope.tasks[0], 2);
  expect(currentProjectBackboneSnapshot(envelope.decisions[0])).toMatchObject({ reason: updatedProjectBackboneDraft.decisionReason });
  await secondPage.close();
});

test("Project Backbone serializes two v1 editors through Web Locks and commits exactly one v2 winner", async ({ page }) => {
  const lockName = "chida-prototype-project-backbone:v1:write";
  await enterBuilderHome(page);
  await createProjectBackbone(page);
  await page.getByTestId("project-backbone-edit").click();
  const firstDraft = {
    ...updatedProjectBackboneDraft,
    milestoneTitle: "برندهٔ احتمالی ویرایشگر نخست",
    decisionReason: "دلیل مستقل ثبت‌شده در ویرایشگر نخست",
    taskNextStep: "گام مستقل ویرایشگر نخست را اجرا کن",
  };
  await fillProjectBackboneForm(page, firstDraft);

  const secondPage = await page.context().newPage();
  try {
    await enterBuilderHome(secondPage);
    await openProjectBackbone(secondPage);
    await secondPage.getByTestId("project-backbone-edit").click();
    const secondDraft = {
      ...updatedProjectBackboneDraft,
      milestoneTitle: "برندهٔ احتمالی ویرایشگر دوم",
      decisionReason: "دلیل مستقل ثبت‌شده در ویرایشگر دوم",
      taskNextStep: "گام مستقل ویرایشگر دوم را اجرا کن",
    };
    await fillProjectBackboneForm(secondPage, secondDraft);

    const versionOneEnvelope = await readProjectBackboneEnvelope(page);
    expectProjectBackboneVersion(versionOneEnvelope.milestones[0], 1);
    expectProjectBackboneVersion(versionOneEnvelope.decisions[0], 1);
    expectProjectBackboneVersion(versionOneEnvelope.tasks[0], 1);
    await expect(page.getByTestId("project-backbone-save")).toBeVisible();
    await expect(secondPage.getByTestId("project-backbone-save")).toBeVisible();

    await page.evaluate((name) => {
      const lockWindow = window as Window & {
        __projectBackboneConcurrencyLockHeld?: boolean;
        __releaseProjectBackboneConcurrencyLock?: () => void;
      };
      void navigator.locks.request(name, async () => {
        lockWindow.__projectBackboneConcurrencyLockHeld = true;
        await new Promise<void>((resolve) => {
          lockWindow.__releaseProjectBackboneConcurrencyLock = resolve;
        });
        lockWindow.__projectBackboneConcurrencyLockHeld = false;
      });
    }, lockName);
    await expect.poll(() => page.evaluate(() => Boolean((window as Window & { __projectBackboneConcurrencyLockHeld?: boolean }).__projectBackboneConcurrencyLockHeld))).toBe(true);

    await page.getByTestId("project-backbone-save").click();
    await secondPage.getByTestId("project-backbone-save").click();

    try {
      await expect.poll(() => page.evaluate(async (name) => {
        const snapshot = await navigator.locks.query();
        return {
          held: snapshot.held.filter((lock) => lock.name === name).length,
          pending: snapshot.pending.filter((lock) => lock.name === name).length,
        };
      }, lockName)).toEqual({ held: 1, pending: 2 });
      const stillVersionOne = await readProjectBackboneEnvelope(page);
      expectProjectBackboneVersion(stillVersionOne.milestones[0], 1);
      expectProjectBackboneVersion(stillVersionOne.decisions[0], 1);
      expectProjectBackboneVersion(stillVersionOne.tasks[0], 1);
    } finally {
      await page.evaluate(() => {
        const lockWindow = window as Window & { __releaseProjectBackboneConcurrencyLock?: () => void };
        const release = lockWindow.__releaseProjectBackboneConcurrencyLock;
        delete lockWindow.__releaseProjectBackboneConcurrencyLock;
        release?.();
      });
    }

    const outcome = async (candidate: Page) => ({
      success: await candidate.getByTestId("project-backbone-status").filter({ hasText: "نسخهٔ تازه" }).count(),
      conflict: await candidate.getByTestId("project-backbone-page-error").filter({ hasText: "جای دیگری تغییر کرده" }).count(),
    });
    await expect.poll(async () => {
      const first = await outcome(page);
      const second = await outcome(secondPage);
      return { success: first.success + second.success, conflict: first.conflict + second.conflict };
    }).toEqual({ success: 1, conflict: 1 });

    const firstOutcome = await outcome(page);
    const secondOutcome = await outcome(secondPage);
    expect([firstOutcome.success, secondOutcome.success]).toEqual(expect.arrayContaining([0, 1]));
    expect([firstOutcome.conflict, secondOutcome.conflict]).toEqual(expect.arrayContaining([0, 1]));
    const winningDraft = firstOutcome.success === 1 ? firstDraft : secondDraft;

    const winnerEnvelope = await readProjectBackboneEnvelope(page);
    expect(winnerEnvelope.milestones).toHaveLength(1);
    expect(winnerEnvelope.decisions).toHaveLength(1);
    expect(winnerEnvelope.tasks).toHaveLength(1);
    const [milestone] = winnerEnvelope.milestones;
    const [decision] = winnerEnvelope.decisions;
    const [task] = winnerEnvelope.tasks;
    expectProjectBackboneVersion(milestone, 2);
    expectProjectBackboneVersion(decision, 2);
    expectProjectBackboneVersion(task, 2);
    expect(milestone.revisions[0]).toEqual(versionOneEnvelope.milestones[0].revisions[0]);
    expect(decision.revisions[0]).toEqual(versionOneEnvelope.decisions[0].revisions[0]);
    expect(task.revisions[0]).toEqual(versionOneEnvelope.tasks[0].revisions[0]);
    expect(currentProjectBackboneSnapshot(milestone)).toMatchObject({ title: winningDraft.milestoneTitle });
    expect(currentProjectBackboneSnapshot(decision)).toMatchObject({
      statement: winningDraft.decisionStatement,
      reason: winningDraft.decisionReason,
    });
    expect(currentProjectBackboneSnapshot(task)).toMatchObject({
      title: winningDraft.taskTitle,
      nextStep: winningDraft.taskNextStep,
    });
    expectExactProjectBackboneLinks(milestone, decision, task);

    for (const record of [milestone, decision, task]) {
      const revision = record.revisions.at(-1);
      if (!revision) throw new Error(`Winner revision is missing for ${record.id}`);
      const objectType = (record as ProjectBackboneRecordFixture & { objectType: "milestone" | "decision" | "task" }).objectType;
      const expectedFingerprint = `fnv1a-${stableTestHash(JSON.stringify(stableTestValue({ objectType, projectId: record.projectId, snapshot: revision.snapshot })))}`;
      expect(revision.fingerprint).toBe(expectedFingerprint);
    }
  } finally {
    await page.evaluate(() => {
      const lockWindow = window as Window & { __releaseProjectBackboneConcurrencyLock?: () => void };
      lockWindow.__releaseProjectBackboneConcurrencyLock?.();
      delete lockWindow.__releaseProjectBackboneConcurrencyLock;
    }).catch(() => undefined);
    await secondPage.close();
  }
});

test("Project Backbone keeps the create form open and writes nothing when Web Locks are unavailable", async ({ page }) => {
  await enterBuilderHome(page);
  await openProjectBackboneCreate(page);
  await fillProjectBackboneForm(page, initialProjectBackboneDraft);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey)).toBeNull();

  await page.evaluate((key) => {
    const probeWindow = window as Window & { __projectBackboneWriteAttempts?: number };
    const nativeSetItem = Storage.prototype.setItem;
    probeWindow.__projectBackboneWriteAttempts = 0;
    Object.defineProperty(window.navigator, "locks", { value: undefined, configurable: true });
    Storage.prototype.setItem = function setItem(storageKey: string, value: string) {
      if (this === window.localStorage && storageKey === key) probeWindow.__projectBackboneWriteAttempts = (probeWindow.__projectBackboneWriteAttempts ?? 0) + 1;
      return nativeSetItem.call(this, storageKey, value);
    };
  }, projectBackboneStorageKey);
  expect(await page.evaluate(() => typeof window.navigator.locks)).toBe("undefined");

  await page.getByTestId("project-backbone-save").click();
  await expect(page.getByTestId("project-backbone-error")).toContainText("قفل امن مرورگر در دسترس نبود");
  await expect(page.getByTestId("project-backbone-editor")).toBeVisible();
  await expect(page.getByTestId("project-backbone-save")).toBeEnabled();
  await expect(page.getByTestId("backbone-decision-reason")).toHaveValue(initialProjectBackboneDraft.decisionReason);
  await expect(page.getByTestId("project-backbone-milestone")).toHaveCount(0);
  expect(await page.evaluate(() => (window as Window & { __projectBackboneWriteAttempts?: number }).__projectBackboneWriteAttempts)).toBe(0);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey)).toBeNull();
});

test("Project Backbone preserves exact bytes on write failure and fail-closes a corrupted store", async ({ page }) => {
  await enterBuilderHome(page);
  await createProjectBackbone(page);
  const validBytes = await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey);

  await page.getByTestId("project-backbone-edit").click();
  await fillProjectBackboneForm(page, updatedProjectBackboneDraft);
  await page.evaluate((key) => {
    const nativeSetItem = Storage.prototype.setItem;
    Object.defineProperty(window, "__projectBackboneNativeSetItem", { value: nativeSetItem, configurable: true });
    Storage.prototype.setItem = function setItem(storageKey: string, value: string) {
      if (this === window.localStorage && storageKey === key) throw new DOMException("Project Backbone write failed", "QuotaExceededError");
      return nativeSetItem.call(this, storageKey, value);
    };
  }, projectBackboneStorageKey);
  await page.getByTestId("project-backbone-save").click();

  await expect(page.getByTestId("project-backbone-error")).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey)).toBe(validBytes);

  await page.evaluate(({ key, malformed }) => {
    const nativeSetItem = (window as Window & { __projectBackboneNativeSetItem: typeof Storage.prototype.setItem }).__projectBackboneNativeSetItem;
    Storage.prototype.setItem = nativeSetItem;
    nativeSetItem.call(window.localStorage, key, malformed);
  }, { key: projectBackboneStorageKey, malformed: "{" });
  await reenterBuilderHomeAfterReload(page);
  await openProjectBackbone(page);

  await expect(page.getByTestId("project-backbone-error")).toBeVisible();
  const mutationControl = page.locator('[data-testid="project-backbone-start"], [data-testid="project-backbone-edit"]');
  await expect(mutationControl).toHaveCount(1);
  await expect(mutationControl).toBeDisabled();
  await expect(page.getByTestId("project-backbone-milestone")).toHaveCount(0);
  await expect(page.getByTestId("project-backbone-decision")).toHaveCount(0);
  await expect(page.getByTestId("project-backbone-task")).toHaveCount(0);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey)).toBe("{");
});

test("Project Backbone fail-closes valid JSON with stale fingerprints, impossible dates, or coordinated cross-project links without rewriting bytes", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const projectBase = { usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-30T08:00:00.000Z" };
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify([
      { ...projectBase, id: "project-backbone-tamper-a", name: "پروژه دستکاری الف", location: "ونک", stage: "فونداسیون" },
      { ...projectBase, id: "project-backbone-tamper-b", name: "پروژه دستکاری ب", location: "جردن", stage: "نازک کاری و نما" },
    ]));
    window.localStorage.setItem("chida-prototype-active-project", "project-backbone-tamper-a");
  });
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, milestoneTitle: "نقطه عطف سالم پروژه الف" });

  await reenterBuilderHomeAfterReload(page);
  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /پروژه دستکاری ب تهران/ }).click();
  await page.getByTestId("project-space-back").click();
  await openProjectBackbone(page);
  await page.getByTestId("project-backbone-start").click();
  await fillProjectBackboneForm(page, { ...updatedProjectBackboneDraft, milestoneTitle: "نقطه عطف سالم پروژه ب" });
  await page.getByTestId("project-backbone-save").click();
  await expect(page.getByTestId("project-backbone-status")).toContainText("سه رکورد متصل ثبت شد");

  const validEnvelope = await readProjectBackboneEnvelope(page);
  const assertReadLockedWithoutRewrite = async (exactBytes: string) => {
    await reenterBuilderHomeAfterReload(page);
    await openProjectBackbone(page);
    await expect(page.getByTestId("project-backbone-read-error")).toBeVisible();
    const mutationControl = page.locator('[data-testid="project-backbone-start"], [data-testid="project-backbone-edit"]');
    await expect(mutationControl).toHaveCount(1);
    await expect(mutationControl).toBeDisabled();
    await expect(page.getByTestId("project-backbone-milestone")).toHaveCount(0);
    await expect(page.getByTestId("project-backbone-decision")).toHaveCount(0);
    await expect(page.getByTestId("project-backbone-task")).toHaveCount(0);
    expect(await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey)).toBe(exactBytes);
  };

  const staleFingerprintEnvelope = JSON.parse(JSON.stringify(validEnvelope)) as ProjectBackboneEnvelopeFixture;
  const staleFingerprintDecision = staleFingerprintEnvelope.decisions.find((record) => record.projectId === "project-backbone-tamper-b");
  const staleFingerprintRevision = staleFingerprintDecision?.revisions.find((revision) => revision.id === staleFingerprintDecision.currentRevisionId);
  if (!staleFingerprintRevision) throw new Error("Decision revision for stale-fingerprint tamper is missing");
  staleFingerprintRevision.snapshot.reason = "دلیل دستکاری‌شده بدون بازسازی اثرانگشت";
  const staleFingerprintBytes = JSON.stringify(staleFingerprintEnvelope);
  await page.evaluate(({ key, bytes }) => window.localStorage.setItem(key, bytes), { key: projectBackboneStorageKey, bytes: staleFingerprintBytes });
  await assertReadLockedWithoutRewrite(staleFingerprintBytes);

  const impossibleDateEnvelope = JSON.parse(JSON.stringify(validEnvelope)) as ProjectBackboneEnvelopeFixture;
  const impossibleDateMilestone = impossibleDateEnvelope.milestones.find((record) => record.projectId === "project-backbone-tamper-b");
  const impossibleDateRevision = impossibleDateMilestone
    ? impossibleDateMilestone.revisions.find((revision) => revision.id === impossibleDateMilestone.currentRevisionId)
    : undefined;
  if (!impossibleDateMilestone || !impossibleDateRevision) throw new Error("Milestone revision for impossible-date tamper is missing");
  impossibleDateRevision.snapshot.targetDate = "2026-02-30";
  impossibleDateRevision.fingerprint = `fnv1a-${stableTestHash(JSON.stringify(stableTestValue({
    objectType: impossibleDateMilestone.objectType,
    projectId: impossibleDateMilestone.projectId,
    snapshot: impossibleDateRevision.snapshot,
  })))}`;
  const impossibleDateBytes = JSON.stringify(impossibleDateEnvelope);
  await page.evaluate(({ key, bytes }) => window.localStorage.setItem(key, bytes), { key: projectBackboneStorageKey, bytes: impossibleDateBytes });
  await assertReadLockedWithoutRewrite(impossibleDateBytes);

  const crossLinkedEnvelope = JSON.parse(JSON.stringify(validEnvelope)) as ProjectBackboneEnvelopeFixture;
  const projectADecision = crossLinkedEnvelope.decisions.find((record) => record.projectId === "project-backbone-tamper-a");
  const projectATask = crossLinkedEnvelope.tasks.find((record) => record.projectId === "project-backbone-tamper-a");
  const projectBMilestone = crossLinkedEnvelope.milestones.find((record) => record.projectId === "project-backbone-tamper-b");
  const projectBDecision = crossLinkedEnvelope.decisions.find((record) => record.projectId === "project-backbone-tamper-b");
  const projectBTask = crossLinkedEnvelope.tasks.find((record) => record.projectId === "project-backbone-tamper-b");
  const projectADecisionRevision = projectADecision
    ? projectADecision.revisions.find((revision) => revision.id === projectADecision.currentRevisionId)
    : undefined;
  const projectATaskRevision = projectATask
    ? projectATask.revisions.find((revision) => revision.id === projectATask.currentRevisionId)
    : undefined;
  if (!projectADecision || !projectATask || !projectBMilestone || !projectBDecision || !projectBTask || !projectADecisionRevision || !projectATaskRevision) {
    throw new Error("Two complete graphs are required for coordinated cross-project tampering");
  }
  projectADecisionRevision.snapshot.milestoneId = projectBMilestone.id;
  projectADecisionRevision.snapshot.taskId = projectBTask.id;
  projectATaskRevision.snapshot.milestoneId = projectBMilestone.id;
  projectATaskRevision.snapshot.decisionId = projectBDecision.id;
  for (const [record, revision] of [[projectADecision, projectADecisionRevision], [projectATask, projectATaskRevision]] as const) {
    const objectType = (record as ProjectBackboneRecordFixture & { objectType: "decision" | "task" }).objectType;
    revision.fingerprint = `fnv1a-${stableTestHash(JSON.stringify(stableTestValue({ objectType, projectId: record.projectId, snapshot: revision.snapshot })))}`;
  }
  const crossLinkedBytes = JSON.stringify(crossLinkedEnvelope);
  await page.evaluate(({ key, bytes }) => window.localStorage.setItem(key, bytes), { key: projectBackboneStorageKey, bytes: crossLinkedBytes });
  await assertReadLockedWithoutRewrite(crossLinkedBytes);
});

test("TM-1 creates a browser-local deadline monitor, checks it explicitly, and restores it after reload", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2099-09-01T09:30" });
  await expect(page.getByTestId("project-backbone-task")).toContainText("موعد");

  await page.getByTestId("project-backbone-back").click();
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-monitor").click();
  await expect(page.getByTestId("project-task-monitor-create")).toBeVisible();
  await page.getByTestId("project-task-monitor-create").click();

  const detail = page.getByTestId("project-task-monitor-detail");
  await expect(detail).toBeVisible();
  await expect(page.getByTestId("project-task-monitor-local-boundary")).toContainText("فقط هنگام بازکردن مرکز کارها یا وقتی همین صفحه در این مرورگر باز و قابل‌دیدن است");
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("در حال پایش");
  await expect(page.getByTestId("project-task-monitor-last-check")).toContainText("هنوز بررسی نشده");
  await expect(page.getByTestId("project-task-monitor-next-check")).not.toContainText("هنوز");

  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.getByTestId("project-task-monitor-run-now").click();
  await expect(page.getByTestId("project-task-monitor-last-check")).not.toContainText("هنوز بررسی نشده");
  expect(requests).toEqual([]);

  const stored = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
  expect(stored.schemaVersion).toBe(1);
  expect(stored.monitors).toHaveLength(1);
  expect(stored.runs).toHaveLength(1);
  expect(stored.monitors[0].projectId).toBe(stored.monitors[0].ownerPrincipalId);
  expect(stored.monitors[0].scopeId).toBe(stored.monitors[0].projectId);
  expect(stored.runs[0].state).toBe("succeeded");

  await reenterBuilderHomeAfterReload(page);
  await page.getByTestId("menu-button").click();
  await page.getByTestId("drawer-tasks-entry").click();
  await page.getByTestId("project-task-filter-monitor").click();
  await expect(page.getByTestId("project-task-monitor-card")).toHaveCount(1);
  await page.getByTestId("project-task-monitor-card").click();
  await expect(page.getByTestId("project-task-monitor-last-check")).not.toContainText("هنوز بررسی نشده");

  const widths = await page.evaluate(() => ({
    inner: window.innerWidth,
    documentClient: document.documentElement.clientWidth,
    documentScroll: document.documentElement.scrollWidth,
    bodyScroll: document.body.scrollWidth,
  }));
  expect(widths).toEqual({ inner: 390, documentClient: 390, documentScroll: 390, bodyScroll: 390 });
  await page.getByTestId("project-task-monitor-back").click();
  await expect(page.getByTestId("project-task-monitor-card")).toBeFocused();
});

test("TM-1 records a stale Task dependency as a failed Run and retries against the fresh revision", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-31T08:00:00.000Z"));
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const dueAt = "2099-10-02T11:15";
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: dueAt });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);

  await page.getByTestId("project-task-monitor-open-task").click();
  await page.getByTestId("project-backbone-edit").click();
  await fillProjectBackboneForm(page, { ...initialProjectBackboneDraft, taskNextStep: "نسخهٔ تازهٔ گام کار را با ناظر نهایی کن", taskDueAt: dueAt });
  await page.getByTestId("project-backbone-save").click();
  await expect(page.getByTestId("project-backbone-status")).toContainText("نسخهٔ تازه");
  await page.getByTestId("project-backbone-back").click();
  await expect(page.getByTestId("project-task-filter-active")).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null").runs.length, projectTaskMonitorsStorageKey)).toBe(1);
  await page.getByTestId("project-task-filter-monitor").click();

  const monitorCard = page.getByTestId("project-task-monitor-card");
  await expect(monitorCard).toContainText("بررسی ناموفق");
  await monitorCard.click();
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("نسخهٔ کار برنامه");

  const failedEnvelope = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
  expect(failedEnvelope.monitors[0].version).toBe(2);
  expect(failedEnvelope.runs).toHaveLength(1);
  expect(failedEnvelope.runs[0]).toMatchObject({ attempt: 1, state: "failed", effectState: "none", failure: { code: "dependency-stale" } });
  expect(failedEnvelope.monitors[0].history.at(-1).runId).toBe(failedEnvelope.runs[0].id);

  await page.getByTestId("project-task-monitor-retry").click();
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("در حال پایش");
  const retriedEnvelope = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
  expect(retriedEnvelope.monitors[0].version).toBe(3);
  expect(retriedEnvelope.runs).toHaveLength(2);
  expect(retriedEnvelope.runs[0]).toEqual(failedEnvelope.runs[0]);
  expect(retriedEnvelope.runs[1]).toMatchObject({ attempt: 2, state: "succeeded", effectState: "none", result: { kind: "not-due" } });
  expect(retriedEnvelope.runs[1].origin.taskVersion).toBe(2);
  expect(retriedEnvelope.monitors[0].revisions.map((revision: { version: number }) => revision.version)).toEqual([1, 2, 3]);
});

test("TM-1 keeps a removed-deadline failure readable through disable, reload, and safe re-enable", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-31T10:00:00.000Z"));
  await enterBuilderHome(page);
  const dueAt = "2099-10-08T13:20";
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: dueAt });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);

  await page.getByTestId("project-task-monitor-open-task").click();
  await page.getByTestId("project-backbone-edit").click();
  await fillProjectBackboneForm(page, { ...initialProjectBackboneDraft, taskDueAt: "" });
  await page.getByTestId("project-backbone-save").click();
  await page.getByTestId("project-backbone-back").click();
  await expect.poll(() => page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null").runs.length, projectTaskMonitorsStorageKey)).toBe(1);
  await page.getByTestId("project-task-filter-monitor").click();
  await page.getByTestId("project-task-monitor-card").click();
  await page.getByTestId("project-task-monitor-retry").click();
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("هنوز موعد دقیقی ندارد");

  await page.getByTestId("project-task-monitor-toggle").click();
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("غیرفعال");
  await reenterBuilderHomeAfterReload(page);
  await openProjectTaskMonitorsFromHome(page);
  await expect(page.getByTestId("project-task-monitor-read-error")).toHaveCount(0);
  await page.getByTestId("project-task-monitor-card").click();
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("غیرفعال");

  await page.getByTestId("project-task-monitor-open-task").click();
  await page.getByTestId("project-backbone-edit").click();
  await page.clock.setFixedTime(new Date("2026-08-31T12:00:00.000Z"));
  await fillProjectBackboneForm(page, { ...initialProjectBackboneDraft, taskDueAt: dueAt });
  await page.getByTestId("project-backbone-save").click();
  await page.getByTestId("project-backbone-back").click();
  await page.getByTestId("project-task-filter-monitor").click();
  await page.getByTestId("project-task-monitor-card").click();
  await page.clock.setFixedTime(new Date("2026-08-31T09:00:00.000Z"));
  await page.getByTestId("project-task-monitor-toggle").click();
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("در حال پایش");
  const recoveredEnvelope = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
  expect(recoveredEnvelope.monitors[0].version).toBe(5);
  expect(recoveredEnvelope.monitors[0].updatedAt).toBe("2026-08-31T12:00:00.000Z");
  expect(recoveredEnvelope.runs).toHaveLength(2);
  expect(recoveredEnvelope.runs[1]).toMatchObject({ attempt: 2, state: "failed", failure: { code: "deadline-missing" } });
});

test("TM-1 preserves bytes on write failure and keeps disable/re-enable history without synthetic Runs", async ({ page }) => {
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2099-11-03T08:45" });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);
  const beforeFailure = await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey);

  await page.evaluate((key) => {
    const probeWindow = window as Window & { __taskMonitorNativeSetItem?: typeof Storage.prototype.setItem };
    probeWindow.__taskMonitorNativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(storageKey: string, value: string) {
      if (this === window.localStorage && storageKey === key) throw new DOMException("Synthetic monitor write failure", "QuotaExceededError");
      return probeWindow.__taskMonitorNativeSetItem!.call(this, storageKey, value);
    };
  }, projectTaskMonitorsStorageKey);
  await page.getByTestId("project-task-monitor-toggle").click();
  await expect(page.getByTestId("project-task-monitor-message")).toContainText("ذخیره نشد");
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey)).toBe(beforeFailure);
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("در حال پایش");

  await page.evaluate(() => {
    const probeWindow = window as Window & { __taskMonitorNativeSetItem?: typeof Storage.prototype.setItem };
    if (probeWindow.__taskMonitorNativeSetItem) Storage.prototype.setItem = probeWindow.__taskMonitorNativeSetItem;
    delete probeWindow.__taskMonitorNativeSetItem;
  });
  await page.getByTestId("project-task-monitor-toggle").click();
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("غیرفعال");
  let envelope = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
  expect(envelope.monitors[0].version).toBe(2);
  expect(envelope.monitors[0].revisions.at(-1).snapshot).toMatchObject({ enabled: false, status: "disabled", nextCheckAt: null });
  expect(envelope.runs).toEqual([]);

  await page.getByTestId("project-task-monitor-toggle").click();
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("در حال پایش");
  envelope = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
  expect(envelope.monitors[0].version).toBe(3);
  expect(envelope.monitors[0].history.map((event: { type: string }) => event.type)).toEqual(["created", "disabled", "enabled"]);
  expect(envelope.runs).toEqual([]);
});

test("TM-1 rolls back its own bytes when a noncooperating Backbone write wins during verification", async ({ page }) => {
  await enterBuilderHome(page);
  const dueAt = "2099-11-06T11:00";
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: dueAt });
  const originalBackboneBytes = await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey);
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);
  await page.getByTestId("project-task-monitor-open-task").click();
  await page.getByTestId("project-backbone-edit").click();
  await fillProjectBackboneForm(page, { ...initialProjectBackboneDraft, taskNextStep: "نسخهٔ مستقیم و جدیدتر کار", taskDueAt: dueAt });
  await page.getByTestId("project-backbone-save").click();
  await expect(page.getByTestId("project-backbone-editor")).toHaveCount(0);
  const newerBackboneBytes = await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey);
  expect(newerBackboneBytes).not.toBe(originalBackboneBytes);
  await page.evaluate(({ key, bytes }) => window.localStorage.setItem(key, bytes!), { key: projectBackboneStorageKey, bytes: originalBackboneBytes });

  await reenterBuilderHomeAfterReload(page);
  await openProjectTaskMonitorsFromHome(page);
  await page.getByTestId("project-task-monitor-card").click();
  const monitorBytesBefore = await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey);
  await page.evaluate(({ monitorKey, backboneKey, injectedBackboneBytes }) => {
    const probeWindow = window as Window & { __taskMonitorRaceNativeSetItem?: typeof Storage.prototype.setItem };
    probeWindow.__taskMonitorRaceNativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(storageKey: string, value: string) {
      const result = probeWindow.__taskMonitorRaceNativeSetItem!.call(this, storageKey, value);
      if (this === window.localStorage && storageKey === monitorKey) probeWindow.__taskMonitorRaceNativeSetItem!.call(this, backboneKey, injectedBackboneBytes!);
      return result;
    };
  }, { monitorKey: projectTaskMonitorsStorageKey, backboneKey: projectBackboneStorageKey, injectedBackboneBytes: newerBackboneBytes });

  await page.getByTestId("project-task-monitor-toggle").click();
  await expect(page.getByTestId("project-task-monitor-message")).toContainText("ذخیره نشد");
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey)).toBe(monitorBytesBefore);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectBackboneStorageKey)).toBe(newerBackboneBytes);
  await page.evaluate(() => {
    const probeWindow = window as Window & { __taskMonitorRaceNativeSetItem?: typeof Storage.prototype.setItem };
    if (probeWindow.__taskMonitorRaceNativeSetItem) Storage.prototype.setItem = probeWindow.__taskMonitorRaceNativeSetItem;
    delete probeWindow.__taskMonitorRaceNativeSetItem;
  });

  await reenterBuilderHomeAfterReload(page);
  await openProjectTaskMonitorsFromHome(page);
  await expect(page.getByTestId("project-task-monitor-read-error")).toHaveCount(0);
  await expect(page.getByTestId("project-task-monitor-card")).toHaveCount(1);
});

test("TM-1 refuses to overwrite a noncooperating valid Monitor preimage", async ({ page }) => {
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2099-11-07T11:00" });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);
  const originalBytes = await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey);
  await page.getByTestId("project-task-monitor-toggle").click();
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("غیرفعال");
  const competingBytes = await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey);
  expect(competingBytes).not.toBe(originalBytes);
  await page.evaluate(({ key, bytes }) => window.localStorage.setItem(key, bytes!), { key: projectTaskMonitorsStorageKey, bytes: originalBytes });

  await reenterBuilderHomeAfterReload(page);
  await openProjectTaskMonitorsFromHome(page);
  await page.getByTestId("project-task-monitor-card").click();
  await page.evaluate(({ key, competing }) => {
    const probeWindow = window as Window & {
      __taskMonitorRaceNativeGetItem?: typeof Storage.prototype.getItem;
      __taskMonitorRaceNativeSetItem?: typeof Storage.prototype.setItem;
      __taskMonitorRaceReadCount?: number;
    };
    probeWindow.__taskMonitorRaceNativeGetItem = Storage.prototype.getItem;
    probeWindow.__taskMonitorRaceNativeSetItem = Storage.prototype.setItem;
    probeWindow.__taskMonitorRaceReadCount = 0;
    Storage.prototype.getItem = function getItem(storageKey: string) {
      if (this === window.localStorage && storageKey === key) {
        probeWindow.__taskMonitorRaceReadCount = (probeWindow.__taskMonitorRaceReadCount ?? 0) + 1;
        if (probeWindow.__taskMonitorRaceReadCount === 2) probeWindow.__taskMonitorRaceNativeSetItem!.call(this, key, competing!);
      }
      return probeWindow.__taskMonitorRaceNativeGetItem!.call(this, storageKey);
    };
  }, { key: projectTaskMonitorsStorageKey, competing: competingBytes });

  await page.getByTestId("project-task-monitor-run-now").click();
  await expect(page.getByTestId("project-task-monitor-message")).toContainText("ذخیره نشد");
  await page.evaluate(() => {
    const probeWindow = window as Window & {
      __taskMonitorRaceNativeGetItem?: typeof Storage.prototype.getItem;
      __taskMonitorRaceNativeSetItem?: typeof Storage.prototype.setItem;
      __taskMonitorRaceReadCount?: number;
    };
    if (probeWindow.__taskMonitorRaceNativeGetItem) Storage.prototype.getItem = probeWindow.__taskMonitorRaceNativeGetItem;
    delete probeWindow.__taskMonitorRaceNativeGetItem;
    delete probeWindow.__taskMonitorRaceNativeSetItem;
    delete probeWindow.__taskMonitorRaceReadCount;
  });
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey)).toBe(competingBytes);

  await reenterBuilderHomeAfterReload(page);
  await openProjectTaskMonitorsFromHome(page);
  await page.getByTestId("project-task-monitor-card").click();
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("غیرفعال");
});

test("TM-1 fail-closes a tampered Monitor envelope without rewriting its exact bytes", async ({ page }) => {
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2099-12-04T14:00" });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);

  const tamperedBytes = await page.evaluate((key) => {
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    envelope.monitors[0].revisions[0].snapshot.reason = "دلیل دستکاری‌شده بدون اثرانگشت تازه";
    const bytes = JSON.stringify(envelope);
    window.localStorage.setItem(key, bytes);
    return bytes;
  }, projectTaskMonitorsStorageKey);
  await reenterBuilderHomeAfterReload(page);
  await openProjectTaskMonitorsFromHome(page);
  await expect(page.getByTestId("project-task-monitor-read-error")).toBeVisible();
  await expect(page.getByTestId("project-task-monitor-card")).toHaveCount(0);
  await expect(page.getByTestId("project-task-monitor-create")).toHaveCount(0);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey)).toBe(tamperedBytes);
});

test("TM-1 rejects noncanonical whitespace in Monitor identifiers without rewriting bytes", async ({ page }) => {
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2099-12-05T10:00" });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);

  const tamperedBytes = await page.evaluate((key) => {
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    envelope.monitors[0].id = ` ${envelope.monitors[0].id} `;
    const bytes = JSON.stringify(envelope);
    window.localStorage.setItem(key, bytes);
    return bytes;
  }, projectTaskMonitorsStorageKey);
  await reenterBuilderHomeAfterReload(page);
  await openProjectTaskMonitorsFromHome(page);
  await expect(page.getByTestId("project-task-monitor-read-error")).toBeVisible();
  await expect(page.getByTestId("project-task-monitor-card")).toHaveCount(0);
  await expect(page.getByTestId("project-task-monitor-create")).toHaveCount(0);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey)).toBe(tamperedBytes);
});

test("TM-1 rejects an impossible no-op enable transition even when its revision fingerprint is coherent", async ({ page }) => {
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2099-12-06T09:15" });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);

  const tamperedBytes = await page.evaluate((key) => {
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    const monitor = envelope.monitors[0];
    const firstRevision = monitor.revisions[0];
    const timestamp = firstRevision.createdAt;
    const revisionId = "task-monitor-revision-forged-enable";
    monitor.version = 2;
    monitor.currentRevisionId = revisionId;
    monitor.updatedAt = timestamp;
    monitor.history.push({ id: "task-monitor-event-forged-enable", type: "enabled", actor: "شما", at: timestamp, version: 2, runId: null });
    monitor.revisions.push({ id: revisionId, version: 2, createdAt: timestamp, snapshot: structuredClone(firstRevision.snapshot), fingerprint: firstRevision.fingerprint });
    const bytes = JSON.stringify(envelope);
    window.localStorage.setItem(key, bytes);
    return bytes;
  }, projectTaskMonitorsStorageKey);

  await reenterBuilderHomeAfterReload(page);
  await openProjectTaskMonitorsFromHome(page);
  await expect(page.getByTestId("project-task-monitor-read-error")).toBeVisible();
  await expect(page.getByTestId("project-task-monitor-card")).toHaveCount(0);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey)).toBe(tamperedBytes);
});

test("TM-1 binds each Run attempt to its history ordinal", async ({ page }) => {
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2099-12-07T09:15" });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);
  await page.getByTestId("project-task-monitor-run-now").click();
  await expect.poll(() => page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null").runs.length, projectTaskMonitorsStorageKey)).toBe(1);
  await page.getByTestId("project-task-monitor-run-now").click();
  await expect.poll(() => page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null").runs.length, projectTaskMonitorsStorageKey)).toBe(2);

  const tamperedBytes = await page.evaluate((key) => {
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    [envelope.runs[0].attempt, envelope.runs[1].attempt] = [envelope.runs[1].attempt, envelope.runs[0].attempt];
    const bytes = JSON.stringify(envelope);
    window.localStorage.setItem(key, bytes);
    return bytes;
  }, projectTaskMonitorsStorageKey);
  await reenterBuilderHomeAfterReload(page);
  await openProjectTaskMonitorsFromHome(page);
  await expect(page.getByTestId("project-task-monitor-read-error")).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey)).toBe(tamperedBytes);
});

test("TM-1 rejects a Run schedule moved beyond its actual start time", async ({ page }) => {
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2099-12-08T09:15" });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);
  await page.getByTestId("project-task-monitor-run-now").click();
  await expect.poll(() => page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null").runs.length, projectTaskMonitorsStorageKey)).toBe(1);

  const tamperedBytes = await page.evaluate((key) => {
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    envelope.runs[0].scheduledFor = envelope.monitors[0].revisions.at(-1).snapshot.nextCheckAt;
    const bytes = JSON.stringify(envelope);
    window.localStorage.setItem(key, bytes);
    return bytes;
  }, projectTaskMonitorsStorageKey);
  await reenterBuilderHomeAfterReload(page);
  await openProjectTaskMonitorsFromHome(page);
  await expect(page.getByTestId("project-task-monitor-read-error")).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey)).toBe(tamperedBytes);
});

test("TM-1 rejects a coherently re-fingerprinted arbitrary post-deadline cadence", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-31T09:00:00.000Z"));
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2026-08-31T12:00" });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("موعد رسیده");

  const envelope = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
  const monitor = envelope.monitors[0];
  const revision = monitor.revisions.at(-1);
  revision.snapshot.nextCheckAt = new Date(new Date(revision.createdAt).getTime() + 7 * 86_400_000).toISOString();
  revision.fingerprint = `fnv1a-${stableTestHash(JSON.stringify(stableTestValue({ objectType: "monitor", projectId: monitor.projectId, snapshot: revision.snapshot })))}`;
  const tamperedBytes = JSON.stringify(envelope);
  await page.evaluate(({ key, bytes }) => window.localStorage.setItem(key, bytes), { key: projectTaskMonitorsStorageKey, bytes: tamperedBytes });
  await reenterBuilderHomeAfterReload(page);
  await openProjectTaskMonitorsFromHome(page);
  await expect(page.getByTestId("project-task-monitor-read-error")).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey)).toBe(tamperedBytes);
});

test("TM-1 rejects a coherently re-fingerprinted Run result that contradicts its exact Task deadline", async ({ page }) => {
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2099-12-10T10:00" });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);
  await page.getByTestId("project-task-monitor-run-now").click();
  await expect.poll(() => page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null").runs.length, projectTaskMonitorsStorageKey)).toBe(1);

  const tamperedBytes = await page.evaluate((key) => {
    const envelope = JSON.parse(window.localStorage.getItem(key) ?? "null");
    const monitor = envelope.monitors[0];
    const revision = monitor.revisions.at(-1);
    const event = monitor.history.at(-1);
    const run = envelope.runs[0];
    run.result.kind = "deadline-reached";
    revision.snapshot.status = "attention";
    event.type = "deadline-reached";
    const stableValue = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(stableValue);
      if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([first], [second]) => first.localeCompare(second)).map(([name, child]) => [name, stableValue(child)]));
      return value;
    };
    let hash = 0x811c9dc5;
    for (const character of JSON.stringify(stableValue({ objectType: "monitor", projectId: monitor.projectId, snapshot: revision.snapshot }))) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    revision.fingerprint = `fnv1a-${hash.toString(16).padStart(8, "0")}`;
    const bytes = JSON.stringify(envelope);
    window.localStorage.setItem(key, bytes);
    return bytes;
  }, projectTaskMonitorsStorageKey);

  await reenterBuilderHomeAfterReload(page);
  await openProjectTaskMonitorsFromHome(page);
  await expect(page.getByTestId("project-task-monitor-read-error")).toBeVisible();
  await expect(page.getByTestId("project-task-monitor-card")).toHaveCount(0);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey)).toBe(tamperedBytes);
});

test("TM-1 accepts only one explicit Run now from two stale tabs", async ({ page }) => {
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2099-12-12T09:00" });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);

  const secondPage = await page.context().newPage();
  try {
    await enterBuilderHome(secondPage);
    await openProjectTaskMonitorsFromHome(secondPage);
    await secondPage.getByTestId("project-task-monitor-card").click();
    await Promise.all([
      page.getByTestId("project-task-monitor-run-now").click(),
      secondPage.getByTestId("project-task-monitor-run-now").click(),
    ]);
    await expect.poll(() => page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null").runs.length, projectTaskMonitorsStorageKey)).toBe(1);
    const envelope = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
    expect(envelope.monitors[0].version).toBe(2);
    expect(envelope.runs).toHaveLength(1);
    expect(envelope.runs[0]).toMatchObject({ monitorVersion: 2, attempt: 1, state: "succeeded", result: { kind: "not-due" } });
    const messages = await Promise.all([
      page.getByTestId("project-task-monitor-message").textContent(),
      secondPage.getByTestId("project-task-monitor-message").textContent(),
    ]);
    expect(messages.filter((message) => message?.includes("جای دیگری تغییر کرده بود"))).toHaveLength(1);
  } finally {
    await secondPage.close();
  }
});

test("TM-1 serializes a Backbone edit with retry and remains readable in either valid ordering", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-31T08:00:00.000Z"));
  await enterBuilderHome(page);
  const dueAt = "2099-12-14T10:00";
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: dueAt });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);
  await page.getByTestId("project-task-monitor-open-task").click();
  await page.getByTestId("project-backbone-edit").click();
  await fillProjectBackboneForm(page, { ...initialProjectBackboneDraft, taskNextStep: "نسخهٔ دوم گام کار", taskDueAt: dueAt });
  await page.getByTestId("project-backbone-save").click();
  await page.getByTestId("project-backbone-back").click();
  await expect.poll(() => page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null").runs.length, projectTaskMonitorsStorageKey)).toBe(1);
  await page.getByTestId("project-task-filter-monitor").click();
  await page.getByTestId("project-task-monitor-card").click();

  const secondPage = await page.context().newPage();
  try {
    await secondPage.clock.setFixedTime(new Date("2026-08-31T08:00:00.000Z"));
    await enterBuilderHome(secondPage);
    await openProjectTaskMonitorsFromHome(secondPage);
    await secondPage.getByTestId("project-task-monitor-card").click();
    await expect(secondPage.getByTestId("project-task-monitor-retry")).toBeVisible();

    await page.getByTestId("project-task-monitor-open-task").click();
    await page.getByTestId("project-backbone-edit").click();
    await fillProjectBackboneForm(page, { ...initialProjectBackboneDraft, taskNextStep: "نسخهٔ سوم هم‌زمان گام کار", taskDueAt: dueAt });
    await Promise.all([
      page.getByTestId("project-backbone-save").click(),
      secondPage.getByTestId("project-task-monitor-retry").click(),
    ]);
    await expect(page.getByTestId("project-backbone-editor")).toHaveCount(0);
    await expect(secondPage.getByTestId("project-task-monitor-status")).toContainText("در حال پایش");
  } finally {
    await secondPage.close();
  }

  await page.bringToFront();
  await reenterBuilderHomeAfterReload(page);
  await openProjectTaskMonitorsFromHome(page);
  await expect(page.getByTestId("project-task-monitor-read-error")).toHaveCount(0);
  await expect(page.getByTestId("project-task-monitor-card")).toHaveCount(1);
  let envelope = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
  const currentSnapshot = envelope.monitors[0].revisions.at(-1).snapshot;
  await page.getByTestId("project-task-monitor-card").click();
  if (currentSnapshot.status === "watching" && currentSnapshot.origin.taskVersion === 2) {
    await page.getByTestId("project-task-monitor-run-now").click();
    await expect(page.getByTestId("project-task-monitor-retry")).toBeVisible();
  }
  if (currentSnapshot.status === "failed") {
    expect(currentSnapshot.failure.code).toBe("dependency-stale");
  }
  if (currentSnapshot.status === "failed" || currentSnapshot.origin.taskVersion === 2) await page.getByTestId("project-task-monitor-retry").click();
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("در حال پایش");
  envelope = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
  expect([2, 4]).toContain(envelope.runs.length);
  expect(envelope.monitors[0].revisions.at(-1).snapshot.origin.taskVersion).toBe(3);

  await reenterBuilderHomeAfterReload(page);
  await openProjectTaskMonitorsFromHome(page);
  await expect(page.getByTestId("project-task-monitor-read-error")).toHaveCount(0);
  await expect(page.getByTestId("project-task-monitor-card")).toHaveCount(1);
});

test("TM-1 queues re-enable behind the winning Backbone edit and emits one fresh overdue Run", async ({ page }) => {
  const backboneLockName = "chida-prototype-project-backbone:v1:write";
  await page.clock.setFixedTime(new Date("2026-08-31T09:00:00.000Z"));
  await enterBuilderHome(page);
  const dueAt = "2026-08-31T12:00";
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: dueAt });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("موعد رسیده");
  await page.getByTestId("project-task-monitor-toggle").click();
  await expect(page.getByTestId("project-task-monitor-status")).toContainText("غیرفعال");
  await page.getByTestId("project-task-monitor-open-task").click();
  await page.getByTestId("project-backbone-edit").click();
  await fillProjectBackboneForm(page, { ...initialProjectBackboneDraft, taskNextStep: "گام برنده پیش از فعال‌سازی دوباره", taskDueAt: dueAt });

  const secondPage = await page.context().newPage();
  try {
    await secondPage.clock.setFixedTime(new Date("2026-08-31T09:00:00.000Z"));
    await enterBuilderHome(secondPage);
    await openProjectTaskMonitorsFromHome(secondPage);
    await secondPage.getByTestId("project-task-monitor-card").click();
    await expect(secondPage.getByTestId("project-task-monitor-status")).toContainText("غیرفعال");

    await page.evaluate((name) => {
      const lockWindow = window as Window & { __taskMonitorBackboneLockHeld?: boolean; __releaseTaskMonitorBackboneLock?: () => void };
      void navigator.locks.request(name, async () => {
        lockWindow.__taskMonitorBackboneLockHeld = true;
        await new Promise<void>((resolve) => { lockWindow.__releaseTaskMonitorBackboneLock = resolve; });
        lockWindow.__taskMonitorBackboneLockHeld = false;
      });
    }, backboneLockName);
    await expect.poll(() => page.evaluate(() => Boolean((window as Window & { __taskMonitorBackboneLockHeld?: boolean }).__taskMonitorBackboneLockHeld))).toBe(true);

    await page.getByTestId("project-backbone-save").click();
    await expect.poll(() => page.evaluate(async (name) => (await navigator.locks.query()).pending.filter((lock) => lock.name === name).length, backboneLockName)).toBe(1);
    await secondPage.getByTestId("project-task-monitor-toggle").click();
    await expect.poll(() => page.evaluate(async (name) => (await navigator.locks.query()).pending.filter((lock) => lock.name === name).length, backboneLockName)).toBe(2);
  } finally {
    await page.evaluate(() => {
      const lockWindow = window as Window & { __releaseTaskMonitorBackboneLock?: () => void };
      const release = lockWindow.__releaseTaskMonitorBackboneLock;
      delete lockWindow.__releaseTaskMonitorBackboneLock;
      release?.();
    });
  }

  try {
    await expect(page.getByTestId("project-backbone-editor")).toHaveCount(0);
    await expect(secondPage.getByTestId("project-task-monitor-status")).toContainText("موعد رسیده");
    await expect.poll(() => secondPage.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null").runs.length, projectTaskMonitorsStorageKey)).toBe(2);
    const backboneEnvelope = await readProjectBackboneEnvelope(secondPage);
    const monitorEnvelope = await secondPage.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
    expect(backboneEnvelope.tasks[0].version).toBe(2);
    expect(monitorEnvelope.monitors[0].revisions.at(-1).snapshot.origin.taskVersion).toBe(2);
    expect(monitorEnvelope.runs.map((run: { attempt: number }) => run.attempt)).toEqual([1, 2]);
    expect(monitorEnvelope.runs[1]).toMatchObject({ state: "succeeded", origin: { taskVersion: 2 }, result: { kind: "deadline-reached" } });
  } finally {
    await secondPage.close();
  }
});

test("TM-1 deduplicates an overdue automatic check across two tabs", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-31T08:00:00.000Z"));
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2026-08-31T12:00" });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);
  const beforeDeadline = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
  expect(beforeDeadline.monitors[0].version).toBe(1);
  expect(beforeDeadline.runs).toEqual([]);
  await page.getByTestId("project-task-monitor-back").click();
  await page.getByTestId("project-tasks-back").click();

  const secondPage = await page.context().newPage();
  try {
    await secondPage.clock.setFixedTime(new Date("2026-08-31T08:00:00.000Z"));
    await enterBuilderHome(secondPage);
    await Promise.all([
      page.clock.setFixedTime(new Date("2026-08-31T09:00:00.000Z")),
      secondPage.clock.setFixedTime(new Date("2026-08-31T09:00:00.000Z")),
    ]);
    await Promise.all([openProjectTaskMonitorsFromHome(page), openProjectTaskMonitorsFromHome(secondPage)]);
    await expect.poll(() => page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null").runs.length, projectTaskMonitorsStorageKey)).toBe(1);
    const envelope = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
    expect(envelope.monitors[0].version).toBe(2);
    expect(envelope.monitors[0].revisions.at(-1).snapshot.status).toBe("attention");
    expect(envelope.runs[0]).toMatchObject({ attempt: 1, state: "succeeded", effectState: "none", result: { kind: "deadline-reached" } });

    await page.getByTestId("project-task-monitor-card").click();
    await page.getByTestId("project-task-monitor-toggle").click();
    await expect(page.getByTestId("project-task-monitor-status")).toContainText("غیرفعال");
    await page.clock.setFixedTime(new Date("2026-08-31T09:00:00.000Z"));
    await page.getByTestId("project-task-monitor-toggle").click();
    await expect(page.getByTestId("project-task-monitor-status")).toContainText("موعد رسیده");
    const reenabledEnvelope = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
    expect(reenabledEnvelope.monitors[0].version).toBe(5);
    expect(reenabledEnvelope.runs).toHaveLength(2);
    expect(reenabledEnvelope.runs[1]).toMatchObject({ attempt: 2, state: "succeeded", result: { kind: "deadline-reached" } });
  } finally {
    await secondPage.close();
  }
});

test("TM-1 cancels a queued automatic check after leaving the visible Tasks view", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-31T08:00:00.000Z"));
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2026-08-31T12:00" });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);
  await page.getByTestId("project-task-monitor-back").click();
  await page.getByTestId("project-tasks-back").click();

  const monitorLockName = `${projectTaskMonitorsStorageKey}:write`;
  await page.evaluate((lockName) => {
    const lockWindow = window as Window & {
      __releaseQueuedAutomaticMonitorLock?: () => void;
      __queuedAutomaticMonitorLockHeld?: boolean;
    };
    void navigator.locks.request(lockName, { mode: "exclusive" }, async () => {
      lockWindow.__queuedAutomaticMonitorLockHeld = true;
      await new Promise<void>((resolve) => { lockWindow.__releaseQueuedAutomaticMonitorLock = resolve; });
      lockWindow.__queuedAutomaticMonitorLockHeld = false;
    });
  }, monitorLockName);
  await expect.poll(() => page.evaluate(() => Boolean((window as Window & { __queuedAutomaticMonitorLockHeld?: boolean }).__queuedAutomaticMonitorLockHeld))).toBe(true);

  await page.clock.setFixedTime(new Date("2026-08-31T09:00:00.000Z"));
  await openProjectTaskMonitorsFromHome(page);
  await expect.poll(() => page.evaluate(async (name) => (await navigator.locks.query()).pending.filter((lock) => lock.name === name).length, monitorLockName)).toBeGreaterThan(0);
  await page.getByTestId("project-tasks-back").click();
  await expect(page.getByTestId("builder-home")).toBeVisible();

  await page.evaluate(() => {
    const lockWindow = window as Window & { __releaseQueuedAutomaticMonitorLock?: () => void };
    const release = lockWindow.__releaseQueuedAutomaticMonitorLock;
    delete lockWindow.__releaseQueuedAutomaticMonitorLock;
    release?.();
  });
  await expect.poll(() => page.evaluate(async (name) => (await navigator.locks.query()).pending.filter((lock) => lock.name === name).length, monitorLockName)).toBe(0);

  const envelope = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
  expect(envelope.monitors[0].version).toBe(1);
  expect(envelope.runs).toEqual([]);
});

test("TM-1 writes nothing when Web Locks are unavailable", async ({ page }) => {
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2099-12-20T10:30" });
  await page.getByTestId("project-backbone-back").click();
  await page.evaluate(() => Object.defineProperty(window.navigator, "locks", { value: undefined, configurable: true }));
  await openProjectTaskMonitorsFromHome(page);
  await page.getByTestId("project-task-monitor-create").click();
  await expect(page.getByTestId("project-task-monitor-list-message")).toContainText("قفل امن مرورگر در دسترس نبود");
  await expect(page.getByTestId("project-task-monitor-detail")).toHaveCount(0);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), projectTaskMonitorsStorageKey)).toBeNull();
});

test("TM-1 keeps Monitor and Run projections isolated to their owning project", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const base = { usage: "", landArea: "", builtArea: "", aboveGroundFloors: "", basementFloors: "", unitCount: "", createdAt: "2026-08-31T08:00:00.000Z" };
    window.localStorage.setItem("chida-prototype-builder-projects:v2", JSON.stringify([
      { ...base, id: "tm-project-a", name: "پروژه پایش الف", location: "ونک", stage: "فونداسیون" },
      { ...base, id: "tm-project-b", name: "پروژه پایش ب", location: "جردن", stage: "نازک کاری و نما" },
    ]));
    window.localStorage.setItem("chida-prototype-active-project", "tm-project-a");
  });
  await enterBuilderHome(page);
  await createProjectBackbone(page, { ...initialProjectBackboneDraft, taskDueAt: "2099-12-25T12:00" });
  await page.getByTestId("project-backbone-back").click();
  await createProjectTaskDeadlineMonitor(page);
  await page.getByTestId("project-task-monitor-run-now").click();
  await expect(page.getByTestId("project-task-monitor-last-check")).not.toContainText("هنوز بررسی نشده");
  await page.getByTestId("project-task-monitor-back").click();
  await page.getByTestId("project-tasks-back").click();

  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /پروژه پایش ب تهران/ }).click();
  await page.getByTestId("project-space-back").click();
  await openProjectTaskMonitorsFromHome(page);
  await expect(page.getByTestId("project-task-monitor-card")).toHaveCount(0);
  await expect(page.getByTestId("project-task-monitor-set-deadline")).toBeVisible();

  await page.getByTestId("project-tasks-back").click();
  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /پروژه پایش الف تهران/ }).click();
  await page.getByTestId("project-space-back").click();
  await openProjectTaskMonitorsFromHome(page);
  await expect(page.getByTestId("project-task-monitor-card")).toHaveCount(1);
  const envelope = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), projectTaskMonitorsStorageKey);
  expect(envelope.monitors).toHaveLength(1);
  expect(envelope.monitors[0]).toMatchObject({ projectId: "tm-project-a", ownerPrincipalId: "tm-project-a", scopeId: "tm-project-a" });
  expect(envelope.runs).toHaveLength(1);
  expect(envelope.runs[0]).toMatchObject({ projectId: "tm-project-a", ownerPrincipalId: "tm-project-a", scopeId: "tm-project-a", state: "succeeded" });
});
