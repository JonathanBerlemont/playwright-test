import { test, expect } from '@playwright/test';
import { DrupalBasePage } from "../pages/base/DrupalBasePage";

test.describe("Admin login", () => {
  test("valid credentials reach the admin dashboard", async ({ page }) => {
    const admin = new DrupalBasePage(page);  
    await expect(admin.adminToolbar).not.toBeVisible();
    await admin.login(process.env.ADMIN_USER!, process.env.ADMIN_PASS!);

    await expect(admin.adminToolbar).toBeVisible();
  });

  test("invalid credentials are rejected", async ({ page }) => {
    const admin = new DrupalBasePage(page);  
    await admin.login('wrong-admin', 'wrong-pass');

    await expect(page.locator(".messages--error")).toBeVisible();
  });

  test("logout redirects away from admin", async ({ page }) => {
    const admin = new DrupalBasePage(page);
    await admin.login(process.env.ADMIN_USER!, process.env.ADMIN_PASS!);
    await admin.logout();

    await expect(admin.adminToolbar).not.toBeVisible();
  });
});
