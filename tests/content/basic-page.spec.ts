import { loadCsv } from "../../fixtures/loadFixture";
import { test, expect } from "@playwright/test";
import { ContentOverviewPage } from "../../pages/content-overview.page";
import { NodeFormPage } from "../../pages/node-form.page";

const rows = loadCsv("content/pages.fixtures.csv");

test.describe("Basic Pages CRUD as a content editor", () => {
  test.beforeEach(async ({ page }) => {
    const nodePage = new NodeFormPage(page);
    await nodePage.login(process.env.EDITOR_USER!, process.env.EDITOR_PASS!);
  });

  test("as a content editor, I can create a basic page", async ({ page }) => {
    const nodePage = new NodeFormPage(page);
    const row = rows[0];

    await nodePage.gotoAddContent("page");

    await nodePage.field("title", "text").fill(row.title);
    await nodePage.field("body", "ckeditor").fill(row.body);
    await nodePage.field("status", "checkbox").fill(row.published === "true");
    
    await nodePage.saveAndExpect();

    const bodyText = row.body.replace(/<[^>]+>/g, "");
    await expect(page.locator("body")).toContainText(row.title);
    await expect(page.locator("body")).toContainText(bodyText);
    await expect(page.locator("strong", { hasText: "bold text" })).toBeVisible();
  });

  test("as a content editor, I can edit a basic page", async ({ page }) => {
    const overviewPage = new ContentOverviewPage(page);
    const row = rows[0];

    await overviewPage.goto();
    await overviewPage.filterByTitle(row.title);
    await overviewPage.clickEditInRow(row.title);

    const nodePage = new NodeFormPage(page);
    await expect(page.locator(".page-title")).toContainText(row.title);
    await expect(await nodePage.field("title", "text").getValue()).toBe(row.title);
  });
});