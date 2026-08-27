import { expect, test, type Page } from "@playwright/test";

async function enterBuilderHome(page: Page) {
  await page.goto("/");
  await page.getByTestId("role-builder").click();
  await expect(page.getByTestId("invite-input")).toHaveValue("CHD-4K9P");
  await page.getByTestId("invite-submit").click();
  await expect(page.getByTestId("phone-input")).toHaveValue("09123456789");
  await page.getByTestId("phone-submit").click();
  await expect(page.getByTestId("otp-input")).toHaveValue("123456");
  await page.getByTestId("otp-submit").click();
  await page.getByTestId("enter-home").click();
  await expect(page.getByTestId("builder-home")).toBeVisible();
}

test("supplier stays unavailable while builder flow is prefilled and complete", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.getByTestId("auth-flow")).toHaveAttribute("dir", "rtl");

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
  if (!card || !context || !plus || !gauge) throw new Error("Required home controls are not rendered");

  expect(Math.abs(context.y - (card.y + card.height))).toBeLessThanOrEqual(1.5);
  expect(plus.x).toBeGreaterThan(gauge.x);
  expect(Math.abs(plus.x - (gauge.x + gauge.width))).toBeLessThanOrEqual(8);
  expect(plus.width).toBeGreaterThanOrEqual(48);
  expect(gauge.width).toBeGreaterThanOrEqual(48);

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
  const screenBox = await page.getByTestId("device-screen").boundingBox();
  if (!drawerBox || !screenBox) throw new Error("Drawer geometry is unavailable");
  expect(drawerBox.width / screenBox.width).toBeGreaterThanOrEqual(0.78);
  expect(drawerBox.width / screenBox.width).toBeLessThanOrEqual(0.9);
});

test("project context, theme, keyboard attachment, and local send all react", async ({ page }) => {
  await enterBuilderHome(page);

  await page.getByTestId("project-switcher").click();
  await page.getByRole("button", { name: /خانه جردن تهران/ }).click();
  await expect(page.getByTestId("project-switcher")).toContainText("خانه جردن");
  await expect(page.getByTestId("project-context")).toContainText("خانه جردن");
  await expect(page.getByTestId("composer-input")).toHaveAttribute("placeholder", "پیامت برای خانه جردن...");

  await page.getByTestId("profile-button").click();
  await page.getByTestId("settings-theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-chida-theme", /light|dark/);
  await page.getByTestId("settings-theme-toggle").press("Escape");

  await page.getByTestId("composer-input").click();
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "true");
  await page.getByTestId("composer-input").fill("برنامه خرید فردا را آماده کن");
  await page.getByTestId("send-button").click();
  await expect(page.getByText("برنامه خرید فردا را آماده کن")).toBeVisible();
  await expect(page.getByText(/برای «خانه جردن» گرفتم/)).toBeVisible();
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
});
