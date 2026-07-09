import { type Locator, type Page } from "@playwright/test";
import { DrupalFieldBase } from "./base/drupal-field.base";

export class CKEditorField extends DrupalFieldBase<string> {
  private readonly editable: Locator;
  private readonly formatSelect: Locator;
  private readonly toolbar: Locator;

  constructor(scope: Locator | Page, name: string, explicitLocator?: Locator) {
    super(scope, name, explicitLocator);

    const rootLocator = explicitLocator ?? this.locator;
    this.editable = rootLocator.locator(".ck-editor__editable");
    this.formatSelect = rootLocator.locator("select.filter-list");
    this.toolbar = rootLocator.locator(".ck-toolbar");
  }

  protected buildLocator(scope: Locator | Page, name: string): Locator {
    return scope.locator(`.field--name-${name}`);
  }

  private async getActiveEditable(): Promise<Locator> {
    const sourceTextarea = this.locator.locator(".ck-source-editing-area textarea");
    const isSourceMode = (await sourceTextarea.count()) > 0 && (await sourceTextarea.isVisible().catch(() => false));

    return isSourceMode ? sourceTextarea : this.editable;
  }

  async fill(value: string): Promise<void> {
    const editable = await this.getActiveEditable();
    await editable.waitFor({ state: "visible" });
    await editable.fill(value);
  }

  async getValue(): Promise<string> {
    const editable = await this.getActiveEditable();
    await editable.waitFor({ state: "visible" });

    return (await editable.evaluate((el: HTMLElement) => el.tagName.toLowerCase())) === "textarea"
      ? editable.inputValue()
      : editable.innerText();
  }

  async clear(): Promise<void> {
    await this.fill("");
  }

  async setTextFormat(format: string): Promise<void> {
    await this.formatSelect.waitFor({ state: "visible" });

    const page = this.formatSelect.page();
    page.once("dialog", dialog => dialog.accept());

    await this.formatSelect.selectOption({ label: format });
  }

  async getTextFormat(): Promise<string> {
    await this.formatSelect.waitFor({ state: "visible" });

    return this.formatSelect.evaluate(
      (el: HTMLSelectElement) =>
        el.options[el.selectedIndex]?.text ?? ""
    );
  }

  async getError(): Promise<string | null> {
    return null;
  }

  async pressButton(button: string): Promise<void> {
    await this.toolbar.waitFor({ state: "visible" });
    await this.toolbar.getByRole("button", { name: button }).click();
  }

  override async getLabel(): Promise<string> {
    const label = this.locator.locator("label").first();
    return (await label.count()) > 0
      ? (await label.innerText()).trim()
      : "";
  }
}