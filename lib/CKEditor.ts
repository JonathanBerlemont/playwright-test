import { type Page, type Locator } from "@playwright/test";

/**
 * Encapsulates interactions with a single CKEditor 5 instance on a Drupal form.
 *
 * Do not instantiate directly — use the extended fixture helpers:
 *   - `page.getCKEditorByLabel('Body')`
 *   - `locator.getCKEditorByLabel('Body')` (scoped to a form container)
 *
 * @example
 * const body = await page.getCKEditorByLabel('Body');
 * await body.fill('Hello world');
 * await body.setTextFormat('Full HTML');
 * const text = await body.getText();
 */
export class CKEditor {
  private readonly editable: Locator;
  private readonly formatSelect: Locator;

  constructor(fieldWrapper: Locator) {
    this.editable = fieldWrapper.locator(".ck-editor__editable");
    // Drupal's text format switcher — a <select> rendered below the editor.
    this.formatSelect = fieldWrapper.locator("select.filter-list");
  }

  // ---------------------------------------------------------------------------
  // Content
  // ---------------------------------------------------------------------------

  /** Replace the editor content with the given text. */
  async setText(text: string): Promise<void> {
    await this.editable.waitFor({ state: "visible" });
    await this.editable.fill(text);
  }

  /** Return the current plain-text content of the editor. */
  async getText(): Promise<string> {
    await this.editable.waitFor({ state: "visible" });
    return this.editable.innerText();
  }

  // ---------------------------------------------------------------------------
  // Text format (Basic HTML, Full HTML, Plain text…)
  // ---------------------------------------------------------------------------

  /**
   * Switch the Drupal text format for this field.
   * The value must match the visible option label exactly.
   *
   * Drupal shows a confirmation dialog when switching formats — this is
   * handled automatically.
   *
   * @example
   * await body.setTextFormat('Full HTML');
   */
  async setTextFormat(format: string): Promise<void> {
    await this.formatSelect.waitFor({ state: "visible" });

    // Accept Drupal's "change text format" confirmation dialog if it appears.
    const page = this.formatSelect.page();
    page.once("dialog", (dialog) => dialog.accept());

    await this.formatSelect.selectOption({ label: format });
  }

  /**
   * Return the currently active text format label.
   *
   * @example
   * const format = await body.getTextFormat(); // "Basic HTML"
   */
  async getTextFormat(): Promise<string> {
    await this.formatSelect.waitFor({ state: "visible" });
    return this.formatSelect.evaluate(
      (el: HTMLSelectElement) => el.options[el.selectedIndex]?.text ?? ""
    );
  }
}
