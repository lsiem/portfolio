import { test, expect } from '@playwright/test';

test('homepage navigation and contact section render', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Hi, Ich bin Lasse' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Hauptnavigation' }).getByRole('button', { name: 'Projekte', exact: true }).click();
  await expect(page.locator('#projects')).toBeInViewport();

  await page.getByRole('button', { name: 'Kontakt', exact: true }).first().click();
  await expect(page.locator('#contact')).toBeInViewport();
  await expect(page.getByLabel('Name')).toBeVisible();
});
