import { type Page, type Locator, expect } from "@playwright/test";
import { DrupalBasePage } from "./base/DrupalBasePage";

export interface NodeFormData {
  /** Node title (required) */
  title: string;
  /**
   * Map of field machine names → values.
   * How each value is applied depends on `fieldInteractions` below.
   * Example: { "edit-field-summary-0-value": "Some text" }
   */
  fields?: Record<string, string | string[]>;
  /** Publishing status. Defaults to published. */
  published?: boolean;
}

/**
 * Page Object for Drupal node management.
 * Covers: list, create, edit, delete, publish/unpublish.
 */
export class NodePage extends DrupalBasePage {

  // Shared form locators
  readonly titleInput: Locator;
  readonly saveButton: Locator;
  readonly deleteButton: Locator;
  readonly publishedCheckbox: Locator;
  readonly moderationStateSelect: Locator;
  readonly contentTable: Locator;

  constructor(page: Page) {
    super(page);

    this.titleInput = page.locator("#edit-title-0-value");
    this.saveButton = page.locator(
      "#edit-submit, [data-drupal-selector='edit-submit']"
    );
    this.deleteButton = page.locator(
      "a[href*='/delete'], [data-drupal-selector='edit-delete']"
    );
    this.publishedCheckbox = page.locator("#edit-status-value");
    this.moderationStateSelect = page.locator(
      "[data-drupal-selector='edit-moderation-state-0-state']"
    );
    this.contentTable = page.locator(
      "table.views-table, .view-content table"
    );
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  async gotoContentList() {
    await this.page.goto("/admin/content");
  }

  async gotoAddContent(contentType: string) {
    await this.page.goto(`/node/add/${contentType}`);
  }

  async gotoEditNode(nodeId: number) {
    await this.page.goto(`/node/${nodeId}/edit`);
  }

  // ---------------------------------------------------------------------------
  // Content list helpers
  // ---------------------------------------------------------------------------

  /** Return the table row matching a title in the content list. */
  getRowByTitle(title: string): Locator {
    return this.contentTable.locator("tr").filter({ hasText: title });
  }

  /** Click the Edit operations link for a row in the content list. */
  async clickEditInList(title: string) {
    await this.getRowByTitle(title)
      .locator(".views-field-operations a").filter({hasText: "Edit"})
      .click();
  }
}