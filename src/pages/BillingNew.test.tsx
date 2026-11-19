import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockInvoice } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('BillingNew (Invoices)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('renders page title', async () => {
    const BillingInvoices = (await import('./BillingNew')).default;
    render(<MemoryRouter><BillingInvoices /></MemoryRouter>);
    expect(screen.getByText(/Invoices/)).toBeDefined();
  });

  it('renders search input', async () => {
    const BillingInvoices = (await import('./BillingNew')).default;
    render(<MemoryRouter><BillingInvoices /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Search invoices/)).toBeDefined();
  });

  it('renders invoices after load', async () => {
    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/invoices') return { data: [mockInvoice], loading: false, error: null, refetch: vi.fn() };
      return { data: [], loading: false, error: null, refetch: vi.fn() };
    });
    const BillingInvoices = (await import('./BillingNew')).default;
    render(<MemoryRouter><BillingInvoices /></MemoryRouter>);
    expect(screen.getByText('INV-001')).toBeDefined();
  });

  it('renders create invoice button', async () => {
    const BillingInvoices = (await import('./BillingNew')).default;
    render(<MemoryRouter><BillingInvoices /></MemoryRouter>);
    expect(screen.getByText(/Create Invoice/)).toBeDefined();
  });

  it('uses only vs_admin_token and never falls back to customer vs_token for PDF download', async () => {
    localStorage.setItem('vs_token', 'customer-storefront-token');
    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/invoices') return { data: [mockInvoice], loading: false, error: null, refetch: vi.fn() };
      return { data: [], loading: false, error: null, refetch: vi.fn() };
    });
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:pdf');
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['%PDF'], { type: 'application/pdf' })),
    });
    global.fetch = fetchSpy;

    const BillingInvoices = (await import('./BillingNew')).default;
    render(<MemoryRouter><BillingInvoices /></MemoryRouter>);

    fireEvent.click(screen.getByTitle('Download PDF'));
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
    const headers = fetchSpy.mock.calls[0][1].headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
  });
});
