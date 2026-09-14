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

describe('Settings', () => {
  it('renders page title', async () => {
    const Settings = (await import('./Settings')).default;
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(screen.getByText(/Global Settings/)).toBeDefined();
  });

  it('renders loading state', async () => {
    const Settings = (await import('./Settings')).default;
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(screen.getByText(/Loading settings/)).toBeDefined();
  });
});
