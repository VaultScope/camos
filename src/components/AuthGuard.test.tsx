import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import * as auth from '../lib/auth';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the auth module
vi.mock('../lib/auth', () => ({
  isAuthenticated: vi.fn(),
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login when not authenticated', () => {
    vi.mocked(auth.isAuthenticated).mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route
            path="/protected"
            element={
              <AuthGuard>
                <div data-testid="protected-content">Protected Content</div>
              </AuthGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    vi.mocked(auth.isAuthenticated).mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route
            path="/protected"
            element={
              <AuthGuard>
                <div data-testid="protected-content">Protected Content</div>
              </AuthGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });
});
