import { test as setup } from '@playwright/test';

setup('accept Usercentrics shadow-root banner once', async ({ page, context }) => {
  await page.goto('/');

  await page.getByTestId('uc-accept-all-button').click();
  await context.storageState({ path: 'storageState.json' });
});