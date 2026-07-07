import { type Locator, type Page } from "@playwright/test";
import { EntityOverviewPage } from "./base/entity-overview-page";

export class TaxonomyOverviewPage extends EntityOverviewPage {
  constructor(page: Page) {
    // Taxonomy's term list is a draggable table, not a standard Views table —
    // override the base class's default selector.
    super(page, "table.views-table, table.draggable, .view-taxonomy-terms table");
  }

  async gotoVocabularyList(): Promise<void> {
    await this.page.goto("/admin/structure/taxonomy");
  }

  async gotoTermList(vocabularyId: string): Promise<void> {
    await this.page.goto(`/admin/structure/taxonomy/manage/${vocabularyId}/overview`);
  }

  getTermRowByName(name: string): Locator {
    return this.getRowByTitle(name);
  }

  async clickEditTermInList(name: string): Promise<void> {
    await this.clickEditInRow(name);
  }

  async clickDeleteTermInList(name: string): Promise<void> {
    await this.clickDeleteInRow(name);
  }
}
