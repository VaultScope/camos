import { test, expect } from '@playwright/test';

/**
 * Test 7: RBAC - Technical Role
 * Verifies Technical role can access services, connectors (read), jobs
 * Cannot access customers billing, staff
 */

async function loginAsTechnical(page) {
  await page.goto('/');

  const loginButton = page.locator('button:has-text("Login with Authentik")');
  await loginButton.click();

  await page.waitForURL(/localhost:9000/, { timeout: 10000 });

  await page.fill('input[placeholder*="Email or Username"]', 'tech1');
  await page.click('button:has-text("Log in")');

  await page.waitForTimeout(2000);

  const passwordField = page.locator('input[type="password"]');
  if (await passwordField.isVisible().catch(() => false)) {
    await passwordField.fill('Tech123!');
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

test.describe('RBAC - Technical Role', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('tech1 can login successfully', async ({ page }) => {
    await loginAsTechnical(page);
    await expect(page).toHaveURL(/localhost:3001/);
  });

  test('technical can access services page', async ({ page }) => {
    await loginAsTechnical(page);
    await page.goto('/services');

    // Should load successfully
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);
    expect(isForbidden).toBe(false);
  });

  test('technical can access connectors page', async ({ page }) => {
    await loginAsTechnical(page);
    await page.goto('/connectors');

    // Should load successfully (manage access)
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);
    expect(isForbidden).toBe(false);
  });

  test('technical can access jobs/provisioning queue', async ({ page }) => {
    await loginAsTechnical(page);
    await page.goto('/jobs');

    // Should load successfully
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);
    expect(isForbidden).toBe(false);
  });

  test('technical CANNOT access customers', async ({ page }) => {
    await loginAsTechnical(page);
    await page.goto('/customers');

    // Should not be able to see customers content
    const hasCustomers = await page.locator('text=Customer Management').or(page.locator('text=Accounts')).isVisible().catch(() => false);
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);

    // Either shows forbidden or doesn't show customers content
    expect(!hasCustomers || isForbidden).toBe(true);
  });

  test('technical CANNOT access invoices', async ({ page }) => {
    await loginAsTechnical(page);
    await page.goto('/billing/invoices');

    // Should not be able to see invoices content
    const hasInvoices = await page.locator('text=Invoices').or(page.locator('text=Billing')).isVisible().catch(() => false);
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);

    // Either shows forbidden or doesn't show invoices content
    expect(!hasInvoices || isForbidden).toBe(true);
  });

  test('technical CANNOT access staff page', async ({ page }) => {
    await loginAsTechnical(page);
    await page.goto('/staff/members');

    // Should not be able to see staff content
    const hasStaff = await page.locator('text=Staff Members').or(page.locator('text=Members')).isVisible().catch(() => false);
    const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);

    // Either shows forbidden or doesn't show staff content
    expect(!hasStaff || isForbidden).toBe(true);
  });
});
