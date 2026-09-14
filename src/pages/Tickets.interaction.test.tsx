import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockTicket, mockStaff, mockCustomer } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({ id: 'new-tkt' }),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true,
  logout: vi.fn(),
  hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
const mockUseApi = vi.mocked(useApi);
const mockApi = vi.mocked(api);

const closedTicket = {
  ...mockTicket,
  id: 'tkt-2',
  ticket_number: 'TKT-DEF456',
  subject: 'Resolved issue',
  status: 'closed' as const,
};

const mockDepartment = {
  id: 'dept-1',
  name: 'General Support',
  mailbox: 'support@vs.de',
  default_assignee_id: null,
  created_at: '2026-01-01T00:00:00Z',
};

describe('Tickets interaction tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TicketsList', () => {
    beforeEach(() => {
      mockUseApi.mockImplementation((url: string) => {
        if (url === '/admin/tickets')
          return { data: [mockTicket, closedTicket], loading: false, error: null, refetch: vi.fn() };
        if (url === '/admin/departments')
          return { data: [mockDepartment], loading: false, error: null, refetch: vi.fn() };
        return { data: null, loading: false, error: null, refetch: vi.fn() };
      });
    });

    it('filters tickets by search text', async () => {
      const user = userEvent.setup();
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/']}><Tickets /></MemoryRouter>);

      expect(screen.getByText('TKT-ABC123')).toBeDefined();
      expect(screen.getByText('TKT-DEF456')).toBeDefined();

      const searchInput = screen.getByPlaceholderText(/Search by subject/);
      await user.type(searchInput, 'Resolved');

      expect(screen.queryByText('TKT-ABC123')).toBeNull();
      expect(screen.getByText('TKT-DEF456')).toBeDefined();
    });

    it('filters tickets by status dropdown', async () => {
      const user = userEvent.setup();
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/']}><Tickets /></MemoryRouter>);

      const statusSelect = screen.getByDisplayValue('All Statuses');
      await user.selectOptions(statusSelect, 'closed');

      expect(screen.queryByText('TKT-ABC123')).toBeNull();
      expect(screen.getByText('TKT-DEF456')).toBeDefined();
    });

    it('shows empty state when no tickets match', async () => {
      const user = userEvent.setup();
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/']}><Tickets /></MemoryRouter>);

      const searchInput = screen.getByPlaceholderText(/Search by subject/);
      await user.type(searchInput, 'nonexistentzzz');

      expect(screen.getByText(/No tickets match/)).toBeDefined();
    });

    it('displays department tabs from API', async () => {
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/']}><Tickets /></MemoryRouter>);

      expect(screen.getByText(/General Support/)).toBeDefined();
    });

    it('switches department tab on click', async () => {
      const user = userEvent.setup();
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/']}><Tickets /></MemoryRouter>);

      const deptTab = screen.getByRole('button', { name: /General Support/ });
      await user.click(deptTab);

      expect(screen.getByText('TKT-ABC123')).toBeDefined();
    });
  });

  describe('TicketsDepartments', () => {
    const refetchFn = vi.fn();

    beforeEach(() => {
      mockUseApi.mockImplementation((url: string) => {
        if (url === '/admin/departments')
          return { data: [mockDepartment], loading: false, error: null, refetch: refetchFn };
        if (url === '/admin/staff')
          return { data: [mockStaff], loading: false, error: null, refetch: vi.fn() };
        return { data: null, loading: false, error: null, refetch: vi.fn() };
      });
    });

    it('renders departments list', async () => {
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/departments']}><Tickets /></MemoryRouter>);

      expect(screen.getByText('General Support')).toBeDefined();
      expect(screen.getByText('support@vs.de')).toBeDefined();
    });

    it('opens add department modal', async () => {
      const user = userEvent.setup();
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/departments']}><Tickets /></MemoryRouter>);

      const addBtn = screen.getByRole('button', { name: /Add Department/ });
      await user.click(addBtn);

      expect(screen.getByText('New Department')).toBeDefined();
      expect(screen.getByPlaceholderText(/General Support/)).toBeDefined();
    });

    it('fills and submits new department form', async () => {
      const user = userEvent.setup();
      mockApi.post.mockResolvedValue({});
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/departments']}><Tickets /></MemoryRouter>);

      await user.click(screen.getByRole('button', { name: /Add Department/ }));
      await user.type(screen.getByPlaceholderText(/General Support/), 'Billing Support');
      await user.type(screen.getByPlaceholderText(/support@example.com/), 'billing@vs.de');
      await user.click(screen.getByRole('button', { name: /^Save$/ }));

      expect(mockApi.post).toHaveBeenCalledWith('/admin/departments', {
        name: 'Billing Support',
        mailbox: 'billing@vs.de',
        default_assignee_id: null,
      });
    });

    it('opens edit modal with existing department data', async () => {
      const user = userEvent.setup();
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/departments']}><Tickets /></MemoryRouter>);

      await user.click(screen.getByRole('button', { name: /^Edit$/ }));

      expect(screen.getByText('Edit Department')).toBeDefined();
      expect(screen.getByDisplayValue('General Support')).toBeDefined();
      expect(screen.getByDisplayValue('support@vs.de')).toBeDefined();
    });

    it('cancels modal closes it', async () => {
      const user = userEvent.setup();
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/departments']}><Tickets /></MemoryRouter>);

      await user.click(screen.getByRole('button', { name: /Add Department/ }));
      expect(screen.getByText('New Department')).toBeDefined();

      await user.click(screen.getByRole('button', { name: /Cancel/ }));
      expect(screen.queryByText('New Department')).toBeNull();
    });

    it('deletes department with confirmation', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockApi.delete.mockResolvedValue({});
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/departments']}><Tickets /></MemoryRouter>);

      await user.click(screen.getByRole('button', { name: /^Delete$/ }));

      expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('General Support'));
      expect(mockApi.delete).toHaveBeenCalledWith('/admin/departments/dept-1');
    });

    it('does not delete when confirmation cancelled', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/departments']}><Tickets /></MemoryRouter>);

      await user.click(screen.getByRole('button', { name: /^Delete$/ }));

      expect(mockApi.delete).not.toHaveBeenCalled();
    });
  });

  describe('TicketsNew', () => {
    beforeEach(() => {
      mockUseApi.mockImplementation((url: string) => {
        if (url === '/admin/customers')
          return { data: [mockCustomer], loading: false, error: null, refetch: vi.fn() };
        if (url === '/admin/staff')
          return { data: [mockStaff], loading: false, error: null, refetch: vi.fn() };
        if (url === '/admin/departments')
          return { data: [mockDepartment], loading: false, error: null, refetch: vi.fn() };
        return { data: null, loading: false, error: null, refetch: vi.fn() };
      });
    });

    it('renders create ticket form fields', async () => {
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/new']}><Tickets /></MemoryRouter>);

      expect(screen.getByText('Customer *')).toBeDefined();
      expect(screen.getByText('Subject *')).toBeDefined();
      expect(screen.getByText('Category')).toBeDefined();
      expect(screen.getByText('Priority')).toBeDefined();
    });

    it('populates customer dropdown from API', async () => {
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/new']}><Tickets /></MemoryRouter>);

      expect(screen.getByText(/Test Customer \(test@example.com\)/)).toBeDefined();
    });

    it('submit button is disabled without required fields', async () => {
      const Tickets = (await import('./Tickets')).default;
      render(<MemoryRouter initialEntries={['/new']}><Tickets /></MemoryRouter>);

      const submitBtn = screen.getAllByText(/Create Ticket/).find(
        el => el.tagName === 'BUTTON'
      );
      expect(submitBtn).toBeDefined();
      expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
    });
  });
});
