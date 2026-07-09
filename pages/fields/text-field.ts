import { type Locator, type Page } from "@playwright/test";
import { DrupalFieldBase } from "./base/drupal-field.base";

export class TextField extends DrupalFieldBase<string> {
  protected buildLocator(scope: Locator | Page, name: string): Locator {
    const dashed = name.replace(/_/g, "-");
    // Covers a single-value field widget (edit-title-0-value), a base-field
    // input without the -0-value suffix (edit-status), and plain exposed
    // filter inputs (edit-title on /admin/content).
    return scope.locator(
      [
        `[data-drupal-selector='edit-${dashed}-0-value']`,
        `[data-drupal-selector='edit-${dashed}']`,
        `#edit-${dashed}`,
      ].join(", ")
    );
  }

  async fill(value: string): Promise<void> {
    await this.locator.fill(value);
  }

  async getValue(): Promise<string> {
    return this.locator.inputValue();
  }

  async getError(): Promise<string | null> {
    const error = this.locator.locator(".form-item--error-message").first();
    return (await error.count()) > 0 ? error.innerText() : null;
  }

  async clear(): Promise<void> {
    await this.locator.clear();
  }
}
