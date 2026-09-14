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

describe('ServiceForms', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    const ServiceForms = (await import('./ServiceForms')).default;
    render(<MemoryRouter><ServiceForms /></MemoryRouter>);
    expect(screen.getByText(/Service Forms & Variables/)).toBeDefined();
  });

  it('renders search input', async () => {
    const ServiceForms = (await import('./ServiceForms')).default;
    render(<MemoryRouter><ServiceForms /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Search forms/)).toBeDefined();
  });

  it('renders create form button', async () => {
    const ServiceForms = (await import('./ServiceForms')).default;
    render(<MemoryRouter><ServiceForms /></MemoryRouter>);
    expect(screen.getByText(/Create Form/)).toBeDefined();
  });

  it('renders forms after load', async () => {
    const mockForm = { id: 'f-1', name: 'VPS Options', description: 'Config for VPS', fields: [{ id: 'fl-1', label: 'OS', variable: 'os', type: 'select', required: true, options: 'Ubuntu, Debian' }] };
    mockUseApi.mockReturnValue({ data: [mockForm], loading: false, error: null, refetch: vi.fn() });
    const ServiceForms = (await import('./ServiceForms')).default;
    render(<MemoryRouter><ServiceForms /></MemoryRouter>);
    expect(screen.getByText('VPS Options')).toBeDefined();
  });
});
