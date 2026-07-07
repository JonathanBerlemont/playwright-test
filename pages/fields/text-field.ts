import { type Locator } from "@playwright/test";
import { DrupalFieldBase } from "./base/drupal-field.base";

export class TextField extends DrupalFieldBase<string> {
  constructor(locator: Locator) {
    super(locator);
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
