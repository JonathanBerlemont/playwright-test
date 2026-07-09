import { loadCsv } from "../../fixtures/loadFixture";
import { test, expect } from "@playwright/test";
import { ContentOverviewPage } from "../../pages/content-overview.page";
import { NodeFormPage } from "../../pages/node-form.page";

type PageFixtureRow = {
  description: string;
  title: string;
  body: string;
  published: "true" | "false";
  expected: "success" | "error";
};

const rows = loadCsv<PageFixtureRow>("content/pages.fixtures.csv");

test.describe("Basic Pages CRUD as a content editor", () => {
  test.beforeEach(async ({ page }) => {
    const nodePage = new NodeFormPage(page);
    await nodePage.login(process.env.EDITOR_USER!, process.env.EDITOR_PASS!);
  });

  // Test CSV defined scenarios for creating pages. Each row in the CSV is a separate test.
  for (const row of rows) {
    test(row.description, async ({ page }) => {
      const nodePage = new NodeFormPage(page);

      await nodePage.gotoAddContent("page");

      await nodePage.field("title", "text").fill(row.title);
      await nodePage.field("body", "ckeditor").fill(row.body);
      await nodePage.field("status", "checkbox", { region: "footer" }).fill(row.published);

      if (row.expected === "success") {
        await nodePage.saveAndExpect();
        await expect(page.locator("body")).toContainText(row.title);
        await expect(page.locator("body")).toContainText(row.body);

        if (row.published === "false") {
          await expect(page.locator("article.node.node--unpublished").first()).toBeVisible();
        }
      } else {
        await nodePage.saveAndExpectError();
      }
    });
  }

  test("as a content editor, I can edit a basic page", async ({ page }) => {
    const overviewPage = new ContentOverviewPage(page);
    const row = rows[0];

    await overviewPage.goto();
    await overviewPage.filterByTitle(row.title);
    await overviewPage.clickEditInRow(row.title);

    const nodePage = new NodeFormPage(page);
    await expect(page.locator(".page-title")).toContainText(row.title);
    await expect(await nodePage.field("title", "text").getValue()).toBe(row.title);
    await nodePage.field("title", "text").fill(row.title + " (edited)");
    await nodePage.saveAndExpect(row.title + " (edited)");
  });

  test("as a content editor, I can delete a basic page", async ({ page }) => {
    const overviewPage = new ContentOverviewPage(page);
    const row = rows[0];

    await overviewPage.goto();
    await overviewPage.filterByTitle(row.title);
    await overviewPage.clickDeleteInRow(row.title);
    await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
    await overviewPage.expectSuccess("has been deleted");
  });
});