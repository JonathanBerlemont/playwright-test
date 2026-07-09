import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./base-page";
import {
  createDrupalField,
  type FieldKind,
  type TextDrupalField,
} from "../fields/base/field-factory";

export interface FieldLocatorOptions {
  /**
   * Bypasses the field class's own naming convention entirely. Needed only
   * for a genuinely nonstandard field (renamed widget, unusual markup) —
   * the field class itself owns how it normally finds its locator.
   */
  locator?: string;
  /**
   * Constrain the lookup to a named region registered via registerRegion()
   * (e.g. "main", "footer"). Falls back to defaultFieldRegion if not given,
   * or the whole page if neither is set.
   */
  region?: string;
}

/**
 * Shared behavior for any Drupal fieldable-entity add/edit form
 * (nodes, taxonomy terms, users, media, etc.).
 *
 * Deliberately does NOT declare any concrete fields, and does NOT know how
 * to locate one — that's owned by each field class (TextField, CkEditorField,
 * ...) via its own buildLocator(). This page only knows WHERE to look
 * (region scoping) and WHICH widget class to hand the lookup to.
 */
export abstract class EntityFormPage extends BasePage {
  readonly saveButton: Locator;
  readonly deleteButton: Locator;
  readonly deleteConfirmButton: Locator;

  /** Named scopes within the form. Empty unless a subclass registers some. */
  private readonly regions: Record<string, Locator> = {};

  /**
   * Region field() falls back to when no explicit `region` option is passed.
   * Set by a subclass whose form has one dominant region for ordinary
   * content fields (e.g. NodeFormPage sets this to "main").
   */
  protected defaultFieldRegion?: string;

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

  /** Registers a named region so field() can be scoped to it. */
  protected registerRegion(name: string, selector: string): void {
    this.regions[name] = this.page.locator(selector);
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
   * "status") plus the widget type it's rendered as. The field CLASS owns
   * how it locates itself — this method only resolves the search scope
   * (region) and hands off to the factory.
   */
  field(
    name: string,
    kind: FieldKind,
    options: FieldLocatorOptions = {}
  ): TextDrupalField {
    const scope = this.scopeFor(options.region);
    const explicitLocator = options.locator ? this.page.locator(options.locator) : undefined;
    return createDrupalField(scope, name, kind, explicitLocator);
  }

  /** Resolves which scope (a registered region, or the whole page) a lookup should run against. */
  private scopeFor(region?: string): Page | Locator {
    const effectiveRegion = region ?? this.defaultFieldRegion;
    if (!effectiveRegion) {
      return this.page;
    }
    const scope = this.regions[effectiveRegion];
    if (!scope) {
      const known = Object.keys(this.regions).join(", ") || "(none registered)";
      throw new Error(`Unknown form region "${effectiveRegion}". Registered regions: ${known}`);
    }
    return scope;
  }
}
