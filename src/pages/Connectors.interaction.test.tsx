import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn().mockResolvedValue({ ok: true }),
    put: vi.fn().mockResolvedValue({ ok: true }),
    delete: vi.fn().mockResolvedValue({ ok: true }),
  },
}));

import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
const mockUseApi = vi.mocked(useApi);
const mockApi = vi.mocked(api);

const mockConnectors = [
  {
    id: 'con-hetzner',
    name: 'Hetzner Cloud',
    provider: 'hetzner_cloud',
    status: 'connected' as const,
    last_tested_at: '2026-08-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const mockSettings = [
  { key: 'stripe_live_public_key', value: 'pk_live_test123', updated_at: '2026-01-01T00:00:00Z' },
  { key: 'stripe_live_secret_key', value: 'sk_live_test123', updated_at: '2026-01-01T00:00:00Z' },
  { key: 'stripe_sandbox_public_key', value: 'pk_test_abc', updated_at: '2026-01-01T00:00:00Z' },
  { key: 'stripe_sandbox_secret_key', value: 'sk_test_abc', updated_at: '2026-01-01T00:00:00Z' },
  { key: 'stripe_webhook_secret', value: 'whsec_xyz', updated_at: '2026-01-01T00:00:00Z' },
  { key: 'stripe_sandbox_mode', value: 'false', updated_at: '2026-01-01T00:00:00Z' },
];

describe('Connectors — Infrastructure APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/connectors') return { data: mockConnectors, loading: false, error: null, refetch: vi.fn() };
      if (url === '/admin/settings') return { data: mockSettings, loading: false, error: null, refetch: vi.fn() };
      return { data: null, loading: false, error: null, refetch: vi.fn() };
    });
  });

  it('renders Infrastructure APIs page with existing connectors', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/apis']}><Connectors /></MemoryRouter>);
    expect(screen.getByText(/Infrastructure APIs/)).toBeDefined();
  });

  it('shows Hetzner Cloud connector with Connected status', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/apis']}><Connectors /></MemoryRouter>);
    expect(screen.getAllByText('Hetzner Cloud').length).toBeGreaterThan(0);
    expect(screen.getByText('Connected')).toBeDefined();
  });

  it('shows Test Connection button for existing connector', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/apis']}><Connectors /></MemoryRouter>);
    expect(screen.getByText('Test Connection')).toBeDefined();
  });

  it('calls api.post on Test Connection click', async () => {
    const user = userEvent.setup();
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/apis']}><Connectors /></MemoryRouter>);

    const testBtn = screen.getByText('Test Connection');
    await user.click(testBtn);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/admin/connectors/con-hetzner/test');
    });
  });

  it('shows Save button for connector config', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/apis']}><Connectors /></MemoryRouter>);
    expect(screen.getAllByText('Save').length).toBeGreaterThan(0);
  });

  it('calls api.put on Save click for existing connector', async () => {
    const user = userEvent.setup();
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/apis']}><Connectors /></MemoryRouter>);

    const saveButtons = screen.getAllByText('Save');
    await user.click(saveButtons[0]);

    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledWith(
        '/admin/connectors/con-hetzner',
        expect.objectContaining({ config: expect.any(Object) })
      );
    });
  });

  it('renders Add New Connector section with provider dropdown', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/apis']}><Connectors /></MemoryRouter>);
    expect(screen.getByText('Add New Connector')).toBeDefined();
    expect(screen.getByText('Select a provider...')).toBeDefined();
  });

  it('shows connector form when provider is selected from dropdown', async () => {
    const user = userEvent.setup();
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/apis']}><Connectors /></MemoryRouter>);

    const select = screen.getByDisplayValue('Select a provider...');
    await user.selectOptions(select, 'hetzner_robot');

    await waitFor(() => {
      expect(screen.getAllByText(/Hetzner Robot/).length).toBeGreaterThan(0);
    });
    // Check that new connector form fields appeared
    const inputs = document.querySelectorAll('input[placeholder]');
    const hasRobotField = Array.from(inputs).some(
      (inp) => (inp as HTMLInputElement).placeholder.includes('#ws+') || (inp as HTMLInputElement).placeholder.includes('Password')
    );
    expect(hasRobotField).toBe(true);
  });

  it('renders connector API token field for Hetzner Cloud', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/apis']}><Connectors /></MemoryRouter>);
    expect(screen.getByText('API Token')).toBeDefined();
    expect(screen.getByPlaceholderText('hcloud_api_token...')).toBeDefined();
  });

  it('shows provider description text', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/apis']}><Connectors /></MemoryRouter>);
    expect(screen.getByText(/Auto-provision cloud VPS instances via Hetzner Cloud API/)).toBeDefined();
  });
});

describe('Connectors — Stripe Billing Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/settings') return { data: mockSettings, loading: false, error: null, refetch: vi.fn() };
      return { data: null, loading: false, error: null, refetch: vi.fn() };
    });
  });

  it('renders Stripe Configuration page', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/billing']}><Connectors /></MemoryRouter>);
    expect(screen.getByText(/Stripe Configuration/)).toBeDefined();
  });

  it('shows Connected status when keys are configured', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/billing']}><Connectors /></MemoryRouter>);
    expect(screen.getByText('Connected')).toBeDefined();
  });

  it('renders all Stripe key input fields', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/billing']}><Connectors /></MemoryRouter>);
    expect(screen.getByPlaceholderText('pk_live_...')).toBeDefined();
    expect(screen.getByPlaceholderText('sk_live_...')).toBeDefined();
    expect(screen.getByPlaceholderText('pk_test_...')).toBeDefined();
    expect(screen.getByPlaceholderText('sk_test_...')).toBeDefined();
    expect(screen.getByPlaceholderText('whsec_...')).toBeDefined();
  });

  it('renders sandbox mode toggle', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/billing']}><Connectors /></MemoryRouter>);
    expect(screen.getByText(/Enable Test Mode/)).toBeDefined();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDefined();
  });

  it('toggles sandbox mode checkbox', async () => {
    const user = userEvent.setup();
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/billing']}><Connectors /></MemoryRouter>);

    const checkbox = screen.getByRole('checkbox');
    expect((checkbox as HTMLInputElement).checked).toBe(false);

    await user.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it('calls api.put with settings payload on Save', async () => {
    const user = userEvent.setup();
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/billing']}><Connectors /></MemoryRouter>);

    const saveBtn = screen.getByText('Save Settings');
    await user.click(saveBtn);

    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledWith(
        '/admin/settings',
        expect.arrayContaining([
          expect.objectContaining({ key: 'stripe_live_public_key' }),
          expect.objectContaining({ key: 'stripe_live_secret_key' }),
          expect.objectContaining({ key: 'stripe_sandbox_mode' }),
        ])
      );
    });
  });

  it('typing in Live Public Key updates the field value', async () => {
    const user = userEvent.setup();
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/billing']}><Connectors /></MemoryRouter>);

    const liveKeyInput = screen.getByPlaceholderText('pk_live_...') as HTMLInputElement;
    await user.clear(liveKeyInput);
    await user.type(liveKeyInput, 'pk_live_newkey123');

    expect(liveKeyInput.value).toBe('pk_live_newkey123');
  });

  it('shows field labels for all key types', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/billing']}><Connectors /></MemoryRouter>);
    expect(screen.getByText('Live Public Key')).toBeDefined();
    expect(screen.getByText('Live Secret Key')).toBeDefined();
    expect(screen.getByText('Sandbox Public Key')).toBeDefined();
    expect(screen.getByText('Sandbox Secret Key')).toBeDefined();
    expect(screen.getByText('Webhook Secret')).toBeDefined();
  });
});

describe('Connectors — Authentication page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  it('renders Authentik SSO section', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/authentication']}><Connectors /></MemoryRouter>);
    expect(screen.getAllByText(/Authentik/).length).toBeGreaterThan(0);
    expect(screen.getByText(/AUTHENTIK_ISSUER/)).toBeDefined();
  });

  it('renders RBAC section with manage link', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/authentication']}><Connectors /></MemoryRouter>);
    expect(screen.getByText(/Role-Based Access Control/)).toBeDefined();
    const manageLink = screen.getByText('Manage Roles');
    expect(manageLink.closest('a')?.getAttribute('href')).toBe('/staff/rbac');
  });
});
