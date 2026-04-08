import { type Page, type Locator, expect } from "@playwright/test";
import { DrupalBasePage } from "./base/DrupalBasePage";
import { DrupalInputHelper } from "../lib/DrupalInputHelper";

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
  readonly input: DrupalInputHelper;

  // Shared form locators
  readonly titleInput: Locator;
  readonly saveButton: Locator;
  readonly deleteButton: Locator;
  readonly publishedCheckbox: Locator;
  readonly moderationStateSelect: Locator;
  readonly contentTable: Locator;

  constructor(page: Page) {
    super(page);
    this.input = new DrupalInputHelper(page);

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

  async gotoDeleteNode(nodeId: number) {
    await this.page.goto(`/node/${nodeId}/delete`);
  }

  // ---------------------------------------------------------------------------
  // Content list helpers
  // ---------------------------------------------------------------------------

  /** Filter the /admin/content list by title. */
  async filterByTitle(title: string) {
    await this.page.locator("#edit-title").fill(title);
    await this.page.locator("#edit-submit-content").click();
    await this.page.waitForLoadState("networkidle");
  }

  /** Filter the /admin/content list by content type. */
  async filterByType(contentType: string) {
    await this.input.selectOption(
      this.page.locator("#edit-type"),
      contentType
    );
    await this.page.locator("#edit-submit-content").click();
    await this.page.waitForLoadState("networkidle");
  }

  /** Return the table row matching a title in the content list. */
  getRowByTitle(title: string): Locator {
    return this.contentTable.locator("tr").filter({ hasText: title });
  }

  /** Click the Edit operations link for a row in the content list. */
  async clickEditInList(title: string) {
    await this.getRowByTitle(title)
      .getByRole("link", { name: "Edit" })
      .click();
  }

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  /**
   * Create a node of the given content type using a NodeFormData object.
   * Returns the URL of the saved node.
   *
   * Custom fields are NOT wired here by default — override `fillCustomFields`
   * in a subclass, or call the input helper methods directly in your test
   * after calling `gotoAddContent`.
   */
  async create(contentType: string, data: NodeFormData): Promise<string> {
    await this.gotoAddContent(contentType);
    await this.fillCoreFields(data);
    await this.saveButton.click();
    await this.expectSuccess();
    return this.page.url();
  }

  // ---------------------------------------------------------------------------
  // Edit
  // ---------------------------------------------------------------------------

  async edit(nodeId: number, data: Partial<NodeFormData>): Promise<void> {
    await this.gotoEditNode(nodeId);
    await this.saveButton.click();
    await this.expectSuccess();
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  async delete(nodeId: number): Promise<void> {
    await this.gotoDeleteNode(nodeId);
    await this.page.locator("#edit-submit").click();
    await this.expectSuccess();
  }

  // ---------------------------------------------------------------------------
  // Publish / unpublish
  // ---------------------------------------------------------------------------

  async publish(nodeId: number) {
    await this.gotoEditNode(nodeId);
    await this.publishedCheckbox.check();
    await this.saveButton.click();
    await this.expectSuccess();
  }

  async unpublish(nodeId: number) {
    await this.gotoEditNode(nodeId);
    await this.publishedCheckbox.uncheck();
    await this.saveButton.click();
    await this.expectSuccess();
  }

  // ---------------------------------------------------------------------------
  // Assertions
  // ---------------------------------------------------------------------------

  async expectNodeInList(title: string) {
    await this.gotoContentList();
    await this.filterByTitle(title);
    await expect(this.getRowByTitle(title)).toBeVisible();
  }

  async expectNodeNotInList(title: string) {
    await this.gotoContentList();
    await this.filterByTitle(title);
    await expect(this.getRowByTitle(title)).not.toBeVisible();
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Fill title, published status, and moderation state.
   * Custom fields should be handled separately via `this.input`.
   */
  protected async fillCoreFields(data: Partial<NodeFormData>) {
    if (data.title !== undefined) {
      await this.titleInput.fill(data.title);
    }

    if (data.published !== undefined) {
      if (data.published) {
        await this.publishedCheckbox.check();
      } else {
        await this.publishedCheckbox.uncheck();
      }
    }
  }
}
