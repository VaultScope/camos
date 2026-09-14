import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockCustomer, mockService, mockTicket, mockActivityLog } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
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

const suspendedCustomer = {
  ...mockCustomer,
  id: 'c2',
  name: 'Suspended User',
  email: 'suspended@test.com',
  status: 'suspended' as const,
};

describe('Customers interaction tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CustomerList', () => {
    beforeEach(() => {
      mockUseApi.mockReturnValue({
        data: [mockCustomer, suspendedCustomer],
        loading: false,
        error: null,
        refetch: vi.fn(),
      });
    });

    it('filters customers by search query', async () => {
      const user = userEvent.setup();
      const Customers = (await import('./Customers')).default;
      render(<MemoryRouter><Customers /></MemoryRouter>);

      expect(screen.getByText('Test Customer')).toBeDefined();
      expect(screen.getByText('Suspended User')).toBeDefined();

      const searchInput = screen.getByPlaceholderText(/Search by name/);
      await user.type(searchInput, 'Test Customer');

      expect(screen.getByText('Test Customer')).toBeDefined();
      expect(screen.queryByText('Suspended User')).toBeNull();
    });

    it('filters customers by email', async () => {
      const user = userEvent.setup();
      const Customers = (await import('./Customers')).default;
      render(<MemoryRouter><Customers /></MemoryRouter>);

      const searchInput = screen.getByPlaceholderText(/Search by name/);
      await user.type(searchInput, 'suspended@test');

      expect(screen.queryByText('Test Customer')).toBeNull();
      expect(screen.getByText('Suspended User')).toBeDefined();
    });

    it('filters customers by status dropdown', async () => {
      const user = userEvent.setup();
      const Customers = (await import('./Customers')).default;
      render(<MemoryRouter><Customers /></MemoryRouter>);

      const statusSelect = screen.getByDisplayValue('All Statuses');
      await user.selectOptions(statusSelect, 'suspended');

      expect(screen.queryByText('Test Customer')).toBeNull();
      expect(screen.getByText('Suspended User')).toBeDefined();
    });

    it('shows empty state when no customers match filter', async () => {
      const user = userEvent.setup();
      const Customers = (await import('./Customers')).default;
      render(<MemoryRouter><Customers /></MemoryRouter>);

      const searchInput = screen.getByPlaceholderText(/Search by name/);
      await user.type(searchInput, 'nonexistent_xyzzy');

      expect(screen.getByText(/No customers match/)).toBeDefined();
    });

    it('renders error state', async () => {
      mockUseApi.mockReturnValue({
        data: null,
        loading: false,
        error: 'Network error',
        refetch: vi.fn(),
      });
      const Customers = (await import('./Customers')).default;
      render(<MemoryRouter><Customers /></MemoryRouter>);
      expect(screen.getByText(/Failed to load customers/)).toBeDefined();
    });

    it('renders loading state', async () => {
      mockUseApi.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: vi.fn(),
      });
      const Customers = (await import('./Customers')).default;
      render(<MemoryRouter><Customers /></MemoryRouter>);
      expect(screen.getByText(/Loading customers/)).toBeDefined();
    });
  });

  describe('CustomerDetail', () => {
    const refetchFn = vi.fn();

    beforeEach(() => {
      mockUseApi.mockImplementation((url: string) => {
        if (url === '/admin/customers/c1')
          return { data: mockCustomer, loading: false, error: null, refetch: refetchFn };
        if (url.includes('services?customer_id'))
          return { data: [mockService], loading: false, error: null, refetch: vi.fn() };
        if (url.includes('tickets?customer_id'))
          return { data: [mockTicket], loading: false, error: null, refetch: vi.fn() };
        if (url.includes('activity?customer_id'))
          return { data: [mockActivityLog], loading: false, error: null, refetch: vi.fn() };
        return { data: null, loading: false, error: null, refetch: vi.fn() };
      });
    });

    it('displays customer details', async () => {
      const Customers = (await import('./Customers')).default;
      render(<MemoryRouter initialEntries={['/c1']}><Customers /></MemoryRouter>);

      expect(screen.getByText('Test Customer')).toBeDefined();
      expect(screen.getByText('test@example.com')).toBeDefined();
    });

    it('shows customer status badge', async () => {
      const Customers = (await import('./Customers')).default;
      render(<MemoryRouter initialEntries={['/c1']}><Customers /></MemoryRouter>);

      expect(screen.getByText('active')).toBeDefined();
    });

    it('shows services tab by default with service data', async () => {
      const Customers = (await import('./Customers')).default;
      render(<MemoryRouter initialEntries={['/c1']}><Customers /></MemoryRouter>);

      expect(screen.getByText('Test VPS')).toBeDefined();
      expect(screen.getByText('1.2.3.4')).toBeDefined();
    });

    it('switches to tickets tab on click', async () => {
      const user = userEvent.setup();
      const Customers = (await import('./Customers')).default;
      render(<MemoryRouter initialEntries={['/c1']}><Customers /></MemoryRouter>);

      const ticketsTab = screen.getByRole('button', { name: /Tickets/i });
      await user.click(ticketsTab);

      expect(screen.getByText('Help me')).toBeDefined();
    });

    it('switches to activity tab on click', async () => {
      const user = userEvent.setup();
      const Customers = (await import('./Customers')).default;
      render(<MemoryRouter initialEntries={['/c1']}><Customers /></MemoryRouter>);

      const activityTab = screen.getByRole('button', { name: /Activity/i });
      await user.click(activityTab);

      expect(screen.getByText(/created/)).toBeDefined();
    });

    it('saves internal notes via api.put', async () => {
      const user = userEvent.setup();
      mockApi.put.mockResolvedValue({});
      const Customers = (await import('./Customers')).default;
      render(<MemoryRouter initialEntries={['/c1']}><Customers /></MemoryRouter>);

      const notesTextarea = screen.getByPlaceholderText(/Staff-only notes/);
      await user.clear(notesTextarea);
      await user.type(notesTextarea, 'VIP customer');

      const saveBtn = screen.getByRole('button', { name: /Save Notes/ });
      await user.click(saveBtn);

      expect(mockApi.put).toHaveBeenCalledWith('/admin/customers/c1', { notes: 'VIP customer' });
    });

    it('calls suspend with confirmation dialog', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockApi.put.mockResolvedValue({});
      const Customers = (await import('./Customers')).default;
      render(<MemoryRouter initialEntries={['/c1']}><Customers /></MemoryRouter>);

      const suspendBtn = screen.getByRole('button', { name: /Suspend Account/ });
      await user.click(suspendBtn);

      expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('suspend'));
      expect(mockApi.put).toHaveBeenCalledWith('/admin/customers/c1', { status: 'suspended' });
    });

    it('does not suspend when confirmation is cancelled', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const Customers = (await import('./Customers')).default;
      render(<MemoryRouter initialEntries={['/c1']}><Customers /></MemoryRouter>);

      const suspendBtn = screen.getByRole('button', { name: /Suspend Account/ });
      await user.click(suspendBtn);

      expect(mockApi.put).not.toHaveBeenCalled();
    });
  });
});
