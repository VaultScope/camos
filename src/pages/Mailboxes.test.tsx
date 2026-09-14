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

describe('Mailboxes', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    mockUseApi.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    const Mailboxes = (await import('./Mailboxes')).default;
    render(<MemoryRouter><Mailboxes /></MemoryRouter>);
    expect(screen.getByText(/Mailboxes/)).toBeDefined();
  });

  it('renders add mailbox button', async () => {
    mockUseApi.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    const Mailboxes = (await import('./Mailboxes')).default;
    render(<MemoryRouter><Mailboxes /></MemoryRouter>);
    expect(screen.getByText(/Add Mailbox/)).toBeDefined();
  });

  it('shows empty state', async () => {
    mockUseApi.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    const Mailboxes = (await import('./Mailboxes')).default;
    render(<MemoryRouter><Mailboxes /></MemoryRouter>);
    expect(screen.getByText(/No mailboxes configured/)).toBeDefined();
  });

  it('renders mailboxes after load', async () => {
    const mockMailbox = { id: 'mb-1', name: 'Support', host: 'smtp.example.com', port: 587, user_name: 'support@vs.de', password: '', email: 'support@vs.de', is_default: true };
    mockUseApi.mockReturnValue({ data: [mockMailbox], loading: false, error: null, refetch: vi.fn() });
    const Mailboxes = (await import('./Mailboxes')).default;
    render(<MemoryRouter><Mailboxes /></MemoryRouter>);
    expect(screen.getByText('Support')).toBeDefined();
    expect(screen.getByText('Default')).toBeDefined();
  });
});
