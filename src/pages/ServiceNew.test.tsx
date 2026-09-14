import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn().mockImplementation(() => new Promise(() => {})),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

describe('ServiceNew', () => {
  it('renders loading state', async () => {
    const ServiceNew = (await import('./ServiceNew')).default;
    render(<MemoryRouter><ServiceNew /></MemoryRouter>);
    expect(screen.getByText(/Loading/)).toBeDefined();
  });

  it('renders page title', async () => {
    const ServiceNew = (await import('./ServiceNew')).default;
    render(<MemoryRouter><ServiceNew /></MemoryRouter>);
    expect(screen.getByText(/New Service/)).toBeDefined();
  });
});
