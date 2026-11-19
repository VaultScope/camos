import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockTicket } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/api', () => ({
  API_BASE: 'https://api.example.test/api',
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
const mockUseApi = vi.mocked(useApi);
const mockApi = vi.mocked(api);

describe('Tickets', () => {
  const originalEventSource = window.EventSource;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
    mockApi.post.mockResolvedValue({});
  });

  afterEach(() => {
    window.EventSource = originalEventSource;
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

  it('blocks unsafe javascript:/data:/vbscript: attachment URLs and renders safe disabled label', async () => {
    const mockDetailTicket = { ...mockTicket, id: 't1' };
    const mockTicketMessages = [
      {
        id: 'm1',
        ticket_id: 't1',
        author_id: 'c1',
        author_type: 'customer' as const,
        content: 'Check these attachments',
        internal: false,
        created_at: '2026-08-25T10:00:00Z',
        attachments: [
          { id: 'bad-1', filename: 'evil.svg', url: 'javascript:alert(1)', size: 100, content_type: 'image/png' },
          { id: 'bad-2', filename: 'data.png', url: 'data:text/html,<script>alert(1)</script>', size: 100, content_type: 'image/png' },
          { id: 'bad-3', filename: 'vbs.png', url: 'vbscript:msgbox(1)', size: 100, content_type: 'image/png' },
          { id: 'good-1', filename: 'ok.png', url: 'https://cdn.vaultscope.de/ok.png', size: 2048, content_type: 'image/png' },
        ],
      },
    ];
    const noopRefetch = vi.fn();

    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/tickets/t1') return { data: mockDetailTicket, loading: false, error: null, refetch: noopRefetch };
      if (url === '/admin/tickets/t1/messages') return { data: mockTicketMessages, loading: false, error: null, refetch: noopRefetch };
      return { data: null, loading: false, error: null, refetch: noopRefetch };
    });

    const TicketsRouter = (await import('./Tickets')).default;
    const { container, unmount } = render(<MemoryRouter initialEntries={['/t1']}><TicketsRouter /></MemoryRouter>);

    expect(screen.getAllByText('(Blocked)').length).toBe(3);
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(container.querySelector('a[href^="data:"]')).toBeNull();
    expect(container.querySelector('a[href^="vbscript:"]')).toBeNull();
    expect(container.querySelector('img[src^="javascript:"]')).toBeNull();
    expect(container.querySelector('img[src^="data:"]')).toBeNull();
    const safeImg = screen.getByRole('img', { name: 'ok.png' });
    expect(safeImg.getAttribute('src')).toBe('https://cdn.vaultscope.de/ok.png');
    unmount();
  });

  it('rejects SVG upload and restricts file input accept attribute to png/jpeg/webp', async () => {
    const mockDetailTicket = { ...mockTicket, id: 't1' };
    const noopRefetch = vi.fn();
    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/tickets/t1') return { data: mockDetailTicket, loading: false, error: null, refetch: noopRefetch };
      if (url === '/admin/tickets/t1/messages') return { data: [], loading: false, error: null, refetch: noopRefetch };
      return { data: null, loading: false, error: null, refetch: noopRefetch };
    });

    const TicketsRouter = (await import('./Tickets')).default;
    const { container, unmount } = render(<MemoryRouter initialEntries={['/t1']}><TicketsRouter /></MemoryRouter>);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.getAttribute('accept')).toBe('image/png,image/jpeg,image/webp');

    const svgFile = new File(['<svg onload="alert(1)"/>'], 'xss.svg', { type: 'image/svg+xml' });
    fireEvent.change(fileInput, { target: { files: [svgFile] } });

    expect(screen.getByText(/not a permitted image/i)).toBeDefined();
    expect(mockApi.post).not.toHaveBeenCalledWith('/admin/tickets/t1/attachments', expect.anything());
    unmount();
  });

  it('connects SSE using single-use /auth/sse-ticket instead of JWT query param and sends reply without spoofable author fields', async () => {
    const mockDetailTicket = { ...mockTicket, id: 't1' };
    const noopRefetch = vi.fn();
    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/tickets/t1') return { data: mockDetailTicket, loading: false, error: null, refetch: noopRefetch };
      if (url === '/admin/tickets/t1/messages') return { data: [], loading: false, error: null, refetch: noopRefetch };
      return { data: null, loading: false, error: null, refetch: noopRefetch };
    });

    const constructedUrls: string[] = [];
    const closeSpy = vi.fn();
    class MockEventSource {
      onopen: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(url: string) {
        constructedUrls.push(url);
      }
      addEventListener() {}
      close = closeSpy;
    }
    window.EventSource = MockEventSource as unknown as typeof EventSource;
    localStorage.setItem('vs_admin_token', 'secret-jwt-value');
    mockApi.post.mockImplementation(async (path: string) => {
      if (path === '/auth/sse-ticket') return { ticket: 'sse-one-time-123' };
      return {
        id: 'm-new',
        ticket_id: 't1',
        author_id: 's1',
        author_type: 'staff',
        content: 'Hello from staff',
        internal: false,
        created_at: '2026-08-25T10:05:00Z',
      };
    });

    const TicketsRouter = (await import('./Tickets')).default;
    const { unmount } = render(<MemoryRouter initialEntries={['/t1']}><TicketsRouter /></MemoryRouter>);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/auth/sse-ticket', {});
      expect(constructedUrls.length).toBe(1);
    });

    expect(constructedUrls[0]).toBe('https://api.example.test/api/admin/tickets/t1/events?ticket=sse-one-time-123');
    expect(constructedUrls[0]).not.toContain('token=');
    expect(constructedUrls[0]).not.toContain('secret-jwt-value');

    const replyBox = screen.getByPlaceholderText(/Type your reply/i);
    fireEvent.change(replyBox, { target: { value: 'Hello from staff' } });
    const sendBtn = replyBox.parentElement?.querySelector('button') as HTMLButtonElement;
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/admin/tickets/t1/messages', {
        content: 'Hello from staff',
        internal: false,
        attachments: [],
      });
    });

    unmount();
    expect(closeSpy).toHaveBeenCalled();
  });
});
