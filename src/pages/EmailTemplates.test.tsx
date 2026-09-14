import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));
vi.mock('../components/WysiwygEditor', () => ({
  WysiwygEditor: () => null,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('EmailTemplates', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    const EmailTemplates = (await import('./EmailTemplates')).default;
    render(<MemoryRouter><EmailTemplates /></MemoryRouter>);
    expect(screen.getByText(/Email Templates/)).toBeDefined();
  });

  it('shows empty state when no templates', async () => {
    mockUseApi.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
    const EmailTemplates = (await import('./EmailTemplates')).default;
    render(<MemoryRouter><EmailTemplates /></MemoryRouter>);
    expect(screen.getByText(/No email templates configured/)).toBeDefined();
  });

  it('renders templates after load', async () => {
    const mockTemplate = {
      id: 'et-1', name: 'Welcome Email', subject: 'Welcome to VaultScope',
      body: '<p>Hello</p>', category: 'account', enabled: true,
      variables: [], mailbox_id: null, updated_at: '2026-01-01T00:00:00Z',
    };
    mockUseApi.mockImplementation((url: string) => {
      if (url === '/admin/email-templates') return { data: [mockTemplate], loading: false, error: null, refetch: vi.fn() };
      return { data: null, loading: false, error: null, refetch: vi.fn() };
    });
    const EmailTemplates = (await import('./EmailTemplates')).default;
    render(<MemoryRouter><EmailTemplates /></MemoryRouter>);
    expect(screen.getByText('Welcome Email')).toBeDefined();
  });
});
