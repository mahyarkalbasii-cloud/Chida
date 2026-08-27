import { expect, test, type Page } from "@playwright/test";

async function enterBuilderHome(page: Page) {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-chida-theme", "dark");
  await page.getByTestId("role-builder").click();
  await expect(page.getByTestId("invite-input")).toHaveValue("CHD-4K9P");
  await page.getByTestId("invite-submit").click();
  await expect(page.getByTestId("phone-input")).toHaveValue("09123456789");
  await page.getByTestId("phone-submit").click();
  await expect(page.getByTestId("otp-input")).toHaveValue("123456");
  await page.getByTestId("otp-submit").click();
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("builder-home")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-chida-theme", "dark");
  await expect(page.getByTestId("builder-home")).toHaveAttribute("data-mode", "fullscreen");
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
  await expect(page.getByTestId("project-context")).toContainText("پروژه فعال");
  await expect(page.getByTestId("project-context")).toContainText("برج نیلوفر");
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

  await page.getByTestId("model-button").click();
  await expect(page.getByTestId("model-sheet")).toBeVisible();
  await expect(page.getByRole("button", { name: /خودکار بهترین حالت/ })).toHaveAttribute("data-selected", "true");
  await page.getByRole("button", { name: /عمیق تحلیل کامل‌تر/ }).click();
  await expect(page.getByTestId("model-button")).toHaveAttribute("aria-label", "حالت پاسخ: عمیق");

  await page.getByTestId("capability-cluster").click();
  await expect(page.getByTestId("tools-sheet")).toBeVisible();
  await page.getByRole("button", { name: /جست‌وجوی بازار/ }).click();

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
  await page.getByRole("button", { name: /خانه جردن تهران/ }).click();
  await expect(page.getByTestId("project-switcher")).toContainText("خانه جردن");
  await expect(page.getByTestId("project-context")).toContainText("خانه جردن");
  await expect(page.getByTestId("composer-input")).toHaveAttribute("placeholder", "پیامت برای خانه جردن...");

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
  await expect(page.getByText(/برای «خانه جردن» گرفتم/)).toBeVisible();
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
