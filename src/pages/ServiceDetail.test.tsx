import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { mockService } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));
const mockHasPermission = vi.fn(() => true);
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: (perm: string) => mockHasPermission(perm),
}));

import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
const mockUseApi = vi.mocked(useApi);
const mockApi = vi.mocked(api);

describe('ServiceDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApi.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state', async () => {
    const ServiceDetail = (await import('./ServiceDetail')).default;
    render(
      <MemoryRouter initialEntries={['/services/svc-1']}>
        <Routes>
          <Route path="/services/:id" element={<ServiceDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading service/)).toBeDefined();
  });

  it('renders service details after load', async () => {
    mockUseApi.mockReturnValue({ data: mockService, loading: false, error: null, refetch: vi.fn() });
    const ServiceDetail = (await import('./ServiceDetail')).default;
    render(
      <MemoryRouter initialEntries={['/services/svc-1']}>
        <Routes>
          <Route path="/services/:id" element={<ServiceDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Test VPS')).toBeDefined();
    expect(screen.getByText('running')).toBeDefined();
  });

  it('renders error state', async () => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: 'Not found', refetch: vi.fn() });
    const ServiceDetail = (await import('./ServiceDetail')).default;
    render(
      <MemoryRouter initialEntries={['/services/svc-1']}>
        <Routes>
          <Route path="/services/:id" element={<ServiceDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Failed to load service/)).toBeDefined();
  });

  it('validates IPMI web_url, opens with noopener,noreferrer, and clears IPMI credentials on close', async () => {
    mockUseApi.mockReturnValue({ data: mockService, loading: false, error: null, refetch: vi.fn() });
    mockApi.post
      .mockResolvedValueOnce({
        ipmi_host: '10.0.0.5',
        ipmi_port: 443,
        ipmi_username: 'admin',
        ipmi_password: 'secret-ipmi-password',
        web_url: 'https://ipmi.example.com/console',
      })
      .mockImplementationOnce(() => new Promise(() => {}));

    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const ServiceDetail = (await import('./ServiceDetail')).default;
    render(
      <MemoryRouter initialEntries={['/services/svc-1']}>
        <Routes>
          <Route path="/services/:id" element={<ServiceDetail />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Out-of-Band IPMI / KVM'));
    await waitFor(() => {
      expect(screen.getByText('10.0.0.5')).toBeDefined();
    });

    fireEvent.click(screen.getByRole('button', { name: /Open Web IPMI/i }));
    expect(openSpy).toHaveBeenCalledWith('https://ipmi.example.com/console', '_blank', 'noopener,noreferrer');

    // Close modal -> clears ipmiData & showPassword
    fireEvent.click(screen.getByRole('button', { name: /^Close$/i }));
    expect(screen.queryByText('10.0.0.5')).toBeNull();

    // Reopen while loading -> old password/host must not be rendered
    fireEvent.click(screen.getByText('Out-of-Band IPMI / KVM'));
    expect(screen.queryByText('secret-ipmi-password')).toBeNull();
    expect(screen.queryByText('10.0.0.5')).toBeNull();
  });

  it('allows admins with services.manage permission to update order state and shows read-only without permission', async () => {
    const refetch = vi.fn();
    mockHasPermission.mockReturnValue(true);
    mockUseApi.mockReturnValue({
      data: { ...mockService, order_state: 'payment_received', order_state_note: 'Queued' },
      loading: false,
      error: null,
      refetch,
    });
    mockApi.patch.mockResolvedValueOnce({ ...mockService, order_state: 'hardware_setup' });

    const ServiceDetail = (await import('./ServiceDetail')).default;
    const { rerender } = render(
      <MemoryRouter initialEntries={['/services/svc-1']}>
        <Routes>
          <Route path="/services/:id" element={<ServiceDetail />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Order State'), { target: { value: 'hardware_setup' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Order State/i }));

    await waitFor(() => {
      expect(mockApi.patch).toHaveBeenCalledWith(
        '/admin/services/svc-1/order-state',
        expect.objectContaining({ order_state: 'hardware_setup' })
      );
    });

    mockHasPermission.mockImplementation((perm: string) => perm === 'services.view');
    rerender(
      <MemoryRouter initialEntries={['/services/svc-1']}>
        <Routes>
          <Route path="/services/:id" element={<ServiceDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Requires services\.manage permission to modify/i)).toBeDefined();
    expect(screen.queryByRole('button', { name: /Update Order State/i })).toBeNull();
  });
});
