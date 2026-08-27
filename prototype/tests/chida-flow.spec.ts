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
