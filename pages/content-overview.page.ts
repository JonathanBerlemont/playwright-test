import { type Locator, type Page } from "@playwright/test";
import { EntityOverviewPage } from "./base/entity-overview-page";
import { createDrupalField, type TextDrupalField } from "./fields/base/field-factory";

export class ContentOverviewPage extends EntityOverviewPage {
  readonly titleFilter: TextDrupalField;
  readonly filterButton: Locator;

  constructor(page: Page) {
    super(page); // uses default Views table selector from base class
    this.titleFilter = createDrupalField(page, "title", "text");
    this.filterButton = page.locator("#edit-submit-content");
  }

  async goto(): Promise<void> {
    await this.page.goto("/admin/content");
  }

  async filterByTitle(title: string): Promise<void> {
    await this.titleFilter.fill(title);
    await this.filterButton.click();
  }

  async clickAddContent(contentType: string): Promise<void> {
    await this.page.getByRole("link", { name: new RegExp(contentType, "i") }).click();
  }
}
