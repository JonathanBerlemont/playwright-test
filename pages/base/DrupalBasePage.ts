import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Shared base for all Drupal admin POMs.
 * Provides: authentication, admin navigation, status message assertions.
 */
export class DrupalBasePage {
  readonly page: Page;

  readonly adminToolbar: Locator;
  readonly statusMessage: Locator;
  readonly errorMessage: Locator;
  readonly warningMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.adminToolbar  = page.locator("#toolbar-bar");
    this.statusMessage = page.locator(".messages--status");
    this.errorMessage  = page.locator(".messages--error");
    this.warningMessage = page.locator(".messages--warning");
  }

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  async login(username: string, password: string) {
    await this.page.goto('/user/login?showcore');
    await this.page.locator("#user-login-form #edit-name").fill(username);
    await this.page.locator("#user-login-form #edit-pass").fill(password);
    await this.page.locator("#user-login-form #edit-submit").click();
  }

  async logout() {
    await this.page.goto("/user/logout");
  }

  // ---------------------------------------------------------------------------
  // Status assertions
  // ---------------------------------------------------------------------------

  async expectSuccess(text?: string) {
    await expect(this.statusMessage).toBeVisible();
    if (text) await expect(this.statusMessage).toContainText(text);
  }

  async expectError(text?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (text) await expect(this.errorMessage).toContainText(text);
  }

  async expectNoErrors() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  // ---------------------------------------------------------------------------
  // Admin navigation helpers
  // ---------------------------------------------------------------------------

  async gotoAdmin(path: string) {
    await this.page.goto(`/admin/${path}`);
  }

  /** Click an admin toolbar item by its visible label. */
  async clickToolbarItem(label: string) {
    await this.adminToolbar.getByRole("link", { name: label }).click();
  }

  /** Wait for Drupal's Ajax throbber to disappear. */
  async waitForAjax() {
    await this.page.waitForFunction(() => {
      const throbbers = document.querySelectorAll(".ajax-progress");
      return throbbers.length === 0;
    });
  }
}
