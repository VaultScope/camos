import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('Reports', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    mockUseApi.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('renders page title', async () => {
    const Reports = (await import('./Reports')).default;
    render(<MemoryRouter><Reports /></MemoryRouter>);
    expect(screen.getByText(/Reports & Exports/)).toBeDefined();
  });

  it('renders stats after load', async () => {
    mockUseApi.mockReturnValue({
      data: { active_services: 10, total_customers: 50, open_tickets: 3, pending_jobs: 1, mrr: 1500 },
      loading: false, error: null, refetch: vi.fn(),
    });
    const Reports = (await import('./Reports')).default;
    render(<MemoryRouter><Reports /></MemoryRouter>);
    expect(screen.getByText('10')).toBeDefined();
    expect(screen.getByText('50')).toBeDefined();
  });

  it('renders export buttons', async () => {
    const Reports = (await import('./Reports')).default;
    render(<MemoryRouter><Reports /></MemoryRouter>);
    expect(screen.getAllByText(/Invoices/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Customers/).length).toBeGreaterThan(0);
  });

  it('downloads CSV exports via authenticated fetch instead of unauthenticated window.open', async () => {
    localStorage.setItem('vs_admin_token', 'admin-export-jwt');
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const createObjectUrlSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:csv');
    const revokeObjectUrlSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['id,total\n1,10.00'], { type: 'text/csv' })),
    });
    global.fetch = fetchSpy;

    const Reports = (await import('./Reports')).default;
    render(<MemoryRouter><Reports /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: /Invoices/i }));
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/admin/dashboard/export/invoices'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer admin-export-jwt' },
          credentials: 'include',
        })
      );
    });
    expect(openSpy).not.toHaveBeenCalled();
    expect(createObjectUrlSpy).toHaveBeenCalled();
    expect(revokeObjectUrlSpy).toHaveBeenCalled();
  });
});
