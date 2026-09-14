import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('Reports', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() });
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
});
