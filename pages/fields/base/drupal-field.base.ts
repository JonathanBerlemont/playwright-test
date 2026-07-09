import { type Locator, type Page } from "@playwright/test";
import { type DrupalField } from "./field.interface";

/**
 * Base class for all Drupal field widgets.
 *
 * Each concrete field class builds its OWN locator from a machine name via
 * buildLocator() — a text input, a CKEditor wrapper div, a radio group's
 * fieldset, etc. all have different DOM shapes, so there is no shared,
 * generic "find a field by name" strategy here. That responsibility lives
 * on the field class that actually knows its own structure.
 */
export abstract class DrupalFieldBase<T> implements DrupalField<T> {
  readonly locator: Locator;

  constructor(scope: Locator | Page, name: string, explicitLocator?: Locator) {
    // explicitLocator lets a caller bypass the naming convention entirely
    // for a genuinely nonstandard field (renamed widget, unusual markup).
    this.locator = explicitLocator ?? this.buildLocator(scope, name);
  }

  /** Resolves this field's locator from its Drupal machine name, within `scope`. */
  protected abstract buildLocator(scope: Locator | Page, name: string): Locator;

  abstract fill(value: T): Promise<void>;
  abstract getValue(): Promise<T>;
  abstract getError(): Promise<string | null>;
  abstract clear(): Promise<void>;

  /**
   * Default label lookup: id -> label[for=id]. Correct for most simple
   * widgets. Override in any field class whose label isn't shaped that way.
   */
  async getLabel(): Promise<string> {
    const id = await this.locator.getAttribute("id");
    if (!id) return "";

    const label = this.locator.page().locator(`label[for="${id}"]`);
    return (await label.count()) > 0 ? (await label.first().innerText()).trim() : "";
  }
}
