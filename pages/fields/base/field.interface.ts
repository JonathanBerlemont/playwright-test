import { type Locator } from "@playwright/test";

export interface DrupalField<T = string> {
  readonly locator: Locator;
  fill(value: T): Promise<void>;
  getValue(): Promise<T>;
  getError(): Promise<string | null>;
  clear(): Promise<void>;
  getLabel(): Promise<string>;
}

export interface TextDrupalField extends DrupalField<string> {}

export interface CheckboxDrupalField extends DrupalField<boolean> {}

export interface CKEditorDrupalField extends DrupalField<string> {
  setTextFormat(format: string): Promise<void>;
  getTextFormat(): Promise<string>;
  pressButton(button: string): Promise<void>;
}