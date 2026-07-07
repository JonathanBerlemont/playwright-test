import { type Locator } from "@playwright/test";
import { type DrupalField } from "./field.interface";

/**
 * Base class for all Drupal field widgets. Provides a generic getLabel()
 * default based on the field's `id` -> `label[for=id]`, which covers most
 * simple widgets (text, textarea, select, checkbox).
 *
 * Override getLabel() in any field class whose label isn't shaped that way —
 * e.g. a radio/checkboxes group uses a <fieldset><legend> instead of a
 * for-attribute label, CKEditor's locator is a wrapper div rather than a
 * single input with an id, a date composite may cover several sub-inputs.
 */
export abstract class DrupalFieldBase<T> implements DrupalField<T> {
  readonly locator: Locator;

  constructor(locator: Locator) {
    const mainRegion = locator.page().locator(".layout-region--main");
    this.locator = mainRegion.locator(locator).first();
  }

  abstract fill(value: T): Promise<void>;
  abstract getValue(): Promise<T>;
  abstract getError(): Promise<string | null>;
  abstract clear(): Promise<void>;

  async getLabel(): Promise<string> {
    const id = await this.locator.getAttribute("id");
    if (!id) return "";

    const label = this.locator.page().locator(`label[for="${id}"]`);
    return (await label.count()) > 0 ? (await label.first().innerText()).trim() : "";
  }
}
