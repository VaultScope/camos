import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../lib/auth', () => ({
  isAuthenticated: vi.fn(() => false),
  redirectToLogin: vi.fn(),
}));

import { isAuthenticated, redirectToLogin } from '../lib/auth';
const mockIsAuth = vi.mocked(isAuthenticated);
const mockRedirect = vi.mocked(redirectToLogin);

describe('Login', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockIsAuth.mockReturnValue(false);
    mockRedirect.mockReset();
  });

  it('renders login page', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText(/Restricted Access/)).toBeDefined();
  });

  it('renders login button', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText('Login with Authentik (Staff)')).toBeDefined();
  });

  it('calls redirectToLogin when button clicked', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.click(screen.getByText('Login with Authentik (Staff)'));
    expect(mockRedirect).toHaveBeenCalled();
  });

  it('redirects to / if already authenticated', () => {
    mockIsAuth.mockReturnValue(true);
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('renders auth domain footer', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText('auth.vaultscope.de')).toBeDefined();
  });
});
