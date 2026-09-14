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

describe('TaxRatesNew', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    const TaxRates = (await import('./TaxRatesNew')).default;
    render(<MemoryRouter><TaxRates /></MemoryRouter>);
    expect(screen.getByText(/Tax Rates/)).toBeDefined();
  });

  it('renders add button', async () => {
    const TaxRates = (await import('./TaxRatesNew')).default;
    render(<MemoryRouter><TaxRates /></MemoryRouter>);
    expect(screen.getByText(/Add Tax Rate/)).toBeDefined();
  });

  it('shows empty state', async () => {
    mockUseApi.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    const TaxRates = (await import('./TaxRatesNew')).default;
    render(<MemoryRouter><TaxRates /></MemoryRouter>);
    expect(screen.getByText(/No tax rates configured/)).toBeDefined();
  });
});
