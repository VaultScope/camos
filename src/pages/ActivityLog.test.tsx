import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockActivityLog } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('ActivityLog', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    const ActivityLog = (await import('./ActivityLog')).default;
    render(<MemoryRouter><ActivityLog /></MemoryRouter>);
    expect(screen.getByText(/Activity Log/)).toBeDefined();
  });

  it('renders search input', async () => {
    const ActivityLog = (await import('./ActivityLog')).default;
    render(<MemoryRouter><ActivityLog /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Search actions/)).toBeDefined();
  });

  it('renders activity entries after load', async () => {
    mockUseApi.mockReturnValue({ data: [mockActivityLog], loading: false, error: null, refetch: vi.fn() });
    const ActivityLog = (await import('./ActivityLog')).default;
    render(<MemoryRouter><ActivityLog /></MemoryRouter>);
    expect(screen.getByText('Admin User')).toBeDefined();
    expect(screen.getByText('VPS Pro')).toBeDefined();
  });

  it('shows empty state', async () => {
    mockUseApi.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    const ActivityLog = (await import('./ActivityLog')).default;
    render(<MemoryRouter><ActivityLog /></MemoryRouter>);
    expect(screen.getByText(/No activity recorded/)).toBeDefined();
  });
});
