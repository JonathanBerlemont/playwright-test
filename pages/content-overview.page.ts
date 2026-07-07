import { type Locator, type Page } from "@playwright/test";
import { EntityOverviewPage } from "./base/entity-overview-page";
import {
  createDrupalField,
  type TextDrupalField,
  type SelectDrupalField,
} from "./fields/base/field-factory";

export class ContentOverviewPage extends EntityOverviewPage {
  readonly titleFilter: TextDrupalField;
  readonly contentTypeFilter: SelectDrupalField;
  readonly statusFilter: SelectDrupalField;
  readonly filterButton: Locator;

  constructor(page: Page) {
    super(page); // uses default Views table selector from base class
    this.titleFilter = createDrupalField(page.locator("#edit-title"), "text");
    this.contentTypeFilter = createDrupalField(page.locator("#edit-type"), "select");
    this.statusFilter = createDrupalField(page.locator("#edit-status"), "select");
    this.filterButton = page.locator("#edit-submit-content");
  }

  async goto(): Promise<void> {
    await this.page.goto("/admin/content");
  }

  async filterByTitle(title: string): Promise<void> {
    await this.titleFilter.fill(title);
    await this.filterButton.click();
  }

  async filterByContentType(contentType: string): Promise<void> {
    await this.contentTypeFilter.fill(contentType);
    await this.filterButton.click();
  }

  async filterByStatus(status: string): Promise<void> {
    await this.statusFilter.fill(status);
    await this.filterButton.click();
  }

  async clickAddContent(contentType: string): Promise<void> {
    await this.page.getByRole("link", { name: new RegExp(contentType, "i") }).click();
  }
}
