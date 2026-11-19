import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/api', () => ({
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

describe('InternalTools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('rejects non-http(s) URLs when creating an internal tool', async () => {
    mockUseApi.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    const InternalTools = (await import('./InternalTools')).default;
    const { container } = render(<MemoryRouter><InternalTools /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: /Add Tool/i }));
    const inputs = container.querySelectorAll('form input');
    fireEvent.change(inputs[0], { target: { value: 'Malicious Tool' } });
    fireEvent.change(inputs[1], { target: { value: 'javascript:alert(1)' } });
    fireEvent.change(container.querySelector('form select')!, { target: { value: 'admin.super' } });

    fireEvent.submit(container.querySelector('form')!);
    expect(mockApi.post).not.toHaveBeenCalled();
  });
});
