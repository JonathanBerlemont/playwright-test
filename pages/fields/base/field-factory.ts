import { type Locator, type Page } from "@playwright/test";
import { TextField } from "../text-field";
import { CKEditorField } from "../ckeditor-field";
import { CheckboxField } from "../checkbox-field";
import type { CKEditorDrupalField, TextDrupalField, CheckboxDrupalField } from "./field.interface";

export type { CKEditorDrupalField, TextDrupalField, CheckboxDrupalField };
export type FieldKind = "text" | "ckeditor" | "checkbox";
export type FieldScope = Locator | Page;

/**
 * @param scope           Where to look — a region Locator, or the whole Page.
 * @param name             Drupal machine name (e.g. "title", "status").
 * @param kind              Which widget class to construct.
 * @param explicitLocator   Bypasses the field class's naming convention
 *                          entirely, for a genuinely nonstandard field.
 */
export function createDrupalField(
  scope: FieldScope,
  name: string,
  kind: "text",
  explicitLocator?: Locator
): TextDrupalField;
export function createDrupalField(
  scope: FieldScope,
  name: string,
  kind: "ckeditor",
  explicitLocator?: Locator
): CKEditorDrupalField;
export function createDrupalField(
  scope: FieldScope,
  name: string,
  kind: "checkbox",
  explicitLocator?: Locator
): CheckboxDrupalField;
export function createDrupalField(
  scope: FieldScope,
  name: string,
  kind: FieldKind,
  explicitLocator?: Locator
): TextDrupalField | CKEditorDrupalField | CheckboxDrupalField {
  switch (kind) {
    case "text":
      return new TextField(scope, name, explicitLocator);
    case "ckeditor":
      return new CKEditorField(scope, name, explicitLocator);
    case "checkbox":
      return new CheckboxField(scope, name, explicitLocator);
  }
}