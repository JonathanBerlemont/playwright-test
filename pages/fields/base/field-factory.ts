import { type Locator } from "@playwright/test";
import { TextField } from "../text-field";
import { CkEditorField } from "../ckeditor-field";
import type { CheckboxDrupalField, RadioDrupalField, SelectDrupalField, TextDrupalField } from "./field.interface";

export type { CheckboxDrupalField, RadioDrupalField, SelectDrupalField, TextDrupalField };
export type FieldKind = "text" | "textarea" | "ckeditor" | "date" | "checkbox" | "radio" | "select";

export function createDrupalField(locator: Locator, kind: "text" | "textarea" | "ckeditor" | "date"): TextDrupalField;
export function createDrupalField(locator: Locator, kind: "checkbox"): CheckboxDrupalField;
export function createDrupalField(locator: Locator, kind: "radio"): RadioDrupalField;
export function createDrupalField(locator: Locator, kind: "select"): SelectDrupalField;
export function createDrupalField(locator: Locator, kind: FieldKind): TextDrupalField | CheckboxDrupalField | RadioDrupalField | SelectDrupalField {
  switch (kind) {
    case "text":
      return new TextField(locator);
    case "textarea":
      return new TextareaField(locator);
    case "ckeditor":
      return new CkEditorField(locator);
    case "date":
      return new DateField(locator);
    case "checkbox":
      return new CheckboxField(locator);
    case "radio":
      return new RadioField(locator);
    case "select":
      return new SelectField(locator);
    default:
      return new TextField(locator);
  }
}
