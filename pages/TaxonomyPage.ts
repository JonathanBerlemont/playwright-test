import { type Page, type Locator, expect } from "@playwright/test";
import { DrupalBasePage } from "./base/DrupalBasePage";
import { DrupalInputHelper } from "../lib/DrupalInputHelper";

export interface TermFormData {
  name: string;
  description?: string;
  /** Parent term name for hierarchical vocabularies. */
  parent?: string;
  /** Weight (ordering). */
  weight?: number;
  /** Additional custom fields: machine name → value. */
  fields?: Record<string, string>;
}

/**
 * Page Object for Drupal Taxonomy management.
 * Covers: list vocabularies, list terms, create/edit/delete terms,
 * reorder terms, and vocabulary-level operations.
 */
export class TaxonomyPage extends DrupalBasePage {
  readonly input: DrupalInputHelper;

  // Term form
  readonly nameInput: Locator;
  readonly descriptionWrapper: Locator;
  readonly parentSelect: Locator;
  readonly weightInput: Locator;
  readonly saveButton: Locator;
  readonly deleteButton: Locator;

  // Term list
  readonly termTable: Locator;

  constructor(page: Page) {
    super(page);
    this.input = new DrupalInputHelper(page);

    this.nameInput = page.locator(
      "#edit-name-0-value, [data-drupal-selector='edit-name-0-value']"
    );
    this.descriptionWrapper = page.locator(
      ".field--name-description, #edit-description-wrapper"
    );
    this.parentSelect = page.locator(
      "#edit-relations-parent, [data-drupal-selector='edit-relations-parent']"
    );
    this.weightInput = page.locator(
      "#edit-weight, [data-drupal-selector='edit-weight']"
    );
    this.saveButton = page.locator(
      "#edit-submit, [data-drupal-selector='edit-submit']"
    );
    this.deleteButton = page.locator(
      "[data-drupal-selector='edit-delete'], a[href*='/delete']"
    );
    this.termTable = page.locator(
      "table.views-table, table.draggable, .view-taxonomy-terms table"
    );
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  async gotoVocabularyList() {
    await this.page.goto("/admin/structure/taxonomy");
  }

  async gotoTermList(vocabularyId: string) {
    await this.page.goto(`/admin/structure/taxonomy/manage/${vocabularyId}/overview`);
  }

  async gotoAddTerm(vocabularyId: string) {
    await this.page.goto(`/admin/structure/taxonomy/manage/${vocabularyId}/add`);
  }

  async gotoEditTerm(termId: number) {
    await this.page.goto(`/taxonomy/term/${termId}/edit`);
  }

  async gotoDeleteTerm(termId: number) {
    await this.page.goto(`/taxonomy/term/${termId}/delete`);
  }

  // ---------------------------------------------------------------------------
  // Term list helpers
  // ---------------------------------------------------------------------------

  /** Return the row matching a term name in the current term list. */
  getTermRowByName(name: string): Locator {
    return this.termTable.locator("tr").filter({ hasText: name });
  }

  async clickEditTermInList(name: string) {
    await this.getTermRowByName(name)
      .getByRole("link", { name: "Edit" })
      .click();
  }

  // ---------------------------------------------------------------------------
  // Create term
  // ---------------------------------------------------------------------------

  async createTerm(vocabularyId: string, data: TermFormData): Promise<string> {
    await this.gotoAddTerm(vocabularyId);
    await this.fillTermForm(data);
    await this.saveButton.click();
    await this.expectSuccess();
    return this.page.url();
  }

  // ---------------------------------------------------------------------------
  // Edit term
  // ---------------------------------------------------------------------------

  async editTerm(termId: number, data: Partial<TermFormData>): Promise<void> {
    await this.gotoEditTerm(termId);
    await this.fillTermForm(data);
    await this.saveButton.click();
    await this.expectSuccess();
  }

  // ---------------------------------------------------------------------------
  // Delete term
  // ---------------------------------------------------------------------------

  async deleteTerm(termId: number): Promise<void> {
    await this.gotoDeleteTerm(termId);
    await this.page.locator("#edit-submit").click();
    await this.expectSuccess();
  }

  /**
   * Delete a term directly from the term list by its visible name.
   * Uses the operations dropdown / delete link.
   */
  async deleteTermFromList(vocabularyId: string, termName: string) {
    await this.gotoTermList(vocabularyId);
    const row = this.getTermRowByName(termName);
    // Open the operations dropdown if present
    const dropbuttonToggle = row.locator(".dropbutton-toggle button");
    if (await dropbuttonToggle.isVisible()) {
      await dropbuttonToggle.click();
    }
    await row.getByRole("link", { name: "Delete" }).click();
    await this.page.locator("#edit-submit").click();
    await this.expectSuccess();
  }

  // ---------------------------------------------------------------------------
  // Bulk operations
  // ---------------------------------------------------------------------------

  /**
   * Delete multiple terms at once via the taxonomy overview checkboxes.
   */
  async bulkDeleteTerms(vocabularyId: string, termNames: string[]) {
    await this.gotoTermList(vocabularyId);
    for (const name of termNames) {
      await this.getTermRowByName(name)
        .locator("input[type=checkbox]")
        .check();
    }
    await this.input.selectOption(
      this.page.locator("#edit-action"),
      "Delete taxonomy term"
    );
    await this.page.locator("#edit-submit--2").click();
    await this.page.locator("#edit-submit").click();
    await this.expectSuccess();
  }

  // ---------------------------------------------------------------------------
  // Vocabulary operations
  // ---------------------------------------------------------------------------

  /** Check a named vocabulary exists in the vocabulary list. */
  async expectVocabularyExists(label: string) {
    await this.gotoVocabularyList();
    await expect(
      this.page.locator("table").getByRole("cell", { name: label })
    ).toBeVisible();
  }

  // ---------------------------------------------------------------------------
  // Assertions
  // ---------------------------------------------------------------------------

  async expectTermInList(vocabularyId: string, termName: string) {
    await this.gotoTermList(vocabularyId);
    await expect(this.getTermRowByName(termName)).toBeVisible();
  }

  async expectTermNotInList(vocabularyId: string, termName: string) {
    await this.gotoTermList(vocabularyId);
    await expect(this.getTermRowByName(termName)).not.toBeVisible();
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  protected async fillTermForm(data: Partial<TermFormData>) {
    if (data.name !== undefined) {
      await this.nameInput.fill(data.name);
    }

    if (data.description !== undefined) {
      // Description can be CKEditor or plain textarea
      const hasCK = await this.descriptionWrapper
        .locator(".ck-editor__editable")
        .isVisible()
        .catch(() => false);
      if (hasCK) {
        await this.input.fillCKEditor(this.descriptionWrapper, data.description);
      } else {
        await this.descriptionWrapper
          .locator("textarea")
          .fill(data.description);
      }
    }

    if (data.parent !== undefined) {
      await this.input.selectOption(this.parentSelect, data.parent);
    }

    if (data.weight !== undefined) {
      await this.weightInput.fill(String(data.weight));
    }

    // Custom fields: bare text inputs by data-drupal-selector or id
    if (data.fields) {
      for (const [selector, value] of Object.entries(data.fields)) {
        await this.page
          .locator(`[data-drupal-selector="${selector}"], #${selector}`)
          .fill(value);
      }
    }
  }
}
