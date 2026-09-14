import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockNotification } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('Notifications', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    const Notifications = (await import('./Notifications')).default;
    render(<MemoryRouter><Notifications /></MemoryRouter>);
    expect(screen.getByText(/Notifications/)).toBeDefined();
  });

  it('shows all caught up when empty', async () => {
    mockUseApi.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    const Notifications = (await import('./Notifications')).default;
    render(<MemoryRouter><Notifications /></MemoryRouter>);
    expect(screen.getByText(/All caught up/)).toBeDefined();
  });

  it('renders notifications after load', async () => {
    mockUseApi.mockReturnValue({ data: [mockNotification], loading: false, error: null, refetch: vi.fn() });
    const Notifications = (await import('./Notifications')).default;
    render(<MemoryRouter><Notifications /></MemoryRouter>);
    expect(screen.getByText('Service provisioned')).toBeDefined();
  });

  it('shows unresolved count', async () => {
    mockUseApi.mockReturnValue({ data: [mockNotification], loading: false, error: null, refetch: vi.fn() });
    const Notifications = (await import('./Notifications')).default;
    render(<MemoryRouter><Notifications /></MemoryRouter>);
    expect(screen.getByText(/1 unresolved/)).toBeDefined();
  });
});
