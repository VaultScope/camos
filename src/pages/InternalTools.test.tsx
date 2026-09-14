import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('InternalTools', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    const InternalTools = (await import('./InternalTools')).default;
    render(<MemoryRouter><InternalTools /></MemoryRouter>);
    expect(screen.getAllByText(/Internal Tools/).length).toBeGreaterThan(0);
  });

  it('renders add tool button', async () => {
    const InternalTools = (await import('./InternalTools')).default;
    render(<MemoryRouter><InternalTools /></MemoryRouter>);
    expect(screen.getByText(/Add Tool/)).toBeDefined();
  });

  it('shows empty state', async () => {
    mockUseApi.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    const InternalTools = (await import('./InternalTools')).default;
    render(<MemoryRouter><InternalTools /></MemoryRouter>);
    expect(screen.getByText(/No internal tools configured/)).toBeDefined();
  });
});
