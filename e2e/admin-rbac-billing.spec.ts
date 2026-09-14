import { test, expect } from '@playwright/test';

/**
 * Test 6: RBAC - Billing Role
 * Verifies Billing role can access customers, invoices
 * Cannot access services, staff, connectors
 */

async function loginAsBilling(page) {
  await page.goto('/');

  const loginButton = page.locator('button:has-text("Login with Authentik")');
  await loginButton.click();

  await page.waitForURL(/localhost:9000/, { timeout: 10000 });

  await page.fill('input[placeholder*="Email or Username"]', 'billing1');
  await page.click('button:has-text("Log in")');

  await page.waitForTimeout(2000);

  const passwordField = page.locator('input[type="password"]');
  if (await passwordField.isVisible().catch(() => false)) {
    await passwordField.fill('Billing123!');
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

test.describe('RBAC - Billing Role', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('billing1 can login successfully', async ({ page }) => {
    await loginAsBilling(page);
    await expect(page).toHaveURL(/localhost:3001/);
  });

  test('billing can access customers page', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/customers');

    // Should load successfully
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);
    expect(isForbidden).toBe(false);
  });

  test('billing can access invoices page', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing/invoices');

    // Should load successfully
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);
    expect(isForbidden).toBe(false);
  });

  test('billing CANNOT access services', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/services');

    // Should not be able to see services content
    const hasServicesContent = await page.locator('text=Services').or(page.locator('text=Provision')).isVisible().catch(() => false);
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);

    // Either shows forbidden or doesn't show services content
    expect(!hasServicesContent || isForbidden).toBe(true);
  });

  test('billing CANNOT access staff page', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/staff/members');

    // Should not be able to see staff content
    const hasStaffContent = await page.locator('text=Staff Members').or(page.locator('text=Members')).isVisible().catch(() => false);
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);

    // Either shows forbidden or doesn't show staff content
    expect(!hasStaffContent || isForbidden).toBe(true);
  });

  test('billing CANNOT access connectors', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/connectors');

    // Should not be able to see connectors content
    const hasConnectors = await page.locator('text=Connectors').or(page.locator('text=Hetzner')).isVisible().catch(() => false);
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);

    // Either shows forbidden or doesn't show connectors content
    expect(!hasConnectors || isForbidden).toBe(true);
  });
});
