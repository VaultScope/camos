import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
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
});
