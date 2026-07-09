import { type Locator, type Page } from "@playwright/test";
import { TextField } from "../text-field";
import { CkEditorField } from "../ckeditor-field";
import type { TextDrupalField } from "./field.interface";

export type { TextDrupalField };
export type FieldKind = "text" | "ckeditor";
export type FieldScope = Locator | Page;

/**
 * @param scope           Where to look — a region Locator, or the whole Page.
 * @param name             Drupal machine name (e.g. "title", "body").
 * @param kind              Which widget class to construct.
 * @param explicitLocator   Bypasses the field class's naming convention
 *                          entirely, for a genuinely nonstandard field.
 */
export function createDrupalField(
  scope: FieldScope,
  name: string,
  kind: FieldKind,
  explicitLocator?: Locator
): TextDrupalField {
  switch (kind) {
    case "text":
      return new TextField(scope, name, explicitLocator);
    case "ckeditor":
      return new CkEditorField(scope, name, explicitLocator);
  }
}
