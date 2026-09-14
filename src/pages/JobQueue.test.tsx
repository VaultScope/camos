import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockJob } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('JobQueue', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    const JobQueue = (await import('./JobQueue')).default;
    render(<MemoryRouter><JobQueue /></MemoryRouter>);
    expect(screen.getByText(/Provisioning & Automation Queue/)).toBeDefined();
  });

  it('renders search input', async () => {
    const JobQueue = (await import('./JobQueue')).default;
    render(<MemoryRouter><JobQueue /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Search by Job ID/)).toBeDefined();
  });

  it('renders jobs after load', async () => {
    mockUseApi.mockReturnValue({ data: [mockJob], loading: false, error: null, refetch: vi.fn() });
    const JobQueue = (await import('./JobQueue')).default;
    render(<MemoryRouter><JobQueue /></MemoryRouter>);
    expect(screen.getByText('provision')).toBeDefined();
  });

  it('shows empty state', async () => {
    mockUseApi.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    const JobQueue = (await import('./JobQueue')).default;
    render(<MemoryRouter><JobQueue /></MemoryRouter>);
    expect(screen.getByText(/No jobs match/)).toBeDefined();
  });
});
