import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockService } from '../test/utils';

vi.mock('../lib/hooks', () => ({
  useApi: vi.fn(),
}));

vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 'staff-1', email: 'admin@vs.de', role: 'admin' }),
  isAuthenticated: () => true,
  logout: vi.fn(),
  hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('Services', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    const Services = (await import('./Services')).default;
    render(<MemoryRouter><Services /></MemoryRouter>);
    expect(screen.getByText(/Manage Services/)).toBeDefined();
  });

  it('renders search input', async () => {
    const Services = (await import('./Services')).default;
    render(<MemoryRouter><Services /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Search by name/)).toBeDefined();
  });

  it('renders services table after load', async () => {
    mockUseApi.mockReturnValue({ data: [mockService], loading: false, error: null, refetch: vi.fn() });
    const Services = (await import('./Services')).default;
    render(<MemoryRouter><Services /></MemoryRouter>);
    expect(screen.getByText('Test VPS')).toBeDefined();
  });

  it('shows empty state', async () => {
    mockUseApi.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    const Services = (await import('./Services')).default;
    render(<MemoryRouter><Services /></MemoryRouter>);
    expect(screen.getByText(/No services/i)).toBeDefined();
  });
});
