import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn().mockImplementation(() => new Promise(() => {})),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { api } from '../lib/api';
const mockApi = vi.mocked(api);

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.get.mockImplementation(() => new Promise(() => {}));
    mockApi.put.mockResolvedValue({ ok: true });
  });

  it('renders page title', async () => {
    const Settings = (await import('./Settings')).default;
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(screen.getByText(/Global Settings/)).toBeDefined();
  });

  it('renders loading state', async () => {
    const Settings = (await import('./Settings')).default;
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(screen.getByText(/Loading settings/)).toBeDefined();
  });

  it('omits unmodified and masked secret placeholders on save and sends only explicitly updated secrets', async () => {
    mockApi.get.mockResolvedValueOnce([
      { key: 'companyName', value: 'VaultScope GmbH', updated_at: '2026-01-01T00:00:00Z' },
      { key: 'smtpPass', value: '••••••••', updated_at: '2026-01-01T00:00:00Z' },
      { key: 'oidcClientSecret_configured', value: true, updated_at: '2026-01-01T00:00:00Z' },
      { key: 'stripe_live_secret_key', value: { configured: true }, updated_at: '2026-01-01T00:00:00Z' },
      { key: 'stripe_webhook_secret', value: '', updated_at: '2026-01-01T00:00:00Z' },
      { key: 'stripe_sandbox_secret_key', value: '***', updated_at: '2026-01-01T00:00:00Z' },
    ]);

    const Settings = (await import('./Settings')).default;
    render(<MemoryRouter><Settings /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByDisplayValue('VaultScope GmbH')).toBeDefined();
    });

    const smtpInput = screen.getByPlaceholderText('Configured — enter new password to replace') as HTMLInputElement;
    const oidcInput = screen.getByPlaceholderText('Configured — enter new secret to replace') as HTMLInputElement;
    expect(smtpInput.value).toBe('');
    expect(oidcInput.value).toBe('');

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledTimes(1);
    });

    const firstEntries = mockApi.put.mock.calls[0][1] as Array<{ key: string; value: unknown }>;
    const firstKeys = firstEntries.map(e => e.key);
    expect(firstKeys).not.toContain('smtpPass');
    expect(firstKeys).not.toContain('oidcClientSecret');
    expect(firstKeys).not.toContain('stripe_live_secret_key');
    expect(firstKeys).not.toContain('stripe_webhook_secret');
    expect(firstKeys).not.toContain('stripe_sandbox_secret_key');
    expect(firstKeys).not.toContain('oidcClientSecret_configured');

    // Entering a new SMTP password explicitly should send only that newly entered secret
    fireEvent.change(smtpInput, { target: { value: 'new-smtp-secret-2026' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes|Saved/i }));
    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledTimes(2);
    });
    const secondEntries = mockApi.put.mock.calls[1][1] as Array<{ key: string; value: unknown }>;
    expect(secondEntries).toContainEqual({ key: 'smtpPass', value: 'new-smtp-secret-2026' });
    expect(secondEntries.map(e => e.key)).not.toContain('oidcClientSecret');
  });
});
