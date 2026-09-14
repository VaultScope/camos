import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn().mockImplementation(() => new Promise(() => {})),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));
vi.mock('recharts', () => ({
  AreaChart: ({ children }: any) => children,
  Area: () => null,
  BarChart: ({ children }: any) => children,
  Bar: () => null,
  PieChart: ({ children }: any) => children,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => children,
  RadialBarChart: ({ children }: any) => children,
  RadialBar: () => null,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('BillingRouter', () => {
  it('renders invoices page at /invoices route', async () => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
    const BillingRouter = (await import('./BillingRouter')).default;
    render(<MemoryRouter initialEntries={['/invoices']}><BillingRouter /></MemoryRouter>);
    expect(screen.getByText(/Invoices/)).toBeDefined();
  });

  it('renders automations page at /automations route', async () => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
    const BillingRouter = (await import('./BillingRouter')).default;
    render(<MemoryRouter initialEntries={['/automations']}><BillingRouter /></MemoryRouter>);
    expect(screen.getByText(/Billing Automations/)).toBeDefined();
  });
});
