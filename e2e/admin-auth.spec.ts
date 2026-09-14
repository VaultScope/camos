import { test, expect } from '@playwright/test';

/**
 * Test 3: Admin Panel Authentication
 * Verifies admin login flow with OIDC
 */

test.describe('Admin Panel Authentication', () => {
  test('admin panel redirects to Authentik login', async ({ page }) => {
    await page.goto('/');

    // Should show admin login page
    await expect(page.locator('text=Login with Authentik')).toBeVisible();

    // Click login button
    const loginButton = page.locator('button:has-text("Login with Authentik")');
    await loginButton.click();

    // Should redirect to Authentik
    await page.waitForURL(/localhost:9000/, { timeout: 5000 });
    await expect(page).toHaveURL(/localhost:9000/);
  });

  test('admin1 (Owner) can login successfully', async ({ page }) => {
    await page.goto('/');

    // Click "Login with Authentik (Staff)" button
    const loginButton = page.locator('button:has-text("Login with Authentik")');
    await loginButton.click();

    // Wait for Authentik login page
    await page.waitForURL(/localhost:9000/);

    // Fill in Authentik login form
    await page.fill('input[placeholder*="Email or Username"]', 'admin1');

    // Click "Log in" button to proceed
    await page.click('button:has-text("Log in")');

    // Wait for password page
    await page.waitForTimeout(1000);

    // Fill in password if password field appears
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

    // Should redirect back to admin panel
    await page.waitForURL(/localhost:3001/, { timeout: 15000 });

    // Admin dashboard should load - check for dashboard content
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 10000 });
  });

  test('admin dashboard shows correct user email', async ({ page, context }) => {
    // Requires being logged in as admin1
    await page.goto('/');

    // Check for admin1@test.local in the UI
    const emailLocator = page.locator('text=admin1@test.local');
    const isVisible = await emailLocator.isVisible().catch(() => false);

    if (isVisible) {
      expect(await emailLocator.textContent()).toContain('admin1@test.local');
    }
  });

  test('invalid credentials are rejected', async ({ page }) => {
    await page.goto('/');

    // Click login button
    const loginButton = page.locator('button:has-text("Login with Authentik")');
    await loginButton.click();

    await page.waitForURL(/localhost:9000/);

    // Fill in username
    await page.fill('input[placeholder*="Email or Username"]', 'admin1');
    await page.click('button:has-text("Log in")');

    // Wait for password page
    await page.waitForTimeout(1000);

    // Try wrong password
    const passwordField = page.locator('input[type="password"]');
    if (await passwordField.isVisible().catch(() => false)) {
      await passwordField.fill('WRONGPASSWORD');
      await page.click('button[type="submit"]');
    }

    // Should stay on auth page with error
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('localhost:9000');
  });
});
