import { type Locator } from "@playwright/test";

export interface DrupalField<TInput = string, TOutput = TInput> {
  readonly locator: Locator;
  fill(value: TInput): Promise<void>;
  getValue(): Promise<TOutput>;
  getError(): Promise<string | null>;
  clear(): Promise<void>;
  getLabel(): Promise<string>;
}

export interface TextDrupalField extends DrupalField<string> {}

export interface CheckboxDrupalField extends DrupalField<"true" | "false", boolean> {}

export interface CKEditorDrupalField extends DrupalField<string> {
  setTextFormat(format: string): Promise<void>;
  getTextFormat(): Promise<string>;
  pressButton(button: string): Promise<void>;
}