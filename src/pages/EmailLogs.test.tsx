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

describe('EmailLogs', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    const EmailLogs = (await import('./EmailLogs')).default;
    render(<MemoryRouter><EmailLogs /></MemoryRouter>);
    expect(screen.getByText(/Email Logs/)).toBeDefined();
  });

  it('renders search input', async () => {
    const EmailLogs = (await import('./EmailLogs')).default;
    render(<MemoryRouter><EmailLogs /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Search email logs/)).toBeDefined();
  });

  it('renders logs after load', async () => {
    const mockLog = { id: 'log-1', to: 'user@example.com', subject: 'Invoice Sent', mailbox: 'noreply@vaultscope.de', status: 'Delivered', time: '2026-01-01' };
    mockUseApi.mockReturnValue({ data: [mockLog], loading: false, error: null, refetch: vi.fn() });
    const EmailLogs = (await import('./EmailLogs')).default;
    render(<MemoryRouter><EmailLogs /></MemoryRouter>);
    expect(screen.getByText('user@example.com')).toBeDefined();
  });
});
