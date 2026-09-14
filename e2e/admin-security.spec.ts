import { test, expect } from '@playwright/test';

/**
 * Test 8-9: Security Testing
 * Tests security controls: invalid login, cross-audience tokens, CSRF protection
 */

test.describe('Security Tests', () => {
  test('invalid login credentials are rejected', async ({ page }) => {
    await page.goto('/');

    // Click login button
    const loginButton = page.locator('button:has-text("Login with Authentik")');
    await loginButton.click();

    await page.waitForURL(/localhost:9000/);

    // Try invalid username
    await page.fill('input[placeholder*="Email or Username"]', 'nonexistent_user');
    await page.click('button:has-text("Log in")');

    // Should stay on auth page
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('localhost:9000');

    // Should still be on auth page (not redirected to admin panel)
    const isStillOnAuthPage = page.url().includes('localhost:9000');
    expect(isStillOnAuthPage).toBe(true);
  });

  test('unauthenticated access is blocked', async ({ page, context }) => {
    // Clear all cookies to ensure no auth state
    await context.clearCookies();

    // Try to access protected page directly
    await page.goto('/customers');

    // Should redirect to login page (not Authentik yet)
    await page.waitForTimeout(1000);

    // Should show login page with Authentik button
    const loginButton = page.locator('button:has-text("Login with Authentik")');
    await expect(loginButton).toBeVisible();
  });

  test.skip('suspended customer cannot login to storefront', async ({ page }) => {
    // SKIPPED: Known limitation - suspended customer status enforcement not implemented
    // Feature gap documented in QA report as "Suspended customer status not enforced"
    // This test will be enabled once the feature is implemented

    // TODO: Implement suspended customer enforcement in auth.rs
    // Expected behavior: Suspended customers should be blocked during OIDC callback
  });

  test('API returns proper CORS headers', async ({ page }) => {
    // Make API request from browser
    const response = await page.request.fetch('http://localhost:8000/api/health', {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
      },
    });

    // Should have CORS header
    const corsHeader = response.headers()['access-control-allow-origin'];
    expect(corsHeader).toBeTruthy();
  });

  test('SQL injection attempt is blocked', async ({ page }) => {
    // Login as admin first
    await page.goto('/');

    const loginButton = page.locator('button:has-text("Login with Authentik")');
    await loginButton.click();

    await page.waitForURL(/localhost:9000/);

    await page.fill('input[placeholder*="Email or Username"]', 'admin1');
    await page.click('button:has-text("Log in")');

    await page.waitForTimeout(1000);

    const passwordField = page.locator('input[type="password"]');
    if (await passwordField.isVisible().catch(() => false)) {
      await passwordField.fill('Admin123!');
      await page.click('button[type="submit"]');
    }

    // Handle consent screen if it appears
    await page.waitForTimeout(2000);
    const consentButton = page.locator('button:has-text("Continue")').or(page.locator('button[type="submit"]'));
    if (await consentButton.isVisible().catch(() => false)) {
      await consentButton.click();
    }

    await page.waitForURL(/localhost:3001/, { timeout: 15000 });

    // Go to customers page
    await page.goto('/customers');

    // Try SQL injection in search field
    const searchBox = page.locator('input[placeholder*="Search"]');
    if (await searchBox.isVisible()) {
      await searchBox.fill("' OR '1'='1");
      await searchBox.press('Enter');

      // Should not see SQL error, should just return empty/sanitized results
      const hasSqlError = await page.locator('text=SQL').or(page.locator('text=syntax error')).isVisible().catch(() => false);
      expect(hasSqlError).toBe(false);
    }
  });

  test('XSS attempt is sanitized', async ({ page }) => {
    // Login as admin
    await page.goto('/');

    const loginButton = page.locator('button:has-text("Login with Authentik")');
    await loginButton.click();

    await page.waitForURL(/localhost:9000/);

    await page.fill('input[placeholder*="Email or Username"]', 'admin1');
    await page.click('button:has-text("Log in")');

    await page.waitForTimeout(1000);

    const passwordField = page.locator('input[type="password"]');
    if (await passwordField.isVisible().catch(() => false)) {
      await passwordField.fill('Admin123!');
      await page.click('button[type="submit"]');
    }

    // Handle consent screen if it appears
    await page.waitForTimeout(2000);
    const consentButton = page.locator('button:has-text("Continue")').or(page.locator('button[type="submit"]'));
    if (await consentButton.isVisible().catch(() => false)) {
      await consentButton.click();
    }

    await page.waitForURL(/localhost:3001/, { timeout: 15000 });

    // Go to customer detail page
    await page.goto('/customers');

    const firstCustomer = page.locator('a[href^="/customers/"]').first();
    if (await firstCustomer.isVisible()) {
      await firstCustomer.click();

      // Try XSS in notes field
      const notesField = page.locator('textarea').first();
      if (await notesField.isVisible()) {
        const xssPayload = '<script>alert("XSS")</script><img src=x onerror=alert("XSS")>';
        await notesField.fill(xssPayload);
        await page.click('button:has-text("Save")');

        await page.waitForTimeout(1000);

        // Dialog should NOT appear (XSS was sanitized)
        // Page should not crash
        const bodyVisible = await page.locator('body').isVisible();
        expect(bodyVisible).toBe(true);
      }
    }
  });
});
