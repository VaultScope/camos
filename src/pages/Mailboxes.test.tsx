import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('Mailboxes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
    mockApi.put.mockResolvedValue({ ok: true });
    mockApi.post.mockResolvedValue({ ok: true });
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

  it('keeps password blank when editing an existing mailbox and omits password from PUT when left empty', async () => {
    const mockMailbox = {
      id: 'mb-1',
      name: 'Support',
      host: 'smtp.example.com',
      port: 587,
      user_name: 'support@vs.de',
      password: 'leaked-legacy-password',
      is_default: true,
      created_at: '2026-01-01T00:00:00Z',
    };
    mockUseApi.mockReturnValue({ data: [mockMailbox], loading: false, error: null, refetch: vi.fn() });
    const Mailboxes = (await import('./Mailboxes')).default;
    render(<MemoryRouter><Mailboxes /></MemoryRouter>);

    fireEvent.click(screen.getByTitle('Edit'));
    const pwInput = screen.getByPlaceholderText('Leave blank to keep existing password') as HTMLInputElement;
    expect(pwInput.value).toBe('');

    fireEvent.click(screen.getByRole('button', { name: /Save Mailbox/i }));
    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledTimes(1);
    });
    const sentPayload = mockApi.put.mock.calls[0][1] as Record<string, unknown>;
    expect('password' in sentPayload).toBe(false);
  });
});
