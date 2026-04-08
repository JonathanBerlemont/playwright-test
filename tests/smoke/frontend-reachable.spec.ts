import { test, expect } from '@playwright/test';

test.describe("Smoke — Frontend", () => {
  test("home page loads without error", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("body")).toBeVisible();

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("The website encountered an unexpected error");
  });
});
