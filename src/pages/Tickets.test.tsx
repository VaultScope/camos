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

  it('renders ticket detail with message attachments', async () => {
    const mockDetailTicket = { ...mockTicket, id: 't1' };
    const mockTicketMessages = [
      {
        id: 'm1',
        ticket_id: 't1',
        author_id: 'c1',
        author_type: 'customer' as const,
        content: 'Screenshot attached',
        internal: false,
        created_at: '2026-08-25T10:00:00Z',
        attachments: [
          {
            id: 'att-1',
            filename: 'issue.png',
            url: '/uploads/tickets/issue.png',
            size: 15360,
            content_type: 'image/png',
          },
        ],
      },
    ];
    const noopRefetch = vi.fn();

    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/tickets/t1') {
        return { data: mockDetailTicket, loading: false, error: null, refetch: noopRefetch };
      }
      if (url === '/admin/tickets/t1/messages') {
        return {
          data: mockTicketMessages,
          loading: false,
          error: null,
          refetch: noopRefetch,
        };
      }
      return { data: null, loading: false, error: null, refetch: noopRefetch };
    });

    const TicketsRouter = (await import('./Tickets')).default;
    const { unmount } = render(<MemoryRouter initialEntries={['/t1']}><TicketsRouter /></MemoryRouter>);

    expect(screen.getByText('Screenshot attached')).toBeDefined();
    const img = screen.getByRole('img', { name: 'issue.png' });
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('/uploads/tickets/issue.png');
    expect(screen.getByText(/Attach Image \(Max 10MB\)/)).toBeDefined();
    unmount();
  });
});
