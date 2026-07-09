import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Shared behavior for any Drupal admin listing/overview screen
 * (content overview, taxonomy term overview, media library, etc.).
 *
 * The table selector differs per listing (Views table vs draggable term
 * table), so it's passed in by the concrete subclass rather than hardcoded.
 */
export abstract class EntityOverviewPage extends BasePage {
  readonly table: Locator;

  constructor(
    page: Page,
    tableSelector = "table.views-table, .view-content table"
  ) {
    super(page);
    this.table = page.locator(tableSelector);
  }

  getRowByTitle(title: string): Locator {
    return this.table.locator("tr").filter({ hasText: title });
  }

  async getRowCount(): Promise<number> {
    return this.table.locator("tbody tr").count();
  }

  async clickEditInRow(title: string): Promise<void> {
    await this.getRowByTitle(title).locator('li.edit').getByRole("link", { name: "Edit" }).click();
  }

  async clickDeleteInRow(title: string): Promise<void> {
    await this.getRowByTitle(title).locator('li.dropbutton-toggle').getByRole("button").click(); // opens dropdown
    await this.getRowByTitle(title).locator('li.delete').getByRole("link", { name: "Delete" }).click();
  }
}
