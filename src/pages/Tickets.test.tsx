import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockTicket } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('Tickets', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  it('renders tickets list page title', async () => {
    const TicketsRouter = (await import('./Tickets')).default;
    render(<MemoryRouter initialEntries={['/']}><TicketsRouter /></MemoryRouter>);
    expect(screen.getByText(/Support Tickets/)).toBeDefined();
  });

  it('renders search input', async () => {
    const TicketsRouter = (await import('./Tickets')).default;
    render(<MemoryRouter initialEntries={['/']}><TicketsRouter /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Search by subject/)).toBeDefined();
  });

  it('renders tickets after load', async () => {
    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/tickets') return { data: [mockTicket], loading: false, error: null, refetch: vi.fn() };
      return { data: null, loading: false, error: null, refetch: vi.fn() };
    });
    const TicketsRouter = (await import('./Tickets')).default;
    render(<MemoryRouter initialEntries={['/']}><TicketsRouter /></MemoryRouter>);
    expect(screen.getByText('TKT-ABC123')).toBeDefined();
  });

  it('renders departments page', async () => {
    const TicketsRouter = (await import('./Tickets')).default;
    render(<MemoryRouter initialEntries={['/departments']}><TicketsRouter /></MemoryRouter>);
    expect(screen.getByText(/Support Departments/)).toBeDefined();
  });

  it('renders create ticket page', async () => {
    const TicketsRouter = (await import('./Tickets')).default;
    render(<MemoryRouter initialEntries={['/new']}><TicketsRouter /></MemoryRouter>);
    expect(screen.getAllByText(/Create Ticket/).length).toBeGreaterThan(0);
  });
});
