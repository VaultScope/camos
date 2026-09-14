import { test, expect } from '@playwright/test';

/**
 * Test 5: RBAC - Support Role
 * Verifies Support role can access customers, tickets, services (read-only)
 * Cannot access invoices, staff, connectors, settings
 */

async function loginAsSupport(page) {
  await page.goto('/');

  const loginButton = page.locator('button:has-text("Login with Authentik")');
  await loginButton.click();

  await page.waitForURL(/localhost:9000/, { timeout: 10000 });

  await page.fill('input[placeholder*="Email or Username"]', 'support1');
  await page.click('button:has-text("Log in")');

  await page.waitForTimeout(2000);

  const passwordField = page.locator('input[type="password"]');
  if (await passwordField.isVisible().catch(() => false)) {
    await passwordField.fill('Support123!');
    await page.click('button[type="submit"]');
  }

  // Handle consent screen if it appears (first-time login)
  await page.waitForTimeout(2000);
  const consentButton = page.locator('button:has-text("Continue")').or(page.locator('button[type="submit"]'));
  if (await consentButton.isVisible().catch(() => false)) {
    await consentButton.click();
  }

  await page.waitForURL(/localhost:3001/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

test.describe('RBAC - Support Role', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('support1 can login successfully', async ({ page }) => {
    await loginAsSupport(page);
    await expect(page).toHaveURL(/localhost:3001/);
  });

  test('support can access customers page', async ({ page }) => {
    await loginAsSupport(page);
    await page.goto('/customers');

    // Should load successfully
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);
    expect(isForbidden).toBe(false);

    // Should see customer list heading
    await expect(page.locator('h2:has-text("Customer Management")')).toBeVisible();
  });

  test('support can access tickets page', async ({ page }) => {
    await loginAsSupport(page);
    await page.goto('/tickets');

    // Should load successfully
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);
    expect(isForbidden).toBe(false);
  });

  test('support can access services page', async ({ page }) => {
    await loginAsSupport(page);
    await page.goto('/services');

    // Should load successfully (read-only)
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);
    expect(isForbidden).toBe(false);
  });

  test('support CANNOT access staff page', async ({ page }) => {
    await loginAsSupport(page);
    await page.goto('/staff/members');

    // Should see Forbidden error
    await expect(page.locator('text=Forbidden').or(page.locator('text=forbidden'))).toBeVisible();
  });

  test('support CANNOT access invoices', async ({ page }) => {
    await loginAsSupport(page);
    await page.goto('/billing/invoices');

    // Should see Forbidden error
    await expect(page.locator('text=Forbidden').or(page.locator('text=forbidden'))).toBeVisible();
  });

  test('support CANNOT access connectors', async ({ page }) => {
    await loginAsSupport(page);
    await page.goto('/connectors');

    // Should see Forbidden error
    await expect(page.locator('text=Forbidden').or(page.locator('text=forbidden'))).toBeVisible();
  });

  test('support CANNOT access settings', async ({ page }) => {
    await loginAsSupport(page);
    await page.goto('/settings');

    // Should see Forbidden error or not load settings content
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);
    const hasSettings = await page.locator('text=Settings').or(page.locator('text=Configuration')).isVisible().catch(() => false);

    // Either shows forbidden or doesn't show settings content
    expect(isForbidden || !hasSettings).toBe(true);
  });
});
