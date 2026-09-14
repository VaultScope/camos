import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockStaff, mockRole } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('Staff', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  it('renders staff members page', async () => {
    mockUseApi.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    const StaffRouter = (await import('./Staff')).default;
    render(<MemoryRouter initialEntries={['/members']}><StaffRouter /></MemoryRouter>);
    expect(screen.getByText(/Identity, Staff & RBAC/)).toBeDefined();
  });

  it('renders staff search input', async () => {
    mockUseApi.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    const StaffRouter = (await import('./Staff')).default;
    render(<MemoryRouter initialEntries={['/members']}><StaffRouter /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Search staff/)).toBeDefined();
  });

  it('renders staff list after load', async () => {
    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/staff') return { data: [{ ...mockStaff, role_name: 'Owner' }], loading: false, error: null, refetch: vi.fn() };
      if (url === '/admin/staff/roles') return { data: [mockRole], loading: false, error: null, refetch: vi.fn() };
      return { data: null, loading: false, error: null, refetch: vi.fn() };
    });
    const StaffRouter = (await import('./Staff')).default;
    render(<MemoryRouter initialEntries={['/members']}><StaffRouter /></MemoryRouter>);
    expect(screen.getByText('Admin User')).toBeDefined();
  });

  it('renders RBAC page', async () => {
    mockUseApi.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    const StaffRouter = (await import('./Staff')).default;
    render(<MemoryRouter initialEntries={['/rbac']}><StaffRouter /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Search roles/)).toBeDefined();
  });

  it('renders account page with profile', async () => {
    mockUseApi.mockReturnValue({
      data: { ...mockStaff, role_name: 'Owner' },
      loading: false, error: null, refetch: vi.fn(),
    });
    const StaffRouter = (await import('./Staff')).default;
    render(<MemoryRouter initialEntries={['/account']}><StaffRouter /></MemoryRouter>);
    expect(screen.getByText('Profile Information')).toBeDefined();
  });
});
