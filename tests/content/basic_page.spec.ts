import { loadCsv } from "../../fixtures/loadFixture";
import { test, expect } from "@playwright/test";
import { NodePage } from "../../pages/NodePage";

import { CKEditor } from "../../lib/CKEditor";

const rows = loadCsv("content/pages.fixtures.csv");

test.describe('test Basic Pages CRUD as a content editor', () => {
    test.beforeEach(async ({page}) => {
        const nodePage = new NodePage(page);
        await nodePage.login(process.env.EDITOR_USER!, process.env.EDITOR_PASS!);
    })

    test('as a content editor, I can create a basic page', async ({ page }) => {
        const nodePage = new NodePage(page);
        await nodePage.gotoAddContent('page');

        const mainForm = page.locator(".node-form .layout-region--main");
        await mainForm.getByLabel("Title").fill(rows[0].title);
        const body = new CKEditor(mainForm.locator('.field--name-body'));
        await body.setText(rows[0].body);
        if (rows[0].published === "true") {
            await page.getByLabel("Published").check();
        }

        await nodePage.saveButton.click();
        await nodePage.expectSuccess();

        await expect(page.locator('body')).toHaveText(rows[0].title);
        await expect(page.locator('body')).toHaveText(rows[0].body);
    })

    test('as a content editor, I can edit a basic page', async ({page}) => {
        const nodePage = new NodePage(page);
        await nodePage.gotoContentList();
        await nodePage.clickEditInList(rows[0].title);

        await expect(page.locator('.page-title')).toContainText(rows[0].title);
    })
})