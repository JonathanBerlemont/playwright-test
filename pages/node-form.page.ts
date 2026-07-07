import { type Page } from "@playwright/test";
import { EntityFormPage } from "./base/entity-form-page";

export class NodeFormPage extends EntityFormPage {
  constructor(page: Page) {
    super(page);
  }

  async gotoAddContent(contentType: string): Promise<void> {
    await this.page.goto(`/node/add/${contentType}`);
  }

  async gotoEditNode(nodeId: number): Promise<void> {
    await this.page.goto(`/node/${nodeId}/edit`);
  }
}
