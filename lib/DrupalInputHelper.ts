import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Helper library for Drupal's non-standard form widgets.
 *
 * Pass the `page` instance from your POM constructor.
 * Each method is scoped to a `container` locator when provided,
 * so it works both at page level and inside specific field wrappers.
 */
export class DrupalInputHelper {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ---------------------------------------------------------------------------
  // CKEditor 5
  // ---------------------------------------------------------------------------

  /**
   * Fill a CKEditor 5 field identified by its wrapping element or field label.
   * `fieldLocator` should point to the `.ck-editor` wrapper or a parent
   * `.form-item` that contains it.
   */
  async fillCKEditor(fieldLocator: Locator, text: string) {
    const editor = fieldLocator.locator(".ck-editor__editable");
    await editor.waitFor({ state: "visible" });
    await editor.click();
    // Clear existing content then type
    await editor.evaluate((el) => {
      (el as HTMLElement).innerHTML = "";
    });
    await editor.type(text);
  }

  /**
   * Fill CKEditor by the machine name of the field (data-drupal-selector).
   * e.g. fieldName = 'edit-body-0'
   */
  async fillCKEditorByField(fieldName: string, text: string) {
    const wrapper = this.page.locator(
      `[data-drupal-selector="${fieldName}"] .ck-editor__editable,
       #${fieldName} .ck-editor__editable`
    );
    await wrapper.waitFor({ state: "visible" });
    await wrapper.click();
    await wrapper.evaluate((el) => {
      (el as HTMLElement).innerHTML = "";
    });
    await wrapper.type(text);
  }

  // ---------------------------------------------------------------------------
  // Entity reference / autocomplete
  // ---------------------------------------------------------------------------

  /**
   * Fill a Drupal entity reference autocomplete field.
   * Types the search string, waits for the dropdown, and clicks the match.
   *
   * @param inputLocator  The `<input>` element of the autocomplete field
   * @param searchText    Text to type (partial match is fine)
   * @param selectText    Exact visible text of the option to select
   *                      (defaults to `searchText` if omitted)
   */
  async fillAutocomplete(
    inputLocator: Locator,
    searchText: string,
    selectText?: string
  ) {
    await inputLocator.click();
    await inputLocator.fill(searchText);
    // Drupal autocomplete list
    const dropdown = this.page.locator("ul.ui-autocomplete li.ui-menu-item");
    await dropdown.first().waitFor({ state: "visible", timeout: 8000 });
    const target = selectText ?? searchText;
    await dropdown.filter({ hasText: target }).first().click();
    await this.page.waitForLoadState("networkidle");
  }

  // ---------------------------------------------------------------------------
  // Tags / multi-value text (e.g. taxonomy term reference via tags widget)
  // ---------------------------------------------------------------------------

  /**
   * Add multiple comma-separated tag values to a Drupal tags-style input.
   * Clears existing value first.
   */
  async fillTagsField(inputLocator: Locator, tags: string[]) {
    await inputLocator.fill(tags.join(", "));
  }

  // ---------------------------------------------------------------------------
  // Select list (standard <select>)
  // ---------------------------------------------------------------------------

  async selectOption(selectLocator: Locator, value: string) {
    await selectLocator.selectOption({ label: value });
  }

  async selectOptionByValue(selectLocator: Locator, value: string) {
    await selectLocator.selectOption({ value });
  }

  // ---------------------------------------------------------------------------
  // Select2 / Chosen (JS-enhanced selects)
  // ---------------------------------------------------------------------------

  /**
   * Pick an option from a Select2-enhanced dropdown.
   * `wrapperLocator` should point to the `.select2-container` div.
   */
  async fillSelect2(wrapperLocator: Locator, optionText: string) {
    await wrapperLocator.click();
    const searchInput = this.page.locator(
      ".select2-dropdown .select2-search__field"
    );
    await searchInput.waitFor({ state: "visible" });
    await searchInput.fill(optionText);
    const option = this.page.locator(
      `.select2-results__option:has-text("${optionText}")`
    );
    await option.waitFor({ state: "visible" });
    await option.click();
  }

  // ---------------------------------------------------------------------------
  // Checkboxes & radio buttons
  // ---------------------------------------------------------------------------

  /** Check or uncheck a checkbox by its label text. */
  async setCheckbox(labelText: string, checked: boolean, container?: Locator) {
    const scope = container ?? this.page;
    const checkbox = scope
      .locator("label")
      .filter({ hasText: labelText })
      .locator("input[type=checkbox], ~ input[type=checkbox]");
    if (checked) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  /** Select a radio option by its label text. */
  async selectRadio(labelText: string, container?: Locator) {
    const scope = container ?? this.page;
    await scope
      .locator("label")
      .filter({ hasText: labelText })
      .locator("input[type=radio], ~ input[type=radio]")
      .check();
  }

  // ---------------------------------------------------------------------------
  // Date / time fields
  // ---------------------------------------------------------------------------

  /**
   * Fill a Drupal date field (type="date").
   * Provide date as "YYYY-MM-DD".
   */
  async fillDate(dateLocator: Locator, date: string) {
    await dateLocator.fill(date);
  }

  /**
   * Fill a Drupal datetime field split into date + time inputs.
   * `fieldName` = the data-drupal-selector prefix, e.g. "edit-field-date-0".
   */
  async fillDatetime(fieldName: string, date: string, time: string) {
    await this.page
      .locator(`[data-drupal-selector="${fieldName}-value-date"]`)
      .fill(date);
    await this.page
      .locator(`[data-drupal-selector="${fieldName}-value-time"]`)
      .fill(time);
  }

  // ---------------------------------------------------------------------------
  // Media / file upload
  // ---------------------------------------------------------------------------

  /**
   * Upload a file to a managed file / media field.
   * `uploadButtonLocator` should point to the file `<input type="file">`.
   */
  async uploadFile(uploadInputLocator: Locator, filePath: string) {
    await uploadInputLocator.setInputFiles(filePath);
    // Wait for Drupal's Ajax upload response
    await this.page.waitForLoadState("networkidle");
  }

  // ---------------------------------------------------------------------------
  // Multi-value fields (e.g. "Add another item" pattern)
  // ---------------------------------------------------------------------------

  /**
   * Click "Add another item" inside a field widget and wait for the new
   * input to appear. Returns the count of items after adding.
   *
   * @param fieldWrapperLocator  The `.field--widget-*` wrapper locator
   */
  async addAnotherItem(fieldWrapperLocator: Locator): Promise<void> {
    const addButton = fieldWrapperLocator.getByRole("button", {
      name: /add another item/i,
    });
    await addButton.click();
    await this.page.waitForFunction(
      () => document.querySelectorAll(".ajax-progress").length === 0
    );
  }

  // ---------------------------------------------------------------------------
  // Paragraphs (common contrib module)
  // ---------------------------------------------------------------------------

  /**
   * Add a paragraph of a given type via the paragraphs widget.
   *
   * @param fieldWrapperLocator  Locator wrapping the paragraphs field
   * @param paragraphType        Visible label on the "Add X" button
   */
  async addParagraph(
    fieldWrapperLocator: Locator,
    paragraphType: string
  ): Promise<Locator> {
    await fieldWrapperLocator
      .getByRole("button", { name: new RegExp(`Add ${paragraphType}`, "i") })
      .click();
    await this.page.waitForFunction(
      () => document.querySelectorAll(".ajax-progress").length === 0
    );
    // Return the last paragraph item added
    return fieldWrapperLocator.locator(".paragraph-type--content").last();
  }

  // ---------------------------------------------------------------------------
  // Inline Entity Form (IEF)
  // ---------------------------------------------------------------------------

  /**
   * Open the "Add new" inline entity form inside an IEF widget.
   */
  async openIEFAddNew(fieldWrapperLocator: Locator) {
    await fieldWrapperLocator
      .getByRole("button", { name: /add new/i })
      .click();
    await this.page.waitForFunction(
      () => document.querySelectorAll(".ajax-progress").length === 0
    );
  }

  /**
   * Save the currently open inline entity form.
   */
  async saveIEF(fieldWrapperLocator: Locator) {
    await fieldWrapperLocator
      .getByRole("button", { name: /create entity|save/i })
      .click();
    await this.page.waitForFunction(
      () => document.querySelectorAll(".ajax-progress").length === 0
    );
  }
}
