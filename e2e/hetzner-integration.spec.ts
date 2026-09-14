import { test, expect } from '@playwright/test';

/**
 * Hetzner Cloud Connector Integration Test
 * Tests real Hetzner API integration with live API token
 */

// Helper to login as admin1
async function loginAsAdmin(page) {
  await page.goto('/');

  const loginButton = page.locator('button:has-text("Login with Authentik")');
  await loginButton.click();

  await page.waitForURL(/localhost:9000/, { timeout: 10000 });

  await page.fill('input[placeholder*="Email or Username"]', 'admin1');
  await page.click('button:has-text("Log in")');

  await page.waitForTimeout(2000);

  const passwordField = page.locator('input[type="password"]');
  if (await passwordField.isVisible().catch(() => false)) {
    await passwordField.fill('Admin123!');
    await page.click('button[type="submit"]');
  }

  await page.waitForTimeout(2000);
  const consentButton = page.locator('button:has-text("Continue")').or(page.locator('button[type="submit"]'));
  if (await consentButton.isVisible().catch(() => false)) {
    await consentButton.click();
  }

  await page.waitForURL(/localhost:3001/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

test.describe('Hetzner Cloud Integration', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('Hetzner connector test connection succeeds', async ({ page, request }) => {
    await loginAsAdmin(page);

    // Get the auth token from localStorage
    const token = await page.evaluate(() => localStorage.getItem('vs_admin_token'));
    expect(token).toBeTruthy();

    // Test the connector connection via API
    const response = await request.post(
      'http://localhost:8000/api/admin/connectors/00000000-0000-0000-0000-000000000001/test',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Test Connection Response Status:', response.status());
    const body = await response.json();
    console.log('Test Connection Response Body:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.message).toContain('Hetzner');
  });

  test('Hetzner catalog fetches server types successfully', async ({ page, request }) => {
    await loginAsAdmin(page);

    // Get the auth token
    const token = await page.evaluate(() => localStorage.getItem('vs_admin_token'));
    expect(token).toBeTruthy();

    // Fetch the service catalog
    const response = await request.get(
      'http://localhost:8000/api/admin/connectors/00000000-0000-0000-0000-000000000001/catalog',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('Catalog Response Status:', response.status());
    const catalog = await response.json();
    console.log('Catalog Server Types Count:', Array.isArray(catalog) ? catalog.length : 'Not an array');

    if (Array.isArray(catalog) && catalog.length > 0) {
      console.log('First Server Type:', JSON.stringify(catalog[0], null, 2));
    }

    expect(response.status()).toBe(200);
    expect(Array.isArray(catalog)).toBe(true);
    expect(catalog.length).toBeGreaterThan(0);

    // Verify server types have expected structure
    const firstType = catalog[0];
    expect(firstType).toHaveProperty('id');
    expect(firstType).toHaveProperty('name');
    expect(firstType).toHaveProperty('cores');
    expect(firstType).toHaveProperty('ram');
  });

  test('Hetzner connector SSRF protection blocks private IPs', async ({ page, request }) => {
    await loginAsAdmin(page);

    // Get the auth token
    const token = await page.evaluate(() => localStorage.getItem('vs_admin_token'));
    expect(token).toBeTruthy();

    // Try to create a Pterodactyl connector with a private IP (should be blocked by SEC-004)
    const response = await request.post(
      'http://localhost:8000/api/admin/connectors',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: 'Test SSRF Protection',
          provider: 'pterodactyl',
          config: {
            url: 'http://192.168.1.1',
            api_key: 'test',
          },
        },
      }
    );

    console.log('SSRF Protection Test Status:', response.status());

    // Should succeed creating the connector (config is encrypted)
    // But when testing the connection, it should block private IP
    if (response.status() === 200 || response.status() === 201) {
      const body = await response.json();
      const connectorId = body.id;

      // Now try to test this connector - should be blocked
      const testResponse = await request.post(
        `http://localhost:8000/api/admin/connectors/${connectorId}/test`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('SSRF Protection Test Connection Status:', testResponse.status());
      const testBody = await testResponse.text();
      console.log('SSRF Protection Response:', testBody);

      // Should return 400 Bad Request with error about private IP
      expect(testResponse.status()).toBe(400);
      expect(testBody).toContain('private');

      // Cleanup: delete the test connector
      await request.delete(`http://localhost:8000/api/admin/connectors/${connectorId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
    }
  });
});
