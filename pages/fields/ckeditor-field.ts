import { type Locator, type Page } from "@playwright/test";
import { CKEditor } from "../../lib/CKEditor";
import { DrupalFieldBase } from "./base/drupal-field.base";

export class CkEditorField extends DrupalFieldBase<string> {
  private readonly editor: CKEditor;

  constructor(scope: Locator | Page, name: string, explicitLocator?: Locator) {
    super(scope, name, explicitLocator);
    // this.locator is the field WRAPPER (e.g. ".field--name-body"), not a
    // single input — CKEditor's own class knows how to find the editable
    // area within it.
    this.editor = new CKEditor(this.locator);
  }

  protected buildLocator(scope: Locator | Page, name: string): Locator {
    return scope.locator(`.field--name-${name}`);
  }

  async fill(value: string): Promise<void> {
    await this.editor.setText(value);
  }

  async getValue(): Promise<string> {
    return this.editor.getText();
  }

  async getError(): Promise<string | null> {
    return null;
  }

  async clear(): Promise<void> {
    await this.editor.setText("");
  }

  // Override: this.locator is the field wrapper, not a single input with an
  // id, so the base class's label[for=id] lookup doesn't apply. The label
  // just lives inside the wrapper directly.
  override async getLabel(): Promise<string> {
    const label = this.locator.locator("label").first();
    return (await label.count()) > 0 ? (await label.innerText()).trim() : "";
  }
}
