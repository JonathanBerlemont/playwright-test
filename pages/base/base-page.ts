import { type Page, type Locator, expect } from "@playwright/test";

export class BasePage {
  readonly page: Page;
  readonly adminToolbar: Locator;
  readonly statusMessage: Locator;
  readonly errorMessage: Locator;
  readonly warningMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.adminToolbar = page.locator("#toolbar-bar");
    this.statusMessage = page.locator(".messages--status");
    this.errorMessage = page.locator(".messages--error");
    this.warningMessage = page.locator(".messages--warning");
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.goto("/user/login?showcore");
    await this.page.locator("#user-login-form #edit-name").fill(username);
    await this.page.locator("#user-login-form #edit-pass").fill(password);
    await this.page.locator("#user-login-form #edit-submit").click();
  }

  async logout(): Promise<void> {
    await this.page.goto("/user/logout");
  }

  async expectSuccess(text?: string): Promise<void> {
    await expect(this.statusMessage).toBeVisible();
    if (text) {
      await expect(this.statusMessage).toContainText(text);
    }
  }

  async expectError(text?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (text) {
      await expect(this.errorMessage).toContainText(text);
    }
  }

  async expectNoErrors(): Promise<void> {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async clickToolbarItem(label: string): Promise<void> {
    await this.adminToolbar.getByRole("link", { name: label }).click();
  }
}
