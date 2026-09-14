import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockConnector } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('Connectors', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/apis']}><Connectors /></MemoryRouter>);
    expect(screen.getByText(/Infrastructure APIs/)).toBeDefined();
  });

  it('renders connectors after load', async () => {
    mockUseApi.mockReturnValue({ data: [mockConnector], loading: false, error: null, refetch: vi.fn() });
    const Connectors = (await import('./Connectors')).default;
    render(<MemoryRouter initialEntries={['/apis']}><Connectors /></MemoryRouter>);
    expect(screen.getAllByText('Hetzner Cloud').length).toBeGreaterThan(0);
  });
});
