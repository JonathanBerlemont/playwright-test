import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./base-page";
import {
  createDrupalField,
  type FieldKind,
  type TextDrupalField,
  type CheckboxDrupalField,
  type RadioDrupalField,
  type SelectDrupalField,
} from "../fields/base/field-factory";

export interface FieldLocatorOptions {
  /**
   * Override the default locator strategy for this field. Needed whenever a
   * field doesn't follow Drupal's usual naming convention — renamed labels,
   * custom widgets, prefilled/disabled fields with unusual markup, etc.
   */
  locator?: string;
}

/**
 * Shared behavior for any Drupal fieldable-entity add/edit form
 * (nodes, taxonomy terms, users, media, etc.).
 *
 * Deliberately does NOT declare any concrete fields — bundles/content types
 * differ in which fields they expose, what they're called, and whether
 * they're editable. Concrete pages (NodeFormPage, TaxonomyFormPage, ...) only
 * add navigation. Tests use field()/hasField() with the machine name of
 * whatever field they actually need for that specific bundle.
 */
export abstract class EntityFormPage extends BasePage {
  readonly saveButton: Locator;
  readonly deleteButton: Locator;
  readonly deleteConfirmButton: Locator;

  constructor(
    page: Page,
    saveButtonSelector = "#edit-submit",
    deleteButtonSelector = "#edit-delete"
  ) {
    super(page);
    this.saveButton = page.locator(saveButtonSelector);
    this.deleteButton = page.locator(deleteButtonSelector);
    this.deleteConfirmButton = page.locator("#edit-submit");
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  /** Submits the form and asserts a success status message appears. */
  async saveAndExpect(successText?: string): Promise<void> {
    await this.save();
    await this.expectSuccess(successText);
  }

  /** Submits the form and asserts an error status message appears (e.g. validation failure). */
  async saveAndExpectError(errorText?: string): Promise<void> {
    await this.save();
    await this.expectError(errorText);
  }

  async delete(): Promise<void> {
    await this.deleteButton.click();
  }

  async deleteAndConfirm(): Promise<void> {
    await this.delete();
    await this.deleteConfirmButton.click();
    await this.expectSuccess();
  }

  /** Returns all field-level validation error messages currently shown on the form. */
  async getValidationErrors(): Promise<string[]> {
    const errors = this.page.locator(".messages--error li, .form-item--error-message");
    return errors.allInnerTexts();
  }

  /**
   * Access a field by its Drupal machine name (e.g. "title", "field_tags",
   * "status", "moderation_state") plus the widget type it's rendered as.
   *
   * This is the ONLY way form pages expose fields — there is no per-bundle
   * hardcoding. If a field doesn't follow the default locator convention,
   * pass `{ locator }` explicitly.
   */
  field(name: string, kind: "text" | "textarea" | "ckeditor" | "date", options?: FieldLocatorOptions): TextDrupalField;
  field(name: string, kind: "checkbox", options?: FieldLocatorOptions): CheckboxDrupalField;
  field(
    name: string,
    kind: FieldKind,
    options: FieldLocatorOptions = {}
  ): TextDrupalField | CheckboxDrupalField {
    const locator = options.locator ? this.page.locator(options.locator) : this.resolveFieldLocator(name);
    return createDrupalField(locator, kind as never);
  }

  /**
   * Whether a field with this machine name is present on the current form.
   * Use this before touching a field that isn't guaranteed to exist on every
   * bundle (e.g. "does this content type even have a body field").
   */
  async hasField(name: string, options: FieldLocatorOptions = {}): Promise<boolean> {
    const locator = options.locator ? this.page.locator(options.locator) : this.resolveFieldLocator(name);
    return (await locator.count()) > 0;
  }

  private resolveFieldLocator(name: string): Locator {
    const dashed = name.replace(/_/g, "-");
    return this.page.locator(
      [
        `[data-drupal-selector='edit-${dashed}-0-value']`,
        `[data-drupal-selector='edit-${dashed}']`,
        `.field--name-${name}`,
        `#edit-${dashed}`,
      ].join(", ")
    );
  }
}
