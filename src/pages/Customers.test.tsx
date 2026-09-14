import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockCustomer } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('Customers', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    const Customers = (await import('./Customers')).default;
    render(<MemoryRouter><Customers /></MemoryRouter>);
    expect(screen.getByText(/Customer Management/)).toBeDefined();
  });

  it('renders search input', async () => {
    const Customers = (await import('./Customers')).default;
    render(<MemoryRouter><Customers /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Search by name/)).toBeDefined();
  });

  it('renders customers after load', async () => {
    mockUseApi.mockReturnValue({ data: [mockCustomer], loading: false, error: null, refetch: vi.fn() });
    const Customers = (await import('./Customers')).default;
    render(<MemoryRouter><Customers /></MemoryRouter>);
    expect(screen.getByText('Test Customer')).toBeDefined();
  });
});
