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

describe('Launchpad', () => {
  beforeEach(() => {
    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/internal-tools') return { data: [], loading: false, error: null, refetch: vi.fn() };
      if (url === '/admin/staff/roles') return { data: [{ id: 'r1', name: 'admin', permissions: ['*'], mapped_group: 'admins' }], loading: false, error: null, refetch: vi.fn() };
      return { data: null, loading: false, error: null, refetch: vi.fn() };
    });
  });

  it('renders page title', async () => {
    const Launchpad = (await import('./Launchpad')).default;
    render(<MemoryRouter><Launchpad /></MemoryRouter>);
    expect(screen.getByText(/Internal Tools & Telemetry/)).toBeDefined();
  });

  it('shows no permission message when no tools', async () => {
    const Launchpad = (await import('./Launchpad')).default;
    render(<MemoryRouter><Launchpad /></MemoryRouter>);
    expect(screen.getByText(/do not have permission/)).toBeDefined();
  });

  it('filters out unsafe javascript: tool URLs and renders https tools with noopener noreferrer', async () => {
    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/internal-tools') {
        return {
          data: [
            { id: 't-bad', name: 'Evil Link', url: 'javascript:alert(1)', required_permission: 'admin.super', created_at: '2026-01-01' },
            { id: 't-good', name: 'Grafana', url: 'https://grafana.vaultscope.de', required_permission: 'admin.super', created_at: '2026-01-01' },
          ],
          loading: false,
          error: null,
          refetch: vi.fn(),
        };
      }
      if (url === '/admin/staff/roles') {
        return { data: [{ id: 'r1', name: 'admin', permissions: ['*'], mapped_group: 'admins' }], loading: false, error: null, refetch: vi.fn() };
      }
      return { data: null, loading: false, error: null, refetch: vi.fn() };
    });

    const Launchpad = (await import('./Launchpad')).default;
    render(<MemoryRouter><Launchpad /></MemoryRouter>);

    expect(screen.queryByText('Evil Link')).toBeNull();
    const grafanaLink = screen.getByRole('link', { name: /Grafana/i });
    expect(grafanaLink.getAttribute('href')).toBe('https://grafana.vaultscope.de');
    expect(grafanaLink.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
