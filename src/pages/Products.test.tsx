import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockProduct } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('Products', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    const Products = (await import('./Products')).default;
    render(<MemoryRouter><Products /></MemoryRouter>);
    expect(screen.getByText(/Products & Margin Tracking/)).toBeDefined();
  });

  it('renders products after load', async () => {
    mockUseApi.mockReturnValue({ data: [mockProduct], loading: false, error: null, refetch: vi.fn() });
    const Products = (await import('./Products')).default;
    render(<MemoryRouter><Products /></MemoryRouter>);
    expect(screen.getByText('VPS Pro')).toBeDefined();
  });
});
