import { type Locator } from "@playwright/test";

export interface DrupalField<T = string> {
  readonly locator: Locator;
  fill(value: T): Promise<void>;
  getValue(): Promise<T>;
  getError(): Promise<string | null>;
  clear(): Promise<void>;
  getLabel(): Promise<string>;
}

export type TextDrupalField = DrupalField<string>;
export type CheckboxDrupalField = DrupalField<boolean>;
export type RadioDrupalField = DrupalField<boolean>;
export type SelectDrupalField = DrupalField<string>;
