import { type Locator } from "@playwright/test";
import { CKEditor } from "../../lib/CKEditor";
import { DrupalFieldBase } from "./base/drupal-field.base";

export class CkEditorField extends DrupalFieldBase<string> {
  private readonly editor: CKEditor;

  constructor(locator: Locator) {
    super(locator);
    this.editor = new CKEditor(locator);
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

  // Override: this.locator is the field wrapper (e.g. ".field--name-body"),
  // not a single input with an id, so the base class's label[for=id] lookup
  // doesn't apply. The label just lives inside the wrapper directly.
  override async getLabel(): Promise<string> {
    const label = this.locator.locator("label").first();
    return (await label.count()) > 0 ? (await label.innerText()).trim() : "";
  }
}
