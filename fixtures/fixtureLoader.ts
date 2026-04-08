import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

export type FixtureRow = Record<string, string>;

/**
 * Load all rows from an Excel fixture file as plain objects.
 *
 * Column headers become keys, cell values become strings.
 * Empty rows are skipped. All values are trimmed.
 *
 * @param filePath   Path to the .xlsx file (relative to project root or absolute)
 * @param sheetName  Sheet to read. Defaults to the first sheet if omitted.
 *
 * @example
 * const rows = loadSheet("fixtures/article.fixtures.xlsx");
 * // => [{ title: "Hello", field_summary: "...", field_tags: "drupal, cms" }, ...]
 *
 * @example
 * const rows = loadSheet("fixtures/article.fixtures.xlsx", "draft");
 * // => rows from the "draft" sheet
 */
export function loadSheet(filePath: string, sheetName?: string): FixtureRow[] {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Fixture file not found: ${resolved}`);
  }

  const workbook = XLSX.readFile(resolved);

  const target = sheetName ?? workbook.SheetNames[0];

  if (!workbook.SheetNames.includes(target)) {
    throw new Error(
      `Sheet "${target}" not found in ${resolved}.\n` +
        `Available sheets: ${workbook.SheetNames.join(", ")}`
    );
  }

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets[target],
    {
      defval: "",
      raw: false,
    }
  );

  return raw
    .filter((row) => Object.values(row).some((v) => v !== ""))
    .map((row) => {
      const cleaned: FixtureRow = {};
      for (const [key, value] of Object.entries(row)) {
        cleaned[key.trim()] = typeof value === "string" ? value.trim() : String(value);
      }
      return cleaned;
    });
}
