import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/auth', () => ({
  handleCallback: vi.fn().mockImplementation(() => new Promise(() => {})),
}));

describe('AuthCallback', () => {
  it('renders authenticating state with code', async () => {
    const AuthCallback = (await import('./AuthCallback')).default;
    render(
      <MemoryRouter initialEntries={['/callback?code=abc&state=xyz']}>
        <AuthCallback />
      </MemoryRouter>
    );
    expect(screen.getByText(/Authenticating/)).toBeDefined();
  });

  it('shows error without code', async () => {
    const AuthCallback = (await import('./AuthCallback')).default;
    render(
      <MemoryRouter initialEntries={['/callback']}>
        <AuthCallback />
      </MemoryRouter>
    );
    expect(screen.getByText(/Missing authorization code/)).toBeDefined();
  });

  it('shows error page with back link', async () => {
    const AuthCallback = (await import('./AuthCallback')).default;
    render(
      <MemoryRouter initialEntries={['/callback']}>
        <AuthCallback />
      </MemoryRouter>
    );
    expect(screen.getByText(/Back to login/)).toBeDefined();
  });
});
