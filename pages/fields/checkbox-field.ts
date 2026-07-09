import { type Locator, type Page } from "@playwright/test";
import { DrupalFieldBase } from "./base/drupal-field.base";
import { type CheckboxDrupalField } from "./base/field.interface";

export class CheckboxField extends DrupalFieldBase<"true" | "false", boolean> implements CheckboxDrupalField {
  protected buildLocator(scope: Locator | Page, name: string): Locator {
    const dashed = name.replace(/_/g, "-");
    // Resolve the actual checkbox input (not its wrapper), since setChecked()
    // only works on checkable input elements.
    return scope.locator(
      [
        `input[type='checkbox'][data-drupal-selector='edit-${dashed}-value']`,
        `input[type='checkbox'][data-drupal-selector='edit-${dashed}']`,
        `input[type='checkbox']#edit-${dashed}-value`,
        `input[type='checkbox']#edit-${dashed}`,
        `[data-drupal-selector='edit-${dashed}-value'] input[type='checkbox']`,
        `[data-drupal-selector='edit-${dashed}'] input[type='checkbox']`,
        `#edit-${dashed}-value input[type='checkbox']`,
        `#edit-${dashed} input[type='checkbox']`,
      ].join(", ")
    );
  }

  private checkboxLocator(): Locator {
    return this.locator.first();
  }

  async fill(value: "true" | "false"): Promise<void> {
    const booleanValue = value === "true";
    await this.checkboxLocator().setChecked(booleanValue);
  }

  async getValue(): Promise<boolean> {
    return this.checkboxLocator().isChecked();
  }

  async getError(): Promise<string | null> {
    const error = this.locator.locator(".form-item--error-message").first();
    return (await error.count()) > 0 ? error.innerText() : null;
  }

  async clear(): Promise<void> {
    await this.checkboxLocator().setChecked(false);
  }
}