import { type Page } from "@playwright/test";
import { EntityFormPage } from "./base/entity-form-page";

export class TaxonomyFormPage extends EntityFormPage {
  constructor(page: Page) {
    super(page);
  }

  async gotoAddTerm(vocabularyId: string): Promise<void> {
    await this.page.goto(`/admin/structure/taxonomy/manage/${vocabularyId}/add`);
  }

  async gotoEditTerm(termId: number): Promise<void> {
    await this.page.goto(`/taxonomy/term/${termId}/edit`);
  }

  async gotoDeleteTerm(termId: number): Promise<void> {
    await this.page.goto(`/taxonomy/term/${termId}/delete`);
  }
}
