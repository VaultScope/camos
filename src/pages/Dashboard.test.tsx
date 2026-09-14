import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

vi.mock('../lib/hooks', () => ({
  useApi: vi.fn(),
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 'staff-1', email: 'admin@vs.de', role: 'admin' }),
  isAuthenticated: () => true,
  logout: vi.fn(),
  hasPermission: () => true,
}));

const mockStats = {
  active_services: 42,
  total_customers: 150,
  open_tickets: 5,
  pending_jobs: 2,
  mrr: 12500,
};

describe('Dashboard', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() });
  });

  it('shows loading state', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText('Dashboard')).toBeDefined();
  });

  it('renders stats after load', () => {
    mockUseApi.mockImplementation((path: string) => {
      if (path === '/admin/dashboard/stats') return { data: mockStats, loading: false, error: null, refetch: vi.fn() };
      return { data: [], loading: false, error: null, refetch: vi.fn() };
    });

    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getAllByText('€12,500').length).toBeGreaterThan(0);
    expect(screen.getByText('42')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('150')).toBeDefined();
  });

  it('renders stat labels', () => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText('MRR')).toBeDefined();
    expect(screen.getByText('Active Services')).toBeDefined();
    expect(screen.getByText('Open Tickets')).toBeDefined();
    expect(screen.getByText('Pending Jobs')).toBeDefined();
    expect(screen.getByText('Customers')).toBeDefined();
  });
});
