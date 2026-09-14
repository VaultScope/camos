import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true,
  logout: vi.fn(),
  hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

const mockStats = {
  active_services: 42,
  total_customers: 150,
  open_tickets: 5,
  pending_jobs: 2,
  mrr: 12500,
};

const mockNotification = {
  id: 'n1',
  title: 'Service down',
  created_at: '2026-08-01T00:00:00Z',
};

const mockActivity = {
  id: 'a1',
  actor_name: 'Admin User',
  action: 'provisioned',
  target: 'VPS Pro',
  created_at: '2026-08-01T00:00:00Z',
};

const mockTicket = {
  id: 't1',
  subject: 'Server issue',
  ticket_number: 'TKT-999',
  status: 'open',
};

describe('Dashboard interaction tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading dashes when data is loading', () => {
    mockUseApi.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('displays all stat values from API', () => {
    mockUseApi.mockImplementation((path: string) => {
      if (path === '/admin/dashboard/stats')
        return { data: mockStats, loading: false, error: null, refetch: vi.fn() };
      return { data: [], loading: false, error: null, refetch: vi.fn() };
    });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(screen.getAllByText('€12,500').length).toBeGreaterThan(0);
    expect(screen.getByText('42')).toBeDefined();
    expect(screen.getByText('150')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
  });

  it('shows notifications in the needs attention panel', () => {
    mockUseApi.mockImplementation((path: string) => {
      if (path === '/admin/dashboard/stats')
        return { data: mockStats, loading: false, error: null, refetch: vi.fn() };
      if (path === '/admin/notifications')
        return { data: [mockNotification], loading: false, error: null, refetch: vi.fn() };
      return { data: [], loading: false, error: null, refetch: vi.fn() };
    });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(screen.getByText('Service down')).toBeDefined();
  });

  it('shows empty notification state', () => {
    mockUseApi.mockImplementation((path: string) => {
      if (path === '/admin/dashboard/stats')
        return { data: mockStats, loading: false, error: null, refetch: vi.fn() };
      return { data: [], loading: false, error: null, refetch: vi.fn() };
    });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(screen.getByText(/Nothing urgent/)).toBeDefined();
  });

  it('shows recent activity entries', () => {
    mockUseApi.mockImplementation((path: string) => {
      if (path === '/admin/dashboard/stats')
        return { data: mockStats, loading: false, error: null, refetch: vi.fn() };
      if (path === '/admin/activity')
        return { data: [mockActivity], loading: false, error: null, refetch: vi.fn() };
      return { data: [], loading: false, error: null, refetch: vi.fn() };
    });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(screen.getByText(/Admin User: provisioned VPS Pro/)).toBeDefined();
  });

  it('shows open tickets in ticket queue', () => {
    mockUseApi.mockImplementation((path: string) => {
      if (path === '/admin/dashboard/stats')
        return { data: mockStats, loading: false, error: null, refetch: vi.fn() };
      if (path === '/admin/tickets')
        return { data: [mockTicket], loading: false, error: null, refetch: vi.fn() };
      return { data: [], loading: false, error: null, refetch: vi.fn() };
    });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(screen.getByText('Server issue')).toBeDefined();
    expect(screen.getByText('#TKT-999')).toBeDefined();
  });

  it('shows no open tickets message when queue is empty', () => {
    mockUseApi.mockImplementation((path: string) => {
      if (path === '/admin/dashboard/stats')
        return { data: mockStats, loading: false, error: null, refetch: vi.fn() };
      if (path === '/admin/tickets')
        return { data: [], loading: false, error: null, refetch: vi.fn() };
      return { data: [], loading: false, error: null, refetch: vi.fn() };
    });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(screen.getByText(/No open tickets/)).toBeDefined();
  });

  it('renders quick action links', () => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(screen.getByText('Provision Service')).toBeDefined();
    expect(screen.getByText('New Product')).toBeDefined();
    expect(screen.getAllByText(/Create Ticket/).length).toBeGreaterThan(0);
    expect(screen.getByText('Generate Invoice')).toBeDefined();
  });

  it('displays zero values when stats are null', () => {
    mockUseApi.mockImplementation((path: string) => {
      if (path === '/admin/dashboard/stats')
        return { data: null, loading: false, error: null, refetch: vi.fn() };
      return { data: [], loading: false, error: null, refetch: vi.fn() };
    });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('€0').length).toBeGreaterThan(0);
  });
});
