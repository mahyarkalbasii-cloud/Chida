import { expect, test, type Page } from "@playwright/test";

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
  await page.getByTestId("purchase-request-brand-input").fill("A3");
  await page.getByTestId("purchase-request-specification-input").fill("شاخه ۱۲ متری با پلاک تولید");
  await page.getByTestId("purchase-request-needed-by-input").fill("تا ۱۲ شهریور");
  await page.getByTestId("purchase-request-save").click();
  await page.getByTestId("purchase-request-ready").click();
  await expect(page.getByTestId("project-purchase-request-detail-view")).toContainText("آمادهٔ بازبینی · نسخهٔ ۲");
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

test("quick action chips drag horizontally in the RTL mobile home", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);

  const rail = page.getByRole("region", { name: "اقدام‌های سریع" });
  const overflow = await rail.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(overflow).toBeGreaterThan(20);
  await expect(rail).toHaveCSS("direction", "ltr");
  const initialOffset = await rail.evaluate((element) => element.scrollLeft);
  expect(Math.abs(initialOffset - overflow)).toBeLessThanOrEqual(2);

  const chip = rail.locator(".quick-chip").nth(1);
  const box = await chip.boundingBox();
  if (!box) throw new Error("Quick action chip geometry is unavailable");
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 76, startY, { steps: 8 });
  await page.mouse.up();

  await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeLessThan(initialOffset - 8);
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

test("returning to chat realigns quick actions to the RTL start", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterBuilderHome(page);
  const quickActions = page.locator(".quick-actions");
  await expect.poll(() => quickActions.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeGreaterThan(0);

  await page.getByTestId("open-project-space").click();
  await page.getByTestId("project-space-back").click();

  await expect.poll(() => quickActions.evaluate((element) => ({
    actual: element.scrollLeft,
    expected: Math.max(0, element.scrollWidth - element.clientWidth),
  }))).toEqual(expect.objectContaining({ actual: expect.any(Number), expected: expect.any(Number) }));
  const position = await quickActions.evaluate((element) => ({
    actual: element.scrollLeft,
    expected: Math.max(0, element.scrollWidth - element.clientWidth),
  }));
  expect(position.actual).toBeCloseTo(position.expected, 0);
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
  await expect(page.getByTestId("settings-theme-toggle")).toHaveCount(0);
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

test("Brief saves a weekly cadence and keeps its summary visible in the drawer", async ({ page }) => {
  await enterBuilderHome(page);

  await page.getByTestId("menu-button").click();
  await expect(page.getByTestId("drawer-brief-entry")).toBeVisible();
  await page.getByTestId("drawer-brief-entry").click();
  await expect(page.getByTestId("brief-panel")).toBeVisible();

  await page.getByTestId("brief-frequency-weekly").click();
  await page.getByTestId("brief-weekday-select").selectOption("شنبه");
  await page.getByTestId("brief-time-input").fill("09:00");
  await page.getByTestId("brief-save-button").click();
  await expect(page.getByTestId("brief-save-success")).toContainText("هفتگی");
  await page.getByTestId("brief-back-button").click();

  await page.getByTestId("menu-button").click();
  await expect(page.getByTestId("drawer-brief-summary")).toContainText("هفتگی");
  await expect(page.getByTestId("drawer-brief-summary")).toContainText("شنبه");
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
  await page.getByTestId("project-task-save").click();

  const taskCard = page.getByTestId("project-task-card");
  await expect(taskCard).toHaveCount(1);
  await expect(taskCard).toContainText("پیگیری تأیید نقشه سازه");
  await expect(taskCard).toContainText("در حال انجام");
  await expect(taskCard).toContainText("نسخهٔ ۱");
  const createdTask = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-tasks:v1") ?? "[]")[0]);
  expect(createdTask).toMatchObject({
    projectId: activeProjectId,
    title: "پیگیری تأیید نقشه سازه",
    currentStep: "هماهنگی جلسه با مهندس محاسب",
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
  await expect(taskDetail).toContainText("نسخهٔ ۱");
  await expect(page.getByTestId("project-task-history-event")).toHaveCount(1);
  await page.getByTestId("project-task-status-toggle").click();
  await expect(taskDetail).toContainText("تمام‌شده");
  await expect(taskDetail).toContainText("آخرین گام ثبت‌شده");
  await expect(taskDetail).toContainText("نسخهٔ ۲");
  await expect(page.getByTestId("project-task-history-event")).toHaveCount(2);
  const completedTask = await page.evaluate(() => JSON.parse(window.localStorage.getItem("chida-prototype-project-tasks:v1") ?? "[]")[0]);
  expect(completedTask.status).toBe("completed");
  expect(completedTask.version).toBe(2);
  expect(completedTask.completedAt).toEqual(expect.any(String));
  expect(completedTask.history).toHaveLength(2);

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
  await expect(page.getByTestId("project-task-card")).toContainText("پیگیری تأیید نقشه سازه");
  await page.getByTestId("project-task-card").click();
  await page.getByTestId("project-task-status-toggle").click();
  await expect(page.getByTestId("project-task-detail-view")).toContainText("در حال انجام");
  await expect(page.getByTestId("project-task-detail-view")).toContainText("نسخهٔ ۳");
  await expect(page.getByTestId("project-task-history-event")).toHaveCount(3);
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
    delivery: { city: "تهران", area: "سعادت‌آباد", exactAddressShared: false, neededBy: null },
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
