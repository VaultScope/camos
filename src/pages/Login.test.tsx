import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  loginWithCredentials: vi.fn(),
}));

import { isAuthenticated, loginWithCredentials } from '../lib/auth';
const mockIsAuth = vi.mocked(isAuthenticated);
const mockLogin = vi.mocked(loginWithCredentials);

describe('Login', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockIsAuth.mockReturnValue(false);
    mockLogin.mockReset();
  });

  it('renders login page', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText('Admin Login')).toBeDefined();
    expect(screen.getByPlaceholderText('Email address')).toBeDefined();
    expect(screen.getByPlaceholderText('Password')).toBeDefined();
  });

  it('renders login button', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeDefined();
  });

  it('calls loginWithCredentials when form submitted', async () => {
    mockLogin.mockResolvedValue({} as any);
    render(<MemoryRouter><Login /></MemoryRouter>);
    
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('redirects to / if already authenticated', () => {
    mockIsAuth.mockReturnValue(true);
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('handles MFA challenge and accepts shared 6-digit TOTP or recovery code', async () => {
    const mfaErr: any = new Error('MFA_REQUIRED');
    mfaErr.mfaRequired = true;
    mockLogin.mockRejectedValueOnce(mfaErr).mockResolvedValueOnce({} as any);

    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'shared@vaultscope.de' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Two-Factor Verification')).toBeDefined();
    });

    fireEvent.change(screen.getByPlaceholderText('123456'), { target: { value: 'A1B2-C3D4-E5F6-1234-5678' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify & Continue/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenLastCalledWith('shared@vaultscope.de', 'password123', 'A1B2-C3D4-E5F6-1234-5678');
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });
});
