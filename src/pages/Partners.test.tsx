import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'admin@vaultscope.de', role: 'admin' }),
  isAuthenticated: () => true,
  logout: vi.fn(),
  hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

const mockPartner = {
  id: 'partner-1',
  slug: 'hardwareluxx',
  name: 'HardwareLuxx',
  headline: 'Exclusive Trial',
  description: 'Special offer for readers',
  badge_text: 'Community Special',
  product_id: 'prod-1',
  product_name: 'CX22 Cloud Server',
  product_price: '5.00',
  product_trial_days: 7,
  trial_days_override: 14,
  active: true,
  clicks: 42,
  conversions: 5,
  created_at: '2026-10-13T12:00:00Z',
  updated_at: '2026-10-13T12:00:00Z',
};

describe('Partners', () => {
  beforeEach(() => {
    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/partners') {
        return { data: [mockPartner], loading: false, error: null, refetch: vi.fn() } as any;
      }
      return { data: [], loading: false, error: null, refetch: vi.fn() } as any;
    });
  });

  it('renders page title and partner name', async () => {
    const Partners = (await import('./Partners')).default;
    render(
      <MemoryRouter>
        <Partners />
      </MemoryRouter>
    );
    expect(screen.getByText(/Partner Campaigns/)).toBeDefined();
    expect(screen.getByText('HardwareLuxx')).toBeDefined();
    expect(screen.getByText('/ps/hardwareluxx')).toBeDefined();
  });

  it('renders analytics numbers', async () => {
    const Partners = (await import('./Partners')).default;
    render(
      <MemoryRouter>
        <Partners />
      </MemoryRouter>
    );
    expect(screen.getAllByText('42').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
  });

  it('renders new partner campaign button', async () => {
    const Partners = (await import('./Partners')).default;
    render(
      <MemoryRouter>
        <Partners />
      </MemoryRouter>
    );
    expect(screen.getByText('New Partner Link')).toBeDefined();
  });

  it('renders 1 per user badge on partner row', async () => {
    const Partners = (await import('./Partners')).default;
    render(
      <MemoryRouter>
        <Partners />
      </MemoryRouter>
    );
    expect(screen.getByText('1 per user')).toBeDefined();
  });

  it('renders Cut & Quota button when partner has no commission', async () => {
    const Partners = (await import('./Partners')).default;
    render(
      <MemoryRouter>
        <Partners />
      </MemoryRouter>
    );
    expect(screen.getByText('Cut & Quota')).toBeDefined();
  });
});
