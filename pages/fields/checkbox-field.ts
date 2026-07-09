import { type Locator, type Page } from "@playwright/test";
import { DrupalFieldBase } from "./base/drupal-field.base";
import { type CheckboxDrupalField } from "./base/field.interface";

export class CheckboxField extends DrupalFieldBase<boolean> implements CheckboxDrupalField {
  protected buildLocator(scope: Locator | Page, name: string): Locator {
    const dashed = name.replace(/_/g, "-");
    // Covers Drupal's boolean widget (edit-field-published-value) and core
    // fields like the Published status checkbox (edit-status-value).
    return scope.locator(
      [
        `[data-drupal-selector='edit-${dashed}-value']`,
        `[data-drupal-selector='edit-${dashed}']`,
        `#edit-${dashed}-value`,
        `#edit-${dashed}`,
      ].join(", ")
    );
  }

  async fill(value: boolean): Promise<void> {
    await this.locator.setChecked(value);
  }

  async getValue(): Promise<boolean> {
    return this.locator.isChecked();
  }

  async getError(): Promise<string | null> {
    const error = this.locator
      .locator(
        "xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' form-item ')][1]//*[contains(@class, 'form-item--error-message')]"
      )
      .first();
    return (await error.count()) > 0 ? error.innerText() : null;
  }

  async clear(): Promise<void> {
    await this.locator.setChecked(false);
  }

  // No getLabel() override — Drupal checkboxes have a real id with a
  // label[for=id] next to them, so the base class's default lookup applies.
}