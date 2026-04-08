import { loadCsv } from "../../fixtures/loadFixture";
import { test, expect } from "@playwright/test";
import { NodePage } from "../../pages/NodePage";


test.describe('test Basic Pages CRUD', () => {
    test('create a basic page', async ({ page }) => {
        const admin = new NodePage(page);
        await admin.login(process.env.ADMIN_USER!, process.env.ADMIN_PASS!);
        await admin.gotoAddContent('page');

        const rows = loadCsv("content/pages.fixtures.csv");
        
    })
})