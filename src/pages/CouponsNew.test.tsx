import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockCoupon } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('CouponsNew', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    const Coupons = (await import('./CouponsNew')).default;
    render(<MemoryRouter><Coupons /></MemoryRouter>);
    expect(screen.getByText(/Coupons/)).toBeDefined();
  });

  it('renders search input', async () => {
    const Coupons = (await import('./CouponsNew')).default;
    render(<MemoryRouter><Coupons /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Search coupons/)).toBeDefined();
  });

  it('renders coupons after load', async () => {
    mockUseApi.mockReturnValue({ data: [mockCoupon], loading: false, error: null, refetch: vi.fn() });
    const Coupons = (await import('./CouponsNew')).default;
    render(<MemoryRouter><Coupons /></MemoryRouter>);
    expect(screen.getByText('SAVE20')).toBeDefined();
  });

  it('renders create coupon button', async () => {
    const Coupons = (await import('./CouponsNew')).default;
    render(<MemoryRouter><Coupons /></MemoryRouter>);
    expect(screen.getByText(/Create Coupon/)).toBeDefined();
  });
});
