import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";

export type FixtureRow = Record<string, string>;

/**
 * Load all rows from a CSV fixture file as plain objects.
 *
 * Column headers become keys, cell values become strings.
 * Empty rows are skipped. All values are trimmed.
 *
 * @param filePath   Path to the .csv file (relative to project root or absolute)
 * @typeParam T      Shape of a single row, if the fixture's columns are known
 *                   ahead of time. Defaults to FixtureRow (Record<string, string>)
 *                   when the caller doesn't care about specific columns.
 *
 * @example
 * const rows = loadCsv("content/article.fixtures.csv");
 *
 * @example
 * interface ArticleRow { title: string; body: string; published: string }
 * const rows = loadCsv<ArticleRow>("content/article.fixtures.csv");
 */
export function loadCsv<T extends FixtureRow = FixtureRow>(filePath: string): T[] {
  const resolved = path.resolve("fixtures/" + filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Fixture file not found: ${resolved}`);
  }

  const fileContent = fs.readFileSync(resolved, "utf-8");

  const parsed = Papa.parse<T>(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  });

  if (parsed.errors.length > 0) {
    throw new Error(
      `Error parsing CSV file ${resolved}: ${parsed.errors
        .map((e) => e.message)
        .join("; ")}`
    );
  }

  return parsed.data;
}