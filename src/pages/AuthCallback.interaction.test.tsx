import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../lib/auth', () => ({
  handleCallback: vi.fn(),
}));

import { handleCallback } from '../lib/auth';
const mockHandleCallback = vi.mocked(handleCallback);

describe('AuthCallback interaction tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error when code is missing from URL', async () => {
    const AuthCallback = (await import('./AuthCallback')).default;
    render(
      <MemoryRouter initialEntries={['/callback']}>
        <AuthCallback />
      </MemoryRouter>
    );
    expect(screen.getByText('Missing authorization code')).toBeDefined();
    expect(screen.getByText('Authentication Failed')).toBeDefined();
  });

  it('shows authenticating state while callback processes', async () => {
    mockHandleCallback.mockReturnValue(new Promise(() => {}));
    const AuthCallback = (await import('./AuthCallback')).default;
    render(
      <MemoryRouter initialEntries={['/callback?code=abc&state=xyz']}>
        <AuthCallback />
      </MemoryRouter>
    );
    expect(screen.getByText(/Authenticating/)).toBeDefined();
  });

  it('calls handleCallback with code and state params', async () => {
    mockHandleCallback.mockReturnValue(new Promise(() => {}));
    const AuthCallback = (await import('./AuthCallback')).default;
    render(
      <MemoryRouter initialEntries={['/callback?code=mycode&state=mystate']}>
        <AuthCallback />
      </MemoryRouter>
    );
    expect(mockHandleCallback).toHaveBeenCalledWith('mycode', 'mystate');
  });

  it('navigates to / on successful callback', async () => {
    mockHandleCallback.mockResolvedValue({
      sub: 's1', email: 'a@vs.de', role: 'admin', audience: 'admin' as const, exp: 9999999999, iat: 1,
    });
    const AuthCallback = (await import('./AuthCallback')).default;
    render(
      <MemoryRouter initialEntries={['/callback?code=ok&state=ok']}>
        <AuthCallback />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('shows error message on callback failure', async () => {
    mockHandleCallback.mockRejectedValue(new Error('Invalid state parameter'));
    const AuthCallback = (await import('./AuthCallback')).default;
    render(
      <MemoryRouter initialEntries={['/callback?code=bad&state=bad']}>
        <AuthCallback />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Invalid state parameter')).toBeDefined();
    });
  });

  it('shows back to login link on error', async () => {
    mockHandleCallback.mockRejectedValue(new Error('Auth failed'));
    const AuthCallback = (await import('./AuthCallback')).default;
    render(
      <MemoryRouter initialEntries={['/callback?code=x&state=y']}>
        <AuthCallback />
      </MemoryRouter>
    );
    await waitFor(() => {
      const link = screen.getByText('Back to login');
      expect(link).toBeDefined();
      expect(link.getAttribute('href')).toBe('/login');
    });
  });
});
