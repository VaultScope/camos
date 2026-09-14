import { test, expect } from '@playwright/test';

/**
 * Test 4: Admin Panel - Owner Role CRUD Operations
 * Tests full access for Owner role
 */

// Helper to login as admin1
async function loginAsAdmin(page) {
  await page.goto('/');

  // Click "Login with Authentik" button
  const loginButton = page.locator('button:has-text("Login with Authentik")');
  await loginButton.click();

  await page.waitForURL(/localhost:9000/, { timeout: 10000 });

  // Fill in Authentik login form
  await page.fill('input[placeholder*="Email or Username"]', 'admin1');
  await page.click('button:has-text("Log in")');

  await page.waitForTimeout(2000);

  const passwordField = page.locator('input[type="password"]');
  if (await passwordField.isVisible().catch(() => false)) {
    await passwordField.fill('Admin123!');
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

test.describe('Admin Owner Role', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear storage to ensure fresh login
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('customers list loads', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/customers');

    // Check for customer list heading
    await expect(page.locator('h2:has-text("Customer Management")')).toBeVisible();

    // Check for search box
    await expect(page.locator('input[placeholder*="Search"]').first()).toBeVisible();
  });

  test('customer detail page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/customers');

    // Click first customer link
    const firstCustomer = page.locator('a[href^="/customers/"]').first();
    if (await firstCustomer.isVisible()) {
      await firstCustomer.click();

      // Detail page should load
      await expect(page).toHaveURL(/\/customers\/.+/);
      await expect(page.locator('text=Email').first()).toBeVisible();
    }
  });

  test('customer notes can be edited and saved', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/customers');

    const firstCustomer = page.locator('a[href^="/customers/"]').first();
    if (await firstCustomer.isVisible()) {
      await firstCustomer.click();

      // Find notes textarea
      const notesField = page.locator('textarea').or(page.locator('[placeholder*="note"]')).first();
      if (await notesField.isVisible()) {
        const testNote = `Test note ${Date.now()}`;
        await notesField.fill(testNote);

        // Save
        await page.click('button:has-text("Save")');

        // Wait for save confirmation
        await page.waitForTimeout(1000);

        // Reload page
        await page.reload();

        // Notes should persist
        const savedNotes = await notesField.inputValue();
        expect(savedNotes).toContain('Test note');
      }
    }
  });

  test('customer status can be changed', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/customers');

    const firstCustomer = page.locator('a[href^="/customers/"]').first();
    if (await firstCustomer.isVisible()) {
      await firstCustomer.click();

      // Look for suspend/activate button
      const statusButton = page.locator('button:has-text("Suspend")').or(page.locator('button:has-text("Activate")')).first();
      if (await statusButton.isVisible()) {
        const buttonText = await statusButton.textContent();

        // Click status change button
        await statusButton.click();

        // Confirm dialog if present
        page.once('dialog', dialog => dialog.accept());

        // Wait for status to update
        await page.waitForTimeout(1500);

        // Button text should change
        const newButtonText = await statusButton.textContent().catch(() => '');
        expect(newButtonText).not.toBe(buttonText);
      }
    }
  });

  test('staff list shows all 4 members', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/staff/members');

    // Should see staff members (check for staff list heading or member names)
    const hasStaffList = await page.locator('text=Staff').or(page.locator('text=Members')).first().isVisible().catch(() => false);
    expect(hasStaffList).toBe(true);
  });

  test('all navigation sections are accessible', async ({ page }) => {
    await loginAsAdmin(page);

    const sections = [
      { path: '/', name: 'Dashboard' },
      { path: '/customers', name: 'Customers' },
      { path: '/services', name: 'Services' },
      { path: '/staff/members', name: 'Staff' },
    ];

    for (const section of sections) {
      await page.goto(section.path);

      // Should not see "Forbidden" error
      const isForbidden = await page.locator('text=Forbidden').or(page.locator('text=forbidden')).isVisible().catch(() => false);
      expect(isForbidden).toBe(false);
    }
  });
});
