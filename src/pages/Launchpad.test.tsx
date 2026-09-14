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

describe('Launchpad', () => {
  beforeEach(() => {
    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/internal-tools') return { data: [], loading: false, error: null, refetch: vi.fn() };
      if (url === '/admin/staff/roles') return { data: [{ id: 'r1', name: 'admin', permissions: ['*'], mapped_group: 'admins' }], loading: false, error: null, refetch: vi.fn() };
      return { data: null, loading: false, error: null, refetch: vi.fn() };
    });
  });

  it('renders page title', async () => {
    const Launchpad = (await import('./Launchpad')).default;
    render(<MemoryRouter><Launchpad /></MemoryRouter>);
    expect(screen.getByText(/Internal Tools & Telemetry/)).toBeDefined();
  });

  it('shows no permission message when no tools', async () => {
    const Launchpad = (await import('./Launchpad')).default;
    render(<MemoryRouter><Launchpad /></MemoryRouter>);
    expect(screen.getByText(/do not have permission/)).toBeDefined();
  });
});
